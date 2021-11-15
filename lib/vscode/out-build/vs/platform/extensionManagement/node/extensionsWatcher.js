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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/environment/common/environment", "vs/base/common/event", "vs/platform/files/common/files", "vs/base/common/uri", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/resources", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, environment_1, event_1, files_1, uri_1, extensionManagementUtil_1, resources_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsWatcher = void 0;
    let ExtensionsWatcher = class ExtensionsWatcher extends lifecycle_1.Disposable {
        constructor(extensionsManagementService, fileService, environmentService, logService) {
            super();
            this.extensionsManagementService = extensionsManagementService;
            this.logService = logService;
            this._onDidChangeExtensionsByAnotherSource = this._register(new event_1.Emitter());
            this.onDidChangeExtensionsByAnotherSource = this._onDidChangeExtensionsByAnotherSource.event;
            this.startTimestamp = 0;
            this.installingExtensions = [];
            this.extensionsManagementService.getInstalled(1 /* User */).then(extensions => {
                this.installedExtensions = extensions.map(e => e.identifier);
                this.startTimestamp = Date.now();
            });
            this._register(extensionsManagementService.onInstallExtension(e => this.onInstallExtension(e)));
            this._register(extensionsManagementService.onDidInstallExtension(e => this.onDidInstallExtension(e)));
            this._register(extensionsManagementService.onDidUninstallExtension(e => this.onDidUninstallExtension(e)));
            const extensionsResource = uri_1.URI.file(environmentService.extensionsPath);
            const extUri = new resources_1.ExtUri(resource => !fileService.hasCapability(resource, 1024 /* PathCaseSensitive */));
            this._register(fileService.watch(extensionsResource));
            this._register(event_1.Event.filter(fileService.onDidFilesChange, e => e.changes.some(change => this.doesChangeAffects(change, extensionsResource, extUri)))(() => this.onDidChange()));
        }
        doesChangeAffects(change, extensionsResource, extUri) {
            // Is not immediate child of extensions resource
            if (!extUri.isEqual(extUri.dirname(change.resource), extensionsResource)) {
                return false;
            }
            // .obsolete file changed
            if (extUri.isEqual(change.resource, extUri.joinPath(extensionsResource, '.obsolete'))) {
                return true;
            }
            // Only interested in added/deleted changes
            if (change.type !== 1 /* ADDED */ && change.type !== 2 /* DELETED */) {
                return false;
            }
            // Ingore changes to files starting with `.`
            if (extUri.basename(change.resource).startsWith('.')) {
                return false;
            }
            return true;
        }
        onInstallExtension(e) {
            this.addInstallingExtension(e.identifier);
        }
        onDidInstallExtension(e) {
            this.removeInstallingExtension(e.identifier);
            if (!e.error) {
                this.addInstalledExtension(e.identifier);
            }
        }
        onDidUninstallExtension(e) {
            if (!e.error) {
                this.removeInstalledExtension(e.identifier);
            }
        }
        addInstallingExtension(extension) {
            this.removeInstallingExtension(extension);
            this.installingExtensions.push(extension);
        }
        removeInstallingExtension(identifier) {
            this.installingExtensions = this.installingExtensions.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier));
        }
        addInstalledExtension(extension) {
            if (this.installedExtensions) {
                this.removeInstalledExtension(extension);
                this.installedExtensions.push(extension);
            }
        }
        removeInstalledExtension(identifier) {
            if (this.installedExtensions) {
                this.installedExtensions = this.installedExtensions.filter(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier));
            }
        }
        async onDidChange() {
            if (this.installedExtensions) {
                const extensions = await this.extensionsManagementService.getInstalled(1 /* User */);
                const added = extensions.filter(e => {
                    if ([...this.installingExtensions, ...this.installedExtensions].some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, e.identifier))) {
                        return false;
                    }
                    if (e.installedTimestamp && e.installedTimestamp > this.startTimestamp) {
                        this.logService.info('Detected extension installed from another source', e.identifier.id);
                        return true;
                    }
                    else {
                        this.logService.info('Ignored extension installed by another source because of invalid timestamp', e.identifier.id);
                        return false;
                    }
                });
                const removed = this.installedExtensions.filter(identifier => {
                    // Extension being installed
                    if (this.installingExtensions.some(installingExtension => (0, extensionManagementUtil_1.areSameExtensions)(installingExtension, identifier))) {
                        return false;
                    }
                    if (extensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier))) {
                        this.logService.info('Detected extension removed from another source', identifier.id);
                        return true;
                    }
                    return false;
                });
                this.installedExtensions = extensions.map(e => e.identifier);
                if (added.length || removed.length) {
                    this._onDidChangeExtensionsByAnotherSource.fire({ added, removed });
                }
            }
        }
    };
    ExtensionsWatcher = __decorate([
        __param(1, files_1.IFileService),
        __param(2, environment_1.INativeEnvironmentService),
        __param(3, log_1.ILogService)
    ], ExtensionsWatcher);
    exports.ExtensionsWatcher = ExtensionsWatcher;
});
//# sourceMappingURL=extensionsWatcher.js.map