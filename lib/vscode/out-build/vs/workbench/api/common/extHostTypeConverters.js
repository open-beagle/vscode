/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/htmlContent", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/objects", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/platform/editor/common/editor", "vs/platform/markers/common/markers", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/services/editor/common/editorService", "./extHostTypes"], function (require, exports, arrays_1, htmlContent, marked, marshalling_1, objects_1, types_1, uri_1, editorRange, modes, editor_1, markers_1, notebooks, editorService_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionTriggerKind = exports.TestResults = exports.TestItem = exports.TestMessage = exports.NotebookKernelPreload = exports.NotebookDocumentContentOptions = exports.NotebookStatusBarItem = exports.NotebookDecorationRenderOptions = exports.NotebookExclusiveDocumentPattern = exports.NotebookCellOutput = exports.NotebookCellOutputItem = exports.NotebookCellData = exports.NotebookCellKind = exports.NotebookCellPreviousExecutionResult = exports.NotebookDocumentMetadata = exports.NotebookCellMetadata = exports.NotebookRange = exports.LanguageSelector = exports.GlobPattern = exports.TextEditorOpenOptions = exports.FoldingRangeKind = exports.FoldingRange = exports.ProgressLocation = exports.EndOfLine = exports.TextEditorLineNumbersStyle = exports.TextDocumentSaveReason = exports.SelectionRange = exports.Color = exports.ColorPresentation = exports.DocumentLink = exports.InlineHintKind = exports.InlineHint = exports.SignatureHelp = exports.SignatureInformation = exports.ParameterInformation = exports.CompletionItem = exports.CompletionItemKind = exports.CompletionItemTag = exports.CompletionContext = exports.CompletionTriggerKind = exports.DocumentHighlight = exports.InlineValueContext = exports.InlineValue = exports.EvaluatableExpression = exports.Hover = exports.DefinitionLink = exports.location = exports.CallHierarchyOutgoingCall = exports.CallHierarchyIncomingCall = exports.CallHierarchyItem = exports.DocumentSymbol = exports.WorkspaceSymbol = exports.SymbolTag = exports.SymbolKind = exports.WorkspaceEdit = exports.TextEdit = exports.DecorationRenderOptions = exports.DecorationRangeBehavior = exports.ThemableDecorationRenderOptions = exports.ThemableDecorationAttachmentRenderOptions = exports.pathOrURIToURI = exports.fromRangeOrRangeWithMessage = exports.MarkdownString = exports.isDecorationOptionsArr = exports.ViewColumn = exports.DiagnosticSeverity = exports.DiagnosticRelatedInformation = exports.Diagnostic = exports.DiagnosticTag = exports.Position = exports.TokenType = exports.Range = exports.Selection = void 0;
    var Selection;
    (function (Selection) {
        function to(selection) {
            const { selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn } = selection;
            const start = new types.Position(selectionStartLineNumber - 1, selectionStartColumn - 1);
            const end = new types.Position(positionLineNumber - 1, positionColumn - 1);
            return new types.Selection(start, end);
        }
        Selection.to = to;
        function from(selection) {
            const { anchor, active } = selection;
            return {
                selectionStartLineNumber: anchor.line + 1,
                selectionStartColumn: anchor.character + 1,
                positionLineNumber: active.line + 1,
                positionColumn: active.character + 1
            };
        }
        Selection.from = from;
    })(Selection = exports.Selection || (exports.Selection = {}));
    var Range;
    (function (Range) {
        function from(range) {
            if (!range) {
                return undefined;
            }
            const { start, end } = range;
            return {
                startLineNumber: start.line + 1,
                startColumn: start.character + 1,
                endLineNumber: end.line + 1,
                endColumn: end.character + 1
            };
        }
        Range.from = from;
        function to(range) {
            if (!range) {
                return undefined;
            }
            const { startLineNumber, startColumn, endLineNumber, endColumn } = range;
            return new types.Range(startLineNumber - 1, startColumn - 1, endLineNumber - 1, endColumn - 1);
        }
        Range.to = to;
    })(Range = exports.Range || (exports.Range = {}));
    var TokenType;
    (function (TokenType) {
        function to(type) {
            switch (type) {
                case 1 /* Comment */: return types.StandardTokenType.Comment;
                case 0 /* Other */: return types.StandardTokenType.Other;
                case 4 /* RegEx */: return types.StandardTokenType.RegEx;
                case 2 /* String */: return types.StandardTokenType.String;
            }
        }
        TokenType.to = to;
    })(TokenType = exports.TokenType || (exports.TokenType = {}));
    var Position;
    (function (Position) {
        function to(position) {
            return new types.Position(position.lineNumber - 1, position.column - 1);
        }
        Position.to = to;
        function from(position) {
            return { lineNumber: position.line + 1, column: position.character + 1 };
        }
        Position.from = from;
    })(Position = exports.Position || (exports.Position = {}));
    var DiagnosticTag;
    (function (DiagnosticTag) {
        function from(value) {
            switch (value) {
                case types.DiagnosticTag.Unnecessary:
                    return 1 /* Unnecessary */;
                case types.DiagnosticTag.Deprecated:
                    return 2 /* Deprecated */;
            }
            return undefined;
        }
        DiagnosticTag.from = from;
        function to(value) {
            switch (value) {
                case 1 /* Unnecessary */:
                    return types.DiagnosticTag.Unnecessary;
                case 2 /* Deprecated */:
                    return types.DiagnosticTag.Deprecated;
                default:
                    return undefined;
            }
        }
        DiagnosticTag.to = to;
    })(DiagnosticTag = exports.DiagnosticTag || (exports.DiagnosticTag = {}));
    var Diagnostic;
    (function (Diagnostic) {
        function from(value) {
            let code;
            if (value.code) {
                if ((0, types_1.isString)(value.code) || (0, types_1.isNumber)(value.code)) {
                    code = String(value.code);
                }
                else {
                    code = {
                        value: String(value.code.value),
                        target: value.code.target,
                    };
                }
            }
            return Object.assign(Object.assign({}, Range.from(value.range)), { message: value.message, source: value.source, code, severity: DiagnosticSeverity.from(value.severity), relatedInformation: value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.from), tags: Array.isArray(value.tags) ? (0, arrays_1.coalesce)(value.tags.map(DiagnosticTag.from)) : undefined });
        }
        Diagnostic.from = from;
        function to(value) {
            var _a;
            const res = new types.Diagnostic(Range.to(value), value.message, DiagnosticSeverity.to(value.severity));
            res.source = value.source;
            res.code = (0, types_1.isString)(value.code) ? value.code : (_a = value.code) === null || _a === void 0 ? void 0 : _a.value;
            res.relatedInformation = value.relatedInformation && value.relatedInformation.map(DiagnosticRelatedInformation.to);
            res.tags = value.tags && (0, arrays_1.coalesce)(value.tags.map(DiagnosticTag.to));
            return res;
        }
        Diagnostic.to = to;
    })(Diagnostic = exports.Diagnostic || (exports.Diagnostic = {}));
    var DiagnosticRelatedInformation;
    (function (DiagnosticRelatedInformation) {
        function from(value) {
            return Object.assign(Object.assign({}, Range.from(value.location.range)), { message: value.message, resource: value.location.uri });
        }
        DiagnosticRelatedInformation.from = from;
        function to(value) {
            return new types.DiagnosticRelatedInformation(new types.Location(value.resource, Range.to(value)), value.message);
        }
        DiagnosticRelatedInformation.to = to;
    })(DiagnosticRelatedInformation = exports.DiagnosticRelatedInformation || (exports.DiagnosticRelatedInformation = {}));
    var DiagnosticSeverity;
    (function (DiagnosticSeverity) {
        function from(value) {
            switch (value) {
                case types.DiagnosticSeverity.Error:
                    return markers_1.MarkerSeverity.Error;
                case types.DiagnosticSeverity.Warning:
                    return markers_1.MarkerSeverity.Warning;
                case types.DiagnosticSeverity.Information:
                    return markers_1.MarkerSeverity.Info;
                case types.DiagnosticSeverity.Hint:
                    return markers_1.MarkerSeverity.Hint;
            }
            return markers_1.MarkerSeverity.Error;
        }
        DiagnosticSeverity.from = from;
        function to(value) {
            switch (value) {
                case markers_1.MarkerSeverity.Info:
                    return types.DiagnosticSeverity.Information;
                case markers_1.MarkerSeverity.Warning:
                    return types.DiagnosticSeverity.Warning;
                case markers_1.MarkerSeverity.Error:
                    return types.DiagnosticSeverity.Error;
                case markers_1.MarkerSeverity.Hint:
                    return types.DiagnosticSeverity.Hint;
                default:
                    return types.DiagnosticSeverity.Error;
            }
        }
        DiagnosticSeverity.to = to;
    })(DiagnosticSeverity = exports.DiagnosticSeverity || (exports.DiagnosticSeverity = {}));
    var ViewColumn;
    (function (ViewColumn) {
        function from(column) {
            if (typeof column === 'number' && column >= types.ViewColumn.One) {
                return column - 1; // adjust zero index (ViewColumn.ONE => 0)
            }
            if (column === types.ViewColumn.Beside) {
                return editorService_1.SIDE_GROUP;
            }
            return editorService_1.ACTIVE_GROUP; // default is always the active group
        }
        ViewColumn.from = from;
        function to(position) {
            if (typeof position === 'number' && position >= 0) {
                return position + 1; // adjust to index (ViewColumn.ONE => 1)
            }
            throw new Error(`invalid 'EditorGroupColumn'`);
        }
        ViewColumn.to = to;
    })(ViewColumn = exports.ViewColumn || (exports.ViewColumn = {}));
    function isDecorationOptions(something) {
        return (typeof something.range !== 'undefined');
    }
    function isDecorationOptionsArr(something) {
        if (something.length === 0) {
            return true;
        }
        return isDecorationOptions(something[0]) ? true : false;
    }
    exports.isDecorationOptionsArr = isDecorationOptionsArr;
    var MarkdownString;
    (function (MarkdownString) {
        function fromMany(markup) {
            return markup.map(MarkdownString.from);
        }
        MarkdownString.fromMany = fromMany;
        function isCodeblock(thing) {
            return thing && typeof thing === 'object'
                && typeof thing.language === 'string'
                && typeof thing.value === 'string';
        }
        function from(markup) {
            let res;
            if (isCodeblock(markup)) {
                const { language, value } = markup;
                res = { value: '```' + language + '\n' + value + '\n```\n' };
            }
            else if (types.MarkdownString.isMarkdownString(markup)) {
                res = { value: markup.value, isTrusted: markup.isTrusted, supportThemeIcons: markup.supportThemeIcons };
            }
            else if (typeof markup === 'string') {
                res = { value: markup };
            }
            else {
                res = { value: '' };
            }
            // extract uris into a separate object
            const resUris = Object.create(null);
            res.uris = resUris;
            const collectUri = (href) => {
                try {
                    let uri = uri_1.URI.parse(href, true);
                    uri = uri.with({ query: _uriMassage(uri.query, resUris) });
                    resUris[href] = uri;
                }
                catch (e) {
                    // ignore
                }
                return '';
            };
            const renderer = new marked.Renderer();
            renderer.link = collectUri;
            renderer.image = href => collectUri(htmlContent.parseHrefAndDimensions(href).href);
            marked(res.value, { renderer });
            return res;
        }
        MarkdownString.from = from;
        function _uriMassage(part, bucket) {
            if (!part) {
                return part;
            }
            let data;
            try {
                data = (0, marshalling_1.parse)(part);
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            let changed = false;
            data = (0, objects_1.cloneAndChange)(data, value => {
                if (uri_1.URI.isUri(value)) {
                    const key = `__uri_${Math.random().toString(16).slice(2, 8)}`;
                    bucket[key] = value;
                    changed = true;
                    return key;
                }
                else {
                    return undefined;
                }
            });
            if (!changed) {
                return part;
            }
            return JSON.stringify(data);
        }
        function to(value) {
            const result = new types.MarkdownString(value.value, value.supportThemeIcons);
            result.isTrusted = value.isTrusted;
            return result;
        }
        MarkdownString.to = to;
        function fromStrict(value) {
            if (!value) {
                return undefined;
            }
            return typeof value === 'string' ? value : MarkdownString.from(value);
        }
        MarkdownString.fromStrict = fromStrict;
    })(MarkdownString = exports.MarkdownString || (exports.MarkdownString = {}));
    function fromRangeOrRangeWithMessage(ranges) {
        if (isDecorationOptionsArr(ranges)) {
            return ranges.map((r) => {
                return {
                    range: Range.from(r.range),
                    hoverMessage: Array.isArray(r.hoverMessage)
                        ? MarkdownString.fromMany(r.hoverMessage)
                        : (r.hoverMessage ? MarkdownString.from(r.hoverMessage) : undefined),
                    renderOptions: r.renderOptions
                };
            });
        }
        else {
            return ranges.map((r) => {
                return {
                    range: Range.from(r)
                };
            });
        }
    }
    exports.fromRangeOrRangeWithMessage = fromRangeOrRangeWithMessage;
    function pathOrURIToURI(value) {
        if (typeof value === 'undefined') {
            return value;
        }
        if (typeof value === 'string') {
            return uri_1.URI.file(value);
        }
        else {
            return value;
        }
    }
    exports.pathOrURIToURI = pathOrURIToURI;
    var ThemableDecorationAttachmentRenderOptions;
    (function (ThemableDecorationAttachmentRenderOptions) {
        function from(options) {
            if (typeof options === 'undefined') {
                return options;
            }
            return {
                contentText: options.contentText,
                contentIconPath: options.contentIconPath ? pathOrURIToURI(options.contentIconPath) : undefined,
                border: options.border,
                borderColor: options.borderColor,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                color: options.color,
                backgroundColor: options.backgroundColor,
                margin: options.margin,
                width: options.width,
                height: options.height,
            };
        }
        ThemableDecorationAttachmentRenderOptions.from = from;
    })(ThemableDecorationAttachmentRenderOptions = exports.ThemableDecorationAttachmentRenderOptions || (exports.ThemableDecorationAttachmentRenderOptions = {}));
    var ThemableDecorationRenderOptions;
    (function (ThemableDecorationRenderOptions) {
        function from(options) {
            if (typeof options === 'undefined') {
                return options;
            }
            return {
                backgroundColor: options.backgroundColor,
                outline: options.outline,
                outlineColor: options.outlineColor,
                outlineStyle: options.outlineStyle,
                outlineWidth: options.outlineWidth,
                border: options.border,
                borderColor: options.borderColor,
                borderRadius: options.borderRadius,
                borderSpacing: options.borderSpacing,
                borderStyle: options.borderStyle,
                borderWidth: options.borderWidth,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                cursor: options.cursor,
                color: options.color,
                opacity: options.opacity,
                letterSpacing: options.letterSpacing,
                gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : undefined,
                gutterIconSize: options.gutterIconSize,
                overviewRulerColor: options.overviewRulerColor,
                before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : undefined,
                after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : undefined,
            };
        }
        ThemableDecorationRenderOptions.from = from;
    })(ThemableDecorationRenderOptions = exports.ThemableDecorationRenderOptions || (exports.ThemableDecorationRenderOptions = {}));
    var DecorationRangeBehavior;
    (function (DecorationRangeBehavior) {
        function from(value) {
            if (typeof value === 'undefined') {
                return value;
            }
            switch (value) {
                case types.DecorationRangeBehavior.OpenOpen:
                    return 0 /* AlwaysGrowsWhenTypingAtEdges */;
                case types.DecorationRangeBehavior.ClosedClosed:
                    return 1 /* NeverGrowsWhenTypingAtEdges */;
                case types.DecorationRangeBehavior.OpenClosed:
                    return 2 /* GrowsOnlyWhenTypingBefore */;
                case types.DecorationRangeBehavior.ClosedOpen:
                    return 3 /* GrowsOnlyWhenTypingAfter */;
            }
        }
        DecorationRangeBehavior.from = from;
    })(DecorationRangeBehavior = exports.DecorationRangeBehavior || (exports.DecorationRangeBehavior = {}));
    var DecorationRenderOptions;
    (function (DecorationRenderOptions) {
        function from(options) {
            return {
                isWholeLine: options.isWholeLine,
                rangeBehavior: options.rangeBehavior ? DecorationRangeBehavior.from(options.rangeBehavior) : undefined,
                overviewRulerLane: options.overviewRulerLane,
                light: options.light ? ThemableDecorationRenderOptions.from(options.light) : undefined,
                dark: options.dark ? ThemableDecorationRenderOptions.from(options.dark) : undefined,
                backgroundColor: options.backgroundColor,
                outline: options.outline,
                outlineColor: options.outlineColor,
                outlineStyle: options.outlineStyle,
                outlineWidth: options.outlineWidth,
                border: options.border,
                borderColor: options.borderColor,
                borderRadius: options.borderRadius,
                borderSpacing: options.borderSpacing,
                borderStyle: options.borderStyle,
                borderWidth: options.borderWidth,
                fontStyle: options.fontStyle,
                fontWeight: options.fontWeight,
                textDecoration: options.textDecoration,
                cursor: options.cursor,
                color: options.color,
                opacity: options.opacity,
                letterSpacing: options.letterSpacing,
                gutterIconPath: options.gutterIconPath ? pathOrURIToURI(options.gutterIconPath) : undefined,
                gutterIconSize: options.gutterIconSize,
                overviewRulerColor: options.overviewRulerColor,
                before: options.before ? ThemableDecorationAttachmentRenderOptions.from(options.before) : undefined,
                after: options.after ? ThemableDecorationAttachmentRenderOptions.from(options.after) : undefined,
            };
        }
        DecorationRenderOptions.from = from;
    })(DecorationRenderOptions = exports.DecorationRenderOptions || (exports.DecorationRenderOptions = {}));
    var TextEdit;
    (function (TextEdit) {
        function from(edit) {
            return {
                text: edit.newText,
                eol: edit.newEol && EndOfLine.from(edit.newEol),
                range: Range.from(edit.range)
            };
        }
        TextEdit.from = from;
        function to(edit) {
            const result = new types.TextEdit(Range.to(edit.range), edit.text);
            result.newEol = (typeof edit.eol === 'undefined' ? undefined : EndOfLine.to(edit.eol));
            return result;
        }
        TextEdit.to = to;
    })(TextEdit = exports.TextEdit || (exports.TextEdit = {}));
    var WorkspaceEdit;
    (function (WorkspaceEdit) {
        function from(value, documents, extHostNotebooks) {
            var _a, _b, _c;
            const result = {
                edits: []
            };
            if (value instanceof types.WorkspaceEdit) {
                for (let entry of value._allEntries()) {
                    if (entry._type === 1 /* File */) {
                        // file operation
                        result.edits.push({
                            _type: 1 /* File */,
                            oldUri: entry.from,
                            newUri: entry.to,
                            options: entry.options,
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 2 /* Text */) {
                        // text edits
                        const doc = documents === null || documents === void 0 ? void 0 : documents.getDocument(entry.uri);
                        result.edits.push({
                            _type: 2 /* Text */,
                            resource: entry.uri,
                            edit: TextEdit.from(entry.edit),
                            modelVersionId: doc === null || doc === void 0 ? void 0 : doc.version,
                            metadata: entry.metadata
                        });
                    }
                    else if (entry._type === 3 /* Cell */) {
                        result.edits.push({
                            _type: 3 /* Cell */,
                            metadata: entry.metadata,
                            resource: entry.uri,
                            edit: entry.edit,
                            notebookMetadata: entry.notebookMetadata,
                            notebookVersionId: (_a = extHostNotebooks === null || extHostNotebooks === void 0 ? void 0 : extHostNotebooks.lookupNotebookDocument(entry.uri)) === null || _a === void 0 ? void 0 : _a.apiNotebook.version
                        });
                    }
                    else if (entry._type === 4 /* CellOutput */) {
                        if (entry.newOutputs) {
                            result.edits.push({
                                _type: 3 /* Cell */,
                                metadata: entry.metadata,
                                resource: entry.uri,
                                edit: {
                                    editType: 2 /* Output */,
                                    index: entry.index,
                                    append: entry.append,
                                    outputs: entry.newOutputs.map(NotebookCellOutput.from)
                                }
                            });
                        }
                        // todo@joh merge metadata and output edit?
                        if (entry.newMetadata) {
                            result.edits.push({
                                _type: 3 /* Cell */,
                                metadata: entry.metadata,
                                resource: entry.uri,
                                edit: {
                                    editType: 8 /* PartialMetadata */,
                                    index: entry.index,
                                    metadata: entry.newMetadata
                                }
                            });
                        }
                    }
                    else if (entry._type === 5 /* CellReplace */) {
                        result.edits.push({
                            _type: 3 /* Cell */,
                            metadata: entry.metadata,
                            resource: entry.uri,
                            notebookVersionId: (_b = extHostNotebooks === null || extHostNotebooks === void 0 ? void 0 : extHostNotebooks.lookupNotebookDocument(entry.uri)) === null || _b === void 0 ? void 0 : _b.apiNotebook.version,
                            edit: {
                                editType: 1 /* Replace */,
                                index: entry.index,
                                count: entry.count,
                                cells: entry.cells.map(NotebookCellData.from)
                            }
                        });
                    }
                    else if (entry._type === 6 /* CellOutputItem */) {
                        result.edits.push({
                            _type: 3 /* Cell */,
                            metadata: entry.metadata,
                            resource: entry.uri,
                            edit: {
                                editType: 7 /* OutputItems */,
                                outputId: entry.outputId,
                                items: ((_c = entry.newOutputItems) === null || _c === void 0 ? void 0 : _c.map(NotebookCellOutputItem.from)) || [],
                                append: entry.append
                            }
                        });
                    }
                }
            }
            return result;
        }
        WorkspaceEdit.from = from;
        function to(value) {
            const result = new types.WorkspaceEdit();
            for (const edit of value.edits) {
                if (edit.edit) {
                    result.replace(uri_1.URI.revive(edit.resource), Range.to(edit.edit.range), edit.edit.text);
                }
                else {
                    result.renameFile(uri_1.URI.revive(edit.oldUri), uri_1.URI.revive(edit.newUri), edit.options);
                }
            }
            return result;
        }
        WorkspaceEdit.to = to;
    })(WorkspaceEdit = exports.WorkspaceEdit || (exports.WorkspaceEdit = {}));
    var SymbolKind;
    (function (SymbolKind) {
        const _fromMapping = Object.create(null);
        _fromMapping[types.SymbolKind.File] = 0 /* File */;
        _fromMapping[types.SymbolKind.Module] = 1 /* Module */;
        _fromMapping[types.SymbolKind.Namespace] = 2 /* Namespace */;
        _fromMapping[types.SymbolKind.Package] = 3 /* Package */;
        _fromMapping[types.SymbolKind.Class] = 4 /* Class */;
        _fromMapping[types.SymbolKind.Method] = 5 /* Method */;
        _fromMapping[types.SymbolKind.Property] = 6 /* Property */;
        _fromMapping[types.SymbolKind.Field] = 7 /* Field */;
        _fromMapping[types.SymbolKind.Constructor] = 8 /* Constructor */;
        _fromMapping[types.SymbolKind.Enum] = 9 /* Enum */;
        _fromMapping[types.SymbolKind.Interface] = 10 /* Interface */;
        _fromMapping[types.SymbolKind.Function] = 11 /* Function */;
        _fromMapping[types.SymbolKind.Variable] = 12 /* Variable */;
        _fromMapping[types.SymbolKind.Constant] = 13 /* Constant */;
        _fromMapping[types.SymbolKind.String] = 14 /* String */;
        _fromMapping[types.SymbolKind.Number] = 15 /* Number */;
        _fromMapping[types.SymbolKind.Boolean] = 16 /* Boolean */;
        _fromMapping[types.SymbolKind.Array] = 17 /* Array */;
        _fromMapping[types.SymbolKind.Object] = 18 /* Object */;
        _fromMapping[types.SymbolKind.Key] = 19 /* Key */;
        _fromMapping[types.SymbolKind.Null] = 20 /* Null */;
        _fromMapping[types.SymbolKind.EnumMember] = 21 /* EnumMember */;
        _fromMapping[types.SymbolKind.Struct] = 22 /* Struct */;
        _fromMapping[types.SymbolKind.Event] = 23 /* Event */;
        _fromMapping[types.SymbolKind.Operator] = 24 /* Operator */;
        _fromMapping[types.SymbolKind.TypeParameter] = 25 /* TypeParameter */;
        function from(kind) {
            return typeof _fromMapping[kind] === 'number' ? _fromMapping[kind] : 6 /* Property */;
        }
        SymbolKind.from = from;
        function to(kind) {
            for (const k in _fromMapping) {
                if (_fromMapping[k] === kind) {
                    return Number(k);
                }
            }
            return types.SymbolKind.Property;
        }
        SymbolKind.to = to;
    })(SymbolKind = exports.SymbolKind || (exports.SymbolKind = {}));
    var SymbolTag;
    (function (SymbolTag) {
        function from(kind) {
            switch (kind) {
                case types.SymbolTag.Deprecated: return 1 /* Deprecated */;
            }
        }
        SymbolTag.from = from;
        function to(kind) {
            switch (kind) {
                case 1 /* Deprecated */: return types.SymbolTag.Deprecated;
            }
        }
        SymbolTag.to = to;
    })(SymbolTag = exports.SymbolTag || (exports.SymbolTag = {}));
    var WorkspaceSymbol;
    (function (WorkspaceSymbol) {
        function from(info) {
            return {
                name: info.name,
                kind: SymbolKind.from(info.kind),
                tags: info.tags && info.tags.map(SymbolTag.from),
                containerName: info.containerName,
                location: location.from(info.location)
            };
        }
        WorkspaceSymbol.from = from;
        function to(info) {
            const result = new types.SymbolInformation(info.name, SymbolKind.to(info.kind), info.containerName, location.to(info.location));
            result.tags = info.tags && info.tags.map(SymbolTag.to);
            return result;
        }
        WorkspaceSymbol.to = to;
    })(WorkspaceSymbol = exports.WorkspaceSymbol || (exports.WorkspaceSymbol = {}));
    var DocumentSymbol;
    (function (DocumentSymbol) {
        function from(info) {
            var _a, _b;
            const result = {
                name: info.name || '!!MISSING: name!!',
                detail: info.detail,
                range: Range.from(info.range),
                selectionRange: Range.from(info.selectionRange),
                kind: SymbolKind.from(info.kind),
                tags: (_b = (_a = info.tags) === null || _a === void 0 ? void 0 : _a.map(SymbolTag.from)) !== null && _b !== void 0 ? _b : []
            };
            if (info.children) {
                result.children = info.children.map(from);
            }
            return result;
        }
        DocumentSymbol.from = from;
        function to(info) {
            const result = new types.DocumentSymbol(info.name, info.detail, SymbolKind.to(info.kind), Range.to(info.range), Range.to(info.selectionRange));
            if ((0, arrays_1.isNonEmptyArray)(info.tags)) {
                result.tags = info.tags.map(SymbolTag.to);
            }
            if (info.children) {
                result.children = info.children.map(to);
            }
            return result;
        }
        DocumentSymbol.to = to;
    })(DocumentSymbol = exports.DocumentSymbol || (exports.DocumentSymbol = {}));
    var CallHierarchyItem;
    (function (CallHierarchyItem) {
        function to(item) {
            const result = new types.CallHierarchyItem(SymbolKind.to(item.kind), item.name, item.detail || '', uri_1.URI.revive(item.uri), Range.to(item.range), Range.to(item.selectionRange));
            result._sessionId = item._sessionId;
            result._itemId = item._itemId;
            return result;
        }
        CallHierarchyItem.to = to;
    })(CallHierarchyItem = exports.CallHierarchyItem || (exports.CallHierarchyItem = {}));
    var CallHierarchyIncomingCall;
    (function (CallHierarchyIncomingCall) {
        function to(item) {
            return new types.CallHierarchyIncomingCall(CallHierarchyItem.to(item.from), item.fromRanges.map(r => Range.to(r)));
        }
        CallHierarchyIncomingCall.to = to;
    })(CallHierarchyIncomingCall = exports.CallHierarchyIncomingCall || (exports.CallHierarchyIncomingCall = {}));
    var CallHierarchyOutgoingCall;
    (function (CallHierarchyOutgoingCall) {
        function to(item) {
            return new types.CallHierarchyOutgoingCall(CallHierarchyItem.to(item.to), item.fromRanges.map(r => Range.to(r)));
        }
        CallHierarchyOutgoingCall.to = to;
    })(CallHierarchyOutgoingCall = exports.CallHierarchyOutgoingCall || (exports.CallHierarchyOutgoingCall = {}));
    var location;
    (function (location) {
        function from(value) {
            return {
                range: value.range && Range.from(value.range),
                uri: value.uri
            };
        }
        location.from = from;
        function to(value) {
            return new types.Location(uri_1.URI.revive(value.uri), Range.to(value.range));
        }
        location.to = to;
    })(location = exports.location || (exports.location = {}));
    var DefinitionLink;
    (function (DefinitionLink) {
        function from(value) {
            const definitionLink = value;
            const location = value;
            return {
                originSelectionRange: definitionLink.originSelectionRange
                    ? Range.from(definitionLink.originSelectionRange)
                    : undefined,
                uri: definitionLink.targetUri ? definitionLink.targetUri : location.uri,
                range: Range.from(definitionLink.targetRange ? definitionLink.targetRange : location.range),
                targetSelectionRange: definitionLink.targetSelectionRange
                    ? Range.from(definitionLink.targetSelectionRange)
                    : undefined,
            };
        }
        DefinitionLink.from = from;
        function to(value) {
            return {
                targetUri: uri_1.URI.revive(value.uri),
                targetRange: Range.to(value.range),
                targetSelectionRange: value.targetSelectionRange
                    ? Range.to(value.targetSelectionRange)
                    : undefined,
                originSelectionRange: value.originSelectionRange
                    ? Range.to(value.originSelectionRange)
                    : undefined
            };
        }
        DefinitionLink.to = to;
    })(DefinitionLink = exports.DefinitionLink || (exports.DefinitionLink = {}));
    var Hover;
    (function (Hover) {
        function from(hover) {
            return {
                range: Range.from(hover.range),
                contents: MarkdownString.fromMany(hover.contents)
            };
        }
        Hover.from = from;
        function to(info) {
            return new types.Hover(info.contents.map(MarkdownString.to), Range.to(info.range));
        }
        Hover.to = to;
    })(Hover = exports.Hover || (exports.Hover = {}));
    var EvaluatableExpression;
    (function (EvaluatableExpression) {
        function from(expression) {
            return {
                range: Range.from(expression.range),
                expression: expression.expression
            };
        }
        EvaluatableExpression.from = from;
        function to(info) {
            return new types.EvaluatableExpression(Range.to(info.range), info.expression);
        }
        EvaluatableExpression.to = to;
    })(EvaluatableExpression = exports.EvaluatableExpression || (exports.EvaluatableExpression = {}));
    var InlineValue;
    (function (InlineValue) {
        function from(inlineValue) {
            if (inlineValue instanceof types.InlineValueText) {
                return {
                    type: 'text',
                    range: Range.from(inlineValue.range),
                    text: inlineValue.text
                };
            }
            else if (inlineValue instanceof types.InlineValueVariableLookup) {
                return {
                    type: 'variable',
                    range: Range.from(inlineValue.range),
                    variableName: inlineValue.variableName,
                    caseSensitiveLookup: inlineValue.caseSensitiveLookup
                };
            }
            else if (inlineValue instanceof types.InlineValueEvaluatableExpression) {
                return {
                    type: 'expression',
                    range: Range.from(inlineValue.range),
                    expression: inlineValue.expression
                };
            }
            else {
                throw new Error(`Unknown 'InlineValue' type`);
            }
        }
        InlineValue.from = from;
        function to(inlineValue) {
            switch (inlineValue.type) {
                case 'text':
                    return {
                        range: Range.to(inlineValue.range),
                        text: inlineValue.text
                    };
                case 'variable':
                    return {
                        range: Range.to(inlineValue.range),
                        variableName: inlineValue.variableName,
                        caseSensitiveLookup: inlineValue.caseSensitiveLookup
                    };
                case 'expression':
                    return {
                        range: Range.to(inlineValue.range),
                        expression: inlineValue.expression
                    };
            }
        }
        InlineValue.to = to;
    })(InlineValue = exports.InlineValue || (exports.InlineValue = {}));
    var InlineValueContext;
    (function (InlineValueContext) {
        function from(inlineValueContext) {
            return {
                frameId: inlineValueContext.frameId,
                stoppedLocation: Range.from(inlineValueContext.stoppedLocation)
            };
        }
        InlineValueContext.from = from;
        function to(inlineValueContext) {
            return new types.InlineValueContext(inlineValueContext.frameId, Range.to(inlineValueContext.stoppedLocation));
        }
        InlineValueContext.to = to;
    })(InlineValueContext = exports.InlineValueContext || (exports.InlineValueContext = {}));
    var DocumentHighlight;
    (function (DocumentHighlight) {
        function from(documentHighlight) {
            return {
                range: Range.from(documentHighlight.range),
                kind: documentHighlight.kind
            };
        }
        DocumentHighlight.from = from;
        function to(occurrence) {
            return new types.DocumentHighlight(Range.to(occurrence.range), occurrence.kind);
        }
        DocumentHighlight.to = to;
    })(DocumentHighlight = exports.DocumentHighlight || (exports.DocumentHighlight = {}));
    var CompletionTriggerKind;
    (function (CompletionTriggerKind) {
        function to(kind) {
            switch (kind) {
                case 1 /* TriggerCharacter */:
                    return types.CompletionTriggerKind.TriggerCharacter;
                case 2 /* TriggerForIncompleteCompletions */:
                    return types.CompletionTriggerKind.TriggerForIncompleteCompletions;
                case 0 /* Invoke */:
                default:
                    return types.CompletionTriggerKind.Invoke;
            }
        }
        CompletionTriggerKind.to = to;
    })(CompletionTriggerKind = exports.CompletionTriggerKind || (exports.CompletionTriggerKind = {}));
    var CompletionContext;
    (function (CompletionContext) {
        function to(context) {
            return {
                triggerKind: CompletionTriggerKind.to(context.triggerKind),
                triggerCharacter: context.triggerCharacter
            };
        }
        CompletionContext.to = to;
    })(CompletionContext = exports.CompletionContext || (exports.CompletionContext = {}));
    var CompletionItemTag;
    (function (CompletionItemTag) {
        function from(kind) {
            switch (kind) {
                case types.CompletionItemTag.Deprecated: return 1 /* Deprecated */;
            }
        }
        CompletionItemTag.from = from;
        function to(kind) {
            switch (kind) {
                case 1 /* Deprecated */: return types.CompletionItemTag.Deprecated;
            }
        }
        CompletionItemTag.to = to;
    })(CompletionItemTag = exports.CompletionItemTag || (exports.CompletionItemTag = {}));
    var CompletionItemKind;
    (function (CompletionItemKind) {
        const _from = new Map([
            [types.CompletionItemKind.Method, 0 /* Method */],
            [types.CompletionItemKind.Function, 1 /* Function */],
            [types.CompletionItemKind.Constructor, 2 /* Constructor */],
            [types.CompletionItemKind.Field, 3 /* Field */],
            [types.CompletionItemKind.Variable, 4 /* Variable */],
            [types.CompletionItemKind.Class, 5 /* Class */],
            [types.CompletionItemKind.Interface, 7 /* Interface */],
            [types.CompletionItemKind.Struct, 6 /* Struct */],
            [types.CompletionItemKind.Module, 8 /* Module */],
            [types.CompletionItemKind.Property, 9 /* Property */],
            [types.CompletionItemKind.Unit, 12 /* Unit */],
            [types.CompletionItemKind.Value, 13 /* Value */],
            [types.CompletionItemKind.Constant, 14 /* Constant */],
            [types.CompletionItemKind.Enum, 15 /* Enum */],
            [types.CompletionItemKind.EnumMember, 16 /* EnumMember */],
            [types.CompletionItemKind.Keyword, 17 /* Keyword */],
            [types.CompletionItemKind.Snippet, 27 /* Snippet */],
            [types.CompletionItemKind.Text, 18 /* Text */],
            [types.CompletionItemKind.Color, 19 /* Color */],
            [types.CompletionItemKind.File, 20 /* File */],
            [types.CompletionItemKind.Reference, 21 /* Reference */],
            [types.CompletionItemKind.Folder, 23 /* Folder */],
            [types.CompletionItemKind.Event, 10 /* Event */],
            [types.CompletionItemKind.Operator, 11 /* Operator */],
            [types.CompletionItemKind.TypeParameter, 24 /* TypeParameter */],
            [types.CompletionItemKind.Issue, 26 /* Issue */],
            [types.CompletionItemKind.User, 25 /* User */],
        ]);
        function from(kind) {
            var _a;
            return (_a = _from.get(kind)) !== null && _a !== void 0 ? _a : 9 /* Property */;
        }
        CompletionItemKind.from = from;
        const _to = new Map([
            [0 /* Method */, types.CompletionItemKind.Method],
            [1 /* Function */, types.CompletionItemKind.Function],
            [2 /* Constructor */, types.CompletionItemKind.Constructor],
            [3 /* Field */, types.CompletionItemKind.Field],
            [4 /* Variable */, types.CompletionItemKind.Variable],
            [5 /* Class */, types.CompletionItemKind.Class],
            [7 /* Interface */, types.CompletionItemKind.Interface],
            [6 /* Struct */, types.CompletionItemKind.Struct],
            [8 /* Module */, types.CompletionItemKind.Module],
            [9 /* Property */, types.CompletionItemKind.Property],
            [12 /* Unit */, types.CompletionItemKind.Unit],
            [13 /* Value */, types.CompletionItemKind.Value],
            [14 /* Constant */, types.CompletionItemKind.Constant],
            [15 /* Enum */, types.CompletionItemKind.Enum],
            [16 /* EnumMember */, types.CompletionItemKind.EnumMember],
            [17 /* Keyword */, types.CompletionItemKind.Keyword],
            [27 /* Snippet */, types.CompletionItemKind.Snippet],
            [18 /* Text */, types.CompletionItemKind.Text],
            [19 /* Color */, types.CompletionItemKind.Color],
            [20 /* File */, types.CompletionItemKind.File],
            [21 /* Reference */, types.CompletionItemKind.Reference],
            [23 /* Folder */, types.CompletionItemKind.Folder],
            [10 /* Event */, types.CompletionItemKind.Event],
            [11 /* Operator */, types.CompletionItemKind.Operator],
            [24 /* TypeParameter */, types.CompletionItemKind.TypeParameter],
            [25 /* User */, types.CompletionItemKind.User],
            [26 /* Issue */, types.CompletionItemKind.Issue],
        ]);
        function to(kind) {
            var _a;
            return (_a = _to.get(kind)) !== null && _a !== void 0 ? _a : types.CompletionItemKind.Property;
        }
        CompletionItemKind.to = to;
    })(CompletionItemKind = exports.CompletionItemKind || (exports.CompletionItemKind = {}));
    var CompletionItem;
    (function (CompletionItem) {
        function to(suggestion, converter) {
            var _a;
            const result = new types.CompletionItem(typeof suggestion.label === 'string' ? suggestion.label : suggestion.label.name);
            if (typeof suggestion.label !== 'string') {
                result.label2 = suggestion.label;
            }
            result.insertText = suggestion.insertText;
            result.kind = CompletionItemKind.to(suggestion.kind);
            result.tags = (_a = suggestion.tags) === null || _a === void 0 ? void 0 : _a.map(CompletionItemTag.to);
            result.detail = suggestion.detail;
            result.documentation = htmlContent.isMarkdownString(suggestion.documentation) ? MarkdownString.to(suggestion.documentation) : suggestion.documentation;
            result.sortText = suggestion.sortText;
            result.filterText = suggestion.filterText;
            result.preselect = suggestion.preselect;
            result.commitCharacters = suggestion.commitCharacters;
            // range
            if (editorRange.Range.isIRange(suggestion.range)) {
                result.range = Range.to(suggestion.range);
            }
            else if (typeof suggestion.range === 'object') {
                result.range = { inserting: Range.to(suggestion.range.insert), replacing: Range.to(suggestion.range.replace) };
            }
            result.keepWhitespace = typeof suggestion.insertTextRules === 'undefined' ? false : Boolean(suggestion.insertTextRules & 1 /* KeepWhitespace */);
            // 'insertText'-logic
            if (typeof suggestion.insertTextRules !== 'undefined' && suggestion.insertTextRules & 4 /* InsertAsSnippet */) {
                result.insertText = new types.SnippetString(suggestion.insertText);
            }
            else {
                result.insertText = suggestion.insertText;
                result.textEdit = result.range instanceof types.Range ? new types.TextEdit(result.range, result.insertText) : undefined;
            }
            if (suggestion.additionalTextEdits && suggestion.additionalTextEdits.length > 0) {
                result.additionalTextEdits = suggestion.additionalTextEdits.map(e => TextEdit.to(e));
            }
            result.command = converter && suggestion.command ? converter.fromInternal(suggestion.command) : undefined;
            return result;
        }
        CompletionItem.to = to;
    })(CompletionItem = exports.CompletionItem || (exports.CompletionItem = {}));
    var ParameterInformation;
    (function (ParameterInformation) {
        function from(info) {
            return {
                label: info.label,
                documentation: info.documentation ? MarkdownString.fromStrict(info.documentation) : undefined
            };
        }
        ParameterInformation.from = from;
        function to(info) {
            return {
                label: info.label,
                documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation
            };
        }
        ParameterInformation.to = to;
    })(ParameterInformation = exports.ParameterInformation || (exports.ParameterInformation = {}));
    var SignatureInformation;
    (function (SignatureInformation) {
        function from(info) {
            return {
                label: info.label,
                documentation: info.documentation ? MarkdownString.fromStrict(info.documentation) : undefined,
                parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.from) : [],
                activeParameter: info.activeParameter,
            };
        }
        SignatureInformation.from = from;
        function to(info) {
            return {
                label: info.label,
                documentation: htmlContent.isMarkdownString(info.documentation) ? MarkdownString.to(info.documentation) : info.documentation,
                parameters: Array.isArray(info.parameters) ? info.parameters.map(ParameterInformation.to) : [],
                activeParameter: info.activeParameter,
            };
        }
        SignatureInformation.to = to;
    })(SignatureInformation = exports.SignatureInformation || (exports.SignatureInformation = {}));
    var SignatureHelp;
    (function (SignatureHelp) {
        function from(help) {
            return {
                activeSignature: help.activeSignature,
                activeParameter: help.activeParameter,
                signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.from) : [],
            };
        }
        SignatureHelp.from = from;
        function to(help) {
            return {
                activeSignature: help.activeSignature,
                activeParameter: help.activeParameter,
                signatures: Array.isArray(help.signatures) ? help.signatures.map(SignatureInformation.to) : [],
            };
        }
        SignatureHelp.to = to;
    })(SignatureHelp = exports.SignatureHelp || (exports.SignatureHelp = {}));
    var InlineHint;
    (function (InlineHint) {
        function from(hint) {
            var _a;
            return {
                text: hint.text,
                range: Range.from(hint.range),
                kind: InlineHintKind.from((_a = hint.kind) !== null && _a !== void 0 ? _a : types.InlineHintKind.Other),
                description: hint.description && MarkdownString.fromStrict(hint.description),
                whitespaceBefore: hint.whitespaceBefore,
                whitespaceAfter: hint.whitespaceAfter
            };
        }
        InlineHint.from = from;
        function to(hint) {
            const res = new types.InlineHint(hint.text, Range.to(hint.range), InlineHintKind.to(hint.kind));
            res.whitespaceAfter = hint.whitespaceAfter;
            res.whitespaceBefore = hint.whitespaceBefore;
            res.description = htmlContent.isMarkdownString(hint.description) ? MarkdownString.to(hint.description) : hint.description;
            return res;
        }
        InlineHint.to = to;
    })(InlineHint = exports.InlineHint || (exports.InlineHint = {}));
    var InlineHintKind;
    (function (InlineHintKind) {
        function from(kind) {
            return kind;
        }
        InlineHintKind.from = from;
        function to(kind) {
            return kind;
        }
        InlineHintKind.to = to;
    })(InlineHintKind = exports.InlineHintKind || (exports.InlineHintKind = {}));
    var DocumentLink;
    (function (DocumentLink) {
        function from(link) {
            return {
                range: Range.from(link.range),
                url: link.target,
                tooltip: link.tooltip
            };
        }
        DocumentLink.from = from;
        function to(link) {
            let target = undefined;
            if (link.url) {
                try {
                    target = typeof link.url === 'string' ? uri_1.URI.parse(link.url, true) : uri_1.URI.revive(link.url);
                }
                catch (err) {
                    // ignore
                }
            }
            return new types.DocumentLink(Range.to(link.range), target);
        }
        DocumentLink.to = to;
    })(DocumentLink = exports.DocumentLink || (exports.DocumentLink = {}));
    var ColorPresentation;
    (function (ColorPresentation) {
        function to(colorPresentation) {
            const cp = new types.ColorPresentation(colorPresentation.label);
            if (colorPresentation.textEdit) {
                cp.textEdit = TextEdit.to(colorPresentation.textEdit);
            }
            if (colorPresentation.additionalTextEdits) {
                cp.additionalTextEdits = colorPresentation.additionalTextEdits.map(value => TextEdit.to(value));
            }
            return cp;
        }
        ColorPresentation.to = to;
        function from(colorPresentation) {
            return {
                label: colorPresentation.label,
                textEdit: colorPresentation.textEdit ? TextEdit.from(colorPresentation.textEdit) : undefined,
                additionalTextEdits: colorPresentation.additionalTextEdits ? colorPresentation.additionalTextEdits.map(value => TextEdit.from(value)) : undefined
            };
        }
        ColorPresentation.from = from;
    })(ColorPresentation = exports.ColorPresentation || (exports.ColorPresentation = {}));
    var Color;
    (function (Color) {
        function to(c) {
            return new types.Color(c[0], c[1], c[2], c[3]);
        }
        Color.to = to;
        function from(color) {
            return [color.red, color.green, color.blue, color.alpha];
        }
        Color.from = from;
    })(Color = exports.Color || (exports.Color = {}));
    var SelectionRange;
    (function (SelectionRange) {
        function from(obj) {
            return { range: Range.from(obj.range) };
        }
        SelectionRange.from = from;
        function to(obj) {
            return new types.SelectionRange(Range.to(obj.range));
        }
        SelectionRange.to = to;
    })(SelectionRange = exports.SelectionRange || (exports.SelectionRange = {}));
    var TextDocumentSaveReason;
    (function (TextDocumentSaveReason) {
        function to(reason) {
            switch (reason) {
                case 2 /* AUTO */:
                    return types.TextDocumentSaveReason.AfterDelay;
                case 1 /* EXPLICIT */:
                    return types.TextDocumentSaveReason.Manual;
                case 3 /* FOCUS_CHANGE */:
                case 4 /* WINDOW_CHANGE */:
                    return types.TextDocumentSaveReason.FocusOut;
            }
        }
        TextDocumentSaveReason.to = to;
    })(TextDocumentSaveReason = exports.TextDocumentSaveReason || (exports.TextDocumentSaveReason = {}));
    var TextEditorLineNumbersStyle;
    (function (TextEditorLineNumbersStyle) {
        function from(style) {
            switch (style) {
                case types.TextEditorLineNumbersStyle.Off:
                    return 0 /* Off */;
                case types.TextEditorLineNumbersStyle.Relative:
                    return 2 /* Relative */;
                case types.TextEditorLineNumbersStyle.On:
                default:
                    return 1 /* On */;
            }
        }
        TextEditorLineNumbersStyle.from = from;
        function to(style) {
            switch (style) {
                case 0 /* Off */:
                    return types.TextEditorLineNumbersStyle.Off;
                case 2 /* Relative */:
                    return types.TextEditorLineNumbersStyle.Relative;
                case 1 /* On */:
                default:
                    return types.TextEditorLineNumbersStyle.On;
            }
        }
        TextEditorLineNumbersStyle.to = to;
    })(TextEditorLineNumbersStyle = exports.TextEditorLineNumbersStyle || (exports.TextEditorLineNumbersStyle = {}));
    var EndOfLine;
    (function (EndOfLine) {
        function from(eol) {
            if (eol === types.EndOfLine.CRLF) {
                return 1 /* CRLF */;
            }
            else if (eol === types.EndOfLine.LF) {
                return 0 /* LF */;
            }
            return undefined;
        }
        EndOfLine.from = from;
        function to(eol) {
            if (eol === 1 /* CRLF */) {
                return types.EndOfLine.CRLF;
            }
            else if (eol === 0 /* LF */) {
                return types.EndOfLine.LF;
            }
            return undefined;
        }
        EndOfLine.to = to;
    })(EndOfLine = exports.EndOfLine || (exports.EndOfLine = {}));
    var ProgressLocation;
    (function (ProgressLocation) {
        function from(loc) {
            if (typeof loc === 'object') {
                return loc.viewId;
            }
            switch (loc) {
                case types.ProgressLocation.SourceControl: return 3 /* Scm */;
                case types.ProgressLocation.Window: return 10 /* Window */;
                case types.ProgressLocation.Notification: return 15 /* Notification */;
            }
            throw new Error(`Unknown 'ProgressLocation'`);
        }
        ProgressLocation.from = from;
    })(ProgressLocation = exports.ProgressLocation || (exports.ProgressLocation = {}));
    var FoldingRange;
    (function (FoldingRange) {
        function from(r) {
            const range = { start: r.start + 1, end: r.end + 1 };
            if (r.kind) {
                range.kind = FoldingRangeKind.from(r.kind);
            }
            return range;
        }
        FoldingRange.from = from;
    })(FoldingRange = exports.FoldingRange || (exports.FoldingRange = {}));
    var FoldingRangeKind;
    (function (FoldingRangeKind) {
        function from(kind) {
            if (kind) {
                switch (kind) {
                    case types.FoldingRangeKind.Comment:
                        return modes.FoldingRangeKind.Comment;
                    case types.FoldingRangeKind.Imports:
                        return modes.FoldingRangeKind.Imports;
                    case types.FoldingRangeKind.Region:
                        return modes.FoldingRangeKind.Region;
                }
            }
            return undefined;
        }
        FoldingRangeKind.from = from;
    })(FoldingRangeKind = exports.FoldingRangeKind || (exports.FoldingRangeKind = {}));
    var TextEditorOpenOptions;
    (function (TextEditorOpenOptions) {
        function from(options) {
            if (options) {
                return {
                    pinned: typeof options.preview === 'boolean' ? !options.preview : undefined,
                    inactive: options.background,
                    preserveFocus: options.preserveFocus,
                    selection: typeof options.selection === 'object' ? Range.from(options.selection) : undefined,
                    override: typeof options.override === 'boolean' ? editor_1.EditorOverride.DISABLED : undefined
                };
            }
            return undefined;
        }
        TextEditorOpenOptions.from = from;
    })(TextEditorOpenOptions = exports.TextEditorOpenOptions || (exports.TextEditorOpenOptions = {}));
    var GlobPattern;
    (function (GlobPattern) {
        function from(pattern) {
            if (pattern instanceof types.RelativePattern) {
                return pattern;
            }
            if (typeof pattern === 'string') {
                return pattern;
            }
            if (isRelativePattern(pattern)) {
                return new types.RelativePattern(pattern.base, pattern.pattern);
            }
            return pattern; // preserve `undefined` and `null`
        }
        GlobPattern.from = from;
        function isRelativePattern(obj) {
            const rp = obj;
            return rp && typeof rp.base === 'string' && typeof rp.pattern === 'string';
        }
    })(GlobPattern = exports.GlobPattern || (exports.GlobPattern = {}));
    var LanguageSelector;
    (function (LanguageSelector) {
        function from(selector) {
            if (!selector) {
                return undefined;
            }
            else if (Array.isArray(selector)) {
                return selector.map(from);
            }
            else if (typeof selector === 'string') {
                return selector;
            }
            else {
                const filter = selector; // TODO: microsoft/TypeScript#42768
                return {
                    language: filter.language,
                    scheme: filter.scheme,
                    pattern: typeof filter.pattern === 'undefined' ? undefined : GlobPattern.from(filter.pattern),
                    exclusive: filter.exclusive
                };
            }
        }
        LanguageSelector.from = from;
    })(LanguageSelector = exports.LanguageSelector || (exports.LanguageSelector = {}));
    var NotebookRange;
    (function (NotebookRange) {
        function from(range) {
            return { start: range.start, end: range.end };
        }
        NotebookRange.from = from;
        function to(range) {
            return new types.NotebookRange(range.start, range.end);
        }
        NotebookRange.to = to;
    })(NotebookRange = exports.NotebookRange || (exports.NotebookRange = {}));
    var NotebookCellMetadata;
    (function (NotebookCellMetadata) {
        function to(data) {
            return new types.NotebookCellMetadata().with(Object.assign(Object.assign({}, data), {
                executionOrder: null,
                lastRunSuccess: null,
                runState: null,
                runStartTime: null,
                runStartTimeAdjustment: null,
                runEndTime: null
            }));
        }
        NotebookCellMetadata.to = to;
    })(NotebookCellMetadata = exports.NotebookCellMetadata || (exports.NotebookCellMetadata = {}));
    var NotebookDocumentMetadata;
    (function (NotebookDocumentMetadata) {
        function from(data) {
            return data;
        }
        NotebookDocumentMetadata.from = from;
        function to(data) {
            return new types.NotebookDocumentMetadata().with(data);
        }
        NotebookDocumentMetadata.to = to;
    })(NotebookDocumentMetadata = exports.NotebookDocumentMetadata || (exports.NotebookDocumentMetadata = {}));
    var NotebookCellPreviousExecutionResult;
    (function (NotebookCellPreviousExecutionResult) {
        function to(data) {
            return {
                startTime: data.runStartTime,
                endTime: data.runEndTime,
                executionOrder: data.executionOrder,
                success: data.lastRunSuccess
            };
        }
        NotebookCellPreviousExecutionResult.to = to;
        function from(data) {
            return {
                lastRunSuccess: data.success,
                runStartTime: data.startTime,
                runEndTime: data.endTime,
                executionOrder: data.executionOrder
            };
        }
        NotebookCellPreviousExecutionResult.from = from;
    })(NotebookCellPreviousExecutionResult = exports.NotebookCellPreviousExecutionResult || (exports.NotebookCellPreviousExecutionResult = {}));
    var NotebookCellKind;
    (function (NotebookCellKind) {
        function from(data) {
            switch (data) {
                case types.NotebookCellKind.Markdown:
                    return notebooks.CellKind.Markdown;
                case types.NotebookCellKind.Code:
                default:
                    return notebooks.CellKind.Code;
            }
        }
        NotebookCellKind.from = from;
        function to(data) {
            switch (data) {
                case notebooks.CellKind.Markdown:
                    return types.NotebookCellKind.Markdown;
                case notebooks.CellKind.Code:
                default:
                    return types.NotebookCellKind.Code;
            }
        }
        NotebookCellKind.to = to;
    })(NotebookCellKind = exports.NotebookCellKind || (exports.NotebookCellKind = {}));
    var NotebookCellData;
    (function (NotebookCellData) {
        function from(data) {
            var _a;
            return {
                cellKind: NotebookCellKind.from(data.kind),
                language: data.language,
                source: data.source,
                metadata: Object.assign(Object.assign({}, data.metadata), NotebookCellPreviousExecutionResult.from((_a = data.latestExecutionSummary) !== null && _a !== void 0 ? _a : {})),
                outputs: data.outputs ? data.outputs.map(NotebookCellOutput.from) : []
            };
        }
        NotebookCellData.from = from;
        function to(data) {
            return new types.NotebookCellData(NotebookCellKind.to(data.cellKind), data.source, data.language, data.outputs ? data.outputs.map(NotebookCellOutput.to) : undefined, data.metadata ? NotebookCellMetadata.to(data.metadata) : undefined);
        }
        NotebookCellData.to = to;
    })(NotebookCellData = exports.NotebookCellData || (exports.NotebookCellData = {}));
    var NotebookCellOutputItem;
    (function (NotebookCellOutputItem) {
        function from(item) {
            return {
                mime: item.mime,
                value: item.value,
                metadata: item.metadata
            };
        }
        NotebookCellOutputItem.from = from;
        function to(item) {
            return new types.NotebookCellOutputItem(item.mime, item.value, item.metadata);
        }
        NotebookCellOutputItem.to = to;
    })(NotebookCellOutputItem = exports.NotebookCellOutputItem || (exports.NotebookCellOutputItem = {}));
    var NotebookCellOutput;
    (function (NotebookCellOutput) {
        function from(output) {
            return {
                outputId: output.id,
                outputs: output.outputs.map(NotebookCellOutputItem.from),
                metadata: output.metadata
            };
        }
        NotebookCellOutput.from = from;
        function to(output) {
            const items = output.outputs.map(NotebookCellOutputItem.to);
            return new types.NotebookCellOutput(items, output.outputId, output.metadata);
        }
        NotebookCellOutput.to = to;
    })(NotebookCellOutput = exports.NotebookCellOutput || (exports.NotebookCellOutput = {}));
    var NotebookExclusiveDocumentPattern;
    (function (NotebookExclusiveDocumentPattern) {
        function from(pattern) {
            if (pattern === null || pattern === undefined) {
                return undefined;
            }
            if (pattern instanceof types.RelativePattern) {
                return pattern;
            }
            if (typeof pattern === 'string') {
                return pattern;
            }
            if (isRelativePattern(pattern)) {
                return new types.RelativePattern(pattern.base, pattern.pattern);
            }
            if (isExclusivePattern(pattern)) {
                return {
                    include: GlobPattern.from(pattern.include) || undefined,
                    exclude: GlobPattern.from(pattern.exclude) || undefined
                };
            }
            return undefined; // preserve `undefined`
        }
        NotebookExclusiveDocumentPattern.from = from;
        function to(pattern) {
            if (typeof pattern === 'string') {
                return pattern;
            }
            if (isRelativePattern(pattern)) {
                return {
                    base: pattern.base,
                    pattern: pattern.pattern
                };
            }
            return {
                include: pattern.include,
                exclude: pattern.exclude
            };
        }
        NotebookExclusiveDocumentPattern.to = to;
        function isExclusivePattern(obj) {
            const ep = obj;
            const include = GlobPattern.from(ep.include);
            if (!(include && include instanceof types.RelativePattern || typeof include === 'string')) {
                return false;
            }
            const exclude = GlobPattern.from(ep.exclude);
            if (!(exclude && exclude instanceof types.RelativePattern || typeof exclude === 'string')) {
                return false;
            }
            return true;
        }
        function isRelativePattern(obj) {
            const rp = obj;
            return rp && typeof rp.base === 'string' && typeof rp.pattern === 'string';
        }
    })(NotebookExclusiveDocumentPattern = exports.NotebookExclusiveDocumentPattern || (exports.NotebookExclusiveDocumentPattern = {}));
    var NotebookDecorationRenderOptions;
    (function (NotebookDecorationRenderOptions) {
        function from(options) {
            return {
                backgroundColor: options.backgroundColor,
                borderColor: options.borderColor,
                top: options.top ? ThemableDecorationAttachmentRenderOptions.from(options.top) : undefined
            };
        }
        NotebookDecorationRenderOptions.from = from;
    })(NotebookDecorationRenderOptions = exports.NotebookDecorationRenderOptions || (exports.NotebookDecorationRenderOptions = {}));
    var NotebookStatusBarItem;
    (function (NotebookStatusBarItem) {
        function from(item, commandsConverter, disposables) {
            const command = typeof item.command === 'string' ? { title: '', command: item.command } : item.command;
            return {
                alignment: item.alignment === types.NotebookCellStatusBarAlignment.Left ? 1 /* Left */ : 2 /* Right */,
                command: commandsConverter.toInternal(command, disposables),
                text: item.text,
                tooltip: item.tooltip,
                accessibilityInformation: item.accessibilityInformation,
                priority: item.priority
            };
        }
        NotebookStatusBarItem.from = from;
    })(NotebookStatusBarItem = exports.NotebookStatusBarItem || (exports.NotebookStatusBarItem = {}));
    var NotebookDocumentContentOptions;
    (function (NotebookDocumentContentOptions) {
        function from(options) {
            var _a, _b;
            return {
                transientOutputs: (_a = options === null || options === void 0 ? void 0 : options.transientOutputs) !== null && _a !== void 0 ? _a : false,
                transientCellMetadata: Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.transientCellMetadata), { executionOrder: true, runState: true, runStartTime: true, runStartTimeAdjustment: true, runEndTime: true, lastRunSuccess: true }),
                transientDocumentMetadata: (_b = options === null || options === void 0 ? void 0 : options.transientDocumentMetadata) !== null && _b !== void 0 ? _b : {}
            };
        }
        NotebookDocumentContentOptions.from = from;
    })(NotebookDocumentContentOptions = exports.NotebookDocumentContentOptions || (exports.NotebookDocumentContentOptions = {}));
    var NotebookKernelPreload;
    (function (NotebookKernelPreload) {
        function from(preload) {
            var _a;
            return {
                uri: preload.uri,
                provides: typeof preload.provides === 'string'
                    ? [preload.provides]
                    : (_a = preload.provides) !== null && _a !== void 0 ? _a : []
            };
        }
        NotebookKernelPreload.from = from;
        function to(preload) {
            return {
                uri: uri_1.URI.revive(preload.uri),
                provides: preload.provides
            };
        }
        NotebookKernelPreload.to = to;
    })(NotebookKernelPreload = exports.NotebookKernelPreload || (exports.NotebookKernelPreload = {}));
    var TestMessage;
    (function (TestMessage) {
        function from(message) {
            return {
                message: MarkdownString.fromStrict(message.message) || '',
                severity: message.severity,
                expectedOutput: message.expectedOutput,
                actualOutput: message.actualOutput,
                location: message.location ? location.from(message.location) : undefined,
            };
        }
        TestMessage.from = from;
        function to(item) {
            const message = new types.TestMessage(typeof item.message === 'string' ? item.message : MarkdownString.to(item.message));
            message.severity = item.severity;
            message.actualOutput = item.actualOutput;
            message.expectedOutput = item.expectedOutput;
            return message;
        }
        TestMessage.to = to;
    })(TestMessage = exports.TestMessage || (exports.TestMessage = {}));
    var TestItem;
    (function (TestItem) {
        function from(item) {
            var _a, _b;
            return {
                extId: item.id,
                label: item.label,
                uri: item.uri,
                range: Range.from(item.range) || null,
                debuggable: (_a = item.debuggable) !== null && _a !== void 0 ? _a : false,
                description: item.description || null,
                runnable: (_b = item.runnable) !== null && _b !== void 0 ? _b : true,
                error: item.error ? (MarkdownString.fromStrict(item.error) || null) : null,
            };
        }
        TestItem.from = from;
        function fromResultSnapshot(item) {
            return {
                extId: item.id,
                label: item.label,
                uri: item.uri,
                range: Range.from(item.range) || null,
                debuggable: false,
                description: item.description || null,
                error: null,
                runnable: true,
            };
        }
        TestItem.fromResultSnapshot = fromResultSnapshot;
        function toPlain(item) {
            return {
                id: item.extId,
                label: item.label,
                uri: uri_1.URI.revive(item.uri),
                range: Range.to(item.range || undefined),
                addChild: () => undefined,
                dispose: () => undefined,
                status: types.TestItemStatus.Pending,
                data: undefined,
                debuggable: item.debuggable,
                description: item.description || undefined,
                runnable: item.runnable,
            };
        }
        TestItem.toPlain = toPlain;
        function to(item) {
            const testItem = new types.TestItemImpl(item.extId, item.label, uri_1.URI.revive(item.uri), undefined);
            testItem.range = Range.to(item.range || undefined);
            testItem.debuggable = item.debuggable;
            testItem.description = item.description || undefined;
            testItem.runnable = item.runnable;
            return testItem;
        }
        TestItem.to = to;
    })(TestItem = exports.TestItem || (exports.TestItem = {}));
    var TestResults;
    (function (TestResults) {
        const convertTestResultItem = (item, byInternalId) => (Object.assign(Object.assign({}, TestItem.toPlain(item.item)), { taskStates: item.tasks.map(t => ({
                state: t.state,
                duration: t.duration,
                messages: t.messages.map(TestMessage.to),
            })), children: item.children
                .map(c => byInternalId.get(c))
                .filter(types_1.isDefined)
                .map(c => convertTestResultItem(c, byInternalId)) }));
        function to(serialized) {
            const roots = [];
            const byInternalId = new Map();
            for (const item of serialized.items) {
                byInternalId.set(item.item.extId, item);
                if (item.direct) {
                    roots.push(item);
                }
            }
            return {
                completedAt: serialized.completedAt,
                results: roots.map(r => convertTestResultItem(r, byInternalId)),
            };
        }
        TestResults.to = to;
    })(TestResults = exports.TestResults || (exports.TestResults = {}));
    var CodeActionTriggerKind;
    (function (CodeActionTriggerKind) {
        function to(value) {
            switch (value) {
                case 1 /* Invoke */:
                    return types.CodeActionTriggerKind.Invoke;
                case 2 /* Auto */:
                    return types.CodeActionTriggerKind.Automatic;
            }
        }
        CodeActionTriggerKind.to = to;
    })(CodeActionTriggerKind = exports.CodeActionTriggerKind || (exports.CodeActionTriggerKind = {}));
});
//# sourceMappingURL=extHostTypeConverters.js.map