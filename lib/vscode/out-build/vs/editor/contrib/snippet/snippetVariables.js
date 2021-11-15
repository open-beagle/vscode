/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/snippet/snippetVariables", "vs/base/common/path", "vs/base/common/resources", "vs/editor/contrib/snippet/snippetParser", "vs/editor/common/modes/languageConfigurationRegistry", "vs/base/common/strings", "vs/platform/workspaces/common/workspaces", "vs/base/common/labels", "vs/base/common/uuid"], function (require, exports, nls, path, resources_1, snippetParser_1, languageConfigurationRegistry_1, strings_1, workspaces_1, labels_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RandomBasedVariableResolver = exports.WorkspaceBasedVariableResolver = exports.TimeBasedVariableResolver = exports.CommentBasedVariableResolver = exports.ClipboardBasedVariableResolver = exports.ModelBasedVariableResolver = exports.SelectionBasedVariableResolver = exports.CompositeSnippetVariableResolver = exports.KnownSnippetVariableNames = void 0;
    exports.KnownSnippetVariableNames = Object.freeze({
        'CURRENT_YEAR': true,
        'CURRENT_YEAR_SHORT': true,
        'CURRENT_MONTH': true,
        'CURRENT_DATE': true,
        'CURRENT_HOUR': true,
        'CURRENT_MINUTE': true,
        'CURRENT_SECOND': true,
        'CURRENT_DAY_NAME': true,
        'CURRENT_DAY_NAME_SHORT': true,
        'CURRENT_MONTH_NAME': true,
        'CURRENT_MONTH_NAME_SHORT': true,
        'CURRENT_SECONDS_UNIX': true,
        'SELECTION': true,
        'CLIPBOARD': true,
        'TM_SELECTED_TEXT': true,
        'TM_CURRENT_LINE': true,
        'TM_CURRENT_WORD': true,
        'TM_LINE_INDEX': true,
        'TM_LINE_NUMBER': true,
        'TM_FILENAME': true,
        'TM_FILENAME_BASE': true,
        'TM_DIRECTORY': true,
        'TM_FILEPATH': true,
        'RELATIVE_FILEPATH': true,
        'BLOCK_COMMENT_START': true,
        'BLOCK_COMMENT_END': true,
        'LINE_COMMENT': true,
        'WORKSPACE_NAME': true,
        'WORKSPACE_FOLDER': true,
        'RANDOM': true,
        'RANDOM_HEX': true,
        'UUID': true
    });
    class CompositeSnippetVariableResolver {
        constructor(_delegates) {
            this._delegates = _delegates;
            //
        }
        resolve(variable) {
            for (const delegate of this._delegates) {
                let value = delegate.resolve(variable);
                if (value !== undefined) {
                    return value;
                }
            }
            return undefined;
        }
    }
    exports.CompositeSnippetVariableResolver = CompositeSnippetVariableResolver;
    class SelectionBasedVariableResolver {
        constructor(_model, _selection, _selectionIdx, _overtypingCapturer) {
            this._model = _model;
            this._selection = _selection;
            this._selectionIdx = _selectionIdx;
            this._overtypingCapturer = _overtypingCapturer;
            //
        }
        resolve(variable) {
            const { name } = variable;
            if (name === 'SELECTION' || name === 'TM_SELECTED_TEXT') {
                let value = this._model.getValueInRange(this._selection) || undefined;
                let isMultiline = this._selection.startLineNumber !== this._selection.endLineNumber;
                // If there was no selected text, try to get last overtyped text
                if (!value && this._overtypingCapturer) {
                    const info = this._overtypingCapturer.getLastOvertypedInfo(this._selectionIdx);
                    if (info) {
                        value = info.value;
                        isMultiline = info.multiline;
                    }
                }
                if (value && isMultiline && variable.snippet) {
                    // Selection is a multiline string which we indentation we now
                    // need to adjust. We compare the indentation of this variable
                    // with the indentation at the editor position and add potential
                    // extra indentation to the value
                    const line = this._model.getLineContent(this._selection.startLineNumber);
                    const lineLeadingWhitespace = (0, strings_1.getLeadingWhitespace)(line, 0, this._selection.startColumn - 1);
                    let varLeadingWhitespace = lineLeadingWhitespace;
                    variable.snippet.walk(marker => {
                        if (marker === variable) {
                            return false;
                        }
                        if (marker instanceof snippetParser_1.Text) {
                            varLeadingWhitespace = (0, strings_1.getLeadingWhitespace)((0, strings_1.splitLines)(marker.value).pop());
                        }
                        return true;
                    });
                    const whitespaceCommonLength = (0, strings_1.commonPrefixLength)(varLeadingWhitespace, lineLeadingWhitespace);
                    value = value.replace(/(\r\n|\r|\n)(.*)/g, (m, newline, rest) => `${newline}${varLeadingWhitespace.substr(whitespaceCommonLength)}${rest}`);
                }
                return value;
            }
            else if (name === 'TM_CURRENT_LINE') {
                return this._model.getLineContent(this._selection.positionLineNumber);
            }
            else if (name === 'TM_CURRENT_WORD') {
                const info = this._model.getWordAtPosition({
                    lineNumber: this._selection.positionLineNumber,
                    column: this._selection.positionColumn
                });
                return info && info.word || undefined;
            }
            else if (name === 'TM_LINE_INDEX') {
                return String(this._selection.positionLineNumber - 1);
            }
            else if (name === 'TM_LINE_NUMBER') {
                return String(this._selection.positionLineNumber);
            }
            return undefined;
        }
    }
    exports.SelectionBasedVariableResolver = SelectionBasedVariableResolver;
    class ModelBasedVariableResolver {
        constructor(_labelService, _model) {
            this._labelService = _labelService;
            this._model = _model;
            //
        }
        resolve(variable) {
            const { name } = variable;
            if (name === 'TM_FILENAME') {
                return path.basename(this._model.uri.fsPath);
            }
            else if (name === 'TM_FILENAME_BASE') {
                const name = path.basename(this._model.uri.fsPath);
                const idx = name.lastIndexOf('.');
                if (idx <= 0) {
                    return name;
                }
                else {
                    return name.slice(0, idx);
                }
            }
            else if (name === 'TM_DIRECTORY' && this._labelService) {
                if (path.dirname(this._model.uri.fsPath) === '.') {
                    return '';
                }
                return this._labelService.getUriLabel((0, resources_1.dirname)(this._model.uri));
            }
            else if (name === 'TM_FILEPATH' && this._labelService) {
                return this._labelService.getUriLabel(this._model.uri);
            }
            else if (name === 'RELATIVE_FILEPATH' && this._labelService) {
                return this._labelService.getUriLabel(this._model.uri, { relative: true, noPrefix: true });
            }
            return undefined;
        }
    }
    exports.ModelBasedVariableResolver = ModelBasedVariableResolver;
    class ClipboardBasedVariableResolver {
        constructor(_readClipboardText, _selectionIdx, _selectionCount, _spread) {
            this._readClipboardText = _readClipboardText;
            this._selectionIdx = _selectionIdx;
            this._selectionCount = _selectionCount;
            this._spread = _spread;
            //
        }
        resolve(variable) {
            if (variable.name !== 'CLIPBOARD') {
                return undefined;
            }
            const clipboardText = this._readClipboardText();
            if (!clipboardText) {
                return undefined;
            }
            // `spread` is assigning each cursor a line of the clipboard
            // text whenever there the line count equals the cursor count
            // and when enabled
            if (this._spread) {
                const lines = clipboardText.split(/\r\n|\n|\r/).filter(s => !(0, strings_1.isFalsyOrWhitespace)(s));
                if (lines.length === this._selectionCount) {
                    return lines[this._selectionIdx];
                }
            }
            return clipboardText;
        }
    }
    exports.ClipboardBasedVariableResolver = ClipboardBasedVariableResolver;
    class CommentBasedVariableResolver {
        constructor(_model, _selection) {
            this._model = _model;
            this._selection = _selection;
            //
        }
        resolve(variable) {
            const { name } = variable;
            const langId = this._model.getLanguageIdAtPosition(this._selection.selectionStartLineNumber, this._selection.selectionStartColumn);
            const config = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getComments(langId);
            if (!config) {
                return undefined;
            }
            if (name === 'LINE_COMMENT') {
                return config.lineCommentToken || undefined;
            }
            else if (name === 'BLOCK_COMMENT_START') {
                return config.blockCommentStartToken || undefined;
            }
            else if (name === 'BLOCK_COMMENT_END') {
                return config.blockCommentEndToken || undefined;
            }
            return undefined;
        }
    }
    exports.CommentBasedVariableResolver = CommentBasedVariableResolver;
    class TimeBasedVariableResolver {
        resolve(variable) {
            const { name } = variable;
            if (name === 'CURRENT_YEAR') {
                return String(new Date().getFullYear());
            }
            else if (name === 'CURRENT_YEAR_SHORT') {
                return String(new Date().getFullYear()).slice(-2);
            }
            else if (name === 'CURRENT_MONTH') {
                return String(new Date().getMonth().valueOf() + 1).padStart(2, '0');
            }
            else if (name === 'CURRENT_DATE') {
                return String(new Date().getDate().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_HOUR') {
                return String(new Date().getHours().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_MINUTE') {
                return String(new Date().getMinutes().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_SECOND') {
                return String(new Date().getSeconds().valueOf()).padStart(2, '0');
            }
            else if (name === 'CURRENT_DAY_NAME') {
                return TimeBasedVariableResolver.dayNames[new Date().getDay()];
            }
            else if (name === 'CURRENT_DAY_NAME_SHORT') {
                return TimeBasedVariableResolver.dayNamesShort[new Date().getDay()];
            }
            else if (name === 'CURRENT_MONTH_NAME') {
                return TimeBasedVariableResolver.monthNames[new Date().getMonth()];
            }
            else if (name === 'CURRENT_MONTH_NAME_SHORT') {
                return TimeBasedVariableResolver.monthNamesShort[new Date().getMonth()];
            }
            else if (name === 'CURRENT_SECONDS_UNIX') {
                return String(Math.floor(Date.now() / 1000));
            }
            return undefined;
        }
    }
    exports.TimeBasedVariableResolver = TimeBasedVariableResolver;
    TimeBasedVariableResolver.dayNames = [nls.localize(0, null), nls.localize(1, null), nls.localize(2, null), nls.localize(3, null), nls.localize(4, null), nls.localize(5, null), nls.localize(6, null)];
    TimeBasedVariableResolver.dayNamesShort = [nls.localize(7, null), nls.localize(8, null), nls.localize(9, null), nls.localize(10, null), nls.localize(11, null), nls.localize(12, null), nls.localize(13, null)];
    TimeBasedVariableResolver.monthNames = [nls.localize(14, null), nls.localize(15, null), nls.localize(16, null), nls.localize(17, null), nls.localize(18, null), nls.localize(19, null), nls.localize(20, null), nls.localize(21, null), nls.localize(22, null), nls.localize(23, null), nls.localize(24, null), nls.localize(25, null)];
    TimeBasedVariableResolver.monthNamesShort = [nls.localize(26, null), nls.localize(27, null), nls.localize(28, null), nls.localize(29, null), nls.localize(30, null), nls.localize(31, null), nls.localize(32, null), nls.localize(33, null), nls.localize(34, null), nls.localize(35, null), nls.localize(36, null), nls.localize(37, null)];
    class WorkspaceBasedVariableResolver {
        constructor(_workspaceService) {
            this._workspaceService = _workspaceService;
            //
        }
        resolve(variable) {
            if (!this._workspaceService) {
                return undefined;
            }
            const workspaceIdentifier = (0, workspaces_1.toWorkspaceIdentifier)(this._workspaceService.getWorkspace());
            if (!workspaceIdentifier) {
                return undefined;
            }
            if (variable.name === 'WORKSPACE_NAME') {
                return this._resolveWorkspaceName(workspaceIdentifier);
            }
            else if (variable.name === 'WORKSPACE_FOLDER') {
                return this._resoveWorkspacePath(workspaceIdentifier);
            }
            return undefined;
        }
        _resolveWorkspaceName(workspaceIdentifier) {
            if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return path.basename(workspaceIdentifier.uri.path);
            }
            let filename = path.basename(workspaceIdentifier.configPath.path);
            if (filename.endsWith(workspaces_1.WORKSPACE_EXTENSION)) {
                filename = filename.substr(0, filename.length - workspaces_1.WORKSPACE_EXTENSION.length - 1);
            }
            return filename;
        }
        _resoveWorkspacePath(workspaceIdentifier) {
            if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier)) {
                return (0, labels_1.normalizeDriveLetter)(workspaceIdentifier.uri.fsPath);
            }
            let filename = path.basename(workspaceIdentifier.configPath.path);
            let folderpath = workspaceIdentifier.configPath.fsPath;
            if (folderpath.endsWith(filename)) {
                folderpath = folderpath.substr(0, folderpath.length - filename.length - 1);
            }
            return (folderpath ? (0, labels_1.normalizeDriveLetter)(folderpath) : '/');
        }
    }
    exports.WorkspaceBasedVariableResolver = WorkspaceBasedVariableResolver;
    class RandomBasedVariableResolver {
        resolve(variable) {
            const { name } = variable;
            if (name === 'RANDOM') {
                return Math.random().toString().slice(-6);
            }
            else if (name === 'RANDOM_HEX') {
                return Math.random().toString(16).slice(-6);
            }
            else if (name === 'UUID') {
                return (0, uuid_1.generateUuid)();
            }
            return undefined;
        }
    }
    exports.RandomBasedVariableResolver = RandomBasedVariableResolver;
});
//# sourceMappingURL=snippetVariables.js.map