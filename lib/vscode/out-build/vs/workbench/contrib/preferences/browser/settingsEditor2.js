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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/collections", "vs/base/common/date", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/preferences/browser/settingsEditor2", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/workbench/contrib/preferences/browser/tocTree", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/common/preferencesModels", "vs/workbench/services/userDataSync/common/userDataSync", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/base/browser/browser", "vs/css!./media/settingsEditor2"], function (require, exports, DOM, aria, keyboardEvent_1, actionbar_1, button_1, actions_1, async_1, cancellation_1, collections, date_1, errors_1, event_1, iterator_1, lifecycle_1, platform, types_1, uri_1, nls_1, commands_1, contextkey_1, instantiation_1, log_1, notification_1, storage_1, telemetry_1, colorRegistry_1, styler_1, themeService_1, userDataSync_1, editorPane_1, suggestEnabledInput_1, preferencesWidgets_1, settingsLayout_1, settingsTree_1, settingsTreeModels_1, settingsWidgets_1, tocTree_1, preferences_1, editorGroupsService_1, preferences_2, preferencesModels_1, userDataSync_2, preferencesIcons_1, workspaceTrust_1, configuration_1, browser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsEditor2 = exports.createGroupIterator = exports.SettingsFocusContext = void 0;
    var SettingsFocusContext;
    (function (SettingsFocusContext) {
        SettingsFocusContext[SettingsFocusContext["Search"] = 0] = "Search";
        SettingsFocusContext[SettingsFocusContext["TableOfContents"] = 1] = "TableOfContents";
        SettingsFocusContext[SettingsFocusContext["SettingTree"] = 2] = "SettingTree";
        SettingsFocusContext[SettingsFocusContext["SettingControl"] = 3] = "SettingControl";
    })(SettingsFocusContext = exports.SettingsFocusContext || (exports.SettingsFocusContext = {}));
    function createGroupIterator(group) {
        return iterator_1.Iterable.map(group.children, g => {
            return {
                element: g,
                children: g instanceof settingsTreeModels_1.SettingsTreeGroupElement ?
                    createGroupIterator(g) :
                    undefined
            };
        });
    }
    exports.createGroupIterator = createGroupIterator;
    const $ = DOM.$;
    const searchBoxLabel = (0, nls_1.localize)(0, null);
    const SETTINGS_AUTOSAVE_NOTIFIED_KEY = 'hasNotifiedOfSettingsAutosave';
    const SETTINGS_EDITOR_STATE_KEY = 'settingsEditorState';
    let SettingsEditor2 = class SettingsEditor2 extends editorPane_1.EditorPane {
        constructor(telemetryService, configurationService, themeService, preferencesService, instantiationService, preferencesSearchService, logService, contextKeyService, storageService, notificationService, editorGroupService, userDataSyncWorkbenchService, userDataAutoSyncEnablementService, workspaceTrustManagementService) {
            super(SettingsEditor2.ID, telemetryService, themeService, storageService);
            this.configurationService = configurationService;
            this.preferencesService = preferencesService;
            this.instantiationService = instantiationService;
            this.preferencesSearchService = preferencesSearchService;
            this.logService = logService;
            this.storageService = storageService;
            this.notificationService = notificationService;
            this.editorGroupService = editorGroupService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.searchInProgress = null;
            this.pendingSettingUpdate = null;
            this._searchResultModel = null;
            this.searchResultLabel = null;
            this.lastSyncedLabel = null;
            this._currentFocusContext = 0 /* Search */;
            /** Don't spam warnings */
            this.hasWarnedMissingSettings = false;
            this.tocFocusedElement = null;
            this.treeFocusedElement = null;
            this.settingsTreeScrollTop = 0;
            this.delayedFilterLogging = new async_1.Delayer(1000);
            this.localSearchDelayer = new async_1.Delayer(300);
            this.remoteSearchThrottle = new async_1.ThrottledDelayer(200);
            this.viewState = { settingsTarget: 2 /* USER_LOCAL */ };
            this.settingFastUpdateDelayer = new async_1.Delayer(SettingsEditor2.SETTING_UPDATE_FAST_DEBOUNCE);
            this.settingSlowUpdateDelayer = new async_1.Delayer(SettingsEditor2.SETTING_UPDATE_SLOW_DEBOUNCE);
            this.updatedConfigSchemaDelayer = new async_1.Delayer(SettingsEditor2.CONFIG_SCHEMA_UPDATE_DELAYER);
            this.inSettingsEditorContextKey = preferences_1.CONTEXT_SETTINGS_EDITOR.bindTo(contextKeyService);
            this.searchFocusContextKey = preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS.bindTo(contextKeyService);
            this.tocRowFocused = preferences_1.CONTEXT_TOC_ROW_FOCUS.bindTo(contextKeyService);
            this.settingRowFocused = preferences_1.CONTEXT_SETTINGS_ROW_FOCUS.bindTo(contextKeyService);
            this.scheduledRefreshes = new Map();
            this.editorMemento = this.getEditorMemento(editorGroupService, SETTINGS_EDITOR_STATE_KEY);
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.source !== 6 /* DEFAULT */) {
                    this.onConfigUpdate(e.affectedKeys);
                }
            }));
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => {
                if (this.searchResultModel) {
                    this.searchResultModel.updateWorkspaceTrust(workspaceTrustManagementService.isWorkpaceTrusted());
                }
                if (this.settingsTreeModel) {
                    this.settingsTreeModel.updateWorkspaceTrust(workspaceTrustManagementService.isWorkpaceTrusted());
                }
                this.renderTree();
            }));
            this._register(configurationService.onDidChangeRestrictedSettings(e => {
                if (e.default.length) {
                    this.updateElementsByKey([...e.default]);
                }
            }));
            this.modelDisposables = this._register(new lifecycle_1.DisposableStore());
        }
        static shouldSettingUpdateFast(type) {
            if ((0, types_1.isArray)(type)) {
                // nullable integer/number or complex
                return false;
            }
            return type === preferences_2.SettingValueType.Enum ||
                type === preferences_2.SettingValueType.ArrayOfString ||
                type === preferences_2.SettingValueType.Complex ||
                type === preferences_2.SettingValueType.Boolean ||
                type === preferences_2.SettingValueType.Exclude;
        }
        get minimumWidth() { return 375; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        get currentSettingsModel() {
            return this.searchResultModel || this.settingsTreeModel;
        }
        get searchResultModel() {
            return this._searchResultModel;
        }
        set searchResultModel(value) {
            this._searchResultModel = value;
            this.rootElement.classList.toggle('search-mode', !!this._searchResultModel);
        }
        get focusedSettingDOMElement() {
            const focused = this.settingsTree.getFocus()[0];
            if (!(focused instanceof settingsTreeModels_1.SettingsTreeSettingElement)) {
                return;
            }
            return this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), focused.setting.key)[0];
        }
        get currentFocusContext() {
            return this._currentFocusContext;
        }
        createEditor(parent) {
            parent.setAttribute('tabindex', '-1');
            this.rootElement = DOM.append(parent, $('.settings-editor', { tabindex: '-1' }));
            this.createHeader(this.rootElement);
            this.createBody(this.rootElement);
            this.addCtrlAInterceptor(this.rootElement);
            this.updateStyles();
        }
        async setInput(input, options, context, token) {
            this.inSettingsEditorContextKey.set(true);
            await super.setInput(input, options, context, token);
            await (0, async_1.timeout)(0); // Force setInput to be async
            if (!this.input) {
                return;
            }
            const model = await this.input.resolve();
            if (token.isCancellationRequested || !(model instanceof preferencesModels_1.Settings2EditorModel)) {
                return;
            }
            this.modelDisposables.clear();
            this.modelDisposables.add(model.onDidChangeGroups(() => {
                this.updatedConfigSchemaDelayer.trigger(() => {
                    this.onConfigUpdate(undefined, undefined, true);
                });
            }));
            this.defaultSettingsEditorModel = model;
            options = options || preferences_2.SettingsEditorOptions.create({});
            if (!this.viewState.settingsTarget) {
                if (!options.target) {
                    options.target = 2 /* USER_LOCAL */;
                }
            }
            this._setOptions(options);
            // Don't block setInput on render (which can trigger an async search)
            this.onConfigUpdate(undefined, true).then(() => {
                this._register(input.onWillDispose(() => {
                    this.searchWidget.setValue('');
                }));
                // Init TOC selection
                this.updateTreeScrollSync();
            });
        }
        restoreCachedState() {
            const cachedState = this.group && this.input && this.editorMemento.loadEditorState(this.group, this.input);
            if (cachedState && typeof cachedState.target === 'object') {
                cachedState.target = uri_1.URI.revive(cachedState.target);
            }
            if (cachedState) {
                const settingsTarget = cachedState.target;
                this.settingsTargetsWidget.settingsTarget = settingsTarget;
                this.viewState.settingsTarget = settingsTarget;
                this.searchWidget.setValue(cachedState.searchQuery);
            }
            if (this.input) {
                this.editorMemento.clearEditorState(this.input, this.group);
            }
            return (0, types_1.withUndefinedAsNull)(cachedState);
        }
        setOptions(options) {
            super.setOptions(options);
            if (options) {
                this._setOptions(options);
            }
        }
        _setOptions(options) {
            if (options.focusSearch && !browser_1.isIPad) {
                // isIPad - #122044
                this.focusSearch();
            }
            if (options.query) {
                this.searchWidget.setValue(options.query);
            }
            const target = options.folderUri || options.target;
            if (target) {
                this.settingsTargetsWidget.settingsTarget = target;
                this.viewState.settingsTarget = target;
            }
        }
        clearInput() {
            this.inSettingsEditorContextKey.set(false);
            super.clearInput();
        }
        layout(dimension) {
            this.dimension = dimension;
            if (!this.isVisible()) {
                return;
            }
            this.layoutTrees(dimension);
            const innerWidth = Math.min(1000, dimension.width) - 24 * 2; // 24px padding on left and right;
            // minus padding inside inputbox, countElement width, controls width, extra padding before countElement
            const monacoWidth = innerWidth - 10 - this.countElement.clientWidth - this.controlsElement.clientWidth - 12;
            this.searchWidget.layout(new DOM.Dimension(monacoWidth, 20));
            this.rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this.rootElement.classList.toggle('narrow-width', dimension.width < 600);
        }
        focus() {
            if (this._currentFocusContext === 0 /* Search */) {
                if (!browser_1.isIPad) {
                    // #122044
                    this.focusSearch();
                }
            }
            else if (this._currentFocusContext === 3 /* SettingControl */) {
                const element = this.focusedSettingDOMElement;
                if (element) {
                    const control = element.querySelector(settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR);
                    if (control) {
                        control.focus();
                        return;
                    }
                }
            }
            else if (this._currentFocusContext === 2 /* SettingTree */) {
                this.settingsTree.domFocus();
            }
            else if (this._currentFocusContext === 1 /* TableOfContents */) {
                this.tocTree.domFocus();
            }
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (!visible) {
                // Wait for editor to be removed from DOM #106303
                setTimeout(() => {
                    this.searchWidget.onHide();
                }, 0);
            }
        }
        focusSettings(focusSettingInput = false) {
            const focused = this.settingsTree.getFocus();
            if (!focused.length) {
                this.settingsTree.focusFirst();
            }
            this.settingsTree.domFocus();
            if (focusSettingInput) {
                const controlInFocusedRow = this.settingsTree.getHTMLElement().querySelector(`.focused ${settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR}`);
                if (controlInFocusedRow) {
                    controlInFocusedRow.focus();
                }
            }
        }
        focusTOC() {
            this.tocTree.domFocus();
        }
        showContextMenu() {
            const focused = this.settingsTree.getFocus()[0];
            const rowElement = this.focusedSettingDOMElement;
            if (rowElement && focused instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                this.settingRenderers.showContextMenu(focused, rowElement);
            }
        }
        focusSearch(filter, selectAll = true) {
            if (filter && this.searchWidget) {
                this.searchWidget.setValue(filter);
            }
            this.searchWidget.focus(selectAll);
        }
        clearSearchResults() {
            this.searchWidget.setValue('');
            this.focusSearch();
        }
        clearSearchFilters() {
            let query = this.searchWidget.getValue();
            SettingsEditor2.SUGGESTIONS.forEach(suggestion => {
                query = query.replace(suggestion, '');
            });
            this.searchWidget.setValue(query.trim());
        }
        updateInputAriaLabel() {
            let label = searchBoxLabel;
            if (this.searchResultLabel) {
                label += `. ${this.searchResultLabel}`;
            }
            if (this.lastSyncedLabel) {
                label += `. ${this.lastSyncedLabel}`;
            }
            this.searchWidget.updateAriaLabel(label);
        }
        createHeader(parent) {
            this.headerContainer = DOM.append(parent, $('.settings-header'));
            const searchContainer = DOM.append(this.headerContainer, $('.search-container'));
            const clearInputAction = new actions_1.Action(preferences_1.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, (0, nls_1.localize)(1, null), themeService_1.ThemeIcon.asClassName(preferencesIcons_1.preferencesClearInputIcon), false, async () => this.clearSearchResults());
            this.searchWidget = this._register(this.instantiationService.createInstance(suggestEnabledInput_1.SuggestEnabledInput, `${SettingsEditor2.ID}.searchbox`, searchContainer, {
                triggerCharacters: ['@'],
                provideResults: (query) => {
                    return SettingsEditor2.SUGGESTIONS.filter(tag => query.indexOf(tag) === -1).map(tag => tag.endsWith(':') ? tag : tag + ' ');
                }
            }, searchBoxLabel, 'settingseditor:searchinput' + SettingsEditor2.NUM_INSTANCES++, {
                placeholderText: searchBoxLabel,
                focusContextKey: this.searchFocusContextKey,
                // TODO: Aria-live
            }));
            this._register(this.searchWidget.onFocus(() => {
                this._currentFocusContext = 0 /* Search */;
            }));
            this._register((0, suggestEnabledInput_1.attachSuggestEnabledInputBoxStyler)(this.searchWidget, this.themeService, {
                inputBorder: settingsWidgets_1.settingsTextInputBorder
            }));
            this.countElement = DOM.append(searchContainer, DOM.$('.settings-count-widget.monaco-count-badge.long'));
            this._register((0, styler_1.attachStylerCallback)(this.themeService, { badgeBackground: colorRegistry_1.badgeBackground, contrastBorder: colorRegistry_1.contrastBorder, badgeForeground: colorRegistry_1.badgeForeground }, colors => {
                const background = colors.badgeBackground ? colors.badgeBackground.toString() : '';
                const border = colors.contrastBorder ? colors.contrastBorder.toString() : '';
                const foreground = colors.badgeForeground ? colors.badgeForeground.toString() : '';
                this.countElement.style.backgroundColor = background;
                this.countElement.style.color = foreground;
                this.countElement.style.borderWidth = border ? '1px' : '';
                this.countElement.style.borderStyle = border ? 'solid' : '';
                this.countElement.style.borderColor = border;
            }));
            this._register(this.searchWidget.onInputDidChange(() => {
                const searchVal = this.searchWidget.getValue();
                clearInputAction.enabled = !!searchVal;
                this.onSearchInputChanged();
            }));
            const headerControlsContainer = DOM.append(this.headerContainer, $('.settings-header-controls'));
            const targetWidgetContainer = DOM.append(headerControlsContainer, $('.settings-target-container'));
            this.settingsTargetsWidget = this._register(this.instantiationService.createInstance(preferencesWidgets_1.SettingsTargetsWidget, targetWidgetContainer, { enableRemoteSettings: true }));
            this.settingsTargetsWidget.settingsTarget = 2 /* USER_LOCAL */;
            this.settingsTargetsWidget.onDidTargetChange(target => this.onDidSettingsTargetChange(target));
            this._register(DOM.addDisposableListener(targetWidgetContainer, DOM.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.keyCode === 18 /* DownArrow */) {
                    this.focusSettings();
                }
            }));
            if (this.userDataSyncWorkbenchService.enabled && this.userDataAutoSyncEnablementService.canToggleEnablement()) {
                const syncControls = this._register(this.instantiationService.createInstance(SyncControls, headerControlsContainer));
                this._register(syncControls.onDidChangeLastSyncedLabel(lastSyncedLabel => {
                    this.lastSyncedLabel = lastSyncedLabel;
                    this.updateInputAriaLabel();
                }));
            }
            this.controlsElement = DOM.append(searchContainer, DOM.$('.settings-clear-widget'));
            const actionBar = this._register(new actionbar_1.ActionBar(this.controlsElement, {
                animated: false,
                actionViewItemProvider: (_action) => { return undefined; }
            }));
            actionBar.push([clearInputAction], { label: false, icon: true });
        }
        onDidSettingsTargetChange(target) {
            this.viewState.settingsTarget = target;
            // TODO Instead of rebuilding the whole model, refresh and uncache the inspected setting value
            this.onConfigUpdate(undefined, true);
        }
        onDidClickSetting(evt, recursed) {
            const elements = this.currentSettingsModel.getElementsByName(evt.targetKey);
            if (elements && elements[0]) {
                let sourceTop = 0.5;
                try {
                    const _sourceTop = this.settingsTree.getRelativeTop(evt.source);
                    if (_sourceTop !== null) {
                        sourceTop = _sourceTop;
                    }
                }
                catch (_a) {
                    // e.g. clicked a searched element, now the search has been cleared
                }
                this.settingsTree.reveal(elements[0], sourceTop);
                // We need to shift focus from the setting that contains the link to the setting that's
                //  linked. Clicking on the link sets focus on the setting that contains the link,
                //  which is why we need the setTimeout
                setTimeout(() => this.settingsTree.setFocus([elements[0]]), 50);
                const domElements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), evt.targetKey);
                if (domElements && domElements[0]) {
                    const control = domElements[0].querySelector(settingsTree_1.AbstractSettingRenderer.CONTROL_SELECTOR);
                    if (control) {
                        control.focus();
                    }
                }
            }
            else if (!recursed) {
                const p = this.triggerSearch('');
                p.then(() => {
                    this.searchWidget.setValue('');
                    this.onDidClickSetting(evt, true);
                });
            }
        }
        switchToSettingsFile() {
            const query = (0, settingsTreeModels_1.parseQuery)(this.searchWidget.getValue()).query;
            return this.openSettingsFile({ query });
        }
        async openSettingsFile(options) {
            const currentSettingsTarget = this.settingsTargetsWidget.settingsTarget;
            if (currentSettingsTarget === 2 /* USER_LOCAL */) {
                return this.preferencesService.openGlobalSettings(true, options);
            }
            else if (currentSettingsTarget === 3 /* USER_REMOTE */) {
                return this.preferencesService.openRemoteSettings();
            }
            else if (currentSettingsTarget === 4 /* WORKSPACE */) {
                return this.preferencesService.openWorkspaceSettings(true, options);
            }
            else if (uri_1.URI.isUri(currentSettingsTarget)) {
                return this.preferencesService.openFolderSettings(currentSettingsTarget, true, options);
            }
            return undefined;
        }
        createBody(parent) {
            const bodyContainer = DOM.append(parent, $('.settings-body'));
            this.noResultsMessage = DOM.append(bodyContainer, $('.no-results-message'));
            this.noResultsMessage.innerText = (0, nls_1.localize)(2, null);
            this.clearFilterLinkContainer = $('span.clear-search-filters');
            this.clearFilterLinkContainer.textContent = ' - ';
            const clearFilterLink = DOM.append(this.clearFilterLinkContainer, $('a.pointer.prominent', { tabindex: 0 }, (0, nls_1.localize)(3, null)));
            this._register(DOM.addDisposableListener(clearFilterLink, DOM.EventType.CLICK, (e) => {
                DOM.EventHelper.stop(e, false);
                this.clearSearchFilters();
            }));
            DOM.append(this.noResultsMessage, this.clearFilterLinkContainer);
            this._register((0, styler_1.attachStylerCallback)(this.themeService, { editorForeground: colorRegistry_1.editorForeground }, colors => {
                this.noResultsMessage.style.color = colors.editorForeground ? colors.editorForeground.toString() : '';
            }));
            this.createTOC(bodyContainer);
            this.createSettingsTree(bodyContainer);
        }
        addCtrlAInterceptor(container) {
            this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, (e) => {
                if (e.keyCode === 31 /* KEY_A */ &&
                    (platform.isMacintosh ? e.metaKey : e.ctrlKey) &&
                    e.target.tagName !== 'TEXTAREA' &&
                    e.target.tagName !== 'INPUT') {
                    // Avoid browser ctrl+a
                    e.browserEvent.stopPropagation();
                    e.browserEvent.preventDefault();
                }
            }));
        }
        createTOC(parent) {
            this.tocTreeModel = this.instantiationService.createInstance(tocTree_1.TOCTreeModel, this.viewState);
            this.tocTreeContainer = DOM.append(parent, $('.settings-toc-container'));
            this.tocTree = this._register(this.instantiationService.createInstance(tocTree_1.TOCTree, DOM.append(this.tocTreeContainer, $('.settings-toc-wrapper', {
                'role': 'navigation',
                'aria-label': (0, nls_1.localize)(4, null),
            })), this.viewState));
            this._register(this.tocTree.onDidFocus(() => {
                this._currentFocusContext = 1 /* TableOfContents */;
            }));
            this._register(this.tocTree.onDidChangeFocus(e => {
                const element = e.elements[0];
                if (this.tocFocusedElement === element) {
                    return;
                }
                this.tocFocusedElement = element;
                this.tocTree.setSelection(element ? [element] : []);
                if (this.searchResultModel) {
                    if (this.viewState.filterToCategory !== element) {
                        this.viewState.filterToCategory = (0, types_1.withNullAsUndefined)(element);
                        this.renderTree();
                        this.settingsTree.scrollTop = 0;
                    }
                }
                else if (element && (!e.browserEvent || !e.browserEvent.fromScroll)) {
                    this.settingsTree.reveal(element, 0);
                    this.settingsTree.setFocus([element]);
                }
            }));
            this._register(this.tocTree.onDidFocus(() => {
                this.tocRowFocused.set(true);
            }));
            this._register(this.tocTree.onDidBlur(() => {
                this.tocRowFocused.set(false);
            }));
        }
        createSettingsTree(parent) {
            this.settingsTreeContainer = DOM.append(parent, $('.settings-tree-container'));
            this.settingRenderers = this.instantiationService.createInstance(settingsTree_1.SettingTreeRenderers);
            this._register(this.settingRenderers.onDidChangeSetting(e => this.onDidChangeSetting(e.key, e.value, e.type)));
            this._register(this.settingRenderers.onDidOpenSettings(settingKey => {
                this.openSettingsFile({ revealSetting: { key: settingKey, edit: true } });
            }));
            this._register(this.settingRenderers.onDidClickSettingLink(settingName => this.onDidClickSetting(settingName)));
            this._register(this.settingRenderers.onDidFocusSetting(element => {
                this.settingsTree.setFocus([element]);
                this._currentFocusContext = 3 /* SettingControl */;
                this.settingRowFocused.set(false);
            }));
            this._register(this.settingRenderers.onDidClickOverrideElement((element) => {
                if (element.scope.toLowerCase() === 'workspace') {
                    this.settingsTargetsWidget.updateTarget(4 /* WORKSPACE */);
                }
                else if (element.scope.toLowerCase() === 'user') {
                    this.settingsTargetsWidget.updateTarget(2 /* USER_LOCAL */);
                }
                else if (element.scope.toLowerCase() === 'remote') {
                    this.settingsTargetsWidget.updateTarget(3 /* USER_REMOTE */);
                }
                this.searchWidget.setValue(element.targetKey);
            }));
            this.settingsTree = this._register(this.instantiationService.createInstance(settingsTree_1.SettingsTree, this.settingsTreeContainer, this.viewState, this.settingRenderers.allRenderers));
            this._register(this.settingsTree.onDidScroll(() => {
                if (this.settingsTree.scrollTop === this.settingsTreeScrollTop) {
                    return;
                }
                this.settingsTreeScrollTop = this.settingsTree.scrollTop;
                // setTimeout because calling setChildren on the settingsTree can trigger onDidScroll, so it fires when
                // setChildren has called on the settings tree but not the toc tree yet, so their rendered elements are out of sync
                setTimeout(() => {
                    this.updateTreeScrollSync();
                }, 0);
            }));
            this._register(this.settingsTree.onDidFocus(() => {
                var _a;
                if ((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.classList.contains('monaco-list')) {
                    this._currentFocusContext = 2 /* SettingTree */;
                    this.settingRowFocused.set(true);
                }
            }));
            this._register(this.settingsTree.onDidBlur(() => {
                this.settingRowFocused.set(false);
            }));
            // There is no different select state in the settings tree
            this._register(this.settingsTree.onDidChangeFocus(e => {
                const element = e.elements[0];
                if (this.treeFocusedElement === element) {
                    return;
                }
                if (this.treeFocusedElement) {
                    this.treeFocusedElement.tabbable = false;
                }
                this.treeFocusedElement = element;
                if (this.treeFocusedElement) {
                    this.treeFocusedElement.tabbable = true;
                }
                this.settingsTree.setSelection(element ? [element] : []);
            }));
        }
        notifyNoSaveNeeded() {
            if (!this.storageService.getBoolean(SETTINGS_AUTOSAVE_NOTIFIED_KEY, 0 /* GLOBAL */, false)) {
                this.storageService.store(SETTINGS_AUTOSAVE_NOTIFIED_KEY, true, 0 /* GLOBAL */, 0 /* USER */);
                this.notificationService.info((0, nls_1.localize)(5, null));
            }
        }
        onDidChangeSetting(key, value, type) {
            this.notifyNoSaveNeeded();
            if (this.pendingSettingUpdate && this.pendingSettingUpdate.key !== key) {
                this.updateChangedSetting(key, value);
            }
            this.pendingSettingUpdate = { key, value };
            if (SettingsEditor2.shouldSettingUpdateFast(type)) {
                this.settingFastUpdateDelayer.trigger(() => this.updateChangedSetting(key, value));
            }
            else {
                this.settingSlowUpdateDelayer.trigger(() => this.updateChangedSetting(key, value));
            }
        }
        updateTreeScrollSync() {
            this.settingRenderers.cancelSuggesters();
            if (this.searchResultModel) {
                return;
            }
            if (!this.tocTreeModel) {
                return;
            }
            const elementToSync = this.settingsTree.firstVisibleElement;
            const element = elementToSync instanceof settingsTreeModels_1.SettingsTreeSettingElement ? elementToSync.parent :
                elementToSync instanceof settingsTreeModels_1.SettingsTreeGroupElement ? elementToSync :
                    null;
            // It's possible for this to be called when the TOC and settings tree are out of sync - e.g. when the settings tree has deferred a refresh because
            // it is focused. So, bail if element doesn't exist in the TOC.
            let nodeExists = true;
            try {
                this.tocTree.getNode(element);
            }
            catch (e) {
                nodeExists = false;
            }
            if (!nodeExists) {
                return;
            }
            if (element && this.tocTree.getSelection()[0] !== element) {
                const ancestors = this.getAncestors(element);
                ancestors.forEach(e => this.tocTree.expand(e));
                this.tocTree.reveal(element);
                const elementTop = this.tocTree.getRelativeTop(element);
                if (typeof elementTop !== 'number') {
                    return;
                }
                this.tocTree.collapseAll();
                ancestors.forEach(e => this.tocTree.expand(e));
                if (elementTop < 0 || elementTop > 1) {
                    this.tocTree.reveal(element);
                }
                else {
                    this.tocTree.reveal(element, elementTop);
                }
                this.tocTree.expand(element);
                this.tocTree.setSelection([element]);
                const fakeKeyboardEvent = new KeyboardEvent('keydown');
                fakeKeyboardEvent.fromScroll = true;
                this.tocTree.setFocus([element], fakeKeyboardEvent);
            }
        }
        getAncestors(element) {
            const ancestors = [];
            while (element.parent) {
                if (element.parent.id !== 'root') {
                    ancestors.push(element.parent);
                }
                element = element.parent;
            }
            return ancestors.reverse();
        }
        updateChangedSetting(key, value) {
            // ConfigurationService displays the error if this fails.
            // Force a render afterwards because onDidConfigurationUpdate doesn't fire if the update doesn't result in an effective setting value change
            const settingsTarget = this.settingsTargetsWidget.settingsTarget;
            const resource = uri_1.URI.isUri(settingsTarget) ? settingsTarget : undefined;
            const configurationTarget = (resource ? 5 /* WORKSPACE_FOLDER */ : settingsTarget);
            const overrides = { resource };
            const isManualReset = value === undefined;
            // If the user is changing the value back to the default, do a 'reset' instead
            const inspected = this.configurationService.inspect(key, overrides);
            if (inspected.defaultValue === value) {
                value = undefined;
            }
            return this.configurationService.updateValue(key, value, overrides, configurationTarget)
                .then(() => {
                this.renderTree(key, isManualReset);
                const reportModifiedProps = {
                    key,
                    query: this.searchWidget.getValue(),
                    searchResults: this.searchResultModel && this.searchResultModel.getUniqueResults(),
                    rawResults: this.searchResultModel && this.searchResultModel.getRawResults(),
                    showConfiguredOnly: !!this.viewState.tagFilters && this.viewState.tagFilters.has(preferences_1.MODIFIED_SETTING_TAG),
                    isReset: typeof value === 'undefined',
                    settingsTarget: this.settingsTargetsWidget.settingsTarget
                };
                return this.reportModifiedSetting(reportModifiedProps);
            });
        }
        reportModifiedSetting(props) {
            this.pendingSettingUpdate = null;
            let groupId = undefined;
            let nlpIndex = undefined;
            let displayIndex = undefined;
            if (props.searchResults) {
                const remoteResult = props.searchResults[1 /* Remote */];
                const localResult = props.searchResults[0 /* Local */];
                const localIndex = localResult.filterMatches.findIndex(m => m.setting.key === props.key);
                groupId = localIndex >= 0 ?
                    'local' :
                    'remote';
                displayIndex = localIndex >= 0 ?
                    localIndex :
                    remoteResult && (remoteResult.filterMatches.findIndex(m => m.setting.key === props.key) + localResult.filterMatches.length);
                if (this.searchResultModel) {
                    const rawResults = this.searchResultModel.getRawResults();
                    if (rawResults[1 /* Remote */]) {
                        const _nlpIndex = rawResults[1 /* Remote */].filterMatches.findIndex(m => m.setting.key === props.key);
                        nlpIndex = _nlpIndex >= 0 ? _nlpIndex : undefined;
                    }
                }
            }
            const reportedTarget = props.settingsTarget === 2 /* USER_LOCAL */ ? 'user' :
                props.settingsTarget === 3 /* USER_REMOTE */ ? 'user_remote' :
                    props.settingsTarget === 4 /* WORKSPACE */ ? 'workspace' :
                        'folder';
            const data = {
                key: props.key,
                query: props.query,
                groupId,
                nlpIndex,
                displayIndex,
                showConfiguredOnly: props.showConfiguredOnly,
                isReset: props.isReset,
                target: reportedTarget
            };
            /* __GDPR__
                "settingsEditor.settingModified" : {
                    "key" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "query" : { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                    "groupId" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "nlpIndex" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "displayIndex" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "showConfiguredOnly" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "isReset" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "target" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog('settingsEditor.settingModified', data);
        }
        onSearchModeToggled() {
            this.rootElement.classList.remove('no-toc-search');
            if (this.configurationService.getValue('workbench.settings.settingsSearchTocBehavior') === 'hide') {
                this.rootElement.classList.toggle('no-toc-search', !!this.searchResultModel);
            }
        }
        scheduleRefresh(element, key = '') {
            if (key && this.scheduledRefreshes.has(key)) {
                return;
            }
            if (!key) {
                this.scheduledRefreshes.forEach(r => r.dispose());
                this.scheduledRefreshes.clear();
            }
            const scheduledRefreshTracker = DOM.trackFocus(element);
            this.scheduledRefreshes.set(key, scheduledRefreshTracker);
            scheduledRefreshTracker.onDidBlur(() => {
                scheduledRefreshTracker.dispose();
                this.scheduledRefreshes.delete(key);
                this.onConfigUpdate([key]);
            });
        }
        async onConfigUpdate(keys, forceRefresh = false, schemaChange = false) {
            if (keys && this.settingsTreeModel) {
                return this.updateElementsByKey(keys);
            }
            const groups = this.defaultSettingsEditorModel.settingsGroups.slice(1); // Without commonlyUsed
            const dividedGroups = collections.groupBy(groups, g => g.extensionInfo ? 'extension' : 'core');
            const settingsResult = (0, settingsTree_1.resolveSettingsTree)(settingsLayout_1.tocData, dividedGroups.core, this.logService);
            const resolvedSettingsRoot = settingsResult.tree;
            // Warn for settings not included in layout
            if (settingsResult.leftoverSettings.size && !this.hasWarnedMissingSettings) {
                const settingKeyList = [];
                settingsResult.leftoverSettings.forEach(s => {
                    settingKeyList.push(s.key);
                });
                this.logService.warn(`SettingsEditor2: Settings not included in settingsLayout.ts: ${settingKeyList.join(', ')}`);
                this.hasWarnedMissingSettings = true;
            }
            const commonlyUsed = (0, settingsTree_1.resolveSettingsTree)(settingsLayout_1.commonlyUsedData, dividedGroups.core, this.logService);
            resolvedSettingsRoot.children.unshift(commonlyUsed.tree);
            resolvedSettingsRoot.children.push((0, settingsTree_1.resolveExtensionsSettings)(dividedGroups.extension || []));
            if (!this.workspaceTrustManagementService.isWorkpaceTrusted() && (this.viewState.settingsTarget instanceof uri_1.URI || this.viewState.settingsTarget === 4 /* WORKSPACE */)) {
                const configuredUntrustedWorkspaceSettings = (0, settingsTree_1.resolveConfiguredUntrustedSettings)(groups, this.viewState.settingsTarget, this.configurationService);
                if (configuredUntrustedWorkspaceSettings.length) {
                    resolvedSettingsRoot.children.unshift({
                        id: 'workspaceTrust',
                        label: (0, nls_1.localize)(6, null),
                        settings: configuredUntrustedWorkspaceSettings
                    });
                }
            }
            if (this.searchResultModel) {
                this.searchResultModel.updateChildren();
            }
            if (this.settingsTreeModel) {
                this.settingsTreeModel.update(resolvedSettingsRoot);
                if (schemaChange && !!this.searchResultModel) {
                    // If an extension's settings were just loaded and a search is active, retrigger the search so it shows up
                    return await this.onSearchInputChanged();
                }
                this.refreshTOCTree();
                this.renderTree(undefined, forceRefresh);
            }
            else {
                this.settingsTreeModel = this.instantiationService.createInstance(settingsTreeModels_1.SettingsTreeModel, this.viewState, this.workspaceTrustManagementService.isWorkpaceTrusted());
                this.settingsTreeModel.update(resolvedSettingsRoot);
                this.tocTreeModel.settingsTreeRoot = this.settingsTreeModel.root;
                const cachedState = this.restoreCachedState();
                if (cachedState && cachedState.searchQuery) {
                    await this.onSearchInputChanged();
                }
                else {
                    this.refreshTOCTree();
                    this.refreshTree();
                    this.tocTree.collapseAll();
                }
            }
        }
        updateElementsByKey(keys) {
            if (keys.length) {
                if (this.searchResultModel) {
                    keys.forEach(key => this.searchResultModel.updateElementsByName(key));
                }
                if (this.settingsTreeModel) {
                    keys.forEach(key => this.settingsTreeModel.updateElementsByName(key));
                }
                keys.forEach(key => this.renderTree(key));
            }
            else {
                return this.renderTree();
            }
        }
        getActiveControlInSettingsTree() {
            return (document.activeElement && DOM.isAncestor(document.activeElement, this.settingsTree.getHTMLElement())) ?
                document.activeElement :
                null;
        }
        renderTree(key, force = false) {
            if (!force && key && this.scheduledRefreshes.has(key)) {
                this.updateModifiedLabelForKey(key);
                return;
            }
            // If the context view is focused, delay rendering settings
            if (this.contextViewFocused()) {
                const element = document.querySelector('.context-view');
                if (element) {
                    this.scheduleRefresh(element, key);
                }
                return;
            }
            // If a setting control is currently focused, schedule a refresh for later
            const activeElement = this.getActiveControlInSettingsTree();
            const focusedSetting = activeElement && this.settingRenderers.getSettingDOMElementForDOMElement(activeElement);
            if (focusedSetting && !force) {
                // If a single setting is being refreshed, it's ok to refresh now if that is not the focused setting
                if (key) {
                    const focusedKey = focusedSetting.getAttribute(settingsTree_1.AbstractSettingRenderer.SETTING_KEY_ATTR);
                    if (focusedKey === key &&
                        // update `list`s live, as they have a separate "submit edit" step built in before this
                        (focusedSetting.parentElement && !focusedSetting.parentElement.classList.contains('setting-item-list'))) {
                        this.updateModifiedLabelForKey(key);
                        this.scheduleRefresh(focusedSetting, key);
                        return;
                    }
                }
                else {
                    this.scheduleRefresh(focusedSetting);
                    return;
                }
            }
            this.renderResultCountMessages();
            if (key) {
                const elements = this.currentSettingsModel.getElementsByName(key);
                if (elements && elements.length) {
                    // TODO https://github.com/microsoft/vscode/issues/57360
                    this.refreshTree();
                }
                else {
                    // Refresh requested for a key that we don't know about
                    return;
                }
            }
            else {
                this.refreshTree();
            }
            return;
        }
        contextViewFocused() {
            return !!DOM.findParentWithClass(document.activeElement, 'context-view');
        }
        refreshTree() {
            if (this.isVisible()) {
                this.settingsTree.setChildren(null, createGroupIterator(this.currentSettingsModel.root));
            }
        }
        refreshTOCTree() {
            if (this.isVisible()) {
                this.tocTreeModel.update();
                this.tocTree.setChildren(null, (0, tocTree_1.createTOCIterator)(this.tocTreeModel, this.tocTree));
            }
        }
        updateModifiedLabelForKey(key) {
            const dataElements = this.currentSettingsModel.getElementsByName(key);
            const isModified = dataElements && dataElements[0] && dataElements[0].isConfigured; // all elements are either configured or not
            const elements = this.settingRenderers.getDOMElementsForSettingKey(this.settingsTree.getHTMLElement(), key);
            if (elements && elements[0]) {
                elements[0].classList.toggle('is-configured', !!isModified);
            }
        }
        async onSearchInputChanged() {
            const query = this.searchWidget.getValue().trim();
            this.delayedFilterLogging.cancel();
            await this.triggerSearch(query.replace(/›/g, ' '));
            if (query && this.searchResultModel) {
                this.delayedFilterLogging.trigger(() => this.reportFilteringUsed(query, this.searchResultModel.getUniqueResults()));
            }
        }
        parseSettingFromJSON(query) {
            const match = query.match(/"([a-zA-Z.]+)": /);
            return match && match[1];
        }
        triggerSearch(query) {
            this.viewState.tagFilters = new Set();
            this.viewState.extensionFilters = new Set();
            this.viewState.featureFilters = new Set();
            this.viewState.idFilters = new Set();
            if (query) {
                const parsedQuery = (0, settingsTreeModels_1.parseQuery)(query);
                query = parsedQuery.query;
                parsedQuery.tags.forEach(tag => this.viewState.tagFilters.add(tag));
                parsedQuery.extensionFilters.forEach(extensionId => this.viewState.extensionFilters.add(extensionId));
                parsedQuery.featureFilters.forEach(feature => this.viewState.featureFilters.add(feature));
                parsedQuery.idFilters.forEach(id => this.viewState.idFilters.add(id));
            }
            if (query && query !== '@') {
                query = this.parseSettingFromJSON(query) || query;
                return this.triggerFilterPreferences(query);
            }
            else {
                if (this.viewState.tagFilters.size || this.viewState.extensionFilters.size || this.viewState.featureFilters.size || this.viewState.idFilters.size) {
                    this.searchResultModel = this.createFilterModel();
                }
                else {
                    this.searchResultModel = null;
                }
                this.localSearchDelayer.cancel();
                this.remoteSearchThrottle.cancel();
                if (this.searchInProgress) {
                    this.searchInProgress.cancel();
                    this.searchInProgress.dispose();
                    this.searchInProgress = null;
                }
                this.tocTree.setFocus([]);
                this.viewState.filterToCategory = undefined;
                this.tocTreeModel.currentSearchModel = this.searchResultModel;
                this.onSearchModeToggled();
                if (this.searchResultModel) {
                    // Added a filter model
                    this.tocTree.setSelection([]);
                    this.tocTree.expandAll();
                    this.refreshTOCTree();
                    this.renderResultCountMessages();
                    this.refreshTree();
                }
                else {
                    // Leaving search mode
                    this.tocTree.collapseAll();
                    this.refreshTOCTree();
                    this.renderResultCountMessages();
                    this.refreshTree();
                }
            }
            return Promise.resolve();
        }
        /**
         * Return a fake SearchResultModel which can hold a flat list of all settings, to be filtered (@modified etc)
         */
        createFilterModel() {
            const filterModel = this.instantiationService.createInstance(settingsTreeModels_1.SearchResultModel, this.viewState, this.workspaceTrustManagementService.isWorkpaceTrusted());
            const fullResult = {
                filterMatches: []
            };
            for (const g of this.defaultSettingsEditorModel.settingsGroups.slice(1)) {
                for (const sect of g.sections) {
                    for (const setting of sect.settings) {
                        fullResult.filterMatches.push({ setting, matches: [], score: 0 });
                    }
                }
            }
            filterModel.setResult(0, fullResult);
            return filterModel;
        }
        reportFilteringUsed(query, results) {
            const nlpResult = results[1 /* Remote */];
            const nlpMetadata = nlpResult && nlpResult.metadata;
            const durations = {
                nlpResult: nlpMetadata && nlpMetadata.duration
            };
            // Count unique results
            const counts = {};
            const filterResult = results[0 /* Local */];
            if (filterResult) {
                counts['filterResult'] = filterResult.filterMatches.length;
            }
            if (nlpResult) {
                counts['nlpResult'] = nlpResult.filterMatches.length;
            }
            const requestCount = nlpMetadata && nlpMetadata.requestCount;
            const data = {
                query,
                durations,
                counts,
                requestCount
            };
            /* __GDPR__
                "settingsEditor.filter" : {
                    "query": { "classification": "CustomerContent", "purpose": "FeatureInsight" },
                    "durations.nlpResult" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "counts.nlpResult" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "counts.filterResult" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "requestCount" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
                }
            */
            this.telemetryService.publicLog('settingsEditor.filter', data);
        }
        triggerFilterPreferences(query) {
            if (this.searchInProgress) {
                this.searchInProgress.cancel();
                this.searchInProgress = null;
            }
            // Trigger the local search. If it didn't find an exact match, trigger the remote search.
            const searchInProgress = this.searchInProgress = new cancellation_1.CancellationTokenSource();
            return this.localSearchDelayer.trigger(() => {
                if (searchInProgress && !searchInProgress.token.isCancellationRequested) {
                    return this.localFilterPreferences(query).then(result => {
                        if (result && !result.exactMatch) {
                            this.remoteSearchThrottle.trigger(() => {
                                return searchInProgress && !searchInProgress.token.isCancellationRequested ?
                                    this.remoteSearchPreferences(query, this.searchInProgress.token) :
                                    Promise.resolve();
                            });
                        }
                    });
                }
                else {
                    return Promise.resolve();
                }
            });
        }
        localFilterPreferences(query, token) {
            const localSearchProvider = this.preferencesSearchService.getLocalSearchProvider(query);
            return this.filterOrSearchPreferences(query, 0 /* Local */, localSearchProvider, token);
        }
        remoteSearchPreferences(query, token) {
            const remoteSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query);
            const newExtSearchProvider = this.preferencesSearchService.getRemoteSearchProvider(query, true);
            return Promise.all([
                this.filterOrSearchPreferences(query, 1 /* Remote */, remoteSearchProvider, token),
                this.filterOrSearchPreferences(query, 2 /* NewExtensions */, newExtSearchProvider, token)
            ]).then(() => { });
        }
        filterOrSearchPreferences(query, type, searchProvider, token) {
            return this._filterOrSearchPreferencesModel(query, this.defaultSettingsEditorModel, searchProvider, token).then(result => {
                if (token && token.isCancellationRequested) {
                    // Handle cancellation like this because cancellation is lost inside the search provider due to async/await
                    return null;
                }
                if (!this.searchResultModel) {
                    this.searchResultModel = this.instantiationService.createInstance(settingsTreeModels_1.SearchResultModel, this.viewState, this.workspaceTrustManagementService.isWorkpaceTrusted());
                    this.searchResultModel.setResult(type, result);
                    this.tocTreeModel.currentSearchModel = this.searchResultModel;
                    this.onSearchModeToggled();
                }
                else {
                    this.searchResultModel.setResult(type, result);
                    this.tocTreeModel.update();
                }
                if (type === 0 /* Local */) {
                    this.tocTree.setFocus([]);
                    this.viewState.filterToCategory = undefined;
                    this.tocTree.expandAll();
                }
                this.refreshTOCTree();
                this.renderTree(undefined, true);
                return result;
            });
        }
        renderResultCountMessages() {
            if (!this.currentSettingsModel) {
                return;
            }
            this.clearFilterLinkContainer.style.display = this.viewState.tagFilters && this.viewState.tagFilters.size > 0
                ? 'initial'
                : 'none';
            if (!this.searchResultModel) {
                if (this.countElement.style.display !== 'none') {
                    this.searchResultLabel = null;
                    this.countElement.style.display = 'none';
                    this.layout(this.dimension);
                }
                this.rootElement.classList.remove('no-results');
                return;
            }
            if (this.tocTreeModel && this.tocTreeModel.settingsTreeRoot) {
                const count = this.tocTreeModel.settingsTreeRoot.count;
                let resultString;
                switch (count) {
                    case 0:
                        resultString = (0, nls_1.localize)(7, null);
                        break;
                    case 1:
                        resultString = (0, nls_1.localize)(8, null);
                        break;
                    default: resultString = (0, nls_1.localize)(9, null, count);
                }
                this.searchResultLabel = resultString;
                this.updateInputAriaLabel();
                this.countElement.innerText = resultString;
                aria.status(resultString);
                if (this.countElement.style.display !== 'block') {
                    this.countElement.style.display = 'block';
                    this.layout(this.dimension);
                }
                this.rootElement.classList.toggle('no-results', count === 0);
            }
        }
        _filterOrSearchPreferencesModel(filter, model, provider, token) {
            const searchP = provider ? provider.searchModel(model, token) : Promise.resolve(null);
            return searchP
                .then(undefined, err => {
                if ((0, errors_1.isPromiseCanceledError)(err)) {
                    return Promise.reject(err);
                }
                else {
                    /* __GDPR__
                        "settingsEditor.searchError" : {
                            "message": { "classification": "CallstackOrException", "purpose": "FeatureInsight" }
                        }
                    */
                    const message = (0, errors_1.getErrorMessage)(err).trim();
                    if (message && message !== 'Error') {
                        // "Error" = any generic network error
                        this.telemetryService.publicLogError('settingsEditor.searchError', { message });
                        this.logService.info('Setting search error: ' + message);
                    }
                    return null;
                }
            });
        }
        layoutTrees(dimension) {
            const listHeight = dimension.height - (72 + 11 /* header height + editor padding */);
            const settingsTreeHeight = listHeight - 14;
            this.settingsTreeContainer.style.height = `${settingsTreeHeight}px`;
            this.settingsTree.layout(settingsTreeHeight, dimension.width);
            const tocTreeHeight = settingsTreeHeight - 1;
            this.tocTreeContainer.style.height = `${tocTreeHeight}px`;
            this.tocTree.layout(tocTreeHeight);
        }
        saveState() {
            if (this.isVisible()) {
                const searchQuery = this.searchWidget.getValue().trim();
                const target = this.settingsTargetsWidget.settingsTarget;
                if (this.group && this.input) {
                    this.editorMemento.saveEditorState(this.group, this.input, { searchQuery, target });
                }
            }
            super.saveState();
        }
    };
    SettingsEditor2.ID = 'workbench.editor.settings2';
    SettingsEditor2.NUM_INSTANCES = 0;
    SettingsEditor2.SETTING_UPDATE_FAST_DEBOUNCE = 200;
    SettingsEditor2.SETTING_UPDATE_SLOW_DEBOUNCE = 1000;
    SettingsEditor2.CONFIG_SCHEMA_UPDATE_DELAYER = 500;
    SettingsEditor2.SUGGESTIONS = [
        `@${preferences_1.MODIFIED_SETTING_TAG}`, '@tag:usesOnlineServices', '@tag:sync', `@tag:${preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}`, `@${preferences_1.ID_SETTING_TAG}`, `@${preferences_1.EXTENSION_SETTING_TAG}`, `@${preferences_1.FEATURE_SETTING_TAG}scm`, `@${preferences_1.FEATURE_SETTING_TAG}explorer`, `@${preferences_1.FEATURE_SETTING_TAG}search`, `@${preferences_1.FEATURE_SETTING_TAG}debug`, `@${preferences_1.FEATURE_SETTING_TAG}extensions`, `@${preferences_1.FEATURE_SETTING_TAG}terminal`, `@${preferences_1.FEATURE_SETTING_TAG}task`, `@${preferences_1.FEATURE_SETTING_TAG}problems`, `@${preferences_1.FEATURE_SETTING_TAG}output`, `@${preferences_1.FEATURE_SETTING_TAG}comments`, `@${preferences_1.FEATURE_SETTING_TAG}remote`, `@${preferences_1.FEATURE_SETTING_TAG}timeline`
    ];
    SettingsEditor2 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, configuration_1.IWorkbenchConfigurationService),
        __param(2, themeService_1.IThemeService),
        __param(3, preferences_2.IPreferencesService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, preferences_1.IPreferencesSearchService),
        __param(6, log_1.ILogService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, storage_1.IStorageService),
        __param(9, notification_1.INotificationService),
        __param(10, editorGroupsService_1.IEditorGroupsService),
        __param(11, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(12, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], SettingsEditor2);
    exports.SettingsEditor2 = SettingsEditor2;
    let SyncControls = class SyncControls extends lifecycle_1.Disposable {
        constructor(container, commandService, userDataSyncService, userDataAutoSyncEnablementService, themeService) {
            super();
            this.commandService = commandService;
            this.userDataSyncService = userDataSyncService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this._onDidChangeLastSyncedLabel = this._register(new event_1.Emitter());
            this.onDidChangeLastSyncedLabel = this._onDidChangeLastSyncedLabel.event;
            const headerRightControlsContainer = DOM.append(container, $('.settings-right-controls'));
            const turnOnSyncButtonContainer = DOM.append(headerRightControlsContainer, $('.turn-on-sync'));
            this.turnOnSyncButton = this._register(new button_1.Button(turnOnSyncButtonContainer, { title: true }));
            this._register((0, styler_1.attachButtonStyler)(this.turnOnSyncButton, themeService));
            this.lastSyncedLabel = DOM.append(headerRightControlsContainer, $('.last-synced-label'));
            DOM.hide(this.lastSyncedLabel);
            this.turnOnSyncButton.enabled = true;
            this.turnOnSyncButton.label = (0, nls_1.localize)(10, null);
            DOM.hide(this.turnOnSyncButton.element);
            this._register(this.turnOnSyncButton.onDidClick(async () => {
                await this.commandService.executeCommand('workbench.userDataSync.actions.turnOn');
            }));
            this.updateLastSyncedTime();
            this._register(this.userDataSyncService.onDidChangeLastSyncTime(() => {
                this.updateLastSyncedTime();
            }));
            const updateLastSyncedTimer = this._register(new async_1.IntervalTimer());
            updateLastSyncedTimer.cancelAndSet(() => this.updateLastSyncedTime(), 60 * 1000);
            this.update();
            this._register(this.userDataSyncService.onDidChangeStatus(() => {
                this.update();
            }));
            this._register(this.userDataAutoSyncEnablementService.onDidChangeEnablement(() => {
                this.update();
            }));
        }
        updateLastSyncedTime() {
            const last = this.userDataSyncService.lastSyncTime;
            let label;
            if (typeof last === 'number') {
                const d = (0, date_1.fromNow)(last, true);
                label = (0, nls_1.localize)(11, null, d);
            }
            else {
                label = '';
            }
            this.lastSyncedLabel.textContent = label;
            this._onDidChangeLastSyncedLabel.fire(label);
        }
        update() {
            if (this.userDataSyncService.status === "uninitialized" /* Uninitialized */) {
                return;
            }
            if (this.userDataAutoSyncEnablementService.isEnabled() || this.userDataSyncService.status !== "idle" /* Idle */) {
                DOM.show(this.lastSyncedLabel);
                DOM.hide(this.turnOnSyncButton.element);
            }
            else {
                DOM.hide(this.lastSyncedLabel);
                DOM.show(this.turnOnSyncButton.element);
            }
        }
    };
    SyncControls = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, userDataSync_1.IUserDataSyncService),
        __param(3, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(4, themeService_1.IThemeService)
    ], SyncControls);
});
//# sourceMappingURL=settingsEditor2.js.map