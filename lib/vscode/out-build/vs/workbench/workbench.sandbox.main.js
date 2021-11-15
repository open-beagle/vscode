/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataAutoSyncService", "vs/workbench/workbench.common.main", "vs/workbench/electron-sandbox/parts/dialogs/dialog.contribution", "vs/workbench/services/textfile/electron-sandbox/nativeTextFileService", "vs/workbench/services/dialogs/electron-sandbox/fileDialogService", "vs/workbench/services/workspaces/electron-sandbox/workspacesService", "vs/workbench/services/textMate/electron-sandbox/textMateService", "vs/workbench/services/menubar/electron-sandbox/menubarService", "vs/workbench/services/issue/electron-sandbox/issueService", "vs/workbench/services/update/electron-sandbox/updateService", "vs/workbench/services/url/electron-sandbox/urlService", "vs/workbench/services/lifecycle/electron-sandbox/lifecycleService", "vs/workbench/services/title/electron-sandbox/titleService", "vs/workbench/services/host/electron-sandbox/nativeHostService", "vs/workbench/services/request/electron-sandbox/requestService", "vs/workbench/services/extensionResourceLoader/electron-sandbox/extensionResourceLoaderService", "vs/workbench/services/clipboard/electron-sandbox/clipboardService", "vs/workbench/services/contextmenu/electron-sandbox/contextmenuService", "vs/workbench/services/workspaces/electron-sandbox/workspaceEditingService", "vs/workbench/services/configurationResolver/electron-sandbox/configurationResolverService", "vs/workbench/services/accessibility/electron-sandbox/accessibilityService", "vs/workbench/services/path/electron-sandbox/pathService", "vs/workbench/services/themes/electron-sandbox/nativeHostColorSchemeService", "vs/workbench/services/extensionManagement/electron-sandbox/extensionManagementService", "vs/workbench/services/extensionManagement/electron-sandbox/extensionUrlTrustService", "vs/workbench/services/credentials/electron-sandbox/credentialsService", "vs/workbench/services/encryption/electron-sandbox/encryptionService", "vs/workbench/services/localizations/electron-sandbox/localizationsService", "vs/workbench/services/telemetry/electron-sandbox/telemetryService", "vs/workbench/services/extensionManagement/electron-sandbox/extensionManagementServerService", "vs/workbench/services/extensionManagement/electron-sandbox/extensionTipsService", "vs/workbench/services/userDataSync/electron-sandbox/userDataSyncMachinesService", "vs/workbench/services/userDataSync/electron-sandbox/userDataSyncService", "vs/workbench/services/userDataSync/electron-sandbox/userDataSyncAccountService", "vs/workbench/services/userDataSync/electron-sandbox/userDataSyncStoreManagementService", "vs/workbench/services/userDataSync/electron-sandbox/userDataAutoSyncService", "vs/workbench/services/ipc/electron-sandbox/sharedProcessService", "vs/workbench/services/timer/electron-sandbox/timerService", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/integrity/electron-sandbox/integrityService", "vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService", "vs/platform/diagnostics/electron-sandbox/diagnosticsService", "vs/platform/checksum/electron-sandbox/checksumService", "vs/platform/telemetry/electron-sandbox/customEndpointTelemetryService", "vs/workbench/services/files/electron-sandbox/elevatedFileService", "vs/workbench/contrib/logs/electron-sandbox/logs.contribution", "vs/workbench/contrib/localizations/browser/localizations.contribution", "vs/workbench/electron-sandbox/desktop.contribution", "vs/workbench/contrib/files/electron-sandbox/files.contribution", "vs/workbench/contrib/files/electron-sandbox/fileActions.contribution", "vs/workbench/contrib/codeEditor/electron-sandbox/codeEditor.contribution", "vs/workbench/contrib/debug/electron-sandbox/extensionHostDebugService", "vs/workbench/contrib/welcome/telemetryOptOut/electron-sandbox/telemetryOptOut.contribution", "vs/workbench/contrib/issue/electron-sandbox/issue.contribution", "vs/workbench/contrib/remote/electron-sandbox/remote.contribution", "vs/workbench/contrib/configExporter/electron-sandbox/configurationExportHelper.contribution", "vs/workbench/contrib/terminal/electron-sandbox/terminal.contribution", "vs/workbench/contrib/themes/browser/themes.test.contribution", "vs/workbench/contrib/userDataSync/electron-sandbox/userDataSync.contribution", "vs/workbench/contrib/output/electron-sandbox/outputChannelModelService", "vs/workbench/contrib/tags/electron-sandbox/workspaceTagsService", "vs/workbench/contrib/tags/electron-sandbox/tags.contribution", "vs/workbench/contrib/performance/electron-sandbox/performance.contribution", "vs/workbench/contrib/tasks/electron-sandbox/taskService"], function (require, exports, extensions_1, userDataInit_1, userDataSync_1, userDataAutoSyncService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(userDataInit_1.IUserDataInitializationService, userDataInit_1.UserDataInitializationService);
    (0, extensions_1.registerSingleton)(userDataSync_1.IUserDataAutoSyncEnablementService, userDataAutoSyncService_1.UserDataAutoSyncEnablementService);
});
//#endregion
//# sourceMappingURL=workbench.sandbox.main.js.map