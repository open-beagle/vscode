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
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/editor/contrib/suggest/suggest", "vs/nls!vs/workbench/contrib/preferences/browser/preferences.contribution", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/label/common/label", "vs/platform/registry/common/platform", "vs/platform/workspace/common/workspace", "vs/workbench/browser/actions/workspaceCommands", "vs/workbench/browser/contextkeys", "vs/workbench/browser/editor", "vs/workbench/browser/parts/editor/editor.contribution", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/common/resources", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/preferences/browser/keybindingsEditor", "vs/workbench/contrib/preferences/browser/preferencesActions", "vs/workbench/contrib/preferences/browser/preferencesEditor", "vs/workbench/contrib/preferences/browser/settingsEditor2", "vs/workbench/contrib/preferences/common/preferences", "vs/workbench/contrib/preferences/common/preferencesContribution", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/preferences/common/preferences", "vs/workbench/services/preferences/browser/preferencesEditorInput", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/css!./media/preferences"], function (require, exports, keyCodes_1, lifecycle_1, network_1, uri_1, suggest_1, nls, actions_1, commands_1, contextkey_1, contextkeys_1, descriptors_1, instantiation_1, keybindingsRegistry_1, label_1, platform_1, workspace_1, workspaceCommands_1, contextkeys_2, editor_1, editor_contribution_1, contributions_1, editor_2, resources_1, files_1, keybindingsEditor_1, preferencesActions_1, preferencesEditor_1, settingsEditor2_1, preferences_1, preferencesContribution_1, editorService_1, environmentService_1, extensions_1, preferences_2, preferencesEditorInput_1, preferencesIcons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SETTINGS_EDITOR_COMMAND_SEARCH = 'settings.action.search';
    const SETTINGS_EDITOR_COMMAND_FOCUS_NEXT_SETTING = 'settings.action.focusNextSetting';
    const SETTINGS_EDITOR_COMMAND_FOCUS_PREVIOUS_SETTING = 'settings.action.focusPreviousSetting';
    const SETTINGS_EDITOR_COMMAND_FOCUS_FILE = 'settings.action.focusSettingsFile';
    const SETTINGS_EDITOR_COMMAND_EDIT_FOCUSED_SETTING = 'settings.action.editFocusedSetting';
    const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = 'settings.action.focusSettingsFromSearch';
    const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = 'settings.action.focusSettingsList';
    const SETTINGS_EDITOR_COMMAND_FOCUS_TOC = 'settings.action.focusTOC';
    const SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = 'settings.action.focusSettingControl';
    const SETTINGS_EDITOR_COMMAND_FOCUS_UP = 'settings.action.focusLevelUp';
    const SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = 'settings.switchToJSON';
    const SETTINGS_EDITOR_COMMAND_FILTER_MODIFIED = 'settings.filterByModified';
    const SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = 'settings.filterByOnline';
    const SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = 'settings.filterUntrusted';
    const SETTINGS_COMMAND_OPEN_SETTINGS = 'workbench.action.openSettings';
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(preferencesEditor_1.PreferencesEditor, preferencesEditor_1.PreferencesEditor.ID, nls.localize(0, null)), [
        new descriptors_1.SyncDescriptor(preferencesEditorInput_1.PreferencesEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(settingsEditor2_1.SettingsEditor2, settingsEditor2_1.SettingsEditor2.ID, nls.localize(1, null)), [
        new descriptors_1.SyncDescriptor(preferencesEditorInput_1.SettingsEditor2Input)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(keybindingsEditor_1.KeybindingsEditor, keybindingsEditor_1.KeybindingsEditor.ID, nls.localize(2, null)), [
        new descriptors_1.SyncDescriptor(preferencesEditorInput_1.KeybindingsEditorInput)
    ]);
    // Register Preferences Editor Input Serializer
    class PreferencesEditorInputSerializer extends editor_contribution_1.AbstractSideBySideEditorInputSerializer {
        createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
            return new preferencesEditorInput_1.PreferencesEditorInput(name, description, secondaryInput, primaryInput);
        }
    }
    class KeybindingsEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            const input = editorInput;
            return JSON.stringify({
                name: input.getName(),
                typeId: input.typeId
            });
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.createInstance(preferencesEditorInput_1.KeybindingsEditorInput);
        }
    }
    class SettingsEditor2InputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(input) {
            return '{}';
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.createInstance(preferencesEditorInput_1.SettingsEditor2Input);
        }
    }
    // Register Default Preferences Editor Input Serializer
    class DefaultPreferencesEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            const input = editorInput;
            const serialized = { resource: input.resource.toString() };
            return JSON.stringify(serialized);
        }
        deserialize(instantiationService, serializedEditorInput) {
            const deserialized = JSON.parse(serializedEditorInput);
            return instantiationService.createInstance(preferencesEditorInput_1.DefaultPreferencesEditorInput, uri_1.URI.parse(deserialized.resource));
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(preferencesEditorInput_1.PreferencesEditorInput.ID, PreferencesEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(preferencesEditorInput_1.DefaultPreferencesEditorInput.ID, DefaultPreferencesEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(preferencesEditorInput_1.KeybindingsEditorInput.ID, KeybindingsEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(preferencesEditorInput_1.SettingsEditor2Input.ID, SettingsEditor2InputSerializer);
    const OPEN_SETTINGS2_ACTION_TITLE = { value: nls.localize(3, null), original: 'Open Settings (UI)' };
    const category = { value: nls.localize(4, null), original: 'Preferences' };
    let PreferencesActionsContribution = class PreferencesActionsContribution extends lifecycle_1.Disposable {
        constructor(environmentService, preferencesService, workspaceContextService, labelService, extensionService) {
            super();
            this.environmentService = environmentService;
            this.preferencesService = preferencesService;
            this.workspaceContextService = workspaceContextService;
            this.labelService = labelService;
            this.extensionService = extensionService;
            this.registerSettingsActions();
            this.registerKeybindingsActions();
            this.updatePreferencesEditorMenuItem();
            this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
            this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
        }
        registerSettingsActions() {
            const that = this;
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_COMMAND_OPEN_SETTINGS,
                        title: nls.localize(5, null),
                        keybinding: {
                            weight: 200 /* WorkbenchContrib */,
                            when: null,
                            primary: 2048 /* CtrlCmd */ | 82 /* US_COMMA */,
                        },
                        menu: {
                            id: actions_1.MenuId.GlobalActivity,
                            group: '2_configuration',
                            order: 1
                        }
                    });
                }
                run(accessor, args) {
                    const query = typeof args === 'string' ? args : undefined;
                    return accessor.get(preferences_2.IPreferencesService).openSettings(query ? false : undefined, query);
                }
            });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                group: '1_settings',
                command: {
                    id: SETTINGS_COMMAND_OPEN_SETTINGS,
                    title: nls.localize(6, null)
                },
                order: 1
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openSettings2',
                        title: { value: nls.localize(7, null), original: 'Open Settings (UI)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openSettings(false, undefined);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openSettingsJson',
                        title: { value: nls.localize(8, null), original: 'Open Settings (JSON)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openSettings(true, undefined);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalSettings',
                        title: { value: nls.localize(9, null), original: 'Open User Settings' },
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openGlobalSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openRawDefaultSettings',
                        title: { value: nls.localize(10, null), original: 'Open Default Settings (JSON)' },
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openRawDefaultSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: '_workbench.openUserSettingsEditor',
                        title: OPEN_SETTINGS2_ACTION_TITLE,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        menu: [{
                                id: actions_1.MenuId.EditorTitle,
                                when: resources_1.ResourceContextKey.Resource.isEqualTo(that.environmentService.settingsResource.toString()),
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openGlobalSettings(false);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
                        title: { value: nls.localize(11, null), original: 'Open Settings (JSON)' },
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        menu: [{
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        return editorPane.switchToSettingsFile();
                    }
                    return Promise.resolve(null);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferencesActions_1.ConfigureLanguageBasedSettingsAction.ID,
                        title: preferencesActions_1.ConfigureLanguageBasedSettingsAction.LABEL,
                        category,
                        f1: true,
                    });
                }
                run(accessor) {
                    return accessor.get(instantiation_1.IInstantiationService).createInstance(preferencesActions_1.ConfigureLanguageBasedSettingsAction, preferencesActions_1.ConfigureLanguageBasedSettingsAction.ID, preferencesActions_1.ConfigureLanguageBasedSettingsAction.LABEL.value).run();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettings',
                        title: { value: nls.localize(12, null), original: 'Open Workspace Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openWorkspaceSettingsFile',
                        title: { value: nls.localize(13, null), original: 'Open Workspace Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.notEqualsTo('empty')
                        }
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings(true);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettings',
                        title: { value: nls.localize(14, null), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    const preferencesService = accessor.get(preferences_2.IPreferencesService);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
                    if (workspaceFolder) {
                        await preferencesService.openFolderSettings(workspaceFolder.uri);
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openFolderSettingsFile',
                        title: { value: nls.localize(15, null), original: 'Open Folder Settings (JSON)' },
                        category,
                        menu: {
                            id: actions_1.MenuId.CommandPalette,
                            when: contextkeys_2.WorkbenchStateContext.isEqualTo('workspace')
                        }
                    });
                }
                async run(accessor) {
                    const commandService = accessor.get(commands_1.ICommandService);
                    const preferencesService = accessor.get(preferences_2.IPreferencesService);
                    const workspaceFolder = await commandService.executeCommand(workspaceCommands_1.PICK_WORKSPACE_FOLDER_COMMAND_ID);
                    if (workspaceFolder) {
                        await preferencesService.openFolderSettings(workspaceFolder.uri, true);
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: '_workbench.action.openFolderSettings',
                        title: { value: nls.localize(16, null), original: 'Open Folder Settings' },
                        category,
                        menu: {
                            id: actions_1.MenuId.ExplorerContext,
                            group: '2_workspace',
                            order: 20,
                            when: contextkey_1.ContextKeyExpr.and(files_1.ExplorerRootContext, files_1.ExplorerFolderContext)
                        }
                    });
                }
                run(accessor, resource) {
                    return accessor.get(preferences_2.IPreferencesService).openFolderSettings(resource);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_MODIFIED,
                        title: { value: nls.localize(17, null), original: 'Show modified settings' },
                        menu: {
                            id: actions_1.MenuId.EditorTitle,
                            group: '1_filter',
                            order: 1,
                            when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated())
                        }
                    });
                }
                run(accessor, resource) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        editorPane.focusSearch(`@${preferences_1.MODIFIED_SETTING_TAG}`);
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                        title: { value: nls.localize(18, null), original: 'Show settings for online services' },
                        menu: {
                            id: actions_1.MenuId.EditorTitle,
                            group: '1_filter',
                            order: 2,
                            when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated())
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof settingsEditor2_1.SettingsEditor2) {
                        editorPane.focusSearch(`@tag:usesOnlineServices`);
                    }
                    else {
                        accessor.get(preferences_2.IPreferencesService).openSettings(false, '@tag:usesOnlineServices');
                    }
                }
            });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                group: '1_settings',
                command: {
                    id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                    title: nls.localize(19, null)
                },
                order: 2
            });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                group: '2_configuration',
                command: {
                    id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                    title: nls.localize(20, null)
                },
                order: 2
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
                        title: { value: nls.localize(21, null), original: 'Show untrusted workspace settings' },
                    });
                }
                run(accessor) {
                    accessor.get(preferences_2.IPreferencesService).openWorkspaceSettings(false, { query: `@tag:${preferences_1.REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}` });
                }
            });
            this.registerSettingsEditorActions();
            this.extensionService.whenInstalledExtensionsRegistered()
                .then(() => {
                const remoteAuthority = this.environmentService.remoteAuthority;
                const hostLabel = this.labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
                const label = nls.localize(22, null, hostLabel);
                (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.action.openRemoteSettings',
                            title: { value: label, original: `Open Remote Settings (${hostLabel})` },
                            category,
                            menu: {
                                id: actions_1.MenuId.CommandPalette,
                                when: contextkeys_2.RemoteNameContext.notEqualsTo('')
                            }
                        });
                    }
                    run(accessor) {
                        return accessor.get(preferences_2.IPreferencesService).openRemoteSettings();
                    }
                });
            });
        }
        registerSettingsEditorActions() {
            function getPreferencesEditor(accessor) {
                const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                if (activeEditorPane instanceof preferencesEditor_1.PreferencesEditor || activeEditorPane instanceof settingsEditor2_1.SettingsEditor2) {
                    return activeEditorPane;
                }
                return null;
            }
            function settingsEditorFocusSearch(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (preferencesEditor) {
                    preferencesEditor.focusSearch();
                }
            }
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SEARCH,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */,
                            weight: 100 /* EditorContrib */,
                            when: null
                        },
                        category,
                        f1: true,
                        title: nls.localize(23, null)
                    });
                }
                run(accessor) { settingsEditorFocusSearch(accessor); }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 9 /* Escape */,
                            weight: 100 /* EditorContrib */,
                            when: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS
                        },
                        category,
                        f1: true,
                        title: nls.localize(24, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor) {
                        preferencesEditor.clearSearchResults();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS, suggest_1.Context.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* DownArrow */,
                            weight: 100 /* EditorContrib */,
                            when: null
                        },
                        title: nls.localize(25, null)
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof preferencesEditor_1.PreferencesEditor) {
                        preferencesEditor.focusSettingsFileEditor();
                    }
                    else if (preferencesEditor) {
                        preferencesEditor.focusSettings();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS, suggest_1.Context.Visible.toNegated()),
                        keybinding: {
                            primary: 18 /* DownArrow */,
                            weight: 200 /* WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize(26, null)
                    });
                }
                run(accessor, args) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof preferencesEditor_1.PreferencesEditor) {
                        preferencesEditor.focusSettingsFileEditor();
                    }
                    else if (preferencesEditor) {
                        preferencesEditor.focusSettings();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_NEXT_SETTING,
                        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
                        keybinding: {
                            primary: 3 /* Enter */,
                            weight: 100 /* EditorContrib */,
                            when: null
                        },
                        title: nls.localize(27, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof preferencesEditor_1.PreferencesEditor) {
                        preferencesEditor.focusNextResult();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_PREVIOUS_SETTING,
                        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
                        keybinding: {
                            primary: 1024 /* Shift */ | 3 /* Enter */,
                            weight: 100 /* EditorContrib */,
                            when: null
                        },
                        title: nls.localize(28, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof preferencesEditor_1.PreferencesEditor) {
                        preferencesEditor.focusPreviousResult();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_EDIT_FOCUSED_SETTING,
                        precondition: preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS,
                        keybinding: {
                            primary: 2048 /* CtrlCmd */ | 84 /* US_DOT */,
                            weight: 100 /* EditorContrib */,
                            when: null
                        },
                        title: nls.localize(29, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof preferencesEditor_1.PreferencesEditor) {
                        preferencesEditor.editFocusedPreference();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_TOC_ROW_FOCUS),
                        keybinding: {
                            primary: 3 /* Enter */,
                            weight: 200 /* WorkbenchContrib */,
                            when: null
                        },
                        title: nls.localize(30, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.SettingsEditor2) {
                        preferencesEditor.focusSettings();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        f1: true,
                        keybinding: [
                            {
                                primary: 15 /* LeftArrow */,
                                weight: 200 /* WorkbenchContrib */,
                                when: preferences_1.CONTEXT_SETTINGS_ROW_FOCUS
                            }
                        ],
                        category,
                        title: nls.localize(31, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    preferencesEditor.focusTOC();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
                        precondition: preferences_1.CONTEXT_SETTINGS_ROW_FOCUS,
                        keybinding: {
                            primary: 3 /* Enter */,
                            weight: 200 /* WorkbenchContrib */,
                        },
                        title: nls.localize(32, null)
                    });
                }
                run(accessor) {
                    var _a;
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    if ((_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.classList.contains('monaco-list')) {
                        preferencesEditor.focusSettings(true);
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
                        precondition: preferences_1.CONTEXT_SETTINGS_EDITOR,
                        keybinding: {
                            primary: 1024 /* Shift */ | 67 /* F9 */,
                            weight: 200 /* WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: nls.localize(33, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (preferencesEditor instanceof settingsEditor2_1.SettingsEditor2) {
                        preferencesEditor.showContextMenu();
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
                        precondition: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_SETTINGS_EDITOR, preferences_1.CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(), preferences_1.CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
                        keybinding: {
                            primary: 9 /* Escape */,
                            weight: 200 /* WorkbenchContrib */,
                            when: null
                        },
                        f1: true,
                        category,
                        title: nls.localize(34, null)
                    });
                }
                run(accessor) {
                    const preferencesEditor = getPreferencesEditor(accessor);
                    if (!(preferencesEditor instanceof settingsEditor2_1.SettingsEditor2)) {
                        return;
                    }
                    if (preferencesEditor.currentFocusContext === 3 /* SettingControl */) {
                        preferencesEditor.focusSettings();
                    }
                    else if (preferencesEditor.currentFocusContext === 2 /* SettingTree */) {
                        preferencesEditor.focusTOC();
                    }
                    else if (preferencesEditor.currentFocusContext === 1 /* TableOfContents */) {
                        preferencesEditor.focusSearch();
                    }
                }
            });
        }
        registerKeybindingsActions() {
            const that = this;
            const category = { value: nls.localize(35, null), original: 'Preferences' };
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalKeybindings',
                        title: { value: nls.localize(36, null), original: 'Open Keyboard Shortcuts' },
                        category,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        keybinding: {
                            when: null,
                            weight: 200 /* WorkbenchContrib */,
                            primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 49 /* KEY_S */)
                        },
                        menu: [
                            { id: actions_1.MenuId.CommandPalette },
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: resources_1.ResourceContextKey.Resource.isEqualTo(that.environmentService.keybindingsResource.toString()),
                                group: 'navigation',
                                order: 1,
                            }
                        ]
                    });
                }
                run(accessor, args) {
                    const query = typeof args === 'string' ? args : undefined;
                    return accessor.get(preferences_2.IPreferencesService).openGlobalKeybindingSettings(false, { query });
                }
            });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
                command: {
                    id: 'workbench.action.openGlobalKeybindings',
                    title: { value: nls.localize(37, null), original: 'Keyboard Shortcuts' }
                },
                group: '2_keybindings',
                order: 1
            });
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarPreferencesMenu, {
                command: {
                    id: 'workbench.action.openGlobalKeybindings',
                    title: { value: nls.localize(38, null), original: 'Keyboard Shortcuts' }
                },
                group: '2_keybindings',
                order: 1
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openDefaultKeybindingsFile',
                        title: { value: nls.localize(39, null), original: 'Open Default Keyboard Shortcuts (JSON)' },
                        category,
                        menu: { id: actions_1.MenuId.CommandPalette }
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openDefaultKeybindingsFile();
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalKeybindingsFile',
                        title: { value: nls.localize(40, null), original: 'Open Keyboard Shortcuts (JSON)' },
                        category,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon,
                        menu: [
                            { id: actions_1.MenuId.CommandPalette },
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: 'navigation',
                            }
                        ]
                    });
                }
                run(accessor) {
                    return accessor.get(preferences_2.IPreferencesService).openGlobalKeybindingSettings(true);
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
                        title: { value: nls.localize(41, null), original: 'Show Default Keybindings' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:default');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
                        title: { value: nls.localize(42, null), original: 'Show Extension Keybindings' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:extension');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
                        title: { value: nls.localize(43, null), original: 'Show User Keybindings' },
                        menu: [
                            {
                                id: actions_1.MenuId.EditorTitle,
                                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                                group: '1_keyboard_preferences_actions'
                            }
                        ]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.search('@source:user');
                    }
                }
            });
            (0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super({
                        id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                        title: nls.localize(44, null),
                        keybinding: {
                            weight: 200 /* WorkbenchContrib */,
                            when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                            primary: 9 /* Escape */,
                        }
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.clearSearchResults();
                    }
                }
            });
            this.registerKeybindingEditorActions();
        }
        registerKeybindingEditorActions() {
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 3 /* Enter */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_ADD,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 31 /* KEY_A */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 35 /* KEY_E */),
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
                        editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_REMOVE,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 20 /* Delete */,
                mac: {
                    primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
                },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RESET,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SEARCH,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.focusSearch();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                primary: 512 /* Alt */ | 41 /* KEY_K */,
                mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 41 /* KEY_K */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.recordSearchKeys();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR),
                primary: 512 /* Alt */ | 46 /* KEY_P */,
                mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 46 /* KEY_P */ },
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.toggleSortByPrecedence();
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDING_FOCUS),
                primary: 0,
                handler: async (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
                    }
                }
            });
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: preferences_1.KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(preferences_1.CONTEXT_KEYBINDINGS_EDITOR, preferences_1.CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
                handler: (accessor, args) => {
                    const editorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
                    if (editorPane instanceof keybindingsEditor_1.KeybindingsEditor) {
                        editorPane.focusKeybindings();
                    }
                }
            });
        }
        updatePreferencesEditorMenuItem() {
            const commandId = '_workbench.openWorkspaceSettingsEditor';
            if (this.workspaceContextService.getWorkbenchState() === 3 /* WORKSPACE */ && !commands_1.CommandsRegistry.getCommand(commandId)) {
                commands_1.CommandsRegistry.registerCommand(commandId, () => this.preferencesService.openWorkspaceSettings(false));
                actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
                    command: {
                        id: commandId,
                        title: OPEN_SETTINGS2_ACTION_TITLE,
                        icon: preferencesIcons_1.preferencesOpenSettingsIcon
                    },
                    when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.Resource.isEqualTo(this.preferencesService.workspaceSettingsResource.toString()), contextkeys_2.WorkbenchStateContext.isEqualTo('workspace')),
                    group: 'navigation',
                    order: 1
                });
            }
            this.updatePreferencesEditorMenuItemForWorkspaceFolders();
        }
        updatePreferencesEditorMenuItemForWorkspaceFolders() {
            for (const folder of this.workspaceContextService.getWorkspace().folders) {
                const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
                if (!commands_1.CommandsRegistry.getCommand(commandId)) {
                    commands_1.CommandsRegistry.registerCommand(commandId, () => {
                        if (this.workspaceContextService.getWorkbenchState() === 2 /* FOLDER */) {
                            return this.preferencesService.openWorkspaceSettings(false);
                        }
                        else {
                            return this.preferencesService.openFolderSettings(folder.uri, false);
                        }
                    });
                    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
                        command: {
                            id: commandId,
                            title: OPEN_SETTINGS2_ACTION_TITLE,
                            icon: preferencesIcons_1.preferencesOpenSettingsIcon
                        },
                        when: contextkey_1.ContextKeyExpr.and(resources_1.ResourceContextKey.Resource.isEqualTo(this.preferencesService.getFolderSettingsResource(folder.uri).toString())),
                        group: 'navigation',
                        order: 1
                    });
                }
            }
        }
    };
    PreferencesActionsContribution = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, preferences_2.IPreferencesService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, label_1.ILabelService),
        __param(4, extensions_1.IExtensionService)
    ], PreferencesActionsContribution);
    const workbenchContributionsRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchContributionsRegistry.registerWorkbenchContribution(PreferencesActionsContribution, 1 /* Starting */);
    workbenchContributionsRegistry.registerWorkbenchContribution(preferencesContribution_1.PreferencesContribution, 1 /* Starting */);
    // Preferences menu
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
        title: nls.localize(45, null),
        submenu: actions_1.MenuId.MenubarPreferencesMenu,
        group: '5_autosave',
        order: 2,
        when: contextkeys_1.IsMacNativeContext.toNegated() // on macOS native the preferences menu is separate under the application menu
    });
});
//# sourceMappingURL=preferences.contribution.js.map