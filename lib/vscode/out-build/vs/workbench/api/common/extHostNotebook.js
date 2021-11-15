/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/idGenerator", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/workbench/api/common/cache", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/notebook/common/notebookCommon", "./extHostNotebookDocument", "./extHostNotebookEditor"], function (require, exports, async_1, buffer_1, cancellation_1, event_1, hash_1, idGenerator_1, lifecycle_1, map_1, strings_1, types_1, uri_1, cache_1, extHost_protocol_1, typeConverters, extHostTypes, notebookCommon_1, extHostNotebookDocument_1, extHostNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookController = exports.NotebookEditorDecorationType = void 0;
    class NotebookEditorDecorationType {
        constructor(proxy, options) {
            const key = NotebookEditorDecorationType._Keys.nextId();
            proxy.$registerNotebookEditorDecorationType(key, typeConverters.NotebookDecorationRenderOptions.from(options));
            this.value = {
                key,
                dispose() {
                    proxy.$removeNotebookEditorDecorationType(key);
                }
            };
        }
    }
    exports.NotebookEditorDecorationType = NotebookEditorDecorationType;
    NotebookEditorDecorationType._Keys = new idGenerator_1.IdGenerator('NotebookEditorDecorationType');
    class ExtHostNotebookController {
        constructor(mainContext, commands, _textDocumentsAndEditors, _textDocuments, logService, _extensionStoragePaths) {
            this._textDocumentsAndEditors = _textDocumentsAndEditors;
            this._textDocuments = _textDocuments;
            this.logService = logService;
            this._extensionStoragePaths = _extensionStoragePaths;
            this._notebookContentProviders = new Map();
            this._notebookStatusBarItemProviders = new Map();
            this._documents = new map_1.ResourceMap();
            this._editors = new Map();
            this._onDidChangeNotebookEditorSelection = new event_1.Emitter();
            this.onDidChangeNotebookEditorSelection = this._onDidChangeNotebookEditorSelection.event;
            this._onDidChangeNotebookEditorVisibleRanges = new event_1.Emitter();
            this.onDidChangeNotebookEditorVisibleRanges = this._onDidChangeNotebookEditorVisibleRanges.event;
            this._onDidChangeNotebookDocumentMetadata = new event_1.Emitter();
            this.onDidChangeNotebookDocumentMetadata = this._onDidChangeNotebookDocumentMetadata.event;
            this._onDidChangeNotebookCells = new event_1.Emitter();
            this.onDidChangeNotebookCells = this._onDidChangeNotebookCells.event;
            this._onDidChangeCellOutputs = new event_1.Emitter();
            this.onDidChangeCellOutputs = this._onDidChangeCellOutputs.event;
            this._onDidChangeCellMetadata = new event_1.Emitter();
            this.onDidChangeCellMetadata = this._onDidChangeCellMetadata.event;
            this._onDidChangeActiveNotebookEditor = new event_1.Emitter();
            this.onDidChangeActiveNotebookEditor = this._onDidChangeActiveNotebookEditor.event;
            this._onDidChangeCellExecutionState = new event_1.Emitter();
            this.onDidChangeNotebookCellExecutionState = this._onDidChangeCellExecutionState.event;
            this._visibleNotebookEditors = [];
            this._onDidOpenNotebookDocument = new event_1.Emitter();
            this.onDidOpenNotebookDocument = this._onDidOpenNotebookDocument.event;
            this._onDidCloseNotebookDocument = new event_1.Emitter();
            this.onDidCloseNotebookDocument = this._onDidCloseNotebookDocument.event;
            this._onDidSaveNotebookDocument = new event_1.Emitter();
            this.onDidSaveNotebookDocument = this._onDidSaveNotebookDocument.event;
            this._onDidChangeVisibleNotebookEditors = new event_1.Emitter();
            this.onDidChangeVisibleNotebookEditors = this._onDidChangeVisibleNotebookEditors.event;
            this._activeExecutions = new map_1.ResourceMap();
            this._statusBarCache = new cache_1.Cache('NotebookCellStatusBarCache');
            // --- serialize/deserialize
            this._handlePool = 0;
            this._notebookSerializer = new Map();
            this._backupIdPool = 0;
            this._notebookProxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebook);
            this._notebookDocumentsProxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookDocuments);
            this._notebookEditorsProxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookEditors);
            this._commandsConverter = commands.converter;
            commands.registerArgumentProcessor({
                // Serialized INotebookCellActionContext
                processArgument: (arg) => {
                    var _a;
                    if (arg && arg.$mid === 12) {
                        const notebookUri = (_a = arg.notebookEditor) === null || _a === void 0 ? void 0 : _a.notebookUri;
                        const cellHandle = arg.cell.handle;
                        const data = this._documents.get(notebookUri);
                        const cell = data === null || data === void 0 ? void 0 : data.getCell(cellHandle);
                        if (cell) {
                            return cell.apiCell;
                        }
                    }
                    return arg;
                }
            });
        }
        get activeNotebookEditor() {
            var _a;
            return (_a = this._activeNotebookEditor) === null || _a === void 0 ? void 0 : _a.apiEditor;
        }
        get visibleNotebookEditors() {
            return this._visibleNotebookEditors.map(editor => editor.apiEditor);
        }
        getEditorById(editorId) {
            return this._editors.get(editorId);
        }
        getIdByEditor(editor) {
            for (const [id, candidate] of this._editors) {
                if (candidate.apiEditor === editor) {
                    return id;
                }
            }
            return undefined;
        }
        get notebookDocuments() {
            return [...this._documents.values()];
        }
        lookupNotebookDocument(uri) {
            return this._documents.get(uri);
        }
        _getNotebookDocument(uri) {
            const result = this._documents.get(uri);
            if (!result) {
                throw new Error(`NO notebook document for '${uri}'`);
            }
            return result;
        }
        _getProviderData(viewType) {
            const result = this._notebookContentProviders.get(viewType);
            if (!result) {
                throw new Error(`NO provider for '${viewType}'`);
            }
            return result;
        }
        registerNotebookContentProvider(extension, viewType, provider, options) {
            var _a, _b, _c;
            if ((0, strings_1.isFalsyOrWhitespace)(viewType)) {
                throw new Error(`viewType cannot be empty or just whitespace`);
            }
            if (this._notebookContentProviders.has(viewType)) {
                throw new Error(`Notebook provider for '${viewType}' already registered`);
            }
            this._notebookContentProviders.set(viewType, { extension, provider });
            let listener;
            if (provider.onDidChangeNotebookContentOptions) {
                listener = provider.onDidChangeNotebookContentOptions(() => {
                    const internalOptions = typeConverters.NotebookDocumentContentOptions.from(provider.options);
                    this._notebookProxy.$updateNotebookProviderOptions(viewType, internalOptions);
                });
            }
            const viewOptionsFilenamePattern = (_a = options === null || options === void 0 ? void 0 : options.viewOptions) === null || _a === void 0 ? void 0 : _a.filenamePattern.map(pattern => typeConverters.NotebookExclusiveDocumentPattern.from(pattern)).filter(pattern => pattern !== undefined);
            if (((_b = options === null || options === void 0 ? void 0 : options.viewOptions) === null || _b === void 0 ? void 0 : _b.filenamePattern) && !viewOptionsFilenamePattern) {
                console.warn(`Notebook content provider view options file name pattern is invalid ${(_c = options === null || options === void 0 ? void 0 : options.viewOptions) === null || _c === void 0 ? void 0 : _c.filenamePattern}`);
            }
            const internalOptions = typeConverters.NotebookDocumentContentOptions.from(options);
            this._notebookProxy.$registerNotebookProvider({ id: extension.identifier, location: extension.extensionLocation, description: extension.description }, viewType, {
                transientOutputs: internalOptions.transientOutputs,
                transientCellMetadata: internalOptions.transientCellMetadata,
                transientDocumentMetadata: internalOptions.transientDocumentMetadata,
                viewOptions: (options === null || options === void 0 ? void 0 : options.viewOptions) && viewOptionsFilenamePattern ? { displayName: options.viewOptions.displayName, filenamePattern: viewOptionsFilenamePattern, exclusive: options.viewOptions.exclusive || false } : undefined
            });
            return new extHostTypes.Disposable(() => {
                listener === null || listener === void 0 ? void 0 : listener.dispose();
                this._notebookContentProviders.delete(viewType);
                this._notebookProxy.$unregisterNotebookProvider(viewType);
            });
        }
        registerNotebookCellStatusBarItemProvider(extension, selector, provider) {
            const handle = ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++;
            const eventHandle = typeof provider.onDidChangeCellStatusBarItems === 'function' ? ExtHostNotebookController._notebookStatusBarItemProviderHandlePool++ : undefined;
            this._notebookStatusBarItemProviders.set(handle, provider);
            this._notebookProxy.$registerNotebookCellStatusBarItemProvider(handle, eventHandle, selector);
            let subscription;
            if (eventHandle !== undefined) {
                subscription = provider.onDidChangeCellStatusBarItems(_ => this._notebookProxy.$emitCellStatusBarEvent(eventHandle));
            }
            return new extHostTypes.Disposable(() => {
                this._notebookStatusBarItemProviders.delete(handle);
                this._notebookProxy.$unregisterNotebookCellStatusBarItemProvider(handle, eventHandle);
                if (subscription) {
                    subscription.dispose();
                }
            });
        }
        createNotebookEditorDecorationType(options) {
            return new NotebookEditorDecorationType(this._notebookEditorsProxy, options).value;
        }
        async openNotebookDocument(uri) {
            const cached = this._documents.get(uri);
            if (cached) {
                return cached.apiNotebook;
            }
            const canonicalUri = await this._notebookDocumentsProxy.$tryOpenDocument(uri);
            const document = this._documents.get(uri_1.URI.revive(canonicalUri));
            return (0, types_1.assertIsDefined)(document === null || document === void 0 ? void 0 : document.apiNotebook);
        }
        async showNotebookDocument(notebookOrUri, options) {
            var _a;
            if (uri_1.URI.isUri(notebookOrUri)) {
                notebookOrUri = await this.openNotebookDocument(notebookOrUri);
            }
            let resolvedOptions;
            if (typeof options === 'object') {
                resolvedOptions = {
                    position: typeConverters.ViewColumn.from(options.viewColumn),
                    preserveFocus: options.preserveFocus,
                    selections: options.selections && options.selections.map(typeConverters.NotebookRange.from),
                    pinned: typeof options.preview === 'boolean' ? !options.preview : undefined
                };
            }
            else {
                resolvedOptions = {
                    preserveFocus: false
                };
            }
            const editorId = await this._notebookEditorsProxy.$tryShowNotebookDocument(notebookOrUri.uri, notebookOrUri.viewType, resolvedOptions);
            const editor = editorId && ((_a = this._editors.get(editorId)) === null || _a === void 0 ? void 0 : _a.apiEditor);
            if (editor) {
                return editor;
            }
            if (editorId) {
                throw new Error(`Could NOT open editor for "${notebookOrUri.toString()}" because another editor opened in the meantime.`);
            }
            else {
                throw new Error(`Could NOT open editor for "${notebookOrUri.toString()}".`);
            }
        }
        async $provideNotebookCellStatusBarItems(handle, uri, index, token) {
            var _a;
            const provider = this._notebookStatusBarItemProviders.get(handle);
            const revivedUri = uri_1.URI.revive(uri);
            const document = this._documents.get(revivedUri);
            if (!document || !provider) {
                return;
            }
            const cell = document.getCellFromIndex(index);
            if (!cell) {
                return;
            }
            const result = await provider.provideCellStatusBarItems(cell.apiCell, token);
            if (!result) {
                return undefined;
            }
            const disposables = new lifecycle_1.DisposableStore();
            const cacheId = this._statusBarCache.add([disposables]);
            const items = (_a = (result && result.map(item => typeConverters.NotebookStatusBarItem.from(item, this._commandsConverter, disposables)))) !== null && _a !== void 0 ? _a : undefined;
            return {
                cacheId,
                items
            };
        }
        $releaseNotebookCellStatusBarItems(cacheId) {
            this._statusBarCache.delete(cacheId);
        }
        registerNotebookSerializer(extension, viewType, serializer, options) {
            if ((0, strings_1.isFalsyOrWhitespace)(viewType)) {
                throw new Error(`viewType cannot be empty or just whitespace`);
            }
            const handle = this._handlePool++;
            this._notebookSerializer.set(handle, serializer);
            const internalOptions = typeConverters.NotebookDocumentContentOptions.from(options);
            this._notebookProxy.$registerNotebookSerializer(handle, { id: extension.identifier, location: extension.extensionLocation, description: extension.description }, viewType, internalOptions);
            return (0, lifecycle_1.toDisposable)(() => {
                this._notebookProxy.$unregisterNotebookSerializer(handle);
            });
        }
        async $dataToNotebook(handle, bytes, token) {
            const serializer = this._notebookSerializer.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const data = await serializer.deserializeNotebook(bytes.buffer, token);
            return {
                metadata: typeConverters.NotebookDocumentMetadata.from(data.metadata),
                cells: data.cells.map(typeConverters.NotebookCellData.from),
            };
        }
        async $notebookToData(handle, data, token) {
            const serializer = this._notebookSerializer.get(handle);
            if (!serializer) {
                throw new Error('NO serializer found');
            }
            const bytes = await serializer.serializeNotebook({
                metadata: typeConverters.NotebookDocumentMetadata.to(data.metadata),
                cells: data.cells.map(typeConverters.NotebookCellData.to)
            }, token);
            return buffer_1.VSBuffer.wrap(bytes);
        }
        cancelOneNotebookCellExecution(cell) {
            const execution = this._activeExecutions.get(cell.uri);
            execution === null || execution === void 0 ? void 0 : execution.cancel();
        }
        // --- open, save, saveAs, backup
        async $openNotebook(viewType, uri, backupId, untitledDocumentData, token) {
            const { provider } = this._getProviderData(viewType);
            const data = await provider.openNotebook(uri_1.URI.revive(uri), { backupId, untitledDocumentData: untitledDocumentData === null || untitledDocumentData === void 0 ? void 0 : untitledDocumentData.buffer }, token);
            return {
                metadata: typeConverters.NotebookDocumentMetadata.from(data.metadata),
                cells: data.cells.map(typeConverters.NotebookCellData.from),
            };
        }
        async $saveNotebook(viewType, uri, token) {
            const document = this._getNotebookDocument(uri_1.URI.revive(uri));
            const { provider } = this._getProviderData(viewType);
            await provider.saveNotebook(document.apiNotebook, token);
            return true;
        }
        async $saveNotebookAs(viewType, uri, target, token) {
            const document = this._getNotebookDocument(uri_1.URI.revive(uri));
            const { provider } = this._getProviderData(viewType);
            await provider.saveNotebookAs(uri_1.URI.revive(target), document.apiNotebook, token);
            return true;
        }
        async $backupNotebook(viewType, uri, cancellation) {
            var _a;
            const document = this._getNotebookDocument(uri_1.URI.revive(uri));
            const provider = this._getProviderData(viewType);
            const storagePath = (_a = this._extensionStoragePaths.workspaceValue(provider.extension)) !== null && _a !== void 0 ? _a : this._extensionStoragePaths.globalValue(provider.extension);
            const fileName = String((0, hash_1.hash)([document.uri.toString(), this._backupIdPool++]));
            const backupUri = uri_1.URI.joinPath(storagePath, fileName);
            const backup = await provider.provider.backupNotebook(document.apiNotebook, { destination: backupUri }, cancellation);
            document.updateBackup(backup);
            return backup.id;
        }
        $acceptModelChanged(uri, event, isDirty) {
            const document = this._getNotebookDocument(uri_1.URI.revive(uri));
            document.acceptModelChanged(event, isDirty);
        }
        $acceptDirtyStateChanged(uri, isDirty) {
            const document = this._getNotebookDocument(uri_1.URI.revive(uri));
            document.acceptModelChanged({ rawEvents: [], versionId: document.apiNotebook.version }, isDirty);
        }
        $acceptModelSaved(uri) {
            const document = this._getNotebookDocument(uri_1.URI.revive(uri));
            this._onDidSaveNotebookDocument.fire(document.apiNotebook);
        }
        $acceptEditorPropertiesChanged(id, data) {
            this.logService.debug('ExtHostNotebook#$acceptEditorPropertiesChanged', id, data);
            const editor = this._editors.get(id);
            if (!editor) {
                throw new Error(`unknown text editor: ${id}. known editors: ${[...this._editors.keys()]} `);
            }
            // ONE: make all state updates
            if (data.visibleRanges) {
                editor._acceptVisibleRanges(data.visibleRanges.ranges.map(typeConverters.NotebookRange.to));
            }
            if (data.selections) {
                editor._acceptSelections(data.selections.selections.map(typeConverters.NotebookRange.to));
            }
            // TWO: send all events after states have been updated
            if (data.visibleRanges) {
                this._onDidChangeNotebookEditorVisibleRanges.fire({
                    notebookEditor: editor.apiEditor,
                    visibleRanges: editor.apiEditor.visibleRanges
                });
            }
            if (data.selections) {
                this._onDidChangeNotebookEditorSelection.fire(Object.freeze({
                    notebookEditor: editor.apiEditor,
                    selections: editor.apiEditor.selections
                }));
            }
        }
        $acceptEditorViewColumns(data) {
            for (const id in data) {
                const editor = this._editors.get(id);
                if (!editor) {
                    throw new Error(`unknown text editor: ${id}. known editors: ${[...this._editors.keys()]} `);
                }
                editor._acceptViewColumn(typeConverters.ViewColumn.to(data[id]));
            }
        }
        $acceptDocumentPropertiesChanged(uri, data) {
            this.logService.debug('ExtHostNotebook#$acceptDocumentPropertiesChanged', uri.path, data);
            const document = this._getNotebookDocument(uri_1.URI.revive(uri));
            document.acceptDocumentPropertiesChanged(data);
            if (data.metadata) {
                this._onDidChangeNotebookDocumentMetadata.fire({ document: document.apiNotebook });
            }
        }
        _createExtHostEditor(document, editorId, data) {
            if (this._editors.has(editorId)) {
                throw new Error(`editor with id ALREADY EXSIST: ${editorId}`);
            }
            const editor = new extHostNotebookEditor_1.ExtHostNotebookEditor(editorId, this._notebookEditorsProxy, document, data.visibleRanges.map(typeConverters.NotebookRange.to), data.selections.map(typeConverters.NotebookRange.to), typeof data.viewColumn === 'number' ? typeConverters.ViewColumn.to(data.viewColumn) : undefined);
            this._editors.set(editorId, editor);
        }
        $acceptDocumentAndEditorsDelta(delta) {
            var _a, _b, _c;
            if (delta.removedDocuments) {
                for (const uri of delta.removedDocuments) {
                    const revivedUri = uri_1.URI.revive(uri);
                    const document = this._documents.get(revivedUri);
                    if (document) {
                        document.dispose();
                        this._documents.delete(revivedUri);
                        this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ removedDocuments: document.apiNotebook.getCells().map(cell => cell.document.uri) });
                        this._onDidCloseNotebookDocument.fire(document.apiNotebook);
                    }
                    for (const editor of this._editors.values()) {
                        if (editor.notebookData.uri.toString() === revivedUri.toString()) {
                            this._editors.delete(editor.id);
                        }
                    }
                }
            }
            if (delta.addedDocuments) {
                const addedCellDocuments = [];
                for (const modelData of delta.addedDocuments) {
                    const uri = uri_1.URI.revive(modelData.uri);
                    const viewType = modelData.viewType;
                    if (this._documents.has(uri)) {
                        throw new Error(`adding EXISTING notebook ${uri} `);
                    }
                    const that = this;
                    const document = new extHostNotebookDocument_1.ExtHostNotebookDocument(this._notebookDocumentsProxy, this._textDocumentsAndEditors, this._textDocuments, {
                        emitModelChange(event) {
                            that._onDidChangeNotebookCells.fire(event);
                        },
                        emitCellOutputsChange(event) {
                            that._onDidChangeCellOutputs.fire(event);
                        },
                        emitCellMetadataChange(event) {
                            that._onDidChangeCellMetadata.fire(event);
                        },
                        emitCellExecutionStateChange(event) {
                            that._onDidChangeCellExecutionState.fire(event);
                        }
                    }, viewType, modelData.metadata ? typeConverters.NotebookDocumentMetadata.to(modelData.metadata) : new extHostTypes.NotebookDocumentMetadata(), uri);
                    document.acceptModelChanged({
                        versionId: modelData.versionId,
                        rawEvents: [{
                                kind: notebookCommon_1.NotebookCellsChangeType.Initialize,
                                changes: [[0, 0, modelData.cells]]
                            }]
                    }, false);
                    // add cell document as vscode.TextDocument
                    addedCellDocuments.push(...modelData.cells.map(cell => extHostNotebookDocument_1.ExtHostCell.asModelAddData(document.apiNotebook, cell)));
                    (_a = this._documents.get(uri)) === null || _a === void 0 ? void 0 : _a.dispose();
                    this._documents.set(uri, document);
                    this._textDocumentsAndEditors.$acceptDocumentsAndEditorsDelta({ addedDocuments: addedCellDocuments });
                    this._onDidOpenNotebookDocument.fire(document.apiNotebook);
                }
            }
            if (delta.addedEditors) {
                for (const editorModelData of delta.addedEditors) {
                    if (this._editors.has(editorModelData.id)) {
                        return;
                    }
                    const revivedUri = uri_1.URI.revive(editorModelData.documentUri);
                    const document = this._documents.get(revivedUri);
                    if (document) {
                        this._createExtHostEditor(document, editorModelData.id, editorModelData);
                    }
                }
            }
            const removedEditors = [];
            if (delta.removedEditors) {
                for (const editorid of delta.removedEditors) {
                    const editor = this._editors.get(editorid);
                    if (editor) {
                        this._editors.delete(editorid);
                        if (((_b = this._activeNotebookEditor) === null || _b === void 0 ? void 0 : _b.id) === editor.id) {
                            this._activeNotebookEditor = undefined;
                        }
                        removedEditors.push(editor);
                    }
                }
            }
            if (delta.visibleEditors) {
                this._visibleNotebookEditors = delta.visibleEditors.map(id => this._editors.get(id)).filter(editor => !!editor);
                const visibleEditorsSet = new Set();
                this._visibleNotebookEditors.forEach(editor => visibleEditorsSet.add(editor.id));
                for (const editor of this._editors.values()) {
                    const newValue = visibleEditorsSet.has(editor.id);
                    editor._acceptVisibility(newValue);
                }
                this._visibleNotebookEditors = [...this._editors.values()].map(e => e).filter(e => e.visible);
                this._onDidChangeVisibleNotebookEditors.fire(this.visibleNotebookEditors);
            }
            if (delta.newActiveEditor === null) {
                // clear active notebook as current active editor is non-notebook editor
                this._activeNotebookEditor = undefined;
            }
            else if (delta.newActiveEditor) {
                this._activeNotebookEditor = this._editors.get(delta.newActiveEditor);
            }
            if (delta.newActiveEditor !== undefined) {
                this._onDidChangeActiveNotebookEditor.fire((_c = this._activeNotebookEditor) === null || _c === void 0 ? void 0 : _c.apiEditor);
            }
        }
        createNotebookCellExecution(docUri, index, kernelId) {
            const document = this.lookupNotebookDocument(docUri);
            if (!document) {
                throw new Error(`Invalid uri: ${docUri} `);
            }
            const cell = document.getCellFromIndex(index);
            if (!cell) {
                throw new Error(`Invalid cell index: ${docUri}, ${index} `);
            }
            // TODO@roblou also validate kernelId, once kernel has moved from editor to document
            if (this._activeExecutions.has(cell.uri)) {
                throw new Error(`duplicate execution for ${cell.uri}`);
            }
            const execution = new NotebookCellExecutionTask(docUri, document, cell, this._notebookDocumentsProxy);
            this._activeExecutions.set(cell.uri, execution);
            const listener = execution.onDidChangeState(() => {
                if (execution.state === NotebookCellExecutionTaskState.Resolved) {
                    execution.dispose();
                    listener.dispose();
                    this._activeExecutions.delete(cell.uri);
                }
            });
            return execution.asApiObject();
        }
    }
    exports.ExtHostNotebookController = ExtHostNotebookController;
    ExtHostNotebookController._notebookStatusBarItemProviderHandlePool = 0;
    var NotebookCellExecutionTaskState;
    (function (NotebookCellExecutionTaskState) {
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Init"] = 0] = "Init";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Started"] = 1] = "Started";
        NotebookCellExecutionTaskState[NotebookCellExecutionTaskState["Resolved"] = 2] = "Resolved";
    })(NotebookCellExecutionTaskState || (NotebookCellExecutionTaskState = {}));
    class NotebookCellExecutionTask extends lifecycle_1.Disposable {
        constructor(_uri, _document, _cell, _proxy) {
            super();
            this._uri = _uri;
            this._document = _document;
            this._cell = _cell;
            this._proxy = _proxy;
            this._onDidChangeState = new event_1.Emitter();
            this.onDidChangeState = this._onDidChangeState.event;
            this._state = NotebookCellExecutionTaskState.Init;
            this._tokenSource = this._register(new cancellation_1.CancellationTokenSource());
            this._collector = new TimeoutBasedCollector(10, edits => this.applyEdits(edits));
            this._executionOrder = _cell.internalMetadata.executionOrder;
            this.mixinMetadata({
                runState: extHostTypes.NotebookCellExecutionState.Pending,
                executionOrder: null
            });
        }
        get state() { return this._state; }
        cancel() {
            this._tokenSource.cancel();
        }
        async applyEditSoon(edit) {
            await this._collector.addItem(edit);
        }
        async applyEdits(edits) {
            return this._proxy.$applyEdits(this._uri, edits, false);
        }
        verifyStateForOutput() {
            if (this._state === NotebookCellExecutionTaskState.Init) {
                throw new Error('Must call start before modifying cell output');
            }
            if (this._state === NotebookCellExecutionTaskState.Resolved) {
                throw new Error('Cannot modify cell output after calling resolve');
            }
        }
        mixinMetadata(mixinMetadata) {
            const edit = { editType: 8 /* PartialMetadata */, handle: this._cell.handle, metadata: mixinMetadata };
            this.applyEdits([edit]);
        }
        cellIndexToHandle(cellIndex) {
            const cell = typeof cellIndex === 'number' ? this._document.getCellFromIndex(cellIndex) : this._cell;
            if (!cell) {
                return;
            }
            return cell.handle;
        }
        asApiObject() {
            const that = this;
            return Object.freeze({
                get document() { return that._document.apiNotebook; },
                get cell() { return that._cell.apiCell; },
                get executionOrder() { return that._executionOrder; },
                set executionOrder(v) {
                    that._executionOrder = v;
                    that.mixinMetadata({
                        executionOrder: v
                    });
                },
                start(context) {
                    var _a;
                    if (that._state === NotebookCellExecutionTaskState.Resolved || that._state === NotebookCellExecutionTaskState.Started) {
                        throw new Error('Cannot call start again');
                    }
                    that._state = NotebookCellExecutionTaskState.Started;
                    that._onDidChangeState.fire();
                    that.mixinMetadata({
                        runState: extHostTypes.NotebookCellExecutionState.Executing,
                        runStartTime: (_a = context === null || context === void 0 ? void 0 : context.startTime) !== null && _a !== void 0 ? _a : null
                    });
                },
                end(result) {
                    var _a, _b;
                    if (that._state === NotebookCellExecutionTaskState.Resolved) {
                        throw new Error('Cannot call resolve twice');
                    }
                    that._state = NotebookCellExecutionTaskState.Resolved;
                    that._onDidChangeState.fire();
                    that.mixinMetadata({
                        runState: extHostTypes.NotebookCellExecutionState.Idle,
                        lastRunSuccess: (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : null,
                        runEndTime: (_b = result === null || result === void 0 ? void 0 : result.endTime) !== null && _b !== void 0 ? _b : null,
                    });
                },
                clearOutput(cellIndex) {
                    that.verifyStateForOutput();
                    return this.replaceOutput([], cellIndex);
                },
                async appendOutput(outputs, cellIndex) {
                    that.verifyStateForOutput();
                    const handle = that.cellIndexToHandle(cellIndex);
                    if (typeof handle !== 'number') {
                        return;
                    }
                    outputs = Array.isArray(outputs) ? outputs : [outputs];
                    return that.applyEditSoon({ editType: 2 /* Output */, handle, append: true, outputs: outputs.map(typeConverters.NotebookCellOutput.from) });
                },
                async replaceOutput(outputs, cellIndex) {
                    that.verifyStateForOutput();
                    const handle = that.cellIndexToHandle(cellIndex);
                    if (typeof handle !== 'number') {
                        return;
                    }
                    outputs = Array.isArray(outputs) ? outputs : [outputs];
                    return that.applyEditSoon({ editType: 2 /* Output */, handle, outputs: outputs.map(typeConverters.NotebookCellOutput.from) });
                },
                async appendOutputItems(items, outputId) {
                    that.verifyStateForOutput();
                    items = Array.isArray(items) ? items : [items];
                    return that.applyEditSoon({ editType: 7 /* OutputItems */, append: true, items: items.map(typeConverters.NotebookCellOutputItem.from), outputId });
                },
                async replaceOutputItems(items, outputId) {
                    that.verifyStateForOutput();
                    items = Array.isArray(items) ? items : [items];
                    return that.applyEditSoon({ editType: 7 /* OutputItems */, items: items.map(typeConverters.NotebookCellOutputItem.from), outputId });
                },
                token: that._tokenSource.token
            });
        }
    }
    class TimeoutBasedCollector {
        constructor(delay, callback) {
            this.delay = delay;
            this.callback = callback;
            this.batch = [];
        }
        addItem(item) {
            this.batch.push(item);
            if (!this.waitPromise) {
                this.waitPromise = (0, async_1.timeout)(this.delay).then(() => {
                    this.waitPromise = undefined;
                    const batch = this.batch;
                    this.batch = [];
                    return this.callback(batch);
                });
            }
            return this.waitPromise;
        }
    }
});
//# sourceMappingURL=extHostNotebook.js.map