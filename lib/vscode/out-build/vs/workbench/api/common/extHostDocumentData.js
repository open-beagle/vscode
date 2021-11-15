/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/assert", "vs/base/common/network", "vs/base/common/strings", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/model/wordHelper", "vs/workbench/api/common/extHostTypes", "vs/base/common/arrays"], function (require, exports, assert_1, network_1, strings_1, mirrorTextModel_1, wordHelper_1, extHostTypes_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDocumentLine = exports.ExtHostDocumentData = exports.getWordDefinitionFor = exports.setWordDefinitionFor = void 0;
    const _modeId2WordDefinition = new Map();
    function setWordDefinitionFor(modeId, wordDefinition) {
        if (!wordDefinition) {
            _modeId2WordDefinition.delete(modeId);
        }
        else {
            _modeId2WordDefinition.set(modeId, wordDefinition);
        }
    }
    exports.setWordDefinitionFor = setWordDefinitionFor;
    function getWordDefinitionFor(modeId) {
        return _modeId2WordDefinition.get(modeId);
    }
    exports.getWordDefinitionFor = getWordDefinitionFor;
    class ExtHostDocumentData extends mirrorTextModel_1.MirrorTextModel {
        constructor(_proxy, uri, lines, eol, versionId, _languageId, _isDirty, _notebook) {
            super(uri, lines, eol, versionId);
            this._proxy = _proxy;
            this._languageId = _languageId;
            this._isDirty = _isDirty;
            this._notebook = _notebook;
            this._isDisposed = false;
        }
        dispose() {
            // we don't really dispose documents but let
            // extensions still read from them. some
            // operations, live saving, will now error tho
            (0, assert_1.ok)(!this._isDisposed);
            this._isDisposed = true;
            this._isDirty = false;
        }
        equalLines(lines) {
            return (0, arrays_1.equals)(this._lines, lines);
        }
        get document() {
            if (!this._document) {
                const that = this;
                this._document = {
                    get uri() { return that._uri; },
                    get fileName() { return that._uri.fsPath; },
                    get isUntitled() { return that._uri.scheme === network_1.Schemas.untitled; },
                    get languageId() { return that._languageId; },
                    get version() { return that._versionId; },
                    get isClosed() { return that._isDisposed; },
                    get isDirty() { return that._isDirty; },
                    get notebook() { return that._notebook; },
                    save() { return that._save(); },
                    getText(range) { return range ? that._getTextInRange(range) : that.getText(); },
                    get eol() { return that._eol === '\n' ? extHostTypes_1.EndOfLine.LF : extHostTypes_1.EndOfLine.CRLF; },
                    get lineCount() { return that._lines.length; },
                    lineAt(lineOrPos) { return that._lineAt(lineOrPos); },
                    offsetAt(pos) { return that._offsetAt(pos); },
                    positionAt(offset) { return that._positionAt(offset); },
                    validateRange(ran) { return that._validateRange(ran); },
                    validatePosition(pos) { return that._validatePosition(pos); },
                    getWordRangeAtPosition(pos, regexp) { return that._getWordRangeAtPosition(pos, regexp); },
                };
            }
            return Object.freeze(this._document);
        }
        _acceptLanguageId(newLanguageId) {
            (0, assert_1.ok)(!this._isDisposed);
            this._languageId = newLanguageId;
        }
        _acceptIsDirty(isDirty) {
            (0, assert_1.ok)(!this._isDisposed);
            this._isDirty = isDirty;
        }
        _save() {
            if (this._isDisposed) {
                return Promise.reject(new Error('Document has been closed'));
            }
            return this._proxy.$trySaveDocument(this._uri);
        }
        _getTextInRange(_range) {
            const range = this._validateRange(_range);
            if (range.isEmpty) {
                return '';
            }
            if (range.isSingleLine) {
                return this._lines[range.start.line].substring(range.start.character, range.end.character);
            }
            const lineEnding = this._eol, startLineIndex = range.start.line, endLineIndex = range.end.line, resultLines = [];
            resultLines.push(this._lines[startLineIndex].substring(range.start.character));
            for (let i = startLineIndex + 1; i < endLineIndex; i++) {
                resultLines.push(this._lines[i]);
            }
            resultLines.push(this._lines[endLineIndex].substring(0, range.end.character));
            return resultLines.join(lineEnding);
        }
        _lineAt(lineOrPosition) {
            let line;
            if (lineOrPosition instanceof extHostTypes_1.Position) {
                line = lineOrPosition.line;
            }
            else if (typeof lineOrPosition === 'number') {
                line = lineOrPosition;
            }
            if (typeof line !== 'number' || line < 0 || line >= this._lines.length || Math.floor(line) !== line) {
                throw new Error('Illegal value for `line`');
            }
            return new ExtHostDocumentLine(line, this._lines[line], line === this._lines.length - 1);
        }
        _offsetAt(position) {
            position = this._validatePosition(position);
            this._ensureLineStarts();
            return this._lineStarts.getAccumulatedValue(position.line - 1) + position.character;
        }
        _positionAt(offset) {
            offset = Math.floor(offset);
            offset = Math.max(0, offset);
            this._ensureLineStarts();
            const out = this._lineStarts.getIndexOf(offset);
            const lineLength = this._lines[out.index].length;
            // Ensure we return a valid position
            return new extHostTypes_1.Position(out.index, Math.min(out.remainder, lineLength));
        }
        // ---- range math
        _validateRange(range) {
            if (!(range instanceof extHostTypes_1.Range)) {
                throw new Error('Invalid argument');
            }
            const start = this._validatePosition(range.start);
            const end = this._validatePosition(range.end);
            if (start === range.start && end === range.end) {
                return range;
            }
            return new extHostTypes_1.Range(start.line, start.character, end.line, end.character);
        }
        _validatePosition(position) {
            if (!(position instanceof extHostTypes_1.Position)) {
                throw new Error('Invalid argument');
            }
            if (this._lines.length === 0) {
                return position.with(0, 0);
            }
            let { line, character } = position;
            let hasChanged = false;
            if (line < 0) {
                line = 0;
                character = 0;
                hasChanged = true;
            }
            else if (line >= this._lines.length) {
                line = this._lines.length - 1;
                character = this._lines[line].length;
                hasChanged = true;
            }
            else {
                const maxCharacter = this._lines[line].length;
                if (character < 0) {
                    character = 0;
                    hasChanged = true;
                }
                else if (character > maxCharacter) {
                    character = maxCharacter;
                    hasChanged = true;
                }
            }
            if (!hasChanged) {
                return position;
            }
            return new extHostTypes_1.Position(line, character);
        }
        _getWordRangeAtPosition(_position, regexp) {
            const position = this._validatePosition(_position);
            if (!regexp) {
                // use default when custom-regexp isn't provided
                regexp = getWordDefinitionFor(this._languageId);
            }
            else if ((0, strings_1.regExpLeadsToEndlessLoop)(regexp)) {
                // use default when custom-regexp is bad
                throw new Error(`[getWordRangeAtPosition]: ignoring custom regexp '${regexp.source}' because it matches the empty string.`);
            }
            const wordAtText = (0, wordHelper_1.getWordAtText)(position.character + 1, (0, wordHelper_1.ensureValidWordDefinition)(regexp), this._lines[position.line], 0);
            if (wordAtText) {
                return new extHostTypes_1.Range(position.line, wordAtText.startColumn - 1, position.line, wordAtText.endColumn - 1);
            }
            return undefined;
        }
    }
    exports.ExtHostDocumentData = ExtHostDocumentData;
    class ExtHostDocumentLine {
        constructor(line, text, isLastLine) {
            this._line = line;
            this._text = text;
            this._isLastLine = isLastLine;
        }
        get lineNumber() {
            return this._line;
        }
        get text() {
            return this._text;
        }
        get range() {
            return new extHostTypes_1.Range(this._line, 0, this._line, this._text.length);
        }
        get rangeIncludingLineBreak() {
            if (this._isLastLine) {
                return this.range;
            }
            return new extHostTypes_1.Range(this._line, 0, this._line + 1, 0);
        }
        get firstNonWhitespaceCharacterIndex() {
            //TODO@api, rename to 'leadingWhitespaceLength'
            return /^(\s*)/.exec(this._text)[1].length;
        }
        get isEmptyOrWhitespace() {
            return this.firstNonWhitespaceCharacterIndex === this._text.length;
        }
    }
    exports.ExtHostDocumentLine = ExtHostDocumentLine;
});
//# sourceMappingURL=extHostDocumentData.js.map