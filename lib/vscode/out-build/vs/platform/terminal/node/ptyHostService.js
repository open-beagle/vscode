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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/base/parts/ipc/node/ipc.cp", "vs/base/common/network", "vs/base/parts/ipc/common/ipc", "vs/base/common/event", "vs/platform/log/common/logIpc", "vs/platform/telemetry/common/telemetry"], function (require, exports, lifecycle_1, log_1, terminal_1, ipc_cp_1, network_1, ipc_1, event_1, logIpc_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PtyHostService = void 0;
    var Constants;
    (function (Constants) {
        Constants[Constants["MaxRestarts"] = 5] = "MaxRestarts";
    })(Constants || (Constants = {}));
    /**
     * Tracks the last terminal ID from the pty host so we can give it to the new pty host if it's
     * restarted and avoid ID conflicts.
     */
    let lastPtyId = 0;
    /**
     * This service implements IPtyService by launching a pty host process, forwarding messages to and
     * from the pty host process and manages the connection.
     */
    let PtyHostService = class PtyHostService extends lifecycle_1.Disposable {
        constructor(_logService, _telemetryService) {
            super();
            this._logService = _logService;
            this._telemetryService = _telemetryService;
            this._restartCount = 0;
            this._isResponsive = true;
            this._isDisposed = false;
            this._onPtyHostExit = this._register(new event_1.Emitter());
            this.onPtyHostExit = this._onPtyHostExit.event;
            this._onPtyHostStart = this._register(new event_1.Emitter());
            this.onPtyHostStart = this._onPtyHostStart.event;
            this._onPtyHostUnresponsive = this._register(new event_1.Emitter());
            this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
            this._onPtyHostResponsive = this._register(new event_1.Emitter());
            this.onPtyHostResponsive = this._onPtyHostResponsive.event;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onProcessReplay = this._register(new event_1.Emitter());
            this.onProcessReplay = this._onProcessReplay.event;
            this._onProcessTitleChanged = this._register(new event_1.Emitter());
            this.onProcessTitleChanged = this._onProcessTitleChanged.event;
            this._onProcessShellTypeChanged = this._register(new event_1.Emitter());
            this.onProcessShellTypeChanged = this._onProcessShellTypeChanged.event;
            this._onProcessOverrideDimensions = this._register(new event_1.Emitter());
            this.onProcessOverrideDimensions = this._onProcessOverrideDimensions.event;
            this._onProcessResolvedShellLaunchConfig = this._register(new event_1.Emitter());
            this.onProcessResolvedShellLaunchConfig = this._onProcessResolvedShellLaunchConfig.event;
            this._onProcessOrphanQuestion = this._register(new event_1.Emitter());
            this.onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
            this._register((0, lifecycle_1.toDisposable)(() => this._disposePtyHost()));
            [this._client, this._proxy] = this._startPtyHost();
        }
        _startPtyHost() {
            const client = new ipc_cp_1.Client(network_1.FileAccess.asFileUri('bootstrap-fork', require).fsPath, {
                serverName: 'Pty Host',
                args: ['--type=ptyHost'],
                env: {
                    VSCODE_LAST_PTY_ID: lastPtyId,
                    VSCODE_AMD_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
                    VSCODE_PIPE_LOGGING: 'true',
                    VSCODE_VERBOSE_LOGGING: 'true' // transmit console logs from server to client
                }
            });
            this._onPtyHostStart.fire();
            // Setup heartbeat service and trigger a heartbeat immediately to reset the timeouts
            const heartbeatService = ipc_1.ProxyChannel.toService(client.getChannel(terminal_1.TerminalIpcChannels.Heartbeat));
            heartbeatService.onBeat(() => this._handleHeartbeat());
            this._handleHeartbeat();
            // Handle exit
            this._register(client.onDidProcessExit(e => {
                /* __GDPR__
                    "ptyHost/exit" : {}
                */
                this._telemetryService.publicLog('ptyHost/exit');
                this._onPtyHostExit.fire(e.code);
                if (!this._isDisposed) {
                    if (this._restartCount <= Constants.MaxRestarts) {
                        this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}`);
                        this._restartCount++;
                        this.restartPtyHost();
                    }
                    else {
                        this._logService.error(`ptyHost terminated unexpectedly with code ${e.code}, giving up`);
                    }
                }
            }));
            // Setup logging
            const logChannel = client.getChannel(terminal_1.TerminalIpcChannels.Log);
            this._register(this._logService.onDidChangeLogLevel(() => {
                logIpc_1.LogLevelChannelClient.setLevel(logChannel, this._logService.getLevel());
            }));
            // Create proxy and forward events
            const proxy = ipc_1.ProxyChannel.toService(client.getChannel(terminal_1.TerminalIpcChannels.PtyHost));
            this._register(proxy.onProcessData(e => this._onProcessData.fire(e)));
            this._register(proxy.onProcessExit(e => this._onProcessExit.fire(e)));
            this._register(proxy.onProcessReady(e => this._onProcessReady.fire(e)));
            this._register(proxy.onProcessTitleChanged(e => this._onProcessTitleChanged.fire(e)));
            this._register(proxy.onProcessShellTypeChanged(e => this._onProcessShellTypeChanged.fire(e)));
            this._register(proxy.onProcessOverrideDimensions(e => this._onProcessOverrideDimensions.fire(e)));
            this._register(proxy.onProcessResolvedShellLaunchConfig(e => this._onProcessResolvedShellLaunchConfig.fire(e)));
            this._register(proxy.onProcessReplay(e => this._onProcessReplay.fire(e)));
            this._register(proxy.onProcessOrphanQuestion(e => this._onProcessOrphanQuestion.fire(e)));
            return [client, proxy];
        }
        dispose() {
            this._isDisposed = true;
            super.dispose();
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, windowsEnableConpty, shouldPersist, workspaceId, workspaceName) {
            const timeout = setTimeout(() => this._handleUnresponsiveCreateProcess(), terminal_1.HeartbeatConstants.CreateProcessTimeout);
            const id = await this._proxy.createProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, windowsEnableConpty, shouldPersist, workspaceId, workspaceName);
            clearTimeout(timeout);
            lastPtyId = Math.max(lastPtyId, id);
            return id;
        }
        attachToProcess(id) {
            return this._proxy.attachToProcess(id);
        }
        detachFromProcess(id) {
            return this._proxy.detachFromProcess(id);
        }
        listProcesses() {
            return this._proxy.listProcesses();
        }
        reduceConnectionGraceTime() {
            return this._proxy.reduceConnectionGraceTime();
        }
        start(id) {
            return this._proxy.start(id);
        }
        shutdown(id, immediate) {
            return this._proxy.shutdown(id, immediate);
        }
        input(id, data) {
            return this._proxy.input(id, data);
        }
        processBinary(id, data) {
            return this._proxy.processBinary(id, data);
        }
        resize(id, cols, rows) {
            return this._proxy.resize(id, cols, rows);
        }
        acknowledgeDataEvent(id, charCount) {
            return this._proxy.acknowledgeDataEvent(id, charCount);
        }
        getInitialCwd(id) {
            return this._proxy.getInitialCwd(id);
        }
        getCwd(id) {
            return this._proxy.getCwd(id);
        }
        getLatency(id) {
            return this._proxy.getLatency(id);
        }
        orphanQuestionReply(id) {
            return this._proxy.orphanQuestionReply(id);
        }
        getDefaultSystemShell(osOverride) {
            return this._proxy.getDefaultSystemShell(osOverride);
        }
        getShellEnvironment() {
            return this._proxy.getShellEnvironment();
        }
        setTerminalLayoutInfo(args) {
            return this._proxy.setTerminalLayoutInfo(args);
        }
        async getTerminalLayoutInfo(args) {
            return await this._proxy.getTerminalLayoutInfo(args);
        }
        async restartPtyHost() {
            /* __GDPR__
                "ptyHost/restart" : {}
            */
            this._telemetryService.publicLog('ptyHost/restart');
            this._isResponsive = true;
            this._disposePtyHost();
            [this._client, this._proxy] = this._startPtyHost();
        }
        _disposePtyHost() {
            if (this._proxy.shutdownAll) {
                this._proxy.shutdownAll();
            }
            this._client.dispose();
        }
        _handleHeartbeat() {
            this._clearHeartbeatTimeouts();
            this._heartbeatFirstTimeout = setTimeout(() => this._handleHeartbeatFirstTimeout(), terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier);
            if (!this._isResponsive) {
                /* __GDPR__
                    "ptyHost/responsive" : {}
                */
                this._telemetryService.publicLog('ptyHost/responsive');
                this._isResponsive = true;
            }
            this._onPtyHostResponsive.fire();
        }
        _handleHeartbeatFirstTimeout() {
            this._logService.warn(`No ptyHost heartbeat after ${terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier / 1000} seconds`);
            this._heartbeatFirstTimeout = undefined;
            this._heartbeatSecondTimeout = setTimeout(() => this._handleHeartbeatSecondTimeout(), terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.SecondWaitMultiplier);
        }
        _handleHeartbeatSecondTimeout() {
            this._logService.error(`No ptyHost heartbeat after ${(terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier + terminal_1.HeartbeatConstants.BeatInterval * terminal_1.HeartbeatConstants.FirstWaitMultiplier) / 1000} seconds`);
            this._heartbeatSecondTimeout = undefined;
            if (this._isResponsive) {
                /* __GDPR__
                    "ptyHost/responsive" : {}
                */
                this._telemetryService.publicLog('ptyHost/unresponsive');
                this._isResponsive = false;
            }
            this._onPtyHostUnresponsive.fire();
        }
        _handleUnresponsiveCreateProcess() {
            this._clearHeartbeatTimeouts();
            this._logService.error(`No ptyHost response to createProcess after ${terminal_1.HeartbeatConstants.CreateProcessTimeout / 1000} seconds`);
            /* __GDPR__
                "ptyHost/responsive" : {}
            */
            this._telemetryService.publicLog('ptyHost/responsive');
            this._onPtyHostUnresponsive.fire();
        }
        _clearHeartbeatTimeouts() {
            if (this._heartbeatFirstTimeout) {
                clearTimeout(this._heartbeatFirstTimeout);
                this._heartbeatFirstTimeout = undefined;
            }
            if (this._heartbeatSecondTimeout) {
                clearTimeout(this._heartbeatSecondTimeout);
                this._heartbeatSecondTimeout = undefined;
            }
        }
    };
    PtyHostService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, telemetry_1.ITelemetryService)
    ], PtyHostService);
    exports.PtyHostService = PtyHostService;
});
//# sourceMappingURL=ptyHostService.js.map