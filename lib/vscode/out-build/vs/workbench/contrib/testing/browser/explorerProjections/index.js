/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/iterator", "vs/workbench/api/common/extHostTypes"], function (require, exports, iterator_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isActionableTestTreeElement = exports.TestTreeErrorMessage = exports.TestItemTreeElement = exports.TestTreeWorkspaceFolder = void 0;
    let idCounter = 0;
    const getId = () => String(idCounter++);
    class TestTreeWorkspaceFolder {
        constructor(folder) {
            this.folder = folder;
            /**
             * @inheritdoc
             */
            this.parent = null;
            /**
             * @inheritdoc
             */
            this.children = new Set();
            /**
             * @inheritdoc
             */
            this.treeId = getId();
            /**
             * @inheritdoc
             */
            this.depth = 0;
            /**
             * @inheritdoc
             */
            this.state = extHostTypes_1.TestResultState.Unset;
        }
        /**
         * @inheritdoc
         */
        get runnable() {
            return iterator_1.Iterable.concatNested(iterator_1.Iterable.map(this.children, c => c.runnable));
        }
        /**
         * @inheritdoc
         */
        get debuggable() {
            return iterator_1.Iterable.concatNested(iterator_1.Iterable.map(this.children, c => c.debuggable));
        }
        /**
         * @inheritdoc
         */
        get label() {
            return this.folder.name;
        }
    }
    exports.TestTreeWorkspaceFolder = TestTreeWorkspaceFolder;
    class TestItemTreeElement {
        constructor(test, parent) {
            this.test = test;
            this.parent = parent;
            /**
             * @inheritdoc
             */
            this.children = new Set();
            /**
             * @inheritdoc
             */
            this.treeId = getId();
            /**
             * @inheritdoc
             */
            this.depth = this.parent.depth + 1;
            /**
             * Whether the node's test result is 'retired' -- from an outdated test run.
             */
            this.retired = false;
            /**
             * @inheritdoc
             */
            this.state = extHostTypes_1.TestResultState.Unset;
            /**
             * Own, non-computed state.
             */
            this.ownState = extHostTypes_1.TestResultState.Unset;
        }
        /**
         * @inheritdoc
         */
        get folder() {
            return this.parent.folder;
        }
        /**
         * @inheritdoc
         */
        get runnable() {
            return this.test.item.runnable
                ? iterator_1.Iterable.single({ testId: this.test.item.extId, src: this.test.src })
                : iterator_1.Iterable.empty();
        }
        /**
         * @inheritdoc
         */
        get debuggable() {
            return this.test.item.debuggable
                ? iterator_1.Iterable.single({ testId: this.test.item.extId, src: this.test.src })
                : iterator_1.Iterable.empty();
        }
        get description() {
            return this.test.item.description;
        }
        /**
         * @inheritdoc
         */
        get label() {
            return this.test.item.label;
        }
    }
    exports.TestItemTreeElement = TestItemTreeElement;
    class TestTreeErrorMessage {
        constructor(message, parent) {
            this.message = message;
            this.parent = parent;
            this.treeId = getId();
            this.children = new Set();
        }
        get description() {
            return typeof this.message === 'string' ? this.message : this.message.value;
        }
    }
    exports.TestTreeErrorMessage = TestTreeErrorMessage;
    const isActionableTestTreeElement = (t) => t instanceof TestItemTreeElement || t instanceof TestTreeWorkspaceFolder;
    exports.isActionableTestTreeElement = isActionableTestTreeElement;
});
//# sourceMappingURL=index.js.map