/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/colorRegistry", "vs/nls!vs/workbench/contrib/welcome/page/browser/welcomePageColors"], function (require, exports, colorRegistry_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.welcomePageProgressForeground = exports.welcomePageProgressBackground = exports.welcomePageTileShadow = exports.welcomePageTileHoverBackground = exports.welcomePageTileBackground = exports.welcomePageBackground = exports.welcomeButtonHoverBackground = exports.welcomeButtonBackground = void 0;
    // Seprate from main module to break dependency cycles between welcomePage and gettingStarted.
    exports.welcomeButtonBackground = (0, colorRegistry_1.registerColor)('welcomePage.buttonBackground', { dark: null, light: null, hc: null }, (0, nls_1.localize)(0, null));
    exports.welcomeButtonHoverBackground = (0, colorRegistry_1.registerColor)('welcomePage.buttonHoverBackground', { dark: null, light: null, hc: null }, (0, nls_1.localize)(1, null));
    exports.welcomePageBackground = (0, colorRegistry_1.registerColor)('welcomePage.background', { light: null, dark: null, hc: null }, (0, nls_1.localize)(2, null));
    exports.welcomePageTileBackground = (0, colorRegistry_1.registerColor)('welcomePage.tileBackground', { dark: colorRegistry_1.editorWidgetBackground, light: colorRegistry_1.editorWidgetBackground, hc: '#000' }, (0, nls_1.localize)(3, null));
    exports.welcomePageTileHoverBackground = (0, colorRegistry_1.registerColor)('welcomePage.tileHoverBackground', { dark: (0, colorRegistry_1.lighten)(colorRegistry_1.editorWidgetBackground, .2), light: (0, colorRegistry_1.darken)(colorRegistry_1.editorWidgetBackground, .1), hc: null }, (0, nls_1.localize)(4, null));
    exports.welcomePageTileShadow = (0, colorRegistry_1.registerColor)('welcomePage.tileShadow.', { light: colorRegistry_1.widgetShadow, dark: colorRegistry_1.widgetShadow, hc: null }, (0, nls_1.localize)(5, null));
    exports.welcomePageProgressBackground = (0, colorRegistry_1.registerColor)('welcomePage.progress.background', { light: colorRegistry_1.inputBackground, dark: colorRegistry_1.inputBackground, hc: colorRegistry_1.inputBackground }, (0, nls_1.localize)(6, null));
    exports.welcomePageProgressForeground = (0, colorRegistry_1.registerColor)('welcomePage.progress.foreground', { light: colorRegistry_1.textLinkForeground, dark: colorRegistry_1.textLinkForeground, hc: colorRegistry_1.textLinkForeground }, (0, nls_1.localize)(7, null));
});
//# sourceMappingURL=welcomePageColors.js.map