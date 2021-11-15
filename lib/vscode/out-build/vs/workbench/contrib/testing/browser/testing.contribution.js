/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/nls!vs/workbench/contrib/testing/browser/testing.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testingDecorations", "vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/workbench/contrib/testing/browser/testingExplorerView", "vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/workbench/contrib/testing/browser/testingOutputTerminalService", "vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/workbench/contrib/testing/browser/testingViewPaneContainer", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/testingAutoRun", "vs/workbench/contrib/testing/common/testingContentProvider", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testResultStorage", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/testServiceImpl", "vs/workbench/contrib/testing/common/workspaceTestCollectionService", "./testExplorerActions"], function (require, exports, editorExtensions_1, nls_1, actions_1, commands_1, configurationRegistry_1, contextkey_1, descriptors_1, extensions_1, platform_1, contributions_1, views_1, icons_1, testingDecorations_1, testingExplorerFilter_1, testingExplorerView_1, testingOutputPeek_1, testingOutputTerminalService_1, testingProgressUiService_1, testingViewPaneContainer_1, configuration_1, testingAutoRun_1, testingContentProvider_1, testingContextKeys_1, testResultService_1, testResultStorage_1, testService_1, testServiceImpl_1, workspaceTestCollectionService_1, Action) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(testService_1.ITestService, testServiceImpl_1.TestService);
    (0, extensions_1.registerSingleton)(testResultStorage_1.ITestResultStorage, testResultStorage_1.TestResultStorage);
    (0, extensions_1.registerSingleton)(testResultService_1.ITestResultService, testResultService_1.TestResultService);
    (0, extensions_1.registerSingleton)(testingExplorerFilter_1.ITestExplorerFilterState, testingExplorerFilter_1.TestExplorerFilterState);
    (0, extensions_1.registerSingleton)(testingAutoRun_1.ITestingAutoRun, testingAutoRun_1.TestingAutoRun, true);
    (0, extensions_1.registerSingleton)(testingOutputTerminalService_1.ITestingOutputTerminalService, testingOutputTerminalService_1.TestingOutputTerminalService, true);
    (0, extensions_1.registerSingleton)(testingOutputPeek_1.ITestingPeekOpener, testingOutputPeek_1.TestingPeekOpener);
    (0, extensions_1.registerSingleton)(testingProgressUiService_1.ITestingProgressUiService, testingProgressUiService_1.TestingProgressUiService);
    (0, extensions_1.registerSingleton)(workspaceTestCollectionService_1.IWorkspaceTestCollectionService, workspaceTestCollectionService_1.WorkspaceTestCollectionService);
    const viewContainer = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: "workbench.view.extension.test" /* ViewletId */,
        title: (0, nls_1.localize)(0, null),
        ctorDescriptor: new descriptors_1.SyncDescriptor(testingViewPaneContainer_1.TestingViewPaneContainer),
        icon: icons_1.testingViewIcon,
        alwaysUseContainerInfo: true,
        order: 6,
        hideIfEmpty: true,
    }, 0 /* Sidebar */);
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* ExplorerViewId */, {
        content: (0, nls_1.localize)(1, null),
    });
    viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* ExplorerViewId */, {
        content: (0, nls_1.localize)(2, null, 'testing.searchForTestExtension'),



        order: 10
    });
    viewsRegistry.registerViews([{
            id: "workbench.view.testing" /* ExplorerViewId */,
            name: (0, nls_1.localize)(3, null),
            ctorDescriptor: new descriptors_1.SyncDescriptor(testingExplorerView_1.TestingExplorerView),
            canToggleVisibility: true,
            workspace: true,
            canMoveView: true,
            weight: 80,
            order: -999,
            containerIcon: icons_1.testingViewIcon,
            // temporary until release, at which point we can show the welcome view:
            when: contextkey_1.ContextKeyExpr.greater(testingContextKeys_1.TestingContextKeys.providerCount.key, 0),
        }], viewContainer);
    (0, actions_1.registerAction2)(Action.AutoRunOffAction);
    (0, actions_1.registerAction2)(Action.AutoRunOnAction);
    (0, actions_1.registerAction2)(Action.CancelTestRunAction);
    (0, actions_1.registerAction2)(Action.ClearTestResultsAction);
    (0, actions_1.registerAction2)(Action.CollapseAllAction);
    (0, actions_1.registerAction2)(Action.DebugAllAction);
    (0, actions_1.registerAction2)(Action.DebugAtCursor);
    (0, actions_1.registerAction2)(Action.DebugCurrentFile);
    (0, actions_1.registerAction2)(Action.DebugFailedTests);
    (0, actions_1.registerAction2)(Action.DebugLastRun);
    (0, actions_1.registerAction2)(Action.DebugSelectedAction);
    (0, actions_1.registerAction2)(Action.EditFocusedTest);
    (0, actions_1.registerAction2)(Action.RefreshTestsAction);
    (0, actions_1.registerAction2)(Action.ReRunFailedTests);
    (0, actions_1.registerAction2)(Action.ReRunLastRun);
    (0, actions_1.registerAction2)(Action.RunAllAction);
    (0, actions_1.registerAction2)(Action.RunAtCursor);
    (0, actions_1.registerAction2)(Action.RunCurrentFile);
    (0, actions_1.registerAction2)(Action.RunSelectedAction);
    (0, actions_1.registerAction2)(Action.SearchForTestExtension);
    (0, actions_1.registerAction2)(Action.ShowMostRecentOutputAction);
    (0, actions_1.registerAction2)(Action.TestingSortByLocationAction);
    (0, actions_1.registerAction2)(Action.TestingSortByNameAction);
    (0, actions_1.registerAction2)(Action.TestingViewAsListAction);
    (0, actions_1.registerAction2)(Action.TestingViewAsTreeAction);
    (0, actions_1.registerAction2)(testingOutputPeek_1.CloseTestPeek);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingContentProvider_1.TestingContentProvider, 3 /* Restored */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingOutputPeek_1.TestingPeekOpener, 4 /* Eventually */);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(testingProgressUiService_1.TestingProgressUiService, 4 /* Eventually */);
    (0, editorExtensions_1.registerEditorContribution)("editor.contrib.testingOutputPeek" /* OutputPeekContributionId */, testingOutputPeek_1.TestingOutputPeekController);
    (0, editorExtensions_1.registerEditorContribution)("editor.contrib.testingDecorations" /* DecorationsContributionId */, testingDecorations_1.TestingDecorations);
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.runTests',
        handler: async (accessor, tests) => {
            const testService = accessor.get(testService_1.ITestService);
            testService.runTests({ debug: false, tests: tests.filter(t => t.src && t.testId) });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.debugTests',
        handler: async (accessor, tests) => {
            const testService = accessor.get(testService_1.ITestService);
            testService.runTests({ debug: true, tests: tests.filter(t => t.src && t.testId) });
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.revealTestInExplorer',
        handler: async (accessor, pathToTest) => {
            accessor.get(testingExplorerFilter_1.ITestExplorerFilterState).reveal.value = pathToTest;
            accessor.get(views_1.IViewsService).openView("workbench.view.testing" /* ExplorerViewId */);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'vscode.peekTestError',
        handler: async (accessor, extId) => {
            const lookup = accessor.get(testResultService_1.ITestResultService).getStateById(extId);
            if (lookup) {
                accessor.get(testingOutputPeek_1.ITestingPeekOpener).tryPeekFirstError(lookup[0], lookup[1]);
            }
        }
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration(configuration_1.testingConfiguation);
});
//# sourceMappingURL=testing.contribution.js.map