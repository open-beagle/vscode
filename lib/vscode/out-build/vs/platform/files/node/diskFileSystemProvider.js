/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "util", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/event", "vs/base/common/platform", "vs/base/node/pfs", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/extpath", "vs/base/common/async", "vs/platform/log/common/log", "vs/nls!vs/platform/files/node/diskFileSystemProvider", "vs/platform/files/node/watcher/watcher", "vs/platform/files/node/watcher/unix/watcherService", "vs/platform/files/node/watcher/win32/watcherService", "vs/platform/files/node/watcher/nsfw/watcherService", "vs/platform/files/node/watcher/nodejs/watcherService", "vs/base/common/stream", "vs/platform/files/common/io", "vs/base/common/arrays", "vs/base/common/buffer"], function (require, exports, fs_1, util_1, lifecycle_1, files_1, event_1, platform_1, pfs_1, path_1, resources_1, extpath_1, async_1, log_1, nls_1, watcher_1, watcherService_1, watcherService_2, watcherService_3, watcherService_4, stream_1, io_1, arrays_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiskFileSystemProvider = void 0;
    class DiskFileSystemProvider extends lifecycle_1.Disposable {
        constructor(logService, options) {
            var _a;
            super();
            this.logService = logService;
            this.options = options;
            this.BUFFER_SIZE = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.bufferSize) || 64 * 1024;
            //#region File Capabilities
            this.onDidChangeCapabilities = event_1.Event.None;
            this.mapHandleToPos = new Map();
            this.writeHandles = new Map();
            this.canFlush = true;
            //#endregion
            //#region File Watching
            this._onDidWatchErrorOccur = this._register(new event_1.Emitter());
            this.onDidErrorOccur = this._onDidWatchErrorOccur.event;
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this.recursiveFoldersToWatch = [];
            this.recursiveWatchRequestDelayer = this._register(new async_1.ThrottledDelayer(0));
        }
        get capabilities() {
            if (!this._capabilities) {
                this._capabilities =
                    2 /* FileReadWrite */ |
                        4 /* FileOpenReadWriteClose */ |
                        16 /* FileReadStream */ |
                        8 /* FileFolderCopy */ |
                        8192 /* FileWriteUnlock */;
                if (platform_1.isLinux) {
                    this._capabilities |= 1024 /* PathCaseSensitive */;
                }
            }
            return this._capabilities;
        }
        //#endregion
        //#region File Metadata Resolving
        async stat(resource) {
            try {
                const { stat, symbolicLink } = await pfs_1.SymlinkSupport.stat(this.toFilePath(resource)); // cannot use fs.stat() here to support links properly
                return {
                    type: this.toType(stat, symbolicLink),
                    ctime: stat.birthtime.getTime(),
                    mtime: stat.mtime.getTime(),
                    size: stat.size
                };
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async readdir(resource) {
            try {
                const children = await (0, pfs_1.readdir)(this.toFilePath(resource), { withFileTypes: true });
                const result = [];
                await Promise.all(children.map(async (child) => {
                    try {
                        let type;
                        if (child.isSymbolicLink()) {
                            type = (await this.stat((0, resources_1.joinPath)(resource, child.name))).type; // always resolve target the link points to if any
                        }
                        else {
                            type = this.toType(child);
                        }
                        result.push([child.name, type]);
                    }
                    catch (error) {
                        this.logService.trace(error); // ignore errors for individual entries that can arise from permission denied
                    }
                }));
                return result;
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        toType(entry, symbolicLink) {
            // Signal file type by checking for file / directory, except:
            // - symbolic links pointing to non-existing files are FileType.Unknown
            // - files that are neither file nor directory are FileType.Unknown
            let type;
            if (symbolicLink === null || symbolicLink === void 0 ? void 0 : symbolicLink.dangling) {
                type = files_1.FileType.Unknown;
            }
            else if (entry.isFile()) {
                type = files_1.FileType.File;
            }
            else if (entry.isDirectory()) {
                type = files_1.FileType.Directory;
            }
            else {
                type = files_1.FileType.Unknown;
            }
            // Always signal symbolic link as file type additionally
            if (symbolicLink) {
                type |= files_1.FileType.SymbolicLink;
            }
            return type;
        }
        //#endregion
        //#region File Reading/Writing
        async readFile(resource) {
            try {
                const filePath = this.toFilePath(resource);
                return await fs_1.promises.readFile(filePath);
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        readFileStream(resource, opts, token) {
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer);
            (0, io_1.readFileIntoStream)(this, resource, stream, data => data.buffer, Object.assign(Object.assign({}, opts), { bufferSize: this.BUFFER_SIZE }), token);
            return stream;
        }
        async writeFile(resource, content, opts) {
            let handle = undefined;
            try {
                const filePath = this.toFilePath(resource);
                // Validate target unless { create: true, overwrite: true }
                if (!opts.create || !opts.overwrite) {
                    const fileExists = await (0, pfs_1.exists)(filePath);
                    if (fileExists) {
                        if (!opts.overwrite) {
                            throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(0, null), files_1.FileSystemProviderErrorCode.FileExists);
                        }
                    }
                    else {
                        if (!opts.create) {
                            throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(1, null), files_1.FileSystemProviderErrorCode.FileNotFound);
                        }
                    }
                }
                // Open
                handle = await this.open(resource, { create: true, unlock: opts.unlock });
                // Write content at once
                await this.write(handle, 0, content, 0, content.byteLength);
            }
            catch (error) {
                throw await this.toFileSystemProviderWriteError(resource, error);
            }
            finally {
                if (typeof handle === 'number') {
                    await this.close(handle);
                }
            }
        }
        async open(resource, opts) {
            try {
                const filePath = this.toFilePath(resource);
                // Determine wether to unlock the file (write only)
                if ((0, files_1.isFileOpenForWriteOptions)(opts) && opts.unlock) {
                    try {
                        const { stat } = await pfs_1.SymlinkSupport.stat(filePath);
                        if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                            await fs_1.promises.chmod(filePath, stat.mode | 0o200);
                        }
                    }
                    catch (error) {
                        this.logService.trace(error); // ignore any errors here and try to just write
                    }
                }
                // Determine file flags for opening (read vs write)
                let flags = undefined;
                if ((0, files_1.isFileOpenForWriteOptions)(opts)) {
                    if (platform_1.isWindows) {
                        try {
                            // On Windows and if the file exists, we use a different strategy of saving the file
                            // by first truncating the file and then writing with r+ flag. This helps to save hidden files on Windows
                            // (see https://github.com/microsoft/vscode/issues/931) and prevent removing alternate data streams
                            // (see https://github.com/microsoft/vscode/issues/6363)
                            await fs_1.promises.truncate(filePath, 0);
                            // After a successful truncate() the flag can be set to 'r+' which will not truncate.
                            flags = 'r+';
                        }
                        catch (error) {
                            if (error.code !== 'ENOENT') {
                                this.logService.trace(error);
                            }
                        }
                    }
                    // we take opts.create as a hint that the file is opened for writing
                    // as such we use 'w' to truncate an existing or create the
                    // file otherwise. we do not allow reading.
                    if (!flags) {
                        flags = 'w';
                    }
                }
                else {
                    // otherwise we assume the file is opened for reading
                    // as such we use 'r' to neither truncate, nor create
                    // the file.
                    flags = 'r';
                }
                const handle = await (0, util_1.promisify)(fs_1.open)(filePath, flags);
                // remember this handle to track file position of the handle
                // we init the position to 0 since the file descriptor was
                // just created and the position was not moved so far (see
                // also http://man7.org/linux/man-pages/man2/open.2.html -
                // "The file offset is set to the beginning of the file.")
                this.mapHandleToPos.set(handle, 0);
                // remember that this handle was used for writing
                if ((0, files_1.isFileOpenForWriteOptions)(opts)) {
                    this.writeHandles.set(handle, resource);
                }
                return handle;
            }
            catch (error) {
                if ((0, files_1.isFileOpenForWriteOptions)(opts)) {
                    throw await this.toFileSystemProviderWriteError(resource, error);
                }
                else {
                    throw this.toFileSystemProviderError(error);
                }
            }
        }
        async close(fd) {
            try {
                // remove this handle from map of positions
                this.mapHandleToPos.delete(fd);
                // if a handle is closed that was used for writing, ensure
                // to flush the contents to disk if possible.
                if (this.writeHandles.delete(fd) && this.canFlush) {
                    try {
                        await (0, util_1.promisify)(fs_1.fdatasync)(fd);
                    }
                    catch (error) {
                        // In some exotic setups it is well possible that node fails to sync
                        // In that case we disable flushing and log the error to our logger
                        this.canFlush = false;
                        this.logService.error(error);
                    }
                }
                return await (0, util_1.promisify)(fs_1.close)(fd);
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async read(fd, pos, data, offset, length) {
            const normalizedPos = this.normalizePos(fd, pos);
            let bytesRead = null;
            try {
                const result = await (0, util_1.promisify)(fs_1.read)(fd, data, offset, length, normalizedPos);
                if (typeof result === 'number') {
                    bytesRead = result; // node.d.ts fail
                }
                else {
                    bytesRead = result.bytesRead;
                }
                return bytesRead;
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
            finally {
                this.updatePos(fd, normalizedPos, bytesRead);
            }
        }
        normalizePos(fd, pos) {
            // when calling fs.read/write we try to avoid passing in the "pos" argument and
            // rather prefer to pass in "null" because this avoids an extra seek(pos)
            // call that in some cases can even fail (e.g. when opening a file over FTP -
            // see https://github.com/microsoft/vscode/issues/73884).
            //
            // as such, we compare the passed in position argument with our last known
            // position for the file descriptor and use "null" if they match.
            if (pos === this.mapHandleToPos.get(fd)) {
                return null;
            }
            return pos;
        }
        updatePos(fd, pos, bytesLength) {
            const lastKnownPos = this.mapHandleToPos.get(fd);
            if (typeof lastKnownPos === 'number') {
                // pos !== null signals that previously a position was used that is
                // not null. node.js documentation explains, that in this case
                // the internal file pointer is not moving and as such we do not move
                // our position pointer.
                //
                // Docs: "If position is null, data will be read from the current file position,
                // and the file position will be updated. If position is an integer, the file position
                // will remain unchanged."
                if (typeof pos === 'number') {
                    // do not modify the position
                }
                // bytesLength = number is a signal that the read/write operation was
                // successful and as such we need to advance the position in the Map
                //
                // Docs (http://man7.org/linux/man-pages/man2/read.2.html):
                // "On files that support seeking, the read operation commences at the
                // file offset, and the file offset is incremented by the number of
                // bytes read."
                //
                // Docs (http://man7.org/linux/man-pages/man2/write.2.html):
                // "For a seekable file (i.e., one to which lseek(2) may be applied, for
                // example, a regular file) writing takes place at the file offset, and
                // the file offset is incremented by the number of bytes actually
                // written."
                else if (typeof bytesLength === 'number') {
                    this.mapHandleToPos.set(fd, lastKnownPos + bytesLength);
                }
                // bytesLength = null signals an error in the read/write operation
                // and as such we drop the handle from the Map because the position
                // is unspecificed at this point.
                else {
                    this.mapHandleToPos.delete(fd);
                }
            }
        }
        async write(fd, pos, data, offset, length) {
            // we know at this point that the file to write to is truncated and thus empty
            // if the write now fails, the file remains empty. as such we really try hard
            // to ensure the write succeeds by retrying up to three times.
            return (0, async_1.retry)(() => this.doWrite(fd, pos, data, offset, length), 100 /* ms delay */, 3 /* retries */);
        }
        async doWrite(fd, pos, data, offset, length) {
            const normalizedPos = this.normalizePos(fd, pos);
            let bytesWritten = null;
            try {
                const result = await (0, util_1.promisify)(fs_1.write)(fd, data, offset, length, normalizedPos);
                if (typeof result === 'number') {
                    bytesWritten = result; // node.d.ts fail
                }
                else {
                    bytesWritten = result.bytesWritten;
                }
                return bytesWritten;
            }
            catch (error) {
                throw await this.toFileSystemProviderWriteError(this.writeHandles.get(fd), error);
            }
            finally {
                this.updatePos(fd, normalizedPos, bytesWritten);
            }
        }
        //#endregion
        //#region Move/Copy/Delete/Create Folder
        async mkdir(resource) {
            try {
                await fs_1.promises.mkdir(this.toFilePath(resource));
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async delete(resource, opts) {
            try {
                const filePath = this.toFilePath(resource);
                await this.doDelete(filePath, opts);
            }
            catch (error) {
                throw this.toFileSystemProviderError(error);
            }
        }
        async doDelete(filePath, opts) {
            if (opts.recursive) {
                await (0, pfs_1.rimraf)(filePath, pfs_1.RimRafMode.MOVE);
            }
            else {
                await fs_1.promises.unlink(filePath);
            }
        }
        async rename(from, to, opts) {
            const fromFilePath = this.toFilePath(from);
            const toFilePath = this.toFilePath(to);
            if (fromFilePath === toFilePath) {
                return; // simulate node.js behaviour here and do a no-op if paths match
            }
            try {
                // Ensure target does not exist
                await this.validateTargetDeleted(from, to, 'move', opts.overwrite);
                // Move
                await (0, pfs_1.move)(fromFilePath, toFilePath);
            }
            catch (error) {
                // rewrite some typical errors that can happen especially around symlinks
                // to something the user can better understand
                if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                    error = new Error((0, nls_1.localize)(2, null, (0, path_1.basename)(fromFilePath), (0, path_1.basename)((0, path_1.dirname)(toFilePath)), error.toString()));
                }
                throw this.toFileSystemProviderError(error);
            }
        }
        async copy(from, to, opts) {
            const fromFilePath = this.toFilePath(from);
            const toFilePath = this.toFilePath(to);
            if (fromFilePath === toFilePath) {
                return; // simulate node.js behaviour here and do a no-op if paths match
            }
            try {
                // Ensure target does not exist
                await this.validateTargetDeleted(from, to, 'copy', opts.overwrite);
                // Copy
                await (0, pfs_1.copy)(fromFilePath, toFilePath, { preserveSymlinks: true });
            }
            catch (error) {
                // rewrite some typical errors that can happen especially around symlinks
                // to something the user can better understand
                if (error.code === 'EINVAL' || error.code === 'EBUSY' || error.code === 'ENAMETOOLONG') {
                    error = new Error((0, nls_1.localize)(3, null, (0, path_1.basename)(fromFilePath), (0, path_1.basename)((0, path_1.dirname)(toFilePath)), error.toString()));
                }
                throw this.toFileSystemProviderError(error);
            }
        }
        async validateTargetDeleted(from, to, mode, overwrite) {
            const fromFilePath = this.toFilePath(from);
            const toFilePath = this.toFilePath(to);
            let isSameResourceWithDifferentPathCase = false;
            const isPathCaseSensitive = !!(this.capabilities & 1024 /* PathCaseSensitive */);
            if (!isPathCaseSensitive) {
                isSameResourceWithDifferentPathCase = (0, extpath_1.isEqual)(fromFilePath, toFilePath, true /* ignore case */);
            }
            if (isSameResourceWithDifferentPathCase && mode === 'copy') {
                throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(4, null), files_1.FileSystemProviderErrorCode.FileExists);
            }
            // handle existing target (unless this is a case change)
            if (!isSameResourceWithDifferentPathCase && await (0, pfs_1.exists)(toFilePath)) {
                if (!overwrite) {
                    throw (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(5, null), files_1.FileSystemProviderErrorCode.FileExists);
                }
                // Delete target
                await this.delete(to, { recursive: true, useTrash: false });
            }
        }
        watch(resource, opts) {
            if (opts.recursive) {
                return this.watchRecursive(resource, opts.excludes);
            }
            return this.watchNonRecursive(resource); // TODO@bpasero ideally the same watcher can be used in both cases
        }
        watchRecursive(resource, excludes) {
            // Add to list of folders to watch recursively
            const folderToWatch = { path: this.toFilePath(resource), excludes };
            const remove = (0, arrays_1.insert)(this.recursiveFoldersToWatch, folderToWatch);
            // Trigger update
            this.refreshRecursiveWatchers();
            return (0, lifecycle_1.toDisposable)(() => {
                // Remove from list of folders to watch recursively
                remove();
                // Trigger update
                this.refreshRecursiveWatchers();
            });
        }
        refreshRecursiveWatchers() {
            // Buffer requests for recursive watching to decide on right watcher
            // that supports potentially watching more than one folder at once
            this.recursiveWatchRequestDelayer.trigger(async () => {
                this.doRefreshRecursiveWatchers();
            });
        }
        doRefreshRecursiveWatchers() {
            var _a, _b, _c;
            // Reuse existing
            if (this.recursiveWatcher instanceof watcherService_3.FileWatcher) {
                this.recursiveWatcher.setFolders(this.recursiveFoldersToWatch);
            }
            // Create new
            else {
                // Dispose old
                (0, lifecycle_1.dispose)(this.recursiveWatcher);
                this.recursiveWatcher = undefined;
                // Create new if we actually have folders to watch
                if (this.recursiveFoldersToWatch.length > 0) {
                    let watcherImpl;
                    let watcherOptions = undefined;
                    // requires a polling watcher
                    if ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.watcher) === null || _b === void 0 ? void 0 : _b.usePolling) {
                        watcherImpl = watcherService_1.FileWatcher;
                        watcherOptions = (_c = this.options) === null || _c === void 0 ? void 0 : _c.watcher;
                    }
                    // Single Folder Watcher
                    else {
                        if (this.recursiveFoldersToWatch.length === 1) {
                            if (platform_1.isWindows) {
                                watcherImpl = watcherService_2.FileWatcher;
                            }
                            else {
                                watcherImpl = watcherService_1.FileWatcher;
                            }
                        }
                        // Multi Folder Watcher
                        else {
                            watcherImpl = watcherService_3.FileWatcher;
                        }
                    }
                    // Create and start watching
                    this.recursiveWatcher = new watcherImpl(this.recursiveFoldersToWatch, event => this._onDidChangeFile.fire((0, watcher_1.toFileChanges)(event)), msg => {
                        if (msg.type === 'error') {
                            this._onDidWatchErrorOccur.fire(msg.message);
                        }
                        this.logService[msg.type](msg.message);
                    }, this.logService.getLevel() === log_1.LogLevel.Trace, watcherOptions);
                    if (!this.recursiveWatcherLogLevelListener) {
                        this.recursiveWatcherLogLevelListener = this.logService.onDidChangeLogLevel(() => {
                            if (this.recursiveWatcher) {
                                this.recursiveWatcher.setVerboseLogging(this.logService.getLevel() === log_1.LogLevel.Trace);
                            }
                        });
                    }
                }
            }
        }
        watchNonRecursive(resource) {
            const watcherService = new watcherService_4.FileWatcher(this.toFilePath(resource), changes => this._onDidChangeFile.fire((0, watcher_1.toFileChanges)(changes)), msg => {
                if (msg.type === 'error') {
                    this._onDidWatchErrorOccur.fire(msg.message);
                }
                this.logService[msg.type](msg.message);
            }, this.logService.getLevel() === log_1.LogLevel.Trace);
            const logLevelListener = this.logService.onDidChangeLogLevel(() => {
                watcherService.setVerboseLogging(this.logService.getLevel() === log_1.LogLevel.Trace);
            });
            return (0, lifecycle_1.combinedDisposable)(watcherService, logLevelListener);
        }
        //#endregion
        //#region Helpers
        toFilePath(resource) {
            return (0, path_1.normalize)(resource.fsPath);
        }
        toFileSystemProviderError(error) {
            if (error instanceof files_1.FileSystemProviderError) {
                return error; // avoid double conversion
            }
            let code;
            switch (error.code) {
                case 'ENOENT':
                    code = files_1.FileSystemProviderErrorCode.FileNotFound;
                    break;
                case 'EISDIR':
                    code = files_1.FileSystemProviderErrorCode.FileIsADirectory;
                    break;
                case 'ENOTDIR':
                    code = files_1.FileSystemProviderErrorCode.FileNotADirectory;
                    break;
                case 'EEXIST':
                    code = files_1.FileSystemProviderErrorCode.FileExists;
                    break;
                case 'EPERM':
                case 'EACCES':
                    code = files_1.FileSystemProviderErrorCode.NoPermissions;
                    break;
                default:
                    code = files_1.FileSystemProviderErrorCode.Unknown;
            }
            return (0, files_1.createFileSystemProviderError)(error, code);
        }
        async toFileSystemProviderWriteError(resource, error) {
            let fileSystemProviderWriteError = this.toFileSystemProviderError(error);
            // If the write error signals permission issues, we try
            // to read the file's mode to see if the file is write
            // locked.
            if (resource && fileSystemProviderWriteError.code === files_1.FileSystemProviderErrorCode.NoPermissions) {
                try {
                    const { stat } = await pfs_1.SymlinkSupport.stat(this.toFilePath(resource));
                    if (!(stat.mode & 0o200 /* File mode indicating writable by owner */)) {
                        fileSystemProviderWriteError = (0, files_1.createFileSystemProviderError)(error, files_1.FileSystemProviderErrorCode.FileWriteLocked);
                    }
                }
                catch (error) {
                    this.logService.trace(error); // ignore - return original error
                }
            }
            return fileSystemProviderWriteError;
        }
        //#endregion
        dispose() {
            super.dispose();
            (0, lifecycle_1.dispose)(this.recursiveWatcher);
            this.recursiveWatcher = undefined;
            (0, lifecycle_1.dispose)(this.recursiveWatcherLogLevelListener);
            this.recursiveWatcherLogLevelListener = undefined;
        }
    }
    exports.DiskFileSystemProvider = DiskFileSystemProvider;
});
//# sourceMappingURL=diskFileSystemProvider.js.map