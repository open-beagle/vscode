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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/contrib/fold/foldingModel", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/notebook/browser/view/renderers/cellWidgets", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/base/browser/ui/iconLabel/iconLabels"], function (require, exports, DOM, async_1, cancellation_1, lifecycle_1, codeEditorWidget_1, instantiation_1, constants_1, notebookBrowser_1, foldingModel_1, contextkey_1, serviceCollection_1, editorContextKeys_1, cellWidgets_1, notebookCellStatusBarService_1, notebookIcons_1, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatefulMarkdownCell = void 0;
    class WebviewMarkdownRenderer extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
        }
        update() {
            this.notebookEditor.createMarkdownPreview(this.viewCell);
        }
    }
    class BuiltinMarkdownRenderer extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, container, markdownContainer, editorAccessor) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.container = container;
            this.markdownContainer = markdownContainer;
            this.editorAccessor = editorAccessor;
            this.localDisposables = this._register(new lifecycle_1.DisposableStore());
            this._register((0, cellWidgets_1.getResizesObserver)(this.markdownContainer, undefined, () => {
                if (viewCell.getEditState() === notebookBrowser_1.CellEditState.Preview) {
                    this.viewCell.renderedMarkdownHeight = container.clientHeight;
                }
            })).startObserving();
        }
        update() {
            const markdownRenderer = this.viewCell.getMarkdownRenderer();
            const renderedHTML = this.viewCell.getHTML();
            if (renderedHTML) {
                this.markdownContainer.appendChild(renderedHTML);
            }
            if (this.editorAccessor()) {
                // switch from editing mode
                this.viewCell.renderedMarkdownHeight = this.container.clientHeight;
                this.relayoutCell();
            }
            else {
                this.localDisposables.clear();
                this.localDisposables.add(markdownRenderer.onDidRenderAsync(() => {
                    if (this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Preview) {
                        this.viewCell.renderedMarkdownHeight = this.container.clientHeight;
                    }
                    this.relayoutCell();
                }));
                this.localDisposables.add(this.viewCell.textBuffer.onDidChangeContent(() => {
                    this.markdownContainer.innerText = '';
                    this.viewCell.clearHTML();
                    const renderedHTML = this.viewCell.getHTML();
                    if (renderedHTML) {
                        this.markdownContainer.appendChild(renderedHTML);
                    }
                }));
                this.viewCell.renderedMarkdownHeight = this.container.clientHeight;
                this.relayoutCell();
            }
        }
        relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
    }
    let StatefulMarkdownCell = class StatefulMarkdownCell extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, templateData, editorOptions, renderedEditors, options, contextKeyService, notebookCellStatusBarService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.editorOptions = editorOptions;
            this.renderedEditors = renderedEditors;
            this.contextKeyService = contextKeyService;
            this.notebookCellStatusBarService = notebookCellStatusBarService;
            this.instantiationService = instantiationService;
            this.editor = null;
            this.localDisposables = new lifecycle_1.DisposableStore();
            this.useRenderer = false;
            this.markdownContainer = templateData.cellContainer;
            this.editorPart = templateData.editorPart;
            this.useRenderer = options.useRenderer;
            if (this.useRenderer) {
                this.templateData.container.classList.toggle('webview-backed-markdown-cell', true);
                this.renderStrategy = new WebviewMarkdownRenderer(this.notebookEditor, this.viewCell);
            }
            else {
                this.renderStrategy = new BuiltinMarkdownRenderer(this.notebookEditor, this.viewCell, this.templateData.container, this.markdownContainer, () => this.editor);
            }
            this._register(this.renderStrategy);
            this._register((0, lifecycle_1.toDisposable)(() => renderedEditors.delete(this.viewCell)));
            this._register(viewCell.onDidChangeState((e) => {
                if (e.editStateChanged) {
                    this.viewUpdate();
                }
                else if (e.contentChanged) {
                    this.viewUpdate();
                }
            }));
            this._register(viewCell.model.onDidChangeMetadata(() => {
                this.viewUpdate();
            }));
            const updateForFocusMode = () => {
                if (viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                    this.focusEditorIfNeeded();
                }
                templateData.container.classList.toggle('cell-editor-focus', viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            };
            this._register(viewCell.onDidChangeState((e) => {
                if (!e.focusModeChanged) {
                    return;
                }
                updateForFocusMode();
            }));
            updateForFocusMode();
            this.foldingState = viewCell.foldingState;
            this.setFoldingIndicator();
            this._register(viewCell.onDidChangeState((e) => {
                if (!e.foldingStateChanged) {
                    return;
                }
                const foldingState = viewCell.foldingState;
                if (foldingState !== this.foldingState) {
                    this.foldingState = foldingState;
                    this.setFoldingIndicator();
                }
            }));
            this._register(viewCell.onDidChangeLayout((e) => {
                var _a;
                const layoutInfo = (_a = this.editor) === null || _a === void 0 ? void 0 : _a.getLayoutInfo();
                if (e.outerWidth && this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing && layoutInfo && layoutInfo.width !== viewCell.layoutInfo.editorWidth) {
                    this.onCellEditorWidthChange();
                }
                else if (e.totalHeight || e.outerWidth) {
                    this.relayoutCell();
                }
            }));
            if (this.useRenderer) {
                // the markdown preview's height might already be updated after the renderer calls `element.getHeight()`
                if (this.viewCell.layoutInfo.totalHeight > 0) {
                    this.relayoutCell();
                }
            }
            // apply decorations
            this._register(viewCell.onCellDecorationsChanged((e) => {
                e.added.forEach(options => {
                    if (options.className) {
                        if (this.useRenderer) {
                            this.notebookEditor.deltaCellOutputContainerClassNames(this.viewCell.id, [options.className], []);
                        }
                        else {
                            templateData.rootContainer.classList.add(options.className);
                        }
                    }
                });
                e.removed.forEach(options => {
                    if (options.className) {
                        if (this.useRenderer) {
                            this.notebookEditor.deltaCellOutputContainerClassNames(this.viewCell.id, [], [options.className]);
                        }
                        else {
                            templateData.rootContainer.classList.remove(options.className);
                        }
                    }
                });
            }));
            viewCell.getCellDecorations().forEach(options => {
                if (options.className) {
                    if (this.useRenderer) {
                        this.notebookEditor.deltaCellOutputContainerClassNames(this.viewCell.id, [options.className], []);
                    }
                    else {
                        templateData.rootContainer.classList.add(options.className);
                    }
                }
            });
            this.viewUpdate();
        }
        dispose() {
            this.localDisposables.dispose();
            this.viewCell.detachTextEditor();
            super.dispose();
        }
        viewUpdate() {
            var _a;
            if ((_a = this.viewCell.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed) {
                this.viewUpdateCollapsed();
            }
            else if (this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                this.viewUpdateEditing();
            }
            else {
                this.viewUpdatePreview();
            }
        }
        viewUpdateCollapsed() {
            DOM.show(this.templateData.collapsedPart);
            DOM.hide(this.editorPart);
            DOM.hide(this.markdownContainer);
            this.templateData.container.classList.toggle('collapsed', true);
            this.viewCell.renderedMarkdownHeight = 0;
            this.viewCell.layoutChange({});
        }
        viewUpdateEditing() {
            var _a, _b;
            // switch to editing mode
            let editorHeight;
            DOM.show(this.editorPart);
            DOM.hide(this.markdownContainer);
            DOM.hide(this.templateData.collapsedPart);
            if (this.useRenderer) {
                this.notebookEditor.hideMarkdownPreviews([this.viewCell]);
            }
            this.templateData.container.classList.toggle('collapsed', false);
            this.templateData.container.classList.toggle('markdown-cell-edit-mode', true);
            if (this.editor && this.editor.hasModel()) {
                editorHeight = this.editor.getContentHeight();
                // not first time, we don't need to create editor or bind listeners
                this.viewCell.attachTextEditor(this.editor);
                this.focusEditorIfNeeded();
                this.bindEditorListeners(this.editor);
                this.editor.layout({
                    width: this.viewCell.layoutInfo.editorWidth,
                    height: editorHeight
                });
            }
            else {
                (_a = this.editor) === null || _a === void 0 ? void 0 : _a.dispose();
                const width = this.viewCell.layoutInfo.editorWidth;
                const lineNum = this.viewCell.lineCount;
                const lineHeight = ((_b = this.viewCell.layoutInfo.fontInfo) === null || _b === void 0 ? void 0 : _b.lineHeight) || 17;
                editorHeight = Math.max(lineNum, 1) * lineHeight + (0, notebookBrowser_1.getEditorTopPadding)() + constants_1.EDITOR_BOTTOM_PADDING;
                this.templateData.editorContainer.innerText = '';
                // create a special context key service that set the inCompositeEditor-contextkey
                const editorContextKeyService = this.contextKeyService.createScoped(this.templateData.editorPart);
                editorContextKeys_1.EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
                const editorInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, editorContextKeyService]));
                this._register(editorContextKeyService);
                this.editor = this._register(editorInstaService.createInstance(codeEditorWidget_1.CodeEditorWidget, this.templateData.editorContainer, Object.assign(Object.assign({}, this.editorOptions), { dimension: {
                        width: width,
                        height: editorHeight
                    } }), {}));
                this.templateData.currentEditor = this.editor;
                const cts = new cancellation_1.CancellationTokenSource();
                this._register({ dispose() { cts.dispose(true); } });
                (0, async_1.raceCancellation)(this.viewCell.resolveTextModel(), cts.token).then(model => {
                    if (!model) {
                        return;
                    }
                    this.editor.setModel(model);
                    this.focusEditorIfNeeded();
                    const realContentHeight = this.editor.getContentHeight();
                    if (realContentHeight !== editorHeight) {
                        this.editor.layout({
                            width: width,
                            height: realContentHeight
                        });
                        editorHeight = realContentHeight;
                    }
                    this.viewCell.attachTextEditor(this.editor);
                    if (this.viewCell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                        this.focusEditorIfNeeded();
                    }
                    this.bindEditorListeners(this.editor);
                    this.viewCell.editorHeight = editorHeight;
                });
            }
            this.viewCell.editorHeight = editorHeight;
            this.focusEditorIfNeeded();
            this.renderedEditors.set(this.viewCell, this.editor);
        }
        viewUpdatePreview() {
            this.viewCell.detachTextEditor();
            DOM.hide(this.editorPart);
            DOM.hide(this.templateData.collapsedPart);
            DOM.show(this.markdownContainer);
            this.templateData.container.classList.toggle('collapsed', false);
            this.templateData.container.classList.toggle('markdown-cell-edit-mode', false);
            this.renderedEditors.delete(this.viewCell);
            this.markdownContainer.innerText = '';
            this.viewCell.clearHTML();
            this.renderStrategy.update();
        }
        focusEditorIfNeeded() {
            var _a;
            if (this.viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor && this.notebookEditor.hasFocus()) {
                (_a = this.editor) === null || _a === void 0 ? void 0 : _a.focus();
            }
        }
        layoutEditor(dimension) {
            var _a;
            (_a = this.editor) === null || _a === void 0 ? void 0 : _a.layout(dimension);
        }
        onCellEditorWidthChange() {
            const realContentHeight = this.editor.getContentHeight();
            this.layoutEditor({
                width: this.viewCell.layoutInfo.editorWidth,
                height: realContentHeight
            });
            // LET the content size observer to handle it
            // this.viewCell.editorHeight = realContentHeight;
            // this.relayoutCell();
        }
        relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        updateEditorOptions(newValue) {
            this.editorOptions = newValue;
            if (this.editor) {
                this.editor.updateOptions(this.editorOptions);
            }
        }
        setFoldingIndicator() {
            switch (this.foldingState) {
                case foldingModel_1.CellFoldingState.None:
                    this.templateData.foldingIndicator.innerText = '';
                    break;
                case foldingModel_1.CellFoldingState.Collapsed:
                    DOM.reset(this.templateData.foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.collapsedIcon));
                    break;
                case foldingModel_1.CellFoldingState.Expanded:
                    DOM.reset(this.templateData.foldingIndicator, (0, iconLabels_1.renderIcon)(notebookIcons_1.expandedIcon));
                    break;
                default:
                    break;
            }
        }
        bindEditorListeners(editor) {
            this.localDisposables.clear();
            this.localDisposables.add(editor.onDidContentSizeChange(e => {
                const viewLayout = editor.getLayoutInfo();
                if (e.contentHeightChanged) {
                    this.viewCell.editorHeight = e.contentHeight;
                    editor.layout({
                        width: viewLayout.width,
                        height: e.contentHeight
                    });
                }
            }));
            this.localDisposables.add(editor.onDidChangeCursorSelection((e) => {
                if (e.source === 'restoreState') {
                    // do not reveal the cell into view if this selection change was caused by restoring editors...
                    return;
                }
                const primarySelection = editor.getSelection();
                if (primarySelection) {
                    this.notebookEditor.revealLineInViewAsync(this.viewCell, primarySelection.positionLineNumber);
                }
            }));
            const updateFocusMode = () => this.viewCell.focusMode = editor.hasWidgetFocus() ? notebookBrowser_1.CellFocusMode.Editor : notebookBrowser_1.CellFocusMode.Container;
            this.localDisposables.add(editor.onDidFocusEditorWidget(() => {
                updateFocusMode();
            }));
            this.localDisposables.add(editor.onDidBlurEditorWidget(() => {
                var _a;
                // this is for a special case:
                // users click the status bar empty space, which we will then focus the editor
                // so we don't want to update the focus state too eagerly
                if ((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.contains(this.templateData.container)) {
                    setTimeout(() => {
                        updateFocusMode();
                    }, 300);
                }
                else {
                    updateFocusMode();
                }
            }));
            updateFocusMode();
        }
    };
    StatefulMarkdownCell = __decorate([
        __param(6, contextkey_1.IContextKeyService),
        __param(7, notebookCellStatusBarService_1.INotebookCellStatusBarService),
        __param(8, instantiation_1.IInstantiationService)
    ], StatefulMarkdownCell);
    exports.StatefulMarkdownCell = StatefulMarkdownCell;
});
//# sourceMappingURL=markdownCell.js.map