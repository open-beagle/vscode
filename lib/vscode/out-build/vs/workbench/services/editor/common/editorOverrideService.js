/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/nls!vs/workbench/services/editor/common/editorOverrideService", "vs/workbench/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/editor"], function (require, exports, glob, network_1, path_1, resources_1, nls_1, configuration_1, configurationRegistry_1, instantiation_1, platform_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.globMatchesResource = exports.priorityToRank = exports.ContributedEditorPriority = exports.DEFAULT_EDITOR_ASSOCIATION = exports.editorsAssociationsSettingId = exports.IEditorOverrideService = void 0;
    exports.IEditorOverrideService = (0, instantiation_1.createDecorator)('editorOverrideService');
    exports.editorsAssociationsSettingId = 'workbench.editorAssociations';
    exports.DEFAULT_EDITOR_ASSOCIATION = {
        id: 'default',
        displayName: (0, nls_1.localize)(0, null),
        providerDisplayName: (0, nls_1.localize)(1, null)
    };
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const editorTypeSchemaAddition = {
        type: 'string',
        enum: []
    };
    const editorAssociationsConfigurationNode = Object.assign(Object.assign({}, configuration_1.workbenchConfigurationNodeBase), { properties: {
            'workbench.editorAssociations': {
                type: 'array',
                markdownDescription: (0, nls_1.localize)(2, null),
                items: {
                    type: 'object',
                    defaultSnippets: [{
                            body: {
                                'viewType': '$1',
                                'filenamePattern': '$2'
                            }
                        }],
                    properties: {
                        'viewType': {
                            anyOf: [
                                {
                                    type: 'string',
                                    description: (0, nls_1.localize)(3, null),
                                },
                                editorTypeSchemaAddition
                            ]
                        },
                        'filenamePattern': {
                            type: 'string',
                            description: (0, nls_1.localize)(4, null),
                        }
                    }
                }
            }
        } });
    class EditorAssociationsRegistry {
        constructor() {
            this.editorTypesHandlers = new Map();
        }
        registerEditorTypesHandler(id, handler) {
            if (this.editorTypesHandlers.has(id)) {
                throw new Error(`An editor type handler with ${id} was already registered.`);
            }
            this.editorTypesHandlers.set(id, handler);
            this.updateEditorAssociationsSchema();
            const editorTypeChangeEvent = handler.onDidChangeEditorTypes(() => {
                this.updateEditorAssociationsSchema();
            });
            return {
                dispose: () => {
                    editorTypeChangeEvent.dispose();
                    this.editorTypesHandlers.delete(id);
                    this.updateEditorAssociationsSchema();
                }
            };
        }
        updateEditorAssociationsSchema() {
            const enumValues = [];
            const enumDescriptions = [];
            const editorTypes = [exports.DEFAULT_EDITOR_ASSOCIATION];
            for (const [, handler] of this.editorTypesHandlers) {
                editorTypes.push(...handler.getEditorTypes());
            }
            for (const { id, providerDisplayName } of editorTypes) {
                enumValues.push(id);
                enumDescriptions.push((0, nls_1.localize)(5, null, providerDisplayName));
            }
            editorTypeSchemaAddition.enum = enumValues;
            editorTypeSchemaAddition.enumDescriptions = enumDescriptions;
            configurationRegistry.notifyConfigurationSchemaUpdated(editorAssociationsConfigurationNode);
        }
    }
    platform_1.Registry.add(editor_1.EditorExtensions.Associations, new EditorAssociationsRegistry());
    configurationRegistry.registerConfiguration(editorAssociationsConfigurationNode);
    //#endregion
    //#region EditorOverrideService types
    var ContributedEditorPriority;
    (function (ContributedEditorPriority) {
        ContributedEditorPriority["builtin"] = "builtin";
        ContributedEditorPriority["option"] = "option";
        ContributedEditorPriority["exclusive"] = "exclusive";
        ContributedEditorPriority["default"] = "default";
    })(ContributedEditorPriority = exports.ContributedEditorPriority || (exports.ContributedEditorPriority = {}));
    //#endregion
    //#region Util functions
    function priorityToRank(priority) {
        switch (priority) {
            case ContributedEditorPriority.exclusive:
                return 5;
            case ContributedEditorPriority.default:
                return 4;
            case ContributedEditorPriority.builtin:
                return 3;
            // Text editor is priority 2
            case ContributedEditorPriority.option:
            default:
                return 1;
        }
    }
    exports.priorityToRank = priorityToRank;
    function globMatchesResource(globPattern, resource) {
        const excludedSchemes = new Set([
            network_1.Schemas.extension,
            network_1.Schemas.webviewPanel,
        ]);
        // We want to say that the above schemes match no glob patterns
        if (excludedSchemes.has(resource.scheme)) {
            return false;
        }
        const matchOnPath = typeof globPattern === 'string' && globPattern.indexOf(path_1.posix.sep) >= 0;
        const target = matchOnPath ? `${resource.scheme}:${resource.path}` : (0, resources_1.basename)(resource);
        return glob.match(globPattern, target.toLowerCase());
    }
    exports.globMatchesResource = globMatchesResource;
});
//#endregion
//# sourceMappingURL=editorOverrideService.js.map