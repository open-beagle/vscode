/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/editorContextKeys", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/navigation/arrow", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/registry/common/platform", "vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, editorContextKeys_1, nls_1, actions_1, configurationRegistry_1, contextkey_1, contextkeys_1, platform_1, coreActions_1, notebookBrowser_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const NOTEBOOK_FOCUS_TOP = 'notebook.focusTop';
    const NOTEBOOK_FOCUS_BOTTOM = 'notebook.focusBottom';
    const NOTEBOOK_FOCUS_PREVIOUS_EDITOR = 'notebook.focusPreviousEditor';
    const NOTEBOOK_FOCUS_NEXT_EDITOR = 'notebook.focusNextEditor';
    const FOCUS_IN_OUTPUT_COMMAND_ID = 'notebook.cell.focusInOutput';
    const FOCUS_OUT_OUTPUT_COMMAND_ID = 'notebook.cell.focusOutOutput';
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_NEXT_EDITOR,
                title: (0, nls_1.localize)(0, null),
                keybinding: [
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('top'), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('none'), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true)),
                        primary: 18 /* DownArrow */,
                        weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                    },
                    {
                        when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_OUTPUT_FOCUSED),
                        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
                        mac: { primary: 256 /* WinCtrl */ | 2048 /* CtrlCmd */ | 18 /* DownArrow */, },
                        weight: 200 /* WorkbenchContrib */
                    }
                ]
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            const idx = editor.viewModel.getCellIndex(activeCell);
            if (typeof idx !== 'number') {
                return;
            }
            const newCell = editor.viewModel.cellAt(idx + 1);
            if (!newCell) {
                return;
            }
            const newFocusMode = newCell.cellKind === notebookCommon_1.CellKind.Markdown && newCell.getEditState() === notebookBrowser_1.CellEditState.Preview ? 'container' : 'editor';
            editor.focusNotebookCell(newCell, newFocusMode);
            editor.cursorNavigationMode = true;
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_PREVIOUS_EDITOR,
                title: (0, nls_1.localize)(1, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.has(contextkeys_1.InputFocusedContextKey), editorContextKeys_1.EditorContextKeys.editorTextFocus, notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('bottom'), notebookCommon_1.NOTEBOOK_EDITOR_CURSOR_BOUNDARY.notEqualsTo('none'), contextkey_1.ContextKeyExpr.equals('config.notebook.navigation.allowNavigateToSurroundingCells', true)),
                    primary: 16 /* UpArrow */,
                    weight: coreActions_1.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            const idx = editor.viewModel.getCellIndex(activeCell);
            if (typeof idx !== 'number') {
                return;
            }
            if (idx < 1) {
                // we don't do loop
                return;
            }
            const newCell = editor.viewModel.cellAt(idx - 1);
            if (!newCell) {
                return;
            }
            const newFocusMode = newCell.cellKind === notebookCommon_1.CellKind.Markdown && newCell.getEditState() === notebookBrowser_1.CellEditState.Preview ? 'container' : 'editor';
            editor.focusNotebookCell(newCell, newFocusMode);
            editor.cursorNavigationMode = true;
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_TOP,
                title: (0, nls_1.localize)(2, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* CtrlCmd */ | 14 /* Home */,
                    mac: { primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ },
                    weight: 200 /* WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            if (!editor.viewModel || !editor.viewModel.length) {
                return;
            }
            const firstCell = editor.viewModel.cellAt(0);
            if (firstCell) {
                editor.focusNotebookCell(firstCell, 'container');
            }
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookAction {
        constructor() {
            super({
                id: NOTEBOOK_FOCUS_BOTTOM,
                title: (0, nls_1.localize)(3, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 2048 /* CtrlCmd */ | 13 /* End */,
                    mac: { primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */ },
                    weight: 200 /* WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            if (!editor.viewModel || !editor.viewModel.length) {
                return;
            }
            const firstCell = editor.viewModel.cellAt(editor.viewModel.length - 1);
            if (firstCell) {
                editor.focusNotebookCell(firstCell, 'container');
            }
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: FOCUS_IN_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)(4, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_CELL_HAS_OUTPUTS),
                    primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
                    mac: { primary: 256 /* WinCtrl */ | 2048 /* CtrlCmd */ | 18 /* DownArrow */, },
                    weight: 200 /* WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            editor.focusNotebookCell(activeCell, 'output');
        }
    });
    (0, actions_1.registerAction2)(class extends coreActions_1.NotebookCellAction {
        constructor() {
            super({
                id: FOCUS_OUT_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)(5, null),
                keybinding: {
                    when: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED,
                    primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
                    mac: { primary: 256 /* WinCtrl */ | 2048 /* CtrlCmd */ | 16 /* UpArrow */, },
                    weight: 200 /* WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            const activeCell = context.cell;
            editor.focusNotebookCell(activeCell, 'editor');
        }
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.navigation.allowNavigateToSurroundingCells': {
                type: 'boolean',
                default: true,
                markdownDescription: (0, nls_1.localize)(6, null)
            }
        }
    });
});
//# sourceMappingURL=arrow.js.map