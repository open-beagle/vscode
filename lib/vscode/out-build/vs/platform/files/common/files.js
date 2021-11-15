/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/files/common/files", "vs/base/common/path", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/map"], function (require, exports, nls_1, path_1, uri_1, instantiation_1, strings_1, types_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPlatformLimits = exports.Arch = exports.ByteSize = exports.FALLBACK_MAX_MEMORY_SIZE_MB = exports.MIN_MAX_MEMORY_SIZE_MB = exports.whenProviderRegistered = exports.etag = exports.ETAG_DISABLED = exports.FileKind = exports.FILES_EXCLUDE_CONFIG = exports.FILES_ASSOCIATIONS_CONFIG = exports.HotExitConfiguration = exports.AutoSaveConfiguration = exports.FileOperationResult = exports.FileOperationError = exports.isParent = exports.FileChangesEvent = exports.FileChangeType = exports.FileOperationEvent = exports.FileOperation = exports.toFileOperationResult = exports.toFileSystemProviderErrorCode = exports.markAsFileSystemProviderError = exports.ensureFileSystemProviderError = exports.createFileSystemProviderError = exports.FileSystemProviderError = exports.FileSystemProviderErrorCode = exports.hasFileReadStreamCapability = exports.hasOpenReadWriteCloseCapability = exports.hasFileFolderCopyCapability = exports.hasReadWriteCapability = exports.FileSystemProviderCapabilities = exports.FileType = exports.isFileOpenForWriteOptions = exports.IFileService = void 0;
    //#region file service & providers
    exports.IFileService = (0, instantiation_1.createDecorator)('fileService');
    function isFileOpenForWriteOptions(options) {
        return options.create === true;
    }
    exports.isFileOpenForWriteOptions = isFileOpenForWriteOptions;
    var FileType;
    (function (FileType) {
        /**
         * File is unknown (neither file, directory nor symbolic link).
         */
        FileType[FileType["Unknown"] = 0] = "Unknown";
        /**
         * File is a normal file.
         */
        FileType[FileType["File"] = 1] = "File";
        /**
         * File is a directory.
         */
        FileType[FileType["Directory"] = 2] = "Directory";
        /**
         * File is a symbolic link.
         *
         * Note: even when the file is a symbolic link, you can test for
         * `FileType.File` and `FileType.Directory` to know the type of
         * the target the link points to.
         */
        FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
    })(FileType = exports.FileType || (exports.FileType = {}));
    var FileSystemProviderCapabilities;
    (function (FileSystemProviderCapabilities) {
        /**
         * Provider supports unbuffered read/write.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadWrite"] = 2] = "FileReadWrite";
        /**
         * Provider supports open/read/write/close low level file operations.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileOpenReadWriteClose"] = 4] = "FileOpenReadWriteClose";
        /**
         * Provider supports stream based reading.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileReadStream"] = 16] = "FileReadStream";
        /**
         * Provider supports copy operation.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileFolderCopy"] = 8] = "FileFolderCopy";
        /**
         * Provider is path case sensitive.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["PathCaseSensitive"] = 1024] = "PathCaseSensitive";
        /**
         * All files of the provider are readonly.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["Readonly"] = 2048] = "Readonly";
        /**
         * Provider supports to delete via trash.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["Trash"] = 4096] = "Trash";
        /**
         * Provider support to unlock files for writing.
         */
        FileSystemProviderCapabilities[FileSystemProviderCapabilities["FileWriteUnlock"] = 8192] = "FileWriteUnlock";
    })(FileSystemProviderCapabilities = exports.FileSystemProviderCapabilities || (exports.FileSystemProviderCapabilities = {}));
    function hasReadWriteCapability(provider) {
        return !!(provider.capabilities & 2 /* FileReadWrite */);
    }
    exports.hasReadWriteCapability = hasReadWriteCapability;
    function hasFileFolderCopyCapability(provider) {
        return !!(provider.capabilities & 8 /* FileFolderCopy */);
    }
    exports.hasFileFolderCopyCapability = hasFileFolderCopyCapability;
    function hasOpenReadWriteCloseCapability(provider) {
        return !!(provider.capabilities & 4 /* FileOpenReadWriteClose */);
    }
    exports.hasOpenReadWriteCloseCapability = hasOpenReadWriteCloseCapability;
    function hasFileReadStreamCapability(provider) {
        return !!(provider.capabilities & 16 /* FileReadStream */);
    }
    exports.hasFileReadStreamCapability = hasFileReadStreamCapability;
    var FileSystemProviderErrorCode;
    (function (FileSystemProviderErrorCode) {
        FileSystemProviderErrorCode["FileExists"] = "EntryExists";
        FileSystemProviderErrorCode["FileNotFound"] = "EntryNotFound";
        FileSystemProviderErrorCode["FileNotADirectory"] = "EntryNotADirectory";
        FileSystemProviderErrorCode["FileIsADirectory"] = "EntryIsADirectory";
        FileSystemProviderErrorCode["FileExceedsMemoryLimit"] = "EntryExceedsMemoryLimit";
        FileSystemProviderErrorCode["FileTooLarge"] = "EntryTooLarge";
        FileSystemProviderErrorCode["FileWriteLocked"] = "EntryWriteLocked";
        FileSystemProviderErrorCode["NoPermissions"] = "NoPermissions";
        FileSystemProviderErrorCode["Unavailable"] = "Unavailable";
        FileSystemProviderErrorCode["Unknown"] = "Unknown";
    })(FileSystemProviderErrorCode = exports.FileSystemProviderErrorCode || (exports.FileSystemProviderErrorCode = {}));
    class FileSystemProviderError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.FileSystemProviderError = FileSystemProviderError;
    function createFileSystemProviderError(error, code) {
        const providerError = new FileSystemProviderError(error.toString(), code);
        markAsFileSystemProviderError(providerError, code);
        return providerError;
    }
    exports.createFileSystemProviderError = createFileSystemProviderError;
    function ensureFileSystemProviderError(error) {
        if (!error) {
            return createFileSystemProviderError((0, nls_1.localize)(0, null), FileSystemProviderErrorCode.Unknown); // https://github.com/microsoft/vscode/issues/72798
        }
        return error;
    }
    exports.ensureFileSystemProviderError = ensureFileSystemProviderError;
    function markAsFileSystemProviderError(error, code) {
        error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
        return error;
    }
    exports.markAsFileSystemProviderError = markAsFileSystemProviderError;
    function toFileSystemProviderErrorCode(error) {
        // Guard against abuse
        if (!error) {
            return FileSystemProviderErrorCode.Unknown;
        }
        // FileSystemProviderError comes with the code
        if (error instanceof FileSystemProviderError) {
            return error.code;
        }
        // Any other error, check for name match by assuming that the error
        // went through the markAsFileSystemProviderError() method
        const match = /^(.+) \(FileSystemError\)$/.exec(error.name);
        if (!match) {
            return FileSystemProviderErrorCode.Unknown;
        }
        switch (match[1]) {
            case FileSystemProviderErrorCode.FileExists: return FileSystemProviderErrorCode.FileExists;
            case FileSystemProviderErrorCode.FileIsADirectory: return FileSystemProviderErrorCode.FileIsADirectory;
            case FileSystemProviderErrorCode.FileNotADirectory: return FileSystemProviderErrorCode.FileNotADirectory;
            case FileSystemProviderErrorCode.FileNotFound: return FileSystemProviderErrorCode.FileNotFound;
            case FileSystemProviderErrorCode.FileExceedsMemoryLimit: return FileSystemProviderErrorCode.FileExceedsMemoryLimit;
            case FileSystemProviderErrorCode.FileTooLarge: return FileSystemProviderErrorCode.FileTooLarge;
            case FileSystemProviderErrorCode.FileWriteLocked: return FileSystemProviderErrorCode.FileWriteLocked;
            case FileSystemProviderErrorCode.NoPermissions: return FileSystemProviderErrorCode.NoPermissions;
            case FileSystemProviderErrorCode.Unavailable: return FileSystemProviderErrorCode.Unavailable;
        }
        return FileSystemProviderErrorCode.Unknown;
    }
    exports.toFileSystemProviderErrorCode = toFileSystemProviderErrorCode;
    function toFileOperationResult(error) {
        // FileSystemProviderError comes with the result already
        if (error instanceof FileOperationError) {
            return error.fileOperationResult;
        }
        // Otherwise try to find from code
        switch (toFileSystemProviderErrorCode(error)) {
            case FileSystemProviderErrorCode.FileNotFound:
                return 1 /* FILE_NOT_FOUND */;
            case FileSystemProviderErrorCode.FileIsADirectory:
                return 0 /* FILE_IS_DIRECTORY */;
            case FileSystemProviderErrorCode.FileNotADirectory:
                return 10 /* FILE_NOT_DIRECTORY */;
            case FileSystemProviderErrorCode.FileWriteLocked:
                return 5 /* FILE_WRITE_LOCKED */;
            case FileSystemProviderErrorCode.NoPermissions:
                return 6 /* FILE_PERMISSION_DENIED */;
            case FileSystemProviderErrorCode.FileExists:
                return 4 /* FILE_MOVE_CONFLICT */;
            case FileSystemProviderErrorCode.FileExceedsMemoryLimit:
                return 9 /* FILE_EXCEEDS_MEMORY_LIMIT */;
            case FileSystemProviderErrorCode.FileTooLarge:
                return 7 /* FILE_TOO_LARGE */;
            default:
                return 11 /* FILE_OTHER_ERROR */;
        }
    }
    exports.toFileOperationResult = toFileOperationResult;
    var FileOperation;
    (function (FileOperation) {
        FileOperation[FileOperation["CREATE"] = 0] = "CREATE";
        FileOperation[FileOperation["DELETE"] = 1] = "DELETE";
        FileOperation[FileOperation["MOVE"] = 2] = "MOVE";
        FileOperation[FileOperation["COPY"] = 3] = "COPY";
    })(FileOperation = exports.FileOperation || (exports.FileOperation = {}));
    class FileOperationEvent {
        constructor(resource, operation, target) {
            this.resource = resource;
            this.operation = operation;
            this.target = target;
        }
        isOperation(operation) {
            return this.operation === operation;
        }
    }
    exports.FileOperationEvent = FileOperationEvent;
    /**
     * Possible changes that can occur to a file.
     */
    var FileChangeType;
    (function (FileChangeType) {
        FileChangeType[FileChangeType["UPDATED"] = 0] = "UPDATED";
        FileChangeType[FileChangeType["ADDED"] = 1] = "ADDED";
        FileChangeType[FileChangeType["DELETED"] = 2] = "DELETED";
    })(FileChangeType = exports.FileChangeType || (exports.FileChangeType = {}));
    class FileChangesEvent {
        constructor(changes, ignorePathCasing) {
            this.ignorePathCasing = ignorePathCasing;
            this.added = undefined;
            this.updated = undefined;
            this.deleted = undefined;
            this.changes = changes;
            for (const change of changes) {
                switch (change.type) {
                    case 1 /* ADDED */:
                        if (!this.added) {
                            this.added = map_1.TernarySearchTree.forUris(() => this.ignorePathCasing);
                        }
                        this.added.set(change.resource, change);
                        break;
                    case 0 /* UPDATED */:
                        if (!this.updated) {
                            this.updated = map_1.TernarySearchTree.forUris(() => this.ignorePathCasing);
                        }
                        this.updated.set(change.resource, change);
                        break;
                    case 2 /* DELETED */:
                        if (!this.deleted) {
                            this.deleted = map_1.TernarySearchTree.forUris(() => this.ignorePathCasing);
                        }
                        this.deleted.set(change.resource, change);
                        break;
                }
            }
        }
        /**
         * Find out if the file change events match the provided resource.
         *
         * Note: when passing `FileChangeType.DELETED`, we consider a match
         * also when the parent of the resource got deleted.
         */
        contains(resource, ...types) {
            return this.doContains(resource, { includeChildren: false }, ...types);
        }
        /**
         * Find out if the file change events either match the provided
         * resource, or contain a child of this resource.
         */
        affects(resource, ...types) {
            return this.doContains(resource, { includeChildren: true }, ...types);
        }
        doContains(resource, options, ...types) {
            var _a, _b, _c, _d, _e, _f;
            if (!resource) {
                return false;
            }
            const hasTypesFilter = types.length > 0;
            // Added
            if (!hasTypesFilter || types.includes(1 /* ADDED */)) {
                if ((_a = this.added) === null || _a === void 0 ? void 0 : _a.get(resource)) {
                    return true;
                }
                if (options.includeChildren && ((_b = this.added) === null || _b === void 0 ? void 0 : _b.findSuperstr(resource))) {
                    return true;
                }
            }
            // Updated
            if (!hasTypesFilter || types.includes(0 /* UPDATED */)) {
                if ((_c = this.updated) === null || _c === void 0 ? void 0 : _c.get(resource)) {
                    return true;
                }
                if (options.includeChildren && ((_d = this.updated) === null || _d === void 0 ? void 0 : _d.findSuperstr(resource))) {
                    return true;
                }
            }
            // Deleted
            if (!hasTypesFilter || types.includes(2 /* DELETED */)) {
                if ((_e = this.deleted) === null || _e === void 0 ? void 0 : _e.findSubstr(resource) /* deleted also considers parent folders */) {
                    return true;
                }
                if (options.includeChildren && ((_f = this.deleted) === null || _f === void 0 ? void 0 : _f.findSuperstr(resource))) {
                    return true;
                }
            }
            return false;
        }
        /**
         * @deprecated use the `contains()` method to efficiently find out if the event
         * relates to a given resource. this method ensures:
         * - that there is no expensive lookup needed by using a `TernarySearchTree`
         * - correctly handles `FileChangeType.DELETED` events
         */
        getAdded() {
            return this.getOfType(1 /* ADDED */);
        }
        /**
         * Returns if this event contains added files.
         */
        gotAdded() {
            return !!this.added;
        }
        /**
         * @deprecated use the `contains()` method to efficiently find out if the event
         * relates to a given resource. this method ensures:
         * - that there is no expensive lookup needed by using a `TernarySearchTree`
         * - correctly handles `FileChangeType.DELETED` events
         */
        getDeleted() {
            return this.getOfType(2 /* DELETED */);
        }
        /**
         * Returns if this event contains deleted files.
         */
        gotDeleted() {
            return !!this.deleted;
        }
        /**
         * @deprecated use the `contains()` method to efficiently find out if the event
         * relates to a given resource. this method ensures:
         * - that there is no expensive lookup needed by using a `TernarySearchTree`
         * - correctly handles `FileChangeType.DELETED` events
         */
        getUpdated() {
            return this.getOfType(0 /* UPDATED */);
        }
        /**
         * Returns if this event contains updated files.
         */
        gotUpdated() {
            return !!this.updated;
        }
        getOfType(type) {
            const changes = [];
            const eventsForType = type === 1 /* ADDED */ ? this.added : type === 0 /* UPDATED */ ? this.updated : this.deleted;
            if (eventsForType) {
                for (const [, change] of eventsForType) {
                    changes.push(change);
                }
            }
            return changes;
        }
        /**
         * @deprecated use the `contains()` method to efficiently find out if the event
         * relates to a given resource. this method ensures:
         * - that there is no expensive lookup needed by using a `TernarySearchTree`
         * - correctly handles `FileChangeType.DELETED` events
         */
        filter(filterFn) {
            return new FileChangesEvent(this.changes.filter(change => filterFn(change)), this.ignorePathCasing);
        }
    }
    exports.FileChangesEvent = FileChangesEvent;
    function isParent(path, candidate, ignoreCase) {
        if (!path || !candidate || path === candidate) {
            return false;
        }
        if (candidate.length > path.length) {
            return false;
        }
        if (candidate.charAt(candidate.length - 1) !== path_1.sep) {
            candidate += path_1.sep;
        }
        if (ignoreCase) {
            return (0, strings_1.startsWithIgnoreCase)(path, candidate);
        }
        return path.indexOf(candidate) === 0;
    }
    exports.isParent = isParent;
    class FileOperationError extends Error {
        constructor(message, fileOperationResult, options) {
            super(message);
            this.fileOperationResult = fileOperationResult;
            this.options = options;
        }
        static isFileOperationError(obj) {
            return obj instanceof Error && !(0, types_1.isUndefinedOrNull)(obj.fileOperationResult);
        }
    }
    exports.FileOperationError = FileOperationError;
    var FileOperationResult;
    (function (FileOperationResult) {
        FileOperationResult[FileOperationResult["FILE_IS_DIRECTORY"] = 0] = "FILE_IS_DIRECTORY";
        FileOperationResult[FileOperationResult["FILE_NOT_FOUND"] = 1] = "FILE_NOT_FOUND";
        FileOperationResult[FileOperationResult["FILE_NOT_MODIFIED_SINCE"] = 2] = "FILE_NOT_MODIFIED_SINCE";
        FileOperationResult[FileOperationResult["FILE_MODIFIED_SINCE"] = 3] = "FILE_MODIFIED_SINCE";
        FileOperationResult[FileOperationResult["FILE_MOVE_CONFLICT"] = 4] = "FILE_MOVE_CONFLICT";
        FileOperationResult[FileOperationResult["FILE_WRITE_LOCKED"] = 5] = "FILE_WRITE_LOCKED";
        FileOperationResult[FileOperationResult["FILE_PERMISSION_DENIED"] = 6] = "FILE_PERMISSION_DENIED";
        FileOperationResult[FileOperationResult["FILE_TOO_LARGE"] = 7] = "FILE_TOO_LARGE";
        FileOperationResult[FileOperationResult["FILE_INVALID_PATH"] = 8] = "FILE_INVALID_PATH";
        FileOperationResult[FileOperationResult["FILE_EXCEEDS_MEMORY_LIMIT"] = 9] = "FILE_EXCEEDS_MEMORY_LIMIT";
        FileOperationResult[FileOperationResult["FILE_NOT_DIRECTORY"] = 10] = "FILE_NOT_DIRECTORY";
        FileOperationResult[FileOperationResult["FILE_OTHER_ERROR"] = 11] = "FILE_OTHER_ERROR";
    })(FileOperationResult = exports.FileOperationResult || (exports.FileOperationResult = {}));
    //#endregion
    //#region Settings
    exports.AutoSaveConfiguration = {
        OFF: 'off',
        AFTER_DELAY: 'afterDelay',
        ON_FOCUS_CHANGE: 'onFocusChange',
        ON_WINDOW_CHANGE: 'onWindowChange'
    };
    exports.HotExitConfiguration = {
        OFF: 'off',
        ON_EXIT: 'onExit',
        ON_EXIT_AND_WINDOW_CLOSE: 'onExitAndWindowClose'
    };
    exports.FILES_ASSOCIATIONS_CONFIG = 'files.associations';
    exports.FILES_EXCLUDE_CONFIG = 'files.exclude';
    //#endregion
    //#region Utilities
    var FileKind;
    (function (FileKind) {
        FileKind[FileKind["FILE"] = 0] = "FILE";
        FileKind[FileKind["FOLDER"] = 1] = "FOLDER";
        FileKind[FileKind["ROOT_FOLDER"] = 2] = "ROOT_FOLDER";
    })(FileKind = exports.FileKind || (exports.FileKind = {}));
    /**
     * A hint to disable etag checking for reading/writing.
     */
    exports.ETAG_DISABLED = '';
    function etag(stat) {
        if (typeof stat.size !== 'number' || typeof stat.mtime !== 'number') {
            return undefined;
        }
        return stat.mtime.toString(29) + stat.size.toString(31);
    }
    exports.etag = etag;
    async function whenProviderRegistered(file, fileService) {
        if (fileService.canHandleResource(uri_1.URI.from({ scheme: file.scheme }))) {
            return;
        }
        return new Promise(resolve => {
            const disposable = fileService.onDidChangeFileSystemProviderRegistrations(e => {
                if (e.scheme === file.scheme && e.added) {
                    disposable.dispose();
                    resolve();
                }
            });
        });
    }
    exports.whenProviderRegistered = whenProviderRegistered;
    /**
     * Native only: limits for memory sizes
     */
    exports.MIN_MAX_MEMORY_SIZE_MB = 2048;
    exports.FALLBACK_MAX_MEMORY_SIZE_MB = 4096;
    /**
     * Helper to format a raw byte size into a human readable label.
     */
    class ByteSize {
        static formatSize(size) {
            if (!(0, types_1.isNumber)(size)) {
                size = 0;
            }
            if (size < ByteSize.KB) {
                return (0, nls_1.localize)(1, null, size.toFixed(0));
            }
            if (size < ByteSize.MB) {
                return (0, nls_1.localize)(2, null, (size / ByteSize.KB).toFixed(2));
            }
            if (size < ByteSize.GB) {
                return (0, nls_1.localize)(3, null, (size / ByteSize.MB).toFixed(2));
            }
            if (size < ByteSize.TB) {
                return (0, nls_1.localize)(4, null, (size / ByteSize.GB).toFixed(2));
            }
            return (0, nls_1.localize)(5, null, (size / ByteSize.TB).toFixed(2));
        }
    }
    exports.ByteSize = ByteSize;
    ByteSize.KB = 1024;
    ByteSize.MB = ByteSize.KB * ByteSize.KB;
    ByteSize.GB = ByteSize.MB * ByteSize.KB;
    ByteSize.TB = ByteSize.GB * ByteSize.KB;
    var Arch;
    (function (Arch) {
        Arch[Arch["IA32"] = 0] = "IA32";
        Arch[Arch["OTHER"] = 1] = "OTHER";
    })(Arch = exports.Arch || (exports.Arch = {}));
    function getPlatformLimits(arch) {
        return {
            maxFileSize: arch === 0 /* IA32 */ ? 300 * ByteSize.MB : 16 * ByteSize.GB,
            maxHeapSize: arch === 0 /* IA32 */ ? 700 * ByteSize.MB : 2 * 700 * ByteSize.MB, // https://github.com/v8/v8/blob/5918a23a3d571b9625e5cce246bdd5b46ff7cd8b/src/heap/heap.cc#L149
        };
    }
    exports.getPlatformLimits = getPlatformLimits;
});
//#endregion
//# sourceMappingURL=files.js.map