/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/cancellation", "vs/base/common/async", "vs/platform/editor/common/editor"], function (require, exports, lifecycle_1, cancellation_1, async_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkingCopyBackupTracker = void 0;
    /**
     * The working copy backup tracker deals with:
     * - restoring backups that exist
     * - creating backups for dirty working copies
     * - deleting backups for saved working copies
     * - handling backups on shutdown
     */
    class WorkingCopyBackupTracker extends lifecycle_1.Disposable {
        constructor(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService) {
            super();
            this.workingCopyBackupService = workingCopyBackupService;
            this.workingCopyService = workingCopyService;
            this.logService = logService;
            this.lifecycleService = lifecycleService;
            this.filesConfigurationService = filesConfigurationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.editorService = editorService;
            //#region Backup Creator
            // A map from working copy to a version ID we compute on each content
            // change. This version ID allows to e.g. ask if a backup for a specific
            // content has been made before closing.
            this.mapWorkingCopyToContentVersion = new Map();
            // A map of scheduled pending backups for working copies
            this.pendingBackups = new Map();
            //#endregion
            //#region Backup Restorer
            this.unrestoredBackups = new Set();
            this.whenReady = this.resolveBackupsToRestore();
            // Fill in initial dirty working copies
            this.workingCopyService.dirtyWorkingCopies.forEach(workingCopy => this.onDidRegister(workingCopy));
            this.registerListeners();
        }
        registerListeners() {
            // Working Copy events
            this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
            this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
            this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
            // Lifecycle (handled in subclasses)
            this.lifecycleService.onBeforeShutdown(event => event.veto(this.onBeforeShutdown(event.reason), 'veto.backups'));
            // Once a handler registers, restore backups
            this._register(this.workingCopyEditorService.onDidRegisterHandler(handler => this.restoreBackups(handler)));
        }
        onDidRegister(workingCopy) {
            if (workingCopy.isDirty()) {
                this.scheduleBackup(workingCopy);
            }
        }
        onDidUnregister(workingCopy) {
            // Remove from content version map
            this.mapWorkingCopyToContentVersion.delete(workingCopy);
            // Discard backup
            this.discardBackup(workingCopy);
        }
        onDidChangeDirty(workingCopy) {
            if (workingCopy.isDirty()) {
                this.scheduleBackup(workingCopy);
            }
            else {
                this.discardBackup(workingCopy);
            }
        }
        onDidChangeContent(workingCopy) {
            // Increment content version ID
            const contentVersionId = this.getContentVersion(workingCopy);
            this.mapWorkingCopyToContentVersion.set(workingCopy, contentVersionId + 1);
            // Schedule backup if dirty
            if (workingCopy.isDirty()) {
                // this listener will make sure that the backup is
                // pushed out for as long as the user is still changing
                // the content of the working copy.
                this.scheduleBackup(workingCopy);
            }
        }
        scheduleBackup(workingCopy) {
            // Clear any running backup operation
            this.cancelBackup(workingCopy);
            this.logService.trace(`[backup tracker] scheduling backup`, workingCopy.resource.toString(true), workingCopy.typeId);
            // Schedule new backup
            const cts = new cancellation_1.CancellationTokenSource();
            const handle = setTimeout(async () => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Backup if dirty
                if (workingCopy.isDirty()) {
                    this.logService.trace(`[backup tracker] creating backup`, workingCopy.resource.toString(true), workingCopy.typeId);
                    try {
                        const backup = await workingCopy.backup(cts.token);
                        if (cts.token.isCancellationRequested) {
                            return;
                        }
                        if (workingCopy.isDirty()) {
                            this.logService.trace(`[backup tracker] storing backup`, workingCopy.resource.toString(true), workingCopy.typeId);
                            await this.workingCopyBackupService.backup(workingCopy, backup.content, this.getContentVersion(workingCopy), backup.meta, cts.token);
                        }
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Clear disposable
                this.pendingBackups.delete(workingCopy);
            }, this.getBackupScheduleDelay(workingCopy));
            // Keep in map for disposal as needed
            this.pendingBackups.set(workingCopy, (0, lifecycle_1.toDisposable)(() => {
                this.logService.trace(`[backup tracker] clearing pending backup`, workingCopy.resource.toString(true), workingCopy.typeId);
                cts.dispose(true);
                clearTimeout(handle);
            }));
        }
        getBackupScheduleDelay(workingCopy) {
            let autoSaveMode = this.filesConfigurationService.getAutoSaveMode();
            if (workingCopy.capabilities & 2 /* Untitled */) {
                autoSaveMode = 0 /* OFF */; // auto-save is never on for untitled working copies
            }
            return WorkingCopyBackupTracker.BACKUP_SCHEDULE_DELAYS[autoSaveMode];
        }
        getContentVersion(workingCopy) {
            return this.mapWorkingCopyToContentVersion.get(workingCopy) || 0;
        }
        discardBackup(workingCopy) {
            this.logService.trace(`[backup tracker] discarding backup`, workingCopy.resource.toString(true), workingCopy.typeId);
            // Clear any running backup operation
            this.cancelBackup(workingCopy);
            // Forward to working copy backup service
            this.workingCopyBackupService.discardBackup(workingCopy);
        }
        cancelBackup(workingCopy) {
            (0, lifecycle_1.dispose)(this.pendingBackups.get(workingCopy));
            this.pendingBackups.delete(workingCopy);
        }
        async resolveBackupsToRestore() {
            // Wait for resolving backups until we are restored to reduce startup pressure
            await this.lifecycleService.when(3 /* Restored */);
            // Remember each backup that needs to restore
            for (const backup of await this.workingCopyBackupService.getBackups()) {
                this.unrestoredBackups.add(backup);
            }
        }
        async restoreBackups(handler) {
            // Wait for backups to be resolved
            await this.whenReady;
            // Figure out already opened editors for backups vs
            // non-opened.
            const openedEditorsForBackups = [];
            const nonOpenedEditorsForBackups = [];
            // Ensure each backup that can be handled has an
            // associated editor.
            const restoredBackups = new Set();
            for (const unrestoredBackup of this.unrestoredBackups) {
                const canHandleUnrestoredBackup = handler.handles(unrestoredBackup);
                if (!canHandleUnrestoredBackup) {
                    continue;
                }
                // Collect already opened editors for backup
                let hasOpenedEditorForBackup = false;
                for (const editor of this.editorService.editors) {
                    const isUnrestoredBackupOpened = handler.isOpen(unrestoredBackup, editor);
                    if (isUnrestoredBackupOpened) {
                        openedEditorsForBackups.push(editor);
                        hasOpenedEditorForBackup = true;
                    }
                }
                // Otherwise, make sure to create at least one editor
                // for the backup to show
                if (!hasOpenedEditorForBackup) {
                    nonOpenedEditorsForBackups.push(handler.createEditor(unrestoredBackup));
                }
                // Remember as (potentially) restored
                restoredBackups.add(unrestoredBackup);
            }
            // Ensure editors are opened for each backup without editor
            // in the background without stealing focus
            if (nonOpenedEditorsForBackups.length > 0) {
                await this.editorService.openEditors(nonOpenedEditorsForBackups.map(nonOpenedEditorForBackup => ({
                    editor: nonOpenedEditorForBackup,
                    options: {
                        pinned: true,
                        preserveFocus: true,
                        inactive: true,
                        override: editor_1.EditorOverride.DISABLED
                    }
                })));
                openedEditorsForBackups.push(...nonOpenedEditorsForBackups);
            }
            // Then, resolve each editor to make sure the working copy
            // is loaded and the dirty editor appears properly
            await async_1.Promises.settled(openedEditorsForBackups.map(openedEditorsForBackup => openedEditorsForBackup.resolve()));
            // Finally, remove all handled backups from the list
            for (const restoredBackup of restoredBackups) {
                this.unrestoredBackups.delete(restoredBackup);
            }
        }
    }
    exports.WorkingCopyBackupTracker = WorkingCopyBackupTracker;
    // Delay creation of backups when content changes to avoid too much
    // load on the backup service when the user is typing into the editor
    // Since we always schedule a backup, even when auto save is on, we
    // have different scheduling delays based on auto save. This helps to
    // avoid a (not critical but also not really wanted) race between saving
    // (after 1s per default) and making a backup of the working copy.
    WorkingCopyBackupTracker.BACKUP_SCHEDULE_DELAYS = {
        [0 /* OFF */]: 1000,
        [3 /* ON_FOCUS_CHANGE */]: 1000,
        [4 /* ON_WINDOW_CHANGE */]: 1000,
        [1 /* AFTER_SHORT_DELAY */]: 2000,
        [2 /* AFTER_LONG_DELAY */]: 1000
    };
});
//# sourceMappingURL=workingCopyBackupTracker.js.map