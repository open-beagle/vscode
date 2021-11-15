/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/taskService", "vs/platform/instantiation/common/instantiation", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, instantiation_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.USER_TASKS_GROUP_KEY = exports.ITaskService = exports.ProcessExecutionSupportedContext = exports.ShellExecutionSupportedContext = exports.CustomExecutionSupportedContext = void 0;
    exports.CustomExecutionSupportedContext = new contextkey_1.RawContextKey('customExecutionSupported', true, nls.localize(0, null));
    exports.ShellExecutionSupportedContext = new contextkey_1.RawContextKey('shellExecutionSupported', false, nls.localize(1, null));
    exports.ProcessExecutionSupportedContext = new contextkey_1.RawContextKey('processExecutionSupported', false, nls.localize(2, null));
    exports.ITaskService = (0, instantiation_1.createDecorator)('taskService');
    exports.USER_TASKS_GROUP_KEY = 'settings';
});
//# sourceMappingURL=taskService.js.map