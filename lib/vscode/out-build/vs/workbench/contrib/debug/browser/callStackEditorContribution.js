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
define(["require", "exports", "vs/editor/common/core/range", "vs/editor/common/model", "vs/workbench/contrib/debug/common/debug", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/nls!vs/workbench/contrib/debug/browser/callStackEditorContribution", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/contrib/debug/browser/debugIcons"], function (require, exports, range_1, model_1, debug_1, themeService_1, colorRegistry_1, nls_1, event_1, lifecycle_1, arrays_1, uriIdentity_1, debugIcons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallStackEditorContribution = exports.createDecorationsForStackFrame = void 0;
    const topStackFrameColor = (0, colorRegistry_1.registerColor)('editor.stackFrameHighlightBackground', { dark: '#ffff0033', light: '#ffff6673', hc: '#ffff0033' }, (0, nls_1.localize)(0, null));
    const focusedStackFrameColor = (0, colorRegistry_1.registerColor)('editor.focusedStackFrameHighlightBackground', { dark: '#7abd7a4d', light: '#cee7ce73', hc: '#7abd7a4d' }, (0, nls_1.localize)(1, null));
    const stickiness = 1 /* NeverGrowsWhenTypingAtEdges */;
    // we need a separate decoration for glyph margin, since we do not want it on each line of a multi line statement.
    const TOP_STACK_FRAME_MARGIN = {
        glyphMarginClassName: themeService_1.ThemeIcon.asClassName(debugIcons_1.debugStackframe),
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.themeColorFromId)(topStackFrameColor)
        }
    };
    const FOCUSED_STACK_FRAME_MARGIN = {
        glyphMarginClassName: themeService_1.ThemeIcon.asClassName(debugIcons_1.debugStackframeFocused),
        stickiness,
        overviewRuler: {
            position: model_1.OverviewRulerLane.Full,
            color: (0, themeService_1.themeColorFromId)(focusedStackFrameColor)
        }
    };
    const TOP_STACK_FRAME_DECORATION = {
        isWholeLine: true,
        className: 'debug-top-stack-frame-line',
        stickiness
    };
    const TOP_STACK_FRAME_INLINE_DECORATION = {
        beforeContentClassName: 'debug-top-stack-frame-column'
    };
    const FOCUSED_STACK_FRAME_DECORATION = {
        isWholeLine: true,
        className: 'debug-focused-stack-frame-line',
        stickiness
    };
    function createDecorationsForStackFrame(stackFrame, isFocusedSession) {
        // only show decorations for the currently focused thread.
        const result = [];
        const columnUntilEOLRange = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
        const range = new range_1.Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
        // compute how to decorate the editor. Different decorations are used if this is a top stack frame, focused stack frame,
        // an exception or a stack frame that did not change the line number (we only decorate the columns, not the whole line).
        const topStackFrame = stackFrame.thread.getTopStackFrame();
        if (stackFrame.getId() === (topStackFrame === null || topStackFrame === void 0 ? void 0 : topStackFrame.getId())) {
            if (isFocusedSession) {
                result.push({
                    options: TOP_STACK_FRAME_MARGIN,
                    range
                });
            }
            result.push({
                options: TOP_STACK_FRAME_DECORATION,
                range: columnUntilEOLRange
            });
            if (stackFrame.range.startColumn > 1) {
                result.push({
                    options: TOP_STACK_FRAME_INLINE_DECORATION,
                    range: columnUntilEOLRange
                });
            }
        }
        else {
            if (isFocusedSession) {
                result.push({
                    options: FOCUSED_STACK_FRAME_MARGIN,
                    range
                });
            }
            result.push({
                options: FOCUSED_STACK_FRAME_DECORATION,
                range: columnUntilEOLRange
            });
        }
        return result;
    }
    exports.createDecorationsForStackFrame = createDecorationsForStackFrame;
    let CallStackEditorContribution = class CallStackEditorContribution {
        constructor(editor, debugService, uriIdentityService) {
            this.editor = editor;
            this.debugService = debugService;
            this.uriIdentityService = uriIdentityService;
            this.toDispose = [];
            this.decorationIds = [];
            const setDecorations = () => this.decorationIds = this.editor.deltaDecorations(this.decorationIds, this.createCallStackDecorations());
            this.toDispose.push(event_1.Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getModel().onDidChangeCallStack)(() => {
                setDecorations();
            }));
            this.toDispose.push(this.editor.onDidChangeModel(e => {
                if (e.newModelUrl) {
                    setDecorations();
                }
            }));
        }
        createCallStackDecorations() {
            const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
            const decorations = [];
            this.debugService.getModel().getSessions().forEach(s => {
                const isSessionFocused = s === (focusedStackFrame === null || focusedStackFrame === void 0 ? void 0 : focusedStackFrame.thread.session);
                s.getAllThreads().forEach(t => {
                    if (t.stopped) {
                        const callStack = t.getCallStack();
                        const stackFrames = [];
                        if (callStack.length > 0) {
                            // Always decorate top stack frame, and decorate focused stack frame if it is not the top stack frame
                            if (focusedStackFrame && !focusedStackFrame.equals(callStack[0])) {
                                stackFrames.push(focusedStackFrame);
                            }
                            stackFrames.push(callStack[0]);
                        }
                        stackFrames.forEach(candidateStackFrame => {
                            var _a;
                            if (candidateStackFrame && this.uriIdentityService.extUri.isEqual(candidateStackFrame.source.uri, (_a = this.editor.getModel()) === null || _a === void 0 ? void 0 : _a.uri)) {
                                decorations.push(...createDecorationsForStackFrame(candidateStackFrame, isSessionFocused));
                            }
                        });
                    }
                });
            });
            // Deduplicate same decorations so colors do not stack #109045
            return (0, arrays_1.distinct)(decorations, d => `${d.options.className} ${d.options.glyphMarginClassName} ${d.range.startLineNumber} ${d.range.startColumn}`);
        }
        dispose() {
            this.editor.deltaDecorations(this.decorationIds, []);
            this.toDispose = (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    CallStackEditorContribution = __decorate([
        __param(1, debug_1.IDebugService),
        __param(2, uriIdentity_1.IUriIdentityService)
    ], CallStackEditorContribution);
    exports.CallStackEditorContribution = CallStackEditorContribution;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const topStackFrame = theme.getColor(topStackFrameColor);
        if (topStackFrame) {
            collector.addRule(`.monaco-editor .view-overlays .debug-top-stack-frame-line { background: ${topStackFrame}; }`);
        }
        const focusedStackFrame = theme.getColor(focusedStackFrameColor);
        if (focusedStackFrame) {
            collector.addRule(`.monaco-editor .view-overlays .debug-focused-stack-frame-line { background: ${focusedStackFrame}; }`);
        }
    });
});
//# sourceMappingURL=callStackEditorContribution.js.map