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
define(["require", "exports", "vs/base/common/types", "vs/workbench/services/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/common/environmentVariableShared", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/base/common/network", "vs/platform/label/common/label", "vs/workbench/contrib/terminal/common/environmentVariable"], function (require, exports, types_1, configuration_1, log_1, remoteAuthorityResolver_1, workspace_1, environmentVariableShared_1, configurationResolver_1, editor_1, editorService_1, network_1, label_1, environmentVariable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTerminalChannelClient = exports.REMOTE_TERMINAL_CHANNEL_NAME = void 0;
    exports.REMOTE_TERMINAL_CHANNEL_NAME = 'remoteterminal';
    let RemoteTerminalChannelClient = class RemoteTerminalChannelClient {
        constructor(_remoteAuthority, _channel, _configurationService, _workspaceContextService, _resolverService, _environmentVariableService, _remoteAuthorityResolverService, _logService, _editorService, _labelService) {
            this._remoteAuthority = _remoteAuthority;
            this._channel = _channel;
            this._configurationService = _configurationService;
            this._workspaceContextService = _workspaceContextService;
            this._resolverService = _resolverService;
            this._environmentVariableService = _environmentVariableService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._logService = _logService;
            this._editorService = _editorService;
            this._labelService = _labelService;
        }
        get onPtyHostExit() {
            return this._channel.listen('$onPtyHostExitEvent');
        }
        get onPtyHostStart() {
            return this._channel.listen('$onPtyHostStartEvent');
        }
        get onPtyHostUnresponsive() {
            return this._channel.listen('$onPtyHostUnresponsiveEvent');
        }
        get onPtyHostResponsive() {
            return this._channel.listen('$onPtyHostResponsiveEvent');
        }
        get onProcessData() {
            return this._channel.listen('$onProcessDataEvent');
        }
        get onProcessExit() {
            return this._channel.listen('$onProcessExitEvent');
        }
        get onProcessReady() {
            return this._channel.listen('$onProcessReadyEvent');
        }
        get onProcessReplay() {
            return this._channel.listen('$onProcessReplayEvent');
        }
        get onProcessTitleChanged() {
            return this._channel.listen('$onProcessTitleChangedEvent');
        }
        get onProcessShellTypeChanged() {
            return this._channel.listen('$onProcessShellTypeChangedEvent');
        }
        get onProcessOverrideDimensions() {
            return this._channel.listen('$onProcessOverrideDimensionsEvent');
        }
        get onProcessResolvedShellLaunchConfig() {
            return this._channel.listen('$onProcessResolvedShellLaunchConfigEvent');
        }
        get onProcessOrphanQuestion() {
            return this._channel.listen('$onProcessOrphanQuestion');
        }
        get onExecuteCommand() {
            return this._channel.listen('$onExecuteCommand');
        }
        restartPtyHost() {
            return this._channel.call('$restartPtyHost', []);
        }
        async createProcess(shellLaunchConfig, configuration, activeWorkspaceRootUri, shouldPersistTerminal, cols, rows) {
            // Be sure to first wait for the remote configuration
            await this._configurationService.whenRemoteConfigurationLoaded();
            // We will use the resolver service to resolve all the variables in the config / launch config
            // But then we will keep only some variables, since the rest need to be resolved on the remote side
            const resolvedVariables = Object.create(null);
            const lastActiveWorkspace = activeWorkspaceRootUri ? (0, types_1.withNullAsUndefined)(this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
            let allResolvedVariables = undefined;
            try {
                allResolvedVariables = await this._resolverService.resolveWithInteraction(lastActiveWorkspace, {
                    shellLaunchConfig,
                    configuration
                });
            }
            catch (err) {
                this._logService.error(err);
            }
            if (allResolvedVariables) {
                for (const [name, value] of allResolvedVariables.entries()) {
                    if (/^config:/.test(name) || name === 'selectedText' || name === 'lineNumber') {
                        resolvedVariables[name] = value;
                    }
                }
            }
            const envVariableCollections = [];
            for (const [k, v] of this._environmentVariableService.collections.entries()) {
                envVariableCollections.push([k, (0, environmentVariableShared_1.serializeEnvironmentVariableCollection)(v.map)]);
            }
            const resolverResult = await this._remoteAuthorityResolverService.resolveAuthority(this._remoteAuthority);
            const resolverEnv = resolverResult.options && resolverResult.options.extensionHostEnv;
            const workspace = this._workspaceContextService.getWorkspace();
            const workspaceFolders = workspace.folders;
            const activeWorkspaceFolder = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) : null;
            const activeFileResource = editor_1.EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor, {
                supportSideBySide: editor_1.SideBySideEditor.PRIMARY,
                filterByScheme: [network_1.Schemas.file, network_1.Schemas.userData, network_1.Schemas.vscodeRemote]
            });
            const args = {
                configuration,
                resolvedVariables,
                envVariableCollections,
                shellLaunchConfig,
                workspaceId: workspace.id,
                workspaceName: this._labelService.getWorkspaceLabel(workspace),
                workspaceFolders,
                activeWorkspaceFolder,
                activeFileResource,
                shouldPersistTerminal,
                cols,
                rows,
                resolverEnv
            };
            return await this._channel.call('$createProcess', args);
        }
        attachToProcess(id) {
            return this._channel.call('$attachToProcess', [id]);
        }
        listProcesses() {
            return this._channel.call('$listProcesses');
        }
        reduceConnectionGraceTime() {
            return this._channel.call('$reduceConnectionGraceTime');
        }
        processBinary(id, data) {
            return this._channel.call('$processBinary', [id, data]);
        }
        start(id) {
            return this._channel.call('$start', [id]);
        }
        input(id, data) {
            return this._channel.call('$input', [id, data]);
        }
        acknowledgeDataEvent(id, charCount) {
            return this._channel.call('$acknowledgeDataEvent', [id, charCount]);
        }
        shutdown(id, immediate) {
            return this._channel.call('$shutdown', [id, immediate]);
        }
        resize(id, cols, rows) {
            return this._channel.call('$resize', [id, cols, rows]);
        }
        getInitialCwd(id) {
            return this._channel.call('$getInitialCwd', [id]);
        }
        getCwd(id) {
            return this._channel.call('$getCwd', [id]);
        }
        orphanQuestionReply(id) {
            return this._channel.call('$orphanQuestionReply', [id]);
        }
        sendCommandResult(reqId, isError, payload) {
            return this._channel.call('$sendCommandResult', [reqId, isError, payload]);
        }
        getDefaultSystemShell(osOverride) {
            return this._channel.call('$getDefaultSystemShell', [osOverride]);
        }
        getShellEnvironment() {
            return this._channel.call('$getShellEnvironment');
        }
        setTerminalLayoutInfo(layout) {
            const workspace = this._workspaceContextService.getWorkspace();
            const args = {
                workspaceId: workspace.id,
                tabs: layout.tabs
            };
            return this._channel.call('$setTerminalLayoutInfo', args);
        }
        getTerminalLayoutInfo() {
            const workspace = this._workspaceContextService.getWorkspace();
            const args = {
                workspaceId: workspace.id,
            };
            return this._channel.call('$getTerminalLayoutInfo', args);
        }
    };
    RemoteTerminalChannelClient = __decorate([
        __param(2, configuration_1.IWorkbenchConfigurationService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, configurationResolver_1.IConfigurationResolverService),
        __param(5, environmentVariable_1.IEnvironmentVariableService),
        __param(6, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(7, log_1.ILogService),
        __param(8, editorService_1.IEditorService),
        __param(9, label_1.ILabelService)
    ], RemoteTerminalChannelClient);
    exports.RemoteTerminalChannelClient = RemoteTerminalChannelClient;
});
//# sourceMappingURL=remoteTerminalChannel.js.map