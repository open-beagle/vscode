/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/nls!vs/workbench/contrib/debug/common/debugSchemas", "vs/workbench/services/configuration/common/configuration", "vs/workbench/services/configurationResolver/common/configurationResolverSchema"], function (require, exports, extensionsRegistry, nls, configuration_1, configurationResolverSchema_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.launchSchema = exports.presentationSchema = exports.breakpointsExtPoint = exports.debuggersExtPoint = void 0;
    // debuggers extension point
    exports.debuggersExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'debuggers',
        defaultExtensionKind: 'workspace',
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            defaultSnippets: [{ body: [{ type: '' }] }],
            items: {
                additionalProperties: false,
                type: 'object',
                defaultSnippets: [{ body: { type: '', program: '', runtime: '' } }],
                properties: {
                    type: {
                        description: nls.localize(1, null),
                        type: 'string'
                    },
                    label: {
                        description: nls.localize(2, null),
                        type: 'string'
                    },
                    program: {
                        description: nls.localize(3, null),
                        type: 'string'
                    },
                    args: {
                        description: nls.localize(4, null),
                        type: 'array'
                    },
                    runtime: {
                        description: nls.localize(5, null),
                        type: 'string'
                    },
                    runtimeArgs: {
                        description: nls.localize(6, null),
                        type: 'array'
                    },
                    variables: {
                        description: nls.localize(7, null),
                        type: 'object'
                    },
                    initialConfigurations: {
                        description: nls.localize(8, null),
                        type: ['array', 'string'],
                    },
                    languages: {
                        description: nls.localize(9, null),
                        type: 'array'
                    },
                    configurationSnippets: {
                        description: nls.localize(10, null),
                        type: 'array'
                    },
                    configurationAttributes: {
                        description: nls.localize(11, null),
                        type: 'object'
                    },
                    windows: {
                        description: nls.localize(12, null),
                        type: 'object',
                        properties: {
                            runtime: {
                                description: nls.localize(13, null),
                                type: 'string'
                            }
                        }
                    },
                    osx: {
                        description: nls.localize(14, null),
                        type: 'object',
                        properties: {
                            runtime: {
                                description: nls.localize(15, null),
                                type: 'string'
                            }
                        }
                    },
                    linux: {
                        description: nls.localize(16, null),
                        type: 'object',
                        properties: {
                            runtime: {
                                description: nls.localize(17, null),
                                type: 'string'
                            }
                        }
                    }
                }
            }
        }
    });
    // breakpoints extension point #9037
    exports.breakpointsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'breakpoints',
        jsonSchema: {
            description: nls.localize(18, null),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '' }] }],
            items: {
                type: 'object',
                additionalProperties: false,
                defaultSnippets: [{ body: { language: '' } }],
                properties: {
                    language: {
                        description: nls.localize(19, null),
                        type: 'string'
                    },
                }
            }
        }
    });
    // debug general schema
    exports.presentationSchema = {
        type: 'object',
        description: nls.localize(20, null),
        properties: {
            hidden: {
                type: 'boolean',
                default: false,
                description: nls.localize(21, null)
            },
            group: {
                type: 'string',
                default: '',
                description: nls.localize(22, null)
            },
            order: {
                type: 'number',
                default: 1,
                description: nls.localize(23, null)
            }
        },
        default: {
            hidden: false,
            group: '',
            order: 1
        }
    };
    const defaultCompound = { name: 'Compound', configurations: [] };
    exports.launchSchema = {
        id: configuration_1.launchSchemaId,
        type: 'object',
        title: nls.localize(24, null),
        allowTrailingCommas: true,
        allowComments: true,
        required: [],
        default: { version: '0.2.0', configurations: [], compounds: [] },
        properties: {
            version: {
                type: 'string',
                description: nls.localize(25, null),
                default: '0.2.0'
            },
            configurations: {
                type: 'array',
                description: nls.localize(26, null),
                items: {
                    defaultSnippets: [],
                    'type': 'object',
                    oneOf: []
                }
            },
            compounds: {
                type: 'array',
                description: nls.localize(27, null),
                items: {
                    type: 'object',
                    required: ['name', 'configurations'],
                    properties: {
                        name: {
                            type: 'string',
                            description: nls.localize(28, null)
                        },
                        presentation: exports.presentationSchema,
                        configurations: {
                            type: 'array',
                            default: [],
                            items: {
                                oneOf: [{
                                        enum: [],
                                        description: nls.localize(29, null)
                                    }, {
                                        type: 'object',
                                        required: ['name'],
                                        properties: {
                                            name: {
                                                enum: [],
                                                description: nls.localize(30, null)
                                            },
                                            folder: {
                                                enum: [],
                                                description: nls.localize(31, null)
                                            }
                                        }
                                    }]
                            },
                            description: nls.localize(32, null)
                        },
                        stopAll: {
                            type: 'boolean',
                            default: false,
                            description: nls.localize(33, null)
                        },
                        preLaunchTask: {
                            type: 'string',
                            default: '',
                            description: nls.localize(34, null)
                        }
                    },
                    default: defaultCompound
                },
                default: [
                    defaultCompound
                ]
            },
            inputs: configurationResolverSchema_1.inputsSchema.definitions.inputs
        }
    };
});
//# sourceMappingURL=debugSchemas.js.map