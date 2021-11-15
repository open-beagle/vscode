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
define(["require", "exports", "vs/base/common/event", "vs/platform/windows/electron-main/windows", "electron", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/base/common/platform", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/dialogs/electron-main/dialogMainService", "vs/base/node/pfs", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "os", "vs/base/node/id", "vs/platform/log/common/log", "vs/base/common/path", "vs/platform/product/common/productService", "vs/base/common/decorators", "vs/base/common/lifecycle"], function (require, exports, event_1, windows_1, electron_1, lifecycleMainService_1, platform_1, environmentMainService_1, dialogMainService_1, pfs_1, uri_1, telemetry_1, instantiation_1, os_1, id_1, log_1, path_1, productService_1, decorators_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeHostMainService = exports.INativeHostMainService = void 0;
    exports.INativeHostMainService = (0, instantiation_1.createDecorator)('nativeHostMainService');
    let NativeHostMainService = class NativeHostMainService extends lifecycle_1.Disposable {
        constructor(sharedProcess, windowsMainService, dialogMainService, lifecycleMainService, environmentMainService, telemetryService, logService, productService) {
            super();
            this.sharedProcess = sharedProcess;
            this.windowsMainService = windowsMainService;
            this.dialogMainService = dialogMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.environmentMainService = environmentMainService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.productService = productService;
            //#endregion
            //#region Events
            this.onDidOpenWindow = event_1.Event.map(this.windowsMainService.onDidOpenWindow, window => window.id);
            this.onDidMaximizeWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-maximize', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onDidUnmaximizeWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-unmaximize', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onDidBlurWindow = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-blur', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onDidFocusWindow = event_1.Event.any(event_1.Event.map(event_1.Event.filter(event_1.Event.map(this.windowsMainService.onDidChangeWindowsCount, () => this.windowsMainService.getLastActiveWindow()), window => !!window), window => window.id), event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-focus', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId)));
            this.onDidResumeOS = event_1.Event.fromNodeEventEmitter(electron_1.powerMonitor, 'resume');
            this._onDidChangeColorScheme = this._register(new event_1.Emitter());
            this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
            this._onDidChangePassword = this._register(new event_1.Emitter());
            this.onDidChangePassword = this._onDidChangePassword.event;
            this.onDidChangeDisplay = event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-metrics-changed', (event, display, changedMetrics) => changedMetrics), changedMetrics => {
                // Electron will emit 'display-metrics-changed' events even when actually
                // going fullscreen, because the dock hides. However, we do not want to
                // react on this event as there is no change in display bounds.
                return !(Array.isArray(changedMetrics) && changedMetrics.length === 1 && changedMetrics[0] === 'workArea');
            }), event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-added'), event_1.Event.fromNodeEventEmitter(electron_1.screen, 'display-removed')), () => { }, 100);
            this.registerListeners();
        }
        registerListeners() {
            // Color Scheme changes
            electron_1.nativeTheme.on('updated', () => {
                this._onDidChangeColorScheme.fire({
                    highContrast: electron_1.nativeTheme.shouldUseInvertedColorScheme || electron_1.nativeTheme.shouldUseHighContrastColors,
                    dark: electron_1.nativeTheme.shouldUseDarkColors
                });
            });
        }
        //#region Properties
        get windowId() { throw new Error('Not implemented in electron-main'); }
        //#endregion
        //#region Window
        async getWindows() {
            const windows = this.windowsMainService.getWindows();
            return windows.map(window => {
                var _a, _b;
                return ({
                    id: window.id,
                    workspace: window.openedWorkspace,
                    title: (_b = (_a = window.win) === null || _a === void 0 ? void 0 : _a.getTitle()) !== null && _b !== void 0 ? _b : '',
                    filename: window.getRepresentedFilename(),
                    dirty: window.isDocumentEdited()
                });
            });
        }
        async getWindowCount(windowId) {
            return this.windowsMainService.getWindowCount();
        }
        async getActiveWindowId(windowId) {
            const activeWindow = electron_1.BrowserWindow.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
            if (activeWindow) {
                return activeWindow.id;
            }
            return undefined;
        }
        openWindow(windowId, arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.doOpenWindow(windowId, arg1, arg2);
            }
            return this.doOpenEmptyWindow(windowId, arg1);
        }
        async doOpenWindow(windowId, toOpen, options = Object.create(null)) {
            if (toOpen.length > 0) {
                this.windowsMainService.open({
                    context: 5 /* API */,
                    contextWindowId: windowId,
                    urisToOpen: toOpen,
                    cli: this.environmentMainService.args,
                    forceNewWindow: options.forceNewWindow,
                    forceReuseWindow: options.forceReuseWindow,
                    preferNewWindow: options.preferNewWindow,
                    diffMode: options.diffMode,
                    addMode: options.addMode,
                    gotoLineMode: options.gotoLineMode,
                    noRecentEntry: options.noRecentEntry,
                    waitMarkerFileURI: options.waitMarkerFileURI,
                    remoteAuthority: options.remoteAuthority || undefined
                });
            }
        }
        async doOpenEmptyWindow(windowId, options) {
            this.windowsMainService.openEmptyWindow({
                context: 5 /* API */,
                contextWindowId: windowId
            }, options);
        }
        async toggleFullScreen(windowId) {
            const window = this.windowById(windowId);
            if (window) {
                window.toggleFullScreen();
            }
        }
        async handleTitleDoubleClick(windowId) {
            const window = this.windowById(windowId);
            if (window) {
                window.handleTitleDoubleClick();
            }
        }
        async isMaximized(windowId) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                return window.win.isMaximized();
            }
            return false;
        }
        async maximizeWindow(windowId) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                window.win.maximize();
            }
        }
        async unmaximizeWindow(windowId) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                window.win.unmaximize();
            }
        }
        async minimizeWindow(windowId) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                window.win.minimize();
            }
        }
        async focusWindow(windowId, options) {
            var _a;
            if (options && typeof options.windowId === 'number') {
                windowId = options.windowId;
            }
            const window = this.windowById(windowId);
            if (window) {
                window.focus({ force: (_a = options === null || options === void 0 ? void 0 : options.force) !== null && _a !== void 0 ? _a : false });
            }
        }
        async setMinimumSize(windowId, width, height) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                const [windowWidth, windowHeight] = window.win.getSize();
                const [minWindowWidth, minWindowHeight] = window.win.getMinimumSize();
                const [newMinWindowWidth, newMinWindowHeight] = [width !== null && width !== void 0 ? width : minWindowWidth, height !== null && height !== void 0 ? height : minWindowHeight];
                const [newWindowWidth, newWindowHeight] = [Math.max(windowWidth, newMinWindowWidth), Math.max(windowHeight, newMinWindowHeight)];
                if (minWindowWidth !== newMinWindowWidth || minWindowHeight !== newMinWindowHeight) {
                    window.win.setMinimumSize(newMinWindowWidth, newMinWindowHeight);
                }
                if (windowWidth !== newWindowWidth || windowHeight !== newWindowHeight) {
                    window.win.setSize(newWindowWidth, newWindowHeight);
                }
            }
        }
        //#endregion
        //#region Dialog
        async showMessageBox(windowId, options) {
            return this.dialogMainService.showMessageBox(options, this.toBrowserWindow(windowId));
        }
        async showSaveDialog(windowId, options) {
            return this.dialogMainService.showSaveDialog(options, this.toBrowserWindow(windowId));
        }
        async showOpenDialog(windowId, options) {
            return this.dialogMainService.showOpenDialog(options, this.toBrowserWindow(windowId));
        }
        toBrowserWindow(windowId) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                return window.win;
            }
            return undefined;
        }
        async pickFileFolderAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFileFolder(options);
            if (paths) {
                this.sendPickerTelemetry(paths, options.telemetryEventName || 'openFileFolder', options.telemetryExtraData);
                this.doOpenPicked(await Promise.all(paths.map(async (path) => (await pfs_1.SymlinkSupport.existsDirectory(path)) ? { folderUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFolderAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFolder(options);
            if (paths) {
                this.sendPickerTelemetry(paths, options.telemetryEventName || 'openFolder', options.telemetryExtraData);
                this.doOpenPicked(paths.map(path => ({ folderUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickFileAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickFile(options);
            if (paths) {
                this.sendPickerTelemetry(paths, options.telemetryEventName || 'openFile', options.telemetryExtraData);
                this.doOpenPicked(paths.map(path => ({ fileUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        async pickWorkspaceAndOpen(windowId, options) {
            const paths = await this.dialogMainService.pickWorkspace(options);
            if (paths) {
                this.sendPickerTelemetry(paths, options.telemetryEventName || 'openWorkspace', options.telemetryExtraData);
                this.doOpenPicked(paths.map(path => ({ workspaceUri: uri_1.URI.file(path) })), options, windowId);
            }
        }
        doOpenPicked(openable, options, windowId) {
            this.windowsMainService.open({
                context: 3 /* DIALOG */,
                contextWindowId: windowId,
                cli: this.environmentMainService.args,
                urisToOpen: openable,
                forceNewWindow: options.forceNewWindow,
                /* remoteAuthority will be determined based on openable */
            });
        }
        sendPickerTelemetry(paths, telemetryEventName, telemetryExtraData) {
            const numberOfPaths = paths ? paths.length : 0;
            // Telemetry
            // __GDPR__TODO__ Dynamic event names and dynamic properties. Can not be registered statically.
            this.telemetryService.publicLog(telemetryEventName, Object.assign(Object.assign({}, telemetryExtraData), { outcome: numberOfPaths ? 'success' : 'canceled', numberOfPaths }));
        }
        //#endregion
        //#region OS
        async showItemInFolder(windowId, path) {
            electron_1.shell.showItemInFolder(path);
        }
        async setRepresentedFilename(windowId, path) {
            const window = this.windowById(windowId);
            if (window) {
                window.setRepresentedFilename(path);
            }
        }
        async setDocumentEdited(windowId, edited) {
            const window = this.windowById(windowId);
            if (window) {
                window.setDocumentEdited(edited);
            }
        }
        async openExternal(windowId, url) {
            if (platform_1.isLinuxSnap) {
                this.safeSnapOpenExternal(url);
            }
            else {
                electron_1.shell.openExternal(url);
            }
            return true;
        }
        safeSnapOpenExternal(url) {
            // Remove some environment variables before opening to avoid issues...
            const gdkPixbufModuleFile = process.env['GDK_PIXBUF_MODULE_FILE'];
            const gdkPixbufModuleDir = process.env['GDK_PIXBUF_MODULEDIR'];
            delete process.env['GDK_PIXBUF_MODULE_FILE'];
            delete process.env['GDK_PIXBUF_MODULEDIR'];
            electron_1.shell.openExternal(url);
            // ...but restore them after
            process.env['GDK_PIXBUF_MODULE_FILE'] = gdkPixbufModuleFile;
            process.env['GDK_PIXBUF_MODULEDIR'] = gdkPixbufModuleDir;
        }
        async moveItemToTrash(windowId, fullPath) {
            return electron_1.shell.moveItemToTrash(fullPath);
        }
        async isAdmin() {
            let isAdmin;
            if (platform_1.isWindows) {
                isAdmin = (await new Promise((resolve_1, reject_1) => { require(['native-is-elevated'], resolve_1, reject_1); }))();
            }
            else {
                isAdmin = process.getuid() === 0;
            }
            return isAdmin;
        }
        async writeElevated(windowId, source, target, options) {
            const sudoPrompt = await new Promise((resolve_2, reject_2) => { require(['sudo-prompt'], resolve_2, reject_2); });
            return new Promise((resolve, reject) => {
                const sudoCommand = [`"${this.cliPath}"`];
                if (options === null || options === void 0 ? void 0 : options.unlock) {
                    sudoCommand.push('--file-chmod');
                }
                sudoCommand.push('--file-write', `"${source.fsPath}"`, `"${target.fsPath}"`);
                const promptOptions = {
                    name: this.productService.nameLong.replace('-', ''),
                    icns: (platform_1.isMacintosh && this.environmentMainService.isBuilt) ? (0, path_1.join)((0, path_1.dirname)(this.environmentMainService.appRoot), `${this.productService.nameShort}.icns`) : undefined
                };
                sudoPrompt.exec(sudoCommand.join(' '), promptOptions, (error, stdout, stderr) => {
                    if (stdout) {
                        this.logService.trace(`[sudo-prompt] received stdout: ${stdout}`);
                    }
                    if (stderr) {
                        this.logService.trace(`[sudo-prompt] received stderr: ${stderr}`);
                    }
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(undefined);
                    }
                });
            });
        }
        get cliPath() {
            // Windows
            if (platform_1.isWindows) {
                if (this.environmentMainService.isBuilt) {
                    return (0, path_1.join)((0, path_1.dirname)(process.execPath), 'bin', `${this.productService.applicationName}.cmd`);
                }
                return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.bat');
            }
            // Linux
            if (platform_1.isLinux) {
                if (this.environmentMainService.isBuilt) {
                    return (0, path_1.join)((0, path_1.dirname)(process.execPath), 'bin', `${this.productService.applicationName}`);
                }
                return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
            }
            // macOS
            if (this.environmentMainService.isBuilt) {
                return (0, path_1.join)(this.environmentMainService.appRoot, 'bin', 'code');
            }
            return (0, path_1.join)(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
        }
        async getOSStatistics() {
            return {
                totalmem: (0, os_1.totalmem)(),
                freemem: (0, os_1.freemem)(),
                loadavg: (0, os_1.loadavg)()
            };
        }
        async getOSProperties() {
            return {
                arch: (0, os_1.arch)(),
                platform: (0, os_1.platform)(),
                release: (0, os_1.release)(),
                type: (0, os_1.type)(),
                cpus: (0, os_1.cpus)()
            };
        }
        async getOSVirtualMachineHint() {
            return id_1.virtualMachineHint.value();
        }
        //#endregion
        //#region Process
        async killProcess(windowId, pid, code) {
            process.kill(pid, code);
        }
        //#endregion
        //#region Clipboard
        async readClipboardText(windowId, type) {
            return electron_1.clipboard.readText(type);
        }
        async writeClipboardText(windowId, text, type) {
            return electron_1.clipboard.writeText(text, type);
        }
        async readClipboardFindText(windowId) {
            return electron_1.clipboard.readFindText();
        }
        async writeClipboardFindText(windowId, text) {
            return electron_1.clipboard.writeFindText(text);
        }
        async writeClipboardBuffer(windowId, format, buffer, type) {
            return electron_1.clipboard.writeBuffer(format, Buffer.from(buffer), type);
        }
        async readClipboardBuffer(windowId, format) {
            return electron_1.clipboard.readBuffer(format);
        }
        async hasClipboard(windowId, format, type) {
            return electron_1.clipboard.has(format, type);
        }
        //#endregion
        //#region macOS Touchbar
        async newWindowTab() {
            this.windowsMainService.open({ context: 5 /* API */, cli: this.environmentMainService.args, forceNewTabbedWindow: true, forceEmpty: true, remoteAuthority: this.environmentMainService.args.remote || undefined });
        }
        async showPreviousWindowTab() {
            electron_1.Menu.sendActionToFirstResponder('selectPreviousTab:');
        }
        async showNextWindowTab() {
            electron_1.Menu.sendActionToFirstResponder('selectNextTab:');
        }
        async moveWindowTabToNewWindow() {
            electron_1.Menu.sendActionToFirstResponder('moveTabToNewWindow:');
        }
        async mergeAllWindowTabs() {
            electron_1.Menu.sendActionToFirstResponder('mergeAllWindows:');
        }
        async toggleWindowTabsBar() {
            electron_1.Menu.sendActionToFirstResponder('toggleTabBar:');
        }
        async updateTouchBar(windowId, items) {
            const window = this.windowById(windowId);
            if (window) {
                window.updateTouchBar(items);
            }
        }
        //#endregion
        //#region Lifecycle
        async notifyReady(windowId) {
            const window = this.windowById(windowId);
            if (window) {
                window.setReady();
            }
        }
        async relaunch(windowId, options) {
            return this.lifecycleMainService.relaunch(options);
        }
        async reload(windowId, options) {
            const window = this.windowById(windowId);
            if (window) {
                return this.lifecycleMainService.reload(window, (options === null || options === void 0 ? void 0 : options.disableExtensions) !== undefined ? { _: [], 'disable-extensions': options === null || options === void 0 ? void 0 : options.disableExtensions } : undefined);
            }
        }
        async closeWindow(windowId) {
            this.closeWindowById(windowId, windowId);
        }
        async closeWindowById(currentWindowId, targetWindowId) {
            const window = this.windowById(targetWindowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                return window.win.close();
            }
        }
        async quit(windowId) {
            // If the user selected to exit from an extension development host window, do not quit, but just
            // close the window unless this is the last window that is opened.
            const window = this.windowsMainService.getLastActiveWindow();
            if ((window === null || window === void 0 ? void 0 : window.isExtensionDevelopmentHost) && this.windowsMainService.getWindowCount() > 1 && window.win) {
                window.win.close();
            }
            // Otherwise: normal quit
            else {
                setTimeout(() => {
                    this.lifecycleMainService.quit();
                }, 10 /* delay to unwind callback stack (IPC) */);
            }
        }
        async exit(windowId, code) {
            await this.lifecycleMainService.kill(code);
        }
        //#endregion
        //#region Connectivity
        async resolveProxy(windowId, url) {
            var _a, _b;
            const window = this.windowById(windowId);
            const session = (_b = (_a = window === null || window === void 0 ? void 0 : window.win) === null || _a === void 0 ? void 0 : _a.webContents) === null || _b === void 0 ? void 0 : _b.session;
            if (session) {
                return session.resolveProxy(url);
            }
            else {
                return undefined;
            }
        }
        //#endregion
        //#region Development
        async openDevTools(windowId, options) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                window.win.webContents.openDevTools(options);
            }
        }
        async toggleDevTools(windowId) {
            const window = this.windowById(windowId);
            if (window === null || window === void 0 ? void 0 : window.win) {
                const contents = window.win.webContents;
                contents.toggleDevTools();
            }
        }
        async sendInputEvent(windowId, event) {
            const window = this.windowById(windowId);
            if ((window === null || window === void 0 ? void 0 : window.win) && (event.type === 'mouseDown' || event.type === 'mouseUp')) {
                window.win.webContents.sendInputEvent(event);
            }
        }
        async toggleSharedProcessWindow() {
            return this.sharedProcess.toggle();
        }
        //#endregion
        //#region Registry (windows)
        async windowsGetStringRegKey(windowId, hive, path, name) {
            if (!platform_1.isWindows) {
                return undefined;
            }
            const Registry = await new Promise((resolve_3, reject_3) => { require(['vscode-windows-registry'], resolve_3, reject_3); });
            try {
                return Registry.GetStringRegKey(hive, path, name);
            }
            catch (_a) {
                return undefined;
            }
        }
        async getPassword(windowId, service, account) {
            const keytar = await this.withKeytar();
            const password = await keytar.getPassword(service, account);
            if (password) {
                try {
                    let { content, hasNextChunk } = JSON.parse(password);
                    if (!content || !hasNextChunk) {
                        return password;
                    }
                    let index = 1;
                    while (hasNextChunk) {
                        const nextChunk = await keytar.getPassword(service, `${account}-${index}`);
                        const result = JSON.parse(nextChunk);
                        content += result.content;
                        hasNextChunk = result.hasNextChunk;
                    }
                    return content;
                }
                catch (_a) {
                    return password;
                }
            }
            return password;
        }
        async setPassword(windowId, service, account, password) {
            const keytar = await this.withKeytar();
            if (platform_1.isWindows && password.length > NativeHostMainService.MAX_PASSWORD_LENGTH) {
                let index = 0;
                let chunk = 0;
                let hasNextChunk = true;
                while (hasNextChunk) {
                    const passwordChunk = password.substring(index, index + NativeHostMainService.PASSWORD_CHUNK_SIZE);
                    index += NativeHostMainService.PASSWORD_CHUNK_SIZE;
                    hasNextChunk = password.length - index > 0;
                    const content = {
                        content: passwordChunk,
                        hasNextChunk: hasNextChunk
                    };
                    await keytar.setPassword(service, chunk ? `${account}-${chunk}` : account, JSON.stringify(content));
                    chunk++;
                }
            }
            else {
                await keytar.setPassword(service, account, password);
            }
            this._onDidChangePassword.fire({ service, account });
        }
        async deletePassword(windowId, service, account) {
            const keytar = await this.withKeytar();
            const didDelete = await keytar.deletePassword(service, account);
            if (didDelete) {
                this._onDidChangePassword.fire({ service, account });
            }
            return didDelete;
        }
        async findPassword(windowId, service) {
            const keytar = await this.withKeytar();
            return keytar.findPassword(service);
        }
        async findCredentials(windowId, service) {
            const keytar = await this.withKeytar();
            return keytar.findCredentials(service);
        }
        async withKeytar() {
            if (this.environmentMainService.disableKeytar) {
                throw new Error('keytar has been disabled via --disable-keytar option');
            }
            return await new Promise((resolve_4, reject_4) => { require(['keytar'], resolve_4, reject_4); });
        }
        //#endregion
        windowById(windowId) {
            if (typeof windowId !== 'number') {
                return undefined;
            }
            return this.windowsMainService.getWindowById(windowId);
        }
    };
    //#endregion
    //#region Credentials
    NativeHostMainService.MAX_PASSWORD_LENGTH = 2500;
    NativeHostMainService.PASSWORD_CHUNK_SIZE = NativeHostMainService.MAX_PASSWORD_LENGTH - 100;
    __decorate([
        decorators_1.memoize
    ], NativeHostMainService.prototype, "cliPath", null);
    NativeHostMainService = __decorate([
        __param(1, windows_1.IWindowsMainService),
        __param(2, dialogMainService_1.IDialogMainService),
        __param(3, lifecycleMainService_1.ILifecycleMainService),
        __param(4, environmentMainService_1.IEnvironmentMainService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, log_1.ILogService),
        __param(7, productService_1.IProductService)
    ], NativeHostMainService);
    exports.NativeHostMainService = NativeHostMainService;
});
//# sourceMappingURL=nativeHostMainService.js.map