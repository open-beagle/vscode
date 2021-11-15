/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/ipc/electron-sandbox/services", "vs/platform/diagnostics/common/diagnostics"], function (require, exports, services_1, diagnostics_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerSharedProcessRemoteService)(diagnostics_1.IDiagnosticsService, 'diagnostics', { supportsDelayedInstantiation: true });
});
//# sourceMappingURL=diagnosticsService.js.map