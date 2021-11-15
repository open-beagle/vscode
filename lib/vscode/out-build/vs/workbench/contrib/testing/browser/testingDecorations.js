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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/editor/browser/services/codeEditorService", "vs/editor/common/model", "vs/editor/common/view/editorColorRegistry", "vs/nls!vs/workbench/contrib/testing/browser/testingDecorations", "vs/platform/commands/common/commands", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/workbench/contrib/testing/browser/theme", "vs/workbench/contrib/testing/common/testingUri", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService"], function (require, exports, actions_1, event_1, htmlContent_1, lifecycle_1, uuid_1, codeEditorService_1, model_1, editorColorRegistry_1, nls_1, commands_1, contextView_1, instantiation_1, themeService_1, extHostTypes_1, debug_1, icons_1, testingOutputPeek_1, theme_1, testingUri_1, testResultService_1, testService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingDecorations = void 0;
    function isInDiffEditor(codeEditorService, codeEditor) {
        const diffEditors = codeEditorService.listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.getModifiedEditor() === codeEditor || diffEditor.getOriginalEditor() === codeEditor) {
                return true;
            }
        }
        return false;
    }
    const FONT_FAMILY_VAR = `--testMessageDecorationFontFamily`;
    let TestingDecorations = class TestingDecorations extends lifecycle_1.Disposable {
        constructor(editor, codeEditorService, testService, results, instantiationService) {
            var _a;
            super();
            this.editor = editor;
            this.codeEditorService = codeEditorService;
            this.testService = testService;
            this.results = results;
            this.instantiationService = instantiationService;
            this.collection = this._register(new lifecycle_1.MutableDisposable());
            this.lastDecorations = [];
            /**
             * List of messages that should be hidden because an editor changed their
             * underlying ranges. I think this is good enough, because:
             *  - Message decorations are never shown across reloads; this does not
             *    need to persist
             *  - Message instances are stable for any completed test results for
             *    the duration of the session.
             */
            this.invalidatedMessages = new WeakSet();
            this.attachModel((_a = editor.getModel()) === null || _a === void 0 ? void 0 : _a.uri);
            this._register(this.editor.onDidChangeModel(e => this.attachModel(e.newModelUrl || undefined)));
            this._register(this.editor.onMouseDown(e => {
                for (const decoration of this.lastDecorations) {
                    if (decoration.click(e)) {
                        e.event.stopPropagation();
                        return;
                    }
                }
            }));
            this._register(this.editor.onDidChangeModelContent(e => {
                if (!this.currentUri) {
                    return;
                }
                let update = false;
                for (const change of e.changes) {
                    for (const deco of this.lastDecorations) {
                        if (deco instanceof TestMessageDecoration
                            && deco.location.range.startLineNumber >= change.range.startLineNumber
                            && deco.location.range.endLineNumber <= change.range.endLineNumber) {
                            this.invalidatedMessages.add(deco.testMessage);
                            update = true;
                        }
                    }
                }
                if (update) {
                    this.setDecorations(this.currentUri);
                }
            }));
            const updateFontFamilyVar = () => {
                this.editor.getContainerDomNode().style.setProperty(FONT_FAMILY_VAR, editor.getOption(39 /* fontFamily */));
            };
            this._register(this.editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(39 /* fontFamily */)) {
                    updateFontFamilyVar();
                }
            }));
            updateFontFamilyVar();
            this._register(this.results.onTestChanged(({ item: result }) => {
                if (this.currentUri && result.item.uri.toString() === this.currentUri.toString()) {
                    this.setDecorations(this.currentUri);
                }
            }));
            this._register(event_1.Event.any(this.results.onResultsChanged, this.testService.excludeTests.onDidChange)(() => {
                if (this.currentUri) {
                    this.setDecorations(this.currentUri);
                }
            }));
        }
        attachModel(uri) {
            if (isInDiffEditor(this.codeEditorService, this.editor)) {
                uri = undefined;
            }
            this.currentUri = uri;
            if (!uri) {
                this.collection.value = undefined;
                this.clearDecorations();
                return;
            }
            this.collection.value = this.testService.subscribeToDiffs(1 /* TextDocument */, uri, diff => {
                var _a;
                this.setDecorations(uri);
                for (const op of diff) {
                    switch (op[0]) {
                        case 0 /* Add */:
                            if (!op[1].parent) {
                                (_a = this.collection.value) === null || _a === void 0 ? void 0 : _a.object.expand(op[1].item.extId, Infinity);
                            }
                            break;
                        case 2 /* Remove */:
                            testingOutputPeek_1.TestingOutputPeekController.get(this.editor).removeIfPeekingForTest(op[1]);
                            break;
                    }
                }
            });
            for (const root of this.collection.value.object.rootIds) {
                this.collection.value.object.expand(root, Infinity);
            }
            this.setDecorations(uri);
        }
        setDecorations(uri) {
            const ref = this.collection.value;
            if (!ref) {
                return;
            }
            this.editor.changeDecorations(accessor => {
                const newDecorations = [];
                for (const test of ref.object.all) {
                    const stateLookup = this.results.getStateById(test.item.extId);
                    if (test.item.range) {
                        newDecorations.push(this.instantiationService.createInstance(RunTestDecoration, test, ref.object, test.item.range, this.editor, stateLookup === null || stateLookup === void 0 ? void 0 : stateLookup[1]));
                    }
                    if (!stateLookup) {
                        continue;
                    }
                    const [result, stateItem] = stateLookup;
                    if (stateItem.retired) {
                        continue; // do not show decorations for outdated tests
                    }
                    for (let taskId = 0; taskId < stateItem.tasks.length; taskId++) {
                        const state = stateItem.tasks[taskId];
                        for (let i = 0; i < state.messages.length; i++) {
                            const m = state.messages[i];
                            if (!this.invalidatedMessages.has(m) && hasValidLocation(uri, m)) {
                                const uri = (0, testingUri_1.buildTestUri)({
                                    type: 1 /* ResultActualOutput */,
                                    messageIndex: i,
                                    taskIndex: taskId,
                                    resultId: result.id,
                                    testExtId: stateItem.item.extId,
                                });
                                newDecorations.push(this.instantiationService.createInstance(TestMessageDecoration, m, uri, m.location, this.editor));
                            }
                        }
                    }
                }
                accessor
                    .deltaDecorations(this.lastDecorations.map(d => d.id), newDecorations.map(d => d.editorDecoration))
                    .forEach((id, i) => newDecorations[i].id = id);
                this.lastDecorations = newDecorations;
            });
        }
        clearDecorations() {
            this.editor.changeDecorations(accessor => {
                for (const decoration of this.lastDecorations) {
                    accessor.removeDecoration(decoration.id);
                }
                this.lastDecorations = [];
            });
        }
    };
    TestingDecorations = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, testService_1.ITestService),
        __param(3, testResultService_1.ITestResultService),
        __param(4, instantiation_1.IInstantiationService)
    ], TestingDecorations);
    exports.TestingDecorations = TestingDecorations;
    const hasValidLocation = (editorUri, t) => { var _a; return ((_a = t.location) === null || _a === void 0 ? void 0 : _a.uri.toString()) === editorUri.toString(); };
    const firstLineRange = (originalRange) => ({
        startLineNumber: originalRange.startLineNumber,
        endLineNumber: originalRange.startLineNumber,
        startColumn: 0,
        endColumn: 1,
    });
    let RunTestDecoration = class RunTestDecoration extends lifecycle_1.Disposable {
        constructor(test, collection, range, editor, stateItem, testService, contextMenuService, commandService) {
            super();
            this.test = test;
            this.collection = collection;
            this.editor = editor;
            this.testService = testService;
            this.contextMenuService = contextMenuService;
            this.commandService = commandService;
            /**
             * @inheritdoc
             */
            this.id = '';
            this.line = range.startLineNumber;
            const icon = (stateItem === null || stateItem === void 0 ? void 0 : stateItem.computedState) !== undefined && stateItem.computedState !== extHostTypes_1.TestResultState.Unset
                ? icons_1.testingStatesToIcons.get(stateItem.computedState)
                : test.children.size > 0 ? icons_1.testingRunAllIcon : icons_1.testingRunIcon;
            const hoverMessage = new htmlContent_1.MarkdownString('', true).appendText((0, nls_1.localize)(0, null, test.item.label));
            if (stateItem === null || stateItem === void 0 ? void 0 : stateItem.tasks.some(s => s.messages.length > 0)) {
                const args = encodeURIComponent(JSON.stringify([test.item.extId]));
                hoverMessage.appendMarkdown(`[${(0, nls_1.localize)(1, null)}](command:vscode.peekTestError?${args})`);
            }
            let glyphMarginClassName = themeService_1.ThemeIcon.asClassName(icon) + ' testing-run-glyph';
            if (stateItem === null || stateItem === void 0 ? void 0 : stateItem.retired) {
                glyphMarginClassName += ' retired';
            }
            this.editorDecoration = {
                range: firstLineRange(range),
                options: {
                    isWholeLine: true,
                    hoverMessage,
                    glyphMarginClassName,
                    stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
                    glyphMarginHoverMessage: new htmlContent_1.MarkdownString().appendText((0, nls_1.localize)(2, null)),
                }
            };
        }
        /**
         * @inheritdoc
         */
        click(e) {
            var _a;
            if (((_a = e.target.position) === null || _a === void 0 ? void 0 : _a.lineNumber) !== this.line || e.target.type !== 2 /* GUTTER_GLYPH_MARGIN */) {
                return false;
            }
            if (e.event.rightButton) {
                const actions = this.getContextMenu();
                this.contextMenuService.showContextMenu({
                    getAnchor: () => ({ x: e.event.posx, y: e.event.posy }),
                    getActions: () => actions,
                    onHide: () => (0, lifecycle_1.dispose)(actions),
                });
            }
            else {
                // todo: customize click behavior
                this.testService.runTests({
                    tests: [{ testId: this.test.item.extId, src: this.test.src }],
                    debug: false,
                });
            }
            return true;
        }
        dispose() {
            // no-op
        }
        getContextMenu() {
            const model = this.editor.getModel();
            if (!model) {
                return [];
            }
            const testActions = [];
            if (this.test.item.runnable) {
                testActions.push(new actions_1.Action('testing.run', (0, nls_1.localize)(3, null), undefined, undefined, () => this.testService.runTests({
                    debug: false,
                    tests: [{ src: this.test.src, testId: this.test.item.extId }],
                })));
            }
            if (this.test.item.debuggable) {
                testActions.push(new actions_1.Action('testing.debug', (0, nls_1.localize)(4, null), undefined, undefined, () => this.testService.runTests({
                    debug: true,
                    tests: [{ src: this.test.src, testId: this.test.item.extId }],
                })));
            }
            testActions.push(new actions_1.Action('testing.reveal', (0, nls_1.localize)(5, null), undefined, undefined, async () => {
                const path = [this.test];
                while (true) {
                    const parentId = path[0].parent;
                    const parent = parentId && this.collection.getNodeById(parentId);
                    if (!parent) {
                        break;
                    }
                    path.unshift(parent);
                }
                await this.commandService.executeCommand('vscode.revealTestInExplorer', path.map(t => t.item.extId));
            }));
            const breakpointActions = this.editor
                .getContribution(debug_1.BREAKPOINT_EDITOR_CONTRIBUTION_ID)
                .getContextMenuActionsAtPosition(this.line, model);
            return breakpointActions.length ? [...testActions, new actions_1.Separator(), ...breakpointActions] : testActions;
        }
    };
    RunTestDecoration = __decorate([
        __param(5, testService_1.ITestService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, commands_1.ICommandService)
    ], RunTestDecoration);
    let TestMessageDecoration = class TestMessageDecoration {
        constructor(testMessage, messageUri, location, editor, editorService, themeService) {
            this.testMessage = testMessage;
            this.messageUri = messageUri;
            this.location = location;
            this.editor = editor;
            this.editorService = editorService;
            this.id = '';
            this.decorationId = `testmessage-${(0, uuid_1.generateUuid)()}`;
            const { severity = extHostTypes_1.TestMessageSeverity.Error, message } = testMessage;
            const colorTheme = themeService.getColorTheme();
            editorService.registerDecorationType(this.decorationId, {
                after: {
                    contentText: message.toString(),
                    color: `${colorTheme.getColor(theme_1.testMessageSeverityColors[severity].decorationForeground)}`,
                    fontSize: `${editor.getOption(42 /* fontSize */)}px`,
                    fontFamily: `var(${FONT_FAMILY_VAR})`,
                    padding: `0px 12px 0px 24px`,
                },
            }, undefined, editor);
            const options = editorService.resolveDecorationOptions(this.decorationId, true);
            options.hoverMessage = typeof message === 'string' ? new htmlContent_1.MarkdownString().appendText(message) : message;
            options.afterContentClassName = `${options.afterContentClassName} testing-inline-message-content`;
            options.zIndex = 10; // todo: in spite of the z-index, this appears behind gitlens
            options.className = `testing-inline-message-margin testing-inline-message-severity-${severity}`;
            options.isWholeLine = true;
            options.stickiness = 1 /* NeverGrowsWhenTypingAtEdges */;
            options.collapseOnReplaceEdit = true;
            const rulerColor = severity === extHostTypes_1.TestMessageSeverity.Error
                ? editorColorRegistry_1.overviewRulerError
                : severity === extHostTypes_1.TestMessageSeverity.Warning
                    ? editorColorRegistry_1.overviewRulerWarning
                    : severity === extHostTypes_1.TestMessageSeverity.Information
                        ? editorColorRegistry_1.overviewRulerInfo
                        : undefined;
            if (rulerColor) {
                options.overviewRuler = { color: (0, themeService_1.themeColorFromId)(rulerColor), position: model_1.OverviewRulerLane.Right };
            }
            this.editorDecoration = { range: firstLineRange(location.range), options };
        }
        click(e) {
            var _a;
            if (e.event.rightButton) {
                return false;
            }
            if ((_a = e.target.element) === null || _a === void 0 ? void 0 : _a.className.includes(this.decorationId)) {
                testingOutputPeek_1.TestingOutputPeekController.get(this.editor).toggle(this.messageUri);
            }
            return false;
        }
        dispose() {
            this.editorService.removeDecorationType(this.decorationId);
        }
    };
    TestMessageDecoration = __decorate([
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, themeService_1.IThemeService)
    ], TestMessageDecoration);
});
//# sourceMappingURL=testingDecorations.js.map