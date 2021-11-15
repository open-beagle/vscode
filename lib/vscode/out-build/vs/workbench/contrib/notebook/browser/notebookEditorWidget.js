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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uuid", "vs/editor/common/config/fontInfo", "vs/editor/common/services/modeService", "vs/nls!vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/layout/browser/layoutService", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/memento", "vs/workbench/common/theme", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorDecorations", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/notebookEditorKernelManager", "vs/workbench/contrib/notebook/browser/notebookEditorService", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/view/output/outputRenderer", "vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/workbench/contrib/notebook/browser/view/renderers/cellContextKeys", "vs/workbench/contrib/notebook/browser/view/renderers/cellDnd", "vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/markdownCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/scm/browser/dirtydiffDecorator", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/notebook/browser/view/renderers/cellMenus", "vs/base/browser/ui/toolbar/toolbar", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/experiment/common/experimentService", "vs/workbench/services/editor/common/editorService", "vs/base/common/platform", "vs/workbench/contrib/notebook/common/notebookPerformance", "vs/editor/browser/config/configuration", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/notebookEditorWidgetContextKeys", "vs/css!./media/notebook"], function (require, exports, browser_1, DOM, aria, async_1, color_1, errors_1, event_1, lifecycle_1, resources_1, uuid_1, fontInfo_1, modeService_1, nls, menuEntryActionViewItem_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, layoutService_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, editorPane_1, memento_1, theme_1, debugColors_1, constants_1, notebookBrowser_1, notebookEditorDecorations_1, notebookEditorExtensions_1, notebookEditorKernelManager_1, notebookEditorService_1, notebookCellList_1, outputRenderer_1, backLayerWebView_1, cellContextKeys_1, cellDnd_1, cellRenderer_1, codeCellViewModel_1, eventDispatcher_1, markdownCellViewModel_1, notebookViewModel_1, notebookCommon_1, dirtydiffDecorator_1, accessibility_1, cellMenus_1, toolbar_1, keybinding_1, experimentService_1, editorService_1, platform_1, notebookPerformance_1, configuration_2, notebookKernelService_1, notebookEditorWidgetContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cellSymbolHighlight = exports.listScrollbarSliderActiveBackground = exports.listScrollbarSliderHoverBackground = exports.listScrollbarSliderBackground = exports.cellInsertionIndicator = exports.cellStatusBarItemHover = exports.inactiveFocusedCellBorder = exports.focusedCellBorder = exports.inactiveSelectedCellBorder = exports.selectedCellBorder = exports.cellHoverBackground = exports.selectedCellBackground = exports.focusedCellBackground = exports.CELL_TOOLBAR_SEPERATOR = exports.notebookOutputContainerColor = exports.cellStatusIconRunning = exports.cellStatusIconError = exports.cellStatusIconSuccess = exports.focusedEditorBorderColor = exports.notebookCellBorder = exports.NotebookEditorWidget = exports.ListViewInfoAccessor = void 0;
    const $ = DOM.$;
    class ListViewInfoAccessor extends lifecycle_1.Disposable {
        constructor(list) {
            super();
            this.list = list;
        }
        revealCellRangeInView(range) {
            return this.list.revealElementsInView(range);
        }
        revealInView(cell) {
            this.list.revealElementInView(cell);
        }
        revealInViewAtTop(cell) {
            this.list.revealElementInViewAtTop(cell);
        }
        revealInCenterIfOutsideViewport(cell) {
            this.list.revealElementInCenterIfOutsideViewport(cell);
        }
        async revealInCenterIfOutsideViewportAsync(cell) {
            return this.list.revealElementInCenterIfOutsideViewportAsync(cell);
        }
        revealInCenter(cell) {
            this.list.revealElementInCenter(cell);
        }
        async revealLineInViewAsync(cell, line) {
            return this.list.revealElementLineInViewAsync(cell, line);
        }
        async revealLineInCenterAsync(cell, line) {
            return this.list.revealElementLineInCenterAsync(cell, line);
        }
        async revealLineInCenterIfOutsideViewportAsync(cell, line) {
            return this.list.revealElementLineInCenterIfOutsideViewportAsync(cell, line);
        }
        async revealRangeInViewAsync(cell, range) {
            return this.list.revealElementRangeInViewAsync(cell, range);
        }
        async revealRangeInCenterAsync(cell, range) {
            return this.list.revealElementRangeInCenterAsync(cell, range);
        }
        async revealRangeInCenterIfOutsideViewportAsync(cell, range) {
            return this.list.revealElementRangeInCenterIfOutsideViewportAsync(cell, range);
        }
        getViewIndex(cell) {
            var _a;
            return (_a = this.list.getViewIndex(cell)) !== null && _a !== void 0 ? _a : -1;
        }
        getViewHeight(cell) {
            if (!this.list.viewModel) {
                return -1;
            }
            return this.list.elementHeight(cell);
        }
        getCellRangeFromViewRange(startIndex, endIndex) {
            if (!this.list.viewModel) {
                return undefined;
            }
            const modelIndex = this.list.getModelIndex2(startIndex);
            if (modelIndex === undefined) {
                throw new Error(`startIndex ${startIndex} out of boundary`);
            }
            if (endIndex >= this.list.length) {
                // it's the end
                const endModelIndex = this.list.viewModel.length;
                return { start: modelIndex, end: endModelIndex };
            }
            else {
                const endModelIndex = this.list.getModelIndex2(endIndex);
                if (endModelIndex === undefined) {
                    throw new Error(`endIndex ${endIndex} out of boundary`);
                }
                return { start: modelIndex, end: endModelIndex };
            }
        }
        getCellsFromViewRange(startIndex, endIndex) {
            if (!this.list.viewModel) {
                return [];
            }
            const range = this.getCellRangeFromViewRange(startIndex, endIndex);
            if (!range) {
                return [];
            }
            return this.list.viewModel.getCells(range);
        }
        setCellEditorSelection(cell, range) {
            this.list.setCellSelection(cell, range);
        }
        setHiddenAreas(_ranges) {
            return this.list.setHiddenAreas(_ranges, true);
        }
        getVisibleRangesPlusViewportAboveBelow() {
            var _a, _b;
            return (_b = (_a = this.list) === null || _a === void 0 ? void 0 : _a.getVisibleRangesPlusViewportAboveBelow()) !== null && _b !== void 0 ? _b : [];
        }
        triggerScroll(event) {
            this.list.triggerScrollFromMouseWheelEvent(event);
        }
    }
    exports.ListViewInfoAccessor = ListViewInfoAccessor;
    let NotebookEditorWidget = class NotebookEditorWidget extends lifecycle_1.Disposable {
        constructor(creationOptions, instantiationService, storageService, accessibilityService, notebookEditorService, notebookKernelService, editorService, configurationService, contextKeyService, layoutService, contextMenuService, menuService, themeService, telemetryService, modeService, keybindingService, experimentService) {
            super();
            this.creationOptions = creationOptions;
            this.notebookEditorService = notebookEditorService;
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.layoutService = layoutService;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
            this.themeService = themeService;
            this.telemetryService = telemetryService;
            this.modeService = modeService;
            this.keybindingService = keybindingService;
            this.experimentService = experimentService;
            this._webview = null;
            this._webviewResolvePromise = null;
            this._webviewTransparentCover = null;
            this._dndController = null;
            this._listTopCellToolbar = null;
            this._renderedEditors = new Map();
            this._localStore = this._register(new lifecycle_1.DisposableStore());
            this._localCellStateListeners = [];
            this._dimension = null;
            this._shadowElementViewInfo = null;
            this._contributions = new Map();
            this._onDidFocusEmitter = this._register(new event_1.Emitter());
            this.onDidFocus = this._onDidFocusEmitter.event;
            this._onDidBlurEmitter = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlurEmitter.event;
            this._insetModifyQueueByOutputId = new async_1.SequencerByKey();
            this._cellContextKeyManager = null;
            this._isVisible = false;
            this._uuid = (0, uuid_1.generateUuid)();
            this._webiewFocused = false;
            this._isDisposed = false;
            this.useRenderer = false;
            this._onDidChangeModel = this._register(new event_1.Emitter());
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._onDidFocusEditorWidget = this._register(new event_1.Emitter());
            this.onDidFocusEditorWidget = this._onDidFocusEditorWidget.event;
            this._onDidChangeActiveEditor = this._register(new event_1.Emitter());
            this.onDidChangeActiveEditor = this._onDidChangeActiveEditor.event;
            this._onDidScroll = this._register(new event_1.Emitter());
            this.onDidScroll = this._onDidScroll.event;
            this._onDidChangeActiveCell = this._register(new event_1.Emitter());
            this.onDidChangeActiveCell = this._onDidChangeActiveCell.event;
            this._cursorNavigationMode = false;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this._onDidChangeVisibleRanges = this._register(new event_1.Emitter());
            this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
            this._debugFlag = false;
            this._frameId = 0;
            this._toolbarActionDisposable = this._register(new lifecycle_1.DisposableStore());
            this._useGlobalToolbar = false;
            this._editorToolbarDisposable = this._register(new lifecycle_1.DisposableStore());
            //#endregion
            //#region Decorations
            this._editorStyleSheets = new Map();
            this._decorationRules = new Map();
            this._decortionKeyToIds = new Map();
            //#endregion
            //#region Mouse Events
            this._onMouseUp = this._register(new event_1.Emitter());
            this.onMouseUp = this._onMouseUp.event;
            this._onMouseDown = this._register(new event_1.Emitter());
            this.onMouseDown = this._onMouseDown.event;
            //#endregion
            //#region Cell operations/layout API
            this._pendingLayouts = new WeakMap();
            //#region --- webview IPC ----
            this._onDidReceiveMessage = new event_1.Emitter();
            this.onDidReceiveMessage = this._onDidReceiveMessage.event;
            this.isEmbedded = creationOptions.isEmbedded || false;
            this.useRenderer = !platform_1.isWeb && !!this.configurationService.getValue(notebookCommon_1.ExperimentalUseMarkdownRenderer) && !accessibilityService.isScreenReaderOptimized();
            this._overlayContainer = document.createElement('div');
            this.scopedContextKeyService = contextKeyService.createScoped(this._overlayContainer);
            this.instantiationService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this.scopedContextKeyService]));
            this._register(this.instantiationService.createInstance(notebookEditorWidgetContextKeys_1.NotebookEditorContextKeys, this));
            this._kernelManger = this.instantiationService.createInstance(notebookEditorKernelManager_1.NotebookEditorKernelManager);
            this._register(notebookKernelService.onDidChangeNotebookKernelBinding(e => {
                var _a;
                if ((0, resources_1.isEqual)(e.notebook, (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.uri)) {
                    this._loadKernelPreloads();
                }
            }));
            this._memento = new memento_1.Memento(notebookBrowser_1.NOTEBOOK_EDITOR_ID, storageService);
            this._outputRenderer = new outputRenderer_1.OutputRenderer(this, this.instantiationService);
            this._scrollBeyondLastLine = this.configurationService.getValue('editor.scrollBeyondLastLine');
            this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.scrollBeyondLastLine')) {
                    this._scrollBeyondLastLine = this.configurationService.getValue('editor.scrollBeyondLastLine');
                    if (this._dimension && this._isVisible) {
                        this.layout(this._dimension);
                    }
                }
                if (e.affectsConfiguration(notebookCommon_1.CellToolbarLocKey) || e.affectsConfiguration(notebookCommon_1.ShowCellStatusBarKey)) {
                    this._updateForNotebookConfiguration();
                }
            });
            this.notebookEditorService.addNotebookEditor(this);
            const id = (0, uuid_1.generateUuid)();
            this._overlayContainer.id = `notebook-${id}`;
            this._overlayContainer.className = 'notebookOverlay';
            this._overlayContainer.classList.add('notebook-editor');
            this._overlayContainer.style.visibility = 'hidden';
            this.layoutService.container.appendChild(this._overlayContainer);
            this._createBody(this._overlayContainer);
            this._generateFontInfo();
            this._isVisible = true;
            this._editorFocus = notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED.bindTo(this.scopedContextKeyService);
            this._outputFocus = notebookBrowser_1.NOTEBOOK_OUTPUT_FOCUSED.bindTo(this.scopedContextKeyService);
            this._editorEditable = notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE.bindTo(this.scopedContextKeyService);
            let contributions;
            if (Array.isArray(this.creationOptions.contributions)) {
                contributions = this.creationOptions.contributions;
            }
            else {
                contributions = notebookEditorExtensions_1.NotebookEditorExtensionsRegistry.getEditorContributions();
            }
            for (const desc of contributions) {
                try {
                    const contribution = this.instantiationService.createInstance(desc.ctor, this);
                    this._contributions.set(desc.id, contribution);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
            this._updateForNotebookConfiguration();
            if (this._debugFlag) {
                this._domFrameLog();
            }
        }
        get isDisposed() {
            return this._isDisposed;
        }
        set viewModel(newModel) {
            this._notebookViewModel = newModel;
            this._onDidChangeModel.fire(newModel === null || newModel === void 0 ? void 0 : newModel.notebookDocument);
        }
        get viewModel() {
            return this._notebookViewModel;
        }
        get textModel() {
            var _a;
            return (_a = this._notebookViewModel) === null || _a === void 0 ? void 0 : _a.notebookDocument;
        }
        get activeCodeEditor() {
            if (this._isDisposed) {
                return;
            }
            const [focused] = this._list.getFocusedElements();
            return this._renderedEditors.get(focused);
        }
        get cursorNavigationMode() {
            return this._cursorNavigationMode;
        }
        set cursorNavigationMode(v) {
            this._cursorNavigationMode = v;
        }
        get onDidChangeSelection() { return this._onDidChangeSelection.event; }
        get visibleRanges() {
            return this._list.visibleRanges || [];
        }
        _domFrameLog() {
            DOM.scheduleAtNextAnimationFrame(() => {
                this._frameId++;
                this._domFrameLog();
            }, 1000000);
        }
        _debug(...args) {
            if (!this._debugFlag) {
                return;
            }
            const date = new Date();
            console.log(`${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, '0')}`, `frame #${this._frameId}: `, ...args);
        }
        /**
         * EditorId
         */
        getId() {
            return this._uuid;
        }
        getSelections() {
            var _a, _b;
            return (_b = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.getSelections()) !== null && _b !== void 0 ? _b : [];
        }
        getFocus() {
            var _a, _b;
            return (_b = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.getFocus()) !== null && _b !== void 0 ? _b : { start: 0, end: 0 };
        }
        getSelectionViewModels() {
            if (!this.viewModel) {
                return [];
            }
            const cellsSet = new Set();
            return this.viewModel.getSelections().map(range => this.viewModel.viewCells.slice(range.start, range.end)).reduce((a, b) => {
                b.forEach(cell => {
                    if (!cellsSet.has(cell.handle)) {
                        cellsSet.add(cell.handle);
                        a.push(cell);
                    }
                });
                return a;
            }, []);
        }
        hasModel() {
            return !!this._notebookViewModel;
        }
        //#region Editor Core
        getEditorMemento(editorGroupService, key, limit = 10) {
            const mementoKey = `${notebookBrowser_1.NOTEBOOK_EDITOR_ID}${key}`;
            let editorMemento = NotebookEditorWidget.EDITOR_MEMENTOS.get(mementoKey);
            if (!editorMemento) {
                editorMemento = new editorPane_1.EditorMemento(notebookBrowser_1.NOTEBOOK_EDITOR_ID, key, this.getMemento(1 /* WORKSPACE */), limit, editorGroupService);
                NotebookEditorWidget.EDITOR_MEMENTOS.set(mementoKey, editorMemento);
            }
            return editorMemento;
        }
        getMemento(scope) {
            return this._memento.getMemento(scope, 1 /* MACHINE */);
        }
        _updateForNotebookConfiguration() {
            var _a;
            if (!this._overlayContainer) {
                return;
            }
            const cellToolbarLocation = this.configurationService.getValue(notebookCommon_1.CellToolbarLocKey);
            this._overlayContainer.classList.remove('cell-title-toolbar-left');
            this._overlayContainer.classList.remove('cell-title-toolbar-right');
            this._overlayContainer.classList.remove('cell-title-toolbar-hidden');
            if (typeof cellToolbarLocation === 'string') {
                if (cellToolbarLocation === 'left' || cellToolbarLocation === 'right' || cellToolbarLocation === 'hidden') {
                    this._overlayContainer.classList.add(`cell-title-toolbar-${cellToolbarLocation}`);
                }
            }
            else {
                if (this.viewModel) {
                    const notebookSpecificSetting = (_a = cellToolbarLocation[this.viewModel.viewType]) !== null && _a !== void 0 ? _a : cellToolbarLocation['default'];
                    let cellToolbarLocationForCurrentView = 'right';
                    switch (notebookSpecificSetting) {
                        case 'left':
                            cellToolbarLocationForCurrentView = 'left';
                            break;
                        case 'right':
                            cellToolbarLocationForCurrentView = 'right';
                        case 'hidden':
                            cellToolbarLocationForCurrentView = 'hidden';
                        default:
                            cellToolbarLocationForCurrentView = 'right';
                            break;
                    }
                    this._overlayContainer.classList.add(`cell-title-toolbar-${cellToolbarLocationForCurrentView}`);
                }
                else {
                    this._overlayContainer.classList.add(`cell-title-toolbar-right`);
                }
            }
            const showCellStatusBar = this.configurationService.getValue(notebookCommon_1.ShowCellStatusBarKey);
            this._overlayContainer.classList.toggle('cell-statusbar-hidden', !showCellStatusBar);
        }
        _generateFontInfo() {
            const editorOptions = this.configurationService.getValue('editor');
            this._fontInfo = (0, configuration_2.readFontInfo)(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, (0, browser_1.getZoomLevel)(), (0, browser_1.getPixelRatio)()));
        }
        _createBody(parent) {
            this._notebookTopToolbarContainer = document.createElement('div');
            this._notebookTopToolbarContainer.classList.add('notebook-top-toolbar');
            this._notebookTopToolbarContainer.style.display = 'none';
            DOM.append(parent, this._notebookTopToolbarContainer);
            this._body = document.createElement('div');
            this._body.classList.add('cell-list-container');
            this._createCellList();
            DOM.append(parent, this._body);
            this._overflowContainer = document.createElement('div');
            this._overflowContainer.classList.add('notebook-overflow-widget-container', 'monaco-editor');
            DOM.append(parent, this._overflowContainer);
        }
        _createCellList() {
            this._body.classList.add('cell-list-container');
            this._dndController = this._register(new cellDnd_1.CellDragAndDropController(this, this._body));
            const getScopedContextKeyService = (container) => this._list.contextKeyService.createScoped(container);
            const renderers = [
                this.instantiationService.createInstance(cellRenderer_1.CodeCellRenderer, this, this._renderedEditors, this._dndController, getScopedContextKeyService),
                this.instantiationService.createInstance(cellRenderer_1.MarkdownCellRenderer, this, this._dndController, this._renderedEditors, getScopedContextKeyService, { useRenderer: this.useRenderer }),
            ];
            this._list = this.instantiationService.createInstance(notebookCellList_1.NotebookCellList, 'NotebookCellList', this._overlayContainer, this._body, this.instantiationService.createInstance(cellRenderer_1.NotebookCellListDelegate), renderers, this.scopedContextKeyService, {
                setRowLineHeight: false,
                setRowHeight: false,
                supportDynamicHeights: true,
                horizontalScrolling: false,
                keyboardSupport: false,
                mouseSupport: true,
                multipleSelectionSupport: true,
                selectionNavigation: true,
                enableKeyboardNavigation: true,
                additionalScrollHeight: 0,
                transformOptimization: false,
                styleController: (_suffix) => { return this._list; },
                overrideStyles: {
                    listBackground: colorRegistry_1.editorBackground,
                    listActiveSelectionBackground: colorRegistry_1.editorBackground,
                    listActiveSelectionForeground: colorRegistry_1.foreground,
                    listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                    listFocusAndSelectionForeground: colorRegistry_1.foreground,
                    listFocusBackground: colorRegistry_1.editorBackground,
                    listFocusForeground: colorRegistry_1.foreground,
                    listHoverForeground: colorRegistry_1.foreground,
                    listHoverBackground: colorRegistry_1.editorBackground,
                    listHoverOutline: colorRegistry_1.focusBorder,
                    listFocusOutline: colorRegistry_1.focusBorder,
                    listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                    listInactiveSelectionForeground: colorRegistry_1.foreground,
                    listInactiveFocusBackground: colorRegistry_1.editorBackground,
                    listInactiveFocusOutline: colorRegistry_1.editorBackground,
                },
                accessibilityProvider: {
                    getAriaLabel: (element) => {
                        if (!this.viewModel) {
                            return '';
                        }
                        const index = this.viewModel.getCellIndex(element);
                        if (index >= 0) {
                            return `Cell ${index}, ${element.cellKind === notebookCommon_1.CellKind.Markdown ? 'markdown' : 'code'}  cell`;
                        }
                        return '';
                    },
                    getWidgetAriaLabel() {
                        return nls.localize(0, null);
                    }
                },
                focusNextPreviousDelegate: {
                    onFocusNext: (applyFocusNext) => this._updateForCursorNavigationMode(applyFocusNext),
                    onFocusPrevious: (applyFocusPrevious) => this._updateForCursorNavigationMode(applyFocusPrevious),
                }
            });
            this._dndController.setList(this._list);
            // create Webview
            this._register(this._list);
            this._listViewInfoAccessor = new ListViewInfoAccessor(this._list);
            this._register(this._listViewInfoAccessor);
            this._register((0, lifecycle_1.combinedDisposable)(...renderers));
            // top cell toolbar
            this._listTopCellToolbar = this._register(this.instantiationService.createInstance(cellRenderer_1.ListTopCellToolbar, this, this.scopedContextKeyService, this._list.rowsContainer));
            // transparent cover
            this._webviewTransparentCover = DOM.append(this._list.rowsContainer, $('.webview-cover'));
            this._webviewTransparentCover.style.display = 'none';
            this._register(DOM.addStandardDisposableGenericMouseDownListner(this._overlayContainer, (e) => {
                if (e.target.classList.contains('slider') && this._webviewTransparentCover) {
                    this._webviewTransparentCover.style.display = 'block';
                }
            }));
            this._register(DOM.addStandardDisposableGenericMouseUpListner(this._overlayContainer, () => {
                if (this._webviewTransparentCover) {
                    // no matter when
                    this._webviewTransparentCover.style.display = 'none';
                }
            }));
            this._register(this._list.onMouseDown(e => {
                if (e.element) {
                    this._onMouseDown.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onMouseUp(e => {
                if (e.element) {
                    this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this._register(this._list.onDidChangeFocus(_e => {
                this._onDidChangeActiveEditor.fire(this);
                this._onDidChangeActiveCell.fire();
                this._cursorNavigationMode = false;
            }));
            this._register(this._list.onContextMenu(e => {
                this.showListContextMenu(e);
            }));
            this._register(this._list.onDidChangeVisibleRanges(() => {
                this._onDidChangeVisibleRanges.fire();
            }));
            this._register(this._list.onDidScroll(() => {
                this._onDidScroll.fire();
            }));
            const widgetFocusTracker = DOM.trackFocus(this.getDomNode());
            this._register(widgetFocusTracker);
            this._register(widgetFocusTracker.onDidFocus(() => this._onDidFocusEmitter.fire()));
            this._register(widgetFocusTracker.onDidBlur(() => this._onDidBlurEmitter.fire()));
            this._reigsterNotebookActionsToolbar();
            this._register(this.editorService.onDidActiveEditorChange(() => {
                var _a;
                if (((_a = this.editorService.activeEditorPane) === null || _a === void 0 ? void 0 : _a.getId()) === notebookBrowser_1.NOTEBOOK_EDITOR_ID) {
                    const notebookEditor = this.editorService.activeEditorPane.getControl();
                    if (notebookEditor === this) {
                        // this is the active editor
                        this._showNotebookActionsinEditorToolbar();
                        return;
                    }
                }
                this._editorToolbarDisposable.clear();
                this._toolbarActionDisposable.clear();
            }));
        }
        showListContextMenu(e) {
            this.contextMenuService.showContextMenu({
                getActions: () => {
                    const result = [];
                    const menu = this.menuService.createMenu(actions_1.MenuId.NotebookCellTitle, this.scopedContextKeyService);
                    (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, result);
                    menu.dispose();
                    return result;
                },
                getAnchor: () => e.anchor
            });
        }
        _reigsterNotebookActionsToolbar() {
            var _a;
            const cellMenu = this.instantiationService.createInstance(cellMenus_1.CellMenus);
            this._notebookGlobalActionsMenu = this._register(cellMenu.getNotebookToolbar(this.scopedContextKeyService));
            this._register(this._notebookGlobalActionsMenu);
            this._useGlobalToolbar = (_a = this.configurationService.getValue('notebook.experimental.globalToolbar')) !== null && _a !== void 0 ? _a : false;
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('notebook.experimental.globalToolbar')) {
                    this._useGlobalToolbar = this.configurationService.getValue('notebook.experimental.globalToolbar');
                    this._showNotebookActionsinEditorToolbar();
                }
            }));
            this._topToolbar = new toolbar_1.ToolBar(this._notebookTopToolbarContainer, this.contextMenuService, {
                getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
                actionViewItemProvider: action => {
                    return (0, menuEntryActionViewItem_1.createActionViewItem)(this.instantiationService, action);
                },
                renderDropdownAsChildElement: true
            });
            this._register(this._topToolbar);
            this._topToolbar.context = {
                ui: true,
                notebookEditor: this
            };
            this._showNotebookActionsinEditorToolbar();
            this._register(this._notebookGlobalActionsMenu.onDidChange(() => {
                this._showNotebookActionsinEditorToolbar();
            }));
            if (this.experimentService) {
                this.experimentService.getTreatment('nbtoolbarineditor').then(treatment => {
                    if (treatment === undefined) {
                        return;
                    }
                    if (this._useGlobalToolbar !== treatment) {
                        this._useGlobalToolbar = treatment;
                        this._showNotebookActionsinEditorToolbar();
                    }
                });
            }
        }
        _showNotebookActionsinEditorToolbar() {
            // when there is no view model, just ignore.
            if (!this.viewModel) {
                return;
            }
            if (!this._useGlobalToolbar) {
                // schedule actions registration in next frame, otherwise we are seeing duplicated notbebook actions temporarily
                this._editorToolbarDisposable.clear();
                this._editorToolbarDisposable.add(DOM.scheduleAtNextAnimationFrame(() => {
                    var _a;
                    const groups = this._notebookGlobalActionsMenu.getActions({ shouldForwardArgs: true });
                    this._toolbarActionDisposable.clear();
                    this._topToolbar.setActions([], []);
                    if (!this.viewModel) {
                        return;
                    }
                    if (!this._isVisible) {
                        return;
                    }
                    if (((_a = this.editorService.activeEditorPane) === null || _a === void 0 ? void 0 : _a.getId()) === notebookBrowser_1.NOTEBOOK_EDITOR_ID) {
                        const notebookEditor = this.editorService.activeEditorPane.getControl();
                        if (notebookEditor !== this) {
                            // clear actions but not recreate because it is not active editor
                            return;
                        }
                    }
                    groups.forEach(group => {
                        var _a;
                        const groupName = group[0];
                        const actions = group[1];
                        let order = groupName === 'navigation' ? -10 : 0;
                        for (let i = 0; i < actions.length; i++) {
                            const menuItemAction = actions[i];
                            this._toolbarActionDisposable.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
                                command: {
                                    id: menuItemAction.item.id,
                                    title: menuItemAction.item.title,
                                    category: menuItemAction.item.category,
                                    tooltip: menuItemAction.item.tooltip,
                                    icon: menuItemAction.item.icon,
                                    precondition: menuItemAction.item.precondition,
                                    toggled: menuItemAction.item.toggled,
                                },
                                title: menuItemAction.item.title + ' ' + ((_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.uri.scheme),
                                group: groupName,
                                order: order
                            }));
                            order++;
                        }
                    });
                }));
                this._notebookTopToolbarContainer.style.display = 'none';
            }
            else {
                this._toolbarActionDisposable.clear();
                this._topToolbar.setActions([], []);
                const groups = this._notebookGlobalActionsMenu.getActions({ shouldForwardArgs: true });
                this._notebookTopToolbarContainer.style.display = 'flex';
                const primaryGroup = groups.find(group => group[0] === 'navigation');
                const primaryActions = primaryGroup ? primaryGroup[1] : [];
                const secondaryActions = groups.filter(group => group[0] !== 'navigation').reduce((prev, curr) => { prev.push(...curr[1]); return prev; }, []);
                this._topToolbar.setActions(primaryActions, secondaryActions);
            }
            if (this._dimension && this._isVisible) {
                this.layout(this._dimension);
            }
        }
        _updateForCursorNavigationMode(applyFocusChange) {
            if (this._cursorNavigationMode) {
                // Will fire onDidChangeFocus, resetting the state to Container
                applyFocusChange();
                const newFocusedCell = this._list.getFocusedElements()[0];
                if (newFocusedCell.cellKind === notebookCommon_1.CellKind.Code || newFocusedCell.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                    this.focusNotebookCell(newFocusedCell, 'editor');
                }
                else {
                    // Reset to "Editor", the state has not been consumed
                    this._cursorNavigationMode = true;
                }
            }
            else {
                applyFocusChange();
            }
        }
        getDomNode() {
            return this._overlayContainer;
        }
        getOverflowContainerDomNode() {
            return this._overflowContainer;
        }
        getInnerWebview() {
            var _a;
            return (_a = this._webview) === null || _a === void 0 ? void 0 : _a.webview;
        }
        setParentContextKeyService(parentContextKeyService) {
            this.scopedContextKeyService.updateParent(parentContextKeyService);
        }
        async setModel(textModel, viewState) {
            var _a;
            if (this.viewModel === undefined || !this.viewModel.equal(textModel)) {
                this._detachModel();
                await this._attachModel(textModel, viewState);
                this.telemetryService.publicLog2('notebook/editorOpened', {
                    scheme: textModel.uri.scheme,
                    ext: (0, resources_1.extname)(textModel.uri),
                    viewType: textModel.viewType
                });
            }
            else {
                this.restoreListViewState(viewState);
            }
            // load preloads for matching kernel
            this._loadKernelPreloads();
            // clear state
            (_a = this._dndController) === null || _a === void 0 ? void 0 : _a.clearGlobalDragState();
            this._localStore.add(this._list.onDidChangeFocus(() => {
                this.updateContextKeysOnFocusChange();
            }));
            this.updateContextKeysOnFocusChange();
        }
        updateContextKeysOnFocusChange() {
            if (!this.viewModel) {
                return;
            }
            const focused = this._list.getFocusedElements()[0];
            if (focused) {
                if (!this._cellContextKeyManager) {
                    this._cellContextKeyManager = this._localStore.add(new cellContextKeys_1.CellContextKeyManager(this.scopedContextKeyService, this, focused));
                }
                this._cellContextKeyManager.updateForElement(focused);
            }
        }
        async setOptions(options) {
            var _a, _b;
            if (!this.hasModel()) {
                return;
            }
            if ((options === null || options === void 0 ? void 0 : options.isReadOnly) !== undefined) {
                this.viewModel.updateOptions({ isReadOnly: options.isReadOnly });
            }
            // reveal cell if editor options tell to do so
            if (options === null || options === void 0 ? void 0 : options.cellOptions) {
                const cellOptions = options.cellOptions;
                const cell = this.viewModel.viewCells.find(cell => cell.uri.toString() === cellOptions.resource.toString());
                if (cell) {
                    this.focusElement(cell);
                    await this.revealInCenterIfOutsideViewportAsync(cell);
                    const editor = this._renderedEditors.get(cell);
                    if (editor) {
                        if ((_a = cellOptions.options) === null || _a === void 0 ? void 0 : _a.selection) {
                            const { selection } = cellOptions.options;
                            editor.setSelection(Object.assign(Object.assign({}, selection), { endLineNumber: selection.endLineNumber || selection.startLineNumber, endColumn: selection.endColumn || selection.startColumn }));
                            editor.revealPositionInCenterIfOutsideViewport({
                                lineNumber: selection.startLineNumber,
                                column: selection.startColumn
                            });
                            await this.revealLineInCenterIfOutsideViewportAsync(cell, selection.startLineNumber);
                        }
                        if (!((_b = cellOptions.options) === null || _b === void 0 ? void 0 : _b.preserveFocus)) {
                            editor.focus();
                        }
                    }
                }
            }
            // select cells if options tell to do so
            // todo@rebornix https://github.com/microsoft/vscode/issues/118108 support selections not just focus
            // todo@rebornix support multipe selections
            if (options === null || options === void 0 ? void 0 : options.cellSelections) {
                const focusCellIndex = options.cellSelections[0].start;
                const focusedCell = this.viewModel.cellAt(focusCellIndex);
                if (focusedCell) {
                    this.viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Index,
                        focus: { start: focusCellIndex, end: focusCellIndex + 1 },
                        selections: options.cellSelections
                    });
                    this.revealInCenterIfOutsideViewport(focusedCell);
                }
            }
            this._updateForOptions();
        }
        _detachModel() {
            var _a, _b, _c;
            this._localStore.clear();
            (0, lifecycle_1.dispose)(this._localCellStateListeners);
            this._list.detachViewModel();
            (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.dispose();
            // avoid event
            this.viewModel = undefined;
            (_b = this._webview) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = this._webview) === null || _c === void 0 ? void 0 : _c.element.remove();
            this._webview = null;
            this._list.clear();
        }
        _updateForOptions() {
            if (!this.hasModel()) {
                return;
            }
            this._editorEditable.set(!this.viewModel.options.isReadOnly);
            this._overflowContainer.classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
            this.getDomNode().classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
        }
        async _resolveWebview() {
            if (!this.textModel) {
                return null;
            }
            if (this._webviewResolvePromise) {
                return this._webviewResolvePromise;
            }
            if (!this._webview) {
                this._createWebview(this.getId(), this.textModel.uri);
            }
            this._webviewResolvePromise = new Promise(async (resolve) => {
                if (!this._webview) {
                    throw new Error('Notebook output webview object is not created successfully.');
                }
                await this._webview.createWebview();
                if (!this._webview.webview) {
                    throw new Error('Notebook output webview elemented is not created successfully.');
                }
                this._webview.webview.onDidBlur(() => {
                    this._outputFocus.set(false);
                    this.updateEditorFocus();
                    if (this._overlayContainer.contains(document.activeElement)) {
                        this._webiewFocused = false;
                    }
                });
                this._webview.webview.onDidFocus(() => {
                    this._outputFocus.set(true);
                    this.updateEditorFocus();
                    this._onDidFocusEmitter.fire();
                    if (this._overlayContainer.contains(document.activeElement)) {
                        this._webiewFocused = true;
                    }
                });
                this._localStore.add(this._webview.onMessage(e => {
                    this._onDidReceiveMessage.fire(e);
                }));
                resolve(this._webview);
            });
            return this._webviewResolvePromise;
        }
        async _createWebview(id, resource) {
            this._webview = this.instantiationService.createInstance(backLayerWebView_1.BackLayerWebView, this, id, resource, {
                outputNodePadding: constants_1.CELL_OUTPUT_PADDING,
                outputNodeLeftPadding: constants_1.CELL_OUTPUT_PADDING,
                previewNodePadding: constants_1.MARKDOWN_PREVIEW_PADDING,
                leftMargin: constants_1.CODE_CELL_LEFT_MARGIN,
                rightMargin: constants_1.CELL_RIGHT_MARGIN,
                runGutter: constants_1.CELL_RUN_GUTTER,
            });
            this._webview.element.style.width = '100%';
            // attach the webview container to the DOM tree first
            this._list.rowsContainer.insertAdjacentElement('afterbegin', this._webview.element);
        }
        async _attachModel(textModel, viewState) {
            var _a;
            await this._createWebview(this.getId(), textModel.uri);
            this._eventDispatcher = new eventDispatcher_1.NotebookEventDispatcher();
            this.viewModel = this.instantiationService.createInstance(notebookViewModel_1.NotebookViewModel, textModel.viewType, textModel, this._eventDispatcher, this.getLayoutInfo());
            this._eventDispatcher.emit([new eventDispatcher_1.NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
            this._updateForOptions();
            this._updateForNotebookConfiguration();
            // restore view states, including contributions
            {
                // restore view state
                this.viewModel.restoreEditorViewState(viewState);
                // contribution state restore
                const contributionsState = (viewState === null || viewState === void 0 ? void 0 : viewState.contributionsState) || {};
                for (const [id, contribution] of this._contributions) {
                    if (typeof contribution.restoreViewState === 'function') {
                        contribution.restoreViewState(contributionsState[id]);
                    }
                }
            }
            this._localStore.add(this.viewModel.onDidChangeSelection(() => {
                this._onDidChangeSelection.fire();
                this.updateSelectedMarkdownPreviews();
            }));
            this._localStore.add(this._list.onWillScroll(e => {
                var _a;
                if ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.isResolved()) {
                    this._webviewTransparentCover.style.top = `${e.scrollTop}px`;
                }
            }));
            let hasPendingChangeContentHeight = false;
            this._localStore.add(this._list.onDidChangeContentHeight(() => {
                if (hasPendingChangeContentHeight) {
                    return;
                }
                hasPendingChangeContentHeight = true;
                DOM.scheduleAtNextAnimationFrame(() => {
                    hasPendingChangeContentHeight = false;
                    this.updateScrollHeight();
                }, 100);
            }));
            this._localStore.add(this._list.onDidRemoveOutputs(outputs => {
                outputs.forEach(output => this.removeInset(output));
            }));
            this._localStore.add(this._list.onDidHideOutputs(outputs => {
                outputs.forEach(output => this.hideInset(output));
            }));
            this._localStore.add(this._list.onDidRemoveCellsFromView(cells => {
                var _a;
                const hiddenCells = [];
                const deletedCells = [];
                for (const cell of cells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markdown) {
                        const mdCell = cell;
                        if ((_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.viewCells.find(cell => cell.handle === mdCell.handle)) {
                            // Cell has been folded but is still in model
                            hiddenCells.push(mdCell);
                        }
                        else {
                            // Cell was deleted
                            deletedCells.push(mdCell);
                        }
                    }
                }
                this.hideMarkdownPreviews(hiddenCells);
                this.deleteMarkdownPreviews(deletedCells);
            }));
            // init rendering
            if (this.useRenderer) {
                await this._warmupWithMarkdownRenderer(this.viewModel, viewState);
            }
            else {
                this._list.attachViewModel(this.viewModel);
            }
            (0, notebookPerformance_1.mark)(textModel.uri, 'customMarkdownLoaded');
            // model attached
            this._localCellStateListeners = this.viewModel.viewCells.map(cell => this._bindCellListener(cell));
            this._localStore.add(this.viewModel.onDidChangeViewCells((e) => {
                if (this._isDisposed) {
                    return;
                }
                // update resize listener
                e.splices.reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCells = this._localCellStateListeners.splice(start, deleted, ...newCells.map(cell => this._bindCellListener(cell)));
                    (0, lifecycle_1.dispose)(deletedCells);
                });
            }));
            if (this._dimension) {
                this._list.layout(this._dimension.height - constants_1.SCROLLABLE_ELEMENT_PADDING_TOP, this._dimension.width);
            }
            else {
                this._list.layout();
            }
            (_a = this._dndController) === null || _a === void 0 ? void 0 : _a.clearGlobalDragState();
            // restore list state at last, it must be after list layout
            this.restoreListViewState(viewState);
        }
        _bindCellListener(cell) {
            const store = new lifecycle_1.DisposableStore();
            store.add(cell.onDidChangeLayout(e => {
                if (e.totalHeight !== undefined || e.outerWidth) {
                    this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight);
                }
            }));
            if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                store.add(cell.onDidRemoveOutputs((outputs) => {
                    outputs.forEach(output => this.removeInset(output));
                }));
                store.add(cell.onDidHideOutputs((outputs) => {
                    outputs.forEach(output => this.hideInset(output));
                }));
            }
            if (cell.cellKind === notebookCommon_1.CellKind.Markdown) {
                store.add(cell.onDidHideInput(() => {
                    this.hideMarkdownPreviews([cell]);
                }));
            }
            return store;
        }
        async _warmupWithMarkdownRenderer(viewModel, viewState) {
            var _a, _b;
            await this._resolveWebview();
            // make sure that the webview is not visible otherwise users will see pre-rendered markdown cells in wrong position as the list view doesn't have a correct `top` offset yet
            this._webview.element.style.visibility = 'hidden';
            // warm up can take around 200ms to load markdown libraries, etc.
            await this._warmupViewport(viewModel, viewState);
            // todo@rebornix @mjbvz, is this too complicated?
            /* now the webview is ready, and requests to render markdown are fast enough
             * we can start rendering the list view
             * render
             *   - markdown cell -> request to webview to (10ms, basically just latency between UI and iframe)
             *   - code cell -> render in place
             */
            this._list.layout(0, 0);
            this._list.attachViewModel(viewModel);
            // now the list widget has a correct contentHeight/scrollHeight
            // setting scrollTop will work properly
            // after setting scroll top, the list view will update `top` of the scrollable element, e.g. `top: -584px`
            this._list.scrollTop = (_b = (_a = viewState === null || viewState === void 0 ? void 0 : viewState.scrollPosition) === null || _a === void 0 ? void 0 : _a.top) !== null && _b !== void 0 ? _b : 0;
            this._debug('finish initial viewport warmup and view state restore.');
            this._webview.element.style.visibility = 'visible';
        }
        async _warmupViewport(viewModel, viewState) {
            var _a, _b, _c, _d, _f, _g, _h, _j;
            if (viewState && viewState.cellTotalHeights) {
                const totalHeightCache = viewState.cellTotalHeights;
                const scrollTop = (_b = (_a = viewState.scrollPosition) === null || _a === void 0 ? void 0 : _a.top) !== null && _b !== void 0 ? _b : 0;
                const scrollBottom = scrollTop + Math.max((_d = (_c = this._dimension) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0, 1080);
                let offset = 0;
                let requests = [];
                for (let i = 0; i < viewModel.length; i++) {
                    const cell = viewModel.cellAt(i);
                    if (offset + ((_f = totalHeightCache[i]) !== null && _f !== void 0 ? _f : 0) < scrollTop) {
                        offset += (totalHeightCache ? totalHeightCache[i] : 0);
                        continue;
                    }
                    else {
                        if (cell.cellKind === notebookCommon_1.CellKind.Markdown) {
                            requests.push([cell, offset]);
                        }
                    }
                    offset += (totalHeightCache ? totalHeightCache[i] : 0);
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                await this._webview.initializeMarkdown(requests
                    .map(request => ({ cellId: request[0].id, cellHandle: request[0].handle, content: request[0].getText(), offset: request[1] })));
            }
            else {
                const initRequests = viewModel.viewCells.filter(cell => cell.cellKind === notebookCommon_1.CellKind.Markdown).slice(0, 5).map(cell => ({ cellId: cell.id, cellHandle: cell.handle, content: cell.getText(), offset: -10000 }));
                await this._webview.initializeMarkdown(initRequests);
                // no cached view state so we are rendering the first viewport
                // after above async call, we already get init height for markdown cells, we can update their offset
                let offset = 0;
                const offsetUpdateRequests = [];
                const scrollBottom = Math.max((_h = (_g = this._dimension) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0, 1080);
                for (const cell of viewModel.viewCells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markdown) {
                        offsetUpdateRequests.push({ id: cell.id, top: offset });
                    }
                    offset += cell.getHeight(this.getLayoutInfo().fontInfo.lineHeight);
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                (_j = this._webview) === null || _j === void 0 ? void 0 : _j.updateScrollTops([], offsetUpdateRequests);
            }
        }
        restoreListViewState(viewState) {
            var _a, _b, _c;
            if ((viewState === null || viewState === void 0 ? void 0 : viewState.scrollPosition) !== undefined) {
                this._list.scrollTop = viewState.scrollPosition.top;
                this._list.scrollLeft = viewState.scrollPosition.left;
            }
            else {
                this._list.scrollTop = 0;
                this._list.scrollLeft = 0;
            }
            const focusIdx = typeof (viewState === null || viewState === void 0 ? void 0 : viewState.focus) === 'number' ? viewState.focus : 0;
            if (focusIdx < this._list.length) {
                const element = this._list.element(focusIdx);
                if (element) {
                    (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: element.handle,
                        selections: [element.handle]
                    });
                }
            }
            else if (this._list.length > 0) {
                (_b = this.viewModel) === null || _b === void 0 ? void 0 : _b.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: { start: 0, end: 1 },
                    selections: [{ start: 0, end: 1 }]
                });
            }
            if (viewState === null || viewState === void 0 ? void 0 : viewState.editorFocused) {
                const cell = (_c = this.viewModel) === null || _c === void 0 ? void 0 : _c.cellAt(focusIdx);
                if (cell) {
                    cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }
        }
        getEditorViewState() {
            var _a;
            const state = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.getEditorViewState();
            if (!state) {
                return {
                    editingCells: {},
                    editorViewStates: {}
                };
            }
            if (this._list) {
                state.scrollPosition = { left: this._list.scrollLeft, top: this._list.scrollTop };
                const cellHeights = {};
                for (let i = 0; i < this.viewModel.length; i++) {
                    const elm = this.viewModel.cellAt(i);
                    if (elm.cellKind === notebookCommon_1.CellKind.Code) {
                        cellHeights[i] = elm.layoutInfo.totalHeight;
                    }
                    else {
                        cellHeights[i] = elm.layoutInfo.totalHeight;
                    }
                }
                state.cellTotalHeights = cellHeights;
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    if (element) {
                        const itemDOM = this._list.domElementOfElement(element);
                        const editorFocused = element.getEditState() === notebookBrowser_1.CellEditState.Editing && !!(document.activeElement && itemDOM && itemDOM.contains(document.activeElement));
                        state.editorFocused = editorFocused;
                        state.focus = focusRange.start;
                    }
                }
            }
            // Save contribution view states
            const contributionsState = {};
            for (const [id, contribution] of this._contributions) {
                if (typeof contribution.saveViewState === 'function') {
                    contributionsState[id] = contribution.saveViewState();
                }
            }
            state.contributionsState = contributionsState;
            return state;
        }
        layout(dimension, shadowElement) {
            var _a, _b;
            if (!shadowElement && this._shadowElementViewInfo === null) {
                this._dimension = dimension;
                return;
            }
            if (shadowElement) {
                const containerRect = shadowElement.getBoundingClientRect();
                this._shadowElementViewInfo = {
                    height: containerRect.height,
                    width: containerRect.width,
                    top: containerRect.top,
                    left: containerRect.left
                };
            }
            this._dimension = new DOM.Dimension(dimension.width, dimension.height);
            DOM.size(this._body, dimension.width, dimension.height - (this._useGlobalToolbar ? /** Toolbar height */ 26 : 0));
            if (this._list.getRenderHeight() < dimension.height - constants_1.SCROLLABLE_ELEMENT_PADDING_TOP) {
                // the new dimension is larger than the list viewport, update its additional height first, otherwise the list view will move down a bit (as the `scrollBottom` will move down)
                this._list.updateOptions({ additionalScrollHeight: this._scrollBeyondLastLine ? Math.max(0, (dimension.height - constants_1.SCROLLABLE_ELEMENT_PADDING_TOP - 50)) : constants_1.SCROLLABLE_ELEMENT_PADDING_TOP });
                this._list.layout(dimension.height - constants_1.SCROLLABLE_ELEMENT_PADDING_TOP, dimension.width);
            }
            else {
                // the new dimension is smaller than the list viewport, if we update the additional height, the `scrollBottom` will move up, which moves the whole list view upwards a bit. So we run a layout first.
                this._list.layout(dimension.height - constants_1.SCROLLABLE_ELEMENT_PADDING_TOP, dimension.width);
                this._list.updateOptions({ additionalScrollHeight: this._scrollBeyondLastLine ? Math.max(0, (dimension.height - constants_1.SCROLLABLE_ELEMENT_PADDING_TOP - 50)) : constants_1.SCROLLABLE_ELEMENT_PADDING_TOP });
            }
            this._overlayContainer.style.visibility = 'visible';
            this._overlayContainer.style.display = 'block';
            this._overlayContainer.style.position = 'absolute';
            const containerRect = (_a = this._overlayContainer.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
            this._overlayContainer.style.top = `${this._shadowElementViewInfo.top - ((containerRect === null || containerRect === void 0 ? void 0 : containerRect.top) || 0)}px`;
            this._overlayContainer.style.left = `${this._shadowElementViewInfo.left - ((containerRect === null || containerRect === void 0 ? void 0 : containerRect.left) || 0)}px`;
            this._overlayContainer.style.width = `${dimension ? dimension.width : this._shadowElementViewInfo.width}px`;
            this._overlayContainer.style.height = `${dimension ? dimension.height : this._shadowElementViewInfo.height}px`;
            if (this._webviewTransparentCover) {
                this._webviewTransparentCover.style.height = `${dimension.height}px`;
                this._webviewTransparentCover.style.width = `${dimension.width}px`;
            }
            (_b = this._eventDispatcher) === null || _b === void 0 ? void 0 : _b.emit([new eventDispatcher_1.NotebookLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
        }
        //#endregion
        //#region Focus tracker
        focus() {
            var _a;
            this._isVisible = true;
            this._editorFocus.set(true);
            if (this._webiewFocused) {
                (_a = this._webview) === null || _a === void 0 ? void 0 : _a.focusWebview();
            }
            else {
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    if (element && element.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                        element.updateEditState(notebookBrowser_1.CellEditState.Editing, 'editorWidget.focus');
                        element.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                        this._onDidFocusEditorWidget.fire();
                        return;
                    }
                }
                this._list.domFocus();
            }
            this._onDidFocusEditorWidget.fire();
        }
        onWillHide() {
            this._isVisible = false;
            this._editorFocus.set(false);
            this._overlayContainer.style.visibility = 'hidden';
            this._overlayContainer.style.left = '-50000px';
        }
        updateEditorFocus() {
            var _a;
            // Note - focus going to the webview will fire 'blur', but the webview element will be
            // a descendent of the notebook editor root.
            const focused = DOM.isAncestor(document.activeElement, this._overlayContainer);
            this._editorFocus.set(focused);
            (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.setFocus(focused);
            if (!focused) {
                this._editorToolbarDisposable.clear();
                this._toolbarActionDisposable.clear();
            }
        }
        hasFocus() {
            return this._editorFocus.get() || false;
        }
        hasWebviewFocus() {
            return this._webiewFocused;
        }
        hasOutputTextSelection() {
            if (!this.hasFocus()) {
                return false;
            }
            const windowSelection = window.getSelection();
            if ((windowSelection === null || windowSelection === void 0 ? void 0 : windowSelection.rangeCount) !== 1) {
                return false;
            }
            const activeSelection = windowSelection.getRangeAt(0);
            if (activeSelection.endOffset - activeSelection.startOffset === 0) {
                return false;
            }
            let container = activeSelection.commonAncestorContainer;
            if (!this._body.contains(container)) {
                return false;
            }
            while (container
                &&
                    container !== this._body) {
                if (container.classList && container.classList.contains('output')) {
                    return true;
                }
                container = container.parentNode;
            }
            return false;
        }
        //#endregion
        //#region Editor Features
        focusElement(cell) {
            var _a;
            (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Handle,
                primary: cell.handle,
                selections: [cell.handle]
            });
        }
        revealCellRangeInView(range) {
            return this._listViewInfoAccessor.revealCellRangeInView(range);
        }
        revealInView(cell) {
            this._listViewInfoAccessor.revealInView(cell);
        }
        revealInViewAtTop(cell) {
            this._listViewInfoAccessor.revealInViewAtTop(cell);
        }
        revealInCenterIfOutsideViewport(cell) {
            this._listViewInfoAccessor.revealInCenterIfOutsideViewport(cell);
        }
        async revealInCenterIfOutsideViewportAsync(cell) {
            return this._listViewInfoAccessor.revealInCenterIfOutsideViewportAsync(cell);
        }
        revealInCenter(cell) {
            this._listViewInfoAccessor.revealInCenter(cell);
        }
        async revealLineInViewAsync(cell, line) {
            return this._listViewInfoAccessor.revealLineInViewAsync(cell, line);
        }
        async revealLineInCenterAsync(cell, line) {
            return this._listViewInfoAccessor.revealLineInCenterAsync(cell, line);
        }
        async revealLineInCenterIfOutsideViewportAsync(cell, line) {
            return this._listViewInfoAccessor.revealLineInCenterIfOutsideViewportAsync(cell, line);
        }
        async revealRangeInViewAsync(cell, range) {
            return this._listViewInfoAccessor.revealRangeInViewAsync(cell, range);
        }
        async revealRangeInCenterAsync(cell, range) {
            return this._listViewInfoAccessor.revealRangeInCenterAsync(cell, range);
        }
        async revealRangeInCenterIfOutsideViewportAsync(cell, range) {
            return this._listViewInfoAccessor.revealRangeInCenterIfOutsideViewportAsync(cell, range);
        }
        getViewIndex(cell) {
            if (!this._listViewInfoAccessor) {
                return -1;
            }
            return this._listViewInfoAccessor.getViewIndex(cell);
        }
        getViewHeight(cell) {
            if (!this._listViewInfoAccessor) {
                return -1;
            }
            return this._listViewInfoAccessor.getViewHeight(cell);
        }
        getCellRangeFromViewRange(startIndex, endIndex) {
            return this._listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex);
        }
        getCellsFromViewRange(startIndex, endIndex) {
            return this._listViewInfoAccessor.getCellsFromViewRange(startIndex, endIndex);
        }
        setCellEditorSelection(cell, range) {
            this._listViewInfoAccessor.setCellEditorSelection(cell, range);
        }
        setHiddenAreas(_ranges) {
            return this._listViewInfoAccessor.setHiddenAreas(_ranges);
        }
        getVisibleRangesPlusViewportAboveBelow() {
            return this._listViewInfoAccessor.getVisibleRangesPlusViewportAboveBelow();
        }
        triggerScroll(event) {
            this._listViewInfoAccessor.triggerScroll(event);
        }
        _registerDecorationType(key) {
            const options = this.notebookEditorService.resolveEditorDecorationOptions(key);
            if (options) {
                const styleElement = DOM.createStyleSheet(this._body);
                const styleSheet = new notebookEditorDecorations_1.NotebookRefCountedStyleSheet({
                    removeEditorStyleSheets: (key) => {
                        this._editorStyleSheets.delete(key);
                    }
                }, key, styleElement);
                this._editorStyleSheets.set(key, styleSheet);
                this._decorationRules.set(key, new notebookEditorDecorations_1.NotebookDecorationCSSRules(this.themeService, styleSheet, {
                    key,
                    options,
                    styleSheet
                }));
            }
        }
        setEditorDecorations(key, range) {
            if (!this.viewModel) {
                return;
            }
            // create css style for the decoration
            if (!this._editorStyleSheets.has(key)) {
                this._registerDecorationType(key);
            }
            const decorationRule = this._decorationRules.get(key);
            if (!decorationRule) {
                return;
            }
            const existingDecorations = this._decortionKeyToIds.get(key) || [];
            const newDecorations = this.viewModel.getCells(range).map(cell => ({
                handle: cell.handle,
                options: { className: decorationRule.className, outputClassName: decorationRule.className, topClassName: decorationRule.topClassName }
            }));
            this._decortionKeyToIds.set(key, this.deltaCellDecorations(existingDecorations, newDecorations));
        }
        removeEditorDecorations(key) {
            var _a;
            if (this._decorationRules.has(key)) {
                (_a = this._decorationRules.get(key)) === null || _a === void 0 ? void 0 : _a.dispose();
            }
            const cellDecorations = this._decortionKeyToIds.get(key);
            this.deltaCellDecorations(cellDecorations || [], []);
        }
        deltaCellDecorations(oldDecorations, newDecorations) {
            var _a;
            return ((_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.deltaCellDecorations(oldDecorations, newDecorations)) || [];
        }
        deltaCellOutputContainerClassNames(cellId, added, removed) {
            var _a;
            (_a = this._webview) === null || _a === void 0 ? void 0 : _a.deltaCellOutputContainerClassNames(cellId, added, removed);
        }
        changeModelDecorations(callback) {
            var _a;
            return ((_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.changeModelDecorations(callback)) || null;
        }
        //#endregion
        //#region Kernel/Execution
        async _loadKernelPreloads() {
            var _a, _b;
            const kernel = this.activeKernel;
            if (!kernel) {
                return;
            }
            const preloadUris = kernel.preloadUris;
            if (!preloadUris.length) {
                return;
            }
            if (!((_a = this._webview) === null || _a === void 0 ? void 0 : _a.isResolved())) {
                await this._resolveWebview();
            }
            (_b = this._webview) === null || _b === void 0 ? void 0 : _b.updateKernelPreloads([kernel.localResourceRoot], kernel.preloadUris);
        }
        get activeKernel() {
            return this.viewModel && this._kernelManger.getSelectedOrSuggestedKernel(this.viewModel.notebookDocument);
        }
        async cancelNotebookCells(cells) {
            if (!this.hasModel()) {
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this._kernelManger.cancelNotebookCells(this.viewModel.notebookDocument, cells);
        }
        async executeNotebookCells(cells) {
            if (!this.hasModel()) {
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this._kernelManger.executeNotebookCells(this.viewModel.notebookDocument, cells);
        }
        async layoutNotebookCell(cell, height) {
            this._debug('layout cell', cell.handle, height);
            const viewIndex = this._list.getViewIndex(cell);
            if (viewIndex === undefined) {
                // the cell is hidden
                return;
            }
            const relayout = (cell, height) => {
                if (this._isDisposed) {
                    return;
                }
                this._list.updateElementHeight2(cell, height);
            };
            if (this._pendingLayouts.has(cell)) {
                this._pendingLayouts.get(cell).dispose();
            }
            let r;
            const layoutDisposable = DOM.scheduleAtNextAnimationFrame(() => {
                if (this._isDisposed) {
                    return;
                }
                if (this._list.elementHeight(cell) === height) {
                    return;
                }
                this._pendingLayouts.delete(cell);
                relayout(cell, height);
                r();
            });
            this._pendingLayouts.set(cell, (0, lifecycle_1.toDisposable)(() => {
                layoutDisposable.dispose();
                r();
            }));
            return new Promise(resolve => { r = resolve; });
        }
        _nearestCodeCellIndex(index /* exclusive */) {
            if (!this.viewModel) {
                return -1;
            }
            return this.viewModel.nearestCodeCellIndex(index);
        }
        insertNotebookCell(cell, type, direction = 'above', initialText = '', ui = false) {
            var _a, _b, _c, _d, _f;
            if (!this.viewModel) {
                return null;
            }
            if (this.viewModel.options.isReadOnly) {
                return null;
            }
            const index = cell ? this.viewModel.getCellIndex(cell) : 0;
            const nextIndex = ui ? this.viewModel.getNextVisibleCellIndex(index) : index + 1;
            let language;
            if (type === notebookCommon_1.CellKind.Code) {
                const supportedLanguages = (_b = (_a = this.activeKernel) === null || _a === void 0 ? void 0 : _a.supportedLanguages) !== null && _b !== void 0 ? _b : this.modeService.getRegisteredModes();
                const defaultLanguage = supportedLanguages[0] || 'plaintext';
                if ((cell === null || cell === void 0 ? void 0 : cell.cellKind) === notebookCommon_1.CellKind.Code) {
                    language = cell.language;
                }
                else if ((cell === null || cell === void 0 ? void 0 : cell.cellKind) === notebookCommon_1.CellKind.Markdown) {
                    const nearestCodeCellIndex = this._nearestCodeCellIndex(index);
                    if (nearestCodeCellIndex > -1) {
                        language = this.viewModel.cellAt(nearestCodeCellIndex).language;
                    }
                    else {
                        language = defaultLanguage;
                    }
                }
                else {
                    if (cell === undefined && direction === 'above') {
                        // insert cell at the very top
                        language = ((_c = this.viewModel.viewCells.find(cell => cell.cellKind === notebookCommon_1.CellKind.Code)) === null || _c === void 0 ? void 0 : _c.language) || defaultLanguage;
                    }
                    else {
                        language = defaultLanguage;
                    }
                }
                if (!supportedLanguages.includes(language)) {
                    // the language no longer exists
                    language = defaultLanguage;
                }
            }
            else {
                language = 'markdown';
            }
            const insertIndex = cell ?
                (direction === 'above' ? index : nextIndex) :
                index;
            const focused = this._list.getFocusedElements();
            const selections = this._list.getSelectedElements();
            return this.viewModel.createCell(insertIndex, initialText, language, type, undefined, [], true, undefined, (_f = (_d = focused[0]) === null || _d === void 0 ? void 0 : _d.handle) !== null && _f !== void 0 ? _f : null, selections);
        }
        async splitNotebookCell(cell) {
            if (!this.viewModel) {
                return null;
            }
            if (this.viewModel.options.isReadOnly) {
                return null;
            }
            const index = this.viewModel.getCellIndex(cell);
            return this.viewModel.splitNotebookCell(index);
        }
        async deleteNotebookCell(cell) {
            if (!this.viewModel) {
                return false;
            }
            if (this.viewModel.options.isReadOnly) {
                return false;
            }
            if (this._pendingLayouts.has(cell)) {
                this._pendingLayouts.get(cell).dispose();
            }
            const index = this.viewModel.getCellIndex(cell);
            this.viewModel.deleteCell(index, true);
            return true;
        }
        async moveCellDown(cell) {
            if (!this.viewModel) {
                return null;
            }
            if (this.viewModel.options.isReadOnly) {
                return null;
            }
            const index = this.viewModel.getCellIndex(cell);
            if (index === this.viewModel.length - 1) {
                return null;
            }
            const newIdx = index + 2; // This is the adjustment for the index before the cell has been "removed" from its original index
            return this._moveCellToIndex(index, 1, newIdx);
        }
        async moveCellUp(cell) {
            if (!this.viewModel) {
                return null;
            }
            if (this.viewModel.options.isReadOnly) {
                return null;
            }
            const index = this.viewModel.getCellIndex(cell);
            if (index === 0) {
                return null;
            }
            const newIdx = index - 1;
            return this._moveCellToIndex(index, 1, newIdx);
        }
        async moveCellsToIdx(index, length, toIdx) {
            if (!this.viewModel) {
                return null;
            }
            if (this.viewModel.options.isReadOnly) {
                return null;
            }
            return this._moveCellToIndex(index, length, toIdx);
        }
        /**
         * @param index The current index of the cell
         * @param desiredIndex The desired index, in an index scheme for the state of the tree before the current cell has been "removed".
         * @example to move the cell from index 0 down one spot, call with (0, 2)
         */
        async _moveCellToIndex(index, length, desiredIndex) {
            if (!this.viewModel) {
                return null;
            }
            if (index < desiredIndex) {
                // The cell is moving "down", it will free up one index spot and consume a new one
                desiredIndex -= length;
            }
            if (index === desiredIndex) {
                return null;
            }
            if (!this.viewModel.moveCellToIdx(index, length, desiredIndex, true)) {
                throw new Error('Notebook Editor move cell, index out of range');
            }
            // this._list.move(index, desiredIndex);
            let r;
            DOM.scheduleAtNextAnimationFrame(() => {
                if (this._isDisposed) {
                    r(null);
                    return;
                }
                if (!this.viewModel) {
                    r(null);
                    return;
                }
                const viewCell = this.viewModel.cellAt(desiredIndex);
                if (viewCell) {
                    this._list.revealElementInView(viewCell);
                    r(viewCell);
                }
                else {
                    r(null);
                }
            });
            return new Promise(resolve => { r = resolve; });
        }
        getActiveCell() {
            const elements = this._list.getFocusedElements();
            if (elements && elements.length) {
                return elements[0];
            }
            return undefined;
        }
        _cellFocusAria(cell, focusItem) {
            var _a, _b;
            const index = (_a = this._notebookViewModel) === null || _a === void 0 ? void 0 : _a.getCellIndex(cell);
            if (index !== undefined && index >= 0) {
                let position = '';
                switch (focusItem) {
                    case 'editor':
                        position = `the inner ${cell.cellKind === notebookCommon_1.CellKind.Markdown ? 'markdown' : 'code'} editor is focused, press escape to focus the cell container`;
                        break;
                    case 'output':
                        position = `the cell output is focused, press escape to focus the cell container`;
                        break;
                    case 'container':
                        position = `the ${cell.cellKind === notebookCommon_1.CellKind.Markdown ? 'markdown preview' : 'cell container'} is focused, press enter to focus the inner ${cell.cellKind === notebookCommon_1.CellKind.Markdown ? 'markdown' : 'code'} editor`;
                        break;
                    default:
                        break;
                }
                aria.alert(`Cell ${(_b = this._notebookViewModel) === null || _b === void 0 ? void 0 : _b.getCellIndex(cell)}, ${position} `);
            }
        }
        toggleNotebookCellSelection(cell) {
            const currentSelections = this._list.getSelectedElements();
            const isSelected = currentSelections.includes(cell);
            if (isSelected) {
                // Deselect
                this._list.selectElements(currentSelections.filter(current => current !== cell));
            }
            else {
                // Add to selection
                this._list.selectElements([...currentSelections, cell]);
            }
        }
        focusNotebookCell(cell, focusItem, options) {
            if (this._isDisposed) {
                return;
            }
            if (focusItem === 'editor') {
                this.focusElement(cell);
                this._cellFocusAria(cell, focusItem);
                this._list.focusView();
                cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                if (!(options === null || options === void 0 ? void 0 : options.skipReveal)) {
                    this.revealInCenterIfOutsideViewport(cell);
                }
            }
            else if (focusItem === 'output') {
                this.focusElement(cell);
                this._cellFocusAria(cell, focusItem);
                this._list.focusView();
                if (!this._webview) {
                    return;
                }
                this._webview.focusOutput(cell.id);
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Container;
                if (!(options === null || options === void 0 ? void 0 : options.skipReveal)) {
                    this.revealInCenterIfOutsideViewport(cell);
                }
            }
            else {
                const itemDOM = this._list.domElementOfElement(cell);
                if (document.activeElement && itemDOM && itemDOM.contains(document.activeElement)) {
                    document.activeElement.blur();
                }
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Container;
                this.focusElement(cell);
                this._cellFocusAria(cell, focusItem);
                if (!(options === null || options === void 0 ? void 0 : options.skipReveal)) {
                    this.revealInCenterIfOutsideViewport(cell);
                }
                this._list.focusView();
            }
        }
        focusNextNotebookCell(cell, focusItem) {
            var _a, _b;
            const idx = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.getCellIndex(cell);
            if (typeof idx !== 'number') {
                return;
            }
            const newCell = (_b = this.viewModel) === null || _b === void 0 ? void 0 : _b.cellAt(idx + 1);
            if (!newCell) {
                return;
            }
            this.focusNotebookCell(newCell, focusItem);
        }
        //#endregion
        //#region MISC
        getLayoutInfo() {
            if (!this._list) {
                throw new Error('Editor is not initalized successfully');
            }
            return {
                width: this._dimension.width,
                height: this._dimension.height,
                fontInfo: this._fontInfo
            };
        }
        getCellOutputLayoutInfo(cell) {
            if (!this._list) {
                throw new Error('Editor is not initalized successfully');
            }
            return {
                width: this._dimension.width,
                height: this._dimension.height,
                fontInfo: this._fontInfo
            };
        }
        async createMarkdownPreview(cell) {
            if (!this.useRenderer) {
                // TODO: handle case where custom renderer is disabled?
                return;
            }
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            if (!this._webview) {
                return;
            }
            const cellTop = this._list.getAbsoluteTopOfElement(cell);
            await this._webview.showMarkdownPreview(cell.id, cell.handle, cell.getText(), cellTop, cell.contentHash);
        }
        async unhideMarkdownPreviews(cells) {
            var _a;
            if (!this.useRenderer) {
                // TODO: handle case where custom renderer is disabled?
                return;
            }
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.unhideMarkdownPreviews(cells.map(cell => cell.id)));
        }
        async hideMarkdownPreviews(cells) {
            var _a;
            if (!this.useRenderer) {
                // TODO: handle case where custom renderer is disabled?
                return;
            }
            if (!this._webview || !cells.length) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.hideMarkdownPreviews(cells.map(cell => cell.id)));
        }
        async deleteMarkdownPreviews(cells) {
            var _a;
            if (!this.useRenderer) {
                // TODO: handle case where custom renderer is disabled?
                return;
            }
            if (!this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            await ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.deleteMarkdownPreviews(cells.map(cell => cell.id)));
        }
        async updateSelectedMarkdownPreviews() {
            var _a;
            if (!this.useRenderer || !this._webview) {
                return;
            }
            if (!this._webview.isResolved()) {
                await this._resolveWebview();
            }
            const selectedCells = this.getSelectionViewModels().map(cell => cell.id);
            // Only show selection when there is more than 1 cell selected
            await ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.updateMarkdownPreviewSelections(selectedCells.length > 1 ? selectedCells : []));
        }
        async createOutput(cell, output, offset) {
            this._insetModifyQueueByOutputId.queue(output.source.model.outputId, async () => {
                if (!this._webview) {
                    return;
                }
                if (!this._webview.isResolved()) {
                    await this._resolveWebview();
                }
                if (!this._webview) {
                    return;
                }
                const cellTop = this._list.getAbsoluteTopOfElement(cell);
                if (!this._webview.insetMapping.has(output.source)) {
                    await this._webview.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
                }
                else {
                    const outputIndex = cell.outputsViewModels.indexOf(output.source);
                    const outputOffset = cell.getOutputOffset(outputIndex);
                    this._webview.updateScrollTops([{
                            cell,
                            output: output.source,
                            cellTop,
                            outputOffset,
                            forceDisplay: !cell.metadata.outputCollapsed,
                        }], []);
                }
            });
        }
        removeInset(output) {
            this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
                var _a;
                if ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.isResolved()) {
                    this._webview.removeInsets([output]);
                }
            });
        }
        hideInset(output) {
            var _a;
            if ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.isResolved()) {
                this._insetModifyQueueByOutputId.queue(output.model.outputId, async () => {
                    this._webview.hideInset(output);
                });
            }
        }
        getOutputRenderer() {
            return this._outputRenderer;
        }
        postMessage(forRendererId, message) {
            var _a;
            if ((_a = this._webview) === null || _a === void 0 ? void 0 : _a.isResolved()) {
                if (forRendererId === undefined) {
                    this._webview.webview.postMessage(message);
                }
                else {
                    this._webview.postRendererMessage(forRendererId, message);
                }
            }
        }
        //#endregion
        addClassName(className) {
            this._overlayContainer.classList.add(className);
        }
        removeClassName(className) {
            this._overlayContainer.classList.remove(className);
        }
        getCellByInfo(cellInfo) {
            var _a;
            const { cellHandle } = cellInfo;
            return (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.viewCells.find(vc => vc.handle === cellHandle);
        }
        getCellById(cellId) {
            var _a;
            return (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.viewCells.find(vc => vc.id === cellId);
        }
        updateOutputHeight(cellInfo, output, outputHeight, isInit, source) {
            var _a;
            const cell = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.viewCells.find(vc => vc.handle === cellInfo.cellHandle);
            if (cell && cell instanceof codeCellViewModel_1.CodeCellViewModel) {
                const outputIndex = cell.outputsViewModels.indexOf(output);
                if (isInit && outputHeight !== 0) {
                    cell.updateOutputMinHeight(0);
                }
                this._debug('update cell output', cell.handle, outputHeight);
                cell.updateOutputHeight(outputIndex, outputHeight, source);
                this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight);
            }
        }
        updateScrollHeight() {
            var _a, _b, _c, _d;
            if (this._isDisposed || !((_a = this._webview) === null || _a === void 0 ? void 0 : _a.isResolved())) {
                return;
            }
            const scrollHeight = this._list.scrollHeight;
            this._webview.element.style.height = `${scrollHeight}px`;
            const updateItems = [];
            const removedItems = [];
            (_b = this._webview) === null || _b === void 0 ? void 0 : _b.insetMapping.forEach((value, key) => {
                var _a, _b;
                const cell = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.getCellByHandle(value.cellInfo.cellHandle);
                if (!cell || !(cell instanceof codeCellViewModel_1.CodeCellViewModel)) {
                    return;
                }
                (_b = this.viewModel) === null || _b === void 0 ? void 0 : _b.viewCells.find(cell => cell.handle === value.cellInfo.cellHandle);
                const viewIndex = this._list.getViewIndex(cell);
                if (viewIndex === undefined) {
                    return;
                }
                if (cell.outputsViewModels.indexOf(key) < 0) {
                    // output is already gone
                    removedItems.push(key);
                }
                const cellTop = this._list.getAbsoluteTopOfElement(cell);
                const outputIndex = cell.outputsViewModels.indexOf(key);
                const outputOffset = cell.getOutputOffset(outputIndex);
                updateItems.push({
                    cell,
                    output: key,
                    cellTop,
                    outputOffset,
                    forceDisplay: false,
                });
            });
            this._webview.removeInsets(removedItems);
            const markdownUpdateItems = [];
            for (const cellId of this._webview.markdownPreviewMapping.keys()) {
                const cell = (_c = this.viewModel) === null || _c === void 0 ? void 0 : _c.viewCells.find(cell => cell.id === cellId);
                if (cell) {
                    const cellTop = this._list.getAbsoluteTopOfElement(cell);
                    markdownUpdateItems.push({ id: cellId, top: cellTop });
                }
            }
            if (markdownUpdateItems.length || updateItems.length) {
                this._debug('_list.onDidChangeContentHeight/markdown', markdownUpdateItems);
                (_d = this._webview) === null || _d === void 0 ? void 0 : _d.updateScrollTops(updateItems, markdownUpdateItems);
            }
        }
        scheduleOutputHeightAck(cellInfo, outputId, height) {
            DOM.scheduleAtNextAnimationFrame(() => {
                var _a;
                this.updateScrollHeight();
                this._debug('ack height', height);
                (_a = this._webview) === null || _a === void 0 ? void 0 : _a.ackHeight(cellInfo.cellId, outputId, height);
            }, 10);
        }
        updateMarkdownCellHeight(cellId, height, isInit) {
            const cell = this.getCellById(cellId);
            if (cell && cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                if (height + constants_1.BOTTOM_CELL_TOOLBAR_GAP !== cell.layoutInfo.totalHeight) {
                    this._debug('updateMarkdownCellHeight', cell.handle, height + constants_1.BOTTOM_CELL_TOOLBAR_GAP, isInit);
                    cell.renderedMarkdownHeight = height;
                }
            }
        }
        setMarkdownCellEditState(cellId, editState) {
            const cell = this.getCellById(cellId);
            if (cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                cell.updateEditState(editState, 'setMarkdownCellEditState');
            }
        }
        markdownCellDragStart(cellId, ctx) {
            var _a;
            const cell = this.getCellById(cellId);
            if (cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                (_a = this._dndController) === null || _a === void 0 ? void 0 : _a.startExplicitDrag(cell, ctx);
            }
        }
        markdownCellDrag(cellId, ctx) {
            var _a;
            const cell = this.getCellById(cellId);
            if (cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                (_a = this._dndController) === null || _a === void 0 ? void 0 : _a.explicitDrag(cell, ctx);
            }
        }
        markdownCellDrop(cellId, ctx) {
            var _a;
            const cell = this.getCellById(cellId);
            if (cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                (_a = this._dndController) === null || _a === void 0 ? void 0 : _a.explicitDrop(cell, ctx);
            }
        }
        markdownCellDragEnd(cellId) {
            var _a;
            const cell = this.getCellById(cellId);
            if (cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                (_a = this._dndController) === null || _a === void 0 ? void 0 : _a.endExplicitDrag(cell);
            }
        }
        //#endregion
        //#region Editor Contributions
        getContribution(id) {
            return (this._contributions.get(id) || null);
        }
        //#endregion
        dispose() {
            var _a, _b, _c;
            this._isDisposed = true;
            // dispose webview first
            (_a = this._webview) === null || _a === void 0 ? void 0 : _a.dispose();
            this._webview = null;
            this.notebookEditorService.removeNotebookEditor(this);
            (0, lifecycle_1.dispose)(this._contributions.values());
            this._contributions.clear();
            this._localStore.clear();
            (0, lifecycle_1.dispose)(this._localCellStateListeners);
            this._list.dispose();
            (_b = this._listTopCellToolbar) === null || _b === void 0 ? void 0 : _b.dispose();
            this._overlayContainer.remove();
            (_c = this.viewModel) === null || _c === void 0 ? void 0 : _c.dispose();
            super.dispose();
        }
        toJSON() {
            var _a;
            return {
                notebookUri: (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.uri,
            };
        }
    };
    NotebookEditorWidget.EDITOR_MEMENTOS = new Map();
    NotebookEditorWidget = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, accessibility_1.IAccessibilityService),
        __param(4, notebookEditorService_1.INotebookEditorService),
        __param(5, notebookKernelService_1.INotebookKernelService),
        __param(6, editorService_1.IEditorService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, layoutService_1.ILayoutService),
        __param(10, contextView_1.IContextMenuService),
        __param(11, actions_1.IMenuService),
        __param(12, themeService_1.IThemeService),
        __param(13, telemetry_1.ITelemetryService),
        __param(14, modeService_1.IModeService),
        __param(15, keybinding_1.IKeybindingService),
        __param(16, (0, instantiation_1.optional)(experimentService_1.ITASExperimentService))
    ], NotebookEditorWidget);
    exports.NotebookEditorWidget = NotebookEditorWidget;
    exports.notebookCellBorder = (0, colorRegistry_1.registerColor)('notebook.cellBorderColor', {
        dark: (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.listInactiveSelectionBackground, 1),
        hc: theme_1.PANEL_BORDER
    }, nls.localize(1, null));
    exports.focusedEditorBorderColor = (0, colorRegistry_1.registerColor)('notebook.focusedEditorBorder', {
        light: colorRegistry_1.focusBorder,
        dark: colorRegistry_1.focusBorder,
        hc: colorRegistry_1.focusBorder
    }, nls.localize(2, null));
    exports.cellStatusIconSuccess = (0, colorRegistry_1.registerColor)('notebookStatusSuccessIcon.foreground', {
        light: debugColors_1.debugIconStartForeground,
        dark: debugColors_1.debugIconStartForeground,
        hc: debugColors_1.debugIconStartForeground
    }, nls.localize(3, null));
    exports.cellStatusIconError = (0, colorRegistry_1.registerColor)('notebookStatusErrorIcon.foreground', {
        light: colorRegistry_1.errorForeground,
        dark: colorRegistry_1.errorForeground,
        hc: colorRegistry_1.errorForeground
    }, nls.localize(4, null));
    exports.cellStatusIconRunning = (0, colorRegistry_1.registerColor)('notebookStatusRunningIcon.foreground', {
        light: colorRegistry_1.foreground,
        dark: colorRegistry_1.foreground,
        hc: colorRegistry_1.foreground
    }, nls.localize(5, null));
    exports.notebookOutputContainerColor = (0, colorRegistry_1.registerColor)('notebook.outputContainerBackgroundColor', {
        dark: exports.notebookCellBorder,
        light: exports.notebookCellBorder,
        hc: null
    }, nls.localize(6, null));
    // TODO@rebornix currently also used for toolbar border, if we keep all of this, pick a generic name
    exports.CELL_TOOLBAR_SEPERATOR = (0, colorRegistry_1.registerColor)('notebook.cellToolbarSeparator', {
        dark: color_1.Color.fromHex('#808080').transparent(0.35),
        light: color_1.Color.fromHex('#808080').transparent(0.35),
        hc: colorRegistry_1.contrastBorder
    }, nls.localize(7, null));
    exports.focusedCellBackground = (0, colorRegistry_1.registerColor)('notebook.focusedCellBackground', {
        dark: null,
        light: null,
        hc: null
    }, nls.localize(8, null));
    exports.selectedCellBackground = (0, colorRegistry_1.registerColor)('notebook.selectedCellBackground', {
        dark: colorRegistry_1.listInactiveSelectionBackground,
        light: colorRegistry_1.listInactiveSelectionBackground,
        hc: null
    }, nls.localize(9, null));
    exports.cellHoverBackground = (0, colorRegistry_1.registerColor)('notebook.cellHoverBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.focusedCellBackground, .5),
        light: (0, colorRegistry_1.transparent)(exports.focusedCellBackground, .7),
        hc: null
    }, nls.localize(10, null));
    exports.selectedCellBorder = (0, colorRegistry_1.registerColor)('notebook.selectedCellBorder', {
        dark: exports.notebookCellBorder,
        light: exports.notebookCellBorder,
        hc: colorRegistry_1.contrastBorder
    }, nls.localize(11, null));
    exports.inactiveSelectedCellBorder = (0, colorRegistry_1.registerColor)('notebook.inactiveSelectedCellBorder', {
        dark: null,
        light: null,
        hc: colorRegistry_1.focusBorder
    }, nls.localize(12, null));
    exports.focusedCellBorder = (0, colorRegistry_1.registerColor)('notebook.focusedCellBorder', {
        dark: colorRegistry_1.focusBorder,
        light: colorRegistry_1.focusBorder,
        hc: colorRegistry_1.focusBorder
    }, nls.localize(13, null));
    exports.inactiveFocusedCellBorder = (0, colorRegistry_1.registerColor)('notebook.inactiveFocusedCellBorder', {
        dark: exports.notebookCellBorder,
        light: exports.notebookCellBorder,
        hc: exports.notebookCellBorder
    }, nls.localize(14, null));
    exports.cellStatusBarItemHover = (0, colorRegistry_1.registerColor)('notebook.cellStatusBarItemHoverBackground', {
        light: new color_1.Color(new color_1.RGBA(0, 0, 0, 0.08)),
        dark: new color_1.Color(new color_1.RGBA(255, 255, 255, 0.15)),
        hc: new color_1.Color(new color_1.RGBA(255, 255, 255, 0.15)),
    }, nls.localize(15, null));
    exports.cellInsertionIndicator = (0, colorRegistry_1.registerColor)('notebook.cellInsertionIndicator', {
        light: colorRegistry_1.focusBorder,
        dark: colorRegistry_1.focusBorder,
        hc: colorRegistry_1.focusBorder
    }, nls.localize(16, null));
    exports.listScrollbarSliderBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.background', {
        dark: colorRegistry_1.scrollbarSliderBackground,
        light: colorRegistry_1.scrollbarSliderBackground,
        hc: colorRegistry_1.scrollbarSliderBackground
    }, nls.localize(17, null));
    exports.listScrollbarSliderHoverBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.hoverBackground', {
        dark: colorRegistry_1.scrollbarSliderHoverBackground,
        light: colorRegistry_1.scrollbarSliderHoverBackground,
        hc: colorRegistry_1.scrollbarSliderHoverBackground
    }, nls.localize(18, null));
    exports.listScrollbarSliderActiveBackground = (0, colorRegistry_1.registerColor)('notebookScrollbarSlider.activeBackground', {
        dark: colorRegistry_1.scrollbarSliderActiveBackground,
        light: colorRegistry_1.scrollbarSliderActiveBackground,
        hc: colorRegistry_1.scrollbarSliderActiveBackground
    }, nls.localize(19, null));
    exports.cellSymbolHighlight = (0, colorRegistry_1.registerColor)('notebook.symbolHighlightBackground', {
        dark: color_1.Color.fromHex('#ffffff0b'),
        light: color_1.Color.fromHex('#fdff0033'),
        hc: null
    }, nls.localize(20, null));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        collector.addRule(`.notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element,
	.notebookOverlay > .cell-list-container > .notebook-gutter > .monaco-list > .monaco-scrollable-element {
		padding-top: ${constants_1.SCROLLABLE_ELEMENT_PADDING_TOP}px;
		box-sizing: border-box;
	}`);
        const link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(`.notebookOverlay .output a,
			.notebookOverlay .cell.markdown a,
			.notebookOverlay .output-show-more-container a
			{ color: ${link};} `);
        }
        const activeLink = theme.getColor(colorRegistry_1.textLinkActiveForeground);
        if (activeLink) {
            collector.addRule(`.notebookOverlay .output a:hover,
			.notebookOverlay .cell .output a:active,
			.notebookOverlay .output-show-more-container a:active
			{ color: ${activeLink}; }`);
        }
        const shortcut = theme.getColor(colorRegistry_1.textPreformatForeground);
        if (shortcut) {
            collector.addRule(`.notebookOverlay code,
			.notebookOverlay .shortcut { color: ${shortcut}; }`);
        }
        const border = theme.getColor(colorRegistry_1.contrastBorder);
        if (border) {
            collector.addRule(`.notebookOverlay .monaco-editor { border-color: ${border}; }`);
        }
        const quoteBackground = theme.getColor(colorRegistry_1.textBlockQuoteBackground);
        if (quoteBackground) {
            collector.addRule(`.notebookOverlay blockquote { background: ${quoteBackground}; }`);
        }
        const quoteBorder = theme.getColor(colorRegistry_1.textBlockQuoteBorder);
        if (quoteBorder) {
            collector.addRule(`.notebookOverlay blockquote { border-color: ${quoteBorder}; }`);
        }
        const containerBackground = theme.getColor(exports.notebookOutputContainerColor);
        if (containerBackground) {
            collector.addRule(`.notebookOverlay .output { background-color: ${containerBackground}; }`);
            collector.addRule(`.notebookOverlay .output-element { background-color: ${containerBackground}; }`);
            collector.addRule(`.notebookOverlay .output-show-more-container { background-color: ${containerBackground}; }`);
        }
        const editorBackgroundColor = theme.getColor(colorRegistry_1.editorBackground);
        if (editorBackgroundColor) {
            collector.addRule(`.notebookOverlay .cell .monaco-editor-background,
			.notebookOverlay .cell .margin-view-overlays,
			.notebookOverlay .cell .cell-statusbar-container { background: ${editorBackgroundColor}; }`);
            collector.addRule(`.notebookOverlay .cell-drag-image .cell-editor-container > div { background: ${editorBackgroundColor} !important; }`);
            collector.addRule(`.notebookOverlay .monaco-list-row .cell-title-toolbar { background-color: ${editorBackgroundColor}; }`);
            collector.addRule(`.notebookOverlay .monaco-list-row.cell-drag-image { background-color: ${editorBackgroundColor}; }`);
            collector.addRule(`.notebookOverlay .cell-bottom-toolbar-container .action-item { background-color: ${editorBackgroundColor} }`);
            collector.addRule(`.notebookOverlay .cell-list-top-cell-toolbar-container .action-item { background-color: ${editorBackgroundColor} }`);
        }
        const cellToolbarSeperator = theme.getColor(exports.CELL_TOOLBAR_SEPERATOR);
        if (cellToolbarSeperator) {
            collector.addRule(`.notebookOverlay .monaco-list-row .cell-title-toolbar { border: solid 1px ${cellToolbarSeperator}; }`);
            collector.addRule(`.notebookOverlay .cell-bottom-toolbar-container .action-item { border: solid 1px ${cellToolbarSeperator} }`);
            collector.addRule(`.notebookOverlay .cell-list-top-cell-toolbar-container .action-item { border: solid 1px ${cellToolbarSeperator} }`);
            collector.addRule(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-collapsed-part { border-bottom: solid 1px ${cellToolbarSeperator} }`);
            collector.addRule(`.notebookOverlay .monaco-action-bar .action-item.verticalSeparator { background-color: ${cellToolbarSeperator} }`);
        }
        const focusedCellBackgroundColor = theme.getColor(exports.focusedCellBackground);
        if (focusedCellBackgroundColor) {
            collector.addRule(`.notebookOverlay .code-cell-row.focused .cell-focus-indicator,
			.notebookOverlay .markdown-cell-row.focused { background-color: ${focusedCellBackgroundColor} !important; }`);
            collector.addRule(`.notebookOverlay .code-cell-row.focused .cell-collapsed-part { background-color: ${focusedCellBackgroundColor} !important; }`);
        }
        const selectedCellBackgroundColor = theme.getColor(exports.selectedCellBackground);
        if (exports.selectedCellBackground) {
            collector.addRule(`.notebookOverlay .monaco-list.selection-multiple .markdown-cell-row.selected { background-color: ${selectedCellBackgroundColor} !important; }`);
            collector.addRule(`.notebookOverlay .monaco-list.selection-multiple .code-cell-row.selected .cell-focus-indicator-top { background-color: ${selectedCellBackgroundColor} !important; }`);
            collector.addRule(`.notebookOverlay .monaco-list.selection-multiple .code-cell-row.selected .cell-focus-indicator-left { background-color: ${selectedCellBackgroundColor} !important; }`);
            collector.addRule(`.notebookOverlay .monaco-list.selection-multiple .code-cell-row.selected .cell-focus-indicator-right { background-color: ${selectedCellBackgroundColor} !important; }`);
            collector.addRule(`.notebookOverlay .monaco-list.selection-multiple .code-cell-row.selected .cell-focus-indicator-bottom { background-color: ${selectedCellBackgroundColor} !important; }`);
        }
        const inactiveSelectedCellBorderColor = theme.getColor(exports.inactiveSelectedCellBorder);
        collector.addRule(`
			.notebookOverlay .monaco-list.selection-multiple:focus-within .monaco-list-row.selected .cell-focus-indicator-top:before,
			.notebookOverlay .monaco-list.selection-multiple:focus-within .monaco-list-row.selected .cell-focus-indicator-bottom:before,
			.notebookOverlay .monaco-list.selection-multiple:focus-within .monaco-list-row.selected .cell-inner-container:not(.cell-editor-focus) .cell-focus-indicator-left:before,
			.notebookOverlay .monaco-list.selection-multiple:focus-within .monaco-list-row.selected .cell-inner-container:not(.cell-editor-focus) .cell-focus-indicator-right:before {
					border-color: ${inactiveSelectedCellBorderColor} !important;
			}
	`);
        const cellHoverBackgroundColor = theme.getColor(exports.cellHoverBackground);
        if (cellHoverBackgroundColor) {
            collector.addRule(`.notebookOverlay .code-cell-row:not(.focused):hover .cell-focus-indicator,
			.notebookOverlay .code-cell-row:not(.focused).cell-output-hover .cell-focus-indicator,
			.notebookOverlay .markdown-cell-row:not(.focused):hover { background-color: ${cellHoverBackgroundColor} !important; }`);
            collector.addRule(`.notebookOverlay .code-cell-row:not(.focused):hover .cell-collapsed-part,
			.notebookOverlay .code-cell-row:not(.focused).cell-output-hover .cell-collapsed-part { background-color: ${cellHoverBackgroundColor}; }`);
        }
        const focusedCellBorderColor = theme.getColor(exports.focusedCellBorder);
        collector.addRule(`
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-focus-indicator-bottom:before,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container:not(.cell-editor-focus) .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container:not(.cell-editor-focus) .cell-focus-indicator-right:before {
				border-color: ${focusedCellBorderColor} !important;
			}`);
        const inactiveFocusedBorderColor = theme.getColor(exports.inactiveFocusedCellBorder);
        collector.addRule(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-focus-indicator-bottom:before {
				border-color: ${inactiveFocusedBorderColor} !important;
			}`);
        const selectedCellBorderColor = theme.getColor(exports.selectedCellBorder);
        collector.addRule(`
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-editor-focus .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-editor-focus .cell-focus-indicator-bottom:before,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container.cell-editor-focus:before {
				border-color: ${selectedCellBorderColor} !important;
			}`);
        const cellSymbolHighlightColor = theme.getColor(exports.cellSymbolHighlight);
        if (cellSymbolHighlightColor) {
            collector.addRule(`.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.nb-symbolHighlight .cell-focus-indicator,
		.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row.nb-symbolHighlight {
			background-color: ${cellSymbolHighlightColor} !important;
		}`);
        }
        const focusedEditorBorderColorColor = theme.getColor(exports.focusedEditorBorderColor);
        if (focusedEditorBorderColorColor) {
            collector.addRule(`.notebookOverlay .monaco-list-row .cell-editor-focus .cell-editor-part:before { outline: solid 1px ${focusedEditorBorderColorColor}; }`);
        }
        const cellBorderColor = theme.getColor(exports.notebookCellBorder);
        if (cellBorderColor) {
            collector.addRule(`.notebookOverlay .cell.markdown h1 { border-color: ${cellBorderColor}; }`);
            collector.addRule(`.notebookOverlay .monaco-list-row .cell-editor-part:before { outline: solid 1px ${cellBorderColor}; }`);
        }
        const cellStatusBarHoverBg = theme.getColor(exports.cellStatusBarItemHover);
        if (cellStatusBarHoverBg) {
            collector.addRule(`.monaco-workbench .notebookOverlay .cell-statusbar-container .cell-language-picker:hover,
		.monaco-workbench .notebookOverlay .cell-statusbar-container .cell-status-item.cell-status-item-has-command:hover { background-color: ${cellStatusBarHoverBg}; }`);
        }
        const cellInsertionIndicatorColor = theme.getColor(exports.cellInsertionIndicator);
        if (cellInsertionIndicatorColor) {
            collector.addRule(`.notebookOverlay > .cell-list-container > .cell-list-insertion-indicator { background-color: ${cellInsertionIndicatorColor}; }`);
        }
        const scrollbarSliderBackgroundColor = theme.getColor(exports.listScrollbarSliderBackground);
        if (scrollbarSliderBackgroundColor) {
            collector.addRule(` .notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .scrollbar > .slider { background: ${scrollbarSliderBackgroundColor}; } `);
            // collector.addRule(` .monaco-workbench .notebookOverlay .output-plaintext::-webkit-scrollbar-track { background: ${scrollbarSliderBackgroundColor}; } `);
        }
        const scrollbarSliderHoverBackgroundColor = theme.getColor(exports.listScrollbarSliderHoverBackground);
        if (scrollbarSliderHoverBackgroundColor) {
            collector.addRule(` .notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .scrollbar > .slider:hover { background: ${scrollbarSliderHoverBackgroundColor}; } `);
            collector.addRule(` .monaco-workbench .notebookOverlay .output-plaintext::-webkit-scrollbar-thumb { background: ${scrollbarSliderHoverBackgroundColor}; } `);
            collector.addRule(` .monaco-workbench .notebookOverlay .output .error::-webkit-scrollbar-thumb { background: ${scrollbarSliderHoverBackgroundColor}; } `);
        }
        const scrollbarSliderActiveBackgroundColor = theme.getColor(exports.listScrollbarSliderActiveBackground);
        if (scrollbarSliderActiveBackgroundColor) {
            collector.addRule(` .notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .scrollbar > .slider.active { background: ${scrollbarSliderActiveBackgroundColor}; } `);
        }
        // case ChangeType.Modify: return theme.getColor(editorGutterModifiedBackground);
        // case ChangeType.Add: return theme.getColor(editorGutterAddedBackground);
        // case ChangeType.Delete: return theme.getColor(editorGutterDeletedBackground);
        // diff
        const modifiedBackground = theme.getColor(dirtydiffDecorator_1.editorGutterModifiedBackground);
        if (modifiedBackground) {
            collector.addRule(`
		.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.nb-cell-modified .cell-focus-indicator {
			background-color: ${modifiedBackground} !important;
		}

		.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row.nb-cell-modified {
			background-color: ${modifiedBackground} !important;
		}`);
        }
        const addedBackground = theme.getColor(colorRegistry_1.diffInserted);
        if (addedBackground) {
            collector.addRule(`
		.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.nb-cell-added .cell-focus-indicator {
			background-color: ${addedBackground} !important;
		}

		.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row.nb-cell-added {
			background-color: ${addedBackground} !important;
		}`);
        }
        const deletedBackground = theme.getColor(colorRegistry_1.diffRemoved);
        if (deletedBackground) {
            collector.addRule(`
		.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.nb-cell-deleted .cell-focus-indicator {
			background-color: ${deletedBackground} !important;
		}

		.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row.nb-cell-deleted {
			background-color: ${deletedBackground} !important;
		}`);
        }
        // Cell Margin
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${constants_1.CODE_CELL_LEFT_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .code-cell-row div.cell.code { margin-left: ${constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER}px; }`);
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell { margin-right: ${constants_1.CELL_RIGHT_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row > .cell-inner-container { padding-top: ${constants_1.CELL_TOP_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container { padding-bottom: ${constants_1.MARKDOWN_CELL_BOTTOM_MARGIN}px; padding-top: ${constants_1.MARKDOWN_CELL_TOP_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container.webview-backed-markdown-cell { padding: 0; }`);
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .webview-backed-markdown-cell.markdown-cell-edit-mode .cell.code { padding-bottom: ${constants_1.MARKDOWN_CELL_BOTTOM_MARGIN}px; padding-top: ${constants_1.MARKDOWN_CELL_TOP_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .output { margin: 0px ${constants_1.CELL_RIGHT_MARGIN}px 0px ${constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER}px; }`);
        collector.addRule(`.notebookOverlay .output { width: calc(100% - ${constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER + constants_1.CELL_RIGHT_MARGIN}px); }`);
        collector.addRule(`.notebookOverlay .output-show-more-container { margin: 0px ${constants_1.CELL_RIGHT_MARGIN}px 0px ${constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER}px; }`);
        collector.addRule(`.notebookOverlay .output-show-more-container { width: calc(100% - ${constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER + constants_1.CELL_RIGHT_MARGIN}px); }`);
        collector.addRule(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell.markdown { padding-left: ${constants_1.CELL_RUN_GUTTER}px; }`);
        collector.addRule(`.notebookOverlay .cell .run-button-container { width: 20px; left: ${constants_1.CODE_CELL_LEFT_MARGIN + Math.floor(constants_1.CELL_RUN_GUTTER - 20) / 2}px }`);
        collector.addRule(`.notebookOverlay .monaco-list .monaco-list-row :not(.webview-backed-markdown-cell) .cell-focus-indicator-top { height: ${constants_1.CELL_TOP_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-side { bottom: ${constants_1.BOTTOM_CELL_TOOLBAR_GAP}px; }`);
        collector.addRule(`.notebookOverlay .monaco-list .monaco-list-row.code-cell-row .cell-focus-indicator-left,
	.notebookOverlay .monaco-list .monaco-list-row.code-cell-row .cell-drag-handle { width: ${constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER}px; }`);
        collector.addRule(`.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row .cell-focus-indicator-left { width: ${constants_1.CODE_CELL_LEFT_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator.cell-focus-indicator-right { width: ${constants_1.CELL_RIGHT_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom { height: ${constants_1.CELL_BOTTOM_MARGIN}px; }`);
        collector.addRule(`.notebookOverlay .monaco-list .monaco-list-row .cell-shadow-container-bottom { top: ${constants_1.CELL_BOTTOM_MARGIN}px; }`);
        collector.addRule(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-collapsed-part { margin-left: ${constants_1.CODE_CELL_LEFT_MARGIN + constants_1.CELL_RUN_GUTTER}px; height: ${constants_1.COLLAPSED_INDICATOR_HEIGHT}px; }`);
        collector.addRule(`.notebookOverlay .cell-list-top-cell-toolbar-container { top: -${constants_1.SCROLLABLE_ELEMENT_PADDING_TOP}px }`);
        collector.addRule(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { height: ${constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT}px }`);
        collector.addRule(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container { height: ${constants_1.BOTTOM_CELL_TOOLBAR_HEIGHT}px }`);
        // left and right border margins
        collector.addRule(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-right:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-right:before {
				top: -${constants_1.CELL_TOP_MARGIN}px; height: calc(100% + ${constants_1.CELL_TOP_MARGIN + constants_1.CELL_BOTTOM_MARGIN}px)
			}`);
    });
});
//# sourceMappingURL=notebookEditorWidget.js.map