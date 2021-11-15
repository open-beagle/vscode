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
define(["require", "exports", "vs/nls!vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/base/common/resources", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/platform/configuration/common/configuration", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/host/browser/host", "vs/base/common/network", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspaceTrust"], function (require, exports, nls_1, workspace_1, jsonEditing_1, workspaces_1, configurationRegistry_1, platform_1, commands_1, arrays_1, resources_1, notification_1, files_1, environmentService_1, dialogs_1, labels_1, configuration_1, textfiles_1, host_1, network_1, uriIdentity_1, workspaceTrust_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractWorkspaceEditingService = void 0;
    const UNTITLED_WORKSPACE_FILENAME = `workspace.${workspaces_1.WORKSPACE_EXTENSION}`;
    let AbstractWorkspaceEditingService = class AbstractWorkspaceEditingService {
        constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService) {
            this.jsonEditingService = jsonEditingService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.commandService = commandService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.workspacesService = workspacesService;
            this.environmentService = environmentService;
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.hostService = hostService;
            this.uriIdentityService = uriIdentityService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
        }
        async pickNewWorkspacePath() {
            let workspacePath = await this.fileDialogService.showSaveDialog({
                saveLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)(0, null)),
                title: (0, nls_1.localize)(1, null),
                filters: workspaces_1.WORKSPACE_FILTER,
                defaultUri: await this.fileDialogService.defaultWorkspacePath(undefined, UNTITLED_WORKSPACE_FILENAME)
            });
            if (!workspacePath) {
                return; // canceled
            }
            if (!(0, workspaces_1.hasWorkspaceFileExtension)(workspacePath)) {
                // Always ensure we have workspace file extension
                // (see https://github.com/microsoft/vscode/issues/84818)
                workspacePath = workspacePath.with({ path: `${workspacePath.path}.${workspaces_1.WORKSPACE_EXTENSION}` });
            }
            return workspacePath;
        }
        updateFolders(index, deleteCount, foldersToAdd, donotNotifyError) {
            const folders = this.contextService.getWorkspace().folders;
            let foldersToDelete = [];
            if (typeof deleteCount === 'number') {
                foldersToDelete = folders.slice(index, index + deleteCount).map(f => f.uri);
            }
            const wantsToDelete = foldersToDelete.length > 0;
            const wantsToAdd = Array.isArray(foldersToAdd) && foldersToAdd.length > 0;
            if (!wantsToAdd && !wantsToDelete) {
                return Promise.resolve(); // return early if there is nothing to do
            }
            // Add Folders
            if (wantsToAdd && !wantsToDelete && Array.isArray(foldersToAdd)) {
                return this.doAddFolders(foldersToAdd, index, donotNotifyError);
            }
            // Delete Folders
            if (wantsToDelete && !wantsToAdd) {
                return this.removeFolders(foldersToDelete);
            }
            // Add & Delete Folders
            else {
                // if we are in single-folder state and the folder is replaced with
                // other folders, we handle this specially and just enter workspace
                // mode with the folders that are being added.
                if (this.includesSingleFolderWorkspace(foldersToDelete)) {
                    return this.createAndEnterWorkspace(foldersToAdd);
                }
                // if we are not in workspace-state, we just add the folders
                if (this.contextService.getWorkbenchState() !== 3 /* WORKSPACE */) {
                    return this.doAddFolders(foldersToAdd, index, donotNotifyError);
                }
                // finally, update folders within the workspace
                return this.doUpdateFolders(foldersToAdd, foldersToDelete, index, donotNotifyError);
            }
        }
        async doUpdateFolders(foldersToAdd, foldersToDelete, index, donotNotifyError = false) {
            try {
                await this.contextService.updateFolders(foldersToAdd, foldersToDelete, index);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.handleWorkspaceConfigurationEditingError(error);
            }
        }
        addFolders(foldersToAdd, donotNotifyError = false) {
            return this.doAddFolders(foldersToAdd, undefined, donotNotifyError);
        }
        async doAddFolders(foldersToAdd, index, donotNotifyError = false) {
            const state = this.contextService.getWorkbenchState();
            const remoteAuthority = this.environmentService.remoteAuthority;
            if (remoteAuthority) {
                // https://github.com/microsoft/vscode/issues/94191
                foldersToAdd = foldersToAdd.filter(f => f.uri.scheme !== network_1.Schemas.file && (f.uri.scheme !== network_1.Schemas.vscodeRemote || (0, resources_1.isEqualAuthority)(f.uri.authority, remoteAuthority)));
            }
            // If we are in no-workspace or single-folder workspace, adding folders has to
            // enter a workspace.
            if (state !== 3 /* WORKSPACE */) {
                let newWorkspaceFolders = this.contextService.getWorkspace().folders.map(folder => ({ uri: folder.uri }));
                newWorkspaceFolders.splice(typeof index === 'number' ? index : newWorkspaceFolders.length, 0, ...foldersToAdd);
                newWorkspaceFolders = (0, arrays_1.distinct)(newWorkspaceFolders, folder => this.uriIdentityService.extUri.getComparisonKey(folder.uri));
                if (state === 1 /* EMPTY */ && newWorkspaceFolders.length === 0 || state === 2 /* FOLDER */ && newWorkspaceFolders.length === 1) {
                    return; // return if the operation is a no-op for the current state
                }
                return this.createAndEnterWorkspace(newWorkspaceFolders);
            }
            // Delegate addition of folders to workspace service otherwise
            try {
                await this.contextService.addFolders(foldersToAdd, index);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.handleWorkspaceConfigurationEditingError(error);
            }
        }
        async removeFolders(foldersToRemove, donotNotifyError = false) {
            // If we are in single-folder state and the opened folder is to be removed,
            // we create an empty workspace and enter it.
            if (this.includesSingleFolderWorkspace(foldersToRemove)) {
                return this.createAndEnterWorkspace([]);
            }
            // Delegate removal of folders to workspace service otherwise
            try {
                await this.contextService.removeFolders(foldersToRemove);
            }
            catch (error) {
                if (donotNotifyError) {
                    throw error;
                }
                this.handleWorkspaceConfigurationEditingError(error);
            }
        }
        includesSingleFolderWorkspace(folders) {
            if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
                const workspaceFolder = this.contextService.getWorkspace().folders[0];
                return (folders.some(folder => this.uriIdentityService.extUri.isEqual(folder, workspaceFolder.uri)));
            }
            return false;
        }
        async createAndEnterWorkspace(folders, path) {
            if (path && !await this.isValidTargetWorkspacePath(path)) {
                return;
            }
            const remoteAuthority = this.environmentService.remoteAuthority;
            const untitledWorkspace = await this.workspacesService.createUntitledWorkspace(folders, remoteAuthority);
            if (path) {
                try {
                    await this.saveWorkspaceAs(untitledWorkspace, path);
                }
                finally {
                    await this.workspacesService.deleteUntitledWorkspace(untitledWorkspace); // https://github.com/microsoft/vscode/issues/100276
                }
            }
            else {
                path = untitledWorkspace.configPath;
            }
            return this.enterWorkspace(path);
        }
        async saveAndEnterWorkspace(path) {
            const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
            if (!workspaceIdentifier) {
                return;
            }
            // Allow to save the workspace of the current window
            // if we have an identical match on the path
            if ((0, resources_1.isEqual)(workspaceIdentifier.configPath, path)) {
                return this.saveWorkspace(workspaceIdentifier);
            }
            // From this moment on we require a valid target that is not opened already
            if (!await this.isValidTargetWorkspacePath(path)) {
                return;
            }
            await this.saveWorkspaceAs(workspaceIdentifier, path);
            return this.enterWorkspace(path);
        }
        async isValidTargetWorkspacePath(path) {
            return true; // OK
        }
        async saveWorkspaceAs(workspace, targetConfigPathURI) {
            const configPathURI = workspace.configPath;
            // Return early if target is same as source
            if (this.uriIdentityService.extUri.isEqual(configPathURI, targetConfigPathURI)) {
                return;
            }
            const isFromUntitledWorkspace = (0, workspaces_1.isUntitledWorkspace)(configPathURI, this.environmentService);
            // Read the contents of the workspace file, update it to new location and save it.
            const raw = await this.fileService.readFile(configPathURI);
            const newRawWorkspaceContents = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(raw.value.toString(), configPathURI, isFromUntitledWorkspace, targetConfigPathURI, this.uriIdentityService.extUri);
            await this.textFileService.create([{ resource: targetConfigPathURI, value: newRawWorkspaceContents, options: { overwrite: true } }]);
            // Set trust for the workspace file
            this.trustWorkspaceConfiguration(targetConfigPathURI);
        }
        async saveWorkspace(workspace) {
            const configPathURI = workspace.configPath;
            // First: try to save any existing model as it could be dirty
            const existingModel = this.textFileService.files.get(configPathURI);
            if (existingModel) {
                await existingModel.save({ force: true, reason: 1 /* EXPLICIT */ });
                return;
            }
            // Second: if the file exists on disk, simply return
            const workspaceFileExists = await this.fileService.exists(configPathURI);
            if (workspaceFileExists) {
                return;
            }
            // Finally, we need to re-create the file as it was deleted
            const newWorkspace = { folders: [] };
            const newRawWorkspaceContents = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(JSON.stringify(newWorkspace, null, '\t'), configPathURI, false, configPathURI, this.uriIdentityService.extUri);
            await this.textFileService.create([{ resource: configPathURI, value: newRawWorkspaceContents }]);
        }
        handleWorkspaceConfigurationEditingError(error) {
            switch (error.code) {
                case 1 /* ERROR_INVALID_FILE */:
                    this.onInvalidWorkspaceConfigurationFileError();
                    break;
                case 0 /* ERROR_FILE_DIRTY */:
                    this.onWorkspaceConfigurationFileDirtyError();
                    break;
                default:
                    this.notificationService.error(error.message);
            }
        }
        onInvalidWorkspaceConfigurationFileError() {
            const message = (0, nls_1.localize)(2, null);
            this.askToOpenWorkspaceConfigurationFile(message);
        }
        onWorkspaceConfigurationFileDirtyError() {
            const message = (0, nls_1.localize)(3, null);
            this.askToOpenWorkspaceConfigurationFile(message);
        }
        askToOpenWorkspaceConfigurationFile(message) {
            this.notificationService.prompt(notification_1.Severity.Error, message, [{
                    label: (0, nls_1.localize)(4, null),
                    run: () => this.commandService.executeCommand('workbench.action.openWorkspaceConfigFile')
                }]);
        }
        async doEnterWorkspace(path) {
            if (!!this.environmentService.extensionTestsLocationURI) {
                throw new Error('Entering a new workspace is not possible in tests.');
            }
            const workspace = await this.workspacesService.getWorkspaceIdentifier(path);
            // Settings migration (only if we come from a folder workspace)
            if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
                await this.migrateWorkspaceSettings(workspace);
            }
            const workspaceImpl = this.contextService;
            await workspaceImpl.initialize(workspace);
            return this.workspacesService.enterWorkspace(path);
        }
        migrateWorkspaceSettings(toWorkspace) {
            return this.doCopyWorkspaceSettings(toWorkspace, setting => setting.scope === 3 /* WINDOW */);
        }
        copyWorkspaceSettings(toWorkspace) {
            return this.doCopyWorkspaceSettings(toWorkspace);
        }
        doCopyWorkspaceSettings(toWorkspace, filter) {
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const targetWorkspaceConfiguration = {};
            for (const key of this.configurationService.keys().workspace) {
                if (configurationProperties[key]) {
                    if (filter && !filter(configurationProperties[key])) {
                        continue;
                    }
                    targetWorkspaceConfiguration[key] = this.configurationService.inspect(key).workspaceValue;
                }
            }
            return this.jsonEditingService.write(toWorkspace.configPath, [{ path: ['settings'], value: targetWorkspaceConfiguration }], true);
        }
        trustWorkspaceConfiguration(configPathURI) {
            if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ && this.workspaceTrustManagementService.isWorkpaceTrusted()) {
                this.workspaceTrustManagementService.setFoldersTrust([(0, resources_1.dirname)(configPathURI)], true);
            }
        }
        getCurrentWorkspaceIdentifier() {
            const workspace = this.contextService.getWorkspace();
            if (workspace === null || workspace === void 0 ? void 0 : workspace.configuration) {
                return { id: workspace.id, configPath: workspace.configuration };
            }
            return undefined;
        }
    };
    AbstractWorkspaceEditingService = __decorate([
        __param(0, jsonEditing_1.IJSONEditingService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, notification_1.INotificationService),
        __param(4, commands_1.ICommandService),
        __param(5, files_1.IFileService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, workspaces_1.IWorkspacesService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, dialogs_1.IFileDialogService),
        __param(10, dialogs_1.IDialogService),
        __param(11, host_1.IHostService),
        __param(12, uriIdentity_1.IUriIdentityService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], AbstractWorkspaceEditingService);
    exports.AbstractWorkspaceEditingService = AbstractWorkspaceEditingService;
});
//# sourceMappingURL=abstractWorkspaceEditingService.js.map