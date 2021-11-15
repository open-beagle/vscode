/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/workspace/common/workspaceTrust", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWorkspaceTrustRequestService = exports.IWorkspaceTrustManagementService = exports.workspaceTrustToString = exports.WorkspaceTrustScope = void 0;
    var WorkspaceTrustScope;
    (function (WorkspaceTrustScope) {
        WorkspaceTrustScope[WorkspaceTrustScope["Local"] = 0] = "Local";
        WorkspaceTrustScope[WorkspaceTrustScope["Remote"] = 1] = "Remote";
    })(WorkspaceTrustScope = exports.WorkspaceTrustScope || (exports.WorkspaceTrustScope = {}));
    function workspaceTrustToString(trustState) {
        if (trustState) {
            return (0, nls_1.localize)(0, null);
        }
        else {
            return (0, nls_1.localize)(1, null);
        }
    }
    exports.workspaceTrustToString = workspaceTrustToString;
    exports.IWorkspaceTrustManagementService = (0, instantiation_1.createDecorator)('workspaceTrustManagementService');
    exports.IWorkspaceTrustRequestService = (0, instantiation_1.createDecorator)('workspaceTrustRequestService');
});
//# sourceMappingURL=workspaceTrust.js.map