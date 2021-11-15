/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/page/browser/welcomePage.contribution", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/workbench/contrib/welcome/page/browser/welcomePage", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/editor"], function (require, exports, nls_1, contributions_1, platform_1, welcomePage_1, actions_1, actions_2, configurationRegistry_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration(welcomePage_1.DEFAULT_STARTUP_EDITOR_CONFIG);
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(welcomePage_1.WelcomePageContribution, 3 /* Restored */);
    platform_1.Registry.as(actions_1.Extensions.WorkbenchActions)
        .registerWorkbenchAction(actions_2.SyncActionDescriptor.from(welcomePage_1.WelcomePageAction), 'Help: Welcome', actions_1.CATEGORIES.Help.value);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(welcomePage_1.WelcomeInputSerializer.ID, welcomePage_1.WelcomeInputSerializer);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarHelpMenu, {
        group: '1_welcome',
        command: {
            id: 'workbench.action.showWelcomePage',
            title: (0, nls_1.localize)(0, null)
        },
        order: 1
    });
});
//# sourceMappingURL=welcomePage.contribution.js.map