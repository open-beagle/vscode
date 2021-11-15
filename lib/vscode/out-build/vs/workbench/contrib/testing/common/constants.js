/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/testing/common/constants", "vs/workbench/api/common/extHostTypes"], function (require, exports, nls_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testStateNames = exports.TestExplorerStateFilter = exports.TestExplorerViewSorting = exports.TestExplorerViewMode = exports.Testing = void 0;
    var Testing;
    (function (Testing) {
        // marked as "extension" so that any existing test extensions are assigned to it.
        Testing["ViewletId"] = "workbench.view.extension.test";
        Testing["ExplorerViewId"] = "workbench.view.testing";
        Testing["OutputPeekContributionId"] = "editor.contrib.testingOutputPeek";
        Testing["DecorationsContributionId"] = "editor.contrib.testingDecorations";
        Testing["FilterActionId"] = "workbench.actions.treeView.testExplorer.filter";
    })(Testing = exports.Testing || (exports.Testing = {}));
    var TestExplorerViewMode;
    (function (TestExplorerViewMode) {
        TestExplorerViewMode["List"] = "list";
        TestExplorerViewMode["Tree"] = "true";
    })(TestExplorerViewMode = exports.TestExplorerViewMode || (exports.TestExplorerViewMode = {}));
    var TestExplorerViewSorting;
    (function (TestExplorerViewSorting) {
        TestExplorerViewSorting["ByLocation"] = "location";
        TestExplorerViewSorting["ByName"] = "name";
    })(TestExplorerViewSorting = exports.TestExplorerViewSorting || (exports.TestExplorerViewSorting = {}));
    var TestExplorerStateFilter;
    (function (TestExplorerStateFilter) {
        TestExplorerStateFilter["OnlyFailed"] = "failed";
        TestExplorerStateFilter["OnlyExecuted"] = "excuted";
        TestExplorerStateFilter["All"] = "all";
    })(TestExplorerStateFilter = exports.TestExplorerStateFilter || (exports.TestExplorerStateFilter = {}));
    exports.testStateNames = {
        [extHostTypes_1.TestResultState.Errored]: (0, nls_1.localize)(0, null),
        [extHostTypes_1.TestResultState.Failed]: (0, nls_1.localize)(1, null),
        [extHostTypes_1.TestResultState.Passed]: (0, nls_1.localize)(2, null),
        [extHostTypes_1.TestResultState.Queued]: (0, nls_1.localize)(3, null),
        [extHostTypes_1.TestResultState.Running]: (0, nls_1.localize)(4, null),
        [extHostTypes_1.TestResultState.Skipped]: (0, nls_1.localize)(5, null),
        [extHostTypes_1.TestResultState.Unset]: (0, nls_1.localize)(6, null),
    };
});
//# sourceMappingURL=constants.js.map