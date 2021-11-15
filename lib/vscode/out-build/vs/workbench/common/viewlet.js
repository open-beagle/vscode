/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/common/viewlet", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActiveViewletContext = exports.SidebarFocusContext = exports.SideBarVisibleContext = void 0;
    exports.SideBarVisibleContext = new contextkey_1.RawContextKey('sideBarVisible', false, (0, nls_1.localize)(0, null));
    exports.SidebarFocusContext = new contextkey_1.RawContextKey('sideBarFocus', false, (0, nls_1.localize)(1, null));
    exports.ActiveViewletContext = new contextkey_1.RawContextKey('activeViewlet', '', (0, nls_1.localize)(2, null));
});
//# sourceMappingURL=viewlet.js.map