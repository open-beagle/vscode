/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/electron-sandbox/fileActions.contribution", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/base/common/network", "vs/platform/native/electron-sandbox/native", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/editorContextKeys", "vs/base/common/keyCodes", "vs/workbench/contrib/files/browser/files", "vs/platform/list/browser/listService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/electron-sandbox/fileCommands", "vs/platform/actions/common/actions", "vs/workbench/common/resources", "vs/workbench/contrib/files/browser/fileActions.contribution", "vs/workbench/common/editor", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, workspace_1, platform_1, network_1, native_1, keybindingsRegistry_1, editorContextKeys_1, keyCodes_1, files_1, listService_1, editorService_1, fileCommands_1, actions_1, resources_1, fileActions_contribution_1, editor_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const REVEAL_IN_OS_COMMAND_ID = 'revealFileInOS';
    const REVEAL_IN_OS_LABEL = platform_1.isWindows ? nls.localize(0, null) : platform_1.isMacintosh ? nls.localize(1, null) : nls.localize(2, null);
    const REVEAL_IN_OS_WHEN_CONTEXT = contextkey_1.ContextKeyOrExpr.create([resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.file), resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.userData)]);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: REVEAL_IN_OS_COMMAND_ID,
        weight: 200 /* WorkbenchContrib */,
        when: editorContextKeys_1.EditorContextKeys.focus.toNegated(),
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KEY_R */,
        win: {
            primary: 1024 /* Shift */ | 512 /* Alt */ | 48 /* KEY_R */
        },
        handler: (accessor, resource) => {
            const resources = (0, files_1.getMultiSelectedResources)(resource, accessor.get(listService_1.IListService), accessor.get(editorService_1.IEditorService), accessor.get(files_1.IExplorerService));
            (0, fileCommands_1.revealResourcesInOS)(resources, accessor.get(native_1.INativeHostService), accessor.get(workspace_1.IWorkspaceContextService));
        }
    });
    const REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID = 'workbench.action.files.revealActiveFileInWindows';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        weight: 200 /* WorkbenchContrib */,
        when: undefined,
        primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 48 /* KEY_R */),
        id: REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID,
        handler: (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeInput = editorService.activeEditor;
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(activeInput, { filterByScheme: network_1.Schemas.file, supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const resources = resource ? [resource] : [];
            (0, fileCommands_1.revealResourcesInOS)(resources, accessor.get(native_1.INativeHostService), accessor.get(workspace_1.IWorkspaceContextService));
        }
    });
    (0, fileActions_contribution_1.appendEditorTitleContextMenuItem)(REVEAL_IN_OS_COMMAND_ID, REVEAL_IN_OS_LABEL, REVEAL_IN_OS_WHEN_CONTEXT);
    // Menu registration - open editors
    const revealInOsCommand = {
        id: REVEAL_IN_OS_COMMAND_ID,
        title: REVEAL_IN_OS_LABEL
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    // Menu registration - explorer
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: revealInOsCommand,
        when: REVEAL_IN_OS_WHEN_CONTEXT
    });
    // Command Palette
    const category = { value: nls.localize(3, null), original: 'File' };
    (0, fileActions_contribution_1.appendToCommandPalette)(REVEAL_IN_OS_COMMAND_ID, { value: REVEAL_IN_OS_LABEL, original: platform_1.isWindows ? 'Reveal in File Explorer' : platform_1.isMacintosh ? 'Reveal in Finder' : 'Open Containing Folder' }, category, REVEAL_IN_OS_WHEN_CONTEXT);
});
//# sourceMappingURL=fileActions.contribution.js.map