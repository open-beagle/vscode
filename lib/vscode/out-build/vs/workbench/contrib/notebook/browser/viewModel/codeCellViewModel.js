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
define(["require", "exports", "vs/base/common/event", "vs/base/common/uuid", "vs/editor/common/services/resolverService", "vs/editor/common/viewModel/prefixSumComputer", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/cellOutputViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "./baseCellViewModel"], function (require, exports, event_1, UUID, resolverService_1, prefixSumComputer_1, configuration_1, constants_1, notebookBrowser_1, cellOutputViewModel_1, notebookCommon_1, notebookService_1, baseCellViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeCellViewModel = void 0;
    let CodeCellViewModel = class CodeCellViewModel extends baseCellViewModel_1.BaseCellViewModel {
        constructor(viewType, model, initialNotebookLayoutInfo, eventDispatcher, configurationService, _notebookService, modelService) {
            super(viewType, model, UUID.generateUuid(), configurationService, modelService);
            this.eventDispatcher = eventDispatcher;
            this._notebookService = _notebookService;
            this.cellKind = notebookCommon_1.CellKind.Code;
            this._onDidChangeOutputs = new event_1.Emitter();
            this.onDidChangeOutputs = this._onDidChangeOutputs.event;
            this._onDidRemoveOutputs = new event_1.Emitter();
            this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
            this._onDidHideInput = new event_1.Emitter();
            this.onDidHideInput = this._onDidHideInput.event;
            this._onDidHideOutputs = new event_1.Emitter();
            this.onDidHideOutputs = this._onDidHideOutputs.event;
            this._outputCollection = [];
            this._outputsTop = null;
            this._onDidChangeLayout = new event_1.Emitter();
            this.onDidChangeLayout = this._onDidChangeLayout.event;
            this._editorHeight = 0;
            this._hoveringOutput = false;
            this._focusOnOutput = false;
            this._outputMinHeight = 0;
            this._hasFindResult = this._register(new event_1.Emitter());
            this.hasFindResult = this._hasFindResult.event;
            this._outputViewModels = this.model.outputs.map(output => new cellOutputViewModel_1.CellOutputViewModel(this, output, this._notebookService));
            this._register(this.model.onDidChangeOutputs((splices) => {
                const removedOutputs = [];
                splices.reverse().forEach(splice => {
                    this._outputCollection.splice(splice[0], splice[1], ...splice[2].map(() => 0));
                    removedOutputs.push(...this._outputViewModels.splice(splice[0], splice[1], ...splice[2].map(output => new cellOutputViewModel_1.CellOutputViewModel(this, output, this._notebookService))));
                });
                this._outputsTop = null;
                this._onDidChangeOutputs.fire(splices);
                this._onDidRemoveOutputs.fire(removedOutputs);
                this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#model.onDidChangeOutputs');
            }));
            this._register(this.model.onDidChangeMetadata(e => {
                var _a, _b;
                if ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.outputCollapsed) {
                    this._onDidHideOutputs.fire(this.outputsViewModels.slice(0));
                }
                if ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.inputCollapsed) {
                    this._onDidHideInput.fire();
                }
            }));
            this._outputCollection = new Array(this.model.outputs.length);
            this._layoutInfo = {
                fontInfo: (initialNotebookLayoutInfo === null || initialNotebookLayoutInfo === void 0 ? void 0 : initialNotebookLayoutInfo.fontInfo) || null,
                editorHeight: 0,
                editorWidth: initialNotebookLayoutInfo ? this.computeEditorWidth(initialNotebookLayoutInfo.width) : 0,
                outputContainerOffset: 0,
                outputTotalHeight: 0,
                outputShowMoreContainerHeight: 0,
                outputShowMoreContainerOffset: 0,
                totalHeight: 0,
                indicatorHeight: 0,
                bottomToolbarOffset: 0,
                layoutState: notebookBrowser_1.CodeCellLayoutState.Uninitialized
            };
        }
        set editorHeight(height) {
            this._editorHeight = height;
            this.layoutChange({ editorHeight: true }, 'CodeCellViewModel#editorHeight');
        }
        get editorHeight() {
            throw new Error('editorHeight is write-only');
        }
        get outputIsHovered() {
            return this._hoveringOutput;
        }
        set outputIsHovered(v) {
            this._hoveringOutput = v;
            this._onDidChangeState.fire({ outputIsHoveredChanged: true });
        }
        get outputIsFocused() {
            return this._focusOnOutput;
        }
        set outputIsFocused(v) {
            this._focusOnOutput = v;
            this._onDidChangeState.fire({ outputIsFocusedChanged: true });
        }
        get outputMinHeight() {
            return this._outputMinHeight;
        }
        /**
         * The minimum height of the output region. It's only set to non-zero temporarily when replacing an output with a new one.
         * It's reset to 0 when the new output is rendered, or in one second.
         */
        set outputMinHeight(newMin) {
            this._outputMinHeight = newMin;
        }
        get layoutInfo() {
            return this._layoutInfo;
        }
        get outputsViewModels() {
            return this._outputViewModels;
        }
        computeEditorWidth(outerWidth) {
            return outerWidth - (constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER + constants_1.CELL_RIGHT_MARGIN);
        }
        layoutChange(state, source) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            // recompute
            this._ensureOutputsTop();
            const outputShowMoreContainerHeight = state.outputShowMoreContainerHeight ? state.outputShowMoreContainerHeight : this._layoutInfo.outputShowMoreContainerHeight;
            let outputTotalHeight = Math.max(this._outputMinHeight, ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.outputCollapsed) ? constants_1.COLLAPSED_INDICATOR_HEIGHT : this._outputsTop.getTotalValue());
            if (!((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.inputCollapsed)) {
                let newState;
                let editorHeight;
                let totalHeight;
                if (!state.editorHeight && this._layoutInfo.layoutState === notebookBrowser_1.CodeCellLayoutState.FromCache && !state.outputHeight) {
                    // No new editorHeight info - keep cached totalHeight and estimate editorHeight
                    editorHeight = this.estimateEditorHeight((_d = (_c = state.font) === null || _c === void 0 ? void 0 : _c.lineHeight) !== null && _d !== void 0 ? _d : (_e = this._layoutInfo.fontInfo) === null || _e === void 0 ? void 0 : _e.lineHeight);
                    totalHeight = this._layoutInfo.totalHeight;
                    newState = notebookBrowser_1.CodeCellLayoutState.FromCache;
                }
                else if (state.editorHeight || this._layoutInfo.layoutState === notebookBrowser_1.CodeCellLayoutState.Measured) {
                    // Editor has been measured
                    editorHeight = this._editorHeight;
                    totalHeight = this.computeTotalHeight(this._editorHeight, outputTotalHeight, outputShowMoreContainerHeight);
                    newState = notebookBrowser_1.CodeCellLayoutState.Measured;
                }
                else {
                    editorHeight = this.estimateEditorHeight((_g = (_f = state.font) === null || _f === void 0 ? void 0 : _f.lineHeight) !== null && _g !== void 0 ? _g : (_h = this._layoutInfo.fontInfo) === null || _h === void 0 ? void 0 : _h.lineHeight);
                    totalHeight = this.computeTotalHeight(editorHeight, outputTotalHeight, outputShowMoreContainerHeight);
                    newState = notebookBrowser_1.CodeCellLayoutState.Estimated;
                }
                const statusbarHeight = this.getEditorStatusbarHeight();
                const indicatorHeight = editorHeight + statusbarHeight + outputTotalHeight + outputShowMoreContainerHeight;
                const outputContainerOffset = constants_1.EDITOR_TOOLBAR_HEIGHT + constants_1.CELL_TOP_MARGIN + editorHeight + statusbarHeight;
                const outputShowMoreContainerOffset = totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT / 2 - outputShowMoreContainerHeight;
                const bottomToolbarOffset = totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT / 2;
                const editorWidth = state.outerWidth !== undefined ? this.computeEditorWidth(state.outerWidth) : (_j = this._layoutInfo) === null || _j === void 0 ? void 0 : _j.editorWidth;
                this._layoutInfo = {
                    fontInfo: (_l = (_k = state.font) !== null && _k !== void 0 ? _k : this._layoutInfo.fontInfo) !== null && _l !== void 0 ? _l : null,
                    editorHeight,
                    editorWidth,
                    outputContainerOffset,
                    outputTotalHeight,
                    outputShowMoreContainerHeight,
                    outputShowMoreContainerOffset,
                    totalHeight,
                    indicatorHeight,
                    bottomToolbarOffset,
                    layoutState: newState
                };
            }
            else {
                outputTotalHeight = Math.max(this._outputMinHeight, ((_m = this.metadata) === null || _m === void 0 ? void 0 : _m.inputCollapsed) && this.metadata.outputCollapsed ? 0 : outputTotalHeight);
                const indicatorHeight = constants_1.COLLAPSED_INDICATOR_HEIGHT + outputTotalHeight + outputShowMoreContainerHeight;
                const outputContainerOffset = constants_1.CELL_TOP_MARGIN + constants_1.COLLAPSED_INDICATOR_HEIGHT;
                const totalHeight = constants_1.CELL_TOP_MARGIN + constants_1.COLLAPSED_INDICATOR_HEIGHT + constants_1.CELL_BOTTOM_MARGIN + constants_1.BOTTOM_CELL_TOOLBAR_GAP + outputTotalHeight + outputShowMoreContainerHeight;
                const outputShowMoreContainerOffset = totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT / 2 - outputShowMoreContainerHeight;
                const bottomToolbarOffset = totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT / 2;
                const editorWidth = state.outerWidth !== undefined ? this.computeEditorWidth(state.outerWidth) : (_o = this._layoutInfo) === null || _o === void 0 ? void 0 : _o.editorWidth;
                this._layoutInfo = {
                    fontInfo: (_q = (_p = state.font) !== null && _p !== void 0 ? _p : this._layoutInfo.fontInfo) !== null && _q !== void 0 ? _q : null,
                    editorHeight: this._layoutInfo.editorHeight,
                    editorWidth,
                    outputContainerOffset,
                    outputTotalHeight,
                    outputShowMoreContainerHeight,
                    outputShowMoreContainerOffset,
                    totalHeight,
                    indicatorHeight,
                    bottomToolbarOffset,
                    layoutState: this._layoutInfo.layoutState
                };
            }
            if (state.editorHeight || state.outputHeight) {
                state.totalHeight = true;
            }
            state.source = source;
            this._fireOnDidChangeLayout(state);
        }
        _fireOnDidChangeLayout(state) {
            this._onDidChangeLayout.fire(state);
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            super.restoreEditorViewState(editorViewStates);
            if (totalHeight !== undefined && this._layoutInfo.layoutState !== notebookBrowser_1.CodeCellLayoutState.Measured) {
                this._layoutInfo = {
                    fontInfo: this._layoutInfo.fontInfo,
                    editorHeight: this._layoutInfo.editorHeight,
                    editorWidth: this._layoutInfo.editorWidth,
                    outputContainerOffset: this._layoutInfo.outputContainerOffset,
                    outputTotalHeight: this._layoutInfo.outputTotalHeight,
                    outputShowMoreContainerHeight: this._layoutInfo.outputShowMoreContainerHeight,
                    outputShowMoreContainerOffset: this._layoutInfo.outputShowMoreContainerOffset,
                    totalHeight: totalHeight,
                    indicatorHeight: this._layoutInfo.indicatorHeight,
                    bottomToolbarOffset: this._layoutInfo.bottomToolbarOffset,
                    layoutState: notebookBrowser_1.CodeCellLayoutState.FromCache
                };
            }
        }
        hasDynamicHeight() {
            // CodeCellVM always measures itself and controls its cell's height
            return false;
        }
        firstLine() {
            return this.getText().split('\n')[0];
        }
        getHeight(lineHeight) {
            if (this._layoutInfo.layoutState === notebookBrowser_1.CodeCellLayoutState.Uninitialized) {
                const editorHeight = this.estimateEditorHeight(lineHeight);
                return this.computeTotalHeight(editorHeight, 0, 0);
            }
            else {
                return this._layoutInfo.totalHeight;
            }
        }
        estimateEditorHeight(lineHeight = 20) {
            let hasScrolling = false;
            if (this.layoutInfo.fontInfo) {
                for (let i = 0; i < this.lineCount; i++) {
                    const max = this.textBuffer.getLineLastNonWhitespaceColumn(i + 1);
                    const estimatedWidth = max * (this.layoutInfo.fontInfo.typicalHalfwidthCharacterWidth + this.layoutInfo.fontInfo.letterSpacing);
                    if (estimatedWidth > this.layoutInfo.editorWidth) {
                        hasScrolling = true;
                        break;
                    }
                }
            }
            const verticalScrollbarHeight = hasScrolling ? 12 : 0; // take zoom level into account
            return this.lineCount * lineHeight + (0, notebookBrowser_1.getEditorTopPadding)() + constants_1.EDITOR_BOTTOM_PADDING + verticalScrollbarHeight;
        }
        computeTotalHeight(editorHeight, outputsTotalHeight, outputShowMoreContainerHeight) {
            return constants_1.EDITOR_TOOLBAR_HEIGHT + constants_1.CELL_TOP_MARGIN + editorHeight + this.getEditorStatusbarHeight() + outputsTotalHeight + outputShowMoreContainerHeight + constants_1.BOTTOM_CELL_TOOLBAR_GAP + constants_1.CELL_BOTTOM_MARGIN;
        }
        onDidChangeTextModelContent() {
            if (this.getEditState() !== notebookBrowser_1.CellEditState.Editing) {
                this.updateEditState(notebookBrowser_1.CellEditState.Editing, 'onDidChangeTextModelContent');
                this._onDidChangeState.fire({ contentChanged: true });
            }
        }
        onDeselect() {
            this.updateEditState(notebookBrowser_1.CellEditState.Preview, 'onDeselect');
        }
        updateOutputShowMoreContainerHeight(height) {
            this.layoutChange({ outputShowMoreContainerHeight: height }, 'CodeCellViewModel#updateOutputShowMoreContainerHeight');
        }
        updateOutputMinHeight(height) {
            this.outputMinHeight = height;
        }
        updateOutputHeight(index, height, source) {
            if (index >= this._outputCollection.length) {
                throw new Error('Output index out of range!');
            }
            this._ensureOutputsTop();
            this._outputCollection[index] = height;
            if (this._outputsTop.changeValue(index, height)) {
                this.layoutChange({ outputHeight: true }, source);
            }
        }
        getOutputOffsetInContainer(index) {
            this._ensureOutputsTop();
            if (index >= this._outputCollection.length) {
                throw new Error('Output index out of range!');
            }
            return this._outputsTop.getAccumulatedValue(index - 1);
        }
        getOutputOffset(index) {
            return this.layoutInfo.outputContainerOffset + this.getOutputOffsetInContainer(index);
        }
        spliceOutputHeights(start, deleteCnt, heights) {
            this._ensureOutputsTop();
            this._outputsTop.removeValues(start, deleteCnt);
            if (heights.length) {
                const values = new Uint32Array(heights.length);
                for (let i = 0; i < heights.length; i++) {
                    values[i] = heights[i];
                }
                this._outputsTop.insertValues(start, values);
            }
            this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#spliceOutputs');
        }
        _ensureOutputsTop() {
            if (!this._outputsTop) {
                const values = new Uint32Array(this._outputCollection.length);
                for (let i = 0; i < this._outputCollection.length; i++) {
                    values[i] = this._outputCollection[i];
                }
                this._outputsTop = new prefixSumComputer_1.PrefixSumComputer(values);
            }
        }
        startFind(value, options) {
            const matches = super.cellStartFind(value, options);
            if (matches === null) {
                return null;
            }
            return {
                cell: this,
                matches
            };
        }
    };
    CodeCellViewModel = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, notebookService_1.INotebookService),
        __param(6, resolverService_1.ITextModelService)
    ], CodeCellViewModel);
    exports.CodeCellViewModel = CodeCellViewModel;
});
//# sourceMappingURL=codeCellViewModel.js.map