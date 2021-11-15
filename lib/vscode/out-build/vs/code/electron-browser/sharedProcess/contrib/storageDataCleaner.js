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
define(["require", "exports", "fs", "vs/platform/environment/common/environment", "vs/base/common/path", "vs/base/node/pfs", "vs/base/common/errors", "vs/base/common/lifecycle"], function (require, exports, fs_1, environment_1, path_1, pfs_1, errors_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StorageDataCleaner = void 0;
    let StorageDataCleaner = class StorageDataCleaner extends lifecycle_1.Disposable {
        constructor(backupWorkspacesPath, environmentService) {
            super();
            this.backupWorkspacesPath = backupWorkspacesPath;
            this.environmentService = environmentService;
            this.cleanUpStorageSoon();
        }
        cleanUpStorageSoon() {
            let handle = setTimeout(() => {
                handle = undefined;
                (async () => {
                    try {
                        // Leverage the backup workspace file to find out which empty workspace is currently in use to
                        // determine which empty workspace storage can safely be deleted
                        const contents = await fs_1.promises.readFile(this.backupWorkspacesPath, 'utf8');
                        const workspaces = JSON.parse(contents);
                        const emptyWorkspaces = workspaces.emptyWorkspaceInfos.map(info => info.backupFolder);
                        // Read all workspace storage folders that exist
                        const storageFolders = await (0, pfs_1.readdir)(this.environmentService.workspaceStorageHome.fsPath);
                        const deletes = [];
                        storageFolders.forEach(storageFolder => {
                            if (storageFolder.length === StorageDataCleaner.NON_EMPTY_WORKSPACE_ID_LENGTH) {
                                return;
                            }
                            if (emptyWorkspaces.indexOf(storageFolder) === -1) {
                                deletes.push((0, pfs_1.rimraf)((0, path_1.join)(this.environmentService.workspaceStorageHome.fsPath, storageFolder)));
                            }
                        });
                        await Promise.all(deletes);
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                    }
                })();
            }, 30 * 1000);
            this._register((0, lifecycle_1.toDisposable)(() => {
                if (handle) {
                    clearTimeout(handle);
                    handle = undefined;
                }
            }));
        }
    };
    // Workspace/Folder storage names are MD5 hashes (128bits / 4 due to hex presentation)
    StorageDataCleaner.NON_EMPTY_WORKSPACE_ID_LENGTH = 128 / 4;
    StorageDataCleaner = __decorate([
        __param(1, environment_1.INativeEnvironmentService)
    ], StorageDataCleaner);
    exports.StorageDataCleaner = StorageDataCleaner;
});
//# sourceMappingURL=storageDataCleaner.js.map