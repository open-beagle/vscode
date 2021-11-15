/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/services/modeServiceImpl", "vs/editor/standalone/common/monarch/monarchLexer", "vs/editor/standalone/common/monarch/monarchCompile", "vs/editor/common/core/token", "vs/editor/common/modes", "vs/editor/common/modes/modesRegistry"], function (require, exports, assert, modeServiceImpl_1, monarchLexer_1, monarchCompile_1, token_1, modes_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Monarch', () => {
        function createMonarchTokenizer(modeService, languageId, language) {
            return new monarchLexer_1.MonarchTokenizer(modeService, null, languageId, (0, monarchCompile_1.compile)(languageId, language));
        }
        function getTokens(tokenizer, lines) {
            const actualTokens = [];
            let state = tokenizer.getInitialState();
            for (const line of lines) {
                const result = tokenizer.tokenize(line, true, state, 0);
                actualTokens.push(result.tokens);
                state = result.endState;
            }
            return actualTokens;
        }
        test('Ensure @rematch and nextEmbedded can be used together in Monarch grammar', () => {
            const modeService = new modeServiceImpl_1.ModeServiceImpl();
            const innerModeRegistration = modesRegistry_1.ModesRegistry.registerLanguage({
                id: 'sql'
            });
            const innerModeTokenizationRegistration = modes_1.TokenizationRegistry.register('sql', createMonarchTokenizer(modeService, 'sql', {
                tokenizer: {
                    root: [
                        [/./, 'token']
                    ]
                }
            }));
            const SQL_QUERY_START = '(SELECT|INSERT|UPDATE|DELETE|CREATE|REPLACE|ALTER|WITH)';
            const tokenizer = createMonarchTokenizer(modeService, 'test1', {
                tokenizer: {
                    root: [
                        [`(\"\"\")${SQL_QUERY_START}`, [{ 'token': 'string.quote', }, { token: '@rematch', next: '@endStringWithSQL', nextEmbedded: 'sql', },]],
                        [/(""")$/, [{ token: 'string.quote', next: '@maybeStringIsSQL', },]],
                    ],
                    maybeStringIsSQL: [
                        [/(.*)/, {
                                cases: {
                                    [`${SQL_QUERY_START}\\b.*`]: { token: '@rematch', next: '@endStringWithSQL', nextEmbedded: 'sql', },
                                    '@default': { token: '@rematch', switchTo: '@endDblDocString', },
                                }
                            }],
                    ],
                    endDblDocString: [
                        ['[^\']+', 'string'],
                        ['\\\\\'', 'string'],
                        ['\'\'\'', 'string', '@popall'],
                        ['\'', 'string']
                    ],
                    endStringWithSQL: [[/"""/, { token: 'string.quote', next: '@popall', nextEmbedded: '@pop', },]],
                }
            });
            const lines = [
                `mysql_query("""SELECT * FROM table_name WHERE ds = '<DATEID>'""")`,
                `mysql_query("""`,
                `SELECT *`,
                `FROM table_name`,
                `WHERE ds = '<DATEID>'`,
                `""")`,
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [
                    new token_1.Token(0, 'source.test1', 'test1'),
                    new token_1.Token(12, 'string.quote.test1', 'test1'),
                    new token_1.Token(15, 'token.sql', 'sql'),
                    new token_1.Token(61, 'string.quote.test1', 'test1'),
                    new token_1.Token(64, 'source.test1', 'test1')
                ],
                [
                    new token_1.Token(0, 'source.test1', 'test1'),
                    new token_1.Token(12, 'string.quote.test1', 'test1')
                ],
                [
                    new token_1.Token(0, 'token.sql', 'sql')
                ],
                [
                    new token_1.Token(0, 'token.sql', 'sql')
                ],
                [
                    new token_1.Token(0, 'token.sql', 'sql')
                ],
                [
                    new token_1.Token(0, 'string.quote.test1', 'test1'),
                    new token_1.Token(3, 'source.test1', 'test1')
                ]
            ]);
            innerModeTokenizationRegistration.dispose();
            innerModeRegistration.dispose();
        });
        test('microsoft/monaco-editor#1235: Empty Line Handling', () => {
            const modeService = new modeServiceImpl_1.ModeServiceImpl();
            const tokenizer = createMonarchTokenizer(modeService, 'test', {
                tokenizer: {
                    root: [
                        { include: '@comments' },
                    ],
                    comments: [
                        [/\/\/$/, 'comment'],
                        [/\/\//, 'comment', '@comment_cpp'],
                    ],
                    comment_cpp: [
                        [/(?:[^\\]|(?:\\.))+$/, 'comment', '@pop'],
                        [/.+$/, 'comment'],
                        [/$/, 'comment', '@pop']
                        // No possible rule to detect an empty line and @pop?
                    ],
                },
            });
            const lines = [
                `// This comment \\`,
                `   continues on the following line`,
                ``,
                `// This comment does NOT continue \\\\`,
                `   because the escape char was itself escaped`,
                ``,
                `// This comment DOES continue because \\\\\\`,
                `   the 1st '\\' escapes the 2nd; the 3rd escapes EOL`,
                ``,
                `// This comment continues to the following line \\`,
                ``,
                `But the line was empty. This line should not be commented.`,
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [new token_1.Token(0, 'comment.test', 'test')],
                [new token_1.Token(0, 'comment.test', 'test')],
                [],
                [new token_1.Token(0, 'comment.test', 'test')],
                [new token_1.Token(0, 'source.test', 'test')],
                [],
                [new token_1.Token(0, 'comment.test', 'test')],
                [new token_1.Token(0, 'comment.test', 'test')],
                [],
                [new token_1.Token(0, 'comment.test', 'test')],
                [],
                [new token_1.Token(0, 'source.test', 'test')]
            ]);
        });
        test('microsoft/monaco-editor#2265: Exit a state at end of line', () => {
            const modeService = new modeServiceImpl_1.ModeServiceImpl();
            const tokenizer = createMonarchTokenizer(modeService, 'test', {
                includeLF: true,
                tokenizer: {
                    root: [
                        [/^\*/, '', '@inner'],
                        [/\:\*/, '', '@inner'],
                        [/[^*:]+/, 'string'],
                        [/[*:]/, 'string']
                    ],
                    inner: [
                        [/\n/, '', '@pop'],
                        [/\d+/, 'number'],
                        [/[^\d]+/, '']
                    ]
                }
            });
            const lines = [
                `PRINT 10 * 20`,
                `*FX200, 3`,
                `PRINT 2*3:*FX200, 3`
            ];
            const actualTokens = getTokens(tokenizer, lines);
            assert.deepStrictEqual(actualTokens, [
                [
                    new token_1.Token(0, 'string.test', 'test'),
                ],
                [
                    new token_1.Token(0, '', 'test'),
                    new token_1.Token(3, 'number.test', 'test'),
                    new token_1.Token(6, '', 'test'),
                    new token_1.Token(8, 'number.test', 'test'),
                ],
                [
                    new token_1.Token(0, 'string.test', 'test'),
                    new token_1.Token(9, '', 'test'),
                    new token_1.Token(13, 'number.test', 'test'),
                    new token_1.Token(16, '', 'test'),
                    new token_1.Token(18, 'number.test', 'test'),
                ]
            ]);
        });
        test('issue #115662: monarchCompile function need an extra option which can control replacement', () => {
            const modeService = new modeServiceImpl_1.ModeServiceImpl();
            const tokenizer1 = createMonarchTokenizer(modeService, 'test', {
                ignoreCase: false,
                uselessReplaceKey1: '@uselessReplaceKey2',
                uselessReplaceKey2: '@uselessReplaceKey3',
                uselessReplaceKey3: '@uselessReplaceKey4',
                uselessReplaceKey4: '@uselessReplaceKey5',
                uselessReplaceKey5: '@ham' || '',
                tokenizer: {
                    root: [
                        {
                            regex: /@\w+/.test('@ham')
                                ? new RegExp(`^${'@uselessReplaceKey1'}$`)
                                : new RegExp(`^${'@ham'}$`),
                            action: { token: 'ham' }
                        },
                    ],
                },
            });
            const tokenizer2 = createMonarchTokenizer(modeService, 'test', {
                ignoreCase: false,
                tokenizer: {
                    root: [
                        {
                            regex: /@@ham/,
                            action: { token: 'ham' }
                        },
                    ],
                },
            });
            const lines = [
                `@ham`
            ];
            const actualTokens1 = getTokens(tokenizer1, lines);
            assert.deepStrictEqual(actualTokens1, [
                [
                    new token_1.Token(0, 'ham.test', 'test'),
                ]
            ]);
            const actualTokens2 = getTokens(tokenizer2, lines);
            assert.deepStrictEqual(actualTokens2, [
                [
                    new token_1.Token(0, 'ham.test', 'test'),
                ]
            ]);
        });
    });
});
//# sourceMappingURL=monarch.test.js.map