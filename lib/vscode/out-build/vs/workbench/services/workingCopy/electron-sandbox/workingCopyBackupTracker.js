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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupTracker", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/platform/files/common/files", "vs/platform/native/electron-sandbox/native", "vs/workbench/services/workingCopy/common/workingCopyBackupTracker", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorService", "vs/platform/environment/common/environment", "vs/base/common/cancellation", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/workingCopy/common/workingCopyEditorService"], function (require, exports, nls_1, workingCopyBackup_1, filesConfigurationService_1, workingCopyService_1, lifecycle_1, dialogs_1, severity_1, workspace_1, platform_1, files_1, native_1, workingCopyBackupTracker_1, log_1, editorService_1, environment_1, cancellation_1, progress_1, async_1, editorGroupsService_1, workingCopyEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkingCopyBackupTracker = void 0;
    let NativeWorkingCopyBackupTracker = class NativeWorkingCopyBackupTracker extends workingCopyBackupTracker_1.WorkingCopyBackupTracker {
        constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, editorGroupService, workingCopyEditorService, editorService) {
            super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService);
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.contextService = contextService;
            this.nativeHostService = nativeHostService;
            this.environmentService = environmentService;
            this.progressService = progressService;
            this.editorGroupService = editorGroupService;
        }
        onBeforeShutdown(reason) {
            // Dirty working copies need treatment on shutdown
            const dirtyWorkingCopies = this.workingCopyService.dirtyWorkingCopies;
            if (dirtyWorkingCopies.length) {
                return this.onBeforeShutdownWithDirty(reason, dirtyWorkingCopies);
            }
            // No dirty working copies
            return this.onBeforeShutdownWithoutDirty();
        }
        async onBeforeShutdownWithDirty(reason, dirtyWorkingCopies) {
            // If auto save is enabled, save all non-untitled working copies
            // and then check again for dirty copies
            if (this.filesConfigurationService.getAutoSaveMode() !== 0 /* OFF */) {
                // Save all dirty working copies
                try {
                    await this.doSaveAllBeforeShutdown(false /* not untitled */, 2 /* AUTO */);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error saving dirty working copies: ${error}`); // guard against misbehaving saves, we handle remaining dirty below
                }
                // If we still have dirty working copies, we either have untitled ones or working copies that cannot be saved
                const remainingDirtyWorkingCopies = this.workingCopyService.dirtyWorkingCopies;
                if (remainingDirtyWorkingCopies.length) {
                    return this.handleDirtyBeforeShutdown(remainingDirtyWorkingCopies, reason);
                }
                return false; // no veto (there are no remaining dirty working copies)
            }
            // Auto save is not enabled
            return this.handleDirtyBeforeShutdown(dirtyWorkingCopies, reason);
        }
        async handleDirtyBeforeShutdown(dirtyWorkingCopies, reason) {
            // Trigger backup if configured
            let backups = [];
            let backupError = undefined;
            if (this.filesConfigurationService.isHotExitEnabled) {
                try {
                    const backupResult = await this.backupBeforeShutdown(dirtyWorkingCopies, reason);
                    backups = backupResult.backups;
                    backupError = backupResult.error;
                    if (backups.length === dirtyWorkingCopies.length) {
                        return false; // no veto (backup was successful for all working copies)
                    }
                }
                catch (error) {
                    backupError = error;
                }
            }
            const remainingDirtyWorkingCopies = dirtyWorkingCopies.filter(workingCopy => !backups.includes(workingCopy));
            // We ran a backup but received an error that we show to the user
            if (backupError) {
                if (this.environmentService.isExtensionDevelopment) {
                    this.logService.error(`[backup tracker] error creating backups: ${backupError}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.showErrorDialog((0, nls_1.localize)(0, null), remainingDirtyWorkingCopies, backupError);
                return true; // veto (the backup failed)
            }
            // Since a backup did not happen, we have to confirm for
            // the working copies that did not successfully backup
            try {
                return await this.confirmBeforeShutdown(remainingDirtyWorkingCopies);
            }
            catch (error) {
                if (this.environmentService.isExtensionDevelopment) {
                    this.logService.error(`[backup tracker] error saving or reverting dirty working copies: ${error}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.showErrorDialog((0, nls_1.localize)(1, null), remainingDirtyWorkingCopies, error);
                return true; // veto (save or revert failed)
            }
        }
        showErrorDialog(msg, workingCopies, error) {
            const dirtyWorkingCopies = workingCopies.filter(workingCopy => workingCopy.isDirty());
            const advice = (0, nls_1.localize)(2, null);
            const detail = dirtyWorkingCopies.length
                ? (0, dialogs_1.getFileNamesMessage)(dirtyWorkingCopies.map(x => x.name)) + '\n' + advice
                : advice;
            this.dialogService.show(severity_1.default.Error, msg, [(0, nls_1.localize)(3, null)], { detail });
            this.logService.error(error ? `[backup tracker] ${msg}: ${error}` : `[backup tracker] ${msg}`);
        }
        async backupBeforeShutdown(dirtyWorkingCopies, reason) {
            // When quit is requested skip the confirm callback and attempt to backup all workspaces.
            // When quit is not requested the confirm callback should be shown when the window being
            // closed is the only VS Code window open, except for on Mac where hot exit is only
            // ever activated when quit is requested.
            let doBackup;
            if (this.environmentService.isExtensionDevelopment) {
                doBackup = true; // always backup closing extension development window without asking to speed up debugging
            }
            else {
                switch (reason) {
                    case 1 /* CLOSE */:
                        if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ && this.filesConfigurationService.hotExitConfiguration === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                            doBackup = true; // backup if a folder is open and onExitAndWindowClose is configured
                        }
                        else if (await this.nativeHostService.getWindowCount() > 1 || platform_1.isMacintosh) {
                            doBackup = false; // do not backup if a window is closed that does not cause quitting of the application
                        }
                        else {
                            doBackup = true; // backup if last window is closed on win/linux where the application quits right after
                        }
                        break;
                    case 2 /* QUIT */:
                        doBackup = true; // backup because next start we restore all backups
                        break;
                    case 3 /* RELOAD */:
                        doBackup = true; // backup because after window reload, backups restore
                        break;
                    case 4 /* LOAD */:
                        if (this.contextService.getWorkbenchState() !== 1 /* EMPTY */ && this.filesConfigurationService.hotExitConfiguration === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                            doBackup = true; // backup if a folder is open and onExitAndWindowClose is configured
                        }
                        else {
                            doBackup = false; // do not backup because we are switching contexts
                        }
                        break;
                }
            }
            if (!doBackup) {
                return { backups: [] };
            }
            return this.doBackupBeforeShutdown(dirtyWorkingCopies);
        }
        async doBackupBeforeShutdown(dirtyWorkingCopies) {
            const backups = [];
            let error = undefined;
            await this.withProgressAndCancellation(async (token) => {
                // Perform a backup of all dirty working copies unless a backup already exists
                try {
                    await async_1.Promises.settled(dirtyWorkingCopies.map(async (workingCopy) => {
                        const contentVersion = this.getContentVersion(workingCopy);
                        // Backup exists
                        if (this.workingCopyBackupService.hasBackupSync(workingCopy, contentVersion)) {
                            backups.push(workingCopy);
                        }
                        // Backup does not exist
                        else {
                            const backup = await workingCopy.backup(token);
                            await this.workingCopyBackupService.backup(workingCopy, backup.content, contentVersion, backup.meta, token);
                            backups.push(workingCopy);
                        }
                    }));
                }
                catch (backupError) {
                    error = backupError;
                }
            }, (0, nls_1.localize)(4, null));
            return { backups, error };
        }
        async confirmBeforeShutdown(dirtyWorkingCopies) {
            // Save
            const confirm = await this.fileDialogService.showSaveConfirm(dirtyWorkingCopies.map(workingCopy => workingCopy.name));
            if (confirm === 0 /* SAVE */) {
                const dirtyCountBeforeSave = this.workingCopyService.dirtyCount;
                try {
                    await this.doSaveAllBeforeShutdown(dirtyWorkingCopies, 1 /* EXPLICIT */);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error saving dirty working copies: ${error}`); // guard against misbehaving saves, we handle remaining dirty below
                }
                const savedWorkingCopies = dirtyCountBeforeSave - this.workingCopyService.dirtyCount;
                if (savedWorkingCopies < dirtyWorkingCopies.length) {
                    return true; // veto (save failed or was canceled)
                }
                return this.noVeto(dirtyWorkingCopies); // no veto (dirty saved)
            }
            // Don't Save
            else if (confirm === 1 /* DONT_SAVE */) {
                try {
                    await this.doRevertAllBeforeShutdown(dirtyWorkingCopies);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error reverting dirty working copies: ${error}`); // do not block the shutdown on errors from revert
                }
                return this.noVeto(dirtyWorkingCopies); // no veto (dirty reverted)
            }
            // Cancel
            return true; // veto (user canceled)
        }
        doSaveAllBeforeShutdown(arg1, reason) {
            const dirtyWorkingCopies = Array.isArray(arg1) ? arg1 : this.workingCopyService.dirtyWorkingCopies.filter(workingCopy => {
                if (arg1 === false && (workingCopy.capabilities & 2 /* Untitled */)) {
                    return false; // skip untitled unless explicitly included
                }
                return true;
            });
            return this.withProgressAndCancellation(async () => {
                // Skip save participants on shutdown for performance reasons
                const saveOptions = { skipSaveParticipants: true, reason };
                // First save through the editor service if we save all to benefit
                // from some extras like switching to untitled dirty editors before saving.
                let result = undefined;
                if (typeof arg1 === 'boolean' || dirtyWorkingCopies.length === this.workingCopyService.dirtyCount) {
                    result = await this.editorService.saveAll(Object.assign({ includeUntitled: typeof arg1 === 'boolean' ? arg1 : true }, saveOptions));
                }
                // If we still have dirty working copies, save those directly
                // unless the save was not successful (e.g. cancelled)
                if (result !== false) {
                    await async_1.Promises.settled(dirtyWorkingCopies.map(workingCopy => workingCopy.isDirty() ? workingCopy.save(saveOptions) : Promise.resolve(true)));
                }
            }, (0, nls_1.localize)(5, null));
        }
        doRevertAllBeforeShutdown(dirtyWorkingCopies) {
            return this.withProgressAndCancellation(async () => {
                // Soft revert is good enough on shutdown
                const revertOptions = { soft: true };
                // First revert through the editor service if we revert all
                if (dirtyWorkingCopies.length === this.workingCopyService.dirtyCount) {
                    await this.editorService.revertAll(revertOptions);
                }
                // If we still have dirty working copies, revert those directly
                // unless the revert operation was not successful (e.g. cancelled)
                await async_1.Promises.settled(dirtyWorkingCopies.map(workingCopy => workingCopy.isDirty() ? workingCopy.revert(revertOptions) : Promise.resolve()));
            }, (0, nls_1.localize)(6, null));
        }
        withProgressAndCancellation(promiseFactory, title) {
            const cts = new cancellation_1.CancellationTokenSource();
            return this.progressService.withProgress({
                location: 15 /* Notification */,
                cancellable: true,
                delay: 800,
                title
            }, () => (0, async_1.raceCancellation)(promiseFactory(cts.token), cts.token), () => cts.dispose(true));
        }
        noVeto(backupsToDiscard) {
            if (!this.editorGroupService.isRestored()) {
                return false; // if editors have not restored, we are very likely not up to speed with backups and thus should not discard them
            }
            return async_1.Promises.settled(backupsToDiscard.map(workingCopy => this.workingCopyBackupService.discardBackup(workingCopy))).then(() => false, () => false);
        }
        async onBeforeShutdownWithoutDirty() {
            // If we have proceeded enough that editors and dirty state
            // has restored, we make sure that no backups lure around
            // given we have no known dirty working copy. This helps
            // to clean up stale backups as for example reported in
            // https://github.com/microsoft/vscode/issues/92962
            //
            // However, we never want to discard backups that we know
            // were not restored in the session.
            if (this.editorGroupService.isRestored()) {
                try {
                    // Backups without `typeId` are handed in the legacy backup
                    // restorer still and thus we explicitly don't want to keep
                    // them on shutdown, otherwise they would always come back.
                    // TODO@bpasero remove this check once typeId has been adopted.
                    const backupsToKeep = Array.from(this.unrestoredBackups).filter(unrestoredBackup => unrestoredBackup.typeId.length > 0);
                    await this.workingCopyBackupService.discardBackups(backupsToKeep);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error discarding backups: ${error}`);
                }
            }
            return false; // no veto (no dirty)
        }
    };
    NativeWorkingCopyBackupTracker = __decorate([
        __param(0, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(1, filesConfigurationService_1.IFilesConfigurationService),
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, lifecycle_1.ILifecycleService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, dialogs_1.IDialogService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, native_1.INativeHostService),
        __param(8, log_1.ILogService),
        __param(9, environment_1.IEnvironmentService),
        __param(10, progress_1.IProgressService),
        __param(11, editorGroupsService_1.IEditorGroupsService),
        __param(12, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(13, editorService_1.IEditorService)
    ], NativeWorkingCopyBackupTracker);
    exports.NativeWorkingCopyBackupTracker = NativeWorkingCopyBackupTracker;
});
//# sourceMappingURL=workingCopyBackupTracker.js.map