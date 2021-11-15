/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/worker/extHostExtensionService", "vs/workbench/api/worker/extHostLogService"], function (require, exports, extensions_1, log_1, extHostExtensionService_1, extHostExtensionService_2, extHostLogService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // #########################################################################
    // ###                                                                   ###
    // ### !!! PLEASE ADD COMMON IMPORTS INTO extHost.common.services.ts !!! ###
    // ###                                                                   ###
    // #########################################################################
    (0, extensions_1.registerSingleton)(extHostExtensionService_1.IExtHostExtensionService, extHostExtensionService_2.ExtHostExtensionService);
    (0, extensions_1.registerSingleton)(log_1.ILogService, extHostLogService_1.ExtHostLogService);
});
//# sourceMappingURL=extHost.worker.services.js.map