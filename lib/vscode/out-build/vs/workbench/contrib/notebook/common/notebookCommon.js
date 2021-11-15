/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey"], function (require, exports, glob, network_1, path_1, platform_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NOTEBOOK_WORKING_COPY_TYPE_PREFIX = exports.CellStatusbarAlignment = exports.ExperimentalUseMarkdownRenderer = exports.NotebookTextDiffEditorPreview = exports.ShowCellStatusBarKey = exports.CellToolbarLocKey = exports.DisplayOrderKey = exports.CellSequence = exports.notebookDocumentFilterMatch = exports.isDocumentExcludePattern = exports.NotebookEditorPriority = exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = exports.diff = exports.sortMimeTypes = exports.mimeTypeIsMergeable = exports.mimeTypeSupportedByCore = exports.mimeTypeIsAlwaysSecure = exports.CellUri = exports.getCellUndoRedoComparisonKey = exports.CellEditType = exports.SelectionStateType = exports.NotebookCellsChangeType = exports.NotebookRendererMatch = exports.AnyRendererApi = exports.NotebookCellExecutionState = exports.notebookDocumentMetadataDefaults = exports.NotebookRunState = exports.RENDERER_NOT_AVAILABLE = exports.BUILTIN_RENDERER_ID = exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = exports.NOTEBOOK_DISPLAY_ORDER = exports.CellKind = void 0;
    var CellKind;
    (function (CellKind) {
        CellKind[CellKind["Markdown"] = 1] = "Markdown";
        CellKind[CellKind["Code"] = 2] = "Code";
    })(CellKind = exports.CellKind || (exports.CellKind = {}));
    exports.NOTEBOOK_DISPLAY_ORDER = [
        'application/json',
        'application/javascript',
        'text/html',
        'image/svg+xml',
        'text/markdown',
        'image/png',
        'image/jpeg',
        'text/plain'
    ];
    exports.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER = [
        'text/markdown',
        'application/json',
        'text/plain',
        'text/html',
        'image/svg+xml',
        'image/png',
        'image/jpeg',
    ];
    exports.BUILTIN_RENDERER_ID = '_builtin';
    exports.RENDERER_NOT_AVAILABLE = '_notAvailable';
    var NotebookRunState;
    (function (NotebookRunState) {
        NotebookRunState[NotebookRunState["Running"] = 1] = "Running";
        NotebookRunState[NotebookRunState["Idle"] = 2] = "Idle";
    })(NotebookRunState = exports.NotebookRunState || (exports.NotebookRunState = {}));
    exports.notebookDocumentMetadataDefaults = {
        custom: {},
        trusted: true
    };
    var NotebookCellExecutionState;
    (function (NotebookCellExecutionState) {
        NotebookCellExecutionState[NotebookCellExecutionState["Idle"] = 1] = "Idle";
        NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
        NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
    })(NotebookCellExecutionState = exports.NotebookCellExecutionState || (exports.NotebookCellExecutionState = {}));
    /**
     * Passed to INotebookRendererInfo.matches when the notebook is initially
     * loaded before the kernel is known.
     */
    exports.AnyRendererApi = Symbol('AnyRendererApi');
    /** Note: enum values are used for sorting */
    var NotebookRendererMatch;
    (function (NotebookRendererMatch) {
        /** Renderer has a hard dependency on an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithHardKernelDependency"] = 0] = "WithHardKernelDependency";
        /** Renderer works better with an available kernel */
        NotebookRendererMatch[NotebookRendererMatch["WithOptionalKernelDependency"] = 1] = "WithOptionalKernelDependency";
        /** Renderer is kernel-agnostic */
        NotebookRendererMatch[NotebookRendererMatch["Pure"] = 2] = "Pure";
        /** Renderer is for a different mimeType or has a hard dependency which is unsatisfied */
        NotebookRendererMatch[NotebookRendererMatch["Never"] = 3] = "Never";
    })(NotebookRendererMatch = exports.NotebookRendererMatch || (exports.NotebookRendererMatch = {}));
    var NotebookCellsChangeType;
    (function (NotebookCellsChangeType) {
        NotebookCellsChangeType[NotebookCellsChangeType["ModelChange"] = 1] = "ModelChange";
        NotebookCellsChangeType[NotebookCellsChangeType["Move"] = 2] = "Move";
        NotebookCellsChangeType[NotebookCellsChangeType["CellClearOutput"] = 3] = "CellClearOutput";
        NotebookCellsChangeType[NotebookCellsChangeType["CellsClearOutput"] = 4] = "CellsClearOutput";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeLanguage"] = 5] = "ChangeLanguage";
        NotebookCellsChangeType[NotebookCellsChangeType["Initialize"] = 6] = "Initialize";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellMetadata"] = 7] = "ChangeCellMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["Output"] = 8] = "Output";
        NotebookCellsChangeType[NotebookCellsChangeType["OutputItem"] = 9] = "OutputItem";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeCellContent"] = 10] = "ChangeCellContent";
        NotebookCellsChangeType[NotebookCellsChangeType["ChangeDocumentMetadata"] = 11] = "ChangeDocumentMetadata";
        NotebookCellsChangeType[NotebookCellsChangeType["Unknown"] = 12] = "Unknown";
    })(NotebookCellsChangeType = exports.NotebookCellsChangeType || (exports.NotebookCellsChangeType = {}));
    var SelectionStateType;
    (function (SelectionStateType) {
        SelectionStateType[SelectionStateType["Handle"] = 0] = "Handle";
        SelectionStateType[SelectionStateType["Index"] = 1] = "Index";
    })(SelectionStateType = exports.SelectionStateType || (exports.SelectionStateType = {}));
    var CellEditType;
    (function (CellEditType) {
        CellEditType[CellEditType["Replace"] = 1] = "Replace";
        CellEditType[CellEditType["Output"] = 2] = "Output";
        CellEditType[CellEditType["Metadata"] = 3] = "Metadata";
        CellEditType[CellEditType["CellLanguage"] = 4] = "CellLanguage";
        CellEditType[CellEditType["DocumentMetadata"] = 5] = "DocumentMetadata";
        CellEditType[CellEditType["Move"] = 6] = "Move";
        CellEditType[CellEditType["OutputItems"] = 7] = "OutputItems";
        CellEditType[CellEditType["PartialMetadata"] = 8] = "PartialMetadata";
    })(CellEditType = exports.CellEditType || (exports.CellEditType = {}));
    function getCellUndoRedoComparisonKey(uri) {
        const data = CellUri.parse(uri);
        if (!data) {
            return uri.toString();
        }
        return data.notebook.toString();
    }
    exports.getCellUndoRedoComparisonKey = getCellUndoRedoComparisonKey;
    var CellUri;
    (function (CellUri) {
        CellUri.scheme = network_1.Schemas.vscodeNotebookCell;
        const _regex = /^ch(\d{7,})/;
        function generate(notebook, handle) {
            return notebook.with({
                scheme: CellUri.scheme,
                fragment: `ch${handle.toString().padStart(7, '0')}${notebook.scheme !== network_1.Schemas.file ? notebook.scheme : ''}`
            });
        }
        CellUri.generate = generate;
        function parse(cell) {
            if (cell.scheme !== CellUri.scheme) {
                return undefined;
            }
            const match = _regex.exec(cell.fragment);
            if (!match) {
                return undefined;
            }
            const handle = Number(match[1]);
            return {
                handle,
                notebook: cell.with({
                    scheme: cell.fragment.substr(match[0].length) || network_1.Schemas.file,
                    fragment: null
                })
            };
        }
        CellUri.parse = parse;
        function generateCellMetadataUri(notebook, handle) {
            return notebook.with({
                scheme: network_1.Schemas.vscodeNotebookCellMetadata,
                fragment: `ch${handle.toString().padStart(7, '0')}${notebook.scheme !== network_1.Schemas.file ? notebook.scheme : ''}`
            });
        }
        CellUri.generateCellMetadataUri = generateCellMetadataUri;
        function parseCellMetadataUri(metadata) {
            if (metadata.scheme !== network_1.Schemas.vscodeNotebookCellMetadata) {
                return undefined;
            }
            const match = _regex.exec(metadata.fragment);
            if (!match) {
                return undefined;
            }
            const handle = Number(match[1]);
            return {
                handle,
                notebook: metadata.with({
                    scheme: metadata.fragment.substr(match[0].length) || network_1.Schemas.file,
                    fragment: null
                })
            };
        }
        CellUri.parseCellMetadataUri = parseCellMetadataUri;
    })(CellUri = exports.CellUri || (exports.CellUri = {}));
    const _mimeTypeInfo = new Map([
        ['application/json', { alwaysSecure: true, supportedByCore: true }],
        ['text/markdown', { alwaysSecure: true, supportedByCore: true }],
        ['image/png', { alwaysSecure: true, supportedByCore: true }],
        ['text/plain', { alwaysSecure: true, supportedByCore: true }],
        ['application/javascript', { supportedByCore: true }],
        ['text/html', { supportedByCore: true }],
        ['image/svg+xml', { supportedByCore: true }],
        ['image/jpeg', { supportedByCore: true }],
        ['text/x-javascript', { supportedByCore: true }],
        ['application/x.notebook.error-traceback', { alwaysSecure: true, supportedByCore: true }],
        ['application/x.notebook.stream', { alwaysSecure: true, supportedByCore: true, mergeable: true }],
        ['application/x.notebook.stdout', { alwaysSecure: true, supportedByCore: true, mergeable: true }],
        ['application/x.notebook.stderr', { alwaysSecure: true, supportedByCore: true, mergeable: true }],
    ]);
    function mimeTypeIsAlwaysSecure(mimeType) {
        var _a, _b;
        return (_b = (_a = _mimeTypeInfo.get(mimeType)) === null || _a === void 0 ? void 0 : _a.alwaysSecure) !== null && _b !== void 0 ? _b : false;
    }
    exports.mimeTypeIsAlwaysSecure = mimeTypeIsAlwaysSecure;
    function mimeTypeSupportedByCore(mimeType) {
        var _a, _b;
        return (_b = (_a = _mimeTypeInfo.get(mimeType)) === null || _a === void 0 ? void 0 : _a.supportedByCore) !== null && _b !== void 0 ? _b : false;
    }
    exports.mimeTypeSupportedByCore = mimeTypeSupportedByCore;
    function mimeTypeIsMergeable(mimeType) {
        var _a, _b;
        return (_b = (_a = _mimeTypeInfo.get(mimeType)) === null || _a === void 0 ? void 0 : _a.mergeable) !== null && _b !== void 0 ? _b : false;
    }
    exports.mimeTypeIsMergeable = mimeTypeIsMergeable;
    // if (isWindows) {
    // 	value = value.replace(/\//g, '\\');
    // }
    function matchGlobUniversal(pattern, path) {
        if (platform_1.isWindows) {
            pattern = pattern.replace(/\//g, '\\');
            path = path.replace(/\//g, '\\');
        }
        return glob.match(pattern, path);
    }
    function getMimeTypeOrder(mimeType, userDisplayOrder, defaultOrder) {
        let order = 0;
        for (let i = 0; i < userDisplayOrder.length; i++) {
            if (matchGlobUniversal(userDisplayOrder[i], mimeType)) {
                return order;
            }
            order++;
        }
        for (let i = 0; i < defaultOrder.length; i++) {
            if (matchGlobUniversal(defaultOrder[i], mimeType)) {
                return order;
            }
            order++;
        }
        return order;
    }
    function sortMimeTypes(mimeTypes, userDisplayOrder, defaultOrder) {
        return mimeTypes.sort((a, b) => getMimeTypeOrder(a, userDisplayOrder, defaultOrder) - getMimeTypeOrder(b, userDisplayOrder, defaultOrder));
    }
    exports.sortMimeTypes = sortMimeTypes;
    function diff(before, after, contains, equal = (a, b) => a === b) {
        const result = [];
        function pushSplice(start, deleteCount, toInsert) {
            if (deleteCount === 0 && toInsert.length === 0) {
                return;
            }
            const latest = result[result.length - 1];
            if (latest && latest.start + latest.deleteCount === start) {
                latest.deleteCount += deleteCount;
                latest.toInsert.push(...toInsert);
            }
            else {
                result.push({ start, deleteCount, toInsert });
            }
        }
        let beforeIdx = 0;
        let afterIdx = 0;
        while (true) {
            if (beforeIdx === before.length) {
                pushSplice(beforeIdx, 0, after.slice(afterIdx));
                break;
            }
            if (afterIdx === after.length) {
                pushSplice(beforeIdx, before.length - beforeIdx, []);
                break;
            }
            const beforeElement = before[beforeIdx];
            const afterElement = after[afterIdx];
            if (equal(beforeElement, afterElement)) {
                // equal
                beforeIdx += 1;
                afterIdx += 1;
                continue;
            }
            if (contains(afterElement)) {
                // `afterElement` exists before, which means some elements before `afterElement` are deleted
                pushSplice(beforeIdx, 1, []);
                beforeIdx += 1;
            }
            else {
                // `afterElement` added
                pushSplice(beforeIdx, 0, [afterElement]);
                afterIdx += 1;
            }
        }
        return result;
    }
    exports.diff = diff;
    exports.NOTEBOOK_EDITOR_CURSOR_BOUNDARY = new contextkey_1.RawContextKey('notebookEditorCursorAtBoundary', 'none');
    var NotebookEditorPriority;
    (function (NotebookEditorPriority) {
        NotebookEditorPriority["default"] = "default";
        NotebookEditorPriority["option"] = "option";
    })(NotebookEditorPriority = exports.NotebookEditorPriority || (exports.NotebookEditorPriority = {}));
    //TODO@rebornix test
    function isDocumentExcludePattern(filenamePattern) {
        const arg = filenamePattern;
        if ((typeof arg.include === 'string' || glob.isRelativePattern(arg.include))
            && (typeof arg.exclude === 'string' || glob.isRelativePattern(arg.exclude))) {
            return true;
        }
        return false;
    }
    exports.isDocumentExcludePattern = isDocumentExcludePattern;
    function notebookDocumentFilterMatch(filter, viewType, resource) {
        if (Array.isArray(filter.viewType) && filter.viewType.indexOf(viewType) >= 0) {
            return true;
        }
        if (filter.viewType === viewType) {
            return true;
        }
        if (filter.filenamePattern) {
            let filenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.include : filter.filenamePattern;
            let excludeFilenamePattern = isDocumentExcludePattern(filter.filenamePattern) ? filter.filenamePattern.exclude : undefined;
            if (glob.match(filenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                if (excludeFilenamePattern) {
                    if (glob.match(excludeFilenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                        // should exclude
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    exports.notebookDocumentFilterMatch = notebookDocumentFilterMatch;
    class CellSequence {
        constructor(textModel) {
            this.textModel = textModel;
        }
        getElements() {
            const hashValue = new Int32Array(this.textModel.cells.length);
            for (let i = 0; i < this.textModel.cells.length; i++) {
                hashValue[i] = this.textModel.cells[i].getHashValue();
            }
            return hashValue;
        }
    }
    exports.CellSequence = CellSequence;
    exports.DisplayOrderKey = 'notebook.displayOrder';
    exports.CellToolbarLocKey = 'notebook.cellToolbarLocation';
    exports.ShowCellStatusBarKey = 'notebook.showCellStatusBar';
    exports.NotebookTextDiffEditorPreview = 'notebook.diff.enablePreview';
    exports.ExperimentalUseMarkdownRenderer = 'notebook.experimental.useMarkdownRenderer';
    var CellStatusbarAlignment;
    (function (CellStatusbarAlignment) {
        CellStatusbarAlignment[CellStatusbarAlignment["Left"] = 1] = "Left";
        CellStatusbarAlignment[CellStatusbarAlignment["Right"] = 2] = "Right";
    })(CellStatusbarAlignment = exports.CellStatusbarAlignment || (exports.CellStatusbarAlignment = {}));
    exports.NOTEBOOK_WORKING_COPY_TYPE_PREFIX = 'notebook/';
});
//# sourceMappingURL=notebookCommon.js.map