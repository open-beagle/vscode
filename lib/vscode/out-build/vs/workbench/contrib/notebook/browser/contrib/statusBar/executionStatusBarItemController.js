/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/statusBar/executionStatusBarItemController", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/contrib/statusBar/notebookVisibleCellObserver", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, async_1, event_1, lifecycle_1, nls_1, themeService_1, notebookVisibleCellObserver_1, notebookEditorExtensions_1, notebookEditorWidget_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookStatusBarController = void 0;
    class NotebookStatusBarController extends lifecycle_1.Disposable {
        constructor(_notebookEditor) {
            super();
            this._notebookEditor = _notebookEditor;
            this._visibleCells = new Map();
            this._observer = this._register(new notebookVisibleCellObserver_1.NotebookVisibleCellObserver(this._notebookEditor));
            this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
            this._updateEverything();
        }
        _updateEverything() {
            this._visibleCells.forEach(lifecycle_1.dispose);
            this._visibleCells.clear();
            this._updateVisibleCells({ added: this._observer.visibleCells, removed: [] });
        }
        _updateVisibleCells(e) {
            var _a;
            const vm = this._notebookEditor.viewModel;
            if (!vm) {
                return;
            }
            for (let newCell of e.added) {
                const helpers = [
                    new ExecutionStateCellStatusBarHelper(vm, newCell),
                    new TimerCellStatusBarHelper(vm, newCell)
                ];
                this._visibleCells.set(newCell.handle, helpers);
            }
            for (let oldCell of e.removed) {
                (_a = this._visibleCells.get(oldCell.handle)) === null || _a === void 0 ? void 0 : _a.forEach(lifecycle_1.dispose);
                this._visibleCells.delete(oldCell.handle);
            }
        }
        dispose() {
            super.dispose();
            this._visibleCells.forEach(lifecycle_1.dispose);
            this._visibleCells.clear();
        }
    }
    exports.NotebookStatusBarController = NotebookStatusBarController;
    NotebookStatusBarController.id = 'workbench.notebook.statusBar';
    /**
     * Shows the cell's execution state in the cell status bar. When the "executing" state is shown, it will be shown for a minimum brief time.
     */
    class ExecutionStateCellStatusBarHelper extends lifecycle_1.Disposable {
        constructor(_notebookViewModel, _cell) {
            super();
            this._notebookViewModel = _notebookViewModel;
            this._cell = _cell;
            this._currentItemIds = [];
            this._update();
            this._register(this._cell.model.onDidChangeMetadata(() => this._update()));
        }
        async _update() {
            const items = this._getItemsForCell(this._cell);
            if (Array.isArray(items)) {
                this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
            }
        }
        /**
         *	Returns undefined if there should be no change, and an empty array if all items should be removed.
         */
        _getItemsForCell(cell) {
            var _a, _b, _c;
            if (this._currentExecutingStateTimer) {
                return;
            }
            const item = this._getItemForState((_a = cell.metadata) === null || _a === void 0 ? void 0 : _a.runState, (_b = cell.metadata) === null || _b === void 0 ? void 0 : _b.lastRunSuccess);
            // Show the execution spinner for a minimum time
            if (((_c = cell.metadata) === null || _c === void 0 ? void 0 : _c.runState) === notebookCommon_1.NotebookCellExecutionState.Executing) {
                this._currentExecutingStateTimer = setTimeout(() => {
                    var _a;
                    this._currentExecutingStateTimer = undefined;
                    if (((_a = cell.metadata) === null || _a === void 0 ? void 0 : _a.runState) !== notebookCommon_1.NotebookCellExecutionState.Executing) {
                        this._update();
                    }
                }, ExecutionStateCellStatusBarHelper.MIN_SPINNER_TIME);
            }
            return item ? [item] : [];
        }
        _getItemForState(runState, lastRunSuccess) {
            if (runState === notebookCommon_1.NotebookCellExecutionState.Idle && lastRunSuccess) {
                return {
                    text: '$(notebook-state-success)',
                    color: (0, themeService_1.themeColorFromId)(notebookEditorWidget_1.cellStatusIconSuccess),
                    tooltip: (0, nls_1.localize)(0, null),
                    alignment: 1 /* Left */,
                    priority: Number.MAX_SAFE_INTEGER
                };
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Idle && lastRunSuccess === false) {
                return {
                    text: '$(notebook-state-error)',
                    color: (0, themeService_1.themeColorFromId)(notebookEditorWidget_1.cellStatusIconError),
                    tooltip: (0, nls_1.localize)(1, null),
                    alignment: 1 /* Left */,
                    priority: Number.MAX_SAFE_INTEGER
                };
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Pending) {
                return {
                    text: '$(notebook-state-pending)',
                    tooltip: (0, nls_1.localize)(2, null),
                    alignment: 1 /* Left */,
                    priority: Number.MAX_SAFE_INTEGER
                };
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Executing) {
                return {
                    text: '$(notebook-state-executing~spin)',
                    tooltip: (0, nls_1.localize)(3, null),
                    alignment: 1 /* Left */,
                    priority: Number.MAX_SAFE_INTEGER
                };
            }
            return;
        }
        dispose() {
            super.dispose();
            this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
        }
    }
    ExecutionStateCellStatusBarHelper.MIN_SPINNER_TIME = 500;
    class TimerCellStatusBarHelper extends lifecycle_1.Disposable {
        constructor(_notebookViewModel, _cell) {
            super();
            this._notebookViewModel = _notebookViewModel;
            this._cell = _cell;
            this._currentItemIds = [];
            this._scheduler = this._register(new async_1.RunOnceScheduler(() => this._update(), TimerCellStatusBarHelper.UPDATE_INTERVAL));
            this._update();
            this._register(event_1.Event.filter(this._cell.model.onDidChangeMetadata, e => !!e.runStateChanged)(() => this._update()));
        }
        async _update() {
            var _a, _b;
            let item;
            if (((_a = this._cell.metadata) === null || _a === void 0 ? void 0 : _a.runState) === notebookCommon_1.NotebookCellExecutionState.Executing) {
                const startTime = this._cell.metadata.runStartTime;
                const adjustment = this._cell.metadata.runStartTimeAdjustment;
                if (typeof startTime === 'number') {
                    item = this._getTimeItem(startTime, Date.now(), adjustment);
                    this._scheduler.schedule();
                }
            }
            else if (((_b = this._cell.metadata) === null || _b === void 0 ? void 0 : _b.runState) === notebookCommon_1.NotebookCellExecutionState.Idle) {
                const startTime = this._cell.metadata.runStartTime;
                const endTime = this._cell.metadata.runEndTime;
                if (typeof startTime === 'number' && typeof endTime === 'number') {
                    item = this._getTimeItem(startTime, endTime);
                }
            }
            const items = item ? [item] : [];
            this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        }
        _getTimeItem(startTime, endTime, adjustment = 0) {
            const duration = endTime - startTime + adjustment;
            return {
                text: this._formatDuration(duration),
                alignment: 1 /* Left */,
                priority: Number.MAX_SAFE_INTEGER - 1
            };
        }
        _formatDuration(duration) {
            const seconds = Math.floor(duration / 1000);
            const tenths = String(duration - seconds * 1000).charAt(0);
            return `${seconds}.${tenths}s`;
        }
        dispose() {
            super.dispose();
            this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
        }
    }
    TimerCellStatusBarHelper.UPDATE_INTERVAL = 100;
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookStatusBarController.id, NotebookStatusBarController);
});
//# sourceMappingURL=executionStatusBarItemController.js.map