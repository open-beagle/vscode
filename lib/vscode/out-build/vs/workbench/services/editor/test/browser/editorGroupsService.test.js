/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor", "vs/base/common/uri", "vs/platform/instantiation/common/descriptors", "vs/base/common/lifecycle", "vs/platform/keybinding/test/common/mockKeybindingService"], function (require, exports, assert, workbenchTestServices_1, editor_1, uri_1, descriptors_1, lifecycle_1, mockKeybindingService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorGroupsService', () => {
        const TEST_EDITOR_ID = 'MyFileEditorForEditorGroupService';
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForEditorGroupService';
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestEditor)(TEST_EDITOR_ID, [new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestFileEditorInput)], TEST_EDITOR_INPUT_ID));
        });
        teardown(() => {
            disposables.clear();
        });
        async function createPart(instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)()) {
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            return [part, instantiationService];
        }
        test('groups basics', async function () {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({ contextKeyService: instantiationService => instantiationService.createInstance(mockKeybindingService_1.MockScopableContextKeyService) });
            const [part] = await createPart(instantiationService);
            let activeGroupChangeCounter = 0;
            const activeGroupChangeListener = part.onDidChangeActiveGroup(() => {
                activeGroupChangeCounter++;
            });
            let groupAddedCounter = 0;
            const groupAddedListener = part.onDidAddGroup(() => {
                groupAddedCounter++;
            });
            let groupRemovedCounter = 0;
            const groupRemovedListener = part.onDidRemoveGroup(() => {
                groupRemovedCounter++;
            });
            let groupMovedCounter = 0;
            const groupMovedListener = part.onDidMoveGroup(() => {
                groupMovedCounter++;
            });
            // always a root group
            const rootGroup = part.groups[0];
            assert.strictEqual(part.groups.length, 1);
            assert.strictEqual(part.count, 1);
            assert.strictEqual(rootGroup, part.getGroup(rootGroup.id));
            assert.ok(part.activeGroup === rootGroup);
            assert.strictEqual(rootGroup.label, 'Group 1');
            let mru = part.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 1);
            assert.strictEqual(mru[0], rootGroup);
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            assert.strictEqual(rightGroup, part.getGroup(rightGroup.id));
            assert.strictEqual(groupAddedCounter, 1);
            assert.strictEqual(part.groups.length, 2);
            assert.strictEqual(part.count, 2);
            assert.ok(part.activeGroup === rootGroup);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            mru = part.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 2);
            assert.strictEqual(mru[0], rootGroup);
            assert.strictEqual(mru[1], rightGroup);
            assert.strictEqual(activeGroupChangeCounter, 0);
            let rootGroupActiveChangeCounter = 0;
            const rootGroupChangeListener = rootGroup.onDidGroupChange(e => {
                if (e.kind === 0 /* GROUP_ACTIVE */) {
                    rootGroupActiveChangeCounter++;
                }
            });
            let rightGroupActiveChangeCounter = 0;
            const rightGroupChangeListener = rightGroup.onDidGroupChange(e => {
                if (e.kind === 0 /* GROUP_ACTIVE */) {
                    rightGroupActiveChangeCounter++;
                }
            });
            part.activateGroup(rightGroup);
            assert.ok(part.activeGroup === rightGroup);
            assert.strictEqual(activeGroupChangeCounter, 1);
            assert.strictEqual(rootGroupActiveChangeCounter, 1);
            assert.strictEqual(rightGroupActiveChangeCounter, 1);
            rootGroupChangeListener.dispose();
            rightGroupChangeListener.dispose();
            mru = part.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 2);
            assert.strictEqual(mru[0], rightGroup);
            assert.strictEqual(mru[1], rootGroup);
            const downGroup = part.addGroup(rightGroup, 1 /* DOWN */);
            let didDispose = false;
            downGroup.onWillDispose(() => {
                didDispose = true;
            });
            assert.strictEqual(groupAddedCounter, 2);
            assert.strictEqual(part.groups.length, 3);
            assert.ok(part.activeGroup === rightGroup);
            assert.ok(!downGroup.activeEditorPane);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            assert.strictEqual(downGroup.label, 'Group 3');
            mru = part.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 3);
            assert.strictEqual(mru[0], rightGroup);
            assert.strictEqual(mru[1], rootGroup);
            assert.strictEqual(mru[2], downGroup);
            const gridOrder = part.getGroups(2 /* GRID_APPEARANCE */);
            assert.strictEqual(gridOrder.length, 3);
            assert.strictEqual(gridOrder[0], rootGroup);
            assert.strictEqual(gridOrder[0].index, 0);
            assert.strictEqual(gridOrder[1], rightGroup);
            assert.strictEqual(gridOrder[1].index, 1);
            assert.strictEqual(gridOrder[2], downGroup);
            assert.strictEqual(gridOrder[2].index, 2);
            part.moveGroup(downGroup, rightGroup, 1 /* DOWN */);
            assert.strictEqual(groupMovedCounter, 1);
            part.removeGroup(downGroup);
            assert.ok(!part.getGroup(downGroup.id));
            assert.strictEqual(didDispose, true);
            assert.strictEqual(groupRemovedCounter, 1);
            assert.strictEqual(part.groups.length, 2);
            assert.ok(part.activeGroup === rightGroup);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            mru = part.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 2);
            assert.strictEqual(mru[0], rightGroup);
            assert.strictEqual(mru[1], rootGroup);
            const rightGroupContextKeyService = part.activeGroup.scopedContextKeyService;
            const rootGroupContextKeyService = rootGroup.scopedContextKeyService;
            assert.ok(rightGroupContextKeyService);
            assert.ok(rootGroupContextKeyService);
            assert.ok(rightGroupContextKeyService !== rootGroupContextKeyService);
            part.removeGroup(rightGroup);
            assert.strictEqual(groupRemovedCounter, 2);
            assert.strictEqual(part.groups.length, 1);
            assert.ok(part.activeGroup === rootGroup);
            mru = part.getGroups(1 /* MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru.length, 1);
            assert.strictEqual(mru[0], rootGroup);
            part.removeGroup(rootGroup); // cannot remove root group
            assert.strictEqual(part.groups.length, 1);
            assert.strictEqual(groupRemovedCounter, 2);
            assert.ok(part.activeGroup === rootGroup);
            part.setGroupOrientation(part.orientation === 0 /* HORIZONTAL */ ? 1 /* VERTICAL */ : 0 /* HORIZONTAL */);
            activeGroupChangeListener.dispose();
            groupAddedListener.dispose();
            groupRemovedListener.dispose();
            groupMovedListener.dispose();
        });
        test('save & restore state', async function () {
            let [part, instantiationService] = await createPart();
            const rootGroup = part.groups[0];
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            const downGroup = part.addGroup(rightGroup, 1 /* DOWN */);
            const rootGroupInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(rootGroupInput, editor_1.EditorOptions.create({ pinned: true }));
            const rightGroupInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await rightGroup.openEditor(rightGroupInput, editor_1.EditorOptions.create({ pinned: true }));
            assert.strictEqual(part.groups.length, 3);
            part.saveState();
            part.dispose();
            let [restoredPart] = await createPart(instantiationService);
            assert.strictEqual(restoredPart.groups.length, 3);
            assert.ok(restoredPart.getGroup(rootGroup.id));
            assert.ok(restoredPart.getGroup(rightGroup.id));
            assert.ok(restoredPart.getGroup(downGroup.id));
            restoredPart.clearState();
        });
        test('groups index / labels', async function () {
            const [part] = await createPart();
            const rootGroup = part.groups[0];
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            const downGroup = part.addGroup(rightGroup, 1 /* DOWN */);
            let groupIndexChangedCounter = 0;
            const groupIndexChangedListener = part.onDidChangeGroupIndex(() => {
                groupIndexChangedCounter++;
            });
            let indexChangeCounter = 0;
            const labelChangeListener = downGroup.onDidGroupChange(e => {
                if (e.kind === 1 /* GROUP_INDEX */) {
                    indexChangeCounter++;
                }
            });
            assert.strictEqual(rootGroup.index, 0);
            assert.strictEqual(rightGroup.index, 1);
            assert.strictEqual(downGroup.index, 2);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(rightGroup.label, 'Group 2');
            assert.strictEqual(downGroup.label, 'Group 3');
            part.removeGroup(rightGroup);
            assert.strictEqual(rootGroup.index, 0);
            assert.strictEqual(downGroup.index, 1);
            assert.strictEqual(rootGroup.label, 'Group 1');
            assert.strictEqual(downGroup.label, 'Group 2');
            assert.strictEqual(indexChangeCounter, 1);
            assert.strictEqual(groupIndexChangedCounter, 1);
            part.moveGroup(downGroup, rootGroup, 0 /* UP */);
            assert.strictEqual(downGroup.index, 0);
            assert.strictEqual(rootGroup.index, 1);
            assert.strictEqual(downGroup.label, 'Group 1');
            assert.strictEqual(rootGroup.label, 'Group 2');
            assert.strictEqual(indexChangeCounter, 2);
            assert.strictEqual(groupIndexChangedCounter, 3);
            const newFirstGroup = part.addGroup(downGroup, 0 /* UP */);
            assert.strictEqual(newFirstGroup.index, 0);
            assert.strictEqual(downGroup.index, 1);
            assert.strictEqual(rootGroup.index, 2);
            assert.strictEqual(newFirstGroup.label, 'Group 1');
            assert.strictEqual(downGroup.label, 'Group 2');
            assert.strictEqual(rootGroup.label, 'Group 3');
            assert.strictEqual(indexChangeCounter, 3);
            assert.strictEqual(groupIndexChangedCounter, 6);
            labelChangeListener.dispose();
            groupIndexChangedListener.dispose();
        });
        test('copy/merge groups', async () => {
            const [part] = await createPart();
            let groupAddedCounter = 0;
            const groupAddedListener = part.onDidAddGroup(() => {
                groupAddedCounter++;
            });
            let groupRemovedCounter = 0;
            const groupRemovedListener = part.onDidRemoveGroup(() => {
                groupRemovedCounter++;
            });
            const rootGroup = part.groups[0];
            let rootGroupDisposed = false;
            const disposeListener = rootGroup.onWillDispose(() => {
                rootGroupDisposed = true;
            });
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(input, editor_1.EditorOptions.create({ pinned: true }));
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */, { activate: true });
            const downGroup = part.copyGroup(rootGroup, rightGroup, 1 /* DOWN */);
            assert.strictEqual(groupAddedCounter, 2);
            assert.strictEqual(downGroup.count, 1);
            assert.ok(downGroup.activeEditor instanceof workbenchTestServices_1.TestFileEditorInput);
            part.mergeGroup(rootGroup, rightGroup, { mode: 0 /* COPY_EDITORS */ });
            assert.strictEqual(rightGroup.count, 1);
            assert.ok(rightGroup.activeEditor instanceof workbenchTestServices_1.TestFileEditorInput);
            part.mergeGroup(rootGroup, rightGroup, { mode: 1 /* MOVE_EDITORS */ });
            assert.strictEqual(rootGroup.count, 0);
            part.mergeGroup(rootGroup, downGroup);
            assert.strictEqual(groupRemovedCounter, 1);
            assert.strictEqual(rootGroupDisposed, true);
            groupAddedListener.dispose();
            groupRemovedListener.dispose();
            disposeListener.dispose();
            part.dispose();
        });
        test('merge all groups', async () => {
            const [part] = await createPart();
            const rootGroup = part.groups[0];
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await rootGroup.openEditor(input1, editor_1.EditorOptions.create({ pinned: true }));
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            await rightGroup.openEditor(input2, editor_1.EditorOptions.create({ pinned: true }));
            const downGroup = part.copyGroup(rootGroup, rightGroup, 1 /* DOWN */);
            await downGroup.openEditor(input3, editor_1.EditorOptions.create({ pinned: true }));
            part.activateGroup(rootGroup);
            assert.strictEqual(rootGroup.count, 1);
            const result = part.mergeAllGroups();
            assert.strictEqual(result.id, rootGroup.id);
            assert.strictEqual(rootGroup.count, 3);
            part.dispose();
        });
        test('whenReady / whenRestored', async () => {
            const [part] = await createPart();
            await part.whenReady;
            await part.whenRestored;
            assert.strictEqual(part.isRestored(), true);
        });
        test('options', async () => {
            const [part] = await createPart();
            let oldOptions;
            let newOptions;
            part.onDidChangeEditorPartOptions(event => {
                oldOptions = event.oldPartOptions;
                newOptions = event.newPartOptions;
            });
            const currentOptions = part.partOptions;
            assert.ok(currentOptions);
            part.enforcePartOptions({ showTabs: false });
            assert.strictEqual(part.partOptions.showTabs, false);
            assert.strictEqual(newOptions.showTabs, false);
            assert.strictEqual(oldOptions, currentOptions);
        });
        test('editor basics', async function () {
            var _a;
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            let activeEditorChangeCounter = 0;
            let editorDidOpenCounter = 0;
            let editorCloseCounter = 0;
            let editorPinCounter = 0;
            let editorStickyCounter = 0;
            const editorGroupChangeListener = group.onDidGroupChange(e => {
                if (e.kind === 2 /* EDITOR_OPEN */) {
                    assert.ok(e.editor);
                    editorDidOpenCounter++;
                }
                else if (e.kind === 5 /* EDITOR_ACTIVE */) {
                    assert.ok(e.editor);
                    activeEditorChangeCounter++;
                }
                else if (e.kind === 3 /* EDITOR_CLOSE */) {
                    assert.ok(e.editor);
                    editorCloseCounter++;
                }
                else if (e.kind === 7 /* EDITOR_PIN */) {
                    assert.ok(e.editor);
                    editorPinCounter++;
                }
                else if (e.kind === 8 /* EDITOR_STICKY */) {
                    assert.ok(e.editor);
                    editorStickyCounter++;
                }
            });
            let editorCloseCounter1 = 0;
            const editorCloseListener = group.onDidCloseEditor(() => {
                editorCloseCounter1++;
            });
            let editorWillCloseCounter = 0;
            const editorWillCloseListener = group.onWillCloseEditor(() => {
                editorWillCloseCounter++;
            });
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input, editor_1.EditorOptions.create({ pinned: true }));
            await group.openEditor(inputInactive, editor_1.EditorOptions.create({ inactive: true }));
            assert.strictEqual(group.isActive(input), true);
            assert.strictEqual(group.isActive(inputInactive), false);
            assert.strictEqual(group.contains(input), true);
            assert.strictEqual(group.contains(inputInactive), true);
            assert.strictEqual(group.isEmpty, false);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(editorDidOpenCounter, 2);
            assert.strictEqual(activeEditorChangeCounter, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            assert.strictEqual(group.getIndexOfEditor(input), 0);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 1);
            assert.strictEqual(group.previewEditor, inputInactive);
            assert.strictEqual(group.isPinned(inputInactive), false);
            group.pinEditor(inputInactive);
            assert.strictEqual(editorPinCounter, 1);
            assert.strictEqual(group.isPinned(inputInactive), true);
            assert.ok(!group.previewEditor);
            assert.strictEqual(group.activeEditor, input);
            assert.strictEqual((_a = group.activeEditorPane) === null || _a === void 0 ? void 0 : _a.getId(), TEST_EDITOR_ID);
            assert.strictEqual(group.count, 2);
            const mru = group.getEditors(0 /* MOST_RECENTLY_ACTIVE */);
            assert.strictEqual(mru[0], input);
            assert.strictEqual(mru[1], inputInactive);
            await group.openEditor(inputInactive);
            assert.strictEqual(activeEditorChangeCounter, 2);
            assert.strictEqual(group.activeEditor, inputInactive);
            await group.openEditor(input);
            await group.closeEditor(inputInactive);
            assert.strictEqual(activeEditorChangeCounter, 3);
            assert.strictEqual(editorCloseCounter, 1);
            assert.strictEqual(editorCloseCounter1, 1);
            assert.strictEqual(editorWillCloseCounter, 1);
            assert.ok(inputInactive.gotDisposed);
            assert.strictEqual(group.activeEditor, input);
            assert.strictEqual(editorStickyCounter, 0);
            group.stickEditor(input);
            assert.strictEqual(editorStickyCounter, 1);
            group.unstickEditor(input);
            assert.strictEqual(editorStickyCounter, 2);
            editorCloseListener.dispose();
            editorWillCloseListener.dispose();
            editorGroupChangeListener.dispose();
        });
        test('openEditors / closeEditors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input, options: { pinned: true } },
                { editor: inputInactive }
            ]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            await group.closeEditors([input, inputInactive]);
            assert.ok(input.gotDisposed);
            assert.ok(inputInactive.gotDisposed);
            assert.strictEqual(group.isEmpty, true);
        });
        test('closeEditor - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            const group = part.activeGroup;
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            input.dirty = true;
            await group.openEditor(input);
            accessor.fileDialogService.setConfirmResult(2 /* CANCEL */);
            await group.closeEditor(input);
            assert.ok(!input.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            await group.closeEditor(input);
            assert.ok(input.gotDisposed);
        });
        test('closeEditor (one, opened in multiple groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* RIGHT */);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            await rightGroup.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            await rightGroup.closeEditor(input);
            assert.ok(!input.gotDisposed);
            await group.closeEditor(input);
            assert.ok(input.gotDisposed);
        });
        test('closeEditors - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            const group = part.activeGroup;
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            await group.openEditor(input2);
            accessor.fileDialogService.setConfirmResult(2 /* CANCEL */);
            await group.closeEditors([input1, input2]);
            assert.ok(!input1.gotDisposed);
            assert.ok(!input2.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            await group.closeEditors([input1, input2]);
            assert.ok(input1.gotDisposed);
            assert.ok(input2.gotDisposed);
        });
        test('closeEditors (except one)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ except: input2 });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input2);
        });
        test('closeEditors (except one, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ except: input2, excludeSticky: true });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            await group.closeEditors({ except: input2 });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.getEditorByIndex(0), input2);
        });
        test('closeEditors (saved only)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ savedOnly: true });
            assert.strictEqual(group.count, 0);
        });
        test('closeEditors (saved only, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ savedOnly: true, excludeSticky: true });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            await group.closeEditors({ savedOnly: true });
            assert.strictEqual(group.count, 0);
        });
        test('closeEditors (direction: right)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 1 /* RIGHT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
        });
        test('closeEditors (direction: right, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 1 /* RIGHT */, except: input2, excludeSticky: true });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            await group.closeEditors({ direction: 1 /* RIGHT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
        });
        test('closeEditors (direction: left)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 0 /* LEFT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input2);
            assert.strictEqual(group.getEditorByIndex(1), input3);
        });
        test('closeEditors (direction: left, sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input1, options: { pinned: true, sticky: true } },
                { editor: input2, options: { pinned: true } },
                { editor: input3 }
            ]);
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 0 /* LEFT */, except: input2, excludeSticky: true });
            assert.strictEqual(group.count, 3);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input1);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input3);
            await group.closeEditors({ direction: 0 /* LEFT */, except: input2 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input2);
            assert.strictEqual(group.getEditorByIndex(1), input3);
        });
        test('closeAllEditors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input, options: { pinned: true } },
                { editor: inputInactive }
            ]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            await group.closeAllEditors();
            assert.strictEqual(group.isEmpty, true);
        });
        test('closeAllEditors - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            const group = part.activeGroup;
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            await group.openEditor(input2);
            accessor.fileDialogService.setConfirmResult(2 /* CANCEL */);
            await group.closeAllEditors();
            assert.ok(!input1.gotDisposed);
            assert.ok(!input2.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            await group.closeAllEditors();
            assert.ok(input1.gotDisposed);
            assert.ok(input2.gotDisposed);
        });
        test('closeAllEditors (sticky editor)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([
                { editor: input, options: { pinned: true, sticky: true } },
                { editor: inputInactive }
            ]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.stickyCount, 1);
            await group.closeAllEditors({ excludeSticky: true });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            await group.closeAllEditors();
            assert.strictEqual(group.isEmpty, true);
        });
        test('moveEditor (same group)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            let editorMoveCounter = 0;
            const editorGroupChangeListener = group.onDidGroupChange(e => {
                if (e.kind === 4 /* EDITOR_MOVE */) {
                    assert.ok(e.editor);
                    editorMoveCounter++;
                }
            });
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            group.moveEditor(inputInactive, group, { index: 0 });
            assert.strictEqual(editorMoveCounter, 1);
            assert.strictEqual(group.getEditorByIndex(0), inputInactive);
            assert.strictEqual(group.getEditorByIndex(1), input);
            editorGroupChangeListener.dispose();
        });
        test('moveEditor (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* RIGHT */);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            group.moveEditor(inputInactive, rightGroup, { index: 0 });
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(rightGroup.count, 1);
            assert.strictEqual(rightGroup.getEditorByIndex(0), inputInactive);
        });
        test('copyEditor (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* RIGHT */);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            group.copyEditor(inputInactive, rightGroup, { index: 0 });
            assert.strictEqual(group.count, 2);
            assert.strictEqual(group.getEditorByIndex(0), input);
            assert.strictEqual(group.getEditorByIndex(1), inputInactive);
            assert.strictEqual(rightGroup.count, 1);
            assert.strictEqual(rightGroup.getEditorByIndex(0), inputInactive);
        });
        test('replaceEditors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), input);
            await group.replaceEditors([{ editor: input, replacement: inputInactive }]);
            assert.strictEqual(group.count, 1);
            assert.strictEqual(group.getEditorByIndex(0), inputInactive);
        });
        test('replaceEditors - dirty editor handling', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            const group = part.activeGroup;
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            assert.strictEqual(group.activeEditor, input1);
            accessor.fileDialogService.setConfirmResult(2 /* CANCEL */);
            await group.replaceEditors([{ editor: input1, replacement: input2 }]);
            assert.strictEqual(group.activeEditor, input1);
            assert.ok(!input1.gotDisposed);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            await group.replaceEditors([{ editor: input1, replacement: input2 }]);
            assert.strictEqual(group.activeEditor, input2);
            assert.ok(input1.gotDisposed);
        });
        test('replaceEditors - forceReplaceDirty flag', async () => {
            const [part, instantiationService] = await createPart();
            const accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            accessor.fileDialogService.setConfirmResult(1 /* DONT_SAVE */);
            const group = part.activeGroup;
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1);
            assert.strictEqual(group.activeEditor, input1);
            accessor.fileDialogService.setConfirmResult(2 /* CANCEL */);
            await group.replaceEditors([{ editor: input1, replacement: input2, forceReplaceDirty: false }]);
            assert.strictEqual(group.activeEditor, input1);
            assert.ok(!input1.gotDisposed);
            await group.replaceEditors([{ editor: input1, replacement: input2, forceReplaceDirty: true }]);
            assert.strictEqual(group.activeEditor, input2);
            assert.ok(input1.gotDisposed);
        });
        test('replaceEditors - proper index handling', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar2'), TEST_EDITOR_INPUT_ID);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            const input4 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar4'), TEST_EDITOR_INPUT_ID);
            const input5 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar5'), TEST_EDITOR_INPUT_ID);
            const input6 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar6'), TEST_EDITOR_INPUT_ID);
            const input7 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar7'), TEST_EDITOR_INPUT_ID);
            const input8 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar8'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input1, { pinned: true });
            await group.openEditor(input2, { pinned: true });
            await group.openEditor(input3, { pinned: true });
            await group.openEditor(input4, { pinned: true });
            await group.openEditor(input5, { pinned: true });
            await group.replaceEditors([
                { editor: input1, replacement: input6 },
                { editor: input3, replacement: input7 },
                { editor: input5, replacement: input8 }
            ]);
            assert.strictEqual(group.getEditorByIndex(0), input6);
            assert.strictEqual(group.getEditorByIndex(1), input2);
            assert.strictEqual(group.getEditorByIndex(2), input7);
            assert.strictEqual(group.getEditorByIndex(3), input4);
            assert.strictEqual(group.getEditorByIndex(4), input8);
        });
        test('find editors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            const group2 = part.addGroup(group, 3 /* RIGHT */);
            assert.strictEqual(group.isEmpty, true);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar1'), `${TEST_EDITOR_INPUT_ID}-1`);
            const input3 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar3'), TEST_EDITOR_INPUT_ID);
            const input4 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar4'), TEST_EDITOR_INPUT_ID);
            const input5 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar4'), `${TEST_EDITOR_INPUT_ID}-1`);
            await group.openEditor(input1, { pinned: true });
            await group.openEditor(input2, { pinned: true });
            await group.openEditor(input3, { pinned: true });
            await group.openEditor(input4, { pinned: true });
            await group2.openEditor(input5, { pinned: true });
            let foundEditors = group.findEditors(uri_1.URI.file('foo/bar1'));
            assert.strictEqual(foundEditors.length, 2);
            foundEditors = group2.findEditors(uri_1.URI.file('foo/bar4'));
            assert.strictEqual(foundEditors.length, 1);
        });
        test('find neighbour group (left/right)', async function () {
            const [part] = await createPart();
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            assert.strictEqual(rightGroup, part.findGroup({ direction: 3 /* RIGHT */ }, rootGroup));
            assert.strictEqual(rootGroup, part.findGroup({ direction: 2 /* LEFT */ }, rightGroup));
        });
        test('find neighbour group (up/down)', async function () {
            const [part] = await createPart();
            const rootGroup = part.activeGroup;
            const downGroup = part.addGroup(rootGroup, 1 /* DOWN */);
            assert.strictEqual(downGroup, part.findGroup({ direction: 1 /* DOWN */ }, rootGroup));
            assert.strictEqual(rootGroup, part.findGroup({ direction: 0 /* UP */ }, downGroup));
        });
        test('find group by location (left/right)', async function () {
            const [part] = await createPart();
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            const downGroup = part.addGroup(rightGroup, 1 /* DOWN */);
            assert.strictEqual(rootGroup, part.findGroup({ location: 0 /* FIRST */ }));
            assert.strictEqual(downGroup, part.findGroup({ location: 1 /* LAST */ }));
            assert.strictEqual(rightGroup, part.findGroup({ location: 2 /* NEXT */ }, rootGroup));
            assert.strictEqual(rootGroup, part.findGroup({ location: 3 /* PREVIOUS */ }, rightGroup));
            assert.strictEqual(downGroup, part.findGroup({ location: 2 /* NEXT */ }, rightGroup));
            assert.strictEqual(rightGroup, part.findGroup({ location: 3 /* PREVIOUS */ }, downGroup));
        });
        test('applyLayout (2x2)', async function () {
            const [part] = await createPart();
            part.applyLayout({ groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }], orientation: 0 /* HORIZONTAL */ });
            assert.strictEqual(part.groups.length, 4);
        });
        test('centeredLayout', async function () {
            const [part] = await createPart();
            part.centerLayout(true);
            assert.strictEqual(part.isLayoutCentered(), true);
        });
        test('sticky editors', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */).length, 0);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */).length, 0);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).length, 0);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 0);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(input, editor_1.EditorOptions.create({ pinned: true }));
            await group.openEditor(inputInactive, editor_1.EditorOptions.create({ inactive: true }));
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), false);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).length, 2);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 2);
            group.stickEditor(input);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.isSticky(input), true);
            assert.strictEqual(group.isSticky(inputInactive), false);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).length, 1);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 1);
            group.unstickEditor(input);
            assert.strictEqual(group.stickyCount, 0);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), false);
            assert.strictEqual(group.getIndexOfEditor(input), 0);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 1);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).length, 2);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 2);
            let editorMoveCounter = 0;
            const editorGroupChangeListener = group.onDidGroupChange(e => {
                if (e.kind === 4 /* EDITOR_MOVE */) {
                    assert.ok(e.editor);
                    editorMoveCounter++;
                }
            });
            group.stickEditor(inputInactive);
            assert.strictEqual(group.stickyCount, 1);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), true);
            assert.strictEqual(group.getIndexOfEditor(input), 1);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 0);
            assert.strictEqual(editorMoveCounter, 1);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */).length, 2);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */).length, 2);
            assert.strictEqual(group.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).length, 1);
            assert.strictEqual(group.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true }).length, 1);
            const inputSticky = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/sticky'), TEST_EDITOR_INPUT_ID);
            await group.openEditor(inputSticky, editor_1.EditorOptions.create({ sticky: true }));
            assert.strictEqual(group.stickyCount, 2);
            assert.strictEqual(group.isSticky(input), false);
            assert.strictEqual(group.isSticky(inputInactive), true);
            assert.strictEqual(group.isSticky(inputSticky), true);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 0);
            assert.strictEqual(group.getIndexOfEditor(inputSticky), 1);
            assert.strictEqual(group.getIndexOfEditor(input), 2);
            await group.openEditor(input, editor_1.EditorOptions.create({ sticky: true }));
            assert.strictEqual(group.stickyCount, 3);
            assert.strictEqual(group.isSticky(input), true);
            assert.strictEqual(group.isSticky(inputInactive), true);
            assert.strictEqual(group.isSticky(inputSticky), true);
            assert.strictEqual(group.getIndexOfEditor(inputInactive), 0);
            assert.strictEqual(group.getIndexOfEditor(inputSticky), 1);
            assert.strictEqual(group.getIndexOfEditor(input), 2);
            editorGroupChangeListener.dispose();
        });
        test('moveEditor with context (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            const rightGroup = part.addGroup(group, 3 /* RIGHT */);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            const thirdInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/third'), TEST_EDITOR_INPUT_ID);
            let leftFiredCount = 0;
            const leftGroupListener = group.onWillMoveEditor(() => {
                leftFiredCount++;
            });
            let rightFiredCount = 0;
            const rightGroupListener = rightGroup.onWillMoveEditor(() => {
                rightFiredCount++;
            });
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }, { editor: thirdInput }]);
            assert.strictEqual(leftFiredCount, 0);
            assert.strictEqual(rightFiredCount, 0);
            group.moveEditor(input, rightGroup);
            assert.strictEqual(leftFiredCount, 1);
            assert.strictEqual(rightFiredCount, 0);
            group.moveEditor(inputInactive, rightGroup);
            assert.strictEqual(leftFiredCount, 2);
            assert.strictEqual(rightFiredCount, 0);
            rightGroup.moveEditor(inputInactive, group);
            assert.strictEqual(leftFiredCount, 2);
            assert.strictEqual(rightFiredCount, 1);
            leftGroupListener.dispose();
            rightGroupListener.dispose();
        });
        test('copyEditor with context (across groups)', async () => {
            const [part] = await createPart();
            const group = part.activeGroup;
            assert.strictEqual(group.isEmpty, true);
            let firedCount = 0;
            const moveListener = group.onWillMoveEditor(() => firedCount++);
            const rightGroup = part.addGroup(group, 3 /* RIGHT */);
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar'), TEST_EDITOR_INPUT_ID);
            const inputInactive = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.file('foo/bar/inactive'), TEST_EDITOR_INPUT_ID);
            await group.openEditors([{ editor: input, options: { pinned: true } }, { editor: inputInactive }]);
            assert.strictEqual(firedCount, 0);
            group.copyEditor(inputInactive, rightGroup, { index: 0 });
            assert.strictEqual(firedCount, 0);
            moveListener.dispose();
        });
    });
});
//# sourceMappingURL=editorGroupsService.test.js.map