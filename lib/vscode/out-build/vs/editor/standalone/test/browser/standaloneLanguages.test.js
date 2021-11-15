/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/editor/common/core/token", "vs/editor/common/modes", "vs/editor/common/modes/supports/tokenization", "vs/editor/standalone/browser/standaloneLanguages", "vs/platform/theme/common/theme"], function (require, exports, assert, event_1, token_1, modes_1, tokenization_1, standaloneLanguages_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('TokenizationSupport2Adapter', () => {
        const languageIdentifier = new modes_1.LanguageIdentifier('tttt', 1 /* PlainText */);
        const tokenMetadata = (languageIdentifier.id << 0 /* LANGUAGEID_OFFSET */);
        class MockTokenTheme extends tokenization_1.TokenTheme {
            constructor() {
                super(null, null);
                this.counter = 0;
            }
            match(languageId, token) {
                return (((this.counter++) << 14 /* FOREGROUND_OFFSET */)
                    | (languageId << 0 /* LANGUAGEID_OFFSET */)) >>> 0;
            }
        }
        class MockThemeService {
            constructor() {
                this.onDidColorThemeChange = new event_1.Emitter().event;
                this.onDidFileIconThemeChange = new event_1.Emitter().event;
            }
            setTheme(themeName) {
                throw new Error('Not implemented');
            }
            setAutoDetectHighContrast(autoDetectHighContrast) {
                throw new Error('Not implemented');
            }
            defineTheme(themeName, themeData) {
                throw new Error('Not implemented');
            }
            getColorTheme() {
                return {
                    label: 'mock',
                    tokenTheme: new MockTokenTheme(),
                    themeName: theme_1.ColorScheme.LIGHT,
                    type: theme_1.ColorScheme.LIGHT,
                    getColor: (color, useDefault) => {
                        throw new Error('Not implemented');
                    },
                    defines: (color) => {
                        throw new Error('Not implemented');
                    },
                    getTokenStyleMetadata: (type, modifiers, modelLanguage) => {
                        return undefined;
                    },
                    semanticHighlighting: false,
                    tokenColorMap: []
                };
            }
            setColorMapOverride(colorMapOverride) {
            }
            getFileIconTheme() {
                return {
                    hasFileIcons: false,
                    hasFolderIcons: false,
                    hidesExplorerArrows: false
                };
            }
        }
        class MockState {
            constructor() { }
            clone() {
                return this;
            }
            equals(other) {
                return this === other;
            }
        }
        MockState.INSTANCE = new MockState();
        function testBadTokensProvider(providerTokens, offsetDelta, expectedClassicTokens, expectedModernTokens) {
            class BadTokensProvider {
                getInitialState() {
                    return MockState.INSTANCE;
                }
                tokenize(line, state) {
                    return {
                        tokens: providerTokens,
                        endState: MockState.INSTANCE
                    };
                }
            }
            const adapter = new standaloneLanguages_1.TokenizationSupport2Adapter(new MockThemeService(), languageIdentifier, new BadTokensProvider());
            const actualClassicTokens = adapter.tokenize('whatever', true, MockState.INSTANCE, offsetDelta);
            assert.deepStrictEqual(actualClassicTokens.tokens, expectedClassicTokens);
            const actualModernTokens = adapter.tokenize2('whatever', true, MockState.INSTANCE, offsetDelta);
            const modernTokens = [];
            for (let i = 0; i < actualModernTokens.tokens.length; i++) {
                modernTokens[i] = actualModernTokens.tokens[i];
            }
            assert.deepStrictEqual(modernTokens, expectedModernTokens);
        }
        test('tokens always start at index 0 (no offset delta)', () => {
            testBadTokensProvider([
                { startIndex: 7, scopes: 'foo' },
                { startIndex: 0, scopes: 'bar' }
            ], 0, [
                new token_1.Token(0, 'foo', languageIdentifier.language),
                new token_1.Token(0, 'bar', languageIdentifier.language),
            ], [
                0, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                0, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
        test('tokens always start after each other (no offset delta)', () => {
            testBadTokensProvider([
                { startIndex: 0, scopes: 'foo' },
                { startIndex: 5, scopes: 'bar' },
                { startIndex: 3, scopes: 'foo' },
            ], 0, [
                new token_1.Token(0, 'foo', languageIdentifier.language),
                new token_1.Token(5, 'bar', languageIdentifier.language),
                new token_1.Token(5, 'foo', languageIdentifier.language),
            ], [
                0, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                5, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */),
                5, tokenMetadata | (2 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
        test('tokens always start at index 0 (with offset delta)', () => {
            testBadTokensProvider([
                { startIndex: 7, scopes: 'foo' },
                { startIndex: 0, scopes: 'bar' }
            ], 7, [
                new token_1.Token(7, 'foo', languageIdentifier.language),
                new token_1.Token(7, 'bar', languageIdentifier.language),
            ], [
                7, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                7, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
        test('tokens always start after each other (with offset delta)', () => {
            testBadTokensProvider([
                { startIndex: 0, scopes: 'foo' },
                { startIndex: 5, scopes: 'bar' },
                { startIndex: 3, scopes: 'foo' },
            ], 7, [
                new token_1.Token(7, 'foo', languageIdentifier.language),
                new token_1.Token(12, 'bar', languageIdentifier.language),
                new token_1.Token(12, 'foo', languageIdentifier.language),
            ], [
                7, tokenMetadata | (0 << 14 /* FOREGROUND_OFFSET */),
                12, tokenMetadata | (1 << 14 /* FOREGROUND_OFFSET */),
                12, tokenMetadata | (2 << 14 /* FOREGROUND_OFFSET */)
            ]);
        });
    });
});
//# sourceMappingURL=standaloneLanguages.test.js.map