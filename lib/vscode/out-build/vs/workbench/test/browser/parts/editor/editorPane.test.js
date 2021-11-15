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
define(["require", "exports", "assert", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor/resourceEditorInput", "vs/platform/theme/test/common/testThemeService", "vs/base/common/uri", "vs/workbench/browser/editor", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/resources"], function (require, exports, assert, editorPane_1, editor_1, platform_1, descriptors_1, telemetry_1, telemetryUtils_1, workbenchTestServices_1, resourceEditorInput_1, testThemeService_1, uri_1, editor_2, cancellation_1, lifecycle_1, workbenchTestServices_2, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OtherTestEditor = void 0;
    const NullThemeService = new testThemeService_1.TestThemeService();
    let EditorRegistry = platform_1.Registry.as(editor_1.EditorExtensions.Editors);
    let EditorInputRegistry = platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories);
    let TestEditor = class TestEditor extends editorPane_1.EditorPane {
        constructor(telemetryService) {
            super('TestEditor', telemetryUtils_1.NullTelemetryService, NullThemeService, new workbenchTestServices_2.TestStorageService());
        }
        getId() { return 'testEditor'; }
        layout() { }
        createEditor() { }
    };
    TestEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService)
    ], TestEditor);
    let OtherTestEditor = class OtherTestEditor extends editorPane_1.EditorPane {
        constructor(telemetryService) {
            super('testOtherEditor', telemetryUtils_1.NullTelemetryService, NullThemeService, new workbenchTestServices_2.TestStorageService());
        }
        getId() { return 'testOtherEditor'; }
        layout() { }
        createEditor() { }
    };
    OtherTestEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService)
    ], OtherTestEditor);
    exports.OtherTestEditor = OtherTestEditor;
    class TestInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(input) {
            return input.toString();
        }
        deserialize(instantiationService, raw) {
            return {};
        }
    }
    class TestInput extends editor_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = undefined;
        }
        getPreferredEditorId(ids) {
            return ids[1];
        }
        get typeId() {
            return 'testInput';
        }
        resolve() {
            return null;
        }
    }
    class OtherTestInput extends editor_1.EditorInput {
        constructor() {
            super(...arguments);
            this.resource = undefined;
        }
        get typeId() {
            return 'otherTestInput';
        }
        resolve() {
            return null;
        }
    }
    class TestResourceEditorInput extends resourceEditorInput_1.ResourceEditorInput {
    }
    suite('Workbench EditorPane', () => {
        test('EditorPane API', async () => {
            let e = new TestEditor(telemetryUtils_1.NullTelemetryService);
            let input = new OtherTestInput();
            let options = new editor_1.EditorOptions();
            assert(!e.isVisible());
            assert(!e.input);
            await e.setInput(input, options, Object.create(null), cancellation_1.CancellationToken.None);
            assert.strictEqual(input, e.input);
            const group = new workbenchTestServices_1.TestEditorGroupView(1);
            e.setVisible(true, group);
            assert(e.isVisible());
            assert.strictEqual(e.group, group);
            input.onWillDispose(() => {
                assert(false);
            });
            e.dispose();
            e.clearInput();
            e.setVisible(false, group);
            assert(!e.isVisible());
            assert(!e.input);
            assert(!e.getControl());
        });
        test('EditorDescriptor', () => {
            let d = editor_2.EditorDescriptor.create(TestEditor, 'id', 'name');
            assert.strictEqual(d.getId(), 'id');
            assert.strictEqual(d.getName(), 'name');
        });
        test('Editor Registration', function () {
            let d1 = editor_2.EditorDescriptor.create(TestEditor, 'id1', 'name');
            let d2 = editor_2.EditorDescriptor.create(OtherTestEditor, 'id2', 'name');
            let oldEditorsCnt = EditorRegistry.getEditors().length;
            let oldInputCnt = EditorRegistry.getEditorInputs().length;
            const dispose1 = EditorRegistry.registerEditor(d1, [new descriptors_1.SyncDescriptor(TestInput)]);
            const dispose2 = EditorRegistry.registerEditor(d2, [new descriptors_1.SyncDescriptor(TestInput), new descriptors_1.SyncDescriptor(OtherTestInput)]);
            assert.strictEqual(EditorRegistry.getEditors().length, oldEditorsCnt + 2);
            assert.strictEqual(EditorRegistry.getEditorInputs().length, oldInputCnt + 3);
            assert.strictEqual(EditorRegistry.getEditor(new TestInput()), d2);
            assert.strictEqual(EditorRegistry.getEditor(new OtherTestInput()), d2);
            assert.strictEqual(EditorRegistry.getEditorById('id1'), d1);
            assert.strictEqual(EditorRegistry.getEditorById('id2'), d2);
            assert(!EditorRegistry.getEditorById('id3'));
            (0, lifecycle_1.dispose)([dispose1, dispose2]);
        });
        test('Editor Lookup favors specific class over superclass (match on specific class)', function () {
            let d1 = editor_2.EditorDescriptor.create(TestEditor, 'id1', 'name');
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            disposables.add(EditorRegistry.registerEditor(d1, [new descriptors_1.SyncDescriptor(TestResourceEditorInput)]));
            let inst = (0, workbenchTestServices_1.workbenchInstantiationService)();
            const editor = EditorRegistry.getEditor(inst.createInstance(TestResourceEditorInput, uri_1.URI.file('/fake'), 'fake', '', undefined)).instantiate(inst);
            assert.strictEqual(editor.getId(), 'testEditor');
            const otherEditor = EditorRegistry.getEditor(inst.createInstance(resourceEditorInput_1.ResourceEditorInput, uri_1.URI.file('/fake'), 'fake', '', undefined)).instantiate(inst);
            assert.strictEqual(otherEditor.getId(), 'workbench.editors.textResourceEditor');
            disposables.dispose();
        });
        test('Editor Lookup favors specific class over superclass (match on super class)', function () {
            let inst = (0, workbenchTestServices_1.workbenchInstantiationService)();
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, workbenchTestServices_1.registerTestResourceEditor)());
            const editor = EditorRegistry.getEditor(inst.createInstance(TestResourceEditorInput, uri_1.URI.file('/fake'), 'fake', '', undefined)).instantiate(inst);
            assert.strictEqual('workbench.editors.textResourceEditor', editor.getId());
            disposables.dispose();
        });
        test('Editor Input Serializer', function () {
            const testInput = new workbenchTestServices_1.TestEditorInput(uri_1.URI.file('/fake'), 'testTypeId');
            (0, workbenchTestServices_1.workbenchInstantiationService)().invokeFunction(accessor => EditorInputRegistry.start(accessor));
            const disposable = EditorInputRegistry.registerEditorInputSerializer(testInput.typeId, TestInputSerializer);
            let factory = EditorInputRegistry.getEditorInputSerializer('testTypeId');
            assert(factory);
            factory = EditorInputRegistry.getEditorInputSerializer(testInput);
            assert(factory);
            // throws when registering serializer for same type
            assert.throws(() => EditorInputRegistry.registerEditorInputSerializer(testInput.typeId, TestInputSerializer));
            disposable.dispose();
        });
        test('EditorMemento - basics', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            const testGroup1 = new workbenchTestServices_1.TestEditorGroupView(1);
            const testGroup4 = new workbenchTestServices_1.TestEditorGroupView(4);
            const editorGroupService = new workbenchTestServices_1.TestEditorGroupsService([
                testGroup0,
                testGroup1,
                new workbenchTestServices_1.TestEditorGroupView(2)
            ]);
            const rawMemento = Object.create(null);
            let memento = new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, editorGroupService);
            let res = memento.loadEditorState(testGroup0, uri_1.URI.file('/A'));
            assert.ok(!res);
            memento.saveEditorState(testGroup0, uri_1.URI.file('/A'), { line: 3 });
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/A'));
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            memento.saveEditorState(testGroup1, uri_1.URI.file('/A'), { line: 5 });
            res = memento.loadEditorState(testGroup1, uri_1.URI.file('/A'));
            assert.ok(res);
            assert.strictEqual(res.line, 5);
            // Ensure capped at 3 elements
            memento.saveEditorState(testGroup0, uri_1.URI.file('/B'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/C'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/D'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/E'), { line: 1 });
            assert.ok(!memento.loadEditorState(testGroup0, uri_1.URI.file('/A')));
            assert.ok(!memento.loadEditorState(testGroup0, uri_1.URI.file('/B')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/C')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/D')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/E')));
            // Save at an unknown group
            memento.saveEditorState(testGroup4, uri_1.URI.file('/E'), { line: 1 });
            assert.ok(memento.loadEditorState(testGroup4, uri_1.URI.file('/E'))); // only gets removed when memento is saved
            memento.saveEditorState(testGroup4, uri_1.URI.file('/C'), { line: 1 });
            assert.ok(memento.loadEditorState(testGroup4, uri_1.URI.file('/C'))); // only gets removed when memento is saved
            memento.saveState();
            memento = new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, editorGroupService);
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/C')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/D')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/E')));
            // Check on entries no longer there from invalid groups
            assert.ok(!memento.loadEditorState(testGroup4, uri_1.URI.file('/E')));
            assert.ok(!memento.loadEditorState(testGroup4, uri_1.URI.file('/C')));
            memento.clearEditorState(uri_1.URI.file('/C'), testGroup4);
            memento.clearEditorState(uri_1.URI.file('/E'));
            assert.ok(!memento.loadEditorState(testGroup4, uri_1.URI.file('/C')));
            assert.ok(memento.loadEditorState(testGroup0, uri_1.URI.file('/D')));
            assert.ok(!memento.loadEditorState(testGroup0, uri_1.URI.file('/E')));
        });
        test('EditorMemento - move', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            const editorGroupService = new workbenchTestServices_1.TestEditorGroupsService([testGroup0]);
            const rawMemento = Object.create(null);
            let memento = new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, editorGroupService);
            memento.saveEditorState(testGroup0, uri_1.URI.file('/some/folder/file-1.txt'), { line: 1 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/some/folder/file-2.txt'), { line: 2 });
            memento.saveEditorState(testGroup0, uri_1.URI.file('/some/other/file.txt'), { line: 3 });
            memento.moveEditorState(uri_1.URI.file('/some/folder/file-1.txt'), uri_1.URI.file('/some/folder/file-moved.txt'), resources_1.extUri);
            let res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder/file-1.txt'));
            assert.ok(!res);
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder/file-moved.txt'));
            assert.strictEqual(res === null || res === void 0 ? void 0 : res.line, 1);
            memento.moveEditorState(uri_1.URI.file('/some/folder'), uri_1.URI.file('/some/folder-moved'), resources_1.extUri);
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder-moved/file-moved.txt'));
            assert.strictEqual(res === null || res === void 0 ? void 0 : res.line, 1);
            res = memento.loadEditorState(testGroup0, uri_1.URI.file('/some/folder-moved/file-2.txt'));
            assert.strictEqual(res === null || res === void 0 ? void 0 : res.line, 2);
        });
        test('EditoMemento - use with editor input', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            class TestEditorInput extends editor_1.EditorInput {
                constructor(resource, id = 'testEditorInputForMementoTest') {
                    super();
                    this.resource = resource;
                    this.id = id;
                }
                get typeId() { return 'testEditorInputForMementoTest'; }
                async resolve() { return null; }
                matches(other) {
                    return other && this.id === other.id && other instanceof TestEditorInput;
                }
            }
            const rawMemento = Object.create(null);
            let memento = new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, new workbenchTestServices_1.TestEditorGroupsService());
            const testInputA = new TestEditorInput(uri_1.URI.file('/A'));
            let res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(!res);
            memento.saveEditorState(testGroup0, testInputA, { line: 3 });
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            // State removed when input gets disposed
            testInputA.dispose();
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(!res);
        });
        test('EditoMemento - clear on editor dispose', function () {
            const testGroup0 = new workbenchTestServices_1.TestEditorGroupView(0);
            class TestEditorInput extends editor_1.EditorInput {
                constructor(resource, id = 'testEditorInputForMementoTest') {
                    super();
                    this.resource = resource;
                    this.id = id;
                }
                get typeId() { return 'testEditorInputForMementoTest'; }
                async resolve() { return null; }
                matches(other) {
                    return other && this.id === other.id && other instanceof TestEditorInput;
                }
            }
            const rawMemento = Object.create(null);
            let memento = new editorPane_1.EditorMemento('id', 'key', rawMemento, 3, new workbenchTestServices_1.TestEditorGroupsService());
            const testInputA = new TestEditorInput(uri_1.URI.file('/A'));
            let res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(!res);
            memento.saveEditorState(testGroup0, testInputA.resource, { line: 3 });
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            // State not yet removed when input gets disposed
            // because we used resource
            testInputA.dispose();
            res = memento.loadEditorState(testGroup0, testInputA);
            assert.ok(res);
            const testInputB = new TestEditorInput(uri_1.URI.file('/B'));
            res = memento.loadEditorState(testGroup0, testInputB);
            assert.ok(!res);
            memento.saveEditorState(testGroup0, testInputB.resource, { line: 3 });
            res = memento.loadEditorState(testGroup0, testInputB);
            assert.ok(res);
            assert.strictEqual(res.line, 3);
            memento.clearEditorStateOnDispose(testInputB.resource, testInputB);
            // State removed when input gets disposed
            testInputB.dispose();
            res = memento.loadEditorState(testGroup0, testInputB);
            assert.ok(!res);
        });
    });
});
//# sourceMappingURL=editorPane.test.js.map