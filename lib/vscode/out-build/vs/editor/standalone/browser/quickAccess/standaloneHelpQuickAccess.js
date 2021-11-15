/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/common/standaloneStrings", "vs/platform/quickinput/browser/helpQuickAccess"], function (require, exports, platform_1, quickAccess_1, standaloneStrings_1, helpQuickAccess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: helpQuickAccess_1.HelpQuickAccessProvider,
        prefix: '',
        helpEntries: [{ description: standaloneStrings_1.QuickHelpNLS.helpQuickAccessActionLabel, needsEditor: true }]
    });
});
//# sourceMappingURL=standaloneHelpQuickAccess.js.map