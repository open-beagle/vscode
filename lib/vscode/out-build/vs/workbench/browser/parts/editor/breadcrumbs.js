/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/nls!vs/workbench/browser/parts/editor/breadcrumbs", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform"], function (require, exports, event_1, nls_1, configurationRegistry_1, extensions_1, instantiation_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BreadcrumbsConfig = exports.BreadcrumbsService = exports.IBreadcrumbsService = void 0;
    exports.IBreadcrumbsService = (0, instantiation_1.createDecorator)('IEditorBreadcrumbsService');
    class BreadcrumbsService {
        constructor() {
            this._map = new Map();
        }
        register(group, widget) {
            if (this._map.has(group)) {
                throw new Error(`group (${group}) has already a widget`);
            }
            this._map.set(group, widget);
            return {
                dispose: () => this._map.delete(group)
            };
        }
        getWidget(group) {
            return this._map.get(group);
        }
    }
    exports.BreadcrumbsService = BreadcrumbsService;
    (0, extensions_1.registerSingleton)(exports.IBreadcrumbsService, BreadcrumbsService, true);
    //#region config
    class BreadcrumbsConfig {
        constructor() {
            // internal
        }
        static _stub(name) {
            return {
                bindTo(service) {
                    let onDidChange = new event_1.Emitter();
                    let listener = service.onDidChangeConfiguration(e => {
                        if (e.affectsConfiguration(name)) {
                            onDidChange.fire(undefined);
                        }
                    });
                    return new class {
                        constructor() {
                            this.name = name;
                            this.onDidChange = onDidChange.event;
                        }
                        getValue(overrides) {
                            if (overrides) {
                                return service.getValue(name, overrides);
                            }
                            else {
                                return service.getValue(name);
                            }
                        }
                        updateValue(newValue, overrides) {
                            if (overrides) {
                                return service.updateValue(name, newValue, overrides);
                            }
                            else {
                                return service.updateValue(name, newValue);
                            }
                        }
                        dispose() {
                            listener.dispose();
                            onDidChange.dispose();
                        }
                    };
                }
            };
        }
    }
    exports.BreadcrumbsConfig = BreadcrumbsConfig;
    BreadcrumbsConfig.IsEnabled = BreadcrumbsConfig._stub('breadcrumbs.enabled');
    BreadcrumbsConfig.UseQuickPick = BreadcrumbsConfig._stub('breadcrumbs.useQuickPick');
    BreadcrumbsConfig.FilePath = BreadcrumbsConfig._stub('breadcrumbs.filePath');
    BreadcrumbsConfig.SymbolPath = BreadcrumbsConfig._stub('breadcrumbs.symbolPath');
    BreadcrumbsConfig.SymbolSortOrder = BreadcrumbsConfig._stub('breadcrumbs.symbolSortOrder');
    BreadcrumbsConfig.Icons = BreadcrumbsConfig._stub('breadcrumbs.icons');
    BreadcrumbsConfig.TitleScrollbarSizing = BreadcrumbsConfig._stub('workbench.editor.titleScrollbarSizing');
    BreadcrumbsConfig.FileExcludes = BreadcrumbsConfig._stub('files.exclude');
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'breadcrumbs',
        title: (0, nls_1.localize)(0, null),
        order: 101,
        type: 'object',
        properties: {
            'breadcrumbs.enabled': {
                description: (0, nls_1.localize)(1, null),
                type: 'boolean',
                default: true
            },
            'breadcrumbs.filePath': {
                description: (0, nls_1.localize)(2, null),
                type: 'string',
                default: 'on',
                enum: ['on', 'off', 'last'],
                enumDescriptions: [
                    (0, nls_1.localize)(3, null),
                    (0, nls_1.localize)(4, null),
                    (0, nls_1.localize)(5, null),
                ]
            },
            'breadcrumbs.symbolPath': {
                description: (0, nls_1.localize)(6, null),
                type: 'string',
                default: 'on',
                enum: ['on', 'off', 'last'],
                enumDescriptions: [
                    (0, nls_1.localize)(7, null),
                    (0, nls_1.localize)(8, null),
                    (0, nls_1.localize)(9, null),
                ]
            },
            'breadcrumbs.symbolSortOrder': {
                description: (0, nls_1.localize)(10, null),
                type: 'string',
                default: 'position',
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                enum: ['position', 'name', 'type'],
                enumDescriptions: [
                    (0, nls_1.localize)(11, null),
                    (0, nls_1.localize)(12, null),
                    (0, nls_1.localize)(13, null),
                ]
            },
            'breadcrumbs.icons': {
                description: (0, nls_1.localize)(14, null),
                type: 'boolean',
                default: true
            },
            'breadcrumbs.showFiles': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(15, null)
            },
            'breadcrumbs.showModules': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(16, null)
            },
            'breadcrumbs.showNamespaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(17, null)
            },
            'breadcrumbs.showPackages': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(18, null)
            },
            'breadcrumbs.showClasses': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(19, null)
            },
            'breadcrumbs.showMethods': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(20, null)
            },
            'breadcrumbs.showProperties': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(21, null)
            },
            'breadcrumbs.showFields': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(22, null)
            },
            'breadcrumbs.showConstructors': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(23, null)
            },
            'breadcrumbs.showEnums': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(24, null)
            },
            'breadcrumbs.showInterfaces': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(25, null)
            },
            'breadcrumbs.showFunctions': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(26, null)
            },
            'breadcrumbs.showVariables': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(27, null)
            },
            'breadcrumbs.showConstants': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(28, null)
            },
            'breadcrumbs.showStrings': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(29, null)
            },
            'breadcrumbs.showNumbers': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(30, null)
            },
            'breadcrumbs.showBooleans': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(31, null)
            },
            'breadcrumbs.showArrays': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(32, null)
            },
            'breadcrumbs.showObjects': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(33, null)
            },
            'breadcrumbs.showKeys': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(34, null)
            },
            'breadcrumbs.showNull': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(35, null)
            },
            'breadcrumbs.showEnumMembers': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(36, null)
            },
            'breadcrumbs.showStructs': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(37, null)
            },
            'breadcrumbs.showEvents': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(38, null)
            },
            'breadcrumbs.showOperators': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(39, null)
            },
            'breadcrumbs.showTypeParameters': {
                type: 'boolean',
                default: true,
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
                markdownDescription: (0, nls_1.localize)(40, null)
            }
        }
    });
});
//#endregion
//# sourceMappingURL=breadcrumbs.js.map