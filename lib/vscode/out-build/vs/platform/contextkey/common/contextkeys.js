/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/contextkey/common/contextkeys", "vs/platform/contextkey/common/contextkey", "vs/base/common/platform"], function (require, exports, nls_1, contextkey_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputFocusedContext = exports.InputFocusedContextKey = exports.IsDevelopmentContext = exports.IsMacNativeContext = exports.IsWebContext = exports.IsWindowsContext = exports.IsLinuxContext = exports.IsMacContext = void 0;
    exports.IsMacContext = new contextkey_1.RawContextKey('isMac', platform_1.isMacintosh, (0, nls_1.localize)(0, null));
    exports.IsLinuxContext = new contextkey_1.RawContextKey('isLinux', platform_1.isLinux, (0, nls_1.localize)(1, null));
    exports.IsWindowsContext = new contextkey_1.RawContextKey('isWindows', platform_1.isWindows, (0, nls_1.localize)(2, null));
    exports.IsWebContext = new contextkey_1.RawContextKey('isWeb', platform_1.isWeb, (0, nls_1.localize)(3, null));
    exports.IsMacNativeContext = new contextkey_1.RawContextKey('isMacNative', platform_1.isMacintosh && !platform_1.isWeb, (0, nls_1.localize)(4, null));
    exports.IsDevelopmentContext = new contextkey_1.RawContextKey('isDevelopment', false, true);
    exports.InputFocusedContextKey = 'inputFocus';
    exports.InputFocusedContext = new contextkey_1.RawContextKey(exports.InputFocusedContextKey, false, (0, nls_1.localize)(5, null));
});
//# sourceMappingURL=contextkeys.js.map