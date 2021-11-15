/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EncryptionMainService = exports.IEncryptionMainService = void 0;
    exports.IEncryptionMainService = (0, instantiation_1.createDecorator)('encryptionMainService');
    class EncryptionMainService {
        constructor(machineId) {
            this.machineId = machineId;
        }
        encryption() {
            return new Promise((resolve, reject) => require(['vscode-encrypt'], resolve, reject));
        }
        async encrypt(value) {
            try {
                const encryption = await this.encryption();
                return encryption.encrypt(this.machineId, value);
            }
            catch (e) {
                return value;
            }
        }
        async decrypt(value) {
            try {
                const encryption = await this.encryption();
                return encryption.decrypt(this.machineId, value);
            }
            catch (e) {
                return value;
            }
        }
    }
    exports.EncryptionMainService = EncryptionMainService;
});
//# sourceMappingURL=encryptionMainService.js.map