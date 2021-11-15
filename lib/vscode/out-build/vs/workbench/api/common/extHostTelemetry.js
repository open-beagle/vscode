/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event"], function (require, exports, instantiation_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostTelemetry = exports.ExtHostTelemetry = void 0;
    class ExtHostTelemetry {
        constructor() {
            this._onDidChangeTelemetryEnabled = new event_1.Emitter();
            this.onDidChangeTelemetryEnabled = this._onDidChangeTelemetryEnabled.event;
            this._enabled = false;
        }
        getTelemetryEnabled() {
            return this._enabled;
        }
        $initializeTelemetryEnabled(enabled) {
            this._enabled = enabled;
        }
        $onDidChangeTelemetryEnabled(enabled) {
            this._enabled = enabled;
            this._onDidChangeTelemetryEnabled.fire(enabled);
        }
    }
    exports.ExtHostTelemetry = ExtHostTelemetry;
    exports.IExtHostTelemetry = (0, instantiation_1.createDecorator)('IExtHostTelemetry');
});
//# sourceMappingURL=extHostTelemetry.js.map