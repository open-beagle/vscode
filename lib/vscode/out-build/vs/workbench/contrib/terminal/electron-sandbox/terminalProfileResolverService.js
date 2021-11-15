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
define(["require", "exports", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalProfileResolverService", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService", "vs/workbench/services/history/common/history"], function (require, exports, configuration_1, log_1, terminal_1, workspace_1, terminal_2, terminalProfileResolverService_1, configurationResolver_1, shellEnvironmentService_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ElectronTerminalProfileResolverService = void 0;
    let ElectronTerminalProfileResolverService = class ElectronTerminalProfileResolverService extends terminalProfileResolverService_1.BaseTerminalProfileResolverService {
        constructor(configurationResolverService, configurationService, historyService, logService, shellEnvironmentService, terminalService, localTerminalService, remoteTerminalService, workspaceContextService) {
            super({
                getDefaultSystemShell: async (remoteAuthority, platform) => {
                    const service = remoteAuthority ? remoteTerminalService : localTerminalService;
                    return service.getDefaultSystemShell(platform);
                },
                getShellEnvironment: (remoteAuthority) => {
                    if (remoteAuthority) {
                        remoteTerminalService.getShellEnvironment();
                    }
                    return shellEnvironmentService.getShellEnv();
                }
            }, configurationService, configurationResolverService, historyService, logService, terminalService, workspaceContextService);
        }
    };
    ElectronTerminalProfileResolverService = __decorate([
        __param(0, configurationResolver_1.IConfigurationResolverService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, history_1.IHistoryService),
        __param(3, log_1.ILogService),
        __param(4, shellEnvironmentService_1.IShellEnvironmentService),
        __param(5, terminal_2.ITerminalService),
        __param(6, terminal_1.ILocalTerminalService),
        __param(7, terminal_2.IRemoteTerminalService),
        __param(8, workspace_1.IWorkspaceContextService)
    ], ElectronTerminalProfileResolverService);
    exports.ElectronTerminalProfileResolverService = ElectronTerminalProfileResolverService;
});
//# sourceMappingURL=terminalProfileResolverService.js.map