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
define(["require", "exports", "vs/nls!vs/platform/extensionManagement/common/extensionManagementCLIService", "vs/base/common/errors", "vs/base/common/uri", "vs/base/common/semver/semver", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/base/common/labels", "vs/base/common/cancellation", "vs/base/common/network"], function (require, exports, nls_1, errors_1, uri_1, semver_1, extensionManagement_1, extensionManagementUtil_1, extensions_1, labels_1, cancellation_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionManagementCLIService = exports.getIdAndVersion = void 0;
    const notFound = (id) => (0, nls_1.localize)(0, null, id);
    const useId = (0, nls_1.localize)(1, null, 'ms-dotnettools.csharp');
    function getId(manifest, withVersion) {
        if (withVersion) {
            return `${manifest.publisher}.${manifest.name}@${manifest.version}`;
        }
        else {
            return `${manifest.publisher}.${manifest.name}`;
        }
    }
    const EXTENSION_ID_REGEX = /^([^.]+\..+)@(\d+\.\d+\.\d+(-.*)?)$/;
    function getIdAndVersion(id) {
        const matches = EXTENSION_ID_REGEX.exec(id);
        if (matches && matches[1]) {
            return [(0, extensionManagementUtil_1.adoptToGalleryExtensionId)(matches[1]), matches[2]];
        }
        return [(0, extensionManagementUtil_1.adoptToGalleryExtensionId)(id), undefined];
    }
    exports.getIdAndVersion = getIdAndVersion;
    let ExtensionManagementCLIService = class ExtensionManagementCLIService {
        constructor(extensionManagementService, extensionGalleryService) {
            this.extensionManagementService = extensionManagementService;
            this.extensionGalleryService = extensionGalleryService;
        }
        get location() {
            return undefined;
        }
        async listExtensions(showVersions, category, output = console) {
            let extensions = await this.extensionManagementService.getInstalled(1 /* User */);
            const categories = extensions_1.EXTENSION_CATEGORIES.map(c => c.toLowerCase());
            if (category && category !== '') {
                if (categories.indexOf(category.toLowerCase()) < 0) {
                    output.log('Invalid category please enter a valid category. To list valid categories run --category without a category specified');
                    return;
                }
                extensions = extensions.filter(e => {
                    if (e.manifest.categories) {
                        const lowerCaseCategories = e.manifest.categories.map(c => c.toLowerCase());
                        return lowerCaseCategories.indexOf(category.toLowerCase()) > -1;
                    }
                    return false;
                });
            }
            else if (category === '') {
                output.log('Possible Categories: ');
                categories.forEach(category => {
                    output.log(category);
                });
                return;
            }
            if (this.location) {
                output.log((0, nls_1.localize)(2, null, this.location));
            }
            extensions = extensions.sort((e1, e2) => e1.identifier.id.localeCompare(e2.identifier.id));
            let lastId = undefined;
            for (let extension of extensions) {
                if (lastId !== extension.identifier.id) {
                    lastId = extension.identifier.id;
                    output.log(getId(extension.manifest, showVersions));
                }
            }
        }
        async installExtensions(extensions, builtinExtensionIds, isMachineScoped, force, output = console) {
            const failed = [];
            const installedExtensionsManifests = [];
            if (extensions.length) {
                output.log(this.location ? (0, nls_1.localize)(3, null, this.location) : (0, nls_1.localize)(4, null));
            }
            const installed = await this.extensionManagementService.getInstalled(1 /* User */);
            const checkIfNotInstalled = (id, version) => {
                const installedExtension = installed.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }));
                if (installedExtension) {
                    if (!version && !force) {
                        output.log((0, nls_1.localize)(5, null, id, installedExtension.manifest.version, id));
                        return false;
                    }
                    if (version && installedExtension.manifest.version === version) {
                        output.log((0, nls_1.localize)(6, null, `${id}@${version}`));
                        return false;
                    }
                }
                return true;
            };
            const vsixs = [];
            const installExtensionInfos = [];
            for (const extension of extensions) {
                if (extension instanceof uri_1.URI) {
                    vsixs.push(extension);
                }
                else {
                    const [id, version] = getIdAndVersion(extension);
                    if (checkIfNotInstalled(id, version)) {
                        installExtensionInfos.push({ id, version, installOptions: { isBuiltin: false, isMachineScoped } });
                    }
                }
            }
            for (const extension of builtinExtensionIds) {
                const [id, version] = getIdAndVersion(extension);
                if (checkIfNotInstalled(id, version)) {
                    installExtensionInfos.push({ id, version, installOptions: { isBuiltin: true, isMachineScoped: false } });
                }
            }
            if (vsixs.length) {
                await Promise.all(vsixs.map(async (vsix) => {
                    try {
                        const manifest = await this.installVSIX(vsix, { isBuiltin: false, isMachineScoped }, force, output);
                        if (manifest) {
                            installedExtensionsManifests.push(manifest);
                        }
                    }
                    catch (err) {
                        output.error(err.message || err.stack || err);
                        failed.push(vsix.toString());
                    }
                }));
            }
            if (installExtensionInfos.length) {
                const galleryExtensions = await this.getGalleryExtensions(installExtensionInfos);
                await Promise.all(installExtensionInfos.map(async (extensionInfo) => {
                    const gallery = galleryExtensions.get(extensionInfo.id.toLowerCase());
                    if (gallery) {
                        try {
                            const manifest = await this.installFromGallery(extensionInfo, gallery, installed, force, output);
                            if (manifest) {
                                installedExtensionsManifests.push(manifest);
                            }
                        }
                        catch (err) {
                            output.error(err.message || err.stack || err);
                            failed.push(extensionInfo.id);
                        }
                    }
                    else {
                        output.error(`${notFound(extensionInfo.version ? `${extensionInfo.id}@${extensionInfo.version}` : extensionInfo.id)}\n${useId}`);
                        failed.push(extensionInfo.id);
                    }
                }));
            }
            if (failed.length) {
                throw new Error((0, nls_1.localize)(7, null, failed.join(', ')));
            }
        }
        async installVSIX(vsix, installOptions, force, output) {
            const manifest = await this.extensionManagementService.getManifest(vsix);
            if (!manifest) {
                throw new Error('Invalid vsix');
            }
            const valid = await this.validateVSIX(manifest, force, output);
            if (valid) {
                try {
                    await this.extensionManagementService.install(vsix, installOptions);
                    output.log((0, nls_1.localize)(8, null, (0, labels_1.getBaseLabel)(vsix)));
                    return manifest;
                }
                catch (error) {
                    if ((0, errors_1.isPromiseCanceledError)(error)) {
                        output.log((0, nls_1.localize)(9, null, (0, labels_1.getBaseLabel)(vsix)));
                        return null;
                    }
                    else {
                        throw error;
                    }
                }
            }
            return null;
        }
        async getGalleryExtensions(extensions) {
            const extensionIds = extensions.filter(({ version }) => version === undefined).map(({ id }) => id);
            const extensionsWithIdAndVersion = extensions.filter(({ version }) => version !== undefined);
            const galleryExtensions = new Map();
            await Promise.all([
                (async () => {
                    const result = await this.extensionGalleryService.getExtensions(extensionIds, cancellation_1.CancellationToken.None);
                    result.forEach(extension => galleryExtensions.set(extension.identifier.id.toLowerCase(), extension));
                })(),
                Promise.all(extensionsWithIdAndVersion.map(async ({ id, version }) => {
                    const extension = await this.extensionGalleryService.getCompatibleExtension({ id }, version);
                    if (extension) {
                        galleryExtensions.set(extension.identifier.id.toLowerCase(), extension);
                    }
                }))
            ]);
            return galleryExtensions;
        }
        async installFromGallery({ id, version, installOptions }, galleryExtension, installed, force, output) {
            const manifest = await this.extensionGalleryService.getManifest(galleryExtension, cancellation_1.CancellationToken.None);
            if (manifest && !this.validateExtensionKind(manifest, output)) {
                return null;
            }
            const installedExtension = installed.find(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, galleryExtension.identifier));
            if (installedExtension) {
                if (galleryExtension.version === installedExtension.manifest.version) {
                    output.log((0, nls_1.localize)(10, null, version ? `${id}@${version}` : id));
                    return null;
                }
                output.log((0, nls_1.localize)(11, null, id, galleryExtension.version));
            }
            try {
                if (installOptions.isBuiltin) {
                    output.log((0, nls_1.localize)(12, null, id, galleryExtension.version));
                }
                else {
                    output.log((0, nls_1.localize)(13, null, id, galleryExtension.version));
                }
                await this.extensionManagementService.installFromGallery(galleryExtension, installOptions);
                output.log((0, nls_1.localize)(14, null, id, galleryExtension.version));
                return manifest;
            }
            catch (error) {
                if ((0, errors_1.isPromiseCanceledError)(error)) {
                    output.log((0, nls_1.localize)(15, null, id));
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
        validateExtensionKind(_manifest, output) {
            return true;
        }
        async validateVSIX(manifest, force, output) {
            const extensionIdentifier = { id: (0, extensionManagementUtil_1.getGalleryExtensionId)(manifest.publisher, manifest.name) };
            const installedExtensions = await this.extensionManagementService.getInstalled(1 /* User */);
            const newer = installedExtensions.find(local => (0, extensionManagementUtil_1.areSameExtensions)(extensionIdentifier, local.identifier) && (0, semver_1.gt)(local.manifest.version, manifest.version));
            if (newer && !force) {
                output.log((0, nls_1.localize)(16, null, newer.identifier.id, newer.manifest.version, manifest.version));
                return false;
            }
            return this.validateExtensionKind(manifest, output);
        }
        async uninstallExtensions(extensions, force, output = console) {
            const getExtensionId = async (extensionDescription) => {
                if (extensionDescription instanceof uri_1.URI) {
                    const manifest = await this.extensionManagementService.getManifest(extensionDescription);
                    return getId(manifest);
                }
                return extensionDescription;
            };
            const uninstalledExtensions = [];
            for (const extension of extensions) {
                const id = await getExtensionId(extension);
                const installed = await this.extensionManagementService.getInstalled();
                const extensionsToUninstall = installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
                if (!extensionsToUninstall.length) {
                    throw new Error(`${this.notInstalled(id)}\n${useId}`);
                }
                if (extensionsToUninstall.some(e => e.type === 0 /* System */)) {
                    output.log((0, nls_1.localize)(17, null, id));
                    return;
                }
                if (!force && extensionsToUninstall.some(e => e.isBuiltin)) {
                    output.log((0, nls_1.localize)(18, null, id));
                    return;
                }
                output.log((0, nls_1.localize)(19, null, id));
                for (const extensionToUninstall of extensionsToUninstall) {
                    await this.extensionManagementService.uninstall(extensionToUninstall);
                    uninstalledExtensions.push(extensionToUninstall);
                }
                if (this.location) {
                    output.log((0, nls_1.localize)(20, null, id, this.location));
                }
                else {
                    output.log((0, nls_1.localize)(21, null, id));
                }
            }
        }
        async locateExtension(extensions, output = console) {
            const installed = await this.extensionManagementService.getInstalled();
            extensions.forEach(e => {
                installed.forEach(i => {
                    if (i.identifier.id === e) {
                        if (i.location.scheme === network_1.Schemas.file) {
                            output.log(i.location.fsPath);
                            return;
                        }
                    }
                });
            });
        }
        notInstalled(id) {
            return this.location ? (0, nls_1.localize)(22, null, id, this.location) : (0, nls_1.localize)(23, null, id);
        }
    };
    ExtensionManagementCLIService = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, extensionManagement_1.IExtensionGalleryService)
    ], ExtensionManagementCLIService);
    exports.ExtensionManagementCLIService = ExtensionManagementCLIService;
});
//# sourceMappingURL=extensionManagementCLIService.js.map