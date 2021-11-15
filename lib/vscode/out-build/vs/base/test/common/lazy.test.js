/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lazy"], function (require, exports, assert, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Lazy', () => {
        test('lazy values should only be resolved once', () => {
            let counter = 0;
            const value = new lazy_1.Lazy(() => ++counter);
            assert.strictEqual(value.hasValue(), false);
            assert.strictEqual(value.getValue(), 1);
            assert.strictEqual(value.hasValue(), true);
            assert.strictEqual(value.getValue(), 1); // make sure we did not evaluate again
        });
        test('lazy values handle error case', () => {
            let counter = 0;
            const value = new lazy_1.Lazy(() => { throw new Error(`${++counter}`); });
            assert.strictEqual(value.hasValue(), false);
            assert.throws(() => value.getValue(), /\b1\b/);
            assert.strictEqual(value.hasValue(), true);
            assert.throws(() => value.getValue(), /\b1\b/);
        });
        test('map should not cause lazy values to be re-resolved', () => {
            let outer = 0;
            let inner = 10;
            const outerLazy = new lazy_1.Lazy(() => ++outer);
            const innerLazy = outerLazy.map(x => [x, ++inner]);
            assert.strictEqual(outerLazy.hasValue(), false);
            assert.strictEqual(innerLazy.hasValue(), false);
            assert.deepStrictEqual(innerLazy.getValue(), [1, 11]);
            assert.strictEqual(outerLazy.hasValue(), true);
            assert.strictEqual(innerLazy.hasValue(), true);
            assert.strictEqual(outerLazy.getValue(), 1);
            // make sure we did not evaluate again
            assert.strictEqual(outerLazy.getValue(), 1);
            assert.deepStrictEqual(innerLazy.getValue(), [1, 11]);
        });
        test('map should handle error values', () => {
            let outer = 0;
            let inner = 10;
            const outerLazy = new lazy_1.Lazy(() => { throw new Error(`${++outer}`); });
            const innerLazy = outerLazy.map(x => { throw new Error(`${++inner}`); });
            assert.strictEqual(outerLazy.hasValue(), false);
            assert.strictEqual(innerLazy.hasValue(), false);
            assert.throws(() => innerLazy.getValue(), /\b1\b/); // we should get result from outer
            assert.strictEqual(outerLazy.hasValue(), true);
            assert.strictEqual(innerLazy.hasValue(), true);
            assert.throws(() => outerLazy.getValue(), /\b1\b/);
        });
    });
});
//# sourceMappingURL=lazy.test.js.map