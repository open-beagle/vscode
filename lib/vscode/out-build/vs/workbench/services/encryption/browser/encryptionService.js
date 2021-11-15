/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/encryption/common/encryptionService"], function (require, exports, extensions_1, encryptionService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EncryptionService = void 0;
    class EncryptionService {
        encrypt(value) {
            return Promise.resolve(value);
        }
        decrypt(value) {
            return Promise.resolve(value);
        }
    }
    exports.EncryptionService = EncryptionService;
    (0, extensions_1.registerSingleton)(encryptionService_1.IEncryptionService, EncryptionService, true);
});
//# sourceMappingURL=encryptionService.js.map