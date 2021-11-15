/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/node/id", "vs/base/node/macAddress", "vs/base/test/node/testUtils"], function (require, exports, assert, id_1, macAddress_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('ID', () => {
        test('getMachineId', async function () {
            const id = await (0, id_1.getMachineId)();
            assert.ok(id);
        });
        test('getMac', async () => {
            const macAddress = await (0, macAddress_1.getMac)();
            assert.ok(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress), `Expected a MAC address, got: ${macAddress}`);
        });
    });
});
//# sourceMappingURL=id.test.js.map