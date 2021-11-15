/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SetMap = exports.diffMaps = exports.diffSets = exports.fromMap = exports.groupByNumber = exports.groupBy = exports.forEach = exports.values = void 0;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * Returns an array which contains all values that reside
     * in the given dictionary.
     */
    function values(from) {
        const result = [];
        for (let key in from) {
            if (hasOwnProperty.call(from, key)) {
                result.push(from[key]);
            }
        }
        return result;
    }
    exports.values = values;
    /**
     * Iterates over each entry in the provided dictionary. The iterator allows
     * to remove elements and will stop when the callback returns {{false}}.
     */
    function forEach(from, callback) {
        for (let key in from) {
            if (hasOwnProperty.call(from, key)) {
                const result = callback({ key: key, value: from[key] }, function () {
                    delete from[key];
                });
                if (result === false) {
                    return;
                }
            }
        }
    }
    exports.forEach = forEach;
    /**
     * Groups the collection into a dictionary based on the provided
     * group function.
     */
    function groupBy(data, groupFn) {
        const result = Object.create(null);
        for (const element of data) {
            const key = groupFn(element);
            let target = result[key];
            if (!target) {
                target = result[key] = [];
            }
            target.push(element);
        }
        return result;
    }
    exports.groupBy = groupBy;
    /**
     * Groups the collection into a dictionary based on the provided
     * group function.
     */
    function groupByNumber(data, groupFn) {
        const result = new Map();
        for (const element of data) {
            const key = groupFn(element);
            let target = result.get(key);
            if (!target) {
                target = [];
                result.set(key, target);
            }
            target.push(element);
        }
        return result;
    }
    exports.groupByNumber = groupByNumber;
    function fromMap(original) {
        const result = Object.create(null);
        if (original) {
            original.forEach((value, key) => {
                result[key] = value;
            });
        }
        return result;
    }
    exports.fromMap = fromMap;
    function diffSets(before, after) {
        const removed = [];
        const added = [];
        for (let element of before) {
            if (!after.has(element)) {
                removed.push(element);
            }
        }
        for (let element of after) {
            if (!before.has(element)) {
                added.push(element);
            }
        }
        return { removed, added };
    }
    exports.diffSets = diffSets;
    function diffMaps(before, after) {
        const removed = [];
        const added = [];
        for (let [index, value] of before) {
            if (!after.has(index)) {
                removed.push(value);
            }
        }
        for (let [index, value] of after) {
            if (!before.has(index)) {
                added.push(value);
            }
        }
        return { removed, added };
    }
    exports.diffMaps = diffMaps;
    class SetMap {
        constructor() {
            this.map = new Map();
        }
        add(key, value) {
            let values = this.map.get(key);
            if (!values) {
                values = new Set();
                this.map.set(key, values);
            }
            values.add(value);
        }
        delete(key, value) {
            const values = this.map.get(key);
            if (!values) {
                return;
            }
            values.delete(value);
            if (values.size === 0) {
                this.map.delete(key);
            }
        }
        forEach(key, fn) {
            const values = this.map.get(key);
            if (!values) {
                return;
            }
            values.forEach(fn);
        }
    }
    exports.SetMap = SetMap;
});
//# sourceMappingURL=collections.js.map