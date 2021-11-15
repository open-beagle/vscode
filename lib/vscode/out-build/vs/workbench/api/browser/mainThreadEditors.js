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
define(["require", "exports", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/objects", "vs/base/common/uri", "vs/editor/browser/services/bulkEditService", "vs/editor/browser/services/codeEditorService", "vs/platform/commands/common/commands", "vs/platform/editor/common/editor", "vs/workbench/api/common/extHost.protocol", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/environment/common/environment", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/marshalling", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits"], function (require, exports, errors_1, lifecycle_1, objects_1, uri_1, bulkEditService_1, codeEditorService_1, commands_1, editor_1, extHost_protocol_1, editor_2, editorService_1, editorGroupsService_1, environment_1, workingCopyService_1, marshalling_1, bulkCellEdits_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadTextEditors = exports.reviveWorkspaceEditDto2 = void 0;
    function reviveWorkspaceEditDto2(data) {
        if (!(data === null || data === void 0 ? void 0 : data.edits)) {
            return [];
        }
        const result = [];
        for (let edit of (0, marshalling_1.revive)(data).edits) {
            if (edit._type === 1 /* File */) {
                result.push(new bulkEditService_1.ResourceFileEdit(edit.oldUri, edit.newUri, edit.options, edit.metadata));
            }
            else if (edit._type === 2 /* Text */) {
                result.push(new bulkEditService_1.ResourceTextEdit(edit.resource, edit.edit, edit.modelVersionId, edit.metadata));
            }
            else if (edit._type === 3 /* Cell */) {
                result.push(new bulkCellEdits_1.ResourceNotebookCellEdit(edit.resource, edit.edit, edit.notebookVersionId, edit.metadata));
            }
        }
        return result;
    }
    exports.reviveWorkspaceEditDto2 = reviveWorkspaceEditDto2;
    let MainThreadTextEditors = class MainThreadTextEditors {
        constructor(documentsAndEditors, extHostContext, _codeEditorService, _bulkEditService, _editorService, _editorGroupService) {
            this._codeEditorService = _codeEditorService;
            this._bulkEditService = _bulkEditService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._toDispose = new lifecycle_1.DisposableStore();
            this._instanceId = String(++MainThreadTextEditors.INSTANCE_COUNT);
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostEditors);
            this._documentsAndEditors = documentsAndEditors;
            this._textEditorsListenersMap = Object.create(null);
            this._editorPositionData = null;
            this._toDispose.add(documentsAndEditors.onTextEditorAdd(editors => editors.forEach(this._onTextEditorAdd, this)));
            this._toDispose.add(documentsAndEditors.onTextEditorRemove(editors => editors.forEach(this._onTextEditorRemove, this)));
            this._toDispose.add(this._editorService.onDidVisibleEditorsChange(() => this._updateActiveAndVisibleTextEditors()));
            this._toDispose.add(this._editorGroupService.onDidRemoveGroup(() => this._updateActiveAndVisibleTextEditors()));
            this._toDispose.add(this._editorGroupService.onDidMoveGroup(() => this._updateActiveAndVisibleTextEditors()));
            this._registeredDecorationTypes = Object.create(null);
        }
        dispose() {
            Object.keys(this._textEditorsListenersMap).forEach((editorId) => {
                (0, lifecycle_1.dispose)(this._textEditorsListenersMap[editorId]);
            });
            this._textEditorsListenersMap = Object.create(null);
            this._toDispose.dispose();
            for (let decorationType in this._registeredDecorationTypes) {
                this._codeEditorService.removeDecorationType(decorationType);
            }
            this._registeredDecorationTypes = Object.create(null);
        }
        _onTextEditorAdd(textEditor) {
            const id = textEditor.getId();
            const toDispose = [];
            toDispose.push(textEditor.onPropertiesChanged((data) => {
                this._proxy.$acceptEditorPropertiesChanged(id, data);
            }));
            this._textEditorsListenersMap[id] = toDispose;
        }
        _onTextEditorRemove(id) {
            (0, lifecycle_1.dispose)(this._textEditorsListenersMap[id]);
            delete this._textEditorsListenersMap[id];
        }
        _updateActiveAndVisibleTextEditors() {
            // editor columns
            const editorPositionData = this._getTextEditorPositionData();
            if (!(0, objects_1.equals)(this._editorPositionData, editorPositionData)) {
                this._editorPositionData = editorPositionData;
                this._proxy.$acceptEditorPositionData(this._editorPositionData);
            }
        }
        _getTextEditorPositionData() {
            const result = Object.create(null);
            for (let editorPane of this._editorService.visibleEditorPanes) {
                const id = this._documentsAndEditors.findTextEditorIdFor(editorPane);
                if (id) {
                    result[id] = (0, editor_2.editorGroupToViewColumn)(this._editorGroupService, editorPane.group);
                }
            }
            return result;
        }
        // --- from extension host process
        async $tryShowTextDocument(resource, options) {
            const uri = uri_1.URI.revive(resource);
            const editorOptions = {
                preserveFocus: options.preserveFocus,
                pinned: options.pinned,
                selection: options.selection,
                // preserve pre 1.38 behaviour to not make group active when preserveFocus: true
                // but make sure to restore the editor to fix https://github.com/microsoft/vscode/issues/79633
                activation: options.preserveFocus ? editor_1.EditorActivation.RESTORE : undefined,
                override: editor_1.EditorOverride.DISABLED
            };
            const input = {
                resource: uri,
                options: editorOptions
            };
            const editor = await this._editorService.openEditor(input, (0, editor_2.viewColumnToEditorGroup)(this._editorGroupService, options.position));
            if (!editor) {
                return undefined;
            }
            return this._documentsAndEditors.findTextEditorIdFor(editor);
        }
        async $tryShowEditor(id, position) {
            const mainThreadEditor = this._documentsAndEditors.getEditor(id);
            if (mainThreadEditor) {
                const model = mainThreadEditor.getModel();
                await this._editorService.openEditor({
                    resource: model.uri,
                    options: { preserveFocus: false }
                }, (0, editor_2.viewColumnToEditorGroup)(this._editorGroupService, position));
                return;
            }
        }
        async $tryHideEditor(id) {
            const mainThreadEditor = this._documentsAndEditors.getEditor(id);
            if (mainThreadEditor) {
                const editorPanes = this._editorService.visibleEditorPanes;
                for (let editorPane of editorPanes) {
                    if (mainThreadEditor.matches(editorPane)) {
                        return editorPane.group.closeEditor(editorPane.input);
                    }
                }
            }
        }
        $trySetSelections(id, selections) {
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.disposed)(`TextEditor(${id})`));
            }
            editor.setSelections(selections);
            return Promise.resolve(undefined);
        }
        $trySetDecorations(id, key, ranges) {
            key = `${this._instanceId}-${key}`;
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.disposed)(`TextEditor(${id})`));
            }
            editor.setDecorations(key, ranges);
            return Promise.resolve(undefined);
        }
        $trySetDecorationsFast(id, key, ranges) {
            key = `${this._instanceId}-${key}`;
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.disposed)(`TextEditor(${id})`));
            }
            editor.setDecorationsFast(key, ranges);
            return Promise.resolve(undefined);
        }
        $tryRevealRange(id, range, revealType) {
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.disposed)(`TextEditor(${id})`));
            }
            editor.revealRange(range, revealType);
            return Promise.resolve();
        }
        $trySetOptions(id, options) {
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.disposed)(`TextEditor(${id})`));
            }
            editor.setConfiguration(options);
            return Promise.resolve(undefined);
        }
        $tryApplyEdits(id, modelVersionId, edits, opts) {
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.disposed)(`TextEditor(${id})`));
            }
            return Promise.resolve(editor.applyEdits(modelVersionId, edits, opts));
        }
        $tryApplyWorkspaceEdit(dto) {
            const edits = reviveWorkspaceEditDto2(dto);
            return this._bulkEditService.apply(edits).then(() => true, _err => false);
        }
        $tryInsertSnippet(id, template, ranges, opts) {
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject((0, errors_1.disposed)(`TextEditor(${id})`));
            }
            return Promise.resolve(editor.insertSnippet(template, ranges, opts));
        }
        $registerTextEditorDecorationType(key, options) {
            key = `${this._instanceId}-${key}`;
            this._registeredDecorationTypes[key] = true;
            this._codeEditorService.registerDecorationType(key, options);
        }
        $removeTextEditorDecorationType(key) {
            key = `${this._instanceId}-${key}`;
            delete this._registeredDecorationTypes[key];
            this._codeEditorService.removeDecorationType(key);
        }
        $getDiffInformation(id) {
            const editor = this._documentsAndEditors.getEditor(id);
            if (!editor) {
                return Promise.reject(new Error('No such TextEditor'));
            }
            const codeEditor = editor.getCodeEditor();
            if (!codeEditor) {
                return Promise.reject(new Error('No such CodeEditor'));
            }
            const codeEditorId = codeEditor.getId();
            const diffEditors = this._codeEditorService.listDiffEditors();
            const [diffEditor] = diffEditors.filter(d => d.getOriginalEditor().getId() === codeEditorId || d.getModifiedEditor().getId() === codeEditorId);
            if (diffEditor) {
                return Promise.resolve(diffEditor.getLineChanges() || []);
            }
            const dirtyDiffContribution = codeEditor.getContribution('editor.contrib.dirtydiff');
            if (dirtyDiffContribution) {
                return Promise.resolve(dirtyDiffContribution.getChanges());
            }
            return Promise.resolve([]);
        }
    };
    MainThreadTextEditors.INSTANCE_COUNT = 0;
    MainThreadTextEditors = __decorate([
        __param(2, codeEditorService_1.ICodeEditorService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, editorService_1.IEditorService),
        __param(5, editorGroupsService_1.IEditorGroupsService)
    ], MainThreadTextEditors);
    exports.MainThreadTextEditors = MainThreadTextEditors;
    // --- commands
    commands_1.CommandsRegistry.registerCommand('_workbench.revertAllDirty', async function (accessor) {
        const environmentService = accessor.get(environment_1.IEnvironmentService);
        if (!environmentService.extensionTestsLocationURI) {
            throw new Error('Command is only available when running extension tests.');
        }
        const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
        for (const workingCopy of workingCopyService.dirtyWorkingCopies) {
            await workingCopy.revert({ soft: true });
        }
    });
});
//# sourceMappingURL=mainThreadEditors.js.map