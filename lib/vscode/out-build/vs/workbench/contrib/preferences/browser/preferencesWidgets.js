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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/preferences/browser/preferencesWidgets", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/base/common/network", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/common/theme", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/preferences/common/preferences", "vs/base/common/resources", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/platform/browser/contextScopedHistoryWidget"], function (require, exports, DOM, keyboardEvent_1, actionbar_1, widget_1, actions_1, event_1, htmlContent_1, lifecycle_1, uri_1, nls_1, contextkey_1, contextView_1, instantiation_1, label_1, network_1, colorRegistry_1, styler_1, themeService_1, workspace_1, theme_1, environmentService_1, preferences_1, resources_1, actionViewItems_1, preferencesIcons_1, contextScopedHistoryWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditPreferenceWidget = exports.SearchWidget = exports.SettingsTargetsWidget = exports.FolderSettingsActionViewItem = exports.SettingsGroupTitleWidget = exports.DefaultSettingsHeaderWidget = exports.SettingsHeaderWidget = void 0;
    class SettingsHeaderWidget extends widget_1.Widget {
        constructor(editor, title) {
            super();
            this.editor = editor;
            this.title = title;
            this.create();
            this._register(this.editor.onDidChangeConfiguration(() => this.layout()));
            this._register(this.editor.onDidLayoutChange(() => this.layout()));
        }
        get domNode() {
            return this._domNode;
        }
        get heightInLines() {
            return 1;
        }
        get afterLineNumber() {
            return 0;
        }
        create() {
            this._domNode = DOM.$('.settings-header-widget');
            this.titleContainer = DOM.append(this._domNode, DOM.$('.title-container'));
            if (this.title) {
                DOM.append(this.titleContainer, DOM.$('.title')).textContent = this.title;
            }
            this.messageElement = DOM.append(this.titleContainer, DOM.$('.message'));
            if (this.title) {
                this.messageElement.style.paddingLeft = '12px';
            }
            this.editor.changeViewZones(accessor => {
                this.id = accessor.addZone(this);
                this.layout();
            });
        }
        setMessage(message) {
            this.messageElement.textContent = message;
        }
        layout() {
            const options = this.editor.getOptions();
            const fontInfo = options.get(40 /* fontInfo */);
            this.titleContainer.style.fontSize = fontInfo.fontSize + 'px';
            if (!options.get(35 /* folding */)) {
                this.titleContainer.style.paddingLeft = '6px';
            }
        }
        dispose() {
            this.editor.changeViewZones(accessor => {
                accessor.removeZone(this.id);
            });
            super.dispose();
        }
    }
    exports.SettingsHeaderWidget = SettingsHeaderWidget;
    class DefaultSettingsHeaderWidget extends SettingsHeaderWidget {
        constructor() {
            super(...arguments);
            this._onClick = this._register(new event_1.Emitter());
            this.onClick = this._onClick.event;
        }
        create() {
            super.create();
            this.toggleMessage(true);
        }
        toggleMessage(hasSettings) {
            if (hasSettings) {
                this.setMessage((0, nls_1.localize)(0, null));
            }
            else {
                this.setMessage((0, nls_1.localize)(1, null));
            }
        }
    }
    exports.DefaultSettingsHeaderWidget = DefaultSettingsHeaderWidget;
    class SettingsGroupTitleWidget extends widget_1.Widget {
        constructor(editor, settingsGroup) {
            super();
            this.editor = editor;
            this.settingsGroup = settingsGroup;
            this._onToggled = this._register(new event_1.Emitter());
            this.onToggled = this._onToggled.event;
            this.previousPosition = null;
            this.create();
            this._register(this.editor.onDidChangeConfiguration(() => this.layout()));
            this._register(this.editor.onDidLayoutChange(() => this.layout()));
            this._register(this.editor.onDidChangeCursorPosition((e) => this.onCursorChange(e)));
        }
        get domNode() {
            return this._domNode;
        }
        get heightInLines() {
            return 1.5;
        }
        get afterLineNumber() {
            return this._afterLineNumber;
        }
        create() {
            this._domNode = DOM.$('.settings-group-title-widget');
            this.titleContainer = DOM.append(this._domNode, DOM.$('.title-container'));
            this.titleContainer.tabIndex = 0;
            this.onclick(this.titleContainer, () => this.toggle());
            this.onkeydown(this.titleContainer, (e) => this.onKeyDown(e));
            const focusTracker = this._register(DOM.trackFocus(this.titleContainer));
            this._register(focusTracker.onDidFocus(() => this.toggleFocus(true)));
            this._register(focusTracker.onDidBlur(() => this.toggleFocus(false)));
            this.icon = DOM.append(this.titleContainer, DOM.$(''));
            this.title = DOM.append(this.titleContainer, DOM.$('.title'));
            this.title.textContent = this.settingsGroup.title + ` (${this.settingsGroup.sections.reduce((count, section) => count + section.settings.length, 0)})`;
            this.updateTwisty(false);
            this.layout();
        }
        getTwistyIcon(isCollapsed) {
            return isCollapsed ? preferencesIcons_1.settingsGroupCollapsedIcon : preferencesIcons_1.settingsGroupExpandedIcon;
        }
        updateTwisty(collapse) {
            this.icon.classList.remove(...themeService_1.ThemeIcon.asClassNameArray(this.getTwistyIcon(!collapse)));
            this.icon.classList.add(...themeService_1.ThemeIcon.asClassNameArray(this.getTwistyIcon(collapse)));
        }
        render() {
            if (!this.settingsGroup.range) {
                // #61352
                return;
            }
            this._afterLineNumber = this.settingsGroup.range.startLineNumber - 2;
            this.editor.changeViewZones(accessor => {
                this.id = accessor.addZone(this);
                this.layout();
            });
        }
        toggleCollapse(collapse) {
            this.titleContainer.classList.toggle('collapsed', collapse);
            this.updateTwisty(collapse);
        }
        toggleFocus(focus) {
            this.titleContainer.classList.toggle('focused', focus);
        }
        isCollapsed() {
            return this.titleContainer.classList.contains('collapsed');
        }
        layout() {
            const options = this.editor.getOptions();
            const fontInfo = options.get(40 /* fontInfo */);
            const layoutInfo = this.editor.getLayoutInfo();
            this._domNode.style.width = layoutInfo.contentWidth - layoutInfo.verticalScrollbarWidth + 'px';
            this.titleContainer.style.lineHeight = options.get(55 /* lineHeight */) + 3 + 'px';
            this.titleContainer.style.height = options.get(55 /* lineHeight */) + 3 + 'px';
            this.titleContainer.style.fontSize = fontInfo.fontSize + 'px';
            this.icon.style.minWidth = `${this.getIconSize(16)}px`;
        }
        getIconSize(minSize) {
            const fontSize = this.editor.getOption(40 /* fontInfo */).fontSize;
            return fontSize > 8 ? Math.max(fontSize, minSize) : 12;
        }
        onKeyDown(keyboardEvent) {
            switch (keyboardEvent.keyCode) {
                case 3 /* Enter */:
                case 10 /* Space */:
                    this.toggle();
                    break;
                case 15 /* LeftArrow */:
                    this.collapse(true);
                    break;
                case 17 /* RightArrow */:
                    this.collapse(false);
                    break;
                case 16 /* UpArrow */:
                    if (this.settingsGroup.range.startLineNumber - 3 !== 1) {
                        this.editor.focus();
                        const lineNumber = this.settingsGroup.range.startLineNumber - 2;
                        if (this.editor.hasModel()) {
                            this.editor.setPosition({ lineNumber, column: this.editor.getModel().getLineMinColumn(lineNumber) });
                        }
                    }
                    break;
                case 18 /* DownArrow */:
                    const lineNumber = this.isCollapsed() ? this.settingsGroup.range.startLineNumber : this.settingsGroup.range.startLineNumber - 1;
                    this.editor.focus();
                    if (this.editor.hasModel()) {
                        this.editor.setPosition({ lineNumber, column: this.editor.getModel().getLineMinColumn(lineNumber) });
                    }
                    break;
            }
        }
        toggle() {
            this.collapse(!this.isCollapsed());
        }
        collapse(collapse) {
            if (collapse !== this.isCollapsed()) {
                this.titleContainer.classList.toggle('collapsed', collapse);
                this.updateTwisty(collapse);
                this._onToggled.fire(collapse);
            }
        }
        onCursorChange(e) {
            if (e.source !== 'mouse' && this.focusTitle(e.position)) {
                this.titleContainer.focus();
            }
        }
        focusTitle(currentPosition) {
            const previousPosition = this.previousPosition;
            this.previousPosition = currentPosition;
            if (!previousPosition) {
                return false;
            }
            if (previousPosition.lineNumber === currentPosition.lineNumber) {
                return false;
            }
            if (!this.settingsGroup.range) {
                // #60460?
                return false;
            }
            if (currentPosition.lineNumber === this.settingsGroup.range.startLineNumber - 1 || currentPosition.lineNumber === this.settingsGroup.range.startLineNumber - 2) {
                return true;
            }
            if (this.isCollapsed() && currentPosition.lineNumber === this.settingsGroup.range.endLineNumber) {
                return true;
            }
            return false;
        }
        dispose() {
            this.editor.changeViewZones(accessor => {
                accessor.removeZone(this.id);
            });
            super.dispose();
        }
    }
    exports.SettingsGroupTitleWidget = SettingsGroupTitleWidget;
    let FolderSettingsActionViewItem = class FolderSettingsActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(action, contextService, contextMenuService, preferencesService) {
            super(null, action);
            this.contextService = contextService;
            this.contextMenuService = contextMenuService;
            this.preferencesService = preferencesService;
            this._folderSettingCounts = new Map();
            const workspace = this.contextService.getWorkspace();
            this._folder = workspace.folders.length === 1 ? workspace.folders[0] : null;
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.onWorkspaceFoldersChanged()));
        }
        get folder() {
            return this._folder;
        }
        set folder(folder) {
            this._folder = folder;
            this.update();
        }
        setCount(settingsTarget, count) {
            const workspaceFolder = this.contextService.getWorkspaceFolder(settingsTarget);
            if (!workspaceFolder) {
                throw new Error('unknown folder');
            }
            const folder = workspaceFolder.uri;
            this._folderSettingCounts.set(folder.toString(), count);
            this.update();
        }
        render(container) {
            this.element = container;
            this.container = container;
            this.labelElement = DOM.$('.action-title');
            this.detailsElement = DOM.$('.action-details');
            this.dropDownElement = DOM.$('.dropdown-icon.hide' + themeService_1.ThemeIcon.asCSSSelector(preferencesIcons_1.settingsScopeDropDownIcon));
            this.anchorElement = DOM.$('a.action-label.folder-settings', {
                role: 'button',
                'aria-haspopup': 'true',
                'tabindex': '0'
            }, this.labelElement, this.detailsElement, this.dropDownElement);
            this._register(DOM.addDisposableListener(this.anchorElement, DOM.EventType.MOUSE_DOWN, e => DOM.EventHelper.stop(e)));
            this._register(DOM.addDisposableListener(this.anchorElement, DOM.EventType.CLICK, e => this.onClick(e)));
            this._register(DOM.addDisposableListener(this.anchorElement, DOM.EventType.KEY_UP, e => this.onKeyUp(e)));
            DOM.append(this.container, this.anchorElement);
            this.update();
        }
        onKeyUp(event) {
            const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(event);
            switch (keyboardEvent.keyCode) {
                case 3 /* Enter */:
                case 10 /* Space */:
                    this.onClick(event);
                    return;
            }
        }
        onClick(event) {
            DOM.EventHelper.stop(event, true);
            if (!this.folder || this._action.checked) {
                this.showMenu();
            }
            else {
                this._action.run(this._folder);
            }
        }
        updateEnabled() {
            this.update();
        }
        updateChecked() {
            this.update();
        }
        onWorkspaceFoldersChanged() {
            const oldFolder = this._folder;
            const workspace = this.contextService.getWorkspace();
            if (oldFolder) {
                this._folder = workspace.folders.filter(folder => (0, resources_1.isEqual)(folder.uri, oldFolder.uri))[0] || workspace.folders[0];
            }
            this._folder = this._folder ? this._folder : workspace.folders.length === 1 ? workspace.folders[0] : null;
            this.update();
            if (this._action.checked) {
                this._action.run(this._folder);
            }
        }
        async update() {
            var _a;
            let total = 0;
            this._folderSettingCounts.forEach(n => total += n);
            const workspace = this.contextService.getWorkspace();
            if (this._folder) {
                this.labelElement.textContent = this._folder.name;
                this.anchorElement.title = ((_a = (await this.preferencesService.getEditableSettingsURI(5 /* WORKSPACE_FOLDER */, this._folder.uri))) === null || _a === void 0 ? void 0 : _a.fsPath) || '';
                const detailsText = this.labelWithCount(this._action.label, total);
                this.detailsElement.textContent = detailsText;
                this.dropDownElement.classList.toggle('hide', workspace.folders.length === 1 || !this._action.checked);
            }
            else {
                const labelText = this.labelWithCount(this._action.label, total);
                this.labelElement.textContent = labelText;
                this.detailsElement.textContent = '';
                this.anchorElement.title = this._action.label;
                this.dropDownElement.classList.remove('hide');
            }
            this.anchorElement.classList.toggle('checked', this._action.checked);
            this.container.classList.toggle('disabled', !this._action.enabled);
        }
        showMenu() {
            this.contextMenuService.showContextMenu({
                getAnchor: () => this.container,
                getActions: () => this.getDropdownMenuActions(),
                getActionViewItem: () => undefined,
                onHide: () => {
                    this.anchorElement.blur();
                }
            });
        }
        getDropdownMenuActions() {
            const actions = [];
            const workspaceFolders = this.contextService.getWorkspace().folders;
            if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ && workspaceFolders.length > 0) {
                actions.push(...workspaceFolders.map((folder, index) => {
                    const folderCount = this._folderSettingCounts.get(folder.uri.toString());
                    return {
                        id: 'folderSettingsTarget' + index,
                        label: this.labelWithCount(folder.name, folderCount),
                        checked: this.folder && (0, resources_1.isEqual)(this.folder.uri, folder.uri),
                        enabled: true,
                        run: () => this._action.run(folder)
                    };
                }));
            }
            return actions;
        }
        labelWithCount(label, count) {
            // Append the count if it's >0 and not undefined
            if (count) {
                label += ` (${count})`;
            }
            return label;
        }
    };
    FolderSettingsActionViewItem = __decorate([
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, preferences_1.IPreferencesService)
    ], FolderSettingsActionViewItem);
    exports.FolderSettingsActionViewItem = FolderSettingsActionViewItem;
    let SettingsTargetsWidget = class SettingsTargetsWidget extends widget_1.Widget {
        constructor(parent, options, contextService, instantiationService, environmentService, labelService, preferencesService) {
            super();
            this.contextService = contextService;
            this.instantiationService = instantiationService;
            this.environmentService = environmentService;
            this.labelService = labelService;
            this.preferencesService = preferencesService;
            this._settingsTarget = null;
            this._onDidTargetChange = this._register(new event_1.Emitter());
            this.onDidTargetChange = this._onDidTargetChange.event;
            this.options = options || {};
            this.create(parent);
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.onWorkbenchStateChanged()));
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.update()));
        }
        create(parent) {
            const settingsTabsWidget = DOM.append(parent, DOM.$('.settings-tabs-widget'));
            this.settingsSwitcherBar = this._register(new actionbar_1.ActionBar(settingsTabsWidget, {
                orientation: 0 /* HORIZONTAL */,
                ariaLabel: (0, nls_1.localize)(2, null),
                animated: false,
                actionViewItemProvider: (action) => action.id === 'folderSettings' ? this.folderSettings : undefined
            }));
            this.userLocalSettings = new actions_1.Action('userSettings', (0, nls_1.localize)(3, null), '.settings-tab', true, () => this.updateTarget(2 /* USER_LOCAL */));
            this.preferencesService.getEditableSettingsURI(2 /* USER_LOCAL */).then(uri => {
                // Don't wait to create UI on resolving remote
                this.userLocalSettings.tooltip = (uri === null || uri === void 0 ? void 0 : uri.fsPath) || '';
            });
            const remoteAuthority = this.environmentService.remoteAuthority;
            const hostLabel = remoteAuthority && this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority);
            const remoteSettingsLabel = (0, nls_1.localize)(4, null) +
                (hostLabel ? ` [${hostLabel}]` : '');
            this.userRemoteSettings = new actions_1.Action('userSettingsRemote', remoteSettingsLabel, '.settings-tab', true, () => this.updateTarget(3 /* USER_REMOTE */));
            this.preferencesService.getEditableSettingsURI(3 /* USER_REMOTE */).then(uri => {
                this.userRemoteSettings.tooltip = (uri === null || uri === void 0 ? void 0 : uri.fsPath) || '';
            });
            this.workspaceSettings = new actions_1.Action('workspaceSettings', (0, nls_1.localize)(5, null), '.settings-tab', false, () => this.updateTarget(4 /* WORKSPACE */));
            const folderSettingsAction = new actions_1.Action('folderSettings', (0, nls_1.localize)(6, null), '.settings-tab', false, async (folder) => {
                this.updateTarget((0, workspace_1.isWorkspaceFolder)(folder) ? folder.uri : 2 /* USER_LOCAL */);
            });
            this.folderSettings = this.instantiationService.createInstance(FolderSettingsActionViewItem, folderSettingsAction);
            this.update();
            this.settingsSwitcherBar.push([this.userLocalSettings, this.userRemoteSettings, this.workspaceSettings, folderSettingsAction]);
        }
        get settingsTarget() {
            return this._settingsTarget;
        }
        set settingsTarget(settingsTarget) {
            this._settingsTarget = settingsTarget;
            this.userLocalSettings.checked = 2 /* USER_LOCAL */ === this.settingsTarget;
            this.userRemoteSettings.checked = 3 /* USER_REMOTE */ === this.settingsTarget;
            this.workspaceSettings.checked = 4 /* WORKSPACE */ === this.settingsTarget;
            if (this.settingsTarget instanceof uri_1.URI) {
                this.folderSettings.getAction().checked = true;
                this.folderSettings.folder = this.contextService.getWorkspaceFolder(this.settingsTarget);
            }
            else {
                this.folderSettings.getAction().checked = false;
            }
        }
        setResultCount(settingsTarget, count) {
            if (settingsTarget === 4 /* WORKSPACE */) {
                let label = (0, nls_1.localize)(7, null);
                if (count) {
                    label += ` (${count})`;
                }
                this.workspaceSettings.label = label;
            }
            else if (settingsTarget === 2 /* USER_LOCAL */) {
                let label = (0, nls_1.localize)(8, null);
                if (count) {
                    label += ` (${count})`;
                }
                this.userLocalSettings.label = label;
            }
            else if (settingsTarget instanceof uri_1.URI) {
                this.folderSettings.setCount(settingsTarget, count);
            }
        }
        onWorkbenchStateChanged() {
            this.folderSettings.folder = null;
            this.update();
            if (this.settingsTarget === 4 /* WORKSPACE */ && this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
                this.updateTarget(2 /* USER_LOCAL */);
            }
        }
        updateTarget(settingsTarget) {
            const isSameTarget = this.settingsTarget === settingsTarget ||
                settingsTarget instanceof uri_1.URI &&
                    this.settingsTarget instanceof uri_1.URI &&
                    (0, resources_1.isEqual)(this.settingsTarget, settingsTarget);
            if (!isSameTarget) {
                this.settingsTarget = settingsTarget;
                this._onDidTargetChange.fire(this.settingsTarget);
            }
            return Promise.resolve(undefined);
        }
        async update() {
            var _a;
            this.settingsSwitcherBar.domNode.classList.toggle('empty-workbench', this.contextService.getWorkbenchState() === 1 /* EMPTY */);
            this.userRemoteSettings.enabled = !!(this.options.enableRemoteSettings && this.environmentService.remoteAuthority);
            this.workspaceSettings.enabled = this.contextService.getWorkbenchState() !== 1 /* EMPTY */;
            this.folderSettings.getAction().enabled = this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ && this.contextService.getWorkspace().folders.length > 0;
            this.workspaceSettings.tooltip = ((_a = (await this.preferencesService.getEditableSettingsURI(4 /* WORKSPACE */))) === null || _a === void 0 ? void 0 : _a.fsPath) || '';
        }
    };
    SettingsTargetsWidget = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, label_1.ILabelService),
        __param(6, preferences_1.IPreferencesService)
    ], SettingsTargetsWidget);
    exports.SettingsTargetsWidget = SettingsTargetsWidget;
    let SearchWidget = class SearchWidget extends widget_1.Widget {
        constructor(parent, options, contextViewService, instantiationService, themeService, contextKeyService) {
            super();
            this.options = options;
            this.contextViewService = contextViewService;
            this.instantiationService = instantiationService;
            this.themeService = themeService;
            this.contextKeyService = contextKeyService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onFocus = this._register(new event_1.Emitter());
            this.onFocus = this._onFocus.event;
            this.create(parent);
        }
        create(parent) {
            this.domNode = DOM.append(parent, DOM.$('div.settings-header-widget'));
            this.createSearchContainer(DOM.append(this.domNode, DOM.$('div.settings-search-container')));
            this.controlsDiv = DOM.append(this.domNode, DOM.$('div.settings-search-controls'));
            if (this.options.showResultCount) {
                this.countElement = DOM.append(this.controlsDiv, DOM.$('.settings-count-widget'));
                this._register((0, styler_1.attachStylerCallback)(this.themeService, { badgeBackground: colorRegistry_1.badgeBackground, contrastBorder: colorRegistry_1.contrastBorder }, colors => {
                    const background = colors.badgeBackground ? colors.badgeBackground.toString() : '';
                    const border = colors.contrastBorder ? colors.contrastBorder.toString() : '';
                    this.countElement.style.backgroundColor = background;
                    this.countElement.style.borderWidth = border ? '1px' : '';
                    this.countElement.style.borderStyle = border ? 'solid' : '';
                    this.countElement.style.borderColor = border;
                    const color = this.themeService.getColorTheme().getColor(colorRegistry_1.badgeForeground);
                    this.countElement.style.color = color ? color.toString() : '';
                }));
            }
            this.inputBox.inputElement.setAttribute('aria-live', this.options.ariaLive || 'off');
            if (this.options.ariaLabelledBy) {
                this.inputBox.inputElement.setAttribute('aria-labelledBy', this.options.ariaLabelledBy);
            }
            const focusTracker = this._register(DOM.trackFocus(this.inputBox.inputElement));
            this._register(focusTracker.onDidFocus(() => this._onFocus.fire()));
            const focusKey = this.options.focusKey;
            if (focusKey) {
                this._register(focusTracker.onDidFocus(() => focusKey.set(true)));
                this._register(focusTracker.onDidBlur(() => focusKey.set(false)));
            }
        }
        createSearchContainer(searchContainer) {
            this.searchContainer = searchContainer;
            const searchInput = DOM.append(this.searchContainer, DOM.$('div.settings-search-input'));
            this.inputBox = this._register(this.createInputBox(searchInput));
            this._register(this.inputBox.onDidChange(value => this._onDidChange.fire(value)));
        }
        createInputBox(parent) {
            const box = this._register(new contextScopedHistoryWidget_1.ContextScopedHistoryInputBox(parent, this.contextViewService, this.options, this.contextKeyService));
            this._register((0, styler_1.attachInputBoxStyler)(box, this.themeService));
            return box;
        }
        showMessage(message) {
            // Avoid setting the aria-label unnecessarily, the screenreader will read the count every time it's set, since it's aria-live:assertive. #50968
            if (this.countElement && message !== this.countElement.textContent) {
                this.countElement.textContent = message;
                this.inputBox.inputElement.setAttribute('aria-label', message);
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
            }
        }
        layout(dimension) {
            if (dimension.width < 400) {
                if (this.countElement) {
                    this.countElement.classList.add('hide');
                }
                this.inputBox.inputElement.style.paddingRight = '0px';
            }
            else {
                if (this.countElement) {
                    this.countElement.classList.remove('hide');
                }
                this.inputBox.inputElement.style.paddingRight = this.getControlsWidth() + 'px';
            }
        }
        getControlsWidth() {
            const countWidth = this.countElement ? DOM.getTotalWidth(this.countElement) : 0;
            return countWidth + 20;
        }
        focus() {
            this.inputBox.focus();
            if (this.getValue()) {
                this.inputBox.select();
            }
        }
        hasFocus() {
            return this.inputBox.hasFocus();
        }
        clear() {
            this.inputBox.value = '';
        }
        getValue() {
            return this.inputBox.value;
        }
        setValue(value) {
            return this.inputBox.value = value;
        }
        dispose() {
            if (this.options.focusKey) {
                this.options.focusKey.set(false);
            }
            super.dispose();
        }
    };
    SearchWidget = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextkey_1.IContextKeyService)
    ], SearchWidget);
    exports.SearchWidget = SearchWidget;
    class EditPreferenceWidget extends lifecycle_1.Disposable {
        constructor(editor) {
            super();
            this.editor = editor;
            this._line = -1;
            this._preferences = [];
            this._onClick = this._register(new event_1.Emitter());
            this.onClick = this._onClick.event;
            this._editPreferenceDecoration = [];
            this._register(this.editor.onMouseDown((e) => {
                const data = e.target.detail;
                if (e.target.type !== 2 /* GUTTER_GLYPH_MARGIN */ || data.isAfterLines || !this.isVisible()) {
                    return;
                }
                this._onClick.fire(e);
            }));
        }
        get preferences() {
            return this._preferences;
        }
        getLine() {
            return this._line;
        }
        show(line, hoverMessage, preferences) {
            this._preferences = preferences;
            const newDecoration = [];
            this._line = line;
            newDecoration.push({
                options: {
                    glyphMarginClassName: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    glyphMarginHoverMessage: new htmlContent_1.MarkdownString().appendText(hoverMessage),
                    stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
                },
                range: {
                    startLineNumber: line,
                    startColumn: 1,
                    endLineNumber: line,
                    endColumn: 1
                }
            });
            this._editPreferenceDecoration = this.editor.deltaDecorations(this._editPreferenceDecoration, newDecoration);
        }
        hide() {
            this._editPreferenceDecoration = this.editor.deltaDecorations(this._editPreferenceDecoration, []);
        }
        isVisible() {
            return this._editPreferenceDecoration.length > 0;
        }
        dispose() {
            this.hide();
            super.dispose();
        }
    }
    exports.EditPreferenceWidget = EditPreferenceWidget;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        collector.addRule(`
		.settings-tabs-widget > .monaco-action-bar .action-item .action-label:focus,
		.settings-tabs-widget > .monaco-action-bar .action-item .action-label.checked {
			border-bottom: 1px solid;
		}
	`);
        // Title Active
        const titleActive = theme.getColor(theme_1.PANEL_ACTIVE_TITLE_FOREGROUND);
        const titleActiveBorder = theme.getColor(theme_1.PANEL_ACTIVE_TITLE_BORDER);
        if (titleActive || titleActiveBorder) {
            collector.addRule(`
			.settings-tabs-widget > .monaco-action-bar .action-item .action-label:hover,
			.settings-tabs-widget > .monaco-action-bar .action-item .action-label.checked {
				color: ${titleActive};
				border-bottom-color: ${titleActiveBorder};
			}
		`);
        }
        // Title Inactive
        const titleInactive = theme.getColor(theme_1.PANEL_INACTIVE_TITLE_FOREGROUND);
        if (titleInactive) {
            collector.addRule(`
			.settings-tabs-widget > .monaco-action-bar .action-item .action-label {
				color: ${titleInactive};
			}
		`);
        }
        // Title focus
        const focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
        if (focusBorderColor) {
            collector.addRule(`
			.settings-tabs-widget > .monaco-action-bar .action-item .action-label:focus {
				border-bottom-color: ${focusBorderColor} !important;
			}
			`);
            collector.addRule(`
			.settings-tabs-widget > .monaco-action-bar .action-item .action-label:focus {
				outline: none;
			}
			`);
        }
        // Styling with Outline color (e.g. high contrast theme)
        const outline = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (outline) {
            const outline = theme.getColor(colorRegistry_1.activeContrastBorder);
            collector.addRule(`
			.settings-tabs-widget > .monaco-action-bar .action-item .action-label.checked,
			.settings-tabs-widget > .monaco-action-bar .action-item .action-label:hover {
				outline-color: ${outline};
				outline-width: 1px;
				outline-style: solid;
				border-bottom: none;
				padding-bottom: 0;
				outline-offset: -1px;
			}

			.settings-tabs-widget > .monaco-action-bar .action-item .action-label:not(.checked):hover {
				outline-style: dashed;
			}
		`);
        }
    });
});
//# sourceMappingURL=preferencesWidgets.js.map