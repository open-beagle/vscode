/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/iconExtensionPoint", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/registry/common/platform", "vs/base/common/codicons", "vs/workbench/services/themes/common/productIconThemeSchema", "vs/base/common/resources"], function (require, exports, nls, extensionsRegistry_1, iconRegistry_1, platform_1, codicons_1, productIconThemeSchema_1, resources) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IconFontExtensionPoint = exports.IconExtensionPoint = void 0;
    const iconRegistry = platform_1.Registry.as(iconRegistry_1.Extensions.IconContribution);
    const iconReferenceSchema = iconRegistry.getIconReferenceSchema();
    const iconIdPattern = `^${codicons_1.CSSIcon.iconNameSegment}-(${codicons_1.CSSIcon.iconNameSegment})+`;
    const iconConfigurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'icons',
        jsonSchema: {
            description: nls.localize(0, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize(1, null),
                        pattern: iconIdPattern,
                        patternErrorMessage: nls.localize(2, null),
                    },
                    description: {
                        type: 'string',
                        description: nls.localize(3, null),
                    },
                    default: {
                        anyOf: [
                            iconReferenceSchema,
                            {
                                type: 'object',
                                properties: {
                                    fontId: {
                                        description: nls.localize(4, null),
                                        type: 'string'
                                    },
                                    fontCharacter: {
                                        description: nls.localize(5, null),
                                        type: 'string'
                                    }
                                },
                                defaultSnippets: [{ body: { fontId: '${1:myIconFont}', fontCharacter: '${2:\\\\E001}' } }]
                            }
                        ],
                        description: nls.localize(6, null),
                    }
                }
            }
        }
    });
    const iconFontConfigurationExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'iconFonts',
        jsonSchema: {
            description: nls.localize(7, null),
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: nls.localize(8, null),
                        pattern: productIconThemeSchema_1.fontIdRegex,
                        patternErrorMessage: nls.localize(9, null)
                    },
                    src: {
                        type: 'array',
                        description: nls.localize(10, null),
                        items: {
                            type: 'object',
                            properties: {
                                path: {
                                    type: 'string',
                                    description: nls.localize(11, null),
                                },
                                format: {
                                    type: 'string',
                                    description: nls.localize(12, null),
                                    enum: ['woff', 'woff2', 'truetype', 'opentype', 'embedded-opentype', 'svg']
                                }
                            },
                            required: [
                                'path',
                                'format'
                            ]
                        }
                    }
                }
            }
        }
    });
    class IconExtensionPoint {
        constructor() {
            iconConfigurationExtPoint.setHandler((extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extension.description.enableProposedApi) {
                        collector.error(nls.localize(13, null, extension.description.identifier.value));
                        return;
                    }
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize(14, null));
                        return;
                    }
                    for (const iconContribution of extensionValue) {
                        if (typeof iconContribution.id !== 'string' || iconContribution.id.length === 0) {
                            collector.error(nls.localize(15, null));
                            return;
                        }
                        if (!iconContribution.id.match(iconIdPattern)) {
                            collector.error(nls.localize(16, null));
                            return;
                        }
                        if (typeof iconContribution.description !== 'string' || iconContribution.id.length === 0) {
                            collector.error(nls.localize(17, null));
                            return;
                        }
                        let defaultIcon = iconContribution.default;
                        if (typeof defaultIcon === 'string') {
                            iconRegistry.registerIcon(iconContribution.id, { id: defaultIcon }, iconContribution.description);
                        }
                        else if (typeof defaultIcon === 'object' && typeof defaultIcon.fontId === 'string' && typeof defaultIcon.fontCharacter === 'string') {
                            iconRegistry.registerIcon(iconContribution.id, {
                                fontId: getFontId(extension.description, defaultIcon.fontId),
                                fontCharacter: defaultIcon.fontCharacter,
                            }, iconContribution.description);
                        }
                        else {
                            collector.error(nls.localize(18, null));
                        }
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const iconContribution of extensionValue) {
                        iconRegistry.deregisterIcon(iconContribution.id);
                    }
                }
            });
        }
    }
    exports.IconExtensionPoint = IconExtensionPoint;
    class IconFontExtensionPoint {
        constructor() {
            iconFontConfigurationExtPoint.setHandler((_extensions, delta) => {
                for (const extension of delta.added) {
                    const extensionValue = extension.value;
                    const collector = extension.collector;
                    if (!extension.description.enableProposedApi) {
                        collector.error(nls.localize(19, null, extension.description.identifier.value));
                        return;
                    }
                    if (!extensionValue || !Array.isArray(extensionValue)) {
                        collector.error(nls.localize(20, null));
                        return;
                    }
                    for (const iconFontContribution of extensionValue) {
                        if (typeof iconFontContribution.id !== 'string' || iconFontContribution.id.length === 0) {
                            collector.error(nls.localize(21, null));
                            return;
                        }
                        if (!iconFontContribution.id.match(productIconThemeSchema_1.fontIdRegex)) {
                            collector.error(nls.localize(22, null));
                            return;
                        }
                        if (!Array.isArray(iconFontContribution.src) || !iconFontContribution.src.length) {
                            collector.error(nls.localize(23, null));
                            return;
                        }
                        const def = { src: [] };
                        for (const src of iconFontContribution.src) {
                            if (typeof src === 'object' && typeof src.path === 'string' && typeof src.format === 'string') {
                                const extensionLocation = extension.description.extensionLocation;
                                const iconFontLocation = resources.joinPath(extensionLocation, src.path);
                                if (!resources.isEqualOrParent(iconFontLocation, extensionLocation)) {
                                    collector.warn(nls.localize(24, null, iconFontLocation.path, extensionLocation.path));
                                }
                                def.src.push({
                                    location: iconFontLocation,
                                    format: src.format,
                                });
                            }
                            else {
                                collector.error(nls.localize(25, null));
                            }
                        }
                        iconRegistry.registerIconFont(getFontId(extension.description, iconFontContribution.id), def);
                    }
                }
                for (const extension of delta.removed) {
                    const extensionValue = extension.value;
                    for (const iconFontContribution of extensionValue) {
                        iconRegistry.deregisterIconFont(getFontId(extension.description, iconFontContribution.id));
                    }
                }
            });
        }
    }
    exports.IconFontExtensionPoint = IconFontExtensionPoint;
    function getFontId(description, fontId) {
        return `${description.identifier.value}/${fontId}`;
    }
});
//# sourceMappingURL=iconExtensionPoint.js.map