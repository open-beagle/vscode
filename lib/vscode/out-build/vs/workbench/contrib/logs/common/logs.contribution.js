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
define(["require", "exports", "vs/nls!vs/workbench/contrib/logs/common/logs.contribution", "vs/base/common/path", "vs/platform/registry/common/platform", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/workbench/contrib/logs/common/logsActions", "vs/workbench/contrib/logs/common/logConstants", "vs/workbench/common/contributions", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/base/common/uri", "vs/workbench/services/output/common/output", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/resources", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/logs/common/logsDataCleaner", "vs/workbench/contrib/output/common/output"], function (require, exports, nls, path_1, platform_1, actions_1, actions_2, logsActions_1, Constants, contributions_1, environmentService_1, files_1, uri_1, output_1, lifecycle_1, log_1, resources_1, platform_2, instantiation_1, logsDataCleaner_1, output_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const workbenchActionsRegistry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    workbenchActionsRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(logsActions_1.SetLogLevelAction), 'Developer: Set Log Level...', actions_1.CATEGORIES.Developer.value);
    let LogOutputChannels = class LogOutputChannels extends lifecycle_1.Disposable {
        constructor(environmentService, logService, fileService, instantiationService) {
            super();
            this.environmentService = environmentService;
            this.logService = logService;
            this.fileService = fileService;
            this.instantiationService = instantiationService;
            this.registerCommonContributions();
            if (platform_2.isWeb) {
                this.registerWebContributions();
            }
            else {
                this.registerNativeContributions();
            }
        }
        registerCommonContributions() {
            this.registerLogChannel(Constants.userDataSyncLogChannelId, nls.localize(0, null), this.environmentService.userDataSyncLogResource);
            this.registerLogChannel(Constants.rendererLogChannelId, nls.localize(1, null), this.environmentService.logFile);
            const registerTelemetryChannel = (level) => {
                if (level === log_1.LogLevel.Trace && !platform_1.Registry.as(output_1.Extensions.OutputChannels).getChannel(Constants.telemetryLogChannelId)) {
                    this.registerLogChannel(Constants.telemetryLogChannelId, nls.localize(2, null), this.environmentService.telemetryLogResource);
                }
            };
            registerTelemetryChannel(this.logService.getLevel());
            this.logService.onDidChangeLogLevel(registerTelemetryChannel);
            (0, actions_2.registerAction2)(class ShowWindowLogAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: Constants.showWindowLogActionId,
                        title: { value: nls.localize(3, null), original: 'Show Window Log' },
                        category: actions_1.CATEGORIES.Developer,
                        f1: true
                    });
                }
                async run(servicesAccessor) {
                    const outputService = servicesAccessor.get(output_2.IOutputService);
                    outputService.showChannel(Constants.rendererLogChannelId);
                }
            });
        }
        registerWebContributions() {
            this.instantiationService.createInstance(logsDataCleaner_1.LogsDataCleaner);
            const workbenchActionsRegistry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
            workbenchActionsRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(logsActions_1.OpenWindowSessionLogFileAction), 'Developer: Open Window Log File (Session)...', actions_1.CATEGORIES.Developer.value);
        }
        registerNativeContributions() {
            this.registerLogChannel(Constants.mainLogChannelId, nls.localize(4, null), uri_1.URI.file((0, path_1.join)(this.environmentService.logsPath, `main.log`)));
            this.registerLogChannel(Constants.sharedLogChannelId, nls.localize(5, null), uri_1.URI.file((0, path_1.join)(this.environmentService.logsPath, `sharedprocess.log`)));
        }
        async registerLogChannel(id, label, file) {
            await (0, files_1.whenProviderRegistered)(file, this.fileService);
            const outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
            /* watch first and then check if file exists so that to avoid missing file creation event after watching #102117 */
            const watcher = this.fileService.watch((0, resources_1.dirname)(file));
            const exists = await this.fileService.exists(file);
            if (exists) {
                watcher.dispose();
                outputChannelRegistry.registerChannel({ id, label, file, log: true });
                return;
            }
            const disposable = this.fileService.onDidFilesChange(e => {
                if (e.contains(file, 1 /* ADDED */, 0 /* UPDATED */)) {
                    watcher.dispose();
                    disposable.dispose();
                    outputChannelRegistry.registerChannel({ id, label, file, log: true });
                }
            });
        }
    };
    LogOutputChannels = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, log_1.ILogService),
        __param(2, files_1.IFileService),
        __param(3, instantiation_1.IInstantiationService)
    ], LogOutputChannels);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(LogOutputChannels, 3 /* Restored */);
});
//# sourceMappingURL=logs.contribution.js.map