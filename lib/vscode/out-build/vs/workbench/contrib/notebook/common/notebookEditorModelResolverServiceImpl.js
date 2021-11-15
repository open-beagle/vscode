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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/uri", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorModel", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookService", "vs/platform/log/common/log", "vs/base/common/event", "vs/workbench/services/workingCopy/common/fileWorkingCopyManager", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/base/common/map"], function (require, exports, instantiation_1, uri_1, notebookCommon_1, notebookEditorModel_1, lifecycle_1, notebookService_1, log_1, event_1, fileWorkingCopyManager_1, extensions_1, uriIdentity_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookModelResolverServiceImpl = void 0;
    let NotebookModelReferenceCollection = class NotebookModelReferenceCollection extends lifecycle_1.ReferenceCollection {
        constructor(_instantiationService, _notebookService, _logService) {
            super();
            this._instantiationService = _instantiationService;
            this._notebookService = _notebookService;
            this._logService = _logService;
            this._workingCopyManagers = new Map();
            this._modelListener = new Map();
            this._onDidSaveNotebook = new event_1.Emitter();
            this.onDidSaveNotebook = this._onDidSaveNotebook.event;
            this._onDidChangeDirty = new event_1.Emitter();
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._dirtyStates = new map_1.ResourceMap();
        }
        dispose() {
            this._onDidSaveNotebook.dispose();
            this._onDidChangeDirty.dispose();
            (0, lifecycle_1.dispose)(this._modelListener.values());
            (0, lifecycle_1.dispose)(this._workingCopyManagers.values());
        }
        isDirty(resource) {
            var _a;
            return (_a = this._dirtyStates.get(resource)) !== null && _a !== void 0 ? _a : false;
        }
        async createReferencedObject(key, viewType) {
            const uri = uri_1.URI.parse(key);
            const info = await this._notebookService.withNotebookDataProvider(uri, viewType);
            let result;
            if (info instanceof notebookService_1.ComplexNotebookProviderInfo) {
                const model = this._instantiationService.createInstance(notebookEditorModel_1.ComplexNotebookEditorModel, uri, viewType, info.controller);
                result = await model.load();
            }
            else if (info instanceof notebookService_1.SimpleNotebookProviderInfo) {
                const workingCopyTypeId = `${notebookCommon_1.NOTEBOOK_WORKING_COPY_TYPE_PREFIX}${viewType}`;
                let workingCopyManager = this._workingCopyManagers.get(workingCopyTypeId);
                if (!workingCopyManager) {
                    workingCopyManager = this._instantiationService.createInstance(fileWorkingCopyManager_1.FileWorkingCopyManager, workingCopyTypeId, new notebookEditorModel_1.NotebookFileWorkingCopyModelFactory(viewType, this._notebookService));
                    this._workingCopyManagers.set(workingCopyTypeId, workingCopyManager);
                }
                const model = this._instantiationService.createInstance(notebookEditorModel_1.SimpleNotebookEditorModel, uri, viewType, workingCopyManager);
                result = await model.load();
            }
            else {
                throw new Error(`CANNOT open ${key}, no provider found`);
            }
            // Whenever a notebook model is dirty we automatically reference it so that
            // we can ensure that at least one reference exists. That guarantees that
            // a model with unsaved changes is never disposed.
            let onDirtyAutoReference;
            this._modelListener.set(result, (0, lifecycle_1.combinedDisposable)(result.onDidSave(() => this._onDidSaveNotebook.fire(result.resource)), result.onDidChangeDirty(() => {
                const isDirty = result.isDirty();
                this._dirtyStates.set(result.resource, isDirty);
                // isDirty -> add reference
                // !isDirty -> free reference
                if (isDirty && !onDirtyAutoReference) {
                    onDirtyAutoReference = this.acquire(key, viewType);
                }
                else if (onDirtyAutoReference) {
                    onDirtyAutoReference.dispose();
                    onDirtyAutoReference = undefined;
                }
                this._onDidChangeDirty.fire(result);
            }), (0, lifecycle_1.toDisposable)(() => onDirtyAutoReference === null || onDirtyAutoReference === void 0 ? void 0 : onDirtyAutoReference.dispose())));
            return result;
        }
        destroyReferencedObject(_key, object) {
            object.then(model => {
                var _a;
                (_a = this._modelListener.get(model)) === null || _a === void 0 ? void 0 : _a.dispose();
                this._modelListener.delete(model);
                model.dispose();
            }).catch(err => {
                this._logService.critical('FAILED to destory notebook', err);
            });
        }
    };
    NotebookModelReferenceCollection = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookService_1.INotebookService),
        __param(2, log_1.ILogService)
    ], NotebookModelReferenceCollection);
    let NotebookModelResolverServiceImpl = class NotebookModelResolverServiceImpl {
        constructor(instantiationService, _notebookService, _extensionService, _uriIdentService) {
            this._notebookService = _notebookService;
            this._extensionService = _extensionService;
            this._uriIdentService = _uriIdentService;
            this._data = instantiationService.createInstance(NotebookModelReferenceCollection);
            this.onDidSaveNotebook = this._data.onDidSaveNotebook;
            this.onDidChangeDirty = this._data.onDidChangeDirty;
        }
        dispose() {
            this._data.dispose();
        }
        isDirty(resource) {
            return this._data.isDirty(resource);
        }
        async resolve(resource, viewType) {
            var _a, _b;
            if (resource.scheme === notebookCommon_1.CellUri.scheme) {
                throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${resource.toString()}`);
            }
            resource = this._uriIdentService.asCanonicalUri(resource);
            const existingViewType = (_a = this._notebookService.getNotebookTextModel(resource)) === null || _a === void 0 ? void 0 : _a.viewType;
            if (!viewType) {
                if (existingViewType) {
                    viewType = existingViewType;
                }
                else {
                    await this._extensionService.whenInstalledExtensionsRegistered();
                    const providers = this._notebookService.getContributedNotebookProviders(resource);
                    const exclusiveProvider = providers.find(provider => provider.exclusive);
                    viewType = (exclusiveProvider === null || exclusiveProvider === void 0 ? void 0 : exclusiveProvider.id) || ((_b = providers[0]) === null || _b === void 0 ? void 0 : _b.id);
                }
            }
            if (!viewType) {
                throw new Error(`Missing viewType for '${resource}'`);
            }
            if (existingViewType && existingViewType !== viewType) {
                throw new Error(`A notebook with view type '${existingViewType}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`);
            }
            const reference = this._data.acquire(resource.toString(), viewType);
            const model = await reference.object;
            return {
                object: model,
                dispose() {
                    reference.dispose();
                }
            };
        }
    };
    NotebookModelResolverServiceImpl = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookService_1.INotebookService),
        __param(2, extensions_1.IExtensionService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], NotebookModelResolverServiceImpl);
    exports.NotebookModelResolverServiceImpl = NotebookModelResolverServiceImpl;
});
//# sourceMappingURL=notebookEditorModelResolverServiceImpl.js.map