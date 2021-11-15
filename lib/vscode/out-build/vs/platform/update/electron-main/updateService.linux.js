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
define(["require", "exports", "vs/platform/product/common/productService", "vs/platform/configuration/common/configuration", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/update/common/update", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/log/common/log", "vs/platform/update/electron-main/abstractUpdateService", "vs/platform/request/common/request", "vs/base/common/cancellation", "vs/platform/native/electron-main/nativeHostMainService"], function (require, exports, productService_1, configuration_1, lifecycleMainService_1, update_1, telemetry_1, environmentMainService_1, log_1, abstractUpdateService_1, request_1, cancellation_1, nativeHostMainService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinuxUpdateService = void 0;
    let LinuxUpdateService = class LinuxUpdateService extends abstractUpdateService_1.AbstractUpdateService {
        constructor(lifecycleMainService, configurationService, telemetryService, environmentMainService, requestService, logService, nativeHostMainService, productService) {
            super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
            this.telemetryService = telemetryService;
            this.nativeHostMainService = nativeHostMainService;
        }
        buildUpdateFeedUrl(quality) {
            return (0, abstractUpdateService_1.createUpdateURL)(`linux-${process.arch}`, quality, this.productService);
        }
        doCheckForUpdates(context) {
            if (!this.url) {
                return;
            }
            this.setState(update_1.State.CheckingForUpdates(context));
            this.requestService.request({ url: this.url }, cancellation_1.CancellationToken.None)
                .then(request_1.asJson)
                .then(update => {
                if (!update || !update.url || !update.version || !update.productVersion) {
                    this.telemetryService.publicLog2('update:notAvailable', { explicit: !!context });
                    this.setState(update_1.State.Idle(1 /* Archive */));
                }
                else {
                    this.setState(update_1.State.AvailableForDownload(update));
                }
            })
                .then(undefined, err => {
                this.logService.error(err);
                this.telemetryService.publicLog2('update:notAvailable', { explicit: !!context });
                // only show message when explicitly checking for updates
                const message = !!context ? (err.message || err) : undefined;
                this.setState(update_1.State.Idle(1 /* Archive */, message));
            });
        }
        async doDownloadUpdate(state) {
            // Use the download URL if available as we don't currently detect the package type that was
            // installed and the website download page is more useful than the tarball generally.
            if (this.productService.downloadUrl && this.productService.downloadUrl.length > 0) {
                this.nativeHostMainService.openExternal(undefined, this.productService.downloadUrl);
            }
            else if (state.update.url) {
                this.nativeHostMainService.openExternal(undefined, state.update.url);
            }
            this.setState(update_1.State.Idle(1 /* Archive */));
        }
    };
    LinuxUpdateService = __decorate([
        __param(0, lifecycleMainService_1.ILifecycleMainService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, request_1.IRequestService),
        __param(5, log_1.ILogService),
        __param(6, nativeHostMainService_1.INativeHostMainService),
        __param(7, productService_1.IProductService)
    ], LinuxUpdateService);
    exports.LinuxUpdateService = LinuxUpdateService;
});
//# sourceMappingURL=updateService.linux.js.map