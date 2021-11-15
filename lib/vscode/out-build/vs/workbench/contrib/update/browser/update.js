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
define(["require", "exports", "vs/nls!vs/workbench/contrib/update/browser/update", "vs/base/common/severity", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/activity/common/activity", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/update/common/update", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/environment/common/environmentService", "./releaseNotesEditor", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/contrib/update/common/update", "vs/workbench/services/host/browser/host", "vs/platform/product/common/productService", "vs/platform/product/common/product", "vs/platform/userDataSync/common/userDataSync", "vs/platform/contextkey/common/contextkeys", "vs/base/common/async", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/event"], function (require, exports, nls, severity_1, actions_1, lifecycle_1, uri_1, activity_1, instantiation_1, opener_1, storage_1, update_1, notification_1, dialogs_1, environmentService_1, releaseNotesEditor_1, platform_1, configuration_1, contextkey_1, actions_2, commands_1, update_2, host_1, productService_1, product_1, userDataSync_1, contextkeys_1, async_1, userDataSync_2, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckForVSCodeUpdateAction = exports.SwitchProductQualityContribution = exports.UpdateContribution = exports.ProductContribution = exports.ShowCurrentReleaseNotesAction = exports.ShowReleaseNotesAction = exports.AbstractShowReleaseNotesAction = exports.OpenLatestReleaseNotesInBrowserAction = exports.CONTEXT_UPDATE_STATE = void 0;
    exports.CONTEXT_UPDATE_STATE = new contextkey_1.RawContextKey('updateState', "idle" /* Idle */);
    let releaseNotesManager = undefined;
    function showReleaseNotes(instantiationService, version) {
        if (!releaseNotesManager) {
            releaseNotesManager = instantiationService.createInstance(releaseNotesEditor_1.ReleaseNotesManager);
        }
        return instantiationService.invokeFunction(accessor => releaseNotesManager.show(accessor, version));
    }
    let OpenLatestReleaseNotesInBrowserAction = class OpenLatestReleaseNotesInBrowserAction extends actions_1.Action {
        constructor(openerService, productService) {
            super('update.openLatestReleaseNotes', nls.localize(0, null), undefined, true);
            this.openerService = openerService;
            this.productService = productService;
        }
        async run() {
            if (this.productService.releaseNotesUrl) {
                const uri = uri_1.URI.parse(this.productService.releaseNotesUrl);
                await this.openerService.open(uri);
            }
            else {
                throw new Error(nls.localize(1, null, this.productService.nameLong));
            }
        }
    };
    OpenLatestReleaseNotesInBrowserAction = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, productService_1.IProductService)
    ], OpenLatestReleaseNotesInBrowserAction);
    exports.OpenLatestReleaseNotesInBrowserAction = OpenLatestReleaseNotesInBrowserAction;
    let AbstractShowReleaseNotesAction = class AbstractShowReleaseNotesAction extends actions_1.Action {
        constructor(id, label, version, instantiationService) {
            super(id, label, undefined, true);
            this.version = version;
            this.instantiationService = instantiationService;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            this.enabled = false;
            try {
                await showReleaseNotes(this.instantiationService, this.version);
            }
            catch (err) {
                const action = this.instantiationService.createInstance(OpenLatestReleaseNotesInBrowserAction);
                try {
                    await action.run();
                }
                catch (err2) {
                    throw new Error(`${err.message} and ${err2.message}`);
                }
            }
        }
    };
    AbstractShowReleaseNotesAction = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], AbstractShowReleaseNotesAction);
    exports.AbstractShowReleaseNotesAction = AbstractShowReleaseNotesAction;
    let ShowReleaseNotesAction = class ShowReleaseNotesAction extends AbstractShowReleaseNotesAction {
        constructor(version, instantiationService) {
            super('update.showReleaseNotes', nls.localize(2, null), version, instantiationService);
        }
    };
    ShowReleaseNotesAction = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], ShowReleaseNotesAction);
    exports.ShowReleaseNotesAction = ShowReleaseNotesAction;
    let ShowCurrentReleaseNotesAction = class ShowCurrentReleaseNotesAction extends AbstractShowReleaseNotesAction {
        constructor(id = ShowCurrentReleaseNotesAction.ID, label = ShowCurrentReleaseNotesAction.LABEL, instantiationService, productService) {
            super(id, label, productService.version, instantiationService);
        }
    };
    ShowCurrentReleaseNotesAction.ID = update_2.ShowCurrentReleaseNotesActionId;
    ShowCurrentReleaseNotesAction.LABEL = nls.localize(3, null);
    ShowCurrentReleaseNotesAction.AVAILABE = !!product_1.default.releaseNotesUrl;
    ShowCurrentReleaseNotesAction = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, productService_1.IProductService)
    ], ShowCurrentReleaseNotesAction);
    exports.ShowCurrentReleaseNotesAction = ShowCurrentReleaseNotesAction;
    function parseVersion(version) {
        const match = /([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(version);
        if (!match) {
            return undefined;
        }
        return {
            major: parseInt(match[1]),
            minor: parseInt(match[2]),
            patch: parseInt(match[3])
        };
    }
    function isMajorMinorUpdate(before, after) {
        return before.major < after.major || before.minor < after.minor;
    }
    let ProductContribution = class ProductContribution {
        constructor(storageService, instantiationService, notificationService, environmentService, openerService, configurationService, hostService, productService) {
            hostService.hadLastFocus().then(async (hadLastFocus) => {
                if (!hadLastFocus) {
                    return;
                }
                const lastVersion = parseVersion(storageService.get(ProductContribution.KEY, 0 /* GLOBAL */, ''));
                const currentVersion = parseVersion(productService.version);
                const shouldShowReleaseNotes = configurationService.getValue('update.showReleaseNotes');
                const releaseNotesUrl = productService.releaseNotesUrl;
                // was there a major/minor update? if so, open release notes
                if (shouldShowReleaseNotes && !environmentService.skipReleaseNotes && releaseNotesUrl && lastVersion && currentVersion && isMajorMinorUpdate(lastVersion, currentVersion)) {
                    showReleaseNotes(instantiationService, productService.version)
                        .then(undefined, () => {
                        notificationService.prompt(severity_1.default.Info, nls.localize(4, null, productService.nameLong, productService.version), [{
                                label: nls.localize(5, null),
                                run: () => {
                                    const uri = uri_1.URI.parse(releaseNotesUrl);
                                    openerService.open(uri);
                                }
                            }], { sticky: true });
                    });
                }
                // should we show the new license?
                if (productService.licenseUrl && lastVersion && lastVersion.major < 1 && currentVersion && currentVersion.major >= 1) {
                    notificationService.info(nls.localize(6, null, productService.licenseUrl));
                }
                storageService.store(ProductContribution.KEY, productService.version, 0 /* GLOBAL */, 1 /* MACHINE */);
            });
        }
    };
    ProductContribution.KEY = 'releaseNotes/lastVersion';
    ProductContribution = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, opener_1.IOpenerService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, host_1.IHostService),
        __param(7, productService_1.IProductService)
    ], ProductContribution);
    exports.ProductContribution = ProductContribution;
    let UpdateContribution = class UpdateContribution extends lifecycle_1.Disposable {
        constructor(storageService, instantiationService, notificationService, dialogService, updateService, activityService, contextKeyService, productService, hostService) {
            super();
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.updateService = updateService;
            this.activityService = activityService;
            this.contextKeyService = contextKeyService;
            this.productService = productService;
            this.hostService = hostService;
            this.badgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.state = updateService.state;
            this.updateStateContextKey = exports.CONTEXT_UPDATE_STATE.bindTo(this.contextKeyService);
            this._register(updateService.onStateChange(this.onUpdateStateChange, this));
            this.onUpdateStateChange(this.updateService.state);
            /*
            The `update/lastKnownVersion` and `update/updateNotificationTime` storage keys are used in
            combination to figure out when to show a message to the user that he should update.
    
            This message should appear if the user has received an update notification but hasn't
            updated since 5 days.
            */
            const currentVersion = this.productService.commit;
            const lastKnownVersion = this.storageService.get('update/lastKnownVersion', 0 /* GLOBAL */);
            // if current version != stored version, clear both fields
            if (currentVersion !== lastKnownVersion) {
                this.storageService.remove('update/lastKnownVersion', 0 /* GLOBAL */);
                this.storageService.remove('update/updateNotificationTime', 0 /* GLOBAL */);
            }
            this.registerGlobalActivityActions();
        }
        async onUpdateStateChange(state) {
            this.updateStateContextKey.set(state.type);
            switch (state.type) {
                case "idle" /* Idle */:
                    if (state.error) {
                        this.onError(state.error);
                    }
                    else if (this.state.type === "checking for updates" /* CheckingForUpdates */ && this.state.explicit && await this.hostService.hadLastFocus()) {
                        this.onUpdateNotAvailable();
                    }
                    break;
                case "available for download" /* AvailableForDownload */:
                    this.onUpdateAvailable(state.update);
                    break;
                case "downloaded" /* Downloaded */:
                    this.onUpdateDownloaded(state.update);
                    break;
                case "updating" /* Updating */:
                    this.onUpdateUpdating(state.update);
                    break;
                case "ready" /* Ready */:
                    this.onUpdateReady(state.update);
                    break;
            }
            let badge = undefined;
            let clazz;
            let priority = undefined;
            if (state.type === "available for download" /* AvailableForDownload */ || state.type === "downloaded" /* Downloaded */ || state.type === "ready" /* Ready */) {
                badge = new activity_1.NumberBadge(1, () => nls.localize(7, null, this.productService.nameShort));
            }
            else if (state.type === "checking for updates" /* CheckingForUpdates */ || state.type === "downloading" /* Downloading */ || state.type === "updating" /* Updating */) {
                badge = new activity_1.ProgressBadge(() => nls.localize(8, null));
                clazz = 'progress-badge';
                priority = 1;
            }
            this.badgeDisposable.clear();
            if (badge) {
                this.badgeDisposable.value = this.activityService.showGlobalActivity({ badge, clazz, priority });
            }
            this.state = state;
        }
        onError(error) {
            if (/The request timed out|The network connection was lost/i.test(error)) {
                return;
            }
            error = error.replace(/See https:\/\/github\.com\/Squirrel\/Squirrel\.Mac\/issues\/182 for more information/, 'This might mean the application was put on quarantine by macOS. See [this link](https://github.com/microsoft/vscode/issues/7426#issuecomment-425093469) for more information');
            this.notificationService.notify({
                severity: notification_1.Severity.Error,
                message: error,
                source: nls.localize(9, null),
            });
        }
        onUpdateNotAvailable() {
            this.dialogService.show(severity_1.default.Info, nls.localize(10, null), [nls.localize(11, null)]);
        }
        // linux
        onUpdateAvailable(update) {
            if (!this.shouldShowNotification()) {
                return;
            }
            this.notificationService.prompt(severity_1.default.Info, nls.localize(12, null), [{
                    label: nls.localize(13, null),
                    run: () => this.updateService.downloadUpdate()
                }, {
                    label: nls.localize(14, null),
                    run: () => { }
                }, {
                    label: nls.localize(15, null),
                    run: () => {
                        const action = this.instantiationService.createInstance(ShowReleaseNotesAction, update.productVersion);
                        action.run();
                        action.dispose();
                    }
                }], { sticky: true });
        }
        // windows fast updates (target === system)
        onUpdateDownloaded(update) {
            if (!this.shouldShowNotification()) {
                return;
            }
            this.notificationService.prompt(severity_1.default.Info, nls.localize(16, null, this.productService.nameLong, update.productVersion), [{
                    label: nls.localize(17, null),
                    run: () => this.updateService.applyUpdate()
                }, {
                    label: nls.localize(18, null),
                    run: () => { }
                }, {
                    label: nls.localize(19, null),
                    run: () => {
                        const action = this.instantiationService.createInstance(ShowReleaseNotesAction, update.productVersion);
                        action.run();
                        action.dispose();
                    }
                }], { sticky: true });
        }
        // windows fast updates
        onUpdateUpdating(update) {
            if (platform_1.isWindows && this.productService.target === 'user') {
                return;
            }
            // windows fast updates (target === system)
            this.notificationService.prompt(severity_1.default.Info, nls.localize(20, null, this.productService.nameLong, update.productVersion), [], {
                neverShowAgain: { id: 'neverShowAgain:update/win32-fast-updates', isSecondary: true }
            });
        }
        // windows and mac
        onUpdateReady(update) {
            if (!(platform_1.isWindows && this.productService.target !== 'user') && !this.shouldShowNotification()) {
                return;
            }
            const actions = [{
                    label: nls.localize(21, null),
                    run: () => this.updateService.quitAndInstall()
                }, {
                    label: nls.localize(22, null),
                    run: () => { }
                }];
            // TODO@joao check why snap updates send `update` as falsy
            if (update.productVersion) {
                actions.push({
                    label: nls.localize(23, null),
                    run: () => {
                        const action = this.instantiationService.createInstance(ShowReleaseNotesAction, update.productVersion);
                        action.run();
                        action.dispose();
                    }
                });
            }
            // windows user fast updates and mac
            this.notificationService.prompt(severity_1.default.Info, nls.localize(24, null, this.productService.nameLong), actions, { sticky: true });
        }
        shouldShowNotification() {
            const currentVersion = this.productService.commit;
            const currentMillis = new Date().getTime();
            const lastKnownVersion = this.storageService.get('update/lastKnownVersion', 0 /* GLOBAL */);
            // if version != stored version, save version and date
            if (currentVersion !== lastKnownVersion) {
                this.storageService.store('update/lastKnownVersion', currentVersion, 0 /* GLOBAL */, 1 /* MACHINE */);
                this.storageService.store('update/updateNotificationTime', currentMillis, 0 /* GLOBAL */, 1 /* MACHINE */);
            }
            const updateNotificationMillis = this.storageService.getNumber('update/updateNotificationTime', 0 /* GLOBAL */, currentMillis);
            const diffDays = (currentMillis - updateNotificationMillis) / (1000 * 60 * 60 * 24);
            return diffDays > 5;
        }
        registerGlobalActivityActions() {
            commands_1.CommandsRegistry.registerCommand('update.check', () => this.updateService.checkForUpdates(true));
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.check',
                    title: nls.localize(25, null)
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("idle" /* Idle */)
            });
            commands_1.CommandsRegistry.registerCommand('update.checking', () => { });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.checking',
                    title: nls.localize(26, null),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("checking for updates" /* CheckingForUpdates */)
            });
            commands_1.CommandsRegistry.registerCommand('update.downloadNow', () => this.updateService.downloadUpdate());
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloadNow',
                    title: nls.localize(27, null)
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("available for download" /* AvailableForDownload */)
            });
            commands_1.CommandsRegistry.registerCommand('update.downloading', () => { });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.downloading',
                    title: nls.localize(28, null),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("downloading" /* Downloading */)
            });
            commands_1.CommandsRegistry.registerCommand('update.install', () => this.updateService.applyUpdate());
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.install',
                    title: nls.localize(29, null)
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("downloaded" /* Downloaded */)
            });
            commands_1.CommandsRegistry.registerCommand('update.updating', () => { });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.updating',
                    title: nls.localize(30, null),
                    precondition: contextkey_1.ContextKeyExpr.false()
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("updating" /* Updating */)
            });
            commands_1.CommandsRegistry.registerCommand('update.restart', () => this.updateService.quitAndInstall());
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '7_update',
                command: {
                    id: 'update.restart',
                    title: nls.localize(31, null)
                },
                when: exports.CONTEXT_UPDATE_STATE.isEqualTo("ready" /* Ready */)
            });
        }
    };
    UpdateContribution = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, dialogs_1.IDialogService),
        __param(4, update_1.IUpdateService),
        __param(5, activity_1.IActivityService),
        __param(6, contextkey_1.IContextKeyService),
        __param(7, productService_1.IProductService),
        __param(8, host_1.IHostService)
    ], UpdateContribution);
    exports.UpdateContribution = UpdateContribution;
    let SwitchProductQualityContribution = class SwitchProductQualityContribution extends lifecycle_1.Disposable {
        constructor(productService, environmentService) {
            super();
            this.productService = productService;
            this.environmentService = environmentService;
            this.registerGlobalActivityActions();
        }
        registerGlobalActivityActions() {
            var _a;
            const quality = this.productService.quality;
            const productQualityChangeHandler = (_a = this.environmentService.options) === null || _a === void 0 ? void 0 : _a.productQualityChangeHandler;
            if (productQualityChangeHandler && (quality === 'stable' || quality === 'insider')) {
                const newQuality = quality === 'stable' ? 'insider' : 'stable';
                const commandId = `update.switchQuality.${newQuality}`;
                const isSwitchingToInsiders = newQuality === 'insider';
                (0, actions_2.registerAction2)(class SwitchQuality extends actions_2.Action2 {
                    constructor() {
                        super({
                            id: commandId,
                            title: isSwitchingToInsiders ? nls.localize(32, null) : nls.localize(33, null),
                            precondition: contextkeys_1.IsWebContext,
                            menu: {
                                id: actions_2.MenuId.GlobalActivity,
                                when: contextkeys_1.IsWebContext,
                                group: '7_update',
                            }
                        });
                    }
                    async run(accessor) {
                        const dialogService = accessor.get(dialogs_1.IDialogService);
                        const userDataAutoSyncEnablementService = accessor.get(userDataSync_1.IUserDataAutoSyncEnablementService);
                        const userDataSyncStoreManagementService = accessor.get(userDataSync_1.IUserDataSyncStoreManagementService);
                        const storageService = accessor.get(storage_1.IStorageService);
                        const userDataSyncWorkbenchService = accessor.get(userDataSync_2.IUserDataSyncWorkbenchService);
                        const userDataSyncService = accessor.get(userDataSync_1.IUserDataSyncService);
                        const selectSettingsSyncServiceDialogShownKey = 'switchQuality.selectSettingsSyncServiceDialogShown';
                        const userDataSyncStore = userDataSyncStoreManagementService.userDataSyncStore;
                        let userDataSyncStoreType;
                        if (userDataSyncStore && isSwitchingToInsiders && userDataAutoSyncEnablementService.isEnabled()
                            && !storageService.getBoolean(selectSettingsSyncServiceDialogShownKey, 0 /* GLOBAL */, false)) {
                            userDataSyncStoreType = await this.selectSettingsSyncService(dialogService);
                            if (!userDataSyncStoreType) {
                                return;
                            }
                            storageService.store(selectSettingsSyncServiceDialogShownKey, true, 0 /* GLOBAL */, 0 /* USER */);
                            if (userDataSyncStoreType === 'stable') {
                                // Update the stable service type in the current window, so that it uses stable service after switched to insiders version (after reload).
                                await userDataSyncStoreManagementService.switch(userDataSyncStoreType);
                            }
                        }
                        const res = await dialogService.confirm({
                            type: 'info',
                            message: nls.localize(34, null),
                            detail: newQuality === 'insider' ?
                                nls.localize(35, null) :
                                nls.localize(36, null),
                            primaryButton: nls.localize(37, null)
                        });
                        if (res.confirmed) {
                            const promises = [];
                            // If sync is happening wait until it is finished before reload
                            if (userDataSyncService.status === "syncing" /* Syncing */) {
                                promises.push(event_1.Event.toPromise(event_1.Event.filter(userDataSyncService.onDidChangeStatus, status => status !== "syncing" /* Syncing */)));
                            }
                            // Synchronise the store type option in insiders service, so that other clients using insiders service are also updated.
                            if (isSwitchingToInsiders) {
                                promises.push(userDataSyncWorkbenchService.synchroniseUserDataSyncStoreType());
                            }
                            await async_1.Promises.settled(promises);
                            productQualityChangeHandler(newQuality);
                        }
                        else {
                            // Reset
                            if (userDataSyncStoreType) {
                                storageService.remove(selectSettingsSyncServiceDialogShownKey, 0 /* GLOBAL */);
                            }
                        }
                    }
                    async selectSettingsSyncService(dialogService) {
                        const res = await dialogService.show(notification_1.Severity.Info, nls.localize(38, null), [
                            nls.localize(39, null),
                            nls.localize(40, null),
                            nls.localize(41, null),
                        ], {
                            detail: nls.localize(42, null),
                            cancelId: 2
                        });
                        return res.choice === 0 ? 'insiders' : res.choice === 1 ? 'stable' : undefined;
                    }
                });
            }
        }
    };
    SwitchProductQualityContribution = __decorate([
        __param(0, productService_1.IProductService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], SwitchProductQualityContribution);
    exports.SwitchProductQualityContribution = SwitchProductQualityContribution;
    let CheckForVSCodeUpdateAction = class CheckForVSCodeUpdateAction extends actions_1.Action {
        constructor(id, label, updateService) {
            super(id, label, undefined, true);
            this.updateService = updateService;
        }
        run() {
            return this.updateService.checkForUpdates(true);
        }
    };
    CheckForVSCodeUpdateAction.ID = update_2.CheckForVSCodeUpdateActionId;
    CheckForVSCodeUpdateAction.LABEL = nls.localize(43, null);
    CheckForVSCodeUpdateAction = __decorate([
        __param(2, update_1.IUpdateService)
    ], CheckForVSCodeUpdateAction);
    exports.CheckForVSCodeUpdateAction = CheckForVSCodeUpdateAction;
});
//# sourceMappingURL=update.js.map