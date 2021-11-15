/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os"], function (require, exports, os_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMac = void 0;
    const invalidMacAddresses = new Set([
        '00:00:00:00:00:00',
        'ff:ff:ff:ff:ff:ff',
        'ac:de:48:00:11:22'
    ]);
    function validateMacAddress(candidate) {
        const tempCandidate = candidate.replace(/\-/g, ':').toLowerCase();
        return !invalidMacAddresses.has(tempCandidate);
    }
    function getMac() {
        return new Promise(async (resolve, reject) => {
            const timeout = setTimeout(() => reject('Unable to retrieve mac address (timeout after 10s)'), 10000);
            try {
                resolve(await doGetMac());
            }
            catch (error) {
                reject(error);
            }
            finally {
                clearTimeout(timeout);
            }
        });
    }
    exports.getMac = getMac;
    function doGetMac() {
        return new Promise((resolve, reject) => {
            try {
                const ifaces = (0, os_1.networkInterfaces)();
                for (let name in ifaces) {
                    const networkInterface = ifaces[name];
                    if (networkInterface) {
                        for (const { mac } of networkInterface) {
                            if (validateMacAddress(mac)) {
                                return resolve(mac);
                            }
                        }
                    }
                }
                reject('Unable to retrieve mac address (unexpected format)');
            }
            catch (err) {
                reject(err);
            }
        });
    }
});
//# sourceMappingURL=macAddress.js.map