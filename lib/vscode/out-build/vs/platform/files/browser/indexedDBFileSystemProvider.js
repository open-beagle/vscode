/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/buffer", "vs/base/common/async", "vs/nls!vs/platform/files/browser/indexedDBFileSystemProvider", "vs/base/common/resources"], function (require, exports, files_1, lifecycle_1, event_1, buffer_1, async_1, nls_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndexedDB = exports.INDEXEDDB_LOGS_OBJECT_STORE = exports.INDEXEDDB_USERDATA_OBJECT_STORE = void 0;
    const INDEXEDDB_VSCODE_DB = 'vscode-web-db';
    exports.INDEXEDDB_USERDATA_OBJECT_STORE = 'vscode-userdata-store';
    exports.INDEXEDDB_LOGS_OBJECT_STORE = 'vscode-logs-store';
    // Standard FS Errors (expected to be thrown in production when invalid FS operations are requested)
    const ERR_FILE_NOT_FOUND = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(0, null), files_1.FileSystemProviderErrorCode.FileNotFound);
    const ERR_FILE_IS_DIR = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(1, null), files_1.FileSystemProviderErrorCode.FileIsADirectory);
    const ERR_FILE_NOT_DIR = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(2, null), files_1.FileSystemProviderErrorCode.FileNotADirectory);
    const ERR_DIR_NOT_EMPTY = (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(3, null), files_1.FileSystemProviderErrorCode.Unknown);
    // Arbitrary Internal Errors (should never be thrown in production)
    const ERR_UNKNOWN_INTERNAL = (message) => (0, files_1.createFileSystemProviderError)((0, nls_1.localize)(4, null, message), files_1.FileSystemProviderErrorCode.Unknown);
    class IndexedDB {
        constructor() {
            this.indexedDBPromise = this.openIndexedDB(INDEXEDDB_VSCODE_DB, 2, [exports.INDEXEDDB_USERDATA_OBJECT_STORE, exports.INDEXEDDB_LOGS_OBJECT_STORE]);
        }
        async createFileSystemProvider(scheme, store) {
            let fsp = null;
            const indexedDB = await this.indexedDBPromise;
            if (indexedDB) {
                if (indexedDB.objectStoreNames.contains(store)) {
                    fsp = new IndexedDBFileSystemProvider(scheme, indexedDB, store);
                }
                else {
                    console.error(`Error while creating indexedDB filesystem provider. Could not find ${store} object store`);
                }
            }
            return fsp;
        }
        openIndexedDB(name, version, stores) {
            return new Promise((c, e) => {
                const request = window.indexedDB.open(name, version);
                request.onerror = (err) => e(request.error);
                request.onsuccess = () => {
                    const db = request.result;
                    for (const store of stores) {
                        if (!db.objectStoreNames.contains(store)) {
                            console.error(`Error while creating indexedDB. Could not create ${store} object store`);
                            c(null);
                            return;
                        }
                    }
                    c(db);
                };
                request.onupgradeneeded = () => {
                    const db = request.result;
                    for (const store of stores) {
                        if (!db.objectStoreNames.contains(store)) {
                            db.createObjectStore(store);
                        }
                    }
                };
            });
        }
    }
    exports.IndexedDB = IndexedDB;
    class IndexedDBFileSystemNode {
        constructor(entry) {
            this.entry = entry;
            this.doDelete = (pathParts, originalPath) => {
                if (pathParts.length === 0) {
                    throw ERR_UNKNOWN_INTERNAL(`Internal error deleting from IndexedDBFSNode -- got no deletion path parts (encountered while deleting ${originalPath})`);
                }
                else if (this.entry.type !== files_1.FileType.Directory) {
                    throw ERR_UNKNOWN_INTERNAL('Internal error deleting from IndexedDBFSNode -- expected directory at ' + this.entry.path);
                }
                else if (pathParts.length === 1) {
                    this.entry.children.delete(pathParts[0]);
                }
                else {
                    const next = this.entry.children.get(pathParts[0]);
                    if (!next) {
                        throw ERR_UNKNOWN_INTERNAL('Internal error deleting from IndexedDBFSNode -- expected entry at ' + this.entry.path + '/' + next);
                    }
                    next.doDelete(pathParts.slice(1), originalPath);
                }
            };
            this.type = entry.type;
        }
        read(path) {
            return this.doRead(path.split('/').filter(p => p.length));
        }
        doRead(pathParts) {
            if (pathParts.length === 0) {
                return this.entry;
            }
            if (this.entry.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL('Internal error reading from IndexedDBFSNode -- expected directory at ' + this.entry.path);
            }
            const next = this.entry.children.get(pathParts[0]);
            if (!next) {
                return undefined;
            }
            return next.doRead(pathParts.slice(1));
        }
        delete(path) {
            const toDelete = path.split('/').filter(p => p.length);
            if (toDelete.length === 0) {
                if (this.entry.type !== files_1.FileType.Directory) {
                    throw ERR_UNKNOWN_INTERNAL(`Internal error deleting from IndexedDBFSNode. Expected root entry to be directory`);
                }
                this.entry.children.clear();
            }
            else {
                return this.doDelete(toDelete, path);
            }
        }
        add(path, entry) {
            this.doAdd(path.split('/').filter(p => p.length), entry, path);
        }
        doAdd(pathParts, entry, originalPath) {
            if (pathParts.length === 0) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- adding empty path (encountered while adding ${originalPath})`);
            }
            else if (this.entry.type !== files_1.FileType.Directory) {
                throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- parent is not a directory (encountered while adding ${originalPath})`);
            }
            else if (pathParts.length === 1) {
                const next = pathParts[0];
                const existing = this.entry.children.get(next);
                if (entry.type === 'dir') {
                    if ((existing === null || existing === void 0 ? void 0 : existing.entry.type) === files_1.FileType.File) {
                        throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting file with directory: ${this.entry.path}/${next} (encountered while adding ${originalPath})`);
                    }
                    this.entry.children.set(next, existing !== null && existing !== void 0 ? existing : new IndexedDBFileSystemNode({
                        type: files_1.FileType.Directory,
                        path: this.entry.path + '/' + next,
                        children: new Map(),
                    }));
                }
                else {
                    if ((existing === null || existing === void 0 ? void 0 : existing.entry.type) === files_1.FileType.Directory) {
                        throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting directory with file: ${this.entry.path}/${next} (encountered while adding ${originalPath})`);
                    }
                    this.entry.children.set(next, new IndexedDBFileSystemNode({
                        type: files_1.FileType.File,
                        path: this.entry.path + '/' + next,
                        size: entry.size,
                    }));
                }
            }
            else if (pathParts.length > 1) {
                const next = pathParts[0];
                let childNode = this.entry.children.get(next);
                if (!childNode) {
                    childNode = new IndexedDBFileSystemNode({
                        children: new Map(),
                        path: this.entry.path + '/' + next,
                        type: files_1.FileType.Directory
                    });
                    this.entry.children.set(next, childNode);
                }
                else if (childNode.type === files_1.FileType.File) {
                    throw ERR_UNKNOWN_INTERNAL(`Internal error creating IndexedDBFSNode -- overwriting file entry with directory: ${this.entry.path}/${next} (encountered while adding ${originalPath})`);
                }
                childNode.doAdd(pathParts.slice(1), entry, originalPath);
            }
        }
        print(indentation = '') {
            console.log(indentation + this.entry.path);
            if (this.entry.type === files_1.FileType.Directory) {
                this.entry.children.forEach(child => child.print(indentation + ' '));
            }
        }
    }
    class IndexedDBFileSystemProvider extends lifecycle_1.Disposable {
        constructor(scheme, database, store) {
            super();
            this.database = database;
            this.store = store;
            this.capabilities = 2 /* FileReadWrite */
                | 1024 /* PathCaseSensitive */;
            this.onDidChangeCapabilities = event_1.Event.None;
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this.versions = new Map();
            this.fileWriteBatch = [];
            this.writeManyThrottler = new async_1.Throttler();
        }
        watch(resource, opts) {
            return lifecycle_1.Disposable.None;
        }
        async mkdir(resource) {
            try {
                const resourceStat = await this.stat(resource);
                if (resourceStat.type === files_1.FileType.File) {
                    throw ERR_FILE_NOT_DIR;
                }
            }
            catch (error) { /* Ignore */ }
            (await this.getFiletree()).add(resource.path, { type: 'dir' });
        }
        async stat(resource) {
            var _a;
            const content = (await this.getFiletree()).read(resource.path);
            if ((content === null || content === void 0 ? void 0 : content.type) === files_1.FileType.File) {
                return {
                    type: files_1.FileType.File,
                    ctime: 0,
                    mtime: this.versions.get(resource.toString()) || 0,
                    size: (_a = content.size) !== null && _a !== void 0 ? _a : (await this.readFile(resource)).byteLength
                };
            }
            else if ((content === null || content === void 0 ? void 0 : content.type) === files_1.FileType.Directory) {
                return {
                    type: files_1.FileType.Directory,
                    ctime: 0,
                    mtime: 0,
                    size: 0
                };
            }
            else {
                throw ERR_FILE_NOT_FOUND;
            }
        }
        async readdir(resource) {
            const entry = (await this.getFiletree()).read(resource.path);
            if (!entry) {
                // Dirs aren't saved to disk, so empty dirs will be lost on reload.
                // Thus we have two options for what happens when you try to read a dir and nothing is found:
                // - Throw FileSystemProviderErrorCode.FileNotFound
                // - Return []
                // We choose to return [] as creating a dir then reading it (even after reload) should not throw an error.
                return [];
            }
            if (entry.type !== files_1.FileType.Directory) {
                throw ERR_FILE_NOT_DIR;
            }
            else {
                return [...entry.children.entries()].map(([name, node]) => [name, node.type]);
            }
        }
        async readFile(resource) {
            const buffer = await new Promise((c, e) => {
                const transaction = this.database.transaction([this.store]);
                const objectStore = transaction.objectStore(this.store);
                const request = objectStore.get(resource.path);
                request.onerror = () => e(request.error);
                request.onsuccess = () => {
                    if (request.result instanceof Uint8Array) {
                        c(request.result);
                    }
                    else if (typeof request.result === 'string') {
                        c(buffer_1.VSBuffer.fromString(request.result).buffer);
                    }
                    else {
                        if (request.result === undefined) {
                            e(ERR_FILE_NOT_FOUND);
                        }
                        else {
                            e(ERR_UNKNOWN_INTERNAL(`IndexedDB entry at "${resource.path}" in unexpected format`));
                        }
                    }
                };
            });
            (await this.getFiletree()).add(resource.path, { type: 'file', size: buffer.byteLength });
            return buffer;
        }
        async writeFile(resource, content, opts) {
            const existing = await this.stat(resource).catch(() => undefined);
            if ((existing === null || existing === void 0 ? void 0 : existing.type) === files_1.FileType.Directory) {
                throw ERR_FILE_IS_DIR;
            }
            this.fileWriteBatch.push({ content, resource });
            await this.writeManyThrottler.queue(() => this.writeMany());
            (await this.getFiletree()).add(resource.path, { type: 'file', size: content.byteLength });
            this.versions.set(resource.toString(), (this.versions.get(resource.toString()) || 0) + 1);
            this._onDidChangeFile.fire([{ resource, type: 0 /* UPDATED */ }]);
        }
        async delete(resource, opts) {
            let stat;
            try {
                stat = await this.stat(resource);
            }
            catch (e) {
                if (e.code === files_1.FileSystemProviderErrorCode.FileNotFound) {
                    return;
                }
                throw e;
            }
            let toDelete;
            if (opts.recursive) {
                const tree = (await this.tree(resource));
                toDelete = tree.map(([path]) => path);
            }
            else {
                if (stat.type === files_1.FileType.Directory && (await this.readdir(resource)).length) {
                    throw ERR_DIR_NOT_EMPTY;
                }
                toDelete = [resource.path];
            }
            await this.deleteKeys(toDelete);
            (await this.getFiletree()).delete(resource.path);
            toDelete.forEach(key => this.versions.delete(key));
            this._onDidChangeFile.fire(toDelete.map(path => ({ resource: resource.with({ path }), type: 2 /* DELETED */ })));
        }
        async tree(resource) {
            if ((await this.stat(resource)).type === files_1.FileType.Directory) {
                const topLevelEntries = (await this.readdir(resource)).map(([key, type]) => {
                    return [(0, resources_1.joinPath)(resource, key).path, type];
                });
                let allEntries = topLevelEntries;
                await Promise.all(topLevelEntries.map(async ([key, type]) => {
                    if (type === files_1.FileType.Directory) {
                        const childEntries = (await this.tree(resource.with({ path: key })));
                        allEntries = allEntries.concat(childEntries);
                    }
                }));
                return allEntries;
            }
            else {
                const entries = [[resource.path, files_1.FileType.File]];
                return entries;
            }
        }
        rename(from, to, opts) {
            return Promise.reject(new Error('Not Supported'));
        }
        getFiletree() {
            if (!this.cachedFiletree) {
                this.cachedFiletree = new Promise((c, e) => {
                    const transaction = this.database.transaction([this.store]);
                    const objectStore = transaction.objectStore(this.store);
                    const request = objectStore.getAllKeys();
                    request.onerror = () => e(request.error);
                    request.onsuccess = () => {
                        const rootNode = new IndexedDBFileSystemNode({
                            children: new Map(),
                            path: '',
                            type: files_1.FileType.Directory
                        });
                        const keys = request.result.map(key => key.toString());
                        keys.forEach(key => rootNode.add(key, { type: 'file' }));
                        c(rootNode);
                    };
                });
            }
            return this.cachedFiletree;
        }
        async writeMany() {
            return new Promise((c, e) => {
                const fileBatch = this.fileWriteBatch;
                this.fileWriteBatch = [];
                if (fileBatch.length === 0) {
                    return c();
                }
                const transaction = this.database.transaction([this.store], 'readwrite');
                transaction.onerror = () => e(transaction.error);
                const objectStore = transaction.objectStore(this.store);
                let request = undefined;
                for (const entry of fileBatch) {
                    request = objectStore.put(entry.content, entry.resource.path);
                }
                request.onsuccess = () => c();
            });
        }
        deleteKeys(keys) {
            return new Promise(async (c, e) => {
                if (keys.length === 0) {
                    return c();
                }
                const transaction = this.database.transaction([this.store], 'readwrite');
                transaction.onerror = () => e(transaction.error);
                const objectStore = transaction.objectStore(this.store);
                let request = undefined;
                for (const key of keys) {
                    request = objectStore.delete(key);
                }
                request.onsuccess = () => c();
            });
        }
        reset() {
            return new Promise(async (c, e) => {
                const transaction = this.database.transaction([this.store], 'readwrite');
                const objectStore = transaction.objectStore(this.store);
                const request = objectStore.clear();
                request.onerror = () => e(request.error);
                request.onsuccess = () => c();
            });
        }
    }
});
//# sourceMappingURL=indexedDBFileSystemProvider.js.map