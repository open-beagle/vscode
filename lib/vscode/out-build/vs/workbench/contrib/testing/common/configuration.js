/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/testing/common/configuration"], function (require, exports, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getTestingConfiguration = exports.testingConfiguation = exports.AutoRunMode = exports.AutoOpenPeekViewWhen = exports.TestingConfigKeys = void 0;
    var TestingConfigKeys;
    (function (TestingConfigKeys) {
        TestingConfigKeys["AutoRunDelay"] = "testing.autoRun.delay";
        TestingConfigKeys["AutoRunMode"] = "testing.autoRun.mode";
        TestingConfigKeys["AutoOpenPeekView"] = "testing.automaticallyOpenPeekView";
        TestingConfigKeys["AutoOpenPeekViewDuringAutoRun"] = "testing.automaticallyOpenPeekViewDuringAutoRun";
        TestingConfigKeys["FollowRunningTest"] = "testing.followRunningTest";
    })(TestingConfigKeys = exports.TestingConfigKeys || (exports.TestingConfigKeys = {}));
    var AutoOpenPeekViewWhen;
    (function (AutoOpenPeekViewWhen) {
        AutoOpenPeekViewWhen["FailureVisible"] = "failureInVisibleDocument";
        AutoOpenPeekViewWhen["FailureAnywhere"] = "failureAnywhere";
    })(AutoOpenPeekViewWhen = exports.AutoOpenPeekViewWhen || (exports.AutoOpenPeekViewWhen = {}));
    var AutoRunMode;
    (function (AutoRunMode) {
        AutoRunMode["AllInWorkspace"] = "all";
        AutoRunMode["OnlyPreviouslyRun"] = "rerun";
    })(AutoRunMode = exports.AutoRunMode || (exports.AutoRunMode = {}));
    exports.testingConfiguation = {
        id: 'testing',
        order: 21,
        title: (0, nls_1.localize)(0, null),
        type: 'object',
        properties: {
            ["testing.autoRun.mode" /* AutoRunMode */]: {
                description: (0, nls_1.localize)(1, null),
                enum: [
                    "all" /* AllInWorkspace */,
                    "rerun" /* OnlyPreviouslyRun */,
                ],
                default: "all" /* AllInWorkspace */,
                enumDescriptions: [
                    (0, nls_1.localize)(2, null),
                    (0, nls_1.localize)(3, null)
                ],
            },
            ["testing.autoRun.delay" /* AutoRunDelay */]: {
                type: 'integer',
                minimum: 0,
                description: (0, nls_1.localize)(4, null),
                default: 1000,
            },
            ["testing.automaticallyOpenPeekView" /* AutoOpenPeekView */]: {
                description: (0, nls_1.localize)(5, null),
                enum: [
                    "failureAnywhere" /* FailureAnywhere */,
                    "failureInVisibleDocument" /* FailureVisible */,
                ],
                default: "failureInVisibleDocument" /* FailureVisible */,
                enumDescriptions: [
                    (0, nls_1.localize)(6, null),
                    (0, nls_1.localize)(7, null)
                ],
            },
            ["testing.automaticallyOpenPeekViewDuringAutoRun" /* AutoOpenPeekViewDuringAutoRun */]: {
                description: (0, nls_1.localize)(8, null),
                type: 'boolean',
                default: false,
            },
            ["testing.followRunningTest" /* FollowRunningTest */]: {
                description: (0, nls_1.localize)(9, null),
                type: 'boolean',
                default: true,
            },
        }
    };
    const getTestingConfiguration = (config, key) => config.getValue(key);
    exports.getTestingConfiguration = getTestingConfiguration;
});
//# sourceMappingURL=configuration.js.map