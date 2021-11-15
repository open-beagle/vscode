define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/modes", "vs/editor/contrib/suggest/suggest", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/test/common/editorTestUtils"], function (require, exports, assert, uri_1, modes_1, suggest_1, position_1, range_1, editorTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Suggest', function () {
        let model;
        let registration;
        setup(function () {
            model = (0, editorTestUtils_1.createTextModel)('FOO\nbar\BAR\nfoo', undefined, undefined, uri_1.URI.parse('foo:bar/path'));
            registration = modes_1.CompletionProviderRegistry.register({ pattern: 'bar/path', scheme: 'foo' }, {
                provideCompletionItems(_doc, pos) {
                    return {
                        incomplete: false,
                        suggestions: [{
                                label: 'aaa',
                                kind: 27 /* Snippet */,
                                insertText: 'aaa',
                                range: range_1.Range.fromPositions(pos)
                            }, {
                                label: 'zzz',
                                kind: 27 /* Snippet */,
                                insertText: 'zzz',
                                range: range_1.Range.fromPositions(pos)
                            }, {
                                label: 'fff',
                                kind: 9 /* Property */,
                                insertText: 'fff',
                                range: range_1.Range.fromPositions(pos)
                            }]
                    };
                }
            });
        });
        teardown(() => {
            registration.dispose();
            model.dispose();
        });
        test('sort - snippet inline', async function () {
            const { items } = await (0, suggest_1.provideSuggestionItems)(model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(1 /* Inline */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'aaa');
            assert.strictEqual(items[1].completion.label, 'fff');
            assert.strictEqual(items[2].completion.label, 'zzz');
        });
        test('sort - snippet top', async function () {
            const { items } = await (0, suggest_1.provideSuggestionItems)(model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(0 /* Top */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'aaa');
            assert.strictEqual(items[1].completion.label, 'zzz');
            assert.strictEqual(items[2].completion.label, 'fff');
        });
        test('sort - snippet bottom', async function () {
            const { items } = await (0, suggest_1.provideSuggestionItems)(model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(2 /* Bottom */));
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].completion.label, 'fff');
            assert.strictEqual(items[1].completion.label, 'aaa');
            assert.strictEqual(items[2].completion.label, 'zzz');
        });
        test('sort - snippet none', async function () {
            const { items } = await (0, suggest_1.provideSuggestionItems)(model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(undefined, new Set().add(27 /* Snippet */)));
            assert.strictEqual(items.length, 1);
            assert.strictEqual(items[0].completion.label, 'fff');
        });
        test('only from', function () {
            const foo = {
                triggerCharacters: [],
                provideCompletionItems() {
                    return {
                        currentWord: '',
                        incomplete: false,
                        suggestions: [{
                                label: 'jjj',
                                type: 'property',
                                insertText: 'jjj'
                            }]
                    };
                }
            };
            const registration = modes_1.CompletionProviderRegistry.register({ pattern: 'bar/path', scheme: 'foo' }, foo);
            (0, suggest_1.provideSuggestionItems)(model, new position_1.Position(1, 1), new suggest_1.CompletionOptions(undefined, undefined, new Set().add(foo))).then(({ items }) => {
                registration.dispose();
                assert.strictEqual(items.length, 1);
                assert.ok(items[0].provider === foo);
            });
        });
        test('Ctrl+space completions stopped working with the latest Insiders, #97650', async function () {
            const foo = new class {
                constructor() {
                    this.triggerCharacters = [];
                }
                provideCompletionItems() {
                    return {
                        suggestions: [{
                                label: 'one',
                                kind: 5 /* Class */,
                                insertText: 'one',
                                range: {
                                    insert: new range_1.Range(0, 0, 0, 0),
                                    replace: new range_1.Range(0, 0, 0, 10)
                                }
                            }, {
                                label: 'two',
                                kind: 5 /* Class */,
                                insertText: 'two',
                                range: {
                                    insert: new range_1.Range(0, 0, 0, 0),
                                    replace: new range_1.Range(0, 1, 0, 10)
                                }
                            }]
                    };
                }
            };
            const registration = modes_1.CompletionProviderRegistry.register({ pattern: 'bar/path', scheme: 'foo' }, foo);
            const { items } = await (0, suggest_1.provideSuggestionItems)(model, new position_1.Position(0, 0), new suggest_1.CompletionOptions(undefined, undefined, new Set().add(foo)));
            registration.dispose();
            assert.strictEqual(items.length, 2);
            const [a, b] = items;
            assert.strictEqual(a.completion.label, 'one');
            assert.strictEqual(a.isInvalid, false);
            assert.strictEqual(b.completion.label, 'two');
            assert.strictEqual(b.isInvalid, true);
        });
    });
});
//# sourceMappingURL=suggest.test.js.map