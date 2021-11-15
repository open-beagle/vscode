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
define(["require", "exports", "vs/base/common/actions", "vs/nls!vs/workbench/browser/actions/workspaceActions", "vs/platform/workspace/common/workspace", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/workbench/browser/actions/workspaceCommands", "vs/platform/dialogs/common/dialogs", "vs/platform/actions/common/actions", "vs/workbench/browser/contextkeys", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/actions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/base/common/keyCodes", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/contextkey/common/contextkeys"], function (require, exports, actions_1, nls_1, workspace_1, workspaceEditing_1, editorService_1, commands_1, workspaceCommands_1, dialogs_1, actions_2, contextkeys_1, instantiation_1, platform_1, actions_3, notification_1, host_1, keyCodes_1, contextkey_1, environmentService_1, workspaces_1, workspaceTrust_1, contextkeys_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DuplicateWorkspaceInNewWindowAction = exports.SaveWorkspaceAsAction = exports.GlobalRemoveRootFolderAction = exports.AddRootFolderAction = exports.OpenWorkspaceConfigFileAction = exports.CloseWorkspaceAction = exports.OpenWorkspaceAction = exports.OpenFileFolderAction = exports.OpenFolderAction = exports.OpenFileAction = void 0;
    let OpenFileAction = class OpenFileAction extends actions_1.Action {
        constructor(id, label, dialogService) {
            super(id, label);
            this.dialogService = dialogService;
        }
        run(event, data) {
            return this.dialogService.pickFileAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    };
    OpenFileAction.ID = 'workbench.action.files.openFile';
    OpenFileAction.LABEL = (0, nls_1.localize)(0, null);
    OpenFileAction = __decorate([
        __param(2, dialogs_1.IFileDialogService)
    ], OpenFileAction);
    exports.OpenFileAction = OpenFileAction;
    let OpenFolderAction = class OpenFolderAction extends actions_1.Action {
        constructor(id, label, dialogService) {
            super(id, label);
            this.dialogService = dialogService;
        }
        run(event, data) {
            return this.dialogService.pickFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    };
    OpenFolderAction.ID = 'workbench.action.files.openFolder';
    OpenFolderAction.LABEL = (0, nls_1.localize)(1, null);
    OpenFolderAction = __decorate([
        __param(2, dialogs_1.IFileDialogService)
    ], OpenFolderAction);
    exports.OpenFolderAction = OpenFolderAction;
    let OpenFileFolderAction = class OpenFileFolderAction extends actions_1.Action {
        constructor(id, label, dialogService) {
            super(id, label);
            this.dialogService = dialogService;
        }
        run(event, data) {
            return this.dialogService.pickFileFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
        }
    };
    OpenFileFolderAction.ID = 'workbench.action.files.openFileFolder';
    OpenFileFolderAction.LABEL = (0, nls_1.localize)(2, null);
    OpenFileFolderAction = __decorate([
        __param(2, dialogs_1.IFileDialogService)
    ], OpenFileFolderAction);
    exports.OpenFileFolderAction = OpenFileFolderAction;
    let OpenWorkspaceAction = class OpenWorkspaceAction extends actions_1.Action {
        constructor(id, label, dialogService) {
            super(id, label);
            this.dialogService = dialogService;
        }
        run(event, data) {
            return this.dialogService.pickWorkspaceAndOpen({ telemetryExtraData: data });
        }
    };
    OpenWorkspaceAction.ID = 'workbench.action.openWorkspace';
    OpenWorkspaceAction.LABEL = (0, nls_1.localize)(3, null);
    OpenWorkspaceAction = __decorate([
        __param(2, dialogs_1.IFileDialogService)
    ], OpenWorkspaceAction);
    exports.OpenWorkspaceAction = OpenWorkspaceAction;
    let CloseWorkspaceAction = class CloseWorkspaceAction extends actions_1.Action {
        constructor(id, label, contextService, notificationService, hostService, environmentService) {
            super(id, label);
            this.contextService = contextService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            this.environmentService = environmentService;
        }
        async run() {
            if (this.contextService.getWorkbenchState() === 1 /* EMPTY */) {
                this.notificationService.info((0, nls_1.localize)(5, null));
                return;
            }
            return this.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: this.environmentService.remoteAuthority });
        }
    };
    CloseWorkspaceAction.ID = 'workbench.action.closeFolder';
    CloseWorkspaceAction.LABEL = (0, nls_1.localize)(4, null);
    CloseWorkspaceAction = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, notification_1.INotificationService),
        __param(4, host_1.IHostService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService)
    ], CloseWorkspaceAction);
    exports.CloseWorkspaceAction = CloseWorkspaceAction;
    let OpenWorkspaceConfigFileAction = class OpenWorkspaceConfigFileAction extends actions_1.Action {
        constructor(id, label, workspaceContextService, editorService) {
            super(id, label);
            this.workspaceContextService = workspaceContextService;
            this.editorService = editorService;
            this.enabled = !!this.workspaceContextService.getWorkspace().configuration;
        }
        async run() {
            const configuration = this.workspaceContextService.getWorkspace().configuration;
            if (configuration) {
                await this.editorService.openEditor({ resource: configuration, options: { pinned: true } });
            }
        }
    };
    OpenWorkspaceConfigFileAction.ID = 'workbench.action.openWorkspaceConfigFile';
    OpenWorkspaceConfigFileAction.LABEL = (0, nls_1.localize)(6, null);
    OpenWorkspaceConfigFileAction = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, editorService_1.IEditorService)
    ], OpenWorkspaceConfigFileAction);
    exports.OpenWorkspaceConfigFileAction = OpenWorkspaceConfigFileAction;
    let AddRootFolderAction = class AddRootFolderAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label);
            this.commandService = commandService;
        }
        run() {
            return this.commandService.executeCommand(workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID);
        }
    };
    AddRootFolderAction.ID = 'workbench.action.addRootFolder';
    AddRootFolderAction.LABEL = workspaceCommands_1.ADD_ROOT_FOLDER_LABEL;
    AddRootFolderAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], AddRootFolderAction);
    exports.AddRootFolderAction = AddRootFolderAction;
    let GlobalRemoveRootFolderAction = class GlobalRemoveRootFolderAction extends actions_1.Action {
        constructor(id, label, workspaceEditingService, contextService, commandService) {
            super(id, label);
            this.workspaceEditingService = workspaceEditingService;
            this.contextService = contextService;
            this.commandService = commandService;
        }
        async run() {
            const state = this.contextService.getWorkbenchState();
            // Workspace / Folder
            if (state === 3 /* WORKSPACE */ || state === 2 /* FOLDER */) {
                const folder = await this.commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
                if (folder) {
                    await this.workspaceEditingService.removeFolders([folder.uri]);
                }
            }
        }
    };
    GlobalRemoveRootFolderAction.ID = 'workbench.action.removeRootFolder';
    GlobalRemoveRootFolderAction.LABEL = (0, nls_1.localize)(7, null);
    GlobalRemoveRootFolderAction = __decorate([
        __param(2, workspaceEditing_1.IWorkspaceEditingService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, commands_1.ICommandService)
    ], GlobalRemoveRootFolderAction);
    exports.GlobalRemoveRootFolderAction = GlobalRemoveRootFolderAction;
    let SaveWorkspaceAsAction = class SaveWorkspaceAsAction extends actions_1.Action {
        constructor(id, label, contextService, workspaceEditingService) {
            super(id, label);
            this.contextService = contextService;
            this.workspaceEditingService = workspaceEditingService;
        }
        async run() {
            const configPathUri = await this.workspaceEditingService.pickNewWorkspacePath();
            if (configPathUri && (0, workspaces_1.hasWorkspaceFileExtension)(configPathUri)) {
                switch (this.contextService.getWorkbenchState()) {
                    case 1 /* EMPTY */:
                    case 2 /* FOLDER */:
                        const folders = this.contextService.getWorkspace().folders.map(folder => ({ uri: folder.uri }));
                        return this.workspaceEditingService.createAndEnterWorkspace(folders, configPathUri);
                    case 3 /* WORKSPACE */:
                        return this.workspaceEditingService.saveAndEnterWorkspace(configPathUri);
                }
            }
        }
    };
    SaveWorkspaceAsAction.ID = 'workbench.action.saveWorkspaceAs';
    SaveWorkspaceAsAction.LABEL = (0, nls_1.localize)(8, null);
    SaveWorkspaceAsAction = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, workspaceEditing_1.IWorkspaceEditingService)
    ], SaveWorkspaceAsAction);
    exports.SaveWorkspaceAsAction = SaveWorkspaceAsAction;
    let DuplicateWorkspaceInNewWindowAction = class DuplicateWorkspaceInNewWindowAction extends actions_1.Action {
        constructor(id, label, workspaceContextService, workspaceEditingService, hostService, workspacesService, environmentService) {
            super(id, label);
            this.workspaceContextService = workspaceContextService;
            this.workspaceEditingService = workspaceEditingService;
            this.hostService = hostService;
            this.workspacesService = workspacesService;
            this.environmentService = environmentService;
        }
        async run() {
            const folders = this.workspaceContextService.getWorkspace().folders;
            const remoteAuthority = this.environmentService.remoteAuthority;
            const newWorkspace = await this.workspacesService.createUntitledWorkspace(folders, remoteAuthority);
            await this.workspaceEditingService.copyWorkspaceSettings(newWorkspace);
            return this.hostService.openWindow([{ workspaceUri: newWorkspace.configPath }], { forceNewWindow: true });
        }
    };
    DuplicateWorkspaceInNewWindowAction.ID = 'workbench.action.duplicateWorkspaceInNewWindow';
    DuplicateWorkspaceInNewWindowAction.LABEL = (0, nls_1.localize)(9, null);
    DuplicateWorkspaceInNewWindowAction = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, workspaceEditing_1.IWorkspaceEditingService),
        __param(4, host_1.IHostService),
        __param(5, workspaces_1.IWorkspacesService),
        __param(6, environmentService_1.IWorkbenchEnvironmentService)
    ], DuplicateWorkspaceInNewWindowAction);
    exports.DuplicateWorkspaceInNewWindowAction = DuplicateWorkspaceInNewWindowAction;
    class WorkspaceTrustManageAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.manageTrust',
                title: { value: (0, nls_1.localize)(10, null), original: 'Manage Workspace Trust' },
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_2.IsWebContext.negate(), contextkey_1.ContextKeyExpr.equals(`config.${workspaceTrust_1.WORKSPACE_TRUST_ENABLED}`, true)),
                category: (0, nls_1.localize)(11, null),
                f1: true
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            await commandService.executeCommand('workbench.trust.manage');
        }
    }
    (0, actions_2.registerAction2)(WorkspaceTrustManageAction);
    // --- Actions Registration
    const registry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    const workspacesCategory = (0, nls_1.localize)(12, null);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(AddRootFolderAction), 'Workspaces: Add Folder to Workspace...', workspacesCategory);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(GlobalRemoveRootFolderAction), 'Workspaces: Remove Folder from Workspace...', workspacesCategory);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(CloseWorkspaceAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 36 /* KEY_F */) }), 'Workspaces: Close Workspace', workspacesCategory, contextkeys_1.EmptyWorkspaceSupportContext);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(SaveWorkspaceAsAction), 'Workspaces: Save Workspace As...', workspacesCategory, contextkeys_1.EmptyWorkspaceSupportContext);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(DuplicateWorkspaceInNewWindowAction), 'Workspaces: Duplicate As Workspace in New Window', workspacesCategory);
    // --- Menu Registration
    commands_1.CommandsRegistry.registerCommand(OpenWorkspaceConfigFileAction.ID, serviceAccessor => {
        serviceAccessor.get(instantiation_1.IInstantiationService).createInstance(OpenWorkspaceConfigFileAction, OpenWorkspaceConfigFileAction.ID, OpenWorkspaceConfigFileAction.LABEL).run();
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID,
            title: (0, nls_1.localize)(13, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarFileMenu, {
        group: '3_workspace',
        command: {
            id: SaveWorkspaceAsAction.ID,
            title: (0, nls_1.localize)(14, null)
        },
        order: 2,
        when: contextkeys_1.EmptyWorkspaceSupportContext
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
        command: {
            id: OpenWorkspaceConfigFileAction.ID,
            title: { value: `${workspacesCategory}: ${OpenWorkspaceConfigFileAction.LABEL}`, original: 'Workspaces: Open Workspace Configuration File' },
        },
        when: contextkeys_1.WorkbenchStateContext.isEqualTo('workspace')
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: CloseWorkspaceAction.ID,
            title: (0, nls_1.localize)(15, null),
            precondition: contextkeys_1.WorkspaceFolderCountContext.notEqualsTo('0')
        },
        order: 3,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_1.EmptyWorkspaceSupportContext)
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: CloseWorkspaceAction.ID,
            title: (0, nls_1.localize)(16, null)
        },
        order: 3,
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkeys_1.EmptyWorkspaceSupportContext)
    });
});
//# sourceMappingURL=workspaceActions.js.map