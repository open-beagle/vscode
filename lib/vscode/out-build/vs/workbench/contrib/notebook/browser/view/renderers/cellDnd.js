/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange"], function (require, exports, DOM, event_1, async_1, lifecycle_1, platform, constants_1, notebookBrowser_1, notebookCellTextModel_1, notebookCommon_1, notebookRange_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellDragAndDropController = exports.GLOBAL_DRAG_CLASS = exports.DRAGGING_CLASS = void 0;
    const $ = DOM.$;
    exports.DRAGGING_CLASS = 'cell-dragging';
    exports.GLOBAL_DRAG_CLASS = 'global-drag-active';
    class CellDragAndDropController extends lifecycle_1.Disposable {
        constructor(notebookEditor, insertionIndicatorContainer) {
            super();
            this.notebookEditor = notebookEditor;
            this.isScrolling = false;
            this.listInsertionIndicator = DOM.append(insertionIndicatorContainer, $('.cell-list-insertion-indicator'));
            this._register((0, event_1.domEvent)(document.body, DOM.EventType.DRAG_START, true)(this.onGlobalDragStart.bind(this)));
            this._register((0, event_1.domEvent)(document.body, DOM.EventType.DRAG_END, true)(this.onGlobalDragEnd.bind(this)));
            const addCellDragListener = (eventType, handler) => {
                this._register(DOM.addDisposableListener(notebookEditor.getDomNode(), eventType, e => {
                    const cellDragEvent = this.toCellDragEvent(e);
                    if (cellDragEvent) {
                        handler(cellDragEvent);
                    }
                }));
            };
            addCellDragListener(DOM.EventType.DRAG_OVER, event => {
                event.browserEvent.preventDefault();
                this.onCellDragover(event);
            });
            addCellDragListener(DOM.EventType.DROP, event => {
                event.browserEvent.preventDefault();
                this.onCellDrop(event);
            });
            addCellDragListener(DOM.EventType.DRAG_LEAVE, event => {
                event.browserEvent.preventDefault();
                this.onCellDragLeave(event);
            });
            this.scrollingDelayer = new async_1.Delayer(200);
        }
        setList(value) {
            this.list = value;
            this.list.onWillScroll(e => {
                if (!e.scrollTopChanged) {
                    return;
                }
                this.setInsertIndicatorVisibility(false);
                this.isScrolling = true;
                this.scrollingDelayer.trigger(() => {
                    this.isScrolling = false;
                });
            });
        }
        setInsertIndicatorVisibility(visible) {
            this.listInsertionIndicator.style.opacity = visible ? '1' : '0';
        }
        toCellDragEvent(event) {
            const targetTop = this.notebookEditor.getDomNode().getBoundingClientRect().top;
            const dragOffset = this.list.scrollTop + event.clientY - targetTop;
            const draggedOverCell = this.list.elementAt(dragOffset);
            if (!draggedOverCell) {
                return undefined;
            }
            const cellTop = this.list.getAbsoluteTopOfElement(draggedOverCell);
            const cellHeight = this.list.elementHeight(draggedOverCell);
            const dragPosInElement = dragOffset - cellTop;
            const dragPosRatio = dragPosInElement / cellHeight;
            return {
                browserEvent: event,
                draggedOverCell,
                cellTop,
                cellHeight,
                dragPosRatio
            };
        }
        clearGlobalDragState() {
            this.notebookEditor.getDomNode().classList.remove(exports.GLOBAL_DRAG_CLASS);
        }
        onGlobalDragStart() {
            this.notebookEditor.getDomNode().classList.add(exports.GLOBAL_DRAG_CLASS);
        }
        onGlobalDragEnd() {
            this.notebookEditor.getDomNode().classList.remove(exports.GLOBAL_DRAG_CLASS);
        }
        onCellDragover(event) {
            if (!event.browserEvent.dataTransfer) {
                return;
            }
            if (!this.currentDraggedCell) {
                event.browserEvent.dataTransfer.dropEffect = 'none';
                return;
            }
            if (this.isScrolling || this.currentDraggedCell === event.draggedOverCell) {
                this.setInsertIndicatorVisibility(false);
                return;
            }
            const dropDirection = this.getDropInsertDirection(event.dragPosRatio);
            const insertionIndicatorAbsolutePos = dropDirection === 'above' ? event.cellTop : event.cellTop + event.cellHeight;
            this.updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos);
        }
        updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos) {
            const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.list.scrollTop + constants_1.BOTTOM_CELL_TOOLBAR_GAP / 2;
            if (insertionIndicatorTop >= 0) {
                this.listInsertionIndicator.style.top = `${insertionIndicatorTop}px`;
                this.setInsertIndicatorVisibility(true);
            }
            else {
                this.setInsertIndicatorVisibility(false);
            }
        }
        getDropInsertDirection(dragPosRatio) {
            return dragPosRatio < 0.5 ? 'above' : 'below';
        }
        onCellDrop(event) {
            const draggedCell = this.currentDraggedCell;
            if (this.isScrolling || this.currentDraggedCell === event.draggedOverCell) {
                return;
            }
            this.dragCleanup();
            const dropDirection = this.getDropInsertDirection(event.dragPosRatio);
            this._dropImpl(draggedCell, dropDirection, event.browserEvent, event.draggedOverCell);
        }
        getCellRangeAroundDragTarget(draggedCellIndex) {
            const selections = this.notebookEditor.getSelections();
            const modelRanges = (0, notebookBrowser_1.expandCellRangesWithHiddenCells)(this.notebookEditor, this.notebookEditor.viewModel, selections);
            const nearestRange = modelRanges.find(range => range.start <= draggedCellIndex && draggedCellIndex < range.end);
            if (nearestRange) {
                return nearestRange;
            }
            else {
                return { start: draggedCellIndex, end: draggedCellIndex + 1 };
            }
        }
        _dropImpl(draggedCell, dropDirection, ctx, draggedOverCell) {
            const cellTop = this.list.getAbsoluteTopOfElement(draggedOverCell);
            const cellHeight = this.list.elementHeight(draggedOverCell);
            const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
            const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.list.scrollTop + constants_1.BOTTOM_CELL_TOOLBAR_GAP / 2;
            const editorHeight = this.notebookEditor.getDomNode().getBoundingClientRect().height;
            if (insertionIndicatorTop < 0 || insertionIndicatorTop > editorHeight) {
                // Ignore drop, insertion point is off-screen
                return;
            }
            const isCopy = (ctx.ctrlKey && !platform.isMacintosh) || (ctx.altKey && platform.isMacintosh);
            if (isCopy) {
                const viewModel = this.notebookEditor.viewModel;
                const draggedCellIndex = this.notebookEditor.viewModel.getCellIndex(draggedCell);
                const range = this.getCellRangeAroundDragTarget(draggedCellIndex);
                let originalToIdx = viewModel.getCellIndex(draggedOverCell);
                if (dropDirection === 'below') {
                    const relativeToIndex = viewModel.getCellIndex(draggedOverCell);
                    const newIdx = viewModel.getNextVisibleCellIndex(relativeToIndex);
                    originalToIdx = newIdx;
                }
                let finalSelection;
                let finalFocus;
                if (originalToIdx <= range.start) {
                    finalSelection = { start: originalToIdx, end: originalToIdx + range.end - range.start };
                    finalFocus = { start: originalToIdx + draggedCellIndex - range.start, end: originalToIdx + draggedCellIndex - range.start + 1 };
                }
                else {
                    const delta = (originalToIdx - range.start);
                    finalSelection = { start: range.start + delta, end: range.end + delta };
                    finalFocus = { start: draggedCellIndex + delta, end: draggedCellIndex + delta + 1 };
                }
                viewModel.notebookDocument.applyEdits([
                    {
                        editType: 1 /* Replace */,
                        index: originalToIdx,
                        count: 0,
                        cells: (0, notebookRange_1.cellRangesToIndexes)([range]).map(index => (0, notebookCellTextModel_1.cloneNotebookCellTextModel)(viewModel.viewCells[index].model))
                    }
                ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: finalFocus, selections: [finalSelection] }), undefined, true);
                this.notebookEditor.revealCellRangeInView(finalSelection);
            }
            else {
                const viewModel = this.notebookEditor.viewModel;
                const draggedCellIndex = this.notebookEditor.viewModel.getCellIndex(draggedCell);
                const range = this.getCellRangeAroundDragTarget(draggedCellIndex);
                let originalToIdx = viewModel.getCellIndex(draggedOverCell);
                if (dropDirection === 'below') {
                    const relativeToIndex = viewModel.getCellIndex(draggedOverCell);
                    const newIdx = viewModel.getNextVisibleCellIndex(relativeToIndex);
                    originalToIdx = newIdx;
                }
                if (originalToIdx >= range.start && originalToIdx <= range.end) {
                    return;
                }
                let finalSelection;
                let finalFocus;
                if (originalToIdx <= range.start) {
                    finalSelection = { start: originalToIdx, end: originalToIdx + range.end - range.start };
                    finalFocus = { start: originalToIdx + draggedCellIndex - range.start, end: originalToIdx + draggedCellIndex - range.start + 1 };
                }
                else {
                    const delta = (originalToIdx - range.end);
                    finalSelection = { start: range.start + delta, end: range.end + delta };
                    finalFocus = { start: draggedCellIndex + delta, end: draggedCellIndex + delta + 1 };
                }
                viewModel.notebookDocument.applyEdits([
                    {
                        editType: 6 /* Move */,
                        index: range.start,
                        length: range.end - range.start,
                        newIdx: originalToIdx <= range.start ? originalToIdx : (originalToIdx - (range.end - range.start))
                    }
                ], true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => ({ kind: notebookCommon_1.SelectionStateType.Index, focus: finalFocus, selections: [finalSelection] }), undefined, true);
                this.notebookEditor.revealCellRangeInView(finalSelection);
            }
        }
        onCellDragLeave(event) {
            if (!event.browserEvent.relatedTarget || !DOM.isAncestor(event.browserEvent.relatedTarget, this.notebookEditor.getDomNode())) {
                this.setInsertIndicatorVisibility(false);
            }
        }
        dragCleanup() {
            if (this.currentDraggedCell) {
                this.currentDraggedCell.dragging = false;
                this.currentDraggedCell = undefined;
            }
            this.setInsertIndicatorVisibility(false);
        }
        registerDragHandle(templateData, cellRoot, dragHandle, dragImageProvider) {
            const container = templateData.container;
            dragHandle.setAttribute('draggable', 'true');
            templateData.disposables.add((0, event_1.domEvent)(dragHandle, DOM.EventType.DRAG_END)(() => {
                // Note, templateData may have a different element rendered into it by now
                container.classList.remove(exports.DRAGGING_CLASS);
                this.dragCleanup();
            }));
            templateData.disposables.add((0, event_1.domEvent)(dragHandle, DOM.EventType.DRAG_START)(event => {
                if (!event.dataTransfer) {
                    return;
                }
                this.currentDraggedCell = templateData.currentRenderedCell;
                this.currentDraggedCell.dragging = true;
                const dragImage = dragImageProvider();
                cellRoot.parentElement.appendChild(dragImage);
                event.dataTransfer.setDragImage(dragImage, 0, 0);
                setTimeout(() => cellRoot.parentElement.removeChild(dragImage), 0); // Comment this out to debug drag image layout
                container.classList.add(exports.DRAGGING_CLASS);
            }));
        }
        startExplicitDrag(cell, position) {
            this.currentDraggedCell = cell;
            this.setInsertIndicatorVisibility(true);
        }
        explicitDrag(cell, position) {
            const target = this.list.elementAt(position.clientY);
            if (target && target !== cell) {
                const cellTop = this.list.getAbsoluteTopOfElement(target);
                const cellHeight = this.list.elementHeight(target);
                const dropDirection = this.getExplicitDragDropDirection(position.clientY, cellTop, cellHeight);
                const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
                this.updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos);
            }
            // Try scrolling list if needed
            if (this.currentDraggedCell !== cell) {
                return;
            }
            const viewRect = this.notebookEditor.getDomNode().getBoundingClientRect();
            const eventPositionInView = position.clientY - this.list.scrollTop;
            const scrollMargin = 0.2;
            const maxScrollPerFrame = 20;
            const eventPositionRatio = eventPositionInView / viewRect.height;
            if (eventPositionRatio < scrollMargin) {
                this.list.scrollTop -= maxScrollPerFrame * (1 - eventPositionRatio / scrollMargin);
            }
            else if (eventPositionRatio > 1 - scrollMargin) {
                this.list.scrollTop += maxScrollPerFrame * (1 - ((1 - eventPositionRatio) / scrollMargin));
            }
        }
        endExplicitDrag(_cell) {
            this.setInsertIndicatorVisibility(false);
        }
        explicitDrop(cell, ctx) {
            this.currentDraggedCell = undefined;
            this.setInsertIndicatorVisibility(false);
            const target = this.list.elementAt(ctx.clientY);
            if (!target || target === cell) {
                return;
            }
            const cellTop = this.list.getAbsoluteTopOfElement(target);
            const cellHeight = this.list.elementHeight(target);
            const dropDirection = this.getExplicitDragDropDirection(ctx.clientY, cellTop, cellHeight);
            this._dropImpl(cell, dropDirection, ctx, target);
        }
        getExplicitDragDropDirection(clientY, cellTop, cellHeight) {
            const dragOffset = this.list.scrollTop + clientY;
            const dragPosInElement = dragOffset - cellTop;
            const dragPosRatio = dragPosInElement / cellHeight;
            return this.getDropInsertDirection(dragPosRatio);
        }
    }
    exports.CellDragAndDropController = CellDragAndDropController;
});
//# sourceMappingURL=cellDnd.js.map