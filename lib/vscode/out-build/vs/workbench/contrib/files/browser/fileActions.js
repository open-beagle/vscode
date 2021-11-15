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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/fileActions", "vs/base/common/platform", "vs/base/common/extpath", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/errorMessage", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/workbench/contrib/files/common/files", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/host/browser/host", "vs/workbench/contrib/files/browser/fileCommands", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/clipboard/common/clipboardService", "vs/editor/common/services/modeService", "vs/editor/common/services/modelService", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/base/common/network", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/arrays", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/errors", "vs/base/browser/dom", "vs/base/common/labels", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/base/common/functional", "vs/base/common/codicons", "vs/workbench/common/views", "vs/base/common/strings", "vs/platform/progress/common/progress", "vs/base/common/cancellation", "vs/platform/log/common/log", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/editor/browser/services/bulkEditService", "vs/workbench/contrib/files/browser/files", "vs/base/common/stream", "vs/platform/editor/common/editor", "vs/workbench/services/editor/common/editorOverrideService"], function (require, exports, nls, platform_1, extpath, path_1, resources, errorMessage_1, actions_1, lifecycle_1, files_1, files_2, editor_1, quickInput_1, viewlet_1, instantiation_1, host_1, fileCommands_1, resolverService_1, configuration_1, clipboardService_1, modeService_1, modelService_1, commands_1, contextkey_1, network_1, dialogs_1, notification_1, editorService_1, editorCommands_1, arrays_1, explorerModel_1, errors_1, dom_1, labels_1, filesConfigurationService_1, workingCopyService_1, async_1, workingCopyFileService_1, functional_1, codicons_1, views_1, strings_1, progress_1, cancellation_1, log_1, uriIdentity_1, bulkEditService_1, files_3, stream_1, editor_2, editorOverrideService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openFilePreserveFocusHandler = exports.pasteFileHandler = exports.DOWNLOAD_COMMAND_ID = exports.cutFileHandler = exports.copyFileHandler = exports.deleteFileHandler = exports.moveFileToTrashHandler = exports.renameHandler = exports.CompareWithClipboardAction = exports.getWellFormedFileName = exports.validateFileName = exports.ShowOpenedFileInNewWindow = exports.ShowActiveFileInExplorer = exports.FocusFilesExplorer = exports.CloseGroupAction = exports.SaveAllInGroupAction = exports.BaseSaveAllAction = exports.ToggleAutoSaveAction = exports.GlobalCompareResourcesAction = exports.incrementFileName = exports.findValidPasteFileTarget = exports.DOWNLOAD_LABEL = exports.FileCopiedContext = exports.PASTE_FILE_LABEL = exports.COPY_FILE_LABEL = exports.MOVE_FILE_TO_TRASH_LABEL = exports.TRIGGER_RENAME_LABEL = exports.NEW_FOLDER_LABEL = exports.NEW_FOLDER_COMMAND_ID = exports.NEW_FILE_LABEL = exports.NEW_FILE_COMMAND_ID = void 0;
    exports.NEW_FILE_COMMAND_ID = 'explorer.newFile';
    exports.NEW_FILE_LABEL = nls.localize(0, null);
    exports.NEW_FOLDER_COMMAND_ID = 'explorer.newFolder';
    exports.NEW_FOLDER_LABEL = nls.localize(1, null);
    exports.TRIGGER_RENAME_LABEL = nls.localize(2, null);
    exports.MOVE_FILE_TO_TRASH_LABEL = nls.localize(3, null);
    exports.COPY_FILE_LABEL = nls.localize(4, null);
    exports.PASTE_FILE_LABEL = nls.localize(5, null);
    exports.FileCopiedContext = new contextkey_1.RawContextKey('fileCopied', false);
    exports.DOWNLOAD_LABEL = nls.localize(6, null);
    const CONFIRM_DELETE_SETTING_KEY = 'explorer.confirmDelete';
    const MAX_UNDO_FILE_SIZE = 5000000; // 5mb
    function onError(notificationService, error) {
        if (error.message === 'string') {
            error = error.message;
        }
        notificationService.error((0, errorMessage_1.toErrorMessage)(error, false));
    }
    async function refreshIfSeparator(value, explorerService) {
        if (value && ((value.indexOf('/') >= 0) || (value.indexOf('\\') >= 0))) {
            // New input contains separator, multiple resources will get created workaround for #68204
            await explorerService.refresh();
        }
    }
    async function deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, elements, useTrash, skipConfirm = false) {
        let primaryButton;
        if (useTrash) {
            primaryButton = platform_1.isWindows ? nls.localize(7, null) : nls.localize(8, null);
        }
        else {
            primaryButton = nls.localize(9, null);
        }
        // Handle dirty
        const distinctElements = resources.distinctParents(elements, e => e.resource);
        const dirtyWorkingCopies = new Set();
        for (const distinctElement of distinctElements) {
            for (const dirtyWorkingCopy of workingCopyFileService.getDirty(distinctElement.resource)) {
                dirtyWorkingCopies.add(dirtyWorkingCopy);
            }
        }
        let confirmed = true;
        if (dirtyWorkingCopies.size) {
            let message;
            if (distinctElements.length > 1) {
                message = nls.localize(10, null);
            }
            else if (distinctElements[0].isDirectory) {
                if (dirtyWorkingCopies.size === 1) {
                    message = nls.localize(11, null, distinctElements[0].name);
                }
                else {
                    message = nls.localize(12, null, distinctElements[0].name, dirtyWorkingCopies.size);
                }
            }
            else {
                message = nls.localize(13, null, distinctElements[0].name);
            }
            const response = await dialogService.confirm({
                message,
                type: 'warning',
                detail: nls.localize(14, null),
                primaryButton
            });
            if (!response.confirmed) {
                confirmed = false;
            }
            else {
                skipConfirm = true;
            }
        }
        // Check if file is dirty in editor and save it to avoid data loss
        if (!confirmed) {
            return;
        }
        let confirmation;
        // We do not support undo of folders, so in that case the delete action is irreversible
        const deleteDetail = distinctElements.some(e => e.isDirectory) ? nls.localize(15, null) :
            distinctElements.length > 1 ? nls.localize(16, null) : nls.localize(17, null);
        // Check if we need to ask for confirmation at all
        if (skipConfirm || (useTrash && configurationService.getValue(CONFIRM_DELETE_SETTING_KEY) === false)) {
            confirmation = { confirmed: true };
        }
        // Confirm for moving to trash
        else if (useTrash) {
            let { message, detail } = getMoveToTrashMessage(distinctElements);
            detail += detail ? '\n' : '';
            if (platform_1.isWindows) {
                detail += distinctElements.length > 1 ? nls.localize(18, null) : nls.localize(19, null);
            }
            else {
                detail += distinctElements.length > 1 ? nls.localize(20, null) : nls.localize(21, null);
            }
            confirmation = await dialogService.confirm({
                message,
                detail,
                primaryButton,
                checkbox: {
                    label: nls.localize(22, null)
                },
                type: 'question'
            });
        }
        // Confirm for deleting permanently
        else {
            let { message, detail } = getDeleteMessage(distinctElements);
            detail += detail ? '\n' : '';
            detail += deleteDetail;
            confirmation = await dialogService.confirm({
                message,
                detail,
                primaryButton,
                type: 'warning'
            });
        }
        // Check for confirmation checkbox
        if (confirmation.confirmed && confirmation.checkboxChecked === true) {
            await configurationService.updateValue(CONFIRM_DELETE_SETTING_KEY, false);
        }
        // Check for confirmation
        if (!confirmation.confirmed) {
            return;
        }
        // Call function
        try {
            const resourceFileEdits = distinctElements.map(e => new bulkEditService_1.ResourceFileEdit(e.resource, undefined, { recursive: true, folder: e.isDirectory, skipTrashBin: !useTrash, maxSize: MAX_UNDO_FILE_SIZE }));
            const options = {
                undoLabel: distinctElements.length > 1 ? nls.localize(23, null, distinctElements.length) : nls.localize(24, null, distinctElements[0].name),
                progressLabel: distinctElements.length > 1 ? nls.localize(25, null, distinctElements.length) : nls.localize(26, null, distinctElements[0].name),
            };
            await explorerService.applyBulkEdit(resourceFileEdits, options);
        }
        catch (error) {
            // Handle error to delete file(s) from a modal confirmation dialog
            let errorMessage;
            let detailMessage;
            let primaryButton;
            if (useTrash) {
                errorMessage = platform_1.isWindows ? nls.localize(27, null) : nls.localize(28, null);
                detailMessage = deleteDetail;
                primaryButton = nls.localize(29, null);
            }
            else {
                errorMessage = (0, errorMessage_1.toErrorMessage)(error, false);
                primaryButton = nls.localize(30, null);
            }
            const res = await dialogService.confirm({
                message: errorMessage,
                detail: detailMessage,
                type: 'warning',
                primaryButton
            });
            if (res.confirmed) {
                if (useTrash) {
                    useTrash = false; // Delete Permanently
                }
                skipConfirm = true;
                return deleteFiles(explorerService, workingCopyFileService, dialogService, configurationService, elements, useTrash, skipConfirm);
            }
        }
    }
    function getMoveToTrashMessage(distinctElements) {
        if (containsBothDirectoryAndFile(distinctElements)) {
            return {
                message: nls.localize(31, null, distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize(32, null, distinctElements.length),
                    detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize(33, null, distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory) {
            return { message: nls.localize(34, null, distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize(35, null, distinctElements[0].name), detail: '' };
    }
    function getDeleteMessage(distinctElements) {
        if (containsBothDirectoryAndFile(distinctElements)) {
            return {
                message: nls.localize(36, null, distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements.length > 1) {
            if (distinctElements[0].isDirectory) {
                return {
                    message: nls.localize(37, null, distinctElements.length),
                    detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
                };
            }
            return {
                message: nls.localize(38, null, distinctElements.length),
                detail: (0, dialogs_1.getFileNamesMessage)(distinctElements.map(e => e.resource))
            };
        }
        if (distinctElements[0].isDirectory) {
            return { message: nls.localize(39, null, distinctElements[0].name), detail: '' };
        }
        return { message: nls.localize(40, null, distinctElements[0].name), detail: '' };
    }
    function containsBothDirectoryAndFile(distinctElements) {
        const directory = distinctElements.find(element => element.isDirectory);
        const file = distinctElements.find(element => !element.isDirectory);
        return !!directory && !!file;
    }
    function findValidPasteFileTarget(explorerService, targetFolder, fileToPaste, incrementalNaming) {
        let name = resources.basenameOrAuthority(fileToPaste.resource);
        let candidate = resources.joinPath(targetFolder.resource, name);
        while (true && !fileToPaste.allowOverwrite) {
            if (!explorerService.findClosest(candidate)) {
                break;
            }
            name = incrementFileName(name, !!fileToPaste.isDirectory, incrementalNaming);
            candidate = resources.joinPath(targetFolder.resource, name);
        }
        return candidate;
    }
    exports.findValidPasteFileTarget = findValidPasteFileTarget;
    function incrementFileName(name, isFolder, incrementalNaming) {
        if (incrementalNaming === 'simple') {
            let namePrefix = name;
            let extSuffix = '';
            if (!isFolder) {
                extSuffix = (0, path_1.extname)(name);
                namePrefix = (0, path_1.basename)(name, extSuffix);
            }
            // name copy 5(.txt) => name copy 6(.txt)
            // name copy(.txt) => name copy 2(.txt)
            const suffixRegex = /^(.+ copy)( \d+)?$/;
            if (suffixRegex.test(namePrefix)) {
                return namePrefix.replace(suffixRegex, (match, g1, g2) => {
                    let number = (g2 ? parseInt(g2) : 1);
                    return number === 0
                        ? `${g1}`
                        : (number < 1073741824 /* MAX_SAFE_SMALL_INTEGER */
                            ? `${g1} ${number + 1}`
                            : `${g1}${g2} copy`);
                }) + extSuffix;
            }
            // name(.txt) => name copy(.txt)
            return `${namePrefix} copy${extSuffix}`;
        }
        const separators = '[\\.\\-_]';
        const maxNumber = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
        // file.1.txt=>file.2.txt
        let suffixFileRegex = RegExp('(.*' + separators + ')(\\d+)(\\..*)$');
        if (!isFolder && name.match(suffixFileRegex)) {
            return name.replace(suffixFileRegex, (match, g1, g2, g3) => {
                let number = parseInt(g2);
                return number < maxNumber
                    ? g1 + String(number + 1).padStart(g2.length, '0') + g3
                    : `${g1}${g2}.1${g3}`;
            });
        }
        // 1.file.txt=>2.file.txt
        let prefixFileRegex = RegExp('(\\d+)(' + separators + '.*)(\\..*)$');
        if (!isFolder && name.match(prefixFileRegex)) {
            return name.replace(prefixFileRegex, (match, g1, g2, g3) => {
                let number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0') + g2 + g3
                    : `${g1}${g2}.1${g3}`;
            });
        }
        // 1.txt=>2.txt
        let prefixFileNoNameRegex = RegExp('(\\d+)(\\..*)$');
        if (!isFolder && name.match(prefixFileNoNameRegex)) {
            return name.replace(prefixFileNoNameRegex, (match, g1, g2) => {
                let number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0') + g2
                    : `${g1}.1${g2}`;
            });
        }
        // file.txt=>file.1.txt
        const lastIndexOfDot = name.lastIndexOf('.');
        if (!isFolder && lastIndexOfDot >= 0) {
            return `${name.substr(0, lastIndexOfDot)}.1${name.substr(lastIndexOfDot)}`;
        }
        // 123 => 124
        let noNameNoExtensionRegex = RegExp('(\\d+)$');
        if (!isFolder && lastIndexOfDot === -1 && name.match(noNameNoExtensionRegex)) {
            return name.replace(noNameNoExtensionRegex, (match, g1) => {
                let number = parseInt(g1);
                return number < maxNumber
                    ? String(number + 1).padStart(g1.length, '0')
                    : `${g1}.1`;
            });
        }
        // file => file1
        // file1 => file2
        let noExtensionRegex = RegExp('(.*)(\\d*)$');
        if (!isFolder && lastIndexOfDot === -1 && name.match(noExtensionRegex)) {
            return name.replace(noExtensionRegex, (match, g1, g2) => {
                let number = parseInt(g2);
                if (isNaN(number)) {
                    number = 0;
                }
                return number < maxNumber
                    ? g1 + String(number + 1).padStart(g2.length, '0')
                    : `${g1}${g2}.1`;
            });
        }
        // folder.1=>folder.2
        if (isFolder && name.match(/(\d+)$/)) {
            return name.replace(/(\d+)$/, (match, ...groups) => {
                let number = parseInt(groups[0]);
                return number < maxNumber
                    ? String(number + 1).padStart(groups[0].length, '0')
                    : `${groups[0]}.1`;
            });
        }
        // 1.folder=>2.folder
        if (isFolder && name.match(/^(\d+)/)) {
            return name.replace(/^(\d+)(.*)$/, (match, ...groups) => {
                let number = parseInt(groups[0]);
                return number < maxNumber
                    ? String(number + 1).padStart(groups[0].length, '0') + groups[1]
                    : `${groups[0]}${groups[1]}.1`;
            });
        }
        // file/folder=>file.1/folder.1
        return `${name}.1`;
    }
    exports.incrementFileName = incrementFileName;
    // Global Compare with
    let GlobalCompareResourcesAction = class GlobalCompareResourcesAction extends actions_1.Action {
        constructor(id, label, quickInputService, editorService, textModelService, editorOverrideService) {
            super(id, label);
            this.quickInputService = quickInputService;
            this.editorService = editorService;
            this.textModelService = textModelService;
            this.editorOverrideService = editorOverrideService;
        }
        async run() {
            const activeInput = this.editorService.activeEditor;
            const activeResource = editor_1.EditorResourceAccessor.getOriginalUri(activeInput);
            if (activeResource && this.textModelService.canHandleResource(activeResource)) {
                // Define a one-time override that has highest priority
                // and matches every resource to be able to create a
                // diff editor to show the comparison.
                const editorOverrideDisposable = this.editorOverrideService.registerContributionPoint('*', {
                    id: GlobalCompareResourcesAction.ID,
                    label: GlobalCompareResourcesAction.LABEL,
                    priority: editorOverrideService_1.ContributedEditorPriority.exclusive,
                    detail: '',
                    describes: () => false
                }, {}, resource => {
                    // Only once!
                    editorOverrideDisposable.dispose();
                    // Open editor as diff if the selected editor resource
                    // can be handled by the text model service
                    if (this.textModelService.canHandleResource(resource)) {
                        return {
                            editor: this.editorService.createEditorInput({
                                leftResource: activeResource,
                                rightResource: resource,
                                options: { override: editor_2.EditorOverride.DISABLED, pinned: true }
                            })
                        };
                    }
                    // Otherwise stay on current resource
                    return {
                        editor: this.editorService.createEditorInput({
                            resource: activeResource,
                            options: { override: editor_2.EditorOverride.DISABLED, pinned: true }
                        })
                    };
                });
                (0, functional_1.once)(this.quickInputService.onHide)((async () => {
                    await (0, async_1.timeout)(0); // prevent race condition with editor
                    editorOverrideDisposable.dispose();
                }));
                // Bring up quick access
                this.quickInputService.quickAccess.show('', { itemActivation: quickInput_1.ItemActivation.SECOND });
            }
        }
    };
    GlobalCompareResourcesAction.ID = 'workbench.files.action.compareFileWith';
    GlobalCompareResourcesAction.LABEL = nls.localize(41, null);
    GlobalCompareResourcesAction = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, editorService_1.IEditorService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, editorOverrideService_1.IEditorOverrideService)
    ], GlobalCompareResourcesAction);
    exports.GlobalCompareResourcesAction = GlobalCompareResourcesAction;
    let ToggleAutoSaveAction = class ToggleAutoSaveAction extends actions_1.Action {
        constructor(id, label, filesConfigurationService) {
            super(id, label);
            this.filesConfigurationService = filesConfigurationService;
        }
        run() {
            return this.filesConfigurationService.toggleAutoSave();
        }
    };
    ToggleAutoSaveAction.ID = 'workbench.action.toggleAutoSave';
    ToggleAutoSaveAction.LABEL = nls.localize(42, null);
    ToggleAutoSaveAction = __decorate([
        __param(2, filesConfigurationService_1.IFilesConfigurationService)
    ], ToggleAutoSaveAction);
    exports.ToggleAutoSaveAction = ToggleAutoSaveAction;
    let BaseSaveAllAction = class BaseSaveAllAction extends actions_1.Action {
        constructor(id, label, commandService, notificationService, workingCopyService) {
            super(id, label);
            this.commandService = commandService;
            this.notificationService = notificationService;
            this.workingCopyService = workingCopyService;
            this.lastDirtyState = this.workingCopyService.hasDirty;
            this.enabled = this.lastDirtyState;
            this.registerListeners();
        }
        registerListeners() {
            // update enablement based on working copy changes
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.updateEnablement(workingCopy)));
        }
        updateEnablement(workingCopy) {
            const hasDirty = workingCopy.isDirty() || this.workingCopyService.hasDirty;
            if (this.lastDirtyState !== hasDirty) {
                this.enabled = hasDirty;
                this.lastDirtyState = this.enabled;
            }
        }
        async run(context) {
            try {
                await this.doRun(context);
            }
            catch (error) {
                onError(this.notificationService, error);
            }
        }
    };
    BaseSaveAllAction = __decorate([
        __param(2, commands_1.ICommandService),
        __param(3, notification_1.INotificationService),
        __param(4, workingCopyService_1.IWorkingCopyService)
    ], BaseSaveAllAction);
    exports.BaseSaveAllAction = BaseSaveAllAction;
    class SaveAllInGroupAction extends BaseSaveAllAction {
        get class() {
            return 'explorer-action ' + codicons_1.Codicon.saveAll.classNames;
        }
        doRun(context) {
            return this.commandService.executeCommand(fileCommands_1.SAVE_ALL_IN_GROUP_COMMAND_ID, {}, context);
        }
    }
    exports.SaveAllInGroupAction = SaveAllInGroupAction;
    SaveAllInGroupAction.ID = 'workbench.files.action.saveAllInGroup';
    SaveAllInGroupAction.LABEL = nls.localize(43, null);
    let CloseGroupAction = class CloseGroupAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, codicons_1.Codicon.closeAll.classNames);
            this.commandService = commandService;
        }
        run(context) {
            return this.commandService.executeCommand(editorCommands_1.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, {}, context);
        }
    };
    CloseGroupAction.ID = 'workbench.files.action.closeGroup';
    CloseGroupAction.LABEL = nls.localize(44, null);
    CloseGroupAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], CloseGroupAction);
    exports.CloseGroupAction = CloseGroupAction;
    let FocusFilesExplorer = class FocusFilesExplorer extends actions_1.Action {
        constructor(id, label, viewletService) {
            super(id, label);
            this.viewletService = viewletService;
        }
        async run() {
            await this.viewletService.openViewlet(files_1.VIEWLET_ID, true);
        }
    };
    FocusFilesExplorer.ID = 'workbench.files.action.focusFilesExplorer';
    FocusFilesExplorer.LABEL = nls.localize(45, null);
    FocusFilesExplorer = __decorate([
        __param(2, viewlet_1.IViewletService)
    ], FocusFilesExplorer);
    exports.FocusFilesExplorer = FocusFilesExplorer;
    let ShowActiveFileInExplorer = class ShowActiveFileInExplorer extends actions_1.Action {
        constructor(id, label, editorService, commandService) {
            super(id, label);
            this.editorService = editorService;
            this.commandService = commandService;
        }
        async run() {
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (resource) {
                this.commandService.executeCommand(fileCommands_1.REVEAL_IN_EXPLORER_COMMAND_ID, resource);
            }
        }
    };
    ShowActiveFileInExplorer.ID = 'workbench.files.action.showActiveFileInExplorer';
    ShowActiveFileInExplorer.LABEL = nls.localize(46, null);
    ShowActiveFileInExplorer = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, commands_1.ICommandService)
    ], ShowActiveFileInExplorer);
    exports.ShowActiveFileInExplorer = ShowActiveFileInExplorer;
    let ShowOpenedFileInNewWindow = class ShowOpenedFileInNewWindow extends actions_1.Action {
        constructor(id, label, editorService, hostService, notificationService, fileService) {
            super(id, label);
            this.editorService = editorService;
            this.hostService = hostService;
            this.notificationService = notificationService;
            this.fileService = fileService;
        }
        async run() {
            const fileResource = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            if (fileResource) {
                if (this.fileService.canHandleResource(fileResource)) {
                    this.hostService.openWindow([{ fileUri: fileResource }], { forceNewWindow: true });
                }
                else {
                    this.notificationService.info(nls.localize(48, null));
                }
            }
        }
    };
    ShowOpenedFileInNewWindow.ID = 'workbench.action.files.showOpenedFileInNewWindow';
    ShowOpenedFileInNewWindow.LABEL = nls.localize(47, null);
    ShowOpenedFileInNewWindow = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, host_1.IHostService),
        __param(4, notification_1.INotificationService),
        __param(5, files_2.IFileService)
    ], ShowOpenedFileInNewWindow);
    exports.ShowOpenedFileInNewWindow = ShowOpenedFileInNewWindow;
    function validateFileName(item, name) {
        // Produce a well formed file name
        name = getWellFormedFileName(name);
        // Name not provided
        if (!name || name.length === 0 || /^\s+$/.test(name)) {
            return {
                content: nls.localize(49, null),
                severity: notification_1.Severity.Error
            };
        }
        // Relative paths only
        if (name[0] === '/' || name[0] === '\\') {
            return {
                content: nls.localize(50, null),
                severity: notification_1.Severity.Error
            };
        }
        const names = (0, arrays_1.coalesce)(name.split(/[\\/]/));
        const parent = item.parent;
        if (name !== item.name) {
            // Do not allow to overwrite existing file
            const child = parent === null || parent === void 0 ? void 0 : parent.getChild(name);
            if (child && child !== item) {
                return {
                    content: nls.localize(51, null, name),
                    severity: notification_1.Severity.Error
                };
            }
        }
        // Invalid File name
        const windowsBasenameValidity = item.resource.scheme === network_1.Schemas.file && platform_1.isWindows;
        if (names.some((folderName) => !extpath.isValidBasename(folderName, windowsBasenameValidity))) {
            return {
                content: nls.localize(52, null, trimLongName(name)),
                severity: notification_1.Severity.Error
            };
        }
        if (names.some(name => /^\s|\s$/.test(name))) {
            return {
                content: nls.localize(53, null),
                severity: notification_1.Severity.Warning
            };
        }
        return null;
    }
    exports.validateFileName = validateFileName;
    function trimLongName(name) {
        if ((name === null || name === void 0 ? void 0 : name.length) > 255) {
            return `${name.substr(0, 255)}...`;
        }
        return name;
    }
    function getWellFormedFileName(filename) {
        if (!filename) {
            return filename;
        }
        // Trim tabs
        filename = (0, strings_1.trim)(filename, '\t');
        // Remove trailing dots and slashes
        filename = (0, strings_1.rtrim)(filename, '.');
        filename = (0, strings_1.rtrim)(filename, '/');
        filename = (0, strings_1.rtrim)(filename, '\\');
        return filename;
    }
    exports.getWellFormedFileName = getWellFormedFileName;
    let CompareWithClipboardAction = class CompareWithClipboardAction extends actions_1.Action {
        constructor(id, label, editorService, instantiationService, textModelService, fileService) {
            super(id, label);
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.textModelService = textModelService;
            this.fileService = fileService;
            this.enabled = true;
        }
        async run() {
            const resource = editor_1.EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            const scheme = `clipboardCompare${CompareWithClipboardAction.SCHEME_COUNTER++}`;
            if (resource && (this.fileService.canHandleResource(resource) || resource.scheme === network_1.Schemas.untitled)) {
                if (!this.registrationDisposal) {
                    const provider = this.instantiationService.createInstance(ClipboardContentProvider);
                    this.registrationDisposal = this.textModelService.registerTextModelContentProvider(scheme, provider);
                }
                const name = resources.basename(resource);
                const editorLabel = nls.localize(55, null, name);
                await this.editorService.openEditor({
                    leftResource: resource.with({ scheme }),
                    rightResource: resource, label: editorLabel,
                    options: { pinned: true }
                }).finally(() => {
                    (0, lifecycle_1.dispose)(this.registrationDisposal);
                    this.registrationDisposal = undefined;
                });
            }
        }
        dispose() {
            super.dispose();
            (0, lifecycle_1.dispose)(this.registrationDisposal);
            this.registrationDisposal = undefined;
        }
    };
    CompareWithClipboardAction.ID = 'workbench.files.action.compareWithClipboard';
    CompareWithClipboardAction.LABEL = nls.localize(54, null);
    CompareWithClipboardAction.SCHEME_COUNTER = 0;
    CompareWithClipboardAction = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, files_2.IFileService)
    ], CompareWithClipboardAction);
    exports.CompareWithClipboardAction = CompareWithClipboardAction;
    let ClipboardContentProvider = class ClipboardContentProvider {
        constructor(clipboardService, modeService, modelService) {
            this.clipboardService = clipboardService;
            this.modeService = modeService;
            this.modelService = modelService;
        }
        async provideTextContent(resource) {
            const text = await this.clipboardService.readText();
            const model = this.modelService.createModel(text, this.modeService.createByFilepathOrFirstLine(resource), resource);
            return model;
        }
    };
    ClipboardContentProvider = __decorate([
        __param(0, clipboardService_1.IClipboardService),
        __param(1, modeService_1.IModeService),
        __param(2, modelService_1.IModelService)
    ], ClipboardContentProvider);
    function onErrorWithRetry(notificationService, error, retry) {
        notificationService.prompt(notification_1.Severity.Error, (0, errorMessage_1.toErrorMessage)(error, false), [{
                label: nls.localize(56, null),
                run: () => retry()
            }]);
    }
    async function openExplorerAndCreate(accessor, isFolder) {
        const explorerService = accessor.get(files_3.IExplorerService);
        const fileService = accessor.get(files_2.IFileService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const viewsService = accessor.get(views_1.IViewsService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const commandService = accessor.get(commands_1.ICommandService);
        const wasHidden = !viewsService.isViewVisible(files_1.VIEW_ID);
        const view = await viewsService.openView(files_1.VIEW_ID, true);
        if (wasHidden) {
            // Give explorer some time to resolve itself #111218
            await (0, async_1.timeout)(500);
        }
        if (!view) {
            // Can happen in empty workspace case (https://github.com/microsoft/vscode/issues/100604)
            if (isFolder) {
                throw new Error('Open a folder or workspace first.');
            }
            return commandService.executeCommand(fileCommands_1.NEW_UNTITLED_FILE_COMMAND_ID);
        }
        const stats = explorerService.getContext(false);
        const stat = stats.length > 0 ? stats[0] : undefined;
        let folder;
        if (stat) {
            folder = stat.isDirectory ? stat : (stat.parent || explorerService.roots[0]);
        }
        else {
            folder = explorerService.roots[0];
        }
        if (folder.isReadonly) {
            throw new Error('Parent folder is readonly.');
        }
        const newStat = new explorerModel_1.NewExplorerItem(fileService, folder, isFolder);
        folder.addChild(newStat);
        const onSuccess = async (value) => {
            try {
                const resourceToCreate = resources.joinPath(folder.resource, value);
                await explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(undefined, resourceToCreate, { folder: isFolder })], {
                    undoLabel: nls.localize(57, null, value),
                    progressLabel: nls.localize(58, null, value),
                    confirmBeforeUndo: true
                });
                await refreshIfSeparator(value, explorerService);
                if (isFolder) {
                    await explorerService.select(resourceToCreate, true);
                }
                else {
                    await editorService.openEditor({ resource: resourceToCreate, options: { pinned: true } });
                }
            }
            catch (error) {
                onErrorWithRetry(notificationService, error, () => onSuccess(value));
            }
        };
        await explorerService.setEditable(newStat, {
            validationMessage: value => validateFileName(newStat, value),
            onFinish: async (value, success) => {
                folder.removeChild(newStat);
                await explorerService.setEditable(newStat, null);
                if (success) {
                    onSuccess(value);
                }
            }
        });
    }
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FILE_COMMAND_ID,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, false);
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: exports.NEW_FOLDER_COMMAND_ID,
        handler: async (accessor) => {
            await openExplorerAndCreate(accessor, true);
        }
    });
    const renameHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const stats = explorerService.getContext(false);
        const stat = stats.length > 0 ? stats[0] : undefined;
        if (!stat) {
            return;
        }
        await explorerService.setEditable(stat, {
            validationMessage: value => validateFileName(stat, value),
            onFinish: async (value, success) => {
                if (success) {
                    const parentResource = stat.parent.resource;
                    const targetResource = resources.joinPath(parentResource, value);
                    if (stat.resource.toString() !== targetResource.toString()) {
                        try {
                            await explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(stat.resource, targetResource)], {
                                undoLabel: nls.localize(59, null, stat.name, value),
                                progressLabel: nls.localize(60, null, stat.name, value),
                            });
                            await refreshIfSeparator(value, explorerService);
                        }
                        catch (e) {
                            notificationService.error(e);
                        }
                    }
                }
                await explorerService.setEditable(stat, null);
            }
        });
    };
    exports.renameHandler = renameHandler;
    const moveFileToTrashHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.IExplorerService), accessor.get(workingCopyFileService_1.IWorkingCopyFileService), accessor.get(dialogs_1.IDialogService), accessor.get(configuration_1.IConfigurationService), stats, true);
        }
    };
    exports.moveFileToTrashHandler = moveFileToTrashHandler;
    const deleteFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true).filter(s => !s.isRoot);
        if (stats.length) {
            await deleteFiles(accessor.get(files_3.IExplorerService), accessor.get(workingCopyFileService_1.IWorkingCopyFileService), accessor.get(dialogs_1.IDialogService), accessor.get(configuration_1.IConfigurationService), stats, false);
        }
    };
    exports.deleteFileHandler = deleteFileHandler;
    let pasteShouldMove = false;
    const copyFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, false);
            pasteShouldMove = false;
        }
    };
    exports.copyFileHandler = copyFileHandler;
    const cutFileHandler = async (accessor) => {
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        if (stats.length > 0) {
            await explorerService.setToCopy(stats, true);
            pasteShouldMove = true;
        }
    };
    exports.cutFileHandler = cutFileHandler;
    exports.DOWNLOAD_COMMAND_ID = 'explorer.download';
    const downloadFileHandler = async (accessor) => {
        const logService = accessor.get(log_1.ILogService);
        const fileService = accessor.get(files_2.IFileService);
        const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const progressService = accessor.get(progress_1.IProgressService);
        const context = explorerService.getContext(true);
        const explorerItems = context.length ? context : explorerService.roots;
        const cts = new cancellation_1.CancellationTokenSource();
        await progressService.withProgress({
            location: 10 /* Window */,
            delay: 800,
            cancellable: platform_1.isWeb,
            title: nls.localize(61, null)
        }, async (progress) => {
            return (0, async_1.sequence)(explorerItems.map(explorerItem => async () => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Web: use DOM APIs to download files with optional support
                // for folders and large files
                if (platform_1.isWeb) {
                    const stat = await fileService.resolve(explorerItem.resource, { resolveMetadata: true });
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    const maxBlobDownloadSize = 32 * files_2.ByteSize.MB; // avoid to download via blob-trick >32MB to avoid memory pressure
                    const preferFileSystemAccessWebApis = stat.isDirectory || stat.size > maxBlobDownloadSize;
                    // Folder: use FS APIs to download files and folders if available and preferred
                    if (preferFileSystemAccessWebApis && dom_1.WebFileSystemAccess.supported(window)) {
                        async function downloadFileBuffered(resource, target, operation) {
                            const contents = await fileService.readFileStream(resource);
                            if (cts.token.isCancellationRequested) {
                                target.close();
                                return;
                            }
                            return new Promise((resolve, reject) => {
                                const sourceStream = contents.value;
                                const disposables = new lifecycle_1.DisposableStore();
                                disposables.add((0, lifecycle_1.toDisposable)(() => target.close()));
                                let disposed = false;
                                disposables.add((0, lifecycle_1.toDisposable)(() => disposed = true));
                                disposables.add((0, functional_1.once)(cts.token.onCancellationRequested)(() => {
                                    disposables.dispose();
                                    reject();
                                }));
                                (0, stream_1.listenStream)(sourceStream, {
                                    onData: data => {
                                        if (!disposed) {
                                            target.write(data.buffer);
                                            reportProgress(contents.name, contents.size, data.byteLength, operation);
                                        }
                                    },
                                    onError: error => {
                                        disposables.dispose();
                                        reject(error);
                                    },
                                    onEnd: () => {
                                        disposables.dispose();
                                        resolve();
                                    }
                                });
                            });
                        }
                        async function downloadFileUnbuffered(resource, target, operation) {
                            const contents = await fileService.readFile(resource);
                            if (!cts.token.isCancellationRequested) {
                                target.write(contents.value.buffer);
                                reportProgress(contents.name, contents.size, contents.value.byteLength, operation);
                            }
                            target.close();
                        }
                        async function downloadFile(targetFolder, file, operation) {
                            // Report progress
                            operation.filesDownloaded++;
                            operation.fileBytesDownloaded = 0; // reset for this file
                            reportProgress(file.name, 0, 0, operation);
                            // Start to download
                            const targetFile = await targetFolder.getFileHandle(file.name, { create: true });
                            const targetFileWriter = await targetFile.createWritable();
                            // For large files, write buffered using streams
                            if (file.size > files_2.ByteSize.MB) {
                                return downloadFileBuffered(file.resource, targetFileWriter, operation);
                            }
                            // For small files prefer to write unbuffered to reduce overhead
                            return downloadFileUnbuffered(file.resource, targetFileWriter, operation);
                        }
                        async function downloadFolder(folder, targetFolder, operation) {
                            if (folder.children) {
                                operation.filesTotal += (folder.children.map(child => child.isFile)).length;
                                for (const child of folder.children) {
                                    if (cts.token.isCancellationRequested) {
                                        return;
                                    }
                                    if (child.isFile) {
                                        await downloadFile(targetFolder, child, operation);
                                    }
                                    else {
                                        const childFolder = await targetFolder.getDirectoryHandle(child.name, { create: true });
                                        const resolvedChildFolder = await fileService.resolve(child.resource, { resolveMetadata: true });
                                        await downloadFolder(resolvedChildFolder, childFolder, operation);
                                    }
                                }
                            }
                        }
                        function reportProgress(name, fileSize, bytesDownloaded, operation) {
                            operation.fileBytesDownloaded += bytesDownloaded;
                            operation.totalBytesDownloaded += bytesDownloaded;
                            const bytesDownloadedPerSecond = operation.totalBytesDownloaded / ((Date.now() - operation.startTime) / 1000);
                            // Small file
                            let message;
                            if (fileSize < files_2.ByteSize.MB) {
                                if (operation.filesTotal === 1) {
                                    message = name;
                                }
                                else {
                                    message = nls.localize(62, null, operation.filesDownloaded, operation.filesTotal, files_2.ByteSize.formatSize(bytesDownloadedPerSecond));
                                }
                            }
                            // Large file
                            else {
                                message = nls.localize(63, null, name, files_2.ByteSize.formatSize(operation.fileBytesDownloaded), files_2.ByteSize.formatSize(fileSize), files_2.ByteSize.formatSize(bytesDownloadedPerSecond));
                            }
                            // Report progress but limit to update only once per second
                            operation.progressScheduler.work({ message });
                        }
                        try {
                            const parentFolder = await window.showDirectoryPicker();
                            const operation = {
                                startTime: Date.now(),
                                progressScheduler: new async_1.RunOnceWorker(steps => { progress.report(steps[steps.length - 1]); }, 1000),
                                filesTotal: stat.isDirectory ? 0 : 1,
                                filesDownloaded: 0,
                                totalBytesDownloaded: 0,
                                fileBytesDownloaded: 0
                            };
                            if (stat.isDirectory) {
                                const targetFolder = await parentFolder.getDirectoryHandle(stat.name, { create: true });
                                await downloadFolder(stat, targetFolder, operation);
                            }
                            else {
                                await downloadFile(parentFolder, stat, operation);
                            }
                            operation.progressScheduler.dispose();
                        }
                        catch (error) {
                            logService.warn(error);
                            cts.cancel(); // `showDirectoryPicker` will throw an error when the user cancels
                        }
                    }
                    // File: use traditional download to circumvent browser limitations
                    else if (stat.isFile) {
                        let bufferOrUri;
                        try {
                            bufferOrUri = (await fileService.readFile(stat.resource, { limits: { size: maxBlobDownloadSize } })).value.buffer;
                        }
                        catch (error) {
                            bufferOrUri = network_1.FileAccess.asBrowserUri(stat.resource);
                        }
                        if (!cts.token.isCancellationRequested) {
                            (0, dom_1.triggerDownload)(bufferOrUri, stat.name);
                        }
                    }
                }
                // Native: use working copy file service to get at the contents
                else {
                    progress.report({ message: explorerItem.name });
                    let defaultUri = explorerItem.isDirectory ? await fileDialogService.defaultFolderPath(network_1.Schemas.file) : await fileDialogService.defaultFilePath(network_1.Schemas.file);
                    defaultUri = resources.joinPath(defaultUri, explorerItem.name);
                    const destination = await fileDialogService.showSaveDialog({
                        availableFileSystems: [network_1.Schemas.file],
                        saveLabel: (0, labels_1.mnemonicButtonLabel)(nls.localize(64, null)),
                        title: nls.localize(65, null),
                        defaultUri
                    });
                    if (destination) {
                        await explorerService.applyBulkEdit([new bulkEditService_1.ResourceFileEdit(explorerItem.resource, destination, { overwrite: true, copy: true })], {
                            undoLabel: nls.localize(66, null, explorerItem.name),
                            progressLabel: nls.localize(67, null, explorerItem.name),
                            progressLocation: 1 /* Explorer */
                        });
                    }
                    else {
                        cts.cancel(); // User canceled a download. In case there were multiple files selected we should cancel the remainder of the prompts #86100
                    }
                }
            }));
        }, () => cts.dispose(true));
    };
    commands_1.CommandsRegistry.registerCommand({
        id: exports.DOWNLOAD_COMMAND_ID,
        handler: downloadFileHandler
    });
    const pasteFileHandler = async (accessor) => {
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const fileService = accessor.get(files_2.IFileService);
        const notificationService = accessor.get(notification_1.INotificationService);
        const editorService = accessor.get(editorService_1.IEditorService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
        const context = explorerService.getContext(true);
        const toPaste = resources.distinctParents(await clipboardService.readResources(), r => r);
        const element = context.length ? context[0] : explorerService.roots[0];
        try {
            // Check if target is ancestor of pasted folder
            const sourceTargetPairs = await Promise.all(toPaste.map(async (fileToPaste) => {
                if (element.resource.toString() !== fileToPaste.toString() && resources.isEqualOrParent(element.resource, fileToPaste)) {
                    throw new Error(nls.localize(68, null));
                }
                const fileToPasteStat = await fileService.resolve(fileToPaste);
                // Find target
                let target;
                if (uriIdentityService.extUri.isEqual(element.resource, fileToPaste)) {
                    target = element.parent;
                }
                else {
                    target = element.isDirectory ? element : element.parent;
                }
                const incrementalNaming = configurationService.getValue().explorer.incrementalNaming;
                const targetFile = findValidPasteFileTarget(explorerService, target, { resource: fileToPaste, isDirectory: fileToPasteStat.isDirectory, allowOverwrite: pasteShouldMove }, incrementalNaming);
                return { source: fileToPaste, target: targetFile };
            }));
            if (sourceTargetPairs.length >= 1) {
                // Move/Copy File
                if (pasteShouldMove) {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.ResourceFileEdit(pair.source, pair.target));
                    const options = {
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize(69, null, sourceTargetPairs.length)
                            : nls.localize(70, null, resources.basenameOrAuthority(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize(71, null, sourceTargetPairs.length)
                            : nls.localize(72, null, resources.basenameOrAuthority(sourceTargetPairs[0].target))
                    };
                    await explorerService.applyBulkEdit(resourceFileEdits, options);
                }
                else {
                    const resourceFileEdits = sourceTargetPairs.map(pair => new bulkEditService_1.ResourceFileEdit(pair.source, pair.target, { copy: true }));
                    const options = {
                        progressLabel: sourceTargetPairs.length > 1 ? nls.localize(73, null, sourceTargetPairs.length)
                            : nls.localize(74, null, resources.basenameOrAuthority(sourceTargetPairs[0].target)),
                        undoLabel: sourceTargetPairs.length > 1 ? nls.localize(75, null, sourceTargetPairs.length)
                            : nls.localize(76, null, resources.basenameOrAuthority(sourceTargetPairs[0].target))
                    };
                    await explorerService.applyBulkEdit(resourceFileEdits, options);
                }
                const pair = sourceTargetPairs[0];
                await explorerService.select(pair.target);
                if (sourceTargetPairs.length === 1) {
                    const item = explorerService.findClosest(pair.target);
                    if (item && !item.isDirectory) {
                        await editorService.openEditor({ resource: item.resource, options: { pinned: true, preserveFocus: true } });
                    }
                }
            }
        }
        catch (e) {
            onError(notificationService, new Error(nls.localize(77, null, (0, errors_1.getErrorMessage)(e))));
        }
        finally {
            if (pasteShouldMove) {
                // Cut is done. Make sure to clear cut state.
                await explorerService.setToCopy([], false);
                pasteShouldMove = false;
            }
        }
    };
    exports.pasteFileHandler = pasteFileHandler;
    const openFilePreserveFocusHandler = async (accessor) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const stats = explorerService.getContext(true);
        await editorService.openEditors(stats.filter(s => !s.isDirectory).map(s => ({
            resource: s.resource,
            options: { preserveFocus: true }
        })));
    };
    exports.openFilePreserveFocusHandler = openFilePreserveFocusHandler;
});
//# sourceMappingURL=fileActions.js.map