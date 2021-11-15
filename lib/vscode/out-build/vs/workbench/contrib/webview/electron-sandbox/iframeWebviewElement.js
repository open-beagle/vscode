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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/ipc/electron-sandbox/services", "vs/platform/log/common/log", "vs/platform/native/electron-sandbox/native", "vs/platform/notification/common/notification", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/remote/common/tunnel", "vs/platform/request/common/request", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/webview/browser/webviewElement", "vs/workbench/contrib/webview/electron-sandbox/windowIgnoreMenuShortcutsManager", "vs/workbench/services/environment/common/environmentService"], function (require, exports, configuration_1, files_1, services_1, log_1, native_1, notification_1, remoteAuthorityResolver_1, tunnel_1, request_1, telemetry_1, webviewElement_1, windowIgnoreMenuShortcutsManager_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronIframeWebview = void 0;
    /**
     * Webview backed by an iframe but that uses Electron APIs to power the webview.
     */
    let ElectronIframeWebview = class ElectronIframeWebview extends webviewElement_1.IFrameWebview {
        constructor(id, options, contentOptions, extension, webviewThemeDataProvider, tunnelService, fileService, requestService, telemetryService, environmentService, _remoteAuthorityResolverService, logService, configurationService, mainProcessService, noficationService, nativeHostService) {
            super(id, options, contentOptions, extension, webviewThemeDataProvider, configurationService, fileService, logService, noficationService, _remoteAuthorityResolverService, requestService, telemetryService, tunnelService, environmentService);
            this._webviewKeyboardHandler = new windowIgnoreMenuShortcutsManager_1.WindowIgnoreMenuShortcutsManager(configurationService, mainProcessService, nativeHostService);
            this._register(this.on("did-focus" /* didFocus */, () => {
                this._webviewKeyboardHandler.didFocus();
            }));
            this._register(this.on("did-blur" /* didBlur */, () => {
                this._webviewKeyboardHandler.didBlur();
            }));
        }
        initElement(extension, options) {
            super.initElement(extension, options, {
                platform: 'electron',
                'vscode-resource-origin': this.webviewResourceEndpoint,
            });
        }
        get webviewContentEndpoint() {
            const endpoint = this._environmentService.webviewExternalEndpoint.replace('{{uuid}}', this.id);
            if (endpoint[endpoint.length - 1] === '/') {
                return endpoint.slice(0, endpoint.length - 1);
            }
            return endpoint;
        }
        get webviewResourceEndpoint() {
            return `https://${this.id}.vscode-webview-test.com`;
        }
        async doPostMessage(channel, data) {
            var _a;
            (_a = this.element) === null || _a === void 0 ? void 0 : _a.contentWindow.postMessage({ channel, args: data }, '*');
        }
    };
    ElectronIframeWebview = __decorate([
        __param(5, tunnel_1.ITunnelService),
        __param(6, files_1.IFileService),
        __param(7, request_1.IRequestService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, environmentService_1.IWorkbenchEnvironmentService),
        __param(10, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(11, log_1.ILogService),
        __param(12, configuration_1.IConfigurationService),
        __param(13, services_1.IMainProcessService),
        __param(14, notification_1.INotificationService),
        __param(15, native_1.INativeHostService)
    ], ElectronIframeWebview);
    exports.ElectronIframeWebview = ElectronIframeWebview;
});
//# sourceMappingURL=iframeWebviewElement.js.map