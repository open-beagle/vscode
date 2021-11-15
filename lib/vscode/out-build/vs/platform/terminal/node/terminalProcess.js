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
define(["require", "exports", "vs/base/common/path", "fs", "os", "vs/base/common/event", "vs/base/common/lifecycle", "child_process", "vs/platform/log/common/log", "vs/platform/terminal/node/terminalEnvironment", "vs/base/common/uri", "vs/nls!vs/platform/terminal/node/terminalProcess", "vs/platform/terminal/node/windowsShellHelper", "vs/base/common/platform", "vs/base/common/async"], function (require, exports, path, fs, os, event_1, lifecycle_1, child_process_1, log_1, terminalEnvironment_1, uri_1, nls_1, windowsShellHelper_1, platform_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProcess = void 0;
    // Writing large amounts of data can be corrupted for some reason, after looking into this is
    // appears to be a race condition around writing to the FD which may be based on how powerful the
    // hardware is. The workaround for this is to space out when large amounts of data is being written
    // to the terminal. See https://github.com/microsoft/vscode/issues/38137
    const WRITE_MAX_CHUNK_SIZE = 50;
    const WRITE_INTERVAL_MS = 5;
    var ShutdownConstants;
    (function (ShutdownConstants) {
        /**
         * The amount of ms that must pass between data events after exit is queued before the actual
         * kill call is triggered. This data flush mechanism works around an [issue in node-pty][1]
         * where not all data is flushed which causes problems for task problem matchers. Additionally
         * on Windows under conpty, killing a process while data is being output will cause the [conhost
         * flush to hang the pty host][2] because [conhost should be hosted on another thread][3].
         *
         * [1]: https://github.com/Tyriar/node-pty/issues/72
         * [2]: https://github.com/microsoft/vscode/issues/71966
         * [3]: https://github.com/microsoft/node-pty/pull/415
         */
        ShutdownConstants[ShutdownConstants["DataFlushTimeout"] = 250] = "DataFlushTimeout";
        /**
         * The maximum ms to allow after dispose is called because forcefully killing the process.
         */
        ShutdownConstants[ShutdownConstants["MaximumShutdownTime"] = 5000] = "MaximumShutdownTime";
    })(ShutdownConstants || (ShutdownConstants = {}));
    var Constants;
    (function (Constants) {
        /**
         * The minimum duration between kill and spawn calls on Windows/conpty as a mitigation for a
         * hang issue. See:
         * - https://github.com/microsoft/vscode/issues/71966
         * - https://github.com/microsoft/vscode/issues/117956
         * - https://github.com/microsoft/vscode/issues/121336
         */
        Constants[Constants["KillSpawnThrottleInterval"] = 250] = "KillSpawnThrottleInterval";
        /**
         * The amount of time to wait when a call is throttles beyond the exact amount, this is used to
         * try prevent early timeouts causing a kill/spawn call to happen at double the regular
         * interval.
         */
        Constants[Constants["KillSpawnSpacingDuration"] = 50] = "KillSpawnSpacingDuration";
    })(Constants || (Constants = {}));
    let TerminalProcess = class TerminalProcess extends lifecycle_1.Disposable {
        constructor(_shellLaunchConfig, cwd, cols, rows, env, 
        /**
         * environment used for `findExecutable`
         */
        _executableEnv, windowsEnableConpty, _logService) {
            var _a;
            super();
            this._shellLaunchConfig = _shellLaunchConfig;
            this._executableEnv = _executableEnv;
            this._logService = _logService;
            this.id = 0;
            this.shouldPersist = false;
            this._currentTitle = '';
            this._isDisposed = false;
            this._titleInterval = null;
            this._writeQueue = [];
            this._isPtyPaused = false;
            this._unacknowledgedCharCount = 0;
            this._onProcessData = this._register(new event_1.Emitter());
            this._onProcessExit = this._register(new event_1.Emitter());
            this._onProcessReady = this._register(new event_1.Emitter());
            this._onProcessTitleChanged = this._register(new event_1.Emitter());
            this._onProcessShellTypeChanged = this._register(new event_1.Emitter());
            this.onProcessShellTypeChanged = this._onProcessShellTypeChanged.event;
            let name;
            if (platform_1.isWindows) {
                name = path.basename(this._shellLaunchConfig.executable || '');
            }
            else {
                // Using 'xterm-256color' here helps ensure that the majority of Linux distributions will use a
                // color prompt as defined in the default ~/.bashrc file.
                name = 'xterm-256color';
            }
            this._initialCwd = cwd;
            const useConpty = windowsEnableConpty && process.platform === 'win32' && (0, terminalEnvironment_1.getWindowsBuildNumber)() >= 18309;
            this._ptyOptions = {
                name,
                cwd,
                // TODO: When node-pty is updated this cast can be removed
                env: env,
                cols,
                rows,
                useConpty,
                // This option will force conpty to not redraw the whole viewport on launch
                conptyInheritCursor: useConpty && !!_shellLaunchConfig.initialText
            };
            // Delay resizes to avoid conpty not respecting very early resize calls
            if (platform_1.isWindows) {
                if (useConpty && cols === 0 && rows === 0 && ((_a = this._shellLaunchConfig.executable) === null || _a === void 0 ? void 0 : _a.endsWith('Git\\bin\\bash.exe'))) {
                    this._delayedResizer = new DelayedResizer();
                    this._register(this._delayedResizer.onTrigger(dimensions => {
                        var _a;
                        (_a = this._delayedResizer) === null || _a === void 0 ? void 0 : _a.dispose();
                        this._delayedResizer = undefined;
                        if (dimensions.cols && dimensions.rows) {
                            this.resize(dimensions.cols, dimensions.rows);
                        }
                    }));
                }
                // WindowsShellHelper is used to fetch the process title and shell type
                this.onProcessReady(e => {
                    this._windowsShellHelper = this._register(new windowsShellHelper_1.WindowsShellHelper(e.pid));
                    this._register(this._windowsShellHelper.onShellTypeChanged(e => this._onProcessShellTypeChanged.fire(e)));
                    this._register(this._windowsShellHelper.onShellNameChanged(e => this._onProcessTitleChanged.fire(e)));
                });
            }
        }
        get exitMessage() { return this._exitMessage; }
        get currentTitle() { var _a; return ((_a = this._windowsShellHelper) === null || _a === void 0 ? void 0 : _a.shellTitle) || this._currentTitle; }
        get shellType() { return this._windowsShellHelper ? this._windowsShellHelper.shellType : undefined; }
        get onProcessData() { return this._onProcessData.event; }
        get onProcessExit() { return this._onProcessExit.event; }
        get onProcessReady() { return this._onProcessReady.event; }
        get onProcessTitleChanged() { return this._onProcessTitleChanged.event; }
        async start() {
            const results = await Promise.all([this._validateCwd(), this._validateExecutable()]);
            const firstError = results.find(r => r !== undefined);
            if (firstError) {
                return firstError;
            }
            try {
                await this.setupPtyProcess(this._shellLaunchConfig, this._ptyOptions);
                return undefined;
            }
            catch (err) {
                this._logService.trace('IPty#spawn native exception', err);
                return { message: `A native exception occurred during launch (${err.message})` };
            }
        }
        async _validateCwd() {
            try {
                const result = await fs.promises.stat(this._initialCwd);
                if (!result.isDirectory()) {
                    return { message: (0, nls_1.localize)(0, null, this._initialCwd.toString()) };
                }
            }
            catch (err) {
                if ((err === null || err === void 0 ? void 0 : err.code) === 'ENOENT') {
                    return { message: (0, nls_1.localize)(1, null, this._initialCwd.toString()) };
                }
            }
            return undefined;
        }
        async _validateExecutable() {
            const slc = this._shellLaunchConfig;
            if (!slc.executable) {
                throw new Error('IShellLaunchConfig.executable not set');
            }
            try {
                const result = await fs.promises.stat(slc.executable);
                if (!result.isFile() && !result.isSymbolicLink()) {
                    return { message: (0, nls_1.localize)(2, null, slc.executable) };
                }
            }
            catch (err) {
                if ((err === null || err === void 0 ? void 0 : err.code) === 'ENOENT') {
                    // The executable isn't an absolute path, try find it on the PATH or CWD
                    let cwd = slc.cwd instanceof uri_1.URI ? slc.cwd.path : slc.cwd;
                    const envPaths = (slc.env && slc.env.PATH) ? slc.env.PATH.split(path.delimiter) : undefined;
                    const executable = await (0, terminalEnvironment_1.findExecutable)(slc.executable, cwd, envPaths, this._executableEnv);
                    if (!executable) {
                        return { message: (0, nls_1.localize)(3, null, slc.executable) };
                    }
                    // Set the executable explicitly here so that node-pty doesn't need to search the
                    // $PATH too.
                    slc.executable = executable;
                }
            }
            return undefined;
        }
        async setupPtyProcess(shellLaunchConfig, options) {
            const args = shellLaunchConfig.args || [];
            await this._throttleKillSpawn();
            this._logService.trace('IPty#spawn', shellLaunchConfig.executable, args, options);
            const ptyProcess = (await new Promise((resolve_1, reject_1) => { require(['node-pty'], resolve_1, reject_1); })).spawn(shellLaunchConfig.executable, args, options);
            this._ptyProcess = ptyProcess;
            this._processStartupComplete = new Promise(c => {
                this.onProcessReady(() => c());
            });
            ptyProcess.onData(data => {
                var _a;
                // Handle flow control
                this._unacknowledgedCharCount += data.length;
                if (!this._isPtyPaused && this._unacknowledgedCharCount > 100000 /* HighWatermarkChars */) {
                    this._logService.trace(`Flow control: Pause (${this._unacknowledgedCharCount} > ${100000 /* HighWatermarkChars */})`);
                    this._isPtyPaused = true;
                    ptyProcess.pause();
                }
                // Refire the data event
                this._onProcessData.fire(data);
                if (this._closeTimeout) {
                    this._queueProcessExit();
                }
                (_a = this._windowsShellHelper) === null || _a === void 0 ? void 0 : _a.checkShell();
            });
            ptyProcess.onExit(e => {
                this._exitCode = e.exitCode;
                this._queueProcessExit();
            });
            this._setupTitlePolling(ptyProcess);
            this._sendProcessId(ptyProcess.pid);
        }
        dispose() {
            this._isDisposed = true;
            if (this._titleInterval) {
                clearInterval(this._titleInterval);
            }
            this._titleInterval = null;
            super.dispose();
        }
        _setupTitlePolling(ptyProcess) {
            // Send initial timeout async to give event listeners a chance to init
            setTimeout(() => this._sendProcessTitle(ptyProcess), 0);
            // Setup polling for non-Windows, for Windows `process` doesn't change
            if (!platform_1.isWindows) {
                this._titleInterval = setInterval(() => {
                    if (this._currentTitle !== ptyProcess.process) {
                        this._sendProcessTitle(ptyProcess);
                    }
                }, 200);
            }
        }
        // Allow any trailing data events to be sent before the exit event is sent.
        // See https://github.com/Tyriar/node-pty/issues/72
        _queueProcessExit() {
            if (this._closeTimeout) {
                clearTimeout(this._closeTimeout);
            }
            this._closeTimeout = setTimeout(() => {
                this._closeTimeout = undefined;
                this._kill();
            }, 250 /* DataFlushTimeout */);
        }
        async _kill() {
            // Wait to kill to process until the start up code has run. This prevents us from firing a process exit before a
            // process start.
            await this._processStartupComplete;
            if (this._isDisposed) {
                return;
            }
            // Attempt to kill the pty, it may have already been killed at this
            // point but we want to make sure
            try {
                if (this._ptyProcess) {
                    await this._throttleKillSpawn();
                    this._logService.trace('IPty#kill');
                    this._ptyProcess.kill();
                }
            }
            catch (ex) {
                // Swallow, the pty has already been killed
            }
            this._onProcessExit.fire(this._exitCode || 0);
            this.dispose();
        }
        async _throttleKillSpawn() {
            // Only throttle on Windows/conpty
            if (!platform_1.isWindows || !('useConpty' in this._ptyOptions) || !this._ptyOptions.useConpty) {
                return;
            }
            // Use a loop to ensure multiple calls in a single interval space out
            while (Date.now() - TerminalProcess._lastKillOrStart < 250 /* KillSpawnThrottleInterval */) {
                this._logService.trace('Throttling kill/spawn call');
                await (0, async_1.timeout)(250 /* KillSpawnThrottleInterval */ - (Date.now() - TerminalProcess._lastKillOrStart) + 50 /* KillSpawnSpacingDuration */);
            }
            TerminalProcess._lastKillOrStart = Date.now();
        }
        _sendProcessId(pid) {
            this._onProcessReady.fire({ pid, cwd: this._initialCwd });
        }
        _sendProcessTitle(ptyProcess) {
            if (this._isDisposed) {
                return;
            }
            this._currentTitle = ptyProcess.process;
            this._onProcessTitleChanged.fire(this._currentTitle);
        }
        shutdown(immediate) {
            // don't force immediate disposal of the terminal processes on Windows as an additional
            // mitigation for https://github.com/microsoft/vscode/issues/71966 which causes the pty host
            // to become unresponsive, disconnecting all terminals across all windows.
            if (immediate && !platform_1.isWindows) {
                this._kill();
            }
            else {
                if (!this._closeTimeout && !this._isDisposed) {
                    this._queueProcessExit();
                    // Allow a maximum amount of time for the process to exit, otherwise force kill it
                    setTimeout(() => {
                        if (this._closeTimeout && !this._isDisposed) {
                            this._closeTimeout = undefined;
                            this._kill();
                        }
                    }, 5000 /* MaximumShutdownTime */);
                }
            }
        }
        input(data, isBinary) {
            if (this._isDisposed || !this._ptyProcess) {
                return;
            }
            for (let i = 0; i <= Math.floor(data.length / WRITE_MAX_CHUNK_SIZE); i++) {
                const obj = {
                    isBinary: isBinary || false,
                    data: data.substr(i * WRITE_MAX_CHUNK_SIZE, WRITE_MAX_CHUNK_SIZE)
                };
                this._writeQueue.push(obj);
            }
            this._startWrite();
        }
        async processBinary(data) {
            this.input(data, true);
        }
        _startWrite() {
            // Don't write if it's already queued of is there is nothing to write
            if (this._writeTimeout !== undefined || this._writeQueue.length === 0) {
                return;
            }
            this._doWrite();
            // Don't queue more writes if the queue is empty
            if (this._writeQueue.length === 0) {
                this._writeTimeout = undefined;
                return;
            }
            // Queue the next write
            this._writeTimeout = setTimeout(() => {
                this._writeTimeout = undefined;
                this._startWrite();
            }, WRITE_INTERVAL_MS);
        }
        _doWrite() {
            const object = this._writeQueue.shift();
            if (object.isBinary) {
                this._ptyProcess.write(Buffer.from(object.data, 'binary'));
            }
            else {
                this._ptyProcess.write(object.data);
            }
        }
        resize(cols, rows) {
            if (this._isDisposed) {
                return;
            }
            if (typeof cols !== 'number' || typeof rows !== 'number' || isNaN(cols) || isNaN(rows)) {
                return;
            }
            // Ensure that cols and rows are always >= 1, this prevents a native
            // exception in winpty.
            if (this._ptyProcess) {
                cols = Math.max(cols, 1);
                rows = Math.max(rows, 1);
                // Delay resize if needed
                if (this._delayedResizer) {
                    this._delayedResizer.cols = cols;
                    this._delayedResizer.rows = rows;
                    return;
                }
                this._logService.trace('IPty#resize', cols, rows);
                try {
                    this._ptyProcess.resize(cols, rows);
                }
                catch (e) {
                    // Swallow error if the pty has already exited
                    this._logService.trace('IPty#resize exception ' + e.message);
                    if (this._exitCode !== undefined && e.message !== 'ioctl(2) failed, EBADF') {
                        throw e;
                    }
                }
            }
        }
        acknowledgeDataEvent(charCount) {
            var _a;
            // Prevent lower than 0 to heal from errors
            this._unacknowledgedCharCount = Math.max(this._unacknowledgedCharCount - charCount, 0);
            this._logService.trace(`Flow control: Ack ${charCount} chars (unacknowledged: ${this._unacknowledgedCharCount})`);
            if (this._isPtyPaused && this._unacknowledgedCharCount < 5000 /* LowWatermarkChars */) {
                this._logService.trace(`Flow control: Resume (${this._unacknowledgedCharCount} < ${5000 /* LowWatermarkChars */})`);
                (_a = this._ptyProcess) === null || _a === void 0 ? void 0 : _a.resume();
                this._isPtyPaused = false;
            }
        }
        clearUnacknowledgedChars() {
            var _a;
            this._unacknowledgedCharCount = 0;
            this._logService.trace(`Flow control: Cleared all unacknowledged chars, forcing resume`);
            if (this._isPtyPaused) {
                (_a = this._ptyProcess) === null || _a === void 0 ? void 0 : _a.resume();
                this._isPtyPaused = false;
            }
        }
        getInitialCwd() {
            return Promise.resolve(this._initialCwd);
        }
        getCwd() {
            if (platform_1.isMacintosh) {
                // Disable cwd lookup on macOS Big Sur due to spawn blocking thread (darwin v20 is macOS
                // Big Sur) https://github.com/Microsoft/vscode/issues/105446
                const osRelease = os.release().split('.');
                if (osRelease.length > 0 && parseInt(osRelease[0]) < 20) {
                    return new Promise(resolve => {
                        if (!this._ptyProcess) {
                            resolve(this._initialCwd);
                            return;
                        }
                        this._logService.trace('IPty#pid');
                        (0, child_process_1.exec)('lsof -OPln -p ' + this._ptyProcess.pid + ' | grep cwd', (error, stdout, stderr) => {
                            if (!error && stdout !== '') {
                                resolve(stdout.substring(stdout.indexOf('/'), stdout.length - 1));
                            }
                            else {
                                this._logService.error('lsof did not run successfully, it may not be on the $PATH?', error, stdout, stderr);
                                resolve(this._initialCwd);
                            }
                        });
                    });
                }
            }
            if (platform_1.isLinux) {
                return new Promise(resolve => {
                    if (!this._ptyProcess) {
                        resolve(this._initialCwd);
                        return;
                    }
                    this._logService.trace('IPty#pid');
                    fs.readlink('/proc/' + this._ptyProcess.pid + '/cwd', (err, linkedstr) => {
                        if (err) {
                            resolve(this._initialCwd);
                        }
                        resolve(linkedstr);
                    });
                });
            }
            return new Promise(resolve => {
                resolve(this._initialCwd);
            });
        }
        getLatency() {
            return Promise.resolve(0);
        }
    };
    TerminalProcess._lastKillOrStart = 0;
    TerminalProcess = __decorate([
        __param(7, log_1.ILogService)
    ], TerminalProcess);
    exports.TerminalProcess = TerminalProcess;
    /**
     * Tracks the latest resize event to be trigger at a later point.
     */
    class DelayedResizer extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onTrigger = this._register(new event_1.Emitter());
            this._timeout = setTimeout(() => {
                this._onTrigger.fire({ rows: this.rows, cols: this.cols });
            }, 1000);
            this._register({
                dispose: () => {
                    clearTimeout(this._timeout);
                }
            });
        }
        get onTrigger() { return this._onTrigger.event; }
        dispose() {
            super.dispose();
            clearTimeout(this._timeout);
        }
    }
});
//# sourceMappingURL=terminalProcess.js.map