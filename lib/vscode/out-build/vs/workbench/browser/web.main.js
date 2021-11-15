/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/performance", "vs/base/browser/dom", "vs/platform/instantiation/common/serviceCollection", "vs/platform/log/common/log", "vs/platform/log/browser/log", "vs/base/common/lifecycle", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/browser/workbench", "vs/workbench/services/remote/common/remoteAgentFileSystemChannel", "vs/workbench/services/environment/common/environmentService", "vs/platform/product/common/productService", "vs/platform/product/common/product", "vs/workbench/services/remote/browser/remoteAgentServiceImpl", "vs/platform/remote/browser/remoteAuthorityResolverService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/base/common/network", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/configuration", "vs/base/common/errors", "vs/base/browser/browser", "vs/base/common/uri", "vs/workbench/services/configuration/browser/configurationService", "vs/workbench/services/configuration/browser/configurationCache", "vs/platform/sign/common/sign", "vs/platform/sign/browser/signService", "vs/platform/storage/browser/storageService", "vs/platform/storage/common/storage", "vs/platform/log/common/bufferLog", "vs/platform/log/common/fileLog", "vs/base/common/date", "vs/platform/windows/common/windows", "vs/server/browser/client", "vs/workbench/services/workspaces/browser/workspaces", "vs/base/common/arrays", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/commands/common/commands", "vs/platform/files/browser/indexedDBFileSystemProvider", "vs/workbench/services/request/browser/requestService", "vs/platform/request/common/request", "vs/workbench/services/userData/browser/userDataInit", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/browser/web.main", "vs/workbench/common/actions", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/host/browser/host", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/services/uriIdentity/common/uriIdentityService", "vs/workbench/browser/window", "vs/workbench/services/timer/browser/timerService", "vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/workspace/common/workspaceTrust", "vs/platform/files/browser/htmlFileSystemProvider"], function (require, exports, performance_1, dom_1, serviceCollection_1, log_1, log_2, lifecycle_1, environmentService_1, workbench_1, remoteAgentFileSystemChannel_1, environmentService_2, productService_1, product_1, remoteAgentServiceImpl_1, remoteAuthorityResolverService_1, remoteAuthorityResolver_1, remoteAgentService_1, files_1, fileService_1, network_1, workspace_1, configuration_1, errors_1, browser_1, uri_1, configurationService_1, configurationCache_1, sign_1, signService_1, storageService_1, storage_1, bufferLog_1, fileLog_1, date_1, windows_1, client_1, workspaces_1, arrays_1, inMemoryFilesystemProvider_1, commands_1, indexedDBFileSystemProvider_1, requestService_1, request_1, userDataInit_1, userDataSyncStoreService_1, userDataSync_1, lifecycle_2, actions_1, nls_1, actions_2, dialogs_1, host_1, uriIdentity_1, uriIdentityService_1, window_1, timerService_1, workspaceTrust_1, workspaceTrust_2, htmlFileSystemProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class BrowserMain extends lifecycle_1.Disposable {
        constructor(domElement, configuration) {
            super();
            this.domElement = domElement;
            this.configuration = configuration;
            this.init();
        }
        init() {
            // Browser config
            (0, browser_1.setFullscreen)(!!(0, dom_1.detectFullscreen)());
        }
        async open() {
            // Init services and wait for DOM to be ready in parallel
            const [services] = await Promise.all([this.initServices(), (0, dom_1.domContentLoaded)()]);
            // Create Workbench
            const workbench = new workbench_1.Workbench(this.domElement, services.serviceCollection, services.logService);
            // Listeners
            this.registerListeners(workbench, services.storageService, services.logService);
            // Startup
            const instantiationService = workbench.startup();
            await (0, client_1.initialize)(services.serviceCollection);
            // Window
            this._register(instantiationService.createInstance(window_1.BrowserWindow));
            // Logging
            services.logService.trace('workbench configuration', JSON.stringify(this.configuration));
            // Return API Facade
            return instantiationService.invokeFunction(accessor => {
                const commandService = accessor.get(commands_1.ICommandService);
                const lifecycleService = accessor.get(lifecycle_2.ILifecycleService);
                const timerService = accessor.get(timerService_1.ITimerService);
                return {
                    commands: {
                        executeCommand: (command, ...args) => commandService.executeCommand(command, ...args)
                    },
                    env: {
                        async retrievePerformanceMarks() {
                            await timerService.whenReady();
                            return timerService.getPerformanceMarks();
                        }
                    },
                    shutdown: () => lifecycleService.shutdown()
                };
            });
        }
        registerListeners(workbench, storageService, logService) {
            // Workbench Lifecycle
            this._register(workbench.onBeforeShutdown(event => {
                if (storageService.hasPendingUpdate) {
                    event.veto(true, 'veto.pendingStorageUpdate'); // prevent data loss from pending storage update
                }
            }));
            this._register(workbench.onWillShutdown(() => storageService.close()));
            this._register(workbench.onDidShutdown(() => this.dispose()));
        }
        async initServices() {
            const serviceCollection = new serviceCollection_1.ServiceCollection();
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // NOTE: DO NOT ADD ANY OTHER SERVICE INTO THE COLLECTION HERE.
            // CONTRIBUTE IT VIA WORKBENCH.WEB.MAIN.TS AND registerSingleton().
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            const payload = this.resolveWorkspaceInitializationPayload();
            // Product
            const productService = Object.assign(Object.assign({ _serviceBrand: undefined }, product_1.default), this.configuration.productConfiguration);
            serviceCollection.set(productService_1.IProductService, productService);
            // Environment
            const logsPath = uri_1.URI.file((0, date_1.toLocalISOString)(new Date()).replace(/-|:|\.\d+Z$/g, '')).with({ scheme: 'vscode-log' });
            const environmentService = new environmentService_1.BrowserWorkbenchEnvironmentService(Object.assign({ workspaceId: payload.id, logsPath }, this.configuration), productService);
            serviceCollection.set(environmentService_2.IWorkbenchEnvironmentService, environmentService);
            // Log
            const logService = new bufferLog_1.BufferLogService((0, log_1.getLogLevel)(environmentService));
            serviceCollection.set(log_1.ILogService, logService);
            // Remote
            const connectionToken = environmentService.options.connectionToken || (0, dom_1.getCookieValue)('vscode-tkn');
            const remoteAuthorityResolverService = new remoteAuthorityResolverService_1.RemoteAuthorityResolverService(connectionToken, this.configuration.resourceUriProvider);
            serviceCollection.set(remoteAuthorityResolver_1.IRemoteAuthorityResolverService, remoteAuthorityResolverService);
            // Signing
            const signService = new signService_1.SignService(connectionToken);
            serviceCollection.set(sign_1.ISignService, signService);
            // Remote Agent
            const remoteAgentService = this._register(new remoteAgentServiceImpl_1.RemoteAgentService(this.configuration.webSocketFactory, environmentService, productService, remoteAuthorityResolverService, signService, logService));
            serviceCollection.set(remoteAgentService_1.IRemoteAgentService, remoteAgentService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            serviceCollection.set(files_1.IFileService, fileService);
            await this.registerFileSystemProviders(environmentService, fileService, remoteAgentService, logService, logsPath);
            // IURIIdentityService
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            serviceCollection.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // Long running services (workspace, config, storage)
            const [configurationService, storageService] = await Promise.all([
                this.createWorkspaceService(payload, environmentService, fileService, remoteAgentService, uriIdentityService, logService).then(service => {
                    // Workspace
                    serviceCollection.set(workspace_1.IWorkspaceContextService, service);
                    // Configuration
                    serviceCollection.set(configuration_1.IWorkbenchConfigurationService, service);
                    return service;
                }),
                this.createStorageService(payload, environmentService, fileService, logService).then(service => {
                    // Storage
                    serviceCollection.set(storage_1.IStorageService, service);
                    return service;
                })
            ]);
            // Workspace Trust Service
            const workspaceTrustManagementService = new workspaceTrust_1.WorkspaceTrustManagementService(configurationService, environmentService, storageService, uriIdentityService, configurationService);
            serviceCollection.set(workspaceTrust_2.IWorkspaceTrustManagementService, workspaceTrustManagementService);
            // Update workspace trust so that configuration is updated accordingly
            configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkpaceTrusted());
            this._register(workspaceTrustManagementService.onDidChangeTrust(() => configurationService.updateWorkspaceTrust(workspaceTrustManagementService.isWorkpaceTrusted())));
            // Request Service
            const requestService = new requestService_1.BrowserRequestService(remoteAgentService, configurationService, logService);
            serviceCollection.set(request_1.IRequestService, requestService);
            // Userdata Sync Store Management Service
            const userDataSyncStoreManagementService = new userDataSyncStoreService_1.UserDataSyncStoreManagementService(productService, configurationService, storageService);
            serviceCollection.set(userDataSync_1.IUserDataSyncStoreManagementService, userDataSyncStoreManagementService);
            // Userdata Initialize Service
            const userDataInitializationService = new userDataInit_1.UserDataInitializationService(environmentService, userDataSyncStoreManagementService, fileService, storageService, productService, requestService, logService);
            serviceCollection.set(userDataInit_1.IUserDataInitializationService, userDataInitializationService);
            if (await userDataInitializationService.requiresInitialization()) {
                (0, performance_1.mark)('code/willInitRequiredUserData');
                // Initialize required resources - settings & global state
                await userDataInitializationService.initializeRequiredResources();
                // Important: Reload only local user configuration after initializing
                // Reloading complete configuraiton blocks workbench until remote configuration is loaded.
                await configurationService.reloadLocalUserConfiguration();
                (0, performance_1.mark)('code/didInitRequiredUserData');
            }
            return { serviceCollection, configurationService, logService, storageService };
        }
        async registerFileSystemProviders(environmentService, fileService, remoteAgentService, logService, logsPath) {
            const indexedDB = new indexedDBFileSystemProvider_1.IndexedDB();
            // Logger
            (async () => {
                let indexedDBLogProvider = null;
                try {
                    indexedDBLogProvider = await indexedDB.createFileSystemProvider(logsPath.scheme, indexedDBFileSystemProvider_1.INDEXEDDB_LOGS_OBJECT_STORE);
                }
                catch (error) {
                    (0, errors_1.onUnexpectedError)(error);
                }
                if (indexedDBLogProvider) {
                    fileService.registerProvider(logsPath.scheme, indexedDBLogProvider);
                }
                else {
                    fileService.registerProvider(logsPath.scheme, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
                }
                logService.logger = new log_1.MultiplexLogService((0, arrays_1.coalesce)([
                    new log_1.ConsoleLogger(logService.getLevel()),
                    new fileLog_1.FileLogger('window', environmentService.logFile, logService.getLevel(), fileService),
                    // Extension development test CLI: forward everything to test runner
                    environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI ? new log_2.ConsoleLogInAutomationLogger(logService.getLevel()) : undefined
                ]));
            })();
            const connection = remoteAgentService.getConnection();
            if (connection) {
                // Remote file system
                const remoteFileSystemProvider = this._register(new remoteAgentFileSystemChannel_1.RemoteFileSystemProvider(remoteAgentService));
                fileService.registerProvider(network_1.Schemas.vscodeRemote, remoteFileSystemProvider);
            }
            // User data
            let indexedDBUserDataProvider = null;
            try {
                indexedDBUserDataProvider = await indexedDB.createFileSystemProvider(network_1.Schemas.userData, indexedDBFileSystemProvider_1.INDEXEDDB_USERDATA_OBJECT_STORE);
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
            }
            let userDataProvider;
            if (indexedDBUserDataProvider) {
                userDataProvider = indexedDBUserDataProvider;
            }
            else {
                logService.info('using in-memory user data provider');
                userDataProvider = new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider();
            }
            fileService.registerProvider(network_1.Schemas.userData, userDataProvider);
            if (indexedDBUserDataProvider) {
                (0, actions_1.registerAction2)(class ResetUserDataAction extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.action.resetUserData',
                            title: { original: 'Reset User Data', value: (0, nls_1.localize)(0, null) },
                            category: actions_2.CATEGORIES.Developer,
                            menu: {
                                id: actions_1.MenuId.CommandPalette
                            }
                        });
                    }
                    async run(accessor) {
                        const dialogService = accessor.get(dialogs_1.IDialogService);
                        const hostService = accessor.get(host_1.IHostService);
                        const result = await dialogService.confirm({
                            message: (0, nls_1.localize)(1, null)
                        });
                        if (result.confirmed) {
                            await (indexedDBUserDataProvider === null || indexedDBUserDataProvider === void 0 ? void 0 : indexedDBUserDataProvider.reset());
                        }
                        hostService.reload();
                    }
                });
            }
            fileService.registerProvider(network_1.Schemas.file, new htmlFileSystemProvider_1.HTMLFileSystemProvider());
            fileService.registerProvider(network_1.Schemas.tmp, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
        }
        async createStorageService(payload, environmentService, fileService, logService) {
            const storageService = new storageService_1.BrowserStorageService(payload, environmentService, fileService);
            try {
                await storageService.initialize();
                return storageService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                logService.error(error);
                return storageService;
            }
        }
        async createWorkspaceService(payload, environmentService, fileService, remoteAgentService, uriIdentityService, logService) {
            const workspaceService = new configurationService_1.WorkspaceService({ remoteAuthority: this.configuration.remoteAuthority, configurationCache: new configurationCache_1.ConfigurationCache() }, environmentService, fileService, remoteAgentService, uriIdentityService, logService);
            try {
                await workspaceService.initialize(payload);
                return workspaceService;
            }
            catch (error) {
                (0, errors_1.onUnexpectedError)(error);
                logService.error(error);
                return workspaceService;
            }
        }
        resolveWorkspaceInitializationPayload() {
            let workspace = undefined;
            if (this.configuration.workspaceProvider) {
                workspace = this.configuration.workspaceProvider.workspace;
            }
            // Multi-root workspace
            if (workspace && (0, windows_1.isWorkspaceToOpen)(workspace)) {
                return (0, workspaces_1.getWorkspaceIdentifier)(workspace.workspaceUri);
            }
            // Single-folder workspace
            if (workspace && (0, windows_1.isFolderToOpen)(workspace)) {
                return (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(workspace.folderUri);
            }
            return { id: 'empty-window' };
        }
    }
    function main(domElement, options) {
        const workbench = new BrowserMain(domElement, options);
        return workbench.open();
    }
    exports.main = main;
});
//# sourceMappingURL=web.main.js.map