/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "./terminalExtensionPoints", "vs/platform/instantiation/common/extensions"], function (require, exports, terminalExtensionPoints_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, extensions_1.registerSingleton)(terminalExtensionPoints_1.ITerminalContributionService, terminalExtensionPoints_1.TerminalContributionService, true);
});
//# sourceMappingURL=terminalExtensionPoints.contribution.js.map