/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/services/editorSimpleWorker", "vs/base/test/common/mock", "vs/editor/common/services/editorWorkerServiceImpl", "vs/editor/test/common/editorTestUtils", "vs/base/common/uri", "vs/platform/log/common/log", "vs/editor/contrib/suggest/wordDistance", "vs/editor/test/browser/testCodeEditor", "vs/editor/common/model/wordHelper", "vs/base/common/event", "vs/editor/contrib/suggest/suggest", "vs/editor/common/modes", "vs/base/common/lifecycle", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/test/common/mocks/mockMode"], function (require, exports, assert, editorSimpleWorker_1, mock_1, editorWorkerServiceImpl_1, editorTestUtils_1, uri_1, log_1, wordDistance_1, testCodeEditor_1, wordHelper_1, event_1, suggest_1, modes, lifecycle_1, languageConfigurationRegistry_1, mockMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('suggest, word distance', function () {
        class BracketMode extends mockMode_1.MockMode {
            constructor() {
                super(BracketMode._id);
                this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                    brackets: [
                        ['{', '}'],
                        ['[', ']'],
                        ['(', ')'],
                    ]
                }));
            }
        }
        BracketMode._id = new modes.LanguageIdentifier('bracketMode', 3);
        let distance;
        let disposables = new lifecycle_1.DisposableStore();
        setup(async function () {
            disposables.clear();
            let mode = new BracketMode();
            let model = (0, editorTestUtils_1.createTextModel)('function abc(aa, ab){\na\n}', undefined, mode.getLanguageIdentifier(), uri_1.URI.parse('test:///some.path'));
            let editor = (0, testCodeEditor_1.createTestCodeEditor)({ model: model });
            editor.updateOptions({ suggest: { localityBonus: true } });
            editor.setPosition({ lineNumber: 2, column: 2 });
            let modelService = new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onModelRemoved = event_1.Event.None;
                }
                getModel(uri) {
                    return uri.toString() === model.uri.toString() ? model : null;
                }
            };
            let service = new class extends editorWorkerServiceImpl_1.EditorWorkerServiceImpl {
                constructor() {
                    super(modelService, new class extends (0, mock_1.mock)() {
                    }, new log_1.NullLogService());
                    this._worker = new editorSimpleWorker_1.EditorSimpleWorker(new class extends (0, mock_1.mock)() {
                    }, null);
                    this._worker.acceptNewModel({
                        url: model.uri.toString(),
                        lines: model.getLinesContent(),
                        EOL: model.getEOL(),
                        versionId: model.getVersionId()
                    });
                    model.onDidChangeContent(e => this._worker.acceptModelChanged(model.uri.toString(), e));
                }
                computeWordRanges(resource, range) {
                    return this._worker.computeWordRanges(resource.toString(), range, wordHelper_1.DEFAULT_WORD_REGEXP.source, wordHelper_1.DEFAULT_WORD_REGEXP.flags);
                }
            };
            distance = await wordDistance_1.WordDistance.create(service, editor);
            disposables.add(service);
            disposables.add(mode);
            disposables.add(model);
            disposables.add(editor);
        });
        teardown(function () {
            disposables.clear();
        });
        function createSuggestItem(label, overwriteBefore, position) {
            const suggestion = {
                label,
                range: { startLineNumber: position.lineNumber, startColumn: position.column - overwriteBefore, endLineNumber: position.lineNumber, endColumn: position.column },
                insertText: label,
                kind: 0
            };
            const container = {
                suggestions: [suggestion]
            };
            const provider = {
                provideCompletionItems() {
                    return;
                }
            };
            return new suggest_1.CompletionItem(position, suggestion, container, provider);
        }
        test('Suggest locality bonus can boost current word #90515', function () {
            const pos = { lineNumber: 2, column: 2 };
            const d1 = distance.distance(pos, createSuggestItem('a', 1, pos).completion);
            const d2 = distance.distance(pos, createSuggestItem('aa', 1, pos).completion);
            const d3 = distance.distance(pos, createSuggestItem('ab', 1, pos).completion);
            assert.ok(d1 > d2);
            assert.ok(d2 === d3);
        });
    });
});
//# sourceMappingURL=wordDistance.test.js.map