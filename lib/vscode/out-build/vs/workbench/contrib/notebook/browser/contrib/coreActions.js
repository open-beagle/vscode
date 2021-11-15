/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/glob", "vs/base/common/keyCodes", "vs/base/common/uri", "vs/editor/common/editorContextKeys", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/coreActions", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/browser/notebookEditorService", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/base/common/iterator"], function (require, exports, glob, keyCodes_1, uri_1, editorContextKeys_1, getIconClasses_1, modelService_1, modeService_1, nls_1, actions_1, commands_1, contextkey_1, contextkeys_1, quickInput_1, notebookBrowser_1, notebookCommon_1, notebookService_1, editorGroupsService_1, editorService_1, icons, notebookEditorInput_1, notebookEditorService_1, telemetry_1, notebookKernelService_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runDeleteAction = exports.changeCellToKind = exports.DeleteCellAction = exports.NotebookCellAction = exports.NotebookAction = exports.CellOverflowToolbarGroups = exports.CellToolbarOrder = exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = exports.CELL_TITLE_OUTPUT_GROUP_ID = exports.CELL_TITLE_CELL_GROUP_ID = exports.NOTEBOOK_ACTIONS_CATEGORY = void 0;
    // Notebook Commands
    const EXECUTE_NOTEBOOK_COMMAND_ID = 'notebook.execute';
    const CANCEL_NOTEBOOK_COMMAND_ID = 'notebook.cancelExecution';
    const CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID = 'notebook.clearAllCellsOutputs';
    const RENDER_ALL_MARKDOWN_CELLS = 'notebook.renderAllMarkdownCells';
    // Cell Commands
    const INSERT_CODE_CELL_ABOVE_COMMAND_ID = 'notebook.cell.insertCodeCellAbove';
    const INSERT_CODE_CELL_BELOW_COMMAND_ID = 'notebook.cell.insertCodeCellBelow';
    const INSERT_CODE_CELL_AT_TOP_COMMAND_ID = 'notebook.cell.insertCodeCellAtTop';
    const INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID = 'notebook.cell.insertMarkdownCellAbove';
    const INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID = 'notebook.cell.insertMarkdownCellBelow';
    const INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID = 'notebook.cell.insertMarkdownCellAtTop';
    const CHANGE_CELL_TO_CODE_COMMAND_ID = 'notebook.cell.changeToCode';
    const CHANGE_CELL_TO_MARKDOWN_COMMAND_ID = 'notebook.cell.changeToMarkdown';
    const EDIT_CELL_COMMAND_ID = 'notebook.cell.edit';
    const DELETE_CELL_COMMAND_ID = 'notebook.cell.delete';
    const CANCEL_CELL_COMMAND_ID = 'notebook.cell.cancelExecution';
    const EXECUTE_CELL_SELECT_BELOW = 'notebook.cell.executeAndSelectBelow';
    const EXECUTE_CELL_INSERT_BELOW = 'notebook.cell.executeAndInsertBelow';
    const CLEAR_CELL_OUTPUTS_COMMAND_ID = 'notebook.cell.clearOutputs';
    const CENTER_ACTIVE_CELL = 'notebook.centerActiveCell';
    const COLLAPSE_CELL_INPUT_COMMAND_ID = 'notebook.cell.collapseCellInput';
    const COLLAPSE_CELL_OUTPUT_COMMAND_ID = 'notebook.cell.collapseCellOutput';
    const EXPAND_CELL_OUTPUT_COMMAND_ID = 'notebook.cell.expandCellOutput';
    exports.NOTEBOOK_ACTIONS_CATEGORY = { value: (0, nls_1.localize)(0, null), original: 'Notebook' };
    exports.CELL_TITLE_CELL_GROUP_ID = 'inline/cell';
    exports.CELL_TITLE_OUTPUT_GROUP_ID = 'inline/output';
    exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT = 100 /* EditorContrib */; // smaller than Suggest Widget, etc
    var CellToolbarOrder;
    (function (CellToolbarOrder) {
        CellToolbarOrder[CellToolbarOrder["EditCell"] = 0] = "EditCell";
        CellToolbarOrder[CellToolbarOrder["SplitCell"] = 1] = "SplitCell";
        CellToolbarOrder[CellToolbarOrder["SaveCell"] = 2] = "SaveCell";
        CellToolbarOrder[CellToolbarOrder["ClearCellOutput"] = 3] = "ClearCellOutput";
    })(CellToolbarOrder = exports.CellToolbarOrder || (exports.CellToolbarOrder = {}));
    var CellOverflowToolbarGroups;
    (function (CellOverflowToolbarGroups) {
        CellOverflowToolbarGroups["Copy"] = "1_copy";
        CellOverflowToolbarGroups["Insert"] = "2_insert";
        CellOverflowToolbarGroups["Edit"] = "3_edit";
        CellOverflowToolbarGroups["Collapse"] = "4_collapse";
    })(CellOverflowToolbarGroups = exports.CellOverflowToolbarGroups || (exports.CellOverflowToolbarGroups = {}));
    function getContextFromActiveEditor(editorService) {
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!editor || !editor.hasModel()) {
            return;
        }
        const activeCell = editor.getActiveCell();
        const selectedCells = editor.getSelectionViewModels();
        return {
            cell: activeCell,
            selectedCells,
            notebookEditor: editor
        };
    }
    function getWidgetFromUri(accessor, uri) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const notebookEditorService = accessor.get(notebookEditorService_1.INotebookEditorService);
        const editorId = editorService.getEditors(1 /* SEQUENTIAL */).find(editorId => { var _a; return editorId.editor instanceof notebookEditorInput_1.NotebookEditorInput && ((_a = editorId.editor.resource) === null || _a === void 0 ? void 0 : _a.toString()) === uri.toString(); });
        if (!editorId) {
            return undefined;
        }
        const notebookEditorInput = editorId.editor;
        if (!notebookEditorInput.resource) {
            return undefined;
        }
        const widget = notebookEditorService.listNotebookEditors().find(widget => { var _a, _b; return ((_a = widget.textModel) === null || _a === void 0 ? void 0 : _a.viewType) === notebookEditorInput.viewType && ((_b = widget.textModel) === null || _b === void 0 ? void 0 : _b.uri.toString()) === notebookEditorInput.resource.toString(); });
        if (widget && widget.hasModel()) {
            return widget;
        }
        return undefined;
    }
    function getContextFromUri(accessor, context) {
        const uri = uri_1.URI.revive(context);
        if (uri) {
            const widget = getWidgetFromUri(accessor, uri);
            if (widget) {
                return {
                    notebookEditor: widget,
                };
            }
        }
        return undefined;
    }
    class NotebookAction extends actions_1.Action2 {
        constructor(desc) {
            if (desc.f1 !== false) {
                desc.f1 = false;
                const f1Menu = {
                    id: actions_1.MenuId.CommandPalette,
                    when: notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR
                };
                if (!desc.menu) {
                    desc.menu = [];
                }
                else if (!Array.isArray(desc.menu)) {
                    desc.menu = [desc.menu];
                }
                desc.menu = [
                    ...desc.menu,
                    f1Menu
                ];
            }
            desc.category = exports.NOTEBOOK_ACTIONS_CATEGORY;
            super(desc);
        }
        async run(accessor, context) {
            const isFromUI = !!context;
            const from = isFromUI ? (this.isNotebookActionContext(context) ? 'notebookToolbar' : 'editorToolbar') : undefined;
            if (!this.isNotebookActionContext(context)) {
                context = this.getEditorContextFromArgsOrActive(accessor, context);
                if (!context) {
                    return;
                }
            }
            if (from !== undefined) {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: from });
            }
            this.runWithContext(accessor, context);
        }
        isNotebookActionContext(context) {
            return !!context && !!context.notebookEditor;
        }
        getEditorContextFromArgsOrActive(accessor, context) {
            return getContextFromActiveEditor(accessor.get(editorService_1.IEditorService));
        }
    }
    exports.NotebookAction = NotebookAction;
    class NotebookCellAction extends NotebookAction {
        isCellActionContext(context) {
            return !!context && !!context.notebookEditor && !!context.cell;
        }
        getCellContextFromArgs(accessor, context, ...additionalArgs) {
            return undefined;
        }
        async run(accessor, context, ...additionalArgs) {
            if (this.isCellActionContext(context)) {
                const telemetryService = accessor.get(telemetry_1.ITelemetryService);
                telemetryService.publicLog2('workbenchActionExecuted', { id: this.desc.id, from: 'cellToolbar' });
                return this.runWithContext(accessor, context);
            }
            const contextFromArgs = this.getCellContextFromArgs(accessor, context, ...additionalArgs);
            if (contextFromArgs) {
                return this.runWithContext(accessor, contextFromArgs);
            }
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (this.isCellActionContext(activeEditorContext)) {
                return this.runWithContext(accessor, activeEditorContext);
            }
        }
    }
    exports.NotebookCellAction = NotebookCellAction;
    const executeCellCondition = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals(notebookBrowser_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'idle'), contextkey_1.ContextKeyExpr.equals(notebookBrowser_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'succeeded'), contextkey_1.ContextKeyExpr.equals(notebookBrowser_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'failed')), contextkey_1.ContextKeyExpr.greater(notebookBrowser_1.NOTEBOOK_KERNEL_COUNT.key, 0)), notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('markdown'));
    const executeNotebookCondition = contextkey_1.ContextKeyExpr.greater(notebookBrowser_1.NOTEBOOK_KERNEL_COUNT.key, 0);
    (0, actions_1.registerAction2)(class ExecuteCell extends NotebookCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.EXECUTE_CELL_COMMAND_ID,
                precondition: executeCellCondition,
                title: (0, nls_1.localize)(1, null),
                keybinding: {
                    when: notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED,
                    primary: 256 /* WinCtrl */ | 3 /* Enter */,
                    win: {
                        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */
                    },
                    weight: exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellExecute,
                    when: executeCellCondition,
                    group: 'inline'
                },
                description: {
                    description: (0, nls_1.localize)(2, null),
                    args: [
                        {
                            name: 'range',
                            description: 'The cell range',
                            schema: {
                                'type': 'object',
                                'required': ['start', 'end'],
                                'properties': {
                                    'start': {
                                        'type': 'number'
                                    },
                                    'end': {
                                        'type': 'number'
                                    }
                                }
                            }
                        },
                        {
                            name: 'uri',
                            description: 'The document uri',
                            constraint: uri_1.URI
                        }
                    ]
                },
                icon: icons.executeIcon
            });
        }
        getCellContextFromArgs(accessor, context, ...additionalArgs) {
            if (!context) {
                return;
            }
            if (typeof context.start !== 'number' || typeof context.end !== 'number' || context.start >= context.end) {
                throw new Error(`The first argument '${context}' is not a valid CellRange`);
            }
            if (additionalArgs.length && additionalArgs[0]) {
                const uri = uri_1.URI.revive(additionalArgs[0]);
                if (!uri) {
                    throw new Error(`The second argument '${uri}' is not a valid Uri`);
                }
                const widget = getWidgetFromUri(accessor, uri);
                if (widget) {
                    return {
                        notebookEditor: widget,
                        cell: widget.viewModel.cellAt(context.start)
                    };
                }
                else {
                    throw new Error(`There is no editor opened for resource ${uri}`);
                }
            }
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (!activeEditorContext || !activeEditorContext.notebookEditor.viewModel || context.start >= activeEditorContext.notebookEditor.viewModel.length) {
                return;
            }
            // TODO@rebornix, support multiple cells
            return {
                notebookEditor: activeEditorContext.notebookEditor,
                cell: activeEditorContext.notebookEditor.viewModel.cellAt(context.start)
            };
        }
        async runWithContext(accessor, context) {
            return runCell(accessor, context);
        }
    });
    const cellCancelCondition = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.equals(notebookBrowser_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'executing'), contextkey_1.ContextKeyExpr.equals(notebookBrowser_1.NOTEBOOK_CELL_EXECUTION_STATE.key, 'pending'));
    (0, actions_1.registerAction2)(class CancelExecuteCell extends NotebookCellAction {
        constructor() {
            super({
                id: CANCEL_CELL_COMMAND_ID,
                precondition: cellCancelCondition,
                title: (0, nls_1.localize)(3, null),
                icon: icons.stopIcon,
                menu: {
                    id: actions_1.MenuId.NotebookCellExecute,
                    when: cellCancelCondition,
                    group: 'inline'
                },
                description: {
                    description: (0, nls_1.localize)(4, null),
                    args: [
                        {
                            name: 'range',
                            description: 'The cell range',
                            schema: {
                                'type': 'object',
                                'required': ['start', 'end'],
                                'properties': {
                                    'start': {
                                        'type': 'number'
                                    },
                                    'end': {
                                        'type': 'number'
                                    }
                                }
                            }
                        },
                        {
                            name: 'uri',
                            description: 'The document uri',
                            constraint: uri_1.URI
                        }
                    ]
                },
            });
        }
        getCellContextFromArgs(accessor, context, ...additionalArgs) {
            if (!context || typeof context.start !== 'number' || typeof context.end !== 'number' || context.start >= context.end) {
                return;
            }
            if (additionalArgs.length && additionalArgs[0]) {
                const uri = uri_1.URI.revive(additionalArgs[0]);
                if (uri) {
                    const widget = getWidgetFromUri(accessor, uri);
                    if (widget) {
                        return {
                            notebookEditor: widget,
                            cell: widget.viewModel.cellAt(context.start)
                        };
                    }
                }
            }
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (!activeEditorContext || !activeEditorContext.notebookEditor.viewModel || context.start >= activeEditorContext.notebookEditor.viewModel.length) {
                return;
            }
            // TODO@rebornix, support multiple cells
            return {
                notebookEditor: activeEditorContext.notebookEditor,
                cell: activeEditorContext.notebookEditor.viewModel.cellAt(context.start)
            };
        }
        async runWithContext(accessor, context) {
            return context.notebookEditor.cancelNotebookCells(iterator_1.Iterable.single(context.cell));
        }
    });
    let DeleteCellAction = class DeleteCellAction extends actions_1.MenuItemAction {
        constructor(contextKeyService, commandService) {
            super({
                id: DELETE_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(5, null),
                icon: icons.deleteCellIcon,
                precondition: notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
            }, undefined, { shouldForwardArgs: true }, contextKeyService, commandService);
        }
    };
    DeleteCellAction = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, commands_1.ICommandService)
    ], DeleteCellAction);
    exports.DeleteCellAction = DeleteCellAction;
    (0, actions_1.registerAction2)(class ExecuteCellSelectBelow extends NotebookCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_SELECT_BELOW,
                precondition: executeCellCondition,
                title: (0, nls_1.localize)(6, null),
                keybinding: {
                    when: notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED,
                    primary: 1024 /* Shift */ | 3 /* Enter */,
                    weight: exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const idx = context.notebookEditor.viewModel.getCellIndex(context.cell);
            if (typeof idx !== 'number') {
                return;
            }
            const executionP = runCell(accessor, context);
            // Try to select below, fall back on inserting
            const nextCell = context.notebookEditor.viewModel.cellAt(idx + 1);
            if (nextCell) {
                context.notebookEditor.focusNotebookCell(nextCell, 'container');
            }
            else {
                const newCell = context.notebookEditor.insertNotebookCell(context.cell, notebookCommon_1.CellKind.Code, 'below');
                if (newCell) {
                    context.notebookEditor.focusNotebookCell(newCell, 'editor');
                }
            }
            return executionP;
        }
    });
    (0, actions_1.registerAction2)(class ExecuteCellInsertBelow extends NotebookCellAction {
        constructor() {
            super({
                id: EXECUTE_CELL_INSERT_BELOW,
                precondition: executeCellCondition,
                title: (0, nls_1.localize)(7, null),
                keybinding: {
                    when: notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED,
                    primary: 512 /* Alt */ | 3 /* Enter */,
                    weight: exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
                },
            });
        }
        async runWithContext(accessor, context) {
            const newFocusMode = context.cell.focusMode === notebookBrowser_1.CellFocusMode.Editor ? 'editor' : 'container';
            const executionP = runCell(accessor, context);
            const newCell = context.notebookEditor.insertNotebookCell(context.cell, notebookCommon_1.CellKind.Code, 'below');
            if (newCell) {
                context.notebookEditor.focusNotebookCell(newCell, newFocusMode);
            }
            return executionP;
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookAction {
        constructor() {
            super({
                id: RENDER_ALL_MARKDOWN_CELLS,
                title: (0, nls_1.localize)(8, null),
            });
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookAction {
        constructor() {
            super({
                id: EXECUTE_NOTEBOOK_COMMAND_ID,
                title: (0, nls_1.localize)(9, null),
                icon: icons.executeAllIcon,
                description: {
                    description: (0, nls_1.localize)(10, null),
                    args: [
                        {
                            name: 'uri',
                            description: 'The document uri',
                            constraint: uri_1.URI
                        }
                    ]
                },
                menu: {
                    id: actions_1.MenuId.EditorTitle,
                    order: -1,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR, executeNotebookCondition, contextkey_1.ContextKeyExpr.or(notebookBrowser_1.NOTEBOOK_INTERRUPTIBLE_KERNEL.toNegated(), notebookBrowser_1.NOTEBOOK_HAS_RUNNING_CELL.toNegated())),
                }
            });
        }
        getEditorContextFromArgsOrActive(accessor, context) {
            var _a;
            return (_a = getContextFromUri(accessor, context)) !== null && _a !== void 0 ? _a : getContextFromActiveEditor(accessor.get(editorService_1.IEditorService));
        }
        async runWithContext(accessor, context) {
            renderAllMarkdownCells(context);
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */).find(editor => editor.editor instanceof notebookEditorInput_1.NotebookEditorInput && editor.editor.viewType === context.notebookEditor.viewModel.viewType && editor.editor.resource.toString() === context.notebookEditor.viewModel.uri.toString());
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            if (editor) {
                const group = editorGroupService.getGroup(editor.groupId);
                group === null || group === void 0 ? void 0 : group.pinEditor(editor.editor);
            }
            return context.notebookEditor.executeNotebookCells();
        }
    });
    function renderAllMarkdownCells(context) {
        context.notebookEditor.viewModel.viewCells.forEach(cell => {
            if (cell.cellKind === notebookCommon_1.CellKind.Markdown) {
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'renderAllMarkdownCells');
            }
        });
    }
    (0, actions_1.registerAction2)(class CancelNotebook extends NotebookAction {
        constructor() {
            super({
                id: CANCEL_NOTEBOOK_COMMAND_ID,
                title: (0, nls_1.localize)(11, null),
                icon: icons.stopIcon,
                description: {
                    description: (0, nls_1.localize)(12, null),
                    args: [
                        {
                            name: 'uri',
                            description: 'The document uri',
                            constraint: uri_1.URI
                        }
                    ]
                },
                menu: {
                    id: actions_1.MenuId.EditorTitle,
                    order: -1,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookBrowser_1.NOTEBOOK_HAS_RUNNING_CELL, notebookBrowser_1.NOTEBOOK_INTERRUPTIBLE_KERNEL)
                }
            });
        }
        getEditorContextFromArgsOrActive(accessor, context) {
            var _a;
            return (_a = getContextFromUri(accessor, context)) !== null && _a !== void 0 ? _a : getContextFromActiveEditor(accessor.get(editorService_1.IEditorService));
        }
        async runWithContext(accessor, context) {
            return context.notebookEditor.cancelNotebookCells();
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellTitle, {
        submenu: actions_1.MenuId.NotebookCellInsert,
        title: (0, nls_1.localize)(13, null),
        group: "2_insert" /* Insert */,
        when: notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        submenu: actions_1.MenuId.NotebookCellTitle,
        title: (0, nls_1.localize)(14, null),
        group: "2_insert" /* Insert */,
        when: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED
    });
    (0, actions_1.registerAction2)(class extends NotebookCellAction {
        constructor() {
            super({
                id: CHANGE_CELL_TO_CODE_COMMAND_ID,
                title: (0, nls_1.localize)(15, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 55 /* KEY_Y */,
                    weight: 200 /* WorkbenchContrib */
                },
                precondition: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('markdown')),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('markdown')),
                    group: "3_edit" /* Edit */,
                }
            });
        }
        async runWithContext(accessor, context) {
            await changeCellToKind(notebookCommon_1.CellKind.Code, context);
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookCellAction {
        constructor() {
            super({
                id: CHANGE_CELL_TO_MARKDOWN_COMMAND_ID,
                title: (0, nls_1.localize)(16, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 43 /* KEY_M */,
                    weight: 200 /* WorkbenchContrib */
                },
                precondition: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR, notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('code')),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('code')),
                    group: "3_edit" /* Edit */,
                }
            });
        }
        async runWithContext(accessor, context) {
            await changeCellToKind(notebookCommon_1.CellKind.Markdown, context);
        }
    });
    async function runCell(accessor, context) {
        var _a;
        if (((_a = context.cell.metadata) === null || _a === void 0 ? void 0 : _a.runState) === notebookCommon_1.NotebookCellExecutionState.Executing) {
            return;
        }
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const group = editorGroupService.activeGroup;
        if (group) {
            if (group.activeEditor) {
                group.pinEditor(group.activeEditor);
            }
        }
        if (context.cell.cellKind === notebookCommon_1.CellKind.Markdown) {
            context.notebookEditor.focusNotebookCell(context.cell, 'container');
            return;
        }
        else {
            return context.notebookEditor.executeNotebookCells(iterator_1.Iterable.single(context.cell));
        }
    }
    async function changeCellToKind(kind, context, language) {
        var _a, _b, _c;
        const { cell, notebookEditor } = context;
        if (cell.cellKind === kind) {
            return null;
        }
        if (!notebookEditor.viewModel) {
            return null;
        }
        if (notebookEditor.viewModel.options.isReadOnly) {
            return null;
        }
        const text = cell.getText();
        const idx = notebookEditor.viewModel.getCellIndex(cell);
        if (language === undefined) {
            const availableLanguages = (_b = (_a = notebookEditor.activeKernel) === null || _a === void 0 ? void 0 : _a.supportedLanguages) !== null && _b !== void 0 ? _b : [];
            language = (_c = availableLanguages[0]) !== null && _c !== void 0 ? _c : 'plaintext';
        }
        notebookEditor.viewModel.notebookDocument.applyEdits([
            {
                editType: 1 /* Replace */,
                index: idx,
                count: 1,
                cells: [{
                        cellKind: kind,
                        source: text,
                        language: language,
                        outputs: cell.model.outputs,
                        metadata: cell.metadata,
                    }]
            }
        ], true, undefined, () => undefined, undefined, true);
        const newCell = notebookEditor.viewModel.cellAt(idx);
        if (!newCell) {
            return null;
        }
        notebookEditor.focusNotebookCell(newCell, cell.getEditState() === notebookBrowser_1.CellEditState.Editing ? 'editor' : 'container');
        return newCell;
    }
    exports.changeCellToKind = changeCellToKind;
    class InsertCellCommand extends NotebookAction {
        constructor(desc, kind, direction) {
            super(desc);
            this.kind = kind;
            this.direction = direction;
        }
        async runWithContext(accessor, context) {
            context.notebookEditor.insertNotebookCell(context.cell, this.kind, this.direction, undefined, true);
        }
    }
    (0, actions_1.registerAction2)(class extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)(17, null),
                keybinding: {
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 3 /* Enter */,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 0
                }
            }, notebookCommon_1.CellKind.Code, 'above');
        }
    });
    (0, actions_1.registerAction2)(class extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)(18, null),
                keybinding: {
                    primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkeys_1.InputFocusedContext.toNegated()),
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 1
                }
            }, notebookCommon_1.CellKind.Code, 'below');
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookAction {
        constructor() {
            super({
                id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)(19, null),
                f1: false
            });
        }
        async run(accessor, context) {
            context = context !== null && context !== void 0 ? context : this.getEditorContextFromArgsOrActive(accessor);
            if (context) {
                this.runWithContext(accessor, context);
            }
        }
        async runWithContext(accessor, context) {
            const newCell = context.notebookEditor.insertNotebookCell(undefined, notebookCommon_1.CellKind.Code, 'above', undefined, true);
            if (newCell) {
                context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookAction {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
                title: (0, nls_1.localize)(20, null),
                f1: false
            });
        }
        async run(accessor, context) {
            context = context !== null && context !== void 0 ? context : this.getEditorContextFromArgsOrActive(accessor);
            if (context) {
                this.runWithContext(accessor, context);
            }
        }
        async runWithContext(accessor, context) {
            const newCell = context.notebookEditor.insertNotebookCell(undefined, notebookCommon_1.CellKind.Markdown, 'above', undefined, true);
            if (newCell) {
                context.notebookEditor.focusNotebookCell(newCell, 'editor');
            }
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_CODE_CELL_BELOW_COMMAND_ID,
            title: (0, nls_1.localize)(21, null),
            tooltip: (0, nls_1.localize)(22, null)
        },
        order: 0,
        group: 'inline',
        when: notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_CODE_CELL_AT_TOP_COMMAND_ID,
            title: (0, nls_1.localize)(23, null),
            tooltip: (0, nls_1.localize)(24, null)
        },
        order: 0,
        group: 'inline',
        when: notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
    });
    (0, actions_1.registerAction2)(class extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_ABOVE_COMMAND_ID,
                title: (0, nls_1.localize)(25, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 2
                }
            }, notebookCommon_1.CellKind.Markdown, 'above');
        }
    });
    (0, actions_1.registerAction2)(class extends InsertCellCommand {
        constructor() {
            super({
                id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
                title: (0, nls_1.localize)(26, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellInsert,
                    order: 3
                }
            }, notebookCommon_1.CellKind.Markdown, 'below');
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellBetween, {
        command: {
            id: INSERT_MARKDOWN_CELL_BELOW_COMMAND_ID,
            title: (0, nls_1.localize)(27, null),
            tooltip: (0, nls_1.localize)(28, null)
        },
        order: 1,
        group: 'inline',
        when: notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.NotebookCellListTop, {
        command: {
            id: INSERT_MARKDOWN_CELL_AT_TOP_COMMAND_ID,
            title: (0, nls_1.localize)(29, null),
            tooltip: (0, nls_1.localize)(30, null)
        },
        order: 1,
        group: 'inline',
        when: notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE.isEqualTo(true)
    });
    (0, actions_1.registerAction2)(class extends NotebookCellAction {
        constructor() {
            super({
                id: EDIT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(31, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    primary: 3 /* Enter */,
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('markdown'), notebookBrowser_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE.toNegated(), notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    order: 0 /* EditCell */,
                    group: exports.CELL_TITLE_CELL_GROUP_ID
                },
                icon: icons.editIcon,
            });
        }
        async runWithContext(accessor, context) {
            context.notebookEditor.focusNotebookCell(context.cell, 'editor');
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.QUIT_EDIT_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(32, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('markdown'), notebookBrowser_1.NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    order: 2 /* SaveCell */,
                    group: exports.CELL_TITLE_CELL_GROUP_ID
                },
                icon: icons.stopEditIcon,
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkeys_1.InputFocusedContext, editorContextKeys_1.EditorContextKeys.hoverVisible.toNegated(), editorContextKeys_1.EditorContextKeys.hasNonEmptySelection.toNegated(), editorContextKeys_1.EditorContextKeys.hasMultipleSelections.toNegated()),
                    primary: 9 /* Escape */,
                    weight: exports.NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT - 5
                },
            });
        }
        async runWithContext(accessor, context) {
            if (context.cell.cellKind === notebookCommon_1.CellKind.Markdown) {
                context.cell.updateEditState(notebookBrowser_1.CellEditState.Preview, notebookBrowser_1.QUIT_EDIT_CELL_COMMAND_ID);
            }
            return context.notebookEditor.focusNotebookCell(context.cell, 'container');
        }
    });
    function runDeleteAction(viewModel, cell) {
        const selections = viewModel.getSelections();
        const targetCellIndex = viewModel.getCellIndex(cell);
        const containingSelection = selections.find(selection => selection.start <= targetCellIndex && targetCellIndex < selection.end);
        if (containingSelection) {
            const edits = selections.reverse().map(selection => ({
                editType: 1 /* Replace */, index: selection.start, count: selection.end - selection.start, cells: []
            }));
            const nextCellAfterContainingSelection = viewModel.cellAt(containingSelection.end);
            viewModel.notebookDocument.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => {
                if (nextCellAfterContainingSelection) {
                    const cellIndex = viewModel.notebookDocument.cells.findIndex(cell => cell.handle === nextCellAfterContainingSelection.handle);
                    return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: cellIndex, end: cellIndex + 1 }, selections: [{ start: cellIndex, end: cellIndex + 1 }] };
                }
                else {
                    if (viewModel.notebookDocument.length) {
                        const lastCellIndex = viewModel.notebookDocument.length - 1;
                        return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: lastCellIndex, end: lastCellIndex + 1 }, selections: [{ start: lastCellIndex, end: lastCellIndex + 1 }] };
                    }
                    else {
                        return { kind: notebookCommon_1.SelectionStateType.Index, focus: { start: 0, end: 0 }, selections: [{ start: 0, end: 0 }] };
                    }
                }
            }, undefined);
        }
        else {
            const focus = viewModel.getFocus();
            const edits = [{
                    editType: 1 /* Replace */, index: targetCellIndex, count: 1, cells: []
                }];
            let finalSelections = [];
            for (let i = 0; i < selections.length; i++) {
                const selection = selections[i];
                if (selection.end <= targetCellIndex) {
                    finalSelections.push(selection);
                }
                else if (selection.start > targetCellIndex) {
                    finalSelections.push({ start: selection.start - 1, end: selection.end - 1 });
                }
                else {
                    finalSelections.push({ start: targetCellIndex, end: targetCellIndex + 1 });
                }
            }
            if (viewModel.cellAt(focus.start) === cell) {
                // focus is the target, focus is also not part of any selection
                const newFocus = focus.end === viewModel.length ? { start: focus.start - 1, end: focus.end - 1 } : focus;
                viewModel.notebookDocument.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => ({
                    kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: finalSelections
                }), undefined);
            }
            else {
                // users decide to delete a cell out of current focus/selection
                const newFocus = focus.start > targetCellIndex ? { start: focus.start - 1, end: focus.end - 1 } : focus;
                viewModel.notebookDocument.applyEdits(edits, true, { kind: notebookCommon_1.SelectionStateType.Index, focus: viewModel.getFocus(), selections: viewModel.getSelections() }, () => ({
                    kind: notebookCommon_1.SelectionStateType.Index, focus: newFocus, selections: finalSelections
                }), undefined);
            }
        }
    }
    exports.runDeleteAction = runDeleteAction;
    (0, actions_1.registerAction2)(class extends NotebookCellAction {
        constructor() {
            super({
                id: DELETE_CELL_COMMAND_ID,
                title: (0, nls_1.localize)(33, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE
                },
                keybinding: {
                    primary: 20 /* Delete */,
                    mac: {
                        primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
                    },
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey)),
                    weight: 200 /* WorkbenchContrib */
                },
                icon: icons.deleteCellIcon
            });
        }
        async runWithContext(accessor, context) {
            const viewModel = context.notebookEditor.viewModel;
            if (!viewModel || viewModel.options.isReadOnly) {
                return;
            }
            runDeleteAction(viewModel, context.cell);
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookCellAction {
        constructor() {
            super({
                id: CLEAR_CELL_OUTPUTS_COMMAND_ID,
                title: (0, nls_1.localize)(34, null),
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_TYPE.isEqualTo('code'), executeNotebookCondition, notebookBrowser_1.NOTEBOOK_CELL_HAS_OUTPUTS, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    order: 3 /* ClearCellOutput */,
                    group: exports.CELL_TITLE_OUTPUT_GROUP_ID
                },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey), notebookBrowser_1.NOTEBOOK_CELL_HAS_OUTPUTS, notebookBrowser_1.NOTEBOOK_EDITOR_EDITABLE, notebookBrowser_1.NOTEBOOK_CELL_EDITABLE),
                    primary: 512 /* Alt */ | 20 /* Delete */,
                    weight: 200 /* WorkbenchContrib */
                },
                icon: icons.clearIcon
            });
        }
        async runWithContext(accessor, context) {
            var _a;
            const editor = context.notebookEditor;
            if (!editor.viewModel || !editor.viewModel.length) {
                return;
            }
            const cell = context.cell;
            const index = editor.viewModel.notebookDocument.cells.indexOf(cell.model);
            if (index < 0) {
                return;
            }
            editor.viewModel.notebookDocument.applyEdits([{ editType: 2 /* Output */, index, outputs: [] }], true, undefined, () => undefined, undefined);
            if (context.cell.metadata && ((_a = context.cell.metadata) === null || _a === void 0 ? void 0 : _a.runState) !== notebookCommon_1.NotebookCellExecutionState.Executing) {
                context.notebookEditor.viewModel.notebookDocument.applyEdits([{
                        editType: 3 /* Metadata */, index, metadata: Object.assign(Object.assign({}, context.cell.metadata), { runState: notebookCommon_1.NotebookCellExecutionState.Idle, runStartTime: undefined, runStartTimeAdjustment: undefined, runEndTime: undefined, executionOrder: undefined, lastRunSuccess: undefined })
                    }], true, undefined, () => undefined, undefined);
            }
        }
    });
    (0, actions_1.registerAction2)(class ChangeCellLanguageAction extends NotebookCellAction {
        constructor() {
            super({
                id: notebookBrowser_1.CHANGE_CELL_LANGUAGE,
                title: (0, nls_1.localize)(35, null),
                description: {
                    description: (0, nls_1.localize)(36, null),
                    args: [
                        {
                            name: 'range',
                            description: 'The cell range',
                            schema: {
                                'type': 'object',
                                'required': ['start', 'end'],
                                'properties': {
                                    'start': {
                                        'type': 'number'
                                    },
                                    'end': {
                                        'type': 'number'
                                    }
                                }
                            }
                        },
                        {
                            name: 'language',
                            description: 'The target cell language',
                            schema: {
                                'type': 'string'
                            }
                        }
                    ]
                }
            });
        }
        getCellContextFromArgs(accessor, context, ...additionalArgs) {
            if (!context || typeof context.start !== 'number' || typeof context.end !== 'number' || context.start >= context.end) {
                return;
            }
            const language = additionalArgs.length && typeof additionalArgs[0] === 'string' ? additionalArgs[0] : undefined;
            const activeEditorContext = this.getEditorContextFromArgsOrActive(accessor);
            if (!activeEditorContext || !activeEditorContext.notebookEditor.viewModel || context.start >= activeEditorContext.notebookEditor.viewModel.length) {
                return;
            }
            // TODO@rebornix, support multiple cells
            return {
                notebookEditor: activeEditorContext.notebookEditor,
                cell: activeEditorContext.notebookEditor.viewModel.cellAt(context.start),
                language
            };
        }
        async runWithContext(accessor, context) {
            if (context.language) {
                await this.setLanguage(context, context.language);
            }
            else {
                await this.showLanguagePicker(accessor, context);
            }
        }
        async showLanguagePicker(accessor, context) {
            var _a, _b;
            const topItems = [];
            const mainItems = [];
            const modeService = accessor.get(modeService_1.IModeService);
            const modelService = accessor.get(modelService_1.IModelService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const providerLanguages = new Set([
                ...((_b = (_a = context.notebookEditor.activeKernel) === null || _a === void 0 ? void 0 : _a.supportedLanguages) !== null && _b !== void 0 ? _b : modeService.getRegisteredModes()),
                'markdown'
            ]);
            providerLanguages.forEach(languageId => {
                let description;
                if (context.cell.cellKind === notebookCommon_1.CellKind.Markdown ? (languageId === 'markdown') : (languageId === context.cell.language)) {
                    description = (0, nls_1.localize)(37, null, languageId);
                }
                else {
                    description = (0, nls_1.localize)(38, null, languageId);
                }
                const languageName = modeService.getLanguageName(languageId);
                if (!languageName) {
                    // Notebook has unrecognized language
                    return;
                }
                const item = {
                    label: languageName,
                    iconClasses: (0, getIconClasses_1.getIconClasses)(modelService, modeService, this.getFakeResource(languageName, modeService)),
                    description,
                    languageId
                };
                if (languageId === 'markdown' || languageId === context.cell.language) {
                    topItems.push(item);
                }
                else {
                    mainItems.push(item);
                }
            });
            mainItems.sort((a, b) => {
                return a.description.localeCompare(b.description);
            });
            const picks = [
                ...topItems,
                { type: 'separator' },
                ...mainItems
            ];
            const selection = await quickInputService.pick(picks, { placeHolder: (0, nls_1.localize)(39, null) });
            if (selection && selection.languageId) {
                await this.setLanguage(context, selection.languageId);
            }
        }
        async setLanguage(context, languageId) {
            var _a, _b;
            if (languageId === 'markdown' && ((_a = context.cell) === null || _a === void 0 ? void 0 : _a.language) !== 'markdown') {
                const newCell = await changeCellToKind(notebookCommon_1.CellKind.Markdown, { cell: context.cell, notebookEditor: context.notebookEditor }, 'markdown');
                if (newCell) {
                    context.notebookEditor.focusNotebookCell(newCell, 'editor');
                }
            }
            else if (languageId !== 'markdown' && ((_b = context.cell) === null || _b === void 0 ? void 0 : _b.cellKind) === notebookCommon_1.CellKind.Markdown) {
                await changeCellToKind(notebookCommon_1.CellKind.Code, { cell: context.cell, notebookEditor: context.notebookEditor }, languageId);
            }
            else {
                const index = context.notebookEditor.viewModel.notebookDocument.cells.indexOf(context.cell.model);
                context.notebookEditor.viewModel.notebookDocument.applyEdits([{ editType: 4 /* CellLanguage */, index, language: languageId }], true, undefined, () => undefined, undefined);
            }
        }
        /**
         * Copied from editorStatus.ts
         */
        getFakeResource(lang, modeService) {
            let fakeResource;
            const extensions = modeService.getExtensions(lang);
            if (extensions === null || extensions === void 0 ? void 0 : extensions.length) {
                fakeResource = uri_1.URI.file(extensions[0]);
            }
            else {
                const filenames = modeService.getFilenames(lang);
                if (filenames === null || filenames === void 0 ? void 0 : filenames.length) {
                    fakeResource = uri_1.URI.file(filenames[0]);
                }
            }
            return fakeResource;
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookAction {
        constructor() {
            super({
                id: CLEAR_ALL_CELLS_OUTPUTS_COMMAND_ID,
                title: (0, nls_1.localize)(40, null),
                menu: {
                    id: actions_1.MenuId.EditorTitle,
                    when: notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR,
                    group: 'navigation',
                    order: 0
                },
                icon: icons.clearIcon
            });
        }
        async runWithContext(accessor, context) {
            const editor = context.notebookEditor;
            if (!editor.viewModel || !editor.viewModel.length) {
                return;
            }
            editor.viewModel.notebookDocument.applyEdits(editor.viewModel.notebookDocument.cells.map((cell, index) => ({
                editType: 2 /* Output */, index, outputs: []
            })), true, undefined, () => undefined, undefined);
            const clearExecutionMetadataEdits = editor.viewModel.notebookDocument.cells.map((cell, index) => {
                var _a;
                if (cell.metadata && ((_a = cell.metadata) === null || _a === void 0 ? void 0 : _a.runState) !== notebookCommon_1.NotebookCellExecutionState.Executing) {
                    return {
                        editType: 3 /* Metadata */, index, metadata: Object.assign(Object.assign({}, cell.metadata), { runState: notebookCommon_1.NotebookCellExecutionState.Idle, runStartTime: undefined, runStartTimeAdjustment: undefined, runEndTime: undefined, executionOrder: undefined })
                    };
                }
                else {
                    return undefined;
                }
            }).filter(edit => !!edit);
            if (clearExecutionMetadataEdits.length) {
                context.notebookEditor.viewModel.notebookDocument.applyEdits(clearExecutionMetadataEdits, true, undefined, () => undefined, undefined);
            }
        }
    });
    (0, actions_1.registerAction2)(class extends NotebookCellAction {
        constructor() {
            super({
                id: CENTER_ACTIVE_CELL,
                title: (0, nls_1.localize)(41, null),
                keybinding: {
                    when: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED,
                    primary: 2048 /* CtrlCmd */ | 42 /* KEY_L */,
                    mac: {
                        primary: 256 /* WinCtrl */ | 42 /* KEY_L */,
                    },
                    weight: 200 /* WorkbenchContrib */
                },
            });
        }
        async runWithContext(accessor, context) {
            return context.notebookEditor.revealInCenter(context.cell);
        }
    });
    class ChangeNotebookCellMetadataAction extends NotebookCellAction {
        async runWithContext(accessor, context) {
            var _a;
            const textModel = context.notebookEditor.viewModel.notebookDocument;
            if (!textModel) {
                return;
            }
            const metadataDelta = this.getMetadataDelta();
            const edits = [];
            const targetCells = (_a = (context.cell ? [context.cell] : context.selectedCells)) !== null && _a !== void 0 ? _a : [];
            for (const cell of targetCells) {
                const index = textModel.cells.indexOf(cell.model);
                if (index >= 0) {
                    edits.push({ editType: 3 /* Metadata */, index, metadata: Object.assign(Object.assign({}, context.cell.metadata), metadataDelta) });
                }
            }
            textModel.applyEdits(edits, true, undefined, () => undefined, undefined);
        }
    }
    (0, actions_1.registerAction2)(class extends ChangeNotebookCellMetadataAction {
        constructor() {
            super({
                id: COLLAPSE_CELL_INPUT_COMMAND_ID,
                title: (0, nls_1.localize)(42, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookBrowser_1.NOTEBOOK_CELL_INPUT_COLLAPSED.toNegated(), contextkeys_1.InputFocusedContext.toNegated()),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 33 /* KEY_C */),
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_INPUT_COLLAPSED.toNegated()),
                    group: "4_collapse" /* Collapse */,
                }
            });
        }
        getMetadataDelta() {
            return { inputCollapsed: true };
        }
    });
    (0, actions_1.registerAction2)(class extends ChangeNotebookCellMetadataAction {
        constructor() {
            super({
                id: notebookBrowser_1.EXPAND_CELL_INPUT_COMMAND_ID,
                title: (0, nls_1.localize)(43, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookBrowser_1.NOTEBOOK_CELL_INPUT_COLLAPSED),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 33 /* KEY_C */),
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_INPUT_COLLAPSED),
                    group: "4_collapse" /* Collapse */,
                }
            });
        }
        getMetadataDelta() {
            return { inputCollapsed: false };
        }
    });
    (0, actions_1.registerAction2)(class extends ChangeNotebookCellMetadataAction {
        constructor() {
            super({
                id: COLLAPSE_CELL_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)(44, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookBrowser_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED.toNegated(), contextkeys_1.InputFocusedContext.toNegated(), notebookBrowser_1.NOTEBOOK_CELL_HAS_OUTPUTS),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 50 /* KEY_T */),
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED.toNegated(), notebookBrowser_1.NOTEBOOK_CELL_HAS_OUTPUTS),
                    group: "4_collapse" /* Collapse */,
                }
            });
        }
        getMetadataDelta() {
            return { outputCollapsed: true };
        }
    });
    (0, actions_1.registerAction2)(class extends ChangeNotebookCellMetadataAction {
        constructor() {
            super({
                id: EXPAND_CELL_OUTPUT_COMMAND_ID,
                title: (0, nls_1.localize)(45, null),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LIST_FOCUSED, notebookBrowser_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED),
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 50 /* KEY_T */),
                    weight: 200 /* WorkbenchContrib */
                },
                menu: {
                    id: actions_1.MenuId.NotebookCellTitle,
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_OUTPUT_COLLAPSED),
                    group: "4_collapse" /* Collapse */,
                }
            });
        }
        getMetadataDelta() {
            return { outputCollapsed: false };
        }
    });
    // Revisit once we have a story for trusted workspace
    commands_1.CommandsRegistry.registerCommand('notebook.trust', (accessor, args) => {
        const uri = uri_1.URI.revive(args);
        const notebookService = accessor.get(notebookService_1.INotebookService);
        const document = notebookService.listNotebookDocuments().find(document => document.uri.toString() === uri.toString());
        if (document) {
            document.applyEdits([{ editType: 5 /* DocumentMetadata */, metadata: Object.assign(Object.assign({}, document.metadata), { trusted: true }) }], true, undefined, () => undefined, undefined, false);
        }
    });
    commands_1.CommandsRegistry.registerCommand('_resolveNotebookContentProvider', (accessor, args) => {
        const notebookService = accessor.get(notebookService_1.INotebookService);
        const contentProviders = notebookService.getContributedNotebookProviders();
        return contentProviders.map(provider => {
            const filenamePatterns = provider.selectors.map(selector => {
                if (typeof selector === 'string') {
                    return selector;
                }
                if (glob.isRelativePattern(selector)) {
                    return selector;
                }
                if ((0, notebookCommon_1.isDocumentExcludePattern)(selector)) {
                    return {
                        include: selector.include,
                        exclude: selector.exclude
                    };
                }
                return null;
            }).filter(pattern => pattern !== null);
            return {
                viewType: provider.id,
                displayName: provider.displayName,
                filenamePattern: filenamePatterns,
                options: {
                    transientCellMetadata: provider.options.transientCellMetadata,
                    transientDocumentMetadata: provider.options.transientDocumentMetadata,
                    transientOutputs: provider.options.transientOutputs
                }
            };
        });
    });
    commands_1.CommandsRegistry.registerCommand('_resolveNotebookKernels', async (accessor, args) => {
        const notebookKernelService = accessor.get(notebookKernelService_1.INotebookKernelService);
        const uri = uri_1.URI.revive(args.uri);
        const kernels = notebookKernelService.getMatchingKernel({ uri, viewType: args.viewType });
        return kernels.all.map(provider => ({
            id: provider.id,
            label: provider.label,
            description: provider.description,
            detail: provider.detail,
            isPreferred: false,
            preloads: provider.preloadUris,
        }));
    });
});
//# sourceMappingURL=coreActions.js.map