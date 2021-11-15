/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.trustIcon = exports.infoIcon = exports.warningIcon = exports.starEmptyIcon = exports.starHalfIcon = exports.starFullIcon = exports.ratingIcon = exports.installCountIcon = exports.remoteIcon = exports.syncIgnoredIcon = exports.syncEnabledIcon = exports.configureRecommendedIcon = exports.installWorkspaceRecommendedIcon = exports.installLocalInRemoteIcon = exports.filterIcon = exports.refreshIcon = exports.clearSearchResultsIcon = exports.manageExtensionIcon = exports.extensionsViewIcon = void 0;
    exports.extensionsViewIcon = (0, iconRegistry_1.registerIcon)('extensions-view-icon', codicons_1.Codicon.extensions, (0, nls_1.localize)(0, null));
    exports.manageExtensionIcon = (0, iconRegistry_1.registerIcon)('extensions-manage', codicons_1.Codicon.gear, (0, nls_1.localize)(1, null));
    exports.clearSearchResultsIcon = (0, iconRegistry_1.registerIcon)('extensions-clear-search-results', codicons_1.Codicon.clearAll, (0, nls_1.localize)(2, null));
    exports.refreshIcon = (0, iconRegistry_1.registerIcon)('extensions-refresh', codicons_1.Codicon.refresh, (0, nls_1.localize)(3, null));
    exports.filterIcon = (0, iconRegistry_1.registerIcon)('extensions-filter', codicons_1.Codicon.filter, (0, nls_1.localize)(4, null));
    exports.installLocalInRemoteIcon = (0, iconRegistry_1.registerIcon)('extensions-install-local-in-remote', codicons_1.Codicon.cloudDownload, (0, nls_1.localize)(5, null));
    exports.installWorkspaceRecommendedIcon = (0, iconRegistry_1.registerIcon)('extensions-install-workspace-recommended', codicons_1.Codicon.cloudDownload, (0, nls_1.localize)(6, null));
    exports.configureRecommendedIcon = (0, iconRegistry_1.registerIcon)('extensions-configure-recommended', codicons_1.Codicon.pencil, (0, nls_1.localize)(7, null));
    exports.syncEnabledIcon = (0, iconRegistry_1.registerIcon)('extensions-sync-enabled', codicons_1.Codicon.sync, (0, nls_1.localize)(8, null));
    exports.syncIgnoredIcon = (0, iconRegistry_1.registerIcon)('extensions-sync-ignored', codicons_1.Codicon.syncIgnored, (0, nls_1.localize)(9, null));
    exports.remoteIcon = (0, iconRegistry_1.registerIcon)('extensions-remote', codicons_1.Codicon.remote, (0, nls_1.localize)(10, null));
    exports.installCountIcon = (0, iconRegistry_1.registerIcon)('extensions-install-count', codicons_1.Codicon.cloudDownload, (0, nls_1.localize)(11, null));
    exports.ratingIcon = (0, iconRegistry_1.registerIcon)('extensions-rating', codicons_1.Codicon.star, (0, nls_1.localize)(12, null));
    exports.starFullIcon = (0, iconRegistry_1.registerIcon)('extensions-star-full', codicons_1.Codicon.starFull, (0, nls_1.localize)(13, null));
    exports.starHalfIcon = (0, iconRegistry_1.registerIcon)('extensions-star-half', codicons_1.Codicon.starHalf, (0, nls_1.localize)(14, null));
    exports.starEmptyIcon = (0, iconRegistry_1.registerIcon)('extensions-star-empty', codicons_1.Codicon.starEmpty, (0, nls_1.localize)(15, null));
    exports.warningIcon = (0, iconRegistry_1.registerIcon)('extensions-warning-message', codicons_1.Codicon.warning, (0, nls_1.localize)(16, null));
    exports.infoIcon = (0, iconRegistry_1.registerIcon)('extensions-info-message', codicons_1.Codicon.info, (0, nls_1.localize)(17, null));
    exports.trustIcon = (0, iconRegistry_1.registerIcon)('extension-workspace-trust', codicons_1.Codicon.shield, (0, nls_1.localize)(18, null));
});
//# sourceMappingURL=extensionsIcons.js.map