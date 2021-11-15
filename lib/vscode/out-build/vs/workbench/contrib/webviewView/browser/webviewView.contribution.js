/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/webviewView/browser/webviewViewService"], function (require, exports, extensions_1, webviewViewService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(webviewViewService_1.IWebviewViewService, webviewViewService_1.WebviewViewService, true);
});
//# sourceMappingURL=webviewView.contribution.js.map