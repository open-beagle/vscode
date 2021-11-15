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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/codicons", "vs/base/common/color", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/strings", "vs/editor/browser/editorBrowser", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/services/resolverService", "vs/editor/contrib/peekView/peekView", "vs/nls!vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/workbench/common/editor", "vs/workbench/contrib/testing/browser/theme", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testingUri", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/services/editor/common/editorService"], function (require, exports, dom, aria_1, codicons_1, color_1, lifecycle_1, numbers_1, strings_1, editorBrowser_1, editorExtensions_1, codeEditorService_1, embeddedCodeEditorWidget_1, resolverService_1, peekView_1, nls_1, configuration_1, contextkey_1, instantiation_1, themeService_1, editor_1, theme_1, configuration_2, testingContextKeys_1, testingStates_1, testingUri_1, testResultService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CloseTestPeek = exports.TestingOutputPeekController = exports.TestingPeekOpener = exports.ITestingPeekOpener = void 0;
    exports.ITestingPeekOpener = (0, instantiation_1.createDecorator)('testingPeekOpener');
    let TestingPeekOpener = class TestingPeekOpener extends lifecycle_1.Disposable {
        constructor(configuration, editorService, codeEditorService, testResults) {
            super();
            this.configuration = configuration;
            this.editorService = editorService;
            this.codeEditorService = codeEditorService;
            this._register(testResults.onTestChanged(this.openPeekOnFailure, this));
        }
        /**
         * Tries to peek the first test error, if the item is in a failed state.
         * @returns a boolean if a peek was opened
         */
        async tryPeekFirstError(result, test, options) {
            const candidate = this.getCandidateMessage(test);
            if (!candidate) {
                return false;
            }
            const message = candidate.message;
            const pane = await this.editorService.openEditor({
                resource: message.location.uri,
                options: Object.assign({ selection: message.location.range, revealIfOpened: true }, options)
            });
            const control = pane === null || pane === void 0 ? void 0 : pane.getControl();
            if (!(0, editorBrowser_1.isCodeEditor)(control)) {
                return false;
            }
            TestingOutputPeekController.get(control).show((0, testingUri_1.buildTestUri)({
                type: 0 /* ResultMessage */,
                taskIndex: candidate.taskId,
                messageIndex: candidate.index,
                resultId: result.id,
                testExtId: test.item.extId,
            }));
            return true;
        }
        /**
         * Opens the peek view on a test failure, based on user preferences.
         */
        openPeekOnFailure(evt) {
            if (evt.reason !== 3 /* OwnStateChange */) {
                return;
            }
            const candidate = this.getCandidateMessage(evt.item);
            if (!candidate) {
                return;
            }
            if (evt.result.isAutoRun && !(0, configuration_2.getTestingConfiguration)(this.configuration, "testing.automaticallyOpenPeekViewDuringAutoRun" /* AutoOpenPeekViewDuringAutoRun */)) {
                return;
            }
            const editors = this.codeEditorService.listCodeEditors();
            const cfg = (0, configuration_2.getTestingConfiguration)(this.configuration, "testing.automaticallyOpenPeekView" /* AutoOpenPeekView */);
            // don't show the peek if the user asked to only auto-open peeks for visible tests,
            // and this test is not in any of the editors' models.
            const testUri = evt.item.item.uri.toString();
            if (cfg === "failureInVisibleDocument" /* FailureVisible */ && (!testUri || !editors.some(e => { var _a; return ((_a = e.getModel()) === null || _a === void 0 ? void 0 : _a.uri.toString()) === testUri; }))) {
                return;
            }
            const controllers = editors.map(TestingOutputPeekController.get);
            if (controllers.some(c => c === null || c === void 0 ? void 0 : c.isVisible)) {
                return;
            }
            this.tryPeekFirstError(evt.result, evt.item);
        }
        getCandidateMessage(test) {
            for (let taskId = 0; taskId < test.tasks.length; taskId++) {
                const { messages, state } = test.tasks[taskId];
                if (!(0, testingStates_1.isFailedState)(state)) {
                    continue;
                }
                const index = messages.findIndex(m => !!m.location);
                if (index === -1) {
                    continue;
                }
                return { taskId, index, message: messages[index] };
            }
            return undefined;
        }
    };
    TestingPeekOpener = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, editorService_1.IEditorService),
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, testResultService_1.ITestResultService)
    ], TestingPeekOpener);
    exports.TestingPeekOpener = TestingPeekOpener;
    /**
     * Adds output/message peek functionality to code editors.
     */
    let TestingOutputPeekController = class TestingOutputPeekController extends lifecycle_1.Disposable {
        constructor(editor, instantiationService, testResults, contextKeyService) {
            super();
            this.editor = editor;
            this.instantiationService = instantiationService;
            this.testResults = testResults;
            /**
             * Currently-shown peek view.
             */
            this.peek = this._register(new lifecycle_1.MutableDisposable());
            this.visible = testingContextKeys_1.TestingContextKeys.isPeekVisible.bindTo(contextKeyService);
            this._register(editor.onDidChangeModel(() => this.peek.clear()));
            this._register(testResults.onResultsChanged(this.closePeekOnRunStart, this));
            this._register(testResults.onTestChanged(this.closePeekOnTestChange, this));
        }
        /**
         * Gets the controller associated with the given code editor.
         */
        static get(editor) {
            return editor.getContribution("editor.contrib.testingOutputPeek" /* OutputPeekContributionId */);
        }
        /**
         * Gets whether a peek is currently shown in the associated editor.
         */
        get isVisible() {
            return this.peek.value;
        }
        /**
         * Toggles peek visibility for the URI.
         */
        toggle(uri) {
            var _a;
            if (((_a = this.currentPeekUri) === null || _a === void 0 ? void 0 : _a.toString()) === uri.toString()) {
                this.peek.clear();
            }
            else {
                this.show(uri);
            }
        }
        /**
         * Shows a peek for the message in th editor.
         */
        async show(uri) {
            const dto = this.retrieveTest(uri);
            if (!dto) {
                return;
            }
            const message = dto.messages[dto.messageIndex];
            if (!(message === null || message === void 0 ? void 0 : message.location)) {
                return;
            }
            const ctor = message.actualOutput !== undefined && message.expectedOutput !== undefined
                ? TestingDiffOutputPeek : TestingMessageOutputPeek;
            const isNew = !(this.peek.value instanceof ctor);
            if (isNew) {
                this.peek.value = this.instantiationService.createInstance(ctor, this.editor);
                this.peek.value.onDidClose(() => {
                    this.visible.set(false);
                    this.currentPeekUri = undefined;
                    this.peek.value = undefined;
                });
            }
            if (isNew) {
                this.visible.set(true);
                this.peek.value.create();
            }
            (0, aria_1.alert)(message.message.toString());
            this.peek.value.setModel(dto);
            this.currentPeekUri = uri;
        }
        /**
         * Disposes the peek view, if any.
         */
        removePeek() {
            this.peek.clear();
        }
        /**
         * Removes the peek view if it's being displayed on the given test ID.
         */
        removeIfPeekingForTest(testId) {
            var _a, _b;
            if (((_b = (_a = this.peek.value) === null || _a === void 0 ? void 0 : _a.currentTest()) === null || _b === void 0 ? void 0 : _b.extId) === testId) {
                this.peek.clear();
            }
        }
        /**
         * If the test we're currently showing has its state change to something
         * else, then clear the peek.
         */
        closePeekOnTestChange(evt) {
            if (evt.reason !== 3 /* OwnStateChange */ || evt.previous === evt.item.ownComputedState) {
                return;
            }
            this.removeIfPeekingForTest(evt.item.item.extId);
        }
        closePeekOnRunStart(evt) {
            if ('started' in evt) {
                this.peek.clear();
            }
        }
        retrieveTest(uri) {
            var _a;
            const parts = (0, testingUri_1.parseTestUri)(uri);
            if (!parts) {
                return undefined;
            }
            const test = (_a = this.testResults.getResult(parts.resultId)) === null || _a === void 0 ? void 0 : _a.getStateById(parts.testExtId);
            if (!test || !test.tasks[parts.taskIndex]) {
                return;
            }
            return test && {
                test: test.item,
                messages: test.tasks[parts.taskIndex].messages,
                messageIndex: parts.messageIndex,
                expectedUri: (0, testingUri_1.buildTestUri)(Object.assign(Object.assign({}, parts), { type: 2 /* ResultExpectedOutput */ })),
                actualUri: (0, testingUri_1.buildTestUri)(Object.assign(Object.assign({}, parts), { type: 1 /* ResultActualOutput */ })),
                messageUri: (0, testingUri_1.buildTestUri)(Object.assign(Object.assign({}, parts), { type: 0 /* ResultMessage */ })),
            };
        }
    };
    TestingOutputPeekController = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, testResultService_1.ITestResultService),
        __param(3, contextkey_1.IContextKeyService)
    ], TestingOutputPeekController);
    exports.TestingOutputPeekController = TestingOutputPeekController;
    let TestingOutputPeek = class TestingOutputPeek extends peekView_1.PeekViewWidget {
        constructor(editor, themeService, peekViewService, contextKeyService, instantiationService, modelService) {
            super(editor, { showFrame: false, showArrow: true, isResizeable: true, isAccessible: true, className: 'test-output-peek' }, instantiationService);
            this.modelService = modelService;
            this.model = new lifecycle_1.MutableDisposable();
            testingContextKeys_1.TestingContextKeys.isInPeek.bindTo(contextKeyService);
            this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme, this));
            this._disposables.add(this.model);
            this.applyTheme(themeService.getColorTheme());
            peekViewService.addExclusiveWidget(editor, this);
        }
        applyTheme(theme) {
            const borderColor = theme.getColor(theme_1.testingPeekBorder) || color_1.Color.transparent;
            this.style({
                arrowColor: borderColor,
                frameColor: borderColor,
                headerBackgroundColor: theme.getColor(peekView_1.peekViewTitleBackground) || color_1.Color.transparent,
                primaryHeadingColor: theme.getColor(peekView_1.peekViewTitleForeground),
                secondaryHeadingColor: theme.getColor(peekView_1.peekViewTitleInfoForeground)
            });
        }
        /**
         * @override
         */
        _doLayoutBody(height, width) {
            super._doLayoutBody(height, width);
            this.dimension = new dom.Dimension(width, height);
        }
    };
    TestingOutputPeek = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, peekView_1.IPeekViewService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, resolverService_1.ITextModelService)
    ], TestingOutputPeek);
    const commonEditorOptions = {
        scrollBeyondLastLine: false,
        scrollbar: {
            verticalScrollbarSize: 14,
            horizontal: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false
        },
        fixedOverflowWidgets: true,
        readOnly: true,
        minimap: {
            enabled: false
        },
    };
    const diffEditorOptions = Object.assign(Object.assign({}, commonEditorOptions), { enableSplitViewResizing: true, isInEmbeddedEditor: true, renderOverviewRuler: false, ignoreTrimWhitespace: false, renderSideBySide: true, originalAriaLabel: (0, nls_1.localize)(0, null), modifiedAriaLabel: (0, nls_1.localize)(1, null) });
    class TestingDiffOutputPeek extends TestingOutputPeek {
        constructor() {
            super(...arguments);
            this.diff = this._disposables.add(new lifecycle_1.MutableDisposable());
        }
        /**
         * @override
         */
        _fillBody(containerElement) {
            const diffContainer = dom.append(containerElement, dom.$('div.preview.inline'));
            const preview = this.diff.value = this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, diffContainer, diffEditorOptions, this.editor);
            if (this.dimension) {
                preview.layout(this.dimension);
            }
        }
        /**
         * @override
         */
        async setModel({ test, messages, messageIndex, expectedUri, actualUri }) {
            const message = messages[messageIndex];
            if (!(message === null || message === void 0 ? void 0 : message.location)) {
                return;
            }
            this.test = test;
            this.show(message.location.range, hintDiffPeekHeight(message));
            this.setTitle(message.message.toString().split('\n')[0], test.label);
            const [original, modified] = await Promise.all([
                this.modelService.createModelReference(expectedUri),
                this.modelService.createModelReference(actualUri),
            ]);
            const model = this.model.value = new SimpleDiffEditorModel(original, modified);
            if (!this.diff.value) {
                this.model.value = undefined;
            }
            else {
                this.diff.value.setModel(model);
            }
        }
        /**
         * @override
         */
        currentTest() {
            return this.test;
        }
        /**
         * @override
         */
        _doLayoutBody(height, width) {
            var _a;
            super._doLayoutBody(height, width);
            (_a = this.diff.value) === null || _a === void 0 ? void 0 : _a.layout(this.dimension);
        }
    }
    class TestingMessageOutputPeek extends TestingOutputPeek {
        constructor() {
            super(...arguments);
            this.preview = this._disposables.add(new lifecycle_1.MutableDisposable());
        }
        /**
         * @override
         */
        _fillBody(containerElement) {
            const diffContainer = dom.append(containerElement, dom.$('div.preview.inline'));
            const preview = this.preview.value = this.instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, diffContainer, commonEditorOptions, this.editor);
            if (this.dimension) {
                preview.layout(this.dimension);
            }
        }
        /**
         * @override
         */
        async setModel({ messages, test, messageIndex, messageUri }) {
            const message = messages[messageIndex];
            if (!(message === null || message === void 0 ? void 0 : message.location)) {
                return;
            }
            this.test = test;
            this.show(message.location.range, hintPeekStrHeight(message.message.toString()));
            this.setTitle(message.message.toString(), test.label);
            const modelRef = this.model.value = await this.modelService.createModelReference(messageUri);
            if (this.preview.value) {
                this.preview.value.setModel(modelRef.object.textEditorModel);
            }
            else {
                this.model.value = undefined;
            }
        }
        /**
         * @override
         */
        currentTest() {
            return this.test;
        }
        /**
         * @override
         */
        _doLayoutBody(height, width) {
            var _a;
            super._doLayoutBody(height, width);
            (_a = this.preview.value) === null || _a === void 0 ? void 0 : _a.layout(this.dimension);
        }
    }
    const hintDiffPeekHeight = (message) => Math.max(hintPeekStrHeight(message.actualOutput), hintPeekStrHeight(message.expectedOutput));
    const hintPeekStrHeight = (str) => (0, numbers_1.clamp)((0, strings_1.count)(str || '', '\n'), 5, 20);
    class SimpleDiffEditorModel extends editor_1.EditorModel {
        constructor(_original, _modified) {
            super();
            this._original = _original;
            this._modified = _modified;
            this.original = this._original.object.textEditorModel;
            this.modified = this._modified.object.textEditorModel;
        }
        dispose() {
            super.dispose();
            this._original.dispose();
            this._modified.dispose();
        }
    }
    function getOuterEditorFromDiffEditor(accessor) {
        const diffEditors = accessor.get(codeEditorService_1.ICodeEditorService).listDiffEditors();
        for (const diffEditor of diffEditors) {
            if (diffEditor.hasTextFocus() && diffEditor instanceof embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget) {
                return diffEditor.getParentEditor();
            }
        }
        return (0, peekView_1.getOuterEditor)(accessor);
    }
    class CloseTestPeek extends editorExtensions_1.EditorAction2 {
        constructor() {
            super({
                id: 'editor.closeTestPeek',
                title: (0, nls_1.localize)(2, null),
                icon: codicons_1.Codicon.close,
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(testingContextKeys_1.TestingContextKeys.isInPeek, testingContextKeys_1.TestingContextKeys.isPeekVisible), contextkey_1.ContextKeyExpr.not('config.editor.stablePeek')),
                keybinding: {
                    weight: 100 /* EditorContrib */ - 101,
                    primary: 9 /* Escape */
                }
            });
        }
        runEditorCommand(accessor, editor) {
            const parent = getOuterEditorFromDiffEditor(accessor);
            TestingOutputPeekController.get(parent !== null && parent !== void 0 ? parent : editor).removePeek();
        }
    }
    exports.CloseTestPeek = CloseTestPeek;
});
//# sourceMappingURL=testingOutputPeek.js.map