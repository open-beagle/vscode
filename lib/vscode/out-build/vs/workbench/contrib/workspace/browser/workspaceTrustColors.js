/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/workspace/browser/workspaceTrustColors", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/welcome/page/browser/welcomePageColors"], function (require, exports, nls_1, colorRegistry_1, debugColors_1, welcomePageColors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.trustEditorTileBackgroundColor = exports.untrustedForegroundColor = exports.trustedForegroundColor = void 0;
    exports.trustedForegroundColor = (0, colorRegistry_1.registerColor)('workspaceTrust.trustedForegound', { dark: debugColors_1.debugIconStartForeground, light: debugColors_1.debugIconStartForeground, hc: debugColors_1.debugIconStartForeground }, (0, nls_1.localize)(0, null));
    exports.untrustedForegroundColor = (0, colorRegistry_1.registerColor)('workspaceTrust.untrustedForeground', { dark: colorRegistry_1.editorErrorForeground, light: colorRegistry_1.editorErrorForeground, hc: colorRegistry_1.editorErrorForeground }, (0, nls_1.localize)(1, null));
    exports.trustEditorTileBackgroundColor = (0, colorRegistry_1.registerColor)('workspaceTrust.tileBackground', { dark: welcomePageColors_1.welcomePageTileBackground, light: welcomePageColors_1.welcomePageTileBackground, hc: welcomePageColors_1.welcomePageTileBackground }, (0, nls_1.localize)(2, null));
});
//# sourceMappingURL=workspaceTrustColors.js.map