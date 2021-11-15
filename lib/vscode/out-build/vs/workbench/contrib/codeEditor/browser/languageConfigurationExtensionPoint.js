/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/languageConfigurationExtensionPoint", "vs/base/common/json", "vs/base/common/types", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/common/services/modeService", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/platform/registry/common/platform", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/textMate/common/textMateService", "vs/base/common/jsonErrorMessages", "vs/workbench/services/extensionResourceLoader/common/extensionResourceLoader"], function (require, exports, nls, json_1, types, languageConfiguration_1, languageConfigurationRegistry_1, modeService_1, jsonContributionRegistry_1, platform_1, extensions_1, textMateService_1, jsonErrorMessages_1, extensionResourceLoader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageConfigurationFileHandler = void 0;
    function isStringArr(something) {
        if (!Array.isArray(something)) {
            return false;
        }
        for (let i = 0, len = something.length; i < len; i++) {
            if (typeof something[i] !== 'string') {
                return false;
            }
        }
        return true;
    }
    function isCharacterPair(something) {
        return (isStringArr(something)
            && something.length === 2);
    }
    let LanguageConfigurationFileHandler = class LanguageConfigurationFileHandler {
        constructor(textMateService, _modeService, _extensionResourceLoaderService, _extensionService) {
            this._modeService = _modeService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._extensionService = _extensionService;
            this._done = [];
            // Listen for hints that a language configuration is needed/usefull and then load it once
            this._modeService.onDidCreateMode((mode) => {
                const languageIdentifier = mode.getLanguageIdentifier();
                // Modes can be instantiated before the extension points have finished registering
                this._extensionService.whenInstalledExtensionsRegistered().then(() => {
                    this._loadConfigurationsForMode(languageIdentifier);
                });
            });
            textMateService.onDidEncounterLanguage((languageId) => {
                this._loadConfigurationsForMode(this._modeService.getLanguageIdentifier(languageId));
            });
        }
        _loadConfigurationsForMode(languageIdentifier) {
            if (this._done[languageIdentifier.id]) {
                return;
            }
            this._done[languageIdentifier.id] = true;
            const configurationFiles = this._modeService.getConfigurationFiles(languageIdentifier.language);
            configurationFiles.forEach((configFileLocation) => this._handleConfigFile(languageIdentifier, configFileLocation));
        }
        _handleConfigFile(languageIdentifier, configFileLocation) {
            this._extensionResourceLoaderService.readExtensionResource(configFileLocation).then((contents) => {
                const errors = [];
                let configuration = (0, json_1.parse)(contents, errors);
                if (errors.length) {
                    console.error(nls.localize(0, null, configFileLocation.toString(), errors.map(e => (`[${e.offset}, ${e.length}] ${(0, jsonErrorMessages_1.getParseErrorMessage)(e.error)}`)).join('\n')));
                }
                if ((0, json_1.getNodeType)(configuration) !== 'object') {
                    console.error(nls.localize(1, null, configFileLocation.toString()));
                    configuration = {};
                }
                this._handleConfig(languageIdentifier, configuration);
            }, (err) => {
                console.error(err);
            });
        }
        _extractValidCommentRule(languageIdentifier, configuration) {
            const source = configuration.comments;
            if (typeof source === 'undefined') {
                return null;
            }
            if (!types.isObject(source)) {
                console.warn(`[${languageIdentifier.language}]: language configuration: expected \`comments\` to be an object.`);
                return null;
            }
            let result = null;
            if (typeof source.lineComment !== 'undefined') {
                if (typeof source.lineComment !== 'string') {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`comments.lineComment\` to be a string.`);
                }
                else {
                    result = result || {};
                    result.lineComment = source.lineComment;
                }
            }
            if (typeof source.blockComment !== 'undefined') {
                if (!isCharacterPair(source.blockComment)) {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`comments.blockComment\` to be an array of two strings.`);
                }
                else {
                    result = result || {};
                    result.blockComment = source.blockComment;
                }
            }
            return result;
        }
        _extractValidBrackets(languageIdentifier, configuration) {
            const source = configuration.brackets;
            if (typeof source === 'undefined') {
                return null;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageIdentifier.language}]: language configuration: expected \`brackets\` to be an array.`);
                return null;
            }
            let result = null;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (!isCharacterPair(pair)) {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`brackets[${i}]\` to be an array of two strings.`);
                    continue;
                }
                result = result || [];
                result.push(pair);
            }
            return result;
        }
        _extractValidAutoClosingPairs(languageIdentifier, configuration) {
            const source = configuration.autoClosingPairs;
            if (typeof source === 'undefined') {
                return null;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageIdentifier.language}]: language configuration: expected \`autoClosingPairs\` to be an array.`);
                return null;
            }
            let result = null;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (Array.isArray(pair)) {
                    if (!isCharacterPair(pair)) {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`autoClosingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair[0], close: pair[1] });
                }
                else {
                    if (!types.isObject(pair)) {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`autoClosingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    if (typeof pair.open !== 'string') {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`autoClosingPairs[${i}].open\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.close !== 'string') {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`autoClosingPairs[${i}].close\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.notIn !== 'undefined') {
                        if (!isStringArr(pair.notIn)) {
                            console.warn(`[${languageIdentifier.language}]: language configuration: expected \`autoClosingPairs[${i}].notIn\` to be a string array.`);
                            continue;
                        }
                    }
                    result = result || [];
                    result.push({ open: pair.open, close: pair.close, notIn: pair.notIn });
                }
            }
            return result;
        }
        _extractValidSurroundingPairs(languageIdentifier, configuration) {
            const source = configuration.surroundingPairs;
            if (typeof source === 'undefined') {
                return null;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageIdentifier.language}]: language configuration: expected \`surroundingPairs\` to be an array.`);
                return null;
            }
            let result = null;
            for (let i = 0, len = source.length; i < len; i++) {
                const pair = source[i];
                if (Array.isArray(pair)) {
                    if (!isCharacterPair(pair)) {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`surroundingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair[0], close: pair[1] });
                }
                else {
                    if (!types.isObject(pair)) {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`surroundingPairs[${i}]\` to be an array of two strings or an object.`);
                        continue;
                    }
                    if (typeof pair.open !== 'string') {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`surroundingPairs[${i}].open\` to be a string.`);
                        continue;
                    }
                    if (typeof pair.close !== 'string') {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`surroundingPairs[${i}].close\` to be a string.`);
                        continue;
                    }
                    result = result || [];
                    result.push({ open: pair.open, close: pair.close });
                }
            }
            return result;
        }
        _extractValidOnEnterRules(languageIdentifier, configuration) {
            const source = configuration.onEnterRules;
            if (typeof source === 'undefined') {
                return null;
            }
            if (!Array.isArray(source)) {
                console.warn(`[${languageIdentifier.language}]: language configuration: expected \`onEnterRules\` to be an array.`);
                return null;
            }
            let result = null;
            for (let i = 0, len = source.length; i < len; i++) {
                const onEnterRule = source[i];
                if (!types.isObject(onEnterRule)) {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`onEnterRules[${i}]\` to be an object.`);
                    continue;
                }
                if (!types.isObject(onEnterRule.action)) {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`onEnterRules[${i}].action\` to be an object.`);
                    continue;
                }
                let indentAction;
                if (onEnterRule.action.indent === 'none') {
                    indentAction = languageConfiguration_1.IndentAction.None;
                }
                else if (onEnterRule.action.indent === 'indent') {
                    indentAction = languageConfiguration_1.IndentAction.Indent;
                }
                else if (onEnterRule.action.indent === 'indentOutdent') {
                    indentAction = languageConfiguration_1.IndentAction.IndentOutdent;
                }
                else if (onEnterRule.action.indent === 'outdent') {
                    indentAction = languageConfiguration_1.IndentAction.Outdent;
                }
                else {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`onEnterRules[${i}].action.indent\` to be 'none', 'indent', 'indentOutdent' or 'outdent'.`);
                    continue;
                }
                const action = { indentAction };
                if (onEnterRule.action.appendText) {
                    if (typeof onEnterRule.action.appendText === 'string') {
                        action.appendText = onEnterRule.action.appendText;
                    }
                    else {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`onEnterRules[${i}].action.appendText\` to be undefined or a string.`);
                    }
                }
                if (onEnterRule.action.removeText) {
                    if (typeof onEnterRule.action.removeText === 'number') {
                        action.removeText = onEnterRule.action.removeText;
                    }
                    else {
                        console.warn(`[${languageIdentifier.language}]: language configuration: expected \`onEnterRules[${i}].action.removeText\` to be undefined or a number.`);
                    }
                }
                const beforeText = this._parseRegex(languageIdentifier, `onEnterRules[${i}].beforeText`, onEnterRule.beforeText);
                if (!beforeText) {
                    continue;
                }
                const resultingOnEnterRule = { beforeText, action };
                if (onEnterRule.afterText) {
                    const afterText = this._parseRegex(languageIdentifier, `onEnterRules[${i}].afterText`, onEnterRule.afterText);
                    if (afterText) {
                        resultingOnEnterRule.afterText = afterText;
                    }
                }
                if (onEnterRule.previousLineText) {
                    const previousLineText = this._parseRegex(languageIdentifier, `onEnterRules[${i}].previousLineText`, onEnterRule.previousLineText);
                    if (previousLineText) {
                        resultingOnEnterRule.previousLineText = previousLineText;
                    }
                }
                result = result || [];
                result.push(resultingOnEnterRule);
            }
            return result;
        }
        _handleConfig(languageIdentifier, configuration) {
            const richEditConfig = {};
            const comments = this._extractValidCommentRule(languageIdentifier, configuration);
            if (comments) {
                richEditConfig.comments = comments;
            }
            const brackets = this._extractValidBrackets(languageIdentifier, configuration);
            if (brackets) {
                richEditConfig.brackets = brackets;
            }
            const autoClosingPairs = this._extractValidAutoClosingPairs(languageIdentifier, configuration);
            if (autoClosingPairs) {
                richEditConfig.autoClosingPairs = autoClosingPairs;
            }
            const surroundingPairs = this._extractValidSurroundingPairs(languageIdentifier, configuration);
            if (surroundingPairs) {
                richEditConfig.surroundingPairs = surroundingPairs;
            }
            const autoCloseBefore = configuration.autoCloseBefore;
            if (typeof autoCloseBefore === 'string') {
                richEditConfig.autoCloseBefore = autoCloseBefore;
            }
            if (configuration.wordPattern) {
                const wordPattern = this._parseRegex(languageIdentifier, `wordPattern`, configuration.wordPattern);
                if (wordPattern) {
                    richEditConfig.wordPattern = wordPattern;
                }
            }
            if (configuration.indentationRules) {
                const indentationRules = this._mapIndentationRules(languageIdentifier, configuration.indentationRules);
                if (indentationRules) {
                    richEditConfig.indentationRules = indentationRules;
                }
            }
            if (configuration.folding) {
                const markers = configuration.folding.markers;
                richEditConfig.folding = {
                    offSide: configuration.folding.offSide,
                    markers: markers ? { start: new RegExp(markers.start), end: new RegExp(markers.end) } : undefined
                };
            }
            const onEnterRules = this._extractValidOnEnterRules(languageIdentifier, configuration);
            if (onEnterRules) {
                richEditConfig.onEnterRules = onEnterRules;
            }
            languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(languageIdentifier, richEditConfig, 50);
        }
        _parseRegex(languageIdentifier, confPath, value) {
            if (typeof value === 'string') {
                try {
                    return new RegExp(value, '');
                }
                catch (err) {
                    console.warn(`[${languageIdentifier.language}]: Invalid regular expression in \`${confPath}\`: `, err);
                    return null;
                }
            }
            if (types.isObject(value)) {
                if (typeof value.pattern !== 'string') {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`${confPath}.pattern\` to be a string.`);
                    return null;
                }
                if (typeof value.flags !== 'undefined' && typeof value.flags !== 'string') {
                    console.warn(`[${languageIdentifier.language}]: language configuration: expected \`${confPath}.flags\` to be a string.`);
                    return null;
                }
                try {
                    return new RegExp(value.pattern, value.flags);
                }
                catch (err) {
                    console.warn(`[${languageIdentifier.language}]: Invalid regular expression in \`${confPath}\`: `, err);
                    return null;
                }
            }
            console.warn(`[${languageIdentifier.language}]: language configuration: expected \`${confPath}\` to be a string or an object.`);
            return null;
        }
        _mapIndentationRules(languageIdentifier, indentationRules) {
            const increaseIndentPattern = this._parseRegex(languageIdentifier, `indentationRules.increaseIndentPattern`, indentationRules.increaseIndentPattern);
            if (!increaseIndentPattern) {
                return null;
            }
            const decreaseIndentPattern = this._parseRegex(languageIdentifier, `indentationRules.decreaseIndentPattern`, indentationRules.decreaseIndentPattern);
            if (!decreaseIndentPattern) {
                return null;
            }
            const result = {
                increaseIndentPattern: increaseIndentPattern,
                decreaseIndentPattern: decreaseIndentPattern
            };
            if (indentationRules.indentNextLinePattern) {
                result.indentNextLinePattern = this._parseRegex(languageIdentifier, `indentationRules.indentNextLinePattern`, indentationRules.indentNextLinePattern);
            }
            if (indentationRules.unIndentedLinePattern) {
                result.unIndentedLinePattern = this._parseRegex(languageIdentifier, `indentationRules.unIndentedLinePattern`, indentationRules.unIndentedLinePattern);
            }
            return result;
        }
    };
    LanguageConfigurationFileHandler = __decorate([
        __param(0, textMateService_1.ITextMateService),
        __param(1, modeService_1.IModeService),
        __param(2, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(3, extensions_1.IExtensionService)
    ], LanguageConfigurationFileHandler);
    exports.LanguageConfigurationFileHandler = LanguageConfigurationFileHandler;
    const schemaId = 'vscode://schemas/language-configuration';
    const schema = {
        allowComments: true,
        allowTrailingCommas: true,
        default: {
            comments: {
                blockComment: ['/*', '*/'],
                lineComment: '//'
            },
            brackets: [['(', ')'], ['[', ']'], ['{', '}']],
            autoClosingPairs: [['(', ')'], ['[', ']'], ['{', '}']],
            surroundingPairs: [['(', ')'], ['[', ']'], ['{', '}']]
        },
        definitions: {
            openBracket: {
                type: 'string',
                description: nls.localize(2, null)
            },
            closeBracket: {
                type: 'string',
                description: nls.localize(3, null)
            },
            bracketPair: {
                type: 'array',
                items: [{
                        $ref: '#definitions/openBracket'
                    }, {
                        $ref: '#definitions/closeBracket'
                    }]
            }
        },
        properties: {
            comments: {
                default: {
                    blockComment: ['/*', '*/'],
                    lineComment: '//'
                },
                description: nls.localize(4, null),
                type: 'object',
                properties: {
                    blockComment: {
                        type: 'array',
                        description: nls.localize(5, null),
                        items: [{
                                type: 'string',
                                description: nls.localize(6, null)
                            }, {
                                type: 'string',
                                description: nls.localize(7, null)
                            }]
                    },
                    lineComment: {
                        type: 'string',
                        description: nls.localize(8, null)
                    }
                }
            },
            brackets: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize(9, null),
                type: 'array',
                items: {
                    $ref: '#definitions/bracketPair'
                }
            },
            autoClosingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize(10, null),
                type: 'array',
                items: {
                    oneOf: [{
                            $ref: '#definitions/bracketPair'
                        }, {
                            type: 'object',
                            properties: {
                                open: {
                                    $ref: '#definitions/openBracket'
                                },
                                close: {
                                    $ref: '#definitions/closeBracket'
                                },
                                notIn: {
                                    type: 'array',
                                    description: nls.localize(11, null),
                                    items: {
                                        enum: ['string', 'comment']
                                    }
                                }
                            }
                        }]
                }
            },
            autoCloseBefore: {
                default: ';:.,=}])> \n\t',
                description: nls.localize(12, null),
                type: 'string',
            },
            surroundingPairs: {
                default: [['(', ')'], ['[', ']'], ['{', '}']],
                description: nls.localize(13, null),
                type: 'array',
                items: {
                    oneOf: [{
                            $ref: '#definitions/bracketPair'
                        }, {
                            type: 'object',
                            properties: {
                                open: {
                                    $ref: '#definitions/openBracket'
                                },
                                close: {
                                    $ref: '#definitions/closeBracket'
                                }
                            }
                        }]
                }
            },
            wordPattern: {
                default: '',
                description: nls.localize(14, null),
                type: ['string', 'object'],
                properties: {
                    pattern: {
                        type: 'string',
                        description: nls.localize(15, null),
                        default: '',
                    },
                    flags: {
                        type: 'string',
                        description: nls.localize(16, null),
                        default: 'g',
                        pattern: '^([gimuy]+)$',
                        patternErrorMessage: nls.localize(17, null)
                    }
                }
            },
            indentationRules: {
                default: {
                    increaseIndentPattern: '',
                    decreaseIndentPattern: ''
                },
                description: nls.localize(18, null),
                type: 'object',
                properties: {
                    increaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize(19, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(20, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(21, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(22, null)
                            }
                        }
                    },
                    decreaseIndentPattern: {
                        type: ['string', 'object'],
                        description: nls.localize(23, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(24, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(25, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(26, null)
                            }
                        }
                    },
                    indentNextLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize(27, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(28, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(29, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(30, null)
                            }
                        }
                    },
                    unIndentedLinePattern: {
                        type: ['string', 'object'],
                        description: nls.localize(31, null),
                        properties: {
                            pattern: {
                                type: 'string',
                                description: nls.localize(32, null),
                                default: '',
                            },
                            flags: {
                                type: 'string',
                                description: nls.localize(33, null),
                                default: '',
                                pattern: '^([gimuy]+)$',
                                patternErrorMessage: nls.localize(34, null)
                            }
                        }
                    }
                }
            },
            folding: {
                type: 'object',
                description: nls.localize(35, null),
                properties: {
                    offSide: {
                        type: 'boolean',
                        description: nls.localize(36, null),
                    },
                    markers: {
                        type: 'object',
                        description: nls.localize(37, null),
                        properties: {
                            start: {
                                type: 'string',
                                description: nls.localize(38, null)
                            },
                            end: {
                                type: 'string',
                                description: nls.localize(39, null)
                            },
                        }
                    }
                }
            },
            onEnterRules: {
                type: 'array',
                description: nls.localize(40, null),
                items: {
                    type: 'object',
                    description: nls.localize(41, null),
                    required: ['beforeText', 'action'],
                    properties: {
                        beforeText: {
                            type: ['string', 'object'],
                            description: nls.localize(42, null),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize(43, null),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize(44, null),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize(45, null)
                                }
                            }
                        },
                        afterText: {
                            type: ['string', 'object'],
                            description: nls.localize(46, null),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize(47, null),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize(48, null),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize(49, null)
                                }
                            }
                        },
                        previousLineText: {
                            type: ['string', 'object'],
                            description: nls.localize(50, null),
                            properties: {
                                pattern: {
                                    type: 'string',
                                    description: nls.localize(51, null),
                                    default: '',
                                },
                                flags: {
                                    type: 'string',
                                    description: nls.localize(52, null),
                                    default: '',
                                    pattern: '^([gimuy]+)$',
                                    patternErrorMessage: nls.localize(53, null)
                                }
                            }
                        },
                        action: {
                            type: ['string', 'object'],
                            description: nls.localize(54, null),
                            required: ['indent'],
                            default: { 'indent': 'indent' },
                            properties: {
                                indent: {
                                    type: 'string',
                                    description: nls.localize(55, null),
                                    default: 'indent',
                                    enum: ['none', 'indent', 'indentOutdent', 'outdent'],
                                    markdownEnumDescriptions: [
                                        nls.localize(56, null),
                                        nls.localize(57, null),
                                        nls.localize(58, null),
                                        nls.localize(59, null)
                                    ]
                                },
                                appendText: {
                                    type: 'string',
                                    description: nls.localize(60, null),
                                    default: '',
                                },
                                removeText: {
                                    type: 'number',
                                    description: nls.localize(61, null),
                                    default: 0,
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    let schemaRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(schemaId, schema);
});
//# sourceMappingURL=languageConfigurationExtensionPoint.js.map