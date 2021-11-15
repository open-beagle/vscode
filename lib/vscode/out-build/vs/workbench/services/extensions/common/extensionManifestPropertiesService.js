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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/arrays", "vs/platform/product/common/productService", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/workspaces/common/workspaceTrust"], function (require, exports, configuration_1, extensions_1, extensionsRegistry_1, extensionManagementUtil_1, arrays_1, productService_1, instantiation_1, extensions_2, lifecycle_1, workspaceTrust_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManifestPropertiesService = exports.IExtensionManifestPropertiesService = void 0;
    exports.IExtensionManifestPropertiesService = (0, instantiation_1.createDecorator)('extensionManifestPropertiesService');
    let ExtensionManifestPropertiesService = class ExtensionManifestPropertiesService extends lifecycle_1.Disposable {
        constructor(productService, configurationService) {
            super();
            this.productService = productService;
            this.configurationService = configurationService;
            this._uiExtensionPoints = null;
            this._productExtensionKindsMap = null;
            this._configuredExtensionKindsMap = null;
            this._productVirtualWorkspaceSupportMap = null;
            this._configuredVirtualWorkspaceSupportMap = null;
            // Workspace trust request type (settings.json)
            this._configuredExtensionWorkspaceTrustRequestMap = new Map();
            const configuredExtensionWorkspaceTrustRequests = configurationService.inspect(workspaceTrust_1.WORKSPACE_TRUST_EXTENSION_SUPPORT).userValue || {};
            for (const id of Object.keys(configuredExtensionWorkspaceTrustRequests)) {
                this._configuredExtensionWorkspaceTrustRequestMap.set(extensions_1.ExtensionIdentifier.toKey(id), configuredExtensionWorkspaceTrustRequests[id]);
            }
            // Workpace trust request type (products.json)
            this._productExtensionWorkspaceTrustRequestMap = new Map();
            if (productService.extensionUntrustedWorkspaceSupport) {
                for (const id of Object.keys(productService.extensionUntrustedWorkspaceSupport)) {
                    this._productExtensionWorkspaceTrustRequestMap.set(extensions_1.ExtensionIdentifier.toKey(id), productService.extensionUntrustedWorkspaceSupport[id]);
                }
            }
        }
        prefersExecuteOnUI(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return (extensionKind.length > 0 && extensionKind[0] === 'ui');
        }
        prefersExecuteOnWorkspace(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return (extensionKind.length > 0 && extensionKind[0] === 'workspace');
        }
        prefersExecuteOnWeb(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return (extensionKind.length > 0 && extensionKind[0] === 'web');
        }
        canExecuteOnUI(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return extensionKind.some(kind => kind === 'ui');
        }
        canExecuteOnWorkspace(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return extensionKind.some(kind => kind === 'workspace');
        }
        canExecuteOnWeb(manifest) {
            const extensionKind = this.getExtensionKind(manifest);
            return extensionKind.some(kind => kind === 'web');
        }
        getExtensionKind(manifest) {
            // check in config
            let result = this.getConfiguredExtensionKind(manifest);
            if (typeof result !== 'undefined') {
                return this.toArray(result);
            }
            // check product.json
            result = this.getProductExtensionKind(manifest);
            if (typeof result !== 'undefined') {
                return result;
            }
            // check the manifest itself
            result = manifest.extensionKind;
            if (typeof result !== 'undefined') {
                return this.toArray(result);
            }
            return this.deduceExtensionKind(manifest);
        }
        getExtensionUntrustedWorkspaceSupportType(manifest) {
            var _a, _b;
            // Workspace trust feature is disabled, or extension has no entry point
            if (!(0, workspaceTrust_1.isWorkspaceTrustEnabled)(this.configurationService) || !manifest.main) {
                return true;
            }
            // Get extension workspace trust requirements from settings.json
            const configuredWorkspaceTrustRequest = this.getConfiguredExtensionWorkspaceTrustRequest(manifest);
            // Get extension workspace trust requirements from product.json
            const productWorkspaceTrustRequest = this.getProductExtensionWorkspaceTrustRequest(manifest);
            // Use settings.json override value if it exists
            if (configuredWorkspaceTrustRequest) {
                return configuredWorkspaceTrustRequest;
            }
            // Use product.json override value if it exists
            if (productWorkspaceTrustRequest === null || productWorkspaceTrustRequest === void 0 ? void 0 : productWorkspaceTrustRequest.override) {
                return productWorkspaceTrustRequest.override;
            }
            // Use extension manifest value if it exists
            if (((_b = (_a = manifest.capabilities) === null || _a === void 0 ? void 0 : _a.untrustedWorkspaces) === null || _b === void 0 ? void 0 : _b.supported) !== undefined) {
                return manifest.capabilities.untrustedWorkspaces.supported;
            }
            // Use product.json default value if it exists
            if (productWorkspaceTrustRequest === null || productWorkspaceTrustRequest === void 0 ? void 0 : productWorkspaceTrustRequest.default) {
                return productWorkspaceTrustRequest.default;
            }
            return false;
        }
        canSupportVirtualWorkspace(manifest) {
            var _a, _b;
            // check user configured
            const userConfiguredVirtualWorkspaceSupport = this.getConfiguredVirtualWorkspaceSupport(manifest);
            if (userConfiguredVirtualWorkspaceSupport !== undefined) {
                return userConfiguredVirtualWorkspaceSupport;
            }
            const productConfiguredWorkspaceSchemes = this.getProductVirtualWorkspaceSupport(manifest);
            // check override from product
            if ((productConfiguredWorkspaceSchemes === null || productConfiguredWorkspaceSchemes === void 0 ? void 0 : productConfiguredWorkspaceSchemes.override) !== undefined) {
                return productConfiguredWorkspaceSchemes.override;
            }
            // check the manifest
            if (((_a = manifest.capabilities) === null || _a === void 0 ? void 0 : _a.virtualWorkspaces) !== undefined) {
                return (_b = manifest.capabilities) === null || _b === void 0 ? void 0 : _b.virtualWorkspaces;
            }
            // check default from product
            if ((productConfiguredWorkspaceSchemes === null || productConfiguredWorkspaceSchemes === void 0 ? void 0 : productConfiguredWorkspaceSchemes.default) !== undefined) {
                return productConfiguredWorkspaceSchemes.default;
            }
            // Default - supports virtual workspace
            return true;
        }
        deduceExtensionKind(manifest) {
            // Not an UI extension if it has main
            if (manifest.main) {
                if (manifest.browser) {
                    return ['workspace', 'web'];
                }
                return ['workspace'];
            }
            if (manifest.browser) {
                return ['web'];
            }
            // Not an UI nor web extension if it has dependencies or an extension pack
            if ((0, arrays_1.isNonEmptyArray)(manifest.extensionDependencies) || (0, arrays_1.isNonEmptyArray)(manifest.extensionPack)) {
                return ['workspace'];
            }
            if (manifest.contributes) {
                // Not an UI nor web extension if it has no ui contributions
                for (const contribution of Object.keys(manifest.contributes)) {
                    if (!this.isUIExtensionPoint(contribution)) {
                        return ['workspace'];
                    }
                }
            }
            return ['ui', 'workspace', 'web'];
        }
        isUIExtensionPoint(extensionPoint) {
            if (this._uiExtensionPoints === null) {
                const uiExtensionPoints = new Set();
                extensionsRegistry_1.ExtensionsRegistry.getExtensionPoints().filter(e => e.defaultExtensionKind !== 'workspace').forEach(e => {
                    uiExtensionPoints.add(e.name);
                });
                this._uiExtensionPoints = uiExtensionPoints;
            }
            return this._uiExtensionPoints.has(extensionPoint);
        }
        getProductExtensionKind(manifest) {
            if (this._productExtensionKindsMap === null) {
                const productExtensionKindsMap = new Map();
                if (this.productService.extensionKind) {
                    for (const id of Object.keys(this.productService.extensionKind)) {
                        productExtensionKindsMap.set(extensions_1.ExtensionIdentifier.toKey(id), this.productService.extensionKind[id]);
                    }
                }
                this._productExtensionKindsMap = productExtensionKindsMap;
            }
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._productExtensionKindsMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
        }
        getConfiguredExtensionKind(manifest) {
            if (this._configuredExtensionKindsMap === null) {
                const configuredExtensionKindsMap = new Map();
                const configuredExtensionKinds = this.configurationService.getValue('remote.extensionKind') || {};
                for (const id of Object.keys(configuredExtensionKinds)) {
                    configuredExtensionKindsMap.set(extensions_1.ExtensionIdentifier.toKey(id), configuredExtensionKinds[id]);
                }
                this._configuredExtensionKindsMap = configuredExtensionKindsMap;
            }
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._configuredExtensionKindsMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
        }
        getProductVirtualWorkspaceSupport(manifest) {
            if (this._productVirtualWorkspaceSupportMap === null) {
                const productWorkspaceSchemesMap = new Map();
                if (this.productService.extensionVirtualWorkspacesSupport) {
                    for (const id of Object.keys(this.productService.extensionVirtualWorkspacesSupport)) {
                        productWorkspaceSchemesMap.set(extensions_1.ExtensionIdentifier.toKey(id), this.productService.extensionVirtualWorkspacesSupport[id]);
                    }
                }
                this._productVirtualWorkspaceSupportMap = productWorkspaceSchemesMap;
            }
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._productVirtualWorkspaceSupportMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
        }
        getConfiguredVirtualWorkspaceSupport(manifest) {
            if (this._configuredVirtualWorkspaceSupportMap === null) {
                const configuredWorkspaceSchemesMap = new Map();
                const configuredWorkspaceSchemes = this.configurationService.getValue('extensions.supportVirtualWorkspaces') || {};
                for (const id of Object.keys(configuredWorkspaceSchemes)) {
                    if (configuredWorkspaceSchemes[id] !== undefined) {
                        configuredWorkspaceSchemesMap.set(extensions_1.ExtensionIdentifier.toKey(id), configuredWorkspaceSchemes[id]);
                    }
                }
                this._configuredVirtualWorkspaceSupportMap = configuredWorkspaceSchemesMap;
            }
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._configuredVirtualWorkspaceSupportMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
        }
        getConfiguredExtensionWorkspaceTrustRequest(manifest) {
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            const extensionWorkspaceTrustRequest = this._configuredExtensionWorkspaceTrustRequestMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
            if (extensionWorkspaceTrustRequest && (extensionWorkspaceTrustRequest.version === undefined || extensionWorkspaceTrustRequest.version === manifest.version)) {
                return extensionWorkspaceTrustRequest.supported;
            }
            return undefined;
        }
        getProductExtensionWorkspaceTrustRequest(manifest) {
            const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
            return this._productExtensionWorkspaceTrustRequestMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
        }
        toArray(extensionKind) {
            if (Array.isArray(extensionKind)) {
                return extensionKind;
            }
            return extensionKind === 'ui' ? ['ui', 'workspace'] : [extensionKind];
        }
    };
    ExtensionManifestPropertiesService = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, configuration_1.IConfigurationService)
    ], ExtensionManifestPropertiesService);
    exports.ExtensionManifestPropertiesService = ExtensionManifestPropertiesService;
    (0, extensions_2.registerSingleton)(exports.IExtensionManifestPropertiesService, ExtensionManifestPropertiesService);
});
//# sourceMappingURL=extensionManifestPropertiesService.js.map