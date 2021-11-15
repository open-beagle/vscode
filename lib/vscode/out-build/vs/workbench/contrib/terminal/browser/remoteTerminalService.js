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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/nls!vs/workbench/contrib/terminal/browser/remoteTerminalService", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/workbench/contrib/terminal/browser/remotePty", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/common/remoteTerminalChannel", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, event_1, lifecycle_1, marshalling_1, nls_1, commands_1, instantiation_1, log_1, notification_1, remotePty_1, terminal_1, remoteTerminalChannel_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteTerminalService = void 0;
    let RemoteTerminalService = class RemoteTerminalService extends lifecycle_1.Disposable {
        constructor(terminalInstanceService, _remoteAgentService, _logService, _instantiationService, _commandService, notificationService) {
            super();
            this.terminalInstanceService = terminalInstanceService;
            this._remoteAgentService = _remoteAgentService;
            this._logService = _logService;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._ptys = new Map();
            this._isPtyHostUnresponsive = false;
            this._onPtyHostUnresponsive = this._register(new event_1.Emitter());
            this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
            this._onPtyHostResponsive = this._register(new event_1.Emitter());
            this.onPtyHostResponsive = this._onPtyHostResponsive.event;
            this._onPtyHostRestart = this._register(new event_1.Emitter());
            this.onPtyHostRestart = this._onPtyHostRestart.event;
            const connection = this._remoteAgentService.getConnection();
            if (connection) {
                const channel = this._instantiationService.createInstance(remoteTerminalChannel_1.RemoteTerminalChannelClient, connection.remoteAuthority, connection.getChannel(remoteTerminalChannel_1.REMOTE_TERMINAL_CHANNEL_NAME));
                this._remoteTerminalChannel = channel;
                channel.onProcessData(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleData(e.event); });
                channel.onProcessExit(e => {
                    const pty = this._ptys.get(e.id);
                    if (pty) {
                        pty.handleExit(e.event);
                        this._ptys.delete(e.id);
                    }
                });
                channel.onProcessReady(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleReady(e.event); });
                channel.onProcessTitleChanged(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleTitleChanged(e.event); });
                channel.onProcessShellTypeChanged(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleShellTypeChanged(e.event); });
                channel.onProcessOverrideDimensions(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleOverrideDimensions(e.event); });
                channel.onProcessResolvedShellLaunchConfig(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleResolvedShellLaunchConfig(e.event); });
                channel.onProcessReplay(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleReplay(e.event); });
                channel.onProcessOrphanQuestion(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleOrphanQuestion(); });
                const allowedCommands = ['_remoteCLI.openExternal', '_remoteCLI.windowOpen', '_remoteCLI.getSystemStatus', '_remoteCLI.manageExtensions'];
                channel.onExecuteCommand(async (e) => {
                    const reqId = e.reqId;
                    const commandId = e.commandId;
                    if (!allowedCommands.includes(commandId)) {
                        channel.sendCommandResult(reqId, true, 'Invalid remote cli command: ' + commandId);
                        return;
                    }
                    const commandArgs = e.commandArgs.map(arg => (0, marshalling_1.revive)(arg));
                    try {
                        const result = await this._commandService.executeCommand(e.commandId, ...commandArgs);
                        channel.sendCommandResult(reqId, false, result);
                    }
                    catch (err) {
                        channel.sendCommandResult(reqId, true, err);
                    }
                });
                // Attach pty host listeners
                if (channel.onPtyHostExit) {
                    this._register(channel.onPtyHostExit(() => {
                        this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
                    }));
                }
                let unresponsiveNotification;
                if (channel.onPtyHostStart) {
                    this._register(channel.onPtyHostStart(() => {
                        this._logService.info(`ptyHost restarted`);
                        this._onPtyHostRestart.fire();
                        unresponsiveNotification === null || unresponsiveNotification === void 0 ? void 0 : unresponsiveNotification.close();
                        unresponsiveNotification = undefined;
                        this._isPtyHostUnresponsive = false;
                    }));
                }
                if (channel.onPtyHostUnresponsive) {
                    this._register(channel.onPtyHostUnresponsive(() => {
                        const choices = [{
                                label: (0, nls_1.localize)(0, null),
                                run: () => channel.restartPtyHost()
                            }];
                        unresponsiveNotification = notificationService.prompt(notification_1.Severity.Error, (0, nls_1.localize)(1, null), choices);
                        this._isPtyHostUnresponsive = true;
                        this._onPtyHostUnresponsive.fire();
                    }));
                }
                if (channel.onPtyHostResponsive) {
                    this._register(channel.onPtyHostResponsive(() => {
                        if (!this._isPtyHostUnresponsive) {
                            return;
                        }
                        this._logService.info('The pty host became responsive again');
                        unresponsiveNotification === null || unresponsiveNotification === void 0 ? void 0 : unresponsiveNotification.close();
                        unresponsiveNotification = undefined;
                        this._isPtyHostUnresponsive = false;
                        this._onPtyHostResponsive.fire();
                    }));
                }
            }
            else {
                this._remoteTerminalChannel = null;
            }
        }
        async createProcess(shellLaunchConfig, configuration, activeWorkspaceRootUri, cols, rows, shouldPersist, configHelper) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            // Fetch the environment to check shell permissions
            const remoteEnv = await this._remoteAgentService.getEnvironment();
            if (!remoteEnv) {
                // Extension host processes are only allowed in remote extension hosts currently
                throw new Error('Could not fetch remote environment');
            }
            const shellLaunchConfigDto = {
                name: shellLaunchConfig.name,
                executable: shellLaunchConfig.executable,
                args: shellLaunchConfig.args,
                cwd: shellLaunchConfig.cwd,
                env: shellLaunchConfig.env
            };
            const result = await this._remoteTerminalChannel.createProcess(shellLaunchConfigDto, configuration, activeWorkspaceRootUri, shouldPersist, cols, rows);
            const pty = new remotePty_1.RemotePty(result.persistentTerminalId, shouldPersist, this._remoteTerminalChannel, this._remoteAgentService, this._logService);
            this._ptys.set(result.persistentTerminalId, pty);
            return pty;
        }
        async attachToProcess(id) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot create remote terminal when there is no remote!`);
            }
            try {
                await this._remoteTerminalChannel.attachToProcess(id);
                const pty = new remotePty_1.RemotePty(id, true, this._remoteTerminalChannel, this._remoteAgentService, this._logService);
                this._ptys.set(id, pty);
                return pty;
            }
            catch (e) {
                this._logService.trace(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async listProcesses() {
            const terms = this._remoteTerminalChannel ? await this._remoteTerminalChannel.listProcesses() : [];
            return terms.map(termDto => {
                return {
                    id: termDto.id,
                    pid: termDto.pid,
                    title: termDto.title,
                    cwd: termDto.cwd,
                    workspaceId: termDto.workspaceId,
                    workspaceName: termDto.workspaceName,
                    icon: termDto.icon
                };
            });
        }
        async getDefaultSystemShell(osOverride) {
            var _a;
            return ((_a = this._remoteTerminalChannel) === null || _a === void 0 ? void 0 : _a.getDefaultSystemShell(osOverride)) || '';
        }
        async getShellEnvironment() {
            var _a;
            return ((_a = this._remoteTerminalChannel) === null || _a === void 0 ? void 0 : _a.getShellEnvironment()) || {};
        }
        setTerminalLayoutInfo(layout) {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot call setActiveInstanceId when there is no remote`);
            }
            return this._remoteTerminalChannel.setTerminalLayoutInfo(layout);
        }
        async reduceConnectionGraceTime() {
            if (!this._remoteTerminalChannel) {
                throw new Error('Cannot reduce grace time when there is no remote');
            }
            return this._remoteTerminalChannel.reduceConnectionGraceTime();
        }
        async getTerminalLayoutInfo() {
            if (!this._remoteTerminalChannel) {
                throw new Error(`Cannot call getActiveInstanceId when there is no remote`);
            }
            return this._remoteTerminalChannel.getTerminalLayoutInfo();
        }
    };
    RemoteTerminalService = __decorate([
        __param(0, terminal_1.ITerminalInstanceService),
        __param(1, remoteAgentService_1.IRemoteAgentService),
        __param(2, log_1.ILogService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, commands_1.ICommandService),
        __param(5, notification_1.INotificationService)
    ], RemoteTerminalService);
    exports.RemoteTerminalService = RemoteTerminalService;
});
//# sourceMappingURL=remoteTerminalService.js.map