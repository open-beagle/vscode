/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/parts/ipc/common/ipc"], function (require, exports, dom_1, lifecycle_1, platform_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewIgnoreMenuShortcutsManager = void 0;
    class WebviewIgnoreMenuShortcutsManager {
        constructor(configurationService, mainProcessService) {
            this._webviews = new Set();
            this._isUsingNativeTitleBars = configurationService.getValue('window.titleBarStyle') === 'native';
            this.webviewMainService = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('webview'));
        }
        add(webview) {
            this._webviews.add(webview);
            const disposables = new lifecycle_1.DisposableStore();
            if (this.shouldToggleMenuShortcutsEnablement) {
                this.setIgnoreMenuShortcutsForWebview(webview, true);
            }
            disposables.add((0, dom_1.addDisposableListener)(webview, 'ipc-message', (event) => {
                switch (event.channel) {
                    case "did-focus" /* didFocus */:
                        this.setIgnoreMenuShortcuts(true);
                        break;
                    case "did-blur" /* didBlur */:
                        this.setIgnoreMenuShortcuts(false);
                        return;
                }
            }));
            return (0, lifecycle_1.toDisposable)(() => {
                disposables.dispose();
                this._webviews.delete(webview);
            });
        }
        get shouldToggleMenuShortcutsEnablement() {
            return platform_1.isMacintosh || this._isUsingNativeTitleBars;
        }
        setIgnoreMenuShortcuts(value) {
            for (const webview of this._webviews) {
                this.setIgnoreMenuShortcutsForWebview(webview, value);
            }
        }
        setIgnoreMenuShortcutsForWebview(webview, value) {
            if (this.shouldToggleMenuShortcutsEnablement) {
                this.webviewMainService.setIgnoreMenuShortcuts({ webContentsId: webview.getWebContentsId() }, value);
            }
        }
    }
    exports.WebviewIgnoreMenuShortcutsManager = WebviewIgnoreMenuShortcutsManager;
});
//# sourceMappingURL=webviewIgnoreMenuShortcutsManager.js.map