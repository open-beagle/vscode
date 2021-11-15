/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/clipboard/clipboard", "vs/base/browser/browser", "vs/base/common/platform", "vs/editor/browser/controller/textAreaInput", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/editorContextKeys", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService"], function (require, exports, nls, browser, platform, textAreaInput_1, editorExtensions_1, codeEditorService_1, editorContextKeys_1, actions_1, clipboardService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PasteAction = exports.CopyAction = exports.CutAction = void 0;
    const CLIPBOARD_CONTEXT_MENU_GROUP = '9_cutcopypaste';
    const supportsCut = (platform.isNative || document.queryCommandSupported('cut'));
    const supportsCopy = (platform.isNative || document.queryCommandSupported('copy'));
    // Firefox only supports navigator.clipboard.readText() in browser extensions.
    // See https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#Browser_compatibility
    // When loading over http, navigator.clipboard can be undefined. See https://github.com/microsoft/monaco-editor/issues/2313
    const supportsPaste = (typeof navigator.clipboard === 'undefined' || browser.isFirefox) ? document.queryCommandSupported('paste') : true;
    function registerCommand(command) {
        command.register();
        return command;
    }
    exports.CutAction = supportsCut ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardCutAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind cut keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* CtrlCmd */ | 54 /* KEY_X */,
            win: { primary: 2048 /* CtrlCmd */ | 54 /* KEY_X */, secondary: [1024 /* Shift */ | 20 /* Delete */] },
            weight: 100 /* EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize(0, null),
                order: 1
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(1, null),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 1,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize(2, null),
                order: 1
            }]
    })) : undefined;
    exports.CopyAction = supportsCopy ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardCopyAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind copy keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
            win: { primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */, secondary: [2048 /* CtrlCmd */ | 19 /* Insert */] },
            weight: 100 /* EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize(3, null),
                order: 2
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(4, null),
                order: 2,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize(5, null),
                order: 1
            }]
    })) : undefined;
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarEditMenu, { submenu: actions_1.MenuId.MenubarCopy, title: { value: nls.localize(6, null), original: 'Copy As', }, group: '2_ccp', order: 3 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, { submenu: actions_1.MenuId.EditorContextCopy, title: { value: nls.localize(7, null), original: 'Copy As', }, group: CLIPBOARD_CONTEXT_MENU_GROUP, order: 3 });
    exports.PasteAction = supportsPaste ? registerCommand(new editorExtensions_1.MultiCommand({
        id: 'editor.action.clipboardPasteAction',
        precondition: undefined,
        kbOpts: (
        // Do not bind paste keybindings in the browser,
        // since browsers do that for us and it avoids security prompts
        platform.isNative ? {
            primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */,
            win: { primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
            linux: { primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */, secondary: [1024 /* Shift */ | 19 /* Insert */] },
            weight: 100 /* EditorContrib */
        } : undefined),
        menuOpts: [{
                menuId: actions_1.MenuId.MenubarEditMenu,
                group: '2_ccp',
                title: nls.localize(8, null),
                order: 4
            }, {
                menuId: actions_1.MenuId.EditorContext,
                group: CLIPBOARD_CONTEXT_MENU_GROUP,
                title: nls.localize(9, null),
                when: editorContextKeys_1.EditorContextKeys.writable,
                order: 4,
            }, {
                menuId: actions_1.MenuId.CommandPalette,
                group: '',
                title: nls.localize(10, null),
                order: 1
            }]
    })) : undefined;
    class ExecCommandCopyWithSyntaxHighlightingAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.clipboardCopyWithSyntaxHighlightingAction',
                label: nls.localize(11, null),
                alias: 'Copy With Syntax Highlighting',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                    primary: 0,
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const emptySelectionClipboard = editor.getOption(30 /* emptySelectionClipboard */);
            if (!emptySelectionClipboard && editor.getSelection().isEmpty()) {
                return;
            }
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = true;
            editor.focus();
            document.execCommand('copy');
            textAreaInput_1.CopyOptions.forceCopyWithSyntaxHighlighting = false;
        }
    }
    function registerExecCommandImpl(target, browserCommand) {
        if (!target) {
            return;
        }
        // 1. handle case when focus is in editor.
        target.addImplementation(10000, 'code-editor', (accessor, args) => {
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                // Do not execute if there is no selection and empty selection clipboard is off
                const emptySelectionClipboard = focusedEditor.getOption(30 /* emptySelectionClipboard */);
                const selection = focusedEditor.getSelection();
                if (selection && selection.isEmpty() && !emptySelectionClipboard) {
                    return true;
                }
                document.execCommand(browserCommand);
                return true;
            }
            return false;
        });
        // 2. (default) handle case when focus is somewhere else.
        target.addImplementation(0, 'generic-dom', (accessor, args) => {
            document.execCommand(browserCommand);
            return true;
        });
    }
    registerExecCommandImpl(exports.CutAction, 'cut');
    registerExecCommandImpl(exports.CopyAction, 'copy');
    if (exports.PasteAction) {
        // 1. Paste: handle case when focus is in editor.
        exports.PasteAction.addImplementation(10000, 'code-editor', (accessor, args) => {
            const codeEditorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const clipboardService = accessor.get(clipboardService_1.IClipboardService);
            // Only if editor text focus (i.e. not if editor has widget focus).
            const focusedEditor = codeEditorService.getFocusedCodeEditor();
            if (focusedEditor && focusedEditor.hasTextFocus()) {
                const result = document.execCommand('paste');
                // Use the clipboard service if document.execCommand('paste') was not successful
                if (!result && platform.isWeb) {
                    (async () => {
                        const clipboardText = await clipboardService.readText();
                        if (clipboardText !== '') {
                            const metadata = textAreaInput_1.InMemoryClipboardMetadataManager.INSTANCE.get(clipboardText);
                            let pasteOnNewLine = false;
                            let multicursorText = null;
                            let mode = null;
                            if (metadata) {
                                pasteOnNewLine = (focusedEditor.getOption(30 /* emptySelectionClipboard */) && !!metadata.isFromEmptySelection);
                                multicursorText = (typeof metadata.multicursorText !== 'undefined' ? metadata.multicursorText : null);
                                mode = metadata.mode;
                            }
                            focusedEditor.trigger('keyboard', "paste" /* Paste */, {
                                text: clipboardText,
                                pasteOnNewLine,
                                multicursorText,
                                mode
                            });
                        }
                    })();
                    return true;
                }
                return true;
            }
            return false;
        });
        // 2. Paste: (default) handle case when focus is somewhere else.
        exports.PasteAction.addImplementation(0, 'generic-dom', (accessor, args) => {
            document.execCommand('paste');
            return true;
        });
    }
    if (supportsCopy) {
        (0, editorExtensions_1.registerEditorAction)(ExecCommandCopyWithSyntaxHighlightingAction);
    }
});
//# sourceMappingURL=clipboard.js.map