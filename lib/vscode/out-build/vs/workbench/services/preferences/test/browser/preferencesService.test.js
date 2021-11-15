/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/test/browser/editorTestServices", "vs/platform/commands/common/commands", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/services/configuration/common/jsonEditing", "vs/workbench/services/configuration/test/common/testServices", "vs/workbench/services/preferences/browser/preferencesService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/remote/test/common/testServices", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, editorTestServices_1, commands_1, editor_1, descriptors_1, serviceCollection_1, jsonEditing_1, testServices_1, preferencesService_1, preferences_1, remoteAgentService_1, testServices_2, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('PreferencesService', () => {
        let testInstantiationService;
        let testObject;
        let editorService;
        setup(() => {
            editorService = new TestEditorService2();
            testInstantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({
                editorService: () => editorService
            });
            testInstantiationService.stub(jsonEditing_1.IJSONEditingService, testServices_1.TestJSONEditingService);
            testInstantiationService.stub(remoteAgentService_1.IRemoteAgentService, testServices_2.TestRemoteAgentService);
            testInstantiationService.stub(commands_1.ICommandService, editorTestServices_1.TestCommandService);
            // PreferencesService creates a PreferencesEditorInput which depends on IPreferencesService, add the real one, not a stub
            const collection = new serviceCollection_1.ServiceCollection();
            collection.set(preferences_1.IPreferencesService, new descriptors_1.SyncDescriptor(preferencesService_1.PreferencesService));
            const instantiationService = testInstantiationService.createChild(collection);
            testObject = instantiationService.createInstance(preferencesService_1.PreferencesService);
        });
        test('openEditor is called with a SettingsEditorOptions instance', async () => {
            testObject.openSettings(false, undefined);
            const options = editorService.lastOpenEditorOptions;
            assert.strictEqual(options instanceof preferences_1.SettingsEditorOptions, true);
        });
        test('options are preserved when calling openEditor', async () => {
            testObject.openSettings(false, 'test query');
            const options = editorService.lastOpenEditorOptions;
            assert.strictEqual(options.focusSearch, true);
            assert.strictEqual(options.override, editor_1.EditorOverride.DISABLED);
            assert.strictEqual(options.query, 'test query');
        });
    });
    class TestEditorService2 extends workbenchTestServices_1.TestEditorService {
        async openEditor(editor, optionsOrGroup) {
            this.lastOpenEditorOptions = optionsOrGroup;
            return undefined;
        }
    }
});
//# sourceMappingURL=preferencesService.test.js.map