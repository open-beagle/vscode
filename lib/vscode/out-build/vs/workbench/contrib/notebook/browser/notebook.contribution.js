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
define(["require", "exports", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/marshalling", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/editor/common/services/resolverService", "vs/nls!vs/workbench/contrib/notebook/browser/notebook.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/browser/editor", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/contrib/notebook/browser/notebookEditor", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/notebook/browser/notebookServiceImpl", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/contrib/notebook/browser/notebookDiffEditorInput", "vs/workbench/contrib/notebook/browser/diff/notebookTextDiffEditor", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/workbench/contrib/notebook/common/services/notebookWorkerServiceImpl", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/browser/notebookCellStatusBarServiceImpl", "vs/workbench/contrib/notebook/browser/notebookEditorService", "vs/workbench/contrib/notebook/browser/notebookEditorServiceImpl", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/event", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverServiceImpl", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/notebookKernelServiceImpl", "vs/workbench/services/workingCopy/common/workingCopy", "vs/platform/editor/common/editor", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/contrib/notebook/browser/contrib/clipboard/notebookClipboard", "vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/workbench/contrib/notebook/browser/contrib/find/findController", "vs/workbench/contrib/notebook/browser/contrib/fold/folding", "vs/workbench/contrib/notebook/browser/contrib/format/formatting", "vs/workbench/contrib/notebook/browser/contrib/layout/layoutActions", "vs/workbench/contrib/notebook/browser/contrib/marker/markerProvider", "vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/workbench/contrib/notebook/browser/contrib/statusBar/statusBarProviders", "vs/workbench/contrib/notebook/browser/contrib/statusBar/contributedStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/statusBar/executionStatusBarItemController", "vs/workbench/contrib/notebook/browser/contrib/status/editorStatus", "vs/workbench/contrib/notebook/browser/contrib/undoRedo/notebookUndoRedo", "vs/workbench/contrib/notebook/browser/contrib/cellOperations/cellOperations", "vs/workbench/contrib/notebook/browser/contrib/viewportCustomMarkdown/viewportCustomMarkdown", "vs/workbench/contrib/notebook/browser/contrib/troubleshoot/layout", "vs/workbench/contrib/notebook/browser/diff/notebookDiffActions", "vs/workbench/contrib/notebook/browser/view/output/transforms/richTransform"], function (require, exports, network_1, lifecycle_1, marshalling_1, resources_1, types_1, uri_1, modelService_1, modeService_1, resolverService_1, nls, configurationRegistry_1, descriptors_1, extensions_1, instantiation_1, platform_1, editor_1, contributions_1, editor_2, workingCopyBackup_1, notebookEditor_1, notebookEditorInput_1, notebookService_1, notebookServiceImpl_1, notebookCommon_1, editorService_1, undoRedo_1, notebookEditorModelResolverService_1, notebookDiffEditorInput_1, notebookTextDiffEditor_1, notebookWorkerService_1, notebookWorkerServiceImpl_1, notebookCellStatusBarService_1, notebookCellStatusBarServiceImpl_1, notebookEditorService_1, notebookEditorServiceImpl_1, jsonContributionRegistry_1, event_1, diffElementViewModel_1, notebookEditorModelResolverServiceImpl_1, notebookKernelService_1, notebookKernelServiceImpl_1, workingCopy_1, editor_3, extensions_2, workingCopyEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookContribution = void 0;
    /*--------------------------------------------------------------------------------------------- */
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(notebookEditor_1.NotebookEditor, notebookEditor_1.NotebookEditor.ID, 'Notebook Editor'), [
        new descriptors_1.SyncDescriptor(notebookEditorInput_1.NotebookEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(notebookTextDiffEditor_1.NotebookTextDiffEditor, notebookTextDiffEditor_1.NotebookTextDiffEditor.ID, 'Notebook Diff Editor'), [
        new descriptors_1.SyncDescriptor(notebookDiffEditorInput_1.NotebookDiffEditorInput)
    ]);
    class NotebookDiffEditorSerializer {
        canSerialize() {
            return true;
        }
        serialize(input) {
            (0, types_1.assertType)(input instanceof notebookDiffEditorInput_1.NotebookDiffEditorInput);
            return JSON.stringify({
                resource: input.resource,
                originalResource: input.originalResource,
                name: input.name,
                originalName: input.originalName,
                textDiffName: input.textDiffName,
                viewType: input.viewType,
            });
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.parse)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, originalResource, name, originalName, textDiffName, viewType } = data;
            if (!data || !uri_1.URI.isUri(resource) || !uri_1.URI.isUri(originalResource) || typeof name !== 'string' || typeof originalName !== 'string' || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookDiffEditorInput_1.NotebookDiffEditorInput.create(instantiationService, resource, name, originalResource, originalName, textDiffName || nls.localize(0, null, originalResource.toString(true), resource.toString(true)), viewType);
            return input;
        }
        static canResolveBackup(editorInput, backupResource) {
            return false;
        }
    }
    class NotebookEditorSerializer {
        canSerialize() {
            return true;
        }
        serialize(input) {
            (0, types_1.assertType)(input instanceof notebookEditorInput_1.NotebookEditorInput);
            return JSON.stringify({
                resource: input.resource,
                name: input.getName(),
                viewType: input.viewType,
            });
        }
        deserialize(instantiationService, raw) {
            const data = (0, marshalling_1.parse)(raw);
            if (!data) {
                return undefined;
            }
            const { resource, viewType } = data;
            if (!data || !uri_1.URI.isUri(resource) || typeof viewType !== 'string') {
                return undefined;
            }
            const input = notebookEditorInput_1.NotebookEditorInput.create(instantiationService, resource, viewType);
            return input;
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(notebookEditorInput_1.NotebookEditorInput.ID, NotebookEditorSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerCustomEditorInputFactory(network_1.Schemas.vscodeNotebook, new class {
        async createCustomEditorInput(resource, instantiationService) {
            return instantiationService.invokeFunction(async (accessor) => {
                const workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
                const backup = await workingCopyBackupService.resolve({ resource, typeId: workingCopy_1.NO_TYPE_ID });
                if (!(backup === null || backup === void 0 ? void 0 : backup.meta)) {
                    throw new Error(`No backup found for Notebook editor: ${resource}`);
                }
                const input = notebookEditorInput_1.NotebookEditorInput.create(instantiationService, resource, backup.meta.viewType, { startDirty: true });
                return input;
            });
        }
        canResolveBackup(editorInput, backupResource) {
            if (editorInput instanceof notebookEditorInput_1.NotebookEditorInput) {
                if ((0, resources_1.isEqual)(uri_1.URI.from({ scheme: network_1.Schemas.vscodeNotebook, path: editorInput.resource.toString() }), backupResource)) {
                    return true;
                }
            }
            return false;
        }
    });
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(notebookDiffEditorInput_1.NotebookDiffEditorInput.ID, NotebookDiffEditorSerializer);
    let NotebookContribution = class NotebookContribution extends lifecycle_1.Disposable {
        constructor(undoRedoService) {
            super();
            this._register(undoRedoService.registerUriComparisonKeyComputer(notebookCommon_1.CellUri.scheme, {
                getComparisonKey: (uri) => {
                    return (0, notebookCommon_1.getCellUndoRedoComparisonKey)(uri);
                }
            }));
        }
    };
    NotebookContribution = __decorate([
        __param(0, undoRedo_1.IUndoRedoService)
    ], NotebookContribution);
    exports.NotebookContribution = NotebookContribution;
    let CellContentProvider = class CellContentProvider {
        constructor(textModelService, _modelService, _modeService, _notebookModelResolverService) {
            this._modelService = _modelService;
            this._modeService = _modeService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._registration = textModelService.registerTextModelContentProvider(notebookCommon_1.CellUri.scheme, this);
        }
        dispose() {
            this._registration.dispose();
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parse(resource);
            // const data = parseCellUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            let result = null;
            for (const cell of ref.object.notebook.cells) {
                if (cell.uri.toString() === resource.toString()) {
                    const bufferFactory = {
                        create: (defaultEOL) => {
                            const newEOL = (defaultEOL === 2 /* CRLF */ ? '\r\n' : '\n');
                            cell.textBuffer.setEOL(newEOL);
                            return { textBuffer: cell.textBuffer, disposable: lifecycle_1.Disposable.None };
                        },
                        getFirstLineText: (limit) => {
                            return cell.textBuffer.getLineContent(1).substr(0, limit);
                        }
                    };
                    const language = cell.cellKind === notebookCommon_1.CellKind.Markdown ? this._modeService.create('markdown') : (cell.language ? this._modeService.create(cell.language) : this._modeService.createByFilepathOrFirstLine(resource, cell.textBuffer.getLineContent(1)));
                    result = this._modelService.createModel(bufferFactory, language, resource);
                    break;
                }
            }
            if (result) {
                const once = result.onWillDispose(() => {
                    once.dispose();
                    ref.dispose();
                });
            }
            return result;
        }
    };
    CellContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, modelService_1.IModelService),
        __param(2, modeService_1.IModeService),
        __param(3, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], CellContentProvider);
    let CellMetadataContentProvider = class CellMetadataContentProvider {
        constructor(textModelService, _modelService, _modeService, _notebookModelResolverService) {
            this._modelService = _modelService;
            this._modeService = _modeService;
            this._notebookModelResolverService = _notebookModelResolverService;
            this._registration = textModelService.registerTextModelContentProvider(network_1.Schemas.vscodeNotebookCellMetadata, this);
        }
        dispose() {
            this._registration.dispose();
        }
        async provideTextContent(resource) {
            const existing = this._modelService.getModel(resource);
            if (existing) {
                return existing;
            }
            const data = notebookCommon_1.CellUri.parseCellMetadataUri(resource);
            // const data = parseCellUri(resource);
            if (!data) {
                return null;
            }
            const ref = await this._notebookModelResolverService.resolve(data.notebook);
            let result = null;
            const mode = this._modeService.create('json');
            for (const cell of ref.object.notebook.cells) {
                if (cell.handle === data.handle) {
                    const metadataSource = (0, diffElementViewModel_1.getFormatedMetadataJSON)(ref.object.notebook, cell.metadata || {}, cell.language);
                    result = this._modelService.createModel(metadataSource, mode, resource);
                    break;
                }
            }
            if (result) {
                const once = result.onWillDispose(() => {
                    once.dispose();
                    ref.dispose();
                });
            }
            return result;
        }
    };
    CellMetadataContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, modelService_1.IModelService),
        __param(2, modeService_1.IModeService),
        __param(3, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], CellMetadataContentProvider);
    class RegisterSchemasContribution extends lifecycle_1.Disposable {
        constructor() {
            super();
            this.registerMetadataSchemas();
        }
        registerMetadataSchemas() {
            const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
            const metadataSchema = {
                properties: {
                    ['language']: {
                        type: 'string',
                        description: 'The language for the cell'
                    },
                    ['inputCollapsed']: {
                        type: 'boolean',
                        description: `Whether a code cell's editor is collapsed`
                    },
                    ['outputCollapsed']: {
                        type: 'boolean',
                        description: `Whether a code cell's outputs are collapsed`
                    }
                },
                // patternProperties: allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            };
            jsonRegistry.registerSchema('vscode://schemas/notebook/cellmetadata', metadataSchema);
        }
    }
    // makes sure that every dirty notebook gets an editor
    let NotebookFileTracker = class NotebookFileTracker {
        constructor(_instantiationService, _editorService, _notebookEditorModelService) {
            this._instantiationService = _instantiationService;
            this._editorService = _editorService;
            this._notebookEditorModelService = _notebookEditorModelService;
            this._dirtyListener = event_1.Event.debounce(this._notebookEditorModelService.onDidChangeDirty, (last, current) => !last ? [current] : [...last, current], 100)(this._openMissingDirtyNotebookEditors, this);
        }
        dispose() {
            this._dirtyListener.dispose();
        }
        _openMissingDirtyNotebookEditors(models) {
            const result = [];
            for (let model of models) {
                if (model.isDirty() && !this._editorService.isOpened({ resource: model.resource, typeId: notebookEditorInput_1.NotebookEditorInput.ID })) {
                    result.push({
                        editor: notebookEditorInput_1.NotebookEditorInput.create(this._instantiationService, model.resource, model.viewType),
                        options: { inactive: true, preserveFocus: true, pinned: true, override: editor_3.EditorOverride.DISABLED }
                    });
                }
            }
            if (result.length > 0) {
                this._editorService.openEditors(result);
            }
        }
    };
    NotebookFileTracker = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, editorService_1.IEditorService),
        __param(2, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], NotebookFileTracker);
    let NotebookWorkingCopyEditorHandler = class NotebookWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(_instantiationService, _workingCopyEditorService, _extensionService) {
            super();
            this._instantiationService = _instantiationService;
            this._workingCopyEditorService = _workingCopyEditorService;
            this._extensionService = _extensionService;
            this._installHandler();
        }
        async _installHandler() {
            await this._extensionService.whenInstalledExtensionsRegistered();
            this._register(this._workingCopyEditorService.registerHandler({
                handles: workingCopy => typeof this.getViewType(workingCopy) === 'string',
                isOpen: (workingCopy, editor) => editor instanceof notebookEditorInput_1.NotebookEditorInput && editor.viewType === this.getViewType(workingCopy),
                createEditor: workingCopy => notebookEditorInput_1.NotebookEditorInput.create(this._instantiationService, workingCopy.resource, this.getViewType(workingCopy))
            }));
        }
        getViewType(workingCopy) {
            if (workingCopy.typeId.startsWith(notebookCommon_1.NOTEBOOK_WORKING_COPY_TYPE_PREFIX)) {
                return workingCopy.typeId.substr(notebookCommon_1.NOTEBOOK_WORKING_COPY_TYPE_PREFIX.length);
            }
            return undefined;
        }
    };
    NotebookWorkingCopyEditorHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(2, extensions_2.IExtensionService)
    ], NotebookWorkingCopyEditorHandler);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookContribution, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellContentProvider, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(CellMetadataContentProvider, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(RegisterSchemasContribution, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookFileTracker, 2 /* Ready */);
    workbenchContributionsRegistry.registerWorkbenchContribution(NotebookWorkingCopyEditorHandler, 2 /* Ready */);
    (0, extensions_1.registerSingleton)(notebookService_1.INotebookService, notebookServiceImpl_1.NotebookService);
    (0, extensions_1.registerSingleton)(notebookWorkerService_1.INotebookEditorWorkerService, notebookWorkerServiceImpl_1.NotebookEditorWorkerServiceImpl);
    (0, extensions_1.registerSingleton)(notebookEditorModelResolverService_1.INotebookEditorModelResolverService, notebookEditorModelResolverServiceImpl_1.NotebookModelResolverServiceImpl, true);
    (0, extensions_1.registerSingleton)(notebookCellStatusBarService_1.INotebookCellStatusBarService, notebookCellStatusBarServiceImpl_1.NotebookCellStatusBarService, true);
    (0, extensions_1.registerSingleton)(notebookEditorService_1.INotebookEditorService, notebookEditorServiceImpl_1.NotebookEditorWidgetService, true);
    (0, extensions_1.registerSingleton)(notebookKernelService_1.INotebookKernelService, notebookKernelServiceImpl_1.NotebookKernelService, true);
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'notebook',
        order: 100,
        title: nls.localize(1, null),
        type: 'object',
        properties: {
            [notebookCommon_1.DisplayOrderKey]: {
                description: nls.localize(2, null),
                type: ['array'],
                items: {
                    type: 'string'
                },
                default: []
            },
            [notebookCommon_1.CellToolbarLocKey]: {
                description: nls.localize(3, null),
                type: 'object',
                additionalProperties: {
                    markdownDescription: nls.localize(4, null),
                    type: 'string',
                    enum: ['left', 'right', 'hidden']
                },
                default: {
                    'default': 'right'
                }
            },
            [notebookCommon_1.ShowCellStatusBarKey]: {
                description: nls.localize(5, null),
                type: 'boolean',
                default: true
            },
            [notebookCommon_1.NotebookTextDiffEditorPreview]: {
                description: nls.localize(6, null),
                type: 'boolean',
                default: true
            },
            [notebookCommon_1.ExperimentalUseMarkdownRenderer]: {
                description: nls.localize(7, null),
                type: 'boolean',
                default: true
            },
        }
    });
});
//# sourceMappingURL=notebook.contribution.js.map