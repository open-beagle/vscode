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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/textEditorModel", "vs/workbench/common/editor/diffEditorModel", "vs/workbench/common/editor/textDiffEditorModel", "vs/nls!vs/workbench/common/editor/diffEditorInput", "vs/workbench/common/editor/textResourceEditorInput", "vs/base/common/resources", "vs/platform/label/common/label", "vs/platform/files/common/files", "vs/base/common/types"], function (require, exports, editor_1, textEditorModel_1, diffEditorModel_1, textDiffEditorModel_1, nls_1, textResourceEditorInput_1, resources_1, label_1, files_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiffEditorInput = void 0;
    /**
     * The base editor input for the diff editor. It is made up of two editor inputs, the original version
     * and the modified version.
     */
    let DiffEditorInput = class DiffEditorInput extends editor_1.SideBySideEditorInput {
        constructor(name, description, originalInput, modifiedInput, forceOpenAsBinary, labelService, fileService) {
            super(name, description, originalInput, modifiedInput);
            this.originalInput = originalInput;
            this.modifiedInput = modifiedInput;
            this.forceOpenAsBinary = forceOpenAsBinary;
            this.labelService = labelService;
            this.fileService = fileService;
            this.cachedModel = undefined;
        }
        get typeId() {
            return DiffEditorInput.ID;
        }
        getName() {
            if (!this.name) {
                // Craft a name from original and modified input that includes the
                // relative path in case both sides have different parents and we
                // compare file resources.
                const fileResources = this.asFileResources();
                if (fileResources && (0, resources_1.dirname)(fileResources.original).path !== (0, resources_1.dirname)(fileResources.modified).path) {
                    return `${this.labelService.getUriLabel(fileResources.original, { relative: true })} ↔ ${this.labelService.getUriLabel(fileResources.modified, { relative: true })}`;
                }
                return (0, nls_1.localize)(0, null, this.originalInput.getName(), this.modifiedInput.getName());
            }
            return this.name;
        }
        getDescription(verbosity = 1 /* MEDIUM */) {
            if (typeof this.description !== 'string') {
                // Pass the description of the modified side in case both original
                // and modified input have the same parent and we compare file resources.
                const fileResources = this.asFileResources();
                if (fileResources && (0, resources_1.dirname)(fileResources.original).path === (0, resources_1.dirname)(fileResources.modified).path) {
                    return this.modifiedInput.getDescription(verbosity);
                }
            }
            return this.description;
        }
        asFileResources() {
            if (this.originalInput instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput &&
                this.modifiedInput instanceof textResourceEditorInput_1.AbstractTextResourceEditorInput &&
                this.fileService.canHandleResource(this.originalInput.preferredResource) &&
                this.fileService.canHandleResource(this.modifiedInput.preferredResource)) {
                return {
                    original: this.originalInput.preferredResource,
                    modified: this.modifiedInput.preferredResource
                };
            }
            return undefined;
        }
        async resolve() {
            // Create Model - we never reuse our cached model if refresh is true because we cannot
            // decide for the inputs within if the cached model can be reused or not. There may be
            // inputs that need to be loaded again and thus we always recreate the model and dispose
            // the previous one - if any.
            const resolvedModel = await this.createModel();
            if (this.cachedModel) {
                this.cachedModel.dispose();
            }
            this.cachedModel = resolvedModel;
            return this.cachedModel;
        }
        getPreferredEditorId(candidates) {
            return this.forceOpenAsBinary ? editor_1.BINARY_DIFF_EDITOR_ID : editor_1.TEXT_DIFF_EDITOR_ID;
        }
        async createModel() {
            // Join resolve call over two inputs and build diff editor model
            const [originalEditorModel, modifiedEditorModel] = await Promise.all([
                this.originalInput.resolve(),
                this.modifiedInput.resolve()
            ]);
            // If both are text models, return textdiffeditor model
            if (modifiedEditorModel instanceof textEditorModel_1.BaseTextEditorModel && originalEditorModel instanceof textEditorModel_1.BaseTextEditorModel) {
                return new textDiffEditorModel_1.TextDiffEditorModel(originalEditorModel, modifiedEditorModel);
            }
            // Otherwise return normal diff model
            return new diffEditorModel_1.DiffEditorModel((0, types_1.withNullAsUndefined)(originalEditorModel), (0, types_1.withNullAsUndefined)(modifiedEditorModel));
        }
        matches(otherInput) {
            if (!super.matches(otherInput)) {
                return false;
            }
            return otherInput instanceof DiffEditorInput && otherInput.forceOpenAsBinary === this.forceOpenAsBinary;
        }
        dispose() {
            // Free the diff editor model but do not propagate the dispose() call to the two inputs
            // We never created the two inputs (original and modified) so we can not dispose
            // them without sideeffects.
            if (this.cachedModel) {
                this.cachedModel.dispose();
                this.cachedModel = undefined;
            }
            super.dispose();
        }
    };
    DiffEditorInput.ID = 'workbench.editors.diffEditorInput';
    DiffEditorInput = __decorate([
        __param(5, label_1.ILabelService),
        __param(6, files_1.IFileService)
    ], DiffEditorInput);
    exports.DiffEditorInput = DiffEditorInput;
});
//# sourceMappingURL=diffEditorInput.js.map