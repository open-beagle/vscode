/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/hash"], function (require, exports, buffer_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sha1Hex = void 0;
    async function sha1Hex(str) {
        var _a;
        // Prefer to use browser's crypto module
        if ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _a === void 0 ? void 0 : _a.subtle) {
            // Careful to use `dontUseNodeBuffer` when passing the
            // buffer to the browser `crypto` API. Users reported
            // native crashes in certain cases that we could trace
            // back to passing node.js `Buffer` around
            // (https://github.com/microsoft/vscode/issues/114227)
            const buffer = buffer_1.VSBuffer.fromString(str, { dontUseNodeBuffer: true }).buffer;
            const hash = await globalThis.crypto.subtle.digest({ name: 'sha-1' }, buffer);
            return (0, hash_1.toHexString)(hash);
        }
        // Otherwise fallback to `StringSHA1`
        else {
            const computer = new hash_1.StringSHA1();
            computer.update(str);
            return computer.digest();
        }
    }
    exports.sha1Hex = sha1Hex;
});
//# sourceMappingURL=hash.js.map