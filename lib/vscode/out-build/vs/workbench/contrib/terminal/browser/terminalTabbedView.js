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
define(["require", "exports", "vs/base/browser/ui/splitview/splitview", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalFindWidget", "vs/workbench/contrib/terminal/browser/terminalTabsWidget", "vs/platform/theme/common/themeService", "vs/base/common/platform", "vs/base/browser/dom", "vs/base/browser/canIUse", "vs/platform/notification/common/notification", "vs/base/browser/dnd", "vs/base/common/uri", "vs/base/browser/mouseEvent", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/storage/common/storage", "vs/platform/log/common/log", "vs/nls!vs/workbench/contrib/terminal/browser/terminalTabbedView"], function (require, exports, splitview_1, lifecycle_1, configuration_1, instantiation_1, terminal_1, terminalFindWidget_1, terminalTabsWidget_1, themeService_1, platform_1, dom, canIUse_1, notification_1, dnd_1, uri_1, mouseEvent_1, menuEntryActionViewItem_1, actions_1, actions_2, contextkey_1, contextView_1, terminal_2, storage_1, log_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalTabbedView = void 0;
    const $ = dom.$;
    const FIND_FOCUS_CLASS = 'find-focused';
    const TABS_WIDGET_WIDTH_KEY = 'tabs-widget-width';
    const MAX_TABS_WIDGET_WIDTH = 500;
    const STATUS_ICON_WIDTH = 30;
    const SPLIT_ANNOTATION_WIDTH = 30;
    let TerminalTabbedView = class TerminalTabbedView extends lifecycle_1.Disposable {
        constructor(parentElement, _terminalService, _instantiationService, _notificationService, _contextMenuService, _themeService, _configurationService, menuService, _storageService, _logService, contextKeyService) {
            super();
            this._terminalService = _terminalService;
            this._instantiationService = _instantiationService;
            this._notificationService = _notificationService;
            this._contextMenuService = _contextMenuService;
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this._storageService = _storageService;
            this._logService = _logService;
            this._cancelContextMenu = false;
            this._parentElement = parentElement;
            this._tabTreeContainer = $('.tabs-container');
            const tabWidgetContainer = $('.tabs-widget-container');
            this._terminalTabTree = $('.tabs-widget');
            tabWidgetContainer.appendChild(this._terminalTabTree);
            this._tabTreeContainer.appendChild(tabWidgetContainer);
            this._instanceMenu = this._register(menuService.createMenu(actions_2.MenuId.TerminalContainerContext, contextKeyService));
            this._tabsWidgetMenu = this._register(menuService.createMenu(actions_2.MenuId.TerminalTabsWidgetContext, contextKeyService));
            this._tabsWidgetEmptyMenu = this._register(menuService.createMenu(actions_2.MenuId.TerminalTabsWidgetEmptyContext, contextKeyService));
            this._register(this._tabsWidget = this._instantiationService.createInstance(terminalTabsWidget_1.TerminalTabsWidget, this._terminalTabTree));
            this._register(this._findWidget = this._instantiationService.createInstance(terminalFindWidget_1.TerminalFindWidget, this._terminalService.getFindState()));
            parentElement.appendChild(this._findWidget.getDomNode());
            this._terminalContainer = document.createElement('div');
            this._terminalContainer.classList.add('terminal-outer-container');
            this._terminalContainer.style.display = 'block';
            this._tabTreeIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 0 : 1;
            this._terminalContainerIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 1 : 0;
            this._findWidgetVisible = terminal_2.KEYBINDING_CONTEXT_TERMINAL_FIND_VISIBLE.bindTo(contextKeyService);
            this._terminalService.setContainers(parentElement, this._terminalContainer);
            this._terminalIsTabsNarrowContextKey = terminal_2.KEYBINDING_CONTEXT_TERMINAL_IS_TABS_NARROW_FOCUS.bindTo(contextKeyService);
            this._terminalTabsFocusContextKey = terminal_2.KEYBINDING_CONTEXT_TERMINAL_TABS_FOCUS.bindTo(contextKeyService);
            _configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('terminal.integrated.tabs.enabled') ||
                    e.affectsConfiguration('terminal.integrated.tabs.hideCondition')) {
                    this._refreshShowTabs();
                }
                else if (e.affectsConfiguration('terminal.integrated.tabs.location')) {
                    this._tabTreeIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 0 : 1;
                    this._terminalContainerIndex = this._terminalService.configHelper.config.tabs.location === 'left' ? 1 : 0;
                    if (this._shouldShowTabs()) {
                        this._splitView.swapViews(0, 1);
                        this._removeSashListener();
                        this._addSashListener();
                        this._splitView.resizeView(this._tabTreeIndex, this._getLastWidgetWidth());
                    }
                }
            });
            this._register(this._terminalService.onInstancesChanged(() => this._refreshShowTabs()));
            this._register(this._themeService.onDidColorThemeChange(theme => this._updateTheme(theme)));
            this._updateTheme();
            this._findWidget.focusTracker.onDidFocus(() => this._terminalContainer.classList.add(FIND_FOCUS_CLASS));
            this._attachEventListeners(parentElement, this._terminalContainer);
            this._splitView = new splitview_1.SplitView(parentElement, { orientation: 1 /* HORIZONTAL */, proportionalLayout: false });
            this._setupSplitView();
            this._terminalService.onPanelMovedToSide(() => {
                try {
                    this._updateWidgetWidth(terminalTabsWidget_1.MIN_TABS_WIDGET_WIDTH);
                }
                catch (e) {
                }
            });
        }
        _shouldShowTabs() {
            const enable = this._terminalService.configHelper.config.tabs.enabled;
            const hideForSingle = this._terminalService.configHelper.config.tabs.hideCondition === 'singleTerminal';
            return enable && (!hideForSingle || (hideForSingle && this._terminalService.terminalInstances.length > 1));
        }
        _refreshShowTabs() {
            if (this._shouldShowTabs()) {
                if (this._splitView.length === 1) {
                    this._addTabTree();
                    this._addSashListener();
                    this._splitView.resizeView(this._tabTreeIndex, this._getLastWidgetWidth());
                    this._rerenderTabs();
                }
            }
            else {
                if (this._splitView.length === 2) {
                    this._splitView.removeView(this._tabTreeIndex);
                    if (this._plusButton) {
                        this._tabTreeContainer.removeChild(this._plusButton);
                    }
                    this._removeSashListener();
                }
            }
        }
        _getLastWidgetWidth() {
            const storedValue = this._storageService.get(TABS_WIDGET_WIDTH_KEY, 1 /* WORKSPACE */);
            if (!storedValue || !parseInt(storedValue)) {
                return terminalTabsWidget_1.DEFAULT_TABS_WIDGET_WIDTH;
            }
            return parseInt(storedValue);
        }
        _handleOnDidSashReset() {
            // Calculate ideal size of widget to display all text based on its contents
            let idealWidth = terminalTabsWidget_1.DEFAULT_TABS_WIDGET_WIDTH;
            const offscreenCanvas = new OffscreenCanvas(1, 1);
            const ctx = offscreenCanvas.getContext('2d');
            if (ctx) {
                const style = window.getComputedStyle(this._terminalTabTree);
                ctx.font = `${style.fontStyle} ${style.fontSize} ${style.fontFamily}`;
                const maxInstanceWidth = this._terminalService.terminalInstances.reduce((p, c) => {
                    return Math.max(p, ctx.measureText(c.title + (c.shellLaunchConfig.description || '')).width + this._getAdditionalWidth(c));
                }, 0);
                idealWidth = Math.ceil(Math.max(maxInstanceWidth, terminalTabsWidget_1.DEFAULT_TABS_WIDGET_WIDTH));
            }
            // If the size is already ideal, toggle to collapsed
            const currentWidth = Math.ceil(this._splitView.getViewSize(this._tabTreeIndex));
            if (currentWidth === idealWidth) {
                idealWidth = terminalTabsWidget_1.MIN_TABS_WIDGET_WIDTH;
            }
            this._splitView.resizeView(this._tabTreeIndex, idealWidth);
            this._updateWidgetWidth(idealWidth);
        }
        _getAdditionalWidth(instance) {
            var _a;
            // Size to include padding, icon, status icon (if any), split annotation (if any), + a little more
            const additionalWidth = 30;
            const statusIconWidth = instance.statusList.statuses.length > 0 ? STATUS_ICON_WIDTH : 0;
            const splitAnnotationWidth = (((_a = this._terminalService.getTabForInstance(instance)) === null || _a === void 0 ? void 0 : _a.terminalInstances.length) || 0) > 1 ? SPLIT_ANNOTATION_WIDTH : 0;
            return additionalWidth + splitAnnotationWidth + statusIconWidth;
        }
        _handleOnDidSashChange() {
            let widgetWidth = this._splitView.getViewSize(this._tabTreeIndex);
            if (!this._width || widgetWidth <= 0) {
                return;
            }
            this._updateWidgetWidth(widgetWidth);
        }
        _updateWidgetWidth(width) {
            if (width < terminalTabsWidget_1.MIDPOINT_WIDGET_WIDTH && width >= terminalTabsWidget_1.MIN_TABS_WIDGET_WIDTH) {
                width = terminalTabsWidget_1.MIN_TABS_WIDGET_WIDTH;
                this._splitView.resizeView(this._tabTreeIndex, width);
            }
            else if (width >= terminalTabsWidget_1.MIDPOINT_WIDGET_WIDTH && width < terminalTabsWidget_1.DEFAULT_TABS_WIDGET_WIDTH) {
                width = terminalTabsWidget_1.DEFAULT_TABS_WIDGET_WIDTH;
                this._splitView.resizeView(this._tabTreeIndex, width);
            }
            this._rerenderTabs();
            this._storageService.store(TABS_WIDGET_WIDTH_KEY, width, 1 /* WORKSPACE */, 0 /* USER */);
        }
        _setupSplitView() {
            this._register(this._splitView.onDidSashReset(() => this._handleOnDidSashReset()));
            this._register(this._splitView.onDidSashChange(() => this._handleOnDidSashChange()));
            if (this._shouldShowTabs()) {
                this._addTabTree();
            }
            this._splitView.addView({
                element: this._terminalContainer,
                layout: width => this._terminalService.terminalTabs.forEach(tab => tab.layout(width, this._height || 0)),
                minimumSize: 120,
                maximumSize: Number.POSITIVE_INFINITY,
                onDidChange: () => lifecycle_1.Disposable.None,
                priority: 2 /* High */
            }, splitview_1.Sizing.Distribute, this._terminalContainerIndex);
            if (this._shouldShowTabs()) {
                this._addSashListener();
            }
        }
        _addTabTree() {
            this._splitView.addView({
                element: this._tabTreeContainer,
                layout: width => this._tabsWidget.layout(this._height || 0, width),
                minimumSize: terminalTabsWidget_1.MIN_TABS_WIDGET_WIDTH,
                maximumSize: MAX_TABS_WIDGET_WIDTH,
                onDidChange: () => lifecycle_1.Disposable.None,
                priority: 1 /* Low */
            }, splitview_1.Sizing.Distribute, this._tabTreeIndex);
            this._rerenderTabs();
        }
        _rerenderTabs() {
            const hasText = this._tabTreeContainer.clientWidth > terminalTabsWidget_1.MIDPOINT_WIDGET_WIDTH;
            this._tabTreeContainer.classList.toggle('has-text', hasText);
            this._terminalIsTabsNarrowContextKey.set(!hasText);
            for (const instance of this._terminalService.terminalInstances) {
                try {
                    this._tabsWidget.rerender(instance);
                }
                catch (e) {
                    this._logService.warn('Exception when rerendering new tab widget', e);
                }
            }
        }
        _addSashListener() {
            let interval;
            this._sashDisposables = [
                this._splitView.sashes[0].onDidStart(e => {
                    interval = window.setInterval(() => {
                        this._rerenderTabs();
                    }, 100);
                }),
                this._splitView.sashes[0].onDidEnd(e => {
                    window.clearInterval(interval);
                    interval = 0;
                })
            ];
        }
        _removeSashListener() {
            if (this._sashDisposables) {
                (0, lifecycle_1.dispose)(this._sashDisposables);
                this._sashDisposables = undefined;
            }
        }
        layout(width, height) {
            this._height = height;
            this._width = width;
            this._splitView.layout(width);
            if (this._shouldShowTabs()) {
                this._splitView.resizeView(this._tabTreeIndex, this._getLastWidgetWidth());
            }
            this._rerenderTabs();
        }
        _updateTheme(theme) {
            var _a;
            if (!theme) {
                theme = this._themeService.getColorTheme();
            }
            (_a = this._findWidget) === null || _a === void 0 ? void 0 : _a.updateTheme(theme);
        }
        _attachEventListeners(parentDomElement, terminalContainer) {
            this._register(dom.addDisposableListener(terminalContainer, 'mousedown', async (event) => {
                if (this._terminalService.terminalInstances.length === 0) {
                    return;
                }
                if (event.which === 2 && platform_1.isLinux) {
                    // Drop selection and focus terminal on Linux to enable middle button paste when click
                    // occurs on the selection itself.
                    const terminal = this._terminalService.getActiveInstance();
                    if (terminal) {
                        terminal.focus();
                    }
                }
                else if (event.which === 3) {
                    const rightClickBehavior = this._terminalService.configHelper.config.rightClickBehavior;
                    if (rightClickBehavior === 'copyPaste' || rightClickBehavior === 'paste') {
                        const terminal = this._terminalService.getActiveInstance();
                        if (!terminal) {
                            return;
                        }
                        // copyPaste: Shift+right click should open context menu
                        if (rightClickBehavior === 'copyPaste' && event.shiftKey) {
                            this._openContextMenu(event, parentDomElement);
                            return;
                        }
                        if (rightClickBehavior === 'copyPaste' && terminal.hasSelection()) {
                            await terminal.copySelection();
                            terminal.clearSelection();
                        }
                        else {
                            if (canIUse_1.BrowserFeatures.clipboard.readText) {
                                terminal.paste();
                            }
                            else {
                                this._notificationService.info(`This browser doesn't support the clipboard.readText API needed to trigger a paste, try ${platform_1.isMacintosh ? '⌘' : 'Ctrl'}+V instead.`);
                            }
                        }
                        // Clear selection after all click event bubbling is finished on Mac to prevent
                        // right-click selecting a word which is seemed cannot be disabled. There is a
                        // flicker when pasting but this appears to give the best experience if the
                        // setting is enabled.
                        if (platform_1.isMacintosh) {
                            setTimeout(() => {
                                terminal.clearSelection();
                            }, 0);
                        }
                        this._cancelContextMenu = true;
                    }
                }
            }));
            this._register(dom.addDisposableListener(this._terminalContainer, 'contextmenu', (event) => {
                if (!this._cancelContextMenu) {
                    this._openContextMenu(event, this._terminalContainer);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                this._cancelContextMenu = false;
            }));
            this._register(dom.addDisposableListener(this._tabTreeContainer, 'contextmenu', (event) => {
                if (!this._cancelContextMenu) {
                    this._openContextMenu(event, this._tabTreeContainer);
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                this._cancelContextMenu = false;
            }));
            this._register(dom.addDisposableListener(document, 'keydown', (event) => {
                terminalContainer.classList.toggle('alt-active', !!event.altKey);
            }));
            this._register(dom.addDisposableListener(document, 'keyup', (event) => {
                terminalContainer.classList.toggle('alt-active', !!event.altKey);
            }));
            this._register(dom.addDisposableListener(parentDomElement, 'keyup', (event) => {
                if (event.keyCode === 27) {
                    // Keep terminal open on escape
                    event.stopPropagation();
                }
            }));
            this._register(dom.addDisposableListener(this._tabTreeContainer, dom.EventType.FOCUS_IN, () => {
                this._terminalTabsFocusContextKey.set(true);
            }));
            this._register(dom.addDisposableListener(this._tabTreeContainer, dom.EventType.FOCUS_OUT, () => {
                this._terminalTabsFocusContextKey.set(false);
            }));
            this._register(dom.addDisposableListener(parentDomElement, dom.EventType.DROP, async (e) => {
                if (e.target === this._parentElement || dom.isAncestor(e.target, parentDomElement)) {
                    if (!e.dataTransfer) {
                        return;
                    }
                    // Check if files were dragged from the tree explorer
                    let path;
                    const resources = e.dataTransfer.getData(dnd_1.DataTransfers.RESOURCES);
                    if (resources) {
                        path = uri_1.URI.parse(JSON.parse(resources)[0]).fsPath;
                    }
                    else if (e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].path /* Electron only */) {
                        // Check if the file was dragged from the filesystem
                        path = uri_1.URI.file(e.dataTransfer.files[0].path).fsPath;
                    }
                    if (!path) {
                        return;
                    }
                    const terminal = this._terminalService.getActiveInstance();
                    if (terminal) {
                        const preparedPath = await this._terminalService.preparePathForTerminalAsync(path, terminal.shellLaunchConfig.executable, terminal.title, terminal.shellType);
                        terminal.sendText(preparedPath, false);
                        terminal.focus();
                    }
                }
            }));
        }
        _openContextMenu(event, parent) {
            const standardEvent = new mouseEvent_1.StandardMouseEvent(event);
            const anchor = { x: standardEvent.posx, y: standardEvent.posy };
            const actions = [];
            let menu;
            if (parent === this._terminalContainer) {
                menu = this._instanceMenu;
            }
            else {
                menu = this._tabsWidget.getFocus().length === 0 ? this._tabsWidgetEmptyMenu : this._tabsWidgetMenu;
            }
            const actionsDisposable = (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, actions);
            // TODO: Convert to command?
            if (menu === this._tabsWidgetEmptyMenu) {
                actions.push(...this._getTabActions());
            }
            this._contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                getActions: () => actions,
                getActionsContext: () => this._parentElement,
                onHide: () => actionsDisposable.dispose()
            });
        }
        _getTabActions() {
            return [
                new actions_1.Separator(),
                this._configurationService.inspect('terminal.integrated.tabs.location').userValue === 'left' ?
                    new actions_1.Action('moveRight', (0, nls_1.localize)(0, null), undefined, undefined, async () => {
                        this._configurationService.updateValue('terminal.integrated.tabs.location', 'right');
                    }) :
                    new actions_1.Action('moveLeft', (0, nls_1.localize)(1, null), undefined, undefined, async () => {
                        this._configurationService.updateValue('terminal.integrated.tabs.location', 'left');
                    }),
                new actions_1.Action('hideTabs', (0, nls_1.localize)(2, null), undefined, undefined, async () => {
                    this._configurationService.updateValue('terminal.integrated.tabs.enabled', false);
                })
            ];
        }
        focusTabs() {
            this._terminalTabsFocusContextKey.set(true);
            const selected = this._tabsWidget.getSelection();
            this._tabsWidget.domFocus();
            if (selected) {
                this._tabsWidget.setFocus(selected);
            }
        }
        focusFindWidget() {
            this._findWidgetVisible.set(true);
            const activeInstance = this._terminalService.getActiveInstance();
            if (activeInstance && activeInstance.hasSelection() && activeInstance.selection.indexOf('\n') === -1) {
                this._findWidget.reveal(activeInstance.selection);
            }
            else {
                this._findWidget.reveal();
            }
        }
        hideFindWidget() {
            this._findWidgetVisible.reset();
            this.focus();
            this._findWidget.hide();
        }
        showFindWidget() {
            const activeInstance = this._terminalService.getActiveInstance();
            if (activeInstance && activeInstance.hasSelection() && activeInstance.selection.indexOf('\n') === -1) {
                this._findWidget.show(activeInstance.selection);
            }
            else {
                this._findWidget.show();
            }
        }
        getFindWidget() {
            return this._findWidget;
        }
        focus() {
            if (this._terminalService.connectionState === 0 /* Connecting */) {
                // If the terminal is waiting to reconnect to remote terminals, then there is no TerminalInstance yet that can
                // be focused. So wait for connection to finish, then focus.
                const activeElement = document.activeElement;
                this._register(this._terminalService.onDidChangeConnectionState(() => {
                    // Only focus the terminal if the activeElement has not changed since focus() was called
                    // TODO hack
                    if (document.activeElement === activeElement) {
                        this._focus();
                    }
                }));
                return;
            }
            this._focus();
        }
        _focus() {
            var _a;
            (_a = this._terminalService.getActiveInstance()) === null || _a === void 0 ? void 0 : _a.focusWhenReady();
        }
    };
    TerminalTabbedView = __decorate([
        __param(1, terminal_1.ITerminalService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, notification_1.INotificationService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, themeService_1.IThemeService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, actions_2.IMenuService),
        __param(8, storage_1.IStorageService),
        __param(9, log_1.ILogService),
        __param(10, contextkey_1.IContextKeyService)
    ], TerminalTabbedView);
    exports.TerminalTabbedView = TerminalTabbedView;
});
//# sourceMappingURL=terminalTabbedView.js.map