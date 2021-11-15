/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/ipc/electron-sandbox/services", "vs/platform/registry/common/platform", "vs/platform/terminal/common/terminal", "vs/platform/terminal/electron-sandbox/terminal", "vs/workbench/common/contributions", "vs/workbench/contrib/terminal/electron-sandbox/localTerminalService", "vs/workbench/contrib/terminal/electron-sandbox/terminalNativeContribution"], function (require, exports, extensions_1, services_1, platform_1, terminal_1, terminal_2, contributions_1, localTerminalService_1, terminalNativeContribution_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerSharedProcessRemoteService)(terminal_2.ILocalPtyService, terminal_1.TerminalIpcChannels.LocalPty, { supportsDelayedInstantiation: true });
    (0, extensions_1.registerSingleton)(terminal_1.ILocalTerminalService, localTerminalService_1.LocalTerminalService, true);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(terminalNativeContribution_1.TerminalNativeContribution, 2 /* Ready */);
});
//# sourceMappingURL=terminal.contribution.js.map