/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/extensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, nls, extensionsRegistry_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.notebookMarkupRendererExtensionPoint = exports.notebookRendererExtensionPoint = exports.notebookProviderExtensionPoint = void 0;
    var NotebookEditorContribution;
    (function (NotebookEditorContribution) {
        NotebookEditorContribution.viewType = 'viewType';
        NotebookEditorContribution.displayName = 'displayName';
        NotebookEditorContribution.selector = 'selector';
        NotebookEditorContribution.priority = 'priority';
    })(NotebookEditorContribution || (NotebookEditorContribution = {}));
    var NotebookRendererContribution;
    (function (NotebookRendererContribution) {
        NotebookRendererContribution.viewType = 'viewType';
        NotebookRendererContribution.id = 'id';
        NotebookRendererContribution.displayName = 'displayName';
        NotebookRendererContribution.mimeTypes = 'mimeTypes';
        NotebookRendererContribution.entrypoint = 'entrypoint';
        NotebookRendererContribution.hardDependencies = 'dependencies';
        NotebookRendererContribution.optionalDependencies = 'optionalDependencies';
    })(NotebookRendererContribution || (NotebookRendererContribution = {}));
    var NotebookMarkupRendererContribution;
    (function (NotebookMarkupRendererContribution) {
        NotebookMarkupRendererContribution["id"] = "id";
        NotebookMarkupRendererContribution["displayName"] = "displayName";
        NotebookMarkupRendererContribution["entrypoint"] = "entrypoint";
        NotebookMarkupRendererContribution["dependsOn"] = "dependsOn";
        NotebookMarkupRendererContribution["mimeTypes"] = "mimeTypes";
    })(NotebookMarkupRendererContribution || (NotebookMarkupRendererContribution = {}));
    const notebookProviderContribution = {
        description: nls.localize(0, null),
        type: 'array',
        defaultSnippets: [{ body: [{ viewType: '', displayName: '' }] }],
        items: {
            type: 'object',
            required: [
                NotebookEditorContribution.viewType,
                NotebookEditorContribution.displayName,
                NotebookEditorContribution.selector,
            ],
            properties: {
                [NotebookEditorContribution.viewType]: {
                    type: 'string',
                    description: nls.localize(1, null),
                },
                [NotebookEditorContribution.displayName]: {
                    type: 'string',
                    description: nls.localize(2, null),
                },
                [NotebookEditorContribution.selector]: {
                    type: 'array',
                    description: nls.localize(3, null),
                    items: {
                        type: 'object',
                        properties: {
                            filenamePattern: {
                                type: 'string',
                                description: nls.localize(4, null),
                            },
                            excludeFileNamePattern: {
                                type: 'string',
                                description: nls.localize(5, null)
                            }
                        }
                    }
                },
                [NotebookEditorContribution.priority]: {
                    type: 'string',
                    markdownDeprecationMessage: nls.localize(6, null),
                    enum: [
                        notebookCommon_1.NotebookEditorPriority.default,
                        notebookCommon_1.NotebookEditorPriority.option,
                    ],
                    markdownEnumDescriptions: [
                        nls.localize(7, null),
                        nls.localize(8, null),
                    ],
                    default: 'default'
                }
            }
        }
    };
    const notebookRendererContribution = {
        description: nls.localize(9, null),
        type: 'array',
        defaultSnippets: [{ body: [{ id: '', displayName: '', mimeTypes: [''], entrypoint: '' }] }],
        items: {
            type: 'object',
            required: [
                NotebookRendererContribution.id,
                NotebookRendererContribution.displayName,
                NotebookRendererContribution.mimeTypes,
                NotebookRendererContribution.entrypoint,
            ],
            properties: {
                [NotebookRendererContribution.id]: {
                    type: 'string',
                    description: nls.localize(10, null),
                },
                [NotebookRendererContribution.viewType]: {
                    type: 'string',
                    deprecationMessage: nls.localize(11, null),
                    description: nls.localize(12, null),
                },
                [NotebookRendererContribution.displayName]: {
                    type: 'string',
                    description: nls.localize(13, null),
                },
                [NotebookRendererContribution.mimeTypes]: {
                    type: 'array',
                    description: nls.localize(14, null),
                    items: {
                        type: 'string'
                    }
                },
                [NotebookRendererContribution.entrypoint]: {
                    type: 'string',
                    description: nls.localize(15, null),
                },
                [NotebookRendererContribution.hardDependencies]: {
                    type: 'array',
                    uniqueItems: true,
                    items: { type: 'string' },
                    markdownDescription: nls.localize(16, null),
                },
                [NotebookRendererContribution.optionalDependencies]: {
                    type: 'array',
                    uniqueItems: true,
                    items: { type: 'string' },
                    markdownDescription: nls.localize(17, null),
                },
            }
        }
    };
    const notebookMarkupRendererContribution = {
        description: nls.localize(18, null),
        type: 'array',
        defaultSnippets: [{ body: [{ id: '', displayName: '', entrypoint: '' }] }],
        items: {
            type: 'object',
            required: [
                NotebookMarkupRendererContribution.id,
                NotebookMarkupRendererContribution.displayName,
                NotebookMarkupRendererContribution.entrypoint,
            ],
            properties: {
                [NotebookMarkupRendererContribution.id]: {
                    type: 'string',
                    description: nls.localize(19, null),
                },
                [NotebookMarkupRendererContribution.displayName]: {
                    type: 'string',
                    description: nls.localize(20, null),
                },
                [NotebookMarkupRendererContribution.entrypoint]: {
                    type: 'string',
                    description: nls.localize(21, null),
                },
                [NotebookMarkupRendererContribution.mimeTypes]: {
                    type: 'array',
                    items: { type: 'string' },
                    description: nls.localize(22, null),
                },
                [NotebookMarkupRendererContribution.dependsOn]: {
                    type: 'string',
                    description: nls.localize(23, null),
                },
            }
        }
    };
    exports.notebookProviderExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'notebookProvider',
        jsonSchema: notebookProviderContribution
    });
    exports.notebookRendererExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'notebookOutputRenderer',
        jsonSchema: notebookRendererContribution
    });
    exports.notebookMarkupRendererExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'notebookMarkupRenderers',
        jsonSchema: notebookMarkupRendererContribution
    });
});
//# sourceMappingURL=extensionPoint.js.map