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
define(["require", "exports", "vs/nls!vs/workbench/services/remote/browser/remoteAgentServiceImpl", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/remote/common/abstractRemoteAgentService", "vs/platform/product/common/productService", "vs/platform/remote/browser/browserSocketFactory", "vs/platform/sign/common/sign", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/services/host/browser/host", "vs/platform/telemetry/common/telemetry", "vs/platform/remote/common/remoteHosts"], function (require, exports, nls, environmentService_1, remoteAgentService_1, remoteAuthorityResolver_1, abstractRemoteAgentService_1, productService_1, browserSocketFactory_1, sign_1, log_1, notification_1, dialogs_1, platform_1, contributions_1, host_1, telemetry_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAgentService = void 0;
    let RemoteAgentService = class RemoteAgentService extends abstractRemoteAgentService_1.AbstractRemoteAgentService {
        constructor(webSocketFactory, environmentService, productService, remoteAuthorityResolverService, signService, logService) {
            super(new browserSocketFactory_1.BrowserSocketFactory(webSocketFactory), environmentService, productService, remoteAuthorityResolverService, signService, logService);
        }
    };
    RemoteAgentService = __decorate([
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, productService_1.IProductService),
        __param(3, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(4, sign_1.ISignService),
        __param(5, log_1.ILogService)
    ], RemoteAgentService);
    exports.RemoteAgentService = RemoteAgentService;
    let RemoteConnectionFailureNotificationContribution = class RemoteConnectionFailureNotificationContribution {
        constructor(remoteAgentService, _dialogService, _hostService, _environmentService, _telemetryService) {
            this._dialogService = _dialogService;
            this._hostService = _hostService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            // Let's cover the case where connecting to fetch the remote extension info fails
            remoteAgentService.getRawEnvironment()
                .then(undefined, (err) => {
                this._telemetryService.publicLog2('remoteConnectionFailure', {
                    web: true,
                    remoteName: (0, remoteHosts_1.getRemoteName)(this._environmentService.remoteAuthority),
                    message: err ? err.message : ''
                });
                if (!remoteAuthorityResolver_1.RemoteAuthorityResolverError.isHandled(err)) {
                    this._presentConnectionError(err);
                }
            });
        }
        async _presentConnectionError(err) {
            const res = await this._dialogService.show(notification_1.Severity.Error, nls.localize(0, null), [
                nls.localize(1, null)
            ], {
                detail: nls.localize(2, null, err ? err.message : '')
            });
            if (res.choice === 0) {
                this._hostService.reload();
            }
        }
    };
    RemoteConnectionFailureNotificationContribution = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService),
        __param(1, dialogs_1.IDialogService),
        __param(2, host_1.IHostService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, telemetry_1.ITelemetryService)
    ], RemoteConnectionFailureNotificationContribution);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(RemoteConnectionFailureNotificationContribution, 2 /* Ready */);
});
//# sourceMappingURL=remoteAgentServiceImpl.js.map