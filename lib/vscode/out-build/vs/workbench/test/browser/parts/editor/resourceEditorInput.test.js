/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/modes/modesRegistry"], function (require, exports, assert, uri_1, resourceEditorInput_1, workbenchTestServices_1, textfiles_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Resource text editors', () => {
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
        });
        test('basics', async () => {
            const resource = uri_1.URI.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.modeService.create('text'), resource);
            const input = instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, resource, 'The Name', 'The Description', undefined);
            const model = await input.resolve();
            assert.ok(model);
            assert.strictEqual((0, textfiles_1.snapshotToString)((model.createSnapshot())), 'function test() {}');
        });
        test('custom mode', async () => {
            var _a, _b;
            modesRegistry_1.ModesRegistry.registerLanguage({
                id: 'resource-input-test',
            });
            const resource = uri_1.URI.from({ scheme: 'inmemory', authority: null, path: 'thePath' });
            accessor.modelService.createModel('function test() {}', accessor.modeService.create('text'), resource);
            const input = instantiationService.createInstance(resourceEditorInput_1.ResourceEditorInput, resource, 'The Name', 'The Description', 'resource-input-test');
            const model = await input.resolve();
            assert.ok(model);
            assert.strictEqual((_a = model.textEditorModel) === null || _a === void 0 ? void 0 : _a.getModeId(), 'resource-input-test');
            input.setMode('text');
            assert.strictEqual((_b = model.textEditorModel) === null || _b === void 0 ? void 0 : _b.getModeId(), modesRegistry_1.PLAINTEXT_MODE_ID);
        });
    });
});
//# sourceMappingURL=resourceEditorInput.test.js.map