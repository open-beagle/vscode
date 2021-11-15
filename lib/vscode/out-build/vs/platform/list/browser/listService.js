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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listPaging", "vs/base/browser/ui/list/listWidget", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/registry/common/platform", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/contextkey/common/contextkeys", "vs/base/browser/ui/tree/objectTree", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/browser/ui/tree/dataTree", "vs/platform/accessibility/common/accessibility", "vs/base/browser/ui/table/tableWidget"], function (require, exports, dom_1, listPaging_1, listWidget_1, event_1, lifecycle_1, nls_1, configuration_1, configurationRegistry_1, contextkey_1, instantiation_1, keybinding_1, platform_1, styler_1, themeService_1, contextkeys_1, objectTree_1, asyncDataTree_1, dataTree_1, accessibility_1, tableWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchCompressibleAsyncDataTree = exports.WorkbenchAsyncDataTree = exports.WorkbenchDataTree = exports.WorkbenchCompressibleObjectTree = exports.WorkbenchObjectTree = exports.getSelectionKeyboardEvent = exports.WorkbenchTable = exports.WorkbenchPagedList = exports.WorkbenchList = exports.didBindWorkbenchListAutomaticKeyboardNavigation = exports.WorkbenchListAutomaticKeyboardNavigation = exports.WorkbenchListAutomaticKeyboardNavigationKey = exports.WorkbenchListSupportsKeyboardNavigation = exports.WorkbenchListSelectionNavigation = exports.WorkbenchListMultiSelection = exports.WorkbenchListDoubleSelection = exports.WorkbenchListHasSelectionOrFocus = exports.WorkbenchListFocusContextKey = exports.WorkbenchListSupportsMultiSelectContextKey = exports.ListService = exports.IListService = void 0;
    exports.IListService = (0, instantiation_1.createDecorator)('listService');
    let ListService = class ListService {
        constructor(_themeService) {
            this._themeService = _themeService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.lists = [];
            this._lastFocusedWidget = undefined;
            this._hasCreatedStyleController = false;
        }
        get lastFocusedList() {
            return this._lastFocusedWidget;
        }
        register(widget, extraContextKeys) {
            if (!this._hasCreatedStyleController) {
                this._hasCreatedStyleController = true;
                // create a shared default tree style sheet for performance reasons
                const styleController = new listWidget_1.DefaultStyleController((0, dom_1.createStyleSheet)(), '');
                this.disposables.add((0, styler_1.attachListStyler)(styleController, this._themeService));
            }
            if (this.lists.some(l => l.widget === widget)) {
                throw new Error('Cannot register the same widget multiple times');
            }
            // Keep in our lists list
            const registeredList = { widget, extraContextKeys };
            this.lists.push(registeredList);
            // Check for currently being focused
            if (widget.getHTMLElement() === document.activeElement) {
                this._lastFocusedWidget = widget;
            }
            return (0, lifecycle_1.combinedDisposable)(widget.onDidFocus(() => this._lastFocusedWidget = widget), (0, lifecycle_1.toDisposable)(() => this.lists.splice(this.lists.indexOf(registeredList), 1)), widget.onDidDispose(() => {
                this.lists = this.lists.filter(l => l !== registeredList);
                if (this._lastFocusedWidget === widget) {
                    this._lastFocusedWidget = undefined;
                }
            }));
        }
        dispose() {
            this.disposables.dispose();
        }
    };
    ListService = __decorate([
        __param(0, themeService_1.IThemeService)
    ], ListService);
    exports.ListService = ListService;
    const RawWorkbenchListFocusContextKey = new contextkey_1.RawContextKey('listFocus', true);
    exports.WorkbenchListSupportsMultiSelectContextKey = new contextkey_1.RawContextKey('listSupportsMultiselect', true);
    exports.WorkbenchListFocusContextKey = contextkey_1.ContextKeyExpr.and(RawWorkbenchListFocusContextKey, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey));
    exports.WorkbenchListHasSelectionOrFocus = new contextkey_1.RawContextKey('listHasSelectionOrFocus', false);
    exports.WorkbenchListDoubleSelection = new contextkey_1.RawContextKey('listDoubleSelection', false);
    exports.WorkbenchListMultiSelection = new contextkey_1.RawContextKey('listMultiSelection', false);
    exports.WorkbenchListSelectionNavigation = new contextkey_1.RawContextKey('listSelectionNavigation', false);
    exports.WorkbenchListSupportsKeyboardNavigation = new contextkey_1.RawContextKey('listSupportsKeyboardNavigation', true);
    exports.WorkbenchListAutomaticKeyboardNavigationKey = 'listAutomaticKeyboardNavigation';
    exports.WorkbenchListAutomaticKeyboardNavigation = new contextkey_1.RawContextKey(exports.WorkbenchListAutomaticKeyboardNavigationKey, true);
    exports.didBindWorkbenchListAutomaticKeyboardNavigation = false;
    function createScopedContextKeyService(contextKeyService, widget) {
        const result = contextKeyService.createScoped(widget.getHTMLElement());
        RawWorkbenchListFocusContextKey.bindTo(result);
        return result;
    }
    const multiSelectModifierSettingKey = 'workbench.list.multiSelectModifier';
    const openModeSettingKey = 'workbench.list.openMode';
    const horizontalScrollingKey = 'workbench.list.horizontalScrolling';
    const keyboardNavigationSettingKey = 'workbench.list.keyboardNavigation';
    const automaticKeyboardNavigationSettingKey = 'workbench.list.automaticKeyboardNavigation';
    const treeIndentKey = 'workbench.tree.indent';
    const treeRenderIndentGuidesKey = 'workbench.tree.renderIndentGuides';
    const listSmoothScrolling = 'workbench.list.smoothScrolling';
    const treeExpandMode = 'workbench.tree.expandMode';
    function useAltAsMultipleSelectionModifier(configurationService) {
        return configurationService.getValue(multiSelectModifierSettingKey) === 'alt';
    }
    class MultipleSelectionController extends lifecycle_1.Disposable {
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this.useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(this.configurationService);
                }
            }));
        }
        isSelectionSingleChangeEvent(event) {
            if (this.useAltAsMultipleSelectionModifier) {
                return event.browserEvent.altKey;
            }
            return (0, listWidget_1.isSelectionSingleChangeEvent)(event);
        }
        isSelectionRangeChangeEvent(event) {
            return (0, listWidget_1.isSelectionRangeChangeEvent)(event);
        }
    }
    function toWorkbenchListOptions(options, configurationService, keybindingService) {
        const disposables = new lifecycle_1.DisposableStore();
        const result = Object.assign({}, options);
        if (options.multipleSelectionSupport !== false && !options.multipleSelectionController) {
            const multipleSelectionController = new MultipleSelectionController(configurationService);
            result.multipleSelectionController = multipleSelectionController;
            disposables.add(multipleSelectionController);
        }
        result.keyboardNavigationDelegate = {
            mightProducePrintableCharacter(e) {
                return keybindingService.mightProducePrintableCharacter(e);
            }
        };
        result.smoothScrolling = configurationService.getValue(listSmoothScrolling);
        return [result, disposables];
    }
    let WorkbenchList = class WorkbenchList extends listWidget_1.List {
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService, keybindingService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : configurationService.getValue(horizontalScrollingKey);
            const [workbenchListOptions, workbenchListOptionsDisposable] = toWorkbenchListOptions(options, configurationService, keybindingService);
            super(user, container, delegate, renderers, Object.assign(Object.assign(Object.assign({ keyboardSupport: false }, (0, styler_1.computeStyles)(themeService.getColorTheme(), styler_1.defaultListStyles)), workbenchListOptions), { horizontalScrolling }));
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.themeService = themeService;
            const listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            listSupportsMultiSelect.set(!(options.multipleSelectionSupport === false));
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listHasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.horizontalScrolling = options.horizontalScrolling;
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            if (options.overrideStyles) {
                this.updateStyles(options.overrideStyles);
            }
            this.disposables.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.listMultiSelection.set(selection.length > 1);
                    this.listDoubleSelection.set(selection.length === 2);
                });
            }));
            this.disposables.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = configurationService.getValue(horizontalScrollingKey);
                    options = Object.assign(Object.assign({}, options), { horizontalScrolling });
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = configurationService.getValue(listSmoothScrolling);
                    options = Object.assign(Object.assign({}, options), { smoothScrolling });
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new ListResourceNavigator(this, Object.assign({ configurationService }, options));
            this.disposables.add(this.navigator);
        }
        get onDidOpen() { return this.navigator.onDidOpen; }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.updateStyles(options.overrideStyles);
            }
        }
        updateStyles(styles) {
            var _a;
            (_a = this._styler) === null || _a === void 0 ? void 0 : _a.dispose();
            this._styler = (0, styler_1.attachListStyler)(this, this.themeService, styles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        dispose() {
            var _a;
            (_a = this._styler) === null || _a === void 0 ? void 0 : _a.dispose();
            super.dispose();
        }
    };
    WorkbenchList = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, themeService_1.IThemeService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, keybinding_1.IKeybindingService)
    ], WorkbenchList);
    exports.WorkbenchList = WorkbenchList;
    let WorkbenchPagedList = class WorkbenchPagedList extends listPaging_1.PagedList {
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService, keybindingService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : configurationService.getValue(horizontalScrollingKey);
            const [workbenchListOptions, workbenchListOptionsDisposable] = toWorkbenchListOptions(options, configurationService, keybindingService);
            super(user, container, delegate, renderers, Object.assign(Object.assign(Object.assign({ keyboardSupport: false }, (0, styler_1.computeStyles)(themeService.getColorTheme(), styler_1.defaultListStyles)), workbenchListOptions), { horizontalScrolling }));
            this.disposables = new lifecycle_1.DisposableStore();
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.themeService = themeService;
            this.horizontalScrolling = options.horizontalScrolling;
            const listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            listSupportsMultiSelect.set(!(options.multipleSelectionSupport === false));
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            if (options.overrideStyles) {
                this.updateStyles(options.overrideStyles);
            }
            if (options.overrideStyles) {
                this.disposables.add((0, styler_1.attachListStyler)(this, themeService, options.overrideStyles));
            }
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = configurationService.getValue(horizontalScrollingKey);
                    options = Object.assign(Object.assign({}, options), { horizontalScrolling });
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = configurationService.getValue(listSmoothScrolling);
                    options = Object.assign(Object.assign({}, options), { smoothScrolling });
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new ListResourceNavigator(this, Object.assign({ configurationService }, options));
            this.disposables.add(this.navigator);
        }
        get onDidOpen() { return this.navigator.onDidOpen; }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.updateStyles(options.overrideStyles);
            }
        }
        updateStyles(styles) {
            var _a;
            (_a = this._styler) === null || _a === void 0 ? void 0 : _a.dispose();
            this._styler = (0, styler_1.attachListStyler)(this, this.themeService, styles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        dispose() {
            var _a;
            (_a = this._styler) === null || _a === void 0 ? void 0 : _a.dispose();
            this.disposables.dispose();
            super.dispose();
        }
    };
    WorkbenchPagedList = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, themeService_1.IThemeService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, keybinding_1.IKeybindingService)
    ], WorkbenchPagedList);
    exports.WorkbenchPagedList = WorkbenchPagedList;
    let WorkbenchTable = class WorkbenchTable extends tableWidget_1.Table {
        constructor(user, container, delegate, columns, renderers, options, contextKeyService, listService, themeService, configurationService, keybindingService) {
            const horizontalScrolling = typeof options.horizontalScrolling !== 'undefined' ? options.horizontalScrolling : configurationService.getValue(horizontalScrollingKey);
            const [workbenchListOptions, workbenchListOptionsDisposable] = toWorkbenchListOptions(options, configurationService, keybindingService);
            super(user, container, delegate, columns, renderers, Object.assign(Object.assign(Object.assign({ keyboardSupport: false }, (0, styler_1.computeStyles)(themeService.getColorTheme(), styler_1.defaultListStyles)), workbenchListOptions), { horizontalScrolling }));
            this.disposables = new lifecycle_1.DisposableStore();
            this.disposables.add(workbenchListOptionsDisposable);
            this.contextKeyService = createScopedContextKeyService(contextKeyService, this);
            this.themeService = themeService;
            const listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            listSupportsMultiSelect.set(!(options.multipleSelectionSupport === false));
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.listHasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.listDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.listMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this.horizontalScrolling = options.horizontalScrolling;
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            this.disposables.add(this.contextKeyService);
            this.disposables.add(listService.register(this));
            if (options.overrideStyles) {
                this.updateStyles(options.overrideStyles);
            }
            this.disposables.add(this.onDidChangeSelection(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.listMultiSelection.set(selection.length > 1);
                    this.listDoubleSelection.set(selection.length === 2);
                });
            }));
            this.disposables.add(this.onDidChangeFocus(() => {
                const selection = this.getSelection();
                const focus = this.getFocus();
                this.listHasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                let options = {};
                if (e.affectsConfiguration(horizontalScrollingKey) && this.horizontalScrolling === undefined) {
                    const horizontalScrolling = configurationService.getValue(horizontalScrollingKey);
                    options = Object.assign(Object.assign({}, options), { horizontalScrolling });
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = configurationService.getValue(listSmoothScrolling);
                    options = Object.assign(Object.assign({}, options), { smoothScrolling });
                }
                if (Object.keys(options).length > 0) {
                    this.updateOptions(options);
                }
            }));
            this.navigator = new TableResourceNavigator(this, Object.assign({ configurationService }, options));
            this.disposables.add(this.navigator);
        }
        get onDidOpen() { return this.navigator.onDidOpen; }
        updateOptions(options) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.updateStyles(options.overrideStyles);
            }
        }
        updateStyles(styles) {
            var _a;
            (_a = this._styler) === null || _a === void 0 ? void 0 : _a.dispose();
            this._styler = (0, styler_1.attachListStyler)(this, this.themeService, styles);
        }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        dispose() {
            var _a;
            (_a = this._styler) === null || _a === void 0 ? void 0 : _a.dispose();
            this.disposables.dispose();
            super.dispose();
        }
    };
    WorkbenchTable = __decorate([
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, themeService_1.IThemeService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, keybinding_1.IKeybindingService)
    ], WorkbenchTable);
    exports.WorkbenchTable = WorkbenchTable;
    function getSelectionKeyboardEvent(typeArg = 'keydown', preserveFocus, pinned) {
        const e = new KeyboardEvent(typeArg);
        e.preserveFocus = preserveFocus;
        e.pinned = pinned;
        e.__forceEvent = true;
        return e;
    }
    exports.getSelectionKeyboardEvent = getSelectionKeyboardEvent;
    class ResourceNavigator extends lifecycle_1.Disposable {
        constructor(widget, options) {
            var _a;
            super();
            this.widget = widget;
            this._onDidOpen = this._register(new event_1.Emitter());
            this.onDidOpen = this._onDidOpen.event;
            this._register(event_1.Event.filter(this.widget.onDidChangeSelection, e => e.browserEvent instanceof KeyboardEvent)(e => this.onSelectionFromKeyboard(e)));
            this._register(this.widget.onPointer((e) => this.onPointer(e.element, e.browserEvent)));
            this._register(this.widget.onMouseDblClick((e) => this.onMouseDblClick(e.element, e.browserEvent)));
            if (typeof (options === null || options === void 0 ? void 0 : options.openOnSingleClick) !== 'boolean' && (options === null || options === void 0 ? void 0 : options.configurationService)) {
                this.openOnSingleClick = (options === null || options === void 0 ? void 0 : options.configurationService.getValue(openModeSettingKey)) !== 'doubleClick';
                this._register(options === null || options === void 0 ? void 0 : options.configurationService.onDidChangeConfiguration(() => {
                    this.openOnSingleClick = (options === null || options === void 0 ? void 0 : options.configurationService.getValue(openModeSettingKey)) !== 'doubleClick';
                }));
            }
            else {
                this.openOnSingleClick = (_a = options === null || options === void 0 ? void 0 : options.openOnSingleClick) !== null && _a !== void 0 ? _a : true;
            }
        }
        onSelectionFromKeyboard(event) {
            if (event.elements.length !== 1) {
                return;
            }
            const selectionKeyboardEvent = event.browserEvent;
            const preserveFocus = typeof selectionKeyboardEvent.preserveFocus === 'boolean' ? selectionKeyboardEvent.preserveFocus : true;
            const pinned = typeof selectionKeyboardEvent.pinned === 'boolean' ? selectionKeyboardEvent.pinned : !preserveFocus;
            const sideBySide = false;
            this._open(this.getSelectedElement(), preserveFocus, pinned, sideBySide, event.browserEvent);
        }
        onPointer(element, browserEvent) {
            if (!this.openOnSingleClick) {
                return;
            }
            const isDoubleClick = browserEvent.detail === 2;
            if (isDoubleClick) {
                return;
            }
            const isMiddleClick = browserEvent.button === 1;
            const preserveFocus = true;
            const pinned = isMiddleClick;
            const sideBySide = browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey;
            this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        onMouseDblClick(element, browserEvent) {
            if (!browserEvent) {
                return;
            }
            // copied from AbstractTree
            const target = browserEvent.target;
            const onTwistie = target.classList.contains('monaco-tl-twistie')
                || (target.classList.contains('monaco-icon-label') && target.classList.contains('folder-icon') && browserEvent.offsetX < 16);
            if (onTwistie) {
                return;
            }
            const preserveFocus = false;
            const pinned = true;
            const sideBySide = (browserEvent.ctrlKey || browserEvent.metaKey || browserEvent.altKey);
            this._open(element, preserveFocus, pinned, sideBySide, browserEvent);
        }
        _open(element, preserveFocus, pinned, sideBySide, browserEvent) {
            if (!element) {
                return;
            }
            this._onDidOpen.fire({
                editorOptions: {
                    preserveFocus,
                    pinned,
                    revealIfVisible: true
                },
                sideBySide,
                element,
                browserEvent
            });
        }
    }
    class ListResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
            this.widget = widget;
        }
        getSelectedElement() {
            return this.widget.getSelectedElements()[0];
        }
    }
    class TableResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            return this.widget.getSelectedElements()[0];
        }
    }
    class TreeResourceNavigator extends ResourceNavigator {
        constructor(widget, options) {
            super(widget, options);
        }
        getSelectedElement() {
            var _a;
            return (_a = this.widget.getSelection()[0]) !== null && _a !== void 0 ? _a : undefined;
        }
    }
    function createKeyboardNavigationEventFilter(container, keybindingService) {
        let inChord = false;
        return event => {
            if (inChord) {
                inChord = false;
                return false;
            }
            const result = keybindingService.softDispatch(event, container);
            if (result && result.enterChord) {
                inChord = true;
                return false;
            }
            inChord = false;
            return true;
        };
    }
    let WorkbenchObjectTree = class WorkbenchObjectTree extends objectTree_1.ObjectTree {
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService) {
            const { options: treeOptions, getAutomaticKeyboardNavigation, disposable } = workbenchTreeDataPreamble(container, options, contextKeyService, configurationService, keybindingService, accessibilityService);
            super(user, container, delegate, renderers, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getAutomaticKeyboardNavigation, options.overrideStyles, contextKeyService, listService, themeService, configurationService, accessibilityService);
            this.disposables.add(this.internals);
        }
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
    };
    WorkbenchObjectTree = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, themeService_1.IThemeService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, accessibility_1.IAccessibilityService)
    ], WorkbenchObjectTree);
    exports.WorkbenchObjectTree = WorkbenchObjectTree;
    let WorkbenchCompressibleObjectTree = class WorkbenchCompressibleObjectTree extends objectTree_1.CompressibleObjectTree {
        constructor(user, container, delegate, renderers, options, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService) {
            const { options: treeOptions, getAutomaticKeyboardNavigation, disposable } = workbenchTreeDataPreamble(container, options, contextKeyService, configurationService, keybindingService, accessibilityService);
            super(user, container, delegate, renderers, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getAutomaticKeyboardNavigation, options.overrideStyles, contextKeyService, listService, themeService, configurationService, accessibilityService);
            this.disposables.add(this.internals);
        }
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
        }
    };
    WorkbenchCompressibleObjectTree = __decorate([
        __param(5, contextkey_1.IContextKeyService),
        __param(6, exports.IListService),
        __param(7, themeService_1.IThemeService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, accessibility_1.IAccessibilityService)
    ], WorkbenchCompressibleObjectTree);
    exports.WorkbenchCompressibleObjectTree = WorkbenchCompressibleObjectTree;
    let WorkbenchDataTree = class WorkbenchDataTree extends dataTree_1.DataTree {
        constructor(user, container, delegate, renderers, dataSource, options, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService) {
            const { options: treeOptions, getAutomaticKeyboardNavigation, disposable } = workbenchTreeDataPreamble(container, options, contextKeyService, configurationService, keybindingService, accessibilityService);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getAutomaticKeyboardNavigation, options.overrideStyles, contextKeyService, listService, themeService, configurationService, accessibilityService);
            this.disposables.add(this.internals);
        }
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
        }
    };
    WorkbenchDataTree = __decorate([
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, themeService_1.IThemeService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, keybinding_1.IKeybindingService),
        __param(11, accessibility_1.IAccessibilityService)
    ], WorkbenchDataTree);
    exports.WorkbenchDataTree = WorkbenchDataTree;
    let WorkbenchAsyncDataTree = class WorkbenchAsyncDataTree extends asyncDataTree_1.AsyncDataTree {
        constructor(user, container, delegate, renderers, dataSource, options, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService) {
            const { options: treeOptions, getAutomaticKeyboardNavigation, disposable } = workbenchTreeDataPreamble(container, options, contextKeyService, configurationService, keybindingService, accessibilityService);
            super(user, container, delegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getAutomaticKeyboardNavigation, options.overrideStyles, contextKeyService, listService, themeService, configurationService, accessibilityService);
            this.disposables.add(this.internals);
        }
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
        updateOptions(options = {}) {
            super.updateOptions(options);
            if (options.overrideStyles) {
                this.internals.updateStyleOverrides(options.overrideStyles);
            }
        }
    };
    WorkbenchAsyncDataTree = __decorate([
        __param(6, contextkey_1.IContextKeyService),
        __param(7, exports.IListService),
        __param(8, themeService_1.IThemeService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, keybinding_1.IKeybindingService),
        __param(11, accessibility_1.IAccessibilityService)
    ], WorkbenchAsyncDataTree);
    exports.WorkbenchAsyncDataTree = WorkbenchAsyncDataTree;
    let WorkbenchCompressibleAsyncDataTree = class WorkbenchCompressibleAsyncDataTree extends asyncDataTree_1.CompressibleAsyncDataTree {
        constructor(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, options, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService) {
            const { options: treeOptions, getAutomaticKeyboardNavigation, disposable } = workbenchTreeDataPreamble(container, options, contextKeyService, configurationService, keybindingService, accessibilityService);
            super(user, container, virtualDelegate, compressionDelegate, renderers, dataSource, treeOptions);
            this.disposables.add(disposable);
            this.internals = new WorkbenchTreeInternals(this, options, getAutomaticKeyboardNavigation, options.overrideStyles, contextKeyService, listService, themeService, configurationService, accessibilityService);
            this.disposables.add(this.internals);
        }
        get contextKeyService() { return this.internals.contextKeyService; }
        get useAltAsMultipleSelectionModifier() { return this.internals.useAltAsMultipleSelectionModifier; }
        get onDidOpen() { return this.internals.onDidOpen; }
    };
    WorkbenchCompressibleAsyncDataTree = __decorate([
        __param(7, contextkey_1.IContextKeyService),
        __param(8, exports.IListService),
        __param(9, themeService_1.IThemeService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, accessibility_1.IAccessibilityService)
    ], WorkbenchCompressibleAsyncDataTree);
    exports.WorkbenchCompressibleAsyncDataTree = WorkbenchCompressibleAsyncDataTree;
    function workbenchTreeDataPreamble(container, options, contextKeyService, configurationService, keybindingService, accessibilityService) {
        var _a;
        exports.WorkbenchListSupportsKeyboardNavigation.bindTo(contextKeyService);
        if (!exports.didBindWorkbenchListAutomaticKeyboardNavigation) {
            exports.WorkbenchListAutomaticKeyboardNavigation.bindTo(contextKeyService);
            exports.didBindWorkbenchListAutomaticKeyboardNavigation = true;
        }
        const getAutomaticKeyboardNavigation = () => {
            // give priority to the context key value to disable this completely
            let automaticKeyboardNavigation = contextKeyService.getContextKeyValue(exports.WorkbenchListAutomaticKeyboardNavigationKey);
            if (automaticKeyboardNavigation) {
                automaticKeyboardNavigation = configurationService.getValue(automaticKeyboardNavigationSettingKey);
            }
            return automaticKeyboardNavigation;
        };
        const accessibilityOn = accessibilityService.isScreenReaderOptimized();
        const keyboardNavigation = options.simpleKeyboardNavigation || accessibilityOn ? 'simple' : configurationService.getValue(keyboardNavigationSettingKey);
        const horizontalScrolling = options.horizontalScrolling !== undefined ? options.horizontalScrolling : configurationService.getValue(horizontalScrollingKey);
        const [workbenchListOptions, disposable] = toWorkbenchListOptions(options, configurationService, keybindingService);
        const additionalScrollHeight = options.additionalScrollHeight;
        return {
            getAutomaticKeyboardNavigation,
            disposable,
            options: Object.assign(Object.assign({ 
                // ...options, // TODO@Joao why is this not splatted here?
                keyboardSupport: false }, workbenchListOptions), { indent: configurationService.getValue(treeIndentKey), renderIndentGuides: configurationService.getValue(treeRenderIndentGuidesKey), smoothScrolling: configurationService.getValue(listSmoothScrolling), automaticKeyboardNavigation: getAutomaticKeyboardNavigation(), simpleKeyboardNavigation: keyboardNavigation === 'simple', filterOnType: keyboardNavigation === 'filter', horizontalScrolling, keyboardNavigationEventFilter: createKeyboardNavigationEventFilter(container, keybindingService), additionalScrollHeight, hideTwistiesOfChildlessElements: options.hideTwistiesOfChildlessElements, expandOnlyOnTwistieClick: (_a = options.expandOnlyOnTwistieClick) !== null && _a !== void 0 ? _a : (configurationService.getValue(treeExpandMode) === 'doubleClick') })
        };
    }
    let WorkbenchTreeInternals = class WorkbenchTreeInternals {
        constructor(tree, options, getAutomaticKeyboardNavigation, overrideStyles, contextKeyService, listService, themeService, configurationService, accessibilityService) {
            this.tree = tree;
            this.themeService = themeService;
            this.disposables = [];
            this.contextKeyService = createScopedContextKeyService(contextKeyService, tree);
            const listSupportsMultiSelect = exports.WorkbenchListSupportsMultiSelectContextKey.bindTo(this.contextKeyService);
            listSupportsMultiSelect.set(!(options.multipleSelectionSupport === false));
            const listSelectionNavigation = exports.WorkbenchListSelectionNavigation.bindTo(this.contextKeyService);
            listSelectionNavigation.set(Boolean(options.selectionNavigation));
            this.hasSelectionOrFocus = exports.WorkbenchListHasSelectionOrFocus.bindTo(this.contextKeyService);
            this.hasDoubleSelection = exports.WorkbenchListDoubleSelection.bindTo(this.contextKeyService);
            this.hasMultiSelection = exports.WorkbenchListMultiSelection.bindTo(this.contextKeyService);
            this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
            const interestingContextKeys = new Set();
            interestingContextKeys.add(exports.WorkbenchListAutomaticKeyboardNavigationKey);
            const updateKeyboardNavigation = () => {
                const accessibilityOn = accessibilityService.isScreenReaderOptimized();
                const keyboardNavigation = accessibilityOn ? 'simple' : configurationService.getValue(keyboardNavigationSettingKey);
                tree.updateOptions({
                    simpleKeyboardNavigation: keyboardNavigation === 'simple',
                    filterOnType: keyboardNavigation === 'filter'
                });
            };
            this.updateStyleOverrides(overrideStyles);
            this.disposables.push(this.contextKeyService, listService.register(tree), tree.onDidChangeSelection(() => {
                const selection = tree.getSelection();
                const focus = tree.getFocus();
                this.contextKeyService.bufferChangeEvents(() => {
                    this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
                    this.hasMultiSelection.set(selection.length > 1);
                    this.hasDoubleSelection.set(selection.length === 2);
                });
            }), tree.onDidChangeFocus(() => {
                const selection = tree.getSelection();
                const focus = tree.getFocus();
                this.hasSelectionOrFocus.set(selection.length > 0 || focus.length > 0);
            }), configurationService.onDidChangeConfiguration(e => {
                let newOptions = {};
                if (e.affectsConfiguration(multiSelectModifierSettingKey)) {
                    this._useAltAsMultipleSelectionModifier = useAltAsMultipleSelectionModifier(configurationService);
                }
                if (e.affectsConfiguration(treeIndentKey)) {
                    const indent = configurationService.getValue(treeIndentKey);
                    newOptions = Object.assign(Object.assign({}, newOptions), { indent });
                }
                if (e.affectsConfiguration(treeRenderIndentGuidesKey)) {
                    const renderIndentGuides = configurationService.getValue(treeRenderIndentGuidesKey);
                    newOptions = Object.assign(Object.assign({}, newOptions), { renderIndentGuides });
                }
                if (e.affectsConfiguration(listSmoothScrolling)) {
                    const smoothScrolling = configurationService.getValue(listSmoothScrolling);
                    newOptions = Object.assign(Object.assign({}, newOptions), { smoothScrolling });
                }
                if (e.affectsConfiguration(keyboardNavigationSettingKey)) {
                    updateKeyboardNavigation();
                }
                if (e.affectsConfiguration(automaticKeyboardNavigationSettingKey)) {
                    newOptions = Object.assign(Object.assign({}, newOptions), { automaticKeyboardNavigation: getAutomaticKeyboardNavigation() });
                }
                if (e.affectsConfiguration(horizontalScrollingKey) && options.horizontalScrolling === undefined) {
                    const horizontalScrolling = configurationService.getValue(horizontalScrollingKey);
                    newOptions = Object.assign(Object.assign({}, newOptions), { horizontalScrolling });
                }
                if (e.affectsConfiguration(treeExpandMode) && options.expandOnlyOnTwistieClick === undefined) {
                    newOptions = Object.assign(Object.assign({}, newOptions), { expandOnlyOnTwistieClick: configurationService.getValue(treeExpandMode) === 'doubleClick' });
                }
                if (Object.keys(newOptions).length > 0) {
                    tree.updateOptions(newOptions);
                }
            }), this.contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(interestingContextKeys)) {
                    tree.updateOptions({ automaticKeyboardNavigation: getAutomaticKeyboardNavigation() });
                }
            }), accessibilityService.onDidChangeScreenReaderOptimized(() => updateKeyboardNavigation()));
            this.navigator = new TreeResourceNavigator(tree, Object.assign({ configurationService }, options));
            this.disposables.push(this.navigator);
        }
        get onDidOpen() { return this.navigator.onDidOpen; }
        get useAltAsMultipleSelectionModifier() {
            return this._useAltAsMultipleSelectionModifier;
        }
        updateStyleOverrides(overrideStyles) {
            (0, lifecycle_1.dispose)(this.styler);
            this.styler = overrideStyles ? (0, styler_1.attachListStyler)(this.tree, this.themeService, overrideStyles) : lifecycle_1.Disposable.None;
        }
        dispose() {
            this.disposables = (0, lifecycle_1.dispose)(this.disposables);
            (0, lifecycle_1.dispose)(this.styler);
            this.styler = undefined;
        }
    };
    WorkbenchTreeInternals = __decorate([
        __param(4, contextkey_1.IContextKeyService),
        __param(5, exports.IListService),
        __param(6, themeService_1.IThemeService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, accessibility_1.IAccessibilityService)
    ], WorkbenchTreeInternals);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        'id': 'workbench',
        'order': 7,
        'title': (0, nls_1.localize)(0, null),
        'type': 'object',
        'properties': {
            [multiSelectModifierSettingKey]: {
                'type': 'string',
                'enum': ['ctrlCmd', 'alt'],
                'enumDescriptions': [
                    (0, nls_1.localize)(1, null),
                    (0, nls_1.localize)(2, null)
                ],
                'default': 'ctrlCmd',
                'description': (0, nls_1.localize)(3, null)






            },
            [openModeSettingKey]: {
                'type': 'string',
                'enum': ['singleClick', 'doubleClick'],
                'default': 'singleClick',
                'description': (0, nls_1.localize)(4, null)



            },
            [horizontalScrollingKey]: {
                'type': 'boolean',
                'default': false,
                'description': (0, nls_1.localize)(5, null)
            },
            [treeIndentKey]: {
                'type': 'number',
                'default': 8,
                minimum: 0,
                maximum: 40,
                'description': (0, nls_1.localize)(6, null)
            },
            [treeRenderIndentGuidesKey]: {
                type: 'string',
                enum: ['none', 'onHover', 'always'],
                default: 'onHover',
                description: (0, nls_1.localize)(7, null)
            },
            [listSmoothScrolling]: {
                type: 'boolean',
                default: false,
                description: (0, nls_1.localize)(8, null),
            },
            [keyboardNavigationSettingKey]: {
                'type': 'string',
                'enum': ['simple', 'highlight', 'filter'],
                'enumDescriptions': [
                    (0, nls_1.localize)(9, null),
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null)
                ],
                'default': 'highlight',
                'description': (0, nls_1.localize)(12, null)
            },
            [automaticKeyboardNavigationSettingKey]: {
                'type': 'boolean',
                'default': true,
                markdownDescription: (0, nls_1.localize)(13, null)
            },
            [treeExpandMode]: {
                type: 'string',
                enum: ['singleClick', 'doubleClick'],
                default: 'singleClick',
                description: (0, nls_1.localize)(14, null),
            }
        }
    });
});
//# sourceMappingURL=listService.js.map