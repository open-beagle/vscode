/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/editorCommands", "vs/base/common/types", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/editor", "vs/workbench/services/editor/common/editorService", "vs/editor/common/editorContextKeys", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/base/common/keyCodes", "vs/base/common/uri", "vs/platform/quickinput/common/quickInput", "vs/platform/list/browser/listService", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/workbench/services/editor/common/editorGroupsService", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configuration", "vs/platform/commands/common/commands", "vs/platform/actions/common/actions", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/platform/opener/common/opener"], function (require, exports, nls_1, types_1, keybindingsRegistry_1, editor_1, editorService_1, editorContextKeys_1, textDiffEditor_1, keyCodes_1, uri_1, quickInput_1, listService_1, listWidget_1, arrays_1, editorGroupsService_1, contextkey_1, configuration_1, commands_1, actions_1, editorQuickAccess_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setup = exports.getMultiSelectedEditorContexts = exports.splitEditor = exports.API_OPEN_WITH_EDITOR_COMMAND_ID = exports.API_OPEN_DIFF_EDITOR_COMMAND_ID = exports.API_OPEN_EDITOR_COMMAND_ID = exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID = exports.FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = exports.SPLIT_EDITOR_RIGHT = exports.SPLIT_EDITOR_LEFT = exports.SPLIT_EDITOR_DOWN = exports.SPLIT_EDITOR_UP = exports.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = exports.DIFF_FOCUS_OTHER_SIDE = exports.DIFF_FOCUS_SECONDARY_SIDE = exports.DIFF_FOCUS_PRIMARY_SIDE = exports.GOTO_PREVIOUS_CHANGE = exports.GOTO_NEXT_CHANGE = exports.TOGGLE_DIFF_SIDE_BY_SIDE = exports.UNPIN_EDITOR_COMMAND_ID = exports.PIN_EDITOR_COMMAND_ID = exports.SHOW_EDITORS_IN_GROUP = exports.TOGGLE_KEEP_EDITORS_COMMAND_ID = exports.KEEP_EDITOR_COMMAND_ID = exports.LAYOUT_EDITOR_GROUPS_COMMAND_ID = exports.MOVE_ACTIVE_EDITOR_COMMAND_ID = exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = exports.CLOSE_EDITOR_GROUP_COMMAND_ID = exports.CLOSE_PINNED_EDITOR_COMMAND_ID = exports.CLOSE_EDITOR_COMMAND_ID = exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = exports.CLOSE_EDITORS_AND_GROUP_COMMAND_ID = exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID = exports.CLOSE_SAVED_EDITORS_COMMAND_ID = void 0;
    exports.CLOSE_SAVED_EDITORS_COMMAND_ID = 'workbench.action.closeUnmodifiedEditors';
    exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeEditorsInGroup';
    exports.CLOSE_EDITORS_AND_GROUP_COMMAND_ID = 'workbench.action.closeEditorsAndGroup';
    exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = 'workbench.action.closeEditorsToTheRight';
    exports.CLOSE_EDITOR_COMMAND_ID = 'workbench.action.closeActiveEditor';
    exports.CLOSE_PINNED_EDITOR_COMMAND_ID = 'workbench.action.closeActivePinnedEditor';
    exports.CLOSE_EDITOR_GROUP_COMMAND_ID = 'workbench.action.closeGroup';
    exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeOtherEditors';
    exports.MOVE_ACTIVE_EDITOR_COMMAND_ID = 'moveActiveEditor';
    exports.LAYOUT_EDITOR_GROUPS_COMMAND_ID = 'layoutEditorGroups';
    exports.KEEP_EDITOR_COMMAND_ID = 'workbench.action.keepEditor';
    exports.TOGGLE_KEEP_EDITORS_COMMAND_ID = 'workbench.action.toggleKeepEditors';
    exports.SHOW_EDITORS_IN_GROUP = 'workbench.action.showEditorsInGroup';
    exports.PIN_EDITOR_COMMAND_ID = 'workbench.action.pinEditor';
    exports.UNPIN_EDITOR_COMMAND_ID = 'workbench.action.unpinEditor';
    exports.TOGGLE_DIFF_SIDE_BY_SIDE = 'toggle.diff.renderSideBySide';
    exports.GOTO_NEXT_CHANGE = 'workbench.action.compareEditor.nextChange';
    exports.GOTO_PREVIOUS_CHANGE = 'workbench.action.compareEditor.previousChange';
    exports.DIFF_FOCUS_PRIMARY_SIDE = 'workbench.action.compareEditor.focusPrimarySide';
    exports.DIFF_FOCUS_SECONDARY_SIDE = 'workbench.action.compareEditor.focusSecondarySide';
    exports.DIFF_FOCUS_OTHER_SIDE = 'workbench.action.compareEditor.focusOtherSide';
    exports.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = 'toggle.diff.ignoreTrimWhitespace';
    exports.SPLIT_EDITOR_UP = 'workbench.action.splitEditorUp';
    exports.SPLIT_EDITOR_DOWN = 'workbench.action.splitEditorDown';
    exports.SPLIT_EDITOR_LEFT = 'workbench.action.splitEditorLeft';
    exports.SPLIT_EDITOR_RIGHT = 'workbench.action.splitEditorRight';
    exports.FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusLeftGroupWithoutWrap';
    exports.FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusRightGroupWithoutWrap';
    exports.FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusAboveGroupWithoutWrap';
    exports.FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusBelowGroupWithoutWrap';
    exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID = 'workbench.action.openEditorAtIndex';
    exports.API_OPEN_EDITOR_COMMAND_ID = '_workbench.open';
    exports.API_OPEN_DIFF_EDITOR_COMMAND_ID = '_workbench.diff';
    exports.API_OPEN_WITH_EDITOR_COMMAND_ID = '_workbench.openWith';
    const isActiveEditorMoveArg = function (arg) {
        if (!(0, types_1.isObject)(arg)) {
            return false;
        }
        if (!(0, types_1.isString)(arg.to)) {
            return false;
        }
        if (!(0, types_1.isUndefined)(arg.by) && !(0, types_1.isString)(arg.by)) {
            return false;
        }
        if (!(0, types_1.isUndefined)(arg.value) && !(0, types_1.isNumber)(arg.value)) {
            return false;
        }
        return true;
    };
    function registerActiveEditorMoveCommand() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.MOVE_ACTIVE_EDITOR_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            primary: 0,
            handler: (accessor, args) => moveActiveEditor(args, accessor),
            description: {
                description: (0, nls_1.localize)(0, null),
                args: [
                    {
                        name: (0, nls_1.localize)(1, null),
                        description: (0, nls_1.localize)(2, null),
                        constraint: isActiveEditorMoveArg,
                        schema: {
                            'type': 'object',
                            'required': ['to'],
                            'properties': {
                                'to': {
                                    'type': 'string',
                                    'enum': ['left', 'right']
                                },
                                'by': {
                                    'type': 'string',
                                    'enum': ['tab', 'group']
                                },
                                'value': {
                                    'type': 'number'
                                }
                            },
                        }
                    }
                ]
            }
        });
    }
    function moveActiveEditor(args = Object.create(null), accessor) {
        args.to = args.to || 'right';
        args.by = args.by || 'tab';
        args.value = typeof args.value === 'number' ? args.value : 1;
        const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
        if (activeEditorPane) {
            switch (args.by) {
                case 'tab':
                    return moveActiveTab(args, activeEditorPane, accessor);
                case 'group':
                    return moveActiveEditorToGroup(args, activeEditorPane, accessor);
            }
        }
    }
    function moveActiveTab(args, control, accessor) {
        const group = control.group;
        let index = group.getIndexOfEditor(control.input);
        switch (args.to) {
            case 'first':
                index = 0;
                break;
            case 'last':
                index = group.count - 1;
                break;
            case 'left':
                index = index - args.value;
                break;
            case 'right':
                index = index + args.value;
                break;
            case 'center':
                index = Math.round(group.count / 2) - 1;
                break;
            case 'position':
                index = args.value - 1;
                break;
        }
        index = index < 0 ? 0 : index >= group.count ? group.count - 1 : index;
        group.moveEditor(control.input, group, { index });
    }
    function moveActiveEditorToGroup(args, control, accessor) {
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const sourceGroup = control.group;
        let targetGroup;
        switch (args.to) {
            case 'left':
                targetGroup = editorGroupService.findGroup({ direction: 2 /* LEFT */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 2 /* LEFT */);
                }
                break;
            case 'right':
                targetGroup = editorGroupService.findGroup({ direction: 3 /* RIGHT */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 3 /* RIGHT */);
                }
                break;
            case 'up':
                targetGroup = editorGroupService.findGroup({ direction: 0 /* UP */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 0 /* UP */);
                }
                break;
            case 'down':
                targetGroup = editorGroupService.findGroup({ direction: 1 /* DOWN */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 1 /* DOWN */);
                }
                break;
            case 'first':
                targetGroup = editorGroupService.findGroup({ location: 0 /* FIRST */ }, sourceGroup);
                break;
            case 'last':
                targetGroup = editorGroupService.findGroup({ location: 1 /* LAST */ }, sourceGroup);
                break;
            case 'previous':
                targetGroup = editorGroupService.findGroup({ location: 3 /* PREVIOUS */ }, sourceGroup);
                break;
            case 'next':
                targetGroup = editorGroupService.findGroup({ location: 2 /* NEXT */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService));
                }
                break;
            case 'center':
                targetGroup = editorGroupService.getGroups(2 /* GRID_APPEARANCE */)[(editorGroupService.count / 2) - 1];
                break;
            case 'position':
                targetGroup = editorGroupService.getGroups(2 /* GRID_APPEARANCE */)[args.value - 1];
                break;
        }
        if (targetGroup) {
            sourceGroup.moveEditor(control.input, targetGroup);
            targetGroup.focus();
        }
    }
    function registerEditorGroupsLayoutCommand() {
        function applyEditorLayout(accessor, layout) {
            if (!layout || typeof layout !== 'object') {
                return;
            }
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            editorGroupService.applyLayout(layout);
        }
        commands_1.CommandsRegistry.registerCommand(exports.LAYOUT_EDITOR_GROUPS_COMMAND_ID, (accessor, args) => {
            applyEditorLayout(accessor, args);
        });
        // API Command
        commands_1.CommandsRegistry.registerCommand({
            id: 'vscode.setEditorLayout',
            handler: (accessor, args) => applyEditorLayout(accessor, args),
            description: {
                description: 'Set Editor Layout',
                args: [{
                        name: 'args',
                        schema: {
                            'type': 'object',
                            'required': ['groups'],
                            'properties': {
                                'orientation': {
                                    'type': 'number',
                                    'default': 0,
                                    'enum': [0, 1]
                                },
                                'groups': {
                                    '$ref': '#/definitions/editorGroupsSchema',
                                    'default': [{}, {}]
                                }
                            }
                        }
                    }]
            }
        });
    }
    function registerDiffEditorCommands() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.GOTO_NEXT_CHANGE,
            weight: 200 /* WorkbenchContrib */,
            when: editor_1.TextCompareEditorVisibleContext,
            primary: 512 /* Alt */ | 63 /* F5 */,
            handler: accessor => navigateInDiffEditor(accessor, true)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.GOTO_PREVIOUS_CHANGE,
            weight: 200 /* WorkbenchContrib */,
            when: editor_1.TextCompareEditorVisibleContext,
            primary: 512 /* Alt */ | 1024 /* Shift */ | 63 /* F5 */,
            handler: accessor => navigateInDiffEditor(accessor, false)
        });
        function getActiveTextDiffEditor(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            for (const editor of [editorService.activeEditorPane, ...editorService.visibleEditorPanes]) {
                if (editor instanceof textDiffEditor_1.TextDiffEditor) {
                    return editor;
                }
            }
            return undefined;
        }
        function navigateInDiffEditor(accessor, next) {
            const activeTextDiffEditor = getActiveTextDiffEditor(accessor);
            if (activeTextDiffEditor) {
                const navigator = activeTextDiffEditor.getDiffNavigator();
                if (navigator) {
                    next ? navigator.next() : navigator.previous();
                }
            }
        }
        let FocusTextDiffEditorMode;
        (function (FocusTextDiffEditorMode) {
            FocusTextDiffEditorMode[FocusTextDiffEditorMode["Original"] = 0] = "Original";
            FocusTextDiffEditorMode[FocusTextDiffEditorMode["Modified"] = 1] = "Modified";
            FocusTextDiffEditorMode[FocusTextDiffEditorMode["Toggle"] = 2] = "Toggle";
        })(FocusTextDiffEditorMode || (FocusTextDiffEditorMode = {}));
        function focusInDiffEditor(accessor, mode) {
            var _a, _b, _c;
            const activeTextDiffEditor = getActiveTextDiffEditor(accessor);
            if (activeTextDiffEditor) {
                switch (mode) {
                    case FocusTextDiffEditorMode.Original:
                        (_a = activeTextDiffEditor.getControl()) === null || _a === void 0 ? void 0 : _a.getOriginalEditor().focus();
                        break;
                    case FocusTextDiffEditorMode.Modified:
                        (_b = activeTextDiffEditor.getControl()) === null || _b === void 0 ? void 0 : _b.getModifiedEditor().focus();
                        break;
                    case FocusTextDiffEditorMode.Toggle:
                        if ((_c = activeTextDiffEditor.getControl()) === null || _c === void 0 ? void 0 : _c.getModifiedEditor().hasWidgetFocus()) {
                            return focusInDiffEditor(accessor, FocusTextDiffEditorMode.Original);
                        }
                        else {
                            return focusInDiffEditor(accessor, FocusTextDiffEditorMode.Modified);
                        }
                }
            }
        }
        function toggleDiffSideBySide(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.renderSideBySide');
            configurationService.updateValue('diffEditor.renderSideBySide', newValue);
        }
        function toggleDiffIgnoreTrimWhitespace(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const newValue = !configurationService.getValue('diffEditor.ignoreTrimWhitespace');
            configurationService.updateValue('diffEditor.ignoreTrimWhitespace', newValue);
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.TOGGLE_DIFF_SIDE_BY_SIDE,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => toggleDiffSideBySide(accessor)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.DIFF_FOCUS_PRIMARY_SIDE,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Modified)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.DIFF_FOCUS_SECONDARY_SIDE,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Original)
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.DIFF_FOCUS_OTHER_SIDE,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Toggle)
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id: exports.TOGGLE_DIFF_SIDE_BY_SIDE,
                title: {
                    value: (0, nls_1.localize)(3, null),
                    original: 'Compare: Toggle Inline View'
                },
                category: (0, nls_1.localize)(4, null)
            },
            when: contextkey_1.ContextKeyExpr.has('textCompareEditorActive')
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: accessor => toggleDiffIgnoreTrimWhitespace(accessor)
        });
    }
    function registerOpenEditorAPICommands() {
        function mixinContext(context, options, column) {
            if (!context) {
                return [options, column];
            }
            return [
                Object.assign(Object.assign({}, context.editorOptions), (options !== null && options !== void 0 ? options : Object.create(null))),
                context.sideBySide ? editorService_1.SIDE_GROUP : column
            ];
        }
        commands_1.CommandsRegistry.registerCommand(exports.API_OPEN_EDITOR_COMMAND_ID, async function (accessor, resourceArg, columnAndOptions, label, context) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const resource = uri_1.URI.revive(resourceArg);
            const [columnArg, optionsArg] = columnAndOptions !== null && columnAndOptions !== void 0 ? columnAndOptions : [];
            // use editor options or editor view column as a hint to use the editor service for opening
            if (optionsArg || typeof columnArg === 'number') {
                const [options, column] = mixinContext(context, optionsArg, columnArg);
                await editorService.openEditor({ resource, options, label }, (0, editor_1.viewColumnToEditorGroup)(editorGroupService, column));
            }
            // do not allow to execute commands from here
            else if (resource.scheme === 'command') {
                return;
            }
            // finally, delegate to opener service
            else {
                await openerService.open(resource, { openToSide: context === null || context === void 0 ? void 0 : context.sideBySide, editorOptions: context === null || context === void 0 ? void 0 : context.editorOptions });
            }
        });
        commands_1.CommandsRegistry.registerCommand(exports.API_OPEN_DIFF_EDITOR_COMMAND_ID, async function (accessor, leftResource, rightResource, label, columnAndOptions, context) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const [columnArg, optionsArg] = columnAndOptions !== null && columnAndOptions !== void 0 ? columnAndOptions : [];
            const [options, column] = mixinContext(context, optionsArg, columnArg);
            await editorService.openEditor({
                leftResource: uri_1.URI.revive(leftResource),
                rightResource: uri_1.URI.revive(rightResource),
                label,
                options
            }, (0, editor_1.viewColumnToEditorGroup)(editorGroupService, column));
        });
        commands_1.CommandsRegistry.registerCommand(exports.API_OPEN_WITH_EDITOR_COMMAND_ID, (accessor, resource, id, columnAndOptions) => {
            var _a;
            const editorService = accessor.get(editorService_1.IEditorService);
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const [columnArg, optionsArg] = columnAndOptions !== null && columnAndOptions !== void 0 ? columnAndOptions : [];
            let group = undefined;
            if (columnArg === editorService_1.SIDE_GROUP) {
                const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService);
                let neighbourGroup = editorGroupsService.findGroup({ direction });
                if (!neighbourGroup) {
                    neighbourGroup = editorGroupsService.addGroup(editorGroupsService.activeGroup, direction);
                }
                group = neighbourGroup;
            }
            else {
                group = (_a = editorGroupsService.getGroup((0, editor_1.viewColumnToEditorGroup)(editorGroupsService, columnArg))) !== null && _a !== void 0 ? _a : editorGroupsService.activeGroup;
            }
            return editorService.openEditor({ resource: uri_1.URI.revive(resource), options: Object.assign(Object.assign({}, optionsArg), { override: id }) }, group);
        });
    }
    function registerOpenEditorAtIndexCommands() {
        const openEditorAtIndex = (accessor, editorIndex) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane) {
                const editor = activeEditorPane.group.getEditorByIndex(editorIndex);
                if (editor) {
                    editorService.openEditor(editor);
                }
            }
        };
        // This command takes in the editor index number to open as an argument
        commands_1.CommandsRegistry.registerCommand({
            id: exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID,
            handler: openEditorAtIndex
        });
        // Keybindings to focus a specific index in the tab folder if tabs are enabled
        for (let i = 0; i < 9; i++) {
            const editorIndex = i;
            const visibleIndex = i + 1;
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: exports.OPEN_EDITOR_AT_INDEX_COMMAND_ID + visibleIndex,
                weight: 200 /* WorkbenchContrib */,
                when: undefined,
                primary: 512 /* Alt */ | toKeyCode(visibleIndex),
                mac: { primary: 256 /* WinCtrl */ | toKeyCode(visibleIndex) },
                handler: accessor => openEditorAtIndex(accessor, editorIndex)
            });
        }
        function toKeyCode(index) {
            switch (index) {
                case 0: return 21 /* KEY_0 */;
                case 1: return 22 /* KEY_1 */;
                case 2: return 23 /* KEY_2 */;
                case 3: return 24 /* KEY_3 */;
                case 4: return 25 /* KEY_4 */;
                case 5: return 26 /* KEY_5 */;
                case 6: return 27 /* KEY_6 */;
                case 7: return 28 /* KEY_7 */;
                case 8: return 29 /* KEY_8 */;
                case 9: return 30 /* KEY_9 */;
            }
            throw new Error('invalid index');
        }
    }
    function registerFocusEditorGroupAtIndexCommands() {
        // Keybindings to focus a specific group (2-8) in the editor area
        for (let groupIndex = 1; groupIndex < 8; groupIndex++) {
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: toCommandId(groupIndex),
                weight: 200 /* WorkbenchContrib */,
                when: undefined,
                primary: 2048 /* CtrlCmd */ | toKeyCode(groupIndex),
                handler: accessor => {
                    const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                    const configurationService = accessor.get(configuration_1.IConfigurationService);
                    // To keep backwards compatibility (pre-grid), allow to focus a group
                    // that does not exist as long as it is the next group after the last
                    // opened group. Otherwise we return.
                    if (groupIndex > editorGroupService.count) {
                        return;
                    }
                    // Group exists: just focus
                    const groups = editorGroupService.getGroups(2 /* GRID_APPEARANCE */);
                    if (groups[groupIndex]) {
                        return groups[groupIndex].focus();
                    }
                    // Group does not exist: create new by splitting the active one of the last group
                    const direction = (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService);
                    const lastGroup = editorGroupService.findGroup({ location: 1 /* LAST */ });
                    const newGroup = editorGroupService.addGroup(lastGroup, direction);
                    // Focus
                    newGroup.focus();
                }
            });
        }
        function toCommandId(index) {
            switch (index) {
                case 1: return 'workbench.action.focusSecondEditorGroup';
                case 2: return 'workbench.action.focusThirdEditorGroup';
                case 3: return 'workbench.action.focusFourthEditorGroup';
                case 4: return 'workbench.action.focusFifthEditorGroup';
                case 5: return 'workbench.action.focusSixthEditorGroup';
                case 6: return 'workbench.action.focusSeventhEditorGroup';
                case 7: return 'workbench.action.focusEighthEditorGroup';
            }
            throw new Error('Invalid index');
        }
        function toKeyCode(index) {
            switch (index) {
                case 1: return 23 /* KEY_2 */;
                case 2: return 24 /* KEY_3 */;
                case 3: return 25 /* KEY_4 */;
                case 4: return 26 /* KEY_5 */;
                case 5: return 27 /* KEY_6 */;
                case 6: return 28 /* KEY_7 */;
                case 7: return 29 /* KEY_8 */;
            }
            throw new Error('Invalid index');
        }
    }
    function splitEditor(editorGroupService, direction, context) {
        let sourceGroup;
        if (context && typeof context.groupId === 'number') {
            sourceGroup = editorGroupService.getGroup(context.groupId);
        }
        else {
            sourceGroup = editorGroupService.activeGroup;
        }
        if (!sourceGroup) {
            return;
        }
        // Add group
        const newGroup = editorGroupService.addGroup(sourceGroup, direction);
        // Split editor (if it can be split)
        let editorToCopy;
        if (context && typeof context.editorIndex === 'number') {
            editorToCopy = sourceGroup.getEditorByIndex(context.editorIndex);
        }
        else {
            editorToCopy = (0, types_1.withNullAsUndefined)(sourceGroup.activeEditor);
        }
        // Copy the editor to the new group, else move the editor to the new group
        if (editorToCopy && editorToCopy.canSplit()) {
            sourceGroup.copyEditor(editorToCopy, newGroup);
            // Focus
            newGroup.focus();
        }
    }
    exports.splitEditor = splitEditor;
    function registerSplitEditorCommands() {
        [
            { id: exports.SPLIT_EDITOR_UP, direction: 0 /* UP */ },
            { id: exports.SPLIT_EDITOR_DOWN, direction: 1 /* DOWN */ },
            { id: exports.SPLIT_EDITOR_LEFT, direction: 2 /* LEFT */ },
            { id: exports.SPLIT_EDITOR_RIGHT, direction: 3 /* RIGHT */ }
        ].forEach(({ id, direction }) => {
            commands_1.CommandsRegistry.registerCommand(id, function (accessor, resourceOrContext, context) {
                splitEditor(accessor.get(editorGroupsService_1.IEditorGroupsService), direction, getCommandsContext(resourceOrContext, context));
            });
        });
    }
    function registerCloseEditorCommands() {
        // A special handler for "Close Editor" depending on context
        // - keybindining: do not close sticky editors, rather open the next non-sticky editor
        // - menu: always close editor, even sticky ones
        function closeEditorHandler(accessor, forceCloseStickyEditors, resourceOrContext, context) {
            var _a;
            const editorGroupsService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const editorService = accessor.get(editorService_1.IEditorService);
            let keepStickyEditors = true;
            if (forceCloseStickyEditors) {
                keepStickyEditors = false; // explicitly close sticky editors
            }
            else if (resourceOrContext || context) {
                keepStickyEditors = false; // we have a context, as such this command was used e.g. from the tab context menu
            }
            // Without context: skip over sticky editor and select next if active editor is sticky
            if (keepStickyEditors && !resourceOrContext && !context) {
                const activeGroup = editorGroupsService.activeGroup;
                const activeEditor = activeGroup.activeEditor;
                if (activeEditor && activeGroup.isSticky(activeEditor)) {
                    // Open next recently active in same group
                    const nextNonStickyEditorInGroup = activeGroup.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
                    if (nextNonStickyEditorInGroup) {
                        return activeGroup.openEditor(nextNonStickyEditorInGroup);
                    }
                    // Open next recently active across all groups
                    const nextNonStickyEditorInAllGroups = editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
                    if (nextNonStickyEditorInAllGroups) {
                        return Promise.resolve((_a = editorGroupsService.getGroup(nextNonStickyEditorInAllGroups.groupId)) === null || _a === void 0 ? void 0 : _a.openEditor(nextNonStickyEditorInAllGroups.editor));
                    }
                }
            }
            // With context: proceed to close editors as instructed
            const { editors, groups } = getEditorsContext(accessor, resourceOrContext, context);
            return Promise.all(groups.map(async (group) => {
                if (group) {
                    const editorsToClose = (0, arrays_1.coalesce)(editors
                        .filter(editor => editor.groupId === group.id)
                        .map(editor => typeof editor.editorIndex === 'number' ? group.getEditorByIndex(editor.editorIndex) : group.activeEditor))
                        .filter(editor => !keepStickyEditors || !group.isSticky(editor));
                    return group.closeEditors(editorsToClose);
                }
            }));
        }
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITOR_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: 2048 /* CtrlCmd */ | 53 /* KEY_W */,
            win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KEY_W */] },
            handler: (accessor, resourceOrContext, context) => {
                return closeEditorHandler(accessor, false, resourceOrContext, context);
            }
        });
        commands_1.CommandsRegistry.registerCommand(exports.CLOSE_PINNED_EDITOR_COMMAND_ID, (accessor, resourceOrContext, context) => {
            return closeEditorHandler(accessor, true /* force close pinned editors */, resourceOrContext, context);
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 53 /* KEY_W */),
            handler: (accessor, resourceOrContext, context) => {
                return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                    if (group) {
                        return group.closeAllEditors({ excludeSticky: true });
                    }
                }));
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITOR_GROUP_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(editor_1.ActiveEditorGroupEmptyContext, editor_1.MultipleEditorGroupsContext),
            primary: 2048 /* CtrlCmd */ | 53 /* KEY_W */,
            win: { primary: 2048 /* CtrlCmd */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 53 /* KEY_W */] },
            handler: (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const commandsContext = getCommandsContext(resourceOrContext, context);
                let group;
                if (commandsContext && typeof commandsContext.groupId === 'number') {
                    group = editorGroupService.getGroup(commandsContext.groupId);
                }
                else {
                    group = editorGroupService.activeGroup;
                }
                if (group) {
                    editorGroupService.removeGroup(group);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_SAVED_EDITORS_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 51 /* KEY_U */),
            handler: (accessor, resourceOrContext, context) => {
                return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                    if (group) {
                        return group.closeEditors({ savedOnly: true, excludeSticky: true });
                    }
                }));
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 50 /* KEY_T */ },
            handler: (accessor, resourceOrContext, context) => {
                const { editors, groups } = getEditorsContext(accessor, resourceOrContext, context);
                return Promise.all(groups.map(async (group) => {
                    if (group) {
                        const editorsToKeep = editors
                            .filter(editor => editor.groupId === group.id)
                            .map(editor => typeof editor.editorIndex === 'number' ? group.getEditorByIndex(editor.editorIndex) : group.activeEditor);
                        const editorsToClose = group.getEditors(1 /* SEQUENTIAL */, { excludeSticky: true }).filter(editor => !editorsToKeep.includes(editor));
                        for (const editorToKeep of editorsToKeep) {
                            if (editorToKeep) {
                                group.pinEditor(editorToKeep);
                            }
                        }
                        return group.closeEditors(editorsToClose);
                    }
                }));
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    if (group.activeEditor) {
                        group.pinEditor(group.activeEditor);
                    }
                    return group.closeEditors({ direction: 1 /* RIGHT */, except: editor, excludeSticky: true });
                }
            }
        });
        commands_1.CommandsRegistry.registerCommand(exports.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
            const { group } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (group) {
                await group.closeAllEditors();
                if (group.count === 0 && editorGroupService.getGroup(group.id) /* could be gone by now */) {
                    editorGroupService.removeGroup(group); // only remove group if it is now empty
                }
            }
        });
    }
    function registerFocusEditorGroupWihoutWrapCommands() {
        const commands = [
            {
                id: exports.FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 2 /* LEFT */
            },
            {
                id: exports.FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 3 /* RIGHT */
            },
            {
                id: exports.FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 0 /* UP */,
            },
            {
                id: exports.FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,
                direction: 1 /* DOWN */
            }
        ];
        for (const command of commands) {
            commands_1.CommandsRegistry.registerCommand(command.id, async (accessor) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const group = editorGroupService.findGroup({ direction: command.direction }, editorGroupService.activeGroup, false);
                if (group) {
                    group.focus();
                }
            });
        }
    }
    function registerOtherEditorCommands() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.KEEP_EDITOR_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 3 /* Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.pinEditor(editor);
                }
            }
        });
        commands_1.CommandsRegistry.registerCommand({
            id: exports.TOGGLE_KEEP_EDITORS_COMMAND_ID,
            handler: accessor => {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const currentSetting = configurationService.getValue('workbench.editor.enablePreview');
                const newSetting = currentSetting === true ? false : true;
                configurationService.updateValue('workbench.editor.enablePreview', newSetting);
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.PIN_EDITOR_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: editor_1.ActiveEditorStickyContext.toNegated(),
            primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 1024 /* Shift */ | 3 /* Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.stickEditor(editor);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.UNPIN_EDITOR_COMMAND_ID,
            weight: 200 /* WorkbenchContrib */,
            when: editor_1.ActiveEditorStickyContext,
            primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 1024 /* Shift */ | 3 /* Enter */),
            handler: async (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
                if (group && editor) {
                    return group.unstickEditor(editor);
                }
            }
        });
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: exports.SHOW_EDITORS_IN_GROUP,
            weight: 200 /* WorkbenchContrib */,
            when: undefined,
            primary: undefined,
            handler: (accessor, resourceOrContext, context) => {
                const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
                const quickInputService = accessor.get(quickInput_1.IQuickInputService);
                const commandsContext = getCommandsContext(resourceOrContext, context);
                if (commandsContext && typeof commandsContext.groupId === 'number') {
                    const group = editorGroupService.getGroup(commandsContext.groupId);
                    if (group) {
                        editorGroupService.activateGroup(group); // we need the group to be active
                    }
                }
                return quickInputService.quickAccess.show(editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
            }
        });
    }
    function getEditorsContext(accessor, resourceOrContext, context) {
        const editorGroupService = accessor.get(editorGroupsService_1.IEditorGroupsService);
        const listService = accessor.get(listService_1.IListService);
        const editorContext = getMultiSelectedEditorContexts(getCommandsContext(resourceOrContext, context), listService, editorGroupService);
        const activeGroup = editorGroupService.activeGroup;
        if (editorContext.length === 0 && activeGroup.activeEditor) {
            // add the active editor as fallback
            editorContext.push({
                groupId: activeGroup.id,
                editorIndex: activeGroup.getIndexOfEditor(activeGroup.activeEditor)
            });
        }
        return {
            editors: editorContext,
            groups: (0, arrays_1.distinct)(editorContext.map(context => context.groupId)).map(groupId => editorGroupService.getGroup(groupId))
        };
    }
    function getCommandsContext(resourceOrContext, context) {
        if (uri_1.URI.isUri(resourceOrContext)) {
            return context;
        }
        if (resourceOrContext && typeof resourceOrContext.groupId === 'number') {
            return resourceOrContext;
        }
        if (context && typeof context.groupId === 'number') {
            return context;
        }
        return undefined;
    }
    function resolveCommandsContext(editorGroupService, context) {
        // Resolve from context
        let group = context && typeof context.groupId === 'number' ? editorGroupService.getGroup(context.groupId) : undefined;
        let editor = group && context && typeof context.editorIndex === 'number' ? (0, types_1.withNullAsUndefined)(group.getEditorByIndex(context.editorIndex)) : undefined;
        // Fallback to active group as needed
        if (!group) {
            group = editorGroupService.activeGroup;
        }
        // Fallback to active editor as needed
        if (!editor) {
            editor = (0, types_1.withNullAsUndefined)(group.activeEditor);
        }
        return { group, editor };
    }
    function getMultiSelectedEditorContexts(editorContext, listService, editorGroupService) {
        // First check for a focused list to return the selected items from
        const list = listService.lastFocusedList;
        if (list instanceof listWidget_1.List && list.getHTMLElement() === document.activeElement) {
            const elementToContext = (element) => {
                if (isEditorGroup(element)) {
                    return { groupId: element.id, editorIndex: undefined };
                }
                const group = editorGroupService.getGroup(element.groupId);
                return { groupId: element.groupId, editorIndex: group ? group.getIndexOfEditor(element.editor) : -1 };
            };
            const onlyEditorGroupAndEditor = (e) => isEditorGroup(e) || isEditorIdentifier(e);
            const focusedElements = list.getFocusedElements().filter(onlyEditorGroupAndEditor);
            const focus = editorContext ? editorContext : focusedElements.length ? focusedElements.map(elementToContext)[0] : undefined; // need to take into account when editor context is { group: group }
            if (focus) {
                const selection = list.getSelectedElements().filter(onlyEditorGroupAndEditor);
                // Only respect selection if it contains focused element
                if (selection === null || selection === void 0 ? void 0 : selection.some(s => {
                    if (isEditorGroup(s)) {
                        return s.id === focus.groupId;
                    }
                    const group = editorGroupService.getGroup(s.groupId);
                    return s.groupId === focus.groupId && (group ? group.getIndexOfEditor(s.editor) : -1) === focus.editorIndex;
                })) {
                    return selection.map(elementToContext);
                }
                return [focus];
            }
        }
        // Otherwise go with passed in context
        return !!editorContext ? [editorContext] : [];
    }
    exports.getMultiSelectedEditorContexts = getMultiSelectedEditorContexts;
    function isEditorGroup(thing) {
        const group = thing;
        return group && typeof group.id === 'number' && Array.isArray(group.editors);
    }
    function isEditorIdentifier(thing) {
        const identifier = thing;
        return identifier && typeof identifier.groupId === 'number';
    }
    function setup() {
        registerActiveEditorMoveCommand();
        registerEditorGroupsLayoutCommand();
        registerDiffEditorCommands();
        registerOpenEditorAPICommands();
        registerOpenEditorAtIndexCommands();
        registerCloseEditorCommands();
        registerOtherEditorCommands();
        registerFocusEditorGroupAtIndexCommands();
        registerSplitEditorCommands();
        registerFocusEditorGroupWihoutWrapCommands();
    }
    exports.setup = setup;
});
//# sourceMappingURL=editorCommands.js.map