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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/workbench/api/browser/mainThreadCustomEditors", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/api/browser/mainThreadWebviews", "vs/workbench/api/common/extHost.protocol", "vs/workbench/common/editor", "vs/workbench/contrib/customEditor/browser/customEditorInput", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/customTextEditorModel", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/workingCopy/common/workingCopy"], function (require, exports, dom_1, async_1, cancellation_1, errors_1, event_1, lifecycle_1, network_1, path_1, resources_1, uri_1, nls_1, dialogs_1, files_1, instantiation_1, label_1, undoRedo_1, mainThreadWebviews_1, extHostProtocol, editor_1, customEditorInput_1, customEditor_1, customTextEditorModel_1, webviewWorkbenchService_1, editorGroupsService_1, environmentService_1, extensions_1, pathService_1, workingCopyFileService_1, workingCopyService_1, workingCopy_1) {
    "use strict";
    var _MainThreadCustomEditorModel_isDisposed;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadCustomEditors = void 0;
    var CustomEditorModelType;
    (function (CustomEditorModelType) {
        CustomEditorModelType[CustomEditorModelType["Custom"] = 0] = "Custom";
        CustomEditorModelType[CustomEditorModelType["Text"] = 1] = "Text";
    })(CustomEditorModelType || (CustomEditorModelType = {}));
    let MainThreadCustomEditors = class MainThreadCustomEditors extends lifecycle_1.Disposable {
        constructor(context, mainThreadWebview, mainThreadWebviewPanels, extensionService, workingCopyService, workingCopyFileService, _customEditorService, _editorGroupService, _webviewWorkbenchService, _instantiationService) {
            super();
            this.mainThreadWebview = mainThreadWebview;
            this.mainThreadWebviewPanels = mainThreadWebviewPanels;
            this._customEditorService = _customEditorService;
            this._editorGroupService = _editorGroupService;
            this._webviewWorkbenchService = _webviewWorkbenchService;
            this._instantiationService = _instantiationService;
            this._editorProviders = new Map();
            this._proxyCustomEditors = context.getProxy(extHostProtocol.ExtHostContext.ExtHostCustomEditors);
            this._register(workingCopyFileService.registerWorkingCopyProvider((editorResource) => {
                const matchedWorkingCopies = [];
                for (const workingCopy of workingCopyService.workingCopies) {
                    if (workingCopy instanceof MainThreadCustomEditorModel) {
                        if ((0, resources_1.isEqualOrParent)(editorResource, workingCopy.editorResource)) {
                            matchedWorkingCopies.push(workingCopy);
                        }
                    }
                }
                return matchedWorkingCopies;
            }));
            // This reviver's only job is to activate custom editor extensions.
            this._register(_webviewWorkbenchService.registerResolver({
                canResolve: (webview) => {
                    if (webview instanceof customEditorInput_1.CustomEditorInput) {
                        extensionService.activateByEvent(`onCustomEditor:${webview.viewType}`);
                    }
                    return false;
                },
                resolveWebview: () => { throw new Error('not implemented'); }
            }));
        }
        dispose() {
            super.dispose();
            (0, lifecycle_1.dispose)(this._editorProviders.values());
            this._editorProviders.clear();
        }
        $registerTextEditorProvider(extensionData, viewType, options, capabilities, serializeBuffersForPostMessage) {
            this.registerEditorProvider(1 /* Text */, (0, mainThreadWebviews_1.reviveWebviewExtension)(extensionData), viewType, options, capabilities, true, serializeBuffersForPostMessage);
        }
        $registerCustomEditorProvider(extensionData, viewType, options, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
            this.registerEditorProvider(0 /* Custom */, (0, mainThreadWebviews_1.reviveWebviewExtension)(extensionData), viewType, options, {}, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage);
        }
        registerEditorProvider(modelType, extension, viewType, options, capabilities, supportsMultipleEditorsPerDocument, serializeBuffersForPostMessage) {
            if (this._editorProviders.has(viewType)) {
                throw new Error(`Provider for ${viewType} already registered`);
            }
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(this._customEditorService.registerCustomEditorCapabilities(viewType, {
                supportsMultipleEditorsPerDocument
            }));
            disposables.add(this._webviewWorkbenchService.registerResolver({
                canResolve: (webviewInput) => {
                    return webviewInput instanceof customEditorInput_1.CustomEditorInput && webviewInput.viewType === viewType;
                },
                resolveWebview: async (webviewInput, cancellation) => {
                    const handle = webviewInput.id;
                    const resource = webviewInput.resource;
                    this.mainThreadWebviewPanels.addWebviewInput(handle, webviewInput, { serializeBuffersForPostMessage });
                    webviewInput.webview.options = options;
                    webviewInput.webview.extension = extension;
                    let modelRef;
                    try {
                        modelRef = await this.getOrCreateCustomEditorModel(modelType, resource, viewType, { backupId: webviewInput.backupId }, cancellation);
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                        webviewInput.webview.html = this.mainThreadWebview.getWebviewResolvedFailedContent(viewType);
                        return;
                    }
                    if (cancellation.isCancellationRequested) {
                        modelRef.dispose();
                        return;
                    }
                    webviewInput.webview.onDidDispose(() => {
                        // If the model is still dirty, make sure we have time to save it
                        if (modelRef.object.isDirty()) {
                            const sub = modelRef.object.onDidChangeDirty(() => {
                                if (!modelRef.object.isDirty()) {
                                    sub.dispose();
                                    modelRef.dispose();
                                }
                            });
                            return;
                        }
                        modelRef.dispose();
                    });
                    if (capabilities.supportsMove) {
                        webviewInput.onMove(async (newResource) => {
                            const oldModel = modelRef;
                            modelRef = await this.getOrCreateCustomEditorModel(modelType, newResource, viewType, {}, cancellation_1.CancellationToken.None);
                            this._proxyCustomEditors.$onMoveCustomEditor(handle, newResource, viewType);
                            oldModel.dispose();
                        });
                    }
                    try {
                        await this._proxyCustomEditors.$resolveWebviewEditor(resource, handle, viewType, {
                            title: webviewInput.getTitle(),
                            webviewOptions: webviewInput.webview.contentOptions,
                            panelOptions: webviewInput.webview.options,
                        }, (0, editor_1.editorGroupToViewColumn)(this._editorGroupService, webviewInput.group || 0), cancellation);
                    }
                    catch (error) {
                        (0, errors_1.onUnexpectedError)(error);
                        webviewInput.webview.html = this.mainThreadWebview.getWebviewResolvedFailedContent(viewType);
                        modelRef.dispose();
                        return;
                    }
                }
            }));
            this._editorProviders.set(viewType, disposables);
        }
        $unregisterEditorProvider(viewType) {
            const provider = this._editorProviders.get(viewType);
            if (!provider) {
                throw new Error(`No provider for ${viewType} registered`);
            }
            provider.dispose();
            this._editorProviders.delete(viewType);
            this._customEditorService.models.disposeAllModelsForView(viewType);
        }
        async getOrCreateCustomEditorModel(modelType, resource, viewType, options, cancellation) {
            const existingModel = this._customEditorService.models.tryRetain(resource, viewType);
            if (existingModel) {
                return existingModel;
            }
            switch (modelType) {
                case 1 /* Text */:
                    {
                        const model = customTextEditorModel_1.CustomTextEditorModel.create(this._instantiationService, viewType, resource);
                        return this._customEditorService.models.add(resource, viewType, model);
                    }
                case 0 /* Custom */:
                    {
                        const model = MainThreadCustomEditorModel.create(this._instantiationService, this._proxyCustomEditors, viewType, resource, options, () => {
                            return Array.from(this.mainThreadWebviewPanels.webviewInputs)
                                .filter(editor => editor instanceof customEditorInput_1.CustomEditorInput && (0, resources_1.isEqual)(editor.resource, resource));
                        }, cancellation);
                        return this._customEditorService.models.add(resource, viewType, model);
                    }
            }
        }
        async $onDidEdit(resourceComponents, viewType, editId, label) {
            const model = await this.getCustomEditorModel(resourceComponents, viewType);
            model.pushEdit(editId, label);
        }
        async $onContentChange(resourceComponents, viewType) {
            const model = await this.getCustomEditorModel(resourceComponents, viewType);
            model.changeContent();
        }
        async getCustomEditorModel(resourceComponents, viewType) {
            const resource = uri_1.URI.revive(resourceComponents);
            const model = await this._customEditorService.models.get(resource, viewType);
            if (!model || !(model instanceof MainThreadCustomEditorModel)) {
                throw new Error('Could not find model for webview editor');
            }
            return model;
        }
    };
    MainThreadCustomEditors = __decorate([
        __param(3, extensions_1.IExtensionService),
        __param(4, workingCopyService_1.IWorkingCopyService),
        __param(5, workingCopyFileService_1.IWorkingCopyFileService),
        __param(6, customEditor_1.ICustomEditorService),
        __param(7, editorGroupsService_1.IEditorGroupsService),
        __param(8, webviewWorkbenchService_1.IWebviewWorkbenchService),
        __param(9, instantiation_1.IInstantiationService)
    ], MainThreadCustomEditors);
    exports.MainThreadCustomEditors = MainThreadCustomEditors;
    var HotExitState;
    (function (HotExitState) {
        let Type;
        (function (Type) {
            Type[Type["Allowed"] = 0] = "Allowed";
            Type[Type["NotAllowed"] = 1] = "NotAllowed";
            Type[Type["Pending"] = 2] = "Pending";
        })(Type = HotExitState.Type || (HotExitState.Type = {}));
        HotExitState.Allowed = Object.freeze({ type: 0 /* Allowed */ });
        HotExitState.NotAllowed = Object.freeze({ type: 1 /* NotAllowed */ });
        class Pending {
            constructor(operation) {
                this.operation = operation;
                this.type = 2 /* Pending */;
            }
        }
        HotExitState.Pending = Pending;
    })(HotExitState || (HotExitState = {}));
    let MainThreadCustomEditorModel = class MainThreadCustomEditorModel extends lifecycle_1.Disposable {
        constructor(_proxy, _viewType, _editorResource, fromBackup, _editable, _getEditors, _fileDialogService, _fileService, _labelService, _undoService, _environmentService, workingCopyService, _pathService) {
            super();
            this._proxy = _proxy;
            this._viewType = _viewType;
            this._editorResource = _editorResource;
            this._editable = _editable;
            this._getEditors = _getEditors;
            this._fileDialogService = _fileDialogService;
            this._fileService = _fileService;
            this._labelService = _labelService;
            this._undoService = _undoService;
            this._environmentService = _environmentService;
            this._pathService = _pathService;
            _MainThreadCustomEditorModel_isDisposed.set(this, false);
            this._fromBackup = false;
            this._hotExitState = HotExitState.Allowed;
            this._currentEditIndex = -1;
            this._savePoint = -1;
            this._edits = [];
            this._isDirtyFromContentChange = false;
            this._inOrphaned = false;
            this._onDidChangeOrphaned = this._register(new event_1.Emitter());
            this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
            // TODO@mjbvz consider to enable a `typeId` that is specific for custom
            // editors. Using a distinct `typeId` allows the working copy to have
            // any resource (including file based resources) even if other working
            // copies exist with the same resource.
            //
            // IMPORTANT: changing the `typeId` has an impact on backups for this
            // working copy. Any value that is not the empty string will be used
            // as seed to the backup. Only change the `typeId` if you have implemented
            // a fallback solution to resolve any existing backups that do not have
            // this seed.
            this.typeId = workingCopy_1.NO_TYPE_ID;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._fromBackup = fromBackup;
            if (_editable) {
                this._register(workingCopyService.registerWorkingCopy(this));
            }
            this._register(_fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        }
        static async create(instantiationService, proxy, viewType, resource, options, getEditors, cancellation) {
            const editors = getEditors();
            let untitledDocumentData;
            if (editors.length !== 0) {
                untitledDocumentData = editors[0].untitledDocumentData;
            }
            const { editable } = await proxy.$createCustomDocument(resource, viewType, options.backupId, untitledDocumentData, cancellation);
            return instantiationService.createInstance(MainThreadCustomEditorModel, proxy, viewType, resource, !!options.backupId, editable, getEditors);
        }
        get editorResource() {
            return this._editorResource;
        }
        dispose() {
            __classPrivateFieldSet(this, _MainThreadCustomEditorModel_isDisposed, true, "f");
            if (this._editable) {
                this._undoService.removeElements(this._editorResource);
            }
            this._proxy.$disposeCustomDocument(this._editorResource, this._viewType);
            super.dispose();
        }
        //#region IWorkingCopy
        get resource() {
            // Make sure each custom editor has a unique resource for backup and edits
            return MainThreadCustomEditorModel.toWorkingCopyResource(this._viewType, this._editorResource);
        }
        static toWorkingCopyResource(viewType, resource) {
            const authority = viewType.replace(/[^a-z0-9\-_]/gi, '-');
            const path = `/${(0, dom_1.multibyteAwareBtoa)(resource.with({ query: null, fragment: null }).toString(true))}`;
            return uri_1.URI.from({
                scheme: network_1.Schemas.vscodeCustomEditor,
                authority: authority,
                path: path,
                query: JSON.stringify(resource.toJSON()),
            });
        }
        get name() {
            return (0, path_1.basename)(this._labelService.getUriLabel(this._editorResource));
        }
        get capabilities() {
            return this.isUntitled() ? 2 /* Untitled */ : 0 /* None */;
        }
        isDirty() {
            if (this._isDirtyFromContentChange) {
                return true;
            }
            if (this._edits.length > 0) {
                return this._savePoint !== this._currentEditIndex;
            }
            return this._fromBackup;
        }
        isOrphaned() {
            return this._inOrphaned;
        }
        isUntitled() {
            return this._editorResource.scheme === network_1.Schemas.untitled;
        }
        //#endregion
        async onDidFilesChange(e) {
            let fileEventImpactsModel = false;
            let newInOrphanModeGuess;
            // If we are currently orphaned, we check if the model file was added back
            if (this._inOrphaned) {
                const modelFileAdded = e.contains(this.editorResource, 1 /* ADDED */);
                if (modelFileAdded) {
                    newInOrphanModeGuess = false;
                    fileEventImpactsModel = true;
                }
            }
            // Otherwise we check if the model file was deleted
            else {
                const modelFileDeleted = e.contains(this.editorResource, 2 /* DELETED */);
                if (modelFileDeleted) {
                    newInOrphanModeGuess = true;
                    fileEventImpactsModel = true;
                }
            }
            if (fileEventImpactsModel && this._inOrphaned !== newInOrphanModeGuess) {
                let newInOrphanModeValidated = false;
                if (newInOrphanModeGuess) {
                    // We have received reports of users seeing delete events even though the file still
                    // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                    // Since we do not want to mark the model as orphaned, we have to check if the
                    // file is really gone and not just a faulty file event.
                    await (0, async_1.timeout)(100);
                    if (__classPrivateFieldGet(this, _MainThreadCustomEditorModel_isDisposed, "f")) {
                        newInOrphanModeValidated = true;
                    }
                    else {
                        const exists = await this._fileService.exists(this.editorResource);
                        newInOrphanModeValidated = !exists;
                    }
                }
                if (this._inOrphaned !== newInOrphanModeValidated && !__classPrivateFieldGet(this, _MainThreadCustomEditorModel_isDisposed, "f")) {
                    this.setOrphaned(newInOrphanModeValidated);
                }
            }
        }
        setOrphaned(orphaned) {
            if (this._inOrphaned !== orphaned) {
                this._inOrphaned = orphaned;
                this._onDidChangeOrphaned.fire();
            }
        }
        isEditable() {
            return this._editable;
        }
        isOnReadonlyFileSystem() {
            return this._fileService.hasCapability(this.editorResource, 2048 /* Readonly */);
        }
        get viewType() {
            return this._viewType;
        }
        get backupId() {
            return this._backupId;
        }
        pushEdit(editId, label) {
            if (!this._editable) {
                throw new Error('Document is not editable');
            }
            this.change(() => {
                this.spliceEdits(editId);
                this._currentEditIndex = this._edits.length - 1;
            });
            this._undoService.pushElement({
                type: 0 /* Resource */,
                resource: this._editorResource,
                label: label !== null && label !== void 0 ? label : (0, nls_1.localize)(0, null),
                undo: () => this.undo(),
                redo: () => this.redo(),
            });
        }
        changeContent() {
            this.change(() => {
                this._isDirtyFromContentChange = true;
            });
        }
        async undo() {
            if (!this._editable) {
                return;
            }
            if (this._currentEditIndex < 0) {
                // nothing to undo
                return;
            }
            const undoneEdit = this._edits[this._currentEditIndex];
            this.change(() => {
                --this._currentEditIndex;
            });
            await this._proxy.$undo(this._editorResource, this.viewType, undoneEdit, this.isDirty());
        }
        async redo() {
            if (!this._editable) {
                return;
            }
            if (this._currentEditIndex >= this._edits.length - 1) {
                // nothing to redo
                return;
            }
            const redoneEdit = this._edits[this._currentEditIndex + 1];
            this.change(() => {
                ++this._currentEditIndex;
            });
            await this._proxy.$redo(this._editorResource, this.viewType, redoneEdit, this.isDirty());
        }
        spliceEdits(editToInsert) {
            const start = this._currentEditIndex + 1;
            const toRemove = this._edits.length - this._currentEditIndex;
            const removedEdits = typeof editToInsert === 'number'
                ? this._edits.splice(start, toRemove, editToInsert)
                : this._edits.splice(start, toRemove);
            if (removedEdits.length) {
                this._proxy.$disposeEdits(this._editorResource, this._viewType, removedEdits);
            }
        }
        change(makeEdit) {
            const wasDirty = this.isDirty();
            makeEdit();
            this._onDidChangeContent.fire();
            if (this.isDirty() !== wasDirty) {
                this._onDidChangeDirty.fire();
            }
        }
        async revert(_options) {
            if (!this._editable) {
                return;
            }
            if (this._currentEditIndex === this._savePoint && !this._isDirtyFromContentChange && !this._fromBackup) {
                return;
            }
            this._proxy.$revert(this._editorResource, this.viewType, cancellation_1.CancellationToken.None);
            this.change(() => {
                this._isDirtyFromContentChange = false;
                this._fromBackup = false;
                this._currentEditIndex = this._savePoint;
                this.spliceEdits();
            });
        }
        async save(options) {
            return !!await this.saveCustomEditor(options);
        }
        async saveCustomEditor(options) {
            var _a;
            if (!this._editable) {
                return undefined;
            }
            if (this.isUntitled()) {
                const targetUri = await this.suggestUntitledSavePath(options);
                if (!targetUri) {
                    return undefined;
                }
                await this.saveCustomEditorAs(this._editorResource, targetUri, options);
                return targetUri;
            }
            const savePromise = (0, async_1.createCancelablePromise)(token => this._proxy.$onSave(this._editorResource, this.viewType, token));
            (_a = this._ongoingSave) === null || _a === void 0 ? void 0 : _a.cancel();
            this._ongoingSave = savePromise;
            try {
                await savePromise;
                if (this._ongoingSave === savePromise) { // Make sure we are still doing the same save
                    this.change(() => {
                        this._isDirtyFromContentChange = false;
                        this._savePoint = this._currentEditIndex;
                        this._fromBackup = false;
                    });
                }
            }
            finally {
                if (this._ongoingSave === savePromise) { // Make sure we are still doing the same save
                    this._ongoingSave = undefined;
                }
            }
            return this._editorResource;
        }
        suggestUntitledSavePath(options) {
            if (!this.isUntitled()) {
                throw new Error('Resource is not untitled');
            }
            const remoteAuthority = this._environmentService.remoteAuthority;
            const localResource = (0, resources_1.toLocalResource)(this._editorResource, remoteAuthority, this._pathService.defaultUriScheme);
            return this._fileDialogService.pickFileToSave(localResource, options === null || options === void 0 ? void 0 : options.availableFileSystems);
        }
        async saveCustomEditorAs(resource, targetResource, _options) {
            if (this._editable) {
                // TODO: handle cancellation
                await (0, async_1.createCancelablePromise)(token => this._proxy.$onSaveAs(this._editorResource, this.viewType, targetResource, token));
                this.change(() => {
                    this._savePoint = this._currentEditIndex;
                });
                return true;
            }
            else {
                // Since the editor is readonly, just copy the file over
                await this._fileService.copy(resource, targetResource, false /* overwrite */);
                return true;
            }
        }
        async backup(token) {
            const editors = this._getEditors();
            if (!editors.length) {
                throw new Error('No editors found for resource, cannot back up');
            }
            const primaryEditor = editors[0];
            const backupMeta = {
                viewType: this.viewType,
                editorResource: this._editorResource,
                backupId: '',
                extension: primaryEditor.extension ? {
                    id: primaryEditor.extension.id.value,
                    location: primaryEditor.extension.location,
                } : undefined,
                webview: {
                    id: primaryEditor.id,
                    options: primaryEditor.webview.options,
                    state: primaryEditor.webview.state,
                }
            };
            const backupData = {
                meta: backupMeta
            };
            if (!this._editable) {
                return backupData;
            }
            if (this._hotExitState.type === 2 /* Pending */) {
                this._hotExitState.operation.cancel();
            }
            const pendingState = new HotExitState.Pending((0, async_1.createCancelablePromise)(token => this._proxy.$backup(this._editorResource.toJSON(), this.viewType, token)));
            this._hotExitState = pendingState;
            token.onCancellationRequested(() => {
                pendingState.operation.cancel();
            });
            try {
                const backupId = await pendingState.operation;
                // Make sure state has not changed in the meantime
                if (this._hotExitState === pendingState) {
                    this._hotExitState = HotExitState.Allowed;
                    backupData.meta.backupId = backupId;
                    this._backupId = backupId;
                }
            }
            catch (e) {
                if ((0, errors_1.isPromiseCanceledError)(e)) {
                    // This is expected
                    throw e;
                }
                // Otherwise it could be a real error. Make sure state has not changed in the meantime.
                if (this._hotExitState === pendingState) {
                    this._hotExitState = HotExitState.NotAllowed;
                }
            }
            if (this._hotExitState === HotExitState.Allowed) {
                return backupData;
            }
            throw new Error('Cannot back up in this state');
        }
    };
    _MainThreadCustomEditorModel_isDisposed = new WeakMap();
    MainThreadCustomEditorModel = __decorate([
        __param(6, dialogs_1.IFileDialogService),
        __param(7, files_1.IFileService),
        __param(8, label_1.ILabelService),
        __param(9, undoRedo_1.IUndoRedoService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService),
        __param(11, workingCopyService_1.IWorkingCopyService),
        __param(12, pathService_1.IPathService)
    ], MainThreadCustomEditorModel);
});
//# sourceMappingURL=mainThreadCustomEditors.js.map