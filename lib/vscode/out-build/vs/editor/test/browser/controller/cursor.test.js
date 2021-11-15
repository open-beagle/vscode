/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/browser/controller/coreCommands", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/core/token", "vs/editor/common/model/textModel", "vs/editor/common/modes", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/modes/languageConfigurationRegistry", "vs/editor/common/modes/nullMode", "vs/editor/test/browser/testCodeEditor", "vs/editor/test/common/editorTestUtils", "vs/editor/test/common/mocks/mockMode", "vs/editor/test/common/modes/supports/javascriptOnEnterRules"], function (require, exports, assert, coreCommands_1, editOperation_1, position_1, range_1, selection_1, token_1, textModel_1, modes_1, languageConfiguration_1, languageConfigurationRegistry_1, nullMode_1, testCodeEditor_1, editorTestUtils_1, mockMode_1, javascriptOnEnterRules_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // --------- utils
    function moveTo(editor, viewModel, lineNumber, column, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.MoveToSelect.runCoreEditorCommand(viewModel, {
                position: new position_1.Position(lineNumber, column)
            });
        }
        else {
            coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, {
                position: new position_1.Position(lineNumber, column)
            });
        }
    }
    function moveLeft(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorLeftSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorLeft.runCoreEditorCommand(viewModel, {});
        }
    }
    function moveRight(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorRightSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorRight.runCoreEditorCommand(viewModel, {});
        }
    }
    function moveDown(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorDownSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorDown.runCoreEditorCommand(viewModel, {});
        }
    }
    function moveUp(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorUpSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorUp.runCoreEditorCommand(viewModel, {});
        }
    }
    function moveToBeginningOfLine(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorHomeSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorHome.runCoreEditorCommand(viewModel, {});
        }
    }
    function moveToEndOfLine(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorEndSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorEnd.runCoreEditorCommand(viewModel, {});
        }
    }
    function moveToBeginningOfBuffer(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorTopSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorTop.runCoreEditorCommand(viewModel, {});
        }
    }
    function moveToEndOfBuffer(editor, viewModel, inSelectionMode = false) {
        if (inSelectionMode) {
            coreCommands_1.CoreNavigationCommands.CursorBottomSelect.runCoreEditorCommand(viewModel, {});
        }
        else {
            coreCommands_1.CoreNavigationCommands.CursorBottom.runCoreEditorCommand(viewModel, {});
        }
    }
    function assertCursor(viewModel, what) {
        let selections;
        if (what instanceof position_1.Position) {
            selections = [new selection_1.Selection(what.lineNumber, what.column, what.lineNumber, what.column)];
        }
        else if (what instanceof selection_1.Selection) {
            selections = [what];
        }
        else {
            selections = what;
        }
        let actual = viewModel.getSelections().map(s => s.toString());
        let expected = selections.map(s => s.toString());
        assert.deepStrictEqual(actual, expected);
    }
    suite('Editor Controller - Cursor', () => {
        const LINE1 = '    \tMy First Line\t ';
        const LINE2 = '\tMy Second Line';
        const LINE3 = '    Third Line🐶';
        const LINE4 = '';
        const LINE5 = '1';
        const TEXT = LINE1 + '\r\n' +
            LINE2 + '\n' +
            LINE3 + '\n' +
            LINE4 + '\r\n' +
            LINE5;
        // let thisModel: TextModel;
        // let thisConfiguration: TestConfiguration;
        // let thisViewModel: ViewModel;
        // let cursor: Cursor;
        // setup(() => {
        // 	let text =
        // 		LINE1 + '\r\n' +
        // 		LINE2 + '\n' +
        // 		LINE3 + '\n' +
        // 		LINE4 + '\r\n' +
        // 		LINE5;
        // 	thisModel = createTextModel(text);
        // 	thisConfiguration = new TestConfiguration({});
        // 	thisViewModel = createViewModel(thisConfiguration, thisModel);
        // 	cursor = new Cursor(thisConfiguration, thisModel, thisViewModel);
        // });
        // teardown(() => {
        // 	cursor.dispose();
        // 	thisViewModel.dispose();
        // 	thisModel.dispose();
        // 	thisConfiguration.dispose();
        // });
        function runTest(callback) {
            (0, testCodeEditor_1.withTestCodeEditor)(TEXT, {}, (editor, viewModel) => {
                callback(editor, viewModel);
            });
        }
        test('cursor initialized', () => {
            runTest((editor, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        // --------- absolute move
        test('no move', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 1);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 2);
                assertCursor(viewModel, new position_1.Position(1, 2));
            });
        });
        test('move in selection mode', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 2, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 1, 2));
            });
        });
        test('move beyond line end', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 25);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
            });
        });
        test('move empty line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 4, 20);
                assertCursor(viewModel, new position_1.Position(4, 1));
            });
        });
        test('move one char line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 5, 20);
                assertCursor(viewModel, new position_1.Position(5, 2));
            });
        });
        test('selection down', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 2, 1, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
            });
        });
        test('move and then select', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 2, 3);
                assertCursor(viewModel, new position_1.Position(2, 3));
                moveTo(editor, viewModel, 2, 15, true);
                assertCursor(viewModel, new selection_1.Selection(2, 3, 2, 15));
                moveTo(editor, viewModel, 1, 2, true);
                assertCursor(viewModel, new selection_1.Selection(2, 3, 1, 2));
            });
        });
        // --------- move left
        test('move left on top left position', () => {
            runTest((editor, viewModel) => {
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move left', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 3);
                assertCursor(viewModel, new position_1.Position(1, 3));
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 2));
            });
        });
        test('move left with surrogate pair', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 17);
                assertCursor(viewModel, new position_1.Position(3, 17));
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 15));
            });
        });
        test('move left goes to previous row', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 2, 1);
                assertCursor(viewModel, new position_1.Position(2, 1));
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 21));
            });
        });
        test('move left selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 2, 1);
                assertCursor(viewModel, new position_1.Position(2, 1));
                moveLeft(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(2, 1, 1, 21));
            });
        });
        // --------- move right
        test('move right on bottom right position', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 5, 2);
                assertCursor(viewModel, new position_1.Position(5, 2));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, 2));
            });
        });
        test('move right', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 3);
                assertCursor(viewModel, new position_1.Position(1, 3));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 4));
            });
        });
        test('move right with surrogate pair', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 15);
                assertCursor(viewModel, new position_1.Position(3, 15));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 17));
            });
        });
        test('move right goes to next row', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 21);
                assertCursor(viewModel, new position_1.Position(1, 21));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 1));
            });
        });
        test('move right selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 21);
                assertCursor(viewModel, new position_1.Position(1, 21));
                moveRight(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 21, 2, 1));
            });
        });
        // --------- move down
        test('move down', () => {
            runTest((editor, viewModel) => {
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(4, 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, 2));
            });
        });
        test('move down with selection', () => {
            runTest((editor, viewModel) => {
                moveDown(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                moveDown(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 3, 1));
                moveDown(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 4, 1));
                moveDown(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 5, 1));
                moveDown(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 5, 2));
            });
        });
        test('move down with tabs', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 5);
                assertCursor(viewModel, new position_1.Position(1, 5));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 2));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 5));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(4, 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, 2));
            });
        });
        // --------- move up
        test('move up', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 5);
                assertCursor(viewModel, new position_1.Position(3, 5));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 2));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 5));
            });
        });
        test('move up with selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 5);
                assertCursor(viewModel, new position_1.Position(3, 5));
                moveUp(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(3, 5, 2, 2));
                moveUp(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(3, 5, 1, 5));
            });
        });
        test('move up and down with tabs', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 5);
                assertCursor(viewModel, new position_1.Position(1, 5));
                moveDown(editor, viewModel);
                moveDown(editor, viewModel);
                moveDown(editor, viewModel);
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, 2));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(4, 1));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 5));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 2));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 5));
            });
        });
        test('move up and down with end of lines starting from a long one', () => {
            runTest((editor, viewModel) => {
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, LINE2.length + 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, LINE3.length + 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(4, LINE4.length + 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, LINE5.length + 1));
                moveUp(editor, viewModel);
                moveUp(editor, viewModel);
                moveUp(editor, viewModel);
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
            });
        });
        test('issue #44465: cursor position not correct when move', () => {
            runTest((editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 5, 1, 5)]);
                // going once up on the first line remembers the offset visual columns
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 2));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 5));
                // going twice up on the first line discards the offset visual columns
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 1));
            });
        });
        // --------- move to beginning of line
        test('move to beginning of line', () => {
            runTest((editor, viewModel) => {
                moveToBeginningOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 6));
                moveToBeginningOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move to beginning of line from within line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 8);
                moveToBeginningOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 6));
                moveToBeginningOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move to beginning of line from whitespace at beginning of line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 2);
                moveToBeginningOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 6));
                moveToBeginningOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move to beginning of line from within line selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 8);
                moveToBeginningOfLine(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 6));
                moveToBeginningOfLine(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 1));
            });
        });
        test('move to beginning of line with selection multiline forward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 8);
                moveTo(editor, viewModel, 3, 9, true);
                moveToBeginningOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 5, 3, 5));
            });
        });
        test('move to beginning of line with selection multiline backward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 9);
                moveTo(editor, viewModel, 1, 8, true);
                moveToBeginningOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(1, 6, 1, 6));
            });
        });
        test('move to beginning of line with selection single line forward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 2);
                moveTo(editor, viewModel, 3, 9, true);
                moveToBeginningOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 5, 3, 5));
            });
        });
        test('move to beginning of line with selection single line backward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 9);
                moveTo(editor, viewModel, 3, 2, true);
                moveToBeginningOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 5, 3, 5));
            });
        });
        test('issue #15401: "End" key is behaving weird when text is selected part 1', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 8);
                moveTo(editor, viewModel, 3, 9, true);
                moveToBeginningOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 5, 3, 5));
            });
        });
        test('issue #17011: Shift+home/end now go to the end of the selection start\'s line, not the selection\'s end', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 8);
                moveTo(editor, viewModel, 3, 9, true);
                moveToBeginningOfLine(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 8, 3, 5));
            });
        });
        // --------- move to end of line
        test('move to end of line', () => {
            runTest((editor, viewModel) => {
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
            });
        });
        test('move to end of line from within line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 6);
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
            });
        });
        test('move to end of line from whitespace at end of line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 20);
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
                moveToEndOfLine(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, LINE1.length + 1));
            });
        });
        test('move to end of line from within line selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 6);
                moveToEndOfLine(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 6, 1, LINE1.length + 1));
                moveToEndOfLine(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 6, 1, LINE1.length + 1));
            });
        });
        test('move to end of line with selection multiline forward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 1);
                moveTo(editor, viewModel, 3, 9, true);
                moveToEndOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 17, 3, 17));
            });
        });
        test('move to end of line with selection multiline backward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 9);
                moveTo(editor, viewModel, 1, 1, true);
                moveToEndOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(1, 21, 1, 21));
            });
        });
        test('move to end of line with selection single line forward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 1);
                moveTo(editor, viewModel, 3, 9, true);
                moveToEndOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 17, 3, 17));
            });
        });
        test('move to end of line with selection single line backward', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 9);
                moveTo(editor, viewModel, 3, 1, true);
                moveToEndOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 17, 3, 17));
            });
        });
        test('issue #15401: "End" key is behaving weird when text is selected part 2', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 1);
                moveTo(editor, viewModel, 3, 9, true);
                moveToEndOfLine(editor, viewModel, false);
                assertCursor(viewModel, new selection_1.Selection(3, 17, 3, 17));
            });
        });
        // --------- move to beginning of buffer
        test('move to beginning of buffer', () => {
            runTest((editor, viewModel) => {
                moveToBeginningOfBuffer(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move to beginning of buffer from within first line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 3);
                moveToBeginningOfBuffer(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move to beginning of buffer from within another line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 3);
                moveToBeginningOfBuffer(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('move to beginning of buffer from within first line selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 1, 3);
                moveToBeginningOfBuffer(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(1, 3, 1, 1));
            });
        });
        test('move to beginning of buffer from within another line selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 3);
                moveToBeginningOfBuffer(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(3, 3, 1, 1));
            });
        });
        // --------- move to end of buffer
        test('move to end of buffer', () => {
            runTest((editor, viewModel) => {
                moveToEndOfBuffer(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, LINE5.length + 1));
            });
        });
        test('move to end of buffer from within last line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 5, 1);
                moveToEndOfBuffer(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, LINE5.length + 1));
            });
        });
        test('move to end of buffer from within another line', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 3);
                moveToEndOfBuffer(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(5, LINE5.length + 1));
            });
        });
        test('move to end of buffer from within last line selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 5, 1);
                moveToEndOfBuffer(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(5, 1, 5, LINE5.length + 1));
            });
        });
        test('move to end of buffer from within another line selection', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 3, 3);
                moveToEndOfBuffer(editor, viewModel, true);
                assertCursor(viewModel, new selection_1.Selection(3, 3, 5, LINE5.length + 1));
            });
        });
        // --------- misc
        test('select all', () => {
            runTest((editor, viewModel) => {
                coreCommands_1.CoreNavigationCommands.SelectAll.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 5, LINE5.length + 1));
            });
        });
        test('expandLineSelection', () => {
            runTest((editor, viewModel) => {
                //              0          1         2
                //              01234 56789012345678 0
                // let LINE1 = '    \tMy First Line\t ';
                moveTo(editor, viewModel, 1, 1);
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                moveTo(editor, viewModel, 1, 2);
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                moveTo(editor, viewModel, 1, 5);
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                moveTo(editor, viewModel, 1, 19);
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                moveTo(editor, viewModel, 1, 20);
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                moveTo(editor, viewModel, 1, 21);
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 3, 1));
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 4, 1));
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 5, 1));
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 5, LINE5.length + 1));
                coreCommands_1.CoreNavigationCommands.ExpandLineSelection.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, new selection_1.Selection(1, 1, 5, LINE5.length + 1));
            });
        });
        // --------- eventing
        test('no move doesn\'t trigger event', () => {
            runTest((editor, viewModel) => {
                viewModel.onEvent((e) => {
                    assert.ok(false, 'was not expecting event');
                });
                moveTo(editor, viewModel, 1, 1);
            });
        });
        test('move eventing', () => {
            runTest((editor, viewModel) => {
                let events = 0;
                viewModel.onEvent((e) => {
                    if (e.kind === 5 /* CursorStateChanged */) {
                        events++;
                        assert.deepStrictEqual(e.selections, [new selection_1.Selection(1, 2, 1, 2)]);
                    }
                });
                moveTo(editor, viewModel, 1, 2);
                assert.strictEqual(events, 1, 'receives 1 event');
            });
        });
        test('move in selection mode eventing', () => {
            runTest((editor, viewModel) => {
                let events = 0;
                viewModel.onEvent((e) => {
                    if (e.kind === 5 /* CursorStateChanged */) {
                        events++;
                        assert.deepStrictEqual(e.selections, [new selection_1.Selection(1, 1, 1, 2)]);
                    }
                });
                moveTo(editor, viewModel, 1, 2, true);
                assert.strictEqual(events, 1, 'receives 1 event');
            });
        });
        // --------- state save & restore
        test('saveState & restoreState', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 2, 1, true);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
                let savedState = JSON.stringify(viewModel.saveCursorState());
                moveTo(editor, viewModel, 1, 1, false);
                assertCursor(viewModel, new position_1.Position(1, 1));
                viewModel.restoreCursorState(JSON.parse(savedState));
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 1));
            });
        });
        // --------- updating cursor
        test('Independent model edit 1', () => {
            runTest((editor, viewModel) => {
                moveTo(editor, viewModel, 2, 16, true);
                editor.getModel().applyEdits([editOperation_1.EditOperation.delete(new range_1.Range(2, 1, 2, 2))]);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 2, 15));
            });
        });
        test('column select 1', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                '\tprivate compute(a:number): boolean {',
                '\t\tif (a + 3 === 0 || a + 5 === 0) {',
                '\t\t\treturn false;',
                '\t\t}',
                '\t}'
            ], {}, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 7, false);
                assertCursor(viewModel, new position_1.Position(1, 7));
                coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
                    position: new position_1.Position(4, 4),
                    viewPosition: new position_1.Position(4, 4),
                    mouseColumn: 15,
                    doColumnSelect: true
                });
                let expectedSelections = [
                    new selection_1.Selection(1, 7, 1, 12),
                    new selection_1.Selection(2, 4, 2, 9),
                    new selection_1.Selection(3, 3, 3, 6),
                    new selection_1.Selection(4, 4, 4, 4),
                ];
                assertCursor(viewModel, expectedSelections);
            });
        });
        test('grapheme breaking', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'abcabc',
                'ãããããã',
                '辻󠄀辻󠄀辻󠄀',
                'பு',
            ], {}, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(2, 1, 2, 1)]);
                moveRight(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 3));
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 1));
                viewModel.setSelections('test', [new selection_1.Selection(3, 1, 3, 1)]);
                moveRight(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 4));
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 1));
                viewModel.setSelections('test', [new selection_1.Selection(4, 1, 4, 1)]);
                moveRight(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(4, 3));
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(4, 1));
                viewModel.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 5));
                moveDown(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(3, 4));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(2, 5));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new position_1.Position(1, 3));
            });
        });
        test('issue #4905 - column select is biased to the right', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'var gulp = require("gulp");',
                'var path = require("path");',
                'var rimraf = require("rimraf");',
                'var isarray = require("isarray");',
                'var merge = require("merge-stream");',
                'var concat = require("gulp-concat");',
                'var newer = require("gulp-newer");',
            ].join('\n'), {}, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 4, false);
                assertCursor(viewModel, new position_1.Position(1, 4));
                coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
                    position: new position_1.Position(4, 1),
                    viewPosition: new position_1.Position(4, 1),
                    mouseColumn: 1,
                    doColumnSelect: true
                });
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 1),
                    new selection_1.Selection(2, 4, 2, 1),
                    new selection_1.Selection(3, 4, 3, 1),
                    new selection_1.Selection(4, 4, 4, 1),
                ]);
            });
        });
        test('issue #20087: column select with mouse', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" Key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SoMEKEy" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" valuE="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="00X"/>',
            ].join('\n'), {}, (editor, viewModel) => {
                moveTo(editor, viewModel, 10, 10, false);
                assertCursor(viewModel, new position_1.Position(10, 10));
                coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
                    position: new position_1.Position(1, 1),
                    viewPosition: new position_1.Position(1, 1),
                    mouseColumn: 1,
                    doColumnSelect: true
                });
                assertCursor(viewModel, [
                    new selection_1.Selection(10, 10, 10, 1),
                    new selection_1.Selection(9, 10, 9, 1),
                    new selection_1.Selection(8, 10, 8, 1),
                    new selection_1.Selection(7, 10, 7, 1),
                    new selection_1.Selection(6, 10, 6, 1),
                    new selection_1.Selection(5, 10, 5, 1),
                    new selection_1.Selection(4, 10, 4, 1),
                    new selection_1.Selection(3, 10, 3, 1),
                    new selection_1.Selection(2, 10, 2, 1),
                    new selection_1.Selection(1, 10, 1, 1),
                ]);
                coreCommands_1.CoreNavigationCommands.ColumnSelect.runCoreEditorCommand(viewModel, {
                    position: new position_1.Position(1, 1),
                    viewPosition: new position_1.Position(1, 1),
                    mouseColumn: 1,
                    doColumnSelect: true
                });
                assertCursor(viewModel, [
                    new selection_1.Selection(10, 10, 10, 1),
                    new selection_1.Selection(9, 10, 9, 1),
                    new selection_1.Selection(8, 10, 8, 1),
                    new selection_1.Selection(7, 10, 7, 1),
                    new selection_1.Selection(6, 10, 6, 1),
                    new selection_1.Selection(5, 10, 5, 1),
                    new selection_1.Selection(4, 10, 4, 1),
                    new selection_1.Selection(3, 10, 3, 1),
                    new selection_1.Selection(2, 10, 2, 1),
                    new selection_1.Selection(1, 10, 1, 1),
                ]);
            });
        });
        test('issue #20087: column select with keyboard', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" Key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SoMEKEy" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" valuE="000"/>',
                '<property id="SomeThing" key="SomeKey" value="000"/>',
                '<property id="SomeThing" key="SomeKey" value="00X"/>',
            ].join('\n'), {}, (editor, viewModel) => {
                moveTo(editor, viewModel, 10, 10, false);
                assertCursor(viewModel, new position_1.Position(10, 10));
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(10, 10, 10, 9)
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(10, 10, 10, 8)
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(10, 10, 10, 9)
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectUp.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(10, 10, 10, 9),
                    new selection_1.Selection(9, 10, 9, 9),
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(10, 10, 10, 9)
                ]);
            });
        });
        test('issue #118062: Column selection cannot select first position of a line', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'hello world',
            ].join('\n'), {}, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 2, false);
                assertCursor(viewModel, new position_1.Position(1, 2));
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 2, 1, 1)
                ]);
            });
        });
        test('column select with keyboard', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'var gulp = require("gulp");',
                'var path = require("path");',
                'var rimraf = require("rimraf");',
                'var isarray = require("isarray");',
                'var merge = require("merge-stream");',
                'var concat = require("gulp-concat");',
                'var newer = require("gulp-newer");',
            ].join('\n'), {}, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 4, false);
                assertCursor(viewModel, new position_1.Position(1, 4));
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 5)
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 5),
                    new selection_1.Selection(2, 4, 2, 5)
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 5),
                    new selection_1.Selection(2, 4, 2, 5),
                    new selection_1.Selection(3, 4, 3, 5),
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectDown.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 5),
                    new selection_1.Selection(2, 4, 2, 5),
                    new selection_1.Selection(3, 4, 3, 5),
                    new selection_1.Selection(4, 4, 4, 5),
                    new selection_1.Selection(5, 4, 5, 5),
                    new selection_1.Selection(6, 4, 6, 5),
                    new selection_1.Selection(7, 4, 7, 5),
                ]);
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 6),
                    new selection_1.Selection(2, 4, 2, 6),
                    new selection_1.Selection(3, 4, 3, 6),
                    new selection_1.Selection(4, 4, 4, 6),
                    new selection_1.Selection(5, 4, 5, 6),
                    new selection_1.Selection(6, 4, 6, 6),
                    new selection_1.Selection(7, 4, 7, 6),
                ]);
                // 10 times
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 16),
                    new selection_1.Selection(2, 4, 2, 16),
                    new selection_1.Selection(3, 4, 3, 16),
                    new selection_1.Selection(4, 4, 4, 16),
                    new selection_1.Selection(5, 4, 5, 16),
                    new selection_1.Selection(6, 4, 6, 16),
                    new selection_1.Selection(7, 4, 7, 16),
                ]);
                // 10 times
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 26),
                    new selection_1.Selection(2, 4, 2, 26),
                    new selection_1.Selection(3, 4, 3, 26),
                    new selection_1.Selection(4, 4, 4, 26),
                    new selection_1.Selection(5, 4, 5, 26),
                    new selection_1.Selection(6, 4, 6, 26),
                    new selection_1.Selection(7, 4, 7, 26),
                ]);
                // 2 times => reaching the ending of lines 1 and 2
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 28),
                    new selection_1.Selection(4, 4, 4, 28),
                    new selection_1.Selection(5, 4, 5, 28),
                    new selection_1.Selection(6, 4, 6, 28),
                    new selection_1.Selection(7, 4, 7, 28),
                ]);
                // 4 times => reaching the ending of line 3
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 32),
                    new selection_1.Selection(4, 4, 4, 32),
                    new selection_1.Selection(5, 4, 5, 32),
                    new selection_1.Selection(6, 4, 6, 32),
                    new selection_1.Selection(7, 4, 7, 32),
                ]);
                // 2 times => reaching the ending of line 4
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 32),
                    new selection_1.Selection(4, 4, 4, 34),
                    new selection_1.Selection(5, 4, 5, 34),
                    new selection_1.Selection(6, 4, 6, 34),
                    new selection_1.Selection(7, 4, 7, 34),
                ]);
                // 1 time => reaching the ending of line 7
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 32),
                    new selection_1.Selection(4, 4, 4, 34),
                    new selection_1.Selection(5, 4, 5, 35),
                    new selection_1.Selection(6, 4, 6, 35),
                    new selection_1.Selection(7, 4, 7, 35),
                ]);
                // 3 times => reaching the ending of lines 5 & 6
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 32),
                    new selection_1.Selection(4, 4, 4, 34),
                    new selection_1.Selection(5, 4, 5, 37),
                    new selection_1.Selection(6, 4, 6, 37),
                    new selection_1.Selection(7, 4, 7, 35),
                ]);
                // cannot go anywhere anymore
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 32),
                    new selection_1.Selection(4, 4, 4, 34),
                    new selection_1.Selection(5, 4, 5, 37),
                    new selection_1.Selection(6, 4, 6, 37),
                    new selection_1.Selection(7, 4, 7, 35),
                ]);
                // cannot go anywhere anymore even if we insist
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectRight.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 32),
                    new selection_1.Selection(4, 4, 4, 34),
                    new selection_1.Selection(5, 4, 5, 37),
                    new selection_1.Selection(6, 4, 6, 37),
                    new selection_1.Selection(7, 4, 7, 35),
                ]);
                // can easily go back
                coreCommands_1.CoreNavigationCommands.CursorColumnSelectLeft.runCoreEditorCommand(viewModel, {});
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 28),
                    new selection_1.Selection(2, 4, 2, 28),
                    new selection_1.Selection(3, 4, 3, 32),
                    new selection_1.Selection(4, 4, 4, 34),
                    new selection_1.Selection(5, 4, 5, 36),
                    new selection_1.Selection(6, 4, 6, 36),
                    new selection_1.Selection(7, 4, 7, 35),
                ]);
            });
        });
    });
    class SurroundingMode extends mockMode_1.MockMode {
        constructor() {
            super(SurroundingMode._id);
            this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                autoClosingPairs: [{ open: '(', close: ')' }]
            }));
        }
    }
    SurroundingMode._id = new modes_1.LanguageIdentifier('surroundingMode', 3);
    class OnEnterMode extends mockMode_1.MockMode {
        constructor(indentAction) {
            super(OnEnterMode._id);
            this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                onEnterRules: [{
                        beforeText: /.*/,
                        action: {
                            indentAction: indentAction
                        }
                    }]
            }));
        }
    }
    OnEnterMode._id = new modes_1.LanguageIdentifier('onEnterMode', 3);
    class IndentRulesMode extends mockMode_1.MockMode {
        constructor(indentationRules) {
            super(IndentRulesMode._id);
            this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                indentationRules: indentationRules
            }));
        }
    }
    IndentRulesMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
    suite('Editor Controller - Regression tests', () => {
        test('issue microsoft/monaco-editor#443: Indentation of a single row deletes selected text in some cases', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'Hello world!',
                'another line'
            ].join('\n'), {
                insertSpaces: false
            });
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 1, 1, 13)]);
                // Check that indenting maintains the selection start at column 1
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.Selection(1, 1, 1, 14));
            });
            model.dispose();
        });
        test('Bug 9121: Auto indent + undo + redo is funky', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                ''
            ].join('\n'), {
                insertSpaces: false,
                trimAutoWhitespace: false
            });
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), '\n', 'assert1');
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t', 'assert2');
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t\n\t', 'assert3');
                viewModel.type('x');
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t\n\tx', 'assert4');
                coreCommands_1.CoreNavigationCommands.CursorLeft.runCoreEditorCommand(viewModel, {});
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t\n\tx', 'assert5');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t\nx', 'assert6');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\tx', 'assert7');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\nx', 'assert8');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'x', 'assert9');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\nx', 'assert10');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t\nx', 'assert11');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t\n\tx', 'assert12');
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t\nx', 'assert13');
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\nx', 'assert14');
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'x', 'assert15');
            });
            model.dispose();
        });
        test('issue #23539: Setting model EOL isn\'t undoable', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'Hello',
                'world'
            ], {}, (editor, viewModel) => {
                const model = editor.getModel();
                assertCursor(viewModel, new position_1.Position(1, 1));
                model.setEOL(0 /* LF */);
                assert.strictEqual(model.getValue(), 'Hello\nworld');
                model.pushEOL(1 /* CRLF */);
                assert.strictEqual(model.getValue(), 'Hello\r\nworld');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), 'Hello\nworld');
            });
        });
        test('issue #47733: Undo mangles unicode characters', () => {
            const languageId = new modes_1.LanguageIdentifier('myMode', 3);
            class MyMode extends mockMode_1.MockMode {
                constructor() {
                    super(languageId);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        surroundingPairs: [{ open: '%', close: '%' }]
                    }));
                }
            }
            const mode = new MyMode();
            const model = (0, editorTestUtils_1.createTextModel)('\'👁\'', undefined, languageId);
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelection(new selection_1.Selection(1, 1, 1, 2));
                viewModel.type('%', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), '%\'%👁\'', 'assert1');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\'👁\'', 'assert2');
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #46208: Allow empty selections in the undo/redo stack', () => {
            let model = (0, editorTestUtils_1.createTextModel)('');
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.type('Hello', 'keyboard');
                viewModel.type(' ', 'keyboard');
                viewModel.type('world', 'keyboard');
                viewModel.type(' ', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'Hello world ');
                assertCursor(viewModel, new position_1.Position(1, 13));
                moveLeft(editor, viewModel);
                moveRight(editor, viewModel);
                model.pushEditOperations([], [editOperation_1.EditOperation.replaceMove(new range_1.Range(1, 12, 1, 13), '')], () => []);
                assert.strictEqual(model.getLineContent(1), 'Hello world');
                assertCursor(viewModel, new position_1.Position(1, 12));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello world ');
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 13));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello world');
                assertCursor(viewModel, new position_1.Position(1, 12));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello');
                assertCursor(viewModel, new position_1.Position(1, 6));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '');
                assertCursor(viewModel, new position_1.Position(1, 1));
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello');
                assertCursor(viewModel, new position_1.Position(1, 6));
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello world');
                assertCursor(viewModel, new position_1.Position(1, 12));
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello world ');
                assertCursor(viewModel, new position_1.Position(1, 13));
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello world');
                assertCursor(viewModel, new position_1.Position(1, 12));
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'Hello world');
                assertCursor(viewModel, new position_1.Position(1, 12));
            });
            model.dispose();
        });
        test('bug #16815:Shift+Tab doesn\'t go back to tabstop', () => {
            let mode = new OnEnterMode(languageConfiguration_1.IndentAction.IndentOutdent);
            let model = (0, editorTestUtils_1.createTextModel)([
                '     function baz() {'
            ].join('\n'), undefined, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 6, false);
                assertCursor(viewModel, new selection_1.Selection(1, 6, 1, 6));
                coreCommands_1.CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '    function baz() {');
                assertCursor(viewModel, new selection_1.Selection(1, 5, 1, 5));
            });
            model.dispose();
            mode.dispose();
        });
        test('Bug #18293:[regression][editor] Can\'t outdent whitespace line', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '      '
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 7, false);
                assertCursor(viewModel, new selection_1.Selection(1, 7, 1, 7));
                coreCommands_1.CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '    ');
                assertCursor(viewModel, new selection_1.Selection(1, 5, 1, 5));
            });
            model.dispose();
        });
        test('issue #95591: Unindenting moves cursor to beginning of line', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '        '
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, {
                model: model,
                useTabStops: false
            }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 9, false);
                assertCursor(viewModel, new selection_1.Selection(1, 9, 1, 9));
                coreCommands_1.CoreEditingCommands.Outdent.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '    ');
                assertCursor(viewModel, new selection_1.Selection(1, 5, 1, 5));
            });
            model.dispose();
        });
        test('Bug #16657: [editor] Tab on empty line of zero indentation moves cursor to position (1,1)', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'function baz() {',
                '\tfunction hello() { // something here',
                '\t',
                '',
                '\t}',
                '}',
                ''
            ].join('\n'), {
                insertSpaces: false,
            });
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 7, 1, false);
                assertCursor(viewModel, new selection_1.Selection(7, 1, 7, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(7), '\t');
                assertCursor(viewModel, new selection_1.Selection(7, 2, 7, 2));
            });
            model.dispose();
        });
        test('bug #16740: [editor] Cut line doesn\'t quite cut the last line', () => {
            // Part 1 => there is text on the last line
            (0, testCodeEditor_1.withTestCodeEditor)([
                'asdasd',
                'qwerty'
            ], {}, (editor, viewModel) => {
                const model = editor.getModel();
                moveTo(editor, viewModel, 2, 1, false);
                assertCursor(viewModel, new selection_1.Selection(2, 1, 2, 1));
                viewModel.cut('keyboard');
                assert.strictEqual(model.getLineCount(), 1);
                assert.strictEqual(model.getLineContent(1), 'asdasd');
            });
            // Part 2 => there is no text on the last line
            (0, testCodeEditor_1.withTestCodeEditor)([
                'asdasd',
                ''
            ], {}, (editor, viewModel) => {
                const model = editor.getModel();
                moveTo(editor, viewModel, 2, 1, false);
                assertCursor(viewModel, new selection_1.Selection(2, 1, 2, 1));
                viewModel.cut('keyboard');
                assert.strictEqual(model.getLineCount(), 1);
                assert.strictEqual(model.getLineContent(1), 'asdasd');
                viewModel.cut('keyboard');
                assert.strictEqual(model.getLineCount(), 1);
                assert.strictEqual(model.getLineContent(1), '');
            });
        });
        test('Bug #11476: Double bracket surrounding + undo is broken', () => {
            let mode = new SurroundingMode();
            usingCursor({
                text: [
                    'hello'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 3, false);
                moveTo(editor, viewModel, 1, 5, true);
                assertCursor(viewModel, new selection_1.Selection(1, 3, 1, 5));
                viewModel.type('(', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(1, 4, 1, 6));
                viewModel.type('(', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(1, 5, 1, 7));
            });
            mode.dispose();
        });
        test('issue #1140: Backspace stops prematurely', () => {
            let mode = new SurroundingMode();
            let model = (0, editorTestUtils_1.createTextModel)([
                'function baz() {',
                '  return 1;',
                '};'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 3, 2, false);
                moveTo(editor, viewModel, 1, 14, true);
                assertCursor(viewModel, new selection_1.Selection(3, 2, 1, 14));
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assertCursor(viewModel, new selection_1.Selection(1, 14, 1, 14));
                assert.strictEqual(model.getLineCount(), 1);
                assert.strictEqual(model.getLineContent(1), 'function baz(;');
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #10212: Pasting entire line does not replace selection', () => {
            usingCursor({
                text: [
                    'line1',
                    'line2'
                ],
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 1, false);
                moveTo(editor, viewModel, 2, 6, true);
                viewModel.paste('line1\n', true);
                assert.strictEqual(model.getLineContent(1), 'line1');
                assert.strictEqual(model.getLineContent(2), 'line1');
                assert.strictEqual(model.getLineContent(3), '');
            });
        });
        test('issue #74722: Pasting whole line does not replace selection', () => {
            usingCursor({
                text: [
                    'line1',
                    'line sel 2',
                    'line3'
                ],
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(2, 6, 2, 9)]);
                viewModel.paste('line1\n', true);
                assert.strictEqual(model.getLineContent(1), 'line1');
                assert.strictEqual(model.getLineContent(2), 'line line1');
                assert.strictEqual(model.getLineContent(3), ' 2');
                assert.strictEqual(model.getLineContent(4), 'line3');
            });
        });
        test('issue #4996: Multiple cursor paste pastes contents of all cursors', () => {
            usingCursor({
                text: [
                    'line1',
                    'line2',
                    'line3'
                ],
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 1, 2, 1)]);
                viewModel.paste('a\nb\nc\nd', false, [
                    'a\nb',
                    'c\nd'
                ]);
                assert.strictEqual(model.getValue(), [
                    'a',
                    'bline1',
                    'c',
                    'dline2',
                    'line3'
                ].join('\n'));
            });
        });
        test('issue #16155: Paste into multiple cursors has edge case when number of lines equals number of cursors - 1', () => {
            usingCursor({
                text: [
                    'test',
                    'test',
                    'test',
                    'test'
                ],
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                ]);
                viewModel.paste('aaa\nbbb\nccc\n', false, null);
                assert.strictEqual(model.getValue(), [
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                    'aaa',
                    'bbb',
                    'ccc',
                    '',
                ].join('\n'));
            });
        });
        test('issue #43722: Multiline paste doesn\'t work anymore', () => {
            usingCursor({
                text: [
                    'test',
                    'test',
                    'test',
                    'test'
                ],
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 5),
                    new selection_1.Selection(2, 1, 2, 5),
                    new selection_1.Selection(3, 1, 3, 5),
                    new selection_1.Selection(4, 1, 4, 5),
                ]);
                viewModel.paste('aaa\r\nbbb\r\nccc\r\nddd\r\n', false, null);
                assert.strictEqual(model.getValue(), [
                    'aaa',
                    'bbb',
                    'ccc',
                    'ddd',
                ].join('\n'));
            });
        });
        test('issue #46440: (1) Pasting a multi-line selection pastes entire selection into every insertion point', () => {
            usingCursor({
                text: [
                    'line1',
                    'line2',
                    'line3'
                ],
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 1, 2, 1), new selection_1.Selection(3, 1, 3, 1)]);
                viewModel.paste('a\nb\nc', false, null);
                assert.strictEqual(model.getValue(), [
                    'aline1',
                    'bline2',
                    'cline3'
                ].join('\n'));
            });
        });
        test('issue #46440: (2) Pasting a multi-line selection pastes entire selection into every insertion point', () => {
            usingCursor({
                text: [
                    'line1',
                    'line2',
                    'line3'
                ],
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 1, 1, 1), new selection_1.Selection(2, 1, 2, 1), new selection_1.Selection(3, 1, 3, 1)]);
                viewModel.paste('a\nb\nc\n', false, null);
                assert.strictEqual(model.getValue(), [
                    'aline1',
                    'bline2',
                    'cline3'
                ].join('\n'));
            });
        });
        test('issue #3071: Investigate why undo stack gets corrupted', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'some lines',
                'and more lines',
                'just some text',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 1, false);
                moveTo(editor, viewModel, 3, 4, true);
                let isFirst = true;
                model.onDidChangeContent(() => {
                    if (isFirst) {
                        isFirst = false;
                        viewModel.type('\t', 'keyboard');
                    }
                });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), [
                    '\t just some text'
                ].join('\n'), '001');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), [
                    '    some lines',
                    '    and more lines',
                    '    just some text',
                ].join('\n'), '002');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), [
                    'some lines',
                    'and more lines',
                    'just some text',
                ].join('\n'), '003');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), [
                    'some lines',
                    'and more lines',
                    'just some text',
                ].join('\n'), '004');
            });
            model.dispose();
        });
        test('issue #12950: Cannot Double Click To Insert Emoji Using OSX Emoji Panel', () => {
            usingCursor({
                text: [
                    'some lines',
                    'and more lines',
                    'just some text',
                ],
                languageIdentifier: null
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 1, false);
                viewModel.type('😍', 'keyboard');
                assert.strictEqual(model.getValue(), [
                    'some lines',
                    'and more lines',
                    '😍just some text',
                ].join('\n'));
            });
        });
        test('issue #3463: pressing tab adds spaces, but not as many as for a tab', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'function a() {',
                '\tvar a = {',
                '\t\tx: 3',
                '\t};',
                '}',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 3, 2, false);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(3), '\t    \tx: 3');
            });
            model.dispose();
        });
        test('issue #4312: trying to type a tab character over a sequence of spaces results in unexpected behaviour', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'var foo = 123;       // this is a comment',
                'var bar = 4;       // another comment'
            ].join('\n'), {
                insertSpaces: false,
            });
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 15, false);
                moveTo(editor, viewModel, 1, 22, true);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'var foo = 123;\t// this is a comment');
            });
            model.dispose();
        });
        test('issue #832: word right', () => {
            usingCursor({
                text: [
                    '   /* Just some   more   text a+= 3 +5-3 + 7 */  '
                ],
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 1, false);
                function assertWordRight(col, expectedCol) {
                    let args = {
                        position: {
                            lineNumber: 1,
                            column: col
                        }
                    };
                    if (col === 1) {
                        coreCommands_1.CoreNavigationCommands.WordSelect.runCoreEditorCommand(viewModel, args);
                    }
                    else {
                        coreCommands_1.CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(viewModel, args);
                    }
                    assert.strictEqual(viewModel.getSelection().startColumn, 1, 'TEST FOR ' + col);
                    assert.strictEqual(viewModel.getSelection().endColumn, expectedCol, 'TEST FOR ' + col);
                }
                assertWordRight(1, '   '.length + 1);
                assertWordRight(2, '   '.length + 1);
                assertWordRight(3, '   '.length + 1);
                assertWordRight(4, '   '.length + 1);
                assertWordRight(5, '   /'.length + 1);
                assertWordRight(6, '   /*'.length + 1);
                assertWordRight(7, '   /* '.length + 1);
                assertWordRight(8, '   /* Just'.length + 1);
                assertWordRight(9, '   /* Just'.length + 1);
                assertWordRight(10, '   /* Just'.length + 1);
                assertWordRight(11, '   /* Just'.length + 1);
                assertWordRight(12, '   /* Just '.length + 1);
                assertWordRight(13, '   /* Just some'.length + 1);
                assertWordRight(14, '   /* Just some'.length + 1);
                assertWordRight(15, '   /* Just some'.length + 1);
                assertWordRight(16, '   /* Just some'.length + 1);
                assertWordRight(17, '   /* Just some '.length + 1);
                assertWordRight(18, '   /* Just some  '.length + 1);
                assertWordRight(19, '   /* Just some   '.length + 1);
                assertWordRight(20, '   /* Just some   more'.length + 1);
                assertWordRight(21, '   /* Just some   more'.length + 1);
                assertWordRight(22, '   /* Just some   more'.length + 1);
                assertWordRight(23, '   /* Just some   more'.length + 1);
                assertWordRight(24, '   /* Just some   more '.length + 1);
                assertWordRight(25, '   /* Just some   more  '.length + 1);
                assertWordRight(26, '   /* Just some   more   '.length + 1);
                assertWordRight(27, '   /* Just some   more   text'.length + 1);
                assertWordRight(28, '   /* Just some   more   text'.length + 1);
                assertWordRight(29, '   /* Just some   more   text'.length + 1);
                assertWordRight(30, '   /* Just some   more   text'.length + 1);
                assertWordRight(31, '   /* Just some   more   text '.length + 1);
                assertWordRight(32, '   /* Just some   more   text a'.length + 1);
                assertWordRight(33, '   /* Just some   more   text a+'.length + 1);
                assertWordRight(34, '   /* Just some   more   text a+='.length + 1);
                assertWordRight(35, '   /* Just some   more   text a+= '.length + 1);
                assertWordRight(36, '   /* Just some   more   text a+= 3'.length + 1);
                assertWordRight(37, '   /* Just some   more   text a+= 3 '.length + 1);
                assertWordRight(38, '   /* Just some   more   text a+= 3 +'.length + 1);
                assertWordRight(39, '   /* Just some   more   text a+= 3 +5'.length + 1);
                assertWordRight(40, '   /* Just some   more   text a+= 3 +5-'.length + 1);
                assertWordRight(41, '   /* Just some   more   text a+= 3 +5-3'.length + 1);
                assertWordRight(42, '   /* Just some   more   text a+= 3 +5-3 '.length + 1);
                assertWordRight(43, '   /* Just some   more   text a+= 3 +5-3 +'.length + 1);
                assertWordRight(44, '   /* Just some   more   text a+= 3 +5-3 + '.length + 1);
                assertWordRight(45, '   /* Just some   more   text a+= 3 +5-3 + 7'.length + 1);
                assertWordRight(46, '   /* Just some   more   text a+= 3 +5-3 + 7 '.length + 1);
                assertWordRight(47, '   /* Just some   more   text a+= 3 +5-3 + 7 *'.length + 1);
                assertWordRight(48, '   /* Just some   more   text a+= 3 +5-3 + 7 */'.length + 1);
                assertWordRight(49, '   /* Just some   more   text a+= 3 +5-3 + 7 */ '.length + 1);
                assertWordRight(50, '   /* Just some   more   text a+= 3 +5-3 + 7 */  '.length + 1);
            });
        });
        test('issue #33788: Wrong cursor position when double click to select a word', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'Just some text'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                coreCommands_1.CoreNavigationCommands.WordSelect.runCoreEditorCommand(viewModel, { position: new position_1.Position(1, 8) });
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.Selection(1, 6, 1, 10));
                coreCommands_1.CoreNavigationCommands.WordSelectDrag.runCoreEditorCommand(viewModel, { position: new position_1.Position(1, 8) });
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.Selection(1, 6, 1, 10));
            });
            model.dispose();
        });
        test('issue #12887: Double-click highlighting separating white space', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'abc def'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                coreCommands_1.CoreNavigationCommands.WordSelect.runCoreEditorCommand(viewModel, { position: new position_1.Position(1, 5) });
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.Selection(1, 5, 1, 8));
            });
            model.dispose();
        });
        test('issue #9675: Undo/Redo adds a stop in between CHN Characters', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([], {}, (editor, viewModel) => {
                const model = editor.getModel();
                assertCursor(viewModel, new position_1.Position(1, 1));
                // Typing sennsei in Japanese - Hiragana
                viewModel.type('ｓ', 'keyboard');
                viewModel.compositionType('せ', 1, 0, 0);
                viewModel.compositionType('せｎ', 1, 0, 0);
                viewModel.compositionType('せん', 2, 0, 0);
                viewModel.compositionType('せんｓ', 2, 0, 0);
                viewModel.compositionType('せんせ', 3, 0, 0);
                viewModel.compositionType('せんせ', 3, 0, 0);
                viewModel.compositionType('せんせい', 3, 0, 0);
                viewModel.compositionType('せんせい', 4, 0, 0);
                viewModel.compositionType('せんせい', 4, 0, 0);
                viewModel.compositionType('せんせい', 4, 0, 0);
                assert.strictEqual(model.getLineContent(1), 'せんせい');
                assertCursor(viewModel, new position_1.Position(1, 5));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '');
                assertCursor(viewModel, new position_1.Position(1, 1));
            });
        });
        test('issue #23913: Greater than 1000+ multi cursor typing replacement text appears inverted, lines begin to drop off selection', function () {
            this.timeout(10000);
            const LINE_CNT = 2000;
            let text = [];
            for (let i = 0; i < LINE_CNT; i++) {
                text[i] = 'asd';
            }
            usingCursor({
                text: text
            }, (editor, model, viewModel) => {
                let selections = [];
                for (let i = 0; i < LINE_CNT; i++) {
                    selections[i] = new selection_1.Selection(i + 1, 1, i + 1, 1);
                }
                viewModel.setSelections('test', selections);
                viewModel.type('n', 'keyboard');
                viewModel.type('n', 'keyboard');
                for (let i = 0; i < LINE_CNT; i++) {
                    assert.strictEqual(model.getLineContent(i + 1), 'nnasd', 'line #' + (i + 1));
                }
                assert.strictEqual(viewModel.getSelections().length, LINE_CNT);
                assert.strictEqual(viewModel.getSelections()[LINE_CNT - 1].startLineNumber, LINE_CNT);
            });
        });
        test('issue #23983: Calling model.setEOL does not reset cursor position', () => {
            usingCursor({
                text: [
                    'first line',
                    'second line'
                ]
            }, (editor, model, viewModel) => {
                model.setEOL(1 /* CRLF */);
                viewModel.setSelections('test', [new selection_1.Selection(2, 2, 2, 2)]);
                model.setEOL(0 /* LF */);
                assertCursor(viewModel, new selection_1.Selection(2, 2, 2, 2));
            });
        });
        test('issue #23983: Calling model.setValue() resets cursor position', () => {
            usingCursor({
                text: [
                    'first line',
                    'second line'
                ]
            }, (editor, model, viewModel) => {
                model.setEOL(1 /* CRLF */);
                viewModel.setSelections('test', [new selection_1.Selection(2, 2, 2, 2)]);
                model.setValue([
                    'different first line',
                    'different second line',
                    'new third line'
                ].join('\n'));
                assertCursor(viewModel, new selection_1.Selection(1, 1, 1, 1));
            });
        });
        test('issue #36740: wordwrap creates an extra step / character at the wrapping point', () => {
            // a single model line => 4 view lines
            (0, testCodeEditor_1.withTestCodeEditor)([
                [
                    'Lorem ipsum ',
                    'dolor sit amet ',
                    'consectetur ',
                    'adipiscing elit',
                ].join('')
            ], { wordWrap: 'wordWrapColumn', wordWrapColumn: 16 }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 7, 1, 7)]);
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 9, 1, 9));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 10, 1, 10));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 11, 1, 11));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 12));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 13, 1, 13));
                // moving to view line 2
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 14, 1, 14));
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 13, 1, 13));
                // moving back to view line 1
                moveLeft(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 12));
            });
        });
        test('issue #110376: multiple selections with wordwrap behave differently', () => {
            // a single model line => 4 view lines
            (0, testCodeEditor_1.withTestCodeEditor)([
                [
                    'just a sentence. just a ',
                    'sentence. just a sentence.',
                ].join('')
            ], { wordWrap: 'wordWrapColumn', wordWrapColumn: 25 }, (editor, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 16),
                    new selection_1.Selection(1, 18, 1, 33),
                    new selection_1.Selection(1, 35, 1, 50),
                ]);
                moveLeft(editor, viewModel);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 1, 1, 1),
                    new selection_1.Selection(1, 18, 1, 18),
                    new selection_1.Selection(1, 35, 1, 35),
                ]);
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 16),
                    new selection_1.Selection(1, 18, 1, 33),
                    new selection_1.Selection(1, 35, 1, 50),
                ]);
                moveRight(editor, viewModel);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 16, 1, 16),
                    new selection_1.Selection(1, 33, 1, 33),
                    new selection_1.Selection(1, 50, 1, 50),
                ]);
            });
        });
        test('issue #98320: Multi-Cursor, Wrap lines and cursorSelectRight ==> cursors out of sync', () => {
            // a single model line => 4 view lines
            (0, testCodeEditor_1.withTestCodeEditor)([
                [
                    'lorem_ipsum-1993x11x13',
                    'dolor_sit_amet-1998x04x27',
                    'consectetur-2007x10x08',
                    'adipiscing-2012x07x27',
                    'elit-2015x02x27',
                ].join('\n')
            ], { wordWrap: 'wordWrapColumn', wordWrapColumn: 16 }, (editor, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 13, 1, 13),
                    new selection_1.Selection(2, 16, 2, 16),
                    new selection_1.Selection(3, 13, 3, 13),
                    new selection_1.Selection(4, 12, 4, 12),
                    new selection_1.Selection(5, 6, 5, 6),
                ]);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 13, 1, 13),
                    new selection_1.Selection(2, 16, 2, 16),
                    new selection_1.Selection(3, 13, 3, 13),
                    new selection_1.Selection(4, 12, 4, 12),
                    new selection_1.Selection(5, 6, 5, 6),
                ]);
                moveRight(editor, viewModel, true);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 13, 1, 14),
                    new selection_1.Selection(2, 16, 2, 17),
                    new selection_1.Selection(3, 13, 3, 14),
                    new selection_1.Selection(4, 12, 4, 13),
                    new selection_1.Selection(5, 6, 5, 7),
                ]);
                moveRight(editor, viewModel, true);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 13, 1, 15),
                    new selection_1.Selection(2, 16, 2, 18),
                    new selection_1.Selection(3, 13, 3, 15),
                    new selection_1.Selection(4, 12, 4, 14),
                    new selection_1.Selection(5, 6, 5, 8),
                ]);
                moveRight(editor, viewModel, true);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 13, 1, 16),
                    new selection_1.Selection(2, 16, 2, 19),
                    new selection_1.Selection(3, 13, 3, 16),
                    new selection_1.Selection(4, 12, 4, 15),
                    new selection_1.Selection(5, 6, 5, 9),
                ]);
                moveRight(editor, viewModel, true);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 13, 1, 17),
                    new selection_1.Selection(2, 16, 2, 20),
                    new selection_1.Selection(3, 13, 3, 17),
                    new selection_1.Selection(4, 12, 4, 16),
                    new selection_1.Selection(5, 6, 5, 10),
                ]);
            });
        });
        test('issue #41573 - delete across multiple lines does not shrink the selection when word wraps', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                'Authorization: \'Bearer pHKRfCTFSnGxs6akKlb9ddIXcca0sIUSZJutPHYqz7vEeHdMTMh0SGN0IGU3a0n59DXjTLRsj5EJ2u33qLNIFi9fk5XF8pK39PndLYUZhPt4QvHGLScgSkK0L4gwzkzMloTQPpKhqiikiIOvyNNSpd2o8j29NnOmdTUOKi9DVt74PD2ohKxyOrWZ6oZprTkb3eKajcpnS0LABKfaw2rmv4\','
            ].join('\n'), { wordWrap: 'wordWrapColumn', wordWrapColumn: 100 }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 43, false);
                moveTo(editor, viewModel, 1, 147, true);
                assertCursor(viewModel, new selection_1.Selection(1, 43, 1, 147));
                editor.getModel().applyEdits([{
                        range: new range_1.Range(1, 1, 1, 43),
                        text: ''
                    }]);
                assertCursor(viewModel, new selection_1.Selection(1, 1, 1, 105));
            });
        });
        test('issue #22717: Moving text cursor cause an incorrect position in Chinese', () => {
            // a single model line => 4 view lines
            (0, testCodeEditor_1.withTestCodeEditor)([
                [
                    '一二三四五六七八九十',
                    '12345678901234567890',
                ].join('\n')
            ], {}, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 5, 1, 5)]);
                moveDown(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(2, 9, 2, 9));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(2, 10, 2, 10));
                moveRight(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(2, 11, 2, 11));
                moveUp(editor, viewModel);
                assertCursor(viewModel, new selection_1.Selection(1, 6, 1, 6));
            });
        });
        test('issue #112301: new stickyTabStops feature interferes with word wrap', () => {
            (0, testCodeEditor_1.withTestCodeEditor)([
                [
                    'function hello() {',
                    '        console.log(`this is a long console message`)',
                    '}',
                ].join('\n')
            ], { wordWrap: 'wordWrapColumn', wordWrapColumn: 32, stickyTabStops: true }, (editor, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(2, 31, 2, 31)
                ]);
                moveRight(editor, viewModel, false);
                assertCursor(viewModel, new position_1.Position(2, 32));
                moveRight(editor, viewModel, false);
                assertCursor(viewModel, new position_1.Position(2, 33));
                moveRight(editor, viewModel, false);
                assertCursor(viewModel, new position_1.Position(2, 34));
                moveLeft(editor, viewModel, false);
                assertCursor(viewModel, new position_1.Position(2, 33));
                moveLeft(editor, viewModel, false);
                assertCursor(viewModel, new position_1.Position(2, 32));
                moveLeft(editor, viewModel, false);
                assertCursor(viewModel, new position_1.Position(2, 31));
            });
        });
        test('issue #44805: Should not be able to undo in readonly editor', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                ''
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { readOnly: true, model: model }, (editor, viewModel) => {
                model.pushEditOperations([new selection_1.Selection(1, 1, 1, 1)], [{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: 'Hello world!'
                    }], () => [new selection_1.Selection(1, 1, 1, 1)]);
                assert.strictEqual(model.getValue(1 /* LF */), 'Hello world!');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'Hello world!');
            });
            model.dispose();
        });
        test('issue #46314: ViewModel is out of sync with Model!', () => {
            const tokenizationSupport = {
                getInitialState: () => nullMode_1.NULL_STATE,
                tokenize: undefined,
                tokenize2: (line, hasEOL, state) => {
                    return new token_1.TokenizationResult2(new Uint32Array(0), state);
                }
            };
            const LANGUAGE_ID = 'modelModeTest1';
            const languageRegistration = modes_1.TokenizationRegistry.register(LANGUAGE_ID, tokenizationSupport);
            let model = (0, editorTestUtils_1.createTextModel)('Just text', undefined, new modes_1.LanguageIdentifier(LANGUAGE_ID, 0));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor1, cursor1) => {
                (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor2, cursor2) => {
                    editor1.onDidChangeCursorPosition(() => {
                        model.tokenizeIfCheap(1);
                    });
                    model.applyEdits([{ range: new range_1.Range(1, 1, 1, 1), text: '-' }]);
                });
            });
            languageRegistration.dispose();
            model.dispose();
        });
        test('issue #37967: problem replacing consecutive characters', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'const a = "foo";',
                'const b = ""'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { multiCursorMergeOverlapping: false, model: model }, (editor, viewModel) => {
                editor.setSelections([
                    new selection_1.Selection(1, 12, 1, 12),
                    new selection_1.Selection(1, 16, 1, 16),
                    new selection_1.Selection(2, 12, 2, 12),
                    new selection_1.Selection(2, 13, 2, 13),
                ]);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 11, 1, 11),
                    new selection_1.Selection(1, 14, 1, 14),
                    new selection_1.Selection(2, 11, 2, 11),
                    new selection_1.Selection(2, 11, 2, 11),
                ]);
                viewModel.type('\'', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'const a = \'foo\';');
                assert.strictEqual(model.getLineContent(2), 'const b = \'\'');
            });
            model.dispose();
        });
        test('issue #15761: Cursor doesn\'t move in a redo operation', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'hello'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelections([
                    new selection_1.Selection(1, 4, 1, 4)
                ]);
                editor.executeEdits('test', [{
                        range: new range_1.Range(1, 1, 1, 1),
                        text: '*',
                        forceMoveMarkers: true
                    }]);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 5, 1, 5),
                ]);
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 4, 1, 4),
                ]);
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 5, 1, 5),
                ]);
            });
            model.dispose();
        });
        test('issue #42783: API Calls with Undo Leave Cursor in Wrong Position', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'ab'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelections([
                    new selection_1.Selection(1, 1, 1, 1)
                ]);
                editor.executeEdits('test', [{
                        range: new range_1.Range(1, 1, 1, 3),
                        text: ''
                    }]);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 1, 1, 1),
                ]);
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 1, 1, 1),
                ]);
                editor.executeEdits('test', [{
                        range: new range_1.Range(1, 1, 1, 2),
                        text: ''
                    }]);
                assertCursor(viewModel, [
                    new selection_1.Selection(1, 1, 1, 1),
                ]);
            });
            model.dispose();
        });
        test('issue #85712: Paste line moves cursor to start of current line rather than start of next line', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'abc123',
                ''
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelections([
                    new selection_1.Selection(2, 1, 2, 1)
                ]);
                viewModel.paste('something\n', true);
                assert.strictEqual(model.getValue(), [
                    'abc123',
                    'something',
                    ''
                ].join('\n'));
                assertCursor(viewModel, new position_1.Position(3, 1));
            });
            model.dispose();
        });
        test('issue #84897: Left delete behavior in some languages is changed', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'สวัสดี'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelections([
                    new selection_1.Selection(1, 7, 1, 7)
                ]);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'สวัสด');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'สวัส');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'สวั');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'สว');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'ส');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '');
            });
            model.dispose();
        });
    });
    suite('Editor Controller - Cursor Configuration', () => {
        test('Cursor honors insertSpaces configuration on new line', () => {
            usingCursor({
                text: [
                    '    \tMy First Line\t ',
                    '\tMy Second Line',
                    '    Third Line',
                    '',
                    '1'
                ]
            }, (editor, model, viewModel) => {
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(1, 21), source: 'keyboard' });
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    \tMy First Line\t ');
                assert.strictEqual(model.getLineContent(2), '        ');
            });
        });
        test('Cursor honors insertSpaces configuration on tab', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '    \tMy First Line\t ',
                'My Second Line123',
                '    Third Line',
                '',
                '1'
            ].join('\n'), {
                tabSize: 13,
                indentSize: 13,
            });
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                // Tab on column 1
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 1) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), '             My Second Line123');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                // Tab on column 2
                assert.strictEqual(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 2) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'M            y Second Line123');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                // Tab on column 3
                assert.strictEqual(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 3) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'My            Second Line123');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                // Tab on column 4
                assert.strictEqual(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 4) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'My           Second Line123');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                // Tab on column 5
                assert.strictEqual(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 5) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'My S         econd Line123');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                // Tab on column 5
                assert.strictEqual(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 5) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'My S         econd Line123');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                // Tab on column 13
                assert.strictEqual(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 13) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'My Second Li ne123');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                // Tab on column 14
                assert.strictEqual(model.getLineContent(2), 'My Second Line123');
                coreCommands_1.CoreNavigationCommands.MoveTo.runCoreEditorCommand(viewModel, { position: new position_1.Position(2, 14) });
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'My Second Lin             e123');
            });
            model.dispose();
        });
        test('Enter auto-indents with insertSpaces setting 1', () => {
            let mode = new OnEnterMode(languageConfiguration_1.IndentAction.Indent);
            usingCursor({
                text: [
                    '\thello'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 7, false);
                assertCursor(viewModel, new selection_1.Selection(1, 7, 1, 7));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(2 /* CRLF */), '\thello\r\n        ');
            });
            mode.dispose();
        });
        test('Enter auto-indents with insertSpaces setting 2', () => {
            let mode = new OnEnterMode(languageConfiguration_1.IndentAction.None);
            usingCursor({
                text: [
                    '\thello'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 7, false);
                assertCursor(viewModel, new selection_1.Selection(1, 7, 1, 7));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(2 /* CRLF */), '\thello\r\n    ');
            });
            mode.dispose();
        });
        test('Enter auto-indents with insertSpaces setting 3', () => {
            let mode = new OnEnterMode(languageConfiguration_1.IndentAction.IndentOutdent);
            usingCursor({
                text: [
                    '\thell()'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 7, false);
                assertCursor(viewModel, new selection_1.Selection(1, 7, 1, 7));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(2 /* CRLF */), '\thell(\r\n        \r\n    )');
            });
            mode.dispose();
        });
        test('removeAutoWhitespace off', () => {
            usingCursor({
                text: [
                    '    some  line abc  '
                ],
                modelOpts: {
                    trimAutoWhitespace: false
                }
            }, (editor, model, viewModel) => {
                // Move cursor to the end, verify that we do not trim whitespaces if line has values
                moveTo(editor, viewModel, 1, model.getLineContent(1).length + 1);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    some  line abc  ');
                assert.strictEqual(model.getLineContent(2), '    ');
                // Try to enter again, we should trimmed previous line
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    some  line abc  ');
                assert.strictEqual(model.getLineContent(2), '    ');
                assert.strictEqual(model.getLineContent(3), '    ');
            });
        });
        test('removeAutoWhitespace on: removes only whitespace the cursor added 1', () => {
            usingCursor({
                text: [
                    '    '
                ]
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, model.getLineContent(1).length + 1);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    ');
                assert.strictEqual(model.getLineContent(2), '    ');
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    ');
                assert.strictEqual(model.getLineContent(2), '');
                assert.strictEqual(model.getLineContent(3), '    ');
            });
        });
        test('issue #115033: indent and appendText', () => {
            const mode = new class extends mockMode_1.MockMode {
                constructor() {
                    super(new modes_1.LanguageIdentifier('onEnterMode', 3));
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        onEnterRules: [{
                                beforeText: /.*/,
                                action: {
                                    indentAction: languageConfiguration_1.IndentAction.Indent,
                                    appendText: 'x'
                                }
                            }]
                    }));
                }
            }();
            usingCursor({
                text: [
                    'text'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 5);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'text');
                assert.strictEqual(model.getLineContent(2), '    x');
                assertCursor(viewModel, new position_1.Position(2, 6));
            });
            mode.dispose();
        });
        test('issue #6862: Editor removes auto inserted indentation when formatting on type', () => {
            let mode = new OnEnterMode(languageConfiguration_1.IndentAction.IndentOutdent);
            usingCursor({
                text: [
                    'function foo (params: string) {}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 32);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'function foo (params: string) {');
                assert.strictEqual(model.getLineContent(2), '    ');
                assert.strictEqual(model.getLineContent(3), '}');
                class TestCommand {
                    constructor() {
                        this._selectionId = null;
                    }
                    getEditOperations(model, builder) {
                        builder.addEditOperation(new range_1.Range(1, 13, 1, 14), '');
                        this._selectionId = builder.trackSelection(viewModel.getSelection());
                    }
                    computeCursorState(model, helper) {
                        return helper.getTrackedSelection(this._selectionId);
                    }
                }
                viewModel.executeCommand(new TestCommand(), 'autoFormat');
                assert.strictEqual(model.getLineContent(1), 'function foo(params: string) {');
                assert.strictEqual(model.getLineContent(2), '    ');
                assert.strictEqual(model.getLineContent(3), '}');
            });
            mode.dispose();
        });
        test('removeAutoWhitespace on: removes only whitespace the cursor added 2', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '    if (a) {',
                '        ',
                '',
                '',
                '    }'
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 3, 1);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '    if (a) {');
                assert.strictEqual(model.getLineContent(2), '        ');
                assert.strictEqual(model.getLineContent(3), '    ');
                assert.strictEqual(model.getLineContent(4), '');
                assert.strictEqual(model.getLineContent(5), '    }');
                moveTo(editor, viewModel, 4, 1);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '    if (a) {');
                assert.strictEqual(model.getLineContent(2), '        ');
                assert.strictEqual(model.getLineContent(3), '');
                assert.strictEqual(model.getLineContent(4), '    ');
                assert.strictEqual(model.getLineContent(5), '    }');
                moveTo(editor, viewModel, 5, model.getLineMaxColumn(5));
                viewModel.type('something', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    if (a) {');
                assert.strictEqual(model.getLineContent(2), '        ');
                assert.strictEqual(model.getLineContent(3), '');
                assert.strictEqual(model.getLineContent(4), '');
                assert.strictEqual(model.getLineContent(5), '    }something');
            });
            model.dispose();
        });
        test('removeAutoWhitespace on: test 1', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '    some  line abc  '
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                // Move cursor to the end, verify that we do not trim whitespaces if line has values
                moveTo(editor, viewModel, 1, model.getLineContent(1).length + 1);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    some  line abc  ');
                assert.strictEqual(model.getLineContent(2), '    ');
                // Try to enter again, we should trimmed previous line
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    some  line abc  ');
                assert.strictEqual(model.getLineContent(2), '');
                assert.strictEqual(model.getLineContent(3), '    ');
                // More whitespaces
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '    some  line abc  ');
                assert.strictEqual(model.getLineContent(2), '');
                assert.strictEqual(model.getLineContent(3), '        ');
                // Enter and verify that trimmed again
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    some  line abc  ');
                assert.strictEqual(model.getLineContent(2), '');
                assert.strictEqual(model.getLineContent(3), '');
                assert.strictEqual(model.getLineContent(4), '        ');
                // Trimmed if we will keep only text
                moveTo(editor, viewModel, 1, 5);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    ');
                assert.strictEqual(model.getLineContent(2), '    some  line abc  ');
                assert.strictEqual(model.getLineContent(3), '');
                assert.strictEqual(model.getLineContent(4), '');
                assert.strictEqual(model.getLineContent(5), '');
                // Trimmed if we will keep only text by selection
                moveTo(editor, viewModel, 2, 5);
                moveTo(editor, viewModel, 3, 1, true);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '    ');
                assert.strictEqual(model.getLineContent(2), '    ');
                assert.strictEqual(model.getLineContent(3), '    ');
                assert.strictEqual(model.getLineContent(4), '');
                assert.strictEqual(model.getLineContent(5), '');
            });
            model.dispose();
        });
        test('issue #15118: remove auto whitespace when pasting entire line', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '    function f() {',
                '        // I\'m gonna copy this line',
                '        return 3;',
                '    }',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 3, model.getLineMaxColumn(3));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(), [
                    '    function f() {',
                    '        // I\'m gonna copy this line',
                    '        return 3;',
                    '        ',
                    '    }',
                ].join('\n'));
                assertCursor(viewModel, new position_1.Position(4, model.getLineMaxColumn(4)));
                viewModel.paste('        // I\'m gonna copy this line\n', true);
                assert.strictEqual(model.getValue(), [
                    '    function f() {',
                    '        // I\'m gonna copy this line',
                    '        return 3;',
                    '        // I\'m gonna copy this line',
                    '',
                    '    }',
                ].join('\n'));
                assertCursor(viewModel, new position_1.Position(5, 1));
            });
            model.dispose();
        });
        test('issue #40695: maintain cursor position when copying lines using ctrl+c, ctrl+v', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '    function f() {',
                '        // I\'m gonna copy this line',
                '        // Another line',
                '        return 3;',
                '    }',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelections([new selection_1.Selection(4, 10, 4, 10)]);
                viewModel.paste('        // I\'m gonna copy this line\n', true);
                assert.strictEqual(model.getValue(), [
                    '    function f() {',
                    '        // I\'m gonna copy this line',
                    '        // Another line',
                    '        // I\'m gonna copy this line',
                    '        return 3;',
                    '    }',
                ].join('\n'));
                assertCursor(viewModel, new position_1.Position(5, 10));
            });
            model.dispose();
        });
        test('UseTabStops is off', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '    x',
                '        a    ',
                '    '
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, useTabStops: false }, (editor, viewModel) => {
                // DeleteLeft removes just one whitespace
                moveTo(editor, viewModel, 2, 9);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), '       a    ');
            });
            model.dispose();
        });
        test('Backspace removes whitespaces with tab size', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                ' \t \t     x',
                '        a    ',
                '    '
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, useTabStops: true }, (editor, viewModel) => {
                // DeleteLeft does not remove tab size, because some text exists before
                moveTo(editor, viewModel, 2, model.getLineContent(2).length + 1);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), '        a   ');
                // DeleteLeft removes tab size = 4
                moveTo(editor, viewModel, 2, 9);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), '    a   ');
                // DeleteLeft removes tab size = 4
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'a   ');
                // Undo DeleteLeft - get us back to original indentation
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), '        a   ');
                // Nothing is broken when cursor is in (1,1)
                moveTo(editor, viewModel, 1, 1);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), ' \t \t     x');
                // DeleteLeft stops at tab stops even in mixed whitespace case
                moveTo(editor, viewModel, 1, 10);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), ' \t \t    x');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), ' \t \tx');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), ' \tx');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'x');
                // DeleteLeft on last line
                moveTo(editor, viewModel, 3, model.getLineContent(3).length + 1);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(3), '');
                // DeleteLeft with removing new line symbol
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'x\n        a   ');
                // In case of selection DeleteLeft only deletes selected text
                moveTo(editor, viewModel, 2, 3);
                moveTo(editor, viewModel, 2, 4, true);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), '       a   ');
            });
            model.dispose();
        });
        test('PR #5423: Auto indent + undo + redo is funky', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                ''
            ].join('\n'), {
                insertSpaces: false,
            });
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), '\n', 'assert1');
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\t', 'assert2');
                viewModel.type('y', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty', 'assert2');
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty\n\t', 'assert3');
                viewModel.type('x');
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty\n\tx', 'assert4');
                coreCommands_1.CoreNavigationCommands.CursorLeft.runCoreEditorCommand(viewModel, {});
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty\n\tx', 'assert5');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty\nx', 'assert6');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\tyx', 'assert7');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\tx', 'assert8');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\nx', 'assert9');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'x', 'assert10');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\nx', 'assert11');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty\nx', 'assert12');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty\n\tx', 'assert13');
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\n\ty\nx', 'assert14');
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), '\nx', 'assert15');
                coreCommands_1.CoreEditingCommands.Redo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(1 /* LF */), 'x', 'assert16');
            });
            model.dispose();
        });
        test('issue #90973: Undo brings back model alternative version', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                ''
            ].join('\n'), {
                insertSpaces: false,
            });
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                const beforeVersion = model.getVersionId();
                const beforeAltVersion = model.getAlternativeVersionId();
                viewModel.type('Hello', 'keyboard');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                const afterVersion = model.getVersionId();
                const afterAltVersion = model.getAlternativeVersionId();
                assert.notStrictEqual(beforeVersion, afterVersion);
                assert.strictEqual(beforeAltVersion, afterAltVersion);
            });
            model.dispose();
        });
    });
    suite('Editor Controller - Indentation Rules', () => {
        let mode = new IndentRulesMode({
            decreaseIndentPattern: /^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$/,
            indentNextLinePattern: /^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$)/,
            unIndentedLinePattern: /^(?!.*([;{}]|\S:)\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!.*(\{[^}"']*|\([^)"']*|\[[^\]"']*|^\s*(\{\}|\(\)|\[\]|(case\b.*|default):))\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*((?!\S.*\/[*]).*[*]\/\s*)?[})\]]|^\s*(case\b.*|default):\s*(\/\/.*|\/[*].*[*]\/\s*)?$)(?!^\s*(for|while|if|else)\b(?!.*[;{}]\s*(\/\/.*|\/[*].*[*]\/\s*)?$))/
        });
        test('Enter honors increaseIndentPattern', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false },
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 12, false);
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 12));
                viewModel.type('\n', 'keyboard');
                model.forceTokenization(model.getLineCount());
                assertCursor(viewModel, new selection_1.Selection(2, 2, 2, 2));
                moveTo(editor, viewModel, 3, 13, false);
                assertCursor(viewModel, new selection_1.Selection(3, 13, 3, 13));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
            });
        });
        test('Type honors decreaseIndentPattern', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\t'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 2, false);
                assertCursor(viewModel, new selection_1.Selection(2, 2, 2, 2));
                viewModel.type('}', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(2, 2, 2, 2));
                assert.strictEqual(model.getLineContent(2), '}', '001');
            });
        });
        test('Enter honors unIndentedLinePattern', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\t\t\treturn true'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false },
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 15, false);
                assertCursor(viewModel, new selection_1.Selection(2, 15, 2, 15));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(3, 2, 3, 2));
            });
        });
        test('Enter honors indentNextLinePattern', () => {
            usingCursor({
                text: [
                    'if (true)',
                    '\treturn true;',
                    'if (true)',
                    '\t\t\t\treturn true'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false },
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 14, false);
                assertCursor(viewModel, new selection_1.Selection(2, 14, 2, 14));
                viewModel.type('\n', 'keyboard');
                model.forceTokenization(model.getLineCount());
                assertCursor(viewModel, new selection_1.Selection(3, 1, 3, 1));
                moveTo(editor, viewModel, 5, 16, false);
                assertCursor(viewModel, new selection_1.Selection(5, 16, 5, 16));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(6, 2, 6, 2));
            });
        });
        test('Enter honors indentNextLinePattern 2', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'if (true)',
                '\tif (true)'
            ].join('\n'), {
                insertSpaces: false,
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, autoIndent: 'full' }, (editor, viewModel) => {
                moveTo(editor, viewModel, 2, 11, false);
                assertCursor(viewModel, new selection_1.Selection(2, 11, 2, 11));
                viewModel.type('\n', 'keyboard');
                model.forceTokenization(model.getLineCount());
                assertCursor(viewModel, new selection_1.Selection(3, 3, 3, 3));
                viewModel.type('console.log();', 'keyboard');
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 1, 4, 1));
            });
            model.dispose();
        });
        test('Enter honors intential indent', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    'return true;',
                    '}}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 13, false);
                assertCursor(viewModel, new selection_1.Selection(3, 13, 3, 13));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 1, 4, 1));
                assert.strictEqual(model.getLineContent(3), 'return true;', '001');
            });
        });
        test('Enter supports selection 1', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 4, 3, false);
                moveTo(editor, viewModel, 4, 4, true);
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 4));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(5, 1, 5, 1));
                assert.strictEqual(model.getLineContent(4), '\t}', '001');
            });
        });
        test('Enter supports selection 2', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 12, false);
                moveTo(editor, viewModel, 2, 13, true);
                assertCursor(viewModel, new selection_1.Selection(2, 12, 2, 13));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(3, 3, 3, 3));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
            });
        });
        test('Enter honors tabSize and insertSpaces 1', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 12, false);
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 12));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(2, 5, 2, 5));
                model.forceTokenization(model.getLineCount());
                moveTo(editor, viewModel, 3, 13, false);
                assertCursor(viewModel, new selection_1.Selection(3, 13, 3, 13));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 9, 4, 9));
            });
        });
        test('Enter honors tabSize and insertSpaces 2', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '    if (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 12, false);
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 12));
                viewModel.type('\n', 'keyboard');
                model.forceTokenization(model.getLineCount());
                assertCursor(viewModel, new selection_1.Selection(2, 5, 2, 5));
                moveTo(editor, viewModel, 3, 16, false);
                assertCursor(viewModel, new selection_1.Selection(3, 16, 3, 16));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(3), '    if (true) {');
                assertCursor(viewModel, new selection_1.Selection(4, 9, 4, 9));
            });
        });
        test('Enter honors tabSize and insertSpaces 3', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '    if (true) {'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 12, false);
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 12));
                viewModel.type('\n', 'keyboard');
                model.forceTokenization(model.getLineCount());
                assertCursor(viewModel, new selection_1.Selection(2, 2, 2, 2));
                moveTo(editor, viewModel, 3, 16, false);
                assertCursor(viewModel, new selection_1.Selection(3, 16, 3, 16));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(3), '    if (true) {');
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
            });
        });
        test('Enter supports intentional indentation', () => {
            usingCursor({
                text: [
                    '\tif (true) {',
                    '\t\tswitch(true) {',
                    '\t\t\tcase true:',
                    '\t\t\t\tbreak;',
                    '\t\t}',
                    '\t}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false },
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 5, 4, false);
                assertCursor(viewModel, new selection_1.Selection(5, 4, 5, 4));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(5), '\t\t}');
                assertCursor(viewModel, new selection_1.Selection(6, 3, 6, 3));
            });
        });
        test('Enter should not adjust cursor position when press enter in the middle of a line 1', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 9, false);
                assertCursor(viewModel, new selection_1.Selection(3, 9, 3, 9));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
                assert.strictEqual(model.getLineContent(4), '\t\t true;', '001');
            });
        });
        test('Enter should not adjust cursor position when press enter in the middle of a line 2', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 3, false);
                assertCursor(viewModel, new selection_1.Selection(3, 3, 3, 3));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
                assert.strictEqual(model.getLineContent(4), '\t\treturn true;', '001');
            });
        });
        test('Enter should not adjust cursor position when press enter in the middle of a line 3', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '    return true;',
                    '  }a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 11, false);
                assertCursor(viewModel, new selection_1.Selection(3, 11, 3, 11));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 5, 4, 5));
                assert.strictEqual(model.getLineContent(4), '     true;', '001');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 1', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\tif (true) {',
                    '\t\treturn true;',
                    '\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 2, false);
                assertCursor(viewModel, new selection_1.Selection(3, 2, 3, 2));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 2, 4, 2));
                assert.strictEqual(model.getLineContent(4), '\t\treturn true;', '001');
                moveTo(editor, viewModel, 4, 1, false);
                assertCursor(viewModel, new selection_1.Selection(4, 1, 4, 1));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(5, 1, 5, 1));
                assert.strictEqual(model.getLineContent(5), '\t\treturn true;', '002');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 2', () => {
            usingCursor({
                text: [
                    '\tif (true) {',
                    '\t\tif (true) {',
                    '\t    \treturn true;',
                    '\t\t}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 4, false);
                assertCursor(viewModel, new selection_1.Selection(3, 4, 3, 4));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
                assert.strictEqual(model.getLineContent(4), '\t\t\treturn true;', '001');
                moveTo(editor, viewModel, 4, 1, false);
                assertCursor(viewModel, new selection_1.Selection(4, 1, 4, 1));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(5, 1, 5, 1));
                assert.strictEqual(model.getLineContent(5), '\t\t\treturn true;', '002');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 3', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '    return true;',
                    '}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 2, false);
                assertCursor(viewModel, new selection_1.Selection(3, 2, 3, 2));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 2, 4, 2));
                assert.strictEqual(model.getLineContent(4), '    return true;', '001');
                moveTo(editor, viewModel, 4, 3, false);
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(5, 3, 5, 3));
                assert.strictEqual(model.getLineContent(5), '    return true;', '002');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 4', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '\t  return true;',
                    '}a}',
                    '',
                    'if (true) {',
                    '  if (true) {',
                    '\t  return true;',
                    '}a}'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: {
                    tabSize: 2,
                    indentSize: 2
                }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 3, false);
                assertCursor(viewModel, new selection_1.Selection(3, 3, 3, 3));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 4, 4, 4));
                assert.strictEqual(model.getLineContent(4), '    return true;', '001');
                moveTo(editor, viewModel, 9, 4, false);
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(10, 5, 10, 5));
                assert.strictEqual(model.getLineContent(10), '    return true;', '001');
            });
        });
        test('Enter should adjust cursor position when press enter in the middle of leading whitespaces 5', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '  if (true) {',
                    '    return true;',
                    '    return true;',
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                modelOpts: { tabSize: 2 }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 5, false);
                moveTo(editor, viewModel, 4, 3, true);
                assertCursor(viewModel, new selection_1.Selection(3, 5, 4, 3));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
                assert.strictEqual(model.getLineContent(4), '    return true;', '001');
            });
        });
        test('issue microsoft/monaco-editor#108 part 1/2: Auto indentation on Enter with selection is half broken', () => {
            usingCursor({
                text: [
                    'function baz() {',
                    '\tvar x = 1;',
                    '\t\t\t\t\t\t\treturn x;',
                    '}'
                ],
                modelOpts: {
                    insertSpaces: false,
                },
                languageIdentifier: mode.getLanguageIdentifier(),
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 8, false);
                moveTo(editor, viewModel, 2, 12, true);
                assertCursor(viewModel, new selection_1.Selection(3, 8, 2, 12));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(3), '\treturn x;');
                assertCursor(viewModel, new position_1.Position(3, 2));
            });
        });
        test('issue microsoft/monaco-editor#108 part 2/2: Auto indentation on Enter with selection is half broken', () => {
            usingCursor({
                text: [
                    'function baz() {',
                    '\tvar x = 1;',
                    '\t\t\t\t\t\t\treturn x;',
                    '}'
                ],
                modelOpts: {
                    insertSpaces: false,
                },
                languageIdentifier: mode.getLanguageIdentifier(),
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 12, false);
                moveTo(editor, viewModel, 3, 8, true);
                assertCursor(viewModel, new selection_1.Selection(2, 12, 3, 8));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(3), '\treturn x;');
                assertCursor(viewModel, new position_1.Position(3, 2));
            });
        });
        test('onEnter works if there are no indentation rules', () => {
            usingCursor({
                text: [
                    '<?',
                    '\tif (true) {',
                    '\t\techo $hi;',
                    '\t\techo $bye;',
                    '\t}',
                    '?>'
                ],
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 5, 3, false);
                assertCursor(viewModel, new selection_1.Selection(5, 3, 5, 3));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getLineContent(6), '\t');
                assertCursor(viewModel, new selection_1.Selection(6, 2, 6, 2));
                assert.strictEqual(model.getLineContent(5), '\t}');
            });
        });
        test('onEnter works if there are no indentation rules 2', () => {
            usingCursor({
                text: [
                    '	if (5)',
                    '		return 5;',
                    '	'
                ],
                modelOpts: { insertSpaces: false }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 2, false);
                assertCursor(viewModel, new selection_1.Selection(3, 2, 3, 2));
                viewModel.type('\n', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(4, 2, 4, 2));
                assert.strictEqual(model.getLineContent(4), '\t');
            });
        });
        test('bug #16543: Tab should indent to correct indentation spot immediately', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'function baz() {',
                '\tfunction hello() { // something here',
                '\t',
                '',
                '\t}',
                '}'
            ].join('\n'), {
                insertSpaces: false,
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 4, 1, false);
                assertCursor(viewModel, new selection_1.Selection(4, 1, 4, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(4), '\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (1): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '\t',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                insertSpaces: false,
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 4, 2, false);
                assertCursor(viewModel, new selection_1.Selection(4, 2, 4, 2));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(4), '\t\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (2): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '    ',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                insertSpaces: false,
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 4, 1, false);
                assertCursor(viewModel, new selection_1.Selection(4, 1, 4, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(4), '\t\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (3): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '\t\t\t',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                insertSpaces: false,
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 4, 3, false);
                assertCursor(viewModel, new selection_1.Selection(4, 3, 4, 3));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(4), '\t\t\t\t');
            });
            model.dispose();
        });
        test('bug #2938 (4): When pressing Tab on white-space only lines, indent straight to the right spot (similar to empty lines)', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                '\tfunction baz() {',
                '\t\tfunction hello() { // something here',
                '\t\t',
                '\t\t\t\t',
                '\t\t}',
                '\t}'
            ].join('\n'), {
                insertSpaces: false,
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 4, 4, false);
                assertCursor(viewModel, new selection_1.Selection(4, 4, 4, 4));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(4), '\t\t\t\t\t');
            });
            model.dispose();
        });
        test('bug #31015: When pressing Tab on lines and Enter rules are avail, indent straight to the right spotTab', () => {
            let mode = new OnEnterMode(languageConfiguration_1.IndentAction.Indent);
            let model = (0, editorTestUtils_1.createTextModel)([
                '    if (a) {',
                '        ',
                '',
                '',
                '    }'
            ].join('\n'), undefined, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                moveTo(editor, viewModel, 3, 1);
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), '    if (a) {');
                assert.strictEqual(model.getLineContent(2), '        ');
                assert.strictEqual(model.getLineContent(3), '        ');
                assert.strictEqual(model.getLineContent(4), '');
                assert.strictEqual(model.getLineContent(5), '    }');
            });
            model.dispose();
        });
        test('type honors indentation rules: ruby keywords', () => {
            let rubyMode = new IndentRulesMode({
                increaseIndentPattern: /^\s*((begin|class|def|else|elsif|ensure|for|if|module|rescue|unless|until|when|while)|(.*\sdo\b))\b[^\{;]*$/,
                decreaseIndentPattern: /^\s*([}\]]([,)]?\s*(#|$)|\.[a-zA-Z_]\w*\b)|(end|rescue|ensure|else|elsif|when)\b)/
            });
            let model = (0, editorTestUtils_1.createTextModel)([
                'class Greeter',
                '  def initialize(name)',
                '    @name = name',
                '    en'
            ].join('\n'), undefined, rubyMode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, autoIndent: 'full' }, (editor, viewModel) => {
                moveTo(editor, viewModel, 4, 7, false);
                assertCursor(viewModel, new selection_1.Selection(4, 7, 4, 7));
                viewModel.type('d', 'keyboard');
                assert.strictEqual(model.getLineContent(4), '  end');
            });
            rubyMode.dispose();
            model.dispose();
        });
        test('Auto indent on type: increaseIndentPattern has higher priority than decreaseIndent when inheriting', () => {
            usingCursor({
                text: [
                    '\tif (true) {',
                    '\t\tconsole.log();',
                    '\t} else if {',
                    '\t\tconsole.log()',
                    '\t}'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 5, 3, false);
                assertCursor(viewModel, new selection_1.Selection(5, 3, 5, 3));
                viewModel.type('e', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(5, 4, 5, 4));
                assert.strictEqual(model.getLineContent(5), '\t}e', 'This line should not decrease indent');
            });
        });
        test('type honors users indentation adjustment', () => {
            usingCursor({
                text: [
                    '\tif (true ||',
                    '\t ) {',
                    '\t}',
                    'if (true ||',
                    ') {',
                    '}'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 3, false);
                assertCursor(viewModel, new selection_1.Selection(2, 3, 2, 3));
                viewModel.type(' ', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(2, 4, 2, 4));
                assert.strictEqual(model.getLineContent(2), '\t  ) {', 'This line should not decrease indent');
            });
        });
        test('bug 29972: if a line is line comment, open bracket should not indent next line', () => {
            usingCursor({
                text: [
                    'if (true) {',
                    '\t// {',
                    '\t\t'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 3, false);
                assertCursor(viewModel, new selection_1.Selection(3, 3, 3, 3));
                viewModel.type('}', 'keyboard');
                assertCursor(viewModel, new selection_1.Selection(3, 2, 3, 2));
                assert.strictEqual(model.getLineContent(3), '}');
            });
        });
        test('issue #36090: JS: editor.autoIndent seems to be broken', () => {
            class JSMode extends mockMode_1.MockMode {
                constructor() {
                    super(JSMode._id);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        brackets: [
                            ['{', '}'],
                            ['[', ']'],
                            ['(', ')']
                        ],
                        indentationRules: {
                            // ^(.*\*/)?\s*\}.*$
                            decreaseIndentPattern: /^((?!.*?\/\*).*\*\/)?\s*[\}\]\)].*$/,
                            // ^.*\{[^}"']*$
                            increaseIndentPattern: /^((?!\/\/).)*(\{[^}"'`]*|\([^)"'`]*|\[[^\]"'`]*)$/
                        },
                        onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
                    }));
                }
            }
            JSMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
            let mode = new JSMode();
            let model = (0, editorTestUtils_1.createTextModel)([
                'class ItemCtrl {',
                '    getPropertiesByItemId(id) {',
                '        return this.fetchItem(id)',
                '            .then(item => {',
                '                return this.getPropertiesOfItem(item);',
                '            });',
                '    }',
                '}',
            ].join('\n'), undefined, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, autoIndent: 'advanced' }, (editor, viewModel) => {
                moveTo(editor, viewModel, 7, 6, false);
                assertCursor(viewModel, new selection_1.Selection(7, 6, 7, 6));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(), [
                    'class ItemCtrl {',
                    '    getPropertiesByItemId(id) {',
                    '        return this.fetchItem(id)',
                    '            .then(item => {',
                    '                return this.getPropertiesOfItem(item);',
                    '            });',
                    '    }',
                    '    ',
                    '}',
                ].join('\n'));
                assertCursor(viewModel, new selection_1.Selection(8, 5, 8, 5));
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #115304: OnEnter broken for TS', () => {
            class JSMode extends mockMode_1.MockMode {
                constructor() {
                    super(JSMode._id);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
                    }));
                }
            }
            JSMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
            const mode = new JSMode();
            const model = (0, editorTestUtils_1.createTextModel)([
                '/** */',
                'function f() {}',
            ].join('\n'), undefined, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, autoIndent: 'advanced' }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 4, false);
                assertCursor(viewModel, new selection_1.Selection(1, 4, 1, 4));
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(), [
                    '/**',
                    ' * ',
                    ' */',
                    'function f() {}',
                ].join('\n'));
                assertCursor(viewModel, new selection_1.Selection(2, 4, 2, 4));
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #38261: TAB key results in bizarre indentation in C++ mode ', () => {
            class CppMode extends mockMode_1.MockMode {
                constructor() {
                    super(CppMode._id);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        brackets: [
                            ['{', '}'],
                            ['[', ']'],
                            ['(', ')']
                        ],
                        indentationRules: {
                            increaseIndentPattern: new RegExp('^.*\\{[^}\"\\\']*$|^.*\\([^\\)\"\\\']*$|^\\s*(public|private|protected):\\s*$|^\\s*@(public|private|protected)\\s*$|^\\s*\\{\\}$'),
                            decreaseIndentPattern: new RegExp('^\\s*(\\s*/[*].*[*]/\\s*)*\\}|^\\s*(\\s*/[*].*[*]/\\s*)*\\)|^\\s*(public|private|protected):\\s*$|^\\s*@(public|private|protected)\\s*$'),
                        }
                    }));
                }
            }
            CppMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
            let mode = new CppMode();
            let model = (0, editorTestUtils_1.createTextModel)([
                'int main() {',
                '  return 0;',
                '}',
                '',
                'bool Foo::bar(const string &a,',
                '              const string &b) {',
                '  foo();',
                '',
                ')',
            ].join('\n'), {
                tabSize: 2,
                indentSize: 2
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, autoIndent: 'advanced' }, (editor, viewModel) => {
                moveTo(editor, viewModel, 8, 1, false);
                assertCursor(viewModel, new selection_1.Selection(8, 1, 8, 1));
                coreCommands_1.CoreEditingCommands.Tab.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), [
                    'int main() {',
                    '  return 0;',
                    '}',
                    '',
                    'bool Foo::bar(const string &a,',
                    '              const string &b) {',
                    '  foo();',
                    '  ',
                    ')',
                ].join('\n'));
                assert.deepStrictEqual(viewModel.getSelection(), new selection_1.Selection(8, 3, 8, 3));
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #57197: indent rules regex should be stateless', () => {
            usingCursor({
                text: [
                    'Project:',
                ],
                languageIdentifier: (new IndentRulesMode({
                    decreaseIndentPattern: /^\s*}$/gm,
                    increaseIndentPattern: /^(?![^\S\n]*(?!--|––|——)(?:[-❍❑■⬜□☐▪▫–—≡→›✘xX✔✓☑+]|\[[ xX+-]?\])\s[^\n]*)[^\S\n]*(.+:)[^\S\n]*(?:(?=@[^\s*~(]+(?::\/\/[^\s*~(:]+)?(?:\([^)]*\))?)|$)/gm,
                })).getLanguageIdentifier(),
                modelOpts: { insertSpaces: false },
                editorOpts: { autoIndent: 'full' }
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 9, false);
                assertCursor(viewModel, new selection_1.Selection(1, 9, 1, 9));
                viewModel.type('\n', 'keyboard');
                model.forceTokenization(model.getLineCount());
                assertCursor(viewModel, new selection_1.Selection(2, 2, 2, 2));
                moveTo(editor, viewModel, 1, 9, false);
                assertCursor(viewModel, new selection_1.Selection(1, 9, 1, 9));
                viewModel.type('\n', 'keyboard');
                model.forceTokenization(model.getLineCount());
                assertCursor(viewModel, new selection_1.Selection(2, 2, 2, 2));
            });
        });
        test('', () => {
            class JSONMode extends mockMode_1.MockMode {
                constructor() {
                    super(JSONMode._id);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        brackets: [
                            ['{', '}'],
                            ['[', ']'],
                            ['(', ')']
                        ],
                        indentationRules: {
                            increaseIndentPattern: new RegExp('^.*\\{[^}\"\\\']*$|^.*\\([^\\)\"\\\']*$|^\\s*(public|private|protected):\\s*$|^\\s*@(public|private|protected)\\s*$|^\\s*\\{\\}$'),
                            decreaseIndentPattern: new RegExp('^\\s*(\\s*/[*].*[*]/\\s*)*\\}|^\\s*(\\s*/[*].*[*]/\\s*)*\\)|^\\s*(public|private|protected):\\s*$|^\\s*@(public|private|protected)\\s*$'),
                        }
                    }));
                }
            }
            JSONMode._id = new modes_1.LanguageIdentifier('indentRulesMode', 4);
            let mode = new JSONMode();
            let model = (0, editorTestUtils_1.createTextModel)([
                '{',
                '  "scripts: {"',
                '    "watch": "a {"',
                '    "build{": "b"',
                '    "tasks": []',
                '    "tasks": ["a"]',
                '  "}"',
                '"}"'
            ].join('\n'), {
                tabSize: 2,
                indentSize: 2
            }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, autoIndent: 'full' }, (editor, viewModel) => {
                moveTo(editor, viewModel, 3, 19, false);
                assertCursor(viewModel, new selection_1.Selection(3, 19, 3, 19));
                viewModel.type('\n', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(4), '    ');
                moveTo(editor, viewModel, 5, 18, false);
                assertCursor(viewModel, new selection_1.Selection(5, 18, 5, 18));
                viewModel.type('\n', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(6), '    ');
                moveTo(editor, viewModel, 7, 15, false);
                assertCursor(viewModel, new selection_1.Selection(7, 15, 7, 15));
                viewModel.type('\n', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(8), '      ');
                assert.deepStrictEqual(model.getLineContent(9), '    ]');
                moveTo(editor, viewModel, 10, 18, false);
                assertCursor(viewModel, new selection_1.Selection(10, 18, 10, 18));
                viewModel.type('\n', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(11), '    ]');
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #111128: Multicursor `Enter` issue with indentation', () => {
            const model = (0, editorTestUtils_1.createTextModel)('    let a, b, c;', { detectIndentation: false, insertSpaces: false, tabSize: 4 }, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelections([
                    new selection_1.Selection(1, 11, 1, 11),
                    new selection_1.Selection(1, 14, 1, 14),
                ]);
                viewModel.type('\n', 'keyboard');
                assert.strictEqual(model.getValue(), '    let a,\n\t b,\n\t c;');
            });
        });
        test('issue #122714: tabSize=1 prevent typing a string matching decreaseIndentPattern in an empty file', () => {
            let latexMode = new IndentRulesMode({
                increaseIndentPattern: new RegExp('\\\\begin{(?!document)([^}]*)}(?!.*\\\\end{\\1})'),
                decreaseIndentPattern: new RegExp('^\\s*\\\\end{(?!document)')
            });
            let model = (0, editorTestUtils_1.createTextModel)('\\end', { tabSize: 1 }, latexMode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model, autoIndent: 'full' }, (editor, viewModel) => {
                moveTo(editor, viewModel, 1, 5, false);
                assertCursor(viewModel, new selection_1.Selection(1, 5, 1, 5));
                viewModel.type('{', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '\\end{}');
            });
            latexMode.dispose();
            model.dispose();
        });
    });
    function usingCursor(opts, callback) {
        const model = (0, editorTestUtils_1.createTextModel)(opts.text.join('\n'), opts.modelOpts, opts.languageIdentifier);
        const editorOptions = opts.editorOpts || {};
        editorOptions.model = model;
        (0, testCodeEditor_1.withTestCodeEditor)(null, editorOptions, (editor, viewModel) => {
            callback(editor, model, viewModel);
        });
    }
    class ElectricCharMode extends mockMode_1.MockMode {
        constructor() {
            super(ElectricCharMode._id);
            this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                __electricCharacterSupport: {
                    docComment: { open: '/**', close: ' */' }
                },
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')']
                ]
            }));
        }
    }
    ElectricCharMode._id = new modes_1.LanguageIdentifier('electricCharMode', 3);
    suite('ElectricCharacter', () => {
        test('does nothing if no electric char', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 1);
                viewModel.type('*', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '*');
            });
            mode.dispose();
        });
        test('indents in order to match bracket', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 1);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '  }');
            });
            mode.dispose();
        });
        test('unindents in order to match bracket', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '    '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 5);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '  }');
            });
            mode.dispose();
        });
        test('matches with correct bracket', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '    if (b) {',
                    '    }',
                    '    '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 4, 1);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(4), '  }    ');
            });
            mode.dispose();
        });
        test('does nothing if bracket does not match', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '    if (b) {',
                    '    }',
                    '  }  '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 4, 6);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(4), '  }  }');
            });
            mode.dispose();
        });
        test('matches bracket even in line with content', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '// hello'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 1);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '  }// hello');
            });
            mode.dispose();
        });
        test('is no-op if bracket is lined up', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '  '
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 3);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '  }');
            });
            mode.dispose();
        });
        test('is no-op if there is non-whitespace text before', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    'a'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 2);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), 'a}');
            });
            mode.dispose();
        });
        test('is no-op if pairs are all matched before', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    'foo(() => {',
                    '  ( 1 + 2 ) ',
                    '})'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 13);
                viewModel.type('*', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '  ( 1 + 2 ) *');
            });
            mode.dispose();
        });
        test('is no-op if matching bracket is on the same line', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '(div',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 1, 5);
                let changeText = null;
                model.onDidChangeContent(e => {
                    changeText = e.changes[0].text;
                });
                viewModel.type(')', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(1), '(div)');
                assert.deepStrictEqual(changeText, ')');
            });
            mode.dispose();
        });
        test('is no-op if the line has other content', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    'Math.max(',
                    '\t2',
                    '\t3'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 3, 3);
                viewModel.type(')', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(3), '\t3)');
            });
            mode.dispose();
        });
        test('appends text', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '/*'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 3);
                viewModel.type('*', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '/** */');
            });
            mode.dispose();
        });
        test('appends text 2', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '  if (a) {',
                    '  /*'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 5);
                viewModel.type('*', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '  /** */');
            });
            mode.dispose();
        });
        test('issue #23711: Replacing selected text with )]} fails to delete old text with backwards-dragged selection', () => {
            let mode = new ElectricCharMode();
            usingCursor({
                text: [
                    '{',
                    'word'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                moveTo(editor, viewModel, 2, 5);
                moveTo(editor, viewModel, 2, 1, true);
                viewModel.type('}', 'keyboard');
                assert.deepStrictEqual(model.getLineContent(2), '}');
            });
            mode.dispose();
        });
    });
    suite('autoClosingPairs', () => {
        class AutoClosingMode extends mockMode_1.MockMode {
            constructor() {
                super(AutoClosingMode._id);
                this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                    autoClosingPairs: [
                        { open: '{', close: '}' },
                        { open: '[', close: ']' },
                        { open: '(', close: ')' },
                        { open: '\'', close: '\'', notIn: ['string', 'comment'] },
                        { open: '\"', close: '\"', notIn: ['string'] },
                        { open: '`', close: '`', notIn: ['string', 'comment'] },
                        { open: '/**', close: ' */', notIn: ['string'] },
                        { open: 'begin', close: 'end', notIn: ['string'] }
                    ],
                    __electricCharacterSupport: {
                        docComment: { open: '/**', close: ' */' }
                    }
                }));
            }
            setAutocloseEnabledSet(chars) {
                this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                    autoCloseBefore: chars,
                    autoClosingPairs: [
                        { open: '{', close: '}' },
                        { open: '[', close: ']' },
                        { open: '(', close: ')' },
                        { open: '\'', close: '\'', notIn: ['string', 'comment'] },
                        { open: '\"', close: '\"', notIn: ['string'] },
                        { open: '`', close: '`', notIn: ['string', 'comment'] },
                        { open: '/**', close: ' */', notIn: ['string'] }
                    ],
                }));
            }
        }
        AutoClosingMode._id = new modes_1.LanguageIdentifier('autoClosingMode', 5);
        let ColumnType;
        (function (ColumnType) {
            ColumnType[ColumnType["Normal"] = 0] = "Normal";
            ColumnType[ColumnType["Special1"] = 1] = "Special1";
            ColumnType[ColumnType["Special2"] = 2] = "Special2";
        })(ColumnType || (ColumnType = {}));
        function extractSpecialColumns(maxColumn, annotatedLine) {
            let result = [];
            for (let j = 1; j <= maxColumn; j++) {
                result[j] = 0 /* Normal */;
            }
            let column = 1;
            for (let j = 0; j < annotatedLine.length; j++) {
                if (annotatedLine.charAt(j) === '|') {
                    result[column] = 1 /* Special1 */;
                }
                else if (annotatedLine.charAt(j) === '!') {
                    result[column] = 2 /* Special2 */;
                }
                else {
                    column++;
                }
            }
            return result;
        }
        function assertType(editor, model, viewModel, lineNumber, column, chr, expectedInsert, message) {
            let lineContent = model.getLineContent(lineNumber);
            let expected = lineContent.substr(0, column - 1) + expectedInsert + lineContent.substr(column - 1);
            moveTo(editor, viewModel, lineNumber, column);
            viewModel.type(chr, 'keyboard');
            assert.deepStrictEqual(model.getLineContent(lineNumber), expected, message);
            model.undo();
        }
        test('open parens: default', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                let autoClosePositions = [
                    'var| a| |=| [|]|;|',
                    'var| b| |=| `asd`|;|',
                    'var| c| |=| \'asd\'|;|',
                    'var| d| |=| "asd"|;|',
                    'var| e| |=| /*3*/|	3|;|',
                    'var| f| |=| /**| 3| */3|;|',
                    'var| g| |=| (3+5|)|;|',
                    'var| h| |=| {| a|:| \'value\'| |}|;|',
                ];
                for (let i = 0, len = autoClosePositions.length; i < len; i++) {
                    const lineNumber = i + 1;
                    const autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (let column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '()', `auto closes @ (${lineNumber}, ${column})`);
                        }
                        else {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '(', `does not auto close @ (${lineNumber}, ${column})`);
                        }
                    }
                }
            });
            mode.dispose();
        });
        test('open parens: whitespace', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoClosingBrackets: 'beforeWhitespace'
                }
            }, (editor, model, viewModel) => {
                let autoClosePositions = [
                    'var| a| =| [|];|',
                    'var| b| =| `asd`;|',
                    'var| c| =| \'asd\';|',
                    'var| d| =| "asd";|',
                    'var| e| =| /*3*/|	3;|',
                    'var| f| =| /**| 3| */3;|',
                    'var| g| =| (3+5|);|',
                    'var| h| =| {| a:| \'value\'| |};|',
                ];
                for (let i = 0, len = autoClosePositions.length; i < len; i++) {
                    const lineNumber = i + 1;
                    const autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (let column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '()', `auto closes @ (${lineNumber}, ${column})`);
                        }
                        else {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '(', `does not auto close @ (${lineNumber}, ${column})`);
                        }
                    }
                }
            });
            mode.dispose();
        });
        test('open parens disabled/enabled open quotes enabled/disabled', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = [];',
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoClosingBrackets: 'beforeWhitespace',
                    autoClosingQuotes: 'never'
                }
            }, (editor, model, viewModel) => {
                let autoClosePositions = [
                    'var| a| =| [|];|',
                ];
                for (let i = 0, len = autoClosePositions.length; i < len; i++) {
                    const lineNumber = i + 1;
                    const autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (let column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '()', `auto closes @ (${lineNumber}, ${column})`);
                        }
                        else {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '(', `does not auto close @ (${lineNumber}, ${column})`);
                        }
                        assertType(editor, model, viewModel, lineNumber, column, '\'', '\'', `does not auto close @ (${lineNumber}, ${column})`);
                    }
                }
            });
            usingCursor({
                text: [
                    'var b = [];',
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoClosingBrackets: 'never',
                    autoClosingQuotes: 'beforeWhitespace'
                }
            }, (editor, model, viewModel) => {
                let autoClosePositions = [
                    'var b =| [|];|',
                ];
                for (let i = 0, len = autoClosePositions.length; i < len; i++) {
                    const lineNumber = i + 1;
                    const autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (let column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '\'', '\'\'', `auto closes @ (${lineNumber}, ${column})`);
                        }
                        else {
                            assertType(editor, model, viewModel, lineNumber, column, '\'', '\'', `does not auto close @ (${lineNumber}, ${column})`);
                        }
                        assertType(editor, model, viewModel, lineNumber, column, '(', '(', `does not auto close @ (${lineNumber}, ${column})`);
                    }
                }
            });
            mode.dispose();
        });
        test('configurable open parens', () => {
            let mode = new AutoClosingMode();
            mode.setAutocloseEnabledSet('abc');
            usingCursor({
                text: [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoClosingBrackets: 'languageDefined'
                }
            }, (editor, model, viewModel) => {
                let autoClosePositions = [
                    'v|ar |a = [|];|',
                    'v|ar |b = `|asd`;|',
                    'v|ar |c = \'|asd\';|',
                    'v|ar d = "|asd";|',
                    'v|ar e = /*3*/	3;|',
                    'v|ar f = /** 3| */3;|',
                    'v|ar g = (3+5|);|',
                    'v|ar h = { |a: \'v|alue\' |};|',
                ];
                for (let i = 0, len = autoClosePositions.length; i < len; i++) {
                    const lineNumber = i + 1;
                    const autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (let column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '()', `auto closes @ (${lineNumber}, ${column})`);
                        }
                        else {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '(', `does not auto close @ (${lineNumber}, ${column})`);
                        }
                    }
                }
            });
            mode.dispose();
        });
        test('auto-pairing can be disabled', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoClosingBrackets: 'never',
                    autoClosingQuotes: 'never'
                }
            }, (editor, model, viewModel) => {
                let autoClosePositions = [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ];
                for (let i = 0, len = autoClosePositions.length; i < len; i++) {
                    const lineNumber = i + 1;
                    const autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (let column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '()', `auto closes @ (${lineNumber}, ${column})`);
                            assertType(editor, model, viewModel, lineNumber, column, '"', '""', `auto closes @ (${lineNumber}, ${column})`);
                        }
                        else {
                            assertType(editor, model, viewModel, lineNumber, column, '(', '(', `does not auto close @ (${lineNumber}, ${column})`);
                            assertType(editor, model, viewModel, lineNumber, column, '"', '"', `does not auto close @ (${lineNumber}, ${column})`);
                        }
                    }
                }
            });
            mode.dispose();
        });
        test('auto wrapping is configurable', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = asd'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 4),
                    new selection_1.Selection(1, 9, 1, 12),
                ]);
                // type a `
                viewModel.type('`', 'keyboard');
                assert.strictEqual(model.getValue(), '`var` a = `asd`');
                // type a (
                viewModel.type('(', 'keyboard');
                assert.strictEqual(model.getValue(), '`(var)` a = `(asd)`');
            });
            usingCursor({
                text: [
                    'var a = asd'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoSurround: 'never'
                }
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 4),
                ]);
                // type a `
                viewModel.type('`', 'keyboard');
                assert.strictEqual(model.getValue(), '` a = asd');
            });
            usingCursor({
                text: [
                    'var a = asd'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoSurround: 'quotes'
                }
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 4),
                ]);
                // type a `
                viewModel.type('`', 'keyboard');
                assert.strictEqual(model.getValue(), '`var` a = asd');
                // type a (
                viewModel.type('(', 'keyboard');
                assert.strictEqual(model.getValue(), '`(` a = asd');
            });
            usingCursor({
                text: [
                    'var a = asd'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoSurround: 'brackets'
                }
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 1, 1, 4),
                ]);
                // type a (
                viewModel.type('(', 'keyboard');
                assert.strictEqual(model.getValue(), '(var) a = asd');
                // type a `
                viewModel.type('`', 'keyboard');
                assert.strictEqual(model.getValue(), '(`) a = asd');
            });
            mode.dispose();
        });
        test('quote', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = [];',
                    'var b = `asd`;',
                    'var c = \'asd\';',
                    'var d = "asd";',
                    'var e = /*3*/	3;',
                    'var f = /** 3 */3;',
                    'var g = (3+5);',
                    'var h = { a: \'value\' };',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                let autoClosePositions = [
                    'var a |=| [|]|;|',
                    'var b |=| `asd`|;|',
                    'var c |=| \'asd\'|;|',
                    'var d |=| "asd"|;|',
                    'var e |=| /*3*/|	3;|',
                    'var f |=| /**| 3 */3;|',
                    'var g |=| (3+5)|;|',
                    'var h |=| {| a:| \'value\'| |}|;|',
                ];
                for (let i = 0, len = autoClosePositions.length; i < len; i++) {
                    const lineNumber = i + 1;
                    const autoCloseColumns = extractSpecialColumns(model.getLineMaxColumn(lineNumber), autoClosePositions[i]);
                    for (let column = 1; column < autoCloseColumns.length; column++) {
                        model.forceTokenization(lineNumber);
                        if (autoCloseColumns[column] === 1 /* Special1 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '\'', '\'\'', `auto closes @ (${lineNumber}, ${column})`);
                        }
                        else if (autoCloseColumns[column] === 2 /* Special2 */) {
                            assertType(editor, model, viewModel, lineNumber, column, '\'', '', `over types @ (${lineNumber}, ${column})`);
                        }
                        else {
                            assertType(editor, model, viewModel, lineNumber, column, '\'', '\'', `does not auto close @ (${lineNumber}, ${column})`);
                        }
                    }
                }
            });
            mode.dispose();
        });
        test('multi-character autoclose', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                model.setValue('begi');
                viewModel.setSelections('test', [new selection_1.Selection(1, 5, 1, 5)]);
                viewModel.type('n', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'beginend');
                model.setValue('/*');
                viewModel.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                viewModel.type('*', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '/** */');
            });
            mode.dispose();
        });
        test('issue #72177: multi-character autoclose with conflicting patterns', () => {
            const languageId = new modes_1.LanguageIdentifier('autoClosingModeMultiChar', 5);
            class AutoClosingModeMultiChar extends mockMode_1.MockMode {
                constructor() {
                    super(languageId);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        autoClosingPairs: [
                            { open: '(', close: ')' },
                            { open: '(*', close: '*)' },
                            { open: '<@', close: '@>' },
                            { open: '<@@', close: '@@>' },
                        ],
                    }));
                }
            }
            const mode = new AutoClosingModeMultiChar();
            usingCursor({
                text: [
                    '',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.type('(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '()');
                viewModel.type('*', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '(**)', `doesn't add entire close when already closed substring is there`);
                model.setValue('(');
                viewModel.setSelections('test', [new selection_1.Selection(1, 2, 1, 2)]);
                viewModel.type('*', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '(**)', `does add entire close if not already there`);
                model.setValue('');
                viewModel.type('<@', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '<@@>');
                viewModel.type('@', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '<@@@@>', `autocloses when before multi-character closing brace`);
                viewModel.type('(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '<@@()@@>', `autocloses when before multi-character closing brace`);
            });
            mode.dispose();
        });
        test('issue #55314: Do not auto-close when ending with open', () => {
            const languageId = new modes_1.LanguageIdentifier('myElectricMode', 5);
            class ElectricMode extends mockMode_1.MockMode {
                constructor() {
                    super(languageId);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        autoClosingPairs: [
                            { open: '{', close: '}' },
                            { open: '[', close: ']' },
                            { open: '(', close: ')' },
                            { open: '\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: '\"', close: '\"', notIn: ['string'] },
                            { open: 'B\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: '`', close: '`', notIn: ['string', 'comment'] },
                            { open: '/**', close: ' */', notIn: ['string'] }
                        ],
                    }));
                }
            }
            const mode = new ElectricMode();
            usingCursor({
                text: [
                    'little goat',
                    'little LAMB',
                    'little sheep',
                    'Big LAMB'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                model.forceTokenization(model.getLineCount());
                assertType(editor, model, viewModel, 1, 4, '"', '"', `does not double quote when ending with open`);
                model.forceTokenization(model.getLineCount());
                assertType(editor, model, viewModel, 2, 4, '"', '"', `does not double quote when ending with open`);
                model.forceTokenization(model.getLineCount());
                assertType(editor, model, viewModel, 3, 4, '"', '"', `does not double quote when ending with open`);
                model.forceTokenization(model.getLineCount());
                assertType(editor, model, viewModel, 4, 2, '"', '"', `does not double quote when ending with open`);
                model.forceTokenization(model.getLineCount());
                assertType(editor, model, viewModel, 4, 3, '"', '"', `does not double quote when ending with open`);
            });
            mode.dispose();
        });
        test('issue #27937: Trying to add an item to the front of a list is cumbersome', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var arr = ["b", "c"];'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertType(editor, model, viewModel, 1, 12, '"', '"', `does not over type and will not auto close`);
            });
            mode.dispose();
        });
        test('issue #25658 - Do not auto-close single/double quotes after word characters', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                function typeCharacters(viewModel, chars) {
                    for (let i = 0, len = chars.length; i < len; i++) {
                        viewModel.type(chars[i], 'keyboard');
                    }
                }
                // First gif
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste1 = teste\' ok');
                assert.strictEqual(model.getLineContent(1), 'teste1 = teste\' ok');
                viewModel.setSelections('test', [new selection_1.Selection(1, 1000, 1, 1000)]);
                typeCharacters(viewModel, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste2 = teste \'ok');
                assert.strictEqual(model.getLineContent(2), 'teste2 = teste \'ok\'');
                viewModel.setSelections('test', [new selection_1.Selection(2, 1000, 2, 1000)]);
                typeCharacters(viewModel, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste3 = teste" ok');
                assert.strictEqual(model.getLineContent(3), 'teste3 = teste" ok');
                viewModel.setSelections('test', [new selection_1.Selection(3, 1000, 3, 1000)]);
                typeCharacters(viewModel, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste4 = teste "ok');
                assert.strictEqual(model.getLineContent(4), 'teste4 = teste "ok"');
                // Second gif
                viewModel.setSelections('test', [new selection_1.Selection(4, 1000, 4, 1000)]);
                typeCharacters(viewModel, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste \'');
                assert.strictEqual(model.getLineContent(5), 'teste \'\'');
                viewModel.setSelections('test', [new selection_1.Selection(5, 1000, 5, 1000)]);
                typeCharacters(viewModel, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste "');
                assert.strictEqual(model.getLineContent(6), 'teste ""');
                viewModel.setSelections('test', [new selection_1.Selection(6, 1000, 6, 1000)]);
                typeCharacters(viewModel, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste\'');
                assert.strictEqual(model.getLineContent(7), 'teste\'');
                viewModel.setSelections('test', [new selection_1.Selection(7, 1000, 7, 1000)]);
                typeCharacters(viewModel, '\n');
                model.forceTokenization(model.getLineCount());
                typeCharacters(viewModel, 'teste"');
                assert.strictEqual(model.getLineContent(8), 'teste"');
            });
            mode.dispose();
        });
        test('issue #37315 - overtypes only those characters that it inserted', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                    'y=();'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                viewModel.type('x=(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.type('asd', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=(asd)');
                // overtype!
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=(asd)');
                // do not overtype!
                viewModel.setSelections('test', [new selection_1.Selection(2, 4, 2, 4)]);
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(2), 'y=());');
            });
            mode.dispose();
        });
        test('issue #37315 - stops overtyping once cursor leaves area', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                    'y=();'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                viewModel.type('x=(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.setSelections('test', [new selection_1.Selection(1, 5, 1, 5)]);
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=())');
            });
            mode.dispose();
        });
        test('issue #37315 - it overtypes only once', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                    'y=();'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                viewModel.type('x=(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.setSelections('test', [new selection_1.Selection(1, 4, 1, 4)]);
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=())');
            });
            mode.dispose();
        });
        test('issue #37315 - it can remember multiple auto-closed instances', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                    'y=();'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                viewModel.type('x=(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.type('(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=(())');
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=(())');
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=(())');
            });
            mode.dispose();
        });
        test('issue #118270 - auto closing deletes only those characters that it inserted', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                    'y=();'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                viewModel.type('x=(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.type('asd', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=(asd)');
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'x=()');
                // delete closing char!
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'x=');
                // do not delete closing char!
                viewModel.setSelections('test', [new selection_1.Selection(2, 4, 2, 4)]);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'y=);');
            });
            mode.dispose();
        });
        test('issue #78527 - does not close quote on odd count', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'std::cout << \'"\' << entryMap'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 29, 1, 29)]);
                viewModel.type('[', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'std::cout << \'"\' << entryMap[]');
                viewModel.type('"', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'std::cout << \'"\' << entryMap[""]');
                viewModel.type('a', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'std::cout << \'"\' << entryMap["a"]');
                viewModel.type('"', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'std::cout << \'"\' << entryMap["a"]');
                viewModel.type(']', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'std::cout << \'"\' << entryMap["a"]');
            });
            mode.dispose();
        });
        test('issue #85983 - editor.autoClosingBrackets: beforeWhitespace is incorrect for Python', () => {
            const languageId = new modes_1.LanguageIdentifier('pythonMode', 5);
            class PythonMode extends mockMode_1.MockMode {
                constructor() {
                    super(languageId);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        autoClosingPairs: [
                            { open: '{', close: '}' },
                            { open: '[', close: ']' },
                            { open: '(', close: ')' },
                            { open: '\"', close: '\"', notIn: ['string'] },
                            { open: 'r\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: 'R\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: 'u\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: 'U\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: 'f\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: 'F\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: 'b\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: 'B\"', close: '\"', notIn: ['string', 'comment'] },
                            { open: '\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'r\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'R\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'u\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'U\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'f\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'F\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'b\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: 'B\'', close: '\'', notIn: ['string', 'comment'] },
                            { open: '`', close: '`', notIn: ['string'] }
                        ],
                    }));
                }
            }
            const mode = new PythonMode();
            usingCursor({
                text: [
                    'foo\'hello\''
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertType(editor, model, viewModel, 1, 4, '(', '(', `does not auto close @ (1, 4)`);
            });
            mode.dispose();
        });
        test('issue #78975 - Parentheses swallowing does not work when parentheses are inserted by autocomplete', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '<div id'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 8, 1, 8)]);
                viewModel.executeEdits('snippet', [{ range: new range_1.Range(1, 6, 1, 8), text: 'id=""' }], () => [new selection_1.Selection(1, 10, 1, 10)]);
                assert.strictEqual(model.getLineContent(1), '<div id=""');
                viewModel.type('a', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '<div id="a"');
                viewModel.type('"', 'keyboard');
                assert.strictEqual(model.getLineContent(1), '<div id="a"');
            });
            mode.dispose();
        });
        test('issue #78833 - Add config to use old brackets/quotes overtyping', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '',
                    'y=();'
                ],
                languageIdentifier: mode.getLanguageIdentifier(),
                editorOpts: {
                    autoClosingOvertype: 'always'
                }
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                viewModel.type('x=(', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.setSelections('test', [new selection_1.Selection(1, 4, 1, 4)]);
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'x=()');
                viewModel.setSelections('test', [new selection_1.Selection(2, 4, 2, 4)]);
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getLineContent(2), 'y=();');
            });
            mode.dispose();
        });
        test('issue #15825: accents on mac US intl keyboard', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                // Typing ` + e on the mac US intl kb layout
                viewModel.startComposition();
                viewModel.type('`', 'keyboard');
                viewModel.compositionType('è', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), 'è');
            });
            mode.dispose();
        });
        test('issue #90016: allow accents on mac US intl keyboard to surround selection', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'test'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 1, 1, 5)]);
                // Typing ` + e on the mac US intl kb layout
                viewModel.startComposition();
                viewModel.type('\'', 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), '\'test\'');
            });
            mode.dispose();
        });
        test('issue #53357: Over typing ignores characters after backslash', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'console.log();'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 13, 1, 13)]);
                viewModel.type('\'', 'keyboard');
                assert.strictEqual(model.getValue(), 'console.log(\'\');');
                viewModel.type('it', 'keyboard');
                assert.strictEqual(model.getValue(), 'console.log(\'it\');');
                viewModel.type('\\', 'keyboard');
                assert.strictEqual(model.getValue(), 'console.log(\'it\\\');');
                viewModel.type('\'', 'keyboard');
                assert.strictEqual(model.getValue(), 'console.log(\'it\\\'\');');
            });
            mode.dispose();
        });
        test('issue #84998: Overtyping Brackets doesn\'t work after backslash', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 1, 1, 1)]);
                viewModel.type('\\', 'keyboard');
                assert.strictEqual(model.getValue(), '\\');
                viewModel.type('(', 'keyboard');
                assert.strictEqual(model.getValue(), '\\()');
                viewModel.type('abc', 'keyboard');
                assert.strictEqual(model.getValue(), '\\(abc)');
                viewModel.type('\\', 'keyboard');
                assert.strictEqual(model.getValue(), '\\(abc\\)');
                viewModel.type(')', 'keyboard');
                assert.strictEqual(model.getValue(), '\\(abc\\)');
            });
            mode.dispose();
        });
        test('issue #2773: Accents (´`¨^, others?) are inserted in the wrong position (Mac)', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'hello',
                    'world'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                // Typing ` and pressing shift+down on the mac US intl kb layout
                // Here we're just replaying what the cursor gets
                viewModel.startComposition();
                viewModel.type('`', 'keyboard');
                moveDown(editor, viewModel, true);
                viewModel.compositionType('`', 1, 0, 0, 'keyboard');
                viewModel.compositionType('`', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), '`hello\nworld');
                assertCursor(viewModel, new selection_1.Selection(1, 2, 2, 2));
            });
            mode.dispose();
        });
        test('issue #26820: auto close quotes when not used as accents', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    ''
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                assertCursor(viewModel, new position_1.Position(1, 1));
                // on the mac US intl kb layout
                // Typing ' + space
                viewModel.startComposition();
                viewModel.type('\'', 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), '\'\'');
                // Typing one more ' + space
                viewModel.startComposition();
                viewModel.type('\'', 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), '\'\'');
                // Typing ' as a closing tag
                model.setValue('\'abc');
                viewModel.setSelections('test', [new selection_1.Selection(1, 5, 1, 5)]);
                viewModel.startComposition();
                viewModel.type('\'', 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), '\'abc\'');
                // quotes before the newly added character are all paired.
                model.setValue('\'abc\'def ');
                viewModel.setSelections('test', [new selection_1.Selection(1, 10, 1, 10)]);
                viewModel.startComposition();
                viewModel.type('\'', 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), '\'abc\'def \'\'');
                // No auto closing if there is non-whitespace character after the cursor
                model.setValue('abc');
                viewModel.setSelections('test', [new selection_1.Selection(1, 1, 1, 1)]);
                viewModel.startComposition();
                viewModel.type('\'', 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                // No auto closing if it's after a word.
                model.setValue('abc');
                viewModel.setSelections('test', [new selection_1.Selection(1, 4, 1, 4)]);
                viewModel.startComposition();
                viewModel.type('\'', 'keyboard');
                viewModel.compositionType('\'', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), 'abc\'');
            });
            mode.dispose();
        });
        test('issue #82701: auto close does not execute when IME is canceled via backspace', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    '{}'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 2, 1, 2)]);
                // Typing a + backspace
                viewModel.startComposition();
                viewModel.type('a', 'keyboard');
                viewModel.compositionType('', 1, 0, 0, 'keyboard');
                viewModel.endComposition('keyboard');
                assert.strictEqual(model.getValue(), '{}');
            });
            mode.dispose();
        });
        test('issue #20891: All cursors should do the same thing', () => {
            let mode = new AutoClosingMode();
            usingCursor({
                text: [
                    'var a = asd'
                ],
                languageIdentifier: mode.getLanguageIdentifier()
            }, (editor, model, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 9, 1, 9),
                    new selection_1.Selection(1, 12, 1, 12),
                ]);
                // type a `
                viewModel.type('`', 'keyboard');
                assert.strictEqual(model.getValue(), 'var a = `asd`');
            });
            mode.dispose();
        });
        test('issue #41825: Special handling of quotes in surrounding pairs', () => {
            const languageId = new modes_1.LanguageIdentifier('myMode', 3);
            class MyMode extends mockMode_1.MockMode {
                constructor() {
                    super(languageId);
                    this._register(languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(this.getLanguageIdentifier(), {
                        surroundingPairs: [
                            { open: '"', close: '"' },
                            { open: '\'', close: '\'' },
                        ]
                    }));
                }
            }
            const mode = new MyMode();
            const model = (0, editorTestUtils_1.createTextModel)('var x = \'hi\';', undefined, languageId);
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                editor.setSelections([
                    new selection_1.Selection(1, 9, 1, 10),
                    new selection_1.Selection(1, 12, 1, 13)
                ]);
                viewModel.type('"', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), 'var x = "hi";', 'assert1');
                editor.setSelections([
                    new selection_1.Selection(1, 9, 1, 10),
                    new selection_1.Selection(1, 12, 1, 13)
                ]);
                viewModel.type('\'', 'keyboard');
                assert.strictEqual(model.getValue(1 /* LF */), 'var x = \'hi\';', 'assert2');
            });
            model.dispose();
            mode.dispose();
        });
        test('All cursors should do the same thing when deleting left', () => {
            let mode = new AutoClosingMode();
            let model = (0, editorTestUtils_1.createTextModel)([
                'var a = ()'
            ].join('\n'), textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, mode.getLanguageIdentifier());
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(1, 4, 1, 4),
                    new selection_1.Selection(1, 10, 1, 10),
                ]);
                // delete left
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), 'va a = )');
            });
            model.dispose();
            mode.dispose();
        });
        test('issue #7100: Mouse word selection is strange when non-word character is at the end of line', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'before.a',
                'before',
                'hello:',
                'there:',
                'this is strange:',
                'here',
                'it',
                'is',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                coreCommands_1.CoreNavigationCommands.WordSelect.runEditorCommand(null, editor, {
                    position: new position_1.Position(3, 7)
                });
                assertCursor(viewModel, new selection_1.Selection(3, 7, 3, 7));
                coreCommands_1.CoreNavigationCommands.WordSelectDrag.runEditorCommand(null, editor, {
                    position: new position_1.Position(4, 7)
                });
                assertCursor(viewModel, new selection_1.Selection(3, 7, 4, 7));
            });
        });
    });
    suite('Undo stops', () => {
        test('there is an undo stop between typing and deleting left', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                viewModel.type('first', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'A first line');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A fir line');
                assertCursor(viewModel, new selection_1.Selection(1, 6, 1, 6));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A first line');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A  line');
                assertCursor(viewModel, new selection_1.Selection(1, 3, 1, 3));
            });
        });
        test('there is an undo stop between typing and deleting right', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                viewModel.type('first', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'A first line');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A firstine');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A first line');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A  line');
                assertCursor(viewModel, new selection_1.Selection(1, 3, 1, 3));
            });
        });
        test('there is an undo stop between deleting left and typing', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(2, 8, 2, 8)]);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), ' line');
                assertCursor(viewModel, new selection_1.Selection(2, 1, 2, 1));
                viewModel.type('Second', 'keyboard');
                assert.strictEqual(model.getLineContent(2), 'Second line');
                assertCursor(viewModel, new selection_1.Selection(2, 7, 2, 7));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), ' line');
                assertCursor(viewModel, new selection_1.Selection(2, 1, 2, 1));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another line');
                assertCursor(viewModel, new selection_1.Selection(2, 8, 2, 8));
            });
        });
        test('there is an undo stop between deleting left and deleting right', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(2, 8, 2, 8)]);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), ' line');
                assertCursor(viewModel, new selection_1.Selection(2, 1, 2, 1));
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), '');
                assertCursor(viewModel, new selection_1.Selection(2, 1, 2, 1));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), ' line');
                assertCursor(viewModel, new selection_1.Selection(2, 1, 2, 1));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another line');
                assertCursor(viewModel, new selection_1.Selection(2, 8, 2, 8));
            });
        });
        test('there is an undo stop between deleting right and typing', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(2, 9, 2, 9)]);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another ');
                assertCursor(viewModel, new selection_1.Selection(2, 9, 2, 9));
                viewModel.type('text', 'keyboard');
                assert.strictEqual(model.getLineContent(2), 'Another text');
                assertCursor(viewModel, new selection_1.Selection(2, 13, 2, 13));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another ');
                assertCursor(viewModel, new selection_1.Selection(2, 9, 2, 9));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another line');
                assertCursor(viewModel, new selection_1.Selection(2, 9, 2, 9));
            });
        });
        test('there is an undo stop between deleting right and deleting left', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(2, 9, 2, 9)]);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteRight.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another ');
                assertCursor(viewModel, new selection_1.Selection(2, 9, 2, 9));
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                coreCommands_1.CoreEditingCommands.DeleteLeft.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'An');
                assertCursor(viewModel, new selection_1.Selection(2, 3, 2, 3));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another ');
                assertCursor(viewModel, new selection_1.Selection(2, 9, 2, 9));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(2), 'Another line');
                assertCursor(viewModel, new selection_1.Selection(2, 9, 2, 9));
            });
        });
        test('inserts undo stop when typing space', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                viewModel.type('first and interesting', 'keyboard');
                assert.strictEqual(model.getLineContent(1), 'A first and interesting line');
                assertCursor(viewModel, new selection_1.Selection(1, 24, 1, 24));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A first and line');
                assertCursor(viewModel, new selection_1.Selection(1, 12, 1, 12));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A first line');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getLineContent(1), 'A  line');
                assertCursor(viewModel, new selection_1.Selection(1, 3, 1, 3));
            });
        });
        test('can undo typing and EOL change in one undo stop', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'A  line',
                'Another line',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [new selection_1.Selection(1, 3, 1, 3)]);
                viewModel.type('first', 'keyboard');
                assert.strictEqual(model.getValue(), 'A first line\nAnother line');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                model.pushEOL(1 /* CRLF */);
                assert.strictEqual(model.getValue(), 'A first line\r\nAnother line');
                assertCursor(viewModel, new selection_1.Selection(1, 8, 1, 8));
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), 'A  line\nAnother line');
                assertCursor(viewModel, new selection_1.Selection(1, 3, 1, 3));
            });
        });
        test('issue #93585: Undo multi cursor edit corrupts document', () => {
            let model = (0, editorTestUtils_1.createTextModel)([
                'hello world',
                'hello world',
            ].join('\n'));
            (0, testCodeEditor_1.withTestCodeEditor)(null, { model: model }, (editor, viewModel) => {
                viewModel.setSelections('test', [
                    new selection_1.Selection(2, 7, 2, 12),
                    new selection_1.Selection(1, 7, 1, 12),
                ]);
                viewModel.type('no', 'keyboard');
                assert.strictEqual(model.getValue(), 'hello no\nhello no');
                coreCommands_1.CoreEditingCommands.Undo.runEditorCommand(null, editor, null);
                assert.strictEqual(model.getValue(), 'hello world\nhello world');
            });
        });
    });
});
//# sourceMappingURL=cursor.test.js.map