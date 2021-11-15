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
define(["require", "exports", "vs/workbench/contrib/terminal/common/terminalEnvironment", "child_process", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/native/electron-sandbox/native", "vs/base/common/lifecycle", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/terminal/node/terminalEnvironment", "vs/workbench/contrib/terminal/node/terminal"], function (require, exports, terminalEnvironment_1, child_process_1, instantiation_1, remoteAgentService_1, native_1, lifecycle_1, terminal_1, terminalEnvironment_2, terminal_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalNativeContribution = void 0;
    let TerminalNativeContribution = class TerminalNativeContribution extends lifecycle_1.Disposable {
        constructor(_terminalService, instantiationService, remoteAgentService, nativeHostService) {
            super();
            this._terminalService = _terminalService;
            this.instantiationService = instantiationService;
            this.remoteAgentService = remoteAgentService;
            this.nativeHostService = nativeHostService;
            this._terminalService.setLinuxDistro(terminal_2.linuxDistro);
            this._terminalService.setNativeWindowsDelegate({
                getWslPath: this._getWslPath.bind(this),
                getWindowsBuildNumber: this._getWindowsBuildNumber.bind(this)
            });
        }
        /**
         * Converts a path to a path on WSL using the wslpath utility.
         * @param path The original path.
         */
        _getWslPath(path) {
            if ((0, terminalEnvironment_2.getWindowsBuildNumber)() < 17063) {
                throw new Error('wslpath does not exist on Windows build < 17063');
            }
            return new Promise(c => {
                const proc = (0, child_process_1.execFile)('bash.exe', ['-c', `wslpath ${(0, terminalEnvironment_1.escapeNonWindowsPath)(path)}`], {}, (error, stdout, stderr) => {
                    c((0, terminalEnvironment_1.escapeNonWindowsPath)(stdout.trim()));
                });
                proc.stdin.end();
            });
        }
        _getWindowsBuildNumber() {
            return (0, terminalEnvironment_2.getWindowsBuildNumber)();
        }
    };
    TerminalNativeContribution = __decorate([
        __param(0, terminal_1.ITerminalService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, remoteAgentService_1.IRemoteAgentService),
        __param(3, native_1.INativeHostService)
    ], TerminalNativeContribution);
    exports.TerminalNativeContribution = TerminalNativeContribution;
});
//# sourceMappingURL=terminalNativeContribution.js.map