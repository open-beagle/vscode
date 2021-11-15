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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/userDataSync/browser/userDataSync", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/browser/codeeditor", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/contrib/logs/common/logConstants", "vs/workbench/contrib/output/common/output", "vs/workbench/services/activity/common/activity", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/preferences/common/preferences", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/base/common/date", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/platform/opener/common/opener", "vs/workbench/services/authentication/browser/authenticationService", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/descriptors", "vs/workbench/common/views", "vs/workbench/contrib/userDataSync/browser/userDataSyncViews", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/codicons", "vs/workbench/browser/parts/views/viewPaneContainer"], function (require, exports, actions_1, errors_1, event_1, lifecycle_1, resources_1, uri_1, editorExtensions_1, modelService_1, modeService_1, resolverService_1, nls_1, actions_2, commands_1, configuration_1, contextkey_1, dialogs_1, instantiation_1, notification_1, quickInput_1, telemetry_1, userDataSync_1, codeeditor_1, editor_1, diffEditorInput_1, Constants, output_1, activity_1, editorService_1, environmentService_1, preferences_1, userDataSyncAccount_1, date_1, productService_1, storage_1, opener_1, authenticationService_1, platform_1, descriptors_1, views_1, userDataSyncViews_1, userDataSync_2, codicons_1, viewPaneContainer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncWorkbenchContribution = void 0;
    const CONTEXT_CONFLICTS_SOURCES = new contextkey_1.RawContextKey('conflictsSources', '');
    const turnOnSyncCommand = { id: 'workbench.userDataSync.actions.turnOn', title: (0, nls_1.localize)(0, null, userDataSync_2.SYNC_TITLE) };
    const turnOffSyncCommand = { id: 'workbench.userDataSync.actions.turnOff', title: (0, nls_1.localize)(1, null, userDataSync_2.SYNC_TITLE) };
    const configureSyncCommand = { id: userDataSync_2.CONFIGURE_SYNC_COMMAND_ID, title: (0, nls_1.localize)(2, null, userDataSync_2.SYNC_TITLE) };
    const resolveSettingsConflictsCommand = { id: 'workbench.userDataSync.actions.resolveSettingsConflicts', title: (0, nls_1.localize)(3, null, userDataSync_2.SYNC_TITLE) };
    const resolveKeybindingsConflictsCommand = { id: 'workbench.userDataSync.actions.resolveKeybindingsConflicts', title: (0, nls_1.localize)(4, null, userDataSync_2.SYNC_TITLE) };
    const resolveSnippetsConflictsCommand = { id: 'workbench.userDataSync.actions.resolveSnippetsConflicts', title: (0, nls_1.localize)(5, null, userDataSync_2.SYNC_TITLE) };
    const syncNowCommand = {
        id: 'workbench.userDataSync.actions.syncNow',
        title: (0, nls_1.localize)(6, null, userDataSync_2.SYNC_TITLE),
        description(userDataSyncService) {
            if (userDataSyncService.status === "syncing" /* Syncing */) {
                return (0, nls_1.localize)(7, null);
            }
            if (userDataSyncService.lastSyncTime) {
                return (0, nls_1.localize)(8, null, (0, date_1.fromNow)(userDataSyncService.lastSyncTime, true));
            }
            return undefined;
        }
    };
    const showSyncSettingsCommand = { id: 'workbench.userDataSync.actions.settings', title: (0, nls_1.localize)(9, null, userDataSync_2.SYNC_TITLE), };
    const showSyncedDataCommand = { id: 'workbench.userDataSync.actions.showSyncedData', title: (0, nls_1.localize)(10, null, userDataSync_2.SYNC_TITLE), };
    const CONTEXT_TURNING_ON_STATE = new contextkey_1.RawContextKey('userDataSyncTurningOn', false);
    let UserDataSyncWorkbenchContribution = class UserDataSyncWorkbenchContribution extends lifecycle_1.Disposable {
        constructor(userDataSyncResourceEnablementService, userDataSyncService, userDataSyncWorkbenchService, contextKeyService, activityService, notificationService, editorService, environmentService, dialogService, quickInputService, instantiationService, outputService, authTokenService, userDataAutoSyncEnablementService, userDataAutoSyncService, textModelResolverService, preferencesService, telemetryService, productService, storageService, openerService, authenticationService, userDataSyncStoreManagementService, configurationService) {
            super();
            this.userDataSyncResourceEnablementService = userDataSyncResourceEnablementService;
            this.userDataSyncService = userDataSyncService;
            this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
            this.activityService = activityService;
            this.notificationService = notificationService;
            this.editorService = editorService;
            this.environmentService = environmentService;
            this.dialogService = dialogService;
            this.quickInputService = quickInputService;
            this.instantiationService = instantiationService;
            this.outputService = outputService;
            this.authTokenService = authTokenService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.preferencesService = preferencesService;
            this.telemetryService = telemetryService;
            this.productService = productService;
            this.storageService = storageService;
            this.openerService = openerService;
            this.authenticationService = authenticationService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.configurationService = configurationService;
            this.globalActivityBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.accountBadgeDisposable = this._register(new lifecycle_1.MutableDisposable());
            this.conflictsDisposables = new Map();
            this.invalidContentErrorDisposables = new Map();
            this._snippetsConflictsActionsDisposable = new lifecycle_1.DisposableStore();
            this.turningOnSyncContext = CONTEXT_TURNING_ON_STATE.bindTo(contextKeyService);
            this.conflictsSources = CONTEXT_CONFLICTS_SOURCES.bindTo(contextKeyService);
            if (userDataSyncWorkbenchService.enabled) {
                (0, userDataSync_1.registerConfiguration)();
                this.updateAccountBadge();
                this.updateGlobalActivityBadge();
                this.onDidChangeConflicts(this.userDataSyncService.conflicts);
                this._register(event_1.Event.any(event_1.Event.debounce(userDataSyncService.onDidChangeStatus, () => undefined, 500), this.userDataAutoSyncEnablementService.onDidChangeEnablement, this.userDataSyncWorkbenchService.onDidChangeAccountStatus)(() => {
                    this.updateAccountBadge();
                    this.updateGlobalActivityBadge();
                }));
                this._register(userDataSyncService.onDidChangeConflicts(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
                this._register(userDataAutoSyncEnablementService.onDidChangeEnablement(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
                this._register(userDataSyncService.onSyncErrors(errors => this.onSynchronizerErrors(errors)));
                this._register(userDataAutoSyncService.onError(error => this.onAutoSyncError(error)));
                this.registerActions();
                this.registerViews();
                textModelResolverService.registerTextModelContentProvider(userDataSync_1.USER_DATA_SYNC_SCHEME, instantiationService.createInstance(UserDataRemoteContentProvider));
                (0, editorExtensions_1.registerEditorContribution)(AcceptChangesContribution.ID, AcceptChangesContribution);
                this._register(event_1.Event.any(userDataSyncService.onDidChangeStatus, userDataAutoSyncEnablementService.onDidChangeEnablement)(() => this.turningOnSync = !userDataAutoSyncEnablementService.isEnabled() && userDataSyncService.status !== "idle" /* Idle */));
            }
        }
        get turningOnSync() {
            return !!this.turningOnSyncContext.get();
        }
        set turningOnSync(turningOn) {
            this.turningOnSyncContext.set(turningOn);
            this.updateGlobalActivityBadge();
        }
        onDidChangeConflicts(conflicts) {
            if (!this.userDataAutoSyncEnablementService.isEnabled()) {
                return;
            }
            this.updateGlobalActivityBadge();
            if (conflicts.length) {
                const conflictsSources = conflicts.map(([syncResource]) => syncResource);
                this.conflictsSources.set(conflictsSources.join(','));
                if (conflictsSources.indexOf("snippets" /* Snippets */) !== -1) {
                    this.registerShowSnippetsConflictsAction();
                }
                // Clear and dispose conflicts those were cleared
                this.conflictsDisposables.forEach((disposable, conflictsSource) => {
                    if (conflictsSources.indexOf(conflictsSource) === -1) {
                        disposable.dispose();
                        this.conflictsDisposables.delete(conflictsSource);
                    }
                });
                for (const [syncResource, conflicts] of this.userDataSyncService.conflicts) {
                    const conflictsEditorInputs = this.getConflictsEditorInputs(syncResource);
                    // close stale conflicts editor previews
                    if (conflictsEditorInputs.length) {
                        conflictsEditorInputs.forEach(input => {
                            if (!conflicts.some(({ previewResource }) => (0, resources_1.isEqual)(previewResource, input.primary.resource))) {
                                input.dispose();
                            }
                        });
                    }
                    // Show conflicts notification if not shown before
                    else if (!this.conflictsDisposables.has(syncResource)) {
                        const conflictsArea = (0, userDataSync_2.getSyncAreaLabel)(syncResource);
                        const handle = this.notificationService.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(11, null, conflictsArea.toLowerCase()), [
                            {
                                label: (0, nls_1.localize)(12, null),
                                run: () => {
                                    this.telemetryService.publicLog2('sync/handleConflicts', { source: syncResource, action: 'acceptLocal' });
                                    this.acceptLocal(syncResource, conflicts);
                                }
                            },
                            {
                                label: (0, nls_1.localize)(13, null),
                                run: () => {
                                    this.telemetryService.publicLog2('sync/handleConflicts', { source: syncResource, action: 'acceptRemote' });
                                    this.acceptRemote(syncResource, conflicts);
                                }
                            },
                            {
                                label: (0, nls_1.localize)(14, null),
                                run: () => {
                                    this.telemetryService.publicLog2('sync/showConflicts', { source: syncResource });
                                    this.handleConflicts([syncResource, conflicts]);
                                }
                            }
                        ], {
                            sticky: true
                        });
                        this.conflictsDisposables.set(syncResource, (0, lifecycle_1.toDisposable)(() => {
                            // close the conflicts warning notification
                            handle.close();
                            // close opened conflicts editor previews
                            const conflictsEditorInputs = this.getConflictsEditorInputs(syncResource);
                            if (conflictsEditorInputs.length) {
                                conflictsEditorInputs.forEach(input => input.dispose());
                            }
                            this.conflictsDisposables.delete(syncResource);
                        }));
                    }
                }
            }
            else {
                this.conflictsSources.reset();
                this.getAllConflictsEditorInputs().forEach(input => input.dispose());
                this.conflictsDisposables.forEach(disposable => disposable.dispose());
                this.conflictsDisposables.clear();
            }
        }
        async acceptRemote(syncResource, conflicts) {
            try {
                for (const conflict of conflicts) {
                    await this.userDataSyncService.accept(syncResource, conflict.remoteResource, undefined, this.userDataAutoSyncEnablementService.isEnabled());
                }
            }
            catch (e) {
                this.notificationService.error((0, nls_1.localize)(15, null, `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
            }
        }
        async acceptLocal(syncResource, conflicts) {
            try {
                for (const conflict of conflicts) {
                    await this.userDataSyncService.accept(syncResource, conflict.localResource, undefined, this.userDataAutoSyncEnablementService.isEnabled());
                }
            }
            catch (e) {
                this.notificationService.error((0, nls_1.localize)(16, null, `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
            }
        }
        onAutoSyncError(error) {
            var _a;
            switch (error.code) {
                case userDataSync_1.UserDataSyncErrorCode.SessionExpired:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)(17, null),
                        actions: {
                            primary: [new actions_1.Action('turn on sync', (0, nls_1.localize)(18, null), undefined, true, () => this.turnOn())]
                        }
                    });
                    break;
                case userDataSync_1.UserDataSyncErrorCode.TurnedOff:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Info,
                        message: (0, nls_1.localize)(19, null),
                        actions: {
                            primary: [new actions_1.Action('turn on sync', (0, nls_1.localize)(20, null), undefined, true, () => this.turnOn())]
                        }
                    });
                    break;
                case userDataSync_1.UserDataSyncErrorCode.TooLarge:
                    if (error.resource === "keybindings" /* Keybindings */ || error.resource === "settings" /* Settings */) {
                        this.disableSync(error.resource);
                        const sourceArea = (0, userDataSync_2.getSyncAreaLabel)(error.resource);
                        this.handleTooLargeError(error.resource, (0, nls_1.localize)(21, null, sourceArea.toLowerCase(), sourceArea.toLowerCase(), '100kb'), error);
                    }
                    break;
                case userDataSync_1.UserDataSyncErrorCode.IncompatibleLocalContent:
                case userDataSync_1.UserDataSyncErrorCode.Gone:
                case userDataSync_1.UserDataSyncErrorCode.UpgradeRequired:
                    const message = (0, nls_1.localize)(22, null, this.productService.version, this.productService.commit);
                    const operationId = error.operationId ? (0, nls_1.localize)(23, null, error.operationId) : undefined;
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: operationId ? `${message} ${operationId}` : message,
                    });
                    break;
                case userDataSync_1.UserDataSyncErrorCode.IncompatibleRemoteContent:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Error,
                        message: (0, nls_1.localize)(24, null),
                        actions: {
                            primary: [
                                new actions_1.Action('reset', (0, nls_1.localize)(25, null), undefined, true, () => this.userDataSyncWorkbenchService.resetSyncedData()),
                                new actions_1.Action('show synced data', (0, nls_1.localize)(26, null), undefined, true, () => this.userDataSyncWorkbenchService.showSyncActivity())
                            ]
                        }
                    });
                    return;
                case userDataSync_1.UserDataSyncErrorCode.ServiceChanged:
                    this.notificationService.notify({
                        severity: notification_1.Severity.Info,
                        message: ((_a = this.userDataSyncStoreManagementService.userDataSyncStore) === null || _a === void 0 ? void 0 : _a.type) === 'insiders' ?
                            (0, nls_1.localize)(27, null) :
                            (0, nls_1.localize)(28, null),
                    });
                    return;
                case userDataSync_1.UserDataSyncErrorCode.DefaultServiceChanged:
                    // Settings sync is using separate service
                    if (this.userDataAutoSyncEnablementService.isEnabled()) {
                        this.notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)(29, null),
                        });
                    }
                    // If settings sync got turned off then ask user to turn on sync again.
                    else {
                        this.notificationService.notify({
                            severity: notification_1.Severity.Info,
                            message: (0, nls_1.localize)(30, null, this.productService.nameLong),
                            actions: {
                                primary: [new actions_1.Action('turn on sync', (0, nls_1.localize)(31, null), undefined, true, () => this.turnOn())]
                            }
                        });
                    }
                    return;
            }
        }
        handleTooLargeError(resource, message, error) {
            const operationId = error.operationId ? (0, nls_1.localize)(32, null, error.operationId) : undefined;
            this.notificationService.notify({
                severity: notification_1.Severity.Error,
                message: operationId ? `${message} ${operationId}` : message,
                actions: {
                    primary: [new actions_1.Action('open sync file', (0, nls_1.localize)(33, null, (0, userDataSync_2.getSyncAreaLabel)(resource)), undefined, true, () => resource === "settings" /* Settings */ ? this.preferencesService.openGlobalSettings(true) : this.preferencesService.openGlobalKeybindingSettings(true))]
                }
            });
        }
        onSynchronizerErrors(errors) {
            if (errors.length) {
                for (const [source, error] of errors) {
                    switch (error.code) {
                        case userDataSync_1.UserDataSyncErrorCode.LocalInvalidContent:
                            this.handleInvalidContentError(source);
                            break;
                        default:
                            const disposable = this.invalidContentErrorDisposables.get(source);
                            if (disposable) {
                                disposable.dispose();
                                this.invalidContentErrorDisposables.delete(source);
                            }
                    }
                }
            }
            else {
                this.invalidContentErrorDisposables.forEach(disposable => disposable.dispose());
                this.invalidContentErrorDisposables.clear();
            }
        }
        handleInvalidContentError(source) {
            if (this.invalidContentErrorDisposables.has(source)) {
                return;
            }
            if (source !== "settings" /* Settings */ && source !== "keybindings" /* Keybindings */) {
                return;
            }
            const resource = source === "settings" /* Settings */ ? this.environmentService.settingsResource : this.environmentService.keybindingsResource;
            if ((0, resources_1.isEqual)(resource, editor_1.EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY }))) {
                // Do not show notification if the file in error is active
                return;
            }
            const errorArea = (0, userDataSync_2.getSyncAreaLabel)(source);
            const handle = this.notificationService.notify({
                severity: notification_1.Severity.Error,
                message: (0, nls_1.localize)(34, null, errorArea.toLowerCase()),
                actions: {
                    primary: [new actions_1.Action('open sync file', (0, nls_1.localize)(35, null, errorArea), undefined, true, () => source === "settings" /* Settings */ ? this.preferencesService.openGlobalSettings(true) : this.preferencesService.openGlobalKeybindingSettings(true))]
                }
            });
            this.invalidContentErrorDisposables.set(source, (0, lifecycle_1.toDisposable)(() => {
                // close the error warning notification
                handle.close();
                this.invalidContentErrorDisposables.delete(source);
            }));
        }
        async updateGlobalActivityBadge() {
            this.globalActivityBadgeDisposable.clear();
            let badge = undefined;
            let clazz;
            let priority = undefined;
            if (this.userDataSyncService.conflicts.length && this.userDataAutoSyncEnablementService.isEnabled()) {
                badge = new activity_1.NumberBadge(this.userDataSyncService.conflicts.reduce((result, [, conflicts]) => { return result + conflicts.length; }, 0), () => (0, nls_1.localize)(36, null, userDataSync_2.SYNC_TITLE));
            }
            else if (this.turningOnSync) {
                badge = new activity_1.ProgressBadge(() => (0, nls_1.localize)(37, null));
                clazz = 'progress-badge';
                priority = 1;
            }
            if (badge) {
                this.globalActivityBadgeDisposable.value = this.activityService.showGlobalActivity({ badge, clazz, priority });
            }
        }
        async updateAccountBadge() {
            this.accountBadgeDisposable.clear();
            let badge = undefined;
            if (this.userDataSyncService.status !== "uninitialized" /* Uninitialized */ && this.userDataAutoSyncEnablementService.isEnabled() && this.userDataSyncWorkbenchService.accountStatus === "unavailable" /* Unavailable */) {
                badge = new activity_1.NumberBadge(1, () => (0, nls_1.localize)(38, null));
            }
            if (badge) {
                this.accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge, clazz: undefined, priority: undefined });
            }
        }
        async turnOn() {
            var _a;
            try {
                if (!this.userDataSyncWorkbenchService.authenticationProviders.length) {
                    throw new Error((0, nls_1.localize)(39, null));
                }
                if (!this.storageService.getBoolean('sync.donotAskPreviewConfirmation', 0 /* GLOBAL */, false)) {
                    if (!await this.askForConfirmation()) {
                        return;
                    }
                }
                const turnOn = await this.askToConfigure();
                if (!turnOn) {
                    return;
                }
                if ((_a = this.userDataSyncStoreManagementService.userDataSyncStore) === null || _a === void 0 ? void 0 : _a.canSwitch) {
                    await this.selectSettingsSyncService(this.userDataSyncStoreManagementService.userDataSyncStore);
                }
                await this.userDataSyncWorkbenchService.turnOn();
                this.storageService.store('sync.donotAskPreviewConfirmation', true, 0 /* GLOBAL */, 1 /* MACHINE */);
            }
            catch (e) {
                if ((0, errors_1.isPromiseCanceledError)(e)) {
                    return;
                }
                if (e instanceof userDataSync_1.UserDataSyncError) {
                    switch (e.code) {
                        case userDataSync_1.UserDataSyncErrorCode.TooLarge:
                            if (e.resource === "keybindings" /* Keybindings */ || e.resource === "settings" /* Settings */) {
                                this.handleTooLargeError(e.resource, (0, nls_1.localize)(40, null, (0, userDataSync_2.getSyncAreaLabel)(e.resource).toLowerCase(), '100kb'), e);
                                return;
                            }
                            break;
                        case userDataSync_1.UserDataSyncErrorCode.IncompatibleLocalContent:
                        case userDataSync_1.UserDataSyncErrorCode.Gone:
                        case userDataSync_1.UserDataSyncErrorCode.UpgradeRequired:
                            const message = (0, nls_1.localize)(41, null, this.productService.version, this.productService.commit);
                            const operationId = e.operationId ? (0, nls_1.localize)(42, null, e.operationId) : undefined;
                            this.notificationService.notify({
                                severity: notification_1.Severity.Error,
                                message: operationId ? `${message} ${operationId}` : message,
                            });
                            return;
                        case userDataSync_1.UserDataSyncErrorCode.IncompatibleRemoteContent:
                            this.notificationService.notify({
                                severity: notification_1.Severity.Error,
                                message: (0, nls_1.localize)(43, null),
                                actions: {
                                    primary: [
                                        new actions_1.Action('reset', (0, nls_1.localize)(44, null), undefined, true, () => this.userDataSyncWorkbenchService.resetSyncedData()),
                                        new actions_1.Action('show synced data', (0, nls_1.localize)(45, null), undefined, true, () => this.userDataSyncWorkbenchService.showSyncActivity())
                                    ]
                                }
                            });
                            return;
                        case userDataSync_1.UserDataSyncErrorCode.Unauthorized:
                            this.notificationService.error((0, nls_1.localize)(46, null));
                            return;
                    }
                    this.notificationService.error((0, nls_1.localize)(47, null, `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
                }
                else {
                    this.notificationService.error((0, nls_1.localize)(48, null, (0, errors_1.getErrorMessage)(e)));
                }
            }
        }
        async askForConfirmation() {
            const result = await this.dialogService.show(notification_1.Severity.Info, (0, nls_1.localize)(49, null), [
                (0, nls_1.localize)(50, null),
                (0, nls_1.localize)(51, null),
                (0, nls_1.localize)(52, null),
            ], {
                cancelId: 2
            });
            switch (result.choice) {
                case 1:
                    this.openerService.open(uri_1.URI.parse('https://aka.ms/vscode-settings-sync-help'));
                    return false;
                case 2: return false;
            }
            return true;
        }
        async askToConfigure() {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                disposables.add(quickPick);
                quickPick.title = userDataSync_2.SYNC_TITLE;
                quickPick.ok = false;
                quickPick.customButton = true;
                quickPick.customLabel = (0, nls_1.localize)(53, null);
                quickPick.description = (0, nls_1.localize)(54, null);
                quickPick.canSelectMany = true;
                quickPick.ignoreFocusOut = true;
                quickPick.hideInput = true;
                quickPick.hideCheckAll = true;
                const items = this.getConfigureSyncQuickPickItems();
                quickPick.items = items;
                quickPick.selectedItems = items.filter(item => this.userDataSyncResourceEnablementService.isResourceEnabled(item.id));
                let accepted = false;
                disposables.add(event_1.Event.any(quickPick.onDidAccept, quickPick.onDidCustom)(() => {
                    accepted = true;
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    try {
                        if (accepted) {
                            this.updateConfiguration(items, quickPick.selectedItems);
                        }
                        c(accepted);
                    }
                    catch (error) {
                        e(error);
                    }
                    finally {
                        disposables.dispose();
                    }
                }));
                quickPick.show();
            });
        }
        getConfigureSyncQuickPickItems() {
            return [{
                    id: "settings" /* Settings */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("settings" /* Settings */)
                }, {
                    id: "keybindings" /* Keybindings */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("keybindings" /* Keybindings */),
                    description: this.configurationService.getValue('settingsSync.keybindingsPerPlatform') ? (0, nls_1.localize)(55, null) : undefined
                }, {
                    id: "snippets" /* Snippets */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("snippets" /* Snippets */)
                }, {
                    id: "extensions" /* Extensions */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("extensions" /* Extensions */)
                }, {
                    id: "globalState" /* GlobalState */,
                    label: (0, userDataSync_2.getSyncAreaLabel)("globalState" /* GlobalState */),
                }];
        }
        updateConfiguration(items, selectedItems) {
            for (const item of items) {
                const wasEnabled = this.userDataSyncResourceEnablementService.isResourceEnabled(item.id);
                const isEnabled = !!selectedItems.filter(selected => selected.id === item.id)[0];
                if (wasEnabled !== isEnabled) {
                    this.userDataSyncResourceEnablementService.setResourceEnablement(item.id, isEnabled);
                }
            }
        }
        async configureSyncOptions() {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                disposables.add(quickPick);
                quickPick.title = (0, nls_1.localize)(56, null, userDataSync_2.SYNC_TITLE);
                quickPick.placeholder = (0, nls_1.localize)(57, null);
                quickPick.canSelectMany = true;
                quickPick.ignoreFocusOut = true;
                quickPick.ok = true;
                const items = this.getConfigureSyncQuickPickItems();
                quickPick.items = items;
                quickPick.selectedItems = items.filter(item => this.userDataSyncResourceEnablementService.isResourceEnabled(item.id));
                disposables.add(quickPick.onDidAccept(async () => {
                    if (quickPick.selectedItems.length) {
                        this.updateConfiguration(items, quickPick.selectedItems);
                        quickPick.hide();
                    }
                }));
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c();
                }));
                quickPick.show();
            });
        }
        async turnOff() {
            const result = await this.dialogService.confirm({
                type: 'info',
                message: (0, nls_1.localize)(58, null),
                detail: (0, nls_1.localize)(59, null),
                primaryButton: (0, nls_1.localize)(60, null),
                checkbox: this.userDataSyncWorkbenchService.accountStatus === "available" /* Available */ ? {
                    label: (0, nls_1.localize)(61, null)
                } : undefined
            });
            if (result.confirmed) {
                return this.userDataSyncWorkbenchService.turnoff(!!result.checkboxChecked);
            }
        }
        disableSync(source) {
            switch (source) {
                case "settings" /* Settings */: return this.userDataSyncResourceEnablementService.setResourceEnablement("settings" /* Settings */, false);
                case "keybindings" /* Keybindings */: return this.userDataSyncResourceEnablementService.setResourceEnablement("keybindings" /* Keybindings */, false);
                case "snippets" /* Snippets */: return this.userDataSyncResourceEnablementService.setResourceEnablement("snippets" /* Snippets */, false);
                case "extensions" /* Extensions */: return this.userDataSyncResourceEnablementService.setResourceEnablement("extensions" /* Extensions */, false);
                case "globalState" /* GlobalState */: return this.userDataSyncResourceEnablementService.setResourceEnablement("globalState" /* GlobalState */, false);
            }
        }
        getConflictsEditorInputs(syncResource) {
            return this.editorService.editors.filter(input => {
                const resource = input instanceof diffEditorInput_1.DiffEditorInput ? input.primary.resource : input.resource;
                return resource && (0, userDataSync_1.getSyncResourceFromLocalPreview)(resource, this.environmentService) === syncResource;
            });
        }
        getAllConflictsEditorInputs() {
            return this.editorService.editors.filter(input => {
                const resource = input instanceof diffEditorInput_1.DiffEditorInput ? input.primary.resource : input.resource;
                return resource && (0, userDataSync_1.getSyncResourceFromLocalPreview)(resource, this.environmentService) !== undefined;
            });
        }
        async handleSyncResourceConflicts(resource) {
            const syncResourceCoflicts = this.userDataSyncService.conflicts.filter(([syncResource]) => syncResource === resource)[0];
            if (syncResourceCoflicts) {
                this.handleConflicts(syncResourceCoflicts);
            }
        }
        async handleConflicts([syncResource, conflicts]) {
            for (const conflict of conflicts) {
                const leftResourceName = (0, nls_1.localize)(62, null, (0, resources_1.basename)(conflict.remoteResource));
                const rightResourceName = (0, nls_1.localize)(63, null, (0, resources_1.basename)(conflict.previewResource));
                await this.editorService.openEditor({
                    leftResource: conflict.remoteResource,
                    rightResource: conflict.previewResource,
                    label: (0, nls_1.localize)(64, null, leftResourceName, rightResourceName),
                    description: (0, nls_1.localize)(65, null),
                    options: {
                        preserveFocus: false,
                        pinned: true,
                        revealIfVisible: true,
                    },
                });
            }
        }
        showSyncActivity() {
            return this.outputService.showChannel(Constants.userDataSyncLogChannelId);
        }
        async selectSettingsSyncService(userDataSyncStore) {
            return new Promise((c, e) => {
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = disposables.add(this.quickInputService.createQuickPick());
                quickPick.title = (0, nls_1.localize)(66, null, userDataSync_2.SYNC_TITLE);
                quickPick.description = (0, nls_1.localize)(67, null);
                quickPick.hideInput = true;
                quickPick.ignoreFocusOut = true;
                const getDescription = (url) => {
                    const isDefault = (0, resources_1.isEqual)(url, userDataSyncStore.defaultUrl);
                    if (isDefault) {
                        return (0, nls_1.localize)(68, null);
                    }
                    return undefined;
                };
                quickPick.items = [
                    {
                        id: 'insiders',
                        label: (0, nls_1.localize)(69, null),
                        description: getDescription(userDataSyncStore.insidersUrl)
                    },
                    {
                        id: 'stable',
                        label: (0, nls_1.localize)(70, null),
                        description: getDescription(userDataSyncStore.stableUrl)
                    }
                ];
                disposables.add(quickPick.onDidAccept(async () => {
                    try {
                        await this.userDataSyncStoreManagementService.switch(quickPick.selectedItems[0].id);
                        c();
                    }
                    catch (error) {
                        e(error);
                    }
                    finally {
                        quickPick.hide();
                    }
                }));
                disposables.add(quickPick.onDidHide(() => disposables.dispose()));
                quickPick.show();
            });
        }
        registerActions() {
            if (this.userDataAutoSyncEnablementService.canToggleEnablement()) {
                this.registerTurnOnSyncAction();
                this.registerTurnOffSyncAction();
            }
            this.registerTurninOnSyncAction();
            this.registerSignInAction(); // When Sync is turned on from CLI
            this.registerShowSettingsConflictsAction();
            this.registerShowKeybindingsConflictsAction();
            this.registerShowSnippetsConflictsAction();
            this.registerEnableSyncViewsAction();
            this.registerManageSyncAction();
            this.registerSyncNowAction();
            this.registerConfigureSyncAction();
            this.registerShowSettingsAction();
            this.registerShowLogAction();
            this.registerResetSyncDataAction();
        }
        registerTurnOnSyncAction() {
            const turnOnSyncWhenContext = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT.toNegated(), userDataSync_2.CONTEXT_ACCOUNT_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_TURNING_ON_STATE.negate());
            commands_1.CommandsRegistry.registerCommand(turnOnSyncCommand.id, () => this.turnOn());
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '5_sync',
                command: {
                    id: turnOnSyncCommand.id,
                    title: (0, nls_1.localize)(71, null)
                },
                when: turnOnSyncWhenContext,
                order: 1
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
                command: turnOnSyncCommand,
                when: turnOnSyncWhenContext,
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarPreferencesMenu, {
                group: '5_sync',
                command: {
                    id: turnOnSyncCommand.id,
                    title: (0, nls_1.localize)(72, null)
                },
                when: turnOnSyncWhenContext,
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.AccountsContext, {
                group: '1_sync',
                command: {
                    id: turnOnSyncCommand.id,
                    title: (0, nls_1.localize)(73, null)
                },
                when: turnOnSyncWhenContext
            });
        }
        registerTurninOnSyncAction() {
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT.toNegated(), userDataSync_2.CONTEXT_ACCOUNT_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_TURNING_ON_STATE);
            this._register((0, actions_2.registerAction2)(class TurningOnSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.turningOn',
                        title: (0, nls_1.localize)(74, null),
                        precondition: contextkey_1.ContextKeyExpr.false(),
                        menu: [{
                                group: '5_sync',
                                id: actions_2.MenuId.GlobalActivity,
                                when,
                                order: 2
                            }, {
                                group: '1_sync',
                                id: actions_2.MenuId.AccountsContext,
                                when,
                            }]
                    });
                }
                async run() { }
            }));
        }
        registerSignInAction() {
            const that = this;
            const id = 'workbench.userData.actions.signin';
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT, userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("unavailable" /* Unavailable */));
            this._register((0, actions_2.registerAction2)(class StopSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userData.actions.signin',
                        title: (0, nls_1.localize)(75, null),
                        menu: {
                            group: '5_sync',
                            id: actions_2.MenuId.GlobalActivity,
                            when,
                            order: 2
                        }
                    });
                }
                async run() {
                    try {
                        await that.userDataSyncWorkbenchService.signIn();
                    }
                    catch (e) {
                        that.notificationService.error(e);
                    }
                }
            }));
            this._register(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.AccountsContext, {
                group: '1_sync',
                command: {
                    id,
                    title: (0, nls_1.localize)(76, null),
                },
                when
            }));
        }
        registerShowSettingsConflictsAction() {
            const resolveSettingsConflictsWhenContext = contextkey_1.ContextKeyExpr.regex(CONTEXT_CONFLICTS_SOURCES.keys()[0], /.*settings.*/i);
            commands_1.CommandsRegistry.registerCommand(resolveSettingsConflictsCommand.id, () => this.handleSyncResourceConflicts("settings" /* Settings */));
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '5_sync',
                command: {
                    id: resolveSettingsConflictsCommand.id,
                    title: (0, nls_1.localize)(77, null, userDataSync_2.SYNC_TITLE),
                },
                when: resolveSettingsConflictsWhenContext,
                order: 2
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarPreferencesMenu, {
                group: '5_sync',
                command: {
                    id: resolveSettingsConflictsCommand.id,
                    title: (0, nls_1.localize)(78, null, userDataSync_2.SYNC_TITLE),
                },
                when: resolveSettingsConflictsWhenContext,
                order: 2
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
                command: resolveSettingsConflictsCommand,
                when: resolveSettingsConflictsWhenContext,
            });
        }
        registerShowKeybindingsConflictsAction() {
            const resolveKeybindingsConflictsWhenContext = contextkey_1.ContextKeyExpr.regex(CONTEXT_CONFLICTS_SOURCES.keys()[0], /.*keybindings.*/i);
            commands_1.CommandsRegistry.registerCommand(resolveKeybindingsConflictsCommand.id, () => this.handleSyncResourceConflicts("keybindings" /* Keybindings */));
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '5_sync',
                command: {
                    id: resolveKeybindingsConflictsCommand.id,
                    title: (0, nls_1.localize)(79, null, userDataSync_2.SYNC_TITLE),
                },
                when: resolveKeybindingsConflictsWhenContext,
                order: 2
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarPreferencesMenu, {
                group: '5_sync',
                command: {
                    id: resolveKeybindingsConflictsCommand.id,
                    title: (0, nls_1.localize)(80, null, userDataSync_2.SYNC_TITLE),
                },
                when: resolveKeybindingsConflictsWhenContext,
                order: 2
            });
            actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
                command: resolveKeybindingsConflictsCommand,
                when: resolveKeybindingsConflictsWhenContext,
            });
        }
        registerShowSnippetsConflictsAction() {
            var _a;
            this._snippetsConflictsActionsDisposable.clear();
            const resolveSnippetsConflictsWhenContext = contextkey_1.ContextKeyExpr.regex(CONTEXT_CONFLICTS_SOURCES.keys()[0], /.*snippets.*/i);
            const conflicts = (_a = this.userDataSyncService.conflicts.filter(([syncResource]) => syncResource === "snippets" /* Snippets */)[0]) === null || _a === void 0 ? void 0 : _a[1];
            this._snippetsConflictsActionsDisposable.add(commands_1.CommandsRegistry.registerCommand(resolveSnippetsConflictsCommand.id, () => this.handleSyncResourceConflicts("snippets" /* Snippets */)));
            this._snippetsConflictsActionsDisposable.add(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.GlobalActivity, {
                group: '5_sync',
                command: {
                    id: resolveSnippetsConflictsCommand.id,
                    title: (0, nls_1.localize)(81, null, userDataSync_2.SYNC_TITLE, (conflicts === null || conflicts === void 0 ? void 0 : conflicts.length) || 1),
                },
                when: resolveSnippetsConflictsWhenContext,
                order: 2
            }));
            this._snippetsConflictsActionsDisposable.add(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarPreferencesMenu, {
                group: '5_sync',
                command: {
                    id: resolveSnippetsConflictsCommand.id,
                    title: (0, nls_1.localize)(82, null, userDataSync_2.SYNC_TITLE, (conflicts === null || conflicts === void 0 ? void 0 : conflicts.length) || 1),
                },
                when: resolveSnippetsConflictsWhenContext,
                order: 2
            }));
            this._snippetsConflictsActionsDisposable.add(actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, {
                command: resolveSnippetsConflictsCommand,
                when: resolveSnippetsConflictsWhenContext,
            }));
        }
        registerManageSyncAction() {
            const that = this;
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_ENABLEMENT, userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */));
            this._register((0, actions_2.registerAction2)(class SyncStatusAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.userDataSync.actions.manage',
                        title: (0, nls_1.localize)(83, null),
                        menu: [
                            {
                                id: actions_2.MenuId.GlobalActivity,
                                group: '5_sync',
                                when,
                                order: 3
                            },
                            {
                                id: actions_2.MenuId.MenubarPreferencesMenu,
                                group: '5_sync',
                                when,
                                order: 3,
                            },
                            {
                                id: actions_2.MenuId.AccountsContext,
                                group: '1_sync',
                                when,
                            }
                        ],
                    });
                }
                run(accessor) {
                    return new Promise((c, e) => {
                        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                        const commandService = accessor.get(commands_1.ICommandService);
                        const disposables = new lifecycle_1.DisposableStore();
                        const quickPick = quickInputService.createQuickPick();
                        disposables.add(quickPick);
                        const items = [];
                        if (that.userDataSyncService.conflicts.length) {
                            for (const [syncResource] of that.userDataSyncService.conflicts) {
                                switch (syncResource) {
                                    case "settings" /* Settings */:
                                        items.push({ id: resolveSettingsConflictsCommand.id, label: resolveSettingsConflictsCommand.title });
                                        break;
                                    case "keybindings" /* Keybindings */:
                                        items.push({ id: resolveKeybindingsConflictsCommand.id, label: resolveKeybindingsConflictsCommand.title });
                                        break;
                                    case "snippets" /* Snippets */:
                                        items.push({ id: resolveSnippetsConflictsCommand.id, label: resolveSnippetsConflictsCommand.title });
                                        break;
                                }
                            }
                            items.push({ type: 'separator' });
                        }
                        items.push({ id: configureSyncCommand.id, label: configureSyncCommand.title });
                        items.push({ id: showSyncSettingsCommand.id, label: showSyncSettingsCommand.title });
                        items.push({ id: showSyncedDataCommand.id, label: showSyncedDataCommand.title });
                        items.push({ type: 'separator' });
                        items.push({ id: syncNowCommand.id, label: syncNowCommand.title, description: syncNowCommand.description(that.userDataSyncService) });
                        if (that.userDataAutoSyncEnablementService.canToggleEnablement()) {
                            const account = that.userDataSyncWorkbenchService.current;
                            items.push({ id: turnOffSyncCommand.id, label: turnOffSyncCommand.title, description: account ? `${account.accountName} (${that.authenticationService.getLabel(account.authenticationProviderId)})` : undefined });
                        }
                        quickPick.items = items;
                        disposables.add(quickPick.onDidAccept(() => {
                            if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
                                commandService.executeCommand(quickPick.selectedItems[0].id);
                            }
                            quickPick.hide();
                        }));
                        disposables.add(quickPick.onDidHide(() => {
                            disposables.dispose();
                            c();
                        }));
                        quickPick.show();
                    });
                }
            }));
        }
        registerEnableSyncViewsAction() {
            const that = this;
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */));
            this._register((0, actions_2.registerAction2)(class SyncStatusAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: showSyncedDataCommand.id,
                        title: { value: (0, nls_1.localize)(84, null), original: `Show Synced Data` },
                        category: { value: userDataSync_2.SYNC_TITLE, original: `Settings Sync` },
                        precondition: when,
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when
                        }
                    });
                }
                run(accessor) {
                    return that.userDataSyncWorkbenchService.showSyncActivity();
                }
            }));
        }
        registerSyncNowAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class SyncNowAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: syncNowCommand.id,
                        title: syncNowCommand.title,
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_ENABLEMENT, userDataSync_2.CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */))
                        }
                    });
                }
                run(accessor) {
                    return that.userDataSyncWorkbenchService.syncNow();
                }
            }));
        }
        registerTurnOffSyncAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class StopSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: turnOffSyncCommand.id,
                        title: turnOffSyncCommand.title,
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT),
                        },
                    });
                }
                async run() {
                    try {
                        await that.turnOff();
                    }
                    catch (e) {
                        if (!(0, errors_1.isPromiseCanceledError)(e)) {
                            that.notificationService.error((0, nls_1.localize)(85, null, `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
                        }
                    }
                }
            }));
        }
        registerConfigureSyncAction() {
            const that = this;
            const when = contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), userDataSync_2.CONTEXT_SYNC_ENABLEMENT);
            this._register((0, actions_2.registerAction2)(class ConfigureSyncAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: configureSyncCommand.id,
                        title: configureSyncCommand.title,
                        icon: codicons_1.Codicon.settingsGear,
                        tooltip: (0, nls_1.localize)(86, null),
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when
                            }, {
                                id: actions_2.MenuId.ViewContainerTitle,
                                when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID),
                                group: 'navigation',
                                order: 2
                            }]
                    });
                }
                run() { return that.configureSyncOptions(); }
            }));
        }
        registerShowLogAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class ShowSyncActivityAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID,
                        title: (0, nls_1.localize)(87, null, userDataSync_2.SYNC_TITLE),
                        tooltip: (0, nls_1.localize)(88, null),
                        icon: codicons_1.Codicon.output,
                        menu: [{
                                id: actions_2.MenuId.CommandPalette,
                                when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */)),
                            }, {
                                id: actions_2.MenuId.ViewContainerTitle,
                                when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID),
                                group: 'navigation',
                                order: 1
                            }],
                    });
                }
                run() { return that.showSyncActivity(); }
            }));
        }
        registerShowSettingsAction() {
            this._register((0, actions_2.registerAction2)(class ShowSyncSettingsAction extends actions_2.Action2 {
                constructor() {
                    super({
                        id: showSyncSettingsCommand.id,
                        title: showSyncSettingsCommand.title,
                        menu: {
                            id: actions_2.MenuId.CommandPalette,
                            when: contextkey_1.ContextKeyExpr.and(userDataSync_2.CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */)),
                        },
                    });
                }
                run(accessor) {
                    accessor.get(preferences_1.IPreferencesService).openGlobalSettings(false, { query: '@tag:sync' });
                }
            }));
        }
        registerViews() {
            const container = this.registerViewContainer();
            this.registerDataViews(container);
        }
        registerViewContainer() {
            return platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
                id: userDataSync_2.SYNC_VIEW_CONTAINER_ID,
                title: userDataSync_2.SYNC_TITLE,
                ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [userDataSync_2.SYNC_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
                icon: userDataSync_2.SYNC_VIEW_ICON,
                hideIfEmpty: true,
            }, 0 /* Sidebar */);
        }
        registerResetSyncDataAction() {
            const that = this;
            this._register((0, actions_2.registerAction2)(class extends actions_2.Action2 {
                constructor() {
                    super({
                        id: 'workbench.actions.syncData.reset',
                        title: (0, nls_1.localize)(89, null),
                        menu: [{
                                id: actions_2.MenuId.ViewContainerTitle,
                                when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', userDataSync_2.SYNC_VIEW_CONTAINER_ID)
                            }],
                    });
                }
                run() { return that.userDataSyncWorkbenchService.resetSyncedData(); }
            }));
        }
        registerDataViews(container) {
            this._register(this.instantiationService.createInstance(userDataSyncViews_1.UserDataSyncDataViews, container));
        }
    };
    UserDataSyncWorkbenchContribution = __decorate([
        __param(0, userDataSync_1.IUserDataSyncResourceEnablementService),
        __param(1, userDataSync_1.IUserDataSyncService),
        __param(2, userDataSync_2.IUserDataSyncWorkbenchService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, activity_1.IActivityService),
        __param(5, notification_1.INotificationService),
        __param(6, editorService_1.IEditorService),
        __param(7, environmentService_1.IWorkbenchEnvironmentService),
        __param(8, dialogs_1.IDialogService),
        __param(9, quickInput_1.IQuickInputService),
        __param(10, instantiation_1.IInstantiationService),
        __param(11, output_1.IOutputService),
        __param(12, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(13, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(14, userDataSync_1.IUserDataAutoSyncService),
        __param(15, resolverService_1.ITextModelService),
        __param(16, preferences_1.IPreferencesService),
        __param(17, telemetry_1.ITelemetryService),
        __param(18, productService_1.IProductService),
        __param(19, storage_1.IStorageService),
        __param(20, opener_1.IOpenerService),
        __param(21, authenticationService_1.IAuthenticationService),
        __param(22, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(23, configuration_1.IConfigurationService)
    ], UserDataSyncWorkbenchContribution);
    exports.UserDataSyncWorkbenchContribution = UserDataSyncWorkbenchContribution;
    let UserDataRemoteContentProvider = class UserDataRemoteContentProvider {
        constructor(userDataSyncService, modelService, modeService) {
            this.userDataSyncService = userDataSyncService;
            this.modelService = modelService;
            this.modeService = modeService;
        }
        provideTextContent(uri) {
            if (uri.scheme === userDataSync_1.USER_DATA_SYNC_SCHEME) {
                return this.userDataSyncService.resolveContent(uri).then(content => this.modelService.createModel(content || '', this.modeService.create('jsonc'), uri));
            }
            return null;
        }
    };
    UserDataRemoteContentProvider = __decorate([
        __param(0, userDataSync_1.IUserDataSyncService),
        __param(1, modelService_1.IModelService),
        __param(2, modeService_1.IModeService)
    ], UserDataRemoteContentProvider);
    let AcceptChangesContribution = class AcceptChangesContribution extends lifecycle_1.Disposable {
        constructor(editor, instantiationService, userDataSyncService, notificationService, dialogService, configurationService, telemetryService, userDataAutoSyncEnablementService) {
            super();
            this.editor = editor;
            this.instantiationService = instantiationService;
            this.userDataSyncService = userDataSyncService;
            this.notificationService = notificationService;
            this.dialogService = dialogService;
            this.configurationService = configurationService;
            this.telemetryService = telemetryService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.update();
            this.registerListeners();
        }
        static get(editor) {
            return editor.getContribution(AcceptChangesContribution.ID);
        }
        registerListeners() {
            this._register(this.editor.onDidChangeModel(() => this.update()));
            this._register(this.userDataSyncService.onDidChangeConflicts(() => this.update()));
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('diffEditor.renderSideBySide'))(() => this.update()));
        }
        update() {
            if (!this.shouldShowButton(this.editor)) {
                this.disposeAcceptChangesWidgetRenderer();
                return;
            }
            this.createAcceptChangesWidgetRenderer();
        }
        shouldShowButton(editor) {
            const model = editor.getModel();
            if (!model) {
                return false; // we need a model
            }
            if (!this.userDataAutoSyncEnablementService.isEnabled()) {
                return false;
            }
            const syncResourceConflicts = this.getSyncResourceConflicts(model.uri);
            if (!syncResourceConflicts) {
                return false;
            }
            if (syncResourceConflicts[1].some(({ previewResource }) => (0, resources_1.isEqual)(previewResource, model.uri))) {
                return true;
            }
            if (syncResourceConflicts[1].some(({ remoteResource }) => (0, resources_1.isEqual)(remoteResource, model.uri))) {
                return this.configurationService.getValue('diffEditor.renderSideBySide');
            }
            return false;
        }
        createAcceptChangesWidgetRenderer() {
            if (!this.acceptChangesButton) {
                const resource = this.editor.getModel().uri;
                const [syncResource, conflicts] = this.getSyncResourceConflicts(resource);
                const isRemote = conflicts.some(({ remoteResource }) => (0, resources_1.isEqual)(remoteResource, resource));
                const acceptRemoteLabel = (0, nls_1.localize)(90, null);
                const acceptMergesLabel = (0, nls_1.localize)(91, null);
                const acceptRemoteButtonLabel = (0, nls_1.localize)(92, null);
                const acceptMergesButtonLabel = (0, nls_1.localize)(93, null);
                this.acceptChangesButton = this.instantiationService.createInstance(codeeditor_1.FloatingClickWidget, this.editor, isRemote ? acceptRemoteLabel : acceptMergesLabel, null);
                this._register(this.acceptChangesButton.onClick(async () => {
                    const model = this.editor.getModel();
                    if (model) {
                        this.telemetryService.publicLog2('sync/handleConflicts', { source: syncResource, action: isRemote ? 'acceptRemote' : 'acceptLocal' });
                        const syncAreaLabel = (0, userDataSync_2.getSyncAreaLabel)(syncResource);
                        const result = await this.dialogService.confirm({
                            type: 'info',
                            title: isRemote
                                ? (0, nls_1.localize)(94, null, userDataSync_2.SYNC_TITLE, acceptRemoteLabel)
                                : (0, nls_1.localize)(95, null, userDataSync_2.SYNC_TITLE, acceptMergesLabel),
                            message: isRemote
                                ? (0, nls_1.localize)(96, null, syncAreaLabel.toLowerCase(), syncAreaLabel.toLowerCase())
                                : (0, nls_1.localize)(97, null, syncAreaLabel.toLowerCase()),
                            primaryButton: isRemote ? acceptRemoteButtonLabel : acceptMergesButtonLabel
                        });
                        if (result.confirmed) {
                            try {
                                await this.userDataSyncService.accept(syncResource, model.uri, model.getValue(), true);
                            }
                            catch (e) {
                                if (e instanceof userDataSync_1.UserDataSyncError && e.code === userDataSync_1.UserDataSyncErrorCode.LocalPreconditionFailed) {
                                    const syncResourceCoflicts = this.userDataSyncService.conflicts.filter(syncResourceCoflicts => syncResourceCoflicts[0] === syncResource)[0];
                                    if (syncResourceCoflicts && conflicts.some(conflict => (0, resources_1.isEqual)(conflict.previewResource, model.uri) || (0, resources_1.isEqual)(conflict.remoteResource, model.uri))) {
                                        this.notificationService.warn((0, nls_1.localize)(98, null));
                                    }
                                }
                                else {
                                    this.notificationService.error((0, nls_1.localize)(99, null, `command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID}`));
                                }
                            }
                        }
                    }
                }));
                this.acceptChangesButton.render();
            }
        }
        getSyncResourceConflicts(resource) {
            return this.userDataSyncService.conflicts.filter(([, conflicts]) => conflicts.some(({ previewResource, remoteResource }) => (0, resources_1.isEqual)(previewResource, resource) || (0, resources_1.isEqual)(remoteResource, resource)))[0];
        }
        disposeAcceptChangesWidgetRenderer() {
            (0, lifecycle_1.dispose)(this.acceptChangesButton);
            this.acceptChangesButton = undefined;
        }
        dispose() {
            this.disposeAcceptChangesWidgetRenderer();
            super.dispose();
        }
    };
    AcceptChangesContribution.ID = 'editor.contrib.acceptChangesButton';
    AcceptChangesContribution = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, userDataSync_1.IUserDataSyncService),
        __param(3, notification_1.INotificationService),
        __param(4, dialogs_1.IDialogService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, telemetry_1.ITelemetryService),
        __param(7, userDataSync_1.IUserDataAutoSyncEnablementService)
    ], AcceptChangesContribution);
});
//# sourceMappingURL=userDataSync.js.map