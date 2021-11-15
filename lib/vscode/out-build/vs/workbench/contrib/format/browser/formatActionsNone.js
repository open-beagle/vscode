/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/modes", "vs/nls!vs/workbench/contrib/format/browser/formatActionsNone", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/notification/common/notification", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/dialogs/common/dialogs"], function (require, exports, editorExtensions_1, editorContextKeys_1, modes_1, nls, contextkey_1, commands_1, viewlet_1, notification_1, extensions_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function showExtensionQuery(viewletService, query) {
        const viewlet = await viewletService.openViewlet(extensions_1.VIEWLET_ID, true);
        if (viewlet) {
            (viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer()).search(query);
        }
    }
    (0, editorExtensions_1.registerEditorAction)(class FormatDocumentMultipleAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatDocument.none',
                label: nls.localize(0, null),
                alias: 'Format Document',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasDocumentFormattingProvider.toNegated()),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KEY_F */,
                    linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KEY_I */ },
                    weight: 100 /* EditorContrib */,
                }
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const commandService = accessor.get(commands_1.ICommandService);
            const viewletService = accessor.get(viewlet_1.IViewletService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const model = editor.getModel();
            const formatterCount = modes_1.DocumentFormattingEditProviderRegistry.all(model).length;
            if (formatterCount > 1) {
                return commandService.executeCommand('editor.action.formatDocument.multiple');
            }
            else if (formatterCount === 1) {
                return commandService.executeCommand('editor.action.formatDocument');
            }
            else if (model.isTooLargeForSyncing()) {
                notificationService.warn(nls.localize(1, null));
            }
            else {
                const langName = model.getLanguageIdentifier().language;
                const message = nls.localize(2, null, langName);
                const res = await dialogService.show(notification_1.Severity.Info, message, [nls.localize(3, null), nls.localize(4, null)]);
                if (res.choice === 1) {
                    showExtensionQuery(viewletService, `category:formatters ${langName}`);
                }
            }
        }
    });
});
//# sourceMappingURL=formatActionsNone.js.map