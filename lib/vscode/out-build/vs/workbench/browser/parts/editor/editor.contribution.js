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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/browser/parts/editor/editor.contribution", "vs/base/common/uri", "vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/workbench/common/editor/diffEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/workbench/browser/parts/editor/untitledHint", "vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/browser/parts/editor/editorStatus", "vs/workbench/common/actions", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/descriptors", "vs/base/common/keyCodes", "vs/workbench/browser/parts/editor/editorActions", "vs/workbench/browser/parts/editor/editorCommands", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/quickaccess", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/contextkey/common/contextkey", "vs/base/common/platform", "vs/editor/browser/editorExtensions", "vs/workbench/browser/codeeditor", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/workbench/common/contributions", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/browser/parts/editor/editorAutoSave", "vs/platform/theme/common/themeService", "vs/editor/common/modes/modesRegistry", "vs/platform/quickinput/common/quickAccess", "vs/workbench/browser/parts/editor/editorQuickAccess", "vs/workbench/services/path/common/pathService", "vs/base/common/network", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry"], function (require, exports, platform_1, nls_1, uri_1, editor_1, editor_2, textResourceEditor_1, sideBySideEditor_1, diffEditorInput_1, untitledTextEditorInput_1, resourceEditorInput_1, textDiffEditor_1, untitledHint_1, binaryDiffEditor_1, editorStatus_1, actions_1, actions_2, descriptors_1, keyCodes_1, editorActions_1, editorCommands_1, editorService_1, quickaccess_1, keybindingsRegistry_1, contextkey_1, platform_2, editorExtensions_1, codeeditor_1, environmentService_1, resources_1, contributions_1, filesConfigurationService_1, editorAutoSave_1, themeService_1, modesRegistry_1, quickAccess_1, editorQuickAccess_1, pathService_1, network_1, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractSideBySideEditorInputSerializer = void 0;
    // Register String Editor
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(textResourceEditor_1.TextResourceEditor, textResourceEditor_1.TextResourceEditor.ID, (0, nls_1.localize)(0, null)), [
        new descriptors_1.SyncDescriptor(untitledTextEditorInput_1.UntitledTextEditorInput),
        new descriptors_1.SyncDescriptor(resourceEditorInput_1.ResourceEditorInput)
    ]);
    // Register Text Diff Editor
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(textDiffEditor_1.TextDiffEditor, textDiffEditor_1.TextDiffEditor.ID, (0, nls_1.localize)(1, null)), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    // Register Binary Resource Diff Editor
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(binaryDiffEditor_1.BinaryResourceDiffEditor, binaryDiffEditor_1.BinaryResourceDiffEditor.ID, (0, nls_1.localize)(2, null)), [
        new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
    ]);
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(sideBySideEditor_1.SideBySideEditor, sideBySideEditor_1.SideBySideEditor.ID, (0, nls_1.localize)(3, null)), [
        new descriptors_1.SyncDescriptor(editor_2.SideBySideEditorInput)
    ]);
    // Register Editor Input Serializer
    let UntitledTextEditorInputSerializer = class UntitledTextEditorInputSerializer {
        constructor(filesConfigurationService, environmentService, pathService) {
            this.filesConfigurationService = filesConfigurationService;
            this.environmentService = environmentService;
            this.pathService = pathService;
        }
        canSerialize(editorInput) {
            return this.filesConfigurationService.isHotExitEnabled && !editorInput.isDisposed();
        }
        serialize(editorInput) {
            if (!this.filesConfigurationService.isHotExitEnabled || editorInput.isDisposed()) {
                return undefined;
            }
            const untitledTextEditorInput = editorInput;
            let resource = untitledTextEditorInput.resource;
            if (untitledTextEditorInput.model.hasAssociatedFilePath) {
                resource = (0, resources_1.toLocalResource)(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme); // untitled with associated file path use the local schema
            }
            // Mode: only remember mode if it is either specific (not text)
            // or if the mode was explicitly set by the user. We want to preserve
            // this information across restarts and not set the mode unless
            // this is the case.
            let modeId;
            const modeIdCandidate = untitledTextEditorInput.getMode();
            if (modeIdCandidate !== modesRegistry_1.PLAINTEXT_MODE_ID) {
                modeId = modeIdCandidate;
            }
            else if (untitledTextEditorInput.model.hasModeSetExplicitly) {
                modeId = modeIdCandidate;
            }
            const serialized = {
                resourceJSON: resource.toJSON(),
                modeId,
                encoding: untitledTextEditorInput.getEncoding()
            };
            return JSON.stringify(serialized);
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(accessor => {
                const deserialized = JSON.parse(serializedEditorInput);
                const resource = uri_1.URI.revive(deserialized.resourceJSON);
                const mode = deserialized.modeId;
                const encoding = deserialized.encoding;
                return accessor.get(editorService_1.IEditorService).createEditorInput({ resource, mode, encoding, forceUntitled: true });
            });
        }
    };
    UntitledTextEditorInputSerializer = __decorate([
        __param(0, filesConfigurationService_1.IFilesConfigurationService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, pathService_1.IPathService)
    ], UntitledTextEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(untitledTextEditorInput_1.UntitledTextEditorInput.ID, UntitledTextEditorInputSerializer);
    class AbstractSideBySideEditorInputSerializer {
        getInputSerializers(secondaryEditorInputTypeId, primaryEditorInputTypeId) {
            const registry = platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories);
            return [registry.getEditorInputSerializer(secondaryEditorInputTypeId), registry.getEditorInputSerializer(primaryEditorInputTypeId)];
        }
        canSerialize(editorInput) {
            const input = editorInput;
            if (input.primary && input.secondary) {
                const [secondaryInputSerializer, primaryInputSerializer] = this.getInputSerializers(input.secondary.typeId, input.primary.typeId);
                return !!((secondaryInputSerializer === null || secondaryInputSerializer === void 0 ? void 0 : secondaryInputSerializer.canSerialize(input.secondary)) && (primaryInputSerializer === null || primaryInputSerializer === void 0 ? void 0 : primaryInputSerializer.canSerialize(input.primary)));
            }
            return false;
        }
        serialize(editorInput) {
            const input = editorInput;
            if (input.primary && input.secondary) {
                const [secondaryInputSerializer, primaryInputSerializer] = this.getInputSerializers(input.secondary.typeId, input.primary.typeId);
                if (primaryInputSerializer && secondaryInputSerializer) {
                    const primarySerialized = primaryInputSerializer.serialize(input.primary);
                    const secondarySerialized = secondaryInputSerializer.serialize(input.secondary);
                    if (primarySerialized && secondarySerialized) {
                        const serializedEditorInput = {
                            name: input.getName(),
                            description: input.getDescription(),
                            primarySerialized: primarySerialized,
                            secondarySerialized: secondarySerialized,
                            primaryTypeId: input.primary.typeId,
                            secondaryTypeId: input.secondary.typeId
                        };
                        return JSON.stringify(serializedEditorInput);
                    }
                }
            }
            return undefined;
        }
        deserialize(instantiationService, serializedEditorInput) {
            const deserialized = JSON.parse(serializedEditorInput);
            const [secondaryInputSerializer, primaryInputSerializer] = this.getInputSerializers(deserialized.secondaryTypeId, deserialized.primaryTypeId);
            if (primaryInputSerializer && secondaryInputSerializer) {
                const primaryInput = primaryInputSerializer.deserialize(instantiationService, deserialized.primarySerialized);
                const secondaryInput = secondaryInputSerializer.deserialize(instantiationService, deserialized.secondarySerialized);
                if (primaryInput && secondaryInput) {
                    return this.createEditorInput(instantiationService, deserialized.name, deserialized.description, secondaryInput, primaryInput);
                }
            }
            return undefined;
        }
    }
    exports.AbstractSideBySideEditorInputSerializer = AbstractSideBySideEditorInputSerializer;
    class SideBySideEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
        createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
            return new editor_2.SideBySideEditorInput(name, description, secondaryInput, primaryInput);
        }
    }
    class DiffEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
        createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
            return instantiationService.createInstance(diffEditorInput_1.DiffEditorInput, name, description, secondaryInput, primaryInput, undefined);
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(editor_2.SideBySideEditorInput.ID, SideBySideEditorInputSerializer);
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(diffEditorInput_1.DiffEditorInput.ID, DiffEditorInputSerializer);
    // Register Editor Contributions
    (0, editorExtensions_1.registerEditorContribution)(codeeditor_1.OpenWorkspaceButtonContribution.ID, codeeditor_1.OpenWorkspaceButtonContribution);
    // Register Editor Status
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorStatus_1.EditorStatus, 2 /* Ready */);
    // Register Editor Auto Save
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(editorAutoSave_1.EditorAutoSave, 2 /* Ready */);
    // Register Untitled Hint
    (0, editorExtensions_1.registerEditorContribution)(untitledHint_1.UntitledHintContribution.ID, untitledHint_1.UntitledHintContribution);
    // Register Status Actions
    const registry = platform_1.Registry.as(actions_1.Extensions.WorkbenchActions);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorStatus_1.ChangeModeAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 43 /* KEY_M */) }), 'Change Language Mode', undefined, contextkey_1.ContextKeyExpr.not('notebookEditorFocused'));
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorStatus_1.ChangeEOLAction), 'Change End of Line Sequence');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorStatus_1.ChangeEncodingAction), 'Change File Encoding');
    // Register Editor Quick Access
    const quickAccessRegistry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
    const editorPickerContextKey = 'inEditorsPicker';
    const editorPickerContext = contextkey_1.ContextKeyExpr.and(quickaccess_1.inQuickPickContext, contextkey_1.ContextKeyExpr.has(editorPickerContextKey));
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess,
        prefix: editorQuickAccess_1.ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)(4, null),
        helpEntries: [{ description: (0, nls_1.localize)(5, null), needsEditor: false }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.AllEditorsByAppearanceQuickAccess,
        prefix: editorQuickAccess_1.AllEditorsByAppearanceQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)(6, null),
        helpEntries: [{ description: (0, nls_1.localize)(7, null), needsEditor: false }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess,
        prefix: editorQuickAccess_1.AllEditorsByMostRecentlyUsedQuickAccess.PREFIX,
        contextKey: editorPickerContextKey,
        placeholder: (0, nls_1.localize)(8, null),
        helpEntries: [{ description: (0, nls_1.localize)(9, null), needsEditor: false }]
    });
    // Register Editor Actions
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenNextEditor, { primary: 2048 /* CtrlCmd */ | 12 /* PageDown */, mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */] } }), 'View: Open Next Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenPreviousEditor, { primary: 2048 /* CtrlCmd */ | 11 /* PageUp */, mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 87 /* US_OPEN_SQUARE_BRACKET */] } }), 'View: Open Previous Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenNextEditorInGroup, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 12 /* PageDown */), mac: { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */) } }), 'View: Open Next Editor in Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenPreviousEditorInGroup, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 11 /* PageUp */), mac: { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */) } }), 'View: Open Previous Editor in Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenNextRecentlyUsedEditorAction), 'View: Open Next Recently Used Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenPreviousRecentlyUsedEditorAction), 'View: Open Previous Recently Used Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenNextRecentlyUsedEditorInGroupAction), 'View: Open Next Recently Used Editor In Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenPreviousRecentlyUsedEditorInGroupAction), 'View: Open Previous Recently Used Editor In Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenFirstEditorInGroup), 'View: Open First Editor in Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.OpenLastEditorInGroup, { primary: 512 /* Alt */ | 21 /* KEY_0 */, secondary: [2048 /* CtrlCmd */ | 30 /* KEY_9 */], mac: { primary: 256 /* WinCtrl */ | 21 /* KEY_0 */, secondary: [2048 /* CtrlCmd */ | 30 /* KEY_9 */] } }), 'View: Open Last Editor in Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ReopenClosedEditorAction, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 50 /* KEY_T */ }), 'View: Reopen Closed Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ShowAllEditorsByAppearanceAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 46 /* KEY_P */), mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 2 /* Tab */ } }), 'View: Show All Editors By Appearance', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ShowAllEditorsByMostRecentlyUsedAction), 'View: Show All Editors By Most Recently Used', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ShowEditorsInActiveGroupByMostRecentlyUsedAction), 'View: Show Editors in Active Group By Most Recently Used', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ClearRecentFilesAction), 'File: Clear Recently Opened', (0, nls_1.localize)(10, null));
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.CloseAllEditorsAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 53 /* KEY_W */) }), 'View: Close All Editors', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.CloseAllEditorGroupsAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KEY_W */) }), 'View: Close All Editor Groups', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.CloseLeftEditorsInGroupAction), 'View: Close Editors to the Left in Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.CloseEditorsInOtherGroupsAction), 'View: Close Editors in Other Groups', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.CloseEditorInAllGroupsAction), 'View: Close Editor in All Groups', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.SplitEditorAction, { primary: 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */ }), 'View: Split Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.SplitEditorOrthogonalAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */) }), 'View: Split Editor Orthogonal', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.SplitEditorLeftAction), 'View: Split Editor Left', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.SplitEditorRightAction), 'View: Split Editor Right', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.SplitEditorUpAction), 'Split Editor Up', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.SplitEditorDownAction), 'View: Split Editor Down', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.JoinTwoGroupsAction), 'View: Join Editor Group with Next Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.JoinAllGroupsAction), 'View: Join All Editor Groups', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NavigateBetweenGroupsAction), 'View: Navigate Between Editor Groups', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ResetGroupSizesAction), 'View: Reset Editor Group Sizes', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ToggleGroupSizesAction), 'View: Toggle Editor Group Sizes', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MaximizeGroupAction), 'View: Maximize Editor Group and Hide Side Bar', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MinimizeOtherGroupsAction), 'View: Maximize Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorLeftInGroupAction, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 11 /* PageUp */, mac: { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */) } }), 'View: Move Editor Left', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorRightInGroupAction, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 12 /* PageDown */, mac: { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */) } }), 'View: Move Editor Right', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveGroupLeftAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 15 /* LeftArrow */) }), 'View: Move Editor Group Left', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveGroupRightAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 17 /* RightArrow */) }), 'View: Move Editor Group Right', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveGroupUpAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 16 /* UpArrow */) }), 'View: Move Editor Group Up', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveGroupDownAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 18 /* DownArrow */) }), 'View: Move Editor Group Down', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.DuplicateGroupLeftAction), 'View: Duplicate Editor Group Left', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.DuplicateGroupRightAction), 'View: Duplicate Editor Group Right', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.DuplicateGroupUpAction), 'View: Duplicate Editor Group Up', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.DuplicateGroupDownAction), 'View: Duplicate Editor Group Down', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToPreviousGroupAction, { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 15 /* LeftArrow */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 15 /* LeftArrow */ } }), 'View: Move Editor into Previous Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToNextGroupAction, { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 17 /* RightArrow */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 17 /* RightArrow */ } }), 'View: Move Editor into Next Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToFirstGroupAction, { primary: 1024 /* Shift */ | 512 /* Alt */ | 22 /* KEY_1 */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 22 /* KEY_1 */ } }), 'View: Move Editor into First Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToLastGroupAction, { primary: 1024 /* Shift */ | 512 /* Alt */ | 30 /* KEY_9 */, mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 30 /* KEY_9 */ } }), 'View: Move Editor into Last Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToLeftGroupAction), 'View: Move Editor into Left Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToRightGroupAction), 'View: Move Editor into Right Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToAboveGroupAction), 'View: Move Editor into Above Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.MoveEditorToBelowGroupAction), 'View: Move Editor into Below Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusActiveGroupAction), 'View: Focus Active Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusFirstGroupAction, { primary: 2048 /* CtrlCmd */ | 22 /* KEY_1 */ }), 'View: Focus First Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusLastGroupAction), 'View: Focus Last Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusPreviousGroup), 'View: Focus Previous Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusNextGroup), 'View: Focus Next Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusLeftGroup, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 15 /* LeftArrow */) }), 'View: Focus Left Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusRightGroup, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 17 /* RightArrow */) }), 'View: Focus Right Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusAboveGroup, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 16 /* UpArrow */) }), 'View: Focus Above Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.FocusBelowGroup, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 18 /* DownArrow */) }), 'View: Focus Below Editor Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NewEditorGroupLeftAction), 'View: New Editor Group to the Left', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NewEditorGroupRightAction), 'View: New Editor Group to the Right', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NewEditorGroupAboveAction), 'View: New Editor Group Above', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NewEditorGroupBelowAction), 'View: New Editor Group Below', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NavigateForwardAction, { primary: 0, win: { primary: 512 /* Alt */ | 17 /* RightArrow */ }, mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 83 /* US_MINUS */ }, linux: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 83 /* US_MINUS */ } }), 'Go Forward');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NavigateBackwardsAction, { primary: 0, win: { primary: 512 /* Alt */ | 15 /* LeftArrow */ }, mac: { primary: 256 /* WinCtrl */ | 83 /* US_MINUS */ }, linux: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 83 /* US_MINUS */ } }), 'Go Back');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NavigateToLastEditLocationAction, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 47 /* KEY_Q */) }), 'Go to Last Edit Location');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.NavigateLastAction), 'Go Last');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ClearEditorHistoryAction), 'Clear Editor History');
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.RevertAndCloseEditorAction), 'View: Revert and Close Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutSingleAction), 'View: Single Column Editor Layout', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutTwoColumnsAction), 'View: Two Columns Editor Layout', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutThreeColumnsAction), 'View: Three Columns Editor Layout', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutTwoRowsAction), 'View: Two Rows Editor Layout', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutThreeRowsAction), 'View: Three Rows Editor Layout', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutTwoByTwoGridAction), 'View: Grid Editor Layout (2x2)', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutTwoRowsRightAction), 'View: Two Rows Right Editor Layout', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.EditorLayoutTwoColumnsBottomAction), 'View: Two Columns Bottom Editor Layout', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ReopenResourcesAction), 'View: Reopen Editor With...', actions_1.CATEGORIES.View.value, editor_2.ActiveEditorAvailableEditorIdsContext);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.ToggleEditorTypeAction), 'View: Toggle Editor Type', actions_1.CATEGORIES.View.value, editor_2.ActiveEditorAvailableEditorIdsContext);
    // Register Quick Editor Actions including built in quick navigate support for some
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.QuickAccessPreviousRecentlyUsedEditorAction), 'View: Quick Open Previous Recently Used Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.QuickAccessLeastRecentlyUsedEditorAction), 'View: Quick Open Least Recently Used Editor', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.QuickAccessPreviousRecentlyUsedEditorInGroupAction, { primary: 2048 /* CtrlCmd */ | 2 /* Tab */, mac: { primary: 256 /* WinCtrl */ | 2 /* Tab */ } }), 'View: Quick Open Previous Recently Used Editor in Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.QuickAccessLeastRecentlyUsedEditorInGroupAction, { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */, mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */ } }), 'View: Quick Open Least Recently Used Editor in Group', actions_1.CATEGORIES.View.value);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(editorActions_1.QuickAccessPreviousEditorFromHistoryAction), 'Quick Open Previous Editor from History');
    const quickAccessNavigateNextInEditorPickerId = 'workbench.action.quickOpenNavigateNextInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInEditorPickerId,
        weight: 200 /* WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInEditorPickerId, true),
        when: editorPickerContext,
        primary: 2048 /* CtrlCmd */ | 2 /* Tab */,
        mac: { primary: 256 /* WinCtrl */ | 2 /* Tab */ }
    });
    const quickAccessNavigatePreviousInEditorPickerId = 'workbench.action.quickOpenNavigatePreviousInEditorPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInEditorPickerId,
        weight: 200 /* WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInEditorPickerId, false),
        when: editorPickerContext,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 2 /* Tab */,
        mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 2 /* Tab */ }
    });
    // Editor Commands
    (0, editorCommands_1.setup)();
    // Touch Bar
    if (platform_2.isMacintosh) {
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateBackwardsAction.ID, title: editorActions_1.NavigateBackwardsAction.LABEL, icon: { dark: network_1.FileAccess.asFileUri('vs/workbench/browser/parts/editor/media/back-tb.png', require) } },
            group: 'navigation',
            order: 0
        });
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.TouchBarContext, {
            command: { id: editorActions_1.NavigateForwardAction.ID, title: editorActions_1.NavigateForwardAction.LABEL, icon: { dark: network_1.FileAccess.asFileUri('vs/workbench/browser/parts/editor/media/forward-tb.png', require) } },
            group: 'navigation',
            order: 1
        });
    }
    // Empty Editor Group Context Menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)(11, null) }, group: '2_split', order: 10 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)(12, null) }, group: '2_split', order: 20 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)(13, null) }, group: '2_split', order: 30 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)(14, null) }, group: '2_split', order: 40 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EmptyEditorGroupContext, { command: { id: editorCommands_1.CLOSE_EDITOR_GROUP_COMMAND_ID, title: (0, nls_1.localize)(15, null) }, group: '3_close', order: 10, when: contextkey_1.ContextKeyExpr.has('multipleEditorGroups') });
    // Editor Title Context Menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID, title: (0, nls_1.localize)(16, null) }, group: '1_close', order: 10 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)(17, null), precondition: editor_2.EditorGroupEditorsCountContext.notEqualsTo('1') }, group: '1_close', order: 20 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: (0, nls_1.localize)(18, null), precondition: editor_2.EditorGroupEditorsCountContext.notEqualsTo('1') }, group: '1_close', order: 30, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.showTabs') });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: (0, nls_1.localize)(19, null) }, group: '1_close', order: 40 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)(20, null) }, group: '1_close', order: 50 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorActions_1.ReopenResourcesAction.ID, title: editorActions_1.ReopenResourcesAction.LABEL }, group: '1_open', order: 10, when: editor_2.ActiveEditorAvailableEditorIdsContext });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.KEEP_EDITOR_COMMAND_ID, title: (0, nls_1.localize)(21, null), precondition: editor_2.ActiveEditorPinnedContext.toNegated() }, group: '3_preview', order: 10, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.PIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize)(22, null) }, group: '3_preview', order: 20, when: editor_2.ActiveEditorStickyContext.toNegated() });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID, title: (0, nls_1.localize)(23, null) }, group: '3_preview', order: 20, when: editor_2.ActiveEditorStickyContext });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_UP, title: (0, nls_1.localize)(24, null) }, group: '5_split', order: 10 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_DOWN, title: (0, nls_1.localize)(25, null) }, group: '5_split', order: 20 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_LEFT, title: (0, nls_1.localize)(26, null) }, group: '5_split', order: 30 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitleContext, { command: { id: editorCommands_1.SPLIT_EDITOR_RIGHT, title: (0, nls_1.localize)(27, null) }, group: '5_split', order: 40 });
    // Editor Title Menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_DIFF_SIDE_BY_SIDE, title: (0, nls_1.localize)(28, null), toggled: contextkey_1.ContextKeyExpr.equals('config.diffEditor.renderSideBySide', false) }, group: '1_diff', order: 10, when: contextkey_1.ContextKeyExpr.has('isInDiffEditor') });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, { command: { id: editorCommands_1.SHOW_EDITORS_IN_GROUP, title: (0, nls_1.localize)(29, null) }, group: '3_open', order: 10 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: (0, nls_1.localize)(30, null) }, group: '5_close', order: 10 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: (0, nls_1.localize)(31, null) }, group: '5_close', order: 20 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, { command: { id: editorCommands_1.TOGGLE_KEEP_EDITORS_COMMAND_ID, title: (0, nls_1.localize)(32, null), toggled: contextkey_1.ContextKeyExpr.not('config.workbench.editor.enablePreview') }, group: '7_settings', order: 10 });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, { submenu: actions_2.MenuId.EditorTitleRun, title: { value: (0, nls_1.localize)(33, null), original: 'Run', }, icon: codicons_1.Codicon.run, group: 'navigation', order: -1 });
    function appendEditorToolItem(primary, when, order, alternative, precondition) {
        const item = {
            command: {
                id: primary.id,
                title: primary.title,
                icon: primary.icon,
                precondition
            },
            group: 'navigation',
            when,
            order
        };
        if (alternative) {
            item.alt = {
                id: alternative.id,
                title: alternative.title,
                icon: alternative.icon
            };
        }
        actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.EditorTitle, item);
    }
    // Editor Title Menu: Split Editor
    appendEditorToolItem({
        id: editorActions_1.SplitEditorAction.ID,
        title: (0, nls_1.localize)(34, null),
        icon: codicons_1.Codicon.splitHorizontal
    }, contextkey_1.ContextKeyExpr.not('splitEditorsVertically'), 100000, // towards the end
    {
        id: editorCommands_1.SPLIT_EDITOR_DOWN,
        title: (0, nls_1.localize)(35, null),
        icon: codicons_1.Codicon.splitVertical
    });
    appendEditorToolItem({
        id: editorActions_1.SplitEditorAction.ID,
        title: (0, nls_1.localize)(36, null),
        icon: codicons_1.Codicon.splitVertical
    }, contextkey_1.ContextKeyExpr.has('splitEditorsVertically'), 100000, // towards the end
    {
        id: editorCommands_1.SPLIT_EDITOR_RIGHT,
        title: (0, nls_1.localize)(37, null),
        icon: codicons_1.Codicon.splitHorizontal
    });
    // Editor Title Menu: Close (tabs disabled, normal editor)
    appendEditorToolItem({
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)(38, null),
        icon: codicons_1.Codicon.close
    }, contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('config.workbench.editor.showTabs'), editor_2.ActiveEditorDirtyContext.toNegated(), editor_2.ActiveEditorStickyContext.toNegated()), 1000000, // towards the far end
    {
        id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)(39, null),
        icon: codicons_1.Codicon.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, dirty editor)
    appendEditorToolItem({
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)(40, null),
        icon: codicons_1.Codicon.closeDirty
    }, contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('config.workbench.editor.showTabs'), editor_2.ActiveEditorDirtyContext, editor_2.ActiveEditorStickyContext.toNegated()), 1000000, // towards the far end
    {
        id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        title: (0, nls_1.localize)(41, null),
        icon: codicons_1.Codicon.closeAll
    });
    // Editor Title Menu: Close (tabs disabled, sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)(42, null),
        icon: codicons_1.Codicon.pinned
    }, contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('config.workbench.editor.showTabs'), editor_2.ActiveEditorDirtyContext.toNegated(), editor_2.ActiveEditorStickyContext), 1000000, // towards the far end
    {
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)(43, null),
        icon: codicons_1.Codicon.close
    });
    // Editor Title Menu: Close (tabs disabled, dirty & sticky editor)
    appendEditorToolItem({
        id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)(44, null),
        icon: codicons_1.Codicon.pinnedDirty
    }, contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.not('config.workbench.editor.showTabs'), editor_2.ActiveEditorDirtyContext, editor_2.ActiveEditorStickyContext), 1000000, // towards the far end
    {
        id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID,
        title: (0, nls_1.localize)(45, null),
        icon: codicons_1.Codicon.close
    });
    const previousChangeIcon = (0, iconRegistry_1.registerIcon)('diff-editor-previous-change', codicons_1.Codicon.arrowUp, (0, nls_1.localize)(46, null));
    const nextChangeIcon = (0, iconRegistry_1.registerIcon)('diff-editor-next-change', codicons_1.Codicon.arrowDown, (0, nls_1.localize)(47, null));
    const toggleWhitespace = (0, iconRegistry_1.registerIcon)('diff-editor-toggle-whitespace', codicons_1.Codicon.whitespace, (0, nls_1.localize)(48, null));
    // Diff Editor Title Menu: Previous Change
    appendEditorToolItem({
        id: editorCommands_1.GOTO_PREVIOUS_CHANGE,
        title: (0, nls_1.localize)(49, null),
        icon: previousChangeIcon
    }, editor_2.TextCompareEditorActiveContext, 10);
    // Diff Editor Title Menu: Next Change
    appendEditorToolItem({
        id: editorCommands_1.GOTO_NEXT_CHANGE,
        title: (0, nls_1.localize)(50, null),
        icon: nextChangeIcon
    }, editor_2.TextCompareEditorActiveContext, 11);
    // Diff Editor Title Menu: Toggle Ignore Trim Whitespace (Enabled)
    appendEditorToolItem({
        id: editorCommands_1.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
        title: (0, nls_1.localize)(51, null),
        icon: toggleWhitespace
    }, contextkey_1.ContextKeyExpr.and(editor_2.TextCompareEditorActiveContext, contextkey_1.ContextKeyExpr.notEquals('config.diffEditor.ignoreTrimWhitespace', true)), 20);
    // Diff Editor Title Menu: Toggle Ignore Trim Whitespace (Disabled)
    appendEditorToolItem({
        id: editorCommands_1.TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
        title: (0, nls_1.localize)(52, null),
        icon: themeService_1.ThemeIcon.modify(toggleWhitespace, 'disabled')
    }, contextkey_1.ContextKeyExpr.and(editor_2.TextCompareEditorActiveContext, contextkey_1.ContextKeyExpr.notEquals('config.diffEditor.ignoreTrimWhitespace', false)), 20);
    // Editor Commands for Command Palette
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.KEEP_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)(53, null), original: 'Keep Editor' }, category: actions_1.CATEGORIES.View }, when: contextkey_1.ContextKeyExpr.has('config.workbench.editor.enablePreview') });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.PIN_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)(54, null), original: 'Pin Editor' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.UNPIN_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)(55, null), original: 'Unpin Editor' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)(56, null), original: 'Close Editor' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_PINNED_EDITOR_COMMAND_ID, title: { value: (0, nls_1.localize)(57, null), original: 'Close Pinned Editor' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_IN_GROUP_COMMAND_ID, title: { value: (0, nls_1.localize)(58, null), original: 'Close All Editors in Group' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_SAVED_EDITORS_COMMAND_ID, title: { value: (0, nls_1.localize)(59, null), original: 'Close Saved Editors in Group' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID, title: { value: (0, nls_1.localize)(60, null), original: 'Close Other Editors in Group' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID, title: { value: (0, nls_1.localize)(61, null), original: 'Close Editors to the Right in Group' }, category: actions_1.CATEGORIES.View } });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandPalette, { command: { id: editorCommands_1.CLOSE_EDITORS_AND_GROUP_COMMAND_ID, title: { value: (0, nls_1.localize)(62, null), original: 'Close Editor Group' }, category: actions_1.CATEGORIES.View }, when: editor_2.MultipleEditorGroupsContext });
    // File menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarRecentMenu, {
        group: '1_editor',
        command: {
            id: editorActions_1.ReopenClosedEditorAction.ID,
            title: (0, nls_1.localize)(63, null),
            precondition: contextkey_1.ContextKeyExpr.has('canReopenClosedEditor')
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarRecentMenu, {
        group: 'z_clear',
        command: {
            id: editorActions_1.ClearRecentFilesAction.ID,
            title: (0, nls_1.localize)(64, null)
        },
        order: 1
    });
    // Layout menu
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)(65, null),
        submenu: actions_2.MenuId.MenubarLayoutMenu,
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_UP,
            title: (0, nls_1.localize)(66, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_DOWN,
            title: (0, nls_1.localize)(67, null)
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_LEFT,
            title: (0, nls_1.localize)(68, null)
        },
        order: 3
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '1_split',
        command: {
            id: editorCommands_1.SPLIT_EDITOR_RIGHT,
            title: (0, nls_1.localize)(69, null)
        },
        order: 4
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutSingleAction.ID,
            title: (0, nls_1.localize)(70, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoColumnsAction.ID,
            title: (0, nls_1.localize)(71, null)
        },
        order: 3
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutThreeColumnsAction.ID,
            title: (0, nls_1.localize)(72, null)
        },
        order: 4
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoRowsAction.ID,
            title: (0, nls_1.localize)(73, null)
        },
        order: 5
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutThreeRowsAction.ID,
            title: (0, nls_1.localize)(74, null)
        },
        order: 6
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoByTwoGridAction.ID,
            title: (0, nls_1.localize)(75, null)
        },
        order: 7
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoRowsRightAction.ID,
            title: (0, nls_1.localize)(76, null)
        },
        order: 8
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarLayoutMenu, {
        group: '2_layouts',
        command: {
            id: editorActions_1.EditorLayoutTwoColumnsBottomAction.ID,
            title: (0, nls_1.localize)(77, null)
        },
        order: 9
    });
    // Main Menu Bar Contributions:
    // Forward/Back
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '1_history_nav',
        command: {
            id: 'workbench.action.navigateBack',
            title: (0, nls_1.localize)(78, null),
            precondition: contextkey_1.ContextKeyExpr.has('canNavigateBack')
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '1_history_nav',
        command: {
            id: 'workbench.action.navigateForward',
            title: (0, nls_1.localize)(79, null),
            precondition: contextkey_1.ContextKeyExpr.has('canNavigateForward')
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '1_history_nav',
        command: {
            id: 'workbench.action.navigateToLastEditLocation',
            title: (0, nls_1.localize)(80, null),
            precondition: contextkey_1.ContextKeyExpr.has('canNavigateToLastEditLocation')
        },
        order: 3
    });
    // Switch Editor
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '1_any',
        command: {
            id: 'workbench.action.nextEditor',
            title: (0, nls_1.localize)(81, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '1_any',
        command: {
            id: 'workbench.action.previousEditor',
            title: (0, nls_1.localize)(82, null)
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '2_any_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditor',
            title: (0, nls_1.localize)(83, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '2_any_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditor',
            title: (0, nls_1.localize)(84, null)
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '3_group',
        command: {
            id: 'workbench.action.nextEditorInGroup',
            title: (0, nls_1.localize)(85, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '3_group',
        command: {
            id: 'workbench.action.previousEditorInGroup',
            title: (0, nls_1.localize)(86, null)
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '4_group_used',
        command: {
            id: 'workbench.action.openNextRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)(87, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchEditorMenu, {
        group: '4_group_used',
        command: {
            id: 'workbench.action.openPreviousRecentlyUsedEditorInGroup',
            title: (0, nls_1.localize)(88, null)
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)(89, null),
        submenu: actions_2.MenuId.MenubarSwitchEditorMenu,
        order: 1
    });
    // Switch Group
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFirstEditorGroup',
            title: (0, nls_1.localize)(90, null)
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusSecondEditorGroup',
            title: (0, nls_1.localize)(91, null)
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusThirdEditorGroup',
            title: (0, nls_1.localize)(92, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 3
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFourthEditorGroup',
            title: (0, nls_1.localize)(93, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 4
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '1_focus_index',
        command: {
            id: 'workbench.action.focusFifthEditorGroup',
            title: (0, nls_1.localize)(94, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 5
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusNextGroup',
            title: (0, nls_1.localize)(95, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '2_next_prev',
        command: {
            id: 'workbench.action.focusPreviousGroup',
            title: (0, nls_1.localize)(96, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusLeftGroup',
            title: (0, nls_1.localize)(97, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 1
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusRightGroup',
            title: (0, nls_1.localize)(98, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusAboveGroup',
            title: (0, nls_1.localize)(99, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 3
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarSwitchGroupMenu, {
        group: '3_directional',
        command: {
            id: 'workbench.action.focusBelowGroup',
            title: (0, nls_1.localize)(100, null),
            precondition: contextkey_1.ContextKeyExpr.has('multipleEditorGroups')
        },
        order: 4
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarGoMenu, {
        group: '2_editor_nav',
        title: (0, nls_1.localize)(101, null),
        submenu: actions_2.MenuId.MenubarSwitchGroupMenu,
        order: 2
    });
});
//# sourceMappingURL=editor.contribution.js.map