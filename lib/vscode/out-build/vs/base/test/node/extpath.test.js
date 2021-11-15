/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "fs", "vs/base/node/pfs", "vs/base/node/extpath", "vs/base/test/node/testUtils"], function (require, exports, assert, os_1, fs_1, pfs_1, extpath_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('Extpath', () => {
        let testDir;
        setup(() => {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'extpath');
            return fs_1.promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return (0, pfs_1.rimraf)(testDir);
        });
        test('realcase', async () => {
            // assume case insensitive file system
            if (process.platform === 'win32' || process.platform === 'darwin') {
                const upper = testDir.toUpperCase();
                const real = (0, extpath_1.realcaseSync)(upper);
                if (real) { // can be null in case of permission errors
                    assert.notStrictEqual(real, upper);
                    assert.strictEqual(real.toUpperCase(), upper);
                    assert.strictEqual(real, testDir);
                }
            }
            // linux, unix, etc. -> assume case sensitive file system
            else {
                const real = (0, extpath_1.realcaseSync)(testDir);
                assert.strictEqual(real, testDir);
            }
        });
        test('realpath', async () => {
            const realpathVal = await (0, extpath_1.realpath)(testDir);
            assert.ok(realpathVal);
        });
        test('realpathSync', () => {
            const realpath = (0, extpath_1.realpathSync)(testDir);
            assert.ok(realpath);
        });
    });
});
//# sourceMappingURL=extpath.test.js.map