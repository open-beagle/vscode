/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/base/common/uuid", "vs/base/common/lifecycle", "vs/platform/files/common/fileService", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/storage/common/storage", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/uri", "vs/base/common/resources", "vs/base/test/common/mock"], function (require, exports, assert, extensionGalleryService_1, uuid_1, lifecycle_1, fileService_1, log_1, product_1, storage_1, inMemoryFilesystemProvider_1, uri_1, resources_1, mock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EnvironmentServiceMock extends (0, mock_1.mock)() {
        constructor(serviceMachineIdResource) {
            super();
            this.serviceMachineIdResource = serviceMachineIdResource;
        }
    }
    suite('Extension Gallery Service', () => {
        const disposables = new lifecycle_1.DisposableStore();
        let fileService, environmentService, storageService;
        setup(() => {
            const serviceMachineIdResource = (0, resources_1.joinPath)(uri_1.URI.file('tests').with({ scheme: 'vscode-tests' }), 'machineid');
            environmentService = new EnvironmentServiceMock(serviceMachineIdResource);
            fileService = disposables.add(new fileService_1.FileService(new log_1.NullLogService()));
            const fileSystemProvider = disposables.add(new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            fileService.registerProvider(serviceMachineIdResource.scheme, fileSystemProvider);
            storageService = new storage_1.InMemoryStorageService();
        });
        teardown(() => disposables.clear());
        test('marketplace machine id', async () => {
            const headers = await (0, extensionGalleryService_1.resolveMarketplaceHeaders)(product_1.default.version, environmentService, fileService, storageService);
            assert.ok((0, uuid_1.isUUID)(headers['X-Market-User-Id']));
            const headers2 = await (0, extensionGalleryService_1.resolveMarketplaceHeaders)(product_1.default.version, environmentService, fileService, storageService);
            assert.strictEqual(headers['X-Market-User-Id'], headers2['X-Market-User-Id']);
        });
    });
});
//# sourceMappingURL=extensionGalleryService.test.js.map