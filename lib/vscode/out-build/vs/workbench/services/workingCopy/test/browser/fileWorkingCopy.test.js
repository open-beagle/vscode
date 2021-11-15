/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/uri", "vs/workbench/services/workingCopy/common/fileWorkingCopy", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/resources", "vs/platform/files/common/files", "vs/base/common/async", "vs/base/common/stream"], function (require, exports, assert, event_1, uri_1, fileWorkingCopy_1, buffer_1, cancellation_1, lifecycle_1, workbenchTestServices_1, resources_1, files_1, async_1, stream_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestFileWorkingCopyModelFactory = exports.TestFileWorkingCopyModel = void 0;
    class TestFileWorkingCopyModel extends lifecycle_1.Disposable {
        constructor(resource, contents) {
            super();
            this.resource = resource;
            this.contents = contents;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.versionId = 0;
            this.pushedStackElement = false;
        }
        fireContentChangeEvent(event) {
            this._onDidChangeContent.fire(event);
        }
        updateContents(newContents) {
            this.doUpdate(newContents);
        }
        async snapshot(token) {
            const stream = (0, buffer_1.newWriteableBufferStream)();
            stream.end(buffer_1.VSBuffer.fromString(this.contents));
            return stream;
        }
        async update(contents, token) {
            this.doUpdate((await (0, buffer_1.streamToBuffer)(contents)).toString());
        }
        doUpdate(newContents) {
            this.contents = newContents;
            this.versionId++;
            this._onDidChangeContent.fire({ isRedoing: false, isUndoing: false });
        }
        pushStackElement() {
            this.pushedStackElement = true;
        }
        dispose() {
            this._onWillDispose.fire();
            super.dispose();
        }
    }
    exports.TestFileWorkingCopyModel = TestFileWorkingCopyModel;
    class TestFileWorkingCopyModelFactory {
        async createModel(resource, contents, token) {
            return new TestFileWorkingCopyModel(resource, (await (0, buffer_1.streamToBuffer)(contents)).toString());
        }
    }
    exports.TestFileWorkingCopyModelFactory = TestFileWorkingCopyModelFactory;
    suite('FileWorkingCopy', function () {
        const factory = new TestFileWorkingCopyModelFactory();
        let resource = uri_1.URI.file('test/resource');
        let instantiationService;
        let accessor;
        let workingCopy;
        function createWorkingCopy(uri = resource) {
            return new fileWorkingCopy_1.FileWorkingCopy('testWorkingCopyType', uri, (0, resources_1.basename)(uri), factory, accessor.fileService, accessor.logService, accessor.textFileService, accessor.filesConfigurationService, accessor.workingCopyBackupService, accessor.workingCopyService, accessor.notificationService, accessor.workingCopyEditorService, accessor.editorService, accessor.elevatedFileService);
        }
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
            workingCopy = createWorkingCopy();
        });
        teardown(() => {
            workingCopy.dispose();
        });
        test('requires good file system URI', async () => {
            assert.throws(() => createWorkingCopy(uri_1.URI.from({ scheme: 'unknown', path: 'somePath' })));
        });
        test('orphaned tracking', async () => {
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), false);
            let onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
            accessor.fileService.notExistsSet.add(resource);
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* DELETED */ }], false));
            await onDidChangeOrphanedPromise;
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), true);
            onDidChangeOrphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
            accessor.fileService.notExistsSet.delete(resource);
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 1 /* ADDED */ }], false));
            await onDidChangeOrphanedPromise;
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), false);
        });
        test('dirty', async () => {
            var _a;
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), false);
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            let changeDirtyCounter = 0;
            workingCopy.onDidChangeDirty(() => {
                changeDirtyCounter++;
            });
            let contentChangeCounter = 0;
            workingCopy.onDidChangeContent(() => {
                contentChangeCounter++;
            });
            // Dirty from: Model content change
            (_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.updateContents('hello dirty');
            assert.strictEqual(contentChangeCounter, 1);
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 1);
            await workingCopy.save();
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 2);
            // Dirty from: Initial contents
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello dirty stream')) });
            assert.strictEqual(contentChangeCounter, 2); // content of model did not change
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 3);
            await workingCopy.revert({ soft: true });
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 4);
            // Dirty from: API
            workingCopy.markDirty();
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), true);
            assert.strictEqual(changeDirtyCounter, 5);
            await workingCopy.revert();
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), false);
            assert.strictEqual(changeDirtyCounter, 6);
        });
        test('dirty - working copy marks non-dirty when undo reaches saved version ID', async () => {
            var _a, _b, _c;
            await workingCopy.resolve();
            (_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.updateContents('hello saved state');
            await workingCopy.save();
            assert.strictEqual(workingCopy.isDirty(), false);
            (_b = workingCopy.model) === null || _b === void 0 ? void 0 : _b.updateContents('changing content once');
            assert.strictEqual(workingCopy.isDirty(), true);
            // Simulate an undo that goes back to the last (saved) version ID
            workingCopy.model.versionId--;
            (_c = workingCopy.model) === null || _c === void 0 ? void 0 : _c.fireContentChangeEvent({ isRedoing: false, isUndoing: true });
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('resolve (without backup)', async () => {
            var _a, _b, _c, _d, _e;
            let onDidResolveCounter = 0;
            workingCopy.onDidResolve(() => {
                onDidResolveCounter++;
            });
            // resolve from file
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isResolved(), true);
            assert.strictEqual(onDidResolveCounter, 1);
            assert.strictEqual((_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.contents, 'Hello Html');
            // dirty resolve returns early
            (_b = workingCopy.model) === null || _b === void 0 ? void 0 : _b.updateContents('hello resolve');
            assert.strictEqual(workingCopy.isDirty(), true);
            await workingCopy.resolve();
            assert.strictEqual(onDidResolveCounter, 1);
            assert.strictEqual((_c = workingCopy.model) === null || _c === void 0 ? void 0 : _c.contents, 'hello resolve');
            // dirty resolve with contents updates contents
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello initial contents')) });
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual((_d = workingCopy.model) === null || _d === void 0 ? void 0 : _d.contents, 'hello initial contents');
            assert.strictEqual(onDidResolveCounter, 2);
            // resolve with pending save returns directly
            const pendingSave = workingCopy.save();
            await workingCopy.resolve();
            await pendingSave;
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual((_e = workingCopy.model) === null || _e === void 0 ? void 0 : _e.contents, 'hello initial contents');
            assert.strictEqual(onDidResolveCounter, 2);
            // disposed resolve is not throwing an error
            workingCopy.dispose();
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDisposed(), true);
            assert.strictEqual(onDidResolveCounter, 2);
        });
        test('resolve (with backup)', async () => {
            var _a, _b;
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello backup')) });
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            await accessor.workingCopyBackupService.backup(workingCopy, backup.content, undefined, backup.meta);
            assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
            workingCopy.dispose();
            // first resolve loads from backup
            workingCopy = createWorkingCopy();
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual((_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.contents, 'hello backup');
            workingCopy.model.updateContents('hello updated');
            await workingCopy.save();
            // subsequent resolve ignores any backups
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual((_b = workingCopy.model) === null || _b === void 0 ? void 0 : _b.contents, 'Hello Html');
        });
        test('resolve (with backup, preserves metadata and orphaned state)', async () => {
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello backup')) });
            const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
            accessor.fileService.notExistsSet.add(resource);
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* DELETED */ }], false));
            await orphanedPromise;
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), true);
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            await accessor.workingCopyBackupService.backup(workingCopy, backup.content, undefined, backup.meta);
            assert.strictEqual(accessor.workingCopyBackupService.hasBackupSync(workingCopy), true);
            workingCopy.dispose();
            workingCopy = createWorkingCopy();
            await workingCopy.resolve();
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), true);
            const backup2 = await workingCopy.backup(cancellation_1.CancellationToken.None);
            assert.deepStrictEqual(backup.meta, backup2.meta);
        });
        test('resolve (updates orphaned state accordingly)', async () => {
            await workingCopy.resolve();
            const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
            accessor.fileService.notExistsSet.add(resource);
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* DELETED */ }], false));
            await orphanedPromise;
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), true);
            // resolving clears orphaned state when successful
            accessor.fileService.notExistsSet.delete(resource);
            await workingCopy.resolve({ forceReadFromFile: true });
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), false);
            // resolving adds orphaned state when fail to read
            try {
                accessor.fileService.readShouldThrowError = new files_1.FileOperationError('file not found', 1 /* FILE_NOT_FOUND */);
                await workingCopy.resolve();
                assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), true);
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
        });
        test('resolve (FILE_NOT_MODIFIED_SINCE can be handled for resolved working copies)', async () => {
            var _a;
            await workingCopy.resolve();
            try {
                accessor.fileService.readShouldThrowError = new files_1.FileOperationError('file not modified since', 2 /* FILE_NOT_MODIFIED_SINCE */);
                await workingCopy.resolve();
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual((_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.contents, 'Hello Html');
        });
        test('resolve does not alter content when model content changed in parallel', async () => {
            var _a, _b;
            await workingCopy.resolve();
            const resolvePromise = workingCopy.resolve();
            (_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.updateContents('changed content');
            await resolvePromise;
            assert.strictEqual(workingCopy.isDirty(), true);
            assert.strictEqual((_b = workingCopy.model) === null || _b === void 0 ? void 0 : _b.contents, 'changed content');
        });
        test('backup', async () => {
            var _a;
            await workingCopy.resolve();
            (_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.updateContents('hello backup');
            const backup = await workingCopy.backup(cancellation_1.CancellationToken.None);
            assert.ok(backup.meta);
            let backupContents = undefined;
            if (backup.content instanceof buffer_1.VSBuffer) {
                backupContents = backup.content.toString();
            }
            else if ((0, stream_1.isReadableStream)(backup.content)) {
                backupContents = (await (0, stream_1.consumeStream)(backup.content, chunks => buffer_1.VSBuffer.concat(chunks))).toString();
            }
            else if (backup.content) {
                backupContents = (0, stream_1.consumeReadable)(backup.content, chunks => buffer_1.VSBuffer.concat(chunks)).toString();
            }
            assert.strictEqual(backupContents, 'hello backup');
        });
        test('save (no errors)', async () => {
            var _a, _b, _c, _d, _e, _f;
            let savedCounter = 0;
            let lastSavedReason = undefined;
            workingCopy.onDidSave(reason => {
                savedCounter++;
                lastSavedReason = reason;
            });
            let saveErrorCounter = 0;
            workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            });
            // unresolved
            await workingCopy.save();
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 0);
            // simple
            await workingCopy.resolve();
            (_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.updateContents('hello save');
            await workingCopy.save();
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSavedReason, 1 /* EXPLICIT */);
            assert.strictEqual((_b = workingCopy.model) === null || _b === void 0 ? void 0 : _b.pushedStackElement, true);
            // save reason
            (_c = workingCopy.model) === null || _c === void 0 ? void 0 : _c.updateContents('hello save');
            await workingCopy.save({ reason: 2 /* AUTO */ });
            assert.strictEqual(savedCounter, 2);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(lastSavedReason, 2 /* AUTO */);
            // multiple saves in parallel are fine and result
            // in a single save when content does not change
            (_d = workingCopy.model) === null || _d === void 0 ? void 0 : _d.updateContents('hello save');
            await async_1.Promises.settled([
                workingCopy.save({ reason: 2 /* AUTO */ }),
                workingCopy.save({ reason: 1 /* EXPLICIT */ }),
                workingCopy.save({ reason: 4 /* WINDOW_CHANGE */ })
            ]);
            assert.strictEqual(savedCounter, 3);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            // multiple saves in parallel are fine and result
            // in just one save operation (the second one
            // cancels the first)
            (_e = workingCopy.model) === null || _e === void 0 ? void 0 : _e.updateContents('hello save');
            const firstSave = workingCopy.save();
            (_f = workingCopy.model) === null || _f === void 0 ? void 0 : _f.updateContents('hello save more');
            const secondSave = workingCopy.save();
            await async_1.Promises.settled([firstSave, secondSave]);
            assert.strictEqual(savedCounter, 4);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            // no save when not forced and not dirty
            await workingCopy.save();
            assert.strictEqual(savedCounter, 4);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            // save when forced even when not dirty
            await workingCopy.save({ force: true });
            assert.strictEqual(savedCounter, 5);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            // save clears orphaned
            const orphanedPromise = event_1.Event.toPromise(workingCopy.onDidChangeOrphaned);
            accessor.fileService.notExistsSet.add(resource);
            accessor.fileService.fireFileChanges(new files_1.FileChangesEvent([{ resource, type: 2 /* DELETED */ }], false));
            await orphanedPromise;
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), true);
            await workingCopy.save({ force: true });
            assert.strictEqual(savedCounter, 6);
            assert.strictEqual(saveErrorCounter, 0);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual(workingCopy.hasState(4 /* ORPHAN */), false);
        });
        test('save (errors)', async () => {
            let savedCounter = 0;
            workingCopy.onDidSave(reason => {
                savedCounter++;
            });
            let saveErrorCounter = 0;
            workingCopy.onDidSaveError(() => {
                saveErrorCounter++;
            });
            await workingCopy.resolve();
            // save error: any error marks working copy dirty
            try {
                accessor.fileService.writeShouldThrowError = new files_1.FileOperationError('write error', 6 /* FILE_PERMISSION_DENIED */);
                await workingCopy.save({ force: true });
            }
            catch (error) {
                // error is expected
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save is a no-op unless forced when in error case
            await workingCopy.save({ reason: 2 /* AUTO */ });
            assert.strictEqual(savedCounter, 0);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save clears error flags when successful
            await workingCopy.save({ reason: 1 /* EXPLICIT */ });
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 1);
            assert.strictEqual(workingCopy.hasState(5 /* ERROR */), false);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), false);
            // save error: conflict
            try {
                accessor.fileService.writeShouldThrowError = new files_1.FileOperationError('write error conflict', 3 /* FILE_MODIFIED_SINCE */);
                await workingCopy.save({ force: true });
            }
            catch (error) {
                // error is expected
            }
            finally {
                accessor.fileService.writeShouldThrowError = undefined;
            }
            assert.strictEqual(savedCounter, 1);
            assert.strictEqual(saveErrorCounter, 2);
            assert.strictEqual(workingCopy.hasState(5 /* ERROR */), true);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* CONFLICT */), true);
            assert.strictEqual(workingCopy.isDirty(), true);
            // save clears error flags when successful
            await workingCopy.save({ reason: 1 /* EXPLICIT */ });
            assert.strictEqual(savedCounter, 2);
            assert.strictEqual(saveErrorCounter, 2);
            assert.strictEqual(workingCopy.hasState(5 /* ERROR */), false);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), false);
            assert.strictEqual(workingCopy.hasState(3 /* CONFLICT */), false);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('revert', async () => {
            var _a, _b, _c, _d, _e, _f;
            await workingCopy.resolve();
            (_a = workingCopy.model) === null || _a === void 0 ? void 0 : _a.updateContents('hello revert');
            let revertedCounter = 0;
            workingCopy.onDidRevert(() => {
                revertedCounter++;
            });
            // revert: soft
            await workingCopy.revert({ soft: true });
            assert.strictEqual(revertedCounter, 1);
            assert.strictEqual(workingCopy.isDirty(), false);
            assert.strictEqual((_b = workingCopy.model) === null || _b === void 0 ? void 0 : _b.contents, 'hello revert');
            // revert: not forced
            await workingCopy.revert();
            assert.strictEqual(revertedCounter, 1);
            assert.strictEqual((_c = workingCopy.model) === null || _c === void 0 ? void 0 : _c.contents, 'hello revert');
            // revert: forced
            await workingCopy.revert({ force: true });
            assert.strictEqual(revertedCounter, 2);
            assert.strictEqual((_d = workingCopy.model) === null || _d === void 0 ? void 0 : _d.contents, 'Hello Html');
            // revert: forced, error
            try {
                (_e = workingCopy.model) === null || _e === void 0 ? void 0 : _e.updateContents('hello revert');
                accessor.fileService.readShouldThrowError = new files_1.FileOperationError('error', 6 /* FILE_PERMISSION_DENIED */);
                await workingCopy.revert({ force: true });
            }
            catch (error) {
                // expected (our error)
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(revertedCounter, 2);
            assert.strictEqual(workingCopy.isDirty(), true);
            // revert: forced, file not found error is ignored
            try {
                (_f = workingCopy.model) === null || _f === void 0 ? void 0 : _f.updateContents('hello revert');
                accessor.fileService.readShouldThrowError = new files_1.FileOperationError('error', 1 /* FILE_NOT_FOUND */);
                await workingCopy.revert({ force: true });
            }
            catch (error) {
                // expected (our error)
            }
            finally {
                accessor.fileService.readShouldThrowError = undefined;
            }
            assert.strictEqual(revertedCounter, 3);
            assert.strictEqual(workingCopy.isDirty(), false);
        });
        test('state', async () => {
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), true);
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello state')) });
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), true);
            const savePromise = workingCopy.save();
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), true);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), false);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), true);
            await savePromise;
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), false);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), false);
        });
        test('joinState', async () => {
            await workingCopy.resolve({ contents: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString('hello state')) });
            workingCopy.save();
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), true);
            await workingCopy.joinState(2 /* PENDING_SAVE */);
            assert.strictEqual(workingCopy.hasState(1 /* DIRTY */), false);
            assert.strictEqual(workingCopy.hasState(0 /* SAVED */), true);
            assert.strictEqual(workingCopy.hasState(2 /* PENDING_SAVE */), false);
        });
        test('isReadonly, isResolved, dispose, isDisposed', async () => {
            assert.strictEqual(workingCopy.isResolved(), false);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.isDisposed(), false);
            await workingCopy.resolve();
            assert.ok(workingCopy.model);
            assert.strictEqual(workingCopy.isResolved(), true);
            assert.strictEqual(workingCopy.isReadonly(), false);
            assert.strictEqual(workingCopy.isDisposed(), false);
            let disposedEvent = false;
            workingCopy.onWillDispose(() => {
                disposedEvent = true;
            });
            let disposedModelEvent = false;
            workingCopy.model.onWillDispose(() => {
                disposedModelEvent = true;
            });
            workingCopy.dispose();
            assert.strictEqual(workingCopy.isDisposed(), true);
            assert.strictEqual(disposedEvent, true);
            assert.strictEqual(disposedModelEvent, true);
        });
    });
});
//# sourceMappingURL=fileWorkingCopy.test.js.map