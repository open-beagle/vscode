/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/wordOperations/wordOperations", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/replaceCommand", "vs/editor/common/controller/cursorCommon", "vs/editor/common/controller/cursorWordOperations", "vs/editor/common/controller/wordCharacterClassifier", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/platform/accessibility/common/accessibility", "vs/platform/contextkey/common/contextkey", "vs/editor/common/config/editorOptions", "vs/editor/common/modes/languageConfigurationRegistry", "vs/platform/contextkey/common/contextkeys"], function (require, exports, nls, editorExtensions_1, replaceCommand_1, cursorCommon_1, cursorWordOperations_1, wordCharacterClassifier_1, position_1, range_1, selection_1, editorContextKeys_1, accessibility_1, contextkey_1, editorOptions_1, languageConfigurationRegistry_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeleteInsideWord = exports.DeleteWordRight = exports.DeleteWordEndRight = exports.DeleteWordStartRight = exports.DeleteWordLeft = exports.DeleteWordEndLeft = exports.DeleteWordStartLeft = exports.DeleteWordRightCommand = exports.DeleteWordLeftCommand = exports.DeleteWordCommand = exports.CursorWordAccessibilityRightSelect = exports.CursorWordAccessibilityRight = exports.CursorWordRightSelect = exports.CursorWordEndRightSelect = exports.CursorWordStartRightSelect = exports.CursorWordRight = exports.CursorWordEndRight = exports.CursorWordStartRight = exports.CursorWordAccessibilityLeftSelect = exports.CursorWordAccessibilityLeft = exports.CursorWordLeftSelect = exports.CursorWordEndLeftSelect = exports.CursorWordStartLeftSelect = exports.CursorWordLeft = exports.CursorWordEndLeft = exports.CursorWordStartLeft = exports.WordRightCommand = exports.WordLeftCommand = exports.MoveWordCommand = void 0;
    class MoveWordCommand extends editorExtensions_1.EditorCommand {
        constructor(opts) {
            super(opts);
            this._inSelectionMode = opts.inSelectionMode;
            this._wordNavigationType = opts.wordNavigationType;
        }
        runEditorCommand(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(editor.getOption(112 /* wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const result = selections.map((sel) => {
                const inPosition = new position_1.Position(sel.positionLineNumber, sel.positionColumn);
                const outPosition = this._move(wordSeparators, model, inPosition, this._wordNavigationType);
                return this._moveTo(sel, outPosition, this._inSelectionMode);
            });
            model.pushStackElement();
            editor._getViewModel().setCursorStates('moveWordCommand', 3 /* Explicit */, result.map(r => cursorCommon_1.CursorState.fromModelSelection(r)));
            if (result.length === 1) {
                const pos = new position_1.Position(result[0].positionLineNumber, result[0].positionColumn);
                editor.revealPosition(pos, 0 /* Smooth */);
            }
        }
        _moveTo(from, to, inSelectionMode) {
            if (inSelectionMode) {
                // move just position
                return new selection_1.Selection(from.selectionStartLineNumber, from.selectionStartColumn, to.lineNumber, to.column);
            }
            else {
                // move everything
                return new selection_1.Selection(to.lineNumber, to.column, to.lineNumber, to.column);
            }
        }
    }
    exports.MoveWordCommand = MoveWordCommand;
    class WordLeftCommand extends MoveWordCommand {
        _move(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordOperations.moveWordLeft(wordSeparators, model, position, wordNavigationType);
        }
    }
    exports.WordLeftCommand = WordLeftCommand;
    class WordRightCommand extends MoveWordCommand {
        _move(wordSeparators, model, position, wordNavigationType) {
            return cursorWordOperations_1.WordOperations.moveWordRight(wordSeparators, model, position, wordNavigationType);
        }
    }
    exports.WordRightCommand = WordRightCommand;
    class CursorWordStartLeft extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartLeft',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartLeft = CursorWordStartLeft;
    class CursorWordEndLeft extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordEnd */,
                id: 'cursorWordEndLeft',
                precondition: undefined
            });
        }
    }
    exports.CursorWordEndLeft = CursorWordEndLeft;
    class CursorWordLeft extends WordLeftCommand {
        constructor() {
            var _a;
            super({
                inSelectionMode: false,
                wordNavigationType: 1 /* WordStartFast */,
                id: 'cursorWordLeft',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, (_a = contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)) === null || _a === void 0 ? void 0 : _a.negate()),
                    primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */,
                    mac: { primary: 512 /* Alt */ | 15 /* LeftArrow */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    exports.CursorWordLeft = CursorWordLeft;
    class CursorWordStartLeftSelect extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartLeftSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartLeftSelect = CursorWordStartLeftSelect;
    class CursorWordEndLeftSelect extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordEnd */,
                id: 'cursorWordEndLeftSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordEndLeftSelect = CursorWordEndLeftSelect;
    class CursorWordLeftSelect extends WordLeftCommand {
        constructor() {
            var _a;
            super({
                inSelectionMode: true,
                wordNavigationType: 1 /* WordStartFast */,
                id: 'cursorWordLeftSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, (_a = contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)) === null || _a === void 0 ? void 0 : _a.negate()),
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */,
                    mac: { primary: 512 /* Alt */ | 1024 /* Shift */ | 15 /* LeftArrow */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    exports.CursorWordLeftSelect = CursorWordLeftSelect;
    // Accessibility navigation commands should only be enabled on windows since they are tuned to what NVDA expects
    class CursorWordAccessibilityLeft extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 3 /* WordAccessibility */,
                id: 'cursorWordAccessibilityLeft',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityLeft = CursorWordAccessibilityLeft;
    class CursorWordAccessibilityLeftSelect extends WordLeftCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 3 /* WordAccessibility */,
                id: 'cursorWordAccessibilityLeftSelect',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityLeftSelect = CursorWordAccessibilityLeftSelect;
    class CursorWordStartRight extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartRight',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartRight = CursorWordStartRight;
    class CursorWordEndRight extends WordRightCommand {
        constructor() {
            var _a;
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordEnd */,
                id: 'cursorWordEndRight',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, (_a = contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)) === null || _a === void 0 ? void 0 : _a.negate()),
                    primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */,
                    mac: { primary: 512 /* Alt */ | 17 /* RightArrow */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    exports.CursorWordEndRight = CursorWordEndRight;
    class CursorWordRight extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 2 /* WordEnd */,
                id: 'cursorWordRight',
                precondition: undefined
            });
        }
    }
    exports.CursorWordRight = CursorWordRight;
    class CursorWordStartRightSelect extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 0 /* WordStart */,
                id: 'cursorWordStartRightSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordStartRightSelect = CursorWordStartRightSelect;
    class CursorWordEndRightSelect extends WordRightCommand {
        constructor() {
            var _a;
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordEnd */,
                id: 'cursorWordEndRightSelect',
                precondition: undefined,
                kbOpts: {
                    kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, (_a = contextkey_1.ContextKeyExpr.and(accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED, contextkeys_1.IsWindowsContext)) === null || _a === void 0 ? void 0 : _a.negate()),
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */,
                    mac: { primary: 512 /* Alt */ | 1024 /* Shift */ | 17 /* RightArrow */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    exports.CursorWordEndRightSelect = CursorWordEndRightSelect;
    class CursorWordRightSelect extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 2 /* WordEnd */,
                id: 'cursorWordRightSelect',
                precondition: undefined
            });
        }
    }
    exports.CursorWordRightSelect = CursorWordRightSelect;
    class CursorWordAccessibilityRight extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: false,
                wordNavigationType: 3 /* WordAccessibility */,
                id: 'cursorWordAccessibilityRight',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityRight = CursorWordAccessibilityRight;
    class CursorWordAccessibilityRightSelect extends WordRightCommand {
        constructor() {
            super({
                inSelectionMode: true,
                wordNavigationType: 3 /* WordAccessibility */,
                id: 'cursorWordAccessibilityRightSelect',
                precondition: undefined
            });
        }
        _move(_, model, position, wordNavigationType) {
            return super._move((0, wordCharacterClassifier_1.getMapForWordSeparators)(editorOptions_1.EditorOptions.wordSeparators.defaultValue), model, position, wordNavigationType);
        }
    }
    exports.CursorWordAccessibilityRightSelect = CursorWordAccessibilityRightSelect;
    class DeleteWordCommand extends editorExtensions_1.EditorCommand {
        constructor(opts) {
            super(opts);
            this._whitespaceHeuristics = opts.whitespaceHeuristics;
            this._wordNavigationType = opts.wordNavigationType;
        }
        runEditorCommand(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(editor.getOption(112 /* wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const autoClosingBrackets = editor.getOption(5 /* autoClosingBrackets */);
            const autoClosingQuotes = editor.getOption(8 /* autoClosingQuotes */);
            const autoClosingPairs = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getAutoClosingPairs(model.getLanguageIdentifier().id);
            const viewModel = editor._getViewModel();
            const commands = selections.map((sel) => {
                const deleteRange = this._delete({
                    wordSeparators,
                    model,
                    selection: sel,
                    whitespaceHeuristics: this._whitespaceHeuristics,
                    autoClosingDelete: editor.getOption(6 /* autoClosingDelete */),
                    autoClosingBrackets,
                    autoClosingQuotes,
                    autoClosingPairs,
                    autoClosedCharacters: viewModel.getCursorAutoClosedCharacters()
                }, this._wordNavigationType);
                return new replaceCommand_1.ReplaceCommand(deleteRange, '');
            });
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.DeleteWordCommand = DeleteWordCommand;
    class DeleteWordLeftCommand extends DeleteWordCommand {
        _delete(ctx, wordNavigationType) {
            let r = cursorWordOperations_1.WordOperations.deleteWordLeft(ctx, wordNavigationType);
            if (r) {
                return r;
            }
            return new range_1.Range(1, 1, 1, 1);
        }
    }
    exports.DeleteWordLeftCommand = DeleteWordLeftCommand;
    class DeleteWordRightCommand extends DeleteWordCommand {
        _delete(ctx, wordNavigationType) {
            let r = cursorWordOperations_1.WordOperations.deleteWordRight(ctx, wordNavigationType);
            if (r) {
                return r;
            }
            const lineCount = ctx.model.getLineCount();
            const maxColumn = ctx.model.getLineMaxColumn(lineCount);
            return new range_1.Range(lineCount, maxColumn, lineCount, maxColumn);
        }
    }
    exports.DeleteWordRightCommand = DeleteWordRightCommand;
    class DeleteWordStartLeft extends DeleteWordLeftCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'deleteWordStartLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordStartLeft = DeleteWordStartLeft;
    class DeleteWordEndLeft extends DeleteWordLeftCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 2 /* WordEnd */,
                id: 'deleteWordEndLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordEndLeft = DeleteWordEndLeft;
    class DeleteWordLeft extends DeleteWordLeftCommand {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 0 /* WordStart */,
                id: 'deleteWordLeft',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
                    mac: { primary: 512 /* Alt */ | 1 /* Backspace */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    exports.DeleteWordLeft = DeleteWordLeft;
    class DeleteWordStartRight extends DeleteWordRightCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 0 /* WordStart */,
                id: 'deleteWordStartRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordStartRight = DeleteWordStartRight;
    class DeleteWordEndRight extends DeleteWordRightCommand {
        constructor() {
            super({
                whitespaceHeuristics: false,
                wordNavigationType: 2 /* WordEnd */,
                id: 'deleteWordEndRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    exports.DeleteWordEndRight = DeleteWordEndRight;
    class DeleteWordRight extends DeleteWordRightCommand {
        constructor() {
            super({
                whitespaceHeuristics: true,
                wordNavigationType: 2 /* WordEnd */,
                id: 'deleteWordRight',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 2048 /* CtrlCmd */ | 20 /* Delete */,
                    mac: { primary: 512 /* Alt */ | 20 /* Delete */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    exports.DeleteWordRight = DeleteWordRight;
    class DeleteInsideWord extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'deleteInsideWord',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                label: nls.localize(0, null),
                alias: 'Delete Word'
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const wordSeparators = (0, wordCharacterClassifier_1.getMapForWordSeparators)(editor.getOption(112 /* wordSeparators */));
            const model = editor.getModel();
            const selections = editor.getSelections();
            const commands = selections.map((sel) => {
                const deleteRange = cursorWordOperations_1.WordOperations.deleteInsideWord(wordSeparators, model, sel);
                return new replaceCommand_1.ReplaceCommand(deleteRange, '');
            });
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    exports.DeleteInsideWord = DeleteInsideWord;
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordStartRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordEndRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityLeft());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityLeftSelect());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityRight());
    (0, editorExtensions_1.registerEditorCommand)(new CursorWordAccessibilityRightSelect());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordStartLeft());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordEndLeft());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordLeft());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordStartRight());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordEndRight());
    (0, editorExtensions_1.registerEditorCommand)(new DeleteWordRight());
    (0, editorExtensions_1.registerEditorAction)(DeleteInsideWord);
});
//# sourceMappingURL=wordOperations.js.map