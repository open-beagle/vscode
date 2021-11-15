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
define(["require", "exports", "vs/nls!vs/workbench/contrib/bulkEdit/browser/bulkEditService", "vs/base/common/lifecycle", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/bulkEditService", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/bulkEdit/browser/bulkTextEdits", "vs/workbench/contrib/bulkEdit/browser/bulkFileEdits", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/platform/undoRedo/common/undoRedo", "vs/base/common/linkedList", "vs/base/common/cancellation", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs"], function (require, exports, nls_1, lifecycle_1, editorBrowser_1, bulkEditService_1, extensions_1, log_1, progress_1, editorService_1, instantiation_1, bulkTextEdits_1, bulkFileEdits_1, bulkCellEdits_1, undoRedo_1, linkedList_1, cancellation_1, lifecycle_2, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkEditService = void 0;
    let BulkEdit = class BulkEdit {
        constructor(_label, _editor, _progress, _token, _edits, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _instaService, _logService) {
            this._label = _label;
            this._editor = _editor;
            this._progress = _progress;
            this._token = _token;
            this._edits = _edits;
            this._undoRedoGroup = _undoRedoGroup;
            this._undoRedoSource = _undoRedoSource;
            this._confirmBeforeUndo = _confirmBeforeUndo;
            this._instaService = _instaService;
            this._logService = _logService;
        }
        ariaMessage() {
            const editCount = this._edits.length;
            const resourceCount = this._edits.length;
            if (editCount === 0) {
                return (0, nls_1.localize)(0, null);
            }
            else if (editCount > 1 && resourceCount > 1) {
                return (0, nls_1.localize)(1, null, editCount, resourceCount);
            }
            else {
                return (0, nls_1.localize)(2, null, editCount, resourceCount);
            }
        }
        async perform() {
            if (this._edits.length === 0) {
                return;
            }
            const ranges = [1];
            for (let i = 1; i < this._edits.length; i++) {
                if (Object.getPrototypeOf(this._edits[i - 1]) === Object.getPrototypeOf(this._edits[i])) {
                    ranges[ranges.length - 1]++;
                }
                else {
                    ranges.push(1);
                }
            }
            // Show infinte progress when there is only 1 item since we do not know how long it takes
            const increment = this._edits.length > 1 ? 0 : undefined;
            this._progress.report({ increment, total: 100 });
            // Increment by percentage points since progress API expects that
            const progress = { report: _ => this._progress.report({ increment: 100 / this._edits.length }) };
            let index = 0;
            for (let range of ranges) {
                if (this._token.isCancellationRequested) {
                    break;
                }
                const group = this._edits.slice(index, index + range);
                if (group[0] instanceof bulkEditService_1.ResourceFileEdit) {
                    await this._performFileEdits(group, this._undoRedoGroup, this._undoRedoSource, this._confirmBeforeUndo, progress);
                }
                else if (group[0] instanceof bulkEditService_1.ResourceTextEdit) {
                    await this._performTextEdits(group, this._undoRedoGroup, this._undoRedoSource, progress);
                }
                else if (group[0] instanceof bulkCellEdits_1.ResourceNotebookCellEdit) {
                    await this._performCellEdits(group, this._undoRedoGroup, this._undoRedoSource, progress);
                }
                else {
                    console.log('UNKNOWN EDIT');
                }
                index = index + range;
            }
        }
        async _performFileEdits(edits, undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress) {
            this._logService.debug('_performFileEdits', JSON.stringify(edits));
            const model = this._instaService.createInstance(bulkFileEdits_1.BulkFileEdits, this._label || (0, nls_1.localize)(3, null), undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress, this._token, edits);
            await model.apply();
        }
        async _performTextEdits(edits, undoRedoGroup, undoRedoSource, progress) {
            this._logService.debug('_performTextEdits', JSON.stringify(edits));
            const model = this._instaService.createInstance(bulkTextEdits_1.BulkTextEdits, this._label || (0, nls_1.localize)(4, null), this._editor, undoRedoGroup, undoRedoSource, progress, this._token, edits);
            await model.apply();
        }
        async _performCellEdits(edits, undoRedoGroup, undoRedoSource, progress) {
            this._logService.debug('_performCellEdits', JSON.stringify(edits));
            const model = this._instaService.createInstance(bulkCellEdits_1.BulkCellEdits, undoRedoGroup, undoRedoSource, progress, this._token, edits);
            await model.apply();
        }
    };
    BulkEdit = __decorate([
        __param(8, instantiation_1.IInstantiationService),
        __param(9, log_1.ILogService)
    ], BulkEdit);
    let BulkEditService = class BulkEditService {
        constructor(_instaService, _logService, _editorService, _lifecycleService, _dialogService) {
            this._instaService = _instaService;
            this._logService = _logService;
            this._editorService = _editorService;
            this._lifecycleService = _lifecycleService;
            this._dialogService = _dialogService;
            this._activeUndoRedoGroups = new linkedList_1.LinkedList();
        }
        setPreviewHandler(handler) {
            this._previewHandler = handler;
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._previewHandler === handler) {
                    this._previewHandler = undefined;
                }
            });
        }
        hasPreviewHandler() {
            return Boolean(this._previewHandler);
        }
        async apply(edits, options) {
            var _a, _b;
            if (edits.length === 0) {
                return { ariaSummary: (0, nls_1.localize)(5, null) };
            }
            if (this._previewHandler && ((options === null || options === void 0 ? void 0 : options.showPreview) || edits.some(value => { var _a; return (_a = value.metadata) === null || _a === void 0 ? void 0 : _a.needsConfirmation; }))) {
                edits = await this._previewHandler(edits, options);
            }
            let codeEditor = options === null || options === void 0 ? void 0 : options.editor;
            // try to find code editor
            if (!codeEditor) {
                let candidate = this._editorService.activeTextEditorControl;
                if ((0, editorBrowser_1.isCodeEditor)(candidate)) {
                    codeEditor = candidate;
                }
            }
            if (codeEditor && codeEditor.getOption(77 /* readOnly */)) {
                // If the code editor is readonly still allow bulk edits to be applied #68549
                codeEditor = undefined;
            }
            // undo-redo-group: if a group id is passed then try to find it
            // in the list of active edits. otherwise (or when not found)
            // create a separate undo-redo-group
            let undoRedoGroup;
            let undoRedoGroupRemove = () => { };
            if (typeof (options === null || options === void 0 ? void 0 : options.undoRedoGroupId) === 'number') {
                for (let candidate of this._activeUndoRedoGroups) {
                    if (candidate.id === options.undoRedoGroupId) {
                        undoRedoGroup = candidate;
                        break;
                    }
                }
            }
            if (!undoRedoGroup) {
                undoRedoGroup = new undoRedo_1.UndoRedoGroup();
                undoRedoGroupRemove = this._activeUndoRedoGroups.push(undoRedoGroup);
            }
            const label = (options === null || options === void 0 ? void 0 : options.quotableLabel) || (options === null || options === void 0 ? void 0 : options.label);
            const bulkEdit = this._instaService.createInstance(BulkEdit, label, codeEditor, (_a = options === null || options === void 0 ? void 0 : options.progress) !== null && _a !== void 0 ? _a : progress_1.Progress.None, (_b = options === null || options === void 0 ? void 0 : options.token) !== null && _b !== void 0 ? _b : cancellation_1.CancellationToken.None, edits, undoRedoGroup, options === null || options === void 0 ? void 0 : options.undoRedoSource, !!(options === null || options === void 0 ? void 0 : options.confirmBeforeUndo));
            let listener;
            try {
                listener = this._lifecycleService.onBeforeShutdown(e => e.veto(this.shouldVeto(label), 'veto.blukEditService'));
                await bulkEdit.perform();
                return { ariaSummary: bulkEdit.ariaMessage() };
            }
            catch (err) {
                // console.log('apply FAILED');
                // console.log(err);
                this._logService.error(err);
                throw err;
            }
            finally {
                listener === null || listener === void 0 ? void 0 : listener.dispose();
                undoRedoGroupRemove();
            }
        }
        async shouldVeto(label) {
            label = label || (0, nls_1.localize)(6, null);
            const result = await this._dialogService.confirm({
                message: (0, nls_1.localize)(7, null, label),
                primaryButton: (0, nls_1.localize)(8, null)
            });
            return !result.confirmed;
        }
    };
    BulkEditService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, log_1.ILogService),
        __param(2, editorService_1.IEditorService),
        __param(3, lifecycle_2.ILifecycleService),
        __param(4, dialogs_1.IDialogService)
    ], BulkEditService);
    exports.BulkEditService = BulkEditService;
    (0, extensions_1.registerSingleton)(bulkEditService_1.IBulkEditService, BulkEditService, true);
});
//# sourceMappingURL=bulkEditService.js.map