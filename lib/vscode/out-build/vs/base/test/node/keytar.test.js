/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform"], function (require, exports, assert, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Keytar', () => {
        (platform_1.isLinux ? test.skip : test)('loads and is functional', async () => {
            const keytar = await new Promise((resolve_1, reject_1) => { require(['keytar'], resolve_1, reject_1); });
            const name = `VSCode Test ${Math.floor(Math.random() * 1e9)}`;
            try {
                await keytar.setPassword(name, 'foo', 'bar');
                assert.strictEqual(await keytar.findPassword(name), 'bar');
                assert.strictEqual((await keytar.findCredentials(name)).length, 1);
                assert.strictEqual(await keytar.getPassword(name, 'foo'), 'bar');
                await keytar.deletePassword(name, 'foo');
                assert.strictEqual(await keytar.getPassword(name, 'foo'), null);
            }
            catch (err) {
                // try to clean up
                try {
                    await keytar.deletePassword(name, 'foo');
                }
                finally {
                    // eslint-disable-next-line no-unsafe-finally
                    throw err;
                }
            }
        });
    });
});
//# sourceMappingURL=keytar.test.js.map