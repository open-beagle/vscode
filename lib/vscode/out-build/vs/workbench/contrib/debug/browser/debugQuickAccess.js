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
define(["require", "exports", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/nls!vs/workbench/contrib/debug/browser/debugQuickAccess", "vs/platform/notification/common/notification", "vs/workbench/contrib/debug/common/debug", "vs/platform/workspace/common/workspace", "vs/platform/commands/common/commands", "vs/base/common/filters", "vs/base/common/types", "vs/workbench/contrib/debug/browser/debugCommands", "vs/workbench/contrib/debug/browser/debugIcons", "vs/platform/theme/common/themeService"], function (require, exports, pickerQuickAccess_1, nls_1, notification_1, debug_1, workspace_1, commands_1, filters_1, types_1, debugCommands_1, debugIcons_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartDebugQuickAccessProvider = void 0;
    let StartDebugQuickAccessProvider = class StartDebugQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        constructor(debugService, contextService, commandService, notificationService) {
            super(StartDebugQuickAccessProvider.PREFIX, {
                noResultsPick: {
                    label: (0, nls_1.localize)(0, null)
                }
            });
            this.debugService = debugService;
            this.contextService = contextService;
            this.commandService = commandService;
            this.notificationService = notificationService;
        }
        async getPicks(filter) {
            var _a, _b;
            const picks = [];
            picks.push({ type: 'separator', label: 'launch.json' });
            const configManager = this.debugService.getConfigurationManager();
            // Entries: configs
            let lastGroup;
            for (let config of configManager.getAllConfigurations()) {
                const highlights = (0, filters_1.matchesFuzzy)(filter, config.name, true);
                if (highlights) {
                    // Separator
                    if (lastGroup !== ((_a = config.presentation) === null || _a === void 0 ? void 0 : _a.group)) {
                        picks.push({ type: 'separator' });
                        lastGroup = (_b = config.presentation) === null || _b === void 0 ? void 0 : _b.group;
                    }
                    // Launch entry
                    picks.push({
                        label: config.name,
                        description: this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ ? config.launch.name : '',
                        highlights: { label: highlights },
                        buttons: [{
                                iconClass: themeService_1.ThemeIcon.asClassName(debugIcons_1.debugConfigure),
                                tooltip: (0, nls_1.localize)(1, null)
                            }],
                        trigger: () => {
                            config.launch.openConfigFile(false);
                            return pickerQuickAccess_1.TriggerAction.CLOSE_PICKER;
                        },
                        accept: async () => {
                            await configManager.selectConfiguration(config.launch, config.name);
                            try {
                                await this.debugService.startDebugging(config.launch);
                            }
                            catch (error) {
                                this.notificationService.error(error);
                            }
                        }
                    });
                }
            }
            // Entries detected configurations
            const dynamicProviders = await configManager.getDynamicProviders();
            if (dynamicProviders.length > 0) {
                picks.push({
                    type: 'separator', label: (0, nls_1.localize)(2, null)



                });
            }
            configManager.getRecentDynamicConfigurations().forEach(({ name, type }) => {
                const highlights = (0, filters_1.matchesFuzzy)(filter, name, true);
                if (highlights) {
                    picks.push({
                        label: name,
                        highlights: { label: highlights },
                        accept: async () => {
                            await configManager.selectConfiguration(undefined, name, undefined, { type });
                            try {
                                const { launch, getConfig } = configManager.selectedConfiguration;
                                const config = await getConfig();
                                await this.debugService.startDebugging(launch, config);
                            }
                            catch (error) {
                                this.notificationService.error(error);
                            }
                        }
                    });
                }
            });
            dynamicProviders.forEach(provider => {
                picks.push({
                    label: `$(folder) ${provider.label}...`,
                    ariaLabel: (0, nls_1.localize)(3, null, provider.label),
                    accept: async () => {
                        const pick = await provider.pick();
                        if (pick) {
                            // Use the type of the provider, not of the config since config sometimes have subtypes (for example "node-terminal")
                            await configManager.selectConfiguration(pick.launch, pick.config.name, pick.config, { type: provider.type });
                            this.debugService.startDebugging(pick.launch, pick.config);
                        }
                    }
                });
            });
            // Entries: launches
            const visibleLaunches = configManager.getLaunches().filter(launch => !launch.hidden);
            // Separator
            if (visibleLaunches.length > 0) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)(4, null) });
            }
            for (const launch of visibleLaunches) {
                const label = this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ ?
                    (0, nls_1.localize)(5, null, launch.name) :
                    (0, nls_1.localize)(6, null);
                // Add Config entry
                picks.push({
                    label,
                    description: this.contextService.getWorkbenchState() === 3 /* WORKSPACE */ ? launch.name : '',
                    highlights: { label: (0, types_1.withNullAsUndefined)((0, filters_1.matchesFuzzy)(filter, label, true)) },
                    accept: () => this.commandService.executeCommand(debugCommands_1.ADD_CONFIGURATION_ID, launch.uri.toString())
                });
            }
            return picks;
        }
    };
    StartDebugQuickAccessProvider.PREFIX = 'debug ';
    StartDebugQuickAccessProvider = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, commands_1.ICommandService),
        __param(3, notification_1.INotificationService)
    ], StartDebugQuickAccessProvider);
    exports.StartDebugQuickAccessProvider = StartDebugQuickAccessProvider;
});
//# sourceMappingURL=debugQuickAccess.js.map