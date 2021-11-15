/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/electron-sandbox/desktop.contribution", "vs/platform/product/common/product", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/actions", "vs/base/common/platform", "vs/workbench/electron-sandbox/actions/developerActions", "vs/workbench/electron-sandbox/actions/windowActions", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkeys", "vs/workbench/common/editor", "vs/platform/native/electron-sandbox/native", "vs/platform/jsonschemas/common/jsonContributionRegistry"], function (require, exports, platform_1, nls_1, product_1, actions_1, configurationRegistry_1, actions_2, platform_2, developerActions_1, windowActions_1, contextkey_1, keybindingsRegistry_1, commands_1, contextkeys_1, editor_1, native_1, jsonContributionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Actions
    (function registerActions() {
        const registry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
        // Actions: Zoom
        (function registerZoomActions() {
            registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(windowActions_1.ZoomInAction, { primary: 2048 /* CtrlCmd */ | 81 /* US_EQUAL */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 81 /* US_EQUAL */, 2048 /* CtrlCmd */ | 104 /* NUMPAD_ADD */] }), 'View: Zoom In', actions_2.CATEGORIES.View.value);
            registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(windowActions_1.ZoomOutAction, { primary: 2048 /* CtrlCmd */ | 83 /* US_MINUS */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 83 /* US_MINUS */, 2048 /* CtrlCmd */ | 106 /* NUMPAD_SUBTRACT */], linux: { primary: 2048 /* CtrlCmd */ | 83 /* US_MINUS */, secondary: [2048 /* CtrlCmd */ | 106 /* NUMPAD_SUBTRACT */] } }), 'View: Zoom Out', actions_2.CATEGORIES.View.value);
            registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(windowActions_1.ZoomResetAction, { primary: 2048 /* CtrlCmd */ | 93 /* NUMPAD_0 */ }), 'View: Reset Zoom', actions_2.CATEGORIES.View.value);
        })();
        // Actions: Window
        (function registerWindowActions() {
            registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(windowActions_1.SwitchWindow, { primary: 0, mac: { primary: 256 /* WinCtrl */ | 53 /* KEY_W */ } }), 'Switch Window...');
            registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(windowActions_1.QuickSwitchWindow), 'Quick Switch Window...');
            // Close window
            registry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(windowActions_1.CloseCurrentWindowAction, {
                mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KEY_W */ },
                linux: { primary: 512 /* Alt */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KEY_W */] },
                win: { primary: 512 /* Alt */ | 62 /* F4 */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 53 /* KEY_W */] }
            }), 'Close Window');
            // Close the window when the last editor is closed by reusing the same keybinding
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: windowActions_1.CloseCurrentWindowAction.ID,
                weight: 200 /* WorkbenchContrib */,
                when: contextkey_1.ContextKeyExpr.and(editor_1.EditorsVisibleContext.toNegated(), editor_1.SingleEditorGroupsContext),
                primary: 2048 /* CtrlCmd */ | 53 /* KEY_W */,
                handler: accessor => {
                    const nativeHostService = accessor.get(native_1.INativeHostService);
                    nativeHostService.closeWindow();
                }
            });
            // Quit
            keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
                id: 'workbench.action.quit',
                weight: 200 /* WorkbenchContrib */,
                handler(accessor) {
                    const nativeHostService = accessor.get(native_1.INativeHostService);
                    nativeHostService.quit();
                },
                when: undefined,
                mac: { primary: 2048 /* CtrlCmd */ | 47 /* KEY_Q */ },
                linux: { primary: 2048 /* CtrlCmd */ | 47 /* KEY_Q */ }
            });
        })();
        // Actions: macOS Native Tabs
        (function registerMacOSNativeTabsActions() {
            if (platform_2.isMacintosh) {
                [
                    { handler: windowActions_1.NewWindowTabHandler, id: 'workbench.action.newWindowTab', title: { value: (0, nls_1.localize)(0, null), original: 'New Window Tab' } },
                    { handler: windowActions_1.ShowPreviousWindowTabHandler, id: 'workbench.action.showPreviousWindowTab', title: { value: (0, nls_1.localize)(1, null), original: 'Show Previous Window Tab' } },
                    { handler: windowActions_1.ShowNextWindowTabHandler, id: 'workbench.action.showNextWindowTab', title: { value: (0, nls_1.localize)(2, null), original: 'Show Next Window Tab' } },
                    { handler: windowActions_1.MoveWindowTabToNewWindowHandler, id: 'workbench.action.moveWindowTabToNewWindow', title: { value: (0, nls_1.localize)(3, null), original: 'Move Window Tab to New Window' } },
                    { handler: windowActions_1.MergeWindowTabsHandlerHandler, id: 'workbench.action.mergeAllWindowTabs', title: { value: (0, nls_1.localize)(4, null), original: 'Merge All Windows' } },
                    { handler: windowActions_1.ToggleWindowTabsBarHandler, id: 'workbench.action.toggleWindowTabsBar', title: { value: (0, nls_1.localize)(5, null), original: 'Toggle Window Tabs Bar' } }
                ].forEach(command => {
                    commands_1.CommandsRegistry.registerCommand(command.id, command.handler);
                    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
                        command,
                        when: contextkey_1.ContextKeyExpr.equals('config.window.nativeTabs', true)
                    });
                });
            }
        })();
        // Actions: Developer
        (function registerDeveloperActions() {
            (0, actions_1.registerAction2)(developerActions_1.ReloadWindowWithExtensionsDisabledAction);
            (0, actions_1.registerAction2)(developerActions_1.ConfigureRuntimeArgumentsAction);
            (0, actions_1.registerAction2)(developerActions_1.ToggleSharedProcessAction);
            (0, actions_1.registerAction2)(developerActions_1.ToggleDevToolsAction);
        })();
    })();
    // Menu
    (function registerMenu() {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
            group: '6_close',
            command: {
                id: windowActions_1.CloseCurrentWindowAction.ID,
                title: (0, nls_1.localize)(6, null)
            },
            order: 4
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarFileMenu, {
            group: 'z_Exit',
            command: {
                id: 'workbench.action.quit',
                title: (0, nls_1.localize)(7, null)
            },
            order: 1,
            when: contextkeys_1.IsMacContext.toNegated()
        });
        // Zoom
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
            group: '3_zoom',
            command: {
                id: windowActions_1.ZoomInAction.ID,
                title: (0, nls_1.localize)(8, null)
            },
            order: 1
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
            group: '3_zoom',
            command: {
                id: windowActions_1.ZoomOutAction.ID,
                title: (0, nls_1.localize)(9, null)
            },
            order: 2
        });
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarAppearanceMenu, {
            group: '3_zoom',
            command: {
                id: windowActions_1.ZoomResetAction.ID,
                title: (0, nls_1.localize)(10, null)
            },
            order: 3
        });
        if (!!product_1.default.reportIssueUrl) {
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
                group: '3_feedback',
                command: {
                    id: 'workbench.action.openIssueReporter',
                    title: (0, nls_1.localize)(11, null)
                },
                order: 3
            });
        }
        // Tools
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '5_tools',
            command: {
                id: 'workbench.action.openProcessExplorer',
                title: (0, nls_1.localize)(12, null)
            },
            order: 2
        });
    })();
    // Configuration
    (function registerConfiguration() {
        const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        // Window
        registry.registerConfiguration({
            'id': 'window',
            'order': 8,
            'title': (0, nls_1.localize)(13, null),
            'type': 'object',
            'properties': {
                'window.openWithoutArgumentsInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(14, null),
                        (0, nls_1.localize)(15, null)
                    ],
                    'default': platform_2.isMacintosh ? 'off' : 'on',
                    'scope': 1 /* APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(16, null)
                },
                'window.restoreWindows': {
                    'type': 'string',
                    'enum': ['preserve', 'all', 'folders', 'one', 'none'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(17, null),
                        (0, nls_1.localize)(18, null),
                        (0, nls_1.localize)(19, null),
                        (0, nls_1.localize)(20, null),
                        (0, nls_1.localize)(21, null)
                    ],
                    'default': 'all',
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(22, null)
                },
                'window.restoreFullscreen': {
                    'type': 'boolean',
                    'default': false,
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(23, null)
                },
                'window.zoomLevel': {
                    'type': 'number',
                    'default': 0,
                    'description': (0, nls_1.localize)(24, null),
                    ignoreSync: true
                },
                'window.newWindowDimensions': {
                    'type': 'string',
                    'enum': ['default', 'inherit', 'offset', 'maximized', 'fullscreen'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(25, null),
                        (0, nls_1.localize)(26, null),
                        (0, nls_1.localize)(27, null),
                        (0, nls_1.localize)(28, null),
                        (0, nls_1.localize)(29, null)
                    ],
                    'default': 'default',
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(30, null)
                },
                'window.closeWhenEmpty': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(31, null)
                },
                'window.doubleClickIconToClose': {
                    'type': 'boolean',
                    'default': false,
                    'scope': 1 /* APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(32, null)
                },
                'window.titleBarStyle': {
                    'type': 'string',
                    'enum': ['native', 'custom'],
                    'default': platform_2.isLinux ? 'native' : 'custom',
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(33, null)
                },
                'window.dialogStyle': {
                    'type': 'string',
                    'enum': ['native', 'custom'],
                    'default': 'native',
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(34, null)
                },
                'window.nativeTabs': {
                    'type': 'boolean',
                    'default': false,
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(35, null),
                    'included': platform_2.isMacintosh
                },
                'window.nativeFullScreen': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(36, null),
                    'scope': 1 /* APPLICATION */,
                    'included': platform_2.isMacintosh
                },
                'window.clickThroughInactive': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* APPLICATION */,
                    'description': (0, nls_1.localize)(37, null),
                    'included': platform_2.isMacintosh
                }
            }
        });
        // Telemetry
        registry.registerConfiguration({
            'id': 'telemetry',
            'order': 110,
            title: (0, nls_1.localize)(38, null),
            'type': 'object',
            'properties': {
                'telemetry.enableCrashReporter': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(39, null),
                    'default': true,
                    'tags': ['usesOnlineServices']
                }
            }
        });
        // Keybinding
        registry.registerConfiguration({
            'id': 'keyboard',
            'order': 15,
            'type': 'object',
            'title': (0, nls_1.localize)(40, null),
            'properties': {
                'keyboard.touchbar.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(41, null),
                    'included': platform_2.isMacintosh
                },
                'keyboard.touchbar.ignored': {
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    },
                    'default': [],
                    'markdownDescription': (0, nls_1.localize)(42, null),
                    'included': platform_2.isMacintosh
                }
            }
        });
    })();
    // JSON Schemas
    (function registerJSONSchemas() {
        const argvDefinitionFileSchemaId = 'vscode://schemas/argv';
        const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        const schema = {
            id: argvDefinitionFileSchemaId,
            allowComments: true,
            allowTrailingCommas: true,
            description: 'VSCode static command line definition file',
            type: 'object',
            additionalProperties: false,
            properties: {
                locale: {
                    type: 'string',
                    description: (0, nls_1.localize)(43, null)
                },
                'disable-hardware-acceleration': {
                    type: 'boolean',
                    description: (0, nls_1.localize)(44, null)
                },
                'disable-color-correct-rendering': {
                    type: 'boolean',
                    description: (0, nls_1.localize)(45, null)
                },
                'force-color-profile': {
                    type: 'string',
                    markdownDescription: (0, nls_1.localize)(46, null)
                },
                'enable-crash-reporter': {
                    type: 'boolean',
                    markdownDescription: (0, nls_1.localize)(47, null)
                },
                'crash-reporter-id': {
                    type: 'string',
                    markdownDescription: (0, nls_1.localize)(48, null)
                },
                'enable-proposed-api': {
                    type: 'array',
                    description: (0, nls_1.localize)(49, null),
                    items: {
                        type: 'string'
                    }
                },
                'log-level': {
                    type: 'string',
                    description: (0, nls_1.localize)(50, null)
                }
            }
        };
        if (platform_2.isLinux) {
            schema.properties['force-renderer-accessibility'] = {
                type: 'boolean',
                description: (0, nls_1.localize)(51, null),
            };
        }
        jsonRegistry.registerSchema(argvDefinitionFileSchemaId, schema);
    })();
});
//# sourceMappingURL=desktop.contribution.js.map