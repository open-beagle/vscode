/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/api/common/extHostTypes"], function (require, exports, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isRunningState = exports.statesInOrder = exports.maxPriority = exports.cmpPriority = exports.stateNodes = exports.isStateWithResult = exports.isFailedState = exports.statePriority = void 0;
    /**
     * List of display priorities for different run states. When tests update,
     * the highest-priority state from any of their children will be the state
     * reflected in the parent node.
     */
    exports.statePriority = {
        [extHostTypes_1.TestResultState.Running]: 6,
        [extHostTypes_1.TestResultState.Errored]: 5,
        [extHostTypes_1.TestResultState.Failed]: 4,
        [extHostTypes_1.TestResultState.Passed]: 3,
        [extHostTypes_1.TestResultState.Queued]: 2,
        [extHostTypes_1.TestResultState.Unset]: 1,
        [extHostTypes_1.TestResultState.Skipped]: 0,
    };
    const isFailedState = (s) => s === extHostTypes_1.TestResultState.Errored || s === extHostTypes_1.TestResultState.Failed;
    exports.isFailedState = isFailedState;
    const isStateWithResult = (s) => s === extHostTypes_1.TestResultState.Errored || s === extHostTypes_1.TestResultState.Failed || s === extHostTypes_1.TestResultState.Passed;
    exports.isStateWithResult = isStateWithResult;
    exports.stateNodes = Object.entries(exports.statePriority).reduce((acc, [stateStr, priority]) => {
        const state = Number(stateStr);
        acc[state] = { statusNode: true, state, priority };
        return acc;
    }, {});
    const cmpPriority = (a, b) => exports.statePriority[b] - exports.statePriority[a];
    exports.cmpPriority = cmpPriority;
    const maxPriority = (...states) => {
        switch (states.length) {
            case 0:
                return extHostTypes_1.TestResultState.Unset;
            case 1:
                return states[0];
            case 2:
                return exports.statePriority[states[0]] > exports.statePriority[states[1]] ? states[0] : states[1];
            default:
                let max = states[0];
                for (let i = 1; i < states.length; i++) {
                    if (exports.statePriority[max] < exports.statePriority[states[i]]) {
                        max = states[i];
                    }
                }
                return max;
        }
    };
    exports.maxPriority = maxPriority;
    exports.statesInOrder = Object.keys(exports.statePriority).map(s => Number(s)).sort(exports.cmpPriority);
    const isRunningState = (s) => s === extHostTypes_1.TestResultState.Queued || s === extHostTypes_1.TestResultState.Running;
    exports.isRunningState = isRunningState;
});
//# sourceMappingURL=testingStates.js.map