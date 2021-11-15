/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "os", "fs", "vs/base/common/path", "vs/base/test/node/testUtils", "vs/platform/state/node/stateService", "vs/base/node/pfs"], function (require, exports, assert, os_1, fs_1, path_1, testUtils_1, stateService_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('StateService', () => {
        let testDir;
        setup(() => {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'stateservice');
            return fs_1.promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return (0, pfs_1.rimraf)(testDir);
        });
        test('Basics', async function () {
            const storageFile = (0, path_1.join)(testDir, 'storage.json');
            (0, pfs_1.writeFileSync)(storageFile, '');
            let service = new stateService_1.FileStorage(storageFile, () => null);
            service.setItem('some.key', 'some.value');
            assert.strictEqual(service.getItem('some.key'), 'some.value');
            service.removeItem('some.key');
            assert.strictEqual(service.getItem('some.key', 'some.default'), 'some.default');
            assert.ok(!service.getItem('some.unknonw.key'));
            service.setItem('some.other.key', 'some.other.value');
            service = new stateService_1.FileStorage(storageFile, () => null);
            assert.strictEqual(service.getItem('some.other.key'), 'some.other.value');
            service.setItem('some.other.key', 'some.other.value');
            assert.strictEqual(service.getItem('some.other.key'), 'some.other.value');
            service.setItem('some.undefined.key', undefined);
            assert.strictEqual(service.getItem('some.undefined.key', 'some.default'), 'some.default');
            service.setItem('some.null.key', null);
            assert.strictEqual(service.getItem('some.null.key', 'some.default'), 'some.default');
        });
    });
});
//# sourceMappingURL=state.test.js.map