define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypes", "vs/editor/common/config/editorOptions", "vs/workbench/api/common/extHostTextEditor", "vs/workbench/api/common/extHostDocumentData", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/log/common/log", "vs/base/common/lazy"], function (require, exports, assert, extHostTypes_1, editorOptions_1, extHostTextEditor_1, extHostDocumentData_1, uri_1, mock_1, log_1, lazy_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTextEditor', () => {
        let editor;
        let doc = new extHostDocumentData_1.ExtHostDocumentData(undefined, uri_1.URI.file(''), [
            'aaaa bbbb+cccc abc'
        ], '\n', 1, 'text', false);
        setup(() => {
            editor = new extHostTextEditor_1.ExtHostTextEditor('fake', null, new log_1.NullLogService(), new lazy_1.Lazy(() => doc.document), [], { cursorStyle: 0, insertSpaces: true, lineNumbers: 1, tabSize: 4 }, [], 1);
        });
        test('disposed editor', () => {
            assert.ok(editor.value.document);
            editor._acceptViewColumn(3);
            assert.strictEqual(3, editor.value.viewColumn);
            editor.dispose();
            assert.throws(() => editor._acceptViewColumn(2));
            assert.strictEqual(3, editor.value.viewColumn);
            assert.ok(editor.value.document);
            assert.throws(() => editor._acceptOptions(null));
            assert.throws(() => editor._acceptSelections([]));
        });
        test('API [bug]: registerTextEditorCommand clears redo stack even if no edits are made #55163', async function () {
            let applyCount = 0;
            let editor = new extHostTextEditor_1.ExtHostTextEditor('edt1', new class extends (0, mock_1.mock)() {
                $tryApplyEdits() {
                    applyCount += 1;
                    return Promise.resolve(true);
                }
            }, new log_1.NullLogService(), new lazy_1.Lazy(() => doc.document), [], { cursorStyle: 0, insertSpaces: true, lineNumbers: 1, tabSize: 4 }, [], 1);
            await editor.value.edit(edit => { });
            assert.strictEqual(applyCount, 0);
            await editor.value.edit(edit => { edit.setEndOfLine(1); });
            assert.strictEqual(applyCount, 1);
            await editor.value.edit(edit => { edit.delete(new extHostTypes_1.Range(0, 0, 1, 1)); });
            assert.strictEqual(applyCount, 2);
        });
    });
    suite('ExtHostTextEditorOptions', () => {
        let opts;
        let calls = [];
        setup(() => {
            calls = [];
            let mockProxy = {
                dispose: undefined,
                $trySetOptions: (id, options) => {
                    assert.strictEqual(id, '1');
                    calls.push(options);
                    return Promise.resolve(undefined);
                },
                $tryShowTextDocument: undefined,
                $registerTextEditorDecorationType: undefined,
                $removeTextEditorDecorationType: undefined,
                $tryShowEditor: undefined,
                $tryHideEditor: undefined,
                $trySetDecorations: undefined,
                $trySetDecorationsFast: undefined,
                $tryRevealRange: undefined,
                $trySetSelections: undefined,
                $tryApplyEdits: undefined,
                $tryInsertSnippet: undefined,
                $getDiffInformation: undefined
            };
            opts = new extHostTextEditor_1.ExtHostTextEditorOptions(mockProxy, '1', {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            }, new log_1.NullLogService());
        });
        teardown(() => {
            opts = null;
            calls = null;
        });
        function assertState(opts, expected) {
            let actual = {
                tabSize: opts.value.tabSize,
                insertSpaces: opts.value.insertSpaces,
                cursorStyle: opts.value.cursorStyle,
                lineNumbers: opts.value.lineNumbers
            };
            assert.deepStrictEqual(actual, expected);
        }
        test('can set tabSize to the same value', () => {
            opts.value.tabSize = 4;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can change tabSize to positive integer', () => {
            opts.value.tabSize = 1;
            assertState(opts, {
                tabSize: 1,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 1 }]);
        });
        test('can change tabSize to positive float', () => {
            opts.value.tabSize = 2.3;
            assertState(opts, {
                tabSize: 2,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 2 }]);
        });
        test('can change tabSize to a string number', () => {
            opts.value.tabSize = '2';
            assertState(opts, {
                tabSize: 2,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 2 }]);
        });
        test('tabSize can request indentation detection', () => {
            opts.value.tabSize = 'auto';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 'auto' }]);
        });
        test('ignores invalid tabSize 1', () => {
            opts.value.tabSize = null;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid tabSize 2', () => {
            opts.value.tabSize = -5;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid tabSize 3', () => {
            opts.value.tabSize = 'hello';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('ignores invalid tabSize 4', () => {
            opts.value.tabSize = '-17';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can set insertSpaces to the same value', () => {
            opts.value.insertSpaces = false;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can set insertSpaces to boolean', () => {
            opts.value.insertSpaces = true;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ insertSpaces: true }]);
        });
        test('can set insertSpaces to false string', () => {
            opts.value.insertSpaces = 'false';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can set insertSpaces to truey', () => {
            opts.value.insertSpaces = 'hello';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ insertSpaces: true }]);
        });
        test('insertSpaces can request indentation detection', () => {
            opts.value.insertSpaces = 'auto';
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ insertSpaces: 'auto' }]);
        });
        test('can set cursorStyle to same value', () => {
            opts.value.cursorStyle = editorOptions_1.TextEditorCursorStyle.Line;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can change cursorStyle', () => {
            opts.value.cursorStyle = editorOptions_1.TextEditorCursorStyle.Block;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ cursorStyle: editorOptions_1.TextEditorCursorStyle.Block }]);
        });
        test('can set lineNumbers to same value', () => {
            opts.value.lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.On;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can change lineNumbers', () => {
            opts.value.lineNumbers = extHostTypes_1.TextEditorLineNumbersStyle.Off;
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 0 /* Off */
            });
            assert.deepStrictEqual(calls, [{ lineNumbers: 0 /* Off */ }]);
        });
        test('can do bulk updates 0', () => {
            opts.assign({
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.On
            });
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, []);
        });
        test('can do bulk updates 1', () => {
            opts.assign({
                tabSize: 'auto',
                insertSpaces: true
            });
            assertState(opts, {
                tabSize: 4,
                insertSpaces: true,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 'auto', insertSpaces: true }]);
        });
        test('can do bulk updates 2', () => {
            opts.assign({
                tabSize: 3,
                insertSpaces: 'auto'
            });
            assertState(opts, {
                tabSize: 3,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Line,
                lineNumbers: 1 /* On */
            });
            assert.deepStrictEqual(calls, [{ tabSize: 3, insertSpaces: 'auto' }]);
        });
        test('can do bulk updates 3', () => {
            opts.assign({
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: extHostTypes_1.TextEditorLineNumbersStyle.Relative
            });
            assertState(opts, {
                tabSize: 4,
                insertSpaces: false,
                cursorStyle: editorOptions_1.TextEditorCursorStyle.Block,
                lineNumbers: 2 /* Relative */
            });
            assert.deepStrictEqual(calls, [{ cursorStyle: editorOptions_1.TextEditorCursorStyle.Block, lineNumbers: 2 /* Relative */ }]);
        });
    });
});
//# sourceMappingURL=extHostTextEditor.test.js.map