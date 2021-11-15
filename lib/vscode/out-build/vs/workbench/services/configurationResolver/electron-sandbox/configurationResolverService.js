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
define(["require", "exports", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/platform/instantiation/common/extensions", "vs/workbench/services/configurationResolver/browser/configurationResolverService", "vs/platform/label/common/label", "vs/workbench/services/environment/electron-sandbox/shellEnvironmentService"], function (require, exports, environmentService_1, configuration_1, commands_1, workspace_1, editorService_1, quickInput_1, configurationResolver_1, extensions_1, configurationResolverService_1, label_1, shellEnvironmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationResolverService = void 0;
    let ConfigurationResolverService = class ConfigurationResolverService extends configurationResolverService_1.BaseConfigurationResolverService {
        constructor(editorService, environmentService, configurationService, commandService, workspaceContextService, quickInputService, labelService, shellEnvironmentService) {
            super({
                getAppRoot: () => {
                    return environmentService.appRoot;
                },
                getExecPath: () => {
                    return environmentService.execPath;
                }
            }, shellEnvironmentService.getShellEnv(), editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService);
        }
    };
    ConfigurationResolverService = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, commands_1.ICommandService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, label_1.ILabelService),
        __param(7, shellEnvironmentService_1.IShellEnvironmentService)
    ], ConfigurationResolverService);
    exports.ConfigurationResolverService = ConfigurationResolverService;
    (0, extensions_1.registerSingleton)(configurationResolver_1.IConfigurationResolverService, ConfigurationResolverService, true);
});
//# sourceMappingURL=configurationResolverService.js.map