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
define(["require", "exports", "vs/base/common/event", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/nls!vs/workbench/services/extensionManagement/common/webExtensionManagementService"], function (require, exports, event_1, extensionManagementUtil_1, extensionManagement_1, log_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebExtensionManagementService = void 0;
    let WebExtensionManagementService = class WebExtensionManagementService extends lifecycle_1.Disposable {
        constructor(webExtensionsScannerService, logService) {
            super();
            this.webExtensionsScannerService = webExtensionsScannerService;
            this.logService = logService;
            this._onInstallExtension = this._register(new event_1.Emitter());
            this.onInstallExtension = this._onInstallExtension.event;
            this._onDidInstallExtension = this._register(new event_1.Emitter());
            this.onDidInstallExtension = this._onDidInstallExtension.event;
            this._onUninstallExtension = this._register(new event_1.Emitter());
            this.onUninstallExtension = this._onUninstallExtension.event;
            this._onDidUninstallExtension = this._register(new event_1.Emitter());
            this.onDidUninstallExtension = this._onDidUninstallExtension.event;
        }
        async getInstalled(type) {
            const extensions = await this.webExtensionsScannerService.scanAndTranslateExtensions(type);
            return Promise.all(extensions.map(e => this.toLocalExtension(e)));
        }
        async canInstall(gallery) {
            return this.webExtensionsScannerService.canAddExtension(gallery);
        }
        async installFromGallery(gallery) {
            if (!(await this.canInstall(gallery))) {
                throw new Error((0, nls_1.localize)(0, null, gallery.displayName || gallery.name));
            }
            this.logService.info('Installing extension:', gallery.identifier.id);
            this._onInstallExtension.fire({ identifier: gallery.identifier, gallery });
            try {
                const existingExtension = await this.getUserExtension(gallery.identifier);
                const scannedExtension = await this.webExtensionsScannerService.addExtension(gallery);
                const local = await this.toLocalExtension(scannedExtension);
                if (existingExtension && existingExtension.manifest.version !== gallery.version) {
                    await this.webExtensionsScannerService.removeExtension(existingExtension.identifier, existingExtension.manifest.version);
                }
                this._onDidInstallExtension.fire({ local, identifier: gallery.identifier, operation: 1 /* Install */, gallery });
                return local;
            }
            catch (error) {
                this._onDidInstallExtension.fire({ error, identifier: gallery.identifier, operation: 1 /* Install */, gallery });
                throw error;
            }
        }
        async uninstall(extension) {
            this._onUninstallExtension.fire(extension.identifier);
            try {
                await this.webExtensionsScannerService.removeExtension(extension.identifier);
                this._onDidUninstallExtension.fire({ identifier: extension.identifier });
            }
            catch (error) {
                this.logService.error(error);
                this._onDidUninstallExtension.fire({ error, identifier: extension.identifier });
                throw error;
            }
        }
        async updateMetadata(local, metadata) {
            return local;
        }
        async getUserExtension(identifier) {
            const userExtensions = await this.getInstalled(1 /* User */);
            return userExtensions.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier));
        }
        async toLocalExtension(scannedExtension) {
            return {
                type: scannedExtension.type,
                identifier: scannedExtension.identifier,
                manifest: scannedExtension.packageJSON,
                location: scannedExtension.location,
                isMachineScoped: false,
                publisherId: null,
                publisherDisplayName: null,
                isBuiltin: scannedExtension.type === 0 /* System */
            };
        }
        zip(extension) { throw new Error('unsupported'); }
        unzip(zipLocation) { throw new Error('unsupported'); }
        getManifest(vsix) { throw new Error('unsupported'); }
        install(vsix) { throw new Error('unsupported'); }
        reinstallFromGallery(extension) { throw new Error('unsupported'); }
        getExtensionsReport() { throw new Error('unsupported'); }
        updateExtensionScope() { throw new Error('unsupported'); }
    };
    WebExtensionManagementService = __decorate([
        __param(0, extensionManagement_1.IWebExtensionsScannerService),
        __param(1, log_1.ILogService)
    ], WebExtensionManagementService);
    exports.WebExtensionManagementService = WebExtensionManagementService;
});
//# sourceMappingURL=webExtensionManagementService.js.map