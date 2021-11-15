/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/workbench/browser/codeeditor", "vs/editor/common/model/textModel", "vs/editor/test/browser/testCodeEditor", "vs/editor/common/core/range", "vs/editor/common/core/position", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/browser/controller/coreCommands", "vs/workbench/services/editor/common/editorService", "vs/editor/test/common/editorTestUtils", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, uri_1, workbenchTestServices_1, modelService_1, modeService_1, modeServiceImpl_1, codeeditor_1, textModel_1, testCodeEditor_1, range_1, position_1, configuration_1, testConfigurationService_1, modelServiceImpl_1, coreCommands_1, editorService_1, editorTestUtils_1, themeService_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Editor - Range decorations', () => {
        let instantiationService;
        let codeEditor;
        let model;
        let text;
        let testObject;
        let modelsToDispose = [];
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            instantiationService.stub(editorService_1.IEditorService, new workbenchTestServices_1.TestEditorService());
            instantiationService.stub(modeService_1.IModeService, modeServiceImpl_1.ModeServiceImpl);
            instantiationService.stub(modelService_1.IModelService, stubModelService(instantiationService));
            text = 'LINE1' + '\n' + 'LINE2' + '\n' + 'LINE3' + '\n' + 'LINE4' + '\r\n' + 'LINE5';
            model = aModel(uri_1.URI.file('some_file'));
            codeEditor = (0, testCodeEditor_1.createTestCodeEditor)({ model: model });
            instantiationService.stub(editorService_1.IEditorService, 'activeEditor', { get resource() { return codeEditor.getModel().uri; } });
            instantiationService.stub(editorService_1.IEditorService, 'activeTextEditorControl', codeEditor);
            testObject = instantiationService.createInstance(codeeditor_1.RangeHighlightDecorations);
        });
        teardown(() => {
            codeEditor.dispose();
            modelsToDispose.forEach(model => model.dispose());
        });
        test('highlight range for the resource if it is an active editor', function () {
            const range = new range_1.Range(1, 1, 1, 1);
            testObject.highlightRange({ resource: model.uri, range });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, [range]);
        });
        test('remove highlight range', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            testObject.removeHighlightRange();
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('highlight range for the resource removes previous highlight', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            const range = new range_1.Range(2, 2, 4, 3);
            testObject.highlightRange({ resource: model.uri, range });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, [range]);
        });
        test('highlight range for a new resource removes highlight of previous resource', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            const anotherModel = prepareActiveEditor('anotherModel');
            const range = new range_1.Range(2, 2, 4, 3);
            testObject.highlightRange({ resource: anotherModel.uri, range });
            let actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
            actuals = rangeHighlightDecorations(anotherModel);
            assert.deepStrictEqual(actuals, [range]);
        });
        test('highlight is removed on model change', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            prepareActiveEditor('anotherModel');
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('highlight is removed on cursor position change', function () {
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            codeEditor.trigger('mouse', coreCommands_1.CoreNavigationCommands.MoveTo.id, {
                position: new position_1.Position(2, 1)
            });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('range is not highlight if not active editor', function () {
            const model = aModel(uri_1.URI.file('some model'));
            testObject.highlightRange({ resource: model.uri, range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 } });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, []);
        });
        test('previous highlight is not removed if not active editor', function () {
            const range = new range_1.Range(1, 1, 1, 1);
            testObject.highlightRange({ resource: model.uri, range });
            const model1 = aModel(uri_1.URI.file('some model'));
            testObject.highlightRange({ resource: model1.uri, range: { startLineNumber: 2, startColumn: 1, endLineNumber: 2, endColumn: 1 } });
            const actuals = rangeHighlightDecorations(model);
            assert.deepStrictEqual(actuals, [range]);
        });
        function prepareActiveEditor(resource) {
            let model = aModel(uri_1.URI.file(resource));
            codeEditor.setModel(model);
            return model;
        }
        function aModel(resource, content = text) {
            let model = (0, editorTestUtils_1.createTextModel)(content, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, null, resource);
            modelsToDispose.push(model);
            return model;
        }
        function rangeHighlightDecorations(m) {
            let rangeHighlights = [];
            for (let dec of m.getAllDecorations()) {
                if (dec.options.className === 'rangeHighlight') {
                    rangeHighlights.push(dec.range);
                }
            }
            rangeHighlights.sort(range_1.Range.compareRangesUsingStarts);
            return rangeHighlights;
        }
        function stubModelService(instantiationService) {
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
    });
});
//# sourceMappingURL=codeeditor.test.js.map