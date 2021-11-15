/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "os", "graceful-fs", "electron", "vs/platform/product/common/product", "vs/base/parts/ipc/electron-browser/ipc.mp", "vs/base/parts/ipc/common/ipc", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/request/common/request", "vs/platform/request/browser/requestService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetryIpc", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/node/appInsightsAppender", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/localizations/node/localizations", "vs/platform/localizations/common/localizations", "vs/base/common/lifecycle", "vs/platform/download/common/downloadService", "vs/platform/download/common/download", "vs/code/electron-browser/sharedProcess/contrib/nodeCachedDataCleaner", "vs/code/electron-browser/sharedProcess/contrib/languagePackCachedDataCleaner", "vs/code/electron-browser/sharedProcess/contrib/storageDataCleaner", "vs/code/electron-browser/sharedProcess/contrib/logsDataCleaner", "vs/platform/ipc/electron-sandbox/services", "vs/platform/ipc/electron-browser/mainProcessService", "vs/platform/diagnostics/node/diagnosticsService", "vs/platform/diagnostics/common/diagnostics", "vs/platform/files/common/fileService", "vs/platform/files/common/files", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/network", "vs/platform/product/common/productService", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncService", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/userDataSyncIpc", "vs/platform/native/electron-sandbox/native", "vs/platform/userDataSync/common/userDataSyncLog", "vs/platform/userDataSync/electron-sandbox/userDataAutoSyncService", "vs/platform/storage/electron-sandbox/storageService", "vs/platform/storage/common/storage", "vs/platform/extensionManagement/common/extensionEnablementService", "vs/platform/userDataSync/common/userDataSyncResourceEnablementService", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/userDataSync/common/userDataSyncBackupStoreService", "vs/platform/extensionManagement/electron-sandbox/extensionTipsService", "vs/platform/userDataSync/common/userDataSyncMachines", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionRecommendations/electron-sandbox/extensionRecommendationsIpc", "vs/platform/windows/node/windowTracker", "vs/platform/telemetry/common/telemetryLogAppender", "vs/platform/userDataSync/common/userDataAutoSyncService", "vs/platform/userDataSync/common/ignoredExtensions", "vs/platform/userDataSync/common/extensionsStorageSync", "vs/platform/instantiation/common/instantiation", "vs/code/electron-browser/sharedProcess/contrib/localizationsUpdater", "vs/code/electron-browser/sharedProcess/contrib/deprecatedExtensionsCleaner", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/platform/terminal/common/terminal", "vs/platform/terminal/node/ptyHostService", "vs/platform/terminal/electron-sandbox/terminal", "vs/platform/userDataSync/common/userDataSyncServiceIpc", "vs/platform/checksum/common/checksumService", "vs/platform/checksum/node/checksumService", "vs/platform/telemetry/node/customEndpointTelemetryService", "vs/base/common/uri", "vs/base/common/resources"], function (require, exports, fs, os_1, graceful_fs_1, electron_1, product_1, ipc_mp_1, ipc_1, serviceCollection_1, descriptors_1, instantiationService_1, environment_1, environmentService_1, extensionManagementIpc_1, extensionManagement_1, extensionManagementService_1, extensionGalleryService_1, configuration_1, configurationService_1, request_1, requestService_1, telemetry_1, telemetryUtils_1, commonProperties_1, telemetryIpc_1, telemetryService_1, appInsightsAppender_1, log_1, logIpc_1, localizations_1, localizations_2, lifecycle_1, downloadService_1, download_1, nodeCachedDataCleaner_1, languagePackCachedDataCleaner_1, storageDataCleaner_1, logsDataCleaner_1, services_1, mainProcessService_1, diagnosticsService_1, diagnostics_1, fileService_1, files_1, diskFileSystemProvider_1, network_1, productService_1, userDataSync_1, userDataSyncService_1, userDataSyncStoreService_1, userDataSyncIpc_1, native_1, userDataSyncLog_1, userDataAutoSyncService_1, storageService_1, storage_1, extensionEnablementService_1, userDataSyncResourceEnablementService_1, userDataSyncAccount_1, userDataSyncBackupStoreService_1, extensionTipsService_1, userDataSyncMachines_1, extensionRecommendations_1, extensionRecommendationsIpc_1, windowTracker_1, telemetryLogAppender_1, userDataAutoSyncService_2, ignoredExtensions_1, extensionsStorageSync_1, instantiation_1, localizationsUpdater_1, deprecatedExtensionsCleaner_1, errors_1, errorMessage_1, terminal_1, ptyHostService_1, terminal_2, userDataSyncServiceIpc_1, checksumService_1, checksumService_2, customEndpointTelemetryService_1, uri_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class SharedProcessMain extends lifecycle_1.Disposable {
        constructor(configuration) {
            super();
            this.configuration = configuration;
            this.server = this._register(new ipc_mp_1.Server());
            // Enable gracefulFs
            (0, graceful_fs_1.gracefulify)(fs);
            this.registerListeners();
        }
        registerListeners() {
            // Dispose on exit
            const onExit = () => this.dispose();
            process.once('exit', onExit);
            electron_1.ipcRenderer.once('vscode:electron-main->shared-process=exit', onExit);
        }
        async open() {
            // Services
            const instantiationService = await this.initServices();
            // Config
            (0, userDataSync_1.registerConfiguration)();
            instantiationService.invokeFunction(accessor => {
                const logService = accessor.get(log_1.ILogService);
                // Log info
                logService.trace('sharedProcess configuration', JSON.stringify(this.configuration));
                // Channels
                this.initChannels(accessor);
                // Error handler
                this.registerErrorHandler(logService);
            });
            // Instantiate Contributions
            this._register((0, lifecycle_1.combinedDisposable)(instantiationService.createInstance(nodeCachedDataCleaner_1.NodeCachedDataCleaner, this.configuration.nodeCachedDataDir), instantiationService.createInstance(languagePackCachedDataCleaner_1.LanguagePackCachedDataCleaner), instantiationService.createInstance(storageDataCleaner_1.StorageDataCleaner, this.configuration.backupWorkspacesPath), instantiationService.createInstance(logsDataCleaner_1.LogsDataCleaner), instantiationService.createInstance(localizationsUpdater_1.LocalizationsUpdater), instantiationService.createInstance(deprecatedExtensionsCleaner_1.DeprecatedExtensionsCleaner)));
        }
        async initServices() {
            const services = new serviceCollection_1.ServiceCollection();
            // Product
            const productService = Object.assign({ _serviceBrand: undefined }, product_1.default);
            services.set(productService_1.IProductService, productService);
            // Main Process
            const mainRouter = new ipc_1.StaticRouter(ctx => ctx === 'main');
            const mainProcessService = new mainProcessService_1.MessagePortMainProcessService(this.server, mainRouter);
            services.set(services_1.IMainProcessService, mainProcessService);
            // Environment
            const environmentService = new environmentService_1.NativeEnvironmentService(this.configuration.args, productService);
            services.set(environment_1.INativeEnvironmentService, environmentService);
            // Logger
            const logLevelClient = new logIpc_1.LogLevelChannelClient(this.server.getChannel('logLevel', mainRouter));
            const loggerService = new logIpc_1.LoggerChannelClient(this.configuration.logLevel, logLevelClient.onDidChangeLogLevel, mainProcessService.getChannel('logger'));
            services.set(log_1.ILoggerService, loggerService);
            // Log
            const multiplexLogger = this._register(new log_1.MultiplexLogService([
                this._register(new log_1.ConsoleLogger(this.configuration.logLevel)),
                this._register(loggerService.createLogger((0, resources_1.joinPath)(uri_1.URI.file(environmentService.logsPath), 'sharedprocess.log'), { name: 'sharedprocess' }))
            ]));
            const logService = this._register(new logIpc_1.FollowerLogService(logLevelClient, multiplexLogger));
            services.set(log_1.ILogService, logService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            services.set(files_1.IFileService, fileService);
            const diskFileSystemProvider = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // Configuration
            const configurationService = this._register(new configurationService_1.ConfigurationService(environmentService.settingsResource, fileService));
            services.set(configuration_1.IConfigurationService, configurationService);
            await configurationService.initialize();
            // Storage (global access only)
            const storageService = new storageService_1.NativeStorageService(undefined, mainProcessService, environmentService);
            services.set(storage_1.IStorageService, storageService);
            await storageService.initialize();
            this._register((0, lifecycle_1.toDisposable)(() => storageService.flush()));
            // Request
            services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestService_1.RequestService));
            // Checksum
            services.set(checksumService_1.IChecksumService, new descriptors_1.SyncDescriptor(checksumService_2.ChecksumService));
            // Native Host
            const nativeHostService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('nativeHost'), { context: this.configuration.windowId });
            services.set(native_1.INativeHostService, nativeHostService);
            // Download
            services.set(download_1.IDownloadService, new descriptors_1.SyncDescriptor(downloadService_1.DownloadService));
            // Extension recommendations
            const activeWindowManager = this._register(new windowTracker_1.ActiveWindowManager(nativeHostService));
            const activeWindowRouter = new ipc_1.StaticRouter(ctx => activeWindowManager.getActiveClientId().then(id => ctx === id));
            services.set(extensionRecommendations_1.IExtensionRecommendationNotificationService, new extensionRecommendationsIpc_1.ExtensionRecommendationNotificationServiceChannelClient(this.server.getChannel('extensionRecommendationNotification', activeWindowRouter)));
            // Telemetry
            let telemetryService;
            let telemetryAppender;
            if (!environmentService.isExtensionDevelopment && !environmentService.disableTelemetry && productService.enableTelemetry) {
                telemetryAppender = new telemetryLogAppender_1.TelemetryLogAppender(loggerService, environmentService);
                const { appRoot, extensionsPath, isBuilt, installSourcePath } = environmentService;
                // Application Insights
                if (productService.aiConfig && productService.aiConfig.asimovKey && isBuilt) {
                    const appInsightsAppender = new appInsightsAppender_1.AppInsightsAppender('monacoworkbench', null, productService.aiConfig.asimovKey);
                    this._register((0, lifecycle_1.toDisposable)(() => appInsightsAppender.flush())); // Ensure the AI appender is disposed so that it flushes remaining data
                    telemetryAppender = (0, telemetryUtils_1.combinedAppender)(appInsightsAppender, telemetryAppender);
                }
                telemetryService = new telemetryService_1.TelemetryService({
                    appender: telemetryAppender,
                    commonProperties: (0, commonProperties_1.resolveCommonProperties)(fileService, (0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version, this.configuration.machineId, productService.msftInternalDomains, installSourcePath),
                    sendErrorTelemetry: true,
                    piiPaths: [appRoot, extensionsPath]
                }, configurationService);
            }
            else {
                telemetryService = telemetryUtils_1.NullTelemetryService;
                telemetryAppender = telemetryUtils_1.NullAppender;
            }
            this.server.registerChannel('telemetryAppender', new telemetryIpc_1.TelemetryAppenderChannel(telemetryAppender));
            services.set(telemetry_1.ITelemetryService, telemetryService);
            // Custom Endpoint Telemetry
            const customEndpointTelemetryService = new customEndpointTelemetryService_1.CustomEndpointTelemetryService(configurationService, telemetryService);
            services.set(telemetry_1.ICustomEndpointTelemetryService, customEndpointTelemetryService);
            // Extension Management
            services.set(extensionManagement_1.IExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService));
            // Extension Gallery
            services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryService));
            // Extension Tips
            services.set(extensionManagement_1.IExtensionTipsService, new descriptors_1.SyncDescriptor(extensionTipsService_1.ExtensionTipsService));
            // Localizations
            services.set(localizations_2.ILocalizationsService, new descriptors_1.SyncDescriptor(localizations_1.LocalizationsService));
            // Diagnostics
            services.set(diagnostics_1.IDiagnosticsService, new descriptors_1.SyncDescriptor(diagnosticsService_1.DiagnosticsService));
            // Settings Sync
            services.set(userDataSyncAccount_1.IUserDataSyncAccountService, new descriptors_1.SyncDescriptor(userDataSyncAccount_1.UserDataSyncAccountService));
            services.set(userDataSync_1.IUserDataSyncLogService, new descriptors_1.SyncDescriptor(userDataSyncLog_1.UserDataSyncLogService));
            services.set(userDataSync_1.IUserDataSyncUtilService, new userDataSyncIpc_1.UserDataSyncUtilServiceClient(this.server.getChannel('userDataSyncUtil', client => client.ctx !== 'main')));
            services.set(extensionManagement_1.IGlobalExtensionEnablementService, new descriptors_1.SyncDescriptor(extensionEnablementService_1.GlobalExtensionEnablementService));
            services.set(ignoredExtensions_1.IIgnoredExtensionsManagementService, new descriptors_1.SyncDescriptor(ignoredExtensions_1.IgnoredExtensionsManagementService));
            services.set(extensionsStorageSync_1.IExtensionsStorageSyncService, new descriptors_1.SyncDescriptor(extensionsStorageSync_1.ExtensionsStorageSyncService));
            services.set(userDataSync_1.IUserDataSyncStoreManagementService, new descriptors_1.SyncDescriptor(userDataSyncStoreService_1.UserDataSyncStoreManagementService));
            services.set(userDataSync_1.IUserDataSyncStoreService, new descriptors_1.SyncDescriptor(userDataSyncStoreService_1.UserDataSyncStoreService));
            services.set(userDataSyncMachines_1.IUserDataSyncMachinesService, new descriptors_1.SyncDescriptor(userDataSyncMachines_1.UserDataSyncMachinesService));
            services.set(userDataSync_1.IUserDataSyncBackupStoreService, new descriptors_1.SyncDescriptor(userDataSyncBackupStoreService_1.UserDataSyncBackupStoreService));
            services.set(userDataSync_1.IUserDataAutoSyncEnablementService, new descriptors_1.SyncDescriptor(userDataAutoSyncService_2.UserDataAutoSyncEnablementService));
            services.set(userDataSync_1.IUserDataSyncResourceEnablementService, new descriptors_1.SyncDescriptor(userDataSyncResourceEnablementService_1.UserDataSyncResourceEnablementService));
            services.set(userDataSync_1.IUserDataSyncService, new descriptors_1.SyncDescriptor(userDataSyncService_1.UserDataSyncService));
            // Terminal
            services.set(terminal_2.ILocalPtyService, this._register(new ptyHostService_1.PtyHostService(logService, telemetryService)));
            return new instantiationService_1.InstantiationService(services);
        }
        initChannels(accessor) {
            // Extensions Management
            const channel = new extensionManagementIpc_1.ExtensionManagementChannel(accessor.get(extensionManagement_1.IExtensionManagementService), () => null);
            this.server.registerChannel('extensions', channel);
            // Localizations
            const localizationsChannel = ipc_1.ProxyChannel.fromService(accessor.get(localizations_2.ILocalizationsService));
            this.server.registerChannel('localizations', localizationsChannel);
            // Diagnostics
            const diagnosticsChannel = ipc_1.ProxyChannel.fromService(accessor.get(diagnostics_1.IDiagnosticsService));
            this.server.registerChannel('diagnostics', diagnosticsChannel);
            // Extension Tips
            const extensionTipsChannel = new extensionManagementIpc_1.ExtensionTipsChannel(accessor.get(extensionManagement_1.IExtensionTipsService));
            this.server.registerChannel('extensionTipsService', extensionTipsChannel);
            // Checksum
            const checksumChannel = ipc_1.ProxyChannel.fromService(accessor.get(checksumService_1.IChecksumService));
            this.server.registerChannel('checksum', checksumChannel);
            // Settings Sync
            const userDataSyncMachineChannel = new userDataSyncIpc_1.UserDataSyncMachinesServiceChannel(accessor.get(userDataSyncMachines_1.IUserDataSyncMachinesService));
            this.server.registerChannel('userDataSyncMachines', userDataSyncMachineChannel);
            // Custom Endpoint Telemetry
            const customEndpointTelemetryChannel = ipc_1.ProxyChannel.fromService(accessor.get(telemetry_1.ICustomEndpointTelemetryService));
            this.server.registerChannel('customEndpointTelemetry', customEndpointTelemetryChannel);
            const userDataSyncAccountChannel = new userDataSyncIpc_1.UserDataSyncAccountServiceChannel(accessor.get(userDataSyncAccount_1.IUserDataSyncAccountService));
            this.server.registerChannel('userDataSyncAccount', userDataSyncAccountChannel);
            const userDataSyncStoreManagementChannel = new userDataSyncIpc_1.UserDataSyncStoreManagementServiceChannel(accessor.get(userDataSync_1.IUserDataSyncStoreManagementService));
            this.server.registerChannel('userDataSyncStoreManagement', userDataSyncStoreManagementChannel);
            const userDataSyncChannel = new userDataSyncServiceIpc_1.UserDataSyncChannel(accessor.get(userDataSync_1.IUserDataSyncService), accessor.get(log_1.ILogService));
            this.server.registerChannel('userDataSync', userDataSyncChannel);
            const userDataAutoSync = this._register(accessor.get(instantiation_1.IInstantiationService).createInstance(userDataAutoSyncService_1.UserDataAutoSyncService));
            const userDataAutoSyncChannel = new userDataSyncIpc_1.UserDataAutoSyncChannel(userDataAutoSync);
            this.server.registerChannel('userDataAutoSync', userDataAutoSyncChannel);
            // Terminal
            const localPtyService = accessor.get(terminal_2.ILocalPtyService);
            const localPtyChannel = ipc_1.ProxyChannel.fromService(localPtyService);
            this.server.registerChannel(terminal_1.TerminalIpcChannels.LocalPty, localPtyChannel);
        }
        registerErrorHandler(logService) {
            // Listen on unhandled rejection events
            window.addEventListener('unhandledrejection', (event) => {
                // See https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
                (0, errors_1.onUnexpectedError)(event.reason);
                // Prevent the printing of this event to the console
                event.preventDefault();
            });
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => {
                const message = (0, errorMessage_1.toErrorMessage)(error, true);
                if (!message) {
                    return;
                }
                logService.error(`[uncaught exception in sharedProcess]: ${message}`);
            });
        }
    }
    async function main(configuration) {
        // create shared process and signal back to main that we are
        // ready to accept message ports as client connections
        const sharedProcess = new SharedProcessMain(configuration);
        electron_1.ipcRenderer.send('vscode:shared-process->electron-main=ipc-ready');
        // await initialization and signal this back to electron-main
        await sharedProcess.open();
        electron_1.ipcRenderer.send('vscode:shared-process->electron-main=init-done');
    }
    exports.main = main;
});
//# sourceMappingURL=sharedProcessMain.js.map