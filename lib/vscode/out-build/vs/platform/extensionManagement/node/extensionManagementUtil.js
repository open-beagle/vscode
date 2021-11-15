/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/node/zip", "vs/nls!vs/platform/extensionManagement/node/extensionManagementUtil"], function (require, exports, zip_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getManifest = void 0;
    function getManifest(vsix) {
        return (0, zip_1.buffer)(vsix, 'extension/package.json')
            .then(buffer => {
            try {
                return JSON.parse(buffer.toString('utf8'));
            }
            catch (err) {
                throw new Error((0, nls_1.localize)(0, null));
            }
        });
    }
    exports.getManifest = getManifest;
});
//# sourceMappingURL=extensionManagementUtil.js.map