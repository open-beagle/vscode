/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedIcons", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gettingStartedCheckedCodicon = exports.gettingStartedUncheckedCodicon = void 0;
    exports.gettingStartedUncheckedCodicon = (0, iconRegistry_1.registerIcon)('getting-started-step-unchecked', codicons_1.Codicon.circleLargeOutline, (0, nls_1.localize)(0, null));
    exports.gettingStartedCheckedCodicon = (0, iconRegistry_1.registerIcon)('getting-started-step-checked', codicons_1.Codicon.passFilled, (0, nls_1.localize)(1, null));
});
//# sourceMappingURL=gettingStartedIcons.js.map