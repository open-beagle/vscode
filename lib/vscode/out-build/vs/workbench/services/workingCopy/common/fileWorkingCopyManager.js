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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/services/workingCopy/common/fileWorkingCopy", "vs/base/common/map", "vs/base/common/async", "vs/platform/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/label/common/label", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/dialogs/common/dialogs", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/base/common/cancellation"], function (require, exports, lifecycle_1, event_1, fileWorkingCopy_1, map_1, async_1, files_1, lifecycle_2, label_1, instantiation_1, log_1, dialogs_1, resources_1, workingCopyFileService_1, uriIdentity_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileWorkingCopyManager = void 0;
    let FileWorkingCopyManager = class FileWorkingCopyManager extends lifecycle_1.Disposable {
        constructor(workingCopyTypeId, modelFactory, fileService, lifecycleService, labelService, instantiationService, logService, fileDialogService, workingCopyFileService, uriIdentityService) {
            super();
            this.workingCopyTypeId = workingCopyTypeId;
            this.modelFactory = modelFactory;
            this.fileService = fileService;
            this.lifecycleService = lifecycleService;
            this.labelService = labelService;
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.fileDialogService = fileDialogService;
            this.workingCopyFileService = workingCopyFileService;
            this.uriIdentityService = uriIdentityService;
            //#region Events
            this._onDidCreate = this._register(new event_1.Emitter());
            this.onDidCreate = this._onDidCreate.event;
            this._onDidResolve = this._register(new event_1.Emitter());
            this.onDidResolve = this._onDidResolve.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidSaveError = this._register(new event_1.Emitter());
            this.onDidSaveError = this._onDidSaveError.event;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidRevert = this._register(new event_1.Emitter());
            this.onDidRevert = this._onDidRevert.event;
            //#endregion
            this.mapResourceToWorkingCopy = new map_1.ResourceMap();
            this.mapResourceToWorkingCopyListeners = new map_1.ResourceMap();
            this.mapResourceToDisposeListener = new map_1.ResourceMap();
            this.mapResourceToPendingWorkingCopyResolve = new map_1.ResourceMap();
            this.workingCopyResolveQueue = this._register(new async_1.ResourceQueue());
            //#endregion
            //#region Working Copy File Events
            this.mapCorrelationIdToWorkingCopiesToRestore = new Map();
            this.registerListeners();
        }
        registerListeners() {
            // Update working copies from file change events
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
            // Working copy operations
            this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => this.onWillRunWorkingCopyFileOperation(e)));
            this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation(e => this.onDidFailWorkingCopyFileOperation(e)));
            this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => this.onDidRunWorkingCopyFileOperation(e)));
            // Lifecycle
            this.lifecycleService.onWillShutdown(event => event.join(this.onWillShutdown(), 'join.fileWorkingCopyManager'));
            this.lifecycleService.onDidShutdown(() => this.dispose());
        }
        async onWillShutdown() {
            let fileWorkingCopies;
            // As long as file working copies are pending to be saved, we prolong the shutdown
            // until that has happened to ensure we are not shutting down in the middle of
            // writing to the working copy (https://github.com/microsoft/vscode/issues/116600).
            while ((fileWorkingCopies = this.workingCopies.filter(workingCopy => workingCopy.hasState(2 /* PENDING_SAVE */))).length > 0) {
                await async_1.Promises.settled(fileWorkingCopies.map(workingCopy => workingCopy.joinState(2 /* PENDING_SAVE */)));
            }
        }
        //#region Resolve from file changes
        onDidFilesChange(e) {
            for (const workingCopy of this.workingCopies) {
                if (workingCopy.isDirty() || !workingCopy.isResolved()) {
                    continue; // require a resolved, saved working copy to continue
                }
                // Trigger a resolve for any update or add event that impacts
                // the working copy. We also consider the added event
                // because it could be that a file was added and updated
                // right after.
                if (e.contains(workingCopy.resource, 0 /* UPDATED */, 1 /* ADDED */)) {
                    this.queueWorkingCopyResolve(workingCopy);
                }
            }
        }
        queueWorkingCopyResolve(workingCopy) {
            // Resolves a working copy to update (use a queue to prevent accumulation of
            // resolve when the resolving actually takes long. At most we only want the
            // queue to have a size of 2 (1 running resolve and 1 queued resolve).
            const queue = this.workingCopyResolveQueue.queueFor(workingCopy.resource);
            if (queue.size <= 1) {
                queue.queue(async () => {
                    try {
                        await workingCopy.resolve();
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                });
            }
        }
        onWillRunWorkingCopyFileOperation(e) {
            // Move / Copy: remember working copies to restore after the operation
            if (e.operation === 2 /* MOVE */ || e.operation === 3 /* COPY */) {
                e.waitUntil((async () => {
                    var _a;
                    const workingCopiesToRestore = [];
                    for (const { source, target } of e.files) {
                        if (source) {
                            if (this.uriIdentityService.extUri.isEqual(source, target)) {
                                continue; // ignore if resources are considered equal
                            }
                            // Find all working copies that related to source (can be many if resource is a folder)
                            const sourceWorkingCopies = [];
                            for (const workingCopy of this.workingCopies) {
                                if (this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, source)) {
                                    sourceWorkingCopies.push(workingCopy);
                                }
                            }
                            // Remember each source working copy to load again after move is done
                            // with optional content to restore if it was dirty
                            for (const sourceWorkingCopy of sourceWorkingCopies) {
                                const sourceResource = sourceWorkingCopy.resource;
                                // If the source is the actual working copy, just use target as new resource
                                let targetResource;
                                if (this.uriIdentityService.extUri.isEqual(sourceResource, source)) {
                                    targetResource = target;
                                }
                                // Otherwise a parent folder of the source is being moved, so we need
                                // to compute the target resource based on that
                                else {
                                    targetResource = (0, resources_1.joinPath)(target, sourceResource.path.substr(source.path.length + 1));
                                }
                                workingCopiesToRestore.push({
                                    source: sourceResource,
                                    target: targetResource,
                                    snapshot: sourceWorkingCopy.isDirty() ? await ((_a = sourceWorkingCopy.model) === null || _a === void 0 ? void 0 : _a.snapshot(cancellation_1.CancellationToken.None)) : undefined
                                });
                            }
                        }
                    }
                    this.mapCorrelationIdToWorkingCopiesToRestore.set(e.correlationId, workingCopiesToRestore);
                })());
            }
        }
        onDidFailWorkingCopyFileOperation(e) {
            // Move / Copy: restore dirty flag on working copies to restore that were dirty
            if ((e.operation === 2 /* MOVE */ || e.operation === 3 /* COPY */)) {
                const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
                if (workingCopiesToRestore) {
                    this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
                    workingCopiesToRestore.forEach(workingCopy => {
                        var _a;
                        // Snapshot presence means this working copy used to be dirty and so we restore that
                        // flag. we do NOT have to restore the content because the working copy was only soft
                        // reverted and did not loose its original dirty contents.
                        if (workingCopy.snapshot) {
                            (_a = this.get(workingCopy.source)) === null || _a === void 0 ? void 0 : _a.markDirty();
                        }
                    });
                }
            }
        }
        onDidRunWorkingCopyFileOperation(e) {
            switch (e.operation) {
                // Create: Revert existing working copies
                case 0 /* CREATE */:
                    e.waitUntil((async () => {
                        for (const { target } of e.files) {
                            const workingCopy = this.get(target);
                            if (workingCopy && !workingCopy.isDisposed()) {
                                await workingCopy.revert();
                            }
                        }
                    })());
                    break;
                // Move/Copy: restore working copies that were loaded before the operation took place
                case 2 /* MOVE */:
                case 3 /* COPY */:
                    e.waitUntil((async () => {
                        const workingCopiesToRestore = this.mapCorrelationIdToWorkingCopiesToRestore.get(e.correlationId);
                        if (workingCopiesToRestore) {
                            this.mapCorrelationIdToWorkingCopiesToRestore.delete(e.correlationId);
                            await async_1.Promises.settled(workingCopiesToRestore.map(async (workingCopyToRestore) => {
                                // Restore the working copy at the target. if we have previous dirty content, we pass it
                                // over to be used, otherwise we force a reload from disk. this is important
                                // because we know the file has changed on disk after the move and the working copy might
                                // have still existed with the previous state. this ensures that the working copy is not
                                // tracking a stale state.
                                await this.resolve(workingCopyToRestore.target, {
                                    reload: { async: false },
                                    contents: workingCopyToRestore.snapshot
                                });
                            }));
                        }
                    })());
                    break;
            }
        }
        //#endregion
        //#region Get / Get all
        get workingCopies() {
            return [...this.mapResourceToWorkingCopy.values()];
        }
        get(resource) {
            return this.mapResourceToWorkingCopy.get(resource);
        }
        //#endregion
        //#region Resolve
        async resolve(resource, options) {
            // Await a pending working copy resolve first before proceeding
            // to ensure that we never resolve a working copy more than once
            // in parallel
            const pendingResolve = this.joinPendingResolve(resource);
            if (pendingResolve) {
                await pendingResolve;
            }
            let workingCopyResolve;
            let workingCopy = this.get(resource);
            let didCreateWorkingCopy = false;
            // Working copy exists
            if (workingCopy) {
                // Always reload if contents are provided
                if (options === null || options === void 0 ? void 0 : options.contents) {
                    workingCopyResolve = workingCopy.resolve(options);
                }
                // Reload async or sync based on options
                else if (options === null || options === void 0 ? void 0 : options.reload) {
                    // Async reload: trigger a reload but return immediately
                    if (options.reload.async) {
                        workingCopy.resolve(options);
                        workingCopyResolve = Promise.resolve();
                    }
                    // Sync reload: do not return until working copy reloaded
                    else {
                        workingCopyResolve = workingCopy.resolve(options);
                    }
                }
                // Do not reload
                else {
                    workingCopyResolve = Promise.resolve();
                }
            }
            // File working copy does not exist
            else {
                didCreateWorkingCopy = true;
                const newWorkingCopy = workingCopy = this.instantiationService.createInstance(fileWorkingCopy_1.FileWorkingCopy, this.workingCopyTypeId, resource, this.labelService.getUriBasenameLabel(resource), this.modelFactory);
                workingCopyResolve = workingCopy.resolve(options);
                this.registerWorkingCopy(newWorkingCopy);
            }
            // Store pending resolve to avoid race conditions
            this.mapResourceToPendingWorkingCopyResolve.set(resource, workingCopyResolve);
            // Make known to manager (if not already known)
            this.add(resource, workingCopy);
            // Emit some events if we created the working copy
            if (didCreateWorkingCopy) {
                this._onDidCreate.fire(workingCopy);
                // If the working copy is dirty right from the beginning,
                // make sure to emit this as an event
                if (workingCopy.isDirty()) {
                    this._onDidChangeDirty.fire(workingCopy);
                }
            }
            try {
                // Wait for working copy to resolve
                await workingCopyResolve;
                // Remove from pending resolves
                this.mapResourceToPendingWorkingCopyResolve.delete(resource);
                // File working copy can be dirty if a backup was restored, so we make sure to
                // have this event delivered if we created the working copy here
                if (didCreateWorkingCopy && workingCopy.isDirty()) {
                    this._onDidChangeDirty.fire(workingCopy);
                }
                return workingCopy;
            }
            catch (error) {
                // Free resources of this invalid working copy
                if (workingCopy) {
                    workingCopy.dispose();
                }
                // Remove from pending resolves
                this.mapResourceToPendingWorkingCopyResolve.delete(resource);
                throw error;
            }
        }
        joinPendingResolve(resource) {
            const pendingWorkingCopyResolve = this.mapResourceToPendingWorkingCopyResolve.get(resource);
            if (pendingWorkingCopyResolve) {
                return pendingWorkingCopyResolve.then(undefined, error => { });
            }
            return undefined;
        }
        registerWorkingCopy(workingCopy) {
            // Install working copy listeners
            const workingCopyListeners = new lifecycle_1.DisposableStore();
            workingCopyListeners.add(workingCopy.onDidResolve(() => this._onDidResolve.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidSaveError(() => this._onDidSaveError.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onDidSave(reason => this._onDidSave.fire({ workingCopy: workingCopy, reason })));
            workingCopyListeners.add(workingCopy.onDidRevert(() => this._onDidRevert.fire(workingCopy)));
            // Keep for disposal
            this.mapResourceToWorkingCopyListeners.set(workingCopy.resource, workingCopyListeners);
        }
        add(resource, workingCopy) {
            const knownWorkingCopy = this.mapResourceToWorkingCopy.get(resource);
            if (knownWorkingCopy === workingCopy) {
                return; // already cached
            }
            // Dispose any previously stored dispose listener for this resource
            const disposeListener = this.mapResourceToDisposeListener.get(resource);
            if (disposeListener) {
                disposeListener.dispose();
            }
            // Store in cache but remove when working copy gets disposed
            this.mapResourceToWorkingCopy.set(resource, workingCopy);
            this.mapResourceToDisposeListener.set(resource, workingCopy.onWillDispose(() => this.remove(resource)));
        }
        remove(resource) {
            this.mapResourceToWorkingCopy.delete(resource);
            const disposeListener = this.mapResourceToDisposeListener.get(resource);
            if (disposeListener) {
                (0, lifecycle_1.dispose)(disposeListener);
                this.mapResourceToDisposeListener.delete(resource);
            }
            const workingCopyListener = this.mapResourceToWorkingCopyListeners.get(resource);
            if (workingCopyListener) {
                (0, lifecycle_1.dispose)(workingCopyListener);
                this.mapResourceToWorkingCopyListeners.delete(resource);
            }
        }
        clear() {
            // Working copy caches
            this.mapResourceToWorkingCopy.clear();
            this.mapResourceToPendingWorkingCopyResolve.clear();
            // Dispose the dispose listeners
            this.mapResourceToDisposeListener.forEach(listener => listener.dispose());
            this.mapResourceToDisposeListener.clear();
            // Dispose the working copy change listeners
            this.mapResourceToWorkingCopyListeners.forEach(listener => listener.dispose());
            this.mapResourceToWorkingCopyListeners.clear();
        }
        //#endregion
        //#region Save As...
        async saveAs(source, target, options) {
            var _a;
            // If not provided, ask user for target
            if (!target) {
                target = await this.fileDialogService.pickFileToSave((_a = options === null || options === void 0 ? void 0 : options.suggestedTarget) !== null && _a !== void 0 ? _a : source);
                if (!target) {
                    return undefined; // user canceled
                }
            }
            // Do it
            return this.doSaveAs(source, target, options);
        }
        async doSaveAs(source, target, options) {
            let sourceContents;
            // If the source is an existing file working copy, we can directly
            // use that to copy the contents to the target destination
            const sourceWorkingCopy = this.get(source);
            if (sourceWorkingCopy === null || sourceWorkingCopy === void 0 ? void 0 : sourceWorkingCopy.isResolved()) {
                sourceContents = await sourceWorkingCopy.model.snapshot(cancellation_1.CancellationToken.None);
            }
            // Otherwise we resolve the contents from the underlying file
            else {
                sourceContents = (await this.fileService.readFileStream(source)).value;
            }
            // Save the contents through working copy to benefit from save
            // participants and handling a potential already existing target
            return this.doSaveAsWorkingCopy(source, sourceContents, target, options);
        }
        async doSaveAsWorkingCopy(source, sourceContents, target, options) {
            var _a;
            // Prefer an existing working copy if it is already resolved
            // for the given target resource
            let targetExists = false;
            let targetWorkingCopy = this.get(target);
            if (targetWorkingCopy === null || targetWorkingCopy === void 0 ? void 0 : targetWorkingCopy.isResolved()) {
                targetExists = true;
            }
            // Otherwise create the target working copy empty if
            // it does not exist already and resolve it from there
            else {
                targetExists = await this.fileService.exists(target);
                // Create target file adhoc if it does not exist yet
                if (!targetExists) {
                    await this.workingCopyFileService.create([{ resource: target }], cancellation_1.CancellationToken.None);
                }
                // At this point we need to resolve the target working copy
                // and we have to do an explicit check if the source URI
                // equals the target via URI identity. If they match and we
                // have had an existing working copy with the source, we
                // prefer that one over resolving the target. Otherwiese we
                // would potentially introduce a
                if (this.uriIdentityService.extUri.isEqual(source, target) && this.get(source)) {
                    targetWorkingCopy = await this.resolve(source);
                }
                else {
                    targetWorkingCopy = await this.resolve(target);
                }
            }
            // Take over content from source to target
            await ((_a = targetWorkingCopy.model) === null || _a === void 0 ? void 0 : _a.update(sourceContents, cancellation_1.CancellationToken.None));
            // Save target
            await targetWorkingCopy.save(Object.assign(Object.assign({}, options), { force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ }));
            // Revert the source
            await this.doRevert(source);
            return targetWorkingCopy;
        }
        async doRevert(resource) {
            const workingCopy = this.get(resource);
            if (!workingCopy) {
                return undefined;
            }
            return workingCopy.revert();
        }
        //#endregion
        //#region Lifecycle
        canDispose(workingCopy) {
            // Quick return if working copy already disposed or not dirty and not resolving
            if (workingCopy.isDisposed() ||
                (!this.mapResourceToPendingWorkingCopyResolve.has(workingCopy.resource) && !workingCopy.isDirty())) {
                return true;
            }
            // Promise based return in all other cases
            return this.doCanDispose(workingCopy);
        }
        async doCanDispose(workingCopy) {
            // If we have a pending working copy resolve, await it first and then try again
            const pendingResolve = this.joinPendingResolve(workingCopy.resource);
            if (pendingResolve) {
                await pendingResolve;
                return this.canDispose(workingCopy);
            }
            // Dirty working copy: we do not allow to dispose dirty working copys
            // to prevent data loss cases. dirty working copys can only be disposed when
            // they are either saved or reverted
            if (workingCopy.isDirty()) {
                await event_1.Event.toPromise(workingCopy.onDidChangeDirty);
                return this.canDispose(workingCopy);
            }
            return true;
        }
        dispose() {
            super.dispose();
            this.clear();
        }
    };
    FileWorkingCopyManager = __decorate([
        __param(2, files_1.IFileService),
        __param(3, lifecycle_2.ILifecycleService),
        __param(4, label_1.ILabelService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, log_1.ILogService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, workingCopyFileService_1.IWorkingCopyFileService),
        __param(9, uriIdentity_1.IUriIdentityService)
    ], FileWorkingCopyManager);
    exports.FileWorkingCopyManager = FileWorkingCopyManager;
});
//# sourceMappingURL=fileWorkingCopyManager.js.map