/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/resources", "vs/base/common/map"], function (require, exports, event_1, lifecycle_1, files_1, resources_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileUserDataProvider = void 0;
    class FileUserDataProvider extends lifecycle_1.Disposable {
        constructor(fileSystemScheme, fileSystemProvider, userDataScheme, logService) {
            super();
            this.fileSystemScheme = fileSystemScheme;
            this.fileSystemProvider = fileSystemProvider;
            this.userDataScheme = userDataScheme;
            this.logService = logService;
            this.onDidChangeCapabilities = this.fileSystemProvider.onDidChangeCapabilities;
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this.watchResources = map_1.TernarySearchTree.forUris(uri => this.extUri.ignorePathCasing(uri));
            this.extUri = !!(this.capabilities & 1024 /* PathCaseSensitive */) ? resources_1.extUri : resources_1.extUriIgnorePathCase;
            // update extUri as capabilites might change.
            this._register(this.onDidChangeCapabilities(() => this.extUri = !!(this.capabilities & 1024 /* PathCaseSensitive */) ? resources_1.extUri : resources_1.extUriIgnorePathCase));
            this._register(this.fileSystemProvider.onDidChangeFile(e => this.handleFileChanges(e)));
        }
        get capabilities() { return this.fileSystemProvider.capabilities; }
        watch(resource, opts) {
            this.watchResources.set(resource, resource);
            const disposable = this.fileSystemProvider.watch(this.toFileSystemResource(resource), opts);
            return (0, lifecycle_1.toDisposable)(() => {
                this.watchResources.delete(resource);
                disposable.dispose();
            });
        }
        stat(resource) {
            return this.fileSystemProvider.stat(this.toFileSystemResource(resource));
        }
        mkdir(resource) {
            return this.fileSystemProvider.mkdir(this.toFileSystemResource(resource));
        }
        rename(from, to, opts) {
            return this.fileSystemProvider.rename(this.toFileSystemResource(from), this.toFileSystemResource(to), opts);
        }
        readFile(resource) {
            if ((0, files_1.hasReadWriteCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.readFile(this.toFileSystemResource(resource));
            }
            throw new Error('not supported');
        }
        readFileStream(resource, opts, token) {
            if ((0, files_1.hasFileReadStreamCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.readFileStream(this.toFileSystemResource(resource), opts, token);
            }
            throw new Error('not supported');
        }
        readdir(resource) {
            return this.fileSystemProvider.readdir(this.toFileSystemResource(resource));
        }
        writeFile(resource, content, opts) {
            if ((0, files_1.hasReadWriteCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.writeFile(this.toFileSystemResource(resource), content, opts);
            }
            throw new Error('not supported');
        }
        open(resource, opts) {
            if ((0, files_1.hasOpenReadWriteCloseCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.open(this.toFileSystemResource(resource), opts);
            }
            throw new Error('not supported');
        }
        close(fd) {
            if ((0, files_1.hasOpenReadWriteCloseCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.close(fd);
            }
            throw new Error('not supported');
        }
        read(fd, pos, data, offset, length) {
            if ((0, files_1.hasOpenReadWriteCloseCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.read(fd, pos, data, offset, length);
            }
            throw new Error('not supported');
        }
        write(fd, pos, data, offset, length) {
            if ((0, files_1.hasOpenReadWriteCloseCapability)(this.fileSystemProvider)) {
                return this.fileSystemProvider.write(fd, pos, data, offset, length);
            }
            throw new Error('not supported');
        }
        delete(resource, opts) {
            return this.fileSystemProvider.delete(this.toFileSystemResource(resource), opts);
        }
        handleFileChanges(changes) {
            const userDataChanges = [];
            for (const change of changes) {
                const userDataResource = this.toUserDataResource(change.resource);
                if (this.watchResources.findSubstr(userDataResource)) {
                    userDataChanges.push({
                        resource: userDataResource,
                        type: change.type
                    });
                }
            }
            if (userDataChanges.length) {
                this.logService.debug('User data changed');
                this._onDidChangeFile.fire(userDataChanges);
            }
        }
        toFileSystemResource(userDataResource) {
            return userDataResource.with({ scheme: this.fileSystemScheme });
        }
        toUserDataResource(fileSystemResource) {
            return fileSystemResource.with({ scheme: this.userDataScheme });
        }
    }
    exports.FileUserDataProvider = FileUserDataProvider;
});
//# sourceMappingURL=fileUserDataProvider.js.map