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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, arrays_1, async_1, cancellation_1, lifecycle_1, notebookEditorExtensions_1, notebookCellStatusBarService_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookStatusBarController = void 0;
    let NotebookStatusBarController = class NotebookStatusBarController extends lifecycle_1.Disposable {
        constructor(_notebookEditor, _notebookCellStatusBarService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._notebookCellStatusBarService = _notebookCellStatusBarService;
            this._visibleCells = new Map();
            this._viewModelDisposables = new lifecycle_1.DisposableStore();
            this._updateVisibleCells();
            this._register(this._notebookEditor.onDidChangeVisibleRanges(this._updateVisibleCells, this));
            this._register(this._notebookEditor.onDidChangeModel(this._onModelChange, this));
            this._register(this._notebookCellStatusBarService.onDidChangeProviders(this._updateEverything, this));
            this._register(this._notebookCellStatusBarService.onDidChangeItems(this._updateEverything, this));
        }
        _onModelChange() {
            this._viewModelDisposables.clear();
            const vm = this._notebookEditor.viewModel;
            if (!vm) {
                return;
            }
            this._viewModelDisposables.add(vm.onDidChangeViewCells(() => this._updateEverything()));
            this._updateEverything();
        }
        _updateEverything() {
            this._visibleCells.forEach(cell => cell.dispose());
            this._visibleCells.clear();
            this._updateVisibleCells();
        }
        _updateVisibleCells() {
            var _a;
            const vm = this._notebookEditor.viewModel;
            if (!vm) {
                return;
            }
            const newVisibleCells = new Set();
            const rangesWithEnd = this._notebookEditor.visibleRanges
                .map(range => ({ start: range.start, end: range.end + 1 }));
            (0, notebookRange_1.cellRangesToIndexes)(rangesWithEnd)
                .map(index => vm.cellAt(index))
                .filter((cell) => !!cell)
                .map(cell => {
                if (!this._visibleCells.has(cell.handle)) {
                    const helper = new CellStatusBarHelper(vm, cell, this._notebookCellStatusBarService);
                    this._visibleCells.set(cell.handle, helper);
                }
                newVisibleCells.add(cell.handle);
            });
            for (let handle of this._visibleCells.keys()) {
                if (!newVisibleCells.has(handle)) {
                    (_a = this._visibleCells.get(handle)) === null || _a === void 0 ? void 0 : _a.dispose();
                    this._visibleCells.delete(handle);
                }
            }
        }
        dispose() {
            this._visibleCells.forEach(cell => cell.dispose());
            this._visibleCells.clear();
        }
    };
    NotebookStatusBarController.id = 'workbench.notebook.statusBar';
    NotebookStatusBarController = __decorate([
        __param(1, notebookCellStatusBarService_1.INotebookCellStatusBarService)
    ], NotebookStatusBarController);
    exports.NotebookStatusBarController = NotebookStatusBarController;
    class CellStatusBarHelper extends lifecycle_1.Disposable {
        constructor(_notebookViewModel, _cell, _notebookCellStatusBarService) {
            super();
            this._notebookViewModel = _notebookViewModel;
            this._cell = _cell;
            this._notebookCellStatusBarService = _notebookCellStatusBarService;
            this._currentItemIds = [];
            this._currentItemLists = [];
            this._updateThrottler = new async_1.Throttler();
            this._cancelTokenSource = new cancellation_1.CancellationTokenSource();
            this._register((0, lifecycle_1.toDisposable)(() => this._cancelTokenSource.dispose(true)));
            this._updateSoon();
            this._register(this._cell.model.onDidChangeContent(() => this._updateSoon()));
            this._register(this._cell.model.onDidChangeLanguage(() => this._updateSoon()));
            this._register(this._cell.model.onDidChangeMetadata(() => this._updateSoon()));
            this._register(this._cell.model.onDidChangeOutputs(() => this._updateSoon()));
        }
        _updateSoon() {
            this._updateThrottler.queue(() => this._update());
        }
        async _update() {
            const cellIndex = this._notebookViewModel.getCellIndex(this._cell);
            const docUri = this._notebookViewModel.notebookDocument.uri;
            const viewType = this._notebookViewModel.notebookDocument.viewType;
            const itemLists = await this._notebookCellStatusBarService.getStatusBarItemsForCell(docUri, cellIndex, viewType, this._cancelTokenSource.token);
            if (this._cancelTokenSource.token.isCancellationRequested) {
                itemLists.forEach(itemList => itemList.dispose && itemList.dispose());
                return;
            }
            const items = (0, arrays_1.flatten)(itemLists.map(itemList => itemList.items));
            const newIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
            this._currentItemLists.forEach(itemList => itemList.dispose && itemList.dispose());
            this._currentItemLists = itemLists;
            this._currentItemIds = newIds;
        }
        dispose() {
            super.dispose();
            this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
            this._currentItemLists.forEach(itemList => itemList.dispose && itemList.dispose());
        }
    }
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookStatusBarController.id, NotebookStatusBarController);
});
//# sourceMappingURL=cellStatusBar.js.map