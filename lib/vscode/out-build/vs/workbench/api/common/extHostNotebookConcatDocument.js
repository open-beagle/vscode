/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHostTypes", "vs/base/common/event", "vs/editor/common/viewModel/prefixSumComputer", "vs/base/common/lifecycle", "vs/editor/common/modes/languageSelector", "vs/base/common/map", "vs/base/common/uri", "vs/base/common/uuid"], function (require, exports, types, event_1, prefixSumComputer_1, lifecycle_1, languageSelector_1, map_1, uri_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookConcatDocument = void 0;
    class ExtHostNotebookConcatDocument {
        constructor(extHostNotebooks, extHostDocuments, _notebook, _selector) {
            this._notebook = _notebook;
            this._selector = _selector;
            this._disposables = new lifecycle_1.DisposableStore();
            this._isClosed = false;
            this._versionId = 0;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.uri = uri_1.URI.from({ scheme: 'vscode-concat-doc', path: (0, uuid_1.generateUuid)() });
            this._init();
            this._disposables.add(extHostDocuments.onDidChangeDocument(e => {
                const cellIdx = this._cellUris.get(e.document.uri);
                if (cellIdx !== undefined) {
                    this._cellLengths.changeValue(cellIdx, this._cells[cellIdx].document.getText().length + 1);
                    this._cellLines.changeValue(cellIdx, this._cells[cellIdx].document.lineCount);
                    this._versionId += 1;
                    this._onDidChange.fire(undefined);
                }
            }));
            const documentChange = (document) => {
                if (document === this._notebook) {
                    this._init();
                    this._versionId += 1;
                    this._onDidChange.fire(undefined);
                }
            };
            this._disposables.add(extHostNotebooks.onDidChangeNotebookCells(e => documentChange(e.document)));
        }
        dispose() {
            this._disposables.dispose();
            this._isClosed = true;
        }
        get isClosed() {
            return this._isClosed;
        }
        _init() {
            this._cells = [];
            this._cellUris = new map_1.ResourceMap();
            const cellLengths = [];
            const cellLineCounts = [];
            for (const cell of this._notebook.getCells()) {
                if (cell.kind === types.NotebookCellKind.Code && (!this._selector || (0, languageSelector_1.score)(this._selector, cell.document.uri, cell.document.languageId, true))) {
                    this._cellUris.set(cell.document.uri, this._cells.length);
                    this._cells.push(cell);
                    cellLengths.push(cell.document.getText().length + 1);
                    cellLineCounts.push(cell.document.lineCount);
                }
            }
            this._cellLengths = new prefixSumComputer_1.PrefixSumComputer(new Uint32Array(cellLengths));
            this._cellLines = new prefixSumComputer_1.PrefixSumComputer(new Uint32Array(cellLineCounts));
        }
        get version() {
            return this._versionId;
        }
        getText(range) {
            var _a, _b;
            if (!range) {
                let result = '';
                for (const cell of this._cells) {
                    result += cell.document.getText() + '\n';
                }
                // remove last newline again
                result = result.slice(0, -1);
                return result;
            }
            if (range.isEmpty) {
                return '';
            }
            // get start and end locations and create substrings
            const start = this.locationAt(range.start);
            const end = this.locationAt(range.end);
            const startCell = this._cells[(_a = this._cellUris.get(start.uri)) !== null && _a !== void 0 ? _a : -1];
            const endCell = this._cells[(_b = this._cellUris.get(end.uri)) !== null && _b !== void 0 ? _b : -1];
            if (!startCell || !endCell) {
                return '';
            }
            else if (startCell === endCell) {
                return startCell.document.getText(new types.Range(start.range.start, end.range.end));
            }
            else {
                const a = startCell.document.getText(new types.Range(start.range.start, new types.Position(startCell.document.lineCount, 0)));
                const b = endCell.document.getText(new types.Range(new types.Position(0, 0), end.range.end));
                return a + '\n' + b;
            }
        }
        offsetAt(position) {
            const idx = this._cellLines.getIndexOf(position.line);
            const offset1 = this._cellLengths.getAccumulatedValue(idx.index - 1);
            const offset2 = this._cells[idx.index].document.offsetAt(position.with(idx.remainder));
            return offset1 + offset2;
        }
        positionAt(locationOrOffset) {
            if (typeof locationOrOffset === 'number') {
                const idx = this._cellLengths.getIndexOf(locationOrOffset);
                const lineCount = this._cellLines.getAccumulatedValue(idx.index - 1);
                return this._cells[idx.index].document.positionAt(idx.remainder).translate(lineCount);
            }
            const idx = this._cellUris.get(locationOrOffset.uri);
            if (idx !== undefined) {
                const line = this._cellLines.getAccumulatedValue(idx - 1);
                return new types.Position(line + locationOrOffset.range.start.line, locationOrOffset.range.start.character);
            }
            // do better?
            // return undefined;
            return new types.Position(0, 0);
        }
        locationAt(positionOrRange) {
            if (!types.Range.isRange(positionOrRange)) {
                positionOrRange = new types.Range(positionOrRange, positionOrRange);
            }
            const startIdx = this._cellLines.getIndexOf(positionOrRange.start.line);
            let endIdx = startIdx;
            if (!positionOrRange.isEmpty) {
                endIdx = this._cellLines.getIndexOf(positionOrRange.end.line);
            }
            const startPos = new types.Position(startIdx.remainder, positionOrRange.start.character);
            const endPos = new types.Position(endIdx.remainder, positionOrRange.end.character);
            const range = new types.Range(startPos, endPos);
            const startCell = this._cells[startIdx.index];
            return new types.Location(startCell.document.uri, startCell.document.validateRange(range));
        }
        contains(uri) {
            return this._cellUris.has(uri);
        }
        validateRange(range) {
            const start = this.validatePosition(range.start);
            const end = this.validatePosition(range.end);
            return range.with(start, end);
        }
        validatePosition(position) {
            const startIdx = this._cellLines.getIndexOf(position.line);
            const cellPosition = new types.Position(startIdx.remainder, position.character);
            const validCellPosition = this._cells[startIdx.index].document.validatePosition(cellPosition);
            const line = this._cellLines.getAccumulatedValue(startIdx.index - 1);
            return new types.Position(line + validCellPosition.line, validCellPosition.character);
        }
    }
    exports.ExtHostNotebookConcatDocument = ExtHostNotebookConcatDocument;
});
//# sourceMappingURL=extHostNotebookConcatDocument.js.map