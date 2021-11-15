/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/test/browser/workbenchTestServices"], function (require, exports, assert, editor_1, diffEditorInput_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench editor input', () => {
        class MyEditorInput extends editor_1.EditorInput {
            constructor() {
                super(...arguments);
                this.resource = undefined;
            }
            get typeId() { return 'myEditorInput'; }
            resolve() { return null; }
        }
        test('EditorInput', () => {
            let counter = 0;
            let input = new MyEditorInput();
            let otherInput = new MyEditorInput();
            assert(input.matches(input));
            assert(!input.matches(otherInput));
            assert(!input.matches(null));
            assert(input.getName());
            input.onWillDispose(() => {
                assert(true);
                counter++;
            });
            input.dispose();
            assert.strictEqual(counter, 1);
        });
        test('DiffEditorInput', () => {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            let counter = 0;
            let input = new MyEditorInput();
            input.onWillDispose(() => {
                assert(true);
                counter++;
            });
            let otherInput = new MyEditorInput();
            otherInput.onWillDispose(() => {
                assert(true);
                counter++;
            });
            let diffInput = instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', input, otherInput, undefined);
            assert.strictEqual(diffInput.originalInput, input);
            assert.strictEqual(diffInput.modifiedInput, otherInput);
            assert(diffInput.matches(diffInput));
            assert(!diffInput.matches(otherInput));
            assert(!diffInput.matches(null));
            diffInput.dispose();
            assert.strictEqual(counter, 0);
        });
        test('DiffEditorInput disposes when input inside disposes', function () {
            const instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            let counter = 0;
            let input = new MyEditorInput();
            let otherInput = new MyEditorInput();
            let diffInput = instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', input, otherInput, undefined);
            diffInput.onWillDispose(() => {
                counter++;
                assert(true);
            });
            input.dispose();
            input = new MyEditorInput();
            otherInput = new MyEditorInput();
            let diffInput2 = instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, 'name', 'description', input, otherInput, undefined);
            diffInput2.onWillDispose(() => {
                counter++;
                assert(true);
            });
            otherInput.dispose();
            assert.strictEqual(counter, 2);
        });
    });
});
//# sourceMappingURL=editorInput.test.js.map