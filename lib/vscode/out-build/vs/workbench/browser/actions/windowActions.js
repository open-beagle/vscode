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
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/windowActions", "vs/base/common/actions", "vs/platform/dialogs/common/dialogs", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "vs/workbench/browser/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/workbench/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/platform/label/common/label", "vs/platform/keybinding/common/keybinding", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/platform/workspaces/common/workspaces", "vs/base/common/uri", "vs/editor/common/services/getIconClasses", "vs/platform/files/common/files", "vs/base/common/labels", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/quickaccess", "vs/workbench/services/host/browser/host", "vs/base/common/map", "vs/base/common/codicons", "vs/base/browser/dom", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration"], function (require, exports, nls_1, actions_1, dialogs_1, actions_2, platform_1, contextkeys_1, contextkeys_2, actions_3, keybindingsRegistry_1, quickInput_1, workspace_1, label_1, keybinding_1, modelService_1, modeService_1, workspaces_1, uri_1, getIconClasses_1, files_1, labels_1, platform_2, contextkey_1, quickaccess_1, host_1, map_1, codicons_1, dom_1, commands_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NewWindowAction = exports.ReloadWindowAction = exports.OpenRecentAction = exports.inRecentFilesPickerContextKey = void 0;
    exports.inRecentFilesPickerContextKey = 'inRecentFilesPicker';
    class BaseOpenRecentAction extends actions_1.Action {
        constructor(id, label, workspacesService, quickInputService, contextService, labelService, keybindingService, modelService, modeService, hostService, dialogService) {
            super(id, label);
            this.workspacesService = workspacesService;
            this.quickInputService = quickInputService;
            this.contextService = contextService;
            this.labelService = labelService;
            this.keybindingService = keybindingService;
            this.modelService = modelService;
            this.modeService = modeService;
            this.hostService = hostService;
            this.dialogService = dialogService;
            this.removeFromRecentlyOpened = {
                iconClass: codicons_1.Codicon.removeClose.classNames,
                tooltip: (0, nls_1.localize)(0, null)
            };
            this.dirtyRecentlyOpenedFolder = {
                iconClass: 'dirty-workspace ' + codicons_1.Codicon.closeDirty.classNames,
                tooltip: (0, nls_1.localize)(1, null),
                alwaysVisible: true
            };
            this.dirtyRecentlyOpenedWorkspace = Object.assign(Object.assign({}, this.dirtyRecentlyOpenedFolder), { tooltip: (0, nls_1.localize)(2, null) });
        }
        async run() {
            const recentlyOpened = await this.workspacesService.getRecentlyOpened();
            const dirtyWorkspacesAndFolders = await this.workspacesService.getDirtyWorkspaces();
            let hasWorkspaces = false;
            // Identify all folders and workspaces with unsaved files
            const dirtyFolders = new map_1.ResourceMap();
            const dirtyWorkspaces = new map_1.ResourceMap();
            for (const dirtyWorkspace of dirtyWorkspacesAndFolders) {
                if (uri_1.URI.isUri(dirtyWorkspace)) {
                    dirtyFolders.set(dirtyWorkspace, true);
                }
                else {
                    dirtyWorkspaces.set(dirtyWorkspace.configPath, dirtyWorkspace);
                    hasWorkspaces = true;
                }
            }
            // Identify all recently opened folders and workspaces
            const recentFolders = new map_1.ResourceMap();
            const recentWorkspaces = new map_1.ResourceMap();
            for (const recent of recentlyOpened.workspaces) {
                if ((0, workspaces_1.isRecentFolder)(recent)) {
                    recentFolders.set(recent.folderUri, true);
                }
                else {
                    recentWorkspaces.set(recent.workspace.configPath, recent.workspace);
                    hasWorkspaces = true;
                }
            }
            // Fill in all known recently opened workspaces
            const workspacePicks = [];
            for (const recent of recentlyOpened.workspaces) {
                const isDirty = (0, workspaces_1.isRecentFolder)(recent) ? dirtyFolders.has(recent.folderUri) : dirtyWorkspaces.has(recent.workspace.configPath);
                workspacePicks.push(this.toQuickPick(recent, isDirty));
            }
            // Fill any backup workspace that is not yet shown at the end
            for (const dirtyWorkspaceOrFolder of dirtyWorkspacesAndFolders) {
                if (uri_1.URI.isUri(dirtyWorkspaceOrFolder) && !recentFolders.has(dirtyWorkspaceOrFolder)) {
                    workspacePicks.push(this.toQuickPick({ folderUri: dirtyWorkspaceOrFolder }, true));
                }
                else if ((0, workspaces_1.isWorkspaceIdentifier)(dirtyWorkspaceOrFolder) && !recentWorkspaces.has(dirtyWorkspaceOrFolder.configPath)) {
                    workspacePicks.push(this.toQuickPick({ workspace: dirtyWorkspaceOrFolder }, true));
                }
            }
            const filePicks = recentlyOpened.files.map(p => this.toQuickPick(p, false));
            // focus second entry if the first recent workspace is the current workspace
            const firstEntry = recentlyOpened.workspaces[0];
            const autoFocusSecondEntry = firstEntry && this.contextService.isCurrentWorkspace((0, workspaces_1.isRecentWorkspace)(firstEntry) ? firstEntry.workspace : firstEntry.folderUri);
            let keyMods;
            const workspaceSeparator = { type: 'separator', label: hasWorkspaces ? (0, nls_1.localize)(3, null) : (0, nls_1.localize)(4, null) };
            const fileSeparator = { type: 'separator', label: (0, nls_1.localize)(5, null) };
            const picks = [workspaceSeparator, ...workspacePicks, fileSeparator, ...filePicks];
            const pick = await this.quickInputService.pick(picks, {
                contextKey: exports.inRecentFilesPickerContextKey,
                activeItem: [...workspacePicks, ...filePicks][autoFocusSecondEntry ? 1 : 0],
                placeHolder: platform_2.isMacintosh ? (0, nls_1.localize)(6, null) : (0, nls_1.localize)(7, null),
                matchOnDescription: true,
                onKeyMods: mods => keyMods = mods,
                quickNavigate: this.isQuickNavigate() ? { keybindings: this.keybindingService.lookupKeybindings(this.id) } : undefined,
                onDidTriggerItemButton: async (context) => {
                    // Remove
                    if (context.button === this.removeFromRecentlyOpened) {
                        await this.workspacesService.removeRecentlyOpened([context.item.resource]);
                        context.removeItem();
                    }
                    // Dirty Folder/Workspace
                    else if (context.button === this.dirtyRecentlyOpenedFolder || context.button === this.dirtyRecentlyOpenedWorkspace) {
                        const isDirtyWorkspace = context.button === this.dirtyRecentlyOpenedWorkspace;
                        const result = await this.dialogService.confirm({
                            type: 'question',
                            title: isDirtyWorkspace ? (0, nls_1.localize)(8, null) : (0, nls_1.localize)(9, null),
                            message: isDirtyWorkspace ? (0, nls_1.localize)(10, null) : (0, nls_1.localize)(11, null),
                            detail: isDirtyWorkspace ? (0, nls_1.localize)(12, null) : (0, nls_1.localize)(13, null)
                        });
                        if (result.confirmed) {
                            this.hostService.openWindow([context.item.openable]);
                            this.quickInputService.cancel();
                        }
                    }
                }
            });
            if (pick) {
                return this.hostService.openWindow([pick.openable], { forceNewWindow: keyMods === null || keyMods === void 0 ? void 0 : keyMods.ctrlCmd, forceReuseWindow: keyMods === null || keyMods === void 0 ? void 0 : keyMods.alt });
            }
        }
        toQuickPick(recent, isDirty) {
            let openable;
            let iconClasses;
            let fullLabel;
            let resource;
            let isWorkspace = false;
            // Folder
            if ((0, workspaces_1.isRecentFolder)(recent)) {
                resource = recent.folderUri;
                iconClasses = (0, getIconClasses_1.getIconClasses)(this.modelService, this.modeService, resource, files_1.FileKind.FOLDER);
                openable = { folderUri: resource };
                fullLabel = recent.label || this.labelService.getWorkspaceLabel(resource, { verbose: true });
            }
            // Workspace
            else if ((0, workspaces_1.isRecentWorkspace)(recent)) {
                resource = recent.workspace.configPath;
                iconClasses = (0, getIconClasses_1.getIconClasses)(this.modelService, this.modeService, resource, files_1.FileKind.ROOT_FOLDER);
                openable = { workspaceUri: resource };
                fullLabel = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: true });
                isWorkspace = true;
            }
            // File
            else {
                resource = recent.fileUri;
                iconClasses = (0, getIconClasses_1.getIconClasses)(this.modelService, this.modeService, resource, files_1.FileKind.FILE);
                openable = { fileUri: resource };
                fullLabel = recent.label || this.labelService.getUriLabel(resource);
            }
            const { name, parentPath } = (0, labels_1.splitName)(fullLabel);
            return {
                iconClasses,
                label: name,
                ariaLabel: isDirty ? isWorkspace ? (0, nls_1.localize)(14, null, name) : (0, nls_1.localize)(15, null, name) : name,
                description: parentPath,
                buttons: isDirty ? [isWorkspace ? this.dirtyRecentlyOpenedWorkspace : this.dirtyRecentlyOpenedFolder] : [this.removeFromRecentlyOpened],
                openable,
                resource
            };
        }
    }
    let OpenRecentAction = class OpenRecentAction extends BaseOpenRecentAction {
        constructor(id, label, workspacesService, quickInputService, contextService, keybindingService, modelService, modeService, labelService, hostService, dialogService) {
            super(id, label, workspacesService, quickInputService, contextService, labelService, keybindingService, modelService, modeService, hostService, dialogService);
        }
        isQuickNavigate() {
            return false;
        }
    };
    OpenRecentAction.ID = 'workbench.action.openRecent';
    OpenRecentAction.LABEL = (0, nls_1.localize)(16, null);
    OpenRecentAction = __decorate([
        __param(2, workspaces_1.IWorkspacesService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, modelService_1.IModelService),
        __param(7, modeService_1.IModeService),
        __param(8, label_1.ILabelService),
        __param(9, host_1.IHostService),
        __param(10, dialogs_1.IDialogService)
    ], OpenRecentAction);
    exports.OpenRecentAction = OpenRecentAction;
    let QuickPickRecentAction = class QuickPickRecentAction extends BaseOpenRecentAction {
        constructor(id, label, workspacesService, quickInputService, contextService, keybindingService, modelService, modeService, labelService, hostService, dialogService) {
            super(id, label, workspacesService, quickInputService, contextService, labelService, keybindingService, modelService, modeService, hostService, dialogService);
        }
        isQuickNavigate() {
            return true;
        }
    };
    QuickPickRecentAction.ID = 'workbench.action.quickOpenRecent';
    QuickPickRecentAction.LABEL = (0, nls_1.localize)(17, null);
    QuickPickRecentAction = __decorate([
        __param(2, workspaces_1.IWorkspacesService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, modelService_1.IModelService),
        __param(7, modeService_1.IModeService),
        __param(8, label_1.ILabelService),
        __param(9, host_1.IHostService),
        __param(10, dialogs_1.IDialogService)
    ], QuickPickRecentAction);
    let ToggleFullScreenAction = class ToggleFullScreenAction extends actions_1.Action {
        constructor(id, label, hostService) {
            super(id, label);
            this.hostService = hostService;
        }
        run() {
            return this.hostService.toggleFullScreen();
        }
    };
    ToggleFullScreenAction.ID = 'workbench.action.toggleFullScreen';
    ToggleFullScreenAction.LABEL = (0, nls_1.localize)(18, null);
    ToggleFullScreenAction = __decorate([
        __param(2, host_1.IHostService)
    ], ToggleFullScreenAction);
    let ReloadWindowAction = class ReloadWindowAction extends actions_1.Action {
        constructor(id, label, hostService) {
            super(id, label);
            this.hostService = hostService;
        }
        async run() {
            await this.hostService.reload();
        }
    };
    ReloadWindowAction.ID = 'workbench.action.reloadWindow';
    ReloadWindowAction.LABEL = (0, nls_1.localize)(19, null);
    ReloadWindowAction = __decorate([
        __param(2, host_1.IHostService)
    ], ReloadWindowAction);
    exports.ReloadWindowAction = ReloadWindowAction;
    let ShowAboutDialogAction = class ShowAboutDialogAction extends actions_1.Action {
        constructor(id, label, dialogService) {
            super(id, label);
            this.dialogService = dialogService;
        }
        run() {
            return this.dialogService.about();
        }
    };
    ShowAboutDialogAction.ID = 'workbench.action.showAboutDialog';
    ShowAboutDialogAction.LABEL = (0, nls_1.localize)(20, null);
    ShowAboutDialogAction = __decorate([
        __param(2, dialogs_1.IDialogService)
    ], ShowAboutDialogAction);
    let NewWindowAction = class NewWindowAction extends actions_1.Action {
        constructor(id, label, hostService) {
            super(id, label);
            this.hostService = hostService;
        }
        run() {
            return this.hostService.openWindow({ remoteAuthority: null });
        }
    };
    NewWindowAction.ID = 'workbench.action.newWindow';
    NewWindowAction.LABEL = (0, nls_1.localize)(21, null);
    NewWindowAction = __decorate([
        __param(2, host_1.IHostService)
    ], NewWindowAction);
    exports.NewWindowAction = NewWindowAction;
    class BlurAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.blur',
                title: (0, nls_1.localize)(22, null)
            });
        }
        run() {
            const el = document.activeElement;
            if ((0, dom_1.isHTMLElement)(el)) {
                el.blur();
            }
        }
    }
    const registry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    // --- Actions Registration
    const fileCategory = (0, nls_1.localize)(23, null);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(NewWindowAction, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 44 /* KEY_N */ }), 'New Window');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(QuickPickRecentAction), 'File: Quick Open Recent...', fileCategory);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(OpenRecentAction, { primary: 2048 /* CtrlCmd */ | 48 /* KEY_R */, mac: { primary: 256 /* WinCtrl */ | 48 /* KEY_R */ } }), 'File: Open Recent...', fileCategory);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ToggleFullScreenAction, { primary: 69 /* F11 */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 36 /* KEY_F */ } }), 'View: Toggle Full Screen', actions_3.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ReloadWindowAction), 'Developer: Reload Window', actions_3.CATEGORIES.Developer.value, contextkeys_2.IsWebContext.toNegated());
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ShowAboutDialogAction), `Help: About`, actions_3.CATEGORIES.Help.value);
    (0, actions_2.registerAction2)(BlurAction);
    // --- Commands/Keybindings Registration
    const recentFilesPickerContext = contextkey_1.ContextKeyExpr.and(quickaccess_1.inQuickPickContext, contextkey_1.ContextKeyExpr.has(exports.inRecentFilesPickerContextKey));
    const quickPickNavigateNextInRecentFilesPickerId = 'workbench.action.quickOpenNavigateNextInRecentFilesPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickPickNavigateNextInRecentFilesPickerId,
        weight: 200 /* WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickPickNavigateNextInRecentFilesPickerId, true),
        when: recentFilesPickerContext,
        primary: 2048 /* CtrlCmd */ | 48 /* KEY_R */,
        mac: { primary: 256 /* WinCtrl */ | 48 /* KEY_R */ }
    });
    const quickPickNavigatePreviousInRecentFilesPicker = 'workbench.action.quickOpenNavigatePreviousInRecentFilesPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickPickNavigatePreviousInRecentFilesPicker,
        weight: 200 /* WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickPickNavigatePreviousInRecentFilesPicker, false),
        when: recentFilesPickerContext,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KEY_R */,
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 48 /* KEY_R */ }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: ReloadWindowAction.ID,
        weight: 200 /* WorkbenchContrib */ + 50,
        when: contextkeys_2.IsDevelopmentContext,
        primary: 2048 /* CtrlCmd */ | 48 /* KEY_R */
    });
    commands_1.CommandsRegistry.registerCommand('workbench.action.toggleConfirmBeforeClose', accessor => {
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const setting = configurationService.inspect('window.confirmBeforeClose').userValue;
        return configurationService.updateValue('window.confirmBeforeClose', setting === 'never' ? 'keyboardOnly' : 'never');
    });
    // --- Menu Registration
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarFileMenu, {
        group: 'z_ConfirmClose',
        command: {
            id: 'workbench.action.toggleConfirmBeforeClose',
            title: (0, nls_1.localize)(24, null),
            toggled: contextkey_1.ContextKeyExpr.notEquals('config.window.confirmBeforeClose', 'never')
        },
        order: 1,
        when: contextkeys_2.IsWebContext
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarFileMenu, {
        group: '1_new',
        command: {
            id: NewWindowAction.ID,
            title: (0, nls_1.localize)(25, null)
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarFileMenu, {
        title: (0, nls_1.localize)(26, null),
        submenu: actions_2.MenuId.MenubarRecentMenu,
        group: '2_open',
        order: 4
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarRecentMenu, {
        group: 'y_more',
        command: {
            id: OpenRecentAction.ID,
            title: (0, nls_1.localize)(27, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '1_toggle_view',
        command: {
            id: ToggleFullScreenAction.ID,
            title: (0, nls_1.localize)(28, null),
            toggled: contextkeys_1.IsFullscreenContext
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarHelpMenu, {
        group: 'z_about',
        command: {
            id: ShowAboutDialogAction.ID,
            title: (0, nls_1.localize)(29, null)
        },
        order: 1,
        when: contextkeys_2.IsMacNativeContext.toNegated()
    });
});
//# sourceMappingURL=windowActions.js.map