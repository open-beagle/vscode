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
define(["require", "exports", "vs/platform/remote/common/tunnel", "vs/base/common/lifecycle", "vs/workbench/services/environment/common/environmentService", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/workbench/services/remote/common/remoteExplorerService", "vs/platform/log/common/log"], function (require, exports, tunnel_1, lifecycle_1, environmentService_1, opener_1, uri_1, remoteExplorerService_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TunnelFactoryContribution = void 0;
    let TunnelFactoryContribution = class TunnelFactoryContribution extends lifecycle_1.Disposable {
        constructor(tunnelService, environmentService, openerService, remoteExplorerService, logService) {
            var _a, _b, _c, _d, _e;
            super();
            const tunnelFactory = (_b = (_a = environmentService.options) === null || _a === void 0 ? void 0 : _a.tunnelProvider) === null || _b === void 0 ? void 0 : _b.tunnelFactory;
            if (tunnelFactory) {
                this._register(tunnelService.setTunnelProvider({
                    forwardPort: (tunnelOptions, tunnelCreationOptions) => {
                        let tunnelPromise;
                        try {
                            tunnelPromise = tunnelFactory(tunnelOptions, tunnelCreationOptions);
                        }
                        catch (e) {
                            logService.trace('tunnelFactory: tunnel provider error');
                        }
                        return new Promise(async (resolve) => {
                            if (!tunnelPromise) {
                                resolve(undefined);
                                return;
                            }
                            let tunnel;
                            try {
                                tunnel = await tunnelPromise;
                            }
                            catch (e) {
                                logService.trace('tunnelFactory: tunnel provider promise error');
                                resolve(undefined);
                                return;
                            }
                            const localAddress = tunnel.localAddress.startsWith('http') ? tunnel.localAddress : `http://${tunnel.localAddress}`;
                            const remoteTunnel = {
                                tunnelRemotePort: tunnel.remoteAddress.port,
                                tunnelRemoteHost: tunnel.remoteAddress.host,
                                // The tunnel factory may give us an inaccessible local address.
                                // To make sure this doesn't happen, resolve the uri immediately.
                                localAddress: (await openerService.resolveExternalUri(uri_1.URI.parse(localAddress))).resolved.toString(),
                                public: !!tunnel.public,
                                dispose: async () => { await tunnel.dispose(); }
                            };
                            resolve(remoteTunnel);
                        });
                    }
                }, (_e = (_d = (_c = environmentService.options) === null || _c === void 0 ? void 0 : _c.tunnelProvider) === null || _d === void 0 ? void 0 : _d.features) !== null && _e !== void 0 ? _e : { elevation: false, public: false }));
                remoteExplorerService.setTunnelInformation(undefined);
            }
        }
    };
    TunnelFactoryContribution = __decorate([
        __param(0, tunnel_1.ITunnelService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, opener_1.IOpenerService),
        __param(3, remoteExplorerService_1.IRemoteExplorerService),
        __param(4, log_1.ILogService)
    ], TunnelFactoryContribution);
    exports.TunnelFactoryContribution = TunnelFactoryContribution;
});
//# sourceMappingURL=tunnelFactory.js.map