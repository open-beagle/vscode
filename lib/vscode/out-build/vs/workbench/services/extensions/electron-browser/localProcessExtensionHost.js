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
define(["require", "exports", "vs/nls!vs/workbench/services/extensions/electron-browser/localProcessExtensionHost", "child_process", "net", "vs/base/common/network", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/console", "vs/workbench/services/extensions/common/remoteConsoleUtil", "vs/base/node/ports", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/node/ipc.net", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/label/common/label", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/platform/native/electron-sandbox/native", "vs/platform/workspace/common/workspace", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/base/common/types", "../common/extensionDevOptions", "vs/base/common/buffer", "vs/platform/debug/common/extensionHostDebug", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/host/browser/host", "vs/base/common/resources", "vs/platform/registry/common/platform", "vs/workbench/services/output/common/output", "vs/base/common/uuid", "vs/base/common/path", "stream", "string_decoder", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService"], function (require, exports, nls, child_process_1, net_1, network_1, async_1, errorMessage_1, event_1, lifecycle_1, objects, platform, uri_1, console_1, remoteConsoleUtil_1, ports_1, ipc_net_1, ipc_net_2, environmentService_1, label_1, lifecycle_2, log_1, productService_1, notification_1, telemetry_1, native_1, workspace_1, extHost_protocol_1, extensionHostProtocol_1, types_1, extensionDevOptions_1, buffer_1, extensionHostDebug_1, extensions_1, workspaces_1, host_1, resources_1, platform_1, output_1, uuid_1, path_1, stream_1, string_decoder_1, shellEnvironmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalProcessExtensionHost = void 0;
    var NativeLogMarkers;
    (function (NativeLogMarkers) {
        NativeLogMarkers["Start"] = "START_NATIVE_LOG";
        NativeLogMarkers["End"] = "END_NATIVE_LOG";
    })(NativeLogMarkers || (NativeLogMarkers = {}));
    let LocalProcessExtensionHost = class LocalProcessExtensionHost {
        constructor(_initDataProvider, _contextService, _notificationService, _nativeHostService, _lifecycleService, _environmentService, _telemetryService, _logService, _labelService, _extensionHostDebugService, _hostService, _productService, _shellEnvironmentService) {
            this._initDataProvider = _initDataProvider;
            this._contextService = _contextService;
            this._notificationService = _notificationService;
            this._nativeHostService = _nativeHostService;
            this._lifecycleService = _lifecycleService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            this._logService = _logService;
            this._labelService = _labelService;
            this._extensionHostDebugService = _extensionHostDebugService;
            this._hostService = _hostService;
            this._productService = _productService;
            this._shellEnvironmentService = _shellEnvironmentService;
            this.kind = 0 /* LocalProcess */;
            this.remoteAuthority = null;
            this._onExit = new event_1.Emitter();
            this.onExit = this._onExit.event;
            this._onDidSetInspectPort = new event_1.Emitter();
            this._toDispose = new lifecycle_1.DisposableStore();
            const devOpts = (0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService);
            this._isExtensionDevHost = devOpts.isExtensionDevHost;
            this._isExtensionDevDebug = devOpts.isExtensionDevDebug;
            this._isExtensionDevDebugBrk = devOpts.isExtensionDevDebugBrk;
            this._isExtensionDevTestFromCli = devOpts.isExtensionDevTestFromCli;
            this._lastExtensionHostError = null;
            this._terminating = false;
            this._namedPipeServer = null;
            this._inspectPort = null;
            this._extensionHostProcess = null;
            this._extensionHostConnection = null;
            this._messageProtocol = null;
            this._extensionHostLogFile = (0, resources_1.joinPath)(this._environmentService.extHostLogsPath, `${extensions_1.ExtensionHostLogFileName}.log`);
            this._toDispose.add(this._onExit);
            this._toDispose.add(this._lifecycleService.onWillShutdown(e => this._onWillShutdown(e)));
            this._toDispose.add(this._lifecycleService.onDidShutdown(reason => this.terminate()));
            this._toDispose.add(this._extensionHostDebugService.onClose(event => {
                if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId === event.sessionId) {
                    this._nativeHostService.closeWindow();
                }
            }));
            this._toDispose.add(this._extensionHostDebugService.onReload(event => {
                if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId === event.sessionId) {
                    this._hostService.reload();
                }
            }));
            const globalExitListener = () => this.terminate();
            process.once('exit', globalExitListener);
            this._toDispose.add((0, lifecycle_1.toDisposable)(() => {
                process.removeListener('exit', globalExitListener); // https://github.com/electron/electron/issues/21475
            }));
        }
        dispose() {
            this.terminate();
        }
        start() {
            if (this._terminating) {
                // .terminate() was called
                return null;
            }
            if (!this._messageProtocol) {
                this._messageProtocol = Promise.all([
                    this._tryListenOnPipe(),
                    this._tryFindDebugPort(),
                    this._shellEnvironmentService.getShellEnv()
                ]).then(([pipeName, portNumber, processEnv]) => {
                    var _a, _b;
                    const env = objects.mixin(processEnv, {
                        VSCODE_AMD_ENTRYPOINT: 'vs/workbench/services/extensions/node/extensionHostProcess',
                        VSCODE_PIPE_LOGGING: 'true',
                        VSCODE_VERBOSE_LOGGING: true,
                        VSCODE_LOG_NATIVE: this._isExtensionDevHost,
                        VSCODE_IPC_HOOK_EXTHOST: pipeName,
                        VSCODE_HANDLES_UNCAUGHT_ERRORS: true,
                        VSCODE_LOG_STACK: !this._isExtensionDevTestFromCli && (this._isExtensionDevHost || !this._environmentService.isBuilt || this._productService.quality !== 'stable' || this._environmentService.verbose),
                        VSCODE_LOG_LEVEL: this._environmentService.verbose ? 'trace' : this._environmentService.log
                    });
                    if (platform.isMacintosh) {
                        // Unset `DYLD_LIBRARY_PATH`, as it leads to extension host crashes
                        // See https://github.com/microsoft/vscode/issues/104525
                        delete env['DYLD_LIBRARY_PATH'];
                    }
                    if (this._isExtensionDevHost) {
                        // Unset `VSCODE_NODE_CACHED_DATA_DIR` when developing extensions because it might
                        // be that dependencies, that otherwise would be cached, get modified.
                        delete env['VSCODE_NODE_CACHED_DATA_DIR'];
                    }
                    const opts = {
                        env,
                        // We only detach the extension host on windows. Linux and Mac orphan by default
                        // and detach under Linux and Mac create another process group.
                        // We detach because we have noticed that when the renderer exits, its child processes
                        // (i.e. extension host) are taken down in a brutal fashion by the OS
                        detached: !!platform.isWindows,
                        execArgv: undefined,
                        silent: true
                    };
                    if (portNumber !== 0) {
                        opts.execArgv = [
                            '--nolazy',
                            (this._isExtensionDevDebugBrk ? '--inspect-brk=' : '--inspect=') + portNumber
                        ];
                    }
                    else {
                        opts.execArgv = ['--inspect-port=0'];
                    }
                    if (this._environmentService.args['prof-v8-extensions']) {
                        opts.execArgv.unshift('--prof');
                    }
                    if (this._environmentService.args['max-memory']) {
                        opts.execArgv.unshift(`--max-old-space-size=${this._environmentService.args['max-memory']}`);
                    }
                    // On linux crash reporter needs to be started on child node processes explicitly
                    if (platform.isLinux) {
                        const crashReporterStartOptions = {
                            companyName: ((_a = this._productService.crashReporter) === null || _a === void 0 ? void 0 : _a.companyName) || 'Microsoft',
                            productName: ((_b = this._productService.crashReporter) === null || _b === void 0 ? void 0 : _b.productName) || this._productService.nameShort,
                            submitURL: '',
                            uploadToServer: false
                        };
                        const crashReporterId = this._environmentService.crashReporterId; // crashReporterId is set by the main process only when crash reporting is enabled by the user.
                        const appcenter = this._productService.appCenter;
                        const uploadCrashesToServer = !this._environmentService.crashReporterDirectory; // only upload unless --crash-reporter-directory is provided
                        if (uploadCrashesToServer && appcenter && crashReporterId && (0, uuid_1.isUUID)(crashReporterId)) {
                            const submitURL = appcenter[`linux-x64`];
                            crashReporterStartOptions.submitURL = submitURL.concat('&uid=', crashReporterId, '&iid=', crashReporterId, '&sid=', crashReporterId);
                            crashReporterStartOptions.uploadToServer = true;
                        }
                        // In the upload to server case, there is a bug in electron that creates client_id file in the current
                        // working directory. Setting the env BREAKPAD_DUMP_LOCATION will force electron to create the file in that location,
                        // For https://github.com/microsoft/vscode/issues/105743
                        const extHostCrashDirectory = this._environmentService.crashReporterDirectory || this._environmentService.userDataPath;
                        opts.env.BREAKPAD_DUMP_LOCATION = (0, path_1.join)(extHostCrashDirectory, `${extensions_1.ExtensionHostLogFileName} Crash Reports`);
                        opts.env.VSCODE_CRASH_REPORTER_START_OPTIONS = JSON.stringify(crashReporterStartOptions);
                    }
                    // Run Extension Host as fork of current process
                    this._extensionHostProcess = (0, child_process_1.fork)(network_1.FileAccess.asFileUri('bootstrap-fork', require).fsPath, ['--type=extensionHost'], opts);
                    const onStdout = this._handleProcessOutputStream(this._extensionHostProcess.stdout);
                    const onStderr = this._handleProcessOutputStream(this._extensionHostProcess.stderr);
                    const onOutput = event_1.Event.any(event_1.Event.map(onStdout.event, o => ({ data: `%c${o}`, format: [''] })), event_1.Event.map(onStderr.event, o => ({ data: `%c${o}`, format: ['color: red'] })));
                    // Debounce all output, so we can render it in the Chrome console as a group
                    const onDebouncedOutput = event_1.Event.debounce(onOutput, (r, o) => {
                        return r
                            ? { data: r.data + o.data, format: [...r.format, ...o.format] }
                            : { data: o.data, format: o.format };
                    }, 100);
                    // Print out extension host output
                    onDebouncedOutput(output => {
                        const inspectorUrlMatch = output.data && output.data.match(/ws:\/\/([^\s]+:(\d+)\/[^\s]+)/);
                        if (inspectorUrlMatch) {
                            if (!this._environmentService.isBuilt && !this._isExtensionDevTestFromCli) {
                                console.log(`%c[Extension Host] %cdebugger inspector at chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${inspectorUrlMatch[1]}`, 'color: blue', 'color:');
                            }
                            if (!this._inspectPort) {
                                this._inspectPort = Number(inspectorUrlMatch[2]);
                                this._onDidSetInspectPort.fire();
                            }
                        }
                        else {
                            if (!this._isExtensionDevTestFromCli) {
                                console.group('Extension Host');
                                console.log(output.data, ...output.format);
                                console.groupEnd();
                            }
                        }
                    });
                    // Support logging from extension host
                    this._extensionHostProcess.on('message', msg => {
                        if (msg && msg.type === '__$console') {
                            this._logExtensionHostMessage(msg);
                        }
                    });
                    // Lifecycle
                    this._extensionHostProcess.on('error', (err) => this._onExtHostProcessError(err));
                    this._extensionHostProcess.on('exit', (code, signal) => this._onExtHostProcessExit(code, signal));
                    // Notify debugger that we are ready to attach to the process if we run a development extension
                    if (portNumber) {
                        if (this._isExtensionDevHost && portNumber && this._isExtensionDevDebug && this._environmentService.debugExtensionHost.debugId) {
                            this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, portNumber);
                        }
                        this._inspectPort = portNumber;
                        this._onDidSetInspectPort.fire();
                    }
                    // Help in case we fail to start it
                    let startupTimeoutHandle;
                    if (!this._environmentService.isBuilt && !this._environmentService.remoteAuthority || this._isExtensionDevHost) {
                        startupTimeoutHandle = setTimeout(() => {
                            const msg = this._isExtensionDevDebugBrk
                                ? nls.localize(0, null)
                                : nls.localize(1, null);
                            this._notificationService.prompt(notification_1.Severity.Warning, msg, [{
                                    label: nls.localize(2, null),
                                    run: () => this._hostService.reload()
                                }], { sticky: true });
                        }, 10000);
                    }
                    // Initialize extension host process with hand shakes
                    return this._tryExtHostHandshake().then((protocol) => {
                        clearTimeout(startupTimeoutHandle);
                        return protocol;
                    });
                });
            }
            return this._messageProtocol;
        }
        /**
         * Start a server (`this._namedPipeServer`) that listens on a named pipe and return the named pipe name.
         */
        _tryListenOnPipe() {
            return new Promise((resolve, reject) => {
                const pipeName = (0, ipc_net_2.createRandomIPCHandle)();
                this._namedPipeServer = (0, net_1.createServer)();
                this._namedPipeServer.on('error', reject);
                this._namedPipeServer.listen(pipeName, () => {
                    if (this._namedPipeServer) {
                        this._namedPipeServer.removeListener('error', reject);
                    }
                    resolve(pipeName);
                });
            });
        }
        /**
         * Find a free port if extension host debugging is enabled.
         */
        async _tryFindDebugPort() {
            if (typeof this._environmentService.debugExtensionHost.port !== 'number') {
                return 0;
            }
            const expected = this._environmentService.debugExtensionHost.port;
            const port = await (0, ports_1.findFreePort)(expected, 10 /* try 10 ports */, 5000 /* try up to 5 seconds */);
            if (!this._isExtensionDevTestFromCli) {
                if (!port) {
                    console.warn('%c[Extension Host] %cCould not find a free port for debugging', 'color: blue', 'color:');
                }
                else {
                    if (port !== expected) {
                        console.warn(`%c[Extension Host] %cProvided debugging port ${expected} is not free, using ${port} instead.`, 'color: blue', 'color:');
                    }
                    if (this._isExtensionDevDebugBrk) {
                        console.warn(`%c[Extension Host] %cSTOPPED on first line for debugging on port ${port}`, 'color: blue', 'color:');
                    }
                    else {
                        console.info(`%c[Extension Host] %cdebugger listening on port ${port}`, 'color: blue', 'color:');
                    }
                }
            }
            return port || 0;
        }
        _tryExtHostHandshake() {
            return new Promise((resolve, reject) => {
                // Wait for the extension host to connect to our named pipe
                // and wrap the socket in the message passing protocol
                let handle = setTimeout(() => {
                    if (this._namedPipeServer) {
                        this._namedPipeServer.close();
                        this._namedPipeServer = null;
                    }
                    reject('timeout');
                }, 60 * 1000);
                this._namedPipeServer.on('connection', socket => {
                    clearTimeout(handle);
                    if (this._namedPipeServer) {
                        this._namedPipeServer.close();
                        this._namedPipeServer = null;
                    }
                    this._extensionHostConnection = socket;
                    // using a buffered message protocol here because between now
                    // and the first time a `then` executes some messages might be lost
                    // unless we immediately register a listener for `onMessage`.
                    resolve(new ipc_net_1.PersistentProtocol(new ipc_net_2.NodeSocket(this._extensionHostConnection)));
                });
            }).then((protocol) => {
                // 1) wait for the incoming `ready` event and send the initialization data.
                // 2) wait for the incoming `initialized` event.
                return new Promise((resolve, reject) => {
                    let timeoutHandle;
                    const installTimeoutCheck = () => {
                        timeoutHandle = setTimeout(() => {
                            reject('timeout');
                        }, 60 * 1000);
                    };
                    const uninstallTimeoutCheck = () => {
                        clearTimeout(timeoutHandle);
                    };
                    // Wait 60s for the ready message
                    installTimeoutCheck();
                    const disposable = protocol.onMessage(msg => {
                        if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 1 /* Ready */)) {
                            // 1) Extension Host is ready to receive messages, initialize it
                            uninstallTimeoutCheck();
                            this._createExtHostInitData().then(data => {
                                // Wait 60s for the initialized message
                                installTimeoutCheck();
                                protocol.send(buffer_1.VSBuffer.fromString(JSON.stringify(data)));
                            });
                            return;
                        }
                        if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 0 /* Initialized */)) {
                            // 2) Extension Host is initialized
                            uninstallTimeoutCheck();
                            // stop listening for messages here
                            disposable.dispose();
                            // Register log channel for exthost log
                            platform_1.Registry.as(output_1.Extensions.OutputChannels).registerChannel({ id: 'extHostLog', label: nls.localize(3, null), file: this._extensionHostLogFile, log: true });
                            // release this promise
                            resolve(protocol);
                            return;
                        }
                        console.error(`received unexpected message during handshake phase from the extension host: `, msg);
                    });
                });
            });
        }
        async _createExtHostInitData() {
            const [telemetryInfo, initData] = await Promise.all([this._telemetryService.getTelemetryInfo(), this._initDataProvider.getInitData()]);
            const workspace = this._contextService.getWorkspace();
            return {
                commit: this._productService.commit,
                version: this._productService.version,
                parentPid: process.pid,
                environment: {
                    isExtensionDevelopmentDebug: this._isExtensionDevDebug,
                    appRoot: this._environmentService.appRoot ? uri_1.URI.file(this._environmentService.appRoot) : undefined,
                    appName: this._productService.nameLong,
                    appUriScheme: this._productService.urlProtocol,
                    appLanguage: platform.language,
                    extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                    globalStorageHome: this._environmentService.globalStorageHome,
                    workspaceStorageHome: this._environmentService.workspaceStorageHome,
                    webviewResourceRoot: this._environmentService.webviewResourceRoot,
                    webviewCspSource: this._environmentService.webviewCspSource,
                },
                workspace: this._contextService.getWorkbenchState() === 1 /* EMPTY */ ? undefined : {
                    configuration: (0, types_1.withNullAsUndefined)(workspace.configuration),
                    id: workspace.id,
                    name: this._labelService.getWorkspaceLabel(workspace),
                    isUntitled: workspace.configuration ? (0, workspaces_1.isUntitledWorkspace)(workspace.configuration, this._environmentService) : false
                },
                remote: {
                    authority: this._environmentService.remoteAuthority,
                    connectionData: null,
                    isRemote: false
                },
                resolvedExtensions: [],
                hostExtensions: [],
                extensions: initData.extensions,
                telemetryInfo,
                logLevel: this._logService.getLevel(),
                logsLocation: this._environmentService.extHostLogsPath,
                logFile: this._extensionHostLogFile,
                autoStart: initData.autoStart,
                uiKind: extHost_protocol_1.UIKind.Desktop
            };
        }
        _logExtensionHostMessage(entry) {
            if (this._isExtensionDevTestFromCli) {
                // Log on main side if running tests from cli
                (0, remoteConsoleUtil_1.logRemoteEntry)(this._logService, entry);
            }
            else {
                // Send to local console
                (0, console_1.log)(entry, 'Extension Host');
            }
        }
        _onExtHostProcessError(err) {
            let errorMessage = (0, errorMessage_1.toErrorMessage)(err);
            if (errorMessage === this._lastExtensionHostError) {
                return; // prevent error spam
            }
            this._lastExtensionHostError = errorMessage;
            this._notificationService.error(nls.localize(4, null, errorMessage));
        }
        _onExtHostProcessExit(code, signal) {
            if (this._terminating) {
                // Expected termination path (we asked the process to terminate)
                return;
            }
            this._onExit.fire([code, signal]);
        }
        _handleProcessOutputStream(stream) {
            let last = '';
            let isOmitting = false;
            const event = new event_1.Emitter();
            const decoder = new string_decoder_1.StringDecoder('utf-8');
            stream.pipe(new stream_1.Writable({
                write(chunk, _encoding, callback) {
                    // not a fancy approach, but this is the same approach used by the split2
                    // module which is well-optimized (https://github.com/mcollina/split2)
                    last += typeof chunk === 'string' ? chunk : decoder.write(chunk);
                    let lines = last.split(/\r?\n/g);
                    last = lines.pop();
                    // protected against an extension spamming and leaking memory if no new line is written.
                    if (last.length > 10000) {
                        lines.push(last);
                        last = '';
                    }
                    for (const line of lines) {
                        if (isOmitting) {
                            if (line === "END_NATIVE_LOG" /* End */) {
                                isOmitting = false;
                            }
                        }
                        else if (line === "START_NATIVE_LOG" /* Start */) {
                            isOmitting = true;
                        }
                        else if (line.length) {
                            event.fire(line + '\n');
                        }
                    }
                    callback();
                }
            }));
            return event;
        }
        async enableInspectPort() {
            if (typeof this._inspectPort === 'number') {
                return true;
            }
            if (!this._extensionHostProcess) {
                return false;
            }
            if (typeof process._debugProcess === 'function') {
                // use (undocumented) _debugProcess feature of node
                process._debugProcess(this._extensionHostProcess.pid);
                await Promise.race([event_1.Event.toPromise(this._onDidSetInspectPort.event), (0, async_1.timeout)(1000)]);
                return typeof this._inspectPort === 'number';
            }
            else if (!platform.isWindows) {
                // use KILL USR1 on non-windows platforms (fallback)
                this._extensionHostProcess.kill('SIGUSR1');
                await Promise.race([event_1.Event.toPromise(this._onDidSetInspectPort.event), (0, async_1.timeout)(1000)]);
                return typeof this._inspectPort === 'number';
            }
            else {
                // not supported...
                return false;
            }
        }
        getInspectPort() {
            return (0, types_1.withNullAsUndefined)(this._inspectPort);
        }
        terminate() {
            if (this._terminating) {
                return;
            }
            this._terminating = true;
            this._toDispose.dispose();
            if (!this._messageProtocol) {
                // .start() was not called
                return;
            }
            this._messageProtocol.then((protocol) => {
                // Send the extension host a request to terminate itself
                // (graceful termination)
                protocol.send((0, extensionHostProtocol_1.createMessageOfType)(2 /* Terminate */));
                protocol.dispose();
                // Give the extension host 10s, after which we will
                // try to kill the process and release any resources
                setTimeout(() => this._cleanResources(), 10 * 1000);
            }, (err) => {
                // Establishing a protocol with the extension host failed, so
                // try to kill the process and release any resources.
                this._cleanResources();
            });
        }
        _cleanResources() {
            if (this._namedPipeServer) {
                this._namedPipeServer.close();
                this._namedPipeServer = null;
            }
            if (this._extensionHostConnection) {
                this._extensionHostConnection.end();
                this._extensionHostConnection = null;
            }
            if (this._extensionHostProcess) {
                this._extensionHostProcess.kill();
                this._extensionHostProcess = null;
            }
        }
        _onWillShutdown(event) {
            // If the extension development host was started without debugger attached we need
            // to communicate this back to the main side to terminate the debug session
            if (this._isExtensionDevHost && !this._isExtensionDevTestFromCli && !this._isExtensionDevDebug && this._environmentService.debugExtensionHost.debugId) {
                this._extensionHostDebugService.terminateSession(this._environmentService.debugExtensionHost.debugId);
                event.join((0, async_1.timeout)(100 /* wait a bit for IPC to get delivered */), 'join.extensionDevelopment');
            }
        }
    };
    LocalProcessExtensionHost = __decorate([
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, notification_1.INotificationService),
        __param(3, native_1.INativeHostService),
        __param(4, lifecycle_2.ILifecycleService),
        __param(5, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, log_1.ILogService),
        __param(8, label_1.ILabelService),
        __param(9, extensionHostDebug_1.IExtensionHostDebugService),
        __param(10, host_1.IHostService),
        __param(11, productService_1.IProductService),
        __param(12, shellEnvironmentService_1.IShellEnvironmentService)
    ], LocalProcessExtensionHost);
    exports.LocalProcessExtensionHost = LocalProcessExtensionHost;
});
//# sourceMappingURL=localProcessExtensionHost.js.map