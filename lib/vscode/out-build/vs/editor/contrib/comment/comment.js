/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/comment/comment", "vs/base/common/keyCodes", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/contrib/comment/blockCommentCommand", "vs/editor/contrib/comment/lineCommentCommand", "vs/platform/actions/common/actions"], function (require, exports, nls, keyCodes_1, editorExtensions_1, range_1, editorContextKeys_1, blockCommentCommand_1, lineCommentCommand_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CommentLineAction extends editorExtensions_1.EditorAction {
        constructor(type, opts) {
            super(opts);
            this._type = type;
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            const commands = [];
            const modelOptions = model.getOptions();
            const commentsOptions = editor.getOption(17 /* comments */);
            const selections = editor.getSelections().map((selection, index) => ({ selection, index, ignoreFirstLine: false }));
            selections.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.selection, b.selection));
            // Remove selections that would result in copying the same line
            let prev = selections[0];
            for (let i = 1; i < selections.length; i++) {
                const curr = selections[i];
                if (prev.selection.endLineNumber === curr.selection.startLineNumber) {
                    // these two selections would copy the same line
                    if (prev.index < curr.index) {
                        // prev wins
                        curr.ignoreFirstLine = true;
                    }
                    else {
                        // curr wins
                        prev.ignoreFirstLine = true;
                        prev = curr;
                    }
                }
            }
            for (const selection of selections) {
                commands.push(new lineCommentCommand_1.LineCommentCommand(selection.selection, modelOptions.tabSize, this._type, commentsOptions.insertSpace, commentsOptions.ignoreEmptyLines, selection.ignoreFirstLine));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    class ToggleCommentLineAction extends CommentLineAction {
        constructor() {
            super(0 /* Toggle */, {
                id: 'editor.action.commentLine',
                label: nls.localize(0, null),
                alias: 'Toggle Line Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* CtrlCmd */ | 85 /* US_SLASH */,
                    weight: 100 /* EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarEditMenu,
                    group: '5_insert',
                    title: nls.localize(1, null),
                    order: 1
                }
            });
        }
    }
    class AddLineCommentAction extends CommentLineAction {
        constructor() {
            super(1 /* ForceAdd */, {
                id: 'editor.action.addCommentLine',
                label: nls.localize(2, null),
                alias: 'Add Line Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 33 /* KEY_C */),
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    class RemoveLineCommentAction extends CommentLineAction {
        constructor() {
            super(2 /* ForceRemove */, {
                id: 'editor.action.removeCommentLine',
                label: nls.localize(3, null),
                alias: 'Remove Line Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 51 /* KEY_U */),
                    weight: 100 /* EditorContrib */
                }
            });
        }
    }
    class BlockCommentAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.blockComment',
                label: nls.localize(4, null),
                alias: 'Toggle Block Comment',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* Shift */ | 512 /* Alt */ | 31 /* KEY_A */,
                    linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 31 /* KEY_A */ },
                    weight: 100 /* EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.MenuId.MenubarEditMenu,
                    group: '5_insert',
                    title: nls.localize(5, null),
                    order: 2
                }
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const commentsOptions = editor.getOption(17 /* comments */);
            const commands = [];
            const selections = editor.getSelections();
            for (const selection of selections) {
                commands.push(new blockCommentCommand_1.BlockCommentCommand(selection, commentsOptions.insertSpace));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    (0, editorExtensions_1.registerEditorAction)(ToggleCommentLineAction);
    (0, editorExtensions_1.registerEditorAction)(AddLineCommentAction);
    (0, editorExtensions_1.registerEditorAction)(RemoveLineCommentAction);
    (0, editorExtensions_1.registerEditorAction)(BlockCommentAction);
});
//# sourceMappingURL=comment.js.map