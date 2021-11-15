/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/contrib/debug/common/debugSource", "vs/base/common/platform", "vs/workbench/contrib/debug/test/browser/mockDebug"], function (require, exports, assert, uri_1, debugSource_1, platform_1, mockDebug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Debug - Source', () => {
        test('from raw source', () => {
            const source = new debugSource_1.Source({
                name: 'zz',
                path: '/xx/yy/zz',
                sourceReference: 0,
                presentationHint: 'emphasize'
            }, 'aDebugSessionId', mockDebug_1.mockUriIdentityService);
            assert.strictEqual(source.presentationHint, 'emphasize');
            assert.strictEqual(source.name, 'zz');
            assert.strictEqual(source.inMemory, false);
            assert.strictEqual(source.reference, 0);
            assert.strictEqual(source.uri.toString(), uri_1.URI.file('/xx/yy/zz').toString());
        });
        test('from raw internal source', () => {
            const source = new debugSource_1.Source({
                name: 'internalModule.js',
                sourceReference: 11,
                presentationHint: 'deemphasize'
            }, 'aDebugSessionId', mockDebug_1.mockUriIdentityService);
            assert.strictEqual(source.presentationHint, 'deemphasize');
            assert.strictEqual(source.name, 'internalModule.js');
            assert.strictEqual(source.inMemory, true);
            assert.strictEqual(source.reference, 11);
            assert.strictEqual(source.uri.toString(), 'debug:internalModule.js?session%3DaDebugSessionId%26ref%3D11');
        });
        test('get encoded debug data', () => {
            const checkData = (uri, expectedName, expectedPath, expectedSourceReference, expectedSessionId) => {
                let { name, path, sourceReference, sessionId } = debugSource_1.Source.getEncodedDebugData(uri);
                assert.strictEqual(name, expectedName);
                assert.strictEqual(path, expectedPath);
                assert.strictEqual(sourceReference, expectedSourceReference);
                assert.strictEqual(sessionId, expectedSessionId);
            };
            checkData(uri_1.URI.file('a/b/c/d'), 'd', platform_1.isWindows ? '\\a\\b\\c\\d' : '/a/b/c/d', undefined, undefined);
            checkData(uri_1.URI.from({ scheme: 'file', path: '/my/path/test.js', query: 'ref=1&session=2' }), 'test.js', platform_1.isWindows ? '\\my\\path\\test.js' : '/my/path/test.js', undefined, undefined);
            checkData(uri_1.URI.from({ scheme: 'http', authority: 'www.msft.com', path: '/my/path' }), 'path', 'http://www.msft.com/my/path', undefined, undefined);
            checkData(uri_1.URI.from({ scheme: 'debug', authority: 'www.msft.com', path: '/my/path', query: 'ref=100' }), 'path', '/my/path', 100, undefined);
            checkData(uri_1.URI.from({ scheme: 'debug', path: 'a/b/c/d.js', query: 'session=100' }), 'd.js', 'a/b/c/d.js', undefined, '100');
            checkData(uri_1.URI.from({ scheme: 'debug', path: 'a/b/c/d/foo.txt', query: 'session=100&ref=10' }), 'foo.txt', 'a/b/c/d/foo.txt', 10, '100');
        });
    });
});
//# sourceMappingURL=debugSource.test.js.map