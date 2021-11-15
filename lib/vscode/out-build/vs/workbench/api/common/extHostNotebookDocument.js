/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, network_1, objects_1, uri_1, extHostTypeConverters, extHostTypes, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookDocument = exports.ExtHostCell = void 0;
    class RawContentChangeEvent {
        constructor(start, deletedCount, deletedItems, items) {
            this.start = start;
            this.deletedCount = deletedCount;
            this.deletedItems = deletedItems;
            this.items = items;
        }
        static asApiEvents(events) {
            return events.map(event => {
                return {
                    start: event.start,
                    deletedCount: event.deletedCount,
                    deletedItems: event.deletedItems,
                    items: event.items.map(data => data.apiCell)
                };
            });
        }
    }
    class ExtHostCell {
        constructor(_notebook, _extHostDocument, _cellData) {
            var _a;
            this._notebook = _notebook;
            this._extHostDocument = _extHostDocument;
            this._cellData = _cellData;
            this.handle = _cellData.handle;
            this.uri = uri_1.URI.revive(_cellData.uri);
            this.cellKind = _cellData.cellKind;
            this._outputs = _cellData.outputs.map(extHostTypeConverters.NotebookCellOutput.to);
            this._internalMetadata = (_a = _cellData.metadata) !== null && _a !== void 0 ? _a : {};
            this._metadata = extHostTypeConverters.NotebookCellMetadata.to(this._internalMetadata);
            this._previousResult = extHostTypeConverters.NotebookCellPreviousExecutionResult.to(this._internalMetadata);
        }
        static asModelAddData(notebook, cell) {
            return {
                EOL: cell.eol,
                lines: cell.source,
                modeId: cell.language,
                uri: cell.uri,
                isDirty: false,
                versionId: 1,
                notebook
            };
        }
        get internalMetadata() {
            return this._internalMetadata;
        }
        get apiCell() {
            if (!this._cell) {
                const that = this;
                const data = this._extHostDocument.getDocument(this.uri);
                if (!data) {
                    throw new Error(`MISSING extHostDocument for notebook cell: ${this.uri}`);
                }
                this._cell = Object.freeze({
                    get index() { return that._notebook.getCellIndex(that); },
                    notebook: that._notebook.apiNotebook,
                    kind: extHostTypeConverters.NotebookCellKind.to(this._cellData.cellKind),
                    document: data.document,
                    get outputs() { return that._outputs.slice(0); },
                    get metadata() { return that._metadata; },
                    get latestExecutionSummary() { return that._previousResult; }
                });
            }
            return this._cell;
        }
        setOutputs(newOutputs) {
            this._outputs = newOutputs.map(extHostTypeConverters.NotebookCellOutput.to);
        }
        setOutputItems(outputId, append, newOutputItems) {
            const newItems = newOutputItems.map(extHostTypeConverters.NotebookCellOutputItem.to);
            const output = this._outputs.find(op => op.id === outputId);
            if (output) {
                if (!append) {
                    output.outputs.length = 0;
                }
                output.outputs.push(...newItems);
            }
        }
        setMetadata(newMetadata) {
            this._internalMetadata = newMetadata;
            this._metadata = extHostTypeConverters.NotebookCellMetadata.to(newMetadata);
            this._previousResult = extHostTypeConverters.NotebookCellPreviousExecutionResult.to(newMetadata);
        }
    }
    exports.ExtHostCell = ExtHostCell;
    class ExtHostNotebookDocument {
        constructor(_proxy, _textDocumentsAndEditors, _textDocuments, _emitter, _viewType, _metadata, uri) {
            this._proxy = _proxy;
            this._textDocumentsAndEditors = _textDocumentsAndEditors;
            this._textDocuments = _textDocuments;
            this._emitter = _emitter;
            this._viewType = _viewType;
            this._metadata = _metadata;
            this.uri = uri;
            this.handle = ExtHostNotebookDocument._handlePool++;
            this._cells = [];
            this._versionId = 0;
            this._isDirty = false;
            this._disposed = false;
        }
        dispose() {
            this._disposed = true;
        }
        get apiNotebook() {
            if (!this._notebook) {
                const that = this;
                this._notebook = {
                    get uri() { return that.uri; },
                    get version() { return that._versionId; },
                    get viewType() { return that._viewType; },
                    get isDirty() { return that._isDirty; },
                    get isUntitled() { return that.uri.scheme === network_1.Schemas.untitled; },
                    get isClosed() { return that._disposed; },
                    get metadata() { return that._metadata; },
                    get cellCount() { return that._cells.length; },
                    cellAt(index) {
                        index = that._validateIndex(index);
                        return that._cells[index].apiCell;
                    },
                    getCells(range) {
                        const cells = range ? that._getCells(range) : that._cells;
                        return cells.map(cell => cell.apiCell);
                    },
                    save() {
                        return that._save();
                    }
                };
            }
            return this._notebook;
        }
        updateBackup(backup) {
            var _a;
            (_a = this._backup) === null || _a === void 0 ? void 0 : _a.delete();
            this._backup = backup;
        }
        disposeBackup() {
            var _a;
            (_a = this._backup) === null || _a === void 0 ? void 0 : _a.delete();
            this._backup = undefined;
        }
        acceptDocumentPropertiesChanged(data) {
            if (data.metadata) {
                this._metadata = this._metadata.with(data.metadata);
            }
        }
        acceptModelChanged(event, isDirty) {
            this._versionId = event.versionId;
            this._isDirty = isDirty;
            for (const rawEvent of event.rawEvents) {
                if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.Initialize) {
                    this._spliceNotebookCells(rawEvent.changes, true);
                }
                if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.ModelChange) {
                    this._spliceNotebookCells(rawEvent.changes, false);
                }
                else if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.Move) {
                    this._moveCell(rawEvent.index, rawEvent.newIdx);
                }
                else if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.Output) {
                    this._setCellOutputs(rawEvent.index, rawEvent.outputs);
                }
                else if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.OutputItem) {
                    this._setCellOutputItems(rawEvent.index, rawEvent.outputId, rawEvent.append, rawEvent.outputItems);
                }
                else if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.ChangeLanguage) {
                    this._changeCellLanguage(rawEvent.index, rawEvent.language);
                }
                else if (rawEvent.kind === notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata) {
                    this._changeCellMetadata(rawEvent.index, rawEvent.metadata);
                }
            }
        }
        _validateIndex(index) {
            if (index < 0) {
                return 0;
            }
            else if (index >= this._cells.length) {
                return this._cells.length - 1;
            }
            else {
                return index;
            }
        }
        _validateRange(range) {
            if (range.start < 0) {
                range = range.with({ start: 0 });
            }
            if (range.end > this._cells.length) {
                range = range.with({ end: this._cells.length });
            }
            return range;
        }
        _getCells(range) {
            range = this._validateRange(range);
            const result = [];
            for (let i = range.start; i < range.end; i++) {
                result.push(this._cells[i]);
            }
            return result;
        }
        async _save() {
            if (this._disposed) {
                return Promise.reject(new Error('Notebook has been closed'));
            }
            return this._proxy.$trySaveDocument(this.uri);
        }
        _spliceNotebookCells(splices, initialization) {
            if (this._disposed) {
                return;
            }
            const contentChangeEvents = [];
            const addedCellDocuments = [];
            const removedCellDocuments = [];
            splices.reverse().forEach(splice => {
                const cellDtos = splice[2];
                const newCells = cellDtos.map(cell => {
                    const extCell = new ExtHostCell(this, this._textDocumentsAndEditors, cell);
                    if (!initialization) {
                        addedCellDocuments.push(ExtHostCell.asModelAddData(this.apiNotebook, cell));
                    }
                    return extCell;
                });
                const changeEvent = new RawContentChangeEvent(splice[0], splice[1], [], newCells);
                const deletedItems = this._cells.splice(splice[0], splice[1], ...newCells);
                for (let cell of deletedItems) {
                    removedCellDocuments.push(cell.uri);
                    changeEvent.deletedItems.push(cell.apiCell);
                }
                contentChangeEvents.push(changeEvent);
            });
            this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({
                addedDocuments: addedCellDocuments,
                removedDocuments: removedCellDocuments
            });
            if (!initialization) {
                this._emitter.emitModelChange((0, objects_1.deepFreeze)({
                    document: this.apiNotebook,
                    changes: RawContentChangeEvent.asApiEvents(contentChangeEvents)
                }));
            }
        }
        _moveCell(index, newIdx) {
            const cells = this._cells.splice(index, 1);
            this._cells.splice(newIdx, 0, ...cells);
            const changes = [
                new RawContentChangeEvent(index, 1, cells.map(c => c.apiCell), []),
                new RawContentChangeEvent(newIdx, 0, [], cells)
            ];
            this._emitter.emitModelChange((0, objects_1.deepFreeze)({
                document: this.apiNotebook,
                changes: RawContentChangeEvent.asApiEvents(changes)
            }));
        }
        _setCellOutputs(index, outputs) {
            const cell = this._cells[index];
            cell.setOutputs(outputs);
            this._emitter.emitCellOutputsChange((0, objects_1.deepFreeze)({ document: this.apiNotebook, cells: [cell.apiCell] }));
        }
        _setCellOutputItems(index, outputId, append, outputItems) {
            const cell = this._cells[index];
            cell.setOutputItems(outputId, append, outputItems);
            this._emitter.emitCellOutputsChange((0, objects_1.deepFreeze)({ document: this.apiNotebook, cells: [cell.apiCell] }));
        }
        _changeCellLanguage(index, newModeId) {
            const cell = this._cells[index];
            if (cell.apiCell.document.languageId !== newModeId) {
                this._textDocuments.$acceptModelModeChanged(cell.uri, newModeId);
            }
        }
        _changeCellMetadata(index, newMetadata) {
            var _a;
            const cell = this._cells[index];
            const originalInternalMetadata = cell.internalMetadata;
            const originalExtMetadata = cell.apiCell.metadata;
            cell.setMetadata(newMetadata);
            const newExtMetadata = cell.apiCell.metadata;
            if (!(0, objects_1.equals)(originalExtMetadata, newExtMetadata)) {
                this._emitter.emitCellMetadataChange((0, objects_1.deepFreeze)({ document: this.apiNotebook, cell: cell.apiCell }));
            }
            if (originalInternalMetadata.runState !== newMetadata.runState) {
                const executionState = (_a = newMetadata.runState) !== null && _a !== void 0 ? _a : extHostTypes.NotebookCellExecutionState.Idle;
                this._emitter.emitCellExecutionStateChange((0, objects_1.deepFreeze)({ document: this.apiNotebook, cell: cell.apiCell, executionState }));
            }
        }
        getCellFromIndex(index) {
            return this._cells[index];
        }
        getCell(cellHandle) {
            return this._cells.find(cell => cell.handle === cellHandle);
        }
        getCellIndex(cell) {
            return this._cells.indexOf(cell);
        }
    }
    exports.ExtHostNotebookDocument = ExtHostNotebookDocument;
    ExtHostNotebookDocument._handlePool = 0;
});
//# sourceMappingURL=extHostNotebookDocument.js.map