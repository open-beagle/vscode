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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/userDataSyncResourceEnablementService", "vs/workbench/services/environment/common/environmentService"], function (require, exports, extensions_1, storage_1, telemetry_1, userDataSync_1, userDataSyncResourceEnablementService_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncResourceEnablementService = void 0;
    let UserDataSyncResourceEnablementService = class UserDataSyncResourceEnablementService extends userDataSyncResourceEnablementService_1.UserDataSyncResourceEnablementService {
        constructor(environmentService, storageService, telemetryService) {
            super(storageService, telemetryService);
            this.environmentService = environmentService;
        }
        getResourceSyncStateVersion(resource) {
            var _a, _b;
            return resource === "extensions" /* Extensions */ ? (_b = (_a = this.environmentService.options) === null || _a === void 0 ? void 0 : _a.settingsSyncOptions) === null || _b === void 0 ? void 0 : _b.extensionsSyncStateVersion : undefined;
        }
    };
    UserDataSyncResourceEnablementService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, storage_1.IStorageService),
        __param(2, telemetry_1.ITelemetryService)
    ], UserDataSyncResourceEnablementService);
    exports.UserDataSyncResourceEnablementService = UserDataSyncResourceEnablementService;
    (0, extensions_1.registerSingleton)(userDataSync_1.IUserDataSyncResourceEnablementService, UserDataSyncResourceEnablementService);
});
//# sourceMappingURL=userDataSyncResourceEnablementService.js.map