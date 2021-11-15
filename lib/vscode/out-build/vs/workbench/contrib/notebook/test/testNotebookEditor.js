/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/uri", "vs/editor/common/services/resolverService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/list/browser/listService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModel", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/editor/common/services/modelService", "vs/editor/common/services/modelServiceImpl", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/base/test/common/mock", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/browser/clipboardService", "vs/editor/common/services/modeService", "vs/editor/common/services/modeServiceImpl", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/workbench/test/common/workbenchTestServices", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/workspaces/test/common/testWorkspaceTrustService"], function (require, exports, DOM, errors_1, event_1, uri_1, resolverService_1, contextKeyService_1, contextkey_1, instantiationServiceMock_1, listService_1, undoRedo_1, editor_1, eventDispatcher_1, notebookViewModel_1, notebookCellTextModel_1, notebookTextModel_1, notebookCommon_1, textModelResolverService_1, modelService_1, modelServiceImpl_1, undoRedoService_1, configuration_1, testConfigurationService_1, themeService_1, testThemeService_1, notebookCellList_1, notebookEditorWidget_1, mock_1, clipboardService_1, clipboardService_2, modeService_1, modeServiceImpl_1, log_1, storage_1, workbenchTestServices_1, workspaceTrust_1, testWorkspaceTrustService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createNotebookCellList = exports.withTestNotebook = exports.withTestNotebookDiffModel = exports.createTestNotebookEditor = exports.setupInstantiationService = exports.NotebookEditorTestModel = exports.TestCell = void 0;
    class TestCell extends notebookCellTextModel_1.NotebookCellTextModel {
        constructor(viewType, handle, source, language, cellKind, outputs, modeService) {
            super(notebookCommon_1.CellUri.generate(uri_1.URI.parse('test:///fake/notebook'), handle), handle, source, language, cellKind, outputs, undefined, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false }, modeService);
            this.viewType = viewType;
            this.source = source;
        }
    }
    exports.TestCell = TestCell;
    class NotebookEditorTestModel extends editor_1.EditorModel {
        constructor(_notebook) {
            super();
            this._notebook = _notebook;
            this._dirty = false;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            if (_notebook && _notebook.onDidChangeContent) {
                this._register(_notebook.onDidChangeContent(() => {
                    this._dirty = true;
                    this._onDidChangeDirty.fire();
                    this._onDidChangeContent.fire();
                }));
            }
        }
        get viewType() {
            return this._notebook.viewType;
        }
        get resource() {
            return this._notebook.uri;
        }
        get notebook() {
            return this._notebook;
        }
        isReadonly() {
            return false;
        }
        isDirty() {
            return this._dirty;
        }
        getNotebook() {
            return this._notebook;
        }
        async load() {
            return this;
        }
        async save() {
            if (this._notebook) {
                this._dirty = false;
                this._onDidChangeDirty.fire();
                this._onDidSave.fire();
                // todo, flush all states
                return true;
            }
            return false;
        }
        saveAs() {
            throw new errors_1.NotImplementedError();
        }
        revert() {
            throw new errors_1.NotImplementedError();
        }
    }
    exports.NotebookEditorTestModel = NotebookEditorTestModel;
    function setupInstantiationService() {
        const instantiationService = new instantiationServiceMock_1.TestInstantiationService();
        instantiationService.stub(modeService_1.IModeService, new modeServiceImpl_1.ModeServiceImpl());
        instantiationService.stub(undoRedo_1.IUndoRedoService, instantiationService.createInstance(undoRedoService_1.UndoRedoService));
        instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
        instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        instantiationService.stub(modelService_1.IModelService, instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl));
        instantiationService.stub(resolverService_1.ITextModelService, instantiationService.createInstance(textModelResolverService_1.TextModelResolverService));
        instantiationService.stub(contextkey_1.IContextKeyService, instantiationService.createInstance(contextKeyService_1.ContextKeyService));
        instantiationService.stub(listService_1.IListService, instantiationService.createInstance(listService_1.ListService));
        instantiationService.stub(clipboardService_1.IClipboardService, new clipboardService_2.BrowserClipboardService());
        instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        instantiationService.stub(storage_1.IStorageService, new workbenchTestServices_1.TestStorageService());
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustRequestService, new testWorkspaceTrustService_1.TestWorkspaceTrustRequestService(true));
        return instantiationService;
    }
    exports.setupInstantiationService = setupInstantiationService;
    function _createTestNotebookEditor(instantiationService, cells) {
        const viewType = 'notebook';
        const notebook = instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, viewType, uri_1.URI.parse('test'), cells.map(cell => {
            var _a;
            return {
                source: cell[0],
                language: cell[1],
                cellKind: cell[2],
                outputs: (_a = cell[3]) !== null && _a !== void 0 ? _a : [],
                metadata: cell[4]
            };
        }), notebookCommon_1.notebookDocumentMetadataDefaults, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false });
        const model = new NotebookEditorTestModel(notebook);
        const eventDispatcher = new eventDispatcher_1.NotebookEventDispatcher();
        const viewModel = instantiationService.createInstance(notebookViewModel_1.NotebookViewModel, viewType, model.notebook, eventDispatcher, null);
        const cellList = createNotebookCellList(instantiationService);
        cellList.attachViewModel(viewModel);
        const listViewInfoAccessor = new notebookEditorWidget_1.ListViewInfoAccessor(cellList);
        const notebookEditor = new class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.onDidChangeModel = new event_1.Emitter().event;
            }
            dispose() {
                viewModel.dispose();
            }
            get viewModel() { return viewModel; }
            hasModel() {
                return !!this.viewModel;
            }
            getFocus() { return viewModel.getFocus(); }
            getSelections() { return viewModel.getSelections(); }
            getViewIndex(cell) { return listViewInfoAccessor.getViewIndex(cell); }
            getCellRangeFromViewRange(startIndex, endIndex) { return listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex); }
            revealCellRangeInView() { }
            setHiddenAreas(_ranges) {
                return cellList.setHiddenAreas(_ranges, true);
            }
            getActiveCell() {
                const elements = cellList.getFocusedElements();
                if (elements && elements.length) {
                    return elements[0];
                }
                return undefined;
            }
            hasOutputTextSelection() {
                return false;
            }
        };
        return notebookEditor;
    }
    function createTestNotebookEditor(cells) {
        return _createTestNotebookEditor(setupInstantiationService(), cells);
    }
    exports.createTestNotebookEditor = createTestNotebookEditor;
    async function withTestNotebookDiffModel(originalCells, modifiedCells, callback) {
        const instantiationService = setupInstantiationService();
        const originalNotebook = createTestNotebookEditor(originalCells);
        const modifiedNotebook = createTestNotebookEditor(modifiedCells);
        const originalResource = new class extends (0, mock_1.mock)() {
            get notebook() {
                return originalNotebook.viewModel.notebookDocument;
            }
        };
        const modifiedResource = new class extends (0, mock_1.mock)() {
            get notebook() {
                return modifiedNotebook.viewModel.notebookDocument;
            }
        };
        const model = new class extends (0, mock_1.mock)() {
            get original() {
                return originalResource;
            }
            get modified() {
                return modifiedResource;
            }
        };
        const res = await callback(model, instantiationService);
        if (res instanceof Promise) {
            res.finally(() => {
                originalNotebook.dispose();
                modifiedNotebook.dispose();
            });
        }
        else {
            originalNotebook.dispose();
            modifiedNotebook.dispose();
        }
        return res;
    }
    exports.withTestNotebookDiffModel = withTestNotebookDiffModel;
    async function withTestNotebook(cells, callback) {
        const instantiationService = setupInstantiationService();
        const notebookEditor = _createTestNotebookEditor(instantiationService, cells);
        const res = await callback(notebookEditor, instantiationService);
        if (res instanceof Promise) {
            res.finally(() => notebookEditor.dispose());
        }
        else {
            notebookEditor.dispose();
        }
        return res;
    }
    exports.withTestNotebook = withTestNotebook;
    function createNotebookCellList(instantiationService) {
        const delegate = {
            getHeight(element) { return element.getHeight(17); },
            getTemplateId() { return 'template'; }
        };
        const renderer = {
            templateId: 'template',
            renderTemplate() { },
            renderElement() { },
            disposeTemplate() { }
        };
        const cellList = instantiationService.createInstance(notebookCellList_1.NotebookCellList, 'NotebookCellList', DOM.$('container'), DOM.$('body'), delegate, [renderer], instantiationService.get(contextkey_1.IContextKeyService), {
            supportDynamicHeights: true,
            multipleSelectionSupport: true,
            enableKeyboardNavigation: true,
            focusNextPreviousDelegate: {
                onFocusNext: (applyFocusNext) => { applyFocusNext(); },
                onFocusPrevious: (applyFocusPrevious) => { applyFocusPrevious(); },
            }
        });
        return cellList;
    }
    exports.createNotebookCellList = createNotebookCellList;
});
//# sourceMappingURL=testNotebookEditor.js.map