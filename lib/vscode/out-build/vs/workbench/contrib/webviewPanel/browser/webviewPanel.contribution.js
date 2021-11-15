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
define(["require", "exports", "vs/nls!vs/workbench/contrib/webviewPanel/browser/webviewPanel.contribution", "vs/platform/actions/common/actions", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "./webviewCommands", "./webviewEditor", "./webviewEditorInput", "./webviewEditorInputSerializer", "./webviewWorkbenchService"], function (require, exports, nls_1, actions_1, editor_1, descriptors_1, extensions_1, platform_1, editor_2, contributions_1, editor_3, editorGroupsService_1, editorService_1, webviewCommands_1, webviewEditor_1, webviewEditorInput_1, webviewEditorInputSerializer_1, webviewWorkbenchService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (platform_1.Registry.as(editor_3.EditorExtensions.Editors)).registerEditor(editor_2.EditorDescriptor.create(webviewEditor_1.WebviewEditor, webviewEditor_1.WebviewEditor.ID, (0, nls_1.localize)(0, null)), [new descriptors_1.SyncDescriptor(webviewEditorInput_1.WebviewInput)]);
    let WebviewPanelContribution = class WebviewPanelContribution {
        constructor(editorService, editorGroupService) {
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.editorService.overrideOpenEditor({
                open: (editor, options, group) => this.onEditorOpening(editor, options, group)
            });
        }
        onEditorOpening(editor, options, group) {
            if (!(editor instanceof webviewEditorInput_1.WebviewInput) || editor.typeId !== webviewEditorInput_1.WebviewInput.typeId) {
                return undefined;
            }
            if (group.contains(editor)) {
                return undefined;
            }
            let previousGroup;
            const groups = this.editorGroupService.groups;
            for (const group of groups) {
                if (group.contains(editor)) {
                    previousGroup = group;
                    break;
                }
            }
            if (!previousGroup) {
                return undefined;
            }
            previousGroup.closeEditor(editor);
            return {
                override: this.editorService.openEditor(editor, Object.assign(Object.assign({}, options), { override: editor_1.EditorOverride.DISABLED }), group)
            };
        }
    };
    WebviewPanelContribution = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, editorGroupsService_1.IEditorGroupsService)
    ], WebviewPanelContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(WebviewPanelContribution, 1 /* Starting */);
    platform_1.Registry.as(editor_3.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(webviewEditorInputSerializer_1.WebviewEditorInputSerializer.ID, webviewEditorInputSerializer_1.WebviewEditorInputSerializer);
    (0, extensions_1.registerSingleton)(webviewWorkbenchService_1.IWebviewWorkbenchService, webviewWorkbenchService_1.WebviewEditorService, true);
    (0, actions_1.registerAction2)(webviewCommands_1.ShowWebViewEditorFindWidgetAction);
    (0, actions_1.registerAction2)(webviewCommands_1.HideWebViewEditorFindCommand);
    (0, actions_1.registerAction2)(webviewCommands_1.WebViewEditorFindNextCommand);
    (0, actions_1.registerAction2)(webviewCommands_1.WebViewEditorFindPreviousCommand);
    (0, actions_1.registerAction2)(webviewCommands_1.ReloadWebviewAction);
});
//# sourceMappingURL=webviewPanel.contribution.js.map