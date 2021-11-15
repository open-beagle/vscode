/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/api/testRPCProtocol", "vs/workbench/services/extensions/common/extensions", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostNotebookKernels", "vs/platform/extensions/common/extensions"], function (require, exports, assert, testRPCProtocol_1, extensions_1, workbenchTestServices_1, extHost_protocol_1, extHostNotebookKernels_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookKernel', function () {
        let rpcProtocol;
        let extHostNotebookKernels;
        const kernelData = new Map();
        setup(async function () {
            kernelData.clear();
            rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadCommands, new class extends (0, workbenchTestServices_1.mock)() {
                $registerCommand() { }
            });
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadNotebookKernels, new class extends (0, workbenchTestServices_1.mock)() {
                async $addKernel(handle, data) {
                    kernelData.set(handle, data);
                }
                $removeKernel(handle) {
                    kernelData.delete(handle);
                }
                $updateKernel(handle, data) {
                    assert.strictEqual(kernelData.has(handle), true);
                    kernelData.set(handle, Object.assign(Object.assign({}, kernelData.get(handle)), data));
                }
            });
            extHostNotebookKernels = new extHostNotebookKernels_1.ExtHostNotebookKernels(rpcProtocol, new class extends (0, workbenchTestServices_1.mock)() {
            }, new class extends (0, workbenchTestServices_1.mock)() {
            });
        });
        test('create/dispose kernel', async function () {
            const kernel = extHostNotebookKernels.createNotebookController(extensions_1.nullExtensionDescription, 'foo', '*', 'Foo');
            assert.throws(() => kernel.id = 'dd');
            assert.throws(() => kernel.viewType = 'dd');
            assert.ok(kernel);
            assert.strictEqual(kernel.id, 'foo');
            assert.strictEqual(kernel.label, 'Foo');
            assert.strictEqual(kernel.viewType, '*');
            await rpcProtocol.sync();
            assert.strictEqual(kernelData.size, 1);
            let [first] = kernelData.values();
            assert.strictEqual(first.id, 'nullExtensionDescription/foo');
            assert.strictEqual(extensions_2.ExtensionIdentifier.equals(first.extensionId, extensions_1.nullExtensionDescription.identifier), true);
            assert.strictEqual(first.label, 'Foo');
            assert.strictEqual(first.viewType, '*');
            kernel.dispose();
            await rpcProtocol.sync();
            assert.strictEqual(kernelData.size, 0);
        });
        test('update kernel', async function () {
            const kernel = extHostNotebookKernels.createNotebookController(extensions_1.nullExtensionDescription, 'foo', '*', 'Foo');
            await rpcProtocol.sync();
            assert.ok(kernel);
            let [first] = kernelData.values();
            assert.strictEqual(first.id, 'nullExtensionDescription/foo');
            assert.strictEqual(first.label, 'Foo');
            kernel.label = 'Far';
            assert.strictEqual(kernel.label, 'Far');
            await rpcProtocol.sync();
            [first] = kernelData.values();
            assert.strictEqual(first.id, 'nullExtensionDescription/foo');
            assert.strictEqual(first.label, 'Far');
        });
    });
});
//# sourceMappingURL=extHostNotebookKernel2.test.js.map