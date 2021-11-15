/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/platform/registry/common/platform", "vs/workbench/browser/viewlet", "vs/base/common/types"], function (require, exports, assert, platform_1, viewlet_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Viewlets', () => {
        class TestViewlet extends viewlet_1.Viewlet {
            constructor() {
                super('id', null, null, null, null, null, null, null, null, null);
            }
            layout(dimension) {
                throw new Error('Method not implemented.');
            }
            createViewPaneContainer() { return null; }
        }
        test('ViewletDescriptor API', function () {
            let d = viewlet_1.ViewletDescriptor.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            assert.strictEqual(d.cssClass, 'class');
            assert.strictEqual(d.order, 5);
        });
        test('Editor Aware ViewletDescriptor API', function () {
            let d = viewlet_1.ViewletDescriptor.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
            d = viewlet_1.ViewletDescriptor.create(TestViewlet, 'id', 'name', 'class', 5);
            assert.strictEqual(d.id, 'id');
            assert.strictEqual(d.name, 'name');
        });
        test('Viewlet extension point and registration', function () {
            assert((0, types_1.isFunction)(platform_1.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet));
            assert((0, types_1.isFunction)(platform_1.Registry.as(viewlet_1.Extensions.Viewlets).getViewlet));
            assert((0, types_1.isFunction)(platform_1.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets));
            let oldCount = platform_1.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets().length;
            let d = viewlet_1.ViewletDescriptor.create(TestViewlet, 'reg-test-id', 'name');
            platform_1.Registry.as(viewlet_1.Extensions.Viewlets).registerViewlet(d);
            assert(d === platform_1.Registry.as(viewlet_1.Extensions.Viewlets).getViewlet('reg-test-id'));
            assert.strictEqual(oldCount + 1, platform_1.Registry.as(viewlet_1.Extensions.Viewlets).getViewlets().length);
        });
    });
});
//# sourceMappingURL=viewlet.test.js.map