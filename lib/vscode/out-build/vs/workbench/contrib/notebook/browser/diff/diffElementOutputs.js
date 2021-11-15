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
define(["require", "exports", "vs/base/browser/dom", "vs/nls!vs/workbench/contrib/notebook/browser/diff/diffElementOutputs", "vs/base/common/lifecycle", "vs/platform/opener/common/opener", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/workbench/contrib/notebook/browser/view/renderers/cellWidgets", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/base/browser/keyboardEvent", "vs/platform/quickinput/common/quickInput"], function (require, exports, DOM, nls, lifecycle_1, opener_1, diffElementViewModel_1, notebookDiffEditorBrowser_1, cellWidgets_1, notebookCommon_1, notebookService_1, textfiles_1, themeService_1, notebookIcons_1, keyboardEvent_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputContainer = exports.OutputElement = void 0;
    class OutputElement extends lifecycle_1.Disposable {
        constructor(_notebookEditor, _notebookTextModel, _notebookService, _quickInputService, _diffElementViewModel, _diffSide, _nestedCell, _outputContainer, output) {
            super();
            this._notebookEditor = _notebookEditor;
            this._notebookTextModel = _notebookTextModel;
            this._notebookService = _notebookService;
            this._quickInputService = _quickInputService;
            this._diffElementViewModel = _diffElementViewModel;
            this._diffSide = _diffSide;
            this._nestedCell = _nestedCell;
            this._outputContainer = _outputContainer;
            this.output = output;
            this.resizeListener = new lifecycle_1.DisposableStore();
        }
        render(index, beforeElement) {
            const outputItemDiv = document.createElement('div');
            let result = undefined;
            const [mimeTypes, pick] = this.output.resolveMimeTypes(this._notebookTextModel, undefined);
            const pickedMimeTypeRenderer = mimeTypes[pick];
            if (mimeTypes.length > 1) {
                outputItemDiv.style.position = 'relative';
                const mimeTypePicker = DOM.$('.multi-mimetype-output');
                mimeTypePicker.classList.add(...themeService_1.ThemeIcon.asClassNameArray(notebookIcons_1.mimetypeIcon));
                mimeTypePicker.tabIndex = 0;
                mimeTypePicker.title = nls.localize(0, null, mimeTypes.map(mimeType => mimeType.mimeType).join(', '));
                outputItemDiv.appendChild(mimeTypePicker);
                this.resizeListener.add(DOM.addStandardDisposableListener(mimeTypePicker, 'mousedown', async (e) => {
                    if (e.leftButton) {
                        e.preventDefault();
                        e.stopPropagation();
                        await this.pickActiveMimeTypeRenderer(this._notebookTextModel, this.output);
                    }
                }));
                this.resizeListener.add((DOM.addDisposableListener(mimeTypePicker, DOM.EventType.KEY_DOWN, async (e) => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if ((event.equals(3 /* Enter */) || event.equals(10 /* Space */))) {
                        e.preventDefault();
                        e.stopPropagation();
                        await this.pickActiveMimeTypeRenderer(this._notebookTextModel, this.output);
                    }
                })));
            }
            const innerContainer = DOM.$('.output-inner-container');
            DOM.append(outputItemDiv, innerContainer);
            if (mimeTypes.length !== 0) {
                if (pickedMimeTypeRenderer.rendererId !== notebookCommon_1.BUILTIN_RENDERER_ID) {
                    const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                    result = renderer
                        ? { type: 2 /* Extension */, renderer, source: this.output, mimeType: pickedMimeTypeRenderer.mimeType }
                        : this._notebookEditor.getOutputRenderer().render(this.output, innerContainer, pickedMimeTypeRenderer.mimeType, this._notebookTextModel.uri);
                }
                else {
                    result = this._notebookEditor.getOutputRenderer().render(this.output, innerContainer, pickedMimeTypeRenderer.mimeType, this._notebookTextModel.uri);
                }
                this.output.pickedMimeType = pick;
            }
            this.domNode = outputItemDiv;
            this.renderResult = result;
            if (!result) {
                // this.viewCell.updateOutputHeight(index, 0);
                return;
            }
            if (beforeElement) {
                this._outputContainer.insertBefore(outputItemDiv, beforeElement);
            }
            else {
                this._outputContainer.appendChild(outputItemDiv);
            }
            if (result.type !== 0 /* Mainframe */) {
                // this.viewCell.selfSizeMonitoring = true;
                this._notebookEditor.createOutput(this._diffElementViewModel, this._nestedCell, result, () => this.getOutputOffsetInCell(index), this._diffElementViewModel instanceof diffElementViewModel_1.SideBySideDiffElementViewModel
                    ? this._diffSide
                    : this._diffElementViewModel.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original);
            }
            else {
                outputItemDiv.classList.add('foreground', 'output-element');
                outputItemDiv.style.position = 'absolute';
            }
            if (result.type === 1 /* Html */ || result.type === 2 /* Extension */) {
                return;
            }
            let clientHeight = Math.ceil(outputItemDiv.clientHeight);
            const elementSizeObserver = (0, cellWidgets_1.getResizesObserver)(outputItemDiv, undefined, () => {
                if (this._outputContainer && document.body.contains(this._outputContainer)) {
                    const height = Math.ceil(elementSizeObserver.getHeight());
                    if (clientHeight === height) {
                        return;
                    }
                    clientHeight = height;
                    const currIndex = this.getCellOutputCurrentIndex();
                    if (currIndex < 0) {
                        return;
                    }
                    this.updateHeight(currIndex, height);
                }
            });
            elementSizeObserver.startObserving();
            this.resizeListener.add(elementSizeObserver);
            this.updateHeight(index, clientHeight);
            const top = this.getOutputOffsetInContainer(index);
            outputItemDiv.style.top = `${top}px`;
        }
        async pickActiveMimeTypeRenderer(notebookTextModel, viewModel) {
            var _a;
            const [mimeTypes, currIndex] = viewModel.resolveMimeTypes(notebookTextModel, undefined);
            const items = mimeTypes.filter(mimeType => mimeType.isTrusted).map((mimeType, index) => ({
                label: mimeType.mimeType,
                id: mimeType.mimeType,
                index: index,
                picked: index === currIndex,
                detail: this.generateRendererInfo(mimeType.rendererId),
                description: index === currIndex ? nls.localize(1, null) : undefined
            }));
            const picker = this._quickInputService.createQuickPick();
            picker.items = items;
            picker.activeItems = items.filter(item => !!item.picked);
            picker.placeholder = items.length !== mimeTypes.length
                ? nls.localize(2, null)
                : nls.localize(3, null);
            const pick = await new Promise(resolve => {
                picker.onDidAccept(() => {
                    resolve(picker.selectedItems.length === 1 ? picker.selectedItems[0].index : undefined);
                    picker.dispose();
                });
                picker.show();
            });
            if (pick === undefined) {
                return;
            }
            if (pick !== currIndex) {
                // user chooses another mimetype
                const index = this._nestedCell.outputsViewModels.indexOf(viewModel);
                const nextElement = this.domNode.nextElementSibling;
                this.resizeListener.clear();
                const element = this.domNode;
                if (element) {
                    (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element);
                    this._notebookEditor.removeInset(this._diffElementViewModel, this._nestedCell, viewModel, this._diffSide);
                }
                viewModel.pickedMimeType = pick;
                this.render(index, nextElement);
            }
        }
        generateRendererInfo(renderId) {
            if (renderId === undefined || renderId === notebookCommon_1.BUILTIN_RENDERER_ID) {
                return nls.localize(4, null);
            }
            const renderInfo = this._notebookService.getRendererInfo(renderId);
            if (renderInfo) {
                const displayName = renderInfo.displayName !== '' ? renderInfo.displayName : renderInfo.id;
                return `${displayName} (${renderInfo.extensionId.value})`;
            }
            return nls.localize(5, null);
        }
        getCellOutputCurrentIndex() {
            return this._diffElementViewModel.getNestedCellViewModel(this._diffSide).outputs.indexOf(this.output.model);
        }
        updateHeight(index, height) {
            this._diffElementViewModel.updateOutputHeight(this._diffSide, index, height);
        }
        getOutputOffsetInContainer(index) {
            return this._diffElementViewModel.getOutputOffsetInContainer(this._diffSide, index);
        }
        getOutputOffsetInCell(index) {
            return this._diffElementViewModel.getOutputOffsetInCell(this._diffSide, index);
        }
    }
    exports.OutputElement = OutputElement;
    let OutputContainer = class OutputContainer extends lifecycle_1.Disposable {
        constructor(_editor, _notebookTextModel, _diffElementViewModel, _nestedCellViewModel, _diffSide, _outputContainer, _notebookService, _quickInputService, _openerService, _textFileService) {
            super();
            this._editor = _editor;
            this._notebookTextModel = _notebookTextModel;
            this._diffElementViewModel = _diffElementViewModel;
            this._nestedCellViewModel = _nestedCellViewModel;
            this._diffSide = _diffSide;
            this._outputContainer = _outputContainer;
            this._notebookService = _notebookService;
            this._quickInputService = _quickInputService;
            this._openerService = _openerService;
            this._textFileService = _textFileService;
            this._outputEntries = new Map();
            this._register(this._diffElementViewModel.onDidLayoutChange(() => {
                this._outputEntries.forEach((value, key) => {
                    const index = _nestedCellViewModel.outputs.indexOf(key.model);
                    if (index >= 0) {
                        const top = this._diffElementViewModel.getOutputOffsetInContainer(this._diffSide, index);
                        value.domNode.style.top = `${top}px`;
                    }
                });
            }));
            this._register(this._nestedCellViewModel.textModel.onDidChangeOutputs(splices => {
                this._updateOutputs(splices);
            }));
        }
        _updateOutputs(splices) {
            if (!splices.length) {
                return;
            }
            const removedKeys = [];
            this._outputEntries.forEach((value, key) => {
                if (this._nestedCellViewModel.outputsViewModels.indexOf(key) < 0) {
                    // already removed
                    removedKeys.push(key);
                    // remove element from DOM
                    this._outputContainer.removeChild(value.domNode);
                    this._editor.removeInset(this._diffElementViewModel, this._nestedCellViewModel, key, this._diffSide);
                }
            });
            removedKeys.forEach(key => {
                var _a;
                (_a = this._outputEntries.get(key)) === null || _a === void 0 ? void 0 : _a.dispose();
                this._outputEntries.delete(key);
            });
            let prevElement = undefined;
            const outputsToRender = this._nestedCellViewModel.outputsViewModels;
            outputsToRender.reverse().forEach(output => {
                var _a;
                if (this._outputEntries.has(output)) {
                    // already exist
                    prevElement = this._outputEntries.get(output).domNode;
                    return;
                }
                // newly added element
                const currIndex = this._nestedCellViewModel.outputsViewModels.indexOf(output);
                this._renderOutput(output, currIndex, prevElement);
                prevElement = (_a = this._outputEntries.get(output)) === null || _a === void 0 ? void 0 : _a.domNode;
            });
        }
        render() {
            // TODO, outputs to render (should have a limit)
            for (let index = 0; index < this._nestedCellViewModel.outputsViewModels.length; index++) {
                const currOutput = this._nestedCellViewModel.outputsViewModels[index];
                // always add to the end
                this._renderOutput(currOutput, index, undefined);
            }
        }
        showOutputs() {
            for (let index = 0; index < this._nestedCellViewModel.outputsViewModels.length; index++) {
                const currOutput = this._nestedCellViewModel.outputsViewModels[index];
                // always add to the end
                this._editor.showInset(this._diffElementViewModel, currOutput.cellViewModel, currOutput, this._diffSide);
            }
        }
        hideOutputs() {
            this._outputEntries.forEach((outputElement, cellOutputViewModel) => {
                this._editor.hideInset(this._diffElementViewModel, this._nestedCellViewModel, cellOutputViewModel);
            });
        }
        _renderOutput(currOutput, index, beforeElement) {
            if (!this._outputEntries.has(currOutput)) {
                this._outputEntries.set(currOutput, new OutputElement(this._editor, this._notebookTextModel, this._notebookService, this._quickInputService, this._diffElementViewModel, this._diffSide, this._nestedCellViewModel, this._outputContainer, currOutput));
            }
            const renderElement = this._outputEntries.get(currOutput);
            renderElement.render(index, beforeElement);
        }
    };
    OutputContainer = __decorate([
        __param(6, notebookService_1.INotebookService),
        __param(7, quickInput_1.IQuickInputService),
        __param(8, opener_1.IOpenerService),
        __param(9, textfiles_1.ITextFileService)
    ], OutputContainer);
    exports.OutputContainer = OutputContainer;
});
//# sourceMappingURL=diffElementOutputs.js.map