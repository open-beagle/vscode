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
define(["require", "exports", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/log/common/log", "vs/base/common/event", "vs/workbench/services/history/common/history", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/base/common/network", "vs/platform/remote/common/remoteHosts", "vs/workbench/services/environment/common/environmentService", "vs/platform/product/common/productService", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/lifecycle", "vs/base/common/types", "vs/workbench/contrib/terminal/browser/environmentVariableInfo", "vs/workbench/services/path/common/pathService", "vs/workbench/contrib/terminal/common/environmentVariable", "vs/platform/terminal/common/terminal", "vs/platform/terminal/common/terminalRecorder", "vs/nls!vs/workbench/contrib/terminal/browser/terminalProcessManager", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/base/common/platform", "vs/platform/configuration/common/configuration"], function (require, exports, terminalEnvironment, terminal_1, log_1, event_1, history_1, instantiation_1, workspace_1, configurationResolver_1, network_1, remoteHosts_1, environmentService_1, productService_1, terminal_2, remoteAgentService_1, lifecycle_1, types_1, environmentVariableInfo_1, pathService_1, environmentVariable_1, terminal_3, terminalRecorder_1, nls_1, terminalStrings_1, platform_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProcessManager = void 0;
    /** The amount of time to consider terminal errors to be related to the launch */
    const LAUNCHING_DURATION = 500;
    /**
     * The minimum amount of time between latency requests.
     */
    const LATENCY_MEASURING_INTERVAL = 1000;
    var ProcessType;
    (function (ProcessType) {
        ProcessType[ProcessType["Process"] = 0] = "Process";
        ProcessType[ProcessType["PsuedoTerminal"] = 1] = "PsuedoTerminal";
    })(ProcessType || (ProcessType = {}));
    /**
     * Holds all state related to the creation and management of terminal processes.
     *
     * Internal definitions:
     * - Process: The process launched with the terminalProcess.ts file, or the pty as a whole
     * - Pty Process: The pseudoterminal parent process (or the conpty/winpty agent process)
     * - Shell Process: The pseudoterminal child process (ie. the shell)
     */
    let TerminalProcessManager = class TerminalProcessManager extends lifecycle_1.Disposable {
        constructor(_instanceId, _configHelper, _historyService, _instantiationService, _logService, _workspaceContextService, _configurationResolverService, _workbenchEnvironmentService, _productService, _terminalInstanceService, _remoteAgentService, _pathService, _environmentVariableService, _remoteTerminalService, _terminalProfileResolverService, _configurationService, localTerminalService) {
            super();
            this._instanceId = _instanceId;
            this._configHelper = _configHelper;
            this._historyService = _historyService;
            this._instantiationService = _instantiationService;
            this._logService = _logService;
            this._workspaceContextService = _workspaceContextService;
            this._configurationResolverService = _configurationResolverService;
            this._workbenchEnvironmentService = _workbenchEnvironmentService;
            this._productService = _productService;
            this._terminalInstanceService = _terminalInstanceService;
            this._remoteAgentService = _remoteAgentService;
            this._pathService = _pathService;
            this._environmentVariableService = _environmentVariableService;
            this._remoteTerminalService = _remoteTerminalService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._configurationService = _configurationService;
            this.processState = 0 /* UNINITIALIZED */;
            this.isDisconnected = false;
            this._isDisposed = false;
            this._process = null;
            this._processType = ProcessType.Process;
            this._preLaunchInputQueue = [];
            this._latency = -1;
            this._latencyLastMeasured = 0;
            this._hasWrittenData = false;
            this._ptyListenersAttached = false;
            this._dimensions = { cols: 0, rows: 0 };
            this._isScreenReaderModeEnabled = false;
            this._onPtyDisconnect = this._register(new event_1.Emitter());
            this._onPtyReconnect = this._register(new event_1.Emitter());
            this._onProcessReady = this._register(new event_1.Emitter());
            this._onBeforeProcessData = this._register(new event_1.Emitter());
            this._onProcessData = this._register(new event_1.Emitter());
            this._onProcessTitle = this._register(new event_1.Emitter());
            this._onProcessShellTypeChanged = this._register(new event_1.Emitter());
            this._onProcessExit = this._register(new event_1.Emitter());
            this._onProcessOverrideDimensions = this._register(new event_1.Emitter());
            this._onProcessOverrideShellLaunchConfig = this._register(new event_1.Emitter());
            this._onEnvironmentVariableInfoChange = this._register(new event_1.Emitter());
            this._localTerminalService = localTerminalService;
            this.ptyProcessReady = this._createPtyProcessReadyPromise();
            this.getLatency();
            this._ackDataBufferer = new AckDataBufferer(e => { var _a; return (_a = this._process) === null || _a === void 0 ? void 0 : _a.acknowledgeDataEvent(e); });
            this._dataFilter = this._instantiationService.createInstance(SeamlessRelaunchDataFilter);
            this._dataFilter.onProcessData(ev => {
                const data = (typeof ev === 'string' ? ev : ev.data);
                const trackCommit = (typeof ev === 'string' ? false : ev.trackCommit);
                const beforeProcessDataEvent = { data };
                this._onBeforeProcessData.fire(beforeProcessDataEvent);
                if (beforeProcessDataEvent.data && beforeProcessDataEvent.data.length > 0) {
                    this._onProcessData.fire({ data: beforeProcessDataEvent.data, trackCommit });
                }
            });
        }
        get onPtyDisconnect() { return this._onPtyDisconnect.event; }
        get onPtyReconnect() { return this._onPtyReconnect.event; }
        get onProcessReady() { return this._onProcessReady.event; }
        get onBeforeProcessData() { return this._onBeforeProcessData.event; }
        get onProcessData() { return this._onProcessData.event; }
        get onProcessTitle() { return this._onProcessTitle.event; }
        get onProcessShellTypeChanged() { return this._onProcessShellTypeChanged.event; }
        get onProcessExit() { return this._onProcessExit.event; }
        get onProcessOverrideDimensions() { return this._onProcessOverrideDimensions.event; }
        get onProcessResolvedShellLaunchConfig() { return this._onProcessOverrideShellLaunchConfig.event; }
        get onEnvironmentVariableInfoChanged() { return this._onEnvironmentVariableInfoChange.event; }
        get persistentProcessId() { var _a; return (_a = this._process) === null || _a === void 0 ? void 0 : _a.id; }
        get shouldPersist() { return this._process ? this._process.shouldPersist : false; }
        get hasWrittenData() { return this._hasWrittenData; }
        dispose(immediate = false) {
            this._isDisposed = true;
            if (this._process) {
                // If the process was still connected this dispose came from
                // within VS Code, not the process, so mark the process as
                // killed by the user.
                this.processState = 4 /* KILLED_BY_USER */;
                this._process.shutdown(immediate);
                this._process = null;
            }
            super.dispose();
        }
        _createPtyProcessReadyPromise() {
            return new Promise(c => {
                const listener = this.onProcessReady(() => {
                    this._logService.debug(`Terminal process ready (shellProcessId: ${this.shellProcessId})`);
                    listener.dispose();
                    c(undefined);
                });
            });
        }
        detachFromProcess() {
            var _a;
            if ((_a = this._process) === null || _a === void 0 ? void 0 : _a.detach) {
                this._process.detach();
            }
        }
        async createProcess(shellLaunchConfig, cols, rows, isScreenReaderModeEnabled, reset = true) {
            var _a;
            this._shellLaunchConfig = shellLaunchConfig;
            this._dimensions.cols = cols;
            this._dimensions.rows = rows;
            this._isScreenReaderModeEnabled = isScreenReaderModeEnabled;
            let newProcess;
            if (shellLaunchConfig.customPtyImplementation) {
                this._processType = ProcessType.PsuedoTerminal;
                newProcess = shellLaunchConfig.customPtyImplementation(this._instanceId, cols, rows);
            }
            else {
                if (shellLaunchConfig.cwd && typeof shellLaunchConfig.cwd === 'object') {
                    this.remoteAuthority = (0, remoteHosts_1.getRemoteAuthority)(shellLaunchConfig.cwd);
                }
                else {
                    this.remoteAuthority = this._workbenchEnvironmentService.remoteAuthority;
                }
                const hasRemoteAuthority = !!this.remoteAuthority;
                // Create variable resolver
                const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot();
                const lastActiveWorkspace = activeWorkspaceRootUri ? (0, types_1.withNullAsUndefined)(this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
                const variableResolver = terminalEnvironment.createVariableResolver(lastActiveWorkspace, await this._terminalProfileResolverService.getShellEnvironment(this.remoteAuthority), this._configurationResolverService);
                // resolvedUserHome is needed here as remote resolvers can launch local terminals before
                // they're connected to the remote.
                this.userHome = (_a = this._pathService.resolvedUserHome) === null || _a === void 0 ? void 0 : _a.fsPath;
                this.os = platform_1.OS;
                if (hasRemoteAuthority) {
                    const userHomeUri = await this._pathService.userHome();
                    this.userHome = userHomeUri.path;
                    const remoteEnv = await this._remoteAgentService.getEnvironment();
                    if (!remoteEnv) {
                        throw new Error(`Failed to get remote environment for remote authority "${this.remoteAuthority}"`);
                    }
                    this.userHome = remoteEnv.userHome.path;
                    this.os = remoteEnv.os;
                    // this is a copy of what the merged environment collection is on the remote side
                    await this._setupEnvVariableInfo(variableResolver, shellLaunchConfig);
                    const shouldPersist = !shellLaunchConfig.isFeatureTerminal && this._configHelper.config.enablePersistentSessions;
                    if (shellLaunchConfig.attachPersistentProcess) {
                        const result = await this._remoteTerminalService.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
                        if (result) {
                            newProcess = result;
                        }
                        else {
                            this._logService.trace(`Attach to process failed for terminal ${shellLaunchConfig.attachPersistentProcess}`);
                            return undefined;
                        }
                    }
                    else {
                        await this._terminalProfileResolverService.resolveShellLaunchConfig(shellLaunchConfig, {
                            remoteAuthority: this.remoteAuthority,
                            os: this.os
                        });
                        const terminalConfig = this._configurationService.getValue(terminal_1.TERMINAL_CONFIG_SECTION);
                        const configuration = {
                            'terminal.integrated.automationShell.windows': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.automationShell.windows'),
                            'terminal.integrated.automationShell.osx': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.automationShell.osx'),
                            'terminal.integrated.automationShell.linux': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.automationShell.linux'),
                            'terminal.integrated.shell.windows': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.shell.windows'),
                            'terminal.integrated.shell.osx': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.shell.osx'),
                            'terminal.integrated.shell.linux': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.shell.linux'),
                            'terminal.integrated.shellArgs.windows': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.shellArgs.windows'),
                            'terminal.integrated.shellArgs.osx': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.shellArgs.osx'),
                            'terminal.integrated.shellArgs.linux': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.shellArgs.linux'),
                            'terminal.integrated.env.windows': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.env.windows'),
                            'terminal.integrated.env.osx': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.env.osx'),
                            'terminal.integrated.env.linux': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.env.linux'),
                            'terminal.integrated.inheritEnv': terminalConfig.inheritEnv,
                            'terminal.integrated.cwd': this._terminalProfileResolverService.getSafeConfigValueFullKey('terminal.integrated.cwd'),
                            'terminal.integrated.detectLocale': terminalConfig.detectLocale
                        };
                        newProcess = await this._remoteTerminalService.createProcess(shellLaunchConfig, configuration, activeWorkspaceRootUri, cols, rows, shouldPersist, this._configHelper);
                    }
                    if (!this._isDisposed) {
                        this._setupPtyHostListeners(this._remoteTerminalService);
                    }
                }
                else {
                    if (!this._localTerminalService) {
                        this._logService.trace(`Tried to launch a local terminal which is not supported in this window`);
                        return undefined;
                    }
                    if (shellLaunchConfig.attachPersistentProcess) {
                        const result = await this._localTerminalService.attachToProcess(shellLaunchConfig.attachPersistentProcess.id);
                        if (result) {
                            newProcess = result;
                        }
                        else {
                            this._logService.trace(`Attach to process failed for terminal ${shellLaunchConfig.attachPersistentProcess}`);
                            return undefined;
                        }
                    }
                    else {
                        newProcess = await this._launchLocalProcess(this._localTerminalService, shellLaunchConfig, cols, rows, this.userHome, isScreenReaderModeEnabled, variableResolver);
                    }
                    if (!this._isDisposed) {
                        this._setupPtyHostListeners(this._localTerminalService);
                    }
                }
            }
            // If the process was disposed during its creation, shut it down and return failure
            if (this._isDisposed) {
                newProcess.shutdown(false);
                return undefined;
            }
            this._process = newProcess;
            this.processState = 1 /* LAUNCHING */;
            this._dataFilter.newProcess(this._process, reset);
            if (this._processListeners) {
                (0, lifecycle_1.dispose)(this._processListeners);
            }
            this._processListeners = [
                newProcess.onProcessReady((e) => {
                    this.shellProcessId = e.pid;
                    this._initialCwd = e.cwd;
                    this._onProcessReady.fire();
                    if (this._preLaunchInputQueue.length > 0 && this._process) {
                        // Send any queued data that's waiting
                        newProcess.input(this._preLaunchInputQueue.join(''));
                        this._preLaunchInputQueue.length = 0;
                    }
                }),
                newProcess.onProcessTitleChanged(title => this._onProcessTitle.fire(title)),
                newProcess.onProcessShellTypeChanged(type => this._onProcessShellTypeChanged.fire(type)),
                newProcess.onProcessExit(exitCode => this._onExit(exitCode))
            ];
            if (newProcess.onProcessOverrideDimensions) {
                this._processListeners.push(newProcess.onProcessOverrideDimensions(e => this._onProcessOverrideDimensions.fire(e)));
            }
            if (newProcess.onProcessResolvedShellLaunchConfig) {
                this._processListeners.push(newProcess.onProcessResolvedShellLaunchConfig(e => this._onProcessOverrideShellLaunchConfig.fire(e)));
            }
            setTimeout(() => {
                if (this.processState === 1 /* LAUNCHING */) {
                    this.processState = 2 /* RUNNING */;
                }
            }, LAUNCHING_DURATION);
            const result = await newProcess.start();
            if (result) {
                // Error
                return result;
            }
            return undefined;
        }
        async relaunch(shellLaunchConfig, cols, rows, isScreenReaderModeEnabled, reset) {
            this.ptyProcessReady = this._createPtyProcessReadyPromise();
            this._logService.trace(`Relaunching terminal instance ${this._instanceId}`);
            // Fire reconnect if needed to ensure the terminal is usable again
            if (this.isDisconnected) {
                this.isDisconnected = false;
                this._onPtyReconnect.fire();
            }
            // Clear data written flag to re-enable seamless relaunch if this relaunch was manually
            // triggered
            this._hasWrittenData = false;
            return this.createProcess(shellLaunchConfig, cols, rows, isScreenReaderModeEnabled, reset);
        }
        // Fetch any extension environment additions and apply them
        async _setupEnvVariableInfo(variableResolver, shellLaunchConfig) {
            // const platformKey = isWindows ? 'windows' : (isMacintosh ? 'osx' : 'linux');
            // this._configurationService.getValue<ITerminalEnvironment | undefined>(`terminal.integrated.env.${platformKey}`);
            const envFromConfigValue = this._terminalProfileResolverService.getSafeConfigValue('env', platform_1.OS);
            this._configHelper.showRecommendations(shellLaunchConfig);
            const baseEnv = await (this._configHelper.config.inheritEnv
                ? this._terminalProfileResolverService.getShellEnvironment(this.remoteAuthority)
                : this._terminalInstanceService.getMainProcessParentEnv());
            const env = terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, envFromConfigValue, variableResolver, this._productService.version, this._configHelper.config.detectLocale, baseEnv);
            if (!shellLaunchConfig.strictEnv && !shellLaunchConfig.hideFromUser) {
                this._extEnvironmentVariableCollection = this._environmentVariableService.mergedCollection;
                this._register(this._environmentVariableService.onDidChangeCollections(newCollection => this._onEnvironmentVariableCollectionChange(newCollection)));
                // For remote terminals, this is a copy of the mergedEnvironmentCollection created on
                // the remote side. Since the environment collection is synced between the remote and
                // local sides immediately this is a fairly safe way of enabling the env var diffing and
                // info widget. While technically these could differ due to the slight change of a race
                // condition, the chance is minimal plus the impact on the user is also not that great
                // if it happens - it's not worth adding plumbing to sync back the resolved collection.
                this._extEnvironmentVariableCollection.applyToProcessEnvironment(env, variableResolver);
                if (this._extEnvironmentVariableCollection.map.size > 0) {
                    this.environmentVariableInfo = new environmentVariableInfo_1.EnvironmentVariableInfoChangesActive(this._extEnvironmentVariableCollection);
                    this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
                }
            }
            return env;
        }
        async _launchLocalProcess(localTerminalService, shellLaunchConfig, cols, rows, userHome, isScreenReaderModeEnabled, variableResolver) {
            await this._terminalProfileResolverService.resolveShellLaunchConfig(shellLaunchConfig, {
                remoteAuthority: undefined,
                os: platform_1.OS
            });
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            const initialCwd = terminalEnvironment.getCwd(shellLaunchConfig, userHome, variableResolver, activeWorkspaceRootUri, this._configHelper.config.cwd, this._logService);
            const env = await this._setupEnvVariableInfo(variableResolver, shellLaunchConfig);
            const useConpty = this._configHelper.config.windowsEnableConpty && !isScreenReaderModeEnabled;
            const shouldPersist = this._configHelper.config.enablePersistentSessions && !shellLaunchConfig.isFeatureTerminal;
            return await localTerminalService.createProcess(shellLaunchConfig, initialCwd, cols, rows, env, useConpty, shouldPersist);
        }
        _setupPtyHostListeners(offProcessTerminalService) {
            if (this._ptyListenersAttached) {
                return;
            }
            this._ptyListenersAttached = true;
            // Mark the process as disconnected is the pty host is unresponsive, the responsive event
            // will fire only when the pty host was already unresponsive
            this._register(offProcessTerminalService.onPtyHostUnresponsive(() => {
                this.isDisconnected = true;
                this._onPtyDisconnect.fire();
            }));
            this._ptyResponsiveListener = offProcessTerminalService.onPtyHostResponsive(() => {
                this.isDisconnected = false;
                this._onPtyReconnect.fire();
            });
            this._register((0, lifecycle_1.toDisposable)(() => { var _a; return (_a = this._ptyResponsiveListener) === null || _a === void 0 ? void 0 : _a.dispose(); }));
            // When the pty host restarts, reconnect is no longer possible so dispose the responsive
            // listener
            this._register(offProcessTerminalService.onPtyHostRestart(async () => {
                var _a;
                // When the pty host restarts, reconnect is no longer possible
                if (!this.isDisconnected) {
                    this.isDisconnected = true;
                    this._onPtyDisconnect.fire();
                }
                (_a = this._ptyResponsiveListener) === null || _a === void 0 ? void 0 : _a.dispose();
                this._ptyResponsiveListener = undefined;
                if (this._shellLaunchConfig) {
                    if (this._shellLaunchConfig.isFeatureTerminal) {
                        // Indicate the process is exited (and gone forever) only for feature terminals
                        // so they can react to the exit, this is particularly important for tasks so
                        // that it knows that the process is not still active. Note that this is not
                        // done for regular terminals because otherwise the terminal instance would be
                        // disposed.
                        this._onExit(-1);
                    }
                    else {
                        // For normal terminals write a message indicating what happened and relaunch
                        // using the previous shellLaunchConfig
                        let message = (0, nls_1.localize)(0, null);
                        this._onProcessData.fire({ data: (0, terminalStrings_1.formatMessageForTerminal)(message), trackCommit: false });
                        await this.relaunch(this._shellLaunchConfig, this._dimensions.cols, this._dimensions.rows, this._isScreenReaderModeEnabled, false);
                    }
                }
            }));
        }
        setDimensions(cols, rows, sync) {
            if (sync) {
                this._resize(cols, rows);
                return;
            }
            return this.ptyProcessReady.then(() => this._resize(cols, rows));
        }
        _resize(cols, rows) {
            if (!this._process) {
                return;
            }
            // The child process could already be terminated
            try {
                this._process.resize(cols, rows);
            }
            catch (error) {
                // We tried to write to a closed pipe / channel.
                if (error.code !== 'EPIPE' && error.code !== 'ERR_IPC_CHANNEL_CLOSED') {
                    throw (error);
                }
            }
            this._dimensions.cols = cols;
            this._dimensions.rows = rows;
        }
        async write(data) {
            await this.ptyProcessReady;
            this._dataFilter.disableSeamlessRelaunch();
            this._hasWrittenData = true;
            if (this.shellProcessId || this._processType === ProcessType.PsuedoTerminal) {
                if (this._process) {
                    // Send data if the pty is ready
                    this._process.input(data);
                }
            }
            else {
                // If the pty is not ready, queue the data received to send later
                this._preLaunchInputQueue.push(data);
            }
        }
        async processBinary(data) {
            var _a;
            await this.ptyProcessReady;
            this._dataFilter.disableSeamlessRelaunch();
            this._hasWrittenData = true;
            (_a = this._process) === null || _a === void 0 ? void 0 : _a.processBinary(data);
        }
        getInitialCwd() {
            return Promise.resolve(this._initialCwd ? this._initialCwd : '');
        }
        getCwd() {
            if (!this._process) {
                return Promise.resolve('');
            }
            return this._process.getCwd();
        }
        async getLatency() {
            await this.ptyProcessReady;
            if (!this._process) {
                return Promise.resolve(0);
            }
            if (this._latencyLastMeasured === 0 || this._latencyLastMeasured + LATENCY_MEASURING_INTERVAL < Date.now()) {
                const latencyRequest = this._process.getLatency();
                this._latency = await latencyRequest;
                this._latencyLastMeasured = Date.now();
            }
            return Promise.resolve(this._latency);
        }
        acknowledgeDataEvent(charCount) {
            this._ackDataBufferer.ack(charCount);
        }
        _onExit(exitCode) {
            this._process = null;
            // If the process is marked as launching then mark the process as killed
            // during launch. This typically means that there is a problem with the
            // shell and args.
            if (this.processState === 1 /* LAUNCHING */) {
                this.processState = 3 /* KILLED_DURING_LAUNCH */;
            }
            // If TerminalInstance did not know about the process exit then it was
            // triggered by the process, not on VS Code's side.
            if (this.processState === 2 /* RUNNING */) {
                this.processState = 5 /* KILLED_BY_PROCESS */;
            }
            this._onProcessExit.fire(exitCode);
        }
        _onEnvironmentVariableCollectionChange(newCollection) {
            const diff = this._extEnvironmentVariableCollection.diff(newCollection);
            if (diff === undefined) {
                return;
            }
            this.environmentVariableInfo = this._instantiationService.createInstance(environmentVariableInfo_1.EnvironmentVariableInfoStale, diff, this._instanceId);
            this._onEnvironmentVariableInfoChange.fire(this.environmentVariableInfo);
        }
    };
    TerminalProcessManager = __decorate([
        __param(2, history_1.IHistoryService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, log_1.ILogService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, configurationResolver_1.IConfigurationResolverService),
        __param(7, environmentService_1.IWorkbenchEnvironmentService),
        __param(8, productService_1.IProductService),
        __param(9, terminal_2.ITerminalInstanceService),
        __param(10, remoteAgentService_1.IRemoteAgentService),
        __param(11, pathService_1.IPathService),
        __param(12, environmentVariable_1.IEnvironmentVariableService),
        __param(13, terminal_2.IRemoteTerminalService),
        __param(14, terminal_1.ITerminalProfileResolverService),
        __param(15, configuration_1.IConfigurationService),
        __param(16, (0, instantiation_1.optional)(terminal_3.ILocalTerminalService))
    ], TerminalProcessManager);
    exports.TerminalProcessManager = TerminalProcessManager;
    class AckDataBufferer {
        constructor(_callback) {
            this._callback = _callback;
            this._unsentCharCount = 0;
        }
        ack(charCount) {
            this._unsentCharCount += charCount;
            while (this._unsentCharCount > 5000 /* CharCountAckSize */) {
                this._unsentCharCount -= 5000 /* CharCountAckSize */;
                this._callback(5000 /* CharCountAckSize */);
            }
        }
    }
    var SeamlessRelaunchConstants;
    (function (SeamlessRelaunchConstants) {
        /**
         * How long to record data events for new terminals.
         */
        SeamlessRelaunchConstants[SeamlessRelaunchConstants["RecordTerminalDuration"] = 10000] = "RecordTerminalDuration";
        /**
         * The maximum duration after a relaunch occurs to trigger a swap.
         */
        SeamlessRelaunchConstants[SeamlessRelaunchConstants["SwapWaitMaximumDuration"] = 3000] = "SwapWaitMaximumDuration";
    })(SeamlessRelaunchConstants || (SeamlessRelaunchConstants = {}));
    /**
     * Filters data events from the process and supports seamlessly restarting swapping out the process
     * with another, delaying the swap in output in order to minimize flickering/clearing of the
     * terminal.
     */
    let SeamlessRelaunchDataFilter = class SeamlessRelaunchDataFilter extends lifecycle_1.Disposable {
        constructor(_logService) {
            super();
            this._logService = _logService;
            this._disableSeamlessRelaunch = false;
            this._onProcessData = this._register(new event_1.Emitter());
        }
        get onProcessData() { return this._onProcessData.event; }
        newProcess(process, reset) {
            var _a, _b, _c, _d, _e;
            // Stop listening to the old process and trigger delayed shutdown (for hang issue #71966)
            (_a = this._dataListener) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this._activeProcess) === null || _b === void 0 ? void 0 : _b.shutdown(false);
            this._activeProcess = process;
            // Start firing events immediately if:
            // - there's no recorder, which means it's a new terminal
            // - this is not a reset, so seamless relaunch isn't necessary
            // - seamless relaunch is disabled because the terminal has accepted input
            if (!this._firstRecorder || !reset || this._disableSeamlessRelaunch) {
                (_c = this._firstDisposable) === null || _c === void 0 ? void 0 : _c.dispose();
                [this._firstRecorder, this._firstDisposable] = this._createRecorder(process);
                if (this._disableSeamlessRelaunch && reset) {
                    this._onProcessData.fire('\x1bc');
                }
                this._dataListener = process.onProcessData(e => this._onProcessData.fire(e));
                this._disableSeamlessRelaunch = false;
                return;
            }
            // Trigger a swap if there was a recent relaunch
            if (this._secondRecorder) {
                this.triggerSwap();
            }
            this._swapTimeout = window.setTimeout(() => this.triggerSwap(), 3000 /* SwapWaitMaximumDuration */);
            // Pause all outgoing data events
            (_d = this._dataListener) === null || _d === void 0 ? void 0 : _d.dispose();
            (_e = this._firstDisposable) === null || _e === void 0 ? void 0 : _e.dispose();
            const recorder = this._createRecorder(process);
            [this._secondRecorder, this._secondDisposable] = recorder;
        }
        /**
         * Disables seamless relaunch for the active process
         */
        disableSeamlessRelaunch() {
            this._disableSeamlessRelaunch = true;
            this._stopRecording();
            this.triggerSwap();
        }
        /**
         * Trigger the swap of the processes if needed (eg. timeout, input)
         */
        triggerSwap() {
            var _a, _b, _c;
            // Clear the swap timeout if it exists
            if (this._swapTimeout) {
                window.clearTimeout(this._swapTimeout);
                this._swapTimeout = undefined;
            }
            // Do nothing if there's nothing being recorder
            if (!this._firstRecorder) {
                return;
            }
            // Clear the first recorder if no second process was attached before the swap trigger
            if (!this._secondRecorder) {
                this._firstRecorder = undefined;
                (_a = this._firstDisposable) === null || _a === void 0 ? void 0 : _a.dispose();
                return;
            }
            // Generate data for each recorder
            const firstData = this._getDataFromRecorder(this._firstRecorder);
            const secondData = this._getDataFromRecorder(this._secondRecorder);
            // Re-write the terminal if the data differs
            if (firstData === secondData) {
                this._logService.trace(`Seamless terminal relaunch - identical content`);
            }
            else {
                this._logService.trace(`Seamless terminal relaunch - resetting content`);
                // Fire full reset (RIS) followed by the new data so the update happens in the same frame
                this._onProcessData.fire({ data: `\x1bc${secondData}`, trackCommit: false });
            }
            // Set up the new data listener
            (_b = this._dataListener) === null || _b === void 0 ? void 0 : _b.dispose();
            this._dataListener = this._activeProcess.onProcessData(e => this._onProcessData.fire(e));
            // Replace first recorder with second
            this._firstRecorder = this._secondRecorder;
            (_c = this._firstDisposable) === null || _c === void 0 ? void 0 : _c.dispose();
            this._firstDisposable = this._secondDisposable;
            this._secondRecorder = undefined;
        }
        _stopRecording() {
            var _a, _b;
            // Continue recording if a swap is coming
            if (this._swapTimeout) {
                return;
            }
            // Stop recording
            this._firstRecorder = undefined;
            (_a = this._firstDisposable) === null || _a === void 0 ? void 0 : _a.dispose();
            this._secondRecorder = undefined;
            (_b = this._secondDisposable) === null || _b === void 0 ? void 0 : _b.dispose();
        }
        _createRecorder(process) {
            const recorder = new terminalRecorder_1.TerminalRecorder(0, 0);
            const disposable = process.onProcessData(e => recorder.recordData(typeof e === 'string' ? e : e.data));
            return [recorder, disposable];
        }
        _getDataFromRecorder(recorder) {
            return recorder.generateReplayEvent().events.filter(e => !!e.data).map(e => e.data).join('');
        }
    };
    SeamlessRelaunchDataFilter = __decorate([
        __param(0, log_1.ILogService)
    ], SeamlessRelaunchDataFilter);
});
//# sourceMappingURL=terminalProcessManager.js.map