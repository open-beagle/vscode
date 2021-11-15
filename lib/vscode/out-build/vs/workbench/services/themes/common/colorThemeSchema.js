define(["require", "exports", "vs/nls!vs/workbench/services/themes/common/colorThemeSchema", "vs/platform/registry/common/platform", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/tokenClassificationRegistry"], function (require, exports, nls, platform_1, jsonContributionRegistry_1, colorRegistry_1, tokenClassificationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerColorThemeSchemas = exports.colorThemeSchemaId = exports.textmateColorGroupSchemaId = exports.textmateColorSettingsSchemaId = exports.textmateColorsSchemaId = void 0;
    let textMateScopes = [
        'comment',
        'comment.block',
        'comment.block.documentation',
        'comment.line',
        'constant',
        'constant.character',
        'constant.character.escape',
        'constant.numeric',
        'constant.numeric.integer',
        'constant.numeric.float',
        'constant.numeric.hex',
        'constant.numeric.octal',
        'constant.other',
        'constant.regexp',
        'constant.rgb-value',
        'emphasis',
        'entity',
        'entity.name',
        'entity.name.class',
        'entity.name.function',
        'entity.name.method',
        'entity.name.section',
        'entity.name.selector',
        'entity.name.tag',
        'entity.name.type',
        'entity.other',
        'entity.other.attribute-name',
        'entity.other.inherited-class',
        'invalid',
        'invalid.deprecated',
        'invalid.illegal',
        'keyword',
        'keyword.control',
        'keyword.operator',
        'keyword.operator.new',
        'keyword.operator.assignment',
        'keyword.operator.arithmetic',
        'keyword.operator.logical',
        'keyword.other',
        'markup',
        'markup.bold',
        'markup.changed',
        'markup.deleted',
        'markup.heading',
        'markup.inline.raw',
        'markup.inserted',
        'markup.italic',
        'markup.list',
        'markup.list.numbered',
        'markup.list.unnumbered',
        'markup.other',
        'markup.quote',
        'markup.raw',
        'markup.underline',
        'markup.underline.link',
        'meta',
        'meta.block',
        'meta.cast',
        'meta.class',
        'meta.function',
        'meta.function-call',
        'meta.preprocessor',
        'meta.return-type',
        'meta.selector',
        'meta.tag',
        'meta.type.annotation',
        'meta.type',
        'punctuation.definition.string.begin',
        'punctuation.definition.string.end',
        'punctuation.separator',
        'punctuation.separator.continuation',
        'punctuation.terminator',
        'storage',
        'storage.modifier',
        'storage.type',
        'string',
        'string.interpolated',
        'string.other',
        'string.quoted',
        'string.quoted.double',
        'string.quoted.other',
        'string.quoted.single',
        'string.quoted.triple',
        'string.regexp',
        'string.unquoted',
        'strong',
        'support',
        'support.class',
        'support.constant',
        'support.function',
        'support.other',
        'support.type',
        'support.type.property-name',
        'support.variable',
        'variable',
        'variable.language',
        'variable.name',
        'variable.other',
        'variable.other.readwrite',
        'variable.parameter'
    ];
    exports.textmateColorsSchemaId = 'vscode://schemas/textmate-colors';
    exports.textmateColorSettingsSchemaId = `${exports.textmateColorsSchemaId}#definitions/settings`;
    exports.textmateColorGroupSchemaId = `${exports.textmateColorsSchemaId}#definitions/colorGroup`;
    const textmateColorSchema = {
        type: 'array',
        definitions: {
            colorGroup: {
                default: '#FF0000',
                anyOf: [
                    {
                        type: 'string',
                        format: 'color-hex'
                    },
                    {
                        $ref: '#definitions/settings'
                    }
                ]
            },
            settings: {
                type: 'object',
                description: nls.localize(0, null),
                properties: {
                    foreground: {
                        type: 'string',
                        description: nls.localize(1, null),
                        format: 'color-hex',
                        default: '#ff0000'
                    },
                    background: {
                        type: 'string',
                        deprecationMessage: nls.localize(2, null)
                    },
                    fontStyle: {
                        type: 'string',
                        description: nls.localize(3, null),
                        pattern: '^(\\s*\\b(italic|bold|underline))*\\s*$',
                        patternErrorMessage: nls.localize(4, null),
                        defaultSnippets: [{ label: nls.localize(5, null), bodyText: '""' }, { body: 'italic' }, { body: 'bold' }, { body: 'underline' }, { body: 'italic bold' }, { body: 'italic underline' }, { body: 'bold underline' }, { body: 'italic bold underline' }]
                    }
                },
                additionalProperties: false,
                defaultSnippets: [{ body: { foreground: '${1:#FF0000}', fontStyle: '${2:bold}' } }]
            }
        },
        items: {
            type: 'object',
            defaultSnippets: [{ body: { scope: '${1:keyword.operator}', settings: { foreground: '${2:#FF0000}' } } }],
            properties: {
                name: {
                    type: 'string',
                    description: nls.localize(6, null)
                },
                scope: {
                    description: nls.localize(7, null),
                    anyOf: [
                        {
                            enum: textMateScopes
                        },
                        {
                            type: 'string'
                        },
                        {
                            type: 'array',
                            items: {
                                enum: textMateScopes
                            }
                        },
                        {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    ]
                },
                settings: {
                    $ref: '#definitions/settings'
                }
            },
            required: [
                'settings', 'scope'
            ],
            additionalProperties: false
        }
    };
    exports.colorThemeSchemaId = 'vscode://schemas/color-theme';
    const colorThemeSchema = {
        type: 'object',
        allowComments: true,
        allowTrailingCommas: true,
        properties: {
            colors: {
                description: nls.localize(8, null),
                $ref: colorRegistry_1.workbenchColorsSchemaId,
                additionalProperties: false
            },
            tokenColors: {
                anyOf: [{
                        type: 'string',
                        description: nls.localize(9, null)
                    },
                    {
                        description: nls.localize(10, null),
                        $ref: exports.textmateColorsSchemaId
                    }
                ]
            },
            semanticHighlighting: {
                type: 'boolean',
                description: nls.localize(11, null)
            },
            semanticTokenColors: {
                type: 'object',
                description: nls.localize(12, null),
                $ref: tokenClassificationRegistry_1.tokenStylingSchemaId
            }
        }
    };
    function registerColorThemeSchemas() {
        let schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        schemaRegistry.registerSchema(exports.colorThemeSchemaId, colorThemeSchema);
        schemaRegistry.registerSchema(exports.textmateColorsSchemaId, textmateColorSchema);
    }
    exports.registerColorThemeSchemas = registerColorThemeSchemas;
});
//# sourceMappingURL=colorThemeSchema.js.map