/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "sinon", "vs/base/common/uri", "vs/base/test/common/utils", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/notebook/browser/notebookEditorKernelManager", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/testNotebookEditor", "vs/base/common/event", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/notebookKernelServiceImpl", "vs/workbench/contrib/notebook/common/notebookService", "vs/base/test/common/mock", "vs/base/common/lifecycle"], function (require, exports, assert, sinon, uri_1, utils_1, extensions_1, notebookEditorKernelManager_1, notebookCommon_1, testNotebookEditor_1, event_1, notebookKernelService_1, notebookKernelServiceImpl_1, notebookService_1, mock_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookEditorKernelManager', () => {
        let instantiationService;
        let kernelService;
        const dispoables = new lifecycle_1.DisposableStore();
        setup(function () {
            dispoables.clear();
            instantiationService = (0, testNotebookEditor_1.setupInstantiationService)();
            instantiationService.stub(notebookService_1.INotebookService, new class extends (0, mock_1.mock)() {
                constructor() {
                    super(...arguments);
                    this.onDidAddNotebookDocument = event_1.Event.None;
                    this.onDidRemoveNotebookDocument = event_1.Event.None;
                }
                getNotebookTextModels() { return []; }
            });
            kernelService = instantiationService.createInstance(notebookKernelServiceImpl_1.NotebookKernelService);
            instantiationService.set(notebookKernelService_1.INotebookKernelService, kernelService);
        });
        async function withTestNotebook(cells, callback) {
            return (0, testNotebookEditor_1.withTestNotebook)(cells, (editor) => callback(editor.viewModel, editor.viewModel.notebookDocument));
        }
        // test('ctor', () => {
        // 	instantiationService.createInstance(NotebookEditorKernelManager, { activeKernel: undefined, viewModel: undefined });
        // 	const contextKeyService = instantiationService.get(IContextKeyService);
        // 	assert.strictEqual(contextKeyService.getContextKeyValue(NOTEBOOK_KERNEL_COUNT.key), 0);
        // });
        test('cell is not runnable when no kernel is selected', async () => {
            await withTestNotebook([], async (viewModel) => {
                const kernelManager = instantiationService.createInstance(notebookEditorKernelManager_1.NotebookEditorKernelManager);
                const cell = viewModel.createCell(1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                await (0, utils_1.assertThrowsAsync)(async () => await kernelManager.executeNotebookCell(cell));
            });
        });
        test('cell is not runnable when kernel does not support the language', async () => {
            await withTestNotebook([], async (viewModel) => {
                kernelService.registerKernel(new TestNotebookKernel({ languages: ['testlang'] }));
                const kernelManager = instantiationService.createInstance(notebookEditorKernelManager_1.NotebookEditorKernelManager);
                const cell = viewModel.createCell(1, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                await (0, utils_1.assertThrowsAsync)(async () => await kernelManager.executeNotebookCell(cell));
            });
        });
        test('cell is runnable when kernel does support the language', async () => {
            await withTestNotebook([], async (viewModel) => {
                const kernel = new TestNotebookKernel({ languages: ['javascript'] });
                kernelService.registerKernel(kernel);
                const kernelManager = instantiationService.createInstance(notebookEditorKernelManager_1.NotebookEditorKernelManager);
                const executeSpy = sinon.spy();
                kernel.executeNotebookCellsRequest = executeSpy;
                const cell = viewModel.createCell(0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                await kernelManager.executeNotebookCells(viewModel.notebookDocument, [cell]);
                assert.strictEqual(executeSpy.calledOnce, true);
            });
        });
        test('select kernel when running cell', async function () {
            // https://github.com/microsoft/vscode/issues/121904
            return withTestNotebook([], async (viewModel) => {
                assert.strictEqual(kernelService.getMatchingKernel(viewModel.notebookDocument).all.length, 0);
                let didExecute = false;
                const kernel = new class extends TestNotebookKernel {
                    constructor() {
                        super({ languages: ['javascript'] });
                        this.id = 'mySpecialId';
                    }
                    async executeNotebookCellsRequest() {
                        didExecute = true;
                        return;
                    }
                };
                kernelService.registerKernel(kernel);
                const kernelManager = instantiationService.createInstance(notebookEditorKernelManager_1.NotebookEditorKernelManager);
                let event;
                kernelService.onDidChangeNotebookKernelBinding(e => event = e);
                const cell = viewModel.createCell(0, 'var c = 3', 'javascript', notebookCommon_1.CellKind.Code, {}, [], true);
                await kernelManager.executeNotebookCells(viewModel.notebookDocument, [cell]);
                assert.strictEqual(didExecute, true);
                assert.ok(event !== undefined);
                assert.strictEqual(event.newKernel, kernel.id);
                assert.strictEqual(event.oldKernel, undefined);
            });
        });
    });
    class TestNotebookKernel {
        constructor(opts) {
            var _a;
            this.id = 'test';
            this.label = '';
            this.viewType = '*';
            this.onDidChange = event_1.Event.None;
            this.extension = new extensions_1.ExtensionIdentifier('test');
            this.localResourceRoot = uri_1.URI.file('/test');
            this.preloadUris = [];
            this.preloadProvides = [];
            this.supportedLanguages = [];
            this.supportedLanguages = (_a = opts === null || opts === void 0 ? void 0 : opts.languages) !== null && _a !== void 0 ? _a : ['text/plain'];
        }
        executeNotebookCellsRequest() {
            throw new Error('Method not implemented.');
        }
        cancelNotebookCellExecution() {
            throw new Error('Method not implemented.');
        }
    }
});
//# sourceMappingURL=notebookEditorKernelManager.test.js.map