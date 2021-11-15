/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode", "vs/base/browser/ui/aria/aria", "vs/editor/browser/editorExtensions", "vs/editor/common/config/commonEditorConfig"], function (require, exports, nls, aria_1, editorExtensions_1, commonEditorConfig_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleTabFocusModeAction = void 0;
    class ToggleTabFocusModeAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: ToggleTabFocusModeAction.ID,
                label: nls.localize(0, null),
                alias: 'Toggle Tab Key Moves Focus',
                precondition: undefined,
                kbOpts: {
                    kbExpr: null,
                    primary: 2048 /* CtrlCmd */ | 43 /* KEY_M */,
                    mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 43 /* KEY_M */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            const oldValue = commonEditorConfig_1.TabFocus.getTabFocusMode();
            const newValue = !oldValue;
            commonEditorConfig_1.TabFocus.setTabFocusMode(newValue);
            if (newValue) {
                (0, aria_1.alert)(nls.localize(1, null));
            }
            else {
                (0, aria_1.alert)(nls.localize(2, null));
            }
        }
    }
    exports.ToggleTabFocusModeAction = ToggleTabFocusModeAction;
    ToggleTabFocusModeAction.ID = 'editor.action.toggleTabFocusMode';
    (0, editorExtensions_1.registerEditorAction)(ToggleTabFocusModeAction);
});
//# sourceMappingURL=toggleTabFocusMode.js.map