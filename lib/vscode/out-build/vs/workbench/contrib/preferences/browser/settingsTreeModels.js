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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/browser/settingsLayout", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, arrays, strings_1, types_1, uri_1, nls_1, settingsLayout_1, preferences_1, preferences_2, environmentService_1, configuration_1, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseQuery = exports.SearchResultModel = exports.SearchResultIdx = exports.isExcludeSetting = exports.settingKeyToDisplayFormat = exports.inspectSetting = exports.SettingsTreeModel = exports.SettingsTreeSettingElement = exports.SettingsTreeNewExtensionsElement = exports.SettingsTreeGroupElement = exports.SettingsTreeElement = exports.ONLINE_SERVICES_SETTING_TAG = void 0;
    exports.ONLINE_SERVICES_SETTING_TAG = 'usesOnlineServices';
    class SettingsTreeElement extends lifecycle_1.Disposable {
        constructor(_id) {
            super();
            this._tabbable = false;
            this._onDidChangeTabbable = new event_1.Emitter();
            this.onDidChangeTabbable = this._onDidChangeTabbable.event;
            this.id = _id;
        }
        get tabbable() {
            return this._tabbable;
        }
        set tabbable(value) {
            this._tabbable = value;
            this._onDidChangeTabbable.fire();
        }
    }
    exports.SettingsTreeElement = SettingsTreeElement;
    class SettingsTreeGroupElement extends SettingsTreeElement {
        constructor(_id, count, label, level, isFirstGroup) {
            super(_id);
            this._childSettingKeys = new Set();
            this._children = [];
            this.count = count;
            this.label = label;
            this.level = level;
            this.isFirstGroup = isFirstGroup;
        }
        get children() {
            return this._children;
        }
        set children(newChildren) {
            this._children = newChildren;
            this._childSettingKeys = new Set();
            this._children.forEach(child => {
                if (child instanceof SettingsTreeSettingElement) {
                    this._childSettingKeys.add(child.setting.key);
                }
            });
        }
        /**
         * Returns whether this group contains the given child key (to a depth of 1 only)
         */
        containsSetting(key) {
            return this._childSettingKeys.has(key);
        }
    }
    exports.SettingsTreeGroupElement = SettingsTreeGroupElement;
    class SettingsTreeNewExtensionsElement extends SettingsTreeElement {
        constructor(_id, extensionIds) {
            super(_id);
            this.extensionIds = extensionIds;
        }
    }
    exports.SettingsTreeNewExtensionsElement = SettingsTreeNewExtensionsElement;
    class SettingsTreeSettingElement extends SettingsTreeElement {
        constructor(setting, parent, inspectResult, isWorkspaceTrusted) {
            super(sanitizeId(parent.id + '_' + setting.key));
            this._displayCategory = null;
            this._displayLabel = null;
            /**
             * Whether the setting is configured in the selected scope.
             */
            this.isConfigured = false;
            /**
             * Whether the setting requires trusted target
             */
            this.isUntrusted = false;
            this.overriddenScopeList = [];
            this.setting = setting;
            this.parent = parent;
            this.update(inspectResult, isWorkspaceTrusted);
        }
        get displayCategory() {
            if (!this._displayCategory) {
                this.initLabel();
            }
            return this._displayCategory;
        }
        get displayLabel() {
            if (!this._displayLabel) {
                this.initLabel();
            }
            return this._displayLabel;
        }
        initLabel() {
            const displayKeyFormat = settingKeyToDisplayFormat(this.setting.key, this.parent.id);
            this._displayLabel = displayKeyFormat.label;
            this._displayCategory = displayKeyFormat.category;
        }
        update(inspectResult, isWorkspaceTrusted) {
            const { isConfigured, inspected, targetSelector } = inspectResult;
            switch (targetSelector) {
                case 'workspaceFolderValue':
                case 'workspaceValue':
                    this.isUntrusted = !!this.setting.restricted && !isWorkspaceTrusted;
                    break;
            }
            const displayValue = isConfigured ? inspected[targetSelector] : inspected.defaultValue;
            const overriddenScopeList = [];
            if (targetSelector !== 'workspaceValue' && typeof inspected.workspaceValue !== 'undefined') {
                overriddenScopeList.push((0, nls_1.localize)(0, null));
            }
            if (targetSelector !== 'userRemoteValue' && typeof inspected.userRemoteValue !== 'undefined') {
                overriddenScopeList.push((0, nls_1.localize)(1, null));
            }
            if (targetSelector !== 'userLocalValue' && typeof inspected.userLocalValue !== 'undefined') {
                overriddenScopeList.push((0, nls_1.localize)(2, null));
            }
            this.value = displayValue;
            this.scopeValue = isConfigured && inspected[targetSelector];
            this.defaultValue = inspected.defaultValue;
            this.isConfigured = isConfigured;
            if (isConfigured || this.setting.tags || this.tags || this.setting.restricted) {
                // Don't create an empty Set for all 1000 settings, only if needed
                this.tags = new Set();
                if (isConfigured) {
                    this.tags.add(preferences_1.MODIFIED_SETTING_TAG);
                }
                if (this.setting.tags) {
                    this.setting.tags.forEach(tag => this.tags.add(tag));
                }
                if (this.setting.restricted) {
                    this.tags.add(preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG);
                }
            }
            this.overriddenScopeList = overriddenScopeList;
            if (this.setting.description.length > SettingsTreeSettingElement.MAX_DESC_LINES) {
                const truncatedDescLines = this.setting.description.slice(0, SettingsTreeSettingElement.MAX_DESC_LINES);
                truncatedDescLines.push('[...]');
                this.description = truncatedDescLines.join('\n');
            }
            else {
                this.description = this.setting.description.join('\n');
            }
            if (this.setting.enum && (!this.setting.type || settingTypeEnumRenderable(this.setting.type))) {
                this.valueType = preferences_2.SettingValueType.Enum;
            }
            else if (this.setting.type === 'string') {
                this.valueType = preferences_2.SettingValueType.String;
            }
            else if (isExcludeSetting(this.setting)) {
                this.valueType = preferences_2.SettingValueType.Exclude;
            }
            else if (this.setting.type === 'integer') {
                this.valueType = preferences_2.SettingValueType.Integer;
            }
            else if (this.setting.type === 'number') {
                this.valueType = preferences_2.SettingValueType.Number;
            }
            else if (this.setting.type === 'boolean') {
                this.valueType = preferences_2.SettingValueType.Boolean;
            }
            else if (this.setting.type === 'array' && this.setting.arrayItemType === 'string') {
                this.valueType = preferences_2.SettingValueType.ArrayOfString;
            }
            else if ((0, types_1.isArray)(this.setting.type) && this.setting.type.indexOf(preferences_2.SettingValueType.Null) > -1 && this.setting.type.length === 2) {
                if (this.setting.type.indexOf(preferences_2.SettingValueType.Integer) > -1) {
                    this.valueType = preferences_2.SettingValueType.NullableInteger;
                }
                else if (this.setting.type.indexOf(preferences_2.SettingValueType.Number) > -1) {
                    this.valueType = preferences_2.SettingValueType.NullableNumber;
                }
                else {
                    this.valueType = preferences_2.SettingValueType.Complex;
                }
            }
            else if (isObjectSetting(this.setting)) {
                this.valueType = preferences_2.SettingValueType.Object;
            }
            else {
                this.valueType = preferences_2.SettingValueType.Complex;
            }
        }
        matchesAllTags(tagFilters) {
            if (!tagFilters || !tagFilters.size) {
                return true;
            }
            if (this.tags) {
                let hasFilteredTag = true;
                tagFilters.forEach(tag => {
                    hasFilteredTag = hasFilteredTag && this.tags.has(tag);
                });
                return hasFilteredTag;
            }
            else {
                return false;
            }
        }
        matchesScope(scope, isRemote) {
            const configTarget = uri_1.URI.isUri(scope) ? 5 /* WORKSPACE_FOLDER */ : scope;
            if (!this.setting.scope) {
                return true;
            }
            if (configTarget === 5 /* WORKSPACE_FOLDER */) {
                return configuration_1.FOLDER_SCOPES.indexOf(this.setting.scope) !== -1;
            }
            if (configTarget === 4 /* WORKSPACE */) {
                return configuration_1.WORKSPACE_SCOPES.indexOf(this.setting.scope) !== -1;
            }
            if (configTarget === 3 /* USER_REMOTE */) {
                return configuration_1.REMOTE_MACHINE_SCOPES.indexOf(this.setting.scope) !== -1;
            }
            if (configTarget === 2 /* USER_LOCAL */ && isRemote) {
                return configuration_1.LOCAL_MACHINE_SCOPES.indexOf(this.setting.scope) !== -1;
            }
            return true;
        }
        matchesAnyExtension(extensionFilters) {
            if (!extensionFilters || !extensionFilters.size) {
                return true;
            }
            if (!this.setting.extensionInfo) {
                return false;
            }
            return Array.from(extensionFilters).some(extensionId => extensionId.toLowerCase() === this.setting.extensionInfo.id.toLowerCase());
        }
        matchesAnyFeature(featureFilters) {
            if (!featureFilters || !featureFilters.size) {
                return true;
            }
            const features = settingsLayout_1.tocData.children.find(child => child.id === 'features');
            return Array.from(featureFilters).some(filter => {
                var _a;
                if (features && features.children) {
                    const feature = features.children.find(feature => 'features/' + filter === feature.id);
                    if (feature) {
                        const patterns = (_a = feature.settings) === null || _a === void 0 ? void 0 : _a.map(setting => createSettingMatchRegExp(setting));
                        return patterns && !this.setting.extensionInfo && patterns.some(pattern => pattern.test(this.setting.key.toLowerCase()));
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        }
        matchesAnyId(idFilters) {
            if (!idFilters || !idFilters.size) {
                return true;
            }
            return idFilters.has(this.setting.key);
        }
    }
    exports.SettingsTreeSettingElement = SettingsTreeSettingElement;
    SettingsTreeSettingElement.MAX_DESC_LINES = 20;
    function createSettingMatchRegExp(pattern) {
        pattern = (0, strings_1.escapeRegExpCharacters)(pattern)
            .replace(/\\\*/g, '.*');
        return new RegExp(`^${pattern}$`, 'i');
    }
    let SettingsTreeModel = class SettingsTreeModel {
        constructor(_viewState, _isWorkspaceTrusted, _configurationService) {
            this._viewState = _viewState;
            this._isWorkspaceTrusted = _isWorkspaceTrusted;
            this._configurationService = _configurationService;
            this._treeElementsBySettingName = new Map();
        }
        get root() {
            return this._root;
        }
        update(newTocRoot = this._tocRoot) {
            this._treeElementsBySettingName.clear();
            const newRoot = this.createSettingsTreeGroupElement(newTocRoot);
            if (newRoot.children[0] instanceof SettingsTreeGroupElement) {
                newRoot.children[0].isFirstGroup = true;
            }
            if (this._root) {
                this.disposeChildren(this._root.children);
                this._root.children = newRoot.children;
            }
            else {
                this._root = newRoot;
            }
        }
        updateWorkspaceTrust(workspaceTrusted) {
            this._isWorkspaceTrusted = workspaceTrusted;
            this.updateRequireTrustedTargetElements();
        }
        disposeChildren(children) {
            for (let child of children) {
                this.recursiveDispose(child);
            }
        }
        recursiveDispose(element) {
            if (element instanceof SettingsTreeGroupElement) {
                this.disposeChildren(element.children);
            }
            element.dispose();
        }
        getElementsByName(name) {
            return (0, types_1.withUndefinedAsNull)(this._treeElementsBySettingName.get(name));
        }
        updateElementsByName(name) {
            if (!this._treeElementsBySettingName.has(name)) {
                return;
            }
            this.updateSettings(this._treeElementsBySettingName.get(name));
        }
        updateRequireTrustedTargetElements() {
            this.updateSettings(arrays.flatten([...this._treeElementsBySettingName.values()]).filter(s => s.isUntrusted));
        }
        updateSettings(settings) {
            settings.forEach(element => {
                const inspectResult = inspectSetting(element.setting.key, this._viewState.settingsTarget, this._configurationService);
                element.update(inspectResult, this._isWorkspaceTrusted);
            });
        }
        createSettingsTreeGroupElement(tocEntry, parent) {
            const depth = parent ? this.getDepth(parent) + 1 : 0;
            const element = new SettingsTreeGroupElement(tocEntry.id, undefined, tocEntry.label, depth, false);
            const children = [];
            if (tocEntry.settings) {
                const settingChildren = tocEntry.settings.map(s => this.createSettingsTreeSettingElement(s, element))
                    .filter(el => el.setting.deprecationMessage ? el.isConfigured : true);
                children.push(...settingChildren);
            }
            if (tocEntry.children) {
                const groupChildren = tocEntry.children.map(child => this.createSettingsTreeGroupElement(child, element));
                children.push(...groupChildren);
            }
            element.children = children;
            return element;
        }
        getDepth(element) {
            if (element.parent) {
                return 1 + this.getDepth(element.parent);
            }
            else {
                return 0;
            }
        }
        createSettingsTreeSettingElement(setting, parent) {
            const inspectResult = inspectSetting(setting.key, this._viewState.settingsTarget, this._configurationService);
            const element = new SettingsTreeSettingElement(setting, parent, inspectResult, this._isWorkspaceTrusted);
            const nameElements = this._treeElementsBySettingName.get(setting.key) || [];
            nameElements.push(element);
            this._treeElementsBySettingName.set(setting.key, nameElements);
            return element;
        }
    };
    SettingsTreeModel = __decorate([
        __param(2, configuration_1.IWorkbenchConfigurationService)
    ], SettingsTreeModel);
    exports.SettingsTreeModel = SettingsTreeModel;
    function inspectSetting(key, target, configurationService) {
        var _a, _b, _c, _d, _e;
        const inspectOverrides = uri_1.URI.isUri(target) ? { resource: target } : undefined;
        const inspected = configurationService.inspect(key, inspectOverrides);
        const targetSelector = target === 2 /* USER_LOCAL */ ? 'userLocalValue' :
            target === 3 /* USER_REMOTE */ ? 'userRemoteValue' :
                target === 4 /* WORKSPACE */ ? 'workspaceValue' :
                    'workspaceFolderValue';
        let isConfigured = typeof inspected[targetSelector] !== 'undefined';
        if (!isConfigured) {
            if (target === 2 /* USER_LOCAL */) {
                isConfigured = !!((_a = configurationService.restrictedSettings.userLocal) === null || _a === void 0 ? void 0 : _a.includes(key));
            }
            else if (target === 3 /* USER_REMOTE */) {
                isConfigured = !!((_b = configurationService.restrictedSettings.userRemote) === null || _b === void 0 ? void 0 : _b.includes(key));
            }
            else if (target === 4 /* WORKSPACE */) {
                isConfigured = !!((_c = configurationService.restrictedSettings.workspace) === null || _c === void 0 ? void 0 : _c.includes(key));
            }
            else if (target instanceof uri_1.URI) {
                isConfigured = !!((_e = (_d = configurationService.restrictedSettings.workspaceFolder) === null || _d === void 0 ? void 0 : _d.get(target)) === null || _e === void 0 ? void 0 : _e.includes(key));
            }
        }
        return { isConfigured, inspected, targetSelector };
    }
    exports.inspectSetting = inspectSetting;
    function sanitizeId(id) {
        return id.replace(/[\.\/]/, '_');
    }
    function settingKeyToDisplayFormat(key, groupId = '') {
        const lastDotIdx = key.lastIndexOf('.');
        let category = '';
        if (lastDotIdx >= 0) {
            category = key.substr(0, lastDotIdx);
            key = key.substr(lastDotIdx + 1);
        }
        groupId = groupId.replace(/\//g, '.');
        category = trimCategoryForGroup(category, groupId);
        category = wordifyKey(category);
        const label = wordifyKey(key);
        return { category, label };
    }
    exports.settingKeyToDisplayFormat = settingKeyToDisplayFormat;
    function wordifyKey(key) {
        key = key
            .replace(/\.([a-z0-9])/g, (_, p1) => ` › ${p1.toUpperCase()}`) // Replace dot with spaced '>'
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // Camel case to spacing, fooBar => foo Bar
            .replace(/^[a-z]/g, match => match.toUpperCase()) // Upper casing all first letters, foo => Foo
            .replace(/\b\w+\b/g, match => {
            return settingsLayout_1.knownAcronyms.has(match.toLowerCase()) ?
                match.toUpperCase() :
                match;
        });
        for (const [k, v] of settingsLayout_1.knownTermMappings) {
            key = key.replace(new RegExp(`\\b${k}\\b`, 'gi'), v);
        }
        return key;
    }
    function trimCategoryForGroup(category, groupId) {
        const doTrim = (forward) => {
            const parts = groupId.split('.');
            while (parts.length) {
                const reg = new RegExp(`^${parts.join('\\.')}(\\.|$)`, 'i');
                if (reg.test(category)) {
                    return category.replace(reg, '');
                }
                if (forward) {
                    parts.pop();
                }
                else {
                    parts.shift();
                }
            }
            return null;
        };
        let trimmed = doTrim(true);
        if (trimmed === null) {
            trimmed = doTrim(false);
        }
        if (trimmed === null) {
            trimmed = category;
        }
        return trimmed;
    }
    function isExcludeSetting(setting) {
        return setting.key === 'files.exclude' ||
            setting.key === 'search.exclude' ||
            setting.key === 'files.watcherExclude';
    }
    exports.isExcludeSetting = isExcludeSetting;
    function isObjectRenderableSchema({ type }) {
        return type === 'string' || type === 'boolean';
    }
    function isObjectSetting({ type, objectProperties, objectPatternProperties, objectAdditionalProperties }) {
        if (type !== 'object') {
            return false;
        }
        // object can have any shape
        if ((0, types_1.isUndefinedOrNull)(objectProperties) &&
            (0, types_1.isUndefinedOrNull)(objectPatternProperties) &&
            (0, types_1.isUndefinedOrNull)(objectAdditionalProperties)) {
            return false;
        }
        // object additional properties allow it to have any shape
        if (objectAdditionalProperties === true) {
            return false;
        }
        const schemas = [...Object.values(objectProperties !== null && objectProperties !== void 0 ? objectProperties : {}), ...Object.values(objectPatternProperties !== null && objectPatternProperties !== void 0 ? objectPatternProperties : {})];
        if (typeof objectAdditionalProperties === 'object') {
            schemas.push(objectAdditionalProperties);
        }
        // Flatten anyof schemas
        const flatSchemas = arrays.flatten(schemas.map((schema) => {
            if (Array.isArray(schema.anyOf)) {
                return schema.anyOf;
            }
            return [schema];
        }));
        // This should not render boolean only objects
        return flatSchemas.every(isObjectRenderableSchema) && flatSchemas.some(({ type }) => type === 'string');
    }
    function settingTypeEnumRenderable(_type) {
        const enumRenderableSettingTypes = ['string', 'boolean', 'null', 'integer', 'number'];
        const type = (0, types_1.isArray)(_type) ? _type : [_type];
        return type.every(type => enumRenderableSettingTypes.indexOf(type) > -1);
    }
    var SearchResultIdx;
    (function (SearchResultIdx) {
        SearchResultIdx[SearchResultIdx["Local"] = 0] = "Local";
        SearchResultIdx[SearchResultIdx["Remote"] = 1] = "Remote";
        SearchResultIdx[SearchResultIdx["NewExtensions"] = 2] = "NewExtensions";
    })(SearchResultIdx = exports.SearchResultIdx || (exports.SearchResultIdx = {}));
    let SearchResultModel = class SearchResultModel extends SettingsTreeModel {
        constructor(viewState, isWorkspaceTrusted, configurationService, environmentService) {
            super(viewState, isWorkspaceTrusted, configurationService);
            this.environmentService = environmentService;
            this.rawSearchResults = null;
            this.cachedUniqueSearchResults = null;
            this.newExtensionSearchResults = null;
            this.id = 'searchResultModel';
            this.update({ id: 'searchResultModel', label: '' });
        }
        getUniqueResults() {
            if (this.cachedUniqueSearchResults) {
                return this.cachedUniqueSearchResults;
            }
            if (!this.rawSearchResults) {
                return [];
            }
            const localMatchKeys = new Set();
            const localResult = this.rawSearchResults[0 /* Local */];
            if (localResult) {
                localResult.filterMatches.forEach(m => localMatchKeys.add(m.setting.key));
            }
            const remoteResult = this.rawSearchResults[1 /* Remote */];
            if (remoteResult) {
                remoteResult.filterMatches = remoteResult.filterMatches.filter(m => !localMatchKeys.has(m.setting.key));
            }
            if (remoteResult) {
                this.newExtensionSearchResults = this.rawSearchResults[2 /* NewExtensions */];
            }
            this.cachedUniqueSearchResults = [localResult, remoteResult];
            return this.cachedUniqueSearchResults;
        }
        getRawResults() {
            return this.rawSearchResults || [];
        }
        setResult(order, result) {
            this.cachedUniqueSearchResults = null;
            this.newExtensionSearchResults = null;
            this.rawSearchResults = this.rawSearchResults || [];
            if (!result) {
                delete this.rawSearchResults[order];
                return;
            }
            if (result.exactMatch) {
                this.rawSearchResults = [];
            }
            this.rawSearchResults[order] = result;
            this.updateChildren();
        }
        updateChildren() {
            this.update({
                id: 'searchResultModel',
                label: 'searchResultModel',
                settings: this.getFlatSettings()
            });
            // Save time, filter children in the search model instead of relying on the tree filter, which still requires heights to be calculated.
            const isRemote = !!this.environmentService.remoteAuthority;
            this.root.children = this.root.children
                .filter(child => child instanceof SettingsTreeSettingElement && child.matchesAllTags(this._viewState.tagFilters) && child.matchesScope(this._viewState.settingsTarget, isRemote) && child.matchesAnyExtension(this._viewState.extensionFilters) && child.matchesAnyId(this._viewState.idFilters) && (this.containsValidFeature() ? child.matchesAnyFeature(this._viewState.featureFilters) : true));
            if (this.newExtensionSearchResults && this.newExtensionSearchResults.filterMatches.length) {
                const resultExtensionIds = this.newExtensionSearchResults.filterMatches
                    .map(result => result.setting)
                    .filter(setting => setting.extensionName && setting.extensionPublisher)
                    .map(setting => `${setting.extensionPublisher}.${setting.extensionName}`);
                const newExtElement = new SettingsTreeNewExtensionsElement('newExtensions', arrays.distinct(resultExtensionIds));
                newExtElement.parent = this._root;
                this._root.children.push(newExtElement);
            }
        }
        containsValidFeature() {
            if (!this._viewState.featureFilters || !this._viewState.featureFilters.size || !settingsLayout_1.tocData.children) {
                return false;
            }
            const features = settingsLayout_1.tocData.children.find(child => child.id === 'features');
            if (features && features.children) {
                return Array.from(this._viewState.featureFilters).some(filter => {
                    var _a;
                    return (_a = features.children) === null || _a === void 0 ? void 0 : _a.find(feature => 'features/' + filter === feature.id);
                });
            }
            else {
                return false;
            }
        }
        getFlatSettings() {
            const flatSettings = [];
            arrays.coalesce(this.getUniqueResults())
                .forEach(r => {
                flatSettings.push(...r.filterMatches.map(m => m.setting));
            });
            return flatSettings;
        }
    };
    SearchResultModel = __decorate([
        __param(2, configuration_1.IWorkbenchConfigurationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService)
    ], SearchResultModel);
    exports.SearchResultModel = SearchResultModel;
    const tagRegex = /(^|\s)@tag:("([^"]*)"|[^"]\S*)/g;
    const extensionRegex = /(^|\s)@ext:("([^"]*)"|[^"]\S*)?/g;
    const featureRegex = /(^|\s)@feature:("([^"]*)"|[^"]\S*)?/g;
    const idRegex = /(^|\s)@id:("([^"]*)"|[^"]\S*)?/g;
    function parseQuery(query) {
        const tags = [];
        const extensions = [];
        const features = [];
        const ids = [];
        query = query.replace(tagRegex, (_, __, quotedTag, tag) => {
            tags.push(tag || quotedTag);
            return '';
        });
        query = query.replace(`@${preferences_1.MODIFIED_SETTING_TAG}`, () => {
            tags.push(preferences_1.MODIFIED_SETTING_TAG);
            return '';
        });
        query = query.replace(extensionRegex, (_, __, quotedExtensionId, extensionId) => {
            const extensionIdQuery = extensionId || quotedExtensionId;
            if (extensionIdQuery) {
                extensions.push(...extensionIdQuery.split(',').map(s => s.trim()).filter(s => !(0, strings_1.isFalsyOrWhitespace)(s)));
            }
            return '';
        });
        query = query.replace(featureRegex, (_, __, quotedFeature, feature) => {
            const featureQuery = feature || quotedFeature;
            if (featureQuery) {
                features.push(...featureQuery.split(',').map(s => s.trim()).filter(s => !(0, strings_1.isFalsyOrWhitespace)(s)));
            }
            return '';
        });
        query = query.replace(idRegex, (_, __, quotedId, id) => {
            const idRegex = id || quotedId;
            if (idRegex) {
                ids.push(...idRegex.split(',').map(s => s.trim()).filter(s => !(0, strings_1.isFalsyOrWhitespace)(s)));
            }
            return '';
        });
        query = query.trim();
        return {
            tags,
            extensionFilters: extensions,
            featureFilters: features,
            idFilters: ids,
            query
        };
    }
    exports.parseQuery = parseQuery;
});
//# sourceMappingURL=settingsTreeModels.js.map