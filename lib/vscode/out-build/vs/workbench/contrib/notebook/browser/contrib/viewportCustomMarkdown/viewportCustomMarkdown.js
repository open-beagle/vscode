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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, DOM, async_1, lifecycle_1, notebookBrowser_1, notebookEditorExtensions_1, notebookCommon_1, notebookRange_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let NotebookClipboardContribution = class NotebookClipboardContribution extends lifecycle_1.Disposable {
        constructor(_notebookEditor, _notebookService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._notebookService = _notebookService;
            this._warmupViewport = new async_1.RunOnceScheduler(() => this._warmupViewportNow(), 200);
            this._register(this._notebookEditor.onDidScroll(() => {
                this._warmupViewport.schedule();
            }));
        }
        _warmupViewportNow() {
            const visibleRanges = this._notebookEditor.getVisibleRangesPlusViewportAboveBelow();
            (0, notebookRange_1.cellRangesToIndexes)(visibleRanges).forEach(index => {
                var _a, _b;
                const cell = (_a = this._notebookEditor.viewModel) === null || _a === void 0 ? void 0 : _a.viewCells[index];
                if ((cell === null || cell === void 0 ? void 0 : cell.cellKind) === notebookCommon_1.CellKind.Markdown && (cell === null || cell === void 0 ? void 0 : cell.getEditState()) === notebookBrowser_1.CellEditState.Preview && !((_b = cell.metadata) === null || _b === void 0 ? void 0 : _b.inputCollapsed)) {
                    this._notebookEditor.createMarkdownPreview(cell);
                }
                else if ((cell === null || cell === void 0 ? void 0 : cell.cellKind) === notebookCommon_1.CellKind.Code) {
                    const viewCell = cell;
                    const outputs = viewCell.outputsViewModels;
                    for (let output of outputs) {
                        const [mimeTypes, pick] = output.resolveMimeTypes(this._notebookEditor.textModel, undefined);
                        if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                            continue;
                        }
                        const pickedMimeTypeRenderer = mimeTypes[pick];
                        if (!pickedMimeTypeRenderer) {
                            return;
                        }
                        if (pickedMimeTypeRenderer.rendererId === notebookCommon_1.BUILTIN_RENDERER_ID) {
                            const renderer = this._notebookEditor.getOutputRenderer().getContribution(pickedMimeTypeRenderer.mimeType);
                            if ((renderer === null || renderer === void 0 ? void 0 : renderer.getType()) === 1 /* Html */) {
                                const renderResult = renderer.render(output, output.model.outputs.filter(op => op.mime === pickedMimeTypeRenderer.mimeType), DOM.$(''), undefined);
                                this._notebookEditor.createOutput(viewCell, renderResult, 0);
                            }
                            return;
                        }
                        const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                        if (!renderer) {
                            return;
                        }
                        const result = { type: 2 /* Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
                        this._notebookEditor.createOutput(viewCell, result, 0);
                    }
                }
            });
        }
    };
    NotebookClipboardContribution.id = 'workbench.notebook.viewportCustomMarkdown';
    NotebookClipboardContribution = __decorate([
        __param(1, notebookService_1.INotebookService)
    ], NotebookClipboardContribution);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookClipboardContribution.id, NotebookClipboardContribution);
});
//# sourceMappingURL=viewportCustomMarkdown.js.map