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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/nls!vs/workbench/contrib/workspace/browser/workspaceTrustTree", "vs/platform/accessibility/common/accessibility", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/platform/theme/common/styler", "vs/base/browser/ui/list/list", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/button/button", "vs/base/common/async", "vs/base/common/uri", "vs/base/common/network", "vs/platform/label/common/label"], function (require, exports, dom_1, listWidget_1, color_1, event_1, lifecycle_1, types_1, nls_1, accessibility_1, commands_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, listService_1, opener_1, colorRegistry_1, themeService_1, settingsTree_1, settingsWidgets_1, styler_1, list_1, preferencesIcons_1, inputBox_1, button_1, async_1, uri_1, network_1, label_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustTreeModel = exports.WorkspaceTrustTree = exports.WorkspaceTrustSettingArrayRenderer = exports.WorkspaceTrustSettingsTreeEntry = void 0;
    class WorkspaceTrustSettingsTreeEntry {
        constructor(key, displayLabel, description, value) {
            this.setting = { key, description };
            this.displayLabel = displayLabel;
            this.value = value;
            this.id = key;
        }
    }
    exports.WorkspaceTrustSettingsTreeEntry = WorkspaceTrustSettingsTreeEntry;
    let WorkspaceTrustFolderSettingWidget = class WorkspaceTrustFolderSettingWidget extends settingsWidgets_1.AbstractListSettingWidget {
        constructor(container, labelService, themeService, contextViewService) {
            super(container, themeService, contextViewService);
            this.labelService = labelService;
        }
        getEmptyItem() {
            return uri_1.URI.file('');
        }
        getContainerClasses() {
            return ['workspace-trust-uri-setting-widget', 'setting-list-object-widget'];
        }
        getActionsForItem(item, idx) {
            return [
                {
                    class: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    enabled: true,
                    id: 'workbench.action.editListItem',
                    tooltip: this.getLocalizedStrings().editActionTooltip,
                    run: () => this.editSetting(idx)
                },
                {
                    class: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsRemoveIcon),
                    enabled: true,
                    id: 'workbench.action.removeListItem',
                    tooltip: this.getLocalizedStrings().deleteActionTooltip,
                    run: () => this._onDidChangeList.fire({ originalItem: item, item: undefined, targetIndex: idx })
                }
            ];
        }
        renderHeader() {
            const header = (0, dom_1.$)('.setting-list-row-header');
            const hostHeader = (0, dom_1.append)(header, (0, dom_1.$)('.setting-list-object-key'));
            const pathHeader = (0, dom_1.append)(header, (0, dom_1.$)('.setting-list-object-value'));
            const { hostHeaderText, pathHeaderText } = this.getLocalizedStrings();
            hostHeader.textContent = hostHeaderText;
            pathHeader.textContent = pathHeaderText;
            return header;
        }
        renderItem(item) {
            const rowElement = (0, dom_1.$)('.setting-list-row');
            rowElement.classList.add('setting-list-object-row');
            const hostElement = (0, dom_1.append)(rowElement, (0, dom_1.$)('.setting-list-object-key'));
            const pathElement = (0, dom_1.append)(rowElement, (0, dom_1.$)('.setting-list-object-value'));
            hostElement.textContent = item.authority ? this.labelService.getHostLabel(item.scheme, item.authority) : (0, nls_1.localize)(0, null);
            pathElement.textContent = item.scheme === network_1.Schemas.file ? uri_1.URI.revive(item).fsPath : item.path;
            return rowElement;
        }
        renderEdit(item, idx) {
            const rowElement = (0, dom_1.$)('.setting-list-edit-row');
            const hostElement = (0, dom_1.append)(rowElement, (0, dom_1.$)('.setting-list-object-key'));
            hostElement.textContent = item.authority ? this.labelService.getHostLabel(item.scheme, item.authority) : (0, nls_1.localize)(1, null);
            const updatedItem = () => {
                if (item.scheme === network_1.Schemas.file) {
                    return uri_1.URI.file(pathInput.value);
                }
                else {
                    return uri_1.URI.revive(item).with({ path: pathInput.value });
                }
            };
            const onKeyDown = (e) => {
                if (e.equals(3 /* Enter */)) {
                    this.handleItemChange(item, updatedItem(), idx);
                }
                else if (e.equals(9 /* Escape */)) {
                    this.cancelEdit();
                    e.preventDefault();
                }
                rowElement === null || rowElement === void 0 ? void 0 : rowElement.focus();
            };
            const pathInput = new inputBox_1.InputBox(rowElement, this.contextViewService, {
                placeholder: this.getLocalizedStrings().inputPlaceholder
            });
            pathInput.element.classList.add('setting-list-valueInput');
            this.listDisposables.add((0, styler_1.attachInputBoxStyler)(pathInput, this.themeService, {
                inputBackground: settingsWidgets_1.settingsSelectBackground,
                inputForeground: settingsWidgets_1.settingsTextInputForeground,
                inputBorder: settingsWidgets_1.settingsTextInputBorder
            }));
            this.listDisposables.add(pathInput);
            pathInput.value = item.scheme === network_1.Schemas.file ? uri_1.URI.revive(item).fsPath : item.path;
            this.listDisposables.add((0, dom_1.addStandardDisposableListener)(pathInput.inputElement, dom_1.EventType.KEY_DOWN, onKeyDown));
            const okButton = this._register(new button_1.Button(rowElement));
            okButton.label = (0, nls_1.localize)(2, null);
            okButton.element.classList.add('setting-list-ok-button');
            this.listDisposables.add((0, styler_1.attachButtonStyler)(okButton, this.themeService));
            this.listDisposables.add(okButton.onDidClick(() => this.handleItemChange(item, updatedItem(), idx)));
            const cancelButton = this._register(new button_1.Button(rowElement));
            cancelButton.label = (0, nls_1.localize)(3, null);
            cancelButton.element.classList.add('setting-list-cancel-button');
            this.listDisposables.add((0, styler_1.attachButtonStyler)(cancelButton, this.themeService));
            this.listDisposables.add(cancelButton.onDidClick(() => this.cancelEdit()));
            this.listDisposables.add((0, async_1.disposableTimeout)(() => {
                pathInput.focus();
                pathInput.select();
            }));
            return rowElement;
        }
        isItemNew(item) {
            return item.path === '';
        }
        getLocalizedRowTitle(item) {
            return (0, nls_1.localize)(4, null, this.labelService.getUriLabel(uri_1.URI.from(item)));
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(5, null),
                editActionTooltip: (0, nls_1.localize)(6, null),
                addButtonLabel: (0, nls_1.localize)(7, null),
                hostHeaderText: (0, nls_1.localize)(8, null),
                pathHeaderText: (0, nls_1.localize)(9, null),
                inputPlaceholder: (0, nls_1.localize)(10, null),
            };
        }
    };
    WorkspaceTrustFolderSettingWidget = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, themeService_1.IThemeService),
        __param(3, contextView_1.IContextViewService)
    ], WorkspaceTrustFolderSettingWidget);
    let WorkspaceTrustSettingArrayRenderer = class WorkspaceTrustSettingArrayRenderer extends lifecycle_1.Disposable {
        constructor(_themeService, _contextViewService, _openerService, _instantiationService, _commandService, _contextMenuService, _keybindingService, _configService) {
            super();
            this._themeService = _themeService;
            this._contextViewService = _contextViewService;
            this._openerService = _openerService;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this._configService = _configService;
            this.templateId = 'template.setting.array';
            this._onDidChangeSetting = this._register(new event_1.Emitter());
            this.onDidChangeSetting = this._onDidChangeSetting.event;
            this._onDidFocusSetting = this._register(new event_1.Emitter());
            this.onDidFocusSetting = this._onDidFocusSetting.event;
            this._onDidChangeIgnoredSettings = this._register(new event_1.Emitter());
            this.onDidChangeIgnoredSettings = this._onDidChangeIgnoredSettings.event;
        }
        renderCommonTemplate(tree, _container, typeClass) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-' + typeClass);
            const container = (0, dom_1.append)(_container, (0, dom_1.$)(WorkspaceTrustSettingArrayRenderer.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = (0, dom_1.append)(container, (0, dom_1.$)('.setting-item-title'));
            const labelCategoryContainer = (0, dom_1.append)(titleElement, (0, dom_1.$)('.setting-item-cat-label-container'));
            const labelElement = (0, dom_1.append)(labelCategoryContainer, (0, dom_1.$)('span.setting-item-label'));
            const descriptionElement = (0, dom_1.append)(container, (0, dom_1.$)('.setting-item-description'));
            const modifiedIndicatorElement = (0, dom_1.append)(container, (0, dom_1.$)('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)(11, null);
            const valueElement = (0, dom_1.append)(container, (0, dom_1.$)('.setting-item-value'));
            const controlElement = (0, dom_1.append)(valueElement, (0, dom_1.$)('div.setting-item-control'));
            const toDispose = new lifecycle_1.DisposableStore();
            const template = {
                toDispose,
                elementDisposables: new lifecycle_1.DisposableStore(),
                containerElement: container,
                labelElement,
                descriptionElement,
                controlElement
            };
            // Prevent clicks from being handled by list
            toDispose.add((0, dom_1.addDisposableListener)(controlElement, dom_1.EventType.MOUSE_DOWN, e => e.stopPropagation()));
            toDispose.add((0, dom_1.addDisposableListener)(titleElement, dom_1.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add((0, dom_1.addDisposableListener)(titleElement, dom_1.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        addSettingElementFocusHandler(template) {
            const focusTracker = (0, dom_1.trackFocus)(template.containerElement);
            template.toDispose.add(focusTracker);
            focusTracker.onDidBlur(() => {
                if (template.containerElement.classList.contains('focused')) {
                    template.containerElement.classList.remove('focused');
                }
            });
            focusTracker.onDidFocus(() => {
                template.containerElement.classList.add('focused');
                if (template.context) {
                    this._onDidFocusSetting.fire(template.context);
                }
            });
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = (0, dom_1.$)('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const listWidget = this._instantiationService.createInstance(WorkspaceTrustFolderSettingWidget, common.controlElement);
            listWidget.domNode.classList.add(WorkspaceTrustSettingArrayRenderer.CONTROL_CLASS);
            common.toDispose.add(listWidget);
            const template = Object.assign(Object.assign({}, common), { listWidget,
                validationErrorMessageElement });
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(listWidget.onDidChangeList(e => {
                const { list: newList, changeType } = this.computeNewList(template, e);
                if (newList !== null && template.onChange) {
                    template.onChange(newList, changeType);
                }
            }));
            return template;
        }
        computeNewList(template, e) {
            var _a, _b, _c;
            if (template.context) {
                let newValue = [];
                let changeType = 'changed';
                if ((0, types_1.isArray)(template.context.value)) {
                    newValue = [...template.context.value];
                }
                if (e.targetIndex !== undefined) {
                    // Delete value
                    if (!((_a = e.item) === null || _a === void 0 ? void 0 : _a.path) && e.originalItem.path && e.targetIndex > -1) {
                        newValue.splice(e.targetIndex, 1);
                        changeType = 'removed';
                    }
                    // Update value
                    else if (((_b = e.item) === null || _b === void 0 ? void 0 : _b.path) && e.originalItem.path) {
                        if (e.targetIndex > -1) {
                            newValue[e.targetIndex] = uri_1.URI.revive(e.item);
                            changeType = e.targetIndex < template.context.value.length ? 'changed' : 'added';
                        }
                        // For some reason, we are updating and cannot find original value
                        // Just append the value in this case
                        else {
                            newValue.push(uri_1.URI.revive(e.item));
                            changeType = 'added';
                        }
                    }
                    // Add value
                    else if (((_c = e.item) === null || _c === void 0 ? void 0 : _c.path) && !e.originalItem.path && e.targetIndex >= newValue.length) {
                        newValue.push(uri_1.URI.revive(e.item));
                        changeType = 'added';
                    }
                }
                return { list: newValue, changeType };
            }
            return { list: null, changeType: 'changed' };
        }
        renderElement(node, index, template) {
            const element = node.element;
            template.context = element;
            template.containerElement.setAttribute(WorkspaceTrustSettingArrayRenderer.SETTING_KEY_ATTR, element.setting.key);
            template.containerElement.setAttribute(WorkspaceTrustSettingArrayRenderer.SETTING_ID_ATTR, element.id);
            template.labelElement.textContent = element.displayLabel;
            template.descriptionElement.innerText = element.setting.description;
            const onChange = (value, type) => this._onDidChangeSetting.fire({ key: element.setting.key, value, type });
            this.renderValue(element, template, onChange);
        }
        renderValue(dataElement, template, onChange) {
            const value = getListDisplayValue(dataElement);
            template.listWidget.setValue(value);
            template.context = dataElement;
            template.onChange = (v, t) => {
                onChange(v, t);
                renderArrayValidations(dataElement, template, v, false);
            };
            renderArrayValidations(dataElement, template, value.map(v => uri_1.URI.revive(v)), true);
        }
        disposeTemplate(template) {
            (0, lifecycle_1.dispose)(template.toDispose);
        }
        disposeElement(_element, _index, template, _height) {
            if (template.elementDisposables) {
                template.elementDisposables.clear();
            }
        }
    };
    WorkspaceTrustSettingArrayRenderer.CONTROL_CLASS = 'setting-control-focus-target';
    WorkspaceTrustSettingArrayRenderer.CONTROL_SELECTOR = '.' + WorkspaceTrustSettingArrayRenderer.CONTROL_CLASS;
    WorkspaceTrustSettingArrayRenderer.CONTENTS_CLASS = 'setting-item-contents';
    WorkspaceTrustSettingArrayRenderer.CONTENTS_SELECTOR = '.' + WorkspaceTrustSettingArrayRenderer.CONTENTS_CLASS;
    WorkspaceTrustSettingArrayRenderer.ALL_ROWS_SELECTOR = '.monaco-list-row';
    WorkspaceTrustSettingArrayRenderer.SETTING_KEY_ATTR = 'data-key';
    WorkspaceTrustSettingArrayRenderer.SETTING_ID_ATTR = 'data-id';
    WorkspaceTrustSettingArrayRenderer.ELEMENT_FOCUSABLE_ATTR = 'data-focusable';
    WorkspaceTrustSettingArrayRenderer = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, contextView_1.IContextViewService),
        __param(2, opener_1.IOpenerService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, commands_1.ICommandService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, configuration_1.IConfigurationService)
    ], WorkspaceTrustSettingArrayRenderer);
    exports.WorkspaceTrustSettingArrayRenderer = WorkspaceTrustSettingArrayRenderer;
    let WorkspaceTrustTree = class WorkspaceTrustTree extends listService_1.WorkbenchObjectTree {
        constructor(container, renderers, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService, instantiationService) {
            super('WorkspaceTrustTree', container, new WorkspaceTrustTreeDelegate(), renderers, {
                horizontalScrolling: false,
                alwaysConsumeMouseWheel: false,
                supportDynamicHeights: true,
                identityProvider: {
                    getId(e) {
                        return e.id;
                    }
                },
                accessibilityProvider: new WorkspaceTrustTreeAccessibilityProvider(),
                styleController: id => new listWidget_1.DefaultStyleController((0, dom_1.createStyleSheet)(container), id),
                smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: false,
            }, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService);
            this.disposables.add((0, themeService_1.registerThemingParticipant)((theme, collector) => {
                const foregroundColor = theme.getColor(colorRegistry_1.foreground);
                if (foregroundColor) {
                    // Links appear inside other elements in markdown. CSS opacity acts like a mask. So we have to dynamically compute the description color to avoid
                    // applying an opacity to the link color.
                    const fgWithOpacity = new color_1.Color(new color_1.RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.9));
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-description { color: ${fgWithOpacity}; }`);
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .settings-toc-container .monaco-list-row:not(.selected) { color: ${fgWithOpacity}; }`);
                    // Hack for subpixel antialiasing
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-title .setting-item-overrides,
					.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-title .setting-item-ignored { color: ${fgWithOpacity}; }`);
                }
                const errorColor = theme.getColor(colorRegistry_1.errorForeground);
                if (errorColor) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-deprecation-message { color: ${errorColor}; }`);
                }
                const invalidInputBackground = theme.getColor(colorRegistry_1.inputValidationErrorBackground);
                if (invalidInputBackground) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-validation-message { background-color: ${invalidInputBackground}; }`);
                }
                const invalidInputForeground = theme.getColor(colorRegistry_1.inputValidationErrorForeground);
                if (invalidInputForeground) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-validation-message { color: ${invalidInputForeground}; }`);
                }
                const invalidInputBorder = theme.getColor(colorRegistry_1.inputValidationErrorBorder);
                if (invalidInputBorder) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-validation-message { border-style:solid; border-width: 1px; border-color: ${invalidInputBorder}; }`);
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item.invalid-input .setting-item-control .monaco-inputbox.idle { outline-width: 0; border-style:solid; border-width: 1px; border-color: ${invalidInputBorder}; }`);
                }
                const focusedRowBackgroundColor = theme.getColor(settingsWidgets_1.focusedRowBackground);
                if (focusedRowBackgroundColor) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .monaco-list-row.focused .settings-row-inner-container { background-color: ${focusedRowBackgroundColor}; }`);
                }
                const rowHoverBackgroundColor = theme.getColor(settingsWidgets_1.rowHoverBackground);
                if (rowHoverBackgroundColor) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .monaco-list-row:not(.focused) .settings-row-inner-container:hover { background-color: ${rowHoverBackgroundColor}; }`);
                }
                const focusedRowBorderColor = theme.getColor(settingsWidgets_1.focusedRowBorder);
                if (focusedRowBorderColor) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .monaco-list:focus-within .monaco-list-row.focused .setting-item-contents::before,
					.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .monaco-list:focus-within .monaco-list-row.focused .setting-item-contents::after { border-top: 1px solid ${focusedRowBorderColor} }`);
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .monaco-list:focus-within .monaco-list-row.focused .settings-group-title-label::before,
					.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .monaco-list:focus-within .monaco-list-row.focused .settings-group-title-label::after { border-top: 1px solid ${focusedRowBorderColor} }`);
                }
                const headerForegroundColor = theme.getColor(settingsWidgets_1.settingsHeaderForeground);
                if (headerForegroundColor) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .settings-group-title-label { color: ${headerForegroundColor}; }`);
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-label { color: ${headerForegroundColor}; }`);
                }
                const focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
                if (focusBorderColor) {
                    collector.addRule(`.workspace-trust-editor .workspace-trust-settings .workspace-trust-settings-tree-container .setting-item-contents .setting-item-markdown a:focus { outline-color: ${focusBorderColor} }`);
                }
            }));
            this.getHTMLElement().classList.add('settings-editor-tree');
            this.disposables.add((0, styler_1.attachStyler)(themeService, {
                listBackground: colorRegistry_1.editorBackground,
                listActiveSelectionBackground: colorRegistry_1.editorBackground,
                listActiveSelectionForeground: colorRegistry_1.foreground,
                listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                listFocusAndSelectionForeground: colorRegistry_1.foreground,
                listFocusBackground: colorRegistry_1.editorBackground,
                listFocusForeground: colorRegistry_1.foreground,
                listHoverForeground: colorRegistry_1.foreground,
                listHoverBackground: colorRegistry_1.editorBackground,
                listHoverOutline: colorRegistry_1.editorBackground,
                listFocusOutline: colorRegistry_1.editorBackground,
                listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                listInactiveSelectionForeground: colorRegistry_1.foreground,
                listInactiveFocusBackground: colorRegistry_1.editorBackground,
                listInactiveFocusOutline: colorRegistry_1.editorBackground
            }, colors => {
                this.style(colors);
            }));
            this.disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.list.smoothScrolling')) {
                    this.updateOptions({
                        smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling')
                    });
                }
            }));
        }
        createModel(user, view, options) {
            return new settingsTree_1.NonCollapsibleObjectTreeModel(user, view, options);
        }
    };
    WorkspaceTrustTree = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, listService_1.IListService),
        __param(4, themeService_1.IThemeService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, accessibility_1.IAccessibilityService),
        __param(8, instantiation_1.IInstantiationService)
    ], WorkspaceTrustTree);
    exports.WorkspaceTrustTree = WorkspaceTrustTree;
    class WorkspaceTrustTreeModel {
        constructor() {
            this.settings = [];
        }
        update(trustedFolders) {
            this.settings = [];
            this.settings.push(new WorkspaceTrustSettingsTreeEntry('trustedFolders', (0, nls_1.localize)(12, null), (0, nls_1.localize)(13, null), trustedFolders));
        }
    }
    exports.WorkspaceTrustTreeModel = WorkspaceTrustTreeModel;
    class WorkspaceTrustTreeAccessibilityProvider {
        getAriaLabel(element) {
            if (element instanceof WorkspaceTrustSettingsTreeEntry) {
                return `element.displayLabel`;
            }
            return null;
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(14, null);
        }
    }
    class WorkspaceTrustTreeDelegate extends list_1.CachedListVirtualDelegate {
        getTemplateId(element) {
            return 'template.setting.array';
        }
        hasDynamicHeight(element) {
            return true;
        }
        estimateHeight(element) {
            return 104;
        }
    }
    function getListDisplayValue(element) {
        if (!element.value || !(0, types_1.isArray)(element.value)) {
            return [];
        }
        return element.value;
    }
    function renderArrayValidations(dataElement, template, v, arg3) {
    }
});
//# sourceMappingURL=workspaceTrustTree.js.map