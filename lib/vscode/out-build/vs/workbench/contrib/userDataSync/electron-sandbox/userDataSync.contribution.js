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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/userDataSync/common/userDataSync", "vs/platform/registry/common/platform", "vs/platform/ipc/electron-sandbox/services", "vs/platform/userDataSync/common/userDataSyncIpc", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/contrib/userDataSync/electron-sandbox/userDataSync.contribution", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/native/electron-sandbox/native", "vs/platform/notification/common/notification", "vs/base/common/actions", "vs/workbench/services/issue/common/issue", "vs/base/common/lifecycle", "vs/platform/commands/common/commands", "vs/workbench/services/userDataSync/common/userDataSync"], function (require, exports, contributions_1, userDataSync_1, platform_1, services_1, userDataSyncIpc_1, actions_1, nls_1, environment_1, files_1, native_1, notification_1, actions_2, issue_1, lifecycle_1, commands_1, userDataSync_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let UserDataSyncServicesContribution = class UserDataSyncServicesContribution {
        constructor(userDataSyncUtilService, sharedProcessService) {
            sharedProcessService.registerChannel('userDataSyncUtil', new userDataSyncIpc_1.UserDataSycnUtilServiceChannel(userDataSyncUtilService));
        }
    };
    UserDataSyncServicesContribution = __decorate([
        __param(0, userDataSync_1.IUserDataSyncUtilService),
        __param(1, services_1.ISharedProcessService)
    ], UserDataSyncServicesContribution);
    let UserDataSyncReportIssueContribution = class UserDataSyncReportIssueContribution extends lifecycle_1.Disposable {
        constructor(userDataAutoSyncService, notificationService, workbenchIssueService, commandService) {
            super();
            this.notificationService = notificationService;
            this.workbenchIssueService = workbenchIssueService;
            this.commandService = commandService;
            this._register(userDataAutoSyncService.onError(error => this.onAutoSyncError(error)));
        }
        onAutoSyncError(error) {
            switch (error.code) {
                case userDataSync_1.UserDataSyncErrorCode.LocalTooManyRequests:
                case userDataSync_1.UserDataSyncErrorCode.TooManyRequests:
                    const operationId = error.operationId ? (0, nls_1.localize)(0, null, error.operationId) : undefined;
                    const message = (0, nls_1.localize)(1, null);
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                        source: error.operationId ? (0, nls_1.localize)(2, null, error.operationId) : undefined,
                        actions: {
                            primary: [
                                new actions_2.Action('Show Sync Logs', (0, nls_1.localize)(3, null), undefined, true, () => this.commandService.executeCommand(userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID)),
                                new actions_2.Action('Report Issue', (0, nls_1.localize)(4, null), undefined, true, () => this.workbenchIssueService.openReporter())
                            ]
                        }
                    });
                    return;
            }
        }
    };
    UserDataSyncReportIssueContribution = __decorate([
        __param(0, userDataSync_1.IUserDataAutoSyncService),
        __param(1, notification_1.INotificationService),
        __param(2, issue_1.IWorkbenchIssueService),
        __param(3, commands_1.ICommandService)
    ], UserDataSyncReportIssueContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(UserDataSyncServicesContribution, 1 /* Starting */);
    workbenchRegistry.registerWorkbenchContribution(UserDataSyncReportIssueContribution, 3 /* Restored */);
    (0, actions_1.registerAction2)(class OpenSyncBackupsFolder extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.userData.actions.openSyncBackupsFolder',
                title: { value: (0, nls_1.localize)(5, null), original: 'Open Local Backups Folder' },
                category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */),
                }
            });
        }
        async run(accessor) {
            const syncHome = accessor.get(environment_1.IEnvironmentService).userDataSyncHome;
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const fileService = accessor.get(files_1.IFileService);
            const notificationService = accessor.get(notification_1.INotificationService);
            if (await fileService.exists(syncHome)) {
                const folderStat = await fileService.resolve(syncHome);
                const item = folderStat.children && folderStat.children[0] ? folderStat.children[0].resource : syncHome;
                return nativeHostService.showItemInFolder(item.fsPath);
            }
            else {
                notificationService.info((0, nls_1.localize)(6, null));
            }
        }
    });
});
//# sourceMappingURL=userDataSync.contribution.js.map