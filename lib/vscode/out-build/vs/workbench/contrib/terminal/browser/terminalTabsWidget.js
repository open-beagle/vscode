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
define(["require", "exports", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listWidget", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/workbench/contrib/terminal/browser/terminal", "vs/nls!vs/workbench/contrib/terminal/browser/terminalTabsWidget", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/actionbar/actionbar", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/codicons", "vs/base/common/actions", "vs/base/common/htmlContent", "vs/workbench/contrib/terminal/browser/terminalDecorationsProvider", "vs/workbench/browser/labels", "vs/workbench/services/decorations/browser/decorations", "vs/workbench/services/hover/browser/hover", "vs/base/common/severity", "vs/base/common/lifecycle"], function (require, exports, listService_1, listWidget_1, accessibility_1, configuration_1, contextkey_1, keybinding_1, themeService_1, terminal_1, nls_1, DOM, instantiation_1, actionbar_1, actions_1, menuEntryActionViewItem_1, terminal_2, codicons_1, actions_2, htmlContent_1, terminalDecorationsProvider_1, labels_1, decorations_1, hover_1, severity_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalTabsWidget = exports.MIDPOINT_WIDGET_WIDTH = exports.DEFAULT_TABS_WIDGET_WIDTH = exports.MIN_TABS_WIDGET_WIDTH = void 0;
    const $ = DOM.$;
    const TAB_HEIGHT = 22;
    exports.MIN_TABS_WIDGET_WIDTH = 46;
    exports.DEFAULT_TABS_WIDGET_WIDTH = 80;
    exports.MIDPOINT_WIDGET_WIDTH = (exports.MIN_TABS_WIDGET_WIDTH + exports.DEFAULT_TABS_WIDGET_WIDTH) / 2;
    let TerminalTabsWidget = class TerminalTabsWidget extends listService_1.WorkbenchObjectTree {
        constructor(container, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService, _terminalService, instantiationService, _decorationsService) {
            super('TerminalTabsTree', container, {
                getHeight: () => TAB_HEIGHT,
                getTemplateId: () => 'terminal.tabs'
            }, [instantiationService.createInstance(TerminalTabsRenderer, container, instantiationService.createInstance(labels_1.ResourceLabels, labels_1.DEFAULT_LABELS_CONTAINER), () => this.getSelection())], {
                horizontalScrolling: false,
                supportDynamicHeights: false,
                identityProvider: {
                    getId: e => e === null || e === void 0 ? void 0 : e.instanceId
                },
                accessibilityProvider: {
                    getAriaLabel: e => e === null || e === void 0 ? void 0 : e.title,
                    getWidgetAriaLabel: () => (0, nls_1.localize)(0, null)
                },
                styleController: id => new listWidget_1.DefaultStyleController(DOM.createStyleSheet(container), id),
                filter: undefined,
                smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: true,
                expandOnlyOnTwistieClick: true,
                selectionNavigation: true,
                additionalScrollHeight: TAB_HEIGHT
            }, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService);
            this._terminalService = _terminalService;
            this._terminalService.onInstancesChanged(() => this._render());
            this._terminalService.onInstanceTitleChanged(() => this._render());
            this._terminalService.onActiveInstanceChanged(e => {
                if (e) {
                    this.setSelection([e]);
                    this.reveal(e);
                }
            });
            this.onMouseDblClick(async () => {
                if (this.getFocus().length === 0) {
                    const instance = this._terminalService.createTerminal();
                    this._terminalService.setActiveInstance(instance);
                    await instance.focusWhenReady();
                }
            });
            this.onMouseClick(e => {
                var _a;
                // If focus mode is single click focus the element unless a multi-select in happening
                const focusMode = configurationService.getValue('terminal.integrated.tabs.focusMode');
                if (focusMode === 'singleClick') {
                    if (this.getSelection().length <= 1) {
                        (_a = e.element) === null || _a === void 0 ? void 0 : _a.focus(true);
                    }
                }
            });
            // Set the selection to whatever is right clicked if it is not inside the selection
            this.onContextMenu(e => {
                if (!e.element) {
                    this.setSelection([null]);
                    return;
                }
                const selection = this.getSelection();
                if (!selection || !selection.find(s => e.element === s)) {
                    this.setSelection([e.element]);
                }
            });
            this._terminalTabsSingleSelectedContextKey = terminal_2.KEYBINDING_CONTEXT_TERMINAL_TABS_SINGULAR_SELECTION.bindTo(contextKeyService);
            this.onDidChangeSelection(e => {
                this._terminalTabsSingleSelectedContextKey.set(e.elements.length === 1);
                if (this._terminalTabsSingleSelectedContextKey) {
                    const instance = e.elements[0];
                    if (!instance) {
                        return;
                    }
                    this._terminalService.setActiveInstance(instance);
                }
            });
            this.onDidChangeFocus(e => {
                this._terminalTabsSingleSelectedContextKey.set(e.elements.length === 1);
            });
            this.onDidOpen(async (e) => {
                const instance = e.element;
                if (!instance) {
                    return;
                }
                this._terminalService.setActiveInstance(instance);
                if (!e.editorOptions.preserveFocus) {
                    await instance.focusWhenReady();
                }
            });
            if (!this._decorationsProvider) {
                this._decorationsProvider = instantiationService.createInstance(terminalDecorationsProvider_1.TerminalDecorationsProvider);
                _decorationsService.registerDecorationsProvider(this._decorationsProvider);
            }
            this._terminalService.onInstancePrimaryStatusChanged(() => this._render());
            this._render();
        }
        _render() {
            this.setChildren(null, this._terminalService.terminalInstances.map(instance => {
                return {
                    element: instance,
                    collapsed: true,
                    collapsible: false
                };
            }));
        }
    };
    TerminalTabsWidget = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, listService_1.IListService),
        __param(3, themeService_1.IThemeService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, keybinding_1.IKeybindingService),
        __param(6, accessibility_1.IAccessibilityService),
        __param(7, terminal_1.ITerminalService),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, decorations_1.IDecorationsService)
    ], TerminalTabsWidget);
    exports.TerminalTabsWidget = TerminalTabsWidget;
    let TerminalTabsRenderer = class TerminalTabsRenderer {
        constructor(_container, _labels, _getSelection, _instantiationService, _terminalService, _hoverService, _configurationService, _keybindingService, _listService) {
            this._container = _container;
            this._labels = _labels;
            this._getSelection = _getSelection;
            this._instantiationService = _instantiationService;
            this._terminalService = _terminalService;
            this._hoverService = _hoverService;
            this._configurationService = _configurationService;
            this._keybindingService = _keybindingService;
            this._listService = _listService;
            this.templateId = 'terminal.tabs';
        }
        renderTemplate(container) {
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
            const element = DOM.append(container, $('.terminal-tabs-entry'));
            const context = {};
            const label = this._labels.create(element, {
                supportHighlights: true,
                supportDescriptionHighlights: true,
                supportIcons: true,
                hoverDelegate: {
                    delay: this._configurationService.getValue('workbench.hover.delay'),
                    showHover: options => {
                        return this._hoverService.showHover(Object.assign(Object.assign({}, options), { actions: context.hoverActions, hideOnHover: true }));
                    }
                }
            });
            const actionsContainer = DOM.append(label.element, $('.actions'));
            const actionBar = new actionbar_1.ActionBar(actionsContainer, {
                actionViewItemProvider: action => action instanceof actions_1.MenuItemAction
                    ? this._instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action)
                    : undefined
            });
            return {
                element,
                label,
                actionBar,
                context
            };
        }
        shouldHideText() {
            return this._container ? this._container.clientWidth < exports.MIDPOINT_WIDGET_WIDTH : false;
        }
        renderElement(node, index, template) {
            var _a, _b, _c, _d, _e;
            let instance = node.element;
            const tab = this._terminalService.getTabForInstance(instance);
            if (!tab) {
                throw new Error(`Could not find tab for instance "${instance.instanceId}"`);
            }
            const hasText = !this.shouldHideText();
            template.element.classList.toggle('has-text', hasText);
            let ariaLabel = '';
            let prefix = '';
            if (tab.terminalInstances.length > 1) {
                const terminalIndex = tab.terminalInstances.indexOf(instance);
                ariaLabel = (0, nls_1.localize)(1, null, instance.instanceId, instance.title, terminalIndex + 1, tab.terminalInstances.length);








                if (terminalIndex === 0) {
                    prefix = `┌ `;
                }
                else if (terminalIndex === tab.terminalInstances.length - 1) {
                    prefix = `└ `;
                }
                else {
                    prefix = `├ `;
                }
            }
            else {
                ariaLabel = (0, nls_1.localize)(2, null, instance.instanceId, instance.title);






            }
            let title = instance.title;
            const statuses = instance.statusList.statuses;
            template.context.hoverActions = [];
            for (const status of statuses) {
                title += `\n\n---\n\n${status.tooltip || status.id}`;
                if (status.hoverActions) {
                    template.context.hoverActions.push(...status.hoverActions);
                }
            }
            let label;
            if (!hasText) {
                template.actionBar.clear();
                const primaryStatus = instance.statusList.primary;
                if (primaryStatus && primaryStatus.severity >= severity_1.default.Warning) {
                    label = `${prefix}$(${((_a = primaryStatus.icon) === null || _a === void 0 ? void 0 : _a.id) || ((_b = instance.icon) === null || _b === void 0 ? void 0 : _b.id)})`;
                    ariaLabel = '';
                }
                else {
                    label = `${prefix}$(${(_c = instance.icon) === null || _c === void 0 ? void 0 : _c.id})`;
                }
            }
            else {
                this.fillActionBar(instance, template);
                label = `${prefix}$(${(_d = instance.icon) === null || _d === void 0 ? void 0 : _d.id})`;
                // Only add the title if the icon is set, this prevents the title jumping around for
                // example when launching with a ShellLaunchConfig.name and no icon
                if (instance.icon) {
                    label += ` ${instance.title}`;
                }
            }
            if (!template.elementDispoables) {
                template.elementDispoables = new lifecycle_1.DisposableStore();
            }
            // Kill terminal on middle click
            template.elementDispoables.add(DOM.addDisposableListener(template.element, DOM.EventType.AUXCLICK, e => {
                if (e.button === 1 /*middle*/) {
                    instance.dispose();
                }
            }));
            // Set aria lable to expose split information to screen reader
            (_e = template.label.element.querySelector('.label-name')) === null || _e === void 0 ? void 0 : _e.setAttribute('aria-label', ariaLabel);
            template.label.setResource({
                resource: instance.resource,
                name: label,
                description: hasText ? instance.shellLaunchConfig.description : undefined
            }, {
                fileDecorations: {
                    colors: true,
                    badges: hasText
                },
                title: {
                    markdown: new htmlContent_1.MarkdownString(title),
                    markdownNotSupportedFallback: undefined
                }
            });
        }
        disposeElement(element, index, templateData) {
            var _a;
            (_a = templateData.elementDispoables) === null || _a === void 0 ? void 0 : _a.dispose();
            templateData.elementDispoables = undefined;
        }
        disposeTemplate(templateData) {
        }
        fillActionBar(instance, template) {
            var _a;
            // If the instance is within the selection, split all selected
            const actions = [
                new actions_2.Action("workbench.action.terminal.splitInstance" /* SPLIT_INSTANCE */, (0, nls_1.localize)(3, null), themeService_1.ThemeIcon.asClassName(codicons_1.Codicon.splitHorizontal), true, async () => {
                    this._runForSelectionOrInstance(instance, e => this._terminalService.splitInstance(e));
                }),
                new actions_2.Action("workbench.action.terminal.killInstance" /* KILL_INSTANCE */, (0, nls_1.localize)(4, null), themeService_1.ThemeIcon.asClassName(codicons_1.Codicon.trashcan), true, async () => {
                    this._runForSelectionOrInstance(instance, e => e.dispose());
                })
            ];
            // TODO: Cache these in a way that will use the correct instance
            template.actionBar.clear();
            for (const action of actions) {
                template.actionBar.push(action, { icon: true, label: false, keybinding: (_a = this._keybindingService.lookupKeybinding(action.id)) === null || _a === void 0 ? void 0 : _a.getLabel() });
            }
        }
        _runForSelectionOrInstance(instance, callback) {
            var _a;
            const selection = this._getSelection();
            if (selection.includes(instance)) {
                for (const s of selection) {
                    if (s) {
                        callback(s);
                    }
                }
            }
            else {
                callback(instance);
            }
            this._terminalService.focusTabs();
            (_a = this._listService.lastFocusedList) === null || _a === void 0 ? void 0 : _a.focusNext();
        }
    };
    TerminalTabsRenderer = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, terminal_1.ITerminalService),
        __param(5, hover_1.IHoverService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, listService_1.IListService)
    ], TerminalTabsRenderer);
});
//# sourceMappingURL=terminalTabsWidget.js.map