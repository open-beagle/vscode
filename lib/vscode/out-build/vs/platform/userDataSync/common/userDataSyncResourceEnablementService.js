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
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/base/common/platform"], function (require, exports, userDataSync_1, lifecycle_1, event_1, storage_1, telemetry_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncResourceEnablementService = void 0;
    let UserDataSyncResourceEnablementService = class UserDataSyncResourceEnablementService extends lifecycle_1.Disposable {
        constructor(storageService, telemetryService) {
            super();
            this.storageService = storageService;
            this.telemetryService = telemetryService;
            this._onDidChangeResourceEnablement = new event_1.Emitter();
            this.onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
            this._register(storageService.onDidChangeValue(e => this.onDidStorageChange(e)));
        }
        isResourceEnabled(resource) {
            return this.storageService.getBoolean((0, userDataSync_1.getEnablementKey)(resource), 0 /* GLOBAL */, true);
        }
        setResourceEnablement(resource, enabled) {
            if (this.isResourceEnabled(resource) !== enabled) {
                const resourceEnablementKey = (0, userDataSync_1.getEnablementKey)(resource);
                this.telemetryService.publicLog2(resourceEnablementKey, { enabled });
                this.storeResourceEnablement(resourceEnablementKey, enabled);
            }
        }
        getResourceSyncStateVersion(resource) {
            return undefined;
        }
        storeResourceEnablement(resourceEnablementKey, enabled) {
            this.storageService.store(resourceEnablementKey, enabled, 0 /* GLOBAL */, platform_1.isWeb ? 0 /* USER */ : 1 /* MACHINE */);
        }
        onDidStorageChange(storageChangeEvent) {
            if (storageChangeEvent.scope === 0 /* GLOBAL */) {
                const resourceKey = userDataSync_1.ALL_SYNC_RESOURCES.filter(resourceKey => (0, userDataSync_1.getEnablementKey)(resourceKey) === storageChangeEvent.key)[0];
                if (resourceKey) {
                    this._onDidChangeResourceEnablement.fire([resourceKey, this.isResourceEnabled(resourceKey)]);
                    return;
                }
            }
        }
    };
    UserDataSyncResourceEnablementService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, telemetry_1.ITelemetryService)
    ], UserDataSyncResourceEnablementService);
    exports.UserDataSyncResourceEnablementService = UserDataSyncResourceEnablementService;
});
//# sourceMappingURL=userDataSyncResourceEnablementService.js.map