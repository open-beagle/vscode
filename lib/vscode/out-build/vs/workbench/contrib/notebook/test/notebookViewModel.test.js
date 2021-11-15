/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModel", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/testNotebookEditor"], function (require, exports, assert, uri_1, bulkEditService_1, modelService_1, modeService_1, resolverService_1, configuration_1, testConfigurationService_1, themeService_1, testThemeService_1, undoRedo_1, notebookBrowser_1, eventDispatcher_1, notebookViewModel_1, notebookTextModel_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookViewModel', () => {
        const instantiationService = (0, testNotebookEditor_1.setupInstantiationService)();
        const textModelService = instantiationService.get(resolverService_1.ITextModelService);
        const bulkEditService = instantiationService.get(bulkEditService_1.IBulkEditService);
        const undoRedoService = instantiationService.get(undoRedo_1.IUndoRedoService);
        const modelService = instantiationService.get(modelService_1.IModelService);
        const modeService = instantiationService.get(modeService_1.IModeService);
        instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
        instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        test('ctor', function () {
            const notebook = new notebookTextModel_1.NotebookTextModel('notebook', uri_1.URI.parse('test'), [], notebookCommon_1.notebookDocumentMetadataDefaults, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false }, undoRedoService, modelService, modeService);
            const model = new testNotebookEditor_1.NotebookEditorTestModel(notebook);
            const eventDispatcher = new eventDispatcher_1.NotebookEventDispatcher();
            const viewModel = new notebookViewModel_1.NotebookViewModel('notebook', model.notebook, eventDispatcher, null, instantiationService, bulkEditService, undoRedoService, textModelService);
            assert.strictEqual(viewModel.viewType, 'notebook');
        });
        test('insert/delete', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const cell = viewModel.createCell(1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true, true, null, []);
                assert.strictEqual(viewModel.length, 3);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 3);
                assert.strictEqual(viewModel.getCellIndex(cell), 1);
                viewModel.deleteCell(1, true);
                assert.strictEqual(viewModel.length, 2);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 2);
                assert.strictEqual(viewModel.getCellIndex(cell), -1);
            });
        });
        test('move cells down', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['//a', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['//b', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['//c', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                const viewModel = editor.viewModel;
                viewModel.moveCellToIdx(0, 1, 0, true);
                // no-op
                assert.strictEqual((_a = viewModel.cellAt(0)) === null || _a === void 0 ? void 0 : _a.getText(), '//a');
                assert.strictEqual((_b = viewModel.cellAt(1)) === null || _b === void 0 ? void 0 : _b.getText(), '//b');
                viewModel.moveCellToIdx(0, 1, 1, true);
                // b, a, c
                assert.strictEqual((_c = viewModel.cellAt(0)) === null || _c === void 0 ? void 0 : _c.getText(), '//b');
                assert.strictEqual((_d = viewModel.cellAt(1)) === null || _d === void 0 ? void 0 : _d.getText(), '//a');
                assert.strictEqual((_e = viewModel.cellAt(2)) === null || _e === void 0 ? void 0 : _e.getText(), '//c');
                viewModel.moveCellToIdx(0, 1, 2, true);
                // a, c, b
                assert.strictEqual((_f = viewModel.cellAt(0)) === null || _f === void 0 ? void 0 : _f.getText(), '//a');
                assert.strictEqual((_g = viewModel.cellAt(1)) === null || _g === void 0 ? void 0 : _g.getText(), '//c');
                assert.strictEqual((_h = viewModel.cellAt(2)) === null || _h === void 0 ? void 0 : _h.getText(), '//b');
            });
        });
        test('move cells up', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['//a', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['//b', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['//c', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                var _a, _b, _c, _d, _e;
                const viewModel = editor.viewModel;
                viewModel.moveCellToIdx(1, 1, 0, true);
                // b, a, c
                assert.strictEqual((_a = viewModel.cellAt(0)) === null || _a === void 0 ? void 0 : _a.getText(), '//b');
                assert.strictEqual((_b = viewModel.cellAt(1)) === null || _b === void 0 ? void 0 : _b.getText(), '//a');
                viewModel.moveCellToIdx(2, 1, 0, true);
                // c, b, a
                assert.strictEqual((_c = viewModel.cellAt(0)) === null || _c === void 0 ? void 0 : _c.getText(), '//c');
                assert.strictEqual((_d = viewModel.cellAt(1)) === null || _d === void 0 ? void 0 : _d.getText(), '//b');
                assert.strictEqual((_e = viewModel.cellAt(2)) === null || _e === void 0 ? void 0 : _e.getText(), '//a');
            });
        });
        test('index', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const firstViewCell = viewModel.cellAt(0);
                const lastViewCell = viewModel.cellAt(viewModel.length - 1);
                const insertIndex = viewModel.getCellIndex(firstViewCell) + 1;
                const cell = viewModel.createCell(insertIndex, 'var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                const addedCellIndex = viewModel.getCellIndex(cell);
                viewModel.deleteCell(addedCellIndex, true);
                const secondInsertIndex = viewModel.getCellIndex(lastViewCell) + 1;
                const cell2 = viewModel.createCell(secondInsertIndex, 'var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                assert.strictEqual(viewModel.length, 3);
                assert.strictEqual(viewModel.notebookDocument.cells.length, 3);
                assert.strictEqual(viewModel.getCellIndex(cell2), 2);
            });
        });
    });
    function getVisibleCells(cells, hiddenRanges) {
        if (!hiddenRanges.length) {
            return cells;
        }
        let start = 0;
        let hiddenRangeIndex = 0;
        const result = [];
        while (start < cells.length && hiddenRangeIndex < hiddenRanges.length) {
            if (start < hiddenRanges[hiddenRangeIndex].start) {
                result.push(...cells.slice(start, hiddenRanges[hiddenRangeIndex].start));
            }
            start = hiddenRanges[hiddenRangeIndex].end + 1;
            hiddenRangeIndex++;
        }
        if (start < cells.length) {
            result.push(...cells.slice(start));
        }
        return result;
    }
    suite('NotebookViewModel Decorations', () => {
        test('tracking range', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const viewModel = editor.viewModel;
                const trackedId = viewModel.setTrackedRange('test', { start: 1, end: 2 }, 3 /* GrowsOnlyWhenTypingAfter */);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2,
                });
                viewModel.createCell(0, 'var d = 6;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 2,
                    end: 3
                });
                viewModel.deleteCell(0, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2
                });
                viewModel.createCell(3, 'var d = 7;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                viewModel.deleteCell(3, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 2
                });
                viewModel.deleteCell(1, true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 0,
                    end: 1
                });
            });
        });
        test('tracking range 2', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const viewModel = editor.viewModel;
                const trackedId = viewModel.setTrackedRange('test', { start: 1, end: 3 }, 3 /* GrowsOnlyWhenTypingAfter */);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                viewModel.createCell(5, 'var d = 9;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 3
                });
                viewModel.createCell(4, 'var d = 10;', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                assert.deepStrictEqual(viewModel.getTrackedRange(trackedId), {
                    start: 1,
                    end: 4
                });
            });
        });
        test('reduce range', async function () {
            assert.deepStrictEqual((0, notebookBrowser_1.reduceCellRanges)([
                { start: 0, end: 1 },
                { start: 1, end: 2 },
                { start: 4, end: 6 }
            ]), [
                { start: 0, end: 2 },
                { start: 4, end: 6 }
            ]);
            assert.deepStrictEqual((0, notebookBrowser_1.reduceCellRanges)([
                { start: 0, end: 1 },
                { start: 1, end: 2 },
                { start: 3, end: 4 }
            ]), [
                { start: 0, end: 4 }
            ]);
        });
        test('diff hidden ranges', async function () {
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5], []), [1, 2, 3, 4, 5]);
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5], [{ start: 1, end: 2 }]), [1, 4, 5]);
            assert.deepStrictEqual(getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 1, end: 2 },
                { start: 4, end: 5 }
            ]), [1, 4, 7, 8, 9]);
            const original = getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 1, end: 2 },
                { start: 4, end: 5 }
            ]);
            const modified = getVisibleCells([1, 2, 3, 4, 5, 6, 7, 8, 9], [
                { start: 2, end: 4 }
            ]);
            assert.deepStrictEqual((0, notebookCommon_1.diff)(original, modified, (a) => {
                return original.indexOf(a) >= 0;
            }), [{ start: 1, deleteCount: 1, toInsert: [2, 6] }]);
        });
        test('hidden ranges', async function () {
        });
    });
    suite('NotebookViewModel API', () => {
        test('#115432, get nearest code cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['b = 2;', 'python', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header d', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var e = 4;', 'TypeScript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header f', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                assert.strictEqual(viewModel.nearestCodeCellIndex(0), 1);
                // find the nearest code cell from above
                assert.strictEqual(viewModel.nearestCodeCellIndex(2), 1);
                assert.strictEqual(viewModel.nearestCodeCellIndex(4), 3);
                assert.strictEqual(viewModel.nearestCodeCellIndex(5), 4);
                assert.strictEqual(viewModel.nearestCodeCellIndex(6), 4);
            });
        });
        test('#108464, get nearest code cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                assert.strictEqual(viewModel.nearestCodeCellIndex(2), 1);
            });
        });
        test('getCells', async () => {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                assert.strictEqual(viewModel.getCells().length, 3);
                assert.deepStrictEqual(viewModel.getCells({ start: 0, end: 1 }).map(cell => cell.getText()), ['# header a']);
                assert.deepStrictEqual(viewModel.getCells({ start: 0, end: 2 }).map(cell => cell.getText()), ['# header a', 'var b = 1;']);
                assert.deepStrictEqual(viewModel.getCells({ start: 0, end: 3 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCells({ start: 0, end: 4 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCells({ start: 1, end: 4 }).map(cell => cell.getText()), ['var b = 1;', '# header b']);
                assert.deepStrictEqual(viewModel.getCells({ start: 2, end: 4 }).map(cell => cell.getText()), ['# header b']);
                assert.deepStrictEqual(viewModel.getCells({ start: 3, end: 4 }).map(cell => cell.getText()), []);
                // no one should use an invalid range but `getCells` should be able to handle that.
                assert.deepStrictEqual(viewModel.getCells({ start: -1, end: 1 }).map(cell => cell.getText()), ['# header a']);
                assert.deepStrictEqual(viewModel.getCells({ start: 3, end: 0 }).map(cell => cell.getText()), ['# header a', 'var b = 1;', '# header b']);
            });
        });
        test('split cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                assert.deepStrictEqual(viewModel.computeCellLinesContents(viewModel.cellAt(0), [{ lineNumber: 1, column: 4 }]), [
                    'var',
                    ' b = 1;'
                ]);
                assert.deepStrictEqual(viewModel.computeCellLinesContents(viewModel.cellAt(0), [{ lineNumber: 1, column: 4 }, { lineNumber: 1, column: 6 }]), [
                    'var',
                    ' b',
                    ' = 1;'
                ]);
                assert.deepStrictEqual(viewModel.computeCellLinesContents(viewModel.cellAt(0), [{ lineNumber: 1, column: 1 }]), [
                    '',
                    'var b = 1;'
                ]);
                assert.deepStrictEqual(viewModel.computeCellLinesContents(viewModel.cellAt(0), [{ lineNumber: 1, column: 11 }]), [
                    'var b = 1;',
                    '',
                ]);
            });
        });
    });
});
//# sourceMappingURL=notebookViewModel.test.js.map