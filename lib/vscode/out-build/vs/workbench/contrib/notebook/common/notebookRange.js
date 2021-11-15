/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cellRangeContains = exports.reduceRanges = exports.cellRangesToIndexes = exports.cellIndexesToRanges = void 0;
    function cellIndexesToRanges(indexes) {
        indexes.sort((a, b) => a - b);
        const first = indexes.shift();
        if (first === undefined) {
            return [];
        }
        return indexes.reduce(function (ranges, num) {
            if (num <= ranges[0][1]) {
                ranges[0][1] = num + 1;
            }
            else {
                ranges.unshift([num, num + 1]);
            }
            return ranges;
        }, [[first, first + 1]]).reverse().map(val => ({ start: val[0], end: val[1] }));
    }
    exports.cellIndexesToRanges = cellIndexesToRanges;
    function cellRangesToIndexes(ranges) {
        const indexes = ranges.reduce((a, b) => {
            for (let i = b.start; i < b.end; i++) {
                a.push(i);
            }
            return a;
        }, []);
        return indexes;
    }
    exports.cellRangesToIndexes = cellRangesToIndexes;
    /**
     * todo@rebornix notebookBrowser.reduceCellRanges
     * @returns
     */
    function reduceRanges(ranges) {
        const sorted = ranges.sort((a, b) => a.start - b.start);
        const first = sorted[0];
        if (!first) {
            return [];
        }
        return sorted.reduce((prev, curr) => {
            const last = prev[prev.length - 1];
            if (last.end >= curr.start) {
                last.end = Math.max(last.end, curr.end);
            }
            else {
                prev.push(curr);
            }
            return prev;
        }, [first]);
    }
    exports.reduceRanges = reduceRanges;
    /**
     * todo@rebornix test and sort
     * @param range
     * @param other
     * @returns
     */
    function cellRangeContains(range, other) {
        return other.start >= range.start && other.end <= range.end;
    }
    exports.cellRangeContains = cellRangeContains;
});
//# sourceMappingURL=notebookRange.js.map