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
define(["require", "exports", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/services/lifecycle/common/lifecycleService", "vs/nls!vs/workbench/services/lifecycle/browser/lifecycleService", "vs/platform/instantiation/common/extensions", "vs/base/browser/dom"], function (require, exports, lifecycle_1, log_1, lifecycleService_1, nls_1, extensions_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserLifecycleService = void 0;
    let BrowserLifecycleService = class BrowserLifecycleService extends lifecycleService_1.AbstractLifecycleService {
        constructor(logService) {
            super(logService);
            this.beforeUnloadDisposable = undefined;
            this.expectedUnload = false;
            this.registerListeners();
        }
        registerListeners() {
            // beforeUnload
            this.beforeUnloadDisposable = (0, dom_1.addDisposableListener)(window, 'beforeunload', (e) => this.onBeforeUnload(e));
        }
        onBeforeUnload(event) {
            if (this.expectedUnload) {
                this.logService.info('[lifecycle] onBeforeUnload expected, ignoring once');
                this.expectedUnload = false;
                return; // ignore expected unload only once
            }
            this.logService.info('[lifecycle] onBeforeUnload triggered');
            this.doShutdown(() => {
                // Veto handling
                event.preventDefault();
                event.returnValue = (0, nls_1.localize)(0, null);
            });
        }
        withExpectedUnload(callback) {
            this.expectedUnload = true;
            try {
                callback();
            }
            finally {
                this.expectedUnload = false;
            }
        }
        shutdown() {
            var _a;
            this.logService.info('[lifecycle] shutdown triggered');
            // Remove `beforeunload` listener that would prevent shutdown
            (_a = this.beforeUnloadDisposable) === null || _a === void 0 ? void 0 : _a.dispose();
            // Handle shutdown without veto support
            this.doShutdown();
        }
        doShutdown(handleVeto) {
            const logService = this.logService;
            let veto = false;
            // Before Shutdown
            this._onBeforeShutdown.fire({
                veto(value, id) {
                    if (typeof handleVeto === 'function') {
                        if (value instanceof Promise) {
                            logService.error(`[lifecycle] Long running operations before shutdown are unsupported in the web (id: ${id})`);
                            value = true; // implicitly vetos since we cannot handle promises in web
                        }
                        if (value === true) {
                            logService.info(`[lifecycle]: Unload was prevented (id: ${id})`);
                            veto = true;
                        }
                    }
                },
                reason: 2 /* QUIT */
            });
            // Veto: handle if provided
            if (veto && typeof handleVeto === 'function') {
                handleVeto();
                return;
            }
            // No Veto: continue with willShutdown
            this._onWillShutdown.fire({
                join(promise, id) {
                    logService.error(`[lifecycle] Long running operations during shutdown are unsupported in the web (id: ${id})`);
                },
                reason: 2 /* QUIT */
            });
            // Finally end with didShutdown
            this._onDidShutdown.fire();
        }
    };
    BrowserLifecycleService = __decorate([
        __param(0, log_1.ILogService)
    ], BrowserLifecycleService);
    exports.BrowserLifecycleService = BrowserLifecycleService;
    (0, extensions_1.registerSingleton)(lifecycle_1.ILifecycleService, BrowserLifecycleService);
});
//# sourceMappingURL=lifecycleService.js.map