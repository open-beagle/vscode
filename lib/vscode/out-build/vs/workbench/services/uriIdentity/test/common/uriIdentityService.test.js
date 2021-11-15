/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/uriIdentity/common/uriIdentityService", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/uri", "vs/base/common/event"], function (require, exports, assert, uriIdentityService_1, workbenchTestServices_1, uri_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('URI Identity', function () {
        class FakeFileService extends (0, workbenchTestServices_1.mock)() {
            constructor(data) {
                super();
                this.data = data;
                this.onDidChangeFileSystemProviderCapabilities = event_1.Event.None;
                this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
            }
            canHandleResource(uri) {
                return this.data.has(uri.scheme);
            }
            hasCapability(uri, flag) {
                var _a;
                const mask = (_a = this.data.get(uri.scheme)) !== null && _a !== void 0 ? _a : 0;
                return Boolean(mask & flag);
            }
        }
        let _service;
        setup(function () {
            _service = new uriIdentityService_1.UriIdentityService(new FakeFileService(new Map([
                ['bar', 1024 /* PathCaseSensitive */],
                ['foo', 0]
            ])));
        });
        function assertCanonical(input, expected, service = _service) {
            const actual = service.asCanonicalUri(input);
            assert.strictEqual(actual.toString(), expected.toString());
            assert.ok(service.extUri.isEqual(actual, expected));
        }
        test('extUri (isEqual)', function () {
            let a = uri_1.URI.parse('foo://bar/bang');
            let a1 = uri_1.URI.parse('foo://bar/BANG');
            let b = uri_1.URI.parse('bar://bar/bang');
            let b1 = uri_1.URI.parse('bar://bar/BANG');
            assert.strictEqual(_service.extUri.isEqual(a, a1), true);
            assert.strictEqual(_service.extUri.isEqual(a1, a), true);
            assert.strictEqual(_service.extUri.isEqual(b, b1), false);
            assert.strictEqual(_service.extUri.isEqual(b1, b), false);
        });
        test('asCanonicalUri (casing)', function () {
            let a = uri_1.URI.parse('foo://bar/bang');
            let a1 = uri_1.URI.parse('foo://bar/BANG');
            let b = uri_1.URI.parse('bar://bar/bang');
            let b1 = uri_1.URI.parse('bar://bar/BANG');
            assertCanonical(a, a);
            assertCanonical(a1, a);
            assertCanonical(b, b);
            assertCanonical(b1, b1); // case sensitive
        });
        test('asCanonicalUri (normalization)', function () {
            let a = uri_1.URI.parse('foo://bar/bang');
            assertCanonical(a, a);
            assertCanonical(uri_1.URI.parse('foo://bar/./bang'), a);
            assertCanonical(uri_1.URI.parse('foo://bar/./bang'), a);
            assertCanonical(uri_1.URI.parse('foo://bar/./foo/../bang'), a);
        });
        test('asCanonicalUri (keep fragement)', function () {
            let a = uri_1.URI.parse('foo://bar/bang');
            assertCanonical(a, a);
            assertCanonical(uri_1.URI.parse('foo://bar/./bang#frag'), a.with({ fragment: 'frag' }));
            assertCanonical(uri_1.URI.parse('foo://bar/./bang#frag'), a.with({ fragment: 'frag' }));
            assertCanonical(uri_1.URI.parse('foo://bar/./bang#frag'), a.with({ fragment: 'frag' }));
            assertCanonical(uri_1.URI.parse('foo://bar/./foo/../bang#frag'), a.with({ fragment: 'frag' }));
            let b = uri_1.URI.parse('foo://bar/bazz#frag');
            assertCanonical(b, b);
            assertCanonical(uri_1.URI.parse('foo://bar/bazz'), b.with({ fragment: '' }));
            assertCanonical(uri_1.URI.parse('foo://bar/BAZZ#DDD'), b.with({ fragment: 'DDD' })); // lower-case path, but fragment is kept
        });
    });
});
//# sourceMappingURL=uriIdentityService.test.js.map