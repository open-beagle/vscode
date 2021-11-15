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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/resolverService", "vs/workbench/contrib/files/common/files", "vs/platform/label/common/label", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/resources", "vs/base/common/event", "vs/base/common/network"], function (require, exports, nls_1, editor_1, textResourceEditorInput_1, binaryEditorModel_1, files_1, textfiles_1, instantiation_1, lifecycle_1, resolverService_1, files_2, label_1, filesConfigurationService_1, editorService_1, editorGroupsService_1, resources_1, event_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decorateFileEditorLabel = exports.FileEditorInput = void 0;
    var ForceOpenAs;
    (function (ForceOpenAs) {
        ForceOpenAs[ForceOpenAs["None"] = 0] = "None";
        ForceOpenAs[ForceOpenAs["Text"] = 1] = "Text";
        ForceOpenAs[ForceOpenAs["Binary"] = 2] = "Binary";
    })(ForceOpenAs || (ForceOpenAs = {}));
    /**
     * A file editor input is the input type for the file editor of file system resources.
     */
    let FileEditorInput = class FileEditorInput extends textResourceEditorInput_1.AbstractTextResourceEditorInput {
        constructor(resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredMode, instantiationService, textFileService, textModelResolverService, labelService, fileService, filesConfigurationService, editorService, editorGroupService) {
            super(resource, preferredResource, editorService, editorGroupService, textFileService, labelService, fileService, filesConfigurationService);
            this.instantiationService = instantiationService;
            this.textModelResolverService = textModelResolverService;
            this.forceOpenAs = 0 /* None */;
            this.model = undefined;
            this.cachedTextFileModelReference = undefined;
            this.modelListeners = this._register(new lifecycle_1.DisposableStore());
            this.model = this.textFileService.files.get(resource);
            if (preferredName) {
                this.setPreferredName(preferredName);
            }
            if (preferredDescription) {
                this.setPreferredDescription(preferredDescription);
            }
            if (preferredEncoding) {
                this.setPreferredEncoding(preferredEncoding);
            }
            if (preferredMode) {
                this.setPreferredMode(preferredMode);
            }
            // If a file model already exists, make sure to wire it in
            if (this.model) {
                this.registerModelListeners(this.model);
            }
        }
        get typeId() {
            return files_2.FILE_EDITOR_INPUT_ID;
        }
        registerListeners() {
            super.registerListeners();
            // Attach to model that matches our resource once created
            this._register(this.textFileService.files.onDidCreate(model => this.onDidCreateTextFileModel(model)));
        }
        onDidCreateTextFileModel(model) {
            // Once the text file model is created, we keep it inside
            // the input to be able to implement some methods properly
            if ((0, resources_1.isEqual)(model.resource, this.resource)) {
                this.model = model;
                this.registerModelListeners(model);
            }
        }
        registerModelListeners(model) {
            // Clear any old
            this.modelListeners.clear();
            // re-emit some events from the model
            this.modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this.modelListeners.add(model.onDidChangeOrphaned(() => this._onDidChangeLabel.fire()));
            // important: treat save errors as potential dirty change because
            // a file that is in save conflict or error will report dirty even
            // if auto save is turned on.
            this.modelListeners.add(model.onDidSaveError(() => this._onDidChangeDirty.fire()));
            // remove model association once it gets disposed
            this.modelListeners.add(event_1.Event.once(model.onWillDispose)(() => {
                this.modelListeners.clear();
                this.model = undefined;
            }));
        }
        getName() {
            return this.preferredName || this.decorateLabel(super.getName());
        }
        setPreferredName(name) {
            if (!this.allowLabelOverride()) {
                return; // block for specific schemes we own
            }
            if (this.preferredName !== name) {
                this.preferredName = name;
                this._onDidChangeLabel.fire();
            }
        }
        allowLabelOverride() {
            return this.resource.scheme !== network_1.Schemas.file && this.resource.scheme !== network_1.Schemas.vscodeRemote && this.resource.scheme !== network_1.Schemas.userData;
        }
        getPreferredName() {
            return this.preferredName;
        }
        getDescription(verbosity) {
            return this.preferredDescription || super.getDescription(verbosity);
        }
        setPreferredDescription(description) {
            if (!this.allowLabelOverride()) {
                return; // block for specific schemes we own
            }
            if (this.preferredDescription !== description) {
                this.preferredDescription = description;
                this._onDidChangeLabel.fire();
            }
        }
        getPreferredDescription() {
            return this.preferredDescription;
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* SHORT */:
                    return this.decorateLabel(super.getName());
                case 1 /* MEDIUM */:
                case 2 /* LONG */:
                    return this.decorateLabel(super.getTitle(verbosity));
            }
        }
        decorateLabel(label) {
            var _a;
            const orphaned = (_a = this.model) === null || _a === void 0 ? void 0 : _a.hasState(4 /* ORPHAN */);
            const readonly = this.isReadonly();
            return decorateFileEditorLabel(label, { orphaned: !!orphaned, readonly });
        }
        getEncoding() {
            if (this.model) {
                return this.model.getEncoding();
            }
            return this.preferredEncoding;
        }
        getPreferredEncoding() {
            return this.preferredEncoding;
        }
        async setEncoding(encoding, mode) {
            var _a;
            this.setPreferredEncoding(encoding);
            return (_a = this.model) === null || _a === void 0 ? void 0 : _a.setEncoding(encoding, mode);
        }
        setPreferredEncoding(encoding) {
            this.preferredEncoding = encoding;
            // encoding is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        getPreferredMode() {
            return this.preferredMode;
        }
        setMode(mode) {
            var _a;
            this.setPreferredMode(mode);
            (_a = this.model) === null || _a === void 0 ? void 0 : _a.setMode(mode);
        }
        setPreferredMode(mode) {
            this.preferredMode = mode;
            // mode is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        setForceOpenAsText() {
            this.forceOpenAs = 1 /* Text */;
        }
        setForceOpenAsBinary() {
            this.forceOpenAs = 2 /* Binary */;
        }
        isDirty() {
            var _a;
            return !!((_a = this.model) === null || _a === void 0 ? void 0 : _a.isDirty());
        }
        isReadonly() {
            if (this.model) {
                return this.model.isReadonly();
            }
            return super.isReadonly();
        }
        isSaving() {
            var _a, _b, _c;
            if (((_a = this.model) === null || _a === void 0 ? void 0 : _a.hasState(0 /* SAVED */)) || ((_b = this.model) === null || _b === void 0 ? void 0 : _b.hasState(3 /* CONFLICT */)) || ((_c = this.model) === null || _c === void 0 ? void 0 : _c.hasState(5 /* ERROR */))) {
                return false; // require the model to be dirty and not in conflict or error state
            }
            // Note: currently not checking for ModelState.PENDING_SAVE for a reason
            // because we currently miss an event for this state change on editors
            // and it could result in bad UX where an editor can be closed even though
            // it shows up as dirty and has not finished saving yet.
            return super.isSaving();
        }
        getPreferredEditorId(candidates) {
            return this.forceOpenAs === 2 /* Binary */ ? files_2.BINARY_FILE_EDITOR_ID : files_2.TEXT_FILE_EDITOR_ID;
        }
        resolve() {
            // Resolve as binary
            if (this.forceOpenAs === 2 /* Binary */) {
                return this.doResolveAsBinary();
            }
            // Resolve as text
            return this.doResolveAsText();
        }
        async doResolveAsText() {
            try {
                // Resolve resource via text file service and only allow
                // to open binary files if we are instructed so
                await this.textFileService.files.resolve(this.resource, {
                    mode: this.preferredMode,
                    encoding: this.preferredEncoding,
                    reload: { async: true },
                    allowBinary: this.forceOpenAs === 1 /* Text */,
                    reason: 1 /* EDITOR */
                });
                // This is a bit ugly, because we first resolve the model and then resolve a model reference. the reason being that binary
                // or very large files do not resolve to a text file model but should be opened as binary files without text. First calling into
                // resolve() ensures we are not creating model references for these kind of resources.
                // In addition we have a bit of payload to take into account (encoding, reload) that the text resolver does not handle yet.
                if (!this.cachedTextFileModelReference) {
                    this.cachedTextFileModelReference = await this.textModelResolverService.createModelReference(this.resource);
                }
                const model = this.cachedTextFileModelReference.object;
                // It is possible that this input was disposed before the model
                // finished resolving. As such, we need to make sure to dispose
                // the model reference to not leak it.
                if (this.isDisposed()) {
                    this.disposeModelReference();
                }
                return model;
            }
            catch (error) {
                // In case of an error that indicates that the file is binary or too large, just return with the binary editor model
                if (error.textFileOperationResult === 0 /* FILE_IS_BINARY */ ||
                    error.fileOperationResult === 7 /* FILE_TOO_LARGE */) {
                    return this.doResolveAsBinary();
                }
                // Bubble any other error up
                throw error;
            }
        }
        async doResolveAsBinary() {
            const model = this.instantiationService.createInstance(binaryEditorModel_1.BinaryEditorModel, this.preferredResource, this.getName());
            await model.resolve();
            return model;
        }
        isResolved() {
            return !!this.model;
        }
        rename(group, target) {
            return {
                editor: {
                    resource: target,
                    encoding: this.getEncoding(),
                    options: {
                        viewState: this.getViewStateFor(group)
                    }
                }
            };
        }
        getViewStateFor(group) {
            for (const editorPane of this.editorService.visibleEditorPanes) {
                if (editorPane.group.id === group && this.matches(editorPane.input)) {
                    if ((0, editor_1.isTextEditorPane)(editorPane)) {
                        return editorPane.getViewState();
                    }
                }
            }
            return undefined;
        }
        matches(otherInput) {
            if (otherInput === this) {
                return true;
            }
            if (otherInput instanceof FileEditorInput) {
                return (0, resources_1.isEqual)(otherInput.resource, this.resource);
            }
            return false;
        }
        dispose() {
            // Model
            this.model = undefined;
            // Model reference
            this.disposeModelReference();
            super.dispose();
        }
        disposeModelReference() {
            (0, lifecycle_1.dispose)(this.cachedTextFileModelReference);
            this.cachedTextFileModelReference = undefined;
        }
    };
    FileEditorInput = __decorate([
        __param(6, instantiation_1.IInstantiationService),
        __param(7, textfiles_1.ITextFileService),
        __param(8, resolverService_1.ITextModelService),
        __param(9, label_1.ILabelService),
        __param(10, files_1.IFileService),
        __param(11, filesConfigurationService_1.IFilesConfigurationService),
        __param(12, editorService_1.IEditorService),
        __param(13, editorGroupsService_1.IEditorGroupsService)
    ], FileEditorInput);
    exports.FileEditorInput = FileEditorInput;
    function decorateFileEditorLabel(label, state) {
        if (state.orphaned && state.readonly) {
            return (0, nls_1.localize)(0, null, label);
        }
        if (state.orphaned) {
            return (0, nls_1.localize)(1, null, label);
        }
        if (state.readonly) {
            return (0, nls_1.localize)(2, null, label);
        }
        return label;
    }
    exports.decorateFileEditorLabel = decorateFileEditorLabel;
});
//# sourceMappingURL=fileEditorInput.js.map