/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform"], function (require, exports, assert, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NSFW Watcher Service', async () => {
        // Load `nsfwWatcherService` within the suite to prevent all tests
        // from failing to start if `nsfw` was not properly installed
        const { NsfwWatcherService } = await new Promise((resolve_1, reject_1) => { require(['vs/platform/files/node/watcher/nsfw/nsfwWatcherService'], resolve_1, reject_1); });
        class TestNsfwWatcherService extends NsfwWatcherService {
            normalizeRoots(roots) {
                // Work with strings as paths to simplify testing
                const requests = roots.map(r => {
                    return { path: r, excludes: [] };
                });
                return this._normalizeRoots(requests).map(r => r.path);
            }
        }
        suite('_normalizeRoots', () => {
            test('should not impacts roots that don\'t overlap', () => {
                const service = new TestNsfwWatcherService();
                if (platform.isWindows) {
                    assert.deepStrictEqual(service.normalizeRoots(['C:\\a']), ['C:\\a']);
                    assert.deepStrictEqual(service.normalizeRoots(['C:\\a', 'C:\\b']), ['C:\\a', 'C:\\b']);
                    assert.deepStrictEqual(service.normalizeRoots(['C:\\a', 'C:\\b', 'C:\\c\\d\\e']), ['C:\\a', 'C:\\b', 'C:\\c\\d\\e']);
                }
                else {
                    assert.deepStrictEqual(service.normalizeRoots(['/a']), ['/a']);
                    assert.deepStrictEqual(service.normalizeRoots(['/a', '/b']), ['/a', '/b']);
                    assert.deepStrictEqual(service.normalizeRoots(['/a', '/b', '/c/d/e']), ['/a', '/b', '/c/d/e']);
                }
            });
            test('should remove sub-folders of other roots', () => {
                const service = new TestNsfwWatcherService();
                if (platform.isWindows) {
                    assert.deepStrictEqual(service.normalizeRoots(['C:\\a', 'C:\\a\\b']), ['C:\\a']);
                    assert.deepStrictEqual(service.normalizeRoots(['C:\\a', 'C:\\b', 'C:\\a\\b']), ['C:\\a', 'C:\\b']);
                    assert.deepStrictEqual(service.normalizeRoots(['C:\\b\\a', 'C:\\a', 'C:\\b', 'C:\\a\\b']), ['C:\\a', 'C:\\b']);
                    assert.deepStrictEqual(service.normalizeRoots(['C:\\a', 'C:\\a\\b', 'C:\\a\\c\\d']), ['C:\\a']);
                }
                else {
                    assert.deepStrictEqual(service.normalizeRoots(['/a', '/a/b']), ['/a']);
                    assert.deepStrictEqual(service.normalizeRoots(['/a', '/b', '/a/b']), ['/a', '/b']);
                    assert.deepStrictEqual(service.normalizeRoots(['/b/a', '/a', '/b', '/a/b']), ['/a', '/b']);
                    assert.deepStrictEqual(service.normalizeRoots(['/a', '/a/b', '/a/c/d']), ['/a']);
                }
            });
        });
    });
});
//# sourceMappingURL=nsfwWatcherService.test.js.map