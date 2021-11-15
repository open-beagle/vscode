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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/types", "vs/editor/contrib/find/findModel", "vs/editor/contrib/quickAccess/gotoLineQuickAccess", "vs/nls!vs/workbench/contrib/search/browser/search.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/platform/quickinput/common/quickAccess", "vs/platform/quickinput/common/quickInput", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/browser/quickaccess", "vs/workbench/common/actions", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/search/browser/anythingQuickAccess", "vs/workbench/contrib/search/browser/replaceContributions", "vs/workbench/contrib/search/browser/searchActions", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/search/browser/searchView", "vs/workbench/contrib/search/browser/searchWidget", "vs/workbench/contrib/search/browser/symbolsQuickAccess", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/common/queryBuilder", "vs/workbench/contrib/search/common/search", "vs/workbench/contrib/search/common/searchHistoryService", "vs/workbench/contrib/search/common/searchModel", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/search/common/search", "vs/workbench/services/viewlet/browser/viewlet"], function (require, exports, actions_1, errors_1, platform, resources_1, types_1, findModel_1, gotoLineQuickAccess_1, nls, actions_2, commands_1, configuration_1, configurationRegistry_1, contextkey_1, files_1, descriptors_1, extensions_1, instantiation_1, keybindingsRegistry_1, listService_1, quickAccess_1, quickInput_1, platform_1, workspace_1, viewPaneContainer_1, quickaccess_1, actions_3, contributions_1, views_1, gotoSymbolQuickAccess_1, files_2, files_3, anythingQuickAccess_1, replaceContributions_1, searchActions_1, searchIcons_1, searchView_1, searchWidget_1, symbolsQuickAccess_1, Constants, queryBuilder_1, search_1, searchHistoryService_1, searchModel_1, SearchEditorConstants, editorService_1, search_2, viewlet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(searchModel_1.ISearchWorkbenchService, searchModel_1.SearchWorkbenchService, true);
    (0, extensions_1.registerSingleton)(searchHistoryService_1.ISearchHistoryService, searchHistoryService_1.SearchHistoryService, true);
    (0, replaceContributions_1.registerContributions)();
    (0, searchWidget_1.registerContributions)();
    const category = { value: nls.localize(0, null), original: 'Search' };
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.search.toggleQueryDetails',
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.or(Constants.SearchViewFocusedKey, SearchEditorConstants.InSearchEditor),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 40 /* KEY_J */,
        handler: accessor => {
            const contextService = accessor.get(contextkey_1.IContextKeyService).getContext(document.activeElement);
            if (contextService.getValue(SearchEditorConstants.InSearchEditor.serialize())) {
                accessor.get(editorService_1.IEditorService).activeEditorPane.toggleQueryDetails();
            }
            else if (contextService.getValue(Constants.SearchViewFocusedKey.serialize())) {
                const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
                (0, types_1.assertIsDefined)(searchView).toggleQueryDetails();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.FocusSearchFromResults,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FirstMatchFocusKey),
        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
        handler: (accessor, args) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                searchView.focusPreviousInputBox();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.OpenMatch,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
        primary: 3 /* Enter */,
        mac: {
            primary: 3 /* Enter */,
            secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
        },
        handler: (accessor) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.open(tree.getFocus()[0], false, false, true);
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.OpenMatchToSide,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
            primary: 256 /* WinCtrl */ | 3 /* Enter */
        },
        handler: (accessor, args) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.open(tree.getFocus()[0], false, true, true);
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.RemoveActionId,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
        primary: 20 /* Delete */,
        mac: {
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
        },
        handler: (accessor, args) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions_1.RemoveAction, tree, tree.getFocus()[0]).run();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.ReplaceActionId,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.MatchFocusKey),
        primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 22 /* KEY_1 */,
        handler: (accessor, args) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions_1.ReplaceAction, tree, tree.getFocus()[0], searchView).run();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.ReplaceAllInFileActionId,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FileFocusKey),
        primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 22 /* KEY_1 */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */],
        handler: (accessor, args) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions_1.ReplaceAllAction, searchView, tree.getFocus()[0]).run();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.ReplaceAllInFolderActionId,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, Constants.FolderFocusKey),
        primary: 1024 /* Shift */ | 2048 /* CtrlCmd */ | 22 /* KEY_1 */,
        secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */],
        handler: (accessor, args) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions_1.ReplaceAllInFolderAction, tree, tree.getFocus()[0]).run();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.CloseReplaceWidgetActionId,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceInputBoxFocusedKey),
        primary: 9 /* Escape */,
        handler: (accessor, args) => {
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions_1.CloseReplaceAction, Constants.CloseReplaceWidgetActionId, '').run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: searchActions_1.FocusNextInputAction.ID,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.InputBoxFocusedKey), contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.InputBoxFocusedKey)),
        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
        handler: (accessor, args) => {
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions_1.FocusNextInputAction, searchActions_1.FocusNextInputAction.ID, '').run();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: searchActions_1.FocusPreviousInputAction.ID,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(SearchEditorConstants.InSearchEditor, Constants.InputBoxFocusedKey), contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.InputBoxFocusedKey, Constants.SearchInputBoxFocusedKey.toNegated())),
        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
        handler: (accessor, args) => {
            accessor.get(instantiation_1.IInstantiationService).createInstance(searchActions_1.FocusPreviousInputAction, searchActions_1.FocusPreviousInputAction.ID, '').run();
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: {
            id: Constants.ReplaceActionId,
            title: searchActions_1.ReplaceAction.LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.MatchFocusKey),
        group: 'search',
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: {
            id: Constants.ReplaceAllInFolderActionId,
            title: searchActions_1.ReplaceAllInFolderAction.LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FolderFocusKey),
        group: 'search',
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: {
            id: Constants.ReplaceAllInFileActionId,
            title: searchActions_1.ReplaceAllAction.LABEL
        },
        when: contextkey_1.ContextKeyExpr.and(Constants.ReplaceActiveKey, Constants.FileFocusKey),
        group: 'search',
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: {
            id: Constants.RemoveActionId,
            title: searchActions_1.RemoveAction.LABEL
        },
        when: Constants.FileMatchOrMatchFocusKey,
        group: 'search',
        order: 2
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.CopyMatchCommandId,
        weight: 200 /* WorkbenchContrib */,
        when: Constants.FileMatchOrMatchFocusKey,
        primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
        handler: searchActions_1.copyMatchCommand
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: {
            id: Constants.CopyMatchCommandId,
            title: nls.localize(1, null)
        },
        when: Constants.FileMatchOrMatchFocusKey,
        group: 'search_2',
        order: 1
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.CopyPathCommandId,
        weight: 200 /* WorkbenchContrib */,
        when: Constants.FileMatchOrFolderMatchWithResourceFocusKey,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KEY_C */,
        win: {
            primary: 1024 /* Shift */ | 512 /* Alt */ | 33 /* KEY_C */
        },
        handler: searchActions_1.copyPathCommand
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: {
            id: Constants.CopyPathCommandId,
            title: nls.localize(2, null)
        },
        when: Constants.FileMatchOrFolderMatchWithResourceFocusKey,
        group: 'search_2',
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: {
            id: Constants.CopyAllCommandId,
            title: nls.localize(3, null)
        },
        when: Constants.HasSearchResults,
        group: 'search_2',
        order: 3
    });
    commands_1.CommandsRegistry.registerCommand({
        id: Constants.CopyAllCommandId,
        handler: searchActions_1.copyAllCommand
    });
    commands_1.CommandsRegistry.registerCommand({
        id: Constants.ClearSearchHistoryCommandId,
        handler: searchActions_1.clearHistoryCommand
    });
    commands_1.CommandsRegistry.registerCommand({
        id: Constants.RevealInSideBarForSearchResults,
        handler: (accessor, args) => {
            const viewletService = accessor.get(viewlet_1.IViewletService);
            const explorerService = accessor.get(files_2.IExplorerService);
            const contextService = accessor.get(workspace_1.IWorkspaceContextService);
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (!searchView) {
                return;
            }
            let fileMatch;
            if (!(args instanceof searchModel_1.FileMatch)) {
                args = searchView.getControl().getFocus()[0];
            }
            if (args instanceof searchModel_1.FileMatch) {
                fileMatch = args;
            }
            else {
                return;
            }
            viewletService.openViewlet(files_3.VIEWLET_ID, false).then((viewlet) => {
                if (!viewlet) {
                    return;
                }
                const explorerViewContainer = viewlet.getViewPaneContainer();
                const uri = fileMatch.resource;
                if (uri && contextService.isInsideWorkspace(uri)) {
                    const explorerView = explorerViewContainer.getExplorerView();
                    explorerView.setExpanded(true);
                    explorerService.select(uri, true).then(() => explorerView.focus(), errors_1.onUnexpectedError);
                }
            });
        }
    });
    (0, actions_2.registerAction2)(class CancelSearchAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'search.action.cancel',
                title: nls.localize(4, null),
                icon: searchIcons_1.searchStopIcon,
                category,
                f1: true,
                precondition: search_1.SearchStateKey.isEqualTo(search_1.SearchUIState.Idle).negate(),
                keybinding: {
                    weight: 200 /* WorkbenchContrib */,
                    when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, listService_1.WorkbenchListFocusContextKey),
                    primary: 9 /* Escape */,
                },
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', search_2.VIEW_ID), search_1.SearchStateKey.isEqualTo(search_1.SearchUIState.SlowSearch)),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchActions_1.cancelSearch)(accessor);
        }
    });
    (0, actions_2.registerAction2)(class RefreshAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'search.action.refreshSearchResults',
                title: nls.localize(5, null),
                icon: searchIcons_1.searchRefreshIcon,
                precondition: Constants.ViewHasSearchPatternKey,
                category,
                f1: true,
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 0,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', search_2.VIEW_ID), search_1.SearchStateKey.isEqualTo(search_1.SearchUIState.SlowSearch).negate()),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchActions_1.refreshSearch)(accessor);
        }
    });
    (0, actions_2.registerAction2)(class CollapseDeepestExpandedLevelAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'search.action.collapseSearchResults',
                title: nls.localize(6, null),
                category,
                icon: searchIcons_1.searchCollapseAllIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey),
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', search_2.VIEW_ID), contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults.negate(), Constants.ViewHasSomeCollapsibleKey)),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchActions_1.collapseDeepestExpandedLevel)(accessor);
        }
    });
    (0, actions_2.registerAction2)(class ExpandAllAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'search.action.expandSearchResults',
                title: nls.localize(7, null),
                category,
                icon: searchIcons_1.searchExpandAllIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey.toNegated()),
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 3,
                        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', search_2.VIEW_ID), Constants.HasSearchResults, Constants.ViewHasSomeCollapsibleKey.toNegated()),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchActions_1.expandAll)(accessor);
        }
    });
    (0, actions_2.registerAction2)(class ClearSearchResultsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'search.action.clearSearchResults',
                title: nls.localize(8, null),
                category,
                icon: searchIcons_1.searchClearIcon,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, Constants.ViewHasSearchPatternKey, Constants.ViewHasReplacePatternKey, Constants.ViewHasFilePatternKey),
                menu: [{
                        id: actions_2.MenuId.ViewTitle,
                        group: 'navigation',
                        order: 1,
                        when: contextkey_1.ContextKeyEqualsExpr.create('view', search_2.VIEW_ID),
                    }]
            });
        }
        run(accessor, ...args) {
            return (0, searchActions_1.clearSearchResults)(accessor);
        }
    });
    const RevealInSideBarForSearchResultsCommand = {
        id: Constants.RevealInSideBarForSearchResults,
        title: nls.localize(9, null)
    };
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.SearchContext, {
        command: RevealInSideBarForSearchResultsCommand,
        when: contextkey_1.ContextKeyExpr.and(Constants.FileFocusKey, Constants.HasSearchResults),
        group: 'search_3',
        order: 1
    });
    const ClearSearchHistoryCommand = {
        id: Constants.ClearSearchHistoryCommandId,
        title: { value: nls.localize(10, null), original: 'Clear Search History' },
        category
    };
    actions_2.MenuRegistry.addCommand(ClearSearchHistoryCommand);
    commands_1.CommandsRegistry.registerCommand({
        id: Constants.FocusSearchListCommandID,
        handler: searchActions_1.focusSearchListCommand
    });
    const FocusSearchListCommand = {
        id: Constants.FocusSearchListCommandID,
        title: { value: nls.localize(11, null), original: 'Focus List' },
        category
    };
    actions_2.MenuRegistry.addCommand(FocusSearchListCommand);
    const searchInFolderCommand = async (accessor, resource) => {
        const listService = accessor.get(listService_1.IListService);
        const fileService = accessor.get(files_1.IFileService);
        const viewsService = accessor.get(views_1.IViewsService);
        const contextService = accessor.get(workspace_1.IWorkspaceContextService);
        const commandService = accessor.get(commands_1.ICommandService);
        const resources = (0, files_2.getMultiSelectedResources)(resource, listService, accessor.get(editorService_1.IEditorService), accessor.get(files_2.IExplorerService));
        const searchConfig = accessor.get(configuration_1.IConfigurationService).getValue().search;
        const mode = searchConfig.mode;
        const resolvedResources = fileService.resolveAll(resources.map(resource => ({ resource }))).then(results => {
            const folders = [];
            results.forEach(result => {
                if (result.success && result.stat) {
                    folders.push(result.stat.isDirectory ? result.stat.resource : (0, resources_1.dirname)(result.stat.resource));
                }
            });
            return (0, queryBuilder_1.resolveResourcesForSearchIncludes)(folders, contextService);
        });
        if (mode === 'view') {
            const searchView = await (0, searchActions_1.openSearchView)(viewsService, true);
            if (resources && resources.length && searchView) {
                searchView.searchInFolders(await resolvedResources);
            }
            return undefined;
        }
        else {
            return commandService.executeCommand(SearchEditorConstants.OpenEditorCommandId, {
                filesToInclude: (await resolvedResources).join(', '),
                showIncludesExcludes: true,
                location: mode === 'newEditor' ? 'new' : 'reuse',
            });
        }
    };
    const FIND_IN_FOLDER_ID = 'filesExplorer.findInFolder';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: FIND_IN_FOLDER_ID,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(files_3.FilesExplorerFocusCondition, files_3.ExplorerFolderContext),
        primary: 1024 /* Shift */ | 512 /* Alt */ | 36 /* KEY_F */,
        handler: searchInFolderCommand
    });
    const FIND_IN_WORKSPACE_ID = 'filesExplorer.findInWorkspace';
    commands_1.CommandsRegistry.registerCommand({
        id: FIND_IN_WORKSPACE_ID,
        handler: async (accessor) => {
            const searchConfig = accessor.get(configuration_1.IConfigurationService).getValue().search;
            const mode = searchConfig.mode;
            if (mode === 'view') {
                const searchView = await (0, searchActions_1.openSearchView)(accessor.get(views_1.IViewsService), true);
                if (searchView) {
                    searchView.searchInFolders();
                }
            }
            else {
                return accessor.get(commands_1.ICommandService).executeCommand(SearchEditorConstants.OpenEditorCommandId, {
                    location: mode === 'newEditor' ? 'new' : 'reuse',
                    filesToInclude: '',
                });
            }
        }
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ExplorerContext, {
        group: '4_search',
        order: 10,
        command: {
            id: FIND_IN_FOLDER_ID,
            title: nls.localize(12, null)
        },
        when: contextkey_1.ContextKeyExpr.and(files_3.ExplorerFolderContext)
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.ExplorerContext, {
        group: '4_search',
        order: 10,
        command: {
            id: FIND_IN_WORKSPACE_ID,
            title: nls.localize(13, null)
        },
        when: contextkey_1.ContextKeyExpr.and(files_3.ExplorerRootContext, files_3.ExplorerFolderContext.toNegated())
    });
    let ShowAllSymbolsAction = class ShowAllSymbolsAction extends actions_1.Action {
        constructor(actionId, actionLabel, quickInputService) {
            super(actionId, actionLabel);
            this.quickInputService = quickInputService;
        }
        async run() {
            this.quickInputService.quickAccess.show(ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX);
        }
    };
    ShowAllSymbolsAction.ID = 'workbench.action.showAllSymbols';
    ShowAllSymbolsAction.LABEL = nls.localize(14, null);
    ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX = '#';
    ShowAllSymbolsAction = __decorate([
        __param(2, quickInput_1.IQuickInputService)
    ], ShowAllSymbolsAction);
    const SEARCH_MODE_CONFIG = 'search.mode';
    const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: search_2.VIEWLET_ID,
        title: nls.localize(15, null),
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [search_2.VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true, donotShowContainerTitleWhenMergedWithContainer: true }]),
        hideIfEmpty: true,
        icon: searchIcons_1.searchViewIcon,
        order: 1,
    }, 0 /* Sidebar */, { donotRegisterOpenCommand: true });
    const viewDescriptor = {
        id: search_2.VIEW_ID,
        containerIcon: searchIcons_1.searchViewIcon,
        name: nls.localize(16, null),
        ctorDescriptor: new descriptors_1.SyncDescriptor(searchView_1.SearchView),
        canToggleVisibility: false,
        canMoveView: true,
        openCommandActionDescriptor: {
            id: viewContainer.id,
            mnemonicTitle: nls.localize(17, null),
            keybindings: {
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KEY_F */,
            },
            order: 1
        }
    };
    // Register search default location to sidebar
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([viewDescriptor], viewContainer);
    // Migrate search location setting to new model
    let RegisterSearchViewContribution = class RegisterSearchViewContribution {
        constructor(configurationService, viewDescriptorService) {
            const data = configurationService.inspect('search.location');
            if (data.value === 'panel') {
                viewDescriptorService.moveViewToLocation(viewDescriptor, 1 /* Panel */);
            }
            if (data.userValue) {
                configurationService.updateValue('search.location', undefined, 1 /* USER */);
            }
            if (data.userLocalValue) {
                configurationService.updateValue('search.location', undefined, 2 /* USER_LOCAL */);
            }
            if (data.userRemoteValue) {
                configurationService.updateValue('search.location', undefined, 3 /* USER_REMOTE */);
            }
            if (data.workspaceFolderValue) {
                configurationService.updateValue('search.location', undefined, 5 /* WORKSPACE_FOLDER */);
            }
            if (data.workspaceValue) {
                configurationService.updateValue('search.location', undefined, 4 /* WORKSPACE */);
            }
        }
    };
    RegisterSearchViewContribution = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, views_1.IViewDescriptorService)
    ], RegisterSearchViewContribution);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(RegisterSearchViewContribution, 1 /* Starting */);
    // Actions
    const registry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    // Find in Files by default is the same as View: Show Search, but can be configured to open a search editor instead with the `search.mode` binding
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        description: {
            description: nls.localize(18, null),
            args: [
                {
                    name: nls.localize(19, null),
                    schema: {
                        type: 'object',
                        properties: {
                            query: { 'type': 'string' },
                            replace: { 'type': 'string' },
                            preserveCase: { 'type': 'boolean' },
                            triggerSearch: { 'type': 'boolean' },
                            filesToInclude: { 'type': 'string' },
                            filesToExclude: { 'type': 'string' },
                            isRegex: { 'type': 'boolean' },
                            isCaseSensitive: { 'type': 'boolean' },
                            matchWholeWord: { 'type': 'boolean' },
                            useExcludeSettingsAndIgnoreFiles: { 'type': 'boolean' },
                        }
                    }
                },
            ]
        },
        id: Constants.FindInFilesActionId,
        // Give more weightage to this keybinding than of `View: Show Search` keybinding. See #116188, #115556, #115511
        weight: 200 /* WorkbenchContrib */ + 1,
        when: null,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 36 /* KEY_F */,
        handler: searchActions_1.FindInFilesCommand
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: Constants.FindInFilesActionId, title: { value: nls.localize(20, null), original: 'Find in Files' }, category } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarEditMenu, {
        group: '4_find_global',
        command: {
            id: Constants.FindInFilesActionId,
            title: nls.localize(21, null)
        },
        order: 1
    });
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(searchActions_1.FocusNextSearchResultAction, { primary: 62 /* F4 */ }), 'Search: Focus Next Search Result', category.value, contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, SearchEditorConstants.InSearchEditor));
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(searchActions_1.FocusPreviousSearchResultAction, { primary: 1024 /* Shift */ | 62 /* F4 */ }), 'Search: Focus Previous Search Result', category.value, contextkey_1.ContextKeyExpr.or(Constants.HasSearchResults, SearchEditorConstants.InSearchEditor));
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(searchActions_1.ReplaceInFilesAction, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 38 /* KEY_H */ }), 'Search: Replace in Files', category.value);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarEditMenu, {
        group: '4_find_global',
        command: {
            id: searchActions_1.ReplaceInFilesAction.ID,
            title: nls.localize(22, null)
        },
        order: 2
    });
    if (platform.isMacintosh) {
        // Register this with a more restrictive `when` on mac to avoid conflict with "copy path"
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign({
            id: Constants.ToggleCaseSensitiveCommandId,
            weight: 200 /* WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewFocusedKey, Constants.FileMatchOrFolderMatchFocusKey.toNegated()),
            handler: searchActions_1.toggleCaseSensitiveCommand
        }, findModel_1.ToggleCaseSensitiveKeybinding));
    }
    else {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign({
            id: Constants.ToggleCaseSensitiveCommandId,
            weight: 200 /* WorkbenchContrib */,
            when: Constants.SearchViewFocusedKey,
            handler: searchActions_1.toggleCaseSensitiveCommand
        }, findModel_1.ToggleCaseSensitiveKeybinding));
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign({
        id: Constants.ToggleWholeWordCommandId,
        weight: 200 /* WorkbenchContrib */,
        when: Constants.SearchViewFocusedKey,
        handler: searchActions_1.toggleWholeWordCommand
    }, findModel_1.ToggleWholeWordKeybinding));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign({
        id: Constants.ToggleRegexCommandId,
        weight: 200 /* WorkbenchContrib */,
        when: Constants.SearchViewFocusedKey,
        handler: searchActions_1.toggleRegexCommand
    }, findModel_1.ToggleRegexKeybinding));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule(Object.assign({
        id: Constants.TogglePreserveCaseId,
        weight: 200 /* WorkbenchContrib */,
        when: Constants.SearchViewFocusedKey,
        handler: searchActions_1.togglePreserveCaseCommand
    }, findModel_1.TogglePreserveCaseKeybinding));
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: Constants.AddCursorsAtSearchResults,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.FileMatchOrMatchFocusKey),
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 42 /* KEY_L */,
        handler: (accessor, args) => {
            const searchView = (0, searchActions_1.getSearchView)(accessor.get(views_1.IViewsService));
            if (searchView) {
                const tree = searchView.getControl();
                searchView.openEditorWithMultiCursor(tree.getFocus()[0]);
            }
        }
    });
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ShowAllSymbolsAction, { primary: 2048 /* CtrlCmd */ | 50 /* KEY_T */ }), 'Go to Symbol in Workspace...');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(searchActions_1.ToggleSearchOnTypeAction), 'Search: Toggle Search on Type', category.value);
    // Register Quick Access Handler
    const quickAccessRegistry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: anythingQuickAccess_1.AnythingQuickAccessProvider,
        prefix: anythingQuickAccess_1.AnythingQuickAccessProvider.PREFIX,
        placeholder: nls.localize(23, null, gotoLineQuickAccess_1.AbstractGotoLineQuickAccessProvider.PREFIX, gotoSymbolQuickAccess_1.GotoSymbolQuickAccessProvider.PREFIX),
        contextKey: quickaccess_1.defaultQuickAccessContextKeyValue,
        helpEntries: [{ description: nls.localize(24, null), needsEditor: false }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: symbolsQuickAccess_1.SymbolsQuickAccessProvider,
        prefix: symbolsQuickAccess_1.SymbolsQuickAccessProvider.PREFIX,
        placeholder: nls.localize(25, null),
        contextKey: 'inWorkspaceSymbolsPicker',
        helpEntries: [{ description: nls.localize(26, null), needsEditor: false }]
    });
    // Configuration
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'search',
        order: 13,
        title: nls.localize(27, null),
        type: 'object',
        properties: {
            [search_2.SEARCH_EXCLUDE_CONFIG]: {
                type: 'object',
                markdownDescription: nls.localize(28, null),
                default: { '**/node_modules': true, '**/bower_components': true, '**/*.code-search': true },
                additionalProperties: {
                    anyOf: [
                        {
                            type: 'boolean',
                            description: nls.localize(29, null),
                        },
                        {
                            type: 'object',
                            properties: {
                                when: {
                                    type: 'string',
                                    pattern: '\\w*\\$\\(basename\\)\\w*',
                                    default: '$(basename).ext',
                                    description: nls.localize(30, null)
                                }
                            }
                        }
                    ]
                },
                scope: 4 /* RESOURCE */
            },
            [SEARCH_MODE_CONFIG]: {
                type: 'string',
                enum: ['view', 'reuseEditor', 'newEditor'],
                default: 'view',
                markdownDescription: nls.localize(31, null),
                enumDescriptions: [
                    nls.localize(32, null),
                    nls.localize(33, null),
                    nls.localize(34, null),
                ]
            },
            'search.useRipgrep': {
                type: 'boolean',
                description: nls.localize(35, null),
                deprecationMessage: nls.localize(36, null),
                default: true
            },
            'search.maintainFileSearchCache': {
                type: 'boolean',
                description: nls.localize(37, null),
                default: false
            },
            'search.useIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize(38, null),
                default: true,
                scope: 4 /* RESOURCE */
            },
            'search.useGlobalIgnoreFiles': {
                type: 'boolean',
                markdownDescription: nls.localize(39, null),
                default: false,
                scope: 4 /* RESOURCE */
            },
            'search.quickOpen.includeSymbols': {
                type: 'boolean',
                description: nls.localize(40, null),
                default: false
            },
            'search.quickOpen.includeHistory': {
                type: 'boolean',
                description: nls.localize(41, null),
                default: true
            },
            'search.quickOpen.history.filterSortOrder': {
                'type': 'string',
                'enum': ['default', 'recency'],
                'default': 'default',
                'enumDescriptions': [
                    nls.localize(42, null),
                    nls.localize(43, null)
                ],
                'description': nls.localize(44, null)
            },
            'search.followSymlinks': {
                type: 'boolean',
                description: nls.localize(45, null),
                default: true
            },
            'search.smartCase': {
                type: 'boolean',
                description: nls.localize(46, null),
                default: false
            },
            'search.globalFindClipboard': {
                type: 'boolean',
                default: false,
                description: nls.localize(47, null),
                included: platform.isMacintosh
            },
            'search.location': {
                type: 'string',
                enum: ['sidebar', 'panel'],
                default: 'sidebar',
                description: nls.localize(48, null),
                deprecationMessage: nls.localize(49, null)
            },
            'search.collapseResults': {
                type: 'string',
                enum: ['auto', 'alwaysCollapse', 'alwaysExpand'],
                enumDescriptions: [
                    nls.localize(50, null),
                    '',
                    ''
                ],
                default: 'alwaysExpand',
                description: nls.localize(51, null),
            },
            'search.useReplacePreview': {
                type: 'boolean',
                default: true,
                description: nls.localize(52, null),
            },
            'search.showLineNumbers': {
                type: 'boolean',
                default: false,
                description: nls.localize(53, null),
            },
            'search.usePCRE2': {
                type: 'boolean',
                default: false,
                description: nls.localize(54, null),
                deprecationMessage: nls.localize(55, null),
            },
            'search.actionsPosition': {
                type: 'string',
                enum: ['auto', 'right'],
                enumDescriptions: [
                    nls.localize(56, null),
                    nls.localize(57, null),
                ],
                default: 'right',
                description: nls.localize(58, null)
            },
            'search.searchOnType': {
                type: 'boolean',
                default: true,
                description: nls.localize(59, null)
            },
            'search.seedWithNearestWord': {
                type: 'boolean',
                default: false,
                description: nls.localize(60, null)
            },
            'search.seedOnFocus': {
                type: 'boolean',
                default: false,
                description: nls.localize(61, null)
            },
            'search.searchOnTypeDebouncePeriod': {
                type: 'number',
                default: 300,
                markdownDescription: nls.localize(62, null)
            },
            'search.searchEditor.doubleClickBehaviour': {
                type: 'string',
                enum: ['selectWord', 'goToLocation', 'openLocationToSide'],
                default: 'goToLocation',
                enumDescriptions: [
                    nls.localize(63, null),
                    nls.localize(64, null),
                    nls.localize(65, null),
                ],
                markdownDescription: nls.localize(66, null)
            },
            'search.searchEditor.reusePriorSearchConfiguration': {
                type: 'boolean',
                default: false,
                markdownDescription: nls.localize(67, null)
            },
            'search.searchEditor.defaultNumberOfContextLines': {
                type: ['number', 'null'],
                default: 1,
                markdownDescription: nls.localize(68, null)
            },
            'search.sortOrder': {
                'type': 'string',
                'enum': ["default" /* Default */, "fileNames" /* FileNames */, "type" /* Type */, "modified" /* Modified */, "countDescending" /* CountDescending */, "countAscending" /* CountAscending */],
                'default': "default" /* Default */,
                'enumDescriptions': [
                    nls.localize(69, null),
                    nls.localize(70, null),
                    nls.localize(71, null),
                    nls.localize(72, null),
                    nls.localize(73, null),
                    nls.localize(74, null)
                ],
                'description': nls.localize(75, null)
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand('_executeWorkspaceSymbolProvider', function (accessor, ...args) {
        const [query] = args;
        (0, types_1.assertType)(typeof query === 'string');
        return (0, search_1.getWorkspaceSymbols)(query);
    });
    // Go to menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '3_global_nav',
        command: {
            id: 'workbench.action.showAllSymbols',
            title: nls.localize(76, null)
        },
        order: 2
    });
});
//# sourceMappingURL=search.contribution.js.map