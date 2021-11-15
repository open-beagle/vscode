/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
define(["require", "exports", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/resources"], function (require, exports, uri_1, files_1, lifecycle_1, event_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLFileSystemProvider = void 0;
    function split(path) {
        const match = /^(.*)\/([^/]+)$/.exec(path);
        if (!match) {
            return undefined;
        }
        const [, parentPath, name] = match;
        return [parentPath, name];
    }
    function getRootUUID(uri) {
        const match = /^\/([^/]+)\/[^/]+\/?$/.exec(uri.path);
        if (!match) {
            return undefined;
        }
        return match[1];
    }
    class HTMLFileSystemProvider {
        constructor() {
            this.files = new Map();
            this.directories = new Map();
            this.capabilities = 2 /* FileReadWrite */
                | 1024 /* PathCaseSensitive */;
            this.onDidChangeCapabilities = event_1.Event.None;
            this._onDidChangeFile = new event_1.Emitter();
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidErrorOccur = new event_1.Emitter();
            this.onDidErrorOccur = this._onDidErrorOccur.event;
        }
        async readFile(resource) {
            const handle = await this.getFileHandle(resource);
            if (!handle) {
                throw new Error('File not found.');
            }
            const file = await handle.getFile();
            return new Uint8Array(await file.arrayBuffer());
        }
        async writeFile(resource, content, opts) {
            const handle = await this.getFileHandle(resource);
            if (!handle) {
                throw new Error('File not found.');
            }
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
        }
        watch(resource, opts) {
            return lifecycle_1.Disposable.None;
        }
        async stat(resource) {
            var e_1, _a;
            const rootUUID = getRootUUID(resource);
            if (rootUUID) {
                const fileHandle = this.files.get(rootUUID);
                if (fileHandle) {
                    const file = await fileHandle.getFile();
                    return {
                        type: files_1.FileType.File,
                        mtime: file.lastModified,
                        ctime: 0,
                        size: file.size
                    };
                }
                const directoryHandle = this.directories.get(rootUUID);
                if (directoryHandle) {
                    return {
                        type: files_1.FileType.Directory,
                        mtime: 0,
                        ctime: 0,
                        size: 0
                    };
                }
            }
            const parent = await this.getParentDirectoryHandle(resource);
            if (!parent) {
                throw new Error('Stat error: no parent found');
            }
            const name = resources_1.extUri.basename(resource);
            try {
                for (var parent_1 = __asyncValues(parent), parent_1_1; parent_1_1 = await parent_1.next(), !parent_1_1.done;) {
                    const [childName, child] = parent_1_1.value;
                    if (childName === name) {
                        if (child.kind === 'file') {
                            const file = await child.getFile();
                            return {
                                type: files_1.FileType.File,
                                mtime: file.lastModified,
                                ctime: 0,
                                size: file.size
                            };
                        }
                        else {
                            return {
                                type: files_1.FileType.Directory,
                                mtime: 0,
                                ctime: 0,
                                size: 0
                            };
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (parent_1_1 && !parent_1_1.done && (_a = parent_1.return)) await _a.call(parent_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            throw new Error('Stat error: entry not found');
        }
        mkdir(resource) {
            throw new Error('Method not implemented.');
        }
        async readdir(resource) {
            var e_2, _a;
            const parent = await this.getDirectoryHandle(resource);
            if (!parent) {
                throw new Error('Stat error: no parent found');
            }
            const result = [];
            try {
                for (var parent_2 = __asyncValues(parent), parent_2_1; parent_2_1 = await parent_2.next(), !parent_2_1.done;) {
                    const [name, child] = parent_2_1.value;
                    result.push([name, child.kind === 'file' ? files_1.FileType.File : files_1.FileType.Directory]);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (parent_2_1 && !parent_2_1.done && (_a = parent_2.return)) await _a.call(parent_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        }
        delete(resource, opts) {
            throw new Error('Method not implemented: delete');
        }
        rename(from, to, opts) {
            throw new Error('Method not implemented: rename');
        }
        async getDirectoryHandle(uri) {
            const rootUUID = getRootUUID(uri);
            if (rootUUID) {
                return this.directories.get(rootUUID);
            }
            const splitResult = split(uri.path);
            if (!splitResult) {
                return undefined;
            }
            const parent = await this.getDirectoryHandle(uri_1.URI.from(Object.assign(Object.assign({}, uri), { path: splitResult[0] })));
            return await (parent === null || parent === void 0 ? void 0 : parent.getDirectoryHandle(resources_1.extUri.basename(uri)));
        }
        async getParentDirectoryHandle(uri) {
            return this.getDirectoryHandle(uri_1.URI.from(Object.assign(Object.assign({}, uri), { path: resources_1.extUri.dirname(uri).path })));
        }
        async getFileHandle(uri) {
            const rootUUID = getRootUUID(uri);
            if (rootUUID) {
                return this.files.get(rootUUID);
            }
            const parent = await this.getParentDirectoryHandle(uri);
            const name = resources_1.extUri.basename(uri);
            return await (parent === null || parent === void 0 ? void 0 : parent.getFileHandle(name));
        }
        registerFileHandle(uuid, handle) {
            this.files.set(uuid, handle);
        }
        registerDirectoryHandle(uuid, handle) {
            this.directories.set(uuid, handle);
        }
        dispose() {
            this._onDidChangeFile.dispose();
        }
    }
    exports.HTMLFileSystemProvider = HTMLFileSystemProvider;
});
//# sourceMappingURL=htmlFileSystemProvider.js.map