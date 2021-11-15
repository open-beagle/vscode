/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/common/date"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toLocalISOString = exports.fromNow = void 0;
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    function fromNow(date, appendAgoLabel) {
        if (typeof date !== 'number') {
            date = date.getTime();
        }
        const seconds = Math.round((new Date().getTime() - date) / 1000);
        if (seconds < -30) {
            return (0, nls_1.localize)(0, null, fromNow(new Date().getTime() + seconds * 1000, false));
        }
        if (seconds < 30) {
            return (0, nls_1.localize)(1, null);
        }
        let value;
        if (seconds < minute) {
            value = seconds;
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)(2, null, value)
                    : (0, nls_1.localize)(3, null, value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)(4, null, value)
                    : (0, nls_1.localize)(5, null, value);
            }
        }
        if (seconds < hour) {
            value = Math.floor(seconds / minute);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)(6, null, value)
                    : (0, nls_1.localize)(7, null, value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)(8, null, value)
                    : (0, nls_1.localize)(9, null, value);
            }
        }
        if (seconds < day) {
            value = Math.floor(seconds / hour);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)(10, null, value)
                    : (0, nls_1.localize)(11, null, value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)(12, null, value)
                    : (0, nls_1.localize)(13, null, value);
            }
        }
        if (seconds < week) {
            value = Math.floor(seconds / day);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)(14, null, value)
                    : (0, nls_1.localize)(15, null, value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)(16, null, value)
                    : (0, nls_1.localize)(17, null, value);
            }
        }
        if (seconds < month) {
            value = Math.floor(seconds / week);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)(18, null, value)
                    : (0, nls_1.localize)(19, null, value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)(20, null, value)
                    : (0, nls_1.localize)(21, null, value);
            }
        }
        if (seconds < year) {
            value = Math.floor(seconds / month);
            if (appendAgoLabel) {
                return value === 1
                    ? (0, nls_1.localize)(22, null, value)
                    : (0, nls_1.localize)(23, null, value);
            }
            else {
                return value === 1
                    ? (0, nls_1.localize)(24, null, value)
                    : (0, nls_1.localize)(25, null, value);
            }
        }
        value = Math.floor(seconds / year);
        if (appendAgoLabel) {
            return value === 1
                ? (0, nls_1.localize)(26, null, value)
                : (0, nls_1.localize)(27, null, value);
        }
        else {
            return value === 1
                ? (0, nls_1.localize)(28, null, value)
                : (0, nls_1.localize)(29, null, value);
        }
    }
    exports.fromNow = fromNow;
    function toLocalISOString(date) {
        return date.getFullYear() +
            '-' + String(date.getMonth() + 1).padStart(2, '0') +
            '-' + String(date.getDate()).padStart(2, '0') +
            'T' + String(date.getHours()).padStart(2, '0') +
            ':' + String(date.getMinutes()).padStart(2, '0') +
            ':' + String(date.getSeconds()).padStart(2, '0') +
            '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    }
    exports.toLocalISOString = toLocalISOString;
});
//# sourceMappingURL=date.js.map