/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractIncrementalTestCollection = exports.IncrementalChangeCollector = exports.getTestSubscriptionKey = exports.TestDiffOpType = exports.applyTestItemUpdate = exports.TestItemExpandState = void 0;
    var TestItemExpandState;
    (function (TestItemExpandState) {
        TestItemExpandState[TestItemExpandState["NotExpandable"] = 0] = "NotExpandable";
        TestItemExpandState[TestItemExpandState["Expandable"] = 1] = "Expandable";
        TestItemExpandState[TestItemExpandState["BusyExpanding"] = 2] = "BusyExpanding";
        TestItemExpandState[TestItemExpandState["Expanded"] = 3] = "Expanded";
    })(TestItemExpandState = exports.TestItemExpandState || (exports.TestItemExpandState = {}));
    const applyTestItemUpdate = (internal, patch) => {
        if (patch.expand !== undefined) {
            internal.expand = patch.expand;
        }
        if (patch.item !== undefined) {
            internal.item = internal.item ? Object.assign(internal.item, patch.item) : patch.item;
        }
    };
    exports.applyTestItemUpdate = applyTestItemUpdate;
    var TestDiffOpType;
    (function (TestDiffOpType) {
        /** Adds a new test (with children) */
        TestDiffOpType[TestDiffOpType["Add"] = 0] = "Add";
        /** Shallow-updates an existing test */
        TestDiffOpType[TestDiffOpType["Update"] = 1] = "Update";
        /** Removes a test (and all its children) */
        TestDiffOpType[TestDiffOpType["Remove"] = 2] = "Remove";
        /** Changes the number of controllers who are yet to publish their collection roots. */
        TestDiffOpType[TestDiffOpType["IncrementPendingExtHosts"] = 3] = "IncrementPendingExtHosts";
        /** Retires a test/result */
        TestDiffOpType[TestDiffOpType["Retire"] = 4] = "Retire";
    })(TestDiffOpType = exports.TestDiffOpType || (exports.TestDiffOpType = {}));
    /**
     * Utility function to get a unique string for a subscription to a resource,
     * useful to keep maps of document or workspace folder subscription info.
     */
    const getTestSubscriptionKey = (resource, uri) => `${resource}:${uri.toString()}`;
    exports.getTestSubscriptionKey = getTestSubscriptionKey;
    /**
     * The IncrementalChangeCollector is used in the IncrementalTestCollection
     * and called with diff changes as they're applied. This is used in the
     * ext host to create a cohesive change event from a diff.
     */
    class IncrementalChangeCollector {
        /**
         * A node was added.
         */
        add(node) { }
        /**
         * A node in the collection was updated.
         */
        update(node) { }
        /**
         * A node was removed.
         */
        remove(node, isNestedOperation) { }
        /**
         * Called when the diff has been applied.
         */
        complete() { }
    }
    exports.IncrementalChangeCollector = IncrementalChangeCollector;
    /**
     * Maintains tests in this extension host sent from the main thread.
     */
    class AbstractIncrementalTestCollection {
        constructor() {
            /**
             * Map of item IDs to test item objects.
             */
            this.items = new Map();
            /**
             * ID of test root items.
             */
            this.roots = new Set();
            /**
             * Number of 'busy' controllers.
             */
            this.busyControllerCount = 0;
            /**
             * Number of pending roots.
             */
            this.pendingRootCount = 0;
        }
        /**
         * Applies the diff to the collection.
         */
        apply(diff) {
            const changes = this.createChangeCollector();
            for (const op of diff) {
                switch (op[0]) {
                    case 0 /* Add */: {
                        const internalTest = op[1];
                        if (!internalTest.parent) {
                            this.roots.add(internalTest.item.extId);
                            const created = this.createItem(internalTest);
                            this.items.set(internalTest.item.extId, created);
                            changes.add(created);
                        }
                        else if (this.items.has(internalTest.parent)) {
                            const parent = this.items.get(internalTest.parent);
                            parent.children.add(internalTest.item.extId);
                            const created = this.createItem(internalTest, parent);
                            this.items.set(internalTest.item.extId, created);
                            changes.add(created);
                        }
                        if (internalTest.expand === 2 /* BusyExpanding */) {
                            this.busyControllerCount++;
                        }
                        break;
                    }
                    case 1 /* Update */: {
                        const patch = op[1];
                        const existing = this.items.get(patch.extId);
                        if (!existing) {
                            break;
                        }
                        if (patch.expand !== undefined) {
                            if (existing.expand === 2 /* BusyExpanding */) {
                                this.busyControllerCount--;
                            }
                            if (patch.expand === 2 /* BusyExpanding */) {
                                this.busyControllerCount++;
                            }
                        }
                        (0, exports.applyTestItemUpdate)(existing, patch);
                        changes.update(existing);
                        break;
                    }
                    case 2 /* Remove */: {
                        const toRemove = this.items.get(op[1]);
                        if (!toRemove) {
                            break;
                        }
                        if (toRemove.parent) {
                            const parent = this.items.get(toRemove.parent);
                            parent.children.delete(toRemove.item.extId);
                        }
                        else {
                            this.roots.delete(toRemove.item.extId);
                        }
                        const queue = [[op[1]]];
                        while (queue.length) {
                            for (const itemId of queue.pop()) {
                                const existing = this.items.get(itemId);
                                if (existing) {
                                    queue.push(existing.children);
                                    this.items.delete(itemId);
                                    changes.remove(existing, existing !== toRemove);
                                    if (existing.expand === 2 /* BusyExpanding */) {
                                        this.busyControllerCount--;
                                    }
                                }
                            }
                        }
                        break;
                    }
                    case 4 /* Retire */:
                        this.retireTest(op[1]);
                        break;
                    case 3 /* IncrementPendingExtHosts */:
                        this.updatePendingRoots(op[1]);
                        break;
                }
            }
            changes.complete();
        }
        /**
         * Called when the extension signals a test result should be retired.
         */
        retireTest(testId) {
            // no-op
        }
        /**
         * Updates the number of test root sources who are yet to report. When
         * the total pending test roots reaches 0, the roots for all controllers
         * will exist in the collection.
         */
        updatePendingRoots(delta) {
            this.pendingRootCount += delta;
        }
        /**
         * Called before a diff is applied to create a new change collector.
         */
        createChangeCollector() {
            return new IncrementalChangeCollector();
        }
    }
    exports.AbstractIncrementalTestCollection = AbstractIncrementalTestCollection;
});
//# sourceMappingURL=testCollection.js.map