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
define(["require", "exports", "vs/workbench/services/extensions/electron-browser/localProcessExtensionHost", "vs/workbench/services/extensions/electron-browser/cachedExtensionScanner", "vs/platform/instantiation/common/extensions", "vs/workbench/services/extensions/common/abstractExtensionService", "vs/nls!vs/workbench/services/extensions/electron-browser/extensionService", "vs/base/common/async", "vs/workbench/services/environment/common/environmentService", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/configuration/common/configuration", "vs/workbench/services/extensions/common/remoteExtensionHost", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/platform/product/common/productService", "vs/workbench/services/extensions/common/extensionPoints", "vs/base/common/arrays", "vs/platform/native/electron-sandbox/native", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/actions/common/actions", "vs/platform/remote/common/remoteHosts", "vs/workbench/services/extensions/browser/webWorkerExtensionHost", "vs/platform/workspace/common/workspace", "vs/platform/log/common/log", "vs/workbench/common/actions", "vs/base/common/network", "vs/platform/request/common/request", "vs/base/common/codicons", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, localProcessExtensionHost_1, cachedExtensionScanner_1, extensions_1, abstractExtensionService_1, nls, async_1, environmentService_1, extensionManagement_1, extensionManagement_2, configuration_1, remoteExtensionHost_1, remoteAgentService_1, remoteAuthorityResolver_1, instantiation_1, lifecycle_1, notification_1, telemetry_1, host_1, extensions_2, extensions_3, files_1, productService_1, extensionPoints_1, arrays_1, native_1, remoteExplorerService_1, actions_1, remoteHosts_1, webWorkerExtensionHost_1, workspace_1, log_1, actions_2, network_1, request_1, codicons_1, dialogs_1, workspaceTrust_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionService = void 0;
    const MACHINE_PROMPT = false;
    let ExtensionService = class ExtensionService extends abstractExtensionService_1.AbstractExtensionService {
        constructor(instantiationService, notificationService, _environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, _remoteAgentService, _remoteAuthorityResolverService, _lifecycleService, _webExtensionsScannerService, _nativeHostService, _hostService, _remoteExplorerService, _extensionGalleryService, _logService, _dialogService, _workspaceTrustManagementService, extensionManifestPropertiesService) {
            super(new abstractExtensionService_1.ExtensionRunningLocationClassifier((extension) => this._getExtensionKind(extension), (extensionKinds, isInstalledLocally, isInstalledRemotely, preference) => this._pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference)), instantiationService, notificationService, _environmentService, telemetryService, extensionEnablementService, fileService, productService, extensionManagementService, contextService, configurationService, extensionManifestPropertiesService);
            this._remoteAgentService = _remoteAgentService;
            this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
            this._lifecycleService = _lifecycleService;
            this._webExtensionsScannerService = _webExtensionsScannerService;
            this._nativeHostService = _nativeHostService;
            this._hostService = _hostService;
            this._remoteExplorerService = _remoteExplorerService;
            this._extensionGalleryService = _extensionGalleryService;
            this._logService = _logService;
            this._dialogService = _dialogService;
            this._workspaceTrustManagementService = _workspaceTrustManagementService;
            this._enableLocalWebWorker = this._isLocalWebWorkerEnabled();
            this._remoteInitData = new Map();
            this._extensionScanner = instantiationService.createInstance(cachedExtensionScanner_1.CachedExtensionScanner);
            // delay extension host creation and extension scanning
            // until the workbench is running. we cannot defer the
            // extension host more (LifecyclePhase.Restored) because
            // some editors require the extension host to restore
            // and this would result in a deadlock
            // see https://github.com/microsoft/vscode/issues/41322
            this._lifecycleService.when(2 /* Ready */).then(() => {
                // reschedule to ensure this runs after restoring viewlets, panels, and editors
                (0, async_1.runWhenIdle)(() => {
                    this._initialize();
                }, 50 /*max delay*/);
            });
        }
        _isLocalWebWorkerEnabled() {
            var _a;
            if (this._configurationService.getValue(extensions_2.webWorkerExtHostConfig)) {
                return true;
            }
            if (this._environmentService.isExtensionDevelopment && ((_a = this._environmentService.extensionDevelopmentKind) === null || _a === void 0 ? void 0 : _a.some(k => k === 'web'))) {
                return true;
            }
            return false;
        }
        _scanSingleExtension(extension) {
            if (extension.location.scheme === network_1.Schemas.vscodeRemote) {
                return this._remoteAgentService.scanSingleExtension(extension.location, extension.type === 0 /* System */);
            }
            return this._extensionScanner.scanSingleExtension(extension.location.fsPath, extension.type === 0 /* System */, this.createLogger());
        }
        async _scanAllLocalExtensions() {
            return (0, arrays_1.flatten)(await Promise.all([
                this._extensionScanner.scannedExtensions,
                this._webExtensionsScannerService.scanAndTranslateExtensions().then(extensions => extensions.map(abstractExtensionService_1.parseScannedExtension))
            ]));
        }
        _createLocalExtensionHostDataProvider(isInitialStart, desiredRunningLocation) {
            return {
                getInitData: async () => {
                    if (isInitialStart) {
                        const localExtensions = this._checkEnabledAndProposedAPI(await this._scanAllLocalExtensions());
                        const runningLocation = this._runningLocationClassifier.determineRunningLocation(localExtensions, []);
                        const localProcessExtensions = filterByRunningLocation(localExtensions, runningLocation, desiredRunningLocation);
                        return {
                            autoStart: false,
                            extensions: localProcessExtensions
                        };
                    }
                    else {
                        // restart case
                        const allExtensions = await this.getExtensions();
                        const localProcessExtensions = filterByRunningLocation(allExtensions, this._runningLocation, desiredRunningLocation);
                        return {
                            autoStart: true,
                            extensions: localProcessExtensions
                        };
                    }
                }
            };
        }
        _createRemoteExtensionHostDataProvider(remoteAuthority) {
            return {
                remoteAuthority: remoteAuthority,
                getInitData: async () => {
                    await this.whenInstalledExtensionsRegistered();
                    return this._remoteInitData.get(remoteAuthority);
                }
            };
        }
        _pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference) {
            return ExtensionService.pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, Boolean(this._environmentService.remoteAuthority), this._enableLocalWebWorker);
        }
        static pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference, hasRemoteExtHost, hasWebWorkerExtHost) {
            const result = [];
            for (const extensionKind of extensionKinds) {
                if (extensionKind === 'ui' && isInstalledLocally) {
                    // ui extensions run locally if possible
                    if (preference === 0 /* None */ || preference === 1 /* Local */) {
                        return 1 /* LocalProcess */;
                    }
                    else {
                        result.push(1 /* LocalProcess */);
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
                if (extensionKind === 'workspace' && !hasRemoteExtHost) {
                    // workspace extensions also run locally if there is no remote
                    if (preference === 0 /* None */ || preference === 1 /* Local */) {
                        return 1 /* LocalProcess */;
                    }
                    else {
                        result.push(1 /* LocalProcess */);
                    }
                }
                if (extensionKind === 'web' && isInstalledLocally && hasWebWorkerExtHost) {
                    // web worker extensions run in the local web worker if possible
                    if (preference === 0 /* None */ || preference === 1 /* Local */) {
                        return 2 /* LocalWebWorker */;
                    }
                    else {
                        result.push(2 /* LocalWebWorker */);
                    }
                }
            }
            return (result.length > 0 ? result[0] : 0 /* None */);
        }
        _createExtensionHosts(isInitialStart) {
            const result = [];
            const localProcessExtHost = this._instantiationService.createInstance(localProcessExtensionHost_1.LocalProcessExtensionHost, this._createLocalExtensionHostDataProvider(isInitialStart, 1 /* LocalProcess */));
            result.push(localProcessExtHost);
            if (this._enableLocalWebWorker) {
                const webWorkerExtHost = this._instantiationService.createInstance(webWorkerExtensionHost_1.WebWorkerExtensionHost, this._createLocalExtensionHostDataProvider(isInitialStart, 2 /* LocalWebWorker */));
                result.push(webWorkerExtHost);
            }
            const remoteAgentConnection = this._remoteAgentService.getConnection();
            if (remoteAgentConnection) {
                const remoteExtHost = this._instantiationService.createInstance(remoteExtensionHost_1.RemoteExtensionHost, this._createRemoteExtensionHostDataProvider(remoteAgentConnection.remoteAuthority), this._remoteAgentService.socketFactory);
                result.push(remoteExtHost);
            }
            return result;
        }
        _onExtensionHostCrashed(extensionHost, code, signal) {
            const activatedExtensions = Array.from(this._extensionHostActiveExtensions.values());
            super._onExtensionHostCrashed(extensionHost, code, signal);
            if (extensionHost.kind === 0 /* LocalProcess */) {
                if (code === 55 /* VersionMismatch */) {
                    this._notificationService.prompt(notification_1.Severity.Error, nls.localize(0, null), [{
                            label: nls.localize(1, null),
                            run: () => {
                                this._instantiationService.invokeFunction((accessor) => {
                                    const hostService = accessor.get(host_1.IHostService);
                                    hostService.restart();
                                });
                            }
                        }]);
                    return;
                }
                const message = `Extension host terminated unexpectedly. The following extensions were running: ${activatedExtensions.map(id => id.value).join(', ')}`;
                this._logService.error(message);
                this._notificationService.prompt(notification_1.Severity.Error, nls.localize(2, null), [{
                        label: nls.localize(3, null),
                        run: () => this._nativeHostService.openDevTools()
                    },
                    {
                        label: nls.localize(4, null),
                        run: () => this.startExtensionHosts()
                    }]);
                this._telemetryService.publicLog2('extensionHostCrash', {
                    code,
                    signal,
                    extensionIds: activatedExtensions.map(e => e.value)
                });
                for (const extensionId of activatedExtensions) {
                    this._telemetryService.publicLog2('extensionHostCrashExtension', {
                        code,
                        signal,
                        extensionId: extensionId.value
                    });
                }
            }
        }
        // --- impl
        createLogger() {
            return new extensionPoints_1.Logger((severity, source, message) => {
                if (this._isDev && source) {
                    this._logOrShowMessage(severity, `[${source}]: ${message}`);
                }
                else {
                    this._logOrShowMessage(severity, message);
                }
            });
        }
        async _resolveAuthorityAgain() {
            const remoteAuthority = this._environmentService.remoteAuthority;
            if (!remoteAuthority) {
                return;
            }
            const localProcessExtensionHost = this._getExtensionHostManager(0 /* LocalProcess */);
            this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
            try {
                const result = await localProcessExtensionHost.resolveAuthority(remoteAuthority);
                this._remoteAuthorityResolverService._setResolvedAuthority(result.authority, result.options);
            }
            catch (err) {
                this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
            }
        }
        async _scanAndHandleExtensions() {
            var _a, _b;
            this._extensionScanner.startScanningExtensions(this.createLogger());
            const remoteAuthority = this._environmentService.remoteAuthority;
            const localProcessExtensionHost = this._getExtensionHostManager(0 /* LocalProcess */);
            const localExtensions = this._checkEnabledAndProposedAPI(await this._scanAllLocalExtensions());
            let remoteEnv = null;
            let remoteExtensions = [];
            if (remoteAuthority) {
                let resolverResult;
                try {
                    resolverResult = await localProcessExtensionHost.resolveAuthority(remoteAuthority);
                }
                catch (err) {
                    if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isNoResolverFound(err)) {
                        err.isHandled = await this._handleNoResolverFound(remoteAuthority);
                    }
                    else {
                        console.log(err);
                        if (remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err)) {
                            console.log(`Error handled: Not showing a notification for the error`);
                        }
                    }
                    this._remoteAuthorityResolverService._setResolvedAuthorityError(remoteAuthority, err);
                    // Proceed with the local extension host
                    await this._startLocalExtensionHost(localExtensions);
                    return;
                }
                let promptForMachineTrust = MACHINE_PROMPT;
                if (((_a = resolverResult.options) === null || _a === void 0 ? void 0 : _a.trust) === remoteAuthorityResolver_1.RemoteTrustOption.DisableTrust) {
                    promptForMachineTrust = false;
                    this._workspaceTrustManagementService.setWorkspaceTrust(true);
                }
                else if (((_b = resolverResult.options) === null || _b === void 0 ? void 0 : _b.trust) === remoteAuthorityResolver_1.RemoteTrustOption.MachineTrusted) {
                    promptForMachineTrust = false;
                }
                if (promptForMachineTrust) {
                    const dialogResult = await this._dialogService.show(notification_1.Severity.Info, nls.localize(5, null), [nls.localize(6, null), nls.localize(7, null)], {
                        cancelId: 1,
                        custom: {
                            icon: codicons_1.Codicon.remoteExplorer
                        },
                        // checkbox: { label: nls.localize('remember', "Remember my choice"), checked: true }
                    });
                    if (dialogResult.choice !== 0) {
                        // Did not confirm trust
                        this._notificationService.notify({ severity: notification_1.Severity.Warning, message: nls.localize(8, null) });
                        // Proceed with the local extension host
                        await this._startLocalExtensionHost(localExtensions);
                        return;
                    }
                }
                // set the resolved authority
                this._remoteAuthorityResolverService._setResolvedAuthority(resolverResult.authority, resolverResult.options);
                this._remoteExplorerService.setTunnelInformation(resolverResult.tunnelInformation);
                // monitor for breakage
                const connection = this._remoteAgentService.getConnection();
                if (connection) {
                    connection.onDidStateChange(async (e) => {
                        if (e.type === 0 /* ConnectionLost */) {
                            this._remoteAuthorityResolverService._clearResolvedAuthority(remoteAuthority);
                        }
                    });
                    connection.onReconnecting(() => this._resolveAuthorityAgain());
                }
                // fetch the remote environment
                [remoteEnv, remoteExtensions] = await Promise.all([
                    this._remoteAgentService.getEnvironment(),
                    this._remoteAgentService.scanExtensions()
                ]);
                remoteExtensions = this._checkEnabledAndProposedAPI(remoteExtensions);
                if (!remoteEnv) {
                    this._notificationService.notify({ severity: notification_1.Severity.Error, message: nls.localize(9, null) });
                    // Proceed with the local extension host
                    await this._startLocalExtensionHost(localExtensions);
                    return;
                }
                (0, request_1.updateProxyConfigurationsScope)(remoteEnv.useHostProxy ? 1 /* APPLICATION */ : 2 /* MACHINE */);
            }
            await this._startLocalExtensionHost(localExtensions, remoteAuthority, remoteEnv, remoteExtensions);
        }
        async _startLocalExtensionHost(localExtensions, remoteAuthority = undefined, remoteEnv = null, remoteExtensions = []) {
            this._runningLocation = this._runningLocationClassifier.determineRunningLocation(localExtensions, remoteExtensions);
            // remove non-UI extensions from the local extensions
            const localProcessExtensions = filterByRunningLocation(localExtensions, this._runningLocation, 1 /* LocalProcess */);
            const localWebWorkerExtensions = filterByRunningLocation(localExtensions, this._runningLocation, 2 /* LocalWebWorker */);
            remoteExtensions = filterByRunningLocation(remoteExtensions, this._runningLocation, 3 /* Remote */);
            const result = this._registry.deltaExtensions(remoteExtensions.concat(localProcessExtensions).concat(localWebWorkerExtensions), []);
            if (result.removedDueToLooping.length > 0) {
                this._logOrShowMessage(notification_1.Severity.Error, nls.localize(10, null, result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', ')));
            }
            if (remoteAuthority && remoteEnv) {
                this._remoteInitData.set(remoteAuthority, {
                    connectionData: this._remoteAuthorityResolverService.getConnectionData(remoteAuthority),
                    pid: remoteEnv.pid,
                    appRoot: remoteEnv.appRoot,
                    extensionHostLogsPath: remoteEnv.extensionHostLogsPath,
                    globalStorageHome: remoteEnv.globalStorageHome,
                    workspaceStorageHome: remoteEnv.workspaceStorageHome,
                    extensions: remoteExtensions,
                    allExtensions: this._registry.getAllExtensionDescriptions(),
                });
            }
            this._doHandleExtensionPoints(this._registry.getAllExtensionDescriptions());
            const localProcessExtensionHost = this._getExtensionHostManager(0 /* LocalProcess */);
            if (localProcessExtensionHost) {
                localProcessExtensionHost.start(localProcessExtensions.map(extension => extension.identifier).filter(id => this._registry.containsExtension(id)));
            }
            const localWebWorkerExtensionHost = this._getExtensionHostManager(1 /* LocalWebWorker */);
            if (localWebWorkerExtensionHost) {
                localWebWorkerExtensionHost.start(localWebWorkerExtensions.map(extension => extension.identifier).filter(id => this._registry.containsExtension(id)));
            }
        }
        async getInspectPort(tryEnableInspector) {
            const localProcessExtensionHost = this._getExtensionHostManager(0 /* LocalProcess */);
            if (localProcessExtensionHost) {
                return localProcessExtensionHost.getInspectPort(tryEnableInspector);
            }
            return 0;
        }
        _onExtensionHostExit(code) {
            // Dispose everything associated with the extension host
            this.stopExtensionHosts();
            if (this._isExtensionDevTestFromCli) {
                // When CLI testing make sure to exit with proper exit code
                this._nativeHostService.exit(code);
            }
            else {
                // Expected development extension termination: When the extension host goes down we also shutdown the window
                this._nativeHostService.closeWindow();
            }
        }
        async _handleNoResolverFound(remoteAuthority) {
            var _a;
            const remoteName = (0, remoteHosts_1.getRemoteName)(remoteAuthority);
            const recommendation = (_a = this._productService.remoteExtensionTips) === null || _a === void 0 ? void 0 : _a[remoteName];
            if (!recommendation) {
                return false;
            }
            const sendTelemetry = (userReaction) => {
                /* __GDPR__
                "remoteExtensionRecommendations:popup" : {
                    "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "extensionId": { "classification": "PublicNonPersonalData", "purpose": "FeatureInsight" }
                }
                */
                this._telemetryService.publicLog('remoteExtensionRecommendations:popup', { userReaction, extensionId: resolverExtensionId });
            };
            const resolverExtensionId = recommendation.extensionId;
            const allExtensions = await this._scanAllLocalExtensions();
            const extension = allExtensions.filter(e => e.identifier.value === resolverExtensionId)[0];
            if (extension) {
                if (!this._isEnabled(extension)) {
                    const message = nls.localize(11, null, recommendation.friendlyName);
                    this._notificationService.prompt(notification_1.Severity.Info, message, [{
                            label: nls.localize(12, null),
                            run: async () => {
                                sendTelemetry('enable');
                                await this._extensionEnablementService.setEnablement([(0, extensions_2.toExtension)(extension)], 6 /* EnabledGlobally */);
                                await this._hostService.reload();
                            }
                        }], { sticky: true });
                }
            }
            else {
                // Install the Extension and reload the window to handle.
                const message = nls.localize(13, null, recommendation.friendlyName);
                this._notificationService.prompt(notification_1.Severity.Info, message, [{
                        label: nls.localize(14, null),
                        run: async () => {
                            sendTelemetry('install');
                            const galleryExtension = await this._extensionGalleryService.getCompatibleExtension({ id: resolverExtensionId });
                            if (galleryExtension) {
                                await this._extensionManagementService.installFromGallery(galleryExtension);
                                await this._hostService.reload();
                            }
                            else {
                                this._notificationService.error(nls.localize(15, null));
                            }
                        }
                    }], {
                    sticky: true,
                    onCancel: () => sendTelemetry('cancel')
                });
            }
            return true;
        }
    };
    ExtensionService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notification_1.INotificationService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(5, files_1.IFileService),
        __param(6, productService_1.IProductService),
        __param(7, extensionManagement_1.IExtensionManagementService),
        __param(8, workspace_1.IWorkspaceContextService),
        __param(9, configuration_1.IConfigurationService),
        __param(10, remoteAgentService_1.IRemoteAgentService),
        __param(11, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(12, lifecycle_1.ILifecycleService),
        __param(13, extensionManagement_2.IWebExtensionsScannerService),
        __param(14, native_1.INativeHostService),
        __param(15, host_1.IHostService),
        __param(16, remoteExplorerService_1.IRemoteExplorerService),
        __param(17, extensionManagement_1.IExtensionGalleryService),
        __param(18, log_1.ILogService),
        __param(19, dialogs_1.IDialogService),
        __param(20, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(21, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], ExtensionService);
    exports.ExtensionService = ExtensionService;
    function filterByRunningLocation(extensions, runningLocation, desiredRunningLocation) {
        return extensions.filter(ext => runningLocation.get(extensions_3.ExtensionIdentifier.toKey(ext.identifier)) === desiredRunningLocation);
    }
    (0, extensions_1.registerSingleton)(extensions_2.IExtensionService, ExtensionService);
    class RestartExtensionHostAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.restartExtensionHost',
                title: { value: nls.localize(16, null), original: 'Restart Extension Host' },
                category: actions_2.CATEGORIES.Developer,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(extensions_2.IExtensionService).restartExtensionHost();
        }
    }
    (0, actions_1.registerAction2)(RestartExtensionHostAction);
});
//# sourceMappingURL=extensionService.js.map