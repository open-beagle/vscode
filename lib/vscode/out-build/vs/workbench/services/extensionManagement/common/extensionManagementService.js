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
define(["require", "exports", "vs/base/common/event", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/nls!vs/workbench/services/extensionManagement/common/extensionManagementService", "vs/platform/product/common/productService", "vs/base/common/network", "vs/platform/download/common/download", "vs/base/common/arrays", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/base/common/errors", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/platform", "vs/base/common/async", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, event_1, extensionManagement_1, extensionManagement_2, extensions_1, lifecycle_1, configuration_1, cancellation_1, extensionManagementUtil_1, nls_1, productService_1, network_1, download_1, arrays_1, dialogs_1, severity_1, errors_1, userDataSync_1, platform_1, async_1, workspaceTrust_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementService = void 0;
    let ExtensionManagementService = class ExtensionManagementService extends lifecycle_1.Disposable {
        constructor(extensionManagementServerService, extensionGalleryService, configurationService, productService, downloadService, userDataAutoSyncEnablementService, userDataSyncResourceEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService) {
            super();
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionGalleryService = extensionGalleryService;
            this.configurationService = configurationService;
            this.productService = productService;
            this.downloadService = downloadService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.userDataSyncResourceEnablementService = userDataSyncResourceEnablementService;
            this.dialogService = dialogService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.servers = [];
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.localExtensionManagementServer);
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.remoteExtensionManagementServer);
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                this.servers.push(this.extensionManagementServerService.webExtensionManagementServer);
            }
            this.onInstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(server.extensionManagementService.onInstallExtension); return emitter; }, new event_1.EventMultiplexer())).event;
            this.onDidInstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(server.extensionManagementService.onDidInstallExtension); return emitter; }, new event_1.EventMultiplexer())).event;
            this.onUninstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(server.extensionManagementService.onUninstallExtension); return emitter; }, new event_1.EventMultiplexer())).event;
            this.onDidUninstallExtension = this._register(this.servers.reduce((emitter, server) => { emitter.add(server.extensionManagementService.onDidUninstallExtension); return emitter; }, new event_1.EventMultiplexer())).event;
        }
        async getInstalled(type) {
            const result = await Promise.all(this.servers.map(({ extensionManagementService }) => extensionManagementService.getInstalled(type)));
            return (0, arrays_1.flatten)(result);
        }
        async uninstall(extension, options) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            if (this.servers.length > 1) {
                if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                    return this.uninstallEverywhere(extension);
                }
                return this.uninstallInServer(extension, server, options);
            }
            return server.extensionManagementService.uninstall(extension);
        }
        async uninstallEverywhere(extension) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const promise = server.extensionManagementService.uninstall(extension);
            const otherServers = this.servers.filter(s => s !== server);
            if (otherServers.length) {
                for (const otherServer of otherServers) {
                    const installed = await otherServer.extensionManagementService.getInstalled();
                    extension = installed.filter(i => !i.isBuiltin && (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier))[0];
                    if (extension) {
                        await otherServer.extensionManagementService.uninstall(extension);
                    }
                }
            }
            return promise;
        }
        async uninstallInServer(extension, server, options) {
            if (server === this.extensionManagementServerService.localExtensionManagementServer) {
                const installedExtensions = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getInstalled(1 /* User */);
                const dependentNonUIExtensions = installedExtensions.filter(i => !this.extensionManifestPropertiesService.prefersExecuteOnUI(i.manifest)
                    && i.manifest.extensionDependencies && i.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)));
                if (dependentNonUIExtensions.length) {
                    return Promise.reject(new Error(this.getDependentsErrorMessage(extension, dependentNonUIExtensions)));
                }
            }
            return server.extensionManagementService.uninstall(extension, options);
        }
        getDependentsErrorMessage(extension, dependents) {
            if (dependents.length === 1) {
                return (0, nls_1.localize)(0, null, extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return (0, nls_1.localize)(1, null, extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return (0, nls_1.localize)(2, null, extension.manifest.displayName || extension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        async reinstallFromGallery(extension) {
            const server = this.getServer(extension);
            if (server) {
                await this.checkForWorkspaceTrust(extension.manifest);
                return server.extensionManagementService.reinstallFromGallery(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        updateMetadata(extension, metadata) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.updateMetadata(extension, metadata);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        updateExtensionScope(extension, isMachineScoped) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.updateExtensionScope(extension, isMachineScoped);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        zip(extension) {
            const server = this.getServer(extension);
            if (server) {
                return server.extensionManagementService.zip(extension);
            }
            return Promise.reject(`Invalid location ${extension.location.toString()}`);
        }
        unzip(zipLocation) {
            return async_1.Promises.settled(this.servers
                // Filter out web server
                .filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer)
                .map(({ extensionManagementService }) => extensionManagementService.unzip(zipLocation))).then(([extensionIdentifier]) => extensionIdentifier);
        }
        async install(vsix) {
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                const manifest = await this.getManifest(vsix);
                if ((0, extensions_1.isLanguagePackExtension)(manifest)) {
                    // Install on both servers
                    const [local] = await async_1.Promises.settled([this.extensionManagementServerService.localExtensionManagementServer, this.extensionManagementServerService.remoteExtensionManagementServer].map(server => this.installVSIX(vsix, server)));
                    return local;
                }
                if (this.extensionManifestPropertiesService.prefersExecuteOnUI(manifest)) {
                    // Install only on local server
                    return this.installVSIX(vsix, this.extensionManagementServerService.localExtensionManagementServer);
                }
                // Install only on remote server
                return this.installVSIX(vsix, this.extensionManagementServerService.remoteExtensionManagementServer);
            }
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.installVSIX(vsix, this.extensionManagementServerService.localExtensionManagementServer);
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.installVSIX(vsix, this.extensionManagementServerService.remoteExtensionManagementServer);
            }
            return Promise.reject('No Servers to Install');
        }
        async installVSIX(vsix, server) {
            const manifest = await this.getManifest(vsix);
            if (manifest) {
                await this.checkForWorkspaceTrust(manifest);
                return server.extensionManagementService.install(vsix);
            }
            return Promise.reject('Unable to get the extension manifest.');
        }
        getManifest(vsix) {
            if (vsix.scheme === network_1.Schemas.file && this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            if (vsix.scheme === network_1.Schemas.vscodeRemote && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getManifest(vsix);
            }
            return Promise.reject('No Servers');
        }
        async canInstall(gallery) {
            for (const server of this.servers) {
                if (await server.extensionManagementService.canInstall(gallery)) {
                    return true;
                }
            }
            return false;
        }
        async updateFromGallery(gallery, extension) {
            const server = this.getServer(extension);
            if (!server) {
                return Promise.reject(`Invalid location ${extension.location.toString()}`);
            }
            const servers = [];
            // Update Language pack on local and remote servers
            if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
            }
            else {
                servers.push(server);
            }
            return async_1.Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery))).then(([local]) => local);
        }
        async installExtensions(extensions, installOptions) {
            if (!installOptions) {
                const isMachineScoped = await this.hasToFlagExtensionsMachineScoped(extensions);
                installOptions = { isMachineScoped, isBuiltin: false };
            }
            return async_1.Promises.settled(extensions.map(extension => this.installFromGallery(extension, installOptions)));
        }
        async installFromGallery(gallery, installOptions) {
            const manifest = await this.extensionGalleryService.getManifest(gallery, cancellation_1.CancellationToken.None);
            if (!manifest) {
                return Promise.reject((0, nls_1.localize)(3, null, gallery.displayName || gallery.name));
            }
            const servers = [];
            // Install Language pack on local and remote servers
            if ((0, extensions_1.isLanguagePackExtension)(manifest)) {
                servers.push(...this.servers.filter(server => server !== this.extensionManagementServerService.webExtensionManagementServer));
            }
            else {
                const server = this.getExtensionManagementServerToInstall(manifest);
                if (server) {
                    servers.push(server);
                }
            }
            if (servers.length) {
                if (!installOptions) {
                    const isMachineScoped = await this.hasToFlagExtensionsMachineScoped([gallery]);
                    installOptions = { isMachineScoped, isBuiltin: false };
                }
                if (!installOptions.isMachineScoped && this.isExtensionsSyncEnabled()) {
                    if (this.extensionManagementServerService.localExtensionManagementServer && !servers.includes(this.extensionManagementServerService.localExtensionManagementServer)) {
                        servers.push(this.extensionManagementServerService.localExtensionManagementServer);
                    }
                }
                await this.checkForWorkspaceTrust(manifest);
                return async_1.Promises.settled(servers.map(server => server.extensionManagementService.installFromGallery(gallery, installOptions))).then(([local]) => local);
            }
            const error = new Error((0, nls_1.localize)(4, null, gallery.displayName || gallery.name));
            error.name = extensionManagement_1.INSTALL_ERROR_NOT_SUPPORTED;
            return Promise.reject(error);
        }
        getExtensionManagementServerToInstall(manifest) {
            // Only local server
            if (this.servers.length === 1 && this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer;
            }
            const extensionKind = this.extensionManifestPropertiesService.getExtensionKind(manifest);
            for (const kind of extensionKind) {
                if (kind === 'ui' && this.extensionManagementServerService.localExtensionManagementServer) {
                    return this.extensionManagementServerService.localExtensionManagementServer;
                }
                if (kind === 'workspace' && this.extensionManagementServerService.remoteExtensionManagementServer) {
                    return this.extensionManagementServerService.remoteExtensionManagementServer;
                }
                if (kind === 'web' && this.extensionManagementServerService.webExtensionManagementServer) {
                    return this.extensionManagementServerService.webExtensionManagementServer;
                }
            }
            // NOTE@coder: Fall back to installing on the remote server on web.
            if (platform_1.isWeb && this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer;
            }
            // Local server can accept any extension. So return local server if not compatible server found.
            return this.extensionManagementServerService.localExtensionManagementServer;
        }
        isExtensionsSyncEnabled() {
            return this.userDataAutoSyncEnablementService.isEnabled() && this.userDataSyncResourceEnablementService.isResourceEnabled("extensions" /* Extensions */);
        }
        async hasToFlagExtensionsMachineScoped(extensions) {
            if (this.isExtensionsSyncEnabled()) {
                const result = await this.dialogService.show(severity_1.default.Info, extensions.length === 1 ? (0, nls_1.localize)(5, null) : (0, nls_1.localize)(6, null), [
                    (0, nls_1.localize)(7, null),
                    (0, nls_1.localize)(8, null),
                    (0, nls_1.localize)(9, null),
                ], {
                    cancelId: 2,
                    detail: extensions.length === 1
                        ? (0, nls_1.localize)(10, null, extensions[0].displayName)
                        : (0, nls_1.localize)(11, null)
                });
                switch (result.choice) {
                    case 0:
                        return false;
                    case 1:
                        return true;
                }
                throw (0, errors_1.canceled)();
            }
            return false;
        }
        getExtensionsReport() {
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                return this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getExtensionsReport();
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                return this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getExtensionsReport();
            }
            return Promise.resolve([]);
        }
        getServer(extension) {
            return this.extensionManagementServerService.getExtensionManagementServer(extension);
        }
        async checkForWorkspaceTrust(manifest) {
            if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(manifest) === false) {
                const trustState = await this.workspaceTrustRequestService.requestWorkspaceTrust({
                    modal: true,
                    message: (0, nls_1.localize)(12, null),
                    buttons: [
                        { label: (0, nls_1.localize)(13, null), type: 'ContinueWithTrust' },
                        { label: (0, nls_1.localize)(14, null), type: 'ContinueWithoutTrust' },
                        { label: (0, nls_1.localize)(15, null), type: 'Manage' }
                    ]
                });
                if (trustState === undefined) {
                    return Promise.reject((0, errors_1.canceled)());
                }
            }
            return Promise.resolve();
        }
    };
    ExtensionManagementService = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, productService_1.IProductService),
        __param(4, download_1.IDownloadService),
        __param(5, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(6, userDataSync_1.IUserDataSyncResourceEnablementService),
        __param(7, dialogs_1.IDialogService),
        __param(8, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(9, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], ExtensionManagementService);
    exports.ExtensionManagementService = ExtensionManagementService;
});
//# sourceMappingURL=extensionManagementService.js.map