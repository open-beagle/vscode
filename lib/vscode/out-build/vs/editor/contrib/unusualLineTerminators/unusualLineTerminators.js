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
define(["require", "exports", "vs/nls!vs/editor/contrib/unusualLineTerminators/unusualLineTerminators", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/platform/dialogs/common/dialogs"], function (require, exports, nls, lifecycle_1, editorExtensions_1, codeEditorService_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ignoreUnusualLineTerminators = 'ignoreUnusualLineTerminators';
    function writeIgnoreState(codeEditorService, model, state) {
        codeEditorService.setModelProperty(model.uri, ignoreUnusualLineTerminators, state);
    }
    function readIgnoreState(codeEditorService, model) {
        return codeEditorService.getModelProperty(model.uri, ignoreUnusualLineTerminators);
    }
    let UnusualLineTerminatorsDetector = class UnusualLineTerminatorsDetector extends lifecycle_1.Disposable {
        constructor(_editor, _dialogService, _codeEditorService) {
            super();
            this._editor = _editor;
            this._dialogService = _dialogService;
            this._codeEditorService = _codeEditorService;
            this._config = this._editor.getOption(110 /* unusualLineTerminators */);
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(110 /* unusualLineTerminators */)) {
                    this._config = this._editor.getOption(110 /* unusualLineTerminators */);
                    this._checkForUnusualLineTerminators();
                }
            }));
            this._register(this._editor.onDidChangeModel(() => {
                this._checkForUnusualLineTerminators();
            }));
            this._register(this._editor.onDidChangeModelContent((e) => {
                if (e.isUndoing) {
                    // skip checking in case of undoing
                    return;
                }
                this._checkForUnusualLineTerminators();
            }));
        }
        async _checkForUnusualLineTerminators() {
            if (this._config === 'off') {
                return;
            }
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            if (!model.mightContainUnusualLineTerminators()) {
                return;
            }
            const ignoreState = readIgnoreState(this._codeEditorService, model);
            if (ignoreState === true) {
                // this model should be ignored
                return;
            }
            if (this._editor.getOption(77 /* readOnly */)) {
                // read only editor => sorry!
                return;
            }
            if (this._config === 'auto') {
                // just do it!
                model.removeUnusualLineTerminators(this._editor.getSelections());
                return;
            }
            const result = await this._dialogService.confirm({
                title: nls.localize(0, null),
                message: nls.localize(1, null),
                detail: nls.localize(2, null),
                primaryButton: nls.localize(3, null),
                secondaryButton: nls.localize(4, null)
            });
            if (!result.confirmed) {
                // this model should be ignored
                writeIgnoreState(this._codeEditorService, model, true);
                return;
            }
            model.removeUnusualLineTerminators(this._editor.getSelections());
        }
    };
    UnusualLineTerminatorsDetector.ID = 'editor.contrib.unusualLineTerminatorsDetector';
    UnusualLineTerminatorsDetector = __decorate([
        __param(1, dialogs_1.IDialogService),
        __param(2, codeEditorService_1.ICodeEditorService)
    ], UnusualLineTerminatorsDetector);
    (0, editorExtensions_1.registerEditorContribution)(UnusualLineTerminatorsDetector.ID, UnusualLineTerminatorsDetector);
});
//# sourceMappingURL=unusualLineTerminators.js.map