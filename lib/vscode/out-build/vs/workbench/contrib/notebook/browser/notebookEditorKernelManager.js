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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/notebookEditorKernelManager", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/commands/common/commands", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/platform/workspace/common/workspaceTrust"], function (require, exports, nls, lifecycle_1, notebookCommon_1, commands_1, notebookKernelService_1, workspaceTrust_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditorKernelManager = void 0;
    let NotebookEditorKernelManager = class NotebookEditorKernelManager extends lifecycle_1.Disposable {
        constructor(_commandService, _notebookKernelService, _workspaceTrustRequestService) {
            super();
            this._commandService = _commandService;
            this._notebookKernelService = _notebookKernelService;
            this._workspaceTrustRequestService = _workspaceTrustRequestService;
        }
        getSelectedOrSuggestedKernel(notebook) {
            // returns SELECTED or the ONLY available kernel
            const info = this._notebookKernelService.getMatchingKernel(notebook);
            if (info.selected) {
                return info.selected;
            }
            if (info.all.length === 1) {
                return info.all[0];
            }
            return undefined;
        }
        async executeNotebookCells(notebook, cells) {
            const message = nls.localize(0, null);
            const trust = await this._workspaceTrustRequestService.requestWorkspaceTrust({
                modal: true,
                message
            });
            if (!trust) {
                return;
            }
            if (!notebook.metadata.trusted) {
                return;
            }
            let kernel = this.getSelectedOrSuggestedKernel(notebook);
            if (!kernel) {
                await this._commandService.executeCommand('notebook.selectKernel');
                kernel = this.getSelectedOrSuggestedKernel(notebook);
            }
            if (!kernel) {
                return;
            }
            const cellHandles = [];
            for (const cell of cells) {
                if (cell.cellKind !== notebookCommon_1.CellKind.Code) {
                    continue;
                }
                if (!kernel.supportedLanguages.includes(cell.language)) {
                    continue;
                }
                cellHandles.push(cell.handle);
            }
            if (cellHandles.length > 0) {
                this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
                await kernel.executeNotebookCellsRequest(notebook.uri, cellHandles);
            }
        }
        async cancelNotebookCells(notebook, cells) {
            let kernel = this.getSelectedOrSuggestedKernel(notebook);
            if (kernel) {
                await kernel.cancelNotebookCellExecution(notebook.uri, Array.from(cells, cell => cell.handle));
            }
        }
    };
    NotebookEditorKernelManager = __decorate([
        __param(0, commands_1.ICommandService),
        __param(1, notebookKernelService_1.INotebookKernelService),
        __param(2, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], NotebookEditorKernelManager);
    exports.NotebookEditorKernelManager = NotebookEditorKernelManager;
});
//# sourceMappingURL=notebookEditorKernelManager.js.map