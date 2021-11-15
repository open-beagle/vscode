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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorActions", "vs/base/common/actions", "vs/workbench/common/editor", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/history/common/history", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/platform/workspaces/common/workspaces", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/quickinput/common/quickInput", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/base/common/codicons", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/editor/common/editor", "vs/base/common/network"], function (require, exports, nls_1, actions_1, editor_1, layoutService_1, history_1, keybinding_1, commands_1, editorCommands_1, editorGroupsService_1, editorService_1, configuration_1, lifecycle_1, workspaces_1, dialogs_1, workingCopyService_1, quickInput_1, editorQuickAccess_1, codicons_1, filesConfigurationService_1, editor_2, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleEditorTypeAction = exports.ReopenResourcesAction = exports.NewEditorGroupBelowAction = exports.NewEditorGroupAboveAction = exports.NewEditorGroupRightAction = exports.NewEditorGroupLeftAction = exports.BaseCreateEditorGroupAction = exports.EditorLayoutTwoRowsRightAction = exports.EditorLayoutTwoColumnsBottomAction = exports.EditorLayoutTwoByTwoGridAction = exports.EditorLayoutThreeRowsAction = exports.EditorLayoutTwoRowsAction = exports.EditorLayoutThreeColumnsAction = exports.EditorLayoutTwoColumnsAction = exports.EditorLayoutSingleAction = exports.MoveEditorToLastGroupAction = exports.MoveEditorToFirstGroupAction = exports.MoveEditorToRightGroupAction = exports.MoveEditorToLeftGroupAction = exports.MoveEditorToBelowGroupAction = exports.MoveEditorToAboveGroupAction = exports.MoveEditorToNextGroupAction = exports.MoveEditorToPreviousGroupAction = exports.MoveEditorRightInGroupAction = exports.MoveEditorLeftInGroupAction = exports.ClearEditorHistoryAction = exports.OpenPreviousRecentlyUsedEditorInGroupAction = exports.OpenNextRecentlyUsedEditorInGroupAction = exports.OpenPreviousRecentlyUsedEditorAction = exports.OpenNextRecentlyUsedEditorAction = exports.QuickAccessPreviousEditorFromHistoryAction = exports.QuickAccessLeastRecentlyUsedEditorInGroupAction = exports.QuickAccessPreviousRecentlyUsedEditorInGroupAction = exports.QuickAccessLeastRecentlyUsedEditorAction = exports.QuickAccessPreviousRecentlyUsedEditorAction = exports.BaseQuickAccessEditorAction = exports.ShowAllEditorsByMostRecentlyUsedAction = exports.ShowAllEditorsByAppearanceAction = exports.ShowEditorsInActiveGroupByMostRecentlyUsedAction = exports.ClearRecentFilesAction = exports.ReopenClosedEditorAction = exports.NavigateLastAction = exports.NavigateToLastEditLocationAction = exports.NavigateBackwardsAction = exports.NavigateForwardAction = exports.OpenLastEditorInGroup = exports.OpenFirstEditorInGroup = exports.OpenPreviousEditorInGroup = exports.OpenNextEditorInGroup = exports.OpenPreviousEditor = exports.OpenNextEditor = exports.BaseNavigateEditorAction = exports.MaximizeGroupAction = exports.ToggleGroupSizesAction = exports.ResetGroupSizesAction = exports.MinimizeOtherGroupsAction = exports.DuplicateGroupDownAction = exports.DuplicateGroupUpAction = exports.DuplicateGroupRightAction = exports.DuplicateGroupLeftAction = exports.MoveGroupDownAction = exports.MoveGroupUpAction = exports.MoveGroupRightAction = exports.MoveGroupLeftAction = exports.CloseEditorInAllGroupsAction = exports.CloseEditorsInOtherGroupsAction = exports.CloseAllEditorGroupsAction = exports.CloseAllEditorsAction = exports.CloseLeftEditorsInGroupAction = exports.RevertAndCloseEditorAction = exports.CloseOneEditorAction = exports.UnpinEditorAction = exports.CloseEditorAction = exports.FocusBelowGroup = exports.FocusAboveGroup = exports.FocusRightGroup = exports.FocusLeftGroup = exports.FocusPreviousGroup = exports.FocusNextGroup = exports.FocusLastGroupAction = exports.FocusFirstGroupAction = exports.BaseFocusGroupAction = exports.FocusActiveGroupAction = exports.NavigateBetweenGroupsAction = exports.JoinAllGroupsAction = exports.JoinTwoGroupsAction = exports.SplitEditorDownAction = exports.SplitEditorUpAction = exports.SplitEditorRightAction = exports.SplitEditorLeftAction = exports.SplitEditorOrthogonalAction = exports.SplitEditorAction = exports.BaseSplitEditorAction = exports.ExecuteCommandAction = void 0;
    class ExecuteCommandAction extends actions_1.Action {
        constructor(id, label, commandId, commandService, commandArgs) {
            super(id, label);
            this.commandId = commandId;
            this.commandService = commandService;
            this.commandArgs = commandArgs;
        }
        run() {
            return this.commandService.executeCommand(this.commandId, this.commandArgs);
        }
    }
    exports.ExecuteCommandAction = ExecuteCommandAction;
    class BaseSplitEditorAction extends actions_1.Action {
        constructor(id, label, editorGroupService, configurationService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
            this.configurationService = configurationService;
            this.toDispose = this._register(new lifecycle_1.DisposableStore());
            this.direction = this.getDirection();
            this.registerListeners();
        }
        getDirection() {
            return (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this.configurationService);
        }
        registerListeners() {
            this.toDispose.add(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('workbench.editor.openSideBySideDirection')) {
                    this.direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this.configurationService);
                }
            }));
        }
        async run(context) {
            (0, editorCommands_1.splitEditor)(this.editorGroupService, this.direction, context);
        }
    }
    exports.BaseSplitEditorAction = BaseSplitEditorAction;
    let SplitEditorAction = class SplitEditorAction extends BaseSplitEditorAction {
        constructor(id, label, editorGroupService, configurationService) {
            super(id, label, editorGroupService, configurationService);
        }
    };
    SplitEditorAction.ID = 'workbench.action.splitEditor';
    SplitEditorAction.LABEL = (0, nls_1.localize)(0, null);
    SplitEditorAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, configuration_1.IConfigurationService)
    ], SplitEditorAction);
    exports.SplitEditorAction = SplitEditorAction;
    let SplitEditorOrthogonalAction = class SplitEditorOrthogonalAction extends BaseSplitEditorAction {
        constructor(id, label, editorGroupService, configurationService) {
            super(id, label, editorGroupService, configurationService);
        }
        getDirection() {
            const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(this.configurationService);
            return direction === 3 /* RIGHT */ ? 1 /* DOWN */ : 3 /* RIGHT */;
        }
    };
    SplitEditorOrthogonalAction.ID = 'workbench.action.splitEditorOrthogonal';
    SplitEditorOrthogonalAction.LABEL = (0, nls_1.localize)(1, null);
    SplitEditorOrthogonalAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, configuration_1.IConfigurationService)
    ], SplitEditorOrthogonalAction);
    exports.SplitEditorOrthogonalAction = SplitEditorOrthogonalAction;
    let SplitEditorLeftAction = class SplitEditorLeftAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.SPLIT_EDITOR_LEFT, commandService);
        }
    };
    SplitEditorLeftAction.ID = editorCommands_1.SPLIT_EDITOR_LEFT;
    SplitEditorLeftAction.LABEL = (0, nls_1.localize)(2, null);
    SplitEditorLeftAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], SplitEditorLeftAction);
    exports.SplitEditorLeftAction = SplitEditorLeftAction;
    let SplitEditorRightAction = class SplitEditorRightAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.SPLIT_EDITOR_RIGHT, commandService);
        }
    };
    SplitEditorRightAction.ID = editorCommands_1.SPLIT_EDITOR_RIGHT;
    SplitEditorRightAction.LABEL = (0, nls_1.localize)(3, null);
    SplitEditorRightAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], SplitEditorRightAction);
    exports.SplitEditorRightAction = SplitEditorRightAction;
    let SplitEditorUpAction = class SplitEditorUpAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.SPLIT_EDITOR_UP, commandService);
        }
    };
    SplitEditorUpAction.ID = editorCommands_1.SPLIT_EDITOR_UP;
    SplitEditorUpAction.LABEL = (0, nls_1.localize)(4, null);
    SplitEditorUpAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], SplitEditorUpAction);
    exports.SplitEditorUpAction = SplitEditorUpAction;
    let SplitEditorDownAction = class SplitEditorDownAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.SPLIT_EDITOR_DOWN, commandService);
        }
    };
    SplitEditorDownAction.ID = editorCommands_1.SPLIT_EDITOR_DOWN;
    SplitEditorDownAction.LABEL = (0, nls_1.localize)(5, null);
    SplitEditorDownAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], SplitEditorDownAction);
    exports.SplitEditorDownAction = SplitEditorDownAction;
    let JoinTwoGroupsAction = class JoinTwoGroupsAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run(context) {
            let sourceGroup;
            if (context && typeof context.groupId === 'number') {
                sourceGroup = this.editorGroupService.getGroup(context.groupId);
            }
            else {
                sourceGroup = this.editorGroupService.activeGroup;
            }
            if (sourceGroup) {
                const targetGroupDirections = [3 /* RIGHT */, 1 /* DOWN */, 2 /* LEFT */, 0 /* UP */];
                for (const targetGroupDirection of targetGroupDirections) {
                    const targetGroup = this.editorGroupService.findGroup({ direction: targetGroupDirection }, sourceGroup);
                    if (targetGroup && sourceGroup !== targetGroup) {
                        this.editorGroupService.mergeGroup(sourceGroup, targetGroup);
                        break;
                    }
                }
            }
        }
    };
    JoinTwoGroupsAction.ID = 'workbench.action.joinTwoGroups';
    JoinTwoGroupsAction.LABEL = (0, nls_1.localize)(6, null);
    JoinTwoGroupsAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], JoinTwoGroupsAction);
    exports.JoinTwoGroupsAction = JoinTwoGroupsAction;
    let JoinAllGroupsAction = class JoinAllGroupsAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run() {
            this.editorGroupService.mergeAllGroups();
        }
    };
    JoinAllGroupsAction.ID = 'workbench.action.joinAllGroups';
    JoinAllGroupsAction.LABEL = (0, nls_1.localize)(7, null);
    JoinAllGroupsAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], JoinAllGroupsAction);
    exports.JoinAllGroupsAction = JoinAllGroupsAction;
    let NavigateBetweenGroupsAction = class NavigateBetweenGroupsAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run() {
            const nextGroup = this.editorGroupService.findGroup({ location: 2 /* NEXT */ }, this.editorGroupService.activeGroup, true);
            nextGroup.focus();
        }
    };
    NavigateBetweenGroupsAction.ID = 'workbench.action.navigateEditorGroups';
    NavigateBetweenGroupsAction.LABEL = (0, nls_1.localize)(8, null);
    NavigateBetweenGroupsAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], NavigateBetweenGroupsAction);
    exports.NavigateBetweenGroupsAction = NavigateBetweenGroupsAction;
    let FocusActiveGroupAction = class FocusActiveGroupAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run() {
            this.editorGroupService.activeGroup.focus();
        }
    };
    FocusActiveGroupAction.ID = 'workbench.action.focusActiveEditorGroup';
    FocusActiveGroupAction.LABEL = (0, nls_1.localize)(9, null);
    FocusActiveGroupAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusActiveGroupAction);
    exports.FocusActiveGroupAction = FocusActiveGroupAction;
    let BaseFocusGroupAction = class BaseFocusGroupAction extends actions_1.Action {
        constructor(id, label, scope, editorGroupService) {
            super(id, label);
            this.scope = scope;
            this.editorGroupService = editorGroupService;
        }
        async run() {
            const group = this.editorGroupService.findGroup(this.scope, this.editorGroupService.activeGroup, true);
            if (group) {
                group.focus();
            }
        }
    };
    BaseFocusGroupAction = __decorate([
        __param(3, editorGroupsService_1.IEditorGroupsService)
    ], BaseFocusGroupAction);
    exports.BaseFocusGroupAction = BaseFocusGroupAction;
    let FocusFirstGroupAction = class FocusFirstGroupAction extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { location: 0 /* FIRST */ }, editorGroupService);
        }
    };
    FocusFirstGroupAction.ID = 'workbench.action.focusFirstEditorGroup';
    FocusFirstGroupAction.LABEL = (0, nls_1.localize)(10, null);
    FocusFirstGroupAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusFirstGroupAction);
    exports.FocusFirstGroupAction = FocusFirstGroupAction;
    let FocusLastGroupAction = class FocusLastGroupAction extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { location: 1 /* LAST */ }, editorGroupService);
        }
    };
    FocusLastGroupAction.ID = 'workbench.action.focusLastEditorGroup';
    FocusLastGroupAction.LABEL = (0, nls_1.localize)(11, null);
    FocusLastGroupAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusLastGroupAction);
    exports.FocusLastGroupAction = FocusLastGroupAction;
    let FocusNextGroup = class FocusNextGroup extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { location: 2 /* NEXT */ }, editorGroupService);
        }
    };
    FocusNextGroup.ID = 'workbench.action.focusNextGroup';
    FocusNextGroup.LABEL = (0, nls_1.localize)(12, null);
    FocusNextGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusNextGroup);
    exports.FocusNextGroup = FocusNextGroup;
    let FocusPreviousGroup = class FocusPreviousGroup extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { location: 3 /* PREVIOUS */ }, editorGroupService);
        }
    };
    FocusPreviousGroup.ID = 'workbench.action.focusPreviousGroup';
    FocusPreviousGroup.LABEL = (0, nls_1.localize)(13, null);
    FocusPreviousGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusPreviousGroup);
    exports.FocusPreviousGroup = FocusPreviousGroup;
    let FocusLeftGroup = class FocusLeftGroup extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { direction: 2 /* LEFT */ }, editorGroupService);
        }
    };
    FocusLeftGroup.ID = 'workbench.action.focusLeftGroup';
    FocusLeftGroup.LABEL = (0, nls_1.localize)(14, null);
    FocusLeftGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusLeftGroup);
    exports.FocusLeftGroup = FocusLeftGroup;
    let FocusRightGroup = class FocusRightGroup extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { direction: 3 /* RIGHT */ }, editorGroupService);
        }
    };
    FocusRightGroup.ID = 'workbench.action.focusRightGroup';
    FocusRightGroup.LABEL = (0, nls_1.localize)(15, null);
    FocusRightGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusRightGroup);
    exports.FocusRightGroup = FocusRightGroup;
    let FocusAboveGroup = class FocusAboveGroup extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { direction: 0 /* UP */ }, editorGroupService);
        }
    };
    FocusAboveGroup.ID = 'workbench.action.focusAboveGroup';
    FocusAboveGroup.LABEL = (0, nls_1.localize)(16, null);
    FocusAboveGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusAboveGroup);
    exports.FocusAboveGroup = FocusAboveGroup;
    let FocusBelowGroup = class FocusBelowGroup extends BaseFocusGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, { direction: 1 /* DOWN */ }, editorGroupService);
        }
    };
    FocusBelowGroup.ID = 'workbench.action.focusBelowGroup';
    FocusBelowGroup.LABEL = (0, nls_1.localize)(17, null);
    FocusBelowGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], FocusBelowGroup);
    exports.FocusBelowGroup = FocusBelowGroup;
    let CloseEditorAction = class CloseEditorAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, codicons_1.Codicon.close.classNames);
            this.commandService = commandService;
        }
        run(context) {
            return this.commandService.executeCommand(editorCommands_1.CLOSE_EDITOR_COMMAND_ID, undefined, context);
        }
    };
    CloseEditorAction.ID = 'workbench.action.closeActiveEditor';
    CloseEditorAction.LABEL = (0, nls_1.localize)(18, null);
    CloseEditorAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], CloseEditorAction);
    exports.CloseEditorAction = CloseEditorAction;
    let UnpinEditorAction = class UnpinEditorAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, codicons_1.Codicon.pinned.classNames);
            this.commandService = commandService;
        }
        run(context) {
            return this.commandService.executeCommand(editorCommands_1.UNPIN_EDITOR_COMMAND_ID, undefined, context);
        }
    };
    UnpinEditorAction.ID = 'workbench.action.unpinActiveEditor';
    UnpinEditorAction.LABEL = (0, nls_1.localize)(19, null);
    UnpinEditorAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], UnpinEditorAction);
    exports.UnpinEditorAction = UnpinEditorAction;
    let CloseOneEditorAction = class CloseOneEditorAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label, codicons_1.Codicon.close.classNames);
            this.editorGroupService = editorGroupService;
        }
        async run(context) {
            let group;
            let editorIndex;
            if (context) {
                group = this.editorGroupService.getGroup(context.groupId);
                if (group) {
                    editorIndex = context.editorIndex; // only allow editor at index if group is valid
                }
            }
            if (!group) {
                group = this.editorGroupService.activeGroup;
            }
            // Close specific editor in group
            if (typeof editorIndex === 'number') {
                const editorAtIndex = group.getEditorByIndex(editorIndex);
                if (editorAtIndex) {
                    return group.closeEditor(editorAtIndex);
                }
            }
            // Otherwise close active editor in group
            if (group.activeEditor) {
                return group.closeEditor(group.activeEditor);
            }
        }
    };
    CloseOneEditorAction.ID = 'workbench.action.closeActiveEditor';
    CloseOneEditorAction.LABEL = (0, nls_1.localize)(20, null);
    CloseOneEditorAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], CloseOneEditorAction);
    exports.CloseOneEditorAction = CloseOneEditorAction;
    let RevertAndCloseEditorAction = class RevertAndCloseEditorAction extends actions_1.Action {
        constructor(id, label, editorService) {
            super(id, label);
            this.editorService = editorService;
        }
        async run() {
            const activeEditorPane = this.editorService.activeEditorPane;
            if (activeEditorPane) {
                const editor = activeEditorPane.input;
                const group = activeEditorPane.group;
                // first try a normal revert where the contents of the editor are restored
                try {
                    await this.editorService.revert({ editor, groupId: group.id });
                }
                catch (error) {
                    // if that fails, since we are about to close the editor, we accept that
                    // the editor cannot be reverted and instead do a soft revert that just
                    // enables us to close the editor. With this, a user can always close a
                    // dirty editor even when reverting fails.
                    await this.editorService.revert({ editor, groupId: group.id }, { soft: true });
                }
                return group.closeEditor(editor);
            }
        }
    };
    RevertAndCloseEditorAction.ID = 'workbench.action.revertAndCloseActiveEditor';
    RevertAndCloseEditorAction.LABEL = (0, nls_1.localize)(21, null);
    RevertAndCloseEditorAction = __decorate([
        __param(2, editorService_1.IEditorService)
    ], RevertAndCloseEditorAction);
    exports.RevertAndCloseEditorAction = RevertAndCloseEditorAction;
    let CloseLeftEditorsInGroupAction = class CloseLeftEditorsInGroupAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run(context) {
            const { group, editor } = this.getTarget(context);
            if (group && editor) {
                return group.closeEditors({ direction: 0 /* LEFT */, except: editor, excludeSticky: true });
            }
        }
        getTarget(context) {
            if (context) {
                return { editor: context.editor, group: this.editorGroupService.getGroup(context.groupId) };
            }
            // Fallback to active group
            return { group: this.editorGroupService.activeGroup, editor: this.editorGroupService.activeGroup.activeEditor };
        }
    };
    CloseLeftEditorsInGroupAction.ID = 'workbench.action.closeEditorsToTheLeft';
    CloseLeftEditorsInGroupAction.LABEL = (0, nls_1.localize)(22, null);
    CloseLeftEditorsInGroupAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], CloseLeftEditorsInGroupAction);
    exports.CloseLeftEditorsInGroupAction = CloseLeftEditorsInGroupAction;
    class BaseCloseAllAction extends actions_1.Action {
        constructor(id, label, clazz, workingCopyService, fileDialogService, editorGroupService, editorService, filesConfigurationService) {
            super(id, label, clazz);
            this.workingCopyService = workingCopyService;
            this.fileDialogService = fileDialogService;
            this.editorGroupService = editorGroupService;
            this.editorService = editorService;
            this.filesConfigurationService = filesConfigurationService;
        }
        get groupsToClose() {
            const groupsToClose = [];
            // Close editors in reverse order of their grid appearance so that the editor
            // group that is the first (top-left) remains. This helps to keep view state
            // for editors around that have been opened in this visually first group.
            const groups = this.editorGroupService.getGroups(2 /* GRID_APPEARANCE */);
            for (let i = groups.length - 1; i >= 0; i--) {
                groupsToClose.push(groups[i]);
            }
            return groupsToClose;
        }
        async run() {
            // Just close all if there are no dirty editors
            if (!this.workingCopyService.hasDirty) {
                return this.doCloseAll();
            }
            // Otherwise ask for combined confirmation and make sure
            // to bring each dirty editor to the front so that the user
            // can review if the files should be changed or not.
            await Promise.all(this.groupsToClose.map(groupToClose => {
                for (const editor of groupToClose.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: this.excludeSticky })) {
                    if (editor.isDirty() && !editor.isSaving() /* ignore editors that are being saved */) {
                        return groupToClose.openEditor(editor);
                    }
                }
                return undefined;
            }));
            const dirtyEditorsToConfirm = new Set();
            const dirtyEditorsToAutoSave = new Set();
            for (const editor of this.editorService.getEditors(1 /* SEQUENTIAL */, { excludeSticky: this.excludeSticky }).map(({ editor }) => editor)) {
                if (!editor.isDirty() || editor.isSaving()) {
                    continue; // only interested in dirty editors (unless in the process of saving)
                }
                // Auto-save on focus change: assume to Save unless the editor is untitled
                // because bringing up a dialog would save in this case anyway.
                if (this.filesConfigurationService.getAutoSaveMode() === 3 /* ON_FOCUS_CHANGE */ && !editor.isUntitled()) {
                    dirtyEditorsToAutoSave.add(editor);
                }
                // No auto-save on focus change: ask user
                else {
                    let name;
                    if (editor instanceof editor_1.SideBySideEditorInput) {
                        name = editor.primary.getName(); // prefer shorter names by using primary's name in this case
                    }
                    else {
                        name = editor.getName();
                    }
                    dirtyEditorsToConfirm.add(name);
                }
            }
            let confirmation;
            let saveReason = 1 /* EXPLICIT */;
            if (dirtyEditorsToConfirm.size > 0) {
                confirmation = await this.fileDialogService.showSaveConfirm(Array.from(dirtyEditorsToConfirm.values()));
            }
            else if (dirtyEditorsToAutoSave.size > 0) {
                confirmation = 0 /* SAVE */;
                saveReason = 3 /* FOCUS_CHANGE */;
            }
            else {
                confirmation = 1 /* DONT_SAVE */;
            }
            // Handle result from asking user
            let result = undefined;
            switch (confirmation) {
                case 2 /* CANCEL */:
                    return;
                case 1 /* DONT_SAVE */:
                    result = await this.editorService.revertAll({ soft: true, includeUntitled: true, excludeSticky: this.excludeSticky });
                    break;
                case 0 /* SAVE */:
                    result = await this.editorService.saveAll({ reason: saveReason, includeUntitled: true, excludeSticky: this.excludeSticky });
                    break;
            }
            // Only continue to close editors if we either have no more dirty
            // editors or the result from the save/revert was successful
            if (!this.workingCopyService.hasDirty || result) {
                return this.doCloseAll();
            }
        }
    }
    let CloseAllEditorsAction = class CloseAllEditorsAction extends BaseCloseAllAction {
        constructor(id, label, workingCopyService, fileDialogService, editorGroupService, editorService, filesConfigurationService) {
            super(id, label, codicons_1.Codicon.closeAll.classNames, workingCopyService, fileDialogService, editorGroupService, editorService, filesConfigurationService);
        }
        get excludeSticky() {
            return true;
        }
        async doCloseAll() {
            await Promise.all(this.groupsToClose.map(group => group.closeAllEditors({ excludeSticky: true })));
        }
    };
    CloseAllEditorsAction.ID = 'workbench.action.closeAllEditors';
    CloseAllEditorsAction.LABEL = (0, nls_1.localize)(23, null);
    CloseAllEditorsAction = __decorate([
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, dialogs_1.IFileDialogService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, editorService_1.IEditorService),
        __param(6, filesConfigurationService_1.IFilesConfigurationService)
    ], CloseAllEditorsAction);
    exports.CloseAllEditorsAction = CloseAllEditorsAction;
    let CloseAllEditorGroupsAction = class CloseAllEditorGroupsAction extends BaseCloseAllAction {
        constructor(id, label, workingCopyService, fileDialogService, editorGroupService, editorService, filesConfigurationService) {
            super(id, label, undefined, workingCopyService, fileDialogService, editorGroupService, editorService, filesConfigurationService);
        }
        get excludeSticky() {
            return false;
        }
        async doCloseAll() {
            await Promise.all(this.groupsToClose.map(group => group.closeAllEditors()));
            for (const groupToClose of this.groupsToClose) {
                this.editorGroupService.removeGroup(groupToClose);
            }
        }
    };
    CloseAllEditorGroupsAction.ID = 'workbench.action.closeAllGroups';
    CloseAllEditorGroupsAction.LABEL = (0, nls_1.localize)(24, null);
    CloseAllEditorGroupsAction = __decorate([
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, dialogs_1.IFileDialogService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, editorService_1.IEditorService),
        __param(6, filesConfigurationService_1.IFilesConfigurationService)
    ], CloseAllEditorGroupsAction);
    exports.CloseAllEditorGroupsAction = CloseAllEditorGroupsAction;
    let CloseEditorsInOtherGroupsAction = class CloseEditorsInOtherGroupsAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run(context) {
            const groupToSkip = context ? this.editorGroupService.getGroup(context.groupId) : this.editorGroupService.activeGroup;
            await Promise.all(this.editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).map(async (group) => {
                if (groupToSkip && group.id === groupToSkip.id) {
                    return;
                }
                return group.closeAllEditors({ excludeSticky: true });
            }));
        }
    };
    CloseEditorsInOtherGroupsAction.ID = 'workbench.action.closeEditorsInOtherGroups';
    CloseEditorsInOtherGroupsAction.LABEL = (0, nls_1.localize)(25, null);
    CloseEditorsInOtherGroupsAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], CloseEditorsInOtherGroupsAction);
    exports.CloseEditorsInOtherGroupsAction = CloseEditorsInOtherGroupsAction;
    let CloseEditorInAllGroupsAction = class CloseEditorInAllGroupsAction extends actions_1.Action {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
            this.editorService = editorService;
        }
        async run() {
            const activeEditor = this.editorService.activeEditor;
            if (activeEditor) {
                await Promise.all(this.editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */).map(group => group.closeEditor(activeEditor)));
            }
        }
    };
    CloseEditorInAllGroupsAction.ID = 'workbench.action.closeEditorInAllGroups';
    CloseEditorInAllGroupsAction.LABEL = (0, nls_1.localize)(26, null);
    CloseEditorInAllGroupsAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, editorService_1.IEditorService)
    ], CloseEditorInAllGroupsAction);
    exports.CloseEditorInAllGroupsAction = CloseEditorInAllGroupsAction;
    class BaseMoveCopyGroupAction extends actions_1.Action {
        constructor(id, label, direction, isMove, editorGroupService) {
            super(id, label);
            this.direction = direction;
            this.isMove = isMove;
            this.editorGroupService = editorGroupService;
        }
        async run(context) {
            let sourceGroup;
            if (context && typeof context.groupId === 'number') {
                sourceGroup = this.editorGroupService.getGroup(context.groupId);
            }
            else {
                sourceGroup = this.editorGroupService.activeGroup;
            }
            if (sourceGroup) {
                let resultGroup = undefined;
                if (this.isMove) {
                    const targetGroup = this.findTargetGroup(sourceGroup);
                    if (targetGroup) {
                        resultGroup = this.editorGroupService.moveGroup(sourceGroup, targetGroup, this.direction);
                    }
                }
                else {
                    resultGroup = this.editorGroupService.copyGroup(sourceGroup, sourceGroup, this.direction);
                }
                if (resultGroup) {
                    this.editorGroupService.activateGroup(resultGroup);
                }
            }
        }
        findTargetGroup(sourceGroup) {
            const targetNeighbours = [this.direction];
            // Allow the target group to be in alternative locations to support more
            // scenarios of moving the group to the taret location.
            // Helps for https://github.com/microsoft/vscode/issues/50741
            switch (this.direction) {
                case 2 /* LEFT */:
                case 3 /* RIGHT */:
                    targetNeighbours.push(0 /* UP */, 1 /* DOWN */);
                    break;
                case 0 /* UP */:
                case 1 /* DOWN */:
                    targetNeighbours.push(2 /* LEFT */, 3 /* RIGHT */);
                    break;
            }
            for (const targetNeighbour of targetNeighbours) {
                const targetNeighbourGroup = this.editorGroupService.findGroup({ direction: targetNeighbour }, sourceGroup);
                if (targetNeighbourGroup) {
                    return targetNeighbourGroup;
                }
            }
            return undefined;
        }
    }
    class BaseMoveGroupAction extends BaseMoveCopyGroupAction {
        constructor(id, label, direction, editorGroupService) {
            super(id, label, direction, true, editorGroupService);
        }
    }
    let MoveGroupLeftAction = class MoveGroupLeftAction extends BaseMoveGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 2 /* LEFT */, editorGroupService);
        }
    };
    MoveGroupLeftAction.ID = 'workbench.action.moveActiveEditorGroupLeft';
    MoveGroupLeftAction.LABEL = (0, nls_1.localize)(27, null);
    MoveGroupLeftAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], MoveGroupLeftAction);
    exports.MoveGroupLeftAction = MoveGroupLeftAction;
    let MoveGroupRightAction = class MoveGroupRightAction extends BaseMoveGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 3 /* RIGHT */, editorGroupService);
        }
    };
    MoveGroupRightAction.ID = 'workbench.action.moveActiveEditorGroupRight';
    MoveGroupRightAction.LABEL = (0, nls_1.localize)(28, null);
    MoveGroupRightAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], MoveGroupRightAction);
    exports.MoveGroupRightAction = MoveGroupRightAction;
    let MoveGroupUpAction = class MoveGroupUpAction extends BaseMoveGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 0 /* UP */, editorGroupService);
        }
    };
    MoveGroupUpAction.ID = 'workbench.action.moveActiveEditorGroupUp';
    MoveGroupUpAction.LABEL = (0, nls_1.localize)(29, null);
    MoveGroupUpAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], MoveGroupUpAction);
    exports.MoveGroupUpAction = MoveGroupUpAction;
    let MoveGroupDownAction = class MoveGroupDownAction extends BaseMoveGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 1 /* DOWN */, editorGroupService);
        }
    };
    MoveGroupDownAction.ID = 'workbench.action.moveActiveEditorGroupDown';
    MoveGroupDownAction.LABEL = (0, nls_1.localize)(30, null);
    MoveGroupDownAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], MoveGroupDownAction);
    exports.MoveGroupDownAction = MoveGroupDownAction;
    class BaseDuplicateGroupAction extends BaseMoveCopyGroupAction {
        constructor(id, label, direction, editorGroupService) {
            super(id, label, direction, false, editorGroupService);
        }
    }
    let DuplicateGroupLeftAction = class DuplicateGroupLeftAction extends BaseDuplicateGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 2 /* LEFT */, editorGroupService);
        }
    };
    DuplicateGroupLeftAction.ID = 'workbench.action.duplicateActiveEditorGroupLeft';
    DuplicateGroupLeftAction.LABEL = (0, nls_1.localize)(31, null);
    DuplicateGroupLeftAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], DuplicateGroupLeftAction);
    exports.DuplicateGroupLeftAction = DuplicateGroupLeftAction;
    let DuplicateGroupRightAction = class DuplicateGroupRightAction extends BaseDuplicateGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 3 /* RIGHT */, editorGroupService);
        }
    };
    DuplicateGroupRightAction.ID = 'workbench.action.duplicateActiveEditorGroupRight';
    DuplicateGroupRightAction.LABEL = (0, nls_1.localize)(32, null);
    DuplicateGroupRightAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], DuplicateGroupRightAction);
    exports.DuplicateGroupRightAction = DuplicateGroupRightAction;
    let DuplicateGroupUpAction = class DuplicateGroupUpAction extends BaseDuplicateGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 0 /* UP */, editorGroupService);
        }
    };
    DuplicateGroupUpAction.ID = 'workbench.action.duplicateActiveEditorGroupUp';
    DuplicateGroupUpAction.LABEL = (0, nls_1.localize)(33, null);
    DuplicateGroupUpAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], DuplicateGroupUpAction);
    exports.DuplicateGroupUpAction = DuplicateGroupUpAction;
    let DuplicateGroupDownAction = class DuplicateGroupDownAction extends BaseDuplicateGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 1 /* DOWN */, editorGroupService);
        }
    };
    DuplicateGroupDownAction.ID = 'workbench.action.duplicateActiveEditorGroupDown';
    DuplicateGroupDownAction.LABEL = (0, nls_1.localize)(34, null);
    DuplicateGroupDownAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], DuplicateGroupDownAction);
    exports.DuplicateGroupDownAction = DuplicateGroupDownAction;
    let MinimizeOtherGroupsAction = class MinimizeOtherGroupsAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run() {
            this.editorGroupService.arrangeGroups(0 /* MINIMIZE_OTHERS */);
        }
    };
    MinimizeOtherGroupsAction.ID = 'workbench.action.minimizeOtherEditors';
    MinimizeOtherGroupsAction.LABEL = (0, nls_1.localize)(35, null);
    MinimizeOtherGroupsAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], MinimizeOtherGroupsAction);
    exports.MinimizeOtherGroupsAction = MinimizeOtherGroupsAction;
    let ResetGroupSizesAction = class ResetGroupSizesAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run() {
            this.editorGroupService.arrangeGroups(1 /* EVEN */);
        }
    };
    ResetGroupSizesAction.ID = 'workbench.action.evenEditorWidths';
    ResetGroupSizesAction.LABEL = (0, nls_1.localize)(36, null);
    ResetGroupSizesAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], ResetGroupSizesAction);
    exports.ResetGroupSizesAction = ResetGroupSizesAction;
    let ToggleGroupSizesAction = class ToggleGroupSizesAction extends actions_1.Action {
        constructor(id, label, editorGroupService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
        }
        async run() {
            this.editorGroupService.arrangeGroups(2 /* TOGGLE */);
        }
    };
    ToggleGroupSizesAction.ID = 'workbench.action.toggleEditorWidths';
    ToggleGroupSizesAction.LABEL = (0, nls_1.localize)(37, null);
    ToggleGroupSizesAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], ToggleGroupSizesAction);
    exports.ToggleGroupSizesAction = ToggleGroupSizesAction;
    let MaximizeGroupAction = class MaximizeGroupAction extends actions_1.Action {
        constructor(id, label, editorService, editorGroupService, layoutService) {
            super(id, label);
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.layoutService = layoutService;
        }
        async run() {
            if (this.editorService.activeEditor) {
                this.editorGroupService.arrangeGroups(0 /* MINIMIZE_OTHERS */);
                this.layoutService.setSideBarHidden(true);
            }
        }
    };
    MaximizeGroupAction.ID = 'workbench.action.maximizeEditor';
    MaximizeGroupAction.LABEL = (0, nls_1.localize)(38, null);
    MaximizeGroupAction = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, layoutService_1.IWorkbenchLayoutService)
    ], MaximizeGroupAction);
    exports.MaximizeGroupAction = MaximizeGroupAction;
    class BaseNavigateEditorAction extends actions_1.Action {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label);
            this.editorGroupService = editorGroupService;
            this.editorService = editorService;
        }
        async run() {
            const result = this.navigate();
            if (!result) {
                return;
            }
            const { groupId, editor } = result;
            if (!editor) {
                return;
            }
            const group = this.editorGroupService.getGroup(groupId);
            if (group) {
                await group.openEditor(editor);
            }
        }
    }
    exports.BaseNavigateEditorAction = BaseNavigateEditorAction;
    let OpenNextEditor = class OpenNextEditor extends BaseNavigateEditorAction {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label, editorGroupService, editorService);
        }
        navigate() {
            // Navigate in active group if possible
            const activeGroup = this.editorGroupService.activeGroup;
            const activeGroupEditors = activeGroup.getEditors(1 /* SEQUENTIAL */);
            const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
            if (activeEditorIndex + 1 < activeGroupEditors.length) {
                return { editor: activeGroupEditors[activeEditorIndex + 1], groupId: activeGroup.id };
            }
            // Otherwise try in next group
            const nextGroup = this.editorGroupService.findGroup({ location: 2 /* NEXT */ }, this.editorGroupService.activeGroup, true);
            if (nextGroup) {
                const previousGroupEditors = nextGroup.getEditors(1 /* SEQUENTIAL */);
                return { editor: previousGroupEditors[0], groupId: nextGroup.id };
            }
            return undefined;
        }
    };
    OpenNextEditor.ID = 'workbench.action.nextEditor';
    OpenNextEditor.LABEL = (0, nls_1.localize)(39, null);
    OpenNextEditor = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, editorService_1.IEditorService)
    ], OpenNextEditor);
    exports.OpenNextEditor = OpenNextEditor;
    let OpenPreviousEditor = class OpenPreviousEditor extends BaseNavigateEditorAction {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label, editorGroupService, editorService);
        }
        navigate() {
            // Navigate in active group if possible
            const activeGroup = this.editorGroupService.activeGroup;
            const activeGroupEditors = activeGroup.getEditors(1 /* SEQUENTIAL */);
            const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
            if (activeEditorIndex > 0) {
                return { editor: activeGroupEditors[activeEditorIndex - 1], groupId: activeGroup.id };
            }
            // Otherwise try in previous group
            const previousGroup = this.editorGroupService.findGroup({ location: 3 /* PREVIOUS */ }, this.editorGroupService.activeGroup, true);
            if (previousGroup) {
                const previousGroupEditors = previousGroup.getEditors(1 /* SEQUENTIAL */);
                return { editor: previousGroupEditors[previousGroupEditors.length - 1], groupId: previousGroup.id };
            }
            return undefined;
        }
    };
    OpenPreviousEditor.ID = 'workbench.action.previousEditor';
    OpenPreviousEditor.LABEL = (0, nls_1.localize)(40, null);
    OpenPreviousEditor = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, editorService_1.IEditorService)
    ], OpenPreviousEditor);
    exports.OpenPreviousEditor = OpenPreviousEditor;
    let OpenNextEditorInGroup = class OpenNextEditorInGroup extends BaseNavigateEditorAction {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label, editorGroupService, editorService);
        }
        navigate() {
            const group = this.editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* SEQUENTIAL */);
            const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
            return { editor: index + 1 < editors.length ? editors[index + 1] : editors[0], groupId: group.id };
        }
    };
    OpenNextEditorInGroup.ID = 'workbench.action.nextEditorInGroup';
    OpenNextEditorInGroup.LABEL = (0, nls_1.localize)(41, null);
    OpenNextEditorInGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, editorService_1.IEditorService)
    ], OpenNextEditorInGroup);
    exports.OpenNextEditorInGroup = OpenNextEditorInGroup;
    let OpenPreviousEditorInGroup = class OpenPreviousEditorInGroup extends BaseNavigateEditorAction {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label, editorGroupService, editorService);
        }
        navigate() {
            const group = this.editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* SEQUENTIAL */);
            const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
            return { editor: index > 0 ? editors[index - 1] : editors[editors.length - 1], groupId: group.id };
        }
    };
    OpenPreviousEditorInGroup.ID = 'workbench.action.previousEditorInGroup';
    OpenPreviousEditorInGroup.LABEL = (0, nls_1.localize)(42, null);
    OpenPreviousEditorInGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, editorService_1.IEditorService)
    ], OpenPreviousEditorInGroup);
    exports.OpenPreviousEditorInGroup = OpenPreviousEditorInGroup;
    let OpenFirstEditorInGroup = class OpenFirstEditorInGroup extends BaseNavigateEditorAction {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label, editorGroupService, editorService);
        }
        navigate() {
            const group = this.editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* SEQUENTIAL */);
            return { editor: editors[0], groupId: group.id };
        }
    };
    OpenFirstEditorInGroup.ID = 'workbench.action.firstEditorInGroup';
    OpenFirstEditorInGroup.LABEL = (0, nls_1.localize)(43, null);
    OpenFirstEditorInGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, editorService_1.IEditorService)
    ], OpenFirstEditorInGroup);
    exports.OpenFirstEditorInGroup = OpenFirstEditorInGroup;
    let OpenLastEditorInGroup = class OpenLastEditorInGroup extends BaseNavigateEditorAction {
        constructor(id, label, editorGroupService, editorService) {
            super(id, label, editorGroupService, editorService);
        }
        navigate() {
            const group = this.editorGroupService.activeGroup;
            const editors = group.getEditors(1 /* SEQUENTIAL */);
            return { editor: editors[editors.length - 1], groupId: group.id };
        }
    };
    OpenLastEditorInGroup.ID = 'workbench.action.lastEditorInGroup';
    OpenLastEditorInGroup.LABEL = (0, nls_1.localize)(44, null);
    OpenLastEditorInGroup = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, editorService_1.IEditorService)
    ], OpenLastEditorInGroup);
    exports.OpenLastEditorInGroup = OpenLastEditorInGroup;
    let NavigateForwardAction = class NavigateForwardAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            this.historyService.forward();
        }
    };
    NavigateForwardAction.ID = 'workbench.action.navigateForward';
    NavigateForwardAction.LABEL = (0, nls_1.localize)(45, null);
    NavigateForwardAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], NavigateForwardAction);
    exports.NavigateForwardAction = NavigateForwardAction;
    let NavigateBackwardsAction = class NavigateBackwardsAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            this.historyService.back();
        }
    };
    NavigateBackwardsAction.ID = 'workbench.action.navigateBack';
    NavigateBackwardsAction.LABEL = (0, nls_1.localize)(46, null);
    NavigateBackwardsAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], NavigateBackwardsAction);
    exports.NavigateBackwardsAction = NavigateBackwardsAction;
    let NavigateToLastEditLocationAction = class NavigateToLastEditLocationAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            this.historyService.openLastEditLocation();
        }
    };
    NavigateToLastEditLocationAction.ID = 'workbench.action.navigateToLastEditLocation';
    NavigateToLastEditLocationAction.LABEL = (0, nls_1.localize)(47, null);
    NavigateToLastEditLocationAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], NavigateToLastEditLocationAction);
    exports.NavigateToLastEditLocationAction = NavigateToLastEditLocationAction;
    let NavigateLastAction = class NavigateLastAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            this.historyService.last();
        }
    };
    NavigateLastAction.ID = 'workbench.action.navigateLast';
    NavigateLastAction.LABEL = (0, nls_1.localize)(48, null);
    NavigateLastAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], NavigateLastAction);
    exports.NavigateLastAction = NavigateLastAction;
    let ReopenClosedEditorAction = class ReopenClosedEditorAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            this.historyService.reopenLastClosedEditor();
        }
    };
    ReopenClosedEditorAction.ID = 'workbench.action.reopenClosedEditor';
    ReopenClosedEditorAction.LABEL = (0, nls_1.localize)(49, null);
    ReopenClosedEditorAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], ReopenClosedEditorAction);
    exports.ReopenClosedEditorAction = ReopenClosedEditorAction;
    let ClearRecentFilesAction = class ClearRecentFilesAction extends actions_1.Action {
        constructor(id, label, workspacesService, historyService) {
            super(id, label);
            this.workspacesService = workspacesService;
            this.historyService = historyService;
        }
        async run() {
            // Clear global recently opened
            this.workspacesService.clearRecentlyOpened();
            // Clear workspace specific recently opened
            this.historyService.clearRecentlyOpened();
        }
    };
    ClearRecentFilesAction.ID = 'workbench.action.clearRecentFiles';
    ClearRecentFilesAction.LABEL = (0, nls_1.localize)(50, null);
    ClearRecentFilesAction = __decorate([
        __param(2, workspaces_1.IWorkspacesService),
        __param(3, history_1.IHistoryService)
    ], ClearRecentFilesAction);
    exports.ClearRecentFilesAction = ClearRecentFilesAction;
    let ShowEditorsInActiveGroupByMostRecentlyUsedAction = class ShowEditorsInActiveGroupByMostRecentlyUsedAction extends actions_1.Action {
        constructor(id, label, quickInputService) {
            super(id, label);
            this.quickInputService = quickInputService;
        }
        async run() {
            this.quickInputService.quickAccess.show(editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
        }
    };
    ShowEditorsInActiveGroupByMostRecentlyUsedAction.ID = 'workbench.action.showEditorsInActiveGroup';
    ShowEditorsInActiveGroupByMostRecentlyUsedAction.LABEL = (0, nls_1.localize)(51, null);
    ShowEditorsInActiveGroupByMostRecentlyUsedAction = __decorate([
        __param(2, quickInput_1.IQuickInputService)
    ], ShowEditorsInActiveGroupByMostRecentlyUsedAction);
    exports.ShowEditorsInActiveGroupByMostRecentlyUsedAction = ShowEditorsInActiveGroupByMostRecentlyUsedAction;
    let ShowAllEditorsByAppearanceAction = class ShowAllEditorsByAppearanceAction extends actions_1.Action {
        constructor(id, label, quickInputService) {
            super(id, label);
            this.quickInputService = quickInputService;
        }
        async run() {
            this.quickInputService.quickAccess.show(editorQuickAccess_1.AllEditorsByAppearanceQuickAccess.PREFIX);
        }
    };
    ShowAllEditorsByAppearanceAction.ID = 'workbench.action.showAllEditors';
    ShowAllEditorsByAppearanceAction.LABEL = (0, nls_1.localize)(52, null);
    ShowAllEditorsByAppearanceAction = __decorate([
        __param(2, quickInput_1.IQuickInputService)
    ], ShowAllEditorsByAppearanceAction);
    exports.ShowAllEditorsByAppearanceAction = ShowAllEditorsByAppearanceAction;
    let ShowAllEditorsByMostRecentlyUsedAction = class ShowAllEditorsByMostRecentlyUsedAction extends actions_1.Action {
        constructor(id, label, quickInputService) {
            super(id, label);
            this.quickInputService = quickInputService;
        }
        async run() {
            this.quickInputService.quickAccess.show(editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX);
        }
    };
    ShowAllEditorsByMostRecentlyUsedAction.ID = 'workbench.action.showAllEditorsByMostRecentlyUsed';
    ShowAllEditorsByMostRecentlyUsedAction.LABEL = (0, nls_1.localize)(53, null);
    ShowAllEditorsByMostRecentlyUsedAction = __decorate([
        __param(2, quickInput_1.IQuickInputService)
    ], ShowAllEditorsByMostRecentlyUsedAction);
    exports.ShowAllEditorsByMostRecentlyUsedAction = ShowAllEditorsByMostRecentlyUsedAction;
    let BaseQuickAccessEditorAction = class BaseQuickAccessEditorAction extends actions_1.Action {
        constructor(id, label, prefix, itemActivation, quickInputService, keybindingService) {
            super(id, label);
            this.prefix = prefix;
            this.itemActivation = itemActivation;
            this.quickInputService = quickInputService;
            this.keybindingService = keybindingService;
        }
        async run() {
            const keybindings = this.keybindingService.lookupKeybindings(this.id);
            this.quickInputService.quickAccess.show(this.prefix, {
                quickNavigateConfiguration: { keybindings },
                itemActivation: this.itemActivation
            });
        }
    };
    BaseQuickAccessEditorAction = __decorate([
        __param(4, quickInput_1.IQuickInputService),
        __param(5, keybinding_1.IKeybindingService)
    ], BaseQuickAccessEditorAction);
    exports.BaseQuickAccessEditorAction = BaseQuickAccessEditorAction;
    let QuickAccessPreviousRecentlyUsedEditorAction = class QuickAccessPreviousRecentlyUsedEditorAction extends BaseQuickAccessEditorAction {
        constructor(id, label, quickInputService, keybindingService) {
            super(id, label, editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined, quickInputService, keybindingService);
        }
    };
    QuickAccessPreviousRecentlyUsedEditorAction.ID = 'workbench.action.quickOpenPreviousRecentlyUsedEditor';
    QuickAccessPreviousRecentlyUsedEditorAction.LABEL = (0, nls_1.localize)(54, null);
    QuickAccessPreviousRecentlyUsedEditorAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, keybinding_1.IKeybindingService)
    ], QuickAccessPreviousRecentlyUsedEditorAction);
    exports.QuickAccessPreviousRecentlyUsedEditorAction = QuickAccessPreviousRecentlyUsedEditorAction;
    let QuickAccessLeastRecentlyUsedEditorAction = class QuickAccessLeastRecentlyUsedEditorAction extends BaseQuickAccessEditorAction {
        constructor(id, label, quickInputService, keybindingService) {
            super(id, label, editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined, quickInputService, keybindingService);
        }
    };
    QuickAccessLeastRecentlyUsedEditorAction.ID = 'workbench.action.quickOpenLeastRecentlyUsedEditor';
    QuickAccessLeastRecentlyUsedEditorAction.LABEL = (0, nls_1.localize)(55, null);
    QuickAccessLeastRecentlyUsedEditorAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, keybinding_1.IKeybindingService)
    ], QuickAccessLeastRecentlyUsedEditorAction);
    exports.QuickAccessLeastRecentlyUsedEditorAction = QuickAccessLeastRecentlyUsedEditorAction;
    let QuickAccessPreviousRecentlyUsedEditorInGroupAction = class QuickAccessPreviousRecentlyUsedEditorInGroupAction extends BaseQuickAccessEditorAction {
        constructor(id, label, quickInputService, keybindingService) {
            super(id, label, editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined, quickInputService, keybindingService);
        }
    };
    QuickAccessPreviousRecentlyUsedEditorInGroupAction.ID = 'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup';
    QuickAccessPreviousRecentlyUsedEditorInGroupAction.LABEL = (0, nls_1.localize)(56, null);
    QuickAccessPreviousRecentlyUsedEditorInGroupAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, keybinding_1.IKeybindingService)
    ], QuickAccessPreviousRecentlyUsedEditorInGroupAction);
    exports.QuickAccessPreviousRecentlyUsedEditorInGroupAction = QuickAccessPreviousRecentlyUsedEditorInGroupAction;
    let QuickAccessLeastRecentlyUsedEditorInGroupAction = class QuickAccessLeastRecentlyUsedEditorInGroupAction extends BaseQuickAccessEditorAction {
        constructor(id, label, quickInputService, keybindingService) {
            super(id, label, editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, quickInput_1.ItemActivation.LAST, quickInputService, keybindingService);
        }
    };
    QuickAccessLeastRecentlyUsedEditorInGroupAction.ID = 'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup';
    QuickAccessLeastRecentlyUsedEditorInGroupAction.LABEL = (0, nls_1.localize)(57, null);
    QuickAccessLeastRecentlyUsedEditorInGroupAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, keybinding_1.IKeybindingService)
    ], QuickAccessLeastRecentlyUsedEditorInGroupAction);
    exports.QuickAccessLeastRecentlyUsedEditorInGroupAction = QuickAccessLeastRecentlyUsedEditorInGroupAction;
    let QuickAccessPreviousEditorFromHistoryAction = class QuickAccessPreviousEditorFromHistoryAction extends actions_1.Action {
        constructor(id, label, quickInputService, keybindingService, editorGroupService) {
            super(id, label);
            this.quickInputService = quickInputService;
            this.keybindingService = keybindingService;
            this.editorGroupService = editorGroupService;
        }
        async run() {
            const keybindings = this.keybindingService.lookupKeybindings(this.id);
            // Enforce to activate the first item in quick access if
            // the currently active editor group has n editor opened
            let itemActivation = undefined;
            if (this.editorGroupService.activeGroup.count === 0) {
                itemActivation = quickInput_1.ItemActivation.FIRST;
            }
            this.quickInputService.quickAccess.show('', { quickNavigateConfiguration: { keybindings }, itemActivation });
        }
    };
    QuickAccessPreviousEditorFromHistoryAction.ID = 'workbench.action.openPreviousEditorFromHistory';
    QuickAccessPreviousEditorFromHistoryAction.LABEL = (0, nls_1.localize)(58, null);
    QuickAccessPreviousEditorFromHistoryAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, editorGroupsService_1.IEditorGroupsService)
    ], QuickAccessPreviousEditorFromHistoryAction);
    exports.QuickAccessPreviousEditorFromHistoryAction = QuickAccessPreviousEditorFromHistoryAction;
    let OpenNextRecentlyUsedEditorAction = class OpenNextRecentlyUsedEditorAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            this.historyService.openNextRecentlyUsedEditor();
        }
    };
    OpenNextRecentlyUsedEditorAction.ID = 'workbench.action.openNextRecentlyUsedEditor';
    OpenNextRecentlyUsedEditorAction.LABEL = (0, nls_1.localize)(59, null);
    OpenNextRecentlyUsedEditorAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], OpenNextRecentlyUsedEditorAction);
    exports.OpenNextRecentlyUsedEditorAction = OpenNextRecentlyUsedEditorAction;
    let OpenPreviousRecentlyUsedEditorAction = class OpenPreviousRecentlyUsedEditorAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            this.historyService.openPreviouslyUsedEditor();
        }
    };
    OpenPreviousRecentlyUsedEditorAction.ID = 'workbench.action.openPreviousRecentlyUsedEditor';
    OpenPreviousRecentlyUsedEditorAction.LABEL = (0, nls_1.localize)(60, null);
    OpenPreviousRecentlyUsedEditorAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], OpenPreviousRecentlyUsedEditorAction);
    exports.OpenPreviousRecentlyUsedEditorAction = OpenPreviousRecentlyUsedEditorAction;
    let OpenNextRecentlyUsedEditorInGroupAction = class OpenNextRecentlyUsedEditorInGroupAction extends actions_1.Action {
        constructor(id, label, historyService, editorGroupsService) {
            super(id, label);
            this.historyService = historyService;
            this.editorGroupsService = editorGroupsService;
        }
        async run() {
            this.historyService.openNextRecentlyUsedEditor(this.editorGroupsService.activeGroup.id);
        }
    };
    OpenNextRecentlyUsedEditorInGroupAction.ID = 'workbench.action.openNextRecentlyUsedEditorInGroup';
    OpenNextRecentlyUsedEditorInGroupAction.LABEL = (0, nls_1.localize)(61, null);
    OpenNextRecentlyUsedEditorInGroupAction = __decorate([
        __param(2, history_1.IHistoryService),
        __param(3, editorGroupsService_1.IEditorGroupsService)
    ], OpenNextRecentlyUsedEditorInGroupAction);
    exports.OpenNextRecentlyUsedEditorInGroupAction = OpenNextRecentlyUsedEditorInGroupAction;
    let OpenPreviousRecentlyUsedEditorInGroupAction = class OpenPreviousRecentlyUsedEditorInGroupAction extends actions_1.Action {
        constructor(id, label, historyService, editorGroupsService) {
            super(id, label);
            this.historyService = historyService;
            this.editorGroupsService = editorGroupsService;
        }
        async run() {
            this.historyService.openPreviouslyUsedEditor(this.editorGroupsService.activeGroup.id);
        }
    };
    OpenPreviousRecentlyUsedEditorInGroupAction.ID = 'workbench.action.openPreviousRecentlyUsedEditorInGroup';
    OpenPreviousRecentlyUsedEditorInGroupAction.LABEL = (0, nls_1.localize)(62, null);
    OpenPreviousRecentlyUsedEditorInGroupAction = __decorate([
        __param(2, history_1.IHistoryService),
        __param(3, editorGroupsService_1.IEditorGroupsService)
    ], OpenPreviousRecentlyUsedEditorInGroupAction);
    exports.OpenPreviousRecentlyUsedEditorInGroupAction = OpenPreviousRecentlyUsedEditorInGroupAction;
    let ClearEditorHistoryAction = class ClearEditorHistoryAction extends actions_1.Action {
        constructor(id, label, historyService) {
            super(id, label);
            this.historyService = historyService;
        }
        async run() {
            // Editor history
            this.historyService.clear();
        }
    };
    ClearEditorHistoryAction.ID = 'workbench.action.clearEditorHistory';
    ClearEditorHistoryAction.LABEL = (0, nls_1.localize)(63, null);
    ClearEditorHistoryAction = __decorate([
        __param(2, history_1.IHistoryService)
    ], ClearEditorHistoryAction);
    exports.ClearEditorHistoryAction = ClearEditorHistoryAction;
    let MoveEditorLeftInGroupAction = class MoveEditorLeftInGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'left' });
        }
    };
    MoveEditorLeftInGroupAction.ID = 'workbench.action.moveEditorLeftInGroup';
    MoveEditorLeftInGroupAction.LABEL = (0, nls_1.localize)(64, null);
    MoveEditorLeftInGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorLeftInGroupAction);
    exports.MoveEditorLeftInGroupAction = MoveEditorLeftInGroupAction;
    let MoveEditorRightInGroupAction = class MoveEditorRightInGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'right' });
        }
    };
    MoveEditorRightInGroupAction.ID = 'workbench.action.moveEditorRightInGroup';
    MoveEditorRightInGroupAction.LABEL = (0, nls_1.localize)(65, null);
    MoveEditorRightInGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorRightInGroupAction);
    exports.MoveEditorRightInGroupAction = MoveEditorRightInGroupAction;
    let MoveEditorToPreviousGroupAction = class MoveEditorToPreviousGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'previous', by: 'group' });
        }
    };
    MoveEditorToPreviousGroupAction.ID = 'workbench.action.moveEditorToPreviousGroup';
    MoveEditorToPreviousGroupAction.LABEL = (0, nls_1.localize)(66, null);
    MoveEditorToPreviousGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToPreviousGroupAction);
    exports.MoveEditorToPreviousGroupAction = MoveEditorToPreviousGroupAction;
    let MoveEditorToNextGroupAction = class MoveEditorToNextGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'next', by: 'group' });
        }
    };
    MoveEditorToNextGroupAction.ID = 'workbench.action.moveEditorToNextGroup';
    MoveEditorToNextGroupAction.LABEL = (0, nls_1.localize)(67, null);
    MoveEditorToNextGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToNextGroupAction);
    exports.MoveEditorToNextGroupAction = MoveEditorToNextGroupAction;
    let MoveEditorToAboveGroupAction = class MoveEditorToAboveGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'up', by: 'group' });
        }
    };
    MoveEditorToAboveGroupAction.ID = 'workbench.action.moveEditorToAboveGroup';
    MoveEditorToAboveGroupAction.LABEL = (0, nls_1.localize)(68, null);
    MoveEditorToAboveGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToAboveGroupAction);
    exports.MoveEditorToAboveGroupAction = MoveEditorToAboveGroupAction;
    let MoveEditorToBelowGroupAction = class MoveEditorToBelowGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'down', by: 'group' });
        }
    };
    MoveEditorToBelowGroupAction.ID = 'workbench.action.moveEditorToBelowGroup';
    MoveEditorToBelowGroupAction.LABEL = (0, nls_1.localize)(69, null);
    MoveEditorToBelowGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToBelowGroupAction);
    exports.MoveEditorToBelowGroupAction = MoveEditorToBelowGroupAction;
    let MoveEditorToLeftGroupAction = class MoveEditorToLeftGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'left', by: 'group' });
        }
    };
    MoveEditorToLeftGroupAction.ID = 'workbench.action.moveEditorToLeftGroup';
    MoveEditorToLeftGroupAction.LABEL = (0, nls_1.localize)(70, null);
    MoveEditorToLeftGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToLeftGroupAction);
    exports.MoveEditorToLeftGroupAction = MoveEditorToLeftGroupAction;
    let MoveEditorToRightGroupAction = class MoveEditorToRightGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'right', by: 'group' });
        }
    };
    MoveEditorToRightGroupAction.ID = 'workbench.action.moveEditorToRightGroup';
    MoveEditorToRightGroupAction.LABEL = (0, nls_1.localize)(71, null);
    MoveEditorToRightGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToRightGroupAction);
    exports.MoveEditorToRightGroupAction = MoveEditorToRightGroupAction;
    let MoveEditorToFirstGroupAction = class MoveEditorToFirstGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'first', by: 'group' });
        }
    };
    MoveEditorToFirstGroupAction.ID = 'workbench.action.moveEditorToFirstGroup';
    MoveEditorToFirstGroupAction.LABEL = (0, nls_1.localize)(72, null);
    MoveEditorToFirstGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToFirstGroupAction);
    exports.MoveEditorToFirstGroupAction = MoveEditorToFirstGroupAction;
    let MoveEditorToLastGroupAction = class MoveEditorToLastGroupAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'last', by: 'group' });
        }
    };
    MoveEditorToLastGroupAction.ID = 'workbench.action.moveEditorToLastGroup';
    MoveEditorToLastGroupAction.LABEL = (0, nls_1.localize)(73, null);
    MoveEditorToLastGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], MoveEditorToLastGroupAction);
    exports.MoveEditorToLastGroupAction = MoveEditorToLastGroupAction;
    let EditorLayoutSingleAction = class EditorLayoutSingleAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}] });
        }
    };
    EditorLayoutSingleAction.ID = 'workbench.action.editorLayoutSingle';
    EditorLayoutSingleAction.LABEL = (0, nls_1.localize)(74, null);
    EditorLayoutSingleAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutSingleAction);
    exports.EditorLayoutSingleAction = EditorLayoutSingleAction;
    let EditorLayoutTwoColumnsAction = class EditorLayoutTwoColumnsAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}], orientation: 0 /* HORIZONTAL */ });
        }
    };
    EditorLayoutTwoColumnsAction.ID = 'workbench.action.editorLayoutTwoColumns';
    EditorLayoutTwoColumnsAction.LABEL = (0, nls_1.localize)(75, null);
    EditorLayoutTwoColumnsAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutTwoColumnsAction);
    exports.EditorLayoutTwoColumnsAction = EditorLayoutTwoColumnsAction;
    let EditorLayoutThreeColumnsAction = class EditorLayoutThreeColumnsAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}, {}], orientation: 0 /* HORIZONTAL */ });
        }
    };
    EditorLayoutThreeColumnsAction.ID = 'workbench.action.editorLayoutThreeColumns';
    EditorLayoutThreeColumnsAction.LABEL = (0, nls_1.localize)(76, null);
    EditorLayoutThreeColumnsAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutThreeColumnsAction);
    exports.EditorLayoutThreeColumnsAction = EditorLayoutThreeColumnsAction;
    let EditorLayoutTwoRowsAction = class EditorLayoutTwoRowsAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}], orientation: 1 /* VERTICAL */ });
        }
    };
    EditorLayoutTwoRowsAction.ID = 'workbench.action.editorLayoutTwoRows';
    EditorLayoutTwoRowsAction.LABEL = (0, nls_1.localize)(77, null);
    EditorLayoutTwoRowsAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutTwoRowsAction);
    exports.EditorLayoutTwoRowsAction = EditorLayoutTwoRowsAction;
    let EditorLayoutThreeRowsAction = class EditorLayoutThreeRowsAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}, {}], orientation: 1 /* VERTICAL */ });
        }
    };
    EditorLayoutThreeRowsAction.ID = 'workbench.action.editorLayoutThreeRows';
    EditorLayoutThreeRowsAction.LABEL = (0, nls_1.localize)(78, null);
    EditorLayoutThreeRowsAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutThreeRowsAction);
    exports.EditorLayoutThreeRowsAction = EditorLayoutThreeRowsAction;
    let EditorLayoutTwoByTwoGridAction = class EditorLayoutTwoByTwoGridAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }] });
        }
    };
    EditorLayoutTwoByTwoGridAction.ID = 'workbench.action.editorLayoutTwoByTwoGrid';
    EditorLayoutTwoByTwoGridAction.LABEL = (0, nls_1.localize)(79, null);
    EditorLayoutTwoByTwoGridAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutTwoByTwoGridAction);
    exports.EditorLayoutTwoByTwoGridAction = EditorLayoutTwoByTwoGridAction;
    let EditorLayoutTwoColumnsBottomAction = class EditorLayoutTwoColumnsBottomAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, { groups: [{}, {}] }], orientation: 1 /* VERTICAL */ });
        }
    };
    EditorLayoutTwoColumnsBottomAction.ID = 'workbench.action.editorLayoutTwoColumnsBottom';
    EditorLayoutTwoColumnsBottomAction.LABEL = (0, nls_1.localize)(80, null);
    EditorLayoutTwoColumnsBottomAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutTwoColumnsBottomAction);
    exports.EditorLayoutTwoColumnsBottomAction = EditorLayoutTwoColumnsBottomAction;
    let EditorLayoutTwoRowsRightAction = class EditorLayoutTwoRowsRightAction extends ExecuteCommandAction {
        constructor(id, label, commandService) {
            super(id, label, editorCommands_1.LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, { groups: [{}, {}] }], orientation: 0 /* HORIZONTAL */ });
        }
    };
    EditorLayoutTwoRowsRightAction.ID = 'workbench.action.editorLayoutTwoRowsRight';
    EditorLayoutTwoRowsRightAction.LABEL = (0, nls_1.localize)(81, null);
    EditorLayoutTwoRowsRightAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], EditorLayoutTwoRowsRightAction);
    exports.EditorLayoutTwoRowsRightAction = EditorLayoutTwoRowsRightAction;
    class BaseCreateEditorGroupAction extends actions_1.Action {
        constructor(id, label, direction, editorGroupService) {
            super(id, label);
            this.direction = direction;
            this.editorGroupService = editorGroupService;
        }
        async run() {
            this.editorGroupService.addGroup(this.editorGroupService.activeGroup, this.direction, { activate: true });
        }
    }
    exports.BaseCreateEditorGroupAction = BaseCreateEditorGroupAction;
    let NewEditorGroupLeftAction = class NewEditorGroupLeftAction extends BaseCreateEditorGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 2 /* LEFT */, editorGroupService);
        }
    };
    NewEditorGroupLeftAction.ID = 'workbench.action.newGroupLeft';
    NewEditorGroupLeftAction.LABEL = (0, nls_1.localize)(82, null);
    NewEditorGroupLeftAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], NewEditorGroupLeftAction);
    exports.NewEditorGroupLeftAction = NewEditorGroupLeftAction;
    let NewEditorGroupRightAction = class NewEditorGroupRightAction extends BaseCreateEditorGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 3 /* RIGHT */, editorGroupService);
        }
    };
    NewEditorGroupRightAction.ID = 'workbench.action.newGroupRight';
    NewEditorGroupRightAction.LABEL = (0, nls_1.localize)(83, null);
    NewEditorGroupRightAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], NewEditorGroupRightAction);
    exports.NewEditorGroupRightAction = NewEditorGroupRightAction;
    let NewEditorGroupAboveAction = class NewEditorGroupAboveAction extends BaseCreateEditorGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 0 /* UP */, editorGroupService);
        }
    };
    NewEditorGroupAboveAction.ID = 'workbench.action.newGroupAbove';
    NewEditorGroupAboveAction.LABEL = (0, nls_1.localize)(84, null);
    NewEditorGroupAboveAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], NewEditorGroupAboveAction);
    exports.NewEditorGroupAboveAction = NewEditorGroupAboveAction;
    let NewEditorGroupBelowAction = class NewEditorGroupBelowAction extends BaseCreateEditorGroupAction {
        constructor(id, label, editorGroupService) {
            super(id, label, 1 /* DOWN */, editorGroupService);
        }
    };
    NewEditorGroupBelowAction.ID = 'workbench.action.newGroupBelow';
    NewEditorGroupBelowAction.LABEL = (0, nls_1.localize)(85, null);
    NewEditorGroupBelowAction = __decorate([
        __param(2, editorGroupsService_1.IEditorGroupsService)
    ], NewEditorGroupBelowAction);
    exports.NewEditorGroupBelowAction = NewEditorGroupBelowAction;
    let ReopenResourcesAction = class ReopenResourcesAction extends actions_1.Action {
        constructor(id, label, editorService) {
            super(id, label);
            this.editorService = editorService;
        }
        async run() {
            var _a;
            const activeInput = this.editorService.activeEditor;
            if (!activeInput) {
                return;
            }
            const activeEditorPane = this.editorService.activeEditorPane;
            if (!activeEditorPane) {
                return;
            }
            const options = activeEditorPane.options;
            const group = activeEditorPane.group;
            await this.editorService.replaceEditors([
                {
                    editor: activeInput,
                    replacement: activeInput,
                    forceReplaceDirty: ((_a = activeInput.resource) === null || _a === void 0 ? void 0 : _a.scheme) === network_1.Schemas.untitled,
                    options: Object.assign(Object.assign({}, options), { override: editor_2.EditorOverride.PICK })
                }
            ], group);
        }
    };
    ReopenResourcesAction.ID = 'workbench.action.reopenWithEditor';
    ReopenResourcesAction.LABEL = (0, nls_1.localize)(86, null);
    ReopenResourcesAction = __decorate([
        __param(2, editorService_1.IEditorService)
    ], ReopenResourcesAction);
    exports.ReopenResourcesAction = ReopenResourcesAction;
    let ToggleEditorTypeAction = class ToggleEditorTypeAction extends actions_1.Action {
        constructor(id, label, editorService) {
            super(id, label);
            this.editorService = editorService;
        }
        async run() {
            var _a;
            const activeEditorPane = this.editorService.activeEditorPane;
            if (!activeEditorPane) {
                return;
            }
            const activeEditorResource = activeEditorPane.input.resource;
            if (!activeEditorResource) {
                return;
            }
            const options = activeEditorPane.options;
            const group = activeEditorPane.group;
            const overrides = this.editorService.getEditorOverrides(activeEditorResource, options, group);
            const firstNonActiveOverride = overrides.find(([_, entry]) => !entry.active);
            if (!firstNonActiveOverride) {
                return;
            }
            await ((_a = firstNonActiveOverride[0].open(activeEditorPane.input, Object.assign(Object.assign({}, options), { override: firstNonActiveOverride[1].id }), group)) === null || _a === void 0 ? void 0 : _a.override);
        }
    };
    ToggleEditorTypeAction.ID = 'workbench.action.toggleEditorType';
    ToggleEditorTypeAction.LABEL = (0, nls_1.localize)(87, null);
    ToggleEditorTypeAction = __decorate([
        __param(2, editorService_1.IEditorService)
    ], ToggleEditorTypeAction);
    exports.ToggleEditorTypeAction = ToggleEditorTypeAction;
});
//# sourceMappingURL=editorActions.js.map