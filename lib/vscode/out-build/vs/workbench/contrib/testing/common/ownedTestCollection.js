/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/types", "vs/workbench/api/common/extHostTestingPrivateApi", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/testCollection"], function (require, exports, arrays_1, async_1, cancellation_1, types_1, extHostTestingPrivateApi_1, Convert, extHostTypes_1, testCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SingleUseTestCollection = exports.TestTree = exports.TestPosition = exports.OwnedTestCollection = void 0;
    /**
     * @private
     */
    class OwnedTestCollection {
        constructor() {
            this.testIdsToInternal = new Map();
        }
        /**
         * Gets test information by ID, if it was defined and still exists in this
         * extension host.
         */
        getTestById(id, preferTree) {
            if (preferTree !== undefined) {
                const tree = this.testIdsToInternal.get(preferTree);
                const test = tree === null || tree === void 0 ? void 0 : tree.get(id);
                if (test) {
                    return [tree, test];
                }
            }
            return (0, arrays_1.mapFind)(this.testIdsToInternal.values(), t => {
                const owned = t.get(id);
                return owned && [t, owned];
            });
        }
        /**
         * Creates a new test collection for a specific hierarchy for a workspace
         * or document observation.
         */
        createForHierarchy(publishDiff = () => undefined) {
            return new SingleUseTestCollection(this.createIdMap(treeIdCounter++), publishDiff);
        }
        createIdMap(id) {
            const tree = new TestTree(id);
            this.testIdsToInternal.set(tree.id, tree);
            return { object: tree, dispose: () => this.testIdsToInternal.delete(tree.id) };
        }
    }
    exports.OwnedTestCollection = OwnedTestCollection;
    /**
     * Enum for describing relative positions of tests. Similar to
     * `node.compareDocumentPosition` in the DOM.
     */
    var TestPosition;
    (function (TestPosition) {
        /** Neither a nor b are a child of one another. They may share a common parent, though. */
        TestPosition[TestPosition["Disconnected"] = 0] = "Disconnected";
        /** b is a child of a */
        TestPosition[TestPosition["IsChild"] = 1] = "IsChild";
        /** b is a parent of a */
        TestPosition[TestPosition["IsParent"] = 2] = "IsParent";
        /** a === b */
        TestPosition[TestPosition["IsSame"] = 3] = "IsSame";
    })(TestPosition = exports.TestPosition || (exports.TestPosition = {}));
    let treeIdCounter = 0;
    /**
     * Test tree is (or will be after debt week 2020-03) the standard collection
     * for test trees. Internally it indexes tests by their extension ID in
     * a map.
     */
    class TestTree {
        constructor(id) {
            this.id = id;
            this.map = new Map();
            this._roots = new Set();
            this.roots = this._roots;
        }
        /**
         * Gets the size of the tree.
         */
        get size() {
            return this.map.size;
        }
        /**
         * Adds a new test to the tree if it doesn't exist.
         * @throws if a duplicate item is inserted
         */
        add(test) {
            if (this.map.has(test.item.extId)) {
                throw new Error(`Attempted to insert a duplicate test item ID ${test.item.extId}`);
            }
            this.map.set(test.item.extId, test);
            if (!test.parent) {
                this._roots.add(test);
            }
        }
        /**
         * Gets whether the test exists in the tree.
         */
        has(testId) {
            return this.map.has(testId);
        }
        /**
         * Removes a test ID from the tree. This is NOT recursive.
         */
        delete(testId) {
            const existing = this.map.get(testId);
            if (!existing) {
                return false;
            }
            this.map.delete(testId);
            this._roots.delete(existing);
            return true;
        }
        /**
         * Gets a test item by ID from the tree.
         */
        get(testId) {
            return this.map.get(testId);
        }
        /**
     * Compares the positions of the two items in the test tree.
         */
        comparePositions(aOrId, bOrId) {
            const a = typeof aOrId === 'string' ? this.map.get(aOrId) : aOrId;
            const b = typeof bOrId === 'string' ? this.map.get(bOrId) : bOrId;
            if (!a || !b) {
                return 0 /* Disconnected */;
            }
            if (a === b) {
                return 3 /* IsSame */;
            }
            for (let p = this.map.get(b.parent); p; p = this.map.get(p.parent)) {
                if (p === a) {
                    return 1 /* IsChild */;
                }
            }
            for (let p = this.map.get(a.parent); p; p = this.map.get(p.parent)) {
                if (p === b) {
                    return 2 /* IsParent */;
                }
            }
            return 0 /* Disconnected */;
        }
        /**
         * Iterates over all test in the tree.
         */
        [Symbol.iterator]() {
            return this.map.values();
        }
    }
    exports.TestTree = TestTree;
    /**
     * Maintains tests created and registered for a single set of hierarchies
     * for a workspace or document.
     * @private
     */
    class SingleUseTestCollection {
        constructor(testIdToInternal, publishDiff) {
            this.testIdToInternal = testIdToInternal;
            this.publishDiff = publishDiff;
            this.testItemToInternal = new Map();
            this.diff = [];
            this.debounceSendDiff = new async_1.RunOnceScheduler(() => this.flushDiff(), 200);
        }
        get treeId() {
            return this.testIdToInternal.object.id;
        }
        /**
         * Adds a new root node to the collection.
         */
        addRoot(item, controllerId) {
            this.addItem(item, controllerId, null);
        }
        /**
         * Gets test information by its reference, if it was defined and still exists
         * in this extension host.
         */
        getTestByReference(item) {
            return this.testItemToInternal.get(item);
        }
        /**
         * Gets a diff of all changes that have been made, and clears the diff queue.
         */
        collectDiff() {
            const diff = this.diff;
            this.diff = [];
            return diff;
        }
        /**
         * Pushes a new diff entry onto the collected diff list.
         */
        pushDiff(diff) {
            // Try to merge updates, since they're invoked per-property
            const last = this.diff[this.diff.length - 1];
            if (last && diff[0] === 1 /* Update */) {
                if (last[0] === 1 /* Update */ && last[1].extId === diff[1].extId) {
                    (0, testCollection_1.applyTestItemUpdate)(last[1], diff[1]);
                    return;
                }
                if (last[0] === 0 /* Add */ && last[1].item.extId === diff[1].extId) {
                    (0, testCollection_1.applyTestItemUpdate)(last[1], diff[1]);
                    return;
                }
            }
            this.diff.push(diff);
            if (!this.debounceSendDiff.isScheduled()) {
                this.debounceSendDiff.schedule();
            }
        }
        /**
         * Expands the test and the given number of `levels` of children. If levels
         * is < 0, then all children will be expanded. If it's 0, then only this
         * item will be expanded.
         */
        expand(testId, levels) {
            var _a;
            const internal = this.testIdToInternal.object.get(testId);
            if (!internal) {
                return;
            }
            if (internal.expandLevels === undefined || levels > internal.expandLevels) {
                internal.expandLevels = levels;
            }
            // try to avoid awaiting things if the provider returns synchronously in
            // order to keep everything in a single diff and DOM update.
            if (internal.expand === 1 /* Expandable */) {
                const r = this.refreshChildren(internal);
                return !r.isSettled
                    ? r.p.then(() => this.expandChildren(internal, levels - 1))
                    : this.expandChildren(internal, levels - 1);
            }
            else if (internal.expand === 3 /* Expanded */) {
                return ((_a = internal.initialExpand) === null || _a === void 0 ? void 0 : _a.isSettled) === false
                    ? internal.initialExpand.p.then(() => this.expandChildren(internal, levels - 1))
                    : this.expandChildren(internal, levels - 1);
            }
        }
        /**
         * @inheritdoc
         */
        dispose() {
            var _a;
            for (const item of this.testItemToInternal.values()) {
                (_a = item.discoverCts) === null || _a === void 0 ? void 0 : _a.dispose(true);
                (0, extHostTestingPrivateApi_1.getPrivateApiFor)(item.actual).bus.dispose();
            }
            this.diff = [];
            this.testIdToInternal.dispose();
            this.debounceSendDiff.dispose();
        }
        onTestItemEvent(internal, evt) {
            const extId = internal === null || internal === void 0 ? void 0 : internal.actual.id;
            switch (evt[0]) {
                case 2 /* Invalidated */:
                    this.pushDiff([4 /* Retire */, extId]);
                    break;
                case 1 /* Disposed */:
                    this.removeItem(internal);
                    break;
                case 0 /* NewChild */:
                    this.addItem(evt[1], internal.src.controller, internal);
                    break;
                case 3 /* SetProp */:
                    const [_, key, value] = evt;
                    switch (key) {
                        case 'status':
                            this.updateExpandability(internal);
                            break;
                        case 'range':
                            this.pushDiff([1 /* Update */, { extId, item: { range: Convert.Range.from(value) }, }]);
                            break;
                        case 'error':
                            this.pushDiff([1 /* Update */, { extId, item: { error: Convert.MarkdownString.fromStrict(value) || null }, }]);
                            break;
                        default:
                            this.pushDiff([1 /* Update */, { extId, item: { [key]: value !== null && value !== void 0 ? value : null } }]);
                            break;
                    }
                    break;
                default:
                    (0, types_1.assertNever)(evt[0]);
            }
        }
        addItem(actual, controllerId, parent) {
            if (!(actual instanceof extHostTypes_1.TestItemImpl)) {
                throw new Error(`TestItems provided to the VS Code API must extend \`vscode.TestItem\`, but ${actual.id} did not`);
            }
            if (this.testItemToInternal.has(actual)) {
                throw new Error(`Attempted to add a single TestItem ${actual.id} multiple times to the tree`);
            }
            if (this.testIdToInternal.object.has(actual.id)) {
                throw new Error(`Attempted to insert a duplicate test item ID ${actual.id}`);
            }
            const parentId = parent ? parent.item.extId : null;
            const expand = actual.resolveHandler ? 1 /* Expandable */ : 0 /* NotExpandable */;
            // always expand root node to know if there are tests (and whether to show the welcome view)
            const pExpandLvls = parent ? parent.expandLevels : 1;
            const src = { controller: controllerId, tree: this.testIdToInternal.object.id };
            const internal = {
                actual,
                parent: parentId,
                item: Convert.TestItem.from(actual),
                expandLevels: pExpandLvls /* intentionally undefined or 0 */ ? pExpandLvls - 1 : undefined,
                expand: 0 /* NotExpandable */,
                src,
            };
            this.testIdToInternal.object.add(internal);
            this.testItemToInternal.set(actual, internal);
            this.pushDiff([0 /* Add */, { parent: parentId, src, expand, item: internal.item }]);
            const api = (0, extHostTestingPrivateApi_1.getPrivateApiFor)(actual);
            api.parent = parent === null || parent === void 0 ? void 0 : parent.actual;
            api.bus.event(this.onTestItemEvent.bind(this, internal));
            // important that this comes after binding the event bus otherwise we
            // might miss a synchronous discovery completion
            this.updateExpandability(internal);
            // Discover any existing children that might have already been added
            for (const child of api.children.values()) {
                if (!this.testItemToInternal.has(child)) {
                    this.addItem(child, controllerId, internal);
                }
            }
        }
        /**
         * Updates the `expand` state of the item. Should be called whenever the
         * resolved state of the item changes. Can automatically expand the item
         * if requested by a consumer.
         */
        updateExpandability(internal) {
            var _a;
            let newState;
            if (!internal.actual.resolveHandler) {
                newState = 0 /* NotExpandable */;
            }
            else if (internal.actual.status === extHostTypes_1.TestItemStatus.Pending) {
                newState = internal.discoverCts
                    ? 2 /* BusyExpanding */
                    : 1 /* Expandable */;
            }
            else {
                (_a = internal.initialExpand) === null || _a === void 0 ? void 0 : _a.complete();
                newState = 3 /* Expanded */;
            }
            if (newState === internal.expand) {
                return;
            }
            internal.expand = newState;
            this.pushDiff([1 /* Update */, { extId: internal.actual.id, expand: newState }]);
            if (newState === 1 /* Expandable */ && internal.expandLevels !== undefined) {
                this.refreshChildren(internal);
            }
        }
        /**
         * Expands all children of the item, "levels" deep. If levels is 0, only
         * the children will be expanded. If it's 1, the children and their children
         * will be expanded. If it's <0, it's a no-op.
         */
        expandChildren(internal, levels) {
            if (levels < 0) {
                return;
            }
            const asyncChildren = [...internal.actual.children.values()]
                .map(c => this.expand(c.id, levels))
                .filter(async_1.isThenable);
            if (asyncChildren.length) {
                return Promise.all(asyncChildren).then(() => { });
            }
        }
        /**
         * Calls `discoverChildren` on the item, refreshing all its tests.
         */
        refreshChildren(internal) {
            if (internal.discoverCts) {
                internal.discoverCts.dispose(true);
            }
            if (!internal.actual.resolveHandler) {
                const p = new async_1.DeferredPromise();
                p.complete();
                return p;
            }
            internal.expand = 2 /* BusyExpanding */;
            internal.discoverCts = new cancellation_1.CancellationTokenSource();
            this.pushExpandStateUpdate(internal);
            internal.initialExpand = new async_1.DeferredPromise();
            internal.actual.resolveHandler(internal.discoverCts.token);
            return internal.initialExpand;
        }
        pushExpandStateUpdate(internal) {
            this.pushDiff([1 /* Update */, { extId: internal.actual.id, expand: internal.expand }]);
        }
        removeItem(internal) {
            var _a;
            this.pushDiff([2 /* Remove */, internal.actual.id]);
            const queue = [internal];
            while (queue.length) {
                const item = queue.pop();
                if (!item) {
                    continue;
                }
                (_a = item.discoverCts) === null || _a === void 0 ? void 0 : _a.dispose(true);
                this.testIdToInternal.object.delete(item.item.extId);
                this.testItemToInternal.delete(item.actual);
                for (const child of item.actual.children.values()) {
                    queue.push(this.testIdToInternal.object.get(child.id));
                }
            }
        }
        flushDiff() {
            const diff = this.collectDiff();
            if (diff.length) {
                this.publishDiff(diff);
            }
        }
    }
    exports.SingleUseTestCollection = SingleUseTestCollection;
});
//# sourceMappingURL=ownedTestCollection.js.map