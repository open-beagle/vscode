/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/testingStates"], function (require, exports, extHostTypes_1, testingStates_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.refreshComputedState = exports.getComputedState = void 0;
    /**
     * Gets the computed state for the node.
     * @param force whether to refresh the computed state for this node, even
     * if it was previously set.
     */
    const getComputedState = (accessor, node, force = false) => {
        var _a;
        let computed = accessor.getCurrentComputedState(node);
        if (computed === undefined || force) {
            computed = (_a = accessor.getOwnState(node)) !== null && _a !== void 0 ? _a : extHostTypes_1.TestResultState.Unset;
            for (const child of accessor.getChildren(node)) {
                computed = (0, testingStates_1.maxPriority)(computed, (0, exports.getComputedState)(accessor, child));
            }
            accessor.setComputedState(node, computed);
        }
        return computed;
    };
    exports.getComputedState = getComputedState;
    /**
     * Refreshes the computed state for the node and its parents. Any changes
     * elements cause `addUpdated` to be called.
     */
    const refreshComputedState = (accessor, node, addUpdated, explicitNewComputedState) => {
        const oldState = accessor.getCurrentComputedState(node);
        const oldPriority = testingStates_1.statePriority[oldState];
        const newState = explicitNewComputedState !== null && explicitNewComputedState !== void 0 ? explicitNewComputedState : (0, exports.getComputedState)(accessor, node, true);
        const newPriority = testingStates_1.statePriority[newState];
        if (newPriority === oldPriority) {
            return;
        }
        accessor.setComputedState(node, newState);
        addUpdated(node);
        if (newPriority > oldPriority) {
            // Update all parents to ensure they're at least this priority.
            for (const parent of accessor.getParents(node)) {
                const prev = accessor.getCurrentComputedState(parent);
                if (prev !== undefined && testingStates_1.statePriority[prev] >= newPriority) {
                    break;
                }
                accessor.setComputedState(parent, newState);
                addUpdated(parent);
            }
        }
        else if (newPriority < oldPriority) {
            // Re-render all parents of this node whose computed priority might have come from this node
            for (const parent of accessor.getParents(node)) {
                const prev = accessor.getCurrentComputedState(parent);
                if (prev === undefined || testingStates_1.statePriority[prev] > oldPriority) {
                    break;
                }
                accessor.setComputedState(parent, (0, exports.getComputedState)(accessor, parent, true));
                addUpdated(parent);
            }
        }
    };
    exports.refreshComputedState = refreshComputedState;
});
//# sourceMappingURL=getComputedState.js.map