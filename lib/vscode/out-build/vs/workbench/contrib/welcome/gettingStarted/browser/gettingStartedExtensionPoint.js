/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, nls_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.startEntriesExtensionPoint = exports.walkthroughsExtensionPoint = void 0;
    exports.walkthroughsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'walkthroughs',
        jsonSchema: {
            doNotSuggest: true,
            description: (0, nls_1.localize)(0, null),
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'title', 'description', 'steps'],
                defaultSnippets: [{ body: { 'id': '$1', 'title': '$2', 'description': '$3', 'steps': [] } }],
                properties: {
                    id: {
                        type: 'string',
                        description: (0, nls_1.localize)(1, null),
                    },
                    title: {
                        type: 'string',
                        description: (0, nls_1.localize)(2, null)
                    },
                    description: {
                        type: 'string',
                        description: (0, nls_1.localize)(3, null)
                    },
                    primary: {
                        type: 'boolean',
                        description: (0, nls_1.localize)(4, null)
                    },
                    when: {
                        type: 'string',
                        description: (0, nls_1.localize)(5, null)
                    },
                    tasks: {
                        deprecationMessage: (0, nls_1.localize)(6, null)
                    },
                    steps: {
                        type: 'array',
                        description: (0, nls_1.localize)(7, null),
                        items: {
                            type: 'object',
                            required: ['id', 'title', 'description', 'media'],
                            defaultSnippets: [{
                                    body: {
                                        'id': '$1', 'title': '$2', 'description': '$3',
                                        'doneOn': { 'command': '$5' },
                                        'media': { 'path': '$6', 'type': '$7' }
                                    }
                                }],
                            properties: {
                                id: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(8, null),
                                },
                                title: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(9, null)
                                },
                                description: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(10, null)
                                },
                                button: {
                                    deprecationMessage: (0, nls_1.localize)(11, null),
                                },
                                media: {
                                    type: 'object',
                                    description: (0, nls_1.localize)(12, null),
                                    defaultSnippets: [{ 'body': { 'type': '$1', 'path': '$2' } }],
                                    oneOf: [
                                        {
                                            required: ['path', 'altText'],
                                            additionalProperties: false,
                                            properties: {
                                                path: {
                                                    description: (0, nls_1.localize)(13, null),
                                                    oneOf: [
                                                        {
                                                            type: 'string',
                                                        },
                                                        {
                                                            type: 'object',
                                                            required: ['dark', 'light', 'hc'],
                                                            properties: {
                                                                dark: {
                                                                    description: (0, nls_1.localize)(14, null),
                                                                    type: 'string',
                                                                },
                                                                light: {
                                                                    description: (0, nls_1.localize)(15, null),
                                                                    type: 'string',
                                                                },
                                                                hc: {
                                                                    description: (0, nls_1.localize)(16, null),
                                                                    type: 'string',
                                                                }
                                                            }
                                                        }
                                                    ]
                                                },
                                                altText: {
                                                    type: 'string',
                                                    description: (0, nls_1.localize)(17, null)
                                                }
                                            }
                                        }, {
                                            required: ['path'],
                                            additionalProperties: false,
                                            properties: {
                                                path: {
                                                    description: (0, nls_1.localize)(18, null),
                                                    type: 'string',
                                                }
                                            }
                                        }
                                    ]
                                },
                                doneOn: {
                                    description: (0, nls_1.localize)(19, null),
                                    type: 'object',
                                    required: ['command'],
                                    defaultSnippets: [{ 'body': { command: '$1' } }],
                                    properties: {
                                        'command': {
                                            description: (0, nls_1.localize)(20, null),
                                            type: 'string'
                                        }
                                    },
                                },
                                when: {
                                    type: 'string',
                                    description: (0, nls_1.localize)(21, null)
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    exports.startEntriesExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'startEntries',
        jsonSchema: {
            doNotSuggest: true,
            description: (0, nls_1.localize)(22, null),
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'title', 'description'],
                defaultSnippets: [{ body: { 'id': '$1', 'title': '$2', 'description': '$3' } }],
                properties: {
                    title: {
                        type: 'string',
                        description: (0, nls_1.localize)(23, null)
                    },
                    command: {
                        type: 'string',
                        description: (0, nls_1.localize)(24, null)
                    },
                    description: {
                        type: 'string',
                        description: (0, nls_1.localize)(25, null)
                    },
                    when: {
                        type: 'string',
                        description: (0, nls_1.localize)(26, null)
                    },
                    type: {
                        type: 'string',
                        enum: ['sample-notebook', 'template-folder'],
                        description: (0, nls_1.localize)(27, null)
                    }
                }
            }
        }
    });
});
//# sourceMappingURL=gettingStartedExtensionPoint.js.map