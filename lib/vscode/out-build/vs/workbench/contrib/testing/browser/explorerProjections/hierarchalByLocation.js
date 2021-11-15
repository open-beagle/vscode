/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/explorerProjections/hierarchalNodes", "vs/workbench/contrib/testing/browser/explorerProjections/locationStore", "vs/workbench/contrib/testing/browser/explorerProjections/nodeHelper", "vs/workbench/contrib/testing/common/getComputedState", "vs/workbench/contrib/testing/common/testResultService", "vs/base/common/arrays", "vs/base/common/iterator"], function (require, exports, event_1, lifecycle_1, extHostTypes_1, index_1, hierarchalNodes_1, locationStore_1, nodeHelper_1, getComputedState_1, testResultService_1, arrays_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HierarchicalByLocationProjection = void 0;
    const computedStateAccessor = {
        getOwnState: i => i instanceof index_1.TestItemTreeElement ? i.ownState : extHostTypes_1.TestResultState.Unset,
        getCurrentComputedState: i => i.state,
        setComputedState: (i, s) => i.state = s,
        getChildren: i => iterator_1.Iterable.filter(i.children.values(), index_1.isActionableTestTreeElement),
        *getParents(i) {
            for (let parent = i.parent; parent; parent = parent.parent) {
                yield parent;
            }
        },
    };
    /**
     * Projection that lists tests in their traditional tree view.
     */
    let HierarchicalByLocationProjection = class HierarchicalByLocationProjection extends lifecycle_1.Disposable {
        constructor(listener, results) {
            super();
            this.listener = listener;
            this.results = results;
            this.updateEmitter = new event_1.Emitter();
            this.changes = new nodeHelper_1.NodeChangeList();
            this.locations = new locationStore_1.TestLocationStore();
            /**
             * Root folders and contained items.
             */
            this.folders = new Map();
            /**
             * @inheritdoc
             */
            this.onUpdate = this.updateEmitter.event;
            this.addUpdated = (item) => {
                const cast = item;
                this.changes.updated(cast);
            };
            this.renderNode = (node, recurse) => {
                if (node instanceof index_1.TestTreeErrorMessage) {
                    return { element: node };
                }
                // Omit the workspace folder or controller root if there are no siblings
                if (node.depth < 2 && !(0, nodeHelper_1.peersHaveChildren)(node, () => this.roots)) {
                    return 1 /* Concat */;
                }
                // Omit folders/roots that have no child tests
                if (node.depth < 2 && node.children.size === 0) {
                    return 0 /* Omit */;
                }
                if (!(node instanceof hierarchalNodes_1.ByLocationTestItemElement)) {
                    return { element: node, children: recurse(node.children) };
                }
                return {
                    element: node,
                    collapsible: node.test.expand !== 0 /* NotExpandable */,
                    collapsed: node.test.expand === 1 /* Expandable */ ? true : undefined,
                    children: recurse(node.children),
                };
            };
            this._register(listener.onDiff(([folder, diff]) => this.applyDiff(folder, diff)));
            this._register(listener.onFolderChange(this.applyFolderChange, this));
            // when test results are cleared, recalculate all state
            this._register(results.onResultsChanged((evt) => {
                var _a, _b;
                if (!('removed' in evt)) {
                    return;
                }
                for (const { items } of this.folders.values()) {
                    for (const inTree of [...items.values()].sort((a, b) => b.depth - a.depth)) {
                        const lookup = (_a = this.results.getStateById(inTree.test.item.extId)) === null || _a === void 0 ? void 0 : _a[1];
                        const computed = (_b = lookup === null || lookup === void 0 ? void 0 : lookup.computedState) !== null && _b !== void 0 ? _b : extHostTypes_1.TestResultState.Unset;
                        if (lookup) {
                            inTree.ownState = lookup.ownComputedState;
                        }
                        if (computed !== inTree.state) {
                            inTree.state = computed;
                            this.addUpdated(inTree);
                        }
                    }
                }
                this.updateEmitter.fire();
            }));
            // when test states change, reflect in the tree
            // todo: optimize this to avoid needing to iterate
            this._register(results.onTestChanged(({ item: result }) => {
                for (const { items } of this.folders.values()) {
                    const item = items.get(result.item.extId);
                    if (item) {
                        item.retired = result.retired;
                        (0, getComputedState_1.refreshComputedState)(computedStateAccessor, item, this.addUpdated, result.computedState);
                        this.addUpdated(item);
                        this.updateEmitter.fire();
                    }
                }
            }));
            for (const [folder, collection] of listener.workspaceFolderCollections) {
                const { items } = this.getOrCreateFolderElement(folder.folder);
                for (const node of collection.all) {
                    this.storeItem(items, this.createItem(node, folder.folder));
                }
            }
            for (const folder of this.folders.values()) {
                this.changes.addedOrRemoved(folder.root);
            }
        }
        /**
         * Gets root elements of the tree.
         */
        get roots() {
            return iterator_1.Iterable.map(this.folders.values(), f => f.root);
        }
        /**
         * Gets the depth of children to expanded automatically for the node,
         */
        getRevealDepth(element) {
            return element.depth === 1 ? 0 : undefined;
        }
        /**
         * @inheritdoc
         */
        getElementByTestId(testId) {
            return (0, arrays_1.mapFind)(this.folders.values(), f => f.items.get(testId));
        }
        applyFolderChange(evt) {
            for (const folder of evt.removed) {
                const existing = this.folders.get(folder.uri.toString());
                if (existing) {
                    this.folders.delete(folder.uri.toString());
                    this.changes.addedOrRemoved(existing.root);
                }
                this.updateEmitter.fire();
            }
        }
        /**
         * @inheritdoc
         */
        getTestAtPosition(uri, position) {
            return this.locations.getTestAtPosition(uri, position);
        }
        /**
         * @inheritdoc
         */
        hasTestInDocument(uri) {
            return this.locations.hasTestInDocument(uri);
        }
        /**
         * @inheritdoc
         */
        applyDiff(folder, diff) {
            var _a;
            const { items } = this.getOrCreateFolderElement(folder);
            for (const op of diff) {
                switch (op[0]) {
                    case 0 /* Add */: {
                        const item = this.createItem(op[1], folder);
                        this.storeItem(items, item);
                        this.changes.addedOrRemoved(item);
                        break;
                    }
                    case 1 /* Update */: {
                        const patch = op[1];
                        const existing = items.get(patch.extId);
                        if (!existing) {
                            break;
                        }
                        const locationChanged = !!((_a = patch.item) === null || _a === void 0 ? void 0 : _a.range);
                        if (locationChanged) {
                            this.locations.remove(existing);
                        }
                        existing.update(patch);
                        if (locationChanged) {
                            this.locations.add(existing);
                        }
                        this.addUpdated(existing);
                        break;
                    }
                    case 2 /* Remove */: {
                        const toRemove = items.get(op[1]);
                        if (!toRemove) {
                            break;
                        }
                        this.changes.addedOrRemoved(toRemove);
                        const queue = [[toRemove]];
                        while (queue.length) {
                            for (const item of queue.pop()) {
                                if (item instanceof hierarchalNodes_1.ByLocationTestItemElement) {
                                    queue.push(this.unstoreItem(items, item));
                                }
                            }
                        }
                    }
                }
            }
            if (diff.length !== 0) {
                this.updateEmitter.fire();
            }
        }
        /**
         * @inheritdoc
         */
        applyTo(tree) {
            this.changes.applyTo(tree, this.renderNode, () => this.roots);
        }
        /**
         * @inheritdoc
         */
        expandElement(element, depth) {
            if (!(element instanceof hierarchalNodes_1.ByLocationTestItemElement)) {
                return;
            }
            if (element.test.expand === 0 /* NotExpandable */) {
                return;
            }
            const folder = element.folder;
            const collection = this.listener.workspaceFolderCollections.find(([f]) => f.folder === folder);
            collection === null || collection === void 0 ? void 0 : collection[1].expand(element.test.item.extId, depth);
        }
        createItem(item, folder) {
            const { items, root } = this.getOrCreateFolderElement(folder);
            const parent = item.parent ? items.get(item.parent) : root;
            return new hierarchalNodes_1.ByLocationTestItemElement(item, parent, n => this.changes.addedOrRemoved(n));
        }
        getOrCreateFolderElement(folder) {
            let f = this.folders.get(folder.uri.toString());
            if (!f) {
                f = { root: new hierarchalNodes_1.ByLocationFolderElement(folder), items: new Map() };
                this.changes.addedOrRemoved(f.root);
                this.folders.set(folder.uri.toString(), f);
            }
            return f;
        }
        unstoreItem(items, treeElement) {
            treeElement.parent.children.delete(treeElement);
            items.delete(treeElement.test.item.extId);
            this.locations.remove(treeElement);
            return treeElement.children;
        }
        storeItem(items, treeElement) {
            var _a;
            treeElement.parent.children.add(treeElement);
            items.set(treeElement.test.item.extId, treeElement);
            this.locations.add(treeElement);
            const reveal = this.getRevealDepth(treeElement);
            if (reveal !== undefined) {
                this.expandElement(treeElement, reveal);
            }
            const prevState = (_a = this.results.getStateById(treeElement.test.item.extId)) === null || _a === void 0 ? void 0 : _a[1];
            if (prevState) {
                treeElement.retired = prevState.retired;
                (0, getComputedState_1.refreshComputedState)(computedStateAccessor, treeElement, this.addUpdated, prevState.computedState);
            }
        }
    };
    HierarchicalByLocationProjection = __decorate([
        __param(1, testResultService_1.ITestResultService)
    ], HierarchicalByLocationProjection);
    exports.HierarchicalByLocationProjection = HierarchicalByLocationProjection;
});
//# sourceMappingURL=hierarchalByLocation.js.map