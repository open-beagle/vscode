/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/utils", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/common/editor", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/base/common/async", "vs/editor/common/modes/modesRegistry", "vs/base/common/lifecycle", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/registry/common/platform", "vs/workbench/contrib/files/browser/files"], function (require, exports, assert, uri_1, utils_1, fileEditorInput_1, workbenchTestServices_1, editor_1, textfiles_1, files_1, textFileEditorModel_1, async_1, modesRegistry_1, lifecycle_1, binaryEditorModel_1, platform_1, files_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files - FileEditorInput', () => {
        let instantiationService;
        let accessor;
        function createFileInput(resource, preferredResource, preferredMode, preferredName, preferredDescription) {
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, preferredResource, preferredName, preferredDescription, undefined, preferredMode);
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({
                editorService: () => {
                    return new class extends workbenchTestServices_1.TestEditorService {
                        createEditorInput(input) {
                            return createFileInput(input.resource);
                        }
                    };
                }
            });
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
        });
        test('Basics', async function () {
            let input = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            const otherInput = createFileInput(utils_1.toResource.call(this, 'foo/bar/otherfile.js'));
            const otherInputSame = createFileInput(utils_1.toResource.call(this, 'foo/bar/file.js'));
            assert(input.matches(input));
            assert(input.matches(otherInputSame));
            assert(!input.matches(otherInput));
            assert(!input.matches(null));
            assert.ok(input.getName());
            assert.ok(input.getDescription());
            assert.ok(input.getTitle(0 /* SHORT */));
            assert.strictEqual('file.js', input.getName());
            assert.strictEqual(utils_1.toResource.call(this, '/foo/bar/file.js').fsPath, input.resource.fsPath);
            assert(input.resource instanceof uri_1.URI);
            input = createFileInput(utils_1.toResource.call(this, '/foo/bar.html'));
            const inputToResolve = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            const sameOtherInput = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            let resolved = await inputToResolve.resolve();
            assert.ok(inputToResolve.isResolved());
            const resolvedModelA = resolved;
            resolved = await inputToResolve.resolve();
            assert(resolvedModelA === resolved); // OK: Resolved Model cached globally per input
            try {
                lifecycle_1.DisposableStore.DISABLE_DISPOSED_WARNING = true; // prevent unwanted warning output from occuring
                const otherResolved = await sameOtherInput.resolve();
                assert(otherResolved === resolvedModelA); // OK: Resolved Model cached globally per input
                inputToResolve.dispose();
                resolved = await inputToResolve.resolve();
                assert(resolvedModelA === resolved); // Model is still the same because we had 2 clients
                inputToResolve.dispose();
                sameOtherInput.dispose();
                resolvedModelA.dispose();
                resolved = await inputToResolve.resolve();
                assert(resolvedModelA !== resolved); // Different instance, because input got disposed
                const stat = (0, workbenchTestServices_1.getLastResolvedFileStat)(resolved);
                resolved = await inputToResolve.resolve();
                await (0, async_1.timeout)(0);
                assert(stat !== (0, workbenchTestServices_1.getLastResolvedFileStat)(resolved)); // Different stat, because resolve always goes to the server for refresh
            }
            finally {
                lifecycle_1.DisposableStore.DISABLE_DISPOSED_WARNING = false;
            }
        });
        test('preferred resource', function () {
            const resource = utils_1.toResource.call(this, '/foo/bar/updatefile.js');
            const preferredResource = utils_1.toResource.call(this, '/foo/bar/UPDATEFILE.js');
            const inputWithoutPreferredResource = createFileInput(resource);
            assert.strictEqual(inputWithoutPreferredResource.resource.toString(), resource.toString());
            assert.strictEqual(inputWithoutPreferredResource.preferredResource.toString(), resource.toString());
            const inputWithPreferredResource = createFileInput(resource, preferredResource);
            assert.strictEqual(inputWithPreferredResource.resource.toString(), resource.toString());
            assert.strictEqual(inputWithPreferredResource.preferredResource.toString(), preferredResource.toString());
            let didChangeLabel = false;
            const listener = inputWithPreferredResource.onDidChangeLabel(e => {
                didChangeLabel = true;
            });
            assert.strictEqual(inputWithPreferredResource.getName(), 'UPDATEFILE.js');
            const otherPreferredResource = utils_1.toResource.call(this, '/FOO/BAR/updateFILE.js');
            inputWithPreferredResource.setPreferredResource(otherPreferredResource);
            assert.strictEqual(inputWithPreferredResource.resource.toString(), resource.toString());
            assert.strictEqual(inputWithPreferredResource.preferredResource.toString(), otherPreferredResource.toString());
            assert.strictEqual(inputWithPreferredResource.getName(), 'updateFILE.js');
            assert.strictEqual(didChangeLabel, true);
            listener.dispose();
        });
        test('preferred mode', async function () {
            const mode = 'file-input-test';
            modesRegistry_1.ModesRegistry.registerLanguage({
                id: mode,
            });
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'), undefined, mode);
            assert.strictEqual(input.getPreferredMode(), mode);
            const model = await input.resolve();
            assert.strictEqual(model.textEditorModel.getModeId(), mode);
            input.setMode('text');
            assert.strictEqual(input.getPreferredMode(), 'text');
            assert.strictEqual(model.textEditorModel.getModeId(), modesRegistry_1.PLAINTEXT_MODE_ID);
            const input2 = createFileInput(utils_1.toResource.call(this, '/foo/bar/file.js'));
            input2.setPreferredMode(mode);
            const model2 = await input2.resolve();
            assert.strictEqual(model2.textEditorModel.getModeId(), mode);
        });
        test('matches', function () {
            const input1 = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const input2 = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const input3 = createFileInput(utils_1.toResource.call(this, '/foo/bar/other.js'));
            const input2Upper = createFileInput(utils_1.toResource.call(this, '/foo/bar/UPDATEFILE.js'));
            assert.strictEqual(input1.matches(null), false);
            assert.strictEqual(input1.matches(input1), true);
            assert.strictEqual(input1.matches(input2), true);
            assert.strictEqual(input1.matches(input3), false);
            assert.strictEqual(input1.matches(input2Upper), false);
        });
        test('getEncoding/setEncoding', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            await input.setEncoding('utf16', 0 /* Encode */);
            assert.strictEqual(input.getEncoding(), 'utf16');
            const resolved = await input.resolve();
            assert.strictEqual(input.getEncoding(), resolved.getEncoding());
            resolved.dispose();
        });
        test('save', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const resolved = await input.resolve();
            resolved.textEditorModel.setValue('changed');
            assert.ok(input.isDirty());
            await input.save(0);
            assert.ok(!input.isDirty());
            resolved.dispose();
        });
        test('revert', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const resolved = await input.resolve();
            resolved.textEditorModel.setValue('changed');
            assert.ok(input.isDirty());
            await input.revert(0);
            assert.ok(!input.isDirty());
            input.dispose();
            assert.ok(input.isDisposed());
            resolved.dispose();
        });
        test('resolve handles binary files', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            accessor.textFileService.setReadStreamErrorOnce(new textfiles_1.TextFileOperationError('error', 0 /* FILE_IS_BINARY */));
            const resolved = await input.resolve();
            assert.ok(resolved);
            resolved.dispose();
        });
        test('resolve handles too large files', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            accessor.textFileService.setReadStreamErrorOnce(new files_1.FileOperationError('error', 7 /* FILE_TOO_LARGE */));
            const resolved = await input.resolve();
            assert.ok(resolved);
            resolved.dispose();
        });
        test('attaches to model when created and reports dirty', async function () {
            var _a;
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            let listenerCount = 0;
            const listener = input.onDidChangeDirty(() => {
                listenerCount++;
            });
            // instead of going through file input resolve method
            // we resolve the model directly through the service
            const model = await accessor.textFileService.files.resolve(input.resource);
            (_a = model.textEditorModel) === null || _a === void 0 ? void 0 : _a.setValue('hello world');
            assert.strictEqual(listenerCount, 1);
            assert.ok(input.isDirty());
            input.dispose();
            listener.dispose();
        });
        test('force open text/binary', async function () {
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            input.setForceOpenAsBinary();
            let resolved = await input.resolve();
            assert.ok(resolved instanceof binaryEditorModel_1.BinaryEditorModel);
            input.setForceOpenAsText();
            resolved = await input.resolve();
            assert.ok(resolved instanceof textFileEditorModel_1.TextFileEditorModel);
            resolved.dispose();
        });
        test('file editor input serializer', async function () {
            instantiationService.invokeFunction(accessor => platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).start(accessor));
            const input = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'));
            const disposable = platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).registerEditorInputSerializer('workbench.editors.files.fileEditorInput', files_2.FileEditorInputSerializer);
            const editorSerializer = platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).getEditorInputSerializer(input.typeId);
            if (!editorSerializer) {
                assert.fail('File Editor Input Serializer missing');
            }
            assert.strictEqual(editorSerializer.canSerialize(input), true);
            const inputSerialized = editorSerializer.serialize(input);
            if (!inputSerialized) {
                assert.fail('Unexpected serialized file input');
            }
            const inputDeserialized = editorSerializer.deserialize(instantiationService, inputSerialized);
            assert.strictEqual(input.matches(inputDeserialized), true);
            const preferredResource = utils_1.toResource.call(this, '/foo/bar/UPDATEfile.js');
            const inputWithPreferredResource = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'), preferredResource);
            const inputWithPreferredResourceSerialized = editorSerializer.serialize(inputWithPreferredResource);
            if (!inputWithPreferredResourceSerialized) {
                assert.fail('Unexpected serialized file input');
            }
            const inputWithPreferredResourceDeserialized = editorSerializer.deserialize(instantiationService, inputWithPreferredResourceSerialized);
            assert.strictEqual(inputWithPreferredResource.resource.toString(), inputWithPreferredResourceDeserialized.resource.toString());
            assert.strictEqual(inputWithPreferredResource.preferredResource.toString(), inputWithPreferredResourceDeserialized.preferredResource.toString());
            disposable.dispose();
        });
        test('preferred name/description', async function () {
            // Works with custom file input
            const customFileInput = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js').with({ scheme: 'test-custom' }), undefined, undefined, 'My Name', 'My Description');
            let didChangeLabelCounter = 0;
            customFileInput.onDidChangeLabel(() => {
                didChangeLabelCounter++;
            });
            assert.strictEqual(customFileInput.getName(), 'My Name');
            assert.strictEqual(customFileInput.getDescription(), 'My Description');
            customFileInput.setPreferredName('My Name 2');
            customFileInput.setPreferredDescription('My Description 2');
            assert.strictEqual(customFileInput.getName(), 'My Name 2');
            assert.strictEqual(customFileInput.getDescription(), 'My Description 2');
            assert.strictEqual(didChangeLabelCounter, 2);
            customFileInput.dispose();
            // Disallowed with local file input
            const fileInput = createFileInput(utils_1.toResource.call(this, '/foo/bar/updatefile.js'), undefined, undefined, 'My Name', 'My Description');
            didChangeLabelCounter = 0;
            fileInput.onDidChangeLabel(() => {
                didChangeLabelCounter++;
            });
            assert.notStrictEqual(fileInput.getName(), 'My Name');
            assert.notStrictEqual(fileInput.getDescription(), 'My Description');
            fileInput.setPreferredName('My Name 2');
            fileInput.setPreferredDescription('My Description 2');
            assert.notStrictEqual(fileInput.getName(), 'My Name 2');
            assert.notStrictEqual(fileInput.getDescription(), 'My Description 2');
            assert.strictEqual(didChangeLabelCounter, 0);
            fileInput.dispose();
        });
    });
});
//# sourceMappingURL=fileEditorInput.test.js.map