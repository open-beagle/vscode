/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/extpath", "vs/platform/files/common/files", "vs/base/common/platform", "vs/base/test/common/utils"], function (require, exports, assert, uri_1, extpath_1, files_1, platform_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Files', () => {
        test('FileChangesEvent - basics', function () {
            const changes = [
                { resource: utils_1.toResource.call(this, '/foo/updated.txt'), type: 0 /* UPDATED */ },
                { resource: utils_1.toResource.call(this, '/foo/otherupdated.txt'), type: 0 /* UPDATED */ },
                { resource: utils_1.toResource.call(this, '/added.txt'), type: 1 /* ADDED */ },
                { resource: utils_1.toResource.call(this, '/bar/deleted.txt'), type: 2 /* DELETED */ },
                { resource: utils_1.toResource.call(this, '/bar/folder'), type: 2 /* DELETED */ },
                { resource: utils_1.toResource.call(this, '/BAR/FOLDER'), type: 2 /* DELETED */ }
            ];
            for (const ignorePathCasing of [false, true]) {
                const event = new files_1.FileChangesEvent(changes, ignorePathCasing);
                assert(!event.contains(utils_1.toResource.call(this, '/foo'), 0 /* UPDATED */));
                assert(event.affects(utils_1.toResource.call(this, '/foo'), 0 /* UPDATED */));
                assert(event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* UPDATED */));
                assert(event.affects(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* UPDATED */));
                assert(event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* UPDATED */, 1 /* ADDED */));
                assert(event.affects(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* UPDATED */, 1 /* ADDED */));
                assert(event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 0 /* UPDATED */, 1 /* ADDED */, 2 /* DELETED */));
                assert(!event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 1 /* ADDED */, 2 /* DELETED */));
                assert(!event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 1 /* ADDED */));
                assert(!event.contains(utils_1.toResource.call(this, '/foo/updated.txt'), 2 /* DELETED */));
                assert(!event.affects(utils_1.toResource.call(this, '/foo/updated.txt'), 2 /* DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/bar/folder'), 2 /* DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/BAR/FOLDER'), 2 /* DELETED */));
                assert(event.affects(utils_1.toResource.call(this, '/BAR'), 2 /* DELETED */));
                if (ignorePathCasing) {
                    assert(event.contains(utils_1.toResource.call(this, '/BAR/folder'), 2 /* DELETED */));
                    assert(event.affects(utils_1.toResource.call(this, '/bar'), 2 /* DELETED */));
                }
                else {
                    assert(!event.contains(utils_1.toResource.call(this, '/BAR/folder'), 2 /* DELETED */));
                    assert(event.affects(utils_1.toResource.call(this, '/bar'), 2 /* DELETED */));
                }
                assert(event.contains(utils_1.toResource.call(this, '/bar/folder/somefile'), 2 /* DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/bar/folder/somefile/test.txt'), 2 /* DELETED */));
                assert(event.contains(utils_1.toResource.call(this, '/BAR/FOLDER/somefile/test.txt'), 2 /* DELETED */));
                if (ignorePathCasing) {
                    assert(event.contains(utils_1.toResource.call(this, '/BAR/folder/somefile/test.txt'), 2 /* DELETED */));
                }
                else {
                    assert(!event.contains(utils_1.toResource.call(this, '/BAR/folder/somefile/test.txt'), 2 /* DELETED */));
                }
                assert(!event.contains(utils_1.toResource.call(this, '/bar/folder2/somefile'), 2 /* DELETED */));
                assert.strictEqual(6, event.changes.length);
                assert.strictEqual(1, event.getAdded().length);
                assert.strictEqual(true, event.gotAdded());
                assert.strictEqual(2, event.getUpdated().length);
                assert.strictEqual(true, event.gotUpdated());
                assert.strictEqual(ignorePathCasing ? 2 : 3, event.getDeleted().length);
                assert.strictEqual(true, event.gotDeleted());
            }
        });
        test('FileChangesEvent - supports multiple changes on file tree', function () {
            for (const type of [1 /* ADDED */, 0 /* UPDATED */, 2 /* DELETED */]) {
                const changes = [
                    { resource: utils_1.toResource.call(this, '/foo/bar/updated.txt'), type },
                    { resource: utils_1.toResource.call(this, '/foo/bar/otherupdated.txt'), type },
                    { resource: utils_1.toResource.call(this, '/foo/bar'), type },
                    { resource: utils_1.toResource.call(this, '/foo'), type },
                    { resource: utils_1.toResource.call(this, '/bar'), type },
                    { resource: utils_1.toResource.call(this, '/bar/foo'), type },
                    { resource: utils_1.toResource.call(this, '/bar/foo/updated.txt'), type },
                    { resource: utils_1.toResource.call(this, '/bar/foo/otherupdated.txt'), type }
                ];
                for (const ignorePathCasing of [false, true]) {
                    const event = new files_1.FileChangesEvent(changes, ignorePathCasing);
                    for (const change of changes) {
                        assert(event.contains(change.resource, type));
                        assert(event.affects(change.resource, type));
                    }
                    assert(event.affects(utils_1.toResource.call(this, '/foo'), type));
                    assert(event.affects(utils_1.toResource.call(this, '/bar'), type));
                    assert(event.affects(utils_1.toResource.call(this, '/'), type));
                    assert(!event.affects(utils_1.toResource.call(this, '/foobar'), type));
                    assert(!event.contains(utils_1.toResource.call(this, '/some/foo/bar'), type));
                    assert(!event.affects(utils_1.toResource.call(this, '/some/foo/bar'), type));
                    assert(!event.contains(utils_1.toResource.call(this, '/some/bar'), type));
                    assert(!event.affects(utils_1.toResource.call(this, '/some/bar'), type));
                    switch (type) {
                        case 1 /* ADDED */:
                            assert.strictEqual(8, event.getAdded().length);
                            break;
                        case 0 /* UPDATED */:
                            assert.strictEqual(8, event.getUpdated().length);
                            break;
                        case 2 /* DELETED */:
                            assert.strictEqual(8, event.getDeleted().length);
                            break;
                    }
                }
            }
        });
        function testIsEqual(testMethod) {
            // corner cases
            assert(testMethod('', '', true));
            assert(!testMethod(null, '', true));
            assert(!testMethod(undefined, '', true));
            // basics (string)
            assert(testMethod('/', '/', true));
            assert(testMethod('/some', '/some', true));
            assert(testMethod('/some/path', '/some/path', true));
            assert(testMethod('c:\\', 'c:\\', true));
            assert(testMethod('c:\\some', 'c:\\some', true));
            assert(testMethod('c:\\some\\path', 'c:\\some\\path', true));
            assert(testMethod('/someöäü/path', '/someöäü/path', true));
            assert(testMethod('c:\\someöäü\\path', 'c:\\someöäü\\path', true));
            assert(!testMethod('/some/path', '/some/other/path', true));
            assert(!testMethod('c:\\some\\path', 'c:\\some\\other\\path', true));
            assert(!testMethod('c:\\some\\path', 'd:\\some\\path', true));
            assert(testMethod('/some/path', '/some/PATH', true));
            assert(testMethod('/someöäü/path', '/someÖÄÜ/PATH', true));
            assert(testMethod('c:\\some\\path', 'c:\\some\\PATH', true));
            assert(testMethod('c:\\someöäü\\path', 'c:\\someÖÄÜ\\PATH', true));
            assert(testMethod('c:\\some\\path', 'C:\\some\\PATH', true));
        }
        test('isEqual (ignoreCase)', function () {
            testIsEqual(extpath_1.isEqual);
            // basics (uris)
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/some/path').fsPath, uri_1.URI.file('/some/path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('c:\\some\\path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/someöäü/path').fsPath, uri_1.URI.file('/someöäü/path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\someöäü\\path').fsPath, uri_1.URI.file('c:\\someöäü\\path').fsPath, true));
            assert(!(0, extpath_1.isEqual)(uri_1.URI.file('/some/path').fsPath, uri_1.URI.file('/some/other/path').fsPath, true));
            assert(!(0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('c:\\some\\other\\path').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/some/path').fsPath, uri_1.URI.file('/some/PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('/someöäü/path').fsPath, uri_1.URI.file('/someÖÄÜ/PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('c:\\some\\PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\someöäü\\path').fsPath, uri_1.URI.file('c:\\someÖÄÜ\\PATH').fsPath, true));
            assert((0, extpath_1.isEqual)(uri_1.URI.file('c:\\some\\path').fsPath, uri_1.URI.file('C:\\some\\PATH').fsPath, true));
        });
        test('isParent (ignorecase)', function () {
            if (platform_1.isWindows) {
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\some', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\some\\', true));
                assert((0, files_1.isParent)('c:\\someöäü\\path', 'c:\\someöäü', true));
                assert((0, files_1.isParent)('c:\\someöäü\\path', 'c:\\someöäü\\', true));
                assert((0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar', true));
                assert((0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'C:\\', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\SOME', true));
                assert((0, files_1.isParent)('c:\\some\\path', 'c:\\SOME\\', true));
                assert(!(0, files_1.isParent)('c:\\some\\path', 'd:\\', true));
                assert(!(0, files_1.isParent)('c:\\some\\path', 'c:\\some\\path', true));
                assert(!(0, files_1.isParent)('c:\\some\\path', 'd:\\some\\path', true));
                assert(!(0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\barr', true));
                assert(!(0, files_1.isParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test', true));
            }
            if (platform_1.isMacintosh || platform_1.isLinux) {
                assert((0, files_1.isParent)('/some/path', '/', true));
                assert((0, files_1.isParent)('/some/path', '/some', true));
                assert((0, files_1.isParent)('/some/path', '/some/', true));
                assert((0, files_1.isParent)('/someöäü/path', '/someöäü', true));
                assert((0, files_1.isParent)('/someöäü/path', '/someöäü/', true));
                assert((0, files_1.isParent)('/foo/bar/test.ts', '/foo/bar', true));
                assert((0, files_1.isParent)('/foo/bar/test.ts', '/foo/bar/', true));
                assert((0, files_1.isParent)('/some/path', '/SOME', true));
                assert((0, files_1.isParent)('/some/path', '/SOME/', true));
                assert((0, files_1.isParent)('/someöäü/path', '/SOMEÖÄÜ', true));
                assert((0, files_1.isParent)('/someöäü/path', '/SOMEÖÄÜ/', true));
                assert(!(0, files_1.isParent)('/some/path', '/some/path', true));
                assert(!(0, files_1.isParent)('/foo/bar/test.ts', '/foo/barr', true));
                assert(!(0, files_1.isParent)('/foo/bar/test.ts', '/foo/bar/test', true));
            }
        });
        test('isEqualOrParent (ignorecase)', function () {
            // same assertions apply as with isEqual()
            testIsEqual(extpath_1.isEqualOrParent); //
            if (platform_1.isWindows) {
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\some', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\some\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\someöäü\\path', 'c:\\someöäü', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\someöäü\\path', 'c:\\someöäü\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\some\\path', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test.ts', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'C:\\', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\SOME', true));
                assert((0, extpath_1.isEqualOrParent)('c:\\some\\path', 'c:\\SOME\\', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\some\\path', 'd:\\', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\some\\path', 'd:\\some\\path', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\barr', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\bar\\test.', true));
                assert(!(0, extpath_1.isEqualOrParent)('c:\\foo\\bar\\test.ts', 'c:\\foo\\BAR\\test.', true));
            }
            if (platform_1.isMacintosh || platform_1.isLinux) {
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/some', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/some/', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/someöäü', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/someöäü/', true));
                assert((0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/bar', true));
                assert((0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/bar/', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/some/path', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/SOME', true));
                assert((0, extpath_1.isEqualOrParent)('/some/path', '/SOME/', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/SOMEÖÄÜ', true));
                assert((0, extpath_1.isEqualOrParent)('/someöäü/path', '/SOMEÖÄÜ/', true));
                assert(!(0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/barr', true));
                assert(!(0, extpath_1.isEqualOrParent)('/foo/bar/test.ts', '/foo/bar/test', true));
                assert(!(0, extpath_1.isEqualOrParent)('foo/bar/test.ts', 'foo/bar/test.', true));
                assert(!(0, extpath_1.isEqualOrParent)('foo/bar/test.ts', 'foo/BAR/test.', true));
            }
        });
    });
});
//# sourceMappingURL=files.test.js.map