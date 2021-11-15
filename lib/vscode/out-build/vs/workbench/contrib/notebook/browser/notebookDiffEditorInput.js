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
define(["require", "exports", "vs/base/common/glob", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/resources", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/base/common/network"], function (require, exports, glob, editor_1, notebookService_1, resources_1, dialogs_1, notebookEditorModelResolverService_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookDiffEditorInput = void 0;
    class NotebookDiffEditorModel extends editor_1.EditorModel {
        constructor(original, modified) {
            super();
            this.original = original;
            this.modified = modified;
        }
        async load() {
            await this.original.load();
            await this.modified.load();
            return this;
        }
        async resolveOriginalFromDisk() {
            await this.original.load({ forceReadFromFile: true });
        }
        async resolveModifiedFromDisk() {
            await this.modified.load({ forceReadFromFile: true });
        }
        dispose() {
            super.dispose();
        }
    }
    let NotebookDiffEditorInput = class NotebookDiffEditorInput extends editor_1.EditorInput {
        constructor(resource, name, originalResource, originalName, textDiffName, viewType, options, _notebookService, _notebookModelResolverService, _fileDialogService) {
            super();
            this.resource = resource;
            this.name = name;
            this.originalResource = originalResource;
            this.originalName = originalName;
            this.textDiffName = textDiffName;
            this.viewType = viewType;
            this.options = options;
            this._notebookService = _notebookService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._fileDialogService = _fileDialogService;
            this._modifiedTextModel = null;
            this._originalTextModel = null;
            this._defaultDirtyState = false;
            this._defaultDirtyState = !!options.startDirty;
        }
        static create(instantiationService, resource, name, originalResource, originalName, textDiffName, viewType, options = {}) {
            return instantiationService.createInstance(NotebookDiffEditorInput, resource, name, originalResource, originalName, textDiffName, viewType, options);
        }
        get typeId() {
            return NotebookDiffEditorInput.ID;
        }
        getName() {
            return this.textDiffName;
        }
        isDirty() {
            if (!this._modifiedTextModel) {
                return this._defaultDirtyState;
            }
            return this._modifiedTextModel.object.isDirty();
        }
        isUntitled() {
            var _a;
            return ((_a = this._modifiedTextModel) === null || _a === void 0 ? void 0 : _a.object.resource.scheme) === network_1.Schemas.untitled;
        }
        isReadonly() {
            return false;
        }
        async save(group, options) {
            if (this._modifiedTextModel) {
                if (this.isUntitled()) {
                    return this.saveAs(group, options);
                }
                else {
                    await this._modifiedTextModel.object.save();
                }
                return this;
            }
            return undefined;
        }
        async saveAs(group, options) {
            var _a;
            if (!this._modifiedTextModel || !this.viewType) {
                return undefined;
            }
            const provider = this._notebookService.getContributedNotebookProvider(this.viewType);
            if (!provider) {
                return undefined;
            }
            const dialogPath = this._modifiedTextModel.object.resource;
            const target = await this._fileDialogService.pickFileToSave(dialogPath, options === null || options === void 0 ? void 0 : options.availableFileSystems);
            if (!target) {
                return undefined; // save cancelled
            }
            if (!provider.matches(target)) {
                const patterns = provider.selectors.map(pattern => {
                    if (typeof pattern === 'string') {
                        return pattern;
                    }
                    if (glob.isRelativePattern(pattern)) {
                        return `${pattern} (base ${pattern.base})`;
                    }
                    return `${pattern.include} (exclude: ${pattern.exclude})`;
                }).join(', ');
                throw new Error(`File name ${target} is not supported by ${provider.providerDisplayName}.

Please make sure the file name matches following patterns:
${patterns}
`);
            }
            if (!await this._modifiedTextModel.object.saveAs(target)) {
                return undefined;
            }
            return (_a = this._move(group, target)) === null || _a === void 0 ? void 0 : _a.editor;
        }
        // called when users rename a notebook document
        rename(group, target) {
            if (this._modifiedTextModel) {
                const contributedNotebookProviders = this._notebookService.getContributedNotebookProviders(target);
                if (contributedNotebookProviders.find(provider => provider.id === this._modifiedTextModel.object.viewType)) {
                    return this._move(group, target);
                }
            }
            return undefined;
        }
        _move(group, newResource) {
            return undefined;
        }
        async revert(group, options) {
            if (this._modifiedTextModel && this._modifiedTextModel.object.isDirty()) {
                await this._modifiedTextModel.object.revert(options);
            }
            return;
        }
        async resolve() {
            if (!await this._notebookService.canResolve(this.viewType)) {
                return null;
            }
            if (!this._modifiedTextModel) {
                this._modifiedTextModel = await this._notebookModelResolverService.resolve(this.resource, this.viewType);
                this._register(this._modifiedTextModel.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
                if (this._modifiedTextModel.object.isDirty() !== this._defaultDirtyState) {
                    this._onDidChangeDirty.fire();
                }
            }
            if (!this._originalTextModel) {
                this._originalTextModel = await this._notebookModelResolverService.resolve(this.originalResource, this.viewType);
            }
            return new NotebookDiffEditorModel(this._originalTextModel.object, this._modifiedTextModel.object);
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof NotebookDiffEditorInput) {
                return this.viewType === otherInput.viewType
                    && (0, resources_1.isEqual)(this.resource, otherInput.resource);
            }
            return false;
        }
        dispose() {
            var _a, _b;
            (_a = this._modifiedTextModel) === null || _a === void 0 ? void 0 : _a.dispose();
            this._modifiedTextModel = null;
            (_b = this._originalTextModel) === null || _b === void 0 ? void 0 : _b.dispose();
            this._originalTextModel = null;
            super.dispose();
        }
    };
    NotebookDiffEditorInput.ID = 'workbench.input.diffNotebookInput';
    NotebookDiffEditorInput = __decorate([
        __param(7, notebookService_1.INotebookService),
        __param(8, notebookEditorModelResolverService_1.INotebookEditorModelResolverService),
        __param(9, dialogs_1.IFileDialogService)
    ], NotebookDiffEditorInput);
    exports.NotebookDiffEditorInput = NotebookDiffEditorInput;
});
//# sourceMappingURL=notebookDiffEditorInput.js.map