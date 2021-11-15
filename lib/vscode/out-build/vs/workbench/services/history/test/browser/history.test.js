/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/editor", "vs/base/common/uri", "vs/workbench/test/browser/workbenchTestServices", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/history/browser/history", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/browser/editorService", "vs/base/common/lifecycle", "vs/workbench/services/history/common/history", "vs/base/common/async", "vs/base/common/event"], function (require, exports, assert, editor_1, uri_1, workbenchTestServices_1, descriptors_1, editorGroupsService_1, history_1, editorService_1, editorService_2, lifecycle_1, history_2, async_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('HistoryService', function () {
        const TEST_EDITOR_ID = 'MyTestEditorForEditorHistory';
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForHistoyService';
        async function createServices() {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = instantiationService.createInstance(editorService_2.EditorService);
            instantiationService.stub(editorService_1.IEditorService, editorService);
            const historyService = instantiationService.createInstance(history_1.HistoryService);
            instantiationService.stub(history_2.IHistoryService, historyService);
            return [part, historyService, editorService];
        }
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestEditor)(TEST_EDITOR_ID, [new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestFileEditorInput)]));
        });
        teardown(() => {
            disposables.clear();
        });
        test('back / forward', async () => {
            const [part, historyService, editorService] = await createServices();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID);
            await part.activeGroup.openEditor(input1, editor_1.EditorOptions.create({ pinned: true }));
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID);
            await part.activeGroup.openEditor(input2, editor_1.EditorOptions.create({ pinned: true }));
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.back();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.forward();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
        });
        test('getHistory', async () => {
            const [part, historyService] = await createServices();
            let history = historyService.getHistory();
            assert.strictEqual(history.length, 0);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID);
            await part.activeGroup.openEditor(input1, editor_1.EditorOptions.create({ pinned: true }));
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID);
            await part.activeGroup.openEditor(input2, editor_1.EditorOptions.create({ pinned: true }));
            history = historyService.getHistory();
            assert.strictEqual(history.length, 2);
            historyService.removeFromHistory(input2);
            history = historyService.getHistory();
            assert.strictEqual(history.length, 1);
            assert.strictEqual(history[0], input1);
        });
        test('getLastActiveFile', async () => {
            var _a;
            const [part, historyService] = await createServices();
            assert.ok(!historyService.getLastActiveFile('foo'));
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID);
            await part.activeGroup.openEditor(input1, editor_1.EditorOptions.create({ pinned: true }));
            assert.strictEqual((_a = historyService.getLastActiveFile('foo')) === null || _a === void 0 ? void 0 : _a.toString(), input1.resource.toString());
        });
        test('open next/previous recently used editor (single group)', async () => {
            const [part, historyService, editorService] = await createServices();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID);
            await part.activeGroup.openEditor(input1, editor_1.EditorOptions.create({ pinned: true }));
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            await part.activeGroup.openEditor(input2, editor_1.EditorOptions.create({ pinned: true }));
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor(part.activeGroup.id);
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input1);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor(part.activeGroup.id);
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
        });
        test('open next/previous recently used editor (multi group)', async () => {
            const [part, historyService, editorService] = await createServices();
            const rootGroup = part.activeGroup;
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID);
            const sideGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            await rootGroup.openEditor(input1, editor_1.EditorOptions.create({ pinned: true }));
            await sideGroup.openEditor(input2, editor_1.EditorOptions.create({ pinned: true }));
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup, rootGroup);
            assert.strictEqual(rootGroup.activeEditor, input1);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup, sideGroup);
            assert.strictEqual(sideGroup.activeEditor, input2);
        });
        test('open next/previous recently is reset when other input opens', async () => {
            const [part, historyService, editorService] = await createServices();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar3'), TEST_EDITOR_INPUT_ID);
            const input4 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('foo://bar4'), TEST_EDITOR_INPUT_ID);
            await part.activeGroup.openEditor(input1, editor_1.EditorOptions.create({ pinned: true }));
            await part.activeGroup.openEditor(input2, editor_1.EditorOptions.create({ pinned: true }));
            await part.activeGroup.openEditor(input3, editor_1.EditorOptions.create({ pinned: true }));
            let editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            await (0, async_1.timeout)(0);
            await part.activeGroup.openEditor(input4, editor_1.EditorOptions.create({ pinned: true }));
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openPreviouslyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input2);
            editorChangePromise = event_1.Event.toPromise(editorService.onDidActiveEditorChange);
            historyService.openNextRecentlyUsedEditor();
            await editorChangePromise;
            assert.strictEqual(part.activeGroup.activeEditor, input4);
        });
    });
});
//# sourceMappingURL=history.test.js.map