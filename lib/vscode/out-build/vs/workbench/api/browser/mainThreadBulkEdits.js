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
define(["require", "exports", "vs/editor/browser/services/bulkEditService", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostCustomers", "vs/workbench/api/browser/mainThreadEditors", "vs/platform/log/common/log"], function (require, exports, bulkEditService_1, extHost_protocol_1, extHostCustomers_1, mainThreadEditors_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadBulkEdits = void 0;
    let MainThreadBulkEdits = class MainThreadBulkEdits {
        constructor(_extHostContext, _bulkEditService, _logService) {
            this._bulkEditService = _bulkEditService;
            this._logService = _logService;
        }
        dispose() { }
        $tryApplyWorkspaceEdit(dto, undoRedoGroupId) {
            const edits = (0, mainThreadEditors_1.reviveWorkspaceEditDto2)(dto);
            return this._bulkEditService.apply(edits, { undoRedoGroupId }).then(() => true, err => {
                this._logService.warn('IGNORING workspace edit', err);
                return false;
            });
        }
    };
    MainThreadBulkEdits = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadBulkEdits),
        __param(1, bulkEditService_1.IBulkEditService),
        __param(2, log_1.ILogService)
    ], MainThreadBulkEdits);
    exports.MainThreadBulkEdits = MainThreadBulkEdits;
});
//# sourceMappingURL=mainThreadBulkEdits.js.map