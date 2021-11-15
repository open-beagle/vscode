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
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/platform/sign/common/sign", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/node/tunnelService", "vs/platform/remote/node/nodeSocketFactory", "vs/workbench/services/environment/common/environmentService", "vs/platform/instantiation/common/extensions", "vs/platform/remote/common/tunnel"], function (require, exports, log_1, productService_1, sign_1, remoteAgentService_1, tunnelService_1, nodeSocketFactory_1, environmentService_1, extensions_1, tunnel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TunnelService = void 0;
    let TunnelService = class TunnelService extends tunnelService_1.BaseTunnelService {
        constructor(logService, signService, productService, _remoteAgentService, environmentService) {
            super(nodeSocketFactory_1.nodeSocketFactory, logService, signService, productService);
            this.environmentService = environmentService;
        }
        canTunnel(uri) {
            return super.canTunnel(uri) && !!this.environmentService.remoteAuthority;
        }
    };
    TunnelService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, sign_1.ISignService),
        __param(2, productService_1.IProductService),
        __param(3, remoteAgentService_1.IRemoteAgentService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService)
    ], TunnelService);
    exports.TunnelService = TunnelService;
    (0, extensions_1.registerSingleton)(tunnel_1.ITunnelService, TunnelService);
});
//# sourceMappingURL=tunnelServiceImpl.js.map