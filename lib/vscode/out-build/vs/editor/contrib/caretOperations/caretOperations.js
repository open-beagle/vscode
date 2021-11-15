/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/caretOperations/caretOperations", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/caretOperations/moveCaretCommand"], function (require, exports, nls, editorExtensions_1, editorContextKeys_1, moveCaretCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MoveCaretAction extends editorExtensions_1.EditorAction {
        constructor(left, opts) {
            super(opts);
            this.left = left;
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            let commands = [];
            let selections = editor.getSelections();
            for (const selection of selections) {
                commands.push(new moveCaretCommand_1.MoveCaretCommand(selection, this.left));
            }
            editor.pushUndoStop();
            editor.executeCommands(this.id, commands);
            editor.pushUndoStop();
        }
    }
    class MoveCaretLeftAction extends MoveCaretAction {
        constructor() {
            super(true, {
                id: 'editor.action.moveCarretLeftAction',
                label: nls.localize(0, null),
                alias: 'Move Selected Text Left',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    class MoveCaretRightAction extends MoveCaretAction {
        constructor() {
            super(false, {
                id: 'editor.action.moveCarretRightAction',
                label: nls.localize(1, null),
                alias: 'Move Selected Text Right',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
    }
    (0, editorExtensions_1.registerEditorAction)(MoveCaretLeftAction);
    (0, editorExtensions_1.registerEditorAction)(MoveCaretRightAction);
});
//# sourceMappingURL=caretOperations.js.map