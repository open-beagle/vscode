/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/terminal/browser/terminalIcons", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.configureTerminalProfileIcon = exports.newTerminalIcon = exports.killTerminalIcon = exports.renameTerminalIcon = exports.terminalViewIcon = void 0;
    exports.terminalViewIcon = (0, iconRegistry_1.registerIcon)('terminal-view-icon', codicons_1.Codicon.terminal, (0, nls_1.localize)(0, null));
    exports.renameTerminalIcon = (0, iconRegistry_1.registerIcon)('terminal-rename', codicons_1.Codicon.gear, (0, nls_1.localize)(1, null));
    exports.killTerminalIcon = (0, iconRegistry_1.registerIcon)('terminal-kill', codicons_1.Codicon.trash, (0, nls_1.localize)(2, null));
    exports.newTerminalIcon = (0, iconRegistry_1.registerIcon)('terminal-new', codicons_1.Codicon.add, (0, nls_1.localize)(3, null));
    exports.configureTerminalProfileIcon = (0, iconRegistry_1.registerIcon)('terminal-configure-profile', codicons_1.Codicon.gear, (0, nls_1.localize)(4, null));
});
//# sourceMappingURL=terminalIcons.js.map