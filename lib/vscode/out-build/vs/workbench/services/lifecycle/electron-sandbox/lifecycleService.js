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
define(["require", "exports", "vs/nls!vs/workbench/services/lifecycle/electron-sandbox/lifecycleService", "vs/base/common/errorMessage", "vs/platform/lifecycle/common/lifecycle", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/base/common/errors", "vs/workbench/services/lifecycle/common/lifecycleService", "vs/platform/instantiation/common/extensions", "vs/base/common/severity", "vs/platform/native/electron-sandbox/native", "vs/base/common/async"], function (require, exports, nls_1, errorMessage_1, lifecycle_1, lifecycle_2, storage_1, globals_1, log_1, notification_1, errors_1, lifecycleService_1, extensions_1, severity_1, native_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeLifecycleService = void 0;
    let NativeLifecycleService = class NativeLifecycleService extends lifecycleService_1.AbstractLifecycleService {
        constructor(notificationService, nativeHostService, storageService, logService) {
            super(logService);
            this.notificationService = notificationService;
            this.nativeHostService = nativeHostService;
            this.storageService = storageService;
            this._startupKind = this.resolveStartupKind();
            this.registerListeners();
        }
        resolveStartupKind() {
            const lastShutdownReason = this.storageService.getNumber(NativeLifecycleService.LAST_SHUTDOWN_REASON_KEY, 1 /* WORKSPACE */);
            this.storageService.remove(NativeLifecycleService.LAST_SHUTDOWN_REASON_KEY, 1 /* WORKSPACE */);
            let startupKind;
            if (lastShutdownReason === 3 /* RELOAD */) {
                startupKind = 3 /* ReloadedWindow */;
            }
            else if (lastShutdownReason === 4 /* LOAD */) {
                startupKind = 4 /* ReopenedWindow */;
            }
            else {
                startupKind = 1 /* NewWindow */;
            }
            this.logService.trace(`[lifecycle] starting up (startup kind: ${this._startupKind})`);
            return startupKind;
        }
        registerListeners() {
            const windowId = this.nativeHostService.windowId;
            // Main side indicates that window is about to unload, check for vetos
            globals_1.ipcRenderer.on('vscode:onBeforeUnload', (event, reply) => {
                this.logService.trace(`[lifecycle] onBeforeUnload (reason: ${reply.reason})`);
                // trigger onBeforeShutdown events and veto collecting
                this.handleBeforeShutdown(reply.reason).then(veto => {
                    if (veto) {
                        this.logService.trace('[lifecycle] onBeforeUnload prevented via veto');
                        globals_1.ipcRenderer.send(reply.cancelChannel, windowId);
                    }
                    else {
                        this.logService.trace('[lifecycle] onBeforeUnload continues without veto');
                        this.shutdownReason = reply.reason;
                        globals_1.ipcRenderer.send(reply.okChannel, windowId);
                    }
                });
            });
            // Main side indicates that we will indeed shutdown
            globals_1.ipcRenderer.on('vscode:onWillUnload', async (event, reply) => {
                this.logService.trace(`[lifecycle] onWillUnload (reason: ${reply.reason})`);
                // trigger onWillShutdown events and joining
                await this.handleWillShutdown(reply.reason);
                // trigger onDidShutdown event now that we know we will quit
                this._onDidShutdown.fire();
                // acknowledge to main side
                globals_1.ipcRenderer.send(reply.replyChannel, windowId);
            });
            // Save shutdown reason to retrieve on next startup
            this.storageService.onWillSaveState(e => {
                if (e.reason === storage_1.WillSaveStateReason.SHUTDOWN) {
                    this.storageService.store(NativeLifecycleService.LAST_SHUTDOWN_REASON_KEY, this.shutdownReason, 1 /* WORKSPACE */, 1 /* MACHINE */);
                }
            });
        }
        async handleBeforeShutdown(reason) {
            const logService = this.logService;
            const vetos = [];
            const pendingVetos = new Set();
            this._onBeforeShutdown.fire({
                veto(value, id) {
                    vetos.push(value);
                    // Log any veto instantly
                    if (value === true) {
                        logService.info(`[lifecycle]: Shutdown was prevented (id: ${id})`);
                    }
                    // Track promise completion
                    else if (value instanceof Promise) {
                        pendingVetos.add(id);
                        value.then(veto => {
                            if (veto === true) {
                                logService.info(`[lifecycle]: Shutdown was prevented (id: ${id})`);
                            }
                        }).finally(() => pendingVetos.delete(id));
                    }
                },
                reason
            });
            const longRunningBeforeShutdownWarning = (0, async_1.disposableTimeout)(() => {
                logService.warn(`[lifecycle] onBeforeShutdown is taking a long time, pending operations: ${Array.from(pendingVetos).join(', ')}`);
            }, NativeLifecycleService.BEFORE_SHUTDOWN_WARNING_DELAY);
            try {
                return await (0, lifecycle_1.handleVetos)(vetos, error => this.onShutdownError(reason, error));
            }
            finally {
                longRunningBeforeShutdownWarning.dispose();
            }
        }
        async handleWillShutdown(reason) {
            const joiners = [];
            const pendingJoiners = new Set();
            this._onWillShutdown.fire({
                join(promise, id) {
                    joiners.push(promise);
                    // Track promise completion
                    pendingJoiners.add(id);
                    promise.finally(() => pendingJoiners.delete(id));
                },
                reason
            });
            const longRunningWillShutdownWarning = (0, async_1.disposableTimeout)(() => {
                this.logService.warn(`[lifecycle] onWillShutdown is taking a long time, pending operations: ${Array.from(pendingJoiners).join(', ')}`);
            }, NativeLifecycleService.WILL_SHUTDOWN_WARNING_DELAY);
            try {
                await async_1.Promises.settled(joiners);
            }
            catch (error) {
                this.onShutdownError(reason, error);
            }
            finally {
                longRunningWillShutdownWarning.dispose();
            }
        }
        onShutdownError(reason, error) {
            let message;
            switch (reason) {
                case 1 /* CLOSE */:
                    message = (0, nls_1.localize)(0, null, (0, errorMessage_1.toErrorMessage)(error));
                    break;
                case 2 /* QUIT */:
                    message = (0, nls_1.localize)(1, null, (0, errorMessage_1.toErrorMessage)(error));
                    break;
                case 3 /* RELOAD */:
                    message = (0, nls_1.localize)(2, null, (0, errorMessage_1.toErrorMessage)(error));
                    break;
                case 4 /* LOAD */:
                    message = (0, nls_1.localize)(3, null, (0, errorMessage_1.toErrorMessage)(error));
                    break;
            }
            this.notificationService.notify({
                severity: severity_1.default.Error,
                message,
                sticky: true
            });
            (0, errors_1.onUnexpectedError)(error);
        }
        shutdown() {
            this.nativeHostService.closeWindow();
        }
    };
    NativeLifecycleService.LAST_SHUTDOWN_REASON_KEY = 'lifecyle.lastShutdownReason';
    NativeLifecycleService.BEFORE_SHUTDOWN_WARNING_DELAY = 5000;
    NativeLifecycleService.WILL_SHUTDOWN_WARNING_DELAY = 5000;
    NativeLifecycleService = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, native_1.INativeHostService),
        __param(2, storage_1.IStorageService),
        __param(3, log_1.ILogService)
    ], NativeLifecycleService);
    exports.NativeLifecycleService = NativeLifecycleService;
    (0, extensions_1.registerSingleton)(lifecycle_2.ILifecycleService, NativeLifecycleService);
});
//# sourceMappingURL=lifecycleService.js.map