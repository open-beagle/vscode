/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/commands/common/commands", "vs/base/common/platform"], function (require, exports, commands_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (platform_1.isWeb) {
        commands_1.CommandsRegistry.registerCommand('_workbench.fetchJSON', async function (accessor, url, method) {
            const result = await fetch(url, { method, headers: { Accept: 'application/json' } });
            if (result.ok) {
                return result.json();
            }
            else {
                throw new Error(result.statusText);
            }
        });
    }
});
//# sourceMappingURL=apiCommands.js.map