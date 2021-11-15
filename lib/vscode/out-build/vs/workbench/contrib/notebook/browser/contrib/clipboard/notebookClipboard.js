/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/editor/contrib/clipboard/clipboard", "vs/platform/clipboard/common/clipboardService", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/editor/browser/editorExtensions"], function (require, exports, nls_1, lifecycle_1, platform_1, contributions_1, editorService_1, notebookBrowser_1, clipboard_1, clipboardService_1, notebookCellTextModel_1, notebookCommon_1, notebookService_1, platform, actions_1, coreActions_1, contextkey_1, contextkeys_1, editorExtensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookClipboardContribution = exports.runCutCells = exports.runCopyCells = exports.runPasteCells = void 0;
    function getFocusedWebviewDelegate(accessor) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!(editor === null || editor === void 0 ? void 0 : editor.hasFocus())) {
            return;
        }
        if (!(editor === null || editor === void 0 ? void 0 : editor.hasWebviewFocus())) {
            return;
        }
        const webview = editor === null || editor === void 0 ? void 0 : editor.getInnerWebview();
        return webview;
    }
    function withWebview(accessor, f) {
        const webview = getFocusedWebviewDelegate(accessor);
        if (webview) {
            f(webview);
            return true;
        }
        return false;
    }
    const PRIORITY = 105;
    editorExtensions_1.UndoCommand.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.undo());
    });
    editorExtensions_1.RedoCommand.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.redo());
    });
    clipboard_1.CopyAction === null || clipboard_1.CopyAction === void 0 ? void 0 : clipboard_1.CopyAction.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.copy());
    });
    clipboard_1.PasteAction === null || clipboard_1.PasteAction === void 0 ? void 0 : clipboard_1.PasteAction.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.paste());
    });
    clipboard_1.CutAction === null || clipboard_1.CutAction === void 0 ? void 0 : clipboard_1.CutAction.addImplementation(PRIORITY, 'notebook-webview', accessor => {
        return withWebview(accessor, webview => webview.cut());
    });
    function runPasteCells(editor, activeCell, pasteCells) {
        const viewModel = editor.viewModel;
        if (!viewModel || viewModel.options.isReadOnly) {
            return false;
        }
        const originalState = {
            kind: notebookCommon_1.SelectionStateType.Index,
            focus: viewModel.getFocus(),
            selections: viewModel.getSelections()
        };
        if (activeCell) {
            const currCellIndex = viewModel.getCellIndex(activeCell);
            const newFocusIndex = typeof currCellIndex === 'number' ? currCellIndex + 1 : 0;
            viewModel.notebookDocument.applyEdits([
                {
                    editType: 1 /* Replace */,
                    index: newFocusIndex,
                    count: 0,
                    cells: pasteCells.items.map(cell => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(cell))
                }
            ], true, originalState, () => ({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: { start: newFocusIndex, end: newFocusIndex + 1 },
                selections: [{ start: newFocusIndex, end: newFocusIndex + pasteCells.items.length }]
            }), undefined);
        }
        else {
            if (viewModel.length !== 0) {
                return false;
            }
            viewModel.notebookDocument.applyEdits([
                {
                    editType: 1 /* Replace */,
                    index: 0,
                    count: 0,
                    cells: pasteCells.items.map(cell => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(cell))
                }
            ], true, originalState, () => ({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: { start: 0, end: 1 },
                selections: [{ start: 1, end: pasteCells.items.length + 1 }]
            }), undefined);
        }
        return true;
    }
    exports.runPasteCells = runPasteCells;
    function cellRangeToViewCells(viewModel, ranges) {
        const cells = [];
        ranges.forEach(range => {
            cells.push(...viewModel.getCells(range));
        });
        return cells;
    }
    function runCopyCells(accessor, editor, targetCell) {
        if (!editor.hasModel()) {
            return false;
        }
        if (editor.hasOutputTextSelection()) {
            document.execCommand('copy');
            return true;
        }
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const notebookService = accessor.get(notebookService_1.INotebookService);
        const viewModel = editor.viewModel;
        const selections = viewModel.getSelections();
        if (targetCell) {
            const targetCellIndex = viewModel.getCellIndex(targetCell);
            const containingSelection = selections.find(selection => selection.start <= targetCellIndex && targetCellIndex < selection.end);
            if (!containingSelection) {
                clipboardService.writeText(targetCell.getText());
                notebookService.setToCopy([targetCell.model], true);
                return true;
            }
        }
        const selectionRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(editor, editor.viewModel, editor.viewModel.getSelections());
        const selectedCells = cellRangeToViewCells(editor.viewModel, selectionRanges);
        if (!selectedCells.length) {
            return false;
        }
        clipboardService.writeText(selectedCells.map(cell => cell.getText()).join('\n'));
        notebookService.setToCopy(selectedCells.map(cell => cell.model), true);
        return true;
    }
    exports.runCopyCells = runCopyCells;
    function runCutCells(accessor, editor, targetCell) {
        const viewModel = editor.viewModel;
        if (!viewModel || viewModel.options.isReadOnly) {
            return false;
        }
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const notebookService = accessor.get(notebookService_1.INotebookService);
        const selections = viewModel.getSelections();
        if (targetCell) {
            // from ui
            const targetCellIndex = viewModel.getCellIndex(targetCell);
            const containingSelection = selections.find(selection => selection.start <= targetCellIndex && targetCellIndex < selection.end);
            if (!containingSelection) {
                clipboardService.writeText(targetCell.getText());
                // delete cell
                const focus = viewModel.getFocus();
                const newFocus = focus.end <= targetCellIndex ? focus : { start: focus.start - 1, end: focus.end - 1 };
                const newSelections = selections.map(selection => (selection.end <= targetCellIndex ? selection : { start: selection.start - 1, end: selection.end - 1 }));
                viewModel.notebookDocument.applyEdits([
                    { editType: 1 /* Replace */, index: targetCellIndex, count: 1, cells: [] }
                ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: selections }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: newSelections }), undefined, true);
                notebookService.setToCopy([targetCell.model], false);
                return true;
            }
        }
        const focus = viewModel.getFocus();
        const containingSelection = selections.find(selection => selection.start <= focus.start && focus.end <= selection.end);
        if (!containingSelection) {
            // focus is out of any selection, we should only cut this cell
            const targetCell = viewModel.cellAt(focus.start);
            clipboardService.writeText(targetCell.getText());
            const newFocus = focus.end === viewModel.length ? { start: focus.start - 1, end: focus.end - 1 } : focus;
            const newSelections = selections.map(selection => (selection.end <= focus.start ? selection : { start: selection.start - 1, end: selection.end - 1 }));
            viewModel.notebookDocument.applyEdits([
                { editType: 1 /* Replace */, index: focus.start, count: 1, cells: [] }
            ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: selections }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: newSelections }), undefined, true);
            notebookService.setToCopy([targetCell.model], false);
            return true;
        }
        const selectionRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(editor, viewModel, viewModel.getSelections());
        const selectedCells = cellRangeToViewCells(viewModel, selectionRanges);
        if (!selectedCells.length) {
            return false;
        }
        clipboardService.writeText(selectedCells.map(cell => cell.getText()).join('\n'));
        const edits = selectionRanges.map(range => ({ editType: 1 /* Replace */, index: range.start, count: range.end - range.start, cells: [] }));
        const firstSelectIndex = selectionRanges[0].start;
        /**
         * If we have cells, 0, 1, 2, 3, 4, 5, 6
         * and cells 1, 2 are selected, and then we delete cells 1 and 2
         * the new focused cell should still be at index 1
         */
        const newFocusedCellIndex = firstSelectIndex < viewModel.notebookDocument.cells.length - 1
            ? firstSelectIndex
            : Math.max(viewModel.notebookDocument.cells.length - 2, 0);
        viewModel.notebookDocument.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: selectionRanges }, () => {
            return {
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: { start: newFocusedCellIndex, end: newFocusedCellIndex + 1 },
                selections: [{ start: newFocusedCellIndex, end: newFocusedCellIndex + 1 }]
            };
        }, undefined, true);
        notebookService.setToCopy(selectedCells.map(cell => cell.model), false);
        return true;
    }
    exports.runCutCells = runCutCells;
    let NotebookClipboardContribution = class NotebookClipboardContribution extends lifecycle_1.Disposable {
        constructor(_editorService) {
            super();
            this._editorService = _editorService;
            const PRIORITY = 105;
            if (clipboard_1.CopyAction) {
                this._register(clipboard_1.CopyAction.addImplementation(PRIORITY, 'notebook-clipboard', accessor => {
                    return this.runCopyAction(accessor);
                }));
            }
            if (clipboard_1.PasteAction) {
                clipboard_1.PasteAction.addImplementation(PRIORITY, 'notebook-clipboard', accessor => {
                    return this.runPasteAction(accessor);
                });
            }
            if (clipboard_1.CutAction) {
                clipboard_1.CutAction.addImplementation(PRIORITY, 'notebook-clipboard', accessor => {
                    return this.runCutAction(accessor);
                });
            }
        }
        _getContext() {
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
            const activeCell = editor === null || editor === void 0 ? void 0 : editor.getActiveCell();
            return {
                editor,
                activeCell
            };
        }
        runCopyAction(accessor) {
            const activeElement = document.activeElement;
            if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                return false;
            }
            const { editor } = this._getContext();
            if (!editor) {
                return false;
            }
            return runCopyCells(accessor, editor, undefined);
        }
        runPasteAction(accessor) {
            const activeElement = document.activeElement;
            if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                return false;
            }
            const notebookService = accessor.get(notebookService_1.INotebookService);
            const pasteCells = notebookService.getToCopy();
            if (!pasteCells) {
                return false;
            }
            const { editor, activeCell } = this._getContext();
            if (!editor) {
                return false;
            }
            return runPasteCells(editor, activeCell, pasteCells);
        }
        runCutAction(accessor) {
            const activeElement = document.activeElement;
            if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                return false;
            }
            const { editor } = this._getContext();
            if (!editor) {
                return false;
            }
            return runCutCells(accessor, editor, undefined);
        }
    };
    NotebookClipboardContribution = __decorate([
        __param(0, editorService_1.IEditorService)
    ], NotebookClipboardContribution);
    exports.NotebookClipboardContribution = NotebookClipboardContribution;
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookClipboardContribution, 2 /* Ready */);
    const COPY_CELL_COMMAND_ID = 'notebook.cell.copy';
    const CUT_CELL_COMMAND_ID = 'notebook.cell.cut';
    const PASTE_CELL_COMMAND_ID = 'notebook.cell.paste';
    const PASTE_CELL_ABOVE_COMMAND_ID = 'notebook.cell.pasteAbove';
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: COPY_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(0, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED,
                    group: "1_copy" /* Copy */,
                },
                keybinding: platform.isNative ? undefined : {
                    primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
                    win: { primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */, secondary: [2048 /* CtrlCmd */ | 19 /* Insert */] },
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    weight: 200 /* WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            runCopyCells(accessor, context.notebookEditor, context.cell);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: CUT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(1, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    group: "1_copy" /* Copy */,
                },
                keybinding: platform.isNative ? undefined : {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* CtrlCmd */ | 54 /* KEY_X */,
                    win: { primary: 2048 /* CtrlCmd */ | 54 /* KEY_X */, secondary: [1024 /* Shift */ | 20 /* Delete */] },
                    weight: 200 /* WorkbenchContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            runCutCells(accessor, context.notebookEditor, context.cell);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: PASTE_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(2, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE),
                    group: "1_copy" /* Copy */,
                },
                keybinding: platform.isNative ? undefined : {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */,
                    win: { primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
                    linux: { primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
                    weight: 100 /* EditorContrib */
                }
            });
        }
        async runWithContext(accessor, context) {
            const notebookService = accessor.get(notebookService_1.INotebookService);
            const pasteCells = notebookService.getToCopy();
            const viewModel = context.notebookEditor.viewModel;
            if (!viewModel || viewModel.options.isReadOnly) {
                return;
            }
            if (!pasteCells) {
                return;
            }
            runPasteCells(context.notebookEditor, context.cell, pasteCells);
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: PASTE_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)(3, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 52 /* KEY_V */,
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const notebookService = accessor.get(notebookService_1.INotebookService);
            const pasteCells = notebookService.getToCopy();
            const viewModel = context.notebookEditor.viewModel;
            if (!viewModel || viewModel.options.isReadOnly) {
                return;
            }
            if (!pasteCells) {
                return;
            }
            const currCellIndex = viewModel.getCellIndex(context.cell);
            let topPastedCell = undefined;
            pasteCells.items.reverse().map(cell => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(cell)).forEach(pasteCell => {
                topPastedCell = viewModel.createCell(currCellIndex, pasteCell.source, pasteCell.language, pasteCell.cellKind, pasteCell.metadata, pasteCell.outputs, true);
                return;
            });
            if (topPastedCell) {
                context.notebookEditor.focusNotebookCell(topPastedCell, 'container');
            }
        }
    });
});
//# sourceMappingURL=notebookClipboard.js.map