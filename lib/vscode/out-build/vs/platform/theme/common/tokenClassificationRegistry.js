/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/base/common/color", "vs/nls!vs/platform/theme/common/tokenClassificationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/async", "vs/base/common/event"], function (require, exports, platform, color_1, nls, jsonContributionRegistry_1, async_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tokenStylingSchemaId = exports.getTokenClassificationRegistry = exports.parseClassifierString = exports.Extensions = exports.SemanticTokenRule = exports.TokenStyle = exports.fontStylePattern = exports.selectorPattern = exports.typeAndModifierIdPattern = exports.idPattern = exports.CLASSIFIER_MODIFIER_SEPARATOR = exports.TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR = exports.TOKEN_TYPE_WILDCARD = void 0;
    exports.TOKEN_TYPE_WILDCARD = '*';
    exports.TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR = ':';
    exports.CLASSIFIER_MODIFIER_SEPARATOR = '.';
    exports.idPattern = '\\w+[-_\\w+]*';
    exports.typeAndModifierIdPattern = `^${exports.idPattern}$`;
    exports.selectorPattern = `^(${exports.idPattern}|\\*)(\\${exports.CLASSIFIER_MODIFIER_SEPARATOR}${exports.idPattern})*(\\${exports.TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR}${exports.idPattern})?$`;
    exports.fontStylePattern = '^(\\s*(italic|bold|underline))*\\s*$';
    class TokenStyle {
        constructor(foreground, bold, underline, italic) {
            this.foreground = foreground;
            this.bold = bold;
            this.underline = underline;
            this.italic = italic;
        }
    }
    exports.TokenStyle = TokenStyle;
    (function (TokenStyle) {
        function toJSONObject(style) {
            return {
                _foreground: style.foreground === undefined ? null : color_1.Color.Format.CSS.formatHexA(style.foreground, true),
                _bold: style.bold === undefined ? null : style.bold,
                _underline: style.underline === undefined ? null : style.underline,
                _italic: style.italic === undefined ? null : style.italic,
            };
        }
        TokenStyle.toJSONObject = toJSONObject;
        function fromJSONObject(obj) {
            if (obj) {
                const boolOrUndef = (b) => (typeof b === 'boolean') ? b : undefined;
                const colorOrUndef = (s) => (typeof s === 'string') ? color_1.Color.fromHex(s) : undefined;
                return new TokenStyle(colorOrUndef(obj._foreground), boolOrUndef(obj._bold), boolOrUndef(obj._underline), boolOrUndef(obj._italic));
            }
            return undefined;
        }
        TokenStyle.fromJSONObject = fromJSONObject;
        function equals(s1, s2) {
            if (s1 === s2) {
                return true;
            }
            return s1 !== undefined && s2 !== undefined
                && (s1.foreground instanceof color_1.Color ? s1.foreground.equals(s2.foreground) : s2.foreground === undefined)
                && s1.bold === s2.bold
                && s1.underline === s2.underline
                && s1.italic === s2.italic;
        }
        TokenStyle.equals = equals;
        function is(s) {
            return s instanceof TokenStyle;
        }
        TokenStyle.is = is;
        function fromData(data) {
            return new TokenStyle(data.foreground, data.bold, data.underline, data.italic);
        }
        TokenStyle.fromData = fromData;
        function fromSettings(foreground, fontStyle, bold, underline, italic) {
            let foregroundColor = undefined;
            if (foreground !== undefined) {
                foregroundColor = color_1.Color.fromHex(foreground);
            }
            if (fontStyle !== undefined) {
                bold = italic = underline = false;
                const expression = /italic|bold|underline/g;
                let match;
                while ((match = expression.exec(fontStyle))) {
                    switch (match[0]) {
                        case 'bold':
                            bold = true;
                            break;
                        case 'italic':
                            italic = true;
                            break;
                        case 'underline':
                            underline = true;
                            break;
                    }
                }
            }
            return new TokenStyle(foregroundColor, bold, underline, italic);
        }
        TokenStyle.fromSettings = fromSettings;
    })(TokenStyle = exports.TokenStyle || (exports.TokenStyle = {}));
    var SemanticTokenRule;
    (function (SemanticTokenRule) {
        function fromJSONObject(registry, o) {
            if (o && typeof o._selector === 'string' && o._style) {
                const style = TokenStyle.fromJSONObject(o._style);
                if (style) {
                    try {
                        return { selector: registry.parseTokenSelector(o._selector), style };
                    }
                    catch (_ignore) {
                    }
                }
            }
            return undefined;
        }
        SemanticTokenRule.fromJSONObject = fromJSONObject;
        function toJSONObject(rule) {
            return {
                _selector: rule.selector.id,
                _style: TokenStyle.toJSONObject(rule.style)
            };
        }
        SemanticTokenRule.toJSONObject = toJSONObject;
        function equals(r1, r2) {
            if (r1 === r2) {
                return true;
            }
            return r1 !== undefined && r2 !== undefined
                && r1.selector && r2.selector && r1.selector.id === r2.selector.id
                && TokenStyle.equals(r1.style, r2.style);
        }
        SemanticTokenRule.equals = equals;
        function is(r) {
            return r && r.selector && typeof r.selector.id === 'string' && TokenStyle.is(r.style);
        }
        SemanticTokenRule.is = is;
    })(SemanticTokenRule = exports.SemanticTokenRule || (exports.SemanticTokenRule = {}));
    // TokenStyle registry
    exports.Extensions = {
        TokenClassificationContribution: 'base.contributions.tokenClassification'
    };
    class TokenClassificationRegistry {
        constructor() {
            this._onDidChangeSchema = new event_1.Emitter();
            this.onDidChangeSchema = this._onDidChangeSchema.event;
            this.currentTypeNumber = 0;
            this.currentModifierBit = 1;
            this.tokenStylingDefaultRules = [];
            this.tokenStylingSchema = {
                type: 'object',
                properties: {},
                patternProperties: {
                    [exports.selectorPattern]: getStylingSchemeEntry()
                },
                //errorMessage: nls.localize('schema.token.errors', 'Valid token selectors have the form (*|tokenType)(.tokenModifier)*(:tokenLanguage)?.'),
                additionalProperties: false,
                definitions: {
                    style: {
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
                                pattern: exports.fontStylePattern,
                                patternErrorMessage: nls.localize(4, null),
                                defaultSnippets: [{ label: nls.localize(5, null), bodyText: '""' }, { body: 'italic' }, { body: 'bold' }, { body: 'underline' }, { body: 'italic underline' }, { body: 'bold underline' }, { body: 'italic bold underline' }]
                            },
                            bold: {
                                type: 'boolean',
                                description: nls.localize(6, null),
                            },
                            italic: {
                                type: 'boolean',
                                description: nls.localize(7, null),
                            },
                            underline: {
                                type: 'boolean',
                                description: nls.localize(8, null),
                            }
                        },
                        defaultSnippets: [{ body: { foreground: '${1:#FF0000}', fontStyle: '${2:bold}' } }]
                    }
                }
            };
            this.tokenTypeById = Object.create(null);
            this.tokenModifierById = Object.create(null);
            this.typeHierarchy = Object.create(null);
        }
        registerTokenType(id, description, superType, deprecationMessage) {
            if (!id.match(exports.typeAndModifierIdPattern)) {
                throw new Error('Invalid token type id.');
            }
            if (superType && !superType.match(exports.typeAndModifierIdPattern)) {
                throw new Error('Invalid token super type id.');
            }
            const num = this.currentTypeNumber++;
            let tokenStyleContribution = { num, id, superType, description, deprecationMessage };
            this.tokenTypeById[id] = tokenStyleContribution;
            const stylingSchemeEntry = getStylingSchemeEntry(description, deprecationMessage);
            this.tokenStylingSchema.properties[id] = stylingSchemeEntry;
            this.typeHierarchy = Object.create(null);
        }
        registerTokenModifier(id, description, deprecationMessage) {
            if (!id.match(exports.typeAndModifierIdPattern)) {
                throw new Error('Invalid token modifier id.');
            }
            const num = this.currentModifierBit;
            this.currentModifierBit = this.currentModifierBit * 2;
            let tokenStyleContribution = { num, id, description, deprecationMessage };
            this.tokenModifierById[id] = tokenStyleContribution;
            this.tokenStylingSchema.properties[`*.${id}`] = getStylingSchemeEntry(description, deprecationMessage);
        }
        parseTokenSelector(selectorString, language) {
            const selector = parseClassifierString(selectorString, language);
            if (!selector.type) {
                return {
                    match: () => -1,
                    id: '$invalid'
                };
            }
            return {
                match: (type, modifiers, language) => {
                    let score = 0;
                    if (selector.language !== undefined) {
                        if (selector.language !== language) {
                            return -1;
                        }
                        score += 10;
                    }
                    if (selector.type !== exports.TOKEN_TYPE_WILDCARD) {
                        const hierarchy = this.getTypeHierarchy(type);
                        const level = hierarchy.indexOf(selector.type);
                        if (level === -1) {
                            return -1;
                        }
                        score += (100 - level);
                    }
                    // all selector modifiers must be present
                    for (const selectorModifier of selector.modifiers) {
                        if (modifiers.indexOf(selectorModifier) === -1) {
                            return -1;
                        }
                    }
                    return score + selector.modifiers.length * 100;
                },
                id: `${[selector.type, ...selector.modifiers.sort()].join('.')}${selector.language !== undefined ? ':' + selector.language : ''}`
            };
        }
        registerTokenStyleDefault(selector, defaults) {
            this.tokenStylingDefaultRules.push({ selector, defaults });
        }
        deregisterTokenStyleDefault(selector) {
            const selectorString = selector.id;
            this.tokenStylingDefaultRules = this.tokenStylingDefaultRules.filter(r => r.selector.id !== selectorString);
        }
        deregisterTokenType(id) {
            delete this.tokenTypeById[id];
            delete this.tokenStylingSchema.properties[id];
            this.typeHierarchy = Object.create(null);
        }
        deregisterTokenModifier(id) {
            delete this.tokenModifierById[id];
            delete this.tokenStylingSchema.properties[`*.${id}`];
        }
        getTokenTypes() {
            return Object.keys(this.tokenTypeById).map(id => this.tokenTypeById[id]);
        }
        getTokenModifiers() {
            return Object.keys(this.tokenModifierById).map(id => this.tokenModifierById[id]);
        }
        getTokenStylingSchema() {
            return this.tokenStylingSchema;
        }
        getTokenStylingDefaultRules() {
            return this.tokenStylingDefaultRules;
        }
        getTypeHierarchy(typeId) {
            let hierarchy = this.typeHierarchy[typeId];
            if (!hierarchy) {
                this.typeHierarchy[typeId] = hierarchy = [typeId];
                let type = this.tokenTypeById[typeId];
                while (type && type.superType) {
                    hierarchy.push(type.superType);
                    type = this.tokenTypeById[type.superType];
                }
            }
            return hierarchy;
        }
        toString() {
            let sorter = (a, b) => {
                let cat1 = a.indexOf('.') === -1 ? 0 : 1;
                let cat2 = b.indexOf('.') === -1 ? 0 : 1;
                if (cat1 !== cat2) {
                    return cat1 - cat2;
                }
                return a.localeCompare(b);
            };
            return Object.keys(this.tokenTypeById).sort(sorter).map(k => `- \`${k}\`: ${this.tokenTypeById[k].description}`).join('\n');
        }
    }
    const CHAR_LANGUAGE = exports.TOKEN_CLASSIFIER_LANGUAGE_SEPARATOR.charCodeAt(0);
    const CHAR_MODIFIER = exports.CLASSIFIER_MODIFIER_SEPARATOR.charCodeAt(0);
    function parseClassifierString(s, defaultLanguage) {
        let k = s.length;
        let language = defaultLanguage;
        const modifiers = [];
        for (let i = k - 1; i >= 0; i--) {
            const ch = s.charCodeAt(i);
            if (ch === CHAR_LANGUAGE || ch === CHAR_MODIFIER) {
                const segment = s.substring(i + 1, k);
                k = i;
                if (ch === CHAR_LANGUAGE) {
                    language = segment;
                }
                else {
                    modifiers.push(segment);
                }
            }
        }
        const type = s.substring(0, k);
        return { type, modifiers, language };
    }
    exports.parseClassifierString = parseClassifierString;
    let tokenClassificationRegistry = createDefaultTokenClassificationRegistry();
    platform.Registry.add(exports.Extensions.TokenClassificationContribution, tokenClassificationRegistry);
    function createDefaultTokenClassificationRegistry() {
        const registry = new TokenClassificationRegistry();
        function registerTokenType(id, description, scopesToProbe = [], superType, deprecationMessage) {
            registry.registerTokenType(id, description, superType, deprecationMessage);
            if (scopesToProbe) {
                registerTokenStyleDefault(id, scopesToProbe);
            }
            return id;
        }
        function registerTokenStyleDefault(selectorString, scopesToProbe) {
            try {
                const selector = registry.parseTokenSelector(selectorString);
                registry.registerTokenStyleDefault(selector, { scopesToProbe });
            }
            catch (e) {
                console.log(e);
            }
        }
        // default token types
        registerTokenType('comment', nls.localize(9, null), [['comment']]);
        registerTokenType('string', nls.localize(10, null), [['string']]);
        registerTokenType('keyword', nls.localize(11, null), [['keyword.control']]);
        registerTokenType('number', nls.localize(12, null), [['constant.numeric']]);
        registerTokenType('regexp', nls.localize(13, null), [['constant.regexp']]);
        registerTokenType('operator', nls.localize(14, null), [['keyword.operator']]);
        registerTokenType('namespace', nls.localize(15, null), [['entity.name.namespace']]);
        registerTokenType('type', nls.localize(16, null), [['entity.name.type'], ['support.type']]);
        registerTokenType('struct', nls.localize(17, null), [['entity.name.type.struct']]);
        registerTokenType('class', nls.localize(18, null), [['entity.name.type.class'], ['support.class']]);
        registerTokenType('interface', nls.localize(19, null), [['entity.name.type.interface']]);
        registerTokenType('enum', nls.localize(20, null), [['entity.name.type.enum']]);
        registerTokenType('typeParameter', nls.localize(21, null), [['entity.name.type.parameter']]);
        registerTokenType('function', nls.localize(22, null), [['entity.name.function'], ['support.function']]);
        registerTokenType('member', nls.localize(23, null), [], 'method', 'Deprecated use `method` instead');
        registerTokenType('method', nls.localize(24, null), [['entity.name.function.member'], ['support.function']]);
        registerTokenType('macro', nls.localize(25, null), [['entity.name.function.preprocessor']]);
        registerTokenType('variable', nls.localize(26, null), [['variable.other.readwrite'], ['entity.name.variable']]);
        registerTokenType('parameter', nls.localize(27, null), [['variable.parameter']]);
        registerTokenType('property', nls.localize(28, null), [['variable.other.property']]);
        registerTokenType('enumMember', nls.localize(29, null), [['variable.other.enummember']]);
        registerTokenType('event', nls.localize(30, null), [['variable.other.event']]);
        registerTokenType('label', nls.localize(31, null), undefined);
        // default token modifiers
        registry.registerTokenModifier('declaration', nls.localize(32, null), undefined);
        registry.registerTokenModifier('documentation', nls.localize(33, null), undefined);
        registry.registerTokenModifier('static', nls.localize(34, null), undefined);
        registry.registerTokenModifier('abstract', nls.localize(35, null), undefined);
        registry.registerTokenModifier('deprecated', nls.localize(36, null), undefined);
        registry.registerTokenModifier('modification', nls.localize(37, null), undefined);
        registry.registerTokenModifier('async', nls.localize(38, null), undefined);
        registry.registerTokenModifier('readonly', nls.localize(39, null), undefined);
        registerTokenStyleDefault('variable.readonly', [['variable.other.constant']]);
        registerTokenStyleDefault('property.readonly', [['variable.other.constant.property']]);
        registerTokenStyleDefault('type.defaultLibrary', [['support.type']]);
        registerTokenStyleDefault('class.defaultLibrary', [['support.class']]);
        registerTokenStyleDefault('interface.defaultLibrary', [['support.class']]);
        registerTokenStyleDefault('variable.defaultLibrary', [['support.variable'], ['support.other.variable']]);
        registerTokenStyleDefault('variable.defaultLibrary.readonly', [['support.constant']]);
        registerTokenStyleDefault('property.defaultLibrary', [['support.variable.property']]);
        registerTokenStyleDefault('property.defaultLibrary.readonly', [['support.constant.property']]);
        registerTokenStyleDefault('function.defaultLibrary', [['support.function']]);
        registerTokenStyleDefault('member.defaultLibrary', [['support.function']]);
        return registry;
    }
    function getTokenClassificationRegistry() {
        return tokenClassificationRegistry;
    }
    exports.getTokenClassificationRegistry = getTokenClassificationRegistry;
    function getStylingSchemeEntry(description, deprecationMessage) {
        return {
            description,
            deprecationMessage,
            defaultSnippets: [{ body: '${1:#ff0000}' }],
            anyOf: [
                {
                    type: 'string',
                    format: 'color-hex'
                },
                {
                    $ref: '#definitions/style'
                }
            ]
        };
    }
    exports.tokenStylingSchemaId = 'vscode://schemas/token-styling';
    let schemaRegistry = platform.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(exports.tokenStylingSchemaId, tokenClassificationRegistry.getTokenStylingSchema());
    const delayer = new async_1.RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(exports.tokenStylingSchemaId), 200);
    tokenClassificationRegistry.onDidChangeSchema(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
});
//# sourceMappingURL=tokenClassificationRegistry.js.map