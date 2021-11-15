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
define(["require", "exports", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/tunnel", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/webview/browser/baseWebviewElement", "vs/workbench/services/environment/common/environmentService"], function (require, exports, dom_1, configuration_1, files_1, log_1, notification_1, remoteAuthorityResolver_1, tunnel_1, request_1, telemetry_1, baseWebviewElement_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IFrameWebview = void 0;
    let IFrameWebview = class IFrameWebview extends baseWebviewElement_1.BaseWebview {
        constructor(id, options, contentOptions, extension, webviewThemeDataProvider, configurationService, fileService, logService, notificationService, remoteAuthorityResolverService, requestService, telemetryService, tunnelService, environmentService) {
            super(id, options, contentOptions, extension, webviewThemeDataProvider, {
                notificationService,
                logService,
                telemetryService,
                environmentService,
                requestService,
                fileService,
                tunnelService,
                remoteAuthorityResolverService
            });
            /* __GDPR__
                "webview.createWebview" : {
                    "extension": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "s": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
                }
            */
            telemetryService.publicLog('webview.createWebview', {
                extension: extension === null || extension === void 0 ? void 0 : extension.id.value,
                webviewElementType: 'iframe',
            });
            this._confirmBeforeClose = configurationService.getValue('window.confirmBeforeClose');
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.confirmBeforeClose')) {
                    this._confirmBeforeClose = configurationService.getValue('window.confirmBeforeClose');
                    this._send("set-confirm-before-close" /* setConfirmBeforeClose */, this._confirmBeforeClose);
                }
            }));
            this.initElement(extension, options);
        }
        createElement(options, _contentOptions) {
            // Do not start loading the webview yet.
            // Wait the end of the ctor when all listeners have been hooked up.
            const element = document.createElement('iframe');
            element.className = `webview ${options.customClasses || ''}`;
            element.sandbox.add('allow-scripts', 'allow-same-origin', 'allow-forms', 'allow-pointer-lock', 'allow-downloads');
            element.setAttribute('allow', 'clipboard-read; clipboard-write;');
            element.style.border = 'none';
            element.style.width = '100%';
            element.style.height = '100%';
            element.focus = () => {
                this.doFocus();
            };
            return element;
        }
        elementFocusImpl() {
            var _a, _b;
            (_b = (_a = this.element) === null || _a === void 0 ? void 0 : _a.contentWindow) === null || _b === void 0 ? void 0 : _b.focus();
        }
        initElement(extension, options, extraParams) {
            var _a;
            const params = Object.assign({ id: this.id, extensionId: (_a = extension === null || extension === void 0 ? void 0 : extension.id.value) !== null && _a !== void 0 ? _a : '', purpose: options.purpose, serviceWorkerFetchIgnoreSubdomain: options.serviceWorkerFetchIgnoreSubdomain }, extraParams);
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join('&');
            this.element.setAttribute('src', `${this.webviewContentEndpoint}/index.html?${queryString}`);
        }
        get webviewContentEndpoint() {
            const endpoint = this._environmentService.webviewExternalEndpoint.replace('{{uuid}}', this.id);
            if (endpoint[endpoint.length - 1] === '/') {
                return endpoint.slice(0, endpoint.length - 1);
            }
            return endpoint;
        }
        get webviewResourceEndpoint() {
            return this.webviewContentEndpoint;
        }
        mountTo(parent) {
            if (this.element) {
                parent.appendChild(this.element);
            }
        }
        get extraContentOptions() {
            return {
                confirmBeforeClose: this._confirmBeforeClose,
            };
        }
        showFind() {
            throw new Error('Method not implemented.');
        }
        hideFind() {
            throw new Error('Method not implemented.');
        }
        runFindAction(previous) {
            throw new Error('Method not implemented.');
        }
        doPostMessage(channel, data) {
            if (this.element) {
                this.element.contentWindow.postMessage({ channel, args: data }, '*');
            }
        }
        on(channel, handler) {
            return (0, dom_1.addDisposableListener)(window, 'message', e => {
                if (!e || !e.data || e.data.target !== this.id) {
                    return;
                }
                if (e.data.channel === channel) {
                    handler(e.data.data);
                }
            });
        }
    };
    IFrameWebview = __decorate([
        __param(5, configuration_1.IConfigurationService),
        __param(6, files_1.IFileService),
        __param(7, log_1.ILogService),
        __param(8, notification_1.INotificationService),
        __param(9, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(10, request_1.IRequestService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, tunnel_1.ITunnelService),
        __param(13, environmentService_1.IWorkbenchEnvironmentService)
    ], IFrameWebview);
    exports.IFrameWebview = IFrameWebview;
});
//# sourceMappingURL=webviewElement.js.map