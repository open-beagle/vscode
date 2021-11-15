/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestRemoteAgentService = void 0;
    class TestRemoteAgentService {
        constructor() {
            this.socketFactory = {
                connect() { }
            };
        }
        getConnection() {
            throw new Error('Method not implemented.');
        }
        getEnvironment() {
            throw new Error('Method not implemented.');
        }
        getRawEnvironment() {
            throw new Error('Method not implemented.');
        }
        whenExtensionsReady() {
            throw new Error('Method not implemented.');
        }
        scanExtensions(skipExtensions) {
            throw new Error('Method not implemented.');
        }
        scanSingleExtension(extensionLocation, isBuiltin) {
            throw new Error('Method not implemented.');
        }
        getDiagnosticInfo(options) {
            throw new Error('Method not implemented.');
        }
        disableTelemetry() {
            throw new Error('Method not implemented.');
        }
        logTelemetry(eventName, data) {
            throw new Error('Method not implemented.');
        }
        flushTelemetry() {
            throw new Error('Method not implemented.');
        }
    }
    exports.TestRemoteAgentService = TestRemoteAgentService;
});
//# sourceMappingURL=testServices.js.map