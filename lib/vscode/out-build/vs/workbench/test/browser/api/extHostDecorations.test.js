/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/log/common/log", "vs/workbench/api/common/extHostDecorations", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, async_1, cancellation_1, uri_1, mock_1, log_1, extHostDecorations_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostDecorations', function () {
        let mainThreadShape;
        let extHostDecorations;
        let providers = new Set();
        setup(function () {
            providers.clear();
            mainThreadShape = new class extends (0, mock_1.mock)() {
                $registerDecorationProvider(handle) {
                    providers.add(handle);
                }
            };
            extHostDecorations = new extHostDecorations_1.ExtHostDecorations(new class extends (0, mock_1.mock)() {
                getProxy() {
                    return mainThreadShape;
                }
            }, new log_1.NullLogService());
        });
        test('SCM Decorations missing #100524', async function () {
            let calledA = false;
            let calledB = false;
            // never returns
            extHostDecorations.registerFileDecorationProvider({
                provideFileDecoration() {
                    calledA = true;
                    return new Promise(() => { });
                }
            }, extensions_1.nullExtensionDescription.identifier);
            // always returns
            extHostDecorations.registerFileDecorationProvider({
                provideFileDecoration() {
                    calledB = true;
                    return new Promise(resolve => resolve({ badge: 'H', tooltip: 'Hello' }));
                }
            }, extensions_1.nullExtensionDescription.identifier);
            const requests = [...providers.values()].map((handle, idx) => {
                return extHostDecorations.$provideDecorations(handle, [{ id: idx, uri: uri_1.URI.parse('test:///file') }], cancellation_1.CancellationToken.None);
            });
            assert.strictEqual(calledA, true);
            assert.strictEqual(calledB, true);
            assert.strictEqual(requests.length, 2);
            const [first, second] = requests;
            const firstResult = await Promise.race([first, (0, async_1.timeout)(30).then(() => false)]);
            assert.strictEqual(typeof firstResult, 'boolean'); // never finishes...
            const secondResult = await Promise.race([second, (0, async_1.timeout)(30).then(() => false)]);
            assert.strictEqual(typeof secondResult, 'object');
        });
    });
});
//# sourceMappingURL=extHostDecorations.test.js.map