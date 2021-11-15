/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/environment/node/argv", "vs/platform/environment/common/environmentService", "vs/platform/environment/node/environmentService", "vs/platform/product/common/product"], function (require, exports, assert, argv_1, environmentService_1, environmentService_2, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('EnvironmentService', () => {
        test('parseExtensionHostPort when built', () => {
            const parse = (a) => (0, environmentService_1.parseExtensionHostPort)((0, argv_1.parseArgs)(a, argv_1.OPTIONS), true);
            assert.deepStrictEqual(parse([]), { port: null, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost']), { port: null, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234']), { port: 1234, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost']), { port: null, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost=5678']), { port: 5678, break: true, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234', '--debugBrkPluginHost=5678', '--debugId=7']), { port: 5678, break: true, debugId: '7' });
            assert.deepStrictEqual(parse(['--inspect-extensions']), { port: null, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234']), { port: 1234, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions']), { port: null, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions=5678']), { port: 5678, break: true, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234', '--inspect-brk-extensions=5678', '--debugId=7']), { port: 5678, break: true, debugId: '7' });
        });
        test('parseExtensionHostPort when unbuilt', () => {
            const parse = (a) => (0, environmentService_1.parseExtensionHostPort)((0, argv_1.parseArgs)(a, argv_1.OPTIONS), false);
            assert.deepStrictEqual(parse([]), { port: 5870, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost']), { port: 5870, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234']), { port: 1234, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost']), { port: 5870, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugBrkPluginHost=5678']), { port: 5678, break: true, debugId: undefined });
            assert.deepStrictEqual(parse(['--debugPluginHost=1234', '--debugBrkPluginHost=5678', '--debugId=7']), { port: 5678, break: true, debugId: '7' });
            assert.deepStrictEqual(parse(['--inspect-extensions']), { port: 5870, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234']), { port: 1234, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions']), { port: 5870, break: false, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-brk-extensions=5678']), { port: 5678, break: true, debugId: undefined });
            assert.deepStrictEqual(parse(['--inspect-extensions=1234', '--inspect-brk-extensions=5678', '--debugId=7']), { port: 5678, break: true, debugId: '7' });
        });
        // https://github.com/microsoft/vscode/issues/78440
        test('careful with boolean file names', function () {
            let actual = (0, argv_1.parseArgs)(['-r', 'arg.txt'], argv_1.OPTIONS);
            assert(actual['reuse-window']);
            assert.deepStrictEqual(actual._, ['arg.txt']);
            actual = (0, argv_1.parseArgs)(['-r', 'true.txt'], argv_1.OPTIONS);
            assert(actual['reuse-window']);
            assert.deepStrictEqual(actual._, ['true.txt']);
        });
        test('userDataDir', () => {
            const service1 = new environmentService_2.NativeEnvironmentService((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), Object.assign({ _serviceBrand: undefined }, product_1.default));
            assert.ok(service1.userDataPath.length > 0);
            const args = (0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS);
            args['user-data-dir'] = '/userDataDir/folder';
            const service2 = new environmentService_2.NativeEnvironmentService(args, Object.assign({ _serviceBrand: undefined }, product_1.default));
            assert.notStrictEqual(service1.userDataPath, service2.userDataPath);
        });
    });
});
//# sourceMappingURL=environmentService.test.js.map