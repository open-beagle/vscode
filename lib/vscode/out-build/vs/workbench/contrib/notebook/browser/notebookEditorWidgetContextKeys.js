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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookKernelService"], function (require, exports, lifecycle_1, contextkey_1, notebookBrowser_1, notebookCommon_1, notebookKernelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorContextKeys = void 0;
    let NotebookEditorContextKeys = class NotebookEditorContextKeys {
        constructor(_editor, _notebookKernelService, contextKeyService) {
            this._editor = _editor;
            this._notebookKernelService = _notebookKernelService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._viewModelDisposables = new lifecycle_1.DisposableStore();
            this._cellStateListeners = [];
            this._notebookKernelCount = notebookBrowser_1.NOTEBOOK_KERNEL_COUNT.bindTo(contextKeyService);
            this._interruptibleKernel = notebookBrowser_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.bindTo(contextKeyService);
            this._someCellRunning = notebookBrowser_1.NOTEBOOK_HAS_RUNNING_CELL.bindTo(contextKeyService);
            this._disposables.add(_editor.onDidChangeModel(this._handleDidChangeModel, this));
            this._disposables.add(_notebookKernelService.onDidAddKernel(this._updateKernelContext, this));
            this._disposables.add(_notebookKernelService.onDidChangeNotebookKernelBinding(this._updateKernelContext, this));
            this._handleDidChangeModel();
        }
        dispose() {
            this._disposables.dispose();
            this._viewModelDisposables.dispose();
            this._notebookKernelCount.reset();
            this._interruptibleKernel.reset();
            this._someCellRunning.reset();
        }
        _handleDidChangeModel() {
            this._updateKernelContext();
            this._viewModelDisposables.clear();
            (0, lifecycle_1.dispose)(this._cellStateListeners);
            this._cellStateListeners.length = 0;
            if (!this._editor.hasModel()) {
                return;
            }
            let executionCount = 0;
            const addCellStateListener = (c) => {
                return c.onDidChangeState(e => {
                    var _a, _b;
                    if (!e.runStateChanged) {
                        return;
                    }
                    if (((_a = c.metadata) === null || _a === void 0 ? void 0 : _a.runState) === notebookCommon_1.NotebookCellExecutionState.Pending) {
                        executionCount++;
                    }
                    else if (((_b = c.metadata) === null || _b === void 0 ? void 0 : _b.runState) === notebookCommon_1.NotebookCellExecutionState.Idle) {
                        executionCount--;
                    }
                    this._someCellRunning.set(executionCount > 0);
                });
            };
            for (const cell of this._editor.viewModel.viewCells) {
                this._cellStateListeners.push(addCellStateListener(cell));
            }
            this._viewModelDisposables.add(this._editor.viewModel.onDidChangeViewCells(e => {
                e.splices.reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCells = this._cellStateListeners.splice(start, deleted, ...newCells.map(addCellStateListener));
                    (0, lifecycle_1.dispose)(deletedCells);
                });
            }));
        }
        _updateKernelContext() {
            var _a;
            if (!this._editor.hasModel()) {
                this._notebookKernelCount.reset();
                this._interruptibleKernel.reset();
                return;
            }
            const { selected, all } = this._notebookKernelService.getMatchingKernel(this._editor.viewModel.notebookDocument);
            this._notebookKernelCount.set(all.length);
            this._interruptibleKernel.set((_a = selected === null || selected === void 0 ? void 0 : selected.implementsInterrupt) !== null && _a !== void 0 ? _a : false);
        }
    };
    NotebookEditorContextKeys = __decorate([
        __param(1, notebookKernelService_1.INotebookKernelService),
        __param(2, contextkey_1.IContextKeyService)
    ], NotebookEditorContextKeys);
    exports.NotebookEditorContextKeys = NotebookEditorContextKeys;
});
//# sourceMappingURL=notebookEditorWidgetContextKeys.js.map