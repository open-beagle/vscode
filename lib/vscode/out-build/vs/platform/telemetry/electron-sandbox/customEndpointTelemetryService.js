/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/ipc/electron-sandbox/services", "vs/platform/telemetry/common/telemetry"], function (require, exports, services_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerSharedProcessRemoteService)(telemetry_1.ICustomEndpointTelemetryService, 'customEndpointTelemetry', { supportsDelayedInstantiation: true });
});
//# sourceMappingURL=customEndpointTelemetryService.js.map