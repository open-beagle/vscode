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
define(["require", "exports", "vs/nls!vs/workbench/contrib/remote/browser/remoteIndicator", "vs/workbench/common/theme", "vs/platform/theme/common/themeService", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/workbench/services/statusbar/common/statusbar", "vs/platform/label/common/label", "vs/platform/contextkey/common/contextkey", "vs/platform/commands/common/commands", "vs/base/common/network", "vs/workbench/services/extensions/common/extensions", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/environment/common/environmentService", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/host/browser/host", "vs/base/common/platform", "vs/base/common/functional", "vs/base/common/strings", "vs/platform/workspace/common/workspace", "vs/platform/remote/common/remoteHosts", "vs/base/common/codicons", "vs/platform/log/common/log"], function (require, exports, nls, theme_1, themeService_1, remoteAgentService_1, lifecycle_1, actions_1, statusbar_1, label_1, contextkey_1, commands_1, network_1, extensions_1, quickInput_1, environmentService_1, remoteAuthorityResolver_1, host_1, platform_1, functional_1, strings_1, workspace_1, remoteHosts_1, codicons_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteStatusIndicator = void 0;
    let RemoteStatusIndicator = class RemoteStatusIndicator extends lifecycle_1.Disposable {
        constructor(statusbarService, environmentService, labelService, contextKeyService, menuService, quickInputService, commandService, extensionService, remoteAgentService, remoteAuthorityResolverService, hostService, workspaceContextService, logService) {
            super();
            this.statusbarService = statusbarService;
            this.environmentService = environmentService;
            this.labelService = labelService;
            this.contextKeyService = contextKeyService;
            this.menuService = menuService;
            this.quickInputService = quickInputService;
            this.commandService = commandService;
            this.extensionService = extensionService;
            this.remoteAgentService = remoteAgentService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.hostService = hostService;
            this.workspaceContextService = workspaceContextService;
            this.logService = logService;
            this.legacyIndicatorMenu = this._register(this.menuService.createMenu(actions_1.MenuId.StatusBarWindowIndicatorMenu, this.contextKeyService)); // to be removed once migration completed
            this.remoteIndicatorMenu = this._register(this.menuService.createMenu(actions_1.MenuId.StatusBarRemoteIndicatorMenu, this.contextKeyService));
            this.remoteAuthority = this.environmentService.remoteAuthority;
            this.connectionState = undefined;
            this.connectionStateContextKey = new contextkey_1.RawContextKey('remoteConnectionState', '').bindTo(this.contextKeyService);
            this.loggedInvalidGroupNames = Object.create(null);
            // Set initial connection state
            if (this.remoteAuthority) {
                this.connectionState = 'initializing';
                this.connectionStateContextKey.set(this.connectionState);
            }
            this.registerActions();
            this.registerListeners();
            this.updateWhenInstalledExtensionsRegistered();
            this.updateRemoteStatusIndicator();
        }
        registerActions() {
            const category = { value: nls.localize(0, null), original: 'Remote' };
            // Show Remote Menu
            const that = this;
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID,
                        category,
                        title: { value: nls.localize(1, null), original: 'Show Remote Menu' },
                        f1: true,
                    });
                    this.run = () => that.showRemoteMenu();
                }
            });
            // Close Remote Connection
            if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID && this.remoteAuthority) {
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                            category,
                            title: { value: nls.localize(2, null), original: 'Close Remote Connection' },
                            f1: true
                        });
                        this.run = () => that.remoteAuthority && that.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: null });
                    }
                });
                actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
                    group: '6_close',
                    command: {
                        id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                        title: nls.localize(3, null)
                    },
                    order: 3.5
                });
            }
        }
        registerListeners() {
            var _a;
            // Menu changes
            const updateRemoteActions = () => {
                this.remoteMenuActionsGroups = undefined;
                this.updateRemoteStatusIndicator();
            };
            this._register(this.legacyIndicatorMenu.onDidChange(updateRemoteActions));
            this._register(this.remoteIndicatorMenu.onDidChange(updateRemoteActions));
            // Update indicator when formatter changes as it may have an impact on the remote label
            this._register(this.labelService.onDidChangeFormatters(() => this.updateRemoteStatusIndicator()));
            // Update based on remote indicator changes if any
            const remoteIndicator = (_a = this.environmentService.options) === null || _a === void 0 ? void 0 : _a.windowIndicator;
            if (remoteIndicator) {
                this._register(remoteIndicator.onDidChange(() => this.updateRemoteStatusIndicator()));
            }
            // Listen to changes of the connection
            if (this.remoteAuthority) {
                const connection = this.remoteAgentService.getConnection();
                if (connection) {
                    this._register(connection.onDidStateChange((e) => {
                        switch (e.type) {
                            case 0 /* ConnectionLost */:
                            case 2 /* ReconnectionRunning */:
                            case 1 /* ReconnectionWait */:
                                this.setState('reconnecting');
                                break;
                            case 3 /* ReconnectionPermanentFailure */:
                                this.setState('disconnected');
                                break;
                            case 4 /* ConnectionGain */:
                                this.setState('connected');
                                break;
                        }
                    }));
                }
            }
            else {
                this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => this.updateRemoteStatusIndicator()));
            }
        }
        async updateWhenInstalledExtensionsRegistered() {
            await this.extensionService.whenInstalledExtensionsRegistered();
            const remoteAuthority = this.remoteAuthority;
            if (remoteAuthority) {
                // Try to resolve the authority to figure out connection state
                (async () => {
                    try {
                        await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority);
                        this.setState('connected');
                    }
                    catch (error) {
                        this.setState('disconnected');
                    }
                })();
            }
            this.updateRemoteStatusIndicator();
        }
        setState(newState) {
            if (this.connectionState !== newState) {
                this.connectionState = newState;
                // simplify context key which doesn't support `connecting`
                if (this.connectionState === 'reconnecting') {
                    this.connectionStateContextKey.set('disconnected');
                }
                else {
                    this.connectionStateContextKey.set(this.connectionState);
                }
                this.updateRemoteStatusIndicator();
            }
        }
        validatedGroup(group) {
            if (!group.match(/^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+\-.]*)_(.*))$/)) {
                if (!this.loggedInvalidGroupNames[group]) {
                    this.loggedInvalidGroupNames[group] = true;
                    this.logService.warn(`Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${group}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`);
                }
                return false;
            }
            return true;
        }
        getRemoteMenuActions(doNotUseCache) {
            if (!this.remoteMenuActionsGroups || doNotUseCache) {
                this.remoteMenuActionsGroups = this.remoteIndicatorMenu.getActions().filter(a => this.validatedGroup(a[0])).concat(this.legacyIndicatorMenu.getActions());
            }
            return this.remoteMenuActionsGroups;
        }
        updateRemoteStatusIndicator() {
            var _a;
            // Remote Indicator: show if provided via options
            const remoteIndicator = (_a = this.environmentService.options) === null || _a === void 0 ? void 0 : _a.windowIndicator;
            if (remoteIndicator) {
                this.renderRemoteStatusIndicator((0, strings_1.truncate)(remoteIndicator.label, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH), remoteIndicator.tooltip, remoteIndicator.command);
                return;
            }
            // Remote Authority: show connection state
            if (this.remoteAuthority) {
                const hostLabel = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, this.remoteAuthority) || this.remoteAuthority;
                switch (this.connectionState) {
                    case 'initializing':
                        this.renderRemoteStatusIndicator(nls.localize(4, null), nls.localize(5, null), undefined, true /* progress */);
                        break;
                    case 'reconnecting':
                        this.renderRemoteStatusIndicator(`${nls.localize(6, null, (0, strings_1.truncate)(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`, nls.localize(7, null, hostLabel), undefined, true);
                        break;
                    case 'disconnected':
                        this.renderRemoteStatusIndicator(`$(alert) ${nls.localize(8, null, (0, strings_1.truncate)(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`, nls.localize(9, null, hostLabel));
                        break;
                    default:
                        this.renderRemoteStatusIndicator(`$(remote) ${(0, strings_1.truncate)(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, nls.localize(10, null, hostLabel));
                }
                return;
            }
            // Workspace with label: indicate editing source
            const workspaceLabel = this.getWorkspaceLabel();
            if (workspaceLabel) {
                this.renderRemoteStatusIndicator(`$(remote) ${(0, strings_1.truncate)(workspaceLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, nls.localize(11, null, workspaceLabel));
                return;
            }
            // Remote actions: offer menu
            if (this.getRemoteMenuActions().length > 0) {
                this.renderRemoteStatusIndicator(`$(remote)`, nls.localize(12, null));
                return;
            }
            // No Remote Extensions: hide status indicator
            (0, lifecycle_1.dispose)(this.remoteStatusEntry);
            this.remoteStatusEntry = undefined;
        }
        getWorkspaceLabel() {
            const workspace = this.workspaceContextService.getWorkspace();
            const workspaceLocation = (0, remoteHosts_1.getVirtualWorkspaceLocation)(workspace);
            if (workspaceLocation) {
                return this.labelService.getHostLabel(workspaceLocation.scheme, workspaceLocation.authority);
            }
            return undefined;
        }
        renderRemoteStatusIndicator(text, tooltip, command, showProgress) {
            const name = nls.localize(13, null);
            if (typeof command !== 'string' && this.getRemoteMenuActions().length > 0) {
                command = RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID;
            }
            const ariaLabel = (0, codicons_1.getCodiconAriaLabel)(text);
            const properties = {
                backgroundColor: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_HOST_NAME_BACKGROUND),
                color: (0, themeService_1.themeColorFromId)(theme_1.STATUS_BAR_HOST_NAME_FOREGROUND),
                ariaLabel,
                text,
                showProgress,
                tooltip,
                command
            };
            if (this.remoteStatusEntry) {
                this.remoteStatusEntry.update(properties);
            }
            else {
                this.remoteStatusEntry = this.statusbarService.addEntry(properties, 'status.host', name, 0 /* LEFT */, Number.MAX_VALUE /* first entry */);
            }
        }
        showRemoteMenu() {
            const getCategoryLabel = (action) => {
                if (action.item.category) {
                    return typeof action.item.category === 'string' ? action.item.category : action.item.category.value;
                }
                return undefined;
            };
            const computeItems = () => {
                const actionGroups = this.getRemoteMenuActions(true);
                const items = [];
                let lastCategoryName = undefined;
                for (let actionGroup of actionGroups) {
                    let hasGroupCategory = false;
                    for (let action of actionGroup[1]) {
                        if (action instanceof actions_1.MenuItemAction) {
                            if (!hasGroupCategory) {
                                const category = getCategoryLabel(action);
                                if (category !== lastCategoryName) {
                                    items.push({ type: 'separator', label: category });
                                    lastCategoryName = category;
                                }
                                hasGroupCategory = true;
                            }
                            let label = typeof action.item.title === 'string' ? action.item.title : action.item.title.value;
                            items.push({
                                type: 'item',
                                id: action.item.id,
                                label
                            });
                        }
                    }
                }
                if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID && this.remoteAuthority) {
                    if (items.length) {
                        items.push({ type: 'separator' });
                    }
                    items.push({
                        type: 'item',
                        id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                        label: nls.localize(14, null)
                    });
                }
                return items;
            };
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.items = computeItems();
            quickPick.sortByLabel = false;
            quickPick.canSelectMany = false;
            (0, functional_1.once)(quickPick.onDidAccept)((_ => {
                const selectedItems = quickPick.selectedItems;
                if (selectedItems.length === 1) {
                    this.commandService.executeCommand(selectedItems[0].id);
                }
                quickPick.hide();
            }));
            // refresh the items when actions change
            const legacyItemUpdater = this.legacyIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(legacyItemUpdater.dispose);
            const itemUpdater = this.remoteIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
            quickPick.onDidHide(itemUpdater.dispose);
            quickPick.show();
        }
    };
    RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID = 'workbench.action.remote.showMenu';
    RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID = 'workbench.action.remote.close';
    RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID = !platform_1.isWeb; // web does not have a "Close Remote" command
    RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH = 40;
    RemoteStatusIndicator = __decorate([
        __param(0, statusbar_1.IStatusbarService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, label_1.ILabelService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_1.IMenuService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, commands_1.ICommandService),
        __param(7, extensions_1.IExtensionService),
        __param(8, remoteAgentService_1.IRemoteAgentService),
        __param(9, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(10, host_1.IHostService),
        __param(11, workspace_1.IWorkspaceContextService),
        __param(12, log_1.ILogService)
    ], RemoteStatusIndicator);
    exports.RemoteStatusIndicator = RemoteStatusIndicator;
});
//# sourceMappingURL=remoteIndicator.js.map