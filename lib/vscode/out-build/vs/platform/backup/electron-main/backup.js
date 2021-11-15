/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/workspaces/common/workspaces"], function (require, exports, instantiation_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isWorkspaceBackupInfo = exports.IBackupMainService = void 0;
    exports.IBackupMainService = (0, instantiation_1.createDecorator)('backupMainService');
    function isWorkspaceBackupInfo(obj) {
        const candidate = obj;
        return candidate && (0, workspaces_1.isWorkspaceIdentifier)(candidate.workspace);
    }
    exports.isWorkspaceBackupInfo = isWorkspaceBackupInfo;
});
//# sourceMappingURL=backup.js.map