/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/test/common/utils", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/contrib/files/common/explorerModel", "vs/workbench/contrib/files/browser/views/explorerView", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/files/browser/views/explorerViewer", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/workbench/contrib/files/browser/views/explorerDecorationsProvider"], function (require, exports, assert, event_1, utils_1, workbenchTestServices_1, explorerModel_1, explorerView_1, colorRegistry_1, explorerViewer_1, dom, lifecycle_1, explorerDecorationsProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const $ = dom.$;
    const fileService = new workbenchTestServices_1.TestFileService();
    function createStat(path, name, isFolder, hasChildren, size, mtime, isSymLink = false, isUnknown = false) {
        return new explorerModel_1.ExplorerItem(utils_1.toResource.call(this, path), fileService, undefined, isFolder, isSymLink, name, mtime, isUnknown);
    }
    suite('Files - ExplorerView', () => {
        test('getContext', async function () {
            const d = new Date().getTime();
            const s1 = createStat.call(this, '/', '/', true, false, 8096, d);
            const s2 = createStat.call(this, '/path', 'path', true, false, 8096, d);
            const s3 = createStat.call(this, '/path/to', 'to', true, false, 8096, d);
            const s4 = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d);
            const noNavigationController = { getCompressedNavigationController: (stat) => undefined };
            assert.deepStrictEqual((0, explorerView_1.getContext)([s1], [s2, s3, s4], true, noNavigationController), [s1]);
            assert.deepStrictEqual((0, explorerView_1.getContext)([s1], [s1, s3, s4], true, noNavigationController), [s1, s3, s4]);
            assert.deepStrictEqual((0, explorerView_1.getContext)([s1], [s3, s1, s4], false, noNavigationController), [s1]);
            assert.deepStrictEqual((0, explorerView_1.getContext)([], [s3, s1, s4], false, noNavigationController), []);
            assert.deepStrictEqual((0, explorerView_1.getContext)([], [s3, s1, s4], true, noNavigationController), [s3, s1, s4]);
        });
        test('decoration provider', async function () {
            const d = new Date().getTime();
            const s1 = createStat.call(this, '/path', 'path', true, false, 8096, d);
            s1.isError = true;
            const s2 = createStat.call(this, '/path/to', 'to', true, false, 8096, d, true);
            const s3 = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d);
            assert.strictEqual((0, explorerDecorationsProvider_1.provideDecorations)(s3), undefined);
            assert.deepStrictEqual((0, explorerDecorationsProvider_1.provideDecorations)(s2), {
                tooltip: 'Symbolic Link',
                letter: '\u2937'
            });
            assert.deepStrictEqual((0, explorerDecorationsProvider_1.provideDecorations)(s1), {
                tooltip: 'Unable to resolve workspace folder',
                letter: '!',
                color: colorRegistry_1.listInvalidItemForeground
            });
            const unknown = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d, false, true);
            assert.deepStrictEqual((0, explorerDecorationsProvider_1.provideDecorations)(unknown), {
                tooltip: 'Unknown File Type',
                letter: '?'
            });
        });
        test('compressed navigation controller', async function () {
            const container = $('.file');
            const label = $('.label');
            const labelName1 = $('.label-name');
            const labelName2 = $('.label-name');
            const labelName3 = $('.label-name');
            const d = new Date().getTime();
            const s1 = createStat.call(this, '/path', 'path', true, false, 8096, d);
            const s2 = createStat.call(this, '/path/to', 'to', true, false, 8096, d);
            const s3 = createStat.call(this, '/path/to/stat', 'stat', false, false, 8096, d);
            dom.append(container, label);
            dom.append(label, labelName1);
            dom.append(label, labelName2);
            dom.append(label, labelName3);
            const emitter = new event_1.Emitter();
            const navigationController = new explorerViewer_1.CompressedNavigationController('id', [s1, s2, s3], {
                container,
                elementDisposable: lifecycle_1.Disposable.None,
                label: {
                    container: label,
                    onDidRender: emitter.event
                }
            }, 1, false);
            assert.strictEqual(navigationController.count, 3);
            assert.strictEqual(navigationController.index, 2);
            assert.strictEqual(navigationController.current, s3);
            navigationController.next();
            assert.strictEqual(navigationController.current, s3);
            navigationController.previous();
            assert.strictEqual(navigationController.current, s2);
            navigationController.previous();
            assert.strictEqual(navigationController.current, s1);
            navigationController.previous();
            assert.strictEqual(navigationController.current, s1);
            navigationController.last();
            assert.strictEqual(navigationController.current, s3);
            navigationController.first();
            assert.strictEqual(navigationController.current, s1);
            navigationController.setIndex(1);
            assert.strictEqual(navigationController.current, s2);
            navigationController.setIndex(44);
            assert.strictEqual(navigationController.current, s2);
        });
    });
});
//# sourceMappingURL=explorerView.test.js.map