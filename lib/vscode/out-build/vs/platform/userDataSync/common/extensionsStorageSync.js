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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/platform/storage/common/storage"], function (require, exports, arrays_1, event_1, lifecycle_1, extensionManagementUtil_1, instantiation_1, productService_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsStorageSyncService = exports.IExtensionsStorageSyncService = void 0;
    exports.IExtensionsStorageSyncService = (0, instantiation_1.createDecorator)('IExtensionsStorageSyncService');
    const EXTENSION_KEYS_ID_VERSION_REGEX = /^extensionKeys\/([^.]+\..+)@(\d+\.\d+\.\d+(-.*)?)$/;
    let ExtensionsStorageSyncService = class ExtensionsStorageSyncService extends lifecycle_1.Disposable {
        constructor(storageService, productService) {
            super();
            this.storageService = storageService;
            this.productService = productService;
            this._onDidChangeExtensionsStorage = this._register(new event_1.Emitter());
            this.onDidChangeExtensionsStorage = this._onDidChangeExtensionsStorage.event;
            this.extensionsWithKeysForSync = new Set();
            this.initialize();
            this._register(this.storageService.onDidChangeValue(e => this.onDidChangeStorageValue(e)));
        }
        static toKey(extension) {
            return `extensionKeys/${(0, extensionManagementUtil_1.adoptToGalleryExtensionId)(extension.id)}@${extension.version}`;
        }
        static fromKey(key) {
            const matches = EXTENSION_KEYS_ID_VERSION_REGEX.exec(key);
            if (matches && matches[1]) {
                return { id: matches[1], version: matches[2] };
            }
            return undefined;
        }
        initialize() {
            const keys = this.storageService.keys(0 /* GLOBAL */, 1 /* MACHINE */);
            for (const key of keys) {
                const extensionIdWithVersion = ExtensionsStorageSyncService.fromKey(key);
                if (extensionIdWithVersion) {
                    this.extensionsWithKeysForSync.add(extensionIdWithVersion.id.toLowerCase());
                }
            }
        }
        onDidChangeStorageValue(e) {
            if (e.scope !== 0 /* GLOBAL */) {
                return;
            }
            // State of extension with keys for sync has changed
            if (this.extensionsWithKeysForSync.has(e.key.toLowerCase())) {
                this._onDidChangeExtensionsStorage.fire();
                return;
            }
            // Keys for sync of an extension has changed
            const extensionIdWithVersion = ExtensionsStorageSyncService.fromKey(e.key);
            if (extensionIdWithVersion) {
                this.extensionsWithKeysForSync.add(extensionIdWithVersion.id.toLowerCase());
                this._onDidChangeExtensionsStorage.fire();
                return;
            }
        }
        setKeysForSync(extensionIdWithVersion, keys) {
            this.storageService.store(ExtensionsStorageSyncService.toKey(extensionIdWithVersion), JSON.stringify(keys), 0 /* GLOBAL */, 1 /* MACHINE */);
        }
        getKeysForSync(extensionIdWithVersion) {
            var _a;
            const extensionKeysForSyncFromProduct = (_a = this.productService.extensionSyncedKeys) === null || _a === void 0 ? void 0 : _a[extensionIdWithVersion.id.toLowerCase()];
            const extensionKeysForSyncFromStorageValue = this.storageService.get(ExtensionsStorageSyncService.toKey(extensionIdWithVersion), 0 /* GLOBAL */);
            const extensionKeysForSyncFromStorage = extensionKeysForSyncFromStorageValue ? JSON.parse(extensionKeysForSyncFromStorageValue) : undefined;
            return extensionKeysForSyncFromStorage && extensionKeysForSyncFromProduct
                ? (0, arrays_1.distinct)([...extensionKeysForSyncFromStorage, ...extensionKeysForSyncFromProduct])
                : (extensionKeysForSyncFromStorage || extensionKeysForSyncFromProduct);
        }
    };
    ExtensionsStorageSyncService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, productService_1.IProductService)
    ], ExtensionsStorageSyncService);
    exports.ExtensionsStorageSyncService = ExtensionsStorageSyncService;
});
//# sourceMappingURL=extensionsStorageSync.js.map