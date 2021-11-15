/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/externalTerminal/node/externalTerminal.contribution", "vs/base/common/path", "vs/workbench/contrib/externalTerminal/common/externalTerminal", "vs/platform/actions/common/actions", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/services/history/common/history", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/network", "vs/workbench/services/path/common/pathService", "vs/workbench/contrib/externalTerminal/node/externalTerminalService", "vs/platform/configuration/common/configurationRegistry", "vs/platform/instantiation/common/extensions", "vs/platform/registry/common/platform", "vs/base/common/platform", "vs/workbench/contrib/externalTerminal/node/externalTerminal"], function (require, exports, nls, paths, externalTerminal_1, actions_1, terminal_1, history_1, keybindingsRegistry_1, network_1, pathService_1, externalTerminalService_1, configurationRegistry_1, extensions_1, platform_1, platform_2, externalTerminal_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const OPEN_NATIVE_CONSOLE_COMMAND_ID = 'workbench.action.terminal.openNativeConsole';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 33 /* KEY_C */,
        when: terminal_1.KEYBINDING_CONTEXT_TERMINAL_NOT_FOCUSED,
        weight: 200 /* WorkbenchContrib */,
        handler: async (accessor) => {
            const historyService = accessor.get(history_1.IHistoryService);
            // Open external terminal in local workspaces
            const terminalService = accessor.get(externalTerminal_1.IExternalTerminalService);
            const root = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
            if (root) {
                terminalService.openTerminal(root.fsPath);
            }
            else {
                // Opens current file's folder, if no folder is open in editor
                const activeFile = historyService.getLastActiveFile(network_1.Schemas.file);
                if (activeFile) {
                    terminalService.openTerminal(paths.dirname(activeFile.fsPath));
                }
                else {
                    const pathService = accessor.get(pathService_1.IPathService);
                    const userHome = await pathService.userHome();
                    terminalService.openTerminal(userHome.fsPath);
                }
            }
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: OPEN_NATIVE_CONSOLE_COMMAND_ID,
            title: { value: nls.localize(0, null), original: 'Open New External Terminal' }
        }
    });
    if (platform_2.isWindows) {
        (0, extensions_1.registerSingleton)(externalTerminal_1.IExternalTerminalService, externalTerminalService_1.WindowsExternalTerminalService, true);
    }
    else if (platform_2.isMacintosh) {
        (0, extensions_1.registerSingleton)(externalTerminal_1.IExternalTerminalService, externalTerminalService_1.MacExternalTerminalService, true);
    }
    else if (platform_2.isLinux) {
        (0, extensions_1.registerSingleton)(externalTerminal_1.IExternalTerminalService, externalTerminalService_1.LinuxExternalTerminalService, true);
    }
    externalTerminalService_1.LinuxExternalTerminalService.getDefaultTerminalLinuxReady().then(defaultTerminalLinux => {
        let configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        configurationRegistry.registerConfiguration({
            id: 'externalTerminal',
            order: 100,
            title: nls.localize(1, null),
            type: 'object',
            properties: {
                'terminal.explorerKind': {
                    type: 'string',
                    enum: [
                        'integrated',
                        'external'
                    ],
                    enumDescriptions: [
                        nls.localize(2, null),
                        nls.localize(3, null)
                    ],
                    description: nls.localize(4, null),
                    default: 'integrated'
                },
                'terminal.external.windowsExec': {
                    type: 'string',
                    description: nls.localize(5, null),
                    default: externalTerminalService_1.WindowsExternalTerminalService.getDefaultTerminalWindows(),
                    scope: 1 /* APPLICATION */
                },
                'terminal.external.osxExec': {
                    type: 'string',
                    description: nls.localize(6, null),
                    default: externalTerminal_2.DEFAULT_TERMINAL_OSX,
                    scope: 1 /* APPLICATION */
                },
                'terminal.external.linuxExec': {
                    type: 'string',
                    description: nls.localize(7, null),
                    default: defaultTerminalLinux,
                    scope: 1 /* APPLICATION */
                }
            }
        });
    });
});
//# sourceMappingURL=externalTerminal.contribution.js.map