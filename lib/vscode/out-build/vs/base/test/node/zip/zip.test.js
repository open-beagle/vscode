/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "os", "fs", "vs/base/node/zip", "vs/base/node/pfs", "vs/base/common/async", "vs/base/test/node/testUtils"], function (require, exports, assert, path, os_1, fs_1, zip_1, pfs_1, async_1, testUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Zip', () => {
        let testDir;
        setup(() => {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'zip');
            return fs_1.promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return (0, pfs_1.rimraf)(testDir);
        });
        test('extract should handle directories', async () => {
            const fixtures = (0, testUtils_1.getPathFromAmdModule)(require, './fixtures');
            const fixture = path.join(fixtures, 'extract.zip');
            await (0, async_1.createCancelablePromise)(token => (0, zip_1.extract)(fixture, testDir, {}, token));
            const doesExist = await (0, pfs_1.exists)(path.join(testDir, 'extension'));
            assert(doesExist);
        });
    });
});
//# sourceMappingURL=zip.test.js.map