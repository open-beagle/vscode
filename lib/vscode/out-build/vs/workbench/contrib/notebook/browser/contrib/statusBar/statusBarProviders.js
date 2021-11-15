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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/editor/common/services/modeService", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/statusBar/statusBarProviders", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService"], function (require, exports, lifecycle_1, platform_1, modeService_1, nls_1, instantiation_1, platform_2, contributions_1, notebookBrowser_1, notebookCellStatusBarService_1, notebookCommon_1, notebookService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let CellStatusBarPlaceholderProvider = class CellStatusBarPlaceholderProvider {
        constructor(_notebookService) {
            this._notebookService = _notebookService;
            this.selector = {
                pattern: '**/*'
            };
        }
        async provideCellStatusBarItems(uri, index, token) {
            const doc = this._notebookService.getNotebookTextModel(uri);
            const cell = doc === null || doc === void 0 ? void 0 : doc.cells[index];
            if (!cell || typeof cell.metadata.runState !== 'undefined' || typeof cell.metadata.lastRunSuccess !== 'undefined') {
                return;
            }
            let text;
            if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                text = platform_1.isWindows ?
                    (0, nls_1.localize)(0, null) :
                    (0, nls_1.localize)(1, null);
            }
            else {
                text = (0, nls_1.localize)(2, null);
            }
            const item = {
                text,
                tooltip: text,
                alignment: 1 /* Left */,
                opacity: '0.7',
                onlyShowWhenActive: true
            };
            return {
                items: [item]
            };
        }
    };
    CellStatusBarPlaceholderProvider = __decorate([
        __param(0, notebookService_1.INotebookService)
    ], CellStatusBarPlaceholderProvider);
    let CellStatusBarLanguagePickerProvider = class CellStatusBarLanguagePickerProvider {
        constructor(_notebookService, _modeService) {
            this._notebookService = _notebookService;
            this._modeService = _modeService;
            this.selector = {
                pattern: '**/*'
            };
        }
        async provideCellStatusBarItems(uri, index, _token) {
            const doc = this._notebookService.getNotebookTextModel(uri);
            const cell = doc === null || doc === void 0 ? void 0 : doc.cells[index];
            if (!cell) {
                return;
            }
            const modeId = cell.cellKind === notebookCommon_1.CellKind.Markdown ?
                'markdown' :
                (this._modeService.getModeIdForLanguageName(cell.language) || cell.language);
            const text = this._modeService.getLanguageName(modeId) || this._modeService.getLanguageName('plaintext');
            const item = {
                text,
                command: notebookBrowser_1.CHANGE_CELL_LANGUAGE,
                tooltip: (0, nls_1.localize)(3, null),
                alignment: 2 /* Right */,
                priority: -Number.MAX_SAFE_INTEGER
            };
            return {
                items: [item]
            };
        }
    };
    CellStatusBarLanguagePickerProvider = __decorate([
        __param(0, notebookService_1.INotebookService),
        __param(1, modeService_1.IModeService)
    ], CellStatusBarLanguagePickerProvider);
    let BuiltinCellStatusBarProviders = class BuiltinCellStatusBarProviders extends lifecycle_1.Disposable {
        constructor(instantiationService, notebookCellStatusBarService) {
            super();
            const builtinProviders = [
                CellStatusBarPlaceholderProvider,
                CellStatusBarLanguagePickerProvider,
            ];
            builtinProviders.forEach(p => {
                this._register(notebookCellStatusBarService.registerCellStatusBarItemProvider(instantiationService.createInstance(p)));
            });
        }
    };
    BuiltinCellStatusBarProviders = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, notebookCellStatusBarService_1.INotebookCellStatusBarService)
    ], BuiltinCellStatusBarProviders);
    platform_2.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(BuiltinCellStatusBarProviders, 3 /* Restored */);
});
//# sourceMappingURL=statusBarProviders.js.map