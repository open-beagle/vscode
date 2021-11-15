/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debug.contribution", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/extensions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/contrib/debug/browser/callStackView", "vs/workbench/common/contributions", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/debug/browser/debugToolBar", "vs/workbench/contrib/debug/browser/debugService", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/statusbarColorProvider", "vs/workbench/common/views", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/browser/debugStatus", "vs/workbench/services/configuration/common/configuration", "vs/workbench/contrib/debug/browser/loadedScriptsView", "vs/workbench/contrib/debug/browser/debugEditorActions", "vs/workbench/contrib/debug/browser/watchExpressionsView", "vs/workbench/contrib/debug/browser/variablesView", "vs/workbench/contrib/debug/browser/repl", "vs/workbench/contrib/debug/common/debugContentProvider", "vs/workbench/contrib/debug/browser/welcomeView", "vs/workbench/contrib/debug/browser/debugViewlet", "vs/editor/browser/editorExtensions", "vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/workbench/contrib/debug/browser/breakpointEditorContribution", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/debug/browser/debugQuickAccess", "vs/workbench/contrib/debug/browser/debugProgress", "vs/workbench/contrib/debug/browser/debugTitle", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/debug/browser/debugEditorContribution", "vs/base/common/network", "vs/workbench/contrib/debug/browser/debugIcons", "vs/css!./media/debug.contribution", "vs/css!./media/debugHover"], function (require, exports, nls, actions_1, platform_1, extensions_1, configurationRegistry_1, breakpointsView_1, callStackView_1, contributions_1, debug_1, debugToolBar_1, debugService_1, debugCommands_1, statusbarColorProvider_1, views_1, platform_2, contextkey_1, debugStatus_1, configuration_1, loadedScriptsView_1, debugEditorActions_1, watchExpressionsView_1, variablesView_1, repl_1, debugContentProvider_1, welcomeView_1, debugViewlet_1, editorExtensions_1, callStackEditorContribution_1, breakpointEditorContribution_1, descriptors_1, viewPaneContainer_1, quickAccess_1, debugQuickAccess_1, debugProgress_1, debugTitle_1, debugColors_1, debugEditorContribution_1, network_1, icons) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const debugCategory = nls.localize(0, null);
    (0, debugColors_1.registerColors)();
    (0, extensions_1.registerSingleton)(debug_1.IDebugService, debugService_1.DebugService, true);
    // Register Debug Workbench Contributions
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugStatus_1.DebugStatusContribution, 4 /* Eventually */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugProgress_1.DebugProgressContribution, 4 /* Eventually */);
    if (platform_2.isWeb) {
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugTitle_1.DebugTitleContribution, 4 /* Eventually */);
    }
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugToolBar_1.DebugToolBar, 3 /* Restored */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(debugContentProvider_1.DebugContentProvider, 4 /* Eventually */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(statusbarColorProvider_1.StatusBarColorProvider, 4 /* Eventually */);
    // Register Quick Access
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: debugQuickAccess_1.StartDebugQuickAccessProvider,
        prefix: debugQuickAccess_1.StartDebugQuickAccessProvider.PREFIX,
        contextKey: 'inLaunchConfigurationsPicker',
        placeholder: nls.localize(1, null),
        helpEntries: [{ description: nls.localize(2, null), needsEditor: false }]
    });
    (0, editorExtensions_1.registerEditorContribution)('editor.contrib.callStack', callStackEditorContribution_1.CallStackEditorContribution);
    (0, editorExtensions_1.registerEditorContribution)(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID, breakpointEditorContribution_1.BreakpointEditorContribution);
    (0, editorExtensions_1.registerEditorContribution)(debug_1.EDITOR_CONTRIBUTION_ID, debugEditorContribution_1.DebugEditorContribution);
    const registerDebugCommandPaletteItem = (id, title, when, precondition) => {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, when),
            group: debugCategory,
            command: {
                id,
                title: `Debug: ${title}`,
                precondition
            }
        });
    };
    registerDebugCommandPaletteItem(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL);
    registerDebugCommandPaletteItem(debugCommands_1.TERMINATE_THREAD_ID, nls.localize(3, null), debug_1.CONTEXT_IN_DEBUG_MODE);
    registerDebugCommandPaletteItem(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running'));
    registerDebugCommandPaletteItem(debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH, debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED));
    registerDebugCommandPaletteItem(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), debug_1.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED));
    registerDebugCommandPaletteItem(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugCommandPaletteItem(debugCommands_1.FOCUS_REPL_ID, nls.localize(4, null));
    registerDebugCommandPaletteItem(debugCommands_1.JUMP_TO_CURSOR_ID, nls.localize(5, null), debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED);
    registerDebugCommandPaletteItem(debugCommands_1.JUMP_TO_CURSOR_ID, nls.localize(6, null), debug_1.CONTEXT_JUMP_TO_CURSOR_SUPPORTED);
    registerDebugCommandPaletteItem(debugEditorActions_1.RunToCursorAction.ID, debugEditorActions_1.RunToCursorAction.LABEL, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')));
    registerDebugCommandPaletteItem(debugCommands_1.TOGGLE_INLINE_BREAKPOINT_ID, nls.localize(7, null));
    registerDebugCommandPaletteItem(debugCommands_1.DEBUG_START_COMMAND_ID, debugCommands_1.DEBUG_START_LABEL, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.DEBUG_RUN_COMMAND_ID, debugCommands_1.DEBUG_RUN_LABEL, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* Initializing */))));
    registerDebugCommandPaletteItem(debugCommands_1.SELECT_AND_START_ID, debugCommands_1.SELECT_AND_START_LABEL, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, debug_1.CONTEXT_DEBUG_STATE.notEqualsTo((0, debug_1.getStateLabel)(1 /* Initializing */))));
    // Debug callstack context menu
    const registerDebugViewMenuItem = (menuId, id, title, order, when, precondition, group = 'navigation') => {
        actions_1.MenuRegistry.appendMenuItem(menuId, {
            group,
            when,
            order,
            command: {
                id,
                title,
                precondition
            }
        });
    };
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, 10, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.DISCONNECT_ID, debugCommands_1.DISCONNECT_LABEL, 20, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, 30, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('session'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, 10, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('running')));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, 10, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, 20, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, 30, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, 40, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'));
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.TERMINATE_THREAD_ID, nls.localize(8, null), 10, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('thread'), undefined, 'termination');
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.RESTART_FRAME_ID, nls.localize(9, null), 10, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('stackFrame'), debug_1.CONTEXT_RESTART_FRAME_SUPPORTED), debug_1.CONTEXT_STACK_FRAME_SUPPORTS_RESTART);
    registerDebugViewMenuItem(actions_1.MenuId.DebugCallStackContext, debugCommands_1.COPY_STACK_TRACE_ID, nls.localize(10, null), 20, debug_1.CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo('stackFrame'));
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.SET_VARIABLE_ID, nls.localize(11, null), 10, debug_1.CONTEXT_SET_VARIABLE_SUPPORTED, undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.COPY_VALUE_ID, nls.localize(12, null), 10, undefined, undefined, '5_cutcopypaste');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.COPY_EVALUATE_PATH_ID, nls.localize(13, null), 20, debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, undefined, '5_cutcopypaste');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.ADD_TO_WATCH_ID, nls.localize(14, null), 100, debug_1.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.BREAK_WHEN_VALUE_IS_READ_ID, nls.localize(15, null), 200, debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.BREAK_WHEN_VALUE_CHANGES_ID, nls.localize(16, null), 210, debug_1.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugVariablesContext, variablesView_1.BREAK_WHEN_VALUE_IS_ACCESSED_ID, nls.localize(17, null), 220, debug_1.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, watchExpressionsView_1.ADD_WATCH_ID, watchExpressionsView_1.ADD_WATCH_LABEL, 10, undefined, undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, debugCommands_1.EDIT_EXPRESSION_COMMAND_ID, nls.localize(18, null), 20, debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('expression'), undefined, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, variablesView_1.COPY_VALUE_ID, nls.localize(19, null), 30, contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('expression'), debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('variable')), debug_1.CONTEXT_IN_DEBUG_MODE, '3_modification');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, debugCommands_1.REMOVE_EXPRESSION_COMMAND_ID, nls.localize(20, null), 10, debug_1.CONTEXT_WATCH_ITEM_TYPE.isEqualTo('expression'), undefined, 'z_commands');
    registerDebugViewMenuItem(actions_1.MenuId.DebugWatchContext, watchExpressionsView_1.REMOVE_WATCH_EXPRESSIONS_COMMAND_ID, watchExpressionsView_1.REMOVE_WATCH_EXPRESSIONS_LABEL, 20, undefined, undefined, 'z_commands');
    // Touch Bar
    if (platform_2.isMacintosh) {
        const registerTouchBarEntry = (id, title, order, when, iconUri) => {
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.TouchBarContext, {
                command: {
                    id,
                    title,
                    icon: { dark: iconUri }
                },
                when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_DEBUGGERS_AVAILABLE, when),
                group: '9_debug',
                order
            });
        };
        registerTouchBarEntry(debugCommands_1.DEBUG_START_COMMAND_ID, debugCommands_1.DEBUG_START_LABEL, 0, debug_1.CONTEXT_IN_DEBUG_MODE.toNegated(), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/continue-tb.png', require));
        registerTouchBarEntry(debugCommands_1.DEBUG_RUN_COMMAND_ID, debugCommands_1.DEBUG_RUN_LABEL, 1, debug_1.CONTEXT_IN_DEBUG_MODE.toNegated(), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/continue-without-debugging-tb.png', require));
        registerTouchBarEntry(debugCommands_1.CONTINUE_ID, debugCommands_1.CONTINUE_LABEL, 0, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/continue-tb.png', require));
        registerTouchBarEntry(debugCommands_1.PAUSE_ID, debugCommands_1.PAUSE_LABEL, 1, contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, contextkey_1.ContextKeyExpr.notEquals('debugState', 'stopped')), network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/pause-tb.png', require));
        registerTouchBarEntry(debugCommands_1.STEP_OVER_ID, debugCommands_1.STEP_OVER_LABEL, 2, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stepover-tb.png', require));
        registerTouchBarEntry(debugCommands_1.STEP_INTO_ID, debugCommands_1.STEP_INTO_LABEL, 3, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stepinto-tb.png', require));
        registerTouchBarEntry(debugCommands_1.STEP_OUT_ID, debugCommands_1.STEP_OUT_LABEL, 4, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stepout-tb.png', require));
        registerTouchBarEntry(debugCommands_1.RESTART_SESSION_ID, debugCommands_1.RESTART_LABEL, 5, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/restart-tb.png', require));
        registerTouchBarEntry(debugCommands_1.STOP_ID, debugCommands_1.STOP_LABEL, 6, debug_1.CONTEXT_IN_DEBUG_MODE, network_1.FileAccess.asFileUri('vs/workbench/contrib/debug/browser/media/stop-tb.png', require));
    }
    // Debug menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.DEBUG_START_COMMAND_ID,
            title: nls.localize(21, null)
        },
        order: 1,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.DEBUG_RUN_COMMAND_ID,
            title: nls.localize(22, null)
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.STOP_ID,
            title: nls.localize(23, null),
            precondition: debug_1.CONTEXT_IN_DEBUG_MODE
        },
        order: 3,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '1_debug',
        command: {
            id: debugCommands_1.RESTART_SESSION_ID,
            title: nls.localize(24, null),
            precondition: debug_1.CONTEXT_IN_DEBUG_MODE
        },
        order: 4,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // Configuration
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '2_configuration',
        command: {
            id: debugCommands_1.ADD_CONFIGURATION_ID,
            title: nls.localize(25, null)
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // Step Commands
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.STEP_OVER_ID,
            title: nls.localize(26, null),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 1,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.STEP_INTO_ID,
            title: nls.localize(27, null),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.STEP_OUT_ID,
            title: nls.localize(28, null),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 3,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '3_step',
        command: {
            id: debugCommands_1.CONTINUE_ID,
            title: nls.localize(29, null),
            precondition: debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped')
        },
        order: 4,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // New Breakpoints
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarNewBreakpointMenu, {
        group: '1_breakpoints',
        command: {
            id: debugCommands_1.TOGGLE_INLINE_BREAKPOINT_ID,
            title: nls.localize(30, null)
        },
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: '4_new_breakpoint',
        title: nls.localize(31, null),
        submenu: actions_1.MenuId.MenubarNewBreakpointMenu,
        order: 2,
        when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
    });
    // Breakpoint actions are registered from breakpointsView.ts
    // Install Debuggers
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarDebugMenu, {
        group: 'z_install',
        command: {
            id: 'debug.installAdditionalDebuggers',
            title: nls.localize(32, null)
        },
        order: 1
    });
    // register repl panel
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: debug_1.DEBUG_PANEL_ID,
        title: nls.localize(33, null),
        icon: icons.debugConsoleViewIcon,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [debug_1.DEBUG_PANEL_ID, { mergeViewWithContainerWhenSingleView: true, donotShowContainerTitleWhenMergedWithContainer: true }]),
        storageId: debug_1.DEBUG_PANEL_ID,
        hideIfEmpty: true,
    }, 1 /* Panel */, { donotRegisterOpenCommand: true });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: debug_1.REPL_VIEW_ID,
            name: nls.localize(34, null),
            containerIcon: icons.debugConsoleViewIcon,
            canToggleVisibility: false,
            canMoveView: true,
            when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
            ctorDescriptor: new descriptors_1.SyncDescriptor(repl_1.Repl),
            openCommandActionDescriptor: {
                id: 'workbench.debug.action.toggleRepl',
                mnemonicTitle: nls.localize(35, null),
                keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 55 /* KEY_Y */ },
                order: 2
            }
        }], VIEW_CONTAINER);
    const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: debug_1.VIEWLET_ID,
        title: nls.localize(36, null),
        openCommandActionDescriptor: {
            id: debug_1.VIEWLET_ID,
            mnemonicTitle: nls.localize(37, null),
            keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 34 /* KEY_D */ },
            order: 3
        },
        ctorDescriptor: new descriptors_1.SyncDescriptor(debugViewlet_1.DebugViewPaneContainer),
        icon: icons.runViewIcon,
        alwaysUseContainerInfo: true,
        order: 3,
    }, 0 /* Sidebar */);
    // Register default debug views
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViews([{ id: debug_1.VARIABLES_VIEW_ID, name: nls.localize(38, null), containerIcon: icons.variablesViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(variablesView_1.VariablesView), order: 10, weight: 40, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusVariablesView' }, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.WATCH_VIEW_ID, name: nls.localize(39, null), containerIcon: icons.watchViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(watchExpressionsView_1.WatchExpressionsView), order: 20, weight: 10, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusWatchView' }, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.CALLSTACK_VIEW_ID, name: nls.localize(40, null), containerIcon: icons.callStackViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(callStackView_1.CallStackView), order: 30, weight: 30, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusCallStackView' }, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('default') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.BREAKPOINTS_VIEW_ID, name: nls.localize(41, null), containerIcon: icons.breakpointsViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(breakpointsView_1.BreakpointsView), order: 40, weight: 20, canToggleVisibility: true, canMoveView: true, focusCommand: { id: 'workbench.debug.action.focusBreakpointsView' }, when: contextkey_1.ContextKeyExpr.or(debug_1.CONTEXT_BREAKPOINTS_EXIST, debug_1.CONTEXT_DEBUG_UX.isEqualTo('default')) }], viewContainer);
    viewsRegistry.registerViews([{ id: welcomeView_1.WelcomeView.ID, name: welcomeView_1.WelcomeView.LABEL, containerIcon: icons.runViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(welcomeView_1.WelcomeView), order: 1, weight: 40, canToggleVisibility: true, when: debug_1.CONTEXT_DEBUG_UX.isEqualTo('simple') }], viewContainer);
    viewsRegistry.registerViews([{ id: debug_1.LOADED_SCRIPTS_VIEW_ID, name: nls.localize(42, null), containerIcon: icons.loadedScriptsViewIcon, ctorDescriptor: new descriptors_1.SyncDescriptor(loadedScriptsView_1.LoadedScriptsView), order: 35, weight: 5, canToggleVisibility: true, canMoveView: true, collapsed: true, when: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_LOADED_SCRIPTS_SUPPORTED, debug_1.CONTEXT_DEBUG_UX.isEqualTo('default')) }], viewContainer);
    // Register configuration
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'debug',
        order: 20,
        title: nls.localize(43, null),
        type: 'object',
        properties: {
            'debug.allowBreakpointsEverywhere': {
                type: 'boolean',
                description: nls.localize(44, null),
                default: false
            },
            'debug.openExplorerOnEnd': {
                type: 'boolean',
                description: nls.localize(45, null),
                default: false
            },
            'debug.inlineValues': {
                type: ['boolean', 'string'],
                'enum': [true, false, 'auto'],
                description: nls.localize(46, null),
                'enumDescriptions': [
                    nls.localize(47, null),
                    nls.localize(48, null),
                    nls.localize(49, null),
                ],
                default: 'auto'
            },
            'debug.toolBarLocation': {
                enum: ['floating', 'docked', 'hidden'],
                markdownDescription: nls.localize(50, null),
                default: 'floating'
            },
            'debug.showInStatusBar': {
                enum: ['never', 'always', 'onFirstSessionStart'],
                enumDescriptions: [nls.localize(51, null), nls.localize(52, null), nls.localize(53, null)],
                description: nls.localize(54, null),
                default: 'onFirstSessionStart'
            },
            'debug.internalConsoleOptions': debug_1.INTERNAL_CONSOLE_OPTIONS_SCHEMA,
            'debug.console.closeOnEnd': {
                type: 'boolean',
                description: nls.localize(55, null),
                default: false
            },
            'debug.terminal.clearBeforeReusing': {
                type: 'boolean',
                description: nls.localize(56, null),
                default: false
            },
            'debug.openDebug': {
                enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart', 'openOnDebugBreak'],
                default: 'openOnDebugBreak',
                description: nls.localize(57, null)
            },
            'debug.showSubSessionsInToolBar': {
                type: 'boolean',
                description: nls.localize(58, null),
                default: false
            },
            'debug.console.fontSize': {
                type: 'number',
                description: nls.localize(59, null),
                default: platform_2.isMacintosh ? 12 : 14,
            },
            'debug.console.fontFamily': {
                type: 'string',
                description: nls.localize(60, null),
                default: 'default'
            },
            'debug.console.lineHeight': {
                type: 'number',
                description: nls.localize(61, null),
                default: 0
            },
            'debug.console.wordWrap': {
                type: 'boolean',
                description: nls.localize(62, null),
                default: true
            },
            'debug.console.historySuggestions': {
                type: 'boolean',
                description: nls.localize(63, null),
                default: true
            },
            'debug.console.collapseIdenticalLines': {
                type: 'boolean',
                description: nls.localize(64, null),
                default: true
            },
            'launch': {
                type: 'object',
                description: nls.localize(65, null),
                default: { configurations: [], compounds: [] },
                $ref: configuration_1.launchSchemaId
            },
            'debug.focusWindowOnBreak': {
                type: 'boolean',
                description: nls.localize(66, null),
                default: true
            },
            'debug.onTaskErrors': {
                enum: ['debugAnyway', 'showErrors', 'prompt', 'abort'],
                enumDescriptions: [nls.localize(67, null), nls.localize(68, null), nls.localize(69, null), nls.localize(70, null)],
                description: nls.localize(71, null),
                default: 'prompt'
            },
            'debug.showBreakpointsInOverviewRuler': {
                type: 'boolean',
                description: nls.localize(72, null),
                default: false
            },
            'debug.showInlineBreakpointCandidates': {
                type: 'boolean',
                description: nls.localize(73, null),
                default: true
            },
            'debug.saveBeforeStart': {
                description: nls.localize(74, null),
                enum: ['allEditorsInActiveGroup', 'nonUntitledEditorsInActiveGroup', 'none'],
                enumDescriptions: [
                    nls.localize(75, null),
                    nls.localize(76, null),
                    nls.localize(77, null),
                ],
                default: 'allEditorsInActiveGroup'
            }
        }
    });
});
//# sourceMappingURL=debug.contribution.js.map