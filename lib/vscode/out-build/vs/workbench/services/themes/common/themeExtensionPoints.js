/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/themeExtensionPoints", "vs/base/common/types", "vs/base/common/resources", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/themes/common/workbenchThemeService", "vs/base/common/event"], function (require, exports, nls, types, resources, extensionsRegistry_1, workbenchThemeService_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThemeRegistry = exports.registerProductIconThemeExtensionPoint = exports.registerFileIconThemeExtensionPoint = exports.registerColorThemeExtensionPoint = void 0;
    function registerColorThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'themes',
            jsonSchema: {
                description: nls.localize(0, null),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { label: '${1:label}', id: '${2:id}', uiTheme: workbenchThemeService_1.VS_DARK_THEME, path: './themes/${3:id}.tmTheme.' } }],
                    properties: {
                        id: {
                            description: nls.localize(1, null),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize(2, null),
                            type: 'string'
                        },
                        uiTheme: {
                            description: nls.localize(3, null),
                            enum: [workbenchThemeService_1.VS_LIGHT_THEME, workbenchThemeService_1.VS_DARK_THEME, workbenchThemeService_1.VS_HC_THEME]
                        },
                        path: {
                            description: nls.localize(4, null),
                            type: 'string'
                        }
                    },
                    required: ['path', 'uiTheme']
                }
            }
        });
    }
    exports.registerColorThemeExtensionPoint = registerColorThemeExtensionPoint;
    function registerFileIconThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'iconThemes',
            jsonSchema: {
                description: nls.localize(5, null),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './fileicons/${3:id}-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize(6, null),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize(7, null),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize(8, null),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.registerFileIconThemeExtensionPoint = registerFileIconThemeExtensionPoint;
    function registerProductIconThemeExtensionPoint() {
        return extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'productIconThemes',
            jsonSchema: {
                description: nls.localize(9, null),
                type: 'array',
                items: {
                    type: 'object',
                    defaultSnippets: [{ body: { id: '${1:id}', label: '${2:label}', path: './producticons/${3:id}-product-icon-theme.json' } }],
                    properties: {
                        id: {
                            description: nls.localize(10, null),
                            type: 'string'
                        },
                        label: {
                            description: nls.localize(11, null),
                            type: 'string'
                        },
                        path: {
                            description: nls.localize(12, null),
                            type: 'string'
                        }
                    },
                    required: ['path', 'id']
                }
            }
        });
    }
    exports.registerProductIconThemeExtensionPoint = registerProductIconThemeExtensionPoint;
    class ThemeRegistry {
        constructor(themesExtPoint, create, idRequired = false, builtInTheme = undefined) {
            this.themesExtPoint = themesExtPoint;
            this.create = create;
            this.idRequired = idRequired;
            this.builtInTheme = builtInTheme;
            this.onDidChangeEmitter = new event_1.Emitter();
            this.onDidChange = this.onDidChangeEmitter.event;
            this.extensionThemes = [];
            this.initialize();
        }
        initialize() {
            this.themesExtPoint.setHandler((extensions, delta) => {
                const previousIds = {};
                const added = [];
                for (const theme of this.extensionThemes) {
                    previousIds[theme.id] = theme;
                }
                this.extensionThemes.length = 0;
                for (let ext of extensions) {
                    let extensionData = {
                        extensionId: ext.description.identifier.value,
                        extensionPublisher: ext.description.publisher,
                        extensionName: ext.description.name,
                        extensionIsBuiltin: ext.description.isBuiltin
                    };
                    this.onThemes(extensionData, ext.description.extensionLocation, ext.value, ext.collector);
                }
                for (const theme of this.extensionThemes) {
                    if (!previousIds[theme.id]) {
                        added.push(theme);
                    }
                    else {
                        delete previousIds[theme.id];
                    }
                }
                const removed = Object.values(previousIds);
                this.onDidChangeEmitter.fire({ themes: this.extensionThemes, added, removed });
            });
        }
        onThemes(extensionData, extensionLocation, themes, collector) {
            if (!Array.isArray(themes)) {
                collector.error(nls.localize(13, null, this.themesExtPoint.name));
                return;
            }
            themes.forEach(theme => {
                if (!theme.path || !types.isString(theme.path)) {
                    collector.error(nls.localize(14, null, this.themesExtPoint.name, String(theme.path)));
                    return;
                }
                if (this.idRequired && (!theme.id || !types.isString(theme.id))) {
                    collector.error(nls.localize(15, null, this.themesExtPoint.name, String(theme.id)));
                    return;
                }
                const themeLocation = resources.joinPath(extensionLocation, theme.path);
                if (!resources.isEqualOrParent(themeLocation, extensionLocation)) {
                    collector.warn(nls.localize(16, null, this.themesExtPoint.name, themeLocation.path, extensionLocation.path));
                }
                let themeData = this.create(theme, themeLocation, extensionData);
                this.extensionThemes.push(themeData);
            });
        }
        findThemeById(themeId, defaultId) {
            if (this.builtInTheme && this.builtInTheme.id === themeId) {
                return this.builtInTheme;
            }
            const allThemes = this.getThemes();
            let defaultTheme = undefined;
            for (let t of allThemes) {
                if (t.id === themeId) {
                    return t;
                }
                if (t.id === defaultId) {
                    defaultTheme = t;
                }
            }
            return defaultTheme;
        }
        findThemeBySettingsId(settingsId, defaultId) {
            if (this.builtInTheme && this.builtInTheme.settingsId === settingsId) {
                return this.builtInTheme;
            }
            const allThemes = this.getThemes();
            let defaultTheme = undefined;
            for (let t of allThemes) {
                if (t.settingsId === settingsId) {
                    return t;
                }
                if (t.id === defaultId) {
                    defaultTheme = t;
                }
            }
            return defaultTheme;
        }
        findThemeByExtensionLocation(extLocation) {
            if (extLocation) {
                return this.getThemes().filter(t => t.location && resources.isEqualOrParent(t.location, extLocation));
            }
            return [];
        }
        getThemes() {
            return this.extensionThemes;
        }
    }
    exports.ThemeRegistry = ThemeRegistry;
});
//# sourceMappingURL=themeExtensionPoints.js.map