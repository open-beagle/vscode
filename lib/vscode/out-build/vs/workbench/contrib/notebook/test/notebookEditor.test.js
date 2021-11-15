/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/test/common/mock", "vs/workbench/contrib/notebook/browser/contrib/fold/foldingModel", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/testNotebookEditor"], function (require, exports, assert, mock_1, foldingModel_1, notebookBrowser_1, notebookEditorWidget_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ListViewInfoAccessor', () => {
        const instantiationService = (0, testNotebookEditor_1.setupInstantiationService)();
        test('basics', async function () {
            await (0, testNotebookEditor_1.withTestNotebook)([
                ['# header a', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['# header b', 'markdown', notebookCommon_1.CellKind.Markdown, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (editor) => {
                const viewModel = editor.viewModel;
                const foldingModel = new foldingModel_1.FoldingModel();
                foldingModel.attachViewModel(viewModel);
                const cellList = (0, testNotebookEditor_1.createNotebookCellList)(instantiationService);
                cellList.attachViewModel(viewModel);
                const listViewInfoAccessor = new notebookEditorWidget_1.ListViewInfoAccessor(cellList);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(0)), 0);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(1)), 1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(2)), 2);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(3)), 3);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(4)), 4);
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(0, 1), { start: 0, end: 1 });
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(1, 2), { start: 1, end: 2 });
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 0, true);
                (0, foldingModel_1.updateFoldingStateAtIndex)(foldingModel, 2, true);
                viewModel.updateFoldingRanges(foldingModel.regions);
                cellList.setHiddenAreas(viewModel.getHiddenRanges(), true);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(0)), 0);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(1)), -1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(2)), 1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(3)), -1);
                assert.strictEqual(listViewInfoAccessor.getViewIndex(viewModel.cellAt(4)), -1);
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(0, 1), { start: 0, end: 2 });
                assert.deepStrictEqual(listViewInfoAccessor.getCellRangeFromViewRange(1, 2), { start: 2, end: 5 });
                assert.deepStrictEqual(listViewInfoAccessor.getCellsFromViewRange(0, 1), viewModel.getCells({ start: 0, end: 2 }));
                assert.deepStrictEqual(listViewInfoAccessor.getCellsFromViewRange(1, 2), viewModel.getCells({ start: 2, end: 5 }));
                const notebookEditor = new class extends (0, mock_1.mock)() {
                    getViewIndex(cell) { return listViewInfoAccessor.getViewIndex(cell); }
                    getCellRangeFromViewRange(startIndex, endIndex) { return listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex); }
                };
                assert.deepStrictEqual((0, notebookBrowser_1.expandCellRangesWithHiddenCells)(notebookEditor, viewModel, [{ start: 0, end: 1 }]), [{ start: 0, end: 2 }]);
                assert.deepStrictEqual((0, notebookBrowser_1.expandCellRangesWithHiddenCells)(notebookEditor, viewModel, [{ start: 2, end: 3 }]), [{ start: 2, end: 5 }]);
                assert.deepStrictEqual((0, notebookBrowser_1.expandCellRangesWithHiddenCells)(notebookEditor, viewModel, [{ start: 0, end: 1 }, { start: 2, end: 3 }]), [{ start: 0, end: 5 }]);
            });
        });
    });
});
//# sourceMappingURL=notebookEditor.test.js.map