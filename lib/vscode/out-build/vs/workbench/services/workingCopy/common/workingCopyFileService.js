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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/cancellation", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyFileOperationParticipant"], function (require, exports, instantiation_1, extensions_1, async_1, arrays_1, lifecycle_1, files_1, cancellation_1, workingCopyService_1, uriIdentity_1, workingCopyFileOperationParticipant_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkingCopyFileService = exports.IWorkingCopyFileService = void 0;
    exports.IWorkingCopyFileService = (0, instantiation_1.createDecorator)('workingCopyFileService');
    let WorkingCopyFileService = class WorkingCopyFileService extends lifecycle_1.Disposable {
        constructor(fileService, workingCopyService, instantiationService, uriIdentityService) {
            super();
            this.fileService = fileService;
            this.workingCopyService = workingCopyService;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            //#region Events
            this._onWillRunWorkingCopyFileOperation = this._register(new async_1.AsyncEmitter());
            this.onWillRunWorkingCopyFileOperation = this._onWillRunWorkingCopyFileOperation.event;
            this._onDidFailWorkingCopyFileOperation = this._register(new async_1.AsyncEmitter());
            this.onDidFailWorkingCopyFileOperation = this._onDidFailWorkingCopyFileOperation.event;
            this._onDidRunWorkingCopyFileOperation = this._register(new async_1.AsyncEmitter());
            this.onDidRunWorkingCopyFileOperation = this._onDidRunWorkingCopyFileOperation.event;
            //#endregion
            this.correlationIds = 0;
            //#endregion
            //#region File operation participants
            this.fileOperationParticipants = this._register(this.instantiationService.createInstance(workingCopyFileOperationParticipant_1.WorkingCopyFileOperationParticipant));
            //#endregion
            //#region Path related
            this.workingCopyProviders = [];
            // register a default working copy provider that uses the working copy service
            this._register(this.registerWorkingCopyProvider(resource => {
                return this.workingCopyService.workingCopies.filter(workingCopy => {
                    if (this.fileService.canHandleResource(resource)) {
                        // only check for parents if the resource can be handled
                        // by the file system where we then assume a folder like
                        // path structure
                        return this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, resource);
                    }
                    return this.uriIdentityService.extUri.isEqual(workingCopy.resource, resource);
                });
            }));
        }
        //#region File operations
        create(operations, token, undoInfo) {
            return this.doCreateFileOrFolder(operations, true, token, undoInfo);
        }
        createFolder(operations, token, undoInfo) {
            return this.doCreateFileOrFolder(operations, false, token, undoInfo);
        }
        async doCreateFileOrFolder(operations, isFile, token, undoInfo) {
            if (operations.length === 0) {
                return [];
            }
            // validate create operation before starting
            if (isFile) {
                const validateCreates = await async_1.Promises.settled(operations.map(operation => this.fileService.canCreateFile(operation.resource, { overwrite: operation.overwrite })));
                const error = validateCreates.find(validateCreate => validateCreate instanceof Error);
                if (error instanceof Error) {
                    throw error;
                }
            }
            // file operation participant
            const files = operations.map(operation => ({ target: operation.resource }));
            await this.runFileOperationParticipants(files, 0 /* CREATE */, undoInfo, token);
            // before events
            const event = { correlationId: this.correlationIds++, operation: 0 /* CREATE */, files };
            await this._onWillRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            // now actually create on disk
            let stats;
            try {
                if (isFile) {
                    stats = await async_1.Promises.settled(operations.map(operation => this.fileService.createFile(operation.resource, operation.contents, { overwrite: operation.overwrite })));
                }
                else {
                    stats = await async_1.Promises.settled(operations.map(operation => this.fileService.createFolder(operation.resource)));
                }
            }
            catch (error) {
                // error event
                await this._onDidFailWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this._onDidRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            return stats;
        }
        async move(operations, token, undoInfo) {
            return this.doMoveOrCopy(operations, true, token, undoInfo);
        }
        async copy(operations, token, undoInfo) {
            return this.doMoveOrCopy(operations, false, token, undoInfo);
        }
        async doMoveOrCopy(operations, move, token, undoInfo) {
            const stats = [];
            // validate move/copy operation before starting
            for (const { file: { source, target }, overwrite } of operations) {
                const validateMoveOrCopy = await (move ? this.fileService.canMove(source, target, overwrite) : this.fileService.canCopy(source, target, overwrite));
                if (validateMoveOrCopy instanceof Error) {
                    throw validateMoveOrCopy;
                }
            }
            // file operation participant
            const files = operations.map(o => o.file);
            await this.runFileOperationParticipants(files, move ? 2 /* MOVE */ : 3 /* COPY */, undoInfo, token);
            // before event
            const event = { correlationId: this.correlationIds++, operation: move ? 2 /* MOVE */ : 3 /* COPY */, files };
            await this._onWillRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            try {
                for (const { file: { source, target }, overwrite } of operations) {
                    // if source and target are not equal, handle dirty working copies
                    // depending on the operation:
                    // - move: revert both source and target (if any)
                    // - copy: revert target (if any)
                    if (!this.uriIdentityService.extUri.isEqual(source, target)) {
                        const dirtyWorkingCopies = (move ? [...this.getDirty(source), ...this.getDirty(target)] : this.getDirty(target));
                        await async_1.Promises.settled(dirtyWorkingCopies.map(dirtyWorkingCopy => dirtyWorkingCopy.revert({ soft: true })));
                    }
                    // now we can rename the source to target via file operation
                    if (move) {
                        stats.push(await this.fileService.move(source, target, overwrite));
                    }
                    else {
                        stats.push(await this.fileService.copy(source, target, overwrite));
                    }
                }
            }
            catch (error) {
                // error event
                await this._onDidFailWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this._onDidRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            return stats;
        }
        async delete(operations, token, undoInfo) {
            // validate delete operation before starting
            for (const operation of operations) {
                const validateDelete = await this.fileService.canDelete(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
                if (validateDelete instanceof Error) {
                    throw validateDelete;
                }
            }
            // file operation participant
            const files = operations.map(operation => ({ target: operation.resource }));
            await this.runFileOperationParticipants(files, 1 /* DELETE */, undoInfo, token);
            // before events
            const event = { correlationId: this.correlationIds++, operation: 1 /* DELETE */, files };
            await this._onWillRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
            // check for any existing dirty working copies for the resource
            // and do a soft revert before deleting to be able to close
            // any opened editor with these working copies
            for (const operation of operations) {
                const dirtyWorkingCopies = this.getDirty(operation.resource);
                await async_1.Promises.settled(dirtyWorkingCopies.map(dirtyWorkingCopy => dirtyWorkingCopy.revert({ soft: true })));
            }
            // now actually delete from disk
            try {
                for (const operation of operations) {
                    await this.fileService.del(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
                }
            }
            catch (error) {
                // error event
                await this._onDidFailWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
                throw error;
            }
            // after event
            await this._onDidRunWorkingCopyFileOperation.fireAsync(event, cancellation_1.CancellationToken.None /* intentional: we currently only forward cancellation to participants */);
        }
        addFileOperationParticipant(participant) {
            return this.fileOperationParticipants.addFileOperationParticipant(participant);
        }
        runFileOperationParticipants(files, operation, undoInfo, token) {
            return this.fileOperationParticipants.participate(files, operation, undoInfo, token);
        }
        registerWorkingCopyProvider(provider) {
            const remove = (0, arrays_1.insert)(this.workingCopyProviders, provider);
            return (0, lifecycle_1.toDisposable)(remove);
        }
        getDirty(resource) {
            const dirtyWorkingCopies = new Set();
            for (const provider of this.workingCopyProviders) {
                for (const workingCopy of provider(resource)) {
                    if (workingCopy.isDirty()) {
                        dirtyWorkingCopies.add(workingCopy);
                    }
                }
            }
            return Array.from(dirtyWorkingCopies);
        }
    };
    WorkingCopyFileService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, workingCopyService_1.IWorkingCopyService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], WorkingCopyFileService);
    exports.WorkingCopyFileService = WorkingCopyFileService;
    (0, extensions_1.registerSingleton)(exports.IWorkingCopyFileService, WorkingCopyFileService, true);
});
//# sourceMappingURL=workingCopyFileService.js.map