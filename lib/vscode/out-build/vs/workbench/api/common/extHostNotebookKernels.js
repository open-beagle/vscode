/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/platform/extensions/common/extensions", "vs/base/common/uri", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/shared/webview"], function (require, exports, event_1, lifecycle_1, extHost_protocol_1, extensions_1, uri_1, extHostTypeConverters, webview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostNotebookKernels = void 0;
    class ExtHostNotebookKernels {
        constructor(mainContext, _initData, _extHostNotebook) {
            this._initData = _initData;
            this._extHostNotebook = _extHostNotebook;
            this._kernelData = new Map();
            this._handlePool = 0;
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadNotebookKernels);
        }
        createNotebookController(extension, id, viewType, label, handler, preloads) {
            for (let data of this._kernelData.values()) {
                if (data.controller.id === id && extensions_1.ExtensionIdentifier.equals(extension.identifier, data.extensionId)) {
                    throw new Error(`notebook controller with id '${id}' ALREADY exist`);
                }
            }
            const handle = this._handlePool++;
            const that = this;
            const _defaultExecutHandler = () => console.warn(`NO execute handler from notebook controller '${data.id}' of extension: '${extension.identifier}'`);
            let isDisposed = false;
            const commandDisposables = new lifecycle_1.DisposableStore();
            const onDidChangeSelection = new event_1.Emitter();
            const onDidReceiveMessage = new event_1.Emitter();
            const data = {
                id: `${extension.identifier.value}/${id}`,
                viewType,
                extensionId: extension.identifier,
                extensionLocation: extension.extensionLocation,
                label: label || extension.identifier.value,
                preloads: preloads ? preloads.map(extHostTypeConverters.NotebookKernelPreload.from) : []
            };
            //
            let _executeHandler = handler !== null && handler !== void 0 ? handler : _defaultExecutHandler;
            let _interruptHandler;
            // todo@jrieken the selector needs to be massaged
            this._proxy.$addKernel(handle, data).catch(err => {
                // this can happen when a kernel with that ID is already registered
                console.log(err);
                isDisposed = true;
            });
            // update: all setters write directly into the dto object
            // and trigger an update. the actual update will only happen
            // once per event loop execution
            let tokenPool = 0;
            const _update = () => {
                if (isDisposed) {
                    return;
                }
                const myToken = ++tokenPool;
                Promise.resolve().then(() => {
                    if (myToken === tokenPool) {
                        this._proxy.$updateKernel(handle, data);
                    }
                });
            };
            const controller = {
                get id() { return id; },
                get viewType() { return data.viewType; },
                onDidChangeNotebookAssociation: onDidChangeSelection.event,
                get label() {
                    return data.label;
                },
                set label(value) {
                    var _a;
                    data.label = (_a = value !== null && value !== void 0 ? value : extension.displayName) !== null && _a !== void 0 ? _a : extension.name;
                    _update();
                },
                get detail() {
                    var _a;
                    return (_a = data.detail) !== null && _a !== void 0 ? _a : '';
                },
                set detail(value) {
                    data.detail = value;
                    _update();
                },
                get description() {
                    var _a;
                    return (_a = data.description) !== null && _a !== void 0 ? _a : '';
                },
                set description(value) {
                    data.description = value;
                    _update();
                },
                get supportedLanguages() {
                    return data.supportedLanguages;
                },
                set supportedLanguages(value) {
                    data.supportedLanguages = value;
                    _update();
                },
                get hasExecutionOrder() {
                    var _a;
                    return (_a = data.hasExecutionOrder) !== null && _a !== void 0 ? _a : false;
                },
                set hasExecutionOrder(value) {
                    data.hasExecutionOrder = value;
                    _update();
                },
                get preloads() {
                    return data.preloads ? data.preloads.map(extHostTypeConverters.NotebookKernelPreload.to) : [];
                },
                get executeHandler() {
                    return _executeHandler;
                },
                set executeHandler(value) {
                    _executeHandler = value !== null && value !== void 0 ? value : _defaultExecutHandler;
                },
                get interruptHandler() {
                    return _interruptHandler;
                },
                set interruptHandler(value) {
                    _interruptHandler = value;
                    data.supportsInterrupt = Boolean(value);
                    _update();
                },
                createNotebookCellExecutionTask(cell) {
                    if (isDisposed) {
                        throw new Error('notebook controller is DISPOSED');
                    }
                    //todo@jrieken
                    return that._extHostNotebook.createNotebookCellExecution(cell.notebook.uri, cell.index, data.id);
                },
                dispose: () => {
                    if (!isDisposed) {
                        isDisposed = true;
                        this._kernelData.delete(handle);
                        commandDisposables.dispose();
                        onDidChangeSelection.dispose();
                        onDidReceiveMessage.dispose();
                        this._proxy.$removeKernel(handle);
                    }
                },
                // --- ipc
                onDidReceiveMessage: onDidReceiveMessage.event,
                postMessage(message, editor) {
                    return that._proxy.$postMessage(handle, editor && that._extHostNotebook.getIdByEditor(editor), message);
                },
                asWebviewUri(uri) {
                    return (0, webview_1.asWebviewUri)(that._initData.environment, String(handle), uri);
                },
                // --- priority
                updateNotebookAffinity(notebook, priority) {
                    that._proxy.$updateNotebookPriority(handle, notebook.uri, priority);
                }
            };
            this._kernelData.set(handle, { extensionId: extension.identifier, controller, onDidChangeSelection, onDidReceiveMessage });
            return controller;
        }
        $acceptSelection(handle, uri, value) {
            const obj = this._kernelData.get(handle);
            if (obj) {
                obj.onDidChangeSelection.fire({
                    selected: value,
                    notebook: this._extHostNotebook.lookupNotebookDocument(uri_1.URI.revive(uri)).apiNotebook
                });
            }
        }
        async $executeCells(handle, uri, handles) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const document = this._extHostNotebook.lookupNotebookDocument(uri_1.URI.revive(uri));
            if (!document) {
                throw new Error('MISSING notebook');
            }
            const cells = [];
            for (let cellHandle of handles) {
                const cell = document.getCell(cellHandle);
                if (cell) {
                    cells.push(cell.apiCell);
                }
            }
            try {
                await obj.controller.executeHandler.call(obj.controller, cells, document.apiNotebook, obj.controller);
            }
            catch (err) {
                //
                console.error(err);
            }
        }
        async $cancelCells(handle, uri, handles) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const document = this._extHostNotebook.lookupNotebookDocument(uri_1.URI.revive(uri));
            if (!document) {
                throw new Error('MISSING notebook');
            }
            if (obj.controller.interruptHandler) {
                await obj.controller.interruptHandler.call(obj.controller, document.apiNotebook);
            }
            // we do both? interrupt and cancellation or should we be selective?
            for (let cellHandle of handles) {
                const cell = document.getCell(cellHandle);
                if (cell) {
                    this._extHostNotebook.cancelOneNotebookCellExecution(cell);
                }
            }
        }
        $acceptRendererMessage(handle, editorId, message) {
            const obj = this._kernelData.get(handle);
            if (!obj) {
                // extension can dispose kernels in the meantime
                return;
            }
            const editor = this._extHostNotebook.getEditorById(editorId);
            if (!editor) {
                throw new Error(`send message for UNKNOWN editor: ${editorId}`);
            }
            obj.onDidReceiveMessage.fire(Object.freeze({ editor: editor.apiEditor, message }));
        }
    }
    exports.ExtHostNotebookKernels = ExtHostNotebookKernels;
});
//# sourceMappingURL=extHostNotebookKernels.js.map