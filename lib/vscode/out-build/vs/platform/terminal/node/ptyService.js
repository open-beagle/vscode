/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/async", "vs/base/common/event", "vs/platform/terminal/common/terminalRecorder", "vs/platform/terminal/node/terminalProcess", "vs/platform/terminal/common/terminalDataBuffering", "vs/base/node/shell"], function (require, exports, lifecycle_1, platform_1, async_1, event_1, terminalRecorder_1, terminalProcess_1, terminalDataBuffering_1, shell_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PersistentTerminalProcess = exports.PtyService = void 0;
    class PtyService extends lifecycle_1.Disposable {
        constructor(_lastPtyId, _logService) {
            super();
            this._lastPtyId = _lastPtyId;
            this._logService = _logService;
            this._ptys = new Map();
            this._workspaceLayoutInfos = new Map();
            this._onHeartbeat = this._register(new event_1.Emitter());
            this.onHeartbeat = this._onHeartbeat.event;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessReplay = this._register(new event_1.Emitter());
            this.onProcessReplay = this._onProcessReplay.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
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
            this._register((0, lifecycle_1.toDisposable)(() => {
                for (const pty of this._ptys.values()) {
                    pty.shutdown(true);
                }
                this._ptys.clear();
            }));
        }
        async shutdownAll() {
            this.dispose();
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, windowsEnableConpty, shouldPersist, workspaceId, workspaceName) {
            if (shellLaunchConfig.attachPersistentProcess) {
                throw new Error('Attempt to create a process when attach object was provided');
            }
            const id = ++this._lastPtyId;
            const process = new terminalProcess_1.TerminalProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, windowsEnableConpty, this._logService);
            process.onProcessData(event => this._onProcessData.fire({ id, event }));
            process.onProcessExit(event => this._onProcessExit.fire({ id, event }));
            if (process.onProcessOverrideDimensions) {
                process.onProcessOverrideDimensions(event => this._onProcessOverrideDimensions.fire({ id, event }));
            }
            if (process.onProcessResolvedShellLaunchConfig) {
                process.onProcessResolvedShellLaunchConfig(event => this._onProcessResolvedShellLaunchConfig.fire({ id, event }));
            }
            const persistentProcess = new PersistentTerminalProcess(id, process, workspaceId, workspaceName, shouldPersist, cols, rows, this._logService, shellLaunchConfig.icon);
            process.onProcessExit(() => {
                persistentProcess.dispose();
                this._ptys.delete(id);
            });
            persistentProcess.onProcessReplay(event => this._onProcessReplay.fire({ id, event }));
            persistentProcess.onProcessReady(event => this._onProcessReady.fire({ id, event }));
            persistentProcess.onProcessTitleChanged(event => this._onProcessTitleChanged.fire({ id, event }));
            persistentProcess.onProcessShellTypeChanged(event => this._onProcessShellTypeChanged.fire({ id, event }));
            persistentProcess.onProcessOrphanQuestion(() => this._onProcessOrphanQuestion.fire({ id }));
            this._ptys.set(id, persistentProcess);
            return id;
        }
        async attachToProcess(id) {
            try {
                this._throwIfNoPty(id).attach();
                this._logService.trace(`Persistent process reconnection "${id}"`);
            }
            catch (e) {
                this._logService.trace(`Persistent process reconnection "${id}" failed`, e.message);
            }
        }
        async detachFromProcess(id) {
            this._throwIfNoPty(id).detach();
        }
        async reduceConnectionGraceTime() {
            for (const pty of this._ptys.values()) {
                pty.reduceGraceTime();
            }
        }
        async listProcesses() {
            const persistentProcesses = Array.from(this._ptys.entries()).filter(([_, pty]) => pty.shouldPersistTerminal);
            this._logService.info(`Listing ${persistentProcesses.length} persistent terminals, ${this._ptys.size} total terminals`);
            const promises = persistentProcesses.map(async ([id, terminalProcessData]) => this._buildProcessDetails(id, terminalProcessData));
            const allTerminals = await Promise.all(promises);
            return allTerminals.filter(entry => entry.isOrphan);
        }
        async start(id) {
            return this._throwIfNoPty(id).start();
        }
        async shutdown(id, immediate) {
            var _a;
            // Don't throw if the pty is already shutdown
            return (_a = this._ptys.get(id)) === null || _a === void 0 ? void 0 : _a.shutdown(immediate);
        }
        async input(id, data) {
            return this._throwIfNoPty(id).input(data);
        }
        async processBinary(id, data) {
            return this._throwIfNoPty(id).writeBinary(data);
        }
        async resize(id, cols, rows) {
            return this._throwIfNoPty(id).resize(cols, rows);
        }
        async getInitialCwd(id) {
            return this._throwIfNoPty(id).getInitialCwd();
        }
        async getCwd(id) {
            return this._throwIfNoPty(id).getCwd();
        }
        async acknowledgeDataEvent(id, charCount) {
            return this._throwIfNoPty(id).acknowledgeDataEvent(charCount);
        }
        async getLatency(id) {
            return 0;
        }
        async orphanQuestionReply(id) {
            return this._throwIfNoPty(id).orphanQuestionReply();
        }
        async getDefaultSystemShell(osOverride = platform_1.OS) {
            return (0, shell_1.getSystemShell)(osOverride, process.env);
        }
        async getShellEnvironment() {
            return Object.assign({}, process.env);
        }
        async setTerminalLayoutInfo(args) {
            this._workspaceLayoutInfos.set(args.workspaceId, args);
        }
        async getTerminalLayoutInfo(args) {
            const layout = this._workspaceLayoutInfos.get(args.workspaceId);
            if (layout) {
                const expandedTabs = await Promise.all(layout.tabs.map(async (tab) => this._expandTerminalTab(tab)));
                const filtered = expandedTabs.filter(t => t.terminals.length > 0);
                return {
                    tabs: filtered
                };
            }
            return undefined;
        }
        async _expandTerminalTab(tab) {
            const expandedTerminals = (await Promise.all(tab.terminals.map(t => this._expandTerminalInstance(t))));
            const filtered = expandedTerminals.filter(term => term.terminal !== null);
            return {
                isActive: tab.isActive,
                activePersistentProcessId: tab.activePersistentProcessId,
                terminals: filtered
            };
        }
        async _expandTerminalInstance(t) {
            try {
                const persistentProcess = this._throwIfNoPty(t.terminal);
                const processDetails = persistentProcess && await this._buildProcessDetails(t.terminal, persistentProcess);
                return {
                    terminal: processDetails !== null && processDetails !== void 0 ? processDetails : null,
                    relativeSize: t.relativeSize
                };
            }
            catch (e) {
                this._logService.trace(`Couldn't get layout info, a terminal was probably disconnected`, e.message);
                // this will be filtered out and not reconnected
                return {
                    terminal: null,
                    relativeSize: t.relativeSize
                };
            }
        }
        async _buildProcessDetails(id, persistentProcess) {
            const [cwd, isOrphan] = await Promise.all([persistentProcess.getCwd(), persistentProcess.isOrphaned()]);
            return {
                id,
                title: persistentProcess.title,
                pid: persistentProcess.pid,
                workspaceId: persistentProcess.workspaceId,
                workspaceName: persistentProcess.workspaceName,
                cwd,
                isOrphan,
                icon: persistentProcess.icon
            };
        }
        _throwIfNoPty(id) {
            const pty = this._ptys.get(id);
            if (!pty) {
                throw new Error(`Could not find pty with id "${id}"`);
            }
            return pty;
        }
    }
    exports.PtyService = PtyService;
    class PersistentTerminalProcess extends lifecycle_1.Disposable {
        constructor(_persistentProcessId, _terminalProcess, workspaceId, workspaceName, shouldPersistTerminal, cols, rows, _logService, _icon) {
            super();
            this._persistentProcessId = _persistentProcessId;
            this._terminalProcess = _terminalProcess;
            this.workspaceId = workspaceId;
            this.workspaceName = workspaceName;
            this.shouldPersistTerminal = shouldPersistTerminal;
            this._logService = _logService;
            this._icon = _icon;
            this._pendingCommands = new Map();
            this._isStarted = false;
            this._orphanRequestQueue = new async_1.Queue();
            this._onProcessReplay = this._register(new event_1.Emitter());
            this.onProcessReplay = this._onProcessReplay.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this.onProcessReady = this._onProcessReady.event;
            this._onProcessTitleChanged = this._register(new event_1.Emitter());
            this.onProcessTitleChanged = this._onProcessTitleChanged.event;
            this._onProcessShellTypeChanged = this._register(new event_1.Emitter());
            this.onProcessShellTypeChanged = this._onProcessShellTypeChanged.event;
            this._onProcessOverrideDimensions = this._register(new event_1.Emitter());
            this.onProcessOverrideDimensions = this._onProcessOverrideDimensions.event;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessOrphanQuestion = this._register(new event_1.Emitter());
            this.onProcessOrphanQuestion = this._onProcessOrphanQuestion.event;
            this._inReplay = false;
            this._pid = -1;
            this._cwd = '';
            this._recorder = new terminalRecorder_1.TerminalRecorder(cols, rows);
            this._orphanQuestionBarrier = null;
            this._orphanQuestionReplyTime = 0;
            this._disconnectRunner1 = this._register(new async_1.RunOnceScheduler(() => {
                this._logService.info(`Persistent process "${this._persistentProcessId}": The reconnection grace time of ${printTime(60000 /* ReconnectionGraceTime */)} has expired, shutting down pid "${this._pid}"`);
                this.shutdown(true);
            }, 60000 /* ReconnectionGraceTime */));
            this._disconnectRunner2 = this._register(new async_1.RunOnceScheduler(() => {
                this._logService.info(`Persistent process "${this._persistentProcessId}": The short reconnection grace time of ${printTime(6000 /* ReconnectionShortGraceTime */)} has expired, shutting down pid ${this._pid}`);
                this.shutdown(true);
            }, 6000 /* ReconnectionShortGraceTime */));
            this._register(this._terminalProcess.onProcessReady(e => {
                this._pid = e.pid;
                this._cwd = e.cwd;
                this._onProcessReady.fire(e);
            }));
            this._register(this._terminalProcess.onProcessTitleChanged(e => this._onProcessTitleChanged.fire(e)));
            this._register(this._terminalProcess.onProcessShellTypeChanged(e => this._onProcessShellTypeChanged.fire(e)));
            // Data buffering to reduce the amount of messages going to the renderer
            this._bufferer = new terminalDataBuffering_1.TerminalDataBufferer((_, data) => this._onProcessData.fire(data));
            this._register(this._bufferer.startBuffering(this._persistentProcessId, this._terminalProcess.onProcessData));
            this._register(this._terminalProcess.onProcessExit(() => this._bufferer.stopBuffering(this._persistentProcessId)));
            // Data recording for reconnect
            this._register(this.onProcessData(e => this._recorder.recordData(e)));
        }
        get pid() { return this._pid; }
        get title() { return this._terminalProcess.currentTitle; }
        get icon() { return this._icon; }
        attach() {
            this._disconnectRunner1.cancel();
        }
        async detach() {
            if (this.shouldPersistTerminal) {
                this._disconnectRunner1.schedule();
            }
            else {
                this.shutdown(true);
            }
        }
        async start() {
            if (!this._isStarted) {
                const result = await this._terminalProcess.start();
                if (result) {
                    // it's a terminal launch error
                    return result;
                }
                this._isStarted = true;
            }
            else {
                this._onProcessReady.fire({ pid: this._pid, cwd: this._cwd });
                this._onProcessTitleChanged.fire(this._terminalProcess.currentTitle);
                this._onProcessShellTypeChanged.fire(this._terminalProcess.shellType);
                this.triggerReplay();
            }
            return undefined;
        }
        shutdown(immediate) {
            return this._terminalProcess.shutdown(immediate);
        }
        input(data) {
            if (this._inReplay) {
                return;
            }
            return this._terminalProcess.input(data);
        }
        writeBinary(data) {
            return this._terminalProcess.processBinary(data);
        }
        resize(cols, rows) {
            if (this._inReplay) {
                return;
            }
            this._recorder.recordResize(cols, rows);
            // Buffered events should flush when a resize occurs
            this._bufferer.flushBuffer(this._persistentProcessId);
            return this._terminalProcess.resize(cols, rows);
        }
        acknowledgeDataEvent(charCount) {
            if (this._inReplay) {
                return;
            }
            return this._terminalProcess.acknowledgeDataEvent(charCount);
        }
        getInitialCwd() {
            return this._terminalProcess.getInitialCwd();
        }
        getCwd() {
            return this._terminalProcess.getCwd();
        }
        getLatency() {
            return this._terminalProcess.getLatency();
        }
        triggerReplay() {
            const ev = this._recorder.generateReplayEvent();
            let dataLength = 0;
            for (const e of ev.events) {
                dataLength += e.data.length;
            }
            this._logService.info(`Persistent process "${this._persistentProcessId}": Replaying ${dataLength} chars and ${ev.events.length} size events`);
            this._onProcessReplay.fire(ev);
            this._terminalProcess.clearUnacknowledgedChars();
        }
        sendCommandResult(reqId, isError, serializedPayload) {
            const data = this._pendingCommands.get(reqId);
            if (!data) {
                return;
            }
            this._pendingCommands.delete(reqId);
        }
        orphanQuestionReply() {
            this._orphanQuestionReplyTime = Date.now();
            if (this._orphanQuestionBarrier) {
                const barrier = this._orphanQuestionBarrier;
                this._orphanQuestionBarrier = null;
                barrier.open();
            }
        }
        reduceGraceTime() {
            if (this._disconnectRunner2.isScheduled()) {
                // we are disconnected and already running the short reconnection timer
                return;
            }
            if (this._disconnectRunner1.isScheduled()) {
                // we are disconnected and running the long reconnection timer
                this._disconnectRunner2.schedule();
            }
        }
        async isOrphaned() {
            return await this._orphanRequestQueue.queue(async () => this._isOrphaned());
        }
        async _isOrphaned() {
            // The process is already known to be orphaned
            if (this._disconnectRunner1.isScheduled() || this._disconnectRunner2.isScheduled()) {
                return true;
            }
            // Ask whether the renderer(s) whether the process is orphaned and await the reply
            if (!this._orphanQuestionBarrier) {
                // the barrier opens after 4 seconds with or without a reply
                this._orphanQuestionBarrier = new async_1.AutoOpenBarrier(4000);
                this._orphanQuestionReplyTime = 0;
                this._onProcessOrphanQuestion.fire();
            }
            await this._orphanQuestionBarrier.wait();
            return (Date.now() - this._orphanQuestionReplyTime > 500);
        }
    }
    exports.PersistentTerminalProcess = PersistentTerminalProcess;
    function printTime(ms) {
        let h = 0;
        let m = 0;
        let s = 0;
        if (ms >= 1000) {
            s = Math.floor(ms / 1000);
            ms -= s * 1000;
        }
        if (s >= 60) {
            m = Math.floor(s / 60);
            s -= m * 60;
        }
        if (m >= 60) {
            h = Math.floor(m / 60);
            m -= h * 60;
        }
        const _h = h ? `${h}h` : ``;
        const _m = m ? `${m}m` : ``;
        const _s = s ? `${s}s` : ``;
        const _ms = ms ? `${ms}ms` : ``;
        return `${_h}${_m}${_s}${_ms}`;
    }
});
//# sourceMappingURL=ptyService.js.map