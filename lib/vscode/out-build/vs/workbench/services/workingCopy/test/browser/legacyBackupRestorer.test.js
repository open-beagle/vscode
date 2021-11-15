/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/buffer", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/network", "vs/base/common/resources", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/workingCopy/common/legacyBackupRestorer", "vs/workbench/services/workingCopy/browser/workingCopyBackupTracker", "vs/base/common/lifecycle"], function (require, exports, assert, platform_1, uri_1, buffer_1, editorService_1, editorGroupsService_1, editorService_2, workingCopyBackup_1, network_1, resources_1, workbenchTestServices_1, legacyBackupRestorer_1, workingCopyBackupTracker_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('LegacyWorkingCopyBackupRestorer', () => {
        class TestBackupRestorer extends legacyBackupRestorer_1.LegacyWorkingCopyBackupRestorer {
            async doRestoreLegacyBackups() {
                return super.doRestoreLegacyBackups();
            }
        }
        let accessor;
        let disposables = new lifecycle_1.DisposableStore();
        const fooFile = uri_1.URI.file(platform_1.isWindows ? 'c:\\Foo' : '/Foo');
        const barFile = uri_1.URI.file(platform_1.isWindows ? 'c:\\Bar' : '/Bar');
        const untitledFile1 = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-1' });
        const untitledFile2 = uri_1.URI.from({ scheme: network_1.Schemas.untitled, path: 'Untitled-2' });
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
        });
        teardown(() => {
            disposables.clear();
        });
        test('Restore backups', async function () {
            var _a, _b, _c, _d;
            const workingCopyBackupService = new workbenchTestServices_1.InMemoryTestWorkingCopyBackupService();
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            instantiationService.stub(workingCopyBackup_1.IWorkingCopyBackupService, workingCopyBackupService);
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = instantiationService.createInstance(editorService_2.EditorService);
            instantiationService.stub(editorService_1.IEditorService, editorService);
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            disposables.add(instantiationService.createInstance(workingCopyBackupTracker_1.BrowserWorkingCopyBackupTracker));
            const restorer = instantiationService.createInstance(TestBackupRestorer);
            // Backup 2 normal files and 2 untitled files
            await workingCopyBackupService.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile1), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('untitled-1')));
            await workingCopyBackupService.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(untitledFile2), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('untitled-2')));
            await workingCopyBackupService.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(fooFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('fooFile')));
            await workingCopyBackupService.backup((0, workbenchTestServices_1.toUntypedWorkingCopyId)(barFile), (0, buffer_1.bufferToReadable)(buffer_1.VSBuffer.fromString('barFile')));
            // Verify backups restored and opened as dirty
            await restorer.doRestoreLegacyBackups();
            assert.strictEqual(editorService.count, 4);
            assert.ok(editorService.editors.every(editor => editor.isDirty()));
            let counter = 0;
            for (const editor of editorService.editors) {
                const resource = editor.resource;
                if ((0, resources_1.isEqual)(resource, untitledFile1)) {
                    const model = await accessor.textFileService.untitled.resolve({ untitledResource: resource });
                    if (((_a = model.textEditorModel) === null || _a === void 0 ? void 0 : _a.getValue()) !== 'untitled-1') {
                        const backupContents = await workingCopyBackupService.getBackupContents(model);
                        assert.fail(`Unable to restore backup for resource ${untitledFile1.toString()}. Backup contents: ${backupContents}`);
                    }
                    model.dispose();
                    counter++;
                }
                else if ((0, resources_1.isEqual)(resource, untitledFile2)) {
                    const model = await accessor.textFileService.untitled.resolve({ untitledResource: resource });
                    if (((_b = model.textEditorModel) === null || _b === void 0 ? void 0 : _b.getValue()) !== 'untitled-2') {
                        const backupContents = await workingCopyBackupService.getBackupContents(model);
                        assert.fail(`Unable to restore backup for resource ${untitledFile2.toString()}. Backup contents: ${backupContents}`);
                    }
                    model.dispose();
                    counter++;
                }
                else if ((0, resources_1.isEqual)(resource, fooFile)) {
                    const model = accessor.textFileService.files.get(fooFile);
                    await (model === null || model === void 0 ? void 0 : model.resolve());
                    if (((_c = model === null || model === void 0 ? void 0 : model.textEditorModel) === null || _c === void 0 ? void 0 : _c.getValue()) !== 'fooFile') {
                        const backupContents = await workingCopyBackupService.getBackupContents(model);
                        assert.fail(`Unable to restore backup for resource ${fooFile.toString()}. Backup contents: ${backupContents}`);
                    }
                    counter++;
                }
                else {
                    const model = accessor.textFileService.files.get(barFile);
                    await (model === null || model === void 0 ? void 0 : model.resolve());
                    if (((_d = model === null || model === void 0 ? void 0 : model.textEditorModel) === null || _d === void 0 ? void 0 : _d.getValue()) !== 'barFile') {
                        const backupContents = await workingCopyBackupService.getBackupContents(model);
                        assert.fail(`Unable to restore backup for resource ${barFile.toString()}. Backup contents: ${backupContents}`);
                    }
                    counter++;
                }
            }
            assert.strictEqual(counter, 4);
        });
    });
});
//# sourceMappingURL=legacyBackupRestorer.test.js.map