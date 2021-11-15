/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/browser/services/bulkEditService", "vs/editor/common/core/range", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/notebook/browser/contrib/cellOperations/cellOperations", "vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/workbench/contrib/notebook/browser/contrib/fold/foldingModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/testNotebookEditor"], function (require, exports, assert, bulkEditService_1, range_1, bulkCellEdits_1, cellOperations_1, coreActions_1, foldingModel_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CellOperations', () => {
        test('Move cells - single cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a;
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                await (0, cellOperations_1.moveCellRange)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual((_a = viewModel.cellAt(2)) === null || _a === void 0 ? void 0 : _a.getText(), 'var b = 1;');
            });
        });
        test('Move cells - multiple cells in a selection', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a, _b, _c;
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 0, end: 2 }] });
                await (0, cellOperations_1.moveCellRange)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual((_a = viewModel.cellAt(0)) === null || _a === void 0 ? void 0 : _a.getText(), '# header b');
                assert.strictEqual((_b = viewModel.cellAt(1)) === null || _b === void 0 ? void 0 : _b.getText(), '# header a');
                assert.strictEqual((_c = viewModel.cellAt(2)) === null || _c === void 0 ? void 0 : _c.getText(), 'var b = 1;');
            });
        });
        test('Move cells - move with folding ranges', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a, _b, _c;
                const viewModel = editor.viewModel;
                const foldingModel = new foldingModel_1.FoldingModel();
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 0, true);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 1, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                editor.setHiddenAreas([{ start: 1, end: 2 }]);
                editor.setHiddenAreas(viewModel.getHiddenRanges());
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
                await (0, cellOperations_1.moveCellRange)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual((_a = viewModel.cellAt(0)) === null || _a === void 0 ? void 0 : _a.getText(), '# header b');
                assert.strictEqual((_b = viewModel.cellAt(1)) === null || _b === void 0 ? void 0 : _b.getText(), '# header a');
                assert.strictEqual((_c = viewModel.cellAt(2)) === null || _c === void 0 ? void 0 : _c.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - single cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a, _b;
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 1, end: 2 }] });
                await (0, cellOperations_1.copyCellRange)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.length, 6);
                assert.strictEqual((_a = viewModel.cellAt(1)) === null || _a === void 0 ? void 0 : _a.getText(), 'var b = 1;');
                assert.strictEqual((_b = viewModel.cellAt(2)) === null || _b === void 0 ? void 0 : _b.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - target and selection are different, #119769', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a, _b;
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
                await (0, cellOperations_1.copyCellRange)({ notebookEditor: editor, cell: viewModel.cellAt(1), ui: true }, 'down');
                assert.strictEqual(viewModel.length, 6);
                assert.strictEqual((_a = viewModel.cellAt(1)) === null || _a === void 0 ? void 0 : _a.getText(), 'var b = 1;');
                assert.strictEqual((_b = viewModel.cellAt(2)) === null || _b === void 0 ? void 0 : _b.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - multiple cells in a selection', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a, _b, _c, _d;
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 0, end: 2 }] });
                await (0, cellOperations_1.copyCellRange)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.length, 7);
                assert.strictEqual((_a = viewModel.cellAt(0)) === null || _a === void 0 ? void 0 : _a.getText(), '# header a');
                assert.strictEqual((_b = viewModel.cellAt(1)) === null || _b === void 0 ? void 0 : _b.getText(), 'var b = 1;');
                assert.strictEqual((_c = viewModel.cellAt(2)) === null || _c === void 0 ? void 0 : _c.getText(), '# header a');
                assert.strictEqual((_d = viewModel.cellAt(3)) === null || _d === void 0 ? void 0 : _d.getText(), 'var b = 1;');
            });
        });
        test('Copy/duplicate cells - move with folding ranges', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a, _b, _c, _d;
                const viewModel = editor.viewModel;
                const foldingModel = new foldingModel_1.FoldingModel();
                foldingModel.attachViewModel(viewModel);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 0, true);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 1, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                editor.setHiddenAreas([{ start: 1, end: 2 }]);
                editor.setHiddenAreas(viewModel.getHiddenRanges());
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
                await (0, cellOperations_1.copyCellRange)({ notebookEditor: editor, cell: viewModel.cellAt(1) }, 'down');
                assert.strictEqual(viewModel.length, 7);
                assert.strictEqual((_a = viewModel.cellAt(0)) === null || _a === void 0 ? void 0 : _a.getText(), '# header a');
                assert.strictEqual((_b = viewModel.cellAt(1)) === null || _b === void 0 ? void 0 : _b.getText(), 'var b = 1;');
                assert.strictEqual((_c = viewModel.cellAt(2)) === null || _c === void 0 ? void 0 : _c.getText(), '# header a');
                assert.strictEqual((_d = viewModel.cellAt(3)) === null || _d === void 0 ? void 0 : _d.getText(), 'var b = 1;');
            });
        });
        test('Join cell with below - single cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, accessor) => {
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 3, end: 4 }, selections: [{ start: 3, end: 4 }] });
                const ret = await (0, cellOperations_1.joinNotebookCells)(editor.viewModel, { start: 3, end: 4 }, 'below');
                assert.strictEqual(ret === null || ret === void 0 ? void 0 : ret.edits.length, 2);
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[0], new bulkEditService_1.ResourceTextEdit(viewModel.cellAt(3).uri, {
                    range: new range_1.Range(1, 11, 1, 11), text: viewModel.cellAt(4).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[1], new bulkCellEdits_1.ResourceNotebookCellEdit(viewModel.notebookDocument.uri, {
                    editType: 1 /* Replace */,
                    index: 4,
                    count: 1,
                    cells: []
                }));
            });
        });
        test('Join cell with above - single cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, accessor) => {
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 3, end: 4 }, selections: [{ start: 3, end: 4 }] });
                const ret = await (0, cellOperations_1.joinNotebookCells)(editor.viewModel, { start: 4, end: 5 }, 'above');
                assert.strictEqual(ret === null || ret === void 0 ? void 0 : ret.edits.length, 2);
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[0], new bulkEditService_1.ResourceTextEdit(viewModel.cellAt(3).uri, {
                    range: new range_1.Range(1, 11, 1, 11), text: viewModel.cellAt(4).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[1], new bulkCellEdits_1.ResourceNotebookCellEdit(viewModel.notebookDocument.uri, {
                    editType: 1 /* Replace */,
                    index: 4,
                    count: 1,
                    cells: []
                }));
            });
        });
        test('Join cell with below - multiple cells', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, accessor) => {
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 1, end: 2 }, selections: [{ start: 0, end: 2 }] });
                const ret = await (0, cellOperations_1.joinNotebookCells)(editor.viewModel, { start: 0, end: 2 }, 'below');
                assert.strictEqual(ret === null || ret === void 0 ? void 0 : ret.edits.length, 2);
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[0], new bulkEditService_1.ResourceTextEdit(viewModel.cellAt(0).uri, {
                    range: new range_1.Range(1, 11, 1, 11), text: viewModel.cellAt(1).textBuffer.getEOL() + 'var b = 2;' + viewModel.cellAt(2).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[1], new bulkCellEdits_1.ResourceNotebookCellEdit(viewModel.notebookDocument.uri, {
                    editType: 1 /* Replace */,
                    index: 1,
                    count: 2,
                    cells: []
                }));
            });
        });
        test('Join cell with above - multiple cells', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor, accessor) => {
                const viewModel = editor.viewModel;
                viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 2, end: 3 }, selections: [{ start: 1, end: 3 }] });
                const ret = await (0, cellOperations_1.joinNotebookCells)(editor.viewModel, { start: 1, end: 3 }, 'above');
                assert.strictEqual(ret === null || ret === void 0 ? void 0 : ret.edits.length, 2);
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[0], new bulkEditService_1.ResourceTextEdit(viewModel.cellAt(0).uri, {
                    range: new range_1.Range(1, 11, 1, 11), text: viewModel.cellAt(1).textBuffer.getEOL() + 'var b = 2;' + viewModel.cellAt(2).textBuffer.getEOL() + 'var c = 3;'
                }));
                assert.deepStrictEqual(ret === null || ret === void 0 ? void 0 : ret.edits[1], new bulkCellEdits_1.ResourceNotebookCellEdit(viewModel.notebookDocument.uri, {
                    editType: 1 /* Replace */,
                    index: 1,
                    count: 2,
                    cells: []
                }));
            });
        });
        test('Delete focus cell', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 0, end: 1 }, [{ start: 0, end: 1 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 2);
            });
        });
        test('Delete selected cells', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 0, end: 1 }, [{ start: 0, end: 2 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 1);
            });
        });
        test('Delete focus cell out of a selection', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 0, end: 1 }, [{ start: 2, end: 4 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 3);
            });
        });
        test('Delete UI target', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                var _a, _b;
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 0, end: 1 }, [{ start: 0, end: 1 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(2));
                assert.strictEqual(viewModel.length, 2);
                assert.strictEqual((_a = viewModel.cellAt(0)) === null || _a === void 0 ? void 0 : _a.getText(), 'var a = 1;');
                assert.strictEqual((_b = viewModel.cellAt(1)) === null || _b === void 0 ? void 0 : _b.getText(), 'var b = 2;');
            });
        });
        test('Delete UI target 2', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 0, end: 1 }, [{ start: 0, end: 1 }, { start: 3, end: 5 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(1));
                assert.strictEqual(viewModel.length, 4);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 0, end: 1 }, { start: 2, end: 4 }]);
            });
        });
        test('Delete UI target 3', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 0, end: 1 }, [{ start: 2, end: 3 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 4);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 1, end: 2 }]);
            });
        });
        test('Delete UI target 4', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 2, end: 3 }, [{ start: 3, end: 5 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 4);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
                assert.deepStrictEqual(viewModel.getSelections(), [{ start: 2, end: 4 }]);
            });
        });
        test('Delete last cell sets selection correctly', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 2, end: 3 }, [{ start: 2, end: 3 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(2));
                assert.strictEqual(viewModel.length, 2);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
            });
        });
        test('#120187. Delete should work on multiple distinct selection', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 0, end: 1 }, [{ start: 0, end: 1 }, { start: 3, end: 4 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(0));
                assert.strictEqual(viewModel.length, 2);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 0, end: 1 });
            });
        });
        test('#120187. Delete should work on multiple distinct selection 2', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (editor) => {
                const viewModel = editor.viewModel;
                viewModel.setSelections({ start: 1, end: 2 }, [{ start: 1, end: 2 }, { start: 3, end: 5 }]);
                (0, coreActions_1.runDeleteAction)(viewModel, viewModel.cellAt(1));
                assert.strictEqual(viewModel.length, 2);
                assert.deepStrictEqual(viewModel.getFocus(), { start: 1, end: 2 });
            });
        });
    });
});
//# sourceMappingURL=cellOperations.test.js.map