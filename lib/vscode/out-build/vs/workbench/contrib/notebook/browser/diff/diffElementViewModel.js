/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/editor/browser/widget/diffEditorWidget", "vs/base/common/hash", "vs/base/common/jsonFormatter", "vs/base/common/jsonEdit", "vs/workbench/contrib/notebook/browser/diff/eventDispatcher"], function (require, exports, event_1, lifecycle_1, notebookDiffEditorBrowser_1, diffEditorWidget_1, hash_1, jsonFormatter_1, jsonEdit_1, eventDispatcher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFormatedMetadataJSON = exports.SingleSideDiffElementViewModel = exports.SideBySideDiffElementViewModel = exports.DiffElementViewModelBase = exports.OUTPUT_EDITOR_HEIGHT_MAGIC = exports.PropertyFoldingState = void 0;
    var PropertyFoldingState;
    (function (PropertyFoldingState) {
        PropertyFoldingState[PropertyFoldingState["Expanded"] = 0] = "Expanded";
        PropertyFoldingState[PropertyFoldingState["Collapsed"] = 1] = "Collapsed";
    })(PropertyFoldingState = exports.PropertyFoldingState || (exports.PropertyFoldingState = {}));
    exports.OUTPUT_EDITOR_HEIGHT_MAGIC = 1440;
    class DiffElementViewModelBase extends lifecycle_1.Disposable {
        constructor(mainDocumentTextModel, original, modified, type, editorEventDispatcher) {
            super();
            this.mainDocumentTextModel = mainDocumentTextModel;
            this.original = original;
            this.modified = modified;
            this.type = type;
            this.editorEventDispatcher = editorEventDispatcher;
            this._layoutInfoEmitter = new event_1.Emitter();
            this.onDidLayoutChange = this._layoutInfoEmitter.event;
            this._stateChangeEmitter = new event_1.Emitter();
            this.onDidStateChange = this._stateChangeEmitter.event;
            this._renderOutput = true;
            this._sourceEditorViewState = null;
            this._outputEditorViewState = null;
            this._metadataEditorViewState = null;
            this._layoutInfo = {
                width: 0,
                editorHeight: 0,
                editorMargin: 0,
                metadataHeight: 0,
                metadataStatusHeight: 25,
                rawOutputHeight: 0,
                outputTotalHeight: 0,
                outputStatusHeight: 25,
                bodyMargin: 32,
                totalHeight: 82
            };
            this.metadataFoldingState = PropertyFoldingState.Collapsed;
            this.outputFoldingState = PropertyFoldingState.Collapsed;
            this._register(this.editorEventDispatcher.onDidChangeLayout(e => {
                this._layoutInfoEmitter.fire({ outerWidth: true });
            }));
        }
        set rawOutputHeight(height) {
            this._layout({ rawOutputHeight: Math.min(exports.OUTPUT_EDITOR_HEIGHT_MAGIC, height) });
        }
        get rawOutputHeight() {
            throw new Error('Use Cell.layoutInfo.rawOutputHeight');
        }
        set outputStatusHeight(height) {
            this._layout({ outputStatusHeight: height });
        }
        get outputStatusHeight() {
            throw new Error('Use Cell.layoutInfo.outputStatusHeight');
        }
        set editorHeight(height) {
            this._layout({ editorHeight: height });
        }
        get editorHeight() {
            throw new Error('Use Cell.layoutInfo.editorHeight');
        }
        set editorMargin(margin) {
            this._layout({ editorMargin: margin });
        }
        get editorMargin() {
            throw new Error('Use Cell.layoutInfo.editorMargin');
        }
        set metadataStatusHeight(height) {
            this._layout({ metadataStatusHeight: height });
        }
        get metadataStatusHeight() {
            throw new Error('Use Cell.layoutInfo.outputStatusHeight');
        }
        set metadataHeight(height) {
            this._layout({ metadataHeight: height });
        }
        get metadataHeight() {
            throw new Error('Use Cell.layoutInfo.metadataHeight');
        }
        set renderOutput(value) {
            this._renderOutput = value;
            this._layout({ recomputeOutput: true });
            this._stateChangeEmitter.fire({ renderOutput: this._renderOutput });
        }
        get renderOutput() {
            return this._renderOutput;
        }
        get layoutInfo() {
            return this._layoutInfo;
        }
        layoutChange() {
            this._layout({ recomputeOutput: true });
        }
        _layout(delta) {
            const width = delta.width !== undefined ? delta.width : this._layoutInfo.width;
            const editorHeight = delta.editorHeight !== undefined ? delta.editorHeight : this._layoutInfo.editorHeight;
            const editorMargin = delta.editorMargin !== undefined ? delta.editorMargin : this._layoutInfo.editorMargin;
            const metadataHeight = delta.metadataHeight !== undefined ? delta.metadataHeight : this._layoutInfo.metadataHeight;
            const metadataStatusHeight = delta.metadataStatusHeight !== undefined ? delta.metadataStatusHeight : this._layoutInfo.metadataStatusHeight;
            const rawOutputHeight = delta.rawOutputHeight !== undefined ? delta.rawOutputHeight : this._layoutInfo.rawOutputHeight;
            const outputStatusHeight = delta.outputStatusHeight !== undefined ? delta.outputStatusHeight : this._layoutInfo.outputStatusHeight;
            const bodyMargin = delta.bodyMargin !== undefined ? delta.bodyMargin : this._layoutInfo.bodyMargin;
            const outputHeight = (delta.recomputeOutput || delta.rawOutputHeight !== undefined) ? this._getOutputTotalHeight(rawOutputHeight) : this._layoutInfo.outputTotalHeight;
            const totalHeight = editorHeight
                + editorMargin
                + metadataHeight
                + metadataStatusHeight
                + outputHeight
                + outputStatusHeight
                + bodyMargin;
            const newLayout = {
                width: width,
                editorHeight: editorHeight,
                editorMargin: editorMargin,
                metadataHeight: metadataHeight,
                metadataStatusHeight: metadataStatusHeight,
                outputTotalHeight: outputHeight,
                outputStatusHeight: outputStatusHeight,
                bodyMargin: bodyMargin,
                rawOutputHeight: rawOutputHeight,
                totalHeight: totalHeight
            };
            const changeEvent = {};
            if (newLayout.width !== this._layoutInfo.width) {
                changeEvent.width = true;
            }
            if (newLayout.editorHeight !== this._layoutInfo.editorHeight) {
                changeEvent.editorHeight = true;
            }
            if (newLayout.editorMargin !== this._layoutInfo.editorMargin) {
                changeEvent.editorMargin = true;
            }
            if (newLayout.metadataHeight !== this._layoutInfo.metadataHeight) {
                changeEvent.metadataHeight = true;
            }
            if (newLayout.metadataStatusHeight !== this._layoutInfo.metadataStatusHeight) {
                changeEvent.metadataStatusHeight = true;
            }
            if (newLayout.outputTotalHeight !== this._layoutInfo.outputTotalHeight) {
                changeEvent.outputTotalHeight = true;
            }
            if (newLayout.outputStatusHeight !== this._layoutInfo.outputStatusHeight) {
                changeEvent.outputStatusHeight = true;
            }
            if (newLayout.bodyMargin !== this._layoutInfo.bodyMargin) {
                changeEvent.bodyMargin = true;
            }
            if (newLayout.totalHeight !== this._layoutInfo.totalHeight) {
                changeEvent.totalHeight = true;
            }
            this._layoutInfo = newLayout;
            this._fireLayoutChangeEvent(changeEvent);
        }
        _getOutputTotalHeight(rawOutputHeight) {
            if (this.outputFoldingState === PropertyFoldingState.Collapsed) {
                return 0;
            }
            if (this.renderOutput) {
                if (this.isOutputEmpty()) {
                    // single line;
                    return 24;
                }
                return this.getRichOutputTotalHeight();
            }
            else {
                return rawOutputHeight;
            }
        }
        _fireLayoutChangeEvent(state) {
            this._layoutInfoEmitter.fire(state);
            this.editorEventDispatcher.emit([{ type: eventDispatcher_1.NotebookDiffViewEventType.CellLayoutChanged, source: this._layoutInfo }]);
        }
        getComputedCellContainerWidth(layoutInfo, diffEditor, fullWidth) {
            if (fullWidth) {
                return layoutInfo.width - 2 * notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN + (diffEditor ? diffEditorWidget_1.DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0) - 2;
            }
            return (layoutInfo.width - 2 * notebookDiffEditorBrowser_1.DIFF_CELL_MARGIN + (diffEditor ? diffEditorWidget_1.DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)) / 2 - 18 - 2;
        }
        getOutputEditorViewState() {
            return this._outputEditorViewState;
        }
        saveOutputEditorViewState(viewState) {
            this._outputEditorViewState = viewState;
        }
        getMetadataEditorViewState() {
            return this._metadataEditorViewState;
        }
        saveMetadataEditorViewState(viewState) {
            this._metadataEditorViewState = viewState;
        }
        getSourceEditorViewState() {
            return this._sourceEditorViewState;
        }
        saveSpirceEditorViewState(viewState) {
            this._sourceEditorViewState = viewState;
        }
    }
    exports.DiffElementViewModelBase = DiffElementViewModelBase;
    class SideBySideDiffElementViewModel extends DiffElementViewModelBase {
        constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher) {
            super(mainDocumentTextModel, original, modified, type, editorEventDispatcher);
            this.otherDocumentTextModel = otherDocumentTextModel;
            this.original = original;
            this.modified = modified;
            this.type = type;
            this.metadataFoldingState = PropertyFoldingState.Collapsed;
            this.outputFoldingState = PropertyFoldingState.Collapsed;
            if (this.checkMetadataIfModified()) {
                this.metadataFoldingState = PropertyFoldingState.Expanded;
            }
            if (this.checkIfOutputsModified()) {
                this.outputFoldingState = PropertyFoldingState.Expanded;
            }
            this._register(this.original.onDidChangeOutputLayout(() => {
                this._layout({ recomputeOutput: true });
            }));
            this._register(this.modified.onDidChangeOutputLayout(() => {
                this._layout({ recomputeOutput: true });
            }));
        }
        get originalDocument() {
            return this.otherDocumentTextModel;
        }
        get modifiedDocument() {
            return this.mainDocumentTextModel;
        }
        checkIfOutputsModified() {
            var _a, _b, _c, _d;
            return !this.mainDocumentTextModel.transientOptions.transientOutputs && (0, hash_1.hash)((_b = (_a = this.original) === null || _a === void 0 ? void 0 : _a.outputs.map(op => op.outputs)) !== null && _b !== void 0 ? _b : []) !== (0, hash_1.hash)((_d = (_c = this.modified) === null || _c === void 0 ? void 0 : _c.outputs.map(op => op.outputs)) !== null && _d !== void 0 ? _d : []);
        }
        checkMetadataIfModified() {
            var _a, _b, _c, _d, _e;
            return (0, hash_1.hash)(getFormatedMetadataJSON(this.mainDocumentTextModel, ((_a = this.original) === null || _a === void 0 ? void 0 : _a.metadata) || {}, (_b = this.original) === null || _b === void 0 ? void 0 : _b.language)) !== (0, hash_1.hash)(getFormatedMetadataJSON(this.mainDocumentTextModel, (_d = (_c = this.modified) === null || _c === void 0 ? void 0 : _c.metadata) !== null && _d !== void 0 ? _d : {}, (_e = this.modified) === null || _e === void 0 ? void 0 : _e.language));
        }
        updateOutputHeight(diffSide, index, height) {
            if (diffSide === notebookDiffEditorBrowser_1.DiffSide.Original) {
                this.original.updateOutputHeight(index, height);
            }
            else {
                this.modified.updateOutputHeight(index, height);
            }
        }
        getOutputOffsetInContainer(diffSide, index) {
            if (diffSide === notebookDiffEditorBrowser_1.DiffSide.Original) {
                return this.original.getOutputOffset(index);
            }
            else {
                return this.modified.getOutputOffset(index);
            }
        }
        getOutputOffsetInCell(diffSide, index) {
            const offsetInOutputsContainer = this.getOutputOffsetInContainer(diffSide, index);
            return this._layoutInfo.editorHeight
                + this._layoutInfo.editorMargin
                + this._layoutInfo.metadataHeight
                + this._layoutInfo.metadataStatusHeight
                + this._layoutInfo.outputStatusHeight
                + this._layoutInfo.bodyMargin / 2
                + offsetInOutputsContainer;
        }
        isOutputEmpty() {
            var _a;
            if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
                return true;
            }
            if (this.checkIfOutputsModified()) {
                return false;
            }
            // outputs are not changed
            return (((_a = this.original) === null || _a === void 0 ? void 0 : _a.outputs) || []).length === 0;
        }
        getRichOutputTotalHeight() {
            return Math.max(this.original.getOutputTotalHeight(), this.modified.getOutputTotalHeight());
        }
        getNestedCellViewModel(diffSide) {
            return diffSide === notebookDiffEditorBrowser_1.DiffSide.Original ? this.original : this.modified;
        }
        getCellByUri(cellUri) {
            if (cellUri.toString() === this.original.uri.toString()) {
                return this.original;
            }
            else {
                return this.modified;
            }
        }
    }
    exports.SideBySideDiffElementViewModel = SideBySideDiffElementViewModel;
    class SingleSideDiffElementViewModel extends DiffElementViewModelBase {
        constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher) {
            super(mainDocumentTextModel, original, modified, type, editorEventDispatcher);
            this.otherDocumentTextModel = otherDocumentTextModel;
            this.type = type;
            this._register(this.cellViewModel.onDidChangeOutputLayout(() => {
                this._layout({ recomputeOutput: true });
            }));
        }
        get cellViewModel() {
            return this.type === 'insert' ? this.modified : this.original;
        }
        get originalDocument() {
            if (this.type === 'insert') {
                return this.otherDocumentTextModel;
            }
            else {
                return this.mainDocumentTextModel;
            }
        }
        get modifiedDocument() {
            if (this.type === 'insert') {
                return this.mainDocumentTextModel;
            }
            else {
                return this.otherDocumentTextModel;
            }
        }
        getNestedCellViewModel(diffSide) {
            return this.type === 'insert' ? this.modified : this.original;
        }
        checkIfOutputsModified() {
            return false;
        }
        checkMetadataIfModified() {
            return false;
        }
        updateOutputHeight(diffSide, index, height) {
            var _a;
            (_a = this.cellViewModel) === null || _a === void 0 ? void 0 : _a.updateOutputHeight(index, height);
        }
        getOutputOffsetInContainer(diffSide, index) {
            return this.cellViewModel.getOutputOffset(index);
        }
        getOutputOffsetInCell(diffSide, index) {
            const offsetInOutputsContainer = this.cellViewModel.getOutputOffset(index);
            return this._layoutInfo.editorHeight
                + this._layoutInfo.editorMargin
                + this._layoutInfo.metadataHeight
                + this._layoutInfo.metadataStatusHeight
                + this._layoutInfo.outputStatusHeight
                + this._layoutInfo.bodyMargin / 2
                + offsetInOutputsContainer;
        }
        isOutputEmpty() {
            var _a, _b;
            if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
                return true;
            }
            // outputs are not changed
            return (((_a = this.original) === null || _a === void 0 ? void 0 : _a.outputs) || ((_b = this.modified) === null || _b === void 0 ? void 0 : _b.outputs) || []).length === 0;
        }
        getRichOutputTotalHeight() {
            var _a, _b;
            return (_b = (_a = this.cellViewModel) === null || _a === void 0 ? void 0 : _a.getOutputTotalHeight()) !== null && _b !== void 0 ? _b : 0;
        }
        getCellByUri(cellUri) {
            return this.cellViewModel;
        }
    }
    exports.SingleSideDiffElementViewModel = SingleSideDiffElementViewModel;
    function getFormatedMetadataJSON(documentTextModel, metadata, language) {
        let filteredMetadata = {};
        if (documentTextModel) {
            const transientCellMetadata = documentTextModel.transientOptions.transientCellMetadata;
            const keys = new Set([...Object.keys(metadata)]);
            for (let key of keys) {
                if (!(transientCellMetadata[key])) {
                    filteredMetadata[key] = metadata[key];
                }
            }
        }
        else {
            filteredMetadata = metadata;
        }
        const content = JSON.stringify(Object.assign({ language }, filteredMetadata));
        const edits = (0, jsonFormatter_1.format)(content, undefined, {});
        const metadataSource = (0, jsonEdit_1.applyEdits)(content, edits);
        return metadataSource;
    }
    exports.getFormatedMetadataJSON = getFormatedMetadataJSON;
});
//# sourceMappingURL=diffElementViewModel.js.map