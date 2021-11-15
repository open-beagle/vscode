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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/uri", "vs/workbench/api/browser/mainThreadDocuments", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/uriIdentity/common/uriIdentity", "../common/extHost.protocol", "vs/base/common/errors"], function (require, exports, lifecycle_1, map_1, uri_1, mainThreadDocuments_1, notebookCommon_1, notebookEditorModelResolverService_1, notebookService_1, uriIdentity_1, extHost_protocol_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadNotebookDocuments = void 0;
    let MainThreadNotebookDocuments = class MainThreadNotebookDocuments {
        constructor(extHostContext, notebooksAndEditors, _notebookService, _notebookEditorModelResolverService, _uriIdentityService) {
            this._notebookService = _notebookService;
            this._notebookEditorModelResolverService = _notebookEditorModelResolverService;
            this._uriIdentityService = _uriIdentityService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._documentEventListenersMapping = new map_1.ResourceMap();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebook);
            this._modelReferenceCollection = new mainThreadDocuments_1.BoundModelReferenceCollection(this._uriIdentityService.extUri);
            notebooksAndEditors.onDidAddNotebooks(this._handleNotebooksAdded, this, this._disposables);
            notebooksAndEditors.onDidRemoveNotebooks(this._handleNotebooksRemoved, this, this._disposables);
            // forward dirty and save events
            this._disposables.add(this._notebookEditorModelResolverService.onDidChangeDirty(model => this._proxy.$acceptDirtyStateChanged(model.resource, model.isDirty())));
            this._disposables.add(this._notebookEditorModelResolverService.onDidSaveNotebook(e => this._proxy.$acceptModelSaved(e)));
        }
        dispose() {
            this._disposables.dispose();
            this._modelReferenceCollection.dispose();
            (0, lifecycle_1.dispose)(this._documentEventListenersMapping.values());
        }
        _handleNotebooksAdded(notebooks) {
            for (const textModel of notebooks) {
                const disposableStore = new lifecycle_1.DisposableStore();
                disposableStore.add(textModel.onDidChangeContent(event => {
                    const dto = event.rawEvents.map(e => {
                        const data = e.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange || e.kind === notebookCommon_1.NotebookCellsChangeType.Initialize
                            ? {
                                kind: e.kind,
                                versionId: event.versionId,
                                changes: e.changes.map(diff => [diff[0], diff[1], diff[2].map(cell => MainThreadNotebookDocuments._cellToDto(cell))])
                            }
                            : (e.kind === notebookCommon_1.NotebookCellsChangeType.Move
                                ? {
                                    kind: e.kind,
                                    index: e.index,
                                    length: e.length,
                                    newIdx: e.newIdx,
                                    versionId: event.versionId,
                                    cells: e.cells.map(cell => MainThreadNotebookDocuments._cellToDto(cell))
                                }
                                : e);
                        return data;
                    });
                    // using the model resolver service to know if the model is dirty or not.
                    // assuming this is the first listener it can mean that at first the model
                    // is marked as dirty and that another event is fired
                    this._proxy.$acceptModelChanged(textModel.uri, { rawEvents: dto, versionId: event.versionId }, this._notebookEditorModelResolverService.isDirty(textModel.uri));
                    const hasDocumentMetadataChangeEvent = event.rawEvents.find(e => e.kind === notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata);
                    if (hasDocumentMetadataChangeEvent) {
                        this._proxy.$acceptDocumentPropertiesChanged(textModel.uri, { metadata: textModel.metadata });
                    }
                }));
                this._documentEventListenersMapping.set(textModel.uri, disposableStore);
            }
        }
        _handleNotebooksRemoved(uris) {
            var _a;
            for (const uri of uris) {
                (_a = this._documentEventListenersMapping.get(uri)) === null || _a === void 0 ? void 0 : _a.dispose();
                this._documentEventListenersMapping.delete(uri);
            }
        }
        static _cellToDto(cell) {
            return {
                handle: cell.handle,
                uri: cell.uri,
                source: cell.textBuffer.getLinesContent(),
                eol: cell.textBuffer.getEOL(),
                language: cell.language,
                cellKind: cell.cellKind,
                outputs: cell.outputs,
                metadata: cell.metadata
            };
        }
        async $tryOpenDocument(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const ref = await this._notebookEditorModelResolverService.resolve(uri, undefined);
            this._modelReferenceCollection.add(uri, ref);
            return uri;
        }
        async $trySaveDocument(uriComponents) {
            const uri = uri_1.URI.revive(uriComponents);
            const ref = await this._notebookEditorModelResolverService.resolve(uri);
            const saveResult = await ref.object.save();
            ref.dispose();
            return saveResult;
        }
        async $applyEdits(resource, cellEdits, computeUndoRedo = true) {
            const textModel = this._notebookService.getNotebookTextModel(uri_1.URI.from(resource));
            if (!textModel) {
                throw new Error(`Can't apply edits to unknown notebook model: ${uri_1.URI.revive(resource).toString()}`);
            }
            try {
                textModel.applyEdits(cellEdits, true, undefined, () => undefined, undefined, computeUndoRedo);
            }
            catch (e) {
                // Clearing outputs at the same time as the EH calling append/replaceOutputItems is an expected race, and it should be a no-op.
                // And any other failure should not throw back to the extension.
                (0, errors_1.onUnexpectedError)(e);
            }
        }
    };
    MainThreadNotebookDocuments = __decorate([
        __param(2, notebookService_1.INotebookService),
        __param(3, notebookEditorModelResolverService_1.INotebookEditorModelResolverService),
        __param(4, uriIdentity_1.IUriIdentityService)
    ], MainThreadNotebookDocuments);
    exports.MainThreadNotebookDocuments = MainThreadNotebookDocuments;
});
//# sourceMappingURL=mainThreadNotebookDocuments.js.map