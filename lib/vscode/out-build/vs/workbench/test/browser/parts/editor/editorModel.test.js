/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/model/textModel", "vs/editor/common/services/textResourceConfigurationService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/test/common/testNotificationService", "vs/platform/notification/common/notification", "vs/workbench/test/common/workbenchTestServices", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, instantiationServiceMock_1, editor_1, textEditorModel_1, modeService_1, modeServiceImpl_1, configuration_1, testConfigurationService_1, modelServiceImpl_1, textModel_1, textResourceConfigurationService_1, undoRedo_1, undoRedoService_1, testDialogService_1, dialogs_1, testNotificationService_1, notification_1, workbenchTestServices_1, themeService_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench editor model', () => {
        class MyEditorModel extends editor_1.EditorModel {
        }
        class MyTextEditorModel extends textEditorModel_1.BaseTextEditorModel {
            createTextEditorModel(value, resource, preferredMode) {
                return super.createTextEditorModel(value, resource, preferredMode);
            }
            isReadonly() {
                return false;
            }
        }
        function stubModelService(instantiationService) {
            const dialogService = new testDialogService_1.TestDialogService();
            const notificationService = new testNotificationService_1.TestNotificationService();
            const undoRedoService = new undoRedoService_1.UndoRedoService(dialogService, notificationService);
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            instantiationService.stub(textResourceConfigurationService_1.ITextResourcePropertiesService, new workbenchTestServices_1.TestTextResourcePropertiesService(instantiationService.get(configuration_1.IConfigurationService)));
            instantiationService.stub(dialogs_1.IDialogService, dialogService);
            instantiationService.stub(notification_1.INotificationService, notificationService);
            instantiationService.stub(undoRedo_1.IUndoRedoService, undoRedoService);
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            return instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl);
        }
        let instantiationService;
        let modeService;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            modeService = instantiationService.stub(modeService_1.IModeService, modeServiceImpl_1.ModeServiceImpl);
        });
        test('EditorModel', async () => {
            let counter = 0;
            const model = new MyEditorModel();
            model.onWillDispose(() => {
                assert(true);
                counter++;
            });
            await model.resolve();
            assert.strictEqual(model.isDisposed(), false);
            assert.strictEqual(model.isResolved(), true);
            model.dispose();
            assert.strictEqual(counter, 1);
            assert.strictEqual(model.isDisposed(), true);
        });
        test('BaseTextEditorModel', async () => {
            let modelService = stubModelService(instantiationService);
            const model = new MyTextEditorModel(modelService, modeService);
            await model.resolve();
            model.createTextEditorModel((0, textModel_1.createTextBufferFactory)('foo'), null, 'text/plain');
            assert.strictEqual(model.isResolved(), true);
            model.dispose();
        });
    });
});
//# sourceMappingURL=editorModel.test.js.map