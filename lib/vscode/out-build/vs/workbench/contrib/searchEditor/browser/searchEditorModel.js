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
define(["require", "exports", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/types", "vs/workbench/services/workingCopy/common/workingCopy", "vs/editor/common/model/textModel", "vs/workbench/contrib/searchEditor/browser/constants"], function (require, exports, modelService_1, modeService_1, instantiation_1, searchEditorSerialization_1, workingCopyBackup_1, types_1, workingCopy_1, textModel_1, constants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchEditorModel = void 0;
    let SearchEditorModel = class SearchEditorModel {
        constructor(modelUri, config, existingData, instantiationService, workingCopyBackupService, modelService, modeService) {
            this.modelUri = modelUri;
            this.config = config;
            this.existingData = existingData;
            this.instantiationService = instantiationService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.modelService = modelService;
            this.modeService = modeService;
            this.cachedContentsModel = undefined;
            this.ongoingResolve = Promise.resolve(undefined);
            this.onModelResolved = new Promise(resolve => this.resolveContents = resolve);
            this.onModelResolved.then(model => this.cachedContentsModel = model);
            this.ongoingResolve = (async () => {
                let discardLegacyBackup = false;
                let backup = await workingCopyBackupService.resolve({ resource: modelUri, typeId: constants_1.SearchEditorWorkingCopyTypeId });
                if (!backup) {
                    // TODO@bpasero remove this fallback after some releases
                    backup = await workingCopyBackupService.resolve({ resource: modelUri, typeId: workingCopy_1.NO_TYPE_ID });
                    if (backup && modelUri.scheme === constants_1.SearchEditorScheme) {
                        discardLegacyBackup = true;
                    }
                }
                let model = modelService.getModel(modelUri);
                if (!model && backup) {
                    const factory = await (0, textModel_1.createTextBufferFactoryFromStream)(backup.value);
                    if (discardLegacyBackup) {
                        await workingCopyBackupService.discardBackup({ resource: modelUri, typeId: workingCopy_1.NO_TYPE_ID });
                    }
                    model = modelService.createModel(factory, modeService.create('search-result'), modelUri);
                }
                if (model) {
                    this.resolveContents(model);
                }
                return model;
            })();
        }
        async resolve() {
            await (this.ongoingResolve = this.ongoingResolve.then(() => this.cachedContentsModel || this.createModel()));
            return (0, types_1.assertIsDefined)(this.cachedContentsModel);
        }
        async createModel() {
            var _a;
            const getContents = async () => {
                if (this.existingData.text !== undefined) {
                    return this.existingData.text;
                }
                else if (this.existingData.backingUri !== undefined) {
                    return (await this.instantiationService.invokeFunction(searchEditorSerialization_1.parseSavedSearchEditor, this.existingData.backingUri)).text;
                }
                else {
                    return '';
                }
            };
            const contents = await getContents();
            const model = (_a = this.modelService.getModel(this.modelUri)) !== null && _a !== void 0 ? _a : this.modelService.createModel(contents, this.modeService.create('search-result'), this.modelUri);
            this.resolveContents(model);
            return model;
        }
    };
    SearchEditorModel = __decorate([
        __param(3, instantiation_1.IInstantiationService),
        __param(4, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(5, modelService_1.IModelService),
        __param(6, modeService_1.IModeService)
    ], SearchEditorModel);
    exports.SearchEditorModel = SearchEditorModel;
});
//# sourceMappingURL=searchEditorModel.js.map