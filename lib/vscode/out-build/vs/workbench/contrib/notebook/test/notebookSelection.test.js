/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/services/modeService", "vs/workbench/contrib/notebook/browser/contrib/fold/foldingModel", "vs/workbench/contrib/notebook/browser/viewModel/cellSelectionCollection", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/testNotebookEditor"], function (require, exports, assert, modeService_1, foldingModel_1, cellSelectionCollection_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookSelection', () => {
        test('focus is never empty', function () {
            const selectionCollection = new cellSelectionCollection_1.NotebookCellSelectionCollection();
            assert.deepStrictEqual(selectionCollection.focus, { start: 0, end: 0 });
            selectionCollection.setState(null, [], true, 'model');
            assert.deepStrictEqual(selectionCollection.focus, { start: 0, end: 0 });
        });
    });
    suite('NotebookCellList focus/selection', () => {
        const instantiationService = (0, testNotebookEditor_1.setupInstantiationService)();
        const modeService = instantiationService.get(modeService_1.IModeService);
        test('notebook cell list setFocus', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 2);
                cellList.setFocus([0]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                cellList.setFocus([1]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                cellList.detachViewModel();
            });
        });
        test('notebook cell list setSelections', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 2);
                cellList.setSelection([0]);
                // the only selection is also the focus
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                // set selection does not modify focus
                cellList.setSelection([1]);
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
        test('notebook cell list setFocus', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 2);
                cellList.setFocus([0]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                cellList.setFocus([1]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                cellList.setSelection([1]);
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
        test('notebook cell list focus/selection from UI', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                // arrow down, move both focus and selections
                cellList.setFocus([1], new KeyboardEvent('keydown'), undefined);
                cellList.setSelection([1], new KeyboardEvent('keydown'), undefined);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
                // shift+arrow down, expands selection
                cellList.setFocus([2], new KeyboardEvent('keydown'), undefined);
                cellList.setSelection([1, 2]);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 2, end: 3 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 3 }]);
                // arrow down, will move focus but not expand selection
                cellList.setFocus([3], new KeyboardEvent('keydown'), undefined);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 3, end: 4 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 3 }]);
            });
        });
        test('notebook cell list focus/selection with folding regions', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const foldingModel = new foldingModel_1.FoldingModel();
                foldingModel.attachViewModel(viewModel);
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                assert.strictEqual(cellList.length, 5);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                cellList.setFocus([0]);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 0, true);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.length, 3);
                // currently, focus on a folded cell will only focus the cell itself, excluding its "inner" cells
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                cellList.focusNext(1, false);
                // focus next should skip the folded items
                assert.deepStrictEqual(viewModel.getFocus(), { start: 2, end: 3 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }]);
                // unfold
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 2, false);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.length, 4);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 2, end: 3 });
            });
        });
        test('notebook cell list focus/selection with folding regions and applyEdits', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3', 'javascript', notebookCommon_1.CellKind.Markdown, [], {}],
                ['# header d', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var e = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], (editor) => {
                const viewModel = editor.viewModel;
                const foldingModel = new foldingModel_1.FoldingModel();
                foldingModel.attachViewModel(viewModel);
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                cellList.setFocus([0]);
                cellList.setSelection([0]);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 0, true);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.getModelIndex2(0), 0);
                assert.strictEqual(cellList.getModelIndex2(1), 2);
                viewModel.notebookDocument.applyEdits([{
                        editType: 1 /* Replace */, index: 0, count: 2, cells: []
                    }], true, undefined, () => undefined, undefined, false);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.getModelIndex2(0), 0);
                assert.strictEqual(cellList.getModelIndex2(1), 3);
                // mimic undo
                viewModel.notebookDocument.applyEdits([{
                        editType: 1 /* Replace */, index: 0, count: 0, cells: [
                            new testNotebookEditor_1.TestCell(viewModel.viewType, 7, '# header f', 'markdown', notebookCommon_1.CellKind.Code, [], modeService),
                            new testNotebookEditor_1.TestCell(viewModel.viewType, 8, 'var g = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], modeService)
                        ]
                    }], true, undefined, () => undefined, undefined, false);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(cellList.getModelIndex2(0), 0);
                assert.strictEqual(cellList.getModelIndex2(1), 1);
                assert.strictEqual(cellList.getModelIndex2(2), 2);
            });
        });
        test('notebook cell list getModelIndex', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header c', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const foldingModel = new foldingModel_1.FoldingModel();
                foldingModel.attachViewModel(viewModel);
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 0, true);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.deepStrictEqual(cellList.getModelIndex2(-1), 0);
                assert.deepStrictEqual(cellList.getModelIndex2(0), 0);
                assert.deepStrictEqual(cellList.getModelIndex2(1), 2);
                assert.deepStrictEqual(cellList.getModelIndex2(2), 4);
            });
        });
        test('notebook validate range', async () => {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                assert.deepStrictEqual(viewModel.validateRange(null), null);
                assert.deepStrictEqual(viewModel.validateRange(undefined), null);
                assert.deepStrictEqual(viewModel.validateRange({ start: 0, end: 0 }), null);
                assert.deepStrictEqual(viewModel.validateRange({ start: 0, end: 2 }), { start: 0, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: 0, end: 3 }), { start: 0, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: -1, end: 3 }), { start: 0, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: -1, end: 1 }), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.validateRange({ start: 2, end: 1 }), { start: 1, end: 2 });
                assert.deepStrictEqual(viewModel.validateRange({ start: 2, end: -1 }), { start: 0, end: 2 });
            });
        });
        test('notebook updateSelectionState', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }, { start: -1, end: 0 }] });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
        test('notebook cell selection w/ cell deletion', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                viewModel.deleteCell(1, true, false);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), []);
            });
        });
    });
});
//# sourceMappingURL=notebookSelection.test.js.map