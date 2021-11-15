/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/electron-sandbox/actions/developerActions", "vs/platform/native/electron-sandbox/native", "vs/workbench/services/editor/common/editorService", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/services/environment/common/environmentService", "vs/platform/contextkey/common/contextkeys"], function (require, exports, nls_1, native_1, editorService_1, actions_1, actions_2, environmentService_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReloadWindowWithExtensionsDisabledAction = exports.ToggleSharedProcessAction = exports.ConfigureRuntimeArgumentsAction = exports.ToggleDevToolsAction = void 0;
    class ToggleDevToolsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleDevTools',
                title: { value: (0, nls_1.localize)(0, null), original: 'Toggle Developer Tools' },
                category: actions_2.CATEGORIES.Developer,
                f1: true,
                keybinding: {
                    weight: 200 /* WorkbenchContrib */ + 50,
                    when: contextkeys_1.IsDevelopmentContext,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 39 /* KEY_I */,
                    mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 39 /* KEY_I */ }
                },
                menu: {
                    id: actions_1.MenuId.MenubarHelpMenu,
                    group: '5_tools',
                    order: 1
                }
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            return nativeHostService.toggleDevTools();
        }
    }
    exports.ToggleDevToolsAction = ToggleDevToolsAction;
    class ConfigureRuntimeArgumentsAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.configureRuntimeArguments',
                title: { value: (0, nls_1.localize)(1, null), original: 'Configure Runtime Arguments' },
                category: actions_2.CATEGORIES.Preferences,
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const environmentService = accessor.get(environmentService_1.IWorkbenchEnvironmentService);
            await editorService.openEditor({
                resource: environmentService.argvResource,
                options: { pinned: true }
            });
        }
    }
    exports.ConfigureRuntimeArgumentsAction = ConfigureRuntimeArgumentsAction;
    class ToggleSharedProcessAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleSharedProcess',
                title: { value: (0, nls_1.localize)(2, null), original: 'Toggle Shared Process' },
                category: actions_2.CATEGORIES.Developer,
                f1: true
            });
        }
        async run(accessor) {
            return accessor.get(native_1.INativeHostService).toggleSharedProcessWindow();
        }
    }
    exports.ToggleSharedProcessAction = ToggleSharedProcessAction;
    class ReloadWindowWithExtensionsDisabledAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.reloadWindowWithExtensionsDisabled',
                title: { value: (0, nls_1.localize)(3, null), original: 'Reload With Extensions Disabled' },
                category: actions_2.CATEGORIES.Developer,
                f1: true
            });
        }
        async run(accessor) {
            return accessor.get(native_1.INativeHostService).reload({ disableExtensions: true });
        }
    }
    exports.ReloadWindowWithExtensionsDisabledAction = ReloadWindowWithExtensionsDisabledAction;
});
//# sourceMappingURL=developerActions.js.map