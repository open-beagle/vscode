/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/common/editor"], function (require, exports, event_1, contextkey_1, notebookRange_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getRanges = exports.expandCellRangesWithHiddenCells = exports.getEditorTopPadding = exports.updateEditorTopPadding = exports.EditorTopPaddingChangeEvent = exports.getNotebookEditorFromEditorPane = exports.getVisibleCells = exports.reduceCellRanges = exports.cellRangesEqual = exports.CursorAtBoundary = exports.CellFocusMode = exports.CellEditState = exports.CellRevealPosition = exports.CellRevealType = exports.isCodeCellRenderTemplate = exports.NotebookEditorOptions = exports.CodeCellLayoutState = exports.RenderOutputType = exports.QUIT_EDIT_CELL_COMMAND_ID = exports.CHANGE_CELL_LANGUAGE = exports.EXECUTE_CELL_COMMAND_ID = exports.EXPAND_CELL_INPUT_COMMAND_ID = exports.NOTEBOOK_INTERRUPTIBLE_KERNEL = exports.NOTEBOOK_KERNEL_COUNT = exports.NOTEBOOK_CELL_OUTPUT_COLLAPSED = exports.NOTEBOOK_CELL_INPUT_COLLAPSED = exports.NOTEBOOK_CELL_HAS_OUTPUTS = exports.NOTEBOOK_CELL_EXECUTION_STATE = exports.NOTEBOOK_CELL_LINE_NUMBERS = exports.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE = exports.NOTEBOOK_CELL_EDITOR_FOCUSED = exports.NOTEBOOK_CELL_FOCUSED = exports.NOTEBOOK_CELL_EDITABLE = exports.NOTEBOOK_CELL_TYPE = exports.NOTEBOOK_VIEW_TYPE = exports.NOTEBOOK_HAS_RUNNING_CELL = exports.NOTEBOOK_EDITOR_EDITABLE = exports.NOTEBOOK_OUTPUT_FOCUSED = exports.NOTEBOOK_CELL_LIST_FOCUSED = exports.NOTEBOOK_EDITOR_FOCUSED = exports.NOTEBOOK_DIFF_IS_ACTIVE_EDITOR = exports.NOTEBOOK_IS_ACTIVE_EDITOR = exports.KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED = exports.NOTEBOOK_DIFF_EDITOR_ID = exports.NOTEBOOK_EDITOR_ID = void 0;
    exports.NOTEBOOK_EDITOR_ID = 'workbench.editor.notebook';
    exports.NOTEBOOK_DIFF_EDITOR_ID = 'workbench.editor.notebookTextDiffEditor';
    //#region Context Keys
    exports.KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED = new contextkey_1.RawContextKey('notebookFindWidgetFocused', false);
    // Is Notebook
    exports.NOTEBOOK_IS_ACTIVE_EDITOR = contextkey_1.ContextKeyExpr.equals('activeEditor', exports.NOTEBOOK_EDITOR_ID);
    exports.NOTEBOOK_DIFF_IS_ACTIVE_EDITOR = contextkey_1.ContextKeyExpr.equals('activeEditor', exports.NOTEBOOK_DIFF_EDITOR_ID);
    // Editor keys
    exports.NOTEBOOK_EDITOR_FOCUSED = new contextkey_1.RawContextKey('notebookEditorFocused', false);
    exports.NOTEBOOK_CELL_LIST_FOCUSED = new contextkey_1.RawContextKey('notebookCellListFocused', false);
    exports.NOTEBOOK_OUTPUT_FOCUSED = new contextkey_1.RawContextKey('notebookOutputFocused', false);
    exports.NOTEBOOK_EDITOR_EDITABLE = new contextkey_1.RawContextKey('notebookEditable', true);
    exports.NOTEBOOK_HAS_RUNNING_CELL = new contextkey_1.RawContextKey('notebookHasRunningCell', false);
    // Cell keys
    exports.NOTEBOOK_VIEW_TYPE = new contextkey_1.RawContextKey('notebookViewType', undefined);
    exports.NOTEBOOK_CELL_TYPE = new contextkey_1.RawContextKey('notebookCellType', undefined); // code, markdown
    exports.NOTEBOOK_CELL_EDITABLE = new contextkey_1.RawContextKey('notebookCellEditable', false); // bool
    exports.NOTEBOOK_CELL_FOCUSED = new contextkey_1.RawContextKey('notebookCellFocused', false); // bool
    exports.NOTEBOOK_CELL_EDITOR_FOCUSED = new contextkey_1.RawContextKey('notebookCellEditorFocused', false); // bool
    exports.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE = new contextkey_1.RawContextKey('notebookCellMarkdownEditMode', false); // bool
    exports.NOTEBOOK_CELL_LINE_NUMBERS = new contextkey_1.RawContextKey('notebookCellLineNumbers', 'inherit'); // off, none, inherit
    exports.NOTEBOOK_CELL_EXECUTION_STATE = new contextkey_1.RawContextKey('notebookCellExecutionState', undefined);
    exports.NOTEBOOK_CELL_HAS_OUTPUTS = new contextkey_1.RawContextKey('notebookCellHasOutputs', false); // bool
    exports.NOTEBOOK_CELL_INPUT_COLLAPSED = new contextkey_1.RawContextKey('notebookCellInputIsCollapsed', false); // bool
    exports.NOTEBOOK_CELL_OUTPUT_COLLAPSED = new contextkey_1.RawContextKey('notebookCellOutputIsCollapsed', false); // bool
    // Kernels
    exports.NOTEBOOK_KERNEL_COUNT = new contextkey_1.RawContextKey('notebookKernelCount', 0);
    exports.NOTEBOOK_INTERRUPTIBLE_KERNEL = new contextkey_1.RawContextKey('notebookInterruptibleKernel', false);
    //#endregion
    //#region Shared commands
    exports.EXPAND_CELL_INPUT_COMMAND_ID = 'notebook.cell.expandCellInput';
    exports.EXECUTE_CELL_COMMAND_ID = 'notebook.cell.execute';
    exports.CHANGE_CELL_LANGUAGE = 'notebook.cell.changeLanguage';
    exports.QUIT_EDIT_CELL_COMMAND_ID = 'notebook.cell.quitEdit';
    //#endregion
    //#region  Output related types
    var RenderOutputType;
    (function (RenderOutputType) {
        RenderOutputType[RenderOutputType["Mainframe"] = 0] = "Mainframe";
        RenderOutputType[RenderOutputType["Html"] = 1] = "Html";
        RenderOutputType[RenderOutputType["Extension"] = 2] = "Extension";
    })(RenderOutputType = exports.RenderOutputType || (exports.RenderOutputType = {}));
    var CodeCellLayoutState;
    (function (CodeCellLayoutState) {
        CodeCellLayoutState[CodeCellLayoutState["Uninitialized"] = 0] = "Uninitialized";
        CodeCellLayoutState[CodeCellLayoutState["Estimated"] = 1] = "Estimated";
        CodeCellLayoutState[CodeCellLayoutState["FromCache"] = 2] = "FromCache";
        CodeCellLayoutState[CodeCellLayoutState["Measured"] = 3] = "Measured";
    })(CodeCellLayoutState = exports.CodeCellLayoutState || (exports.CodeCellLayoutState = {}));
    class NotebookEditorOptions extends editor_1.EditorOptions {
        constructor(options) {
            super();
            this.overwrite(options);
            this.cellOptions = options.cellOptions;
            this.cellSelections = options.cellSelections;
            this.isReadOnly = options.isReadOnly;
        }
        with(options) {
            return new NotebookEditorOptions(Object.assign(Object.assign({}, this), options));
        }
    }
    exports.NotebookEditorOptions = NotebookEditorOptions;
    function isCodeCellRenderTemplate(templateData) {
        return !!templateData.runToolbar;
    }
    exports.isCodeCellRenderTemplate = isCodeCellRenderTemplate;
    var CellRevealType;
    (function (CellRevealType) {
        CellRevealType[CellRevealType["Line"] = 0] = "Line";
        CellRevealType[CellRevealType["Range"] = 1] = "Range";
    })(CellRevealType = exports.CellRevealType || (exports.CellRevealType = {}));
    var CellRevealPosition;
    (function (CellRevealPosition) {
        CellRevealPosition[CellRevealPosition["Top"] = 0] = "Top";
        CellRevealPosition[CellRevealPosition["Center"] = 1] = "Center";
        CellRevealPosition[CellRevealPosition["Bottom"] = 2] = "Bottom";
    })(CellRevealPosition = exports.CellRevealPosition || (exports.CellRevealPosition = {}));
    var CellEditState;
    (function (CellEditState) {
        /**
         * Default state.
         * For markdown cell, it's Markdown preview.
         * For code cell, the browser focus should be on the container instead of the editor
         */
        CellEditState[CellEditState["Preview"] = 0] = "Preview";
        /**
         * Eding mode. Source for markdown or code is rendered in editors and the state will be persistent.
         */
        CellEditState[CellEditState["Editing"] = 1] = "Editing";
    })(CellEditState = exports.CellEditState || (exports.CellEditState = {}));
    var CellFocusMode;
    (function (CellFocusMode) {
        CellFocusMode[CellFocusMode["Container"] = 0] = "Container";
        CellFocusMode[CellFocusMode["Editor"] = 1] = "Editor";
    })(CellFocusMode = exports.CellFocusMode || (exports.CellFocusMode = {}));
    var CursorAtBoundary;
    (function (CursorAtBoundary) {
        CursorAtBoundary[CursorAtBoundary["None"] = 0] = "None";
        CursorAtBoundary[CursorAtBoundary["Top"] = 1] = "Top";
        CursorAtBoundary[CursorAtBoundary["Bottom"] = 2] = "Bottom";
        CursorAtBoundary[CursorAtBoundary["Both"] = 3] = "Both";
    })(CursorAtBoundary = exports.CursorAtBoundary || (exports.CursorAtBoundary = {}));
    function cellRangesEqual(a, b) {
        a = reduceCellRanges(a);
        b = reduceCellRanges(b);
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
                return false;
            }
        }
        return true;
    }
    exports.cellRangesEqual = cellRangesEqual;
    /**
     * @param _ranges
     */
    function reduceCellRanges(_ranges) {
        if (!_ranges.length) {
            return [];
        }
        const ranges = _ranges.sort((a, b) => a.start - b.start);
        const result = [];
        let currentRangeStart = ranges[0].start;
        let currentRangeEnd = ranges[0].end + 1;
        for (let i = 0, len = ranges.length; i < len; i++) {
            const range = ranges[i];
            if (range.start > currentRangeEnd) {
                result.push({ start: currentRangeStart, end: currentRangeEnd - 1 });
                currentRangeStart = range.start;
                currentRangeEnd = range.end + 1;
            }
            else if (range.end + 1 > currentRangeEnd) {
                currentRangeEnd = range.end + 1;
            }
        }
        result.push({ start: currentRangeStart, end: currentRangeEnd - 1 });
        return result;
    }
    exports.reduceCellRanges = reduceCellRanges;
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
    exports.getVisibleCells = getVisibleCells;
    function getNotebookEditorFromEditorPane(editorPane) {
        return (editorPane === null || editorPane === void 0 ? void 0 : editorPane.getId()) === exports.NOTEBOOK_EDITOR_ID ? editorPane.getControl() : undefined;
    }
    exports.getNotebookEditorFromEditorPane = getNotebookEditorFromEditorPane;
    let EDITOR_TOP_PADDING = 12;
    const editorTopPaddingChangeEmitter = new event_1.Emitter();
    exports.EditorTopPaddingChangeEvent = editorTopPaddingChangeEmitter.event;
    function updateEditorTopPadding(top) {
        EDITOR_TOP_PADDING = top;
        editorTopPaddingChangeEmitter.fire();
    }
    exports.updateEditorTopPadding = updateEditorTopPadding;
    function getEditorTopPadding() {
        return EDITOR_TOP_PADDING;
    }
    exports.getEditorTopPadding = getEditorTopPadding;
    /**
     * ranges: model selections
     * this will convert model selections to view indexes first, and then include the hidden ranges in the list view
     */
    function expandCellRangesWithHiddenCells(editor, viewModel, ranges) {
        // assuming ranges are sorted and no overlap
        const indexes = (0, notebookRange_1.cellRangesToIndexes)(ranges);
        let modelRanges = [];
        indexes.forEach(index => {
            const viewCell = viewModel.viewCells[index];
            if (!viewCell) {
                return;
            }
            const viewIndex = editor.getViewIndex(viewCell);
            if (viewIndex < 0) {
                return;
            }
            const nextViewIndex = viewIndex + 1;
            const range = editor.getCellRangeFromViewRange(viewIndex, nextViewIndex);
            if (range) {
                modelRanges.push(range);
            }
        });
        return (0, notebookRange_1.reduceRanges)(modelRanges);
    }
    exports.expandCellRangesWithHiddenCells = expandCellRangesWithHiddenCells;
    /**
     * Return a set of ranges for the cells matching the given predicate
     */
    function getRanges(cells, included) {
        const ranges = [];
        let currentRange;
        cells.forEach((cell, idx) => {
            if (included(cell)) {
                if (!currentRange) {
                    currentRange = { start: idx, end: idx + 1 };
                    ranges.push(currentRange);
                }
                else {
                    currentRange.end = idx + 1;
                }
            }
            else {
                currentRange = undefined;
            }
        });
        return ranges;
    }
    exports.getRanges = getRanges;
});
//# sourceMappingURL=notebookBrowser.js.map