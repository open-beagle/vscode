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
define(["require", "exports", "vs/base/browser/dom", "vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/cellOutput", "vs/base/browser/keyboardEvent", "vs/base/common/lifecycle", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/view/renderers/cellWidgets", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/browser/markdownRenderer", "vs/platform/opener/common/opener", "vs/workbench/services/textfile/common/textfiles", "vs/base/common/jsonFormatter", "vs/base/common/jsonEdit", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookIcons"], function (require, exports, DOM, nls, keyboardEvent_1, lifecycle_1, quickInput_1, cellWidgets_1, notebookCommon_1, notebookService_1, markdownRenderer_1, opener_1, textfiles_1, jsonFormatter_1, jsonEdit_1, themeService_1, notebookIcons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellOutputContainer = exports.CellOutputElement = void 0;
    const OUTPUT_COUNT_LIMIT = 500;
    class CellOutputElement extends lifecycle_1.Disposable {
        constructor(notebookEditor, notebookService, quickInputService, viewCell, outputContainer, output) {
            super();
            this.notebookEditor = notebookEditor;
            this.notebookService = notebookService;
            this.quickInputService = quickInputService;
            this.viewCell = viewCell;
            this.outputContainer = outputContainer;
            this.output = output;
            this.localDisposableStore = new lifecycle_1.DisposableStore();
            this.useDedicatedDOM = true;
            this._outputHeightTimer = null;
            this._register(this.output.model.onDidChangeData(() => {
                this.updateOutputRendering();
            }));
            this._register(this.localDisposableStore);
        }
        get domOffsetHeight() {
            if (this.useDedicatedDOM) {
                return this.domNode.offsetHeight;
            }
            else {
                return 0;
            }
        }
        detach() {
            var _a;
            if (this.domNode) {
                (_a = this.domNode.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this.domNode);
            }
        }
        updateDOMTop(top) {
            if (this.useDedicatedDOM) {
                if (this.domNode) {
                    this.domNode.style.top = `${top}px`;
                }
            }
        }
        updateOutputRendering() {
            var _a;
            if (!this.domNode) {
                return;
            }
            // user chooses another mimetype
            const index = this.viewCell.outputsViewModels.indexOf(this.output);
            const nextElement = this.domNode.nextElementSibling;
            this.localDisposableStore.clear();
            const element = this.domNode;
            if (element) {
                (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element);
                this.notebookEditor.removeInset(this.output);
            }
            // this.output.pickedMimeType = pick;
            this.render(index, nextElement);
            this.relayoutCell();
        }
        render(index, beforeElement) {
            var _a, _b, _c, _d;
            if (this.viewCell.metadata.outputCollapsed || !this.notebookEditor.hasModel()) {
                return undefined;
            }
            const notebookTextModel = this.notebookEditor.viewModel.notebookDocument;
            const [mimeTypes, pick] = this.output.resolveMimeTypes(notebookTextModel, (_a = this.notebookEditor.activeKernel) === null || _a === void 0 ? void 0 : _a.preloadProvides);
            if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                this.viewCell.updateOutputHeight(index, 0, 'CellOutputElement#noMimeType');
                return undefined;
            }
            const pickedMimeTypeRenderer = mimeTypes[pick];
            // Reuse output item div
            this.useDedicatedDOM = !(!beforeElement && this.output.supportAppend() && this.previousDivSupportAppend(pickedMimeTypeRenderer.mimeType));
            this.domNode = this.useDedicatedDOM ? DOM.$('.output-inner-container') : this.outputContainer.lastChild;
            this.domNode.setAttribute('output-mime-type', pickedMimeTypeRenderer.mimeType);
            if (mimeTypes.filter(mimeType => mimeType.isTrusted).length > 1) {
                this.attachMimetypeSwitcher(this.domNode, notebookTextModel, this.notebookEditor.activeKernel, mimeTypes);
            }
            const notebookUri = (_b = notebookCommon_1.CellUri.parse(this.viewCell.uri)) === null || _b === void 0 ? void 0 : _b.notebook;
            if (pickedMimeTypeRenderer.rendererId !== notebookCommon_1.BUILTIN_RENDERER_ID) {
                const renderer = this.notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                this.renderResult = renderer
                    ? { type: 2 /* Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType }
                    : this.notebookEditor.getOutputRenderer().render(this.output, this.domNode, pickedMimeTypeRenderer.mimeType, notebookUri);
            }
            else {
                this.renderResult = this.notebookEditor.getOutputRenderer().render(this.output, this.domNode, pickedMimeTypeRenderer.mimeType, notebookUri);
            }
            this.output.pickedMimeType = pick;
            if (!this.renderResult) {
                this.viewCell.updateOutputHeight(index, 0, 'CellOutputElement#renderResultUndefined');
                return undefined;
            }
            if (beforeElement) {
                this.outputContainer.insertBefore(this.domNode, beforeElement);
            }
            else if (this.useDedicatedDOM) {
                this.outputContainer.appendChild(this.domNode);
            }
            if (this.renderResult.type !== 0 /* Mainframe */) {
                this.notebookEditor.createOutput(this.viewCell, this.renderResult, this.viewCell.getOutputOffset(index));
                this.domNode.classList.add('background');
            }
            else {
                this.domNode.classList.add('foreground', 'output-element');
                this.domNode.style.position = 'absolute';
            }
            if (this.renderResult.type === 1 /* Html */ || this.renderResult.type === 2 /* Extension */) {
                // the output is rendered in the webview, which has resize listener internally
                // no-op
                return { initRenderIsSynchronous: false };
            }
            if (!this.useDedicatedDOM) {
                // we only support text streaming, which is sync.
                return { initRenderIsSynchronous: true };
            }
            // let's use resize listener for them
            const offsetHeight = ((_c = this.renderResult) === null || _c === void 0 ? void 0 : _c.initHeight) !== undefined ? (_d = this.renderResult) === null || _d === void 0 ? void 0 : _d.initHeight : Math.ceil(this.domNode.offsetHeight);
            const dimension = {
                width: this.viewCell.layoutInfo.editorWidth,
                height: offsetHeight
            };
            this.bindResizeListener(dimension);
            this.viewCell.updateOutputHeight(index, offsetHeight, 'CellOutputElement#renderResultInitHeight');
            const top = this.viewCell.getOutputOffsetInContainer(index);
            this.domNode.style.top = `${top}px`;
            return { initRenderIsSynchronous: true };
        }
        bindResizeListener(dimension) {
            const elementSizeObserver = (0, cellWidgets_1.getResizesObserver)(this.domNode, dimension, () => {
                if (this.outputContainer && document.body.contains(this.outputContainer)) {
                    const height = this.domNode.offsetHeight;
                    if (dimension.height === height) {
                        return;
                    }
                    const currIndex = this.viewCell.outputsViewModels.indexOf(this.output);
                    if (currIndex < 0) {
                        return;
                    }
                    dimension = {
                        width: this.viewCell.layoutInfo.editorWidth,
                        height: height
                    };
                    this._validateFinalOutputHeight(true);
                    this.viewCell.updateOutputHeight(currIndex, height, 'CellOutputElement#outputResize');
                    this.relayoutCell();
                }
            });
            elementSizeObserver.startObserving();
            this.localDisposableStore.add(elementSizeObserver);
        }
        previousDivSupportAppend(mimeType) {
            const lastChild = this.outputContainer.lastChild;
            if (lastChild) {
                return lastChild.getAttribute('output-mime-type') === mimeType;
            }
            return false;
        }
        async attachMimetypeSwitcher(outputItemDiv, notebookTextModel, kernel, mimeTypes) {
            outputItemDiv.style.position = 'relative';
            const mimeTypePicker = DOM.$('.multi-mimetype-output');
            mimeTypePicker.classList.add(...themeService_1.ThemeIcon.asClassNameArray(notebookIcons_1.mimetypeIcon));
            mimeTypePicker.tabIndex = 0;
            mimeTypePicker.title = nls.localize(0, null, mimeTypes.map(mimeType => mimeType.mimeType).join(', '));
            outputItemDiv.appendChild(mimeTypePicker);
            this.localDisposableStore.add(DOM.addStandardDisposableListener(mimeTypePicker, 'mousedown', async (e) => {
                if (e.leftButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.pickActiveMimeTypeRenderer(notebookTextModel, kernel, this.output);
                }
            }));
            this.localDisposableStore.add((DOM.addDisposableListener(mimeTypePicker, DOM.EventType.KEY_DOWN, async (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if ((event.equals(3 /* Enter */) || event.equals(10 /* Space */))) {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.pickActiveMimeTypeRenderer(notebookTextModel, kernel, this.output);
                }
            })));
        }
        async pickActiveMimeTypeRenderer(notebookTextModel, kernel, viewModel) {
            var _a;
            const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, kernel === null || kernel === void 0 ? void 0 : kernel.preloadProvides);
            let items = [];
            mimeTypes.forEach((mimeType, index) => {
                if (mimeType.isTrusted) {
                    items.push({
                        label: mimeType.mimeType,
                        id: mimeType.mimeType,
                        index: index,
                        picked: index === currIndex,
                        detail: this.generateRendererInfo(mimeType.rendererId),
                        description: index === currIndex ? nls.localize(1, null) : undefined
                    });
                }
            });
            const picker = this.quickInputService.createQuickPick();
            picker.items = items;
            picker.activeItems = items.filter(item => !!item.picked);
            picker.placeholder = items.length !== mimeTypes.length
                ? nls.localize(2, null)
                : nls.localize(3, null);
            const pick = await new Promise(resolve => {
                picker.onDidAccept(() => {
                    resolve(picker.selectedItems.length === 1 ? picker.selectedItems[0] : undefined);
                    picker.dispose();
                });
                picker.show();
            });
            if (pick === undefined || pick.index === currIndex) {
                return;
            }
            // user chooses another mimetype
            const index = this.viewCell.outputsViewModels.indexOf(viewModel);
            const nextElement = this.domNode.nextElementSibling;
            this.localDisposableStore.clear();
            const element = this.domNode;
            if (element) {
                (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element);
                this.notebookEditor.removeInset(viewModel);
            }
            viewModel.pickedMimeType = pick.index;
            this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
            const { mimeType, rendererId } = mimeTypes[pick.index];
            this.notebookService.updateMimePreferredRenderer(mimeType, rendererId);
            this.render(index, nextElement);
            this._validateFinalOutputHeight(false);
            this.relayoutCell();
        }
        generateRendererInfo(renderId) {
            if (renderId === undefined || renderId === notebookCommon_1.BUILTIN_RENDERER_ID) {
                return nls.localize(4, null);
            }
            const renderInfo = this.notebookService.getRendererInfo(renderId);
            if (renderInfo) {
                const displayName = renderInfo.displayName !== '' ? renderInfo.displayName : renderInfo.id;
                return `${displayName} (${renderInfo.extensionId.value})`;
            }
            return nls.localize(5, null);
        }
        _validateFinalOutputHeight(synchronous) {
            if (this._outputHeightTimer !== null) {
                clearTimeout(this._outputHeightTimer);
            }
            if (synchronous) {
                this.viewCell.updateOutputMinHeight(0);
                this.viewCell.layoutChange({ outputHeight: true }, 'CellOutputElement#_validateFinalOutputHeight_sync');
            }
            else {
                this._outputHeightTimer = setTimeout(() => {
                    this.viewCell.updateOutputMinHeight(0);
                    this.viewCell.layoutChange({ outputHeight: true }, 'CellOutputElement#_validateFinalOutputHeight_async_1000');
                }, 1000);
            }
        }
        relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            this.viewCell.updateOutputMinHeight(0);
            if (this._outputHeightTimer) {
                clearTimeout(this._outputHeightTimer);
            }
            super.dispose();
        }
    }
    exports.CellOutputElement = CellOutputElement;
    let CellOutputContainer = class CellOutputContainer extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, templateData, notebookService, quickInputService, openerService, textFileService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.notebookService = notebookService;
            this.quickInputService = quickInputService;
            this.openerService = openerService;
            this.textFileService = textFileService;
            this.outputEntries = new Map();
            this._outputHeightTimer = null;
            this._register(viewCell.onDidChangeOutputs(splices => {
                this._updateOutputs(splices);
            }));
            this._register(viewCell.onDidChangeLayout(() => {
                this.outputEntries.forEach((value, key) => {
                    const index = viewCell.outputsViewModels.indexOf(key);
                    if (index >= 0) {
                        const top = this.viewCell.getOutputOffsetInContainer(index);
                        value.updateDOMTop(top);
                    }
                });
            }));
        }
        render(editorHeight) {
            if (this.viewCell.outputsViewModels.length > 0) {
                if (this.viewCell.layoutInfo.totalHeight !== 0 && this.viewCell.layoutInfo.editorHeight > editorHeight) {
                    this.viewCell.updateOutputMinHeight(this.viewCell.layoutInfo.outputTotalHeight);
                    this._relayoutCell();
                }
                DOM.show(this.templateData.outputContainer);
                const outputsToRender = this._calcuateOutputsToRender();
                for (let index = 0; index < outputsToRender.length; index++) {
                    const currOutput = this.viewCell.outputsViewModels[index];
                    // always add to the end
                    this._renderOutput(currOutput, index, undefined);
                }
                this.viewCell.editorHeight = editorHeight;
                if (this.viewCell.outputsViewModels.length > OUTPUT_COUNT_LIMIT) {
                    DOM.show(this.templateData.outputShowMoreContainer);
                    this.viewCell.updateOutputShowMoreContainerHeight(46);
                }
                this._relayoutCell();
                this._validateFinalOutputHeight(false);
            }
            else {
                // noop
                this.viewCell.editorHeight = editorHeight;
                this._relayoutCell();
                DOM.hide(this.templateData.outputContainer);
            }
            this.templateData.outputShowMoreContainer.innerText = '';
            if (this.viewCell.outputsViewModels.length > OUTPUT_COUNT_LIMIT) {
                this.templateData.outputShowMoreContainer.appendChild(this._generateShowMoreElement());
            }
            else {
                DOM.hide(this.templateData.outputShowMoreContainer);
                this.viewCell.updateOutputShowMoreContainerHeight(0);
            }
        }
        viewUpdateShowOutputs() {
            for (let index = 0; index < this.viewCell.outputsViewModels.length; index++) {
                const currOutput = this.viewCell.outputsViewModels[index];
                const renderedOutput = this.outputEntries.get(currOutput);
                if (renderedOutput && renderedOutput.renderResult) {
                    if (renderedOutput.renderResult.type !== 0 /* Mainframe */) {
                        this.notebookEditor.createOutput(this.viewCell, renderedOutput.renderResult, this.viewCell.getOutputOffset(index));
                    }
                    else {
                        this.viewCell.updateOutputHeight(index, renderedOutput.domOffsetHeight, 'CellOutputContainer#viewUpdateShowOutputs');
                    }
                }
                else {
                    // Wasn't previously rendered, render it now
                    this._renderOutput(currOutput, index);
                }
            }
            this._relayoutCell();
        }
        viewUpdateHideOuputs() {
            for (const e of this.outputEntries.keys()) {
                this.notebookEditor.hideInset(e);
            }
        }
        _calcuateOutputsToRender() {
            const outputs = this.viewCell.outputsViewModels.slice(0, Math.min(OUTPUT_COUNT_LIMIT, this.viewCell.outputsViewModels.length));
            if (!this.notebookEditor.viewModel.metadata.trusted) {
                // not trusted
                const secureOutput = outputs.filter(output => {
                    const mimeTypes = output.model.outputs.map(op => op.mime);
                    return mimeTypes.some(notebookCommon_1.mimeTypeIsAlwaysSecure);
                });
                return secureOutput;
            }
            return outputs;
        }
        _validateFinalOutputHeight(synchronous) {
            if (this._outputHeightTimer !== null) {
                clearTimeout(this._outputHeightTimer);
            }
            if (synchronous) {
                this.viewCell.updateOutputMinHeight(0);
                this.viewCell.layoutChange({ outputHeight: true }, 'CellOutputContainer#_validateFinalOutputHeight_sync');
            }
            else {
                this._outputHeightTimer = setTimeout(() => {
                    this.viewCell.updateOutputMinHeight(0);
                    this.viewCell.layoutChange({ outputHeight: true }, 'CellOutputContainer#_validateFinalOutputHeight_async_1000');
                }, 1000);
            }
        }
        _updateOutputs(splices) {
            if (!splices.length) {
                return;
            }
            const previousOutputHeight = this.viewCell.layoutInfo.outputTotalHeight;
            // for cell output update, we make sure the cell does not shrink before the new outputs are rendered.
            this.viewCell.updateOutputMinHeight(previousOutputHeight);
            if (this.viewCell.outputsViewModels.length) {
                DOM.show(this.templateData.outputContainer);
            }
            else {
                DOM.hide(this.templateData.outputContainer);
            }
            const reversedSplices = splices.reverse();
            reversedSplices.forEach(splice => {
                this.viewCell.spliceOutputHeights(splice[0], splice[1], splice[2].map(_ => 0));
            });
            const removedOutputs = [];
            this.outputEntries.forEach((value, key) => {
                if (this.viewCell.outputsViewModels.indexOf(key) < 0) {
                    removedOutputs.push(key);
                    // remove element from DOM
                    value.detach();
                    this.notebookEditor.removeInset(key);
                }
            });
            removedOutputs.forEach(key => {
                var _a;
                (_a = this.outputEntries.get(key)) === null || _a === void 0 ? void 0 : _a.dispose();
                this.outputEntries.delete(key);
            });
            let prevElement = undefined;
            const outputsToRender = this._calcuateOutputsToRender();
            let outputHasDynamicHeight = false;
            outputsToRender.reverse().forEach(output => {
                var _a;
                if (this.outputEntries.has(output)) {
                    // already exist
                    prevElement = this.outputEntries.get(output).domNode;
                    return;
                }
                // newly added element
                const currIndex = this.viewCell.outputsViewModels.indexOf(output);
                const renderResult = this._renderOutput(output, currIndex, prevElement);
                if (renderResult) {
                    outputHasDynamicHeight = outputHasDynamicHeight || !renderResult.initRenderIsSynchronous;
                }
                prevElement = (_a = this.outputEntries.get(output)) === null || _a === void 0 ? void 0 : _a.domNode;
            });
            if (this.viewCell.outputsViewModels.length > OUTPUT_COUNT_LIMIT) {
                DOM.show(this.templateData.outputShowMoreContainer);
                if (!this.templateData.outputShowMoreContainer.hasChildNodes()) {
                    this.templateData.outputShowMoreContainer.appendChild(this._generateShowMoreElement());
                }
                this.viewCell.updateOutputShowMoreContainerHeight(46);
            }
            else {
                DOM.hide(this.templateData.outputShowMoreContainer);
            }
            const editorHeight = this.templateData.editor.getContentHeight();
            this.viewCell.editorHeight = editorHeight;
            this._relayoutCell();
            // if it's clearing all outputs
            // or outputs are all rendered synchronously
            // shrink immediately as the final output height will be zero.
            this._validateFinalOutputHeight(!outputHasDynamicHeight || this.viewCell.outputsViewModels.length === 0);
        }
        _renderOutput(currOutput, index, beforeElement) {
            if (!this.outputEntries.has(currOutput)) {
                this.outputEntries.set(currOutput, new CellOutputElement(this.notebookEditor, this.notebookService, this.quickInputService, this.viewCell, this.templateData.outputContainer, currOutput));
            }
            return this.outputEntries.get(currOutput).render(index, beforeElement);
        }
        _generateShowMoreElement() {
            const md = {
                value: `There are more than ${OUTPUT_COUNT_LIMIT} outputs, [show more (open the raw output data in a text editor) ...](command:workbench.action.openLargeOutput)`,
                isTrusted: true,
                supportThemeIcons: true
            };
            const element = (0, markdownRenderer_1.renderMarkdown)(md, {
                actionHandler: {
                    callback: (content) => {
                        if (content === 'command:workbench.action.openLargeOutput') {
                            const content = JSON.stringify(this.viewCell.outputsViewModels.map(output => {
                                return output.toRawJSON();
                            }));
                            const edits = (0, jsonFormatter_1.format)(content, undefined, {});
                            const metadataSource = (0, jsonEdit_1.applyEdits)(content, edits);
                            return this.textFileService.untitled.resolve({
                                associatedResource: undefined,
                                mode: 'json',
                                initialValue: metadataSource
                            }).then(model => {
                                const resource = model.resource;
                                this.openerService.open(resource);
                            });
                        }
                        return;
                    },
                    disposeables: new lifecycle_1.DisposableStore()
                }
            });
            element.classList.add('output-show-more');
            return element;
        }
        _relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            this.viewCell.updateOutputMinHeight(0);
            if (this._outputHeightTimer) {
                clearTimeout(this._outputHeightTimer);
            }
            this.outputEntries.forEach((value) => {
                value.dispose();
            });
            super.dispose();
        }
    };
    CellOutputContainer = __decorate([
        __param(3, notebookService_1.INotebookService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, opener_1.IOpenerService),
        __param(6, textfiles_1.ITextFileService)
    ], CellOutputContainer);
    exports.CellOutputContainer = CellOutputContainer;
});
//# sourceMappingURL=cellOutput.js.map