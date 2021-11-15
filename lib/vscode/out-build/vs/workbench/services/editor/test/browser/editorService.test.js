/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "assert", "vs/platform/editor/common/editor", "vs/base/common/uri", "vs/base/common/event", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/theme/test/common/testThemeService", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/base/common/async", "vs/base/test/common/utils", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/editor/common/modes/modesRegistry", "vs/platform/files/test/common/nullFileSystemProvider", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/platform", "vs/platform/keybinding/test/common/mockKeybindingService"], function (require, exports, assert, editor_1, uri_1, event_1, editorPane_1, editor_2, workbenchTestServices_1, resourceEditorInput_1, testThemeService_1, editorService_1, editorGroupsService_1, editorService_2, descriptors_1, fileEditorInput_1, untitledTextEditorInput_1, async_1, utils_1, files_1, lifecycle_1, modesRegistry_1, nullFileSystemProvider_1, diffEditorInput_1, workbenchTestServices_2, platform_1, mockKeybindingService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EditorService', () => {
        const TEST_EDITOR_ID = 'MyTestEditorForEditorService';
        const TEST_EDITOR_INPUT_ID = 'testEditorInputForEditorService';
        let FileServiceProvider = class FileServiceProvider extends lifecycle_1.Disposable {
            constructor(scheme, fileService) {
                super();
                this._register(fileService.registerProvider(scheme, new nullFileSystemProvider_1.NullFileSystemProvider()));
            }
        };
        FileServiceProvider = __decorate([
            __param(1, files_1.IFileService)
        ], FileServiceProvider);
        const disposables = new lifecycle_1.DisposableStore();
        setup(() => {
            disposables.add((0, workbenchTestServices_1.registerTestEditor)(TEST_EDITOR_ID, [new descriptors_1.SyncDescriptor(workbenchTestServices_1.TestFileEditorInput)], TEST_EDITOR_INPUT_ID));
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            disposables.add((0, workbenchTestServices_1.registerTestSideBySideEditor)());
        });
        teardown(() => {
            disposables.clear();
        });
        async function createEditorService(instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)()) {
            const part = await (0, workbenchTestServices_1.createEditorPart)(instantiationService, disposables);
            instantiationService.stub(editorGroupsService_1.IEditorGroupsService, part);
            const editorService = instantiationService.createInstance(editorService_1.EditorService);
            instantiationService.stub(editorService_2.IEditorService, editorService);
            return [part, editorService, instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor)];
        }
        test('basics', async () => {
            var _a;
            const [, service] = await createEditorService();
            let input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            let otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-basics'), TEST_EDITOR_INPUT_ID);
            let activeEditorChangeEventCounter = 0;
            const activeEditorChangeListener = service.onDidActiveEditorChange(() => {
                activeEditorChangeEventCounter++;
            });
            let visibleEditorChangeEventCounter = 0;
            const visibleEditorChangeListener = service.onDidVisibleEditorsChange(() => {
                visibleEditorChangeEventCounter++;
            });
            let didCloseEditorListenerCounter = 0;
            const didCloseEditorListener = service.onDidCloseEditor(() => {
                didCloseEditorListenerCounter++;
            });
            // Open input
            let editor = await service.openEditor(input, { pinned: true });
            assert.strictEqual(editor === null || editor === void 0 ? void 0 : editor.getId(), TEST_EDITOR_ID);
            assert.strictEqual(editor, service.activeEditorPane);
            assert.strictEqual(1, service.count);
            assert.strictEqual(input, service.getEditors(0 /* MOST_RECENTLY_ACTIVE */)[0].editor);
            assert.strictEqual(input, service.getEditors(1 /* SEQUENTIAL */)[0].editor);
            assert.strictEqual(input, service.activeEditor);
            assert.strictEqual(service.visibleEditorPanes.length, 1);
            assert.strictEqual(service.visibleEditorPanes[0], editor);
            assert.ok(!service.activeTextEditorControl);
            assert.ok(!service.activeTextEditorMode);
            assert.strictEqual(service.visibleTextEditorControls.length, 0);
            assert.strictEqual(service.isOpened(input), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId }), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: 'unknownTypeId' }), false);
            assert.strictEqual(activeEditorChangeEventCounter, 1);
            assert.strictEqual(visibleEditorChangeEventCounter, 1);
            // Close input
            await ((_a = editor === null || editor === void 0 ? void 0 : editor.group) === null || _a === void 0 ? void 0 : _a.closeEditor(input));
            assert.strictEqual(0, service.count);
            assert.strictEqual(0, service.getEditors(0 /* MOST_RECENTLY_ACTIVE */).length);
            assert.strictEqual(0, service.getEditors(1 /* SEQUENTIAL */).length);
            assert.strictEqual(didCloseEditorListenerCounter, 1);
            assert.strictEqual(activeEditorChangeEventCounter, 2);
            assert.strictEqual(visibleEditorChangeEventCounter, 2);
            assert.ok(input.gotDisposed);
            // Open again 2 inputs (disposed editors are ignored!)
            await service.openEditor(input, { pinned: true });
            assert.strictEqual(0, service.count);
            // Open again 2 inputs (recreate because disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-basics'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-basics'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input, { pinned: true });
            editor = await service.openEditor(otherInput, { pinned: true });
            assert.strictEqual(2, service.count);
            assert.strictEqual(otherInput, service.getEditors(0 /* MOST_RECENTLY_ACTIVE */)[0].editor);
            assert.strictEqual(input, service.getEditors(0 /* MOST_RECENTLY_ACTIVE */)[1].editor);
            assert.strictEqual(input, service.getEditors(1 /* SEQUENTIAL */)[0].editor);
            assert.strictEqual(otherInput, service.getEditors(1 /* SEQUENTIAL */)[1].editor);
            assert.strictEqual(service.visibleEditorPanes.length, 1);
            assert.strictEqual(service.isOpened(input), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId }), true);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId }), true);
            assert.strictEqual(activeEditorChangeEventCounter, 4);
            assert.strictEqual(visibleEditorChangeEventCounter, 4);
            const stickyInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource3-basics'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(stickyInput, { sticky: true });
            assert.strictEqual(3, service.count);
            const allSequentialEditors = service.getEditors(1 /* SEQUENTIAL */);
            assert.strictEqual(allSequentialEditors.length, 3);
            assert.strictEqual(stickyInput, allSequentialEditors[0].editor);
            assert.strictEqual(input, allSequentialEditors[1].editor);
            assert.strictEqual(otherInput, allSequentialEditors[2].editor);
            const sequentialEditorsExcludingSticky = service.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true });
            assert.strictEqual(sequentialEditorsExcludingSticky.length, 2);
            assert.strictEqual(input, sequentialEditorsExcludingSticky[0].editor);
            assert.strictEqual(otherInput, sequentialEditorsExcludingSticky[1].editor);
            const mruEditorsExcludingSticky = service.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true });
            assert.strictEqual(mruEditorsExcludingSticky.length, 2);
            assert.strictEqual(input, sequentialEditorsExcludingSticky[0].editor);
            assert.strictEqual(otherInput, sequentialEditorsExcludingSticky[1].editor);
            activeEditorChangeListener.dispose();
            visibleEditorChangeListener.dispose();
            didCloseEditorListener.dispose();
        });
        test('isOpen() with side by side editor', async () => {
            var _a, _b;
            const [part, service] = await createEditorService();
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            const sideBySideInput = new editor_2.SideBySideEditorInput('sideBySide', '', input, otherInput);
            const editor1 = await service.openEditor(sideBySideInput, { pinned: true });
            assert.strictEqual(part.activeGroup.count, 1);
            assert.strictEqual(service.isOpened(input), false);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId }), false);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId }), true);
            const editor2 = await service.openEditor(input, { pinned: true });
            assert.strictEqual(part.activeGroup.count, 2);
            assert.strictEqual(service.isOpened(input), true);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId }), true);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId }), true);
            await ((_a = editor2 === null || editor2 === void 0 ? void 0 : editor2.group) === null || _a === void 0 ? void 0 : _a.closeEditor(input));
            assert.strictEqual(part.activeGroup.count, 1);
            assert.strictEqual(service.isOpened(input), false);
            assert.strictEqual(service.isOpened(otherInput), true);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId }), false);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId }), true);
            await ((_b = editor1 === null || editor1 === void 0 ? void 0 : editor1.group) === null || _b === void 0 ? void 0 : _b.closeEditor(sideBySideInput));
            assert.strictEqual(service.isOpened(input), false);
            assert.strictEqual(service.isOpened(otherInput), false);
            assert.strictEqual(service.isOpened({ resource: input.resource, typeId: input.typeId }), false);
            assert.strictEqual(service.isOpened({ resource: otherInput.resource, typeId: otherInput.typeId }), false);
        });
        test('openEditors() / replaceEditors()', async () => {
            const [part, service] = await createEditorService();
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            const replaceInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource3-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            assert.strictEqual(part.activeGroup.count, 2);
            // Replace editors
            await service.replaceEditors([{ editor: input, replacement: replaceInput }], part.activeGroup);
            assert.strictEqual(part.activeGroup.count, 2);
            assert.strictEqual(part.activeGroup.getIndexOfEditor(replaceInput), 0);
        });
        test('caching', function () {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            const service = instantiationService.createInstance(editorService_1.EditorService);
            // Cached Input (Files)
            const fileResource1 = utils_1.toResource.call(this, '/foo/bar/cache1.js');
            const fileEditorInput1 = service.createEditorInput({ resource: fileResource1 });
            assert.ok(fileEditorInput1);
            const fileResource2 = utils_1.toResource.call(this, '/foo/bar/cache2.js');
            const fileEditorInput2 = service.createEditorInput({ resource: fileResource2 });
            assert.ok(fileEditorInput2);
            assert.notStrictEqual(fileEditorInput1, fileEditorInput2);
            const fileEditorInput1Again = service.createEditorInput({ resource: fileResource1 });
            assert.strictEqual(fileEditorInput1Again, fileEditorInput1);
            fileEditorInput1Again.dispose();
            assert.ok(fileEditorInput1.isDisposed());
            const fileEditorInput1AgainAndAgain = service.createEditorInput({ resource: fileResource1 });
            assert.notStrictEqual(fileEditorInput1AgainAndAgain, fileEditorInput1);
            assert.ok(!fileEditorInput1AgainAndAgain.isDisposed());
            // Cached Input (Resource)
            const resource1 = uri_1.URI.from({ scheme: 'custom', path: '/foo/bar/cache1.js' });
            const input1 = service.createEditorInput({ resource: resource1 });
            assert.ok(input1);
            const resource2 = uri_1.URI.from({ scheme: 'custom', path: '/foo/bar/cache2.js' });
            const input2 = service.createEditorInput({ resource: resource2 });
            assert.ok(input2);
            assert.notStrictEqual(input1, input2);
            const input1Again = service.createEditorInput({ resource: resource1 });
            assert.strictEqual(input1Again, input1);
            input1Again.dispose();
            assert.ok(input1.isDisposed());
            const input1AgainAndAgain = service.createEditorInput({ resource: resource1 });
            assert.notStrictEqual(input1AgainAndAgain, input1);
            assert.ok(!input1AgainAndAgain.isDisposed());
        });
        test('createEditorInput', async function () {
            var _a, _b, _c, _d, _e;
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            const service = instantiationService.createInstance(editorService_1.EditorService);
            const mode = 'create-input-test';
            modesRegistry_1.ModesRegistry.registerLanguage({
                id: mode,
            });
            // Untyped Input (file)
            let input = service.createEditorInput({ resource: utils_1.toResource.call(this, '/index.html'), options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            let contentInput = input;
            assert.strictEqual(contentInput.resource.fsPath, utils_1.toResource.call(this, '/index.html').fsPath);
            // Untyped Input (file casing)
            input = service.createEditorInput({ resource: utils_1.toResource.call(this, '/index.html') });
            let inputDifferentCase = service.createEditorInput({ resource: utils_1.toResource.call(this, '/INDEX.html') });
            if (!platform_1.isLinux) {
                assert.strictEqual(input, inputDifferentCase);
                assert.strictEqual((_a = input.resource) === null || _a === void 0 ? void 0 : _a.toString(), (_b = inputDifferentCase.resource) === null || _b === void 0 ? void 0 : _b.toString());
            }
            else {
                assert.notStrictEqual(input, inputDifferentCase);
                assert.notStrictEqual((_c = input.resource) === null || _c === void 0 ? void 0 : _c.toString(), (_d = inputDifferentCase.resource) === null || _d === void 0 ? void 0 : _d.toString());
            }
            // Typed Input
            assert.strictEqual(service.createEditorInput(input), input);
            assert.strictEqual(service.createEditorInput({ editor: input }), input);
            // Untyped Input (file, encoding)
            input = service.createEditorInput({ resource: utils_1.toResource.call(this, '/index.html'), encoding: 'utf16le', options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredEncoding(), 'utf16le');
            // Untyped Input (file, mode)
            input = service.createEditorInput({ resource: utils_1.toResource.call(this, '/index.html'), mode });
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredMode(), mode);
            // Untyped Input (file, different mode)
            input = service.createEditorInput({ resource: utils_1.toResource.call(this, '/index.html'), mode: 'text' });
            assert(input instanceof fileEditorInput_1.FileEditorInput);
            contentInput = input;
            assert.strictEqual(contentInput.getPreferredMode(), 'text');
            // Untyped Input (untitled)
            input = service.createEditorInput({ options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            // Untyped Input (untitled with contents)
            input = service.createEditorInput({ contents: 'Hello Untitled', options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            let model = await input.resolve();
            assert.strictEqual((_e = model.textEditorModel) === null || _e === void 0 ? void 0 : _e.getValue(), 'Hello Untitled');
            // Untyped Input (untitled with mode)
            input = service.createEditorInput({ mode, options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            model = await input.resolve();
            assert.strictEqual(model.getMode(), mode);
            // Untyped Input (untitled with file path)
            input = service.createEditorInput({ resource: uri_1.URI.file('/some/path.txt'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            assert.ok(input.model.hasAssociatedFilePath);
            // Untyped Input (untitled with untitled resource)
            input = service.createEditorInput({ resource: uri_1.URI.parse('untitled://Untitled-1'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            assert.ok(!input.model.hasAssociatedFilePath);
            // Untyped Input (untitled with custom resource)
            const provider = instantiationService.createInstance(FileServiceProvider, 'untitled-custom');
            input = service.createEditorInput({ resource: uri_1.URI.parse('untitled-custom://some/path'), forceUntitled: true, options: { selection: { startLineNumber: 1, startColumn: 1 } } });
            assert(input instanceof untitledTextEditorInput_1.UntitledTextEditorInput);
            assert.ok(input.model.hasAssociatedFilePath);
            provider.dispose();
            // Untyped Input (resource)
            input = service.createEditorInput({ resource: uri_1.URI.parse('custom:resource') });
            assert(input instanceof resourceEditorInput_1.ResourceEditorInput);
            // Untyped Input (diff)
            input = service.createEditorInput({
                leftResource: utils_1.toResource.call(this, '/primary.html'),
                rightResource: utils_1.toResource.call(this, '/secondary.html')
            });
            assert(input instanceof diffEditorInput_1.DiffEditorInput);
        });
        test('delegate', function (done) {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            class MyEditor extends editorPane_1.EditorPane {
                constructor(id) {
                    super(id, undefined, new testThemeService_1.TestThemeService(), new workbenchTestServices_2.TestStorageService());
                }
                getId() {
                    return 'myEditor';
                }
                layout() { }
                createEditor() { }
            }
            const ed = instantiationService.createInstance(MyEditor, 'my.editor');
            const inp = instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, uri_1.URI.parse('my://resource-delegate'), 'name', 'description', undefined);
            const delegate = instantiationService.createInstance(editorService_1.DelegatingEditorService, async (group, delegate) => {
                assert.ok(group);
                done();
                return ed;
            });
            delegate.openEditor(inp);
        });
        test('close editor does not dispose when editor opened in other group', async () => {
            const [part, service] = await createEditorService();
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-close1'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            const rightGroup = part.addGroup(rootGroup, 3 /* RIGHT */);
            // Open input
            await service.openEditor(input, { pinned: true });
            await service.openEditor(input, { pinned: true }, rightGroup);
            const editors = service.editors;
            assert.strictEqual(editors.length, 2);
            assert.strictEqual(editors[0], input);
            assert.strictEqual(editors[1], input);
            // Close input
            await rootGroup.closeEditor(input);
            assert.strictEqual(input.isDisposed(), false);
            await rightGroup.closeEditor(input);
            assert.strictEqual(input.isDisposed(), true);
        });
        test('open to the side', async () => {
            const [part, service] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1-openside'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-openside'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true }, rootGroup);
            let editor = await service.openEditor(input1, { pinned: true, preserveFocus: true }, editorService_2.SIDE_GROUP);
            assert.strictEqual(part.activeGroup, rootGroup);
            assert.strictEqual(part.count, 2);
            assert.strictEqual(editor === null || editor === void 0 ? void 0 : editor.group, part.groups[1]);
            // Open to the side uses existing neighbour group if any
            editor = await service.openEditor(input2, { pinned: true, preserveFocus: true }, editorService_2.SIDE_GROUP);
            assert.strictEqual(part.activeGroup, rootGroup);
            assert.strictEqual(part.count, 2);
            assert.strictEqual(editor === null || editor === void 0 ? void 0 : editor.group, part.groups[1]);
        });
        test('editor group activation', async () => {
            const [part, service] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1-openside'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-openside'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true }, rootGroup);
            let editor = await service.openEditor(input2, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.ACTIVATE }, editorService_2.SIDE_GROUP);
            const sideGroup = editor === null || editor === void 0 ? void 0 : editor.group;
            assert.strictEqual(part.activeGroup, sideGroup);
            editor = await service.openEditor(input1, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.PRESERVE }, rootGroup);
            assert.strictEqual(part.activeGroup, sideGroup);
            editor = await service.openEditor(input1, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.ACTIVATE }, rootGroup);
            assert.strictEqual(part.activeGroup, rootGroup);
            editor = await service.openEditor(input2, { pinned: true, activation: editor_1.EditorActivation.PRESERVE }, sideGroup);
            assert.strictEqual(part.activeGroup, rootGroup);
            editor = await service.openEditor(input2, { pinned: true, activation: editor_1.EditorActivation.ACTIVATE }, sideGroup);
            assert.strictEqual(part.activeGroup, sideGroup);
            part.arrangeGroups(0 /* MINIMIZE_OTHERS */);
            editor = await service.openEditor(input1, { pinned: true, preserveFocus: true, activation: editor_1.EditorActivation.RESTORE }, rootGroup);
            assert.strictEqual(part.activeGroup, sideGroup);
        });
        test('inactive editor group does not activate when closing editor (#117686)', async () => {
            var _a;
            const [part, service] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1-openside'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-openside'), TEST_EDITOR_INPUT_ID);
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true }, rootGroup);
            await service.openEditor(input2, { pinned: true }, rootGroup);
            const sideGroup = (_a = (await service.openEditor(input2, { pinned: true }, editorService_2.SIDE_GROUP))) === null || _a === void 0 ? void 0 : _a.group;
            assert.strictEqual(part.activeGroup, sideGroup);
            assert.notStrictEqual(rootGroup, sideGroup);
            part.arrangeGroups(0 /* MINIMIZE_OTHERS */, part.activeGroup);
            await rootGroup.closeEditor(input2);
            assert.strictEqual(part.activeGroup, sideGroup);
            assert.strictEqual(rootGroup.isMinimized, true);
            assert.strictEqual(part.activeGroup.isMinimized, false);
        });
        test('active editor change / visible editor change events', async function () {
            const [part, service] = await createEditorService();
            let input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            let otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            let activeEditorChangeEventFired = false;
            const activeEditorChangeListener = service.onDidActiveEditorChange(() => {
                activeEditorChangeEventFired = true;
            });
            let visibleEditorChangeEventFired = false;
            const visibleEditorChangeListener = service.onDidVisibleEditorsChange(() => {
                visibleEditorChangeEventFired = true;
            });
            function assertActiveEditorChangedEvent(expected) {
                assert.strictEqual(activeEditorChangeEventFired, expected, `Unexpected active editor change state (got ${activeEditorChangeEventFired}, expected ${expected})`);
                activeEditorChangeEventFired = false;
            }
            function assertVisibleEditorsChangedEvent(expected) {
                assert.strictEqual(visibleEditorChangeEventFired, expected, `Unexpected visible editors change state (got ${visibleEditorChangeEventFired}, expected ${expected})`);
                visibleEditorChangeEventFired = false;
            }
            async function closeEditorAndWaitForNextToOpen(group, input) {
                await group.closeEditor(input);
                await (0, async_1.timeout)(0); // closing an editor will not immediately open the next one, so we need to wait
            }
            // 1.) open, open same, open other, close
            let editor = await service.openEditor(input, { pinned: true });
            const group = editor === null || editor === void 0 ? void 0 : editor.group;
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(input);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            editor = await service.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(group, otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(group, input);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 2.) open, open same (forced open) (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(input, { forceReload: true });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await closeEditorAndWaitForNextToOpen(group, input);
            // 3.) open, open inactive, close (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(otherInput, { inactive: true });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 4.) open, open inactive, close inactive (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(otherInput, { inactive: true });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await closeEditorAndWaitForNextToOpen(group, otherInput);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 5.) add group, remove group (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            let rightGroup = part.addGroup(part.activeGroup, 3 /* RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            rightGroup.focus();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(false);
            part.removeGroup(rightGroup);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 6.) open editor in inactive group (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            rightGroup = part.addGroup(part.activeGroup, 3 /* RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await rightGroup.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(rightGroup, otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 7.) activate group (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            rightGroup = part.addGroup(part.activeGroup, 3 /* RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await rightGroup.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            group.focus();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(false);
            await closeEditorAndWaitForNextToOpen(rightGroup, otherInput);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(true);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 8.) move editor (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            editor = await service.openEditor(otherInput, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            group.moveEditor(otherInput, group, { index: 0 });
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await group.closeAllEditors();
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            // 9.) close editor in inactive group (recreate inputs that got disposed)
            input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-active'), TEST_EDITOR_INPUT_ID);
            editor = await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            rightGroup = part.addGroup(part.activeGroup, 3 /* RIGHT */);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(false);
            await rightGroup.openEditor(otherInput);
            assertActiveEditorChangedEvent(true);
            assertVisibleEditorsChangedEvent(true);
            await closeEditorAndWaitForNextToOpen(group, input);
            assertActiveEditorChangedEvent(false);
            assertVisibleEditorsChangedEvent(true);
            // cleanup
            activeEditorChangeListener.dispose();
            visibleEditorChangeListener.dispose();
        });
        test('two active editor change events when opening editor to the side', async function () {
            const [, service] = await createEditorService();
            let input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            let activeEditorChangeEvents = 0;
            const activeEditorChangeListener = service.onDidActiveEditorChange(() => {
                activeEditorChangeEvents++;
            });
            function assertActiveEditorChangedEvent(expected) {
                assert.strictEqual(activeEditorChangeEvents, expected, `Unexpected active editor change state (got ${activeEditorChangeEvents}, expected ${expected})`);
                activeEditorChangeEvents = 0;
            }
            await service.openEditor(input, { pinned: true });
            assertActiveEditorChangedEvent(1);
            await service.openEditor(input, { pinned: true }, editorService_2.SIDE_GROUP);
            // we expect 2 active editor change events: one for the fact that the
            // active editor is now in the side group but also one for when the
            // editor has finished loading. we used to ignore that second change
            // event, however many listeners are interested on the active editor
            // when it has fully loaded (e.g. a model is set). as such, we cannot
            // simply ignore that second event from the editor service, even though
            // the actual editor input is the same
            assertActiveEditorChangedEvent(2);
            // cleanup
            activeEditorChangeListener.dispose();
        });
        test('activeTextEditorControl / activeTextEditorMode', async () => {
            const [, service] = await createEditorService();
            // Open untitled input
            let editor = await service.openEditor({});
            assert.strictEqual(service.activeEditorPane, editor);
            assert.strictEqual(service.activeTextEditorControl, editor === null || editor === void 0 ? void 0 : editor.getControl());
            assert.strictEqual(service.activeTextEditorMode, 'plaintext');
        });
        test('openEditor returns NULL when opening fails or is inactive', async function () {
            const [, service] = await createEditorService();
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-active'), TEST_EDITOR_INPUT_ID);
            const otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-inactive'), TEST_EDITOR_INPUT_ID);
            const failingInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource3-failing'), TEST_EDITOR_INPUT_ID);
            failingInput.setFailToOpen();
            let editor = await service.openEditor(input, { pinned: true });
            assert.ok(editor);
            let otherEditor = await service.openEditor(otherInput, { inactive: true });
            assert.ok(!otherEditor);
            let failingEditor = await service.openEditor(failingInput);
            assert.ok(!failingEditor);
        });
        test('save, saveAll, revertAll', async function () {
            const [part, service] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input2.dirty = true;
            const sameInput1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            sameInput1.dirty = true;
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true });
            await service.openEditor(input2, { pinned: true });
            await service.openEditor(sameInput1, { pinned: true }, editorService_2.SIDE_GROUP);
            await service.save({ groupId: rootGroup.id, editor: input1 });
            assert.strictEqual(input1.gotSaved, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            await service.save({ groupId: rootGroup.id, editor: input1 }, { saveAs: true });
            assert.strictEqual(input1.gotSavedAs, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            const revertRes = await service.revertAll();
            assert.strictEqual(revertRes, true);
            assert.strictEqual(input1.gotReverted, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            const saveRes = await service.saveAll();
            assert.strictEqual(saveRes, true);
            assert.strictEqual(input1.gotSaved, true);
            assert.strictEqual(input2.gotSaved, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            input2.gotSaved = false;
            input2.gotSavedAs = false;
            input2.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            await service.saveAll({ saveAs: true });
            assert.strictEqual(input1.gotSavedAs, true);
            assert.strictEqual(input2.gotSavedAs, true);
            // services dedupes inputs automatically
            assert.strictEqual(sameInput1.gotSaved, false);
            assert.strictEqual(sameInput1.gotSavedAs, false);
            assert.strictEqual(sameInput1.gotReverted, false);
        });
        test('saveAll, revertAll (sticky editor)', async function () {
            const [, service] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = true;
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input2.dirty = true;
            const sameInput1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            sameInput1.dirty = true;
            await service.openEditor(input1, { pinned: true, sticky: true });
            await service.openEditor(input2, { pinned: true });
            await service.openEditor(sameInput1, { pinned: true }, editorService_2.SIDE_GROUP);
            const revertRes = await service.revertAll({ excludeSticky: true });
            assert.strictEqual(revertRes, true);
            assert.strictEqual(input1.gotReverted, false);
            assert.strictEqual(sameInput1.gotReverted, true);
            input1.gotSaved = false;
            input1.gotSavedAs = false;
            input1.gotReverted = false;
            sameInput1.gotSaved = false;
            sameInput1.gotSavedAs = false;
            sameInput1.gotReverted = false;
            input1.dirty = true;
            input2.dirty = true;
            sameInput1.dirty = true;
            const saveRes = await service.saveAll({ excludeSticky: true });
            assert.strictEqual(saveRes, true);
            assert.strictEqual(input1.gotSaved, false);
            assert.strictEqual(input2.gotSaved, true);
            assert.strictEqual(sameInput1.gotSaved, true);
        });
        test('file delete closes editor', async function () {
            return testFileDeleteEditorClose(false);
        });
        test('file delete leaves dirty editors open', function () {
            return testFileDeleteEditorClose(true);
        });
        async function testFileDeleteEditorClose(dirty) {
            const [part, service, accessor] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            input1.dirty = dirty;
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input2.dirty = dirty;
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true });
            await service.openEditor(input2, { pinned: true });
            assert.strictEqual(rootGroup.activeEditor, input2);
            const activeEditorChangePromise = awaitActiveEditorChange(service);
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(input2.resource, 1 /* DELETE */));
            if (!dirty) {
                await activeEditorChangePromise;
            }
            if (dirty) {
                assert.strictEqual(rootGroup.activeEditor, input2);
            }
            else {
                assert.strictEqual(rootGroup.activeEditor, input1);
            }
        }
        test('file move asks input to move', async function () {
            const [part, service, accessor] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource1'), TEST_EDITOR_INPUT_ID);
            const movedInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2'), TEST_EDITOR_INPUT_ID);
            input1.movedEditor = { editor: movedInput };
            const rootGroup = part.activeGroup;
            await service.openEditor(input1, { pinned: true });
            const activeEditorChangePromise = awaitActiveEditorChange(service);
            accessor.fileService.fireAfterOperation(new files_1.FileOperationEvent(input1.resource, 2 /* MOVE */, {
                resource: movedInput.resource,
                ctime: 0,
                etag: '',
                isDirectory: false,
                isFile: true,
                mtime: 0,
                name: 'resource2',
                size: 0,
                isSymbolicLink: false
            }));
            await activeEditorChangePromise;
            assert.strictEqual(rootGroup.activeEditor, movedInput);
        });
        function awaitActiveEditorChange(editorService) {
            return event_1.Event.toPromise(event_1.Event.once(editorService.onDidActiveEditorChange));
        }
        test('file watcher gets installed for out of workspace files', async function () {
            var _a;
            const [, service, accessor] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('file://resource1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('file://resource2'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input1, { pinned: true });
            assert.strictEqual(accessor.fileService.watches.length, 1);
            assert.strictEqual(accessor.fileService.watches[0].toString(), input1.resource.toString());
            const editor = await service.openEditor(input2, { pinned: true });
            assert.strictEqual(accessor.fileService.watches.length, 1);
            assert.strictEqual(accessor.fileService.watches[0].toString(), input2.resource.toString());
            await ((_a = editor === null || editor === void 0 ? void 0 : editor.group) === null || _a === void 0 ? void 0 : _a.closeAllEditors());
            assert.strictEqual(accessor.fileService.watches.length, 0);
        });
        test('activeEditorPane scopedContextKeyService', async function () {
            var _a, _b;
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({ contextKeyService: instantiationService => instantiationService.createInstance(mockKeybindingService_1.MockScopableContextKeyService) });
            const [part, service] = await createEditorService(instantiationService);
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('file://resource1'), TEST_EDITOR_INPUT_ID);
            new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('file://resource2'), TEST_EDITOR_INPUT_ID);
            await service.openEditor(input1, { pinned: true });
            const editorContextKeyService = (_a = service.activeEditorPane) === null || _a === void 0 ? void 0 : _a.scopedContextKeyService;
            assert.ok(!!editorContextKeyService);
            assert.strictEqual(editorContextKeyService, (_b = part.activeGroup.activeEditorPane) === null || _b === void 0 ? void 0 : _b.scopedContextKeyService);
        });
        test('overrideOpenEditor', async function () {
            const [, service] = await createEditorService();
            const input1 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('file://resource1'), TEST_EDITOR_INPUT_ID);
            const input2 = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('file://resource2'), TEST_EDITOR_INPUT_ID);
            let overrideCalled = false;
            const handler = service.overrideOpenEditor({
                open: editor => {
                    if (editor === input1) {
                        overrideCalled = true;
                        return { override: service.openEditor(input2, { pinned: true }) };
                    }
                    return undefined;
                }
            });
            await service.openEditor(input1, { pinned: true });
            assert.ok(overrideCalled);
            assert.strictEqual(service.activeEditor, input2);
            handler.dispose();
        });
        test('findEditors (in group)', async () => {
            const [part, service] = await createEditorService();
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            assert.strictEqual(part.activeGroup.count, 2);
            // Try using find editors for opened editors
            {
                const found1 = service.findEditors(input.resource, part.activeGroup);
                assert.strictEqual(found1.length, 1);
                assert.strictEqual(found1[0], input);
                const found2 = service.findEditors(input, part.activeGroup);
                assert.strictEqual(found2, input);
            }
            {
                const found1 = service.findEditors(otherInput.resource, part.activeGroup);
                assert.strictEqual(found1.length, 1);
                assert.strictEqual(found1[0], otherInput);
                const found2 = service.findEditors(otherInput, part.activeGroup);
                assert.strictEqual(found2, otherInput);
            }
            // Make sure we don't find non-opened editors
            {
                const found1 = service.findEditors(uri_1.URI.parse('my://no-such-resource'), part.activeGroup);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors({ resource: uri_1.URI.parse('my://no-such-resource'), typeId: '' }, part.activeGroup);
                assert.strictEqual(found2, undefined);
            }
            // Make sure we don't find editors across groups
            {
                const newEditor = await service.openEditor(new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://other-group-resource'), TEST_EDITOR_INPUT_ID), { pinned: true, preserveFocus: true }, editorService_2.SIDE_GROUP);
                const found1 = service.findEditors(input.resource, newEditor.group.id);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors(input, newEditor.group.id);
                assert.strictEqual(found2, undefined);
            }
            // Check we don't find editors after closing them
            await part.activeGroup.closeAllEditors();
            {
                const found1 = service.findEditors(input.resource, part.activeGroup);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors(input, part.activeGroup);
                assert.strictEqual(found2, undefined);
            }
        });
        test('findEditors (across groups)', async () => {
            var _a, _b, _c;
            const [part, service] = await createEditorService();
            const rootGroup = part.activeGroup;
            const input = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource-openEditors'), TEST_EDITOR_INPUT_ID);
            const otherInput = new workbenchTestServices_1.TestFileEditorInput(uri_1.URI.parse('my://resource2-openEditors'), TEST_EDITOR_INPUT_ID);
            // Open editors
            await service.openEditors([{ editor: input }, { editor: otherInput }]);
            const sideEditor = await service.openEditor(input, { pinned: true }, editorService_2.SIDE_GROUP);
            // Try using find editors for opened editors
            {
                const found1 = service.findEditors(input.resource);
                assert.strictEqual(found1.length, 2);
                assert.strictEqual(found1[0].editor, input);
                assert.strictEqual(found1[0].groupId, (_a = sideEditor === null || sideEditor === void 0 ? void 0 : sideEditor.group) === null || _a === void 0 ? void 0 : _a.id);
                assert.strictEqual(found1[1].editor, input);
                assert.strictEqual(found1[1].groupId, rootGroup.id);
                const found2 = service.findEditors(input);
                assert.strictEqual(found2.length, 2);
                assert.strictEqual(found2[0].editor, input);
                assert.strictEqual(found2[0].groupId, (_b = sideEditor === null || sideEditor === void 0 ? void 0 : sideEditor.group) === null || _b === void 0 ? void 0 : _b.id);
                assert.strictEqual(found2[1].editor, input);
                assert.strictEqual(found2[1].groupId, rootGroup.id);
            }
            {
                const found1 = service.findEditors(otherInput.resource);
                assert.strictEqual(found1.length, 1);
                assert.strictEqual(found1[0].editor, otherInput);
                assert.strictEqual(found1[0].groupId, rootGroup.id);
                const found2 = service.findEditors(otherInput);
                assert.strictEqual(found2.length, 1);
                assert.strictEqual(found2[0].editor, otherInput);
                assert.strictEqual(found2[0].groupId, rootGroup.id);
            }
            // Make sure we don't find non-opened editors
            {
                const found1 = service.findEditors(uri_1.URI.parse('my://no-such-resource'));
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors({ resource: uri_1.URI.parse('my://no-such-resource'), typeId: '' });
                assert.strictEqual(found2.length, 0);
            }
            // Check we don't find editors after closing them
            await rootGroup.closeAllEditors();
            await ((_c = sideEditor === null || sideEditor === void 0 ? void 0 : sideEditor.group) === null || _c === void 0 ? void 0 : _c.closeAllEditors());
            {
                const found1 = service.findEditors(input.resource);
                assert.strictEqual(found1.length, 0);
                const found2 = service.findEditors(input);
                assert.strictEqual(found2.length, 0);
            }
        });
    });
});
//# sourceMappingURL=editorService.test.js.map