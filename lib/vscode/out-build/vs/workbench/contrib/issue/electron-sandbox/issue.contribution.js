/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/contrib/issue/electron-sandbox/issue.contribution", "vs/platform/product/common/product", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/contrib/issue/electron-sandbox/issueActions", "vs/platform/instantiation/common/extensions", "vs/workbench/services/issue/common/issue", "vs/workbench/services/issue/electron-sandbox/issueService", "vs/platform/commands/common/commands", "vs/platform/issue/electron-sandbox/issue", "vs/workbench/contrib/issue/common/commands"], function (require, exports, platform_1, nls, product_1, actions_1, actions_2, issueActions_1, extensions_1, issue_1, issueService_1, commands_1, issue_2, commands_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workbenchActionsRegistry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    if (!!product_1.default.reportIssueUrl) {
        workbenchActionsRegistry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(issueActions_1.ReportPerformanceIssueUsingReporterAction), 'Help: Report Performance Issue', actions_2.CATEGORIES.Help.value);
        const OpenIssueReporterActionLabel = nls.localize(0, null);
        commands_1.CommandsRegistry.registerCommand(commands_2.OpenIssueReporterActionId, function (accessor, args) {
            const data = Array.isArray(args)
                ? { extensionId: args[0] }
                : args || {};
            return accessor.get(issue_1.IWorkbenchIssueService).openReporter(data);
        });
        const command = {
            id: commands_2.OpenIssueReporterActionId,
            title: { value: OpenIssueReporterActionLabel, original: 'Report Issue' },
            category: actions_2.CATEGORIES.Help
        };
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, { command });
    }
    workbenchActionsRegistry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(issueActions_1.OpenProcessExplorer), 'Developer: Open Process Explorer', actions_2.CATEGORIES.Developer.value);
    (0, extensions_1.registerSingleton)(issue_1.IWorkbenchIssueService, issueService_1.WorkbenchIssueService, true);
    commands_1.CommandsRegistry.registerCommand('_issues.getSystemStatus', (accessor) => {
        return accessor.get(issue_2.IIssueService).getSystemStatus();
    });
});
//# sourceMappingURL=issue.contribution.js.map