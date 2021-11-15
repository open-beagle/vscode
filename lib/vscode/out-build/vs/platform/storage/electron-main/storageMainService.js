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
define(["require", "exports", "vs/base/common/functional", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/storage/electron-main/storageMain"], function (require, exports, functional_1, lifecycle_1, environment_1, instantiation_1, lifecycleMainService_1, log_1, storageMain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageMainService = exports.IStorageMainService = void 0;
    exports.IStorageMainService = (0, instantiation_1.createDecorator)('storageMainService');
    let StorageMainService = class StorageMainService extends lifecycle_1.Disposable {
        constructor(logService, environmentService, lifecycleMainService) {
            super();
            this.logService = logService;
            this.environmentService = environmentService;
            this.lifecycleMainService = lifecycleMainService;
            //#region Global Storage
            this.globalStorage = this.createGlobalStorage();
            //#endregion
            //#region Workspace Storage
            this.mapWorkspaceToStorage = new Map();
            this.registerListeners();
        }
        getStorageOptions() {
            return {
                useInMemoryStorage: !!this.environmentService.extensionTestsLocationURI // no storage during extension tests!
            };
        }
        registerListeners() {
            // Global Storage: Warmup when any window opens
            (async () => {
                await this.lifecycleMainService.when(3 /* AfterWindowOpen */);
                this.globalStorage.init();
            })();
            // Workspace Storage: Warmup when related window with workspace loads
            this._register(this.lifecycleMainService.onWillLoadWindow(async (e) => {
                if (e.workspace) {
                    this.workspaceStorage(e.workspace).init();
                }
            }));
            // All Storage: Close when shutting down
            this._register(this.lifecycleMainService.onWillShutdown(e => {
                // Global Storage
                e.join(this.globalStorage.close());
                // Workspace Storage(s)
                for (const [, storage] of this.mapWorkspaceToStorage) {
                    e.join(storage.close());
                }
            }));
        }
        createGlobalStorage() {
            if (this.globalStorage) {
                return this.globalStorage; // only once
            }
            this.logService.trace(`StorageMainService: creating global storage`);
            const globalStorage = new storageMain_1.GlobalStorageMain(this.getStorageOptions(), this.logService, this.environmentService);
            (0, functional_1.once)(globalStorage.onDidCloseStorage)(() => {
                this.logService.trace(`StorageMainService: closed global storage`);
            });
            return globalStorage;
        }
        createWorkspaceStorage(workspace) {
            const workspaceStorage = new storageMain_1.WorkspaceStorageMain(workspace, this.getStorageOptions(), this.logService, this.environmentService);
            return workspaceStorage;
        }
        workspaceStorage(workspace) {
            let workspaceStorage = this.mapWorkspaceToStorage.get(workspace.id);
            if (!workspaceStorage) {
                this.logService.trace(`StorageMainService: creating workspace storage (${workspace.id})`);
                workspaceStorage = this.createWorkspaceStorage(workspace);
                this.mapWorkspaceToStorage.set(workspace.id, workspaceStorage);
                (0, functional_1.once)(workspaceStorage.onDidCloseStorage)(() => {
                    this.logService.trace(`StorageMainService: closed workspace storage (${workspace.id})`);
                    this.mapWorkspaceToStorage.delete(workspace.id);
                });
            }
            return workspaceStorage;
        }
    };
    StorageMainService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, lifecycleMainService_1.ILifecycleMainService)
    ], StorageMainService);
    exports.StorageMainService = StorageMainService;
});
//# sourceMappingURL=storageMainService.js.map