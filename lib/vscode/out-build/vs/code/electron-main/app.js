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
define(["require", "exports", "os", "fs", "electron", "vs/base/common/platform", "vs/platform/windows/electron-main/windowsMainService", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/environment/node/shellEnv", "vs/platform/update/common/update", "vs/platform/update/common/updateIpc", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/electron-main/ipc.electron", "vs/base/parts/ipc/electron-main/ipc.mp", "vs/platform/sharedProcess/electron-main/sharedProcess", "vs/platform/launch/electron-main/launchMainService", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/log/common/log", "vs/platform/state/node/state", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/configuration/common/configuration", "vs/platform/url/common/url", "vs/platform/url/common/urlIpc", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/commonProperties", "vs/platform/product/common/productService", "vs/code/electron-main/auth", "vs/base/common/lifecycle", "vs/platform/windows/electron-main/windows", "vs/base/common/uri", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/electron-main/workspacesMainService", "vs/base/node/id", "vs/platform/update/electron-main/updateService.win32", "vs/platform/update/electron-main/updateService.linux", "vs/platform/update/electron-main/updateService.darwin", "vs/platform/issue/electron-main/issueMainService", "vs/platform/log/common/logIpc", "vs/base/common/errors", "vs/platform/url/electron-main/electronUrlListener", "vs/platform/driver/electron-main/driver", "vs/platform/menubar/electron-main/menubarMainService", "vs/base/parts/contextmenu/electron-main/contextmenu", "vs/base/common/path", "vs/base/common/resources", "vs/nls!vs/code/electron-main/app", "vs/base/common/network", "vs/platform/update/electron-main/updateService.snap", "vs/platform/storage/electron-main/storageMainService", "vs/platform/storage/electron-main/storageIpc", "vs/platform/backup/electron-main/backupMainService", "vs/platform/backup/electron-main/backup", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/url/common/urlService", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/diagnostics/common/diagnostics", "vs/platform/debug/electron-main/extensionHostDebugIpc", "vs/platform/native/electron-main/nativeHostMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/base/common/types", "vs/base/common/labels", "vs/platform/webview/electron-main/webviewMainService", "vs/platform/webview/common/webviewManagerService", "vs/platform/files/common/files", "vs/base/common/json", "vs/base/common/uuid", "vs/base/common/buffer", "vs/platform/encryption/electron-main/encryptionMainService", "vs/platform/windows/node/windowTracker", "vs/platform/keyboardLayout/electron-main/keyboardLayoutMainService", "vs/platform/environment/node/argvHelper", "vs/base/common/extpath", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionUrlTrust", "vs/platform/extensionManagement/node/extensionUrlTrustService", "vs/base/common/functional", "vs/platform/remote/common/remoteHosts", "vs/platform/sign/common/sign"], function (require, exports, os_1, fs_1, electron_1, platform_1, windowsMainService_1, lifecycleMainService_1, shellEnv_1, update_1, updateIpc_1, ipc_1, ipc_electron_1, ipc_mp_1, sharedProcess_1, launchMainService_1, instantiation_1, serviceCollection_1, descriptors_1, log_1, state_1, environmentMainService_1, configuration_1, url_1, urlIpc_1, telemetry_1, telemetryUtils_1, telemetryIpc_1, telemetryService_1, commonProperties_1, productService_1, auth_1, lifecycle_1, windows_1, uri_1, workspaces_1, workspacesMainService_1, id_1, updateService_win32_1, updateService_linux_1, updateService_darwin_1, issueMainService_1, logIpc_1, errors_1, electronUrlListener_1, driver_1, menubarMainService_1, contextmenu_1, path_1, resources_1, nls_1, network_1, updateService_snap_1, storageMainService_1, storageIpc_1, backupMainService_1, backup_1, workspacesHistoryMainService_1, urlService_1, workspacesManagementMainService_1, diagnostics_1, extensionHostDebugIpc_1, nativeHostMainService_1, dialogMainService_1, types_1, labels_1, webviewMainService_1, webviewManagerService_1, files_1, json_1, uuid_1, buffer_1, encryptionMainService_1, windowTracker_1, keyboardLayoutMainService_1, argvHelper_1, extpath_1, cancellation_1, extensionUrlTrust_1, extensionUrlTrustService_1, functional_1, remoteHosts_1, sign_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeApplication = void 0;
    /**
     * The main VS Code application. There will only ever be one instance,
     * even if the user starts many instances (e.g. from the command line).
     */
    let CodeApplication = class CodeApplication extends lifecycle_1.Disposable {
        constructor(mainProcessNodeIpcServer, userEnv, mainInstantiationService, logService, environmentMainService, lifecycleMainService, configurationService, stateService, fileService, productService) {
            super();
            this.mainProcessNodeIpcServer = mainProcessNodeIpcServer;
            this.userEnv = userEnv;
            this.mainInstantiationService = mainInstantiationService;
            this.logService = logService;
            this.environmentMainService = environmentMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.configurationService = configurationService;
            this.stateService = stateService;
            this.fileService = fileService;
            this.productService = productService;
            this.registerListeners();
        }
        registerListeners() {
            // We handle uncaught exceptions here to prevent electron from opening a dialog to the user
            (0, errors_1.setUnexpectedErrorHandler)(err => this.onUnexpectedError(err));
            process.on('uncaughtException', err => this.onUnexpectedError(err));
            process.on('unhandledRejection', (reason) => (0, errors_1.onUnexpectedError)(reason));
            // Dispose on shutdown
            this.lifecycleMainService.onWillShutdown(() => this.dispose());
            // Contextmenu via IPC support
            (0, contextmenu_1.registerContextMenuListener)();
            // Accessibility change event
            electron_1.app.on('accessibility-support-changed', (event, accessibilitySupportEnabled) => {
                var _a;
                (_a = this.windowsMainService) === null || _a === void 0 ? void 0 : _a.sendToAll('vscode:accessibilitySupportChanged', accessibilitySupportEnabled);
            });
            // macOS dock activate
            electron_1.app.on('activate', (event, hasVisibleWindows) => {
                var _a;
                this.logService.trace('app#activate');
                // Mac only event: open new window when we get activated
                if (!hasVisibleWindows) {
                    (_a = this.windowsMainService) === null || _a === void 0 ? void 0 : _a.openEmptyWindow({ context: 1 /* DOCK */ });
                }
            });
            //#region Security related measures (https://electronjs.org/docs/tutorial/security)
            //
            // !!! DO NOT CHANGE without consulting the documentation !!!
            //
            electron_1.app.on('remote-require', (event, sender, module) => {
                this.logService.trace('app#on(remote-require): prevented');
                event.preventDefault();
            });
            electron_1.app.on('remote-get-global', (event, sender, module) => {
                this.logService.trace(`app#on(remote-get-global): prevented on ${module}`);
                event.preventDefault();
            });
            electron_1.app.on('remote-get-builtin', (event, sender, module) => {
                this.logService.trace(`app#on(remote-get-builtin): prevented on ${module}`);
                if (module !== 'clipboard') {
                    event.preventDefault();
                }
            });
            electron_1.app.on('remote-get-current-window', event => {
                this.logService.trace(`app#on(remote-get-current-window): prevented`);
                event.preventDefault();
            });
            electron_1.app.on('remote-get-current-web-contents', event => {
                if (this.environmentMainService.args.driver) {
                    return; // the driver needs access to web contents
                }
                this.logService.trace(`app#on(remote-get-current-web-contents): prevented`);
                event.preventDefault();
            });
            electron_1.app.on('web-contents-created', (event, contents) => {
                contents.on('will-attach-webview', (event, webPreferences, params) => {
                    const isValidWebviewSource = (source) => {
                        if (!source) {
                            return false;
                        }
                        const uri = uri_1.URI.parse(source);
                        if (uri.scheme === network_1.Schemas.vscodeWebview) {
                            return uri.path === '/index.html' || uri.path === '/electron-browser-index.html';
                        }
                        const srcUri = uri.fsPath.toLowerCase();
                        const rootUri = uri_1.URI.file(this.environmentMainService.appRoot).fsPath.toLowerCase();
                        return srcUri.startsWith(rootUri + path_1.sep);
                    };
                    // Ensure defaults
                    delete webPreferences.preload;
                    webPreferences.nodeIntegration = false;
                    // Verify URLs being loaded
                    // https://github.com/electron/electron/issues/21553
                    if (isValidWebviewSource(params.src) && isValidWebviewSource(webPreferences.preloadURL)) {
                        return;
                    }
                    delete webPreferences.preloadURL; // https://github.com/electron/electron/issues/21553
                    // Otherwise prevent loading
                    this.logService.error('webContents#web-contents-created: Prevented webview attach');
                    event.preventDefault();
                });
                contents.on('will-navigate', event => {
                    this.logService.error('webContents#will-navigate: Prevented webcontent navigation');
                    event.preventDefault();
                });
                contents.on('new-window', (event, url) => {
                    var _a;
                    event.preventDefault(); // prevent code that wants to open links
                    (_a = this.nativeHostMainService) === null || _a === void 0 ? void 0 : _a.openExternal(undefined, url);
                });
                const isUrlFromWebview = (requestingUrl) => requestingUrl.startsWith(`${network_1.Schemas.vscodeWebview}://`);
                electron_1.session.defaultSession.setPermissionRequestHandler((_webContents, permission /* 'media' | 'geolocation' | 'notifications' | 'midiSysex' | 'pointerLock' | 'fullscreen' | 'openExternal' */, callback, details) => {
                    if (isUrlFromWebview(details.requestingUrl)) {
                        return callback(permission === 'clipboard-read');
                    }
                    return callback(false);
                });
                electron_1.session.defaultSession.setPermissionCheckHandler((_webContents, permission /* 'media' */, _origin, details) => {
                    if (isUrlFromWebview(details.requestingUrl)) {
                        return permission === 'clipboard-read';
                    }
                    return false;
                });
            });
            //#endregion
            let macOpenFileURIs = [];
            let runningTimeout = null;
            electron_1.app.on('open-file', (event, path) => {
                this.logService.trace('app#open-file: ', path);
                event.preventDefault();
                // Keep in array because more might come!
                macOpenFileURIs.push(this.getWindowOpenableFromPathSync(path));
                // Clear previous handler if any
                if (runningTimeout !== null) {
                    clearTimeout(runningTimeout);
                    runningTimeout = null;
                }
                // Handle paths delayed in case more are coming!
                runningTimeout = setTimeout(() => {
                    var _a;
                    (_a = this.windowsMainService) === null || _a === void 0 ? void 0 : _a.open({
                        context: 1 /* DOCK */ /* can also be opening from finder while app is running */,
                        cli: this.environmentMainService.args,
                        urisToOpen: macOpenFileURIs,
                        gotoLineMode: false,
                        preferNewWindow: true /* dropping on the dock or opening from finder prefers to open in a new window */
                    });
                    macOpenFileURIs = [];
                    runningTimeout = null;
                }, 100);
            });
            electron_1.app.on('new-window-for-tab', () => {
                var _a;
                (_a = this.windowsMainService) === null || _a === void 0 ? void 0 : _a.openEmptyWindow({ context: 4 /* DESKTOP */ }); //macOS native tab "+" button
            });
            //#region Bootstrap IPC Handlers
            let slowShellResolveWarningShown = false;
            electron_1.ipcMain.handle('vscode:fetchShellEnv', event => {
                return new Promise(async (resolve) => {
                    var _a;
                    // DO NOT remove: not only usual windows are fetching the
                    // shell environment but also shared process, issue reporter
                    // etc, so we need to reply via `webContents` always
                    const webContents = event.sender;
                    let replied = false;
                    function acceptShellEnv(env) {
                        clearTimeout(shellEnvSlowWarningHandle);
                        clearTimeout(shellEnvTimeoutErrorHandle);
                        if (!replied) {
                            replied = true;
                            if (!webContents.isDestroyed()) {
                                resolve(env);
                            }
                        }
                    }
                    // Handle slow shell environment resolve calls:
                    // - a warning after 3s but continue to resolve (only once in active window)
                    // - an error after 10s and stop trying to resolve (in every window where this happens)
                    const cts = new cancellation_1.CancellationTokenSource();
                    const shellEnvSlowWarningHandle = setTimeout(() => {
                        var _a;
                        if (!slowShellResolveWarningShown) {
                            (_a = this.windowsMainService) === null || _a === void 0 ? void 0 : _a.sendToFocused('vscode:showShellEnvSlowWarning', cts.token);
                            slowShellResolveWarningShown = true;
                        }
                    }, 3000);
                    const window = (_a = this.windowsMainService) === null || _a === void 0 ? void 0 : _a.getWindowByWebContents(event.sender); // Note: this can be `undefined` for the shared process!!
                    const shellEnvTimeoutErrorHandle = setTimeout(() => {
                        cts.dispose(true);
                        window === null || window === void 0 ? void 0 : window.sendWhenReady('vscode:showShellEnvTimeoutError', cancellation_1.CancellationToken.None);
                        acceptShellEnv({});
                    }, 10000);
                    // Prefer to use the args and env from the target window
                    // when resolving the shell env. It is possible that
                    // a first window was opened from the UI but a second
                    // from the CLI and that has implications for whether to
                    // resolve the shell environment or not.
                    //
                    // Window can be undefined for e.g. the shared process
                    // that is not part of our windows registry!
                    let args;
                    let env;
                    if (window === null || window === void 0 ? void 0 : window.config) {
                        args = window.config;
                        env = Object.assign(Object.assign({}, process.env), window.config.userEnv);
                    }
                    else {
                        args = this.environmentMainService.args;
                        env = process.env;
                    }
                    // Resolve shell env
                    const shellEnv = await (0, shellEnv_1.resolveShellEnv)(this.logService, args, env);
                    acceptShellEnv(shellEnv);
                });
            });
            electron_1.ipcMain.handle('vscode:writeNlsFile', (event, path, data) => {
                const uri = this.validateNlsPath([path]);
                if (!uri || typeof data !== 'string') {
                    throw new Error('Invalid operation (vscode:writeNlsFile)');
                }
                return this.fileService.writeFile(uri, buffer_1.VSBuffer.fromString(data));
            });
            electron_1.ipcMain.handle('vscode:readNlsFile', async (event, ...paths) => {
                const uri = this.validateNlsPath(paths);
                if (!uri) {
                    throw new Error('Invalid operation (vscode:readNlsFile)');
                }
                return (await this.fileService.readFile(uri)).value.toString();
            });
            electron_1.ipcMain.on('vscode:toggleDevTools', event => event.sender.toggleDevTools());
            electron_1.ipcMain.on('vscode:openDevTools', event => event.sender.openDevTools());
            electron_1.ipcMain.on('vscode:reloadWindow', event => event.sender.reload());
            //#endregion
        }
        validateNlsPath(pathSegments) {
            let path = undefined;
            for (const pathSegment of pathSegments) {
                if (typeof pathSegment === 'string') {
                    if (typeof path !== 'string') {
                        path = pathSegment;
                    }
                    else {
                        path = (0, path_1.join)(path, pathSegment);
                    }
                }
            }
            if (typeof path !== 'string' || !(0, path_1.isAbsolute)(path) || !(0, extpath_1.isEqualOrParent)(path, this.environmentMainService.cachedLanguagesPath, !platform_1.isLinux)) {
                return undefined;
            }
            return uri_1.URI.file(path);
        }
        onUnexpectedError(err) {
            var _a;
            if (err) {
                // take only the message and stack property
                const friendlyError = {
                    message: `[uncaught exception in main]: ${err.message}`,
                    stack: err.stack
                };
                // handle on client side
                (_a = this.windowsMainService) === null || _a === void 0 ? void 0 : _a.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
            }
            this.logService.error(`[uncaught exception in main]: ${err}`);
            if (err.stack) {
                this.logService.error(err.stack);
            }
        }
        async startup() {
            this.logService.debug('Starting VS Code');
            this.logService.debug(`from: ${this.environmentMainService.appRoot}`);
            this.logService.debug('args:', this.environmentMainService.args);
            // TODO@bpasero TODO@deepak1556 workaround for #120655
            try {
                const cachedDataPath = uri_1.URI.file(this.environmentMainService.chromeCachedDataDir);
                this.logService.trace(`Deleting Chrome cached data path: ${cachedDataPath.fsPath}`);
                await this.fileService.del(cachedDataPath, { recursive: true });
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
                    this.logService.error(error);
                }
            }
            // Make sure we associate the program with the app user model id
            // This will help Windows to associate the running program with
            // any shortcut that is pinned to the taskbar and prevent showing
            // two icons in the taskbar for the same app.
            const win32AppUserModelId = this.productService.win32AppUserModelId;
            if (platform_1.isWindows && win32AppUserModelId) {
                electron_1.app.setAppUserModelId(win32AppUserModelId);
            }
            // Fix native tabs on macOS 10.13
            // macOS enables a compatibility patch for any bundle ID beginning with
            // "com.microsoft.", which breaks native tabs for VS Code when using this
            // identifier (from the official build).
            // Explicitly opt out of the patch here before creating any windows.
            // See: https://github.com/microsoft/vscode/issues/35361#issuecomment-399794085
            try {
                if (platform_1.isMacintosh && this.configurationService.getValue('window.nativeTabs') === true && !electron_1.systemPreferences.getUserDefault('NSUseImprovedLayoutPass', 'boolean')) {
                    electron_1.systemPreferences.setUserDefault('NSUseImprovedLayoutPass', 'boolean', true);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            // Main process server (electron IPC based)
            const mainProcessElectronServer = new ipc_electron_1.Server();
            // Resolve unique machine ID
            this.logService.trace('Resolving machine identifier...');
            const machineId = await this.resolveMachineId();
            this.logService.trace(`Resolved machine identifier: ${machineId}`);
            // Shared process
            const { sharedProcess, sharedProcessReady, sharedProcessClient } = this.setupSharedProcess(machineId);
            // Services
            const appInstantiationService = await this.initServices(machineId, sharedProcess, sharedProcessReady);
            // Create driver
            if (this.environmentMainService.driverHandle) {
                const server = await (0, driver_1.serve)(mainProcessElectronServer, this.environmentMainService.driverHandle, this.environmentMainService, appInstantiationService);
                this.logService.info('Driver started at:', this.environmentMainService.driverHandle);
                this._register(server);
            }
            // Setup Auth Handler
            this._register(appInstantiationService.createInstance(auth_1.ProxyAuthHandler));
            // Init Channels
            appInstantiationService.invokeFunction(accessor => this.initChannels(accessor, mainProcessElectronServer, sharedProcessClient));
            // Open Windows
            const windows = appInstantiationService.invokeFunction(accessor => this.openFirstWindow(accessor, mainProcessElectronServer));
            // Post Open Windows Tasks
            appInstantiationService.invokeFunction(accessor => this.afterWindowOpen(accessor, sharedProcess));
            // Tracing: Stop tracing after windows are ready if enabled
            if (this.environmentMainService.args.trace) {
                appInstantiationService.invokeFunction(accessor => this.stopTracingEventually(accessor, windows));
            }
        }
        async resolveMachineId() {
            // We cache the machineId for faster lookups on startup
            // and resolve it only once initially if not cached or we need to replace the macOS iBridge device
            let machineId = this.stateService.getItem(telemetry_1.machineIdKey);
            if (!machineId || (platform_1.isMacintosh && machineId === '6c9d2bc8f91b89624add29c0abeae7fb42bf539fa1cdb2e3e57cd668fa9bcead')) {
                machineId = await (0, id_1.getMachineId)();
                this.stateService.setItem(telemetry_1.machineIdKey, machineId);
            }
            return machineId;
        }
        setupSharedProcess(machineId) {
            const sharedProcess = this._register(this.mainInstantiationService.createInstance(sharedProcess_1.SharedProcess, machineId, this.userEnv));
            const sharedProcessClient = (async () => {
                this.logService.trace('Main->SharedProcess#connect');
                const port = await sharedProcess.connect();
                this.logService.trace('Main->SharedProcess#connect: connection established');
                return new ipc_mp_1.Client(port, 'main');
            })();
            const sharedProcessReady = (async () => {
                await sharedProcess.whenReady();
                return sharedProcessClient;
            })();
            return { sharedProcess, sharedProcessReady, sharedProcessClient };
        }
        async initServices(machineId, sharedProcess, sharedProcessReady) {
            const services = new serviceCollection_1.ServiceCollection();
            // Update
            switch (process.platform) {
                case 'win32':
                    services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_win32_1.Win32UpdateService));
                    break;
                case 'linux':
                    if (platform_1.isLinuxSnap) {
                        services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_snap_1.SnapUpdateService, [process.env['SNAP'], process.env['SNAP_REVISION']]));
                    }
                    else {
                        services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_linux_1.LinuxUpdateService));
                    }
                    break;
                case 'darwin':
                    services.set(update_1.IUpdateService, new descriptors_1.SyncDescriptor(updateService_darwin_1.DarwinUpdateService));
                    break;
            }
            // Windows
            services.set(windows_1.IWindowsMainService, new descriptors_1.SyncDescriptor(windowsMainService_1.WindowsMainService, [machineId, this.userEnv]));
            // Dialogs
            services.set(dialogMainService_1.IDialogMainService, new descriptors_1.SyncDescriptor(dialogMainService_1.DialogMainService));
            // Launch
            services.set(launchMainService_1.ILaunchMainService, new descriptors_1.SyncDescriptor(launchMainService_1.LaunchMainService));
            // Diagnostics
            services.set(diagnostics_1.IDiagnosticsService, ipc_1.ProxyChannel.toService((0, ipc_1.getDelayedChannel)(sharedProcessReady.then(client => client.getChannel('diagnostics')))));
            // Issues
            services.set(issueMainService_1.IIssueMainService, new descriptors_1.SyncDescriptor(issueMainService_1.IssueMainService, [this.userEnv]));
            // Encryption
            services.set(encryptionMainService_1.IEncryptionMainService, new descriptors_1.SyncDescriptor(encryptionMainService_1.EncryptionMainService, [machineId]));
            // Keyboard Layout
            services.set(keyboardLayoutMainService_1.IKeyboardLayoutMainService, new descriptors_1.SyncDescriptor(keyboardLayoutMainService_1.KeyboardLayoutMainService));
            // Native Host
            services.set(nativeHostMainService_1.INativeHostMainService, new descriptors_1.SyncDescriptor(nativeHostMainService_1.NativeHostMainService, [sharedProcess]));
            // Webview Manager
            services.set(webviewManagerService_1.IWebviewManagerService, new descriptors_1.SyncDescriptor(webviewMainService_1.WebviewMainService));
            // Workspaces
            services.set(workspaces_1.IWorkspacesService, new descriptors_1.SyncDescriptor(workspacesMainService_1.WorkspacesMainService));
            services.set(workspacesManagementMainService_1.IWorkspacesManagementMainService, new descriptors_1.SyncDescriptor(workspacesManagementMainService_1.WorkspacesManagementMainService));
            services.set(workspacesHistoryMainService_1.IWorkspacesHistoryMainService, new descriptors_1.SyncDescriptor(workspacesHistoryMainService_1.WorkspacesHistoryMainService));
            // Menubar
            services.set(menubarMainService_1.IMenubarMainService, new descriptors_1.SyncDescriptor(menubarMainService_1.MenubarMainService));
            // Extension URL Trust
            services.set(extensionUrlTrust_1.IExtensionUrlTrustService, new descriptors_1.SyncDescriptor(extensionUrlTrustService_1.ExtensionUrlTrustService));
            // Storage
            services.set(storageMainService_1.IStorageMainService, new descriptors_1.SyncDescriptor(storageMainService_1.StorageMainService));
            // Backups
            const backupMainService = new backupMainService_1.BackupMainService(this.environmentMainService, this.configurationService, this.logService);
            services.set(backup_1.IBackupMainService, backupMainService);
            // URL handling
            services.set(url_1.IURLService, new descriptors_1.SyncDescriptor(urlService_1.NativeURLService));
            // Telemetry
            if (!this.environmentMainService.isExtensionDevelopment && !this.environmentMainService.args['disable-telemetry'] && !!this.productService.enableTelemetry) {
                const channel = (0, ipc_1.getDelayedChannel)(sharedProcessReady.then(client => client.getChannel('telemetryAppender')));
                const appender = new telemetryIpc_1.TelemetryAppenderClient(channel);
                const commonProperties = (0, commonProperties_1.resolveCommonProperties)(this.fileService, (0, os_1.release)(), (0, os_1.hostname)(), process.arch, this.productService.commit, this.productService.version, machineId, this.productService.msftInternalDomains, this.environmentMainService.installSourcePath);
                const piiPaths = [this.environmentMainService.appRoot, this.environmentMainService.extensionsPath];
                const config = { appender, commonProperties, piiPaths, sendErrorTelemetry: true };
                services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, [config]));
            }
            else {
                services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            }
            // Init services that require it
            await backupMainService.initialize();
            return this.mainInstantiationService.createChild(services);
        }
        initChannels(accessor, mainProcessElectronServer, sharedProcessClient) {
            // Launch: this one is explicitly registered to the node.js
            // server because when a second instance starts up, that is
            // the only possible connection between the first and the
            // second instance. Electron IPC does not work across apps.
            const launchChannel = ipc_1.ProxyChannel.fromService(accessor.get(launchMainService_1.ILaunchMainService), { disableMarshalling: true });
            this.mainProcessNodeIpcServer.registerChannel('launch', launchChannel);
            // Update
            const updateChannel = new updateIpc_1.UpdateChannel(accessor.get(update_1.IUpdateService));
            mainProcessElectronServer.registerChannel('update', updateChannel);
            // Issues
            const issueChannel = ipc_1.ProxyChannel.fromService(accessor.get(issueMainService_1.IIssueMainService));
            mainProcessElectronServer.registerChannel('issue', issueChannel);
            // Encryption
            const encryptionChannel = ipc_1.ProxyChannel.fromService(accessor.get(encryptionMainService_1.IEncryptionMainService));
            mainProcessElectronServer.registerChannel('encryption', encryptionChannel);
            // Signing
            const signChannel = ipc_1.ProxyChannel.fromService(accessor.get(sign_1.ISignService));
            mainProcessElectronServer.registerChannel('sign', signChannel);
            // Keyboard Layout
            const keyboardLayoutChannel = ipc_1.ProxyChannel.fromService(accessor.get(keyboardLayoutMainService_1.IKeyboardLayoutMainService));
            mainProcessElectronServer.registerChannel('keyboardLayout', keyboardLayoutChannel);
            // Native host (main & shared process)
            this.nativeHostMainService = accessor.get(nativeHostMainService_1.INativeHostMainService);
            const nativeHostChannel = ipc_1.ProxyChannel.fromService(this.nativeHostMainService);
            mainProcessElectronServer.registerChannel('nativeHost', nativeHostChannel);
            sharedProcessClient.then(client => client.registerChannel('nativeHost', nativeHostChannel));
            // Workspaces
            const workspacesChannel = ipc_1.ProxyChannel.fromService(accessor.get(workspaces_1.IWorkspacesService));
            mainProcessElectronServer.registerChannel('workspaces', workspacesChannel);
            // Menubar
            const menubarChannel = ipc_1.ProxyChannel.fromService(accessor.get(menubarMainService_1.IMenubarMainService));
            mainProcessElectronServer.registerChannel('menubar', menubarChannel);
            // URL handling
            const urlChannel = ipc_1.ProxyChannel.fromService(accessor.get(url_1.IURLService));
            mainProcessElectronServer.registerChannel('url', urlChannel);
            // Extension URL Trust
            const extensionUrlTrustChannel = ipc_1.ProxyChannel.fromService(accessor.get(extensionUrlTrust_1.IExtensionUrlTrustService));
            mainProcessElectronServer.registerChannel('extensionUrlTrust', extensionUrlTrustChannel);
            // Webview Manager
            const webviewChannel = ipc_1.ProxyChannel.fromService(accessor.get(webviewManagerService_1.IWebviewManagerService));
            mainProcessElectronServer.registerChannel('webview', webviewChannel);
            // Storage (main & shared process)
            const storageChannel = this._register(new storageIpc_1.StorageDatabaseChannel(this.logService, accessor.get(storageMainService_1.IStorageMainService)));
            mainProcessElectronServer.registerChannel('storage', storageChannel);
            sharedProcessClient.then(client => client.registerChannel('storage', storageChannel));
            // Log Level (main & shared process)
            const logLevelChannel = new logIpc_1.LogLevelChannel(accessor.get(log_1.ILogService));
            mainProcessElectronServer.registerChannel('logLevel', logLevelChannel);
            sharedProcessClient.then(client => client.registerChannel('logLevel', logLevelChannel));
            // Logger
            const loggerChannel = new logIpc_1.LoggerChannel(accessor.get(log_1.ILoggerService));
            mainProcessElectronServer.registerChannel('logger', loggerChannel);
            sharedProcessClient.then(client => client.registerChannel('logger', loggerChannel));
            // Extension Host Debug Broadcasting
            const electronExtensionHostDebugBroadcastChannel = new extensionHostDebugIpc_1.ElectronExtensionHostDebugBroadcastChannel(accessor.get(windows_1.IWindowsMainService));
            mainProcessElectronServer.registerChannel('extensionhostdebugservice', electronExtensionHostDebugBroadcastChannel);
        }
        openFirstWindow(accessor, mainProcessElectronServer) {
            const windowsMainService = this.windowsMainService = accessor.get(windows_1.IWindowsMainService);
            const urlService = accessor.get(url_1.IURLService);
            const nativeHostMainService = accessor.get(nativeHostMainService_1.INativeHostMainService);
            // Signal phase: ready (services set)
            this.lifecycleMainService.phase = 2 /* Ready */;
            // Check for initial URLs to handle from protocol link invocations
            const pendingWindowOpenablesFromProtocolLinks = [];
            const pendingProtocolLinksToHandle = [
                // Windows/Linux: protocol handler invokes CLI with --open-url
                ...this.environmentMainService.args['open-url'] ? this.environmentMainService.args._urls || [] : [],
                // macOS: open-url events
                ...(global.getOpenUrls() || [])
            ].map(url => {
                try {
                    return { uri: uri_1.URI.parse(url), url };
                }
                catch (_a) {
                    return null;
                }
            }).filter((obj) => {
                if (!obj) {
                    return false;
                }
                // If URI should be blocked, filter it out
                if (this.shouldBlockURI(obj.uri)) {
                    return false;
                }
                // Filter out any protocol link that wants to open as window so that
                // we open the right set of windows on startup and not restore the
                // previous workspace too.
                const windowOpenable = this.getWindowOpenableFromProtocolLink(obj.uri);
                if (windowOpenable) {
                    pendingWindowOpenablesFromProtocolLinks.push(windowOpenable);
                    return false;
                }
                return true;
            });
            // Create a URL handler to open file URIs in the active window
            // or open new windows. The URL handler will be invoked from
            // protocol invocations outside of VSCode.
            const app = this;
            const environmentService = this.environmentMainService;
            urlService.registerHandler({
                async handleURL(uri, options) {
                    // If URI should be blocked, behave as if it's handled
                    if (app.shouldBlockURI(uri)) {
                        return true;
                    }
                    // Check for URIs to open in window
                    const windowOpenableFromProtocolLink = app.getWindowOpenableFromProtocolLink(uri);
                    if (windowOpenableFromProtocolLink) {
                        const [window] = windowsMainService.open({
                            context: 5 /* API */,
                            cli: Object.assign({}, environmentService.args),
                            urisToOpen: [windowOpenableFromProtocolLink],
                            gotoLineMode: true
                            /* remoteAuthority will be determined based on windowOpenableFromProtocolLink */
                        });
                        window.focus(); // this should help ensuring that the right window gets focus when multiple are opened
                        return true;
                    }
                    // If we have not yet handled the URI and we have no window opened (macOS only)
                    // we first open a window and then try to open that URI within that window
                    if (platform_1.isMacintosh && windowsMainService.getWindowCount() === 0) {
                        const [window] = windowsMainService.open({
                            context: 5 /* API */,
                            cli: Object.assign({}, environmentService.args),
                            forceEmpty: true,
                            gotoLineMode: true,
                            remoteAuthority: (0, remoteHosts_1.getRemoteAuthority)(uri)
                        });
                        await window.ready();
                        return urlService.open(uri, options);
                    }
                    return false;
                }
            });
            // Create a URL handler which forwards to the last active window
            const activeWindowManager = this._register(new windowTracker_1.ActiveWindowManager({
                onDidOpenWindow: nativeHostMainService.onDidOpenWindow,
                onDidFocusWindow: nativeHostMainService.onDidFocusWindow,
                getActiveWindowId: () => nativeHostMainService.getActiveWindowId(-1)
            }));
            const activeWindowRouter = new ipc_1.StaticRouter(ctx => activeWindowManager.getActiveClientId().then(id => ctx === id));
            const urlHandlerRouter = new urlIpc_1.URLHandlerRouter(activeWindowRouter);
            const urlHandlerChannel = mainProcessElectronServer.getChannel('urlHandler', urlHandlerRouter);
            urlService.registerHandler(new urlIpc_1.URLHandlerChannelClient(urlHandlerChannel));
            // Watch Electron URLs and forward them to the UrlService
            this._register(new electronUrlListener_1.ElectronURLListener(pendingProtocolLinksToHandle, urlService, windowsMainService, this.environmentMainService, this.productService));
            // Open our first window
            const args = this.environmentMainService.args;
            const macOpenFiles = global.macOpenFiles;
            const context = (0, argvHelper_1.isLaunchedFromCli)(process.env) ? 0 /* CLI */ : 4 /* DESKTOP */;
            const hasCliArgs = args._.length;
            const hasFolderURIs = !!args['folder-uri'];
            const hasFileURIs = !!args['file-uri'];
            const noRecentEntry = args['skip-add-to-recently-opened'] === true;
            const waitMarkerFileURI = args.wait && args.waitMarkerFilePath ? uri_1.URI.file(args.waitMarkerFilePath) : undefined;
            const remoteAuthority = args.remote || undefined;
            // check for a pending window to open from URI
            // e.g. when running code with --open-uri from
            // a protocol handler
            if (pendingWindowOpenablesFromProtocolLinks.length > 0) {
                return windowsMainService.open({
                    context,
                    cli: args,
                    urisToOpen: pendingWindowOpenablesFromProtocolLinks,
                    gotoLineMode: true,
                    initialStartup: true
                    /* remoteAuthority will be determined based on pendingWindowOpenablesFromProtocolLinks */
                });
            }
            // new window if "-n"
            if (args['new-window'] && !hasCliArgs && !hasFolderURIs && !hasFileURIs) {
                return windowsMainService.open({
                    context,
                    cli: args,
                    forceNewWindow: true,
                    forceEmpty: true,
                    noRecentEntry,
                    waitMarkerFileURI,
                    initialStartup: true,
                    remoteAuthority
                });
            }
            // mac: open-file event received on startup
            if (macOpenFiles.length && !hasCliArgs && !hasFolderURIs && !hasFileURIs) {
                return windowsMainService.open({
                    context: 1 /* DOCK */,
                    cli: args,
                    urisToOpen: macOpenFiles.map(file => this.getWindowOpenableFromPathSync(file)),
                    noRecentEntry,
                    waitMarkerFileURI,
                    initialStartup: true,
                    /* remoteAuthority will be determined based on macOpenFiles */
                });
            }
            // default: read paths from cli
            return windowsMainService.open({
                context,
                cli: args,
                forceNewWindow: args['new-window'] || (!hasCliArgs && args['unity-launch']),
                diffMode: args.diff,
                noRecentEntry,
                waitMarkerFileURI,
                gotoLineMode: args.goto,
                initialStartup: true,
                remoteAuthority
            });
        }
        shouldBlockURI(uri) {
            if (uri.authority === network_1.Schemas.file && platform_1.isWindows) {
                const res = electron_1.dialog.showMessageBoxSync({
                    title: this.productService.nameLong,
                    type: 'question',
                    buttons: [
                        (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)(0, null)),
                        (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)(1, null)),
                    ],
                    cancelId: 1,
                    message: (0, nls_1.localize)(2, null, (0, labels_1.getPathLabel)(uri.fsPath, this.environmentMainService), this.productService.nameShort),
                    detail: (0, nls_1.localize)(3, null),
                    noLink: true
                });
                if (res === 1) {
                    return true;
                }
            }
            return false;
        }
        getWindowOpenableFromProtocolLink(uri) {
            if (!uri.path) {
                return undefined;
            }
            // File path
            if (uri.authority === network_1.Schemas.file) {
                // we configure as fileUri, but later validation will
                // make sure to open as folder or workspace if possible
                return { fileUri: uri_1.URI.file(uri.fsPath) };
            }
            // Remote path
            else if (uri.authority === network_1.Schemas.vscodeRemote) {
                // Example conversion:
                // From: vscode://vscode-remote/wsl+ubuntu/mnt/c/GitDevelopment/monaco
                //   To: vscode-remote://wsl+ubuntu/mnt/c/GitDevelopment/monaco
                const secondSlash = uri.path.indexOf(path_1.posix.sep, 1 /* skip over the leading slash */);
                if (secondSlash !== -1) {
                    const authority = uri.path.substring(1, secondSlash);
                    const path = uri.path.substring(secondSlash);
                    const remoteUri = uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, authority, path, query: uri.query, fragment: uri.fragment });
                    if ((0, workspaces_1.hasWorkspaceFileExtension)(path)) {
                        return { workspaceUri: remoteUri };
                    }
                    else if (/:[\d]+$/.test(path)) { // path with :line:column syntax
                        return { fileUri: remoteUri };
                    }
                    else {
                        return { folderUri: remoteUri };
                    }
                }
            }
            return undefined;
        }
        getWindowOpenableFromPathSync(path) {
            try {
                const fileStat = (0, fs_1.statSync)(path);
                if (fileStat.isDirectory()) {
                    return { folderUri: uri_1.URI.file(path) };
                }
                if ((0, workspaces_1.hasWorkspaceFileExtension)(path)) {
                    return { workspaceUri: uri_1.URI.file(path) };
                }
            }
            catch (error) {
                // ignore errors
            }
            return { fileUri: uri_1.URI.file(path) };
        }
        async afterWindowOpen(accessor, sharedProcess) {
            var _a;
            // Signal phase: after window open
            this.lifecycleMainService.phase = 3 /* AfterWindowOpen */;
            // Observe shared process for errors
            let willShutdown = false;
            (0, functional_1.once)(this.lifecycleMainService.onWillShutdown)(() => willShutdown = true);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            this._register(sharedProcess.onDidError(({ type, details }) => {
                // Logging
                let message;
                if (typeof details === 'string') {
                    message = details;
                }
                else {
                    message = `SharedProcess: crashed (detail: ${details.reason})`;
                }
                (0, errors_1.onUnexpectedError)(new Error(message));
                telemetryService.publicLog2('sharedprocesserror', {
                    type,
                    reason: typeof details !== 'string' ? details === null || details === void 0 ? void 0 : details.reason : undefined,
                    visible: sharedProcess.isVisible(),
                    shuttingdown: willShutdown
                });
            }));
            // Windows: install mutex
            const win32MutexName = this.productService.win32MutexName;
            if (platform_1.isWindows && win32MutexName) {
                try {
                    const WindowsMutex = require.__$__nodeRequire('windows-mutex').Mutex;
                    const mutex = new WindowsMutex(win32MutexName);
                    (0, functional_1.once)(this.lifecycleMainService.onWillShutdown)(() => mutex.release());
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            // Remote Authorities
            electron_1.protocol.registerHttpProtocol(network_1.Schemas.vscodeRemoteResource, (request, callback) => {
                callback({
                    url: request.url.replace(/^vscode-remote-resource:/, 'http:'),
                    method: request.method
                });
            });
            // Initialize update service
            const updateService = accessor.get(update_1.IUpdateService);
            if (updateService instanceof updateService_win32_1.Win32UpdateService || updateService instanceof updateService_linux_1.LinuxUpdateService || updateService instanceof updateService_darwin_1.DarwinUpdateService) {
                updateService.initialize();
            }
            // Start to fetch shell environment (if needed) after window has opened
            (0, shellEnv_1.resolveShellEnv)(this.logService, this.environmentMainService.args, process.env);
            // If enable-crash-reporter argv is undefined then this is a fresh start,
            // based on telemetry.enableCrashreporter settings, generate a UUID which
            // will be used as crash reporter id and also update the json file.
            try {
                const argvContent = await this.fileService.readFile(this.environmentMainService.argvResource);
                const argvString = argvContent.value.toString();
                const argvJSON = JSON.parse((0, json_1.stripComments)(argvString));
                if (argvJSON['enable-crash-reporter'] === undefined) {
                    const enableCrashReporter = (_a = this.configurationService.getValue('telemetry.enableCrashReporter')) !== null && _a !== void 0 ? _a : true;
                    const additionalArgvContent = [
                        '',
                        '	// Allows to disable crash reporting.',
                        '	// Should restart the app if the value is changed.',
                        `	"enable-crash-reporter": ${enableCrashReporter},`,
                        '',
                        '	// Unique id used for correlating crash reports sent from this instance.',
                        '	// Do not edit this value.',
                        `	"crash-reporter-id": "${(0, uuid_1.generateUuid)()}"`,
                        '}'
                    ];
                    const newArgvString = argvString.substring(0, argvString.length - 2).concat(',\n', additionalArgvContent.join('\n'));
                    await this.fileService.writeFile(this.environmentMainService.argvResource, buffer_1.VSBuffer.fromString(newArgvString));
                }
            }
            catch (error) {
                this.logService.error(error);
            }
        }
        stopTracingEventually(accessor, windows) {
            this.logService.info(`Tracing: waiting for windows to get ready...`);
            const dialogMainService = accessor.get(dialogMainService_1.IDialogMainService);
            let recordingStopped = false;
            const stopRecording = async (timeout) => {
                if (recordingStopped) {
                    return;
                }
                recordingStopped = true; // only once
                const path = await electron_1.contentTracing.stopRecording((0, resources_1.joinPath)(this.environmentMainService.userHome, `${this.productService.applicationName}-${Math.random().toString(16).slice(-4)}.trace.txt`).fsPath);
                if (!timeout) {
                    dialogMainService.showMessageBox({
                        type: 'info',
                        message: (0, nls_1.localize)(4, null),
                        detail: (0, nls_1.localize)(5, null, path),
                        buttons: [(0, nls_1.localize)(6, null)]
                    }, (0, types_1.withNullAsUndefined)(electron_1.BrowserWindow.getFocusedWindow()));
                }
                else {
                    this.logService.info(`Tracing: data recorded (after 30s timeout) to ${path}`);
                }
            };
            // Wait up to 30s before creating the trace anyways
            const timeoutHandle = setTimeout(() => stopRecording(true), 30000);
            // Wait for all windows to get ready and stop tracing then
            Promise.all(windows.map(window => window.ready())).then(() => {
                clearTimeout(timeoutHandle);
                stopRecording(false);
            });
        }
    };
    CodeApplication = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, log_1.ILogService),
        __param(4, environmentMainService_1.IEnvironmentMainService),
        __param(5, lifecycleMainService_1.ILifecycleMainService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, state_1.IStateService),
        __param(8, files_1.IFileService),
        __param(9, productService_1.IProductService)
    ], CodeApplication);
    exports.CodeApplication = CodeApplication;
});
//# sourceMappingURL=app.js.map