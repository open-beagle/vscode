/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/test/browser/editorTestServices", "vs/editor/test/common/editorTestUtils", "vs/editor/test/common/mocks/testConfiguration", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService"], function (require, exports, codeEditorService_1, codeEditorWidget_1, editorTestServices_1, editorTestUtils_1, testConfiguration_1, commands_1, contextkey_1, instantiationService_1, serviceCollection_1, mockKeybindingService_1, notification_1, testNotificationService_1, telemetry_1, telemetryUtils_1, themeService_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTestCodeEditor = exports.withAsyncTestCodeEditor = exports.withTestCodeEditor = exports.TestCodeEditor = void 0;
    class TestCodeEditor extends codeEditorWidget_1.CodeEditorWidget {
        constructor() {
            super(...arguments);
            this._hasTextFocus = false;
        }
        //#region testing overrides
        _createConfiguration(options) {
            return new testConfiguration_1.TestConfiguration(options);
        }
        _createView(viewModel) {
            // Never create a view
            return [null, false];
        }
        setHasTextFocus(hasTextFocus) {
            this._hasTextFocus = hasTextFocus;
        }
        hasTextFocus() {
            return this._hasTextFocus;
        }
        //#endregion
        //#region Testing utils
        getViewModel() {
            return this._modelData ? this._modelData.viewModel : undefined;
        }
        registerAndInstantiateContribution(id, ctor) {
            const r = this._instantiationService.createInstance(ctor, this);
            this._contributions[id] = r;
            return r;
        }
    }
    exports.TestCodeEditor = TestCodeEditor;
    class TestCodeEditorWithAutoModelDisposal extends TestCodeEditor {
        dispose() {
            super.dispose();
            if (this._modelData) {
                this._modelData.model.dispose();
            }
        }
    }
    class TestEditorDomElement {
        constructor() {
            this.parentElement = null;
        }
        setAttribute(attr, value) { }
        removeAttribute(attr) { }
        hasAttribute(attr) { return false; }
        getAttribute(attr) { return undefined; }
        addEventListener(event) { }
        removeEventListener(event) { }
    }
    function withTestCodeEditor(text, options, callback) {
        // create a model if necessary and remember it in order to dispose it.
        if (!options.model) {
            if (typeof text === 'string') {
                options.model = (0, editorTestUtils_1.createTextModel)(text);
            }
            else if (text) {
                options.model = (0, editorTestUtils_1.createTextModel)(text.join('\n'));
            }
        }
        const editor = createTestCodeEditor(options);
        const viewModel = editor.getViewModel();
        viewModel.setHasFocus(true);
        callback(editor, editor.getViewModel());
        editor.dispose();
    }
    exports.withTestCodeEditor = withTestCodeEditor;
    async function withAsyncTestCodeEditor(text, options, callback) {
        // create a model if necessary and remember it in order to dispose it.
        if (!options.model) {
            if (typeof text === 'string') {
                options.model = (0, editorTestUtils_1.createTextModel)(text);
            }
            else if (text) {
                options.model = (0, editorTestUtils_1.createTextModel)(text.join('\n'));
            }
        }
        const [instantiationService, editor] = doCreateTestCodeEditor(options);
        const viewModel = editor.getViewModel();
        viewModel.setHasFocus(true);
        await callback(editor, editor.getViewModel(), instantiationService);
        editor.dispose();
    }
    exports.withAsyncTestCodeEditor = withAsyncTestCodeEditor;
    function createTestCodeEditor(options) {
        const [, editor] = doCreateTestCodeEditor(options);
        return editor;
    }
    exports.createTestCodeEditor = createTestCodeEditor;
    function doCreateTestCodeEditor(options) {
        const model = options.model;
        delete options.model;
        const services = options.serviceCollection || new serviceCollection_1.ServiceCollection();
        delete options.serviceCollection;
        const instantiationService = new instantiationService_1.InstantiationService(services);
        if (!services.has(codeEditorService_1.ICodeEditorService)) {
            services.set(codeEditorService_1.ICodeEditorService, new editorTestServices_1.TestCodeEditorService());
        }
        if (!services.has(contextkey_1.IContextKeyService)) {
            services.set(contextkey_1.IContextKeyService, new mockKeybindingService_1.MockContextKeyService());
        }
        if (!services.has(notification_1.INotificationService)) {
            services.set(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
        }
        if (!services.has(commands_1.ICommandService)) {
            services.set(commands_1.ICommandService, new editorTestServices_1.TestCommandService(instantiationService));
        }
        if (!services.has(themeService_1.IThemeService)) {
            services.set(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        }
        if (!services.has(telemetry_1.ITelemetryService)) {
            services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
        }
        const codeEditorWidgetOptions = {
            contributions: []
        };
        const editor = instantiationService.createInstance(TestCodeEditorWithAutoModelDisposal, new TestEditorDomElement(), options, codeEditorWidgetOptions);
        if (typeof options.hasTextFocus === 'undefined') {
            options.hasTextFocus = true;
        }
        editor.setHasTextFocus(options.hasTextFocus);
        editor.setModel(model);
        return [instantiationService, editor];
    }
});
//# sourceMappingURL=testCodeEditor.js.map