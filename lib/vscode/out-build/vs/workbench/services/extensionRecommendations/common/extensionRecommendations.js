/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionIgnoredRecommendationsService = exports.IExtensionRecommendationsService = exports.ExtensionRecommendationReason = void 0;
    var ExtensionRecommendationReason;
    (function (ExtensionRecommendationReason) {
        ExtensionRecommendationReason[ExtensionRecommendationReason["Workspace"] = 0] = "Workspace";
        ExtensionRecommendationReason[ExtensionRecommendationReason["File"] = 1] = "File";
        ExtensionRecommendationReason[ExtensionRecommendationReason["Executable"] = 2] = "Executable";
        ExtensionRecommendationReason[ExtensionRecommendationReason["WorkspaceConfig"] = 3] = "WorkspaceConfig";
        ExtensionRecommendationReason[ExtensionRecommendationReason["DynamicWorkspace"] = 4] = "DynamicWorkspace";
        ExtensionRecommendationReason[ExtensionRecommendationReason["Experimental"] = 5] = "Experimental";
        ExtensionRecommendationReason[ExtensionRecommendationReason["Application"] = 6] = "Application";
    })(ExtensionRecommendationReason = exports.ExtensionRecommendationReason || (exports.ExtensionRecommendationReason = {}));
    exports.IExtensionRecommendationsService = (0, instantiation_1.createDecorator)('extensionRecommendationsService');
    exports.IExtensionIgnoredRecommendationsService = (0, instantiation_1.createDecorator)('IExtensionIgnoredRecommendationsService');
});
//# sourceMappingURL=extensionRecommendations.js.map