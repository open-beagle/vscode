/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/colorExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/colorRegistry", "vs/base/common/color", "vs/platform/registry/common/platform"], function (require, exports, nls, extensionsRegistry_1, colorRegistry_1, color_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorExtensionPoint = void 0;
    const colorRegistry = platform_1.Registry.as(colorRegistry_1.Extensions.ColorContribution);
    const colorReferenceSchema = colorRegistry.getColorReferenceSchema();
    const colorIdPattern = '^\\w+[.\\w+]*$';
    const configurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'colors',
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize(1, null),
                        pattern: colorIdPattern,
                        patternErrorMessage: nls.localize(2, null),
                    },
                    description: {
                        type: 'string',
                        description: nls.localize(3, null),
                    },
                    defaults: {
                        type: 'object',
                        properties: {
                            light: {
                                description: nls.localize(4, null),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            dark: {
                                description: nls.localize(5, null),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            },
                            highContrast: {
                                description: nls.localize(6, null),
                                type: 'string',
                                anyOf: [
                                    colorReferenceSchema,
                                    { type: 'string', format: 'color-hex' }
                                ]
                            }
                        }
                    },
                }
            }
        }
    });
    class ColorExtensionPoint {
        constructor() {
            configurationExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize(7, null));
                        return;
                    }
                    let parseColorValue = (s, name) => {
                        if (s.length > 0) {
                            if (s[0] === '#') {
                                return color_1.Color.Format.CSS.parseHex(s);
                            }
                            else {
                                return s;
                            }
                        }
                        collector.error(nls.localize(8, null, name));
                        return color_1.Color.red;
                    };
                    for (const colorContribution of extensionValue) {
                        if (typeof colorContribution.id !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize(9, null));
                            return;
                        }
                        if (!colorContribution.id.match(colorIdPattern)) {
                            collector.error(nls.localize(10, null));
                            return;
                        }
                        if (typeof colorContribution.description !== 'string' || colorContribution.id.length === 0) {
                            collector.error(nls.localize(11, null));
                            return;
                        }
                        let defaults = colorContribution.defaults;
                        if (!defaults || typeof defaults !== 'object' || typeof defaults.light !== 'string' || typeof defaults.dark !== 'string' || typeof defaults.highContrast !== 'string') {
                            collector.error(nls.localize(12, null));
                            return;
                        }
                        colorRegistry.registerColor(colorContribution.id, {
                            light: parseColorValue(defaults.light, 'configuration.colors.defaults.light'),
                            dark: parseColorValue(defaults.dark, 'configuration.colors.defaults.dark'),
                            hc: parseColorValue(defaults.highContrast, 'configuration.colors.defaults.highContrast')
                        }, colorContribution.description);
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const colorContribution of extensionValue) {
                        colorRegistry.deregisterColor(colorContribution.id);
                    }
                }
            });
        }
    }
    exports.ColorExtensionPoint = ColorExtensionPoint;
});
//# sourceMappingURL=colorExtensionPoint.js.map