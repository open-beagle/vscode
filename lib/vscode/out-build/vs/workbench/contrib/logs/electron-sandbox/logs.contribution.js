/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/workbench/contrib/logs/electron-sandbox/logsActions"], function (require, exports, platform_1, actions_1, actions_2, logsActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workbenchActionsRegistry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(logsActions_1.OpenLogsFolderAction), 'Developer: Open Logs Folder', actions_1.CATEGORIES.Developer.value);
    workbenchActionsRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(logsActions_1.OpenExtensionLogsFolderAction), 'Developer: Open Extension Logs Folder', actions_1.CATEGORIES.Developer.value);
});
//# sourceMappingURL=logs.contribution.js.map