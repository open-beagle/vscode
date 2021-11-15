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
define(["require", "exports", "vs/base/common/glob", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/common/resources", "vs/platform/instantiation/common/instantiation", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/platform/label/common/label", "vs/base/common/network", "vs/workbench/contrib/notebook/common/notebookPerformance"], function (require, exports, glob, editor_1, notebookService_1, resources_1, instantiation_1, dialogs_1, notebookEditorModelResolverService_1, label_1, network_1, notebookPerformance_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorInput = void 0;
    let NotebookEditorInput = class NotebookEditorInput extends editor_1.EditorInput {
        constructor(resource, viewType, options, _notebookService, _notebookModelResolverService, _fileDialogService, _instantiationService, labelService) {
            super();
            this.resource = resource;
            this.viewType = viewType;
            this.options = options;
            this._notebookService = _notebookService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._fileDialogService = _fileDialogService;
            this._instantiationService = _instantiationService;
            this._editorModelReference = null;
            this._defaultDirtyState = false;
            this._defaultDirtyState = !!options.startDirty;
            this._name = labelService.getUriBasenameLabel(resource);
        }
        static create(instantiationService, resource, viewType, options = {}) {
            return instantiationService.createInstance(NotebookEditorInput, resource, viewType, options);
        }
        dispose() {
            var _a;
            (_a = this._editorModelReference) === null || _a === void 0 ? void 0 : _a.dispose();
            this._editorModelReference = null;
            super.dispose();
        }
        get typeId() {
            return NotebookEditorInput.ID;
        }
        getName() {
            return this._name;
        }
        isDirty() {
            if (!this._editorModelReference) {
                return this._defaultDirtyState;
            }
            return this._editorModelReference.object.isDirty();
        }
        isUntitled() {
            return this.resource.scheme === network_1.Schemas.untitled;
        }
        isReadonly() {
            if (!this._editorModelReference) {
                return super.isReadonly();
            }
            return this._editorModelReference.object.isReadonly();
        }
        async save(group, options) {
            if (this._editorModelReference) {
                if (this.isUntitled()) {
                    return this.saveAs(group, options);
                }
                else {
                    await this._editorModelReference.object.save(options);
                }
                return this;
            }
            return undefined;
        }
        async saveAs(group, options) {
            if (!this._editorModelReference) {
                return undefined;
            }
            const provider = this._notebookService.getContributedNotebookProvider(this.viewType);
            if (!provider) {
                return undefined;
            }
            const dialogPath = this.isUntitled() ? await this._suggestName(this._name) : this._editorModelReference.object.resource;
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
                throw new Error(`File name ${target} is not supported by ${provider.providerDisplayName}.\n\nPlease make sure the file name matches following patterns:\n${patterns}`);
            }
            return await this._editorModelReference.object.saveAs(target);
        }
        async _suggestName(suggestedFilename) {
            return (0, resources_1.joinPath)(await this._fileDialogService.defaultFilePath(), suggestedFilename);
        }
        // called when users rename a notebook document
        rename(group, target) {
            if (this._editorModelReference) {
                const contributedNotebookProviders = this._notebookService.getContributedNotebookProviders(target);
                if (contributedNotebookProviders.find(provider => provider.id === this._editorModelReference.object.viewType)) {
                    return this._move(group, target);
                }
            }
            return undefined;
        }
        _move(_group, newResource) {
            const editorInput = NotebookEditorInput.create(this._instantiationService, newResource, this.viewType);
            return { editor: editorInput };
        }
        async revert(_group, options) {
            if (this._editorModelReference && this._editorModelReference.object.isDirty()) {
                await this._editorModelReference.object.revert(options);
            }
        }
        async resolve() {
            if (!await this._notebookService.canResolve(this.viewType)) {
                return null;
            }
            (0, notebookPerformance_1.mark)(this.resource, 'extensionActivated');
            if (!this._editorModelReference) {
                this._editorModelReference = await this._notebookModelResolverService.resolve(this.resource, this.viewType);
                if (this.isDisposed()) {
                    this._editorModelReference.dispose();
                    this._editorModelReference = null;
                    return null;
                }
                this._register(this._editorModelReference.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
                if (this._editorModelReference.object.isDirty()) {
                    this._onDidChangeDirty.fire();
                }
            }
            else {
                this._editorModelReference.object.load();
            }
            return this._editorModelReference.object;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof NotebookEditorInput) {
                return this.viewType === otherInput.viewType && (0, resources_1.isEqual)(this.resource, otherInput.resource);
            }
            return false;
        }
    };
    NotebookEditorInput.ID = 'workbench.input.notebook';
    NotebookEditorInput = __decorate([
        __param(3, notebookService_1.INotebookService),
        __param(4, notebookEditorModelResolverService_1.INotebookEditorModelResolverService),
        __param(5, dialogs_1.IFileDialogService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, label_1.ILabelService)
    ], NotebookEditorInput);
    exports.NotebookEditorInput = NotebookEditorInput;
});
//# sourceMappingURL=notebookEditorInput.js.map