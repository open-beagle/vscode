/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/editor/contrib/quickAccess/gotoLineQuickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/browser/services/codeEditorService", "vs/base/common/types", "vs/editor/common/standaloneStrings", "vs/base/common/event", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/platform/quickinput/common/quickInput"], function (require, exports, gotoLineQuickAccess_1, platform_1, quickAccess_1, codeEditorService_1, types_1, standaloneStrings_1, event_1, editorExtensions_1, editorContextKeys_1, quickInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoLineAction = exports.StandaloneGotoLineQuickAccessProvider = void 0;
    let StandaloneGotoLineQuickAccessProvider = class StandaloneGotoLineQuickAccessProvider extends gotoLineQuickAccess_1.AbstractGotoLineQuickAccessProvider {
        constructor(editorService) {
            super();
            this.editorService = editorService;
            this.onDidActiveTextEditorControlChange = event_1.Event.None;
        }
        get activeTextEditorControl() {
            return (0, types_1.withNullAsUndefined)(this.editorService.getFocusedCodeEditor());
        }
    };
    StandaloneGotoLineQuickAccessProvider = __decorate([
        __param(0, codeEditorService_1.ICodeEditorService)
    ], StandaloneGotoLineQuickAccessProvider);
    exports.StandaloneGotoLineQuickAccessProvider = StandaloneGotoLineQuickAccessProvider;
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: StandaloneGotoLineQuickAccessProvider,
        prefix: StandaloneGotoLineQuickAccessProvider.PREFIX,
        helpEntries: [{ description: standaloneStrings_1.GoToLineNLS.gotoLineActionLabel, needsEditor: true }]
    });
    class GotoLineAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.gotoLine',
                label: standaloneStrings_1.GoToLineNLS.gotoLineActionLabel,
                alias: 'Go to Line/Column...',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* CtrlCmd */ | 37 /* KEY_G */,
                    mac: { primary: 256 /* WinCtrl */ | 37 /* KEY_G */ },
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(StandaloneGotoLineQuickAccessProvider.PREFIX);
        }
    }
    exports.GotoLineAction = GotoLineAction;
    (0, editorExtensions_1.registerEditorAction)(GotoLineAction);
});
//# sourceMappingURL=standaloneGotoLineQuickAccess.js.map