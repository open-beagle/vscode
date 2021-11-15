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
define(["require", "exports", "vs/base/common/event", "vs/workbench/services/environment/common/environmentService", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/remote/common/remoteAgentConnection", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/extensions/common/extensionHostProtocol", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/platform/remote/common/remoteAuthorityResolver", "vs/base/common/platform", "vs/base/common/network", "vs/base/common/lifecycle", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/extensions/common/extensions", "vs/base/common/buffer", "vs/platform/debug/common/extensionHostDebug", "vs/platform/product/common/productService", "vs/platform/sign/common/sign", "vs/base/common/resources", "vs/platform/registry/common/platform", "vs/workbench/services/output/common/output", "vs/nls!vs/workbench/services/extensions/common/remoteExtensionHost"], function (require, exports, event_1, environmentService_1, label_1, log_1, remoteAgentConnection_1, telemetry_1, workspace_1, extHost_protocol_1, extensionHostProtocol_1, extensions_1, extensionDevOptions_1, remoteAuthorityResolver_1, platform, network_1, lifecycle_1, lifecycle_2, extensions_2, buffer_1, extensionHostDebug_1, productService_1, sign_1, resources_1, platform_1, output_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteExtensionHost = void 0;
    let RemoteExtensionHost = class RemoteExtensionHost extends lifecycle_1.Disposable {
        constructor(_initDataProvider, _socketFactory, _contextService, _environmentService, _telemetryService, _lifecycleService, _logService, _labelService, remoteAuthorityResolverService, _extensionHostDebugService, _productService, _signService) {
            super();
            this._initDataProvider = _initDataProvider;
            this._socketFactory = _socketFactory;
            this._contextService = _contextService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            this._lifecycleService = _lifecycleService;
            this._logService = _logService;
            this._labelService = _labelService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this._extensionHostDebugService = _extensionHostDebugService;
            this._productService = _productService;
            this._signService = _signService;
            this.kind = 2 /* Remote */;
            this._onExit = this._register(new event_1.Emitter());
            this.onExit = this._onExit.event;
            this.remoteAuthority = this._initDataProvider.remoteAuthority;
            this._protocol = null;
            this._hasLostConnection = false;
            this._terminating = false;
            this._register(this._lifecycleService.onDidShutdown(() => this.dispose()));
            const devOpts = (0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService);
            this._isExtensionDevHost = devOpts.isExtensionDevHost;
        }
        start() {
            const options = {
                commit: this._productService.commit,
                socketFactory: this._socketFactory,
                addressProvider: {
                    getAddress: async () => {
                        const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority);
                        return { host: authority.host, port: authority.port, connectionToken: authority.connectionToken };
                    }
                },
                signService: this._signService,
                logService: this._logService,
                ipcLogger: null
            };
            return this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority).then((resolverResult) => {
                const startParams = {
                    language: platform.language,
                    debugId: this._environmentService.debugExtensionHost.debugId,
                    break: this._environmentService.debugExtensionHost.break,
                    port: this._environmentService.debugExtensionHost.port,
                    env: resolverResult.options && resolverResult.options.extensionHostEnv
                };
                const extDevLocs = this._environmentService.extensionDevelopmentLocationURI;
                let debugOk = true;
                if (extDevLocs && extDevLocs.length > 0) {
                    // TODO@AW: handles only first path in array
                    if (extDevLocs[0].scheme === network_1.Schemas.file) {
                        debugOk = false;
                    }
                }
                if (!debugOk) {
                    startParams.break = false;
                }
                return (0, remoteAgentConnection_1.connectRemoteAgentExtensionHost)(options, startParams).then(result => {
                    let { protocol, debugPort } = result;
                    const isExtensionDevelopmentDebug = typeof debugPort === 'number';
                    if (debugOk && this._environmentService.isExtensionDevelopment && this._environmentService.debugExtensionHost.debugId && debugPort) {
                        this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, debugPort, this._initDataProvider.remoteAuthority);
                    }
                    protocol.onDidDispose(() => {
                        this._onExtHostConnectionLost();
                    });
                    protocol.onSocketClose(() => {
                        if (this._isExtensionDevHost) {
                            this._onExtHostConnectionLost();
                        }
                    });
                    // 1) wait for the incoming `ready` event and send the initialization data.
                    // 2) wait for the incoming `initialized` event.
                    return new Promise((resolve, reject) => {
                        let handle = setTimeout(() => {
                            reject('timeout');
                        }, 60 * 1000);
                        let logFile;
                        const disposable = protocol.onMessage(msg => {
                            if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 1 /* Ready */)) {
                                // 1) Extension Host is ready to receive messages, initialize it
                                this._createExtHostInitData(isExtensionDevelopmentDebug).then(data => {
                                    logFile = data.logFile;
                                    protocol.send(buffer_1.VSBuffer.fromString(JSON.stringify(data)));
                                });
                                return;
                            }
                            if ((0, extensionHostProtocol_1.isMessageOfType)(msg, 0 /* Initialized */)) {
                                // 2) Extension Host is initialized
                                clearTimeout(handle);
                                // stop listening for messages here
                                disposable.dispose();
                                // Register log channel for remote exthost log
                                platform_1.Registry.as(output_1.Extensions.OutputChannels).registerChannel({ id: 'remoteExtHostLog', label: (0, nls_1.localize)(0, null), file: logFile, log: true });
                                // release this promise
                                this._protocol = protocol;
                                resolve(protocol);
                                return;
                            }
                            console.error(`received unexpected message during handshake phase from the extension host: `, msg);
                        });
                    });
                });
            });
        }
        _onExtHostConnectionLost() {
            if (this._hasLostConnection) {
                // avoid re-entering this method
                return;
            }
            this._hasLostConnection = true;
            if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId) {
                this._extensionHostDebugService.close(this._environmentService.debugExtensionHost.debugId);
            }
            if (this._terminating) {
                // Expected termination path (we asked the process to terminate)
                return;
            }
            this._onExit.fire([0, null]);
        }
        async _createExtHostInitData(isExtensionDevelopmentDebug) {
            const [telemetryInfo, remoteInitData] = await Promise.all([this._telemetryService.getTelemetryInfo(), this._initDataProvider.getInitData()]);
            // Collect all identifiers for extension ids which can be considered "resolved"
            const remoteExtensions = new Set();
            remoteInitData.extensions.forEach((extension) => remoteExtensions.add(extensions_2.ExtensionIdentifier.toKey(extension.identifier.value)));
            const resolvedExtensions = remoteInitData.allExtensions.filter(extension => !extension.main && !extension.browser).map(extension => extension.identifier);
            const hostExtensions = (remoteInitData.allExtensions
                .filter(extension => !remoteExtensions.has(extensions_2.ExtensionIdentifier.toKey(extension.identifier.value)))
                .filter(extension => (extension.main || extension.browser) && extension.api === 'none').map(extension => extension.identifier));
            const workspace = this._contextService.getWorkspace();
            return {
                commit: this._productService.commit,
                version: this._productService.version,
                parentPid: remoteInitData.pid,
                environment: {
                    isExtensionDevelopmentDebug,
                    appRoot: remoteInitData.appRoot,
                    appName: this._productService.nameLong,
                    appUriScheme: this._productService.urlProtocol,
                    appLanguage: platform.language,
                    extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                    extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                    globalStorageHome: remoteInitData.globalStorageHome,
                    workspaceStorageHome: remoteInitData.workspaceStorageHome,
                    webviewResourceRoot: this._environmentService.webviewResourceRoot,
                    webviewCspSource: this._environmentService.webviewCspSource,
                },
                workspace: this._contextService.getWorkbenchState() === 1 /* EMPTY */ ? null : {
                    configuration: workspace.configuration,
                    id: workspace.id,
                    name: this._labelService.getWorkspaceLabel(workspace)
                },
                remote: {
                    isRemote: true,
                    authority: this._initDataProvider.remoteAuthority,
                    connectionData: remoteInitData.connectionData
                },
                resolvedExtensions: resolvedExtensions,
                hostExtensions: hostExtensions,
                extensions: remoteInitData.extensions,
                telemetryInfo,
                logLevel: this._logService.getLevel(),
                logsLocation: remoteInitData.extensionHostLogsPath,
                logFile: (0, resources_1.joinPath)(remoteInitData.extensionHostLogsPath, `${extensions_1.ExtensionHostLogFileName}.log`),
                autoStart: true,
                uiKind: platform.isWeb ? extHost_protocol_1.UIKind.Web : extHost_protocol_1.UIKind.Desktop
            };
        }
        getInspectPort() {
            return undefined;
        }
        enableInspectPort() {
            return Promise.resolve(false);
        }
        dispose() {
            super.dispose();
            this._terminating = true;
            if (this._protocol) {
                // Send the extension host a request to terminate itself
                // (graceful termination)
                const socket = this._protocol.getSocket();
                this._protocol.send((0, extensionHostProtocol_1.createMessageOfType)(2 /* Terminate */));
                this._protocol.sendDisconnect();
                this._protocol.dispose();
                socket.end();
                this._protocol = null;
            }
        }
    };
    RemoteExtensionHost = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, lifecycle_2.ILifecycleService),
        __param(6, log_1.ILogService),
        __param(7, label_1.ILabelService),
        __param(8, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(9, extensionHostDebug_1.IExtensionHostDebugService),
        __param(10, productService_1.IProductService),
        __param(11, sign_1.ISignService)
    ], RemoteExtensionHost);
    exports.RemoteExtensionHost = RemoteExtensionHost;
});
//# sourceMappingURL=remoteExtensionHost.js.map