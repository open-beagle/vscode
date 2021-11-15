/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/common/panel", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PanelMaximizedContext = exports.PanelVisibleContext = exports.PanelPositionContext = exports.PanelFocusContext = exports.ActivePanelContext = void 0;
    exports.ActivePanelContext = new contextkey_1.RawContextKey('activePanel', '', (0, nls_1.localize)(0, null));
    exports.PanelFocusContext = new contextkey_1.RawContextKey('panelFocus', false, (0, nls_1.localize)(1, null));
    exports.PanelPositionContext = new contextkey_1.RawContextKey('panelPosition', 'bottom', (0, nls_1.localize)(2, null));
    exports.PanelVisibleContext = new contextkey_1.RawContextKey('panelVisible', false, (0, nls_1.localize)(3, null));
    exports.PanelMaximizedContext = new contextkey_1.RawContextKey('panelMaximized', false, (0, nls_1.localize)(4, null));
});
//# sourceMappingURL=panel.js.map