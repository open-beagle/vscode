/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, lifecycle_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellOutputViewModel = void 0;
    let handle = 0;
    class CellOutputViewModel extends lifecycle_1.Disposable {
        constructor(cellViewModel, _outputRawData, _notebookService) {
            super();
            this.cellViewModel = cellViewModel;
            this._outputRawData = _outputRawData;
            this._notebookService = _notebookService;
            this.outputHandle = handle++;
            this._pickedMimeType = -1;
        }
        get model() {
            return this._outputRawData;
        }
        get pickedMimeType() {
            return this._pickedMimeType;
        }
        set pickedMimeType(value) {
            this._pickedMimeType = value;
        }
        supportAppend() {
            // if there is any mime type that's not mergeable then the whole output is not mergeable.
            return this._outputRawData.outputs.every(op => (0, notebookCommon_1.mimeTypeIsMergeable)(op.mime));
        }
        resolveMimeTypes(textModel, kernelProvides) {
            const mimeTypes = this._notebookService.getMimeTypeInfo(textModel, kernelProvides, this.model);
            if (this._pickedMimeType === -1) {
                // there is at least one mimetype which is safe and can be rendered by the core
                this._pickedMimeType = Math.max(mimeTypes.findIndex(mimeType => mimeType.rendererId !== notebookCommon_1.RENDERER_NOT_AVAILABLE && mimeType.isTrusted), 0);
            }
            return [mimeTypes, this._pickedMimeType];
        }
        toRawJSON() {
            return {
                outputs: this._outputRawData.outputs,
                // TODO@rebronix, no id, right?
            };
        }
    }
    exports.CellOutputViewModel = CellOutputViewModel;
});
//# sourceMappingURL=cellOutputViewModel.js.map