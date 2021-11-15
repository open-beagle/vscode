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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/path/common/pathService", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspace/common/workspace"], function (require, exports, extensions_1, remoteAgentService_1, pathService_1, uri_1, network_1, environmentService_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserPathService = void 0;
    let BrowserPathService = class BrowserPathService extends pathService_1.AbstractPathService {
        constructor(remoteAgentService, environmentService, contextService) {
            super(uri_1.URI.from({ scheme: defaultUriScheme(environmentService, contextService), authority: environmentService.remoteAuthority, path: '/' }), remoteAgentService);
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.defaultUriScheme = defaultUriScheme(this.environmentService, this.contextService);
        }
    };
    BrowserPathService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, workspace_1.IWorkspaceContextService)
    ], BrowserPathService);
    exports.BrowserPathService = BrowserPathService;
    function defaultUriScheme(environmentService, contextService) {
        if (environmentService.remoteAuthority) {
            return network_1.Schemas.vscodeRemote;
        }
        const firstFolder = contextService.getWorkspace().folders[0];
        if (firstFolder) {
            return firstFolder.uri.scheme;
        }
        const configuration = contextService.getWorkspace().configuration;
        if (configuration) {
            return configuration.scheme;
        }
        return network_1.Schemas.file;
    }
    (0, extensions_1.registerSingleton)(pathService_1.IPathService, BrowserPathService, true);
});
//# sourceMappingURL=pathService.js.map