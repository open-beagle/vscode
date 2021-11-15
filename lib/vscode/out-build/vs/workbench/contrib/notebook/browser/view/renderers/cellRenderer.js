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
define(["require", "exports", "vs/base/common/codicons", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/event", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/ui/progressbar/progressbar", "vs/base/browser/ui/toolbar/toolbar", "vs/base/common/color", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/config/fontInfo", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/modes", "vs/editor/common/modes/textToHtmlTokenizer", "vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/renderers/cellContextKeys", "vs/workbench/contrib/notebook/browser/view/renderers/cellDnd", "vs/workbench/contrib/notebook/browser/view/renderers/cellMenus", "vs/workbench/contrib/notebook/browser/view/renderers/cellWidgets", "vs/workbench/contrib/notebook/browser/view/renderers/codeCell", "vs/workbench/contrib/notebook/browser/view/renderers/markdownCell", "vs/workbench/contrib/notebook/common/notebookCommon", "./cellActionView", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/notebook/browser/view/renderers/cellEditorOptions"], function (require, exports, Codicons, browser_1, DOM, aria, event_1, iconLabels_1, progressbar_1, toolbar_1, color_1, lifecycle_1, platform, codeEditorWidget_1, fontInfo_1, range_1, editorContextKeys_1, modes, textToHtmlTokenizer_1, nls_1, menuEntryActionViewItem_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, keybinding_1, notification_1, constants_1, coreActions_1, notebookBrowser_1, cellContextKeys_1, cellDnd_1, cellMenus_1, cellWidgets_1, codeCell_1, markdownCell_1, notebookCommon_1, cellActionView_1, themeService_1, notebookIcons_1, iconRegistry_1, cellEditorOptions_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ListTopCellToolbar = exports.RunStateRenderer = exports.TimerRenderer = exports.CodeCellRenderer = exports.MarkdownCellRenderer = exports.NotebookCellListDelegate = void 0;
    const $ = DOM.$;
    let NotebookCellListDelegate = class NotebookCellListDelegate {
        constructor(configurationService) {
            this.configurationService = configurationService;
            const editorOptions = this.configurationService.getValue('editor');
            this.lineHeight = fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, (0, browser_1.getZoomLevel)(), (0, browser_1.getPixelRatio)()).lineHeight;
        }
        getHeight(element) {
            return element.getHeight(this.lineHeight);
        }
        hasDynamicHeight(element) {
            return element.hasDynamicHeight();
        }
        getTemplateId(element) {
            if (element.cellKind === notebookCommon_1.CellKind.Markdown) {
                return MarkdownCellRenderer.TEMPLATE_ID;
            }
            else {
                return CodeCellRenderer.TEMPLATE_ID;
            }
        }
    };
    NotebookCellListDelegate = __decorate([
        __param(0, configuration_1.IConfigurationService)
    ], NotebookCellListDelegate);
    exports.NotebookCellListDelegate = NotebookCellListDelegate;
    class AbstractCellRenderer {
        constructor(instantiationService, notebookEditor, contextMenuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, language, dndController) {
            this.instantiationService = instantiationService;
            this.notebookEditor = notebookEditor;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.contextKeyServiceProvider = contextKeyServiceProvider;
            this.dndController = dndController;
            this.editorOptions = new cellEditorOptions_1.CellEditorOptions(configurationService, language);
            this.cellMenus = this.instantiationService.createInstance(cellMenus_1.CellMenus);
        }
        dispose() {
            this.editorOptions.dispose();
        }
        createBetweenCellToolbar(container, disposables, contextKeyService) {
            const toolbar = new toolbar_1.ToolBar(container, this.contextMenuService, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.MenuItemAction) {
                        const item = new cellActionView_1.CodiconActionViewItem(action, this.keybindingService, this.notificationService);
                        return item;
                    }
                    return undefined;
                }
            });
            const cellMenu = this.instantiationService.createInstance(cellMenus_1.CellMenus);
            const menu = disposables.add(cellMenu.getCellInsertionMenu(contextKeyService));
            const updateActions = () => {
                const actions = this.getCellToolbarActions(menu, false);
                toolbar.setActions(actions.primary, actions.secondary);
            };
            disposables.add(menu.onDidChange(() => updateActions()));
            updateActions();
            return toolbar;
        }
        setBetweenCellToolbarContext(templateData, element, context) {
            templateData.betweenCellToolbar.context = context;
            const container = templateData.bottomCellContainer;
            const bottomToolbarOffset = element.layoutInfo.bottomToolbarOffset;
            container.style.top = `${bottomToolbarOffset}px`;
            templateData.elementDisposables.add(element.onDidChangeLayout(() => {
                const bottomToolbarOffset = element.layoutInfo.bottomToolbarOffset;
                container.style.top = `${bottomToolbarOffset}px`;
            }));
        }
        createToolbar(container, elementClass) {
            const toolbar = new toolbar_1.ToolBar(container, this.contextMenuService, {
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                actionViewItemProvider: action => {
                    if (action.id === cellActionView_1.VerticalSeparator.ID) {
                        return new cellActionView_1.VerticalSeparatorViewItem(undefined, action);
                    }
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
                },
                renderDropdownAsChildElement: true
            });
            if (elementClass) {
                toolbar.getElement().classList.add(elementClass);
            }
            return toolbar;
        }
        getCellToolbarActions(menu, alwaysFillSecondaryActions) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, cellActionView_1.createAndFillInActionBarActionsWithVerticalSeparators)(menu, { shouldForwardArgs: true }, result, alwaysFillSecondaryActions, g => /^inline/.test(g));
            return result;
        }
        setupCellToolbarActions(templateData, disposables) {
            const updateActions = () => {
                const actions = this.getCellToolbarActions(templateData.titleMenu, true);
                const hadFocus = DOM.isAncestor(document.activeElement, templateData.toolbar.getElement());
                templateData.toolbar.setActions(actions.primary, actions.secondary);
                if (hadFocus) {
                    this.notebookEditor.focus();
                }
                if (actions.primary.length || actions.secondary.length) {
                    templateData.container.classList.add('cell-has-toolbar-actions');
                    if ((0, notebookBrowser_1.isCodeCellRenderTemplate)(templateData)) {
                        templateData.focusIndicatorLeft.style.top = `${constants_1.EDITOR_TOOLBAR_HEIGHT + constants_1.CELL_TOP_MARGIN}px`;
                        templateData.focusIndicatorRight.style.top = `${constants_1.EDITOR_TOOLBAR_HEIGHT + constants_1.CELL_TOP_MARGIN}px`;
                    }
                }
                else {
                    templateData.container.classList.remove('cell-has-toolbar-actions');
                    if ((0, notebookBrowser_1.isCodeCellRenderTemplate)(templateData)) {
                        templateData.focusIndicatorLeft.style.top = `${constants_1.CELL_TOP_MARGIN}px`;
                        templateData.focusIndicatorRight.style.top = `${constants_1.CELL_TOP_MARGIN}px`;
                    }
                }
            };
            // #103926
            let dropdownIsVisible = false;
            let deferredUpdate;
            updateActions();
            disposables.add(templateData.titleMenu.onDidChange(() => {
                if (this.notebookEditor.isDisposed) {
                    return;
                }
                if (dropdownIsVisible) {
                    deferredUpdate = () => updateActions();
                    return;
                }
                updateActions();
            }));
            templateData.container.classList.toggle('cell-toolbar-dropdown-active', false);
            disposables.add(templateData.toolbar.onDidChangeDropdownVisibility(visible => {
                dropdownIsVisible = visible;
                templateData.container.classList.toggle('cell-toolbar-dropdown-active', visible);
                if (deferredUpdate && !visible) {
                    setTimeout(() => {
                        if (deferredUpdate) {
                            deferredUpdate();
                        }
                    }, 0);
                    deferredUpdate = undefined;
                }
            }));
        }
        commonRenderTemplate(templateData) {
            templateData.disposables.add(DOM.addDisposableListener(templateData.container, DOM.EventType.FOCUS, () => {
                if (templateData.currentRenderedCell) {
                    this.notebookEditor.focusElement(templateData.currentRenderedCell);
                }
            }, true));
            this.addExpandListener(templateData);
        }
        commonRenderElement(element, templateData) {
            if (element.dragging) {
                templateData.container.classList.add(cellDnd_1.DRAGGING_CLASS);
            }
            else {
                templateData.container.classList.remove(cellDnd_1.DRAGGING_CLASS);
            }
        }
        addExpandListener(templateData) {
            templateData.disposables.add((0, event_1.domEvent)(templateData.expandButton, DOM.EventType.CLICK)(() => {
                var _a, _b;
                if (!templateData.currentRenderedCell) {
                    return;
                }
                const textModel = this.notebookEditor.viewModel.notebookDocument;
                const index = textModel.cells.indexOf(templateData.currentRenderedCell.model);
                if (index < 0) {
                    return;
                }
                if ((_a = templateData.currentRenderedCell.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed) {
                    textModel.applyEdits([
                        { editType: 3 /* Metadata */, index, metadata: Object.assign(Object.assign({}, templateData.currentRenderedCell.metadata), { inputCollapsed: false }) }
                    ], true, undefined, () => undefined, undefined);
                }
                else if ((_b = templateData.currentRenderedCell.metadata) === null || _b === void 0 ? void 0 : _b.outputCollapsed) {
                    textModel.applyEdits([
                        { editType: 3 /* Metadata */, index, metadata: Object.assign(Object.assign({}, templateData.currentRenderedCell.metadata), { outputCollapsed: false }) }
                    ], true, undefined, () => undefined, undefined);
                }
            }));
        }
        setupCollapsedPart(container) {
            const collapsedPart = DOM.append(container, $('.cell.cell-collapsed-part', undefined, $('span.expandButton' + themeService_1.ThemeIcon.asCSSSelector(notebookIcons_1.unfoldIcon))));
            const expandButton = collapsedPart.querySelector('.expandButton');
            const keybinding = this.keybindingService.lookupKeybinding(notebookBrowser_1.EXPAND_CELL_INPUT_COMMAND_ID);
            let title = (0, nls_1.localize)(0, null);
            if (keybinding) {
                title += ` (${keybinding.getLabel()})`;
            }
            collapsedPart.title = title;
            DOM.hide(collapsedPart);
            return { collapsedPart, expandButton };
        }
    }
    let MarkdownCellRenderer = class MarkdownCellRenderer extends AbstractCellRenderer {
        constructor(notebookEditor, dndController, renderedEditors, contextKeyServiceProvider, options, configurationService, instantiationService, contextMenuService, keybindingService, notificationService) {
            super(instantiationService, notebookEditor, contextMenuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, 'markdown', dndController);
            this.renderedEditors = renderedEditors;
            this.configurationService = configurationService;
            this.useRenderer = options.useRenderer;
        }
        get templateId() {
            return MarkdownCellRenderer.TEMPLATE_ID;
        }
        renderTemplate(rootContainer) {
            rootContainer.classList.add('markdown-cell-row');
            const container = DOM.append(rootContainer, DOM.$('.cell-inner-container'));
            const disposables = new lifecycle_1.DisposableStore();
            const contextKeyService = disposables.add(this.contextKeyServiceProvider(container));
            const decorationContainer = DOM.append(rootContainer, $('.cell-decoration'));
            const titleToolbarContainer = DOM.append(container, $('.cell-title-toolbar'));
            const toolbar = disposables.add(this.createToolbar(titleToolbarContainer));
            const deleteToolbar = disposables.add(this.createToolbar(titleToolbarContainer, 'cell-delete-toolbar'));
            deleteToolbar.setActions([this.instantiationService.createInstance(coreActions_1.DeleteCellAction)]);
            DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-top'));
            const focusIndicatorLeft = DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left'));
            const focusIndicatorRight = DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right'));
            const codeInnerContent = DOM.append(container, $('.cell.code'));
            const editorPart = DOM.append(codeInnerContent, $('.cell-editor-part'));
            const editorContainer = DOM.append(editorPart, $('.cell-editor-container'));
            editorPart.style.display = 'none';
            const innerContent = DOM.append(container, $('.cell.markdown'));
            const foldingIndicator = DOM.append(focusIndicatorLeft, DOM.$('.notebook-folding-indicator'));
            const { collapsedPart, expandButton } = this.setupCollapsedPart(container);
            const bottomCellContainer = DOM.append(container, $('.cell-bottom-toolbar-container'));
            const betweenCellToolbar = disposables.add(this.createBetweenCellToolbar(bottomCellContainer, disposables, contextKeyService));
            const focusIndicatorBottom = DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-bottom'));
            const statusBar = disposables.add(this.instantiationService.createInstance(cellWidgets_1.CellEditorStatusBar, editorPart));
            const titleMenu = disposables.add(this.cellMenus.getCellTitleMenu(contextKeyService));
            const templateData = {
                useRenderer: this.useRenderer,
                rootContainer,
                collapsedPart,
                expandButton,
                contextKeyService,
                container,
                decorationContainer,
                cellContainer: innerContent,
                editorPart,
                editorContainer,
                focusIndicatorLeft,
                focusIndicatorBottom,
                focusIndicatorRight,
                foldingIndicator,
                disposables,
                elementDisposables: new lifecycle_1.DisposableStore(),
                toolbar,
                deleteToolbar,
                betweenCellToolbar,
                bottomCellContainer,
                titleMenu,
                statusBar,
                toJSON: () => { return {}; }
            };
            if (!this.useRenderer) {
                this.dndController.registerDragHandle(templateData, rootContainer, container, () => this.getDragImage(templateData));
            }
            this.commonRenderTemplate(templateData);
            return templateData;
        }
        getDragImage(templateData) {
            var _a;
            if (((_a = templateData.currentRenderedCell) === null || _a === void 0 ? void 0 : _a.getEditState()) === notebookBrowser_1.CellEditState.Editing) {
                return this.getEditDragImage(templateData);
            }
            else {
                return this.getMarkdownDragImage(templateData);
            }
        }
        getMarkdownDragImage(templateData) {
            const dragImageContainer = DOM.$('.cell-drag-image.monaco-list-row.focused.markdown-cell-row');
            DOM.reset(dragImageContainer, templateData.container.cloneNode(true));
            // Remove all rendered content nodes after the
            const markdownContent = dragImageContainer.querySelector('.cell.markdown');
            const contentNodes = markdownContent === null || markdownContent === void 0 ? void 0 : markdownContent.children[0].children;
            if (contentNodes) {
                for (let i = contentNodes.length - 1; i >= 1; i--) {
                    contentNodes.item(i).remove();
                }
            }
            return dragImageContainer;
        }
        getEditDragImage(templateData) {
            return new CodeCellDragImageRenderer().getDragImage(templateData, templateData.currentEditor, 'markdown');
        }
        renderElement(element, index, templateData, height) {
            if (!this.notebookEditor.hasModel()) {
                throw new Error('The notebook editor is not attached with view model yet.');
            }
            const removedClassNames = [];
            templateData.rootContainer.classList.forEach(className => {
                if (/^nb\-.*$/.test(className)) {
                    removedClassNames.push(className);
                }
            });
            removedClassNames.forEach(className => {
                templateData.rootContainer.classList.remove(className);
            });
            templateData.decorationContainer.innerText = '';
            this.commonRenderElement(element, templateData);
            templateData.currentRenderedCell = element;
            templateData.currentEditor = undefined;
            templateData.editorPart.style.display = 'none';
            templateData.cellContainer.innerText = '';
            if (height === undefined) {
                return;
            }
            const elementDisposables = templateData.elementDisposables;
            const generateCellTopDecorations = () => {
                templateData.decorationContainer.innerText = '';
                element.getCellDecorations().filter(options => options.topClassName !== undefined).forEach(options => {
                    templateData.decorationContainer.append(DOM.$(`.${options.topClassName}`));
                });
            };
            elementDisposables.add(element.onCellDecorationsChanged((e) => {
                const modified = e.added.find(e => e.topClassName) || e.removed.find(e => e.topClassName);
                if (modified) {
                    generateCellTopDecorations();
                }
            }));
            elementDisposables.add(new cellContextKeys_1.CellContextKeyManager(templateData.contextKeyService, this.notebookEditor, element));
            this.updateForLayout(element, templateData);
            elementDisposables.add(element.onDidChangeLayout(() => {
                this.updateForLayout(element, templateData);
            }));
            this.updateForHover(element, templateData);
            const cellEditorOptions = new cellEditorOptions_1.CellEditorOptions(this.configurationService, 'markdown');
            cellEditorOptions.setLineNumbers(element.lineNumbers);
            elementDisposables.add(cellEditorOptions);
            elementDisposables.add(element.onDidChangeState(e => {
                if (e.cellIsHoveredChanged) {
                    this.updateForHover(element, templateData);
                }
                if (e.metadataChanged) {
                    this.updateCollapsedState(element);
                }
                if (e.cellLineNumberChanged) {
                    cellEditorOptions.setLineNumbers(element.lineNumbers);
                }
            }));
            // render toolbar first
            this.setupCellToolbarActions(templateData, elementDisposables);
            const toolbarContext = {
                ui: true,
                cell: element,
                notebookEditor: this.notebookEditor,
                $mid: 12
            };
            templateData.toolbar.context = toolbarContext;
            templateData.deleteToolbar.context = toolbarContext;
            this.setBetweenCellToolbarContext(templateData, element, toolbarContext);
            const scopedInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, templateData.contextKeyService]));
            const markdownCell = scopedInstaService.createInstance(markdownCell_1.StatefulMarkdownCell, this.notebookEditor, element, templateData, this.editorOptions.value, this.renderedEditors, { useRenderer: templateData.useRenderer });
            elementDisposables.add(markdownCell);
            elementDisposables.add(cellEditorOptions.onDidChange(newValue => markdownCell.updateEditorOptions(newValue)));
            templateData.statusBar.update(toolbarContext);
        }
        updateForLayout(element, templateData) {
            templateData.focusIndicatorBottom.style.top = `${element.layoutInfo.totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.CELL_BOTTOM_MARGIN}px`;
            const focusSideHeight = element.layoutInfo.totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP;
            templateData.focusIndicatorLeft.style.height = `${focusSideHeight}px`;
            templateData.focusIndicatorRight.style.height = `${focusSideHeight}px`;
        }
        updateForHover(element, templateData) {
            templateData.container.classList.toggle('markdown-cell-hover', element.cellIsHovered);
        }
        updateCollapsedState(element) {
            var _a;
            if ((_a = element.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed) {
                this.notebookEditor.hideMarkdownPreviews([element]);
            }
            else {
                this.notebookEditor.unhideMarkdownPreviews([element]);
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.clear();
        }
        disposeElement(element, _index, templateData) {
            templateData.elementDisposables.clear();
            element.getCellDecorations().forEach(e => {
                if (e.className) {
                    templateData.container.classList.remove(e.className);
                }
            });
        }
    };
    MarkdownCellRenderer.TEMPLATE_ID = 'markdown_cell';
    MarkdownCellRenderer = __decorate([
        __param(5, configuration_1.IConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, notification_1.INotificationService)
    ], MarkdownCellRenderer);
    exports.MarkdownCellRenderer = MarkdownCellRenderer;
    class EditorTextRenderer {
        getRichText(editor, modelRange) {
            const model = editor.getModel();
            if (!model) {
                return null;
            }
            const colorMap = this.getDefaultColorMap();
            const fontInfo = editor.getOptions().get(40 /* fontInfo */);
            const fontFamilyVar = '--notebook-editor-font-family';
            const fontSizeVar = '--notebook-editor-font-size';
            const fontWeightVar = '--notebook-editor-font-weight';
            const style = ``
                + `color: ${colorMap[1 /* DefaultForeground */]};`
                + `background-color: ${colorMap[2 /* DefaultBackground */]};`
                + `font-family: var(${fontFamilyVar});`
                + `font-weight: var(${fontWeightVar});`
                + `font-size: var(${fontSizeVar});`
                + `line-height: ${fontInfo.lineHeight}px;`
                + `white-space: pre;`;
            const element = DOM.$('div', { style });
            const fontSize = fontInfo.fontSize;
            const fontWeight = fontInfo.fontWeight;
            element.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
            element.style.setProperty(fontSizeVar, `${fontSize}px`);
            element.style.setProperty(fontWeightVar, fontWeight);
            const linesHtml = this.getRichTextLinesAsHtml(model, modelRange, colorMap);
            element.innerHTML = linesHtml;
            return element;
        }
        getRichTextLinesAsHtml(model, modelRange, colorMap) {
            var _a, _b;
            const startLineNumber = modelRange.startLineNumber;
            const startColumn = modelRange.startColumn;
            const endLineNumber = modelRange.endLineNumber;
            const endColumn = modelRange.endColumn;
            const tabSize = model.getOptions().tabSize;
            let result = '';
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const lineTokens = model.getLineTokens(lineNumber);
                const lineContent = lineTokens.getLineContent();
                const startOffset = (lineNumber === startLineNumber ? startColumn - 1 : 0);
                const endOffset = (lineNumber === endLineNumber ? endColumn - 1 : lineContent.length);
                if (lineContent === '') {
                    result += '<br>';
                }
                else {
                    result += (0, textToHtmlTokenizer_1.tokenizeLineToHTML)(lineContent, lineTokens.inflate(), colorMap, startOffset, endOffset, tabSize, platform.isWindows);
                }
            }
            return (_b = (_a = EditorTextRenderer._ttPolicy) === null || _a === void 0 ? void 0 : _a.createHTML(result)) !== null && _b !== void 0 ? _b : result;
        }
        getDefaultColorMap() {
            const colorMap = modes.TokenizationRegistry.getColorMap();
            const result = ['#000000'];
            if (colorMap) {
                for (let i = 1, len = colorMap.length; i < len; i++) {
                    result[i] = color_1.Color.Format.CSS.formatHex(colorMap[i]);
                }
            }
            return result;
        }
    }
    EditorTextRenderer._ttPolicy = (_a = window.trustedTypes) === null || _a === void 0 ? void 0 : _a.createPolicy('cellRendererEditorText', {
        createHTML(input) { return input; }
    });
    class CodeCellDragImageRenderer {
        getDragImage(templateData, editor, type) {
            let dragImage = this.getDragImageImpl(templateData, editor, type);
            if (!dragImage) {
                // TODO@roblourens I don't think this can happen
                dragImage = document.createElement('div');
                dragImage.textContent = '1 cell';
            }
            return dragImage;
        }
        getDragImageImpl(templateData, editor, type) {
            const dragImageContainer = templateData.container.cloneNode(true);
            dragImageContainer.classList.forEach(c => dragImageContainer.classList.remove(c));
            dragImageContainer.classList.add('cell-drag-image', 'monaco-list-row', 'focused', `${type}-cell-row`);
            const editorContainer = dragImageContainer.querySelector('.cell-editor-container');
            if (!editorContainer) {
                return null;
            }
            const richEditorText = new EditorTextRenderer().getRichText(editor, new range_1.Range(1, 1, 1, 1000));
            if (!richEditorText) {
                return null;
            }
            DOM.reset(editorContainer, richEditorText);
            return dragImageContainer;
        }
    }
    let CodeCellRenderer = class CodeCellRenderer extends AbstractCellRenderer {
        constructor(notebookEditor, renderedEditors, dndController, contextKeyServiceProvider, configurationService, contextMenuService, instantiationService, keybindingService, notificationService) {
            super(instantiationService, notebookEditor, contextMenuService, configurationService, keybindingService, notificationService, contextKeyServiceProvider, 'plaintext', dndController);
            this.renderedEditors = renderedEditors;
            this.configurationService = configurationService;
        }
        get templateId() {
            return CodeCellRenderer.TEMPLATE_ID;
        }
        renderTemplate(rootContainer) {
            rootContainer.classList.add('code-cell-row');
            const container = DOM.append(rootContainer, DOM.$('.cell-inner-container'));
            const disposables = new lifecycle_1.DisposableStore();
            const contextKeyService = disposables.add(this.contextKeyServiceProvider(container));
            const decorationContainer = DOM.append(rootContainer, $('.cell-decoration'));
            DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-top'));
            const titleToolbarContainer = DOM.append(container, $('.cell-title-toolbar'));
            const toolbar = disposables.add(this.createToolbar(titleToolbarContainer));
            const deleteToolbar = disposables.add(this.createToolbar(titleToolbarContainer, 'cell-delete-toolbar'));
            deleteToolbar.setActions([this.instantiationService.createInstance(coreActions_1.DeleteCellAction)]);
            const focusIndicator = DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-left'));
            const dragHandle = DOM.append(container, DOM.$('.cell-drag-handle'));
            const cellContainer = DOM.append(container, $('.cell.code'));
            const runButtonContainer = DOM.append(cellContainer, $('.run-button-container'));
            const runToolbar = disposables.add(this.setupRunToolbar(runButtonContainer, contextKeyService, disposables));
            const executionOrderLabel = DOM.append(cellContainer, $('div.execution-count-label'));
            const editorPart = DOM.append(cellContainer, $('.cell-editor-part'));
            const editorContainer = DOM.append(editorPart, $('.cell-editor-container'));
            // create a special context key service that set the inCompositeEditor-contextkey
            const editorContextKeyService = disposables.add(this.contextKeyServiceProvider(editorPart));
            const editorInstaService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, editorContextKeyService]));
            editorContextKeys_1.EditorContextKeys.inCompositeEditor.bindTo(editorContextKeyService).set(true);
            const editor = editorInstaService.createInstance(codeEditorWidget_1.CodeEditorWidget, editorContainer, Object.assign(Object.assign({}, this.editorOptions.value), { dimension: {
                    width: 0,
                    height: 0
                } }), {});
            disposables.add(editor);
            const { collapsedPart, expandButton } = this.setupCollapsedPart(container);
            const progressBar = new progressbar_1.ProgressBar(editorPart);
            progressBar.hide();
            disposables.add(progressBar);
            const statusBar = disposables.add(this.instantiationService.createInstance(cellWidgets_1.CellEditorStatusBar, editorPart));
            const outputContainer = DOM.append(container, $('.output'));
            const outputShowMoreContainer = DOM.append(container, $('.output-show-more-container'));
            const focusIndicatorRight = DOM.append(container, DOM.$('.cell-focus-indicator.cell-focus-indicator-side.cell-focus-indicator-right'));
            const focusSinkElement = DOM.append(container, $('.cell-editor-focus-sink'));
            focusSinkElement.setAttribute('tabindex', '0');
            const bottomCellContainer = DOM.append(container, $('.cell-bottom-toolbar-container'));
            const focusIndicatorBottom = DOM.append(container, $('.cell-focus-indicator.cell-focus-indicator-bottom'));
            const betweenCellToolbar = this.createBetweenCellToolbar(bottomCellContainer, disposables, contextKeyService);
            const titleMenu = disposables.add(this.cellMenus.getCellTitleMenu(contextKeyService));
            const templateData = {
                rootContainer,
                editorPart,
                collapsedPart,
                expandButton,
                contextKeyService,
                container,
                decorationContainer,
                cellContainer,
                progressBar,
                statusBar,
                focusIndicatorLeft: focusIndicator,
                focusIndicatorRight,
                focusIndicatorBottom,
                toolbar,
                deleteToolbar,
                betweenCellToolbar,
                focusSinkElement,
                runToolbar,
                runButtonContainer,
                executionOrderLabel,
                outputContainer,
                outputShowMoreContainer,
                editor,
                disposables,
                elementDisposables: new lifecycle_1.DisposableStore(),
                bottomCellContainer,
                titleMenu,
                dragHandle,
                toJSON: () => { return {}; }
            };
            this.dndController.registerDragHandle(templateData, rootContainer, dragHandle, () => new CodeCellDragImageRenderer().getDragImage(templateData, templateData.editor, 'code'));
            disposables.add(this.addDoubleClickCollapseHandler(templateData));
            disposables.add(DOM.addDisposableListener(focusSinkElement, DOM.EventType.FOCUS, () => {
                if (templateData.currentRenderedCell && templateData.currentRenderedCell.outputsViewModels.length) {
                    this.notebookEditor.focusNotebookCell(templateData.currentRenderedCell, 'output');
                }
            }));
            this.commonRenderTemplate(templateData);
            return templateData;
        }
        addDoubleClickCollapseHandler(templateData) {
            const dragHandleListener = DOM.addDisposableListener(templateData.dragHandle, DOM.EventType.DBLCLICK, e => {
                var _a, _b;
                const cell = templateData.currentRenderedCell;
                if (!cell) {
                    return;
                }
                const clickedOnInput = e.offsetY < cell.layoutInfo.outputContainerOffset;
                const viewModel = this.notebookEditor.viewModel;
                const metadata = clickedOnInput ?
                    { inputCollapsed: !((_a = cell.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed) } :
                    { outputCollapsed: !((_b = cell.metadata) === null || _b === void 0 ? void 0 : _b.outputCollapsed) };
                viewModel.notebookDocument.applyEdits([
                    {
                        editType: 8 /* PartialMetadata */,
                        index: viewModel.getCellIndex(cell),
                        metadata
                    }
                ], true, undefined, () => undefined, undefined);
            });
            const collapsedPartListener = DOM.addDisposableListener(templateData.collapsedPart, DOM.EventType.DBLCLICK, e => {
                var _a;
                const cell = templateData.currentRenderedCell;
                if (!cell) {
                    return;
                }
                const metadata = ((_a = cell.metadata) === null || _a === void 0 ? void 0 : _a.inputCollapsed) ?
                    { inputCollapsed: false } :
                    { outputCollapsed: false };
                const viewModel = this.notebookEditor.viewModel;
                viewModel.notebookDocument.applyEdits([
                    {
                        editType: 8 /* PartialMetadata */,
                        index: viewModel.getCellIndex(cell),
                        metadata
                    }
                ], true, undefined, () => undefined, undefined);
            });
            return (0, lifecycle_1.combinedDisposable)(dragHandleListener, collapsedPartListener);
        }
        setupRunToolbar(runButtonContainer, contextKeyService, disposables) {
            const runToolbar = this.createToolbar(runButtonContainer);
            const runMenu = this.cellMenus.getCellExecuteMenu(contextKeyService);
            const update = () => {
                const actions = this.getCellToolbarActions(runMenu, false);
                runToolbar.setActions(actions.primary, actions.secondary);
            };
            disposables.add(runMenu.onDidChange(() => {
                update();
            }));
            update();
            return runToolbar;
        }
        updateForOutputs(element, templateData) {
            if (element.outputsViewModels.length) {
                DOM.show(templateData.focusSinkElement);
            }
            else {
                DOM.hide(templateData.focusSinkElement);
            }
        }
        updateForMetadata(element, templateData, editorOptions) {
            if (!this.notebookEditor.hasModel()) {
                return;
            }
            const metadata = element.metadata;
            this.updateExecutionOrder(metadata, templateData);
            if (metadata.runState === notebookCommon_1.NotebookCellExecutionState.Executing) {
                templateData.progressBar.infinite().show(500);
            }
            else {
                templateData.progressBar.hide();
            }
        }
        updateExecutionOrder(metadata, templateData) {
            var _a;
            if ((_a = this.notebookEditor.activeKernel) === null || _a === void 0 ? void 0 : _a.implementsExecutionOrder) {
                const executionOrderLabel = typeof metadata.executionOrder === 'number' ?
                    `[${metadata.executionOrder}]` :
                    '[ ]';
                templateData.executionOrderLabel.innerText = executionOrderLabel;
            }
            else {
                templateData.executionOrderLabel.innerText = '';
            }
        }
        updateForHover(element, templateData) {
            templateData.container.classList.toggle('cell-output-hover', element.outputIsHovered);
        }
        updateForFocus(element, templateData) {
            templateData.container.classList.toggle('cell-output-focus', element.outputIsFocused);
        }
        updateForLayout(element, templateData) {
            templateData.focusIndicatorLeft.style.height = `${element.layoutInfo.indicatorHeight}px`;
            templateData.focusIndicatorRight.style.height = `${element.layoutInfo.indicatorHeight}px`;
            templateData.focusIndicatorBottom.style.top = `${element.layoutInfo.totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP - constants_1.CELL_BOTTOM_MARGIN}px`;
            templateData.outputContainer.style.top = `${element.layoutInfo.outputContainerOffset}px`;
            templateData.outputShowMoreContainer.style.top = `${element.layoutInfo.outputShowMoreContainerOffset}px`;
            templateData.dragHandle.style.height = `${element.layoutInfo.totalHeight - constants_1.BOTTOM_CELL_TOOLBAR_GAP}px`;
        }
        renderElement(element, index, templateData, height) {
            if (!this.notebookEditor.hasModel()) {
                throw new Error('The notebook editor is not attached with view model yet.');
            }
            const removedClassNames = [];
            templateData.rootContainer.classList.forEach(className => {
                if (/^nb\-.*$/.test(className)) {
                    removedClassNames.push(className);
                }
            });
            removedClassNames.forEach(className => {
                templateData.rootContainer.classList.remove(className);
            });
            templateData.decorationContainer.innerText = '';
            this.commonRenderElement(element, templateData);
            templateData.currentRenderedCell = element;
            if (height === undefined) {
                return;
            }
            templateData.outputContainer.innerText = '';
            const elementDisposables = templateData.elementDisposables;
            const generateCellTopDecorations = () => {
                templateData.decorationContainer.innerText = '';
                element.getCellDecorations().filter(options => options.topClassName !== undefined).forEach(options => {
                    templateData.decorationContainer.append(DOM.$(`.${options.topClassName}`));
                });
            };
            elementDisposables.add(element.onCellDecorationsChanged((e) => {
                const modified = e.added.find(e => e.topClassName) || e.removed.find(e => e.topClassName);
                if (modified) {
                    generateCellTopDecorations();
                }
            }));
            generateCellTopDecorations();
            elementDisposables.add(this.instantiationService.createInstance(codeCell_1.CodeCell, this.notebookEditor, element, templateData));
            this.renderedEditors.set(element, templateData.editor);
            const cellEditorOptions = new cellEditorOptions_1.CellEditorOptions(this.configurationService, element.language);
            elementDisposables.add(cellEditorOptions);
            elementDisposables.add(cellEditorOptions.onDidChange(newValue => templateData.editor.updateOptions(newValue)));
            templateData.editor.updateOptions(cellEditorOptions.value);
            elementDisposables.add(new cellContextKeys_1.CellContextKeyManager(templateData.contextKeyService, this.notebookEditor, element));
            this.updateForLayout(element, templateData);
            elementDisposables.add(element.onDidChangeLayout(() => {
                this.updateForLayout(element, templateData);
            }));
            this.updateForMetadata(element, templateData, cellEditorOptions);
            this.updateForHover(element, templateData);
            this.updateForFocus(element, templateData);
            cellEditorOptions.setLineNumbers(element.lineNumbers);
            elementDisposables.add(element.onDidChangeState((e) => {
                if (e.metadataChanged) {
                    this.updateForMetadata(element, templateData, cellEditorOptions);
                }
                if (e.outputIsHoveredChanged) {
                    this.updateForHover(element, templateData);
                }
                if (e.outputIsFocusedChanged) {
                    this.updateForFocus(element, templateData);
                }
                if (e.cellLineNumberChanged) {
                    cellEditorOptions.setLineNumbers(element.lineNumbers);
                }
            }));
            elementDisposables.add(this.notebookEditor.viewModel.notebookDocument.onDidChangeContent(e => {
                if (e.rawEvents.find(event => event.kind === notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata)) {
                    this.updateForMetadata(element, templateData, cellEditorOptions);
                }
            }));
            this.updateForOutputs(element, templateData);
            elementDisposables.add(element.onDidChangeOutputs(_e => this.updateForOutputs(element, templateData)));
            this.setupCellToolbarActions(templateData, elementDisposables);
            const toolbarContext = {
                ui: true,
                cell: element,
                cellTemplate: templateData,
                notebookEditor: this.notebookEditor,
                $mid: 12
            };
            templateData.toolbar.context = toolbarContext;
            templateData.runToolbar.context = toolbarContext;
            templateData.deleteToolbar.context = toolbarContext;
            this.setBetweenCellToolbarContext(templateData, element, toolbarContext);
            templateData.statusBar.update(toolbarContext);
        }
        disposeTemplate(templateData) {
            templateData.disposables.clear();
        }
        disposeElement(element, index, templateData, height) {
            templateData.elementDisposables.clear();
            this.renderedEditors.delete(element);
        }
    };
    CodeCellRenderer.TEMPLATE_ID = 'code_cell';
    CodeCellRenderer = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, notification_1.INotificationService)
    ], CodeCellRenderer);
    exports.CodeCellRenderer = CodeCellRenderer;
    class TimerRenderer {
        constructor(container) {
            this.container = container;
            DOM.hide(container);
        }
        start(startTime, adjustment) {
            this.stop();
            DOM.show(this.container);
            const intervalTimer = setInterval(() => {
                const duration = Date.now() - startTime + adjustment;
                this.container.textContent = this.formatDuration(duration);
            }, 100);
            this.intervalTimer = intervalTimer;
            return (0, lifecycle_1.toDisposable)(() => {
                clearInterval(intervalTimer);
            });
        }
        stop() {
            if (this.intervalTimer) {
                clearInterval(this.intervalTimer);
            }
        }
        show(duration) {
            this.stop();
            DOM.show(this.container);
            this.container.textContent = this.formatDuration(duration);
        }
        clear() {
            DOM.hide(this.container);
            this.stop();
            this.container.textContent = '';
        }
        formatDuration(duration) {
            const seconds = Math.floor(duration / 1000);
            const tenths = String(duration - seconds * 1000).charAt(0);
            return `${seconds}.${tenths}s`;
        }
    }
    exports.TimerRenderer = TimerRenderer;
    class RunStateRenderer {
        constructor(element) {
            this.element = element;
            DOM.hide(element);
        }
        clear() {
            if (this.spinnerTimer) {
                clearTimeout(this.spinnerTimer);
                this.spinnerTimer = undefined;
            }
        }
        renderState(runState = notebookCommon_1.NotebookCellExecutionState.Idle, getCellIndex, lastRunSuccess = undefined) {
            if (this.spinnerTimer) {
                this.pendingNewState = runState;
                this.pendingLastRunSuccess = lastRunSuccess;
                return;
            }
            let runStateTooltip;
            if (runState === notebookCommon_1.NotebookCellExecutionState.Idle && lastRunSuccess) {
                aria.alert(`Code cell at ${getCellIndex()} finishes running successfully`);
                DOM.reset(this.element, (0, iconLabels_1.renderIcon)(notebookIcons_1.successStateIcon));
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Idle && !lastRunSuccess) {
                aria.alert(`Code cell at ${getCellIndex()} finishes running with errors`);
                DOM.reset(this.element, (0, iconLabels_1.renderIcon)(notebookIcons_1.errorStateIcon));
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Executing) {
                runStateTooltip = (0, nls_1.localize)(1, null);
                if (this.lastRunState !== notebookCommon_1.NotebookCellExecutionState.Executing) {
                    aria.alert(`Code cell at ${getCellIndex()} starts running`);
                }
                DOM.reset(this.element, (0, iconLabels_1.renderIcon)(iconRegistry_1.syncing));
                this.spinnerTimer = setTimeout(() => {
                    this.spinnerTimer = undefined;
                    if (this.pendingNewState && this.pendingNewState !== runState) {
                        this.renderState(this.pendingNewState, getCellIndex, this.pendingLastRunSuccess);
                        this.pendingNewState = undefined;
                    }
                }, RunStateRenderer.MIN_SPINNER_TIME);
            }
            else if (runState === notebookCommon_1.NotebookCellExecutionState.Pending) {
                // Not spinning
                runStateTooltip = (0, nls_1.localize)(2, null);
                DOM.reset(this.element, (0, iconLabels_1.renderIcon)(Codicons.Codicon.clock));
            }
            else {
                this.element.innerText = '';
            }
            if (runState === notebookCommon_1.NotebookCellExecutionState.Idle && typeof lastRunSuccess !== 'boolean') {
                DOM.hide(this.element);
            }
            else {
                this.element.style.display = 'flex';
            }
            if (runStateTooltip) {
                this.element.setAttribute('title', runStateTooltip);
            }
            this.lastRunState = runState;
        }
    }
    exports.RunStateRenderer = RunStateRenderer;
    RunStateRenderer.MIN_SPINNER_TIME = 200;
    let ListTopCellToolbar = class ListTopCellToolbar extends lifecycle_1.Disposable {
        constructor(notebookEditor, contextKeyService, insertionIndicatorContainer, instantiationService, contextMenuService, keybindingService, notificationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this._modelDisposables = new lifecycle_1.DisposableStore();
            this.topCellToolbar = DOM.append(insertionIndicatorContainer, $('.cell-list-top-cell-toolbar-container'));
            this.toolbar = this._register(new toolbar_1.ToolBar(this.topCellToolbar, this.contextMenuService, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.MenuItemAction) {
                        const item = new cellActionView_1.CodiconActionViewItem(action, this.keybindingService, this.notificationService);
                        return item;
                    }
                    return undefined;
                }
            }));
            this.toolbar.context = {
                notebookEditor
            };
            const cellMenu = this.instantiationService.createInstance(cellMenus_1.CellMenus);
            this.menu = this._register(cellMenu.getCellTopInsertionMenu(contextKeyService));
            this._register(this.menu.onDidChange(() => {
                this.updateActions();
            }));
            this.updateActions();
            // update toolbar container css based on cell list length
            this._register(this.notebookEditor.onDidChangeModel(() => {
                this._modelDisposables.clear();
                if (this.notebookEditor.viewModel) {
                    this._modelDisposables.add(this.notebookEditor.viewModel.onDidChangeViewCells(() => {
                        this.updateClass();
                    }));
                    this.updateClass();
                }
            }));
            this.updateClass();
        }
        updateActions() {
            const actions = this.getCellToolbarActions(this.menu, false);
            this.toolbar.setActions(actions.primary, actions.secondary);
        }
        updateClass() {
            var _a;
            if (((_a = this.notebookEditor.viewModel) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                this.topCellToolbar.classList.add('emptyNotebook');
            }
            else {
                this.topCellToolbar.classList.remove('emptyNotebook');
            }
        }
        getCellToolbarActions(menu, alwaysFillSecondaryActions) {
            const primary = [];
            const secondary = [];
            const result = { primary, secondary };
            (0, cellActionView_1.createAndFillInActionBarActionsWithVerticalSeparators)(menu, { shouldForwardArgs: true }, result, alwaysFillSecondaryActions, g => /^inline/.test(g));
            return result;
        }
    };
    ListTopCellToolbar = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, notification_1.INotificationService)
    ], ListTopCellToolbar);
    exports.ListTopCellToolbar = ListTopCellToolbar;
});
//# sourceMappingURL=cellRenderer.js.map