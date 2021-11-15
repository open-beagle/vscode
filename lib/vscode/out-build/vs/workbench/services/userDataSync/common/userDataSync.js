/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey", "vs/nls!vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, instantiation_1, contextkey_1, nls_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SYNC_MERGES_VIEW_ID = exports.SYNC_VIEW_CONTAINER_ID = exports.SHOW_SYNC_LOG_COMMAND_ID = exports.CONFIGURE_SYNC_COMMAND_ID = exports.CONTEXT_ENABLE_SYNC_MERGES_VIEW = exports.CONTEXT_ENABLE_ACTIVITY_VIEWS = exports.CONTEXT_ACCOUNT_STATE = exports.CONTEXT_SYNC_ENABLEMENT = exports.CONTEXT_SYNC_STATE = exports.SYNC_VIEW_ICON = exports.SYNC_TITLE = exports.AccountStatus = exports.getSyncAreaLabel = exports.IUserDataSyncWorkbenchService = void 0;
    exports.IUserDataSyncWorkbenchService = (0, instantiation_1.createDecorator)('IUserDataSyncWorkbenchService');
    function getSyncAreaLabel(source) {
        switch (source) {
            case "settings" /* Settings */: return (0, nls_1.localize)(0, null);
            case "keybindings" /* Keybindings */: return (0, nls_1.localize)(1, null);
            case "snippets" /* Snippets */: return (0, nls_1.localize)(2, null);
            case "extensions" /* Extensions */: return (0, nls_1.localize)(3, null);
            case "globalState" /* GlobalState */: return (0, nls_1.localize)(4, null);
        }
    }
    exports.getSyncAreaLabel = getSyncAreaLabel;
    var AccountStatus;
    (function (AccountStatus) {
        AccountStatus["Uninitialized"] = "uninitialized";
        AccountStatus["Unavailable"] = "unavailable";
        AccountStatus["Available"] = "available";
    })(AccountStatus = exports.AccountStatus || (exports.AccountStatus = {}));
    exports.SYNC_TITLE = (0, nls_1.localize)(5, null);
    exports.SYNC_VIEW_ICON = (0, iconRegistry_1.registerIcon)('settings-sync-view-icon', codicons_1.Codicon.sync, (0, nls_1.localize)(6, null));
    // Contexts
    exports.CONTEXT_SYNC_STATE = new contextkey_1.RawContextKey('syncStatus', "uninitialized" /* Uninitialized */);
    exports.CONTEXT_SYNC_ENABLEMENT = new contextkey_1.RawContextKey('syncEnabled', false);
    exports.CONTEXT_ACCOUNT_STATE = new contextkey_1.RawContextKey('userDataSyncAccountStatus', "uninitialized" /* Uninitialized */);
    exports.CONTEXT_ENABLE_ACTIVITY_VIEWS = new contextkey_1.RawContextKey(`enableSyncActivityViews`, false);
    exports.CONTEXT_ENABLE_SYNC_MERGES_VIEW = new contextkey_1.RawContextKey(`enableSyncMergesView`, false);
    // Commands
    exports.CONFIGURE_SYNC_COMMAND_ID = 'workbench.userDataSync.actions.configure';
    exports.SHOW_SYNC_LOG_COMMAND_ID = 'workbench.userDataSync.actions.showLog';
    // VIEWS
    exports.SYNC_VIEW_CONTAINER_ID = 'workbench.view.sync';
    exports.SYNC_MERGES_VIEW_ID = 'workbench.views.sync.merges';
});
//# sourceMappingURL=userDataSync.js.map