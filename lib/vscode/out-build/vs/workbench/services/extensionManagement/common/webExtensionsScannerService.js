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
define(["require", "exports", "vs/platform/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/base/common/platform", "vs/platform/instantiation/common/extensions", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/buffer", "vs/platform/request/common/request", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/extensionManagement/common/extensionNls", "vs/nls!vs/workbench/services/extensionManagement/common/webExtensionsScannerService", "vs/base/common/semver/semver", "vs/base/common/types"], function (require, exports, extensions_1, environmentService_1, extensionManagement_1, platform_1, extensions_2, resources_1, uri_1, files_1, async_1, buffer_1, request_1, log_1, cancellation_1, extensionManagementUtil_1, configuration_1, lifecycle_1, event_1, extensionNls_1, nls_1, semver, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebExtensionsScannerService = void 0;
    let WebExtensionsScannerService = class WebExtensionsScannerService extends lifecycle_1.Disposable {
        constructor(environmentService, builtinExtensionsScannerService, fileService, requestService, logService, configurationService) {
            super();
            this.environmentService = environmentService;
            this.builtinExtensionsScannerService = builtinExtensionsScannerService;
            this.fileService = fileService;
            this.requestService = requestService;
            this.logService = logService;
            this.configurationService = configurationService;
            this.systemExtensionsPromise = Promise.resolve([]);
            this.defaultExtensionsPromise = Promise.resolve([]);
            this.extensionsResource = undefined;
            this.userExtensionsResourceLimiter = new async_1.Queue();
            if (platform_1.isWeb) {
                this.extensionsResource = (0, resources_1.joinPath)(environmentService.userRoamingDataHome, 'extensions.json');
                this.systemExtensionsPromise = this.readSystemExtensions();
                this.defaultExtensionsPromise = this.readDefaultExtensions();
                if (this.extensionsResource) {
                    this._register(event_1.Event.filter(this.fileService.onDidFilesChange, e => e.contains(this.extensionsResource))(() => this.userExtensionsPromise = undefined));
                }
            }
        }
        async readSystemExtensions() {
            const extensions = await this.builtinExtensionsScannerService.scanBuiltinExtensions();
            return extensions.concat(this.getStaticExtensions(true));
        }
        /**
         * All extensions defined via `staticExtensions`
         */
        getStaticExtensions(builtin) {
            const staticExtensions = this.environmentService.options && Array.isArray(this.environmentService.options.staticExtensions) ? this.environmentService.options.staticExtensions : [];
            const result = [];
            for (const e of staticExtensions) {
                if (Boolean(e.isBuiltin) === builtin) {
                    const scannedExtension = this.parseStaticExtension(e, builtin, false);
                    if (scannedExtension) {
                        result.push(scannedExtension);
                    }
                }
            }
            return result;
        }
        /**
         * All dev extensions
         */
        getDevExtensions() {
            var _a, _b;
            const devExtensions = (_b = (_a = this.environmentService.options) === null || _a === void 0 ? void 0 : _a.developmentOptions) === null || _b === void 0 ? void 0 : _b.extensions;
            const result = [];
            if (Array.isArray(devExtensions)) {
                for (const e of devExtensions) {
                    const scannedExtension = this.parseStaticExtension(e, false, true);
                    if (scannedExtension) {
                        result.push(scannedExtension);
                    }
                }
            }
            return result;
        }
        async readDefaultExtensions() {
            const defaultUserWebExtensions = await this.readDefaultUserWebExtensions();
            const extensions = [];
            for (const e of defaultUserWebExtensions) {
                const scannedExtension = this.parseStaticExtension(e, false, false);
                if (scannedExtension) {
                    extensions.push(scannedExtension);
                }
            }
            return extensions.concat(this.getStaticExtensions(false), this.getDevExtensions());
        }
        parseStaticExtension(e, builtin, isUnderDevelopment) {
            const extensionLocation = uri_1.URI.revive(e.extensionLocation);
            try {
                return {
                    identifier: { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(e.packageJSON.publisher, e.packageJSON.name) },
                    location: extensionLocation,
                    type: builtin ? 0 /* System */ : 1 /* User */,
                    packageJSON: e.packageJSON,
                    isUnderDevelopment
                };
            }
            catch (error) {
                this.logService.error(`Error while parsing extension ${extensionLocation.toString()}`);
                this.logService.error(error);
            }
            return null;
        }
        async readDefaultUserWebExtensions() {
            const result = [];
            const defaultUserWebExtensions = this.configurationService.getValue('_extensions.defaultUserWebExtensions');
            if ((0, types_1.isArray)(defaultUserWebExtensions)) {
                for (const webExtension of defaultUserWebExtensions) {
                    try {
                        const extensionLocation = uri_1.URI.parse(webExtension.location);
                        const manifestLocation = (0, resources_1.joinPath)(extensionLocation, 'package.json');
                        const context = await this.requestService.request({ type: 'GET', url: manifestLocation.toString(true) }, cancellation_1.CancellationToken.None);
                        if (!(0, request_1.isSuccess)(context)) {
                            this.logService.warn('Skipped default user web extension as there is an error while fetching manifest', manifestLocation);
                            continue;
                        }
                        const content = await (0, request_1.asText)(context);
                        if (!content) {
                            this.logService.warn('Skipped default user web extension as there is manifest is not found', manifestLocation);
                            continue;
                        }
                        const packageJSON = JSON.parse(content);
                        result.push({
                            packageJSON,
                            extensionLocation,
                        });
                    }
                    catch (error) {
                        this.logService.warn('Skipped default user web extension as there is an error while fetching manifest', webExtension);
                    }
                }
            }
            return result;
        }
        async scanExtensions(type) {
            const extensions = [];
            if (type === undefined || type === 0 /* System */) {
                const systemExtensions = await this.systemExtensionsPromise;
                extensions.push(...systemExtensions);
            }
            if (type === undefined || type === 1 /* User */) {
                const staticExtensions = await this.defaultExtensionsPromise;
                extensions.push(...staticExtensions);
                if (!this.userExtensionsPromise) {
                    this.userExtensionsPromise = this.scanUserExtensions();
                }
                const userExtensions = await this.userExtensionsPromise;
                extensions.push(...userExtensions);
            }
            return extensions;
        }
        async scanAndTranslateExtensions(type) {
            const extensions = await this.scanExtensions(type);
            return Promise.all(extensions.map((ext) => this._translateScannedExtension(ext)));
        }
        async scanAndTranslateSingleExtension(extensionLocation, extensionType) {
            const extension = await this._scanSingleExtension(extensionLocation, extensionType);
            if (extension) {
                return this._translateScannedExtension(extension);
            }
            return null;
        }
        async _scanSingleExtension(extensionLocation, extensionType) {
            if (extensionType === 0 /* System */) {
                const systemExtensions = await this.systemExtensionsPromise;
                return this._findScannedExtension(systemExtensions, extensionLocation);
            }
            const staticExtensions = await this.defaultExtensionsPromise;
            const userExtensions = await this.scanUserExtensions();
            return this._findScannedExtension(staticExtensions.concat(userExtensions), extensionLocation);
        }
        _findScannedExtension(candidates, extensionLocation) {
            for (const candidate of candidates) {
                if (candidate.location.toString() === extensionLocation.toString()) {
                    return candidate;
                }
            }
            return null;
        }
        async _translateScannedExtension(scannedExtension) {
            let manifest = scannedExtension.packageJSON;
            if (scannedExtension.packageNLS) {
                // package.nls.json is inlined
                try {
                    manifest = (0, extensionNls_1.localizeManifest)(manifest, scannedExtension.packageNLS);
                }
                catch (error) {
                    console.log(error);
                    /* ignore */
                }
            }
            else if (scannedExtension.packageNLSUrl) {
                // package.nls.json needs to be fetched
                try {
                    const context = await this.requestService.request({ type: 'GET', url: scannedExtension.packageNLSUrl.toString() }, cancellation_1.CancellationToken.None);
                    if ((0, request_1.isSuccess)(context)) {
                        const content = await (0, request_1.asText)(context);
                        if (content) {
                            manifest = (0, extensionNls_1.localizeManifest)(manifest, JSON.parse(content));
                        }
                    }
                }
                catch (error) { /* ignore */ }
            }
            return {
                identifier: scannedExtension.identifier,
                location: scannedExtension.location,
                type: scannedExtension.type,
                packageJSON: manifest,
                readmeUrl: scannedExtension.readmeUrl,
                changelogUrl: scannedExtension.changelogUrl,
                isUnderDevelopment: scannedExtension.isUnderDevelopment
            };
        }
        canAddExtension(galleryExtension) {
            return !!galleryExtension.properties.webExtension && !!galleryExtension.webResource;
        }
        async addExtension(galleryExtension) {
            if (!this.canAddExtension(galleryExtension)) {
                throw new Error((0, nls_1.localize)(0, null, galleryExtension.displayName || galleryExtension.name));
            }
            const extensionLocation = galleryExtension.webResource;
            const packageNLSUri = (0, resources_1.joinPath)(extensionLocation, 'package.nls.json');
            const context = await this.requestService.request({ type: 'GET', url: packageNLSUri.toString() }, cancellation_1.CancellationToken.None);
            const packageNLSExists = (0, request_1.isSuccess)(context);
            const userExtensions = await this.readUserExtensions();
            const userExtension = {
                identifier: galleryExtension.identifier,
                version: galleryExtension.version,
                location: extensionLocation,
                readmeUri: galleryExtension.assets.readme ? uri_1.URI.parse(galleryExtension.assets.readme.uri) : undefined,
                changelogUri: galleryExtension.assets.changelog ? uri_1.URI.parse(galleryExtension.assets.changelog.uri) : undefined,
                packageNLSUri: packageNLSExists ? packageNLSUri : undefined
            };
            userExtensions.push(userExtension);
            await this.writeUserExtensions(userExtensions);
            const scannedExtension = await this.toScannedExtension(userExtension);
            if (scannedExtension) {
                return scannedExtension;
            }
            throw new Error('Error while scanning extension');
        }
        async removeExtension(identifier, version) {
            let userExtensions = await this.readUserExtensions();
            userExtensions = userExtensions.filter(extension => !((0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, identifier) && (version ? extension.version === version : true)));
            await this.writeUserExtensions(userExtensions);
        }
        async scanUserExtensions() {
            let userExtensions = await this.readUserExtensions();
            const byExtension = (0, extensionManagementUtil_1.groupByExtension)(userExtensions, e => e.identifier);
            userExtensions = byExtension.map(p => p.sort((a, b) => semver.rcompare(a.version, b.version))[0]);
            const scannedExtensions = [];
            await Promise.all(userExtensions.map(async (userExtension) => {
                try {
                    const scannedExtension = await this.toScannedExtension(userExtension);
                    if (scannedExtension) {
                        scannedExtensions.push(scannedExtension);
                    }
                }
                catch (error) {
                    this.logService.error(error, 'Error while scanning user extension', userExtension.identifier.id);
                }
            }));
            return scannedExtensions;
        }
        async toScannedExtension(userExtension) {
            const context = await this.requestService.request({ type: 'GET', url: (0, resources_1.joinPath)(userExtension.location, 'package.json').toString() }, cancellation_1.CancellationToken.None);
            if ((0, request_1.isSuccess)(context)) {
                const content = await (0, request_1.asText)(context);
                if (content) {
                    const packageJSON = JSON.parse(content);
                    return {
                        identifier: userExtension.identifier,
                        location: userExtension.location,
                        packageJSON,
                        type: 1 /* User */,
                        readmeUrl: userExtension.readmeUri,
                        changelogUrl: userExtension.changelogUri,
                        packageNLSUrl: userExtension.packageNLSUri,
                        isUnderDevelopment: false
                    };
                }
            }
            return null;
        }
        async readUserExtensions() {
            if (!this.extensionsResource) {
                return [];
            }
            return this.userExtensionsResourceLimiter.queue(async () => {
                try {
                    const content = await this.fileService.readFile(this.extensionsResource);
                    const storedUserExtensions = this.parseExtensions(content.value.toString());
                    return storedUserExtensions.map(e => ({
                        identifier: e.identifier,
                        version: e.version,
                        location: uri_1.URI.revive(e.location),
                        readmeUri: uri_1.URI.revive(e.readmeUri),
                        changelogUri: uri_1.URI.revive(e.changelogUri),
                        packageNLSUri: uri_1.URI.revive(e.packageNLSUri),
                    }));
                }
                catch (error) { /* Ignore */ }
                return [];
            });
        }
        writeUserExtensions(userExtensions) {
            if (!this.extensionsResource) {
                throw new Error('unsupported');
            }
            return this.userExtensionsResourceLimiter.queue(async () => {
                const storedUserExtensions = userExtensions.map(e => {
                    var _a, _b, _c;
                    return ({
                        identifier: e.identifier,
                        version: e.version,
                        location: e.location.toJSON(),
                        readmeUri: (_a = e.readmeUri) === null || _a === void 0 ? void 0 : _a.toJSON(),
                        changelogUri: (_b = e.changelogUri) === null || _b === void 0 ? void 0 : _b.toJSON(),
                        packageNLSUri: (_c = e.packageNLSUri) === null || _c === void 0 ? void 0 : _c.toJSON(),
                    });
                });
                await this.fileService.writeFile(this.extensionsResource, buffer_1.VSBuffer.fromString(JSON.stringify(storedUserExtensions)));
                this.userExtensionsPromise = undefined;
                return userExtensions;
            });
        }
        parseExtensions(content) {
            const storedUserExtensions = JSON.parse(content.toString());
            return storedUserExtensions.map(e => {
                const location = e.uri ? (0, resources_1.joinPath)(uri_1.URI.revive(e.uri), 'Microsoft.VisualStudio.Code.WebResources', 'extension') : e.location;
                return Object.assign(Object.assign({}, e), { location });
            });
        }
    };
    WebExtensionsScannerService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, extensions_1.IBuiltinExtensionsScannerService),
        __param(2, files_1.IFileService),
        __param(3, request_1.IRequestService),
        __param(4, log_1.ILogService),
        __param(5, configuration_1.IConfigurationService)
    ], WebExtensionsScannerService);
    exports.WebExtensionsScannerService = WebExtensionsScannerService;
    (0, extensions_2.registerSingleton)(extensionManagement_1.IWebExtensionsScannerService, WebExtensionsScannerService);
});
//# sourceMappingURL=webExtensionsScannerService.js.map