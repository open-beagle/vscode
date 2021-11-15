/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/userDataSync/common/userDataAutoSyncService", "vs/platform/userDataSync/common/userDataSync"], function (require, exports, extensions_1, userDataAutoSyncService_1, userDataSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebUserDataAutoSyncEnablementService = void 0;
    class WebUserDataAutoSyncEnablementService extends userDataAutoSyncService_1.UserDataAutoSyncEnablementService {
        constructor() {
            super(...arguments);
            this.enabled = undefined;
        }
        get workbenchEnvironmentService() { return this.environmentService; }
        canToggleEnablement() {
            return this.isTrusted() && super.canToggleEnablement();
        }
        isEnabled() {
            var _a, _b, _c;
            if (!this.isTrusted()) {
                return false;
            }
            if (this.enabled === undefined) {
                this.enabled = (_b = (_a = this.workbenchEnvironmentService.options) === null || _a === void 0 ? void 0 : _a.settingsSyncOptions) === null || _b === void 0 ? void 0 : _b.enabled;
            }
            if (this.enabled === undefined) {
                this.enabled = super.isEnabled((_c = this.workbenchEnvironmentService.options) === null || _c === void 0 ? void 0 : _c.enableSyncByDefault);
            }
            return this.enabled;
        }
        setEnablement(enabled) {
            var _a, _b;
            if (enabled && !this.canToggleEnablement()) {
                return;
            }
            if (this.enabled !== enabled) {
                this.enabled = enabled;
                super.setEnablement(enabled);
                if ((_b = (_a = this.workbenchEnvironmentService.options) === null || _a === void 0 ? void 0 : _a.settingsSyncOptions) === null || _b === void 0 ? void 0 : _b.enablementHandler) {
                    this.workbenchEnvironmentService.options.settingsSyncOptions.enablementHandler(this.enabled);
                }
            }
        }
        isTrusted() {
            var _a, _b;
            return !!((_b = (_a = this.workbenchEnvironmentService.options) === null || _a === void 0 ? void 0 : _a.workspaceProvider) === null || _b === void 0 ? void 0 : _b.trusted);
        }
    }
    exports.WebUserDataAutoSyncEnablementService = WebUserDataAutoSyncEnablementService;
    (0, extensions_1.registerSingleton)(userDataSync_1.IUserDataAutoSyncEnablementService, WebUserDataAutoSyncEnablementService);
});
//# sourceMappingURL=userDataAutoSyncEnablementService.js.map