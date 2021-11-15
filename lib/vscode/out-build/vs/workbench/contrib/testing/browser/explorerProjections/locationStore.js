/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/editor/common/core/range"], function (require, exports, arrays_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestLocationStore = exports.locationsEqual = void 0;
    const locationsEqual = (a, b) => {
        if (a === undefined || b === undefined) {
            return b === a;
        }
        return a.uri.toString() === b.uri.toString() && a.range.equalsRange(b.range);
    };
    exports.locationsEqual = locationsEqual;
    /**
     * Stores and looks up test-item-like-objects by their uri/range. Used to
     * implement the 'reveal' action efficiently.
     */
    class TestLocationStore {
        constructor() {
            this.itemsByUri = new Map();
        }
        hasTestInDocument(uri) {
            var _a;
            return !!((_a = this.itemsByUri.get(uri.toString())) === null || _a === void 0 ? void 0 : _a.length);
        }
        getTestAtPosition(uri, position) {
            const tests = this.itemsByUri.get(uri.toString());
            if (!tests) {
                return;
            }
            return tests.find(test => {
                var _a;
                const range = (_a = test.location) === null || _a === void 0 ? void 0 : _a.range;
                return range && range_1.Range.lift(range).containsPosition(position);
            });
        }
        remove(item, fromLocation = item.location) {
            if (!fromLocation) {
                return;
            }
            const key = fromLocation.uri.toString();
            const arr = this.itemsByUri.get(key);
            if (!arr) {
                return;
            }
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === item) {
                    arr.splice(i, 1);
                    return;
                }
            }
        }
        add(item) {
            if (!item.location) {
                return;
            }
            const key = item.location.uri.toString();
            const arr = this.itemsByUri.get(key);
            if (!arr) {
                this.itemsByUri.set(key, [item]);
                return;
            }
            arr.splice((0, arrays_1.findFirstInSorted)(arr, x => x.depth < item.depth), 0, item);
        }
    }
    exports.TestLocationStore = TestLocationStore;
});
//# sourceMappingURL=locationStore.js.map