/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/quickaccess/browser/quickAccess.contribution", "vs/platform/quickinput/common/quickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/browser/helpQuickAccess", "vs/workbench/contrib/quickaccess/browser/viewQuickAccess", "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/quickaccess", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/editorContextKeys"], function (require, exports, nls_1, quickAccess_1, platform_1, helpQuickAccess_1, viewQuickAccess_1, commandsQuickAccess_1, actions_1, contextkey_1, quickaccess_1, keybindingsRegistry_1, editorContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Quick Access Proviers
    const quickAccessRegistry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: helpQuickAccess_1.HelpQuickAccessProvider,
        prefix: helpQuickAccess_1.HelpQuickAccessProvider.PREFIX,
        placeholder: (0, nls_1.localize)(0, null, helpQuickAccess_1.HelpQuickAccessProvider.PREFIX),
        helpEntries: [{ description: (0, nls_1.localize)(1, null), needsEditor: false }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: viewQuickAccess_1.ViewQuickAccessProvider,
        prefix: viewQuickAccess_1.ViewQuickAccessProvider.PREFIX,
        contextKey: 'inViewsPicker',
        placeholder: (0, nls_1.localize)(2, null),
        helpEntries: [{ description: (0, nls_1.localize)(3, null), needsEditor: false }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: commandsQuickAccess_1.CommandsQuickAccessProvider,
        prefix: commandsQuickAccess_1.CommandsQuickAccessProvider.PREFIX,
        contextKey: 'inCommandsPicker',
        placeholder: (0, nls_1.localize)(4, null),
        helpEntries: [{ description: (0, nls_1.localize)(5, null), needsEditor: false }]
    });
    //#endregion
    //#region Menu contributions
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '1_open',
        command: {
            id: commandsQuickAccess_1.ShowAllCommandsAction.ID,
            title: (0, nls_1.localize)(6, null)
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '1_open',
        command: {
            id: viewQuickAccess_1.OpenViewPickerAction.ID,
            title: (0, nls_1.localize)(7, null)
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '4_symbol_nav',
        command: {
            id: 'workbench.action.gotoSymbol',
            title: (0, nls_1.localize)(8, null)
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '5_infile_nav',
        command: {
            id: 'workbench.action.gotoLine',
            title: (0, nls_1.localize)(9, null)
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
        group: '1_command',
        command: {
            id: commandsQuickAccess_1.ShowAllCommandsAction.ID,
            title: (0, nls_1.localize)(10, null)
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        group: 'z_commands',
        when: editorContextKeys_1.EditorContextKeys.editorSimpleInput.toNegated(),
        command: {
            id: commandsQuickAccess_1.ShowAllCommandsAction.ID,
            title: (0, nls_1.localize)(11, null),
        },
        order: 1
    });
    //#endregion
    //#region Workbench actions and commands
    (0, actions_1.registerAction2)(commandsQuickAccess_1.ClearCommandHistoryAction);
    (0, actions_1.registerAction2)(commandsQuickAccess_1.ShowAllCommandsAction);
    (0, actions_1.registerAction2)(viewQuickAccess_1.OpenViewPickerAction);
    (0, actions_1.registerAction2)(viewQuickAccess_1.QuickAccessViewPickerAction);
    const inViewsPickerContextKey = 'inViewsPicker';
    const inViewsPickerContext = contextkey_1.ContextKeyExpr.and(quickaccess_1.inQuickPickContext, contextkey_1.ContextKeyExpr.has(inViewsPickerContextKey));
    const viewPickerKeybinding = viewQuickAccess_1.QuickAccessViewPickerAction.KEYBINDING;
    const quickAccessNavigateNextInViewPickerId = 'workbench.action.quickOpenNavigateNextInViewPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInViewPickerId,
        weight: 200 /* WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInViewPickerId, true),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary,
        linux: viewPickerKeybinding.linux,
        mac: viewPickerKeybinding.mac
    });
    const quickAccessNavigatePreviousInViewPickerId = 'workbench.action.quickOpenNavigatePreviousInViewPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInViewPickerId,
        weight: 200 /* WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInViewPickerId, false),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary | 1024 /* Shift */,
        linux: viewPickerKeybinding.linux,
        mac: {
            primary: viewPickerKeybinding.mac.primary | 1024 /* Shift */
        }
    });
});
//#endregion
//# sourceMappingURL=quickAccess.contribution.js.map