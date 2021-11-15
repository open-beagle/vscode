/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/node/pfs", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/parts/storage/node/storage", "vs/base/parts/storage/common/storage", "vs/base/common/path", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/base/common/uuid", "vs/platform/workspaces/common/workspaces"], function (require, exports, fs_1, pfs_1, event_1, lifecycle_1, log_1, storage_1, storage_2, path_1, storage_3, telemetry_1, uuid_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceStorageMain = exports.GlobalStorageMain = void 0;
    class BaseStorageMain extends lifecycle_1.Disposable {
        constructor(logService) {
            super();
            this.logService = logService;
            this._onDidChangeStorage = this._register(new event_1.Emitter());
            this.onDidChangeStorage = this._onDidChangeStorage.event;
            this._onDidCloseStorage = this._register(new event_1.Emitter());
            this.onDidCloseStorage = this._onDidCloseStorage.event;
            this.storage = new storage_2.Storage(new storage_2.InMemoryStorageDatabase()); // storage is in-memory until initialized
            this.initializePromise = undefined;
        }
        init() {
            if (!this.initializePromise) {
                this.initializePromise = (async () => {
                    try {
                        // Create storage via subclasses
                        const storage = await this.doCreate();
                        // Replace our in-memory storage with the real
                        // once as soon as possible without awaiting
                        // the init call.
                        this.storage.dispose();
                        this.storage = storage;
                        // Re-emit storage changes via event
                        this._register(storage.onDidChangeStorage(key => this._onDidChangeStorage.fire({ key })));
                        // Await storage init
                        await this.doInit(storage);
                        // Ensure we track wether storage is new or not
                        const isNewStorage = storage.getBoolean(storage_3.IS_NEW_KEY);
                        if (isNewStorage === undefined) {
                            storage.set(storage_3.IS_NEW_KEY, true);
                        }
                        else if (isNewStorage) {
                            storage.set(storage_3.IS_NEW_KEY, false);
                        }
                    }
                    catch (error) {
                        this.logService.error(`StorageMain#initialize(): Unable to init storage due to ${error}`);
                    }
                })();
            }
            return this.initializePromise;
        }
        createLogginOptions() {
            return {
                logTrace: (this.logService.getLevel() === log_1.LogLevel.Trace) ? msg => this.logService.trace(msg) : undefined,
                logError: error => this.logService.error(error)
            };
        }
        doInit(storage) {
            return storage.init();
        }
        get items() { return this.storage.items; }
        get(key, fallbackValue) {
            return this.storage.get(key, fallbackValue);
        }
        set(key, value) {
            return this.storage.set(key, value);
        }
        delete(key) {
            return this.storage.delete(key);
        }
        async close() {
            // Ensure we are not accidentally leaving
            // a pending initialized storage behind in
            // case close() was called before init()
            // finishes
            if (this.initializePromise) {
                await this.initializePromise;
            }
            // Propagate to storage lib
            await this.storage.close();
            // Signal as event
            this._onDidCloseStorage.fire();
        }
    }
    class GlobalStorageMain extends BaseStorageMain {
        constructor(options, logService, environmentService) {
            super(logService);
            this.options = options;
            this.environmentService = environmentService;
        }
        async doCreate() {
            let storagePath;
            if (this.options.useInMemoryStorage) {
                storagePath = storage_1.SQLiteStorageDatabase.IN_MEMORY_PATH;
            }
            else {
                storagePath = (0, path_1.join)(this.environmentService.globalStorageHome.fsPath, GlobalStorageMain.STORAGE_NAME);
            }
            return new storage_2.Storage(new storage_1.SQLiteStorageDatabase(storagePath, {
                logging: this.createLogginOptions()
            }));
        }
        async doInit(storage) {
            await super.doInit(storage);
            // Apply global telemetry values as part of the initialization
            this.updateTelemetryState(storage);
        }
        updateTelemetryState(storage) {
            // Instance UUID (once)
            const instanceId = storage.get(telemetry_1.instanceStorageKey, undefined);
            if (instanceId === undefined) {
                storage.set(telemetry_1.instanceStorageKey, (0, uuid_1.generateUuid)());
            }
            // First session date (once)
            const firstSessionDate = storage.get(telemetry_1.firstSessionDateStorageKey, undefined);
            if (firstSessionDate === undefined) {
                storage.set(telemetry_1.firstSessionDateStorageKey, new Date().toUTCString());
            }
            // Last / current session (always)
            // previous session date was the "current" one at that time
            // current session date is "now"
            const lastSessionDate = storage.get(telemetry_1.currentSessionDateStorageKey, undefined);
            const currentSessionDate = new Date().toUTCString();
            storage.set(telemetry_1.lastSessionDateStorageKey, typeof lastSessionDate === 'undefined' ? null : lastSessionDate);
            storage.set(telemetry_1.currentSessionDateStorageKey, currentSessionDate);
        }
    }
    exports.GlobalStorageMain = GlobalStorageMain;
    GlobalStorageMain.STORAGE_NAME = 'state.vscdb';
    class WorkspaceStorageMain extends BaseStorageMain {
        constructor(workspace, options, logService, environmentService) {
            super(logService);
            this.workspace = workspace;
            this.options = options;
            this.environmentService = environmentService;
        }
        async doCreate() {
            const { storageFilePath, wasCreated } = await this.prepareWorkspaceStorageFolder();
            return new storage_2.Storage(new storage_1.SQLiteStorageDatabase(storageFilePath, {
                logging: this.createLogginOptions()
            }), { hint: wasCreated ? storage_2.StorageHint.STORAGE_DOES_NOT_EXIST : undefined });
        }
        async prepareWorkspaceStorageFolder() {
            // Return early if using inMemory storage
            if (this.options.useInMemoryStorage) {
                return { storageFilePath: storage_1.SQLiteStorageDatabase.IN_MEMORY_PATH, wasCreated: true };
            }
            // Otherwise, ensure the storage folder exists on disk
            const workspaceStorageFolderPath = (0, path_1.join)(this.environmentService.workspaceStorageHome.fsPath, this.workspace.id);
            const workspaceStorageDatabasePath = (0, path_1.join)(workspaceStorageFolderPath, WorkspaceStorageMain.WORKSPACE_STORAGE_NAME);
            const storageExists = await (0, pfs_1.exists)(workspaceStorageFolderPath);
            if (storageExists) {
                return { storageFilePath: workspaceStorageDatabasePath, wasCreated: false };
            }
            // Ensure storage folder exists
            await fs_1.promises.mkdir(workspaceStorageFolderPath, { recursive: true });
            // Write metadata into folder (but do not await)
            this.ensureWorkspaceStorageFolderMeta(workspaceStorageFolderPath);
            return { storageFilePath: workspaceStorageDatabasePath, wasCreated: true };
        }
        async ensureWorkspaceStorageFolderMeta(workspaceStorageFolderPath) {
            let meta = undefined;
            if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(this.workspace)) {
                meta = { folder: this.workspace.uri.toString() };
            }
            else if ((0, workspaces_1.isWorkspaceIdentifier)(this.workspace)) {
                meta = { workspace: this.workspace.configPath.toString() };
            }
            if (meta) {
                try {
                    const workspaceStorageMetaPath = (0, path_1.join)(workspaceStorageFolderPath, WorkspaceStorageMain.WORKSPACE_META_NAME);
                    const storageExists = await (0, pfs_1.exists)(workspaceStorageMetaPath);
                    if (!storageExists) {
                        await (0, pfs_1.writeFile)(workspaceStorageMetaPath, JSON.stringify(meta, undefined, 2));
                    }
                }
                catch (error) {
                    this.logService.error(`StorageMain#ensureWorkspaceStorageFolderMeta(): Unable to create workspace storage metadata due to ${error}`);
                }
            }
        }
    }
    exports.WorkspaceStorageMain = WorkspaceStorageMain;
    WorkspaceStorageMain.WORKSPACE_STORAGE_NAME = 'state.vscdb';
    WorkspaceStorageMain.WORKSPACE_META_NAME = 'workspace.json';
});
//# sourceMappingURL=storageMain.js.map