/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminal.contribution", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/registry/common/platform", "vs/workbench/browser/panel", "vs/workbench/browser/quickaccess", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalView", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/terminal/browser/terminalCommands", "vs/workbench/contrib/terminal/common/terminalMenu", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/contrib/terminal/browser/terminalService", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/workbench/contrib/terminal/common/terminalConfiguration", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/workbench/contrib/terminal/browser/remoteTerminalService", "vs/base/browser/browser", "vs/platform/terminal/common/terminal", "vs/base/common/platform", "vs/css!./media/scrollbar", "vs/css!./media/terminal", "vs/css!./media/widgets", "vs/css!./media/xterm"], function (require, exports, nls, commands_1, contextkey_1, keybindingsRegistry_1, platform_1, panel, quickaccess_1, views_1, terminalActions_1, terminalView_1, terminal_1, terminalColorRegistry_1, terminalCommands_1, terminalMenu_1, configurationRegistry_1, terminalService_1, extensions_1, terminal_2, descriptors_1, viewPaneContainer_1, quickAccess_1, terminalQuickAccess_1, terminalConfiguration_1, accessibility_1, terminalIcons_1, remoteTerminalService_1, browser_1, terminal_3, platform_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register services
    (0, extensions_1.registerSingleton)(terminal_2.ITerminalService, terminalService_1.TerminalService, true);
    (0, extensions_1.registerSingleton)(terminal_2.IRemoteTerminalService, remoteTerminalService_1.RemoteTerminalService);
    // Register quick accesses
    const quickAccessRegistry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
    const inTerminalsPicker = 'inTerminalPicker';
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: terminalQuickAccess_1.TerminalQuickAccessProvider,
        prefix: terminalQuickAccess_1.TerminalQuickAccessProvider.PREFIX,
        contextKey: inTerminalsPicker,
        placeholder: nls.localize(0, null),
        helpEntries: [{ description: nls.localize(1, null), needsEditor: false }]
    });
    const quickAccessNavigateNextInTerminalPickerId = 'workbench.action.quickOpenNavigateNextInTerminalPicker';
    commands_1.CommandsRegistry.registerCommand({ id: quickAccessNavigateNextInTerminalPickerId, handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInTerminalPickerId, true) });
    const quickAccessNavigatePreviousInTerminalPickerId = 'workbench.action.quickOpenNavigatePreviousInTerminalPicker';
    commands_1.CommandsRegistry.registerCommand({ id: quickAccessNavigatePreviousInTerminalPickerId, handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInTerminalPickerId, false) });
    // Register configurations
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration(terminalConfiguration_1.terminalConfiguration);
    // Register views
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: terminal_1.TERMINAL_VIEW_ID,
        title: nls.localize(2, null),
        icon: terminalIcons_1.terminalViewIcon,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [terminal_1.TERMINAL_VIEW_ID, { mergeViewWithContainerWhenSingleView: true, donotShowContainerTitleWhenMergedWithContainer: true }]),
        storageId: terminal_1.TERMINAL_VIEW_ID,
        hideIfEmpty: true,
        order: 3,
    }, 1 /* Panel */, { donotRegisterOpenCommand: true });
    platform_1.Registry.as(panel.Extensions.Panels).setDefaultPanelId(terminal_1.TERMINAL_VIEW_ID);
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: terminal_1.TERMINAL_VIEW_ID,
            name: nls.localize(3, null),
            containerIcon: terminalIcons_1.terminalViewIcon,
            canToggleVisibility: false,
            canMoveView: true,
            ctorDescriptor: new descriptors_1.SyncDescriptor(terminalView_1.TerminalViewPane),
            openCommandActionDescriptor: {
                id: "workbench.action.terminal.toggleTerminal" /* TOGGLE */,
                mnemonicTitle: nls.localize(4, null),
                keybindings: {
                    primary: 2048 /* CtrlCmd */ | 86 /* US_BACKTICK */,
                    mac: { primary: 256 /* WinCtrl */ | 86 /* US_BACKTICK */ }
                },
                order: 3
            }
        }], VIEW_CONTAINER);
    // Register actions
    (0, terminalActions_1.registerTerminalActions)();
    function registerSendSequenceKeybinding(text, rule) {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: "workbench.action.terminal.sendSequence" /* SEND_SEQUENCE */,
            weight: 200 /* WorkbenchContrib */,
            when: rule.when || terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS,
            primary: rule.primary,
            mac: rule.mac,
            linux: rule.linux,
            win: rule.win,
            handler: terminalActions_1.terminalSendSequenceCommand,
            args: { text }
        });
    }
    // The text representation of `^<letter>` is `'A'.charCodeAt(0) + 1`.
    const CTRL_LETTER_OFFSET = 64;
    // An extra Windows-only ctrl+v keybinding is used for pwsh that sends ctrl+v directly to the
    // shell, this gets handled by PSReadLine which properly handles multi-line pastes. This is
    // disabled in accessibility mode as PowerShell does not run PSReadLine when it detects a screen
    // reader. This works even when clipboard.readText is not supported.
    if (platform_2.isWindows) {
        registerSendSequenceKeybinding(String.fromCharCode('V'.charCodeAt(0) - CTRL_LETTER_OFFSET), {
            when: contextkey_1.ContextKeyExpr.and(terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS, contextkey_1.ContextKeyExpr.equals(terminal_1.KEYBINDING_CONTEXT_TERMINAL_SHELL_TYPE_KEY, terminal_3.WindowsShellType.PowerShell), accessibility_1.CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
            primary: 2048 /* CtrlCmd */ | 52 /* KEY_V */
        });
    }
    // send ctrl+c to the iPad when the terminal is focused and ctrl+c is pressed to kill the process (work around for #114009)
    if (browser_1.isIPad) {
        registerSendSequenceKeybinding(String.fromCharCode('C'.charCodeAt(0) - CTRL_LETTER_OFFSET), {
            when: contextkey_1.ContextKeyExpr.and(terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS),
            primary: 256 /* WinCtrl */ | 33 /* KEY_C */
        });
    }
    // Delete word left: ctrl+w
    registerSendSequenceKeybinding(String.fromCharCode('W'.charCodeAt(0) - CTRL_LETTER_OFFSET), {
        primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
        mac: { primary: 512 /* Alt */ | 1 /* Backspace */ }
    });
    if (platform_2.isWindows) {
        // Delete word left: ctrl+h
        // Windows cmd.exe requires ^H to delete full word left
        registerSendSequenceKeybinding(String.fromCharCode('H'.charCodeAt(0) - CTRL_LETTER_OFFSET), {
            when: contextkey_1.ContextKeyExpr.and(terminal_1.KEYBINDING_CONTEXT_TERMINAL_FOCUS, contextkey_1.ContextKeyExpr.equals(terminal_1.KEYBINDING_CONTEXT_TERMINAL_SHELL_TYPE_KEY, terminal_3.WindowsShellType.CommandPrompt)),
            primary: 2048 /* CtrlCmd */ | 1 /* Backspace */,
        });
    }
    // Delete word right: alt+d
    registerSendSequenceKeybinding('\x1bd', {
        primary: 2048 /* CtrlCmd */ | 20 /* Delete */,
        mac: { primary: 512 /* Alt */ | 20 /* Delete */ }
    });
    // Delete to line start: ctrl+u
    registerSendSequenceKeybinding('\u0015', {
        mac: { primary: 2048 /* CtrlCmd */ | 1 /* Backspace */ }
    });
    // Move to line start: ctrl+A
    registerSendSequenceKeybinding(String.fromCharCode('A'.charCodeAt(0) - 64), {
        mac: { primary: 2048 /* CtrlCmd */ | 15 /* LeftArrow */ }
    });
    // Move to line end: ctrl+E
    registerSendSequenceKeybinding(String.fromCharCode('E'.charCodeAt(0) - 64), {
        mac: { primary: 2048 /* CtrlCmd */ | 17 /* RightArrow */ }
    });
    (0, terminalCommands_1.setupTerminalCommands)();
    (0, terminalMenu_1.setupTerminalMenu)();
    (0, terminalColorRegistry_1.registerColors)();
});
//# sourceMappingURL=terminal.contribution.js.map