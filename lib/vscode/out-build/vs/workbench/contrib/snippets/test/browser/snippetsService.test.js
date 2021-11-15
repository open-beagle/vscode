/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/snippets/browser/snippetCompletionProvider", "vs/editor/common/core/position", "vs/editor/common/modes/modesRegistry", "vs/editor/common/services/modeServiceImpl", "vs/editor/test/common/editorTestUtils", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/editor/common/modes/languageConfigurationRegistry", "vs/base/common/lifecycle"], function (require, exports, assert, snippetCompletionProvider_1, position_1, modesRegistry_1, modeServiceImpl_1, editorTestUtils_1, snippetsFile_1, languageConfigurationRegistry_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleSnippetService {
        constructor(snippets) {
            this.snippets = snippets;
        }
        getSnippets() {
            return Promise.resolve(this.getSnippetsSync());
        }
        getSnippetsSync() {
            return this.snippets;
        }
        getSnippetFiles() {
            throw new Error();
        }
        isEnabled() {
            throw new Error();
        }
        updateEnablement() {
            throw new Error();
        }
    }
    suite('SnippetsService', function () {
        const disposableStore = new lifecycle_1.DisposableStore();
        const context = { triggerKind: 0 /* Invoke */ };
        suiteSetup(function () {
            modesRegistry_1.ModesRegistry.registerLanguage({
                id: 'fooLang',
                extensions: ['.fooLang',]
            });
        });
        suiteTeardown(function () {
            disposableStore.dispose();
        });
        let modeService;
        let snippetService;
        setup(function () {
            modeService = new modeServiceImpl_1.ModeServiceImpl();
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'barTest', 'bar', '', 'barCodeSnippet', '', 1 /* User */), new snippetsFile_1.Snippet(['fooLang'], 'bazzTest', 'bazz', '', 'bazzCodeSnippet', '', 1 /* User */)]);
        });
        test('snippet completions - simple', function () {
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            const model = (0, editorTestUtils_1.createTextModel)('', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
            });
        });
        test('snippet completions - with prefix', function () {
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            const model = (0, editorTestUtils_1.createTextModel)('bar', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 4), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 1);
                assert.deepStrictEqual(result.suggestions[0].label, {
                    name: 'bar',
                    type: 'barTest'
                });
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 1);
                assert.strictEqual(result.suggestions[0].insertText, 'barCodeSnippet');
            });
        });
        test('snippet completions - with different prefixes', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'barTest', 'bar', '', 's1', '', 1 /* User */), new snippetsFile_1.Snippet(['fooLang'], 'name', 'bar-bar', '', 's2', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            const model = (0, editorTestUtils_1.createTextModel)('bar-bar', undefined, modeService.getLanguageIdentifier('fooLang'));
            await provider.provideCompletionItems(model, new position_1.Position(1, 3), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
                assert.deepStrictEqual(result.suggestions[0].label, {
                    name: 'bar',
                    type: 'barTest'
                });
                assert.strictEqual(result.suggestions[0].insertText, 's1');
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 1);
                assert.deepStrictEqual(result.suggestions[1].label, {
                    name: 'bar-bar',
                    type: 'name'
                });
                assert.strictEqual(result.suggestions[1].insertText, 's2');
                assert.strictEqual(result.suggestions[1].range.insert.startColumn, 1);
            });
            await provider.provideCompletionItems(model, new position_1.Position(1, 5), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 1);
                assert.deepStrictEqual(result.suggestions[0].label, {
                    name: 'bar-bar',
                    type: 'name'
                });
                assert.strictEqual(result.suggestions[0].insertText, 's2');
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 1);
            });
            await provider.provideCompletionItems(model, new position_1.Position(1, 6), context).then(result => {
                assert.strictEqual(result.incomplete, undefined);
                assert.strictEqual(result.suggestions.length, 2);
                assert.deepStrictEqual(result.suggestions[0].label, {
                    name: 'bar',
                    type: 'barTest'
                });
                assert.strictEqual(result.suggestions[0].insertText, 's1');
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 5);
                assert.deepStrictEqual(result.suggestions[1].label, {
                    name: 'bar-bar',
                    type: 'name'
                });
                assert.strictEqual(result.suggestions[1].insertText, 's2');
                assert.strictEqual(result.suggestions[1].range.insert.startColumn, 1);
            });
        });
        test('Cannot use "<?php" as user snippet prefix anymore, #26275', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], '', '<?php', '', 'insert me', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('\t<?php', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 7), context).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                model.dispose();
                model = (0, editorTestUtils_1.createTextModel)('\t<?', undefined, modeService.getLanguageIdentifier('fooLang'));
                return provider.provideCompletionItems(model, new position_1.Position(1, 4), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
                model.dispose();
                model = (0, editorTestUtils_1.createTextModel)('a<?', undefined, modeService.getLanguageIdentifier('fooLang'));
                return provider.provideCompletionItems(model, new position_1.Position(1, 4), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                assert.strictEqual(result.suggestions[0].range.insert.startColumn, 2);
                model.dispose();
            });
        });
        test('No user snippets in suggestions, when inside the code, #30508', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], '', 'foo', '', '<foo>$0</foo>', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('<head>\n\t\n>/head>', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1), context).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
                return provider.provideCompletionItems(model, new position_1.Position(2, 2), context);
            }).then(result => {
                assert.strictEqual(result.suggestions.length, 1);
            });
        });
        test('SnippetSuggest - ensure extension snippets come last ', function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'second', 'second', '', 'second', '', 3 /* Extension */), new snippetsFile_1.Snippet(['fooLang'], 'first', 'first', '', 'first', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('', undefined, modeService.getLanguageIdentifier('fooLang'));
            return provider.provideCompletionItems(model, new position_1.Position(1, 1), context).then(result => {
                assert.strictEqual(result.suggestions.length, 2);
                let [first, second] = result.suggestions;
                assert.deepStrictEqual(first.label, {
                    name: 'first',
                    type: 'first'
                });
                assert.deepStrictEqual(second.label, {
                    name: 'second',
                    type: 'second'
                });
            });
        });
        test('Dash in snippets prefix broken #53945', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'p-a', 'p-a', '', 'second', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('p-', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), context);
            assert.strictEqual(result.suggestions.length, 1);
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('No snippets suggestion on long lines beyond character 100 #58807', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 158), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('Type colon will trigger snippet #60746', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)(':', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), context);
            assert.strictEqual(result.suggestions.length, 0);
        });
        test('substring of prefix can\'t trigger snippet #60737', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'mytemplate', 'mytemplate', '', 'second', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('template', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 9), context);
            assert.strictEqual(result.suggestions.length, 1);
            assert.deepStrictEqual(result.suggestions[0].label, {
                name: 'mytemplate',
                type: 'mytemplate'
            });
        });
        test('No snippets suggestion beyond character 100 if not at end of line #60247', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea Thisisaverylonglinegoingwithmore100bcharactersandthismakesintellisensebecomea b text_after_b', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 158), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('issue #61296: VS code freezes when editing CSS file with emoji', async function () {
            disposableStore.add(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(modeService.getLanguageIdentifier('fooLang'), {
                wordPattern: /(#?-?\d*\.\d\w*%?)|(::?[\w-]*(?=[^,{;]*[,{]))|(([@#.!])?[\w-?]+%?|[@#!.])/g
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'bug', '-a-bug', '', 'second', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('.🐷-a-b', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 8), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('No snippets shown when triggering completions at whitespace on line that already has text #62335', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'bug', 'bug', '', 'second', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('a ', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
        });
        test('Snippet prefix with special chars and numbers does not work #62906', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'noblockwdelay', '<<', '', '<= #dly"', '', 1 /* User */), new snippetsFile_1.Snippet(['fooLang'], 'noblockwdelay', '11', '', 'eleven', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)(' <', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.startColumn, 2);
            model = (0, editorTestUtils_1.createTextModel)('1', undefined, modeService.getLanguageIdentifier('fooLang'));
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 2), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.startColumn, 1);
        });
        test('Snippet replace range', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'notWordTest', 'not word', '', 'not word snippet', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('not wordFoo bar', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 3);
            assert.strictEqual(first.range.replace.endColumn, 9);
            model = (0, editorTestUtils_1.createTextModel)('not woFoo bar', undefined, modeService.getLanguageIdentifier('fooLang'));
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 3), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 3);
            assert.strictEqual(first.range.replace.endColumn, 3);
            model = (0, editorTestUtils_1.createTextModel)('not word', undefined, modeService.getLanguageIdentifier('fooLang'));
            result = await provider.provideCompletionItems(model, new position_1.Position(1, 1), context);
            assert.strictEqual(result.suggestions.length, 1);
            [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 1);
            assert.strictEqual(first.range.replace.endColumn, 9);
        });
        test('Snippet replace-range incorrect #108894', async function () {
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'eng', 'eng', '', '<span></span>', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('filler e KEEP ng filler', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 9), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 9);
            assert.strictEqual(first.range.replace.endColumn, 9);
        });
        test('Snippet will replace auto-closing pair if specified in prefix', async function () {
            disposableStore.add(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(modeService.getLanguageIdentifier('fooLang'), {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                ]
            }));
            snippetService = new SimpleSnippetService([new snippetsFile_1.Snippet(['fooLang'], 'PSCustomObject', '[PSCustomObject]', '', '[PSCustomObject] @{ Key = Value }', '', 1 /* User */)]);
            const provider = new snippetCompletionProvider_1.SnippetCompletionProvider(modeService, snippetService);
            let model = (0, editorTestUtils_1.createTextModel)('[psc]', undefined, modeService.getLanguageIdentifier('fooLang'));
            let result = await provider.provideCompletionItems(model, new position_1.Position(1, 5), context);
            assert.strictEqual(result.suggestions.length, 1);
            let [first] = result.suggestions;
            assert.strictEqual(first.range.insert.endColumn, 5);
            // This is 6 because it should eat the `]` at the end of the text even if cursor is before it
            assert.strictEqual(first.range.replace.endColumn, 6);
        });
    });
});
//# sourceMappingURL=snippetsService.test.js.map