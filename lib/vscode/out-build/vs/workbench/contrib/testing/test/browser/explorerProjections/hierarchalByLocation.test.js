/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByLocation", "vs/workbench/contrib/testing/common/testStubs", "vs/workbench/contrib/testing/test/browser/testObjectTree"], function (require, exports, assert, hierarchalByLocation_1, testStubs_1, testObjectTree_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestHierarchicalByLocationProjection extends hierarchalByLocation_1.HierarchicalByLocationProjection {
        get folderNodes() {
            return [...this.folders.values()];
        }
    }
    suite('Workbench - Testing Explorer Hierarchal by Location Projection', () => {
        let harness;
        const folder1 = (0, testObjectTree_1.makeTestWorkspaceFolder)('f1');
        const folder2 = (0, testObjectTree_1.makeTestWorkspaceFolder)('f2');
        setup(() => {
            harness = new testObjectTree_1.TestTreeTestHarness([folder1, folder2], l => new TestHierarchicalByLocationProjection(l, {
                onResultsChanged: () => undefined,
                onTestChanged: () => undefined,
                getStateById: () => ({ state: { state: 0 }, computedState: 0 }),
            }));
        });
        teardown(() => {
            harness.dispose();
        });
        test('renders initial tree', async () => {
            harness.c.addRoot(testStubs_1.testStubs.nested(), 'a');
            harness.flush(folder1);
            assert.deepStrictEqual(harness.tree.getRendered(), [
                { e: 'a' }, { e: 'b' }
            ]);
        });
        test('expands children', async () => {
            harness.c.addRoot(testStubs_1.testStubs.nested(), 'a');
            harness.flush(folder1);
            harness.tree.expand(harness.projection.getElementByTestId('id-a'));
            assert.deepStrictEqual(harness.flush(folder1), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
        });
        test('updates render if a second folder is added', async () => {
            harness.c.addRoot(testStubs_1.testStubs.nested('id1-'), 'a');
            harness.flush(folder1);
            harness.c.addRoot(testStubs_1.testStubs.nested('id2-'), 'a');
            harness.flush(folder2);
            assert.deepStrictEqual(harness.tree.getRendered(), [
                { e: 'f1', children: [{ e: 'a' }, { e: 'b' }] },
                { e: 'f2', children: [{ e: 'a' }, { e: 'b' }] },
            ]);
            harness.tree.expand(harness.projection.getElementByTestId('id1-a'));
            assert.deepStrictEqual(harness.flush(folder1), [
                { e: 'f1', children: [{ e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] }, { e: 'b' }] },
                { e: 'f2', children: [{ e: 'a' }, { e: 'b' }] },
            ]);
        });
        test('updates render if second folder is removed', async () => {
            harness.c.addRoot(testStubs_1.testStubs.nested('id1-'), 'a');
            harness.flush(folder1);
            harness.c.addRoot(testStubs_1.testStubs.nested('id2-'), 'a');
            harness.flush(folder2);
            harness.onFolderChange.fire({ added: [], changed: [], removed: [folder1] });
            assert.deepStrictEqual(harness.flush(folder1), [
                { e: 'a' }, { e: 'b' },
            ]);
        });
        test('updates render if second test provider appears', async () => {
            harness.c.addRoot(testStubs_1.testStubs.nested(), 'a');
            harness.flush(folder1);
            harness.c.addRoot(testStubs_1.testStubs.test('root2', undefined, [testStubs_1.testStubs.test('c')]), 'b');
            assert.deepStrictEqual(harness.flush(folder1), [
                { e: 'root', children: [{ e: 'a' }, { e: 'b' }] },
                { e: 'root2', children: [{ e: 'c' }] },
            ]);
        });
        test('updates nodes if they add children', async () => {
            const tests = testStubs_1.testStubs.nested();
            harness.c.addRoot(tests, 'a');
            harness.flush(folder1);
            harness.tree.expand(harness.projection.getElementByTestId('id-a'));
            assert.deepStrictEqual(harness.flush(folder1), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] },
                { e: 'b' }
            ]);
            tests.children.get('id-a').addChild(testStubs_1.testStubs.test('ac'));
            assert.deepStrictEqual(harness.flush(folder1), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }, { e: 'ac' }] },
                { e: 'b' }
            ]);
        });
        test('updates nodes if they remove children', async () => {
            const tests = testStubs_1.testStubs.nested();
            harness.c.addRoot(tests, 'a');
            harness.flush(folder1);
            harness.tree.expand(harness.projection.getElementByTestId('id-a'));
            tests.children.get('id-a').children.get('id-ab').dispose();
            assert.deepStrictEqual(harness.flush(folder1), [
                { e: 'a', children: [{ e: 'aa' }] },
                { e: 'b' }
            ]);
        });
    });
});
//# sourceMappingURL=hierarchalByLocation.test.js.map