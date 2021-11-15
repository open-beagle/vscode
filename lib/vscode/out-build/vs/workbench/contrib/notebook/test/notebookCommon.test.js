/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/test/testNotebookEditor", "vs/base/common/uri", "vs/editor/common/services/modeService"], function (require, exports, assert, notebookCommon_1, notebookRange_1, testNotebookEditor_1, uri_1, modeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookCommon', () => {
        const instantiationService = (0, testNotebookEditor_1.setupInstantiationService)();
        const modeService = instantiationService.get(modeService_1.IModeService);
        test('sortMimeTypes default orders', function () {
            const defaultDisplayOrder = notebookCommon_1.NOTEBOOK_DISPLAY_ORDER;
            assert.deepStrictEqual((0, notebookCommon_1.sortMimeTypes)([
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'text/markdown',
                'image/png',
                'image/jpeg',
                'text/plain'
            ], [], defaultDisplayOrder), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'text/markdown',
                'image/png',
                'image/jpeg',
                'text/plain'
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.sortMimeTypes)([
                'application/json',
                'text/markdown',
                'application/javascript',
                'text/html',
                'text/plain',
                'image/png',
                'image/jpeg',
                'image/svg+xml'
            ], [], defaultDisplayOrder), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'text/markdown',
                'image/png',
                'image/jpeg',
                'text/plain'
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.sortMimeTypes)([
                'text/markdown',
                'application/json',
                'text/plain',
                'image/jpeg',
                'application/javascript',
                'text/html',
                'image/png',
                'image/svg+xml'
            ], [], defaultDisplayOrder), [
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'text/markdown',
                'image/png',
                'image/jpeg',
                'text/plain'
            ]);
        });
        test('sortMimeTypes user orders', function () {
            const defaultDisplayOrder = notebookCommon_1.NOTEBOOK_DISPLAY_ORDER;
            assert.deepStrictEqual((0, notebookCommon_1.sortMimeTypes)([
                'application/json',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'text/markdown',
                'image/png',
                'image/jpeg',
                'text/plain'
            ], [
                'image/png',
                'text/plain',
                'text/markdown',
                'text/html',
                'application/json'
            ], defaultDisplayOrder), [
                'image/png',
                'text/plain',
                'text/markdown',
                'text/html',
                'application/json',
                'application/javascript',
                'image/svg+xml',
                'image/jpeg',
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.sortMimeTypes)([
                'text/markdown',
                'application/json',
                'text/plain',
                'application/javascript',
                'text/html',
                'image/svg+xml',
                'image/jpeg',
                'image/png'
            ], [
                'application/json',
                'text/html',
                'text/html',
                'text/markdown',
                'application/json'
            ], defaultDisplayOrder), [
                'application/json',
                'text/html',
                'text/markdown',
                'application/javascript',
                'image/svg+xml',
                'image/png',
                'image/jpeg',
                'text/plain'
            ]);
        });
        test('sortMimeTypes glob', function () {
            const defaultDisplayOrder = notebookCommon_1.NOTEBOOK_DISPLAY_ORDER;
            // unknown mime types come last
            assert.deepStrictEqual((0, notebookCommon_1.sortMimeTypes)([
                'application/json',
                'application/vnd-vega.json',
                'application/vnd-plot.json',
                'application/javascript',
                'text/html'
            ], [
                'text/markdown',
                'text/html',
                'application/json'
            ], defaultDisplayOrder), [
                'text/html',
                'application/json',
                'application/javascript',
                'application/vnd-vega.json',
                'application/vnd-plot.json'
            ], 'unknown mimetypes keep the ordering');
            assert.deepStrictEqual((0, notebookCommon_1.sortMimeTypes)([
                'application/json',
                'application/javascript',
                'text/html',
                'application/vnd-plot.json',
                'application/vnd-vega.json'
            ], [
                'application/vnd-vega*',
                'text/markdown',
                'text/html',
                'application/json'
            ], defaultDisplayOrder), [
                'application/vnd-vega.json',
                'text/html',
                'application/json',
                'application/javascript',
                'application/vnd-plot.json'
            ], 'glob *');
        });
        test('diff cells', function () {
            const cells = [];
            for (let i = 0; i < 5; i++) {
                cells.push(new testNotebookEditor_1.TestCell('notebook', i, `var a = ${i};`, 'javascript', notebookCommon_1.CellKind.Code, [], modeService));
            }
            assert.deepStrictEqual((0, notebookCommon_1.diff)(cells, [], (cell) => {
                return cells.indexOf(cell) > -1;
            }), [
                {
                    start: 0,
                    deleteCount: 5,
                    toInsert: []
                }
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.diff)([], cells, (cell) => {
                return false;
            }), [
                {
                    start: 0,
                    deleteCount: 0,
                    toInsert: cells
                }
            ]);
            const cellA = new testNotebookEditor_1.TestCell('notebook', 6, 'var a = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], modeService);
            const cellB = new testNotebookEditor_1.TestCell('notebook', 7, 'var a = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], modeService);
            const modifiedCells = [
                cells[0],
                cells[1],
                cellA,
                cells[3],
                cellB,
                cells[4]
            ];
            const splices = (0, notebookCommon_1.diff)(cells, modifiedCells, (cell) => {
                return cells.indexOf(cell) > -1;
            });
            assert.deepStrictEqual(splices, [
                {
                    start: 2,
                    deleteCount: 1,
                    toInsert: [cellA]
                },
                {
                    start: 4,
                    deleteCount: 0,
                    toInsert: [cellB]
                }
            ]);
        });
    });
    suite('CellUri', function () {
        test('parse, generate (file-scheme)', function () {
            const nb = uri_1.URI.parse('foo:///bar/følder/file.nb');
            const id = 17;
            const data = notebookCommon_1.CellUri.generate(nb, id);
            const actual = notebookCommon_1.CellUri.parse(data);
            assert.ok(Boolean(actual));
            assert.strictEqual(actual === null || actual === void 0 ? void 0 : actual.handle, id);
            assert.strictEqual(actual === null || actual === void 0 ? void 0 : actual.notebook.toString(), nb.toString());
        });
        test('parse, generate (foo-scheme)', function () {
            const nb = uri_1.URI.parse('foo:///bar/følder/file.nb');
            const id = 17;
            const data = notebookCommon_1.CellUri.generate(nb, id);
            const actual = notebookCommon_1.CellUri.parse(data);
            assert.ok(Boolean(actual));
            assert.strictEqual(actual === null || actual === void 0 ? void 0 : actual.handle, id);
            assert.strictEqual(actual === null || actual === void 0 ? void 0 : actual.notebook.toString(), nb.toString());
        });
    });
    suite('CellRange', function () {
        test('Cell range to index', function () {
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([]), []);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 0 }]), []);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 1 }]), [0]);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 2 }]), [0, 1]);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 2 }, { start: 2, end: 3 }]), [0, 1, 2]);
            assert.deepStrictEqual((0, notebookRange_1.cellRangesToIndexes)([{ start: 0, end: 2 }, { start: 3, end: 4 }]), [0, 1, 3]);
        });
        test('Cell index to range', function () {
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([]), []);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0]), [{ start: 0, end: 1 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0, 1]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0, 1, 2]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([0, 1, 3]), [{ start: 0, end: 2 }, { start: 3, end: 4 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([1, 0]), [{ start: 0, end: 2 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([1, 2, 0]), [{ start: 0, end: 3 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([3, 1, 0]), [{ start: 0, end: 2 }, { start: 3, end: 4 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([9, 10]), [{ start: 9, end: 11 }]);
            assert.deepStrictEqual((0, notebookRange_1.cellIndexesToRanges)([10, 9]), [{ start: 9, end: 11 }]);
        });
    });
});
//# sourceMappingURL=notebookCommon.test.js.map