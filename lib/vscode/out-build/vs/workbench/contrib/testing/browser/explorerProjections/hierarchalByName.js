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
define(["require", "exports", "vs/base/common/iterator", "vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByLocation", "vs/workbench/contrib/testing/browser/explorerProjections/hierarchalNodes", "vs/workbench/contrib/testing/common/testResultService"], function (require, exports, iterator_1, hierarchalByLocation_1, hierarchalNodes_1, testResultService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HierarchicalByNameProjection = exports.ByNameTestItemElement = exports.ListElementType = void 0;
    /**
     * Type of test element in the list.
     */
    var ListElementType;
    (function (ListElementType) {
        /** The element is a leaf test that should be shown in the list */
        ListElementType[ListElementType["TestLeaf"] = 0] = "TestLeaf";
        /** The element is not runnable, but doesn't have any nested leaf tests */
        ListElementType[ListElementType["BranchWithLeaf"] = 1] = "BranchWithLeaf";
        /** The element has nested leaf tests */
        ListElementType[ListElementType["BranchWithoutLeaf"] = 2] = "BranchWithoutLeaf";
        /** State not yet computed */
        ListElementType[ListElementType["Unset"] = 3] = "Unset";
    })(ListElementType = exports.ListElementType || (exports.ListElementType = {}));
    /**
     * Version of the HierarchicalElement that is displayed as a list.
     */
    class ByNameTestItemElement extends hierarchalNodes_1.ByLocationTestItemElement {
        /**
         * @param actualParent Parent of the item in the test heirarchy
         */
        constructor(internal, parentItem, addedOrRemoved, actualParent) {
            super(internal, parentItem, addedOrRemoved);
            this.actualParent = actualParent;
            this.elementType = 3 /* Unset */;
            this.isTestRoot = !this.actualParent;
            this.actualChildren = new Set();
            actualParent === null || actualParent === void 0 ? void 0 : actualParent.addChild(this);
            this.updateLeafTestState();
        }
        get description() {
            let description = null;
            for (let parent = this.actualParent; parent && !parent.isTestRoot; parent = parent.actualParent) {
                description = description ? `${parent.label} › ${description}` : parent.label;
            }
            return description;
        }
        /**
         * @override
         */
        update(patch) {
            var _a;
            super.update(patch);
            if (((_a = patch.item) === null || _a === void 0 ? void 0 : _a.runnable) !== undefined) {
                this.updateLeafTestState();
            }
        }
        /**
         * Should be called when the list element is removed.
         */
        remove() {
            var _a;
            (_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.removeChild(this);
        }
        removeChild(element) {
            this.actualChildren.delete(element);
            this.updateLeafTestState();
        }
        addChild(element) {
            this.actualChildren.add(element);
            this.updateLeafTestState();
        }
        /**
         * Updates the test leaf state for this node. Should be called when a child
         * or this node is modified. Note that we never need to look at the children
         * here, the children will already be leaves, or not.
         */
        updateLeafTestState() {
            var _a;
            const newType = iterator_1.Iterable.some(this.actualChildren, c => c.elementType !== 2 /* BranchWithoutLeaf */)
                ? 1 /* BranchWithLeaf */
                : this.test.item.runnable
                    ? 0 /* TestLeaf */
                    : 2 /* BranchWithoutLeaf */;
            if (newType !== this.elementType) {
                this.elementType = newType;
                this.addedOrRemoved(this);
            }
            (_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.updateLeafTestState();
        }
    }
    exports.ByNameTestItemElement = ByNameTestItemElement;
    /**
     * Projection that shows tests in a flat list (grouped by provider). The only
     * change is that, while creating the item, the item parent is set to the
     * test root rather than the heirarchal parent.
     */
    let HierarchicalByNameProjection = class HierarchicalByNameProjection extends hierarchalByLocation_1.HierarchicalByLocationProjection {
        constructor(listener, results) {
            super(listener, results);
            const originalRenderNode = this.renderNode.bind(this);
            this.renderNode = (node, recurse) => {
                if (node instanceof ByNameTestItemElement && node.elementType !== 0 /* TestLeaf */ && !node.isTestRoot) {
                    return 1 /* Concat */;
                }
                const rendered = originalRenderNode(node, recurse);
                if (typeof rendered !== 'number') {
                    rendered.collapsible = false;
                }
                return rendered;
            };
        }
        /**
         * @override
         */
        createItem(item, folder) {
            const { root, items } = this.getOrCreateFolderElement(folder);
            const actualParent = item.parent ? items.get(item.parent) : undefined;
            for (const testRoot of root.children) {
                if (testRoot.test.src.controller === item.src.controller) {
                    return new ByNameTestItemElement(item, testRoot, r => this.changes.addedOrRemoved(r), actualParent);
                }
            }
            return new ByNameTestItemElement(item, root, r => this.changes.addedOrRemoved(r));
        }
        /**
         * @override
         */
        unstoreItem(items, item) {
            const treeChildren = super.unstoreItem(items, item);
            if (item instanceof ByNameTestItemElement) {
                item.remove();
                return item.actualChildren;
            }
            return treeChildren;
        }
        /**
         * @override
         */
        getRevealDepth(element) {
            return element.depth === 1 ? Infinity : undefined;
        }
    };
    HierarchicalByNameProjection = __decorate([
        __param(1, testResultService_1.ITestResultService)
    ], HierarchicalByNameProjection);
    exports.HierarchicalByNameProjection = HierarchicalByNameProjection;
});
//# sourceMappingURL=hierarchalByName.js.map