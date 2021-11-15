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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uuid", "vs/base/node/shell", "vs/platform/log/common/log", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/contrib/terminal/node/terminalProfiles"], function (require, exports, platform, types_1, uuid_1, shell_1, log_1, extHostConfiguration_1, extHostDebugService_1, extHostDocumentsAndEditors_1, extHostRpcService_1, extHostTerminalService_1, extHostWorkspace_1, terminalEnvironment, terminalProfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTerminalService = void 0;
    let ExtHostTerminalService = class ExtHostTerminalService extends extHostTerminalService_1.BaseExtHostTerminalService {
        constructor(extHostRpc, _extHostConfiguration, _extHostWorkspace, _extHostDocumentsAndEditors, _logService) {
            super(true, extHostRpc);
            this._extHostConfiguration = _extHostConfiguration;
            this._extHostWorkspace = _extHostWorkspace;
            this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
            this._logService = _logService;
            // Getting the SystemShell is an async operation, however, the ExtHost terminal service is mostly synchronous
            // and the API `vscode.env.shell` is also synchronous. The default shell _should_ be set when extensions are
            // starting up but if not, we run getSystemShellSync below which gets a sane default.
            (0, shell_1.getSystemShell)(platform.OS, process.env).then(s => this._defaultShell = s);
            this._updateLastActiveWorkspace();
            this._variableResolverPromise = this._updateVariableResolver();
            this._registerListeners();
        }
        createTerminal(name, shellPath, shellArgs) {
            const terminal = new extHostTerminalService_1.ExtHostTerminal(this._proxy, (0, uuid_1.generateUuid)(), { name, shellPath, shellArgs }, name);
            this._terminals.push(terminal);
            terminal.create(shellPath, shellArgs);
            return terminal.value;
        }
        createTerminalFromOptions(options, isFeatureTerminal) {
            const terminal = new extHostTerminalService_1.ExtHostTerminal(this._proxy, (0, uuid_1.generateUuid)(), options, options.name);
            this._terminals.push(terminal);
            terminal.create((0, types_1.withNullAsUndefined)(options.shellPath), (0, types_1.withNullAsUndefined)(options.shellArgs), (0, types_1.withNullAsUndefined)(options.cwd), (0, types_1.withNullAsUndefined)(options.env), (0, types_1.withNullAsUndefined)(options.icon), (0, types_1.withNullAsUndefined)(options.message), 
            /*options.waitOnExit*/ undefined, (0, types_1.withNullAsUndefined)(options.strictEnv), (0, types_1.withNullAsUndefined)(options.hideFromUser), (0, types_1.withNullAsUndefined)(isFeatureTerminal), true);
            return terminal.value;
        }
        getDefaultShell(useAutomationShell, configProvider) {
            var _a;
            return terminalEnvironment.getDefaultShell(this._buildSafeConfigProvider(configProvider), (_a = this._defaultShell) !== null && _a !== void 0 ? _a : (0, shell_1.getSystemShellSync)(platform.OS, process.env), process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432'), process.env.windir, terminalEnvironment.createVariableResolver(this._lastActiveWorkspace, process.env, this._variableResolver), this._logService, useAutomationShell);
        }
        getDefaultShellArgs(useAutomationShell, configProvider) {
            return terminalEnvironment.getDefaultShellArgs(this._buildSafeConfigProvider(configProvider), useAutomationShell, terminalEnvironment.createVariableResolver(this._lastActiveWorkspace, process.env, this._variableResolver), this._logService);
        }
        _registerListeners() {
            this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor(() => this._updateLastActiveWorkspace());
            this._extHostWorkspace.onDidChangeWorkspace(() => {
                this._variableResolverPromise = this._updateVariableResolver();
            });
        }
        _updateLastActiveWorkspace() {
            const activeEditor = this._extHostDocumentsAndEditors.activeEditor();
            if (activeEditor) {
                this._lastActiveWorkspace = this._extHostWorkspace.getWorkspaceFolder(activeEditor.document.uri);
            }
        }
        async _updateVariableResolver() {
            const configProvider = await this._extHostConfiguration.getConfigProvider();
            const workspaceFolders = await this._extHostWorkspace.getWorkspaceFolders2();
            this._variableResolver = new extHostDebugService_1.ExtHostVariableResolverService(workspaceFolders || [], this._extHostDocumentsAndEditors, configProvider);
            return this._variableResolver;
        }
        async $getAvailableProfiles(configuredProfilesOnly) {
            const safeConfigProvider = this._buildSafeConfigProvider(await this._extHostConfiguration.getConfigProvider());
            return (0, terminalProfiles_1.detectAvailableProfiles)(configuredProfilesOnly, safeConfigProvider, undefined, this._logService, await this._variableResolverPromise, this._lastActiveWorkspace);
        }
        async $getDefaultShellAndArgs(useAutomationShell) {
            const configProvider = await this._extHostConfiguration.getConfigProvider();
            return {
                shell: this.getDefaultShell(useAutomationShell, configProvider),
                args: this.getDefaultShellArgs(useAutomationShell, configProvider)
            };
        }
        // TODO: Remove when workspace trust is enabled
        _buildSafeConfigProvider(configProvider) {
            const config = configProvider.getConfiguration();
            return (key) => {
                const isWorkspaceConfigAllowed = config.get('terminal.integrated.allowWorkspaceConfiguration');
                if (isWorkspaceConfigAllowed) {
                    return config.get(key);
                }
                const inspected = config.inspect(key);
                return (inspected === null || inspected === void 0 ? void 0 : inspected.globalValue) || (inspected === null || inspected === void 0 ? void 0 : inspected.defaultValue);
            };
        }
    };
    ExtHostTerminalService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostConfiguration_1.IExtHostConfiguration),
        __param(2, extHostWorkspace_1.IExtHostWorkspace),
        __param(3, extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors),
        __param(4, log_1.ILogService)
    ], ExtHostTerminalService);
    exports.ExtHostTerminalService = ExtHostTerminalService;
});
//# sourceMappingURL=extHostTerminalService.js.map