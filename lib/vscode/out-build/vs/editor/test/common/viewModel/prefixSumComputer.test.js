/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uint", "vs/editor/common/viewModel/prefixSumComputer"], function (require, exports, assert, uint_1, prefixSumComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function toUint32Array(arr) {
        const len = arr.length;
        const r = new Uint32Array(len);
        for (let i = 0; i < len; i++) {
            r[i] = (0, uint_1.toUint32)(arr[i]);
        }
        return r;
    }
    suite('Editor ViewModel - PrefixSumComputer', () => {
        test('PrefixSumComputer', () => {
            let indexOfResult;
            let psc = new prefixSumComputer_1.PrefixSumComputer(toUint32Array([1, 1, 2, 1, 3]));
            assert.strictEqual(psc.getTotalValue(), 8);
            assert.strictEqual(psc.getAccumulatedValue(-1), 0);
            assert.strictEqual(psc.getAccumulatedValue(0), 1);
            assert.strictEqual(psc.getAccumulatedValue(1), 2);
            assert.strictEqual(psc.getAccumulatedValue(2), 4);
            assert.strictEqual(psc.getAccumulatedValue(3), 5);
            assert.strictEqual(psc.getAccumulatedValue(4), 8);
            indexOfResult = psc.getIndexOf(0);
            assert.strictEqual(indexOfResult.index, 0);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(1);
            assert.strictEqual(indexOfResult.index, 1);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(2);
            assert.strictEqual(indexOfResult.index, 2);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(3);
            assert.strictEqual(indexOfResult.index, 2);
            assert.strictEqual(indexOfResult.remainder, 1);
            indexOfResult = psc.getIndexOf(4);
            assert.strictEqual(indexOfResult.index, 3);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(5);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(6);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 1);
            indexOfResult = psc.getIndexOf(7);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 2);
            indexOfResult = psc.getIndexOf(8);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 3);
            // [1, 2, 2, 1, 3]
            psc.changeValue(1, 2);
            assert.strictEqual(psc.getTotalValue(), 9);
            assert.strictEqual(psc.getAccumulatedValue(0), 1);
            assert.strictEqual(psc.getAccumulatedValue(1), 3);
            assert.strictEqual(psc.getAccumulatedValue(2), 5);
            assert.strictEqual(psc.getAccumulatedValue(3), 6);
            assert.strictEqual(psc.getAccumulatedValue(4), 9);
            // [1, 0, 2, 1, 3]
            psc.changeValue(1, 0);
            assert.strictEqual(psc.getTotalValue(), 7);
            assert.strictEqual(psc.getAccumulatedValue(0), 1);
            assert.strictEqual(psc.getAccumulatedValue(1), 1);
            assert.strictEqual(psc.getAccumulatedValue(2), 3);
            assert.strictEqual(psc.getAccumulatedValue(3), 4);
            assert.strictEqual(psc.getAccumulatedValue(4), 7);
            indexOfResult = psc.getIndexOf(0);
            assert.strictEqual(indexOfResult.index, 0);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(1);
            assert.strictEqual(indexOfResult.index, 2);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(2);
            assert.strictEqual(indexOfResult.index, 2);
            assert.strictEqual(indexOfResult.remainder, 1);
            indexOfResult = psc.getIndexOf(3);
            assert.strictEqual(indexOfResult.index, 3);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(4);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(5);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 1);
            indexOfResult = psc.getIndexOf(6);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 2);
            indexOfResult = psc.getIndexOf(7);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 3);
            // [1, 0, 0, 1, 3]
            psc.changeValue(2, 0);
            assert.strictEqual(psc.getTotalValue(), 5);
            assert.strictEqual(psc.getAccumulatedValue(0), 1);
            assert.strictEqual(psc.getAccumulatedValue(1), 1);
            assert.strictEqual(psc.getAccumulatedValue(2), 1);
            assert.strictEqual(psc.getAccumulatedValue(3), 2);
            assert.strictEqual(psc.getAccumulatedValue(4), 5);
            indexOfResult = psc.getIndexOf(0);
            assert.strictEqual(indexOfResult.index, 0);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(1);
            assert.strictEqual(indexOfResult.index, 3);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(2);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(3);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 1);
            indexOfResult = psc.getIndexOf(4);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 2);
            indexOfResult = psc.getIndexOf(5);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 3);
            // [1, 0, 0, 0, 3]
            psc.changeValue(3, 0);
            assert.strictEqual(psc.getTotalValue(), 4);
            assert.strictEqual(psc.getAccumulatedValue(0), 1);
            assert.strictEqual(psc.getAccumulatedValue(1), 1);
            assert.strictEqual(psc.getAccumulatedValue(2), 1);
            assert.strictEqual(psc.getAccumulatedValue(3), 1);
            assert.strictEqual(psc.getAccumulatedValue(4), 4);
            indexOfResult = psc.getIndexOf(0);
            assert.strictEqual(indexOfResult.index, 0);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(1);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(2);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 1);
            indexOfResult = psc.getIndexOf(3);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 2);
            indexOfResult = psc.getIndexOf(4);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 3);
            // [1, 1, 0, 1, 1]
            psc.changeValue(1, 1);
            psc.changeValue(3, 1);
            psc.changeValue(4, 1);
            assert.strictEqual(psc.getTotalValue(), 4);
            assert.strictEqual(psc.getAccumulatedValue(0), 1);
            assert.strictEqual(psc.getAccumulatedValue(1), 2);
            assert.strictEqual(psc.getAccumulatedValue(2), 2);
            assert.strictEqual(psc.getAccumulatedValue(3), 3);
            assert.strictEqual(psc.getAccumulatedValue(4), 4);
            indexOfResult = psc.getIndexOf(0);
            assert.strictEqual(indexOfResult.index, 0);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(1);
            assert.strictEqual(indexOfResult.index, 1);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(2);
            assert.strictEqual(indexOfResult.index, 3);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(3);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 0);
            indexOfResult = psc.getIndexOf(4);
            assert.strictEqual(indexOfResult.index, 4);
            assert.strictEqual(indexOfResult.remainder, 1);
        });
    });
});
//# sourceMappingURL=prefixSumComputer.test.js.map