/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/product/common/product", "vs/platform/windows/common/windows", "vs/workbench/browser/workbench", "vs/workbench/electron-sandbox/window", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/uri", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/workspaces/common/workspaces", "vs/platform/log/common/log", "vs/platform/storage/electron-sandbox/storageService", "vs/base/common/network", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/platform/storage/common/storage", "vs/base/common/lifecycle", "vs/platform/ipc/electron-sandbox/services", "vs/platform/remote/electron-sandbox/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/electron-sandbox/remoteAgentServiceImpl", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/files/common/fileService", "vs/platform/files/common/files", "vs/workbench/services/remote/common/remoteAgentFileSystemChannel", "vs/workbench/services/configuration/electron-sandbox/configurationCache", "vs/platform/sign/common/sign", "vs/base/common/path", "vs/platform/product/common/productService", "vs/platform/native/electron-sandbox/native", "vs/platform/native/electron-sandbox/nativeHostService", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/services/uriIdentity/common/uriIdentityService", "vs/workbench/services/keybinding/electron-sandbox/nativeKeyboardLayout", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/platform/ipc/electron-sandbox/mainProcessService", "vs/platform/log/common/logIpc", "vs/base/parts/ipc/common/ipc", "vs/workbench/services/log/electron-sandbox/logService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/workspace/common/workspaceTrust", "vs/platform/driver/electron-sandbox/driver"], function (require, exports, product_1, windows_1, workbench_1, window_1, browser_1, dom_1, errors_1, uri_1, configurationService_1, environmentService_1, serviceCollection_1, workspaces_1, log_1, storageService_1, network_1, workspace_1, configuration_1, storage_1, lifecycle_1, services_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteAgentServiceImpl_1, remoteAgentService_1, fileService_1, files_1, remoteAgentFileSystemChannel_1, configurationCache_1, sign_1, path_1, productService_1, native_1, nativeHostService_1, uriIdentity_1, uriIdentityService_1, nativeKeyboardLayout_1, keyboardLayout_1, mainProcessService_1, logIpc_1, ipc_1, logService_1, workspaceTrust_1, workspaceTrust_2, driver_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SharedDesktopMain = void 0;
    class SharedDesktopMain extends lifecycle_1.Disposable {
        constructor(configuration) {
            super();
            this.configuration = configuration;
            this.init();
        }
        init() {
            // Massage configuration file URIs
            this.reviveUris();
            // Browser config
            const zoomLevel = this.configuration.zoomLevel || 0;
            (0, browser_1.setZoomFactor)((0, windows_1.zoomLevelToZoomFactor)(zoomLevel));
            (0, browser_1.setZoomLevel)(zoomLevel, true /* isTrusted */);
            (0, browser_1.setFullscreen)(!!this.configuration.fullscreen);
        }
        reviveUris() {
            // Workspace
            const workspace = (0, workspaces_1.reviveIdentifier)(this.configuration.workspace);
            if ((0, workspaces_1.isWorkspaceIdentifier)(workspace) || (0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                this.configuration.workspace = workspace;
            }
            // Files
            const filesToWait = this.configuration.filesToWait;
            const filesToWaitPaths = filesToWait === null || filesToWait === void 0 ? void 0 : filesToWait.paths;
            [filesToWaitPaths, this.configuration.filesToOpenOrCreate, this.configuration.filesToDiff].forEach(paths => {
                if (Array.isArray(paths)) {
                    paths.forEach(path => {
                        if (path.fileUri) {
                            path.fileUri = uri_1.URI.revive(path.fileUri);
                        }
                    });
                }
            });
            if (filesToWait) {
                filesToWait.waitMarkerFileUri = uri_1.URI.revive(filesToWait.waitMarkerFileUri);
            }
        }
        async open() {
            // Init services and wait for DOM to be ready in parallel
            const [services] = await Promise.all([this.initServices(), (0, dom_1.domContentLoaded)()]);
            // Create Workbench
            const workbench = new workbench_1.Workbench(document.body, services.serviceCollection, services.logService);
            // Listeners
            this.registerListeners(workbench, services.storageService);
            // Startup
            const instantiationService = workbench.startup();
            // Window
            this._register(instantiationService.createInstance(window_1.NativeWindow));
            // Logging
            services.logService.trace('workbench configuration', JSON.stringify(this.configuration));
            // Driver
            if (this.configuration.driver) {
                instantiationService.invokeFunction(async (accessor) => this._register(await (0, driver_1.registerWindowDriver)(accessor, this.configuration.windowId)));
            }
        }
        registerListeners(workbench, storageService) {
            // Workbench Lifecycle
            this._register(workbench.onWillShutdown(event => event.join(storageService.close(), 'join.closeStorage')));
            this._register(workbench.onDidShutdown(() => this.dispose()));
        }
        async initServices() {
            const serviceCollection = new serviceCollection_1.ServiceCollection();
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.sandbox.main.ts` if the service
            //       is desktop only.
            //
            //       DO NOT add services to `workbench.desktop.main.ts`, always add
            //       to `workbench.sandbox.main.ts` to support our Electron sandbox
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Main Process
            const mainProcessService = this._register(new mainProcessService_1.ElectronIPCMainProcessService(this.configuration.windowId));
            serviceCollection.set(services_1.IMainProcessService, mainProcessService);
            // Product
            const productService = Object.assign({ _serviceBrand: undefined }, product_1.default);
            serviceCollection.set(productService_1.IProductService, productService);
            // Environment
            const environmentService = new environmentService_1.NativeWorkbenchEnvironmentService(this.configuration, productService);
            serviceCollection.set(environmentService_1.INativeWorkbenchEnvironmentService, environmentService);
            // Logger
            const logLevelChannelClient = new logIpc_1.LogLevelChannelClient(mainProcessService.getChannel('logLevel'));
            const loggerService = new logIpc_1.LoggerChannelClient(environmentService.configuration.logLevel, logLevelChannelClient.onDidChangeLogLevel, mainProcessService.getChannel('logger'));
            serviceCollection.set(log_1.ILoggerService, loggerService);
            // Log
            const logService = this._register(new logService_1.NativeLogService(`renderer${this.configuration.windowId}`, environmentService.configuration.logLevel, loggerService, logLevelChannelClient, environmentService));
            serviceCollection.set(log_1.ILogService, logService);
            // Remote
            const remoteAuthorityResolverService = new remoteAuthorityResolverService_1.RemoteAuthorityResolverService();
            serviceCollection.set(remoteAuthorityResolver_1.IRemoteAuthorityResolverService, remoteAuthorityResolverService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.sandbox.main.ts` if the service
            //       is desktop only.
            //
            //       DO NOT add services to `workbench.desktop.main.ts`, always add
            //       to `workbench.sandbox.main.ts` to support our Electron sandbox
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // Sign
            const signService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('sign'));
            serviceCollection.set(sign_1.ISignService, signService);
            // Remote Agent
            const remoteAgentService = this._register(new remoteAgentServiceImpl_1.RemoteAgentService(environmentService, productService, remoteAuthorityResolverService, signService, logService));
            serviceCollection.set(remoteAgentService_1.IRemoteAgentService, remoteAgentService);
            // Native Host
            const nativeHostService = new nativeHostService_1.NativeHostService(this.configuration.windowId, mainProcessService);
            serviceCollection.set(native_1.INativeHostService, nativeHostService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            serviceCollection.set(files_1.IFileService, fileService);
            const result = this.registerFileSystemProviders(environmentService, fileService, logService, nativeHostService);
            if (result instanceof Promise) {
                await result;
            }
            // Uri Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            serviceCollection.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.sandbox.main.ts` if the service
            //       is desktop only.
            //
            //       DO NOT add services to `workbench.desktop.main.ts`, always add
            //       to `workbench.sandbox.main.ts` to support our Electron sandbox
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const connection = remoteAgentService.getConnection();
            if (connection) {
                const remoteFileSystemProvider = this._register(new remoteAgentFileSystemChannel_1.RemoteFileSystemProvider(remoteAgentService));
                fileService.registerProvider(network_1.Schemas.vscodeRemote, remoteFileSystemProvider);
            }
            const payload = this.resolveWorkspaceInitializationPayload(environmentService);
            const [configurationService, storageService] = await Promise.all([
                this.createWorkspaceService(payload, environmentService, fileService, remoteAgentService, uriIdentityService, logService).then(service => {
                    // Workspace
                    serviceCollection.set(workspace_1.IWorkspaceContextService, service);
                    // Configuration
                    serviceCollection.set(configuration_1.IWorkbenchConfigurationService, service);
                    return service;
                }),
                this.createStorageService(payload, environmentService, mainProcessService).then(service => {
                    // Storage
                    serviceCollection.set(storage_1.IStorageService, service);
                    return service;
                }),
                this.createKeyboardLayoutService(mainProcessService).then(service => {
                    // KeyboardLayout
                    serviceCollection.set(keyboardLayout_1.IKeyboardLayoutService, service);
                    return service;
                })
            ]);
            // Workspace Trust Service
            const workspaceTrustManagementService = new workspaceTrust_1.WorkspaceTrustManagementService(configurationService, environmentService, storageService, uriIdentityService, configurationService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustManagementService, workspaceTrustManagementService);
            // Update workspace trust so that configuration is updated accordingly
            configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkpaceTrusted());
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkpaceTrusted())));
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            //
            // NOTE: Please do NOT register services here. Use `registerSingleton()`
            //       from `workbench.common.main.ts` if the service is shared between
            //       desktop and web or `workbench.sandbox.main.ts` if the service
            //       is desktop only.
            //
            //       DO NOT add services to `workbench.desktop.main.ts`, always add
            //       to `workbench.sandbox.main.ts` to support our Electron sandbox
            //
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            return { serviceCollection, logService, storageService };
        }
        resolveWorkspaceInitializationPayload(environmentService) {
            let workspaceInitializationPayload = this.configuration.workspace;
            // Fallback to empty workspace if we have no payload yet.
            if (!workspaceInitializationPayload) {
                let id;
                if (this.configuration.backupPath) {
                    id = (0, path_1.basename)(this.configuration.backupPath); // we know the backupPath must be a unique path so we leverage its name as workspace ID
                }
                else if (environmentService.isExtensionDevelopment) {
                    id = 'ext-dev'; // extension development window never stores backups and is a singleton
                }
                else {
                    throw new Error('Unexpected window configuration without backupPath');
                }
                workspaceInitializationPayload = { id };
            }
            return workspaceInitializationPayload;
        }
        async createWorkspaceService(payload, environmentService, fileService, remoteAgentService, uriIdentityService, logService) {
            const workspaceService = new configurationService_1.WorkspaceService({ remoteAuthority: environmentService.remoteAuthority, configurationCache: new configurationCache_1.ConfigurationCache(uri_1.URI.file(environmentService.userDataPath), fileService) }, environmentService, fileService, remoteAgentService, uriIdentityService, logService);
            try {
                await workspaceService.initialize(payload);
                return workspaceService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                return workspaceService;
            }
        }
        async createStorageService(payload, environmentService, mainProcessService) {
            const storageService = new storageService_1.NativeStorageService(payload, mainProcessService, environmentService);
            try {
                await storageService.initialize();
                return storageService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                return storageService;
            }
        }
        async createKeyboardLayoutService(mainProcessService) {
            const keyboardLayoutService = new nativeKeyboardLayout_1.KeyboardLayoutService(mainProcessService);
            try {
                await keyboardLayoutService.initialize();
                return keyboardLayoutService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                return keyboardLayoutService;
            }
        }
    }
    exports.SharedDesktopMain = SharedDesktopMain;
});
//# sourceMappingURL=shared.desktop.main.js.map