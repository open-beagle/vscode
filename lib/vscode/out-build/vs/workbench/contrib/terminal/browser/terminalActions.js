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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/nls!vs/workbench/contrib/terminal/browser/terminalActions", "vs/platform/accessibility/common/accessibility", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/label/common/label", "vs/platform/list/browser/listService", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/quickinput/common/quickInput", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/contrib/search/browser/searchActions", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalExtensionPoints", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, canIUse_1, actions_1, codicons_1, network_1, platform_1, types_1, uri_1, codeEditorService_1, nls_1, accessibility_1, actions_2, commands_1, configuration_1, contextkey_1, label_1, listService_1, notification_1, opener_1, quickInput_1, terminal_1, workspace_1, workspaceCommands_1, searchActions_1, terminal_2, terminalQuickAccess_1, terminal_3, terminalExtensionPoints_1, configurationResolver_1, history_1, preferences_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerTerminalActions = exports.TerminalLaunchHelpAction = exports.terminalSendSequenceCommand = exports.ContextMenuTabsGroup = exports.switchTerminalShowTabsTitle = exports.switchTerminalActionViewItemSeparator = void 0;
    exports.switchTerminalActionViewItemSeparator = '─────────';
    exports.switchTerminalShowTabsTitle = (0, nls_1.localize)(0, null);
    var ContextMenuGroup;
    (function (ContextMenuGroup) {
        ContextMenuGroup["Create"] = "1_create";
        ContextMenuGroup["Edit"] = "2_edit";
        ContextMenuGroup["Clear"] = "3_clear";
        ContextMenuGroup["Kill"] = "4_kill";
        ContextMenuGroup["Config"] = "5_config";
    })(ContextMenuGroup || (ContextMenuGroup = {}));
    var ContextMenuTabsGroup;
    (function (ContextMenuTabsGroup) {
        ContextMenuTabsGroup["Default"] = "1_create_default";
        ContextMenuTabsGroup["Profile"] = "2_create_profile";
        ContextMenuTabsGroup["Configure"] = "3_configure";
    })(ContextMenuTabsGroup = exports.ContextMenuTabsGroup || (exports.ContextMenuTabsGroup = {}));
    async function getCwdForSplit(configHelper, instance, folders, commandService) {
        switch (configHelper.config.splitCwd) {
            case 'workspaceRoot':
                if (folders !== undefined && commandService !== undefined) {
                    if (folders.length === 1) {
                        return folders[0].uri;
                    }
                    else if (folders.length > 1) {
                        // Only choose a path when there's more than 1 folder
                        const options = {
                            placeHolder: (0, nls_1.localize)(1, null)
                        };
                        const workspace = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                        if (!workspace) {
                            // Don't split the instance if the workspace picker was canceled
                            return undefined;
                        }
                        return Promise.resolve(workspace.uri);
                    }
                }
                return '';
            case 'initial':
                return instance.getInitialCwd();
            case 'inherited':
                return instance.getCwd();
        }
    }
    const terminalSendSequenceCommand = (accessor, args) => {
        accessor.get(terminal_2.ITerminalService).doWithActiveInstance(async (t) => {
            if (!(args === null || args === void 0 ? void 0 : args.text)) {
                return;
            }
            const configurationResolverService = accessor.get(configurationResolver_1.IConfigurationResolverService);
            const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
            const historyService = accessor.get(history_1.IHistoryService);
            const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? (0, types_1.withNullAsUndefined)(workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
            const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, args.text);
            t.sendText(resolvedText, false);
        });
    };
    exports.terminalSendSequenceCommand = terminalSendSequenceCommand;
    const terminalIndexRe = /^([0-9]+): /;
    let TerminalLaunchHelpAction = class TerminalLaunchHelpAction extends actions_1.Action {
        constructor(_openerService) {
            super('workbench.action.terminal.launchHelp', (0, nls_1.localize)(2, null));
            this._openerService = _openerService;
        }
        async run() {
            this._openerService.open('https://aka.ms/vscode-troubleshoot-terminal-launch');
        }
    };
    TerminalLaunchHelpAction = __decorate([
        __param(0, opener_1.IOpenerService)
    ], TerminalLaunchHelpAction);
    exports.TerminalLaunchHelpAction = TerminalLaunchHelpAction;
    function registerTerminalActions() {
        const category = { value: terminal_3.TERMINAL_ACTION_CATEGORY, original: 'Terminal' };
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.newInActiveWorkspace" /* NEW_IN_ACTIVE_WORKSPACE */,
                    title: { value: (0, nls_1.localize)(3, null), original: 'Create New Integrated Terminal (In Active Workspace)' },
                    f1: true,
                    category
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                if (terminalService.isProcessSupportRegistered) {
                    const instance = terminalService.createTerminal(undefined);
                    if (!instance) {
                        return;
                    }
                    terminalService.setActiveInstance(instance);
                }
                await terminalService.showPanel(true);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.newWithProfile" /* NEW_WITH_PROFILE */,
                    title: { value: (0, nls_1.localize)(4, null), original: 'Create New Integrated Terminal (With Profile)' },
                    f1: true,
                    category,
                    description: {
                        description: 'workbench.action.terminal.newWithProfile',
                        args: [{
                                name: 'profile',
                                schema: {
                                    type: 'object'
                                }
                            }]
                    },
                });
            }
            async run(accessor, eventOrProfile, profile) {
                let event;
                if (eventOrProfile && typeof eventOrProfile === 'object' && 'profileName' in eventOrProfile) {
                    profile = eventOrProfile;
                }
                else {
                    event = eventOrProfile;
                }
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const commandService = accessor.get(commands_1.ICommandService);
                const folders = workspaceContextService.getWorkspace().folders;
                if (event instanceof MouseEvent && (event.altKey || event.ctrlKey)) {
                    const activeInstance = terminalService.getActiveInstance();
                    if (activeInstance) {
                        const cwd = await getCwdForSplit(terminalService.configHelper, activeInstance);
                        terminalService.splitInstance(activeInstance, profile, cwd);
                        return;
                    }
                }
                if (terminalService.isProcessSupportRegistered) {
                    let instance;
                    let cwd;
                    if (folders.length > 1) {
                        // multi-root workspace, create root picker
                        const options = {
                            placeHolder: (0, nls_1.localize)(5, null)
                        };
                        const workspace = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                        if (!workspace) {
                            // Don't create the instance if the workspace picker was canceled
                            return;
                        }
                        cwd = workspace.uri;
                    }
                    if (profile) {
                        instance = terminalService.createTerminal(profile, cwd);
                    }
                    else {
                        instance = await terminalService.showProfileQuickPick('createInstance', cwd);
                    }
                    if (instance) {
                        terminalService.setActiveInstance(instance);
                    }
                }
                await terminalService.showPanel(true);
            }
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalTabsWidgetEmptyContext, {
            command: {
                id: "workbench.action.terminal.newWithProfile" /* NEW_WITH_PROFILE */,
                title: (0, nls_1.localize)(6, null)
            },
            group: "1_create" /* Create */
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.showTabs" /* SHOW_TABS */,
                    title: { value: (0, nls_1.localize)(7, null), original: 'Show Tabs' },
                    f1: false,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                terminalService.showTabs();
            }
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalContainerContext, {
            command: {
                id: "workbench.action.terminal.showTabs" /* SHOW_TABS */,
                title: (0, nls_1.localize)(8, null)
            },
            when: contextkey_1.ContextKeyExpr.not('config.terminal.integrated.tabs.enabled'),
            group: "5_config" /* Config */
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.focusPreviousPane" /* FOCUS_PREVIOUS_PANE */,
                    title: { value: (0, nls_1.localize)(9, null), original: 'Focus Previous Pane' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 512 /* Alt */ | 15 /* LeftArrow */,
                        secondary: [512 /* Alt */ | 16 /* UpArrow */],
                        mac: {
                            primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
                            secondary: [512 /* Alt */ | 2048 /* CtrlCmd */ | 16 /* UpArrow */]
                        },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                var _a;
                const terminalService = accessor.get(terminal_2.ITerminalService);
                (_a = terminalService.getActiveTab()) === null || _a === void 0 ? void 0 : _a.focusPreviousPane();
                await terminalService.showPanel(true);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.focusNextPane" /* FOCUS_NEXT_PANE */,
                    title: { value: (0, nls_1.localize)(10, null), original: 'Focus Next Pane' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 512 /* Alt */ | 17 /* RightArrow */,
                        secondary: [512 /* Alt */ | 18 /* DownArrow */],
                        mac: {
                            primary: 512 /* Alt */ | 2048 /* CtrlCmd */ | 17 /* RightArrow */,
                            secondary: [512 /* Alt */ | 2048 /* CtrlCmd */ | 18 /* DownArrow */]
                        },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                var _a;
                const terminalService = accessor.get(terminal_2.ITerminalService);
                (_a = terminalService.getActiveTab()) === null || _a === void 0 ? void 0 : _a.focusNextPane();
                await terminalService.showPanel(true);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.resizePaneLeft" /* RESIZE_PANE_LEFT */,
                    title: { value: (0, nls_1.localize)(11, null), original: 'Resize Pane Left' },
                    f1: true,
                    category,
                    keybinding: {
                        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */ },
                        mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 15 /* LeftArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveTab()) === null || _a === void 0 ? void 0 : _a.resizePane(0 /* Left */);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.resizePaneRight" /* RESIZE_PANE_RIGHT */,
                    title: { value: (0, nls_1.localize)(12, null), original: 'Resize Pane Right' },
                    f1: true,
                    category,
                    keybinding: {
                        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */ },
                        mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 17 /* RightArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveTab()) === null || _a === void 0 ? void 0 : _a.resizePane(1 /* Right */);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.resizePaneUp" /* RESIZE_PANE_UP */,
                    title: { value: (0, nls_1.localize)(13, null), original: 'Resize Pane Up' },
                    f1: true,
                    category,
                    keybinding: {
                        mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 16 /* UpArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveTab()) === null || _a === void 0 ? void 0 : _a.resizePane(2 /* Up */);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.resizePaneDown" /* RESIZE_PANE_DOWN */,
                    title: { value: (0, nls_1.localize)(14, null), original: 'Resize Pane Down' },
                    f1: true,
                    category,
                    keybinding: {
                        mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 18 /* DownArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveTab()) === null || _a === void 0 ? void 0 : _a.resizePane(3 /* Down */);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.focus" /* FOCUS */,
                    title: { value: (0, nls_1.localize)(15, null), original: 'Focus Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    // This command is used to show instead of tabs when there is only a single terminal
                    menu: {
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyAndExpr.create([
                            contextkey_1.ContextKeyEqualsExpr.create('view', terminal_3.TERMINAL_VIEW_ID),
                            contextkey_1.ContextKeyExpr.has('config.terminal.integrated.tabs.enabled'),
                            contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.terminal.integrated.tabs.showActiveTerminal', 'singleTerminal'), contextkey_1.ContextKeyExpr.equals('terminalCount', 1)), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.terminal.integrated.tabs.showActiveTerminal', 'singleTerminalOrNarrow'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals('terminalCount', 1), contextkey_1.ContextKeyExpr.has('isTerminalTabsNarrow'))), contextkey_1.ContextKeyExpr.equals('config.terminal.integrated.tabs.showActiveTerminal', 'always'))
                        ]),
                    }
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const instance = terminalService.getActiveOrCreateInstance();
                if (!instance) {
                    return;
                }
                terminalService.setActiveInstance(instance);
                return terminalService.showPanel(true);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.focusTabs" /* FOCUS_TABS */,
                    title: { value: (0, nls_1.localize)(16, null), original: 'Focus Terminal Tabs View' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 88 /* US_BACKSLASH */,
                        weight: 200 /* WorkbenchContrib */,
                        when: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_TABS_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS),
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                accessor.get(terminal_2.ITerminalService).focusTabs();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.focusNext" /* FOCUS_NEXT */,
                    title: { value: (0, nls_1.localize)(17, null), original: 'Focus Next Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
                        mac: {
                            primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */
                        },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    }
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                terminalService.setActiveTabToNext();
                await terminalService.showPanel(true);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.focusPrevious" /* FOCUS_PREVIOUS */,
                    title: { value: (0, nls_1.localize)(18, null), original: 'Focus Previous Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
                        mac: {
                            primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 87 /* US_OPEN_SQUARE_BRACKET */
                        },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    }
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                terminalService.setActiveTabToPrevious();
                await terminalService.showPanel(true);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.runSelectedText" /* RUN_SELECTED_TEXT */,
                    title: { value: (0, nls_1.localize)(19, null), original: 'Run Selected Text In Active Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const instance = terminalService.getActiveOrCreateInstance();
                let editor = codeEditorService.getActiveCodeEditor();
                if (!editor || !editor.hasModel()) {
                    return;
                }
                let selection = editor.getSelection();
                let text;
                if (selection.isEmpty()) {
                    text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
                }
                else {
                    const endOfLinePreference = platform_1.isWindows ? 1 /* LF */ : 2 /* CRLF */;
                    text = editor.getModel().getValueInRange(selection, endOfLinePreference);
                }
                instance.sendText(text, true);
                return terminalService.showPanel();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.runActiveFile" /* RUN_ACTIVE_FILE */,
                    title: { value: (0, nls_1.localize)(20, null), original: 'Run Active File In Active Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
                const notificationService = accessor.get(notification_1.INotificationService);
                const editor = codeEditorService.getActiveCodeEditor();
                if (!editor || !editor.hasModel()) {
                    return;
                }
                const uri = editor.getModel().uri;
                if (uri.scheme !== network_1.Schemas.file) {
                    notificationService.warn((0, nls_1.localize)(21, null));
                    return;
                }
                // TODO: Convert this to ctrl+c, ctrl+v for pwsh?
                const instance = terminalService.getActiveOrCreateInstance();
                const path = await terminalService.preparePathForTerminalAsync(uri.fsPath, instance.shellLaunchConfig.executable, instance.title, instance.shellType);
                instance.sendText(path, true);
                return terminalService.showPanel();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollDown" /* SCROLL_DOWN_LINE */,
                    title: { value: (0, nls_1.localize)(22, null), original: 'Scroll Down (Line)' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 12 /* PageDown */,
                        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.scrollDownLine();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollDownPage" /* SCROLL_DOWN_PAGE */,
                    title: { value: (0, nls_1.localize)(23, null), original: 'Scroll Down (Page)' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 1024 /* Shift */ | 12 /* PageDown */,
                        mac: { primary: 12 /* PageDown */ },
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_ALT_BUFFER_ACTIVE.negate()),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.scrollDownPage();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollToBottom" /* SCROLL_TO_BOTTOM */,
                    title: { value: (0, nls_1.localize)(24, null), original: 'Scroll to Bottom' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 13 /* End */,
                        linux: { primary: 1024 /* Shift */ | 13 /* End */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.scrollToBottom();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollUp" /* SCROLL_UP_LINE */,
                    title: { value: (0, nls_1.localize)(25, null), original: 'Scroll Up (Line)' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 11 /* PageUp */,
                        linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.scrollUpLine();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollUpPage" /* SCROLL_UP_PAGE */,
                    title: { value: (0, nls_1.localize)(26, null), original: 'Scroll Up (Page)' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 1024 /* Shift */ | 11 /* PageUp */,
                        mac: { primary: 11 /* PageUp */ },
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_ALT_BUFFER_ACTIVE.negate()),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.scrollUpPage();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollToTop" /* SCROLL_TO_TOP */,
                    title: { value: (0, nls_1.localize)(27, null), original: 'Scroll to Top' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 14 /* Home */,
                        linux: { primary: 1024 /* Shift */ | 14 /* Home */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.scrollToTop();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.navigationModeExit" /* NAVIGATION_MODE_EXIT */,
                    title: { value: (0, nls_1.localize)(28, null), original: 'Exit Navigation Mode' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 9 /* Escape */,
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_A11Y_TREE_FOCUS, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a, _b;
                (_b = (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.navigationMode) === null || _b === void 0 ? void 0 : _b.exitNavigationMode();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.navigationModeFocusPrevious" /* NAVIGATION_MODE_FOCUS_PREVIOUS */,
                    title: { value: (0, nls_1.localize)(29, null), original: 'Focus Previous Line (Navigation Mode)' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
                        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_A11Y_TREE_FOCUS, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED), contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a, _b;
                (_b = (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.navigationMode) === null || _b === void 0 ? void 0 : _b.focusPreviousLine();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.navigationModeFocusNext" /* NAVIGATION_MODE_FOCUS_NEXT */,
                    title: { value: (0, nls_1.localize)(30, null), original: 'Focus Next Line (Navigation Mode)' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
                        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_A11Y_TREE_FOCUS, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED), contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED)),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a, _b;
                (_b = (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.navigationMode) === null || _b === void 0 ? void 0 : _b.focusNextLine();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.clearSelection" /* CLEAR_SELECTION */,
                    title: { value: (0, nls_1.localize)(31, null), original: 'Clear Selection' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 9 /* Escape */,
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_NOT_VISIBLE),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                const terminalInstance = accessor.get(terminal_2.ITerminalService).getActiveInstance();
                if (terminalInstance && terminalInstance.hasSelection()) {
                    terminalInstance.clearSelection();
                }
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.changeIcon" /* CHANGE_ICON */,
                    title: { value: (0, nls_1.localize)(32, null), original: 'Change Icon...' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    menu: {
                        id: actions_2.MenuId.TerminalSingleTabContext,
                        group: "2_edit" /* Edit */
                    }
                });
            }
            async run(accessor) {
                var _a;
                return (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.changeIcon();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.changeIconInstance" /* CHANGE_ICON_INSTANCE */,
                    title: { value: (0, nls_1.localize)(33, null), original: 'Change Icon...' },
                    f1: false,
                    category,
                    precondition: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_TABS_SINGULAR_SELECTION),
                    menu: {
                        id: actions_2.MenuId.TerminalTabsWidgetContext,
                        group: "2_edit" /* Edit */
                    }
                });
            }
            async run(accessor) {
                var _a;
                return (_a = getSelectedInstances(accessor)) === null || _a === void 0 ? void 0 : _a[0].changeIcon();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.rename" /* RENAME */,
                    title: { value: (0, nls_1.localize)(34, null), original: 'Rename...' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    menu: {
                        id: actions_2.MenuId.TerminalSingleTabContext,
                        group: "2_edit" /* Edit */
                    }
                });
            }
            async run(accessor) {
                var _a;
                return (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.rename();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.renameInstance" /* RENAME_INSTANCE */,
                    title: { value: (0, nls_1.localize)(35, null), original: 'Rename...' },
                    f1: false,
                    category,
                    keybinding: {
                        primary: 60 /* F2 */,
                        mac: {
                            primary: 3 /* Enter */
                        },
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_TABS_FOCUS),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_TABS_SINGULAR_SELECTION),
                    menu: [
                        {
                            id: actions_2.MenuId.TerminalTabsWidgetContext,
                            group: "2_edit" /* Edit */
                        },
                        {
                            id: actions_2.MenuId.TerminalContainerContext,
                            group: "2_edit" /* Edit */
                        }
                    ]
                });
            }
            async run(accessor) {
                var _a;
                return (_a = getSelectedInstances(accessor)) === null || _a === void 0 ? void 0 : _a[0].rename();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.focusFind" /* FIND_FOCUS */,
                    title: { value: (0, nls_1.localize)(36, null), original: 'Focus Find' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */,
                        when: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).focusFindWidget();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.hideFind" /* FIND_HIDE */,
                    title: { value: (0, nls_1.localize)(37, null), original: 'Hide Find' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 9 /* Escape */,
                        secondary: [1024 /* Shift */ | 9 /* Escape */],
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_VISIBLE),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).hideFindWidget();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.attachToSession" /* ATTACH_TO_REMOTE_TERMINAL */,
                    title: { value: (0, nls_1.localize)(38, null), original: 'Attach to Session' },
                    f1: true,
                    category
                });
            }
            async run(accessor) {
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const labelService = accessor.get(label_1.ILabelService);
                const remoteAgentService = accessor.get(remoteAgentService_1.IRemoteAgentService);
                const notificationService = accessor.get(notification_1.INotificationService);
                let offProcTerminalService = remoteAgentService.getConnection() ? accessor.get(terminal_2.IRemoteTerminalService) : accessor.get(terminal_1.ILocalTerminalService);
                const terms = await offProcTerminalService.listProcesses();
                offProcTerminalService.reduceConnectionGraceTime();
                const unattachedTerms = terms.filter(term => !terminalService.isAttachedToTerminal(term));
                const items = unattachedTerms.map(term => {
                    const cwdLabel = labelService.getUriLabel(uri_1.URI.file(term.cwd));
                    return {
                        label: term.title,
                        detail: term.workspaceName ? `${term.workspaceName} ⸱ ${cwdLabel}` : cwdLabel,
                        description: term.pid ? String(term.pid) : '',
                        term
                    };
                });
                if (items.length === 0) {
                    notificationService.info((0, nls_1.localize)(39, null));
                    return;
                }
                const selected = await quickInputService.pick(items, { canPickMany: false });
                if (selected) {
                    const instance = terminalService.createTerminal({ attachPersistentProcess: selected.term });
                    terminalService.setActiveInstance(instance);
                    terminalService.showPanel(true);
                }
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.quickOpenTerm" /* QUICK_OPEN_TERM */,
                    title: { value: (0, nls_1.localize)(40, null), original: 'Switch Active Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(quickInput_1.IQuickInputService).quickAccess.show(terminalQuickAccess_1.TerminalQuickAccessProvider.PREFIX);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollToPreviousCommand" /* SCROLL_TO_PREVIOUS_COMMAND */,
                    title: { value: (0, nls_1.localize)(41, null), original: 'Scroll To Previous Command' },
                    f1: true,
                    category,
                    keybinding: {
                        mac: { primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ },
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).doWithActiveInstance(t => {
                    var _a;
                    (_a = t.commandTracker) === null || _a === void 0 ? void 0 : _a.scrollToPreviousCommand();
                    t.focus();
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.scrollToNextCommand" /* SCROLL_TO_NEXT_COMMAND */,
                    title: { value: (0, nls_1.localize)(42, null), original: 'Scroll To Next Command' },
                    f1: true,
                    category,
                    keybinding: {
                        mac: { primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */ },
                        when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).doWithActiveInstance(t => {
                    var _a;
                    (_a = t.commandTracker) === null || _a === void 0 ? void 0 : _a.scrollToNextCommand();
                    t.focus();
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.selectToPreviousCommand" /* SELECT_TO_PREVIOUS_COMMAND */,
                    title: { value: (0, nls_1.localize)(43, null), original: 'Select To Previous Command' },
                    f1: true,
                    category,
                    keybinding: {
                        mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).doWithActiveInstance(t => {
                    var _a;
                    (_a = t.commandTracker) === null || _a === void 0 ? void 0 : _a.selectToPreviousCommand();
                    t.focus();
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.selectToNextCommand" /* SELECT_TO_NEXT_COMMAND */,
                    title: { value: (0, nls_1.localize)(44, null), original: 'Select To Next Command' },
                    f1: true,
                    category,
                    keybinding: {
                        mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */ },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).doWithActiveInstance(t => {
                    var _a;
                    (_a = t.commandTracker) === null || _a === void 0 ? void 0 : _a.selectToNextCommand();
                    t.focus();
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.selectToPreviousLine" /* SELECT_TO_PREVIOUS_LINE */,
                    title: { value: (0, nls_1.localize)(45, null), original: 'Select To Previous Line' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).doWithActiveInstance(t => {
                    var _a;
                    (_a = t.commandTracker) === null || _a === void 0 ? void 0 : _a.selectToPreviousLine();
                    t.focus();
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.selectToNextLine" /* SELECT_TO_NEXT_LINE */,
                    title: { value: (0, nls_1.localize)(46, null), original: 'Select To Next Line' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).doWithActiveInstance(t => {
                    var _a;
                    (_a = t.commandTracker) === null || _a === void 0 ? void 0 : _a.selectToNextLine();
                    t.focus();
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "toggleEscapeSequenceLogging" /* TOGGLE_ESCAPE_SEQUENCE_LOGGING */,
                    title: { value: (0, nls_1.localize)(47, null), original: 'Toggle Escape Sequence Logging' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.toggleEscapeSequenceLogging();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                const title = (0, nls_1.localize)(48, null);
                super({
                    id: "workbench.action.terminal.sendSequence" /* SEND_SEQUENCE */,
                    title: { value: title, original: 'Send Custom Sequence To Terminal' },
                    category,
                    description: {
                        description: title,
                        args: [{
                                name: 'args',
                                schema: {
                                    type: 'object',
                                    required: ['text'],
                                    properties: {
                                        text: { type: 'string' }
                                    },
                                }
                            }]
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor, args) {
                (0, exports.terminalSendSequenceCommand)(accessor, args);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                const title = (0, nls_1.localize)(49, null);
                super({
                    id: "workbench.action.terminal.newWithCwd" /* NEW_WITH_CWD */,
                    title: { value: title, original: 'Create New Integrated Terminal Starting in a Custom Working Directory' },
                    category,
                    description: {
                        description: title,
                        args: [{
                                name: 'args',
                                schema: {
                                    type: 'object',
                                    required: ['cwd'],
                                    properties: {
                                        cwd: {
                                            description: (0, nls_1.localize)(50, null),
                                            type: 'string'
                                        }
                                    },
                                }
                            }]
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor, args) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                if (terminalService.isProcessSupportRegistered) {
                    const instance = terminalService.createTerminal({ cwd: args === null || args === void 0 ? void 0 : args.cwd });
                    if (!instance) {
                        return;
                    }
                    terminalService.setActiveInstance(instance);
                }
                return terminalService.showPanel(true);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                const title = (0, nls_1.localize)(51, null);
                super({
                    id: "workbench.action.terminal.renameWithArg" /* RENAME_WITH_ARG */,
                    title: { value: title, original: 'Rename the Currently Active Terminal' },
                    category,
                    description: {
                        description: title,
                        args: [{
                                name: 'args',
                                schema: {
                                    type: 'object',
                                    required: ['name'],
                                    properties: {
                                        name: {
                                            description: (0, nls_1.localize)(52, null),
                                            type: 'string',
                                            minLength: 1
                                        }
                                    }
                                }
                            }]
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor, args) {
                var _a;
                const notificationService = accessor.get(notification_1.INotificationService);
                if (!(args === null || args === void 0 ? void 0 : args.name)) {
                    notificationService.warn((0, nls_1.localize)(53, null));
                    return;
                }
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.setTitle(args.name, terminal_3.TitleEventSource.Api);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.toggleFindRegex" /* TOGGLE_FIND_REGEX */,
                    title: { value: (0, nls_1.localize)(54, null), original: 'Toggle Find Using Regex' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 512 /* Alt */ | 48 /* KEY_R */,
                        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KEY_R */ },
                        when: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                const state = accessor.get(terminal_2.ITerminalService).getFindState();
                state.change({ isRegex: !state.isRegex }, false);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.toggleFindWholeWord" /* TOGGLE_FIND_WHOLE_WORD */,
                    title: { value: (0, nls_1.localize)(55, null), original: 'Toggle Find Using Whole Word' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 512 /* Alt */ | 53 /* KEY_W */,
                        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 53 /* KEY_W */ },
                        when: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                const state = accessor.get(terminal_2.ITerminalService).getFindState();
                state.change({ wholeWord: !state.wholeWord }, false);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.toggleFindCaseSensitive" /* TOGGLE_FIND_CASE_SENSITIVE */,
                    title: { value: (0, nls_1.localize)(56, null), original: 'Toggle Find Using Case Sensitive' },
                    f1: true,
                    category,
                    keybinding: {
                        primary: 512 /* Alt */ | 33 /* KEY_C */,
                        mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KEY_C */ },
                        when: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED),
                        weight: 200 /* WorkbenchContrib */
                    },
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                const state = accessor.get(terminal_2.ITerminalService).getFindState();
                state.change({ matchCase: !state.matchCase }, false);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.findNext" /* FIND_NEXT */,
                    title: { value: (0, nls_1.localize)(57, null), original: 'Find Next' },
                    f1: true,
                    category,
                    keybinding: [
                        {
                            primary: 61 /* F3 */,
                            mac: { primary: 2048 /* CtrlCmd */ | 37 /* KEY_G */, secondary: [61 /* F3 */] },
                            when: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED),
                            weight: 200 /* WorkbenchContrib */
                        },
                        {
                            primary: 1024 /* Shift */ | 3 /* Enter */,
                            when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED,
                            weight: 200 /* WorkbenchContrib */
                        }
                    ],
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).findNext();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.findPrevious" /* FIND_PREVIOUS */,
                    title: { value: (0, nls_1.localize)(58, null), original: 'Find Previous' },
                    f1: true,
                    category,
                    keybinding: [
                        {
                            primary: 1024 /* Shift */ | 61 /* F3 */,
                            mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KEY_G */, secondary: [1024 /* Shift */ | 61 /* F3 */] },
                            when: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED),
                            weight: 200 /* WorkbenchContrib */
                        },
                        {
                            primary: 3 /* Enter */,
                            when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FIND_FOCUSED,
                            weight: 200 /* WorkbenchContrib */
                        }
                    ],
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).findPrevious();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.searchWorkspace" /* SEARCH_WORKSPACE */,
                    title: { value: (0, nls_1.localize)(59, null), original: 'Search Workspace' },
                    f1: true,
                    category,
                    keybinding: [
                        {
                            primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KEY_F */,
                            when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS, terminal_3.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED),
                            weight: 200 /* WorkbenchContrib */ + 50
                        }
                    ],
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                const query = (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.selection;
                (0, searchActions_1.FindInFilesCommand)(accessor, { query });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.relaunch" /* RELAUNCH */,
                    title: { value: (0, nls_1.localize)(60, null), original: 'Relaunch Active Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.relaunch();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.showEnvironmentInformation" /* SHOW_ENVIRONMENT_INFORMATION */,
                    title: { value: (0, nls_1.localize)(61, null), original: 'Show Environment Information' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.showEnvironmentInfoHover();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.split" /* SPLIT */,
                    title: { value: (0, nls_1.localize)(62, null), original: 'Split Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 26 /* KEY_5 */,
                        weight: 200 /* WorkbenchContrib */,
                        mac: {
                            primary: 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */,
                            secondary: [256 /* WinCtrl */ | 1024 /* Shift */ | 26 /* KEY_5 */]
                        },
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS
                    },
                    icon: codicons_1.Codicon.splitHorizontal,
                    menu: [
                        {
                            id: actions_2.MenuId.ViewTitle,
                            group: 'navigation',
                            order: 2,
                            when: contextkey_1.ContextKeyAndExpr.create([
                                contextkey_1.ContextKeyEqualsExpr.create('view', terminal_3.TERMINAL_VIEW_ID),
                                contextkey_1.ContextKeyExpr.not('config.terminal.integrated.tabs.enabled')
                            ]),
                        }, {
                            id: actions_2.MenuId.TerminalSingleTabContext,
                            group: "1_create" /* Create */
                        }, {
                            id: actions_2.MenuId.TerminalContainerContext,
                            group: "1_create" /* Create */
                        }
                    ],
                    description: {
                        description: 'workbench.action.terminal.split',
                        args: [{
                                name: 'profile',
                                schema: {
                                    type: 'object'
                                }
                            }]
                    },
                });
            }
            async run(accessor, profile) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                await terminalService.doWithActiveInstance(async (t) => {
                    const cwd = await getCwdForSplit(terminalService.configHelper, t, accessor.get(workspace_1.IWorkspaceContextService).getWorkspace().folders, accessor.get(commands_1.ICommandService));
                    if (cwd === undefined) {
                        return undefined;
                    }
                    terminalService.splitInstance(t, profile, cwd);
                    return terminalService.showPanel(true);
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.splitInstance" /* SPLIT_INSTANCE */,
                    title: { value: (0, nls_1.localize)(63, null), original: 'Split Terminal' },
                    f1: false,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    menu: {
                        id: actions_2.MenuId.TerminalTabsWidgetContext,
                        group: "1_create" /* Create */
                    },
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 26 /* KEY_5 */,
                        mac: {
                            primary: 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */,
                            secondary: [256 /* WinCtrl */ | 1024 /* Shift */ | 26 /* KEY_5 */]
                        },
                        weight: 200 /* WorkbenchContrib */,
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_TABS_FOCUS
                    }
                });
            }
            async run(accessor) {
                const instances = getSelectedInstances(accessor);
                if (instances) {
                    for (const instance of instances) {
                        accessor.get(terminal_2.ITerminalService).splitInstance(instance);
                    }
                }
                accessor.get(terminal_2.ITerminalService).focusTabs();
                focusNext(accessor);
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.splitInActiveWorkspace" /* SPLIT_IN_ACTIVE_WORKSPACE */,
                    title: { value: (0, nls_1.localize)(64, null), original: 'Split Terminal (In Active Workspace)' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                await terminalService.doWithActiveInstance(async (t) => {
                    const cwd = await getCwdForSplit(terminalService.configHelper, t);
                    terminalService.splitInstance(t, { cwd });
                    await terminalService.showPanel(true);
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.selectAll" /* SELECT_ALL */,
                    title: { value: (0, nls_1.localize)(65, null), original: 'Select All' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    keybinding: [{
                            // Don't use ctrl+a by default as that would override the common go to start
                            // of prompt shell binding
                            primary: 0,
                            // Technically this doesn't need to be here as it will fall back to this
                            // behavior anyway when handed to xterm.js, having this handled by VS Code
                            // makes it easier for users to see how it works though.
                            mac: { primary: 2048 /* CtrlCmd */ | 31 /* KEY_A */ },
                            weight: 200 /* WorkbenchContrib */,
                            when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS
                        }],
                    menu: {
                        id: actions_2.MenuId.TerminalContainerContext,
                        group: "2_edit" /* Edit */,
                        order: 3
                    }
                });
            }
            run(accessor) {
                var _a;
                (_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.selectAll();
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.new" /* NEW */,
                    title: { value: (0, nls_1.localize)(66, null), original: 'Create New Integrated Terminal' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    icon: codicons_1.Codicon.plus,
                    keybinding: {
                        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 86 /* US_BACKTICK */,
                        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 86 /* US_BACKTICK */ },
                        weight: 200 /* WorkbenchContrib */
                    }
                });
            }
            async run(accessor, event) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
                const commandService = accessor.get(commands_1.ICommandService);
                const folders = workspaceContextService.getWorkspace().folders;
                if (event instanceof MouseEvent && (event.altKey || event.ctrlKey)) {
                    const activeInstance = terminalService.getActiveInstance();
                    if (activeInstance) {
                        const cwd = await getCwdForSplit(terminalService.configHelper, activeInstance);
                        terminalService.splitInstance(activeInstance, { cwd });
                        return;
                    }
                }
                if (terminalService.isProcessSupportRegistered) {
                    let instance;
                    if (folders.length <= 1) {
                        // Allow terminal service to handle the path when there is only a
                        // single root
                        instance = terminalService.createTerminal(undefined);
                    }
                    else {
                        const options = {
                            placeHolder: (0, nls_1.localize)(67, null)
                        };
                        const workspace = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
                        if (!workspace) {
                            // Don't create the instance if the workspace picker was canceled
                            return;
                        }
                        instance = terminalService.createTerminal({ cwd: workspace.uri });
                    }
                    terminalService.setActiveInstance(instance);
                }
                await terminalService.showPanel(true);
            }
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalTabsWidgetEmptyContext, {
            command: {
                id: "workbench.action.terminal.new" /* NEW */,
                title: (0, nls_1.localize)(68, null)
            },
            group: "1_create" /* Create */
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalContainerContext, {
            command: {
                id: "workbench.action.terminal.new" /* NEW */,
                title: (0, nls_1.localize)(69, null)
            },
            group: "1_create" /* Create */
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.kill" /* KILL */,
                    title: { value: (0, nls_1.localize)(70, null), original: 'Kill the Active Terminal Instance' },
                    f1: true,
                    category,
                    precondition: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_IS_OPEN),
                    icon: codicons_1.Codicon.trash,
                    menu: {
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyAndExpr.create([
                            contextkey_1.ContextKeyEqualsExpr.create('view', terminal_3.TERMINAL_VIEW_ID),
                            contextkey_1.ContextKeyExpr.not('config.terminal.integrated.tabs.enabled')
                        ])
                    }
                });
            }
            async run(accessor) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                await terminalService.doWithActiveInstance(async (t) => {
                    t.dispose(true);
                    if (terminalService.terminalInstances.length > 0) {
                        await terminalService.showPanel(true);
                    }
                });
            }
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalContainerContext, {
            command: {
                id: "workbench.action.terminal.kill" /* KILL */,
                title: (0, nls_1.localize)(71, null)
            },
            group: "4_kill" /* Kill */
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalSingleTabContext, {
            command: {
                id: "workbench.action.terminal.kill" /* KILL */,
                title: (0, nls_1.localize)(72, null)
            },
            group: "4_kill" /* Kill */
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.killInstance" /* KILL_INSTANCE */,
                    title: {
                        value: (0, nls_1.localize)(73, null), original: 'Kill Terminal'
                    },
                    f1: false,
                    category,
                    precondition: contextkey_1.ContextKeyExpr.or(terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_IS_OPEN),
                    menu: {
                        id: actions_2.MenuId.TerminalTabsWidgetContext,
                        group: "4_kill" /* Kill */
                    },
                    keybinding: {
                        primary: 20 /* Delete */,
                        mac: {
                            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
                            secondary: [20 /* Delete */]
                        },
                        weight: 200 /* WorkbenchContrib */,
                        when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_TABS_FOCUS
                    }
                });
            }
            async run(accessor) {
                var _a;
                (_a = getSelectedInstances(accessor)) === null || _a === void 0 ? void 0 : _a.forEach(instance => instance.dispose(true));
                const terminalService = accessor.get(terminal_2.ITerminalService);
                if (terminalService.terminalInstances.length > 0) {
                    terminalService.focusTabs();
                    focusNext(accessor);
                }
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.clear" /* CLEAR */,
                    title: { value: (0, nls_1.localize)(74, null), original: 'Clear' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    keybinding: [{
                            primary: 0,
                            mac: { primary: 2048 /* CtrlCmd */ | 41 /* KEY_K */ },
                            // Weight is higher than work workbench contributions so the keybinding remains
                            // highest priority when chords are registered afterwards
                            weight: 200 /* WorkbenchContrib */ + 1,
                            when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS
                        }],
                    menu: {
                        id: actions_2.MenuId.TerminalContainerContext,
                        group: "3_clear" /* Clear */
                    }
                });
            }
            run(accessor) {
                accessor.get(terminal_2.ITerminalService).doWithActiveInstance(t => {
                    t.clear();
                    t.focus();
                });
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.selectDefaultShell" /* SELECT_DEFAULT_PROFILE */,
                    title: { value: (0, nls_1.localize)(75, null), original: 'Select Default Profile' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                await accessor.get(terminal_2.ITerminalService).showProfileQuickPick('setDefault');
            }
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalToolbarContext, {
            command: {
                id: "workbench.action.terminal.selectDefaultShell" /* SELECT_DEFAULT_PROFILE */,
                title: { value: (0, nls_1.localize)(76, null), original: 'Select Default Profile' }
            },
            group: "3_configure" /* Configure */
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.createProfileButton" /* CREATE_WITH_PROFILE_BUTTON */,
                    title: "workbench.action.terminal.createProfileButton" /* CREATE_WITH_PROFILE_BUTTON */,
                    f1: false,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                    menu: [{
                            id: actions_2.MenuId.ViewTitle,
                            group: 'navigation',
                            order: 0,
                            when: contextkey_1.ContextKeyAndExpr.create([
                                contextkey_1.ContextKeyEqualsExpr.create('view', terminal_3.TERMINAL_VIEW_ID)
                            ]),
                        }]
                });
            }
            async run(accessor) {
            }
        });
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.openSettings" /* CONFIGURE_TERMINAL_SETTINGS */,
                    title: { value: (0, nls_1.localize)(77, null), original: 'Configure Terminal Settings' },
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor) {
                await accessor.get(preferences_1.IPreferencesService).openSettings(false, '@feature:terminal');
            }
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalToolbarContext, {
            command: {
                id: "workbench.action.terminal.openSettings" /* CONFIGURE_TERMINAL_SETTINGS */,
                title: (0, nls_1.localize)(78, null)
            },
            group: "3_configure" /* Configure */
        });
        // Some commands depend on platform features
        if (canIUse_1.BrowserFeatures.clipboard.writeText) {
            (0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: "workbench.action.terminal.copySelection" /* COPY_SELECTION */,
                        title: { value: (0, nls_1.localize)(79, null), original: 'Copy Selection' },
                        f1: true,
                        category,
                        // TODO: Why is copy still showing up when text isn't selected?
                        precondition: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED),
                        keybinding: [{
                                primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
                                win: { primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KEY_C */] },
                                linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KEY_C */ },
                                weight: 200 /* WorkbenchContrib */,
                                when: contextkey_1.ContextKeyExpr.and(terminal_3.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED, terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS)
                            }]
                    });
                }
                async run(accessor) {
                    var _a;
                    await ((_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.copySelection());
                }
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalContainerContext, {
                command: {
                    id: "workbench.action.terminal.copySelection" /* COPY_SELECTION */,
                    title: (0, nls_1.localize)(80, null)
                },
                group: "2_edit" /* Edit */,
                order: 1
            });
        }
        if (canIUse_1.BrowserFeatures.clipboard.readText) {
            (0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: "workbench.action.terminal.paste" /* PASTE */,
                        title: { value: (0, nls_1.localize)(81, null), original: 'Paste into Active Terminal' },
                        f1: true,
                        category,
                        precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                        keybinding: [{
                                primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */,
                                win: { primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KEY_V */] },
                                linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KEY_V */ },
                                weight: 200 /* WorkbenchContrib */,
                                when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS
                            }],
                    });
                }
                async run(accessor) {
                    var _a;
                    await ((_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.paste());
                }
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TerminalContainerContext, {
                command: {
                    id: "workbench.action.terminal.paste" /* PASTE */,
                    title: (0, nls_1.localize)(82, null)
                },
                group: "2_edit" /* Edit */,
                order: 2
            });
        }
        if (canIUse_1.BrowserFeatures.clipboard.readText && platform_1.isLinux) {
            (0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: "workbench.action.terminal.pasteSelection" /* PASTE_SELECTION */,
                        title: { value: (0, nls_1.localize)(83, null), original: 'Paste Selection into Active Terminal' },
                        f1: true,
                        category,
                        precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED,
                        keybinding: [{
                                linux: { primary: 1024 /* Shift */ | 19 /* Insert */ },
                                weight: 200 /* WorkbenchContrib */,
                                when: terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS
                            }],
                    });
                }
                async run(accessor) {
                    var _a;
                    await ((_a = accessor.get(terminal_2.ITerminalService).getActiveInstance()) === null || _a === void 0 ? void 0 : _a.pasteSelection());
                }
            });
        }
        const switchTerminalTitle = { value: (0, nls_1.localize)(84, null), original: 'Switch Terminal' };
        (0, actions_2.registerAction2)(class extends actions_2.Action2 {
            constructor() {
                super({
                    id: "workbench.action.terminal.switchTerminal" /* SWITCH_TERMINAL */,
                    title: switchTerminalTitle,
                    f1: true,
                    category,
                    precondition: terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
                });
            }
            async run(accessor, item) {
                const terminalService = accessor.get(terminal_2.ITerminalService);
                const terminalContributionService = accessor.get(terminalExtensionPoints_1.ITerminalContributionService);
                const commandService = accessor.get(commands_1.ICommandService);
                if (!item || !item.split) {
                    return Promise.resolve(null);
                }
                if (item === exports.switchTerminalActionViewItemSeparator) {
                    terminalService.refreshActiveTab();
                    return Promise.resolve(null);
                }
                if (item === exports.switchTerminalShowTabsTitle) {
                    accessor.get(configuration_1.IConfigurationService).updateValue('terminal.integrated.tabs.enabled', true);
                    return;
                }
                const indexMatches = terminalIndexRe.exec(item);
                if (indexMatches) {
                    terminalService.setActiveTabByIndex(Number(indexMatches[1]) - 1);
                    return terminalService.showPanel(true);
                }
                const customType = terminalContributionService.terminalTypes.find(t => t.title === item);
                if (customType) {
                    return commandService.executeCommand(customType.command);
                }
                const quickSelectProfiles = terminalService.availableProfiles;
                // Remove 'New ' from the selected item to get the profile name
                const profileSelection = item.substring(4);
                if (quickSelectProfiles) {
                    const profile = quickSelectProfiles.find(profile => profile.profileName === profileSelection);
                    if (profile) {
                        const instance = terminalService.createTerminal(profile);
                        terminalService.setActiveInstance(instance);
                    }
                    else {
                        console.warn(`No profile with name "${profileSelection}"`);
                    }
                }
                else {
                    console.warn(`Unmatched terminal item: "${item}"`);
                }
                return Promise.resolve();
            }
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ViewTitle, {
            command: {
                id: "workbench.action.terminal.switchTerminal" /* SWITCH_TERMINAL */,
                title: switchTerminalTitle
            },
            group: 'navigation',
            order: 0,
            when: contextkey_1.ContextKeyAndExpr.create([
                contextkey_1.ContextKeyEqualsExpr.create('view', terminal_3.TERMINAL_VIEW_ID),
                contextkey_1.ContextKeyExpr.not('config.terminal.integrated.tabs.enabled')
            ]),
        });
    }
    exports.registerTerminalActions = registerTerminalActions;
    function getSelectedInstances(accessor) {
        var _a, _b;
        const listService = accessor.get(listService_1.IListService);
        if (!((_b = (_a = listService.lastFocusedList) === null || _a === void 0 ? void 0 : _a.getSelection()) === null || _b === void 0 ? void 0 : _b.length)) {
            return undefined;
        }
        const selections = listService.lastFocusedList.getSelection();
        const focused = listService.lastFocusedList.getFocus();
        const instances = [];
        if (focused.length === 1 && !selections.includes(focused[0])) {
            // focused length is always a max of 1
            // if the focused one is not in the selected list, return that item
            if ('instanceId' in focused[0]) {
                instances.push(focused[0]);
                return instances;
            }
        }
        // multi-select
        for (const instance of selections) {
            if ('instanceId' in instance) {
                instances.push(instance);
            }
        }
        return instances;
    }
    function focusNext(accessor) {
        var _a;
        const listService = accessor.get(listService_1.IListService);
        (_a = listService.lastFocusedList) === null || _a === void 0 ? void 0 : _a.focusNext();
    }
});
//# sourceMappingURL=terminalActions.js.map