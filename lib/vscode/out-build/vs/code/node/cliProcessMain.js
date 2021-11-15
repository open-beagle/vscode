/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "fs", "graceful-fs", "vs/base/common/path", "vs/base/common/async", "vs/platform/product/common/product", "vs/platform/instantiation/common/serviceCollection", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/commonProperties", "vs/platform/request/common/request", "vs/platform/request/node/requestService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/telemetry/node/appInsightsAppender", "vs/platform/state/node/state", "vs/platform/state/node/stateService", "vs/platform/log/common/log", "vs/base/common/network", "vs/platform/log/node/spdlogLog", "vs/platform/telemetry/node/telemetry", "vs/platform/files/common/fileService", "vs/platform/files/common/files", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/lifecycle", "vs/platform/product/common/productService", "vs/platform/extensionManagement/common/extensionManagementCLIService", "vs/base/common/uri", "vs/platform/localizations/node/localizations", "vs/platform/localizations/common/localizations", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/buffer", "vs/base/common/process"], function (require, exports, os_1, fs, graceful_fs_1, path_1, async_1, product_1, serviceCollection_1, descriptors_1, instantiationService_1, environment_1, environmentService_1, extensionManagement_1, extensionManagementService_1, extensionGalleryService_1, telemetry_1, telemetryUtils_1, telemetryService_1, commonProperties_1, request_1, requestService_1, configuration_1, configurationService_1, appInsightsAppender_1, state_1, stateService_1, log_1, network_1, spdlogLog_1, telemetry_2, fileService_1, files_1, diskFileSystemProvider_1, lifecycle_1, productService_1, extensionManagementCLIService_1, uri_1, localizations_1, localizations_2, errors_1, errorMessage_1, buffer_1, process_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class CliMain extends lifecycle_1.Disposable {
        constructor(argv) {
            super();
            this.argv = argv;
            // Enable gracefulFs
            (0, graceful_fs_1.gracefulify)(fs);
            this.registerListeners();
        }
        registerListeners() {
            // Dispose on exit
            process.once('exit', () => this.dispose());
        }
        async run() {
            // Services
            const [instantiationService, appenders] = await this.initServices();
            return instantiationService.invokeFunction(async (accessor) => {
                const logService = accessor.get(log_1.ILogService);
                const fileService = accessor.get(files_1.IFileService);
                const environmentService = accessor.get(environment_1.INativeEnvironmentService);
                const extensionManagementCLIService = accessor.get(extensionManagement_1.IExtensionManagementCLIService);
                // Log info
                logService.info('CLI main', this.argv);
                // Error handler
                this.registerErrorHandler(logService);
                // Run based on argv
                await this.doRun(environmentService, extensionManagementCLIService, fileService);
                // Flush the remaining data in AI adapter (with 1s timeout)
                return (0, async_1.raceTimeout)((0, telemetryUtils_1.combinedAppender)(...appenders).flush(), 1000);
            });
        }
        async initServices() {
            const services = new serviceCollection_1.ServiceCollection();
            // Product
            const productService = Object.assign({ _serviceBrand: undefined }, product_1.default);
            services.set(productService_1.IProductService, productService);
            // Environment
            const environmentService = new environmentService_1.NativeEnvironmentService(this.argv, productService);
            services.set(environment_1.INativeEnvironmentService, environmentService);
            // Init folders
            await Promise.all([environmentService.appSettingsHome.fsPath, environmentService.extensionsPath].map(path => path ? fs.promises.mkdir(path, { recursive: true }) : undefined));
            // Log
            const logLevel = (0, log_1.getLogLevel)(environmentService);
            const loggers = [];
            loggers.push(new spdlogLog_1.SpdLogLogger('cli', (0, path_1.join)(environmentService.logsPath, 'cli.log'), true, logLevel));
            if (logLevel === log_1.LogLevel.Trace) {
                loggers.push(new log_1.ConsoleLogger(logLevel));
            }
            const logService = this._register(new log_1.MultiplexLogService(loggers));
            services.set(log_1.ILogService, logService);
            // Files
            const fileService = this._register(new fileService_1.FileService(logService));
            services.set(files_1.IFileService, fileService);
            const diskFileSystemProvider = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(logService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // Configuration
            const configurationService = this._register(new configurationService_1.ConfigurationService(environmentService.settingsResource, fileService));
            services.set(configuration_1.IConfigurationService, configurationService);
            // Init config
            await configurationService.initialize();
            // State
            const stateService = new stateService_1.StateService(environmentService, logService);
            services.set(state_1.IStateService, stateService);
            // Request
            services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestService_1.RequestService));
            // Extensions
            services.set(extensionManagement_1.IExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService));
            services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryService));
            services.set(extensionManagement_1.IExtensionManagementCLIService, new descriptors_1.SyncDescriptor(extensionManagementCLIService_1.ExtensionManagementCLIService));
            // Localizations
            services.set(localizations_2.ILocalizationsService, new descriptors_1.SyncDescriptor(localizations_1.LocalizationsService));
            // Telemetry
            const appenders = [];
            if (environmentService.isBuilt && !environmentService.isExtensionDevelopment && !environmentService.disableTelemetry && productService.enableTelemetry) {
                if (productService.aiConfig && productService.aiConfig.asimovKey) {
                    appenders.push(new appInsightsAppender_1.AppInsightsAppender('monacoworkbench', null, productService.aiConfig.asimovKey));
                }
                const { appRoot, extensionsPath, installSourcePath } = environmentService;
                const config = {
                    appender: (0, telemetryUtils_1.combinedAppender)(...appenders),
                    sendErrorTelemetry: false,
                    commonProperties: (0, commonProperties_1.resolveCommonProperties)(fileService, (0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version, stateService.getItem('telemetry.machineId'), productService.msftInternalDomains, installSourcePath),
                    piiPaths: [appRoot, extensionsPath]
                };
                services.set(telemetry_1.ITelemetryService, new descriptors_1.SyncDescriptor(telemetryService_1.TelemetryService, [config]));
            }
            else {
                services.set(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            }
            return [new instantiationService_1.InstantiationService(services), appenders];
        }
        registerErrorHandler(logService) {
            // Install handler for unexpected errors
            (0, errors_1.setUnexpectedErrorHandler)(error => {
                const message = (0, errorMessage_1.toErrorMessage)(error, true);
                if (!message) {
                    return;
                }
                logService.error(`[uncaught exception in CLI]: ${message}`);
            });
        }
        async doRun(environmentService, extensionManagementCLIService, fileService) {
            // Install Source
            if (this.argv['install-source']) {
                return this.setInstallSource(environmentService, fileService, this.argv['install-source']);
            }
            // List Extensions
            if (this.argv['list-extensions']) {
                return extensionManagementCLIService.listExtensions(!!this.argv['show-versions'], this.argv['category']);
            }
            // Install Extension
            else if (this.argv['install-extension'] || this.argv['install-builtin-extension']) {
                return extensionManagementCLIService.installExtensions(this.asExtensionIdOrVSIX(this.argv['install-extension'] || []), this.argv['install-builtin-extension'] || [], !!this.argv['do-not-sync'], !!this.argv['force']);
            }
            // Uninstall Extension
            else if (this.argv['uninstall-extension']) {
                return extensionManagementCLIService.uninstallExtensions(this.asExtensionIdOrVSIX(this.argv['uninstall-extension']), !!this.argv['force']);
            }
            // Locate Extension
            else if (this.argv['locate-extension']) {
                return extensionManagementCLIService.locateExtension(this.argv['locate-extension']);
            }
            // Telemetry
            else if (this.argv['telemetry']) {
                console.log((0, telemetry_2.buildTelemetryMessage)(environmentService.appRoot, environmentService.extensionsPath));
            }
        }
        asExtensionIdOrVSIX(inputs) {
            return inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.file((0, path_1.isAbsolute)(input) ? input : (0, path_1.join)((0, process_1.cwd)(), input)) : input);
        }
        async setInstallSource(environmentService, fileService, installSource) {
            await fileService.writeFile(uri_1.URI.file(environmentService.installSourcePath), buffer_1.VSBuffer.fromString(installSource.slice(0, 30)));
        }
    }
    async function main(argv) {
        const cliMain = new CliMain(argv);
        try {
            await cliMain.run();
        }
        finally {
            cliMain.dispose();
        }
    }
    exports.main = main;
});
//# sourceMappingURL=cliProcessMain.js.map