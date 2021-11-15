/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/base/common/uuid", "vs/editor/common/core/range", "vs/base/common/lifecycle", "vs/base/common/hash", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBuffer", "vs/workbench/contrib/notebook/common/model/notebookCellOutputTextModel"], function (require, exports, event_1, pieceTreeTextBufferBuilder_1, UUID, range_1, lifecycle_1, hash_1, pieceTreeTextBuffer_1, notebookCellOutputTextModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cloneNotebookCellTextModel = exports.cloneMetadata = exports.NotebookCellTextModel = void 0;
    class NotebookCellTextModel extends lifecycle_1.Disposable {
        constructor(uri, handle, _source, _language, cellKind, outputs, metadata, transientOptions, _modeService) {
            super();
            this.uri = uri;
            this.handle = handle;
            this._source = _source;
            this._language = _language;
            this.cellKind = cellKind;
            this.transientOptions = transientOptions;
            this._modeService = _modeService;
            this._onDidChangeOutputs = new event_1.Emitter();
            this.onDidChangeOutputs = this._onDidChangeOutputs.event;
            this._onDidChangeContent = new event_1.Emitter();
            this.onDidChangeContent = this._onDidChangeContent.event;
            this._onDidChangeMetadata = new event_1.Emitter();
            this.onDidChangeMetadata = this._onDidChangeMetadata.event;
            this._onDidChangeLanguage = new event_1.Emitter();
            this.onDidChangeLanguage = this._onDidChangeLanguage.event;
            this._hash = null;
            this._versionId = 1;
            this._alternativeId = 1;
            this._textModelDisposables = new lifecycle_1.DisposableStore();
            this._textModel = undefined;
            this._outputs = outputs.map(op => new notebookCellOutputTextModel_1.NotebookCellOutputTextModel(op));
            this._metadata = metadata || {};
        }
        get outputs() {
            return this._outputs;
        }
        get metadata() {
            return this._metadata;
        }
        set metadata(newMetadata) {
            const runStateChanged = this._metadata.runState !== newMetadata.runState;
            newMetadata = Object.assign(Object.assign({}, newMetadata), { runStartTimeAdjustment: computeRunStartTimeAdjustment(this._metadata, newMetadata) });
            this._metadata = newMetadata;
            this._hash = null;
            this._onDidChangeMetadata.fire({ runStateChanged });
        }
        get language() {
            return this._language;
        }
        set language(newLanguage) {
            if (this._textModel && this._textModel.getLanguageIdentifier().language !== newLanguage) {
                const newMode = this._modeService.create(newLanguage);
                this._textModel.setMode(newMode.languageIdentifier);
            }
            if (this._language === newLanguage) {
                return;
            }
            this._language = newLanguage;
            this._hash = null;
            this._onDidChangeLanguage.fire(newLanguage);
            this._onDidChangeContent.fire();
        }
        get textBuffer() {
            if (this._textBuffer) {
                return this._textBuffer;
            }
            const builder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
            builder.acceptChunk(this._source);
            const bufferFactory = builder.finish(true);
            const { textBuffer, disposable } = bufferFactory.create(1 /* LF */);
            this._textBuffer = textBuffer;
            this._register(disposable);
            this._register(this._textBuffer.onDidChangeContent(() => {
                this._hash = null;
                if (!this._textModel) {
                    this._onDidChangeContent.fire();
                }
            }));
            return this._textBuffer;
        }
        get alternativeId() {
            return this._alternativeId;
        }
        get textModel() {
            return this._textModel;
        }
        set textModel(m) {
            if (this._textModel === m) {
                return;
            }
            this._textModelDisposables.clear();
            this._textModel = m;
            if (this._textModel) {
                // Init language from text model
                this.language = this._textModel.getLanguageIdentifier().language;
                // Listen to language changes on the model
                this._textModelDisposables.add(this._textModel.onDidChangeLanguage(e => {
                    this.language = e.newLanguage;
                }));
                this._textModelDisposables.add(this._textModel.onWillDispose(() => this.textModel = undefined));
                this._textModelDisposables.add(this._textModel.onDidChangeContent(() => {
                    if (this._textModel) {
                        this._versionId = this._textModel.getVersionId();
                        this._alternativeId = this._textModel.getAlternativeVersionId();
                    }
                    this._onDidChangeContent.fire();
                }));
                this._textModel._overwriteVersionId(this._versionId);
                this._textModel._overwriteAlternativeVersionId(this._versionId);
            }
        }
        getValue() {
            const fullRange = this.getFullModelRange();
            const eol = this.textBuffer.getEOL();
            if (eol === '\n') {
                return this.textBuffer.getValueInRange(fullRange, 1 /* LF */);
            }
            else {
                return this.textBuffer.getValueInRange(fullRange, 2 /* CRLF */);
            }
        }
        getHashValue() {
            if (this._hash !== null) {
                return this._hash;
            }
            this._hash = (0, hash_1.hash)([(0, hash_1.hash)(this.language), (0, hash_1.hash)(this.getValue()), this._getPersisentMetadata(), this.transientOptions.transientOutputs ? [] : this._outputs.map(op => ({
                    outputs: op.outputs,
                    metadata: op.metadata
                }))]);
            return this._hash;
        }
        _getPersisentMetadata() {
            let filteredMetadata = {};
            const transientCellMetadata = this.transientOptions.transientCellMetadata;
            const keys = new Set([...Object.keys(this.metadata)]);
            for (let key of keys) {
                if (!(transientCellMetadata[key])) {
                    filteredMetadata[key] = this.metadata[key];
                }
            }
            return filteredMetadata;
        }
        getTextLength() {
            return this.textBuffer.getLength();
        }
        getFullModelRange() {
            const lineCount = this.textBuffer.getLineCount();
            return new range_1.Range(1, 1, lineCount, this.textBuffer.getLineLength(lineCount) + 1);
        }
        spliceNotebookCellOutputs(splices) {
            if (splices.length > 0) {
                splices.reverse().forEach(splice => {
                    this.outputs.splice(splice[0], splice[1], ...splice[2]);
                });
                this._onDidChangeOutputs.fire(splices);
            }
        }
        dispose() {
            // Manually release reference to previous text buffer to avoid large leaks
            // in case someone leaks a CellTextModel reference
            const emptyDisposedTextBuffer = new pieceTreeTextBuffer_1.PieceTreeTextBuffer([], '', '\n', false, false, true, true);
            emptyDisposedTextBuffer.dispose();
            this._textBuffer = emptyDisposedTextBuffer;
            super.dispose();
        }
    }
    exports.NotebookCellTextModel = NotebookCellTextModel;
    function cloneMetadata(cell) {
        return Object.assign({}, cell.metadata);
    }
    exports.cloneMetadata = cloneMetadata;
    function cloneNotebookCellTextModel(cell) {
        return {
            source: cell.getValue(),
            language: cell.language,
            cellKind: cell.cellKind,
            outputs: cell.outputs.map(output => ({
                outputs: output.outputs,
                /* paste should generate new outputId */ outputId: UUID.generateUuid()
            })),
            metadata: cloneMetadata(cell)
        };
    }
    exports.cloneNotebookCellTextModel = cloneNotebookCellTextModel;
    function computeRunStartTimeAdjustment(oldMetadata, newMetadata) {
        if (oldMetadata.runStartTime !== newMetadata.runStartTime && typeof newMetadata.runStartTime === 'number') {
            const offset = Date.now() - newMetadata.runStartTime;
            return offset < 0 ? Math.abs(offset) : 0;
        }
        else {
            return newMetadata.runStartTimeAdjustment;
        }
    }
});
//# sourceMappingURL=notebookCellTextModel.js.map