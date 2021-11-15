/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/remoteIcons", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.forwardedPortWithProcessIcon = exports.forwardedPortWithoutProcessIcon = exports.labelPortIcon = exports.copyAddressIcon = exports.openPreviewIcon = exports.openBrowserIcon = exports.stopForwardIcon = exports.forwardPortIcon = exports.publicPortIcon = exports.privatePortIcon = exports.portIcon = exports.portsViewIcon = exports.remoteExplorerViewIcon = exports.reportIssuesIcon = exports.reviewIssuesIcon = exports.feedbackIcon = exports.documentationIcon = exports.getStartedIcon = void 0;
    exports.getStartedIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-get-started', codicons_1.Codicon.star, nls.localize(0, null));
    exports.documentationIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-documentation', codicons_1.Codicon.book, nls.localize(1, null));
    exports.feedbackIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-feedback', codicons_1.Codicon.twitter, nls.localize(2, null));
    exports.reviewIssuesIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-review-issues', codicons_1.Codicon.issues, nls.localize(3, null));
    exports.reportIssuesIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-report-issues', codicons_1.Codicon.comment, nls.localize(4, null));
    exports.remoteExplorerViewIcon = (0, iconRegistry_1.registerIcon)('remote-explorer-view-icon', codicons_1.Codicon.remoteExplorer, nls.localize(5, null));
    exports.portsViewIcon = (0, iconRegistry_1.registerIcon)('ports-view-icon', codicons_1.Codicon.plug, nls.localize(6, null));
    exports.portIcon = (0, iconRegistry_1.registerIcon)('ports-view-icon', codicons_1.Codicon.plug, nls.localize(7, null));
    exports.privatePortIcon = (0, iconRegistry_1.registerIcon)('private-ports-view-icon', codicons_1.Codicon.lock, nls.localize(8, null));
    exports.publicPortIcon = (0, iconRegistry_1.registerIcon)('public-ports-view-icon', codicons_1.Codicon.eye, nls.localize(9, null));
    exports.forwardPortIcon = (0, iconRegistry_1.registerIcon)('ports-forward-icon', codicons_1.Codicon.plus, nls.localize(10, null));
    exports.stopForwardIcon = (0, iconRegistry_1.registerIcon)('ports-stop-forward-icon', codicons_1.Codicon.x, nls.localize(11, null));
    exports.openBrowserIcon = (0, iconRegistry_1.registerIcon)('ports-open-browser-icon', codicons_1.Codicon.globe, nls.localize(12, null));
    exports.openPreviewIcon = (0, iconRegistry_1.registerIcon)('ports-open-preview-icon', codicons_1.Codicon.openPreview, nls.localize(13, null));
    exports.copyAddressIcon = (0, iconRegistry_1.registerIcon)('ports-copy-address-icon', codicons_1.Codicon.clippy, nls.localize(14, null));
    exports.labelPortIcon = (0, iconRegistry_1.registerIcon)('ports-label-icon', codicons_1.Codicon.tag, nls.localize(15, null));
    exports.forwardedPortWithoutProcessIcon = (0, iconRegistry_1.registerIcon)('ports-forwarded-without-process-icon', codicons_1.Codicon.circleOutline, nls.localize(16, null));
    exports.forwardedPortWithProcessIcon = (0, iconRegistry_1.registerIcon)('ports-forwarded-with-process-icon', codicons_1.Codicon.circleFilled, nls.localize(17, null));
});
//# sourceMappingURL=remoteIcons.js.map