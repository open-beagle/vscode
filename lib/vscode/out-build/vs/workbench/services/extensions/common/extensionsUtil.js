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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/arrays", "vs/platform/product/common/productService"], function (require, exports, configuration_1, extensions_1, extensionsRegistry_1, extensionManagementUtil_1, arrays_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deduceExtensionKind = exports.ExtensionKindController2 = void 0;
    let ExtensionKindController2 = class ExtensionKindController2 {
        constructor(productService, configurationService) {
            this.productService = productService;
            this.configurationService = configurationService;
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
            let result = getConfiguredExtensionKind(manifest, this.configurationService);
            if (typeof result !== 'undefined') {
                return toArray(result);
            }
            // check product.json
            result = getProductExtensionKind(manifest, this.productService);
            if (typeof result !== 'undefined') {
                return result;
            }
            // check the manifest itself
            result = manifest.extensionKind;
            if (typeof result !== 'undefined') {
                return toArray(result);
            }
            return deduceExtensionKind(manifest);
        }
    };
    ExtensionKindController2 = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, configuration_1.IConfigurationService)
    ], ExtensionKindController2);
    exports.ExtensionKindController2 = ExtensionKindController2;
    function deduceExtensionKind(manifest) {
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
                if (!isUIExtensionPoint(contribution)) {
                    return ['workspace'];
                }
            }
        }
        return ['ui', 'workspace', 'web'];
    }
    exports.deduceExtensionKind = deduceExtensionKind;
    let _uiExtensionPoints = null;
    function isUIExtensionPoint(extensionPoint) {
        if (_uiExtensionPoints === null) {
            const uiExtensionPoints = new Set();
            extensionsRegistry_1.ExtensionsRegistry.getExtensionPoints().filter(e => e.defaultExtensionKind !== 'workspace').forEach(e => {
                uiExtensionPoints.add(e.name);
            });
            _uiExtensionPoints = uiExtensionPoints;
        }
        return _uiExtensionPoints.has(extensionPoint);
    }
    let _productExtensionKindsMap = null;
    function getProductExtensionKind(manifest, productService) {
        if (_productExtensionKindsMap === null) {
            const productExtensionKindsMap = new Map();
            if (productService.extensionKind) {
                for (const id of Object.keys(productService.extensionKind)) {
                    productExtensionKindsMap.set(extensions_1.ExtensionIdentifier.toKey(id), productService.extensionKind[id]);
                }
            }
            _productExtensionKindsMap = productExtensionKindsMap;
        }
        const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
        return _productExtensionKindsMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
    }
    let _configuredExtensionKindsMap = null;
    function getConfiguredExtensionKind(manifest, configurationService) {
        if (_configuredExtensionKindsMap === null) {
            const configuredExtensionKindsMap = new Map();
            const configuredExtensionKinds = configurationService.getValue('remote.extensionKind') || {};
            for (const id of Object.keys(configuredExtensionKinds)) {
                configuredExtensionKindsMap.set(extensions_1.ExtensionIdentifier.toKey(id), configuredExtensionKinds[id]);
            }
            _configuredExtensionKindsMap = configuredExtensionKindsMap;
        }
        const extensionId = (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name);
        return _configuredExtensionKindsMap.get(extensions_1.ExtensionIdentifier.toKey(extensionId));
    }
    function toArray(extensionKind) {
        if (Array.isArray(extensionKind)) {
            return extensionKind;
        }
        return extensionKind === 'ui' ? ['ui', 'workspace'] : [extensionKind];
    }
});
//# sourceMappingURL=extensionsUtil.js.map