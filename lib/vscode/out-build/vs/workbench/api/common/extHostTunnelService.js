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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/workbench/api/common/extHostRpcService"], function (require, exports, instantiation_1, event_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTunnelService = exports.IExtHostTunnelService = exports.TunnelDto = void 0;
    var TunnelDto;
    (function (TunnelDto) {
        function fromApiTunnel(tunnel) {
            return { remoteAddress: tunnel.remoteAddress, localAddress: tunnel.localAddress, public: !!tunnel.public };
        }
        TunnelDto.fromApiTunnel = fromApiTunnel;
        function fromServiceTunnel(tunnel) {
            return {
                remoteAddress: {
                    host: tunnel.tunnelRemoteHost,
                    port: tunnel.tunnelRemotePort
                },
                localAddress: tunnel.localAddress,
                public: tunnel.public
            };
        }
        TunnelDto.fromServiceTunnel = fromServiceTunnel;
    })(TunnelDto = exports.TunnelDto || (exports.TunnelDto = {}));
    exports.IExtHostTunnelService = (0, instantiation_1.createDecorator)('IExtHostTunnelService');
    let ExtHostTunnelService = class ExtHostTunnelService {
        constructor(extHostRpc) {
            this.onDidChangeTunnels = (new event_1.Emitter()).event;
        }
        async $applyCandidateFilter(candidates) {
            return candidates;
        }
        async openTunnel(extension, forward) {
            return undefined;
        }
        async getTunnels() {
            return [];
        }
        async setTunnelExtensionFunctions(provider) {
            return { dispose: () => { } };
        }
        registerPortsAttributesProvider(portSelector, provider) {
            return { dispose: () => { } };
        }
        async $providePortAttributes(handles, ports, pid, commandline, cancellationToken) {
            return [];
        }
        async $forwardPort(tunnelOptions, tunnelCreationOptions) { return undefined; }
        async $closeTunnel(remote) { }
        async $onDidTunnelsChange() { }
        async $registerCandidateFinder() { }
    };
    ExtHostTunnelService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostTunnelService);
    exports.ExtHostTunnelService = ExtHostTunnelService;
});
//# sourceMappingURL=extHostTunnelService.js.map