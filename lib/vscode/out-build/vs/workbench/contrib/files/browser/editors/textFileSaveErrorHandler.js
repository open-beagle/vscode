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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/base/common/errorMessage", "vs/base/common/resources", "vs/base/common/actions", "vs/base/common/uri", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/resolverService", "vs/base/common/map", "vs/workbench/common/editor/diffEditorInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/workbench/contrib/files/browser/fileCommands", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/preferences/common/preferences", "vs/base/common/hash"], function (require, exports, nls_1, errorMessage_1, resources_1, actions_1, uri_1, textfiles_1, instantiation_1, lifecycle_1, resolverService_1, map_1, diffEditorInput_1, contextkey_1, files_1, fileEditorInput_1, fileCommands_1, notification_1, opener_1, storage_1, productService_1, event_1, editorService_1, platform_1, network_1, preferences_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.revertLocalChangesCommand = exports.acceptLocalChangesCommand = exports.TextFileSaveErrorHandler = exports.CONFLICT_RESOLUTION_SCHEME = exports.CONFLICT_RESOLUTION_CONTEXT = void 0;
    exports.CONFLICT_RESOLUTION_CONTEXT = 'saveConflictResolutionContext';
    exports.CONFLICT_RESOLUTION_SCHEME = 'conflictResolution';
    const LEARN_MORE_DIRTY_WRITE_IGNORE_KEY = 'learnMoreDirtyWriteError';
    const conflictEditorHelp = (0, nls_1.localize)(0, null);
    // A handler for text file save error happening with conflict resolution actions
    let TextFileSaveErrorHandler = class TextFileSaveErrorHandler extends lifecycle_1.Disposable {
        constructor(notificationService, textFileService, contextKeyService, editorService, textModelService, instantiationService, storageService) {
            super();
            this.notificationService = notificationService;
            this.textFileService = textFileService;
            this.contextKeyService = contextKeyService;
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.messages = new map_1.ResourceMap();
            this.conflictResolutionContext = new contextkey_1.RawContextKey(exports.CONFLICT_RESOLUTION_CONTEXT, false, true).bindTo(this.contextKeyService);
            this.activeConflictResolutionResource = undefined;
            const provider = this._register(instantiationService.createInstance(files_1.TextFileContentProvider));
            this._register(textModelService.registerTextModelContentProvider(exports.CONFLICT_RESOLUTION_SCHEME, provider));
            // Set as save error handler to service for text files
            this.textFileService.files.saveErrorHandler = this;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.textFileService.files.onDidSave(event => this.onFileSavedOrReverted(event.model.resource)));
            this._register(this.textFileService.files.onDidRevert(model => this.onFileSavedOrReverted(model.resource)));
            this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChanged()));
        }
        onActiveEditorChanged() {
            let isActiveEditorSaveConflictResolution = false;
            let activeConflictResolutionResource;
            const activeInput = this.editorService.activeEditor;
            if (activeInput instanceof diffEditorInput_1.DiffEditorInput) {
                const resource = activeInput.originalInput.resource;
                if ((resource === null || resource === void 0 ? void 0 : resource.scheme) === exports.CONFLICT_RESOLUTION_SCHEME) {
                    isActiveEditorSaveConflictResolution = true;
                    activeConflictResolutionResource = activeInput.modifiedInput.resource;
                }
            }
            this.conflictResolutionContext.set(isActiveEditorSaveConflictResolution);
            this.activeConflictResolutionResource = activeConflictResolutionResource;
        }
        onFileSavedOrReverted(resource) {
            const messageHandle = this.messages.get(resource);
            if (messageHandle) {
                messageHandle.close();
                this.messages.delete(resource);
            }
        }
        onSaveError(error, model) {
            var _a;
            const fileOperationError = error;
            const resource = model.resource;
            let message;
            const primaryActions = [];
            const secondaryActions = [];
            // Dirty write prevention
            if (fileOperationError.fileOperationResult === 3 /* FILE_MODIFIED_SINCE */) {
                // If the user tried to save from the opened conflict editor, show its message again
                if (this.activeConflictResolutionResource && (0, resources_1.isEqual)(this.activeConflictResolutionResource, model.resource)) {
                    if (this.storageService.getBoolean(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, 0 /* GLOBAL */)) {
                        return; // return if this message is ignored
                    }
                    message = conflictEditorHelp;
                    primaryActions.push(this.instantiationService.createInstance(ResolveConflictLearnMoreAction));
                    secondaryActions.push(this.instantiationService.createInstance(DoNotShowResolveConflictLearnMoreAction));
                }
                // Otherwise show the message that will lead the user into the save conflict editor.
                else {
                    message = (0, nls_1.localize)(1, null, (0, resources_1.basename)(resource));
                    primaryActions.push(this.instantiationService.createInstance(ResolveSaveConflictAction, model));
                    primaryActions.push(this.instantiationService.createInstance(SaveModelIgnoreModifiedSinceAction, model));
                    secondaryActions.push(this.instantiationService.createInstance(ConfigureSaveConflictAction));
                }
            }
            // Any other save error
            else {
                const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FILE_WRITE_LOCKED */;
                const triedToUnlock = isWriteLocked && ((_a = fileOperationError.options) === null || _a === void 0 ? void 0 : _a.unlock);
                const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FILE_PERMISSION_DENIED */;
                const canSaveElevated = resource.scheme === network_1.Schemas.file; // currently only supported for local schemes (https://github.com/microsoft/vscode/issues/48659)
                // Save Elevated
                if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
                    primaryActions.push(this.instantiationService.createInstance(SaveModelElevatedAction, model, !!triedToUnlock));
                }
                // Unlock
                else if (isWriteLocked) {
                    primaryActions.push(this.instantiationService.createInstance(UnlockModelAction, model));
                }
                // Retry
                else {
                    primaryActions.push(this.instantiationService.createInstance(RetrySaveModelAction, model));
                }
                // Save As
                primaryActions.push(this.instantiationService.createInstance(SaveModelAsAction, model));
                // Discard
                primaryActions.push(this.instantiationService.createInstance(DiscardModelAction, model));
                // Message
                if (isWriteLocked) {
                    if (triedToUnlock && canSaveElevated) {
                        message = platform_1.isWindows ? (0, nls_1.localize)(2, null, (0, resources_1.basename)(resource)) : (0, nls_1.localize)(3, null, (0, resources_1.basename)(resource));
                    }
                    else {
                        message = (0, nls_1.localize)(4, null, (0, resources_1.basename)(resource));
                    }
                }
                else if (canSaveElevated && isPermissionDenied) {
                    message = platform_1.isWindows ? (0, nls_1.localize)(5, null, (0, resources_1.basename)(resource)) : (0, nls_1.localize)(6, null, (0, resources_1.basename)(resource));
                }
                else {
                    message = (0, nls_1.localize)(7, null, (0, resources_1.basename)(resource), (0, errorMessage_1.toErrorMessage)(error, false));
                }
            }
            // Show message and keep function to hide in case the file gets saved/reverted
            const actions = { primary: primaryActions, secondary: secondaryActions };
            const handle = this.notificationService.notify({
                id: `${(0, hash_1.hash)(model.resource.toString())}`,
                severity: notification_1.Severity.Error,
                message,
                actions
            });
            event_1.Event.once(handle.onDidClose)(() => { (0, lifecycle_1.dispose)(primaryActions); (0, lifecycle_1.dispose)(secondaryActions); });
            this.messages.set(model.resource, handle);
        }
        dispose() {
            super.dispose();
            this.messages.clear();
        }
    };
    TextFileSaveErrorHandler = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, editorService_1.IEditorService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, storage_1.IStorageService)
    ], TextFileSaveErrorHandler);
    exports.TextFileSaveErrorHandler = TextFileSaveErrorHandler;
    const pendingResolveSaveConflictMessages = [];
    function clearPendingResolveSaveConflictMessages() {
        while (pendingResolveSaveConflictMessages.length > 0) {
            const item = pendingResolveSaveConflictMessages.pop();
            if (item) {
                item.close();
            }
        }
    }
    let ResolveConflictLearnMoreAction = class ResolveConflictLearnMoreAction extends actions_1.Action {
        constructor(openerService) {
            super('workbench.files.action.resolveConflictLearnMore', (0, nls_1.localize)(8, null));
            this.openerService = openerService;
        }
        async run() {
            await this.openerService.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=868264'));
        }
    };
    ResolveConflictLearnMoreAction = __decorate([
        __param(0, opener_1.IOpenerService)
    ], ResolveConflictLearnMoreAction);
    let DoNotShowResolveConflictLearnMoreAction = class DoNotShowResolveConflictLearnMoreAction extends actions_1.Action {
        constructor(storageService) {
            super('workbench.files.action.resolveConflictLearnMoreDoNotShowAgain', (0, nls_1.localize)(9, null));
            this.storageService = storageService;
        }
        async run(notification) {
            this.storageService.store(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, true, 0 /* GLOBAL */, 0 /* USER */);
            // Hide notification
            notification.dispose();
        }
    };
    DoNotShowResolveConflictLearnMoreAction = __decorate([
        __param(0, storage_1.IStorageService)
    ], DoNotShowResolveConflictLearnMoreAction);
    let ResolveSaveConflictAction = class ResolveSaveConflictAction extends actions_1.Action {
        constructor(model, editorService, notificationService, instantiationService, productService) {
            super('workbench.files.action.resolveConflict', (0, nls_1.localize)(10, null));
            this.model = model;
            this.editorService = editorService;
            this.notificationService = notificationService;
            this.instantiationService = instantiationService;
            this.productService = productService;
        }
        async run() {
            if (!this.model.isDisposed()) {
                const resource = this.model.resource;
                const name = (0, resources_1.basename)(resource);
                const editorLabel = (0, nls_1.localize)(11, null, name, name, this.productService.nameLong);
                await files_1.TextFileContentProvider.open(resource, exports.CONFLICT_RESOLUTION_SCHEME, editorLabel, this.editorService, { pinned: true });
                // Show additional help how to resolve the save conflict
                const actions = { primary: [this.instantiationService.createInstance(ResolveConflictLearnMoreAction)] };
                const handle = this.notificationService.notify({
                    id: `${(0, hash_1.hash)(resource.toString())}`,
                    severity: notification_1.Severity.Info,
                    message: conflictEditorHelp,
                    actions,
                    neverShowAgain: { id: LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, isSecondary: true }
                });
                event_1.Event.once(handle.onDidClose)(() => (0, lifecycle_1.dispose)(actions.primary));
                pendingResolveSaveConflictMessages.push(handle);
            }
        }
    };
    ResolveSaveConflictAction = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, notification_1.INotificationService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, productService_1.IProductService)
    ], ResolveSaveConflictAction);
    class SaveModelElevatedAction extends actions_1.Action {
        constructor(model, triedToUnlock) {
            super('workbench.files.action.saveModelElevated', triedToUnlock ? platform_1.isWindows ? (0, nls_1.localize)(12, null) : (0, nls_1.localize)(13, null) : platform_1.isWindows ? (0, nls_1.localize)(14, null) : (0, nls_1.localize)(15, null));
            this.model = model;
            this.triedToUnlock = triedToUnlock;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({
                    writeElevated: true,
                    writeUnlock: this.triedToUnlock,
                    reason: 1 /* EXPLICIT */
                });
            }
        }
    }
    class RetrySaveModelAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.saveModel', (0, nls_1.localize)(16, null));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({ reason: 1 /* EXPLICIT */ });
            }
        }
    }
    class DiscardModelAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.discardModel', (0, nls_1.localize)(17, null));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.revert();
            }
        }
    }
    let SaveModelAsAction = class SaveModelAsAction extends actions_1.Action {
        constructor(model, editorService) {
            super('workbench.files.action.saveModelAs', fileCommands_1.SAVE_FILE_AS_LABEL);
            this.model = model;
            this.editorService = editorService;
        }
        async run() {
            if (!this.model.isDisposed()) {
                const editor = this.findEditor();
                if (editor) {
                    await this.editorService.save(editor, { saveAs: true, reason: 1 /* EXPLICIT */ });
                }
            }
        }
        findEditor() {
            let preferredMatchingEditor;
            const editors = this.editorService.findEditors(this.model.resource);
            for (const identifier of editors) {
                if (identifier.editor instanceof fileEditorInput_1.FileEditorInput) {
                    // We prefer a `FileEditorInput` for "Save As", but it is possible
                    // that a custom editor is leveraging the text file model and as
                    // such we need to fallback to any other editor having the resource
                    // opened for running the save.
                    preferredMatchingEditor = identifier;
                    break;
                }
                else if (!preferredMatchingEditor) {
                    preferredMatchingEditor = identifier;
                }
            }
            return preferredMatchingEditor;
        }
    };
    SaveModelAsAction = __decorate([
        __param(1, editorService_1.IEditorService)
    ], SaveModelAsAction);
    class UnlockModelAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.unlock', (0, nls_1.localize)(18, null));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({ writeUnlock: true, reason: 1 /* EXPLICIT */ });
            }
        }
    }
    class SaveModelIgnoreModifiedSinceAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.saveIgnoreModifiedSince', (0, nls_1.localize)(19, null));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({ ignoreModifiedSince: true, reason: 1 /* EXPLICIT */ });
            }
        }
    }
    let ConfigureSaveConflictAction = class ConfigureSaveConflictAction extends actions_1.Action {
        constructor(preferencesService) {
            super('workbench.files.action.configureSaveConflict', (0, nls_1.localize)(20, null));
            this.preferencesService = preferencesService;
        }
        async run() {
            this.preferencesService.openSettings(undefined, 'files.saveConflictResolution');
        }
    };
    ConfigureSaveConflictAction = __decorate([
        __param(0, preferences_1.IPreferencesService)
    ], ConfigureSaveConflictAction);
    const acceptLocalChangesCommand = (accessor, resource) => {
        return acceptOrRevertLocalChangesCommand(accessor, resource, true);
    };
    exports.acceptLocalChangesCommand = acceptLocalChangesCommand;
    const revertLocalChangesCommand = (accessor, resource) => {
        return acceptOrRevertLocalChangesCommand(accessor, resource, false);
    };
    exports.revertLocalChangesCommand = revertLocalChangesCommand;
    async function acceptOrRevertLocalChangesCommand(accessor, resource, accept) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editorPane = editorService.activeEditorPane;
        if (!editorPane) {
            return;
        }
        const editor = editorPane.input;
        const group = editorPane.group;
        // Hide any previously shown message about how to use these actions
        clearPendingResolveSaveConflictMessages();
        // Accept or revert
        if (accept) {
            const options = { ignoreModifiedSince: true, reason: 1 /* EXPLICIT */ };
            await editorService.save({ editor, groupId: group.id }, options);
        }
        else {
            await editorService.revert({ editor, groupId: group.id });
        }
        // Reopen original editor
        await editorService.openEditor({ resource }, group);
        // Clean up
        return group.closeEditor(editor);
    }
});
//# sourceMappingURL=textFileSaveErrorHandler.js.map