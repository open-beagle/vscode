/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/common/terminalMenu", "vs/platform/actions/common/actions", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls, actions_1, terminal_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setupTerminalMenu = void 0;
    function setupTerminalMenu() {
        // Manage
        const createGroup = '1_create';
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
            group: createGroup,
            command: {
                id: "workbench.action.terminal.new" /* NEW */,
                title: nls.localize(0, null)
            },
            order: 1
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
            group: createGroup,
            command: {
                id: "workbench.action.terminal.split" /* SPLIT */,
                title: nls.localize(1, null),
                precondition: contextkey_1.ContextKeyExpr.has('terminalIsOpen')
            },
            order: 2,
            when: terminal_1.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
        });
        // Run
        const runGroup = '2_run';
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
            group: runGroup,
            command: {
                id: "workbench.action.terminal.runActiveFile" /* RUN_ACTIVE_FILE */,
                title: nls.localize(2, null)
            },
            order: 3,
            when: terminal_1.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
            group: runGroup,
            command: {
                id: "workbench.action.terminal.runSelectedText" /* RUN_SELECTED_TEXT */,
                title: nls.localize(3, null)
            },
            order: 4,
            when: terminal_1.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED
        });
    }
    exports.setupTerminalMenu = setupTerminalMenu;
});
//# sourceMappingURL=terminalMenu.js.map