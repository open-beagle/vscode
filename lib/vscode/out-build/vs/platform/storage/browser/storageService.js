/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/base/parts/storage/common/storage", "vs/base/common/resources", "vs/base/common/async", "vs/base/common/buffer"], function (require, exports, lifecycle_1, event_1, storage_1, environment_1, files_1, storage_2, resources_1, async_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileStorageDatabase = exports.BrowserStorageService = void 0;
    let BrowserStorageService = class BrowserStorageService extends storage_1.AbstractStorageService {
        constructor(payload, environmentService, fileService) {
            super({ flushInterval: BrowserStorageService.BROWSER_DEFAULT_FLUSH_INTERVAL });
            this.payload = payload;
            this.environmentService = environmentService;
            this.fileService = fileService;
        }
        get hasPendingUpdate() {
            return (!!this.globalStorageDatabase && this.globalStorageDatabase.hasPendingUpdate) || (!!this.workspaceStorageDatabase && this.workspaceStorageDatabase.hasPendingUpdate);
        }
        async doInitialize() {
            // Ensure state folder exists
            const stateRoot = (0, resources_1.joinPath)(this.environmentService.userRoamingDataHome, 'state');
            await this.fileService.createFolder(stateRoot);
            // Workspace Storage
            this.workspaceStorageFile = (0, resources_1.joinPath)(stateRoot, `${this.payload.id}.json`);
            this.workspaceStorageDatabase = this._register(new FileStorageDatabase(this.workspaceStorageFile, false /* do not watch for external changes */, this.fileService));
            this.workspaceStorage = this._register(new storage_2.Storage(this.workspaceStorageDatabase));
            this._register(this.workspaceStorage.onDidChangeStorage(key => this.emitDidChangeValue(1 /* WORKSPACE */, key)));
            // Global Storage
            this.globalStorageFile = (0, resources_1.joinPath)(stateRoot, 'global.json');
            this.globalStorageDatabase = this._register(new FileStorageDatabase(this.globalStorageFile, true /* watch for external changes */, this.fileService));
            this.globalStorage = this._register(new storage_2.Storage(this.globalStorageDatabase));
            this._register(this.globalStorage.onDidChangeStorage(key => this.emitDidChangeValue(0 /* GLOBAL */, key)));
            // Init both
            await async_1.Promises.settled([
                this.workspaceStorage.init(),
                this.globalStorage.init()
            ]);
            // Check to see if this is the first time we are "opening" the application
            const firstOpen = this.globalStorage.getBoolean(storage_1.IS_NEW_KEY);
            if (firstOpen === undefined) {
                this.globalStorage.set(storage_1.IS_NEW_KEY, true);
            }
            else if (firstOpen) {
                this.globalStorage.set(storage_1.IS_NEW_KEY, false);
            }
            // Check to see if this is the first time we are "opening" this workspace
            const firstWorkspaceOpen = this.workspaceStorage.getBoolean(storage_1.IS_NEW_KEY);
            if (firstWorkspaceOpen === undefined) {
                this.workspaceStorage.set(storage_1.IS_NEW_KEY, true);
            }
            else if (firstWorkspaceOpen) {
                this.workspaceStorage.set(storage_1.IS_NEW_KEY, false);
            }
        }
        getStorage(scope) {
            return scope === 0 /* GLOBAL */ ? this.globalStorage : this.workspaceStorage;
        }
        getLogDetails(scope) {
            var _a, _b;
            return scope === 0 /* GLOBAL */ ? (_a = this.globalStorageFile) === null || _a === void 0 ? void 0 : _a.toString() : (_b = this.workspaceStorageFile) === null || _b === void 0 ? void 0 : _b.toString();
        }
        async migrate(toWorkspace) {
            throw new Error('Migrating storage is currently unsupported in Web');
        }
        shouldFlushWhenIdle() {
            // this flush() will potentially cause new state to be stored
            // since new state will only be created while the document
            // has focus, one optimization is to not run this when the
            // document has no focus, assuming that state has not changed
            //
            // another optimization is to not collect more state if we
            // have a pending update already running which indicates
            // that the connection is either slow or disconnected and
            // thus unhealthy.
            return document.hasFocus() && !this.hasPendingUpdate;
        }
        close() {
            // We explicitly do not close our DBs because writing data onBeforeUnload()
            // can result in unexpected results. Namely, it seems that - even though this
            // operation is async - sometimes it is being triggered on unload and
            // succeeds. Often though, the DBs turn out to be empty because the write
            // never had a chance to complete.
            //
            // Instead we trigger dispose() to ensure that no timeouts or callbacks
            // get triggered in this phase.
            this.dispose();
        }
    };
    BrowserStorageService.BROWSER_DEFAULT_FLUSH_INTERVAL = 5 * 1000; // every 5s because async operations are not permitted on shutdown
    BrowserStorageService = __decorate([
        __param(1, environment_1.IEnvironmentService),
        __param(2, files_1.IFileService)
    ], BrowserStorageService);
    exports.BrowserStorageService = BrowserStorageService;
    let FileStorageDatabase = class FileStorageDatabase extends lifecycle_1.Disposable {
        constructor(file, watchForExternalChanges, fileService) {
            super();
            this.file = file;
            this.watchForExternalChanges = watchForExternalChanges;
            this.fileService = fileService;
            this._onDidChangeItemsExternal = this._register(new event_1.Emitter());
            this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
            this.pendingUpdate = Promise.resolve();
            this._hasPendingUpdate = false;
            this.isWatching = false;
        }
        get hasPendingUpdate() {
            return this._hasPendingUpdate;
        }
        async ensureWatching() {
            if (this.isWatching || !this.watchForExternalChanges) {
                return;
            }
            const exists = await this.fileService.exists(this.file);
            if (this.isWatching || !exists) {
                return; // file must exist to be watched
            }
            this.isWatching = true;
            this._register(this.fileService.watch(this.file));
            this._register(this.fileService.onDidFilesChange(e => {
                if (document.hasFocus()) {
                    return; // optimization: ignore changes from ourselves by checking for focus
                }
                if (!e.contains(this.file, 0 /* UPDATED */)) {
                    return; // not our file
                }
                this.onDidStorageChangeExternal();
            }));
        }
        async onDidStorageChangeExternal() {
            const items = await this.doGetItemsFromFile();
            // pervious cache, diff for changes
            let changed = new Map();
            let deleted = new Set();
            if (this.cache) {
                items.forEach((value, key) => {
                    var _a;
                    const existingValue = (_a = this.cache) === null || _a === void 0 ? void 0 : _a.get(key);
                    if (existingValue !== value) {
                        changed.set(key, value);
                    }
                });
                this.cache.forEach((_, key) => {
                    if (!items.has(key)) {
                        deleted.add(key);
                    }
                });
            }
            // no previous cache, consider all as changed
            else {
                changed = items;
            }
            // Update cache
            this.cache = items;
            // Emit as event as needed
            if (changed.size > 0 || deleted.size > 0) {
                this._onDidChangeItemsExternal.fire({ changed, deleted });
            }
        }
        async getItems() {
            if (!this.cache) {
                try {
                    this.cache = await this.doGetItemsFromFile();
                }
                catch (error) {
                    this.cache = new Map();
                }
            }
            return this.cache;
        }
        async doGetItemsFromFile() {
            await this.pendingUpdate;
            const itemsRaw = await this.fileService.readFile(this.file);
            this.ensureWatching(); // now that the file must exist, ensure we watch it for changes
            return new Map(JSON.parse(itemsRaw.value.toString()));
        }
        async updateItems(request) {
            const items = await this.getItems();
            if (request.insert) {
                request.insert.forEach((value, key) => items.set(key, value));
            }
            if (request.delete) {
                request.delete.forEach(key => items.delete(key));
            }
            await this.pendingUpdate;
            this.pendingUpdate = (async () => {
                try {
                    this._hasPendingUpdate = true;
                    await this.fileService.writeFile(this.file, buffer_1.VSBuffer.fromString(JSON.stringify(Array.from(items.entries()))));
                    this.ensureWatching(); // now that the file must exist, ensure we watch it for changes
                }
                finally {
                    this._hasPendingUpdate = false;
                }
            })();
            return this.pendingUpdate;
        }
        close() {
            return this.pendingUpdate;
        }
    };
    FileStorageDatabase = __decorate([
        __param(2, files_1.IFileService)
    ], FileStorageDatabase);
    exports.FileStorageDatabase = FileStorageDatabase;
});
//# sourceMappingURL=storageService.js.map