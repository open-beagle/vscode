/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/model/textModelSearch", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, event_1, lifecycle_1, range_1, textModelSearch_1, constants_1, notebookBrowser_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseCellViewModel = void 0;
    class BaseCellViewModel extends lifecycle_1.Disposable {
        constructor(viewType, model, id, _configurationService, _modelService) {
            super();
            this.viewType = viewType;
            this.model = model;
            this.id = id;
            this._configurationService = _configurationService;
            this._modelService = _modelService;
            this._onDidChangeEditorAttachState = new event_1.Emitter();
            // Do not merge this event with `onDidChangeState` as we are using `Event.once(onDidChangeEditorAttachState)` elsewhere.
            this.onDidChangeEditorAttachState = this._onDidChangeEditorAttachState.event;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this._editState = notebookBrowser_1.CellEditState.Preview;
            // get editState(): CellEditState {
            // 	return this._editState;
            // }
            // set editState(newState: CellEditState) {
            // 	if (newState === this._editState) {
            // 		return;
            // 	}
            // 	this._editState = newState;
            // 	this._onDidChangeState.fire({ editStateChanged: true });
            // 	if (this._editState === CellEditState.Preview) {
            // 		this.focusMode = CellFocusMode.Container;
            // 	}
            // }
            this._lineNumbers = 'inherit';
            this._focusMode = notebookBrowser_1.CellFocusMode.Container;
            this._cursorChangeListener = null;
            this._editorViewStates = null;
            this._resolvedCellDecorations = new Map();
            this._cellDecorationsChanged = new event_1.Emitter();
            this.onCellDecorationsChanged = this._cellDecorationsChanged.event;
            this._resolvedDecorations = new Map();
            this._lastDecorationId = 0;
            this._cellStatusBarItems = new Map();
            this._onDidChangeCellStatusBarItems = new event_1.Emitter();
            this.onDidChangeCellStatusBarItems = this._onDidChangeCellStatusBarItems.event;
            this._lastStatusBarId = 0;
            this._dragging = false;
            this._editStateSource = '';
            this._register(model.onDidChangeMetadata(e => {
                this._onDidChangeState.fire({ metadataChanged: true, runStateChanged: e.runStateChanged });
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.ShowCellStatusBarKey)) {
                    this.layoutChange({});
                }
                if (e.affectsConfiguration('notebook.lineNumbers')) {
                    this.lineNumbers = 'inherit';
                }
            }));
        }
        get handle() {
            return this.model.handle;
        }
        get uri() {
            return this.model.uri;
        }
        get lineCount() {
            return this.model.textBuffer.getLineCount();
        }
        get metadata() {
            return this.model.metadata;
        }
        get language() {
            return this.model.language;
        }
        get lineNumbers() {
            return this._lineNumbers;
        }
        set lineNumbers(lineNumbers) {
            if (lineNumbers === this._lineNumbers) {
                return;
            }
            this._lineNumbers = lineNumbers;
            this._onDidChangeState.fire({ cellLineNumberChanged: true });
        }
        get focusMode() {
            return this._focusMode;
        }
        set focusMode(newMode) {
            this._focusMode = newMode;
            this._onDidChangeState.fire({ focusModeChanged: true });
        }
        get editorAttached() {
            return !!this._textEditor;
        }
        get textModel() {
            return this.model.textModel;
        }
        hasModel() {
            return !!this.textModel;
        }
        get dragging() {
            return this._dragging;
        }
        set dragging(v) {
            this._dragging = v;
        }
        getEditorStatusbarHeight() {
            const showCellStatusBar = this._configurationService.getValue(notebookCommon_1.ShowCellStatusBarKey);
            return showCellStatusBar ? constants_1.CELL_STATUSBAR_HEIGHT : 0;
        }
        assertTextModelAttached() {
            if (this.textModel && this._textEditor && this._textEditor.getModel() === this.textModel) {
                return true;
            }
            return false;
        }
        attachTextEditor(editor) {
            if (!editor.hasModel()) {
                throw new Error('Invalid editor: model is missing');
            }
            if (this._textEditor === editor) {
                if (this._cursorChangeListener === null) {
                    this._cursorChangeListener = this._textEditor.onDidChangeCursorSelection(() => { this._onDidChangeState.fire({ selectionChanged: true }); });
                    this._onDidChangeState.fire({ selectionChanged: true });
                }
                return;
            }
            this._textEditor = editor;
            if (this._editorViewStates) {
                this._restoreViewState(this._editorViewStates);
            }
            this._resolvedDecorations.forEach((value, key) => {
                if (key.startsWith('_lazy_')) {
                    // lazy ones
                    const ret = this._textEditor.deltaDecorations([], [value.options]);
                    this._resolvedDecorations.get(key).id = ret[0];
                }
                else {
                    const ret = this._textEditor.deltaDecorations([], [value.options]);
                    this._resolvedDecorations.get(key).id = ret[0];
                }
            });
            this._cursorChangeListener = this._textEditor.onDidChangeCursorSelection(() => { this._onDidChangeState.fire({ selectionChanged: true }); });
            this._onDidChangeState.fire({ selectionChanged: true });
            this._onDidChangeEditorAttachState.fire();
        }
        detachTextEditor() {
            var _a;
            this.saveViewState();
            // decorations need to be cleared first as editors can be resued.
            this._resolvedDecorations.forEach(value => {
                var _a;
                const resolvedid = value.id;
                if (resolvedid) {
                    (_a = this._textEditor) === null || _a === void 0 ? void 0 : _a.deltaDecorations([resolvedid], []);
                }
            });
            this._textEditor = undefined;
            (_a = this._cursorChangeListener) === null || _a === void 0 ? void 0 : _a.dispose();
            this._cursorChangeListener = null;
            this._onDidChangeEditorAttachState.fire();
            if (this._textModelRef) {
                this._textModelRef.dispose();
                this._textModelRef = undefined;
            }
        }
        getText() {
            return this.model.getValue();
        }
        getTextLength() {
            return this.model.getTextLength();
        }
        saveViewState() {
            if (!this._textEditor) {
                return;
            }
            this._editorViewStates = this._textEditor.saveViewState();
        }
        saveEditorViewState() {
            if (this._textEditor) {
                this._editorViewStates = this._textEditor.saveViewState();
            }
            return this._editorViewStates;
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            this._editorViewStates = editorViewStates;
        }
        _restoreViewState(state) {
            var _a;
            if (state) {
                (_a = this._textEditor) === null || _a === void 0 ? void 0 : _a.restoreViewState(state);
            }
        }
        addModelDecoration(decoration) {
            if (!this._textEditor) {
                const id = ++this._lastDecorationId;
                const decorationId = `_lazy_${this.id};${id}`;
                this._resolvedDecorations.set(decorationId, { options: decoration });
                return decorationId;
            }
            const result = this._textEditor.deltaDecorations([], [decoration]);
            this._resolvedDecorations.set(result[0], { id: result[0], options: decoration });
            return result[0];
        }
        removeModelDecoration(decorationId) {
            const realDecorationId = this._resolvedDecorations.get(decorationId);
            if (this._textEditor && realDecorationId && realDecorationId.id !== undefined) {
                this._textEditor.deltaDecorations([realDecorationId.id], []);
            }
            // lastly, remove all the cache
            this._resolvedDecorations.delete(decorationId);
        }
        deltaModelDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                this.removeModelDecoration(id);
            });
            const ret = newDecorations.map(option => {
                return this.addModelDecoration(option);
            });
            return ret;
        }
        _removeCellDecoration(decorationId) {
            const options = this._resolvedCellDecorations.get(decorationId);
            if (options) {
                this._cellDecorationsChanged.fire({ added: [], removed: [options] });
                this._resolvedCellDecorations.delete(decorationId);
            }
        }
        _addCellDecoration(options) {
            const id = ++this._lastDecorationId;
            const decorationId = `_cell_${this.id};${id}`;
            this._resolvedCellDecorations.set(decorationId, options);
            this._cellDecorationsChanged.fire({ added: [options], removed: [] });
            return decorationId;
        }
        getCellDecorations() {
            return [...this._resolvedCellDecorations.values()];
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            oldDecorations.forEach(id => {
                this._removeCellDecoration(id);
            });
            const ret = newDecorations.map(option => {
                return this._addCellDecoration(option);
            });
            return ret;
        }
        deltaCellStatusBarItems(oldItems, newItems) {
            oldItems.forEach(id => {
                const item = this._cellStatusBarItems.get(id);
                if (item) {
                    this._cellStatusBarItems.delete(id);
                }
            });
            const newIds = newItems.map(item => {
                const id = ++this._lastStatusBarId;
                const itemId = `_cell_${this.id};${id}`;
                this._cellStatusBarItems.set(itemId, item);
                return itemId;
            });
            this._onDidChangeCellStatusBarItems.fire();
            return newIds;
        }
        getCellStatusBarItems() {
            return Array.from(this._cellStatusBarItems.values());
        }
        revealRangeInCenter(range) {
            var _a;
            (_a = this._textEditor) === null || _a === void 0 ? void 0 : _a.revealRangeInCenter(range, 1 /* Immediate */);
        }
        setSelection(range) {
            var _a;
            (_a = this._textEditor) === null || _a === void 0 ? void 0 : _a.setSelection(range);
        }
        setSelections(selections) {
            var _a;
            if (selections.length) {
                (_a = this._textEditor) === null || _a === void 0 ? void 0 : _a.setSelections(selections);
            }
        }
        getSelections() {
            var _a;
            return ((_a = this._textEditor) === null || _a === void 0 ? void 0 : _a.getSelections()) || [];
        }
        getSelectionsStartPosition() {
            var _a;
            if (this._textEditor) {
                const selections = this._textEditor.getSelections();
                return selections === null || selections === void 0 ? void 0 : selections.map(s => s.getStartPosition());
            }
            else {
                const selections = (_a = this._editorViewStates) === null || _a === void 0 ? void 0 : _a.cursorState;
                return selections === null || selections === void 0 ? void 0 : selections.map(s => s.selectionStart);
            }
        }
        getLineScrollTopOffset(line) {
            if (!this._textEditor) {
                return 0;
            }
            return this._textEditor.getTopForLineNumber(line) + (0, notebookBrowser_1.getEditorTopPadding)();
        }
        getPositionScrollTopOffset(line, column) {
            if (!this._textEditor) {
                return 0;
            }
            return this._textEditor.getTopForPosition(line, column) + (0, notebookBrowser_1.getEditorTopPadding)();
        }
        cursorAtBoundary() {
            if (!this._textEditor) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            if (!this.textModel) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            // only validate primary cursor
            const selection = this._textEditor.getSelection();
            // only validate empty cursor
            if (!selection || !selection.isEmpty()) {
                return notebookBrowser_1.CursorAtBoundary.None;
            }
            const firstViewLineTop = this._textEditor.getTopForPosition(1, 1);
            const lastViewLineTop = this._textEditor.getTopForPosition(this.textModel.getLineCount(), this.textModel.getLineLength(this.textModel.getLineCount()));
            const selectionTop = this._textEditor.getTopForPosition(selection.startLineNumber, selection.startColumn);
            if (selectionTop === lastViewLineTop) {
                if (selectionTop === firstViewLineTop) {
                    return notebookBrowser_1.CursorAtBoundary.Both;
                }
                else {
                    return notebookBrowser_1.CursorAtBoundary.Bottom;
                }
            }
            else {
                if (selectionTop === firstViewLineTop) {
                    return notebookBrowser_1.CursorAtBoundary.Top;
                }
                else {
                    return notebookBrowser_1.CursorAtBoundary.None;
                }
            }
        }
        get editStateSource() {
            return this._editStateSource;
        }
        updateEditState(newState, source) {
            this._editStateSource = source;
            if (newState === this._editState) {
                return;
            }
            this._editState = newState;
            this._onDidChangeState.fire({ editStateChanged: true });
            if (this._editState === notebookBrowser_1.CellEditState.Preview) {
                this.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
        }
        getEditState() {
            return this._editState;
        }
        get textBuffer() {
            return this.model.textBuffer;
        }
        /**
         * Text model is used for editing.
         */
        async resolveTextModel() {
            if (!this._textModelRef || !this.textModel) {
                this._textModelRef = await this._modelService.createModelReference(this.uri);
                if (!this._textModelRef) {
                    throw new Error(`Cannot resolve text model for ${this.uri}`);
                }
                this._register(this.textModel.onDidChangeContent(() => this.onDidChangeTextModelContent()));
            }
            return this.textModel;
        }
        cellStartFind(value, options) {
            let cellMatches = [];
            if (this.assertTextModelAttached()) {
                cellMatches = this.textModel.findMatches(value, false, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null, false);
            }
            else {
                const lineCount = this.textBuffer.getLineCount();
                const fullRange = new range_1.Range(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
                const searchParams = new textModelSearch_1.SearchParams(value, options.regex || false, options.caseSensitive || false, options.wholeWord ? options.wordSeparators || null : null);
                const searchData = searchParams.parseSearchRequest();
                if (!searchData) {
                    return null;
                }
                cellMatches = this.textBuffer.findMatchesLineByLine(fullRange, searchData, false, 1000);
            }
            return cellMatches;
        }
        dispose() {
            super.dispose();
            if (this._textModelRef) {
                this._textModelRef.dispose();
            }
        }
        toJSON() {
            return {
                handle: this.handle
            };
        }
    }
    exports.BaseCellViewModel = BaseCellViewModel;
});
//# sourceMappingURL=baseCellViewModel.js.map