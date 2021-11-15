/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["require","exports","vs/base/common/strings","vs/base/common/platform","vs/base/common/lifecycle","vs/base/common/path","vs/base/common/event","vs/editor/common/core/range","vs/base/common/uri","vs/base/common/errors","vs/editor/common/core/position","vs/base/common/buffer","vs/base/common/hash","vs/editor/common/model","vs/base/common/functional","vs/base/common/linkedList","vs/base/common/extpath","vs/base/common/map","vs/base/common/network","vs/base/common/glob","vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase","vs/platform/instantiation/common/instantiation","vs/editor/common/modes","vs/base/common/diff/diffChange","vs/base/common/arrays","vs/base/common/iterator","vs/base/common/numbers","vs/base/common/process","vs/base/common/stopwatch","vs/base/common/cancellation","vs/base/common/codicons","vs/base/common/stream","vs/base/common/diff/diff","vs/base/common/types","vs/base/common/uint","vs/base/common/resources","vs/base/common/async","vs/editor/common/core/characterClassifier","vs/editor/common/controller/wordCharacterClassifier","vs/editor/common/core/stringBuilder","vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase","vs/editor/common/model/textChange","vs/editor/common/model/textModelSearch","vs/editor/common/modes/languageSelector","vs/editor/common/modes/tokenizationRegistry","vs/editor/common/services/modelService","vs/editor/common/modes/languageFeatureRegistry","vs/editor/common/core/lineTokens","vs/editor/common/model/tokensStore","vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer","vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder","vs/platform/contextkey/common/contextkey","vs/workbench/contrib/notebook/common/notebookCommon","vs/workbench/contrib/notebook/common/services/notebookSimpleWorker"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[23/*vs/base/common/diff/diffChange*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffChange = void 0;
    /**
     * Represents information about a specific difference between two sequences.
     */
    class DiffChange {
        /**
         * Constructs a new DiffChange with the given sequence information
         * and content.
         */
        constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
            //Debug.Assert(originalLength > 0 || modifiedLength > 0, "originalLength and modifiedLength cannot both be <= 0");
            this.originalStart = originalStart;
            this.originalLength = originalLength;
            this.modifiedStart = modifiedStart;
            this.modifiedLength = modifiedLength;
        }
        /**
         * The end point (exclusive) of the change in the original sequence.
         */
        getOriginalEnd() {
            return this.originalStart + this.originalLength;
        }
        /**
         * The end point (exclusive) of the change in the modified sequence.
         */
        getModifiedEnd() {
            return this.modifiedStart + this.modifiedLength;
        }
    }
    exports.DiffChange = DiffChange;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[9/*vs/base/common/errors*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createErrorWithActions = exports.isErrorWithActions = exports.ExpectedError = exports.NotSupportedError = exports.NotImplementedError = exports.getErrorMessage = exports.disposed = exports.readonly = exports.illegalState = exports.illegalArgument = exports.canceled = exports.CancellationError = exports.isPromiseCanceledError = exports.transformErrorForSerialization = exports.onUnexpectedExternalError = exports.onUnexpectedError = exports.setUnexpectedErrorHandler = exports.errorHandler = exports.ErrorHandler = void 0;
    // Avoid circular dependency on EventEmitter by implementing a subset of the interface.
    class ErrorHandler {
        constructor() {
            this.listeners = [];
            this.unexpectedErrorHandler = function (e) {
                setTimeout(() => {
                    if (e.stack) {
                        throw new Error(e.message + '\n\n' + e.stack);
                    }
                    throw e;
                }, 0);
            };
        }
        addListener(listener) {
            this.listeners.push(listener);
            return () => {
                this._removeListener(listener);
            };
        }
        emit(e) {
            this.listeners.forEach((listener) => {
                listener(e);
            });
        }
        _removeListener(listener) {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        }
        setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
            this.unexpectedErrorHandler = newUnexpectedErrorHandler;
        }
        getUnexpectedErrorHandler() {
            return this.unexpectedErrorHandler;
        }
        onUnexpectedError(e) {
            this.unexpectedErrorHandler(e);
            this.emit(e);
        }
        // For external errors, we don't want the listeners to be called
        onUnexpectedExternalError(e) {
            this.unexpectedErrorHandler(e);
        }
    }
    exports.ErrorHandler = ErrorHandler;
    exports.errorHandler = new ErrorHandler();
    function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
        exports.errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
    }
    exports.setUnexpectedErrorHandler = setUnexpectedErrorHandler;
    function onUnexpectedError(e) {
        // ignore errors from cancelled promises
        if (!isPromiseCanceledError(e)) {
            exports.errorHandler.onUnexpectedError(e);
        }
        return undefined;
    }
    exports.onUnexpectedError = onUnexpectedError;
    function onUnexpectedExternalError(e) {
        // ignore errors from cancelled promises
        if (!isPromiseCanceledError(e)) {
            exports.errorHandler.onUnexpectedExternalError(e);
        }
        return undefined;
    }
    exports.onUnexpectedExternalError = onUnexpectedExternalError;
    function transformErrorForSerialization(error) {
        if (error instanceof Error) {
            let { name, message } = error;
            const stack = error.stacktrace || error.stack;
            return {
                $isError: true,
                name,
                message,
                stack
            };
        }
        // return as is
        return error;
    }
    exports.transformErrorForSerialization = transformErrorForSerialization;
    const canceledName = 'Canceled';
    /**
     * Checks if the given error is a promise in canceled state
     */
    function isPromiseCanceledError(error) {
        return error instanceof Error && error.name === canceledName && error.message === canceledName;
    }
    exports.isPromiseCanceledError = isPromiseCanceledError;
    // !!!IMPORTANT!!!
    // Do NOT change this class because it is also used as an API-type.
    class CancellationError extends Error {
        constructor() {
            super(canceledName);
            this.name = this.message;
        }
    }
    exports.CancellationError = CancellationError;
    /**
     * Returns an error that signals cancellation.
     */
    function canceled() {
        const error = new Error(canceledName);
        error.name = error.message;
        return error;
    }
    exports.canceled = canceled;
    function illegalArgument(name) {
        if (name) {
            return new Error(`Illegal argument: ${name}`);
        }
        else {
            return new Error('Illegal argument');
        }
    }
    exports.illegalArgument = illegalArgument;
    function illegalState(name) {
        if (name) {
            return new Error(`Illegal state: ${name}`);
        }
        else {
            return new Error('Illegal state');
        }
    }
    exports.illegalState = illegalState;
    function readonly(name) {
        return name
            ? new Error(`readonly property '${name} cannot be changed'`)
            : new Error('readonly property cannot be changed');
    }
    exports.readonly = readonly;
    function disposed(what) {
        const result = new Error(`${what} has been disposed`);
        result.name = 'DISPOSED';
        return result;
    }
    exports.disposed = disposed;
    function getErrorMessage(err) {
        if (!err) {
            return 'Error';
        }
        if (err.message) {
            return err.message;
        }
        if (err.stack) {
            return err.stack.split('\n')[0];
        }
        return String(err);
    }
    exports.getErrorMessage = getErrorMessage;
    class NotImplementedError extends Error {
        constructor(message) {
            super('NotImplemented');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotImplementedError = NotImplementedError;
    class NotSupportedError extends Error {
        constructor(message) {
            super('NotSupported');
            if (message) {
                this.message = message;
            }
        }
    }
    exports.NotSupportedError = NotSupportedError;
    class ExpectedError extends Error {
        constructor() {
            super(...arguments);
            this.isExpected = true;
        }
    }
    exports.ExpectedError = ExpectedError;
    function isErrorWithActions(obj) {
        const candidate = obj;
        return candidate instanceof Error && Array.isArray(candidate.actions);
    }
    exports.isErrorWithActions = isErrorWithActions;
    function createErrorWithActions(message, options = Object.create(null)) {
        const result = new Error(message);
        if (options.actions) {
            result.actions = options.actions;
        }
        return result;
    }
    exports.createErrorWithActions = createErrorWithActions;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[24/*vs/base/common/arrays*/], __M([0/*require*/,1/*exports*/,9/*vs/base/common/errors*/]), function (require, exports, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapFind = exports.getRandomElement = exports.asArray = exports.mapArrayOrNot = exports.pushToEnd = exports.pushToStart = exports.shuffle = exports.arrayInsert = exports.remove = exports.insert = exports.index = exports.range = exports.flatten = exports.commonPrefixLength = exports.firstOrDefault = exports.lastIndex = exports.uniqueFilter = exports.distinctES6 = exports.distinct = exports.isNonEmptyArray = exports.isFalsyOrEmpty = exports.move = exports.coalesceInPlace = exports.coalesce = exports.topAsync = exports.top = exports.delta = exports.sortedDiff = exports.groupBy = exports.quickSelect = exports.findFirstInSorted = exports.binarySearch = exports.equals = exports.tail2 = exports.tail = void 0;
    /**
     * Returns the last element of an array.
     * @param array The array.
     * @param n Which element from the end (default is zero).
     */
    function tail(array, n = 0) {
        return array[array.length - (1 + n)];
    }
    exports.tail = tail;
    function tail2(arr) {
        if (arr.length === 0) {
            throw new Error('Invalid tail call');
        }
        return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
    }
    exports.tail2 = tail2;
    function equals(one, other, itemEquals = (a, b) => a === b) {
        if (one === other) {
            return true;
        }
        if (!one || !other) {
            return false;
        }
        if (one.length !== other.length) {
            return false;
        }
        for (let i = 0, len = one.length; i < len; i++) {
            if (!itemEquals(one[i], other[i])) {
                return false;
            }
        }
        return true;
    }
    exports.equals = equals;
    function binarySearch(array, key, comparator) {
        let low = 0, high = array.length - 1;
        while (low <= high) {
            const mid = ((low + high) / 2) | 0;
            const comp = comparator(array[mid], key);
            if (comp < 0) {
                low = mid + 1;
            }
            else if (comp > 0) {
                high = mid - 1;
            }
            else {
                return mid;
            }
        }
        return -(low + 1);
    }
    exports.binarySearch = binarySearch;
    /**
     * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
     * are located before all elements where p(x) is true.
     * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
     */
    function findFirstInSorted(array, p) {
        let low = 0, high = array.length;
        if (high === 0) {
            return 0; // no children
        }
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (p(array[mid])) {
                high = mid;
            }
            else {
                low = mid + 1;
            }
        }
        return low;
    }
    exports.findFirstInSorted = findFirstInSorted;
    function quickSelect(nth, data, compare) {
        nth = nth | 0;
        if (nth >= data.length) {
            throw new TypeError('invalid index');
        }
        let pivotValue = data[Math.floor(data.length * Math.random())];
        let lower = [];
        let higher = [];
        let pivots = [];
        for (let value of data) {
            const val = compare(value, pivotValue);
            if (val < 0) {
                lower.push(value);
            }
            else if (val > 0) {
                higher.push(value);
            }
            else {
                pivots.push(value);
            }
        }
        if (nth < lower.length) {
            return quickSelect(nth, lower, compare);
        }
        else if (nth < lower.length + pivots.length) {
            return pivots[0];
        }
        else {
            return quickSelect(nth - (lower.length + pivots.length), higher, compare);
        }
    }
    exports.quickSelect = quickSelect;
    function groupBy(data, compare) {
        const result = [];
        let currentGroup = undefined;
        for (const element of data.slice(0).sort(compare)) {
            if (!currentGroup || compare(currentGroup[0], element) !== 0) {
                currentGroup = [element];
                result.push(currentGroup);
            }
            else {
                currentGroup.push(element);
            }
        }
        return result;
    }
    exports.groupBy = groupBy;
    /**
     * Diffs two *sorted* arrays and computes the splices which apply the diff.
     */
    function sortedDiff(before, after, compare) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            const n = compare(beforeElement, afterElement);
            if (n === 0) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
            }
            else if (n < 0) {
                // beforeElement is smaller -> before element removed
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else if (n > 0) {
                // beforeElement is greater -> after element added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.sortedDiff = sortedDiff;
    /**
     * Takes two *sorted* arrays and computes their delta (removed, added elements).
     * Finishes in `Math.min(before.length, after.length)` steps.
     */
    function delta(before, after, compare) {
        const splices = sortedDiff(before, after, compare);
        const removed = [];
        const added = [];
        for (const splice of splices) {
            removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
            added.push(...splice.toInsert);
        }
        return { removed, added };
    }
    exports.delta = delta;
    /**
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @return The first n elemnts from array when sorted with compare.
     */
    function top(array, compare, n) {
        if (n === 0) {
            return [];
        }
        const result = array.slice(0, n).sort(compare);
        topStep(array, compare, result, n, array.length);
        return result;
    }
    exports.top = top;
    /**
     * Asynchronous variant of `top()` allowing for splitting up work in batches between which the event loop can run.
     *
     * Returns the top N elements from the array.
     *
     * Faster than sorting the entire array when the array is a lot larger than N.
     *
     * @param array The unsorted array.
     * @param compare A sort function for the elements.
     * @param n The number of elements to return.
     * @param batch The number of elements to examine before yielding to the event loop.
     * @return The first n elemnts from array when sorted with compare.
     */
    function topAsync(array, compare, n, batch, token) {
        if (n === 0) {
            return Promise.resolve([]);
        }
        return new Promise((resolve, reject) => {
            (async () => {
                const o = array.length;
                const result = array.slice(0, n).sort(compare);
                for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
                    if (i > n) {
                        await new Promise(resolve => setTimeout(resolve)); // nextTick() would starve I/O.
                    }
                    if (token && token.isCancellationRequested) {
                        throw (0, errors_1.canceled)();
                    }
                    topStep(array, compare, result, i, m);
                }
                return result;
            })()
                .then(resolve, reject);
        });
    }
    exports.topAsync = topAsync;
    function topStep(array, compare, result, i, m) {
        for (const n = result.length; i < m; i++) {
            const element = array[i];
            if (compare(element, result[n - 1]) < 0) {
                result.pop();
                const j = findFirstInSorted(result, e => compare(element, e) < 0);
                result.splice(j, 0, element);
            }
        }
    }
    /**
     * @returns New array with all falsy values removed. The original array IS NOT modified.
     */
    function coalesce(array) {
        return array.filter(e => !!e);
    }
    exports.coalesce = coalesce;
    /**
     * Remove all falsey values from `array`. The original array IS modified.
     */
    function coalesceInPlace(array) {
        let to = 0;
        for (let i = 0; i < array.length; i++) {
            if (!!array[i]) {
                array[to] = array[i];
                to += 1;
            }
        }
        array.length = to;
    }
    exports.coalesceInPlace = coalesceInPlace;
    /**
     * Moves the element in the array for the provided positions.
     */
    function move(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);
    }
    exports.move = move;
    /**
     * @returns false if the provided object is an array and not empty.
     */
    function isFalsyOrEmpty(obj) {
        return !Array.isArray(obj) || obj.length === 0;
    }
    exports.isFalsyOrEmpty = isFalsyOrEmpty;
    function isNonEmptyArray(obj) {
        return Array.isArray(obj) && obj.length > 0;
    }
    exports.isNonEmptyArray = isNonEmptyArray;
    /**
     * Removes duplicates from the given array. The optional keyFn allows to specify
     * how elements are checked for equalness by returning a unique string for each.
     */
    function distinct(array, keyFn) {
        if (!keyFn) {
            return array.filter((element, position) => {
                return array.indexOf(element) === position;
            });
        }
        const seen = Object.create(null);
        return array.filter((elem) => {
            const key = keyFn(elem);
            if (seen[key]) {
                return false;
            }
            seen[key] = true;
            return true;
        });
    }
    exports.distinct = distinct;
    function distinctES6(array) {
        const seen = new Set();
        return array.filter(element => {
            if (seen.has(element)) {
                return false;
            }
            seen.add(element);
            return true;
        });
    }
    exports.distinctES6 = distinctES6;
    function uniqueFilter(keyFn) {
        const seen = Object.create(null);
        return element => {
            const key = keyFn(element);
            if (seen[key]) {
                return false;
            }
            seen[key] = true;
            return true;
        };
    }
    exports.uniqueFilter = uniqueFilter;
    function lastIndex(array, fn) {
        for (let i = array.length - 1; i >= 0; i--) {
            const element = array[i];
            if (fn(element)) {
                return i;
            }
        }
        return -1;
    }
    exports.lastIndex = lastIndex;
    function firstOrDefault(array, notFoundValue) {
        return array.length > 0 ? array[0] : notFoundValue;
    }
    exports.firstOrDefault = firstOrDefault;
    function commonPrefixLength(one, other, equals = (a, b) => a === b) {
        let result = 0;
        for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
            result++;
        }
        return result;
    }
    exports.commonPrefixLength = commonPrefixLength;
    function flatten(arr) {
        return [].concat(...arr);
    }
    exports.flatten = flatten;
    function range(arg, to) {
        let from = typeof to === 'number' ? arg : 0;
        if (typeof to === 'number') {
            from = arg;
        }
        else {
            from = 0;
            to = arg;
        }
        const result = [];
        if (from <= to) {
            for (let i = from; i < to; i++) {
                result.push(i);
            }
        }
        else {
            for (let i = from; i > to; i--) {
                result.push(i);
            }
        }
        return result;
    }
    exports.range = range;
    function index(array, indexer, mapper) {
        return array.reduce((r, t) => {
            r[indexer(t)] = mapper ? mapper(t) : t;
            return r;
        }, Object.create(null));
    }
    exports.index = index;
    /**
     * Inserts an element into an array. Returns a function which, when
     * called, will remove that element from the array.
     */
    function insert(array, element) {
        array.push(element);
        return () => remove(array, element);
    }
    exports.insert = insert;
    /**
     * Removes an element from an array if it can be found.
     */
    function remove(array, element) {
        const index = array.indexOf(element);
        if (index > -1) {
            array.splice(index, 1);
            return element;
        }
        return undefined;
    }
    exports.remove = remove;
    /**
     * Insert `insertArr` inside `target` at `insertIndex`.
     * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
     */
    function arrayInsert(target, insertIndex, insertArr) {
        const before = target.slice(0, insertIndex);
        const after = target.slice(insertIndex);
        return before.concat(insertArr, after);
    }
    exports.arrayInsert = arrayInsert;
    /**
     * Uses Fisher-Yates shuffle to shuffle the given array
     */
    function shuffle(array, _seed) {
        let rand;
        if (typeof _seed === 'number') {
            let seed = _seed;
            // Seeded random number generator in JS. Modified from:
            // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
            rand = () => {
                const x = Math.sin(seed++) * 179426549; // throw away most significant digits and reduce any potential bias
                return x - Math.floor(x);
            };
        }
        else {
            rand = Math.random;
        }
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(rand() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    exports.shuffle = shuffle;
    /**
     * Pushes an element to the start of the array, if found.
     */
    function pushToStart(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.unshift(value);
        }
    }
    exports.pushToStart = pushToStart;
    /**
     * Pushes an element to the end of the array, if found.
     */
    function pushToEnd(arr, value) {
        const index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
            arr.push(value);
        }
    }
    exports.pushToEnd = pushToEnd;
    function mapArrayOrNot(items, fn) {
        return Array.isArray(items) ?
            items.map(fn) :
            fn(items);
    }
    exports.mapArrayOrNot = mapArrayOrNot;
    function asArray(x) {
        return Array.isArray(x) ? x : [x];
    }
    exports.asArray = asArray;
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    exports.getRandomElement = getRandomElement;
    /**
     * Returns the first mapped value of the array which is not undefined.
     */
    function mapFind(array, mapFn) {
        for (const value of array) {
            const mapped = mapFn(value);
            if (mapped !== undefined) {
                return mapped;
            }
        }
        return undefined;
    }
    exports.mapFind = mapFind;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[14/*vs/base/common/functional*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.once = void 0;
    function once(fn) {
        const _this = this;
        let didCall = false;
        let result;
        return function () {
            if (didCall) {
                return result;
            }
            didCall = true;
            result = fn.apply(_this, arguments);
            return result;
        };
    }
    exports.once = once;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[25/*vs/base/common/iterator*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Iterable = void 0;
    var Iterable;
    (function (Iterable) {
        function is(thing) {
            return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function';
        }
        Iterable.is = is;
        const _empty = Object.freeze([]);
        function empty() {
            return _empty;
        }
        Iterable.empty = empty;
        function* single(element) {
            yield element;
        }
        Iterable.single = single;
        function from(iterable) {
            return iterable || _empty;
        }
        Iterable.from = from;
        function isEmpty(iterable) {
            return !iterable || iterable[Symbol.iterator]().next().done === true;
        }
        Iterable.isEmpty = isEmpty;
        function first(iterable) {
            return iterable[Symbol.iterator]().next().value;
        }
        Iterable.first = first;
        function some(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return true;
                }
            }
            return false;
        }
        Iterable.some = some;
        function find(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    return element;
                }
            }
            return undefined;
        }
        Iterable.find = find;
        function* filter(iterable, predicate) {
            for (const element of iterable) {
                if (predicate(element)) {
                    yield element;
                }
            }
        }
        Iterable.filter = filter;
        function* map(iterable, fn) {
            for (const element of iterable) {
                yield fn(element);
            }
        }
        Iterable.map = map;
        function* concat(...iterables) {
            for (const iterable of iterables) {
                for (const element of iterable) {
                    yield element;
                }
            }
        }
        Iterable.concat = concat;
        function* concatNested(iterables) {
            for (const iterable of iterables) {
                for (const element of iterable) {
                    yield element;
                }
            }
        }
        Iterable.concatNested = concatNested;
        function reduce(iterable, reducer, initialValue) {
            let value = initialValue;
            for (const element of iterable) {
                value = reducer(value, element);
            }
            return value;
        }
        Iterable.reduce = reduce;
        /**
         * Returns an iterable slice of the array, with the same semantics as `array.slice()`.
         */
        function* slice(arr, from, to = arr.length) {
            if (from < 0) {
                from += arr.length;
            }
            if (to < 0) {
                to += arr.length;
            }
            else if (to > arr.length) {
                to = arr.length;
            }
            for (; from < to; from++) {
                yield arr[from];
            }
        }
        Iterable.slice = slice;
        /**
         * Consumes `atMost` elements from iterable and returns the consumed elements,
         * and an iterable for the rest of the elements.
         */
        function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
            const consumed = [];
            if (atMost === 0) {
                return [consumed, iterable];
            }
            const iterator = iterable[Symbol.iterator]();
            for (let i = 0; i < atMost; i++) {
                const next = iterator.next();
                if (next.done) {
                    return [consumed, Iterable.empty()];
                }
                consumed.push(next.value);
            }
            return [consumed, { [Symbol.iterator]() { return iterator; } }];
        }
        Iterable.consume = consume;
        /**
         * Returns whether the iterables are the same length and all items are
         * equal using the comparator function.
         */
        function equals(a, b, comparator = (at, bt) => at === bt) {
            const ai = a[Symbol.iterator]();
            const bi = b[Symbol.iterator]();
            while (true) {
                const an = ai.next();
                const bn = bi.next();
                if (an.done !== bn.done) {
                    return false;
                }
                else if (an.done) {
                    return true;
                }
                else if (!comparator(an.value, bn.value)) {
                    return false;
                }
            }
        }
        Iterable.equals = equals;
    })(Iterable = exports.Iterable || (exports.Iterable = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[4/*vs/base/common/lifecycle*/], __M([0/*require*/,1/*exports*/,14/*vs/base/common/functional*/,25/*vs/base/common/iterator*/]), function (require, exports, functional_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImmortalReference = exports.ReferenceCollection = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = exports.toDisposable = exports.combinedDisposable = exports.dispose = exports.isDisposable = exports.MultiDisposeError = exports.trackDisposable = exports.setDisposableTracker = void 0;
    /**
     * Enables logging of potentially leaked disposables.
     *
     * A disposable is considered leaked if it is not disposed or not registered as the child of
     * another disposable. This tracking is very simple an only works for classes that either
     * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
     */
    const TRACK_DISPOSABLES = false;
    let disposableTracker = null;
    function setDisposableTracker(tracker) {
        disposableTracker = tracker;
    }
    exports.setDisposableTracker = setDisposableTracker;
    if (TRACK_DISPOSABLES) {
        const __is_disposable_tracked__ = '__is_disposable_tracked__';
        disposableTracker = new class {
            trackDisposable(x) {
                const stack = new Error('Potentially leaked disposable').stack;
                setTimeout(() => {
                    if (!x[__is_disposable_tracked__]) {
                        console.log(stack);
                    }
                }, 3000);
            }
            markTracked(x) {
                if (x && x !== Disposable.None) {
                    try {
                        x[__is_disposable_tracked__] = true;
                    }
                    catch (_a) {
                        // noop
                    }
                }
            }
        };
    }
    function markTracked(x) {
        if (!disposableTracker) {
            return;
        }
        disposableTracker.markTracked(x);
    }
    function trackDisposable(x) {
        if (!disposableTracker) {
            return x;
        }
        disposableTracker.trackDisposable(x);
        return x;
    }
    exports.trackDisposable = trackDisposable;
    class MultiDisposeError extends Error {
        constructor(errors) {
            super(`Encountered errors while disposing of store. Errors: [${errors.join(', ')}]`);
            this.errors = errors;
        }
    }
    exports.MultiDisposeError = MultiDisposeError;
    function isDisposable(thing) {
        return typeof thing.dispose === 'function' && thing.dispose.length === 0;
    }
    exports.isDisposable = isDisposable;
    function dispose(arg) {
        if (iterator_1.Iterable.is(arg)) {
            let errors = [];
            for (const d of arg) {
                if (d) {
                    markTracked(d);
                    try {
                        d.dispose();
                    }
                    catch (e) {
                        errors.push(e);
                    }
                }
            }
            if (errors.length === 1) {
                throw errors[0];
            }
            else if (errors.length > 1) {
                throw new MultiDisposeError(errors);
            }
            return Array.isArray(arg) ? [] : arg;
        }
        else if (arg) {
            markTracked(arg);
            arg.dispose();
            return arg;
        }
    }
    exports.dispose = dispose;
    function combinedDisposable(...disposables) {
        disposables.forEach(markTracked);
        return toDisposable(() => dispose(disposables));
    }
    exports.combinedDisposable = combinedDisposable;
    function toDisposable(fn) {
        const self = trackDisposable({
            dispose: () => {
                markTracked(self);
                fn();
            }
        });
        return self;
    }
    exports.toDisposable = toDisposable;
    class DisposableStore {
        constructor() {
            this._toDispose = new Set();
            this._isDisposed = false;
        }
        /**
         * Dispose of all registered disposables and mark this object as disposed.
         *
         * Any future disposables added to this object will be disposed of on `add`.
         */
        dispose() {
            if (this._isDisposed) {
                return;
            }
            markTracked(this);
            this._isDisposed = true;
            this.clear();
        }
        /**
         * Dispose of all registered disposables but do not mark this object as disposed.
         */
        clear() {
            try {
                dispose(this._toDispose.values());
            }
            finally {
                this._toDispose.clear();
            }
        }
        add(t) {
            if (!t) {
                return t;
            }
            if (t === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            markTracked(t);
            if (this._isDisposed) {
                if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                    console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
                }
            }
            else {
                this._toDispose.add(t);
            }
            return t;
        }
    }
    exports.DisposableStore = DisposableStore;
    DisposableStore.DISABLE_DISPOSED_WARNING = false;
    class Disposable {
        constructor() {
            this._store = new DisposableStore();
            trackDisposable(this);
        }
        dispose() {
            markTracked(this);
            this._store.dispose();
        }
        _register(t) {
            if (t === this) {
                throw new Error('Cannot register a disposable on itself!');
            }
            return this._store.add(t);
        }
    }
    exports.Disposable = Disposable;
    Disposable.None = Object.freeze({ dispose() { } });
    /**
     * Manages the lifecycle of a disposable value that may be changed.
     *
     * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
     * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
     */
    class MutableDisposable {
        constructor() {
            this._isDisposed = false;
            trackDisposable(this);
        }
        get value() {
            return this._isDisposed ? undefined : this._value;
        }
        set value(value) {
            var _a;
            if (this._isDisposed || value === this._value) {
                return;
            }
            (_a = this._value) === null || _a === void 0 ? void 0 : _a.dispose();
            if (value) {
                markTracked(value);
            }
            this._value = value;
        }
        clear() {
            this.value = undefined;
        }
        dispose() {
            var _a;
            this._isDisposed = true;
            markTracked(this);
            (_a = this._value) === null || _a === void 0 ? void 0 : _a.dispose();
            this._value = undefined;
        }
    }
    exports.MutableDisposable = MutableDisposable;
    class ReferenceCollection {
        constructor() {
            this.references = new Map();
        }
        acquire(key, ...args) {
            let reference = this.references.get(key);
            if (!reference) {
                reference = { counter: 0, object: this.createReferencedObject(key, ...args) };
                this.references.set(key, reference);
            }
            const { object } = reference;
            const dispose = (0, functional_1.once)(() => {
                if (--reference.counter === 0) {
                    this.destroyReferencedObject(key, reference.object);
                    this.references.delete(key);
                }
            });
            reference.counter++;
            return { object, dispose };
        }
    }
    exports.ReferenceCollection = ReferenceCollection;
    class ImmortalReference {
        constructor(object) {
            this.object = object;
        }
        dispose() { }
    }
    exports.ImmortalReference = ImmortalReference;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[15/*vs/base/common/linkedList*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinkedList = void 0;
    class Node {
        constructor(element) {
            this.element = element;
            this.next = Node.Undefined;
            this.prev = Node.Undefined;
        }
    }
    Node.Undefined = new Node(undefined);
    class LinkedList {
        constructor() {
            this._first = Node.Undefined;
            this._last = Node.Undefined;
            this._size = 0;
        }
        get size() {
            return this._size;
        }
        isEmpty() {
            return this._first === Node.Undefined;
        }
        clear() {
            this._first = Node.Undefined;
            this._last = Node.Undefined;
            this._size = 0;
        }
        unshift(element) {
            return this._insert(element, false);
        }
        push(element) {
            return this._insert(element, true);
        }
        _insert(element, atTheEnd) {
            const newNode = new Node(element);
            if (this._first === Node.Undefined) {
                this._first = newNode;
                this._last = newNode;
            }
            else if (atTheEnd) {
                // push
                const oldLast = this._last;
                this._last = newNode;
                newNode.prev = oldLast;
                oldLast.next = newNode;
            }
            else {
                // unshift
                const oldFirst = this._first;
                this._first = newNode;
                newNode.next = oldFirst;
                oldFirst.prev = newNode;
            }
            this._size += 1;
            let didRemove = false;
            return () => {
                if (!didRemove) {
                    didRemove = true;
                    this._remove(newNode);
                }
            };
        }
        shift() {
            if (this._first === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this._first.element;
                this._remove(this._first);
                return res;
            }
        }
        pop() {
            if (this._last === Node.Undefined) {
                return undefined;
            }
            else {
                const res = this._last.element;
                this._remove(this._last);
                return res;
            }
        }
        _remove(node) {
            if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
                // middle
                const anchor = node.prev;
                anchor.next = node.next;
                node.next.prev = anchor;
            }
            else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
                // only node
                this._first = Node.Undefined;
                this._last = Node.Undefined;
            }
            else if (node.next === Node.Undefined) {
                // last
                this._last = this._last.prev;
                this._last.next = Node.Undefined;
            }
            else if (node.prev === Node.Undefined) {
                // first
                this._first = this._first.next;
                this._first.prev = Node.Undefined;
            }
            // done
            this._size -= 1;
        }
        *[Symbol.iterator]() {
            let node = this._first;
            while (node !== Node.Undefined) {
                yield node.element;
                node = node.next;
            }
        }
    }
    exports.LinkedList = LinkedList;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[26/*vs/base/common/numbers*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MovingAverage = exports.Counter = exports.rot = exports.clamp = void 0;
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    exports.clamp = clamp;
    function rot(index, modulo) {
        return (modulo + (index % modulo)) % modulo;
    }
    exports.rot = rot;
    class Counter {
        constructor() {
            this._next = 0;
        }
        getNext() {
            return this._next++;
        }
    }
    exports.Counter = Counter;
    class MovingAverage {
        constructor() {
            this._n = 1;
            this._val = 0;
        }
        update(value) {
            this._val = this._val + (value - this._val) / this._n;
            this._n += 1;
            return this;
        }
        get value() {
            return this._val;
        }
    }
    exports.MovingAverage = MovingAverage;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[3/*vs/base/common/platform*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLittleEndian = exports.OS = exports.OperatingSystem = exports.setImmediate = exports.translationsConfigFile = exports.locale = exports.Language = exports.language = exports.userAgent = exports.platform = exports.isIOS = exports.isWeb = exports.isNative = exports.isLinuxSnap = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.PlatformToString = exports.Platform = exports.isPreferringBrowserCodeLoad = exports.browserCodeLoadingCacheStrategy = exports.isElectronSandboxed = exports.globals = void 0;
    const LANGUAGE_DEFAULT = 'en';
    let _isWindows = false;
    let _isMacintosh = false;
    let _isLinux = false;
    let _isLinuxSnap = false;
    let _isNative = false;
    let _isWeb = false;
    let _isIOS = false;
    let _locale = undefined;
    let _language = LANGUAGE_DEFAULT;
    let _translationsConfigFile = undefined;
    let _userAgent = undefined;
    exports.globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
    let nodeProcess = undefined;
    if (typeof exports.globals.vscode !== 'undefined') {
        // Native environment (sandboxed)
        nodeProcess = exports.globals.vscode.process;
    }
    else if (typeof process !== 'undefined') {
        // Native environment (non-sandboxed)
        nodeProcess = process;
    }
    const isElectronRenderer = typeof ((_a = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.versions) === null || _a === void 0 ? void 0 : _a.electron) === 'string' && nodeProcess.type === 'renderer';
    exports.isElectronSandboxed = isElectronRenderer && (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.sandboxed);
    exports.browserCodeLoadingCacheStrategy = (() => {
        // Always enabled when sandbox is enabled
        if (exports.isElectronSandboxed) {
            return 'bypassHeatCheck';
        }
        // Otherwise, only enabled conditionally
        const env = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.env['VSCODE_BROWSER_CODE_LOADING'];
        if (typeof env === 'string') {
            if (env === 'none' || env === 'code' || env === 'bypassHeatCheck' || env === 'bypassHeatCheckAndEagerCompile') {
                return env;
            }
            return 'bypassHeatCheck';
        }
        return undefined;
    })();
    exports.isPreferringBrowserCodeLoad = typeof exports.browserCodeLoadingCacheStrategy === 'string';
    // Web environment
    if (typeof navigator === 'object' && !isElectronRenderer) {
        _userAgent = navigator.userAgent;
        _isWindows = _userAgent.indexOf('Windows') >= 0;
        _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
        _isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
        _isLinux = _userAgent.indexOf('Linux') >= 0;
        _isWeb = true;
        _locale = navigator.language;
        _language = _locale;
        // NOTE@coder: Make languages work.
        const el = typeof document !== 'undefined' && document.getElementById('vscode-remote-nls-configuration');
        const rawNlsConfig = el && el.getAttribute('data-settings');
        if (rawNlsConfig) {
            try {
                const nlsConfig = JSON.parse(rawNlsConfig);
                _locale = nlsConfig.locale;
                _translationsConfigFile = nlsConfig._translationsConfigFile;
                _language = nlsConfig.availableLanguages['*'] || LANGUAGE_DEFAULT;
            }
            catch (error) { /* Oh well. */ }
        }
    }
    // Native environment
    else if (typeof nodeProcess === 'object') {
        _isWindows = (nodeProcess.platform === 'win32');
        _isMacintosh = (nodeProcess.platform === 'darwin');
        _isLinux = (nodeProcess.platform === 'linux');
        _isLinuxSnap = _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
        _locale = LANGUAGE_DEFAULT;
        _language = LANGUAGE_DEFAULT;
        const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];
        if (rawNlsConfig) {
            try {
                const nlsConfig = JSON.parse(rawNlsConfig);
                const resolved = nlsConfig.availableLanguages['*'];
                _locale = nlsConfig.locale;
                // VSCode's default language is 'en'
                _language = resolved ? resolved : LANGUAGE_DEFAULT;
                _translationsConfigFile = nlsConfig._translationsConfigFile;
            }
            catch (e) {
            }
        }
        _isNative = true;
    }
    // Unknown environment
    else {
        console.error('Unable to resolve platform.');
    }
    var Platform;
    (function (Platform) {
        Platform[Platform["Web"] = 0] = "Web";
        Platform[Platform["Mac"] = 1] = "Mac";
        Platform[Platform["Linux"] = 2] = "Linux";
        Platform[Platform["Windows"] = 3] = "Windows";
    })(Platform = exports.Platform || (exports.Platform = {}));
    function PlatformToString(platform) {
        switch (platform) {
            case 0 /* Web */: return 'Web';
            case 1 /* Mac */: return 'Mac';
            case 2 /* Linux */: return 'Linux';
            case 3 /* Windows */: return 'Windows';
        }
    }
    exports.PlatformToString = PlatformToString;
    let _platform = 0 /* Web */;
    if (_isMacintosh) {
        _platform = 1 /* Mac */;
    }
    else if (_isWindows) {
        _platform = 3 /* Windows */;
    }
    else if (_isLinux) {
        _platform = 2 /* Linux */;
    }
    exports.isWindows = _isWindows;
    exports.isMacintosh = _isMacintosh;
    exports.isLinux = _isLinux;
    exports.isLinuxSnap = _isLinuxSnap;
    exports.isNative = _isNative;
    exports.isWeb = _isWeb;
    exports.isIOS = _isIOS;
    exports.platform = _platform;
    exports.userAgent = _userAgent;
    /**
     * The language used for the user interface. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese)
     */
    exports.language = _language;
    var Language;
    (function (Language) {
        function value() {
            return exports.language;
        }
        Language.value = value;
        function isDefaultVariant() {
            if (exports.language.length === 2) {
                return exports.language === 'en';
            }
            else if (exports.language.length >= 3) {
                return exports.language[0] === 'e' && exports.language[1] === 'n' && exports.language[2] === '-';
            }
            else {
                return false;
            }
        }
        Language.isDefaultVariant = isDefaultVariant;
        function isDefault() {
            return exports.language === 'en';
        }
        Language.isDefault = isDefault;
    })(Language = exports.Language || (exports.Language = {}));
    /**
     * The OS locale or the locale specified by --locale. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese). The UI is not necessarily shown in the provided locale.
     */
    exports.locale = _locale;
    /**
     * The translatios that are available through language packs.
     */
    exports.translationsConfigFile = _translationsConfigFile;
    exports.setImmediate = (function defineSetImmediate() {
        if (exports.globals.setImmediate) {
            return exports.globals.setImmediate.bind(exports.globals);
        }
        if (typeof exports.globals.postMessage === 'function' && !exports.globals.importScripts) {
            let pending = [];
            exports.globals.addEventListener('message', (e) => {
                if (e.data && e.data.vscodeSetImmediateId) {
                    for (let i = 0, len = pending.length; i < len; i++) {
                        const candidate = pending[i];
                        if (candidate.id === e.data.vscodeSetImmediateId) {
                            pending.splice(i, 1);
                            candidate.callback();
                            return;
                        }
                    }
                }
            });
            let lastId = 0;
            return (callback) => {
                const myId = ++lastId;
                pending.push({
                    id: myId,
                    callback: callback
                });
                exports.globals.postMessage({ vscodeSetImmediateId: myId }, '*');
            };
        }
        if (typeof (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.nextTick) === 'function') {
            return nodeProcess.nextTick.bind(nodeProcess);
        }
        const _promise = Promise.resolve();
        return (callback) => _promise.then(callback);
    })();
    var OperatingSystem;
    (function (OperatingSystem) {
        OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
        OperatingSystem[OperatingSystem["Macintosh"] = 2] = "Macintosh";
        OperatingSystem[OperatingSystem["Linux"] = 3] = "Linux";
    })(OperatingSystem = exports.OperatingSystem || (exports.OperatingSystem = {}));
    exports.OS = (_isMacintosh || _isIOS ? 2 /* Macintosh */ : (_isWindows ? 1 /* Windows */ : 3 /* Linux */));
    let _isLittleEndian = true;
    let _isLittleEndianComputed = false;
    function isLittleEndian() {
        if (!_isLittleEndianComputed) {
            _isLittleEndianComputed = true;
            const test = new Uint8Array(2);
            test[0] = 1;
            test[1] = 2;
            const view = new Uint16Array(test.buffer);
            _isLittleEndian = (view[0] === (2 << 8) + 1);
        }
        return _isLittleEndian;
    }
    exports.isLittleEndian = isLittleEndian;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[27/*vs/base/common/process*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/platform*/]), function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nextTick = exports.platform = exports.env = exports.cwd = void 0;
    let safeProcess;
    // Native sandbox environment
    if (typeof platform_1.globals.vscode !== 'undefined') {
        const sandboxProcess = platform_1.globals.vscode.process;
        safeProcess = {
            get platform() { return sandboxProcess.platform; },
            get env() { return sandboxProcess.env; },
            cwd() { return sandboxProcess.cwd(); },
            nextTick(callback) { return (0, platform_1.setImmediate)(callback); }
        };
    }
    // Native node.js environment
    else if (typeof process !== 'undefined') {
        safeProcess = {
            get platform() { return process.platform; },
            get env() { return process.env; },
            cwd() { return process.env['VSCODE_CWD'] || process.cwd(); },
            nextTick(callback) { return process.nextTick(callback); }
        };
    }
    // Web environment
    else {
        safeProcess = {
            // Supported
            get platform() { return platform_1.isWindows ? 'win32' : platform_1.isMacintosh ? 'darwin' : 'linux'; },
            nextTick(callback) { return (0, platform_1.setImmediate)(callback); },
            // Unsupported
            get env() { return Object.create(null); },
            cwd() { return '/'; }
        };
    }
    /**
     * Provides safe access to the `cwd` property in node.js, sandboxed or web
     * environments.
     *
     * Note: in web, this property is hardcoded to be `/`.
     */
    exports.cwd = safeProcess.cwd;
    /**
     * Provides safe access to the `env` property in node.js, sandboxed or web
     * environments.
     *
     * Note: in web, this property is hardcoded to be `{}`.
     */
    exports.env = safeProcess.env;
    /**
     * Provides safe access to the `platform` property in node.js, sandboxed or web
     * environments.
     */
    exports.platform = safeProcess.platform;
    /**
     * Provides safe access to the `nextTick` method in node.js, sandboxed or web
     * environments.
     */
    exports.nextTick = safeProcess.nextTick;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[5/*vs/base/common/path*/], __M([0/*require*/,1/*exports*/,27/*vs/base/common/process*/]), function (require, exports, process) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.delimiter = exports.sep = exports.toNamespacedPath = exports.parse = exports.format = exports.extname = exports.basename = exports.dirname = exports.relative = exports.resolve = exports.join = exports.isAbsolute = exports.normalize = exports.posix = exports.win32 = void 0;
    const CHAR_UPPERCASE_A = 65; /* A */
    const CHAR_LOWERCASE_A = 97; /* a */
    const CHAR_UPPERCASE_Z = 90; /* Z */
    const CHAR_LOWERCASE_Z = 122; /* z */
    const CHAR_DOT = 46; /* . */
    const CHAR_FORWARD_SLASH = 47; /* / */
    const CHAR_BACKWARD_SLASH = 92; /* \ */
    const CHAR_COLON = 58; /* : */
    const CHAR_QUESTION_MARK = 63; /* ? */
    class ErrorInvalidArgType extends Error {
        constructor(name, expected, actual) {
            // determiner: 'must be' or 'must not be'
            let determiner;
            if (typeof expected === 'string' && expected.indexOf('not ') === 0) {
                determiner = 'must not be';
                expected = expected.replace(/^not /, '');
            }
            else {
                determiner = 'must be';
            }
            const type = name.indexOf('.') !== -1 ? 'property' : 'argument';
            let msg = `The "${name}" ${type} ${determiner} of type ${expected}`;
            msg += `. Received type ${typeof actual}`;
            super(msg);
            this.code = 'ERR_INVALID_ARG_TYPE';
        }
    }
    function validateString(value, name) {
        if (typeof value !== 'string') {
            throw new ErrorInvalidArgType(name, 'string', value);
        }
    }
    function isPathSeparator(code) {
        return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    }
    function isPosixPathSeparator(code) {
        return code === CHAR_FORWARD_SLASH;
    }
    function isWindowsDeviceRoot(code) {
        return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z ||
            code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
    }
    // Resolves . and .. elements in a path with directory names
    function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
        let res = '';
        let lastSegmentLength = 0;
        let lastSlash = -1;
        let dots = 0;
        let code = 0;
        for (let i = 0; i <= path.length; ++i) {
            if (i < path.length) {
                code = path.charCodeAt(i);
            }
            else if (isPathSeparator(code)) {
                break;
            }
            else {
                code = CHAR_FORWARD_SLASH;
            }
            if (isPathSeparator(code)) {
                if (lastSlash === i - 1 || dots === 1) {
                    // NOOP
                }
                else if (dots === 2) {
                    if (res.length < 2 || lastSegmentLength !== 2 ||
                        res.charCodeAt(res.length - 1) !== CHAR_DOT ||
                        res.charCodeAt(res.length - 2) !== CHAR_DOT) {
                        if (res.length > 2) {
                            const lastSlashIndex = res.lastIndexOf(separator);
                            if (lastSlashIndex === -1) {
                                res = '';
                                lastSegmentLength = 0;
                            }
                            else {
                                res = res.slice(0, lastSlashIndex);
                                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                            }
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                        else if (res.length !== 0) {
                            res = '';
                            lastSegmentLength = 0;
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    if (allowAboveRoot) {
                        res += res.length > 0 ? `${separator}..` : '..';
                        lastSegmentLength = 2;
                    }
                }
                else {
                    if (res.length > 0) {
                        res += `${separator}${path.slice(lastSlash + 1, i)}`;
                    }
                    else {
                        res = path.slice(lastSlash + 1, i);
                    }
                    lastSegmentLength = i - lastSlash - 1;
                }
                lastSlash = i;
                dots = 0;
            }
            else if (code === CHAR_DOT && dots !== -1) {
                ++dots;
            }
            else {
                dots = -1;
            }
        }
        return res;
    }
    function _format(sep, pathObject) {
        if (pathObject === null || typeof pathObject !== 'object') {
            throw new ErrorInvalidArgType('pathObject', 'Object', pathObject);
        }
        const dir = pathObject.dir || pathObject.root;
        const base = pathObject.base ||
            `${pathObject.name || ''}${pathObject.ext || ''}`;
        if (!dir) {
            return base;
        }
        return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep}${base}`;
    }
    exports.win32 = {
        // path.resolve([from ...], to)
        resolve(...pathSegments) {
            let resolvedDevice = '';
            let resolvedTail = '';
            let resolvedAbsolute = false;
            for (let i = pathSegments.length - 1; i >= -1; i--) {
                let path;
                if (i >= 0) {
                    path = pathSegments[i];
                    validateString(path, 'path');
                    // Skip empty entries
                    if (path.length === 0) {
                        continue;
                    }
                }
                else if (resolvedDevice.length === 0) {
                    path = process.cwd();
                }
                else {
                    // Windows has the concept of drive-specific current working
                    // directories. If we've resolved a drive letter but not yet an
                    // absolute path, get cwd for that drive, or the process cwd if
                    // the drive cwd is not available. We're sure the device is not
                    // a UNC path at this points, because UNC paths are always absolute.
                    path = process.env[`=${resolvedDevice}`] || process.cwd();
                    // Verify that a cwd was found and that it actually points
                    // to our drive. If not, default to the drive's root.
                    if (path === undefined ||
                        path.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() &&
                            path.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
                        path = `${resolvedDevice}\\`;
                    }
                }
                const len = path.length;
                let rootEnd = 0;
                let device = '';
                let isAbsolute = false;
                const code = path.charCodeAt(0);
                // Try to match a root
                if (len === 1) {
                    if (isPathSeparator(code)) {
                        // `path` contains just a path separator
                        rootEnd = 1;
                        isAbsolute = true;
                    }
                }
                else if (isPathSeparator(code)) {
                    // Possible UNC root
                    // If we started with a separator, we know we at least have an
                    // absolute path of some kind (UNC or otherwise)
                    isAbsolute = true;
                    if (isPathSeparator(path.charCodeAt(1))) {
                        // Matched double path separator at beginning
                        let j = 2;
                        let last = j;
                        // Match 1 or more non-path separators
                        while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j < len && j !== last) {
                            const firstPart = path.slice(last, j);
                            // Matched!
                            last = j;
                            // Match 1 or more path separators
                            while (j < len && isPathSeparator(path.charCodeAt(j))) {
                                j++;
                            }
                            if (j < len && j !== last) {
                                // Matched!
                                last = j;
                                // Match 1 or more non-path separators
                                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                                    j++;
                                }
                                if (j === len || j !== last) {
                                    // We matched a UNC root
                                    device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                    rootEnd = j;
                                }
                            }
                        }
                    }
                    else {
                        rootEnd = 1;
                    }
                }
                else if (isWindowsDeviceRoot(code) &&
                    path.charCodeAt(1) === CHAR_COLON) {
                    // Possible device root
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
                        // Treat separator following drive name as an absolute path
                        // indicator
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
                if (device.length > 0) {
                    if (resolvedDevice.length > 0) {
                        if (device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                            // This path points to another device so it is not applicable
                            continue;
                        }
                    }
                    else {
                        resolvedDevice = device;
                    }
                }
                if (resolvedAbsolute) {
                    if (resolvedDevice.length > 0) {
                        break;
                    }
                }
                else {
                    resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
                    resolvedAbsolute = isAbsolute;
                    if (isAbsolute && resolvedDevice.length > 0) {
                        break;
                    }
                }
            }
            // At this point the path should be resolved to a full absolute path,
            // but handle relative paths to be safe (might happen when process.cwd()
            // fails)
            // Normalize the tail path
            resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, '\\', isPathSeparator);
            return resolvedAbsolute ?
                `${resolvedDevice}\\${resolvedTail}` :
                `${resolvedDevice}${resolvedTail}` || '.';
        },
        normalize(path) {
            validateString(path, 'path');
            const len = path.length;
            if (len === 0) {
                return '.';
            }
            let rootEnd = 0;
            let device;
            let isAbsolute = false;
            const code = path.charCodeAt(0);
            // Try to match a root
            if (len === 1) {
                // `path` contains just a single char, exit early to avoid
                // unnecessary work
                return isPosixPathSeparator(code) ? '\\' : path;
            }
            if (isPathSeparator(code)) {
                // Possible UNC root
                // If we started with a separator, we know we at least have an absolute
                // path of some kind (UNC or otherwise)
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    let j = 2;
                    let last = j;
                    // Match 1 or more non-path separators
                    while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                        j++;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        while (j < len && isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                                j++;
                            }
                            if (j === len) {
                                // We matched a UNC root only
                                // Return the normalized version of the UNC root since there
                                // is nothing left to process
                                return `\\\\${firstPart}\\${path.slice(last)}\\`;
                            }
                            if (j !== last) {
                                // We matched a UNC root with leftovers
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                }
                else {
                    rootEnd = 1;
                }
            }
            else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
                // Possible device root
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
                    // Treat separator following drive name as an absolute path
                    // indicator
                    isAbsolute = true;
                    rootEnd = 3;
                }
            }
            let tail = rootEnd < len ?
                normalizeString(path.slice(rootEnd), !isAbsolute, '\\', isPathSeparator) :
                '';
            if (tail.length === 0 && !isAbsolute) {
                tail = '.';
            }
            if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
                tail += '\\';
            }
            if (device === undefined) {
                return isAbsolute ? `\\${tail}` : tail;
            }
            return isAbsolute ? `${device}\\${tail}` : `${device}${tail}`;
        },
        isAbsolute(path) {
            validateString(path, 'path');
            const len = path.length;
            if (len === 0) {
                return false;
            }
            const code = path.charCodeAt(0);
            return isPathSeparator(code) ||
                // Possible device root
                len > 2 &&
                    isWindowsDeviceRoot(code) &&
                    path.charCodeAt(1) === CHAR_COLON &&
                    isPathSeparator(path.charCodeAt(2));
        },
        join(...paths) {
            if (paths.length === 0) {
                return '.';
            }
            let joined;
            let firstPart;
            for (let i = 0; i < paths.length; ++i) {
                const arg = paths[i];
                validateString(arg, 'path');
                if (arg.length > 0) {
                    if (joined === undefined) {
                        joined = firstPart = arg;
                    }
                    else {
                        joined += `\\${arg}`;
                    }
                }
            }
            if (joined === undefined) {
                return '.';
            }
            // Make sure that the joined path doesn't start with two slashes, because
            // normalize() will mistake it for an UNC path then.
            //
            // This step is skipped when it is very clear that the user actually
            // intended to point at an UNC path. This is assumed when the first
            // non-empty string arguments starts with exactly two slashes followed by
            // at least one more non-slash character.
            //
            // Note that for normalize() to treat a path as an UNC path it needs to
            // have at least 2 components, so we don't filter for that here.
            // This means that the user can use join to construct UNC paths from
            // a server name and a share name; for example:
            //   path.join('//server', 'share') -> '\\\\server\\share\\')
            let needsReplace = true;
            let slashCount = 0;
            if (typeof firstPart === 'string' && isPathSeparator(firstPart.charCodeAt(0))) {
                ++slashCount;
                const firstLen = firstPart.length;
                if (firstLen > 1 && isPathSeparator(firstPart.charCodeAt(1))) {
                    ++slashCount;
                    if (firstLen > 2) {
                        if (isPathSeparator(firstPart.charCodeAt(2))) {
                            ++slashCount;
                        }
                        else {
                            // We matched a UNC path in the first part
                            needsReplace = false;
                        }
                    }
                }
            }
            if (needsReplace) {
                // Find any more consecutive slashes we need to replace
                while (slashCount < joined.length &&
                    isPathSeparator(joined.charCodeAt(slashCount))) {
                    slashCount++;
                }
                // Replace the slashes if needed
                if (slashCount >= 2) {
                    joined = `\\${joined.slice(slashCount)}`;
                }
            }
            return exports.win32.normalize(joined);
        },
        // It will solve the relative path from `from` to `to`, for instance:
        //  from = 'C:\\orandea\\test\\aaa'
        //  to = 'C:\\orandea\\impl\\bbb'
        // The output of the function should be: '..\\..\\impl\\bbb'
        relative(from, to) {
            validateString(from, 'from');
            validateString(to, 'to');
            if (from === to) {
                return '';
            }
            const fromOrig = exports.win32.resolve(from);
            const toOrig = exports.win32.resolve(to);
            if (fromOrig === toOrig) {
                return '';
            }
            from = fromOrig.toLowerCase();
            to = toOrig.toLowerCase();
            if (from === to) {
                return '';
            }
            // Trim any leading backslashes
            let fromStart = 0;
            while (fromStart < from.length &&
                from.charCodeAt(fromStart) === CHAR_BACKWARD_SLASH) {
                fromStart++;
            }
            // Trim trailing backslashes (applicable to UNC paths only)
            let fromEnd = from.length;
            while (fromEnd - 1 > fromStart &&
                from.charCodeAt(fromEnd - 1) === CHAR_BACKWARD_SLASH) {
                fromEnd--;
            }
            const fromLen = fromEnd - fromStart;
            // Trim any leading backslashes
            let toStart = 0;
            while (toStart < to.length &&
                to.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
                toStart++;
            }
            // Trim trailing backslashes (applicable to UNC paths only)
            let toEnd = to.length;
            while (toEnd - 1 > toStart &&
                to.charCodeAt(toEnd - 1) === CHAR_BACKWARD_SLASH) {
                toEnd--;
            }
            const toLen = toEnd - toStart;
            // Compare paths to find the longest common path from root
            const length = fromLen < toLen ? fromLen : toLen;
            let lastCommonSep = -1;
            let i = 0;
            for (; i < length; i++) {
                const fromCode = from.charCodeAt(fromStart + i);
                if (fromCode !== to.charCodeAt(toStart + i)) {
                    break;
                }
                else if (fromCode === CHAR_BACKWARD_SLASH) {
                    lastCommonSep = i;
                }
            }
            // We found a mismatch before the first common path separator was seen, so
            // return the original `to`.
            if (i !== length) {
                if (lastCommonSep === -1) {
                    return toOrig;
                }
            }
            else {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
                        // We get here if `from` is the exact base path for `to`.
                        // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
                        return toOrig.slice(toStart + i + 1);
                    }
                    if (i === 2) {
                        // We get here if `from` is the device root.
                        // For example: from='C:\\'; to='C:\\foo'
                        return toOrig.slice(toStart + i);
                    }
                }
                if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
                        // We get here if `to` is the exact base path for `from`.
                        // For example: from='C:\\foo\\bar'; to='C:\\foo'
                        lastCommonSep = i;
                    }
                    else if (i === 2) {
                        // We get here if `to` is the device root.
                        // For example: from='C:\\foo\\bar'; to='C:\\'
                        lastCommonSep = 3;
                    }
                }
                if (lastCommonSep === -1) {
                    lastCommonSep = 0;
                }
            }
            let out = '';
            // Generate the relative path based on the path difference between `to` and
            // `from`
            for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
                if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
                    out += out.length === 0 ? '..' : '\\..';
                }
            }
            toStart += lastCommonSep;
            // Lastly, append the rest of the destination (`to`) path that comes after
            // the common path parts
            if (out.length > 0) {
                return `${out}${toOrig.slice(toStart, toEnd)}`;
            }
            if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
                ++toStart;
            }
            return toOrig.slice(toStart, toEnd);
        },
        toNamespacedPath(path) {
            // Note: this will *probably* throw somewhere.
            if (typeof path !== 'string') {
                return path;
            }
            if (path.length === 0) {
                return '';
            }
            const resolvedPath = exports.win32.resolve(path);
            if (resolvedPath.length <= 2) {
                return path;
            }
            if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
                // Possible UNC root
                if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
                    const code = resolvedPath.charCodeAt(2);
                    if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
                        // Matched non-long UNC root, convert the path to a long UNC path
                        return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                    }
                }
            }
            else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) &&
                resolvedPath.charCodeAt(1) === CHAR_COLON &&
                resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
                // Matched device root, convert the path to a long UNC path
                return `\\\\?\\${resolvedPath}`;
            }
            return path;
        },
        dirname(path) {
            validateString(path, 'path');
            const len = path.length;
            if (len === 0) {
                return '.';
            }
            let rootEnd = -1;
            let offset = 0;
            const code = path.charCodeAt(0);
            if (len === 1) {
                // `path` contains just a path separator, exit early to avoid
                // unnecessary work or a dot.
                return isPathSeparator(code) ? path : '.';
            }
            // Try to match a root
            if (isPathSeparator(code)) {
                // Possible UNC root
                rootEnd = offset = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    let j = 2;
                    let last = j;
                    // Match 1 or more non-path separators
                    while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                        j++;
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        while (j < len && isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                                j++;
                            }
                            if (j === len) {
                                // We matched a UNC root only
                                return path;
                            }
                            if (j !== last) {
                                // We matched a UNC root with leftovers
                                // Offset by 1 to include the separator after the UNC root to
                                // treat it as a "normal root" on top of a (UNC) root
                                rootEnd = offset = j + 1;
                            }
                        }
                    }
                }
                // Possible device root
            }
            else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
                rootEnd = len > 2 && isPathSeparator(path.charCodeAt(2)) ? 3 : 2;
                offset = rootEnd;
            }
            let end = -1;
            let matchedSlash = true;
            for (let i = len - 1; i >= offset; --i) {
                if (isPathSeparator(path.charCodeAt(i))) {
                    if (!matchedSlash) {
                        end = i;
                        break;
                    }
                }
                else {
                    // We saw the first non-path separator
                    matchedSlash = false;
                }
            }
            if (end === -1) {
                if (rootEnd === -1) {
                    return '.';
                }
                end = rootEnd;
            }
            return path.slice(0, end);
        },
        basename(path, ext) {
            if (ext !== undefined) {
                validateString(ext, 'ext');
            }
            validateString(path, 'path');
            let start = 0;
            let end = -1;
            let matchedSlash = true;
            let i;
            // Check for a drive letter prefix so as not to mistake the following
            // path separator as an extra separator at the end of the path that can be
            // disregarded
            if (path.length >= 2 &&
                isWindowsDeviceRoot(path.charCodeAt(0)) &&
                path.charCodeAt(1) === CHAR_COLON) {
                start = 2;
            }
            if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
                if (ext === path) {
                    return '';
                }
                let extIdx = ext.length - 1;
                let firstNonSlashEnd = -1;
                for (i = path.length - 1; i >= start; --i) {
                    const code = path.charCodeAt(i);
                    if (isPathSeparator(code)) {
                        // If we reached a path separator that was not part of a set of path
                        // separators at the end of the string, stop now
                        if (!matchedSlash) {
                            start = i + 1;
                            break;
                        }
                    }
                    else {
                        if (firstNonSlashEnd === -1) {
                            // We saw the first non-path separator, remember this index in case
                            // we need it if the extension ends up not matching
                            matchedSlash = false;
                            firstNonSlashEnd = i + 1;
                        }
                        if (extIdx >= 0) {
                            // Try to match the explicit extension
                            if (code === ext.charCodeAt(extIdx)) {
                                if (--extIdx === -1) {
                                    // We matched the extension, so mark this as the end of our path
                                    // component
                                    end = i;
                                }
                            }
                            else {
                                // Extension does not match, so our result is the entire path
                                // component
                                extIdx = -1;
                                end = firstNonSlashEnd;
                            }
                        }
                    }
                }
                if (start === end) {
                    end = firstNonSlashEnd;
                }
                else if (end === -1) {
                    end = path.length;
                }
                return path.slice(start, end);
            }
            for (i = path.length - 1; i >= start; --i) {
                if (isPathSeparator(path.charCodeAt(i))) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // path component
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) {
                return '';
            }
            return path.slice(start, end);
        },
        extname(path) {
            validateString(path, 'path');
            let start = 0;
            let startDot = -1;
            let startPart = 0;
            let end = -1;
            let matchedSlash = true;
            // Track the state of characters (if any) we see before our first dot and
            // after any path separator we find
            let preDotState = 0;
            // Check for a drive letter prefix so as not to mistake the following
            // path separator as an extra separator at the end of the path that can be
            // disregarded
            if (path.length >= 2 &&
                path.charCodeAt(1) === CHAR_COLON &&
                isWindowsDeviceRoot(path.charCodeAt(0))) {
                start = startPart = 2;
            }
            for (let i = path.length - 1; i >= start; --i) {
                const code = path.charCodeAt(i);
                if (isPathSeparator(code)) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        startPart = i + 1;
                        break;
                    }
                    continue;
                }
                if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // extension
                    matchedSlash = false;
                    end = i + 1;
                }
                if (code === CHAR_DOT) {
                    // If this is our first dot, mark it as the start of our extension
                    if (startDot === -1) {
                        startDot = i;
                    }
                    else if (preDotState !== 1) {
                        preDotState = 1;
                    }
                }
                else if (startDot !== -1) {
                    // We saw a non-dot and non-path separator before our dot, so we should
                    // have a good chance at having a non-empty extension
                    preDotState = -1;
                }
            }
            if (startDot === -1 ||
                end === -1 ||
                // We saw a non-dot character immediately before the dot
                preDotState === 0 ||
                // The (right-most) trimmed path component is exactly '..'
                (preDotState === 1 &&
                    startDot === end - 1 &&
                    startDot === startPart + 1)) {
                return '';
            }
            return path.slice(startDot, end);
        },
        format: _format.bind(null, '\\'),
        parse(path) {
            validateString(path, 'path');
            const ret = { root: '', dir: '', base: '', ext: '', name: '' };
            if (path.length === 0) {
                return ret;
            }
            const len = path.length;
            let rootEnd = 0;
            let code = path.charCodeAt(0);
            if (len === 1) {
                if (isPathSeparator(code)) {
                    // `path` contains just a path separator, exit early to avoid
                    // unnecessary work
                    ret.root = ret.dir = path;
                    return ret;
                }
                ret.base = ret.name = path;
                return ret;
            }
            // Try to match a root
            if (isPathSeparator(code)) {
                // Possible UNC root
                rootEnd = 1;
                if (isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    let j = 2;
                    let last = j;
                    // Match 1 or more non-path separators
                    while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                        j++;
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        while (j < len && isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                                j++;
                            }
                            if (j === len) {
                                // We matched a UNC root only
                                rootEnd = j;
                            }
                            else if (j !== last) {
                                // We matched a UNC root with leftovers
                                rootEnd = j + 1;
                            }
                        }
                    }
                }
            }
            else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
                // Possible device root
                if (len <= 2) {
                    // `path` contains just a drive root, exit early to avoid
                    // unnecessary work
                    ret.root = ret.dir = path;
                    return ret;
                }
                rootEnd = 2;
                if (isPathSeparator(path.charCodeAt(2))) {
                    if (len === 3) {
                        // `path` contains just a drive root, exit early to avoid
                        // unnecessary work
                        ret.root = ret.dir = path;
                        return ret;
                    }
                    rootEnd = 3;
                }
            }
            if (rootEnd > 0) {
                ret.root = path.slice(0, rootEnd);
            }
            let startDot = -1;
            let startPart = rootEnd;
            let end = -1;
            let matchedSlash = true;
            let i = path.length - 1;
            // Track the state of characters (if any) we see before our first dot and
            // after any path separator we find
            let preDotState = 0;
            // Get non-dir info
            for (; i >= rootEnd; --i) {
                code = path.charCodeAt(i);
                if (isPathSeparator(code)) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        startPart = i + 1;
                        break;
                    }
                    continue;
                }
                if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // extension
                    matchedSlash = false;
                    end = i + 1;
                }
                if (code === CHAR_DOT) {
                    // If this is our first dot, mark it as the start of our extension
                    if (startDot === -1) {
                        startDot = i;
                    }
                    else if (preDotState !== 1) {
                        preDotState = 1;
                    }
                }
                else if (startDot !== -1) {
                    // We saw a non-dot and non-path separator before our dot, so we should
                    // have a good chance at having a non-empty extension
                    preDotState = -1;
                }
            }
            if (end !== -1) {
                if (startDot === -1 ||
                    // We saw a non-dot character immediately before the dot
                    preDotState === 0 ||
                    // The (right-most) trimmed path component is exactly '..'
                    (preDotState === 1 &&
                        startDot === end - 1 &&
                        startDot === startPart + 1)) {
                    ret.base = ret.name = path.slice(startPart, end);
                }
                else {
                    ret.name = path.slice(startPart, startDot);
                    ret.base = path.slice(startPart, end);
                    ret.ext = path.slice(startDot, end);
                }
            }
            // If the directory is the root, use the entire root as the `dir` including
            // the trailing slash if any (`C:\abc` -> `C:\`). Otherwise, strip out the
            // trailing slash (`C:\abc\def` -> `C:\abc`).
            if (startPart > 0 && startPart !== rootEnd) {
                ret.dir = path.slice(0, startPart - 1);
            }
            else {
                ret.dir = ret.root;
            }
            return ret;
        },
        sep: '\\',
        delimiter: ';',
        win32: null,
        posix: null
    };
    exports.posix = {
        // path.resolve([from ...], to)
        resolve(...pathSegments) {
            let resolvedPath = '';
            let resolvedAbsolute = false;
            for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                const path = i >= 0 ? pathSegments[i] : process.cwd();
                validateString(path, 'path');
                // Skip empty entries
                if (path.length === 0) {
                    continue;
                }
                resolvedPath = `${path}/${resolvedPath}`;
                resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
            }
            // At this point the path should be resolved to a full absolute path, but
            // handle relative paths to be safe (might happen when process.cwd() fails)
            // Normalize the path
            resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, '/', isPosixPathSeparator);
            if (resolvedAbsolute) {
                return `/${resolvedPath}`;
            }
            return resolvedPath.length > 0 ? resolvedPath : '.';
        },
        normalize(path) {
            validateString(path, 'path');
            if (path.length === 0) {
                return '.';
            }
            const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
            const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
            // Normalize the path
            path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);
            if (path.length === 0) {
                if (isAbsolute) {
                    return '/';
                }
                return trailingSeparator ? './' : '.';
            }
            if (trailingSeparator) {
                path += '/';
            }
            return isAbsolute ? `/${path}` : path;
        },
        isAbsolute(path) {
            validateString(path, 'path');
            return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        },
        join(...paths) {
            if (paths.length === 0) {
                return '.';
            }
            let joined;
            for (let i = 0; i < paths.length; ++i) {
                const arg = paths[i];
                validateString(arg, 'path');
                if (arg.length > 0) {
                    if (joined === undefined) {
                        joined = arg;
                    }
                    else {
                        joined += `/${arg}`;
                    }
                }
            }
            if (joined === undefined) {
                return '.';
            }
            return exports.posix.normalize(joined);
        },
        relative(from, to) {
            validateString(from, 'from');
            validateString(to, 'to');
            if (from === to) {
                return '';
            }
            // Trim leading forward slashes.
            from = exports.posix.resolve(from);
            to = exports.posix.resolve(to);
            if (from === to) {
                return '';
            }
            const fromStart = 1;
            const fromEnd = from.length;
            const fromLen = fromEnd - fromStart;
            const toStart = 1;
            const toLen = to.length - toStart;
            // Compare paths to find the longest common path from root
            const length = (fromLen < toLen ? fromLen : toLen);
            let lastCommonSep = -1;
            let i = 0;
            for (; i < length; i++) {
                const fromCode = from.charCodeAt(fromStart + i);
                if (fromCode !== to.charCodeAt(toStart + i)) {
                    break;
                }
                else if (fromCode === CHAR_FORWARD_SLASH) {
                    lastCommonSep = i;
                }
            }
            if (i === length) {
                if (toLen > length) {
                    if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
                        // We get here if `from` is the exact base path for `to`.
                        // For example: from='/foo/bar'; to='/foo/bar/baz'
                        return to.slice(toStart + i + 1);
                    }
                    if (i === 0) {
                        // We get here if `from` is the root
                        // For example: from='/'; to='/foo'
                        return to.slice(toStart + i);
                    }
                }
                else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
                        // We get here if `to` is the exact base path for `from`.
                        // For example: from='/foo/bar/baz'; to='/foo/bar'
                        lastCommonSep = i;
                    }
                    else if (i === 0) {
                        // We get here if `to` is the root.
                        // For example: from='/foo/bar'; to='/'
                        lastCommonSep = 0;
                    }
                }
            }
            let out = '';
            // Generate the relative path based on the path difference between `to`
            // and `from`.
            for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
                if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
                    out += out.length === 0 ? '..' : '/..';
                }
            }
            // Lastly, append the rest of the destination (`to`) path that comes after
            // the common path parts.
            return `${out}${to.slice(toStart + lastCommonSep)}`;
        },
        toNamespacedPath(path) {
            // Non-op on posix systems
            return path;
        },
        dirname(path) {
            validateString(path, 'path');
            if (path.length === 0) {
                return '.';
            }
            const hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
            let end = -1;
            let matchedSlash = true;
            for (let i = path.length - 1; i >= 1; --i) {
                if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
                    if (!matchedSlash) {
                        end = i;
                        break;
                    }
                }
                else {
                    // We saw the first non-path separator
                    matchedSlash = false;
                }
            }
            if (end === -1) {
                return hasRoot ? '/' : '.';
            }
            if (hasRoot && end === 1) {
                return '//';
            }
            return path.slice(0, end);
        },
        basename(path, ext) {
            if (ext !== undefined) {
                validateString(ext, 'ext');
            }
            validateString(path, 'path');
            let start = 0;
            let end = -1;
            let matchedSlash = true;
            let i;
            if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
                if (ext === path) {
                    return '';
                }
                let extIdx = ext.length - 1;
                let firstNonSlashEnd = -1;
                for (i = path.length - 1; i >= 0; --i) {
                    const code = path.charCodeAt(i);
                    if (code === CHAR_FORWARD_SLASH) {
                        // If we reached a path separator that was not part of a set of path
                        // separators at the end of the string, stop now
                        if (!matchedSlash) {
                            start = i + 1;
                            break;
                        }
                    }
                    else {
                        if (firstNonSlashEnd === -1) {
                            // We saw the first non-path separator, remember this index in case
                            // we need it if the extension ends up not matching
                            matchedSlash = false;
                            firstNonSlashEnd = i + 1;
                        }
                        if (extIdx >= 0) {
                            // Try to match the explicit extension
                            if (code === ext.charCodeAt(extIdx)) {
                                if (--extIdx === -1) {
                                    // We matched the extension, so mark this as the end of our path
                                    // component
                                    end = i;
                                }
                            }
                            else {
                                // Extension does not match, so our result is the entire path
                                // component
                                extIdx = -1;
                                end = firstNonSlashEnd;
                            }
                        }
                    }
                }
                if (start === end) {
                    end = firstNonSlashEnd;
                }
                else if (end === -1) {
                    end = path.length;
                }
                return path.slice(start, end);
            }
            for (i = path.length - 1; i >= 0; --i) {
                if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // path component
                    matchedSlash = false;
                    end = i + 1;
                }
            }
            if (end === -1) {
                return '';
            }
            return path.slice(start, end);
        },
        extname(path) {
            validateString(path, 'path');
            let startDot = -1;
            let startPart = 0;
            let end = -1;
            let matchedSlash = true;
            // Track the state of characters (if any) we see before our first dot and
            // after any path separator we find
            let preDotState = 0;
            for (let i = path.length - 1; i >= 0; --i) {
                const code = path.charCodeAt(i);
                if (code === CHAR_FORWARD_SLASH) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        startPart = i + 1;
                        break;
                    }
                    continue;
                }
                if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // extension
                    matchedSlash = false;
                    end = i + 1;
                }
                if (code === CHAR_DOT) {
                    // If this is our first dot, mark it as the start of our extension
                    if (startDot === -1) {
                        startDot = i;
                    }
                    else if (preDotState !== 1) {
                        preDotState = 1;
                    }
                }
                else if (startDot !== -1) {
                    // We saw a non-dot and non-path separator before our dot, so we should
                    // have a good chance at having a non-empty extension
                    preDotState = -1;
                }
            }
            if (startDot === -1 ||
                end === -1 ||
                // We saw a non-dot character immediately before the dot
                preDotState === 0 ||
                // The (right-most) trimmed path component is exactly '..'
                (preDotState === 1 &&
                    startDot === end - 1 &&
                    startDot === startPart + 1)) {
                return '';
            }
            return path.slice(startDot, end);
        },
        format: _format.bind(null, '/'),
        parse(path) {
            validateString(path, 'path');
            const ret = { root: '', dir: '', base: '', ext: '', name: '' };
            if (path.length === 0) {
                return ret;
            }
            const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
            let start;
            if (isAbsolute) {
                ret.root = '/';
                start = 1;
            }
            else {
                start = 0;
            }
            let startDot = -1;
            let startPart = 0;
            let end = -1;
            let matchedSlash = true;
            let i = path.length - 1;
            // Track the state of characters (if any) we see before our first dot and
            // after any path separator we find
            let preDotState = 0;
            // Get non-dir info
            for (; i >= start; --i) {
                const code = path.charCodeAt(i);
                if (code === CHAR_FORWARD_SLASH) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        startPart = i + 1;
                        break;
                    }
                    continue;
                }
                if (end === -1) {
                    // We saw the first non-path separator, mark this as the end of our
                    // extension
                    matchedSlash = false;
                    end = i + 1;
                }
                if (code === CHAR_DOT) {
                    // If this is our first dot, mark it as the start of our extension
                    if (startDot === -1) {
                        startDot = i;
                    }
                    else if (preDotState !== 1) {
                        preDotState = 1;
                    }
                }
                else if (startDot !== -1) {
                    // We saw a non-dot and non-path separator before our dot, so we should
                    // have a good chance at having a non-empty extension
                    preDotState = -1;
                }
            }
            if (end !== -1) {
                const start = startPart === 0 && isAbsolute ? 1 : startPart;
                if (startDot === -1 ||
                    // We saw a non-dot character immediately before the dot
                    preDotState === 0 ||
                    // The (right-most) trimmed path component is exactly '..'
                    (preDotState === 1 &&
                        startDot === end - 1 &&
                        startDot === startPart + 1)) {
                    ret.base = ret.name = path.slice(start, end);
                }
                else {
                    ret.name = path.slice(start, startDot);
                    ret.base = path.slice(start, end);
                    ret.ext = path.slice(startDot, end);
                }
            }
            if (startPart > 0) {
                ret.dir = path.slice(0, startPart - 1);
            }
            else if (isAbsolute) {
                ret.dir = '/';
            }
            return ret;
        },
        sep: '/',
        delimiter: ':',
        win32: null,
        posix: null
    };
    exports.posix.win32 = exports.win32.win32 = exports.win32;
    exports.posix.posix = exports.win32.posix = exports.posix;
    exports.normalize = (process.platform === 'win32' ? exports.win32.normalize : exports.posix.normalize);
    exports.isAbsolute = (process.platform === 'win32' ? exports.win32.isAbsolute : exports.posix.isAbsolute);
    exports.join = (process.platform === 'win32' ? exports.win32.join : exports.posix.join);
    exports.resolve = (process.platform === 'win32' ? exports.win32.resolve : exports.posix.resolve);
    exports.relative = (process.platform === 'win32' ? exports.win32.relative : exports.posix.relative);
    exports.dirname = (process.platform === 'win32' ? exports.win32.dirname : exports.posix.dirname);
    exports.basename = (process.platform === 'win32' ? exports.win32.basename : exports.posix.basename);
    exports.extname = (process.platform === 'win32' ? exports.win32.extname : exports.posix.extname);
    exports.format = (process.platform === 'win32' ? exports.win32.format : exports.posix.format);
    exports.parse = (process.platform === 'win32' ? exports.win32.parse : exports.posix.parse);
    exports.toNamespacedPath = (process.platform === 'win32' ? exports.win32.toNamespacedPath : exports.posix.toNamespacedPath);
    exports.sep = (process.platform === 'win32' ? exports.win32.sep : exports.posix.sep);
    exports.delimiter = (process.platform === 'win32' ? exports.win32.delimiter : exports.posix.delimiter);
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[28/*vs/base/common/stopwatch*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/platform*/]), function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StopWatch = void 0;
    const hasPerformanceNow = (platform_1.globals.performance && typeof platform_1.globals.performance.now === 'function');
    class StopWatch {
        constructor(highResolution) {
            this._highResolution = hasPerformanceNow && highResolution;
            this._startTime = this._now();
            this._stopTime = -1;
        }
        static create(highResolution = true) {
            return new StopWatch(highResolution);
        }
        stop() {
            this._stopTime = this._now();
        }
        elapsed() {
            if (this._stopTime !== -1) {
                return this._stopTime - this._startTime;
            }
            return this._now() - this._startTime;
        }
        _now() {
            return this._highResolution ? platform_1.globals.performance.now() : Date.now();
        }
    }
    exports.StopWatch = StopWatch;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[6/*vs/base/common/event*/], __M([0/*require*/,1/*exports*/,9/*vs/base/common/errors*/,14/*vs/base/common/functional*/,4/*vs/base/common/lifecycle*/,15/*vs/base/common/linkedList*/,28/*vs/base/common/stopwatch*/]), function (require, exports, errors_1, functional_1, lifecycle_1, linkedList_1, stopwatch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Relay = exports.EventBufferer = exports.EventMultiplexer = exports.PauseableEmitter = exports.Emitter = exports.setGlobalLeakWarningThreshold = exports.Event = void 0;
    var Event;
    (function (Event) {
        Event.None = () => lifecycle_1.Disposable.None;
        /**
         * Given an event, returns another event which only fires once.
         */
        function once(event) {
            return (listener, thisArgs = null, disposables) => {
                // we need this, in case the event fires during the listener call
                let didFire = false;
                let result;
                result = event(e => {
                    if (didFire) {
                        return;
                    }
                    else if (result) {
                        result.dispose();
                    }
                    else {
                        didFire = true;
                    }
                    return listener.call(thisArgs, e);
                }, null, disposables);
                if (didFire) {
                    result.dispose();
                }
                return result;
            };
        }
        Event.once = once;
        /**
         * Given an event and a `map` function, returns another event which maps each element
         * through the mapping function.
         */
        function map(event, map) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables));
        }
        Event.map = map;
        /**
         * Given an event and an `each` function, returns another identical event and calls
         * the `each` function per each element.
         */
        function forEach(event, each) {
            return snapshot((listener, thisArgs = null, disposables) => event(i => { each(i); listener.call(thisArgs, i); }, null, disposables));
        }
        Event.forEach = forEach;
        function filter(event, filter) {
            return snapshot((listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables));
        }
        Event.filter = filter;
        /**
         * Given an event, returns the same event but typed as `Event<void>`.
         */
        function signal(event) {
            return event;
        }
        Event.signal = signal;
        function any(...events) {
            return (listener, thisArgs = null, disposables) => (0, lifecycle_1.combinedDisposable)(...events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
        }
        Event.any = any;
        /**
         * Given an event and a `merge` function, returns another event which maps each element
         * and the cumulative result through the `merge` function. Similar to `map`, but with memory.
         */
        function reduce(event, merge, initial) {
            let output = initial;
            return map(event, e => {
                output = merge(output, e);
                return output;
            });
        }
        Event.reduce = reduce;
        /**
         * Given a chain of event processing functions (filter, map, etc), each
         * function will be invoked per event & per listener. Snapshotting an event
         * chain allows each function to be invoked just once per event.
         */
        function snapshot(event) {
            let listener;
            const emitter = new Emitter({
                onFirstListenerAdd() {
                    listener = event(emitter.fire, emitter);
                },
                onLastListenerRemove() {
                    listener.dispose();
                }
            });
            return emitter.event;
        }
        Event.snapshot = snapshot;
        function debounce(event, merge, delay = 100, leading = false, leakWarningThreshold) {
            let subscription;
            let output = undefined;
            let handle = undefined;
            let numDebouncedCalls = 0;
            const emitter = new Emitter({
                leakWarningThreshold,
                onFirstListenerAdd() {
                    subscription = event(cur => {
                        numDebouncedCalls++;
                        output = merge(output, cur);
                        if (leading && !handle) {
                            emitter.fire(output);
                            output = undefined;
                        }
                        clearTimeout(handle);
                        handle = setTimeout(() => {
                            const _output = output;
                            output = undefined;
                            handle = undefined;
                            if (!leading || numDebouncedCalls > 1) {
                                emitter.fire(_output);
                            }
                            numDebouncedCalls = 0;
                        }, delay);
                    });
                },
                onLastListenerRemove() {
                    subscription.dispose();
                }
            });
            return emitter.event;
        }
        Event.debounce = debounce;
        /**
         * Given an event, it returns another event which fires only once and as soon as
         * the input event emits. The event data is the number of millis it took for the
         * event to fire.
         */
        function stopwatch(event) {
            const start = new Date().getTime();
            return map(once(event), _ => new Date().getTime() - start);
        }
        Event.stopwatch = stopwatch;
        /**
         * Given an event, it returns another event which fires only when the event
         * element changes.
         */
        function latch(event) {
            let firstCall = true;
            let cache;
            return filter(event, value => {
                const shouldEmit = firstCall || value !== cache;
                firstCall = false;
                cache = value;
                return shouldEmit;
            });
        }
        Event.latch = latch;
        /**
         * Buffers the provided event until a first listener comes
         * along, at which point fire all the events at once and
         * pipe the event from then on.
         *
         * ```typescript
         * const emitter = new Emitter<number>();
         * const event = emitter.event;
         * const bufferedEvent = buffer(event);
         *
         * emitter.fire(1);
         * emitter.fire(2);
         * emitter.fire(3);
         * // nothing...
         *
         * const listener = bufferedEvent(num => console.log(num));
         * // 1, 2, 3
         *
         * emitter.fire(4);
         * // 4
         * ```
         */
        function buffer(event, nextTick = false, _buffer = []) {
            let buffer = _buffer.slice();
            let listener = event(e => {
                if (buffer) {
                    buffer.push(e);
                }
                else {
                    emitter.fire(e);
                }
            });
            const flush = () => {
                if (buffer) {
                    buffer.forEach(e => emitter.fire(e));
                }
                buffer = null;
            };
            const emitter = new Emitter({
                onFirstListenerAdd() {
                    if (!listener) {
                        listener = event(e => emitter.fire(e));
                    }
                },
                onFirstListenerDidAdd() {
                    if (buffer) {
                        if (nextTick) {
                            setTimeout(flush);
                        }
                        else {
                            flush();
                        }
                    }
                },
                onLastListenerRemove() {
                    if (listener) {
                        listener.dispose();
                    }
                    listener = null;
                }
            });
            return emitter.event;
        }
        Event.buffer = buffer;
        class ChainableEvent {
            constructor(event) {
                this.event = event;
            }
            map(fn) {
                return new ChainableEvent(map(this.event, fn));
            }
            forEach(fn) {
                return new ChainableEvent(forEach(this.event, fn));
            }
            filter(fn) {
                return new ChainableEvent(filter(this.event, fn));
            }
            reduce(merge, initial) {
                return new ChainableEvent(reduce(this.event, merge, initial));
            }
            latch() {
                return new ChainableEvent(latch(this.event));
            }
            debounce(merge, delay = 100, leading = false, leakWarningThreshold) {
                return new ChainableEvent(debounce(this.event, merge, delay, leading, leakWarningThreshold));
            }
            on(listener, thisArgs, disposables) {
                return this.event(listener, thisArgs, disposables);
            }
            once(listener, thisArgs, disposables) {
                return once(this.event)(listener, thisArgs, disposables);
            }
        }
        function chain(event) {
            return new ChainableEvent(event);
        }
        Event.chain = chain;
        function fromNodeEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.on(eventName, fn);
            const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
            const result = new Emitter({ onFirstListenerAdd, onLastListenerRemove });
            return result.event;
        }
        Event.fromNodeEventEmitter = fromNodeEventEmitter;
        function fromDOMEventEmitter(emitter, eventName, map = id => id) {
            const fn = (...args) => result.fire(map(...args));
            const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
            const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
            const result = new Emitter({ onFirstListenerAdd, onLastListenerRemove });
            return result.event;
        }
        Event.fromDOMEventEmitter = fromDOMEventEmitter;
        function fromPromise(promise) {
            const emitter = new Emitter();
            let shouldEmit = false;
            promise
                .then(undefined, () => null)
                .then(() => {
                if (!shouldEmit) {
                    setTimeout(() => emitter.fire(undefined), 0);
                }
                else {
                    emitter.fire(undefined);
                }
            });
            shouldEmit = true;
            return emitter.event;
        }
        Event.fromPromise = fromPromise;
        function toPromise(event) {
            return new Promise(resolve => once(event)(resolve));
        }
        Event.toPromise = toPromise;
    })(Event = exports.Event || (exports.Event = {}));
    class EventProfiling {
        constructor(name) {
            this._listenerCount = 0;
            this._invocationCount = 0;
            this._elapsedOverall = 0;
            this._name = `${name}_${EventProfiling._idPool++}`;
        }
        start(listenerCount) {
            this._stopWatch = new stopwatch_1.StopWatch(true);
            this._listenerCount = listenerCount;
        }
        stop() {
            if (this._stopWatch) {
                const elapsed = this._stopWatch.elapsed();
                this._elapsedOverall += elapsed;
                this._invocationCount += 1;
                console.info(`did FIRE ${this._name}: elapsed_ms: ${elapsed.toFixed(5)}, listener: ${this._listenerCount} (elapsed_overall: ${this._elapsedOverall.toFixed(2)}, invocations: ${this._invocationCount})`);
                this._stopWatch = undefined;
            }
        }
    }
    EventProfiling._idPool = 0;
    let _globalLeakWarningThreshold = -1;
    function setGlobalLeakWarningThreshold(n) {
        const oldValue = _globalLeakWarningThreshold;
        _globalLeakWarningThreshold = n;
        return {
            dispose() {
                _globalLeakWarningThreshold = oldValue;
            }
        };
    }
    exports.setGlobalLeakWarningThreshold = setGlobalLeakWarningThreshold;
    class LeakageMonitor {
        constructor(customThreshold, name = Math.random().toString(18).slice(2, 5)) {
            this.customThreshold = customThreshold;
            this.name = name;
            this._warnCountdown = 0;
        }
        dispose() {
            if (this._stacks) {
                this._stacks.clear();
            }
        }
        check(listenerCount) {
            let threshold = _globalLeakWarningThreshold;
            if (typeof this.customThreshold === 'number') {
                threshold = this.customThreshold;
            }
            if (threshold <= 0 || listenerCount < threshold) {
                return undefined;
            }
            if (!this._stacks) {
                this._stacks = new Map();
            }
            const stack = new Error().stack.split('\n').slice(3).join('\n');
            const count = (this._stacks.get(stack) || 0);
            this._stacks.set(stack, count + 1);
            this._warnCountdown -= 1;
            if (this._warnCountdown <= 0) {
                // only warn on first exceed and then every time the limit
                // is exceeded by 50% again
                this._warnCountdown = threshold * 0.5;
                // find most frequent listener and print warning
                let topStack;
                let topCount = 0;
                for (const [stack, count] of this._stacks) {
                    if (!topStack || topCount < count) {
                        topStack = stack;
                        topCount = count;
                    }
                }
                console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
                console.warn(topStack);
            }
            return () => {
                const count = (this._stacks.get(stack) || 0);
                this._stacks.set(stack, count - 1);
            };
        }
    }
    /**
     * The Emitter can be used to expose an Event to the public
     * to fire it from the insides.
     * Sample:
        class Document {
    
            private readonly _onDidChange = new Emitter<(value:string)=>any>();
    
            public onDidChange = this._onDidChange.event;
    
            // getter-style
            // get onDidChange(): Event<(value:string)=>any> {
            // 	return this._onDidChange.event;
            // }
    
            private _doIt() {
                //...
                this._onDidChange.fire(value);
            }
        }
     */
    class Emitter {
        constructor(options) {
            var _a;
            this._disposed = false;
            this._options = options;
            this._leakageMon = _globalLeakWarningThreshold > 0 ? new LeakageMonitor(this._options && this._options.leakWarningThreshold) : undefined;
            this._perfMon = ((_a = this._options) === null || _a === void 0 ? void 0 : _a._profName) ? new EventProfiling(this._options._profName) : undefined;
        }
        /**
         * For the public to allow to subscribe
         * to events from this Emitter
         */
        get event() {
            if (!this._event) {
                this._event = (listener, thisArgs, disposables) => {
                    var _a;
                    if (!this._listeners) {
                        this._listeners = new linkedList_1.LinkedList();
                    }
                    const firstListener = this._listeners.isEmpty();
                    if (firstListener && this._options && this._options.onFirstListenerAdd) {
                        this._options.onFirstListenerAdd(this);
                    }
                    const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
                    if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
                        this._options.onFirstListenerDidAdd(this);
                    }
                    if (this._options && this._options.onListenerDidAdd) {
                        this._options.onListenerDidAdd(this, listener, thisArgs);
                    }
                    // check and record this emitter for potential leakage
                    const removeMonitor = (_a = this._leakageMon) === null || _a === void 0 ? void 0 : _a.check(this._listeners.size);
                    let result;
                    result = {
                        dispose: () => {
                            if (removeMonitor) {
                                removeMonitor();
                            }
                            result.dispose = Emitter._noop;
                            if (!this._disposed) {
                                remove();
                                if (this._options && this._options.onLastListenerRemove) {
                                    const hasListeners = (this._listeners && !this._listeners.isEmpty());
                                    if (!hasListeners) {
                                        this._options.onLastListenerRemove(this);
                                    }
                                }
                            }
                        }
                    };
                    if (disposables instanceof lifecycle_1.DisposableStore) {
                        disposables.add(result);
                    }
                    else if (Array.isArray(disposables)) {
                        disposables.push(result);
                    }
                    return result;
                };
            }
            return this._event;
        }
        /**
         * To be kept private to fire an event to
         * subscribers
         */
        fire(event) {
            var _a, _b;
            if (this._listeners) {
                // put all [listener,event]-pairs into delivery queue
                // then emit all event. an inner/nested event might be
                // the driver of this
                if (!this._deliveryQueue) {
                    this._deliveryQueue = new linkedList_1.LinkedList();
                }
                for (let listener of this._listeners) {
                    this._deliveryQueue.push([listener, event]);
                }
                // start/stop performance insight collection
                (_a = this._perfMon) === null || _a === void 0 ? void 0 : _a.start(this._deliveryQueue.size);
                while (this._deliveryQueue.size > 0) {
                    const [listener, event] = this._deliveryQueue.shift();
                    try {
                        if (typeof listener === 'function') {
                            listener.call(undefined, event);
                        }
                        else {
                            listener[0].call(listener[1], event);
                        }
                    }
                    catch (e) {
                        (0, errors_1.onUnexpectedError)(e);
                    }
                }
                (_b = this._perfMon) === null || _b === void 0 ? void 0 : _b.stop();
            }
        }
        dispose() {
            var _a, _b, _c;
            (_a = this._listeners) === null || _a === void 0 ? void 0 : _a.clear();
            (_b = this._deliveryQueue) === null || _b === void 0 ? void 0 : _b.clear();
            (_c = this._leakageMon) === null || _c === void 0 ? void 0 : _c.dispose();
            this._disposed = true;
        }
    }
    exports.Emitter = Emitter;
    Emitter._noop = function () { };
    class PauseableEmitter extends Emitter {
        constructor(options) {
            super(options);
            this._isPaused = 0;
            this._eventQueue = new linkedList_1.LinkedList();
            this._mergeFn = options === null || options === void 0 ? void 0 : options.merge;
        }
        pause() {
            this._isPaused++;
        }
        resume() {
            if (this._isPaused !== 0 && --this._isPaused === 0) {
                if (this._mergeFn) {
                    // use the merge function to create a single composite
                    // event. make a copy in case firing pauses this emitter
                    const events = Array.from(this._eventQueue);
                    this._eventQueue.clear();
                    super.fire(this._mergeFn(events));
                }
                else {
                    // no merging, fire each event individually and test
                    // that this emitter isn't paused halfway through
                    while (!this._isPaused && this._eventQueue.size !== 0) {
                        super.fire(this._eventQueue.shift());
                    }
                }
            }
        }
        fire(event) {
            if (this._listeners) {
                if (this._isPaused !== 0) {
                    this._eventQueue.push(event);
                }
                else {
                    super.fire(event);
                }
            }
        }
    }
    exports.PauseableEmitter = PauseableEmitter;
    class EventMultiplexer {
        constructor() {
            this.hasListeners = false;
            this.events = [];
            this.emitter = new Emitter({
                onFirstListenerAdd: () => this.onFirstListenerAdd(),
                onLastListenerRemove: () => this.onLastListenerRemove()
            });
        }
        get event() {
            return this.emitter.event;
        }
        add(event) {
            const e = { event: event, listener: null };
            this.events.push(e);
            if (this.hasListeners) {
                this.hook(e);
            }
            const dispose = () => {
                if (this.hasListeners) {
                    this.unhook(e);
                }
                const idx = this.events.indexOf(e);
                this.events.splice(idx, 1);
            };
            return (0, lifecycle_1.toDisposable)((0, functional_1.once)(dispose));
        }
        onFirstListenerAdd() {
            this.hasListeners = true;
            this.events.forEach(e => this.hook(e));
        }
        onLastListenerRemove() {
            this.hasListeners = false;
            this.events.forEach(e => this.unhook(e));
        }
        hook(e) {
            e.listener = e.event(r => this.emitter.fire(r));
        }
        unhook(e) {
            if (e.listener) {
                e.listener.dispose();
            }
            e.listener = null;
        }
        dispose() {
            this.emitter.dispose();
        }
    }
    exports.EventMultiplexer = EventMultiplexer;
    /**
     * The EventBufferer is useful in situations in which you want
     * to delay firing your events during some code.
     * You can wrap that code and be sure that the event will not
     * be fired during that wrap.
     *
     * ```
     * const emitter: Emitter;
     * const delayer = new EventDelayer();
     * const delayedEvent = delayer.wrapEvent(emitter.event);
     *
     * delayedEvent(console.log);
     *
     * delayer.bufferEvents(() => {
     *   emitter.fire(); // event will not be fired yet
     * });
     *
     * // event will only be fired at this point
     * ```
     */
    class EventBufferer {
        constructor() {
            this.buffers = [];
        }
        wrapEvent(event) {
            return (listener, thisArgs, disposables) => {
                return event(i => {
                    const buffer = this.buffers[this.buffers.length - 1];
                    if (buffer) {
                        buffer.push(() => listener.call(thisArgs, i));
                    }
                    else {
                        listener.call(thisArgs, i);
                    }
                }, undefined, disposables);
            };
        }
        bufferEvents(fn) {
            const buffer = [];
            this.buffers.push(buffer);
            const r = fn();
            this.buffers.pop();
            buffer.forEach(flush => flush());
            return r;
        }
    }
    exports.EventBufferer = EventBufferer;
    /**
     * A Relay is an event forwarder which functions as a replugabble event pipe.
     * Once created, you can connect an input event to it and it will simply forward
     * events from that input event through its own `event` property. The `input`
     * can be changed at any point in time.
     */
    class Relay {
        constructor() {
            this.listening = false;
            this.inputEvent = Event.None;
            this.inputEventListener = lifecycle_1.Disposable.None;
            this.emitter = new Emitter({
                onFirstListenerDidAdd: () => {
                    this.listening = true;
                    this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
                },
                onLastListenerRemove: () => {
                    this.listening = false;
                    this.inputEventListener.dispose();
                }
            });
            this.event = this.emitter.event;
        }
        set input(event) {
            this.inputEvent = event;
            if (this.listening) {
                this.inputEventListener.dispose();
                this.inputEventListener = event(this.emitter.fire, this.emitter);
            }
        }
        dispose() {
            this.inputEventListener.dispose();
            this.emitter.dispose();
        }
    }
    exports.Relay = Relay;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[29/*vs/base/common/cancellation*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/event*/]), function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CancellationTokenSource = exports.CancellationToken = void 0;
    const shortcutEvent = Object.freeze(function (callback, context) {
        const handle = setTimeout(callback.bind(context), 0);
        return { dispose() { clearTimeout(handle); } };
    });
    var CancellationToken;
    (function (CancellationToken) {
        function isCancellationToken(thing) {
            if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
                return true;
            }
            if (thing instanceof MutableToken) {
                return true;
            }
            if (!thing || typeof thing !== 'object') {
                return false;
            }
            return typeof thing.isCancellationRequested === 'boolean'
                && typeof thing.onCancellationRequested === 'function';
        }
        CancellationToken.isCancellationToken = isCancellationToken;
        CancellationToken.None = Object.freeze({
            isCancellationRequested: false,
            onCancellationRequested: event_1.Event.None
        });
        CancellationToken.Cancelled = Object.freeze({
            isCancellationRequested: true,
            onCancellationRequested: shortcutEvent
        });
    })(CancellationToken = exports.CancellationToken || (exports.CancellationToken = {}));
    class MutableToken {
        constructor() {
            this._isCancelled = false;
            this._emitter = null;
        }
        cancel() {
            if (!this._isCancelled) {
                this._isCancelled = true;
                if (this._emitter) {
                    this._emitter.fire(undefined);
                    this.dispose();
                }
            }
        }
        get isCancellationRequested() {
            return this._isCancelled;
        }
        get onCancellationRequested() {
            if (this._isCancelled) {
                return shortcutEvent;
            }
            if (!this._emitter) {
                this._emitter = new event_1.Emitter();
            }
            return this._emitter.event;
        }
        dispose() {
            if (this._emitter) {
                this._emitter.dispose();
                this._emitter = null;
            }
        }
    }
    class CancellationTokenSource {
        constructor(parent) {
            this._token = undefined;
            this._parentListener = undefined;
            this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
        }
        get token() {
            if (!this._token) {
                // be lazy and create the token only when
                // actually needed
                this._token = new MutableToken();
            }
            return this._token;
        }
        cancel() {
            if (!this._token) {
                // save an object by returning the default
                // cancelled token when cancellation happens
                // before someone asks for the token
                this._token = CancellationToken.Cancelled;
            }
            else if (this._token instanceof MutableToken) {
                // actually cancel
                this._token.cancel();
            }
        }
        dispose(cancel = false) {
            if (cancel) {
                this.cancel();
            }
            if (this._parentListener) {
                this._parentListener.dispose();
            }
            if (!this._token) {
                // ensure to initialize with an empty token if we had none
                this._token = CancellationToken.None;
            }
            else if (this._token instanceof MutableToken) {
                // actually dispose
                this._token.dispose();
            }
        }
    }
    exports.CancellationTokenSource = CancellationTokenSource;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[30/*vs/base/common/codicons*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/event*/]), function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CSSIcon = exports.getClassNamesArray = exports.Codicon = exports.getCodiconAriaLabel = exports.registerCodicon = exports.iconRegistry = void 0;
    class Registry {
        constructor() {
            this._icons = new Map();
            this._onDidRegister = new event_1.Emitter();
        }
        add(icon) {
            const existing = this._icons.get(icon.id);
            if (!existing) {
                this._icons.set(icon.id, icon);
                this._onDidRegister.fire(icon);
            }
            else if (icon.description) {
                existing.description = icon.description;
            }
            else {
                console.error(`Duplicate registration of codicon ${icon.id}`);
            }
        }
        get(id) {
            return this._icons.get(id);
        }
        get all() {
            return this._icons.values();
        }
        get onDidRegister() {
            return this._onDidRegister.event;
        }
    }
    const _registry = new Registry();
    exports.iconRegistry = _registry;
    function registerCodicon(id, def) {
        return new Codicon(id, def);
    }
    exports.registerCodicon = registerCodicon;
    // Selects all codicon names encapsulated in the `$()` syntax and wraps the
    // results with spaces so that screen readers can read the text better.
    function getCodiconAriaLabel(text) {
        if (!text) {
            return '';
        }
        return text.replace(/\$\((.*?)\)/g, (_match, codiconName) => ` ${codiconName} `).trim();
    }
    exports.getCodiconAriaLabel = getCodiconAriaLabel;
    class Codicon {
        constructor(id, definition, description) {
            this.id = id;
            this.definition = definition;
            this.description = description;
            _registry.add(this);
        }
        get classNames() { return 'codicon codicon-' + this.id; }
        // classNamesArray is useful for migrating to ES6 classlist
        get classNamesArray() { return ['codicon', 'codicon-' + this.id]; }
        get cssSelector() { return '.codicon.codicon-' + this.id; }
    }
    exports.Codicon = Codicon;
    function getClassNamesArray(id, modifier) {
        const classNames = ['codicon', 'codicon-' + id];
        if (modifier) {
            classNames.push('codicon-modifier-' + modifier);
        }
        return classNames;
    }
    exports.getClassNamesArray = getClassNamesArray;
    var CSSIcon;
    (function (CSSIcon) {
        CSSIcon.iconNameSegment = '[A-Za-z0-9]+';
        CSSIcon.iconNameExpression = '[A-Za-z0-9\\-]+';
        CSSIcon.iconModifierExpression = '~[A-Za-z]+';
        const cssIconIdRegex = new RegExp(`^(${CSSIcon.iconNameExpression})(${CSSIcon.iconModifierExpression})?$`);
        function asClassNameArray(icon) {
            if (icon instanceof Codicon) {
                return ['codicon', 'codicon-' + icon.id];
            }
            const match = cssIconIdRegex.exec(icon.id);
            if (!match) {
                return asClassNameArray(Codicon.error);
            }
            let [, id, modifier] = match;
            const classNames = ['codicon', 'codicon-' + id];
            if (modifier) {
                classNames.push('codicon-modifier-' + modifier.substr(1));
            }
            return classNames;
        }
        CSSIcon.asClassNameArray = asClassNameArray;
        function asClassName(icon) {
            return asClassNameArray(icon).join(' ');
        }
        CSSIcon.asClassName = asClassName;
        function asCSSSelector(icon) {
            return '.' + asClassNameArray(icon).join('.');
        }
        CSSIcon.asCSSSelector = asCSSSelector;
    })(CSSIcon = exports.CSSIcon || (exports.CSSIcon = {}));
    (function (Codicon) {
        // built-in icons, with image name
        Codicon.add = new Codicon('add', { fontCharacter: '\\ea60' });
        Codicon.plus = new Codicon('plus', { fontCharacter: '\\ea60' });
        Codicon.gistNew = new Codicon('gist-new', { fontCharacter: '\\ea60' });
        Codicon.repoCreate = new Codicon('repo-create', { fontCharacter: '\\ea60' });
        Codicon.lightbulb = new Codicon('lightbulb', { fontCharacter: '\\ea61' });
        Codicon.lightBulb = new Codicon('light-bulb', { fontCharacter: '\\ea61' });
        Codicon.repo = new Codicon('repo', { fontCharacter: '\\ea62' });
        Codicon.repoDelete = new Codicon('repo-delete', { fontCharacter: '\\ea62' });
        Codicon.gistFork = new Codicon('gist-fork', { fontCharacter: '\\ea63' });
        Codicon.repoForked = new Codicon('repo-forked', { fontCharacter: '\\ea63' });
        Codicon.gitPullRequest = new Codicon('git-pull-request', { fontCharacter: '\\ea64' });
        Codicon.gitPullRequestAbandoned = new Codicon('git-pull-request-abandoned', { fontCharacter: '\\ea64' });
        Codicon.recordKeys = new Codicon('record-keys', { fontCharacter: '\\ea65' });
        Codicon.keyboard = new Codicon('keyboard', { fontCharacter: '\\ea65' });
        Codicon.tag = new Codicon('tag', { fontCharacter: '\\ea66' });
        Codicon.tagAdd = new Codicon('tag-add', { fontCharacter: '\\ea66' });
        Codicon.tagRemove = new Codicon('tag-remove', { fontCharacter: '\\ea66' });
        Codicon.person = new Codicon('person', { fontCharacter: '\\ea67' });
        Codicon.personFollow = new Codicon('person-follow', { fontCharacter: '\\ea67' });
        Codicon.personOutline = new Codicon('person-outline', { fontCharacter: '\\ea67' });
        Codicon.personFilled = new Codicon('person-filled', { fontCharacter: '\\ea67' });
        Codicon.gitBranch = new Codicon('git-branch', { fontCharacter: '\\ea68' });
        Codicon.gitBranchCreate = new Codicon('git-branch-create', { fontCharacter: '\\ea68' });
        Codicon.gitBranchDelete = new Codicon('git-branch-delete', { fontCharacter: '\\ea68' });
        Codicon.sourceControl = new Codicon('source-control', { fontCharacter: '\\ea68' });
        Codicon.mirror = new Codicon('mirror', { fontCharacter: '\\ea69' });
        Codicon.mirrorPublic = new Codicon('mirror-public', { fontCharacter: '\\ea69' });
        Codicon.star = new Codicon('star', { fontCharacter: '\\ea6a' });
        Codicon.starAdd = new Codicon('star-add', { fontCharacter: '\\ea6a' });
        Codicon.starDelete = new Codicon('star-delete', { fontCharacter: '\\ea6a' });
        Codicon.starEmpty = new Codicon('star-empty', { fontCharacter: '\\ea6a' });
        Codicon.comment = new Codicon('comment', { fontCharacter: '\\ea6b' });
        Codicon.commentAdd = new Codicon('comment-add', { fontCharacter: '\\ea6b' });
        Codicon.alert = new Codicon('alert', { fontCharacter: '\\ea6c' });
        Codicon.warning = new Codicon('warning', { fontCharacter: '\\ea6c' });
        Codicon.search = new Codicon('search', { fontCharacter: '\\ea6d' });
        Codicon.searchSave = new Codicon('search-save', { fontCharacter: '\\ea6d' });
        Codicon.logOut = new Codicon('log-out', { fontCharacter: '\\ea6e' });
        Codicon.signOut = new Codicon('sign-out', { fontCharacter: '\\ea6e' });
        Codicon.logIn = new Codicon('log-in', { fontCharacter: '\\ea6f' });
        Codicon.signIn = new Codicon('sign-in', { fontCharacter: '\\ea6f' });
        Codicon.eye = new Codicon('eye', { fontCharacter: '\\ea70' });
        Codicon.eyeUnwatch = new Codicon('eye-unwatch', { fontCharacter: '\\ea70' });
        Codicon.eyeWatch = new Codicon('eye-watch', { fontCharacter: '\\ea70' });
        Codicon.circleFilled = new Codicon('circle-filled', { fontCharacter: '\\ea71' });
        Codicon.primitiveDot = new Codicon('primitive-dot', { fontCharacter: '\\ea71' });
        Codicon.closeDirty = new Codicon('close-dirty', { fontCharacter: '\\ea71' });
        Codicon.debugBreakpoint = new Codicon('debug-breakpoint', { fontCharacter: '\\ea71' });
        Codicon.debugBreakpointDisabled = new Codicon('debug-breakpoint-disabled', { fontCharacter: '\\ea71' });
        Codicon.debugHint = new Codicon('debug-hint', { fontCharacter: '\\ea71' });
        Codicon.primitiveSquare = new Codicon('primitive-square', { fontCharacter: '\\ea72' });
        Codicon.edit = new Codicon('edit', { fontCharacter: '\\ea73' });
        Codicon.pencil = new Codicon('pencil', { fontCharacter: '\\ea73' });
        Codicon.info = new Codicon('info', { fontCharacter: '\\ea74' });
        Codicon.issueOpened = new Codicon('issue-opened', { fontCharacter: '\\ea74' });
        Codicon.gistPrivate = new Codicon('gist-private', { fontCharacter: '\\ea75' });
        Codicon.gitForkPrivate = new Codicon('git-fork-private', { fontCharacter: '\\ea75' });
        Codicon.lock = new Codicon('lock', { fontCharacter: '\\ea75' });
        Codicon.mirrorPrivate = new Codicon('mirror-private', { fontCharacter: '\\ea75' });
        Codicon.close = new Codicon('close', { fontCharacter: '\\ea76' });
        Codicon.removeClose = new Codicon('remove-close', { fontCharacter: '\\ea76' });
        Codicon.x = new Codicon('x', { fontCharacter: '\\ea76' });
        Codicon.repoSync = new Codicon('repo-sync', { fontCharacter: '\\ea77' });
        Codicon.sync = new Codicon('sync', { fontCharacter: '\\ea77' });
        Codicon.clone = new Codicon('clone', { fontCharacter: '\\ea78' });
        Codicon.desktopDownload = new Codicon('desktop-download', { fontCharacter: '\\ea78' });
        Codicon.beaker = new Codicon('beaker', { fontCharacter: '\\ea79' });
        Codicon.microscope = new Codicon('microscope', { fontCharacter: '\\ea79' });
        Codicon.vm = new Codicon('vm', { fontCharacter: '\\ea7a' });
        Codicon.deviceDesktop = new Codicon('device-desktop', { fontCharacter: '\\ea7a' });
        Codicon.file = new Codicon('file', { fontCharacter: '\\ea7b' });
        Codicon.fileText = new Codicon('file-text', { fontCharacter: '\\ea7b' });
        Codicon.more = new Codicon('more', { fontCharacter: '\\ea7c' });
        Codicon.ellipsis = new Codicon('ellipsis', { fontCharacter: '\\ea7c' });
        Codicon.kebabHorizontal = new Codicon('kebab-horizontal', { fontCharacter: '\\ea7c' });
        Codicon.mailReply = new Codicon('mail-reply', { fontCharacter: '\\ea7d' });
        Codicon.reply = new Codicon('reply', { fontCharacter: '\\ea7d' });
        Codicon.organization = new Codicon('organization', { fontCharacter: '\\ea7e' });
        Codicon.organizationFilled = new Codicon('organization-filled', { fontCharacter: '\\ea7e' });
        Codicon.organizationOutline = new Codicon('organization-outline', { fontCharacter: '\\ea7e' });
        Codicon.newFile = new Codicon('new-file', { fontCharacter: '\\ea7f' });
        Codicon.fileAdd = new Codicon('file-add', { fontCharacter: '\\ea7f' });
        Codicon.newFolder = new Codicon('new-folder', { fontCharacter: '\\ea80' });
        Codicon.fileDirectoryCreate = new Codicon('file-directory-create', { fontCharacter: '\\ea80' });
        Codicon.trash = new Codicon('trash', { fontCharacter: '\\ea81' });
        Codicon.trashcan = new Codicon('trashcan', { fontCharacter: '\\ea81' });
        Codicon.history = new Codicon('history', { fontCharacter: '\\ea82' });
        Codicon.clock = new Codicon('clock', { fontCharacter: '\\ea82' });
        Codicon.folder = new Codicon('folder', { fontCharacter: '\\ea83' });
        Codicon.fileDirectory = new Codicon('file-directory', { fontCharacter: '\\ea83' });
        Codicon.symbolFolder = new Codicon('symbol-folder', { fontCharacter: '\\ea83' });
        Codicon.logoGithub = new Codicon('logo-github', { fontCharacter: '\\ea84' });
        Codicon.markGithub = new Codicon('mark-github', { fontCharacter: '\\ea84' });
        Codicon.github = new Codicon('github', { fontCharacter: '\\ea84' });
        Codicon.terminal = new Codicon('terminal', { fontCharacter: '\\ea85' });
        Codicon.console = new Codicon('console', { fontCharacter: '\\ea85' });
        Codicon.repl = new Codicon('repl', { fontCharacter: '\\ea85' });
        Codicon.zap = new Codicon('zap', { fontCharacter: '\\ea86' });
        Codicon.symbolEvent = new Codicon('symbol-event', { fontCharacter: '\\ea86' });
        Codicon.error = new Codicon('error', { fontCharacter: '\\ea87' });
        Codicon.stop = new Codicon('stop', { fontCharacter: '\\ea87' });
        Codicon.variable = new Codicon('variable', { fontCharacter: '\\ea88' });
        Codicon.symbolVariable = new Codicon('symbol-variable', { fontCharacter: '\\ea88' });
        Codicon.array = new Codicon('array', { fontCharacter: '\\ea8a' });
        Codicon.symbolArray = new Codicon('symbol-array', { fontCharacter: '\\ea8a' });
        Codicon.symbolModule = new Codicon('symbol-module', { fontCharacter: '\\ea8b' });
        Codicon.symbolPackage = new Codicon('symbol-package', { fontCharacter: '\\ea8b' });
        Codicon.symbolNamespace = new Codicon('symbol-namespace', { fontCharacter: '\\ea8b' });
        Codicon.symbolObject = new Codicon('symbol-object', { fontCharacter: '\\ea8b' });
        Codicon.symbolMethod = new Codicon('symbol-method', { fontCharacter: '\\ea8c' });
        Codicon.symbolFunction = new Codicon('symbol-function', { fontCharacter: '\\ea8c' });
        Codicon.symbolConstructor = new Codicon('symbol-constructor', { fontCharacter: '\\ea8c' });
        Codicon.symbolBoolean = new Codicon('symbol-boolean', { fontCharacter: '\\ea8f' });
        Codicon.symbolNull = new Codicon('symbol-null', { fontCharacter: '\\ea8f' });
        Codicon.symbolNumeric = new Codicon('symbol-numeric', { fontCharacter: '\\ea90' });
        Codicon.symbolNumber = new Codicon('symbol-number', { fontCharacter: '\\ea90' });
        Codicon.symbolStructure = new Codicon('symbol-structure', { fontCharacter: '\\ea91' });
        Codicon.symbolStruct = new Codicon('symbol-struct', { fontCharacter: '\\ea91' });
        Codicon.symbolParameter = new Codicon('symbol-parameter', { fontCharacter: '\\ea92' });
        Codicon.symbolTypeParameter = new Codicon('symbol-type-parameter', { fontCharacter: '\\ea92' });
        Codicon.symbolKey = new Codicon('symbol-key', { fontCharacter: '\\ea93' });
        Codicon.symbolText = new Codicon('symbol-text', { fontCharacter: '\\ea93' });
        Codicon.symbolReference = new Codicon('symbol-reference', { fontCharacter: '\\ea94' });
        Codicon.goToFile = new Codicon('go-to-file', { fontCharacter: '\\ea94' });
        Codicon.symbolEnum = new Codicon('symbol-enum', { fontCharacter: '\\ea95' });
        Codicon.symbolValue = new Codicon('symbol-value', { fontCharacter: '\\ea95' });
        Codicon.symbolRuler = new Codicon('symbol-ruler', { fontCharacter: '\\ea96' });
        Codicon.symbolUnit = new Codicon('symbol-unit', { fontCharacter: '\\ea96' });
        Codicon.activateBreakpoints = new Codicon('activate-breakpoints', { fontCharacter: '\\ea97' });
        Codicon.archive = new Codicon('archive', { fontCharacter: '\\ea98' });
        Codicon.arrowBoth = new Codicon('arrow-both', { fontCharacter: '\\ea99' });
        Codicon.arrowDown = new Codicon('arrow-down', { fontCharacter: '\\ea9a' });
        Codicon.arrowLeft = new Codicon('arrow-left', { fontCharacter: '\\ea9b' });
        Codicon.arrowRight = new Codicon('arrow-right', { fontCharacter: '\\ea9c' });
        Codicon.arrowSmallDown = new Codicon('arrow-small-down', { fontCharacter: '\\ea9d' });
        Codicon.arrowSmallLeft = new Codicon('arrow-small-left', { fontCharacter: '\\ea9e' });
        Codicon.arrowSmallRight = new Codicon('arrow-small-right', { fontCharacter: '\\ea9f' });
        Codicon.arrowSmallUp = new Codicon('arrow-small-up', { fontCharacter: '\\eaa0' });
        Codicon.arrowUp = new Codicon('arrow-up', { fontCharacter: '\\eaa1' });
        Codicon.bell = new Codicon('bell', { fontCharacter: '\\eaa2' });
        Codicon.bold = new Codicon('bold', { fontCharacter: '\\eaa3' });
        Codicon.book = new Codicon('book', { fontCharacter: '\\eaa4' });
        Codicon.bookmark = new Codicon('bookmark', { fontCharacter: '\\eaa5' });
        Codicon.debugBreakpointConditionalUnverified = new Codicon('debug-breakpoint-conditional-unverified', { fontCharacter: '\\eaa6' });
        Codicon.debugBreakpointConditional = new Codicon('debug-breakpoint-conditional', { fontCharacter: '\\eaa7' });
        Codicon.debugBreakpointConditionalDisabled = new Codicon('debug-breakpoint-conditional-disabled', { fontCharacter: '\\eaa7' });
        Codicon.debugBreakpointDataUnverified = new Codicon('debug-breakpoint-data-unverified', { fontCharacter: '\\eaa8' });
        Codicon.debugBreakpointData = new Codicon('debug-breakpoint-data', { fontCharacter: '\\eaa9' });
        Codicon.debugBreakpointDataDisabled = new Codicon('debug-breakpoint-data-disabled', { fontCharacter: '\\eaa9' });
        Codicon.debugBreakpointLogUnverified = new Codicon('debug-breakpoint-log-unverified', { fontCharacter: '\\eaaa' });
        Codicon.debugBreakpointLog = new Codicon('debug-breakpoint-log', { fontCharacter: '\\eaab' });
        Codicon.debugBreakpointLogDisabled = new Codicon('debug-breakpoint-log-disabled', { fontCharacter: '\\eaab' });
        Codicon.briefcase = new Codicon('briefcase', { fontCharacter: '\\eaac' });
        Codicon.broadcast = new Codicon('broadcast', { fontCharacter: '\\eaad' });
        Codicon.browser = new Codicon('browser', { fontCharacter: '\\eaae' });
        Codicon.bug = new Codicon('bug', { fontCharacter: '\\eaaf' });
        Codicon.calendar = new Codicon('calendar', { fontCharacter: '\\eab0' });
        Codicon.caseSensitive = new Codicon('case-sensitive', { fontCharacter: '\\eab1' });
        Codicon.check = new Codicon('check', { fontCharacter: '\\eab2' });
        Codicon.checklist = new Codicon('checklist', { fontCharacter: '\\eab3' });
        Codicon.chevronDown = new Codicon('chevron-down', { fontCharacter: '\\eab4' });
        Codicon.chevronLeft = new Codicon('chevron-left', { fontCharacter: '\\eab5' });
        Codicon.chevronRight = new Codicon('chevron-right', { fontCharacter: '\\eab6' });
        Codicon.chevronUp = new Codicon('chevron-up', { fontCharacter: '\\eab7' });
        Codicon.chromeClose = new Codicon('chrome-close', { fontCharacter: '\\eab8' });
        Codicon.chromeMaximize = new Codicon('chrome-maximize', { fontCharacter: '\\eab9' });
        Codicon.chromeMinimize = new Codicon('chrome-minimize', { fontCharacter: '\\eaba' });
        Codicon.chromeRestore = new Codicon('chrome-restore', { fontCharacter: '\\eabb' });
        Codicon.circleOutline = new Codicon('circle-outline', { fontCharacter: '\\eabc' });
        Codicon.debugBreakpointUnverified = new Codicon('debug-breakpoint-unverified', { fontCharacter: '\\eabc' });
        Codicon.circleSlash = new Codicon('circle-slash', { fontCharacter: '\\eabd' });
        Codicon.circuitBoard = new Codicon('circuit-board', { fontCharacter: '\\eabe' });
        Codicon.clearAll = new Codicon('clear-all', { fontCharacter: '\\eabf' });
        Codicon.clippy = new Codicon('clippy', { fontCharacter: '\\eac0' });
        Codicon.closeAll = new Codicon('close-all', { fontCharacter: '\\eac1' });
        Codicon.cloudDownload = new Codicon('cloud-download', { fontCharacter: '\\eac2' });
        Codicon.cloudUpload = new Codicon('cloud-upload', { fontCharacter: '\\eac3' });
        Codicon.code = new Codicon('code', { fontCharacter: '\\eac4' });
        Codicon.collapseAll = new Codicon('collapse-all', { fontCharacter: '\\eac5' });
        Codicon.colorMode = new Codicon('color-mode', { fontCharacter: '\\eac6' });
        Codicon.commentDiscussion = new Codicon('comment-discussion', { fontCharacter: '\\eac7' });
        Codicon.compareChanges = new Codicon('compare-changes', { fontCharacter: '\\eafd' });
        Codicon.creditCard = new Codicon('credit-card', { fontCharacter: '\\eac9' });
        Codicon.dash = new Codicon('dash', { fontCharacter: '\\eacc' });
        Codicon.dashboard = new Codicon('dashboard', { fontCharacter: '\\eacd' });
        Codicon.database = new Codicon('database', { fontCharacter: '\\eace' });
        Codicon.debugContinue = new Codicon('debug-continue', { fontCharacter: '\\eacf' });
        Codicon.debugDisconnect = new Codicon('debug-disconnect', { fontCharacter: '\\ead0' });
        Codicon.debugPause = new Codicon('debug-pause', { fontCharacter: '\\ead1' });
        Codicon.debugRestart = new Codicon('debug-restart', { fontCharacter: '\\ead2' });
        Codicon.debugStart = new Codicon('debug-start', { fontCharacter: '\\ead3' });
        Codicon.debugStepInto = new Codicon('debug-step-into', { fontCharacter: '\\ead4' });
        Codicon.debugStepOut = new Codicon('debug-step-out', { fontCharacter: '\\ead5' });
        Codicon.debugStepOver = new Codicon('debug-step-over', { fontCharacter: '\\ead6' });
        Codicon.debugStop = new Codicon('debug-stop', { fontCharacter: '\\ead7' });
        Codicon.debug = new Codicon('debug', { fontCharacter: '\\ead8' });
        Codicon.deviceCameraVideo = new Codicon('device-camera-video', { fontCharacter: '\\ead9' });
        Codicon.deviceCamera = new Codicon('device-camera', { fontCharacter: '\\eada' });
        Codicon.deviceMobile = new Codicon('device-mobile', { fontCharacter: '\\eadb' });
        Codicon.diffAdded = new Codicon('diff-added', { fontCharacter: '\\eadc' });
        Codicon.diffIgnored = new Codicon('diff-ignored', { fontCharacter: '\\eadd' });
        Codicon.diffModified = new Codicon('diff-modified', { fontCharacter: '\\eade' });
        Codicon.diffRemoved = new Codicon('diff-removed', { fontCharacter: '\\eadf' });
        Codicon.diffRenamed = new Codicon('diff-renamed', { fontCharacter: '\\eae0' });
        Codicon.diff = new Codicon('diff', { fontCharacter: '\\eae1' });
        Codicon.discard = new Codicon('discard', { fontCharacter: '\\eae2' });
        Codicon.editorLayout = new Codicon('editor-layout', { fontCharacter: '\\eae3' });
        Codicon.emptyWindow = new Codicon('empty-window', { fontCharacter: '\\eae4' });
        Codicon.exclude = new Codicon('exclude', { fontCharacter: '\\eae5' });
        Codicon.extensions = new Codicon('extensions', { fontCharacter: '\\eae6' });
        Codicon.eyeClosed = new Codicon('eye-closed', { fontCharacter: '\\eae7' });
        Codicon.fileBinary = new Codicon('file-binary', { fontCharacter: '\\eae8' });
        Codicon.fileCode = new Codicon('file-code', { fontCharacter: '\\eae9' });
        Codicon.fileMedia = new Codicon('file-media', { fontCharacter: '\\eaea' });
        Codicon.filePdf = new Codicon('file-pdf', { fontCharacter: '\\eaeb' });
        Codicon.fileSubmodule = new Codicon('file-submodule', { fontCharacter: '\\eaec' });
        Codicon.fileSymlinkDirectory = new Codicon('file-symlink-directory', { fontCharacter: '\\eaed' });
        Codicon.fileSymlinkFile = new Codicon('file-symlink-file', { fontCharacter: '\\eaee' });
        Codicon.fileZip = new Codicon('file-zip', { fontCharacter: '\\eaef' });
        Codicon.files = new Codicon('files', { fontCharacter: '\\eaf0' });
        Codicon.filter = new Codicon('filter', { fontCharacter: '\\eaf1' });
        Codicon.flame = new Codicon('flame', { fontCharacter: '\\eaf2' });
        Codicon.foldDown = new Codicon('fold-down', { fontCharacter: '\\eaf3' });
        Codicon.foldUp = new Codicon('fold-up', { fontCharacter: '\\eaf4' });
        Codicon.fold = new Codicon('fold', { fontCharacter: '\\eaf5' });
        Codicon.folderActive = new Codicon('folder-active', { fontCharacter: '\\eaf6' });
        Codicon.folderOpened = new Codicon('folder-opened', { fontCharacter: '\\eaf7' });
        Codicon.gear = new Codicon('gear', { fontCharacter: '\\eaf8' });
        Codicon.gift = new Codicon('gift', { fontCharacter: '\\eaf9' });
        Codicon.gistSecret = new Codicon('gist-secret', { fontCharacter: '\\eafa' });
        Codicon.gist = new Codicon('gist', { fontCharacter: '\\eafb' });
        Codicon.gitCommit = new Codicon('git-commit', { fontCharacter: '\\eafc' });
        Codicon.gitCompare = new Codicon('git-compare', { fontCharacter: '\\eafd' });
        Codicon.gitMerge = new Codicon('git-merge', { fontCharacter: '\\eafe' });
        Codicon.githubAction = new Codicon('github-action', { fontCharacter: '\\eaff' });
        Codicon.githubAlt = new Codicon('github-alt', { fontCharacter: '\\eb00' });
        Codicon.globe = new Codicon('globe', { fontCharacter: '\\eb01' });
        Codicon.grabber = new Codicon('grabber', { fontCharacter: '\\eb02' });
        Codicon.graph = new Codicon('graph', { fontCharacter: '\\eb03' });
        Codicon.gripper = new Codicon('gripper', { fontCharacter: '\\eb04' });
        Codicon.heart = new Codicon('heart', { fontCharacter: '\\eb05' });
        Codicon.home = new Codicon('home', { fontCharacter: '\\eb06' });
        Codicon.horizontalRule = new Codicon('horizontal-rule', { fontCharacter: '\\eb07' });
        Codicon.hubot = new Codicon('hubot', { fontCharacter: '\\eb08' });
        Codicon.inbox = new Codicon('inbox', { fontCharacter: '\\eb09' });
        Codicon.issueClosed = new Codicon('issue-closed', { fontCharacter: '\\eb0a' });
        Codicon.issueReopened = new Codicon('issue-reopened', { fontCharacter: '\\eb0b' });
        Codicon.issues = new Codicon('issues', { fontCharacter: '\\eb0c' });
        Codicon.italic = new Codicon('italic', { fontCharacter: '\\eb0d' });
        Codicon.jersey = new Codicon('jersey', { fontCharacter: '\\eb0e' });
        Codicon.json = new Codicon('json', { fontCharacter: '\\eb0f' });
        Codicon.kebabVertical = new Codicon('kebab-vertical', { fontCharacter: '\\eb10' });
        Codicon.key = new Codicon('key', { fontCharacter: '\\eb11' });
        Codicon.law = new Codicon('law', { fontCharacter: '\\eb12' });
        Codicon.lightbulbAutofix = new Codicon('lightbulb-autofix', { fontCharacter: '\\eb13' });
        Codicon.linkExternal = new Codicon('link-external', { fontCharacter: '\\eb14' });
        Codicon.link = new Codicon('link', { fontCharacter: '\\eb15' });
        Codicon.listOrdered = new Codicon('list-ordered', { fontCharacter: '\\eb16' });
        Codicon.listUnordered = new Codicon('list-unordered', { fontCharacter: '\\eb17' });
        Codicon.liveShare = new Codicon('live-share', { fontCharacter: '\\eb18' });
        Codicon.loading = new Codicon('loading', { fontCharacter: '\\eb19' });
        Codicon.location = new Codicon('location', { fontCharacter: '\\eb1a' });
        Codicon.mailRead = new Codicon('mail-read', { fontCharacter: '\\eb1b' });
        Codicon.mail = new Codicon('mail', { fontCharacter: '\\eb1c' });
        Codicon.markdown = new Codicon('markdown', { fontCharacter: '\\eb1d' });
        Codicon.megaphone = new Codicon('megaphone', { fontCharacter: '\\eb1e' });
        Codicon.mention = new Codicon('mention', { fontCharacter: '\\eb1f' });
        Codicon.milestone = new Codicon('milestone', { fontCharacter: '\\eb20' });
        Codicon.mortarBoard = new Codicon('mortar-board', { fontCharacter: '\\eb21' });
        Codicon.move = new Codicon('move', { fontCharacter: '\\eb22' });
        Codicon.multipleWindows = new Codicon('multiple-windows', { fontCharacter: '\\eb23' });
        Codicon.mute = new Codicon('mute', { fontCharacter: '\\eb24' });
        Codicon.noNewline = new Codicon('no-newline', { fontCharacter: '\\eb25' });
        Codicon.note = new Codicon('note', { fontCharacter: '\\eb26' });
        Codicon.octoface = new Codicon('octoface', { fontCharacter: '\\eb27' });
        Codicon.openPreview = new Codicon('open-preview', { fontCharacter: '\\eb28' });
        Codicon.package_ = new Codicon('package', { fontCharacter: '\\eb29' });
        Codicon.paintcan = new Codicon('paintcan', { fontCharacter: '\\eb2a' });
        Codicon.pin = new Codicon('pin', { fontCharacter: '\\eb2b' });
        Codicon.play = new Codicon('play', { fontCharacter: '\\eb2c' });
        Codicon.run = new Codicon('run', { fontCharacter: '\\eb2c' });
        Codicon.plug = new Codicon('plug', { fontCharacter: '\\eb2d' });
        Codicon.preserveCase = new Codicon('preserve-case', { fontCharacter: '\\eb2e' });
        Codicon.preview = new Codicon('preview', { fontCharacter: '\\eb2f' });
        Codicon.project = new Codicon('project', { fontCharacter: '\\eb30' });
        Codicon.pulse = new Codicon('pulse', { fontCharacter: '\\eb31' });
        Codicon.question = new Codicon('question', { fontCharacter: '\\eb32' });
        Codicon.quote = new Codicon('quote', { fontCharacter: '\\eb33' });
        Codicon.radioTower = new Codicon('radio-tower', { fontCharacter: '\\eb34' });
        Codicon.reactions = new Codicon('reactions', { fontCharacter: '\\eb35' });
        Codicon.references = new Codicon('references', { fontCharacter: '\\eb36' });
        Codicon.refresh = new Codicon('refresh', { fontCharacter: '\\eb37' });
        Codicon.regex = new Codicon('regex', { fontCharacter: '\\eb38' });
        Codicon.remoteExplorer = new Codicon('remote-explorer', { fontCharacter: '\\eb39' });
        Codicon.remote = new Codicon('remote', { fontCharacter: '\\eb3a' });
        Codicon.remove = new Codicon('remove', { fontCharacter: '\\eb3b' });
        Codicon.replaceAll = new Codicon('replace-all', { fontCharacter: '\\eb3c' });
        Codicon.replace = new Codicon('replace', { fontCharacter: '\\eb3d' });
        Codicon.repoClone = new Codicon('repo-clone', { fontCharacter: '\\eb3e' });
        Codicon.repoForcePush = new Codicon('repo-force-push', { fontCharacter: '\\eb3f' });
        Codicon.repoPull = new Codicon('repo-pull', { fontCharacter: '\\eb40' });
        Codicon.repoPush = new Codicon('repo-push', { fontCharacter: '\\eb41' });
        Codicon.report = new Codicon('report', { fontCharacter: '\\eb42' });
        Codicon.requestChanges = new Codicon('request-changes', { fontCharacter: '\\eb43' });
        Codicon.rocket = new Codicon('rocket', { fontCharacter: '\\eb44' });
        Codicon.rootFolderOpened = new Codicon('root-folder-opened', { fontCharacter: '\\eb45' });
        Codicon.rootFolder = new Codicon('root-folder', { fontCharacter: '\\eb46' });
        Codicon.rss = new Codicon('rss', { fontCharacter: '\\eb47' });
        Codicon.ruby = new Codicon('ruby', { fontCharacter: '\\eb48' });
        Codicon.saveAll = new Codicon('save-all', { fontCharacter: '\\eb49' });
        Codicon.saveAs = new Codicon('save-as', { fontCharacter: '\\eb4a' });
        Codicon.save = new Codicon('save', { fontCharacter: '\\eb4b' });
        Codicon.screenFull = new Codicon('screen-full', { fontCharacter: '\\eb4c' });
        Codicon.screenNormal = new Codicon('screen-normal', { fontCharacter: '\\eb4d' });
        Codicon.searchStop = new Codicon('search-stop', { fontCharacter: '\\eb4e' });
        Codicon.server = new Codicon('server', { fontCharacter: '\\eb50' });
        Codicon.settingsGear = new Codicon('settings-gear', { fontCharacter: '\\eb51' });
        Codicon.settings = new Codicon('settings', { fontCharacter: '\\eb52' });
        Codicon.shield = new Codicon('shield', { fontCharacter: '\\eb53' });
        Codicon.smiley = new Codicon('smiley', { fontCharacter: '\\eb54' });
        Codicon.sortPrecedence = new Codicon('sort-precedence', { fontCharacter: '\\eb55' });
        Codicon.splitHorizontal = new Codicon('split-horizontal', { fontCharacter: '\\eb56' });
        Codicon.splitVertical = new Codicon('split-vertical', { fontCharacter: '\\eb57' });
        Codicon.squirrel = new Codicon('squirrel', { fontCharacter: '\\eb58' });
        Codicon.starFull = new Codicon('star-full', { fontCharacter: '\\eb59' });
        Codicon.starHalf = new Codicon('star-half', { fontCharacter: '\\eb5a' });
        Codicon.symbolClass = new Codicon('symbol-class', { fontCharacter: '\\eb5b' });
        Codicon.symbolColor = new Codicon('symbol-color', { fontCharacter: '\\eb5c' });
        Codicon.symbolConstant = new Codicon('symbol-constant', { fontCharacter: '\\eb5d' });
        Codicon.symbolEnumMember = new Codicon('symbol-enum-member', { fontCharacter: '\\eb5e' });
        Codicon.symbolField = new Codicon('symbol-field', { fontCharacter: '\\eb5f' });
        Codicon.symbolFile = new Codicon('symbol-file', { fontCharacter: '\\eb60' });
        Codicon.symbolInterface = new Codicon('symbol-interface', { fontCharacter: '\\eb61' });
        Codicon.symbolKeyword = new Codicon('symbol-keyword', { fontCharacter: '\\eb62' });
        Codicon.symbolMisc = new Codicon('symbol-misc', { fontCharacter: '\\eb63' });
        Codicon.symbolOperator = new Codicon('symbol-operator', { fontCharacter: '\\eb64' });
        Codicon.symbolProperty = new Codicon('symbol-property', { fontCharacter: '\\eb65' });
        Codicon.wrench = new Codicon('wrench', { fontCharacter: '\\eb65' });
        Codicon.wrenchSubaction = new Codicon('wrench-subaction', { fontCharacter: '\\eb65' });
        Codicon.symbolSnippet = new Codicon('symbol-snippet', { fontCharacter: '\\eb66' });
        Codicon.tasklist = new Codicon('tasklist', { fontCharacter: '\\eb67' });
        Codicon.telescope = new Codicon('telescope', { fontCharacter: '\\eb68' });
        Codicon.textSize = new Codicon('text-size', { fontCharacter: '\\eb69' });
        Codicon.threeBars = new Codicon('three-bars', { fontCharacter: '\\eb6a' });
        Codicon.thumbsdown = new Codicon('thumbsdown', { fontCharacter: '\\eb6b' });
        Codicon.thumbsup = new Codicon('thumbsup', { fontCharacter: '\\eb6c' });
        Codicon.tools = new Codicon('tools', { fontCharacter: '\\eb6d' });
        Codicon.triangleDown = new Codicon('triangle-down', { fontCharacter: '\\eb6e' });
        Codicon.triangleLeft = new Codicon('triangle-left', { fontCharacter: '\\eb6f' });
        Codicon.triangleRight = new Codicon('triangle-right', { fontCharacter: '\\eb70' });
        Codicon.triangleUp = new Codicon('triangle-up', { fontCharacter: '\\eb71' });
        Codicon.twitter = new Codicon('twitter', { fontCharacter: '\\eb72' });
        Codicon.unfold = new Codicon('unfold', { fontCharacter: '\\eb73' });
        Codicon.unlock = new Codicon('unlock', { fontCharacter: '\\eb74' });
        Codicon.unmute = new Codicon('unmute', { fontCharacter: '\\eb75' });
        Codicon.unverified = new Codicon('unverified', { fontCharacter: '\\eb76' });
        Codicon.verified = new Codicon('verified', { fontCharacter: '\\eb77' });
        Codicon.versions = new Codicon('versions', { fontCharacter: '\\eb78' });
        Codicon.vmActive = new Codicon('vm-active', { fontCharacter: '\\eb79' });
        Codicon.vmOutline = new Codicon('vm-outline', { fontCharacter: '\\eb7a' });
        Codicon.vmRunning = new Codicon('vm-running', { fontCharacter: '\\eb7b' });
        Codicon.watch = new Codicon('watch', { fontCharacter: '\\eb7c' });
        Codicon.whitespace = new Codicon('whitespace', { fontCharacter: '\\eb7d' });
        Codicon.wholeWord = new Codicon('whole-word', { fontCharacter: '\\eb7e' });
        Codicon.window = new Codicon('window', { fontCharacter: '\\eb7f' });
        Codicon.wordWrap = new Codicon('word-wrap', { fontCharacter: '\\eb80' });
        Codicon.zoomIn = new Codicon('zoom-in', { fontCharacter: '\\eb81' });
        Codicon.zoomOut = new Codicon('zoom-out', { fontCharacter: '\\eb82' });
        Codicon.listFilter = new Codicon('list-filter', { fontCharacter: '\\eb83' });
        Codicon.listFlat = new Codicon('list-flat', { fontCharacter: '\\eb84' });
        Codicon.listSelection = new Codicon('list-selection', { fontCharacter: '\\eb85' });
        Codicon.selection = new Codicon('selection', { fontCharacter: '\\eb85' });
        Codicon.listTree = new Codicon('list-tree', { fontCharacter: '\\eb86' });
        Codicon.debugBreakpointFunctionUnverified = new Codicon('debug-breakpoint-function-unverified', { fontCharacter: '\\eb87' });
        Codicon.debugBreakpointFunction = new Codicon('debug-breakpoint-function', { fontCharacter: '\\eb88' });
        Codicon.debugBreakpointFunctionDisabled = new Codicon('debug-breakpoint-function-disabled', { fontCharacter: '\\eb88' });
        Codicon.debugStackframeActive = new Codicon('debug-stackframe-active', { fontCharacter: '\\eb89' });
        Codicon.debugStackframeDot = new Codicon('debug-stackframe-dot', { fontCharacter: '\\eb8a' });
        Codicon.debugStackframe = new Codicon('debug-stackframe', { fontCharacter: '\\eb8b' });
        Codicon.debugStackframeFocused = new Codicon('debug-stackframe-focused', { fontCharacter: '\\eb8b' });
        Codicon.debugBreakpointUnsupported = new Codicon('debug-breakpoint-unsupported', { fontCharacter: '\\eb8c' });
        Codicon.symbolString = new Codicon('symbol-string', { fontCharacter: '\\eb8d' });
        Codicon.debugReverseContinue = new Codicon('debug-reverse-continue', { fontCharacter: '\\eb8e' });
        Codicon.debugStepBack = new Codicon('debug-step-back', { fontCharacter: '\\eb8f' });
        Codicon.debugRestartFrame = new Codicon('debug-restart-frame', { fontCharacter: '\\eb90' });
        Codicon.callIncoming = new Codicon('call-incoming', { fontCharacter: '\\eb92' });
        Codicon.callOutgoing = new Codicon('call-outgoing', { fontCharacter: '\\eb93' });
        Codicon.menu = new Codicon('menu', { fontCharacter: '\\eb94' });
        Codicon.expandAll = new Codicon('expand-all', { fontCharacter: '\\eb95' });
        Codicon.feedback = new Codicon('feedback', { fontCharacter: '\\eb96' });
        Codicon.groupByRefType = new Codicon('group-by-ref-type', { fontCharacter: '\\eb97' });
        Codicon.ungroupByRefType = new Codicon('ungroup-by-ref-type', { fontCharacter: '\\eb98' });
        Codicon.account = new Codicon('account', { fontCharacter: '\\eb99' });
        Codicon.bellDot = new Codicon('bell-dot', { fontCharacter: '\\eb9a' });
        Codicon.debugConsole = new Codicon('debug-console', { fontCharacter: '\\eb9b' });
        Codicon.library = new Codicon('library', { fontCharacter: '\\eb9c' });
        Codicon.output = new Codicon('output', { fontCharacter: '\\eb9d' });
        Codicon.runAll = new Codicon('run-all', { fontCharacter: '\\eb9e' });
        Codicon.syncIgnored = new Codicon('sync-ignored', { fontCharacter: '\\eb9f' });
        Codicon.pinned = new Codicon('pinned', { fontCharacter: '\\eba0' });
        Codicon.githubInverted = new Codicon('github-inverted', { fontCharacter: '\\eba1' });
        Codicon.debugAlt = new Codicon('debug-alt', { fontCharacter: '\\eb91' });
        Codicon.serverProcess = new Codicon('server-process', { fontCharacter: '\\eba2' });
        Codicon.serverEnvironment = new Codicon('server-environment', { fontCharacter: '\\eba3' });
        Codicon.pass = new Codicon('pass', { fontCharacter: '\\eba4' });
        Codicon.stopCircle = new Codicon('stop-circle', { fontCharacter: '\\eba5' });
        Codicon.playCircle = new Codicon('play-circle', { fontCharacter: '\\eba6' });
        Codicon.record = new Codicon('record', { fontCharacter: '\\eba7' });
        Codicon.debugAltSmall = new Codicon('debug-alt-small', { fontCharacter: '\\eba8' });
        Codicon.vmConnect = new Codicon('vm-connect', { fontCharacter: '\\eba9' });
        Codicon.cloud = new Codicon('cloud', { fontCharacter: '\\ebaa' });
        Codicon.merge = new Codicon('merge', { fontCharacter: '\\ebab' });
        Codicon.exportIcon = new Codicon('export', { fontCharacter: '\\ebac' });
        Codicon.graphLeft = new Codicon('graph-left', { fontCharacter: '\\ebad' });
        Codicon.magnet = new Codicon('magnet', { fontCharacter: '\\ebae' });
        Codicon.notebook = new Codicon('notebook', { fontCharacter: '\\ebaf' });
        Codicon.redo = new Codicon('redo', { fontCharacter: '\\ebb0' });
        Codicon.checkAll = new Codicon('check-all', { fontCharacter: '\\ebb1' });
        Codicon.pinnedDirty = new Codicon('pinned-dirty', { fontCharacter: '\\ebb2' });
        Codicon.passFilled = new Codicon('pass-filled', { fontCharacter: '\\ebb3' });
        Codicon.circleLargeFilled = new Codicon('circle-large-filled', { fontCharacter: '\\ebb4' });
        Codicon.circleLargeOutline = new Codicon('circle-large-outline', { fontCharacter: '\\ebb5' });
        Codicon.combine = new Codicon('combine', { fontCharacter: '\\ebb6' });
        Codicon.gather = new Codicon('gather', { fontCharacter: '\\ebb6' });
        Codicon.table = new Codicon('table', { fontCharacter: '\\ebb7' });
        Codicon.variableGroup = new Codicon('variable-group', { fontCharacter: '\\ebb8' });
        Codicon.typeHierarchy = new Codicon('type-hierarchy', { fontCharacter: '\\ebb9' });
        Codicon.typeHierarchySub = new Codicon('type-hierarchy-sub', { fontCharacter: '\\ebba' });
        Codicon.typeHierarchySuper = new Codicon('type-hierarchy-super', { fontCharacter: '\\ebbb' });
        Codicon.gitPullRequestCreate = new Codicon('git-pull-request-create', { fontCharacter: '\\ebbc' });
        Codicon.runAbove = new Codicon('run-above', { fontCharacter: '\\ebbd' });
        Codicon.runBelow = new Codicon('run-below', { fontCharacter: '\\ebbe' });
        Codicon.notebookTemplate = new Codicon('notebook-template', { fontCharacter: '\\ebbf' });
        Codicon.debugRerun = new Codicon('debug-rerun', { fontCharacter: '\\ebc0' });
        Codicon.workspaceTrusted = new Codicon('workspace-trusted', { fontCharacter: '\\ebc1' });
        Codicon.workspaceUntrusted = new Codicon('workspace-untrusted', { fontCharacter: '\\ebc2' });
        Codicon.workspaceUnspecified = new Codicon('workspace-unspecified', { fontCharacter: '\\ebc3' });
        Codicon.terminalCmd = new Codicon('terminal-cmd', { fontCharacter: '\\ebc4' });
        Codicon.terminalDebian = new Codicon('terminal-debian', { fontCharacter: '\\ebc5' });
        Codicon.terminalLinux = new Codicon('terminal-linux', { fontCharacter: '\\ebc6' });
        Codicon.terminalPowershell = new Codicon('terminal-powershell', { fontCharacter: '\\ebc7' });
        Codicon.terminalTmux = new Codicon('terminal-tmux', { fontCharacter: '\\ebc8' });
        Codicon.terminalUbuntu = new Codicon('terminal-ubuntu', { fontCharacter: '\\ebc9' });
        Codicon.terminalBash = new Codicon('terminal-bash', { fontCharacter: '\\ebca' });
        Codicon.arrowSwap = new Codicon('arrow-swap', { fontCharacter: '\\ebcb' });
        Codicon.copy = new Codicon('copy', { fontCharacter: '\\ebcc' });
        Codicon.personAdd = new Codicon('person-add', { fontCharacter: '\\ebcd' });
        Codicon.filterFilled = new Codicon('filter-filled', { fontCharacter: '\\ebce' });
        Codicon.wand = new Codicon('wand', { fontCharacter: '\\ebcf' });
        Codicon.debugLineByLine = new Codicon('debug-line-by-line', { fontCharacter: '\\ebd0' });
        Codicon.dropDownButton = new Codicon('drop-down-button', Codicon.chevronDown.definition);
    })(Codicon = exports.Codicon || (exports.Codicon = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[31/*vs/base/common/stream*/], __M([0/*require*/,1/*exports*/,9/*vs/base/common/errors*/,4/*vs/base/common/lifecycle*/]), function (require, exports, errors_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prefixedStream = exports.prefixedReadable = exports.transform = exports.toReadable = exports.emptyStream = exports.toStream = exports.peekStream = exports.listenStream = exports.consumeStream = exports.peekReadable = exports.consumeReadable = exports.newWriteableStream = exports.isReadableBufferedStream = exports.isReadableStream = void 0;
    function isReadableStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return [candidate.on, candidate.pause, candidate.resume, candidate.destroy].every(fn => typeof fn === 'function');
    }
    exports.isReadableStream = isReadableStream;
    function isReadableBufferedStream(obj) {
        const candidate = obj;
        if (!candidate) {
            return false;
        }
        return isReadableStream(candidate.stream) && Array.isArray(candidate.buffer) && typeof candidate.ended === 'boolean';
    }
    exports.isReadableBufferedStream = isReadableBufferedStream;
    function newWriteableStream(reducer, options) {
        return new WriteableStreamImpl(reducer, options);
    }
    exports.newWriteableStream = newWriteableStream;
    class WriteableStreamImpl {
        constructor(reducer, options) {
            this.reducer = reducer;
            this.options = options;
            this.state = {
                flowing: false,
                ended: false,
                destroyed: false
            };
            this.buffer = {
                data: [],
                error: []
            };
            this.listeners = {
                data: [],
                error: [],
                end: []
            };
            this.pendingWritePromises = [];
        }
        pause() {
            if (this.state.destroyed) {
                return;
            }
            this.state.flowing = false;
        }
        resume() {
            if (this.state.destroyed) {
                return;
            }
            if (!this.state.flowing) {
                this.state.flowing = true;
                // emit buffered events
                this.flowData();
                this.flowErrors();
                this.flowEnd();
            }
        }
        write(data) {
            var _a;
            if (this.state.destroyed) {
                return;
            }
            // flowing: directly send the data to listeners
            if (this.state.flowing) {
                this.emitData(data);
            }
            // not yet flowing: buffer data until flowing
            else {
                this.buffer.data.push(data);
                // highWaterMark: if configured, signal back when buffer reached limits
                if (typeof ((_a = this.options) === null || _a === void 0 ? void 0 : _a.highWaterMark) === 'number' && this.buffer.data.length > this.options.highWaterMark) {
                    return new Promise(resolve => this.pendingWritePromises.push(resolve));
                }
            }
        }
        error(error) {
            if (this.state.destroyed) {
                return;
            }
            // flowing: directly send the error to listeners
            if (this.state.flowing) {
                this.emitError(error);
            }
            // not yet flowing: buffer errors until flowing
            else {
                this.buffer.error.push(error);
            }
        }
        end(result) {
            if (this.state.destroyed) {
                return;
            }
            // end with data if provided
            if (typeof result !== 'undefined') {
                this.write(result);
            }
            // flowing: send end event to listeners
            if (this.state.flowing) {
                this.emitEnd();
                this.destroy();
            }
            // not yet flowing: remember state
            else {
                this.state.ended = true;
            }
        }
        emitData(data) {
            this.listeners.data.slice(0).forEach(listener => listener(data)); // slice to avoid listener mutation from delivering event
        }
        emitError(error) {
            if (this.listeners.error.length === 0) {
                (0, errors_1.onUnexpectedError)(error); // nobody listened to this error so we log it as unexpected
            }
            else {
                this.listeners.error.slice(0).forEach(listener => listener(error)); // slice to avoid listener mutation from delivering event
            }
        }
        emitEnd() {
            this.listeners.end.slice(0).forEach(listener => listener()); // slice to avoid listener mutation from delivering event
        }
        on(event, callback) {
            if (this.state.destroyed) {
                return;
            }
            switch (event) {
                case 'data':
                    this.listeners.data.push(callback);
                    // switch into flowing mode as soon as the first 'data'
                    // listener is added and we are not yet in flowing mode
                    this.resume();
                    break;
                case 'end':
                    this.listeners.end.push(callback);
                    // emit 'end' event directly if we are flowing
                    // and the end has already been reached
                    //
                    // finish() when it went through
                    if (this.state.flowing && this.flowEnd()) {
                        this.destroy();
                    }
                    break;
                case 'error':
                    this.listeners.error.push(callback);
                    // emit buffered 'error' events unless done already
                    // now that we know that we have at least one listener
                    if (this.state.flowing) {
                        this.flowErrors();
                    }
                    break;
            }
        }
        removeListener(event, callback) {
            if (this.state.destroyed) {
                return;
            }
            let listeners = undefined;
            switch (event) {
                case 'data':
                    listeners = this.listeners.data;
                    break;
                case 'end':
                    listeners = this.listeners.end;
                    break;
                case 'error':
                    listeners = this.listeners.error;
                    break;
            }
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index >= 0) {
                    listeners.splice(index, 1);
                }
            }
        }
        flowData() {
            if (this.buffer.data.length > 0) {
                const fullDataBuffer = this.reducer(this.buffer.data);
                this.emitData(fullDataBuffer);
                this.buffer.data.length = 0;
                // When the buffer is empty, resolve all pending writers
                const pendingWritePromises = [...this.pendingWritePromises];
                this.pendingWritePromises.length = 0;
                pendingWritePromises.forEach(pendingWritePromise => pendingWritePromise());
            }
        }
        flowErrors() {
            if (this.listeners.error.length > 0) {
                for (const error of this.buffer.error) {
                    this.emitError(error);
                }
                this.buffer.error.length = 0;
            }
        }
        flowEnd() {
            if (this.state.ended) {
                this.emitEnd();
                return this.listeners.end.length > 0;
            }
            return false;
        }
        destroy() {
            if (!this.state.destroyed) {
                this.state.destroyed = true;
                this.state.ended = true;
                this.buffer.data.length = 0;
                this.buffer.error.length = 0;
                this.listeners.data.length = 0;
                this.listeners.error.length = 0;
                this.listeners.end.length = 0;
                this.pendingWritePromises.length = 0;
            }
        }
    }
    /**
     * Helper to fully read a T readable into a T.
     */
    function consumeReadable(readable, reducer) {
        const chunks = [];
        let chunk;
        while ((chunk = readable.read()) !== null) {
            chunks.push(chunk);
        }
        return reducer(chunks);
    }
    exports.consumeReadable = consumeReadable;
    /**
     * Helper to read a T readable up to a maximum of chunks. If the limit is
     * reached, will return a readable instead to ensure all data can still
     * be read.
     */
    function peekReadable(readable, reducer, maxChunks) {
        const chunks = [];
        let chunk = undefined;
        while ((chunk = readable.read()) !== null && chunks.length < maxChunks) {
            chunks.push(chunk);
        }
        // If the last chunk is null, it means we reached the end of
        // the readable and return all the data at once
        if (chunk === null && chunks.length > 0) {
            return reducer(chunks);
        }
        // Otherwise, we still have a chunk, it means we reached the maxChunks
        // value and as such we return a new Readable that first returns
        // the existing read chunks and then continues with reading from
        // the underlying readable.
        return {
            read: () => {
                // First consume chunks from our array
                if (chunks.length > 0) {
                    return chunks.shift();
                }
                // Then ensure to return our last read chunk
                if (typeof chunk !== 'undefined') {
                    const lastReadChunk = chunk;
                    // explicitly use undefined here to indicate that we consumed
                    // the chunk, which could have either been null or valued.
                    chunk = undefined;
                    return lastReadChunk;
                }
                // Finally delegate back to the Readable
                return readable.read();
            }
        };
    }
    exports.peekReadable = peekReadable;
    function consumeStream(stream, reducer) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            listenStream(stream, {
                onData: chunk => {
                    if (reducer) {
                        chunks.push(chunk);
                    }
                },
                onError: error => {
                    if (reducer) {
                        reject(error);
                    }
                    else {
                        resolve(undefined);
                    }
                },
                onEnd: () => {
                    if (reducer) {
                        resolve(reducer(chunks));
                    }
                    else {
                        resolve(undefined);
                    }
                }
            });
        });
    }
    exports.consumeStream = consumeStream;
    /**
     * Helper to listen to all events of a T stream in proper order.
     */
    function listenStream(stream, listener) {
        stream.on('error', error => listener.onError(error));
        stream.on('end', () => listener.onEnd());
        // Adding the `data` listener will turn the stream
        // into flowing mode. As such it is important to
        // add this listener last (DO NOT CHANGE!)
        stream.on('data', data => listener.onData(data));
    }
    exports.listenStream = listenStream;
    /**
     * Helper to peek up to `maxChunks` into a stream. The return type signals if
     * the stream has ended or not. If not, caller needs to add a `data` listener
     * to continue reading.
     */
    function peekStream(stream, maxChunks) {
        return new Promise((resolve, reject) => {
            const streamListeners = new lifecycle_1.DisposableStore();
            const buffer = [];
            // Data Listener
            const dataListener = (chunk) => {
                // Add to buffer
                buffer.push(chunk);
                // We reached maxChunks and thus need to return
                if (buffer.length > maxChunks) {
                    // Dispose any listeners and ensure to pause the
                    // stream so that it can be consumed again by caller
                    streamListeners.dispose();
                    stream.pause();
                    return resolve({ stream, buffer, ended: false });
                }
            };
            // Error Listener
            const errorListener = (error) => {
                return reject(error);
            };
            // End Listener
            const endListener = () => {
                return resolve({ stream, buffer, ended: true });
            };
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('error', errorListener)));
            stream.on('error', errorListener);
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('end', endListener)));
            stream.on('end', endListener);
            // Important: leave the `data` listener last because
            // this can turn the stream into flowing mode and we
            // want `error` events to be received as well.
            streamListeners.add((0, lifecycle_1.toDisposable)(() => stream.removeListener('data', dataListener)));
            stream.on('data', dataListener);
        });
    }
    exports.peekStream = peekStream;
    /**
     * Helper to create a readable stream from an existing T.
     */
    function toStream(t, reducer) {
        const stream = newWriteableStream(reducer);
        stream.end(t);
        return stream;
    }
    exports.toStream = toStream;
    /**
     * Helper to create an empty stream
     */
    function emptyStream() {
        const stream = newWriteableStream(() => { throw new Error('not supported'); });
        stream.end();
        return stream;
    }
    exports.emptyStream = emptyStream;
    /**
     * Helper to convert a T into a Readable<T>.
     */
    function toReadable(t) {
        let consumed = false;
        return {
            read: () => {
                if (consumed) {
                    return null;
                }
                consumed = true;
                return t;
            }
        };
    }
    exports.toReadable = toReadable;
    /**
     * Helper to transform a readable stream into another stream.
     */
    function transform(stream, transformer, reducer) {
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => target.write(transformer.data(data)),
            onError: error => target.error(transformer.error ? transformer.error(error) : error),
            onEnd: () => target.end()
        });
        return target;
    }
    exports.transform = transform;
    /**
     * Helper to take an existing readable that will
     * have a prefix injected to the beginning.
     */
    function prefixedReadable(prefix, readable, reducer) {
        let prefixHandled = false;
        return {
            read: () => {
                const chunk = readable.read();
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    // If we have also a read-result, make
                    // sure to reduce it to a single result
                    if (chunk !== null) {
                        return reducer([prefix, chunk]);
                    }
                    // Otherwise, just return prefix directly
                    return prefix;
                }
                return chunk;
            }
        };
    }
    exports.prefixedReadable = prefixedReadable;
    /**
     * Helper to take an existing stream that will
     * have a prefix injected to the beginning.
     */
    function prefixedStream(prefix, stream, reducer) {
        let prefixHandled = false;
        const target = newWriteableStream(reducer);
        listenStream(stream, {
            onData: data => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    return target.write(reducer([prefix, data]));
                }
                return target.write(data);
            },
            onError: error => target.error(error),
            onEnd: () => {
                // Handle prefix only once
                if (!prefixHandled) {
                    prefixHandled = true;
                    target.write(prefix);
                }
                target.end();
            }
        });
        return target;
    }
    exports.prefixedStream = prefixedStream;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[2/*vs/base/common/strings*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GraphemeBreakType = exports.breakBetweenGraphemeBreakType = exports.getGraphemeBreakType = exports.singleLetterHash = exports.getNLines = exports.uppercaseFirstLetter = exports.containsUppercaseCharacter = exports.fuzzyContains = exports.stripUTF8BOM = exports.startsWithUTF8BOM = exports.UTF8_BOM_CHARACTER = exports.removeAnsiEscapeCodes = exports.lcut = exports.isEmojiImprecise = exports.isFullWidthCharacter = exports.containsFullWidthCharacter = exports.containsUnusualLineTerminators = exports.UNUSUAL_LINE_TERMINATORS = exports.isBasicASCII = exports.containsEmoji = exports.containsRTL = exports.decodeUTF8 = exports.encodeUTF8 = exports.getCharContainingOffset = exports.prevCharLength = exports.nextCharLength = exports.getNextCodePoint = exports.computeCodePoint = exports.isLowSurrogate = exports.isHighSurrogate = exports.commonSuffixLength = exports.commonPrefixLength = exports.startsWithIgnoreCase = exports.equalsIgnoreCase = exports.isUpperAsciiLetter = exports.isLowerAsciiLetter = exports.compareSubstringIgnoreCase = exports.compareIgnoreCase = exports.compareSubstring = exports.compare = exports.lastNonWhitespaceIndex = exports.getLeadingWhitespace = exports.firstNonWhitespaceIndex = exports.splitLines = exports.regExpFlags = exports.regExpContainsBackreference = exports.regExpLeadsToEndlessLoop = exports.createRegExp = exports.stripWildcards = exports.convertSimple2RegExpPattern = exports.rtrim = exports.ltrim = exports.trim = exports.truncate = exports.count = exports.escapeRegExpCharacters = exports.escape = exports.format = exports.isFalsyOrWhitespace = void 0;
    function isFalsyOrWhitespace(str) {
        if (!str || typeof str !== 'string') {
            return true;
        }
        return str.trim().length === 0;
    }
    exports.isFalsyOrWhitespace = isFalsyOrWhitespace;
    const _formatRegexp = /{(\d+)}/g;
    /**
     * Helper to produce a string with a variable number of arguments. Insert variable segments
     * into the string using the {n} notation where N is the index of the argument following the string.
     * @param value string to which formatting is applied
     * @param args replacements for {n}-entries
     */
    function format(value, ...args) {
        if (args.length === 0) {
            return value;
        }
        return value.replace(_formatRegexp, function (match, group) {
            const idx = parseInt(group, 10);
            return isNaN(idx) || idx < 0 || idx >= args.length ?
                match :
                args[idx];
        });
    }
    exports.format = format;
    /**
     * Converts HTML characters inside the string to use entities instead. Makes the string safe from
     * being used e.g. in HTMLElement.innerHTML.
     */
    function escape(html) {
        return html.replace(/[<>&]/g, function (match) {
            switch (match) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                default: return match;
            }
        });
    }
    exports.escape = escape;
    /**
     * Escapes regular expression characters in a given string
     */
    function escapeRegExpCharacters(value) {
        return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, '\\$&');
    }
    exports.escapeRegExpCharacters = escapeRegExpCharacters;
    /**
     * Counts how often `character` occurs inside `value`.
     */
    function count(value, character) {
        let result = 0;
        const ch = character.charCodeAt(0);
        for (let i = value.length - 1; i >= 0; i--) {
            if (value.charCodeAt(i) === ch) {
                result++;
            }
        }
        return result;
    }
    exports.count = count;
    function truncate(value, maxLength, suffix = '…') {
        if (value.length <= maxLength) {
            return value;
        }
        return `${value.substr(0, maxLength)}${suffix}`;
    }
    exports.truncate = truncate;
    /**
     * Removes all occurrences of needle from the beginning and end of haystack.
     * @param haystack string to trim
     * @param needle the thing to trim (default is a blank)
     */
    function trim(haystack, needle = ' ') {
        const trimmed = ltrim(haystack, needle);
        return rtrim(trimmed, needle);
    }
    exports.trim = trim;
    /**
     * Removes all occurrences of needle from the beginning of haystack.
     * @param haystack string to trim
     * @param needle the thing to trim
     */
    function ltrim(haystack, needle) {
        if (!haystack || !needle) {
            return haystack;
        }
        const needleLen = needle.length;
        if (needleLen === 0 || haystack.length === 0) {
            return haystack;
        }
        let offset = 0;
        while (haystack.indexOf(needle, offset) === offset) {
            offset = offset + needleLen;
        }
        return haystack.substring(offset);
    }
    exports.ltrim = ltrim;
    /**
     * Removes all occurrences of needle from the end of haystack.
     * @param haystack string to trim
     * @param needle the thing to trim
     */
    function rtrim(haystack, needle) {
        if (!haystack || !needle) {
            return haystack;
        }
        const needleLen = needle.length, haystackLen = haystack.length;
        if (needleLen === 0 || haystackLen === 0) {
            return haystack;
        }
        let offset = haystackLen, idx = -1;
        while (true) {
            idx = haystack.lastIndexOf(needle, offset - 1);
            if (idx === -1 || idx + needleLen !== offset) {
                break;
            }
            if (idx === 0) {
                return '';
            }
            offset = idx;
        }
        return haystack.substring(0, offset);
    }
    exports.rtrim = rtrim;
    function convertSimple2RegExpPattern(pattern) {
        return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
    }
    exports.convertSimple2RegExpPattern = convertSimple2RegExpPattern;
    function stripWildcards(pattern) {
        return pattern.replace(/\*/g, '');
    }
    exports.stripWildcards = stripWildcards;
    function createRegExp(searchString, isRegex, options = {}) {
        if (!searchString) {
            throw new Error('Cannot create regex from empty string');
        }
        if (!isRegex) {
            searchString = escapeRegExpCharacters(searchString);
        }
        if (options.wholeWord) {
            if (!/\B/.test(searchString.charAt(0))) {
                searchString = '\\b' + searchString;
            }
            if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
                searchString = searchString + '\\b';
            }
        }
        let modifiers = '';
        if (options.global) {
            modifiers += 'g';
        }
        if (!options.matchCase) {
            modifiers += 'i';
        }
        if (options.multiline) {
            modifiers += 'm';
        }
        if (options.unicode) {
            modifiers += 'u';
        }
        return new RegExp(searchString, modifiers);
    }
    exports.createRegExp = createRegExp;
    function regExpLeadsToEndlessLoop(regexp) {
        // Exit early if it's one of these special cases which are meant to match
        // against an empty string
        if (regexp.source === '^' || regexp.source === '^$' || regexp.source === '$' || regexp.source === '^\\s*$') {
            return false;
        }
        // We check against an empty string. If the regular expression doesn't advance
        // (e.g. ends in an endless loop) it will match an empty string.
        const match = regexp.exec('');
        return !!(match && regexp.lastIndex === 0);
    }
    exports.regExpLeadsToEndlessLoop = regExpLeadsToEndlessLoop;
    function regExpContainsBackreference(regexpValue) {
        return !!regexpValue.match(/([^\\]|^)(\\\\)*\\\d+/);
    }
    exports.regExpContainsBackreference = regExpContainsBackreference;
    function regExpFlags(regexp) {
        return (regexp.global ? 'g' : '')
            + (regexp.ignoreCase ? 'i' : '')
            + (regexp.multiline ? 'm' : '')
            + (regexp /* standalone editor compilation */.unicode ? 'u' : '');
    }
    exports.regExpFlags = regExpFlags;
    function splitLines(str) {
        return str.split(/\r\n|\r|\n/);
    }
    exports.splitLines = splitLines;
    /**
     * Returns first index of the string that is not whitespace.
     * If string is empty or contains only whitespaces, returns -1
     */
    function firstNonWhitespaceIndex(str) {
        for (let i = 0, len = str.length; i < len; i++) {
            const chCode = str.charCodeAt(i);
            if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
                return i;
            }
        }
        return -1;
    }
    exports.firstNonWhitespaceIndex = firstNonWhitespaceIndex;
    /**
     * Returns the leading whitespace of the string.
     * If the string contains only whitespaces, returns entire string
     */
    function getLeadingWhitespace(str, start = 0, end = str.length) {
        for (let i = start; i < end; i++) {
            const chCode = str.charCodeAt(i);
            if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
                return str.substring(start, i);
            }
        }
        return str.substring(start, end);
    }
    exports.getLeadingWhitespace = getLeadingWhitespace;
    /**
     * Returns last index of the string that is not whitespace.
     * If string is empty or contains only whitespaces, returns -1
     */
    function lastNonWhitespaceIndex(str, startIndex = str.length - 1) {
        for (let i = startIndex; i >= 0; i--) {
            const chCode = str.charCodeAt(i);
            if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
                return i;
            }
        }
        return -1;
    }
    exports.lastNonWhitespaceIndex = lastNonWhitespaceIndex;
    function compare(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a > b) {
            return 1;
        }
        else {
            return 0;
        }
    }
    exports.compare = compare;
    function compareSubstring(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
            let codeA = a.charCodeAt(aStart);
            let codeB = b.charCodeAt(bStart);
            if (codeA < codeB) {
                return -1;
            }
            else if (codeA > codeB) {
                return 1;
            }
        }
        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;
        if (aLen < bLen) {
            return -1;
        }
        else if (aLen > bLen) {
            return 1;
        }
        return 0;
    }
    exports.compareSubstring = compareSubstring;
    function compareIgnoreCase(a, b) {
        return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
    }
    exports.compareIgnoreCase = compareIgnoreCase;
    function compareSubstringIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
        for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
            let codeA = a.charCodeAt(aStart);
            let codeB = b.charCodeAt(bStart);
            if (codeA === codeB) {
                // equal
                continue;
            }
            const diff = codeA - codeB;
            if (diff === 32 && isUpperAsciiLetter(codeB)) { //codeB =[65-90] && codeA =[97-122]
                continue;
            }
            else if (diff === -32 && isUpperAsciiLetter(codeA)) { //codeB =[97-122] && codeA =[65-90]
                continue;
            }
            if (isLowerAsciiLetter(codeA) && isLowerAsciiLetter(codeB)) {
                //
                return diff;
            }
            else {
                return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
            }
        }
        const aLen = aEnd - aStart;
        const bLen = bEnd - bStart;
        if (aLen < bLen) {
            return -1;
        }
        else if (aLen > bLen) {
            return 1;
        }
        return 0;
    }
    exports.compareSubstringIgnoreCase = compareSubstringIgnoreCase;
    function isLowerAsciiLetter(code) {
        return code >= 97 /* a */ && code <= 122 /* z */;
    }
    exports.isLowerAsciiLetter = isLowerAsciiLetter;
    function isUpperAsciiLetter(code) {
        return code >= 65 /* A */ && code <= 90 /* Z */;
    }
    exports.isUpperAsciiLetter = isUpperAsciiLetter;
    function isAsciiLetter(code) {
        return isLowerAsciiLetter(code) || isUpperAsciiLetter(code);
    }
    function equalsIgnoreCase(a, b) {
        return a.length === b.length && doEqualsIgnoreCase(a, b);
    }
    exports.equalsIgnoreCase = equalsIgnoreCase;
    function doEqualsIgnoreCase(a, b, stopAt = a.length) {
        for (let i = 0; i < stopAt; i++) {
            const codeA = a.charCodeAt(i);
            const codeB = b.charCodeAt(i);
            if (codeA === codeB) {
                continue;
            }
            // a-z A-Z
            if (isAsciiLetter(codeA) && isAsciiLetter(codeB)) {
                const diff = Math.abs(codeA - codeB);
                if (diff !== 0 && diff !== 32) {
                    return false;
                }
            }
            // Any other charcode
            else {
                if (String.fromCharCode(codeA).toLowerCase() !== String.fromCharCode(codeB).toLowerCase()) {
                    return false;
                }
            }
        }
        return true;
    }
    function startsWithIgnoreCase(str, candidate) {
        const candidateLength = candidate.length;
        if (candidate.length > str.length) {
            return false;
        }
        return doEqualsIgnoreCase(str, candidate, candidateLength);
    }
    exports.startsWithIgnoreCase = startsWithIgnoreCase;
    /**
     * @returns the length of the common prefix of the two strings.
     */
    function commonPrefixLength(a, b) {
        let i, len = Math.min(a.length, b.length);
        for (i = 0; i < len; i++) {
            if (a.charCodeAt(i) !== b.charCodeAt(i)) {
                return i;
            }
        }
        return len;
    }
    exports.commonPrefixLength = commonPrefixLength;
    /**
     * @returns the length of the common suffix of the two strings.
     */
    function commonSuffixLength(a, b) {
        let i, len = Math.min(a.length, b.length);
        const aLastIndex = a.length - 1;
        const bLastIndex = b.length - 1;
        for (i = 0; i < len; i++) {
            if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
                return i;
            }
        }
        return len;
    }
    exports.commonSuffixLength = commonSuffixLength;
    /**
     * See http://en.wikipedia.org/wiki/Surrogate_pair
     */
    function isHighSurrogate(charCode) {
        return (0xD800 <= charCode && charCode <= 0xDBFF);
    }
    exports.isHighSurrogate = isHighSurrogate;
    /**
     * See http://en.wikipedia.org/wiki/Surrogate_pair
     */
    function isLowSurrogate(charCode) {
        return (0xDC00 <= charCode && charCode <= 0xDFFF);
    }
    exports.isLowSurrogate = isLowSurrogate;
    /**
     * See http://en.wikipedia.org/wiki/Surrogate_pair
     */
    function computeCodePoint(highSurrogate, lowSurrogate) {
        return ((highSurrogate - 0xD800) << 10) + (lowSurrogate - 0xDC00) + 0x10000;
    }
    exports.computeCodePoint = computeCodePoint;
    /**
     * get the code point that begins at offset `offset`
     */
    function getNextCodePoint(str, len, offset) {
        const charCode = str.charCodeAt(offset);
        if (isHighSurrogate(charCode) && offset + 1 < len) {
            const nextCharCode = str.charCodeAt(offset + 1);
            if (isLowSurrogate(nextCharCode)) {
                return computeCodePoint(charCode, nextCharCode);
            }
        }
        return charCode;
    }
    exports.getNextCodePoint = getNextCodePoint;
    /**
     * get the code point that ends right before offset `offset`
     */
    function getPrevCodePoint(str, offset) {
        const charCode = str.charCodeAt(offset - 1);
        if (isLowSurrogate(charCode) && offset > 1) {
            const prevCharCode = str.charCodeAt(offset - 2);
            if (isHighSurrogate(prevCharCode)) {
                return computeCodePoint(prevCharCode, charCode);
            }
        }
        return charCode;
    }
    function nextCharLength(str, offset) {
        const graphemeBreakTree = GraphemeBreakTree.getInstance();
        const initialOffset = offset;
        const len = str.length;
        const initialCodePoint = getNextCodePoint(str, len, offset);
        offset += (initialCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
        let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(initialCodePoint);
        while (offset < len) {
            const nextCodePoint = getNextCodePoint(str, len, offset);
            const nextGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(nextCodePoint);
            if (breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
                break;
            }
            offset += (nextCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            graphemeBreakType = nextGraphemeBreakType;
        }
        return (offset - initialOffset);
    }
    exports.nextCharLength = nextCharLength;
    function prevCharLength(str, offset) {
        const graphemeBreakTree = GraphemeBreakTree.getInstance();
        const initialOffset = offset;
        const initialCodePoint = getPrevCodePoint(str, offset);
        offset -= (initialCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
        let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(initialCodePoint);
        while (offset > 0) {
            const prevCodePoint = getPrevCodePoint(str, offset);
            const prevGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(prevCodePoint);
            if (breakBetweenGraphemeBreakType(prevGraphemeBreakType, graphemeBreakType)) {
                break;
            }
            offset -= (prevCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            graphemeBreakType = prevGraphemeBreakType;
        }
        return (initialOffset - offset);
    }
    exports.prevCharLength = prevCharLength;
    function _getCharContainingOffset(str, offset) {
        const graphemeBreakTree = GraphemeBreakTree.getInstance();
        const len = str.length;
        const initialOffset = offset;
        const initialCodePoint = getNextCodePoint(str, len, offset);
        const initialGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(initialCodePoint);
        offset += (initialCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
        // extend to the right
        let graphemeBreakType = initialGraphemeBreakType;
        while (offset < len) {
            const nextCodePoint = getNextCodePoint(str, len, offset);
            const nextGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(nextCodePoint);
            if (breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
                break;
            }
            offset += (nextCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            graphemeBreakType = nextGraphemeBreakType;
        }
        const endOffset = offset;
        // extend to the left
        offset = initialOffset;
        graphemeBreakType = initialGraphemeBreakType;
        while (offset > 0) {
            const prevCodePoint = getPrevCodePoint(str, offset);
            const prevGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(prevCodePoint);
            if (breakBetweenGraphemeBreakType(prevGraphemeBreakType, graphemeBreakType)) {
                break;
            }
            offset -= (prevCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            graphemeBreakType = prevGraphemeBreakType;
        }
        return [offset, endOffset];
    }
    function getCharContainingOffset(str, offset) {
        if (offset > 0 && isLowSurrogate(str.charCodeAt(offset))) {
            return _getCharContainingOffset(str, offset - 1);
        }
        return _getCharContainingOffset(str, offset);
    }
    exports.getCharContainingOffset = getCharContainingOffset;
    /**
     * A manual encoding of `str` to UTF8.
     * Use only in environments which do not offer native conversion methods!
     */
    function encodeUTF8(str) {
        const strLen = str.length;
        // See https://en.wikipedia.org/wiki/UTF-8
        // first loop to establish needed buffer size
        let neededSize = 0;
        let strOffset = 0;
        while (strOffset < strLen) {
            const codePoint = getNextCodePoint(str, strLen, strOffset);
            strOffset += (codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            if (codePoint < 0x0080) {
                neededSize += 1;
            }
            else if (codePoint < 0x0800) {
                neededSize += 2;
            }
            else if (codePoint < 0x10000) {
                neededSize += 3;
            }
            else {
                neededSize += 4;
            }
        }
        // second loop to actually encode
        const arr = new Uint8Array(neededSize);
        strOffset = 0;
        let arrOffset = 0;
        while (strOffset < strLen) {
            const codePoint = getNextCodePoint(str, strLen, strOffset);
            strOffset += (codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
            if (codePoint < 0x0080) {
                arr[arrOffset++] = codePoint;
            }
            else if (codePoint < 0x0800) {
                arr[arrOffset++] = 0b11000000 | ((codePoint & 0b00000000000000000000011111000000) >>> 6);
                arr[arrOffset++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else if (codePoint < 0x10000) {
                arr[arrOffset++] = 0b11100000 | ((codePoint & 0b00000000000000001111000000000000) >>> 12);
                arr[arrOffset++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                arr[arrOffset++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else {
                arr[arrOffset++] = 0b11110000 | ((codePoint & 0b00000000000111000000000000000000) >>> 18);
                arr[arrOffset++] = 0b10000000 | ((codePoint & 0b00000000000000111111000000000000) >>> 12);
                arr[arrOffset++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                arr[arrOffset++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
        }
        return arr;
    }
    exports.encodeUTF8 = encodeUTF8;
    /**
     * A manual decoding of a UTF8 string.
     * Use only in environments which do not offer native conversion methods!
     */
    function decodeUTF8(buffer) {
        // https://en.wikipedia.org/wiki/UTF-8
        const len = buffer.byteLength;
        const result = [];
        let offset = 0;
        while (offset < len) {
            const v0 = buffer[offset];
            let codePoint;
            if (v0 >= 0b11110000 && offset + 3 < len) {
                // 4 bytes
                codePoint = ((((buffer[offset++] & 0b00000111) << 18) >>> 0)
                    | (((buffer[offset++] & 0b00111111) << 12) >>> 0)
                    | (((buffer[offset++] & 0b00111111) << 6) >>> 0)
                    | (((buffer[offset++] & 0b00111111) << 0) >>> 0));
            }
            else if (v0 >= 0b11100000 && offset + 2 < len) {
                // 3 bytes
                codePoint = ((((buffer[offset++] & 0b00001111) << 12) >>> 0)
                    | (((buffer[offset++] & 0b00111111) << 6) >>> 0)
                    | (((buffer[offset++] & 0b00111111) << 0) >>> 0));
            }
            else if (v0 >= 0b11000000 && offset + 1 < len) {
                // 2 bytes
                codePoint = ((((buffer[offset++] & 0b00011111) << 6) >>> 0)
                    | (((buffer[offset++] & 0b00111111) << 0) >>> 0));
            }
            else {
                // 1 byte
                codePoint = buffer[offset++];
            }
            if ((codePoint >= 0 && codePoint <= 0xD7FF) || (codePoint >= 0xE000 && codePoint <= 0xFFFF)) {
                // Basic Multilingual Plane
                result.push(String.fromCharCode(codePoint));
            }
            else if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
                // Supplementary Planes
                const uPrime = codePoint - 0x10000;
                const w1 = 0xD800 + ((uPrime & 0b11111111110000000000) >>> 10);
                const w2 = 0xDC00 + ((uPrime & 0b00000000001111111111) >>> 0);
                result.push(String.fromCharCode(w1));
                result.push(String.fromCharCode(w2));
            }
            else {
                // illegal code point
                result.push(String.fromCharCode(0xFFFD));
            }
        }
        return result.join('');
    }
    exports.decodeUTF8 = decodeUTF8;
    /**
     * Generated using https://github.com/alexdima/unicode-utils/blob/master/generate-rtl-test.js
     */
    const CONTAINS_RTL = /(?:[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4\u0608\u060B\u060D\u061B-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u0710\u0712-\u072F\u074D-\u07A5\u07B1-\u07EA\u07F4\u07F5\u07FA-\u0815\u081A\u0824\u0828\u0830-\u0858\u085E-\u08BD\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFD3D\uFD50-\uFDFC\uFE70-\uFEFC]|\uD802[\uDC00-\uDD1B\uDD20-\uDE00\uDE10-\uDE33\uDE40-\uDEE4\uDEEB-\uDF35\uDF40-\uDFFF]|\uD803[\uDC00-\uDCFF]|\uD83A[\uDC00-\uDCCF\uDD00-\uDD43\uDD50-\uDFFF]|\uD83B[\uDC00-\uDEBB])/;
    /**
     * Returns true if `str` contains any Unicode character that is classified as "R" or "AL".
     */
    function containsRTL(str) {
        return CONTAINS_RTL.test(str);
    }
    exports.containsRTL = containsRTL;
    /**
     * Generated using https://github.com/alexdima/unicode-utils/blob/master/generate-emoji-test.js
     */
    const CONTAINS_EMOJI = /(?:[\u231A\u231B\u23F0\u23F3\u2600-\u27BF\u2B50\u2B55]|\uD83C[\uDDE6-\uDDFF\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD00-\uDDFF\uDE70-\uDED6])/;
    function containsEmoji(str) {
        return CONTAINS_EMOJI.test(str);
    }
    exports.containsEmoji = containsEmoji;
    const IS_BASIC_ASCII = /^[\t\n\r\x20-\x7E]*$/;
    /**
     * Returns true if `str` contains only basic ASCII characters in the range 32 - 126 (including 32 and 126) or \n, \r, \t
     */
    function isBasicASCII(str) {
        return IS_BASIC_ASCII.test(str);
    }
    exports.isBasicASCII = isBasicASCII;
    exports.UNUSUAL_LINE_TERMINATORS = /[\u2028\u2029]/; // LINE SEPARATOR (LS) or PARAGRAPH SEPARATOR (PS)
    /**
     * Returns true if `str` contains unusual line terminators, like LS or PS
     */
    function containsUnusualLineTerminators(str) {
        return exports.UNUSUAL_LINE_TERMINATORS.test(str);
    }
    exports.containsUnusualLineTerminators = containsUnusualLineTerminators;
    function containsFullWidthCharacter(str) {
        for (let i = 0, len = str.length; i < len; i++) {
            if (isFullWidthCharacter(str.charCodeAt(i))) {
                return true;
            }
        }
        return false;
    }
    exports.containsFullWidthCharacter = containsFullWidthCharacter;
    function isFullWidthCharacter(charCode) {
        // Do a cheap trick to better support wrapping of wide characters, treat them as 2 columns
        // http://jrgraphix.net/research/unicode_blocks.php
        //          2E80 — 2EFF   CJK Radicals Supplement
        //          2F00 — 2FDF   Kangxi Radicals
        //          2FF0 — 2FFF   Ideographic Description Characters
        //          3000 — 303F   CJK Symbols and Punctuation
        //          3040 — 309F   Hiragana
        //          30A0 — 30FF   Katakana
        //          3100 — 312F   Bopomofo
        //          3130 — 318F   Hangul Compatibility Jamo
        //          3190 — 319F   Kanbun
        //          31A0 — 31BF   Bopomofo Extended
        //          31F0 — 31FF   Katakana Phonetic Extensions
        //          3200 — 32FF   Enclosed CJK Letters and Months
        //          3300 — 33FF   CJK Compatibility
        //          3400 — 4DBF   CJK Unified Ideographs Extension A
        //          4DC0 — 4DFF   Yijing Hexagram Symbols
        //          4E00 — 9FFF   CJK Unified Ideographs
        //          A000 — A48F   Yi Syllables
        //          A490 — A4CF   Yi Radicals
        //          AC00 — D7AF   Hangul Syllables
        // [IGNORE] D800 — DB7F   High Surrogates
        // [IGNORE] DB80 — DBFF   High Private Use Surrogates
        // [IGNORE] DC00 — DFFF   Low Surrogates
        // [IGNORE] E000 — F8FF   Private Use Area
        //          F900 — FAFF   CJK Compatibility Ideographs
        // [IGNORE] FB00 — FB4F   Alphabetic Presentation Forms
        // [IGNORE] FB50 — FDFF   Arabic Presentation Forms-A
        // [IGNORE] FE00 — FE0F   Variation Selectors
        // [IGNORE] FE20 — FE2F   Combining Half Marks
        // [IGNORE] FE30 — FE4F   CJK Compatibility Forms
        // [IGNORE] FE50 — FE6F   Small Form Variants
        // [IGNORE] FE70 — FEFF   Arabic Presentation Forms-B
        //          FF00 — FFEF   Halfwidth and Fullwidth Forms
        //               [https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms]
        //               of which FF01 - FF5E fullwidth ASCII of 21 to 7E
        // [IGNORE]    and FF65 - FFDC halfwidth of Katakana and Hangul
        // [IGNORE] FFF0 — FFFF   Specials
        charCode = +charCode; // @perf
        return ((charCode >= 0x2E80 && charCode <= 0xD7AF)
            || (charCode >= 0xF900 && charCode <= 0xFAFF)
            || (charCode >= 0xFF01 && charCode <= 0xFF5E));
    }
    exports.isFullWidthCharacter = isFullWidthCharacter;
    /**
     * A fast function (therefore imprecise) to check if code points are emojis.
     * Generated using https://github.com/alexdima/unicode-utils/blob/master/generate-emoji-test.js
     */
    function isEmojiImprecise(x) {
        return ((x >= 0x1F1E6 && x <= 0x1F1FF) || (x === 8986) || (x === 8987) || (x === 9200)
            || (x === 9203) || (x >= 9728 && x <= 10175) || (x === 11088) || (x === 11093)
            || (x >= 127744 && x <= 128591) || (x >= 128640 && x <= 128764)
            || (x >= 128992 && x <= 129003) || (x >= 129280 && x <= 129535)
            || (x >= 129648 && x <= 129750));
    }
    exports.isEmojiImprecise = isEmojiImprecise;
    /**
     * Given a string and a max length returns a shorted version. Shorting
     * happens at favorable positions - such as whitespace or punctuation characters.
     */
    function lcut(text, n) {
        if (text.length < n) {
            return text;
        }
        const re = /\b/g;
        let i = 0;
        while (re.test(text)) {
            if (text.length - re.lastIndex < n) {
                break;
            }
            i = re.lastIndex;
            re.lastIndex += 1;
        }
        return text.substring(i).replace(/^\s/, '');
    }
    exports.lcut = lcut;
    // Escape codes
    // http://en.wikipedia.org/wiki/ANSI_escape_code
    const EL = /\x1B\x5B[12]?K/g; // Erase in line
    const COLOR_START = /\x1b\[\d+m/g; // Color
    const COLOR_END = /\x1b\[0?m/g; // Color
    function removeAnsiEscapeCodes(str) {
        if (str) {
            str = str.replace(EL, '');
            str = str.replace(COLOR_START, '');
            str = str.replace(COLOR_END, '');
        }
        return str;
    }
    exports.removeAnsiEscapeCodes = removeAnsiEscapeCodes;
    // -- UTF-8 BOM
    exports.UTF8_BOM_CHARACTER = String.fromCharCode(65279 /* UTF8_BOM */);
    function startsWithUTF8BOM(str) {
        return !!(str && str.length > 0 && str.charCodeAt(0) === 65279 /* UTF8_BOM */);
    }
    exports.startsWithUTF8BOM = startsWithUTF8BOM;
    function stripUTF8BOM(str) {
        return startsWithUTF8BOM(str) ? str.substr(1) : str;
    }
    exports.stripUTF8BOM = stripUTF8BOM;
    /**
     * Checks if the characters of the provided query string are included in the
     * target string. The characters do not have to be contiguous within the string.
     */
    function fuzzyContains(target, query) {
        if (!target || !query) {
            return false; // return early if target or query are undefined
        }
        if (target.length < query.length) {
            return false; // impossible for query to be contained in target
        }
        const queryLen = query.length;
        const targetLower = target.toLowerCase();
        let index = 0;
        let lastIndexOf = -1;
        while (index < queryLen) {
            const indexOf = targetLower.indexOf(query[index], lastIndexOf + 1);
            if (indexOf < 0) {
                return false;
            }
            lastIndexOf = indexOf;
            index++;
        }
        return true;
    }
    exports.fuzzyContains = fuzzyContains;
    function containsUppercaseCharacter(target, ignoreEscapedChars = false) {
        if (!target) {
            return false;
        }
        if (ignoreEscapedChars) {
            target = target.replace(/\\./g, '');
        }
        return target.toLowerCase() !== target;
    }
    exports.containsUppercaseCharacter = containsUppercaseCharacter;
    function uppercaseFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    exports.uppercaseFirstLetter = uppercaseFirstLetter;
    function getNLines(str, n = 1) {
        if (n === 0) {
            return '';
        }
        let idx = -1;
        do {
            idx = str.indexOf('\n', idx + 1);
            n--;
        } while (n > 0 && idx >= 0);
        if (idx === -1) {
            return str;
        }
        if (str[idx - 1] === '\r') {
            idx--;
        }
        return str.substr(0, idx);
    }
    exports.getNLines = getNLines;
    /**
     * Produces 'a'-'z', followed by 'A'-'Z'... followed by 'a'-'z', etc.
     */
    function singleLetterHash(n) {
        const LETTERS_CNT = (90 /* Z */ - 65 /* A */ + 1);
        n = n % (2 * LETTERS_CNT);
        if (n < LETTERS_CNT) {
            return String.fromCharCode(97 /* a */ + n);
        }
        return String.fromCharCode(65 /* A */ + n - LETTERS_CNT);
    }
    exports.singleLetterHash = singleLetterHash;
    //#region Unicode Grapheme Break
    function getGraphemeBreakType(codePoint) {
        const graphemeBreakTree = GraphemeBreakTree.getInstance();
        return graphemeBreakTree.getGraphemeBreakType(codePoint);
    }
    exports.getGraphemeBreakType = getGraphemeBreakType;
    function breakBetweenGraphemeBreakType(breakTypeA, breakTypeB) {
        // http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundary_Rules
        // !!! Let's make the common case a bit faster
        if (breakTypeA === 0 /* Other */) {
            // see https://www.unicode.org/Public/13.0.0/ucd/auxiliary/GraphemeBreakTest-13.0.0d10.html#table
            return (breakTypeB !== 5 /* Extend */ && breakTypeB !== 7 /* SpacingMark */);
        }
        // Do not break between a CR and LF. Otherwise, break before and after controls.
        // GB3                                        CR × LF
        // GB4                       (Control | CR | LF) ÷
        // GB5                                           ÷ (Control | CR | LF)
        if (breakTypeA === 2 /* CR */) {
            if (breakTypeB === 3 /* LF */) {
                return false; // GB3
            }
        }
        if (breakTypeA === 4 /* Control */ || breakTypeA === 2 /* CR */ || breakTypeA === 3 /* LF */) {
            return true; // GB4
        }
        if (breakTypeB === 4 /* Control */ || breakTypeB === 2 /* CR */ || breakTypeB === 3 /* LF */) {
            return true; // GB5
        }
        // Do not break Hangul syllable sequences.
        // GB6                                         L × (L | V | LV | LVT)
        // GB7                                  (LV | V) × (V | T)
        // GB8                                 (LVT | T) × T
        if (breakTypeA === 8 /* L */) {
            if (breakTypeB === 8 /* L */ || breakTypeB === 9 /* V */ || breakTypeB === 11 /* LV */ || breakTypeB === 12 /* LVT */) {
                return false; // GB6
            }
        }
        if (breakTypeA === 11 /* LV */ || breakTypeA === 9 /* V */) {
            if (breakTypeB === 9 /* V */ || breakTypeB === 10 /* T */) {
                return false; // GB7
            }
        }
        if (breakTypeA === 12 /* LVT */ || breakTypeA === 10 /* T */) {
            if (breakTypeB === 10 /* T */) {
                return false; // GB8
            }
        }
        // Do not break before extending characters or ZWJ.
        // GB9                                           × (Extend | ZWJ)
        if (breakTypeB === 5 /* Extend */ || breakTypeB === 13 /* ZWJ */) {
            return false; // GB9
        }
        // The GB9a and GB9b rules only apply to extended grapheme clusters:
        // Do not break before SpacingMarks, or after Prepend characters.
        // GB9a                                          × SpacingMark
        // GB9b                                  Prepend ×
        if (breakTypeB === 7 /* SpacingMark */) {
            return false; // GB9a
        }
        if (breakTypeA === 1 /* Prepend */) {
            return false; // GB9b
        }
        // Do not break within emoji modifier sequences or emoji zwj sequences.
        // GB11    \p{Extended_Pictographic} Extend* ZWJ × \p{Extended_Pictographic}
        if (breakTypeA === 13 /* ZWJ */ && breakTypeB === 14 /* Extended_Pictographic */) {
            // Note: we are not implementing the rule entirely here to avoid introducing states
            return false; // GB11
        }
        // GB12                          sot (RI RI)* RI × RI
        // GB13                        [^RI] (RI RI)* RI × RI
        if (breakTypeA === 6 /* Regional_Indicator */ && breakTypeB === 6 /* Regional_Indicator */) {
            // Note: we are not implementing the rule entirely here to avoid introducing states
            return false; // GB12 & GB13
        }
        // GB999                                     Any ÷ Any
        return true;
    }
    exports.breakBetweenGraphemeBreakType = breakBetweenGraphemeBreakType;
    var GraphemeBreakType;
    (function (GraphemeBreakType) {
        GraphemeBreakType[GraphemeBreakType["Other"] = 0] = "Other";
        GraphemeBreakType[GraphemeBreakType["Prepend"] = 1] = "Prepend";
        GraphemeBreakType[GraphemeBreakType["CR"] = 2] = "CR";
        GraphemeBreakType[GraphemeBreakType["LF"] = 3] = "LF";
        GraphemeBreakType[GraphemeBreakType["Control"] = 4] = "Control";
        GraphemeBreakType[GraphemeBreakType["Extend"] = 5] = "Extend";
        GraphemeBreakType[GraphemeBreakType["Regional_Indicator"] = 6] = "Regional_Indicator";
        GraphemeBreakType[GraphemeBreakType["SpacingMark"] = 7] = "SpacingMark";
        GraphemeBreakType[GraphemeBreakType["L"] = 8] = "L";
        GraphemeBreakType[GraphemeBreakType["V"] = 9] = "V";
        GraphemeBreakType[GraphemeBreakType["T"] = 10] = "T";
        GraphemeBreakType[GraphemeBreakType["LV"] = 11] = "LV";
        GraphemeBreakType[GraphemeBreakType["LVT"] = 12] = "LVT";
        GraphemeBreakType[GraphemeBreakType["ZWJ"] = 13] = "ZWJ";
        GraphemeBreakType[GraphemeBreakType["Extended_Pictographic"] = 14] = "Extended_Pictographic";
    })(GraphemeBreakType = exports.GraphemeBreakType || (exports.GraphemeBreakType = {}));
    class GraphemeBreakTree {
        constructor() {
            this._data = getGraphemeBreakRawData();
        }
        static getInstance() {
            if (!GraphemeBreakTree._INSTANCE) {
                GraphemeBreakTree._INSTANCE = new GraphemeBreakTree();
            }
            return GraphemeBreakTree._INSTANCE;
        }
        getGraphemeBreakType(codePoint) {
            // !!! Let's make 7bit ASCII a bit faster: 0..31
            if (codePoint < 32) {
                if (codePoint === 10 /* LineFeed */) {
                    return 3 /* LF */;
                }
                if (codePoint === 13 /* CarriageReturn */) {
                    return 2 /* CR */;
                }
                return 4 /* Control */;
            }
            // !!! Let's make 7bit ASCII a bit faster: 32..126
            if (codePoint < 127) {
                return 0 /* Other */;
            }
            const data = this._data;
            const nodeCount = data.length / 3;
            let nodeIndex = 1;
            while (nodeIndex <= nodeCount) {
                if (codePoint < data[3 * nodeIndex]) {
                    // go left
                    nodeIndex = 2 * nodeIndex;
                }
                else if (codePoint > data[3 * nodeIndex + 1]) {
                    // go right
                    nodeIndex = 2 * nodeIndex + 1;
                }
                else {
                    // hit
                    return data[3 * nodeIndex + 2];
                }
            }
            return 0 /* Other */;
        }
    }
    GraphemeBreakTree._INSTANCE = null;
    function getGraphemeBreakRawData() {
        // generated using https://github.com/alexdima/unicode-utils/blob/master/generate-grapheme-break.js
        return JSON.parse('[0,0,0,51592,51592,11,44424,44424,11,72251,72254,5,7150,7150,7,48008,48008,11,55176,55176,11,128420,128420,14,3276,3277,5,9979,9980,14,46216,46216,11,49800,49800,11,53384,53384,11,70726,70726,5,122915,122916,5,129320,129327,14,2558,2558,5,5906,5908,5,9762,9763,14,43360,43388,8,45320,45320,11,47112,47112,11,48904,48904,11,50696,50696,11,52488,52488,11,54280,54280,11,70082,70083,1,71350,71350,7,73111,73111,5,127892,127893,14,128726,128727,14,129473,129474,14,2027,2035,5,2901,2902,5,3784,3789,5,6754,6754,5,8418,8420,5,9877,9877,14,11088,11088,14,44008,44008,5,44872,44872,11,45768,45768,11,46664,46664,11,47560,47560,11,48456,48456,11,49352,49352,11,50248,50248,11,51144,51144,11,52040,52040,11,52936,52936,11,53832,53832,11,54728,54728,11,69811,69814,5,70459,70460,5,71096,71099,7,71998,71998,5,72874,72880,5,119149,119149,7,127374,127374,14,128335,128335,14,128482,128482,14,128765,128767,14,129399,129400,14,129680,129685,14,1476,1477,5,2377,2380,7,2759,2760,5,3137,3140,7,3458,3459,7,4153,4154,5,6432,6434,5,6978,6978,5,7675,7679,5,9723,9726,14,9823,9823,14,9919,9923,14,10035,10036,14,42736,42737,5,43596,43596,5,44200,44200,11,44648,44648,11,45096,45096,11,45544,45544,11,45992,45992,11,46440,46440,11,46888,46888,11,47336,47336,11,47784,47784,11,48232,48232,11,48680,48680,11,49128,49128,11,49576,49576,11,50024,50024,11,50472,50472,11,50920,50920,11,51368,51368,11,51816,51816,11,52264,52264,11,52712,52712,11,53160,53160,11,53608,53608,11,54056,54056,11,54504,54504,11,54952,54952,11,68108,68111,5,69933,69940,5,70197,70197,7,70498,70499,7,70845,70845,5,71229,71229,5,71727,71735,5,72154,72155,5,72344,72345,5,73023,73029,5,94095,94098,5,121403,121452,5,126981,127182,14,127538,127546,14,127990,127990,14,128391,128391,14,128445,128449,14,128500,128505,14,128752,128752,14,129160,129167,14,129356,129356,14,129432,129442,14,129648,129651,14,129751,131069,14,173,173,4,1757,1757,1,2274,2274,1,2494,2494,5,2641,2641,5,2876,2876,5,3014,3016,7,3262,3262,7,3393,3396,5,3570,3571,7,3968,3972,5,4228,4228,7,6086,6086,5,6679,6680,5,6912,6915,5,7080,7081,5,7380,7392,5,8252,8252,14,9096,9096,14,9748,9749,14,9784,9786,14,9833,9850,14,9890,9894,14,9938,9938,14,9999,9999,14,10085,10087,14,12349,12349,14,43136,43137,7,43454,43456,7,43755,43755,7,44088,44088,11,44312,44312,11,44536,44536,11,44760,44760,11,44984,44984,11,45208,45208,11,45432,45432,11,45656,45656,11,45880,45880,11,46104,46104,11,46328,46328,11,46552,46552,11,46776,46776,11,47000,47000,11,47224,47224,11,47448,47448,11,47672,47672,11,47896,47896,11,48120,48120,11,48344,48344,11,48568,48568,11,48792,48792,11,49016,49016,11,49240,49240,11,49464,49464,11,49688,49688,11,49912,49912,11,50136,50136,11,50360,50360,11,50584,50584,11,50808,50808,11,51032,51032,11,51256,51256,11,51480,51480,11,51704,51704,11,51928,51928,11,52152,52152,11,52376,52376,11,52600,52600,11,52824,52824,11,53048,53048,11,53272,53272,11,53496,53496,11,53720,53720,11,53944,53944,11,54168,54168,11,54392,54392,11,54616,54616,11,54840,54840,11,55064,55064,11,65438,65439,5,69633,69633,5,69837,69837,1,70018,70018,7,70188,70190,7,70368,70370,7,70465,70468,7,70712,70719,5,70835,70840,5,70850,70851,5,71132,71133,5,71340,71340,7,71458,71461,5,71985,71989,7,72002,72002,7,72193,72202,5,72281,72283,5,72766,72766,7,72885,72886,5,73104,73105,5,92912,92916,5,113824,113827,4,119173,119179,5,121505,121519,5,125136,125142,5,127279,127279,14,127489,127490,14,127570,127743,14,127900,127901,14,128254,128254,14,128369,128370,14,128400,128400,14,128425,128432,14,128468,128475,14,128489,128494,14,128715,128720,14,128745,128745,14,128759,128760,14,129004,129023,14,129296,129304,14,129340,129342,14,129388,129392,14,129404,129407,14,129454,129455,14,129485,129487,14,129659,129663,14,129719,129727,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2363,2363,7,2402,2403,5,2507,2508,7,2622,2624,7,2691,2691,7,2786,2787,5,2881,2884,5,3006,3006,5,3072,3072,5,3170,3171,5,3267,3268,7,3330,3331,7,3406,3406,1,3538,3540,5,3655,3662,5,3897,3897,5,4038,4038,5,4184,4185,5,4352,4447,8,6068,6069,5,6155,6157,5,6448,6449,7,6742,6742,5,6783,6783,5,6966,6970,5,7042,7042,7,7143,7143,7,7212,7219,5,7412,7412,5,8206,8207,4,8294,8303,4,8596,8601,14,9410,9410,14,9742,9742,14,9757,9757,14,9770,9770,14,9794,9794,14,9828,9828,14,9855,9855,14,9882,9882,14,9900,9903,14,9929,9933,14,9963,9967,14,9987,9988,14,10006,10006,14,10062,10062,14,10175,10175,14,11744,11775,5,42607,42607,5,43043,43044,7,43263,43263,5,43444,43445,7,43569,43570,5,43698,43700,5,43766,43766,5,44032,44032,11,44144,44144,11,44256,44256,11,44368,44368,11,44480,44480,11,44592,44592,11,44704,44704,11,44816,44816,11,44928,44928,11,45040,45040,11,45152,45152,11,45264,45264,11,45376,45376,11,45488,45488,11,45600,45600,11,45712,45712,11,45824,45824,11,45936,45936,11,46048,46048,11,46160,46160,11,46272,46272,11,46384,46384,11,46496,46496,11,46608,46608,11,46720,46720,11,46832,46832,11,46944,46944,11,47056,47056,11,47168,47168,11,47280,47280,11,47392,47392,11,47504,47504,11,47616,47616,11,47728,47728,11,47840,47840,11,47952,47952,11,48064,48064,11,48176,48176,11,48288,48288,11,48400,48400,11,48512,48512,11,48624,48624,11,48736,48736,11,48848,48848,11,48960,48960,11,49072,49072,11,49184,49184,11,49296,49296,11,49408,49408,11,49520,49520,11,49632,49632,11,49744,49744,11,49856,49856,11,49968,49968,11,50080,50080,11,50192,50192,11,50304,50304,11,50416,50416,11,50528,50528,11,50640,50640,11,50752,50752,11,50864,50864,11,50976,50976,11,51088,51088,11,51200,51200,11,51312,51312,11,51424,51424,11,51536,51536,11,51648,51648,11,51760,51760,11,51872,51872,11,51984,51984,11,52096,52096,11,52208,52208,11,52320,52320,11,52432,52432,11,52544,52544,11,52656,52656,11,52768,52768,11,52880,52880,11,52992,52992,11,53104,53104,11,53216,53216,11,53328,53328,11,53440,53440,11,53552,53552,11,53664,53664,11,53776,53776,11,53888,53888,11,54000,54000,11,54112,54112,11,54224,54224,11,54336,54336,11,54448,54448,11,54560,54560,11,54672,54672,11,54784,54784,11,54896,54896,11,55008,55008,11,55120,55120,11,64286,64286,5,66272,66272,5,68900,68903,5,69762,69762,7,69817,69818,5,69927,69931,5,70003,70003,5,70070,70078,5,70094,70094,7,70194,70195,7,70206,70206,5,70400,70401,5,70463,70463,7,70475,70477,7,70512,70516,5,70722,70724,5,70832,70832,5,70842,70842,5,70847,70848,5,71088,71089,7,71102,71102,7,71219,71226,5,71231,71232,5,71342,71343,7,71453,71455,5,71463,71467,5,71737,71738,5,71995,71996,5,72000,72000,7,72145,72147,7,72160,72160,5,72249,72249,7,72273,72278,5,72330,72342,5,72752,72758,5,72850,72871,5,72882,72883,5,73018,73018,5,73031,73031,5,73109,73109,5,73461,73462,7,94031,94031,5,94192,94193,7,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,126976,126979,14,127184,127231,14,127344,127345,14,127405,127461,14,127514,127514,14,127561,127567,14,127778,127779,14,127896,127896,14,127985,127986,14,127995,127999,5,128326,128328,14,128360,128366,14,128378,128378,14,128394,128397,14,128405,128406,14,128422,128423,14,128435,128443,14,128453,128464,14,128479,128480,14,128484,128487,14,128496,128498,14,128640,128709,14,128723,128724,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129096,129103,14,129292,129292,14,129311,129311,14,129329,129330,14,129344,129349,14,129360,129374,14,129394,129394,14,129402,129402,14,129413,129425,14,129445,129450,14,129466,129471,14,129483,129483,14,129511,129535,14,129653,129655,14,129667,129670,14,129705,129711,14,129731,129743,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2307,2307,7,2366,2368,7,2382,2383,7,2434,2435,7,2497,2500,5,2519,2519,5,2563,2563,7,2631,2632,5,2677,2677,5,2750,2752,7,2763,2764,7,2817,2817,5,2879,2879,5,2891,2892,7,2914,2915,5,3008,3008,5,3021,3021,5,3076,3076,5,3146,3149,5,3202,3203,7,3264,3265,7,3271,3272,7,3298,3299,5,3390,3390,5,3402,3404,7,3426,3427,5,3535,3535,5,3544,3550,7,3635,3635,7,3763,3763,7,3893,3893,5,3953,3966,5,3981,3991,5,4145,4145,7,4157,4158,5,4209,4212,5,4237,4237,5,4520,4607,10,5970,5971,5,6071,6077,5,6089,6099,5,6277,6278,5,6439,6440,5,6451,6456,7,6683,6683,5,6744,6750,5,6765,6770,7,6846,6846,5,6964,6964,5,6972,6972,5,7019,7027,5,7074,7077,5,7083,7085,5,7146,7148,7,7154,7155,7,7222,7223,5,7394,7400,5,7416,7417,5,8204,8204,5,8233,8233,4,8288,8292,4,8413,8416,5,8482,8482,14,8986,8987,14,9193,9203,14,9654,9654,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9775,14,9792,9792,14,9800,9811,14,9825,9826,14,9831,9831,14,9852,9853,14,9872,9873,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9936,9936,14,9941,9960,14,9974,9974,14,9982,9985,14,9992,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10145,10145,14,11013,11015,14,11503,11505,5,12334,12335,5,12951,12951,14,42612,42621,5,43014,43014,5,43047,43047,7,43204,43205,5,43335,43345,5,43395,43395,7,43450,43451,7,43561,43566,5,43573,43574,5,43644,43644,5,43710,43711,5,43758,43759,7,44005,44005,5,44012,44012,7,44060,44060,11,44116,44116,11,44172,44172,11,44228,44228,11,44284,44284,11,44340,44340,11,44396,44396,11,44452,44452,11,44508,44508,11,44564,44564,11,44620,44620,11,44676,44676,11,44732,44732,11,44788,44788,11,44844,44844,11,44900,44900,11,44956,44956,11,45012,45012,11,45068,45068,11,45124,45124,11,45180,45180,11,45236,45236,11,45292,45292,11,45348,45348,11,45404,45404,11,45460,45460,11,45516,45516,11,45572,45572,11,45628,45628,11,45684,45684,11,45740,45740,11,45796,45796,11,45852,45852,11,45908,45908,11,45964,45964,11,46020,46020,11,46076,46076,11,46132,46132,11,46188,46188,11,46244,46244,11,46300,46300,11,46356,46356,11,46412,46412,11,46468,46468,11,46524,46524,11,46580,46580,11,46636,46636,11,46692,46692,11,46748,46748,11,46804,46804,11,46860,46860,11,46916,46916,11,46972,46972,11,47028,47028,11,47084,47084,11,47140,47140,11,47196,47196,11,47252,47252,11,47308,47308,11,47364,47364,11,47420,47420,11,47476,47476,11,47532,47532,11,47588,47588,11,47644,47644,11,47700,47700,11,47756,47756,11,47812,47812,11,47868,47868,11,47924,47924,11,47980,47980,11,48036,48036,11,48092,48092,11,48148,48148,11,48204,48204,11,48260,48260,11,48316,48316,11,48372,48372,11,48428,48428,11,48484,48484,11,48540,48540,11,48596,48596,11,48652,48652,11,48708,48708,11,48764,48764,11,48820,48820,11,48876,48876,11,48932,48932,11,48988,48988,11,49044,49044,11,49100,49100,11,49156,49156,11,49212,49212,11,49268,49268,11,49324,49324,11,49380,49380,11,49436,49436,11,49492,49492,11,49548,49548,11,49604,49604,11,49660,49660,11,49716,49716,11,49772,49772,11,49828,49828,11,49884,49884,11,49940,49940,11,49996,49996,11,50052,50052,11,50108,50108,11,50164,50164,11,50220,50220,11,50276,50276,11,50332,50332,11,50388,50388,11,50444,50444,11,50500,50500,11,50556,50556,11,50612,50612,11,50668,50668,11,50724,50724,11,50780,50780,11,50836,50836,11,50892,50892,11,50948,50948,11,51004,51004,11,51060,51060,11,51116,51116,11,51172,51172,11,51228,51228,11,51284,51284,11,51340,51340,11,51396,51396,11,51452,51452,11,51508,51508,11,51564,51564,11,51620,51620,11,51676,51676,11,51732,51732,11,51788,51788,11,51844,51844,11,51900,51900,11,51956,51956,11,52012,52012,11,52068,52068,11,52124,52124,11,52180,52180,11,52236,52236,11,52292,52292,11,52348,52348,11,52404,52404,11,52460,52460,11,52516,52516,11,52572,52572,11,52628,52628,11,52684,52684,11,52740,52740,11,52796,52796,11,52852,52852,11,52908,52908,11,52964,52964,11,53020,53020,11,53076,53076,11,53132,53132,11,53188,53188,11,53244,53244,11,53300,53300,11,53356,53356,11,53412,53412,11,53468,53468,11,53524,53524,11,53580,53580,11,53636,53636,11,53692,53692,11,53748,53748,11,53804,53804,11,53860,53860,11,53916,53916,11,53972,53972,11,54028,54028,11,54084,54084,11,54140,54140,11,54196,54196,11,54252,54252,11,54308,54308,11,54364,54364,11,54420,54420,11,54476,54476,11,54532,54532,11,54588,54588,11,54644,54644,11,54700,54700,11,54756,54756,11,54812,54812,11,54868,54868,11,54924,54924,11,54980,54980,11,55036,55036,11,55092,55092,11,55148,55148,11,55216,55238,9,65056,65071,5,65529,65531,4,68097,68099,5,68159,68159,5,69446,69456,5,69688,69702,5,69808,69810,7,69815,69816,7,69821,69821,1,69888,69890,5,69932,69932,7,69957,69958,7,70016,70017,5,70067,70069,7,70079,70080,7,70089,70092,5,70095,70095,5,70191,70193,5,70196,70196,5,70198,70199,5,70367,70367,5,70371,70378,5,70402,70403,7,70462,70462,5,70464,70464,5,70471,70472,7,70487,70487,5,70502,70508,5,70709,70711,7,70720,70721,7,70725,70725,7,70750,70750,5,70833,70834,7,70841,70841,7,70843,70844,7,70846,70846,7,70849,70849,7,71087,71087,5,71090,71093,5,71100,71101,5,71103,71104,5,71216,71218,7,71227,71228,7,71230,71230,7,71339,71339,5,71341,71341,5,71344,71349,5,71351,71351,5,71456,71457,7,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123628,123631,5,125252,125258,5,126980,126980,14,127183,127183,14,127245,127247,14,127340,127343,14,127358,127359,14,127377,127386,14,127462,127487,6,127491,127503,14,127535,127535,14,127548,127551,14,127568,127569,14,127744,127777,14,127780,127891,14,127894,127895,14,127897,127899,14,127902,127984,14,127987,127989,14,127991,127994,14,128000,128253,14,128255,128317,14,128329,128334,14,128336,128359,14,128367,128368,14,128371,128377,14,128379,128390,14,128392,128393,14,128398,128399,14,128401,128404,14,128407,128419,14,128421,128421,14,128424,128424,14,128433,128434,14,128444,128444,14,128450,128452,14,128465,128467,14,128476,128478,14,128481,128481,14,128483,128483,14,128488,128488,14,128495,128495,14,128499,128499,14,128506,128591,14,128710,128714,14,128721,128722,14,128725,128725,14,128728,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129664,129666,14,129671,129679,14,129686,129704,14,129712,129718,14,129728,129730,14,129744,129750,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2259,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3134,3136,5,3142,3144,5,3157,3158,5,3201,3201,5,3260,3260,5,3263,3263,5,3266,3266,5,3270,3270,5,3274,3275,7,3285,3286,5,3328,3329,5,3387,3388,5,3391,3392,7,3398,3400,7,3405,3405,5,3415,3415,5,3457,3457,5,3530,3530,5,3536,3537,7,3542,3542,5,3551,3551,5,3633,3633,5,3636,3642,5,3761,3761,5,3764,3772,5,3864,3865,5,3895,3895,5,3902,3903,7,3967,3967,7,3974,3975,5,3993,4028,5,4141,4144,5,4146,4151,5,4155,4156,7,4182,4183,7,4190,4192,5,4226,4226,5,4229,4230,5,4253,4253,5,4448,4519,9,4957,4959,5,5938,5940,5,6002,6003,5,6070,6070,7,6078,6085,7,6087,6088,7,6109,6109,5,6158,6158,4,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6848,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7673,5,8203,8203,4,8205,8205,13,8232,8232,4,8234,8238,4,8265,8265,14,8293,8293,4,8400,8412,5,8417,8417,5,8421,8432,5,8505,8505,14,8617,8618,14,9000,9000,14,9167,9167,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9776,9783,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9935,14,9937,9937,14,9939,9940,14,9961,9962,14,9968,9973,14,9975,9978,14,9981,9981,14,9986,9986,14,9989,9989,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10084,14,10133,10135,14,10160,10160,14,10548,10549,14,11035,11036,14,11093,11093,14,11647,11647,5,12330,12333,5,12336,12336,14,12441,12442,5,12953,12953,14,42608,42610,5,42654,42655,5,43010,43010,5,43019,43019,5,43045,43046,5,43052,43052,5,43188,43203,7,43232,43249,5,43302,43309,5,43346,43347,7,43392,43394,5,43443,43443,5,43446,43449,5,43452,43453,5,43493,43493,5,43567,43568,7,43571,43572,7,43587,43587,5,43597,43597,7,43696,43696,5,43703,43704,5,43713,43713,5,43756,43757,5,43765,43765,7,44003,44004,7,44006,44007,7,44009,44010,7,44013,44013,5,44033,44059,12,44061,44087,12,44089,44115,12,44117,44143,12,44145,44171,12,44173,44199,12,44201,44227,12,44229,44255,12,44257,44283,12,44285,44311,12,44313,44339,12,44341,44367,12,44369,44395,12,44397,44423,12,44425,44451,12,44453,44479,12,44481,44507,12,44509,44535,12,44537,44563,12,44565,44591,12,44593,44619,12,44621,44647,12,44649,44675,12,44677,44703,12,44705,44731,12,44733,44759,12,44761,44787,12,44789,44815,12,44817,44843,12,44845,44871,12,44873,44899,12,44901,44927,12,44929,44955,12,44957,44983,12,44985,45011,12,45013,45039,12,45041,45067,12,45069,45095,12,45097,45123,12,45125,45151,12,45153,45179,12,45181,45207,12,45209,45235,12,45237,45263,12,45265,45291,12,45293,45319,12,45321,45347,12,45349,45375,12,45377,45403,12,45405,45431,12,45433,45459,12,45461,45487,12,45489,45515,12,45517,45543,12,45545,45571,12,45573,45599,12,45601,45627,12,45629,45655,12,45657,45683,12,45685,45711,12,45713,45739,12,45741,45767,12,45769,45795,12,45797,45823,12,45825,45851,12,45853,45879,12,45881,45907,12,45909,45935,12,45937,45963,12,45965,45991,12,45993,46019,12,46021,46047,12,46049,46075,12,46077,46103,12,46105,46131,12,46133,46159,12,46161,46187,12,46189,46215,12,46217,46243,12,46245,46271,12,46273,46299,12,46301,46327,12,46329,46355,12,46357,46383,12,46385,46411,12,46413,46439,12,46441,46467,12,46469,46495,12,46497,46523,12,46525,46551,12,46553,46579,12,46581,46607,12,46609,46635,12,46637,46663,12,46665,46691,12,46693,46719,12,46721,46747,12,46749,46775,12,46777,46803,12,46805,46831,12,46833,46859,12,46861,46887,12,46889,46915,12,46917,46943,12,46945,46971,12,46973,46999,12,47001,47027,12,47029,47055,12,47057,47083,12,47085,47111,12,47113,47139,12,47141,47167,12,47169,47195,12,47197,47223,12,47225,47251,12,47253,47279,12,47281,47307,12,47309,47335,12,47337,47363,12,47365,47391,12,47393,47419,12,47421,47447,12,47449,47475,12,47477,47503,12,47505,47531,12,47533,47559,12,47561,47587,12,47589,47615,12,47617,47643,12,47645,47671,12,47673,47699,12,47701,47727,12,47729,47755,12,47757,47783,12,47785,47811,12,47813,47839,12,47841,47867,12,47869,47895,12,47897,47923,12,47925,47951,12,47953,47979,12,47981,48007,12,48009,48035,12,48037,48063,12,48065,48091,12,48093,48119,12,48121,48147,12,48149,48175,12,48177,48203,12,48205,48231,12,48233,48259,12,48261,48287,12,48289,48315,12,48317,48343,12,48345,48371,12,48373,48399,12,48401,48427,12,48429,48455,12,48457,48483,12,48485,48511,12,48513,48539,12,48541,48567,12,48569,48595,12,48597,48623,12,48625,48651,12,48653,48679,12,48681,48707,12,48709,48735,12,48737,48763,12,48765,48791,12,48793,48819,12,48821,48847,12,48849,48875,12,48877,48903,12,48905,48931,12,48933,48959,12,48961,48987,12,48989,49015,12,49017,49043,12,49045,49071,12,49073,49099,12,49101,49127,12,49129,49155,12,49157,49183,12,49185,49211,12,49213,49239,12,49241,49267,12,49269,49295,12,49297,49323,12,49325,49351,12,49353,49379,12,49381,49407,12,49409,49435,12,49437,49463,12,49465,49491,12,49493,49519,12,49521,49547,12,49549,49575,12,49577,49603,12,49605,49631,12,49633,49659,12,49661,49687,12,49689,49715,12,49717,49743,12,49745,49771,12,49773,49799,12,49801,49827,12,49829,49855,12,49857,49883,12,49885,49911,12,49913,49939,12,49941,49967,12,49969,49995,12,49997,50023,12,50025,50051,12,50053,50079,12,50081,50107,12,50109,50135,12,50137,50163,12,50165,50191,12,50193,50219,12,50221,50247,12,50249,50275,12,50277,50303,12,50305,50331,12,50333,50359,12,50361,50387,12,50389,50415,12,50417,50443,12,50445,50471,12,50473,50499,12,50501,50527,12,50529,50555,12,50557,50583,12,50585,50611,12,50613,50639,12,50641,50667,12,50669,50695,12,50697,50723,12,50725,50751,12,50753,50779,12,50781,50807,12,50809,50835,12,50837,50863,12,50865,50891,12,50893,50919,12,50921,50947,12,50949,50975,12,50977,51003,12,51005,51031,12,51033,51059,12,51061,51087,12,51089,51115,12,51117,51143,12,51145,51171,12,51173,51199,12,51201,51227,12,51229,51255,12,51257,51283,12,51285,51311,12,51313,51339,12,51341,51367,12,51369,51395,12,51397,51423,12,51425,51451,12,51453,51479,12,51481,51507,12,51509,51535,12,51537,51563,12,51565,51591,12,51593,51619,12,51621,51647,12,51649,51675,12,51677,51703,12,51705,51731,12,51733,51759,12,51761,51787,12,51789,51815,12,51817,51843,12,51845,51871,12,51873,51899,12,51901,51927,12,51929,51955,12,51957,51983,12,51985,52011,12,52013,52039,12,52041,52067,12,52069,52095,12,52097,52123,12,52125,52151,12,52153,52179,12,52181,52207,12,52209,52235,12,52237,52263,12,52265,52291,12,52293,52319,12,52321,52347,12,52349,52375,12,52377,52403,12,52405,52431,12,52433,52459,12,52461,52487,12,52489,52515,12,52517,52543,12,52545,52571,12,52573,52599,12,52601,52627,12,52629,52655,12,52657,52683,12,52685,52711,12,52713,52739,12,52741,52767,12,52769,52795,12,52797,52823,12,52825,52851,12,52853,52879,12,52881,52907,12,52909,52935,12,52937,52963,12,52965,52991,12,52993,53019,12,53021,53047,12,53049,53075,12,53077,53103,12,53105,53131,12,53133,53159,12,53161,53187,12,53189,53215,12,53217,53243,12,53245,53271,12,53273,53299,12,53301,53327,12,53329,53355,12,53357,53383,12,53385,53411,12,53413,53439,12,53441,53467,12,53469,53495,12,53497,53523,12,53525,53551,12,53553,53579,12,53581,53607,12,53609,53635,12,53637,53663,12,53665,53691,12,53693,53719,12,53721,53747,12,53749,53775,12,53777,53803,12,53805,53831,12,53833,53859,12,53861,53887,12,53889,53915,12,53917,53943,12,53945,53971,12,53973,53999,12,54001,54027,12,54029,54055,12,54057,54083,12,54085,54111,12,54113,54139,12,54141,54167,12,54169,54195,12,54197,54223,12,54225,54251,12,54253,54279,12,54281,54307,12,54309,54335,12,54337,54363,12,54365,54391,12,54393,54419,12,54421,54447,12,54449,54475,12,54477,54503,12,54505,54531,12,54533,54559,12,54561,54587,12,54589,54615,12,54617,54643,12,54645,54671,12,54673,54699,12,54701,54727,12,54729,54755,12,54757,54783,12,54785,54811,12,54813,54839,12,54841,54867,12,54869,54895,12,54897,54923,12,54925,54951,12,54953,54979,12,54981,55007,12,55009,55035,12,55037,55063,12,55065,55091,12,55093,55119,12,55121,55147,12,55149,55175,12,55177,55203,12,55243,55291,10,65024,65039,5,65279,65279,4,65520,65528,4,66045,66045,5,66422,66426,5,68101,68102,5,68152,68154,5,68325,68326,5,69291,69292,5,69632,69632,7,69634,69634,7,69759,69761,5]');
    }
});
//#endregion

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[11/*vs/base/common/buffer*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/strings*/,31/*vs/base/common/stream*/]), function (require, exports, strings, streams) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prefixedBufferStream = exports.prefixedBufferReadable = exports.newWriteableBufferStream = exports.streamToBufferReadableStream = exports.bufferToStream = exports.bufferedStreamToBuffer = exports.streamToBuffer = exports.bufferToReadable = exports.readableToBuffer = exports.writeUInt8 = exports.readUInt8 = exports.writeUInt32LE = exports.readUInt32LE = exports.writeUInt32BE = exports.readUInt32BE = exports.writeUInt16LE = exports.readUInt16LE = exports.VSBuffer = void 0;
    const hasBuffer = (typeof Buffer !== 'undefined');
    const hasTextEncoder = (typeof TextEncoder !== 'undefined');
    const hasTextDecoder = (typeof TextDecoder !== 'undefined');
    let textEncoder;
    let textDecoder;
    class VSBuffer {
        constructor(buffer) {
            this.buffer = buffer;
            this.byteLength = this.buffer.byteLength;
        }
        static alloc(byteLength) {
            if (hasBuffer) {
                return new VSBuffer(Buffer.allocUnsafe(byteLength));
            }
            else {
                return new VSBuffer(new Uint8Array(byteLength));
            }
        }
        static wrap(actual) {
            if (hasBuffer && !(Buffer.isBuffer(actual))) {
                // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
                // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
                actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
            }
            return new VSBuffer(actual);
        }
        static fromString(source, options) {
            const dontUseNodeBuffer = (options === null || options === void 0 ? void 0 : options.dontUseNodeBuffer) || false;
            if (!dontUseNodeBuffer && hasBuffer) {
                return new VSBuffer(Buffer.from(source));
            }
            else if (hasTextEncoder) {
                if (!textEncoder) {
                    textEncoder = new TextEncoder();
                }
                return new VSBuffer(textEncoder.encode(source));
            }
            else {
                return new VSBuffer(strings.encodeUTF8(source));
            }
        }
        static concat(buffers, totalLength) {
            if (typeof totalLength === 'undefined') {
                totalLength = 0;
                for (let i = 0, len = buffers.length; i < len; i++) {
                    totalLength += buffers[i].byteLength;
                }
            }
            const ret = VSBuffer.alloc(totalLength);
            let offset = 0;
            for (let i = 0, len = buffers.length; i < len; i++) {
                const element = buffers[i];
                ret.set(element, offset);
                offset += element.byteLength;
            }
            return ret;
        }
        toString() {
            if (hasBuffer) {
                return this.buffer.toString();
            }
            else if (hasTextDecoder) {
                if (!textDecoder) {
                    textDecoder = new TextDecoder();
                }
                return textDecoder.decode(this.buffer);
            }
            else {
                return strings.decodeUTF8(this.buffer);
            }
        }
        slice(start, end) {
            // IMPORTANT: use subarray instead of slice because TypedArray#slice
            // creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
            // ensures the same, performant, behaviour.
            return new VSBuffer(this.buffer.subarray(start /*bad lib.d.ts*/, end));
        }
        set(array, offset) {
            if (array instanceof VSBuffer) {
                this.buffer.set(array.buffer, offset);
            }
            else {
                this.buffer.set(array, offset);
            }
        }
        readUInt32BE(offset) {
            return readUInt32BE(this.buffer, offset);
        }
        writeUInt32BE(value, offset) {
            writeUInt32BE(this.buffer, value, offset);
        }
        readUInt32LE(offset) {
            return readUInt32LE(this.buffer, offset);
        }
        writeUInt32LE(value, offset) {
            writeUInt32LE(this.buffer, value, offset);
        }
        readUInt8(offset) {
            return readUInt8(this.buffer, offset);
        }
        writeUInt8(value, offset) {
            writeUInt8(this.buffer, value, offset);
        }
    }
    exports.VSBuffer = VSBuffer;
    function readUInt16LE(source, offset) {
        return (((source[offset + 0] << 0) >>> 0) |
            ((source[offset + 1] << 8) >>> 0));
    }
    exports.readUInt16LE = readUInt16LE;
    function writeUInt16LE(destination, value, offset) {
        destination[offset + 0] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 1] = (value & 0b11111111);
    }
    exports.writeUInt16LE = writeUInt16LE;
    function readUInt32BE(source, offset) {
        return (source[offset] * 2 ** 24
            + source[offset + 1] * 2 ** 16
            + source[offset + 2] * 2 ** 8
            + source[offset + 3]);
    }
    exports.readUInt32BE = readUInt32BE;
    function writeUInt32BE(destination, value, offset) {
        destination[offset + 3] = value;
        value = value >>> 8;
        destination[offset + 2] = value;
        value = value >>> 8;
        destination[offset + 1] = value;
        value = value >>> 8;
        destination[offset] = value;
    }
    exports.writeUInt32BE = writeUInt32BE;
    function readUInt32LE(source, offset) {
        return (((source[offset + 0] << 0) >>> 0) |
            ((source[offset + 1] << 8) >>> 0) |
            ((source[offset + 2] << 16) >>> 0) |
            ((source[offset + 3] << 24) >>> 0));
    }
    exports.readUInt32LE = readUInt32LE;
    function writeUInt32LE(destination, value, offset) {
        destination[offset + 0] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 1] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 2] = (value & 0b11111111);
        value = value >>> 8;
        destination[offset + 3] = (value & 0b11111111);
    }
    exports.writeUInt32LE = writeUInt32LE;
    function readUInt8(source, offset) {
        return source[offset];
    }
    exports.readUInt8 = readUInt8;
    function writeUInt8(destination, value, offset) {
        destination[offset] = value;
    }
    exports.writeUInt8 = writeUInt8;
    function readableToBuffer(readable) {
        return streams.consumeReadable(readable, chunks => VSBuffer.concat(chunks));
    }
    exports.readableToBuffer = readableToBuffer;
    function bufferToReadable(buffer) {
        return streams.toReadable(buffer);
    }
    exports.bufferToReadable = bufferToReadable;
    function streamToBuffer(stream) {
        return streams.consumeStream(stream, chunks => VSBuffer.concat(chunks));
    }
    exports.streamToBuffer = streamToBuffer;
    async function bufferedStreamToBuffer(bufferedStream) {
        if (bufferedStream.ended) {
            return VSBuffer.concat(bufferedStream.buffer);
        }
        return VSBuffer.concat([
            // Include already read chunks...
            ...bufferedStream.buffer,
            // ...and all additional chunks
            await streamToBuffer(bufferedStream.stream)
        ]);
    }
    exports.bufferedStreamToBuffer = bufferedStreamToBuffer;
    function bufferToStream(buffer) {
        return streams.toStream(buffer, chunks => VSBuffer.concat(chunks));
    }
    exports.bufferToStream = bufferToStream;
    function streamToBufferReadableStream(stream) {
        return streams.transform(stream, { data: data => typeof data === 'string' ? VSBuffer.fromString(data) : VSBuffer.wrap(data) }, chunks => VSBuffer.concat(chunks));
    }
    exports.streamToBufferReadableStream = streamToBufferReadableStream;
    function newWriteableBufferStream(options) {
        return streams.newWriteableStream(chunks => VSBuffer.concat(chunks), options);
    }
    exports.newWriteableBufferStream = newWriteableBufferStream;
    function prefixedBufferReadable(prefix, readable) {
        return streams.prefixedReadable(prefix, readable, chunks => VSBuffer.concat(chunks));
    }
    exports.prefixedBufferReadable = prefixedBufferReadable;
    function prefixedBufferStream(prefix, stream) {
        return streams.prefixedStream(prefix, stream, chunks => VSBuffer.concat(chunks));
    }
    exports.prefixedBufferStream = prefixedBufferStream;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[12/*vs/base/common/hash*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/strings*/]), function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StringSHA1 = exports.toHexString = exports.Hasher = exports.stringHash = exports.doHash = exports.hash = void 0;
    /**
     * Return a hash value for an object.
     */
    function hash(obj) {
        return doHash(obj, 0);
    }
    exports.hash = hash;
    function doHash(obj, hashVal) {
        switch (typeof obj) {
            case 'object':
                if (obj === null) {
                    return numberHash(349, hashVal);
                }
                else if (Array.isArray(obj)) {
                    return arrayHash(obj, hashVal);
                }
                return objectHash(obj, hashVal);
            case 'string':
                return stringHash(obj, hashVal);
            case 'boolean':
                return booleanHash(obj, hashVal);
            case 'number':
                return numberHash(obj, hashVal);
            case 'undefined':
                return numberHash(937, hashVal);
            default:
                return numberHash(617, hashVal);
        }
    }
    exports.doHash = doHash;
    function numberHash(val, initialHashVal) {
        return (((initialHashVal << 5) - initialHashVal) + val) | 0; // hashVal * 31 + ch, keep as int32
    }
    function booleanHash(b, initialHashVal) {
        return numberHash(b ? 433 : 863, initialHashVal);
    }
    function stringHash(s, hashVal) {
        hashVal = numberHash(149417, hashVal);
        for (let i = 0, length = s.length; i < length; i++) {
            hashVal = numberHash(s.charCodeAt(i), hashVal);
        }
        return hashVal;
    }
    exports.stringHash = stringHash;
    function arrayHash(arr, initialHashVal) {
        initialHashVal = numberHash(104579, initialHashVal);
        return arr.reduce((hashVal, item) => doHash(item, hashVal), initialHashVal);
    }
    function objectHash(obj, initialHashVal) {
        initialHashVal = numberHash(181387, initialHashVal);
        return Object.keys(obj).sort().reduce((hashVal, key) => {
            hashVal = stringHash(key, hashVal);
            return doHash(obj[key], hashVal);
        }, initialHashVal);
    }
    class Hasher {
        constructor() {
            this._value = 0;
        }
        get value() {
            return this._value;
        }
        hash(obj) {
            this._value = doHash(obj, this._value);
            return this._value;
        }
    }
    exports.Hasher = Hasher;
    var SHA1Constant;
    (function (SHA1Constant) {
        SHA1Constant[SHA1Constant["BLOCK_SIZE"] = 64] = "BLOCK_SIZE";
        SHA1Constant[SHA1Constant["UNICODE_REPLACEMENT"] = 65533] = "UNICODE_REPLACEMENT";
    })(SHA1Constant || (SHA1Constant = {}));
    function leftRotate(value, bits, totalBits = 32) {
        // delta + bits = totalBits
        const delta = totalBits - bits;
        // All ones, expect `delta` zeros aligned to the right
        const mask = ~((1 << delta) - 1);
        // Join (value left-shifted `bits` bits) with (masked value right-shifted `delta` bits)
        return ((value << bits) | ((mask & value) >>> delta)) >>> 0;
    }
    function fill(dest, index = 0, count = dest.byteLength, value = 0) {
        for (let i = 0; i < count; i++) {
            dest[index + i] = value;
        }
    }
    function leftPad(value, length, char = '0') {
        while (value.length < length) {
            value = char + value;
        }
        return value;
    }
    function toHexString(bufferOrValue, bitsize = 32) {
        if (bufferOrValue instanceof ArrayBuffer) {
            return Array.from(new Uint8Array(bufferOrValue)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return leftPad((bufferOrValue >>> 0).toString(16), bitsize / 4);
    }
    exports.toHexString = toHexString;
    /**
     * A SHA1 implementation that works with strings and does not allocate.
     */
    class StringSHA1 {
        constructor() {
            this._h0 = 0x67452301;
            this._h1 = 0xEFCDAB89;
            this._h2 = 0x98BADCFE;
            this._h3 = 0x10325476;
            this._h4 = 0xC3D2E1F0;
            this._buff = new Uint8Array(64 /* BLOCK_SIZE */ + 3 /* to fit any utf-8 */);
            this._buffDV = new DataView(this._buff.buffer);
            this._buffLen = 0;
            this._totalLen = 0;
            this._leftoverHighSurrogate = 0;
            this._finished = false;
        }
        update(str) {
            const strLen = str.length;
            if (strLen === 0) {
                return;
            }
            const buff = this._buff;
            let buffLen = this._buffLen;
            let leftoverHighSurrogate = this._leftoverHighSurrogate;
            let charCode;
            let offset;
            if (leftoverHighSurrogate !== 0) {
                charCode = leftoverHighSurrogate;
                offset = -1;
                leftoverHighSurrogate = 0;
            }
            else {
                charCode = str.charCodeAt(0);
                offset = 0;
            }
            while (true) {
                let codePoint = charCode;
                if (strings.isHighSurrogate(charCode)) {
                    if (offset + 1 < strLen) {
                        const nextCharCode = str.charCodeAt(offset + 1);
                        if (strings.isLowSurrogate(nextCharCode)) {
                            offset++;
                            codePoint = strings.computeCodePoint(charCode, nextCharCode);
                        }
                        else {
                            // illegal => unicode replacement character
                            codePoint = 65533 /* UNICODE_REPLACEMENT */;
                        }
                    }
                    else {
                        // last character is a surrogate pair
                        leftoverHighSurrogate = charCode;
                        break;
                    }
                }
                else if (strings.isLowSurrogate(charCode)) {
                    // illegal => unicode replacement character
                    codePoint = 65533 /* UNICODE_REPLACEMENT */;
                }
                buffLen = this._push(buff, buffLen, codePoint);
                offset++;
                if (offset < strLen) {
                    charCode = str.charCodeAt(offset);
                }
                else {
                    break;
                }
            }
            this._buffLen = buffLen;
            this._leftoverHighSurrogate = leftoverHighSurrogate;
        }
        _push(buff, buffLen, codePoint) {
            if (codePoint < 0x0080) {
                buff[buffLen++] = codePoint;
            }
            else if (codePoint < 0x0800) {
                buff[buffLen++] = 0b11000000 | ((codePoint & 0b00000000000000000000011111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else if (codePoint < 0x10000) {
                buff[buffLen++] = 0b11100000 | ((codePoint & 0b00000000000000001111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else {
                buff[buffLen++] = 0b11110000 | ((codePoint & 0b00000000000111000000000000000000) >>> 18);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000111111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            if (buffLen >= 64 /* BLOCK_SIZE */) {
                this._step();
                buffLen -= 64 /* BLOCK_SIZE */;
                this._totalLen += 64 /* BLOCK_SIZE */;
                // take last 3 in case of UTF8 overflow
                buff[0] = buff[64 /* BLOCK_SIZE */ + 0];
                buff[1] = buff[64 /* BLOCK_SIZE */ + 1];
                buff[2] = buff[64 /* BLOCK_SIZE */ + 2];
            }
            return buffLen;
        }
        digest() {
            if (!this._finished) {
                this._finished = true;
                if (this._leftoverHighSurrogate) {
                    // illegal => unicode replacement character
                    this._leftoverHighSurrogate = 0;
                    this._buffLen = this._push(this._buff, this._buffLen, 65533 /* UNICODE_REPLACEMENT */);
                }
                this._totalLen += this._buffLen;
                this._wrapUp();
            }
            return toHexString(this._h0) + toHexString(this._h1) + toHexString(this._h2) + toHexString(this._h3) + toHexString(this._h4);
        }
        _wrapUp() {
            this._buff[this._buffLen++] = 0x80;
            fill(this._buff, this._buffLen);
            if (this._buffLen > 56) {
                this._step();
                fill(this._buff);
            }
            // this will fit because the mantissa can cover up to 52 bits
            const ml = 8 * this._totalLen;
            this._buffDV.setUint32(56, Math.floor(ml / 4294967296), false);
            this._buffDV.setUint32(60, ml % 4294967296, false);
            this._step();
        }
        _step() {
            const bigBlock32 = StringSHA1._bigBlock32;
            const data = this._buffDV;
            for (let j = 0; j < 64 /* 16*4 */; j += 4) {
                bigBlock32.setUint32(j, data.getUint32(j, false), false);
            }
            for (let j = 64; j < 320 /* 80*4 */; j += 4) {
                bigBlock32.setUint32(j, leftRotate((bigBlock32.getUint32(j - 12, false) ^ bigBlock32.getUint32(j - 32, false) ^ bigBlock32.getUint32(j - 56, false) ^ bigBlock32.getUint32(j - 64, false)), 1), false);
            }
            let a = this._h0;
            let b = this._h1;
            let c = this._h2;
            let d = this._h3;
            let e = this._h4;
            let f, k;
            let temp;
            for (let j = 0; j < 80; j++) {
                if (j < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                }
                else if (j < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                }
                else if (j < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                }
                else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }
                temp = (leftRotate(a, 5) + f + e + k + bigBlock32.getUint32(j * 4, false)) & 0xffffffff;
                e = d;
                d = c;
                c = leftRotate(b, 30);
                b = a;
                a = temp;
            }
            this._h0 = (this._h0 + a) & 0xffffffff;
            this._h1 = (this._h1 + b) & 0xffffffff;
            this._h2 = (this._h2 + c) & 0xffffffff;
            this._h3 = (this._h3 + d) & 0xffffffff;
            this._h4 = (this._h4 + e) & 0xffffffff;
        }
    }
    exports.StringSHA1 = StringSHA1;
    StringSHA1._bigBlock32 = new DataView(new ArrayBuffer(320)); // 80 * 4 = 320
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[32/*vs/base/common/diff/diff*/], __M([0/*require*/,1/*exports*/,23/*vs/base/common/diff/diffChange*/,12/*vs/base/common/hash*/]), function (require, exports, diffChange_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LcsDiff = exports.MyArray = exports.Debug = exports.stringDiff = exports.StringDiffSequence = void 0;
    class StringDiffSequence {
        constructor(source) {
            this.source = source;
        }
        getElements() {
            const source = this.source;
            const characters = new Int32Array(source.length);
            for (let i = 0, len = source.length; i < len; i++) {
                characters[i] = source.charCodeAt(i);
            }
            return characters;
        }
    }
    exports.StringDiffSequence = StringDiffSequence;
    function stringDiff(original, modified, pretty) {
        return new LcsDiff(new StringDiffSequence(original), new StringDiffSequence(modified)).ComputeDiff(pretty).changes;
    }
    exports.stringDiff = stringDiff;
    //
    // The code below has been ported from a C# implementation in VS
    //
    class Debug {
        static Assert(condition, message) {
            if (!condition) {
                throw new Error(message);
            }
        }
    }
    exports.Debug = Debug;
    class MyArray {
        /**
         * Copies a range of elements from an Array starting at the specified source index and pastes
         * them to another Array starting at the specified destination index. The length and the indexes
         * are specified as 64-bit integers.
         * sourceArray:
         *		The Array that contains the data to copy.
         * sourceIndex:
         *		A 64-bit integer that represents the index in the sourceArray at which copying begins.
         * destinationArray:
         *		The Array that receives the data.
         * destinationIndex:
         *		A 64-bit integer that represents the index in the destinationArray at which storing begins.
         * length:
         *		A 64-bit integer that represents the number of elements to copy.
         */
        static Copy(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
            for (let i = 0; i < length; i++) {
                destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
            }
        }
        static Copy2(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
            for (let i = 0; i < length; i++) {
                destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
            }
        }
    }
    exports.MyArray = MyArray;
    //*****************************************************************************
    // LcsDiff.cs
    //
    // An implementation of the difference algorithm described in
    // "An O(ND) Difference Algorithm and its variations" by Eugene W. Myers
    //
    // Copyright (C) 2008 Microsoft Corporation @minifier_do_not_preserve
    //*****************************************************************************
    // Our total memory usage for storing history is (worst-case):
    // 2 * [(MaxDifferencesHistory + 1) * (MaxDifferencesHistory + 1) - 1] * sizeof(int)
    // 2 * [1448*1448 - 1] * 4 = 16773624 = 16MB
    var LocalConstants;
    (function (LocalConstants) {
        LocalConstants[LocalConstants["MaxDifferencesHistory"] = 1447] = "MaxDifferencesHistory";
    })(LocalConstants || (LocalConstants = {}));
    /**
     * A utility class which helps to create the set of DiffChanges from
     * a difference operation. This class accepts original DiffElements and
     * modified DiffElements that are involved in a particular change. The
     * MarktNextChange() method can be called to mark the separation between
     * distinct changes. At the end, the Changes property can be called to retrieve
     * the constructed changes.
     */
    class DiffChangeHelper {
        /**
         * Constructs a new DiffChangeHelper for the given DiffSequences.
         */
        constructor() {
            this.m_changes = [];
            this.m_originalStart = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
            this.m_modifiedStart = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
            this.m_originalCount = 0;
            this.m_modifiedCount = 0;
        }
        /**
         * Marks the beginning of the next change in the set of differences.
         */
        MarkNextChange() {
            // Only add to the list if there is something to add
            if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
                // Add the new change to our list
                this.m_changes.push(new diffChange_1.DiffChange(this.m_originalStart, this.m_originalCount, this.m_modifiedStart, this.m_modifiedCount));
            }
            // Reset for the next change
            this.m_originalCount = 0;
            this.m_modifiedCount = 0;
            this.m_originalStart = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
            this.m_modifiedStart = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
        }
        /**
         * Adds the original element at the given position to the elements
         * affected by the current change. The modified index gives context
         * to the change position with respect to the original sequence.
         * @param originalIndex The index of the original element to add.
         * @param modifiedIndex The index of the modified element that provides corresponding position in the modified sequence.
         */
        AddOriginalElement(originalIndex, modifiedIndex) {
            // The 'true' start index is the smallest of the ones we've seen
            this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
            this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
            this.m_originalCount++;
        }
        /**
         * Adds the modified element at the given position to the elements
         * affected by the current change. The original index gives context
         * to the change position with respect to the modified sequence.
         * @param originalIndex The index of the original element that provides corresponding position in the original sequence.
         * @param modifiedIndex The index of the modified element to add.
         */
        AddModifiedElement(originalIndex, modifiedIndex) {
            // The 'true' start index is the smallest of the ones we've seen
            this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
            this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
            this.m_modifiedCount++;
        }
        /**
         * Retrieves all of the changes marked by the class.
         */
        getChanges() {
            if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
                // Finish up on whatever is left
                this.MarkNextChange();
            }
            return this.m_changes;
        }
        /**
         * Retrieves all of the changes marked by the class in the reverse order
         */
        getReverseChanges() {
            if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
                // Finish up on whatever is left
                this.MarkNextChange();
            }
            this.m_changes.reverse();
            return this.m_changes;
        }
    }
    /**
     * An implementation of the difference algorithm described in
     * "An O(ND) Difference Algorithm and its variations" by Eugene W. Myers
     */
    class LcsDiff {
        /**
         * Constructs the DiffFinder
         */
        constructor(originalSequence, modifiedSequence, continueProcessingPredicate = null) {
            this.ContinueProcessingPredicate = continueProcessingPredicate;
            const [originalStringElements, originalElementsOrHash, originalHasStrings] = LcsDiff._getElements(originalSequence);
            const [modifiedStringElements, modifiedElementsOrHash, modifiedHasStrings] = LcsDiff._getElements(modifiedSequence);
            this._hasStrings = (originalHasStrings && modifiedHasStrings);
            this._originalStringElements = originalStringElements;
            this._originalElementsOrHash = originalElementsOrHash;
            this._modifiedStringElements = modifiedStringElements;
            this._modifiedElementsOrHash = modifiedElementsOrHash;
            this.m_forwardHistory = [];
            this.m_reverseHistory = [];
        }
        static _isStringArray(arr) {
            return (arr.length > 0 && typeof arr[0] === 'string');
        }
        static _getElements(sequence) {
            const elements = sequence.getElements();
            if (LcsDiff._isStringArray(elements)) {
                const hashes = new Int32Array(elements.length);
                for (let i = 0, len = elements.length; i < len; i++) {
                    hashes[i] = (0, hash_1.stringHash)(elements[i], 0);
                }
                return [elements, hashes, true];
            }
            if (elements instanceof Int32Array) {
                return [[], elements, false];
            }
            return [[], new Int32Array(elements), false];
        }
        ElementsAreEqual(originalIndex, newIndex) {
            if (this._originalElementsOrHash[originalIndex] !== this._modifiedElementsOrHash[newIndex]) {
                return false;
            }
            return (this._hasStrings ? this._originalStringElements[originalIndex] === this._modifiedStringElements[newIndex] : true);
        }
        OriginalElementsAreEqual(index1, index2) {
            if (this._originalElementsOrHash[index1] !== this._originalElementsOrHash[index2]) {
                return false;
            }
            return (this._hasStrings ? this._originalStringElements[index1] === this._originalStringElements[index2] : true);
        }
        ModifiedElementsAreEqual(index1, index2) {
            if (this._modifiedElementsOrHash[index1] !== this._modifiedElementsOrHash[index2]) {
                return false;
            }
            return (this._hasStrings ? this._modifiedStringElements[index1] === this._modifiedStringElements[index2] : true);
        }
        ComputeDiff(pretty) {
            return this._ComputeDiff(0, this._originalElementsOrHash.length - 1, 0, this._modifiedElementsOrHash.length - 1, pretty);
        }
        /**
         * Computes the differences between the original and modified input
         * sequences on the bounded range.
         * @returns An array of the differences between the two input sequences.
         */
        _ComputeDiff(originalStart, originalEnd, modifiedStart, modifiedEnd, pretty) {
            const quitEarlyArr = [false];
            let changes = this.ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr);
            if (pretty) {
                // We have to clean up the computed diff to be more intuitive
                // but it turns out this cannot be done correctly until the entire set
                // of diffs have been computed
                changes = this.PrettifyChanges(changes);
            }
            return {
                quitEarly: quitEarlyArr[0],
                changes: changes
            };
        }
        /**
         * Private helper method which computes the differences on the bounded range
         * recursively.
         * @returns An array of the differences between the two input sequences.
         */
        ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr) {
            quitEarlyArr[0] = false;
            // Find the start of the differences
            while (originalStart <= originalEnd && modifiedStart <= modifiedEnd && this.ElementsAreEqual(originalStart, modifiedStart)) {
                originalStart++;
                modifiedStart++;
            }
            // Find the end of the differences
            while (originalEnd >= originalStart && modifiedEnd >= modifiedStart && this.ElementsAreEqual(originalEnd, modifiedEnd)) {
                originalEnd--;
                modifiedEnd--;
            }
            // In the special case where we either have all insertions or all deletions or the sequences are identical
            if (originalStart > originalEnd || modifiedStart > modifiedEnd) {
                let changes;
                if (modifiedStart <= modifiedEnd) {
                    Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                    // All insertions
                    changes = [
                        new diffChange_1.DiffChange(originalStart, 0, modifiedStart, modifiedEnd - modifiedStart + 1)
                    ];
                }
                else if (originalStart <= originalEnd) {
                    Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                    // All deletions
                    changes = [
                        new diffChange_1.DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, 0)
                    ];
                }
                else {
                    Debug.Assert(originalStart === originalEnd + 1, 'originalStart should only be one more than originalEnd');
                    Debug.Assert(modifiedStart === modifiedEnd + 1, 'modifiedStart should only be one more than modifiedEnd');
                    // Identical sequences - No differences
                    changes = [];
                }
                return changes;
            }
            // This problem can be solved using the Divide-And-Conquer technique.
            const midOriginalArr = [0];
            const midModifiedArr = [0];
            const result = this.ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr);
            const midOriginal = midOriginalArr[0];
            const midModified = midModifiedArr[0];
            if (result !== null) {
                // Result is not-null when there was enough memory to compute the changes while
                // searching for the recursion point
                return result;
            }
            else if (!quitEarlyArr[0]) {
                // We can break the problem down recursively by finding the changes in the
                // First Half:   (originalStart, modifiedStart) to (midOriginal, midModified)
                // Second Half:  (midOriginal + 1, minModified + 1) to (originalEnd, modifiedEnd)
                // NOTE: ComputeDiff() is inclusive, therefore the second range starts on the next point
                const leftChanges = this.ComputeDiffRecursive(originalStart, midOriginal, modifiedStart, midModified, quitEarlyArr);
                let rightChanges = [];
                if (!quitEarlyArr[0]) {
                    rightChanges = this.ComputeDiffRecursive(midOriginal + 1, originalEnd, midModified + 1, modifiedEnd, quitEarlyArr);
                }
                else {
                    // We did't have time to finish the first half, so we don't have time to compute this half.
                    // Consider the entire rest of the sequence different.
                    rightChanges = [
                        new diffChange_1.DiffChange(midOriginal + 1, originalEnd - (midOriginal + 1) + 1, midModified + 1, modifiedEnd - (midModified + 1) + 1)
                    ];
                }
                return this.ConcatenateChanges(leftChanges, rightChanges);
            }
            // If we hit here, we quit early, and so can't return anything meaningful
            return [
                new diffChange_1.DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
            ];
        }
        WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr) {
            let forwardChanges = null;
            let reverseChanges = null;
            // First, walk backward through the forward diagonals history
            let changeHelper = new DiffChangeHelper();
            let diagonalMin = diagonalForwardStart;
            let diagonalMax = diagonalForwardEnd;
            let diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalForwardOffset;
            let lastOriginalIndex = -1073741824 /* MIN_SAFE_SMALL_INTEGER */;
            let historyIndex = this.m_forwardHistory.length - 1;
            do {
                // Get the diagonal index from the relative diagonal number
                const diagonal = diagonalRelative + diagonalForwardBase;
                // Figure out where we came from
                if (diagonal === diagonalMin || (diagonal < diagonalMax && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                    // Vertical line (the element is an insert)
                    originalIndex = forwardPoints[diagonal + 1];
                    modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                    if (originalIndex < lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex;
                    changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex);
                    diagonalRelative = (diagonal + 1) - diagonalForwardBase; //Setup for the next iteration
                }
                else {
                    // Horizontal line (the element is a deletion)
                    originalIndex = forwardPoints[diagonal - 1] + 1;
                    modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
                    if (originalIndex < lastOriginalIndex) {
                        changeHelper.MarkNextChange();
                    }
                    lastOriginalIndex = originalIndex - 1;
                    changeHelper.AddOriginalElement(originalIndex, modifiedIndex + 1);
                    diagonalRelative = (diagonal - 1) - diagonalForwardBase; //Setup for the next iteration
                }
                if (historyIndex >= 0) {
                    forwardPoints = this.m_forwardHistory[historyIndex];
                    diagonalForwardBase = forwardPoints[0]; //We stored this in the first spot
                    diagonalMin = 1;
                    diagonalMax = forwardPoints.length - 1;
                }
            } while (--historyIndex >= -1);
            // Ironically, we get the forward changes as the reverse of the
            // order we added them since we technically added them backwards
            forwardChanges = changeHelper.getReverseChanges();
            if (quitEarlyArr[0]) {
                // TODO: Calculate a partial from the reverse diagonals.
                //       For now, just assume everything after the midOriginal/midModified point is a diff
                let originalStartPoint = midOriginalArr[0] + 1;
                let modifiedStartPoint = midModifiedArr[0] + 1;
                if (forwardChanges !== null && forwardChanges.length > 0) {
                    const lastForwardChange = forwardChanges[forwardChanges.length - 1];
                    originalStartPoint = Math.max(originalStartPoint, lastForwardChange.getOriginalEnd());
                    modifiedStartPoint = Math.max(modifiedStartPoint, lastForwardChange.getModifiedEnd());
                }
                reverseChanges = [
                    new diffChange_1.DiffChange(originalStartPoint, originalEnd - originalStartPoint + 1, modifiedStartPoint, modifiedEnd - modifiedStartPoint + 1)
                ];
            }
            else {
                // Now walk backward through the reverse diagonals history
                changeHelper = new DiffChangeHelper();
                diagonalMin = diagonalReverseStart;
                diagonalMax = diagonalReverseEnd;
                diagonalRelative = (midOriginalArr[0] - midModifiedArr[0]) - diagonalReverseOffset;
                lastOriginalIndex = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
                historyIndex = (deltaIsEven) ? this.m_reverseHistory.length - 1 : this.m_reverseHistory.length - 2;
                do {
                    // Get the diagonal index from the relative diagonal number
                    const diagonal = diagonalRelative + diagonalReverseBase;
                    // Figure out where we came from
                    if (diagonal === diagonalMin || (diagonal < diagonalMax && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                        // Horizontal line (the element is a deletion))
                        originalIndex = reversePoints[diagonal + 1] - 1;
                        modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                        if (originalIndex > lastOriginalIndex) {
                            changeHelper.MarkNextChange();
                        }
                        lastOriginalIndex = originalIndex + 1;
                        changeHelper.AddOriginalElement(originalIndex + 1, modifiedIndex + 1);
                        diagonalRelative = (diagonal + 1) - diagonalReverseBase; //Setup for the next iteration
                    }
                    else {
                        // Vertical line (the element is an insertion)
                        originalIndex = reversePoints[diagonal - 1];
                        modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
                        if (originalIndex > lastOriginalIndex) {
                            changeHelper.MarkNextChange();
                        }
                        lastOriginalIndex = originalIndex;
                        changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex + 1);
                        diagonalRelative = (diagonal - 1) - diagonalReverseBase; //Setup for the next iteration
                    }
                    if (historyIndex >= 0) {
                        reversePoints = this.m_reverseHistory[historyIndex];
                        diagonalReverseBase = reversePoints[0]; //We stored this in the first spot
                        diagonalMin = 1;
                        diagonalMax = reversePoints.length - 1;
                    }
                } while (--historyIndex >= -1);
                // There are cases where the reverse history will find diffs that
                // are correct, but not intuitive, so we need shift them.
                reverseChanges = changeHelper.getChanges();
            }
            return this.ConcatenateChanges(forwardChanges, reverseChanges);
        }
        /**
         * Given the range to compute the diff on, this method finds the point:
         * (midOriginal, midModified)
         * that exists in the middle of the LCS of the two sequences and
         * is the point at which the LCS problem may be broken down recursively.
         * This method will try to keep the LCS trace in memory. If the LCS recursion
         * point is calculated and the full trace is available in memory, then this method
         * will return the change list.
         * @param originalStart The start bound of the original sequence range
         * @param originalEnd The end bound of the original sequence range
         * @param modifiedStart The start bound of the modified sequence range
         * @param modifiedEnd The end bound of the modified sequence range
         * @param midOriginal The middle point of the original sequence range
         * @param midModified The middle point of the modified sequence range
         * @returns The diff changes, if available, otherwise null
         */
        ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr) {
            let originalIndex = 0, modifiedIndex = 0;
            let diagonalForwardStart = 0, diagonalForwardEnd = 0;
            let diagonalReverseStart = 0, diagonalReverseEnd = 0;
            // To traverse the edit graph and produce the proper LCS, our actual
            // start position is just outside the given boundary
            originalStart--;
            modifiedStart--;
            // We set these up to make the compiler happy, but they will
            // be replaced before we return with the actual recursion point
            midOriginalArr[0] = 0;
            midModifiedArr[0] = 0;
            // Clear out the history
            this.m_forwardHistory = [];
            this.m_reverseHistory = [];
            // Each cell in the two arrays corresponds to a diagonal in the edit graph.
            // The integer value in the cell represents the originalIndex of the furthest
            // reaching point found so far that ends in that diagonal.
            // The modifiedIndex can be computed mathematically from the originalIndex and the diagonal number.
            const maxDifferences = (originalEnd - originalStart) + (modifiedEnd - modifiedStart);
            const numDiagonals = maxDifferences + 1;
            const forwardPoints = new Int32Array(numDiagonals);
            const reversePoints = new Int32Array(numDiagonals);
            // diagonalForwardBase: Index into forwardPoints of the diagonal which passes through (originalStart, modifiedStart)
            // diagonalReverseBase: Index into reversePoints of the diagonal which passes through (originalEnd, modifiedEnd)
            const diagonalForwardBase = (modifiedEnd - modifiedStart);
            const diagonalReverseBase = (originalEnd - originalStart);
            // diagonalForwardOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
            //    diagonal number (relative to diagonalForwardBase)
            // diagonalReverseOffset: Geometric offset which allows modifiedIndex to be computed from originalIndex and the
            //    diagonal number (relative to diagonalReverseBase)
            const diagonalForwardOffset = (originalStart - modifiedStart);
            const diagonalReverseOffset = (originalEnd - modifiedEnd);
            // delta: The difference between the end diagonal and the start diagonal. This is used to relate diagonal numbers
            //   relative to the start diagonal with diagonal numbers relative to the end diagonal.
            // The Even/Oddn-ness of this delta is important for determining when we should check for overlap
            const delta = diagonalReverseBase - diagonalForwardBase;
            const deltaIsEven = (delta % 2 === 0);
            // Here we set up the start and end points as the furthest points found so far
            // in both the forward and reverse directions, respectively
            forwardPoints[diagonalForwardBase] = originalStart;
            reversePoints[diagonalReverseBase] = originalEnd;
            // Remember if we quit early, and thus need to do a best-effort result instead of a real result.
            quitEarlyArr[0] = false;
            // A couple of points:
            // --With this method, we iterate on the number of differences between the two sequences.
            //   The more differences there actually are, the longer this will take.
            // --Also, as the number of differences increases, we have to search on diagonals further
            //   away from the reference diagonal (which is diagonalForwardBase for forward, diagonalReverseBase for reverse).
            // --We extend on even diagonals (relative to the reference diagonal) only when numDifferences
            //   is even and odd diagonals only when numDifferences is odd.
            for (let numDifferences = 1; numDifferences <= (maxDifferences / 2) + 1; numDifferences++) {
                let furthestOriginalIndex = 0;
                let furthestModifiedIndex = 0;
                // Run the algorithm in the forward direction
                diagonalForwardStart = this.ClipDiagonalBound(diagonalForwardBase - numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
                diagonalForwardEnd = this.ClipDiagonalBound(diagonalForwardBase + numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
                for (let diagonal = diagonalForwardStart; diagonal <= diagonalForwardEnd; diagonal += 2) {
                    // STEP 1: We extend the furthest reaching point in the present diagonal
                    // by looking at the diagonals above and below and picking the one whose point
                    // is further away from the start point (originalStart, modifiedStart)
                    if (diagonal === diagonalForwardStart || (diagonal < diagonalForwardEnd && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1])) {
                        originalIndex = forwardPoints[diagonal + 1];
                    }
                    else {
                        originalIndex = forwardPoints[diagonal - 1] + 1;
                    }
                    modifiedIndex = originalIndex - (diagonal - diagonalForwardBase) - diagonalForwardOffset;
                    // Save the current originalIndex so we can test for false overlap in step 3
                    const tempOriginalIndex = originalIndex;
                    // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                    // so long as the elements are equal.
                    while (originalIndex < originalEnd && modifiedIndex < modifiedEnd && this.ElementsAreEqual(originalIndex + 1, modifiedIndex + 1)) {
                        originalIndex++;
                        modifiedIndex++;
                    }
                    forwardPoints[diagonal] = originalIndex;
                    if (originalIndex + modifiedIndex > furthestOriginalIndex + furthestModifiedIndex) {
                        furthestOriginalIndex = originalIndex;
                        furthestModifiedIndex = modifiedIndex;
                    }
                    // STEP 3: If delta is odd (overlap first happens on forward when delta is odd)
                    // and diagonal is in the range of reverse diagonals computed for numDifferences-1
                    // (the previous iteration; we haven't computed reverse diagonals for numDifferences yet)
                    // then check for overlap.
                    if (!deltaIsEven && Math.abs(diagonal - diagonalReverseBase) <= (numDifferences - 1)) {
                        if (originalIndex >= reversePoints[diagonal]) {
                            midOriginalArr[0] = originalIndex;
                            midModifiedArr[0] = modifiedIndex;
                            if (tempOriginalIndex <= reversePoints[diagonal] && 1447 /* MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* MaxDifferencesHistory */ + 1)) {
                                // BINGO! We overlapped, and we have the full trace in memory!
                                return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                            }
                            else {
                                // Either false overlap, or we didn't have enough memory for the full trace
                                // Just return the recursion point
                                return null;
                            }
                        }
                    }
                }
                // Check to see if we should be quitting early, before moving on to the next iteration.
                const matchLengthOfLongest = ((furthestOriginalIndex - originalStart) + (furthestModifiedIndex - modifiedStart) - numDifferences) / 2;
                if (this.ContinueProcessingPredicate !== null && !this.ContinueProcessingPredicate(furthestOriginalIndex, matchLengthOfLongest)) {
                    // We can't finish, so skip ahead to generating a result from what we have.
                    quitEarlyArr[0] = true;
                    // Use the furthest distance we got in the forward direction.
                    midOriginalArr[0] = furthestOriginalIndex;
                    midModifiedArr[0] = furthestModifiedIndex;
                    if (matchLengthOfLongest > 0 && 1447 /* MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* MaxDifferencesHistory */ + 1)) {
                        // Enough of the history is in memory to walk it backwards
                        return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                    }
                    else {
                        // We didn't actually remember enough of the history.
                        //Since we are quiting the diff early, we need to shift back the originalStart and modified start
                        //back into the boundary limits since we decremented their value above beyond the boundary limit.
                        originalStart++;
                        modifiedStart++;
                        return [
                            new diffChange_1.DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
                        ];
                    }
                }
                // Run the algorithm in the reverse direction
                diagonalReverseStart = this.ClipDiagonalBound(diagonalReverseBase - numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
                diagonalReverseEnd = this.ClipDiagonalBound(diagonalReverseBase + numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
                for (let diagonal = diagonalReverseStart; diagonal <= diagonalReverseEnd; diagonal += 2) {
                    // STEP 1: We extend the furthest reaching point in the present diagonal
                    // by looking at the diagonals above and below and picking the one whose point
                    // is further away from the start point (originalEnd, modifiedEnd)
                    if (diagonal === diagonalReverseStart || (diagonal < diagonalReverseEnd && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1])) {
                        originalIndex = reversePoints[diagonal + 1] - 1;
                    }
                    else {
                        originalIndex = reversePoints[diagonal - 1];
                    }
                    modifiedIndex = originalIndex - (diagonal - diagonalReverseBase) - diagonalReverseOffset;
                    // Save the current originalIndex so we can test for false overlap
                    const tempOriginalIndex = originalIndex;
                    // STEP 2: We can continue to extend the furthest reaching point in the present diagonal
                    // as long as the elements are equal.
                    while (originalIndex > originalStart && modifiedIndex > modifiedStart && this.ElementsAreEqual(originalIndex, modifiedIndex)) {
                        originalIndex--;
                        modifiedIndex--;
                    }
                    reversePoints[diagonal] = originalIndex;
                    // STEP 4: If delta is even (overlap first happens on reverse when delta is even)
                    // and diagonal is in the range of forward diagonals computed for numDifferences
                    // then check for overlap.
                    if (deltaIsEven && Math.abs(diagonal - diagonalForwardBase) <= numDifferences) {
                        if (originalIndex <= forwardPoints[diagonal]) {
                            midOriginalArr[0] = originalIndex;
                            midModifiedArr[0] = modifiedIndex;
                            if (tempOriginalIndex >= forwardPoints[diagonal] && 1447 /* MaxDifferencesHistory */ > 0 && numDifferences <= (1447 /* MaxDifferencesHistory */ + 1)) {
                                // BINGO! We overlapped, and we have the full trace in memory!
                                return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
                            }
                            else {
                                // Either false overlap, or we didn't have enough memory for the full trace
                                // Just return the recursion point
                                return null;
                            }
                        }
                    }
                }
                // Save current vectors to history before the next iteration
                if (numDifferences <= 1447 /* MaxDifferencesHistory */) {
                    // We are allocating space for one extra int, which we fill with
                    // the index of the diagonal base index
                    let temp = new Int32Array(diagonalForwardEnd - diagonalForwardStart + 2);
                    temp[0] = diagonalForwardBase - diagonalForwardStart + 1;
                    MyArray.Copy2(forwardPoints, diagonalForwardStart, temp, 1, diagonalForwardEnd - diagonalForwardStart + 1);
                    this.m_forwardHistory.push(temp);
                    temp = new Int32Array(diagonalReverseEnd - diagonalReverseStart + 2);
                    temp[0] = diagonalReverseBase - diagonalReverseStart + 1;
                    MyArray.Copy2(reversePoints, diagonalReverseStart, temp, 1, diagonalReverseEnd - diagonalReverseStart + 1);
                    this.m_reverseHistory.push(temp);
                }
            }
            // If we got here, then we have the full trace in history. We just have to convert it to a change list
            // NOTE: This part is a bit messy
            return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
        }
        /**
         * Shifts the given changes to provide a more intuitive diff.
         * While the first element in a diff matches the first element after the diff,
         * we shift the diff down.
         *
         * @param changes The list of changes to shift
         * @returns The shifted changes
         */
        PrettifyChanges(changes) {
            // Shift all the changes down first
            for (let i = 0; i < changes.length; i++) {
                const change = changes[i];
                const originalStop = (i < changes.length - 1) ? changes[i + 1].originalStart : this._originalElementsOrHash.length;
                const modifiedStop = (i < changes.length - 1) ? changes[i + 1].modifiedStart : this._modifiedElementsOrHash.length;
                const checkOriginal = change.originalLength > 0;
                const checkModified = change.modifiedLength > 0;
                while (change.originalStart + change.originalLength < originalStop &&
                    change.modifiedStart + change.modifiedLength < modifiedStop &&
                    (!checkOriginal || this.OriginalElementsAreEqual(change.originalStart, change.originalStart + change.originalLength)) &&
                    (!checkModified || this.ModifiedElementsAreEqual(change.modifiedStart, change.modifiedStart + change.modifiedLength))) {
                    change.originalStart++;
                    change.modifiedStart++;
                }
                let mergedChangeArr = [null];
                if (i < changes.length - 1 && this.ChangesOverlap(changes[i], changes[i + 1], mergedChangeArr)) {
                    changes[i] = mergedChangeArr[0];
                    changes.splice(i + 1, 1);
                    i--;
                    continue;
                }
            }
            // Shift changes back up until we hit empty or whitespace-only lines
            for (let i = changes.length - 1; i >= 0; i--) {
                const change = changes[i];
                let originalStop = 0;
                let modifiedStop = 0;
                if (i > 0) {
                    const prevChange = changes[i - 1];
                    originalStop = prevChange.originalStart + prevChange.originalLength;
                    modifiedStop = prevChange.modifiedStart + prevChange.modifiedLength;
                }
                const checkOriginal = change.originalLength > 0;
                const checkModified = change.modifiedLength > 0;
                let bestDelta = 0;
                let bestScore = this._boundaryScore(change.originalStart, change.originalLength, change.modifiedStart, change.modifiedLength);
                for (let delta = 1;; delta++) {
                    const originalStart = change.originalStart - delta;
                    const modifiedStart = change.modifiedStart - delta;
                    if (originalStart < originalStop || modifiedStart < modifiedStop) {
                        break;
                    }
                    if (checkOriginal && !this.OriginalElementsAreEqual(originalStart, originalStart + change.originalLength)) {
                        break;
                    }
                    if (checkModified && !this.ModifiedElementsAreEqual(modifiedStart, modifiedStart + change.modifiedLength)) {
                        break;
                    }
                    const touchingPreviousChange = (originalStart === originalStop && modifiedStart === modifiedStop);
                    const score = ((touchingPreviousChange ? 5 : 0)
                        + this._boundaryScore(originalStart, change.originalLength, modifiedStart, change.modifiedLength));
                    if (score > bestScore) {
                        bestScore = score;
                        bestDelta = delta;
                    }
                }
                change.originalStart -= bestDelta;
                change.modifiedStart -= bestDelta;
                const mergedChangeArr = [null];
                if (i > 0 && this.ChangesOverlap(changes[i - 1], changes[i], mergedChangeArr)) {
                    changes[i - 1] = mergedChangeArr[0];
                    changes.splice(i, 1);
                    i++;
                    continue;
                }
            }
            // There could be multiple longest common substrings.
            // Give preference to the ones containing longer lines
            if (this._hasStrings) {
                for (let i = 1, len = changes.length; i < len; i++) {
                    const aChange = changes[i - 1];
                    const bChange = changes[i];
                    const matchedLength = bChange.originalStart - aChange.originalStart - aChange.originalLength;
                    const aOriginalStart = aChange.originalStart;
                    const bOriginalEnd = bChange.originalStart + bChange.originalLength;
                    const abOriginalLength = bOriginalEnd - aOriginalStart;
                    const aModifiedStart = aChange.modifiedStart;
                    const bModifiedEnd = bChange.modifiedStart + bChange.modifiedLength;
                    const abModifiedLength = bModifiedEnd - aModifiedStart;
                    // Avoid wasting a lot of time with these searches
                    if (matchedLength < 5 && abOriginalLength < 20 && abModifiedLength < 20) {
                        const t = this._findBetterContiguousSequence(aOriginalStart, abOriginalLength, aModifiedStart, abModifiedLength, matchedLength);
                        if (t) {
                            const [originalMatchStart, modifiedMatchStart] = t;
                            if (originalMatchStart !== aChange.originalStart + aChange.originalLength || modifiedMatchStart !== aChange.modifiedStart + aChange.modifiedLength) {
                                // switch to another sequence that has a better score
                                aChange.originalLength = originalMatchStart - aChange.originalStart;
                                aChange.modifiedLength = modifiedMatchStart - aChange.modifiedStart;
                                bChange.originalStart = originalMatchStart + matchedLength;
                                bChange.modifiedStart = modifiedMatchStart + matchedLength;
                                bChange.originalLength = bOriginalEnd - bChange.originalStart;
                                bChange.modifiedLength = bModifiedEnd - bChange.modifiedStart;
                            }
                        }
                    }
                }
            }
            return changes;
        }
        _findBetterContiguousSequence(originalStart, originalLength, modifiedStart, modifiedLength, desiredLength) {
            if (originalLength < desiredLength || modifiedLength < desiredLength) {
                return null;
            }
            const originalMax = originalStart + originalLength - desiredLength + 1;
            const modifiedMax = modifiedStart + modifiedLength - desiredLength + 1;
            let bestScore = 0;
            let bestOriginalStart = 0;
            let bestModifiedStart = 0;
            for (let i = originalStart; i < originalMax; i++) {
                for (let j = modifiedStart; j < modifiedMax; j++) {
                    const score = this._contiguousSequenceScore(i, j, desiredLength);
                    if (score > 0 && score > bestScore) {
                        bestScore = score;
                        bestOriginalStart = i;
                        bestModifiedStart = j;
                    }
                }
            }
            if (bestScore > 0) {
                return [bestOriginalStart, bestModifiedStart];
            }
            return null;
        }
        _contiguousSequenceScore(originalStart, modifiedStart, length) {
            let score = 0;
            for (let l = 0; l < length; l++) {
                if (!this.ElementsAreEqual(originalStart + l, modifiedStart + l)) {
                    return 0;
                }
                score += this._originalStringElements[originalStart + l].length;
            }
            return score;
        }
        _OriginalIsBoundary(index) {
            if (index <= 0 || index >= this._originalElementsOrHash.length - 1) {
                return true;
            }
            return (this._hasStrings && /^\s*$/.test(this._originalStringElements[index]));
        }
        _OriginalRegionIsBoundary(originalStart, originalLength) {
            if (this._OriginalIsBoundary(originalStart) || this._OriginalIsBoundary(originalStart - 1)) {
                return true;
            }
            if (originalLength > 0) {
                const originalEnd = originalStart + originalLength;
                if (this._OriginalIsBoundary(originalEnd - 1) || this._OriginalIsBoundary(originalEnd)) {
                    return true;
                }
            }
            return false;
        }
        _ModifiedIsBoundary(index) {
            if (index <= 0 || index >= this._modifiedElementsOrHash.length - 1) {
                return true;
            }
            return (this._hasStrings && /^\s*$/.test(this._modifiedStringElements[index]));
        }
        _ModifiedRegionIsBoundary(modifiedStart, modifiedLength) {
            if (this._ModifiedIsBoundary(modifiedStart) || this._ModifiedIsBoundary(modifiedStart - 1)) {
                return true;
            }
            if (modifiedLength > 0) {
                const modifiedEnd = modifiedStart + modifiedLength;
                if (this._ModifiedIsBoundary(modifiedEnd - 1) || this._ModifiedIsBoundary(modifiedEnd)) {
                    return true;
                }
            }
            return false;
        }
        _boundaryScore(originalStart, originalLength, modifiedStart, modifiedLength) {
            const originalScore = (this._OriginalRegionIsBoundary(originalStart, originalLength) ? 1 : 0);
            const modifiedScore = (this._ModifiedRegionIsBoundary(modifiedStart, modifiedLength) ? 1 : 0);
            return (originalScore + modifiedScore);
        }
        /**
         * Concatenates the two input DiffChange lists and returns the resulting
         * list.
         * @param The left changes
         * @param The right changes
         * @returns The concatenated list
         */
        ConcatenateChanges(left, right) {
            let mergedChangeArr = [];
            if (left.length === 0 || right.length === 0) {
                return (right.length > 0) ? right : left;
            }
            else if (this.ChangesOverlap(left[left.length - 1], right[0], mergedChangeArr)) {
                // Since we break the problem down recursively, it is possible that we
                // might recurse in the middle of a change thereby splitting it into
                // two changes. Here in the combining stage, we detect and fuse those
                // changes back together
                const result = new Array(left.length + right.length - 1);
                MyArray.Copy(left, 0, result, 0, left.length - 1);
                result[left.length - 1] = mergedChangeArr[0];
                MyArray.Copy(right, 1, result, left.length, right.length - 1);
                return result;
            }
            else {
                const result = new Array(left.length + right.length);
                MyArray.Copy(left, 0, result, 0, left.length);
                MyArray.Copy(right, 0, result, left.length, right.length);
                return result;
            }
        }
        /**
         * Returns true if the two changes overlap and can be merged into a single
         * change
         * @param left The left change
         * @param right The right change
         * @param mergedChange The merged change if the two overlap, null otherwise
         * @returns True if the two changes overlap
         */
        ChangesOverlap(left, right, mergedChangeArr) {
            Debug.Assert(left.originalStart <= right.originalStart, 'Left change is not less than or equal to right change');
            Debug.Assert(left.modifiedStart <= right.modifiedStart, 'Left change is not less than or equal to right change');
            if (left.originalStart + left.originalLength >= right.originalStart || left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
                const originalStart = left.originalStart;
                let originalLength = left.originalLength;
                const modifiedStart = left.modifiedStart;
                let modifiedLength = left.modifiedLength;
                if (left.originalStart + left.originalLength >= right.originalStart) {
                    originalLength = right.originalStart + right.originalLength - left.originalStart;
                }
                if (left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
                    modifiedLength = right.modifiedStart + right.modifiedLength - left.modifiedStart;
                }
                mergedChangeArr[0] = new diffChange_1.DiffChange(originalStart, originalLength, modifiedStart, modifiedLength);
                return true;
            }
            else {
                mergedChangeArr[0] = null;
                return false;
            }
        }
        /**
         * Helper method used to clip a diagonal index to the range of valid
         * diagonals. This also decides whether or not the diagonal index,
         * if it exceeds the boundary, should be clipped to the boundary or clipped
         * one inside the boundary depending on the Even/Odd status of the boundary
         * and numDifferences.
         * @param diagonal The index of the diagonal to clip.
         * @param numDifferences The current number of differences being iterated upon.
         * @param diagonalBaseIndex The base reference diagonal.
         * @param numDiagonals The total number of diagonals.
         * @returns The clipped diagonal index.
         */
        ClipDiagonalBound(diagonal, numDifferences, diagonalBaseIndex, numDiagonals) {
            if (diagonal >= 0 && diagonal < numDiagonals) {
                // Nothing to clip, its in range
                return diagonal;
            }
            // diagonalsBelow: The number of diagonals below the reference diagonal
            // diagonalsAbove: The number of diagonals above the reference diagonal
            const diagonalsBelow = diagonalBaseIndex;
            const diagonalsAbove = numDiagonals - diagonalBaseIndex - 1;
            const diffEven = (numDifferences % 2 === 0);
            if (diagonal < 0) {
                const lowerBoundEven = (diagonalsBelow % 2 === 0);
                return (diffEven === lowerBoundEven) ? 0 : 1;
            }
            else {
                const upperBoundEven = (diagonalsAbove % 2 === 0);
                return (diffEven === upperBoundEven) ? numDiagonals - 1 : numDiagonals - 2;
            }
        }
    }
    exports.LcsDiff = LcsDiff;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[33/*vs/base/common/types*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertNever = exports.NotImplementedProxy = exports.withUndefinedAsNull = exports.withNullAsUndefined = exports.createProxyObject = exports.getAllMethodNames = exports.getAllPropertyNames = exports.validateConstraint = exports.validateConstraints = exports.areFunctions = exports.isFunction = exports.isEmptyObject = exports.assertAllDefined = exports.assertIsDefined = exports.assertType = exports.isUndefinedOrNull = exports.isDefined = exports.isUndefined = exports.isBoolean = exports.isIterable = exports.isNumber = exports.isObject = exports.isStringArray = exports.isString = exports.isArray = void 0;
    /**
     * @returns whether the provided parameter is a JavaScript Array or not.
     */
    function isArray(array) {
        return Array.isArray(array);
    }
    exports.isArray = isArray;
    /**
     * @returns whether the provided parameter is a JavaScript String or not.
     */
    function isString(str) {
        return (typeof str === 'string');
    }
    exports.isString = isString;
    /**
     * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
     */
    function isStringArray(value) {
        return Array.isArray(value) && value.every(elem => isString(elem));
    }
    exports.isStringArray = isStringArray;
    /**
     *
     * @returns whether the provided parameter is of type `object` but **not**
     *	`null`, an `array`, a `regexp`, nor a `date`.
     */
    function isObject(obj) {
        // The method can't do a type cast since there are type (like strings) which
        // are subclasses of any put not positvely matched by the function. Hence type
        // narrowing results in wrong results.
        return typeof obj === 'object'
            && obj !== null
            && !Array.isArray(obj)
            && !(obj instanceof RegExp)
            && !(obj instanceof Date);
    }
    exports.isObject = isObject;
    /**
     * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
     * @returns whether the provided parameter is a JavaScript Number or not.
     */
    function isNumber(obj) {
        return (typeof obj === 'number' && !isNaN(obj));
    }
    exports.isNumber = isNumber;
    /**
     * @returns whether the provided parameter is an Iterable, casting to the given generic
     */
    function isIterable(obj) {
        return !!obj && typeof obj[Symbol.iterator] === 'function';
    }
    exports.isIterable = isIterable;
    /**
     * @returns whether the provided parameter is a JavaScript Boolean or not.
     */
    function isBoolean(obj) {
        return (obj === true || obj === false);
    }
    exports.isBoolean = isBoolean;
    /**
     * @returns whether the provided parameter is undefined.
     */
    function isUndefined(obj) {
        return (typeof obj === 'undefined');
    }
    exports.isUndefined = isUndefined;
    /**
     * @returns whether the provided parameter is defined.
     */
    function isDefined(arg) {
        return !isUndefinedOrNull(arg);
    }
    exports.isDefined = isDefined;
    /**
     * @returns whether the provided parameter is undefined or null.
     */
    function isUndefinedOrNull(obj) {
        return (isUndefined(obj) || obj === null);
    }
    exports.isUndefinedOrNull = isUndefinedOrNull;
    function assertType(condition, type) {
        if (!condition) {
            throw new Error(type ? `Unexpected type, expected '${type}'` : 'Unexpected type');
        }
    }
    exports.assertType = assertType;
    /**
     * Asserts that the argument passed in is neither undefined nor null.
     */
    function assertIsDefined(arg) {
        if (isUndefinedOrNull(arg)) {
            throw new Error('Assertion Failed: argument is undefined or null');
        }
        return arg;
    }
    exports.assertIsDefined = assertIsDefined;
    function assertAllDefined(...args) {
        const result = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (isUndefinedOrNull(arg)) {
                throw new Error(`Assertion Failed: argument at index ${i} is undefined or null`);
            }
            result.push(arg);
        }
        return result;
    }
    exports.assertAllDefined = assertAllDefined;
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    /**
     * @returns whether the provided parameter is an empty JavaScript Object or not.
     */
    function isEmptyObject(obj) {
        if (!isObject(obj)) {
            return false;
        }
        for (let key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    exports.isEmptyObject = isEmptyObject;
    /**
     * @returns whether the provided parameter is a JavaScript Function or not.
     */
    function isFunction(obj) {
        return (typeof obj === 'function');
    }
    exports.isFunction = isFunction;
    /**
     * @returns whether the provided parameters is are JavaScript Function or not.
     */
    function areFunctions(...objects) {
        return objects.length > 0 && objects.every(isFunction);
    }
    exports.areFunctions = areFunctions;
    function validateConstraints(args, constraints) {
        const len = Math.min(args.length, constraints.length);
        for (let i = 0; i < len; i++) {
            validateConstraint(args[i], constraints[i]);
        }
    }
    exports.validateConstraints = validateConstraints;
    function validateConstraint(arg, constraint) {
        if (isString(constraint)) {
            if (typeof arg !== constraint) {
                throw new Error(`argument does not match constraint: typeof ${constraint}`);
            }
        }
        else if (isFunction(constraint)) {
            try {
                if (arg instanceof constraint) {
                    return;
                }
            }
            catch (_a) {
                // ignore
            }
            if (!isUndefinedOrNull(arg) && arg.constructor === constraint) {
                return;
            }
            if (constraint.length === 1 && constraint.call(undefined, arg) === true) {
                return;
            }
            throw new Error(`argument does not match one of these constraints: arg instanceof constraint, arg.constructor === constraint, nor constraint(arg) === true`);
        }
    }
    exports.validateConstraint = validateConstraint;
    function getAllPropertyNames(obj) {
        let res = [];
        let proto = Object.getPrototypeOf(obj);
        while (Object.prototype !== proto) {
            res = res.concat(Object.getOwnPropertyNames(proto));
            proto = Object.getPrototypeOf(proto);
        }
        return res;
    }
    exports.getAllPropertyNames = getAllPropertyNames;
    function getAllMethodNames(obj) {
        const methods = [];
        for (const prop of getAllPropertyNames(obj)) {
            if (typeof obj[prop] === 'function') {
                methods.push(prop);
            }
        }
        return methods;
    }
    exports.getAllMethodNames = getAllMethodNames;
    function createProxyObject(methodNames, invoke) {
        const createProxyMethod = (method) => {
            return function () {
                const args = Array.prototype.slice.call(arguments, 0);
                return invoke(method, args);
            };
        };
        let result = {};
        for (const methodName of methodNames) {
            result[methodName] = createProxyMethod(methodName);
        }
        return result;
    }
    exports.createProxyObject = createProxyObject;
    /**
     * Converts null to undefined, passes all other values through.
     */
    function withNullAsUndefined(x) {
        return x === null ? undefined : x;
    }
    exports.withNullAsUndefined = withNullAsUndefined;
    /**
     * Converts undefined to null, passes all other values through.
     */
    function withUndefinedAsNull(x) {
        return typeof x === 'undefined' ? null : x;
    }
    exports.withUndefinedAsNull = withUndefinedAsNull;
    function NotImplementedProxy(name) {
        return class {
            constructor() {
                return new Proxy({}, {
                    get(target, prop) {
                        if (target[prop]) {
                            return target[prop];
                        }
                        throw new Error(`Not Implemented: ${name}->${String(prop)}`);
                    }
                });
            }
        };
    }
    exports.NotImplementedProxy = NotImplementedProxy;
    function assertNever(value) {
        throw new Error('Unreachable');
    }
    exports.assertNever = assertNever;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[16/*vs/base/common/extpath*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/platform*/,2/*vs/base/common/strings*/,5/*vs/base/common/path*/,33/*vs/base/common/types*/]), function (require, exports, platform_1, strings_1, path_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseLineAndColumnAware = exports.indexOfPath = exports.getDriveLetter = exports.hasDriveLetter = exports.isRootOrDriveLetter = exports.sanitizeFilePath = exports.isWindowsDriveLetter = exports.isEqualOrParent = exports.isEqual = exports.isValidBasename = exports.isUNC = exports.getRoot = exports.toSlashes = exports.isPathSeparator = void 0;
    function isPathSeparator(code) {
        return code === 47 /* Slash */ || code === 92 /* Backslash */;
    }
    exports.isPathSeparator = isPathSeparator;
    /**
     * Takes a Windows OS path and changes backward slashes to forward slashes.
     * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
     * Using it on a Linux or MaxOS path might change it.
     */
    function toSlashes(osPath) {
        return osPath.replace(/[\\/]/g, path_1.posix.sep);
    }
    exports.toSlashes = toSlashes;
    /**
     * Computes the _root_ this path, like `getRoot('c:\files') === c:\`,
     * `getRoot('files:///files/path') === files:///`,
     * or `getRoot('\\server\shares\path') === \\server\shares\`
     */
    function getRoot(path, sep = path_1.posix.sep) {
        if (!path) {
            return '';
        }
        const len = path.length;
        const firstLetter = path.charCodeAt(0);
        if (isPathSeparator(firstLetter)) {
            if (isPathSeparator(path.charCodeAt(1))) {
                // UNC candidate \\localhost\shares\ddd
                //               ^^^^^^^^^^^^^^^^^^^
                if (!isPathSeparator(path.charCodeAt(2))) {
                    let pos = 3;
                    const start = pos;
                    for (; pos < len; pos++) {
                        if (isPathSeparator(path.charCodeAt(pos))) {
                            break;
                        }
                    }
                    if (start !== pos && !isPathSeparator(path.charCodeAt(pos + 1))) {
                        pos += 1;
                        for (; pos < len; pos++) {
                            if (isPathSeparator(path.charCodeAt(pos))) {
                                return path.slice(0, pos + 1) // consume this separator
                                    .replace(/[\\/]/g, sep);
                            }
                        }
                    }
                }
            }
            // /user/far
            // ^
            return sep;
        }
        else if (isWindowsDriveLetter(firstLetter)) {
            // check for windows drive letter c:\ or c:
            if (path.charCodeAt(1) === 58 /* Colon */) {
                if (isPathSeparator(path.charCodeAt(2))) {
                    // C:\fff
                    // ^^^
                    return path.slice(0, 2) + sep;
                }
                else {
                    // C:
                    // ^^
                    return path.slice(0, 2);
                }
            }
        }
        // check for URI
        // scheme://authority/path
        // ^^^^^^^^^^^^^^^^^^^
        let pos = path.indexOf('://');
        if (pos !== -1) {
            pos += 3; // 3 -> "://".length
            for (; pos < len; pos++) {
                if (isPathSeparator(path.charCodeAt(pos))) {
                    return path.slice(0, pos + 1); // consume this separator
                }
            }
        }
        return '';
    }
    exports.getRoot = getRoot;
    /**
     * Check if the path follows this pattern: `\\hostname\sharename`.
     *
     * @see https://msdn.microsoft.com/en-us/library/gg465305.aspx
     * @return A boolean indication if the path is a UNC path, on none-windows
     * always false.
     */
    function isUNC(path) {
        if (!platform_1.isWindows) {
            // UNC is a windows concept
            return false;
        }
        if (!path || path.length < 5) {
            // at least \\a\b
            return false;
        }
        let code = path.charCodeAt(0);
        if (code !== 92 /* Backslash */) {
            return false;
        }
        code = path.charCodeAt(1);
        if (code !== 92 /* Backslash */) {
            return false;
        }
        let pos = 2;
        const start = pos;
        for (; pos < path.length; pos++) {
            code = path.charCodeAt(pos);
            if (code === 92 /* Backslash */) {
                break;
            }
        }
        if (start === pos) {
            return false;
        }
        code = path.charCodeAt(pos + 1);
        if (isNaN(code) || code === 92 /* Backslash */) {
            return false;
        }
        return true;
    }
    exports.isUNC = isUNC;
    // Reference: https://en.wikipedia.org/wiki/Filename
    const WINDOWS_INVALID_FILE_CHARS = /[\\/:\*\?"<>\|]/g;
    const UNIX_INVALID_FILE_CHARS = /[\\/]/g;
    const WINDOWS_FORBIDDEN_NAMES = /^(con|prn|aux|clock\$|nul|lpt[0-9]|com[0-9])(\.(.*?))?$/i;
    function isValidBasename(name, isWindowsOS = platform_1.isWindows) {
        const invalidFileChars = isWindowsOS ? WINDOWS_INVALID_FILE_CHARS : UNIX_INVALID_FILE_CHARS;
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return false; // require a name that is not just whitespace
        }
        invalidFileChars.lastIndex = 0; // the holy grail of software development
        if (invalidFileChars.test(name)) {
            return false; // check for certain invalid file characters
        }
        if (isWindowsOS && WINDOWS_FORBIDDEN_NAMES.test(name)) {
            return false; // check for certain invalid file names
        }
        if (name === '.' || name === '..') {
            return false; // check for reserved values
        }
        if (isWindowsOS && name[name.length - 1] === '.') {
            return false; // Windows: file cannot end with a "."
        }
        if (isWindowsOS && name.length !== name.trim().length) {
            return false; // Windows: file cannot end with a whitespace
        }
        if (name.length > 255) {
            return false; // most file systems do not allow files > 255 length
        }
        return true;
    }
    exports.isValidBasename = isValidBasename;
    function isEqual(pathA, pathB, ignoreCase) {
        const identityEquals = (pathA === pathB);
        if (!ignoreCase || identityEquals) {
            return identityEquals;
        }
        if (!pathA || !pathB) {
            return false;
        }
        return (0, strings_1.equalsIgnoreCase)(pathA, pathB);
    }
    exports.isEqual = isEqual;
    function isEqualOrParent(base, parentCandidate, ignoreCase, separator = path_1.sep) {
        if (base === parentCandidate) {
            return true;
        }
        if (!base || !parentCandidate) {
            return false;
        }
        if (parentCandidate.length > base.length) {
            return false;
        }
        if (ignoreCase) {
            const beginsWith = (0, strings_1.startsWithIgnoreCase)(base, parentCandidate);
            if (!beginsWith) {
                return false;
            }
            if (parentCandidate.length === base.length) {
                return true; // same path, different casing
            }
            let sepOffset = parentCandidate.length;
            if (parentCandidate.charAt(parentCandidate.length - 1) === separator) {
                sepOffset--; // adjust the expected sep offset in case our candidate already ends in separator character
            }
            return base.charAt(sepOffset) === separator;
        }
        if (parentCandidate.charAt(parentCandidate.length - 1) !== separator) {
            parentCandidate += separator;
        }
        return base.indexOf(parentCandidate) === 0;
    }
    exports.isEqualOrParent = isEqualOrParent;
    function isWindowsDriveLetter(char0) {
        return char0 >= 65 /* A */ && char0 <= 90 /* Z */ || char0 >= 97 /* a */ && char0 <= 122 /* z */;
    }
    exports.isWindowsDriveLetter = isWindowsDriveLetter;
    function sanitizeFilePath(candidate, cwd) {
        // Special case: allow to open a drive letter without trailing backslash
        if (platform_1.isWindows && candidate.endsWith(':')) {
            candidate += path_1.sep;
        }
        // Ensure absolute
        if (!(0, path_1.isAbsolute)(candidate)) {
            candidate = (0, path_1.join)(cwd, candidate);
        }
        // Ensure normalized
        candidate = (0, path_1.normalize)(candidate);
        // Ensure no trailing slash/backslash
        if (platform_1.isWindows) {
            candidate = (0, strings_1.rtrim)(candidate, path_1.sep);
            // Special case: allow to open drive root ('C:\')
            if (candidate.endsWith(':')) {
                candidate += path_1.sep;
            }
        }
        else {
            candidate = (0, strings_1.rtrim)(candidate, path_1.sep);
            // Special case: allow to open root ('/')
            if (!candidate) {
                candidate = path_1.sep;
            }
        }
        return candidate;
    }
    exports.sanitizeFilePath = sanitizeFilePath;
    function isRootOrDriveLetter(path) {
        const pathNormalized = (0, path_1.normalize)(path);
        if (platform_1.isWindows) {
            if (path.length > 3) {
                return false;
            }
            return hasDriveLetter(pathNormalized) &&
                (path.length === 2 || pathNormalized.charCodeAt(2) === 92 /* Backslash */);
        }
        return pathNormalized === path_1.posix.sep;
    }
    exports.isRootOrDriveLetter = isRootOrDriveLetter;
    function hasDriveLetter(path) {
        if (platform_1.isWindows) {
            return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === 58 /* Colon */;
        }
        return false;
    }
    exports.hasDriveLetter = hasDriveLetter;
    function getDriveLetter(path) {
        return hasDriveLetter(path) ? path[0] : undefined;
    }
    exports.getDriveLetter = getDriveLetter;
    function indexOfPath(path, candidate, ignoreCase) {
        if (candidate.length > path.length) {
            return -1;
        }
        if (path === candidate) {
            return 0;
        }
        if (ignoreCase) {
            path = path.toLowerCase();
            candidate = candidate.toLowerCase();
        }
        return path.indexOf(candidate);
    }
    exports.indexOfPath = indexOfPath;
    function parseLineAndColumnAware(rawPath) {
        const segments = rawPath.split(':'); // C:\file.txt:<line>:<column>
        let path = undefined;
        let line = undefined;
        let column = undefined;
        segments.forEach(segment => {
            const segmentAsNumber = Number(segment);
            if (!(0, types_1.isNumber)(segmentAsNumber)) {
                path = !!path ? [path, segment].join(':') : segment; // a colon can well be part of a path (e.g. C:\...)
            }
            else if (line === undefined) {
                line = segmentAsNumber;
            }
            else if (column === undefined) {
                column = segmentAsNumber;
            }
        });
        if (!path) {
            throw new Error('Format for `--goto` should be: `FILE:LINE(:COLUMN)`');
        }
        return {
            path,
            line: line !== undefined ? line : undefined,
            column: column !== undefined ? column : line !== undefined ? 1 : undefined // if we have a line, make sure column is also set
        };
    }
    exports.parseLineAndColumnAware = parseLineAndColumnAware;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[34/*vs/base/common/uint*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toUint32 = exports.toUint8 = exports.Constants = void 0;
    var Constants;
    (function (Constants) {
        /**
         * MAX SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MAX_SAFE_SMALL_INTEGER"] = 1073741824] = "MAX_SAFE_SMALL_INTEGER";
        /**
         * MIN SMI (SMall Integer) as defined in v8.
         * one bit is lost for boxing/unboxing flag.
         * one bit is lost for sign flag.
         * See https://thibaultlaurens.github.io/javascript/2013/04/29/how-the-v8-engine-works/#tagged-values
         */
        Constants[Constants["MIN_SAFE_SMALL_INTEGER"] = -1073741824] = "MIN_SAFE_SMALL_INTEGER";
        /**
         * Max unsigned integer that fits on 8 bits.
         */
        Constants[Constants["MAX_UINT_8"] = 255] = "MAX_UINT_8";
        /**
         * Max unsigned integer that fits on 16 bits.
         */
        Constants[Constants["MAX_UINT_16"] = 65535] = "MAX_UINT_16";
        /**
         * Max unsigned integer that fits on 32 bits.
         */
        Constants[Constants["MAX_UINT_32"] = 4294967295] = "MAX_UINT_32";
        Constants[Constants["UNICODE_SUPPLEMENTARY_PLANE_BEGIN"] = 65536] = "UNICODE_SUPPLEMENTARY_PLANE_BEGIN";
    })(Constants = exports.Constants || (exports.Constants = {}));
    function toUint8(v) {
        if (v < 0) {
            return 0;
        }
        if (v > 255 /* MAX_UINT_8 */) {
            return 255 /* MAX_UINT_8 */;
        }
        return v | 0;
    }
    exports.toUint8 = toUint8;
    function toUint32(v) {
        if (v < 0) {
            return 0;
        }
        if (v > 4294967295 /* MAX_UINT_32 */) {
            return 4294967295 /* MAX_UINT_32 */;
        }
        return v | 0;
    }
    exports.toUint32 = toUint32;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[8/*vs/base/common/uri*/], __M([0/*require*/,1/*exports*/,3/*vs/base/common/platform*/,5/*vs/base/common/path*/]), function (require, exports, platform_1, paths) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uriToFsPath = exports.URI = void 0;
    const _schemePattern = /^\w[\w\d+.-]*$/;
    const _singleSlashStart = /^\//;
    const _doubleSlashStart = /^\/\//;
    function _validateUri(ret, _strict) {
        // scheme, must be set
        if (!ret.scheme && _strict) {
            throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
        }
        // scheme, https://tools.ietf.org/html/rfc3986#section-3.1
        // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
        if (ret.scheme && !_schemePattern.test(ret.scheme)) {
            throw new Error('[UriError]: Scheme contains illegal characters.');
        }
        // path, http://tools.ietf.org/html/rfc3986#section-3.3
        // If a URI contains an authority component, then the path component
        // must either be empty or begin with a slash ("/") character.  If a URI
        // does not contain an authority component, then the path cannot begin
        // with two slash characters ("//").
        if (ret.path) {
            if (ret.authority) {
                if (!_singleSlashStart.test(ret.path)) {
                    throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
                }
            }
            else {
                if (_doubleSlashStart.test(ret.path)) {
                    throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
                }
            }
        }
    }
    // for a while we allowed uris *without* schemes and this is the migration
    // for them, e.g. an uri without scheme and without strict-mode warns and falls
    // back to the file-scheme. that should cause the least carnage and still be a
    // clear warning
    function _schemeFix(scheme, _strict) {
        if (!scheme && !_strict) {
            return 'file';
        }
        return scheme;
    }
    // implements a bit of https://tools.ietf.org/html/rfc3986#section-5
    function _referenceResolution(scheme, path) {
        // the slash-character is our 'default base' as we don't
        // support constructing URIs relative to other URIs. This
        // also means that we alter and potentially break paths.
        // see https://tools.ietf.org/html/rfc3986#section-5.1.4
        switch (scheme) {
            case 'https':
            case 'http':
            case 'file':
                if (!path) {
                    path = _slash;
                }
                else if (path[0] !== _slash) {
                    path = _slash + path;
                }
                break;
        }
        return path;
    }
    const _empty = '';
    const _slash = '/';
    const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
    /**
     * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
     * This class is a simple parser which creates the basic component parts
     * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
     * and encoding.
     *
     * ```txt
     *       foo://example.com:8042/over/there?name=ferret#nose
     *       \_/   \______________/\_________/ \_________/ \__/
     *        |           |            |            |        |
     *     scheme     authority       path        query   fragment
     *        |   _____________________|__
     *       / \ /                        \
     *       urn:example:animal:ferret:nose
     * ```
     */
    class URI {
        /**
         * @internal
         */
        constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
            if (typeof schemeOrData === 'object') {
                this.scheme = schemeOrData.scheme || _empty;
                this.authority = schemeOrData.authority || _empty;
                this.path = schemeOrData.path || _empty;
                this.query = schemeOrData.query || _empty;
                this.fragment = schemeOrData.fragment || _empty;
                // no validation because it's this URI
                // that creates uri components.
                // _validateUri(this);
            }
            else {
                this.scheme = _schemeFix(schemeOrData, _strict);
                this.authority = authority || _empty;
                this.path = _referenceResolution(this.scheme, path || _empty);
                this.query = query || _empty;
                this.fragment = fragment || _empty;
                _validateUri(this, _strict);
            }
        }
        static isUri(thing) {
            if (thing instanceof URI) {
                return true;
            }
            if (!thing) {
                return false;
            }
            return typeof thing.authority === 'string'
                && typeof thing.fragment === 'string'
                && typeof thing.path === 'string'
                && typeof thing.query === 'string'
                && typeof thing.scheme === 'string'
                && typeof thing.fsPath === 'string'
                && typeof thing.with === 'function'
                && typeof thing.toString === 'function';
        }
        // ---- filesystem path -----------------------
        /**
         * Returns a string representing the corresponding file system path of this URI.
         * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
         * platform specific path separator.
         *
         * * Will *not* validate the path for invalid characters and semantics.
         * * Will *not* look at the scheme of this URI.
         * * The result shall *not* be used for display purposes but for accessing a file on disk.
         *
         *
         * The *difference* to `URI#path` is the use of the platform specific separator and the handling
         * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
         *
         * ```ts
            const u = URI.parse('file://server/c$/folder/file.txt')
            u.authority === 'server'
            u.path === '/shares/c$/file.txt'
            u.fsPath === '\\server\c$\folder\file.txt'
        ```
         *
         * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
         * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
         * with URIs that represent files on disk (`file` scheme).
         */
        get fsPath() {
            // if (this.scheme !== 'file') {
            // 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
            // }
            return uriToFsPath(this, false);
        }
        // ---- modify to new -------------------------
        with(change) {
            if (!change) {
                return this;
            }
            let { scheme, authority, path, query, fragment } = change;
            if (scheme === undefined) {
                scheme = this.scheme;
            }
            else if (scheme === null) {
                scheme = _empty;
            }
            if (authority === undefined) {
                authority = this.authority;
            }
            else if (authority === null) {
                authority = _empty;
            }
            if (path === undefined) {
                path = this.path;
            }
            else if (path === null) {
                path = _empty;
            }
            if (query === undefined) {
                query = this.query;
            }
            else if (query === null) {
                query = _empty;
            }
            if (fragment === undefined) {
                fragment = this.fragment;
            }
            else if (fragment === null) {
                fragment = _empty;
            }
            if (scheme === this.scheme
                && authority === this.authority
                && path === this.path
                && query === this.query
                && fragment === this.fragment) {
                return this;
            }
            return new Uri(scheme, authority, path, query, fragment);
        }
        // ---- parse & validate ------------------------
        /**
         * Creates a new URI from a string, e.g. `http://www.msft.com/some/path`,
         * `file:///usr/home`, or `scheme:with/path`.
         *
         * @param value A string which represents an URI (see `URI#toString`).
         */
        static parse(value, _strict = false) {
            const match = _regexp.exec(value);
            if (!match) {
                return new Uri(_empty, _empty, _empty, _empty, _empty);
            }
            return new Uri(match[2] || _empty, percentDecode(match[4] || _empty), percentDecode(match[5] || _empty), percentDecode(match[7] || _empty), percentDecode(match[9] || _empty), _strict);
        }
        /**
         * Creates a new URI from a file system path, e.g. `c:\my\files`,
         * `/usr/home`, or `\\server\share\some\path`.
         *
         * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
         * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
         * `URI.parse('file://' + path)` because the path might contain characters that are
         * interpreted (# and ?). See the following sample:
         * ```ts
        const good = URI.file('/coding/c#/project1');
        good.scheme === 'file';
        good.path === '/coding/c#/project1';
        good.fragment === '';
        const bad = URI.parse('file://' + '/coding/c#/project1');
        bad.scheme === 'file';
        bad.path === '/coding/c'; // path is now broken
        bad.fragment === '/project1';
        ```
         *
         * @param path A file system path (see `URI#fsPath`)
         */
        static file(path) {
            let authority = _empty;
            // normalize to fwd-slashes on windows,
            // on other systems bwd-slashes are valid
            // filename character, eg /f\oo/ba\r.txt
            if (platform_1.isWindows) {
                path = path.replace(/\\/g, _slash);
            }
            // check for authority as used in UNC shares
            // or use the path as given
            if (path[0] === _slash && path[1] === _slash) {
                const idx = path.indexOf(_slash, 2);
                if (idx === -1) {
                    authority = path.substring(2);
                    path = _slash;
                }
                else {
                    authority = path.substring(2, idx);
                    path = path.substring(idx) || _slash;
                }
            }
            return new Uri('file', authority, path, _empty, _empty);
        }
        static from(components) {
            return new Uri(components.scheme, components.authority, components.path, components.query, components.fragment);
        }
        /**
         * Join a URI path with path fragments and normalizes the resulting path.
         *
         * @param uri The input URI.
         * @param pathFragment The path fragment to add to the URI path.
         * @returns The resulting URI.
         */
        static joinPath(uri, ...pathFragment) {
            if (!uri.path) {
                throw new Error(`[UriError]: cannot call joinPath on URI without path`);
            }
            let newPath;
            if (platform_1.isWindows && uri.scheme === 'file') {
                newPath = URI.file(paths.win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
            }
            else {
                newPath = paths.posix.join(uri.path, ...pathFragment);
            }
            return uri.with({ path: newPath });
        }
        // ---- printing/externalize ---------------------------
        /**
         * Creates a string representation for this URI. It's guaranteed that calling
         * `URI.parse` with the result of this function creates an URI which is equal
         * to this URI.
         *
         * * The result shall *not* be used for display purposes but for externalization or transport.
         * * The result will be encoded using the percentage encoding and encoding happens mostly
         * ignore the scheme-specific encoding rules.
         *
         * @param skipEncoding Do not encode the result, default is `false`
         */
        toString(skipEncoding = false) {
            return _asFormatted(this, skipEncoding);
        }
        toJSON() {
            return this;
        }
        static revive(data) {
            if (!data) {
                return data;
            }
            else if (data instanceof URI) {
                return data;
            }
            else {
                const result = new Uri(data);
                result._formatted = data.external;
                result._fsPath = data._sep === _pathSepMarker ? data.fsPath : null;
                return result;
            }
        }
    }
    exports.URI = URI;
    const _pathSepMarker = platform_1.isWindows ? 1 : undefined;
    // This class exists so that URI is compatibile with vscode.Uri (API).
    class Uri extends URI {
        constructor() {
            super(...arguments);
            this._formatted = null;
            this._fsPath = null;
        }
        get fsPath() {
            if (!this._fsPath) {
                this._fsPath = uriToFsPath(this, false);
            }
            return this._fsPath;
        }
        toString(skipEncoding = false) {
            if (!skipEncoding) {
                if (!this._formatted) {
                    this._formatted = _asFormatted(this, false);
                }
                return this._formatted;
            }
            else {
                // we don't cache that
                return _asFormatted(this, true);
            }
        }
        toJSON() {
            const res = {
                $mid: 1
            };
            // cached state
            if (this._fsPath) {
                res.fsPath = this._fsPath;
                res._sep = _pathSepMarker;
            }
            if (this._formatted) {
                res.external = this._formatted;
            }
            // uri components
            if (this.path) {
                res.path = this.path;
            }
            if (this.scheme) {
                res.scheme = this.scheme;
            }
            if (this.authority) {
                res.authority = this.authority;
            }
            if (this.query) {
                res.query = this.query;
            }
            if (this.fragment) {
                res.fragment = this.fragment;
            }
            return res;
        }
    }
    // reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2
    const encodeTable = {
        [58 /* Colon */]: '%3A',
        [47 /* Slash */]: '%2F',
        [63 /* QuestionMark */]: '%3F',
        [35 /* Hash */]: '%23',
        [91 /* OpenSquareBracket */]: '%5B',
        [93 /* CloseSquareBracket */]: '%5D',
        [64 /* AtSign */]: '%40',
        [33 /* ExclamationMark */]: '%21',
        [36 /* DollarSign */]: '%24',
        [38 /* Ampersand */]: '%26',
        [39 /* SingleQuote */]: '%27',
        [40 /* OpenParen */]: '%28',
        [41 /* CloseParen */]: '%29',
        [42 /* Asterisk */]: '%2A',
        [43 /* Plus */]: '%2B',
        [44 /* Comma */]: '%2C',
        [59 /* Semicolon */]: '%3B',
        [61 /* Equals */]: '%3D',
        [32 /* Space */]: '%20',
    };
    function encodeURIComponentFast(uriComponent, allowSlash) {
        let res = undefined;
        let nativeEncodePos = -1;
        for (let pos = 0; pos < uriComponent.length; pos++) {
            const code = uriComponent.charCodeAt(pos);
            // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3
            if ((code >= 97 /* a */ && code <= 122 /* z */)
                || (code >= 65 /* A */ && code <= 90 /* Z */)
                || (code >= 48 /* Digit0 */ && code <= 57 /* Digit9 */)
                || code === 45 /* Dash */
                || code === 46 /* Period */
                || code === 95 /* Underline */
                || code === 126 /* Tilde */
                || (allowSlash && code === 47 /* Slash */)) {
                // check if we are delaying native encode
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                // check if we write into a new string (by default we try to return the param)
                if (res !== undefined) {
                    res += uriComponent.charAt(pos);
                }
            }
            else {
                // encoding needed, we need to allocate a new string
                if (res === undefined) {
                    res = uriComponent.substr(0, pos);
                }
                // check with default table first
                const escaped = encodeTable[code];
                if (escaped !== undefined) {
                    // check if we are delaying native encode
                    if (nativeEncodePos !== -1) {
                        res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                        nativeEncodePos = -1;
                    }
                    // append escaped variant to result
                    res += escaped;
                }
                else if (nativeEncodePos === -1) {
                    // use native encode only when needed
                    nativeEncodePos = pos;
                }
            }
        }
        if (nativeEncodePos !== -1) {
            res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
        }
        return res !== undefined ? res : uriComponent;
    }
    function encodeURIComponentMinimal(path) {
        let res = undefined;
        for (let pos = 0; pos < path.length; pos++) {
            const code = path.charCodeAt(pos);
            if (code === 35 /* Hash */ || code === 63 /* QuestionMark */) {
                if (res === undefined) {
                    res = path.substr(0, pos);
                }
                res += encodeTable[code];
            }
            else {
                if (res !== undefined) {
                    res += path[pos];
                }
            }
        }
        return res !== undefined ? res : path;
    }
    /**
     * Compute `fsPath` for the given uri
     */
    function uriToFsPath(uri, keepDriveLetterCasing) {
        let value;
        if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
            // unc path: file://shares/c$/far/boo
            value = `//${uri.authority}${uri.path}`;
        }
        else if (uri.path.charCodeAt(0) === 47 /* Slash */
            && (uri.path.charCodeAt(1) >= 65 /* A */ && uri.path.charCodeAt(1) <= 90 /* Z */ || uri.path.charCodeAt(1) >= 97 /* a */ && uri.path.charCodeAt(1) <= 122 /* z */)
            && uri.path.charCodeAt(2) === 58 /* Colon */) {
            if (!keepDriveLetterCasing) {
                // windows drive letter: file:///c:/far/boo
                value = uri.path[1].toLowerCase() + uri.path.substr(2);
            }
            else {
                value = uri.path.substr(1);
            }
        }
        else {
            // other path
            value = uri.path;
        }
        if (platform_1.isWindows) {
            value = value.replace(/\//g, '\\');
        }
        return value;
    }
    exports.uriToFsPath = uriToFsPath;
    /**
     * Create the external version of a uri
     */
    function _asFormatted(uri, skipEncoding) {
        const encoder = !skipEncoding
            ? encodeURIComponentFast
            : encodeURIComponentMinimal;
        let res = '';
        let { scheme, authority, path, query, fragment } = uri;
        if (scheme) {
            res += scheme;
            res += ':';
        }
        if (authority || scheme === 'file') {
            res += _slash;
            res += _slash;
        }
        if (authority) {
            let idx = authority.indexOf('@');
            if (idx !== -1) {
                // <user>@<auth>
                const userinfo = authority.substr(0, idx);
                authority = authority.substr(idx + 1);
                idx = userinfo.indexOf(':');
                if (idx === -1) {
                    res += encoder(userinfo, false);
                }
                else {
                    // <user>:<pass>@<auth>
                    res += encoder(userinfo.substr(0, idx), false);
                    res += ':';
                    res += encoder(userinfo.substr(idx + 1), false);
                }
                res += '@';
            }
            authority = authority.toLowerCase();
            idx = authority.indexOf(':');
            if (idx === -1) {
                res += encoder(authority, false);
            }
            else {
                // <auth>:<port>
                res += encoder(authority.substr(0, idx), false);
                res += authority.substr(idx);
            }
        }
        if (path) {
            // lower-case windows drive letters in /C:/fff or C:/fff
            if (path.length >= 3 && path.charCodeAt(0) === 47 /* Slash */ && path.charCodeAt(2) === 58 /* Colon */) {
                const code = path.charCodeAt(1);
                if (code >= 65 /* A */ && code <= 90 /* Z */) {
                    path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`; // "/c:".length === 3
                }
            }
            else if (path.length >= 2 && path.charCodeAt(1) === 58 /* Colon */) {
                const code = path.charCodeAt(0);
                if (code >= 65 /* A */ && code <= 90 /* Z */) {
                    path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`; // "/c:".length === 3
                }
            }
            // encode the rest of the path
            res += encoder(path, true);
        }
        if (query) {
            res += '?';
            res += encoder(query, false);
        }
        if (fragment) {
            res += '#';
            res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
        }
        return res;
    }
    // --- decode
    function decodeURIComponentGraceful(str) {
        try {
            return decodeURIComponent(str);
        }
        catch (_a) {
            if (str.length > 3) {
                return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
            }
            else {
                return str;
            }
        }
    }
    const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
    function percentDecode(str) {
        if (!str.match(_rEncodedAsHex)) {
            return str;
        }
        return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
define(__m[17/*vs/base/common/map*/], __M([0/*require*/,1/*exports*/,8/*vs/base/common/uri*/,2/*vs/base/common/strings*/]), function (require, exports, uri_1, strings_1) {
    "use strict";
    var _a, _b, _ReadonlyMapView_source;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReadonlyMapView = exports.LRUCache = exports.LinkedMap = exports.Touch = exports.ResourceMap = exports.TernarySearchTree = exports.UriIterator = exports.PathIterator = exports.ConfigKeysIterator = exports.StringIterator = exports.setToString = exports.mapToString = exports.getOrSet = void 0;
    function getOrSet(map, key, value) {
        let result = map.get(key);
        if (result === undefined) {
            result = value;
            map.set(key, result);
        }
        return result;
    }
    exports.getOrSet = getOrSet;
    function mapToString(map) {
        const entries = [];
        map.forEach((value, key) => {
            entries.push(`${key} => ${value}`);
        });
        return `Map(${map.size}) {${entries.join(', ')}}`;
    }
    exports.mapToString = mapToString;
    function setToString(set) {
        const entries = [];
        set.forEach(value => {
            entries.push(value);
        });
        return `Set(${set.size}) {${entries.join(', ')}}`;
    }
    exports.setToString = setToString;
    class StringIterator {
        constructor() {
            this._value = '';
            this._pos = 0;
        }
        reset(key) {
            this._value = key;
            this._pos = 0;
            return this;
        }
        next() {
            this._pos += 1;
            return this;
        }
        hasNext() {
            return this._pos < this._value.length - 1;
        }
        cmp(a) {
            const aCode = a.charCodeAt(0);
            const thisCode = this._value.charCodeAt(this._pos);
            return aCode - thisCode;
        }
        value() {
            return this._value[this._pos];
        }
    }
    exports.StringIterator = StringIterator;
    class ConfigKeysIterator {
        constructor(_caseSensitive = true) {
            this._caseSensitive = _caseSensitive;
        }
        reset(key) {
            this._value = key;
            this._from = 0;
            this._to = 0;
            return this.next();
        }
        hasNext() {
            return this._to < this._value.length;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this._from = this._to;
            let justSeps = true;
            for (; this._to < this._value.length; this._to++) {
                const ch = this._value.charCodeAt(this._to);
                if (ch === 46 /* Period */) {
                    if (justSeps) {
                        this._from++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this._caseSensitive
                ? (0, strings_1.compareSubstring)(a, this._value, 0, a.length, this._from, this._to)
                : (0, strings_1.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
        }
        value() {
            return this._value.substring(this._from, this._to);
        }
    }
    exports.ConfigKeysIterator = ConfigKeysIterator;
    class PathIterator {
        constructor(_splitOnBackslash = true, _caseSensitive = true) {
            this._splitOnBackslash = _splitOnBackslash;
            this._caseSensitive = _caseSensitive;
        }
        reset(key) {
            this._value = key.replace(/\\$|\/$/, '');
            this._from = 0;
            this._to = 0;
            return this.next();
        }
        hasNext() {
            return this._to < this._value.length;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this._from = this._to;
            let justSeps = true;
            for (; this._to < this._value.length; this._to++) {
                const ch = this._value.charCodeAt(this._to);
                if (ch === 47 /* Slash */ || this._splitOnBackslash && ch === 92 /* Backslash */) {
                    if (justSeps) {
                        this._from++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this._caseSensitive
                ? (0, strings_1.compareSubstring)(a, this._value, 0, a.length, this._from, this._to)
                : (0, strings_1.compareSubstringIgnoreCase)(a, this._value, 0, a.length, this._from, this._to);
        }
        value() {
            return this._value.substring(this._from, this._to);
        }
    }
    exports.PathIterator = PathIterator;
    var UriIteratorState;
    (function (UriIteratorState) {
        UriIteratorState[UriIteratorState["Scheme"] = 1] = "Scheme";
        UriIteratorState[UriIteratorState["Authority"] = 2] = "Authority";
        UriIteratorState[UriIteratorState["Path"] = 3] = "Path";
        UriIteratorState[UriIteratorState["Query"] = 4] = "Query";
        UriIteratorState[UriIteratorState["Fragment"] = 5] = "Fragment";
    })(UriIteratorState || (UriIteratorState = {}));
    class UriIterator {
        constructor(_ignorePathCasing) {
            this._ignorePathCasing = _ignorePathCasing;
            this._states = [];
            this._stateIdx = 0;
        }
        reset(key) {
            this._value = key;
            this._states = [];
            if (this._value.scheme) {
                this._states.push(1 /* Scheme */);
            }
            if (this._value.authority) {
                this._states.push(2 /* Authority */);
            }
            if (this._value.path) {
                this._pathIterator = new PathIterator(false, !this._ignorePathCasing(key));
                this._pathIterator.reset(key.path);
                if (this._pathIterator.value()) {
                    this._states.push(3 /* Path */);
                }
            }
            if (this._value.query) {
                this._states.push(4 /* Query */);
            }
            if (this._value.fragment) {
                this._states.push(5 /* Fragment */);
            }
            this._stateIdx = 0;
            return this;
        }
        next() {
            if (this._states[this._stateIdx] === 3 /* Path */ && this._pathIterator.hasNext()) {
                this._pathIterator.next();
            }
            else {
                this._stateIdx += 1;
            }
            return this;
        }
        hasNext() {
            return (this._states[this._stateIdx] === 3 /* Path */ && this._pathIterator.hasNext())
                || this._stateIdx < this._states.length - 1;
        }
        cmp(a) {
            if (this._states[this._stateIdx] === 1 /* Scheme */) {
                return (0, strings_1.compareIgnoreCase)(a, this._value.scheme);
            }
            else if (this._states[this._stateIdx] === 2 /* Authority */) {
                return (0, strings_1.compareIgnoreCase)(a, this._value.authority);
            }
            else if (this._states[this._stateIdx] === 3 /* Path */) {
                return this._pathIterator.cmp(a);
            }
            else if (this._states[this._stateIdx] === 4 /* Query */) {
                return (0, strings_1.compare)(a, this._value.query);
            }
            else if (this._states[this._stateIdx] === 5 /* Fragment */) {
                return (0, strings_1.compare)(a, this._value.fragment);
            }
            throw new Error();
        }
        value() {
            if (this._states[this._stateIdx] === 1 /* Scheme */) {
                return this._value.scheme;
            }
            else if (this._states[this._stateIdx] === 2 /* Authority */) {
                return this._value.authority;
            }
            else if (this._states[this._stateIdx] === 3 /* Path */) {
                return this._pathIterator.value();
            }
            else if (this._states[this._stateIdx] === 4 /* Query */) {
                return this._value.query;
            }
            else if (this._states[this._stateIdx] === 5 /* Fragment */) {
                return this._value.fragment;
            }
            throw new Error();
        }
    }
    exports.UriIterator = UriIterator;
    class TernarySearchTreeNode {
        isEmpty() {
            return !this.left && !this.mid && !this.right && !this.value;
        }
    }
    class TernarySearchTree {
        constructor(segments) {
            this._iter = segments;
        }
        static forUris(ignorePathCasing = () => false) {
            return new TernarySearchTree(new UriIterator(ignorePathCasing));
        }
        static forPaths() {
            return new TernarySearchTree(new PathIterator());
        }
        static forStrings() {
            return new TernarySearchTree(new StringIterator());
        }
        static forConfigKeys() {
            return new TernarySearchTree(new ConfigKeysIterator());
        }
        clear() {
            this._root = undefined;
        }
        set(key, element) {
            const iter = this._iter.reset(key);
            let node;
            if (!this._root) {
                this._root = new TernarySearchTreeNode();
                this._root.segment = iter.value();
            }
            node = this._root;
            while (true) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    if (!node.left) {
                        node.left = new TernarySearchTreeNode();
                        node.left.segment = iter.value();
                    }
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    if (!node.right) {
                        node.right = new TernarySearchTreeNode();
                        node.right.segment = iter.value();
                    }
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    if (!node.mid) {
                        node.mid = new TernarySearchTreeNode();
                        node.mid.segment = iter.value();
                    }
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            const oldElement = node.value;
            node.value = element;
            node.key = key;
            return oldElement;
        }
        get(key) {
            var _c;
            return (_c = this._getNode(key)) === null || _c === void 0 ? void 0 : _c.value;
        }
        _getNode(key) {
            const iter = this._iter.reset(key);
            let node = this._root;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node;
        }
        has(key) {
            const node = this._getNode(key);
            return !((node === null || node === void 0 ? void 0 : node.value) === undefined && (node === null || node === void 0 ? void 0 : node.mid) === undefined);
        }
        delete(key) {
            return this._delete(key, false);
        }
        deleteSuperstr(key) {
            return this._delete(key, true);
        }
        _delete(key, superStr) {
            const iter = this._iter.reset(key);
            const stack = [];
            let node = this._root;
            // find and unset node
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    stack.push([1, node]);
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    stack.push([-1, node]);
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    stack.push([0, node]);
                    node = node.mid;
                }
                else {
                    if (superStr) {
                        // remove children
                        node.left = undefined;
                        node.mid = undefined;
                        node.right = undefined;
                    }
                    else {
                        // remove element
                        node.value = undefined;
                    }
                    // clean up empty nodes
                    while (stack.length > 0 && node.isEmpty()) {
                        let [dir, parent] = stack.pop();
                        switch (dir) {
                            case 1:
                                parent.left = undefined;
                                break;
                            case 0:
                                parent.mid = undefined;
                                break;
                            case -1:
                                parent.right = undefined;
                                break;
                        }
                        node = parent;
                    }
                    break;
                }
            }
        }
        findSubstr(key) {
            const iter = this._iter.reset(key);
            let node = this._root;
            let candidate = undefined;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    candidate = node.value || candidate;
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node && node.value || candidate;
        }
        findSuperstr(key) {
            const iter = this._iter.reset(key);
            let node = this._root;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    // collect
                    if (!node.mid) {
                        return undefined;
                    }
                    else {
                        return this._entries(node.mid);
                    }
                }
            }
            return undefined;
        }
        forEach(callback) {
            for (const [key, value] of this) {
                callback(value, key);
            }
        }
        *[Symbol.iterator]() {
            yield* this._entries(this._root);
        }
        *_entries(node) {
            if (node) {
                // left
                yield* this._entries(node.left);
                // node
                if (node.value) {
                    // callback(node.value, this._iter.join(parts));
                    yield [node.key, node.value];
                }
                // mid
                yield* this._entries(node.mid);
                // right
                yield* this._entries(node.right);
            }
        }
    }
    exports.TernarySearchTree = TernarySearchTree;
    class ResourceMap {
        constructor(mapOrKeyFn, toKey) {
            this[_a] = 'ResourceMap';
            if (mapOrKeyFn instanceof ResourceMap) {
                this.map = new Map(mapOrKeyFn.map);
                this.toKey = toKey !== null && toKey !== void 0 ? toKey : ResourceMap.defaultToKey;
            }
            else {
                this.map = new Map();
                this.toKey = mapOrKeyFn !== null && mapOrKeyFn !== void 0 ? mapOrKeyFn : ResourceMap.defaultToKey;
            }
        }
        set(resource, value) {
            this.map.set(this.toKey(resource), value);
            return this;
        }
        get(resource) {
            return this.map.get(this.toKey(resource));
        }
        has(resource) {
            return this.map.has(this.toKey(resource));
        }
        get size() {
            return this.map.size;
        }
        clear() {
            this.map.clear();
        }
        delete(resource) {
            return this.map.delete(this.toKey(resource));
        }
        forEach(clb, thisArg) {
            if (typeof thisArg !== 'undefined') {
                clb = clb.bind(thisArg);
            }
            for (let [index, value] of this.map) {
                clb(value, uri_1.URI.parse(index), this);
            }
        }
        values() {
            return this.map.values();
        }
        *keys() {
            for (let key of this.map.keys()) {
                yield uri_1.URI.parse(key);
            }
        }
        *entries() {
            for (let tuple of this.map.entries()) {
                yield [uri_1.URI.parse(tuple[0]), tuple[1]];
            }
        }
        *[(_a = Symbol.toStringTag, Symbol.iterator)]() {
            for (let item of this.map) {
                yield [uri_1.URI.parse(item[0]), item[1]];
            }
        }
    }
    exports.ResourceMap = ResourceMap;
    ResourceMap.defaultToKey = (resource) => resource.toString();
    var Touch;
    (function (Touch) {
        Touch[Touch["None"] = 0] = "None";
        Touch[Touch["AsOld"] = 1] = "AsOld";
        Touch[Touch["AsNew"] = 2] = "AsNew";
    })(Touch = exports.Touch || (exports.Touch = {}));
    class LinkedMap {
        constructor() {
            this[_b] = 'LinkedMap';
            this._map = new Map();
            this._head = undefined;
            this._tail = undefined;
            this._size = 0;
            this._state = 0;
        }
        clear() {
            this._map.clear();
            this._head = undefined;
            this._tail = undefined;
            this._size = 0;
            this._state++;
        }
        isEmpty() {
            return !this._head && !this._tail;
        }
        get size() {
            return this._size;
        }
        get first() {
            var _c;
            return (_c = this._head) === null || _c === void 0 ? void 0 : _c.value;
        }
        get last() {
            var _c;
            return (_c = this._tail) === null || _c === void 0 ? void 0 : _c.value;
        }
        has(key) {
            return this._map.has(key);
        }
        get(key, touch = 0 /* None */) {
            const item = this._map.get(key);
            if (!item) {
                return undefined;
            }
            if (touch !== 0 /* None */) {
                this.touch(item, touch);
            }
            return item.value;
        }
        set(key, value, touch = 0 /* None */) {
            let item = this._map.get(key);
            if (item) {
                item.value = value;
                if (touch !== 0 /* None */) {
                    this.touch(item, touch);
                }
            }
            else {
                item = { key, value, next: undefined, previous: undefined };
                switch (touch) {
                    case 0 /* None */:
                        this.addItemLast(item);
                        break;
                    case 1 /* AsOld */:
                        this.addItemFirst(item);
                        break;
                    case 2 /* AsNew */:
                        this.addItemLast(item);
                        break;
                    default:
                        this.addItemLast(item);
                        break;
                }
                this._map.set(key, item);
                this._size++;
            }
            return this;
        }
        delete(key) {
            return !!this.remove(key);
        }
        remove(key) {
            const item = this._map.get(key);
            if (!item) {
                return undefined;
            }
            this._map.delete(key);
            this.removeItem(item);
            this._size--;
            return item.value;
        }
        shift() {
            if (!this._head && !this._tail) {
                return undefined;
            }
            if (!this._head || !this._tail) {
                throw new Error('Invalid list');
            }
            const item = this._head;
            this._map.delete(item.key);
            this.removeItem(item);
            this._size--;
            return item.value;
        }
        forEach(callbackfn, thisArg) {
            const state = this._state;
            let current = this._head;
            while (current) {
                if (thisArg) {
                    callbackfn.bind(thisArg)(current.value, current.key, this);
                }
                else {
                    callbackfn(current.value, current.key, this);
                }
                if (this._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                current = current.next;
            }
        }
        keys() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.key, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        values() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: current.value, done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        entries() {
            const map = this;
            const state = this._state;
            let current = this._head;
            const iterator = {
                [Symbol.iterator]() {
                    return iterator;
                },
                next() {
                    if (map._state !== state) {
                        throw new Error(`LinkedMap got modified during iteration.`);
                    }
                    if (current) {
                        const result = { value: [current.key, current.value], done: false };
                        current = current.next;
                        return result;
                    }
                    else {
                        return { value: undefined, done: true };
                    }
                }
            };
            return iterator;
        }
        [(_b = Symbol.toStringTag, Symbol.iterator)]() {
            return this.entries();
        }
        trimOld(newSize) {
            if (newSize >= this.size) {
                return;
            }
            if (newSize === 0) {
                this.clear();
                return;
            }
            let current = this._head;
            let currentSize = this.size;
            while (current && currentSize > newSize) {
                this._map.delete(current.key);
                current = current.next;
                currentSize--;
            }
            this._head = current;
            this._size = currentSize;
            if (current) {
                current.previous = undefined;
            }
            this._state++;
        }
        addItemFirst(item) {
            // First time Insert
            if (!this._head && !this._tail) {
                this._tail = item;
            }
            else if (!this._head) {
                throw new Error('Invalid list');
            }
            else {
                item.next = this._head;
                this._head.previous = item;
            }
            this._head = item;
            this._state++;
        }
        addItemLast(item) {
            // First time Insert
            if (!this._head && !this._tail) {
                this._head = item;
            }
            else if (!this._tail) {
                throw new Error('Invalid list');
            }
            else {
                item.previous = this._tail;
                this._tail.next = item;
            }
            this._tail = item;
            this._state++;
        }
        removeItem(item) {
            if (item === this._head && item === this._tail) {
                this._head = undefined;
                this._tail = undefined;
            }
            else if (item === this._head) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.next) {
                    throw new Error('Invalid list');
                }
                item.next.previous = undefined;
                this._head = item.next;
            }
            else if (item === this._tail) {
                // This can only happen if size === 1 which is handled
                // by the case above.
                if (!item.previous) {
                    throw new Error('Invalid list');
                }
                item.previous.next = undefined;
                this._tail = item.previous;
            }
            else {
                const next = item.next;
                const previous = item.previous;
                if (!next || !previous) {
                    throw new Error('Invalid list');
                }
                next.previous = previous;
                previous.next = next;
            }
            item.next = undefined;
            item.previous = undefined;
            this._state++;
        }
        touch(item, touch) {
            if (!this._head || !this._tail) {
                throw new Error('Invalid list');
            }
            if ((touch !== 1 /* AsOld */ && touch !== 2 /* AsNew */)) {
                return;
            }
            if (touch === 1 /* AsOld */) {
                if (item === this._head) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item
                if (item === this._tail) {
                    // previous must be defined since item was not head but is tail
                    // So there are more than on item in the map
                    previous.next = undefined;
                    this._tail = previous;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                // Insert the node at head
                item.previous = undefined;
                item.next = this._head;
                this._head.previous = item;
                this._head = item;
                this._state++;
            }
            else if (touch === 2 /* AsNew */) {
                if (item === this._tail) {
                    return;
                }
                const next = item.next;
                const previous = item.previous;
                // Unlink the item.
                if (item === this._head) {
                    // next must be defined since item was not tail but is head
                    // So there are more than on item in the map
                    next.previous = undefined;
                    this._head = next;
                }
                else {
                    // Both next and previous are not undefined since item was neither head nor tail.
                    next.previous = previous;
                    previous.next = next;
                }
                item.next = undefined;
                item.previous = this._tail;
                this._tail.next = item;
                this._tail = item;
                this._state++;
            }
        }
        toJSON() {
            const data = [];
            this.forEach((value, key) => {
                data.push([key, value]);
            });
            return data;
        }
        fromJSON(data) {
            this.clear();
            for (const [key, value] of data) {
                this.set(key, value);
            }
        }
    }
    exports.LinkedMap = LinkedMap;
    class LRUCache extends LinkedMap {
        constructor(limit, ratio = 1) {
            super();
            this._limit = limit;
            this._ratio = Math.min(Math.max(0, ratio), 1);
        }
        get limit() {
            return this._limit;
        }
        set limit(limit) {
            this._limit = limit;
            this.checkTrim();
        }
        get ratio() {
            return this._ratio;
        }
        set ratio(ratio) {
            this._ratio = Math.min(Math.max(0, ratio), 1);
            this.checkTrim();
        }
        get(key, touch = 2 /* AsNew */) {
            return super.get(key, touch);
        }
        peek(key) {
            return super.get(key, 0 /* None */);
        }
        set(key, value) {
            super.set(key, value, 2 /* AsNew */);
            this.checkTrim();
            return this;
        }
        checkTrim() {
            if (this.size > this._limit) {
                this.trimOld(Math.round(this._limit * this._ratio));
            }
        }
    }
    exports.LRUCache = LRUCache;
    /**
     * Wraps the map in type that only implements readonly properties. Useful
     * in the extension host to prevent the consumer from making any mutations.
     */
    class ReadonlyMapView {
        constructor(source) {
            _ReadonlyMapView_source.set(this, void 0);
            __classPrivateFieldSet(this, _ReadonlyMapView_source, source, "f");
        }
        get size() {
            return __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").size;
        }
        forEach(callbackfn, thisArg) {
            __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").forEach(callbackfn, thisArg);
        }
        get(key) {
            return __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").get(key);
        }
        has(key) {
            return __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").has(key);
        }
        entries() {
            return __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").entries();
        }
        keys() {
            return __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").keys();
        }
        values() {
            return __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").values();
        }
        [(_ReadonlyMapView_source = new WeakMap(), Symbol.iterator)]() {
            return __classPrivateFieldGet(this, _ReadonlyMapView_source, "f").entries();
        }
    }
    exports.ReadonlyMapView = ReadonlyMapView;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[18/*vs/base/common/network*/], __M([0/*require*/,1/*exports*/,8/*vs/base/common/uri*/,3/*vs/base/common/platform*/]), function (require, exports, uri_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileAccess = exports.RemoteAuthorities = exports.Schemas = void 0;
    var Schemas;
    (function (Schemas) {
        /**
         * A schema that is used for models that exist in memory
         * only and that have no correspondence on a server or such.
         */
        Schemas.inMemory = 'inmemory';
        /**
         * A schema that is used for setting files
         */
        Schemas.vscode = 'vscode';
        /**
         * A schema that is used for internal private files
         */
        Schemas.internal = 'private';
        /**
         * A walk-through document.
         */
        Schemas.walkThrough = 'walkThrough';
        /**
         * An embedded code snippet.
         */
        Schemas.walkThroughSnippet = 'walkThroughSnippet';
        Schemas.http = 'http';
        Schemas.https = 'https';
        Schemas.file = 'file';
        Schemas.mailto = 'mailto';
        Schemas.untitled = 'untitled';
        Schemas.data = 'data';
        Schemas.command = 'command';
        Schemas.vscodeRemote = 'vscode-remote';
        Schemas.vscodeRemoteResource = 'vscode-remote-resource';
        Schemas.userData = 'vscode-userdata';
        Schemas.vscodeCustomEditor = 'vscode-custom-editor';
        Schemas.vscodeNotebook = 'vscode-notebook';
        Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
        Schemas.vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata';
        Schemas.vscodeSettings = 'vscode-settings';
        Schemas.vscodeWorkspaceTrust = 'vscode-workspace-trust';
        Schemas.vscodeTerminal = 'vscode-terminal';
        Schemas.webviewPanel = 'webview-panel';
        /**
         * Scheme used for loading the wrapper html and script in webviews.
         */
        Schemas.vscodeWebview = 'vscode-webview';
        /**
         * Scheme used for extension pages
         */
        Schemas.extension = 'extension';
        /**
         * Scheme used as a replacement of `file` scheme to load
         * files with our custom protocol handler (desktop only).
         */
        Schemas.vscodeFileResource = 'vscode-file';
        /**
         * Scheme used for temporary resources
         */
        Schemas.tmp = 'tmp';
    })(Schemas = exports.Schemas || (exports.Schemas = {}));
    class RemoteAuthoritiesImpl {
        constructor() {
            this._hosts = Object.create(null);
            this._ports = Object.create(null);
            this._connectionTokens = Object.create(null);
            this._preferredWebSchema = 'http';
            this._delegate = null;
        }
        setPreferredWebSchema(schema) {
            this._preferredWebSchema = schema;
        }
        setDelegate(delegate) {
            this._delegate = delegate;
        }
        set(authority, host, port) {
            this._hosts[authority] = host;
            this._ports[authority] = port;
        }
        setConnectionToken(authority, connectionToken) {
            this._connectionTokens[authority] = connectionToken;
        }
        rewrite(uri) {
            if (this._delegate) {
                return this._delegate(uri);
            }
            const authority = uri.authority;
            let host = this._hosts[authority];
            if (host && host.indexOf(':') !== -1) {
                host = `[${host}]`;
            }
            // const port = this._ports[authority];
            const connectionToken = this._connectionTokens[authority];
            let query = `path=${encodeURIComponent(uri.path)}`;
            if (typeof connectionToken === 'string') {
                query += `&tkn=${encodeURIComponent(connectionToken)}`;
            }
            // NOTE@coder: Changed this to work against the current path.
            return uri_1.URI.from({
                scheme: platform.isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
                authority: window.location.host,
                path: `${window.location.pathname.replace(/\/+$/, '')}/vscode-remote-resource`,
                query
            });
        }
    }
    exports.RemoteAuthorities = new RemoteAuthoritiesImpl();
    class FileAccessImpl {
        constructor() {
            this.FALLBACK_AUTHORITY = 'vscode-app';
        }
        asBrowserUri(uriOrModule, moduleIdToUrl, __forceCodeFileUri) {
            const uri = this.toUri(uriOrModule, moduleIdToUrl);
            // Handle remote URIs via `RemoteAuthorities`
            if (uri.scheme === Schemas.vscodeRemote) {
                return exports.RemoteAuthorities.rewrite(uri);
            }
            // Only convert the URI if we are in a native context and it has `file:` scheme
            // and we have explicitly enabled the conversion (sandbox, or VSCODE_BROWSER_CODE_LOADING)
            if (platform.isNative && (__forceCodeFileUri || platform.isPreferringBrowserCodeLoad) && uri.scheme === Schemas.file) {
                return uri.with({
                    scheme: Schemas.vscodeFileResource,
                    // We need to provide an authority here so that it can serve
                    // as origin for network and loading matters in chromium.
                    // If the URI is not coming with an authority already, we
                    // add our own
                    authority: uri.authority || this.FALLBACK_AUTHORITY,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        asFileUri(uriOrModule, moduleIdToUrl) {
            const uri = this.toUri(uriOrModule, moduleIdToUrl);
            // Only convert the URI if it is `vscode-file:` scheme
            if (uri.scheme === Schemas.vscodeFileResource) {
                return uri.with({
                    scheme: Schemas.file,
                    // Only preserve the `authority` if it is different from
                    // our fallback authority. This ensures we properly preserve
                    // Windows UNC paths that come with their own authority.
                    authority: uri.authority !== this.FALLBACK_AUTHORITY ? uri.authority : null,
                    query: null,
                    fragment: null
                });
            }
            return uri;
        }
        toUri(uriOrModule, moduleIdToUrl) {
            if (uri_1.URI.isUri(uriOrModule)) {
                return uriOrModule;
            }
            return uri_1.URI.parse(moduleIdToUrl.toUrl(uriOrModule));
        }
    }
    exports.FileAccess = new FileAccessImpl();
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[35/*vs/base/common/resources*/], __M([0/*require*/,1/*exports*/,16/*vs/base/common/extpath*/,5/*vs/base/common/path*/,8/*vs/base/common/uri*/,2/*vs/base/common/strings*/,18/*vs/base/common/network*/,3/*vs/base/common/platform*/]), function (require, exports, extpath, paths, uri_1, strings_1, network_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toLocalResource = exports.DataUri = exports.distinctParents = exports.addTrailingPathSeparator = exports.removeTrailingPathSeparator = exports.hasTrailingPathSeparator = exports.isEqualAuthority = exports.isAbsolutePath = exports.resolvePath = exports.relativePath = exports.normalizePath = exports.joinPath = exports.dirname = exports.extname = exports.basename = exports.basenameOrAuthority = exports.getComparisonKey = exports.isEqualOrParent = exports.isEqual = exports.extUriIgnorePathCase = exports.extUriBiasedIgnorePathCase = exports.extUri = exports.ExtUri = exports.originalFSPath = void 0;
    function originalFSPath(uri) {
        return (0, uri_1.uriToFsPath)(uri, true);
    }
    exports.originalFSPath = originalFSPath;
    class ExtUri {
        constructor(_ignorePathCasing) {
            this._ignorePathCasing = _ignorePathCasing;
        }
        compare(uri1, uri2, ignoreFragment = false) {
            if (uri1 === uri2) {
                return 0;
            }
            return (0, strings_1.compare)(this.getComparisonKey(uri1, ignoreFragment), this.getComparisonKey(uri2, ignoreFragment));
        }
        isEqual(uri1, uri2, ignoreFragment = false) {
            if (uri1 === uri2) {
                return true;
            }
            if (!uri1 || !uri2) {
                return false;
            }
            return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri2, ignoreFragment);
        }
        getComparisonKey(uri, ignoreFragment = false) {
            return uri.with({
                path: this._ignorePathCasing(uri) ? uri.path.toLowerCase() : undefined,
                fragment: ignoreFragment ? null : undefined
            }).toString();
        }
        ignorePathCasing(uri) {
            return this._ignorePathCasing(uri);
        }
        isEqualOrParent(base, parentCandidate, ignoreFragment = false) {
            if (base.scheme === parentCandidate.scheme) {
                if (base.scheme === network_1.Schemas.file) {
                    return extpath.isEqualOrParent(originalFSPath(base), originalFSPath(parentCandidate), this._ignorePathCasing(base)) && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
                }
                if ((0, exports.isEqualAuthority)(base.authority, parentCandidate.authority)) {
                    return extpath.isEqualOrParent(base.path, parentCandidate.path, this._ignorePathCasing(base), '/') && base.query === parentCandidate.query && (ignoreFragment || base.fragment === parentCandidate.fragment);
                }
            }
            return false;
        }
        // --- path math
        joinPath(resource, ...pathFragment) {
            return uri_1.URI.joinPath(resource, ...pathFragment);
        }
        basenameOrAuthority(resource) {
            return (0, exports.basename)(resource) || resource.authority;
        }
        basename(resource) {
            return paths.posix.basename(resource.path);
        }
        extname(resource) {
            return paths.posix.extname(resource.path);
        }
        dirname(resource) {
            if (resource.path.length === 0) {
                return resource;
            }
            let dirname;
            if (resource.scheme === network_1.Schemas.file) {
                dirname = uri_1.URI.file(paths.dirname(originalFSPath(resource))).path;
            }
            else {
                dirname = paths.posix.dirname(resource.path);
                if (resource.authority && dirname.length && dirname.charCodeAt(0) !== 47 /* Slash */) {
                    console.error(`dirname("${resource.toString})) resulted in a relative path`);
                    dirname = '/'; // If a URI contains an authority component, then the path component must either be empty or begin with a CharCode.Slash ("/") character
                }
            }
            return resource.with({
                path: dirname
            });
        }
        normalizePath(resource) {
            if (!resource.path.length) {
                return resource;
            }
            let normalizedPath;
            if (resource.scheme === network_1.Schemas.file) {
                normalizedPath = uri_1.URI.file(paths.normalize(originalFSPath(resource))).path;
            }
            else {
                normalizedPath = paths.posix.normalize(resource.path);
            }
            return resource.with({
                path: normalizedPath
            });
        }
        relativePath(from, to) {
            if (from.scheme !== to.scheme || !(0, exports.isEqualAuthority)(from.authority, to.authority)) {
                return undefined;
            }
            if (from.scheme === network_1.Schemas.file) {
                const relativePath = paths.relative(originalFSPath(from), originalFSPath(to));
                return platform_1.isWindows ? extpath.toSlashes(relativePath) : relativePath;
            }
            let fromPath = from.path || '/', toPath = to.path || '/';
            if (this._ignorePathCasing(from)) {
                // make casing of fromPath match toPath
                let i = 0;
                for (const len = Math.min(fromPath.length, toPath.length); i < len; i++) {
                    if (fromPath.charCodeAt(i) !== toPath.charCodeAt(i)) {
                        if (fromPath.charAt(i).toLowerCase() !== toPath.charAt(i).toLowerCase()) {
                            break;
                        }
                    }
                }
                fromPath = toPath.substr(0, i) + fromPath.substr(i);
            }
            return paths.posix.relative(fromPath, toPath);
        }
        resolvePath(base, path) {
            if (base.scheme === network_1.Schemas.file) {
                const newURI = uri_1.URI.file(paths.resolve(originalFSPath(base), path));
                return base.with({
                    authority: newURI.authority,
                    path: newURI.path
                });
            }
            if (path.indexOf('/') === -1) { // no slashes? it's likely a Windows path
                path = extpath.toSlashes(path);
                if (/^[a-zA-Z]:(\/|$)/.test(path)) { // starts with a drive letter
                    path = '/' + path;
                }
            }
            return base.with({
                path: paths.posix.resolve(base.path, path)
            });
        }
        // --- misc
        isAbsolutePath(resource) {
            return !!resource.path && resource.path[0] === '/';
        }
        isEqualAuthority(a1, a2) {
            return a1 === a2 || (0, strings_1.equalsIgnoreCase)(a1, a2);
        }
        hasTrailingPathSeparator(resource, sep = paths.sep) {
            if (resource.scheme === network_1.Schemas.file) {
                const fsp = originalFSPath(resource);
                return fsp.length > extpath.getRoot(fsp).length && fsp[fsp.length - 1] === sep;
            }
            else {
                const p = resource.path;
                return (p.length > 1 && p.charCodeAt(p.length - 1) === 47 /* Slash */) && !(/^[a-zA-Z]:(\/$|\\$)/.test(resource.fsPath)); // ignore the slash at offset 0
            }
        }
        removeTrailingPathSeparator(resource, sep = paths.sep) {
            // Make sure that the path isn't a drive letter. A trailing separator there is not removable.
            if ((0, exports.hasTrailingPathSeparator)(resource, sep)) {
                return resource.with({ path: resource.path.substr(0, resource.path.length - 1) });
            }
            return resource;
        }
        addTrailingPathSeparator(resource, sep = paths.sep) {
            let isRootSep = false;
            if (resource.scheme === network_1.Schemas.file) {
                const fsp = originalFSPath(resource);
                isRootSep = ((fsp !== undefined) && (fsp.length === extpath.getRoot(fsp).length) && (fsp[fsp.length - 1] === sep));
            }
            else {
                sep = '/';
                const p = resource.path;
                isRootSep = p.length === 1 && p.charCodeAt(p.length - 1) === 47 /* Slash */;
            }
            if (!isRootSep && !(0, exports.hasTrailingPathSeparator)(resource, sep)) {
                return resource.with({ path: resource.path + '/' });
            }
            return resource;
        }
    }
    exports.ExtUri = ExtUri;
    /**
     * Unbiased utility that takes uris "as they are". This means it can be interchanged with
     * uri#toString() usages. The following is true
     * ```
     * assertEqual(aUri.toString() === bUri.toString(), exturi.isEqual(aUri, bUri))
     * ```
     */
    exports.extUri = new ExtUri(() => false);
    /**
     * BIASED utility that _mostly_ ignored the case of urs paths. ONLY use this util if you
     * understand what you are doing.
     *
     * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
     *
     * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
     * because those uris come from a "trustworthy source". When creating unknown uris it's always
     * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
     * casing matters.
     */
    exports.extUriBiasedIgnorePathCase = new ExtUri(uri => {
        // A file scheme resource is in the same platform as code, so ignore case for non linux platforms
        // Resource can be from another platform. Lowering the case as an hack. Should come from File system provider
        return uri.scheme === network_1.Schemas.file ? !platform_1.isLinux : true;
    });
    /**
     * BIASED utility that always ignores the casing of uris paths. ONLY use this util if you
     * understand what you are doing.
     *
     * This utility is INCOMPATIBLE with `uri.toString()`-usages and both CANNOT be used interchanged.
     *
     * When dealing with uris from files or documents, `extUri` (the unbiased friend)is sufficient
     * because those uris come from a "trustworthy source". When creating unknown uris it's always
     * better to use `IUriIdentityService` which exposes an `IExtUri`-instance which knows when path
     * casing matters.
     */
    exports.extUriIgnorePathCase = new ExtUri(_ => true);
    exports.isEqual = exports.extUri.isEqual.bind(exports.extUri);
    exports.isEqualOrParent = exports.extUri.isEqualOrParent.bind(exports.extUri);
    exports.getComparisonKey = exports.extUri.getComparisonKey.bind(exports.extUri);
    exports.basenameOrAuthority = exports.extUri.basenameOrAuthority.bind(exports.extUri);
    exports.basename = exports.extUri.basename.bind(exports.extUri);
    exports.extname = exports.extUri.extname.bind(exports.extUri);
    exports.dirname = exports.extUri.dirname.bind(exports.extUri);
    exports.joinPath = exports.extUri.joinPath.bind(exports.extUri);
    exports.normalizePath = exports.extUri.normalizePath.bind(exports.extUri);
    exports.relativePath = exports.extUri.relativePath.bind(exports.extUri);
    exports.resolvePath = exports.extUri.resolvePath.bind(exports.extUri);
    exports.isAbsolutePath = exports.extUri.isAbsolutePath.bind(exports.extUri);
    exports.isEqualAuthority = exports.extUri.isEqualAuthority.bind(exports.extUri);
    exports.hasTrailingPathSeparator = exports.extUri.hasTrailingPathSeparator.bind(exports.extUri);
    exports.removeTrailingPathSeparator = exports.extUri.removeTrailingPathSeparator.bind(exports.extUri);
    exports.addTrailingPathSeparator = exports.extUri.addTrailingPathSeparator.bind(exports.extUri);
    //#endregion
    function distinctParents(items, resourceAccessor) {
        const distinctParents = [];
        for (let i = 0; i < items.length; i++) {
            const candidateResource = resourceAccessor(items[i]);
            if (items.some((otherItem, index) => {
                if (index === i) {
                    return false;
                }
                return (0, exports.isEqualOrParent)(candidateResource, resourceAccessor(otherItem));
            })) {
                continue;
            }
            distinctParents.push(items[i]);
        }
        return distinctParents;
    }
    exports.distinctParents = distinctParents;
    /**
     * Data URI related helpers.
     */
    var DataUri;
    (function (DataUri) {
        DataUri.META_DATA_LABEL = 'label';
        DataUri.META_DATA_DESCRIPTION = 'description';
        DataUri.META_DATA_SIZE = 'size';
        DataUri.META_DATA_MIME = 'mime';
        function parseMetaData(dataUri) {
            const metadata = new Map();
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the metadata is: size:2313;label:SomeLabel;description:SomeDescription
            const meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
            meta.split(';').forEach(property => {
                const [key, value] = property.split(':');
                if (key && value) {
                    metadata.set(key, value);
                }
            });
            // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
            // the mime is: image/png
            const mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));
            if (mime) {
                metadata.set(DataUri.META_DATA_MIME, mime);
            }
            return metadata;
        }
        DataUri.parseMetaData = parseMetaData;
    })(DataUri = exports.DataUri || (exports.DataUri = {}));
    function toLocalResource(resource, authority, localScheme) {
        if (authority) {
            let path = resource.path;
            if (path && path[0] !== paths.posix.sep) {
                path = paths.posix.sep + path;
            }
            return resource.with({ scheme: localScheme, authority, path });
        }
        return resource.with({ scheme: localScheme });
    }
    exports.toLocalResource = toLocalResource;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[36/*vs/base/common/async*/], __M([0/*require*/,1/*exports*/,29/*vs/base/common/cancellation*/,9/*vs/base/common/errors*/,6/*vs/base/common/event*/,4/*vs/base/common/lifecycle*/,15/*vs/base/common/linkedList*/,35/*vs/base/common/resources*/]), function (require, exports, cancellation_1, errors_1, event_1, lifecycle_1, linkedList_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Promises = exports.AsyncEmitter = exports.DeferredPromise = exports.IntervalCounter = exports.TaskSequentializer = exports.retry = exports.IdleValue = exports.runWhenIdle = exports.RunOnceWorker = exports.RunOnceScheduler = exports.IntervalTimer = exports.TimeoutTimer = exports.ResourceQueue = exports.Queue = exports.Limiter = exports.firstParallel = exports.first = exports.sequence = exports.ignoreErrors = exports.disposableTimeout = exports.timeout = exports.AutoOpenBarrier = exports.Barrier = exports.ThrottledDelayer = exports.Delayer = exports.SequencerByKey = exports.Sequencer = exports.Throttler = exports.asPromise = exports.raceTimeout = exports.raceCancellablePromises = exports.raceCancellation = exports.createCancelablePromise = exports.isThenable = void 0;
    function isThenable(obj) {
        return !!obj && typeof obj.then === 'function';
    }
    exports.isThenable = isThenable;
    function createCancelablePromise(callback) {
        const source = new cancellation_1.CancellationTokenSource();
        const thenable = callback(source.token);
        const promise = new Promise((resolve, reject) => {
            source.token.onCancellationRequested(() => {
                reject((0, errors_1.canceled)());
            });
            Promise.resolve(thenable).then(value => {
                source.dispose();
                resolve(value);
            }, err => {
                source.dispose();
                reject(err);
            });
        });
        return new class {
            cancel() {
                source.cancel();
            }
            then(resolve, reject) {
                return promise.then(resolve, reject);
            }
            catch(reject) {
                return this.then(undefined, reject);
            }
            finally(onfinally) {
                return promise.finally(onfinally);
            }
        };
    }
    exports.createCancelablePromise = createCancelablePromise;
    function raceCancellation(promise, token, defaultValue) {
        return Promise.race([promise, new Promise(resolve => token.onCancellationRequested(() => resolve(defaultValue)))]);
    }
    exports.raceCancellation = raceCancellation;
    /**
     * Returns as soon as one of the promises is resolved and cancels remaining promises
     */
    async function raceCancellablePromises(cancellablePromises) {
        let resolvedPromiseIndex = -1;
        const promises = cancellablePromises.map((promise, index) => promise.then(result => { resolvedPromiseIndex = index; return result; }));
        const result = await Promise.race(promises);
        cancellablePromises.forEach((cancellablePromise, index) => {
            if (index !== resolvedPromiseIndex) {
                cancellablePromise.cancel();
            }
        });
        return result;
    }
    exports.raceCancellablePromises = raceCancellablePromises;
    function raceTimeout(promise, timeout, onTimeout) {
        let promiseResolve = undefined;
        const timer = setTimeout(() => {
            promiseResolve === null || promiseResolve === void 0 ? void 0 : promiseResolve(undefined);
            onTimeout === null || onTimeout === void 0 ? void 0 : onTimeout();
        }, timeout);
        return Promise.race([
            promise.finally(() => clearTimeout(timer)),
            new Promise(resolve => promiseResolve = resolve)
        ]);
    }
    exports.raceTimeout = raceTimeout;
    function asPromise(callback) {
        return new Promise((resolve, reject) => {
            const item = callback();
            if (isThenable(item)) {
                item.then(resolve, reject);
            }
            else {
                resolve(item);
            }
        });
    }
    exports.asPromise = asPromise;
    /**
     * A helper to prevent accumulation of sequential async tasks.
     *
     * Imagine a mail man with the sole task of delivering letters. As soon as
     * a letter submitted for delivery, he drives to the destination, delivers it
     * and returns to his base. Imagine that during the trip, N more letters were submitted.
     * When the mail man returns, he picks those N letters and delivers them all in a
     * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
     *
     * The throttler implements this via the queue() method, by providing it a task
     * factory. Following the example:
     *
     * 		const throttler = new Throttler();
     * 		const letters = [];
     *
     * 		function deliver() {
     * 			const lettersToDeliver = letters;
     * 			letters = [];
     * 			return makeTheTrip(lettersToDeliver);
     * 		}
     *
     * 		function onLetterReceived(l) {
     * 			letters.push(l);
     * 			throttler.queue(deliver);
     * 		}
     */
    class Throttler {
        constructor() {
            this.activePromise = null;
            this.queuedPromise = null;
            this.queuedPromiseFactory = null;
        }
        queue(promiseFactory) {
            if (this.activePromise) {
                this.queuedPromiseFactory = promiseFactory;
                if (!this.queuedPromise) {
                    const onComplete = () => {
                        this.queuedPromise = null;
                        const result = this.queue(this.queuedPromiseFactory);
                        this.queuedPromiseFactory = null;
                        return result;
                    };
                    this.queuedPromise = new Promise(resolve => {
                        this.activePromise.then(onComplete, onComplete).then(resolve);
                    });
                }
                return new Promise((resolve, reject) => {
                    this.queuedPromise.then(resolve, reject);
                });
            }
            this.activePromise = promiseFactory();
            return new Promise((resolve, reject) => {
                this.activePromise.then((result) => {
                    this.activePromise = null;
                    resolve(result);
                }, (err) => {
                    this.activePromise = null;
                    reject(err);
                });
            });
        }
    }
    exports.Throttler = Throttler;
    class Sequencer {
        constructor() {
            this.current = Promise.resolve(null);
        }
        queue(promiseTask) {
            return this.current = this.current.then(() => promiseTask(), () => promiseTask());
        }
    }
    exports.Sequencer = Sequencer;
    class SequencerByKey {
        constructor() {
            this.promiseMap = new Map();
        }
        queue(key, promiseTask) {
            var _a;
            const runningPromise = (_a = this.promiseMap.get(key)) !== null && _a !== void 0 ? _a : Promise.resolve();
            const newPromise = runningPromise
                .catch(() => { })
                .then(promiseTask)
                .finally(() => {
                if (this.promiseMap.get(key) === newPromise) {
                    this.promiseMap.delete(key);
                }
            });
            this.promiseMap.set(key, newPromise);
            return newPromise;
        }
    }
    exports.SequencerByKey = SequencerByKey;
    /**
     * A helper to delay (debounce) execution of a task that is being requested often.
     *
     * Following the throttler, now imagine the mail man wants to optimize the number of
     * trips proactively. The trip itself can be long, so he decides not to make the trip
     * as soon as a letter is submitted. Instead he waits a while, in case more
     * letters are submitted. After said waiting period, if no letters were submitted, he
     * decides to make the trip. Imagine that N more letters were submitted after the first
     * one, all within a short period of time between each other. Even though N+1
     * submissions occurred, only 1 delivery was made.
     *
     * The delayer offers this behavior via the trigger() method, into which both the task
     * to be executed and the waiting period (delay) must be passed in as arguments. Following
     * the example:
     *
     * 		const delayer = new Delayer(WAITING_PERIOD);
     * 		const letters = [];
     *
     * 		function letterReceived(l) {
     * 			letters.push(l);
     * 			delayer.trigger(() => { return makeTheTrip(); });
     * 		}
     */
    class Delayer {
        constructor(defaultDelay) {
            this.defaultDelay = defaultDelay;
            this.timeout = null;
            this.completionPromise = null;
            this.doResolve = null;
            this.doReject = null;
            this.task = null;
        }
        trigger(task, delay = this.defaultDelay) {
            this.task = task;
            this.cancelTimeout();
            if (!this.completionPromise) {
                this.completionPromise = new Promise((resolve, reject) => {
                    this.doResolve = resolve;
                    this.doReject = reject;
                }).then(() => {
                    this.completionPromise = null;
                    this.doResolve = null;
                    if (this.task) {
                        const task = this.task;
                        this.task = null;
                        return task();
                    }
                    return undefined;
                });
            }
            this.timeout = setTimeout(() => {
                this.timeout = null;
                if (this.doResolve) {
                    this.doResolve(null);
                }
            }, delay);
            return this.completionPromise;
        }
        isTriggered() {
            return this.timeout !== null;
        }
        cancel() {
            this.cancelTimeout();
            if (this.completionPromise) {
                if (this.doReject) {
                    this.doReject((0, errors_1.canceled)());
                }
                this.completionPromise = null;
            }
        }
        cancelTimeout() {
            if (this.timeout !== null) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }
        dispose() {
            this.cancelTimeout();
        }
    }
    exports.Delayer = Delayer;
    /**
     * A helper to delay execution of a task that is being requested often, while
     * preventing accumulation of consecutive executions, while the task runs.
     *
     * The mail man is clever and waits for a certain amount of time, before going
     * out to deliver letters. While the mail man is going out, more letters arrive
     * and can only be delivered once he is back. Once he is back the mail man will
     * do one more trip to deliver the letters that have accumulated while he was out.
     */
    class ThrottledDelayer {
        constructor(defaultDelay) {
            this.delayer = new Delayer(defaultDelay);
            this.throttler = new Throttler();
        }
        trigger(promiseFactory, delay) {
            return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
        }
        isTriggered() {
            return this.delayer.isTriggered();
        }
        cancel() {
            this.delayer.cancel();
        }
        dispose() {
            this.delayer.dispose();
        }
    }
    exports.ThrottledDelayer = ThrottledDelayer;
    /**
     * A barrier that is initially closed and then becomes opened permanently.
     */
    class Barrier {
        constructor() {
            this._isOpen = false;
            this._promise = new Promise((c, e) => {
                this._completePromise = c;
            });
        }
        isOpen() {
            return this._isOpen;
        }
        open() {
            this._isOpen = true;
            this._completePromise(true);
        }
        wait() {
            return this._promise;
        }
    }
    exports.Barrier = Barrier;
    /**
     * A barrier that is initially closed and then becomes opened permanently after a certain period of
     * time or when open is called explicitly
     */
    class AutoOpenBarrier extends Barrier {
        constructor(autoOpenTimeMs) {
            super();
            this._timeout = setTimeout(() => this.open(), autoOpenTimeMs);
        }
        open() {
            clearTimeout(this._timeout);
            super.open();
        }
    }
    exports.AutoOpenBarrier = AutoOpenBarrier;
    function timeout(millis, token) {
        if (!token) {
            return createCancelablePromise(token => timeout(millis, token));
        }
        return new Promise((resolve, reject) => {
            const handle = setTimeout(resolve, millis);
            token.onCancellationRequested(() => {
                clearTimeout(handle);
                reject((0, errors_1.canceled)());
            });
        });
    }
    exports.timeout = timeout;
    function disposableTimeout(handler, timeout = 0) {
        const timer = setTimeout(handler, timeout);
        return (0, lifecycle_1.toDisposable)(() => clearTimeout(timer));
    }
    exports.disposableTimeout = disposableTimeout;
    function ignoreErrors(promise) {
        return promise.then(undefined, _ => undefined);
    }
    exports.ignoreErrors = ignoreErrors;
    /**
     * Runs the provided list of promise factories in sequential order. The returned
     * promise will complete to an array of results from each promise.
     */
    function sequence(promiseFactories) {
        const results = [];
        let index = 0;
        const len = promiseFactories.length;
        function next() {
            return index < len ? promiseFactories[index++]() : null;
        }
        function thenHandler(result) {
            if (result !== undefined && result !== null) {
                results.push(result);
            }
            const n = next();
            if (n) {
                return n.then(thenHandler);
            }
            return Promise.resolve(results);
        }
        return Promise.resolve(null).then(thenHandler);
    }
    exports.sequence = sequence;
    function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
        let index = 0;
        const len = promiseFactories.length;
        const loop = () => {
            if (index >= len) {
                return Promise.resolve(defaultValue);
            }
            const factory = promiseFactories[index++];
            const promise = Promise.resolve(factory());
            return promise.then(result => {
                if (shouldStop(result)) {
                    return Promise.resolve(result);
                }
                return loop();
            });
        };
        return loop();
    }
    exports.first = first;
    function firstParallel(promiseList, shouldStop = t => !!t, defaultValue = null) {
        if (promiseList.length === 0) {
            return Promise.resolve(defaultValue);
        }
        let todo = promiseList.length;
        const finish = () => {
            var _a, _b;
            todo = -1;
            for (const promise of promiseList) {
                (_b = (_a = promise).cancel) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
        };
        return new Promise((resolve, reject) => {
            for (const promise of promiseList) {
                promise.then(result => {
                    if (--todo >= 0 && shouldStop(result)) {
                        finish();
                        resolve(result);
                    }
                    else if (todo === 0) {
                        resolve(defaultValue);
                    }
                })
                    .catch(err => {
                    if (--todo >= 0) {
                        finish();
                        reject(err);
                    }
                });
            }
        });
    }
    exports.firstParallel = firstParallel;
    /**
     * A helper to queue N promises and run them all with a max degree of parallelism. The helper
     * ensures that at any time no more than M promises are running at the same time.
     */
    class Limiter {
        constructor(maxDegreeOfParalellism) {
            this._size = 0;
            this.maxDegreeOfParalellism = maxDegreeOfParalellism;
            this.outstandingPromises = [];
            this.runningPromises = 0;
            this._onFinished = new event_1.Emitter();
        }
        get onFinished() {
            return this._onFinished.event;
        }
        get size() {
            return this._size;
            // return this.runningPromises + this.outstandingPromises.length;
        }
        queue(factory) {
            this._size++;
            return new Promise((c, e) => {
                this.outstandingPromises.push({ factory, c, e });
                this.consume();
            });
        }
        consume() {
            while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
                const iLimitedTask = this.outstandingPromises.shift();
                this.runningPromises++;
                const promise = iLimitedTask.factory();
                promise.then(iLimitedTask.c, iLimitedTask.e);
                promise.then(() => this.consumed(), () => this.consumed());
            }
        }
        consumed() {
            this._size--;
            this.runningPromises--;
            if (this.outstandingPromises.length > 0) {
                this.consume();
            }
            else {
                this._onFinished.fire();
            }
        }
        dispose() {
            this._onFinished.dispose();
        }
    }
    exports.Limiter = Limiter;
    /**
     * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
     */
    class Queue extends Limiter {
        constructor() {
            super(1);
        }
    }
    exports.Queue = Queue;
    /**
     * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
     * by disposing them once the queue is empty.
     */
    class ResourceQueue {
        constructor() {
            this.queues = new Map();
        }
        queueFor(resource, extUri = resources_1.extUri) {
            const key = extUri.getComparisonKey(resource);
            let queue = this.queues.get(key);
            if (!queue) {
                queue = new Queue();
                event_1.Event.once(queue.onFinished)(() => {
                    queue === null || queue === void 0 ? void 0 : queue.dispose();
                    this.queues.delete(key);
                });
                this.queues.set(key, queue);
            }
            return queue;
        }
        dispose() {
            this.queues.forEach(queue => queue.dispose());
            this.queues.clear();
        }
    }
    exports.ResourceQueue = ResourceQueue;
    class TimeoutTimer {
        constructor(runner, timeout) {
            this._token = -1;
            if (typeof runner === 'function' && typeof timeout === 'number') {
                this.setIfNotSet(runner, timeout);
            }
        }
        dispose() {
            this.cancel();
        }
        cancel() {
            if (this._token !== -1) {
                clearTimeout(this._token);
                this._token = -1;
            }
        }
        cancelAndSet(runner, timeout) {
            this.cancel();
            this._token = setTimeout(() => {
                this._token = -1;
                runner();
            }, timeout);
        }
        setIfNotSet(runner, timeout) {
            if (this._token !== -1) {
                // timer is already set
                return;
            }
            this._token = setTimeout(() => {
                this._token = -1;
                runner();
            }, timeout);
        }
    }
    exports.TimeoutTimer = TimeoutTimer;
    class IntervalTimer {
        constructor() {
            this._token = -1;
        }
        dispose() {
            this.cancel();
        }
        cancel() {
            if (this._token !== -1) {
                clearInterval(this._token);
                this._token = -1;
            }
        }
        cancelAndSet(runner, interval) {
            this.cancel();
            this._token = setInterval(() => {
                runner();
            }, interval);
        }
    }
    exports.IntervalTimer = IntervalTimer;
    class RunOnceScheduler {
        constructor(runner, delay) {
            this.timeoutToken = -1;
            this.runner = runner;
            this.timeout = delay;
            this.timeoutHandler = this.onTimeout.bind(this);
        }
        /**
         * Dispose RunOnceScheduler
         */
        dispose() {
            this.cancel();
            this.runner = null;
        }
        /**
         * Cancel current scheduled runner (if any).
         */
        cancel() {
            if (this.isScheduled()) {
                clearTimeout(this.timeoutToken);
                this.timeoutToken = -1;
            }
        }
        /**
         * Cancel previous runner (if any) & schedule a new runner.
         */
        schedule(delay = this.timeout) {
            this.cancel();
            this.timeoutToken = setTimeout(this.timeoutHandler, delay);
        }
        get delay() {
            return this.timeout;
        }
        set delay(value) {
            this.timeout = value;
        }
        /**
         * Returns true if scheduled.
         */
        isScheduled() {
            return this.timeoutToken !== -1;
        }
        onTimeout() {
            this.timeoutToken = -1;
            if (this.runner) {
                this.doRun();
            }
        }
        doRun() {
            if (this.runner) {
                this.runner();
            }
        }
    }
    exports.RunOnceScheduler = RunOnceScheduler;
    class RunOnceWorker extends RunOnceScheduler {
        constructor(runner, timeout) {
            super(runner, timeout);
            this.units = [];
        }
        work(unit) {
            this.units.push(unit);
            if (!this.isScheduled()) {
                this.schedule();
            }
        }
        doRun() {
            const units = this.units;
            this.units = [];
            if (this.runner) {
                this.runner(units);
            }
        }
        dispose() {
            this.units = [];
            super.dispose();
        }
    }
    exports.RunOnceWorker = RunOnceWorker;
    (function () {
        if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
            const dummyIdle = Object.freeze({
                didTimeout: true,
                timeRemaining() { return 15; }
            });
            exports.runWhenIdle = (runner) => {
                const handle = setTimeout(() => runner(dummyIdle));
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                        clearTimeout(handle);
                    }
                };
            };
        }
        else {
            exports.runWhenIdle = (runner, timeout) => {
                const handle = requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
                let disposed = false;
                return {
                    dispose() {
                        if (disposed) {
                            return;
                        }
                        disposed = true;
                        cancelIdleCallback(handle);
                    }
                };
            };
        }
    })();
    /**
     * An implementation of the "idle-until-urgent"-strategy as introduced
     * here: https://philipwalton.com/articles/idle-until-urgent/
     */
    class IdleValue {
        constructor(executor) {
            this._didRun = false;
            this._executor = () => {
                try {
                    this._value = executor();
                }
                catch (err) {
                    this._error = err;
                }
                finally {
                    this._didRun = true;
                }
            };
            this._handle = (0, exports.runWhenIdle)(() => this._executor());
        }
        dispose() {
            this._handle.dispose();
        }
        get value() {
            if (!this._didRun) {
                this._handle.dispose();
                this._executor();
            }
            if (this._error) {
                throw this._error;
            }
            return this._value;
        }
    }
    exports.IdleValue = IdleValue;
    //#endregion
    async function retry(task, delay, retries) {
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                return await task();
            }
            catch (error) {
                lastError = error;
                await timeout(delay);
            }
        }
        throw lastError;
    }
    exports.retry = retry;
    class TaskSequentializer {
        hasPending(taskId) {
            if (!this._pending) {
                return false;
            }
            if (typeof taskId === 'number') {
                return this._pending.taskId === taskId;
            }
            return !!this._pending;
        }
        get pending() {
            return this._pending ? this._pending.promise : undefined;
        }
        cancelPending() {
            var _a;
            (_a = this._pending) === null || _a === void 0 ? void 0 : _a.cancel();
        }
        setPending(taskId, promise, onCancel) {
            this._pending = { taskId, cancel: () => onCancel === null || onCancel === void 0 ? void 0 : onCancel(), promise };
            promise.then(() => this.donePending(taskId), () => this.donePending(taskId));
            return promise;
        }
        donePending(taskId) {
            if (this._pending && taskId === this._pending.taskId) {
                // only set pending to done if the promise finished that is associated with that taskId
                this._pending = undefined;
                // schedule the next task now that we are free if we have any
                this.triggerNext();
            }
        }
        triggerNext() {
            if (this._next) {
                const next = this._next;
                this._next = undefined;
                // Run next task and complete on the associated promise
                next.run().then(next.promiseResolve, next.promiseReject);
            }
        }
        setNext(run) {
            // this is our first next task, so we create associated promise with it
            // so that we can return a promise that completes when the task has
            // completed.
            if (!this._next) {
                let promiseResolve;
                let promiseReject;
                const promise = new Promise((resolve, reject) => {
                    promiseResolve = resolve;
                    promiseReject = reject;
                });
                this._next = {
                    run,
                    promise,
                    promiseResolve: promiseResolve,
                    promiseReject: promiseReject
                };
            }
            // we have a previous next task, just overwrite it
            else {
                this._next.run = run;
            }
            return this._next.promise;
        }
    }
    exports.TaskSequentializer = TaskSequentializer;
    //#endregion
    //#region
    /**
     * The `IntervalCounter` allows to count the number
     * of calls to `increment()` over a duration of
     * `interval`. This utility can be used to conditionally
     * throttle a frequent task when a certain threshold
     * is reached.
     */
    class IntervalCounter {
        constructor(interval) {
            this.interval = interval;
            this.lastIncrementTime = 0;
            this.value = 0;
        }
        increment() {
            const now = Date.now();
            // We are outside of the range of `interval` and as such
            // start counting from 0 and remember the time
            if (now - this.lastIncrementTime > this.interval) {
                this.lastIncrementTime = now;
                this.value = 0;
            }
            this.value++;
            return this.value;
        }
    }
    exports.IntervalCounter = IntervalCounter;
    /**
     * Creates a promise whose resolution or rejection can be controlled imperatively.
     */
    class DeferredPromise {
        constructor() {
            this.rejected = false;
            this.resolved = false;
            this.p = new Promise((c, e) => {
                this.completeCallback = c;
                this.errorCallback = e;
            });
        }
        get isRejected() {
            return this.rejected;
        }
        get isResolved() {
            return this.resolved;
        }
        get isSettled() {
            return this.rejected || this.resolved;
        }
        complete(value) {
            return new Promise(resolve => {
                this.completeCallback(value);
                this.resolved = true;
                resolve();
            });
        }
        error(err) {
            return new Promise(resolve => {
                this.errorCallback(err);
                this.rejected = true;
                resolve();
            });
        }
        cancel() {
            new Promise(resolve => {
                this.errorCallback((0, errors_1.canceled)());
                this.rejected = true;
                resolve();
            });
        }
    }
    exports.DeferredPromise = DeferredPromise;
    class AsyncEmitter extends event_1.Emitter {
        async fireAsync(data, token, promiseJoin) {
            if (!this._listeners) {
                return;
            }
            if (!this._asyncDeliveryQueue) {
                this._asyncDeliveryQueue = new linkedList_1.LinkedList();
            }
            for (const listener of this._listeners) {
                this._asyncDeliveryQueue.push([listener, data]);
            }
            while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
                const [listener, data] = this._asyncDeliveryQueue.shift();
                const thenables = [];
                const event = Object.assign(Object.assign({}, data), { waitUntil: (p) => {
                        if (Object.isFrozen(thenables)) {
                            throw new Error('waitUntil can NOT be called asynchronous');
                        }
                        if (promiseJoin) {
                            p = promiseJoin(p, typeof listener === 'function' ? listener : listener[0]);
                        }
                        thenables.push(p);
                    } });
                try {
                    if (typeof listener === 'function') {
                        listener.call(undefined, event);
                    }
                    else {
                        listener[0].call(listener[1], event);
                    }
                }
                catch (e) {
                    (0, errors_1.onUnexpectedError)(e);
                    continue;
                }
                // freeze thenables-collection to enforce sync-calls to
                // wait until and then wait for all thenables to resolve
                Object.freeze(thenables);
                await Promises.settled(thenables).catch(e => (0, errors_1.onUnexpectedError)(e));
            }
        }
    }
    exports.AsyncEmitter = AsyncEmitter;
    //#endregion
    //#region Promises
    var Promises;
    (function (Promises) {
        /**
         * A polyfill of `Promise.allSettled`: returns after all promises have
         * resolved or rejected and provides access to each result or error
         * in the order of the original passed in promises array.
         * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
         */
        async function allSettled(promises) {
            if (typeof Promise.allSettled === 'function') {
                return allSettledNative(promises); // in some environments we can benefit from native implementation
            }
            return allSettledShim(promises);
        }
        Promises.allSettled = allSettled;
        async function allSettledNative(promises) {
            return Promise.allSettled(promises);
        }
        async function allSettledShim(promises) {
            return Promise.all(promises.map(promise => (promise.then(value => {
                const fulfilled = { status: 'fulfilled', value };
                return fulfilled;
            }, error => {
                const rejected = { status: 'rejected', reason: error };
                return rejected;
            }))));
        }
        /**
         * A drop-in replacement for `Promise.all` with the only difference
         * that the method awaits every promise to either fulfill or reject.
         *
         * Similar to `Promise.all`, only the first error will be returned
         * if any.
         */
        async function settled(promises) {
            let firstError = undefined;
            const result = await Promise.all(promises.map(promise => promise.then(value => value, error => {
                if (!firstError) {
                    firstError = error;
                }
                return undefined; // do not rethrow so that other promises can settle
            })));
            if (typeof firstError !== 'undefined') {
                throw firstError;
            }
            return result; // cast is needed and protected by the `throw` above
        }
        Promises.settled = settled;
    })(Promises = exports.Promises || (exports.Promises = {}));
});
//#endregion

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[19/*vs/base/common/glob*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/strings*/,16/*vs/base/common/extpath*/,5/*vs/base/common/path*/,17/*vs/base/common/map*/,36/*vs/base/common/async*/]), function (require, exports, strings, extpath, paths, map_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPathTerms = exports.getBasenameTerms = exports.isRelativePattern = exports.hasSiblingFn = exports.hasSiblingPromiseFn = exports.parse = exports.match = exports.splitGlobAware = exports.getEmptyExpression = void 0;
    function getEmptyExpression() {
        return Object.create(null);
    }
    exports.getEmptyExpression = getEmptyExpression;
    const GLOBSTAR = '**';
    const GLOB_SPLIT = '/';
    const PATH_REGEX = '[/\\\\]'; // any slash or backslash
    const NO_PATH_REGEX = '[^/\\\\]'; // any non-slash and non-backslash
    const ALL_FORWARD_SLASHES = /\//g;
    function starsToRegExp(starCount) {
        switch (starCount) {
            case 0:
                return '';
            case 1:
                return `${NO_PATH_REGEX}*?`; // 1 star matches any number of characters except path separator (/ and \) - non greedy (?)
            default:
                // Matches:  (Path Sep OR Path Val followed by Path Sep OR Path Sep followed by Path Val) 0-many times
                // Group is non capturing because we don't need to capture at all (?:...)
                // Overall we use non-greedy matching because it could be that we match too much
                return `(?:${PATH_REGEX}|${NO_PATH_REGEX}+${PATH_REGEX}|${PATH_REGEX}${NO_PATH_REGEX}+)*?`;
        }
    }
    function splitGlobAware(pattern, splitChar) {
        if (!pattern) {
            return [];
        }
        const segments = [];
        let inBraces = false;
        let inBrackets = false;
        let curVal = '';
        for (const char of pattern) {
            switch (char) {
                case splitChar:
                    if (!inBraces && !inBrackets) {
                        segments.push(curVal);
                        curVal = '';
                        continue;
                    }
                    break;
                case '{':
                    inBraces = true;
                    break;
                case '}':
                    inBraces = false;
                    break;
                case '[':
                    inBrackets = true;
                    break;
                case ']':
                    inBrackets = false;
                    break;
            }
            curVal += char;
        }
        // Tail
        if (curVal) {
            segments.push(curVal);
        }
        return segments;
    }
    exports.splitGlobAware = splitGlobAware;
    function parseRegExp(pattern) {
        if (!pattern) {
            return '';
        }
        let regEx = '';
        // Split up into segments for each slash found
        const segments = splitGlobAware(pattern, GLOB_SPLIT);
        // Special case where we only have globstars
        if (segments.every(s => s === GLOBSTAR)) {
            regEx = '.*';
        }
        // Build regex over segments
        else {
            let previousSegmentWasGlobStar = false;
            segments.forEach((segment, index) => {
                // Globstar is special
                if (segment === GLOBSTAR) {
                    // if we have more than one globstar after another, just ignore it
                    if (!previousSegmentWasGlobStar) {
                        regEx += starsToRegExp(2);
                        previousSegmentWasGlobStar = true;
                    }
                    return;
                }
                // States
                let inBraces = false;
                let braceVal = '';
                let inBrackets = false;
                let bracketVal = '';
                for (const char of segment) {
                    // Support brace expansion
                    if (char !== '}' && inBraces) {
                        braceVal += char;
                        continue;
                    }
                    // Support brackets
                    if (inBrackets && (char !== ']' || !bracketVal) /* ] is literally only allowed as first character in brackets to match it */) {
                        let res;
                        // range operator
                        if (char === '-') {
                            res = char;
                        }
                        // negation operator (only valid on first index in bracket)
                        else if ((char === '^' || char === '!') && !bracketVal) {
                            res = '^';
                        }
                        // glob split matching is not allowed within character ranges
                        // see http://man7.org/linux/man-pages/man7/glob.7.html
                        else if (char === GLOB_SPLIT) {
                            res = '';
                        }
                        // anything else gets escaped
                        else {
                            res = strings.escapeRegExpCharacters(char);
                        }
                        bracketVal += res;
                        continue;
                    }
                    switch (char) {
                        case '{':
                            inBraces = true;
                            continue;
                        case '[':
                            inBrackets = true;
                            continue;
                        case '}':
                            const choices = splitGlobAware(braceVal, ',');
                            // Converts {foo,bar} => [foo|bar]
                            const braceRegExp = `(?:${choices.map(c => parseRegExp(c)).join('|')})`;
                            regEx += braceRegExp;
                            inBraces = false;
                            braceVal = '';
                            break;
                        case ']':
                            regEx += ('[' + bracketVal + ']');
                            inBrackets = false;
                            bracketVal = '';
                            break;
                        case '?':
                            regEx += NO_PATH_REGEX; // 1 ? matches any single character except path separator (/ and \)
                            continue;
                        case '*':
                            regEx += starsToRegExp(1);
                            continue;
                        default:
                            regEx += strings.escapeRegExpCharacters(char);
                    }
                }
                // Tail: Add the slash we had split on if there is more to come and the remaining pattern is not a globstar
                // For example if pattern: some/**/*.js we want the "/" after some to be included in the RegEx to prevent
                // a folder called "something" to match as well.
                // However, if pattern: some/**, we tolerate that we also match on "something" because our globstar behaviour
                // is to match 0-N segments.
                if (index < segments.length - 1 && (segments[index + 1] !== GLOBSTAR || index + 2 < segments.length)) {
                    regEx += PATH_REGEX;
                }
                // reset state
                previousSegmentWasGlobStar = false;
            });
        }
        return regEx;
    }
    // regexes to check for trival glob patterns that just check for String#endsWith
    const T1 = /^\*\*\/\*\.[\w\.-]+$/; // **/*.something
    const T2 = /^\*\*\/([\w\.-]+)\/?$/; // **/something
    const T3 = /^{\*\*\/[\*\.]?[\w\.-]+\/?(,\*\*\/[\*\.]?[\w\.-]+\/?)*}$/; // {**/*.something,**/*.else} or {**/package.json,**/project.json}
    const T3_2 = /^{\*\*\/[\*\.]?[\w\.-]+(\/(\*\*)?)?(,\*\*\/[\*\.]?[\w\.-]+(\/(\*\*)?)?)*}$/; // Like T3, with optional trailing /**
    const T4 = /^\*\*((\/[\w\.-]+)+)\/?$/; // **/something/else
    const T5 = /^([\w\.-]+(\/[\w\.-]+)*)\/?$/; // something/else
    const CACHE = new map_1.LRUCache(10000); // bounded to 10000 elements
    const FALSE = function () {
        return false;
    };
    const NULL = function () {
        return null;
    };
    function parsePattern(arg1, options) {
        if (!arg1) {
            return NULL;
        }
        // Handle IRelativePattern
        let pattern;
        if (typeof arg1 !== 'string') {
            pattern = arg1.pattern;
        }
        else {
            pattern = arg1;
        }
        // Whitespace trimming
        pattern = pattern.trim();
        // Check cache
        const patternKey = `${pattern}_${!!options.trimForExclusions}`;
        let parsedPattern = CACHE.get(patternKey);
        if (parsedPattern) {
            return wrapRelativePattern(parsedPattern, arg1);
        }
        // Check for Trivias
        let match;
        if (T1.test(pattern)) { // common pattern: **/*.txt just need endsWith check
            const base = pattern.substr(4); // '**/*'.length === 4
            parsedPattern = function (path, basename) {
                return typeof path === 'string' && path.endsWith(base) ? pattern : null;
            };
        }
        else if (match = T2.exec(trimForExclusions(pattern, options))) { // common pattern: **/some.txt just need basename check
            parsedPattern = trivia2(match[1], pattern);
        }
        else if ((options.trimForExclusions ? T3_2 : T3).test(pattern)) { // repetition of common patterns (see above) {**/*.txt,**/*.png}
            parsedPattern = trivia3(pattern, options);
        }
        else if (match = T4.exec(trimForExclusions(pattern, options))) { // common pattern: **/something/else just need endsWith check
            parsedPattern = trivia4and5(match[1].substr(1), pattern, true);
        }
        else if (match = T5.exec(trimForExclusions(pattern, options))) { // common pattern: something/else just need equals check
            parsedPattern = trivia4and5(match[1], pattern, false);
        }
        // Otherwise convert to pattern
        else {
            parsedPattern = toRegExp(pattern);
        }
        // Cache
        CACHE.set(patternKey, parsedPattern);
        return wrapRelativePattern(parsedPattern, arg1);
    }
    function wrapRelativePattern(parsedPattern, arg2) {
        if (typeof arg2 === 'string') {
            return parsedPattern;
        }
        return function (path, basename) {
            if (!extpath.isEqualOrParent(path, arg2.base)) {
                return null;
            }
            return parsedPattern(paths.relative(arg2.base, path), basename);
        };
    }
    function trimForExclusions(pattern, options) {
        return options.trimForExclusions && pattern.endsWith('/**') ? pattern.substr(0, pattern.length - 2) : pattern; // dropping **, tailing / is dropped later
    }
    // common pattern: **/some.txt just need basename check
    function trivia2(base, originalPattern) {
        const slashBase = `/${base}`;
        const backslashBase = `\\${base}`;
        const parsedPattern = function (path, basename) {
            if (typeof path !== 'string') {
                return null;
            }
            if (basename) {
                return basename === base ? originalPattern : null;
            }
            return path === base || path.endsWith(slashBase) || path.endsWith(backslashBase) ? originalPattern : null;
        };
        const basenames = [base];
        parsedPattern.basenames = basenames;
        parsedPattern.patterns = [originalPattern];
        parsedPattern.allBasenames = basenames;
        return parsedPattern;
    }
    // repetition of common patterns (see above) {**/*.txt,**/*.png}
    function trivia3(pattern, options) {
        const parsedPatterns = aggregateBasenameMatches(pattern.slice(1, -1).split(',')
            .map(pattern => parsePattern(pattern, options))
            .filter(pattern => pattern !== NULL), pattern);
        const n = parsedPatterns.length;
        if (!n) {
            return NULL;
        }
        if (n === 1) {
            return parsedPatterns[0];
        }
        const parsedPattern = function (path, basename) {
            for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                if (parsedPatterns[i](path, basename)) {
                    return pattern;
                }
            }
            return null;
        };
        const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
        if (withBasenames) {
            parsedPattern.allBasenames = withBasenames.allBasenames;
        }
        const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
        if (allPaths.length) {
            parsedPattern.allPaths = allPaths;
        }
        return parsedPattern;
    }
    // common patterns: **/something/else just need endsWith check, something/else just needs and equals check
    function trivia4and5(targetPath, pattern, matchPathEnds) {
        const usingPosixSep = paths.sep === paths.posix.sep;
        const nativePath = usingPosixSep ? targetPath : targetPath.replace(ALL_FORWARD_SLASHES, paths.sep);
        const nativePathEnd = paths.sep + nativePath;
        const targetPathEnd = paths.posix.sep + targetPath;
        const parsedPattern = matchPathEnds ? function (testPath, basename) {
            return typeof testPath === 'string' &&
                ((testPath === nativePath || testPath.endsWith(nativePathEnd))
                    || !usingPosixSep && (testPath === targetPath || testPath.endsWith(targetPathEnd)))
                ? pattern : null;
        } : function (testPath, basename) {
            return typeof testPath === 'string' &&
                (testPath === nativePath
                    || (!usingPosixSep && testPath === targetPath))
                ? pattern : null;
        };
        parsedPattern.allPaths = [(matchPathEnds ? '*/' : './') + targetPath];
        return parsedPattern;
    }
    function toRegExp(pattern) {
        try {
            const regExp = new RegExp(`^${parseRegExp(pattern)}$`);
            return function (path) {
                regExp.lastIndex = 0; // reset RegExp to its initial state to reuse it!
                return typeof path === 'string' && regExp.test(path) ? pattern : null;
            };
        }
        catch (error) {
            return NULL;
        }
    }
    function match(arg1, path, hasSibling) {
        if (!arg1 || typeof path !== 'string') {
            return false;
        }
        return parse(arg1)(path, undefined, hasSibling);
    }
    exports.match = match;
    function parse(arg1, options = {}) {
        if (!arg1) {
            return FALSE;
        }
        // Glob with String
        if (typeof arg1 === 'string' || isRelativePattern(arg1)) {
            const parsedPattern = parsePattern(arg1, options);
            if (parsedPattern === NULL) {
                return FALSE;
            }
            const resultPattern = function (path, basename) {
                return !!parsedPattern(path, basename);
            };
            if (parsedPattern.allBasenames) {
                resultPattern.allBasenames = parsedPattern.allBasenames;
            }
            if (parsedPattern.allPaths) {
                resultPattern.allPaths = parsedPattern.allPaths;
            }
            return resultPattern;
        }
        // Glob with Expression
        return parsedExpression(arg1, options);
    }
    exports.parse = parse;
    function hasSiblingPromiseFn(siblingsFn) {
        if (!siblingsFn) {
            return undefined;
        }
        let siblings;
        return (name) => {
            if (!siblings) {
                siblings = (siblingsFn() || Promise.resolve([]))
                    .then(list => list ? listToMap(list) : {});
            }
            return siblings.then(map => !!map[name]);
        };
    }
    exports.hasSiblingPromiseFn = hasSiblingPromiseFn;
    function hasSiblingFn(siblingsFn) {
        if (!siblingsFn) {
            return undefined;
        }
        let siblings;
        return (name) => {
            if (!siblings) {
                const list = siblingsFn();
                siblings = list ? listToMap(list) : {};
            }
            return !!siblings[name];
        };
    }
    exports.hasSiblingFn = hasSiblingFn;
    function listToMap(list) {
        const map = {};
        for (const key of list) {
            map[key] = true;
        }
        return map;
    }
    function isRelativePattern(obj) {
        const rp = obj;
        return rp && typeof rp.base === 'string' && typeof rp.pattern === 'string';
    }
    exports.isRelativePattern = isRelativePattern;
    function getBasenameTerms(patternOrExpression) {
        return patternOrExpression.allBasenames || [];
    }
    exports.getBasenameTerms = getBasenameTerms;
    function getPathTerms(patternOrExpression) {
        return patternOrExpression.allPaths || [];
    }
    exports.getPathTerms = getPathTerms;
    function parsedExpression(expression, options) {
        const parsedPatterns = aggregateBasenameMatches(Object.getOwnPropertyNames(expression)
            .map(pattern => parseExpressionPattern(pattern, expression[pattern], options))
            .filter(pattern => pattern !== NULL));
        const n = parsedPatterns.length;
        if (!n) {
            return NULL;
        }
        if (!parsedPatterns.some(parsedPattern => !!parsedPattern.requiresSiblings)) {
            if (n === 1) {
                return parsedPatterns[0];
            }
            const resultExpression = function (path, basename) {
                for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                    // Pattern matches path
                    const result = parsedPatterns[i](path, basename);
                    if (result) {
                        return result;
                    }
                }
                return null;
            };
            const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
            if (withBasenames) {
                resultExpression.allBasenames = withBasenames.allBasenames;
            }
            const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
            if (allPaths.length) {
                resultExpression.allPaths = allPaths;
            }
            return resultExpression;
        }
        const resultExpression = function (path, basename, hasSibling) {
            let name = undefined;
            for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                // Pattern matches path
                const parsedPattern = parsedPatterns[i];
                if (parsedPattern.requiresSiblings && hasSibling) {
                    if (!basename) {
                        basename = paths.basename(path);
                    }
                    if (!name) {
                        name = basename.substr(0, basename.length - paths.extname(path).length);
                    }
                }
                const result = parsedPattern(path, basename, name, hasSibling);
                if (result) {
                    return result;
                }
            }
            return null;
        };
        const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
        if (withBasenames) {
            resultExpression.allBasenames = withBasenames.allBasenames;
        }
        const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
        if (allPaths.length) {
            resultExpression.allPaths = allPaths;
        }
        return resultExpression;
    }
    function parseExpressionPattern(pattern, value, options) {
        if (value === false) {
            return NULL; // pattern is disabled
        }
        const parsedPattern = parsePattern(pattern, options);
        if (parsedPattern === NULL) {
            return NULL;
        }
        // Expression Pattern is <boolean>
        if (typeof value === 'boolean') {
            return parsedPattern;
        }
        // Expression Pattern is <SiblingClause>
        if (value) {
            const when = value.when;
            if (typeof when === 'string') {
                const result = (path, basename, name, hasSibling) => {
                    if (!hasSibling || !parsedPattern(path, basename)) {
                        return null;
                    }
                    const clausePattern = when.replace('$(basename)', name);
                    const matched = hasSibling(clausePattern);
                    return (0, async_1.isThenable)(matched) ?
                        matched.then(m => m ? pattern : null) :
                        matched ? pattern : null;
                };
                result.requiresSiblings = true;
                return result;
            }
        }
        // Expression is Anything
        return parsedPattern;
    }
    function aggregateBasenameMatches(parsedPatterns, result) {
        const basenamePatterns = parsedPatterns.filter(parsedPattern => !!parsedPattern.basenames);
        if (basenamePatterns.length < 2) {
            return parsedPatterns;
        }
        const basenames = basenamePatterns.reduce((all, current) => {
            const basenames = current.basenames;
            return basenames ? all.concat(basenames) : all;
        }, []);
        let patterns;
        if (result) {
            patterns = [];
            for (let i = 0, n = basenames.length; i < n; i++) {
                patterns.push(result);
            }
        }
        else {
            patterns = basenamePatterns.reduce((all, current) => {
                const patterns = current.patterns;
                return patterns ? all.concat(patterns) : all;
            }, []);
        }
        const aggregate = function (path, basename) {
            if (typeof path !== 'string') {
                return null;
            }
            if (!basename) {
                let i;
                for (i = path.length; i > 0; i--) {
                    const ch = path.charCodeAt(i - 1);
                    if (ch === 47 /* Slash */ || ch === 92 /* Backslash */) {
                        break;
                    }
                }
                basename = path.substr(i);
            }
            const index = basenames.indexOf(basename);
            return index !== -1 ? patterns[index] : null;
        };
        aggregate.basenames = basenames;
        aggregate.patterns = patterns;
        aggregate.allBasenames = basenames;
        const aggregatedPatterns = parsedPatterns.filter(parsedPattern => !parsedPattern.basenames);
        aggregatedPatterns.push(aggregate);
        return aggregatedPatterns;
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[37/*vs/editor/common/core/characterClassifier*/], __M([0/*require*/,1/*exports*/,34/*vs/base/common/uint*/]), function (require, exports, uint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CharacterSet = exports.CharacterClassifier = void 0;
    /**
     * A fast character classifier that uses a compact array for ASCII values.
     */
    class CharacterClassifier {
        constructor(_defaultValue) {
            let defaultValue = (0, uint_1.toUint8)(_defaultValue);
            this._defaultValue = defaultValue;
            this._asciiMap = CharacterClassifier._createAsciiMap(defaultValue);
            this._map = new Map();
        }
        static _createAsciiMap(defaultValue) {
            let asciiMap = new Uint8Array(256);
            for (let i = 0; i < 256; i++) {
                asciiMap[i] = defaultValue;
            }
            return asciiMap;
        }
        set(charCode, _value) {
            let value = (0, uint_1.toUint8)(_value);
            if (charCode >= 0 && charCode < 256) {
                this._asciiMap[charCode] = value;
            }
            else {
                this._map.set(charCode, value);
            }
        }
        get(charCode) {
            if (charCode >= 0 && charCode < 256) {
                return this._asciiMap[charCode];
            }
            else {
                return (this._map.get(charCode) || this._defaultValue);
            }
        }
    }
    exports.CharacterClassifier = CharacterClassifier;
    var Boolean;
    (function (Boolean) {
        Boolean[Boolean["False"] = 0] = "False";
        Boolean[Boolean["True"] = 1] = "True";
    })(Boolean || (Boolean = {}));
    class CharacterSet {
        constructor() {
            this._actual = new CharacterClassifier(0 /* False */);
        }
        add(charCode) {
            this._actual.set(charCode, 1 /* True */);
        }
        has(charCode) {
            return (this._actual.get(charCode) === 1 /* True */);
        }
    }
    exports.CharacterSet = CharacterSet;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[38/*vs/editor/common/controller/wordCharacterClassifier*/], __M([0/*require*/,1/*exports*/,37/*vs/editor/common/core/characterClassifier*/]), function (require, exports, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMapForWordSeparators = exports.WordCharacterClassifier = exports.WordCharacterClass = void 0;
    var WordCharacterClass;
    (function (WordCharacterClass) {
        WordCharacterClass[WordCharacterClass["Regular"] = 0] = "Regular";
        WordCharacterClass[WordCharacterClass["Whitespace"] = 1] = "Whitespace";
        WordCharacterClass[WordCharacterClass["WordSeparator"] = 2] = "WordSeparator";
    })(WordCharacterClass = exports.WordCharacterClass || (exports.WordCharacterClass = {}));
    class WordCharacterClassifier extends characterClassifier_1.CharacterClassifier {
        constructor(wordSeparators) {
            super(0 /* Regular */);
            for (let i = 0, len = wordSeparators.length; i < len; i++) {
                this.set(wordSeparators.charCodeAt(i), 2 /* WordSeparator */);
            }
            this.set(32 /* Space */, 1 /* Whitespace */);
            this.set(9 /* Tab */, 1 /* Whitespace */);
        }
    }
    exports.WordCharacterClassifier = WordCharacterClassifier;
    function once(computeFn) {
        let cache = {}; // TODO@Alex unbounded cache
        return (input) => {
            if (!cache.hasOwnProperty(input)) {
                cache[input] = computeFn(input);
            }
            return cache[input];
        };
    }
    exports.getMapForWordSeparators = once((input) => new WordCharacterClassifier(input));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[10/*vs/editor/common/core/position*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Position = void 0;
    /**
     * A position in the editor.
     */
    class Position {
        constructor(lineNumber, column) {
            this.lineNumber = lineNumber;
            this.column = column;
        }
        /**
         * Create a new position from this position.
         *
         * @param newLineNumber new line number
         * @param newColumn new column
         */
        with(newLineNumber = this.lineNumber, newColumn = this.column) {
            if (newLineNumber === this.lineNumber && newColumn === this.column) {
                return this;
            }
            else {
                return new Position(newLineNumber, newColumn);
            }
        }
        /**
         * Derive a new position from this position.
         *
         * @param deltaLineNumber line number delta
         * @param deltaColumn column delta
         */
        delta(deltaLineNumber = 0, deltaColumn = 0) {
            return this.with(this.lineNumber + deltaLineNumber, this.column + deltaColumn);
        }
        /**
         * Test if this position equals other position
         */
        equals(other) {
            return Position.equals(this, other);
        }
        /**
         * Test if position `a` equals position `b`
         */
        static equals(a, b) {
            if (!a && !b) {
                return true;
            }
            return (!!a &&
                !!b &&
                a.lineNumber === b.lineNumber &&
                a.column === b.column);
        }
        /**
         * Test if this position is before other position.
         * If the two positions are equal, the result will be false.
         */
        isBefore(other) {
            return Position.isBefore(this, other);
        }
        /**
         * Test if position `a` is before position `b`.
         * If the two positions are equal, the result will be false.
         */
        static isBefore(a, b) {
            if (a.lineNumber < b.lineNumber) {
                return true;
            }
            if (b.lineNumber < a.lineNumber) {
                return false;
            }
            return a.column < b.column;
        }
        /**
         * Test if this position is before other position.
         * If the two positions are equal, the result will be true.
         */
        isBeforeOrEqual(other) {
            return Position.isBeforeOrEqual(this, other);
        }
        /**
         * Test if position `a` is before position `b`.
         * If the two positions are equal, the result will be true.
         */
        static isBeforeOrEqual(a, b) {
            if (a.lineNumber < b.lineNumber) {
                return true;
            }
            if (b.lineNumber < a.lineNumber) {
                return false;
            }
            return a.column <= b.column;
        }
        /**
         * A function that compares positions, useful for sorting
         */
        static compare(a, b) {
            let aLineNumber = a.lineNumber | 0;
            let bLineNumber = b.lineNumber | 0;
            if (aLineNumber === bLineNumber) {
                let aColumn = a.column | 0;
                let bColumn = b.column | 0;
                return aColumn - bColumn;
            }
            return aLineNumber - bLineNumber;
        }
        /**
         * Clone this position.
         */
        clone() {
            return new Position(this.lineNumber, this.column);
        }
        /**
         * Convert to a human-readable representation.
         */
        toString() {
            return '(' + this.lineNumber + ',' + this.column + ')';
        }
        // ---
        /**
         * Create a `Position` from an `IPosition`.
         */
        static lift(pos) {
            return new Position(pos.lineNumber, pos.column);
        }
        /**
         * Test if `obj` is an `IPosition`.
         */
        static isIPosition(obj) {
            return (obj
                && (typeof obj.lineNumber === 'number')
                && (typeof obj.column === 'number'));
        }
    }
    exports.Position = Position;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[7/*vs/editor/common/core/range*/], __M([0/*require*/,1/*exports*/,10/*vs/editor/common/core/position*/]), function (require, exports, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Range = void 0;
    /**
     * A range in the editor. (startLineNumber,startColumn) is <= (endLineNumber,endColumn)
     */
    class Range {
        constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
            if ((startLineNumber > endLineNumber) || (startLineNumber === endLineNumber && startColumn > endColumn)) {
                this.startLineNumber = endLineNumber;
                this.startColumn = endColumn;
                this.endLineNumber = startLineNumber;
                this.endColumn = startColumn;
            }
            else {
                this.startLineNumber = startLineNumber;
                this.startColumn = startColumn;
                this.endLineNumber = endLineNumber;
                this.endColumn = endColumn;
            }
        }
        /**
         * Test if this range is empty.
         */
        isEmpty() {
            return Range.isEmpty(this);
        }
        /**
         * Test if `range` is empty.
         */
        static isEmpty(range) {
            return (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn);
        }
        /**
         * Test if position is in this range. If the position is at the edges, will return true.
         */
        containsPosition(position) {
            return Range.containsPosition(this, position);
        }
        /**
         * Test if `position` is in `range`. If the position is at the edges, will return true.
         */
        static containsPosition(range, position) {
            if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
                return false;
            }
            if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
                return false;
            }
            if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
                return false;
            }
            return true;
        }
        /**
         * Test if range is in this range. If the range is equal to this range, will return true.
         */
        containsRange(range) {
            return Range.containsRange(this, range);
        }
        /**
         * Test if `otherRange` is in `range`. If the ranges are equal, will return true.
         */
        static containsRange(range, otherRange) {
            if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
                return false;
            }
            if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
                return false;
            }
            if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn < range.startColumn) {
                return false;
            }
            if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn > range.endColumn) {
                return false;
            }
            return true;
        }
        /**
         * Test if `range` is strictly in this range. `range` must start after and end before this range for the result to be true.
         */
        strictContainsRange(range) {
            return Range.strictContainsRange(this, range);
        }
        /**
         * Test if `otherRange` is strinctly in `range` (must start after, and end before). If the ranges are equal, will return false.
         */
        static strictContainsRange(range, otherRange) {
            if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
                return false;
            }
            if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
                return false;
            }
            if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn <= range.startColumn) {
                return false;
            }
            if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn >= range.endColumn) {
                return false;
            }
            return true;
        }
        /**
         * A reunion of the two ranges.
         * The smallest position will be used as the start point, and the largest one as the end point.
         */
        plusRange(range) {
            return Range.plusRange(this, range);
        }
        /**
         * A reunion of the two ranges.
         * The smallest position will be used as the start point, and the largest one as the end point.
         */
        static plusRange(a, b) {
            let startLineNumber;
            let startColumn;
            let endLineNumber;
            let endColumn;
            if (b.startLineNumber < a.startLineNumber) {
                startLineNumber = b.startLineNumber;
                startColumn = b.startColumn;
            }
            else if (b.startLineNumber === a.startLineNumber) {
                startLineNumber = b.startLineNumber;
                startColumn = Math.min(b.startColumn, a.startColumn);
            }
            else {
                startLineNumber = a.startLineNumber;
                startColumn = a.startColumn;
            }
            if (b.endLineNumber > a.endLineNumber) {
                endLineNumber = b.endLineNumber;
                endColumn = b.endColumn;
            }
            else if (b.endLineNumber === a.endLineNumber) {
                endLineNumber = b.endLineNumber;
                endColumn = Math.max(b.endColumn, a.endColumn);
            }
            else {
                endLineNumber = a.endLineNumber;
                endColumn = a.endColumn;
            }
            return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        /**
         * A intersection of the two ranges.
         */
        intersectRanges(range) {
            return Range.intersectRanges(this, range);
        }
        /**
         * A intersection of the two ranges.
         */
        static intersectRanges(a, b) {
            let resultStartLineNumber = a.startLineNumber;
            let resultStartColumn = a.startColumn;
            let resultEndLineNumber = a.endLineNumber;
            let resultEndColumn = a.endColumn;
            let otherStartLineNumber = b.startLineNumber;
            let otherStartColumn = b.startColumn;
            let otherEndLineNumber = b.endLineNumber;
            let otherEndColumn = b.endColumn;
            if (resultStartLineNumber < otherStartLineNumber) {
                resultStartLineNumber = otherStartLineNumber;
                resultStartColumn = otherStartColumn;
            }
            else if (resultStartLineNumber === otherStartLineNumber) {
                resultStartColumn = Math.max(resultStartColumn, otherStartColumn);
            }
            if (resultEndLineNumber > otherEndLineNumber) {
                resultEndLineNumber = otherEndLineNumber;
                resultEndColumn = otherEndColumn;
            }
            else if (resultEndLineNumber === otherEndLineNumber) {
                resultEndColumn = Math.min(resultEndColumn, otherEndColumn);
            }
            // Check if selection is now empty
            if (resultStartLineNumber > resultEndLineNumber) {
                return null;
            }
            if (resultStartLineNumber === resultEndLineNumber && resultStartColumn > resultEndColumn) {
                return null;
            }
            return new Range(resultStartLineNumber, resultStartColumn, resultEndLineNumber, resultEndColumn);
        }
        /**
         * Test if this range equals other.
         */
        equalsRange(other) {
            return Range.equalsRange(this, other);
        }
        /**
         * Test if range `a` equals `b`.
         */
        static equalsRange(a, b) {
            return (!!a &&
                !!b &&
                a.startLineNumber === b.startLineNumber &&
                a.startColumn === b.startColumn &&
                a.endLineNumber === b.endLineNumber &&
                a.endColumn === b.endColumn);
        }
        /**
         * Return the end position (which will be after or equal to the start position)
         */
        getEndPosition() {
            return Range.getEndPosition(this);
        }
        /**
         * Return the end position (which will be after or equal to the start position)
         */
        static getEndPosition(range) {
            return new position_1.Position(range.endLineNumber, range.endColumn);
        }
        /**
         * Return the start position (which will be before or equal to the end position)
         */
        getStartPosition() {
            return Range.getStartPosition(this);
        }
        /**
         * Return the start position (which will be before or equal to the end position)
         */
        static getStartPosition(range) {
            return new position_1.Position(range.startLineNumber, range.startColumn);
        }
        /**
         * Transform to a user presentable string representation.
         */
        toString() {
            return '[' + this.startLineNumber + ',' + this.startColumn + ' -> ' + this.endLineNumber + ',' + this.endColumn + ']';
        }
        /**
         * Create a new range using this range's start position, and using endLineNumber and endColumn as the end position.
         */
        setEndPosition(endLineNumber, endColumn) {
            return new Range(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
        }
        /**
         * Create a new range using this range's end position, and using startLineNumber and startColumn as the start position.
         */
        setStartPosition(startLineNumber, startColumn) {
            return new Range(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
        }
        /**
         * Create a new empty range using this range's start position.
         */
        collapseToStart() {
            return Range.collapseToStart(this);
        }
        /**
         * Create a new empty range using this range's start position.
         */
        static collapseToStart(range) {
            return new Range(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
        }
        // ---
        static fromPositions(start, end = start) {
            return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
        }
        static lift(range) {
            if (!range) {
                return null;
            }
            return new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
        }
        /**
         * Test if `obj` is an `IRange`.
         */
        static isIRange(obj) {
            return (obj
                && (typeof obj.startLineNumber === 'number')
                && (typeof obj.startColumn === 'number')
                && (typeof obj.endLineNumber === 'number')
                && (typeof obj.endColumn === 'number'));
        }
        /**
         * Test if the two ranges are touching in any way.
         */
        static areIntersectingOrTouching(a, b) {
            // Check if `a` is before `b`
            if (a.endLineNumber < b.startLineNumber || (a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn)) {
                return false;
            }
            // Check if `b` is before `a`
            if (b.endLineNumber < a.startLineNumber || (b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn)) {
                return false;
            }
            // These ranges must intersect
            return true;
        }
        /**
         * Test if the two ranges are intersecting. If the ranges are touching it returns true.
         */
        static areIntersecting(a, b) {
            // Check if `a` is before `b`
            if (a.endLineNumber < b.startLineNumber || (a.endLineNumber === b.startLineNumber && a.endColumn <= b.startColumn)) {
                return false;
            }
            // Check if `b` is before `a`
            if (b.endLineNumber < a.startLineNumber || (b.endLineNumber === a.startLineNumber && b.endColumn <= a.startColumn)) {
                return false;
            }
            // These ranges must intersect
            return true;
        }
        /**
         * A function that compares ranges, useful for sorting ranges
         * It will first compare ranges on the startPosition and then on the endPosition
         */
        static compareRangesUsingStarts(a, b) {
            if (a && b) {
                const aStartLineNumber = a.startLineNumber | 0;
                const bStartLineNumber = b.startLineNumber | 0;
                if (aStartLineNumber === bStartLineNumber) {
                    const aStartColumn = a.startColumn | 0;
                    const bStartColumn = b.startColumn | 0;
                    if (aStartColumn === bStartColumn) {
                        const aEndLineNumber = a.endLineNumber | 0;
                        const bEndLineNumber = b.endLineNumber | 0;
                        if (aEndLineNumber === bEndLineNumber) {
                            const aEndColumn = a.endColumn | 0;
                            const bEndColumn = b.endColumn | 0;
                            return aEndColumn - bEndColumn;
                        }
                        return aEndLineNumber - bEndLineNumber;
                    }
                    return aStartColumn - bStartColumn;
                }
                return aStartLineNumber - bStartLineNumber;
            }
            const aExists = (a ? 1 : 0);
            const bExists = (b ? 1 : 0);
            return aExists - bExists;
        }
        /**
         * A function that compares ranges, useful for sorting ranges
         * It will first compare ranges on the endPosition and then on the startPosition
         */
        static compareRangesUsingEnds(a, b) {
            if (a.endLineNumber === b.endLineNumber) {
                if (a.endColumn === b.endColumn) {
                    if (a.startLineNumber === b.startLineNumber) {
                        return a.startColumn - b.startColumn;
                    }
                    return a.startLineNumber - b.startLineNumber;
                }
                return a.endColumn - b.endColumn;
            }
            return a.endLineNumber - b.endLineNumber;
        }
        /**
         * Test if the range spans multiple lines.
         */
        static spansMultipleLines(range) {
            return range.endLineNumber > range.startLineNumber;
        }
    }
    exports.Range = Range;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[39/*vs/editor/common/core/stringBuilder*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/strings*/,3/*vs/base/common/platform*/,11/*vs/base/common/buffer*/]), function (require, exports, strings, platform, buffer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeUTF16LE = exports.createStringBuilder = exports.hasTextDecoder = exports.getPlatformTextDecoder = void 0;
    let _utf16LE_TextDecoder;
    function getUTF16LE_TextDecoder() {
        if (!_utf16LE_TextDecoder) {
            _utf16LE_TextDecoder = new TextDecoder('UTF-16LE');
        }
        return _utf16LE_TextDecoder;
    }
    let _utf16BE_TextDecoder;
    function getUTF16BE_TextDecoder() {
        if (!_utf16BE_TextDecoder) {
            _utf16BE_TextDecoder = new TextDecoder('UTF-16BE');
        }
        return _utf16BE_TextDecoder;
    }
    let _platformTextDecoder;
    function getPlatformTextDecoder() {
        if (!_platformTextDecoder) {
            _platformTextDecoder = platform.isLittleEndian() ? getUTF16LE_TextDecoder() : getUTF16BE_TextDecoder();
        }
        return _platformTextDecoder;
    }
    exports.getPlatformTextDecoder = getPlatformTextDecoder;
    exports.hasTextDecoder = (typeof TextDecoder !== 'undefined');
    if (exports.hasTextDecoder) {
        exports.createStringBuilder = (capacity) => new StringBuilder(capacity);
        exports.decodeUTF16LE = standardDecodeUTF16LE;
    }
    else {
        exports.createStringBuilder = (capacity) => new CompatStringBuilder();
        exports.decodeUTF16LE = compatDecodeUTF16LE;
    }
    function standardDecodeUTF16LE(source, offset, len) {
        const view = new Uint16Array(source.buffer, offset, len);
        if (len > 0 && (view[0] === 0xFEFF || view[0] === 0xFFFE)) {
            // UTF16 sometimes starts with a BOM https://de.wikipedia.org/wiki/Byte_Order_Mark
            // It looks like TextDecoder.decode will eat up a leading BOM (0xFEFF or 0xFFFE)
            // We don't want that behavior because we know the string is UTF16LE and the BOM should be maintained
            // So we use the manual decoder
            return compatDecodeUTF16LE(source, offset, len);
        }
        return getUTF16LE_TextDecoder().decode(view);
    }
    function compatDecodeUTF16LE(source, offset, len) {
        let result = [];
        let resultLen = 0;
        for (let i = 0; i < len; i++) {
            const charCode = buffer.readUInt16LE(source, offset);
            offset += 2;
            result[resultLen++] = String.fromCharCode(charCode);
        }
        return result.join('');
    }
    class StringBuilder {
        constructor(capacity) {
            this._capacity = capacity | 0;
            this._buffer = new Uint16Array(this._capacity);
            this._completedStrings = null;
            this._bufferLength = 0;
        }
        reset() {
            this._completedStrings = null;
            this._bufferLength = 0;
        }
        build() {
            if (this._completedStrings !== null) {
                this._flushBuffer();
                return this._completedStrings.join('');
            }
            return this._buildBuffer();
        }
        _buildBuffer() {
            if (this._bufferLength === 0) {
                return '';
            }
            const view = new Uint16Array(this._buffer.buffer, 0, this._bufferLength);
            return getPlatformTextDecoder().decode(view);
        }
        _flushBuffer() {
            const bufferString = this._buildBuffer();
            this._bufferLength = 0;
            if (this._completedStrings === null) {
                this._completedStrings = [bufferString];
            }
            else {
                this._completedStrings[this._completedStrings.length] = bufferString;
            }
        }
        write1(charCode) {
            const remainingSpace = this._capacity - this._bufferLength;
            if (remainingSpace <= 1) {
                if (remainingSpace === 0 || strings.isHighSurrogate(charCode)) {
                    this._flushBuffer();
                }
            }
            this._buffer[this._bufferLength++] = charCode;
        }
        appendASCII(charCode) {
            if (this._bufferLength === this._capacity) {
                // buffer is full
                this._flushBuffer();
            }
            this._buffer[this._bufferLength++] = charCode;
        }
        appendASCIIString(str) {
            const strLen = str.length;
            if (this._bufferLength + strLen >= this._capacity) {
                // This string does not fit in the remaining buffer space
                this._flushBuffer();
                this._completedStrings[this._completedStrings.length] = str;
                return;
            }
            for (let i = 0; i < strLen; i++) {
                this._buffer[this._bufferLength++] = str.charCodeAt(i);
            }
        }
    }
    class CompatStringBuilder {
        constructor() {
            this._pieces = [];
            this._piecesLen = 0;
        }
        reset() {
            this._pieces = [];
            this._piecesLen = 0;
        }
        build() {
            return this._pieces.join('');
        }
        write1(charCode) {
            this._pieces[this._piecesLen++] = String.fromCharCode(charCode);
        }
        appendASCII(charCode) {
            this._pieces[this._piecesLen++] = String.fromCharCode(charCode);
        }
        appendASCIIString(str) {
            this._pieces[this._piecesLen++] = str;
        }
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[13/*vs/editor/common/model*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ApplyEditsResult = exports.ValidAnnotatedEditOperation = exports.ModelConstants = exports.TrackedRangeStickiness = exports.FindMatch = exports.TextModelResolvedOptions = exports.EndOfLineSequence = exports.DefaultEndOfLine = exports.EndOfLinePreference = exports.MinimapPosition = exports.OverviewRulerLane = void 0;
    /**
     * Vertical Lane in the overview ruler of the editor.
     */
    var OverviewRulerLane;
    (function (OverviewRulerLane) {
        OverviewRulerLane[OverviewRulerLane["Left"] = 1] = "Left";
        OverviewRulerLane[OverviewRulerLane["Center"] = 2] = "Center";
        OverviewRulerLane[OverviewRulerLane["Right"] = 4] = "Right";
        OverviewRulerLane[OverviewRulerLane["Full"] = 7] = "Full";
    })(OverviewRulerLane = exports.OverviewRulerLane || (exports.OverviewRulerLane = {}));
    /**
     * Position in the minimap to render the decoration.
     */
    var MinimapPosition;
    (function (MinimapPosition) {
        MinimapPosition[MinimapPosition["Inline"] = 1] = "Inline";
        MinimapPosition[MinimapPosition["Gutter"] = 2] = "Gutter";
    })(MinimapPosition = exports.MinimapPosition || (exports.MinimapPosition = {}));
    /**
     * End of line character preference.
     */
    var EndOfLinePreference;
    (function (EndOfLinePreference) {
        /**
         * Use the end of line character identified in the text buffer.
         */
        EndOfLinePreference[EndOfLinePreference["TextDefined"] = 0] = "TextDefined";
        /**
         * Use line feed (\n) as the end of line character.
         */
        EndOfLinePreference[EndOfLinePreference["LF"] = 1] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        EndOfLinePreference[EndOfLinePreference["CRLF"] = 2] = "CRLF";
    })(EndOfLinePreference = exports.EndOfLinePreference || (exports.EndOfLinePreference = {}));
    /**
     * The default end of line to use when instantiating models.
     */
    var DefaultEndOfLine;
    (function (DefaultEndOfLine) {
        /**
         * Use line feed (\n) as the end of line character.
         */
        DefaultEndOfLine[DefaultEndOfLine["LF"] = 1] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        DefaultEndOfLine[DefaultEndOfLine["CRLF"] = 2] = "CRLF";
    })(DefaultEndOfLine = exports.DefaultEndOfLine || (exports.DefaultEndOfLine = {}));
    /**
     * End of line character preference.
     */
    var EndOfLineSequence;
    (function (EndOfLineSequence) {
        /**
         * Use line feed (\n) as the end of line character.
         */
        EndOfLineSequence[EndOfLineSequence["LF"] = 0] = "LF";
        /**
         * Use carriage return and line feed (\r\n) as the end of line character.
         */
        EndOfLineSequence[EndOfLineSequence["CRLF"] = 1] = "CRLF";
    })(EndOfLineSequence = exports.EndOfLineSequence || (exports.EndOfLineSequence = {}));
    class TextModelResolvedOptions {
        /**
         * @internal
         */
        constructor(src) {
            this.tabSize = Math.max(1, src.tabSize | 0);
            this.indentSize = src.tabSize | 0;
            this.insertSpaces = Boolean(src.insertSpaces);
            this.defaultEOL = src.defaultEOL | 0;
            this.trimAutoWhitespace = Boolean(src.trimAutoWhitespace);
        }
        /**
         * @internal
         */
        equals(other) {
            return (this.tabSize === other.tabSize
                && this.indentSize === other.indentSize
                && this.insertSpaces === other.insertSpaces
                && this.defaultEOL === other.defaultEOL
                && this.trimAutoWhitespace === other.trimAutoWhitespace);
        }
        /**
         * @internal
         */
        createChangeEvent(newOpts) {
            return {
                tabSize: this.tabSize !== newOpts.tabSize,
                indentSize: this.indentSize !== newOpts.indentSize,
                insertSpaces: this.insertSpaces !== newOpts.insertSpaces,
                trimAutoWhitespace: this.trimAutoWhitespace !== newOpts.trimAutoWhitespace,
            };
        }
    }
    exports.TextModelResolvedOptions = TextModelResolvedOptions;
    class FindMatch {
        /**
         * @internal
         */
        constructor(range, matches) {
            this.range = range;
            this.matches = matches;
        }
    }
    exports.FindMatch = FindMatch;
    /**
     * Describes the behavior of decorations when typing/editing near their edges.
     * Note: Please do not edit the values, as they very carefully match `DecorationRangeBehavior`
     */
    var TrackedRangeStickiness;
    (function (TrackedRangeStickiness) {
        TrackedRangeStickiness[TrackedRangeStickiness["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
        TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
    })(TrackedRangeStickiness = exports.TrackedRangeStickiness || (exports.TrackedRangeStickiness = {}));
    /**
     * @internal
     */
    var ModelConstants;
    (function (ModelConstants) {
        ModelConstants[ModelConstants["FIRST_LINE_DETECTION_LENGTH_LIMIT"] = 1000] = "FIRST_LINE_DETECTION_LENGTH_LIMIT";
    })(ModelConstants = exports.ModelConstants || (exports.ModelConstants = {}));
    /**
     * @internal
     */
    class ValidAnnotatedEditOperation {
        constructor(identifier, range, text, forceMoveMarkers, isAutoWhitespaceEdit, _isTracked) {
            this.identifier = identifier;
            this.range = range;
            this.text = text;
            this.forceMoveMarkers = forceMoveMarkers;
            this.isAutoWhitespaceEdit = isAutoWhitespaceEdit;
            this._isTracked = _isTracked;
        }
    }
    exports.ValidAnnotatedEditOperation = ValidAnnotatedEditOperation;
    /**
     * @internal
     */
    class ApplyEditsResult {
        constructor(reverseEdits, changes, trimAutoWhitespaceLineNumbers) {
            this.reverseEdits = reverseEdits;
            this.changes = changes;
            this.trimAutoWhitespaceLineNumbers = trimAutoWhitespaceLineNumbers;
        }
    }
    exports.ApplyEditsResult = ApplyEditsResult;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[40/*vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.recomputeTreeMetadata = exports.updateTreeMetadata = exports.fixInsert = exports.rbDelete = exports.rightRotate = exports.leftRotate = exports.resetSentinel = exports.calculateLF = exports.calculateSize = exports.righttest = exports.leftest = exports.SENTINEL = exports.NodeColor = exports.TreeNode = void 0;
    class TreeNode {
        constructor(piece, color) {
            this.piece = piece;
            this.color = color;
            this.size_left = 0;
            this.lf_left = 0;
            this.parent = this;
            this.left = this;
            this.right = this;
        }
        next() {
            if (this.right !== exports.SENTINEL) {
                return leftest(this.right);
            }
            let node = this;
            while (node.parent !== exports.SENTINEL) {
                if (node.parent.left === node) {
                    break;
                }
                node = node.parent;
            }
            if (node.parent === exports.SENTINEL) {
                return exports.SENTINEL;
            }
            else {
                return node.parent;
            }
        }
        prev() {
            if (this.left !== exports.SENTINEL) {
                return righttest(this.left);
            }
            let node = this;
            while (node.parent !== exports.SENTINEL) {
                if (node.parent.right === node) {
                    break;
                }
                node = node.parent;
            }
            if (node.parent === exports.SENTINEL) {
                return exports.SENTINEL;
            }
            else {
                return node.parent;
            }
        }
        detach() {
            this.parent = null;
            this.left = null;
            this.right = null;
        }
    }
    exports.TreeNode = TreeNode;
    var NodeColor;
    (function (NodeColor) {
        NodeColor[NodeColor["Black"] = 0] = "Black";
        NodeColor[NodeColor["Red"] = 1] = "Red";
    })(NodeColor = exports.NodeColor || (exports.NodeColor = {}));
    exports.SENTINEL = new TreeNode(null, 0 /* Black */);
    exports.SENTINEL.parent = exports.SENTINEL;
    exports.SENTINEL.left = exports.SENTINEL;
    exports.SENTINEL.right = exports.SENTINEL;
    exports.SENTINEL.color = 0 /* Black */;
    function leftest(node) {
        while (node.left !== exports.SENTINEL) {
            node = node.left;
        }
        return node;
    }
    exports.leftest = leftest;
    function righttest(node) {
        while (node.right !== exports.SENTINEL) {
            node = node.right;
        }
        return node;
    }
    exports.righttest = righttest;
    function calculateSize(node) {
        if (node === exports.SENTINEL) {
            return 0;
        }
        return node.size_left + node.piece.length + calculateSize(node.right);
    }
    exports.calculateSize = calculateSize;
    function calculateLF(node) {
        if (node === exports.SENTINEL) {
            return 0;
        }
        return node.lf_left + node.piece.lineFeedCnt + calculateLF(node.right);
    }
    exports.calculateLF = calculateLF;
    function resetSentinel() {
        exports.SENTINEL.parent = exports.SENTINEL;
    }
    exports.resetSentinel = resetSentinel;
    function leftRotate(tree, x) {
        let y = x.right;
        // fix size_left
        y.size_left += x.size_left + (x.piece ? x.piece.length : 0);
        y.lf_left += x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
        x.right = y.left;
        if (y.left !== exports.SENTINEL) {
            y.left.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === exports.SENTINEL) {
            tree.root = y;
        }
        else if (x.parent.left === x) {
            x.parent.left = y;
        }
        else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }
    exports.leftRotate = leftRotate;
    function rightRotate(tree, y) {
        let x = y.left;
        y.left = x.right;
        if (x.right !== exports.SENTINEL) {
            x.right.parent = y;
        }
        x.parent = y.parent;
        // fix size_left
        y.size_left -= x.size_left + (x.piece ? x.piece.length : 0);
        y.lf_left -= x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
        if (y.parent === exports.SENTINEL) {
            tree.root = x;
        }
        else if (y === y.parent.right) {
            y.parent.right = x;
        }
        else {
            y.parent.left = x;
        }
        x.right = y;
        y.parent = x;
    }
    exports.rightRotate = rightRotate;
    function rbDelete(tree, z) {
        let x;
        let y;
        if (z.left === exports.SENTINEL) {
            y = z;
            x = y.right;
        }
        else if (z.right === exports.SENTINEL) {
            y = z;
            x = y.left;
        }
        else {
            y = leftest(z.right);
            x = y.right;
        }
        if (y === tree.root) {
            tree.root = x;
            // if x is null, we are removing the only node
            x.color = 0 /* Black */;
            z.detach();
            resetSentinel();
            tree.root.parent = exports.SENTINEL;
            return;
        }
        let yWasRed = (y.color === 1 /* Red */);
        if (y === y.parent.left) {
            y.parent.left = x;
        }
        else {
            y.parent.right = x;
        }
        if (y === z) {
            x.parent = y.parent;
            recomputeTreeMetadata(tree, x);
        }
        else {
            if (y.parent === z) {
                x.parent = y;
            }
            else {
                x.parent = y.parent;
            }
            // as we make changes to x's hierarchy, update size_left of subtree first
            recomputeTreeMetadata(tree, x);
            y.left = z.left;
            y.right = z.right;
            y.parent = z.parent;
            y.color = z.color;
            if (z === tree.root) {
                tree.root = y;
            }
            else {
                if (z === z.parent.left) {
                    z.parent.left = y;
                }
                else {
                    z.parent.right = y;
                }
            }
            if (y.left !== exports.SENTINEL) {
                y.left.parent = y;
            }
            if (y.right !== exports.SENTINEL) {
                y.right.parent = y;
            }
            // update metadata
            // we replace z with y, so in this sub tree, the length change is z.item.length
            y.size_left = z.size_left;
            y.lf_left = z.lf_left;
            recomputeTreeMetadata(tree, y);
        }
        z.detach();
        if (x.parent.left === x) {
            let newSizeLeft = calculateSize(x);
            let newLFLeft = calculateLF(x);
            if (newSizeLeft !== x.parent.size_left || newLFLeft !== x.parent.lf_left) {
                let delta = newSizeLeft - x.parent.size_left;
                let lf_delta = newLFLeft - x.parent.lf_left;
                x.parent.size_left = newSizeLeft;
                x.parent.lf_left = newLFLeft;
                updateTreeMetadata(tree, x.parent, delta, lf_delta);
            }
        }
        recomputeTreeMetadata(tree, x.parent);
        if (yWasRed) {
            resetSentinel();
            return;
        }
        // RB-DELETE-FIXUP
        let w;
        while (x !== tree.root && x.color === 0 /* Black */) {
            if (x === x.parent.left) {
                w = x.parent.right;
                if (w.color === 1 /* Red */) {
                    w.color = 0 /* Black */;
                    x.parent.color = 1 /* Red */;
                    leftRotate(tree, x.parent);
                    w = x.parent.right;
                }
                if (w.left.color === 0 /* Black */ && w.right.color === 0 /* Black */) {
                    w.color = 1 /* Red */;
                    x = x.parent;
                }
                else {
                    if (w.right.color === 0 /* Black */) {
                        w.left.color = 0 /* Black */;
                        w.color = 1 /* Red */;
                        rightRotate(tree, w);
                        w = x.parent.right;
                    }
                    w.color = x.parent.color;
                    x.parent.color = 0 /* Black */;
                    w.right.color = 0 /* Black */;
                    leftRotate(tree, x.parent);
                    x = tree.root;
                }
            }
            else {
                w = x.parent.left;
                if (w.color === 1 /* Red */) {
                    w.color = 0 /* Black */;
                    x.parent.color = 1 /* Red */;
                    rightRotate(tree, x.parent);
                    w = x.parent.left;
                }
                if (w.left.color === 0 /* Black */ && w.right.color === 0 /* Black */) {
                    w.color = 1 /* Red */;
                    x = x.parent;
                }
                else {
                    if (w.left.color === 0 /* Black */) {
                        w.right.color = 0 /* Black */;
                        w.color = 1 /* Red */;
                        leftRotate(tree, w);
                        w = x.parent.left;
                    }
                    w.color = x.parent.color;
                    x.parent.color = 0 /* Black */;
                    w.left.color = 0 /* Black */;
                    rightRotate(tree, x.parent);
                    x = tree.root;
                }
            }
        }
        x.color = 0 /* Black */;
        resetSentinel();
    }
    exports.rbDelete = rbDelete;
    function fixInsert(tree, x) {
        recomputeTreeMetadata(tree, x);
        while (x !== tree.root && x.parent.color === 1 /* Red */) {
            if (x.parent === x.parent.parent.left) {
                const y = x.parent.parent.right;
                if (y.color === 1 /* Red */) {
                    x.parent.color = 0 /* Black */;
                    y.color = 0 /* Black */;
                    x.parent.parent.color = 1 /* Red */;
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.right) {
                        x = x.parent;
                        leftRotate(tree, x);
                    }
                    x.parent.color = 0 /* Black */;
                    x.parent.parent.color = 1 /* Red */;
                    rightRotate(tree, x.parent.parent);
                }
            }
            else {
                const y = x.parent.parent.left;
                if (y.color === 1 /* Red */) {
                    x.parent.color = 0 /* Black */;
                    y.color = 0 /* Black */;
                    x.parent.parent.color = 1 /* Red */;
                    x = x.parent.parent;
                }
                else {
                    if (x === x.parent.left) {
                        x = x.parent;
                        rightRotate(tree, x);
                    }
                    x.parent.color = 0 /* Black */;
                    x.parent.parent.color = 1 /* Red */;
                    leftRotate(tree, x.parent.parent);
                }
            }
        }
        tree.root.color = 0 /* Black */;
    }
    exports.fixInsert = fixInsert;
    function updateTreeMetadata(tree, x, delta, lineFeedCntDelta) {
        // node length change or line feed count change
        while (x !== tree.root && x !== exports.SENTINEL) {
            if (x.parent.left === x) {
                x.parent.size_left += delta;
                x.parent.lf_left += lineFeedCntDelta;
            }
            x = x.parent;
        }
    }
    exports.updateTreeMetadata = updateTreeMetadata;
    function recomputeTreeMetadata(tree, x) {
        let delta = 0;
        let lf_delta = 0;
        if (x === tree.root) {
            return;
        }
        if (delta === 0) {
            // go upwards till the node whose left subtree is changed.
            while (x !== tree.root && x === x.parent.right) {
                x = x.parent;
            }
            if (x === tree.root) {
                // well, it means we add a node to the end (inorder)
                return;
            }
            // x is the node whose right subtree is changed.
            x = x.parent;
            delta = calculateSize(x.left) - x.size_left;
            lf_delta = calculateLF(x.left) - x.lf_left;
            x.size_left += delta;
            x.lf_left += lf_delta;
        }
        // go upwards till root. O(logN)
        while (x !== tree.root && (delta !== 0 || lf_delta !== 0)) {
            if (x.parent.left === x) {
                x.parent.size_left += delta;
                x.parent.lf_left += lf_delta;
            }
            x = x.parent;
        }
    }
    exports.recomputeTreeMetadata = recomputeTreeMetadata;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[41/*vs/editor/common/model/textChange*/], __M([0/*require*/,1/*exports*/,11/*vs/base/common/buffer*/,39/*vs/editor/common/core/stringBuilder*/]), function (require, exports, buffer, stringBuilder_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compressConsecutiveTextChanges = exports.TextChange = void 0;
    function escapeNewLine(str) {
        return (str
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r'));
    }
    class TextChange {
        constructor(oldPosition, oldText, newPosition, newText) {
            this.oldPosition = oldPosition;
            this.oldText = oldText;
            this.newPosition = newPosition;
            this.newText = newText;
        }
        get oldLength() {
            return this.oldText.length;
        }
        get oldEnd() {
            return this.oldPosition + this.oldText.length;
        }
        get newLength() {
            return this.newText.length;
        }
        get newEnd() {
            return this.newPosition + this.newText.length;
        }
        toString() {
            if (this.oldText.length === 0) {
                return `(insert@${this.oldPosition} "${escapeNewLine(this.newText)}")`;
            }
            if (this.newText.length === 0) {
                return `(delete@${this.oldPosition} "${escapeNewLine(this.oldText)}")`;
            }
            return `(replace@${this.oldPosition} "${escapeNewLine(this.oldText)}" with "${escapeNewLine(this.newText)}")`;
        }
        static _writeStringSize(str) {
            return (4 + 2 * str.length);
        }
        static _writeString(b, str, offset) {
            const len = str.length;
            buffer.writeUInt32BE(b, len, offset);
            offset += 4;
            for (let i = 0; i < len; i++) {
                buffer.writeUInt16LE(b, str.charCodeAt(i), offset);
                offset += 2;
            }
            return offset;
        }
        static _readString(b, offset) {
            const len = buffer.readUInt32BE(b, offset);
            offset += 4;
            return (0, stringBuilder_1.decodeUTF16LE)(b, offset, len);
        }
        writeSize() {
            return (+4 // oldPosition
                + 4 // newPosition
                + TextChange._writeStringSize(this.oldText)
                + TextChange._writeStringSize(this.newText));
        }
        write(b, offset) {
            buffer.writeUInt32BE(b, this.oldPosition, offset);
            offset += 4;
            buffer.writeUInt32BE(b, this.newPosition, offset);
            offset += 4;
            offset = TextChange._writeString(b, this.oldText, offset);
            offset = TextChange._writeString(b, this.newText, offset);
            return offset;
        }
        static read(b, offset, dest) {
            const oldPosition = buffer.readUInt32BE(b, offset);
            offset += 4;
            const newPosition = buffer.readUInt32BE(b, offset);
            offset += 4;
            const oldText = TextChange._readString(b, offset);
            offset += TextChange._writeStringSize(oldText);
            const newText = TextChange._readString(b, offset);
            offset += TextChange._writeStringSize(newText);
            dest.push(new TextChange(oldPosition, oldText, newPosition, newText));
            return offset;
        }
    }
    exports.TextChange = TextChange;
    function compressConsecutiveTextChanges(prevEdits, currEdits) {
        if (prevEdits === null || prevEdits.length === 0) {
            return currEdits;
        }
        const compressor = new TextChangeCompressor(prevEdits, currEdits);
        return compressor.compress();
    }
    exports.compressConsecutiveTextChanges = compressConsecutiveTextChanges;
    class TextChangeCompressor {
        constructor(prevEdits, currEdits) {
            this._prevEdits = prevEdits;
            this._currEdits = currEdits;
            this._result = [];
            this._resultLen = 0;
            this._prevLen = this._prevEdits.length;
            this._prevDeltaOffset = 0;
            this._currLen = this._currEdits.length;
            this._currDeltaOffset = 0;
        }
        compress() {
            let prevIndex = 0;
            let currIndex = 0;
            let prevEdit = this._getPrev(prevIndex);
            let currEdit = this._getCurr(currIndex);
            while (prevIndex < this._prevLen || currIndex < this._currLen) {
                if (prevEdit === null) {
                    this._acceptCurr(currEdit);
                    currEdit = this._getCurr(++currIndex);
                    continue;
                }
                if (currEdit === null) {
                    this._acceptPrev(prevEdit);
                    prevEdit = this._getPrev(++prevIndex);
                    continue;
                }
                if (currEdit.oldEnd <= prevEdit.newPosition) {
                    this._acceptCurr(currEdit);
                    currEdit = this._getCurr(++currIndex);
                    continue;
                }
                if (prevEdit.newEnd <= currEdit.oldPosition) {
                    this._acceptPrev(prevEdit);
                    prevEdit = this._getPrev(++prevIndex);
                    continue;
                }
                if (currEdit.oldPosition < prevEdit.newPosition) {
                    const [e1, e2] = TextChangeCompressor._splitCurr(currEdit, prevEdit.newPosition - currEdit.oldPosition);
                    this._acceptCurr(e1);
                    currEdit = e2;
                    continue;
                }
                if (prevEdit.newPosition < currEdit.oldPosition) {
                    const [e1, e2] = TextChangeCompressor._splitPrev(prevEdit, currEdit.oldPosition - prevEdit.newPosition);
                    this._acceptPrev(e1);
                    prevEdit = e2;
                    continue;
                }
                // At this point, currEdit.oldPosition === prevEdit.newPosition
                let mergePrev;
                let mergeCurr;
                if (currEdit.oldEnd === prevEdit.newEnd) {
                    mergePrev = prevEdit;
                    mergeCurr = currEdit;
                    prevEdit = this._getPrev(++prevIndex);
                    currEdit = this._getCurr(++currIndex);
                }
                else if (currEdit.oldEnd < prevEdit.newEnd) {
                    const [e1, e2] = TextChangeCompressor._splitPrev(prevEdit, currEdit.oldLength);
                    mergePrev = e1;
                    mergeCurr = currEdit;
                    prevEdit = e2;
                    currEdit = this._getCurr(++currIndex);
                }
                else {
                    const [e1, e2] = TextChangeCompressor._splitCurr(currEdit, prevEdit.newLength);
                    mergePrev = prevEdit;
                    mergeCurr = e1;
                    prevEdit = this._getPrev(++prevIndex);
                    currEdit = e2;
                }
                this._result[this._resultLen++] = new TextChange(mergePrev.oldPosition, mergePrev.oldText, mergeCurr.newPosition, mergeCurr.newText);
                this._prevDeltaOffset += mergePrev.newLength - mergePrev.oldLength;
                this._currDeltaOffset += mergeCurr.newLength - mergeCurr.oldLength;
            }
            const merged = TextChangeCompressor._merge(this._result);
            const cleaned = TextChangeCompressor._removeNoOps(merged);
            return cleaned;
        }
        _acceptCurr(currEdit) {
            this._result[this._resultLen++] = TextChangeCompressor._rebaseCurr(this._prevDeltaOffset, currEdit);
            this._currDeltaOffset += currEdit.newLength - currEdit.oldLength;
        }
        _getCurr(currIndex) {
            return (currIndex < this._currLen ? this._currEdits[currIndex] : null);
        }
        _acceptPrev(prevEdit) {
            this._result[this._resultLen++] = TextChangeCompressor._rebasePrev(this._currDeltaOffset, prevEdit);
            this._prevDeltaOffset += prevEdit.newLength - prevEdit.oldLength;
        }
        _getPrev(prevIndex) {
            return (prevIndex < this._prevLen ? this._prevEdits[prevIndex] : null);
        }
        static _rebaseCurr(prevDeltaOffset, currEdit) {
            return new TextChange(currEdit.oldPosition - prevDeltaOffset, currEdit.oldText, currEdit.newPosition, currEdit.newText);
        }
        static _rebasePrev(currDeltaOffset, prevEdit) {
            return new TextChange(prevEdit.oldPosition, prevEdit.oldText, prevEdit.newPosition + currDeltaOffset, prevEdit.newText);
        }
        static _splitPrev(edit, offset) {
            const preText = edit.newText.substr(0, offset);
            const postText = edit.newText.substr(offset);
            return [
                new TextChange(edit.oldPosition, edit.oldText, edit.newPosition, preText),
                new TextChange(edit.oldEnd, '', edit.newPosition + offset, postText)
            ];
        }
        static _splitCurr(edit, offset) {
            const preText = edit.oldText.substr(0, offset);
            const postText = edit.oldText.substr(offset);
            return [
                new TextChange(edit.oldPosition, preText, edit.newPosition, edit.newText),
                new TextChange(edit.oldPosition + offset, postText, edit.newEnd, '')
            ];
        }
        static _merge(edits) {
            if (edits.length === 0) {
                return edits;
            }
            let result = [], resultLen = 0;
            let prev = edits[0];
            for (let i = 1; i < edits.length; i++) {
                const curr = edits[i];
                if (prev.oldEnd === curr.oldPosition) {
                    // Merge into `prev`
                    prev = new TextChange(prev.oldPosition, prev.oldText + curr.oldText, prev.newPosition, prev.newText + curr.newText);
                }
                else {
                    result[resultLen++] = prev;
                    prev = curr;
                }
            }
            result[resultLen++] = prev;
            return result;
        }
        static _removeNoOps(edits) {
            if (edits.length === 0) {
                return edits;
            }
            let result = [], resultLen = 0;
            for (let i = 0; i < edits.length; i++) {
                const edit = edits[i];
                if (edit.oldText === edit.newText) {
                    continue;
                }
                result[resultLen++] = edit;
            }
            return result;
        }
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[42/*vs/editor/common/model/textModelSearch*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/strings*/,38/*vs/editor/common/controller/wordCharacterClassifier*/,10/*vs/editor/common/core/position*/,7/*vs/editor/common/core/range*/,13/*vs/editor/common/model*/]), function (require, exports, strings, wordCharacterClassifier_1, position_1, range_1, model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Searcher = exports.isValidMatch = exports.TextModelSearch = exports.createFindMatch = exports.SearchData = exports.isMultilineRegexSource = exports.SearchParams = void 0;
    const LIMIT_FIND_COUNT = 999;
    class SearchParams {
        constructor(searchString, isRegex, matchCase, wordSeparators) {
            this.searchString = searchString;
            this.isRegex = isRegex;
            this.matchCase = matchCase;
            this.wordSeparators = wordSeparators;
        }
        parseSearchRequest() {
            if (this.searchString === '') {
                return null;
            }
            // Try to create a RegExp out of the params
            let multiline;
            if (this.isRegex) {
                multiline = isMultilineRegexSource(this.searchString);
            }
            else {
                multiline = (this.searchString.indexOf('\n') >= 0);
            }
            let regex = null;
            try {
                regex = strings.createRegExp(this.searchString, this.isRegex, {
                    matchCase: this.matchCase,
                    wholeWord: false,
                    multiline: multiline,
                    global: true,
                    unicode: true
                });
            }
            catch (err) {
                return null;
            }
            if (!regex) {
                return null;
            }
            let canUseSimpleSearch = (!this.isRegex && !multiline);
            if (canUseSimpleSearch && this.searchString.toLowerCase() !== this.searchString.toUpperCase()) {
                // casing might make a difference
                canUseSimpleSearch = this.matchCase;
            }
            return new SearchData(regex, this.wordSeparators ? (0, wordCharacterClassifier_1.getMapForWordSeparators)(this.wordSeparators) : null, canUseSimpleSearch ? this.searchString : null);
        }
    }
    exports.SearchParams = SearchParams;
    function isMultilineRegexSource(searchString) {
        if (!searchString || searchString.length === 0) {
            return false;
        }
        for (let i = 0, len = searchString.length; i < len; i++) {
            const chCode = searchString.charCodeAt(i);
            if (chCode === 92 /* Backslash */) {
                // move to next char
                i++;
                if (i >= len) {
                    // string ends with a \
                    break;
                }
                const nextChCode = searchString.charCodeAt(i);
                if (nextChCode === 110 /* n */ || nextChCode === 114 /* r */ || nextChCode === 87 /* W */ || nextChCode === 119 /* w */) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isMultilineRegexSource = isMultilineRegexSource;
    class SearchData {
        constructor(regex, wordSeparators, simpleSearch) {
            this.regex = regex;
            this.wordSeparators = wordSeparators;
            this.simpleSearch = simpleSearch;
        }
    }
    exports.SearchData = SearchData;
    function createFindMatch(range, rawMatches, captureMatches) {
        if (!captureMatches) {
            return new model_1.FindMatch(range, null);
        }
        let matches = [];
        for (let i = 0, len = rawMatches.length; i < len; i++) {
            matches[i] = rawMatches[i];
        }
        return new model_1.FindMatch(range, matches);
    }
    exports.createFindMatch = createFindMatch;
    class LineFeedCounter {
        constructor(text) {
            let lineFeedsOffsets = [];
            let lineFeedsOffsetsLen = 0;
            for (let i = 0, textLen = text.length; i < textLen; i++) {
                if (text.charCodeAt(i) === 10 /* LineFeed */) {
                    lineFeedsOffsets[lineFeedsOffsetsLen++] = i;
                }
            }
            this._lineFeedsOffsets = lineFeedsOffsets;
        }
        findLineFeedCountBeforeOffset(offset) {
            const lineFeedsOffsets = this._lineFeedsOffsets;
            let min = 0;
            let max = lineFeedsOffsets.length - 1;
            if (max === -1) {
                // no line feeds
                return 0;
            }
            if (offset <= lineFeedsOffsets[0]) {
                // before first line feed
                return 0;
            }
            while (min < max) {
                const mid = min + ((max - min) / 2 >> 0);
                if (lineFeedsOffsets[mid] >= offset) {
                    max = mid - 1;
                }
                else {
                    if (lineFeedsOffsets[mid + 1] >= offset) {
                        // bingo!
                        min = mid;
                        max = mid;
                    }
                    else {
                        min = mid + 1;
                    }
                }
            }
            return min + 1;
        }
    }
    class TextModelSearch {
        static findMatches(model, searchParams, searchRange, captureMatches, limitResultCount) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            if (searchData.regex.multiline) {
                return this._doFindMatchesMultiline(model, searchRange, new Searcher(searchData.wordSeparators, searchData.regex), captureMatches, limitResultCount);
            }
            return this._doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount);
        }
        /**
         * Multiline search always executes on the lines concatenated with \n.
         * We must therefore compensate for the count of \n in case the model is CRLF
         */
        static _getMultilineMatchRange(model, deltaOffset, text, lfCounter, matchIndex, match0) {
            let startOffset;
            let lineFeedCountBeforeMatch = 0;
            if (lfCounter) {
                lineFeedCountBeforeMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex);
                startOffset = deltaOffset + matchIndex + lineFeedCountBeforeMatch /* add as many \r as there were \n */;
            }
            else {
                startOffset = deltaOffset + matchIndex;
            }
            let endOffset;
            if (lfCounter) {
                let lineFeedCountBeforeEndOfMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex + match0.length);
                let lineFeedCountInMatch = lineFeedCountBeforeEndOfMatch - lineFeedCountBeforeMatch;
                endOffset = startOffset + match0.length + lineFeedCountInMatch /* add as many \r as there were \n */;
            }
            else {
                endOffset = startOffset + match0.length;
            }
            const startPosition = model.getPositionAt(startOffset);
            const endPosition = model.getPositionAt(endOffset);
            return new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        }
        static _doFindMatchesMultiline(model, searchRange, searcher, captureMatches, limitResultCount) {
            const deltaOffset = model.getOffsetAt(searchRange.getStartPosition());
            // We always execute multiline search over the lines joined with \n
            // This makes it that \n will match the EOL for both CRLF and LF models
            // We compensate for offset errors in `_getMultilineMatchRange`
            const text = model.getValueInRange(searchRange, 1 /* LF */);
            const lfCounter = (model.getEOL() === '\r\n' ? new LineFeedCounter(text) : null);
            const result = [];
            let counter = 0;
            let m;
            searcher.reset(0);
            while ((m = searcher.next(text))) {
                result[counter++] = createFindMatch(this._getMultilineMatchRange(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
                if (counter >= limitResultCount) {
                    return result;
                }
            }
            return result;
        }
        static _doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount) {
            const result = [];
            let resultLen = 0;
            // Early case for a search range that starts & stops on the same line number
            if (searchRange.startLineNumber === searchRange.endLineNumber) {
                const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1, searchRange.endColumn - 1);
                resultLen = this._findMatchesInLine(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
                return result;
            }
            // Collect results from first line
            const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1);
            resultLen = this._findMatchesInLine(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
            // Collect results from middle lines
            for (let lineNumber = searchRange.startLineNumber + 1; lineNumber < searchRange.endLineNumber && resultLen < limitResultCount; lineNumber++) {
                resultLen = this._findMatchesInLine(searchData, model.getLineContent(lineNumber), lineNumber, 0, resultLen, result, captureMatches, limitResultCount);
            }
            // Collect results from last line
            if (resultLen < limitResultCount) {
                const text = model.getLineContent(searchRange.endLineNumber).substring(0, searchRange.endColumn - 1);
                resultLen = this._findMatchesInLine(searchData, text, searchRange.endLineNumber, 0, resultLen, result, captureMatches, limitResultCount);
            }
            return result;
        }
        static _findMatchesInLine(searchData, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
            const wordSeparators = searchData.wordSeparators;
            if (!captureMatches && searchData.simpleSearch) {
                const searchString = searchData.simpleSearch;
                const searchStringLen = searchString.length;
                const textLength = text.length;
                let lastMatchIndex = -searchStringLen;
                while ((lastMatchIndex = text.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
                    if (!wordSeparators || isValidMatch(wordSeparators, text, textLength, lastMatchIndex, searchStringLen)) {
                        result[resultLen++] = new model_1.FindMatch(new range_1.Range(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
                        if (resultLen >= limitResultCount) {
                            return resultLen;
                        }
                    }
                }
                return resultLen;
            }
            const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
            let m;
            // Reset regex to search from the beginning
            searcher.reset(0);
            do {
                m = searcher.next(text);
                if (m) {
                    result[resultLen++] = createFindMatch(new range_1.Range(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            } while (m);
            return resultLen;
        }
        static findNextMatch(model, searchParams, searchStart, captureMatches) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return null;
            }
            const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
            if (searchData.regex.multiline) {
                return this._doFindNextMatchMultiline(model, searchStart, searcher, captureMatches);
            }
            return this._doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches);
        }
        static _doFindNextMatchMultiline(model, searchStart, searcher, captureMatches) {
            const searchTextStart = new position_1.Position(searchStart.lineNumber, 1);
            const deltaOffset = model.getOffsetAt(searchTextStart);
            const lineCount = model.getLineCount();
            // We always execute multiline search over the lines joined with \n
            // This makes it that \n will match the EOL for both CRLF and LF models
            // We compensate for offset errors in `_getMultilineMatchRange`
            const text = model.getValueInRange(new range_1.Range(searchTextStart.lineNumber, searchTextStart.column, lineCount, model.getLineMaxColumn(lineCount)), 1 /* LF */);
            const lfCounter = (model.getEOL() === '\r\n' ? new LineFeedCounter(text) : null);
            searcher.reset(searchStart.column - 1);
            let m = searcher.next(text);
            if (m) {
                return createFindMatch(this._getMultilineMatchRange(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
            }
            if (searchStart.lineNumber !== 1 || searchStart.column !== 1) {
                // Try again from the top
                return this._doFindNextMatchMultiline(model, new position_1.Position(1, 1), searcher, captureMatches);
            }
            return null;
        }
        static _doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches) {
            const lineCount = model.getLineCount();
            const startLineNumber = searchStart.lineNumber;
            // Look in first line
            const text = model.getLineContent(startLineNumber);
            const r = this._findFirstMatchInLine(searcher, text, startLineNumber, searchStart.column, captureMatches);
            if (r) {
                return r;
            }
            for (let i = 1; i <= lineCount; i++) {
                const lineIndex = (startLineNumber + i - 1) % lineCount;
                const text = model.getLineContent(lineIndex + 1);
                const r = this._findFirstMatchInLine(searcher, text, lineIndex + 1, 1, captureMatches);
                if (r) {
                    return r;
                }
            }
            return null;
        }
        static _findFirstMatchInLine(searcher, text, lineNumber, fromColumn, captureMatches) {
            // Set regex to search from column
            searcher.reset(fromColumn - 1);
            const m = searcher.next(text);
            if (m) {
                return createFindMatch(new range_1.Range(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
            }
            return null;
        }
        static findPreviousMatch(model, searchParams, searchStart, captureMatches) {
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return null;
            }
            const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
            if (searchData.regex.multiline) {
                return this._doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches);
            }
            return this._doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches);
        }
        static _doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches) {
            const matches = this._doFindMatchesMultiline(model, new range_1.Range(1, 1, searchStart.lineNumber, searchStart.column), searcher, captureMatches, 10 * LIMIT_FIND_COUNT);
            if (matches.length > 0) {
                return matches[matches.length - 1];
            }
            const lineCount = model.getLineCount();
            if (searchStart.lineNumber !== lineCount || searchStart.column !== model.getLineMaxColumn(lineCount)) {
                // Try again with all content
                return this._doFindPreviousMatchMultiline(model, new position_1.Position(lineCount, model.getLineMaxColumn(lineCount)), searcher, captureMatches);
            }
            return null;
        }
        static _doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches) {
            const lineCount = model.getLineCount();
            const startLineNumber = searchStart.lineNumber;
            // Look in first line
            const text = model.getLineContent(startLineNumber).substring(0, searchStart.column - 1);
            const r = this._findLastMatchInLine(searcher, text, startLineNumber, captureMatches);
            if (r) {
                return r;
            }
            for (let i = 1; i <= lineCount; i++) {
                const lineIndex = (lineCount + startLineNumber - i - 1) % lineCount;
                const text = model.getLineContent(lineIndex + 1);
                const r = this._findLastMatchInLine(searcher, text, lineIndex + 1, captureMatches);
                if (r) {
                    return r;
                }
            }
            return null;
        }
        static _findLastMatchInLine(searcher, text, lineNumber, captureMatches) {
            let bestResult = null;
            let m;
            searcher.reset(0);
            while ((m = searcher.next(text))) {
                bestResult = createFindMatch(new range_1.Range(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
            }
            return bestResult;
        }
    }
    exports.TextModelSearch = TextModelSearch;
    function leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
        if (matchStartIndex === 0) {
            // Match starts at start of string
            return true;
        }
        const charBefore = text.charCodeAt(matchStartIndex - 1);
        if (wordSeparators.get(charBefore) !== 0 /* Regular */) {
            // The character before the match is a word separator
            return true;
        }
        if (charBefore === 13 /* CarriageReturn */ || charBefore === 10 /* LineFeed */) {
            // The character before the match is line break or carriage return.
            return true;
        }
        if (matchLength > 0) {
            const firstCharInMatch = text.charCodeAt(matchStartIndex);
            if (wordSeparators.get(firstCharInMatch) !== 0 /* Regular */) {
                // The first character inside the match is a word separator
                return true;
            }
        }
        return false;
    }
    function rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
        if (matchStartIndex + matchLength === textLength) {
            // Match ends at end of string
            return true;
        }
        const charAfter = text.charCodeAt(matchStartIndex + matchLength);
        if (wordSeparators.get(charAfter) !== 0 /* Regular */) {
            // The character after the match is a word separator
            return true;
        }
        if (charAfter === 13 /* CarriageReturn */ || charAfter === 10 /* LineFeed */) {
            // The character after the match is line break or carriage return.
            return true;
        }
        if (matchLength > 0) {
            const lastCharInMatch = text.charCodeAt(matchStartIndex + matchLength - 1);
            if (wordSeparators.get(lastCharInMatch) !== 0 /* Regular */) {
                // The last character in the match is a word separator
                return true;
            }
        }
        return false;
    }
    function isValidMatch(wordSeparators, text, textLength, matchStartIndex, matchLength) {
        return (leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength)
            && rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength));
    }
    exports.isValidMatch = isValidMatch;
    class Searcher {
        constructor(wordSeparators, searchRegex) {
            this._wordSeparators = wordSeparators;
            this._searchRegex = searchRegex;
            this._prevMatchStartIndex = -1;
            this._prevMatchLength = 0;
        }
        reset(lastIndex) {
            this._searchRegex.lastIndex = lastIndex;
            this._prevMatchStartIndex = -1;
            this._prevMatchLength = 0;
        }
        next(text) {
            const textLength = text.length;
            let m;
            do {
                if (this._prevMatchStartIndex + this._prevMatchLength === textLength) {
                    // Reached the end of the line
                    return null;
                }
                m = this._searchRegex.exec(text);
                if (!m) {
                    return null;
                }
                const matchStartIndex = m.index;
                const matchLength = m[0].length;
                if (matchStartIndex === this._prevMatchStartIndex && matchLength === this._prevMatchLength) {
                    if (matchLength === 0) {
                        // the search result is an empty string and won't advance `regex.lastIndex`, so `regex.exec` will stuck here
                        // we attempt to recover from that by advancing by two if surrogate pair found and by one otherwise
                        if (strings.getNextCodePoint(text, textLength, this._searchRegex.lastIndex) > 0xFFFF) {
                            this._searchRegex.lastIndex += 2;
                        }
                        else {
                            this._searchRegex.lastIndex += 1;
                        }
                        continue;
                    }
                    // Exit early if the regex matches the same range twice
                    return null;
                }
                this._prevMatchStartIndex = matchStartIndex;
                this._prevMatchLength = matchLength;
                if (!this._wordSeparators || isValidMatch(this._wordSeparators, text, textLength, matchStartIndex, matchLength)) {
                    return m;
                }
            } while (m);
            return null;
        }
    }
    exports.Searcher = Searcher;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[20/*vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase*/], __M([0/*require*/,1/*exports*/,10/*vs/editor/common/core/position*/,7/*vs/editor/common/core/range*/,13/*vs/editor/common/model*/,40/*vs/editor/common/model/pieceTreeTextBuffer/rbTreeBase*/,42/*vs/editor/common/model/textModelSearch*/]), function (require, exports, position_1, range_1, model_1, rbTreeBase_1, textModelSearch_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PieceTreeBase = exports.StringBuffer = exports.Piece = exports.createLineStarts = exports.createLineStartsFast = exports.LineStarts = exports.createUintArray = exports.AverageBufferSize = void 0;
    // const lfRegex = new RegExp(/\r\n|\r|\n/g);
    exports.AverageBufferSize = 65535;
    function createUintArray(arr) {
        let r;
        if (arr[arr.length - 1] < 65536) {
            r = new Uint16Array(arr.length);
        }
        else {
            r = new Uint32Array(arr.length);
        }
        r.set(arr, 0);
        return r;
    }
    exports.createUintArray = createUintArray;
    class LineStarts {
        constructor(lineStarts, cr, lf, crlf, isBasicASCII) {
            this.lineStarts = lineStarts;
            this.cr = cr;
            this.lf = lf;
            this.crlf = crlf;
            this.isBasicASCII = isBasicASCII;
        }
    }
    exports.LineStarts = LineStarts;
    function createLineStartsFast(str, readonly = true) {
        let r = [0], rLength = 1;
        for (let i = 0, len = str.length; i < len; i++) {
            const chr = str.charCodeAt(i);
            if (chr === 13 /* CarriageReturn */) {
                if (i + 1 < len && str.charCodeAt(i + 1) === 10 /* LineFeed */) {
                    // \r\n... case
                    r[rLength++] = i + 2;
                    i++; // skip \n
                }
                else {
                    // \r... case
                    r[rLength++] = i + 1;
                }
            }
            else if (chr === 10 /* LineFeed */) {
                r[rLength++] = i + 1;
            }
        }
        if (readonly) {
            return createUintArray(r);
        }
        else {
            return r;
        }
    }
    exports.createLineStartsFast = createLineStartsFast;
    function createLineStarts(r, str) {
        r.length = 0;
        r[0] = 0;
        let rLength = 1;
        let cr = 0, lf = 0, crlf = 0;
        let isBasicASCII = true;
        for (let i = 0, len = str.length; i < len; i++) {
            const chr = str.charCodeAt(i);
            if (chr === 13 /* CarriageReturn */) {
                if (i + 1 < len && str.charCodeAt(i + 1) === 10 /* LineFeed */) {
                    // \r\n... case
                    crlf++;
                    r[rLength++] = i + 2;
                    i++; // skip \n
                }
                else {
                    cr++;
                    // \r... case
                    r[rLength++] = i + 1;
                }
            }
            else if (chr === 10 /* LineFeed */) {
                lf++;
                r[rLength++] = i + 1;
            }
            else {
                if (isBasicASCII) {
                    if (chr !== 9 /* Tab */ && (chr < 32 || chr > 126)) {
                        isBasicASCII = false;
                    }
                }
            }
        }
        const result = new LineStarts(createUintArray(r), cr, lf, crlf, isBasicASCII);
        r.length = 0;
        return result;
    }
    exports.createLineStarts = createLineStarts;
    class Piece {
        constructor(bufferIndex, start, end, lineFeedCnt, length) {
            this.bufferIndex = bufferIndex;
            this.start = start;
            this.end = end;
            this.lineFeedCnt = lineFeedCnt;
            this.length = length;
        }
    }
    exports.Piece = Piece;
    class StringBuffer {
        constructor(buffer, lineStarts) {
            this.buffer = buffer;
            this.lineStarts = lineStarts;
        }
    }
    exports.StringBuffer = StringBuffer;
    /**
     * Readonly snapshot for piece tree.
     * In a real multiple thread environment, to make snapshot reading always work correctly, we need to
     * 1. Make TreeNode.piece immutable, then reading and writing can run in parallel.
     * 2. TreeNode/Buffers normalization should not happen during snapshot reading.
     */
    class PieceTreeSnapshot {
        constructor(tree, BOM) {
            this._pieces = [];
            this._tree = tree;
            this._BOM = BOM;
            this._index = 0;
            if (tree.root !== rbTreeBase_1.SENTINEL) {
                tree.iterate(tree.root, node => {
                    if (node !== rbTreeBase_1.SENTINEL) {
                        this._pieces.push(node.piece);
                    }
                    return true;
                });
            }
        }
        read() {
            if (this._pieces.length === 0) {
                if (this._index === 0) {
                    this._index++;
                    return this._BOM;
                }
                else {
                    return null;
                }
            }
            if (this._index > this._pieces.length - 1) {
                return null;
            }
            if (this._index === 0) {
                return this._BOM + this._tree.getPieceContent(this._pieces[this._index++]);
            }
            return this._tree.getPieceContent(this._pieces[this._index++]);
        }
    }
    class PieceTreeSearchCache {
        constructor(limit) {
            this._limit = limit;
            this._cache = [];
        }
        get(offset) {
            for (let i = this._cache.length - 1; i >= 0; i--) {
                let nodePos = this._cache[i];
                if (nodePos.nodeStartOffset <= offset && nodePos.nodeStartOffset + nodePos.node.piece.length >= offset) {
                    return nodePos;
                }
            }
            return null;
        }
        get2(lineNumber) {
            for (let i = this._cache.length - 1; i >= 0; i--) {
                let nodePos = this._cache[i];
                if (nodePos.nodeStartLineNumber && nodePos.nodeStartLineNumber < lineNumber && nodePos.nodeStartLineNumber + nodePos.node.piece.lineFeedCnt >= lineNumber) {
                    return nodePos;
                }
            }
            return null;
        }
        set(nodePosition) {
            if (this._cache.length >= this._limit) {
                this._cache.shift();
            }
            this._cache.push(nodePosition);
        }
        validate(offset) {
            let hasInvalidVal = false;
            let tmp = this._cache;
            for (let i = 0; i < tmp.length; i++) {
                let nodePos = tmp[i];
                if (nodePos.node.parent === null || nodePos.nodeStartOffset >= offset) {
                    tmp[i] = null;
                    hasInvalidVal = true;
                    continue;
                }
            }
            if (hasInvalidVal) {
                let newArr = [];
                for (const entry of tmp) {
                    if (entry !== null) {
                        newArr.push(entry);
                    }
                }
                this._cache = newArr;
            }
        }
    }
    class PieceTreeBase {
        constructor(chunks, eol, eolNormalized) {
            this.create(chunks, eol, eolNormalized);
        }
        create(chunks, eol, eolNormalized) {
            this._buffers = [
                new StringBuffer('', [0])
            ];
            this._lastChangeBufferPos = { line: 0, column: 0 };
            this.root = rbTreeBase_1.SENTINEL;
            this._lineCnt = 1;
            this._length = 0;
            this._EOL = eol;
            this._EOLLength = eol.length;
            this._EOLNormalized = eolNormalized;
            let lastNode = null;
            for (let i = 0, len = chunks.length; i < len; i++) {
                if (chunks[i].buffer.length > 0) {
                    if (!chunks[i].lineStarts) {
                        chunks[i].lineStarts = createLineStartsFast(chunks[i].buffer);
                    }
                    let piece = new Piece(i + 1, { line: 0, column: 0 }, { line: chunks[i].lineStarts.length - 1, column: chunks[i].buffer.length - chunks[i].lineStarts[chunks[i].lineStarts.length - 1] }, chunks[i].lineStarts.length - 1, chunks[i].buffer.length);
                    this._buffers.push(chunks[i]);
                    lastNode = this.rbInsertRight(lastNode, piece);
                }
            }
            this._searchCache = new PieceTreeSearchCache(1);
            this._lastVisitedLine = { lineNumber: 0, value: '' };
            this.computeBufferMetadata();
        }
        normalizeEOL(eol) {
            let averageBufferSize = exports.AverageBufferSize;
            let min = averageBufferSize - Math.floor(averageBufferSize / 3);
            let max = min * 2;
            let tempChunk = '';
            let tempChunkLen = 0;
            let chunks = [];
            this.iterate(this.root, node => {
                let str = this.getNodeContent(node);
                let len = str.length;
                if (tempChunkLen <= min || tempChunkLen + len < max) {
                    tempChunk += str;
                    tempChunkLen += len;
                    return true;
                }
                // flush anyways
                let text = tempChunk.replace(/\r\n|\r|\n/g, eol);
                chunks.push(new StringBuffer(text, createLineStartsFast(text)));
                tempChunk = str;
                tempChunkLen = len;
                return true;
            });
            if (tempChunkLen > 0) {
                let text = tempChunk.replace(/\r\n|\r|\n/g, eol);
                chunks.push(new StringBuffer(text, createLineStartsFast(text)));
            }
            this.create(chunks, eol, true);
        }
        // #region Buffer API
        getEOL() {
            return this._EOL;
        }
        setEOL(newEOL) {
            this._EOL = newEOL;
            this._EOLLength = this._EOL.length;
            this.normalizeEOL(newEOL);
        }
        createSnapshot(BOM) {
            return new PieceTreeSnapshot(this, BOM);
        }
        equal(other) {
            if (this.getLength() !== other.getLength()) {
                return false;
            }
            if (this.getLineCount() !== other.getLineCount()) {
                return false;
            }
            let offset = 0;
            let ret = this.iterate(this.root, node => {
                if (node === rbTreeBase_1.SENTINEL) {
                    return true;
                }
                let str = this.getNodeContent(node);
                let len = str.length;
                let startPosition = other.nodeAt(offset);
                let endPosition = other.nodeAt(offset + len);
                let val = other.getValueInRange2(startPosition, endPosition);
                return str === val;
            });
            return ret;
        }
        getOffsetAt(lineNumber, column) {
            let leftLen = 0; // inorder
            let x = this.root;
            while (x !== rbTreeBase_1.SENTINEL) {
                if (x.left !== rbTreeBase_1.SENTINEL && x.lf_left + 1 >= lineNumber) {
                    x = x.left;
                }
                else if (x.lf_left + x.piece.lineFeedCnt + 1 >= lineNumber) {
                    leftLen += x.size_left;
                    // lineNumber >= 2
                    let accumualtedValInCurrentIndex = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                    return leftLen += accumualtedValInCurrentIndex + column - 1;
                }
                else {
                    lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                    leftLen += x.size_left + x.piece.length;
                    x = x.right;
                }
            }
            return leftLen;
        }
        getPositionAt(offset) {
            offset = Math.floor(offset);
            offset = Math.max(0, offset);
            let x = this.root;
            let lfCnt = 0;
            let originalOffset = offset;
            while (x !== rbTreeBase_1.SENTINEL) {
                if (x.size_left !== 0 && x.size_left >= offset) {
                    x = x.left;
                }
                else if (x.size_left + x.piece.length >= offset) {
                    let out = this.getIndexOf(x, offset - x.size_left);
                    lfCnt += x.lf_left + out.index;
                    if (out.index === 0) {
                        let lineStartOffset = this.getOffsetAt(lfCnt + 1, 1);
                        let column = originalOffset - lineStartOffset;
                        return new position_1.Position(lfCnt + 1, column + 1);
                    }
                    return new position_1.Position(lfCnt + 1, out.remainder + 1);
                }
                else {
                    offset -= x.size_left + x.piece.length;
                    lfCnt += x.lf_left + x.piece.lineFeedCnt;
                    if (x.right === rbTreeBase_1.SENTINEL) {
                        // last node
                        let lineStartOffset = this.getOffsetAt(lfCnt + 1, 1);
                        let column = originalOffset - offset - lineStartOffset;
                        return new position_1.Position(lfCnt + 1, column + 1);
                    }
                    else {
                        x = x.right;
                    }
                }
            }
            return new position_1.Position(1, 1);
        }
        getValueInRange(range, eol) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                return '';
            }
            let startPosition = this.nodeAt2(range.startLineNumber, range.startColumn);
            let endPosition = this.nodeAt2(range.endLineNumber, range.endColumn);
            let value = this.getValueInRange2(startPosition, endPosition);
            if (eol) {
                if (eol !== this._EOL || !this._EOLNormalized) {
                    return value.replace(/\r\n|\r|\n/g, eol);
                }
                if (eol === this.getEOL() && this._EOLNormalized) {
                    if (eol === '\r\n') {
                    }
                    return value;
                }
                return value.replace(/\r\n|\r|\n/g, eol);
            }
            return value;
        }
        getValueInRange2(startPosition, endPosition) {
            if (startPosition.node === endPosition.node) {
                let node = startPosition.node;
                let buffer = this._buffers[node.piece.bufferIndex].buffer;
                let startOffset = this.offsetInBuffer(node.piece.bufferIndex, node.piece.start);
                return buffer.substring(startOffset + startPosition.remainder, startOffset + endPosition.remainder);
            }
            let x = startPosition.node;
            let buffer = this._buffers[x.piece.bufferIndex].buffer;
            let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
            let ret = buffer.substring(startOffset + startPosition.remainder, startOffset + x.piece.length);
            x = x.next();
            while (x !== rbTreeBase_1.SENTINEL) {
                let buffer = this._buffers[x.piece.bufferIndex].buffer;
                let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                if (x === endPosition.node) {
                    ret += buffer.substring(startOffset, startOffset + endPosition.remainder);
                    break;
                }
                else {
                    ret += buffer.substr(startOffset, x.piece.length);
                }
                x = x.next();
            }
            return ret;
        }
        getLinesContent() {
            let lines = [];
            let linesLength = 0;
            let currentLine = '';
            let danglingCR = false;
            this.iterate(this.root, node => {
                if (node === rbTreeBase_1.SENTINEL) {
                    return true;
                }
                const piece = node.piece;
                let pieceLength = piece.length;
                if (pieceLength === 0) {
                    return true;
                }
                const buffer = this._buffers[piece.bufferIndex].buffer;
                const lineStarts = this._buffers[piece.bufferIndex].lineStarts;
                const pieceStartLine = piece.start.line;
                const pieceEndLine = piece.end.line;
                let pieceStartOffset = lineStarts[pieceStartLine] + piece.start.column;
                if (danglingCR) {
                    if (buffer.charCodeAt(pieceStartOffset) === 10 /* LineFeed */) {
                        // pretend the \n was in the previous piece..
                        pieceStartOffset++;
                        pieceLength--;
                    }
                    lines[linesLength++] = currentLine;
                    currentLine = '';
                    danglingCR = false;
                    if (pieceLength === 0) {
                        return true;
                    }
                }
                if (pieceStartLine === pieceEndLine) {
                    // this piece has no new lines
                    if (!this._EOLNormalized && buffer.charCodeAt(pieceStartOffset + pieceLength - 1) === 13 /* CarriageReturn */) {
                        danglingCR = true;
                        currentLine += buffer.substr(pieceStartOffset, pieceLength - 1);
                    }
                    else {
                        currentLine += buffer.substr(pieceStartOffset, pieceLength);
                    }
                    return true;
                }
                // add the text before the first line start in this piece
                currentLine += (this._EOLNormalized
                    ? buffer.substring(pieceStartOffset, Math.max(pieceStartOffset, lineStarts[pieceStartLine + 1] - this._EOLLength))
                    : buffer.substring(pieceStartOffset, lineStarts[pieceStartLine + 1]).replace(/(\r\n|\r|\n)$/, ''));
                lines[linesLength++] = currentLine;
                for (let line = pieceStartLine + 1; line < pieceEndLine; line++) {
                    currentLine = (this._EOLNormalized
                        ? buffer.substring(lineStarts[line], lineStarts[line + 1] - this._EOLLength)
                        : buffer.substring(lineStarts[line], lineStarts[line + 1]).replace(/(\r\n|\r|\n)$/, ''));
                    lines[linesLength++] = currentLine;
                }
                if (!this._EOLNormalized && buffer.charCodeAt(lineStarts[pieceEndLine] + piece.end.column - 1) === 13 /* CarriageReturn */) {
                    danglingCR = true;
                    if (piece.end.column === 0) {
                        // The last line ended with a \r, let's undo the push, it will be pushed by next iteration
                        linesLength--;
                    }
                    else {
                        currentLine = buffer.substr(lineStarts[pieceEndLine], piece.end.column - 1);
                    }
                }
                else {
                    currentLine = buffer.substr(lineStarts[pieceEndLine], piece.end.column);
                }
                return true;
            });
            if (danglingCR) {
                lines[linesLength++] = currentLine;
                currentLine = '';
            }
            lines[linesLength++] = currentLine;
            return lines;
        }
        getLength() {
            return this._length;
        }
        getLineCount() {
            return this._lineCnt;
        }
        getLineContent(lineNumber) {
            if (this._lastVisitedLine.lineNumber === lineNumber) {
                return this._lastVisitedLine.value;
            }
            this._lastVisitedLine.lineNumber = lineNumber;
            if (lineNumber === this._lineCnt) {
                this._lastVisitedLine.value = this.getLineRawContent(lineNumber);
            }
            else if (this._EOLNormalized) {
                this._lastVisitedLine.value = this.getLineRawContent(lineNumber, this._EOLLength);
            }
            else {
                this._lastVisitedLine.value = this.getLineRawContent(lineNumber).replace(/(\r\n|\r|\n)$/, '');
            }
            return this._lastVisitedLine.value;
        }
        _getCharCode(nodePos) {
            if (nodePos.remainder === nodePos.node.piece.length) {
                // the char we want to fetch is at the head of next node.
                let matchingNode = nodePos.node.next();
                if (!matchingNode) {
                    return 0;
                }
                let buffer = this._buffers[matchingNode.piece.bufferIndex];
                let startOffset = this.offsetInBuffer(matchingNode.piece.bufferIndex, matchingNode.piece.start);
                return buffer.buffer.charCodeAt(startOffset);
            }
            else {
                let buffer = this._buffers[nodePos.node.piece.bufferIndex];
                let startOffset = this.offsetInBuffer(nodePos.node.piece.bufferIndex, nodePos.node.piece.start);
                let targetOffset = startOffset + nodePos.remainder;
                return buffer.buffer.charCodeAt(targetOffset);
            }
        }
        getLineCharCode(lineNumber, index) {
            let nodePos = this.nodeAt2(lineNumber, index + 1);
            return this._getCharCode(nodePos);
        }
        getLineLength(lineNumber) {
            if (lineNumber === this.getLineCount()) {
                let startOffset = this.getOffsetAt(lineNumber, 1);
                return this.getLength() - startOffset;
            }
            return this.getOffsetAt(lineNumber + 1, 1) - this.getOffsetAt(lineNumber, 1) - this._EOLLength;
        }
        getCharCode(offset) {
            let nodePos = this.nodeAt(offset);
            return this._getCharCode(nodePos);
        }
        findMatchesInNode(node, searcher, startLineNumber, startColumn, startCursor, endCursor, searchData, captureMatches, limitResultCount, resultLen, result) {
            let buffer = this._buffers[node.piece.bufferIndex];
            let startOffsetInBuffer = this.offsetInBuffer(node.piece.bufferIndex, node.piece.start);
            let start = this.offsetInBuffer(node.piece.bufferIndex, startCursor);
            let end = this.offsetInBuffer(node.piece.bufferIndex, endCursor);
            let m;
            // Reset regex to search from the beginning
            let ret = { line: 0, column: 0 };
            let searchText;
            let offsetInBuffer;
            if (searcher._wordSeparators) {
                searchText = buffer.buffer.substring(start, end);
                offsetInBuffer = (offset) => offset + start;
                searcher.reset(0);
            }
            else {
                searchText = buffer.buffer;
                offsetInBuffer = (offset) => offset;
                searcher.reset(start);
            }
            do {
                m = searcher.next(searchText);
                if (m) {
                    if (offsetInBuffer(m.index) >= end) {
                        return resultLen;
                    }
                    this.positionInBuffer(node, offsetInBuffer(m.index) - startOffsetInBuffer, ret);
                    let lineFeedCnt = this.getLineFeedCnt(node.piece.bufferIndex, startCursor, ret);
                    let retStartColumn = ret.line === startCursor.line ? ret.column - startCursor.column + startColumn : ret.column + 1;
                    let retEndColumn = retStartColumn + m[0].length;
                    result[resultLen++] = (0, textModelSearch_1.createFindMatch)(new range_1.Range(startLineNumber + lineFeedCnt, retStartColumn, startLineNumber + lineFeedCnt, retEndColumn), m, captureMatches);
                    if (offsetInBuffer(m.index) + m[0].length >= end) {
                        return resultLen;
                    }
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            } while (m);
            return resultLen;
        }
        findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
            const result = [];
            let resultLen = 0;
            const searcher = new textModelSearch_1.Searcher(searchData.wordSeparators, searchData.regex);
            let startPosition = this.nodeAt2(searchRange.startLineNumber, searchRange.startColumn);
            if (startPosition === null) {
                return [];
            }
            let endPosition = this.nodeAt2(searchRange.endLineNumber, searchRange.endColumn);
            if (endPosition === null) {
                return [];
            }
            let start = this.positionInBuffer(startPosition.node, startPosition.remainder);
            let end = this.positionInBuffer(endPosition.node, endPosition.remainder);
            if (startPosition.node === endPosition.node) {
                this.findMatchesInNode(startPosition.node, searcher, searchRange.startLineNumber, searchRange.startColumn, start, end, searchData, captureMatches, limitResultCount, resultLen, result);
                return result;
            }
            let startLineNumber = searchRange.startLineNumber;
            let currentNode = startPosition.node;
            while (currentNode !== endPosition.node) {
                let lineBreakCnt = this.getLineFeedCnt(currentNode.piece.bufferIndex, start, currentNode.piece.end);
                if (lineBreakCnt >= 1) {
                    // last line break position
                    let lineStarts = this._buffers[currentNode.piece.bufferIndex].lineStarts;
                    let startOffsetInBuffer = this.offsetInBuffer(currentNode.piece.bufferIndex, currentNode.piece.start);
                    let nextLineStartOffset = lineStarts[start.line + lineBreakCnt];
                    let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn : 1;
                    resultLen = this.findMatchesInNode(currentNode, searcher, startLineNumber, startColumn, start, this.positionInBuffer(currentNode, nextLineStartOffset - startOffsetInBuffer), searchData, captureMatches, limitResultCount, resultLen, result);
                    if (resultLen >= limitResultCount) {
                        return result;
                    }
                    startLineNumber += lineBreakCnt;
                }
                let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn - 1 : 0;
                // search for the remaining content
                if (startLineNumber === searchRange.endLineNumber) {
                    const text = this.getLineContent(startLineNumber).substring(startColumn, searchRange.endColumn - 1);
                    resultLen = this._findMatchesInLine(searchData, searcher, text, searchRange.endLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
                    return result;
                }
                resultLen = this._findMatchesInLine(searchData, searcher, this.getLineContent(startLineNumber).substr(startColumn), startLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
                if (resultLen >= limitResultCount) {
                    return result;
                }
                startLineNumber++;
                startPosition = this.nodeAt2(startLineNumber, 1);
                currentNode = startPosition.node;
                start = this.positionInBuffer(startPosition.node, startPosition.remainder);
            }
            if (startLineNumber === searchRange.endLineNumber) {
                let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn - 1 : 0;
                const text = this.getLineContent(startLineNumber).substring(startColumn, searchRange.endColumn - 1);
                resultLen = this._findMatchesInLine(searchData, searcher, text, searchRange.endLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
                return result;
            }
            let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn : 1;
            resultLen = this.findMatchesInNode(endPosition.node, searcher, startLineNumber, startColumn, start, end, searchData, captureMatches, limitResultCount, resultLen, result);
            return result;
        }
        _findMatchesInLine(searchData, searcher, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
            const wordSeparators = searchData.wordSeparators;
            if (!captureMatches && searchData.simpleSearch) {
                const searchString = searchData.simpleSearch;
                const searchStringLen = searchString.length;
                const textLength = text.length;
                let lastMatchIndex = -searchStringLen;
                while ((lastMatchIndex = text.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
                    if (!wordSeparators || (0, textModelSearch_1.isValidMatch)(wordSeparators, text, textLength, lastMatchIndex, searchStringLen)) {
                        result[resultLen++] = new model_1.FindMatch(new range_1.Range(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
                        if (resultLen >= limitResultCount) {
                            return resultLen;
                        }
                    }
                }
                return resultLen;
            }
            let m;
            // Reset regex to search from the beginning
            searcher.reset(0);
            do {
                m = searcher.next(text);
                if (m) {
                    result[resultLen++] = (0, textModelSearch_1.createFindMatch)(new range_1.Range(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            } while (m);
            return resultLen;
        }
        // #endregion
        // #region Piece Table
        insert(offset, value, eolNormalized = false) {
            this._EOLNormalized = this._EOLNormalized && eolNormalized;
            this._lastVisitedLine.lineNumber = 0;
            this._lastVisitedLine.value = '';
            if (this.root !== rbTreeBase_1.SENTINEL) {
                let { node, remainder, nodeStartOffset } = this.nodeAt(offset);
                let piece = node.piece;
                let bufferIndex = piece.bufferIndex;
                let insertPosInBuffer = this.positionInBuffer(node, remainder);
                if (node.piece.bufferIndex === 0 &&
                    piece.end.line === this._lastChangeBufferPos.line &&
                    piece.end.column === this._lastChangeBufferPos.column &&
                    (nodeStartOffset + piece.length === offset) &&
                    value.length < exports.AverageBufferSize) {
                    // changed buffer
                    this.appendToNode(node, value);
                    this.computeBufferMetadata();
                    return;
                }
                if (nodeStartOffset === offset) {
                    this.insertContentToNodeLeft(value, node);
                    this._searchCache.validate(offset);
                }
                else if (nodeStartOffset + node.piece.length > offset) {
                    // we are inserting into the middle of a node.
                    let nodesToDel = [];
                    let newRightPiece = new Piece(piece.bufferIndex, insertPosInBuffer, piece.end, this.getLineFeedCnt(piece.bufferIndex, insertPosInBuffer, piece.end), this.offsetInBuffer(bufferIndex, piece.end) - this.offsetInBuffer(bufferIndex, insertPosInBuffer));
                    if (this.shouldCheckCRLF() && this.endWithCR(value)) {
                        let headOfRight = this.nodeCharCodeAt(node, remainder);
                        if (headOfRight === 10 /** \n */) {
                            let newStart = { line: newRightPiece.start.line + 1, column: 0 };
                            newRightPiece = new Piece(newRightPiece.bufferIndex, newStart, newRightPiece.end, this.getLineFeedCnt(newRightPiece.bufferIndex, newStart, newRightPiece.end), newRightPiece.length - 1);
                            value += '\n';
                        }
                    }
                    // reuse node for content before insertion point.
                    if (this.shouldCheckCRLF() && this.startWithLF(value)) {
                        let tailOfLeft = this.nodeCharCodeAt(node, remainder - 1);
                        if (tailOfLeft === 13 /** \r */) {
                            let previousPos = this.positionInBuffer(node, remainder - 1);
                            this.deleteNodeTail(node, previousPos);
                            value = '\r' + value;
                            if (node.piece.length === 0) {
                                nodesToDel.push(node);
                            }
                        }
                        else {
                            this.deleteNodeTail(node, insertPosInBuffer);
                        }
                    }
                    else {
                        this.deleteNodeTail(node, insertPosInBuffer);
                    }
                    let newPieces = this.createNewPieces(value);
                    if (newRightPiece.length > 0) {
                        this.rbInsertRight(node, newRightPiece);
                    }
                    let tmpNode = node;
                    for (let k = 0; k < newPieces.length; k++) {
                        tmpNode = this.rbInsertRight(tmpNode, newPieces[k]);
                    }
                    this.deleteNodes(nodesToDel);
                }
                else {
                    this.insertContentToNodeRight(value, node);
                }
            }
            else {
                // insert new node
                let pieces = this.createNewPieces(value);
                let node = this.rbInsertLeft(null, pieces[0]);
                for (let k = 1; k < pieces.length; k++) {
                    node = this.rbInsertRight(node, pieces[k]);
                }
            }
            // todo, this is too brutal. Total line feed count should be updated the same way as lf_left.
            this.computeBufferMetadata();
        }
        delete(offset, cnt) {
            this._lastVisitedLine.lineNumber = 0;
            this._lastVisitedLine.value = '';
            if (cnt <= 0 || this.root === rbTreeBase_1.SENTINEL) {
                return;
            }
            let startPosition = this.nodeAt(offset);
            let endPosition = this.nodeAt(offset + cnt);
            let startNode = startPosition.node;
            let endNode = endPosition.node;
            if (startNode === endNode) {
                let startSplitPosInBuffer = this.positionInBuffer(startNode, startPosition.remainder);
                let endSplitPosInBuffer = this.positionInBuffer(startNode, endPosition.remainder);
                if (startPosition.nodeStartOffset === offset) {
                    if (cnt === startNode.piece.length) { // delete node
                        let next = startNode.next();
                        (0, rbTreeBase_1.rbDelete)(this, startNode);
                        this.validateCRLFWithPrevNode(next);
                        this.computeBufferMetadata();
                        return;
                    }
                    this.deleteNodeHead(startNode, endSplitPosInBuffer);
                    this._searchCache.validate(offset);
                    this.validateCRLFWithPrevNode(startNode);
                    this.computeBufferMetadata();
                    return;
                }
                if (startPosition.nodeStartOffset + startNode.piece.length === offset + cnt) {
                    this.deleteNodeTail(startNode, startSplitPosInBuffer);
                    this.validateCRLFWithNextNode(startNode);
                    this.computeBufferMetadata();
                    return;
                }
                // delete content in the middle, this node will be splitted to nodes
                this.shrinkNode(startNode, startSplitPosInBuffer, endSplitPosInBuffer);
                this.computeBufferMetadata();
                return;
            }
            let nodesToDel = [];
            let startSplitPosInBuffer = this.positionInBuffer(startNode, startPosition.remainder);
            this.deleteNodeTail(startNode, startSplitPosInBuffer);
            this._searchCache.validate(offset);
            if (startNode.piece.length === 0) {
                nodesToDel.push(startNode);
            }
            // update last touched node
            let endSplitPosInBuffer = this.positionInBuffer(endNode, endPosition.remainder);
            this.deleteNodeHead(endNode, endSplitPosInBuffer);
            if (endNode.piece.length === 0) {
                nodesToDel.push(endNode);
            }
            // delete nodes in between
            let secondNode = startNode.next();
            for (let node = secondNode; node !== rbTreeBase_1.SENTINEL && node !== endNode; node = node.next()) {
                nodesToDel.push(node);
            }
            let prev = startNode.piece.length === 0 ? startNode.prev() : startNode;
            this.deleteNodes(nodesToDel);
            this.validateCRLFWithNextNode(prev);
            this.computeBufferMetadata();
        }
        insertContentToNodeLeft(value, node) {
            // we are inserting content to the beginning of node
            let nodesToDel = [];
            if (this.shouldCheckCRLF() && this.endWithCR(value) && this.startWithLF(node)) {
                // move `\n` to new node.
                let piece = node.piece;
                let newStart = { line: piece.start.line + 1, column: 0 };
                let nPiece = new Piece(piece.bufferIndex, newStart, piece.end, this.getLineFeedCnt(piece.bufferIndex, newStart, piece.end), piece.length - 1);
                node.piece = nPiece;
                value += '\n';
                (0, rbTreeBase_1.updateTreeMetadata)(this, node, -1, -1);
                if (node.piece.length === 0) {
                    nodesToDel.push(node);
                }
            }
            let newPieces = this.createNewPieces(value);
            let newNode = this.rbInsertLeft(node, newPieces[newPieces.length - 1]);
            for (let k = newPieces.length - 2; k >= 0; k--) {
                newNode = this.rbInsertLeft(newNode, newPieces[k]);
            }
            this.validateCRLFWithPrevNode(newNode);
            this.deleteNodes(nodesToDel);
        }
        insertContentToNodeRight(value, node) {
            // we are inserting to the right of this node.
            if (this.adjustCarriageReturnFromNext(value, node)) {
                // move \n to the new node.
                value += '\n';
            }
            let newPieces = this.createNewPieces(value);
            let newNode = this.rbInsertRight(node, newPieces[0]);
            let tmpNode = newNode;
            for (let k = 1; k < newPieces.length; k++) {
                tmpNode = this.rbInsertRight(tmpNode, newPieces[k]);
            }
            this.validateCRLFWithPrevNode(newNode);
        }
        positionInBuffer(node, remainder, ret) {
            let piece = node.piece;
            let bufferIndex = node.piece.bufferIndex;
            let lineStarts = this._buffers[bufferIndex].lineStarts;
            let startOffset = lineStarts[piece.start.line] + piece.start.column;
            let offset = startOffset + remainder;
            // binary search offset between startOffset and endOffset
            let low = piece.start.line;
            let high = piece.end.line;
            let mid = 0;
            let midStop = 0;
            let midStart = 0;
            while (low <= high) {
                mid = low + ((high - low) / 2) | 0;
                midStart = lineStarts[mid];
                if (mid === high) {
                    break;
                }
                midStop = lineStarts[mid + 1];
                if (offset < midStart) {
                    high = mid - 1;
                }
                else if (offset >= midStop) {
                    low = mid + 1;
                }
                else {
                    break;
                }
            }
            if (ret) {
                ret.line = mid;
                ret.column = offset - midStart;
                return null;
            }
            return {
                line: mid,
                column: offset - midStart
            };
        }
        getLineFeedCnt(bufferIndex, start, end) {
            // we don't need to worry about start: abc\r|\n, or abc|\r, or abc|\n, or abc|\r\n doesn't change the fact that, there is one line break after start.
            // now let's take care of end: abc\r|\n, if end is in between \r and \n, we need to add line feed count by 1
            if (end.column === 0) {
                return end.line - start.line;
            }
            let lineStarts = this._buffers[bufferIndex].lineStarts;
            if (end.line === lineStarts.length - 1) { // it means, there is no \n after end, otherwise, there will be one more lineStart.
                return end.line - start.line;
            }
            let nextLineStartOffset = lineStarts[end.line + 1];
            let endOffset = lineStarts[end.line] + end.column;
            if (nextLineStartOffset > endOffset + 1) { // there are more than 1 character after end, which means it can't be \n
                return end.line - start.line;
            }
            // endOffset + 1 === nextLineStartOffset
            // character at endOffset is \n, so we check the character before first
            // if character at endOffset is \r, end.column is 0 and we can't get here.
            let previousCharOffset = endOffset - 1; // end.column > 0 so it's okay.
            let buffer = this._buffers[bufferIndex].buffer;
            if (buffer.charCodeAt(previousCharOffset) === 13) {
                return end.line - start.line + 1;
            }
            else {
                return end.line - start.line;
            }
        }
        offsetInBuffer(bufferIndex, cursor) {
            let lineStarts = this._buffers[bufferIndex].lineStarts;
            return lineStarts[cursor.line] + cursor.column;
        }
        deleteNodes(nodes) {
            for (let i = 0; i < nodes.length; i++) {
                (0, rbTreeBase_1.rbDelete)(this, nodes[i]);
            }
        }
        createNewPieces(text) {
            if (text.length > exports.AverageBufferSize) {
                // the content is large, operations like substring, charCode becomes slow
                // so here we split it into smaller chunks, just like what we did for CR/LF normalization
                let newPieces = [];
                while (text.length > exports.AverageBufferSize) {
                    const lastChar = text.charCodeAt(exports.AverageBufferSize - 1);
                    let splitText;
                    if (lastChar === 13 /* CarriageReturn */ || (lastChar >= 0xD800 && lastChar <= 0xDBFF)) {
                        // last character is \r or a high surrogate => keep it back
                        splitText = text.substring(0, exports.AverageBufferSize - 1);
                        text = text.substring(exports.AverageBufferSize - 1);
                    }
                    else {
                        splitText = text.substring(0, exports.AverageBufferSize);
                        text = text.substring(exports.AverageBufferSize);
                    }
                    let lineStarts = createLineStartsFast(splitText);
                    newPieces.push(new Piece(this._buffers.length, /* buffer index */ { line: 0, column: 0 }, { line: lineStarts.length - 1, column: splitText.length - lineStarts[lineStarts.length - 1] }, lineStarts.length - 1, splitText.length));
                    this._buffers.push(new StringBuffer(splitText, lineStarts));
                }
                let lineStarts = createLineStartsFast(text);
                newPieces.push(new Piece(this._buffers.length, /* buffer index */ { line: 0, column: 0 }, { line: lineStarts.length - 1, column: text.length - lineStarts[lineStarts.length - 1] }, lineStarts.length - 1, text.length));
                this._buffers.push(new StringBuffer(text, lineStarts));
                return newPieces;
            }
            let startOffset = this._buffers[0].buffer.length;
            const lineStarts = createLineStartsFast(text, false);
            let start = this._lastChangeBufferPos;
            if (this._buffers[0].lineStarts[this._buffers[0].lineStarts.length - 1] === startOffset
                && startOffset !== 0
                && this.startWithLF(text)
                && this.endWithCR(this._buffers[0].buffer) // todo, we can check this._lastChangeBufferPos's column as it's the last one
            ) {
                this._lastChangeBufferPos = { line: this._lastChangeBufferPos.line, column: this._lastChangeBufferPos.column + 1 };
                start = this._lastChangeBufferPos;
                for (let i = 0; i < lineStarts.length; i++) {
                    lineStarts[i] += startOffset + 1;
                }
                this._buffers[0].lineStarts = this._buffers[0].lineStarts.concat(lineStarts.slice(1));
                this._buffers[0].buffer += '_' + text;
                startOffset += 1;
            }
            else {
                if (startOffset !== 0) {
                    for (let i = 0; i < lineStarts.length; i++) {
                        lineStarts[i] += startOffset;
                    }
                }
                this._buffers[0].lineStarts = this._buffers[0].lineStarts.concat(lineStarts.slice(1));
                this._buffers[0].buffer += text;
            }
            const endOffset = this._buffers[0].buffer.length;
            let endIndex = this._buffers[0].lineStarts.length - 1;
            let endColumn = endOffset - this._buffers[0].lineStarts[endIndex];
            let endPos = { line: endIndex, column: endColumn };
            let newPiece = new Piece(0, /** todo@peng */ start, endPos, this.getLineFeedCnt(0, start, endPos), endOffset - startOffset);
            this._lastChangeBufferPos = endPos;
            return [newPiece];
        }
        getLinesRawContent() {
            return this.getContentOfSubTree(this.root);
        }
        getLineRawContent(lineNumber, endOffset = 0) {
            let x = this.root;
            let ret = '';
            let cache = this._searchCache.get2(lineNumber);
            if (cache) {
                x = cache.node;
                let prevAccumulatedValue = this.getAccumulatedValue(x, lineNumber - cache.nodeStartLineNumber - 1);
                let buffer = this._buffers[x.piece.bufferIndex].buffer;
                let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                if (cache.nodeStartLineNumber + x.piece.lineFeedCnt === lineNumber) {
                    ret = buffer.substring(startOffset + prevAccumulatedValue, startOffset + x.piece.length);
                }
                else {
                    let accumulatedValue = this.getAccumulatedValue(x, lineNumber - cache.nodeStartLineNumber);
                    return buffer.substring(startOffset + prevAccumulatedValue, startOffset + accumulatedValue - endOffset);
                }
            }
            else {
                let nodeStartOffset = 0;
                const originalLineNumber = lineNumber;
                while (x !== rbTreeBase_1.SENTINEL) {
                    if (x.left !== rbTreeBase_1.SENTINEL && x.lf_left >= lineNumber - 1) {
                        x = x.left;
                    }
                    else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
                        let prevAccumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                        let accumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 1);
                        let buffer = this._buffers[x.piece.bufferIndex].buffer;
                        let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                        nodeStartOffset += x.size_left;
                        this._searchCache.set({
                            node: x,
                            nodeStartOffset,
                            nodeStartLineNumber: originalLineNumber - (lineNumber - 1 - x.lf_left)
                        });
                        return buffer.substring(startOffset + prevAccumulatedValue, startOffset + accumulatedValue - endOffset);
                    }
                    else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
                        let prevAccumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                        let buffer = this._buffers[x.piece.bufferIndex].buffer;
                        let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                        ret = buffer.substring(startOffset + prevAccumulatedValue, startOffset + x.piece.length);
                        break;
                    }
                    else {
                        lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                        nodeStartOffset += x.size_left + x.piece.length;
                        x = x.right;
                    }
                }
            }
            // search in order, to find the node contains end column
            x = x.next();
            while (x !== rbTreeBase_1.SENTINEL) {
                let buffer = this._buffers[x.piece.bufferIndex].buffer;
                if (x.piece.lineFeedCnt > 0) {
                    let accumulatedValue = this.getAccumulatedValue(x, 0);
                    let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                    ret += buffer.substring(startOffset, startOffset + accumulatedValue - endOffset);
                    return ret;
                }
                else {
                    let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                    ret += buffer.substr(startOffset, x.piece.length);
                }
                x = x.next();
            }
            return ret;
        }
        computeBufferMetadata() {
            let x = this.root;
            let lfCnt = 1;
            let len = 0;
            while (x !== rbTreeBase_1.SENTINEL) {
                lfCnt += x.lf_left + x.piece.lineFeedCnt;
                len += x.size_left + x.piece.length;
                x = x.right;
            }
            this._lineCnt = lfCnt;
            this._length = len;
            this._searchCache.validate(this._length);
        }
        // #region node operations
        getIndexOf(node, accumulatedValue) {
            let piece = node.piece;
            let pos = this.positionInBuffer(node, accumulatedValue);
            let lineCnt = pos.line - piece.start.line;
            if (this.offsetInBuffer(piece.bufferIndex, piece.end) - this.offsetInBuffer(piece.bufferIndex, piece.start) === accumulatedValue) {
                // we are checking the end of this node, so a CRLF check is necessary.
                let realLineCnt = this.getLineFeedCnt(node.piece.bufferIndex, piece.start, pos);
                if (realLineCnt !== lineCnt) {
                    // aha yes, CRLF
                    return { index: realLineCnt, remainder: 0 };
                }
            }
            return { index: lineCnt, remainder: pos.column };
        }
        getAccumulatedValue(node, index) {
            if (index < 0) {
                return 0;
            }
            let piece = node.piece;
            let lineStarts = this._buffers[piece.bufferIndex].lineStarts;
            let expectedLineStartIndex = piece.start.line + index + 1;
            if (expectedLineStartIndex > piece.end.line) {
                return lineStarts[piece.end.line] + piece.end.column - lineStarts[piece.start.line] - piece.start.column;
            }
            else {
                return lineStarts[expectedLineStartIndex] - lineStarts[piece.start.line] - piece.start.column;
            }
        }
        deleteNodeTail(node, pos) {
            const piece = node.piece;
            const originalLFCnt = piece.lineFeedCnt;
            const originalEndOffset = this.offsetInBuffer(piece.bufferIndex, piece.end);
            const newEnd = pos;
            const newEndOffset = this.offsetInBuffer(piece.bufferIndex, newEnd);
            const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, piece.start, newEnd);
            const lf_delta = newLineFeedCnt - originalLFCnt;
            const size_delta = newEndOffset - originalEndOffset;
            const newLength = piece.length + size_delta;
            node.piece = new Piece(piece.bufferIndex, piece.start, newEnd, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.updateTreeMetadata)(this, node, size_delta, lf_delta);
        }
        deleteNodeHead(node, pos) {
            const piece = node.piece;
            const originalLFCnt = piece.lineFeedCnt;
            const originalStartOffset = this.offsetInBuffer(piece.bufferIndex, piece.start);
            const newStart = pos;
            const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, newStart, piece.end);
            const newStartOffset = this.offsetInBuffer(piece.bufferIndex, newStart);
            const lf_delta = newLineFeedCnt - originalLFCnt;
            const size_delta = originalStartOffset - newStartOffset;
            const newLength = piece.length + size_delta;
            node.piece = new Piece(piece.bufferIndex, newStart, piece.end, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.updateTreeMetadata)(this, node, size_delta, lf_delta);
        }
        shrinkNode(node, start, end) {
            const piece = node.piece;
            const originalStartPos = piece.start;
            const originalEndPos = piece.end;
            // old piece, originalStartPos, start
            const oldLength = piece.length;
            const oldLFCnt = piece.lineFeedCnt;
            const newEnd = start;
            const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, piece.start, newEnd);
            const newLength = this.offsetInBuffer(piece.bufferIndex, start) - this.offsetInBuffer(piece.bufferIndex, originalStartPos);
            node.piece = new Piece(piece.bufferIndex, piece.start, newEnd, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.updateTreeMetadata)(this, node, newLength - oldLength, newLineFeedCnt - oldLFCnt);
            // new right piece, end, originalEndPos
            let newPiece = new Piece(piece.bufferIndex, end, originalEndPos, this.getLineFeedCnt(piece.bufferIndex, end, originalEndPos), this.offsetInBuffer(piece.bufferIndex, originalEndPos) - this.offsetInBuffer(piece.bufferIndex, end));
            let newNode = this.rbInsertRight(node, newPiece);
            this.validateCRLFWithPrevNode(newNode);
        }
        appendToNode(node, value) {
            if (this.adjustCarriageReturnFromNext(value, node)) {
                value += '\n';
            }
            const hitCRLF = this.shouldCheckCRLF() && this.startWithLF(value) && this.endWithCR(node);
            const startOffset = this._buffers[0].buffer.length;
            this._buffers[0].buffer += value;
            const lineStarts = createLineStartsFast(value, false);
            for (let i = 0; i < lineStarts.length; i++) {
                lineStarts[i] += startOffset;
            }
            if (hitCRLF) {
                let prevStartOffset = this._buffers[0].lineStarts[this._buffers[0].lineStarts.length - 2];
                this._buffers[0].lineStarts.pop();
                // _lastChangeBufferPos is already wrong
                this._lastChangeBufferPos = { line: this._lastChangeBufferPos.line - 1, column: startOffset - prevStartOffset };
            }
            this._buffers[0].lineStarts = this._buffers[0].lineStarts.concat(lineStarts.slice(1));
            const endIndex = this._buffers[0].lineStarts.length - 1;
            const endColumn = this._buffers[0].buffer.length - this._buffers[0].lineStarts[endIndex];
            const newEnd = { line: endIndex, column: endColumn };
            const newLength = node.piece.length + value.length;
            const oldLineFeedCnt = node.piece.lineFeedCnt;
            const newLineFeedCnt = this.getLineFeedCnt(0, node.piece.start, newEnd);
            const lf_delta = newLineFeedCnt - oldLineFeedCnt;
            node.piece = new Piece(node.piece.bufferIndex, node.piece.start, newEnd, newLineFeedCnt, newLength);
            this._lastChangeBufferPos = newEnd;
            (0, rbTreeBase_1.updateTreeMetadata)(this, node, value.length, lf_delta);
        }
        nodeAt(offset) {
            let x = this.root;
            let cache = this._searchCache.get(offset);
            if (cache) {
                return {
                    node: cache.node,
                    nodeStartOffset: cache.nodeStartOffset,
                    remainder: offset - cache.nodeStartOffset
                };
            }
            let nodeStartOffset = 0;
            while (x !== rbTreeBase_1.SENTINEL) {
                if (x.size_left > offset) {
                    x = x.left;
                }
                else if (x.size_left + x.piece.length >= offset) {
                    nodeStartOffset += x.size_left;
                    let ret = {
                        node: x,
                        remainder: offset - x.size_left,
                        nodeStartOffset
                    };
                    this._searchCache.set(ret);
                    return ret;
                }
                else {
                    offset -= x.size_left + x.piece.length;
                    nodeStartOffset += x.size_left + x.piece.length;
                    x = x.right;
                }
            }
            return null;
        }
        nodeAt2(lineNumber, column) {
            let x = this.root;
            let nodeStartOffset = 0;
            while (x !== rbTreeBase_1.SENTINEL) {
                if (x.left !== rbTreeBase_1.SENTINEL && x.lf_left >= lineNumber - 1) {
                    x = x.left;
                }
                else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
                    let prevAccumualtedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                    let accumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 1);
                    nodeStartOffset += x.size_left;
                    return {
                        node: x,
                        remainder: Math.min(prevAccumualtedValue + column - 1, accumulatedValue),
                        nodeStartOffset
                    };
                }
                else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
                    let prevAccumualtedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                    if (prevAccumualtedValue + column - 1 <= x.piece.length) {
                        return {
                            node: x,
                            remainder: prevAccumualtedValue + column - 1,
                            nodeStartOffset
                        };
                    }
                    else {
                        column -= x.piece.length - prevAccumualtedValue;
                        break;
                    }
                }
                else {
                    lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                    nodeStartOffset += x.size_left + x.piece.length;
                    x = x.right;
                }
            }
            // search in order, to find the node contains position.column
            x = x.next();
            while (x !== rbTreeBase_1.SENTINEL) {
                if (x.piece.lineFeedCnt > 0) {
                    let accumulatedValue = this.getAccumulatedValue(x, 0);
                    let nodeStartOffset = this.offsetOfNode(x);
                    return {
                        node: x,
                        remainder: Math.min(column - 1, accumulatedValue),
                        nodeStartOffset
                    };
                }
                else {
                    if (x.piece.length >= column - 1) {
                        let nodeStartOffset = this.offsetOfNode(x);
                        return {
                            node: x,
                            remainder: column - 1,
                            nodeStartOffset
                        };
                    }
                    else {
                        column -= x.piece.length;
                    }
                }
                x = x.next();
            }
            return null;
        }
        nodeCharCodeAt(node, offset) {
            if (node.piece.lineFeedCnt < 1) {
                return -1;
            }
            let buffer = this._buffers[node.piece.bufferIndex];
            let newOffset = this.offsetInBuffer(node.piece.bufferIndex, node.piece.start) + offset;
            return buffer.buffer.charCodeAt(newOffset);
        }
        offsetOfNode(node) {
            if (!node) {
                return 0;
            }
            let pos = node.size_left;
            while (node !== this.root) {
                if (node.parent.right === node) {
                    pos += node.parent.size_left + node.parent.piece.length;
                }
                node = node.parent;
            }
            return pos;
        }
        // #endregion
        // #region CRLF
        shouldCheckCRLF() {
            return !(this._EOLNormalized && this._EOL === '\n');
        }
        startWithLF(val) {
            if (typeof val === 'string') {
                return val.charCodeAt(0) === 10;
            }
            if (val === rbTreeBase_1.SENTINEL || val.piece.lineFeedCnt === 0) {
                return false;
            }
            let piece = val.piece;
            let lineStarts = this._buffers[piece.bufferIndex].lineStarts;
            let line = piece.start.line;
            let startOffset = lineStarts[line] + piece.start.column;
            if (line === lineStarts.length - 1) {
                // last line, so there is no line feed at the end of this line
                return false;
            }
            let nextLineOffset = lineStarts[line + 1];
            if (nextLineOffset > startOffset + 1) {
                return false;
            }
            return this._buffers[piece.bufferIndex].buffer.charCodeAt(startOffset) === 10;
        }
        endWithCR(val) {
            if (typeof val === 'string') {
                return val.charCodeAt(val.length - 1) === 13;
            }
            if (val === rbTreeBase_1.SENTINEL || val.piece.lineFeedCnt === 0) {
                return false;
            }
            return this.nodeCharCodeAt(val, val.piece.length - 1) === 13;
        }
        validateCRLFWithPrevNode(nextNode) {
            if (this.shouldCheckCRLF() && this.startWithLF(nextNode)) {
                let node = nextNode.prev();
                if (this.endWithCR(node)) {
                    this.fixCRLF(node, nextNode);
                }
            }
        }
        validateCRLFWithNextNode(node) {
            if (this.shouldCheckCRLF() && this.endWithCR(node)) {
                let nextNode = node.next();
                if (this.startWithLF(nextNode)) {
                    this.fixCRLF(node, nextNode);
                }
            }
        }
        fixCRLF(prev, next) {
            let nodesToDel = [];
            // update node
            let lineStarts = this._buffers[prev.piece.bufferIndex].lineStarts;
            let newEnd;
            if (prev.piece.end.column === 0) {
                // it means, last line ends with \r, not \r\n
                newEnd = { line: prev.piece.end.line - 1, column: lineStarts[prev.piece.end.line] - lineStarts[prev.piece.end.line - 1] - 1 };
            }
            else {
                // \r\n
                newEnd = { line: prev.piece.end.line, column: prev.piece.end.column - 1 };
            }
            const prevNewLength = prev.piece.length - 1;
            const prevNewLFCnt = prev.piece.lineFeedCnt - 1;
            prev.piece = new Piece(prev.piece.bufferIndex, prev.piece.start, newEnd, prevNewLFCnt, prevNewLength);
            (0, rbTreeBase_1.updateTreeMetadata)(this, prev, -1, -1);
            if (prev.piece.length === 0) {
                nodesToDel.push(prev);
            }
            // update nextNode
            let newStart = { line: next.piece.start.line + 1, column: 0 };
            const newLength = next.piece.length - 1;
            const newLineFeedCnt = this.getLineFeedCnt(next.piece.bufferIndex, newStart, next.piece.end);
            next.piece = new Piece(next.piece.bufferIndex, newStart, next.piece.end, newLineFeedCnt, newLength);
            (0, rbTreeBase_1.updateTreeMetadata)(this, next, -1, -1);
            if (next.piece.length === 0) {
                nodesToDel.push(next);
            }
            // create new piece which contains \r\n
            let pieces = this.createNewPieces('\r\n');
            this.rbInsertRight(prev, pieces[0]);
            // delete empty nodes
            for (let i = 0; i < nodesToDel.length; i++) {
                (0, rbTreeBase_1.rbDelete)(this, nodesToDel[i]);
            }
        }
        adjustCarriageReturnFromNext(value, node) {
            if (this.shouldCheckCRLF() && this.endWithCR(value)) {
                let nextNode = node.next();
                if (this.startWithLF(nextNode)) {
                    // move `\n` forward
                    value += '\n';
                    if (nextNode.piece.length === 1) {
                        (0, rbTreeBase_1.rbDelete)(this, nextNode);
                    }
                    else {
                        const piece = nextNode.piece;
                        const newStart = { line: piece.start.line + 1, column: 0 };
                        const newLength = piece.length - 1;
                        const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, newStart, piece.end);
                        nextNode.piece = new Piece(piece.bufferIndex, newStart, piece.end, newLineFeedCnt, newLength);
                        (0, rbTreeBase_1.updateTreeMetadata)(this, nextNode, -1, -1);
                    }
                    return true;
                }
            }
            return false;
        }
        // #endregion
        // #endregion
        // #region Tree operations
        iterate(node, callback) {
            if (node === rbTreeBase_1.SENTINEL) {
                return callback(rbTreeBase_1.SENTINEL);
            }
            let leftRet = this.iterate(node.left, callback);
            if (!leftRet) {
                return leftRet;
            }
            return callback(node) && this.iterate(node.right, callback);
        }
        getNodeContent(node) {
            if (node === rbTreeBase_1.SENTINEL) {
                return '';
            }
            let buffer = this._buffers[node.piece.bufferIndex];
            let currentContent;
            let piece = node.piece;
            let startOffset = this.offsetInBuffer(piece.bufferIndex, piece.start);
            let endOffset = this.offsetInBuffer(piece.bufferIndex, piece.end);
            currentContent = buffer.buffer.substring(startOffset, endOffset);
            return currentContent;
        }
        getPieceContent(piece) {
            let buffer = this._buffers[piece.bufferIndex];
            let startOffset = this.offsetInBuffer(piece.bufferIndex, piece.start);
            let endOffset = this.offsetInBuffer(piece.bufferIndex, piece.end);
            let currentContent = buffer.buffer.substring(startOffset, endOffset);
            return currentContent;
        }
        /**
         *      node              node
         *     /  \              /  \
         *    a   b    <----   a    b
         *                         /
         *                        z
         */
        rbInsertRight(node, p) {
            let z = new rbTreeBase_1.TreeNode(p, 1 /* Red */);
            z.left = rbTreeBase_1.SENTINEL;
            z.right = rbTreeBase_1.SENTINEL;
            z.parent = rbTreeBase_1.SENTINEL;
            z.size_left = 0;
            z.lf_left = 0;
            let x = this.root;
            if (x === rbTreeBase_1.SENTINEL) {
                this.root = z;
                z.color = 0 /* Black */;
            }
            else if (node.right === rbTreeBase_1.SENTINEL) {
                node.right = z;
                z.parent = node;
            }
            else {
                let nextNode = (0, rbTreeBase_1.leftest)(node.right);
                nextNode.left = z;
                z.parent = nextNode;
            }
            (0, rbTreeBase_1.fixInsert)(this, z);
            return z;
        }
        /**
         *      node              node
         *     /  \              /  \
         *    a   b     ---->   a    b
         *                       \
         *                        z
         */
        rbInsertLeft(node, p) {
            let z = new rbTreeBase_1.TreeNode(p, 1 /* Red */);
            z.left = rbTreeBase_1.SENTINEL;
            z.right = rbTreeBase_1.SENTINEL;
            z.parent = rbTreeBase_1.SENTINEL;
            z.size_left = 0;
            z.lf_left = 0;
            if (this.root === rbTreeBase_1.SENTINEL) {
                this.root = z;
                z.color = 0 /* Black */;
            }
            else if (node.left === rbTreeBase_1.SENTINEL) {
                node.left = z;
                z.parent = node;
            }
            else {
                let prevNode = (0, rbTreeBase_1.righttest)(node.left); // a
                prevNode.right = z;
                z.parent = prevNode;
            }
            (0, rbTreeBase_1.fixInsert)(this, z);
            return z;
        }
        getContentOfSubTree(node) {
            let str = '';
            this.iterate(node, node => {
                str += this.getNodeContent(node);
                return true;
            });
            return str;
        }
    }
    exports.PieceTreeBase = PieceTreeBase;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[43/*vs/editor/common/modes/languageSelector*/], __M([0/*require*/,1/*exports*/,19/*vs/base/common/glob*/,5/*vs/base/common/path*/]), function (require, exports, glob_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.score = void 0;
    function score(selector, candidateUri, candidateLanguage, candidateIsSynchronized) {
        if (Array.isArray(selector)) {
            // array -> take max individual value
            let ret = 0;
            for (const filter of selector) {
                const value = score(filter, candidateUri, candidateLanguage, candidateIsSynchronized);
                if (value === 10) {
                    return value; // already at the highest
                }
                if (value > ret) {
                    ret = value;
                }
            }
            return ret;
        }
        else if (typeof selector === 'string') {
            if (!candidateIsSynchronized) {
                return 0;
            }
            // short-hand notion, desugars to
            // 'fooLang' -> { language: 'fooLang'}
            // '*' -> { language: '*' }
            if (selector === '*') {
                return 5;
            }
            else if (selector === candidateLanguage) {
                return 10;
            }
            else {
                return 0;
            }
        }
        else if (selector) {
            // filter -> select accordingly, use defaults for scheme
            const { language, pattern, scheme, hasAccessToAllModels } = selector; // TODO: microsoft/TypeScript#42768
            if (!candidateIsSynchronized && !hasAccessToAllModels) {
                return 0;
            }
            let ret = 0;
            if (scheme) {
                if (scheme === candidateUri.scheme) {
                    ret = 10;
                }
                else if (scheme === '*') {
                    ret = 5;
                }
                else {
                    return 0;
                }
            }
            if (language) {
                if (language === candidateLanguage) {
                    ret = 10;
                }
                else if (language === '*') {
                    ret = Math.max(ret, 5);
                }
                else {
                    return 0;
                }
            }
            if (pattern) {
                let normalizedPattern;
                if (typeof pattern === 'string') {
                    normalizedPattern = pattern;
                }
                else {
                    // Since this pattern has a `base` property, we need
                    // to normalize this path first before passing it on
                    // because we will compare it against `Uri.fsPath`
                    // which uses platform specific separators.
                    // Refs: https://github.com/microsoft/vscode/issues/99938
                    normalizedPattern = Object.assign(Object.assign({}, pattern), { base: (0, path_1.normalize)(pattern.base) });
                }
                if (normalizedPattern === candidateUri.fsPath || (0, glob_1.match)(normalizedPattern, candidateUri.fsPath)) {
                    ret = 10;
                }
                else {
                    return 0;
                }
            }
            return ret;
        }
        else {
            return 0;
        }
    }
    exports.score = score;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[44/*vs/editor/common/modes/tokenizationRegistry*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/event*/,4/*vs/base/common/lifecycle*/]), function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenizationRegistryImpl = void 0;
    class TokenizationRegistryImpl {
        constructor() {
            this._map = new Map();
            this._promises = new Map();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._colorMap = null;
        }
        fire(languages) {
            this._onDidChange.fire({
                changedLanguages: languages,
                changedColorMap: false
            });
        }
        register(language, support) {
            this._map.set(language, support);
            this.fire([language]);
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._map.get(language) !== support) {
                    return;
                }
                this._map.delete(language);
                this.fire([language]);
            });
        }
        registerPromise(language, supportPromise) {
            let registration = null;
            let isDisposed = false;
            this._promises.set(language, supportPromise.then(support => {
                this._promises.delete(language);
                if (isDisposed || !support) {
                    return;
                }
                registration = this.register(language, support);
            }));
            return (0, lifecycle_1.toDisposable)(() => {
                isDisposed = true;
                if (registration) {
                    registration.dispose();
                }
            });
        }
        getPromise(language) {
            const support = this.get(language);
            if (support) {
                return Promise.resolve(support);
            }
            const promise = this._promises.get(language);
            if (promise) {
                return promise.then(_ => this.get(language));
            }
            return null;
        }
        get(language) {
            return (this._map.get(language) || null);
        }
        setColorMap(colorMap) {
            this._colorMap = colorMap;
            this._onDidChange.fire({
                changedLanguages: Array.from(this._map.keys()),
                changedColorMap: true
            });
        }
        getColorMap() {
            return this._colorMap;
        }
        getDefaultBackground() {
            if (this._colorMap && this._colorMap.length > 2 /* DefaultBackground */) {
                return this._colorMap[2 /* DefaultBackground */];
            }
            return null;
        }
    }
    exports.TokenizationRegistryImpl = TokenizationRegistryImpl;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[21/*vs/platform/instantiation/common/instantiation*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.optional = exports.refineServiceDecorator = exports.createDecorator = exports.IInstantiationService = exports._util = void 0;
    // ------ internal util
    var _util;
    (function (_util) {
        _util.serviceIds = new Map();
        _util.DI_TARGET = '$di$target';
        _util.DI_DEPENDENCIES = '$di$dependencies';
        function getServiceDependencies(ctor) {
            return ctor[_util.DI_DEPENDENCIES] || [];
        }
        _util.getServiceDependencies = getServiceDependencies;
    })(_util = exports._util || (exports._util = {}));
    exports.IInstantiationService = createDecorator('instantiationService');
    function storeServiceDependency(id, target, index, optional) {
        if (target[_util.DI_TARGET] === target) {
            target[_util.DI_DEPENDENCIES].push({ id, index, optional });
        }
        else {
            target[_util.DI_DEPENDENCIES] = [{ id, index, optional }];
            target[_util.DI_TARGET] = target;
        }
    }
    /**
     * The *only* valid way to create a {{ServiceIdentifier}}.
     */
    function createDecorator(serviceId) {
        if (_util.serviceIds.has(serviceId)) {
            return _util.serviceIds.get(serviceId);
        }
        const id = function (target, key, index) {
            if (arguments.length !== 3) {
                throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
            }
            storeServiceDependency(id, target, index, false);
        };
        id.toString = () => serviceId;
        _util.serviceIds.set(serviceId, id);
        return id;
    }
    exports.createDecorator = createDecorator;
    function refineServiceDecorator(serviceIdentifier) {
        return serviceIdentifier;
    }
    exports.refineServiceDecorator = refineServiceDecorator;
    /**
     * Mark a service dependency as optional.
     */
    function optional(serviceIdentifier) {
        return function (target, key, index) {
            if (arguments.length !== 3) {
                throw new Error('@optional-decorator can only be used to decorate a parameter');
            }
            storeServiceDependency(serviceIdentifier, target, index, true);
        };
    }
    exports.optional = optional;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[45/*vs/editor/common/services/modelService*/], __M([0/*require*/,1/*exports*/,21/*vs/platform/instantiation/common/instantiation*/]), function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.shouldSynchronizeModel = exports.IModelService = void 0;
    exports.IModelService = (0, instantiation_1.createDecorator)('modelService');
    function shouldSynchronizeModel(model) {
        return (!model.isTooLargeForSyncing() && !model.isForSimpleWidget);
    }
    exports.shouldSynchronizeModel = shouldSynchronizeModel;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[46/*vs/editor/common/modes/languageFeatureRegistry*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/event*/,12/*vs/base/common/hash*/,4/*vs/base/common/lifecycle*/,17/*vs/base/common/map*/,26/*vs/base/common/numbers*/,43/*vs/editor/common/modes/languageSelector*/,45/*vs/editor/common/services/modelService*/]), function (require, exports, event_1, hash_1, lifecycle_1, map_1, numbers_1, languageSelector_1, modelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageFeatureRequestDelays = exports.LanguageFeatureRegistry = void 0;
    function isExclusive(selector) {
        if (typeof selector === 'string') {
            return false;
        }
        else if (Array.isArray(selector)) {
            return selector.every(isExclusive);
        }
        else {
            return !!selector.exclusive; // TODO: microsoft/TypeScript#42768
        }
    }
    class LanguageFeatureRegistry {
        constructor() {
            this._clock = 0;
            this._entries = [];
            this._onDidChange = new event_1.Emitter();
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        register(selector, provider) {
            let entry = {
                selector,
                provider,
                _score: -1,
                _time: this._clock++
            };
            this._entries.push(entry);
            this._lastCandidate = undefined;
            this._onDidChange.fire(this._entries.length);
            return (0, lifecycle_1.toDisposable)(() => {
                if (entry) {
                    let idx = this._entries.indexOf(entry);
                    if (idx >= 0) {
                        this._entries.splice(idx, 1);
                        this._lastCandidate = undefined;
                        this._onDidChange.fire(this._entries.length);
                        entry = undefined;
                    }
                }
            });
        }
        has(model) {
            return this.all(model).length > 0;
        }
        all(model) {
            if (!model) {
                return [];
            }
            this._updateScores(model);
            const result = [];
            // from registry
            for (let entry of this._entries) {
                if (entry._score > 0) {
                    result.push(entry.provider);
                }
            }
            return result;
        }
        ordered(model) {
            const result = [];
            this._orderedForEach(model, entry => result.push(entry.provider));
            return result;
        }
        orderedGroups(model) {
            const result = [];
            let lastBucket;
            let lastBucketScore;
            this._orderedForEach(model, entry => {
                if (lastBucket && lastBucketScore === entry._score) {
                    lastBucket.push(entry.provider);
                }
                else {
                    lastBucketScore = entry._score;
                    lastBucket = [entry.provider];
                    result.push(lastBucket);
                }
            });
            return result;
        }
        _orderedForEach(model, callback) {
            if (!model) {
                return;
            }
            this._updateScores(model);
            for (const entry of this._entries) {
                if (entry._score > 0) {
                    callback(entry);
                }
            }
        }
        _updateScores(model) {
            let candidate = {
                uri: model.uri.toString(),
                language: model.getLanguageIdentifier().language
            };
            if (this._lastCandidate
                && this._lastCandidate.language === candidate.language
                && this._lastCandidate.uri === candidate.uri) {
                // nothing has changed
                return;
            }
            this._lastCandidate = candidate;
            for (let entry of this._entries) {
                entry._score = (0, languageSelector_1.score)(entry.selector, model.uri, model.getLanguageIdentifier().language, (0, modelService_1.shouldSynchronizeModel)(model));
                if (isExclusive(entry.selector) && entry._score > 0) {
                    // support for one exclusive selector that overwrites
                    // any other selector
                    for (let entry of this._entries) {
                        entry._score = 0;
                    }
                    entry._score = 1000;
                    break;
                }
            }
            // needs sorting
            this._entries.sort(LanguageFeatureRegistry._compareByScoreAndTime);
        }
        static _compareByScoreAndTime(a, b) {
            if (a._score < b._score) {
                return 1;
            }
            else if (a._score > b._score) {
                return -1;
            }
            else if (a._time < b._time) {
                return 1;
            }
            else if (a._time > b._time) {
                return -1;
            }
            else {
                return 0;
            }
        }
    }
    exports.LanguageFeatureRegistry = LanguageFeatureRegistry;
    /**
     * Keeps moving average per model and set of providers so that requests
     * can be debounce according to the provider performance
     */
    class LanguageFeatureRequestDelays {
        constructor(_registry, min, max = Number.MAX_SAFE_INTEGER) {
            this._registry = _registry;
            this.min = min;
            this.max = max;
            this._cache = new map_1.LRUCache(50, 0.7);
        }
        _key(model) {
            return model.id + (0, hash_1.hash)(this._registry.all(model));
        }
        _clamp(value) {
            if (value === undefined) {
                return this.min;
            }
            else {
                return Math.min(this.max, Math.max(this.min, Math.floor(value * 1.3)));
            }
        }
        get(model) {
            const key = this._key(model);
            const avg = this._cache.get(key);
            return this._clamp(avg === null || avg === void 0 ? void 0 : avg.value);
        }
        update(model, value) {
            const key = this._key(model);
            let avg = this._cache.get(key);
            if (!avg) {
                avg = new numbers_1.MovingAverage();
                this._cache.set(key, avg);
            }
            avg.update(value);
            return this.get(model);
        }
    }
    exports.LanguageFeatureRequestDelays = LanguageFeatureRequestDelays;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[22/*vs/editor/common/modes*/], __M([0/*require*/,1/*exports*/,8/*vs/base/common/uri*/,7/*vs/editor/common/core/range*/,46/*vs/editor/common/modes/languageFeatureRegistry*/,44/*vs/editor/common/modes/tokenizationRegistry*/,30/*vs/base/common/codicons*/]), function (require, exports, uri_1, range_1, languageFeatureRegistry_1, tokenizationRegistry_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExternalUriOpenerPriority = exports.TokenizationRegistry = exports.DocumentRangeSemanticTokensProviderRegistry = exports.DocumentSemanticTokensProviderRegistry = exports.FoldingRangeProviderRegistry = exports.SelectionRangeRegistry = exports.ColorProviderRegistry = exports.LinkProviderRegistry = exports.OnTypeFormattingEditProviderRegistry = exports.DocumentRangeFormattingEditProviderRegistry = exports.DocumentFormattingEditProviderRegistry = exports.CodeActionProviderRegistry = exports.InlineHintsProviderRegistry = exports.CodeLensProviderRegistry = exports.TypeDefinitionProviderRegistry = exports.ImplementationProviderRegistry = exports.DeclarationProviderRegistry = exports.DefinitionProviderRegistry = exports.LinkedEditingRangeProviderRegistry = exports.DocumentHighlightProviderRegistry = exports.DocumentSymbolProviderRegistry = exports.InlineValuesProviderRegistry = exports.EvaluatableExpressionProviderRegistry = exports.HoverProviderRegistry = exports.SignatureHelpProviderRegistry = exports.CompletionProviderRegistry = exports.RenameProviderRegistry = exports.ReferenceProviderRegistry = exports.InlineHintKind = exports.CommentMode = exports.CommentThreadCollapsibleState = exports.FoldingRangeKind = exports.SymbolKinds = exports.SymbolTag = exports.SymbolKind = exports.isLocationLink = exports.DocumentHighlightKind = exports.SignatureHelpTriggerKind = exports.CodeActionTriggerType = exports.CompletionTriggerKind = exports.CompletionItemInsertTextRule = exports.CompletionItemTag = exports.completionKindFromString = exports.completionKindToCssClass = exports.CompletionItemKind = exports.TokenMetadata = exports.MetadataConsts = exports.StandardTokenType = exports.ColorId = exports.FontStyle = exports.LanguageIdentifier = exports.LanguageId = void 0;
    /**
     * Open ended enum at runtime
     * @internal
     */
    var LanguageId;
    (function (LanguageId) {
        LanguageId[LanguageId["Null"] = 0] = "Null";
        LanguageId[LanguageId["PlainText"] = 1] = "PlainText";
    })(LanguageId = exports.LanguageId || (exports.LanguageId = {}));
    /**
     * @internal
     */
    class LanguageIdentifier {
        constructor(language, id) {
            this.language = language;
            this.id = id;
        }
    }
    exports.LanguageIdentifier = LanguageIdentifier;
    /**
     * A font style. Values are 2^x such that a bit mask can be used.
     * @internal
     */
    var FontStyle;
    (function (FontStyle) {
        FontStyle[FontStyle["NotSet"] = -1] = "NotSet";
        FontStyle[FontStyle["None"] = 0] = "None";
        FontStyle[FontStyle["Italic"] = 1] = "Italic";
        FontStyle[FontStyle["Bold"] = 2] = "Bold";
        FontStyle[FontStyle["Underline"] = 4] = "Underline";
    })(FontStyle = exports.FontStyle || (exports.FontStyle = {}));
    /**
     * Open ended enum at runtime
     * @internal
     */
    var ColorId;
    (function (ColorId) {
        ColorId[ColorId["None"] = 0] = "None";
        ColorId[ColorId["DefaultForeground"] = 1] = "DefaultForeground";
        ColorId[ColorId["DefaultBackground"] = 2] = "DefaultBackground";
    })(ColorId = exports.ColorId || (exports.ColorId = {}));
    /**
     * A standard token type. Values are 2^x such that a bit mask can be used.
     * @internal
     */
    var StandardTokenType;
    (function (StandardTokenType) {
        StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
        StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
        StandardTokenType[StandardTokenType["String"] = 2] = "String";
        StandardTokenType[StandardTokenType["RegEx"] = 4] = "RegEx";
    })(StandardTokenType = exports.StandardTokenType || (exports.StandardTokenType = {}));
    /**
     * Helpers to manage the "collapsed" metadata of an entire StackElement stack.
     * The following assumptions have been made:
     *  - languageId < 256 => needs 8 bits
     *  - unique color count < 512 => needs 9 bits
     *
     * The binary format is:
     * - -------------------------------------------
     *     3322 2222 2222 1111 1111 1100 0000 0000
     *     1098 7654 3210 9876 5432 1098 7654 3210
     * - -------------------------------------------
     *     xxxx xxxx xxxx xxxx xxxx xxxx xxxx xxxx
     *     bbbb bbbb bfff ffff ffFF FTTT LLLL LLLL
     * - -------------------------------------------
     *  - L = LanguageId (8 bits)
     *  - T = StandardTokenType (3 bits)
     *  - F = FontStyle (3 bits)
     *  - f = foreground color (9 bits)
     *  - b = background color (9 bits)
     *
     * @internal
     */
    var MetadataConsts;
    (function (MetadataConsts) {
        MetadataConsts[MetadataConsts["LANGUAGEID_MASK"] = 255] = "LANGUAGEID_MASK";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_MASK"] = 1792] = "TOKEN_TYPE_MASK";
        MetadataConsts[MetadataConsts["FONT_STYLE_MASK"] = 14336] = "FONT_STYLE_MASK";
        MetadataConsts[MetadataConsts["FOREGROUND_MASK"] = 8372224] = "FOREGROUND_MASK";
        MetadataConsts[MetadataConsts["BACKGROUND_MASK"] = 4286578688] = "BACKGROUND_MASK";
        MetadataConsts[MetadataConsts["ITALIC_MASK"] = 2048] = "ITALIC_MASK";
        MetadataConsts[MetadataConsts["BOLD_MASK"] = 4096] = "BOLD_MASK";
        MetadataConsts[MetadataConsts["UNDERLINE_MASK"] = 8192] = "UNDERLINE_MASK";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_ITALIC"] = 1] = "SEMANTIC_USE_ITALIC";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_BOLD"] = 2] = "SEMANTIC_USE_BOLD";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_UNDERLINE"] = 4] = "SEMANTIC_USE_UNDERLINE";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_FOREGROUND"] = 8] = "SEMANTIC_USE_FOREGROUND";
        MetadataConsts[MetadataConsts["SEMANTIC_USE_BACKGROUND"] = 16] = "SEMANTIC_USE_BACKGROUND";
        MetadataConsts[MetadataConsts["LANGUAGEID_OFFSET"] = 0] = "LANGUAGEID_OFFSET";
        MetadataConsts[MetadataConsts["TOKEN_TYPE_OFFSET"] = 8] = "TOKEN_TYPE_OFFSET";
        MetadataConsts[MetadataConsts["FONT_STYLE_OFFSET"] = 11] = "FONT_STYLE_OFFSET";
        MetadataConsts[MetadataConsts["FOREGROUND_OFFSET"] = 14] = "FOREGROUND_OFFSET";
        MetadataConsts[MetadataConsts["BACKGROUND_OFFSET"] = 23] = "BACKGROUND_OFFSET";
    })(MetadataConsts = exports.MetadataConsts || (exports.MetadataConsts = {}));
    /**
     * @internal
     */
    class TokenMetadata {
        static getLanguageId(metadata) {
            return (metadata & 255 /* LANGUAGEID_MASK */) >>> 0 /* LANGUAGEID_OFFSET */;
        }
        static getTokenType(metadata) {
            return (metadata & 1792 /* TOKEN_TYPE_MASK */) >>> 8 /* TOKEN_TYPE_OFFSET */;
        }
        static getFontStyle(metadata) {
            return (metadata & 14336 /* FONT_STYLE_MASK */) >>> 11 /* FONT_STYLE_OFFSET */;
        }
        static getForeground(metadata) {
            return (metadata & 8372224 /* FOREGROUND_MASK */) >>> 14 /* FOREGROUND_OFFSET */;
        }
        static getBackground(metadata) {
            return (metadata & 4286578688 /* BACKGROUND_MASK */) >>> 23 /* BACKGROUND_OFFSET */;
        }
        static getClassNameFromMetadata(metadata) {
            let foreground = this.getForeground(metadata);
            let className = 'mtk' + foreground;
            let fontStyle = this.getFontStyle(metadata);
            if (fontStyle & 1 /* Italic */) {
                className += ' mtki';
            }
            if (fontStyle & 2 /* Bold */) {
                className += ' mtkb';
            }
            if (fontStyle & 4 /* Underline */) {
                className += ' mtku';
            }
            return className;
        }
        static getInlineStyleFromMetadata(metadata, colorMap) {
            const foreground = this.getForeground(metadata);
            const fontStyle = this.getFontStyle(metadata);
            let result = `color: ${colorMap[foreground]};`;
            if (fontStyle & 1 /* Italic */) {
                result += 'font-style: italic;';
            }
            if (fontStyle & 2 /* Bold */) {
                result += 'font-weight: bold;';
            }
            if (fontStyle & 4 /* Underline */) {
                result += 'text-decoration: underline;';
            }
            return result;
        }
    }
    exports.TokenMetadata = TokenMetadata;
    var CompletionItemKind;
    (function (CompletionItemKind) {
        CompletionItemKind[CompletionItemKind["Method"] = 0] = "Method";
        CompletionItemKind[CompletionItemKind["Function"] = 1] = "Function";
        CompletionItemKind[CompletionItemKind["Constructor"] = 2] = "Constructor";
        CompletionItemKind[CompletionItemKind["Field"] = 3] = "Field";
        CompletionItemKind[CompletionItemKind["Variable"] = 4] = "Variable";
        CompletionItemKind[CompletionItemKind["Class"] = 5] = "Class";
        CompletionItemKind[CompletionItemKind["Struct"] = 6] = "Struct";
        CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
        CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
        CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
        CompletionItemKind[CompletionItemKind["Event"] = 10] = "Event";
        CompletionItemKind[CompletionItemKind["Operator"] = 11] = "Operator";
        CompletionItemKind[CompletionItemKind["Unit"] = 12] = "Unit";
        CompletionItemKind[CompletionItemKind["Value"] = 13] = "Value";
        CompletionItemKind[CompletionItemKind["Constant"] = 14] = "Constant";
        CompletionItemKind[CompletionItemKind["Enum"] = 15] = "Enum";
        CompletionItemKind[CompletionItemKind["EnumMember"] = 16] = "EnumMember";
        CompletionItemKind[CompletionItemKind["Keyword"] = 17] = "Keyword";
        CompletionItemKind[CompletionItemKind["Text"] = 18] = "Text";
        CompletionItemKind[CompletionItemKind["Color"] = 19] = "Color";
        CompletionItemKind[CompletionItemKind["File"] = 20] = "File";
        CompletionItemKind[CompletionItemKind["Reference"] = 21] = "Reference";
        CompletionItemKind[CompletionItemKind["Customcolor"] = 22] = "Customcolor";
        CompletionItemKind[CompletionItemKind["Folder"] = 23] = "Folder";
        CompletionItemKind[CompletionItemKind["TypeParameter"] = 24] = "TypeParameter";
        CompletionItemKind[CompletionItemKind["User"] = 25] = "User";
        CompletionItemKind[CompletionItemKind["Issue"] = 26] = "Issue";
        CompletionItemKind[CompletionItemKind["Snippet"] = 27] = "Snippet";
    })(CompletionItemKind = exports.CompletionItemKind || (exports.CompletionItemKind = {}));
    /**
     * @internal
     */
    exports.completionKindToCssClass = (function () {
        let data = Object.create(null);
        data[0 /* Method */] = 'symbol-method';
        data[1 /* Function */] = 'symbol-function';
        data[2 /* Constructor */] = 'symbol-constructor';
        data[3 /* Field */] = 'symbol-field';
        data[4 /* Variable */] = 'symbol-variable';
        data[5 /* Class */] = 'symbol-class';
        data[6 /* Struct */] = 'symbol-struct';
        data[7 /* Interface */] = 'symbol-interface';
        data[8 /* Module */] = 'symbol-module';
        data[9 /* Property */] = 'symbol-property';
        data[10 /* Event */] = 'symbol-event';
        data[11 /* Operator */] = 'symbol-operator';
        data[12 /* Unit */] = 'symbol-unit';
        data[13 /* Value */] = 'symbol-value';
        data[14 /* Constant */] = 'symbol-constant';
        data[15 /* Enum */] = 'symbol-enum';
        data[16 /* EnumMember */] = 'symbol-enum-member';
        data[17 /* Keyword */] = 'symbol-keyword';
        data[27 /* Snippet */] = 'symbol-snippet';
        data[18 /* Text */] = 'symbol-text';
        data[19 /* Color */] = 'symbol-color';
        data[20 /* File */] = 'symbol-file';
        data[21 /* Reference */] = 'symbol-reference';
        data[22 /* Customcolor */] = 'symbol-customcolor';
        data[23 /* Folder */] = 'symbol-folder';
        data[24 /* TypeParameter */] = 'symbol-type-parameter';
        data[25 /* User */] = 'account';
        data[26 /* Issue */] = 'issues';
        return function (kind) {
            const name = data[kind];
            let codicon = name && codicons_1.iconRegistry.get(name);
            if (!codicon) {
                console.info('No codicon found for CompletionItemKind ' + kind);
                codicon = codicons_1.Codicon.symbolProperty;
            }
            return codicon.classNames;
        };
    })();
    /**
     * @internal
     */
    exports.completionKindFromString = (function () {
        let data = Object.create(null);
        data['method'] = 0 /* Method */;
        data['function'] = 1 /* Function */;
        data['constructor'] = 2 /* Constructor */;
        data['field'] = 3 /* Field */;
        data['variable'] = 4 /* Variable */;
        data['class'] = 5 /* Class */;
        data['struct'] = 6 /* Struct */;
        data['interface'] = 7 /* Interface */;
        data['module'] = 8 /* Module */;
        data['property'] = 9 /* Property */;
        data['event'] = 10 /* Event */;
        data['operator'] = 11 /* Operator */;
        data['unit'] = 12 /* Unit */;
        data['value'] = 13 /* Value */;
        data['constant'] = 14 /* Constant */;
        data['enum'] = 15 /* Enum */;
        data['enum-member'] = 16 /* EnumMember */;
        data['enumMember'] = 16 /* EnumMember */;
        data['keyword'] = 17 /* Keyword */;
        data['snippet'] = 27 /* Snippet */;
        data['text'] = 18 /* Text */;
        data['color'] = 19 /* Color */;
        data['file'] = 20 /* File */;
        data['reference'] = 21 /* Reference */;
        data['customcolor'] = 22 /* Customcolor */;
        data['folder'] = 23 /* Folder */;
        data['type-parameter'] = 24 /* TypeParameter */;
        data['typeParameter'] = 24 /* TypeParameter */;
        data['account'] = 25 /* User */;
        data['issue'] = 26 /* Issue */;
        return function (value, strict) {
            let res = data[value];
            if (typeof res === 'undefined' && !strict) {
                res = 9 /* Property */;
            }
            return res;
        };
    })();
    var CompletionItemTag;
    (function (CompletionItemTag) {
        CompletionItemTag[CompletionItemTag["Deprecated"] = 1] = "Deprecated";
    })(CompletionItemTag = exports.CompletionItemTag || (exports.CompletionItemTag = {}));
    var CompletionItemInsertTextRule;
    (function (CompletionItemInsertTextRule) {
        /**
         * Adjust whitespace/indentation of multiline insert texts to
         * match the current line indentation.
         */
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["KeepWhitespace"] = 1] = "KeepWhitespace";
        /**
         * `insertText` is a snippet.
         */
        CompletionItemInsertTextRule[CompletionItemInsertTextRule["InsertAsSnippet"] = 4] = "InsertAsSnippet";
    })(CompletionItemInsertTextRule = exports.CompletionItemInsertTextRule || (exports.CompletionItemInsertTextRule = {}));
    /**
     * How a suggest provider was triggered.
     */
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        CompletionTriggerKind[CompletionTriggerKind["Invoke"] = 0] = "Invoke";
        CompletionTriggerKind[CompletionTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
        CompletionTriggerKind[CompletionTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
    })(CompletionTriggerKind = exports.CompletionTriggerKind || (exports.CompletionTriggerKind = {}));
    /**
     * @internal
     */
    var CodeActionTriggerType;
    (function (CodeActionTriggerType) {
        CodeActionTriggerType[CodeActionTriggerType["Invoke"] = 1] = "Invoke";
        CodeActionTriggerType[CodeActionTriggerType["Auto"] = 2] = "Auto";
    })(CodeActionTriggerType = exports.CodeActionTriggerType || (exports.CodeActionTriggerType = {}));
    var SignatureHelpTriggerKind;
    (function (SignatureHelpTriggerKind) {
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
        SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
    })(SignatureHelpTriggerKind = exports.SignatureHelpTriggerKind || (exports.SignatureHelpTriggerKind = {}));
    /**
     * A document highlight kind.
     */
    var DocumentHighlightKind;
    (function (DocumentHighlightKind) {
        /**
         * A textual occurrence.
         */
        DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
        /**
         * Read-access of a symbol, like reading a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
        /**
         * Write-access of a symbol, like writing to a variable.
         */
        DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
    })(DocumentHighlightKind = exports.DocumentHighlightKind || (exports.DocumentHighlightKind = {}));
    /**
     * @internal
     */
    function isLocationLink(thing) {
        return thing
            && uri_1.URI.isUri(thing.uri)
            && range_1.Range.isIRange(thing.range)
            && (range_1.Range.isIRange(thing.originSelectionRange) || range_1.Range.isIRange(thing.targetSelectionRange));
    }
    exports.isLocationLink = isLocationLink;
    /**
     * A symbol kind.
     */
    var SymbolKind;
    (function (SymbolKind) {
        SymbolKind[SymbolKind["File"] = 0] = "File";
        SymbolKind[SymbolKind["Module"] = 1] = "Module";
        SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
        SymbolKind[SymbolKind["Package"] = 3] = "Package";
        SymbolKind[SymbolKind["Class"] = 4] = "Class";
        SymbolKind[SymbolKind["Method"] = 5] = "Method";
        SymbolKind[SymbolKind["Property"] = 6] = "Property";
        SymbolKind[SymbolKind["Field"] = 7] = "Field";
        SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
        SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
        SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
        SymbolKind[SymbolKind["Function"] = 11] = "Function";
        SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
        SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
        SymbolKind[SymbolKind["String"] = 14] = "String";
        SymbolKind[SymbolKind["Number"] = 15] = "Number";
        SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
        SymbolKind[SymbolKind["Array"] = 17] = "Array";
        SymbolKind[SymbolKind["Object"] = 18] = "Object";
        SymbolKind[SymbolKind["Key"] = 19] = "Key";
        SymbolKind[SymbolKind["Null"] = 20] = "Null";
        SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
        SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
        SymbolKind[SymbolKind["Event"] = 23] = "Event";
        SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
        SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
    })(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
    var SymbolTag;
    (function (SymbolTag) {
        SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
    })(SymbolTag = exports.SymbolTag || (exports.SymbolTag = {}));
    /**
     * @internal
     */
    var SymbolKinds;
    (function (SymbolKinds) {
        const byName = new Map();
        byName.set('file', 0 /* File */);
        byName.set('module', 1 /* Module */);
        byName.set('namespace', 2 /* Namespace */);
        byName.set('package', 3 /* Package */);
        byName.set('class', 4 /* Class */);
        byName.set('method', 5 /* Method */);
        byName.set('property', 6 /* Property */);
        byName.set('field', 7 /* Field */);
        byName.set('constructor', 8 /* Constructor */);
        byName.set('enum', 9 /* Enum */);
        byName.set('interface', 10 /* Interface */);
        byName.set('function', 11 /* Function */);
        byName.set('variable', 12 /* Variable */);
        byName.set('constant', 13 /* Constant */);
        byName.set('string', 14 /* String */);
        byName.set('number', 15 /* Number */);
        byName.set('boolean', 16 /* Boolean */);
        byName.set('array', 17 /* Array */);
        byName.set('object', 18 /* Object */);
        byName.set('key', 19 /* Key */);
        byName.set('null', 20 /* Null */);
        byName.set('enum-member', 21 /* EnumMember */);
        byName.set('struct', 22 /* Struct */);
        byName.set('event', 23 /* Event */);
        byName.set('operator', 24 /* Operator */);
        byName.set('type-parameter', 25 /* TypeParameter */);
        const byKind = new Map();
        byKind.set(0 /* File */, 'file');
        byKind.set(1 /* Module */, 'module');
        byKind.set(2 /* Namespace */, 'namespace');
        byKind.set(3 /* Package */, 'package');
        byKind.set(4 /* Class */, 'class');
        byKind.set(5 /* Method */, 'method');
        byKind.set(6 /* Property */, 'property');
        byKind.set(7 /* Field */, 'field');
        byKind.set(8 /* Constructor */, 'constructor');
        byKind.set(9 /* Enum */, 'enum');
        byKind.set(10 /* Interface */, 'interface');
        byKind.set(11 /* Function */, 'function');
        byKind.set(12 /* Variable */, 'variable');
        byKind.set(13 /* Constant */, 'constant');
        byKind.set(14 /* String */, 'string');
        byKind.set(15 /* Number */, 'number');
        byKind.set(16 /* Boolean */, 'boolean');
        byKind.set(17 /* Array */, 'array');
        byKind.set(18 /* Object */, 'object');
        byKind.set(19 /* Key */, 'key');
        byKind.set(20 /* Null */, 'null');
        byKind.set(21 /* EnumMember */, 'enum-member');
        byKind.set(22 /* Struct */, 'struct');
        byKind.set(23 /* Event */, 'event');
        byKind.set(24 /* Operator */, 'operator');
        byKind.set(25 /* TypeParameter */, 'type-parameter');
        /**
         * @internal
         */
        function fromString(value) {
            return byName.get(value);
        }
        SymbolKinds.fromString = fromString;
        /**
         * @internal
         */
        function toString(kind) {
            return byKind.get(kind);
        }
        SymbolKinds.toString = toString;
        /**
         * @internal
         */
        function toCssClassName(kind, inline) {
            const symbolName = byKind.get(kind);
            let codicon = symbolName && codicons_1.iconRegistry.get('symbol-' + symbolName);
            if (!codicon) {
                console.info('No codicon found for SymbolKind ' + kind);
                codicon = codicons_1.Codicon.symbolProperty;
            }
            return `${inline ? 'inline' : 'block'} ${codicon.classNames}`;
        }
        SymbolKinds.toCssClassName = toCssClassName;
    })(SymbolKinds = exports.SymbolKinds || (exports.SymbolKinds = {}));
    class FoldingRangeKind {
        /**
         * Creates a new [FoldingRangeKind](#FoldingRangeKind).
         *
         * @param value of the kind.
         */
        constructor(value) {
            this.value = value;
        }
    }
    exports.FoldingRangeKind = FoldingRangeKind;
    /**
     * Kind for folding range representing a comment. The value of the kind is 'comment'.
     */
    FoldingRangeKind.Comment = new FoldingRangeKind('comment');
    /**
     * Kind for folding range representing a import. The value of the kind is 'imports'.
     */
    FoldingRangeKind.Imports = new FoldingRangeKind('imports');
    /**
     * Kind for folding range representing regions (for example marked by `#region`, `#endregion`).
     * The value of the kind is 'region'.
     */
    FoldingRangeKind.Region = new FoldingRangeKind('region');
    /**
     * @internal
     */
    var CommentThreadCollapsibleState;
    (function (CommentThreadCollapsibleState) {
        /**
         * Determines an item is collapsed
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Collapsed"] = 0] = "Collapsed";
        /**
         * Determines an item is expanded
         */
        CommentThreadCollapsibleState[CommentThreadCollapsibleState["Expanded"] = 1] = "Expanded";
    })(CommentThreadCollapsibleState = exports.CommentThreadCollapsibleState || (exports.CommentThreadCollapsibleState = {}));
    /**
     * @internal
     */
    var CommentMode;
    (function (CommentMode) {
        CommentMode[CommentMode["Editing"] = 0] = "Editing";
        CommentMode[CommentMode["Preview"] = 1] = "Preview";
    })(CommentMode = exports.CommentMode || (exports.CommentMode = {}));
    var InlineHintKind;
    (function (InlineHintKind) {
        InlineHintKind[InlineHintKind["Other"] = 0] = "Other";
        InlineHintKind[InlineHintKind["Type"] = 1] = "Type";
        InlineHintKind[InlineHintKind["Parameter"] = 2] = "Parameter";
    })(InlineHintKind = exports.InlineHintKind || (exports.InlineHintKind = {}));
    // --- feature registries ------
    /**
     * @internal
     */
    exports.ReferenceProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.RenameProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.CompletionProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.SignatureHelpProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.HoverProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.EvaluatableExpressionProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.InlineValuesProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DocumentSymbolProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DocumentHighlightProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.LinkedEditingRangeProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DefinitionProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DeclarationProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.ImplementationProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.TypeDefinitionProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.CodeLensProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.InlineHintsProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.CodeActionProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DocumentFormattingEditProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DocumentRangeFormattingEditProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.OnTypeFormattingEditProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.LinkProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.ColorProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.SelectionRangeRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.FoldingRangeProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DocumentSemanticTokensProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.DocumentRangeSemanticTokensProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    /**
     * @internal
     */
    exports.TokenizationRegistry = new tokenizationRegistry_1.TokenizationRegistryImpl();
    /**
     * @internal
     */
    var ExternalUriOpenerPriority;
    (function (ExternalUriOpenerPriority) {
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["None"] = 0] = "None";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Option"] = 1] = "Option";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Default"] = 2] = "Default";
        ExternalUriOpenerPriority[ExternalUriOpenerPriority["Preferred"] = 3] = "Preferred";
    })(ExternalUriOpenerPriority = exports.ExternalUriOpenerPriority || (exports.ExternalUriOpenerPriority = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[47/*vs/editor/common/core/lineTokens*/], __M([0/*require*/,1/*exports*/,22/*vs/editor/common/modes*/]), function (require, exports, modes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlicedLineTokens = exports.LineTokens = void 0;
    class LineTokens {
        constructor(tokens, text) {
            this._tokens = tokens;
            this._tokensCount = (this._tokens.length >>> 1);
            this._text = text;
        }
        equals(other) {
            if (other instanceof LineTokens) {
                return this.slicedEquals(other, 0, this._tokensCount);
            }
            return false;
        }
        slicedEquals(other, sliceFromTokenIndex, sliceTokenCount) {
            if (this._text !== other._text) {
                return false;
            }
            if (this._tokensCount !== other._tokensCount) {
                return false;
            }
            const from = (sliceFromTokenIndex << 1);
            const to = from + (sliceTokenCount << 1);
            for (let i = from; i < to; i++) {
                if (this._tokens[i] !== other._tokens[i]) {
                    return false;
                }
            }
            return true;
        }
        getLineContent() {
            return this._text;
        }
        getCount() {
            return this._tokensCount;
        }
        getStartOffset(tokenIndex) {
            if (tokenIndex > 0) {
                return this._tokens[(tokenIndex - 1) << 1];
            }
            return 0;
        }
        getMetadata(tokenIndex) {
            const metadata = this._tokens[(tokenIndex << 1) + 1];
            return metadata;
        }
        getLanguageId(tokenIndex) {
            const metadata = this._tokens[(tokenIndex << 1) + 1];
            return modes_1.TokenMetadata.getLanguageId(metadata);
        }
        getStandardTokenType(tokenIndex) {
            const metadata = this._tokens[(tokenIndex << 1) + 1];
            return modes_1.TokenMetadata.getTokenType(metadata);
        }
        getForeground(tokenIndex) {
            const metadata = this._tokens[(tokenIndex << 1) + 1];
            return modes_1.TokenMetadata.getForeground(metadata);
        }
        getClassName(tokenIndex) {
            const metadata = this._tokens[(tokenIndex << 1) + 1];
            return modes_1.TokenMetadata.getClassNameFromMetadata(metadata);
        }
        getInlineStyle(tokenIndex, colorMap) {
            const metadata = this._tokens[(tokenIndex << 1) + 1];
            return modes_1.TokenMetadata.getInlineStyleFromMetadata(metadata, colorMap);
        }
        getEndOffset(tokenIndex) {
            return this._tokens[tokenIndex << 1];
        }
        /**
         * Find the token containing offset `offset`.
         * @param offset The search offset
         * @return The index of the token containing the offset.
         */
        findTokenIndexAtOffset(offset) {
            return LineTokens.findIndexInTokensArray(this._tokens, offset);
        }
        inflate() {
            return this;
        }
        sliceAndInflate(startOffset, endOffset, deltaOffset) {
            return new SlicedLineTokens(this, startOffset, endOffset, deltaOffset);
        }
        static convertToEndOffset(tokens, lineTextLength) {
            const tokenCount = (tokens.length >>> 1);
            const lastTokenIndex = tokenCount - 1;
            for (let tokenIndex = 0; tokenIndex < lastTokenIndex; tokenIndex++) {
                tokens[tokenIndex << 1] = tokens[(tokenIndex + 1) << 1];
            }
            tokens[lastTokenIndex << 1] = lineTextLength;
        }
        static findIndexInTokensArray(tokens, desiredIndex) {
            if (tokens.length <= 2) {
                return 0;
            }
            let low = 0;
            let high = (tokens.length >>> 1) - 1;
            while (low < high) {
                const mid = low + Math.floor((high - low) / 2);
                const endOffset = tokens[(mid << 1)];
                if (endOffset === desiredIndex) {
                    return mid + 1;
                }
                else if (endOffset < desiredIndex) {
                    low = mid + 1;
                }
                else if (endOffset > desiredIndex) {
                    high = mid;
                }
            }
            return low;
        }
    }
    exports.LineTokens = LineTokens;
    class SlicedLineTokens {
        constructor(source, startOffset, endOffset, deltaOffset) {
            this._source = source;
            this._startOffset = startOffset;
            this._endOffset = endOffset;
            this._deltaOffset = deltaOffset;
            this._firstTokenIndex = source.findTokenIndexAtOffset(startOffset);
            this._tokensCount = 0;
            for (let i = this._firstTokenIndex, len = source.getCount(); i < len; i++) {
                const tokenStartOffset = source.getStartOffset(i);
                if (tokenStartOffset >= endOffset) {
                    break;
                }
                this._tokensCount++;
            }
        }
        equals(other) {
            if (other instanceof SlicedLineTokens) {
                return (this._startOffset === other._startOffset
                    && this._endOffset === other._endOffset
                    && this._deltaOffset === other._deltaOffset
                    && this._source.slicedEquals(other._source, this._firstTokenIndex, this._tokensCount));
            }
            return false;
        }
        getCount() {
            return this._tokensCount;
        }
        getForeground(tokenIndex) {
            return this._source.getForeground(this._firstTokenIndex + tokenIndex);
        }
        getEndOffset(tokenIndex) {
            const tokenEndOffset = this._source.getEndOffset(this._firstTokenIndex + tokenIndex);
            return Math.min(this._endOffset, tokenEndOffset) - this._startOffset + this._deltaOffset;
        }
        getClassName(tokenIndex) {
            return this._source.getClassName(this._firstTokenIndex + tokenIndex);
        }
        getInlineStyle(tokenIndex, colorMap) {
            return this._source.getInlineStyle(this._firstTokenIndex + tokenIndex, colorMap);
        }
        findTokenIndexAtOffset(offset) {
            return this._source.findTokenIndexAtOffset(offset + this._startOffset - this._deltaOffset) - this._firstTokenIndex;
        }
    }
    exports.SlicedLineTokens = SlicedLineTokens;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[48/*vs/editor/common/model/tokensStore*/], __M([0/*require*/,1/*exports*/,24/*vs/base/common/arrays*/,47/*vs/editor/common/core/lineTokens*/,10/*vs/editor/common/core/position*/,7/*vs/editor/common/core/range*/,22/*vs/editor/common/modes*/,11/*vs/base/common/buffer*/]), function (require, exports, arrays, lineTokens_1, position_1, range_1, modes_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokensStore = exports.TokensStore2 = exports.MultilineTokens = exports.MultilineTokens2 = exports.LineTokens2 = exports.SparseEncodedTokens = exports.MultilineTokensBuilder = exports.countEOL = exports.StringEOL = void 0;
    var StringEOL;
    (function (StringEOL) {
        StringEOL[StringEOL["Unknown"] = 0] = "Unknown";
        StringEOL[StringEOL["Invalid"] = 3] = "Invalid";
        StringEOL[StringEOL["LF"] = 1] = "LF";
        StringEOL[StringEOL["CRLF"] = 2] = "CRLF";
    })(StringEOL = exports.StringEOL || (exports.StringEOL = {}));
    function countEOL(text) {
        let eolCount = 0;
        let firstLineLength = 0;
        let lastLineStart = 0;
        let eol = 0 /* Unknown */;
        for (let i = 0, len = text.length; i < len; i++) {
            const chr = text.charCodeAt(i);
            if (chr === 13 /* CarriageReturn */) {
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                if (i + 1 < len && text.charCodeAt(i + 1) === 10 /* LineFeed */) {
                    // \r\n... case
                    eol |= 2 /* CRLF */;
                    i++; // skip \n
                }
                else {
                    // \r... case
                    eol |= 3 /* Invalid */;
                }
                lastLineStart = i + 1;
            }
            else if (chr === 10 /* LineFeed */) {
                // \n... case
                eol |= 1 /* LF */;
                if (eolCount === 0) {
                    firstLineLength = i;
                }
                eolCount++;
                lastLineStart = i + 1;
            }
        }
        if (eolCount === 0) {
            firstLineLength = text.length;
        }
        return [eolCount, firstLineLength, text.length - lastLineStart, eol];
    }
    exports.countEOL = countEOL;
    function getDefaultMetadata(topLevelLanguageId) {
        return ((topLevelLanguageId << 0 /* LANGUAGEID_OFFSET */)
            | (0 /* Other */ << 8 /* TOKEN_TYPE_OFFSET */)
            | (0 /* None */ << 11 /* FONT_STYLE_OFFSET */)
            | (1 /* DefaultForeground */ << 14 /* FOREGROUND_OFFSET */)
            | (2 /* DefaultBackground */ << 23 /* BACKGROUND_OFFSET */)) >>> 0;
    }
    const EMPTY_LINE_TOKENS = (new Uint32Array(0)).buffer;
    class MultilineTokensBuilder {
        constructor() {
            this.tokens = [];
        }
        add(lineNumber, lineTokens) {
            if (this.tokens.length > 0) {
                const last = this.tokens[this.tokens.length - 1];
                const lastLineNumber = last.startLineNumber + last.tokens.length - 1;
                if (lastLineNumber + 1 === lineNumber) {
                    // append
                    last.tokens.push(lineTokens);
                    return;
                }
            }
            this.tokens.push(new MultilineTokens(lineNumber, [lineTokens]));
        }
        static deserialize(buff) {
            let offset = 0;
            const count = (0, buffer_1.readUInt32BE)(buff, offset);
            offset += 4;
            let result = [];
            for (let i = 0; i < count; i++) {
                offset = MultilineTokens.deserialize(buff, offset, result);
            }
            return result;
        }
        serialize() {
            const size = this._serializeSize();
            const result = new Uint8Array(size);
            this._serialize(result);
            return result;
        }
        _serializeSize() {
            let result = 0;
            result += 4; // 4 bytes for the count
            for (let i = 0; i < this.tokens.length; i++) {
                result += this.tokens[i].serializeSize();
            }
            return result;
        }
        _serialize(destination) {
            let offset = 0;
            (0, buffer_1.writeUInt32BE)(destination, this.tokens.length, offset);
            offset += 4;
            for (let i = 0; i < this.tokens.length; i++) {
                offset = this.tokens[i].serialize(destination, offset);
            }
        }
    }
    exports.MultilineTokensBuilder = MultilineTokensBuilder;
    class SparseEncodedTokens {
        constructor(tokens) {
            this._tokens = tokens;
            this._tokenCount = tokens.length / 4;
        }
        toString(startLineNumber) {
            let pieces = [];
            for (let i = 0; i < this._tokenCount; i++) {
                pieces.push(`(${this._getDeltaLine(i) + startLineNumber},${this._getStartCharacter(i)}-${this._getEndCharacter(i)})`);
            }
            return `[${pieces.join(',')}]`;
        }
        getMaxDeltaLine() {
            const tokenCount = this._getTokenCount();
            if (tokenCount === 0) {
                return -1;
            }
            return this._getDeltaLine(tokenCount - 1);
        }
        getRange() {
            const tokenCount = this._getTokenCount();
            if (tokenCount === 0) {
                return null;
            }
            const startChar = this._getStartCharacter(0);
            const maxDeltaLine = this._getDeltaLine(tokenCount - 1);
            const endChar = this._getEndCharacter(tokenCount - 1);
            return new range_1.Range(0, startChar + 1, maxDeltaLine, endChar + 1);
        }
        _getTokenCount() {
            return this._tokenCount;
        }
        _getDeltaLine(tokenIndex) {
            return this._tokens[4 * tokenIndex];
        }
        _getStartCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 1];
        }
        _getEndCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 2];
        }
        isEmpty() {
            return (this._getTokenCount() === 0);
        }
        getLineTokens(deltaLine) {
            let low = 0;
            let high = this._getTokenCount() - 1;
            while (low < high) {
                const mid = low + Math.floor((high - low) / 2);
                const midDeltaLine = this._getDeltaLine(mid);
                if (midDeltaLine < deltaLine) {
                    low = mid + 1;
                }
                else if (midDeltaLine > deltaLine) {
                    high = mid - 1;
                }
                else {
                    let min = mid;
                    while (min > low && this._getDeltaLine(min - 1) === deltaLine) {
                        min--;
                    }
                    let max = mid;
                    while (max < high && this._getDeltaLine(max + 1) === deltaLine) {
                        max++;
                    }
                    return new LineTokens2(this._tokens.subarray(4 * min, 4 * max + 4));
                }
            }
            if (this._getDeltaLine(low) === deltaLine) {
                return new LineTokens2(this._tokens.subarray(4 * low, 4 * low + 4));
            }
            return null;
        }
        clear() {
            this._tokenCount = 0;
        }
        removeTokens(startDeltaLine, startChar, endDeltaLine, endChar) {
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            let newTokenCount = 0;
            let hasDeletedTokens = false;
            let firstDeltaLine = 0;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 4 * i;
                const tokenDeltaLine = tokens[srcOffset];
                const tokenStartCharacter = tokens[srcOffset + 1];
                const tokenEndCharacter = tokens[srcOffset + 2];
                const tokenMetadata = tokens[srcOffset + 3];
                if ((tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))
                    && (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))) {
                    hasDeletedTokens = true;
                }
                else {
                    if (newTokenCount === 0) {
                        firstDeltaLine = tokenDeltaLine;
                    }
                    if (hasDeletedTokens) {
                        // must move the token to the left
                        const destOffset = 4 * newTokenCount;
                        tokens[destOffset] = tokenDeltaLine - firstDeltaLine;
                        tokens[destOffset + 1] = tokenStartCharacter;
                        tokens[destOffset + 2] = tokenEndCharacter;
                        tokens[destOffset + 3] = tokenMetadata;
                    }
                    newTokenCount++;
                }
            }
            this._tokenCount = newTokenCount;
            return firstDeltaLine;
        }
        split(startDeltaLine, startChar, endDeltaLine, endChar) {
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            let aTokens = [];
            let bTokens = [];
            let destTokens = aTokens;
            let destOffset = 0;
            let destFirstDeltaLine = 0;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 4 * i;
                const tokenDeltaLine = tokens[srcOffset];
                const tokenStartCharacter = tokens[srcOffset + 1];
                const tokenEndCharacter = tokens[srcOffset + 2];
                const tokenMetadata = tokens[srcOffset + 3];
                if ((tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))) {
                    if ((tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))) {
                        // this token is touching the range
                        continue;
                    }
                    else {
                        // this token is after the range
                        if (destTokens !== bTokens) {
                            // this token is the first token after the range
                            destTokens = bTokens;
                            destOffset = 0;
                            destFirstDeltaLine = tokenDeltaLine;
                        }
                    }
                }
                destTokens[destOffset++] = tokenDeltaLine - destFirstDeltaLine;
                destTokens[destOffset++] = tokenStartCharacter;
                destTokens[destOffset++] = tokenEndCharacter;
                destTokens[destOffset++] = tokenMetadata;
            }
            return [new SparseEncodedTokens(new Uint32Array(aTokens)), new SparseEncodedTokens(new Uint32Array(bTokens)), destFirstDeltaLine];
        }
        acceptDeleteRange(horizontalShiftForFirstLineTokens, startDeltaLine, startCharacter, endDeltaLine, endCharacter) {
            // This is a bit complex, here are the cases I used to think about this:
            //
            // 1. The token starts before the deletion range
            // 1a. The token is completely before the deletion range
            //               -----------
            //                          xxxxxxxxxxx
            // 1b. The token starts before, the deletion range ends after the token
            //               -----------
            //                      xxxxxxxxxxx
            // 1c. The token starts before, the deletion range ends precisely with the token
            //               ---------------
            //                      xxxxxxxx
            // 1d. The token starts before, the deletion range is inside the token
            //               ---------------
            //                    xxxxx
            //
            // 2. The token starts at the same position with the deletion range
            // 2a. The token starts at the same position, and ends inside the deletion range
            //               -------
            //               xxxxxxxxxxx
            // 2b. The token starts at the same position, and ends at the same position as the deletion range
            //               ----------
            //               xxxxxxxxxx
            // 2c. The token starts at the same position, and ends after the deletion range
            //               -------------
            //               xxxxxxx
            //
            // 3. The token starts inside the deletion range
            // 3a. The token is inside the deletion range
            //                -------
            //             xxxxxxxxxxxxx
            // 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
            //                ----------
            //             xxxxxxxxxxxxx
            // 3c. The token starts inside the deletion range, and ends after the deletion range
            //                ------------
            //             xxxxxxxxxxx
            //
            // 4. The token starts after the deletion range
            //                  -----------
            //          xxxxxxxx
            //
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            const deletedLineCount = (endDeltaLine - startDeltaLine);
            let newTokenCount = 0;
            let hasDeletedTokens = false;
            for (let i = 0; i < tokenCount; i++) {
                const srcOffset = 4 * i;
                let tokenDeltaLine = tokens[srcOffset];
                let tokenStartCharacter = tokens[srcOffset + 1];
                let tokenEndCharacter = tokens[srcOffset + 2];
                const tokenMetadata = tokens[srcOffset + 3];
                if (tokenDeltaLine < startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter <= startCharacter)) {
                    // 1a. The token is completely before the deletion range
                    // => nothing to do
                    newTokenCount++;
                    continue;
                }
                else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter < startCharacter) {
                    // 1b, 1c, 1d
                    // => the token survives, but it needs to shrink
                    if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                        // 1d. The token starts before, the deletion range is inside the token
                        // => the token shrinks by the deletion character count
                        tokenEndCharacter -= (endCharacter - startCharacter);
                    }
                    else {
                        // 1b. The token starts before, the deletion range ends after the token
                        // 1c. The token starts before, the deletion range ends precisely with the token
                        // => the token shrinks its ending to the deletion start
                        tokenEndCharacter = startCharacter;
                    }
                }
                else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter === startCharacter) {
                    // 2a, 2b, 2c
                    if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                        // 2c. The token starts at the same position, and ends after the deletion range
                        // => the token shrinks by the deletion character count
                        tokenEndCharacter -= (endCharacter - startCharacter);
                    }
                    else {
                        // 2a. The token starts at the same position, and ends inside the deletion range
                        // 2b. The token starts at the same position, and ends at the same position as the deletion range
                        // => the token is deleted
                        hasDeletedTokens = true;
                        continue;
                    }
                }
                else if (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter < endCharacter)) {
                    // 3a, 3b, 3c
                    if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                        // 3c. The token starts inside the deletion range, and ends after the deletion range
                        // => the token moves left and shrinks
                        if (tokenDeltaLine === startDeltaLine) {
                            // the deletion started on the same line as the token
                            // => the token moves left and shrinks
                            tokenStartCharacter = startCharacter;
                            tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
                        }
                        else {
                            // the deletion started on a line above the token
                            // => the token moves to the beginning of the line
                            tokenStartCharacter = 0;
                            tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
                        }
                    }
                    else {
                        // 3a. The token is inside the deletion range
                        // 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
                        // => the token is deleted
                        hasDeletedTokens = true;
                        continue;
                    }
                }
                else if (tokenDeltaLine > endDeltaLine) {
                    // 4. (partial) The token starts after the deletion range, on a line below...
                    if (deletedLineCount === 0 && !hasDeletedTokens) {
                        // early stop, there is no need to walk all the tokens and do nothing...
                        newTokenCount = tokenCount;
                        break;
                    }
                    tokenDeltaLine -= deletedLineCount;
                }
                else if (tokenDeltaLine === endDeltaLine && tokenStartCharacter >= endCharacter) {
                    // 4. (continued) The token starts after the deletion range, on the last line where a deletion occurs
                    if (horizontalShiftForFirstLineTokens && tokenDeltaLine === 0) {
                        tokenStartCharacter += horizontalShiftForFirstLineTokens;
                        tokenEndCharacter += horizontalShiftForFirstLineTokens;
                    }
                    tokenDeltaLine -= deletedLineCount;
                    tokenStartCharacter -= (endCharacter - startCharacter);
                    tokenEndCharacter -= (endCharacter - startCharacter);
                }
                else {
                    throw new Error(`Not possible!`);
                }
                const destOffset = 4 * newTokenCount;
                tokens[destOffset] = tokenDeltaLine;
                tokens[destOffset + 1] = tokenStartCharacter;
                tokens[destOffset + 2] = tokenEndCharacter;
                tokens[destOffset + 3] = tokenMetadata;
                newTokenCount++;
            }
            this._tokenCount = newTokenCount;
        }
        acceptInsertText(deltaLine, character, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            // Here are the cases I used to think about this:
            //
            // 1. The token is completely before the insertion point
            //            -----------   |
            // 2. The token ends precisely at the insertion point
            //            -----------|
            // 3. The token contains the insertion point
            //            -----|------
            // 4. The token starts precisely at the insertion point
            //            |-----------
            // 5. The token is completely after the insertion point
            //            |   -----------
            //
            const isInsertingPreciselyOneWordCharacter = (eolCount === 0
                && firstLineLength === 1
                && ((firstCharCode >= 48 /* Digit0 */ && firstCharCode <= 57 /* Digit9 */)
                    || (firstCharCode >= 65 /* A */ && firstCharCode <= 90 /* Z */)
                    || (firstCharCode >= 97 /* a */ && firstCharCode <= 122 /* z */)));
            const tokens = this._tokens;
            const tokenCount = this._tokenCount;
            for (let i = 0; i < tokenCount; i++) {
                const offset = 4 * i;
                let tokenDeltaLine = tokens[offset];
                let tokenStartCharacter = tokens[offset + 1];
                let tokenEndCharacter = tokens[offset + 2];
                if (tokenDeltaLine < deltaLine || (tokenDeltaLine === deltaLine && tokenEndCharacter < character)) {
                    // 1. The token is completely before the insertion point
                    // => nothing to do
                    continue;
                }
                else if (tokenDeltaLine === deltaLine && tokenEndCharacter === character) {
                    // 2. The token ends precisely at the insertion point
                    // => expand the end character only if inserting precisely one character that is a word character
                    if (isInsertingPreciselyOneWordCharacter) {
                        tokenEndCharacter += 1;
                    }
                    else {
                        continue;
                    }
                }
                else if (tokenDeltaLine === deltaLine && tokenStartCharacter < character && character < tokenEndCharacter) {
                    // 3. The token contains the insertion point
                    if (eolCount === 0) {
                        // => just expand the end character
                        tokenEndCharacter += firstLineLength;
                    }
                    else {
                        // => cut off the token
                        tokenEndCharacter = character;
                    }
                }
                else {
                    // 4. or 5.
                    if (tokenDeltaLine === deltaLine && tokenStartCharacter === character) {
                        // 4. The token starts precisely at the insertion point
                        // => grow the token (by keeping its start constant) only if inserting precisely one character that is a word character
                        // => otherwise behave as in case 5.
                        if (isInsertingPreciselyOneWordCharacter) {
                            continue;
                        }
                    }
                    // => the token must move and keep its size constant
                    if (tokenDeltaLine === deltaLine) {
                        tokenDeltaLine += eolCount;
                        // this token is on the line where the insertion is taking place
                        if (eolCount === 0) {
                            tokenStartCharacter += firstLineLength;
                            tokenEndCharacter += firstLineLength;
                        }
                        else {
                            const tokenLength = tokenEndCharacter - tokenStartCharacter;
                            tokenStartCharacter = lastLineLength + (tokenStartCharacter - character);
                            tokenEndCharacter = tokenStartCharacter + tokenLength;
                        }
                    }
                    else {
                        tokenDeltaLine += eolCount;
                    }
                }
                tokens[offset] = tokenDeltaLine;
                tokens[offset + 1] = tokenStartCharacter;
                tokens[offset + 2] = tokenEndCharacter;
            }
        }
    }
    exports.SparseEncodedTokens = SparseEncodedTokens;
    class LineTokens2 {
        constructor(tokens) {
            this._tokens = tokens;
        }
        getCount() {
            return this._tokens.length / 4;
        }
        getStartCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 1];
        }
        getEndCharacter(tokenIndex) {
            return this._tokens[4 * tokenIndex + 2];
        }
        getMetadata(tokenIndex) {
            return this._tokens[4 * tokenIndex + 3];
        }
    }
    exports.LineTokens2 = LineTokens2;
    class MultilineTokens2 {
        constructor(startLineNumber, tokens) {
            this.startLineNumber = startLineNumber;
            this.tokens = tokens;
            this.endLineNumber = this.startLineNumber + this.tokens.getMaxDeltaLine();
        }
        toString() {
            return this.tokens.toString(this.startLineNumber);
        }
        _updateEndLineNumber() {
            this.endLineNumber = this.startLineNumber + this.tokens.getMaxDeltaLine();
        }
        isEmpty() {
            return this.tokens.isEmpty();
        }
        getLineTokens(lineNumber) {
            if (this.startLineNumber <= lineNumber && lineNumber <= this.endLineNumber) {
                return this.tokens.getLineTokens(lineNumber - this.startLineNumber);
            }
            return null;
        }
        getRange() {
            const deltaRange = this.tokens.getRange();
            if (!deltaRange) {
                return deltaRange;
            }
            return new range_1.Range(this.startLineNumber + deltaRange.startLineNumber, deltaRange.startColumn, this.startLineNumber + deltaRange.endLineNumber, deltaRange.endColumn);
        }
        removeTokens(range) {
            const startLineIndex = range.startLineNumber - this.startLineNumber;
            const endLineIndex = range.endLineNumber - this.startLineNumber;
            this.startLineNumber += this.tokens.removeTokens(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
            this._updateEndLineNumber();
        }
        split(range) {
            // split tokens to two:
            // a) all the tokens before `range`
            // b) all the tokens after `range`
            const startLineIndex = range.startLineNumber - this.startLineNumber;
            const endLineIndex = range.endLineNumber - this.startLineNumber;
            const [a, b, bDeltaLine] = this.tokens.split(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
            return [new MultilineTokens2(this.startLineNumber, a), new MultilineTokens2(this.startLineNumber + bDeltaLine, b)];
        }
        applyEdit(range, text) {
            const [eolCount, firstLineLength, lastLineLength] = countEOL(text);
            this.acceptEdit(range, eolCount, firstLineLength, lastLineLength, text.length > 0 ? text.charCodeAt(0) : 0 /* Null */);
        }
        acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            this._acceptDeleteRange(range);
            this._acceptInsertText(new position_1.Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength, lastLineLength, firstCharCode);
            this._updateEndLineNumber();
        }
        _acceptDeleteRange(range) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            const firstLineIndex = range.startLineNumber - this.startLineNumber;
            const lastLineIndex = range.endLineNumber - this.startLineNumber;
            if (lastLineIndex < 0) {
                // this deletion occurs entirely before this block, so we only need to adjust line numbers
                const deletedLinesCount = lastLineIndex - firstLineIndex;
                this.startLineNumber -= deletedLinesCount;
                return;
            }
            const tokenMaxDeltaLine = this.tokens.getMaxDeltaLine();
            if (firstLineIndex >= tokenMaxDeltaLine + 1) {
                // this deletion occurs entirely after this block, so there is nothing to do
                return;
            }
            if (firstLineIndex < 0 && lastLineIndex >= tokenMaxDeltaLine + 1) {
                // this deletion completely encompasses this block
                this.startLineNumber = 0;
                this.tokens.clear();
                return;
            }
            if (firstLineIndex < 0) {
                const deletedBefore = -firstLineIndex;
                this.startLineNumber -= deletedBefore;
                this.tokens.acceptDeleteRange(range.startColumn - 1, 0, 0, lastLineIndex, range.endColumn - 1);
            }
            else {
                this.tokens.acceptDeleteRange(0, firstLineIndex, range.startColumn - 1, lastLineIndex, range.endColumn - 1);
            }
        }
        _acceptInsertText(position, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - this.startLineNumber;
            if (lineIndex < 0) {
                // this insertion occurs before this block, so we only need to adjust line numbers
                this.startLineNumber += eolCount;
                return;
            }
            const tokenMaxDeltaLine = this.tokens.getMaxDeltaLine();
            if (lineIndex >= tokenMaxDeltaLine + 1) {
                // this insertion occurs after this block, so there is nothing to do
                return;
            }
            this.tokens.acceptInsertText(lineIndex, position.column - 1, eolCount, firstLineLength, lastLineLength, firstCharCode);
        }
    }
    exports.MultilineTokens2 = MultilineTokens2;
    class MultilineTokens {
        constructor(startLineNumber, tokens) {
            this.startLineNumber = startLineNumber;
            this.tokens = tokens;
        }
        static deserialize(buff, offset, result) {
            const view32 = new Uint32Array(buff.buffer);
            const startLineNumber = (0, buffer_1.readUInt32BE)(buff, offset);
            offset += 4;
            const count = (0, buffer_1.readUInt32BE)(buff, offset);
            offset += 4;
            let tokens = [];
            for (let i = 0; i < count; i++) {
                const byteCount = (0, buffer_1.readUInt32BE)(buff, offset);
                offset += 4;
                tokens.push(view32.subarray(offset / 4, offset / 4 + byteCount / 4));
                offset += byteCount;
            }
            result.push(new MultilineTokens(startLineNumber, tokens));
            return offset;
        }
        serializeSize() {
            let result = 0;
            result += 4; // 4 bytes for the start line number
            result += 4; // 4 bytes for the line count
            for (let i = 0; i < this.tokens.length; i++) {
                const lineTokens = this.tokens[i];
                if (!(lineTokens instanceof Uint32Array)) {
                    throw new Error(`Not supported!`);
                }
                result += 4; // 4 bytes for the byte count
                result += lineTokens.byteLength;
            }
            return result;
        }
        serialize(destination, offset) {
            (0, buffer_1.writeUInt32BE)(destination, this.startLineNumber, offset);
            offset += 4;
            (0, buffer_1.writeUInt32BE)(destination, this.tokens.length, offset);
            offset += 4;
            for (let i = 0; i < this.tokens.length; i++) {
                const lineTokens = this.tokens[i];
                if (!(lineTokens instanceof Uint32Array)) {
                    throw new Error(`Not supported!`);
                }
                (0, buffer_1.writeUInt32BE)(destination, lineTokens.byteLength, offset);
                offset += 4;
                destination.set(new Uint8Array(lineTokens.buffer), offset);
                offset += lineTokens.byteLength;
            }
            return offset;
        }
        applyEdit(range, text) {
            const [eolCount, firstLineLength] = countEOL(text);
            this._acceptDeleteRange(range);
            this._acceptInsertText(new position_1.Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
        }
        _acceptDeleteRange(range) {
            if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            const firstLineIndex = range.startLineNumber - this.startLineNumber;
            const lastLineIndex = range.endLineNumber - this.startLineNumber;
            if (lastLineIndex < 0) {
                // this deletion occurs entirely before this block, so we only need to adjust line numbers
                const deletedLinesCount = lastLineIndex - firstLineIndex;
                this.startLineNumber -= deletedLinesCount;
                return;
            }
            if (firstLineIndex >= this.tokens.length) {
                // this deletion occurs entirely after this block, so there is nothing to do
                return;
            }
            if (firstLineIndex < 0 && lastLineIndex >= this.tokens.length) {
                // this deletion completely encompasses this block
                this.startLineNumber = 0;
                this.tokens = [];
                return;
            }
            if (firstLineIndex === lastLineIndex) {
                // a delete on a single line
                this.tokens[firstLineIndex] = TokensStore._delete(this.tokens[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
                return;
            }
            if (firstLineIndex >= 0) {
                // The first line survives
                this.tokens[firstLineIndex] = TokensStore._deleteEnding(this.tokens[firstLineIndex], range.startColumn - 1);
                if (lastLineIndex < this.tokens.length) {
                    // The last line survives
                    const lastLineTokens = TokensStore._deleteBeginning(this.tokens[lastLineIndex], range.endColumn - 1);
                    // Take remaining text on last line and append it to remaining text on first line
                    this.tokens[firstLineIndex] = TokensStore._append(this.tokens[firstLineIndex], lastLineTokens);
                    // Delete middle lines
                    this.tokens.splice(firstLineIndex + 1, lastLineIndex - firstLineIndex);
                }
                else {
                    // The last line does not survive
                    // Take remaining text on last line and append it to remaining text on first line
                    this.tokens[firstLineIndex] = TokensStore._append(this.tokens[firstLineIndex], null);
                    // Delete lines
                    this.tokens = this.tokens.slice(0, firstLineIndex + 1);
                }
            }
            else {
                // The first line does not survive
                const deletedBefore = -firstLineIndex;
                this.startLineNumber -= deletedBefore;
                // Remove beginning from last line
                this.tokens[lastLineIndex] = TokensStore._deleteBeginning(this.tokens[lastLineIndex], range.endColumn - 1);
                // Delete lines
                this.tokens = this.tokens.slice(lastLineIndex);
            }
        }
        _acceptInsertText(position, eolCount, firstLineLength) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - this.startLineNumber;
            if (lineIndex < 0) {
                // this insertion occurs before this block, so we only need to adjust line numbers
                this.startLineNumber += eolCount;
                return;
            }
            if (lineIndex >= this.tokens.length) {
                // this insertion occurs after this block, so there is nothing to do
                return;
            }
            if (eolCount === 0) {
                // Inserting text on one line
                this.tokens[lineIndex] = TokensStore._insert(this.tokens[lineIndex], position.column - 1, firstLineLength);
                return;
            }
            this.tokens[lineIndex] = TokensStore._deleteEnding(this.tokens[lineIndex], position.column - 1);
            this.tokens[lineIndex] = TokensStore._insert(this.tokens[lineIndex], position.column - 1, firstLineLength);
            this._insertLines(position.lineNumber, eolCount);
        }
        _insertLines(insertIndex, insertCount) {
            if (insertCount === 0) {
                return;
            }
            let lineTokens = [];
            for (let i = 0; i < insertCount; i++) {
                lineTokens[i] = null;
            }
            this.tokens = arrays.arrayInsert(this.tokens, insertIndex, lineTokens);
        }
    }
    exports.MultilineTokens = MultilineTokens;
    function toUint32Array(arr) {
        if (arr instanceof Uint32Array) {
            return arr;
        }
        else {
            return new Uint32Array(arr);
        }
    }
    class TokensStore2 {
        constructor() {
            this._pieces = [];
            this._isComplete = false;
        }
        flush() {
            this._pieces = [];
            this._isComplete = false;
        }
        isEmpty() {
            return (this._pieces.length === 0);
        }
        set(pieces, isComplete) {
            this._pieces = pieces || [];
            this._isComplete = isComplete;
        }
        setPartial(_range, pieces) {
            // console.log(`setPartial ${_range} ${pieces.map(p => p.toString()).join(', ')}`);
            let range = _range;
            if (pieces.length > 0) {
                const _firstRange = pieces[0].getRange();
                const _lastRange = pieces[pieces.length - 1].getRange();
                if (!_firstRange || !_lastRange) {
                    return _range;
                }
                range = _range.plusRange(_firstRange).plusRange(_lastRange);
            }
            let insertPosition = null;
            for (let i = 0, len = this._pieces.length; i < len; i++) {
                const piece = this._pieces[i];
                if (piece.endLineNumber < range.startLineNumber) {
                    // this piece is before the range
                    continue;
                }
                if (piece.startLineNumber > range.endLineNumber) {
                    // this piece is after the range, so mark the spot before this piece
                    // as a good insertion position and stop looping
                    insertPosition = insertPosition || { index: i };
                    break;
                }
                // this piece might intersect with the range
                piece.removeTokens(range);
                if (piece.isEmpty()) {
                    // remove the piece if it became empty
                    this._pieces.splice(i, 1);
                    i--;
                    len--;
                    continue;
                }
                if (piece.endLineNumber < range.startLineNumber) {
                    // after removal, this piece is before the range
                    continue;
                }
                if (piece.startLineNumber > range.endLineNumber) {
                    // after removal, this piece is after the range
                    insertPosition = insertPosition || { index: i };
                    continue;
                }
                // after removal, this piece contains the range
                const [a, b] = piece.split(range);
                if (a.isEmpty()) {
                    // this piece is actually after the range
                    insertPosition = insertPosition || { index: i };
                    continue;
                }
                if (b.isEmpty()) {
                    // this piece is actually before the range
                    continue;
                }
                this._pieces.splice(i, 1, a, b);
                i++;
                len++;
                insertPosition = insertPosition || { index: i };
            }
            insertPosition = insertPosition || { index: this._pieces.length };
            if (pieces.length > 0) {
                this._pieces = arrays.arrayInsert(this._pieces, insertPosition.index, pieces);
            }
            // console.log(`I HAVE ${this._pieces.length} pieces`);
            // console.log(`${this._pieces.map(p => p.toString()).join('\n')}`);
            return range;
        }
        isComplete() {
            return this._isComplete;
        }
        addSemanticTokens(lineNumber, aTokens) {
            const pieces = this._pieces;
            if (pieces.length === 0) {
                return aTokens;
            }
            const pieceIndex = TokensStore2._findFirstPieceWithLine(pieces, lineNumber);
            const bTokens = pieces[pieceIndex].getLineTokens(lineNumber);
            if (!bTokens) {
                return aTokens;
            }
            const aLen = aTokens.getCount();
            const bLen = bTokens.getCount();
            let aIndex = 0;
            let result = [], resultLen = 0;
            let lastEndOffset = 0;
            const emitToken = (endOffset, metadata) => {
                if (endOffset === lastEndOffset) {
                    return;
                }
                lastEndOffset = endOffset;
                result[resultLen++] = endOffset;
                result[resultLen++] = metadata;
            };
            for (let bIndex = 0; bIndex < bLen; bIndex++) {
                const bStartCharacter = bTokens.getStartCharacter(bIndex);
                const bEndCharacter = bTokens.getEndCharacter(bIndex);
                const bMetadata = bTokens.getMetadata(bIndex);
                const bMask = (((bMetadata & 1 /* SEMANTIC_USE_ITALIC */) ? 2048 /* ITALIC_MASK */ : 0)
                    | ((bMetadata & 2 /* SEMANTIC_USE_BOLD */) ? 4096 /* BOLD_MASK */ : 0)
                    | ((bMetadata & 4 /* SEMANTIC_USE_UNDERLINE */) ? 8192 /* UNDERLINE_MASK */ : 0)
                    | ((bMetadata & 8 /* SEMANTIC_USE_FOREGROUND */) ? 8372224 /* FOREGROUND_MASK */ : 0)
                    | ((bMetadata & 16 /* SEMANTIC_USE_BACKGROUND */) ? 4286578688 /* BACKGROUND_MASK */ : 0)) >>> 0;
                const aMask = (~bMask) >>> 0;
                // push any token from `a` that is before `b`
                while (aIndex < aLen && aTokens.getEndOffset(aIndex) <= bStartCharacter) {
                    emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
                    aIndex++;
                }
                // push the token from `a` if it intersects the token from `b`
                if (aIndex < aLen && aTokens.getStartOffset(aIndex) < bStartCharacter) {
                    emitToken(bStartCharacter, aTokens.getMetadata(aIndex));
                }
                // skip any tokens from `a` that are contained inside `b`
                while (aIndex < aLen && aTokens.getEndOffset(aIndex) < bEndCharacter) {
                    emitToken(aTokens.getEndOffset(aIndex), (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                    aIndex++;
                }
                if (aIndex < aLen) {
                    emitToken(bEndCharacter, (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                    if (aTokens.getEndOffset(aIndex) === bEndCharacter) {
                        // `a` ends exactly at the same spot as `b`!
                        aIndex++;
                    }
                }
                else {
                    const aMergeIndex = Math.min(Math.max(0, aIndex - 1), aLen - 1);
                    // push the token from `b`
                    emitToken(bEndCharacter, (aTokens.getMetadata(aMergeIndex) & aMask) | (bMetadata & bMask));
                }
            }
            // push the remaining tokens from `a`
            while (aIndex < aLen) {
                emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
                aIndex++;
            }
            return new lineTokens_1.LineTokens(new Uint32Array(result), aTokens.getLineContent());
        }
        static _findFirstPieceWithLine(pieces, lineNumber) {
            let low = 0;
            let high = pieces.length - 1;
            while (low < high) {
                let mid = low + Math.floor((high - low) / 2);
                if (pieces[mid].endLineNumber < lineNumber) {
                    low = mid + 1;
                }
                else if (pieces[mid].startLineNumber > lineNumber) {
                    high = mid - 1;
                }
                else {
                    while (mid > low && pieces[mid - 1].startLineNumber <= lineNumber && lineNumber <= pieces[mid - 1].endLineNumber) {
                        mid--;
                    }
                    return mid;
                }
            }
            return low;
        }
        //#region Editing
        acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
            for (const piece of this._pieces) {
                piece.acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode);
            }
        }
    }
    exports.TokensStore2 = TokensStore2;
    class TokensStore {
        constructor() {
            this._lineTokens = [];
            this._len = 0;
        }
        flush() {
            this._lineTokens = [];
            this._len = 0;
        }
        getTokens(topLevelLanguageId, lineIndex, lineText) {
            let rawLineTokens = null;
            if (lineIndex < this._len) {
                rawLineTokens = this._lineTokens[lineIndex];
            }
            if (rawLineTokens !== null && rawLineTokens !== EMPTY_LINE_TOKENS) {
                return new lineTokens_1.LineTokens(toUint32Array(rawLineTokens), lineText);
            }
            let lineTokens = new Uint32Array(2);
            lineTokens[0] = lineText.length;
            lineTokens[1] = getDefaultMetadata(topLevelLanguageId);
            return new lineTokens_1.LineTokens(lineTokens, lineText);
        }
        static _massageTokens(topLevelLanguageId, lineTextLength, _tokens) {
            const tokens = _tokens ? toUint32Array(_tokens) : null;
            if (lineTextLength === 0) {
                let hasDifferentLanguageId = false;
                if (tokens && tokens.length > 1) {
                    hasDifferentLanguageId = (modes_1.TokenMetadata.getLanguageId(tokens[1]) !== topLevelLanguageId);
                }
                if (!hasDifferentLanguageId) {
                    return EMPTY_LINE_TOKENS;
                }
            }
            if (!tokens || tokens.length === 0) {
                const tokens = new Uint32Array(2);
                tokens[0] = lineTextLength;
                tokens[1] = getDefaultMetadata(topLevelLanguageId);
                return tokens.buffer;
            }
            // Ensure the last token covers the end of the text
            tokens[tokens.length - 2] = lineTextLength;
            if (tokens.byteOffset === 0 && tokens.byteLength === tokens.buffer.byteLength) {
                // Store directly the ArrayBuffer pointer to save an object
                return tokens.buffer;
            }
            return tokens;
        }
        _ensureLine(lineIndex) {
            while (lineIndex >= this._len) {
                this._lineTokens[this._len] = null;
                this._len++;
            }
        }
        _deleteLines(start, deleteCount) {
            if (deleteCount === 0) {
                return;
            }
            if (start + deleteCount > this._len) {
                deleteCount = this._len - start;
            }
            this._lineTokens.splice(start, deleteCount);
            this._len -= deleteCount;
        }
        _insertLines(insertIndex, insertCount) {
            if (insertCount === 0) {
                return;
            }
            let lineTokens = [];
            for (let i = 0; i < insertCount; i++) {
                lineTokens[i] = null;
            }
            this._lineTokens = arrays.arrayInsert(this._lineTokens, insertIndex, lineTokens);
            this._len += insertCount;
        }
        setTokens(topLevelLanguageId, lineIndex, lineTextLength, _tokens, checkEquality) {
            const tokens = TokensStore._massageTokens(topLevelLanguageId, lineTextLength, _tokens);
            this._ensureLine(lineIndex);
            const oldTokens = this._lineTokens[lineIndex];
            this._lineTokens[lineIndex] = tokens;
            if (checkEquality) {
                return !TokensStore._equals(oldTokens, tokens);
            }
            return false;
        }
        static _equals(_a, _b) {
            if (!_a || !_b) {
                return !_a && !_b;
            }
            const a = toUint32Array(_a);
            const b = toUint32Array(_b);
            if (a.length !== b.length) {
                return false;
            }
            for (let i = 0, len = a.length; i < len; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }
        //#region Editing
        acceptEdit(range, eolCount, firstLineLength) {
            this._acceptDeleteRange(range);
            this._acceptInsertText(new position_1.Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
        }
        _acceptDeleteRange(range) {
            const firstLineIndex = range.startLineNumber - 1;
            if (firstLineIndex >= this._len) {
                return;
            }
            if (range.startLineNumber === range.endLineNumber) {
                if (range.startColumn === range.endColumn) {
                    // Nothing to delete
                    return;
                }
                this._lineTokens[firstLineIndex] = TokensStore._delete(this._lineTokens[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
                return;
            }
            this._lineTokens[firstLineIndex] = TokensStore._deleteEnding(this._lineTokens[firstLineIndex], range.startColumn - 1);
            const lastLineIndex = range.endLineNumber - 1;
            let lastLineTokens = null;
            if (lastLineIndex < this._len) {
                lastLineTokens = TokensStore._deleteBeginning(this._lineTokens[lastLineIndex], range.endColumn - 1);
            }
            // Take remaining text on last line and append it to remaining text on first line
            this._lineTokens[firstLineIndex] = TokensStore._append(this._lineTokens[firstLineIndex], lastLineTokens);
            // Delete middle lines
            this._deleteLines(range.startLineNumber, range.endLineNumber - range.startLineNumber);
        }
        _acceptInsertText(position, eolCount, firstLineLength) {
            if (eolCount === 0 && firstLineLength === 0) {
                // Nothing to insert
                return;
            }
            const lineIndex = position.lineNumber - 1;
            if (lineIndex >= this._len) {
                return;
            }
            if (eolCount === 0) {
                // Inserting text on one line
                this._lineTokens[lineIndex] = TokensStore._insert(this._lineTokens[lineIndex], position.column - 1, firstLineLength);
                return;
            }
            this._lineTokens[lineIndex] = TokensStore._deleteEnding(this._lineTokens[lineIndex], position.column - 1);
            this._lineTokens[lineIndex] = TokensStore._insert(this._lineTokens[lineIndex], position.column - 1, firstLineLength);
            this._insertLines(position.lineNumber, eolCount);
        }
        static _deleteBeginning(lineTokens, toChIndex) {
            if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            return TokensStore._delete(lineTokens, 0, toChIndex);
        }
        static _deleteEnding(lineTokens, fromChIndex) {
            if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const lineTextLength = tokens[tokens.length - 2];
            return TokensStore._delete(lineTokens, fromChIndex, lineTextLength);
        }
        static _delete(lineTokens, fromChIndex, toChIndex) {
            if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS || fromChIndex === toChIndex) {
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            // special case: deleting everything
            if (fromChIndex === 0 && tokens[tokens.length - 2] === toChIndex) {
                return EMPTY_LINE_TOKENS;
            }
            const fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, fromChIndex);
            const fromTokenStartOffset = (fromTokenIndex > 0 ? tokens[(fromTokenIndex - 1) << 1] : 0);
            const fromTokenEndOffset = tokens[fromTokenIndex << 1];
            if (toChIndex < fromTokenEndOffset) {
                // the delete range is inside a single token
                const delta = (toChIndex - fromChIndex);
                for (let i = fromTokenIndex; i < tokensCount; i++) {
                    tokens[i << 1] -= delta;
                }
                return lineTokens;
            }
            let dest;
            let lastEnd;
            if (fromTokenStartOffset !== fromChIndex) {
                tokens[fromTokenIndex << 1] = fromChIndex;
                dest = ((fromTokenIndex + 1) << 1);
                lastEnd = fromChIndex;
            }
            else {
                dest = (fromTokenIndex << 1);
                lastEnd = fromTokenStartOffset;
            }
            const delta = (toChIndex - fromChIndex);
            for (let tokenIndex = fromTokenIndex + 1; tokenIndex < tokensCount; tokenIndex++) {
                const tokenEndOffset = tokens[tokenIndex << 1] - delta;
                if (tokenEndOffset > lastEnd) {
                    tokens[dest++] = tokenEndOffset;
                    tokens[dest++] = tokens[(tokenIndex << 1) + 1];
                    lastEnd = tokenEndOffset;
                }
            }
            if (dest === tokens.length) {
                // nothing to trim
                return lineTokens;
            }
            let tmp = new Uint32Array(dest);
            tmp.set(tokens.subarray(0, dest), 0);
            return tmp.buffer;
        }
        static _append(lineTokens, _otherTokens) {
            if (_otherTokens === EMPTY_LINE_TOKENS) {
                return lineTokens;
            }
            if (lineTokens === EMPTY_LINE_TOKENS) {
                return _otherTokens;
            }
            if (lineTokens === null) {
                return lineTokens;
            }
            if (_otherTokens === null) {
                // cannot determine combined line length...
                return null;
            }
            const myTokens = toUint32Array(lineTokens);
            const otherTokens = toUint32Array(_otherTokens);
            const otherTokensCount = (otherTokens.length >>> 1);
            let result = new Uint32Array(myTokens.length + otherTokens.length);
            result.set(myTokens, 0);
            let dest = myTokens.length;
            const delta = myTokens[myTokens.length - 2];
            for (let i = 0; i < otherTokensCount; i++) {
                result[dest++] = otherTokens[(i << 1)] + delta;
                result[dest++] = otherTokens[(i << 1) + 1];
            }
            return result.buffer;
        }
        static _insert(lineTokens, chIndex, textLength) {
            if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
                // nothing to do
                return lineTokens;
            }
            const tokens = toUint32Array(lineTokens);
            const tokensCount = (tokens.length >>> 1);
            let fromTokenIndex = lineTokens_1.LineTokens.findIndexInTokensArray(tokens, chIndex);
            if (fromTokenIndex > 0) {
                const fromTokenStartOffset = tokens[(fromTokenIndex - 1) << 1];
                if (fromTokenStartOffset === chIndex) {
                    fromTokenIndex--;
                }
            }
            for (let tokenIndex = fromTokenIndex; tokenIndex < tokensCount; tokenIndex++) {
                tokens[tokenIndex << 1] += textLength;
            }
            return lineTokens;
        }
    }
    exports.TokensStore = TokensStore;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[49/*vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer*/], __M([0/*require*/,1/*exports*/,6/*vs/base/common/event*/,2/*vs/base/common/strings*/,7/*vs/editor/common/core/range*/,13/*vs/editor/common/model*/,20/*vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase*/,48/*vs/editor/common/model/tokensStore*/,41/*vs/editor/common/model/textChange*/,4/*vs/base/common/lifecycle*/]), function (require, exports, event_1, strings, range_1, model_1, pieceTreeBase_1, tokensStore_1, textChange_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PieceTreeTextBuffer = void 0;
    class PieceTreeTextBuffer extends lifecycle_1.Disposable {
        constructor(chunks, BOM, eol, containsRTL, containsUnusualLineTerminators, isBasicASCII, eolNormalized) {
            super();
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._BOM = BOM;
            this._mightContainNonBasicASCII = !isBasicASCII;
            this._mightContainRTL = containsRTL;
            this._mightContainUnusualLineTerminators = containsUnusualLineTerminators;
            this._pieceTree = new pieceTreeBase_1.PieceTreeBase(chunks, eol, eolNormalized);
        }
        // #region TextBuffer
        equals(other) {
            if (!(other instanceof PieceTreeTextBuffer)) {
                return false;
            }
            if (this._BOM !== other._BOM) {
                return false;
            }
            if (this.getEOL() !== other.getEOL()) {
                return false;
            }
            return this._pieceTree.equal(other._pieceTree);
        }
        mightContainRTL() {
            return this._mightContainRTL;
        }
        mightContainUnusualLineTerminators() {
            return this._mightContainUnusualLineTerminators;
        }
        resetMightContainUnusualLineTerminators() {
            this._mightContainUnusualLineTerminators = false;
        }
        mightContainNonBasicASCII() {
            return this._mightContainNonBasicASCII;
        }
        getBOM() {
            return this._BOM;
        }
        getEOL() {
            return this._pieceTree.getEOL();
        }
        createSnapshot(preserveBOM) {
            return this._pieceTree.createSnapshot(preserveBOM ? this._BOM : '');
        }
        getOffsetAt(lineNumber, column) {
            return this._pieceTree.getOffsetAt(lineNumber, column);
        }
        getPositionAt(offset) {
            return this._pieceTree.getPositionAt(offset);
        }
        getRangeAt(start, length) {
            let end = start + length;
            const startPosition = this.getPositionAt(start);
            const endPosition = this.getPositionAt(end);
            return new range_1.Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        }
        getValueInRange(range, eol = 0 /* TextDefined */) {
            if (range.isEmpty()) {
                return '';
            }
            const lineEnding = this._getEndOfLine(eol);
            return this._pieceTree.getValueInRange(range, lineEnding);
        }
        getValueLengthInRange(range, eol = 0 /* TextDefined */) {
            if (range.isEmpty()) {
                return 0;
            }
            if (range.startLineNumber === range.endLineNumber) {
                return (range.endColumn - range.startColumn);
            }
            let startOffset = this.getOffsetAt(range.startLineNumber, range.startColumn);
            let endOffset = this.getOffsetAt(range.endLineNumber, range.endColumn);
            return endOffset - startOffset;
        }
        getCharacterCountInRange(range, eol = 0 /* TextDefined */) {
            if (this._mightContainNonBasicASCII) {
                // we must count by iterating
                let result = 0;
                const fromLineNumber = range.startLineNumber;
                const toLineNumber = range.endLineNumber;
                for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                    const lineContent = this.getLineContent(lineNumber);
                    const fromOffset = (lineNumber === fromLineNumber ? range.startColumn - 1 : 0);
                    const toOffset = (lineNumber === toLineNumber ? range.endColumn - 1 : lineContent.length);
                    for (let offset = fromOffset; offset < toOffset; offset++) {
                        if (strings.isHighSurrogate(lineContent.charCodeAt(offset))) {
                            result = result + 1;
                            offset = offset + 1;
                        }
                        else {
                            result = result + 1;
                        }
                    }
                }
                result += this._getEndOfLine(eol).length * (toLineNumber - fromLineNumber);
                return result;
            }
            return this.getValueLengthInRange(range, eol);
        }
        getLength() {
            return this._pieceTree.getLength();
        }
        getLineCount() {
            return this._pieceTree.getLineCount();
        }
        getLinesContent() {
            return this._pieceTree.getLinesContent();
        }
        getLineContent(lineNumber) {
            return this._pieceTree.getLineContent(lineNumber);
        }
        getLineCharCode(lineNumber, index) {
            return this._pieceTree.getLineCharCode(lineNumber, index);
        }
        getCharCode(offset) {
            return this._pieceTree.getCharCode(offset);
        }
        getLineLength(lineNumber) {
            return this._pieceTree.getLineLength(lineNumber);
        }
        getLineMinColumn(lineNumber) {
            return 1;
        }
        getLineMaxColumn(lineNumber) {
            return this.getLineLength(lineNumber) + 1;
        }
        getLineFirstNonWhitespaceColumn(lineNumber) {
            const result = strings.firstNonWhitespaceIndex(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 1;
        }
        getLineLastNonWhitespaceColumn(lineNumber) {
            const result = strings.lastNonWhitespaceIndex(this.getLineContent(lineNumber));
            if (result === -1) {
                return 0;
            }
            return result + 2;
        }
        _getEndOfLine(eol) {
            switch (eol) {
                case 1 /* LF */:
                    return '\n';
                case 2 /* CRLF */:
                    return '\r\n';
                case 0 /* TextDefined */:
                    return this.getEOL();
                default:
                    throw new Error('Unknown EOL preference');
            }
        }
        setEOL(newEOL) {
            this._pieceTree.setEOL(newEOL);
        }
        applyEdits(rawOperations, recordTrimAutoWhitespace, computeUndoEdits) {
            let mightContainRTL = this._mightContainRTL;
            let mightContainUnusualLineTerminators = this._mightContainUnusualLineTerminators;
            let mightContainNonBasicASCII = this._mightContainNonBasicASCII;
            let canReduceOperations = true;
            let operations = [];
            for (let i = 0; i < rawOperations.length; i++) {
                let op = rawOperations[i];
                if (canReduceOperations && op._isTracked) {
                    canReduceOperations = false;
                }
                let validatedRange = op.range;
                if (op.text) {
                    let textMightContainNonBasicASCII = true;
                    if (!mightContainNonBasicASCII) {
                        textMightContainNonBasicASCII = !strings.isBasicASCII(op.text);
                        mightContainNonBasicASCII = textMightContainNonBasicASCII;
                    }
                    if (!mightContainRTL && textMightContainNonBasicASCII) {
                        // check if the new inserted text contains RTL
                        mightContainRTL = strings.containsRTL(op.text);
                    }
                    if (!mightContainUnusualLineTerminators && textMightContainNonBasicASCII) {
                        // check if the new inserted text contains unusual line terminators
                        mightContainUnusualLineTerminators = strings.containsUnusualLineTerminators(op.text);
                    }
                }
                let validText = '';
                let eolCount = 0;
                let firstLineLength = 0;
                let lastLineLength = 0;
                if (op.text) {
                    let strEOL;
                    [eolCount, firstLineLength, lastLineLength, strEOL] = (0, tokensStore_1.countEOL)(op.text);
                    const bufferEOL = this.getEOL();
                    const expectedStrEOL = (bufferEOL === '\r\n' ? 2 /* CRLF */ : 1 /* LF */);
                    if (strEOL === 0 /* Unknown */ || strEOL === expectedStrEOL) {
                        validText = op.text;
                    }
                    else {
                        validText = op.text.replace(/\r\n|\r|\n/g, bufferEOL);
                    }
                }
                operations[i] = {
                    sortIndex: i,
                    identifier: op.identifier || null,
                    range: validatedRange,
                    rangeOffset: this.getOffsetAt(validatedRange.startLineNumber, validatedRange.startColumn),
                    rangeLength: this.getValueLengthInRange(validatedRange),
                    text: validText,
                    eolCount: eolCount,
                    firstLineLength: firstLineLength,
                    lastLineLength: lastLineLength,
                    forceMoveMarkers: Boolean(op.forceMoveMarkers),
                    isAutoWhitespaceEdit: op.isAutoWhitespaceEdit || false
                };
            }
            // Sort operations ascending
            operations.sort(PieceTreeTextBuffer._sortOpsAscending);
            let hasTouchingRanges = false;
            for (let i = 0, count = operations.length - 1; i < count; i++) {
                let rangeEnd = operations[i].range.getEndPosition();
                let nextRangeStart = operations[i + 1].range.getStartPosition();
                if (nextRangeStart.isBeforeOrEqual(rangeEnd)) {
                    if (nextRangeStart.isBefore(rangeEnd)) {
                        // overlapping ranges
                        throw new Error('Overlapping ranges are not allowed!');
                    }
                    hasTouchingRanges = true;
                }
            }
            if (canReduceOperations) {
                operations = this._reduceOperations(operations);
            }
            // Delta encode operations
            let reverseRanges = (computeUndoEdits || recordTrimAutoWhitespace ? PieceTreeTextBuffer._getInverseEditRanges(operations) : []);
            let newTrimAutoWhitespaceCandidates = [];
            if (recordTrimAutoWhitespace) {
                for (let i = 0; i < operations.length; i++) {
                    let op = operations[i];
                    let reverseRange = reverseRanges[i];
                    if (op.isAutoWhitespaceEdit && op.range.isEmpty()) {
                        // Record already the future line numbers that might be auto whitespace removal candidates on next edit
                        for (let lineNumber = reverseRange.startLineNumber; lineNumber <= reverseRange.endLineNumber; lineNumber++) {
                            let currentLineContent = '';
                            if (lineNumber === reverseRange.startLineNumber) {
                                currentLineContent = this.getLineContent(op.range.startLineNumber);
                                if (strings.firstNonWhitespaceIndex(currentLineContent) !== -1) {
                                    continue;
                                }
                            }
                            newTrimAutoWhitespaceCandidates.push({ lineNumber: lineNumber, oldContent: currentLineContent });
                        }
                    }
                }
            }
            let reverseOperations = null;
            if (computeUndoEdits) {
                let reverseRangeDeltaOffset = 0;
                reverseOperations = [];
                for (let i = 0; i < operations.length; i++) {
                    const op = operations[i];
                    const reverseRange = reverseRanges[i];
                    const bufferText = this.getValueInRange(op.range);
                    const reverseRangeOffset = op.rangeOffset + reverseRangeDeltaOffset;
                    reverseRangeDeltaOffset += (op.text.length - bufferText.length);
                    reverseOperations[i] = {
                        sortIndex: op.sortIndex,
                        identifier: op.identifier,
                        range: reverseRange,
                        text: bufferText,
                        textChange: new textChange_1.TextChange(op.rangeOffset, bufferText, reverseRangeOffset, op.text)
                    };
                }
                // Can only sort reverse operations when the order is not significant
                if (!hasTouchingRanges) {
                    reverseOperations.sort((a, b) => a.sortIndex - b.sortIndex);
                }
            }
            this._mightContainRTL = mightContainRTL;
            this._mightContainUnusualLineTerminators = mightContainUnusualLineTerminators;
            this._mightContainNonBasicASCII = mightContainNonBasicASCII;
            const contentChanges = this._doApplyEdits(operations);
            let trimAutoWhitespaceLineNumbers = null;
            if (recordTrimAutoWhitespace && newTrimAutoWhitespaceCandidates.length > 0) {
                // sort line numbers auto whitespace removal candidates for next edit descending
                newTrimAutoWhitespaceCandidates.sort((a, b) => b.lineNumber - a.lineNumber);
                trimAutoWhitespaceLineNumbers = [];
                for (let i = 0, len = newTrimAutoWhitespaceCandidates.length; i < len; i++) {
                    let lineNumber = newTrimAutoWhitespaceCandidates[i].lineNumber;
                    if (i > 0 && newTrimAutoWhitespaceCandidates[i - 1].lineNumber === lineNumber) {
                        // Do not have the same line number twice
                        continue;
                    }
                    let prevContent = newTrimAutoWhitespaceCandidates[i].oldContent;
                    let lineContent = this.getLineContent(lineNumber);
                    if (lineContent.length === 0 || lineContent === prevContent || strings.firstNonWhitespaceIndex(lineContent) !== -1) {
                        continue;
                    }
                    trimAutoWhitespaceLineNumbers.push(lineNumber);
                }
            }
            this._onDidChangeContent.fire();
            return new model_1.ApplyEditsResult(reverseOperations, contentChanges, trimAutoWhitespaceLineNumbers);
        }
        /**
         * Transform operations such that they represent the same logic edit,
         * but that they also do not cause OOM crashes.
         */
        _reduceOperations(operations) {
            if (operations.length < 1000) {
                // We know from empirical testing that a thousand edits work fine regardless of their shape.
                return operations;
            }
            // At one point, due to how events are emitted and how each operation is handled,
            // some operations can trigger a high amount of temporary string allocations,
            // that will immediately get edited again.
            // e.g. a formatter inserting ridiculous ammounts of \n on a model with a single line
            // Therefore, the strategy is to collapse all the operations into a huge single edit operation
            return [this._toSingleEditOperation(operations)];
        }
        _toSingleEditOperation(operations) {
            let forceMoveMarkers = false;
            const firstEditRange = operations[0].range;
            const lastEditRange = operations[operations.length - 1].range;
            const entireEditRange = new range_1.Range(firstEditRange.startLineNumber, firstEditRange.startColumn, lastEditRange.endLineNumber, lastEditRange.endColumn);
            let lastEndLineNumber = firstEditRange.startLineNumber;
            let lastEndColumn = firstEditRange.startColumn;
            const result = [];
            for (let i = 0, len = operations.length; i < len; i++) {
                const operation = operations[i];
                const range = operation.range;
                forceMoveMarkers = forceMoveMarkers || operation.forceMoveMarkers;
                // (1) -- Push old text
                result.push(this.getValueInRange(new range_1.Range(lastEndLineNumber, lastEndColumn, range.startLineNumber, range.startColumn)));
                // (2) -- Push new text
                if (operation.text.length > 0) {
                    result.push(operation.text);
                }
                lastEndLineNumber = range.endLineNumber;
                lastEndColumn = range.endColumn;
            }
            const text = result.join('');
            const [eolCount, firstLineLength, lastLineLength] = (0, tokensStore_1.countEOL)(text);
            return {
                sortIndex: 0,
                identifier: operations[0].identifier,
                range: entireEditRange,
                rangeOffset: this.getOffsetAt(entireEditRange.startLineNumber, entireEditRange.startColumn),
                rangeLength: this.getValueLengthInRange(entireEditRange, 0 /* TextDefined */),
                text: text,
                eolCount: eolCount,
                firstLineLength: firstLineLength,
                lastLineLength: lastLineLength,
                forceMoveMarkers: forceMoveMarkers,
                isAutoWhitespaceEdit: false
            };
        }
        _doApplyEdits(operations) {
            operations.sort(PieceTreeTextBuffer._sortOpsDescending);
            let contentChanges = [];
            // operations are from bottom to top
            for (let i = 0; i < operations.length; i++) {
                let op = operations[i];
                const startLineNumber = op.range.startLineNumber;
                const startColumn = op.range.startColumn;
                const endLineNumber = op.range.endLineNumber;
                const endColumn = op.range.endColumn;
                if (startLineNumber === endLineNumber && startColumn === endColumn && op.text.length === 0) {
                    // no-op
                    continue;
                }
                if (op.text) {
                    // replacement
                    this._pieceTree.delete(op.rangeOffset, op.rangeLength);
                    this._pieceTree.insert(op.rangeOffset, op.text, true);
                }
                else {
                    // deletion
                    this._pieceTree.delete(op.rangeOffset, op.rangeLength);
                }
                const contentChangeRange = new range_1.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                contentChanges.push({
                    range: contentChangeRange,
                    rangeLength: op.rangeLength,
                    text: op.text,
                    rangeOffset: op.rangeOffset,
                    forceMoveMarkers: op.forceMoveMarkers
                });
            }
            return contentChanges;
        }
        findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
            return this._pieceTree.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
        }
        // #endregion
        // #region helper
        // testing purpose.
        getPieceTree() {
            return this._pieceTree;
        }
        static _getInverseEditRange(range, text) {
            let startLineNumber = range.startLineNumber;
            let startColumn = range.startColumn;
            const [eolCount, firstLineLength, lastLineLength] = (0, tokensStore_1.countEOL)(text);
            let resultRange;
            if (text.length > 0) {
                // the operation inserts something
                const lineCount = eolCount + 1;
                if (lineCount === 1) {
                    // single line insert
                    resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn + firstLineLength);
                }
                else {
                    // multi line insert
                    resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber + lineCount - 1, lastLineLength + 1);
                }
            }
            else {
                // There is nothing to insert
                resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn);
            }
            return resultRange;
        }
        /**
         * Assumes `operations` are validated and sorted ascending
         */
        static _getInverseEditRanges(operations) {
            let result = [];
            let prevOpEndLineNumber = 0;
            let prevOpEndColumn = 0;
            let prevOp = null;
            for (let i = 0, len = operations.length; i < len; i++) {
                let op = operations[i];
                let startLineNumber;
                let startColumn;
                if (prevOp) {
                    if (prevOp.range.endLineNumber === op.range.startLineNumber) {
                        startLineNumber = prevOpEndLineNumber;
                        startColumn = prevOpEndColumn + (op.range.startColumn - prevOp.range.endColumn);
                    }
                    else {
                        startLineNumber = prevOpEndLineNumber + (op.range.startLineNumber - prevOp.range.endLineNumber);
                        startColumn = op.range.startColumn;
                    }
                }
                else {
                    startLineNumber = op.range.startLineNumber;
                    startColumn = op.range.startColumn;
                }
                let resultRange;
                if (op.text.length > 0) {
                    // the operation inserts something
                    const lineCount = op.eolCount + 1;
                    if (lineCount === 1) {
                        // single line insert
                        resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn + op.firstLineLength);
                    }
                    else {
                        // multi line insert
                        resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber + lineCount - 1, op.lastLineLength + 1);
                    }
                }
                else {
                    // There is nothing to insert
                    resultRange = new range_1.Range(startLineNumber, startColumn, startLineNumber, startColumn);
                }
                prevOpEndLineNumber = resultRange.endLineNumber;
                prevOpEndColumn = resultRange.endColumn;
                result.push(resultRange);
                prevOp = op;
            }
            return result;
        }
        static _sortOpsAscending(a, b) {
            let r = range_1.Range.compareRangesUsingEnds(a.range, b.range);
            if (r === 0) {
                return a.sortIndex - b.sortIndex;
            }
            return r;
        }
        static _sortOpsDescending(a, b) {
            let r = range_1.Range.compareRangesUsingEnds(a.range, b.range);
            if (r === 0) {
                return b.sortIndex - a.sortIndex;
            }
            return -r;
        }
    }
    exports.PieceTreeTextBuffer = PieceTreeTextBuffer;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[50/*vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/strings*/,20/*vs/editor/common/model/pieceTreeTextBuffer/pieceTreeBase*/,49/*vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer*/]), function (require, exports, strings, pieceTreeBase_1, pieceTreeTextBuffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PieceTreeTextBufferBuilder = exports.PieceTreeTextBufferFactory = void 0;
    class PieceTreeTextBufferFactory {
        constructor(_chunks, _bom, _cr, _lf, _crlf, _containsRTL, _containsUnusualLineTerminators, _isBasicASCII, _normalizeEOL) {
            this._chunks = _chunks;
            this._bom = _bom;
            this._cr = _cr;
            this._lf = _lf;
            this._crlf = _crlf;
            this._containsRTL = _containsRTL;
            this._containsUnusualLineTerminators = _containsUnusualLineTerminators;
            this._isBasicASCII = _isBasicASCII;
            this._normalizeEOL = _normalizeEOL;
        }
        _getEOL(defaultEOL) {
            const totalEOLCount = this._cr + this._lf + this._crlf;
            const totalCRCount = this._cr + this._crlf;
            if (totalEOLCount === 0) {
                // This is an empty file or a file with precisely one line
                return (defaultEOL === 1 /* LF */ ? '\n' : '\r\n');
            }
            if (totalCRCount > totalEOLCount / 2) {
                // More than half of the file contains \r\n ending lines
                return '\r\n';
            }
            // At least one line more ends in \n
            return '\n';
        }
        create(defaultEOL) {
            const eol = this._getEOL(defaultEOL);
            let chunks = this._chunks;
            if (this._normalizeEOL &&
                ((eol === '\r\n' && (this._cr > 0 || this._lf > 0))
                    || (eol === '\n' && (this._cr > 0 || this._crlf > 0)))) {
                // Normalize pieces
                for (let i = 0, len = chunks.length; i < len; i++) {
                    let str = chunks[i].buffer.replace(/\r\n|\r|\n/g, eol);
                    let newLineStart = (0, pieceTreeBase_1.createLineStartsFast)(str);
                    chunks[i] = new pieceTreeBase_1.StringBuffer(str, newLineStart);
                }
            }
            const textBuffer = new pieceTreeTextBuffer_1.PieceTreeTextBuffer(chunks, this._bom, eol, this._containsRTL, this._containsUnusualLineTerminators, this._isBasicASCII, this._normalizeEOL);
            return { textBuffer: textBuffer, disposable: textBuffer };
        }
        getFirstLineText(lengthLimit) {
            return this._chunks[0].buffer.substr(0, lengthLimit).split(/\r\n|\r|\n/)[0];
        }
    }
    exports.PieceTreeTextBufferFactory = PieceTreeTextBufferFactory;
    class PieceTreeTextBufferBuilder {
        constructor() {
            this.chunks = [];
            this.BOM = '';
            this._hasPreviousChar = false;
            this._previousChar = 0;
            this._tmpLineStarts = [];
            this.cr = 0;
            this.lf = 0;
            this.crlf = 0;
            this.containsRTL = false;
            this.containsUnusualLineTerminators = false;
            this.isBasicASCII = true;
        }
        acceptChunk(chunk) {
            if (chunk.length === 0) {
                return;
            }
            if (this.chunks.length === 0) {
                if (strings.startsWithUTF8BOM(chunk)) {
                    this.BOM = strings.UTF8_BOM_CHARACTER;
                    chunk = chunk.substr(1);
                }
            }
            const lastChar = chunk.charCodeAt(chunk.length - 1);
            if (lastChar === 13 /* CarriageReturn */ || (lastChar >= 0xD800 && lastChar <= 0xDBFF)) {
                // last character is \r or a high surrogate => keep it back
                this._acceptChunk1(chunk.substr(0, chunk.length - 1), false);
                this._hasPreviousChar = true;
                this._previousChar = lastChar;
            }
            else {
                this._acceptChunk1(chunk, false);
                this._hasPreviousChar = false;
                this._previousChar = lastChar;
            }
        }
        _acceptChunk1(chunk, allowEmptyStrings) {
            if (!allowEmptyStrings && chunk.length === 0) {
                // Nothing to do
                return;
            }
            if (this._hasPreviousChar) {
                this._acceptChunk2(String.fromCharCode(this._previousChar) + chunk);
            }
            else {
                this._acceptChunk2(chunk);
            }
        }
        _acceptChunk2(chunk) {
            const lineStarts = (0, pieceTreeBase_1.createLineStarts)(this._tmpLineStarts, chunk);
            this.chunks.push(new pieceTreeBase_1.StringBuffer(chunk, lineStarts.lineStarts));
            this.cr += lineStarts.cr;
            this.lf += lineStarts.lf;
            this.crlf += lineStarts.crlf;
            if (this.isBasicASCII) {
                this.isBasicASCII = lineStarts.isBasicASCII;
            }
            if (!this.isBasicASCII && !this.containsRTL) {
                // No need to check if it is basic ASCII
                this.containsRTL = strings.containsRTL(chunk);
            }
            if (!this.isBasicASCII && !this.containsUnusualLineTerminators) {
                // No need to check if it is basic ASCII
                this.containsUnusualLineTerminators = strings.containsUnusualLineTerminators(chunk);
            }
        }
        finish(normalizeEOL = true) {
            this._finish();
            return new PieceTreeTextBufferFactory(this.chunks, this.BOM, this.cr, this.lf, this.crlf, this.containsRTL, this.containsUnusualLineTerminators, this.isBasicASCII, normalizeEOL);
        }
        _finish() {
            if (this.chunks.length === 0) {
                this._acceptChunk1('', true);
            }
            if (this._hasPreviousChar) {
                this._hasPreviousChar = false;
                // recreate last chunk
                let lastChunk = this.chunks[this.chunks.length - 1];
                lastChunk.buffer += String.fromCharCode(this._previousChar);
                let newLineStarts = (0, pieceTreeBase_1.createLineStartsFast)(lastChunk.buffer);
                lastChunk.lineStarts = newLineStarts;
                if (this._previousChar === 13 /* CarriageReturn */) {
                    this.cr++;
                }
            }
        }
    }
    exports.PieceTreeTextBufferBuilder = PieceTreeTextBufferBuilder;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[51/*vs/platform/contextkey/common/contextkey*/], __M([0/*require*/,1/*exports*/,2/*vs/base/common/strings*/,21/*vs/platform/instantiation/common/instantiation*/,3/*vs/base/common/platform*/]), function (require, exports, strings_1, instantiation_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SET_CONTEXT_COMMAND_ID = exports.IContextKeyService = exports.RawContextKey = exports.ContextKeyOrExpr = exports.ContextKeyAndExpr = exports.ContextKeyNotRegexExpr = exports.ContextKeyRegexExpr = exports.ContextKeySmallerEqualsExpr = exports.ContextKeySmallerExpr = exports.ContextKeyGreaterEqualsExpr = exports.ContextKeyGreaterExpr = exports.ContextKeyNotExpr = exports.ContextKeyNotEqualsExpr = exports.ContextKeyNotInExpr = exports.ContextKeyInExpr = exports.ContextKeyEqualsExpr = exports.ContextKeyDefinedExpr = exports.ContextKeyTrueExpr = exports.ContextKeyFalseExpr = exports.ContextKeyExpr = exports.ContextKeyExprType = void 0;
    let _userAgent = platform_1.userAgent || '';
    const STATIC_VALUES = new Map();
    STATIC_VALUES.set('false', false);
    STATIC_VALUES.set('true', true);
    STATIC_VALUES.set('isMac', platform_1.isMacintosh);
    STATIC_VALUES.set('isLinux', platform_1.isLinux);
    STATIC_VALUES.set('isWindows', platform_1.isWindows);
    STATIC_VALUES.set('isWeb', platform_1.isWeb);
    STATIC_VALUES.set('isMacNative', platform_1.isMacintosh && !platform_1.isWeb);
    STATIC_VALUES.set('isEdge', _userAgent.indexOf('Edg/') >= 0);
    STATIC_VALUES.set('isFirefox', _userAgent.indexOf('Firefox') >= 0);
    STATIC_VALUES.set('isChrome', _userAgent.indexOf('Chrome') >= 0);
    STATIC_VALUES.set('isSafari', _userAgent.indexOf('Safari') >= 0);
    STATIC_VALUES.set('isIPad', _userAgent.indexOf('iPad') >= 0);
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    var ContextKeyExprType;
    (function (ContextKeyExprType) {
        ContextKeyExprType[ContextKeyExprType["False"] = 0] = "False";
        ContextKeyExprType[ContextKeyExprType["True"] = 1] = "True";
        ContextKeyExprType[ContextKeyExprType["Defined"] = 2] = "Defined";
        ContextKeyExprType[ContextKeyExprType["Not"] = 3] = "Not";
        ContextKeyExprType[ContextKeyExprType["Equals"] = 4] = "Equals";
        ContextKeyExprType[ContextKeyExprType["NotEquals"] = 5] = "NotEquals";
        ContextKeyExprType[ContextKeyExprType["And"] = 6] = "And";
        ContextKeyExprType[ContextKeyExprType["Regex"] = 7] = "Regex";
        ContextKeyExprType[ContextKeyExprType["NotRegex"] = 8] = "NotRegex";
        ContextKeyExprType[ContextKeyExprType["Or"] = 9] = "Or";
        ContextKeyExprType[ContextKeyExprType["In"] = 10] = "In";
        ContextKeyExprType[ContextKeyExprType["NotIn"] = 11] = "NotIn";
        ContextKeyExprType[ContextKeyExprType["Greater"] = 12] = "Greater";
        ContextKeyExprType[ContextKeyExprType["GreaterEquals"] = 13] = "GreaterEquals";
        ContextKeyExprType[ContextKeyExprType["Smaller"] = 14] = "Smaller";
        ContextKeyExprType[ContextKeyExprType["SmallerEquals"] = 15] = "SmallerEquals";
    })(ContextKeyExprType = exports.ContextKeyExprType || (exports.ContextKeyExprType = {}));
    class ContextKeyExpr {
        static false() {
            return ContextKeyFalseExpr.INSTANCE;
        }
        static true() {
            return ContextKeyTrueExpr.INSTANCE;
        }
        static has(key) {
            return ContextKeyDefinedExpr.create(key);
        }
        static equals(key, value) {
            return ContextKeyEqualsExpr.create(key, value);
        }
        static notEquals(key, value) {
            return ContextKeyNotEqualsExpr.create(key, value);
        }
        static regex(key, value) {
            return ContextKeyRegexExpr.create(key, value);
        }
        static in(key, value) {
            return ContextKeyInExpr.create(key, value);
        }
        static not(key) {
            return ContextKeyNotExpr.create(key);
        }
        static and(...expr) {
            return ContextKeyAndExpr.create(expr);
        }
        static or(...expr) {
            return ContextKeyOrExpr.create(expr);
        }
        static greater(key, value) {
            return ContextKeyGreaterExpr.create(key, value);
        }
        static less(key, value) {
            return ContextKeySmallerExpr.create(key, value);
        }
        static deserialize(serialized, strict = false) {
            if (!serialized) {
                return undefined;
            }
            return this._deserializeOrExpression(serialized, strict);
        }
        static _deserializeOrExpression(serialized, strict) {
            let pieces = serialized.split('||');
            return ContextKeyOrExpr.create(pieces.map(p => this._deserializeAndExpression(p, strict)));
        }
        static _deserializeAndExpression(serialized, strict) {
            let pieces = serialized.split('&&');
            return ContextKeyAndExpr.create(pieces.map(p => this._deserializeOne(p, strict)));
        }
        static _deserializeOne(serializedOne, strict) {
            serializedOne = serializedOne.trim();
            if (serializedOne.indexOf('!=') >= 0) {
                let pieces = serializedOne.split('!=');
                return ContextKeyNotEqualsExpr.create(pieces[0].trim(), this._deserializeValue(pieces[1], strict));
            }
            if (serializedOne.indexOf('==') >= 0) {
                let pieces = serializedOne.split('==');
                return ContextKeyEqualsExpr.create(pieces[0].trim(), this._deserializeValue(pieces[1], strict));
            }
            if (serializedOne.indexOf('=~') >= 0) {
                let pieces = serializedOne.split('=~');
                return ContextKeyRegexExpr.create(pieces[0].trim(), this._deserializeRegexValue(pieces[1], strict));
            }
            if (serializedOne.indexOf(' in ') >= 0) {
                let pieces = serializedOne.split(' in ');
                return ContextKeyInExpr.create(pieces[0].trim(), pieces[1].trim());
            }
            if (/^[^<=>]+>=[^<=>]+$/.test(serializedOne)) {
                const pieces = serializedOne.split('>=');
                return ContextKeyGreaterEqualsExpr.create(pieces[0].trim(), pieces[1].trim());
            }
            if (/^[^<=>]+>[^<=>]+$/.test(serializedOne)) {
                const pieces = serializedOne.split('>');
                return ContextKeyGreaterExpr.create(pieces[0].trim(), pieces[1].trim());
            }
            if (/^[^<=>]+<=[^<=>]+$/.test(serializedOne)) {
                const pieces = serializedOne.split('<=');
                return ContextKeySmallerEqualsExpr.create(pieces[0].trim(), pieces[1].trim());
            }
            if (/^[^<=>]+<[^<=>]+$/.test(serializedOne)) {
                const pieces = serializedOne.split('<');
                return ContextKeySmallerExpr.create(pieces[0].trim(), pieces[1].trim());
            }
            if (/^\!\s*/.test(serializedOne)) {
                return ContextKeyNotExpr.create(serializedOne.substr(1).trim());
            }
            return ContextKeyDefinedExpr.create(serializedOne);
        }
        static _deserializeValue(serializedValue, strict) {
            serializedValue = serializedValue.trim();
            if (serializedValue === 'true') {
                return true;
            }
            if (serializedValue === 'false') {
                return false;
            }
            let m = /^'([^']*)'$/.exec(serializedValue);
            if (m) {
                return m[1].trim();
            }
            return serializedValue;
        }
        static _deserializeRegexValue(serializedValue, strict) {
            if ((0, strings_1.isFalsyOrWhitespace)(serializedValue)) {
                if (strict) {
                    throw new Error('missing regexp-value for =~-expression');
                }
                else {
                    console.warn('missing regexp-value for =~-expression');
                }
                return null;
            }
            let start = serializedValue.indexOf('/');
            let end = serializedValue.lastIndexOf('/');
            if (start === end || start < 0 /* || to < 0 */) {
                if (strict) {
                    throw new Error(`bad regexp-value '${serializedValue}', missing /-enclosure`);
                }
                else {
                    console.warn(`bad regexp-value '${serializedValue}', missing /-enclosure`);
                }
                return null;
            }
            let value = serializedValue.slice(start + 1, end);
            let caseIgnoreFlag = serializedValue[end + 1] === 'i' ? 'i' : '';
            try {
                return new RegExp(value, caseIgnoreFlag);
            }
            catch (e) {
                if (strict) {
                    throw new Error(`bad regexp-value '${serializedValue}', parse error: ${e}`);
                }
                else {
                    console.warn(`bad regexp-value '${serializedValue}', parse error: ${e}`);
                }
                return null;
            }
        }
    }
    exports.ContextKeyExpr = ContextKeyExpr;
    function cmp(a, b) {
        return a.cmp(b);
    }
    class ContextKeyFalseExpr {
        constructor() {
            this.type = 0 /* False */;
        }
        cmp(other) {
            return this.type - other.type;
        }
        equals(other) {
            return (other.type === this.type);
        }
        evaluate(context) {
            return false;
        }
        serialize() {
            return 'false';
        }
        keys() {
            return [];
        }
        map(mapFnc) {
            return this;
        }
        negate() {
            return ContextKeyTrueExpr.INSTANCE;
        }
    }
    exports.ContextKeyFalseExpr = ContextKeyFalseExpr;
    ContextKeyFalseExpr.INSTANCE = new ContextKeyFalseExpr();
    class ContextKeyTrueExpr {
        constructor() {
            this.type = 1 /* True */;
        }
        cmp(other) {
            return this.type - other.type;
        }
        equals(other) {
            return (other.type === this.type);
        }
        evaluate(context) {
            return true;
        }
        serialize() {
            return 'true';
        }
        keys() {
            return [];
        }
        map(mapFnc) {
            return this;
        }
        negate() {
            return ContextKeyFalseExpr.INSTANCE;
        }
    }
    exports.ContextKeyTrueExpr = ContextKeyTrueExpr;
    ContextKeyTrueExpr.INSTANCE = new ContextKeyTrueExpr();
    class ContextKeyDefinedExpr {
        constructor(key) {
            this.key = key;
            this.type = 2 /* Defined */;
        }
        static create(key) {
            const staticValue = STATIC_VALUES.get(key);
            if (typeof staticValue === 'boolean') {
                return staticValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
            }
            return new ContextKeyDefinedExpr(key);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp1(this.key, other.key);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key);
            }
            return false;
        }
        evaluate(context) {
            return (!!context.getValue(this.key));
        }
        serialize() {
            return this.key;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapDefined(this.key);
        }
        negate() {
            return ContextKeyNotExpr.create(this.key);
        }
    }
    exports.ContextKeyDefinedExpr = ContextKeyDefinedExpr;
    class ContextKeyEqualsExpr {
        constructor(key, value) {
            this.key = key;
            this.value = value;
            this.type = 4 /* Equals */;
        }
        static create(key, value) {
            if (typeof value === 'boolean') {
                return (value ? ContextKeyDefinedExpr.create(key) : ContextKeyNotExpr.create(key));
            }
            const staticValue = STATIC_VALUES.get(key);
            if (typeof staticValue === 'boolean') {
                const trueValue = staticValue ? 'true' : 'false';
                return (value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE);
            }
            return new ContextKeyEqualsExpr(key, value);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        evaluate(context) {
            // Intentional ==
            // eslint-disable-next-line eqeqeq
            return (context.getValue(this.key) == this.value);
        }
        serialize() {
            return `${this.key} == '${this.value}'`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapEquals(this.key, this.value);
        }
        negate() {
            return ContextKeyNotEqualsExpr.create(this.key, this.value);
        }
    }
    exports.ContextKeyEqualsExpr = ContextKeyEqualsExpr;
    class ContextKeyInExpr {
        constructor(key, valueKey) {
            this.key = key;
            this.valueKey = valueKey;
            this.type = 10 /* In */;
        }
        static create(key, valueKey) {
            return new ContextKeyInExpr(key, valueKey);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.valueKey, other.key, other.valueKey);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.valueKey === other.valueKey);
            }
            return false;
        }
        evaluate(context) {
            const source = context.getValue(this.valueKey);
            const item = context.getValue(this.key);
            if (Array.isArray(source)) {
                return (source.indexOf(item) >= 0);
            }
            if (typeof item === 'string' && typeof source === 'object' && source !== null) {
                return hasOwnProperty.call(source, item);
            }
            return false;
        }
        serialize() {
            return `${this.key} in '${this.valueKey}'`;
        }
        keys() {
            return [this.key, this.valueKey];
        }
        map(mapFnc) {
            return mapFnc.mapIn(this.key, this.valueKey);
        }
        negate() {
            return ContextKeyNotInExpr.create(this);
        }
    }
    exports.ContextKeyInExpr = ContextKeyInExpr;
    class ContextKeyNotInExpr {
        constructor(_actual) {
            this._actual = _actual;
            this.type = 11 /* NotIn */;
            //
        }
        static create(actual) {
            return new ContextKeyNotInExpr(actual);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return this._actual.cmp(other._actual);
        }
        equals(other) {
            if (other.type === this.type) {
                return this._actual.equals(other._actual);
            }
            return false;
        }
        evaluate(context) {
            return !this._actual.evaluate(context);
        }
        serialize() {
            throw new Error('Method not implemented.');
        }
        keys() {
            return this._actual.keys();
        }
        map(mapFnc) {
            return new ContextKeyNotInExpr(this._actual.map(mapFnc));
        }
        negate() {
            return this._actual;
        }
    }
    exports.ContextKeyNotInExpr = ContextKeyNotInExpr;
    class ContextKeyNotEqualsExpr {
        constructor(key, value) {
            this.key = key;
            this.value = value;
            this.type = 5 /* NotEquals */;
        }
        static create(key, value) {
            if (typeof value === 'boolean') {
                if (value) {
                    return ContextKeyNotExpr.create(key);
                }
                return ContextKeyDefinedExpr.create(key);
            }
            const staticValue = STATIC_VALUES.get(key);
            if (typeof staticValue === 'boolean') {
                const falseValue = staticValue ? 'true' : 'false';
                return (value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
            }
            return new ContextKeyNotEqualsExpr(key, value);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        evaluate(context) {
            // Intentional !=
            // eslint-disable-next-line eqeqeq
            return (context.getValue(this.key) != this.value);
        }
        serialize() {
            return `${this.key} != '${this.value}'`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapNotEquals(this.key, this.value);
        }
        negate() {
            return ContextKeyEqualsExpr.create(this.key, this.value);
        }
    }
    exports.ContextKeyNotEqualsExpr = ContextKeyNotEqualsExpr;
    class ContextKeyNotExpr {
        constructor(key) {
            this.key = key;
            this.type = 3 /* Not */;
        }
        static create(key) {
            const staticValue = STATIC_VALUES.get(key);
            if (typeof staticValue === 'boolean') {
                return (staticValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE);
            }
            return new ContextKeyNotExpr(key);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp1(this.key, other.key);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key);
            }
            return false;
        }
        evaluate(context) {
            return (!context.getValue(this.key));
        }
        serialize() {
            return `!${this.key}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapNot(this.key);
        }
        negate() {
            return ContextKeyDefinedExpr.create(this.key);
        }
    }
    exports.ContextKeyNotExpr = ContextKeyNotExpr;
    class ContextKeyGreaterExpr {
        constructor(key, value) {
            this.key = key;
            this.value = value;
            this.type = 12 /* Greater */;
        }
        static create(key, value) {
            return new ContextKeyGreaterExpr(key, value);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        evaluate(context) {
            return (parseFloat(context.getValue(this.key)) > parseFloat(this.value));
        }
        serialize() {
            return `${this.key} > ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapGreater(this.key, this.value);
        }
        negate() {
            return ContextKeySmallerEqualsExpr.create(this.key, this.value);
        }
    }
    exports.ContextKeyGreaterExpr = ContextKeyGreaterExpr;
    class ContextKeyGreaterEqualsExpr {
        constructor(key, value) {
            this.key = key;
            this.value = value;
            this.type = 13 /* GreaterEquals */;
        }
        static create(key, value) {
            return new ContextKeyGreaterEqualsExpr(key, value);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        evaluate(context) {
            return (parseFloat(context.getValue(this.key)) >= parseFloat(this.value));
        }
        serialize() {
            return `${this.key} >= ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapGreaterEquals(this.key, this.value);
        }
        negate() {
            return ContextKeySmallerExpr.create(this.key, this.value);
        }
    }
    exports.ContextKeyGreaterEqualsExpr = ContextKeyGreaterEqualsExpr;
    class ContextKeySmallerExpr {
        constructor(key, value) {
            this.key = key;
            this.value = value;
            this.type = 14 /* Smaller */;
        }
        static create(key, value) {
            return new ContextKeySmallerExpr(key, value);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        evaluate(context) {
            return (parseFloat(context.getValue(this.key)) < parseFloat(this.value));
        }
        serialize() {
            return `${this.key} < ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapSmaller(this.key, this.value);
        }
        negate() {
            return ContextKeyGreaterEqualsExpr.create(this.key, this.value);
        }
    }
    exports.ContextKeySmallerExpr = ContextKeySmallerExpr;
    class ContextKeySmallerEqualsExpr {
        constructor(key, value) {
            this.key = key;
            this.value = value;
            this.type = 15 /* SmallerEquals */;
        }
        static create(key, value) {
            return new ContextKeySmallerEqualsExpr(key, value);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return cmp2(this.key, this.value, other.key, other.value);
        }
        equals(other) {
            if (other.type === this.type) {
                return (this.key === other.key && this.value === other.value);
            }
            return false;
        }
        evaluate(context) {
            return (parseFloat(context.getValue(this.key)) <= parseFloat(this.value));
        }
        serialize() {
            return `${this.key} <= ${this.value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapSmallerEquals(this.key, this.value);
        }
        negate() {
            return ContextKeyGreaterExpr.create(this.key, this.value);
        }
    }
    exports.ContextKeySmallerEqualsExpr = ContextKeySmallerEqualsExpr;
    class ContextKeyRegexExpr {
        constructor(key, regexp) {
            this.key = key;
            this.regexp = regexp;
            this.type = 7 /* Regex */;
            //
        }
        static create(key, regexp) {
            return new ContextKeyRegexExpr(key, regexp);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            if (this.key < other.key) {
                return -1;
            }
            if (this.key > other.key) {
                return 1;
            }
            const thisSource = this.regexp ? this.regexp.source : '';
            const otherSource = other.regexp ? other.regexp.source : '';
            if (thisSource < otherSource) {
                return -1;
            }
            if (thisSource > otherSource) {
                return 1;
            }
            return 0;
        }
        equals(other) {
            if (other.type === this.type) {
                const thisSource = this.regexp ? this.regexp.source : '';
                const otherSource = other.regexp ? other.regexp.source : '';
                return (this.key === other.key && thisSource === otherSource);
            }
            return false;
        }
        evaluate(context) {
            let value = context.getValue(this.key);
            return this.regexp ? this.regexp.test(value) : false;
        }
        serialize() {
            const value = this.regexp
                ? `/${this.regexp.source}/${this.regexp.ignoreCase ? 'i' : ''}`
                : '/invalid/';
            return `${this.key} =~ ${value}`;
        }
        keys() {
            return [this.key];
        }
        map(mapFnc) {
            return mapFnc.mapRegex(this.key, this.regexp);
        }
        negate() {
            return ContextKeyNotRegexExpr.create(this);
        }
    }
    exports.ContextKeyRegexExpr = ContextKeyRegexExpr;
    class ContextKeyNotRegexExpr {
        constructor(_actual) {
            this._actual = _actual;
            this.type = 8 /* NotRegex */;
            //
        }
        static create(actual) {
            return new ContextKeyNotRegexExpr(actual);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            return this._actual.cmp(other._actual);
        }
        equals(other) {
            if (other.type === this.type) {
                return this._actual.equals(other._actual);
            }
            return false;
        }
        evaluate(context) {
            return !this._actual.evaluate(context);
        }
        serialize() {
            throw new Error('Method not implemented.');
        }
        keys() {
            return this._actual.keys();
        }
        map(mapFnc) {
            return new ContextKeyNotRegexExpr(this._actual.map(mapFnc));
        }
        negate() {
            return this._actual;
        }
    }
    exports.ContextKeyNotRegexExpr = ContextKeyNotRegexExpr;
    class ContextKeyAndExpr {
        constructor(expr) {
            this.expr = expr;
            this.type = 6 /* And */;
        }
        static create(_expr) {
            return ContextKeyAndExpr._normalizeArr(_expr);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            if (this.expr.length < other.expr.length) {
                return -1;
            }
            if (this.expr.length > other.expr.length) {
                return 1;
            }
            for (let i = 0, len = this.expr.length; i < len; i++) {
                const r = cmp(this.expr[i], other.expr[i]);
                if (r !== 0) {
                    return r;
                }
            }
            return 0;
        }
        equals(other) {
            if (other.type === this.type) {
                if (this.expr.length !== other.expr.length) {
                    return false;
                }
                for (let i = 0, len = this.expr.length; i < len; i++) {
                    if (!this.expr[i].equals(other.expr[i])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        evaluate(context) {
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (!this.expr[i].evaluate(context)) {
                    return false;
                }
            }
            return true;
        }
        static _normalizeArr(arr) {
            const expr = [];
            let hasTrue = false;
            for (const e of arr) {
                if (!e) {
                    continue;
                }
                if (e.type === 1 /* True */) {
                    // anything && true ==> anything
                    hasTrue = true;
                    continue;
                }
                if (e.type === 0 /* False */) {
                    // anything && false ==> false
                    return ContextKeyFalseExpr.INSTANCE;
                }
                if (e.type === 6 /* And */) {
                    expr.push(...e.expr);
                    continue;
                }
                expr.push(e);
            }
            if (expr.length === 0 && hasTrue) {
                return ContextKeyTrueExpr.INSTANCE;
            }
            if (expr.length === 0) {
                return undefined;
            }
            if (expr.length === 1) {
                return expr[0];
            }
            expr.sort(cmp);
            // We must distribute any OR expression because we don't support parens
            // OR extensions will be at the end (due to sorting rules)
            while (expr.length > 1) {
                const lastElement = expr[expr.length - 1];
                if (lastElement.type !== 9 /* Or */) {
                    break;
                }
                // pop the last element
                expr.pop();
                // pop the second to last element
                const secondToLastElement = expr.pop();
                // distribute `lastElement` over `secondToLastElement`
                const resultElement = ContextKeyOrExpr.create(lastElement.expr.map(el => ContextKeyAndExpr.create([el, secondToLastElement])));
                if (resultElement) {
                    expr.push(resultElement);
                    expr.sort(cmp);
                }
            }
            if (expr.length === 1) {
                return expr[0];
            }
            return new ContextKeyAndExpr(expr);
        }
        serialize() {
            return this.expr.map(e => e.serialize()).join(' && ');
        }
        keys() {
            const result = [];
            for (let expr of this.expr) {
                result.push(...expr.keys());
            }
            return result;
        }
        map(mapFnc) {
            return new ContextKeyAndExpr(this.expr.map(expr => expr.map(mapFnc)));
        }
        negate() {
            let result = [];
            for (let expr of this.expr) {
                result.push(expr.negate());
            }
            return ContextKeyOrExpr.create(result);
        }
    }
    exports.ContextKeyAndExpr = ContextKeyAndExpr;
    class ContextKeyOrExpr {
        constructor(expr) {
            this.expr = expr;
            this.type = 9 /* Or */;
        }
        static create(_expr) {
            const expr = ContextKeyOrExpr._normalizeArr(_expr);
            if (expr.length === 0) {
                return undefined;
            }
            if (expr.length === 1) {
                return expr[0];
            }
            return new ContextKeyOrExpr(expr);
        }
        cmp(other) {
            if (other.type !== this.type) {
                return this.type - other.type;
            }
            if (this.expr.length < other.expr.length) {
                return -1;
            }
            if (this.expr.length > other.expr.length) {
                return 1;
            }
            for (let i = 0, len = this.expr.length; i < len; i++) {
                const r = cmp(this.expr[i], other.expr[i]);
                if (r !== 0) {
                    return r;
                }
            }
            return 0;
        }
        equals(other) {
            if (other.type === this.type) {
                if (this.expr.length !== other.expr.length) {
                    return false;
                }
                for (let i = 0, len = this.expr.length; i < len; i++) {
                    if (!this.expr[i].equals(other.expr[i])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        evaluate(context) {
            for (let i = 0, len = this.expr.length; i < len; i++) {
                if (this.expr[i].evaluate(context)) {
                    return true;
                }
            }
            return false;
        }
        static _normalizeArr(arr) {
            let expr = [];
            let hasFalse = false;
            if (arr) {
                for (let i = 0, len = arr.length; i < len; i++) {
                    const e = arr[i];
                    if (!e) {
                        continue;
                    }
                    if (e.type === 0 /* False */) {
                        // anything || false ==> anything
                        hasFalse = true;
                        continue;
                    }
                    if (e.type === 1 /* True */) {
                        // anything || true ==> true
                        return [ContextKeyTrueExpr.INSTANCE];
                    }
                    if (e.type === 9 /* Or */) {
                        expr = expr.concat(e.expr);
                        continue;
                    }
                    expr.push(e);
                }
                if (expr.length === 0 && hasFalse) {
                    return [ContextKeyFalseExpr.INSTANCE];
                }
                expr.sort(cmp);
            }
            return expr;
        }
        serialize() {
            return this.expr.map(e => e.serialize()).join(' || ');
        }
        keys() {
            const result = [];
            for (let expr of this.expr) {
                result.push(...expr.keys());
            }
            return result;
        }
        map(mapFnc) {
            return new ContextKeyOrExpr(this.expr.map(expr => expr.map(mapFnc)));
        }
        negate() {
            let result = [];
            for (let expr of this.expr) {
                result.push(expr.negate());
            }
            const terminals = (node) => {
                if (node.type === 9 /* Or */) {
                    return node.expr;
                }
                return [node];
            };
            // We don't support parens, so here we distribute the AND over the OR terminals
            // We always take the first 2 AND pairs and distribute them
            while (result.length > 1) {
                const LEFT = result.shift();
                const RIGHT = result.shift();
                const all = [];
                for (const left of terminals(LEFT)) {
                    for (const right of terminals(RIGHT)) {
                        all.push(ContextKeyExpr.and(left, right));
                    }
                }
                result.unshift(ContextKeyExpr.or(...all));
            }
            return result[0];
        }
    }
    exports.ContextKeyOrExpr = ContextKeyOrExpr;
    class RawContextKey extends ContextKeyDefinedExpr {
        constructor(key, defaultValue, metaOrHide) {
            super(key);
            this._defaultValue = defaultValue;
            // collect all context keys into a central place
            if (typeof metaOrHide === 'object') {
                RawContextKey._info.push(Object.assign(Object.assign({}, metaOrHide), { key }));
            }
            else if (metaOrHide !== true) {
                RawContextKey._info.push({ key, description: metaOrHide, type: defaultValue !== null && defaultValue !== undefined ? typeof defaultValue : undefined });
            }
        }
        static all() {
            return RawContextKey._info.values();
        }
        bindTo(target) {
            return target.createKey(this.key, this._defaultValue);
        }
        getValue(target) {
            return target.getContextKeyValue(this.key);
        }
        toNegated() {
            return ContextKeyExpr.not(this.key);
        }
        isEqualTo(value) {
            return ContextKeyExpr.equals(this.key, value);
        }
        notEqualsTo(value) {
            return ContextKeyExpr.notEquals(this.key, value);
        }
    }
    exports.RawContextKey = RawContextKey;
    RawContextKey._info = [];
    exports.IContextKeyService = (0, instantiation_1.createDecorator)('contextKeyService');
    exports.SET_CONTEXT_COMMAND_ID = 'setContext';
    function cmp1(key1, key2) {
        if (key1 < key2) {
            return -1;
        }
        if (key1 > key2) {
            return 1;
        }
        return 0;
    }
    function cmp2(key1, value1, key2, value2) {
        if (key1 < key2) {
            return -1;
        }
        if (key1 > key2) {
            return 1;
        }
        if (value1 < value2) {
            return -1;
        }
        if (value1 > value2) {
            return 1;
        }
        return 0;
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[52/*vs/workbench/contrib/notebook/common/notebookCommon*/], __M([0/*require*/,1/*exports*/,19/*vs/base/common/glob*/,18/*vs/base/common/network*/,5/*vs/base/common/path*/,3/*vs/base/common/platform*/,51/*vs/platform/contextkey/common/contextkey*/]), function (require, exports, glob, network_1, path_1, platform_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NOTEBOOK_WORKING_COPY_TYPE_PREFIX = exports.CellStatusbarAlignment = exports.ExperimentalUseMarkdownRenderer = exports.NotebookTextDiffEditorPreview = exports.ShowCellStatusBarKey = exports.CellToolbarLocKey = exports.DisplayOrderKey = exports.CellSequence = exports.notebookDocumentFilterMatch = exports.isDocumentExcludePattern = exports.NotebookEditorPriority = exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = exports.diff = exports.sortMimeTypes = exports.mimeTypeIsMergeable = exports.mimeTypeSupportedByCore = exports.mimeTypeIsAlwaysSecure = exports.CellUri = exports.getCellUndoRedoComparisonKey = exports.CellEditType = exports.SelectionStateType = exports.NotebookCellsChangeType = exports.NotebookRendererMatch = exports.AnyRendererApi = exports.NotebookCellExecutionState = exports.notebookDocumentMetadataDefaults = exports.NotebookRunState = exports.RENDERER_NOT_AVAILABLE = exports.BUILTIN_RENDERER_ID = exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = exports.NOTEBOOK_DISPLAY_ORDER = exports.CellKind = void 0;
    var CellKind;
    (function (CellKind) {
        CellKind[CellKind["Markdown"] = 1] = "Markdown";
        CellKind[CellKind["Code"] = 2] = "Code";
    })(CellKind = exports.CellKind || (exports.CellKind = {}));
    exports.NOTEBOOK_DISPLAY_ORDER = [
        'application/json',
        'application/javascript',
        'text/html',
        'image/svg+xml',
        'text/markdown',
        'image/png',
        'image/jpeg',
        'text/plain'
    ];
    exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = [
        'text/markdown',
        'application/json',
        'text/plain',
        'text/html',
        'image/svg+xml',
        'image/png',
        'image/jpeg',
    ];
    exports.BUILTIN_RENDERER_ID = '_builtin';
    exports.RENDERER_NOT_AVAILABLE = '_notAvailable';
    var NotebookRunState;
    (function (NotebookRunState) {
        NotebookRunState[NotebookRunState["Running"] = 1] = "Running";
        NotebookRunState[NotebookRunState["Idle"] = 2] = "Idle";
    })(NotebookRunState = exports.NotebookRunState || (exports.NotebookRunState = {}));
    exports.notebookDocumentMetadataDefaults = {
        custom: {},
        trusted: true
    };
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        NotebookCellExecutionState[NotebookCellExecutionState["Idle"] = 1] = "Idle";
        NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
        NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
    })(NotebookCellExecutionState = exports.NotebookCellExecutionState || (exports.NotebookCellExecutionState = {}));
    /**
     * Passed to INotebookRendererInfo.matches when the notebook is initially
     * loaded before the kernel is known.
     */
    exports.AnyRendererApi = Symbol('AnyRendererApi');
    /** Note: enum values are used for sorting */
    var NotebookRendererMatch;
    (function (NotebookRendererMatch) {
        /** Renderer has a hard dependency on an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithHardKernelDependency"] = 0] = "WithHardKernelDependency";
        /** Renderer works better with an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithOptionalKernelDependency"] = 1] = "WithOptionalKernelDependency";
        /** Renderer is kernel-agnostic */
        NotebookRendererMatch[NotebookRendererMatch["Pure"] = 2] = "Pure";
        /** Renderer is for a different mimeType or has a hard dependency which is unsatisfied */
        NotebookRendererMatch[NotebookRendererMatch["Never"] = 3] = "Never";
    })(NotebookRendererMatch = exports.NotebookRendererMatch || (exports.NotebookRendererMatch = {}));
    var NotebookCellsChangeType;
    (function (NotebookCellsChangeType) {
        NotebookCellsChangeType[NotebookCellsChangeType["ModelChange"] = 1] = "ModelChange";
        NotebookCellsChangeType[NotebookCellsChangeType["Move"] = 2] = "Move";
        NotebookCellsChangeType[NotebookCellsChangeType["CellClearOutput"] = 3] = "CellClearOutput";
        NotebookCellsChangeType[NotebookCellsChangeType["CellsClearOutput"] = 4] = "CellsClearOutput";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeLanguage"] = 5] = "ChangeLanguage";
        NotebookCellsChangeType[NotebookCellsChangeType["Initialize"] = 6] = "Initialize";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMetadata"] = 7] = "ChangeCellMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["Output"] = 8] = "Output";
        NotebookCellsChangeType[NotebookCellsChangeType["OutputItem"] = 9] = "OutputItem";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellContent"] = 10] = "ChangeCellContent";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeDocumentMetadata"] = 11] = "ChangeDocumentMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["Unknown"] = 12] = "Unknown";
    })(NotebookCellsChangeType = exports.NotebookCellsChangeType || (exports.NotebookCellsChangeType = {}));
    var SelectionStateType;
    (function (SelectionStateType) {
        SelectionStateType[SelectionStateType["Handle"] = 0] = "Handle";
        SelectionStateType[SelectionStateType["Index"] = 1] = "Index";
    })(SelectionStateType = exports.SelectionStateType || (exports.SelectionStateType = {}));
    var CellEditType;
    (function (CellEditType) {
        CellEditType[CellEditType["Replace"] = 1] = "Replace";
        CellEditType[CellEditType["Output"] = 2] = "Output";
        CellEditType[CellEditType["Metadata"] = 3] = "Metadata";
        CellEditType[CellEditType["CellLanguage"] = 4] = "CellLanguage";
        CellEditType[CellEditType["DocumentMetadata"] = 5] = "DocumentMetadata";
        CellEditType[CellEditType["Move"] = 6] = "Move";
        CellEditType[CellEditType["OutputItems"] = 7] = "OutputItems";
        CellEditType[CellEditType["PartialMetadata"] = 8] = "PartialMetadata";
    })(CellEditType = exports.CellEditType || (exports.CellEditType = {}));
    function getCellUndoRedoComparisonKey(uri) {
        const data = CellUri.parse(uri);
        if (!data) {
            return uri.toString();
        }
        return data.notebook.toString();
    }
    exports.getCellUndoRedoComparisonKey = getCellUndoRedoComparisonKey;
    var CellUri;
    (function (CellUri) {
        CellUri.scheme = network_1.Schemas.vscodeNotebookCell;
        const _regex = /^ch(\d{7,})/;
        function generate(notebook, handle) {
            return notebook.with({
                scheme: CellUri.scheme,
                fragment: `ch${handle.toString().padStart(7, '0')}${notebook.scheme !== network_1.Schemas.file ? notebook.scheme : ''}`
            });
        }
        CellUri.generate = generate;
        function parse(cell) {
            if (cell.scheme !== CellUri.scheme) {
                return undefined;
            }
            const match = _regex.exec(cell.fragment);
            if (!match) {
                return undefined;
            }
            const handle = Number(match[1]);
            return {
                handle,
                notebook: cell.with({
                    scheme: cell.fragment.substr(match[0].length) || network_1.Schemas.file,
                    fragment: null
                })
            };
        }
        CellUri.parse = parse;
        function generateCellMetadataUri(notebook, handle) {
            return notebook.with({
                scheme: network_1.Schemas.vscodeNotebookCellMetadata,
                fragment: `ch${handle.toString().padStart(7, '0')}${notebook.scheme !== network_1.Schemas.file ? notebook.scheme : ''}`
            });
        }
        CellUri.generateCellMetadataUri = generateCellMetadataUri;
        function parseCellMetadataUri(metadata) {
            if (metadata.scheme !== network_1.Schemas.vscodeNotebookCellMetadata) {
                return undefined;
            }
            const match = _regex.exec(metadata.fragment);
            if (!match) {
                return undefined;
            }
            const handle = Number(match[1]);
            return {
                handle,
                notebook: metadata.with({
                    scheme: metadata.fragment.substr(match[0].length) || network_1.Schemas.file,
                    fragment: null
                })
            };
        }
        CellUri.parseCellMetadataUri = parseCellMetadataUri;
    })(CellUri = exports.CellUri || (exports.CellUri = {}));
    const _mimeTypeInfo = new Map([
        ['application/json', { alwaysSecure: true, supportedByCore: true }],
        ['text/markdown', { alwaysSecure: true, supportedByCore: true }],
        ['image/png', { alwaysSecure: true, supportedByCore: true }],
        ['text/plain', { alwaysSecure: true, supportedByCore: true }],
        ['application/javascript', { supportedByCore: true }],
        ['text/html', { supportedByCore: true }],
        ['image/svg+xml', { supportedByCore: true }],
        ['image/jpeg', { supportedByCore: true }],
        ['text/x-javascript', { supportedByCore: true }],
        ['application/x.notebook.error-traceback', { alwaysSecure: true, supportedByCore: true }],
        ['application/x.notebook.stream', { alwaysSecure: true, supportedByCore: true, mergeable: true }],
        ['application/x.notebook.stdout', { alwaysSecure: true, supportedByCore: true, mergeable: true }],
        ['application/x.notebook.stderr', { alwaysSecure: true, supportedByCore: true, mergeable: true }],
    ]);
    function mimeTypeIsAlwaysSecure(mimeType) {
        var _a, _b;
        return (_b = (_a = _mimeTypeInfo.get(mimeType)) === null || _a === void 0 ? void 0 : _a.alwaysSecure) !== null && _b !== void 0 ? _b : false;
    }
    exports.mimeTypeIsAlwaysSecure = mimeTypeIsAlwaysSecure;
    function mimeTypeSupportedByCore(mimeType) {
        var _a, _b;
        return (_b = (_a = _mimeTypeInfo.get(mimeType)) === null || _a === void 0 ? void 0 : _a.supportedByCore) !== null && _b !== void 0 ? _b : false;
    }
    exports.mimeTypeSupportedByCore = mimeTypeSupportedByCore;
    function mimeTypeIsMergeable(mimeType) {
        var _a, _b;
        return (_b = (_a = _mimeTypeInfo.get(mimeType)) === null || _a === void 0 ? void 0 : _a.mergeable) !== null && _b !== void 0 ? _b : false;
    }
    exports.mimeTypeIsMergeable = mimeTypeIsMergeable;
    // if (isWindows) {
    // 	value = value.replace(/\//g, '\\');
    // }
    function matchGlobUniversal(pattern, path) {
        if (platform_1.isWindows) {
            pattern = pattern.replace(/\//g, '\\');
            path = path.replace(/\//g, '\\');
        }
        return glob.match(pattern, path);
    }
    function getMimeTypeOrder(mimeType, userDisplayOrder, defaultOrder) {
        let order = 0;
        for (let i = 0; i < userDisplayOrder.length; i++) {
            if (matchGlobUniversal(userDisplayOrder[i], mimeType)) {
                return order;
            }
            order++;
        }
        for (let i = 0; i < defaultOrder.length; i++) {
            if (matchGlobUniversal(defaultOrder[i], mimeType)) {
                return order;
            }
            order++;
        }
        return order;
    }
    function sortMimeTypes(mimeTypes, userDisplayOrder, defaultOrder) {
        return mimeTypes.sort((a, b) => getMimeTypeOrder(a, userDisplayOrder, defaultOrder) - getMimeTypeOrder(b, userDisplayOrder, defaultOrder));
    }
    exports.sortMimeTypes = sortMimeTypes;
    function diff(before, after, contains, equal = (a, b) => a === b) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            if (equal(beforeElement, afterElement)) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
                continue;
            }
            if (contains(afterElement)) {
                // `afterElement` exists before, which means some elements before `afterElement` are deleted
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else {
                // `afterElement` added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.diff = diff;
    exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = new contextkey_1.RawContextKey('notebookEditorCursorAtBoundary', 'none');
    var NotebookEditorPriority;
    (function (NotebookEditorPriority) {
        NotebookEditorPriority["default"] = "default";
        NotebookEditorPriority["option"] = "option";
    })(NotebookEditorPriority = exports.NotebookEditorPriority || (exports.NotebookEditorPriority = {}));
    //TODO@rebornix test
    function isDocumentExcludePattern(filenamePattern) {
        const arg = filenamePattern;
        if ((typeof arg.include === 'string' || glob.isRelativePattern(arg.include))
            && (typeof arg.exclude === 'string' || glob.isRelativePattern(arg.exclude))) {
            return true;
        }
        return false;
    }
    exports.isDocumentExcludePattern = isDocumentExcludePattern;
    function notebookDocumentFilterMatch(filter, viewType, resource) {
        if (Array.isArray(filter.viewType) && filter.viewType.indexOf(viewType) >= 0) {
            return true;
        }
        if (filter.viewType === viewType) {
            return true;
        }
        if (filter.filenamePattern) {
            let filenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.include : filter.filenamePattern;
            let excludeFilenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.exclude : undefined;
            if (glob.match(filenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                if (excludeFilenamePattern) {
                    if (glob.match(excludeFilenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                        // should exclude
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    exports.notebookDocumentFilterMatch = notebookDocumentFilterMatch;
    class CellSequence {
        constructor(textModel) {
            this.textModel = textModel;
        }
        getElements() {
            const hashValue = new Int32Array(this.textModel.cells.length);
            for (let i = 0; i < this.textModel.cells.length; i++) {
                hashValue[i] = this.textModel.cells[i].getHashValue();
            }
            return hashValue;
        }
    }
    exports.CellSequence = CellSequence;
    exports.DisplayOrderKey = 'notebook.displayOrder';
    exports.CellToolbarLocKey = 'notebook.cellToolbarLocation';
    exports.ShowCellStatusBarKey = 'notebook.showCellStatusBar';
    exports.NotebookTextDiffEditorPreview = 'notebook.diff.enablePreview';
    exports.ExperimentalUseMarkdownRenderer = 'notebook.experimental.useMarkdownRenderer';
    var CellStatusbarAlignment;
    (function (CellStatusbarAlignment) {
        CellStatusbarAlignment[CellStatusbarAlignment["Left"] = 1] = "Left";
        CellStatusbarAlignment[CellStatusbarAlignment["Right"] = 2] = "Right";
    })(CellStatusbarAlignment = exports.CellStatusbarAlignment || (exports.CellStatusbarAlignment = {}));
    exports.NOTEBOOK_WORKING_COPY_TYPE_PREFIX = 'notebook/';
});

define(__m[53/*vs/workbench/contrib/notebook/common/services/notebookSimpleWorker*/], __M([0/*require*/,1/*exports*/,32/*vs/base/common/diff/diff*/,12/*vs/base/common/hash*/,8/*vs/base/common/uri*/,50/*vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder*/,52/*vs/workbench/contrib/notebook/common/notebookCommon*/,7/*vs/editor/common/core/range*/]), function (require, exports, diff_1, hash_1, uri_1, pieceTreeTextBufferBuilder_1, notebookCommon_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = exports.NotebookEditorSimpleWorker = exports.CellSequence = void 0;
    class MirrorCell {
        constructor(handle, _source, language, cellKind, outputs, metadata) {
            this.handle = handle;
            this._source = _source;
            this.language = language;
            this.cellKind = cellKind;
            this.outputs = outputs;
            this.metadata = metadata;
            this._primaryKey = null;
            this._hash = null;
        }
        get textBuffer() {
            if (this._textBuffer) {
                return this._textBuffer;
            }
            const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
            builder.acceptChunk(Array.isArray(this._source) ? this._source.join('\n') : this._source);
            const bufferFactory = builder.finish(true);
            this._textBuffer = bufferFactory.create(1 /* LF */).textBuffer;
            return this._textBuffer;
        }
        primaryKey() {
            if (this._primaryKey === undefined) {
                this._primaryKey = (0, hash_1.hash)(this.getValue());
            }
            return this._primaryKey;
        }
        getFullModelRange() {
            const lineCount = this.textBuffer.getLineCount();
            return new range_1.Range(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
        }
        getValue() {
            const fullRange = this.getFullModelRange();
            const eol = this.textBuffer.getEOL();
            if (eol === '\n') {
                return this.textBuffer.getValueInRange(fullRange, 1 /* LF */);
            }
            else {
                return this.textBuffer.getValueInRange(fullRange, 2 /* CRLF */);
            }
        }
        getComparisonValue() {
            if (this._primaryKey !== null) {
                return this._primaryKey;
            }
            this._hash = (0, hash_1.hash)([(0, hash_1.hash)(this.language), (0, hash_1.hash)(this.getValue()), this.metadata, this.outputs.map(op => ({
                    outputs: op.outputs,
                    metadata: op.metadata
                }))]);
            return this._hash;
        }
        getHashValue() {
            if (this._hash !== null) {
                return this._hash;
            }
            this._hash = (0, hash_1.hash)([(0, hash_1.hash)(this.getValue()), this.language, this.metadata]);
            return this._hash;
        }
    }
    class MirrorNotebookDocument {
        constructor(uri, cells, metadata) {
            this.uri = uri;
            this.cells = cells;
            this.metadata = metadata;
        }
        acceptModelChanged(event) {
            // note that the cell content change is not applied to the MirrorCell
            // but it's fine as if a cell content is modified after the first diff, its position will not change any more
            // TODO@rebornix, but it might lead to interesting bugs in the future.
            event.rawEvents.forEach(e => {
                if (e.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange) {
                    this._spliceNotebookCells(e.changes);
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.Move) {
                    const cells = this.cells.splice(e.index, 1);
                    this.cells.splice(e.newIdx, 0, ...cells);
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.Output) {
                    const cell = this.cells[e.index];
                    cell.outputs = e.outputs;
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeLanguage) {
                    const cell = this.cells[e.index];
                    cell.language = e.language;
                }
                else if (e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata) {
                    const cell = this.cells[e.index];
                    cell.metadata = e.metadata;
                }
            });
        }
        _spliceNotebookCells(splices) {
            splices.reverse().forEach(splice => {
                const cellDtos = splice[2];
                const newCells = cellDtos.map(cell => {
                    return new MirrorCell(cell.handle, cell.source, cell.language, cell.cellKind, cell.outputs, cell.metadata);
                });
                this.cells.splice(splice[0], splice[1], ...newCells);
            });
        }
    }
    class CellSequence {
        constructor(textModel) {
            this.textModel = textModel;
        }
        getElements() {
            const hashValue = new Int32Array(this.textModel.cells.length);
            for (let i = 0; i < this.textModel.cells.length; i++) {
                hashValue[i] = this.textModel.cells[i].getComparisonValue();
            }
            return hashValue;
        }
        getCellHash(cell) {
            const source = Array.isArray(cell.source) ? cell.source.join('\n') : cell.source;
            const hashVal = (0, hash_1.hash)([(0, hash_1.hash)(source), cell.metadata]);
            return hashVal;
        }
    }
    exports.CellSequence = CellSequence;
    class NotebookEditorSimpleWorker {
        constructor() {
            this._models = Object.create(null);
        }
        dispose() {
        }
        acceptNewModel(uri, data) {
            this._models[uri] = new MirrorNotebookDocument(uri_1.URI.parse(uri), data.cells.map(dto => new MirrorCell(dto.handle, dto.source, dto.language, dto.cellKind, dto.outputs, dto.metadata)), data.metadata);
        }
        acceptModelChanged(strURL, event) {
            const model = this._models[strURL];
            if (model) {
                model.acceptModelChanged(event);
            }
        }
        acceptRemovedModel(strURL) {
            if (!this._models[strURL]) {
                return;
            }
            delete this._models[strURL];
        }
        computeDiff(originalUrl, modifiedUrl) {
            const original = this._getModel(originalUrl);
            const modified = this._getModel(modifiedUrl);
            const diff = new diff_1.LcsDiff(new CellSequence(original), new CellSequence(modified));
            const diffResult = diff.ComputeDiff(false);
            /* let cellLineChanges: { originalCellhandle: number, modifiedCellhandle: number, lineChanges: editorCommon.ILineChange[] }[] = [];
    
            diffResult.changes.forEach(change => {
                if (change.modifiedLength === 0) {
                    // deletion ...
                    return;
                }
    
                if (change.originalLength === 0) {
                    // insertion
                    return;
                }
    
                for (let i = 0, len = Math.min(change.modifiedLength, change.originalLength); i < len; i++) {
                    let originalIndex = change.originalStart + i;
                    let modifiedIndex = change.modifiedStart + i;
    
                    const originalCell = original.cells[originalIndex];
                    const modifiedCell = modified.cells[modifiedIndex];
    
                    if (originalCell.getValue() !== modifiedCell.getValue()) {
                        // console.log(`original cell ${originalIndex} content change`);
                        const originalLines = originalCell.textBuffer.getLinesContent();
                        const modifiedLines = modifiedCell.textBuffer.getLinesContent();
                        const diffComputer = new DiffComputer(originalLines, modifiedLines, {
                            shouldComputeCharChanges: true,
                            shouldPostProcessCharChanges: true,
                            shouldIgnoreTrimWhitespace: false,
                            shouldMakePrettyDiff: true,
                            maxComputationTime: 5000
                        });
    
                        const lineChanges = diffComputer.computeDiff().changes;
    
                        cellLineChanges.push({
                            originalCellhandle: originalCell.handle,
                            modifiedCellhandle: modifiedCell.handle,
                            lineChanges
                        });
    
                        // console.log(lineDecorations);
    
                    } else {
                        // console.log(`original cell ${originalIndex} metadata change`);
                    }
    
                }
            });
     */
            return {
                cellsDiff: diffResult,
                // linesDiff: cellLineChanges
            };
        }
        _getModel(uri) {
            return this._models[uri];
        }
    }
    exports.NotebookEditorSimpleWorker = NotebookEditorSimpleWorker;
    /**
     * Called on the worker side
     * @internal
     */
    function create(host) {
        return new NotebookEditorSimpleWorker();
    }
    exports.create = create;
});

}).call(this);
//# sourceMappingURL=notebookSimpleWorker.js.map
