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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorService", "../common/extHost.protocol", "vs/platform/log/common/log", "vs/base/common/uri", "vs/platform/editor/common/editor", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/common/editor", "vs/base/common/objects"], function (require, exports, lifecycle_1, notebookBrowser_1, notebookEditorService_1, extHost_protocol_1, log_1, uri_1, editor_1, notebookEditorInput_1, editorService_1, instantiation_1, editorGroupsService_1, editor_2, objects_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadNotebookEditors = void 0;
    class MainThreadNotebook {
        constructor(editor, disposables) {
            this.editor = editor;
            this.disposables = disposables;
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    let MainThreadNotebookEditors = class MainThreadNotebookEditors {
        constructor(extHostContext, notebooksAndEditors, _instantiationService, _editorService, _logService, _notebookEditorService, _editorGroupService) {
            this._instantiationService = _instantiationService;
            this._editorService = _editorService;
            this._logService = _logService;
            this._notebookEditorService = _notebookEditorService;
            this._editorGroupService = _editorGroupService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._mainThreadEditors = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebook);
            notebooksAndEditors.onDidAddEditors(this._handleEditorsAdded, this, this._disposables);
            notebooksAndEditors.onDidRemoveEditors(this._handleEditorsRemoved, this, this._disposables);
            this._editorService.onDidActiveEditorChange(() => this._updateEditorViewColumns(), this, this._disposables);
            this._editorGroupService.onDidRemoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
            this._editorGroupService.onDidMoveGroup(() => this._updateEditorViewColumns(), this, this._disposables);
        }
        dispose() {
            this._disposables.dispose();
            (0, lifecycle_1.dispose)(this._mainThreadEditors.values());
        }
        _handleEditorsAdded(editors) {
            for (const editor of editors) {
                const editorDisposables = new lifecycle_1.DisposableStore();
                editorDisposables.add(editor.onDidChangeVisibleRanges(() => {
                    this._proxy.$acceptEditorPropertiesChanged(editor.getId(), { visibleRanges: { ranges: editor.visibleRanges } });
                }));
                editorDisposables.add(editor.onDidChangeSelection(() => {
                    this._proxy.$acceptEditorPropertiesChanged(editor.getId(), { selections: { selections: editor.getSelections() } });
                }));
                const wrapper = new MainThreadNotebook(editor, editorDisposables);
                this._mainThreadEditors.set(editor.getId(), wrapper);
            }
        }
        _handleEditorsRemoved(editorIds) {
            var _a;
            for (const id of editorIds) {
                (_a = this._mainThreadEditors.get(id)) === null || _a === void 0 ? void 0 : _a.dispose();
                this._mainThreadEditors.delete(id);
            }
        }
        _updateEditorViewColumns() {
            const result = Object.create(null);
            for (let editorPane of this._editorService.visibleEditorPanes) {
                const candidate = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorPane);
                if (candidate && this._mainThreadEditors.has(candidate.getId())) {
                    result[candidate.getId()] = (0, editor_2.editorGroupToViewColumn)(this._editorGroupService, editorPane.group);
                }
            }
            if (!(0, objects_1.equals)(result, this._currentViewColumnInfo)) {
                this._currentViewColumnInfo = result;
                this._proxy.$acceptEditorViewColumns(result);
            }
        }
        async $tryApplyEdits(editorId, modelVersionId, cellEdits) {
            const wrapper = this._mainThreadEditors.get(editorId);
            if (!wrapper) {
                return false;
            }
            const { editor } = wrapper;
            if (!editor.textModel) {
                this._logService.warn('Notebook editor has NO model', editorId);
                return false;
            }
            if (editor.textModel.versionId !== modelVersionId) {
                return false;
            }
            //todo@jrieken use proper selection logic!
            return editor.textModel.applyEdits(cellEdits, true, undefined, () => undefined, undefined);
        }
        async $tryShowNotebookDocument(resource, viewType, options) {
            const editorOptions = new notebookBrowser_1.NotebookEditorOptions({
                cellSelections: options.selections,
                preserveFocus: options.preserveFocus,
                pinned: options.pinned,
                // selection: options.selection,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined,
                override: editor_1.EditorOverride.DISABLED,
            });
            const input = notebookEditorInput_1.NotebookEditorInput.create(this._instantiationService, uri_1.URI.revive(resource), viewType);
            const editorPane = await this._editorService.openEditor(input, editorOptions, options.position);
            const notebookEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorPane);
            if (notebookEditor) {
                return notebookEditor.getId();
            }
            else {
                throw new Error(`Notebook Editor creation failure for documenet ${resource}`);
            }
        }
        async $tryRevealRange(id, range, revealType) {
            const editor = this._notebookEditorService.getNotebookEditor(id);
            if (!editor) {
                return;
            }
            const notebookEditor = editor;
            if (!notebookEditor.hasModel()) {
                return;
            }
            const viewModel = notebookEditor.viewModel;
            const cell = viewModel.cellAt(range.start);
            if (!cell) {
                return;
            }
            switch (revealType) {
                case extHost_protocol_1.NotebookEditorRevealType.Default:
                    return notebookEditor.revealCellRangeInView(range);
                case extHost_protocol_1.NotebookEditorRevealType.InCenter:
                    return notebookEditor.revealInCenter(cell);
                case extHost_protocol_1.NotebookEditorRevealType.InCenterIfOutsideViewport:
                    return notebookEditor.revealInCenterIfOutsideViewport(cell);
                case extHost_protocol_1.NotebookEditorRevealType.AtTop:
                    return notebookEditor.revealInViewAtTop(cell);
            }
        }
        $registerNotebookEditorDecorationType(key, options) {
            this._notebookEditorService.registerEditorDecorationType(key, options);
        }
        $removeNotebookEditorDecorationType(key) {
            this._notebookEditorService.removeEditorDecorationType(key);
        }
        $trySetDecorations(id, range, key) {
            const editor = this._notebookEditorService.getNotebookEditor(id);
            if (editor) {
                const notebookEditor = editor;
                notebookEditor.setEditorDecorations(key, range);
            }
        }
    };
    MainThreadNotebookEditors = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, editorService_1.IEditorService),
        __param(4, log_1.ILogService),
        __param(5, notebookEditorService_1.INotebookEditorService),
        __param(6, editorGroupsService_1.IEditorGroupsService)
    ], MainThreadNotebookEditors);
    exports.MainThreadNotebookEditors = MainThreadNotebookEditors;
});
//# sourceMappingURL=mainThreadNotebookEditors.js.map