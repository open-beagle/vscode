/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/json", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/editor/common/services/modelService", "vs/editor/common/services/modelServiceImpl", "vs/editor/common/services/resolverService", "vs/editor/common/services/textResourceConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/resolvedKeybindingItem", "vs/platform/keybinding/common/usLayoutResolvedKeybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/workspace/common/workspace", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/keybinding/common/keybindingEditing", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/base/common/uri", "vs/workbench/services/userData/common/fileUserDataProvider", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/label/common/label", "vs/workbench/services/label/common/labelService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/workbench/test/common/workbenchTestServices", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/services/uriIdentity/common/uriIdentityService", "vs/base/common/resources", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/lifecycle", "vs/base/common/buffer", "vs/workbench/services/environment/common/environmentService"], function (require, exports, assert, json, keyCodes_1, platform_1, modeService_1, modeServiceImpl_1, modelService_1, modelServiceImpl_1, resolverService_1, textResourceConfigurationService_1, configuration_1, contextkey_1, environment_1, files_1, instantiationServiceMock_1, resolvedKeybindingItem_1, usLayoutResolvedKeybinding_1, mockKeybindingService_1, lifecycle_1, log_1, telemetry_1, telemetryUtils_1, workspace_1, workingCopyBackup_1, editorService_1, editorGroupsService_1, keybindingEditing_1, textfiles_1, textModelResolverService_1, workbenchTestServices_1, fileService_1, network_1, uri_1, fileUserDataProvider_1, testConfigurationService_1, workingCopyService_1, label_1, labelService_1, filesConfigurationService_1, workingCopyFileService_1, undoRedo_1, undoRedoService_1, workbenchTestServices_2, themeService_1, testThemeService_1, pathService_1, uriIdentity_1, uriIdentityService_1, resources_1, inMemoryFilesystemProvider_1, lifecycle_2, buffer_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ROOT = uri_1.URI.file('tests').with({ scheme: 'vscode-tests' });
    suite('KeybindingsEditing', () => {
        const disposables = new lifecycle_2.DisposableStore();
        let instantiationService, fileService, environmentService;
        let testObject;
        setup(async () => {
            const logService = new log_1.NullLogService();
            fileService = disposables.add(new fileService_1.FileService(logService));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposables.add(fileService.registerProvider(ROOT.scheme, fileSystemProvider));
            const userFolder = (0, resources_1.joinPath)(ROOT, 'User');
            await fileService.createFolder(userFolder);
            environmentService = workbenchTestServices_1.TestEnvironmentService;
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'eol': '\n' });
            instantiationService.stub(environment_1.IEnvironmentService, environmentService);
            instantiationService.stub(environmentService_1.IWorkbenchEnvironmentService, environmentService);
            instantiationService.stub(pathService_1.IPathService, new workbenchTestServices_1.TestPathService());
            instantiationService.stub(configuration_1.IConfigurationService, configService);
            instantiationService.stub(workspace_1.IWorkspaceContextService, new workbenchTestServices_2.TestContextService());
            const lifecycleService = new workbenchTestServices_1.TestLifecycleService();
            instantiationService.stub(lifecycle_1.ILifecycleService, lifecycleService);
            instantiationService.stub(contextkey_1.IContextKeyService, instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService));
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, new workbenchTestServices_1.TestEditorGroupsService());
            instantiationService.stub(editorService_1.IEditorService, new workbenchTestServices_1.TestEditorService());
            instantiationService.stub(workingCopyService_1.IWorkingCopyService, disposables.add(new workingCopyService_1.WorkingCopyService()));
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(modeService_1.IModeService, modeServiceImpl_1.ModeServiceImpl);
            instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
            instantiationService.stub(label_1.ILabelService, disposables.add(instantiationService.createInstance(labelService_1.LabelService)));
            instantiationService.stub(filesConfigurationService_1.IFilesConfigurationService, disposables.add(instantiationService.createInstance(filesConfigurationService_1.FilesConfigurationService)));
            instantiationService.stub(textResourceConfigurationService_1.ITextResourcePropertiesService, new workbenchTestServices_2.TestTextResourcePropertiesService(instantiationService.get(configuration_1.IConfigurationService)));
            instantiationService.stub(undoRedo_1.IUndoRedoService, instantiationService.createInstance(undoRedoService_1.UndoRedoService));
            instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
            instantiationService.stub(modelService_1.IModelService, disposables.add(instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl)));
            fileService.registerProvider(network_1.Schemas.userData, disposables.add(new fileUserDataProvider_1.FileUserDataProvider(ROOT.scheme, fileSystemProvider, network_1.Schemas.userData, new log_1.NullLogService())));
            instantiationService.stub(files_1.IFileService, fileService);
            instantiationService.stub(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(fileService));
            instantiationService.stub(workingCopyFileService_1.IWorkingCopyFileService, disposables.add(instantiationService.createInstance(workingCopyFileService_1.WorkingCopyFileService)));
            instantiationService.stub(textfiles_1.ITextFileService, disposables.add(instantiationService.createInstance(workbenchTestServices_1.TestTextFileService)));
            instantiationService.stub(resolverService_1.ITextModelService, disposables.add(instantiationService.createInstance(textModelResolverService_1.TextModelResolverService)));
            instantiationService.stub(workingCopyBackup_1.IWorkingCopyBackupService, new workbenchTestServices_1.TestWorkingCopyBackupService());
            testObject = disposables.add(instantiationService.createInstance(keybindingEditing_1.KeybindingsEditingService));
        });
        teardown(() => disposables.clear());
        test('errors cases - parse errors', async () => {
            await fileService.writeFile(environmentService.keybindingsResource, buffer_1.VSBuffer.fromString(',,,,,,,,,,,,,,'));
            try {
                await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }), 'alt+c', undefined);
                assert.fail('Should fail with parse errors');
            }
            catch (error) {
                assert.strictEqual(error.message, 'Unable to write to the keybindings configuration file. Please open it to correct errors/warnings in the file and try again.');
            }
        });
        test('errors cases - parse errors 2', async () => {
            await fileService.writeFile(environmentService.keybindingsResource, buffer_1.VSBuffer.fromString('[{"key": }]'));
            try {
                await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }), 'alt+c', undefined);
                assert.fail('Should fail with parse errors');
            }
            catch (error) {
                assert.strictEqual(error.message, 'Unable to write to the keybindings configuration file. Please open it to correct errors/warnings in the file and try again.');
            }
        });
        test('errors cases - dirty', () => {
            instantiationService.stub(textfiles_1.ITextFileService, 'isDirty', true);
            return testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }), 'alt+c', undefined)
                .then(() => assert.fail('Should fail with dirty error'), error => assert.strictEqual(error.message, 'Unable to write because the keybindings configuration file is dirty. Please save it first and then try again.'));
        });
        test('errors cases - did not find an array', async () => {
            await fileService.writeFile(environmentService.keybindingsResource, buffer_1.VSBuffer.fromString('{"key": "alt+c", "command": "hello"}'));
            try {
                await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ } }), 'alt+c', undefined);
                assert.fail('Should fail');
            }
            catch (error) {
                assert.strictEqual(error.message, 'Unable to write to the keybindings configuration file. It has an object which is not of type Array. Please open the file to clean up and try again.');
            }
        });
        test('edit a default keybinding to an empty file', async () => {
            await fileService.writeFile(environmentService.keybindingsResource, buffer_1.VSBuffer.fromString(''));
            const expected = [{ key: 'alt+c', command: 'a' }, { key: 'escape', command: '-a' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }), 'alt+c', undefined);
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('edit a default keybinding to an empty array', async () => {
            await writeToKeybindingsFile();
            const expected = [{ key: 'alt+c', command: 'a' }, { key: 'escape', command: '-a' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }), 'alt+c', undefined);
            return assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('edit a default keybinding in an existing array', async () => {
            await writeToKeybindingsFile({ command: 'b', key: 'shift+c' });
            const expected = [{ key: 'shift+c', command: 'b' }, { key: 'alt+c', command: 'a' }, { key: 'escape', command: '-a' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }), 'alt+c', undefined);
            return assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('add another keybinding', async () => {
            const expected = [{ key: 'alt+c', command: 'a' }];
            await testObject.addKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'a' }), 'alt+c', undefined);
            return assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('add a new default keybinding', async () => {
            const expected = [{ key: 'alt+c', command: 'a' }];
            await testObject.addKeybinding(aResolvedKeybindingItem({ command: 'a' }), 'alt+c', undefined);
            return assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('add a new default keybinding using edit', async () => {
            const expected = [{ key: 'alt+c', command: 'a' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ command: 'a' }), 'alt+c', undefined);
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('edit an user keybinding', async () => {
            await writeToKeybindingsFile({ key: 'escape', command: 'b' });
            const expected = [{ key: 'alt+c', command: 'b' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'b', isDefault: false }), 'alt+c', undefined);
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('edit an user keybinding with more than one element', async () => {
            await writeToKeybindingsFile({ key: 'escape', command: 'b' }, { key: 'alt+shift+g', command: 'c' });
            const expected = [{ key: 'alt+c', command: 'b' }, { key: 'alt+shift+g', command: 'c' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ firstPart: { keyCode: 9 /* Escape */ }, command: 'b', isDefault: false }), 'alt+c', undefined);
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('remove a default keybinding', async () => {
            const expected = [{ key: 'alt+c', command: '-a' }];
            await testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'a', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } } }));
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('remove a default keybinding should not ad duplicate entries', async () => {
            const expected = [{ key: 'alt+c', command: '-a' }];
            await testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'a', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } } }));
            await testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'a', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } } }));
            await testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'a', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } } }));
            await testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'a', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } } }));
            await testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'a', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } } }));
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('remove a user keybinding', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: 'b' });
            await testObject.removeKeybinding(aResolvedKeybindingItem({ command: 'b', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } }, isDefault: false }));
            assert.deepStrictEqual(await getUserKeybindings(), []);
        });
        test('reset an edited keybinding', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: 'b' });
            await testObject.resetKeybinding(aResolvedKeybindingItem({ command: 'b', firstPart: { keyCode: 33 /* KEY_C */, modifiers: { altKey: true } }, isDefault: false }));
            assert.deepStrictEqual(await getUserKeybindings(), []);
        });
        test('reset a removed keybinding', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: '-b' });
            await testObject.resetKeybinding(aResolvedKeybindingItem({ command: 'b', isDefault: false }));
            assert.deepStrictEqual(await getUserKeybindings(), []);
        });
        test('reset multiple removed keybindings', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: '-b' });
            await writeToKeybindingsFile({ key: 'alt+shift+c', command: '-b' });
            await writeToKeybindingsFile({ key: 'escape', command: '-b' });
            await testObject.resetKeybinding(aResolvedKeybindingItem({ command: 'b', isDefault: false }));
            assert.deepStrictEqual(await getUserKeybindings(), []);
        });
        test('add a new keybinding to unassigned keybinding', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: '-a' });
            const expected = [{ key: 'alt+c', command: '-a' }, { key: 'shift+alt+c', command: 'a' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ command: 'a', isDefault: false }), 'shift+alt+c', undefined);
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('add when expression', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: '-a' });
            const expected = [{ key: 'alt+c', command: '-a' }, { key: 'shift+alt+c', command: 'a', when: 'editorTextFocus' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ command: 'a', isDefault: false }), 'shift+alt+c', 'editorTextFocus');
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('update command and when expression', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: '-a', when: 'editorTextFocus && !editorReadonly' });
            const expected = [{ key: 'alt+c', command: '-a', when: 'editorTextFocus && !editorReadonly' }, { key: 'shift+alt+c', command: 'a', when: 'editorTextFocus' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ command: 'a', isDefault: false }), 'shift+alt+c', 'editorTextFocus');
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('update when expression', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: '-a', when: 'editorTextFocus && !editorReadonly' }, { key: 'shift+alt+c', command: 'a', when: 'editorTextFocus && !editorReadonly' });
            const expected = [{ key: 'alt+c', command: '-a', when: 'editorTextFocus && !editorReadonly' }, { key: 'shift+alt+c', command: 'a', when: 'editorTextFocus' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ command: 'a', isDefault: false, when: 'editorTextFocus && !editorReadonly' }), 'shift+alt+c', 'editorTextFocus');
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        test('remove when expression', async () => {
            await writeToKeybindingsFile({ key: 'alt+c', command: '-a', when: 'editorTextFocus && !editorReadonly' });
            const expected = [{ key: 'alt+c', command: '-a', when: 'editorTextFocus && !editorReadonly' }, { key: 'shift+alt+c', command: 'a' }];
            await testObject.editKeybinding(aResolvedKeybindingItem({ command: 'a', isDefault: false }), 'shift+alt+c', undefined);
            assert.deepStrictEqual(await getUserKeybindings(), expected);
        });
        async function writeToKeybindingsFile(...keybindings) {
            await fileService.writeFile(environmentService.keybindingsResource, buffer_1.VSBuffer.fromString(JSON.stringify(keybindings || [])));
        }
        async function getUserKeybindings() {
            return json.parse((await fileService.readFile(environmentService.keybindingsResource)).value.toString());
        }
        function aResolvedKeybindingItem({ command, when, isDefault, firstPart, chordPart }) {
            const aSimpleKeybinding = function (part) {
                const { ctrlKey, shiftKey, altKey, metaKey } = part.modifiers || { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false };
                return new keyCodes_1.SimpleKeybinding(ctrlKey, shiftKey, altKey, metaKey, part.keyCode);
            };
            let parts = [];
            if (firstPart) {
                parts.push(aSimpleKeybinding(firstPart));
                if (chordPart) {
                    parts.push(aSimpleKeybinding(chordPart));
                }
            }
            const keybinding = parts.length > 0 ? new usLayoutResolvedKeybinding_1.USLayoutResolvedKeybinding(new keyCodes_1.ChordKeybinding(parts), platform_1.OS) : undefined;
            return new resolvedKeybindingItem_1.ResolvedKeybindingItem(keybinding, command || 'some command', null, when ? contextkey_1.ContextKeyExpr.deserialize(when) : undefined, isDefault === undefined ? true : isDefault, null, false);
        }
    });
});
//# sourceMappingURL=keybindingEditing.test.js.map