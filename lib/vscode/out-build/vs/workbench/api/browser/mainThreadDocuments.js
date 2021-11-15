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
define(["require", "exports", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/editor/common/services/modelService", "vs/editor/common/services/resolverService", "vs/platform/files/common/files", "vs/workbench/api/common/extHost.protocol", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/base/common/event", "vs/workbench/services/path/common/pathService"], function (require, exports, errorMessage_1, lifecycle_1, network_1, uri_1, modelService_1, resolverService_1, files_1, extHost_protocol_1, textfiles_1, environmentService_1, resources_1, workingCopyFileService_1, uriIdentity_1, event_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadDocuments = exports.BoundModelReferenceCollection = void 0;
    class BoundModelReferenceCollection {
        constructor(_extUri, _maxAge = 1000 * 60 * 3, _maxLength = 1024 * 1024 * 80) {
            this._extUri = _extUri;
            this._maxAge = _maxAge;
            this._maxLength = _maxLength;
            this._data = new Array();
            this._length = 0;
            //
        }
        dispose() {
            this._data = (0, lifecycle_1.dispose)(this._data);
        }
        remove(uri) {
            for (const entry of [...this._data] /* copy array because dispose will modify it */) {
                if (this._extUri.isEqualOrParent(entry.uri, uri)) {
                    entry.dispose();
                }
            }
        }
        add(uri, ref, length = 0) {
            // const length = ref.object.textEditorModel.getValueLength();
            let handle;
            let entry;
            const dispose = () => {
                const idx = this._data.indexOf(entry);
                if (idx >= 0) {
                    this._length -= length;
                    ref.dispose();
                    clearTimeout(handle);
                    this._data.splice(idx, 1);
                }
            };
            handle = setTimeout(dispose, this._maxAge);
            entry = { uri, length, dispose };
            this._data.push(entry);
            this._length += length;
            this._cleanup();
        }
        _cleanup() {
            while (this._length > this._maxLength) {
                this._data[0].dispose();
            }
        }
    }
    exports.BoundModelReferenceCollection = BoundModelReferenceCollection;
    class ModelTracker extends lifecycle_1.Disposable {
        constructor(_model, _onIsCaughtUpWithContentChanges, _proxy, _textFileService) {
            super();
            this._model = _model;
            this._onIsCaughtUpWithContentChanges = _onIsCaughtUpWithContentChanges;
            this._proxy = _proxy;
            this._textFileService = _textFileService;
            this._knownVersionId = this._model.getVersionId();
            this._register(this._model.onDidChangeContent((e) => {
                this._knownVersionId = e.versionId;
                this._proxy.$acceptModelChanged(this._model.uri, e, this._textFileService.isDirty(this._model.uri));
                if (this.isCaughtUpWithContentChanges()) {
                    this._onIsCaughtUpWithContentChanges.fire(this._model.uri);
                }
            }));
        }
        isCaughtUpWithContentChanges() {
            return (this._model.getVersionId() === this._knownVersionId);
        }
    }
    let MainThreadDocuments = class MainThreadDocuments extends lifecycle_1.Disposable {
        constructor(documentsAndEditors, extHostContext, modelService, textFileService, fileService, textModelResolverService, environmentService, uriIdentityService, workingCopyFileService, _pathService) {
            super();
            this._pathService = _pathService;
            this._onIsCaughtUpWithContentChanges = this._register(new event_1.Emitter());
            this.onIsCaughtUpWithContentChanges = this._onIsCaughtUpWithContentChanges.event;
            this._modelIsSynced = new Set();
            this._modelService = modelService;
            this._textModelResolverService = textModelResolverService;
            this._textFileService = textFileService;
            this._fileService = fileService;
            this._environmentService = environmentService;
            this._uriIdentityService = uriIdentityService;
            this._modelReferenceCollection = this._register(new BoundModelReferenceCollection(uriIdentityService.extUri));
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostDocuments);
            this._register(documentsAndEditors.onDocumentAdd(models => models.forEach(this._onModelAdded, this)));
            this._register(documentsAndEditors.onDocumentRemove(urls => urls.forEach(this._onModelRemoved, this)));
            this._register(modelService.onModelModeChanged(this._onModelModeChanged, this));
            this._register(textFileService.files.onDidSave(e => {
                if (this._shouldHandleFileEvent(e.model.resource)) {
                    this._proxy.$acceptModelSaved(e.model.resource);
                }
            }));
            this._register(textFileService.files.onDidChangeDirty(m => {
                if (this._shouldHandleFileEvent(m.resource)) {
                    this._proxy.$acceptDirtyStateChanged(m.resource, m.isDirty());
                }
            }));
            this._register(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
                const isMove = e.operation === 2 /* MOVE */;
                if (isMove || e.operation === 1 /* DELETE */) {
                    for (const pair of e.files) {
                        const removed = isMove ? pair.source : pair.target;
                        if (removed) {
                            this._modelReferenceCollection.remove(removed);
                        }
                    }
                }
            }));
            this._modelTrackers = Object.create(null);
        }
        dispose() {
            Object.keys(this._modelTrackers).forEach((modelUrl) => {
                this._modelTrackers[modelUrl].dispose();
            });
            this._modelTrackers = Object.create(null);
            super.dispose();
        }
        isCaughtUpWithContentChanges(resource) {
            const modelUrl = resource.toString();
            if (this._modelTrackers[modelUrl]) {
                return this._modelTrackers[modelUrl].isCaughtUpWithContentChanges();
            }
            return true;
        }
        _shouldHandleFileEvent(resource) {
            const model = this._modelService.getModel(resource);
            return !!model && (0, modelService_1.shouldSynchronizeModel)(model);
        }
        _onModelAdded(model) {
            // Same filter as in mainThreadEditorsTracker
            if (!(0, modelService_1.shouldSynchronizeModel)(model)) {
                // don't synchronize too large models
                return;
            }
            const modelUrl = model.uri;
            this._modelIsSynced.add(modelUrl.toString());
            this._modelTrackers[modelUrl.toString()] = new ModelTracker(model, this._onIsCaughtUpWithContentChanges, this._proxy, this._textFileService);
        }
        _onModelModeChanged(event) {
            let { model } = event;
            const modelUrl = model.uri;
            if (!this._modelIsSynced.has(modelUrl.toString())) {
                return;
            }
            this._proxy.$acceptModelModeChanged(model.uri, model.getLanguageIdentifier().language);
        }
        _onModelRemoved(modelUrl) {
            const strModelUrl = modelUrl.toString();
            if (!this._modelIsSynced.has(strModelUrl)) {
                return;
            }
            this._modelIsSynced.delete(strModelUrl);
            this._modelTrackers[strModelUrl].dispose();
            delete this._modelTrackers[strModelUrl];
        }
        // --- from extension host process
        $trySaveDocument(uri) {
            return this._textFileService.save(uri_1.URI.revive(uri)).then(target => !!target);
        }
        $tryOpenDocument(uriData) {
            const inputUri = uri_1.URI.revive(uriData);
            if (!inputUri.scheme || !(inputUri.fsPath || inputUri.authority)) {
                return Promise.reject(new Error(`Invalid uri. Scheme and authority or path must be set.`));
            }
            const canonicalUri = this._uriIdentityService.asCanonicalUri(inputUri);
            let promise;
            switch (canonicalUri.scheme) {
                case network_1.Schemas.untitled:
                    promise = this._handleUntitledScheme(canonicalUri);
                    break;
                case network_1.Schemas.file:
                default:
                    promise = this._handleAsResourceInput(canonicalUri);
                    break;
            }
            return promise.then(documentUri => {
                if (!documentUri) {
                    return Promise.reject(new Error(`cannot open ${canonicalUri.toString()}`));
                }
                else if (!resources_1.extUri.isEqual(documentUri, canonicalUri)) {
                    return Promise.reject(new Error(`cannot open ${canonicalUri.toString()}. Detail: Actual document opened as ${documentUri.toString()}`));
                }
                else if (!this._modelIsSynced.has(canonicalUri.toString())) {
                    return Promise.reject(new Error(`cannot open ${canonicalUri.toString()}. Detail: Files above 50MB cannot be synchronized with extensions.`));
                }
                else {
                    return canonicalUri;
                }
            }, err => {
                return Promise.reject(new Error(`cannot open ${canonicalUri.toString()}. Detail: ${(0, errorMessage_1.toErrorMessage)(err)}`));
            });
        }
        $tryCreateDocument(options) {
            return this._doCreateUntitled(undefined, options ? options.language : undefined, options ? options.content : undefined);
        }
        _handleAsResourceInput(uri) {
            return this._textModelResolverService.createModelReference(uri).then(ref => {
                this._modelReferenceCollection.add(uri, ref, ref.object.textEditorModel.getValueLength());
                return ref.object.textEditorModel.uri;
            });
        }
        _handleUntitledScheme(uri) {
            const asLocalUri = (0, resources_1.toLocalResource)(uri, this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
            return this._fileService.resolve(asLocalUri).then(stats => {
                // don't create a new file ontop of an existing file
                return Promise.reject(new Error('file already exists'));
            }, err => {
                return this._doCreateUntitled(Boolean(uri.path) ? uri : undefined);
            });
        }
        _doCreateUntitled(associatedResource, mode, initialValue) {
            return this._textFileService.untitled.resolve({
                associatedResource,
                mode,
                initialValue
            }).then(model => {
                const resource = model.resource;
                if (!this._modelIsSynced.has(resource.toString())) {
                    throw new Error(`expected URI ${resource.toString()} to have come to LIFE`);
                }
                this._proxy.$acceptDirtyStateChanged(resource, true); // mark as dirty
                return resource;
            });
        }
    };
    MainThreadDocuments = __decorate([
        __param(2, modelService_1.IModelService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, files_1.IFileService),
        __param(5, resolverService_1.ITextModelService),
        __param(6, environmentService_1.IWorkbenchEnvironmentService),
        __param(7, uriIdentity_1.IUriIdentityService),
        __param(8, workingCopyFileService_1.IWorkingCopyFileService),
        __param(9, pathService_1.IPathService)
    ], MainThreadDocuments);
    exports.MainThreadDocuments = MainThreadDocuments;
});
//# sourceMappingURL=mainThreadDocuments.js.map