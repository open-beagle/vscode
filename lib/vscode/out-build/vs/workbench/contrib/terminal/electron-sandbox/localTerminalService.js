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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/terminal/electron-sandbox/localTerminalService", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/terminal/electron-sandbox/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/electron-sandbox/localPty", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService"], function (require, exports, event_1, lifecycle_1, nls_1, instantiation_1, label_1, log_1, notification_1, terminal_1, workspace_1, localPty_1, shellEnvironmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalTerminalService = void 0;
    let LocalTerminalService = class LocalTerminalService extends lifecycle_1.Disposable {
        constructor(_instantiationService, _workspaceContextService, _logService, _localPtyService, _labelService, notificationService, _shellEnvironmentService) {
            super();
            this._instantiationService = _instantiationService;
            this._workspaceContextService = _workspaceContextService;
            this._logService = _logService;
            this._localPtyService = _localPtyService;
            this._labelService = _labelService;
            this._shellEnvironmentService = _shellEnvironmentService;
            this._ptys = new Map();
            this._isPtyHostUnresponsive = false;
            this._onPtyHostUnresponsive = this._register(new event_1.Emitter());
            this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
            this._onPtyHostResponsive = this._register(new event_1.Emitter());
            this.onPtyHostResponsive = this._onPtyHostResponsive.event;
            this._onPtyHostRestart = this._register(new event_1.Emitter());
            this.onPtyHostRestart = this._onPtyHostRestart.event;
            // Attach process listeners
            this._localPtyService.onProcessData(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleData(e.event); });
            this._localPtyService.onProcessExit(e => {
                const pty = this._ptys.get(e.id);
                if (pty) {
                    pty.handleExit(e.event);
                    this._ptys.delete(e.id);
                }
            });
            this._localPtyService.onProcessReady(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleReady(e.event); });
            this._localPtyService.onProcessTitleChanged(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleTitleChanged(e.event); });
            this._localPtyService.onProcessOverrideDimensions(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleOverrideDimensions(e.event); });
            this._localPtyService.onProcessResolvedShellLaunchConfig(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleResolvedShellLaunchConfig(e.event); });
            this._localPtyService.onProcessReplay(e => { var _a; return (_a = this._ptys.get(e.id)) === null || _a === void 0 ? void 0 : _a.handleReplay(e.event); });
            // Attach pty host listeners
            if (this._localPtyService.onPtyHostExit) {
                this._register(this._localPtyService.onPtyHostExit(() => {
                    this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
                }));
            }
            let unresponsiveNotification;
            if (this._localPtyService.onPtyHostStart) {
                this._register(this._localPtyService.onPtyHostStart(() => {
                    this._logService.info(`ptyHost restarted`);
                    this._onPtyHostRestart.fire();
                    unresponsiveNotification === null || unresponsiveNotification === void 0 ? void 0 : unresponsiveNotification.close();
                    unresponsiveNotification = undefined;
                    this._isPtyHostUnresponsive = false;
                }));
            }
            if (this._localPtyService.onPtyHostUnresponsive) {
                this._register(this._localPtyService.onPtyHostUnresponsive(() => {
                    const choices = [{
                            label: (0, nls_1.localize)(0, null),
                            run: () => this._localPtyService.restartPtyHost()
                        }];
                    unresponsiveNotification = notificationService.prompt(notification_1.Severity.Error, (0, nls_1.localize)(1, null), choices);
                    this._isPtyHostUnresponsive = true;
                    this._onPtyHostUnresponsive.fire();
                }));
            }
            if (this._localPtyService.onPtyHostResponsive) {
                this._register(this._localPtyService.onPtyHostResponsive(() => {
                    if (!this._isPtyHostUnresponsive) {
                        return;
                    }
                    this._logService.info('The pty host became responsive again');
                    unresponsiveNotification === null || unresponsiveNotification === void 0 ? void 0 : unresponsiveNotification.close();
                    unresponsiveNotification = undefined;
                    this._isPtyHostUnresponsive = false;
                    this._onPtyHostResponsive.fire();
                }));
            }
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, env, windowsEnableConpty, shouldPersist) {
            const executableEnv = await this._shellEnvironmentService.getShellEnv();
            const id = await this._localPtyService.createProcess(shellLaunchConfig, cwd, cols, rows, env, executableEnv, windowsEnableConpty, shouldPersist, this._getWorkspaceId(), this._getWorkspaceName());
            const pty = this._instantiationService.createInstance(localPty_1.LocalPty, id, shouldPersist);
            this._ptys.set(id, pty);
            return pty;
        }
        async attachToProcess(id) {
            try {
                await this._localPtyService.attachToProcess(id);
                const pty = this._instantiationService.createInstance(localPty_1.LocalPty, id, true);
                this._ptys.set(id, pty);
                return pty;
            }
            catch (e) {
                this._logService.trace(`Couldn't attach to process ${e.message}`);
            }
            return undefined;
        }
        async listProcesses() {
            return this._localPtyService.listProcesses();
        }
        async reduceConnectionGraceTime() {
            this._localPtyService.reduceConnectionGraceTime();
        }
        async getDefaultSystemShell(osOverride) {
            return this._localPtyService.getDefaultSystemShell(osOverride);
        }
        async getShellEnvironment() {
            return this._localPtyService.getShellEnvironment();
        }
        async setTerminalLayoutInfo(layoutInfo) {
            const args = {
                workspaceId: this._getWorkspaceId(),
                tabs: layoutInfo ? layoutInfo.tabs : []
            };
            await this._localPtyService.setTerminalLayoutInfo(args);
        }
        async getTerminalLayoutInfo() {
            const layoutArgs = {
                workspaceId: this._getWorkspaceId()
            };
            let result = await this._localPtyService.getTerminalLayoutInfo(layoutArgs);
            return result;
        }
        _getWorkspaceId() {
            return this._workspaceContextService.getWorkspace().id;
        }
        _getWorkspaceName() {
            return this._labelService.getWorkspaceLabel(this._workspaceContextService.getWorkspace());
        }
    };
    LocalTerminalService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, log_1.ILogService),
        __param(3, terminal_1.ILocalPtyService),
        __param(4, label_1.ILabelService),
        __param(5, notification_1.INotificationService),
        __param(6, shellEnvironmentService_1.IShellEnvironmentService)
    ], LocalTerminalService);
    exports.LocalTerminalService = LocalTerminalService;
});
//# sourceMappingURL=localTerminalService.js.map