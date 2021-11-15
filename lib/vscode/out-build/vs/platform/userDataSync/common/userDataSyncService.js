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
define(["require", "exports", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/platform/userDataSync/common/extensionsSync", "vs/platform/userDataSync/common/keybindingsSync", "vs/platform/userDataSync/common/globalStateSync", "vs/base/common/errorMessage", "vs/platform/telemetry/common/telemetry", "vs/base/common/arrays", "vs/platform/storage/common/storage", "vs/platform/userDataSync/common/settingsSync", "vs/base/common/resources", "vs/platform/userDataSync/common/snippetsSync", "vs/base/common/uuid", "vs/base/common/async", "vs/base/common/errors"], function (require, exports, userDataSync_1, lifecycle_1, instantiation_1, event_1, extensionsSync_1, keybindingsSync_1, globalStateSync_1, errorMessage_1, telemetry_1, arrays_1, storage_1, settingsSync_1, resources_1, snippetsSync_1, uuid_1, async_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserDataSyncService = void 0;
    const LAST_SYNC_TIME_KEY = 'sync.lastSyncTime';
    let UserDataSyncService = class UserDataSyncService extends lifecycle_1.Disposable {
        constructor(userDataSyncStoreService, userDataSyncStoreManagementService, instantiationService, logService, telemetryService, storageService) {
            super();
            this.userDataSyncStoreService = userDataSyncStoreService;
            this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this._status = "uninitialized" /* Uninitialized */;
            this._onDidChangeStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this._conflicts = [];
            this._onDidChangeConflicts = this._register(new event_1.Emitter());
            this.onDidChangeConflicts = this._onDidChangeConflicts.event;
            this._syncErrors = [];
            this._onSyncErrors = this._register(new event_1.Emitter());
            this.onSyncErrors = this._onSyncErrors.event;
            this._lastSyncTime = undefined;
            this._onDidChangeLastSyncTime = this._register(new event_1.Emitter());
            this.onDidChangeLastSyncTime = this._onDidChangeLastSyncTime.event;
            this._onDidResetLocal = this._register(new event_1.Emitter());
            this.onDidResetLocal = this._onDidResetLocal.event;
            this._onDidResetRemote = this._register(new event_1.Emitter());
            this.onDidResetRemote = this._onDidResetRemote.event;
            this.recoveredSettings = false;
            this.settingsSynchroniser = this._register(this.instantiationService.createInstance(settingsSync_1.SettingsSynchroniser));
            this.keybindingsSynchroniser = this._register(this.instantiationService.createInstance(keybindingsSync_1.KeybindingsSynchroniser));
            this.snippetsSynchroniser = this._register(this.instantiationService.createInstance(snippetsSync_1.SnippetsSynchroniser));
            this.globalStateSynchroniser = this._register(this.instantiationService.createInstance(globalStateSync_1.GlobalStateSynchroniser));
            this.extensionsSynchroniser = this._register(this.instantiationService.createInstance(extensionsSync_1.ExtensionsSynchroniser));
            this.synchronisers = [this.settingsSynchroniser, this.keybindingsSynchroniser, this.snippetsSynchroniser, this.globalStateSynchroniser, this.extensionsSynchroniser];
            this.updateStatus();
            if (this.userDataSyncStoreManagementService.userDataSyncStore) {
                this._register(event_1.Event.any(...this.synchronisers.map(s => event_1.Event.map(s.onDidChangeStatus, () => undefined)))(() => this.updateStatus()));
                this._register(event_1.Event.any(...this.synchronisers.map(s => event_1.Event.map(s.onDidChangeConflicts, () => undefined)))(() => this.updateConflicts()));
            }
            this._lastSyncTime = this.storageService.getNumber(LAST_SYNC_TIME_KEY, 0 /* GLOBAL */, undefined);
            this.onDidChangeLocal = event_1.Event.any(...this.synchronisers.map(s => event_1.Event.map(s.onDidChangeLocal, () => s.resource)));
        }
        get status() { return this._status; }
        get conflicts() { return this._conflicts; }
        get lastSyncTime() { return this._lastSyncTime; }
        async createSyncTask(disableCache) {
            await this.checkEnablement();
            const executionId = (0, uuid_1.generateUuid)();
            let manifest;
            try {
                const syncHeaders = (0, userDataSync_1.createSyncHeaders)(executionId);
                if (disableCache) {
                    syncHeaders['Cache-Control'] = 'no-cache';
                }
                manifest = await this.userDataSyncStoreService.manifest(syncHeaders);
            }
            catch (error) {
                const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(error);
                this.reportUserDataSyncError(userDataSyncError, executionId);
                throw userDataSyncError;
            }
            let executed = false;
            const that = this;
            let cancellablePromise;
            return {
                manifest,
                run() {
                    if (executed) {
                        throw new Error('Can run a task only once');
                    }
                    cancellablePromise = (0, async_1.createCancelablePromise)(token => that.sync(manifest, executionId, token));
                    return cancellablePromise.finally(() => cancellablePromise = undefined);
                },
                async stop() {
                    if (cancellablePromise) {
                        cancellablePromise.cancel();
                    }
                    if (that.status !== "idle" /* Idle */) {
                        return that.stop();
                    }
                }
            };
        }
        async createManualSyncTask() {
            await this.checkEnablement();
            const executionId = (0, uuid_1.generateUuid)();
            const syncHeaders = (0, userDataSync_1.createSyncHeaders)(executionId);
            let manifest;
            try {
                manifest = await this.userDataSyncStoreService.manifest(syncHeaders);
            }
            catch (error) {
                const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(error);
                this.reportUserDataSyncError(userDataSyncError, executionId);
                throw userDataSyncError;
            }
            return new ManualSyncTask(executionId, manifest, syncHeaders, this.synchronisers, this.logService);
        }
        async sync(manifest, executionId, token) {
            if (!this.recoveredSettings) {
                await this.settingsSynchroniser.recoverSettings();
                this.recoveredSettings = true;
            }
            // Return if cancellation is requested
            if (token.isCancellationRequested) {
                return;
            }
            const startTime = new Date().getTime();
            this._syncErrors = [];
            try {
                this.logService.trace('Sync started.');
                if (this.status !== "hasConflicts" /* HasConflicts */) {
                    this.setStatus("syncing" /* Syncing */);
                }
                const syncHeaders = (0, userDataSync_1.createSyncHeaders)(executionId);
                for (const synchroniser of this.synchronisers) {
                    // Return if cancellation is requested
                    if (token.isCancellationRequested) {
                        return;
                    }
                    try {
                        await synchroniser.sync(manifest, syncHeaders);
                    }
                    catch (e) {
                        if (e instanceof userDataSync_1.UserDataSyncError) {
                            // Bail out for following errors
                            switch (e.code) {
                                case userDataSync_1.UserDataSyncErrorCode.TooLarge:
                                    throw new userDataSync_1.UserDataSyncError(e.message, e.code, synchroniser.resource);
                                case userDataSync_1.UserDataSyncErrorCode.TooManyRequests:
                                case userDataSync_1.UserDataSyncErrorCode.TooManyRequestsAndRetryAfter:
                                case userDataSync_1.UserDataSyncErrorCode.LocalTooManyRequests:
                                case userDataSync_1.UserDataSyncErrorCode.Gone:
                                case userDataSync_1.UserDataSyncErrorCode.UpgradeRequired:
                                case userDataSync_1.UserDataSyncErrorCode.IncompatibleRemoteContent:
                                case userDataSync_1.UserDataSyncErrorCode.IncompatibleLocalContent:
                                    throw e;
                            }
                        }
                        // Log and report other errors and continue
                        const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(e);
                        this.reportUserDataSyncError(userDataSyncError, executionId);
                        this.logService.error(e);
                        this.logService.error(`${synchroniser.resource}: ${(0, errorMessage_1.toErrorMessage)(e)}`);
                        this._syncErrors.push([synchroniser.resource, userDataSyncError]);
                    }
                }
                this.logService.info(`Sync done. Took ${new Date().getTime() - startTime}ms`);
                this.updateLastSyncTime();
            }
            catch (error) {
                const userDataSyncError = userDataSync_1.UserDataSyncError.toUserDataSyncError(error);
                this.reportUserDataSyncError(userDataSyncError, executionId);
                throw userDataSyncError;
            }
            finally {
                this.updateStatus();
                this._onSyncErrors.fire(this._syncErrors);
            }
        }
        async stop() {
            if (this.status === "idle" /* Idle */) {
                return;
            }
            for (const synchroniser of this.synchronisers) {
                try {
                    if (synchroniser.status !== "idle" /* Idle */) {
                        await synchroniser.stop();
                    }
                }
                catch (e) {
                    this.logService.error(e);
                }
            }
        }
        async replace(uri) {
            await this.checkEnablement();
            for (const synchroniser of this.synchronisers) {
                if (await synchroniser.replace(uri)) {
                    return;
                }
            }
        }
        async accept(syncResource, resource, content, apply) {
            await this.checkEnablement();
            const synchroniser = this.getSynchroniser(syncResource);
            await synchroniser.accept(resource, content);
            if (apply) {
                await synchroniser.apply(false, (0, userDataSync_1.createSyncHeaders)((0, uuid_1.generateUuid)()));
            }
        }
        async resolveContent(resource) {
            for (const synchroniser of this.synchronisers) {
                const content = await synchroniser.resolveContent(resource);
                if (content) {
                    return content;
                }
            }
            return null;
        }
        getRemoteSyncResourceHandles(resource) {
            return this.getSynchroniser(resource).getRemoteSyncResourceHandles();
        }
        getLocalSyncResourceHandles(resource) {
            return this.getSynchroniser(resource).getLocalSyncResourceHandles();
        }
        getAssociatedResources(resource, syncResourceHandle) {
            return this.getSynchroniser(resource).getAssociatedResources(syncResourceHandle);
        }
        getMachineId(resource, syncResourceHandle) {
            return this.getSynchroniser(resource).getMachineId(syncResourceHandle);
        }
        async hasLocalData() {
            // skip global state synchronizer
            const synchronizers = [this.settingsSynchroniser, this.keybindingsSynchroniser, this.snippetsSynchroniser, this.extensionsSynchroniser];
            for (const synchroniser of synchronizers) {
                if (await synchroniser.hasLocalData()) {
                    return true;
                }
            }
            return false;
        }
        async reset() {
            await this.checkEnablement();
            await this.resetRemote();
            await this.resetLocal();
        }
        async resetRemote() {
            await this.checkEnablement();
            try {
                await this.userDataSyncStoreService.clear();
                this.logService.info('Cleared data on server');
            }
            catch (e) {
                this.logService.error(e);
            }
            this._onDidResetRemote.fire();
        }
        async resetLocal() {
            await this.checkEnablement();
            this.storageService.remove(LAST_SYNC_TIME_KEY, 0 /* GLOBAL */);
            for (const synchroniser of this.synchronisers) {
                try {
                    await synchroniser.resetLocal();
                }
                catch (e) {
                    this.logService.error(`${synchroniser.resource}: ${(0, errorMessage_1.toErrorMessage)(e)}`);
                    this.logService.error(e);
                }
            }
            this._onDidResetLocal.fire();
            this.logService.info('Did reset the local sync state.');
        }
        async hasPreviouslySynced() {
            for (const synchroniser of this.synchronisers) {
                if (await synchroniser.hasPreviouslySynced()) {
                    return true;
                }
            }
            return false;
        }
        setStatus(status) {
            const oldStatus = this._status;
            if (this._status !== status) {
                this._status = status;
                this._onDidChangeStatus.fire(status);
                if (oldStatus === "hasConflicts" /* HasConflicts */) {
                    this.updateLastSyncTime();
                }
            }
        }
        updateStatus() {
            this.updateConflicts();
            const status = this.computeStatus();
            this.setStatus(status);
        }
        updateConflicts() {
            const conflicts = this.computeConflicts();
            if (!(0, arrays_1.equals)(this._conflicts, conflicts, ([syncResourceA, conflictsA], [syncResourceB, conflictsB]) => syncResourceA === syncResourceA && (0, arrays_1.equals)(conflictsA, conflictsB, (a, b) => (0, resources_1.isEqual)(a.previewResource, b.previewResource)))) {
                this._conflicts = this.computeConflicts();
                this._onDidChangeConflicts.fire(conflicts);
            }
        }
        computeStatus() {
            if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
                return "uninitialized" /* Uninitialized */;
            }
            if (this.synchronisers.some(s => s.status === "hasConflicts" /* HasConflicts */)) {
                return "hasConflicts" /* HasConflicts */;
            }
            if (this.synchronisers.some(s => s.status === "syncing" /* Syncing */)) {
                return "syncing" /* Syncing */;
            }
            return "idle" /* Idle */;
        }
        updateLastSyncTime() {
            if (this.status === "idle" /* Idle */) {
                this._lastSyncTime = new Date().getTime();
                this.storageService.store(LAST_SYNC_TIME_KEY, this._lastSyncTime, 0 /* GLOBAL */, 1 /* MACHINE */);
                this._onDidChangeLastSyncTime.fire(this._lastSyncTime);
            }
        }
        reportUserDataSyncError(userDataSyncError, executionId) {
            this.telemetryService.publicLog2('sync/error', { code: userDataSyncError.code, url: userDataSyncError instanceof userDataSync_1.UserDataSyncStoreError ? userDataSyncError.url : undefined, resource: userDataSyncError.resource, executionId, service: this.userDataSyncStoreManagementService.userDataSyncStore.url.toString() });
        }
        computeConflicts() {
            return this.synchronisers.filter(s => s.status === "hasConflicts" /* HasConflicts */)
                .map(s => ([s.resource, s.conflicts.map(toStrictResourcePreview)]));
        }
        getSynchroniser(source) {
            return this.synchronisers.find(s => s.resource === source);
        }
        async checkEnablement() {
            if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
                throw new Error('Not enabled');
            }
        }
    };
    UserDataSyncService = __decorate([
        __param(0, userDataSync_1.IUserDataSyncStoreService),
        __param(1, userDataSync_1.IUserDataSyncStoreManagementService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, userDataSync_1.IUserDataSyncLogService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, storage_1.IStorageService)
    ], UserDataSyncService);
    exports.UserDataSyncService = UserDataSyncService;
    class ManualSyncTask extends lifecycle_1.Disposable {
        constructor(id, manifest, syncHeaders, synchronisers, logService) {
            super();
            this.id = id;
            this.manifest = manifest;
            this.syncHeaders = syncHeaders;
            this.synchronisers = synchronisers;
            this.logService = logService;
            this.synchronizingResources = [];
            this._onSynchronizeResources = this._register(new event_1.Emitter());
            this.onSynchronizeResources = this._onSynchronizeResources.event;
            this.isDisposed = false;
        }
        get status() {
            if (this.synchronisers.some(s => s.status === "hasConflicts" /* HasConflicts */)) {
                return "hasConflicts" /* HasConflicts */;
            }
            if (this.synchronisers.some(s => s.status === "syncing" /* Syncing */)) {
                return "syncing" /* Syncing */;
            }
            return "idle" /* Idle */;
        }
        async preview() {
            try {
                if (this.isDisposed) {
                    throw new Error('Disposed');
                }
                if (!this.previewsPromise) {
                    this.previewsPromise = (0, async_1.createCancelablePromise)(token => this.getPreviews(token));
                }
                if (!this.previews) {
                    this.previews = await this.previewsPromise;
                }
                return this.previews;
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async accept(resource, content) {
            try {
                return await this.performAction(resource, sychronizer => sychronizer.accept(resource, content));
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async merge(resource) {
            try {
                if (resource) {
                    return await this.performAction(resource, sychronizer => sychronizer.merge(resource));
                }
                else {
                    return await this.mergeAll();
                }
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async discard(resource) {
            try {
                return await this.performAction(resource, sychronizer => sychronizer.discard(resource));
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async discardConflicts() {
            try {
                if (!this.previews) {
                    throw new Error('Missing preview. Create preview and try again.');
                }
                if (this.synchronizingResources.length) {
                    throw new Error('Cannot discard while synchronizing resources');
                }
                const conflictResources = [];
                for (const [, syncResourcePreview] of this.previews) {
                    for (const resourcePreview of syncResourcePreview.resourcePreviews) {
                        if (resourcePreview.mergeState === "conflict" /* Conflict */) {
                            conflictResources.push(resourcePreview.previewResource);
                        }
                    }
                }
                for (const resource of conflictResources) {
                    await this.discard(resource);
                }
                return this.previews;
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async apply() {
            try {
                if (!this.previews) {
                    throw new Error('You need to create preview before applying');
                }
                if (this.synchronizingResources.length) {
                    throw new Error('Cannot pull while synchronizing resources');
                }
                const previews = [];
                for (const [syncResource, preview] of this.previews) {
                    this.synchronizingResources.push([syncResource, preview.resourcePreviews.map(r => r.localResource)]);
                    this._onSynchronizeResources.fire(this.synchronizingResources);
                    const synchroniser = this.synchronisers.find(s => s.resource === syncResource);
                    /* merge those which are not yet merged */
                    for (const resourcePreview of preview.resourcePreviews) {
                        if ((resourcePreview.localChange !== 0 /* None */ || resourcePreview.remoteChange !== 0 /* None */) && resourcePreview.mergeState === "preview" /* Preview */) {
                            await synchroniser.merge(resourcePreview.previewResource);
                        }
                    }
                    /* apply */
                    const newPreview = await synchroniser.apply(false, this.syncHeaders);
                    if (newPreview) {
                        previews.push(this.toSyncResourcePreview(synchroniser.resource, newPreview));
                    }
                    this.synchronizingResources.splice(this.synchronizingResources.findIndex(s => s[0] === syncResource), 1);
                    this._onSynchronizeResources.fire(this.synchronizingResources);
                }
                this.previews = previews;
                return this.previews;
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async pull() {
            try {
                if (!this.previews) {
                    throw new Error('You need to create preview before applying');
                }
                if (this.synchronizingResources.length) {
                    throw new Error('Cannot pull while synchronizing resources');
                }
                for (const [syncResource, preview] of this.previews) {
                    this.synchronizingResources.push([syncResource, preview.resourcePreviews.map(r => r.localResource)]);
                    this._onSynchronizeResources.fire(this.synchronizingResources);
                    const synchroniser = this.synchronisers.find(s => s.resource === syncResource);
                    for (const resourcePreview of preview.resourcePreviews) {
                        await synchroniser.accept(resourcePreview.remoteResource);
                    }
                    await synchroniser.apply(true, this.syncHeaders);
                    this.synchronizingResources.splice(this.synchronizingResources.findIndex(s => s[0] === syncResource), 1);
                    this._onSynchronizeResources.fire(this.synchronizingResources);
                }
                this.previews = [];
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async push() {
            try {
                if (!this.previews) {
                    throw new Error('You need to create preview before applying');
                }
                if (this.synchronizingResources.length) {
                    throw new Error('Cannot pull while synchronizing resources');
                }
                for (const [syncResource, preview] of this.previews) {
                    this.synchronizingResources.push([syncResource, preview.resourcePreviews.map(r => r.localResource)]);
                    this._onSynchronizeResources.fire(this.synchronizingResources);
                    const synchroniser = this.synchronisers.find(s => s.resource === syncResource);
                    for (const resourcePreview of preview.resourcePreviews) {
                        await synchroniser.accept(resourcePreview.localResource);
                    }
                    await synchroniser.apply(true, this.syncHeaders);
                    this.synchronizingResources.splice(this.synchronizingResources.findIndex(s => s[0] === syncResource), 1);
                    this._onSynchronizeResources.fire(this.synchronizingResources);
                }
                this.previews = [];
            }
            catch (error) {
                this.logService.error(error);
                throw error;
            }
        }
        async stop() {
            for (const synchroniser of this.synchronisers) {
                try {
                    await synchroniser.stop();
                }
                catch (error) {
                    if (!(0, errors_1.isPromiseCanceledError)(error)) {
                        this.logService.error(error);
                    }
                }
            }
            this.reset();
        }
        async performAction(resource, action) {
            if (!this.previews) {
                throw new Error('Missing preview. Create preview and try again.');
            }
            const index = this.previews.findIndex(([, preview]) => preview.resourcePreviews.some(({ localResource, previewResource, remoteResource }) => (0, resources_1.isEqual)(resource, localResource) || (0, resources_1.isEqual)(resource, previewResource) || (0, resources_1.isEqual)(resource, remoteResource)));
            if (index === -1) {
                return this.previews;
            }
            const [syncResource, previews] = this.previews[index];
            const resourcePreview = previews.resourcePreviews.find(({ localResource, remoteResource, previewResource }) => (0, resources_1.isEqual)(localResource, resource) || (0, resources_1.isEqual)(remoteResource, resource) || (0, resources_1.isEqual)(previewResource, resource));
            if (!resourcePreview) {
                return this.previews;
            }
            let synchronizingResources = this.synchronizingResources.find(s => s[0] === syncResource);
            if (!synchronizingResources) {
                synchronizingResources = [syncResource, []];
                this.synchronizingResources.push(synchronizingResources);
            }
            if (!synchronizingResources[1].some(s => (0, resources_1.isEqual)(s, resourcePreview.localResource))) {
                synchronizingResources[1].push(resourcePreview.localResource);
                this._onSynchronizeResources.fire(this.synchronizingResources);
            }
            const synchroniser = this.synchronisers.find(s => s.resource === this.previews[index][0]);
            const preview = await action(synchroniser);
            preview ? this.previews.splice(index, 1, this.toSyncResourcePreview(synchroniser.resource, preview)) : this.previews.splice(index, 1);
            const i = this.synchronizingResources.findIndex(s => s[0] === syncResource);
            this.synchronizingResources[i][1].splice(synchronizingResources[1].findIndex(r => (0, resources_1.isEqual)(r, resourcePreview.localResource)), 1);
            if (!synchronizingResources[1].length) {
                this.synchronizingResources.splice(i, 1);
                this._onSynchronizeResources.fire(this.synchronizingResources);
            }
            return this.previews;
        }
        async mergeAll() {
            if (!this.previews) {
                throw new Error('You need to create preview before merging or applying');
            }
            if (this.synchronizingResources.length) {
                throw new Error('Cannot merge or apply while synchronizing resources');
            }
            const previews = [];
            for (const [syncResource, preview] of this.previews) {
                this.synchronizingResources.push([syncResource, preview.resourcePreviews.map(r => r.localResource)]);
                this._onSynchronizeResources.fire(this.synchronizingResources);
                const synchroniser = this.synchronisers.find(s => s.resource === syncResource);
                /* merge those which are not yet merged */
                let newPreview = preview;
                for (const resourcePreview of preview.resourcePreviews) {
                    if ((resourcePreview.localChange !== 0 /* None */ || resourcePreview.remoteChange !== 0 /* None */) && resourcePreview.mergeState === "preview" /* Preview */) {
                        newPreview = await synchroniser.merge(resourcePreview.previewResource);
                    }
                }
                if (newPreview) {
                    previews.push(this.toSyncResourcePreview(synchroniser.resource, newPreview));
                }
                this.synchronizingResources.splice(this.synchronizingResources.findIndex(s => s[0] === syncResource), 1);
                this._onSynchronizeResources.fire(this.synchronizingResources);
            }
            this.previews = previews;
            return this.previews;
        }
        async getPreviews(token) {
            const result = [];
            for (const synchroniser of this.synchronisers) {
                if (token.isCancellationRequested) {
                    return [];
                }
                const preview = await synchroniser.preview(this.manifest, this.syncHeaders);
                if (preview) {
                    result.push(this.toSyncResourcePreview(synchroniser.resource, preview));
                }
            }
            return result;
        }
        toSyncResourcePreview(syncResource, preview) {
            return [
                syncResource,
                {
                    isLastSyncFromCurrentMachine: preview.isLastSyncFromCurrentMachine,
                    resourcePreviews: preview.resourcePreviews.map(toStrictResourcePreview)
                }
            ];
        }
        reset() {
            if (this.previewsPromise) {
                this.previewsPromise.cancel();
                this.previewsPromise = undefined;
            }
            this.previews = undefined;
            this.synchronizingResources = [];
        }
        dispose() {
            this.reset();
            this.isDisposed = true;
        }
    }
    function toStrictResourcePreview(resourcePreview) {
        return {
            localResource: resourcePreview.localResource,
            previewResource: resourcePreview.previewResource,
            remoteResource: resourcePreview.remoteResource,
            acceptedResource: resourcePreview.acceptedResource,
            localChange: resourcePreview.localChange,
            remoteChange: resourcePreview.remoteChange,
            mergeState: resourcePreview.mergeState,
        };
    }
});
//# sourceMappingURL=userDataSyncService.js.map