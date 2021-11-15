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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/webview/browser/dynamicWebviewEditorOverlay", "vs/workbench/contrib/webview/browser/webviewService", "vs/workbench/contrib/webview/electron-sandbox/iframeWebviewElement", "vs/workbench/contrib/webview/electron-browser/webviewElement"], function (require, exports, configuration_1, instantiation_1, dynamicWebviewEditorOverlay_1, webviewService_1, iframeWebviewElement_1, webviewElement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronWebviewService = void 0;
    let ElectronWebviewService = class ElectronWebviewService extends webviewService_1.WebviewService {
        constructor(instantiationService, _configService) {
            super(instantiationService);
            this._configService = _configService;
        }
        createWebviewElement(id, options, contentOptions, extension) {
            var _a;
            const useIframes = (_a = this._configService.getValue('webview.experimental.useIframes')) !== null && _a !== void 0 ? _a : !options.enableFindWidget;
            const webview = this._instantiationService.createInstance(useIframes ? iframeWebviewElement_1.ElectronIframeWebview : webviewElement_1.ElectronWebviewBasedWebview, id, options, contentOptions, extension, this._webviewThemeDataProvider);
            this.addWebviewListeners(webview);
            return webview;
        }
        createWebviewOverlay(id, options, contentOptions, extension) {
            const webview = this._instantiationService.createInstance(dynamicWebviewEditorOverlay_1.DynamicWebviewEditorOverlay, id, options, contentOptions, extension);
            this.addWebviewListeners(webview);
            return webview;
        }
    };
    ElectronWebviewService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService)
    ], ElectronWebviewService);
    exports.ElectronWebviewService = ElectronWebviewService;
});
//# sourceMappingURL=webviewService.js.map