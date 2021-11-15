/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/storage/browser/storageService", "vs/platform/log/common/log", "vs/base/parts/storage/common/storage", "vs/base/common/uri", "vs/platform/files/common/fileService", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/platform/storage/test/common/storageService.test"], function (require, exports, assert_1, storageService_1, log_1, storage_1, uri_1, fileService_1, lifecycle_1, network_1, inMemoryFilesystemProvider_1, storageService_test_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StorageService (browser)', function () {
        const disposables = new lifecycle_1.DisposableStore();
        let storageService;
        (0, storageService_test_1.createSuite)({
            setup: async () => {
                const logService = new log_1.NullLogService();
                const fileService = disposables.add(new fileService_1.FileService(logService));
                const userDataProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
                disposables.add(fileService.registerProvider(network_1.Schemas.userData, userDataProvider));
                storageService = disposables.add(new storageService_1.BrowserStorageService({ id: String(Date.now()) }, { userRoamingDataHome: uri_1.URI.file('/User').with({ scheme: network_1.Schemas.userData }) }, fileService));
                await storageService.initialize();
                return storageService;
            },
            teardown: async (storage) => {
                await storageService.flush();
                disposables.clear();
            }
        });
    });
    suite('FileStorageDatabase (browser)', () => {
        let fileService;
        const disposables = new lifecycle_1.DisposableStore();
        setup(async () => {
            const logService = new log_1.NullLogService();
            fileService = disposables.add(new fileService_1.FileService(logService));
            const userDataProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            disposables.add(fileService.registerProvider(network_1.Schemas.userData, userDataProvider));
        });
        teardown(() => {
            disposables.clear();
        });
        test('Basics', async () => {
            const testDir = uri_1.URI.file('/User/storage.json').with({ scheme: network_1.Schemas.userData });
            let storage = new storage_1.Storage(new storageService_1.FileStorageDatabase(testDir, false, fileService));
            await storage.init();
            storage.set('bar', 'foo');
            storage.set('barNumber', 55);
            storage.set('barBoolean', true);
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            (0, assert_1.strictEqual)(storage.get('barNumber'), '55');
            (0, assert_1.strictEqual)(storage.get('barBoolean'), 'true');
            await storage.close();
            storage = new storage_1.Storage(new storageService_1.FileStorageDatabase(testDir, false, fileService));
            await storage.init();
            (0, assert_1.strictEqual)(storage.get('bar'), 'foo');
            (0, assert_1.strictEqual)(storage.get('barNumber'), '55');
            (0, assert_1.strictEqual)(storage.get('barBoolean'), 'true');
            storage.delete('bar');
            storage.delete('barNumber');
            storage.delete('barBoolean');
            (0, assert_1.strictEqual)(storage.get('bar', 'undefined'), 'undefined');
            (0, assert_1.strictEqual)(storage.get('barNumber', 'undefinedNumber'), 'undefinedNumber');
            (0, assert_1.strictEqual)(storage.get('barBoolean', 'undefinedBoolean'), 'undefinedBoolean');
            await storage.close();
            storage = new storage_1.Storage(new storageService_1.FileStorageDatabase(testDir, false, fileService));
            await storage.init();
            (0, assert_1.strictEqual)(storage.get('bar', 'undefined'), 'undefined');
            (0, assert_1.strictEqual)(storage.get('barNumber', 'undefinedNumber'), 'undefinedNumber');
            (0, assert_1.strictEqual)(storage.get('barBoolean', 'undefinedBoolean'), 'undefinedBoolean');
        });
    });
});
//# sourceMappingURL=storageService.test.js.map