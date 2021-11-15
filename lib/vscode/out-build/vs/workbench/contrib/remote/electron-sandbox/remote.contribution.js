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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/electron-sandbox/remote.contribution", "vs/platform/registry/common/platform", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/keyCodes", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/contributions", "vs/platform/label/common/label", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/workbench/services/extensions/common/extensions", "vs/platform/log/common/log", "vs/platform/download/common/downloadIpc", "vs/platform/log/common/logIpc", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/download/common/download", "vs/workbench/services/dialogs/browser/simpleFileDialog", "vs/platform/workspace/common/workspace"], function (require, exports, nls, platform_1, remoteAgentService_1, lifecycle_1, platform_2, keyCodes_1, keybindingsRegistry_1, contributions_1, label_1, commands_1, network_1, extensions_1, log_1, downloadIpc_1, logIpc_1, globals_1, environmentService_1, configuration_1, configurationRegistry_1, remoteAuthorityResolver_1, download_1, simpleFileDialog_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let RemoteChannelsContribution = class RemoteChannelsContribution {
        constructor(logService, loggerService, remoteAgentService, downloadService) {
            const connection = remoteAgentService.getConnection();
            if (connection) {
                connection.registerChannel('download', new downloadIpc_1.DownloadServiceChannel(downloadService));
                connection.registerChannel('logger', new logIpc_1.LogLevelChannel(logService));
            }
        }
    };
    RemoteChannelsContribution = __decorate([
        __param(0, log_1.ILogService),
        __param(1, log_1.ILogService),
        __param(2, remoteAgentService_1.IRemoteAgentService),
        __param(3, download_1.IDownloadService)
    ], RemoteChannelsContribution);
    let RemoteAgentDiagnosticListener = class RemoteAgentDiagnosticListener {
        constructor(remoteAgentService, labelService) {
            globals_1.ipcRenderer.on('vscode:getDiagnosticInfo', (event, request) => {
                const connection = remoteAgentService.getConnection();
                if (connection) {
                    const hostName = labelService.getHostLabel(network_1.Schemas.vscodeRemote, connection.remoteAuthority);
                    remoteAgentService.getDiagnosticInfo(request.args)
                        .then(info => {
                        if (info) {
                            info.hostName = hostName;
                        }
                        globals_1.ipcRenderer.send(request.replyChannel, info);
                    })
                        .catch(e => {
                        const errorMessage = e && e.message ? `Fetching remote diagnostics for '${hostName}' failed: ${e.message}` : `Fetching remote diagnostics for '${hostName}' failed.`;
                        globals_1.ipcRenderer.send(request.replyChannel, { hostName, errorMessage });
                    });
                }
                else {
                    globals_1.ipcRenderer.send(request.replyChannel);
                }
            });
        }
    };
    RemoteAgentDiagnosticListener = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, label_1.ILabelService)
    ], RemoteAgentDiagnosticListener);
    let RemoteExtensionHostEnvironmentUpdater = class RemoteExtensionHostEnvironmentUpdater {
        constructor(remoteAgentService, remoteResolverService, extensionService) {
            const connection = remoteAgentService.getConnection();
            if (connection) {
                connection.onDidStateChange(async (e) => {
                    if (e.type === 4 /* ConnectionGain */) {
                        const resolveResult = await remoteResolverService.resolveAuthority(connection.remoteAuthority);
                        if (resolveResult.options && resolveResult.options.extensionHostEnv) {
                            await extensionService.setRemoteEnvironment(resolveResult.options.extensionHostEnv);
                        }
                    }
                });
            }
        }
    };
    RemoteExtensionHostEnvironmentUpdater = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(2, extensions_1.IExtensionService)
    ], RemoteExtensionHostEnvironmentUpdater);
    let RemoteTelemetryEnablementUpdater = class RemoteTelemetryEnablementUpdater extends lifecycle_1.Disposable {
        constructor(remoteAgentService, configurationService) {
            super();
            this.remoteAgentService = remoteAgentService;
            this.configurationService = configurationService;
            this.updateRemoteTelemetryEnablement();
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('telemetry.enableTelemetry')) {
                    this.updateRemoteTelemetryEnablement();
                }
            }));
        }
        updateRemoteTelemetryEnablement() {
            if (!this.configurationService.getValue('telemetry.enableTelemetry')) {
                return this.remoteAgentService.disableTelemetry();
            }
            return Promise.resolve();
        }
    };
    RemoteTelemetryEnablementUpdater = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, configuration_1.IConfigurationService)
    ], RemoteTelemetryEnablementUpdater);
    let RemoteEmptyWorkbenchPresentation = class RemoteEmptyWorkbenchPresentation extends lifecycle_1.Disposable {
        constructor(environmentService, remoteAuthorityResolverService, configurationService, commandService, contextService) {
            super();
            function shouldShowExplorer() {
                const startupEditor = configurationService.getValue('workbench.startupEditor');
                return startupEditor !== 'welcomePage' && startupEditor !== 'welcomePageInEmptyWorkbench';
            }
            function shouldShowTerminal() {
                return shouldShowExplorer();
            }
            const { remoteAuthority, filesToDiff, filesToOpenOrCreate, filesToWait } = environmentService.configuration;
            if (remoteAuthority && contextService.getWorkbenchState() === 1 /* EMPTY */ && !(filesToDiff === null || filesToDiff === void 0 ? void 0 : filesToDiff.length) && !(filesToOpenOrCreate === null || filesToOpenOrCreate === void 0 ? void 0 : filesToOpenOrCreate.length) && !filesToWait) {
                remoteAuthorityResolverService.resolveAuthority(remoteAuthority).then(() => {
                    if (shouldShowExplorer()) {
                        commandService.executeCommand('workbench.view.explorer');
                    }
                    if (shouldShowTerminal()) {
                        commandService.executeCommand('workbench.action.terminal.toggleTerminal');
                    }
                });
            }
        }
    };
    RemoteEmptyWorkbenchPresentation = __decorate([
        __param(0, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(1, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, commands_1.ICommandService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], RemoteEmptyWorkbenchPresentation);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteChannelsContribution, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteAgentDiagnosticListener, 4 /* Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteExtensionHostEnvironmentUpdater, 4 /* Eventually */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteTelemetryEnablementUpdater, 2 /* Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RemoteEmptyWorkbenchPresentation, 1 /* Starting */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'remote',
        title: nls.localize(0, null),
        type: 'object',
        properties: {
            'remote.downloadExtensionsLocally': {
                type: 'boolean',
                markdownDescription: nls.localize(1, null),
                default: false
            },
        }
    });
    if (platform_2.isMacintosh) {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFileFolderCommand.ID,
            weight: 200 /* WorkbenchContrib */,
            primary: 2048 /* CtrlCmd */ | 45 /* KEY_O */,
            when: simpleFileDialog_1.RemoteFileDialogContext,
            description: { description: simpleFileDialog_1.OpenLocalFileFolderCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFileFolderCommand.handler()
        });
    }
    else {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFileCommand.ID,
            weight: 200 /* WorkbenchContrib */,
            primary: 2048 /* CtrlCmd */ | 45 /* KEY_O */,
            when: simpleFileDialog_1.RemoteFileDialogContext,
            description: { description: simpleFileDialog_1.OpenLocalFileCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFileCommand.handler()
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: simpleFileDialog_1.OpenLocalFolderCommand.ID,
            weight: 200 /* WorkbenchContrib */,
            primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 45 /* KEY_O */),
            when: simpleFileDialog_1.RemoteFileDialogContext,
            description: { description: simpleFileDialog_1.OpenLocalFolderCommand.LABEL, args: [] },
            handler: simpleFileDialog_1.OpenLocalFolderCommand.handler()
        });
    }
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: simpleFileDialog_1.SaveLocalFileCommand.ID,
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 49 /* KEY_S */,
        when: simpleFileDialog_1.RemoteFileDialogContext,
        description: { description: simpleFileDialog_1.SaveLocalFileCommand.LABEL, args: [] },
        handler: simpleFileDialog_1.SaveLocalFileCommand.handler()
    });
});
//# sourceMappingURL=remote.contribution.js.map