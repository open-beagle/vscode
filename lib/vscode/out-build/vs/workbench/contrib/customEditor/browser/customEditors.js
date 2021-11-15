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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/browser/editorExtensions", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/editor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/contrib/customEditor/common/customEditor", "vs/workbench/contrib/customEditor/common/customEditorModelManager", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorOverrideService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/uriIdentity/common/uriIdentity", "../common/contributedCustomEditors", "./customEditorInput"], function (require, exports, arrays_1, event_1, lifecycle_1, resources_1, editorExtensions_1, contextkey_1, files_1, instantiation_1, platform_1, storage_1, colorRegistry, themeService_1, editor_1, diffEditorInput_1, customEditor_1, customEditorModelManager_1, editorGroupsService_1, editorOverrideService_1, editorService_1, uriIdentity_1, contributedCustomEditors_1, customEditorInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEditorService = void 0;
    let CustomEditorService = class CustomEditorService extends lifecycle_1.Disposable {
        constructor(contextKeyService, fileService, storageService, editorService, editorGroupService, instantiationService, uriIdentityService, extensionContributedEditorService) {
            super();
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.instantiationService = instantiationService;
            this.uriIdentityService = uriIdentityService;
            this.extensionContributedEditorService = extensionContributedEditorService;
            this._editorOverrideDisposables = [];
            this._editorCapabilities = new Map();
            this._models = new customEditorModelManager_1.CustomEditorModelManager();
            this._onDidChangeEditorTypes = this._register(new event_1.Emitter());
            this.onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
            this._fileEditorInputFactory = platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).getFileEditorInputFactory();
            this._activeCustomEditorId = customEditor_1.CONTEXT_ACTIVE_CUSTOM_EDITOR_ID.bindTo(contextKeyService);
            this._focusedCustomEditorIsEditable = customEditor_1.CONTEXT_FOCUSED_CUSTOM_EDITOR_IS_EDITABLE.bindTo(contextKeyService);
            this._contributedEditors = this._register(new contributedCustomEditors_1.ContributedCustomEditors(storageService));
            this.registerContributionPoints();
            this._register(this._contributedEditors.onChange(() => {
                this.registerContributionPoints();
                this.updateContexts();
                this._onDidChangeEditorTypes.fire();
            }));
            this._register(platform_1.Registry.as(editor_1.EditorExtensions.Associations).registerEditorTypesHandler('Custom Editor', this));
            this._register(this.editorService.onDidActiveEditorChange(() => this.updateContexts()));
            this._register(fileService.onDidRunOperation(e => {
                if (e.isOperation(2 /* MOVE */)) {
                    this.handleMovedFileInOpenedFileEditors(e.resource, this.uriIdentityService.asCanonicalUri(e.target.resource));
                }
            }));
            const PRIORITY = 105;
            this._register(editorExtensions_1.UndoCommand.addImplementation(PRIORITY, 'custom-editor', () => {
                return this.withActiveCustomEditor(editor => editor.undo());
            }));
            this._register(editorExtensions_1.RedoCommand.addImplementation(PRIORITY, 'custom-editor', () => {
                return this.withActiveCustomEditor(editor => editor.redo());
            }));
            this.updateContexts();
        }
        getEditorTypes() {
            return [...this._contributedEditors];
        }
        withActiveCustomEditor(f) {
            const activeEditor = this.editorService.activeEditor;
            if (activeEditor instanceof customEditorInput_1.CustomEditorInput) {
                const result = f(activeEditor);
                if (result) {
                    return result;
                }
                return true;
            }
            return false;
        }
        registerContributionPoints() {
            // Clear all previous contributions we know
            this._editorOverrideDisposables.forEach(d => d.dispose());
            for (const contributedEditor of this._contributedEditors) {
                for (const globPattern of contributedEditor.selector) {
                    if (!globPattern.filenamePattern) {
                        continue;
                    }
                    this._editorOverrideDisposables.push(this._register(this.extensionContributedEditorService.registerContributionPoint(globPattern.filenamePattern, {
                        id: contributedEditor.id,
                        label: contributedEditor.displayName,
                        detail: contributedEditor.providerDisplayName,
                        describes: (currentEditor) => currentEditor instanceof customEditorInput_1.CustomEditorInput && currentEditor.viewType === contributedEditor.id,
                        priority: contributedEditor.priority,
                    }, {
                        singlePerResource: () => { var _a, _b; return (_b = !((_a = this.getCustomEditorCapabilities(contributedEditor.id)) === null || _a === void 0 ? void 0 : _a.supportsMultipleEditorsPerDocument)) !== null && _b !== void 0 ? _b : true; }
                    }, (resource, options, group) => {
                        return { editor: customEditorInput_1.CustomEditorInput.create(this.instantiationService, resource, contributedEditor.id, group.id) };
                    }, (diffEditorInput, options, group) => {
                        return { editor: this.createDiffEditorInput(diffEditorInput, contributedEditor.id, group) };
                    })));
                }
            }
        }
        createDiffEditorInput(editor, editorID, group) {
            const createEditorForSubInput = (subInput, editorID, customClasses) => {
                // We check before calling this call back that both resources are defined
                const input = customEditorInput_1.CustomEditorInput.create(this.instantiationService, subInput.resource, editorID, group.id, { customClasses });
                return input instanceof editor_1.EditorInput ? input : undefined;
            };
            const modifiedOverride = createEditorForSubInput(editor.modifiedInput, editorID, 'modified');
            const originalOverride = createEditorForSubInput(editor.originalInput, editorID, 'original');
            return this.instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, editor.getName(), editor.getDescription(), originalOverride || editor.originalInput, modifiedOverride || editor.modifiedInput, true);
        }
        get models() { return this._models; }
        getCustomEditor(viewType) {
            return this._contributedEditors.get(viewType);
        }
        getContributedCustomEditors(resource) {
            return new customEditor_1.CustomEditorInfoCollection(this._contributedEditors.getContributedEditors(resource));
        }
        getUserConfiguredCustomEditors(resource) {
            const resourceAssocations = this.extensionContributedEditorService.getAssociationsForResource(resource);
            return new customEditor_1.CustomEditorInfoCollection((0, arrays_1.coalesce)(resourceAssocations
                .map(association => this._contributedEditors.get(association.viewType))));
        }
        getAllCustomEditors(resource) {
            return new customEditor_1.CustomEditorInfoCollection([
                ...this.getUserConfiguredCustomEditors(resource).allEditors,
                ...this.getContributedCustomEditors(resource).allEditors,
            ]);
        }
        registerCustomEditorCapabilities(viewType, options) {
            if (this._editorCapabilities.has(viewType)) {
                throw new Error(`Capabilities for ${viewType} already set`);
            }
            this._editorCapabilities.set(viewType, options);
            return (0, lifecycle_1.toDisposable)(() => {
                this._editorCapabilities.delete(viewType);
            });
        }
        getCustomEditorCapabilities(viewType) {
            return this._editorCapabilities.get(viewType);
        }
        updateContexts() {
            var _a;
            const activeEditorPane = this.editorService.activeEditorPane;
            const resource = (_a = activeEditorPane === null || activeEditorPane === void 0 ? void 0 : activeEditorPane.input) === null || _a === void 0 ? void 0 : _a.resource;
            if (!resource) {
                this._activeCustomEditorId.reset();
                this._focusedCustomEditorIsEditable.reset();
                return;
            }
            this._activeCustomEditorId.set((activeEditorPane === null || activeEditorPane === void 0 ? void 0 : activeEditorPane.input) instanceof customEditorInput_1.CustomEditorInput ? activeEditorPane.input.viewType : '');
            this._focusedCustomEditorIsEditable.set((activeEditorPane === null || activeEditorPane === void 0 ? void 0 : activeEditorPane.input) instanceof customEditorInput_1.CustomEditorInput);
        }
        async handleMovedFileInOpenedFileEditors(oldResource, newResource) {
            if ((0, resources_1.extname)(oldResource).toLowerCase() === (0, resources_1.extname)(newResource).toLowerCase()) {
                return;
            }
            const possibleEditors = this.getAllCustomEditors(newResource);
            // See if we have any non-optional custom editor for this resource
            if (!possibleEditors.allEditors.some(editor => editor.priority !== editorOverrideService_1.ContributedEditorPriority.option)) {
                return;
            }
            // If so, check all editors to see if there are any file editors open for the new resource
            const editorsToReplace = new Map();
            for (const group of this.editorGroupService.groups) {
                for (const editor of group.editors) {
                    if (this._fileEditorInputFactory.isFileEditorInput(editor)
                        && !(editor instanceof customEditorInput_1.CustomEditorInput)
                        && (0, resources_1.isEqual)(editor.resource, newResource)) {
                        let entry = editorsToReplace.get(group.id);
                        if (!entry) {
                            entry = [];
                            editorsToReplace.set(group.id, entry);
                        }
                        entry.push(editor);
                    }
                }
            }
            if (!editorsToReplace.size) {
                return;
            }
            for (const [group, entries] of editorsToReplace) {
                this.editorService.replaceEditors(entries.map(editor => {
                    let replacement;
                    if (possibleEditors.defaultEditor) {
                        const viewType = possibleEditors.defaultEditor.id;
                        replacement = customEditorInput_1.CustomEditorInput.create(this.instantiationService, newResource, viewType, group);
                    }
                    else {
                        replacement = this.editorService.createEditorInput({ resource: newResource });
                    }
                    return {
                        editor,
                        replacement,
                        options: {
                            preserveFocus: true,
                        }
                    };
                }), group);
            }
        }
    };
    CustomEditorService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, files_1.IFileService),
        __param(2, storage_1.IStorageService),
        __param(3, editorService_1.IEditorService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, uriIdentity_1.IUriIdentityService),
        __param(7, editorOverrideService_1.IEditorOverrideService)
    ], CustomEditorService);
    exports.CustomEditorService = CustomEditorService;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const shadow = theme.getColor(colorRegistry.scrollbarShadow);
        if (shadow) {
            collector.addRule(`.webview.modified { box-shadow: -6px 0 5px -5px ${shadow}; }`);
        }
    });
});
//# sourceMappingURL=customEditors.js.map