/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/platform/remote/common/tunnel", "vs/platform/webview/common/webviewManagerService", "vs/platform/webview/electron-main/webviewProtocolProvider", "vs/platform/windows/electron-main/windows"], function (require, exports, electron_1, lifecycle_1, tunnel_1, webviewManagerService_1, webviewProtocolProvider_1, windows_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewMainService = void 0;
    let WebviewMainService = class WebviewMainService extends lifecycle_1.Disposable {
        constructor(tunnelService, windowsMainService) {
            super();
            this.windowsMainService = windowsMainService;
            this._register(new webviewProtocolProvider_1.WebviewProtocolProvider());
            const sess = electron_1.session.fromPartition(webviewManagerService_1.webviewPartitionId);
            sess.setPermissionRequestHandler((_webContents, permission, callback) => {
                if (permission === 'clipboard-read') {
                    return callback(true);
                }
                return callback(false);
            });
            sess.setPermissionCheckHandler((_webContents, permission /* 'media' */) => {
                return permission === 'clipboard-read';
            });
        }
        async setIgnoreMenuShortcuts(id, enabled) {
            let contents;
            if (typeof id.windowId === 'number') {
                const { windowId } = id;
                const window = this.windowsMainService.getWindowById(windowId);
                if (!(window === null || window === void 0 ? void 0 : window.win)) {
                    throw new Error(`Invalid windowId: ${windowId}`);
                }
                contents = window.win.webContents;
            }
            else {
                const { webContentsId } = id;
                contents = electron_1.webContents.fromId(webContentsId);
                if (!contents) {
                    throw new Error(`Invalid webContentsId: ${webContentsId}`);
                }
            }
            if (!contents.isDestroyed()) {
                contents.setIgnoreMenuShortcuts(enabled);
            }
        }
    };
    WebviewMainService = __decorate([
        __param(0, tunnel_1.ITunnelService),
        __param(1, windows_1.IWindowsMainService)
    ], WebviewMainService);
    exports.WebviewMainService = WebviewMainService;
});
//# sourceMappingURL=webviewMainService.js.map