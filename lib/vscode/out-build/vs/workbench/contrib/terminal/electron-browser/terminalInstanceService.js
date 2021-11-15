var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/terminal/node/terminalEnvironment", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService"], function (require, exports, lifecycle_1, terminalEnvironment_1, shellEnvironmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalInstanceService = void 0;
    let Terminal;
    let SearchAddon;
    let Unicode11Addon;
    let WebglAddon;
    let TerminalInstanceService = class TerminalInstanceService extends lifecycle_1.Disposable {
        constructor(_shellEnvironmentService) {
            super();
            this._shellEnvironmentService = _shellEnvironmentService;
        }
        async getXtermConstructor() {
            if (!Terminal) {
                Terminal = (await new Promise((resolve_1, reject_1) => { require(['xterm'], resolve_1, reject_1); })).Terminal;
            }
            return Terminal;
        }
        async getXtermSearchConstructor() {
            if (!SearchAddon) {
                SearchAddon = (await new Promise((resolve_2, reject_2) => { require(['xterm-addon-search'], resolve_2, reject_2); })).SearchAddon;
            }
            return SearchAddon;
        }
        async getXtermUnicode11Constructor() {
            if (!Unicode11Addon) {
                Unicode11Addon = (await new Promise((resolve_3, reject_3) => { require(['xterm-addon-unicode11'], resolve_3, reject_3); })).Unicode11Addon;
            }
            return Unicode11Addon;
        }
        async getXtermWebglConstructor() {
            if (!WebglAddon) {
                WebglAddon = (await new Promise((resolve_4, reject_4) => { require(['xterm-addon-webgl'], resolve_4, reject_4); })).WebglAddon;
            }
            return WebglAddon;
        }
        async getMainProcessParentEnv() {
            return (0, terminalEnvironment_1.getMainProcessParentEnv)(await this._shellEnvironmentService.getShellEnv());
        }
    };
    TerminalInstanceService = __decorate([
        __param(0, shellEnvironmentService_1.IShellEnvironmentService)
    ], TerminalInstanceService);
    exports.TerminalInstanceService = TerminalInstanceService;
});
//# sourceMappingURL=terminalInstanceService.js.map