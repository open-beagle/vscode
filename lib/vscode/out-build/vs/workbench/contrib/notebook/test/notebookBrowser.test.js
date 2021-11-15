/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, assert, notebookBrowser_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('notebookBrowser', () => {
        test('Reduce ranges', function () {
            assert.deepStrictEqual((0, notebookBrowser_1.reduceCellRanges)([{ start: 0, end: 1 }, { start: 1, end: 2 }]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookBrowser_1.reduceCellRanges)([{ start: 0, end: 2 }, { start: 1, end: 3 }]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookBrowser_1.reduceCellRanges)([{ start: 1, end: 3 }, { start: 0, end: 2 }]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookBrowser_1.reduceCellRanges)([{ start: 0, end: 2 }, { start: 4, end: 5 }]), [{ start: 0, end: 2 }, { start: 4, end: 5 }]);
        });
        suite('getRanges', function () {
            const predicate = (cell) => cell.cellKind === notebookCommon_1.CellKind.Code;
            test('all code', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Code },
                ];
                assert.deepStrictEqual((0, notebookBrowser_1.getRanges)(cells, predicate), [{ start: 0, end: 2 }]);
            });
            test('none code', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Markdown },
                    { cellKind: notebookCommon_1.CellKind.Markdown },
                ];
                assert.deepStrictEqual((0, notebookBrowser_1.getRanges)(cells, predicate), []);
            });
            test('start code', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Markdown },
                ];
                assert.deepStrictEqual((0, notebookBrowser_1.getRanges)(cells, predicate), [{ start: 0, end: 1 }]);
            });
            test('random', function () {
                const cells = [
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Markdown },
                    { cellKind: notebookCommon_1.CellKind.Code },
                    { cellKind: notebookCommon_1.CellKind.Markdown },
                    { cellKind: notebookCommon_1.CellKind.Markdown },
                    { cellKind: notebookCommon_1.CellKind.Code },
                ];
                assert.deepStrictEqual((0, notebookBrowser_1.getRanges)(cells, predicate), [{ start: 0, end: 2 }, { start: 3, end: 4 }, { start: 6, end: 7 }]);
            });
        });
    });
});
//# sourceMappingURL=notebookBrowser.test.js.map