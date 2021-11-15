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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/cancellation", "vs/platform/product/common/productService", "vs/platform/configuration/common/configuration", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, extensionManagement_1, cancellation_1, productService_1, configuration_1, extensionManagementIpc_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebRemoteExtensionManagementService = void 0;
    let WebRemoteExtensionManagementService = class WebRemoteExtensionManagementService extends extensionManagementIpc_1.ExtensionManagementChannelClient {
        constructor(channel, galleryService, configurationService, productService, extensionManifestPropertiesService) {
            super(channel);
            this.galleryService = galleryService;
            this.configurationService = configurationService;
            this.productService = productService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        }
        async canInstall(extension) {
            const manifest = await this.galleryService.getManifest(extension, cancellation_1.CancellationToken.None);
            return !!manifest && this.extensionManifestPropertiesService.canExecuteOnWorkspace(manifest);
        }
    };
    WebRemoteExtensionManagementService = __decorate([
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, productService_1.IProductService),
        __param(4, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], WebRemoteExtensionManagementService);
    exports.WebRemoteExtensionManagementService = WebRemoteExtensionManagementService;
});
//# sourceMappingURL=remoteExtensionManagementService.js.map