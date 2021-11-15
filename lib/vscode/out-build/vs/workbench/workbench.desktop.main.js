/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/workbench.sandbox.main", "vs/workbench/electron-browser/desktop.main", "vs/workbench/services/search/electron-browser/searchService", "vs/workbench/services/extensions/electron-browser/extensionService", "vs/workbench/services/remote/electron-browser/tunnelServiceImpl", "vs/workbench/contrib/splash/electron-browser/partsSplash.contribution", "vs/workbench/contrib/webview/electron-browser/webview.contribution", "vs/workbench/contrib/extensions/electron-browser/extensions.contribution", "vs/workbench/contrib/terminal/electron-browser/terminal.contribution", "vs/workbench/contrib/externalTerminal/node/externalTerminal.contribution", "vs/workbench/contrib/cli/node/cli.contribution"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//
// NOTE: Please do NOT register services here. Use `registerSingleton()`
//       from `workbench.common.main.ts` if the service is shared between
//       desktop and web or `workbench.sandbox.main.ts` if the service
//       is desktop only.
//
//       The `node` & `electron-browser` layer is deprecated for workbench!
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//#endregion
//# sourceMappingURL=workbench.desktop.main.js.map