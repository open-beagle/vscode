/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform"], function (require, exports, assert, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function testErrorMessage(module) {
        return `Unable to load "${module}" dependency. It was probably not compiled for the right operating system architecture or had missing build tools.`;
    }
    suite('Native Modules (all platforms)', () => {
        test('native-is-elevated', async () => {
            const isElevated = await new Promise((resolve_1, reject_1) => { require(['native-is-elevated'], resolve_1, reject_1); });
            assert.ok(typeof isElevated === 'function', testErrorMessage('native-is-elevated '));
        });
        test('native-keymap', async () => {
            const keyMap = await new Promise((resolve_2, reject_2) => { require(['native-keymap'], resolve_2, reject_2); });
            assert.ok(typeof keyMap.getCurrentKeyboardLayout === 'function', testErrorMessage('native-keymap'));
        });
        test('native-watchdog', async () => {
            const watchDog = await new Promise((resolve_3, reject_3) => { require(['native-watchdog'], resolve_3, reject_3); });
            assert.ok(typeof watchDog.start === 'function', testErrorMessage('native-watchdog'));
        });
        test('node-pty', async () => {
            const nodePty = await new Promise((resolve_4, reject_4) => { require(['node-pty'], resolve_4, reject_4); });
            assert.ok(typeof nodePty.spawn === 'function', testErrorMessage('node-pty'));
        });
        test('spdlog', async () => {
            const spdlog = await new Promise((resolve_5, reject_5) => { require(['spdlog'], resolve_5, reject_5); });
            assert.ok(typeof spdlog.createRotatingLogger === 'function', testErrorMessage('spdlog'));
        });
        test('nsfw', async () => {
            const nsfWatcher = await new Promise((resolve_6, reject_6) => { require(['nsfw'], resolve_6, reject_6); });
            assert.ok(typeof nsfWatcher === 'function', testErrorMessage('nsfw'));
        });
        test('vscode-sqlite3', async () => {
            const sqlite3 = await new Promise((resolve_7, reject_7) => { require(['vscode-sqlite3'], resolve_7, reject_7); });
            assert.ok(typeof sqlite3.Database === 'function', testErrorMessage('vscode-sqlite3'));
        });
    });
    (!platform_1.isMacintosh ? suite.skip : suite)('Native Modules (macOS)', () => {
        test('chokidar (fsevents)', async () => {
            const chokidar = await new Promise((resolve_8, reject_8) => { require(['chokidar'], resolve_8, reject_8); });
            const watcher = chokidar.watch(__dirname);
            assert.ok(watcher.options.useFsEvents, testErrorMessage('chokidar (fsevents)'));
            return watcher.close();
        });
    });
    (!platform_1.isWindows ? suite.skip : suite)('Native Modules (Windows)', () => {
        test('windows-mutex', async () => {
            const mutex = await new Promise((resolve_9, reject_9) => { require(['windows-mutex'], resolve_9, reject_9); });
            assert.ok(mutex && typeof mutex.isActive === 'function', testErrorMessage('windows-mutex'));
            assert.ok(typeof mutex.isActive === 'function', testErrorMessage('windows-mutex'));
        });
        test('windows-foreground-love', async () => {
            const foregroundLove = await new Promise((resolve_10, reject_10) => { require(['windows-foreground-love'], resolve_10, reject_10); });
            assert.ok(typeof foregroundLove.allowSetForegroundWindow === 'function', testErrorMessage('windows-foreground-love'));
        });
        test('windows-process-tree', async () => {
            const processTree = await new Promise((resolve_11, reject_11) => { require(['windows-process-tree'], resolve_11, reject_11); });
            assert.ok(typeof processTree.getProcessTree === 'function', testErrorMessage('windows-process-tree'));
        });
        test('vscode-windows-registry', async () => {
            const windowsRegistry = await new Promise((resolve_12, reject_12) => { require(['vscode-windows-registry'], resolve_12, reject_12); });
            assert.ok(typeof windowsRegistry.GetStringRegKey === 'function', testErrorMessage('vscode-windows-registry'));
        });
        test('vscode-windows-ca-certs', async () => {
            // @ts-ignore Windows only
            const windowsCerts = await new Promise((resolve_13, reject_13) => { require(['vscode-windows-ca-certs'], resolve_13, reject_13); });
            const store = new windowsCerts.Crypt32();
            assert.ok(windowsCerts, testErrorMessage('vscode-windows-ca-certs'));
            let certCount = 0;
            try {
                while (store.next()) {
                    certCount++;
                }
            }
            finally {
                store.done();
            }
            assert(certCount > 0);
        });
    });
});
//# sourceMappingURL=nativeModules.test.js.map