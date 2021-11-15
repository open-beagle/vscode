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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/renderers/cellOutput", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, DOM, async_1, cancellation_1, lifecycle_1, instantiation_1, opener_1, constants_1, notebookBrowser_1, cellOutput_1, notebookCellStatusBarService_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeCell = void 0;
    let CodeCell = class CodeCell extends lifecycle_1.Disposable {
        constructor(notebookEditor, viewCell, templateData, instantiationService, notebookCellStatusBarService, openerService, textFileService) {
            var _a, _b;
            super();
            this.notebookEditor = notebookEditor;
            this.viewCell = viewCell;
            this.templateData = templateData;
            this.instantiationService = instantiationService;
            this.notebookCellStatusBarService = notebookCellStatusBarService;
            this.openerService = openerService;
            this.textFileService = textFileService;
            this._untrustedStatusItem = null;
            const width = this.viewCell.layoutInfo.editorWidth;
            const lineNum = this.viewCell.lineCount;
            const lineHeight = ((_a = this.viewCell.layoutInfo.fontInfo) === null || _a === void 0 ? void 0 : _a.lineHeight) || 17;
            const editorHeight = this.viewCell.layoutInfo.editorHeight === 0
                ? lineNum * lineHeight + (0, notebookBrowser_1.getEditorTopPadding)() + constants_1.EDITOR_BOTTOM_PADDING
                : this.viewCell.layoutInfo.editorHeight;
            this.layoutEditor({
                width: width,
                height: editorHeight
            });
            const cts = new cancellation_1.CancellationTokenSource();
            this._register({ dispose() { cts.dispose(true); } });
            (0, async_1.raceCancellation)(viewCell.resolveTextModel(), cts.token).then(model => {
                var _a, _b, _c;
                if (model && templateData.editor) {
                    templateData.editor.setModel(model);
                    viewCell.attachTextEditor(templateData.editor);
                    if (notebookEditor.getActiveCell() === viewCell && viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor && this.notebookEditor.hasFocus()) {
                        (_a = templateData.editor) === null || _a === void 0 ? void 0 : _a.focus();
                    }
                    const realContentHeight = (_b = templateData.editor) === null || _b === void 0 ? void 0 : _b.getContentHeight();
                    if (realContentHeight !== undefined && realContentHeight !== editorHeight) {
                        this.onCellHeightChange(realContentHeight);
                    }
                    if (this.notebookEditor.getActiveCell() === this.viewCell && viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor && this.notebookEditor.hasFocus()) {
                        (_c = templateData.editor) === null || _c === void 0 ? void 0 : _c.focus();
                    }
                }
            });
            const updateForFocusMode = () => {
                var _a;
                if (this.notebookEditor.getFocus().start !== this.notebookEditor.viewModel.getCellIndex(viewCell)) {
                    templateData.container.classList.toggle('cell-editor-focus', viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor);
                }
                if (viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor && this.notebookEditor.getActiveCell() === this.viewCell) {
                    (_a = templateData.editor) === null || _a === void 0 ? void 0 : _a.focus();
                }
                templateData.container.classList.toggle('cell-editor-focus', viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor);
            };
            this._register(viewCell.onDidChangeState((e) => {
                if (e.focusModeChanged) {
                    updateForFocusMode();
                }
            }));
            updateForFocusMode();
            (_b = templateData.editor) === null || _b === void 0 ? void 0 : _b.updateOptions({ readOnly: notebookEditor.viewModel.options.isReadOnly });
            this._register(viewCell.onDidChangeState((e) => {
                var _a;
                if (e.metadataChanged) {
                    (_a = templateData.editor) === null || _a === void 0 ? void 0 : _a.updateOptions({ readOnly: notebookEditor.viewModel.options.isReadOnly });
                    if (this.updateForCollapseState()) {
                        this.relayoutCell();
                    }
                }
            }));
            this._register(viewCell.onDidChangeLayout((e) => {
                if (e.outerWidth !== undefined) {
                    const layoutInfo = templateData.editor.getLayoutInfo();
                    if (layoutInfo.width !== viewCell.layoutInfo.editorWidth) {
                        this.onCellWidthChange();
                    }
                }
            }));
            this._register(viewCell.onDidChangeLayout((e) => {
                if (e.totalHeight) {
                    this.relayoutCell();
                }
            }));
            this._register(templateData.editor.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged) {
                    if (this.viewCell.layoutInfo.editorHeight !== e.contentHeight) {
                        this.onCellHeightChange(e.contentHeight);
                    }
                }
            }));
            this._register(templateData.editor.onDidChangeCursorSelection((e) => {
                if (e.source === 'restoreState') {
                    // do not reveal the cell into view if this selection change was caused by restoring editors...
                    return;
                }
                const primarySelection = templateData.editor.getSelection();
                if (primarySelection) {
                    this.notebookEditor.revealLineInViewAsync(viewCell, primarySelection.positionLineNumber);
                }
            }));
            // Apply decorations
            this._register(viewCell.onCellDecorationsChanged((e) => {
                e.added.forEach(options => {
                    if (options.className) {
                        templateData.rootContainer.classList.add(options.className);
                    }
                    if (options.outputClassName) {
                        this.notebookEditor.deltaCellOutputContainerClassNames(this.viewCell.id, [options.outputClassName], []);
                    }
                });
                e.removed.forEach(options => {
                    if (options.className) {
                        templateData.rootContainer.classList.remove(options.className);
                    }
                    if (options.outputClassName) {
                        this.notebookEditor.deltaCellOutputContainerClassNames(this.viewCell.id, [], [options.outputClassName]);
                    }
                });
            }));
            viewCell.getCellDecorations().forEach(options => {
                if (options.className) {
                    templateData.rootContainer.classList.add(options.className);
                }
                if (options.outputClassName) {
                    this.notebookEditor.deltaCellOutputContainerClassNames(this.viewCell.id, [options.outputClassName], []);
                }
            });
            // Mouse click handlers
            this._register(templateData.statusBar.onDidClick(e => {
                if (e.type !== 2 /* ContributedCommandItem */) {
                    const target = templateData.editor.getTargetAtClientPoint(e.event.clientX, e.event.clientY - viewCell.getEditorStatusbarHeight());
                    if (target === null || target === void 0 ? void 0 : target.position) {
                        templateData.editor.setPosition(target.position);
                        templateData.editor.focus();
                    }
                }
            }));
            this._register(templateData.editor.onMouseDown(e => {
                // prevent default on right mouse click, otherwise it will trigger unexpected focus changes
                // the catch is, it means we don't allow customization of right button mouse down handlers other than the built in ones.
                if (e.event.rightButton) {
                    e.event.preventDefault();
                }
            }));
            // Focus Mode
            const updateFocusMode = () => {
                viewCell.focusMode =
                    (templateData.editor.hasWidgetFocus() || (document.activeElement && this.templateData.statusBar.statusBarContainer.contains(document.activeElement)))
                        ? notebookBrowser_1.CellFocusMode.Editor
                        : notebookBrowser_1.CellFocusMode.Container;
            };
            this._register(templateData.editor.onDidFocusEditorWidget(() => {
                updateFocusMode();
            }));
            this._register(templateData.editor.onDidBlurEditorWidget(() => {
                // this is for a special case:
                // users click the status bar empty space, which we will then focus the editor
                // so we don't want to update the focus state too eagerly, it will be updated with onDidFocusEditorWidget
                if (!(document.activeElement && this.templateData.statusBar.statusBarContainer.contains(document.activeElement))) {
                    updateFocusMode();
                }
            }));
            // Render Outputs
            this._outputContainerRenderer = this.instantiationService.createInstance(cellOutput_1.CellOutputContainer, notebookEditor, viewCell, templateData);
            this._outputContainerRenderer.render(editorHeight);
            // Need to do this after the intial renderOutput
            this.updateForCollapseState();
        }
        updateForCollapseState() {
            var _a, _b, _c;
            if (this.viewCell.metadata.outputCollapsed === this._renderedOutputCollapseState &&
                this.viewCell.metadata.inputCollapsed === this._renderedInputCollapseState) {
                return false;
            }
            this.viewCell.layoutChange({});
            if (((_a = this.viewCell.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed) && this.viewCell.metadata.outputCollapsed) {
                this.viewUpdateAllCollapsed();
            }
            else if ((_b = this.viewCell.metadata) === null || _b === void 0 ? void 0 : _b.inputCollapsed) {
                this.viewUpdateInputCollapsed();
            }
            else if (((_c = this.viewCell.metadata) === null || _c === void 0 ? void 0 : _c.outputCollapsed) && this.viewCell.outputsViewModels.length) {
                this.viewUpdateOutputCollapsed();
            }
            else {
                this.viewUpdateExpanded();
            }
            this._renderedOutputCollapseState = this.viewCell.metadata.outputCollapsed;
            this._renderedInputCollapseState = this.viewCell.metadata.inputCollapsed;
            return true;
        }
        viewUpdateInputCollapsed() {
            DOM.hide(this.templateData.cellContainer);
            DOM.hide(this.templateData.runButtonContainer);
            DOM.show(this.templateData.collapsedPart);
            DOM.show(this.templateData.outputContainer);
            this.templateData.container.classList.toggle('collapsed', true);
            this._outputContainerRenderer.viewUpdateShowOutputs();
            this.relayoutCell();
        }
        viewUpdateOutputCollapsed() {
            DOM.show(this.templateData.cellContainer);
            DOM.show(this.templateData.runButtonContainer);
            DOM.show(this.templateData.collapsedPart);
            DOM.hide(this.templateData.outputContainer);
            this._outputContainerRenderer.viewUpdateHideOuputs();
            this.templateData.container.classList.toggle('collapsed', false);
            this.templateData.container.classList.toggle('output-collapsed', true);
            this.relayoutCell();
        }
        viewUpdateAllCollapsed() {
            DOM.hide(this.templateData.cellContainer);
            DOM.hide(this.templateData.runButtonContainer);
            DOM.show(this.templateData.collapsedPart);
            DOM.hide(this.templateData.outputContainer);
            this.templateData.container.classList.toggle('collapsed', true);
            this.templateData.container.classList.toggle('output-collapsed', true);
            this._outputContainerRenderer.viewUpdateHideOuputs();
            this.relayoutCell();
        }
        viewUpdateExpanded() {
            DOM.show(this.templateData.cellContainer);
            DOM.show(this.templateData.runButtonContainer);
            DOM.hide(this.templateData.collapsedPart);
            DOM.show(this.templateData.outputContainer);
            this.templateData.container.classList.toggle('collapsed', false);
            this.templateData.container.classList.toggle('output-collapsed', false);
            this._outputContainerRenderer.viewUpdateShowOutputs();
            this.relayoutCell();
        }
        layoutEditor(dimension) {
            var _a;
            (_a = this.templateData.editor) === null || _a === void 0 ? void 0 : _a.layout(dimension);
        }
        onCellWidthChange() {
            const realContentHeight = this.templateData.editor.getContentHeight();
            this.viewCell.editorHeight = realContentHeight;
            this.relayoutCell();
            this.layoutEditor({
                width: this.viewCell.layoutInfo.editorWidth,
                height: realContentHeight
            });
        }
        onCellHeightChange(newHeight) {
            const viewLayout = this.templateData.editor.getLayoutInfo();
            this.viewCell.editorHeight = newHeight;
            this.relayoutCell();
            this.layoutEditor({
                width: viewLayout.width,
                height: newHeight
            });
        }
        relayoutCell() {
            this.notebookEditor.layoutNotebookCell(this.viewCell, this.viewCell.layoutInfo.totalHeight);
        }
        dispose() {
            var _a;
            this.viewCell.detachTextEditor();
            this._outputContainerRenderer.dispose();
            (_a = this._untrustedStatusItem) === null || _a === void 0 ? void 0 : _a.dispose();
            this.templateData.focusIndicatorLeft.style.height = 'initial';
            super.dispose();
        }
    };
    CodeCell = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, notebookCellStatusBarService_1.INotebookCellStatusBarService),
        __param(5, opener_1.IOpenerService),
        __param(6, textfiles_1.ITextFileService)
    ], CodeCell);
    exports.CodeCell = CodeCell;
});
//# sourceMappingURL=codeCell.js.map