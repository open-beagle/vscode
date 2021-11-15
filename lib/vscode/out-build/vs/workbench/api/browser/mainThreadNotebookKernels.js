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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/common/services/modeService", "vs/workbench/api/common/extHostCustomers", "vs/workbench/contrib/notebook/browser/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookKernelService", "../common/extHost.protocol"], function (require, exports, arrays_1, event_1, lifecycle_1, uri_1, modeService_1, extHostCustomers_1, notebookEditorService_1, notebookKernelService_1, extHost_protocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadNotebookKernels = void 0;
    class MainThreadKernel {
        constructor(data, _modeService) {
            var _a, _b, _c, _d;
            this._modeService = _modeService;
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.id = data.id;
            this.viewType = data.viewType;
            this.extension = data.extensionId;
            this.implementsInterrupt = (_a = data.supportsInterrupt) !== null && _a !== void 0 ? _a : false;
            this.label = data.label;
            this.description = data.description;
            this.detail = data.detail;
            this.supportedLanguages = (0, arrays_1.isNonEmptyArray)(data.supportedLanguages) ? data.supportedLanguages : _modeService.getRegisteredModes();
            this.implementsExecutionOrder = (_b = data.hasExecutionOrder) !== null && _b !== void 0 ? _b : false;
            this.localResourceRoot = uri_1.URI.revive(data.extensionLocation);
            this.preloads = (_d = (_c = data.preloads) === null || _c === void 0 ? void 0 : _c.map(u => ({ uri: uri_1.URI.revive(u.uri), provides: u.provides }))) !== null && _d !== void 0 ? _d : [];
        }
        get preloadUris() {
            return this.preloads.map(p => p.uri);
        }
        get preloadProvides() {
            return (0, arrays_1.flatten)(this.preloads.map(p => p.provides));
        }
        update(data) {
            const event = Object.create(null);
            if (data.label !== undefined) {
                this.label = data.label;
                event.label = true;
            }
            if (data.description !== undefined) {
                this.description = data.description;
                event.description = true;
            }
            if (data.detail !== undefined) {
                this.detail = data.detail;
                event.detail = true;
            }
            if (data.supportedLanguages !== undefined) {
                this.supportedLanguages = (0, arrays_1.isNonEmptyArray)(data.supportedLanguages) ? data.supportedLanguages : this._modeService.getRegisteredModes();
                event.supportedLanguages = true;
            }
            if (data.hasExecutionOrder !== undefined) {
                this.implementsExecutionOrder = data.hasExecutionOrder;
                event.hasExecutionOrder = true;
            }
            this._onDidChange.fire(event);
        }
    }
    let MainThreadNotebookKernels = class MainThreadNotebookKernels {
        constructor(extHostContext, _modeService, _notebookKernelService, notebookEditorService) {
            this._modeService = _modeService;
            this._notebookKernelService = _notebookKernelService;
            this._editors = new Map();
            this._disposables = new lifecycle_1.DisposableStore();
            this._kernels = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostNotebookKernels);
            notebookEditorService.listNotebookEditors().forEach(this._onEditorAdd, this);
            notebookEditorService.onDidAddNotebookEditor(this._onEditorAdd, this, this._disposables);
            notebookEditorService.onDidRemoveNotebookEditor(this._onEditorRemove, this, this._disposables);
        }
        dispose() {
            this._disposables.dispose();
            for (let [, registration] of this._kernels.values()) {
                registration.dispose();
            }
        }
        // --- kernel ipc
        _onEditorAdd(editor) {
            const ipcListener = editor.onDidReceiveMessage(e => {
                if (e.forRenderer) {
                    return;
                }
                if (!editor.hasModel()) {
                    return;
                }
                const { selected } = this._notebookKernelService.getMatchingKernel(editor.viewModel.notebookDocument);
                if (!selected) {
                    return;
                }
                for (let [handle, candidate] of this._kernels) {
                    if (candidate[0] === selected) {
                        this._proxy.$acceptRendererMessage(handle, editor.getId(), e.message);
                        break;
                    }
                }
            });
            this._editors.set(editor, ipcListener);
        }
        _onEditorRemove(editor) {
            var _a;
            (_a = this._editors.get(editor)) === null || _a === void 0 ? void 0 : _a.dispose();
            this._editors.delete(editor);
        }
        async $postMessage(handle, editorId, message) {
            const tuple = this._kernels.get(handle);
            if (!tuple) {
                throw new Error('kernel already disposed');
            }
            const [kernel] = tuple;
            let didSend = false;
            for (const [editor] of this._editors) {
                if (!editor.hasModel()) {
                    continue;
                }
                if (this._notebookKernelService.getMatchingKernel(editor.viewModel.notebookDocument).selected !== kernel) {
                    // different kernel
                    continue;
                }
                if (editorId === undefined) {
                    // all editors
                    editor.postMessage(undefined, message);
                    didSend = true;
                }
                else if (editor.getId() === editorId) {
                    // selected editors
                    editor.postMessage(undefined, message);
                    didSend = true;
                    break;
                }
            }
            return didSend;
        }
        // --- kernel adding/updating/removal
        async $addKernel(handle, data) {
            const that = this;
            const kernel = new class extends MainThreadKernel {
                async executeNotebookCellsRequest(uri, handles) {
                    await that._proxy.$executeCells(handle, uri, handles);
                }
                async cancelNotebookCellExecution(uri, handles) {
                    await that._proxy.$cancelCells(handle, uri, handles);
                }
            }(data, this._modeService);
            const registration = this._notebookKernelService.registerKernel(kernel);
            const listener = this._notebookKernelService.onDidChangeNotebookKernelBinding(e => {
                if (e.oldKernel === kernel.id) {
                    this._proxy.$acceptSelection(handle, e.notebook, false);
                }
                else if (e.newKernel === kernel.id) {
                    this._proxy.$acceptSelection(handle, e.notebook, true);
                }
            });
            this._kernels.set(handle, [kernel, (0, lifecycle_1.combinedDisposable)(listener, registration)]);
        }
        $updateKernel(handle, data) {
            const tuple = this._kernels.get(handle);
            if (tuple) {
                tuple[0].update(data);
            }
        }
        $removeKernel(handle) {
            const tuple = this._kernels.get(handle);
            if (tuple) {
                tuple[1].dispose();
                this._kernels.delete(handle);
            }
        }
        $updateNotebookPriority(handle, notebook, value) {
            const tuple = this._kernels.get(handle);
            if (tuple) {
                this._notebookKernelService.updateKernelNotebookAffinity(tuple[0], uri_1.URI.revive(notebook), value);
            }
        }
    };
    MainThreadNotebookKernels = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadNotebookKernels),
        __param(1, modeService_1.IModeService),
        __param(2, notebookKernelService_1.INotebookKernelService),
        __param(3, notebookEditorService_1.INotebookEditorService)
    ], MainThreadNotebookKernels);
    exports.MainThreadNotebookKernels = MainThreadNotebookKernels;
});
//# sourceMappingURL=mainThreadNotebookKernels.js.map