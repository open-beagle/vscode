/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/navigator"], function (require, exports, navigator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HistoryNavigator2 = exports.HistoryNavigator = void 0;
    class HistoryNavigator {
        constructor(history = [], limit = 10) {
            this._initialize(history);
            this._limit = limit;
            this._onChange();
        }
        getHistory() {
            return this._elements;
        }
        add(t) {
            this._history.delete(t);
            this._history.add(t);
            this._onChange();
        }
        next() {
            if (this._currentPosition() !== this._elements.length - 1) {
                return this._navigator.next();
            }
            return null;
        }
        previous() {
            if (this._currentPosition() !== 0) {
                return this._navigator.previous();
            }
            return null;
        }
        current() {
            return this._navigator.current();
        }
        first() {
            return this._navigator.first();
        }
        last() {
            return this._navigator.last();
        }
        has(t) {
            return this._history.has(t);
        }
        clear() {
            this._initialize([]);
            this._onChange();
        }
        _onChange() {
            this._reduceToLimit();
            const elements = this._elements;
            this._navigator = new navigator_1.ArrayNavigator(elements, 0, elements.length, elements.length);
        }
        _reduceToLimit() {
            const data = this._elements;
            if (data.length > this._limit) {
                this._initialize(data.slice(data.length - this._limit));
            }
        }
        _currentPosition() {
            const currentElement = this._navigator.current();
            if (!currentElement) {
                return -1;
            }
            return this._elements.indexOf(currentElement);
        }
        _initialize(history) {
            this._history = new Set();
            for (const entry of history) {
                this._history.add(entry);
            }
        }
        get _elements() {
            const elements = [];
            this._history.forEach(e => elements.push(e));
            return elements;
        }
    }
    exports.HistoryNavigator = HistoryNavigator;
    class HistoryNavigator2 {
        constructor(history, capacity = 10) {
            this.capacity = capacity;
            if (history.length < 1) {
                throw new Error('not supported');
            }
            this.size = 1;
            this.head = this.tail = this.cursor = {
                value: history[0],
                previous: undefined,
                next: undefined
            };
            for (let i = 1; i < history.length; i++) {
                this.add(history[i]);
            }
        }
        add(value) {
            const node = {
                value,
                previous: this.tail,
                next: undefined
            };
            this.tail.next = node;
            this.tail = node;
            this.cursor = this.tail;
            this.size++;
            while (this.size > this.capacity) {
                this.head = this.head.next;
                this.head.previous = undefined;
                this.size--;
            }
        }
        replaceLast(value) {
            this.tail.value = value;
        }
        isAtEnd() {
            return this.cursor === this.tail;
        }
        current() {
            return this.cursor.value;
        }
        previous() {
            if (this.cursor.previous) {
                this.cursor = this.cursor.previous;
            }
            return this.cursor.value;
        }
        next() {
            if (this.cursor.next) {
                this.cursor = this.cursor.next;
            }
            return this.cursor.value;
        }
        has(t) {
            let temp = this.head;
            while (temp) {
                if (temp.value === t) {
                    return true;
                }
                temp = temp.next;
            }
            return false;
        }
        resetCursor() {
            this.cursor = this.tail;
            return this.cursor.value;
        }
        *[Symbol.iterator]() {
            let node = this.head;
            while (node) {
                yield node.value;
                node = node.next;
            }
        }
    }
    exports.HistoryNavigator2 = HistoryNavigator2;
});
//# sourceMappingURL=history.js.map