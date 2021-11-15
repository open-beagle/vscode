/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/ipc/electron-sandbox/services", "vs/workbench/services/encryption/common/encryptionService"], function (require, exports, services_1, encryptionService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerMainProcessRemoteService)(encryptionService_1.IEncryptionService, 'encryption', { supportsDelayedInstantiation: true });
});
//# sourceMappingURL=encryptionService.js.map