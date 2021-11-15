define(["require", "exports", "fs", "os", "path", "vs/base/common/event", "vs/base/common/network", "vs/base/common/uri", "vs/base/node/id", "vs/base/parts/ipc/common/ipc", "vs/code/electron-browser/sharedProcess/contrib/logsDataCleaner", "vs/code/node/cliProcessMain", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/debug/common/extensionHostDebugIpc", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/localizations/common/localizations", "vs/platform/localizations/node/localizations", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/log/node/loggerService", "vs/platform/log/node/spdlogLog", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/request/common/requestIpc", "vs/platform/request/node/requestService", "vs/platform/telemetry/browser/errorTelemetry", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryLogAppender", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/appInsightsAppender", "vs/server/common/telemetry", "vs/server/node/channel", "vs/server/node/connection", "vs/server/node/insights", "vs/server/node/logger", "vs/server/node/nls", "vs/server/node/protocol", "vs/server/node/util", "vs/workbench/contrib/terminal/common/remoteTerminalChannel", "vs/workbench/services/remote/common/remoteAgentFileSystemChannel", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/terminal/node/ptyHostService"], function (require, exports, fs_1, os_1, path, event_1, network_1, uri_1, id_1, ipc_1, logsDataCleaner_1, cliProcessMain_1, configuration_1, configurationService_1, extensionHostDebugIpc_1, environment_1, environmentService_1, extensionGalleryService_1, extensionManagement_1, extensionManagementIpc_1, extensionManagementService_1, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, localizations_1, localizations_2, log_1, logIpc_1, loggerService_1, spdlogLog_1, product_1, productService_1, request_1, requestIpc_1, requestService_1, errorTelemetry_1, commonProperties_1, telemetry_1, telemetryLogAppender_1, telemetryService_1, telemetryUtils_1, appInsightsAppender_1, telemetry_2, channel_1, connection_1, insights_1, logger_1, nls_1, protocol_1, util_1, remoteTerminalChannel_1, remoteAgentFileSystemChannel_1, remoteAgentService_1, ptyHostService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vscode = void 0;
    const commit = product_1.default.commit || 'development';
    class Vscode {
        constructor() {
            this._onDidClientConnect = new event_1.Emitter();
            this.onDidClientConnect = this._onDidClientConnect.event;
            this.ipc = new ipc_1.IPCServer(this.onDidClientConnect);
            this.maxExtraOfflineConnections = 0;
            this.connections = new Map();
            this.services = new serviceCollection_1.ServiceCollection();
        }
        async cli(args) {
            return (0, cliProcessMain_1.main)(args);
        }
        async initialize(options) {
            const transformer = (0, util_1.getUriTransformer)(options.remoteAuthority);
            if (!this.servicesPromise) {
                this.servicesPromise = this.initializeServices(options.args);
            }
            await this.servicesPromise;
            const environment = this.services.get(environment_1.IEnvironmentService);
            const startPath = options.startPath;
            const parseUrl = (url) => {
                // This might be a fully-specified URL or just a path.
                try {
                    return uri_1.URI.parse(url, true);
                }
                catch (error) {
                    return uri_1.URI.from({
                        scheme: network_1.Schemas.vscodeRemote,
                        authority: options.remoteAuthority,
                        path: url,
                    });
                }
            };
            return {
                workbenchWebConfiguration: {
                    workspaceUri: startPath && startPath.workspace ? parseUrl(startPath.url) : undefined,
                    folderUri: startPath && !startPath.workspace ? parseUrl(startPath.url) : undefined,
                    remoteAuthority: options.remoteAuthority,
                    logLevel: (0, log_1.getLogLevel)(environment),
                    workspaceProvider: {
                        payload: [
                            ['userDataPath', environment.userDataPath],
                            ['enableProposedApi', JSON.stringify(options.args['enable-proposed-api'] || [])]
                        ],
                    },
                },
                remoteUserDataUri: transformer.transformOutgoing(uri_1.URI.file(environment.userDataPath)),
                productConfiguration: product_1.default,
                nlsConfiguration: await (0, nls_1.getNlsConfiguration)(environment.args.locale || await (0, nls_1.getLocaleFromConfig)(environment.userDataPath), environment.userDataPath),
                commit,
            };
        }
        async handleWebSocket(socket, query, permessageDeflate) {
            if (!query.reconnectionToken) {
                throw new Error('Reconnection token is missing from query parameters');
            }
            const protocol = new protocol_1.Protocol(socket, {
                reconnectionToken: query.reconnectionToken,
                reconnection: query.reconnection === 'true',
                skipWebSocketFrames: query.skipWebSocketFrames === 'true',
                permessageDeflate,
            });
            try {
                await this.connect(await protocol.handshake(), protocol);
            }
            catch (error) {
                protocol.destroy(error.message);
            }
            return true;
        }
        async connect(message, protocol) {
            if (product_1.default.commit && message.commit !== product_1.default.commit) {
                logger_1.logger.warn(`Version mismatch (${message.commit} instead of ${product_1.default.commit})`);
            }
            switch (message.desiredConnectionType) {
                case 2 /* ExtensionHost */:
                case 1 /* Management */:
                    // Initialize connection map for this type of connection.
                    if (!this.connections.has(message.desiredConnectionType)) {
                        this.connections.set(message.desiredConnectionType, new Map());
                    }
                    const connections = this.connections.get(message.desiredConnectionType);
                    const token = protocol.options.reconnectionToken;
                    let connection = connections.get(token);
                    if (protocol.options.reconnection && connection) {
                        return connection.reconnect(protocol);
                    }
                    // This probably means the process restarted so the session was lost
                    // while the browser remained open.
                    if (protocol.options.reconnection) {
                        throw new Error(`Unable to reconnect; session no longer exists (${token})`);
                    }
                    // This will probably never happen outside a chance collision.
                    if (connection) {
                        throw new Error('Unable to connect; token is already in use');
                    }
                    // Now that the initial exchange has completed we can create the actual
                    // connection on top of the protocol then send it to whatever uses it.
                    if (message.desiredConnectionType === 1 /* Management */) {
                        // The management connection is used by firing onDidClientConnect
                        // which makes the IPC server become aware of the connection.
                        connection = new connection_1.ManagementConnection(protocol);
                        this._onDidClientConnect.fire({
                            protocol,
                            onDidClientDisconnect: connection.onClose,
                        });
                    }
                    else {
                        // The extension host connection is used by spawning an extension host
                        // and passing the socket into it.
                        connection = new connection_1.ExtensionHostConnection(protocol, Object.assign({ language: 'en' }, message.args), this.services.get(environment_1.IEnvironmentService));
                    }
                    connections.set(token, connection);
                    connection.onClose(() => connections.delete(token));
                    this.disposeOldOfflineConnections(connections);
                    logger_1.logger.debug(`${connections.size} active ${connection.name} connection(s)`);
                    break;
                case 3 /* Tunnel */:
                    return protocol.tunnel();
                default:
                    throw new Error(`Unrecognized connection type ${message.desiredConnectionType}`);
            }
        }
        disposeOldOfflineConnections(connections) {
            const offline = Array.from(connections.values())
                .filter((connection) => typeof connection.offline !== 'undefined');
            for (let i = 0, max = offline.length - this.maxExtraOfflineConnections; i < max; ++i) {
                offline[i].dispose('old');
            }
        }
        // References:
        // ../../electron-browser/sharedProcess/sharedProcessMain.ts#L148
        // ../../../code/electron-main/app.ts
        async initializeServices(args) {
            const productService = Object.assign({ _serviceBrand: undefined }, product_1.default);
            const environmentService = new environmentService_1.NativeEnvironmentService(args, productService);
            await Promise.all([
                environmentService.extensionsPath,
                environmentService.logsPath,
                environmentService.globalStorageHome.fsPath,
                environmentService.workspaceStorageHome.fsPath,
                ...environmentService.extraExtensionPaths,
                ...environmentService.extraBuiltinExtensionPaths,
            ].map((p) => fs_1.promises.mkdir(p, { recursive: true }).catch((error) => {
                logger_1.logger.warn(error.message || error);
            })));
            const logService = new log_1.MultiplexLogService([
                new log_1.ConsoleLogger((0, log_1.getLogLevel)(environmentService)),
                new spdlogLog_1.SpdLogLogger(remoteAgentService_1.RemoteExtensionLogFileName, path.join(environmentService.logsPath, `${remoteAgentService_1.RemoteExtensionLogFileName}.log`), false, (0, log_1.getLogLevel)(environmentService))
            ]);
            const fileService = new fileService_1.FileService(logService);
            fileService.registerProvider(network_1.Schemas.file, new diskFileSystemProvider_1.DiskFileSystemProvider(logService));
            const loggerService = new loggerService_1.LoggerService(logService, fileService);
            const piiPaths = [
                path.join(environmentService.userDataPath, 'clp'),
                environmentService.appRoot,
                environmentService.extensionsPath,
                environmentService.builtinExtensionsPath,
                ...environmentService.extraExtensionPaths,
                ...environmentService.extraBuiltinExtensionPaths,
            ];
            this.ipc.registerChannel('logger', new logIpc_1.LogLevelChannel(logService));
            this.ipc.registerChannel(extensionHostDebugIpc_1.ExtensionHostDebugBroadcastChannel.ChannelName, new extensionHostDebugIpc_1.ExtensionHostDebugBroadcastChannel());
            this.services.set(log_1.ILogService, logService);
            this.services.set(environment_1.IEnvironmentService, environmentService);
            this.services.set(environment_1.INativeEnvironmentService, environmentService);
            this.services.set(log_1.ILoggerService, loggerService);
            const configurationService = new configurationService_1.ConfigurationService(environmentService.settingsResource, fileService);
            await configurationService.initialize();
            this.services.set(configuration_1.IConfigurationService, configurationService);
            this.services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestService_1.RequestService));
            this.services.set(files_1.IFileService, fileService);
            this.services.set(productService_1.IProductService, productService);
            const machineId = await (0, id_1.getMachineId)();
            await new Promise((resolve) => {
                const instantiationService = new instantiationService_1.InstantiationService(this.services);
                instantiationService.invokeFunction((accessor) => {
                    instantiationService.createInstance(logsDataCleaner_1.LogsDataCleaner);
                    let telemetryService;
                    if (!environmentService.disableTelemetry) {
                        telemetryService = new telemetryService_1.TelemetryService({
                            appender: (0, telemetryUtils_1.combinedAppender)(new appInsightsAppender_1.AppInsightsAppender('code-server', null, () => new insights_1.TelemetryClient()), new telemetryLogAppender_1.TelemetryLogAppender(accessor.get(log_1.ILoggerService), environmentService)),
                            sendErrorTelemetry: true,
                            commonProperties: (0, commonProperties_1.resolveCommonProperties)(fileService, (0, os_1.release)(), (0, os_1.hostname)(), process.arch, commit, product_1.default.version, machineId, undefined, environmentService.installSourcePath, 'code-server'),
                            piiPaths,
                        }, configurationService);
                    }
                    else {
                        telemetryService = telemetryUtils_1.NullTelemetryService;
                    }
                    this.services.set(telemetry_1.ITelemetryService, telemetryService);
                    this.services.set(extensionManagement_1.IExtensionManagementService, new descriptors_1.SyncDescriptor(extensionManagementService_1.ExtensionManagementService));
                    this.services.set(extensionManagement_1.IExtensionGalleryService, new descriptors_1.SyncDescriptor(extensionGalleryService_1.ExtensionGalleryService));
                    this.services.set(localizations_1.ILocalizationsService, new descriptors_1.SyncDescriptor(localizations_2.LocalizationsService));
                    this.ipc.registerChannel('extensions', new extensionManagementIpc_1.ExtensionManagementChannel(accessor.get(extensionManagement_1.IExtensionManagementService), (context) => (0, util_1.getUriTransformer)(context.remoteAuthority)));
                    this.ipc.registerChannel('remoteextensionsenvironment', new channel_1.ExtensionEnvironmentChannel(environmentService, logService, telemetryService, ''));
                    this.ipc.registerChannel('request', new requestIpc_1.RequestChannel(accessor.get(request_1.IRequestService)));
                    this.ipc.registerChannel('telemetry', new telemetry_2.TelemetryChannel(telemetryService));
                    this.ipc.registerChannel('localizations', ipc_1.ProxyChannel.fromService(accessor.get(localizations_1.ILocalizationsService)));
                    this.ipc.registerChannel(remoteAgentFileSystemChannel_1.REMOTE_FILE_SYSTEM_CHANNEL_NAME, new channel_1.FileProviderChannel(environmentService, logService));
                    const ptyHostService = new ptyHostService_1.PtyHostService(logService, telemetryService);
                    this.ipc.registerChannel(remoteTerminalChannel_1.REMOTE_TERMINAL_CHANNEL_NAME, new channel_1.TerminalProviderChannel(logService, ptyHostService));
                    resolve(new errorTelemetry_1.default(telemetryService));
                });
            });
        }
    }
    exports.Vscode = Vscode;
});
//# sourceMappingURL=server.js.map