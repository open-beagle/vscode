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
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/decorators", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uuid", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/customEditor/common/contributedCustomEditors", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/untitled/common/untitledTextEditorService"], function (require, exports, buffer_1, decorators_1, network_1, path_1, resources_1, types_1, uuid_1, dialogs_1, instantiation_1, label_1, undoRedo_1, contributedCustomEditors_1, customEditor_1, fileEditorInput_1, webview_1, webviewWorkbenchService_1, editorService_1, untitledTextEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEditorInput = void 0;
    let CustomEditorInput = class CustomEditorInput extends webviewWorkbenchService_1.LazilyResolvedWebviewEditorInput {
        constructor(resource, viewType, id, webview, options, webviewWorkbenchService, instantiationService, labelService, customEditorService, fileDialogService, editorService, undoRedoService) {
            super(id, viewType, '', webview, webviewWorkbenchService);
            this.instantiationService = instantiationService;
            this.labelService = labelService;
            this.customEditorService = customEditorService;
            this.fileDialogService = fileDialogService;
            this.editorService = editorService;
            this.undoRedoService = undoRedoService;
            this._editorResource = resource;
            this._defaultDirtyState = options.startsDirty;
            this._backupId = options.backupId;
            this._untitledDocumentData = options.untitledDocumentData;
        }
        static create(instantiationService, resource, viewType, group, options) {
            return instantiationService.invokeFunction(accessor => {
                if (viewType === contributedCustomEditors_1.defaultCustomEditor.id) {
                    return accessor.get(editorService_1.IEditorService).createEditorInput({ resource, forceFile: true });
                }
                // If it's an untitled file we must populate the untitledDocumentData
                const untitledString = accessor.get(untitledTextEditorService_1.IUntitledTextEditorService).getValue(resource);
                let untitledDocumentData = untitledString ? buffer_1.VSBuffer.fromString(untitledString) : undefined;
                const id = (0, uuid_1.generateUuid)();
                const webview = accessor.get(webview_1.IWebviewService).createWebviewOverlay(id, { customClasses: options === null || options === void 0 ? void 0 : options.customClasses }, {}, undefined);
                const input = instantiationService.createInstance(CustomEditorInput, resource, viewType, id, webview, { untitledDocumentData: untitledDocumentData });
                // If we're loading untitled file data we should ensure it's dirty
                if (untitledDocumentData) {
                    input._defaultDirtyState = true;
                }
                if (typeof group !== 'undefined') {
                    input.updateGroup(group);
                }
                return input;
            });
        }
        get resource() { return this._editorResource; }
        get typeId() {
            return CustomEditorInput.typeId;
        }
        canSplit() {
            var _a;
            return !!((_a = this.customEditorService.getCustomEditorCapabilities(this.viewType)) === null || _a === void 0 ? void 0 : _a.supportsMultipleEditorsPerDocument);
        }
        getName() {
            const name = (0, path_1.basename)(this.labelService.getUriLabel(this.resource));
            return this.decorateLabel(name);
        }
        matches(other) {
            return this === other || (other instanceof CustomEditorInput
                && this.viewType === other.viewType
                && (0, resources_1.isEqual)(this.resource, other.resource));
        }
        copy() {
            return CustomEditorInput.create(this.instantiationService, this.resource, this.viewType, this.group, this.webview.options);
        }
        get shortTitle() {
            return this.getName();
        }
        get mediumTitle() {
            return this.labelService.getUriLabel(this.resource, { relative: true });
        }
        get longTitle() {
            return this.labelService.getUriLabel(this.resource);
        }
        getTitle(verbosity) {
            switch (verbosity) {
                case 0 /* SHORT */:
                    return this.decorateLabel(this.shortTitle);
                default:
                case 1 /* MEDIUM */:
                    return this.decorateLabel(this.mediumTitle);
                case 2 /* LONG */:
                    return this.decorateLabel(this.longTitle);
            }
        }
        decorateLabel(label) {
            var _a;
            const orphaned = !!((_a = this._modelRef) === null || _a === void 0 ? void 0 : _a.object.isOrphaned());
            const readonly = this._modelRef
                ? this._modelRef.object.isEditable() && this._modelRef.object.isOnReadonlyFileSystem()
                : false;
            return (0, fileEditorInput_1.decorateFileEditorLabel)(label, {
                orphaned,
                readonly
            });
        }
        isReadonly() {
            return this._modelRef ? !this._modelRef.object.isEditable() : false;
        }
        isUntitled() {
            return this.resource.scheme === network_1.Schemas.untitled;
        }
        isDirty() {
            if (!this._modelRef) {
                return !!this._defaultDirtyState;
            }
            return this._modelRef.object.isDirty();
        }
        async save(groupId, options) {
            if (!this._modelRef) {
                return undefined;
            }
            const target = await this._modelRef.object.saveCustomEditor(options);
            if (!target) {
                return undefined; // save cancelled
            }
            if (!(0, resources_1.isEqual)(target, this.resource)) {
                return CustomEditorInput.create(this.instantiationService, target, this.viewType, groupId);
            }
            return this;
        }
        async saveAs(groupId, options) {
            var _a;
            if (!this._modelRef) {
                return undefined;
            }
            const dialogPath = this._editorResource;
            const target = await this.fileDialogService.pickFileToSave(dialogPath, options === null || options === void 0 ? void 0 : options.availableFileSystems);
            if (!target) {
                return undefined; // save cancelled
            }
            if (!await this._modelRef.object.saveCustomEditorAs(this._editorResource, target, options)) {
                return undefined;
            }
            return (_a = this.rename(groupId, target)) === null || _a === void 0 ? void 0 : _a.editor;
        }
        async revert(group, options) {
            if (this._modelRef) {
                return this._modelRef.object.revert(options);
            }
            this._defaultDirtyState = false;
            this._onDidChangeDirty.fire();
        }
        async resolve() {
            await super.resolve();
            if (this.isDisposed()) {
                return null;
            }
            if (!this._modelRef) {
                this._modelRef = this._register((0, types_1.assertIsDefined)(await this.customEditorService.models.tryRetain(this.resource, this.viewType)));
                this._register(this._modelRef.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
                this._register(this._modelRef.object.onDidChangeOrphaned(() => this._onDidChangeLabel.fire()));
                if (this.isDirty()) {
                    this._onDidChangeDirty.fire();
                }
            }
            return null;
        }
        rename(group, newResource) {
            // See if we can keep using the same custom editor provider
            const editorInfo = this.customEditorService.getCustomEditor(this.viewType);
            if (editorInfo === null || editorInfo === void 0 ? void 0 : editorInfo.matches(newResource)) {
                return { editor: this.doMove(group, newResource) };
            }
            return { editor: this.editorService.createEditorInput({ resource: newResource, forceFile: true }) };
        }
        doMove(group, newResource) {
            if (!this._moveHandler) {
                return CustomEditorInput.create(this.instantiationService, newResource, this.viewType, group);
            }
            this._moveHandler(newResource);
            const newEditor = this.instantiationService.createInstance(CustomEditorInput, newResource, this.viewType, this.id, undefined, // this webview is replaced in the transfer call
            { startsDirty: this._defaultDirtyState, backupId: this._backupId });
            this.transfer(newEditor);
            newEditor.updateGroup(group);
            return newEditor;
        }
        undo() {
            (0, types_1.assertIsDefined)(this._modelRef);
            return this.undoRedoService.undo(this.resource);
        }
        redo() {
            (0, types_1.assertIsDefined)(this._modelRef);
            return this.undoRedoService.redo(this.resource);
        }
        onMove(handler) {
            // TODO: Move this to the service
            this._moveHandler = handler;
        }
        transfer(other) {
            if (!super.transfer(other)) {
                return;
            }
            other._moveHandler = this._moveHandler;
            this._moveHandler = undefined;
            return other;
        }
        get backupId() {
            if (this._modelRef) {
                return this._modelRef.object.backupId;
            }
            return this._backupId;
        }
        get untitledDocumentData() {
            return this._untitledDocumentData;
        }
    };
    CustomEditorInput.typeId = 'workbench.editors.webviewEditor';
    __decorate([
        decorators_1.memoize
    ], CustomEditorInput.prototype, "shortTitle", null);
    __decorate([
        decorators_1.memoize
    ], CustomEditorInput.prototype, "mediumTitle", null);
    __decorate([
        decorators_1.memoize
    ], CustomEditorInput.prototype, "longTitle", null);
    CustomEditorInput = __decorate([
        __param(5, webviewWorkbenchService_1.IWebviewWorkbenchService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, label_1.ILabelService),
        __param(8, customEditor_1.ICustomEditorService),
        __param(9, dialogs_1.IFileDialogService),
        __param(10, editorService_1.IEditorService),
        __param(11, undoRedo_1.IUndoRedoService)
    ], CustomEditorInput);
    exports.CustomEditorInput = CustomEditorInput;
});
//# sourceMappingURL=customEditorInput.js.map