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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/status/editorStatus", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/services/editor/common/editorService", "vs/workbench/common/contributions", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/common/statusbar", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/platform/theme/common/themeService", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/platform/label/common/label", "vs/platform/log/common/log"], function (require, exports, nls, platform_1, actions_1, quickInput_1, coreActions_1, notebookBrowser_1, editorService_1, contributions_1, lifecycle_1, statusbar_1, notebookIcons_1, themeService_1, extensions_1, notebookKernelService_1, label_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActiveCellStatus = exports.KernelStatus = void 0;
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.selectKernel',
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                title: { value: nls.localize(0, null), original: 'Select Notebook Kernel' },
                precondition: notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR,
                icon: notebookIcons_1.selectKernelIcon,
                f1: true,
                description: {
                    description: nls.localize(1, null),
                    args: [
                        {
                            name: 'kernelInfo',
                            description: 'The kernel info',
                            schema: {
                                'type': 'object',
                                'required': ['id', 'extension'],
                                'properties': {
                                    'id': {
                                        'type': 'string'
                                    },
                                    'extension': {
                                        'type': 'string'
                                    }
                                }
                            }
                        }
                    ]
                },
            });
        }
        async run(accessor, context) {
            const notebookKernelService = accessor.get(notebookKernelService_1.INotebookKernelService);
            const editorService = accessor.get(editorService_1.IEditorService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const labelService = accessor.get(label_1.ILabelService);
            const logService = accessor.get(log_1.ILogService);
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!editor || !editor.hasModel()) {
                return false;
            }
            if (context && (typeof context.id !== 'string' || typeof context.extension !== 'string')) {
                // validate context: id & extension MUST be strings
                context = undefined;
            }
            const notebook = editor.viewModel.notebookDocument;
            const { selected, all } = notebookKernelService.getMatchingKernel(notebook);
            if (selected && context && selected.id === context.id && extensions_1.ExtensionIdentifier.equals(selected.extension, context.extension)) {
                // current kernel is wanted kernel -> done
                return true;
            }
            let newKernel;
            if (context) {
                const wantedId = `${context.extension}/${context.id}`;
                for (let candidate of all) {
                    if (candidate.id === wantedId) {
                        newKernel = candidate;
                        break;
                    }
                }
                if (!newKernel) {
                    logService.warn(`wanted kernel DOES NOT EXIST, wanted: ${wantedId}, all: ${all.map(k => k.id)}`);
                    return false;
                }
            }
            if (!newKernel) {
                const configButton = {
                    iconClass: themeService_1.ThemeIcon.asClassName(notebookIcons_1.configureKernelIcon),
                    tooltip: nls.localize(2, null, editor.viewModel.viewType)
                };
                const picks = all.map(kernel => {
                    const res = {
                        kernel,
                        picked: kernel.id === (selected === null || selected === void 0 ? void 0 : selected.id),
                        label: kernel.label,
                        description: kernel.description,
                        detail: kernel.detail,
                        buttons: [configButton]
                    };
                    if (kernel.id === (selected === null || selected === void 0 ? void 0 : selected.id)) {
                        if (!res.description) {
                            res.description = nls.localize(3, null);
                        }
                        else {
                            res.description = nls.localize(4, null, res.description);
                        }
                    }
                    {
                        return res;
                    }
                });
                const pick = await quickInputService.pick(picks, {
                    placeHolder: selected
                        ? nls.localize(5, null, labelService.getUriLabel(notebook.uri, { relative: true }))
                        : nls.localize(6, null, labelService.getUriLabel(notebook.uri, { relative: true })),
                    onDidTriggerItemButton: (context) => {
                        notebookKernelService.selectKernelForNotebookType(context.item.kernel, notebook.viewType);
                    }
                });
                if (pick) {
                    newKernel = pick.kernel;
                }
            }
            if (newKernel) {
                notebookKernelService.selectKernelForNotebook(newKernel, notebook);
                return true;
            }
            return false;
        }
    });
    let KernelStatus = class KernelStatus extends lifecycle_1.Disposable {
        constructor(_editorService, _statusbarService, _notebookKernelService) {
            super();
            this._editorService = _editorService;
            this._statusbarService = _statusbarService;
            this._notebookKernelService = _notebookKernelService;
            this._editorDisposables = this._register(new lifecycle_1.DisposableStore());
            this._kernelInfoElement = this._register(new lifecycle_1.MutableDisposable());
            this._register(this._editorService.onDidActiveEditorChange(() => this._updateStatusbar()));
        }
        _updateStatusbar() {
            this._editorDisposables.clear();
            const activeEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
            if (!activeEditor) {
                // not a notebook -> clean-up, done
                this._kernelInfoElement.clear();
                return;
            }
            const updateStatus = () => {
                var _a;
                const notebook = (_a = activeEditor.viewModel) === null || _a === void 0 ? void 0 : _a.notebookDocument;
                if (notebook) {
                    this._showKernelStatus(notebook);
                }
                else {
                    this._kernelInfoElement.clear();
                }
            };
            this._editorDisposables.add(this._notebookKernelService.onDidAddKernel(updateStatus));
            this._editorDisposables.add(this._notebookKernelService.onDidChangeNotebookKernelBinding(updateStatus));
            this._editorDisposables.add(this._notebookKernelService.onDidChangeNotebookAffinity(updateStatus));
            this._editorDisposables.add(activeEditor.onDidChangeModel(updateStatus));
            updateStatus();
        }
        _showKernelStatus(notebook) {
            var _a, _b;
            let { selected, all } = this._notebookKernelService.getMatchingKernel(notebook);
            let isSuggested = false;
            if (all.length === 0) {
                // no kernel -> no status
                this._kernelInfoElement.clear();
                return;
            }
            else if (selected || all.length === 1) {
                // selected or single kernel
                if (!selected) {
                    selected = all[0];
                    isSuggested = true;
                }
                const text = `$(notebook-kernel-select) ${selected.label}`;
                const tooltip = (_b = (_a = selected.description) !== null && _a !== void 0 ? _a : selected.detail) !== null && _b !== void 0 ? _b : selected.label;
                const registration = this._statusbarService.addEntry({
                    text,
                    ariaLabel: selected.label,
                    tooltip: isSuggested ? nls.localize(7, null, tooltip) : tooltip,
                    command: 'notebook.selectKernel',
                }, 'notebook.selectKernel', nls.localize(8, null), 1 /* RIGHT */, 1000);
                const listener = selected.onDidChange(() => this._showKernelStatus(notebook));
                this._kernelInfoElement.value = (0, lifecycle_1.combinedDisposable)(listener, registration);
            }
            else {
                // multiple kernels -> show selection hint
                const registration = this._statusbarService.addEntry({
                    text: nls.localize(9, null),
                    ariaLabel: nls.localize(10, null),
                    command: 'notebook.selectKernel',
                    backgroundColor: { id: 'statusBarItem.prominentBackground' }
                }, 'notebook.selectKernel', nls.localize(11, null), 1 /* RIGHT */, 1000);
                this._kernelInfoElement.value = registration;
            }
        }
    };
    KernelStatus = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, notebookKernelService_1.INotebookKernelService)
    ], KernelStatus);
    exports.KernelStatus = KernelStatus;
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(KernelStatus, 2 /* Ready */);
    let ActiveCellStatus = class ActiveCellStatus extends lifecycle_1.Disposable {
        constructor(_editorService, _statusbarService) {
            super();
            this._editorService = _editorService;
            this._statusbarService = _statusbarService;
            this._itemDisposables = this._register(new lifecycle_1.DisposableStore());
            this._accessor = this._register(new lifecycle_1.MutableDisposable());
            this._register(this._editorService.onDidActiveEditorChange(() => this._update()));
        }
        _update() {
            this._itemDisposables.clear();
            const activeEditor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(this._editorService.activeEditorPane);
            if (activeEditor) {
                this._itemDisposables.add(activeEditor.onDidChangeSelection(() => this._show(activeEditor)));
                this._itemDisposables.add(activeEditor.onDidChangeActiveCell(() => this._show(activeEditor)));
                this._show(activeEditor);
            }
            else {
                this._accessor.clear();
            }
        }
        _show(editor) {
            const vm = editor.viewModel;
            if (!vm) {
                this._accessor.clear();
                return;
            }
            const newText = this._getSelectionsText(editor, vm);
            if (!newText) {
                this._accessor.clear();
                return;
            }
            const entry = { text: newText, ariaLabel: newText };
            if (!this._accessor.value) {
                this._accessor.value = this._statusbarService.addEntry(entry, 'notebook.activeCellStatus', nls.localize(12, null), 1 /* RIGHT */, 100);
            }
            else {
                this._accessor.value.update(entry);
            }
        }
        _getSelectionsText(editor, vm) {
            const activeCell = editor.getActiveCell();
            if (!activeCell) {
                return undefined;
            }
            const idxFocused = vm.getCellIndex(activeCell) + 1;
            const numSelected = vm.getSelections().reduce((prev, range) => prev + (range.end - range.start), 0);
            return numSelected > 1 ?
                nls.localize(13, null, idxFocused, numSelected) :
                nls.localize(14, null, idxFocused);
        }
    };
    ActiveCellStatus = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, statusbar_1.IStatusbarService)
    ], ActiveCellStatus);
    exports.ActiveCellStatus = ActiveCellStatus;
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ActiveCellStatus, 2 /* Ready */);
});
//# sourceMappingURL=editorStatus.js.map