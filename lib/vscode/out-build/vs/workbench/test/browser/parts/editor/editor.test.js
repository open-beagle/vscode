/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/network", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/editor/common/editorService"], function (require, exports, assert, editor_1, diffEditorInput_1, uri_1, workbenchTestServices_1, network_1, untitledTextEditorInput_1, lifecycle_1, utils_1, descriptors_1, editor_2, editorGroupsService_1, editorService_1, editorService_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench editor', () => {
        class TestEditorInputWithPreferredResource extends workbenchTestServices_1.TestEditorInput {
            constructor(resource, preferredResource, typeId) {
                super(resource, typeId);
                this.preferredResource = preferredResource;
            }
        }
        const disposables = new lifecycle_1.DisposableStore();
        const TEST_EDITOR_ID = 'MyTestEditorForEditors';
        let instantiationService;
        let accessor;
        async function createServices() {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = instantiationService.createInstance(editorService_1.EditorService);
            instantiationService.stub(editorService_2.IEditorService, editorService);
            return instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            disposables.add((0, workbenchTestServices_1.registerTestFileEditor)());
            disposables.add((0, workbenchTestServices_1.registerTestDiffEditor)());
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            disposables.add((0, workbenchTestServices_1.registerTestEditor)(TEST_EDITOR_ID, [new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestFileEditorInput)]));
        });
        teardown(() => {
            accessor.untitledTextEditorService.dispose();
            disposables.clear();
        });
        test('EditorResourceAccessor', () => {
            var _a, _b;
            const service = accessor.untitledTextEditorService;
            assert.ok(!editor_1.EditorResourceAccessor.getCanonicalUri(null));
            assert.ok(!editor_1.EditorResourceAccessor.getOriginalUri(null));
            const untitled = instantiationService.createInstance(untitledTextEditorInput_1.UntitledTextEditorInput, service.create());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(untitled).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(untitled, { filterByScheme: network_1.Schemas.untitled }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(untitled, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), untitled.resource.toString());
            assert.ok(!editor_1.EditorResourceAccessor.getCanonicalUri(untitled, { filterByScheme: network_1.Schemas.file }));
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(untitled).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(untitled, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(untitled, { filterByScheme: network_1.Schemas.untitled }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(untitled, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), untitled.resource.toString());
            assert.ok(!editor_1.EditorResourceAccessor.getOriginalUri(untitled, { filterByScheme: network_1.Schemas.file }));
            const file = new workbenchTestServices_1.TestEditorInput(uri_1.URI.file('/some/path.txt'), 'editorResourceFileTest');
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(file).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(file, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(file, { filterByScheme: network_1.Schemas.file }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(file, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), file.resource.toString());
            assert.ok(!editor_1.EditorResourceAccessor.getCanonicalUri(file, { filterByScheme: network_1.Schemas.untitled }));
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(file).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(file, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(file, { filterByScheme: network_1.Schemas.file }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(file, { filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), file.resource.toString());
            assert.ok(!editor_1.EditorResourceAccessor.getOriginalUri(file, { filterByScheme: network_1.Schemas.untitled }));
            const diffEditorInput = instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', untitled, file, undefined);
            assert.ok(!editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput));
            assert.ok(!editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { filterByScheme: network_1.Schemas.file }));
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: network_1.Schemas.untitled }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).primary.toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.file }).primary.toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).primary.toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).secondary.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.untitled }).secondary.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getCanonicalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).secondary.toString(), untitled.resource.toString());
            assert.ok(!editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput));
            assert.ok(!editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { filterByScheme: network_1.Schemas.file }));
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: network_1.Schemas.file }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: network_1.Schemas.untitled }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).primary.toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.file }).primary.toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).primary.toString(), file.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH }).secondary.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: network_1.Schemas.untitled }).secondary.toString(), untitled.resource.toString());
            assert.strictEqual(editor_1.EditorResourceAccessor.getOriginalUri(diffEditorInput, { supportSideBySide: editor_1.SideBySideEditor.BOTH, filterByScheme: [network_1.Schemas.file, network_1.Schemas.untitled] }).secondary.toString(), untitled.resource.toString());
            const resource = uri_1.URI.file('/some/path.txt');
            const preferredResource = uri_1.URI.file('/some/PATH.txt');
            const fileWithPreferredResource = new TestEditorInputWithPreferredResource(uri_1.URI.file('/some/path.txt'), uri_1.URI.file('/some/PATH.txt'), 'editorResourceFileTest');
            assert.strictEqual((_a = editor_1.EditorResourceAccessor.getCanonicalUri(fileWithPreferredResource)) === null || _a === void 0 ? void 0 : _a.toString(), resource.toString());
            assert.strictEqual((_b = editor_1.EditorResourceAccessor.getOriginalUri(fileWithPreferredResource)) === null || _b === void 0 ? void 0 : _b.toString(), preferredResource.toString());
        });
        test('whenEditorClosed (single editor)', async function () {
            return testWhenEditorClosed(false, false, utils_1.toResource.call(this, '/path/index.txt'));
        });
        test('whenEditorClosed (multiple editor)', async function () {
            return testWhenEditorClosed(false, false, utils_1.toResource.call(this, '/path/index.txt'), utils_1.toResource.call(this, '/test.html'));
        });
        test('whenEditorClosed (single editor, diff editor)', async function () {
            return testWhenEditorClosed(true, false, utils_1.toResource.call(this, '/path/index.txt'));
        });
        test('whenEditorClosed (multiple editor, diff editor)', async function () {
            return testWhenEditorClosed(true, false, utils_1.toResource.call(this, '/path/index.txt'), utils_1.toResource.call(this, '/test.html'));
        });
        test('whenEditorClosed (single custom editor)', async function () {
            return testWhenEditorClosed(false, true, utils_1.toResource.call(this, '/path/index.txt'));
        });
        test('whenEditorClosed (multiple custom editor)', async function () {
            return testWhenEditorClosed(false, true, utils_1.toResource.call(this, '/path/index.txt'), utils_1.toResource.call(this, '/test.html'));
        });
        async function testWhenEditorClosed(sideBySide, custom, ...resources) {
            const accessor = await createServices();
            for (const resource of resources) {
                if (custom) {
                    await accessor.editorService.openEditor(new workbenchTestServices_1.TestFileEditorInput(resource, 'testTypeId'), { pinned: true });
                }
                else if (sideBySide) {
                    await accessor.editorService.openEditor({ leftResource: resource, rightResource: resource, options: { pinned: true } });
                }
                else {
                    await accessor.editorService.openEditor({ resource, options: { pinned: true } });
                }
            }
            const closedPromise = accessor.instantitionService.invokeFunction(accessor => (0, editor_2.whenEditorClosed)(accessor, resources));
            accessor.editorGroupService.activeGroup.closeAllEditors();
            await closedPromise;
        }
    });
});
//# sourceMappingURL=editor.test.js.map