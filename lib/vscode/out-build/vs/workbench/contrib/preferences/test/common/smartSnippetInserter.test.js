/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/preferences/common/smartSnippetInserter", "vs/editor/test/common/editorTestUtils", "vs/editor/common/core/position"], function (require, exports, assert, smartSnippetInserter_1, editorTestUtils_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SmartSnippetInserter', () => {
        function testSmartSnippetInserter(text, runner) {
            let model = (0, editorTestUtils_1.createTextModel)(text.join('\n'));
            runner((desiredPos, pos, prepend, append) => {
                let actual = smartSnippetInserter_1.SmartSnippetInserter.insertSnippet(model, desiredPos);
                let expected = {
                    position: pos,
                    prepend,
                    append
                };
                assert.deepStrictEqual(actual, expected);
            });
            model.dispose();
        }
        test('empty text', () => {
            testSmartSnippetInserter([], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(1, 1), '\n[', ']');
            });
            testSmartSnippetInserter([
                ' '
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(1, 2), '\n[', ']');
                assert(new position_1.Position(1, 2), new position_1.Position(1, 2), '\n[', ']');
            });
            testSmartSnippetInserter([
                '// just some text'
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(1, 18), '\n[', ']');
                assert(new position_1.Position(1, 18), new position_1.Position(1, 18), '\n[', ']');
            });
            testSmartSnippetInserter([
                '// just some text',
                ''
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 1), '\n[', ']');
                assert(new position_1.Position(1, 18), new position_1.Position(2, 1), '\n[', ']');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 1), '\n[', ']');
            });
        });
        test('empty array 1', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[]'
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 3), new position_1.Position(2, 2), '', '');
            });
        });
        test('empty array 2', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                ']'
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', '');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', '');
            });
        });
        test('empty array 3', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '// just some text',
                ']'
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', '');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', '');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', '');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), '', '');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), '', '');
            });
        });
        test('one element array 1', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{}',
                ']'
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 3), new position_1.Position(3, 3), ',', '');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), ',', '');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), ',', '');
            });
        });
        test('two elements array 1', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{},',
                '{}',
                ']'
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 3), new position_1.Position(3, 3), ',', '');
                assert(new position_1.Position(3, 4), new position_1.Position(3, 4), '', ',');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), '', ',');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), '', ',');
                assert(new position_1.Position(4, 3), new position_1.Position(4, 3), ',', '');
                assert(new position_1.Position(5, 1), new position_1.Position(5, 1), ',', '');
                assert(new position_1.Position(5, 2), new position_1.Position(5, 1), ',', '');
            });
        });
        test('two elements array 2', () => {
            testSmartSnippetInserter([
                '// just some text',
                '[',
                '{},{}',
                ']'
            ], (assert) => {
                assert(new position_1.Position(1, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 1), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(2, 2), new position_1.Position(2, 2), '', ',');
                assert(new position_1.Position(3, 1), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 2), new position_1.Position(3, 1), '', ',');
                assert(new position_1.Position(3, 3), new position_1.Position(3, 3), ',', '');
                assert(new position_1.Position(3, 4), new position_1.Position(3, 4), '', ',');
                assert(new position_1.Position(3, 5), new position_1.Position(3, 4), '', ',');
                assert(new position_1.Position(3, 6), new position_1.Position(3, 6), ',', '');
                assert(new position_1.Position(4, 1), new position_1.Position(4, 1), ',', '');
                assert(new position_1.Position(4, 2), new position_1.Position(4, 1), ',', '');
            });
        });
    });
});
//# sourceMappingURL=smartSnippetInserter.test.js.map