/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/errors", "vs/base/common/severity", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/platform/extensions/common/extensions"], function (require, exports, nls, errors_1, severity_1, extensionManagement_1, jsonContributionRegistry_1, platform_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsRegistry = exports.ExtensionsRegistryImpl = exports.schema = exports.ExtensionPoint = exports.ExtensionPointUserDelta = exports.ExtensionMessageCollector = void 0;
    const schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    class ExtensionMessageCollector {
        constructor(messageHandler, extension, extensionPointId) {
            this._messageHandler = messageHandler;
            this._extension = extension;
            this._extensionPointId = extensionPointId;
        }
        _msg(type, message) {
            this._messageHandler({
                type: type,
                message: message,
                extensionId: this._extension.identifier,
                extensionPointId: this._extensionPointId
            });
        }
        error(message) {
            this._msg(severity_1.default.Error, message);
        }
        warn(message) {
            this._msg(severity_1.default.Warning, message);
        }
        info(message) {
            this._msg(severity_1.default.Info, message);
        }
    }
    exports.ExtensionMessageCollector = ExtensionMessageCollector;
    class ExtensionPointUserDelta {
        constructor(added, removed) {
            this.added = added;
            this.removed = removed;
        }
        static _toSet(arr) {
            const result = new Set();
            for (let i = 0, len = arr.length; i < len; i++) {
                result.add(extensions_1.ExtensionIdentifier.toKey(arr[i].description.identifier));
            }
            return result;
        }
        static compute(previous, current) {
            if (!previous || !previous.length) {
                return new ExtensionPointUserDelta(current, []);
            }
            if (!current || !current.length) {
                return new ExtensionPointUserDelta([], previous);
            }
            const previousSet = this._toSet(previous);
            const currentSet = this._toSet(current);
            let added = current.filter(user => !previousSet.has(extensions_1.ExtensionIdentifier.toKey(user.description.identifier)));
            let removed = previous.filter(user => !currentSet.has(extensions_1.ExtensionIdentifier.toKey(user.description.identifier)));
            return new ExtensionPointUserDelta(added, removed);
        }
    }
    exports.ExtensionPointUserDelta = ExtensionPointUserDelta;
    class ExtensionPoint {
        constructor(name, defaultExtensionKind) {
            this.name = name;
            this.defaultExtensionKind = defaultExtensionKind;
            this._handler = null;
            this._users = null;
            this._delta = null;
        }
        setHandler(handler) {
            if (this._handler !== null) {
                throw new Error('Handler already set!');
            }
            this._handler = handler;
            this._handle();
        }
        acceptUsers(users) {
            this._delta = ExtensionPointUserDelta.compute(this._users, users);
            this._users = users;
            this._handle();
        }
        _handle() {
            if (this._handler === null || this._users === null || this._delta === null) {
                return;
            }
            try {
                this._handler(this._users, this._delta);
            }
            catch (err) {
                (0, errors_1.onUnexpectedError)(err);
            }
        }
    }
    exports.ExtensionPoint = ExtensionPoint;
    const extensionKindSchema = {
        type: 'string',
        enum: [
            'ui',
            'workspace',
            'web'
        ],
        enumDescriptions: [
            nls.localize(0, null),
            nls.localize(1, null),
            nls.localize(2, null)
        ],
    };
    const schemaId = 'vscode://schemas/vscode-extensions';
    exports.schema = {
        properties: {
            engines: {
                type: 'object',
                description: nls.localize(3, null),
                properties: {
                    'vscode': {
                        type: 'string',
                        description: nls.localize(4, null),
                        default: '^1.22.0',
                    }
                }
            },
            publisher: {
                description: nls.localize(5, null),
                type: 'string'
            },
            displayName: {
                description: nls.localize(6, null),
                type: 'string'
            },
            categories: {
                description: nls.localize(7, null),
                type: 'array',
                uniqueItems: true,
                items: {
                    oneOf: [{
                            type: 'string',
                            enum: extensions_1.EXTENSION_CATEGORIES,
                        },
                        {
                            type: 'string',
                            const: 'Languages',
                            deprecationMessage: nls.localize(8, null),
                        }]
                }
            },
            galleryBanner: {
                type: 'object',
                description: nls.localize(9, null),
                properties: {
                    color: {
                        description: nls.localize(10, null),
                        type: 'string'
                    },
                    theme: {
                        description: nls.localize(11, null),
                        type: 'string',
                        enum: ['dark', 'light']
                    }
                }
            },
            contributes: {
                description: nls.localize(12, null),
                type: 'object',
                properties: {
                // extensions will fill in
                },
                default: {}
            },
            preview: {
                type: 'boolean',
                description: nls.localize(13, null),
            },
            activationEvents: {
                description: nls.localize(14, null),
                type: 'array',
                items: {
                    type: 'string',
                    defaultSnippets: [
                        {
                            label: 'onLanguage',
                            description: nls.localize(15, null),
                            body: 'onLanguage:${1:languageId}'
                        },
                        {
                            label: 'onCommand',
                            description: nls.localize(16, null),
                            body: 'onCommand:${2:commandId}'
                        },
                        {
                            label: 'onDebug',
                            description: nls.localize(17, null),
                            body: 'onDebug'
                        },
                        {
                            label: 'onDebugInitialConfigurations',
                            description: nls.localize(18, null),
                            body: 'onDebugInitialConfigurations'
                        },
                        {
                            label: 'onDebugDynamicConfigurations',
                            description: nls.localize(19, null),
                            body: 'onDebugDynamicConfigurations'
                        },
                        {
                            label: 'onDebugResolve',
                            description: nls.localize(20, null),
                            body: 'onDebugResolve:${6:type}'
                        },
                        {
                            label: 'onDebugAdapterProtocolTracker',
                            description: nls.localize(21, null),
                            body: 'onDebugAdapterProtocolTracker:${6:type}'
                        },
                        {
                            label: 'workspaceContains',
                            description: nls.localize(22, null),
                            body: 'workspaceContains:${4:filePattern}'
                        },
                        {
                            label: 'onStartupFinished',
                            description: nls.localize(23, null),
                            body: 'onStartupFinished'
                        },
                        {
                            label: 'onFileSystem',
                            description: nls.localize(24, null),
                            body: 'onFileSystem:${1:scheme}'
                        },
                        {
                            label: 'onSearch',
                            description: nls.localize(25, null),
                            body: 'onSearch:${7:scheme}'
                        },
                        {
                            label: 'onView',
                            body: 'onView:${5:viewId}',
                            description: nls.localize(26, null),
                        },
                        {
                            label: 'onIdentity',
                            body: 'onIdentity:${8:identity}',
                            description: nls.localize(27, null),
                        },
                        {
                            label: 'onUri',
                            body: 'onUri',
                            description: nls.localize(28, null),
                        },
                        {
                            label: 'onOpenExternalUri',
                            body: 'onOpenExternalUri',
                            description: nls.localize(29, null),
                        },
                        {
                            label: 'onCustomEditor',
                            body: 'onCustomEditor:${9:viewType}',
                            description: nls.localize(30, null),
                        },
                        {
                            label: 'onNotebook',
                            body: 'onNotebook:${10:viewType}',
                            description: nls.localize(31, null),
                        },
                        {
                            label: 'onAuthenticationRequest',
                            body: 'onAuthenticationRequest:${11:authenticationProviderId}',
                            description: nls.localize(32, null)
                        },
                        {
                            label: '*',
                            description: nls.localize(33, null),
                            body: '*'
                        }
                    ],
                }
            },
            badges: {
                type: 'array',
                description: nls.localize(34, null),
                items: {
                    type: 'object',
                    required: ['url', 'href', 'description'],
                    properties: {
                        url: {
                            type: 'string',
                            description: nls.localize(35, null)
                        },
                        href: {
                            type: 'string',
                            description: nls.localize(36, null)
                        },
                        description: {
                            type: 'string',
                            description: nls.localize(37, null)
                        }
                    }
                }
            },
            markdown: {
                type: 'string',
                description: nls.localize(38, null),
                enum: ['github', 'standard'],
                default: 'github'
            },
            qna: {
                default: 'marketplace',
                description: nls.localize(39, null),
                anyOf: [
                    {
                        type: ['string', 'boolean'],
                        enum: ['marketplace', false]
                    },
                    {
                        type: 'string'
                    }
                ]
            },
            extensionDependencies: {
                description: nls.localize(40, null),
                type: 'array',
                uniqueItems: true,
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN
                }
            },
            extensionPack: {
                description: nls.localize(41, null),
                type: 'array',
                uniqueItems: true,
                items: {
                    type: 'string',
                    pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN
                }
            },
            extensionKind: {
                description: nls.localize(42, null),
                type: 'array',
                items: extensionKindSchema,
                default: ['workspace'],
                defaultSnippets: [
                    {
                        body: ['ui'],
                        description: nls.localize(43, null)
                    },
                    {
                        body: ['workspace'],
                        description: nls.localize(44, null)
                    },
                    {
                        body: ['ui', 'workspace'],
                        description: nls.localize(45, null)
                    },
                    {
                        body: ['workspace', 'ui'],
                        description: nls.localize(46, null)
                    },
                    {
                        body: [],
                        description: nls.localize(47, null)
                    }
                ]
            },
            capabilities: {
                description: nls.localize(48, null),
                type: 'object',
                properties: {
                    virtualWorkspaces: {
                        description: nls.localize(49, null),
                        type: 'boolean',
                        default: true
                    },
                    untrustedWorkspaces: {
                        description: nls.localize(50, null),
                        type: 'object',
                        required: ['supported'],
                        defaultSnippets: [
                            { body: { supported: '${1:limited}', description: '${2}' } },
                        ],
                        properties: {
                            supported: {
                                markdownDescription: nls.localize(51, null),
                                type: ['string', 'boolean'],
                                enum: ['limited', true, false],
                                enumDescriptions: [
                                    nls.localize(52, null),
                                    nls.localize(53, null),
                                    nls.localize(54, null),
                                ]
                            },
                            restrictedConfigurations: {
                                description: nls.localize(55, null),
                                type: 'array',
                                items: {
                                    type: 'string'
                                }
                            },
                            description: {
                                type: 'string',
                                markdownDescription: nls.localize(56, null),
                            }
                        }
                    }
                }
            },
            scripts: {
                type: 'object',
                properties: {
                    'vscode:prepublish': {
                        description: nls.localize(57, null),
                        type: 'string'
                    },
                    'vscode:uninstall': {
                        description: nls.localize(58, null),
                        type: 'string'
                    }
                }
            },
            icon: {
                type: 'string',
                description: nls.localize(59, null)
            }
        }
    };
    class ExtensionsRegistryImpl {
        constructor() {
            this._extensionPoints = new Map();
        }
        registerExtensionPoint(desc) {
            if (this._extensionPoints.has(desc.extensionPoint)) {
                throw new Error('Duplicate extension point: ' + desc.extensionPoint);
            }
            const result = new ExtensionPoint(desc.extensionPoint, desc.defaultExtensionKind);
            this._extensionPoints.set(desc.extensionPoint, result);
            exports.schema.properties['contributes'].properties[desc.extensionPoint] = desc.jsonSchema;
            schemaRegistry.registerSchema(schemaId, exports.schema);
            return result;
        }
        getExtensionPoints() {
            return Array.from(this._extensionPoints.values());
        }
    }
    exports.ExtensionsRegistryImpl = ExtensionsRegistryImpl;
    const PRExtensions = {
        ExtensionsRegistry: 'ExtensionsRegistry'
    };
    platform_1.Registry.add(PRExtensions.ExtensionsRegistry, new ExtensionsRegistryImpl());
    exports.ExtensionsRegistry = platform_1.Registry.as(PRExtensions.ExtensionsRegistry);
    schemaRegistry.registerSchema(schemaId, exports.schema);
});
//# sourceMappingURL=extensionsRegistry.js.map