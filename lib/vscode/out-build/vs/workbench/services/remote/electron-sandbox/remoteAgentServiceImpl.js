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
define(["require", "exports", "vs/nls!vs/workbench/services/remote/electron-sandbox/remoteAgentServiceImpl", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/platform/product/common/productService", "vs/platform/remote/browser/browserSocketFactory", "vs/workbench/services/remote/common/abstractRemoteAgentService", "vs/platform/sign/common/sign", "vs/platform/log/common/log", "vs/workbench/services/environment/common/environmentService", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/telemetry/common/telemetry", "vs/platform/remote/common/remoteHosts"], function (require, exports, nls, remoteAgentService_1, remoteAuthorityResolver_1, productService_1, browserSocketFactory_1, abstractRemoteAgentService_1, sign_1, log_1, environmentService_1, notification_1, platform_1, contributions_1, telemetry_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAgentService = void 0;
    let RemoteAgentService = class RemoteAgentService extends abstractRemoteAgentService_1.AbstractRemoteAgentService {
        constructor(environmentService, productService, remoteAuthorityResolverService, signService, logService) {
            super(new browserSocketFactory_1.BrowserSocketFactory(null), environmentService, productService, remoteAuthorityResolverService, signService, logService);
        }
    };
    RemoteAgentService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, productService_1.IProductService),
        __param(2, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(3, sign_1.ISignService),
        __param(4, log_1.ILogService)
    ], RemoteAgentService);
    exports.RemoteAgentService = RemoteAgentService;
    let RemoteConnectionFailureNotificationContribution = class RemoteConnectionFailureNotificationContribution {
        constructor(remoteAgentService, notificationService, environmentService, telemetryService) {
            // Let's cover the case where connecting to fetch the remote extension info fails
            remoteAgentService.getRawEnvironment()
                .then(undefined, err => {
                telemetryService.publicLog2('remoteConnectionFailure', {
                    web: false,
                    remoteName: (0, remoteHosts_1.getRemoteName)(environmentService.remoteAuthority),
                    message: err ? err.message : '',
                });
                if (!remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err)) {
                    notificationService.error(nls.localize(0, null, err ? err.message : ''));
                }
            });
        }
    };
    RemoteConnectionFailureNotificationContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, notification_1.INotificationService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, telemetry_1.ITelemetryService)
    ], RemoteConnectionFailureNotificationContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(RemoteConnectionFailureNotificationContribution, 2 /* Ready */);
});
//# sourceMappingURL=remoteAgentServiceImpl.js.map