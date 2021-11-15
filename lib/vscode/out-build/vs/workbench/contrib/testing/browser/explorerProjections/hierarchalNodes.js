/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/common/testCollection"], function (require, exports, index_1, testCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ByLocationFolderElement = exports.ByLocationTestItemElement = void 0;
    /**
     * Test tree element element that groups be hierarchy.
     */
    class ByLocationTestItemElement extends index_1.TestItemTreeElement {
        constructor(test, parent, addedOrRemoved) {
            super(Object.assign(Object.assign({}, test), { item: Object.assign({}, test.item) }), parent);
            this.addedOrRemoved = addedOrRemoved;
            this.parent = parent;
            this.updateErrorVisiblity();
        }
        update(patch) {
            (0, testCollection_1.applyTestItemUpdate)(this.test, patch);
            this.updateErrorVisiblity();
        }
        updateErrorVisiblity() {
            if (this.errorChild && !this.test.item.error) {
                this.addedOrRemoved(this.errorChild);
                this.children.delete(this.errorChild);
                this.errorChild = undefined;
            }
            else if (this.test.item.error && !this.errorChild) {
                this.errorChild = new index_1.TestTreeErrorMessage(this.test.item.error, this);
                this.children.add(this.errorChild);
                this.addedOrRemoved(this.errorChild);
            }
        }
    }
    exports.ByLocationTestItemElement = ByLocationTestItemElement;
    /**
     * Workspace folder in the location view.
     */
    class ByLocationFolderElement extends index_1.TestTreeWorkspaceFolder {
        constructor() {
            super(...arguments);
            this.children = new Set();
        }
    }
    exports.ByLocationFolderElement = ByLocationFolderElement;
});
//# sourceMappingURL=hierarchalNodes.js.map