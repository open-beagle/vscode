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
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/workbench/services/userDataSync/common/userDataSync", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/arrays", "vs/workbench/services/authentication/browser/authenticationService", "vs/platform/userDataSync/common/userDataSyncAccount", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/log/common/log", "vs/platform/product/common/productService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/nls!vs/workbench/services/userDataSync/browser/userDataSyncWorkbenchService", "vs/base/common/errors", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/platform/contextkey/common/contextkey", "vs/base/common/actions", "vs/platform/progress/common/progress", "vs/base/common/resources", "vs/workbench/common/views", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/platform", "vs/platform/instantiation/common/instantiation", "vs/platform/userDataSync/common/userDataSyncStoreService", "vs/platform/userDataSync/common/globalStateSync"], function (require, exports, userDataSync_1, telemetry_1, extensions_1, userDataSync_2, lifecycle_1, event_1, arrays_1, authenticationService_1, userDataSyncAccount_1, quickInput_1, storage_1, log_1, productService_1, extensions_2, environmentService_1, nls_1, errors_1, notification_1, dialogs_1, contextkey_1, actions_1, progress_1, resources_1, views_1, lifecycle_2, platform_1, instantiation_1, userDataSyncStoreService_1, globalStateSync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncWorkbenchService = void 0;
    class UserDataSyncAccount {
        constructor(authenticationProviderId, session) {
            this.authenticationProviderId = authenticationProviderId;
            this.session = session;
        }
        get sessionId() { return this.session.id; }
        get accountName() { return this.session.account.label; }
        get accountId() { return this.session.account.id; }
        get token() { return this.session.accessToken; }
    }
    let UserDataSyncWorkbenchService = class UserDataSyncWorkbenchService extends lifecycle_1.Disposable {
        constructor(userDataSyncService, authenticationService, userDataSyncAccountService, quickInputService, storageService, userDataAutoSyncEnablementService, userDataAutoSyncService, telemetryService, logService, productService, extensionService, environmentService, notificationService, progressService, dialogService, contextKeyService, viewsService, viewDescriptorService, userDataSyncStoreManagementService, lifecycleService, instantiationService) {
            super();
            this.userDataSyncService = userDataSyncService;
            this.authenticationService = authenticationService;
            this.userDataSyncAccountService = userDataSyncAccountService;
            this.quickInputService = quickInputService;
            this.storageService = storageService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.userDataAutoSyncService = userDataAutoSyncService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.productService = productService;
            this.extensionService = extensionService;
            this.environmentService = environmentService;
            this.notificationService = notificationService;
            this.progressService = progressService;
            this.dialogService = dialogService;
            this.viewsService = viewsService;
            this.viewDescriptorService = viewDescriptorService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this._authenticationProviders = [];
            this._accountStatus = "uninitialized" /* Uninitialized */;
            this._onDidChangeAccountStatus = this._register(new event_1.Emitter());
            this.onDidChangeAccountStatus = this._onDidChangeAccountStatus.event;
            this._all = new Map();
            this.userDataSyncPreview = this._register(new UserDataSyncPreview(this.userDataSyncService));
            this._cachedCurrentSessionId = null;
            this.syncEnablementContext = userDataSync_2.CONTEXT_SYNC_ENABLEMENT.bindTo(contextKeyService);
            this.syncStatusContext = userDataSync_2.CONTEXT_SYNC_STATE.bindTo(contextKeyService);
            this.accountStatusContext = userDataSync_2.CONTEXT_ACCOUNT_STATE.bindTo(contextKeyService);
            this.activityViewsEnablementContext = userDataSync_2.CONTEXT_ENABLE_ACTIVITY_VIEWS.bindTo(contextKeyService);
            this.mergesViewEnablementContext = userDataSync_2.CONTEXT_ENABLE_SYNC_MERGES_VIEW.bindTo(contextKeyService);
            if (this.userDataSyncStoreManagementService.userDataSyncStore) {
                this.syncStatusContext.set(this.userDataSyncService.status);
                this._register(userDataSyncService.onDidChangeStatus(status => this.syncStatusContext.set(status)));
                this.syncEnablementContext.set(userDataAutoSyncEnablementService.isEnabled());
                this._register(userDataAutoSyncEnablementService.onDidChangeEnablement(enabled => this.syncEnablementContext.set(enabled)));
                this.waitAndInitialize();
            }
        }
        get enabled() { return !!this.userDataSyncStoreManagementService.userDataSyncStore; }
        get authenticationProviders() { return this._authenticationProviders; }
        get accountStatus() { return this._accountStatus; }
        get all() { return (0, arrays_1.flatten)([...this._all.values()]); }
        get current() { return this.all.filter(account => this.isCurrentAccount(account))[0]; }
        updateAuthenticationProviders() {
            var _a;
            this._authenticationProviders = (((_a = this.userDataSyncStoreManagementService.userDataSyncStore) === null || _a === void 0 ? void 0 : _a.authenticationProviders) || []).filter(({ id }) => this.authenticationService.declaredProviders.some(provider => provider.id === id));
        }
        isSupportedAuthenticationProviderId(authenticationProviderId) {
            return this.authenticationProviders.some(({ id }) => id === authenticationProviderId);
        }
        async waitAndInitialize() {
            /* wait */
            await this.extensionService.whenInstalledExtensionsRegistered();
            /* initialize */
            try {
                this.logService.trace('Settings Sync: Initializing accounts');
                await this.initialize();
            }
            catch (error) {
                this.logService.error(error);
            }
            if (this.accountStatus === "uninitialized" /* Uninitialized */) {
                this.logService.warn('Settings Sync: Accounts are not initialized');
            }
            else {
                this.logService.trace('Settings Sync: Accounts are initialized');
            }
        }
        async initialize() {
            var _a;
            const authenticationSession = ((_a = this.environmentService.options) === null || _a === void 0 ? void 0 : _a.credentialsProvider) ? await (0, authenticationService_1.getCurrentAuthenticationSessionInfo)(this.environmentService, this.productService) : undefined;
            if (this.currentSessionId === undefined && this.useWorkbenchSessionId && (authenticationSession === null || authenticationSession === void 0 ? void 0 : authenticationSession.id)) {
                this.currentSessionId = authenticationSession === null || authenticationSession === void 0 ? void 0 : authenticationSession.id;
                this.useWorkbenchSessionId = false;
            }
            await this.update();
            this._register(this.authenticationService.onDidChangeDeclaredProviders(() => this.updateAuthenticationProviders()));
            this._register(event_1.Event.any(event_1.Event.filter(event_1.Event.any(this.authenticationService.onDidRegisterAuthenticationProvider, this.authenticationService.onDidUnregisterAuthenticationProvider), info => this.isSupportedAuthenticationProviderId(info.id)), event_1.Event.filter(this.userDataSyncAccountService.onTokenFailed, isSuccessive => !isSuccessive))(() => this.update()));
            this._register(event_1.Event.filter(this.authenticationService.onDidChangeSessions, e => this.isSupportedAuthenticationProviderId(e.providerId))(({ event }) => this.onDidChangeSessions(event)));
            this._register(this.storageService.onDidChangeValue(e => this.onDidChangeStorage(e)));
            this._register(event_1.Event.filter(this.userDataSyncAccountService.onTokenFailed, isSuccessive => isSuccessive)(() => this.onDidSuccessiveAuthFailures()));
        }
        async update() {
            this.updateAuthenticationProviders();
            const allAccounts = new Map();
            for (const { id } of this.authenticationProviders) {
                this.logService.trace('Settings Sync: Getting accounts for', id);
                const accounts = await this.getAccounts(id);
                allAccounts.set(id, accounts);
                this.logService.trace('Settings Sync: Updated accounts for', id);
            }
            this._all = allAccounts;
            const current = this.current;
            await this.updateToken(current);
            this.updateAccountStatus(current ? "available" /* Available */ : "unavailable" /* Unavailable */);
        }
        async getAccounts(authenticationProviderId) {
            let accounts = new Map();
            let currentAccount = null;
            const sessions = await this.authenticationService.getSessions(authenticationProviderId) || [];
            for (const session of sessions) {
                const account = new UserDataSyncAccount(authenticationProviderId, session);
                accounts.set(account.accountName, account);
                if (this.isCurrentAccount(account)) {
                    currentAccount = account;
                }
            }
            if (currentAccount) {
                // Always use current account if available
                accounts.set(currentAccount.accountName, currentAccount);
            }
            return [...accounts.values()];
        }
        async updateToken(current) {
            let value = undefined;
            if (current) {
                try {
                    this.logService.trace('Settings Sync: Updating the token for the account', current.accountName);
                    const token = current.token;
                    this.logService.trace('Settings Sync: Token updated for the account', current.accountName);
                    value = { token, authenticationProviderId: current.authenticationProviderId };
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
            await this.userDataSyncAccountService.updateAccount(value);
        }
        updateAccountStatus(accountStatus) {
            if (this._accountStatus !== accountStatus) {
                const previous = this._accountStatus;
                this.logService.trace(`Settings Sync: Account status changed from ${previous} to ${accountStatus}`);
                this._accountStatus = accountStatus;
                this.accountStatusContext.set(accountStatus);
                this._onDidChangeAccountStatus.fire(accountStatus);
            }
        }
        async turnOn() {
            var _a;
            if (!this.authenticationProviders.length) {
                throw new Error((0, nls_1.localize)(0, null));
            }
            if (this.userDataAutoSyncEnablementService.isEnabled()) {
                return;
            }
            if (this.userDataSyncService.status !== "idle" /* Idle */) {
                throw new Error('Cannont turn on sync while syncing');
            }
            const picked = await this.pick();
            if (!picked) {
                throw (0, errors_1.canceled)();
            }
            // User did not pick an account or login failed
            if (this.accountStatus !== "available" /* Available */) {
                throw new Error((0, nls_1.localize)(1, null));
            }
            const syncTitle = userDataSync_2.SYNC_TITLE;
            const title = `${syncTitle} [(${(0, nls_1.localize)(2, null)})](command:${userDataSync_2.SHOW_SYNC_LOG_COMMAND_ID})`;
            const manualSyncTask = await this.userDataSyncService.createManualSyncTask();
            const disposable = platform_1.isWeb
                ? lifecycle_1.Disposable.None /* In web long running shutdown handlers will not work */
                : this.lifecycleService.onBeforeShutdown(e => e.veto(this.onBeforeShutdown(manualSyncTask), 'veto.settingsSync'));
            try {
                await this.syncBeforeTurningOn(title, manualSyncTask);
            }
            finally {
                disposable.dispose();
            }
            await this.userDataAutoSyncService.turnOn();
            if ((_a = this.userDataSyncStoreManagementService.userDataSyncStore) === null || _a === void 0 ? void 0 : _a.canSwitch) {
                await this.synchroniseUserDataSyncStoreType();
            }
            this.notificationService.info((0, nls_1.localize)(3, null, title));
        }
        turnoff(everywhere) {
            return this.userDataAutoSyncService.turnOff(everywhere);
        }
        async synchroniseUserDataSyncStoreType() {
            if (!this.userDataSyncAccountService.account) {
                throw new Error('Cannot update because you are signed out from settings sync. Please sign in and try again.');
            }
            if (!platform_1.isWeb || !this.userDataSyncStoreManagementService.userDataSyncStore) {
                // Not supported
                return;
            }
            const userDataSyncStoreUrl = this.userDataSyncStoreManagementService.userDataSyncStore.type === 'insiders' ? this.userDataSyncStoreManagementService.userDataSyncStore.stableUrl : this.userDataSyncStoreManagementService.userDataSyncStore.insidersUrl;
            const userDataSyncStoreClient = this.instantiationService.createInstance(userDataSyncStoreService_1.UserDataSyncStoreClient, userDataSyncStoreUrl);
            userDataSyncStoreClient.setAuthToken(this.userDataSyncAccountService.account.token, this.userDataSyncAccountService.account.authenticationProviderId);
            await this.instantiationService.createInstance(globalStateSync_1.UserDataSyncStoreTypeSynchronizer, userDataSyncStoreClient).sync(this.userDataSyncStoreManagementService.userDataSyncStore.type);
        }
        syncNow() {
            return this.userDataAutoSyncService.triggerSync(['Sync Now'], false, true);
        }
        async onBeforeShutdown(manualSyncTask) {
            const result = await this.dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(4, null),
                title: (0, nls_1.localize)(5, null),
                primaryButton: (0, nls_1.localize)(6, null),
                secondaryButton: (0, nls_1.localize)(7, null),
            });
            if (result.confirmed) {
                await manualSyncTask.stop();
            }
            return !result.confirmed;
        }
        async syncBeforeTurningOn(title, manualSyncTask) {
            /* Make sure sync started on clean local state */
            await this.userDataSyncService.resetLocal();
            try {
                let action = 'manual';
                await this.progressService.withProgress({
                    location: 15 /* Notification */,
                    title,
                    delay: 500,
                }, async (progress) => {
                    progress.report({ message: (0, nls_1.localize)(8, null) });
                    const preview = await manualSyncTask.preview();
                    const hasRemoteData = manualSyncTask.manifest !== null;
                    const hasLocalData = await this.userDataSyncService.hasLocalData();
                    const hasMergesFromAnotherMachine = preview.some(([syncResource, { isLastSyncFromCurrentMachine, resourcePreviews }]) => syncResource !== "globalState" /* GlobalState */ && !isLastSyncFromCurrentMachine
                        && resourcePreviews.some(r => r.localChange !== 0 /* None */ || r.remoteChange !== 0 /* None */));
                    action = await this.getFirstTimeSyncAction(hasRemoteData, hasLocalData, hasMergesFromAnotherMachine);
                    const progressDisposable = manualSyncTask.onSynchronizeResources(synchronizingResources => synchronizingResources.length ? progress.report({ message: (0, nls_1.localize)(9, null, (0, userDataSync_2.getSyncAreaLabel)(synchronizingResources[0][0])) }) : undefined);
                    try {
                        switch (action) {
                            case 'merge':
                                await manualSyncTask.merge();
                                if (manualSyncTask.status !== "hasConflicts" /* HasConflicts */) {
                                    await manualSyncTask.apply();
                                }
                                return;
                            case 'pull': return await manualSyncTask.pull();
                            case 'push': return await manualSyncTask.push();
                            case 'manual': return;
                        }
                    }
                    finally {
                        progressDisposable.dispose();
                    }
                });
                if (manualSyncTask.status === "hasConflicts" /* HasConflicts */) {
                    await this.dialogService.show(notification_1.Severity.Warning, (0, nls_1.localize)(10, null), [(0, nls_1.localize)(11, null)], {
                        detail: (0, nls_1.localize)(12, null),
                    });
                    await manualSyncTask.discardConflicts();
                    action = 'manual';
                }
                if (action === 'manual') {
                    await this.syncManually(manualSyncTask);
                }
            }
            catch (error) {
                await manualSyncTask.stop();
                throw error;
            }
            finally {
                manualSyncTask.dispose();
            }
        }
        async getFirstTimeSyncAction(hasRemoteData, hasLocalData, hasMergesFromAnotherMachine) {
            if (!hasLocalData /* no data on local */
                || !hasRemoteData /* no data on remote */
                || !hasMergesFromAnotherMachine /* no merges with another machine  */) {
                return 'merge';
            }
            const result = await this.dialogService.show(notification_1.Severity.Info, (0, nls_1.localize)(13, null), [
                (0, nls_1.localize)(14, null),
                (0, nls_1.localize)(15, null),
                (0, nls_1.localize)(16, null),
                (0, nls_1.localize)(17, null),
            ], {
                cancelId: 3,
                detail: (0, nls_1.localize)(18, null),
            });
            switch (result.choice) {
                case 0:
                    this.telemetryService.publicLog2('sync/firstTimeSync', { action: 'merge' });
                    return 'merge';
                case 1:
                    this.telemetryService.publicLog2('sync/firstTimeSync', { action: 'pull' });
                    return 'pull';
                case 2:
                    this.telemetryService.publicLog2('sync/firstTimeSync', { action: 'manual' });
                    return 'manual';
            }
            this.telemetryService.publicLog2('sync/firstTimeSync', { action: 'cancelled' });
            throw (0, errors_1.canceled)();
        }
        async syncManually(task) {
            const visibleViewContainer = this.viewsService.getVisibleViewContainer(0 /* Sidebar */);
            const preview = await task.preview();
            this.userDataSyncPreview.setManualSyncPreview(task, preview);
            this.mergesViewEnablementContext.set(true);
            await this.waitForActiveSyncViews();
            await this.viewsService.openView(userDataSync_2.SYNC_MERGES_VIEW_ID);
            const error = await event_1.Event.toPromise(this.userDataSyncPreview.onDidCompleteManualSync);
            this.userDataSyncPreview.unsetManualSyncPreview();
            this.mergesViewEnablementContext.set(false);
            if (visibleViewContainer) {
                this.viewsService.openViewContainer(visibleViewContainer.id);
            }
            else {
                const viewContainer = this.viewDescriptorService.getViewContainerByViewId(userDataSync_2.SYNC_MERGES_VIEW_ID);
                this.viewsService.closeViewContainer(viewContainer.id);
            }
            if (error) {
                throw error;
            }
        }
        async resetSyncedData() {
            const result = await this.dialogService.confirm({
                message: (0, nls_1.localize)(19, null),
                title: (0, nls_1.localize)(20, null),
                type: 'info',
                primaryButton: (0, nls_1.localize)(21, null),
            });
            if (result.confirmed) {
                await this.userDataSyncService.resetRemote();
            }
        }
        async showSyncActivity() {
            this.activityViewsEnablementContext.set(true);
            await this.waitForActiveSyncViews();
            await this.viewsService.openViewContainer(userDataSync_2.SYNC_VIEW_CONTAINER_ID);
        }
        async waitForActiveSyncViews() {
            const viewContainer = this.viewDescriptorService.getViewContainerById(userDataSync_2.SYNC_VIEW_CONTAINER_ID);
            if (viewContainer) {
                const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
                if (!model.activeViewDescriptors.length) {
                    await event_1.Event.toPromise(event_1.Event.filter(model.onDidChangeActiveViewDescriptors, e => model.activeViewDescriptors.length > 0));
                }
            }
        }
        isCurrentAccount(account) {
            return account.sessionId === this.currentSessionId;
        }
        async signIn() {
            await this.pick();
        }
        async pick() {
            const result = await this.doPick();
            if (!result) {
                return false;
            }
            let sessionId, accountName, accountId;
            if ((0, userDataSync_1.isAuthenticationProvider)(result)) {
                const session = await this.authenticationService.createSession(result.id, result.scopes);
                sessionId = session.id;
                accountName = session.account.label;
                accountId = session.account.id;
            }
            else {
                sessionId = result.sessionId;
                accountName = result.accountName;
                accountId = result.accountId;
            }
            await this.switch(sessionId, accountName, accountId);
            return true;
        }
        async doPick() {
            if (this.authenticationProviders.length === 0) {
                return undefined;
            }
            await this.update();
            // Single auth provider and no accounts available
            if (this.authenticationProviders.length === 1 && !this.all.length) {
                return this.authenticationProviders[0];
            }
            return new Promise(async (c, e) => {
                let result;
                const disposables = new lifecycle_1.DisposableStore();
                const quickPick = this.quickInputService.createQuickPick();
                disposables.add(quickPick);
                quickPick.title = userDataSync_2.SYNC_TITLE;
                quickPick.ok = false;
                quickPick.placeholder = (0, nls_1.localize)(22, null);
                quickPick.ignoreFocusOut = true;
                quickPick.items = this.createQuickpickItems();
                disposables.add(quickPick.onDidAccept(() => {
                    var _a, _b, _c;
                    result = ((_a = quickPick.selectedItems[0]) === null || _a === void 0 ? void 0 : _a.account) ? (_b = quickPick.selectedItems[0]) === null || _b === void 0 ? void 0 : _b.account : (_c = quickPick.selectedItems[0]) === null || _c === void 0 ? void 0 : _c.authenticationProvider;
                    quickPick.hide();
                }));
                disposables.add(quickPick.onDidHide(() => {
                    disposables.dispose();
                    c(result);
                }));
                quickPick.show();
            });
        }
        createQuickpickItems() {
            var _a;
            const quickPickItems = [];
            // Signed in Accounts
            if (this.all.length) {
                const authenticationProviders = [...this.authenticationProviders].sort(({ id }) => { var _a; return id === ((_a = this.current) === null || _a === void 0 ? void 0 : _a.authenticationProviderId) ? -1 : 1; });
                quickPickItems.push({ type: 'separator', label: (0, nls_1.localize)(23, null) });
                for (const authenticationProvider of authenticationProviders) {
                    const accounts = (this._all.get(authenticationProvider.id) || []).sort(({ sessionId }) => { var _a; return sessionId === ((_a = this.current) === null || _a === void 0 ? void 0 : _a.sessionId) ? -1 : 1; });
                    const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                    for (const account of accounts) {
                        quickPickItems.push({
                            label: `${account.accountName} (${providerName})`,
                            description: account.sessionId === ((_a = this.current) === null || _a === void 0 ? void 0 : _a.sessionId) ? (0, nls_1.localize)(24, null) : undefined,
                            account,
                            authenticationProvider,
                        });
                    }
                }
                quickPickItems.push({ type: 'separator', label: (0, nls_1.localize)(25, null) });
            }
            // Account proviers
            for (const authenticationProvider of this.authenticationProviders) {
                const signedInForProvider = this.all.some(account => account.authenticationProviderId === authenticationProvider.id);
                if (!signedInForProvider || this.authenticationService.supportsMultipleAccounts(authenticationProvider.id)) {
                    const providerName = this.authenticationService.getLabel(authenticationProvider.id);
                    quickPickItems.push({ label: (0, nls_1.localize)(26, null, providerName), authenticationProvider });
                }
            }
            return quickPickItems;
        }
        async switch(sessionId, accountName, accountId) {
            const currentAccount = this.current;
            if (this.userDataAutoSyncEnablementService.isEnabled() && (currentAccount && currentAccount.accountName !== accountName)) {
                // accounts are switched while sync is enabled.
            }
            this.currentSessionId = sessionId;
            this.telemetryService.publicLog2('sync.userAccount', { id: accountId });
            await this.update();
        }
        async onDidSuccessiveAuthFailures() {
            this.telemetryService.publicLog2('sync/successiveAuthFailures');
            this.currentSessionId = undefined;
            await this.update();
            if (this.userDataAutoSyncEnablementService.isEnabled()) {
                this.notificationService.notify({
                    severity: notification_1.Severity.Error,
                    message: (0, nls_1.localize)(27, null),
                    actions: {
                        primary: [new actions_1.Action('sign in', (0, nls_1.localize)(28, null), undefined, true, () => this.signIn())]
                    }
                });
            }
        }
        onDidChangeSessions(e) {
            if (this.currentSessionId && e.removed.find(session => session.id === this.currentSessionId)) {
                this.currentSessionId = undefined;
            }
            this.update();
        }
        onDidChangeStorage(e) {
            if (e.key === UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY && e.scope === 0 /* GLOBAL */
                && this.currentSessionId !== this.getStoredCachedSessionId() /* This checks if current window changed the value or not */) {
                this._cachedCurrentSessionId = null;
                this.update();
            }
        }
        get currentSessionId() {
            if (this._cachedCurrentSessionId === null) {
                this._cachedCurrentSessionId = this.getStoredCachedSessionId();
            }
            return this._cachedCurrentSessionId;
        }
        set currentSessionId(cachedSessionId) {
            if (this._cachedCurrentSessionId !== cachedSessionId) {
                this._cachedCurrentSessionId = cachedSessionId;
                if (cachedSessionId === undefined) {
                    this.storageService.remove(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, 0 /* GLOBAL */);
                }
                else {
                    this.storageService.store(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, cachedSessionId, 0 /* GLOBAL */, 1 /* MACHINE */);
                }
            }
        }
        getStoredCachedSessionId() {
            return this.storageService.get(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, 0 /* GLOBAL */);
        }
        get useWorkbenchSessionId() {
            return !this.storageService.getBoolean(UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, 0 /* GLOBAL */, false);
        }
        set useWorkbenchSessionId(useWorkbenchSession) {
            this.storageService.store(UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, !useWorkbenchSession, 0 /* GLOBAL */, 1 /* MACHINE */);
        }
    };
    UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY = 'userDataSyncAccount.donotUseWorkbenchSession';
    UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY = 'userDataSyncAccountPreference';
    UserDataSyncWorkbenchService = __decorate([
        __param(0, userDataSync_1.IUserDataSyncService),
        __param(1, authenticationService_1.IAuthenticationService),
        __param(2, userDataSyncAccount_1.IUserDataSyncAccountService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, storage_1.IStorageService),
        __param(5, userDataSync_1.IUserDataAutoSyncEnablementService),
        __param(6, userDataSync_1.IUserDataAutoSyncService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, log_1.ILogService),
        __param(9, productService_1.IProductService),
        __param(10, extensions_2.IExtensionService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService),
        __param(12, notification_1.INotificationService),
        __param(13, progress_1.IProgressService),
        __param(14, dialogs_1.IDialogService),
        __param(15, contextkey_1.IContextKeyService),
        __param(16, views_1.IViewsService),
        __param(17, views_1.IViewDescriptorService),
        __param(18, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(19, lifecycle_2.ILifecycleService),
        __param(20, instantiation_1.IInstantiationService)
    ], UserDataSyncWorkbenchService);
    exports.UserDataSyncWorkbenchService = UserDataSyncWorkbenchService;
    class UserDataSyncPreview extends lifecycle_1.Disposable {
        constructor(userDataSyncService) {
            super();
            this.userDataSyncService = userDataSyncService;
            this._resources = [];
            this._onDidChangeResources = this._register(new event_1.Emitter());
            this.onDidChangeResources = this._onDidChangeResources.event;
            this._conflicts = [];
            this._onDidChangeConflicts = this._register(new event_1.Emitter());
            this.onDidChangeConflicts = this._onDidChangeConflicts.event;
            this._onDidCompleteManualSync = this._register(new event_1.Emitter());
            this.onDidCompleteManualSync = this._onDidCompleteManualSync.event;
            this.updateConflicts(userDataSyncService.conflicts);
            this._register(userDataSyncService.onDidChangeConflicts(conflicts => this.updateConflicts(conflicts)));
        }
        get resources() { return Object.freeze(this._resources); }
        get conflicts() { return Object.freeze(this._conflicts); }
        setManualSyncPreview(task, preview) {
            const disposables = new lifecycle_1.DisposableStore();
            this.manualSync = { task, preview, disposables };
            this.updateResources();
        }
        unsetManualSyncPreview() {
            if (this.manualSync) {
                this.manualSync.disposables.dispose();
                this.manualSync = undefined;
            }
            this.updateResources();
        }
        async accept(syncResource, resource, content) {
            if (this.manualSync) {
                const syncPreview = await this.manualSync.task.accept(resource, content);
                this.updatePreview(syncPreview);
            }
            else {
                await this.userDataSyncService.accept(syncResource, resource, content, false);
            }
        }
        async merge(resource) {
            if (!this.manualSync) {
                throw new Error('Can merge only while syncing manually');
            }
            const syncPreview = await this.manualSync.task.merge(resource);
            this.updatePreview(syncPreview);
        }
        async discard(resource) {
            if (!this.manualSync) {
                throw new Error('Can discard only while syncing manually');
            }
            const syncPreview = await this.manualSync.task.discard(resource);
            this.updatePreview(syncPreview);
        }
        async apply() {
            if (!this.manualSync) {
                throw new Error('Can apply only while syncing manually');
            }
            try {
                const syncPreview = await this.manualSync.task.apply();
                this.updatePreview(syncPreview);
                if (!this._resources.length) {
                    this._onDidCompleteManualSync.fire(undefined);
                }
            }
            catch (error) {
                await this.manualSync.task.stop();
                this.updatePreview([]);
                this._onDidCompleteManualSync.fire(error);
            }
        }
        async cancel() {
            if (!this.manualSync) {
                throw new Error('Can cancel only while syncing manually');
            }
            await this.manualSync.task.stop();
            this.updatePreview([]);
            this._onDidCompleteManualSync.fire((0, errors_1.canceled)());
        }
        async pull() {
            if (!this.manualSync) {
                throw new Error('Can pull only while syncing manually');
            }
            await this.manualSync.task.pull();
            this.updatePreview([]);
        }
        async push() {
            if (!this.manualSync) {
                throw new Error('Can push only while syncing manually');
            }
            await this.manualSync.task.push();
            this.updatePreview([]);
        }
        updatePreview(preview) {
            if (this.manualSync) {
                this.manualSync.preview = preview;
                this.updateResources();
            }
        }
        updateConflicts(conflicts) {
            const newConflicts = this.toUserDataSyncResourceGroups(conflicts);
            if (!(0, arrays_1.equals)(newConflicts, this._conflicts, (a, b) => (0, resources_1.isEqual)(a.local, b.local))) {
                this._conflicts = newConflicts;
                this._onDidChangeConflicts.fire(this.conflicts);
            }
        }
        updateResources() {
            var _a;
            const newResources = this.toUserDataSyncResourceGroups((((_a = this.manualSync) === null || _a === void 0 ? void 0 : _a.preview) || [])
                .map(([syncResource, syncResourcePreview]) => ([
                syncResource,
                syncResourcePreview.resourcePreviews
            ])));
            if (!(0, arrays_1.equals)(newResources, this._resources, (a, b) => (0, resources_1.isEqual)(a.local, b.local) && a.mergeState === b.mergeState)) {
                this._resources = newResources;
                this._onDidChangeResources.fire(this.resources);
            }
        }
        toUserDataSyncResourceGroups(syncResourcePreviews) {
            return (0, arrays_1.flatten)(syncResourcePreviews.map(([syncResource, resourcePreviews]) => resourcePreviews.map(({ localResource, remoteResource, previewResource, acceptedResource, localChange, remoteChange, mergeState }) => ({ syncResource, local: localResource, remote: remoteResource, merged: previewResource, accepted: acceptedResource, localChange, remoteChange, mergeState }))));
        }
    }
    (0, extensions_1.registerSingleton)(userDataSync_2.IUserDataSyncWorkbenchService, UserDataSyncWorkbenchService);
});
//# sourceMappingURL=userDataSyncWorkbenchService.js.map