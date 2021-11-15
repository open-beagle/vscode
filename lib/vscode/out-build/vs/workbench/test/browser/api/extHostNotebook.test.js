/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/test/browser/api/testRPCProtocol", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/test/common/mock", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostNotebook", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/uri", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostCommands", "vs/workbench/services/extensions/common/extensions", "vs/base/common/resources", "vs/base/common/uuid", "vs/base/common/event"], function (require, exports, assert, extHostDocumentsAndEditors_1, testRPCProtocol_1, lifecycle_1, log_1, mock_1, extHost_protocol_1, extHostNotebook_1, notebookCommon_1, uri_1, extHostDocuments_1, extHostCommands_1, extensions_1, resources_1, uuid_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookCell#Document', function () {
        let rpcProtocol;
        let notebook;
        let extHostDocumentsAndEditors;
        let extHostDocuments;
        let extHostNotebooks;
        const notebookUri = uri_1.URI.parse('test:///notebook.file');
        const disposables = new lifecycle_1.DisposableStore();
        teardown(function () {
            disposables.clear();
        });
        setup(async function () {
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, new class extends (0, mock_1.mock)() {
                $registerCommand() { }
            });
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadNotebook, new class extends (0, mock_1.mock)() {
                async $registerNotebookProvider() { }
                async $unregisterNotebookProvider() { }
            });
            extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(rpcProtocol, new log_1.NullLogService());
            extHostDocuments = new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors);
            const extHostStoragePaths = new class extends (0, mock_1.mock)() {
                workspaceValue() {
                    return uri_1.URI.from({ scheme: 'test', path: (0, uuid_1.generateUuid)() });
                }
            };
            extHostNotebooks = new extHostNotebook_1.ExtHostNotebookController(rpcProtocol, new extHostCommands_1.ExtHostCommands(rpcProtocol, new log_1.NullLogService()), extHostDocumentsAndEditors, extHostDocuments, new log_1.NullLogService(), extHostStoragePaths);
            let reg = extHostNotebooks.registerNotebookContentProvider(extensions_1.nullExtensionDescription, 'test', new class extends (0, mock_1.mock)() {
            });
            extHostNotebooks.$acceptDocumentAndEditorsDelta({
                addedDocuments: [{
                        uri: notebookUri,
                        viewType: 'test',
                        versionId: 0,
                        cells: [{
                                handle: 0,
                                uri: notebookCommon_1.CellUri.generate(notebookUri, 0),
                                source: ['### Heading'],
                                eol: '\n',
                                language: 'markdown',
                                cellKind: notebookCommon_1.CellKind.Markdown,
                                outputs: [],
                            }, {
                                handle: 1,
                                uri: notebookCommon_1.CellUri.generate(notebookUri, 1),
                                source: ['console.log("aaa")', 'console.log("bbb")'],
                                eol: '\n',
                                language: 'javascript',
                                cellKind: notebookCommon_1.CellKind.Code,
                                outputs: [],
                            }],
                    }],
                addedEditors: [{
                        documentUri: notebookUri,
                        id: '_notebook_editor_0',
                        selections: [{ start: 0, end: 1 }],
                        visibleRanges: []
                    }]
            });
            extHostNotebooks.$acceptDocumentAndEditorsDelta({ newActiveEditor: '_notebook_editor_0' });
            notebook = extHostNotebooks.notebookDocuments[0];
            disposables.add(reg);
            disposables.add(notebook);
            disposables.add(extHostDocuments);
        });
        test('cell document is vscode.TextDocument', async function () {
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const [c1, c2] = notebook.apiNotebook.getCells();
            const d1 = extHostDocuments.getDocument(c1.document.uri);
            assert.ok(d1);
            assert.strictEqual(d1.languageId, c1.document.languageId);
            assert.strictEqual(d1.version, 1);
            assert.ok(d1.notebook === notebook.apiNotebook);
            const d2 = extHostDocuments.getDocument(c2.document.uri);
            assert.ok(d2);
            assert.strictEqual(d2.languageId, c2.document.languageId);
            assert.strictEqual(d2.version, 1);
            assert.ok(d2.notebook === notebook.apiNotebook);
        });
        test('cell document goes when notebook closes', async function () {
            const cellUris = [];
            for (let cell of notebook.apiNotebook.getCells()) {
                assert.ok(extHostDocuments.getDocument(cell.document.uri));
                cellUris.push(cell.document.uri.toString());
            }
            const removedCellUris = [];
            const reg = extHostDocuments.onDidRemoveDocument(doc => {
                removedCellUris.push(doc.uri.toString());
            });
            extHostNotebooks.$acceptDocumentAndEditorsDelta({ removedDocuments: [notebook.uri] });
            reg.dispose();
            assert.strictEqual(removedCellUris.length, 2);
            assert.deepStrictEqual(removedCellUris.sort(), cellUris.sort());
        });
        test('cell document is vscode.TextDocument after changing it', async function () {
            const p = new Promise((resolve, reject) => {
                extHostNotebooks.onDidChangeNotebookCells(e => {
                    try {
                        assert.strictEqual(e.changes.length, 1);
                        assert.strictEqual(e.changes[0].items.length, 2);
                        const [first, second] = e.changes[0].items;
                        const doc1 = extHostDocuments.getAllDocumentData().find(data => (0, resources_1.isEqual)(data.document.uri, first.document.uri));
                        assert.ok(doc1);
                        assert.strictEqual((doc1 === null || doc1 === void 0 ? void 0 : doc1.document) === first.document, true);
                        const doc2 = extHostDocuments.getAllDocumentData().find(data => (0, resources_1.isEqual)(data.document.uri, second.document.uri));
                        assert.ok(doc2);
                        assert.strictEqual((doc2 === null || doc2 === void 0 ? void 0 : doc2.document) === second.document, true);
                        resolve();
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            });
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 2),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 3,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 3),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            await p;
        });
        test('cell document stays open when notebook is still open', async function () {
            const docs = [];
            const addData = [];
            for (let cell of notebook.apiNotebook.getCells()) {
                const doc = extHostDocuments.getDocument(cell.document.uri);
                assert.ok(doc);
                assert.strictEqual(extHostDocuments.getDocument(cell.document.uri).isClosed, false);
                docs.push(doc);
                addData.push({
                    EOL: '\n',
                    isDirty: doc.isDirty,
                    lines: doc.getText().split('\n'),
                    modeId: doc.languageId,
                    uri: doc.uri,
                    versionId: doc.version
                });
            }
            // this call happens when opening a document on the main side
            extHostDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ addedDocuments: addData });
            // this call happens when closing a document from the main side
            extHostDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ removedDocuments: docs.map(d => d.uri) });
            // notebook is still open -> cell documents stay open
            for (let cell of notebook.apiNotebook.getCells()) {
                assert.ok(extHostDocuments.getDocument(cell.document.uri));
                assert.strictEqual(extHostDocuments.getDocument(cell.document.uri).isClosed, false);
            }
            // close notebook -> docs are closed
            extHostNotebooks.$acceptDocumentAndEditorsDelta({ removedDocuments: [notebook.uri] });
            for (let cell of notebook.apiNotebook.getCells()) {
                assert.throws(() => extHostDocuments.getDocument(cell.document.uri));
            }
            for (let doc of docs) {
                assert.strictEqual(doc.isClosed, true);
            }
        });
        test('cell document goes when cell is removed', async function () {
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const [cell1, cell2] = notebook.apiNotebook.getCells();
            extHostNotebooks.$acceptModelChanged(notebook.uri, {
                versionId: 2,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 1, []]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1);
            assert.strictEqual(cell1.document.isClosed, true); // ref still alive!
            assert.strictEqual(cell2.document.isClosed, false);
            assert.throws(() => extHostDocuments.getDocument(cell1.document.uri));
        });
        test('cell document knows notebook', function () {
            for (let cells of notebook.apiNotebook.getCells()) {
                assert.strictEqual(cells.document.notebook === notebook.apiNotebook, true);
            }
        });
        test('cell#index', function () {
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const [first, second] = notebook.apiNotebook.getCells();
            assert.strictEqual(first.index, 0);
            assert.strictEqual(second.index, 1);
            // remove first cell
            extHostNotebooks.$acceptModelChanged(notebook.uri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 1, []]]
                    }]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1);
            assert.strictEqual(second.index, 0);
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 2),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 3,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 3),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 3);
            assert.strictEqual(second.index, 2);
        });
        test('ERR MISSING extHostDocument for notebook cell: #116711', async function () {
            const p = event_1.Event.toPromise(extHostNotebooks.onDidChangeNotebookCells);
            // DON'T call this, make sure the cell-documents have not been created yet
            // assert.strictEqual(notebook.notebookDocument.cellCount, 2);
            extHostNotebooks.$acceptModelChanged(notebook.uri, {
                versionId: 100,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 2, [{
                                        handle: 3,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 3),
                                        source: ['### Heading'],
                                        eol: '\n',
                                        language: 'markdown',
                                        cellKind: notebookCommon_1.CellKind.Markdown,
                                        outputs: [],
                                    }, {
                                        handle: 4,
                                        uri: notebookCommon_1.CellUri.generate(notebookUri, 4),
                                        source: ['console.log("aaa")', 'console.log("bbb")'],
                                        eol: '\n',
                                        language: 'javascript',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 2);
            const event = await p;
            assert.strictEqual(event.document === notebook.apiNotebook, true);
            assert.strictEqual(event.changes.length, 1);
            assert.strictEqual(event.changes[0].deletedCount, 2);
            assert.strictEqual(event.changes[0].deletedItems[0].document.isClosed, true);
            assert.strictEqual(event.changes[0].deletedItems[1].document.isClosed, true);
            assert.strictEqual(event.changes[0].items.length, 2);
            assert.strictEqual(event.changes[0].items[0].document.isClosed, false);
            assert.strictEqual(event.changes[0].items[1].document.isClosed, false);
        });
        test('Opening a notebook results in VS Code firing the event onDidChangeActiveNotebookEditor twice #118470', function () {
            let count = 0;
            extHostNotebooks.onDidChangeActiveNotebookEditor(() => count += 1);
            extHostNotebooks.$acceptDocumentAndEditorsDelta({
                addedEditors: [{
                        documentUri: notebookUri,
                        id: '_notebook_editor_2',
                        selections: [{ start: 0, end: 1 }],
                        visibleRanges: []
                    }]
            });
            extHostNotebooks.$acceptDocumentAndEditorsDelta({
                newActiveEditor: '_notebook_editor_2'
            });
            assert.strictEqual(count, 1);
        });
        test('unset active notebook editor', function () {
            const editor = extHostNotebooks.activeNotebookEditor;
            assert.ok(editor !== undefined);
            extHostNotebooks.$acceptDocumentAndEditorsDelta({ newActiveEditor: undefined });
            assert.ok(extHostNotebooks.activeNotebookEditor === editor);
            extHostNotebooks.$acceptDocumentAndEditorsDelta({});
            assert.ok(extHostNotebooks.activeNotebookEditor === editor);
            extHostNotebooks.$acceptDocumentAndEditorsDelta({ newActiveEditor: null });
            assert.ok(extHostNotebooks.activeNotebookEditor === undefined);
        });
        test('change cell language triggers onDidChange events', async function () {
            const first = notebook.apiNotebook.cellAt(0);
            assert.strictEqual(first.document.languageId, 'markdown');
            const removed = event_1.Event.toPromise(extHostDocuments.onDidRemoveDocument);
            const added = event_1.Event.toPromise(extHostDocuments.onDidAddDocument);
            extHostNotebooks.$acceptModelChanged(notebook.uri, {
                versionId: 12, rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ChangeLanguage,
                        index: 0,
                        language: 'fooLang'
                    }]
            }, false);
            const removedDoc = await removed;
            const addedDoc = await added;
            assert.strictEqual(first.document.languageId, 'fooLang');
            assert.ok(removedDoc === addedDoc);
        });
        test('change cell execution state does not trigger onDidChangeMetadata event', async function () {
            var _a;
            let didFireOnDidChangeMetadata = false;
            let e = extHostNotebooks.onDidChangeCellMetadata(() => {
                didFireOnDidChangeMetadata = true;
            });
            const changeExeState = event_1.Event.toPromise(extHostNotebooks.onDidChangeNotebookCellExecutionState);
            extHostNotebooks.$acceptModelChanged(notebook.uri, {
                versionId: 12, rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata,
                        index: 0,
                        metadata: Object.assign(Object.assign({}, (_a = notebook.getCellFromIndex(0)) === null || _a === void 0 ? void 0 : _a.internalMetadata), {
                            runState: notebookCommon_1.NotebookCellExecutionState.Executing
                        })
                    }]
            }, false);
            await changeExeState;
            assert.strictEqual(didFireOnDidChangeMetadata, false);
            e.dispose();
        });
    });
});
//# sourceMappingURL=extHostNotebook.test.js.map