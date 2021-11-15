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
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/electron-sandbox/terminalRemote", "vs/platform/registry/common/platform", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/actions", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/environment/common/environment"], function (require, exports, nls, platform_1, actions_1, actions_2, terminal_1, actions_3, terminal_2, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CreateNewLocalTerminalAction = exports.registerRemoteContributions = void 0;
    function registerRemoteContributions() {
        const actionRegistry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
        actionRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(CreateNewLocalTerminalAction), 'Terminal: Create New Integrated Terminal (Local)', terminal_1.TERMINAL_ACTION_CATEGORY);
    }
    exports.registerRemoteContributions = registerRemoteContributions;
    let CreateNewLocalTerminalAction = class CreateNewLocalTerminalAction extends actions_3.Action {
        constructor(id, label, _terminalService, _nativeEnvironmentService) {
            super(id, label);
            this._terminalService = _terminalService;
            this._nativeEnvironmentService = _nativeEnvironmentService;
        }
        run() {
            const instance = this._terminalService.createTerminal({ cwd: this._nativeEnvironmentService.userHome });
            if (!instance) {
                return Promise.resolve(undefined);
            }
            this._terminalService.setActiveInstance(instance);
            return this._terminalService.showPanel(true);
        }
    };
    CreateNewLocalTerminalAction.ID = "workbench.action.terminal.newLocal" /* NEW_LOCAL */;
    CreateNewLocalTerminalAction.LABEL = nls.localize(0, null);
    CreateNewLocalTerminalAction = __decorate([
        __param(2, terminal_2.ITerminalService),
        __param(3, environment_1.INativeEnvironmentService)
    ], CreateNewLocalTerminalAction);
    exports.CreateNewLocalTerminalAction = CreateNewLocalTerminalAction;
});
//# sourceMappingURL=terminalRemote.js.map