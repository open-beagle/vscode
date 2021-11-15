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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/button/button", "vs/base/browser/ui/checkbox/checkbox", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/list/list", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/selectBox/selectBox", "vs/base/browser/ui/toolbar/toolbar", "vs/base/browser/ui/tree/objectTreeModel", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/types", "vs/nls!vs/workbench/contrib/preferences/browser/settingsTree", "vs/platform/clipboard/common/clipboardService", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/platform/userDataSync/common/settingsMerge", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/preferences/common/preferences", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/preferences/common/preferencesValidation", "vs/base/common/codicons", "vs/base/browser/ui/iconLabel/simpleIconLabel", "vs/platform/list/browser/listService", "vs/platform/contextkey/common/contextkey", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/workbench/contrib/workspace/browser/workspaceTrustColors"], function (require, exports, canIUse_1, DOM, markdownRenderer_1, aria_1, button_1, checkbox_1, inputBox_1, list_1, listWidget_1, selectBox_1, toolbar_1, objectTreeModel_1, actions_1, arrays, color_1, errors_1, event_1, lifecycle_1, platform_1, strings_1, types_1, nls_1, clipboardService_1, commands_1, configuration_1, contextView_1, instantiation_1, keybinding_1, opener_1, colorRegistry_1, styler_1, themeService_1, settingsMerge_1, settingsTreeModels_1, settingsWidgets_1, preferences_1, environmentService_1, preferences_2, userDataSync_1, preferencesValidation_1, codicons_1, simpleIconLabel_1, listService_1, contextkey_1, accessibility_1, preferencesIcons_1, workspaceTrustColors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsTree = exports.NonCollapsibleObjectTreeModel = exports.SettingsTreeFilter = exports.SettingTreeRenderers = exports.SettingUntrustedRenderer = exports.SettingBoolRenderer = exports.SettingNumberRenderer = exports.SettingEnumRenderer = exports.SettingTextRenderer = exports.SettingExcludeRenderer = exports.SettingObjectRenderer = exports.SettingArrayRenderer = exports.SettingComplexRenderer = exports.SettingNewExtensionsRenderer = exports.SettingGroupRenderer = exports.AbstractSettingRenderer = exports.createSettingMatchRegExp = exports.resolveExtensionsSettings = exports.resolveConfiguredUntrustedSettings = exports.resolveSettingsTree = void 0;
    const $ = DOM.$;
    function getExcludeDisplayValue(element) {
        const data = element.isConfigured ? Object.assign(Object.assign({}, element.defaultValue), element.scopeValue) :
            element.defaultValue;
        return Object.keys(data)
            .filter(key => !!data[key])
            .map(key => {
            const value = data[key];
            const sibling = typeof value === 'boolean' ? undefined : value.when;
            return {
                id: key,
                value: key,
                sibling
            };
        });
    }
    function areAllPropertiesDefined(properties, itemsToDisplay) {
        const staticProperties = new Set(properties);
        itemsToDisplay.forEach(({ key }) => staticProperties.delete(key.data));
        return staticProperties.size === 0;
    }
    function getEnumOptionsFromSchema(schema) {
        var _a, _b;
        if (schema.anyOf) {
            return arrays.flatten(schema.anyOf.map(getEnumOptionsFromSchema));
        }
        const enumDescriptions = (_a = schema.enumDescriptions) !== null && _a !== void 0 ? _a : [];
        return ((_b = schema.enum) !== null && _b !== void 0 ? _b : []).map((value, idx) => {
            const description = idx < enumDescriptions.length
                ? enumDescriptions[idx]
                : undefined;
            return { value, description };
        });
    }
    function getObjectValueType(schema) {
        if (schema.anyOf) {
            const subTypes = schema.anyOf.map(getObjectValueType);
            if (subTypes.some(type => type === 'enum')) {
                return 'enum';
            }
            return 'string';
        }
        if (schema.type === 'boolean') {
            return 'boolean';
        }
        else if (schema.type === 'string' && (0, types_1.isDefined)(schema.enum) && schema.enum.length > 0) {
            return 'enum';
        }
        else {
            return 'string';
        }
    }
    function getObjectDisplayValue(element) {
        var _a, _b;
        const elementDefaultValue = typeof element.defaultValue === 'object'
            ? (_a = element.defaultValue) !== null && _a !== void 0 ? _a : {}
            : {};
        const elementScopeValue = typeof element.scopeValue === 'object'
            ? (_b = element.scopeValue) !== null && _b !== void 0 ? _b : {}
            : {};
        const data = element.isConfigured ? Object.assign(Object.assign({}, elementDefaultValue), elementScopeValue) :
            elementDefaultValue;
        const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
        const patternsAndSchemas = Object
            .entries(objectPatternProperties !== null && objectPatternProperties !== void 0 ? objectPatternProperties : {})
            .map(([pattern, schema]) => ({
            pattern: new RegExp(pattern),
            schema
        }));
        const additionalValueEnums = getEnumOptionsFromSchema(typeof objectAdditionalProperties === 'boolean'
            ? {}
            : objectAdditionalProperties !== null && objectAdditionalProperties !== void 0 ? objectAdditionalProperties : {});
        const wellDefinedKeyEnumOptions = Object.entries(objectProperties !== null && objectProperties !== void 0 ? objectProperties : {}).map(([key, schema]) => ({ value: key, description: schema.description }));
        return Object.keys(data).map(key => {
            var _a;
            if ((0, types_1.isDefined)(objectProperties) && key in objectProperties) {
                const defaultValue = elementDefaultValue[key];
                const valueEnumOptions = getEnumOptionsFromSchema(objectProperties[key]);
                return {
                    key: {
                        type: 'enum',
                        data: key,
                        options: wellDefinedKeyEnumOptions,
                    },
                    value: {
                        type: getObjectValueType(objectProperties[key]),
                        data: data[key],
                        options: valueEnumOptions,
                    },
                    removable: (0, types_1.isUndefinedOrNull)(defaultValue),
                };
            }
            const schema = (_a = patternsAndSchemas.find(({ pattern }) => pattern.test(key))) === null || _a === void 0 ? void 0 : _a.schema;
            if (schema) {
                const valueEnumOptions = getEnumOptionsFromSchema(schema);
                return {
                    key: { type: 'string', data: key },
                    value: {
                        type: getObjectValueType(schema),
                        data: data[key],
                        options: valueEnumOptions,
                    },
                    removable: true,
                };
            }
            return {
                key: { type: 'string', data: key },
                value: {
                    type: typeof objectAdditionalProperties === 'object' ? getObjectValueType(objectAdditionalProperties) : 'string',
                    data: data[key],
                    options: additionalValueEnums,
                },
                removable: true,
            };
        });
    }
    function createObjectKeySuggester(element) {
        const { objectProperties } = element.setting;
        const allStaticKeys = Object.keys(objectProperties !== null && objectProperties !== void 0 ? objectProperties : {});
        return keys => {
            const existingKeys = new Set(keys);
            const enumOptions = [];
            allStaticKeys.forEach(staticKey => {
                if (!existingKeys.has(staticKey)) {
                    enumOptions.push({ value: staticKey, description: objectProperties[staticKey].description });
                }
            });
            return enumOptions.length > 0
                ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
                : undefined;
        };
    }
    function createObjectValueSuggester(element) {
        const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
        const patternsAndSchemas = Object
            .entries(objectPatternProperties !== null && objectPatternProperties !== void 0 ? objectPatternProperties : {})
            .map(([pattern, schema]) => ({
            pattern: new RegExp(pattern),
            schema
        }));
        return (key) => {
            var _a, _b, _c, _d;
            let suggestedSchema;
            if ((0, types_1.isDefined)(objectProperties) && key in objectProperties) {
                suggestedSchema = objectProperties[key];
            }
            const patternSchema = suggestedSchema !== null && suggestedSchema !== void 0 ? suggestedSchema : (_a = patternsAndSchemas.find(({ pattern }) => pattern.test(key))) === null || _a === void 0 ? void 0 : _a.schema;
            if ((0, types_1.isDefined)(patternSchema)) {
                suggestedSchema = patternSchema;
            }
            else if ((0, types_1.isDefined)(objectAdditionalProperties) && typeof objectAdditionalProperties === 'object') {
                suggestedSchema = objectAdditionalProperties;
            }
            if ((0, types_1.isDefined)(suggestedSchema)) {
                const type = getObjectValueType(suggestedSchema);
                if (type === 'boolean') {
                    return { type, data: (_b = suggestedSchema.default) !== null && _b !== void 0 ? _b : true };
                }
                else if (type === 'enum') {
                    const options = getEnumOptionsFromSchema(suggestedSchema);
                    return { type, data: (_c = suggestedSchema.default) !== null && _c !== void 0 ? _c : options[0].value, options };
                }
                else {
                    return { type, data: (_d = suggestedSchema.default) !== null && _d !== void 0 ? _d : '' };
                }
            }
            return;
        };
    }
    function getListDisplayValue(element) {
        if (!element.value || !(0, types_1.isArray)(element.value)) {
            return [];
        }
        return element.value.map((key) => {
            return {
                value: key
            };
        });
    }
    function resolveSettingsTree(tocData, coreSettingsGroups, logService) {
        const allSettings = getFlatSettings(coreSettingsGroups);
        return {
            tree: _resolveSettingsTree(tocData, allSettings, logService),
            leftoverSettings: allSettings
        };
    }
    exports.resolveSettingsTree = resolveSettingsTree;
    function resolveConfiguredUntrustedSettings(groups, target, configurationService) {
        const allSettings = getFlatSettings(groups);
        return [...allSettings].filter(setting => setting.restricted && (0, settingsTreeModels_1.inspectSetting)(setting.key, target, configurationService).isConfigured);
    }
    exports.resolveConfiguredUntrustedSettings = resolveConfiguredUntrustedSettings;
    function resolveExtensionsSettings(groups) {
        const settingsGroupToEntry = (group) => {
            const flatSettings = arrays.flatten(group.sections.map(section => section.settings));
            return {
                id: group.id,
                label: group.title,
                settings: flatSettings
            };
        };
        const extGroups = groups
            .sort((a, b) => a.title.localeCompare(b.title))
            .map(g => settingsGroupToEntry(g));
        return {
            id: 'extensions',
            label: (0, nls_1.localize)(0, null),
            children: extGroups
        };
    }
    exports.resolveExtensionsSettings = resolveExtensionsSettings;
    function _resolveSettingsTree(tocData, allSettings, logService) {
        let children;
        if (tocData.children) {
            children = tocData.children
                .map(child => _resolveSettingsTree(child, allSettings, logService))
                .filter(child => (child.children && child.children.length) || (child.settings && child.settings.length));
        }
        let settings;
        if (tocData.settings) {
            settings = arrays.flatten(tocData.settings.map(pattern => getMatchingSettings(allSettings, pattern, logService)));
        }
        if (!children && !settings) {
            throw new Error(`TOC node has no child groups or settings: ${tocData.id}`);
        }
        return {
            id: tocData.id,
            label: tocData.label,
            children,
            settings
        };
    }
    const knownDynamicSettingGroups = [
        /^settingsSync\..*/,
        /^sync\..*/,
        /^workbench.fontAliasing$/,
    ];
    function getMatchingSettings(allSettings, pattern, logService) {
        const result = [];
        allSettings.forEach(s => {
            if (settingMatches(s, pattern)) {
                result.push(s);
                allSettings.delete(s);
            }
        });
        if (!result.length && !knownDynamicSettingGroups.some(r => r.test(pattern))) {
            logService.warn(`Settings pattern "${pattern}" doesn't match any settings`);
        }
        return result.sort((a, b) => a.key.localeCompare(b.key));
    }
    const settingPatternCache = new Map();
    function createSettingMatchRegExp(pattern) {
        pattern = (0, strings_1.escapeRegExpCharacters)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    exports.createSettingMatchRegExp = createSettingMatchRegExp;
    function settingMatches(s, pattern) {
        let regExp = settingPatternCache.get(pattern);
        if (!regExp) {
            regExp = createSettingMatchRegExp(pattern);
            settingPatternCache.set(pattern, regExp);
        }
        return regExp.test(s.key);
    }
    function getFlatSettings(settingsGroups) {
        const result = new Set();
        for (const group of settingsGroups) {
            for (const section of group.sections) {
                for (const s of section.settings) {
                    if (!s.overrides || !s.overrides.length) {
                        result.add(s);
                    }
                }
            }
        }
        return result;
    }
    const SETTINGS_UNTRUSTED_TEMPLATE_ID = 'settings.untrusted.template';
    const SETTINGS_TEXT_TEMPLATE_ID = 'settings.text.template';
    const SETTINGS_NUMBER_TEMPLATE_ID = 'settings.number.template';
    const SETTINGS_ENUM_TEMPLATE_ID = 'settings.enum.template';
    const SETTINGS_BOOL_TEMPLATE_ID = 'settings.bool.template';
    const SETTINGS_ARRAY_TEMPLATE_ID = 'settings.array.template';
    const SETTINGS_EXCLUDE_TEMPLATE_ID = 'settings.exclude.template';
    const SETTINGS_OBJECT_TEMPLATE_ID = 'settings.object.template';
    const SETTINGS_COMPLEX_TEMPLATE_ID = 'settings.complex.template';
    const SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID = 'settings.newExtensions.template';
    const SETTINGS_ELEMENT_TEMPLATE_ID = 'settings.group.template';
    function removeChildrenFromTabOrder(node) {
        const focusableElements = node.querySelectorAll(`
		[tabindex="0"],
		input:not([tabindex="-1"]),
		select:not([tabindex="-1"]),
		textarea:not([tabindex="-1"]),
		a:not([tabindex="-1"]),
		button:not([tabindex="-1"]),
		area:not([tabindex="-1"])
	`);
        focusableElements.forEach(element => {
            element.setAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR, 'true');
            element.setAttribute('tabindex', '-1');
        });
    }
    function addChildrenToTabOrder(node) {
        const focusableElements = node.querySelectorAll(`[${AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR}="true"]`);
        focusableElements.forEach(element => {
            element.removeAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR);
            element.setAttribute('tabindex', '0');
        });
    }
    let AbstractSettingRenderer = class AbstractSettingRenderer extends lifecycle_1.Disposable {
        constructor(settingActions, disposableActionFactory, _themeService, _contextViewService, _openerService, _instantiationService, _commandService, _contextMenuService, _keybindingService, _configService) {
            super();
            this.settingActions = settingActions;
            this.disposableActionFactory = disposableActionFactory;
            this._themeService = _themeService;
            this._contextViewService = _contextViewService;
            this._openerService = _openerService;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this._configService = _configService;
            this._onDidClickOverrideElement = this._register(new event_1.Emitter());
            this.onDidClickOverrideElement = this._onDidClickOverrideElement.event;
            this._onDidChangeSetting = this._register(new event_1.Emitter());
            this.onDidChangeSetting = this._onDidChangeSetting.event;
            this._onDidOpenSettings = this._register(new event_1.Emitter());
            this.onDidOpenSettings = this._onDidOpenSettings.event;
            this._onDidClickSettingLink = this._register(new event_1.Emitter());
            this.onDidClickSettingLink = this._onDidClickSettingLink.event;
            this._onDidFocusSetting = this._register(new event_1.Emitter());
            this.onDidFocusSetting = this._onDidFocusSetting.event;
            this._onDidChangeIgnoredSettings = this._register(new event_1.Emitter());
            this.onDidChangeIgnoredSettings = this._onDidChangeIgnoredSettings.event;
            this.ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this._configService);
            this._register(this._configService.onDidChangeConfiguration(e => {
                if (e.affectedKeys.includes('settingsSync.ignoredSettings')) {
                    this.ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this._configService);
                    this._onDidChangeIgnoredSettings.fire();
                }
            }));
        }
        createSyncIgnoredElement(container) {
            const syncIgnoredElement = DOM.append(container, $('span.setting-item-ignored'));
            const syncIgnoredLabel = new simpleIconLabel_1.SimpleIconLabel(syncIgnoredElement);
            syncIgnoredLabel.text = `($(sync-ignored) ${(0, nls_1.localize)(1, null)})`;
            return syncIgnoredElement;
        }
        renderCommonTemplate(tree, _container, typeClass) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-' + typeClass);
            const container = DOM.append(_container, $(AbstractSettingRenderer.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.append(container, $('.setting-item-title'));
            const labelCategoryContainer = DOM.append(titleElement, $('.setting-item-cat-label-container'));
            const categoryElement = DOM.append(labelCategoryContainer, $('span.setting-item-category'));
            const labelElement = DOM.append(labelCategoryContainer, $('span.setting-item-label'));
            const otherOverridesElement = DOM.append(titleElement, $('span.setting-item-overrides'));
            const syncIgnoredElement = this.createSyncIgnoredElement(titleElement);
            const descriptionElement = DOM.append(container, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)(2, null);
            const valueElement = DOM.append(container, $('.setting-item-value'));
            const controlElement = DOM.append(valueElement, $('div.setting-item-control'));
            const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
            const toDispose = new lifecycle_1.DisposableStore();
            const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
            const toolbar = this.renderSettingToolbar(toolbarContainer);
            const template = {
                toDispose,
                elementDisposables: new lifecycle_1.DisposableStore(),
                containerElement: container,
                categoryElement,
                labelElement,
                descriptionElement,
                controlElement,
                deprecationWarningElement,
                otherOverridesElement,
                syncIgnoredElement,
                toolbar
            };
            // Prevent clicks from being handled by list
            toDispose.add(DOM.addDisposableListener(controlElement, DOM.EventType.MOUSE_DOWN, e => e.stopPropagation()));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        addSettingElementFocusHandler(template) {
            const focusTracker = DOM.trackFocus(template.containerElement);
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
        renderSettingToolbar(container) {
            const toggleMenuKeybinding = this._keybindingService.lookupKeybinding(preferences_1.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU);
            let toggleMenuTitle = (0, nls_1.localize)(3, null);
            if (toggleMenuKeybinding) {
                toggleMenuTitle += ` (${toggleMenuKeybinding && toggleMenuKeybinding.getLabel()})`;
            }
            const toolbar = new toolbar_1.ToolBar(container, this._contextMenuService, {
                toggleMenuTitle,
                renderDropdownAsChildElement: true,
                moreIcon: preferencesIcons_1.settingsMoreActionIcon // change icon from ellipsis to gear
            });
            return toolbar;
        }
        renderSettingElement(node, index, template) {
            const element = node.element;
            template.context = element;
            template.toolbar.context = element;
            const actions = this.disposableActionFactory(element.setting);
            actions.forEach(a => { var _a; return (_a = template.elementDisposables) === null || _a === void 0 ? void 0 : _a.add(a); });
            template.toolbar.setActions([], [...this.settingActions, ...actions]);
            const setting = element.setting;
            template.containerElement.classList.toggle('is-configured', element.isConfigured);
            template.containerElement.setAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR, element.setting.key);
            template.containerElement.setAttribute(AbstractSettingRenderer.SETTING_ID_ATTR, element.id);
            const titleTooltip = setting.key + (element.isConfigured ? ' - Modified' : '');
            template.categoryElement.textContent = element.displayCategory && (element.displayCategory + ': ');
            template.categoryElement.title = titleTooltip;
            template.labelElement.textContent = element.displayLabel;
            template.labelElement.title = titleTooltip;
            template.descriptionElement.innerText = '';
            if (element.setting.descriptionIsMarkdown) {
                const disposables = new lifecycle_1.DisposableStore();
                template.toDispose.add(disposables);
                const renderedDescription = this.renderSettingMarkdown(element, element.description, disposables);
                template.descriptionElement.appendChild(renderedDescription);
            }
            else {
                template.descriptionElement.innerText = element.description;
            }
            template.otherOverridesElement.innerText = '';
            template.otherOverridesElement.style.display = 'none';
            if (element.overriddenScopeList.length) {
                template.otherOverridesElement.style.display = 'inline';
                const otherOverridesLabel = element.isConfigured ?
                    (0, nls_1.localize)(4, null) :
                    (0, nls_1.localize)(5, null);
                DOM.append(template.otherOverridesElement, $('span', undefined, `(${otherOverridesLabel}: `));
                for (let i = 0; i < element.overriddenScopeList.length; i++) {
                    const view = DOM.append(template.otherOverridesElement, $('a.modified-scope', undefined, element.overriddenScopeList[i]));
                    if (i !== element.overriddenScopeList.length - 1) {
                        DOM.append(template.otherOverridesElement, $('span', undefined, ', '));
                    }
                    else {
                        DOM.append(template.otherOverridesElement, $('span', undefined, ')'));
                    }
                    template.elementDisposables.add(DOM.addStandardDisposableListener(view, DOM.EventType.CLICK, (e) => {
                        this._onDidClickOverrideElement.fire({
                            targetKey: element.setting.key,
                            scope: element.overriddenScopeList[i]
                        });
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                }
            }
            const onChange = (value) => this._onDidChangeSetting.fire({ key: element.setting.key, value, type: template.context.valueType });
            const deprecationText = element.setting.deprecationMessage || '';
            if (deprecationText && element.setting.deprecationMessageIsMarkdown) {
                const disposables = new lifecycle_1.DisposableStore();
                template.elementDisposables.add(disposables);
                template.deprecationWarningElement.innerText = '';
                template.deprecationWarningElement.appendChild(this.renderSettingMarkdown(element, element.setting.deprecationMessage, template.elementDisposables));
            }
            else {
                template.deprecationWarningElement.innerText = deprecationText;
            }
            template.containerElement.classList.toggle('is-deprecated', !!deprecationText);
            this.renderValue(element, template, onChange);
            const update = () => {
                template.syncIgnoredElement.style.display = this.ignoredSettings.includes(element.setting.key) ? 'inline' : 'none';
            };
            update();
            template.elementDisposables.add(this.onDidChangeIgnoredSettings(() => {
                update();
            }));
            this.updateSettingTabbable(element, template);
            template.elementDisposables.add(element.onDidChangeTabbable(() => {
                this.updateSettingTabbable(element, template);
            }));
        }
        updateSettingTabbable(element, template) {
            if (element.tabbable) {
                addChildrenToTabOrder(template.containerElement);
            }
            else {
                removeChildrenFromTabOrder(template.containerElement);
            }
        }
        renderSettingMarkdown(element, text, disposeables) {
            // Rewrite `#editor.fontSize#` to link format
            text = fixSettingLinks(text);
            const renderedMarkdown = (0, markdownRenderer_1.renderMarkdown)({ value: text, isTrusted: true }, {
                actionHandler: {
                    callback: (content) => {
                        if (content.startsWith('#')) {
                            const e = {
                                source: element,
                                targetKey: content.substr(1)
                            };
                            this._onDidClickSettingLink.fire(e);
                        }
                        else {
                            this._openerService.open(content, { allowCommands: true }).catch(errors_1.onUnexpectedError);
                        }
                    },
                    disposeables
                }
            });
            renderedMarkdown.classList.add('setting-item-markdown');
            cleanRenderedMarkdown(renderedMarkdown);
            return renderedMarkdown;
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
    AbstractSettingRenderer.CONTROL_CLASS = 'setting-control-focus-target';
    AbstractSettingRenderer.CONTROL_SELECTOR = '.' + AbstractSettingRenderer.CONTROL_CLASS;
    AbstractSettingRenderer.CONTENTS_CLASS = 'setting-item-contents';
    AbstractSettingRenderer.CONTENTS_SELECTOR = '.' + AbstractSettingRenderer.CONTENTS_CLASS;
    AbstractSettingRenderer.ALL_ROWS_SELECTOR = '.monaco-list-row';
    AbstractSettingRenderer.SETTING_KEY_ATTR = 'data-key';
    AbstractSettingRenderer.SETTING_ID_ATTR = 'data-id';
    AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR = 'data-focusable';
    AbstractSettingRenderer = __decorate([
        __param(2, themeService_1.IThemeService),
        __param(3, contextView_1.IContextViewService),
        __param(4, opener_1.IOpenerService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, commands_1.ICommandService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, keybinding_1.IKeybindingService),
        __param(9, configuration_1.IConfigurationService)
    ], AbstractSettingRenderer);
    exports.AbstractSettingRenderer = AbstractSettingRenderer;
    class SettingGroupRenderer {
        constructor() {
            this.templateId = SETTINGS_ELEMENT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            container.classList.add('group-title');
            const template = {
                parent: container,
                toDispose: new lifecycle_1.DisposableStore()
            };
            return template;
        }
        renderElement(element, index, templateData) {
            templateData.parent.innerText = '';
            const labelElement = DOM.append(templateData.parent, $('div.settings-group-title-label.settings-row-inner-container'));
            labelElement.classList.add(`settings-group-level-${element.element.level}`);
            labelElement.textContent = element.element.label;
            if (element.element.isFirstGroup) {
                labelElement.classList.add('settings-group-first');
            }
        }
        disposeTemplate(templateData) {
        }
    }
    exports.SettingGroupRenderer = SettingGroupRenderer;
    let SettingNewExtensionsRenderer = class SettingNewExtensionsRenderer {
        constructor(_themeService, _commandService) {
            this._themeService = _themeService;
            this._commandService = _commandService;
            this.templateId = SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const toDispose = new lifecycle_1.DisposableStore();
            container.classList.add('setting-item-new-extensions');
            const button = new button_1.Button(container, { title: true, buttonBackground: undefined, buttonHoverBackground: undefined });
            toDispose.add(button);
            toDispose.add(button.onDidClick(() => {
                if (template.context) {
                    this._commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', template.context.extensionIds);
                }
            }));
            button.label = (0, nls_1.localize)(6, null);
            button.element.classList.add('settings-new-extensions-button');
            toDispose.add((0, styler_1.attachButtonStyler)(button, this._themeService));
            const template = {
                button,
                toDispose
            };
            return template;
        }
        renderElement(element, index, templateData) {
            templateData.context = element.element;
        }
        disposeTemplate(template) {
            (0, lifecycle_1.dispose)(template.toDispose);
        }
    };
    SettingNewExtensionsRenderer = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, commands_1.ICommandService)
    ], SettingNewExtensionsRenderer);
    exports.SettingNewExtensionsRenderer = SettingNewExtensionsRenderer;
    class SettingComplexRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_COMPLEX_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'complex');
            const openSettingsButton = new button_1.Button(common.controlElement, { title: true, buttonBackground: undefined, buttonHoverBackground: undefined });
            common.toDispose.add(openSettingsButton);
            common.toDispose.add(openSettingsButton.onDidClick(() => template.onChange()));
            openSettingsButton.label = SettingComplexRenderer.EDIT_IN_JSON_LABEL;
            openSettingsButton.element.classList.add('edit-in-settings-button');
            openSettingsButton.element.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add((0, styler_1.attachButtonStyler)(openSettingsButton, this._themeService, {
                buttonBackground: color_1.Color.transparent.toString(),
                buttonHoverBackground: color_1.Color.transparent.toString(),
                buttonForeground: 'foreground'
            }));
            const validationErrorMessageElement = $('.setting-item-validation-message');
            common.containerElement.appendChild(validationErrorMessageElement);
            const template = Object.assign(Object.assign({}, common), { button: openSettingsButton, validationErrorMessageElement });
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.onChange = () => this._onDidOpenSettings.fire(dataElement.setting.key);
            this.renderValidations(dataElement, template);
            template.button.element.setAttribute('aria-label', `${SettingComplexRenderer.EDIT_IN_JSON_LABEL}: ${dataElement.setting.key}`);
        }
        renderValidations(dataElement, template) {
            const errMsg = dataElement.isConfigured && (0, preferencesValidation_1.getInvalidTypeError)(dataElement.value, dataElement.setting.type);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                return;
            }
            template.containerElement.classList.remove('invalid-input');
        }
    }
    exports.SettingComplexRenderer = SettingComplexRenderer;
    SettingComplexRenderer.EDIT_IN_JSON_LABEL = (0, nls_1.localize)(7, null);
    class SettingArrayRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ARRAY_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const descriptionElement = common.containerElement.querySelector('.setting-item-description');
            const validationErrorMessageElement = $('.setting-item-validation-message');
            descriptionElement.after(validationErrorMessageElement);
            const listWidget = this._instantiationService.createInstance(settingsWidgets_1.ListSettingWidget, common.controlElement);
            listWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(listWidget);
            const template = Object.assign(Object.assign({}, common), { listWidget,
                validationErrorMessageElement });
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(listWidget.onDidChangeList(e => {
                const newList = this.computeNewList(template, e);
                this.onDidChangeList(template, newList);
                if (newList !== null && template.onChange) {
                    template.onChange(newList);
                }
            }));
            return template;
        }
        onDidChangeList(template, newList) {
            if (!template.context || newList === null) {
                return;
            }
            this._onDidChangeSetting.fire({
                key: template.context.setting.key,
                value: newList,
                type: template.context.valueType
            });
        }
        computeNewList(template, e) {
            var _a, _b, _c;
            if (template.context) {
                let newValue = [];
                if ((0, types_1.isArray)(template.context.scopeValue)) {
                    newValue = [...template.context.scopeValue];
                }
                else if ((0, types_1.isArray)(template.context.value)) {
                    newValue = [...template.context.value];
                }
                if (e.targetIndex !== undefined) {
                    // Delete value
                    if (!((_a = e.item) === null || _a === void 0 ? void 0 : _a.value) && e.originalItem.value && e.targetIndex > -1) {
                        newValue.splice(e.targetIndex, 1);
                    }
                    // Update value
                    else if (((_b = e.item) === null || _b === void 0 ? void 0 : _b.value) && e.originalItem.value) {
                        if (e.targetIndex > -1) {
                            newValue[e.targetIndex] = e.item.value;
                        }
                        // For some reason, we are updating and cannot find original value
                        // Just append the value in this case
                        else {
                            newValue.push(e.item.value);
                        }
                    }
                    // Add value
                    else if (((_c = e.item) === null || _c === void 0 ? void 0 : _c.value) && !e.originalItem.value && e.targetIndex >= newValue.length) {
                        newValue.push(e.item.value);
                    }
                }
                if (template.context.defaultValue &&
                    (0, types_1.isArray)(template.context.defaultValue) &&
                    template.context.defaultValue.length === newValue.length &&
                    template.context.defaultValue.join() === newValue.join()) {
                    return undefined;
                }
                return newValue;
            }
            return undefined;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const value = getListDisplayValue(dataElement);
            template.listWidget.setValue(value);
            template.context = dataElement;
            template.onChange = (v) => {
                onChange(v);
                renderArrayValidations(dataElement, template, v, false);
            };
            renderArrayValidations(dataElement, template, value.map(v => v.value), true);
        }
    }
    exports.SettingArrayRenderer = SettingArrayRenderer;
    class SettingObjectRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_OBJECT_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const objectWidget = this._instantiationService.createInstance(settingsWidgets_1.ObjectSettingWidget, common.controlElement);
            objectWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(objectWidget);
            const template = Object.assign(Object.assign({}, common), { objectWidget: objectWidget });
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(objectWidget.onDidChangeList(e => this.onDidChangeObject(template, e)));
            return template;
        }
        onDidChangeObject(template, e) {
            var _a, _b;
            if (template.context) {
                const defaultValue = typeof template.context.defaultValue === 'object'
                    ? (_a = template.context.defaultValue) !== null && _a !== void 0 ? _a : {}
                    : {};
                const scopeValue = typeof template.context.scopeValue === 'object'
                    ? (_b = template.context.scopeValue) !== null && _b !== void 0 ? _b : {}
                    : {};
                const newValue = {};
                const newItems = [];
                template.objectWidget.items.forEach((item, idx) => {
                    // Item was updated
                    if ((0, types_1.isDefined)(e.item) && e.targetIndex === idx) {
                        newValue[e.item.key.data] = e.item.value.data;
                        newItems.push(e.item);
                    }
                    // All remaining items, but skip the one that we just updated
                    else if ((0, types_1.isUndefinedOrNull)(e.item) || e.item.key.data !== item.key.data) {
                        newValue[item.key.data] = item.value.data;
                        newItems.push(item);
                    }
                });
                // Item was deleted
                if ((0, types_1.isUndefinedOrNull)(e.item)) {
                    delete newValue[e.originalItem.key.data];
                    const itemToDelete = newItems.findIndex(item => item.key.data === e.originalItem.key.data);
                    const defaultItemValue = defaultValue[e.originalItem.key.data];
                    // Item does not have a default
                    if ((0, types_1.isUndefinedOrNull)(defaultValue[e.originalItem.key.data]) && itemToDelete > -1) {
                        newItems.splice(itemToDelete, 1);
                    }
                    else if (itemToDelete > -1) {
                        newItems[itemToDelete].value.data = defaultItemValue;
                    }
                }
                // New item was added
                else if (template.objectWidget.isItemNew(e.originalItem) && e.item.key.data !== '') {
                    newValue[e.item.key.data] = e.item.value.data;
                    newItems.push(e.item);
                }
                Object.entries(newValue).forEach(([key, value]) => {
                    // value from the scope has changed back to the default
                    if (scopeValue[key] !== value && defaultValue[key] === value) {
                        delete newValue[key];
                    }
                });
                this._onDidChangeSetting.fire({
                    key: template.context.setting.key,
                    value: Object.keys(newValue).length === 0 ? undefined : newValue,
                    type: template.context.valueType
                });
                template.objectWidget.setValue(newItems);
            }
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const items = getObjectDisplayValue(dataElement);
            const { key, objectProperties, objectPatternProperties, objectAdditionalProperties } = dataElement.setting;
            template.objectWidget.setValue(items, {
                settingKey: key,
                showAddButton: objectAdditionalProperties === false
                    ? (!areAllPropertiesDefined(Object.keys(objectProperties !== null && objectProperties !== void 0 ? objectProperties : {}), items) ||
                        (0, types_1.isDefined)(objectPatternProperties))
                    : true,
                keySuggester: createObjectKeySuggester(dataElement),
                valueSuggester: createObjectValueSuggester(dataElement),
            });
            template.context = dataElement;
        }
    }
    exports.SettingObjectRenderer = SettingObjectRenderer;
    class SettingExcludeRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_EXCLUDE_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'list');
            const excludeWidget = this._instantiationService.createInstance(settingsWidgets_1.ExcludeSettingWidget, common.controlElement);
            excludeWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            common.toDispose.add(excludeWidget);
            const template = Object.assign(Object.assign({}, common), { excludeWidget });
            this.addSettingElementFocusHandler(template);
            common.toDispose.add(excludeWidget.onDidChangeList(e => this.onDidChangeExclude(template, e)));
            return template;
        }
        onDidChangeExclude(template, e) {
            var _a;
            if (template.context) {
                const newValue = Object.assign({}, template.context.scopeValue);
                // first delete the existing entry, if present
                if (e.originalItem.value) {
                    if (e.originalItem.value in template.context.defaultValue) {
                        // delete a default by overriding it
                        newValue[e.originalItem.value] = false;
                    }
                    else {
                        delete newValue[e.originalItem.value];
                    }
                }
                // then add the new or updated entry, if present
                if ((_a = e.item) === null || _a === void 0 ? void 0 : _a.value) {
                    if (e.item.value in template.context.defaultValue && !e.item.sibling) {
                        // add a default by deleting its override
                        delete newValue[e.item.value];
                    }
                    else {
                        newValue[e.item.value] = e.item.sibling ? { when: e.item.sibling } : true;
                    }
                }
                function sortKeys(obj) {
                    const sortedKeys = Object.keys(obj)
                        .sort((a, b) => a.localeCompare(b));
                    const retVal = {};
                    for (const key of sortedKeys) {
                        retVal[key] = obj[key];
                    }
                    return retVal;
                }
                this._onDidChangeSetting.fire({
                    key: template.context.setting.key,
                    value: Object.keys(newValue).length === 0 ? undefined : sortKeys(newValue),
                    type: template.context.valueType
                });
            }
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const value = getExcludeDisplayValue(dataElement);
            template.excludeWidget.setValue(value);
            template.context = dataElement;
        }
    }
    exports.SettingExcludeRenderer = SettingExcludeRenderer;
    class SettingTextRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_TEXT_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = this.renderCommonTemplate(null, _container, 'text');
            const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
            const inputBox = new inputBox_1.InputBox(common.controlElement, this._contextViewService);
            common.toDispose.add(inputBox);
            common.toDispose.add((0, styler_1.attachInputBoxStyler)(inputBox, this._themeService, {
                inputBackground: settingsWidgets_1.settingsTextInputBackground,
                inputForeground: settingsWidgets_1.settingsTextInputForeground,
                inputBorder: settingsWidgets_1.settingsTextInputBorder
            }));
            common.toDispose.add(inputBox.onDidChange(e => {
                if (template.onChange) {
                    template.onChange(e);
                }
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            // TODO@9at8: listWidget filters out all key events from input boxes, so we need to come up with a better way
            // Disable ArrowUp and ArrowDown behaviour in favor of list navigation
            common.toDispose.add(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, e => {
                if (e.equals(16 /* UpArrow */) || e.equals(18 /* DownArrow */)) {
                    e.preventDefault();
                }
            }));
            const template = Object.assign(Object.assign({}, common), { inputBox,
                validationErrorMessageElement });
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.onChange = undefined;
            template.inputBox.value = dataElement.value;
            template.onChange = value => {
                if (!renderValidations(dataElement, template, false)) {
                    onChange(value);
                }
            };
            renderValidations(dataElement, template, true);
        }
    }
    exports.SettingTextRenderer = SettingTextRenderer;
    class SettingEnumRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_ENUM_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const common = this.renderCommonTemplate(null, container, 'enum');
            const selectBox = new selectBox_1.SelectBox([], 0, this._contextViewService, undefined, {
                useCustomDrawn: !(platform_1.isIOS && canIUse_1.BrowserFeatures.pointerEvents)
            });
            common.toDispose.add(selectBox);
            common.toDispose.add((0, styler_1.attachSelectBoxStyler)(selectBox, this._themeService, {
                selectBackground: settingsWidgets_1.settingsSelectBackground,
                selectForeground: settingsWidgets_1.settingsSelectForeground,
                selectBorder: settingsWidgets_1.settingsSelectBorder,
                selectListBorder: settingsWidgets_1.settingsSelectListBorder
            }));
            selectBox.render(common.controlElement);
            const selectElement = common.controlElement.querySelector('select');
            if (selectElement) {
                selectElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
                selectElement.tabIndex = 0;
            }
            common.toDispose.add(selectBox.onDidSelect(e => {
                if (template.onChange) {
                    template.onChange(e.index);
                }
            }));
            const enumDescriptionElement = common.containerElement.insertBefore($('.setting-item-enumDescription'), common.descriptionElement.nextSibling);
            const template = Object.assign(Object.assign({}, common), { selectBox,
                enumDescriptionElement });
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const enumItemLabels = dataElement.setting.enumItemLabels;
            const enumDescriptions = dataElement.setting.enumDescriptions;
            const enumDescriptionsAreMarkdown = dataElement.setting.enumDescriptionsAreMarkdown;
            const disposables = new lifecycle_1.DisposableStore();
            template.toDispose.add(disposables);
            const displayOptions = dataElement.setting.enum
                .map(String)
                .map(escapeInvisibleChars)
                .map((data, index) => {
                const description = (enumDescriptions && enumDescriptions[index] && (enumDescriptionsAreMarkdown ? fixSettingLinks(enumDescriptions[index], false) : enumDescriptions[index]));
                return {
                    text: enumItemLabels && enumItemLabels[index] ? enumItemLabels[index] : data,
                    detail: enumItemLabels && enumItemLabels[index] ? data : '',
                    description,
                    descriptionIsMarkdown: enumDescriptionsAreMarkdown,
                    descriptionMarkdownActionHandler: {
                        callback: (content) => {
                            this._openerService.open(content).catch(errors_1.onUnexpectedError);
                        },
                        disposeables: disposables
                    },
                    decoratorRight: (data === dataElement.defaultValue ? (0, nls_1.localize)(8, null) : '')
                };
            });
            template.selectBox.setOptions(displayOptions);
            let idx = dataElement.setting.enum.indexOf(dataElement.value);
            if (idx === -1) {
                idx = dataElement.setting.enum.indexOf(dataElement.defaultValue);
                if (idx === -1) {
                    idx = 0;
                }
            }
            template.onChange = undefined;
            template.selectBox.select(idx);
            template.onChange = idx => onChange(dataElement.setting.enum[idx]);
            template.enumDescriptionElement.innerText = '';
        }
    }
    exports.SettingEnumRenderer = SettingEnumRenderer;
    class SettingNumberRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_NUMBER_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            const common = super.renderCommonTemplate(null, _container, 'number');
            const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
            const inputBox = new inputBox_1.InputBox(common.controlElement, this._contextViewService, { type: 'number' });
            common.toDispose.add(inputBox);
            common.toDispose.add((0, styler_1.attachInputBoxStyler)(inputBox, this._themeService, {
                inputBackground: settingsWidgets_1.settingsNumberInputBackground,
                inputForeground: settingsWidgets_1.settingsNumberInputForeground,
                inputBorder: settingsWidgets_1.settingsNumberInputBorder
            }));
            common.toDispose.add(inputBox.onDidChange(e => {
                if (template.onChange) {
                    template.onChange(e);
                }
            }));
            common.toDispose.add(inputBox);
            inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            inputBox.inputElement.tabIndex = 0;
            const template = Object.assign(Object.assign({}, common), { inputBox,
                validationErrorMessageElement });
            this.addSettingElementFocusHandler(template);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            const numParseFn = (dataElement.valueType === 'integer' || dataElement.valueType === 'nullable-integer')
                ? parseInt : parseFloat;
            const nullNumParseFn = (dataElement.valueType === 'nullable-integer' || dataElement.valueType === 'nullable-number')
                ? ((v) => v === '' ? null : numParseFn(v)) : numParseFn;
            template.onChange = undefined;
            template.inputBox.value = dataElement.value;
            template.onChange = value => {
                if (!renderValidations(dataElement, template, false)) {
                    onChange(nullNumParseFn(value));
                }
            };
            renderValidations(dataElement, template, true);
        }
    }
    exports.SettingNumberRenderer = SettingNumberRenderer;
    class SettingBoolRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_BOOL_TEMPLATE_ID;
        }
        renderTemplate(_container) {
            _container.classList.add('setting-item');
            _container.classList.add('setting-item-bool');
            const container = DOM.append(_container, $(AbstractSettingRenderer.CONTENTS_SELECTOR));
            container.classList.add('settings-row-inner-container');
            const titleElement = DOM.append(container, $('.setting-item-title'));
            const categoryElement = DOM.append(titleElement, $('span.setting-item-category'));
            const labelElement = DOM.append(titleElement, $('span.setting-item-label'));
            const otherOverridesElement = DOM.append(titleElement, $('span.setting-item-overrides'));
            const syncIgnoredElement = this.createSyncIgnoredElement(titleElement);
            const descriptionAndValueElement = DOM.append(container, $('.setting-item-value-description'));
            const controlElement = DOM.append(descriptionAndValueElement, $('.setting-item-bool-control'));
            const descriptionElement = DOM.append(descriptionAndValueElement, $('.setting-item-description'));
            const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
            modifiedIndicatorElement.title = (0, nls_1.localize)(9, null);
            const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
            const toDispose = new lifecycle_1.DisposableStore();
            const checkbox = new checkbox_1.Checkbox({ icon: codicons_1.Codicon.check, actionClassName: 'setting-value-checkbox', isChecked: true, title: '', inputActiveOptionBorder: undefined });
            controlElement.appendChild(checkbox.domNode);
            toDispose.add(checkbox);
            toDispose.add(checkbox.onChange(() => {
                template.onChange(checkbox.checked);
            }));
            // Need to listen for mouse clicks on description and toggle checkbox - use target ID for safety
            // Also have to ignore embedded links - too buried to stop propagation
            toDispose.add(DOM.addDisposableListener(descriptionElement, DOM.EventType.MOUSE_DOWN, (e) => {
                const targetElement = e.target;
                // Toggle target checkbox
                if (targetElement.tagName.toLowerCase() !== 'a') {
                    template.checkbox.checked = !template.checkbox.checked;
                    template.onChange(checkbox.checked);
                }
                DOM.EventHelper.stop(e);
            }));
            checkbox.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
            const toolbar = this.renderSettingToolbar(toolbarContainer);
            toDispose.add(toolbar);
            const template = {
                toDispose,
                elementDisposables: new lifecycle_1.DisposableStore(),
                containerElement: container,
                categoryElement,
                labelElement,
                controlElement,
                checkbox,
                descriptionElement,
                deprecationWarningElement,
                otherOverridesElement,
                syncIgnoredElement,
                toolbar
            };
            this.addSettingElementFocusHandler(template);
            // Prevent clicks from being handled by list
            toDispose.add(DOM.addDisposableListener(controlElement, 'mousedown', (e) => e.stopPropagation()));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
            toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) {
            template.onChange = undefined;
            template.checkbox.checked = dataElement.value;
            template.onChange = onChange;
        }
    }
    exports.SettingBoolRenderer = SettingBoolRenderer;
    class SettingUntrustedRenderer extends AbstractSettingRenderer {
        constructor() {
            super(...arguments);
            this.templateId = SETTINGS_UNTRUSTED_TEMPLATE_ID;
        }
        renderTemplate(container) {
            const template = this.renderCommonTemplate(null, container, 'untrusted');
            const manageWorkspaceTrustLabel = (0, nls_1.localize)(10, null);
            const trustLabelElement = $('.setting-item-trust-description');
            const untrustedWorkspaceIcon = DOM.append(trustLabelElement, $('span.codicon.codicon-workspace-untrusted'));
            template.toDispose.add((0, styler_1.attachStylerCallback)(this._themeService, { untrustedForegroundColor: workspaceTrustColors_1.untrustedForegroundColor }, colors => {
                var _a;
                untrustedWorkspaceIcon.style.setProperty('--workspace-trust-state-untrusted-color', ((_a = colors.untrustedForegroundColor) === null || _a === void 0 ? void 0 : _a.toString()) || '');
            }));
            const element = DOM.append(trustLabelElement, $('span'));
            element.textContent = (0, nls_1.localize)(11, null);
            const linkElement = DOM.append(trustLabelElement, $('a'));
            linkElement.textContent = manageWorkspaceTrustLabel;
            linkElement.setAttribute('tabindex', '0');
            linkElement.href = '#';
            template.toDispose.add(DOM.addStandardDisposableListener(linkElement, DOM.EventType.CLICK, () => {
                this._commandService.executeCommand('workbench.trust.manage');
            }));
            template.toDispose.add(DOM.addStandardDisposableListener(linkElement, DOM.EventType.KEY_DOWN, (e) => {
                if (e.equals(3 /* Enter */) || e.equals(10 /* Space */)) {
                    this._commandService.executeCommand('workbench.trust.manage');
                    e.stopPropagation();
                }
            }));
            template.containerElement.insertBefore(trustLabelElement, template.descriptionElement);
            return template;
        }
        renderElement(element, index, templateData) {
            super.renderSettingElement(element, index, templateData);
        }
        renderValue(dataElement, template, onChange) { }
    }
    exports.SettingUntrustedRenderer = SettingUntrustedRenderer;
    let SettingTreeRenderers = class SettingTreeRenderers {
        constructor(_instantiationService, _contextMenuService, _contextViewService, _userDataAutoSyncEnablementService) {
            this._instantiationService = _instantiationService;
            this._contextMenuService = _contextMenuService;
            this._contextViewService = _contextViewService;
            this._userDataAutoSyncEnablementService = _userDataAutoSyncEnablementService;
            this._onDidChangeSetting = new event_1.Emitter();
            this.settingActions = [
                new actions_1.Action('settings.resetSetting', (0, nls_1.localize)(12, null), undefined, undefined, async (context) => {
                    if (context instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                        if (!context.isUntrusted) {
                            this._onDidChangeSetting.fire({ key: context.setting.key, value: undefined, type: context.setting.type });
                        }
                    }
                }),
                new actions_1.Separator(),
                this._instantiationService.createInstance(CopySettingIdAction),
                this._instantiationService.createInstance(CopySettingAsJSONAction),
            ];
            const actionFactory = (setting) => this.getActionsForSetting(setting);
            const settingRenderers = [
                this._instantiationService.createInstance(SettingBoolRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingNumberRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingArrayRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingComplexRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingTextRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingExcludeRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingEnumRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingObjectRenderer, this.settingActions, actionFactory),
                this._instantiationService.createInstance(SettingUntrustedRenderer, this.settingActions, actionFactory),
            ];
            this.onDidClickOverrideElement = event_1.Event.any(...settingRenderers.map(r => r.onDidClickOverrideElement));
            this.onDidChangeSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidChangeSetting), this._onDidChangeSetting.event);
            this.onDidOpenSettings = event_1.Event.any(...settingRenderers.map(r => r.onDidOpenSettings));
            this.onDidClickSettingLink = event_1.Event.any(...settingRenderers.map(r => r.onDidClickSettingLink));
            this.onDidFocusSetting = event_1.Event.any(...settingRenderers.map(r => r.onDidFocusSetting));
            this.allRenderers = [
                ...settingRenderers,
                this._instantiationService.createInstance(SettingGroupRenderer),
                this._instantiationService.createInstance(SettingNewExtensionsRenderer),
            ];
        }
        getActionsForSetting(setting) {
            const enableSync = this._userDataAutoSyncEnablementService.isEnabled();
            return enableSync && !setting.disallowSyncIgnore ?
                [
                    new actions_1.Separator(),
                    this._instantiationService.createInstance(SyncSettingAction, setting)
                ] :
                [];
        }
        cancelSuggesters() {
            this._contextViewService.hideContextView();
        }
        showContextMenu(element, settingDOMElement) {
            const toolbarElement = settingDOMElement.querySelector('.monaco-toolbar');
            if (toolbarElement) {
                this._contextMenuService.showContextMenu({
                    getActions: () => this.settingActions,
                    getAnchor: () => toolbarElement,
                    getActionsContext: () => element
                });
            }
        }
        getSettingDOMElementForDOMElement(domElement) {
            const parent = DOM.findParentWithClass(domElement, AbstractSettingRenderer.CONTENTS_CLASS);
            if (parent) {
                return parent;
            }
            return null;
        }
        getDOMElementsForSettingKey(treeContainer, key) {
            return treeContainer.querySelectorAll(`[${AbstractSettingRenderer.SETTING_KEY_ATTR}="${key}"]`);
        }
        getKeyForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
        }
        getIdForDOMElementInSetting(element) {
            const settingElement = this.getSettingDOMElementForDOMElement(element);
            return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_ID_ATTR);
        }
    };
    SettingTreeRenderers = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, contextView_1.IContextMenuService),
        __param(2, contextView_1.IContextViewService),
        __param(3, userDataSync_1.IUserDataAutoSyncEnablementService)
    ], SettingTreeRenderers);
    exports.SettingTreeRenderers = SettingTreeRenderers;
    /**
     * Validate and render any error message. Returns true if the value is invalid.
     */
    function renderValidations(dataElement, template, calledOnStartup) {
        if (dataElement.setting.validator) {
            const errMsg = dataElement.setting.validator(template.inputBox.value);
            if (errMsg) {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                const validationError = (0, nls_1.localize)(13, null);
                template.inputBox.inputElement.parentElement.setAttribute('aria-label', [validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    (0, aria_1.alert)(validationError + ' ' + errMsg);
                }
                return true;
            }
            else {
                template.inputBox.inputElement.parentElement.removeAttribute('aria-label');
            }
        }
        template.containerElement.classList.remove('invalid-input');
        return false;
    }
    function renderArrayValidations(dataElement, template, value, calledOnStartup) {
        template.containerElement.classList.add('invalid-input');
        if (dataElement.setting.validator) {
            const errMsg = dataElement.setting.validator(value);
            if (errMsg && errMsg !== '') {
                template.containerElement.classList.add('invalid-input');
                template.validationErrorMessageElement.innerText = errMsg;
                const validationError = (0, nls_1.localize)(14, null);
                template.containerElement.setAttribute('aria-label', [dataElement.setting.key, validationError, errMsg].join(' '));
                if (!calledOnStartup) {
                    (0, aria_1.alert)(validationError + ' ' + errMsg);
                }
                return;
            }
            else {
                template.containerElement.setAttribute('aria-label', dataElement.setting.key);
                template.containerElement.classList.remove('invalid-input');
            }
        }
    }
    function cleanRenderedMarkdown(element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes.item(i);
            const tagName = child.tagName && child.tagName.toLowerCase();
            if (tagName === 'img') {
                element.removeChild(child);
            }
            else {
                cleanRenderedMarkdown(child);
            }
        }
    }
    function fixSettingLinks(text, linkify = true) {
        return text.replace(/`#([^#]*)#`/g, (match, settingKey) => {
            const targetDisplayFormat = (0, settingsTreeModels_1.settingKeyToDisplayFormat)(settingKey);
            const targetName = `${targetDisplayFormat.category}: ${targetDisplayFormat.label}`;
            return linkify ?
                `[${targetName}](#${settingKey})` :
                `"${targetName}"`;
        });
    }
    function escapeInvisibleChars(enumValue) {
        return enumValue && enumValue
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }
    let SettingsTreeFilter = class SettingsTreeFilter {
        constructor(viewState, environmentService) {
            this.viewState = viewState;
            this.environmentService = environmentService;
        }
        filter(element, parentVisibility) {
            // Filter during search
            if (this.viewState.filterToCategory && element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                if (!this.settingContainedInGroup(element.setting, this.viewState.filterToCategory)) {
                    return false;
                }
            }
            // Non-user scope selected
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement && this.viewState.settingsTarget !== 2 /* USER_LOCAL */) {
                const isRemote = !!this.environmentService.remoteAuthority;
                if (!element.matchesScope(this.viewState.settingsTarget, isRemote)) {
                    return false;
                }
            }
            // @modified or tag
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement && this.viewState.tagFilters) {
                if (!element.matchesAllTags(this.viewState.tagFilters)) {
                    return false;
                }
            }
            // Group with no visible children
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                if (typeof element.count === 'number') {
                    return element.count > 0;
                }
                return 2 /* Recurse */;
            }
            // Filtered "new extensions" button
            if (element instanceof settingsTreeModels_1.SettingsTreeNewExtensionsElement) {
                if ((this.viewState.tagFilters && this.viewState.tagFilters.size) || this.viewState.filterToCategory) {
                    return false;
                }
            }
            return true;
        }
        settingContainedInGroup(setting, group) {
            return group.children.some(child => {
                if (child instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                    return this.settingContainedInGroup(setting, child);
                }
                else if (child instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                    return child.setting.key === setting.key;
                }
                else {
                    return false;
                }
            });
        }
    };
    SettingsTreeFilter = __decorate([
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], SettingsTreeFilter);
    exports.SettingsTreeFilter = SettingsTreeFilter;
    class SettingsTreeDelegate extends list_1.CachedListVirtualDelegate {
        getTemplateId(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return SETTINGS_ELEMENT_TEMPLATE_ID;
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                if (element.isUntrusted) {
                    return SETTINGS_UNTRUSTED_TEMPLATE_ID;
                }
                const invalidTypeError = element.isConfigured && (0, preferencesValidation_1.getInvalidTypeError)(element.value, element.setting.type);
                if (invalidTypeError) {
                    return SETTINGS_COMPLEX_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Boolean) {
                    return SETTINGS_BOOL_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Integer || element.valueType === preferences_2.SettingValueType.Number || element.valueType === preferences_2.SettingValueType.NullableInteger || element.valueType === preferences_2.SettingValueType.NullableNumber) {
                    return SETTINGS_NUMBER_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.String) {
                    return SETTINGS_TEXT_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Enum) {
                    return SETTINGS_ENUM_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.ArrayOfString) {
                    return SETTINGS_ARRAY_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Exclude) {
                    return SETTINGS_EXCLUDE_TEMPLATE_ID;
                }
                if (element.valueType === preferences_2.SettingValueType.Object) {
                    return SETTINGS_OBJECT_TEMPLATE_ID;
                }
                return SETTINGS_COMPLEX_TEMPLATE_ID;
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeNewExtensionsElement) {
                return SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
            }
            throw new Error('unknown element type: ' + element);
        }
        hasDynamicHeight(element) {
            return !(element instanceof settingsTreeModels_1.SettingsTreeGroupElement);
        }
        estimateHeight(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return 42;
            }
            return element instanceof settingsTreeModels_1.SettingsTreeSettingElement && element.valueType === preferences_2.SettingValueType.Boolean ? 78 : 104;
        }
    }
    class NonCollapsibleObjectTreeModel extends objectTreeModel_1.ObjectTreeModel {
        isCollapsible(element) {
            return false;
        }
        setCollapsed(element, collapsed, recursive) {
            return false;
        }
    }
    exports.NonCollapsibleObjectTreeModel = NonCollapsibleObjectTreeModel;
    class SettingsTreeAccessibilityProvider {
        getAriaLabel(element) {
            if (element instanceof settingsTreeModels_1.SettingsTreeSettingElement) {
                const modifiedText = element.isConfigured ? (0, nls_1.localize)(15, null) : '';
                const otherOverridesStart = element.isConfigured ?
                    (0, nls_1.localize)(16, null) :
                    (0, nls_1.localize)(17, null);
                const otherOverridesList = element.overriddenScopeList.join(', ');
                const otherOverridesLabel = element.overriddenScopeList.length ? `${otherOverridesStart} ${otherOverridesList}. ` : '';
                const descriptionWithoutSettingLinks = fixSettingLinks(element.description, false);
                return `${element.displayCategory} ${element.displayLabel}. ${descriptionWithoutSettingLinks}. ${modifiedText} ${otherOverridesLabel}`;
            }
            else {
                return element.id;
            }
        }
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(18, null);
        }
    }
    let SettingsTree = class SettingsTree extends listService_1.WorkbenchObjectTree {
        constructor(container, viewState, renderers, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService, instantiationService) {
            super('SettingsTree', container, new SettingsTreeDelegate(), renderers, {
                horizontalScrolling: false,
                supportDynamicHeights: true,
                identityProvider: {
                    getId(e) {
                        return e.id;
                    }
                },
                accessibilityProvider: new SettingsTreeAccessibilityProvider(),
                styleController: id => new listWidget_1.DefaultStyleController(DOM.createStyleSheet(container), id),
                filter: instantiationService.createInstance(SettingsTreeFilter, viewState),
                smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
                multipleSelectionSupport: false,
            }, contextKeyService, listService, themeService, configurationService, keybindingService, accessibilityService);
            this.disposables.add((0, themeService_1.registerThemingParticipant)((theme, collector) => {
                const foregroundColor = theme.getColor(colorRegistry_1.foreground);
                if (foregroundColor) {
                    // Links appear inside other elements in markdown. CSS opacity acts like a mask. So we have to dynamically compute the description color to avoid
                    // applying an opacity to the link color.
                    const fgWithOpacity = new color_1.Color(new color_1.RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.9));
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-description { color: ${fgWithOpacity}; }`);
                    collector.addRule(`.settings-editor > .settings-body .settings-toc-container .monaco-list-row:not(.selected) { color: ${fgWithOpacity}; }`);
                    const disabledfgColor = new color_1.Color(new color_1.RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.7));
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-untrusted > .setting-item-contents .setting-item-description { color: ${disabledfgColor}; }`);
                    // Hack for subpixel antialiasing
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-title .setting-item-overrides,
					.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-title .setting-item-ignored { color: ${fgWithOpacity}; }`);
                }
                const errorColor = theme.getColor(colorRegistry_1.errorForeground);
                if (errorColor) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-deprecation-message { color: ${errorColor}; }`);
                }
                const invalidInputBackground = theme.getColor(colorRegistry_1.inputValidationErrorBackground);
                if (invalidInputBackground) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-validation-message { background-color: ${invalidInputBackground}; }`);
                }
                const invalidInputForeground = theme.getColor(colorRegistry_1.inputValidationErrorForeground);
                if (invalidInputForeground) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-validation-message { color: ${invalidInputForeground}; }`);
                }
                const invalidInputBorder = theme.getColor(colorRegistry_1.inputValidationErrorBorder);
                if (invalidInputBorder) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-validation-message { border-style:solid; border-width: 1px; border-color: ${invalidInputBorder}; }`);
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.invalid-input .setting-item-control .monaco-inputbox.idle { outline-width: 0; border-style:solid; border-width: 1px; border-color: ${invalidInputBorder}; }`);
                }
                const focusedRowBackgroundColor = theme.getColor(settingsWidgets_1.focusedRowBackground);
                if (focusedRowBackgroundColor) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .monaco-list-row.focused .settings-row-inner-container { background-color: ${focusedRowBackgroundColor}; }`);
                }
                const rowHoverBackgroundColor = theme.getColor(settingsWidgets_1.rowHoverBackground);
                if (rowHoverBackgroundColor) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .monaco-list-row:not(.focused) .settings-row-inner-container:hover { background-color: ${rowHoverBackgroundColor}; }`);
                }
                const focusedRowBorderColor = theme.getColor(settingsWidgets_1.focusedRowBorder);
                if (focusedRowBorderColor) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .monaco-list:focus-within .monaco-list-row.focused .setting-item-contents { outline: 1px solid ${focusedRowBorderColor} }`);
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .monaco-list:focus-within .monaco-list-row.focused .settings-group-title-label { outline: 1px solid ${focusedRowBorderColor} }`);
                }
                const headerForegroundColor = theme.getColor(settingsWidgets_1.settingsHeaderForeground);
                if (headerForegroundColor) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .settings-group-title-label { color: ${headerForegroundColor}; }`);
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-label { color: ${headerForegroundColor}; }`);
                }
                const focusBorderColor = theme.getColor(colorRegistry_1.focusBorder);
                if (focusBorderColor) {
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-trust-description a:focus { outline-color: ${focusBorderColor} }`);
                    collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-markdown a:focus { outline-color: ${focusBorderColor} }`);
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
            return new NonCollapsibleObjectTreeModel(user, view, options);
        }
    };
    SettingsTree = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, listService_1.IListService),
        __param(5, themeService_1.IThemeService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, keybinding_1.IKeybindingService),
        __param(8, accessibility_1.IAccessibilityService),
        __param(9, instantiation_1.IInstantiationService)
    ], SettingsTree);
    exports.SettingsTree = SettingsTree;
    let CopySettingIdAction = class CopySettingIdAction extends actions_1.Action {
        constructor(clipboardService) {
            super(CopySettingIdAction.ID, CopySettingIdAction.LABEL);
            this.clipboardService = clipboardService;
        }
        async run(context) {
            if (context) {
                await this.clipboardService.writeText(context.setting.key);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingIdAction.ID = 'settings.copySettingId';
    CopySettingIdAction.LABEL = (0, nls_1.localize)(19, null);
    CopySettingIdAction = __decorate([
        __param(0, clipboardService_1.IClipboardService)
    ], CopySettingIdAction);
    let CopySettingAsJSONAction = class CopySettingAsJSONAction extends actions_1.Action {
        constructor(clipboardService) {
            super(CopySettingAsJSONAction.ID, CopySettingAsJSONAction.LABEL);
            this.clipboardService = clipboardService;
        }
        async run(context) {
            if (context) {
                const jsonResult = `"${context.setting.key}": ${JSON.stringify(context.value, undefined, '  ')}`;
                await this.clipboardService.writeText(jsonResult);
            }
            return Promise.resolve(undefined);
        }
    };
    CopySettingAsJSONAction.ID = 'settings.copySettingAsJSON';
    CopySettingAsJSONAction.LABEL = (0, nls_1.localize)(20, null);
    CopySettingAsJSONAction = __decorate([
        __param(0, clipboardService_1.IClipboardService)
    ], CopySettingAsJSONAction);
    let SyncSettingAction = class SyncSettingAction extends actions_1.Action {
        constructor(setting, configService) {
            super(SyncSettingAction.ID, SyncSettingAction.LABEL);
            this.setting = setting;
            this.configService = configService;
            this._register(event_1.Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredSettings'))(() => this.update()));
            this.update();
        }
        async update() {
            const ignoredSettings = (0, settingsMerge_1.getIgnoredSettings)((0, userDataSync_1.getDefaultIgnoredSettings)(), this.configService);
            this.checked = !ignoredSettings.includes(this.setting.key);
        }
        async run() {
            // first remove the current setting completely from ignored settings
            let currentValue = [...this.configService.getValue('settingsSync.ignoredSettings')];
            currentValue = currentValue.filter(v => v !== this.setting.key && v !== `-${this.setting.key}`);
            const defaultIgnoredSettings = (0, userDataSync_1.getDefaultIgnoredSettings)();
            const isDefaultIgnored = defaultIgnoredSettings.includes(this.setting.key);
            const askedToSync = !this.checked;
            // If asked to sync, then add only if it is ignored by default
            if (askedToSync && isDefaultIgnored) {
                currentValue.push(`-${this.setting.key}`);
            }
            // If asked not to sync, then add only if it is not ignored by default
            if (!askedToSync && !isDefaultIgnored) {
                currentValue.push(this.setting.key);
            }
            this.configService.updateValue('settingsSync.ignoredSettings', currentValue.length ? currentValue : undefined, 1 /* USER */);
            return Promise.resolve(undefined);
        }
    };
    SyncSettingAction.ID = 'settings.stopSyncingSetting';
    SyncSettingAction.LABEL = (0, nls_1.localize)(21, null);
    SyncSettingAction = __decorate([
        __param(1, configuration_1.IConfigurationService)
    ], SyncSettingAction);
});
//# sourceMappingURL=settingsTree.js.map