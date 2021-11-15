/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/electron-browser/terminalInstanceService", "vs/workbench/contrib/terminal/electron-browser/terminalNativeContribution", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/contrib/terminal/common/terminalConfiguration", "vs/base/node/shell", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/workbench/contrib/terminal/electron-sandbox/terminalProfileResolverService", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, contributions_1, extensions_1, terminal_1, terminalInstanceService_1, terminalNativeContribution_1, platform_1, configurationRegistry_1, terminalConfiguration_1, shell_1, globals_1, terminalProfileResolverService_1, terminal_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file contains additional desktop-only contributions on top of those in browser/
    // Register services
    (0, extensions_1.registerSingleton)(terminal_1.ITerminalInstanceService, terminalInstanceService_1.TerminalInstanceService, true);
    (0, extensions_1.registerSingleton)(terminal_2.ITerminalProfileResolverService, terminalProfileResolverService_1.ElectronTerminalProfileResolverService, true);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(terminalNativeContribution_1.TerminalNativeContribution, 2 /* Ready */);
    // Register configurations
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const systemShell = async (os) => (0, shell_1.getSystemShell)(os, await globals_1.process.shellEnv());
    (0, terminalConfiguration_1.getTerminalShellConfiguration)(systemShell).then(config => configurationRegistry.registerConfiguration(config));
});
//# sourceMappingURL=terminal.contribution.js.map