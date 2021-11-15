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
define(["require", "exports", "vs/base/common/event", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/notebook/browser/viewModel/markdownCellViewModel", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/services/resolverService"], function (require, exports, event_1, UUID, nls, configuration_1, constants_1, notebookBrowser_1, baseCellViewModel_1, eventDispatcher_1, notebookCommon_1, resolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkdownCellViewModel = void 0;
    let MarkdownCellViewModel = class MarkdownCellViewModel extends baseCellViewModel_1.BaseCellViewModel {
        constructor(viewType, model, initialNotebookLayoutInfo, foldingDelegate, eventDispatcher, _mdRenderer, configurationService, textModelService) {
            super(viewType, model, UUID.generateUuid(), configurationService, textModelService);
            this.foldingDelegate = foldingDelegate;
            this.eventDispatcher = eventDispatcher;
            this._mdRenderer = _mdRenderer;
            this.cellKind = notebookCommon_1.CellKind.Markdown;
            this._html = null;
            this._editorHeight = 0;
            this._onDidChangeLayout = new event_1.Emitter();
            this.onDidChangeLayout = this._onDidChangeLayout.event;
            this._hoveringOutput = false;
            this._focusOnOutput = false;
            this._hoveringCell = false;
            this._onDidHideInput = new event_1.Emitter();
            this.onDidHideInput = this._onDidHideInput.event;
            /**
             * we put outputs stuff here to make compiler happy
             */
            this.outputsViewModels = [];
            this._hasFindResult = this._register(new event_1.Emitter());
            this.hasFindResult = this._hasFindResult.event;
            this._layoutInfo = {
                editorHeight: 0,
                fontInfo: (initialNotebookLayoutInfo === null || initialNotebookLayoutInfo === void 0 ? void 0 : initialNotebookLayoutInfo.fontInfo) || null,
                editorWidth: (initialNotebookLayoutInfo === null || initialNotebookLayoutInfo === void 0 ? void 0 : initialNotebookLayoutInfo.width) ? this.computeEditorWidth(initialNotebookLayoutInfo.width) : 0,
                bottomToolbarOffset: constants_1.BOTTOM_CELL_TOOLBAR_GAP,
                totalHeight: 0
            };
            this._register(this.onDidChangeState(e => {
                eventDispatcher.emit([new eventDispatcher_1.NotebookCellStateChangedEvent(e, this)]);
            }));
            this._register(model.onDidChangeMetadata(e => {
                var _a;
                if ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed) {
                    this._onDidHideInput.fire();
                }
            }));
        }
        get layoutInfo() {
            return this._layoutInfo;
        }
        set renderedMarkdownHeight(newHeight) {
            if (this.getEditState() === notebookBrowser_1.CellEditState.Preview) {
                const newTotalHeight = newHeight + constants_1.BOTTOM_CELL_TOOLBAR_GAP;
                this.totalHeight = newTotalHeight;
            }
        }
        set totalHeight(newHeight) {
            if (newHeight !== this.layoutInfo.totalHeight) {
                this.layoutChange({ totalHeight: newHeight });
            }
        }
        get totalHeight() {
            throw new Error('MarkdownCellViewModel.totalHeight is write only');
        }
        set editorHeight(newHeight) {
            this._editorHeight = newHeight;
            this.totalHeight = this._editorHeight + constants_1.MARKDOWN_CELL_TOP_MARGIN + constants_1.MARKDOWN_CELL_BOTTOM_MARGIN + constants_1.BOTTOM_CELL_TOOLBAR_GAP + this.getEditorStatusbarHeight();
        }
        get editorHeight() {
            throw new Error('MarkdownCellViewModel.editorHeight is write only');
        }
        get foldingState() {
            return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this));
        }
        get outputIsHovered() {
            return this._hoveringOutput;
        }
        set outputIsHovered(v) {
            this._hoveringOutput = v;
        }
        get outputIsFocused() {
            return this._focusOnOutput;
        }
        set outputIsFocused(v) {
            this._focusOnOutput = v;
        }
        get cellIsHovered() {
            return this._hoveringCell;
        }
        set cellIsHovered(v) {
            this._hoveringCell = v;
            this._onDidChangeState.fire({ cellIsHoveredChanged: true });
        }
        get contentHash() {
            return this.model.getHashValue();
        }
        getOutputOffset(index) {
            // throw new Error('Method not implemented.');
            return -1;
        }
        updateOutputHeight(index, height) {
            // throw new Error('Method not implemented.');
        }
        triggerfoldingStateChange() {
            this._onDidChangeState.fire({ foldingStateChanged: true });
        }
        computeEditorWidth(outerWidth) {
            return outerWidth - constants_1.CODE_CELL_LEFT_MARGIN - constants_1.CELL_RIGHT_MARGIN;
        }
        layoutChange(state) {
            // recompute
            var _a;
            if (!((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed)) {
                const editorWidth = state.outerWidth !== undefined ? this.computeEditorWidth(state.outerWidth) : this._layoutInfo.editorWidth;
                const totalHeight = state.totalHeight === undefined ? this._layoutInfo.totalHeight : state.totalHeight;
                this._layoutInfo = {
                    fontInfo: state.font || this._layoutInfo.fontInfo,
                    editorWidth,
                    editorHeight: this._editorHeight,
                    bottomToolbarOffset: totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT / 2,
                    totalHeight
                };
            }
            else {
                const editorWidth = state.outerWidth !== undefined ? this.computeEditorWidth(state.outerWidth) : this._layoutInfo.editorWidth;
                const totalHeight = constants_1.MARKDOWN_CELL_TOP_MARGIN + constants_1.COLLAPSED_INDICATOR_HEIGHT + constants_1.BOTTOM_CELL_TOOLBAR_GAP + constants_1.MARKDOWN_CELL_BOTTOM_MARGIN;
                state.totalHeight = totalHeight;
                this._layoutInfo = {
                    fontInfo: state.font || this._layoutInfo.fontInfo,
                    editorWidth,
                    editorHeight: this._editorHeight,
                    bottomToolbarOffset: totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT / 2,
                    totalHeight
                };
            }
            this._onDidChangeLayout.fire(state);
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            super.restoreEditorViewState(editorViewStates);
            // we might already warmup the viewport so the cell has a total height computed
            if (totalHeight !== undefined && this._layoutInfo.totalHeight === 0) {
                this._layoutInfo = {
                    fontInfo: this._layoutInfo.fontInfo,
                    editorWidth: this._layoutInfo.editorWidth,
                    bottomToolbarOffset: this._layoutInfo.bottomToolbarOffset,
                    totalHeight: totalHeight,
                    editorHeight: this._editorHeight
                };
                this.layoutChange({});
            }
        }
        hasDynamicHeight() {
            return false;
        }
        getHeight(lineHeight) {
            if (this._layoutInfo.totalHeight === 0) {
                return 100;
            }
            else {
                return this._layoutInfo.totalHeight;
            }
        }
        clearHTML() {
            this._html = null;
        }
        getHTML() {
            if (this.cellKind === notebookCommon_1.CellKind.Markdown) {
                if (this._html) {
                    return this._html;
                }
                const renderer = this.getMarkdownRenderer();
                const text = this.getText();
                if (text.length === 0) {
                    const el = document.createElement('p');
                    el.className = 'emptyMarkdownPlaceholder';
                    el.innerText = nls.localize(0, null);
                    this._html = el;
                }
                else {
                    this._html = renderer.render({ value: this.getText(), isTrusted: true }, undefined, { gfm: true }).element;
                }
                return this._html;
            }
            return null;
        }
        onDidChangeTextModelContent() {
            this._html = null;
            this._onDidChangeState.fire({ contentChanged: true });
        }
        onDeselect() {
        }
        getMarkdownRenderer() {
            return this._mdRenderer;
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
    MarkdownCellViewModel = __decorate([
        __param(6, configuration_1.IConfigurationService),
        __param(7, resolverService_1.ITextModelService)
    ], MarkdownCellViewModel);
    exports.MarkdownCellViewModel = MarkdownCellViewModel;
});
//# sourceMappingURL=markdownCellViewModel.js.map