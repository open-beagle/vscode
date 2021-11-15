/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/testing/common/testingContextKeys", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingContextKeys = void 0;
    var TestingContextKeys;
    (function (TestingContextKeys) {
        TestingContextKeys.providerCount = new contextkey_1.RawContextKey('testing.providerCount', 0);
        TestingContextKeys.hasDebuggableTests = new contextkey_1.RawContextKey('testing.hasDebuggableTests', false);
        TestingContextKeys.hasRunnableTests = new contextkey_1.RawContextKey('testing.hasRunnableTests', false);
        TestingContextKeys.viewMode = new contextkey_1.RawContextKey('testing.explorerViewMode', "list" /* List */);
        TestingContextKeys.viewSorting = new contextkey_1.RawContextKey('testing.explorerViewSorting', "location" /* ByLocation */);
        TestingContextKeys.isRunning = new contextkey_1.RawContextKey('testing.isRunning', false);
        TestingContextKeys.isInPeek = new contextkey_1.RawContextKey('testing.isInPeek', true);
        TestingContextKeys.isPeekVisible = new contextkey_1.RawContextKey('testing.isPeekVisible', false);
        TestingContextKeys.explorerLocation = new contextkey_1.RawContextKey('testing.explorerLocation', 0 /* Sidebar */);
        TestingContextKeys.autoRun = new contextkey_1.RawContextKey('testing.autoRun', false);
        TestingContextKeys.testItemExtId = new contextkey_1.RawContextKey('testId', undefined, {
            type: 'string',
            description: (0, nls_1.localize)(0, null)
        });
    })(TestingContextKeys = exports.TestingContextKeys || (exports.TestingContextKeys = {}));
});
//# sourceMappingURL=testingContextKeys.js.map