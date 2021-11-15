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
define(["require", "exports", "vs/base/common/network", "vs/base/common/process", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/base/common/path", "vs/base/common/codicons"], function (require, exports, network_1, process_1, types_1, configuration_1, log_1, workspace_1, terminal_1, configurationResolver_1, history_1, path, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserTerminalProfileResolverService = exports.BaseTerminalProfileResolverService = void 0;
    const generatedProfileName = 'Generated';
    class BaseTerminalProfileResolverService {
        constructor(_context, _configurationService, _configurationResolverService, _historyService, _logService, _terminalService, _workspaceContextService) {
            this._context = _context;
            this._configurationService = _configurationService;
            this._configurationResolverService = _configurationResolverService;
            this._historyService = _historyService;
            this._logService = _logService;
            this._terminalService = _terminalService;
            this._workspaceContextService = _workspaceContextService;
        }
        resolveIcon(shellLaunchConfig, os) {
            if (shellLaunchConfig.executable) {
                return;
            }
            const defaultProfile = this._getRealDefaultProfile(true, os);
            if (defaultProfile) {
                shellLaunchConfig.icon = defaultProfile.icon;
            }
        }
        async resolveShellLaunchConfig(shellLaunchConfig, options) {
            // Resolve the shell and shell args
            let resolvedProfile;
            if (shellLaunchConfig.executable) {
                resolvedProfile = await this._resolveProfile({
                    path: shellLaunchConfig.executable,
                    args: shellLaunchConfig.args,
                    profileName: generatedProfileName
                }, options);
            }
            else {
                resolvedProfile = await this.getDefaultProfile(options);
            }
            shellLaunchConfig.executable = resolvedProfile.path;
            shellLaunchConfig.args = resolvedProfile.args;
            if (resolvedProfile.env) {
                if (shellLaunchConfig.env) {
                    shellLaunchConfig.env = Object.assign(Object.assign({}, shellLaunchConfig.env), resolvedProfile.env);
                }
                else {
                    shellLaunchConfig.env = resolvedProfile.env;
                }
            }
            // Verify the icon is valid, and fallback correctly to the generic terminal id if there is
            // an issue
            shellLaunchConfig.icon = this._verifyIcon(shellLaunchConfig.icon) || this._verifyIcon(resolvedProfile.icon) || codicons_1.Codicon.terminal.id;
        }
        _verifyIcon(iconId) {
            if (!iconId || !codicons_1.iconRegistry.get(iconId)) {
                return undefined;
            }
            return iconId;
        }
        async getDefaultShell(options) {
            return (await this.getDefaultProfile(options)).path;
        }
        async getDefaultShellArgs(options) {
            return (await this.getDefaultProfile(options)).args || [];
        }
        async getDefaultProfile(options) {
            return this._resolveProfile(await this._getUnresolvedDefaultProfile(options), options);
        }
        getShellEnvironment(remoteAuthority) {
            return this._context.getShellEnvironment(remoteAuthority);
        }
        async _getUnresolvedDefaultProfile(options) {
            // If automation shell is allowed, prefer that
            if (options.allowAutomationShell) {
                const automationShellProfile = this._getAutomationShellProfile(options);
                if (automationShellProfile) {
                    return automationShellProfile;
                }
            }
            // Return the real default profile if it exists and is valid
            const defaultProfile = await this._getRealDefaultProfile(false, options.os);
            if (defaultProfile) {
                return defaultProfile;
            }
            // If there is no real default profile, create a fallback default profile based on the shell
            // and shellArgs settings in addition to the current environment.
            return this._getFallbackDefaultProfile(options);
        }
        _getRealDefaultProfile(sync, os) {
            const defaultProfileName = this.getSafeConfigValue('defaultProfile', os);
            if (defaultProfileName && typeof defaultProfileName === 'string') {
                if (sync) {
                    const profiles = this._terminalService.availableProfiles;
                    return profiles.find(e => e.profileName === defaultProfileName);
                }
                else {
                    return this._terminalService.availableProfiles.find(e => e.profileName === defaultProfileName);
                }
            }
            return undefined;
        }
        async _getFallbackDefaultProfile(options) {
            let executable;
            let args;
            const shellSetting = this.getSafeConfigValue('shell', options.os);
            if (this._isValidShell(shellSetting)) {
                executable = shellSetting;
                const shellArgsSetting = this.getSafeConfigValue('shellArgs', options.os);
                if (this._isValidShellArgs(shellArgsSetting, options.os)) {
                    args = shellArgsSetting;
                }
            }
            else {
                executable = await this._context.getDefaultSystemShell(options.remoteAuthority, options.os);
            }
            if (args === undefined) {
                if (options.os === 2 /* Macintosh */ && args === undefined) {
                    // macOS should launch a login shell by default
                    args = ['--login'];
                }
                else {
                    // Resolve undefined to []
                    args = [];
                }
            }
            const icon = this._guessProfileIcon(executable);
            return {
                profileName: generatedProfileName,
                path: executable,
                args,
                icon
            };
        }
        _getAutomationShellProfile(options) {
            const automationShell = this.getSafeConfigValue('automationShell', options.os);
            if (!automationShell || typeof automationShell !== 'string') {
                return undefined;
            }
            return {
                path: automationShell,
                profileName: generatedProfileName
            };
        }
        async _resolveProfile(profile, options) {
            if (options.os === 1 /* Windows */) {
                // Change Sysnative to System32 if the OS is Windows but NOT WoW64. It's
                // safe to assume that this was used by accident as Sysnative does not
                // exist and will break the terminal in non-WoW64 environments.
                const env = await this._context.getShellEnvironment(options.remoteAuthority);
                const isWoW64 = !!env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
                const windir = env.windir;
                if (!isWoW64 && windir) {
                    const sysnativePath = path.join(windir, 'Sysnative').replace(/\//g, '\\').toLowerCase();
                    if (profile.path && profile.path.toLowerCase().indexOf(sysnativePath) === 0) {
                        profile.path = path.join(windir, 'System32', profile.path.substr(sysnativePath.length + 1));
                    }
                }
                // Convert / to \ on Windows for convenience
                if (profile.path) {
                    profile.path = profile.path.replace(/\//g, '\\');
                }
            }
            // Resolve path variables
            const env = await this._context.getShellEnvironment(options.remoteAuthority);
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            const lastActiveWorkspace = activeWorkspaceRootUri ? (0, types_1.withNullAsUndefined)(this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri)) : undefined;
            profile.path = this._resolveVariables(profile.path, env, lastActiveWorkspace);
            // Resolve args variables
            if (profile.args) {
                if (typeof profile.args === 'string') {
                    profile.args = this._resolveVariables(profile.args, env, lastActiveWorkspace);
                }
                else {
                    for (let i = 0; i < profile.args.length; i++) {
                        profile.args[i] = this._resolveVariables(profile.args[i], env, lastActiveWorkspace);
                    }
                }
            }
            return profile;
        }
        _resolveVariables(value, env, lastActiveWorkspace) {
            try {
                value = this._configurationResolverService.resolveWithEnvironment(env, lastActiveWorkspace, value);
            }
            catch (e) {
                this._logService.error(`Could not resolve shell`, e);
            }
            return value;
        }
        _getOsKey(os) {
            switch (os) {
                case 3 /* Linux */: return 'linux';
                case 2 /* Macintosh */: return 'osx';
                case 1 /* Windows */: return 'windows';
            }
        }
        _guessProfileIcon(shell) {
            const file = path.parse(shell).name;
            switch (file) {
                case 'bash':
                    return codicons_1.Codicon.terminalBash.id;
                case 'pwsh':
                case 'powershell':
                    return codicons_1.Codicon.terminalPowershell.id;
                case 'tmux':
                    return codicons_1.Codicon.terminalTmux.id;
                case 'cmd':
                    return codicons_1.Codicon.terminalCmd.id;
                default:
                    return undefined;
            }
        }
        _isValidShell(shell) {
            if (!shell) {
                return false;
            }
            return typeof shell === 'string';
        }
        _isValidShellArgs(shellArgs, os) {
            if (shellArgs === undefined) {
                return true;
            }
            if (os === 1 /* Windows */ && typeof shellArgs === 'string') {
                return true;
            }
            if (Array.isArray(shellArgs) && shellArgs.every(e => typeof e === 'string')) {
                return true;
            }
            return false;
        }
        // TODO: Remove when workspace trust is enabled
        getSafeConfigValue(key, os) {
            return this.getSafeConfigValueFullKey(`terminal.integrated.${key}.${this._getOsKey(os)}`);
        }
        getSafeConfigValueFullKey(key) {
            var _a, _b;
            const isWorkspaceConfigAllowed = this._configurationService.getValue('terminal.integrated.allowWorkspaceConfiguration');
            if (isWorkspaceConfigAllowed) {
                return this._configurationService.getValue(key);
            }
            else {
                const config = this._configurationService.inspect(key);
                const value = ((_a = config.user) === null || _a === void 0 ? void 0 : _a.value) || ((_b = config.default) === null || _b === void 0 ? void 0 : _b.value);
                // Clone if needed to allow extensibility
                if (Array.isArray(value)) {
                    return value.slice();
                }
                if (typeof value === 'object') {
                    return Object.assign({}, value);
                }
                return value;
            }
        }
    }
    exports.BaseTerminalProfileResolverService = BaseTerminalProfileResolverService;
    let BrowserTerminalProfileResolverService = class BrowserTerminalProfileResolverService extends BaseTerminalProfileResolverService {
        constructor(configurationResolverService, configurationService, historyService, logService, remoteTerminalService, terminalService, workspaceContextService) {
            super({
                getDefaultSystemShell: async (remoteAuthority, os) => {
                    if (!remoteAuthority) {
                        // Just return basic values, this is only for serverless web and wouldn't be used
                        return os === 1 /* Windows */ ? 'pwsh' : 'bash';
                    }
                    return remoteTerminalService.getDefaultSystemShell(os);
                },
                getShellEnvironment: async (remoteAuthority) => {
                    if (!remoteAuthority) {
                        return process_1.env;
                    }
                    return remoteTerminalService.getShellEnvironment();
                }
            }, configurationService, configurationResolverService, historyService, logService, terminalService, workspaceContextService);
        }
    };
    BrowserTerminalProfileResolverService = __decorate([
        __param(0, configurationResolver_1.IConfigurationResolverService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, history_1.IHistoryService),
        __param(3, log_1.ILogService),
        __param(4, terminal_1.IRemoteTerminalService),
        __param(5, terminal_1.ITerminalService),
        __param(6, workspace_1.IWorkspaceContextService)
    ], BrowserTerminalProfileResolverService);
    exports.BrowserTerminalProfileResolverService = BrowserTerminalProfileResolverService;
});
//# sourceMappingURL=terminalProfileResolverService.js.map