/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle"], function (require, exports, terminal_1, event_1, extensions_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalInstanceService = void 0;
    let Terminal;
    let SearchAddon;
    let Unicode11Addon;
    let WebglAddon;
    class TerminalInstanceService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onRequestDefaultShellAndArgs = this._register(new event_1.Emitter());
            this.onRequestDefaultShellAndArgs = this._onRequestDefaultShellAndArgs.event;
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
            return {};
        }
    }
    exports.TerminalInstanceService = TerminalInstanceService;
    (0, extensions_1.registerSingleton)(terminal_1.ITerminalInstanceService, TerminalInstanceService, true);
});
//# sourceMappingURL=terminalInstanceService.js.map