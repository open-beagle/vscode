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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/base/common/network", "vs/base/common/resources"], function (require, exports, editor_1, textfiles_1, editorService_1, editorGroupsService_1, files_1, label_1, filesConfigurationService_1, network_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractTextResourceEditorInput = void 0;
    /**
     * The base class for all editor inputs that open in text editors.
     */
    let AbstractTextResourceEditorInput = class AbstractTextResourceEditorInput extends editor_1.EditorInput {
        constructor(resource, preferredResource, editorService, editorGroupService, textFileService, labelService, fileService, filesConfigurationService) {
            super();
            this.resource = resource;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.textFileService = textFileService;
            this.labelService = labelService;
            this.fileService = fileService;
            this.filesConfigurationService = filesConfigurationService;
            this._name = undefined;
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            this._preferredResource = preferredResource || resource;
            this.registerListeners();
        }
        get preferredResource() { return this._preferredResource; }
        registerListeners() {
            // Clear label memoizer on certain events that have impact
            this._register(this.labelService.onDidChangeFormatters(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onLabelEvent(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onLabelEvent(e.scheme)));
        }
        onLabelEvent(scheme) {
            if (scheme === this._preferredResource.scheme) {
                this.updateLabel();
            }
        }
        updateLabel() {
            // Clear any cached labels from before
            this._name = undefined;
            this._shortDescription = undefined;
            this._mediumDescription = undefined;
            this._longDescription = undefined;
            this._shortTitle = undefined;
            this._mediumTitle = undefined;
            this._longTitle = undefined;
            // Trigger recompute of label
            this._onDidChangeLabel.fire();
        }
        setPreferredResource(preferredResource) {
            if (!(0, resources_1.isEqual)(preferredResource, this._preferredResource)) {
                this._preferredResource = preferredResource;
                this.updateLabel();
            }
        }
        getName() {
            if (typeof this._name !== 'string') {
                this._name = this.labelService.getUriBasenameLabel(this._preferredResource);
            }
            return this._name;
        }
        getDescription(verbosity = 1 /* MEDIUM */) {
            switch (verbosity) {
                case 0 /* SHORT */:
                    return this.shortDescription;
                case 2 /* LONG */:
                    return this.longDescription;
                case 1 /* MEDIUM */:
                default:
                    return this.mediumDescription;
            }
        }
        get shortDescription() {
            if (typeof this._shortDescription !== 'string') {
                this._shortDescription = this.labelService.getUriBasenameLabel((0, resources_1.dirname)(this._preferredResource));
            }
            return this._shortDescription;
        }
        get mediumDescription() {
            if (typeof this._mediumDescription !== 'string') {
                this._mediumDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this._preferredResource), { relative: true });
            }
            return this._mediumDescription;
        }
        get longDescription() {
            if (typeof this._longDescription !== 'string') {
                this._longDescription = this.labelService.getUriLabel((0, resources_1.dirname)(this._preferredResource));
            }
            return this._longDescription;
        }
        get shortTitle() {
            if (typeof this._shortTitle !== 'string') {
                this._shortTitle = this.getName();
            }
            return this._shortTitle;
        }
        get mediumTitle() {
            if (typeof this._mediumTitle !== 'string') {
                this._mediumTitle = this.labelService.getUriLabel(this._preferredResource, { relative: true });
            }
            return this._mediumTitle;
        }
        get longTitle() {
            if (typeof this._longTitle !== 'string') {
                this._longTitle = this.labelService.getUriLabel(this._preferredResource);
            }
            return this._longTitle;
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* SHORT */:
                    return this.shortTitle;
                case 2 /* LONG */:
                    return this.longTitle;
                default:
                case 1 /* MEDIUM */:
                    return this.mediumTitle;
            }
        }
        isUntitled() {
            //  any file: is never untitled as it can be saved
            //  untitled: is untitled by definition
            // any other: is untitled because it cannot be saved, as such we expect a "Save As" dialog
            return !this.fileService.canHandleResource(this.resource);
        }
        isReadonly() {
            if (this.isUntitled()) {
                return false; // untitled is never readonly
            }
            return this.fileService.hasCapability(this.resource, 2048 /* Readonly */);
        }
        isSaving() {
            if (this.isUntitled()) {
                return false; // untitled is never saving automatically
            }
            if (this.filesConfigurationService.getAutoSaveMode() === 1 /* AFTER_SHORT_DELAY */) {
                return true; // a short auto save is configured, treat this as being saved
            }
            return false;
        }
        save(group, options) {
            // If this is neither an `untitled` resource, nor a resource
            // we can handle with the file service, we can only "Save As..."
            if (this.resource.scheme !== network_1.Schemas.untitled && !this.fileService.canHandleResource(this.resource)) {
                return this.saveAs(group, options);
            }
            // Normal save
            return this.doSave(options, false);
        }
        saveAs(group, options) {
            return this.doSave(options, true);
        }
        async doSave(options, saveAs) {
            // Save / Save As
            let target;
            if (saveAs) {
                target = await this.textFileService.saveAs(this.resource, undefined, Object.assign(Object.assign({}, options), { suggestedTarget: this.preferredResource }));
            }
            else {
                target = await this.textFileService.save(this.resource, options);
            }
            if (!target) {
                return undefined; // save cancelled
            }
            // If this save operation results in a new editor, either
            // because it was saved to disk (e.g. from untitled) or
            // through an explicit "Save As", make sure to replace it.
            if (target.scheme !== this.resource.scheme ||
                (saveAs && !(0, resources_1.isEqual)(target, this.preferredResource))) {
                return this.editorService.createEditorInput({ resource: target });
            }
            return this;
        }
        async revert(group, options) {
            await this.textFileService.revert(this.resource, options);
        }
    };
    AbstractTextResourceEditorInput = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, editorGroupsService_1.IEditorGroupsService),
        __param(4, textfiles_1.ITextFileService),
        __param(5, label_1.ILabelService),
        __param(6, files_1.IFileService),
        __param(7, filesConfigurationService_1.IFilesConfigurationService)
    ], AbstractTextResourceEditorInput);
    exports.AbstractTextResourceEditorInput = AbstractTextResourceEditorInput;
});
//# sourceMappingURL=textResourceEditorInput.js.map