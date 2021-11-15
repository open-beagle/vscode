/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/markdownCellViewModel", "vs/base/common/lifecycle"], function (require, exports, notebookCommon_1, notebookBrowser_1, codeCellViewModel_1, markdownCellViewModel_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellContextKeyManager = void 0;
    class CellContextKeyManager extends lifecycle_1.Disposable {
        constructor(contextKeyService, notebookEditor, element) {
            super();
            this.contextKeyService = contextKeyService;
            this.notebookEditor = notebookEditor;
            this.element = element;
            this.elementDisposables = this._register(new lifecycle_1.DisposableStore());
            this.contextKeyService.bufferChangeEvents(() => {
                this.cellType = notebookBrowser_1.NOTEBOOK_CELL_TYPE.bindTo(this.contextKeyService);
                this.viewType = notebookBrowser_1.NOTEBOOK_VIEW_TYPE.bindTo(this.contextKeyService);
                this.cellEditable = notebookBrowser_1.NOTEBOOK_CELL_EDITABLE.bindTo(this.contextKeyService);
                this.cellFocused = notebookBrowser_1.NOTEBOOK_CELL_FOCUSED.bindTo(this.contextKeyService);
                this.cellEditorFocused = notebookBrowser_1.NOTEBOOK_CELL_EDITOR_FOCUSED.bindTo(this.contextKeyService);
                this.markdownEditMode = notebookBrowser_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.bindTo(this.contextKeyService);
                this.cellRunState = notebookBrowser_1.NOTEBOOK_CELL_EXECUTION_STATE.bindTo(this.contextKeyService);
                this.cellHasOutputs = notebookBrowser_1.NOTEBOOK_CELL_HAS_OUTPUTS.bindTo(this.contextKeyService);
                this.cellContentCollapsed = notebookBrowser_1.NOTEBOOK_CELL_INPUT_COLLAPSED.bindTo(this.contextKeyService);
                this.cellOutputCollapsed = notebookBrowser_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED.bindTo(this.contextKeyService);
                this.cellLineNumbers = notebookBrowser_1.NOTEBOOK_CELL_LINE_NUMBERS.bindTo(this.contextKeyService);
                this.updateForElement(element);
            });
        }
        updateForElement(element) {
            this.elementDisposables.clear();
            this.elementDisposables.add(element.onDidChangeState(e => this.onDidChangeState(e)));
            if (element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.elementDisposables.add(element.onDidChangeOutputs(() => this.updateForOutputs()));
            }
            this.elementDisposables.add(element.model.onDidChangeMetadata(() => this.updateForCollapseState()));
            this.elementDisposables.add(this.notebookEditor.onDidChangeActiveCell(() => this.updateForFocusState()));
            this.element = element;
            if (this.element instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                this.cellType.set('markdown');
            }
            else if (this.element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.cellType.set('code');
            }
            this.contextKeyService.bufferChangeEvents(() => {
                this.updateForFocusState();
                this.updateForMetadata();
                this.updateForEditState();
                this.updateForCollapseState();
                this.updateForOutputs();
                this.viewType.set(this.element.viewType);
                this.cellLineNumbers.set(this.element.lineNumbers);
            });
        }
        onDidChangeState(e) {
            this.contextKeyService.bufferChangeEvents(() => {
                if (e.metadataChanged) {
                    this.updateForMetadata();
                }
                if (e.editStateChanged) {
                    this.updateForEditState();
                }
                if (e.focusModeChanged) {
                    this.updateForFocusState();
                }
                if (e.cellLineNumberChanged) {
                    this.cellLineNumbers.set(this.element.lineNumbers);
                }
                // if (e.collapseStateChanged) {
                // 	this.updateForCollapseState();
                // }
            });
        }
        updateForFocusState() {
            const activeCell = this.notebookEditor.getActiveCell();
            this.cellFocused.set(this.notebookEditor.getActiveCell() === this.element);
            if (activeCell === this.element) {
                this.cellEditorFocused.set(this.element.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            }
            else {
                this.cellEditorFocused.set(false);
            }
        }
        updateForMetadata() {
            var _a, _b;
            const metadata = this.element.metadata;
            this.cellEditable.set(!((_a = this.notebookEditor.viewModel) === null || _a === void 0 ? void 0 : _a.options.isReadOnly));
            const runState = (_b = metadata.runState) !== null && _b !== void 0 ? _b : notebookCommon_1.NotebookCellExecutionState.Idle;
            if (runState === notebookCommon_1.NotebookCellExecutionState.Idle) {
                if (metadata.lastRunSuccess === true) {
                    this.cellRunState.set('succeeded');
                }
                else if (metadata.lastRunSuccess === false) {
                    this.cellRunState.set('failed');
                }
                else {
                    this.cellRunState.set('idle');
                }
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Executing) {
                this.cellRunState.set('executing');
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Pending) {
                this.cellRunState.set('pending');
            }
        }
        updateForEditState() {
            if (this.element instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                this.markdownEditMode.set(this.element.getEditState() === notebookBrowser_1.CellEditState.Editing);
            }
            else {
                this.markdownEditMode.set(false);
            }
        }
        updateForCollapseState() {
            var _a, _b;
            this.cellContentCollapsed.set(!!((_a = this.element.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed));
            this.cellOutputCollapsed.set(!!((_b = this.element.metadata) === null || _b === void 0 ? void 0 : _b.outputCollapsed));
        }
        updateForOutputs() {
            if (this.element instanceof codeCellViewModel_1.CodeCellViewModel) {
                this.cellHasOutputs.set(this.element.outputsViewModels.length > 0);
            }
            else {
                this.cellHasOutputs.set(false);
            }
        }
    }
    exports.CellContextKeyManager = CellContextKeyManager;
});
//# sourceMappingURL=cellContextKeys.js.map