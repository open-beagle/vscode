/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/api/testRPCProtocol", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/platform/log/common/log", "vs/workbench/api/common/extHostNotebookConcatDocument", "vs/workbench/api/common/extHostNotebook", "vs/base/common/uri", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostCommands", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/api/common/extHost.protocol", "vs/base/common/lifecycle", "vs/base/common/uuid"], function (require, exports, assert, testRPCProtocol_1, extHostDocuments_1, extHostDocumentsAndEditors_1, log_1, extHostNotebookConcatDocument_1, extHostNotebook_1, uri_1, notebookCommon_1, extHostTypes_1, extHostCommands_1, extensions_1, workbenchTestServices_1, extHost_protocol_1, lifecycle_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookConcatDocument', function () {
        let rpcProtocol;
        let notebook;
        let extHostDocumentsAndEditors;
        let extHostDocuments;
        let extHostNotebooks;
        const notebookUri = uri_1.URI.parse('test:///notebook.file');
        const disposables = new lifecycle_1.DisposableStore();
        setup(async function () {
            disposables.clear();
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, new class extends (0, workbenchTestServices_1.mock)() {
                $registerCommand() { }
            });
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadNotebook, new class extends (0, workbenchTestServices_1.mock)() {
                async $registerNotebookProvider() { }
                async $unregisterNotebookProvider() { }
            });
            extHostDocumentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors(rpcProtocol, new log_1.NullLogService());
            extHostDocuments = new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors);
            const extHostStoragePaths = new class extends (0, workbenchTestServices_1.mock)() {
                workspaceValue() {
                    return uri_1.URI.from({ scheme: 'test', path: (0, uuid_1.generateUuid)() });
                }
            };
            extHostNotebooks = new extHostNotebook_1.ExtHostNotebookController(rpcProtocol, new extHostCommands_1.ExtHostCommands(rpcProtocol, new log_1.NullLogService()), extHostDocumentsAndEditors, extHostDocuments, new log_1.NullLogService(), extHostStoragePaths);
            let reg = extHostNotebooks.registerNotebookContentProvider(extensions_1.nullExtensionDescription, 'test', new class extends (0, workbenchTestServices_1.mock)() {
            });
            extHostNotebooks.$acceptDocumentAndEditorsDelta({
                addedDocuments: [{
                        uri: notebookUri,
                        viewType: 'test',
                        cells: [{
                                handle: 0,
                                uri: notebookCommon_1.CellUri.generate(notebookUri, 0),
                                source: ['### Heading'],
                                eol: '\n',
                                language: 'markdown',
                                cellKind: notebookCommon_1.CellKind.Markdown,
                                outputs: [],
                            }],
                        versionId: 0
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
        test('empty', function () {
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            assert.strictEqual(doc.getText(), '');
            assert.strictEqual(doc.version, 0);
            // assert.strictEqual(doc.locationAt(new Position(0, 0)), undefined);
            // assert.strictEqual(doc.positionAt(SOME_FAKE_LOCATION?), undefined);
        });
        function assertLocation(doc, pos, expected, reverse = true) {
            const actual = doc.locationAt(pos);
            assert.strictEqual(actual.uri.toString(), expected.uri.toString());
            assert.strictEqual(actual.range.isEqual(expected.range), true);
            if (reverse) {
                // reverse - offset
                const offset = doc.offsetAt(pos);
                assert.strictEqual(doc.positionAt(offset).isEqual(pos), true);
                // reverse - pos
                const actualPosition = doc.positionAt(actual);
                assert.strictEqual(actualPosition.isEqual(pos), true);
            }
        }
        function assertLines(doc, ...lines) {
            let actual = doc.getText().split(/\r\n|\n|\r/);
            assert.deepStrictEqual(actual, lines);
        }
        test('contains', function () {
            const cellUri1 = notebookCommon_1.CellUri.generate(notebook.uri, 1);
            const cellUri2 = notebookCommon_1.CellUri.generate(notebook.uri, 2);
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [{
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: cellUri1,
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: cellUri2,
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]
                        ]
                    }]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2); // markdown and code
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            assert.strictEqual(doc.contains(cellUri1), true);
            assert.strictEqual(doc.contains(cellUri2), true);
            assert.strictEqual(doc.contains(uri_1.URI.parse('some://miss/path')), false);
        });
        test('location, position mapping', function () {
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2); // markdown and code
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            assertLines(doc, 'Hello', 'World', 'Hello World!', 'Hallo', 'Welt', 'Hallo Welt!');
            assertLocation(doc, new extHostTypes_1.Position(0, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(0, 0)));
            assertLocation(doc, new extHostTypes_1.Position(4, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(1, 0)));
            assertLocation(doc, new extHostTypes_1.Position(4, 3), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(1, 3)));
            assertLocation(doc, new extHostTypes_1.Position(5, 11), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(2, 11)));
            assertLocation(doc, new extHostTypes_1.Position(5, 12), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(2, 11)), false); // don't check identity because position will be clamped
        });
        test('location, position mapping, cell changes', function () {
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            // UPDATE 1
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 1);
            assert.strictEqual(doc.version, 1);
            assertLines(doc, 'Hello', 'World', 'Hello World!');
            assertLocation(doc, new extHostTypes_1.Position(0, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(0, 0)));
            assertLocation(doc, new extHostTypes_1.Position(2, 2), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(2, 2)));
            assertLocation(doc, new extHostTypes_1.Position(4, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(2, 12)), false); // clamped
            // UPDATE 2
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[1, 0, [{
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2);
            assert.strictEqual(doc.version, 2);
            assertLines(doc, 'Hello', 'World', 'Hello World!', 'Hallo', 'Welt', 'Hallo Welt!');
            assertLocation(doc, new extHostTypes_1.Position(0, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(0, 0)));
            assertLocation(doc, new extHostTypes_1.Position(4, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(1, 0)));
            assertLocation(doc, new extHostTypes_1.Position(4, 3), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(1, 3)));
            assertLocation(doc, new extHostTypes_1.Position(5, 11), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(2, 11)));
            assertLocation(doc, new extHostTypes_1.Position(5, 12), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(2, 11)), false); // don't check identity because position will be clamped
            // UPDATE 3 (remove cell #2 again)
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[1, 1, []]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 1);
            assert.strictEqual(doc.version, 3);
            assertLines(doc, 'Hello', 'World', 'Hello World!');
            assertLocation(doc, new extHostTypes_1.Position(0, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(0, 0)));
            assertLocation(doc, new extHostTypes_1.Position(2, 2), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(2, 2)));
            assertLocation(doc, new extHostTypes_1.Position(4, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(2, 12)), false); // clamped
        });
        test('location, position mapping, cell-document changes', function () {
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            // UPDATE 1
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2);
            assert.strictEqual(doc.version, 1);
            assertLines(doc, 'Hello', 'World', 'Hello World!', 'Hallo', 'Welt', 'Hallo Welt!');
            assertLocation(doc, new extHostTypes_1.Position(0, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(0, 0)));
            assertLocation(doc, new extHostTypes_1.Position(2, 2), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(2, 2)));
            assertLocation(doc, new extHostTypes_1.Position(2, 12), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(2, 12)));
            assertLocation(doc, new extHostTypes_1.Position(4, 0), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(1, 0)));
            assertLocation(doc, new extHostTypes_1.Position(4, 3), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(1).document.uri, new extHostTypes_1.Position(1, 3)));
            // offset math
            let cell1End = doc.offsetAt(new extHostTypes_1.Position(2, 12));
            assert.strictEqual(doc.positionAt(cell1End).isEqual(new extHostTypes_1.Position(2, 12)), true);
            extHostDocuments.$acceptModelChanged(notebook.apiNotebook.cellAt(0).document.uri, {
                versionId: 0,
                eol: '\n',
                changes: [{
                        range: { startLineNumber: 3, startColumn: 1, endLineNumber: 3, endColumn: 6 },
                        rangeLength: 6,
                        rangeOffset: 12,
                        text: 'Hi'
                    }]
            }, false);
            assertLines(doc, 'Hello', 'World', 'Hi World!', 'Hallo', 'Welt', 'Hallo Welt!');
            assertLocation(doc, new extHostTypes_1.Position(2, 12), new extHostTypes_1.Location(notebook.apiNotebook.cellAt(0).document.uri, new extHostTypes_1.Position(2, 9)), false);
            assert.strictEqual(doc.positionAt(cell1End).isEqual(new extHostTypes_1.Position(3, 2)), true);
        });
        test('selector', function () {
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['fooLang-document'],
                                        eol: '\n',
                                        language: 'fooLang',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['barLang-document'],
                                        eol: '\n',
                                        language: 'barLang',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            const mixedDoc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            const fooLangDoc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, 'fooLang');
            const barLangDoc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, 'barLang');
            assertLines(mixedDoc, 'fooLang-document', 'barLang-document');
            assertLines(fooLangDoc, 'fooLang-document');
            assertLines(barLangDoc, 'barLang-document');
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[2, 0, [{
                                        handle: 3,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 3),
                                        source: ['barLang-document2'],
                                        eol: '\n',
                                        language: 'barLang',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assertLines(mixedDoc, 'fooLang-document', 'barLang-document', 'barLang-document2');
            assertLines(fooLangDoc, 'fooLang-document');
            assertLines(barLangDoc, 'barLang-document', 'barLang-document2');
        });
        function assertOffsetAtPosition(doc, offset, expected, reverse = true) {
            const actual = doc.positionAt(offset);
            assert.strictEqual(actual.line, expected.line);
            assert.strictEqual(actual.character, expected.character);
            if (reverse) {
                const actualOffset = doc.offsetAt(actual);
                assert.strictEqual(actualOffset, offset);
            }
        }
        test('offsetAt(position) <-> positionAt(offset)', function () {
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2); // markdown and code
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            assertLines(doc, 'Hello', 'World', 'Hello World!', 'Hallo', 'Welt', 'Hallo Welt!');
            assertOffsetAtPosition(doc, 0, { line: 0, character: 0 });
            assertOffsetAtPosition(doc, 1, { line: 0, character: 1 });
            assertOffsetAtPosition(doc, 9, { line: 1, character: 3 });
            assertOffsetAtPosition(doc, 32, { line: 4, character: 1 });
            assertOffsetAtPosition(doc, 47, { line: 5, character: 11 });
        });
        function assertLocationAtPosition(doc, pos, expected, reverse = true) {
            const actual = doc.locationAt(new extHostTypes_1.Position(pos.line, pos.character));
            assert.strictEqual(actual.uri.toString(), expected.uri.toString());
            assert.strictEqual(actual.range.start.line, expected.line);
            assert.strictEqual(actual.range.end.line, expected.line);
            assert.strictEqual(actual.range.start.character, expected.character);
            assert.strictEqual(actual.range.end.character, expected.character);
            if (reverse) {
                const actualPos = doc.positionAt(actual);
                assert.strictEqual(actualPos.line, pos.line);
                assert.strictEqual(actualPos.character, pos.character);
            }
        }
        test('locationAt(position) <-> positionAt(location)', function () {
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2); // markdown and code
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            assertLines(doc, 'Hello', 'World', 'Hello World!', 'Hallo', 'Welt', 'Hallo Welt!');
            assertLocationAtPosition(doc, { line: 0, character: 0 }, { uri: notebook.apiNotebook.cellAt(0).document.uri, line: 0, character: 0 });
            assertLocationAtPosition(doc, { line: 2, character: 0 }, { uri: notebook.apiNotebook.cellAt(0).document.uri, line: 2, character: 0 });
            assertLocationAtPosition(doc, { line: 2, character: 12 }, { uri: notebook.apiNotebook.cellAt(0).document.uri, line: 2, character: 12 });
            assertLocationAtPosition(doc, { line: 3, character: 0 }, { uri: notebook.apiNotebook.cellAt(1).document.uri, line: 0, character: 0 });
            assertLocationAtPosition(doc, { line: 5, character: 0 }, { uri: notebook.apiNotebook.cellAt(1).document.uri, line: 2, character: 0 });
            assertLocationAtPosition(doc, { line: 5, character: 11 }, { uri: notebook.apiNotebook.cellAt(1).document.uri, line: 2, character: 11 });
        });
        test('getText(range)', function () {
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2); // markdown and code
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            assertLines(doc, 'Hello', 'World', 'Hello World!', 'Hallo', 'Welt', 'Hallo Welt!');
            assert.strictEqual(doc.getText(new extHostTypes_1.Range(0, 0, 0, 0)), '');
            assert.strictEqual(doc.getText(new extHostTypes_1.Range(0, 0, 1, 0)), 'Hello\n');
            assert.strictEqual(doc.getText(new extHostTypes_1.Range(2, 0, 4, 0)), 'Hello World!\nHallo\n');
        });
        test('validateRange/Position', function () {
            extHostNotebooks.$acceptModelChanged(notebookUri, {
                versionId: notebook.apiNotebook.version + 1,
                rawEvents: [
                    {
                        kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                        changes: [[0, 0, [{
                                        handle: 1,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 1),
                                        source: ['Hello', 'World', 'Hello World!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }, {
                                        handle: 2,
                                        uri: notebookCommon_1.CellUri.generate(notebook.uri, 2),
                                        source: ['Hallo', 'Welt', 'Hallo Welt!'],
                                        eol: '\n',
                                        language: 'test',
                                        cellKind: notebookCommon_1.CellKind.Code,
                                        outputs: [],
                                    }]]]
                    }
                ]
            }, false);
            assert.strictEqual(notebook.apiNotebook.cellCount, 1 + 2); // markdown and code
            let doc = new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebooks, extHostDocuments, notebook.apiNotebook, undefined);
            assertLines(doc, 'Hello', 'World', 'Hello World!', 'Hallo', 'Welt', 'Hallo Welt!');
            function assertPosition(actual, expectedLine, expectedCh) {
                assert.strictEqual(actual.line, expectedLine);
                assert.strictEqual(actual.character, expectedCh);
            }
            // "fixed"
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(0, 1000)), 0, 5);
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(2, 1000)), 2, 12);
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(5, 1000)), 5, 11);
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(5000, 1000)), 5, 11);
            // "good"
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(0, 1)), 0, 1);
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(0, 5)), 0, 5);
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(2, 8)), 2, 8);
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(2, 12)), 2, 12);
            assertPosition(doc.validatePosition(new extHostTypes_1.Position(5, 11)), 5, 11);
        });
    });
});
//# sourceMappingURL=extHostNotebookConcatDocument.test.js.map