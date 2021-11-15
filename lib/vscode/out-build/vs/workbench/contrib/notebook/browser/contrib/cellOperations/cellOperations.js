/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/cellOperations/cellOperations", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/editor/common/core/range", "vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits"], function (require, exports, keyCodes_1, nls_1, actions_1, contextkey_1, contextkeys_1, range_1, coreActions_1, notebookBrowser_1, icons, notebookCommon_1, notebookRange_1, notebookCellTextModel_1, bulkEditService_1, bulkCellEdits_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.joinCellsWithSurrounds = exports.joinNotebookCells = exports.splitCell = exports.copyCellRange = exports.moveCellRange = void 0;
    const MOVE_CELL_UP_COMMAND_ID = 'notebook.cell.moveUp';
    const MOVE_CELL_DOWN_COMMAND_ID = 'notebook.cell.moveDown';
    const COPY_CELL_UP_COMMAND_ID = 'notebook.cell.copyUp';
    const COPY_CELL_DOWN_COMMAND_ID = 'notebook.cell.copyDown';
    const SPLIT_CELL_COMMAND_ID = 'notebook.cell.split';
    const JOIN_CELL_ABOVE_COMMAND_ID = 'notebook.cell.joinAbove';
    const JOIN_CELL_BELOW_COMMAND_ID = 'notebook.cell.joinBelow';
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: MOVE_CELL_UP_COMMAND_ID,
                title: (0, nls_1.localize)(0, null),
                icon: icons.moveUpIcon,
                keybinding: {
                    primary: 512 /* Alt */ | 16 /* UpArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            return moveCellRange(context, 'up');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: MOVE_CELL_DOWN_COMMAND_ID,
                title: (0, nls_1.localize)(1, null),
                icon: icons.moveDownIcon,
                keybinding: {
                    primary: 512 /* Alt */ | 18 /* DownArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            return moveCellRange(context, 'down');
        }
    });
    async function moveCellRange(context, direction) {
        var _a, _b;
        const viewModel = context.notebookEditor.viewModel;
        if (!viewModel) {
            return;
        }
        if (viewModel.options.isReadOnly) {
            return;
        }
        const selections = context.notebookEditor.getSelections();
        const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(context.notebookEditor, context.notebookEditor.viewModel, selections);
        const range = modelRanges[0];
        if (!range || range.start === range.end) {
            return;
        }
        if (direction === 'up') {
            if (range.start === 0) {
                return;
            }
            const indexAbove = range.start - 1;
            const finalSelection = { start: range.start - 1, end: range.end - 1 };
            const focus = context.notebookEditor.getFocus();
            const newFocus = (0, notebookRange_1.cellRangeContains)(range, focus) ? { start: focus.start - 1, end: focus.end - 1 } : { start: range.start - 1, end: range.start };
            viewModel.notebookDocument.applyEdits([
                {
                    editType: 6 /* Move */,
                    index: indexAbove,
                    length: 1,
                    newIdx: range.end - 1
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: viewModel.getFocus(),
                selections: viewModel.getSelections()
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: [finalSelection] }), undefined);
            const focusRange = (_a = viewModel.getSelections()[0]) !== null && _a !== void 0 ? _a : viewModel.getFocus();
            context.notebookEditor.revealCellRangeInView(focusRange);
        }
        else {
            if (range.end >= viewModel.length) {
                return;
            }
            const indexBelow = range.end;
            const finalSelection = { start: range.start + 1, end: range.end + 1 };
            const focus = context.notebookEditor.getFocus();
            const newFocus = (0, notebookRange_1.cellRangeContains)(range, focus) ? { start: focus.start + 1, end: focus.end + 1 } : { start: range.start + 1, end: range.start + 2 };
            viewModel.notebookDocument.applyEdits([
                {
                    editType: 6 /* Move */,
                    index: indexBelow,
                    length: 1,
                    newIdx: range.start
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: viewModel.getFocus(),
                selections: viewModel.getSelections()
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: [finalSelection] }), undefined);
            const focusRange = (_b = viewModel.getSelections()[0]) !== null && _b !== void 0 ? _b : viewModel.getFocus();
            context.notebookEditor.revealCellRangeInView(focusRange);
        }
    }
    exports.moveCellRange = moveCellRange;
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: COPY_CELL_UP_COMMAND_ID,
                title: (0, nls_1.localize)(2, null),
                keybinding: {
                    primary: 512 /* Alt */ | 1024 /* Shift */ | 16 /* UpArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            return copyCellRange(context, 'up');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: COPY_CELL_DOWN_COMMAND_ID,
                title: (0, nls_1.localize)(3, null),
                keybinding: {
                    primary: 512 /* Alt */ | 1024 /* Shift */ | 18 /* DownArrow */,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    group: "3_edit" /* Edit */,
                    order: 12
                }
            });
        }
        async runWithContext(accessor, context) {
            return copyCellRange(context, 'down');
        }
    });
    async function copyCellRange(context, direction) {
        var _a;
        const viewModel = context.notebookEditor.viewModel;
        if (!viewModel) {
            return;
        }
        if (viewModel.options.isReadOnly) {
            return;
        }
        let range = undefined;
        if (context.ui) {
            let targetCell = context.cell;
            const targetCellIndex = viewModel.getCellIndex(targetCell);
            range = { start: targetCellIndex, end: targetCellIndex + 1 };
        }
        else {
            const selections = context.notebookEditor.getSelections();
            const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(context.notebookEditor, context.notebookEditor.viewModel, selections);
            range = modelRanges[0];
        }
        if (!range || range.start === range.end) {
            return;
        }
        if (direction === 'up') {
            // insert up, without changing focus and selections
            const focus = viewModel.getFocus();
            const selections = viewModel.getSelections();
            viewModel.notebookDocument.applyEdits([
                {
                    editType: 1 /* Replace */,
                    index: range.end,
                    count: 0,
                    cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(viewModel.cellAt(index).model))
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: focus, selections: selections }), undefined);
        }
        else {
            // insert down, move selections
            const focus = viewModel.getFocus();
            const selections = viewModel.getSelections();
            const newCells = (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(viewModel.cellAt(index).model));
            const countDelta = newCells.length;
            const newFocus = context.ui ? focus : { start: focus.start + countDelta, end: focus.end + countDelta };
            const newSelections = context.ui ? selections : [{ start: range.start + countDelta, end: range.end + countDelta }];
            viewModel.notebookDocument.applyEdits([
                {
                    editType: 1 /* Replace */,
                    index: range.end,
                    count: 0,
                    cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(viewModel.cellAt(index).model))
                }
            ], true, {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: newSelections }), undefined);
            const focusRange = (_a = viewModel.getSelections()[0]) !== null && _a !== void 0 ? _a : viewModel.getFocus();
            context.notebookEditor.revealCellRangeInView(focusRange);
        }
    }
    exports.copyCellRange = copyCellRange;
    async function splitCell(context) {
        const newCells = await context.notebookEditor.splitNotebookCell(context.cell);
        if (newCells) {
            context.notebookEditor.focusNotebookCell(newCells[newCells.length - 1], 'editor');
        }
    }
    exports.splitCell = splitCell;
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: SPLIT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(4, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    order: 1 /* SplitCell */,
                    group: coreActions_1.CELL_TITLE_CELL_GROUP_ID
                },
                icon: icons.splitCellIcon,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 88 /* US_BACKSLASH */),
                    weight: 200 /* WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            return splitCell(context);
        }
    });
    async function joinNotebookCells(viewModel, range, direction, constraint) {
        if (!viewModel || viewModel.options.isReadOnly) {
            return null;
        }
        const cells = viewModel.getCells(range);
        if (!cells.length) {
            return null;
        }
        if (range.start === 0 && direction === 'above') {
            return null;
        }
        if (range.end === viewModel.length && direction === 'below') {
            return null;
        }
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (constraint && cell.cellKind !== constraint) {
                return null;
            }
        }
        if (direction === 'above') {
            const above = viewModel.cellAt(range.start - 1);
            if (constraint && above.cellKind !== constraint) {
                return null;
            }
            const insertContent = cells.map(cell => { var _a; return ((_a = cell.textBuffer.getEOL()) !== null && _a !== void 0 ? _a : '') + cell.getText(); }).join('');
            const aboveCellLineCount = above.textBuffer.getLineCount();
            const aboveCellLastLineEndColumn = above.textBuffer.getLineLength(aboveCellLineCount);
            return {
                edits: [
                    new bulkEditService_1.ResourceTextEdit(above.uri, { range: new range_1.Range(aboveCellLineCount, aboveCellLastLineEndColumn + 1, aboveCellLineCount, aboveCellLastLineEndColumn + 1), text: insertContent }),
                    new bulkCellEdits_1.ResourceNotebookCellEdit(viewModel.notebookDocument.uri, {
                        editType: 1 /* Replace */,
                        index: range.start,
                        count: range.end - range.start,
                        cells: []
                    })
                ],
                cell: above,
                endFocus: { start: range.start - 1, end: range.start },
                endSelections: [{ start: range.start - 1, end: range.start }]
            };
        }
        else {
            const below = viewModel.cellAt(range.end);
            if (constraint && below.cellKind !== constraint) {
                return null;
            }
            const cell = cells[0];
            const restCells = [...cells.slice(1), below];
            const insertContent = restCells.map(cl => { var _a; return ((_a = cl.textBuffer.getEOL()) !== null && _a !== void 0 ? _a : '') + cl.getText(); }).join('');
            const cellLineCount = cell.textBuffer.getLineCount();
            const cellLastLineEndColumn = cell.textBuffer.getLineLength(cellLineCount);
            return {
                edits: [
                    new bulkEditService_1.ResourceTextEdit(cell.uri, { range: new range_1.Range(cellLineCount, cellLastLineEndColumn + 1, cellLineCount, cellLastLineEndColumn + 1), text: insertContent }),
                    new bulkCellEdits_1.ResourceNotebookCellEdit(viewModel.notebookDocument.uri, {
                        editType: 1 /* Replace */,
                        index: range.start + 1,
                        count: range.end - range.start,
                        cells: []
                    })
                ],
                cell,
                endFocus: { start: range.start, end: range.start + 1 },
                endSelections: [{ start: range.start, end: range.start + 1 }]
            };
        }
    }
    exports.joinNotebookCells = joinNotebookCells;
    async function joinCellsWithSurrounds(bulkEditService, context, direction) {
        const viewModel = context.notebookEditor.viewModel;
        let ret = null;
        if (context.ui) {
            const cellIndex = viewModel.getCellIndex(context.cell);
            ret = await joinNotebookCells(viewModel, { start: cellIndex, end: cellIndex + 1 }, direction);
            if (!ret) {
                return;
            }
            await bulkEditService.apply(ret === null || ret === void 0 ? void 0 : ret.edits, { quotableLabel: 'Join Notebook Cells' });
            viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: ret.endFocus, selections: ret.endSelections });
            ret.cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'joinCellsWithSurrounds');
            context.notebookEditor.revealCellRangeInView(viewModel.getFocus());
        }
        else {
            const selections = viewModel.getSelections();
            if (!selections.length) {
                return;
            }
            const focus = viewModel.getFocus();
            let edits = [];
            let cell = null;
            let cells = [];
            for (let i = selections.length - 1; i >= 0; i--) {
                const selection = selections[i];
                const containFocus = (0, notebookRange_1.cellRangeContains)(selection, focus);
                if (selection.end >= viewModel.length && direction === 'below'
                    || selection.start === 0 && direction === 'above') {
                    if (containFocus) {
                        cell = viewModel.cellAt(focus.start);
                    }
                    cells.push(...viewModel.getCells(selection));
                    continue;
                }
                const singleRet = await joinNotebookCells(viewModel, selection, direction);
                if (!singleRet) {
                    return;
                }
                edits.push(...singleRet.edits);
                cells.push(singleRet.cell);
                if (containFocus) {
                    cell = singleRet.cell;
                }
            }
            if (!edits.length) {
                return;
            }
            if (!cell || !cells.length) {
                return;
            }
            await bulkEditService.apply(edits, { quotableLabel: 'Join Notebook Cells' });
            cells.forEach(cell => {
                cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'joinCellsWithSurrounds');
            });
            viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Handle, primary: cell.handle, selections: cells.map(cell => cell.handle) });
            context.notebookEditor.revealCellRangeInView(viewModel.getFocus());
        }
    }
    exports.joinCellsWithSurrounds = joinCellsWithSurrounds;
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: JOIN_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)(5, null),
                keybinding: {
                    when: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED,
                    primary: 256 /* WinCtrl */ | 512 /* Alt */ | 1024 /* Shift */ | 40 /* KEY_J */,
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE),
                    group: "3_edit" /* Edit */,
                    order: 10
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            return joinCellsWithSurrounds(bulkEditService, context, 'above');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: JOIN_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)(6, null),
                keybinding: {
                    when: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED,
                    primary: 256 /* WinCtrl */ | 512 /* Alt */ | 40 /* KEY_J */,
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE),
                    group: "3_edit" /* Edit */,
                    order: 11
                }
            });
        }
        async runWithContext(accessor, context) {
            const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
            return joinCellsWithSurrounds(bulkEditService, context, 'below');
        }
    });
});
//# sourceMappingURL=cellOperations.js.map