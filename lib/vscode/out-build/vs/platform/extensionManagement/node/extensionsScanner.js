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
define(["require", "exports", "fs", "vs/base/common/semver/semver", "vs/base/common/lifecycle", "vs/base/node/pfs", "vs/base/common/path", "vs/platform/log/common/log", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/async", "vs/base/common/uri", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionNls", "vs/nls!vs/platform/extensionManagement/node/extensionsScanner", "vs/platform/product/common/productService", "vs/base/node/zip", "vs/base/common/platform", "vs/base/common/arrays", "vs/base/common/network", "vs/platform/files/common/files", "vs/base/common/resources", "vs/base/common/uuid", "vs/base/common/errors"], function (require, exports, fs, semver, lifecycle_1, pfs, path, log_1, extensionManagement_1, extensionManagementUtil_1, async_1, uri_1, environment_1, extensionNls_1, nls_1, productService_1, zip_1, platform_1, arrays_1, network_1, files_1, resources_1, uuid_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsScanner = void 0;
    const ERROR_SCANNING_SYS_EXTENSIONS = 'scanningSystem';
    const ERROR_SCANNING_USER_EXTENSIONS = 'scanningUser';
    const INSTALL_ERROR_EXTRACTING = 'extracting';
    const INSTALL_ERROR_DELETING = 'deleting';
    const INSTALL_ERROR_RENAMING = 'renaming';
    let ExtensionsScanner = class ExtensionsScanner extends lifecycle_1.Disposable {
        constructor(beforeRemovingExtension, fileService, logService, environmentService, productService) {
            super();
            this.beforeRemovingExtension = beforeRemovingExtension;
            this.fileService = fileService;
            this.logService = logService;
            this.environmentService = environmentService;
            this.productService = productService;
            this._devSystemExtensionsPath = null;
            this.systemExtensionsPath = environmentService.builtinExtensionsPath;
            this.extensionsPath = environmentService.extensionsPath;
            this.uninstalledPath = path.join(this.extensionsPath, '.obsolete');
            this.uninstalledFileLimiter = new async_1.Queue();
        }
        async cleanUp() {
            await this.removeUninstalledExtensions();
            await this.removeOutdatedExtensions();
        }
        async scanExtensions(type) {
            const promises = [];
            if (type === null || type === 0 /* System */) {
                promises.push(this.scanSystemExtensions().then(null, e => Promise.reject(new extensionManagement_1.ExtensionManagementError(this.joinErrors(e).message, ERROR_SCANNING_SYS_EXTENSIONS))));
            }
            if (type === null || type === 1 /* User */) {
                promises.push(this.scanUserExtensions(true).then(null, e => Promise.reject(new extensionManagement_1.ExtensionManagementError(this.joinErrors(e).message, ERROR_SCANNING_USER_EXTENSIONS))));
            }
            try {
                const result = await Promise.all(promises);
                return (0, arrays_1.flatten)(result);
            }
            catch (error) {
                throw this.joinErrors(error);
            }
        }
        async scanUserExtensions(excludeOutdated) {
            this.logService.trace('Started scanning user extensions');
            let [uninstalled, extensions] = await Promise.all([this.getUninstalledExtensions(), this.scanAllUserExtensions()]);
            extensions = extensions.filter(e => !uninstalled[new extensionManagementUtil_1.ExtensionIdentifierWithVersion(e.identifier, e.manifest.version).key()]);
            if (excludeOutdated) {
                const byExtension = (0, extensionManagementUtil_1.groupByExtension)(extensions, e => e.identifier);
                extensions = byExtension.map(p => p.sort((a, b) => semver.rcompare(a.manifest.version, b.manifest.version))[0]);
            }
            this.logService.trace('Scanned user extensions:', extensions.length);
            return extensions;
        }
        async scanAllUserExtensions() {
            return this.scanExtensionsInDirs(this.extensionsPath, this.environmentService.extraExtensionPaths, 1 /* User */);
        }
        async extractUserExtension(identifierWithVersion, zipPath, token) {
            const folderName = identifierWithVersion.key();
            const tempPath = path.join(this.extensionsPath, `.${(0, uuid_1.generateUuid)()}`);
            const extensionPath = path.join(this.extensionsPath, folderName);
            try {
                await pfs.rimraf(extensionPath);
            }
            catch (error) {
                try {
                    await pfs.rimraf(extensionPath);
                }
                catch (e) { /* ignore */ }
                throw new extensionManagement_1.ExtensionManagementError((0, nls_1.localize)(0, null, extensionPath, identifierWithVersion.id), INSTALL_ERROR_DELETING);
            }
            await this.extractAtLocation(identifierWithVersion, zipPath, tempPath, token);
            let local = await this.scanExtension(uri_1.URI.file(tempPath), 1 /* User */);
            if (!local) {
                throw new Error((0, nls_1.localize)(1, null, tempPath));
            }
            await this.storeMetadata(local, { installedTimestamp: Date.now() });
            try {
                await this.rename(identifierWithVersion, tempPath, extensionPath, Date.now() + (2 * 60 * 1000) /* Retry for 2 minutes */);
                this.logService.info('Renamed to', extensionPath);
            }
            catch (error) {
                try {
                    await pfs.rimraf(tempPath);
                }
                catch (e) { /* ignore */ }
                if (error.code === 'ENOTEMPTY') {
                    this.logService.info(`Rename failed because extension was installed by another source. So ignoring renaming.`, identifierWithVersion.id);
                }
                else {
                    this.logService.info(`Rename failed because of ${(0, errors_1.getErrorMessage)(error)}. Deleted from extracted location`, tempPath);
                    throw error;
                }
            }
            try {
                local = await this.scanExtension(uri_1.URI.file(extensionPath), 1 /* User */);
            }
            catch (e) { /*ignore */ }
            if (local) {
                return local;
            }
            throw new Error((0, nls_1.localize)(2, null, this.extensionsPath));
        }
        async saveMetadataForLocalExtension(local, metadata) {
            this.setMetadata(local, metadata);
            await this.storeMetadata(local, Object.assign(Object.assign({}, metadata), { installedTimestamp: local.installedTimestamp }));
            return local;
        }
        async storeMetadata(local, storedMetadata) {
            // unset if false
            storedMetadata.isMachineScoped = storedMetadata.isMachineScoped || undefined;
            storedMetadata.isBuiltin = storedMetadata.isBuiltin || undefined;
            storedMetadata.installedTimestamp = storedMetadata.installedTimestamp || undefined;
            const manifestPath = path.join(local.location.fsPath, 'package.json');
            const raw = await fs.promises.readFile(manifestPath, 'utf8');
            const { manifest } = await this.parseManifest(raw);
            manifest.__metadata = storedMetadata;
            await pfs.writeFile(manifestPath, JSON.stringify(manifest, null, '\t'));
            return local;
        }
        getUninstalledExtensions() {
            return this.withUninstalledExtensions();
        }
        async setUninstalled(...extensions) {
            const ids = extensions.map(e => new extensionManagementUtil_1.ExtensionIdentifierWithVersion(e.identifier, e.manifest.version));
            await this.withUninstalledExtensions(uninstalled => {
                ids.forEach(id => uninstalled[id.key()] = true);
            });
        }
        async setInstalled(identifierWithVersion) {
            await this.withUninstalledExtensions(uninstalled => delete uninstalled[identifierWithVersion.key()]);
            const installed = await this.scanExtensions(1 /* User */);
            const localExtension = installed.find(i => new extensionManagementUtil_1.ExtensionIdentifierWithVersion(i.identifier, i.manifest.version).equals(identifierWithVersion)) || null;
            if (!localExtension) {
                return null;
            }
            await this.storeMetadata(localExtension, { installedTimestamp: Date.now() });
            return this.scanExtension(localExtension.location, 1 /* User */);
        }
        async withUninstalledExtensions(updateFn) {
            return this.uninstalledFileLimiter.queue(async () => {
                let raw;
                try {
                    raw = await fs.promises.readFile(this.uninstalledPath, 'utf8');
                }
                catch (err) {
                    if (err.code !== 'ENOENT') {
                        throw err;
                    }
                }
                let uninstalled = {};
                if (raw) {
                    try {
                        uninstalled = JSON.parse(raw);
                    }
                    catch (e) { /* ignore */ }
                }
                if (updateFn) {
                    updateFn(uninstalled);
                    if (Object.keys(uninstalled).length) {
                        await pfs.writeFile(this.uninstalledPath, JSON.stringify(uninstalled));
                    }
                    else {
                        await pfs.rimraf(this.uninstalledPath);
                    }
                }
                return uninstalled;
            });
        }
        async removeExtension(extension, type) {
            this.logService.trace(`Deleting ${type} extension from disk`, extension.identifier.id, extension.location.fsPath);
            await pfs.rimraf(extension.location.fsPath);
            this.logService.info('Deleted from disk', extension.identifier.id, extension.location.fsPath);
        }
        async removeUninstalledExtension(extension) {
            await this.removeExtension(extension, 'uninstalled');
            await this.withUninstalledExtensions(uninstalled => delete uninstalled[new extensionManagementUtil_1.ExtensionIdentifierWithVersion(extension.identifier, extension.manifest.version).key()]);
        }
        async extractAtLocation(identifier, zipPath, location, token) {
            this.logService.trace(`Started extracting the extension from ${zipPath} to ${location}`);
            // Clean the location
            try {
                await pfs.rimraf(location);
            }
            catch (e) {
                throw new extensionManagement_1.ExtensionManagementError(this.joinErrors(e).message, INSTALL_ERROR_DELETING);
            }
            try {
                await (0, zip_1.extract)(zipPath, location, { sourcePath: 'extension', overwrite: true }, token);
                this.logService.info(`Extracted extension to ${location}:`, identifier.id);
            }
            catch (e) {
                try {
                    await pfs.rimraf(location);
                }
                catch (e) { /* Ignore */ }
                throw new extensionManagement_1.ExtensionManagementError(e.message, e instanceof zip_1.ExtractError && e.type ? e.type : INSTALL_ERROR_EXTRACTING);
            }
        }
        async rename(identifier, extractPath, renamePath, retryUntil) {
            try {
                await fs.promises.rename(extractPath, renamePath);
            }
            catch (error) {
                if (platform_1.isWindows && error && error.code === 'EPERM' && Date.now() < retryUntil) {
                    this.logService.info(`Failed renaming ${extractPath} to ${renamePath} with 'EPERM' error. Trying again...`, identifier.id);
                    return this.rename(identifier, extractPath, renamePath, retryUntil);
                }
                throw new extensionManagement_1.ExtensionManagementError(error.message || (0, nls_1.localize)(3, null, extractPath, renamePath), error.code || INSTALL_ERROR_RENAMING);
            }
        }
        async scanSystemExtensions() {
            this.logService.trace('Started scanning system extensions');
            const systemExtensionsPromise = this.scanDefaultSystemExtensions();
            if (this.environmentService.isBuilt) {
                return systemExtensionsPromise;
            }
            // Scan other system extensions during development
            const devSystemExtensionsPromise = this.scanDevSystemExtensions();
            const [systemExtensions, devSystemExtensions] = await Promise.all([systemExtensionsPromise, devSystemExtensionsPromise]);
            return [...systemExtensions, ...devSystemExtensions];
        }
        async scanExtensionsInDir(dir, type) {
            const limiter = new async_1.Limiter(10);
            const stat = await this.fileService.resolve(uri_1.URI.file(dir));
            if (stat.children) {
                const extensions = await Promise.all(stat.children.filter(c => c.isDirectory)
                    .map(c => limiter.queue(async () => {
                    if (type === 1 /* User */ && (0, resources_1.basename)(c.resource).indexOf('.') === 0) { // Do not consider user extension folder starting with `.`
                        return null;
                    }
                    return this.scanExtension(c.resource, type);
                })));
                return extensions.filter(e => e && e.identifier);
            }
            return [];
        }
        async scanExtension(extensionLocation, type) {
            var _a, _b;
            try {
                const stat = await this.fileService.resolve(extensionLocation);
                if (stat.children) {
                    const { manifest, metadata } = await this.readManifest(extensionLocation.fsPath);
                    const readmeUrl = (_a = stat.children.find(({ name }) => /^readme(\.txt|\.md|)$/i.test(name))) === null || _a === void 0 ? void 0 : _a.resource;
                    const changelogUrl = (_b = stat.children.find(({ name }) => /^changelog(\.txt|\.md|)$/i.test(name))) === null || _b === void 0 ? void 0 : _b.resource;
                    const identifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) };
                    const local = { type, identifier, manifest, location: extensionLocation, readmeUrl, changelogUrl, publisherDisplayName: null, publisherId: null, isMachineScoped: false, isBuiltin: type === 0 /* System */ };
                    if (metadata) {
                        this.setMetadata(local, metadata);
                        local.installedTimestamp = metadata.installedTimestamp;
                    }
                    return local;
                }
            }
            catch (e) {
                if (type !== 0 /* System */) {
                    this.logService.trace(e);
                }
            }
            return null;
        }
        async scanDefaultSystemExtensions() {
            const result = await this.scanExtensionsInDirs(this.systemExtensionsPath, this.environmentService.extraBuiltinExtensionPaths, 0 /* System */);
            this.logService.trace('Scanned system extensions:', result.length);
            return result;
        }
        async scanDevSystemExtensions() {
            const devSystemExtensionsList = this.getDevSystemExtensionsList();
            if (devSystemExtensionsList.length) {
                const result = await this.scanExtensionsInDir(this.devSystemExtensionsPath, 0 /* System */);
                this.logService.trace('Scanned dev system extensions:', result.length);
                return result.filter(r => devSystemExtensionsList.some(id => (0, extensionManagementUtil_1.areSameExtensions)(r.identifier, { id })));
            }
            else {
                return [];
            }
        }
        setMetadata(local, metadata) {
            local.publisherDisplayName = metadata.publisherDisplayName || null;
            local.publisherId = metadata.publisherId || null;
            local.identifier.uuid = metadata.id;
            local.isMachineScoped = !!metadata.isMachineScoped;
            local.isBuiltin = local.type === 0 /* System */ || !!metadata.isBuiltin;
        }
        async removeUninstalledExtensions() {
            const uninstalled = await this.getUninstalledExtensions();
            const extensions = await this.scanAllUserExtensions(); // All user extensions
            const installed = new Set();
            for (const e of extensions) {
                if (!uninstalled[new extensionManagementUtil_1.ExtensionIdentifierWithVersion(e.identifier, e.manifest.version).key()]) {
                    installed.add(e.identifier.id.toLowerCase());
                }
            }
            const byExtension = (0, extensionManagementUtil_1.groupByExtension)(extensions, e => e.identifier);
            await async_1.Promises.settled(byExtension.map(async (e) => {
                const latest = e.sort((a, b) => semver.rcompare(a.manifest.version, b.manifest.version))[0];
                if (!installed.has(latest.identifier.id.toLowerCase())) {
                    await this.beforeRemovingExtension(latest);
                }
            }));
            const toRemove = extensions.filter(e => uninstalled[new extensionManagementUtil_1.ExtensionIdentifierWithVersion(e.identifier, e.manifest.version).key()]);
            await async_1.Promises.settled(toRemove.map(e => this.removeUninstalledExtension(e)));
        }
        async removeOutdatedExtensions() {
            const extensions = await this.scanAllUserExtensions();
            const toRemove = [];
            // Outdated extensions
            const byExtension = (0, extensionManagementUtil_1.groupByExtension)(extensions, e => e.identifier);
            toRemove.push(...(0, arrays_1.flatten)(byExtension.map(p => p.sort((a, b) => semver.rcompare(a.manifest.version, b.manifest.version)).slice(1))));
            await async_1.Promises.settled(toRemove.map(extension => this.removeExtension(extension, 'outdated')));
        }
        getDevSystemExtensionsList() {
            return (this.productService.builtInExtensions || []).map(e => e.name);
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
        get devSystemExtensionsPath() {
            if (!this._devSystemExtensionsPath) {
                this._devSystemExtensionsPath = path.normalize(path.join(network_1.FileAccess.asFileUri('', require).fsPath, '..', '.build', 'builtInExtensions'));
            }
            return this._devSystemExtensionsPath;
        }
        async readManifest(extensionPath) {
            const promises = [
                fs.promises.readFile(path.join(extensionPath, 'package.json'), 'utf8')
                    .then(raw => this.parseManifest(raw)),
                fs.promises.readFile(path.join(extensionPath, 'package.nls.json'), 'utf8')
                    .then(undefined, err => err.code !== 'ENOENT' ? Promise.reject(err) : '{}')
                    .then(raw => JSON.parse(raw))
            ];
            const [{ manifest, metadata }, translations] = await Promise.all(promises);
            return {
                manifest: (0, extensionNls_1.localizeManifest)(manifest, translations),
                metadata
            };
        }
        parseManifest(raw) {
            return new Promise((c, e) => {
                try {
                    const manifest = JSON.parse(raw);
                    const metadata = manifest.__metadata || null;
                    c({ manifest, metadata });
                }
                catch (err) {
                    e(new Error((0, nls_1.localize)(4, null)));
                }
            });
        }
        async scanExtensionsInDirs(dir, dirs, type) {
            const results = await Promise.all([dir, ...dirs].map((path) => this.scanExtensionsInDir(path, type)));
            return results.reduce((flat, current) => flat.concat(current), []);
        }
    };
    ExtensionsScanner = __decorate([
        __param(1, files_1.IFileService),
        __param(2, log_1.ILogService),
        __param(3, environment_1.INativeEnvironmentService),
        __param(4, productService_1.IProductService)
    ], ExtensionsScanner);
    exports.ExtensionsScanner = ExtensionsScanner;
});
//# sourceMappingURL=extensionsScanner.js.map