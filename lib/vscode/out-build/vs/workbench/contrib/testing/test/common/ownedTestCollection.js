/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/workbench/contrib/testing/common/ownedTestCollection", "vs/workbench/contrib/testing/common/testServiceImpl", "vs/workbench/contrib/testing/common/testStubs"], function (require, exports, iterator_1, ownedTestCollection_1, testServiceImpl_1, testStubs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInitializedMainTestCollection = exports.TestOwnedTestCollection = exports.TestSingleUseCollection = void 0;
    class TestSingleUseCollection extends ownedTestCollection_1.SingleUseTestCollection {
        get itemToInternal() {
            return this.testItemToInternal;
        }
        get currentDiff() {
            return this.diff;
        }
        setDiff(diff) {
            this.diff = diff;
        }
    }
    exports.TestSingleUseCollection = TestSingleUseCollection;
    class TestOwnedTestCollection extends ownedTestCollection_1.OwnedTestCollection {
        get idToInternal() {
            return iterator_1.Iterable.first(this.testIdsToInternal.values());
        }
        createForHierarchy(publishDiff = () => undefined) {
            return new TestSingleUseCollection(this.createIdMap(0), publishDiff);
        }
    }
    exports.TestOwnedTestCollection = TestOwnedTestCollection;
    /**
     * Gets a main thread test collection initialized with the given set of
     * roots/stubs.
     */
    const getInitializedMainTestCollection = async (root = testStubs_1.testStubs.nested()) => {
        const c = new testServiceImpl_1.MainThreadTestCollection(0, async (t, l) => singleUse.expand(t.testId, l));
        const singleUse = new TestSingleUseCollection({ object: new ownedTestCollection_1.TestTree(0), dispose: () => undefined }, () => undefined);
        singleUse.addRoot(root, 'provider');
        await singleUse.expand('id-root', Infinity);
        c.apply(singleUse.collectDiff());
        return c;
    };
    exports.getInitializedMainTestCollection = getInitializedMainTestCollection;
});
//# sourceMappingURL=ownedTestCollection.js.map