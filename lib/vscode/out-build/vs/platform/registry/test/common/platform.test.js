/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/base/common/types"], function (require, exports, assert, platform_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Platform / Registry', () => {
        test('registry - api', function () {
            assert.ok((0, types_1.isFunction)(platform_1.Registry.add));
            assert.ok((0, types_1.isFunction)(platform_1.Registry.as));
            assert.ok((0, types_1.isFunction)(platform_1.Registry.knows));
        });
        test('registry - mixin', function () {
            platform_1.Registry.add('foo', { bar: true });
            assert.ok(platform_1.Registry.knows('foo'));
            assert.ok(platform_1.Registry.as('foo').bar);
            assert.strictEqual(platform_1.Registry.as('foo').bar, true);
        });
        test('registry - knows, as', function () {
            let ext = {};
            platform_1.Registry.add('knows,as', ext);
            assert.ok(platform_1.Registry.knows('knows,as'));
            assert.ok(!platform_1.Registry.knows('knows,as1234'));
            assert.ok(platform_1.Registry.as('knows,as') === ext);
            assert.ok(platform_1.Registry.as('knows,as1234') === null);
        });
        test('registry - mixin, fails on duplicate ids', function () {
            platform_1.Registry.add('foo-dup', { bar: true });
            try {
                platform_1.Registry.add('foo-dup', { bar: false });
                assert.ok(false);
            }
            catch (e) {
                assert.ok(true);
            }
        });
    });
});
//# sourceMappingURL=platform.test.js.map