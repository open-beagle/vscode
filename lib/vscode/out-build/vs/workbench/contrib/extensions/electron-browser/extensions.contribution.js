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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/electron-browser/extensions.contribution", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/workbench/common/actions", "vs/workbench/common/contributions", "vs/platform/instantiation/common/descriptors", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/editor", "vs/workbench/contrib/extensions/electron-browser/runtimeExtensionsEditor", "vs/workbench/contrib/extensions/electron-browser/debugExtensionHostAction", "vs/workbench/common/editor", "vs/workbench/contrib/extensions/electron-browser/extensionProfileService", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/extensions/electron-browser/extensionsAutoProfiler", "vs/workbench/contrib/extensions/electron-sandbox/extensionsActions", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/platform/ipc/electron-sandbox/services", "vs/platform/extensionRecommendations/electron-sandbox/extensionRecommendationsIpc", "vs/base/common/codicons"], function (require, exports, nls_1, platform_1, actions_1, extensions_1, actions_2, contributions_1, descriptors_1, commands_1, instantiation_1, editor_1, runtimeExtensionsEditor_1, debugExtensionHostAction_1, editor_2, extensionProfileService_1, runtimeExtensionsInput_1, contextkey_1, extensionsAutoProfiler_1, extensionsActions_1, extensionManagement_1, extensionRecommendations_1, services_1, extensionRecommendationsIpc_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Singletons
    (0, extensions_1.registerSingleton)(runtimeExtensionsEditor_1.IExtensionHostProfileService, extensionProfileService_1.ExtensionHostProfileService, true);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(extensionsAutoProfiler_1.ExtensionsAutoProfiler, 4 /* Eventually */);
    // Running Extensions Editor
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(runtimeExtensionsEditor_1.RuntimeExtensionsEditor, runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID, (0, nls_1.localize)(0, null)), [new descriptors_1.SyncDescriptor(runtimeExtensionsInput_1.RuntimeExtensionsInput)]);
    class RuntimeExtensionsInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '';
        }
        deserialize(instantiationService, serializedEditorInput) {
            return runtimeExtensionsInput_1.RuntimeExtensionsInput.instance;
        }
    }
    platform_1.Registry.as(editor_2.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(runtimeExtensionsInput_1.RuntimeExtensionsInput.ID, RuntimeExtensionsInputSerializer);
    // Global actions
    const actionRegistry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    let ExtensionsContributions = class ExtensionsContributions {
        constructor(extensionRecommendationNotificationService, sharedProcessService) {
            sharedProcessService.registerChannel('extensionRecommendationNotification', new extensionRecommendationsIpc_1.ExtensionRecommendationNotificationServiceChannel(extensionRecommendationNotificationService));
            const openExtensionsFolderActionDescriptor = actions_1.SyncActionDescriptor.from(extensionsActions_1.OpenExtensionsFolderAction);
            actionRegistry.registerWorkbenchAction(openExtensionsFolderActionDescriptor, 'Extensions: Open Extensions Folder', extensionManagement_1.ExtensionsLabel);
        }
    };
    ExtensionsContributions = __decorate([
        __param(0, extensionRecommendations_1.IExtensionRecommendationNotificationService),
        __param(1, services_1.ISharedProcessService)
    ], ExtensionsContributions);
    workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 1 /* Starting */);
    // Register Commands
    commands_1.CommandsRegistry.registerCommand(debugExtensionHostAction_1.DebugExtensionHostAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(debugExtensionHostAction_1.DebugExtensionHostAction).run();
    });
    commands_1.CommandsRegistry.registerCommand(runtimeExtensionsEditor_1.StartExtensionHostProfileAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(runtimeExtensionsEditor_1.StartExtensionHostProfileAction, runtimeExtensionsEditor_1.StartExtensionHostProfileAction.ID, runtimeExtensionsEditor_1.StartExtensionHostProfileAction.LABEL).run();
    });
    commands_1.CommandsRegistry.registerCommand(runtimeExtensionsEditor_1.StopExtensionHostProfileAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(runtimeExtensionsEditor_1.StopExtensionHostProfileAction, runtimeExtensionsEditor_1.StopExtensionHostProfileAction.ID, runtimeExtensionsEditor_1.StopExtensionHostProfileAction.LABEL).run();
    });
    commands_1.CommandsRegistry.registerCommand(runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.ID, (accessor) => {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        instantiationService.createInstance(runtimeExtensionsEditor_1.SaveExtensionHostProfileAction, runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.ID, runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.LABEL).run();
    });
    // Running extensions
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: debugExtensionHostAction_1.DebugExtensionHostAction.ID,
            title: debugExtensionHostAction_1.DebugExtensionHostAction.LABEL,
            icon: codicons_1.Codicon.debugStart
        },
        group: 'navigation',
        when: editor_2.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.StartExtensionHostProfileAction.ID,
            title: runtimeExtensionsEditor_1.StartExtensionHostProfileAction.LABEL,
            icon: codicons_1.Codicon.circleFilled
        },
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(editor_2.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID), runtimeExtensionsEditor_1.CONTEXT_PROFILE_SESSION_STATE.notEqualsTo('running'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.StopExtensionHostProfileAction.ID,
            title: runtimeExtensionsEditor_1.StopExtensionHostProfileAction.LABEL,
            icon: codicons_1.Codicon.debugStop
        },
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(editor_2.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID), runtimeExtensionsEditor_1.CONTEXT_PROFILE_SESSION_STATE.isEqualTo('running'))
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorTitle, {
        command: {
            id: runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.ID,
            title: runtimeExtensionsEditor_1.SaveExtensionHostProfileAction.LABEL,
            icon: codicons_1.Codicon.saveAll,
            precondition: runtimeExtensionsEditor_1.CONTEXT_EXTENSION_HOST_PROFILE_RECORDED
        },
        group: 'navigation',
        when: contextkey_1.ContextKeyExpr.and(editor_2.ActiveEditorContext.isEqualTo(runtimeExtensionsEditor_1.RuntimeExtensionsEditor.ID))
    });
});
//# sourceMappingURL=extensions.contribution.js.map