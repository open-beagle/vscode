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
define(["require", "exports", "vs/platform/workspaces/common/workspaces", "vs/platform/environment/electron-main/environmentMainService", "vs/base/common/path", "vs/base/node/pfs", "fs", "vs/base/common/platform", "vs/base/common/event", "vs/platform/log/common/log", "crypto", "vs/base/common/json", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/product/common/productService", "electron", "vs/base/common/types", "vs/platform/backup/electron-main/backup", "vs/platform/dialogs/electron-main/dialogMainService", "vs/platform/windows/electron-main/windowsFinder"], function (require, exports, workspaces_1, environmentMainService_1, path_1, pfs_1, fs_1, platform_1, event_1, log_1, crypto_1, json_1, network_1, lifecycle_1, resources_1, instantiation_1, nls_1, productService_1, electron_1, types_1, backup_1, dialogMainService_1, windowsFinder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSingleFolderWorkspaceIdentifier = exports.getWorkspaceIdentifier = exports.WorkspacesManagementMainService = exports.IWorkspacesManagementMainService = void 0;
    exports.IWorkspacesManagementMainService = (0, instantiation_1.createDecorator)('workspacesManagementMainService');
    let WorkspacesManagementMainService = class WorkspacesManagementMainService extends lifecycle_1.Disposable {
        constructor(environmentMainService, logService, backupMainService, dialogMainService, productService) {
            super();
            this.environmentMainService = environmentMainService;
            this.logService = logService;
            this.backupMainService = backupMainService;
            this.dialogMainService = dialogMainService;
            this.productService = productService;
            this.untitledWorkspacesHome = this.environmentMainService.untitledWorkspacesHome; // local URI that contains all untitled workspaces
            this._onDidDeleteUntitledWorkspace = this._register(new event_1.Emitter());
            this.onDidDeleteUntitledWorkspace = this._onDidDeleteUntitledWorkspace.event;
            this._onDidEnterWorkspace = this._register(new event_1.Emitter());
            this.onDidEnterWorkspace = this._onDidEnterWorkspace.event;
        }
        resolveLocalWorkspaceSync(uri) {
            if (!this.isWorkspacePath(uri)) {
                return null; // does not look like a valid workspace config file
            }
            if (uri.scheme !== network_1.Schemas.file) {
                return null;
            }
            let contents;
            try {
                contents = (0, fs_1.readFileSync)(uri.fsPath, 'utf8');
            }
            catch (error) {
                return null; // invalid workspace
            }
            return this.doResolveWorkspace(uri, contents);
        }
        isWorkspacePath(uri) {
            return (0, workspaces_1.isUntitledWorkspace)(uri, this.environmentMainService) || (0, workspaces_1.hasWorkspaceFileExtension)(uri);
        }
        doResolveWorkspace(path, contents) {
            try {
                const workspace = this.doParseStoredWorkspace(path, contents);
                const workspaceIdentifier = getWorkspaceIdentifier(path);
                return {
                    id: workspaceIdentifier.id,
                    configPath: workspaceIdentifier.configPath,
                    folders: (0, workspaces_1.toWorkspaceFolders)(workspace.folders, workspaceIdentifier.configPath, resources_1.extUriBiasedIgnorePathCase),
                    remoteAuthority: workspace.remoteAuthority
                };
            }
            catch (error) {
                this.logService.warn(error.toString());
            }
            return null;
        }
        doParseStoredWorkspace(path, contents) {
            // Parse workspace file
            const storedWorkspace = (0, json_1.parse)(contents); // use fault tolerant parser
            // Filter out folders which do not have a path or uri set
            if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
                storedWorkspace.folders = storedWorkspace.folders.filter(folder => (0, workspaces_1.isStoredWorkspaceFolder)(folder));
            }
            else {
                throw new Error(`${path.toString(true)} looks like an invalid workspace file.`);
            }
            return storedWorkspace;
        }
        async createUntitledWorkspace(folders, remoteAuthority) {
            const { workspace, storedWorkspace } = this.newUntitledWorkspace(folders, remoteAuthority);
            const configPath = workspace.configPath.fsPath;
            await fs_1.promises.mkdir((0, path_1.dirname)(configPath), { recursive: true });
            await (0, pfs_1.writeFile)(configPath, JSON.stringify(storedWorkspace, null, '\t'));
            return workspace;
        }
        createUntitledWorkspaceSync(folders, remoteAuthority) {
            const { workspace, storedWorkspace } = this.newUntitledWorkspace(folders, remoteAuthority);
            const configPath = workspace.configPath.fsPath;
            (0, fs_1.mkdirSync)((0, path_1.dirname)(configPath), { recursive: true });
            (0, pfs_1.writeFileSync)(configPath, JSON.stringify(storedWorkspace, null, '\t'));
            return workspace;
        }
        newUntitledWorkspace(folders = [], remoteAuthority) {
            const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
            const untitledWorkspaceConfigFolder = (0, resources_1.joinPath)(this.untitledWorkspacesHome, randomId);
            const untitledWorkspaceConfigPath = (0, resources_1.joinPath)(untitledWorkspaceConfigFolder, workspaces_1.UNTITLED_WORKSPACE_NAME);
            const storedWorkspaceFolder = [];
            for (const folder of folders) {
                storedWorkspaceFolder.push((0, workspaces_1.getStoredWorkspaceFolder)(folder.uri, true, folder.name, untitledWorkspaceConfigFolder, !platform_1.isWindows, resources_1.extUriBiasedIgnorePathCase));
            }
            return {
                workspace: getWorkspaceIdentifier(untitledWorkspaceConfigPath),
                storedWorkspace: { folders: storedWorkspaceFolder, remoteAuthority }
            };
        }
        async getWorkspaceIdentifier(configPath) {
            return getWorkspaceIdentifier(configPath);
        }
        isUntitledWorkspace(workspace) {
            return (0, workspaces_1.isUntitledWorkspace)(workspace.configPath, this.environmentMainService);
        }
        deleteUntitledWorkspaceSync(workspace) {
            if (!this.isUntitledWorkspace(workspace)) {
                return; // only supported for untitled workspaces
            }
            // Delete from disk
            this.doDeleteUntitledWorkspaceSync(workspace);
            // Event
            this._onDidDeleteUntitledWorkspace.fire(workspace);
        }
        async deleteUntitledWorkspace(workspace) {
            this.deleteUntitledWorkspaceSync(workspace);
        }
        doDeleteUntitledWorkspaceSync(workspace) {
            const configPath = (0, resources_1.originalFSPath)(workspace.configPath);
            try {
                // Delete Workspace
                (0, pfs_1.rimrafSync)((0, path_1.dirname)(configPath));
                // Mark Workspace Storage to be deleted
                const workspaceStoragePath = (0, path_1.join)(this.environmentMainService.workspaceStorageHome.fsPath, workspace.id);
                if ((0, fs_1.existsSync)(workspaceStoragePath)) {
                    (0, pfs_1.writeFileSync)((0, path_1.join)(workspaceStoragePath, 'obsolete'), '');
                }
            }
            catch (error) {
                this.logService.warn(`Unable to delete untitled workspace ${configPath} (${error}).`);
            }
        }
        getUntitledWorkspacesSync() {
            const untitledWorkspaces = [];
            try {
                const untitledWorkspacePaths = (0, pfs_1.readdirSync)(this.untitledWorkspacesHome.fsPath).map(folder => (0, resources_1.joinPath)(this.untitledWorkspacesHome, folder, workspaces_1.UNTITLED_WORKSPACE_NAME));
                for (const untitledWorkspacePath of untitledWorkspacePaths) {
                    const workspace = getWorkspaceIdentifier(untitledWorkspacePath);
                    const resolvedWorkspace = this.resolveLocalWorkspaceSync(untitledWorkspacePath);
                    if (!resolvedWorkspace) {
                        this.doDeleteUntitledWorkspaceSync(workspace);
                    }
                    else {
                        untitledWorkspaces.push({ workspace, remoteAuthority: resolvedWorkspace.remoteAuthority });
                    }
                }
            }
            catch (error) {
                if (error.code !== 'ENOENT') {
                    this.logService.warn(`Unable to read folders in ${this.untitledWorkspacesHome} (${error}).`);
                }
            }
            return untitledWorkspaces;
        }
        async enterWorkspace(window, windows, path) {
            if (!window || !window.win || !window.isReady) {
                return null; // return early if the window is not ready or disposed
            }
            const isValid = await this.isValidTargetWorkspacePath(window, windows, path);
            if (!isValid) {
                return null; // return early if the workspace is not valid
            }
            const result = this.doEnterWorkspace(window, getWorkspaceIdentifier(path));
            if (!result) {
                return null;
            }
            // Emit as event
            this._onDidEnterWorkspace.fire({ window, workspace: result.workspace });
            return result;
        }
        async isValidTargetWorkspacePath(window, windows, workspacePath) {
            if (!workspacePath) {
                return true;
            }
            if ((0, workspaces_1.isWorkspaceIdentifier)(window.openedWorkspace) && resources_1.extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.configPath, workspacePath)) {
                return false; // window is already opened on a workspace with that path
            }
            // Prevent overwriting a workspace that is currently opened in another window
            if ((0, windowsFinder_1.findWindowOnWorkspaceOrFolder)(windows, workspacePath)) {
                const options = {
                    title: this.productService.nameLong,
                    type: 'info',
                    buttons: [(0, nls_1.localize)(0, null)],
                    message: (0, nls_1.localize)(1, null, (0, resources_1.basename)(workspacePath)),
                    detail: (0, nls_1.localize)(2, null),
                    noLink: true
                };
                await this.dialogMainService.showMessageBox(options, (0, types_1.withNullAsUndefined)(electron_1.BrowserWindow.getFocusedWindow()));
                return false;
            }
            return true; // OK
        }
        doEnterWorkspace(window, workspace) {
            if (!window.config) {
                return null;
            }
            window.focus();
            // Register window for backups and migrate current backups over
            let backupPath;
            if (!window.config.extensionDevelopmentPath) {
                backupPath = this.backupMainService.registerWorkspaceBackupSync({ workspace, remoteAuthority: window.remoteAuthority }, window.config.backupPath);
            }
            // if the window was opened on an untitled workspace, delete it.
            if ((0, workspaces_1.isWorkspaceIdentifier)(window.openedWorkspace) && this.isUntitledWorkspace(window.openedWorkspace)) {
                this.deleteUntitledWorkspaceSync(window.openedWorkspace);
            }
            // Update window configuration properly based on transition to workspace
            window.config.workspace = workspace;
            window.config.backupPath = backupPath;
            return { workspace, backupPath };
        }
    };
    WorkspacesManagementMainService = __decorate([
        __param(0, environmentMainService_1.IEnvironmentMainService),
        __param(1, log_1.ILogService),
        __param(2, backup_1.IBackupMainService),
        __param(3, dialogMainService_1.IDialogMainService),
        __param(4, productService_1.IProductService)
    ], WorkspacesManagementMainService);
    exports.WorkspacesManagementMainService = WorkspacesManagementMainService;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function getWorkspaceIdentifier(configPath) {
        function getWorkspaceId() {
            let configPathStr = configPath.scheme === network_1.Schemas.file ? (0, resources_1.originalFSPath)(configPath) : configPath.toString();
            if (!platform_1.isLinux) {
                configPathStr = configPathStr.toLowerCase(); // sanitize for platform file system
            }
            return (0, crypto_1.createHash)('md5').update(configPathStr).digest('hex');
        }
        return {
            id: getWorkspaceId(),
            configPath
        };
    }
    exports.getWorkspaceIdentifier = getWorkspaceIdentifier;
    function getSingleFolderWorkspaceIdentifier(folderUri, folderStat) {
        function getFolderId() {
            // Remote: produce a hash from the entire URI
            if (folderUri.scheme !== network_1.Schemas.file) {
                return (0, crypto_1.createHash)('md5').update(folderUri.toString()).digest('hex');
            }
            // Local: produce a hash from the path and include creation time as salt
            if (!folderStat) {
                try {
                    folderStat = (0, fs_1.statSync)(folderUri.fsPath);
                }
                catch (error) {
                    return undefined; // folder does not exist
                }
            }
            let ctime;
            if (platform_1.isLinux) {
                ctime = folderStat.ino; // Linux: birthtime is ctime, so we cannot use it! We use the ino instead!
            }
            else if (platform_1.isMacintosh) {
                ctime = folderStat.birthtime.getTime(); // macOS: birthtime is fine to use as is
            }
            else if (platform_1.isWindows) {
                if (typeof folderStat.birthtimeMs === 'number') {
                    ctime = Math.floor(folderStat.birthtimeMs); // Windows: fix precision issue in node.js 8.x to get 7.x results (see https://github.com/nodejs/node/issues/19897)
                }
                else {
                    ctime = folderStat.birthtime.getTime();
                }
            }
            // we use the ctime as extra salt to the ID so that we catch the case of a folder getting
            // deleted and recreated. in that case we do not want to carry over previous state
            return (0, crypto_1.createHash)('md5').update(folderUri.fsPath).update(ctime ? String(ctime) : '').digest('hex');
        }
        const folderId = getFolderId();
        if (typeof folderId === 'string') {
            return {
                id: folderId,
                uri: folderUri
            };
        }
        return undefined; // invalid folder
    }
    exports.getSingleFolderWorkspaceIdentifier = getSingleFolderWorkspaceIdentifier;
});
//# sourceMappingURL=workspacesManagementMainService.js.map