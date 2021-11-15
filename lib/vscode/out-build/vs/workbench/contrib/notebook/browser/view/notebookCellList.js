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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/list", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/common/core/range", "vs/editor/common/viewModel/prefixSumComputer", "vs/platform/configuration/common/configuration", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/base/common/numbers", "vs/workbench/contrib/notebook/browser/constants"], function (require, exports, DOM, list_1, event_1, lifecycle_1, platform_1, range_1, prefixSumComputer_1, configuration_1, keybinding_1, listService_1, themeService_1, notebookBrowser_1, notebookCommon_1, notebookRange_1, numbers_1, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookCellList = void 0;
    let NotebookCellList = class NotebookCellList extends listService_1.WorkbenchList {
        constructor(listUser, parentContainer, container, delegate, renderers, contextKeyService, options, listService, themeService, configurationService, keybindingService) {
            super(listUser, container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService, keybindingService);
            this.listUser = listUser;
            this._previousFocusedElements = [];
            this._localDisposableStore = new lifecycle_1.DisposableStore();
            this._viewModelStore = new lifecycle_1.DisposableStore();
            this._onDidRemoveOutputs = new event_1.Emitter();
            this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
            this._onDidHideOutputs = new event_1.Emitter();
            this.onDidHideOutputs = this._onDidHideOutputs.event;
            this._onDidRemoveCellsFromView = new event_1.Emitter();
            this.onDidRemoveCellsFromView = this._onDidRemoveCellsFromView.event;
            this._viewModel = null;
            this._hiddenRangeIds = [];
            this.hiddenRangesPrefixSum = null;
            this._onDidChangeVisibleRanges = new event_1.Emitter();
            this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
            this._visibleRanges = [];
            this._isDisposed = false;
            this._isInLayout = false;
            notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED.bindTo(this.contextKeyService).set(true);
            this._focusNextPreviousDelegate = options.focusNextPreviousDelegate;
            this._previousFocusedElements = this.getFocusedElements();
            this._localDisposableStore.add(this.onDidChangeFocus((e) => {
                this._previousFocusedElements.forEach(element => {
                    if (e.elements.indexOf(element) < 0) {
                        element.onDeselect();
                    }
                });
                this._previousFocusedElements = e.elements;
                if (document.activeElement && document.activeElement.classList.contains('webview')) {
                    super.domFocus();
                }
            }));
            const notebookEditorCursorAtBoundaryContext = notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.bindTo(contextKeyService);
            notebookEditorCursorAtBoundaryContext.set('none');
            let cursorSelectionListener = null;
            let textEditorAttachListener = null;
            const recomputeContext = (element) => {
                switch (element.cursorAtBoundary()) {
                    case notebookBrowser_1.CursorAtBoundary.Both:
                        notebookEditorCursorAtBoundaryContext.set('both');
                        break;
                    case notebookBrowser_1.CursorAtBoundary.Top:
                        notebookEditorCursorAtBoundaryContext.set('top');
                        break;
                    case notebookBrowser_1.CursorAtBoundary.Bottom:
                        notebookEditorCursorAtBoundaryContext.set('bottom');
                        break;
                    default:
                        notebookEditorCursorAtBoundaryContext.set('none');
                        break;
                }
                return;
            };
            // Cursor Boundary context
            this._localDisposableStore.add(this.onDidChangeFocus((e) => {
                if (e.elements.length) {
                    cursorSelectionListener === null || cursorSelectionListener === void 0 ? void 0 : cursorSelectionListener.dispose();
                    textEditorAttachListener === null || textEditorAttachListener === void 0 ? void 0 : textEditorAttachListener.dispose();
                    // we only validate the first focused element
                    const focusedElement = e.elements[0];
                    cursorSelectionListener = focusedElement.onDidChangeState((e) => {
                        if (e.selectionChanged) {
                            recomputeContext(focusedElement);
                        }
                    });
                    textEditorAttachListener = focusedElement.onDidChangeEditorAttachState(() => {
                        if (focusedElement.editorAttached) {
                            recomputeContext(focusedElement);
                        }
                    });
                    recomputeContext(focusedElement);
                    return;
                }
                // reset context
                notebookEditorCursorAtBoundaryContext.set('none');
            }));
            this._localDisposableStore.add(this.view.onMouseDblClick(() => {
                var _a;
                const focus = this.getFocusedElements()[0];
                if (focus && focus.cellKind === notebookCommon_1.CellKind.Markdown && !((_a = focus.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed)) {
                    focus.updateEditState(notebookBrowser_1.CellEditState.Editing, 'dbclick');
                    focus.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }));
            // update visibleRanges
            const updateVisibleRanges = () => {
                if (!this.view.length) {
                    return;
                }
                const top = this.getViewScrollTop();
                const bottom = this.getViewScrollBottom();
                if (top >= bottom) {
                    return;
                }
                const topViewIndex = (0, numbers_1.clamp)(this.view.indexAt(top), 0, this.view.length - 1);
                const topElement = this.view.element(topViewIndex);
                const topModelIndex = this._viewModel.getCellIndex(topElement);
                const bottomViewIndex = (0, numbers_1.clamp)(this.view.indexAt(bottom), 0, this.view.length - 1);
                const bottomElement = this.view.element(bottomViewIndex);
                const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
                if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                    this.visibleRanges = [{ start: topModelIndex, end: bottomModelIndex }];
                }
                else {
                    this.visibleRanges = this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
                }
            };
            this._localDisposableStore.add(this.view.onDidChangeContentHeight(() => {
                if (this._isInLayout) {
                    DOM.scheduleAtNextAnimationFrame(() => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
            this._localDisposableStore.add(this.view.onDidScroll(() => {
                if (this._isInLayout) {
                    DOM.scheduleAtNextAnimationFrame(() => {
                        updateVisibleRanges();
                    });
                }
                updateVisibleRanges();
            }));
        }
        get onWillScroll() { return this.view.onWillScroll; }
        get rowsContainer() {
            return this.view.containerDomNode;
        }
        get viewModel() {
            return this._viewModel;
        }
        get visibleRanges() {
            return this._visibleRanges;
        }
        set visibleRanges(ranges) {
            if ((0, notebookBrowser_1.cellRangesEqual)(this._visibleRanges, ranges)) {
                return;
            }
            this._visibleRanges = ranges;
            this._onDidChangeVisibleRanges.fire();
        }
        get isDisposed() {
            return this._isDisposed;
        }
        elementAt(position) {
            if (!this.view.length) {
                return undefined;
            }
            const idx = this.view.indexAt(position);
            const clamped = (0, numbers_1.clamp)(idx, 0, this.view.length - 1);
            return this.element(clamped);
        }
        elementHeight(element) {
            const index = this._getViewIndexUpperBound(element);
            if (index === undefined || index < 0 || index >= this.length) {
                this._getViewIndexUpperBound(element);
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            return this.view.elementHeight(index);
        }
        detachViewModel() {
            this._viewModelStore.clear();
            this._viewModel = null;
            this.hiddenRangesPrefixSum = null;
        }
        attachViewModel(model) {
            this._viewModel = model;
            this._viewModelStore.add(model.onDidChangeViewCells((e) => {
                if (this._isDisposed) {
                    return;
                }
                const currentRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
                const newVisibleViewCells = (0, notebookBrowser_1.getVisibleCells)(this._viewModel.viewCells, currentRanges);
                const oldVisibleViewCells = [];
                const oldViewCellMapping = new Set();
                for (let i = 0; i < this.length; i++) {
                    oldVisibleViewCells.push(this.element(i));
                    oldViewCellMapping.add(this.element(i).uri.toString());
                }
                const viewDiffs = (0, notebookCommon_1.diff)(oldVisibleViewCells, newVisibleViewCells, a => {
                    return oldViewCellMapping.has(a.uri.toString());
                });
                if (e.synchronous) {
                    this._updateElementsInWebview(viewDiffs);
                }
                else {
                    this._viewModelStore.add(DOM.scheduleAtNextAnimationFrame(() => {
                        if (this._isDisposed) {
                            return;
                        }
                        this._updateElementsInWebview(viewDiffs);
                    }));
                }
            }));
            this._viewModelStore.add(model.onDidChangeSelection((e) => {
                if (e === 'view') {
                    return;
                }
                // convert model selections to view selections
                const viewSelections = (0, notebookRange_1.cellRangesToIndexes)(model.getSelections()).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
                this.setSelection(viewSelections, undefined, true);
                const primary = (0, notebookRange_1.cellRangesToIndexes)([model.getFocus()]).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
                if (primary.length) {
                    this.setFocus(primary, undefined, true);
                }
            }));
            const hiddenRanges = model.getHiddenRanges();
            this.setHiddenAreas(hiddenRanges, false);
            const newRanges = (0, notebookBrowser_1.reduceCellRanges)(hiddenRanges);
            const viewCells = model.viewCells.slice(0);
            newRanges.reverse().forEach(range => {
                const removedCells = viewCells.splice(range.start, range.end - range.start + 1);
                this._onDidRemoveCellsFromView.fire(removedCells);
            });
            this.splice2(0, 0, viewCells);
        }
        _updateElementsInWebview(viewDiffs) {
            viewDiffs.reverse().forEach((diff) => {
                const hiddenOutputs = [];
                const deletedOutputs = [];
                const removedMarkdownCells = [];
                for (let i = diff.start; i < diff.start + diff.deleteCount; i++) {
                    const cell = this.element(i);
                    if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                        if (this._viewModel.hasCell(cell.handle)) {
                            hiddenOutputs.push(...cell === null || cell === void 0 ? void 0 : cell.outputsViewModels);
                        }
                        else {
                            deletedOutputs.push(...cell === null || cell === void 0 ? void 0 : cell.outputsViewModels);
                        }
                    }
                    else {
                        removedMarkdownCells.push(cell);
                    }
                }
                this.splice2(diff.start, diff.deleteCount, diff.toInsert);
                this._onDidHideOutputs.fire(hiddenOutputs);
                this._onDidRemoveOutputs.fire(deletedOutputs);
                this._onDidRemoveCellsFromView.fire(removedMarkdownCells);
            });
        }
        clear() {
            super.splice(0, this.length);
        }
        setHiddenAreas(_ranges, triggerViewUpdate) {
            if (!this._viewModel) {
                return false;
            }
            const newRanges = (0, notebookBrowser_1.reduceCellRanges)(_ranges);
            // delete old tracking ranges
            const oldRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
            if (newRanges.length === oldRanges.length) {
                let hasDifference = false;
                for (let i = 0; i < newRanges.length; i++) {
                    if (!(newRanges[i].start === oldRanges[i].start && newRanges[i].end === oldRanges[i].end)) {
                        hasDifference = true;
                        break;
                    }
                }
                if (!hasDifference) {
                    // they call 'setHiddenAreas' for a reason, even if the ranges are still the same, it's possible that the hiddenRangeSum is not update to date
                    this._updateHiddenRangePrefixSum(newRanges);
                    return false;
                }
            }
            this._hiddenRangeIds.forEach(id => this._viewModel.setTrackedRange(id, null, 3 /* GrowsOnlyWhenTypingAfter */));
            const hiddenAreaIds = newRanges.map(range => this._viewModel.setTrackedRange(null, range, 3 /* GrowsOnlyWhenTypingAfter */)).filter(id => id !== null);
            this._hiddenRangeIds = hiddenAreaIds;
            // set hidden ranges prefix sum
            this._updateHiddenRangePrefixSum(newRanges);
            if (triggerViewUpdate) {
                this.updateHiddenAreasInView(oldRanges, newRanges);
            }
            return true;
        }
        _updateHiddenRangePrefixSum(newRanges) {
            let start = 0;
            let index = 0;
            const ret = [];
            while (index < newRanges.length) {
                for (let j = start; j < newRanges[index].start - 1; j++) {
                    ret.push(1);
                }
                ret.push(newRanges[index].end - newRanges[index].start + 1 + 1);
                start = newRanges[index].end + 1;
                index++;
            }
            for (let i = start; i < this._viewModel.length; i++) {
                ret.push(1);
            }
            const values = new Uint32Array(ret.length);
            for (let i = 0; i < ret.length; i++) {
                values[i] = ret[i];
            }
            this.hiddenRangesPrefixSum = new prefixSumComputer_1.PrefixSumComputer(values);
        }
        /**
         * oldRanges and newRanges are all reduced and sorted.
         */
        updateHiddenAreasInView(oldRanges, newRanges) {
            const oldViewCellEntries = (0, notebookBrowser_1.getVisibleCells)(this._viewModel.viewCells, oldRanges);
            const oldViewCellMapping = new Set();
            oldViewCellEntries.forEach(cell => {
                oldViewCellMapping.add(cell.uri.toString());
            });
            const newViewCellEntries = (0, notebookBrowser_1.getVisibleCells)(this._viewModel.viewCells, newRanges);
            const viewDiffs = (0, notebookCommon_1.diff)(oldViewCellEntries, newViewCellEntries, a => {
                return oldViewCellMapping.has(a.uri.toString());
            });
            this._updateElementsInWebview(viewDiffs);
        }
        splice2(start, deleteCount, elements = []) {
            // we need to convert start and delete count based on hidden ranges
            if (start < 0 || start > this.view.length) {
                return;
            }
            const focusInside = DOM.isAncestor(document.activeElement, this.rowsContainer);
            super.splice(start, deleteCount, elements);
            if (focusInside) {
                this.domFocus();
            }
            const selectionsLeft = [];
            this.getSelectedElements().map(el => el.handle).forEach(handle => {
                if (this._viewModel.hasCell(handle)) {
                    selectionsLeft.push(handle);
                }
            });
            if (!selectionsLeft.length && this._viewModel.viewCells.length) {
                // after splice, the selected cells are deleted
                this._viewModel.updateSelectionsState({ kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
            }
        }
        getModelIndex(cell) {
            const viewIndex = this.indexOf(cell);
            return this.getModelIndex2(viewIndex);
        }
        getModelIndex2(viewIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return viewIndex;
            }
            const modelIndex = this.hiddenRangesPrefixSum.getAccumulatedValue(viewIndex - 1);
            return modelIndex;
        }
        getViewIndex(cell) {
            const modelIndex = this._viewModel.getCellIndex(cell);
            return this.getViewIndex2(modelIndex);
        }
        getViewIndex2(modelIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalValue()) {
                    // it's already after the last hidden range
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalValue() - this.hiddenRangesPrefixSum.getCount());
                }
                return undefined;
            }
            else {
                return viewIndexInfo.index;
            }
        }
        _getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex) {
            let stack = [];
            const ranges = [];
            // there are hidden ranges
            let index = topViewIndex;
            let modelIndex = topModelIndex;
            while (index <= bottomViewIndex) {
                const accu = this.hiddenRangesPrefixSum.getAccumulatedValue(index);
                if (accu === modelIndex + 1) {
                    // no hidden area after it
                    if (stack.length) {
                        if (stack[stack.length - 1] === modelIndex - 1) {
                            ranges.push({ start: stack[stack.length - 1], end: modelIndex });
                        }
                        else {
                            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] });
                        }
                    }
                    stack.push(modelIndex);
                    index++;
                    modelIndex++;
                }
                else {
                    // there are hidden ranges after it
                    if (stack.length) {
                        if (stack[stack.length - 1] === modelIndex - 1) {
                            ranges.push({ start: stack[stack.length - 1], end: modelIndex });
                        }
                        else {
                            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] });
                        }
                    }
                    stack.push(modelIndex);
                    index++;
                    modelIndex = accu;
                }
            }
            if (stack.length) {
                ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] });
            }
            return (0, notebookBrowser_1.reduceCellRanges)(ranges);
        }
        getVisibleRangesPlusViewportAboveBelow() {
            if (this.view.length <= 0) {
                return [];
            }
            const top = (0, numbers_1.clamp)(this.getViewScrollTop() - this.renderHeight, 0, this.scrollHeight);
            const bottom = (0, numbers_1.clamp)(this.getViewScrollBottom() + this.renderHeight, 0, this.scrollHeight);
            const topViewIndex = (0, numbers_1.clamp)(this.view.indexAt(top), 0, this.view.length - 1);
            const topElement = this.view.element(topViewIndex);
            const topModelIndex = this._viewModel.getCellIndex(topElement);
            const bottomViewIndex = (0, numbers_1.clamp)(this.view.indexAt(bottom), 0, this.view.length - 1);
            const bottomElement = this.view.element(bottomViewIndex);
            const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
            if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                return [{ start: topModelIndex, end: bottomModelIndex }];
            }
            else {
                return this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
            }
        }
        _getViewIndexUpperBound(cell) {
            if (!this._viewModel) {
                return -1;
            }
            const modelIndex = this._viewModel.getCellIndex(cell);
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalValue()) {
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalValue() - this.hiddenRangesPrefixSum.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        _getViewIndexUpperBound2(modelIndex) {
            if (!this.hiddenRangesPrefixSum) {
                return modelIndex;
            }
            const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
            if (viewIndexInfo.remainder !== 0) {
                if (modelIndex >= this.hiddenRangesPrefixSum.getTotalValue()) {
                    return modelIndex - (this.hiddenRangesPrefixSum.getTotalValue() - this.hiddenRangesPrefixSum.getCount());
                }
            }
            return viewIndexInfo.index;
        }
        focusElement(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0 && this._viewModel) {
                // update view model first, which will update both `focus` and `selection` in a single transaction
                const focusedElementHandle = this.element(index).handle;
                this._viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Handle,
                    primary: focusedElementHandle,
                    selections: [focusedElementHandle]
                }, 'view');
                // update the view as previous model update will not trigger event
                this.setFocus([index], undefined, false);
            }
        }
        selectElements(elements) {
            const indices = elements.map(cell => this._getViewIndexUpperBound(cell)).filter(index => index >= 0);
            this.setSelection(indices);
        }
        focusNext(n, loop, browserEvent, filter) {
            this._focusNextPreviousDelegate.onFocusNext(() => {
                super.focusNext(n, loop, browserEvent, filter);
            });
        }
        focusPrevious(n, loop, browserEvent, filter) {
            this._focusNextPreviousDelegate.onFocusPrevious(() => {
                super.focusPrevious(n, loop, browserEvent, filter);
            });
        }
        setFocus(indexes, browserEvent, ignoreTextModelUpdate) {
            if (ignoreTextModelUpdate) {
                super.setFocus(indexes, browserEvent);
                return;
            }
            if (!indexes.length) {
                if (this._viewModel) {
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this._viewModel) {
                    const focusedElementHandle = this.element(indexes[0]).handle;
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: focusedElementHandle,
                        selections: this.getSelection().map(selection => this.element(selection).handle)
                    }, 'view');
                }
            }
            super.setFocus(indexes, browserEvent);
        }
        setSelection(indexes, browserEvent, ignoreTextModelUpdate) {
            var _a, _b, _c, _d;
            if (ignoreTextModelUpdate) {
                super.setSelection(indexes, browserEvent);
                return;
            }
            if (!indexes.length) {
                if (this._viewModel) {
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: (_b = (_a = this.getFocusedElements()[0]) === null || _a === void 0 ? void 0 : _a.handle) !== null && _b !== void 0 ? _b : null,
                        selections: []
                    }, 'view');
                }
            }
            else {
                if (this._viewModel) {
                    this._viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: (_d = (_c = this.getFocusedElements()[0]) === null || _c === void 0 ? void 0 : _c.handle) !== null && _d !== void 0 ? _d : null,
                        selections: indexes.map(index => this.element(index)).map(cell => cell.handle)
                    }, 'view');
                }
            }
            super.setSelection(indexes, browserEvent);
        }
        /**
         * The range will be revealed with as little scrolling as possible.
         */
        revealElementsInView(range) {
            const startIndex = this._getViewIndexUpperBound2(range.start);
            if (startIndex < 0) {
                return;
            }
            const endIndex = this._getViewIndexUpperBound2(range.end - 1);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(startIndex);
            if (elementTop >= scrollTop
                && elementTop < wrapperBottom) {
                // start element is visible
                // check end
                const endElementTop = this.view.elementTop(endIndex);
                const endElementHeight = this.view.elementHeight(endIndex);
                if (endElementTop + endElementHeight <= wrapperBottom) {
                    // fully visible
                    return;
                }
                if (endElementTop >= wrapperBottom) {
                    return this._revealInternal(endIndex, false, notebookBrowser_1.CellRevealPosition.Bottom);
                }
                if (endElementTop < wrapperBottom) {
                    // end element partially visible
                    if (endElementTop + endElementHeight - wrapperBottom < elementTop - scrollTop) {
                        // there is enough space to just scroll up a little bit to make the end element visible
                        return this.view.setScrollTop(scrollTop + endElementTop + endElementHeight - wrapperBottom);
                    }
                    else {
                        // don't even try it
                        return this._revealInternal(startIndex, false, notebookBrowser_1.CellRevealPosition.Top);
                    }
                }
            }
            this._revealInView(startIndex);
        }
        revealElementInView(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                this._revealInView(index);
            }
        }
        revealElementInViewAtTop(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                this._revealInternal(index, false, notebookBrowser_1.CellRevealPosition.Top);
            }
        }
        revealElementInCenterIfOutsideViewport(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                this._revealInCenterIfOutsideViewport(index);
            }
        }
        revealElementInCenter(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                this._revealInCenter(index);
            }
        }
        async revealElementInCenterIfOutsideViewportAsync(cell) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                return this._revealInCenterIfOutsideViewportAsync(index);
            }
        }
        async revealElementLineInViewAsync(cell, line) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                return this._revealLineInViewAsync(index, line);
            }
        }
        async revealElementLineInCenterAsync(cell, line) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                return this._revealLineInCenterAsync(index, line);
            }
        }
        async revealElementLineInCenterIfOutsideViewportAsync(cell, line) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                return this._revealLineInCenterIfOutsideViewportAsync(index, line);
            }
        }
        async revealElementRangeInViewAsync(cell, range) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                return this._revealRangeInView(index, range);
            }
        }
        async revealElementRangeInCenterAsync(cell, range) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                return this._revealRangeInCenterAsync(index, range);
            }
        }
        async revealElementRangeInCenterIfOutsideViewportAsync(cell, range) {
            const index = this._getViewIndexUpperBound(cell);
            if (index >= 0) {
                return this._revealRangeInCenterIfOutsideViewportAsync(index, range);
            }
        }
        domElementOfElement(element) {
            const index = this._getViewIndexUpperBound(element);
            if (index >= 0) {
                return this.view.domElement(index);
            }
            return null;
        }
        focusView() {
            this.view.domNode.focus();
        }
        getAbsoluteTopOfElement(element) {
            const index = this._getViewIndexUpperBound(element);
            if (index === undefined || index < 0 || index >= this.length) {
                this._getViewIndexUpperBound(element);
                throw new list_1.ListError(this.listUser, `Invalid index ${index}`);
            }
            return this.view.elementTop(index);
        }
        triggerScrollFromMouseWheelEvent(browserEvent) {
            this.view.triggerScrollFromMouseWheelEvent(browserEvent);
        }
        updateElementHeight2(element, size) {
            const index = this._getViewIndexUpperBound(element);
            if (index === undefined || index < 0 || index >= this.length) {
                return;
            }
            const focused = this.getFocus();
            if (!focused.length) {
                this.view.updateElementHeight(index, size, null);
                return;
            }
            const focus = focused[0];
            if (focus <= index) {
                this.view.updateElementHeight(index, size, focus);
                return;
            }
            // the `element` is in the viewport, it's very often that the height update is triggerred by user interaction (collapse, run cell)
            // then we should make sure that the `element`'s visual view position doesn't change.
            if (this.view.elementTop(index) > this.view.scrollTop) {
                this.view.updateElementHeight(index, size, index);
                return;
            }
            this.view.updateElementHeight(index, size, focus);
        }
        // override
        domFocus() {
            const focused = this.getFocusedElements()[0];
            const focusedDomElement = focused && this.domElementOfElement(focused);
            if (document.activeElement && focusedDomElement && focusedDomElement.contains(document.activeElement)) {
                // for example, when focus goes into monaco editor, if we refocus the list view, the editor will lose focus.
                return;
            }
            if (!platform_1.isMacintosh && document.activeElement && isContextMenuFocused()) {
                return;
            }
            super.domFocus();
        }
        getViewScrollTop() {
            return this.view.getScrollTop();
        }
        getViewScrollBottom() {
            return this.getViewScrollTop() + this.view.renderHeight - constants_1.SCROLLABLE_ELEMENT_PADDING_TOP;
        }
        _revealRange(viewIndex, range, revealType, newlyCreated, alignToBottom) {
            const element = this.view.element(viewIndex);
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const positionOffset = element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
            const elementTop = this.view.elementTop(viewIndex);
            const positionTop = elementTop + positionOffset;
            // TODO@rebornix 30 ---> line height * 1.5
            if (positionTop < scrollTop) {
                this.view.setScrollTop(positionTop - 30);
            }
            else if (positionTop > wrapperBottom) {
                this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
            }
            else if (newlyCreated) {
                // newly scrolled into view
                if (alignToBottom) {
                    // align to the bottom
                    this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
                }
                else {
                    // align to to top
                    this.view.setScrollTop(positionTop - 30);
                }
            }
            if (revealType === notebookBrowser_1.CellRevealType.Range) {
                element.revealRangeInCenter(range);
            }
        }
        // List items have real dynamic heights, which means after we set `scrollTop` based on the `elementTop(index)`, the element at `index` might still be removed from the view once all relayouting tasks are done.
        // For example, we scroll item 10 into the view upwards, in the first round, items 7, 8, 9, 10 are all in the viewport. Then item 7 and 8 resize themselves to be larger and finally item 10 is removed from the view.
        // To ensure that item 10 is always there, we need to scroll item 10 to the top edge of the viewport.
        async _revealRangeInternalAsync(viewIndex, range, revealType) {
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const element = this.view.element(viewIndex);
            if (element.editorAttached) {
                this._revealRange(viewIndex, range, revealType, false, false);
            }
            else {
                const elementHeight = this.view.elementHeight(viewIndex);
                let upwards = false;
                if (elementTop + elementHeight < scrollTop) {
                    // scroll downwards
                    this.view.setScrollTop(elementTop);
                    upwards = false;
                }
                else if (elementTop > wrapperBottom) {
                    // scroll upwards
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    upwards = true;
                }
                const editorAttachedPromise = new Promise((resolve, reject) => {
                    element.onDidChangeEditorAttachState(() => {
                        element.editorAttached ? resolve() : reject();
                    });
                });
                return editorAttachedPromise.then(() => {
                    this._revealRange(viewIndex, range, revealType, true, upwards);
                });
            }
        }
        async _revealLineInViewAsync(viewIndex, line) {
            return this._revealRangeInternalAsync(viewIndex, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealType.Line);
        }
        async _revealRangeInView(viewIndex, range) {
            return this._revealRangeInternalAsync(viewIndex, range, notebookBrowser_1.CellRevealType.Range);
        }
        async _revealRangeInCenterInternalAsync(viewIndex, range, revealType) {
            const reveal = (viewIndex, range, revealType) => {
                const element = this.view.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
                const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
                this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
                if (revealType === notebookBrowser_1.CellRevealType.Range) {
                    element.revealRangeInCenter(range);
                }
            };
            const elementTop = this.view.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            this.view.setScrollTop(viewItemOffset - this.view.renderHeight / 2);
            const element = this.view.element(viewIndex);
            if (!element.editorAttached) {
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
            }
            else {
                reveal(viewIndex, range, revealType);
            }
        }
        async _revealLineInCenterAsync(viewIndex, line) {
            return this._revealRangeInCenterInternalAsync(viewIndex, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealType.Line);
        }
        _revealRangeInCenterAsync(viewIndex, range) {
            return this._revealRangeInCenterInternalAsync(viewIndex, range, notebookBrowser_1.CellRevealType.Range);
        }
        async _revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, range, revealType) {
            const reveal = (viewIndex, range, revealType) => {
                const element = this.view.element(viewIndex);
                const positionOffset = element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
                const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
                this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
                if (revealType === notebookBrowser_1.CellRevealType.Range) {
                    element.revealRangeInCenter(range);
                }
            };
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const viewItemOffset = elementTop;
            const element = this.view.element(viewIndex);
            const positionOffset = viewItemOffset + element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
            if (positionOffset < scrollTop || positionOffset > wrapperBottom) {
                // let it render
                this.view.setScrollTop(positionOffset - this.view.renderHeight / 2);
                // after rendering, it might be pushed down due to markdown cell dynamic height
                const newPositionOffset = this.view.elementTop(viewIndex) + element.getPositionScrollTopOffset(range.startLineNumber, range.startColumn);
                this.view.setScrollTop(newPositionOffset - this.view.renderHeight / 2);
                // reveal editor
                if (!element.editorAttached) {
                    return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
                }
                else {
                    // for example markdown
                }
            }
            else {
                if (element.editorAttached) {
                    element.revealRangeInCenter(range);
                }
                else {
                    // for example, markdown cell in preview mode
                    return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range, revealType));
                }
            }
        }
        async _revealInCenterIfOutsideViewportAsync(viewIndex) {
            this._revealInternal(viewIndex, true, notebookBrowser_1.CellRevealPosition.Center);
            const element = this.view.element(viewIndex);
            // wait for the editor to be created only if the cell is in editing mode (meaning it has an editor and will focus the editor)
            if (element.getEditState() === notebookBrowser_1.CellEditState.Editing && !element.editorAttached) {
                return getEditorAttachedPromise(element);
            }
            return;
        }
        async _revealLineInCenterIfOutsideViewportAsync(viewIndex, line) {
            return this._revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, new range_1.Range(line, 1, line, 1), notebookBrowser_1.CellRevealType.Line);
        }
        async _revealRangeInCenterIfOutsideViewportAsync(viewIndex, range) {
            return this._revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, range, notebookBrowser_1.CellRevealType.Range);
        }
        _revealInternal(viewIndex, ignoreIfInsideViewport, revealPosition) {
            if (viewIndex >= this.view.length) {
                return;
            }
            const scrollTop = this.getViewScrollTop();
            const wrapperBottom = this.getViewScrollBottom();
            const elementTop = this.view.elementTop(viewIndex);
            const elementBottom = this.view.elementHeight(viewIndex) + elementTop;
            if (ignoreIfInsideViewport
                && elementTop >= scrollTop
                && elementTop < wrapperBottom) {
                if (revealPosition === notebookBrowser_1.CellRevealPosition.Center
                    && elementBottom > wrapperBottom
                    && elementTop > (scrollTop + wrapperBottom) / 2) {
                    // the element is partially visible and it's below the center of the viewport
                }
                else {
                    return;
                }
            }
            switch (revealPosition) {
                case notebookBrowser_1.CellRevealPosition.Top:
                    this.view.setScrollTop(elementTop);
                    this.view.setScrollTop(this.view.elementTop(viewIndex));
                    break;
                case notebookBrowser_1.CellRevealPosition.Center:
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    this.view.setScrollTop(this.view.elementTop(viewIndex) - this.view.renderHeight / 2);
                    break;
                case notebookBrowser_1.CellRevealPosition.Bottom:
                    this.view.setScrollTop(this.scrollTop + (elementBottom - wrapperBottom));
                    this.view.setScrollTop(this.scrollTop + (this.view.elementTop(viewIndex) + this.view.elementHeight(viewIndex) - this.getViewScrollBottom()));
                    break;
                default:
                    break;
            }
        }
        _revealInView(viewIndex) {
            const firstIndex = this.view.firstVisibleIndex;
            if (viewIndex < firstIndex) {
                this._revealInternal(viewIndex, true, notebookBrowser_1.CellRevealPosition.Top);
            }
            else {
                this._revealInternal(viewIndex, true, notebookBrowser_1.CellRevealPosition.Bottom);
            }
        }
        _revealInCenter(viewIndex) {
            this._revealInternal(viewIndex, false, notebookBrowser_1.CellRevealPosition.Center);
        }
        _revealInCenterIfOutsideViewport(viewIndex) {
            this._revealInternal(viewIndex, true, notebookBrowser_1.CellRevealPosition.Center);
        }
        setCellSelection(cell, range) {
            const element = cell;
            if (element.editorAttached) {
                element.setSelection(range);
            }
            else {
                getEditorAttachedPromise(element).then(() => { element.setSelection(range); });
            }
        }
        style(styles) {
            const selectorSuffix = this.view.domId;
            if (!this.styleElement) {
                this.styleElement = DOM.createStyleSheet(this.view.domNode);
            }
            const suffix = selectorSuffix && `.${selectorSuffix}`;
            const content = [];
            if (styles.listBackground) {
                if (styles.listBackground.isOpaque()) {
                    content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
                }
                else if (!platform_1.isMacintosh) { // subpixel AA doesn't exist in macOS
                    console.warn(`List with id '${selectorSuffix}' was styled with a non-opaque background color. This will break sub-pixel antialiasing.`);
                }
            }
            if (styles.listFocusBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listFocusAndSelectionBackground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
            }
            if (styles.listFocusAndSelectionForeground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
            }
            if (styles.listInactiveFocusBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionBackground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
            }
            if (styles.listSelectionOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listFocusOutline) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
            }
            if (styles.listInactiveFocusOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) {
                content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            if (styles.listDropBackground) {
                content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropBackground} !important; color: inherit !important; }
			`);
            }
            if (styles.listFilterWidgetBackground) {
                content.push(`.monaco-list-type-filter { background-color: ${styles.listFilterWidgetBackground} }`);
            }
            if (styles.listFilterWidgetOutline) {
                content.push(`.monaco-list-type-filter { border: 1px solid ${styles.listFilterWidgetOutline}; }`);
            }
            if (styles.listFilterWidgetNoMatchesOutline) {
                content.push(`.monaco-list-type-filter.no-matches { border: 1px solid ${styles.listFilterWidgetNoMatchesOutline}; }`);
            }
            if (styles.listMatchesShadow) {
                content.push(`.monaco-list-type-filter { box-shadow: 1px 1px 1px ${styles.listMatchesShadow}; }`);
            }
            const newStyles = content.join('\n');
            if (newStyles !== this.styleElement.textContent) {
                this.styleElement.textContent = newStyles;
            }
        }
        getRenderHeight() {
            return this.view.renderHeight;
        }
        layout(height, width) {
            this._isInLayout = true;
            super.layout(height, width);
            if (this.renderHeight === 0) {
                this.view.domNode.style.visibility = 'hidden';
            }
            else {
                this.view.domNode.style.visibility = 'initial';
            }
            this._isInLayout = false;
        }
        dispose() {
            this._isDisposed = true;
            this._viewModelStore.dispose();
            this._localDisposableStore.dispose();
            super.dispose();
        }
    };
    NotebookCellList = __decorate([
        __param(7, listService_1.IListService),
        __param(8, themeService_1.IThemeService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, keybinding_1.IKeybindingService)
    ], NotebookCellList);
    exports.NotebookCellList = NotebookCellList;
    function getEditorAttachedPromise(element) {
        return new Promise((resolve, reject) => {
            event_1.Event.once(element.onDidChangeEditorAttachState)(() => element.editorAttached ? resolve() : reject());
        });
    }
    function isContextMenuFocused() {
        return !!DOM.findParentWithClass(document.activeElement, 'context-view');
    }
});
//# sourceMappingURL=notebookCellList.js.map