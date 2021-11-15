/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/contrib/clipboard/clipboard", "vs/workbench/contrib/webview/browser/webview"], function (require, exports, editorExtensions_1, clipboard_1, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const PRIORITY = 100;
    function overrideCommandForWebview(command, f) {
        command === null || command === void 0 ? void 0 : command.addImplementation(PRIORITY, 'webview', accessor => {
            const webviewService = accessor.get(webview_1.IWebviewService);
            const webview = webviewService.activeWebview;
            if (webview === null || webview === void 0 ? void 0 : webview.isFocused) {
                f(webview);
                return true;
            }
            return false;
        });
    }
    overrideCommandForWebview(editorExtensions_1.UndoCommand, webview => webview.undo());
    overrideCommandForWebview(editorExtensions_1.RedoCommand, webview => webview.redo());
    overrideCommandForWebview(editorExtensions_1.SelectAllCommand, webview => webview.selectAll());
    overrideCommandForWebview(clipboard_1.CopyAction, webview => webview.copy());
    overrideCommandForWebview(clipboard_1.PasteAction, webview => webview.paste());
    overrideCommandForWebview(clipboard_1.CutAction, webview => webview.cut());
});
//# sourceMappingURL=webview.contribution.js.map