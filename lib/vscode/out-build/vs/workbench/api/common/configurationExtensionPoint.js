/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/api/common/configurationExtensionPoint", "vs/base/common/objects", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/configuration/common/configuration", "vs/base/common/types", "vs/platform/extensions/common/extensions"], function (require, exports, nls, objects, platform_1, extensionsRegistry_1, configurationRegistry_1, jsonContributionRegistry_1, configuration_1, types_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const configurationEntrySchema = {
        type: 'object',
        defaultSnippets: [{ body: { title: '', properties: {} } }],
        properties: {
            title: {
                description: nls.localize(0, null),
                type: 'string'
            },
            properties: {
                description: nls.localize(1, null),
                type: 'object',
                propertyNames: {
                    pattern: '\\S+',
                    patternErrorMessage: nls.localize(2, null),
                },
                additionalProperties: {
                    anyOf: [
                        { $ref: 'http://json-schema.org/draft-07/schema#' },
                        {
                            type: 'object',
                            properties: {
                                isExecutable: {
                                    type: 'boolean',
                                    deprecationMessage: 'This property is deprecated. Instead use `scope` property and set it to `machine` value.'
                                },
                                scope: {
                                    type: 'string',
                                    enum: ['application', 'machine', 'window', 'resource', 'language-overridable', 'machine-overridable'],
                                    default: 'window',
                                    enumDescriptions: [
                                        nls.localize(3, null),
                                        nls.localize(4, null),
                                        nls.localize(5, null),
                                        nls.localize(6, null),
                                        nls.localize(7, null),
                                        nls.localize(8, null)
                                    ],
                                    description: nls.localize(9, null)
                                },
                                enumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize(10, null)
                                },
                                markdownEnumDescriptions: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    description: nls.localize(11, null)
                                },
                                markdownDescription: {
                                    type: 'string',
                                    description: nls.localize(12, null)
                                },
                                deprecationMessage: {
                                    type: 'string',
                                    description: nls.localize(13, null)
                                },
                                markdownDeprecationMessage: {
                                    type: 'string',
                                    description: nls.localize(14, null)
                                }
                            }
                        }
                    ]
                }
            }
        }
    };
    // BEGIN VSCode extension point `configurationDefaults`
    const defaultConfigurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'configurationDefaults',
        jsonSchema: {
            description: nls.localize(15, null),
            type: 'object',
            patternProperties: {
                '^\\[.*\\]$': {
                    type: 'object',
                    default: {},
                    $ref: configurationRegistry_1.resourceLanguageSettingsSchemaId,
                }
            },
            errorMessage: nls.localize(16, null),
            additionalProperties: false
        }
    });
    defaultConfigurationExtPoint.setHandler((extensions, { added, removed }) => {
        if (removed.length) {
            const removedDefaultConfigurations = removed.map(extension => objects.deepClone(extension.value));
            configurationRegistry.deregisterDefaultConfigurations(removedDefaultConfigurations);
        }
        if (added.length) {
            const addedDefaultConfigurations = added.map(extension => {
                const defaults = objects.deepClone(extension.value);
                for (const key of Object.keys(defaults)) {
                    if (!configurationRegistry_1.OVERRIDE_PROPERTY_PATTERN.test(key) || typeof defaults[key] !== 'object') {
                        extension.collector.warn(nls.localize(17, null, key));
                        delete defaults[key];
                    }
                }
                return defaults;
            });
            configurationRegistry.registerDefaultConfigurations(addedDefaultConfigurations);
        }
    });
    // END VSCode extension point `configurationDefaults`
    // BEGIN VSCode extension point `configuration`
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'configuration',
        deps: [defaultConfigurationExtPoint],
        jsonSchema: {
            description: nls.localize(18, null),
            oneOf: [
                configurationEntrySchema,
                {
                    type: 'array',
                    items: configurationEntrySchema
                }
            ]
        }
    });
    const extensionConfigurations = new Map();
    configurationExtPoint.setHandler((extensions, { added, removed }) => {
        if (removed.length) {
            const removedConfigurations = [];
            for (const extension of removed) {
                const key = extensions_1.ExtensionIdentifier.toKey(extension.description.identifier);
                removedConfigurations.push(...(extensionConfigurations.get(key) || []));
                extensionConfigurations.delete(key);
            }
            configurationRegistry.deregisterConfigurations(removedConfigurations);
        }
        function handleConfiguration(node, extension) {
            var _a, _b, _c;
            const configurations = [];
            let configuration = objects.deepClone(node);
            if (configuration.title && (typeof configuration.title !== 'string')) {
                extension.collector.error(nls.localize(19, null));
            }
            validateProperties(configuration, extension);
            configuration.id = node.id || extension.description.identifier.value;
            configuration.extensionInfo = { id: extension.description.identifier.value, restrictedConfigurations: ((_b = (_a = extension.description.capabilities) === null || _a === void 0 ? void 0 : _a.untrustedWorkspaces) === null || _b === void 0 ? void 0 : _b.supported) === 'limited' ? (_c = extension.description.capabilities) === null || _c === void 0 ? void 0 : _c.untrustedWorkspaces.restrictedConfigurations : undefined };
            configuration.title = configuration.title || extension.description.displayName || extension.description.identifier.value;
            configurations.push(configuration);
            return configurations;
        }
        if (added.length) {
            const addedConfigurations = [];
            for (let extension of added) {
                const configurations = [];
                const value = extension.value;
                if (Array.isArray(value)) {
                    value.forEach(v => configurations.push(...handleConfiguration(v, extension)));
                }
                else {
                    configurations.push(...handleConfiguration(value, extension));
                }
                extensionConfigurations.set(extensions_1.ExtensionIdentifier.toKey(extension.description.identifier), configurations);
                addedConfigurations.push(...configurations);
            }
            configurationRegistry.registerConfigurations(addedConfigurations, false);
        }
    });
    // END VSCode extension point `configuration`
    function validateProperties(configuration, extension) {
        let properties = configuration.properties;
        if (properties) {
            if (typeof properties !== 'object') {
                extension.collector.error(nls.localize(20, null));
                configuration.properties = {};
            }
            for (let key in properties) {
                const message = (0, configurationRegistry_1.validateProperty)(key);
                if (message) {
                    delete properties[key];
                    extension.collector.warn(message);
                    continue;
                }
                const propertyConfiguration = properties[key];
                if (!(0, types_1.isObject)(propertyConfiguration)) {
                    delete properties[key];
                    extension.collector.error(nls.localize(21, null, key));
                    continue;
                }
                if (propertyConfiguration.scope) {
                    if (propertyConfiguration.scope.toString() === 'application') {
                        propertyConfiguration.scope = 1 /* APPLICATION */;
                    }
                    else if (propertyConfiguration.scope.toString() === 'machine') {
                        propertyConfiguration.scope = 2 /* MACHINE */;
                    }
                    else if (propertyConfiguration.scope.toString() === 'resource') {
                        propertyConfiguration.scope = 4 /* RESOURCE */;
                    }
                    else if (propertyConfiguration.scope.toString() === 'machine-overridable') {
                        propertyConfiguration.scope = 6 /* MACHINE_OVERRIDABLE */;
                    }
                    else if (propertyConfiguration.scope.toString() === 'language-overridable') {
                        propertyConfiguration.scope = 5 /* LANGUAGE_OVERRIDABLE */;
                    }
                    else {
                        propertyConfiguration.scope = 3 /* WINDOW */;
                    }
                }
                else {
                    propertyConfiguration.scope = 3 /* WINDOW */;
                }
            }
        }
        let subNodes = configuration.allOf;
        if (subNodes) {
            extension.collector.error(nls.localize(22, null));
            for (let node of subNodes) {
                validateProperties(node, extension);
            }
        }
    }
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    jsonRegistry.registerSchema('vscode://schemas/workspaceConfig', {
        allowComments: true,
        allowTrailingCommas: true,
        default: {
            folders: [
                {
                    path: ''
                }
            ],
            settings: {}
        },
        required: ['folders'],
        properties: {
            'folders': {
                minItems: 0,
                uniqueItems: true,
                description: nls.localize(23, null),
                items: {
                    type: 'object',
                    default: { path: '' },
                    oneOf: [{
                            properties: {
                                path: {
                                    type: 'string',
                                    description: nls.localize(24, null)
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize(25, null)
                                }
                            },
                            required: ['path']
                        }, {
                            properties: {
                                uri: {
                                    type: 'string',
                                    description: nls.localize(26, null)
                                },
                                name: {
                                    type: 'string',
                                    description: nls.localize(27, null)
                                }
                            },
                            required: ['uri']
                        }]
                }
            },
            'settings': {
                type: 'object',
                default: {},
                description: nls.localize(28, null),
                $ref: configuration_1.workspaceSettingsSchemaId
            },
            'launch': {
                type: 'object',
                default: { configurations: [], compounds: [] },
                description: nls.localize(29, null),
                $ref: configuration_1.launchSchemaId
            },
            'tasks': {
                type: 'object',
                default: { version: '2.0.0', tasks: [] },
                description: nls.localize(30, null),
                $ref: configuration_1.tasksSchemaId
            },
            'extensions': {
                type: 'object',
                default: {},
                description: nls.localize(31, null),
                $ref: 'vscode://schemas/extensions'
            },
            'remoteAuthority': {
                type: 'string',
                doNotSuggest: true,
                description: nls.localize(32, null),
            }
        },
        errorMessage: nls.localize(33, null)
    });
});
//# sourceMappingURL=configurationExtensionPoint.js.map