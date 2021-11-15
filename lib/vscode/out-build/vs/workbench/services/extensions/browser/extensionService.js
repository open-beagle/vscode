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
define(["require", "exports", "vs/nls!vs/workbench/services/extensions/browser/extensionService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/extensions", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/workbench/services/extensions/common/remoteExtensionHost", "vs/platform/notification/common/notification", "vs/workbench/services/extensions/browser/webWorkerExtensionHost", "vs/platform/configuration/common/configuration", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/browser/webWorkerFileSystemProvider", "vs/base/common/network", "vs/base/common/lifecycle", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/workbench/services/userData/browser/userDataInit"], function (require, exports, nls, environmentService_1, extensionManagement_1, remoteAgentService_1, instantiation_1, telemetry_1, extensions_1, extensions_2, files_1, productService_1, abstractExtensionService_1, remoteExtensionHost_1, notification_1, webWorkerExtensionHost_1, configuration_1, extensions_3, webWorkerFileSystemProvider_1, network_1, lifecycle_1, remoteAuthorityResolver_1, lifecycle_2, extensionManagement_2, workspace_1, extensionManifestPropertiesService_1, userDataInit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionService = void 0;
    let ExtensionService = class ExtensionService extends abstractExtensionService_1.AbstractExtensionService {
        constructor(instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, _remoteAuthorityResolverService, _remoteAgentService, _webExtensionsScannerService, _lifecycleService, extensionManifestPropertiesService, _userDataInitializationService) {
            super(new abstractExtensionService_1.ExtensionRunningLocationClassifier((extension) => this._getExtensionKind(extension), (extensionKinds, isInstalledLocally, isInstalledRemotely, preference) => ExtensionService.pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference)), instantiationService, notificationService, environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService);
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._remoteAgentService = _remoteAgentService;
            this._webExtensionsScannerService = _webExtensionsScannerService;
            this._lifecycleService = _lifecycleService;
            this._userDataInitializationService = _userDataInitializationService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._remoteInitData = null;
            this._runningLocation = new Map();
            // Initialize installed extensions first and do it only after workbench is ready
            this._lifecycleService.when(2 /* Ready */).then(async () => {
                await this._userDataInitializationService.initializeInstalledExtensions(this._instantiationService);
                this._initialize();
            });
            this._initFetchFileSystem();
        }
        dispose() {
            this._disposables.dispose();
            super.dispose();
        }
        async _scanSingleExtension(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this._remoteAgentService.scanSingleExtension(extension.location, extension.type === 0 /* System */);
            }
            const scannedExtension = await this._webExtensionsScannerService.scanAndTranslateSingleExtension(extension.location, extension.type);
            if (scannedExtension) {
                return (0, abstractExtensionService_1.parseScannedExtension)(scannedExtension);
            }
            return null;
        }
        _initFetchFileSystem() {
            const provider = new webWorkerFileSystemProvider_1.FetchFileSystemProvider();
            this._disposables.add(this._fileService.registerProvider(network_1.Schemas.http, provider));
            this._disposables.add(this._fileService.registerProvider(network_1.Schemas.https, provider));
        }
        _createLocalExtensionHostDataProvider() {
            return {
                getInitData: async () => {
                    const allExtensions = await this.getExtensions();
                    const localWebWorkerExtensions = filterByRunningLocation(allExtensions, this._runningLocation, 2 /* LocalWebWorker */);
                    return {
                        autoStart: true,
                        extensions: localWebWorkerExtensions
                    };
                }
            };
        }
        _createRemoteExtensionHostDataProvider(remoteAuthority) {
            return {
                remoteAuthority: remoteAuthority,
                getInitData: async () => {
                    await this.whenInstalledExtensionsRegistered();
                    return this._remoteInitData;
                }
            };
        }
        static pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            const result = [];
            let canRunRemotely = false;
            for (const extensionKind of extensionKinds) {
                if (extensionKind === 'ui' && isInstalledRemotely) {
                    // ui extensions run remotely if possible (but only as a last resort)
                    if (preference === 2 /* Remote */) {
                        return 3 /* Remote */;
                    }
                    else {
                        canRunRemotely = true;
                    }
                }
                if (extensionKind === 'workspace' && isInstalledRemotely) {
                    // workspace extensions run remotely if possible
                    if (preference === 0 /* None */ || preference === 2 /* Remote */) {
                        return 3 /* Remote */;
                    }
                    else {
                        result.push(3 /* Remote */);
                    }
                }
                if (extensionKind === 'web' && isInstalledLocally) {
                    // web worker extensions run in the local web worker if possible
                    if (preference === 0 /* None */ || preference === 1 /* Local */) {
                        return 2 /* LocalWebWorker */;
                    }
                    else {
                        result.push(2 /* LocalWebWorker */);
                    }
                }
            }
            if (canRunRemotely) {
                result.push(3 /* Remote */);
            }
            return (result.length > 0 ? result[0] : 0 /* None */);
        }
        _createExtensionHosts(_isInitialStart) {
            const result = [];
            const webWorkerExtHost = this._instantiationService.createInstance(webWorkerExtensionHost_1.WebWorkerExtensionHost, this._createLocalExtensionHostDataProvider());
            result.push(webWorkerExtHost);
            const remoteAgentConnection = this._remoteAgentService.getConnection();
            if (remoteAgentConnection) {
                const remoteExtHost = this._instantiationService.createInstance(remoteExtensionHost_1.RemoteExtensionHost, this._createRemoteExtensionHostDataProvider(remoteAgentConnection.remoteAuthority), this._remoteAgentService.socketFactory);
                result.push(remoteExtHost);
            }
            return result;
        }
        async _scanAndHandleExtensions() {
            // fetch the remote environment
            let [localExtensions, remoteEnv, remoteExtensions] = await Promise.all([
                this._webExtensionsScannerService.scanAndTranslateExtensions().then(extensions => extensions.map(abstractExtensionService_1.parseScannedExtension)),
                this._remoteAgentService.getEnvironment(),
                this._remoteAgentService.scanExtensions()
            ]);
            localExtensions = this._checkEnabledAndProposedAPI(localExtensions);
            remoteExtensions = this._checkEnabledAndProposedAPI(remoteExtensions);
            const remoteAgentConnection = this._remoteAgentService.getConnection();
            this._runningLocation = this._runningLocationClassifier.determineRunningLocation(localExtensions, remoteExtensions);
            localExtensions = filterByRunningLocation(localExtensions, this._runningLocation, 2 /* LocalWebWorker */);
            remoteExtensions = filterByRunningLocation(remoteExtensions, this._runningLocation, 3 /* Remote */);
            const result = this._registry.deltaExtensions(remoteExtensions.concat(localExtensions), []);
            if (result.removedDueToLooping.length > 0) {
                this._logOrShowMessage(notification_1.Severity.Error, nls.localize(0, null, result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', ')));
            }
            if (remoteEnv && remoteAgentConnection) {
                // save for remote extension's init data
                this._remoteInitData = {
                    connectionData: this._remoteAuthorityResolverService.getConnectionData(remoteAgentConnection.remoteAuthority),
                    pid: remoteEnv.pid,
                    appRoot: remoteEnv.appRoot,
                    extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
                    globalStorageHome: remoteEnv.globalStorageHome,
                    workspaceStorageHome: remoteEnv.workspaceStorageHome,
                    extensions: remoteExtensions,
                    allExtensions: this._registry.getAllExtensionDescriptions()
                };
            }
            this._doHandleExtensionPoints(this._registry.getAllExtensionDescriptions());
        }
        _onExtensionHostExit(code) {
            // Dispose everything associated with the extension host
            this.stopExtensionHosts();
            // We log the exit code to the console. Do NOT remove this
            // code as the automated integration tests in browser rely
            // on this message to exit properly.
            console.log(`vscode:exit ${code}`);
        }
    };
    ExtensionService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notification_1.INotificationService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, extensionManagement_2.IExtensionManagementService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(11, remoteAgentService_1.IRemoteAgentService),
        __param(12, extensionManagement_1.IWebExtensionsScannerService),
        __param(13, lifecycle_2.ILifecycleService),
        __param(14, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(15, userDataInit_1.IUserDataInitializationService)
    ], ExtensionService);
    exports.ExtensionService = ExtensionService;
    function filterByRunningLocation(extensions, runningLocation, desiredRunningLocation) {
        return extensions.filter(ext => runningLocation.get(extensions_3.ExtensionIdentifier.toKey(ext.identifier)) === desiredRunningLocation);
    }
    (0, extensions_2.registerSingleton)(extensions_1.IExtensionService, ExtensionService);
});
//# sourceMappingURL=extensionService.js.map