define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/productIconThemeSchema", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerProductIconThemeSchemas = exports.fontSizeRegex = exports.fontWeightRegex = exports.fontStyleRegex = exports.fontIdRegex = void 0;
    exports.fontIdRegex = '^([\\w-_]+)$';
    exports.fontStyleRegex = '^(normal|italic|(oblique[ \\w\\s-]+))$';
    exports.fontWeightRegex = '^(normal|bold|lighter|bolder|(\\d{0-1000}))$';
    exports.fontSizeRegex = '^([\\w .%-_]+)$';
    const schemaId = 'vscode://schemas/product-icon-theme';
    const schema = {
        type: 'object',
        allowComments: true,
        allowTrailingCommas: true,
        properties: {
            fonts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: nls.localize(0, null),
                            pattern: exports.fontIdRegex,
                            patternErrorMessage: nls.localize(1, null)
                        },
                        src: {
                            type: 'array',
                            description: nls.localize(2, null),
                            items: {
                                type: 'object',
                                properties: {
                                    path: {
                                        type: 'string',
                                        description: nls.localize(3, null),
                                    },
                                    format: {
                                        type: 'string',
                                        description: nls.localize(4, null),
                                        enum: ['woff', 'woff2', 'truetype', 'opentype', 'embedded-opentype', 'svg']
                                    }
                                },
                                required: [
                                    'path',
                                    'format'
                                ]
                            }
                        },
                        weight: {
                            type: 'string',
                            description: nls.localize(5, null),
                            anyOf: [
                                { enum: ['normal', 'bold', 'lighter', 'bolder'] },
                                { type: 'string', pattern: exports.fontWeightRegex }
                            ]
                        },
                        style: {
                            type: 'string',
                            description: nls.localize(6, null),
                            anyOf: [
                                { enum: ['normal', 'italic', 'oblique'] },
                                { type: 'string', pattern: exports.fontStyleRegex }
                            ]
                        }
                    },
                    required: [
                        'id',
                        'src'
                    ]
                }
            },
            iconDefinitions: {
                description: nls.localize(7, null),
                $ref: iconRegistry_1.iconsSchemaId,
                additionalProperties: false
            }
        }
    };
    function registerProductIconThemeSchemas() {
        let schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        schemaRegistry.registerSchema(schemaId, schema);
    }
    exports.registerProductIconThemeSchemas = registerProductIconThemeSchemas;
});
//# sourceMappingURL=productIconThemeSchema.js.map