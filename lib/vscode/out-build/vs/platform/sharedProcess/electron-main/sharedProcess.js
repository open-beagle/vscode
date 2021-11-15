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
define(["require", "exports", "vs/platform/product/common/product", "electron", "vs/platform/environment/electron-main/environmentMainService", "vs/base/common/async", "vs/platform/log/common/log", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/theme/electron-main/themeMainService", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/lifecycle", "vs/base/parts/ipc/electron-main/ipc.mp", "vs/base/common/types", "vs/base/common/event", "vs/platform/environment/node/shellEnv", "vs/platform/protocol/electron-main/protocol"], function (require, exports, product_1, electron_1, environmentMainService_1, async_1, log_1, lifecycleMainService_1, themeMainService_1, network_1, platform_1, lifecycle_1, ipc_mp_1, types_1, event_1, shellEnv_1, protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedProcess = void 0;
    let SharedProcess = class SharedProcess extends lifecycle_1.Disposable {
        constructor(machineId, userEnv, environmentMainService, lifecycleMainService, logService, themeMainService, protocolMainService) {
            super();
            this.machineId = machineId;
            this.userEnv = userEnv;
            this.environmentMainService = environmentMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.themeMainService = themeMainService;
            this.protocolMainService = protocolMainService;
            this.firstWindowConnectionBarrier = new async_1.Barrier();
            this.window = undefined;
            this.windowCloseListener = undefined;
            this._onDidError = this._register(new event_1.Emitter());
            this.onDidError = event_1.Event.buffer(this._onDidError.event); // buffer until we have a listener!
            this._whenReady = undefined;
            this._whenIpcReady = undefined;
            this.registerListeners();
        }
        registerListeners() {
            // Lifecycle
            this._register(this.lifecycleMainService.onWillShutdown(() => this.onWillShutdown()));
            // Shared process connections from workbench windows
            electron_1.ipcMain.on('vscode:createSharedProcessMessageChannel', async (e, nonce) => this.onWindowConnection(e, nonce));
        }
        async onWindowConnection(e, nonce) {
            this.logService.trace('SharedProcess: on vscode:createSharedProcessMessageChannel');
            // release barrier if this is the first window connection
            if (!this.firstWindowConnectionBarrier.isOpen()) {
                this.firstWindowConnectionBarrier.open();
            }
            // await the shared process to be overall ready
            // we do not just wait for IPC ready because the
            // workbench window will communicate directly
            await this.whenReady();
            // connect to the shared process window
            const port = await this.connect();
            // Check back if the requesting window meanwhile closed
            // Since shared process is delayed on startup there is
            // a chance that the window close before the shared process
            // was ready for a connection.
            if (e.sender.isDestroyed()) {
                return port.close();
            }
            // send the port back to the requesting window
            e.sender.postMessage('vscode:createSharedProcessMessageChannelResult', nonce, [port]);
        }
        onWillShutdown() {
            const window = this.window;
            if (!window) {
                return; // possibly too early before created
            }
            // Signal exit to shared process when shutting down
            if (!window.isDestroyed() && !window.webContents.isDestroyed()) {
                window.webContents.send('vscode:electron-main->shared-process=exit');
            }
            // Shut the shared process down when we are quitting
            //
            // Note: because we veto the window close, we must first remove our veto.
            // Otherwise the application would never quit because the shared process
            // window is refusing to close!
            //
            if (this.windowCloseListener) {
                window.removeListener('close', this.windowCloseListener);
                this.windowCloseListener = undefined;
            }
            // Electron seems to crash on Windows without this setTimeout :|
            setTimeout(() => {
                try {
                    window.close();
                }
                catch (err) {
                    // ignore, as electron is already shutting down
                }
                this.window = undefined;
            }, 0);
        }
        whenReady() {
            if (!this._whenReady) {
                // Overall signal that the shared process window was loaded and
                // all services within have been created.
                this._whenReady = new Promise(resolve => electron_1.ipcMain.once('vscode:shared-process->electron-main=init-done', () => {
                    this.logService.trace('SharedProcess: Overall ready');
                    resolve();
                }));
            }
            return this._whenReady;
        }
        get whenIpcReady() {
            if (!this._whenIpcReady) {
                this._whenIpcReady = (async () => {
                    // Always wait for first window asking for connection
                    await this.firstWindowConnectionBarrier.wait();
                    // Resolve shell environment
                    this.userEnv = Object.assign(Object.assign({}, this.userEnv), (await (0, shellEnv_1.resolveShellEnv)(this.logService, this.environmentMainService.args, process.env)));
                    // Create window for shared process
                    this.createWindow();
                    // Listeners
                    this.registerWindowListeners();
                    // Wait for window indicating that IPC connections are accepted
                    await new Promise(resolve => electron_1.ipcMain.once('vscode:shared-process->electron-main=ipc-ready', () => {
                        this.logService.trace('SharedProcess: IPC ready');
                        resolve();
                    }));
                })();
            }
            return this._whenIpcReady;
        }
        createWindow() {
            const configObjectUrl = this._register(this.protocolMainService.createIPCObjectUrl());
            // shared process is a hidden window by default
            this.window = new electron_1.BrowserWindow({
                show: false,
                backgroundColor: this.themeMainService.getBackgroundColor(),
                webPreferences: {
                    preload: network_1.FileAccess.asFileUri('vs/base/parts/sandbox/electron-browser/preload.js', require).fsPath,
                    additionalArguments: [`--vscode-window-config=${configObjectUrl.resource.toString()}`],
                    v8CacheOptions: platform_1.browserCodeLoadingCacheStrategy,
                    nodeIntegration: true,
                    contextIsolation: false,
                    enableWebSQL: false,
                    enableRemoteModule: false,
                    spellcheck: false,
                    nativeWindowOpen: true,
                    images: false,
                    webgl: false,
                    disableBlinkFeatures: 'Auxclick' // do NOT change, allows us to identify this window as shared-process in the process explorer
                }
            });
            // Store into config object URL
            configObjectUrl.update({
                machineId: this.machineId,
                windowId: this.window.id,
                appRoot: this.environmentMainService.appRoot,
                nodeCachedDataDir: this.environmentMainService.nodeCachedDataDir,
                backupWorkspacesPath: this.environmentMainService.backupWorkspacesPath,
                userEnv: this.userEnv,
                args: this.environmentMainService.args,
                logLevel: this.logService.getLevel(),
                product: product_1.default
            });
            // Load with config
            this.window.loadURL(network_1.FileAccess.asBrowserUri('vs/code/electron-browser/sharedProcess/sharedProcess.html', require).toString(true));
        }
        registerWindowListeners() {
            if (!this.window) {
                return;
            }
            // Prevent the window from closing
            this.windowCloseListener = (e) => {
                var _a;
                this.logService.trace('SharedProcess#close prevented');
                // We never allow to close the shared process unless we get explicitly disposed()
                e.preventDefault();
                // Still hide the window though if visible
                if ((_a = this.window) === null || _a === void 0 ? void 0 : _a.isVisible()) {
                    this.window.hide();
                }
            };
            this.window.on('close', this.windowCloseListener);
            // Crashes & Unresponsive & Failed to load
            // We use `onUnexpectedError` explicitly because the error handler
            // will send the error to the active window to log in devtools too
            this.window.webContents.on('render-process-gone', (event, details) => this._onDidError.fire({ type: 2 /* CRASHED */, details }));
            this.window.on('unresponsive', () => this._onDidError.fire({ type: 1 /* UNRESPONSIVE */, details: 'SharedProcess: detected unresponsive window' }));
            this.window.webContents.on('did-fail-load', (event, errorCode, errorDescription) => this._onDidError.fire({ type: 3 /* LOAD */, details: `SharedProcess: failed to load: ${errorDescription}` }));
        }
        async connect() {
            // Wait for shared process being ready to accept connection
            await this.whenIpcReady;
            // Connect and return message port
            const window = (0, types_1.assertIsDefined)(this.window);
            return (0, ipc_mp_1.connect)(window);
        }
        async toggle() {
            // wait for window to be created
            await this.whenIpcReady;
            if (!this.window) {
                return; // possibly disposed already
            }
            if (this.window.isVisible()) {
                this.window.webContents.closeDevTools();
                this.window.hide();
            }
            else {
                this.window.show();
                this.window.webContents.openDevTools();
            }
        }
        isVisible() {
            var _a, _b;
            return (_b = (_a = this.window) === null || _a === void 0 ? void 0 : _a.isVisible()) !== null && _b !== void 0 ? _b : false;
        }
    };
    SharedProcess = __decorate([
        __param(2, environmentMainService_1.IEnvironmentMainService),
        __param(3, lifecycleMainService_1.ILifecycleMainService),
        __param(4, log_1.ILogService),
        __param(5, themeMainService_1.IThemeMainService),
        __param(6, protocol_1.IProtocolMainService)
    ], SharedProcess);
    exports.SharedProcess = SharedProcess;
});
//# sourceMappingURL=sharedProcess.js.map