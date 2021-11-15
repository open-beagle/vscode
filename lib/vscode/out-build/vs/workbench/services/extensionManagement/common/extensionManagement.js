/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, instantiation_1, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IWebExtensionsScannerService = exports.IWorkbenchExtensionEnablementService = exports.EnablementState = exports.IWorkbenchExtensionManagementService = exports.IExtensionManagementServerService = void 0;
    exports.IExtensionManagementServerService = (0, instantiation_1.createDecorator)('extensionManagementServerService');
    exports.IWorkbenchExtensionManagementService = (0, instantiation_1.refineServiceDecorator)(extensionManagement_1.IExtensionManagementService);
    var EnablementState;
    (function (EnablementState) {
        EnablementState[EnablementState["DisabledByTrustRequirement"] = 0] = "DisabledByTrustRequirement";
        EnablementState[EnablementState["DisabledByExtensionKind"] = 1] = "DisabledByExtensionKind";
        EnablementState[EnablementState["DisabledByEnvironment"] = 2] = "DisabledByEnvironment";
        EnablementState[EnablementState["DisabledByVirtualWorkspace"] = 3] = "DisabledByVirtualWorkspace";
        EnablementState[EnablementState["DisabledGlobally"] = 4] = "DisabledGlobally";
        EnablementState[EnablementState["DisabledWorkspace"] = 5] = "DisabledWorkspace";
        EnablementState[EnablementState["EnabledGlobally"] = 6] = "EnabledGlobally";
        EnablementState[EnablementState["EnabledWorkspace"] = 7] = "EnabledWorkspace";
    })(EnablementState = exports.EnablementState || (exports.EnablementState = {}));
    exports.IWorkbenchExtensionEnablementService = (0, instantiation_1.createDecorator)('extensionEnablementService');
    exports.IWebExtensionsScannerService = (0, instantiation_1.createDecorator)('IWebExtensionsScannerService');
});
//# sourceMappingURL=extensionManagement.js.map