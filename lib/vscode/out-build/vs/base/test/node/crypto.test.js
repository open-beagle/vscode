/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/node/crypto", "vs/base/common/path", "os", "fs", "vs/base/node/pfs", "vs/base/test/node/testUtils"], function (require, exports, crypto_1, path_1, os_1, fs_1, pfs_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('Crypto', () => {
        let testDir;
        setup(function () {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'crypto');
            return fs_1.promises.mkdir(testDir, { recursive: true });
        });
        teardown(function () {
            return (0, pfs_1.rimraf)(testDir);
        });
        test('checksum', async () => {
            const testFile = (0, path_1.join)(testDir, 'checksum.txt');
            await (0, pfs_1.writeFile)(testFile, 'Hello World');
            await (0, crypto_1.checksum)(testFile, '0a4d55a8d778e5022fab701977c5d840bbc486d0');
        });
    });
});
//# sourceMappingURL=crypto.test.js.map