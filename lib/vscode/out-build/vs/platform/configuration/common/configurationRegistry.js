/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/configuration/common/configurationRegistry", "vs/base/common/event", "vs/platform/registry/common/platform", "vs/base/common/types", "vs/platform/jsonschemas/common/jsonContributionRegistry"], function (require, exports, nls, event_1, platform_1, types, jsonContributionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getScopes = exports.validateProperty = exports.getDefaultValue = exports.overrideIdentifierFromKey = exports.OVERRIDE_PROPERTY_PATTERN = exports.resourceLanguageSettingsSchemaId = exports.resourceSettings = exports.windowSettings = exports.machineOverridableSettings = exports.machineSettings = exports.applicationSettings = exports.allSettings = exports.ConfigurationScope = exports.Extensions = void 0;
    exports.Extensions = {
        Configuration: 'base.contributions.configuration'
    };
    var ConfigurationScope;
    (function (ConfigurationScope) {
        /**
         * Application specific configuration, which can be configured only in local user settings.
         */
        ConfigurationScope[ConfigurationScope["APPLICATION"] = 1] = "APPLICATION";
        /**
         * Machine specific configuration, which can be configured only in local and remote user settings.
         */
        ConfigurationScope[ConfigurationScope["MACHINE"] = 2] = "MACHINE";
        /**
         * Window specific configuration, which can be configured in the user or workspace settings.
         */
        ConfigurationScope[ConfigurationScope["WINDOW"] = 3] = "WINDOW";
        /**
         * Resource specific configuration, which can be configured in the user, workspace or folder settings.
         */
        ConfigurationScope[ConfigurationScope["RESOURCE"] = 4] = "RESOURCE";
        /**
         * Resource specific configuration that can be configured in language specific settings
         */
        ConfigurationScope[ConfigurationScope["LANGUAGE_OVERRIDABLE"] = 5] = "LANGUAGE_OVERRIDABLE";
        /**
         * Machine specific configuration that can also be configured in workspace or folder settings.
         */
        ConfigurationScope[ConfigurationScope["MACHINE_OVERRIDABLE"] = 6] = "MACHINE_OVERRIDABLE";
    })(ConfigurationScope = exports.ConfigurationScope || (exports.ConfigurationScope = {}));
    exports.allSettings = { properties: {}, patternProperties: {} };
    exports.applicationSettings = { properties: {}, patternProperties: {} };
    exports.machineSettings = { properties: {}, patternProperties: {} };
    exports.machineOverridableSettings = { properties: {}, patternProperties: {} };
    exports.windowSettings = { properties: {}, patternProperties: {} };
    exports.resourceSettings = { properties: {}, patternProperties: {} };
    exports.resourceLanguageSettingsSchemaId = 'vscode://schemas/settings/resourceLanguage';
    const contributionRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    class ConfigurationRegistry {
        constructor() {
            this.overrideIdentifiers = new Set();
            this._onDidSchemaChange = new event_1.Emitter();
            this.onDidSchemaChange = this._onDidSchemaChange.event;
            this._onDidUpdateConfiguration = new event_1.Emitter();
            this.onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
            this.defaultValues = {};
            this.defaultLanguageConfigurationOverridesNode = {
                id: 'defaultOverrides',
                title: nls.localize(0, null),
                properties: {}
            };
            this.configurationContributors = [this.defaultLanguageConfigurationOverridesNode];
            this.resourceLanguageSettingsSchema = { properties: {}, patternProperties: {}, additionalProperties: false, errorMessage: 'Unknown editor configuration setting', allowTrailingCommas: true, allowComments: true };
            this.configurationProperties = {};
            this.excludedConfigurationProperties = {};
            contributionRegistry.registerSchema(exports.resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
        }
        registerConfiguration(configuration, validate = true) {
            this.registerConfigurations([configuration], validate);
        }
        registerConfigurations(configurations, validate = true) {
            const properties = [];
            configurations.forEach(configuration => {
                properties.push(...this.validateAndRegisterProperties(configuration, validate, configuration.extensionInfo)); // fills in defaults
                this.configurationContributors.push(configuration);
                this.registerJSONConfiguration(configuration);
            });
            contributionRegistry.registerSchema(exports.resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire(properties);
        }
        deregisterConfigurations(configurations) {
            const properties = [];
            const deregisterConfiguration = (configuration) => {
                if (configuration.properties) {
                    for (const key in configuration.properties) {
                        properties.push(key);
                        delete this.configurationProperties[key];
                        this.removeFromSchema(key, configuration.properties[key]);
                    }
                }
                if (configuration.allOf) {
                    configuration.allOf.forEach(node => deregisterConfiguration(node));
                }
            };
            for (const configuration of configurations) {
                deregisterConfiguration(configuration);
                const index = this.configurationContributors.indexOf(configuration);
                if (index !== -1) {
                    this.configurationContributors.splice(index, 1);
                }
            }
            contributionRegistry.registerSchema(exports.resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire(properties);
        }
        registerDefaultConfigurations(defaultConfigurations) {
            const properties = [];
            const overrideIdentifiers = [];
            for (const defaultConfiguration of defaultConfigurations) {
                for (const key in defaultConfiguration) {
                    properties.push(key);
                    if (exports.OVERRIDE_PROPERTY_PATTERN.test(key)) {
                        this.defaultValues[key] = Object.assign(Object.assign({}, (this.defaultValues[key] || {})), defaultConfiguration[key]);
                        const property = {
                            type: 'object',
                            default: this.defaultValues[key],
                            description: nls.localize(1, null, key),
                            $ref: exports.resourceLanguageSettingsSchemaId
                        };
                        overrideIdentifiers.push(overrideIdentifierFromKey(key));
                        this.configurationProperties[key] = property;
                        this.defaultLanguageConfigurationOverridesNode.properties[key] = property;
                    }
                    else {
                        this.defaultValues[key] = defaultConfiguration[key];
                        const property = this.configurationProperties[key];
                        if (property) {
                            this.updatePropertyDefaultValue(key, property);
                            this.updateSchema(key, property);
                        }
                    }
                }
            }
            this.registerOverrideIdentifiers(overrideIdentifiers);
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire(properties);
        }
        deregisterDefaultConfigurations(defaultConfigurations) {
            const properties = [];
            for (const defaultConfiguration of defaultConfigurations) {
                for (const key in defaultConfiguration) {
                    properties.push(key);
                    delete this.defaultValues[key];
                    if (exports.OVERRIDE_PROPERTY_PATTERN.test(key)) {
                        delete this.configurationProperties[key];
                        delete this.defaultLanguageConfigurationOverridesNode.properties[key];
                    }
                    else {
                        const property = this.configurationProperties[key];
                        if (property) {
                            this.updatePropertyDefaultValue(key, property);
                            this.updateSchema(key, property);
                        }
                    }
                }
            }
            this.updateOverridePropertyPatternKey();
            this._onDidSchemaChange.fire();
            this._onDidUpdateConfiguration.fire(properties);
        }
        notifyConfigurationSchemaUpdated(...configurations) {
            this._onDidSchemaChange.fire();
        }
        registerOverrideIdentifiers(overrideIdentifiers) {
            for (const overrideIdentifier of overrideIdentifiers) {
                this.overrideIdentifiers.add(overrideIdentifier);
            }
            this.updateOverridePropertyPatternKey();
        }
        validateAndRegisterProperties(configuration, validate = true, extensionInfo, scope = 3 /* WINDOW */) {
            var _a;
            scope = types.isUndefinedOrNull(configuration.scope) ? scope : configuration.scope;
            let propertyKeys = [];
            let properties = configuration.properties;
            if (properties) {
                for (let key in properties) {
                    if (validate && validateProperty(key)) {
                        delete properties[key];
                        continue;
                    }
                    const property = properties[key];
                    // update default value
                    this.updatePropertyDefaultValue(key, property);
                    // update scope
                    if (exports.OVERRIDE_PROPERTY_PATTERN.test(key)) {
                        property.scope = undefined; // No scope for overridable properties `[${identifier}]`
                    }
                    else {
                        property.scope = types.isUndefinedOrNull(property.scope) ? scope : property.scope;
                        property.restricted = types.isUndefinedOrNull(property.restricted) ? !!((_a = extensionInfo === null || extensionInfo === void 0 ? void 0 : extensionInfo.restrictedConfigurations) === null || _a === void 0 ? void 0 : _a.includes(key)) : property.restricted;
                    }
                    // Add to properties maps
                    // Property is included by default if 'included' is unspecified
                    if (properties[key].hasOwnProperty('included') && !properties[key].included) {
                        this.excludedConfigurationProperties[key] = properties[key];
                        delete properties[key];
                        continue;
                    }
                    else {
                        this.configurationProperties[key] = properties[key];
                    }
                    if (!properties[key].deprecationMessage && properties[key].markdownDeprecationMessage) {
                        // If not set, default deprecationMessage to the markdown source
                        properties[key].deprecationMessage = properties[key].markdownDeprecationMessage;
                    }
                    propertyKeys.push(key);
                }
            }
            let subNodes = configuration.allOf;
            if (subNodes) {
                for (let node of subNodes) {
                    propertyKeys.push(...this.validateAndRegisterProperties(node, validate, extensionInfo, scope));
                }
            }
            return propertyKeys;
        }
        getConfigurations() {
            return this.configurationContributors;
        }
        getConfigurationProperties() {
            return this.configurationProperties;
        }
        getExcludedConfigurationProperties() {
            return this.excludedConfigurationProperties;
        }
        registerJSONConfiguration(configuration) {
            const register = (configuration) => {
                let properties = configuration.properties;
                if (properties) {
                    for (const key in properties) {
                        this.updateSchema(key, properties[key]);
                    }
                }
                let subNodes = configuration.allOf;
                if (subNodes) {
                    subNodes.forEach(register);
                }
            };
            register(configuration);
        }
        updateSchema(key, property) {
            exports.allSettings.properties[key] = property;
            switch (property.scope) {
                case 1 /* APPLICATION */:
                    exports.applicationSettings.properties[key] = property;
                    break;
                case 2 /* MACHINE */:
                    exports.machineSettings.properties[key] = property;
                    break;
                case 6 /* MACHINE_OVERRIDABLE */:
                    exports.machineOverridableSettings.properties[key] = property;
                    break;
                case 3 /* WINDOW */:
                    exports.windowSettings.properties[key] = property;
                    break;
                case 4 /* RESOURCE */:
                    exports.resourceSettings.properties[key] = property;
                    break;
                case 5 /* LANGUAGE_OVERRIDABLE */:
                    exports.resourceSettings.properties[key] = property;
                    this.resourceLanguageSettingsSchema.properties[key] = property;
                    break;
            }
        }
        removeFromSchema(key, property) {
            delete exports.allSettings.properties[key];
            switch (property.scope) {
                case 1 /* APPLICATION */:
                    delete exports.applicationSettings.properties[key];
                    break;
                case 2 /* MACHINE */:
                    delete exports.machineSettings.properties[key];
                    break;
                case 6 /* MACHINE_OVERRIDABLE */:
                    delete exports.machineOverridableSettings.properties[key];
                    break;
                case 3 /* WINDOW */:
                    delete exports.windowSettings.properties[key];
                    break;
                case 4 /* RESOURCE */:
                case 5 /* LANGUAGE_OVERRIDABLE */:
                    delete exports.resourceSettings.properties[key];
                    break;
            }
        }
        updateOverridePropertyPatternKey() {
            for (const overrideIdentifier of this.overrideIdentifiers.values()) {
                const overrideIdentifierProperty = `[${overrideIdentifier}]`;
                const resourceLanguagePropertiesSchema = {
                    type: 'object',
                    description: nls.localize(2, null),
                    errorMessage: nls.localize(3, null),
                    $ref: exports.resourceLanguageSettingsSchemaId,
                };
                this.updatePropertyDefaultValue(overrideIdentifierProperty, resourceLanguagePropertiesSchema);
                exports.allSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.applicationSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.machineSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.machineOverridableSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.windowSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
                exports.resourceSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            }
            this._onDidSchemaChange.fire();
        }
        updatePropertyDefaultValue(key, property) {
            let defaultValue = this.defaultValues[key];
            if (types.isUndefined(defaultValue)) {
                defaultValue = property.default;
            }
            if (types.isUndefined(defaultValue)) {
                defaultValue = getDefaultValue(property.type);
            }
            property.default = defaultValue;
        }
    }
    const OVERRIDE_PROPERTY = '\\[.*\\]$';
    exports.OVERRIDE_PROPERTY_PATTERN = new RegExp(OVERRIDE_PROPERTY);
    function overrideIdentifierFromKey(key) {
        return key.substring(1, key.length - 1);
    }
    exports.overrideIdentifierFromKey = overrideIdentifierFromKey;
    function getDefaultValue(type) {
        const t = Array.isArray(type) ? type[0] : type;
        switch (t) {
            case 'boolean':
                return false;
            case 'integer':
            case 'number':
                return 0;
            case 'string':
                return '';
            case 'array':
                return [];
            case 'object':
                return {};
            default:
                return null;
        }
    }
    exports.getDefaultValue = getDefaultValue;
    const configurationRegistry = new ConfigurationRegistry();
    platform_1.Registry.add(exports.Extensions.Configuration, configurationRegistry);
    function validateProperty(property) {
        if (!property.trim()) {
            return nls.localize(4, null);
        }
        if (exports.OVERRIDE_PROPERTY_PATTERN.test(property)) {
            return nls.localize(5, null, property);
        }
        if (configurationRegistry.getConfigurationProperties()[property] !== undefined) {
            return nls.localize(6, null, property);
        }
        return null;
    }
    exports.validateProperty = validateProperty;
    function getScopes() {
        const scopes = [];
        const configurationProperties = configurationRegistry.getConfigurationProperties();
        for (const key of Object.keys(configurationProperties)) {
            scopes.push([key, configurationProperties[key].scope]);
        }
        scopes.push(['launch', 4 /* RESOURCE */]);
        scopes.push(['task', 4 /* RESOURCE */]);
        return scopes;
    }
    exports.getScopes = getScopes;
});
//# sourceMappingURL=configurationRegistry.js.map