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
define(["require", "exports", "vs/nls!vs/workbench/services/extensionManagement/common/extensionManagementServerService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/network", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensionManagement/common/webExtensionManagementService", "vs/workbench/services/extensionManagement/common/remoteExtensionManagementService", "vs/platform/configuration/common/configuration", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/product/common/productService", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, nls_1, extensionManagement_1, remoteAgentService_1, network_1, extensions_1, label_1, platform_1, instantiation_1, webExtensionManagementService_1, remoteExtensionManagementService_1, configuration_1, extensionManagement_2, productService_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementServerService = void 0;
    let ExtensionManagementServerService = class ExtensionManagementServerService {
        constructor(remoteAgentService, labelService, galleryService, productService, configurationService, instantiationService, extensionManifestPropertiesService) {
            this.localExtensionManagementServer = null;
            this.remoteExtensionManagementServer = null;
            this.webExtensionManagementServer = null;
            const remoteAgentConnection = remoteAgentService.getConnection();
            if (remoteAgentConnection) {
                const extensionManagementService = new remoteExtensionManagementService_1.WebRemoteExtensionManagementService(remoteAgentConnection.getChannel('extensions'), galleryService, configurationService, productService, extensionManifestPropertiesService);
                this.remoteExtensionManagementServer = {
                    id: 'remote',
                    extensionManagementService,
                    get label() { return labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || (0, nls_1.localize)(0, null); }
                };
            }
            if (platform_1.isWeb) {
                const extensionManagementService = instantiationService.createInstance(webExtensionManagementService_1.WebExtensionManagementService);
                this.webExtensionManagementServer = {
                    id: 'web',
                    extensionManagementService,
                    label: (0, nls_1.localize)(1, null)
                };
            }
        }
        getExtensionManagementServer(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this.remoteExtensionManagementServer;
            }
            if (this.webExtensionManagementServer) {
                return this.webExtensionManagementServer;
            }
            throw new Error(`Invalid Extension ${extension.location}`);
        }
    };
    ExtensionManagementServerService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, label_1.ILabelService),
        __param(2, extensionManagement_2.IExtensionGalleryService),
        __param(3, productService_1.IProductService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], ExtensionManagementServerService);
    exports.ExtensionManagementServerService = ExtensionManagementServerService;
    (0, extensions_1.registerSingleton)(extensionManagement_1.IExtensionManagementServerService, ExtensionManagementServerService);
});
//# sourceMappingURL=extensionManagementServerService.js.map