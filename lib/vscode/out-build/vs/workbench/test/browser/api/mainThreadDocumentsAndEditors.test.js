/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadDocumentsAndEditors", "./testRPCProtocol", "vs/platform/configuration/test/common/testConfigurationService", "vs/editor/common/services/modelServiceImpl", "vs/editor/test/browser/editorTestServices", "vs/editor/test/browser/testCodeEditor", "vs/base/test/common/mock", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/event", "vs/platform/instantiation/common/serviceCollection", "vs/editor/browser/services/codeEditorService", "vs/platform/theme/test/common/testThemeService", "vs/platform/log/common/log", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/services/uriIdentity/common/uriIdentityService"], function (require, exports, assert, mainThreadDocumentsAndEditors_1, testRPCProtocol_1, testConfigurationService_1, modelServiceImpl_1, editorTestServices_1, testCodeEditor_1, mock_1, workbenchTestServices_1, event_1, serviceCollection_1, codeEditorService_1, testThemeService_1, log_1, undoRedoService_1, testDialogService_1, testNotificationService_1, workbenchTestServices_2, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadDocumentsAndEditors', () => {
        let modelService;
        let codeEditorService;
        let textFileService;
        let deltas = [];
        const hugeModelString = new Array(2 + (50 * 1024 * 1024)).join('-');
        function myCreateTestCodeEditor(model) {
            return (0, testCodeEditor_1.createTestCodeEditor)({
                model: model,
                hasTextFocus: false,
                serviceCollection: new serviceCollection_1.ServiceCollection([codeEditorService_1.ICodeEditorService, codeEditorService])
            });
        }
        setup(() => {
            deltas.length = 0;
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('editor', { 'detectIndentation': false });
            const dialogService = new testDialogService_1.TestDialogService();
            const notificationService = new testNotificationService_1.TestNotificationService();
            const undoRedoService = new undoRedoService_1.UndoRedoService(dialogService, notificationService);
            modelService = new modelServiceImpl_1.ModelServiceImpl(configService, new workbenchTestServices_2.TestTextResourcePropertiesService(configService), new testThemeService_1.TestThemeService(), new log_1.NullLogService(), undoRedoService);
            codeEditorService = new editorTestServices_1.TestCodeEditorService();
            textFileService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.files = {
                        onDidSave: event_1.Event.None,
                        onDidRevert: event_1.Event.None,
                        onDidChangeDirty: event_1.Event.None
                    };
                }
                isDirty() { return false; }
            };
            const workbenchEditorService = new workbenchTestServices_1.TestEditorService();
            const editorGroupService = new workbenchTestServices_1.TestEditorGroupsService();
            const fileService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidRunOperation = event_1.Event.None;
                    this.onDidChangeFileSystemProviderCapabilities = event_1.Event.None;
                    this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
                }
            };
            new mainThreadDocumentsAndEditors_1.MainThreadDocumentsAndEditors((0, testRPCProtocol_1.SingleProxyRPCProtocol)(new class extends (0, mock_1.mock)() {
                $acceptDocumentsAndEditorsDelta(delta) { deltas.push(delta); }
            }), modelService, textFileService, workbenchEditorService, codeEditorService, fileService, null, editorGroupService, null, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidPanelOpen = event_1.Event.None;
                    this.onDidPanelClose = event_1.Event.None;
                }
                getActivePanel() {
                    return undefined;
                }
            }, workbenchTestServices_1.TestEnvironmentService, new workbenchTestServices_2.TestWorkingCopyFileService(), new uriIdentityService_1.UriIdentityService(fileService), new class extends (0, mock_1.mock)() {
                readText() {
                    return Promise.resolve('clipboard_contents');
                }
            }, new workbenchTestServices_1.TestPathService());
        });
        test('Model#add', () => {
            deltas.length = 0;
            modelService.createModel('farboo', null);
            assert.strictEqual(deltas.length, 1);
            const [delta] = deltas;
            assert.strictEqual(delta.addedDocuments.length, 1);
            assert.strictEqual(delta.removedDocuments, undefined);
            assert.strictEqual(delta.addedEditors, undefined);
            assert.strictEqual(delta.removedEditors, undefined);
            assert.strictEqual(delta.newActiveEditor, undefined);
        });
        test('ignore huge model', function () {
            this.timeout(1000 * 60); // increase timeout for this one test
            const model = modelService.createModel(hugeModelString, null);
            assert.ok(model.isTooLargeForSyncing());
            assert.strictEqual(deltas.length, 1);
            const [delta] = deltas;
            assert.strictEqual(delta.newActiveEditor, null);
            assert.strictEqual(delta.addedDocuments, undefined);
            assert.strictEqual(delta.removedDocuments, undefined);
            assert.strictEqual(delta.addedEditors, undefined);
            assert.strictEqual(delta.removedEditors, undefined);
        });
        test('ignore simple widget model', function () {
            this.timeout(1000 * 60); // increase timeout for this one test
            const model = modelService.createModel('test', null, undefined, true);
            assert.ok(model.isForSimpleWidget);
            assert.strictEqual(deltas.length, 1);
            const [delta] = deltas;
            assert.strictEqual(delta.newActiveEditor, null);
            assert.strictEqual(delta.addedDocuments, undefined);
            assert.strictEqual(delta.removedDocuments, undefined);
            assert.strictEqual(delta.addedEditors, undefined);
            assert.strictEqual(delta.removedEditors, undefined);
        });
        test('ignore huge model from editor', function () {
            this.timeout(1000 * 60); // increase timeout for this one test
            const model = modelService.createModel(hugeModelString, null);
            const editor = myCreateTestCodeEditor(model);
            assert.strictEqual(deltas.length, 1);
            deltas.length = 0;
            assert.strictEqual(deltas.length, 0);
            editor.dispose();
        });
        test('ignore editor w/o model', () => {
            const editor = myCreateTestCodeEditor(undefined);
            assert.strictEqual(deltas.length, 1);
            const [delta] = deltas;
            assert.strictEqual(delta.newActiveEditor, null);
            assert.strictEqual(delta.addedDocuments, undefined);
            assert.strictEqual(delta.removedDocuments, undefined);
            assert.strictEqual(delta.addedEditors, undefined);
            assert.strictEqual(delta.removedEditors, undefined);
            editor.dispose();
        });
        test('editor with model', () => {
            deltas.length = 0;
            const model = modelService.createModel('farboo', null);
            const editor = myCreateTestCodeEditor(model);
            assert.strictEqual(deltas.length, 2);
            const [first, second] = deltas;
            assert.strictEqual(first.addedDocuments.length, 1);
            assert.strictEqual(first.newActiveEditor, undefined);
            assert.strictEqual(first.removedDocuments, undefined);
            assert.strictEqual(first.addedEditors, undefined);
            assert.strictEqual(first.removedEditors, undefined);
            assert.strictEqual(second.addedEditors.length, 1);
            assert.strictEqual(second.addedDocuments, undefined);
            assert.strictEqual(second.removedDocuments, undefined);
            assert.strictEqual(second.removedEditors, undefined);
            assert.strictEqual(second.newActiveEditor, undefined);
            editor.dispose();
        });
        test('editor with dispos-ed/-ing model', () => {
            modelService.createModel('foobar', null);
            const model = modelService.createModel('farboo', null);
            const editor = myCreateTestCodeEditor(model);
            // ignore things until now
            deltas.length = 0;
            modelService.destroyModel(model.uri);
            assert.strictEqual(deltas.length, 1);
            const [first] = deltas;
            assert.strictEqual(first.newActiveEditor, undefined);
            assert.strictEqual(first.removedEditors.length, 1);
            assert.strictEqual(first.removedDocuments.length, 1);
            assert.strictEqual(first.addedDocuments, undefined);
            assert.strictEqual(first.addedEditors, undefined);
            editor.dispose();
        });
    });
});
//# sourceMappingURL=mainThreadDocumentsAndEditors.test.js.map