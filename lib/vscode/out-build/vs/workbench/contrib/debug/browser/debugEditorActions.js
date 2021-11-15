/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/debugEditorActions", "vs/base/common/keyCodes", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/debug/browser/breakpointsView", "vs/workbench/common/panel", "vs/workbench/common/views", "vs/platform/contextview/browser/contextView", "vs/base/common/actions", "vs/base/browser/dom", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/base/common/async", "vs/platform/actions/common/actions"], function (require, exports, nls, keyCodes_1, range_1, editorContextKeys_1, editorExtensions_1, contextkey_1, debug_1, editorService_1, breakpointsView_1, panel_1, views_1, contextView_1, actions_1, dom_1, uriIdentity_1, async_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RunToCursorAction = void 0;
    class ToggleBreakpointAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.debug.action.toggleBreakpoint',
                title: {
                    value: nls.localize(0, null),
                    original: 'Toggle Breakpoint',
                    mnemonicTitle: nls.localize(1, null)
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                keybinding: {
                    when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 67 /* F9 */,
                    weight: 100 /* EditorContrib */
                },
                menu: {
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                    id: actions_2.MenuId.MenubarDebugMenu,
                    group: '4_new_breakpoint',
                    order: 1
                }
            });
        }
        async runEditorCommand(accessor, editor, ...args) {
            if (editor.hasModel()) {
                const debugService = accessor.get(debug_1.IDebugService);
                const modelUri = editor.getModel().uri;
                const canSet = debugService.canSetBreakpointsIn(editor.getModel());
                // Does not account for multi line selections, Set to remove multiple cursor on the same line
                const lineNumbers = [...new Set(editor.getSelections().map(s => s.getPosition().lineNumber))];
                await Promise.all(lineNumbers.map(async (line) => {
                    const bps = debugService.getModel().getBreakpoints({ lineNumber: line, uri: modelUri });
                    if (bps.length) {
                        await Promise.all(bps.map(bp => debugService.removeBreakpoints(bp.getId())));
                    }
                    else if (canSet) {
                        await debugService.addBreakpoints(modelUri, [{ lineNumber: line }]);
                    }
                }));
            }
        }
    }
    class ConditionalBreakpointAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.debug.action.conditionalBreakpoint',
                title: {
                    value: nls.localize(2, null),
                    original: 'Debug: Add Conditional Breakpoint...',
                    mnemonicTitle: nls.localize(3, null)
                },
                f1: true,
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                menu: {
                    id: actions_2.MenuId.MenubarNewBreakpointMenu,
                    group: '1_breakpoints',
                    order: 1,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                }
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID).showBreakpointWidget(position.lineNumber, undefined, 0 /* CONDITION */);
            }
        }
    }
    class LogPointAction extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.debug.action.addLogPoint',
                title: {
                    value: nls.localize(4, null),
                    original: 'Debug: Add Logpoint...',
                    mnemonicTitle: nls.localize(5, null)
                },
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE,
                f1: true,
                menu: {
                    id: actions_2.MenuId.MenubarNewBreakpointMenu,
                    group: '1_breakpoints',
                    order: 4,
                    when: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
                }
            });
        }
        runEditorCommand(accessor, editor, ...args) {
            const debugService = accessor.get(debug_1.IDebugService);
            const position = editor.getPosition();
            if (position && editor.hasModel() && debugService.canSetBreakpointsIn(editor.getModel())) {
                editor.getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID).showBreakpointWidget(position.lineNumber, position.column, 2 /* LOG_MESSAGE */);
            }
        }
    }
    class RunToCursorAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: RunToCursorAction.ID,
                label: RunToCursorAction.LABEL,
                alias: 'Debug: Run to Cursor',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_IN_DEBUG_MODE, panel_1.PanelFocusContext.toNegated(), debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 2
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const focusedSession = debugService.getViewModel().focusedSession;
            if (debugService.state !== 2 /* Stopped */ || !focusedSession) {
                return;
            }
            const position = editor.getPosition();
            if (!(editor.hasModel() && position)) {
                return;
            }
            const uri = editor.getModel().uri;
            const bpExists = !!(debugService.getModel().getBreakpoints({ column: position.column, lineNumber: position.lineNumber, uri }).length);
            let breakpointToRemove;
            let threadToContinue = debugService.getViewModel().focusedThread;
            if (!bpExists) {
                const addResult = await this.addBreakpoints(accessor, uri, position);
                if (addResult.thread) {
                    threadToContinue = addResult.thread;
                }
                if (addResult.breakpoint) {
                    breakpointToRemove = addResult.breakpoint;
                }
            }
            if (!threadToContinue) {
                return;
            }
            const oneTimeListener = threadToContinue.session.onDidChangeState(() => {
                const state = focusedSession.state;
                if (state === 2 /* Stopped */ || state === 0 /* Inactive */) {
                    if (breakpointToRemove) {
                        debugService.removeBreakpoints(breakpointToRemove.getId());
                    }
                    oneTimeListener.dispose();
                }
            });
            await threadToContinue.continue();
        }
        async addBreakpoints(accessor, uri, position) {
            const debugService = accessor.get(debug_1.IDebugService);
            const debugModel = debugService.getModel();
            const viewModel = debugService.getViewModel();
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            let column = 0;
            const focusedStackFrame = viewModel.focusedStackFrame;
            if (focusedStackFrame && uriIdentityService.extUri.isEqual(focusedStackFrame.source.uri, uri) && focusedStackFrame.range.startLineNumber === position.lineNumber) {
                // If the cursor is on a line different than the one the debugger is currently paused on, then send the breakpoint at column 0 on the line
                // otherwise set it at the precise column #102199
                column = position.column;
            }
            const breakpoints = await debugService.addBreakpoints(uri, [{ lineNumber: position.lineNumber, column }], false);
            const breakpoint = breakpoints === null || breakpoints === void 0 ? void 0 : breakpoints[0];
            if (!breakpoint) {
                return { breakpoint: undefined, thread: viewModel.focusedThread };
            }
            // If the breakpoint was not initially verified, wait up to 2s for it to become so.
            // Inherently racey if multiple sessions can verify async, but not solvable...
            if (!breakpoint.verified) {
                let listener;
                await (0, async_1.raceTimeout)(new Promise(resolve => {
                    listener = debugModel.onDidChangeBreakpoints(() => {
                        if (breakpoint.verified) {
                            resolve();
                        }
                    });
                }), 2000);
                listener.dispose();
            }
            // Look at paused threads for sessions that verified this bp. Prefer, in order:
            let Score;
            (function (Score) {
                /** The focused thread */
                Score[Score["Focused"] = 0] = "Focused";
                /** Any other stopped thread of a session that verified the bp */
                Score[Score["Verified"] = 1] = "Verified";
                /** Any thread that verified and paused in the same file */
                Score[Score["VerifiedAndPausedInFile"] = 2] = "VerifiedAndPausedInFile";
                /** The focused thread if it verified the breakpoint */
                Score[Score["VerifiedAndFocused"] = 3] = "VerifiedAndFocused";
            })(Score || (Score = {}));
            let bestThread = viewModel.focusedThread;
            let bestScore = 0 /* Focused */;
            for (const sessionId of breakpoint.sessionsThatVerified) {
                const session = debugModel.getSession(sessionId);
                if (!session) {
                    continue;
                }
                const threads = session.getAllThreads().filter(t => t.stopped);
                if (bestScore < 3 /* VerifiedAndFocused */) {
                    if (viewModel.focusedThread && threads.includes(viewModel.focusedThread)) {
                        bestThread = viewModel.focusedThread;
                        bestScore = 3 /* VerifiedAndFocused */;
                    }
                }
                if (bestScore < 2 /* VerifiedAndPausedInFile */) {
                    const pausedInThisFile = threads.find(t => {
                        const top = t.getTopStackFrame();
                        return top && uriIdentityService.extUri.isEqual(top.source.uri, uri);
                    });
                    if (pausedInThisFile) {
                        bestThread = pausedInThisFile;
                        bestScore = 2 /* VerifiedAndPausedInFile */;
                    }
                }
                if (bestScore < 1 /* Verified */) {
                    bestThread = threads[0];
                    bestScore = 2 /* VerifiedAndPausedInFile */;
                }
            }
            return { thread: bestThread, breakpoint };
        }
    }
    exports.RunToCursorAction = RunToCursorAction;
    RunToCursorAction.ID = 'editor.debug.action.runToCursor';
    RunToCursorAction.LABEL = nls.localize(6, null);
    class SelectionToReplAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.selectionToRepl',
                label: nls.localize(7, null),
                alias: 'Evaluate',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasNonEmptySelection, debug_1.CONTEXT_IN_DEBUG_MODE, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 0
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const viewsService = accessor.get(views_1.IViewsService);
            const viewModel = debugService.getViewModel();
            const session = viewModel.focusedSession;
            if (!editor.hasModel() || !session) {
                return;
            }
            const text = editor.getModel().getValueInRange(editor.getSelection());
            await session.addReplExpression(viewModel.focusedStackFrame, text);
            await viewsService.openView(debug_1.REPL_VIEW_ID, false);
        }
    }
    class SelectionToWatchExpressionsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.selectionToWatch',
                label: nls.localize(8, null),
                alias: 'Add to Watch',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasNonEmptySelection, debug_1.CONTEXT_IN_DEBUG_MODE, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const viewsService = accessor.get(views_1.IViewsService);
            if (!editor.hasModel()) {
                return;
            }
            const text = editor.getModel().getValueInRange(editor.getSelection());
            await viewsService.openView(debug_1.WATCH_VIEW_ID);
            debugService.addWatchExpression(text);
        }
    }
    class ShowDebugHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.showDebugHover',
                label: nls.localize(9, null),
                alias: 'Debug: Show Hover',
                precondition: debug_1.CONTEXT_IN_DEBUG_MODE,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 39 /* KEY_I */),
                    weight: 100 /* EditorContrib */
                }
            });
        }
        async run(accessor, editor) {
            const position = editor.getPosition();
            if (!position || !editor.hasModel()) {
                return;
            }
            const word = editor.getModel().getWordAtPosition(position);
            if (!word) {
                return;
            }
            const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, word.endColumn);
            return editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID).showHover(range, true);
        }
    }
    class StepIntoTargetsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: StepIntoTargetsAction.ID,
                label: StepIntoTargetsAction.LABEL,
                alias: 'Debug: Step Into Targets...',
                precondition: contextkey_1.ContextKeyExpr.and(debug_1.CONTEXT_STEP_INTO_TARGETS_SUPPORTED, debug_1.CONTEXT_IN_DEBUG_MODE, debug_1.CONTEXT_DEBUG_STATE.isEqualTo('stopped'), editorContextKeys_1.EditorContextKeys.editorTextFocus),
                contextMenuOpts: {
                    group: 'debug',
                    order: 1.5
                }
            });
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const contextMenuService = accessor.get(contextView_1.IContextMenuService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            const session = debugService.getViewModel().focusedSession;
            const frame = debugService.getViewModel().focusedStackFrame;
            if (session && frame && editor.hasModel() && uriIdentityService.extUri.isEqual(editor.getModel().uri, frame.source.uri)) {
                const targets = await session.stepInTargets(frame.frameId);
                if (!targets) {
                    return;
                }
                editor.revealLineInCenterIfOutsideViewport(frame.range.startLineNumber);
                const cursorCoords = editor.getScrolledVisiblePosition({ lineNumber: frame.range.startLineNumber, column: frame.range.startColumn });
                const editorCoords = (0, dom_1.getDomNodePagePosition)(editor.getDomNode());
                const x = editorCoords.left + cursorCoords.left;
                const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
                contextMenuService.showContextMenu({
                    getAnchor: () => ({ x, y }),
                    getActions: () => {
                        return targets.map(t => new actions_1.Action(`stepIntoTarget:${t.id}`, t.label, undefined, true, () => session.stepIn(frame.thread.threadId, t.id)));
                    }
                });
            }
        }
    }
    StepIntoTargetsAction.ID = 'editor.debug.action.stepIntoTargets';
    StepIntoTargetsAction.LABEL = nls.localize(10, null);
    class GoToBreakpointAction extends editorExtensions_1.EditorAction {
        constructor(isNext, opts) {
            super(opts);
            this.isNext = isNext;
        }
        async run(accessor, editor) {
            const debugService = accessor.get(debug_1.IDebugService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
            if (editor.hasModel()) {
                const currentUri = editor.getModel().uri;
                const currentLine = editor.getPosition().lineNumber;
                //Breakpoints returned from `getBreakpoints` are already sorted.
                const allEnabledBreakpoints = debugService.getModel().getBreakpoints({ enabledOnly: true });
                //Try to find breakpoint in current file
                let moveBreakpoint = this.isNext
                    ? allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber > currentLine).shift()
                    : allEnabledBreakpoints.filter(bp => uriIdentityService.extUri.isEqual(bp.uri, currentUri) && bp.lineNumber < currentLine).pop();
                //Try to find breakpoints in following files
                if (!moveBreakpoint) {
                    moveBreakpoint =
                        this.isNext
                            ? allEnabledBreakpoints.filter(bp => bp.uri.toString() > currentUri.toString()).shift()
                            : allEnabledBreakpoints.filter(bp => bp.uri.toString() < currentUri.toString()).pop();
                }
                //Move to first or last possible breakpoint
                if (!moveBreakpoint && allEnabledBreakpoints.length) {
                    moveBreakpoint = this.isNext ? allEnabledBreakpoints[0] : allEnabledBreakpoints[allEnabledBreakpoints.length - 1];
                }
                if (moveBreakpoint) {
                    return (0, breakpointsView_1.openBreakpointSource)(moveBreakpoint, false, true, false, debugService, editorService);
                }
            }
        }
    }
    class GoToNextBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(true, {
                id: 'editor.debug.action.goToNextBreakpoint',
                label: nls.localize(11, null),
                alias: 'Debug: Go To Next Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
            });
        }
    }
    class GoToPreviousBreakpointAction extends GoToBreakpointAction {
        constructor() {
            super(false, {
                id: 'editor.debug.action.goToPreviousBreakpoint',
                label: nls.localize(12, null),
                alias: 'Debug: Go To Previous Breakpoint',
                precondition: debug_1.CONTEXT_DEBUGGERS_AVAILABLE
            });
        }
    }
    class CloseExceptionWidgetAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.debug.action.closeExceptionWidget',
                label: nls.localize(13, null),
                alias: 'Close Exception Widget',
                precondition: debug_1.CONTEXT_EXCEPTION_WIDGET_VISIBLE,
                kbOpts: {
                    primary: 9 /* Escape */,
                    weight: 100 /* EditorContrib */
                }
            });
        }
        async run(_accessor, editor) {
            const contribution = editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID);
            contribution.closeExceptionWidget();
        }
    }
    (0, actions_2.registerAction2)(ToggleBreakpointAction);
    (0, actions_2.registerAction2)(ConditionalBreakpointAction);
    (0, actions_2.registerAction2)(LogPointAction);
    (0, editorExtensions_1.registerEditorAction)(RunToCursorAction);
    (0, editorExtensions_1.registerEditorAction)(StepIntoTargetsAction);
    (0, editorExtensions_1.registerEditorAction)(SelectionToReplAction);
    (0, editorExtensions_1.registerEditorAction)(SelectionToWatchExpressionsAction);
    (0, editorExtensions_1.registerEditorAction)(ShowDebugHoverAction);
    (0, editorExtensions_1.registerEditorAction)(GoToNextBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(GoToPreviousBreakpointAction);
    (0, editorExtensions_1.registerEditorAction)(CloseExceptionWidgetAction);
});
//# sourceMappingURL=debugEditorActions.js.map