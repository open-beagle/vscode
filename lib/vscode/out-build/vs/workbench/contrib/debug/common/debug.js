/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/debug", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, instantiation_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreakpointWidgetContext = exports.IDebugService = exports.getStateLabel = exports.State = exports.INTERNAL_CONSOLE_OPTIONS_SCHEMA = exports.DEBUG_SCHEME = exports.BREAKPOINT_EDITOR_CONTRIBUTION_ID = exports.EDITOR_CONTRIBUTION_ID = exports.CONTEXT_MULTI_SESSION_DEBUG = exports.CONTEXT_MULTI_SESSION_REPL = exports.CONTEXT_EXCEPTION_WIDGET_VISIBLE = exports.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT = exports.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED = exports.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED = exports.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED = exports.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED = exports.CONTEXT_SET_VARIABLE_SUPPORTED = exports.CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT = exports.CONTEXT_DEBUGGERS_AVAILABLE = exports.CONTEXT_BREAKPOINTS_EXIST = exports.CONTEXT_STEP_INTO_TARGETS_SUPPORTED = exports.CONTEXT_JUMP_TO_CURSOR_SUPPORTED = exports.CONTEXT_STACK_FRAME_SUPPORTS_RESTART = exports.CONTEXT_RESTART_FRAME_SUPPORTED = exports.CONTEXT_STEP_BACK_SUPPORTED = exports.CONTEXT_FOCUSED_SESSION_IS_ATTACH = exports.CONTEXT_LOADED_SCRIPTS_ITEM_TYPE = exports.CONTEXT_LOADED_SCRIPTS_SUPPORTED = exports.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION = exports.CONTEXT_BREAKPOINT_ACCESS_TYPE = exports.CONTEXT_BREAKPOINT_ITEM_TYPE = exports.CONTEXT_WATCH_ITEM_TYPE = exports.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD = exports.CONTEXT_CALLSTACK_ITEM_STOPPED = exports.CONTEXT_CALLSTACK_SESSION_IS_ATTACH = exports.CONTEXT_CALLSTACK_ITEM_TYPE = exports.CONTEXT_BREAKPOINT_INPUT_FOCUSED = exports.CONTEXT_EXPRESSION_SELECTED = exports.CONTEXT_VARIABLES_FOCUSED = exports.CONTEXT_WATCH_EXPRESSIONS_EXIST = exports.CONTEXT_WATCH_EXPRESSIONS_FOCUSED = exports.CONTEXT_BREAKPOINTS_FOCUSED = exports.CONTEXT_IN_BREAKPOINT_WIDGET = exports.CONTEXT_BREAKPOINT_WIDGET_VISIBLE = exports.CONTEXT_IN_DEBUG_REPL = exports.CONTEXT_IN_DEBUG_MODE = exports.CONTEXT_DEBUG_UX = exports.CONTEXT_DEBUG_UX_KEY = exports.CONTEXT_DEBUG_STATE = exports.CONTEXT_DEBUG_CONFIGURATION_TYPE = exports.CONTEXT_DEBUG_TYPE = exports.DEBUG_SERVICE_ID = exports.REPL_VIEW_ID = exports.DEBUG_PANEL_ID = exports.BREAKPOINTS_VIEW_ID = exports.LOADED_SCRIPTS_VIEW_ID = exports.CALLSTACK_VIEW_ID = exports.WATCH_VIEW_ID = exports.VARIABLES_VIEW_ID = exports.VIEWLET_ID = void 0;
    exports.VIEWLET_ID = 'workbench.view.debug';
    exports.VARIABLES_VIEW_ID = 'workbench.debug.variablesView';
    exports.WATCH_VIEW_ID = 'workbench.debug.watchExpressionsView';
    exports.CALLSTACK_VIEW_ID = 'workbench.debug.callStackView';
    exports.LOADED_SCRIPTS_VIEW_ID = 'workbench.debug.loadedScriptsView';
    exports.BREAKPOINTS_VIEW_ID = 'workbench.debug.breakPointsView';
    exports.DEBUG_PANEL_ID = 'workbench.panel.repl';
    exports.REPL_VIEW_ID = 'workbench.panel.repl.view';
    exports.DEBUG_SERVICE_ID = 'debugService';
    exports.CONTEXT_DEBUG_TYPE = new contextkey_1.RawContextKey('debugType', undefined, { type: 'string', description: nls.localize(0, null) });
    exports.CONTEXT_DEBUG_CONFIGURATION_TYPE = new contextkey_1.RawContextKey('debugConfigurationType', undefined, { type: 'string', description: nls.localize(1, null) });
    exports.CONTEXT_DEBUG_STATE = new contextkey_1.RawContextKey('debugState', 'inactive', { type: 'string', description: nls.localize(2, null) });
    exports.CONTEXT_DEBUG_UX_KEY = 'debugUx';
    exports.CONTEXT_DEBUG_UX = new contextkey_1.RawContextKey(exports.CONTEXT_DEBUG_UX_KEY, 'default', { type: 'string', description: nls.localize(3, null) });
    exports.CONTEXT_IN_DEBUG_MODE = new contextkey_1.RawContextKey('inDebugMode', false, { type: 'boolean', description: nls.localize(4, null) });
    exports.CONTEXT_IN_DEBUG_REPL = new contextkey_1.RawContextKey('inDebugRepl', false, { type: 'boolean', description: nls.localize(5, null) });
    exports.CONTEXT_BREAKPOINT_WIDGET_VISIBLE = new contextkey_1.RawContextKey('breakpointWidgetVisible', false, { type: 'boolean', description: nls.localize(6, null) });
    exports.CONTEXT_IN_BREAKPOINT_WIDGET = new contextkey_1.RawContextKey('inBreakpointWidget', false, { type: 'boolean', description: nls.localize(7, null) });
    exports.CONTEXT_BREAKPOINTS_FOCUSED = new contextkey_1.RawContextKey('breakpointsFocused', true, { type: 'boolean', description: nls.localize(8, null) });
    exports.CONTEXT_WATCH_EXPRESSIONS_FOCUSED = new contextkey_1.RawContextKey('watchExpressionsFocused', true, { type: 'boolean', description: nls.localize(9, null) });
    exports.CONTEXT_WATCH_EXPRESSIONS_EXIST = new contextkey_1.RawContextKey('watchExpressionsExist', false, { type: 'boolean', description: nls.localize(10, null) });
    exports.CONTEXT_VARIABLES_FOCUSED = new contextkey_1.RawContextKey('variablesFocused', true, { type: 'boolean', description: nls.localize(11, null) });
    exports.CONTEXT_EXPRESSION_SELECTED = new contextkey_1.RawContextKey('expressionSelected', false, { type: 'boolean', description: nls.localize(12, null) });
    exports.CONTEXT_BREAKPOINT_INPUT_FOCUSED = new contextkey_1.RawContextKey('breakpointInputFocused', false, { type: 'boolean', description: nls.localize(13, null) });
    exports.CONTEXT_CALLSTACK_ITEM_TYPE = new contextkey_1.RawContextKey('callStackItemType', undefined, { type: 'string', description: nls.localize(14, null) });
    exports.CONTEXT_CALLSTACK_SESSION_IS_ATTACH = new contextkey_1.RawContextKey('callStackSessionIsAttach', false, { type: 'boolean', description: nls.localize(15, null) });
    exports.CONTEXT_CALLSTACK_ITEM_STOPPED = new contextkey_1.RawContextKey('callStackItemStopped', false, { type: 'boolean', description: nls.localize(16, null) });
    exports.CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD = new contextkey_1.RawContextKey('callStackSessionHasOneThread', false, { type: 'boolean', description: nls.localize(17, null) });
    exports.CONTEXT_WATCH_ITEM_TYPE = new contextkey_1.RawContextKey('watchItemType', undefined, { type: 'string', description: nls.localize(18, null) });
    exports.CONTEXT_BREAKPOINT_ITEM_TYPE = new contextkey_1.RawContextKey('breakpointItemType', undefined, { type: 'string', description: nls.localize(19, null) });
    exports.CONTEXT_BREAKPOINT_ACCESS_TYPE = new contextkey_1.RawContextKey('breakpointAccessType', undefined, { type: 'string', description: nls.localize(20, null) });
    exports.CONTEXT_BREAKPOINT_SUPPORTS_CONDITION = new contextkey_1.RawContextKey('breakpointSupportsCondition', false, { type: 'boolean', description: nls.localize(21, null) });
    exports.CONTEXT_LOADED_SCRIPTS_SUPPORTED = new contextkey_1.RawContextKey('loadedScriptsSupported', false, { type: 'boolean', description: nls.localize(22, null) });
    exports.CONTEXT_LOADED_SCRIPTS_ITEM_TYPE = new contextkey_1.RawContextKey('loadedScriptsItemType', undefined, { type: 'string', description: nls.localize(23, null) });
    exports.CONTEXT_FOCUSED_SESSION_IS_ATTACH = new contextkey_1.RawContextKey('focusedSessionIsAttach', false, { type: 'boolean', description: nls.localize(24, null) });
    exports.CONTEXT_STEP_BACK_SUPPORTED = new contextkey_1.RawContextKey('stepBackSupported', false, { type: 'boolean', description: nls.localize(25, null) });
    exports.CONTEXT_RESTART_FRAME_SUPPORTED = new contextkey_1.RawContextKey('restartFrameSupported', false, { type: 'boolean', description: nls.localize(26, null) });
    exports.CONTEXT_STACK_FRAME_SUPPORTS_RESTART = new contextkey_1.RawContextKey('stackFrameSupportsRestart', false, { type: 'boolean', description: nls.localize(27, null) });
    exports.CONTEXT_JUMP_TO_CURSOR_SUPPORTED = new contextkey_1.RawContextKey('jumpToCursorSupported', false, { type: 'boolean', description: nls.localize(28, null) });
    exports.CONTEXT_STEP_INTO_TARGETS_SUPPORTED = new contextkey_1.RawContextKey('stepIntoTargetsSupported', false, { type: 'boolean', description: nls.localize(29, null) });
    exports.CONTEXT_BREAKPOINTS_EXIST = new contextkey_1.RawContextKey('breakpointsExist', false, { type: 'boolean', description: nls.localize(30, null) });
    exports.CONTEXT_DEBUGGERS_AVAILABLE = new contextkey_1.RawContextKey('debuggersAvailable', false, { type: 'boolean', description: nls.localize(31, null) });
    exports.CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT = new contextkey_1.RawContextKey('debugProtocolVariableMenuContext', undefined, { type: 'string', description: nls.localize(32, null) });
    exports.CONTEXT_SET_VARIABLE_SUPPORTED = new contextkey_1.RawContextKey('debugSetVariableSupported', false, { type: 'boolean', description: nls.localize(33, null) });
    exports.CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED = new contextkey_1.RawContextKey('breakWhenValueChangesSupported', false, { type: 'boolean', description: nls.localize(34, null) });
    exports.CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED = new contextkey_1.RawContextKey('breakWhenValueIsAccessedSupported', false, { type: 'boolean', description: nls.localize(35, null) });
    exports.CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED = new contextkey_1.RawContextKey('breakWhenValueIsReadSupported', false, { type: 'boolean', description: nls.localize(36, null) });
    exports.CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED = new contextkey_1.RawContextKey('terminateDebuggeeSupported', false, { type: 'boolean', description: nls.localize(37, null) });
    exports.CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT = new contextkey_1.RawContextKey('variableEvaluateNamePresent', false, { type: 'boolean', description: nls.localize(38, null) });
    exports.CONTEXT_EXCEPTION_WIDGET_VISIBLE = new contextkey_1.RawContextKey('exceptionWidgetVisible', false, { type: 'boolean', description: nls.localize(39, null) });
    exports.CONTEXT_MULTI_SESSION_REPL = new contextkey_1.RawContextKey('multiSessionRepl', false, { type: 'boolean', description: nls.localize(40, null) });
    exports.CONTEXT_MULTI_SESSION_DEBUG = new contextkey_1.RawContextKey('multiSessionDebug', false, { type: 'boolean', description: nls.localize(41, null) });
    exports.EDITOR_CONTRIBUTION_ID = 'editor.contrib.debug';
    exports.BREAKPOINT_EDITOR_CONTRIBUTION_ID = 'editor.contrib.breakpoint';
    exports.DEBUG_SCHEME = 'debug';
    exports.INTERNAL_CONSOLE_OPTIONS_SCHEMA = {
        enum: ['neverOpen', 'openOnSessionStart', 'openOnFirstSessionStart'],
        default: 'openOnFirstSessionStart',
        description: nls.localize(42, null)
    };
    var State;
    (function (State) {
        State[State["Inactive"] = 0] = "Inactive";
        State[State["Initializing"] = 1] = "Initializing";
        State[State["Stopped"] = 2] = "Stopped";
        State[State["Running"] = 3] = "Running";
    })(State = exports.State || (exports.State = {}));
    function getStateLabel(state) {
        switch (state) {
            case 1 /* Initializing */: return 'initializing';
            case 2 /* Stopped */: return 'stopped';
            case 3 /* Running */: return 'running';
            default: return 'inactive';
        }
    }
    exports.getStateLabel = getStateLabel;
    // Debug service interfaces
    exports.IDebugService = (0, instantiation_1.createDecorator)(exports.DEBUG_SERVICE_ID);
    // Editor interfaces
    var BreakpointWidgetContext;
    (function (BreakpointWidgetContext) {
        BreakpointWidgetContext[BreakpointWidgetContext["CONDITION"] = 0] = "CONDITION";
        BreakpointWidgetContext[BreakpointWidgetContext["HIT_COUNT"] = 1] = "HIT_COUNT";
        BreakpointWidgetContext[BreakpointWidgetContext["LOG_MESSAGE"] = 2] = "LOG_MESSAGE";
    })(BreakpointWidgetContext = exports.BreakpointWidgetContext || (exports.BreakpointWidgetContext = {}));
});
//# sourceMappingURL=debug.js.map