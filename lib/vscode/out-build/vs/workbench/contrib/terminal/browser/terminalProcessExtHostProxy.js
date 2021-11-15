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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, event_1, lifecycle_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProcessExtHostProxy = void 0;
    let TerminalProcessExtHostProxy = class TerminalProcessExtHostProxy extends lifecycle_1.Disposable {
        constructor(instanceId, _cols, _rows, _terminalService) {
            super();
            this.instanceId = instanceId;
            this._cols = _cols;
            this._rows = _rows;
            this._terminalService = _terminalService;
            this.id = 0;
            this.shouldPersist = false;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this._onProcessTitleChanged = this._register(new event_1.Emitter());
            this.onProcessTitleChanged = this._onProcessTitleChanged.event;
            this._onProcessOverrideDimensions = this._register(new event_1.Emitter());
            this._onProcessResolvedShellLaunchConfig = this._register(new event_1.Emitter());
            this._onStart = this._register(new event_1.Emitter());
            this.onStart = this._onStart.event;
            this._onInput = this._register(new event_1.Emitter());
            this.onInput = this._onInput.event;
            this._onBinary = this._register(new event_1.Emitter());
            this.onBinary = this._onBinary.event;
            this._onResize = this._register(new event_1.Emitter());
            this.onResize = this._onResize.event;
            this._onAcknowledgeDataEvent = this._register(new event_1.Emitter());
            this.onAcknowledgeDataEvent = this._onAcknowledgeDataEvent.event;
            this._onShutdown = this._register(new event_1.Emitter());
            this.onShutdown = this._onShutdown.event;
            this._onRequestInitialCwd = this._register(new event_1.Emitter());
            this.onRequestInitialCwd = this._onRequestInitialCwd.event;
            this._onRequestCwd = this._register(new event_1.Emitter());
            this.onRequestCwd = this._onRequestCwd.event;
            this._onRequestLatency = this._register(new event_1.Emitter());
            this.onRequestLatency = this._onRequestLatency.event;
            this._onProcessShellTypeChanged = this._register(new event_1.Emitter());
            this.onProcessShellTypeChanged = this._onProcessShellTypeChanged.event;
            this._pendingInitialCwdRequests = [];
            this._pendingCwdRequests = [];
            this._pendingLatencyRequests = [];
        }
        get onProcessReady() { return this._onProcessReady.event; }
        get onProcessOverrideDimensions() { return this._onProcessOverrideDimensions.event; }
        get onProcessResolvedShellLaunchConfig() { return this._onProcessResolvedShellLaunchConfig.event; }
        emitData(data) {
            this._onProcessData.fire(data);
        }
        emitTitle(title) {
            this._onProcessTitleChanged.fire(title);
        }
        emitReady(pid, cwd) {
            this._onProcessReady.fire({ pid, cwd });
        }
        emitExit(exitCode) {
            this._onProcessExit.fire(exitCode);
            this.dispose();
        }
        emitOverrideDimensions(dimensions) {
            this._onProcessOverrideDimensions.fire(dimensions);
        }
        emitResolvedShellLaunchConfig(shellLaunchConfig) {
            this._onProcessResolvedShellLaunchConfig.fire(shellLaunchConfig);
        }
        emitInitialCwd(initialCwd) {
            while (this._pendingInitialCwdRequests.length > 0) {
                this._pendingInitialCwdRequests.pop()(initialCwd);
            }
        }
        emitCwd(cwd) {
            while (this._pendingCwdRequests.length > 0) {
                this._pendingCwdRequests.pop()(cwd);
            }
        }
        emitLatency(latency) {
            while (this._pendingLatencyRequests.length > 0) {
                this._pendingLatencyRequests.pop()(latency);
            }
        }
        async start() {
            return this._terminalService.requestStartExtensionTerminal(this, this._cols, this._rows);
        }
        shutdown(immediate) {
            this._onShutdown.fire(immediate);
        }
        input(data) {
            this._onInput.fire(data);
        }
        resize(cols, rows) {
            this._onResize.fire({ cols, rows });
        }
        acknowledgeDataEvent() {
            // Flow control is disabled for extension terminals
        }
        async processBinary(data) {
            // Disabled for extension terminals
            this._onBinary.fire(data);
        }
        getInitialCwd() {
            return new Promise(resolve => {
                this._onRequestInitialCwd.fire();
                this._pendingInitialCwdRequests.push(resolve);
            });
        }
        getCwd() {
            return new Promise(resolve => {
                this._onRequestCwd.fire();
                this._pendingCwdRequests.push(resolve);
            });
        }
        getLatency() {
            return new Promise(resolve => {
                this._onRequestLatency.fire();
                this._pendingLatencyRequests.push(resolve);
            });
        }
    };
    TerminalProcessExtHostProxy = __decorate([
        __param(3, terminal_1.ITerminalService)
    ], TerminalProcessExtHostProxy);
    exports.TerminalProcessExtHostProxy = TerminalProcessExtHostProxy;
});
//# sourceMappingURL=terminalProcessExtHostProxy.js.map