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
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminalView", "vs/base/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/workbench/common/theme", "vs/platform/actions/common/actions", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/contrib/terminal/common/terminalExtensionPoints", "vs/platform/theme/common/styler", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/terminal/browser/terminalTabbedView", "vs/base/common/codicons", "vs/platform/commands/common/commands", "vs/base/browser/ui/dropdown/dropdownWithPrimaryActionViewItem", "vs/base/browser/dom", "vs/base/browser/ui/iconLabel/iconLabels", "vs/workbench/contrib/terminal/browser/terminalStatusList", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, nls, actions_1, configuration_1, contextView_1, instantiation_1, telemetry_1, themeService_1, terminalActions_1, terminalColorRegistry_1, notification_1, terminal_1, viewPane_1, keybinding_1, contextkey_1, views_1, opener_1, theme_1, actions_2, actionViewItems_1, terminalExtensionPoints_1, styler_1, colorRegistry_1, terminalTabbedView_1, codicons_1, commands_1, dropdownWithPrimaryActionViewItem_1, dom_1, iconLabels_1, terminalStatusList_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalViewPane = void 0;
    let TerminalViewPane = class TerminalViewPane extends viewPane_1.ViewPane {
        constructor(options, keybindingService, _contextKeyService, viewDescriptorService, configurationService, _contextMenuService, _instantiationService, _terminalService, themeService, telemetryService, _notificationService, openerService, _menuService, _commandService, _terminalContributionService) {
            super(options, keybindingService, _contextMenuService, configurationService, _contextKeyService, viewDescriptorService, _instantiationService, openerService, themeService, telemetryService);
            this._contextKeyService = _contextKeyService;
            this._contextMenuService = _contextMenuService;
            this._instantiationService = _instantiationService;
            this._terminalService = _terminalService;
            this._notificationService = _notificationService;
            this._menuService = _menuService;
            this._commandService = _commandService;
            this._terminalContributionService = _terminalContributionService;
            this._terminalsInitialized = false;
            this._bodyDimensions = { width: 0, height: 0 };
            this._isWelcomeShowing = false;
            this._terminalService.onDidRegisterProcessSupport(() => {
                if (this._actions) {
                    for (const action of this._actions) {
                        action.enabled = true;
                    }
                }
                this._onDidChangeViewWelcomeState.fire();
            });
            this._terminalService.onInstanceCreated(() => {
                if (!this._isWelcomeShowing) {
                    return;
                }
                this._isWelcomeShowing = true;
                this._onDidChangeViewWelcomeState.fire();
                if (!this._terminalTabbedView && this._parentDomElement) {
                    this._createTabsView();
                    this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
                }
            });
            this._dropdownMenu = this._register(this._menuService.createMenu(actions_2.MenuId.TerminalToolbarContext, this._contextKeyService));
            this._singleTabMenu = this._register(this._menuService.createMenu(actions_2.MenuId.TerminalSingleTabContext, this._contextKeyService));
            this._register(this._terminalService.onDidChangeAvailableProfiles(profiles => this._updateTabActionBar(profiles)));
        }
        get terminalTabbedView() { return this._terminalTabbedView; }
        renderBody(container) {
            super.renderBody(container);
            this._parentDomElement = container;
            this._parentDomElement.classList.add('integrated-terminal');
            this._fontStyleElement = document.createElement('style');
            if (!this.shouldShowWelcome()) {
                this._createTabsView();
            }
            this._parentDomElement.appendChild(this._fontStyleElement);
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('terminal.integrated.fontFamily') || e.affectsConfiguration('editor.fontFamily')) {
                    const configHelper = this._terminalService.configHelper;
                    if (!configHelper.configFontIsMonospace()) {
                        const choices = [{
                                label: nls.localize(0, null),
                                run: () => this.configurationService.updateValue('terminal.integrated.fontFamily', 'monospace'),
                            }];
                        this._notificationService.prompt(notification_1.Severity.Warning, nls.localize(1, null), choices);
                    }
                }
            }));
            this._register(this.onDidChangeBodyVisibility(visible => {
                var _a, _b;
                if (visible) {
                    const hadTerminals = !!this._terminalService.terminalTabs.length;
                    if (this._terminalService.isProcessSupportRegistered) {
                        if (this._terminalsInitialized) {
                            if (!hadTerminals) {
                                this._terminalService.createTerminal();
                            }
                        }
                        else {
                            this._terminalsInitialized = true;
                            this._terminalService.initializeTerminals();
                        }
                    }
                    if (hadTerminals) {
                        (_a = this._terminalService.getActiveTab()) === null || _a === void 0 ? void 0 : _a.setVisible(visible);
                    }
                    else {
                        // TODO@Tyriar - this call seems unnecessary
                        this.layoutBody(this._bodyDimensions.height, this._bodyDimensions.width);
                    }
                    this._terminalService.showPanel(true);
                }
                else {
                    (_b = this._terminalService.getActiveTab()) === null || _b === void 0 ? void 0 : _b.setVisible(false);
                }
            }));
            this.layoutBody(this._parentDomElement.offsetHeight, this._parentDomElement.offsetWidth);
        }
        _createTabsView() {
            if (!this._parentDomElement) {
                return;
            }
            this._tabsViewWrapper = document.createElement('div');
            this._tabsViewWrapper.classList.add('tabs-view-wrapper');
            this._terminalTabbedView = this.instantiationService.createInstance(terminalTabbedView_1.TerminalTabbedView, this._parentDomElement);
            this._parentDomElement.append(this._tabsViewWrapper);
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            if (this._terminalTabbedView) {
                this._bodyDimensions.width = width;
                this._bodyDimensions.height = height;
                this._terminalTabbedView.layout(width, height);
            }
        }
        getActionViewItem(action) {
            switch (action.id) {
                case "workbench.action.terminal.switchTerminal" /* SWITCH_TERMINAL */: {
                    return this._instantiationService.createInstance(SwitchTerminalActionViewItem, action);
                }
                case "workbench.action.terminal.focus" /* FOCUS */: {
                    const actions = [];
                    (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(this._singleTabMenu, undefined, actions);
                    return this._instantiationService.createInstance(SingleTerminalTabActionViewItem, action, actions);
                }
                case "workbench.action.terminal.createProfileButton" /* CREATE_WITH_PROFILE_BUTTON */: {
                    if (this._tabButtons) {
                        this._tabButtons.dispose();
                    }
                    const actions = this._getTabActionBarArgs(this._terminalService.availableProfiles);
                    this._tabButtons = new dropdownWithPrimaryActionViewItem_1.DropdownWithPrimaryActionViewItem(actions.primaryAction, actions.dropdownAction, actions.dropdownMenuActions, actions.className, this._contextMenuService);
                    this._updateTabActionBar(this._terminalService.availableProfiles);
                    return this._tabButtons;
                }
            }
            return super.getActionViewItem(action);
        }
        _updateTabActionBar(profiles) {
            var _a;
            const actions = this._getTabActionBarArgs(profiles);
            (_a = this._tabButtons) === null || _a === void 0 ? void 0 : _a.update(actions.dropdownAction, actions.dropdownMenuActions, actions.dropdownIcon);
        }
        _getTabActionBarArgs(profiles) {
            const dropdownActions = [];
            const submenuActions = [];
            for (const p of profiles) {
                dropdownActions.push(new actions_2.MenuItemAction({ id: "workbench.action.terminal.newWithProfile" /* NEW_WITH_PROFILE */, title: p.profileName, category: "2_create_profile" /* Profile */ }, undefined, { arg: p, shouldForwardArgs: true }, this._contextKeyService, this._commandService));
                submenuActions.push(new actions_2.MenuItemAction({ id: "workbench.action.terminal.split" /* SPLIT */, title: p.profileName, category: "2_create_profile" /* Profile */ }, undefined, { arg: p, shouldForwardArgs: true }, this._contextKeyService, this._commandService));
            }
            for (const contributed of this._terminalContributionService.terminalTypes) {
                dropdownActions.push(new actions_2.MenuItemAction({ id: contributed.command, title: contributed.title, category: "2_create_profile" /* Profile */ }, undefined, undefined, this._contextKeyService, this._commandService));
            }
            if (dropdownActions.length > 0) {
                dropdownActions.push(new actions_1.SubmenuAction('split.profile', 'Split...', submenuActions));
                dropdownActions.push(new actions_1.Separator());
            }
            for (const [, configureActions] of this._dropdownMenu.getActions()) {
                for (const action of configureActions) {
                    // make sure the action is a MenuItemAction
                    if ('alt' in action) {
                        dropdownActions.push(action);
                    }
                }
            }
            const primaryAction = this._instantiationService.createInstance(actions_2.MenuItemAction, { id: "workbench.action.terminal.new" /* NEW */, title: nls.localize(2, null), icon: codicons_1.Codicon.plus }, undefined, undefined);
            const dropdownAction = new actions_1.Action('refresh profiles', 'Launch Profile...', 'codicon-chevron-down', true);
            return { primaryAction, dropdownAction, dropdownMenuActions: dropdownActions, className: 'terminal-tab-actions' };
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
        shouldShowWelcome() {
            this._isWelcomeShowing = !this._terminalService.isProcessSupportRegistered && this._terminalService.terminalInstances.length === 0;
            return this._isWelcomeShowing;
        }
    };
    TerminalViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, views_1.IViewDescriptorService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, terminal_1.ITerminalService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, notification_1.INotificationService),
        __param(11, opener_1.IOpenerService),
        __param(12, actions_2.IMenuService),
        __param(13, commands_1.ICommandService),
        __param(14, terminalExtensionPoints_1.ITerminalContributionService)
    ], TerminalViewPane);
    exports.TerminalViewPane = TerminalViewPane;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const panelBackgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR) || theme.getColor(theme_1.PANEL_BACKGROUND);
        collector.addRule(`.monaco-workbench .part.panel .pane-body.integrated-terminal .terminal-outer-container { background-color: ${panelBackgroundColor ? panelBackgroundColor.toString() : ''}; }`);
        const sidebarBackgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR) || theme.getColor(theme_1.SIDE_BAR_BACKGROUND);
        collector.addRule(`.monaco-workbench .part.sidebar .pane-body.integrated-terminal .terminal-outer-container { background-color: ${sidebarBackgroundColor ? sidebarBackgroundColor.toString() : ''}; }`);
        const borderColor = theme.getColor(terminalColorRegistry_1.TERMINAL_BORDER_COLOR);
        if (borderColor) {
            collector.addRule(`.monaco-workbench .pane-body.integrated-terminal .split-view-view:not(:first-child) { border-color: ${borderColor.toString()}; }`);
        }
    });
    let SwitchTerminalActionViewItem = class SwitchTerminalActionViewItem extends actionViewItems_1.SelectActionViewItem {
        constructor(action, _terminalService, _themeService, contextViewService) {
            super(null, action, getTerminalSelectOpenItems(_terminalService), _terminalService.activeTabIndex, contextViewService, { ariaLabel: nls.localize(3, null), optionsAsChildren: true });
            this._terminalService = _terminalService;
            this._themeService = _themeService;
            this._register(_terminalService.onInstancesChanged(() => this._updateItems(), this));
            this._register(_terminalService.onActiveTabChanged(() => this._updateItems(), this));
            this._register(_terminalService.onInstanceTitleChanged(() => this._updateItems(), this));
            this._register(_terminalService.onTabDisposed(() => this._updateItems(), this));
            this._register(_terminalService.onDidChangeConnectionState(() => this._updateItems(), this));
            this._register(_terminalService.onDidChangeAvailableProfiles(() => this._updateItems(), this));
            this._register((0, styler_1.attachSelectBoxStyler)(this.selectBox, this._themeService));
        }
        render(container) {
            super.render(container);
            container.classList.add('switch-terminal');
            this._register((0, styler_1.attachStylerCallback)(this._themeService, { selectBorder: colorRegistry_1.selectBorder }, colors => {
                container.style.borderColor = colors.selectBorder ? `${colors.selectBorder}` : '';
            }));
        }
        _updateItems() {
            const options = getTerminalSelectOpenItems(this._terminalService);
            this.setOptions(options, this._terminalService.activeTabIndex);
        }
    };
    SwitchTerminalActionViewItem = __decorate([
        __param(1, terminal_1.ITerminalService),
        __param(2, themeService_1.IThemeService),
        __param(3, contextView_1.IContextViewService)
    ], SwitchTerminalActionViewItem);
    function getTerminalSelectOpenItems(terminalService) {
        let items;
        if (terminalService.connectionState === 1 /* Connected */) {
            items = terminalService.getTabLabels().map(label => {
                return { text: label };
            });
        }
        else {
            items = [{ text: nls.localize(4, null) }];
        }
        items.push({ text: terminalActions_1.switchTerminalActionViewItemSeparator, isDisabled: true });
        items.push({ text: terminalActions_1.switchTerminalShowTabsTitle });
        return items;
    }
    let SingleTerminalTabActionViewItem = class SingleTerminalTabActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(action, _actions, _terminalService, _themeService, _contextMenuService) {
            super(undefined, Object.assign(Object.assign({}, action), { dispose: () => action.dispose(), run: async () => this._run(), label: getSingleTabLabel(_terminalService.getActiveInstance()) }));
            this._actions = _actions;
            this._terminalService = _terminalService;
            this._themeService = _themeService;
            this._contextMenuService = _contextMenuService;
            this._register(this._terminalService.onInstancePrimaryStatusChanged(() => this.updateLabel()));
            this._register(this._terminalService.onActiveInstanceChanged(() => this.updateLabel()));
            this._register(this._terminalService.onInstancesChanged(() => this.updateLabel()));
            this._register(this._terminalService.onInstanceTitleChanged(e => {
                if (e === this._terminalService.getActiveInstance()) {
                    this.updateLabel();
                }
            }));
        }
        updateLabel() {
            if (this.label) {
                const label = this.label;
                const instance = this._terminalService.getActiveInstance();
                if (!instance) {
                    (0, dom_1.reset)(label, '');
                    return;
                }
                label.classList.add('single-terminal-tab');
                let colorStyle = '';
                const primaryStatus = instance.statusList.primary;
                if (primaryStatus) {
                    const colorKey = (0, terminalStatusList_1.getColorForSeverity)(primaryStatus.severity);
                    this._themeService.getColorTheme();
                    const foundColor = this._themeService.getColorTheme().getColor(colorKey);
                    if (foundColor) {
                        colorStyle = foundColor.toString();
                    }
                }
                label.style.color = colorStyle;
                (0, dom_1.reset)(label, ...(0, iconLabels_1.renderLabelWithIcons)(getSingleTabLabel(instance)));
            }
        }
        _run() {
            this._contextMenuService.showContextMenu({
                getAnchor: () => this.element,
                getActions: () => this._actions,
                getActionsContext: () => this.label
            });
        }
    };
    SingleTerminalTabActionViewItem = __decorate([
        __param(2, terminal_1.ITerminalService),
        __param(3, themeService_1.IThemeService),
        __param(4, contextView_1.IContextMenuService)
    ], SingleTerminalTabActionViewItem);
    function getSingleTabLabel(instance) {
        var _a;
        if (!instance || !instance.title) {
            return '';
        }
        const primaryStatus = instance.statusList.primary;
        let label = `$(${(_a = instance.icon) === null || _a === void 0 ? void 0 : _a.id}) ${instance.title}`;
        if (instance.shellLaunchConfig.description) {
            label += ` (${instance.shellLaunchConfig.description})`;
        }
        if (primaryStatus === null || primaryStatus === void 0 ? void 0 : primaryStatus.icon) {
            label += ` $(${primaryStatus.icon.id})`;
        }
        return label;
    }
});
//# sourceMappingURL=terminalView.js.map