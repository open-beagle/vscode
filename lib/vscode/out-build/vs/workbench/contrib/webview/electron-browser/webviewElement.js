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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/functional", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/ipc/electron-sandbox/services", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/tunnel", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/platform/webview/common/webviewManagerService", "vs/workbench/contrib/webview/browser/baseWebviewElement", "vs/workbench/contrib/webview/browser/webviewFindWidget", "vs/workbench/contrib/webview/electron-browser/webviewIgnoreMenuShortcutsManager", "vs/workbench/services/environment/common/environmentService"], function (require, exports, dom_1, event_1, functional_1, network_1, configuration_1, files_1, instantiation_1, services_1, log_1, notification_1, remoteAuthorityResolver_1, tunnel_1, request_1, telemetry_1, webviewManagerService_1, baseWebviewElement_1, webviewFindWidget_1, webviewIgnoreMenuShortcutsManager_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronWebviewBasedWebview = void 0;
    let ElectronWebviewBasedWebview = class ElectronWebviewBasedWebview extends baseWebviewElement_1.BaseWebview {
        constructor(id, options, contentOptions, extension, _webviewThemeDataProvider, _myLogService, instantiationService, telemetryService, environmentService, configurationService, mainProcessService, notificationService, fileService, requestService, tunnelService, remoteAuthorityResolverService) {
            super(id, options, contentOptions, extension, _webviewThemeDataProvider, {
                notificationService,
                logService: _myLogService,
                telemetryService,
                environmentService,
                fileService,
                requestService,
                tunnelService,
                remoteAuthorityResolverService
            });
            this._webviewThemeDataProvider = _webviewThemeDataProvider;
            this._myLogService = _myLogService;
            this._findStarted = false;
            this.extraContentOptions = {};
            this._hasFindResult = this._register(new event_1.Emitter());
            this.hasFindResult = this._hasFindResult.event;
            /* __GDPR__
                "webview.createWebview" : {
                    "extension": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "enableFindWidget": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "webviewElementType": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
                }
            */
            telemetryService.publicLog('webview.createWebview', {
                enableFindWidget: !!options.enableFindWidget,
                extension: extension === null || extension === void 0 ? void 0 : extension.id.value,
                webviewElementType: 'webview',
            });
            this._myLogService.debug(`Webview(${this.id}): init`);
            this._register((0, dom_1.addDisposableListener)(this.element, 'dom-ready', (0, functional_1.once)(() => {
                this._register(ElectronWebviewBasedWebview.getWebviewKeyboardHandler(configurationService, mainProcessService).add(this.element));
            })));
            this._register((0, dom_1.addDisposableListener)(this.element, 'console-message', function (e) {
                console.log(`[Embedded Page] ${e.message}`);
            }));
            this._register((0, dom_1.addDisposableListener)(this.element, 'dom-ready', () => {
                this._myLogService.debug(`Webview(${this.id}): dom-ready`);
                // Workaround for https://github.com/electron/electron/issues/14474
                if (this.element && (this.isFocused || document.activeElement === this.element)) {
                    this.element.blur();
                    this.element.focus();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.element, 'crashed', () => {
                console.error('embedded page crashed');
            }));
            this._register(this.on('synthetic-mouse-event', (rawEvent) => {
                if (!this.element) {
                    return;
                }
                const bounds = this.element.getBoundingClientRect();
                try {
                    window.dispatchEvent(new MouseEvent(rawEvent.type, Object.assign(Object.assign({}, rawEvent), { clientX: rawEvent.clientX + bounds.left, clientY: rawEvent.clientY + bounds.top })));
                    return;
                }
                catch (_a) {
                    // CustomEvent was treated as MouseEvent so don't do anything - https://github.com/microsoft/vscode/issues/78915
                    return;
                }
            }));
            this._register(this.on('did-set-content', () => {
                this._myLogService.debug(`Webview(${this.id}): did-set-content`);
                if (this.element) {
                    this.element.style.flex = '';
                    this.element.style.width = '100%';
                    this.element.style.height = '100%';
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.element, 'devtools-opened', () => {
                this._send('devtools-opened');
            }));
            if (options.enableFindWidget) {
                this._webviewFindWidget = this._register(instantiationService.createInstance(webviewFindWidget_1.WebviewFindWidget, this));
                this._register((0, dom_1.addDisposableListener)(this.element, 'found-in-page', e => {
                    this._hasFindResult.fire(e.result.matches > 0);
                }));
                this.styledFindWidget();
            }
            // We must ensure to put a `file:` URI as the preload attribute
            // and not the `vscode-file` URI because preload scripts are loaded
            // via node.js from the main side and only allow `file:` protocol
            this.element.preload = network_1.FileAccess.asFileUri('./pre/electron-index.js', require).toString(true);
            this.element.src = `${network_1.Schemas.vscodeWebview}://${this.id}/electron-browser-index.html?platform=electron&id=${this.id}&vscode-resource-origin=${encodeURIComponent(this.webviewResourceEndpoint)}`;
        }
        static getWebviewKeyboardHandler(configService, mainProcessService) {
            if (!this._webviewKeyboardHandler) {
                this._webviewKeyboardHandler = new webviewIgnoreMenuShortcutsManager_1.WebviewIgnoreMenuShortcutsManager(configService, mainProcessService);
            }
            return this._webviewKeyboardHandler;
        }
        createElement(options) {
            // Do not start loading the webview yet.
            // Wait the end of the ctor when all listeners have been hooked up.
            const element = document.createElement('webview');
            element.focus = () => {
                this.doFocus();
            };
            element.setAttribute('partition', webviewManagerService_1.webviewPartitionId);
            element.setAttribute('webpreferences', 'contextIsolation=yes');
            element.className = `webview ${options.customClasses || ''}`;
            element.style.flex = '0 1';
            element.style.width = '0';
            element.style.height = '0';
            element.style.outline = '0';
            return element;
        }
        elementFocusImpl() {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.focus();
        }
        set contentOptions(options) {
            this._myLogService.debug(`Webview(${this.id}): will set content options`);
            super.contentOptions = options;
        }
        get webviewResourceEndpoint() {
            return `https://${this.id}.vscode-webview-test.com`;
        }
        mountTo(parent) {
            if (!this.element) {
                return;
            }
            if (this._webviewFindWidget) {
                parent.appendChild(this._webviewFindWidget.getDomNode());
            }
            parent.appendChild(this.element);
        }
        async doPostMessage(channel, data) {
            var _a;
            this._myLogService.debug(`Webview(${this.id}): did post message on '${channel}'`);
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.send(channel, data);
        }
        style() {
            super.style();
            this.styledFindWidget();
        }
        styledFindWidget() {
            var _a;
            (_a = this._webviewFindWidget) === null || _a === void 0 ? void 0 : _a.updateTheme(this._webviewThemeDataProvider.getTheme());
        }
        startFind(value, options) {
            if (!value || !this.element) {
                return;
            }
            // ensure options is defined without modifying the original
            options = options || {};
            // FindNext must be false for a first request
            const findOptions = {
                forward: options.forward,
                findNext: true,
                matchCase: options.matchCase
            };
            this._findStarted = true;
            this.element.findInPage(value, findOptions);
        }
        /**
         * Webviews expose a stateful find API.
         * Successive calls to find will move forward or backward through onFindResults
         * depending on the supplied options.
         *
         * @param value The string to search for. Empty strings are ignored.
         */
        find(value, previous) {
            if (!this.element) {
                return;
            }
            // Searching with an empty value will throw an exception
            if (!value) {
                return;
            }
            const options = { findNext: false, forward: !previous };
            if (!this._findStarted) {
                this.startFind(value, options);
                return;
            }
            this.element.findInPage(value, options);
        }
        stopFind(keepSelection) {
            this._hasFindResult.fire(false);
            if (!this.element) {
                return;
            }
            this._findStarted = false;
            this.element.stopFindInPage(keepSelection ? 'keepSelection' : 'clearSelection');
        }
        showFind() {
            var _a;
            (_a = this._webviewFindWidget) === null || _a === void 0 ? void 0 : _a.reveal();
        }
        hideFind() {
            var _a;
            (_a = this._webviewFindWidget) === null || _a === void 0 ? void 0 : _a.hide();
        }
        runFindAction(previous) {
            var _a;
            (_a = this._webviewFindWidget) === null || _a === void 0 ? void 0 : _a.find(previous);
        }
        selectAll() {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.selectAll();
        }
        copy() {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.copy();
        }
        paste() {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.paste();
        }
        cut() {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.cut();
        }
        undo() {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.undo();
        }
        redo() {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.redo();
        }
        on(channel, handler) {
            if (!this.element) {
                throw new Error('Cannot add event listener. No webview element found.');
            }
            return (0, dom_1.addDisposableListener)(this.element, 'ipc-message', (event) => {
                if (!this.element) {
                    return;
                }
                if (event.channel === channel && event.args && event.args.length) {
                    handler(event.args[0]);
                }
            });
        }
    };
    ElectronWebviewBasedWebview = __decorate([
        __param(5, log_1.ILogService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, services_1.IMainProcessService),
        __param(11, notification_1.INotificationService),
        __param(12, files_1.IFileService),
        __param(13, request_1.IRequestService),
        __param(14, tunnel_1.ITunnelService),
        __param(15, remoteAuthorityResolver_1.IRemoteAuthorityResolverService)
    ], ElectronWebviewBasedWebview);
    exports.ElectronWebviewBasedWebview = ElectronWebviewBasedWebview;
});
//# sourceMappingURL=webviewElement.js.map