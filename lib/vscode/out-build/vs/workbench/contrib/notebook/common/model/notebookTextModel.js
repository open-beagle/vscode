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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/common/model/cellEdit", "vs/base/common/diff/diff", "vs/base/common/hash", "vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel", "vs/editor/common/services/modelService", "vs/base/common/network", "vs/base/common/resources", "vs/editor/common/services/modeService", "vs/editor/common/model/textModel"], function (require, exports, arrays_1, event_1, lifecycle_1, notebookCellTextModel_1, notebookCommon_1, undoRedo_1, cellEdit_1, diff_1, hash_1, notebookCellOutputTextModel_1, modelService_1, network_1, resources_1, modeService_1, textModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookTextModel = exports.NotebookOperationManager = void 0;
    class StackOperation {
        constructor(resource, label, undoRedoGroup, _delayedEmitter, _postUndoRedo, selectionState, beginAlternativeVersionId) {
            this.resource = resource;
            this.label = label;
            this.undoRedoGroup = undoRedoGroup;
            this._delayedEmitter = _delayedEmitter;
            this._postUndoRedo = _postUndoRedo;
            this._operations = [];
            this._beginSelectionState = undefined;
            this._resultSelectionState = undefined;
            this.type = 1 /* Workspace */;
            this._beginSelectionState = selectionState;
            this._beginAlternativeVersionId = beginAlternativeVersionId;
            this._resultAlternativeVersionId = beginAlternativeVersionId;
        }
        get resources() {
            return [this.resource];
        }
        get isEmpty() {
            return this._operations.length === 0;
        }
        pushEndState(alternativeVersionId, selectionState) {
            this._resultAlternativeVersionId = alternativeVersionId;
            this._resultSelectionState = selectionState;
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            var _a;
            if (this._operations.length === 0) {
                this._beginSelectionState = (_a = this._beginSelectionState) !== null && _a !== void 0 ? _a : beginSelectionState;
            }
            this._operations.push(element);
            this._resultSelectionState = resultSelectionState;
        }
        async undo() {
            this._delayedEmitter.beginDeferredEmit();
            for (let i = this._operations.length - 1; i >= 0; i--) {
                await this._operations[i].undo();
            }
            this._postUndoRedo(this._beginAlternativeVersionId);
            this._delayedEmitter.endDeferredEmit(this._beginSelectionState);
        }
        async redo() {
            this._delayedEmitter.beginDeferredEmit();
            for (let i = 0; i < this._operations.length; i++) {
                await this._operations[i].redo();
            }
            this._postUndoRedo(this._resultAlternativeVersionId);
            this._delayedEmitter.endDeferredEmit(this._resultSelectionState);
        }
    }
    class NotebookOperationManager {
        constructor(_undoService, _resource, _delayedEmitter, _postUndoRedo) {
            this._undoService = _undoService;
            this._resource = _resource;
            this._delayedEmitter = _delayedEmitter;
            this._postUndoRedo = _postUndoRedo;
            this._pendingStackOperation = null;
        }
        isUndoStackEmpty() {
            return this._pendingStackOperation === null || this._pendingStackOperation.isEmpty;
        }
        pushStackElement(label, selectionState, undoRedoGroup, alternativeVersionId) {
            if (this._pendingStackOperation) {
                this._pendingStackOperation.pushEndState(alternativeVersionId, selectionState);
                if (!this._pendingStackOperation.isEmpty) {
                    this._undoService.pushElement(this._pendingStackOperation, this._pendingStackOperation.undoRedoGroup);
                }
                this._pendingStackOperation = null;
                return;
            }
            this._pendingStackOperation = new StackOperation(this._resource, label, undoRedoGroup, this._delayedEmitter, this._postUndoRedo, selectionState, alternativeVersionId);
        }
        pushEditOperation(element, beginSelectionState, resultSelectionState) {
            if (this._pendingStackOperation) {
                this._pendingStackOperation.pushEditOperation(element, beginSelectionState, resultSelectionState);
                return;
            }
            this._undoService.pushElement(element);
        }
    }
    exports.NotebookOperationManager = NotebookOperationManager;
    class DelayedEmitter {
        constructor(_onDidChangeContent, _textModel) {
            this._onDidChangeContent = _onDidChangeContent;
            this._textModel = _textModel;
            this._deferredCnt = 0;
            this._notebookTextModelChangedEvent = null;
        }
        beginDeferredEmit() {
            this._deferredCnt++;
        }
        endDeferredEmit(endSelections) {
            this._deferredCnt--;
            if (this._deferredCnt === 0) {
                if (this._notebookTextModelChangedEvent) {
                    this._onDidChangeContent.fire({
                        rawEvents: this._notebookTextModelChangedEvent.rawEvents,
                        versionId: this._textModel.versionId,
                        endSelectionState: endSelections,
                        synchronous: this._notebookTextModelChangedEvent.synchronous
                    });
                }
                this._notebookTextModelChangedEvent = null;
            }
        }
        emit(data, synchronous, endSelections) {
            if (this._deferredCnt === 0) {
                this._onDidChangeContent.fire({
                    rawEvents: [data],
                    versionId: this._textModel.versionId,
                    synchronous,
                    endSelectionState: endSelections
                });
            }
            else {
                if (!this._notebookTextModelChangedEvent) {
                    this._notebookTextModelChangedEvent = {
                        rawEvents: [data],
                        versionId: this._textModel.versionId,
                        endSelectionState: endSelections,
                        synchronous: synchronous
                    };
                }
                else {
                    // merge
                    this._notebookTextModelChangedEvent = {
                        rawEvents: [...this._notebookTextModelChangedEvent.rawEvents, data],
                        versionId: this._textModel.versionId,
                        endSelectionState: endSelections !== undefined ? endSelections : this._notebookTextModelChangedEvent.endSelectionState,
                        synchronous: synchronous
                    };
                }
            }
        }
    }
    let NotebookTextModel = class NotebookTextModel extends lifecycle_1.Disposable {
        constructor(viewType, uri, cells, metadata, options, _undoService, _modelService, _modeService) {
            super();
            this.viewType = viewType;
            this.uri = uri;
            this._undoService = _undoService;
            this._modelService = _modelService;
            this._modeService = _modeService;
            this._onWillDispose = this._register(new event_1.Emitter());
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._cellhandlePool = 0;
            this._cellListeners = new Map();
            this._cells = [];
            this.metadata = notebookCommon_1.notebookDocumentMetadataDefaults;
            this.transientOptions = { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false };
            this._versionId = 0;
            /**
             * This alternative id is only for non-cell-content changes.
             */
            this._notebookSpecificAlternativeId = 0;
            /**
             * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
             */
            this._alternativeVersionId = '1';
            this.transientOptions = options;
            this.metadata = metadata;
            this._initialize(cells);
            const maybeUpdateCellTextModel = (textModel) => {
                if (textModel.uri.scheme === network_1.Schemas.vscodeNotebookCell && textModel instanceof textModel_1.TextModel) {
                    const cellUri = notebookCommon_1.CellUri.parse(textModel.uri);
                    if (cellUri && (0, resources_1.isEqual)(cellUri.notebook, this.uri)) {
                        const cellIdx = this._getCellIndexByHandle(cellUri.handle);
                        if (cellIdx >= 0) {
                            const cell = this.cells[cellIdx];
                            if (cell) {
                                cell.textModel = textModel;
                            }
                        }
                    }
                }
            };
            this._register(_modelService.onModelAdded(e => maybeUpdateCellTextModel(e)));
            this._eventEmitter = new DelayedEmitter(this._onDidChangeContent, this);
            this._operationManager = new NotebookOperationManager(this._undoService, uri, this._eventEmitter, (alternativeVersionId) => {
                this._increaseVersionId(true);
                this._overwriteAlternativeVersionId(alternativeVersionId);
            });
        }
        get length() {
            return this._cells.length;
        }
        get cells() {
            return this._cells;
        }
        get versionId() {
            return this._versionId;
        }
        get alternativeVersionId() {
            return this._alternativeVersionId;
        }
        _initialize(cells) {
            this._cells = [];
            this._versionId = 0;
            this._notebookSpecificAlternativeId = 0;
            const mainCells = cells.map(cell => {
                const cellHandle = this._cellhandlePool++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                return new notebookCellTextModel_1.NotebookCellTextModel(cellUri, cellHandle, cell.source, cell.language, cell.cellKind, cell.outputs || [], cell.metadata, this.transientOptions, this._modeService);
            });
            for (let i = 0; i < mainCells.length; i++) {
                const dirtyStateListener = mainCells[i].onDidChangeContent(() => {
                    this._increaseVersionIdForCellContentChange();
                    this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent, transient: false }, true);
                });
                this._cellListeners.set(mainCells[i].handle, dirtyStateListener);
            }
            this._cells.splice(0, 0, ...mainCells);
            this._alternativeVersionId = this._generateAlternativeId();
        }
        _generateAlternativeId() {
            return `${this._notebookSpecificAlternativeId}_` + this.cells.map(cell => cell.handle + ',' + cell.alternativeId).join(';');
        }
        dispose() {
            this._onWillDispose.fire();
            (0, lifecycle_1.dispose)(this._cellListeners.values());
            (0, lifecycle_1.dispose)(this._cells);
            super.dispose();
        }
        pushStackElement(label, selectionState, undoRedoGroup) {
            this._operationManager.pushStackElement(label, selectionState, undoRedoGroup, this.alternativeVersionId);
        }
        _getCellIndexByHandle(handle) {
            return this.cells.findIndex(c => c.handle === handle);
        }
        _getCellIndexWithOutputIdHandle(outputId) {
            return this.cells.findIndex(c => !!c.outputs.find(o => o.outputId === outputId));
        }
        reset(cells, metadata, transientOptions) {
            this.transientOptions = transientOptions;
            this._cellhandlePool = 0;
            this.applyEdits([
                { editType: 1 /* Replace */, index: 0, count: this.cells.length, cells },
                { editType: 5 /* DocumentMetadata */, metadata }
            ], true, undefined, () => undefined, undefined);
        }
        applyEdits(rawEdits, synchronous, beginSelectionState, endSelectionsComputer, undoRedoGroup, computeUndoRedo = true) {
            this._eventEmitter.beginDeferredEmit();
            this.pushStackElement('edit', beginSelectionState, undoRedoGroup);
            try {
                this._doApplyEdits(rawEdits, synchronous, computeUndoRedo);
                return true;
            }
            finally {
                // Update selection and versionId after applying edits.
                const endSelections = endSelectionsComputer();
                this._increaseVersionId(this._operationManager.isUndoStackEmpty());
                // Finalize undo element
                this.pushStackElement('edit', endSelections, undefined);
                // Broadcast changes
                this._eventEmitter.endDeferredEmit(endSelections);
            }
        }
        _doApplyEdits(rawEdits, synchronous, computeUndoRedo = true) {
            // compress all edits which have no side effects on cell index
            const edits = rawEdits.map((edit, index) => {
                let cellIndex = -1;
                if ('index' in edit) {
                    cellIndex = edit.index;
                }
                else if ('handle' in edit) {
                    cellIndex = this._getCellIndexByHandle(edit.handle);
                    this._assertIndex(cellIndex);
                }
                else if ('outputId' in edit) {
                    cellIndex = this._getCellIndexWithOutputIdHandle(edit.outputId);
                    this._assertIndex(cellIndex);
                }
                else if (edit.editType !== 5 /* DocumentMetadata */) {
                    throw new Error('Invalid cell edit');
                }
                return {
                    edit,
                    cellIndex,
                    end: (edit.editType === 5 /* DocumentMetadata */)
                        ? undefined
                        : (edit.editType === 1 /* Replace */ ? edit.index + edit.count : cellIndex),
                    originalIndex: index
                };
            }).sort((a, b) => {
                if (a.end === undefined) {
                    return -1;
                }
                if (b.end === undefined) {
                    return -1;
                }
                return b.end - a.end || b.originalIndex - a.originalIndex;
            }).reduce((prev, curr) => {
                if (!prev.length) {
                    // empty
                    prev.push([curr]);
                }
                else {
                    const last = prev[prev.length - 1];
                    const index = last[0].cellIndex;
                    if (curr.cellIndex === index) {
                        last.push(curr);
                    }
                    else {
                        prev.push([curr]);
                    }
                }
                return prev;
            }, []).map(editsOnSameIndex => {
                const replaceEdits = [];
                const otherEdits = [];
                editsOnSameIndex.forEach(edit => {
                    if (edit.edit.editType === 1 /* Replace */) {
                        replaceEdits.push(edit);
                    }
                    else {
                        otherEdits.push(edit);
                    }
                });
                return [...otherEdits.reverse(), ...replaceEdits];
            });
            const flattenEdits = (0, arrays_1.flatten)(edits);
            for (const { edit, cellIndex } of flattenEdits) {
                switch (edit.editType) {
                    case 1 /* Replace */:
                        this._replaceCells(edit.index, edit.count, edit.cells, synchronous, computeUndoRedo);
                        break;
                    case 2 /* Output */:
                        this._assertIndex(cellIndex);
                        const cell = this._cells[cellIndex];
                        if (edit.append) {
                            this._spliceNotebookCellOutputs(cell, [[cell.outputs.length, 0, edit.outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op))]], computeUndoRedo);
                        }
                        else {
                            this._spliceNotebookCellOutputs2(cell, edit.outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op)), computeUndoRedo);
                        }
                        break;
                    case 7 /* OutputItems */:
                        {
                            this._assertIndex(cellIndex);
                            const cell = this._cells[cellIndex];
                            if (edit.append) {
                                this._appendNotebookCellOutputItems(cell, edit.outputId, edit.items);
                            }
                            else {
                                this._replaceNotebookCellOutputItems(cell, edit.outputId, edit.items);
                            }
                        }
                        break;
                    case 3 /* Metadata */:
                        this._assertIndex(edit.index);
                        this._changeCellMetadata(this._cells[edit.index], edit.metadata, computeUndoRedo);
                        break;
                    case 8 /* PartialMetadata */:
                        this._assertIndex(cellIndex);
                        this._changeCellMetadataPartial(this._cells[cellIndex], edit.metadata, computeUndoRedo);
                        break;
                    case 4 /* CellLanguage */:
                        this._assertIndex(edit.index);
                        this._changeCellLanguage(this._cells[edit.index], edit.language, computeUndoRedo);
                        break;
                    case 5 /* DocumentMetadata */:
                        this._updateNotebookMetadata(edit.metadata, computeUndoRedo);
                        break;
                    case 6 /* Move */:
                        this._moveCellToIdx(edit.index, edit.length, edit.newIdx, synchronous, computeUndoRedo, undefined, undefined);
                        break;
                }
            }
        }
        _replaceCells(index, count, cellDtos, synchronous, computeUndoRedo) {
            var _a;
            if (count === 0 && cellDtos.length === 0) {
                return;
            }
            const oldViewCells = this._cells.slice(0);
            const oldSet = new Set();
            oldViewCells.forEach(cell => {
                oldSet.add(cell.handle);
            });
            // prepare remove
            for (let i = index; i < Math.min(index + count, this._cells.length); i++) {
                const cell = this._cells[i];
                (_a = this._cellListeners.get(cell.handle)) === null || _a === void 0 ? void 0 : _a.dispose();
                this._cellListeners.delete(cell.handle);
            }
            // prepare add
            const cells = cellDtos.map(cellDto => {
                const cellHandle = this._cellhandlePool++;
                const cellUri = notebookCommon_1.CellUri.generate(this.uri, cellHandle);
                const cell = new notebookCellTextModel_1.NotebookCellTextModel(cellUri, cellHandle, cellDto.source, cellDto.language, cellDto.cellKind, cellDto.outputs || [], cellDto.metadata, this.transientOptions, this._modeService);
                const textModel = this._modelService.getModel(cellUri);
                if (textModel && textModel instanceof textModel_1.TextModel) {
                    cell.textModel = textModel;
                    cell.language = cellDto.language;
                    if (!cell.textModel.equalsTextBuffer(cell.textBuffer)) {
                        cell.textModel.setValue(cellDto.source);
                    }
                }
                const dirtyStateListener = cell.onDidChangeContent(() => {
                    this._increaseVersionIdForCellContentChange();
                    this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent, transient: false }, true);
                });
                this._cellListeners.set(cell.handle, dirtyStateListener);
                return cell;
            });
            // make change
            this._cells.splice(index, count, ...cells);
            const diffs = (0, notebookCommon_1.diff)(oldViewCells, this._cells, cell => {
                return oldSet.has(cell.handle);
            }).map(diff => {
                return [diff.start, diff.deleteCount, diff.toInsert];
            });
            const undoDiff = diffs.map(diff => {
                const deletedCells = oldViewCells.slice(diff[0], diff[0] + diff[1]);
                return [diff[0], deletedCells, diff[2]];
            });
            if (computeUndoRedo) {
                this._operationManager.pushEditOperation(new cellEdit_1.SpliceCellsEdit(this.uri, undoDiff, {
                    insertCell: (index, cell, endSelections) => { this._insertNewCell(index, [cell], true, endSelections); },
                    deleteCell: (index, endSelections) => { this._removeCell(index, 1, true, endSelections); },
                    replaceCell: (index, count, cells, endSelections) => { this._replaceNewCells(index, count, cells, true, endSelections); },
                }, undefined, undefined), undefined, undefined);
            }
            // should be deferred
            this._eventEmitter.emit({
                kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                changes: diffs,
                transient: false
            }, synchronous);
        }
        _increaseVersionIdForCellContentChange() {
            this._versionId = this._versionId + 1;
            this._alternativeVersionId = this._generateAlternativeId();
        }
        _increaseVersionId(undoStackEmpty) {
            this._versionId = this._versionId + 1;
            if (!undoStackEmpty) {
                this._notebookSpecificAlternativeId = this._versionId;
            }
            this._alternativeVersionId = this._generateAlternativeId();
        }
        _overwriteAlternativeVersionId(newAlternativeVersionId) {
            this._alternativeVersionId = newAlternativeVersionId;
            this._notebookSpecificAlternativeId = Number(newAlternativeVersionId.substr(0, newAlternativeVersionId.indexOf('_')));
        }
        _isDocumentMetadataChangeTransient(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (let key of keys) {
                if (key !== 'trusted') {
                    return true;
                }
            }
            return false;
        }
        _updateNotebookMetadata(metadata, computeUndoRedo) {
            const oldMetadata = this.metadata;
            const triggerDirtyChange = this._isDocumentMetadataChanged(this.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const that = this;
                    this._operationManager.pushEditOperation(new class {
                        constructor() {
                            this.type = 0 /* Resource */;
                            this.label = 'Update Notebook Metadata';
                        }
                        get resource() {
                            return that.uri;
                        }
                        undo() {
                            that._updateNotebookMetadata(oldMetadata, false);
                        }
                        redo() {
                            that._updateNotebookMetadata(metadata, false);
                        }
                    }(), undefined, undefined);
                }
            }
            this.metadata = metadata;
            this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ChangeDocumentMetadata, metadata: this.metadata, transient: this._isDocumentMetadataChangeTransient(oldMetadata, metadata) }, true);
        }
        _insertNewCell(index, cells, synchronous, endSelections) {
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent(() => {
                    this._increaseVersionIdForCellContentChange();
                    this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent, transient: false }, true);
                });
                this._cellListeners.set(cells[i].handle, dirtyStateListener);
            }
            this._cells.splice(index, 0, ...cells);
            this._eventEmitter.emit({
                kind: notebookCommon_1.NotebookCellsChangeType.ModelChange,
                changes: [[
                        index,
                        0,
                        cells
                    ]],
                transient: false
            }, synchronous, endSelections);
            return;
        }
        _removeCell(index, count, synchronous, endSelections) {
            var _a;
            for (let i = index; i < index + count; i++) {
                const cell = this._cells[i];
                (_a = this._cellListeners.get(cell.handle)) === null || _a === void 0 ? void 0 : _a.dispose();
                this._cellListeners.delete(cell.handle);
            }
            this._cells.splice(index, count);
            this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: [[index, count, []]], transient: false }, synchronous, endSelections);
        }
        _replaceNewCells(index, count, cells, synchronous, endSelections) {
            var _a;
            for (let i = index; i < index + count; i++) {
                const cell = this._cells[i];
                (_a = this._cellListeners.get(cell.handle)) === null || _a === void 0 ? void 0 : _a.dispose();
                this._cellListeners.delete(cell.handle);
            }
            for (let i = 0; i < cells.length; i++) {
                const dirtyStateListener = cells[i].onDidChangeContent(() => {
                    this._increaseVersionIdForCellContentChange();
                    this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellContent, transient: false }, true);
                });
                this._cellListeners.set(cells[i].handle, dirtyStateListener);
            }
            this._cells.splice(index, count, ...cells);
            this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ModelChange, changes: [[index, count, cells]], transient: false }, synchronous, endSelections);
        }
        _isDocumentMetadataChanged(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (let key of keys) {
                if (key === 'custom') {
                    if (!this._customMetadataEqual(a[key], b[key])
                        &&
                            !(this.transientOptions.transientDocumentMetadata[key])) {
                        return true;
                    }
                }
                else if ((a[key] !== b[key])
                    &&
                        !(this.transientOptions.transientDocumentMetadata[key])) {
                    return true;
                }
            }
            return false;
        }
        _isCellMetadataChanged(a, b) {
            const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
            for (let key of keys) {
                if (key === 'custom') {
                    if (!this._customMetadataEqual(a[key], b[key])
                        &&
                            !(this.transientOptions.transientCellMetadata[key])) {
                        return true;
                    }
                }
                else if ((a[key] !== b[key])
                    &&
                        !(this.transientOptions.transientCellMetadata[key])) {
                    return true;
                }
            }
            return false;
        }
        _customMetadataEqual(a, b) {
            if (!a && !b) {
                // both of them are nullish or undefined
                return true;
            }
            if (!a || !b) {
                return false;
            }
            const aProps = Object.getOwnPropertyNames(a);
            const bProps = Object.getOwnPropertyNames(b);
            if (aProps.length !== bProps.length) {
                return false;
            }
            for (let i = 0; i < aProps.length; i++) {
                const propName = aProps[i];
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }
            return true;
        }
        _changeCellMetadataPartial(cell, metadata, computeUndoRedo) {
            var _a;
            const newMetadata = Object.assign({}, cell.metadata);
            let k;
            for (k in metadata) {
                const value = (_a = metadata[k]) !== null && _a !== void 0 ? _a : undefined;
                newMetadata[k] = value; // TS...
            }
            return this._changeCellMetadata(cell, newMetadata, computeUndoRedo);
        }
        _changeCellMetadata(cell, metadata, computeUndoRedo) {
            const triggerDirtyChange = this._isCellMetadataChanged(cell.metadata, metadata);
            if (triggerDirtyChange) {
                if (computeUndoRedo) {
                    const index = this._cells.indexOf(cell);
                    this._operationManager.pushEditOperation(new cellEdit_1.CellMetadataEdit(this.uri, index, Object.freeze(cell.metadata), Object.freeze(metadata), {
                        updateCellMetadata: (index, newMetadata) => {
                            const cell = this._cells[index];
                            if (!cell) {
                                return;
                            }
                            this._changeCellMetadata(cell, Object.assign(Object.assign({}, newMetadata), { runState: cell.metadata.runState }), false);
                        }
                    }), undefined, undefined);
                }
            }
            // should be deferred
            cell.metadata = metadata;
            this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ChangeCellMetadata, index: this._cells.indexOf(cell), metadata: cell.metadata, transient: !triggerDirtyChange }, true);
        }
        _changeCellLanguage(cell, languageId, computeUndoRedo) {
            if (cell.language === languageId) {
                return;
            }
            const oldLanguage = cell.language;
            cell.language = languageId;
            if (computeUndoRedo) {
                const that = this;
                this._operationManager.pushEditOperation(new class {
                    constructor() {
                        this.type = 0 /* Resource */;
                        this.label = 'Update Cell Language';
                    }
                    get resource() {
                        return that.uri;
                    }
                    undo() {
                        that._changeCellLanguage(cell, oldLanguage, false);
                    }
                    redo() {
                        that._changeCellLanguage(cell, languageId, false);
                    }
                }(), undefined, undefined);
            }
            this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.ChangeLanguage, index: this._cells.indexOf(cell), language: languageId, transient: false }, true, undefined);
        }
        _spliceNotebookCellOutputs2(cell, outputs, computeUndoRedo) {
            const diff = new diff_1.LcsDiff(new OutputSequence(cell.outputs), new OutputSequence(outputs));
            const diffResult = diff.ComputeDiff(false);
            const splices = diffResult.changes.map(change => [change.originalStart, change.originalLength, outputs.slice(change.modifiedStart, change.modifiedStart + change.modifiedLength)]);
            this._spliceNotebookCellOutputs(cell, splices, computeUndoRedo);
        }
        _spliceNotebookCellOutputs(cell, splices, computeUndoRedo) {
            var _a;
            if (splices.length === 0) {
                return;
            }
            cell.spliceNotebookCellOutputs(splices);
            this._eventEmitter.emit({
                kind: notebookCommon_1.NotebookCellsChangeType.Output,
                index: this._cells.indexOf(cell),
                outputs: (_a = cell.outputs) !== null && _a !== void 0 ? _a : [],
                transient: this.transientOptions.transientOutputs,
            }, true);
        }
        _appendNotebookCellOutputItems(cell, outputId, items) {
            const outputIndex = cell.outputs.findIndex(output => output.outputId === outputId);
            if (outputIndex < 0) {
                return;
            }
            const output = cell.outputs[outputIndex];
            output.appendData(items);
            this._eventEmitter.emit({
                kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                index: this._cells.indexOf(cell),
                outputId: output.outputId,
                outputItems: items,
                append: true,
                transient: this.transientOptions.transientOutputs
            }, true);
        }
        _replaceNotebookCellOutputItems(cell, outputId, items) {
            const outputIndex = cell.outputs.findIndex(output => output.outputId === outputId);
            if (outputIndex < 0) {
                return;
            }
            const output = cell.outputs[outputIndex];
            output.replaceData(items);
            this._eventEmitter.emit({
                kind: notebookCommon_1.NotebookCellsChangeType.OutputItem,
                index: this._cells.indexOf(cell),
                outputId: output.outputId,
                outputItems: items,
                append: false,
                transient: this.transientOptions.transientOutputs
            }, true, undefined);
        }
        _moveCellToIdx(index, length, newIdx, synchronous, pushedToUndoStack, beforeSelections, endSelections) {
            if (pushedToUndoStack) {
                this._operationManager.pushEditOperation(new cellEdit_1.MoveCellEdit(this.uri, index, length, newIdx, {
                    moveCell: (fromIndex, length, toIndex, beforeSelections, endSelections) => {
                        this._moveCellToIdx(fromIndex, length, toIndex, true, false, beforeSelections, endSelections);
                    },
                }, beforeSelections, endSelections), beforeSelections, endSelections);
            }
            this._assertIndex(index);
            this._assertIndex(newIdx);
            const cells = this._cells.splice(index, length);
            this._cells.splice(newIdx, 0, ...cells);
            this._eventEmitter.emit({ kind: notebookCommon_1.NotebookCellsChangeType.Move, index, length, newIdx, cells, transient: false }, synchronous, endSelections);
            return true;
        }
        _assertIndex(index) {
            if (index < 0 || index >= this._cells.length) {
                throw new Error(`model index out of range ${index}`);
            }
        }
    };
    NotebookTextModel = __decorate([
        __param(5, undoRedo_1.IUndoRedoService),
        __param(6, modelService_1.IModelService),
        __param(7, modeService_1.IModeService)
    ], NotebookTextModel);
    exports.NotebookTextModel = NotebookTextModel;
    class OutputSequence {
        constructor(outputs) {
            this.outputs = outputs;
        }
        getElements() {
            return this.outputs.map(output => {
                return (0, hash_1.hash)(output.outputs);
            });
        }
    }
});
//# sourceMappingURL=notebookTextModel.js.map