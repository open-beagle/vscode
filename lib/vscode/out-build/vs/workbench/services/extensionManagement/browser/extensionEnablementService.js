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
define(["require", "exports", "vs/nls!vs/workbench/services/extensionManagement/browser/extensionEnablementService", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/workspace/common/workspace", "vs/platform/storage/common/storage", "vs/workbench/services/environment/common/environmentService", "vs/platform/extensions/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/workbench/services/extensions/common/extensions", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensionManagement/browser/extensionBisect", "vs/platform/workspace/common/workspaceTrust", "vs/base/common/async", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/remote/common/remoteHosts"], function (require, exports, nls_1, event_1, lifecycle_1, extensionManagement_1, extensionManagement_2, extensionManagementUtil_1, workspace_1, storage_1, environmentService_1, extensions_1, configuration_1, extensions_2, extensionEnablementService_1, extensions_3, userDataSyncAccount_1, userDataSync_1, lifecycle_2, notification_1, host_1, extensionBisect_1, workspaceTrust_1, async_1, extensionManifestPropertiesService_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEnablementService = void 0;
    const SOURCE = 'IWorkbenchExtensionEnablementService';
    let ExtensionEnablementService = class ExtensionEnablementService extends lifecycle_1.Disposable {
        constructor(storageService, globalExtensionEnablementService, contextService, environmentService, extensionManagementService, configurationService, extensionManagementServerService, userDataAutoSyncEnablementService, userDataSyncAccountService, lifecycleService, notificationService, hostService, extensionBisectService, workspaceTrustManagementService, workspaceTrustRequestService, extensionManifestPropertiesService) {
            super();
            this.globalExtensionEnablementService = globalExtensionEnablementService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.extensionManagementService = extensionManagementService;
            this.configurationService = configurationService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.userDataSyncAccountService = userDataSyncAccountService;
            this.lifecycleService = lifecycleService;
            this.notificationService = notificationService;
            this.hostService = hostService;
            this.extensionBisectService = extensionBisectService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.workspaceTrustRequestService = workspaceTrustRequestService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this._onEnablementChanged = new event_1.Emitter();
            this.onEnablementChanged = this._onEnablementChanged.event;
            this.storageManger = this._register(new extensionEnablementService_1.StorageManager(storageService));
            this._register(this.globalExtensionEnablementService.onDidChangeEnablement(({ extensions, source }) => this.onDidChangeExtensions(extensions, source)));
            this._register(extensionManagementService.onDidInstallExtension(this._onDidInstallExtension, this));
            this._register(extensionManagementService.onDidUninstallExtension(this._onDidUninstallExtension, this));
            // delay notification for extensions disabled until workbench restored
            if (this.allUserExtensionsDisabled) {
                this.lifecycleService.when(4 /* Eventually */).then(() => {
                    this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)(0, null), [{
                            label: (0, nls_1.localize)(1, null),
                            run: () => hostService.reload({ disableExtensions: false })
                        }]);
                });
            }
        }
        get hasWorkspace() {
            return this.contextService.getWorkbenchState() !== 1 /* EMPTY */;
        }
        get allUserExtensionsDisabled() {
            return this.environmentService.disableExtensions === true;
        }
        getEnablementState(extension) {
            if (this.extensionBisectService.isDisabledByBisect(extension)) {
                return 2 /* DisabledByEnvironment */;
            }
            if (this._isDisabledInEnv(extension)) {
                return 2 /* DisabledByEnvironment */;
            }
            if (this._isDisabledByVirtualWorkspace(extension)) {
                return 3 /* DisabledByVirtualWorkspace */;
            }
            if (this._isDisabledByExtensionKind(extension)) {
                return 1 /* DisabledByExtensionKind */;
            }
            if (this._isEnabled(extension) && this._isDisabledByTrustRequirement(extension)) {
                return 0 /* DisabledByTrustRequirement */;
            }
            return this._getEnablementState(extension.identifier);
        }
        canChangeEnablement(extension) {
            try {
                this.throwErrorIfCannotChangeEnablement(extension);
            }
            catch (error) {
                return false;
            }
            const enablementState = this.getEnablementState(extension);
            if (enablementState === 2 /* DisabledByEnvironment */
                || enablementState === 3 /* DisabledByVirtualWorkspace */
                || enablementState === 1 /* DisabledByExtensionKind */) {
                return false;
            }
            return true;
        }
        throwErrorIfCannotChangeEnablement(extension) {
            if ((0, extensions_1.isLanguagePackExtension)(extension.manifest)) {
                throw new Error((0, nls_1.localize)(2, null, extension.manifest.displayName || extension.identifier.id));
            }
            if (this.userDataAutoSyncEnablementService.isEnabled() && this.userDataSyncAccountService.account &&
                (0, extensions_1.isAuthenticaionProviderExtension)(extension.manifest) && extension.manifest.contributes.authentication.some(a => a.id === this.userDataSyncAccountService.account.authenticationProviderId)) {
                throw new Error((0, nls_1.localize)(3, null, extension.manifest.displayName || extension.identifier.id));
            }
        }
        canChangeWorkspaceEnablement(extension) {
            if (!this.canChangeEnablement(extension)) {
                return false;
            }
            try {
                this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
            }
            catch (error) {
                return false;
            }
            return true;
        }
        throwErrorIfCannotChangeWorkspaceEnablement(extension) {
            if (!this.hasWorkspace) {
                throw new Error((0, nls_1.localize)(4, null));
            }
            if ((0, extensions_1.isAuthenticaionProviderExtension)(extension.manifest)) {
                throw new Error((0, nls_1.localize)(5, null, extension.manifest.displayName || extension.identifier.id));
            }
        }
        async setEnablement(extensions, newState) {
            const workspace = newState === 5 /* DisabledWorkspace */ || newState === 7 /* EnabledWorkspace */;
            for (const extension of extensions) {
                if (workspace) {
                    this.throwErrorIfCannotChangeWorkspaceEnablement(extension);
                }
                else {
                    this.throwErrorIfCannotChangeEnablement(extension);
                }
            }
            const result = await async_1.Promises.settled(extensions.map(e => {
                if (this._isDisabledByTrustRequirement(e)) {
                    return this.workspaceTrustRequestService.requestWorkspaceTrust({ modal: true })
                        .then(trustState => {
                        if (trustState) {
                            return this._setEnablement(e, newState);
                        }
                        else {
                            return Promise.resolve(false);
                        }
                    });
                }
                else {
                    return this._setEnablement(e, newState);
                }
            }));
            const changedExtensions = extensions.filter((e, index) => result[index]);
            if (changedExtensions.length) {
                this._onEnablementChanged.fire(changedExtensions);
            }
            return result;
        }
        _setEnablement(extension, newState) {
            const currentState = this._getEnablementState(extension.identifier);
            if (currentState === newState) {
                return Promise.resolve(false);
            }
            switch (newState) {
                case 6 /* EnabledGlobally */:
                    this._enableExtension(extension.identifier);
                    break;
                case 4 /* DisabledGlobally */:
                    this._disableExtension(extension.identifier);
                    break;
                case 7 /* EnabledWorkspace */:
                    this._enableExtensionInWorkspace(extension.identifier);
                    break;
                case 5 /* DisabledWorkspace */:
                    this._disableExtensionInWorkspace(extension.identifier);
                    break;
            }
            return Promise.resolve(true);
        }
        isEnabled(extension) {
            const enablementState = this.getEnablementState(extension);
            return enablementState === 7 /* EnabledWorkspace */ || enablementState === 6 /* EnabledGlobally */;
        }
        _isEnabled(extension) {
            const enablementState = this._getEnablementState(extension.identifier);
            return enablementState === 7 /* EnabledWorkspace */ || enablementState === 6 /* EnabledGlobally */;
        }
        isDisabledGlobally(extension) {
            return this._isDisabledGlobally(extension.identifier);
        }
        _isDisabledInEnv(extension) {
            if (this.allUserExtensionsDisabled) {
                return !extension.isBuiltin;
            }
            const disabledExtensions = this.environmentService.disableExtensions;
            if (Array.isArray(disabledExtensions)) {
                return disabledExtensions.some(id => (0, extensionManagementUtil_1.areSameExtensions)({ id }, extension.identifier));
            }
            return false;
        }
        _isDisabledByVirtualWorkspace(extension) {
            if ((0, remoteHosts_1.getVirtualWorkspaceScheme)(this.contextService.getWorkspace()) !== undefined) {
                return !this.extensionManifestPropertiesService.canSupportVirtualWorkspace(extension.manifest);
            }
            return false;
        }
        _isDisabledByExtensionKind(extension) {
            if (this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
                const server = this.extensionManagementServerService.getExtensionManagementServer(extension);
                for (const extensionKind of this.extensionManifestPropertiesService.getExtensionKind(extension.manifest)) {
                    if (extensionKind === 'ui') {
                        if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.localExtensionManagementServer === server) {
                            return false;
                        }
                    }
                    if (extensionKind === 'workspace') {
                        if (server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                            return false;
                        }
                    }
                    if (extensionKind === 'web') {
                        if (this.extensionManagementServerService.webExtensionManagementServer) {
                            if (server === this.extensionManagementServerService.webExtensionManagementServer) {
                                return false;
                            }
                        }
                        else if (server === this.extensionManagementServerService.localExtensionManagementServer) {
                            const enableLocalWebWorker = this.configurationService.getValue(extensions_3.webWorkerExtHostConfig);
                            if (enableLocalWebWorker) {
                                // Web extensions are enabled on all configurations
                                return false;
                            }
                        }
                    }
                }
                return false; // NOTE@coder: Don't disable anything by extensionKind.
            }
            return false;
        }
        _isDisabledByTrustRequirement(extension) {
            if (this.workspaceTrustManagementService.isWorkpaceTrusted()) {
                return false;
            }
            return this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.manifest) === false;
        }
        _getEnablementState(identifier) {
            if (this.hasWorkspace) {
                if (this._getWorkspaceEnabledExtensions().filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier))[0]) {
                    return 7 /* EnabledWorkspace */;
                }
                if (this._getWorkspaceDisabledExtensions().filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier))[0]) {
                    return 5 /* DisabledWorkspace */;
                }
            }
            if (this._isDisabledGlobally(identifier)) {
                return 4 /* DisabledGlobally */;
            }
            return 6 /* EnabledGlobally */;
        }
        _isDisabledGlobally(identifier) {
            return this.globalExtensionEnablementService.getDisabledExtensions().some(e => (0, extensionManagementUtil_1.areSameExtensions)(e, identifier));
        }
        _enableExtension(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
            return this.globalExtensionEnablementService.enableExtension(identifier, SOURCE);
        }
        _disableExtension(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
            return this.globalExtensionEnablementService.disableExtension(identifier, SOURCE);
        }
        _enableExtensionInWorkspace(identifier) {
            this._removeFromWorkspaceDisabledExtensions(identifier);
            this._addToWorkspaceEnabledExtensions(identifier);
        }
        _disableExtensionInWorkspace(identifier) {
            this._addToWorkspaceDisabledExtensions(identifier);
            this._removeFromWorkspaceEnabledExtensions(identifier);
        }
        _addToWorkspaceDisabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return Promise.resolve(false);
            }
            let disabledExtensions = this._getWorkspaceDisabledExtensions();
            if (disabledExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier))) {
                disabledExtensions.push(identifier);
                this._setDisabledExtensions(disabledExtensions);
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }
        async _removeFromWorkspaceDisabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            let disabledExtensions = this._getWorkspaceDisabledExtensions();
            for (let index = 0; index < disabledExtensions.length; index++) {
                const disabledExtension = disabledExtensions[index];
                if ((0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier)) {
                    disabledExtensions.splice(index, 1);
                    this._setDisabledExtensions(disabledExtensions);
                    return true;
                }
            }
            return false;
        }
        _addToWorkspaceEnabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            let enabledExtensions = this._getWorkspaceEnabledExtensions();
            if (enabledExtensions.every(e => !(0, extensionManagementUtil_1.areSameExtensions)(e, identifier))) {
                enabledExtensions.push(identifier);
                this._setEnabledExtensions(enabledExtensions);
                return true;
            }
            return false;
        }
        _removeFromWorkspaceEnabledExtensions(identifier) {
            if (!this.hasWorkspace) {
                return false;
            }
            let enabledExtensions = this._getWorkspaceEnabledExtensions();
            for (let index = 0; index < enabledExtensions.length; index++) {
                const disabledExtension = enabledExtensions[index];
                if ((0, extensionManagementUtil_1.areSameExtensions)(disabledExtension, identifier)) {
                    enabledExtensions.splice(index, 1);
                    this._setEnabledExtensions(enabledExtensions);
                    return true;
                }
            }
            return false;
        }
        _getWorkspaceEnabledExtensions() {
            return this._getExtensions(extensionManagement_1.ENABLED_EXTENSIONS_STORAGE_PATH);
        }
        _setEnabledExtensions(enabledExtensions) {
            this._setExtensions(extensionManagement_1.ENABLED_EXTENSIONS_STORAGE_PATH, enabledExtensions);
        }
        _getWorkspaceDisabledExtensions() {
            return this._getExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH);
        }
        _setDisabledExtensions(disabledExtensions) {
            this._setExtensions(extensionManagement_1.DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
        }
        _getExtensions(storageId) {
            if (!this.hasWorkspace) {
                return [];
            }
            return this.storageManger.get(storageId, 1 /* WORKSPACE */);
        }
        _setExtensions(storageId, extensions) {
            this.storageManger.set(storageId, extensions, 1 /* WORKSPACE */);
        }
        async onDidChangeExtensions(extensionIdentifiers, source) {
            if (source !== SOURCE) {
                const installedExtensions = await this.extensionManagementService.getInstalled();
                const extensions = installedExtensions.filter(installedExtension => extensionIdentifiers.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(identifier, installedExtension.identifier)));
                this._onEnablementChanged.fire(extensions);
            }
        }
        _onDidInstallExtension({ local, error }) {
            if (local && !error && this._isDisabledByTrustRequirement(local)) {
                this._onEnablementChanged.fire([local]);
            }
        }
        _onDidUninstallExtension({ identifier, error }) {
            if (!error) {
                this._reset(identifier);
            }
        }
        async _getExtensionsByWorkspaceTrustRequirement() {
            const extensions = await this.extensionManagementService.getInstalled();
            return extensions.filter(e => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(e.manifest) === false);
        }
        async updateEnablementByWorkspaceTrustRequirement() {
            const extensions = await this._getExtensionsByWorkspaceTrustRequirement();
            if (extensions.length) {
                this._onEnablementChanged.fire(extensions);
            }
        }
        _reset(extension) {
            this._removeFromWorkspaceDisabledExtensions(extension);
            this._removeFromWorkspaceEnabledExtensions(extension);
            this.globalExtensionEnablementService.enableExtension(extension);
        }
    };
    ExtensionEnablementService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, extensionManagement_1.IGlobalExtensionEnablementService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, extensionManagement_1.IExtensionManagementService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, extensionManagement_2.IExtensionManagementServerService),
        __param(7, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(8, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(9, lifecycle_2.ILifecycleService),
        __param(10, notification_1.INotificationService),
        __param(11, host_1.IHostService),
        __param(12, extensionBisect_1.IExtensionBisectService),
        __param(13, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(14, workspaceTrust_1.IWorkspaceTrustRequestService),
        __param(15, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], ExtensionEnablementService);
    exports.ExtensionEnablementService = ExtensionEnablementService;
    (0, extensions_2.registerSingleton)(extensionManagement_2.IWorkbenchExtensionEnablementService, ExtensionEnablementService);
});
//# sourceMappingURL=extensionEnablementService.js.map