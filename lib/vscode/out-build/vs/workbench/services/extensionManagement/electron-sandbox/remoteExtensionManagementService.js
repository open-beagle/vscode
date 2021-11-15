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
define(["require", "exports", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/log/common/log", "vs/base/common/errorMessage", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/nls!vs/workbench/services/extensionManagement/electron-sandbox/remoteExtensionManagementService", "vs/platform/product/common/productService", "vs/platform/configuration/common/configuration", "vs/base/common/uuid", "vs/base/common/resources", "vs/workbench/services/extensionManagement/common/remoteExtensionManagementService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/base/common/async", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, extensionManagement_1, extensionManagementUtil_1, log_1, errorMessage_1, arrays_1, cancellation_1, nls_1, productService_1, configuration_1, uuid_1, resources_1, remoteExtensionManagementService_1, environmentService_1, async_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeRemoteExtensionManagementService = void 0;
    let NativeRemoteExtensionManagementService = class NativeRemoteExtensionManagementService extends remoteExtensionManagementService_1.WebRemoteExtensionManagementService {
        constructor(channel, localExtensionManagementServer, logService, galleryService, configurationService, productService, environmentService, extensionManifestPropertiesService) {
            super(channel, galleryService, configurationService, productService, extensionManifestPropertiesService);
            this.logService = logService;
            this.environmentService = environmentService;
            this.localExtensionManagementService = localExtensionManagementServer.extensionManagementService;
        }
        async install(vsix) {
            const local = await super.install(vsix);
            await this.installUIDependenciesAndPackedExtensions(local);
            return local;
        }
        async installFromGallery(extension, installOptions) {
            const local = await this.doInstallFromGallery(extension, installOptions);
            await this.installUIDependenciesAndPackedExtensions(local);
            return local;
        }
        async doInstallFromGallery(extension, installOptions) {
            if (this.configurationService.getValue('remote.downloadExtensionsLocally')) {
                this.logService.trace(`Download '${extension.identifier.id}' extension locally and install`);
                return this.downloadCompatibleAndInstall(extension);
            }
            try {
                const local = await super.installFromGallery(extension, installOptions);
                return local;
            }
            catch (error) {
                try {
                    this.logService.error(`Error while installing '${extension.identifier.id}' extension in the remote server.`, (0, errorMessage_1.toErrorMessage)(error));
                    this.logService.info(`Trying to download '${extension.identifier.id}' extension locally and install`);
                    const local = await this.downloadCompatibleAndInstall(extension);
                    this.logService.info(`Successfully installed '${extension.identifier.id}' extension`);
                    return local;
                }
                catch (e) {
                    this.logService.error(e);
                    throw error;
                }
            }
        }
        async downloadCompatibleAndInstall(extension) {
            const installed = await this.getInstalled(1 /* User */);
            const compatible = await this.galleryService.getCompatibleExtension(extension);
            if (!compatible) {
                return Promise.reject(new Error((0, nls_1.localize)(0, null, extension.identifier.id, this.productService.version)));
            }
            const manifest = await this.galleryService.getManifest(compatible, cancellation_1.CancellationToken.None);
            if (manifest) {
                const workspaceExtensions = await this.getAllWorkspaceDependenciesAndPackedExtensions(manifest, cancellation_1.CancellationToken.None);
                await async_1.Promises.settled(workspaceExtensions.map(e => this.downloadAndInstall(e, installed)));
            }
            return this.downloadAndInstall(extension, installed);
        }
        async downloadAndInstall(extension, installed) {
            const location = (0, resources_1.joinPath)(this.environmentService.tmpDir, (0, uuid_1.generateUuid)());
            await this.galleryService.download(extension, location, installed.filter(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier))[0] ? 2 /* Update */ : 1 /* Install */);
            return super.install(location);
        }
        async installUIDependenciesAndPackedExtensions(local) {
            const uiExtensions = await this.getAllUIDependenciesAndPackedExtensions(local.manifest, cancellation_1.CancellationToken.None);
            const installed = await this.localExtensionManagementService.getInstalled();
            const toInstall = uiExtensions.filter(e => installed.every(i => !(0, extensionManagementUtil_1.areSameExtensions)(i.identifier, e.identifier)));
            await async_1.Promises.settled(toInstall.map(d => this.localExtensionManagementService.installFromGallery(d)));
        }
        async getAllUIDependenciesAndPackedExtensions(manifest, token) {
            const result = new Map();
            const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
            await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, true, token);
            return [...result.values()];
        }
        async getAllWorkspaceDependenciesAndPackedExtensions(manifest, token) {
            const result = new Map();
            const extensions = [...(manifest.extensionPack || []), ...(manifest.extensionDependencies || [])];
            await this.getDependenciesAndPackedExtensionsRecursively(extensions, result, false, token);
            return [...result.values()];
        }
        async getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token) {
            if (toGet.length === 0) {
                return Promise.resolve();
            }
            const extensions = (0, arrays_1.coalesce)(await async_1.Promises.settled(toGet.map(id => this.galleryService.getCompatibleExtension({ id }))));
            const manifests = await Promise.all(extensions.map(e => this.galleryService.getManifest(e, token)));
            const extensionsManifests = [];
            for (let idx = 0; idx < extensions.length; idx++) {
                const extension = extensions[idx];
                const manifest = manifests[idx];
                if (manifest && this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest) === uiExtension) {
                    result.set(extension.identifier.id.toLowerCase(), extension);
                    extensionsManifests.push(manifest);
                }
            }
            toGet = [];
            for (const extensionManifest of extensionsManifests) {
                if ((0, arrays_1.isNonEmptyArray)(extensionManifest.extensionDependencies)) {
                    for (const id of extensionManifest.extensionDependencies) {
                        if (!result.has(id.toLowerCase())) {
                            toGet.push(id);
                        }
                    }
                }
                if ((0, arrays_1.isNonEmptyArray)(extensionManifest.extensionPack)) {
                    for (const id of extensionManifest.extensionPack) {
                        if (!result.has(id.toLowerCase())) {
                            toGet.push(id);
                        }
                    }
                }
            }
            return this.getDependenciesAndPackedExtensionsRecursively(toGet, result, uiExtension, token);
        }
    };
    NativeRemoteExtensionManagementService = __decorate([
        __param(2, log_1.ILogService),
        __param(3, extensionManagement_1.IExtensionGalleryService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, productService_1.IProductService),
        __param(6, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(7, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], NativeRemoteExtensionManagementService);
    exports.NativeRemoteExtensionManagementService = NativeRemoteExtensionManagementService;
});
//# sourceMappingURL=remoteExtensionManagementService.js.map