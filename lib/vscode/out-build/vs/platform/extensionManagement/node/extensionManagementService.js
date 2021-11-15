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
define(["require", "exports", "fs", "vs/nls!vs/platform/extensionManagement/node/extensionManagementService", "vs/base/common/path", "vs/base/node/pfs", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/base/node/zip", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/environment/common/environment", "vs/base/common/async", "vs/base/common/event", "vs/base/common/semver/semver", "vs/base/common/uri", "vs/platform/product/common/product", "vs/base/common/platform", "vs/platform/log/common/log", "vs/platform/extensionManagement/node/extensionsManifestCache", "vs/base/common/errorMessage", "vs/platform/telemetry/common/telemetry", "vs/platform/extensions/common/extensionValidator", "vs/base/common/resources", "vs/base/common/uuid", "vs/platform/download/common/download", "vs/platform/instantiation/common/instantiation", "vs/base/common/network", "vs/base/common/cancellation", "vs/platform/extensionManagement/node/extensionManagementUtil", "vs/platform/extensionManagement/node/extensionDownloader", "vs/platform/extensionManagement/node/extensionsScanner", "vs/platform/extensionManagement/node/extensionLifecycle", "vs/platform/extensionManagement/node/extensionsWatcher", "vs/platform/files/common/files"], function (require, exports, fs, nls, path, pfs, lifecycle_1, arrays_1, zip_1, extensionManagement_1, extensionManagementUtil_1, environment_1, async_1, event_1, semver, uri_1, product_1, platform_1, log_1, extensionsManifestCache_1, errorMessage_1, telemetry_1, extensionValidator_1, resources_1, uuid_1, download_1, instantiation_1, network_1, cancellation_1, extensionManagementUtil_2, extensionDownloader_1, extensionsScanner_1, extensionLifecycle_1, extensionsWatcher_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementService = void 0;
    const INSTALL_ERROR_UNSET_UNINSTALLED = 'unsetUninstalled';
    const INSTALL_ERROR_DOWNLOADING = 'downloading';
    const INSTALL_ERROR_VALIDATING = 'validating';
    const INSTALL_ERROR_LOCAL = 'local';
    const ERROR_UNKNOWN = 'unknown';
    let ExtensionManagementService = class ExtensionManagementService extends lifecycle_1.Disposable {
        constructor(environmentService, galleryService, logService, downloadService, telemetryService, instantiationService, fileService) {
            super();
            this.environmentService = environmentService;
            this.galleryService = galleryService;
            this.logService = logService;
            this.downloadService = downloadService;
            this.telemetryService = telemetryService;
            this.lastReportTimestamp = 0;
            this.installingExtensions = new Map();
            this.uninstallingExtensions = new Map();
            this._onInstallExtension = this._register(new event_1.Emitter());
            this.onInstallExtension = this._onInstallExtension.event;
            this._onDidInstallExtension = this._register(new event_1.Emitter());
            this.onDidInstallExtension = this._onDidInstallExtension.event;
            this._onUninstallExtension = this._register(new event_1.Emitter());
            this.onUninstallExtension = this._onUninstallExtension.event;
            this._onDidUninstallExtension = this._register(new event_1.Emitter());
            this.onDidUninstallExtension = this._onDidUninstallExtension.event;
            const extensionLifecycle = this._register(instantiationService.createInstance(extensionLifecycle_1.ExtensionsLifecycle));
            this.extensionsScanner = this._register(instantiationService.createInstance(extensionsScanner_1.ExtensionsScanner, extension => extensionLifecycle.postUninstall(extension)));
            this.manifestCache = this._register(new extensionsManifestCache_1.ExtensionsManifestCache(environmentService, this));
            this.extensionsDownloader = this._register(instantiationService.createInstance(extensionDownloader_1.ExtensionsDownloader));
            const extensionsWatcher = this._register(new extensionsWatcher_1.ExtensionsWatcher(this, fileService, environmentService, logService));
            this._register(extensionsWatcher.onDidChangeExtensionsByAnotherSource(({ added, removed }) => {
                added.forEach(extension => this._onDidInstallExtension.fire({ identifier: extension.identifier, operation: 0 /* None */, local: extension }));
                removed.forEach(extension => this._onDidUninstallExtension.fire({ identifier: extension }));
            }));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.installingExtensions.forEach(promise => promise.cancel());
                this.uninstallingExtensions.forEach(promise => promise.cancel());
                this.installingExtensions.clear();
                this.uninstallingExtensions.clear();
            }));
        }
        async zip(extension) {
            this.logService.trace('ExtensionManagementService#zip', extension.identifier.id);
            const files = await this.collectFiles(extension);
            const location = await (0, zip_1.zip)((0, resources_1.joinPath)(this.environmentService.tmpDir, (0, uuid_1.generateUuid)()).fsPath, files);
            return uri_1.URI.file(location);
        }
        async unzip(zipLocation) {
            this.logService.trace('ExtensionManagementService#unzip', zipLocation.toString());
            const local = await this.install(zipLocation);
            return local.identifier;
        }
        async getManifest(vsix) {
            const downloadLocation = await this.downloadVsix(vsix);
            const zipPath = path.resolve(downloadLocation.fsPath);
            return (0, extensionManagementUtil_2.getManifest)(zipPath);
        }
        async collectFiles(extension) {
            const collectFilesFromDirectory = async (dir) => {
                let entries = await pfs.readdir(dir);
                entries = entries.map(e => path.join(dir, e));
                const stats = await Promise.all(entries.map(e => fs.promises.stat(e)));
                let promise = Promise.resolve([]);
                stats.forEach((stat, index) => {
                    const entry = entries[index];
                    if (stat.isFile()) {
                        promise = promise.then(result => ([...result, entry]));
                    }
                    if (stat.isDirectory()) {
                        promise = promise
                            .then(result => collectFilesFromDirectory(entry)
                            .then(files => ([...result, ...files])));
                    }
                });
                return promise;
            };
            const files = await collectFilesFromDirectory(extension.location.fsPath);
            return files.map(f => ({ path: `extension/${path.relative(extension.location.fsPath, f)}`, localPath: f }));
        }
        async install(vsix, options = {}) {
            this.logService.trace('ExtensionManagementService#install', vsix.toString());
            return (0, async_1.createCancelablePromise)(async (token) => {
                const downloadLocation = await this.downloadVsix(vsix);
                const zipPath = path.resolve(downloadLocation.fsPath);
                const manifest = await (0, extensionManagementUtil_2.getManifest)(zipPath);
                const identifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) };
                let operation = 1 /* Install */;
                if (manifest.engines && manifest.engines.vscode && !(0, extensionValidator_1.isEngineValid)(manifest.engines.vscode, product_1.default.version)) {
                    throw new Error(nls.localize(0, null, identifier.id, product_1.default.version));
                }
                const identifierWithVersion = new extensionManagementUtil_1.ExtensionIdentifierWithVersion(identifier, manifest.version);
                const installedExtensions = await this.getInstalled(1 /* User */);
                const existing = installedExtensions.find(i => (0, extensionManagementUtil_1.areSameExtensions)(identifier, i.identifier));
                if (existing) {
                    options.isMachineScoped = options.isMachineScoped || existing.isMachineScoped;
                    options.isBuiltin = options.isBuiltin || existing.isBuiltin;
                    operation = 2 /* Update */;
                    if (identifierWithVersion.equals(new extensionManagementUtil_1.ExtensionIdentifierWithVersion(existing.identifier, existing.manifest.version))) {
                        try {
                            await this.extensionsScanner.removeExtension(existing, 'existing');
                        }
                        catch (e) {
                            throw new Error(nls.localize(1, null, manifest.displayName || manifest.name));
                        }
                    }
                    else if (semver.gt(existing.manifest.version, manifest.version)) {
                        await this.uninstallExtension(existing);
                    }
                }
                else {
                    // Remove the extension with same version if it is already uninstalled.
                    // Installing a VSIX extension shall replace the existing extension always.
                    const existing = await this.unsetUninstalledAndGetLocal(identifierWithVersion);
                    if (existing) {
                        try {
                            await this.extensionsScanner.removeExtension(existing, 'existing');
                        }
                        catch (e) {
                            throw new Error(nls.localize(2, null, manifest.displayName || manifest.name));
                        }
                    }
                }
                this.logService.info('Installing the extension:', identifier.id);
                this._onInstallExtension.fire({ identifier, zipPath });
                let metadata;
                try {
                    metadata = await this.getGalleryMetadata((0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name));
                }
                catch (e) { /* Ignore */ }
                try {
                    const local = await this.installFromZipPath(identifierWithVersion, zipPath, Object.assign(Object.assign({}, (metadata || {})), options), options, operation, token);
                    this.logService.info('Successfully installed the extension:', identifier.id);
                    return local;
                }
                catch (e) {
                    this.logService.error('Failed to install the extension:', identifier.id, e.message);
                    throw e;
                }
            });
        }
        async downloadVsix(vsix) {
            if (vsix.scheme === network_1.Schemas.file) {
                return vsix;
            }
            if (!this.downloadService) {
                throw new Error('Download service is not available');
            }
            const downloadedLocation = (0, resources_1.joinPath)(this.environmentService.tmpDir, (0, uuid_1.generateUuid)());
            await this.downloadService.download(vsix, downloadedLocation);
            return downloadedLocation;
        }
        async installFromZipPath(identifierWithVersion, zipPath, metadata, options, operation, token) {
            try {
                const local = await this.installExtension({ zipPath, identifierWithVersion, metadata }, token);
                try {
                    await this.installDependenciesAndPackExtensions(local, undefined, options);
                }
                catch (error) {
                    if ((0, arrays_1.isNonEmptyArray)(local.manifest.extensionDependencies)) {
                        this.logService.warn(`Cannot install dependencies of extension:`, local.identifier.id, error.message);
                    }
                    if ((0, arrays_1.isNonEmptyArray)(local.manifest.extensionPack)) {
                        this.logService.warn(`Cannot install packed extensions of extension:`, local.identifier.id, error.message);
                    }
                }
                this._onDidInstallExtension.fire({ identifier: identifierWithVersion, zipPath, local, operation });
                return local;
            }
            catch (error) {
                this._onDidInstallExtension.fire({ identifier: identifierWithVersion, zipPath, operation, error });
                throw error;
            }
        }
        async canInstall(extension) {
            return true;
        }
        async installFromGallery(extension, options = {}) {
            if (!this.galleryService.isEnabled()) {
                throw new Error(nls.localize(3, null));
            }
            try {
                extension = await this.checkAndGetCompatibleVersion(extension);
            }
            catch (error) {
                const errorCode = error && error.code ? error.code : ERROR_UNKNOWN;
                this.logService.error(`Failed to install extension:`, extension.identifier.id, error ? error.message : errorCode);
                this.reportTelemetry(this.getTelemetryEvent(1 /* Install */), (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(extension), undefined, error);
                if (error instanceof Error) {
                    error.name = errorCode;
                }
                throw error;
            }
            const key = new extensionManagementUtil_1.ExtensionIdentifierWithVersion(extension.identifier, extension.version).key();
            let cancellablePromise = this.installingExtensions.get(key);
            if (!cancellablePromise) {
                cancellablePromise = (0, async_1.createCancelablePromise)(token => this.doInstallFromGallery(extension, options, token));
                this.installingExtensions.set(key, cancellablePromise);
                cancellablePromise.finally(() => this.installingExtensions.delete(key));
            }
            return cancellablePromise;
        }
        async doInstallFromGallery(extension, options, token) {
            const startTime = new Date().getTime();
            let operation = 1 /* Install */;
            this.logService.info('Installing extension:', extension.identifier.id);
            this._onInstallExtension.fire({ identifier: extension.identifier, gallery: extension });
            try {
                const installed = await this.getInstalled(1 /* User */);
                const existingExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, extension.identifier));
                if (existingExtension) {
                    operation = 2 /* Update */;
                }
                const installableExtension = await this.downloadInstallableExtension(extension, operation);
                installableExtension.metadata.isMachineScoped = options.isMachineScoped || (existingExtension === null || existingExtension === void 0 ? void 0 : existingExtension.isMachineScoped);
                installableExtension.metadata.isBuiltin = options.isBuiltin || (existingExtension === null || existingExtension === void 0 ? void 0 : existingExtension.isBuiltin);
                const local = await this.installExtension(installableExtension, token);
                try {
                    await this.extensionsDownloader.delete(uri_1.URI.file(installableExtension.zipPath));
                }
                catch (error) { /* Ignore */ }
                if (!options.donotIncludePackAndDependencies) {
                    try {
                        await this.installDependenciesAndPackExtensions(local, existingExtension, options);
                    }
                    catch (error) {
                        try {
                            await this.uninstall(local);
                        }
                        catch (error) { /* Ignore */ }
                        throw error;
                    }
                }
                if (existingExtension && semver.neq(existingExtension.manifest.version, extension.version)) {
                    await this.extensionsScanner.setUninstalled(existingExtension);
                }
                this.logService.info(`Extensions installed successfully:`, extension.identifier.id);
                this._onDidInstallExtension.fire({ identifier: extension.identifier, gallery: extension, local, operation });
                this.reportTelemetry(this.getTelemetryEvent(operation), (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(extension), new Date().getTime() - startTime, undefined);
                return local;
            }
            catch (error) {
                const errorCode = error && error.code ? error.code : ERROR_UNKNOWN;
                this.logService.error(`Failed to install extension:`, extension.identifier.id, error ? error.message : errorCode);
                this._onDidInstallExtension.fire({ identifier: extension.identifier, gallery: extension, operation, error: errorCode });
                this.reportTelemetry(this.getTelemetryEvent(operation), (0, extensionManagementUtil_1.getGalleryExtensionTelemetryData)(extension), new Date().getTime() - startTime, error);
                if (error instanceof Error) {
                    error.name = errorCode;
                }
                throw error;
            }
        }
        async checkAndGetCompatibleVersion(extension) {
            if (await this.isMalicious(extension)) {
                throw new extensionManagement_1.ExtensionManagementError(nls.localize(4, null), extensionManagement_1.INSTALL_ERROR_MALICIOUS);
            }
            const compatibleExtension = await this.galleryService.getCompatibleExtension(extension);
            if (!compatibleExtension) {
                throw new extensionManagement_1.ExtensionManagementError(nls.localize(5, null, extension.identifier.id, product_1.default.version), extensionManagement_1.INSTALL_ERROR_INCOMPATIBLE);
            }
            return compatibleExtension;
        }
        async reinstallFromGallery(extension) {
            this.logService.trace('ExtensionManagementService#reinstallFromGallery', extension.identifier.id);
            if (!this.galleryService.isEnabled()) {
                throw new Error(nls.localize(6, null));
            }
            const galleryExtension = await this.findGalleryExtension(extension);
            if (!galleryExtension) {
                throw new Error(nls.localize(7, null));
            }
            await this.extensionsScanner.setUninstalled(extension);
            try {
                await this.extensionsScanner.removeUninstalledExtension(extension);
            }
            catch (e) {
                throw new Error(nls.localize(8, null, (0, errorMessage_1.toErrorMessage)(e)));
            }
            await this.installFromGallery(galleryExtension);
        }
        getTelemetryEvent(operation) {
            return operation === 2 /* Update */ ? 'extensionGallery:update' : 'extensionGallery:install';
        }
        async isMalicious(extension) {
            const report = await this.getExtensionsReport();
            return (0, extensionManagementUtil_1.getMaliciousExtensionsSet)(report).has(extension.identifier.id);
        }
        async downloadInstallableExtension(extension, operation) {
            const metadata = {
                id: extension.identifier.uuid,
                publisherId: extension.publisherId,
                publisherDisplayName: extension.publisherDisplayName,
            };
            let zipPath;
            try {
                this.logService.trace('Started downloading extension:', extension.identifier.id);
                zipPath = (await this.extensionsDownloader.downloadExtension(extension, operation)).fsPath;
                this.logService.info('Downloaded extension:', extension.identifier.id, zipPath);
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError(this.joinErrors(error).message, INSTALL_ERROR_DOWNLOADING);
            }
            try {
                const manifest = await (0, extensionManagementUtil_2.getManifest)(zipPath);
                return { zipPath, identifierWithVersion: new extensionManagementUtil_1.ExtensionIdentifierWithVersion(extension.identifier, manifest.version), metadata };
            }
            catch (error) {
                throw new extensionManagement_1.ExtensionManagementError(this.joinErrors(error).message, INSTALL_ERROR_VALIDATING);
            }
        }
        async installExtension(installableExtension, token) {
            try {
                const local = await this.unsetUninstalledAndGetLocal(installableExtension.identifierWithVersion);
                if (local) {
                    return installableExtension.metadata ? this.extensionsScanner.saveMetadataForLocalExtension(local, installableExtension.metadata) : local;
                }
            }
            catch (e) {
                if (platform_1.isMacintosh) {
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize(9, null), INSTALL_ERROR_UNSET_UNINSTALLED);
                }
                else {
                    throw new extensionManagement_1.ExtensionManagementError(nls.localize(10, null), INSTALL_ERROR_UNSET_UNINSTALLED);
                }
            }
            return this.extractAndInstall(installableExtension, token);
        }
        async unsetUninstalledAndGetLocal(identifierWithVersion) {
            const isUninstalled = await this.isUninstalled(identifierWithVersion);
            if (!isUninstalled) {
                return null;
            }
            this.logService.trace('Removing the extension from uninstalled list:', identifierWithVersion.id);
            // If the same version of extension is marked as uninstalled, remove it from there and return the local.
            const local = await this.extensionsScanner.setInstalled(identifierWithVersion);
            this.logService.info('Removed the extension from uninstalled list:', identifierWithVersion.id);
            return local;
        }
        async extractAndInstall({ zipPath, identifierWithVersion, metadata }, token) {
            let local = await this.extensionsScanner.extractUserExtension(identifierWithVersion, zipPath, token);
            this.logService.info('Installation completed.', identifierWithVersion.id);
            if (metadata) {
                local = await this.extensionsScanner.saveMetadataForLocalExtension(local, metadata);
            }
            return local;
        }
        async installDependenciesAndPackExtensions(installed, existing, options) {
            if (!this.galleryService.isEnabled()) {
                return;
            }
            const dependenciesAndPackExtensions = installed.manifest.extensionDependencies || [];
            if (installed.manifest.extensionPack) {
                for (const extension of installed.manifest.extensionPack) {
                    // add only those extensions which are new in currently installed extension
                    if (!(existing && existing.manifest.extensionPack && existing.manifest.extensionPack.some(old => (0, extensionManagementUtil_1.areSameExtensions)({ id: old }, { id: extension })))) {
                        if (dependenciesAndPackExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)({ id: e }, { id: extension }))) {
                            dependenciesAndPackExtensions.push(extension);
                        }
                    }
                }
            }
            if (dependenciesAndPackExtensions.length) {
                const installed = await this.getInstalled();
                // filter out installed extensions
                const names = dependenciesAndPackExtensions.filter(id => installed.every(({ identifier: galleryIdentifier }) => !(0, extensionManagementUtil_1.areSameExtensions)(galleryIdentifier, { id })));
                if (names.length) {
                    const galleryResult = await this.galleryService.query({ names, pageSize: dependenciesAndPackExtensions.length }, cancellation_1.CancellationToken.None);
                    const extensionsToInstall = galleryResult.firstPage;
                    try {
                        await async_1.Promises.settled(extensionsToInstall.map(e => this.installFromGallery(e, options)));
                    }
                    catch (error) {
                        try {
                            await this.rollback(extensionsToInstall);
                        }
                        catch (e) { /* ignore */ }
                        throw error;
                    }
                }
            }
        }
        async rollback(extensions) {
            const installed = await this.getInstalled(1 /* User */);
            const extensionsToUninstall = installed.filter(local => extensions.some(galleryExtension => new extensionManagementUtil_1.ExtensionIdentifierWithVersion(local.identifier, local.manifest.version).equals(new extensionManagementUtil_1.ExtensionIdentifierWithVersion(galleryExtension.identifier, galleryExtension.version)))); // Check with version because we want to rollback the exact version
            await async_1.Promises.settled(extensionsToUninstall.map(local => this.uninstall(local)));
        }
        async uninstall(extension, options = {}) {
            this.logService.trace('ExtensionManagementService#uninstall', extension.identifier.id);
            const installed = await this.getInstalled(1 /* User */);
            const extensionToUninstall = installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier));
            if (!extensionToUninstall) {
                throw new Error(nls.localize(11, null, extension.manifest.displayName || extension.manifest.name));
            }
            try {
                await this.checkForDependenciesAndUninstall(extensionToUninstall, installed, options);
            }
            catch (error) {
                throw this.joinErrors(error);
            }
        }
        async updateMetadata(local, metadata) {
            this.logService.trace('ExtensionManagementService#updateMetadata', local.identifier.id);
            local = await this.extensionsScanner.saveMetadataForLocalExtension(local, Object.assign(Object.assign({}, (local.manifest.__metadata || {})), metadata));
            this.manifestCache.invalidate();
            return local;
        }
        async updateExtensionScope(local, isMachineScoped) {
            this.logService.trace('ExtensionManagementService#updateExtensionScope', local.identifier.id);
            local = await this.extensionsScanner.saveMetadataForLocalExtension(local, Object.assign(Object.assign({}, (local.manifest.__metadata || {})), { isMachineScoped }));
            this.manifestCache.invalidate();
            return local;
        }
        async getGalleryMetadata(extensionName) {
            const galleryExtension = await this.findGalleryExtensionByName(extensionName);
            return galleryExtension ? { id: galleryExtension.identifier.uuid, publisherDisplayName: galleryExtension.publisherDisplayName, publisherId: galleryExtension.publisherId } : undefined;
        }
        async findGalleryExtension(local) {
            if (local.identifier.uuid) {
                const galleryExtension = await this.findGalleryExtensionById(local.identifier.uuid);
                return galleryExtension ? galleryExtension : this.findGalleryExtensionByName(local.identifier.id);
            }
            return this.findGalleryExtensionByName(local.identifier.id);
        }
        async findGalleryExtensionById(uuid) {
            const galleryResult = await this.galleryService.query({ ids: [uuid], pageSize: 1 }, cancellation_1.CancellationToken.None);
            return galleryResult.firstPage[0];
        }
        async findGalleryExtensionByName(name) {
            const galleryResult = await this.galleryService.query({ names: [name], pageSize: 1 }, cancellation_1.CancellationToken.None);
            return galleryResult.firstPage[0];
        }
        joinErrors(errorOrErrors) {
            const errors = Array.isArray(errorOrErrors) ? errorOrErrors : [errorOrErrors];
            if (errors.length === 1) {
                return errors[0] instanceof Error ? errors[0] : new Error(errors[0]);
            }
            return errors.reduce((previousValue, currentValue) => {
                return new Error(`${previousValue.message}${previousValue.message ? ',' : ''}${currentValue instanceof Error ? currentValue.message : currentValue}`);
            }, new Error(''));
        }
        async checkForDependenciesAndUninstall(extension, installed, options) {
            try {
                await this.preUninstallExtension(extension);
                const packedExtensions = options.donotIncludePack ? [] : this.getAllPackExtensionsToUninstall(extension, installed);
                await this.uninstallExtensions(extension, packedExtensions, installed, options);
            }
            catch (error) {
                await this.postUninstallExtension(extension, new extensionManagement_1.ExtensionManagementError(error instanceof Error ? error.message : error, INSTALL_ERROR_LOCAL));
                throw error;
            }
            await this.postUninstallExtension(extension);
        }
        async uninstallExtensions(extension, otherExtensionsToUninstall, installed, options) {
            const extensionsToUninstall = [extension, ...otherExtensionsToUninstall];
            if (!options.donotCheckDependents) {
                for (const e of extensionsToUninstall) {
                    this.checkForDependents(e, extensionsToUninstall, installed, extension);
                }
            }
            await async_1.Promises.settled([this.uninstallExtension(extension), ...otherExtensionsToUninstall.map(d => this.doUninstall(d))]);
        }
        checkForDependents(extension, extensionsToUninstall, installed, extensionToUninstall) {
            const dependents = this.getDependents(extension, installed);
            if (dependents.length) {
                const remainingDependents = dependents.filter(dependent => extensionsToUninstall.indexOf(dependent) === -1);
                if (remainingDependents.length) {
                    throw new Error(this.getDependentsErrorMessage(extension, remainingDependents, extensionToUninstall));
                }
            }
        }
        getDependentsErrorMessage(dependingExtension, dependents, extensionToUninstall) {
            if (extensionToUninstall === dependingExtension) {
                if (dependents.length === 1) {
                    return nls.localize(12, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
                }
                if (dependents.length === 2) {
                    return nls.localize(13, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
                }
                return nls.localize(14, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            if (dependents.length === 1) {
                return nls.localize(15, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name);
            }
            if (dependents.length === 2) {
                return nls.localize(16, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                    || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
            }
            return nls.localize(17, null, extensionToUninstall.manifest.displayName || extensionToUninstall.manifest.name, dependingExtension.manifest.displayName
                || dependingExtension.manifest.name, dependents[0].manifest.displayName || dependents[0].manifest.name, dependents[1].manifest.displayName || dependents[1].manifest.name);
        }
        getAllPackExtensionsToUninstall(extension, installed, checked = []) {
            if (checked.indexOf(extension) !== -1) {
                return [];
            }
            checked.push(extension);
            const extensionsPack = extension.manifest.extensionPack ? extension.manifest.extensionPack : [];
            if (extensionsPack.length) {
                const packedExtensions = installed.filter(i => !i.isBuiltin && extensionsPack.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, i.identifier)));
                const packOfPackedExtensions = [];
                for (const packedExtension of packedExtensions) {
                    packOfPackedExtensions.push(...this.getAllPackExtensionsToUninstall(packedExtension, installed, checked));
                }
                return [...packedExtensions, ...packOfPackedExtensions];
            }
            return [];
        }
        getDependents(extension, installed) {
            return installed.filter(e => e.manifest.extensionDependencies && e.manifest.extensionDependencies.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier)));
        }
        async doUninstall(extension) {
            try {
                await this.preUninstallExtension(extension);
                await this.uninstallExtension(extension);
            }
            catch (error) {
                await this.postUninstallExtension(extension, new extensionManagement_1.ExtensionManagementError(error instanceof Error ? error.message : error, INSTALL_ERROR_LOCAL));
                throw error;
            }
            await this.postUninstallExtension(extension);
        }
        async preUninstallExtension(extension) {
            const exists = await pfs.exists(extension.location.fsPath);
            if (!exists) {
                throw new Error(nls.localize(18, null));
            }
            this.logService.info('Uninstalling extension:', extension.identifier.id);
            this._onUninstallExtension.fire(extension.identifier);
        }
        async uninstallExtension(local) {
            let promise = this.uninstallingExtensions.get(local.identifier.id);
            if (!promise) {
                // Set all versions of the extension as uninstalled
                promise = (0, async_1.createCancelablePromise)(async () => {
                    const userExtensions = await this.extensionsScanner.scanUserExtensions(false);
                    await this.extensionsScanner.setUninstalled(...userExtensions.filter(u => (0, extensionManagementUtil_1.areSameExtensions)(u.identifier, local.identifier)));
                });
                this.uninstallingExtensions.set(local.identifier.id, promise);
                promise.finally(() => this.uninstallingExtensions.delete(local.identifier.id));
            }
            return promise;
        }
        async postUninstallExtension(extension, error) {
            if (error) {
                this.logService.error('Failed to uninstall extension:', extension.identifier.id, error.message);
            }
            else {
                this.logService.info('Successfully uninstalled extension:', extension.identifier.id);
                // only report if extension has a mapped gallery extension. UUID identifies the gallery extension.
                if (extension.identifier.uuid) {
                    try {
                        await this.galleryService.reportStatistic(extension.manifest.publisher, extension.manifest.name, extension.manifest.version, "uninstall" /* Uninstall */);
                    }
                    catch (error) { /* ignore */ }
                }
            }
            this.reportTelemetry('extensionGallery:uninstall', (0, extensionManagementUtil_1.getLocalExtensionTelemetryData)(extension), undefined, error);
            const errorcode = error ? error instanceof extensionManagement_1.ExtensionManagementError ? error.code : ERROR_UNKNOWN : undefined;
            this._onDidUninstallExtension.fire({ identifier: extension.identifier, error: errorcode });
        }
        getInstalled(type = null) {
            return this.extensionsScanner.scanExtensions(type);
        }
        removeDeprecatedExtensions() {
            return this.extensionsScanner.cleanUp();
        }
        async isUninstalled(identifier) {
            const uninstalled = await this.filterUninstalled(identifier);
            return uninstalled.length === 1;
        }
        async filterUninstalled(...identifiers) {
            const uninstalled = [];
            const allUninstalled = await this.extensionsScanner.getUninstalledExtensions();
            for (const identifier of identifiers) {
                if (!!allUninstalled[identifier.key()]) {
                    uninstalled.push(identifier.key());
                }
            }
            return uninstalled;
        }
        getExtensionsReport() {
            const now = new Date().getTime();
            if (!this.reportedExtensions || now - this.lastReportTimestamp > 1000 * 60 * 5) { // 5 minute cache freshness
                this.reportedExtensions = this.updateReportCache();
                this.lastReportTimestamp = now;
            }
            return this.reportedExtensions;
        }
        async updateReportCache() {
            try {
                this.logService.trace('ExtensionManagementService.refreshReportedCache');
                const result = await this.galleryService.getExtensionsReport();
                this.logService.trace(`ExtensionManagementService.refreshReportedCache - got ${result.length} reported extensions from service`);
                return result;
            }
            catch (err) {
                this.logService.trace('ExtensionManagementService.refreshReportedCache - failed to get extension report');
                return [];
            }
        }
        reportTelemetry(eventName, extensionData, duration, error) {
            const errorcode = error ? error instanceof extensionManagement_1.ExtensionManagementError ? error.code : ERROR_UNKNOWN : undefined;
            /* __GDPR__
                "extensionGallery:install" : {
                    "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                    "recommendationReason": { "retiredFromVersion": "1.23.0", "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            /* __GDPR__
                "extensionGallery:uninstall" : {
                    "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            /* __GDPR__
                "extensionGallery:update" : {
                    "success": { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "duration" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "errorcode": { "classification": "CallstackOrException", "purpose": "PerformanceAndHealth" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            this.telemetryService.publicLogError(eventName, Object.assign(Object.assign({}, extensionData), { success: !error, duration, errorcode }));
        }
    };
    ExtensionManagementService = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, log_1.ILogService),
        __param(3, (0, instantiation_1.optional)(download_1.IDownloadService)),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, files_1.IFileService)
    ], ExtensionManagementService);
    exports.ExtensionManagementService = ExtensionManagementService;
});
//# sourceMappingURL=extensionManagementService.js.map