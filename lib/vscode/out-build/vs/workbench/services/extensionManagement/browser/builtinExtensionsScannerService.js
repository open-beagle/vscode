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
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/base/common/platform", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/network"], function (require, exports, extensions_1, platform_1, environmentService_1, uriIdentity_1, extensions_2, extensionManagementUtil_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BuiltinExtensionsScannerService = void 0;
    let BuiltinExtensionsScannerService = class BuiltinExtensionsScannerService {
        constructor(environmentService, uriIdentityService) {
            this.builtinExtensions = [];
            if (platform_1.isWeb) {
                const builtinExtensionsServiceUrl = this._getBuiltinExtensionsUrl(environmentService);
                if (builtinExtensionsServiceUrl) {
                    let scannedBuiltinExtensions = [];
                    if (environmentService.isBuilt) {
                        // Built time configuration (do NOT modify)
                        scannedBuiltinExtensions = [ /*BUILD->INSERT_BUILTIN_EXTENSIONS*/];
                    }
                    else {
                        // Find builtin extensions by checking for DOM
                        const builtinExtensionsElement = document.getElementById('vscode-workbench-builtin-extensions');
                        const builtinExtensionsElementAttribute = builtinExtensionsElement ? builtinExtensionsElement.getAttribute('data-settings') : undefined;
                        if (builtinExtensionsElementAttribute) {
                            try {
                                scannedBuiltinExtensions = JSON.parse(builtinExtensionsElementAttribute);
                            }
                            catch (error) { /* ignore error*/ }
                        }
                    }
                    this.builtinExtensions = scannedBuiltinExtensions.map(e => ({
                        identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(e.packageJSON.publisher, e.packageJSON.name) },
                        location: uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.extensionPath),
                        type: 0 /* System */,
                        packageJSON: e.packageJSON,
                        packageNLS: e.packageNLS,
                        readmeUrl: e.readmePath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.readmePath) : undefined,
                        changelogUrl: e.changelogPath ? uriIdentityService.extUri.joinPath(builtinExtensionsServiceUrl, e.changelogPath) : undefined,
                        isUnderDevelopment: false
                    }));
                }
            }
        }
        _getBuiltinExtensionsUrl(environmentService) {
            let enableBuiltinExtensions;
            if (environmentService.options && typeof environmentService.options._enableBuiltinExtensions !== 'undefined') {
                enableBuiltinExtensions = environmentService.options._enableBuiltinExtensions;
            }
            else {
                enableBuiltinExtensions = true;
            }
            if (enableBuiltinExtensions) {
                return network_1.FileAccess.asBrowserUri('../../../../../../extensions', require);
            }
            return undefined;
        }
        async scanBuiltinExtensions() {
            if (platform_1.isWeb) {
                return this.builtinExtensions;
            }
            throw new Error('not supported');
        }
    };
    BuiltinExtensionsScannerService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, uriIdentity_1.IUriIdentityService)
    ], BuiltinExtensionsScannerService);
    exports.BuiltinExtensionsScannerService = BuiltinExtensionsScannerService;
    (0, extensions_2.registerSingleton)(extensions_1.IBuiltinExtensionsScannerService, BuiltinExtensionsScannerService);
});
//# sourceMappingURL=builtinExtensionsScannerService.js.map