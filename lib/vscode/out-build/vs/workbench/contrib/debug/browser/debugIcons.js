/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.debugConsoleEvaluationPrompt = exports.debugConsoleEvaluationInput = exports.breakpointsActivate = exports.breakpointsRemoveAll = exports.watchExpressionsAddFuncBreakpoint = exports.watchExpressionsAdd = exports.watchExpressionsRemoveAll = exports.debugConsoleClearAll = exports.callstackViewSession = exports.debugCollapseAll = exports.debugConsole = exports.debugConfigure = exports.debugStart = exports.debugReverseContinue = exports.debugContinue = exports.debugPause = exports.debugStepBack = exports.debugStepOut = exports.debugStepInto = exports.debugStepOver = exports.debugRestart = exports.debugDisconnect = exports.debugStop = exports.debugRestartFrame = exports.debugGripper = exports.debugStackframeFocused = exports.debugStackframe = exports.allBreakpoints = exports.debugBreakpointUnsupported = exports.debugBreakpointHint = exports.logBreakpoint = exports.dataBreakpoint = exports.conditionalBreakpoint = exports.functionBreakpoint = exports.breakpoint = exports.loadedScriptsViewIcon = exports.breakpointsViewIcon = exports.callStackViewIcon = exports.watchViewIcon = exports.variablesViewIcon = exports.runViewIcon = exports.debugConsoleViewIcon = void 0;
    exports.debugConsoleViewIcon = (0, iconRegistry_1.registerIcon)('debug-console-view-icon', codicons_1.Codicon.debugConsole, (0, nls_1.localize)(0, null));
    exports.runViewIcon = (0, iconRegistry_1.registerIcon)('run-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)(1, null));
    exports.variablesViewIcon = (0, iconRegistry_1.registerIcon)('variables-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)(2, null));
    exports.watchViewIcon = (0, iconRegistry_1.registerIcon)('watch-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)(3, null));
    exports.callStackViewIcon = (0, iconRegistry_1.registerIcon)('callstack-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)(4, null));
    exports.breakpointsViewIcon = (0, iconRegistry_1.registerIcon)('breakpoints-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)(5, null));
    exports.loadedScriptsViewIcon = (0, iconRegistry_1.registerIcon)('loaded-scripts-view-icon', codicons_1.Codicon.debugAlt, (0, nls_1.localize)(6, null));
    exports.breakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint', codicons_1.Codicon.debugBreakpoint, (0, nls_1.localize)(7, null)),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-disabled', codicons_1.Codicon.debugBreakpointDisabled, (0, nls_1.localize)(8, null)),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-unverified', codicons_1.Codicon.debugBreakpointUnverified, (0, nls_1.localize)(9, null))
    };
    exports.functionBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-function', codicons_1.Codicon.debugBreakpointFunction, (0, nls_1.localize)(10, null)),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-function-disabled', codicons_1.Codicon.debugBreakpointFunctionDisabled, (0, nls_1.localize)(11, null)),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-function-unverified', codicons_1.Codicon.debugBreakpointFunctionUnverified, (0, nls_1.localize)(12, null))
    };
    exports.conditionalBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-conditional', codicons_1.Codicon.debugBreakpointConditional, (0, nls_1.localize)(13, null)),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-conditional-disabled', codicons_1.Codicon.debugBreakpointConditionalDisabled, (0, nls_1.localize)(14, null)),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-conditional-unverified', codicons_1.Codicon.debugBreakpointConditionalUnverified, (0, nls_1.localize)(15, null))
    };
    exports.dataBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-data', codicons_1.Codicon.debugBreakpointData, (0, nls_1.localize)(16, null)),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-data-disabled', codicons_1.Codicon.debugBreakpointDataDisabled, (0, nls_1.localize)(17, null)),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-data-unverified', codicons_1.Codicon.debugBreakpointDataUnverified, (0, nls_1.localize)(18, null)),
    };
    exports.logBreakpoint = {
        regular: (0, iconRegistry_1.registerIcon)('debug-breakpoint-log', codicons_1.Codicon.debugBreakpointLog, (0, nls_1.localize)(19, null)),
        disabled: (0, iconRegistry_1.registerIcon)('debug-breakpoint-log-disabled', codicons_1.Codicon.debugBreakpointLogDisabled, (0, nls_1.localize)(20, null)),
        unverified: (0, iconRegistry_1.registerIcon)('debug-breakpoint-log-unverified', codicons_1.Codicon.debugBreakpointLogUnverified, (0, nls_1.localize)(21, null)),
    };
    exports.debugBreakpointHint = (0, iconRegistry_1.registerIcon)('debug-hint', codicons_1.Codicon.debugHint, (0, nls_1.localize)(22, null));
    exports.debugBreakpointUnsupported = (0, iconRegistry_1.registerIcon)('debug-breakpoint-unsupported', codicons_1.Codicon.debugBreakpointUnsupported, (0, nls_1.localize)(23, null));
    exports.allBreakpoints = [exports.breakpoint, exports.functionBreakpoint, exports.conditionalBreakpoint, exports.dataBreakpoint, exports.logBreakpoint];
    exports.debugStackframe = (0, iconRegistry_1.registerIcon)('debug-stackframe', codicons_1.Codicon.debugStackframe, (0, nls_1.localize)(24, null));
    exports.debugStackframeFocused = (0, iconRegistry_1.registerIcon)('debug-stackframe-focused', codicons_1.Codicon.debugStackframeFocused, (0, nls_1.localize)(25, null));
    exports.debugGripper = (0, iconRegistry_1.registerIcon)('debug-gripper', codicons_1.Codicon.gripper, (0, nls_1.localize)(26, null));
    exports.debugRestartFrame = (0, iconRegistry_1.registerIcon)('debug-restart-frame', codicons_1.Codicon.debugRestartFrame, (0, nls_1.localize)(27, null));
    exports.debugStop = (0, iconRegistry_1.registerIcon)('debug-stop', codicons_1.Codicon.debugStop, (0, nls_1.localize)(28, null));
    exports.debugDisconnect = (0, iconRegistry_1.registerIcon)('debug-disconnect', codicons_1.Codicon.debugDisconnect, (0, nls_1.localize)(29, null));
    exports.debugRestart = (0, iconRegistry_1.registerIcon)('debug-restart', codicons_1.Codicon.debugRestart, (0, nls_1.localize)(30, null));
    exports.debugStepOver = (0, iconRegistry_1.registerIcon)('debug-step-over', codicons_1.Codicon.debugStepOver, (0, nls_1.localize)(31, null));
    exports.debugStepInto = (0, iconRegistry_1.registerIcon)('debug-step-into', codicons_1.Codicon.debugStepInto, (0, nls_1.localize)(32, null));
    exports.debugStepOut = (0, iconRegistry_1.registerIcon)('debug-step-out', codicons_1.Codicon.debugStepOut, (0, nls_1.localize)(33, null));
    exports.debugStepBack = (0, iconRegistry_1.registerIcon)('debug-step-back', codicons_1.Codicon.debugStepBack, (0, nls_1.localize)(34, null));
    exports.debugPause = (0, iconRegistry_1.registerIcon)('debug-pause', codicons_1.Codicon.debugPause, (0, nls_1.localize)(35, null));
    exports.debugContinue = (0, iconRegistry_1.registerIcon)('debug-continue', codicons_1.Codicon.debugContinue, (0, nls_1.localize)(36, null));
    exports.debugReverseContinue = (0, iconRegistry_1.registerIcon)('debug-reverse-continue', codicons_1.Codicon.debugReverseContinue, (0, nls_1.localize)(37, null));
    exports.debugStart = (0, iconRegistry_1.registerIcon)('debug-start', codicons_1.Codicon.debugStart, (0, nls_1.localize)(38, null));
    exports.debugConfigure = (0, iconRegistry_1.registerIcon)('debug-configure', codicons_1.Codicon.gear, (0, nls_1.localize)(39, null));
    exports.debugConsole = (0, iconRegistry_1.registerIcon)('debug-console', codicons_1.Codicon.gear, (0, nls_1.localize)(40, null));
    exports.debugCollapseAll = (0, iconRegistry_1.registerIcon)('debug-collapse-all', codicons_1.Codicon.collapseAll, (0, nls_1.localize)(41, null));
    exports.callstackViewSession = (0, iconRegistry_1.registerIcon)('callstack-view-session', codicons_1.Codicon.bug, (0, nls_1.localize)(42, null));
    exports.debugConsoleClearAll = (0, iconRegistry_1.registerIcon)('debug-console-clear-all', codicons_1.Codicon.clearAll, (0, nls_1.localize)(43, null));
    exports.watchExpressionsRemoveAll = (0, iconRegistry_1.registerIcon)('watch-expressions-remove-all', codicons_1.Codicon.closeAll, (0, nls_1.localize)(44, null));
    exports.watchExpressionsAdd = (0, iconRegistry_1.registerIcon)('watch-expressions-add', codicons_1.Codicon.add, (0, nls_1.localize)(45, null));
    exports.watchExpressionsAddFuncBreakpoint = (0, iconRegistry_1.registerIcon)('watch-expressions-add-function-breakpoint', codicons_1.Codicon.add, (0, nls_1.localize)(46, null));
    exports.breakpointsRemoveAll = (0, iconRegistry_1.registerIcon)('breakpoints-remove-all', codicons_1.Codicon.closeAll, (0, nls_1.localize)(47, null));
    exports.breakpointsActivate = (0, iconRegistry_1.registerIcon)('breakpoints-activate', codicons_1.Codicon.activateBreakpoints, (0, nls_1.localize)(48, null));
    exports.debugConsoleEvaluationInput = (0, iconRegistry_1.registerIcon)('debug-console-evaluation-input', codicons_1.Codicon.arrowSmallRight, (0, nls_1.localize)(49, null));
    exports.debugConsoleEvaluationPrompt = (0, iconRegistry_1.registerIcon)('debug-console-evaluation-prompt', codicons_1.Codicon.chevronRight, (0, nls_1.localize)(50, null));
});
//# sourceMappingURL=debugIcons.js.map