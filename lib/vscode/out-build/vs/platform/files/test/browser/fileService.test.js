/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/files/common/fileService", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/base/common/async", "vs/platform/files/test/common/nullFileSystemProvider", "vs/base/common/stream"], function (require, exports, assert, fileService_1, uri_1, files_1, lifecycle_1, log_1, async_1, nullFileSystemProvider_1, stream_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('File Service', () => {
        test('provider registration', async () => {
            const service = new fileService_1.FileService(new log_1.NullLogService());
            const resource = uri_1.URI.parse('test://foo/bar');
            const provider = new nullFileSystemProvider_1.NullFileSystemProvider();
            assert.strictEqual(service.canHandleResource(resource), false);
            assert.strictEqual(service.getProvider(resource.scheme), undefined);
            const registrations = [];
            service.onDidChangeFileSystemProviderRegistrations(e => {
                registrations.push(e);
            });
            const capabilityChanges = [];
            service.onDidChangeFileSystemProviderCapabilities(e => {
                capabilityChanges.push(e);
            });
            let registrationDisposable;
            let callCount = 0;
            service.onWillActivateFileSystemProvider(e => {
                callCount++;
                if (e.scheme === 'test' && callCount === 1) {
                    e.join(new Promise(resolve => {
                        registrationDisposable = service.registerProvider('test', provider);
                        resolve();
                    }));
                }
            });
            await service.activateProvider('test');
            assert.strictEqual(service.canHandleResource(resource), true);
            assert.strictEqual(service.getProvider(resource.scheme), provider);
            assert.strictEqual(registrations.length, 1);
            assert.strictEqual(registrations[0].scheme, 'test');
            assert.strictEqual(registrations[0].added, true);
            assert.ok(registrationDisposable);
            assert.strictEqual(capabilityChanges.length, 0);
            provider.setCapabilities(8 /* FileFolderCopy */);
            assert.strictEqual(capabilityChanges.length, 1);
            provider.setCapabilities(2048 /* Readonly */);
            assert.strictEqual(capabilityChanges.length, 2);
            await service.activateProvider('test');
            assert.strictEqual(callCount, 2); // activation is called again
            assert.strictEqual(service.hasCapability(resource, 2048 /* Readonly */), true);
            assert.strictEqual(service.hasCapability(resource, 4 /* FileOpenReadWriteClose */), false);
            registrationDisposable.dispose();
            assert.strictEqual(service.canHandleResource(resource), false);
            assert.strictEqual(registrations.length, 2);
            assert.strictEqual(registrations[1].scheme, 'test');
            assert.strictEqual(registrations[1].added, false);
            service.dispose();
        });
        test('watch', async () => {
            const service = new fileService_1.FileService(new log_1.NullLogService());
            let disposeCounter = 0;
            service.registerProvider('test', new nullFileSystemProvider_1.NullFileSystemProvider(() => {
                return (0, lifecycle_1.toDisposable)(() => {
                    disposeCounter++;
                });
            }));
            await service.activateProvider('test');
            const resource1 = uri_1.URI.parse('test://foo/bar1');
            const watcher1Disposable = service.watch(resource1);
            await (0, async_1.timeout)(0); // service.watch() is async
            assert.strictEqual(disposeCounter, 0);
            watcher1Disposable.dispose();
            assert.strictEqual(disposeCounter, 1);
            disposeCounter = 0;
            const resource2 = uri_1.URI.parse('test://foo/bar2');
            const watcher2Disposable1 = service.watch(resource2);
            const watcher2Disposable2 = service.watch(resource2);
            const watcher2Disposable3 = service.watch(resource2);
            await (0, async_1.timeout)(0); // service.watch() is async
            assert.strictEqual(disposeCounter, 0);
            watcher2Disposable1.dispose();
            assert.strictEqual(disposeCounter, 0);
            watcher2Disposable2.dispose();
            assert.strictEqual(disposeCounter, 0);
            watcher2Disposable3.dispose();
            assert.strictEqual(disposeCounter, 1);
            disposeCounter = 0;
            const resource3 = uri_1.URI.parse('test://foo/bar3');
            const watcher3Disposable1 = service.watch(resource3);
            const watcher3Disposable2 = service.watch(resource3, { recursive: true, excludes: [] });
            await (0, async_1.timeout)(0); // service.watch() is async
            assert.strictEqual(disposeCounter, 0);
            watcher3Disposable1.dispose();
            assert.strictEqual(disposeCounter, 1);
            watcher3Disposable2.dispose();
            assert.strictEqual(disposeCounter, 2);
            service.dispose();
        });
        test('error from readFile bubbles through (https://github.com/microsoft/vscode/issues/118060) - async', async () => {
            testReadErrorBubbles(true);
        });
        test('error from readFile bubbles through (https://github.com/microsoft/vscode/issues/118060)', async () => {
            testReadErrorBubbles(false);
        });
        async function testReadErrorBubbles(async) {
            const service = new fileService_1.FileService(new log_1.NullLogService());
            const provider = new class extends nullFileSystemProvider_1.NullFileSystemProvider {
                async stat(resource) {
                    return {
                        mtime: Date.now(),
                        ctime: Date.now(),
                        size: 100,
                        type: files_1.FileType.File
                    };
                }
                readFile(resource) {
                    if (async) {
                        return (0, async_1.timeout)(5).then(() => { throw new Error('failed'); });
                    }
                    throw new Error('failed');
                }
                open(resource, opts) {
                    if (async) {
                        return (0, async_1.timeout)(5).then(() => { throw new Error('failed'); });
                    }
                    throw new Error('failed');
                }
                readFileStream(resource, opts, token) {
                    if (async) {
                        const stream = (0, stream_1.newWriteableStream)(chunk => chunk[0]);
                        (0, async_1.timeout)(5).then(() => stream.error(new Error('failed')));
                        return stream;
                    }
                    throw new Error('failed');
                }
            };
            const disposable = service.registerProvider('test', provider);
            for (const capabilities of [2 /* FileReadWrite */, 16 /* FileReadStream */, 4 /* FileOpenReadWriteClose */]) {
                provider.setCapabilities(capabilities);
                let e1;
                try {
                    await service.readFile(uri_1.URI.parse('test://foo/bar'));
                }
                catch (error) {
                    e1 = error;
                }
                assert.ok(e1);
                let e2;
                try {
                    const stream = await service.readFileStream(uri_1.URI.parse('test://foo/bar'));
                    await (0, stream_1.consumeStream)(stream.value, chunk => chunk[0]);
                }
                catch (error) {
                    e2 = error;
                }
                assert.ok(e2);
            }
            disposable.dispose();
        }
    });
});
//# sourceMappingURL=fileService.test.js.map