/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/fileActions.contribution", "vs/platform/registry/common/platform", "vs/workbench/contrib/files/browser/fileActions", "vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/base/common/keyCodes", "vs/workbench/contrib/files/browser/fileCommands", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/platform", "vs/workbench/contrib/files/common/files", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/common/resources", "vs/platform/list/browser/listService", "vs/base/common/network", "vs/workbench/browser/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/workbench/browser/actions/workspaceActions", "vs/workbench/common/editor", "vs/workbench/common/viewlet", "vs/workbench/contrib/files/browser/files", "vs/base/common/codicons"], function (require, exports, nls, platform_1, fileActions_1, textFileSaveErrorHandler_1, actions_1, actions_2, keyCodes_1, fileCommands_1, commands_1, contextkey_1, keybindingsRegistry_1, platform_2, files_1, workspaceCommands_1, editorCommands_1, filesConfigurationService_1, resources_1, listService_1, network_1, contextkeys_1, contextkeys_2, workspaceActions_1, editor_1, viewlet_1, files_2, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.appendToCommandPalette = exports.appendEditorTitleContextMenuItem = void 0;
    // Contribute Global Actions
    const category = { value: nls.localize(0, null), original: 'File' };
    const registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(fileActions_1.GlobalCompareResourcesAction), 'File: Compare Active File With...', category.value, editor_1.ActiveEditorContext);
    registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(fileActions_1.FocusFilesExplorer), 'File: Focus on Files Explorer', category.value);
    registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(fileActions_1.ShowActiveFileInExplorer), 'File: Reveal Active File in Side Bar', category.value);
    registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(fileActions_1.CompareWithClipboardAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 33 /* KEY_C */) }), 'File: Compare Active File with Clipboard', category.value);
    registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(fileActions_1.ToggleAutoSaveAction), 'File: Toggle Auto Save', category.value);
    registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(fileActions_1.ShowOpenedFileInNewWindow, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 45 /* KEY_O */) }), 'File: Open Active File in New Window', category.value, contextkeys_1.EmptyWorkspaceSupportContext);
    const workspacesCategory = nls.localize(1, null);
    registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(workspaceActions_1.OpenWorkspaceAction), 'Workspaces: Open Workspace...', workspacesCategory);
    const fileCategory = nls.localize(2, null);
    if (platform_2.isMacintosh && !platform_2.isWeb) {
        registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(workspaceActions_1.OpenFileFolderAction, { primary: 2048 /* CtrlCmd */ | 45 /* KEY_O */ }), 'File: Open...', fileCategory);
    }
    else {
        registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(workspaceActions_1.OpenFileAction, { primary: 2048 /* CtrlCmd */ | 45 /* KEY_O */ }), 'File: Open File...', fileCategory);
        registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(workspaceActions_1.OpenFolderAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 45 /* KEY_O */) }), 'File: Open Folder...', fileCategory);
    }
    // Commands
    commands_1.CommandsRegistry.registerCommand('_files.windowOpen', fileCommands_1.openWindowCommand);
    commands_1.CommandsRegistry.registerCommand('_files.newWindow', fileCommands_1.newWindowCommand);
    const explorerCommandsWeightBonus = 10; // give our commands a little bit more weight over other default list/tree commands
    const RENAME_ID = 'renameFile';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: RENAME_ID,
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceNotReadonlyContext),
        primary: 60 /* F2 */,
        mac: {
            primary: 3 /* Enter */
        },
        handler: fileActions_1.renameHandler
    });
    const MOVE_FILE_TO_TRASH_ID = 'moveFileToTrash';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: MOVE_FILE_TO_TRASH_ID,
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext, files_1.ExplorerResourceMoveableToTrash),
        primary: 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
            secondary: [20 /* Delete */]
        },
        handler: fileActions_1.moveFileToTrashHandler
    });
    const DELETE_FILE_ID = 'deleteFile';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DELETE_FILE_ID,
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext),
        primary: 1024 /* Shift */ | 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 1 /* Backspace */
        },
        handler: fileActions_1.deleteFileHandler
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DELETE_FILE_ID,
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext, files_1.ExplorerResourceMoveableToTrash.toNegated()),
        primary: 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
        },
        handler: fileActions_1.deleteFileHandler
    });
    const CUT_FILE_ID = 'filesExplorer.cut';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CUT_FILE_ID,
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated()),
        primary: 2048 /* CtrlCmd */ | 54 /* KEY_X */,
        handler: fileActions_1.cutFileHandler,
    });
    const COPY_FILE_ID = 'filesExplorer.copy';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: COPY_FILE_ID,
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerRootContext.toNegated()),
        primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
        handler: fileActions_1.copyFileHandler,
    });
    const PASTE_FILE_ID = 'filesExplorer.paste';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: PASTE_FILE_ID,
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceNotReadonlyContext),
        primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */,
        handler: fileActions_1.pasteFileHandler
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'filesExplorer.cancelCut',
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerResourceCut),
        primary: 9 /* Escape */,
        handler: async (accessor) => {
            const explorerService = accessor.get(files_2.IExplorerService);
            await explorerService.setToCopy([], true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'filesExplorer.openFilePreserveFocus',
        weight: 200 /* WorkbenchContrib */ + explorerCommandsWeightBonus,
        when: contextkey_1.ContextKeyExpr.and(files_1.FilesExplorerFocusCondition, files_1.ExplorerFolderContext.toNegated()),
        primary: 10 /* Space */,
        handler: fileActions_1.openFilePreserveFocusHandler
    });
    const copyPathCommand = {
        id: fileCommands_1.COPY_PATH_COMMAND_ID,
        title: nls.localize(3, null)
    };
    const copyRelativePathCommand = {
        id: fileCommands_1.COPY_RELATIVE_PATH_COMMAND_ID,
        title: nls.localize(4, null)
    };
    // Editor Title Context Menu
    appendEditorTitleContextMenuItem(fileCommands_1.COPY_PATH_COMMAND_ID, copyPathCommand.title, resources_1.ResourceContextKey.IsFileSystemResource, '1_cutcopypaste');
    appendEditorTitleContextMenuItem(fileCommands_1.COPY_RELATIVE_PATH_COMMAND_ID, copyRelativePathCommand.title, resources_1.ResourceContextKey.IsFileSystemResource, '1_cutcopypaste');
    appendEditorTitleContextMenuItem(fileCommands_1.REVEAL_IN_EXPLORER_COMMAND_ID, nls.localize(5, null), resources_1.ResourceContextKey.IsFileSystemResource);
    function appendEditorTitleContextMenuItem(id, title, when, group) {
        // Menu
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitleContext, {
            command: { id, title },
            when,
            group: group || '2_files'
        });
    }
    exports.appendEditorTitleContextMenuItem = appendEditorTitleContextMenuItem;
    // Editor Title Menu for Conflict Resolution
    appendSaveConflictEditorTitleAction('workbench.files.action.acceptLocalChanges', nls.localize(6, null), codicons_1.Codicon.check, -10, textFileSaveErrorHandler_1.acceptLocalChangesCommand);
    appendSaveConflictEditorTitleAction('workbench.files.action.revertLocalChanges', nls.localize(7, null), codicons_1.Codicon.discard, -9, textFileSaveErrorHandler_1.revertLocalChangesCommand);
    function appendSaveConflictEditorTitleAction(id, title, icon, order, command) {
        // Command
        commands_1.CommandsRegistry.registerCommand(id, command);
        // Action
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
            command: { id, title, icon },
            when: contextkey_1.ContextKeyExpr.equals(textFileSaveErrorHandler_1.CONFLICT_RESOLUTION_CONTEXT, true),
            group: 'navigation',
            order
        });
    }
    // Menu registration - command palette
    function appendToCommandPalette(id, title, category, when) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id,
                title,
                category
            },
            when
        });
    }
    exports.appendToCommandPalette = appendToCommandPalette;
    appendToCommandPalette(fileCommands_1.COPY_PATH_COMMAND_ID, { value: nls.localize(8, null), original: 'Copy Path of Active File' }, category);
    appendToCommandPalette(fileCommands_1.COPY_RELATIVE_PATH_COMMAND_ID, { value: nls.localize(9, null), original: 'Copy Relative Path of Active File' }, category);
    appendToCommandPalette(fileCommands_1.SAVE_FILE_COMMAND_ID, { value: fileCommands_1.SAVE_FILE_LABEL, original: 'Save' }, category);
    appendToCommandPalette(fileCommands_1.SAVE_FILE_WITHOUT_FORMATTING_COMMAND_ID, { value: fileCommands_1.SAVE_FILE_WITHOUT_FORMATTING_LABEL, original: 'Save without Formatting' }, category);
    appendToCommandPalette(fileCommands_1.SAVE_ALL_IN_GROUP_COMMAND_ID, { value: nls.localize(10, null), original: 'Save All in Group' }, category);
    appendToCommandPalette(fileCommands_1.SAVE_FILES_COMMAND_ID, { value: nls.localize(11, null), original: 'Save All Files' }, category);
    appendToCommandPalette(fileCommands_1.REVERT_FILE_COMMAND_ID, { value: nls.localize(12, null), original: 'Revert File' }, category);
    appendToCommandPalette(fileCommands_1.COMPARE_WITH_SAVED_COMMAND_ID, { value: nls.localize(13, null), original: 'Compare Active File with Saved' }, category);
    appendToCommandPalette(fileCommands_1.SAVE_FILE_AS_COMMAND_ID, { value: fileCommands_1.SAVE_FILE_AS_LABEL, original: 'Save As...' }, category);
    appendToCommandPalette(fileActions_1.NEW_FILE_COMMAND_ID, { value: fileActions_1.NEW_FILE_LABEL, original: 'New File' }, category, contextkeys_1.WorkspaceFolderCountContext.notEqualsTo('0'));
    appendToCommandPalette(fileActions_1.NEW_FOLDER_COMMAND_ID, { value: fileActions_1.NEW_FOLDER_LABEL, original: 'New Folder' }, category, contextkeys_1.WorkspaceFolderCountContext.notEqualsTo('0'));
    appendToCommandPalette(fileActions_1.DOWNLOAD_COMMAND_ID, { value: fileActions_1.DOWNLOAD_LABEL, original: 'Download...' }, category, contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.Scheme.notEqualsTo(network_1.Schemas.file)));
    appendToCommandPalette(fileCommands_1.NEW_UNTITLED_FILE_COMMAND_ID, { value: fileCommands_1.NEW_UNTITLED_FILE_LABEL, original: 'New Untitled File' }, category);
    // Menu registration - open editors
    const isFileOrUntitledResourceContextKey = contextkey_1.ContextKeyExpr.or(resources_1.ResourceContextKey.IsFileSystemResource, resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.untitled));
    const openToSideCommand = {
        id: fileCommands_1.OPEN_TO_SIDE_COMMAND_ID,
        title: nls.localize(14, null)
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: isFileOrUntitledResourceContextKey
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '1_cutcopypaste',
        order: 10,
        command: copyPathCommand,
        when: resources_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '1_cutcopypaste',
        order: 20,
        command: copyRelativePathCommand,
        when: resources_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 10,
        command: {
            id: fileCommands_1.SAVE_FILE_COMMAND_ID,
            title: fileCommands_1.SAVE_FILE_LABEL,
            precondition: fileCommands_1.OpenEditorsDirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.or(
        // Untitled Editors
        resources_1.ResourceContextKey.Scheme.isEqualTo(network_1.Schemas.untitled), 
        // Or:
        contextkey_1.ContextKeyExpr.and(
        // Not: editor groups
        fileCommands_1.OpenEditorsGroupContext.toNegated(), 
        // Not: readonly editors
        fileCommands_1.OpenEditorsReadonlyEditorContext.toNegated(), 
        // Not: auto save after short delay
        filesConfigurationService_1.AutoSaveAfterShortDelayContext.toNegated()))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 20,
        command: {
            id: fileCommands_1.REVERT_FILE_COMMAND_ID,
            title: nls.localize(15, null),
            precondition: fileCommands_1.OpenEditorsDirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.and(
        // Not: editor groups
        fileCommands_1.OpenEditorsGroupContext.toNegated(), 
        // Not: readonly editors
        fileCommands_1.OpenEditorsReadonlyEditorContext.toNegated(), 
        // Not: untitled editors (revert closes them)
        resources_1.ResourceContextKey.Scheme.notEqualsTo(network_1.Schemas.untitled), 
        // Not: auto save after short delay
        filesConfigurationService_1.AutoSaveAfterShortDelayContext.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '2_save',
        order: 30,
        command: {
            id: fileCommands_1.SAVE_ALL_IN_GROUP_COMMAND_ID,
            title: nls.localize(16, null),
            precondition: contextkeys_1.DirtyWorkingCopiesContext
        },
        // Editor Group
        when: fileCommands_1.OpenEditorsGroupContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 10,
        command: {
            id: fileCommands_1.COMPARE_WITH_SAVED_COMMAND_ID,
            title: nls.localize(17, null),
            precondition: fileCommands_1.OpenEditorsDirtyEditorContext
        },
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.IsFileSystemResource, filesConfigurationService_1.AutoSaveAfterShortDelayContext.toNegated(), listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    const compareResourceCommand = {
        id: fileCommands_1.COMPARE_RESOURCE_COMMAND_ID,
        title: nls.localize(18, null)
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.HasResource, fileCommands_1.ResourceSelectedForCompareContext, isFileOrUntitledResourceContextKey, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    const selectForCompareCommand = {
        id: fileCommands_1.SELECT_FOR_COMPARE_COMMAND_ID,
        title: nls.localize(19, null)
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.HasResource, isFileOrUntitledResourceContextKey, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    const compareSelectedCommand = {
        id: fileCommands_1.COMPARE_SELECTED_COMMAND_ID,
        title: nls.localize(20, null)
    };
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection, isFileOrUntitledResourceContextKey)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 10,
        command: {
            id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
            title: nls.localize(21, null)
        },
        when: fileCommands_1.OpenEditorsGroupContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 20,
        command: {
            id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
            title: nls.localize(22, null)
        },
        when: fileCommands_1.OpenEditorsGroupContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 30,
        command: {
            id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID,
            title: nls.localize(23, null)
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.OpenEditorsContext, {
        group: '4_close',
        order: 40,
        command: {
            id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
            title: nls.localize(24, null)
        }
    });
    // Menu registration - explorer
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 4,
        command: {
            id: fileActions_1.NEW_FILE_COMMAND_ID,
            title: fileActions_1.NEW_FILE_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 6,
        command: {
            id: fileActions_1.NEW_FOLDER_COMMAND_ID,
            title: fileActions_1.NEW_FOLDER_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 10,
        command: openToSideCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.HasResource)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: 'navigation',
        order: 20,
        command: {
            id: fileCommands_1.OPEN_WITH_EXPLORER_COMMAND_ID,
            title: nls.localize(25, null),
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), files_1.ExplorerResourceAvailableEditorIdsContext),
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 20,
        command: compareResourceCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.HasResource, fileCommands_1.ResourceSelectedForCompareContext, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: selectForCompareCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection.toNegated())
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '3_compare',
        order: 30,
        command: compareSelectedCommand,
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerFolderContext.toNegated(), resources_1.ResourceContextKey.HasResource, listService_1.WorkbenchListDoubleSelection)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 8,
        command: {
            id: CUT_FILE_ID,
            title: nls.localize(26, null)
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 10,
        command: {
            id: COPY_FILE_ID,
            title: fileActions_1.COPY_FILE_LABEL
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '5_cutcopypaste',
        order: 20,
        command: {
            id: PASTE_FILE_ID,
            title: fileActions_1.PASTE_FILE_LABEL,
            precondition: contextkey_1.ContextKeyExpr.and(files_1.ExplorerResourceNotReadonlyContext, fileActions_1.FileCopiedContext)
        },
        when: files_1.ExplorerFolderContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, ({
        group: '5_cutcopypaste',
        order: 30,
        command: {
            id: fileActions_1.DOWNLOAD_COMMAND_ID,
            title: fileActions_1.DOWNLOAD_LABEL,
        },
        when: contextkey_1.ContextKeyExpr.or(
        // native: for any remote resource
        contextkey_1.ContextKeyExpr.and(contextkeys_2.IsWebContext.toNegated(), resources_1.ResourceContextKey.Scheme.notEqualsTo(network_1.Schemas.file)), 
        // web: for any files
        contextkey_1.ContextKeyExpr.and(contextkeys_2.IsWebContext, files_1.ExplorerFolderContext.toNegated(), files_1.ExplorerRootContext.toNegated()), 
        // web: for any folders if file system API support is provided
        contextkey_1.ContextKeyExpr.and(contextkeys_2.IsWebContext, contextkeys_1.HasWebFileSystemAccess))
    }));
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '6_copypath',
        order: 30,
        command: copyPathCommand,
        when: resources_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '6_copypath',
        order: 30,
        command: copyRelativePathCommand,
        when: resources_1.ResourceContextKey.IsFileSystemResource
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '2_workspace',
        order: 10,
        command: {
            id: workspaceCommands_1.ADD_ROOT_FOLDER_COMMAND_ID,
            title: workspaceCommands_1.ADD_ROOT_FOLDER_LABEL
        },
        when: files_1.ExplorerRootContext
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '2_workspace',
        order: 30,
        command: {
            id: fileCommands_1.REMOVE_ROOT_FOLDER_COMMAND_ID,
            title: fileCommands_1.REMOVE_ROOT_FOLDER_LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 10,
        command: {
            id: RENAME_ID,
            title: fileActions_1.TRIGGER_RENAME_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: files_1.ExplorerRootContext.toNegated()
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 20,
        command: {
            id: MOVE_FILE_TO_TRASH_ID,
            title: fileActions_1.MOVE_FILE_TO_TRASH_LABEL,
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        alt: {
            id: DELETE_FILE_ID,
            title: nls.localize(27, null),
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceMoveableToTrash)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ExplorerContext, {
        group: '7_modification',
        order: 20,
        command: {
            id: DELETE_FILE_ID,
            title: nls.localize(28, null),
            precondition: files_1.ExplorerResourceNotReadonlyContext
        },
        when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext.toNegated(), files_1.ExplorerResourceMoveableToTrash.toNegated())
    });
    // Empty Editor Group Context Menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: fileCommands_1.NEW_UNTITLED_FILE_COMMAND_ID, title: nls.localize(29, null) }, group: '1_file', order: 10 });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EmptyEditorGroupContext, { command: { id: 'workbench.action.quickOpen', title: nls.localize(30, null) }, group: '1_file', order: 20 });
    // File menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '1_new',
        command: {
            id: fileCommands_1.NEW_UNTITLED_FILE_COMMAND_ID,
            title: nls.localize(31, null)
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileCommands_1.SAVE_FILE_COMMAND_ID,
            title: nls.localize(32, null),
            precondition: contextkey_1.ContextKeyExpr.or(editor_1.ActiveEditorContext, contextkey_1.ContextKeyExpr.and(files_1.ExplorerViewletVisibleContext, viewlet_1.SidebarFocusContext))
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileCommands_1.SAVE_FILE_AS_COMMAND_ID,
            title: nls.localize(33, null),
            precondition: contextkey_1.ContextKeyExpr.or(editor_1.ActiveEditorContext, contextkey_1.ContextKeyExpr.and(files_1.ExplorerViewletVisibleContext, viewlet_1.SidebarFocusContext))
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '4_save',
        command: {
            id: fileCommands_1.SAVE_ALL_COMMAND_ID,
            title: nls.localize(34, null),
            precondition: contextkeys_1.DirtyWorkingCopiesContext
        },
        order: 3
    });
    if (platform_2.isMacintosh && !platform_2.isWeb) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
            group: '2_open',
            command: {
                id: workspaceActions_1.OpenFileFolderAction.ID,
                title: nls.localize(35, null)
            },
            order: 1
        });
    }
    else {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
            group: '2_open',
            command: {
                id: workspaceActions_1.OpenFileAction.ID,
                title: nls.localize(36, null)
            },
            order: 1
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
            group: '2_open',
            command: {
                id: workspaceActions_1.OpenFolderAction.ID,
                title: nls.localize(37, null)
            },
            order: 2
        });
    }
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '2_open',
        command: {
            id: workspaceActions_1.OpenWorkspaceAction.ID,
            title: nls.localize(38, null)
        },
        order: 3
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '5_autosave',
        command: {
            id: fileActions_1.ToggleAutoSaveAction.ID,
            title: nls.localize(39, null),
            toggled: contextkey_1.ContextKeyExpr.notEquals('config.files.autoSave', 'off')
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: fileCommands_1.REVERT_FILE_COMMAND_ID,
            title: nls.localize(40, null),
            precondition: contextkey_1.ContextKeyExpr.or(editor_1.ActiveEditorContext, contextkey_1.ContextKeyExpr.and(files_1.ExplorerViewletVisibleContext, viewlet_1.SidebarFocusContext))
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        group: '6_close',
        command: {
            id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
            title: nls.localize(41, null),
            precondition: contextkey_1.ContextKeyExpr.or(editor_1.ActiveEditorContext, contextkey_1.ContextKeyExpr.and(files_1.ExplorerViewletVisibleContext, viewlet_1.SidebarFocusContext))
        },
        order: 2
    });
    // Go to menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '3_global_nav',
        command: {
            id: 'workbench.action.quickOpen',
            title: nls.localize(42, null)
        },
        order: 1
    });
});
//# sourceMappingURL=fileActions.contribution.js.map