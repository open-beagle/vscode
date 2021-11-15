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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensions.contribution", "vs/base/common/keyCodes", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/extensions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/common/contributions", "vs/workbench/services/output/common/output", "vs/platform/instantiation/common/descriptors", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/contrib/extensions/browser/extensionEditor", "vs/workbench/contrib/extensions/browser/extensionsViewlet", "vs/platform/configuration/common/configurationRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensionsUtils", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/browser/editor", "vs/base/common/uri", "vs/workbench/contrib/extensions/browser/extensionsActivationProgress", "vs/base/common/errors", "vs/workbench/contrib/extensions/browser/extensionsDependencyChecker", "vs/base/common/cancellation", "vs/workbench/common/views", "vs/platform/clipboard/common/clipboardService", "vs/workbench/services/preferences/common/preferences", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/extensions/browser/extensionsQuickAccess", "vs/workbench/contrib/extensions/browser/extensionRecommendationsService", "vs/workbench/services/userDataSync/common/userDataSync", "vs/editor/contrib/clipboard/clipboard", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/extensions/browser/extensionsWorkbenchService", "vs/workbench/browser/contextkeys", "vs/workbench/common/actions", "vs/platform/extensionRecommendations/common/extensionRecommendations", "vs/workbench/contrib/extensions/browser/extensionRecommendationNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/common/resources", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/network", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor", "vs/workbench/contrib/extensions/browser/extensionEnablementByWorkspaceTrustRequirement", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/extensions/common/extensions", "vs/base/common/lifecycle", "vs/base/common/types", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/base/common/async", "vs/workbench/common/editor", "vs/workbench/services/workspaces/common/workspaceTrust"], function (require, exports, nls_1, keyCodes_1, platform_1, actions_1, extensions_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, contributions_1, output_1, descriptors_1, extensions_2, extensionsActions_1, extensionsInput_1, extensionEditor_1, extensionsViewlet_1, configurationRegistry_1, jsonContributionRegistry, extensionsFileTemplate_1, commands_1, instantiation_1, extensionsUtils_1, extensionManagementUtil_1, editor_1, uri_1, extensionsActivationProgress_1, errors_1, extensionsDependencyChecker_1, cancellation_1, views_1, clipboardService_1, preferences_1, contextkey_1, viewlet_1, quickAccess_1, extensionsQuickAccess_1, extensionRecommendationsService_1, userDataSync_1, clipboard_1, editorService_1, extensionsWorkbenchService_1, contextkeys_1, actions_2, extensionRecommendations_2, extensionRecommendationNotificationService_1, extensions_3, notification_1, host_1, resources_1, workspaceExtensionsConfig_1, network_1, abstractRuntimeExtensionsEditor_1, extensionEnablementByWorkspaceTrustRequirement_1, extensionsIcons_1, extensions_4, lifecycle_1, types_1, configuration_1, dialogs_1, labels_1, extensionQuery_1, async_1, editor_2, workspaceTrust_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONTEXT_HAS_WEB_SERVER = exports.CONTEXT_HAS_REMOTE_SERVER = exports.CONTEXT_HAS_LOCAL_SERVER = exports.CONTEXT_HAS_GALLERY = void 0;
    // Singletons
    (0, extensions_1.registerSingleton)(extensions_2.IExtensionsWorkbenchService, extensionsWorkbenchService_1.ExtensionsWorkbenchService);
    (0, extensions_1.registerSingleton)(extensionRecommendations_2.IExtensionRecommendationNotificationService, extensionRecommendationNotificationService_1.ExtensionRecommendationNotificationService);
    (0, extensions_1.registerSingleton)(extensionRecommendations_1.IExtensionRecommendationsService, extensionRecommendationsService_1.ExtensionRecommendationsService);
    platform_1.Registry.as(output_1.Extensions.OutputChannels)
        .registerChannel({ id: extensionManagement_1.ExtensionsChannelId, label: extensionManagement_1.ExtensionsLabel, log: false });
    // Quick Access
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: extensionsQuickAccess_1.ManageExtensionsQuickAccessProvider,
        prefix: extensionsQuickAccess_1.ManageExtensionsQuickAccessProvider.PREFIX,
        placeholder: (0, nls_1.localize)(0, null),
        helpEntries: [{ description: (0, nls_1.localize)(1, null), needsEditor: false }]
    });
    // Editor
    platform_1.Registry.as(editor_2.EditorExtensions.Editors).registerEditor(editor_1.EditorDescriptor.create(extensionEditor_1.ExtensionEditor, extensionEditor_1.ExtensionEditor.ID, (0, nls_1.localize)(2, null)), [
        new descriptors_1.SyncDescriptor(extensionsInput_1.ExtensionsInput)
    ]);
    platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: extensions_2.VIEWLET_ID,
        title: (0, nls_1.localize)(3, null),
        openCommandActionDescriptor: {
            id: extensions_2.VIEWLET_ID,
            mnemonicTitle: (0, nls_1.localize)(4, null),
            keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 54 /* KEY_X */ },
            order: 4,
        },
        ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViewlet_1.ExtensionsViewPaneContainer),
        icon: extensionsIcons_1.extensionsViewIcon,
        order: 4,
        rejectAddedViews: true,
        alwaysUseContainerInfo: true,
    }, 0 /* Sidebar */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'extensions',
        order: 30,
        title: (0, nls_1.localize)(5, null),
        type: 'object',
        properties: {
            'extensions.autoUpdate': {
                enum: [true, 'onlyEnabledExtensions', false,],
                enumItemLabels: [
                    (0, nls_1.localize)(6, null),
                    (0, nls_1.localize)(7, null),
                    (0, nls_1.localize)(8, null),
                ],
                enumDescriptions: [
                    (0, nls_1.localize)(9, null),
                    (0, nls_1.localize)(10, null),
                    (0, nls_1.localize)(11, null),
                ],
                description: (0, nls_1.localize)(12, null),
                default: true,
                scope: 1 /* APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.autoCheckUpdates': {
                type: 'boolean',
                description: (0, nls_1.localize)(13, null),
                default: true,
                scope: 1 /* APPLICATION */,
                tags: ['usesOnlineServices']
            },
            'extensions.ignoreRecommendations': {
                type: 'boolean',
                description: (0, nls_1.localize)(14, null),
                default: false
            },
            'extensions.showRecommendationsOnlyOnDemand': {
                type: 'boolean',
                deprecationMessage: (0, nls_1.localize)(15, null),
                default: false,
                tags: ['usesOnlineServices']
            },
            'extensions.closeExtensionDetailsOnViewChange': {
                type: 'boolean',
                description: (0, nls_1.localize)(16, null),
                default: false
            },
            'extensions.confirmedUriHandlerExtensionIds': {
                type: 'array',
                description: (0, nls_1.localize)(17, null),
                default: [],
                scope: 1 /* APPLICATION */
            },
            'extensions.webWorker': {
                type: 'boolean',
                description: (0, nls_1.localize)(18, null),
                default: false
            },
            'extensions.supportVirtualWorkspaces': {
                type: 'object',
                markdownDescription: (0, nls_1.localize)(19, null),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9\-A-Z]*)\\.([a-z0-9A-Z][a-z0-9\-A-Z]*)$': {
                        type: 'boolean',
                        default: false
                    }
                },
                default: {
                    'pub.name': false
                }
            },
            [workspaceTrust_1.WORKSPACE_TRUST_EXTENSION_SUPPORT]: {
                type: 'object',
                scope: 1 /* APPLICATION */,
                markdownDescription: (0, nls_1.localize)(20, null),
                patternProperties: {
                    '([a-z0-9A-Z][a-z0-9\-A-Z]*)\\.([a-z0-9A-Z][a-z0-9\-A-Z]*)$': {
                        type: 'object',
                        properties: {
                            'supported': {
                                type: ['boolean', 'string'],
                                enum: [true, false, 'limited'],
                                enumDescriptions: [
                                    (0, nls_1.localize)(21, null),
                                    (0, nls_1.localize)(22, null),
                                    (0, nls_1.localize)(23, null),
                                ],
                                description: (0, nls_1.localize)(24, null),
                            },
                            'version': {
                                type: 'string',
                                description: (0, nls_1.localize)(25, null),
                            }
                        }
                    }
                }
            }
        }
    });
    const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(extensionsFileTemplate_1.ExtensionsConfigurationSchemaId, extensionsFileTemplate_1.ExtensionsConfigurationSchema);
    // Register Commands
    commands_1.CommandsRegistry.registerCommand('_extensions.manage', (accessor, extensionId) => {
        const extensionService = accessor.get(extensions_2.IExtensionsWorkbenchService);
        const extension = extensionService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }));
        if (extension.length === 1) {
            extensionService.open(extension[0]);
        }
    });
    commands_1.CommandsRegistry.registerCommand('extension.open', (accessor, extensionId) => {
        const extensionService = accessor.get(extensions_2.IExtensionsWorkbenchService);
        return extensionService.queryGallery({ names: [extensionId], pageSize: 1 }, cancellation_1.CancellationToken.None).then(pager => {
            if (pager.total !== 1) {
                return;
            }
            extensionService.open(pager.firstPage[0]);
        });
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.installExtension',
        description: {
            description: (0, nls_1.localize)(26, null),
            args: [
                {
                    name: (0, nls_1.localize)(27, null),
                    schema: {
                        'type': ['object', 'string']
                    }
                }
            ]
        },
        handler: async (accessor, arg) => {
            const extensionManagementService = accessor.get(extensionManagement_1.IExtensionManagementService);
            const extensionGalleryService = accessor.get(extensionManagement_1.IExtensionGalleryService);
            try {
                if (typeof arg === 'string') {
                    const extension = await extensionGalleryService.getCompatibleExtension({ id: arg });
                    if (extension) {
                        await extensionManagementService.installFromGallery(extension);
                    }
                    else {
                        throw new Error((0, nls_1.localize)(28, null, arg));
                    }
                }
                else {
                    const vsix = uri_1.URI.revive(arg);
                    await extensionManagementService.install(vsix);
                }
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                throw e;
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.uninstallExtension',
        description: {
            description: (0, nls_1.localize)(29, null),
            args: [
                {
                    name: (0, nls_1.localize)(30, null),
                    schema: {
                        'type': 'string'
                    }
                }
            ]
        },
        handler: async (accessor, id) => {
            if (!id) {
                throw new Error((0, nls_1.localize)(31, null));
            }
            const extensionManagementService = accessor.get(extensionManagement_1.IExtensionManagementService);
            const installed = await extensionManagementService.getInstalled();
            const [extensionToUninstall] = installed.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id }));
            if (!extensionToUninstall) {
                throw new Error((0, nls_1.localize)(32, null, id));
            }
            if (extensionToUninstall.isBuiltin) {
                throw new Error((0, nls_1.localize)(33, null, id));
            }
            try {
                await extensionManagementService.uninstall(extensionToUninstall);
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
                throw e;
            }
        }
    });
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.extensions.search',
        description: {
            description: (0, nls_1.localize)(34, null),
            args: [
                {
                    name: (0, nls_1.localize)(35, null),
                    schema: { 'type': 'string' }
                }
            ]
        },
        handler: async (accessor, query = '') => {
            const viewletService = accessor.get(viewlet_1.IViewletService);
            const viewlet = await viewletService.openViewlet(extensions_2.VIEWLET_ID, true);
            if (!viewlet) {
                return;
            }
            viewlet.getViewPaneContainer().search(query);
            viewlet.focus();
        }
    });
    function overrideActionForActiveExtensionEditorWebview(command, f) {
        command === null || command === void 0 ? void 0 : command.addImplementation(105, 'extensions-editor', (accessor) => {
            var _a;
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = editorService.activeEditorPane;
            if (editor instanceof extensionEditor_1.ExtensionEditor) {
                if ((_a = editor.activeWebview) === null || _a === void 0 ? void 0 : _a.isFocused) {
                    f(editor.activeWebview);
                    return true;
                }
            }
            return false;
        });
    }
    overrideActionForActiveExtensionEditorWebview(clipboard_1.CopyAction, webview => webview.copy());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.CutAction, webview => webview.cut());
    overrideActionForActiveExtensionEditorWebview(clipboard_1.PasteAction, webview => webview.paste());
    // Contexts
    exports.CONTEXT_HAS_GALLERY = new contextkey_1.RawContextKey('hasGallery', false);
    exports.CONTEXT_HAS_LOCAL_SERVER = new contextkey_1.RawContextKey('hasLocalServer', false);
    exports.CONTEXT_HAS_REMOTE_SERVER = new contextkey_1.RawContextKey('hasRemoteServer', false);
    exports.CONTEXT_HAS_WEB_SERVER = new contextkey_1.RawContextKey('hasWebServer', false);
    async function runAction(action) {
        try {
            await action.run();
        }
        finally {
            action.dispose();
        }
    }
    let ExtensionsContributions = class ExtensionsContributions extends lifecycle_1.Disposable {
        constructor(extensionManagementServerService, extensionGalleryService, contextKeyService, viewletService, extensionsWorkbenchService, extensionEnablementService, instantiationService, dialogService, commandService) {
            super();
            this.extensionManagementServerService = extensionManagementServerService;
            this.viewletService = viewletService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.instantiationService = instantiationService;
            this.dialogService = dialogService;
            this.commandService = commandService;
            const hasGalleryContext = exports.CONTEXT_HAS_GALLERY.bindTo(contextKeyService);
            if (extensionGalleryService.isEnabled()) {
                hasGalleryContext.set(true);
            }
            const hasLocalServerContext = exports.CONTEXT_HAS_LOCAL_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                hasLocalServerContext.set(true);
            }
            const hasRemoteServerContext = exports.CONTEXT_HAS_REMOTE_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                hasRemoteServerContext.set(true);
            }
            const hasWebServerContext = exports.CONTEXT_HAS_WEB_SERVER.bindTo(contextKeyService);
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                hasWebServerContext.set(true);
            }
            this.registerGlobalActions();
            this.registerContextMenuActions();
            this.registerQuickAccessProvider();
        }
        registerQuickAccessProvider() {
            if (this.extensionManagementServerService.localExtensionManagementServer
                || this.extensionManagementServerService.remoteExtensionManagementServer
                || this.extensionManagementServerService.webExtensionManagementServer) {
                platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
                    ctor: extensionsQuickAccess_1.InstallExtensionQuickAccessProvider,
                    prefix: extensionsQuickAccess_1.InstallExtensionQuickAccessProvider.PREFIX,
                    placeholder: (0, nls_1.localize)(36, null),
                    helpEntries: [{ description: (0, nls_1.localize)(37, null), needsEditor: false }]
                });
            }
        }
        // Global actions
        registerGlobalActions() {
            this._register(actions_1.MenuRegistry.appendMenuItems([{
                    id: actions_1.MenuId.MenubarPreferencesMenu,
                    item: {
                        command: {
                            id: extensions_2.VIEWLET_ID,
                            title: (0, nls_1.localize)(38, null)
                        },
                        group: '1_settings',
                        order: 3
                    }
                }, {
                    id: actions_1.MenuId.GlobalActivity,
                    item: {
                        command: {
                            id: extensions_2.VIEWLET_ID,
                            title: (0, nls_1.localize)(39, null)
                        },
                        group: '2_configuration',
                        order: 3
                    }
                }]));
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installExtensions',
                title: { value: (0, nls_1.localize)(40, null), original: 'Install Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyAndExpr.create([exports.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])])
                },
                run: async (accessor) => {
                    accessor.get(views_1.IViewsService).openViewContainer(extensions_2.VIEWLET_ID);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showRecommendedKeymapExtensions',
                title: { value: (0, nls_1.localize)(41, null), original: 'Keymaps' },
                category: extensionManagement_1.PreferencesLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: exports.CONTEXT_HAS_GALLERY
                    }, {
                        id: actions_1.MenuId.MenubarPreferencesMenu,
                        group: '2_keybindings',
                        order: 2
                    }, {
                        id: actions_1.MenuId.GlobalActivity,
                        group: '2_keybindings',
                        order: 2
                    }],
                keybinding: {
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 43 /* KEY_M */),
                    weight: 200 /* WorkbenchContrib */
                },
                menuTitles: {
                    [actions_1.MenuId.MenubarPreferencesMenu.id]: (0, nls_1.localize)(42, null),
                    [actions_1.MenuId.GlobalActivity.id]: (0, nls_1.localize)(43, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended:keymaps '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showLanguageExtensions',
                title: { value: (0, nls_1.localize)(44, null), original: 'Language Extensions' },
                category: extensionManagement_1.PreferencesLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: exports.CONTEXT_HAS_GALLERY
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@category:"programming languages" @sort:installs '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.checkForUpdates',
                title: { value: (0, nls_1.localize)(45, null), original: 'Check for Extension Updates' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyAndExpr.create([exports.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])])
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID),
                        group: '1_updates',
                        order: 1
                    }],
                run: async () => {
                    await this.extensionsWorkbenchService.checkForUpdates();
                    const outdated = this.extensionsWorkbenchService.outdated;
                    if (outdated.length) {
                        return runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@outdated '));
                    }
                    else {
                        return this.dialogService.show(notification_1.Severity.Info, (0, nls_1.localize)(46, null), []);
                    }
                }
            });
            const autoUpdateExtensionsSubMenu = new actions_1.MenuId('autoUpdateExtensionsSubMenu');
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
                submenu: autoUpdateExtensionsSubMenu,
                title: (0, nls_1.localize)(47, null),
                when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID),
                group: '1_updates',
                order: 5,
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.all',
                title: (0, nls_1.localize)(48, null),
                toggled: contextkey_1.ContextKeyAndExpr.create([contextkey_1.ContextKeyDefinedExpr.create(`config.${extensions_2.AutoUpdateConfigurationKey}`), contextkey_1.ContextKeyNotEqualsExpr.create(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions')]),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 1,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, true)
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.enabled',
                title: (0, nls_1.localize)(49, null),
                toggled: contextkey_1.ContextKeyEqualsExpr.create(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions'),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 2,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, 'onlyEnabledExtensions')
            });
            this.registerExtensionAction({
                id: 'configureExtensionsAutoUpdate.none',
                title: (0, nls_1.localize)(50, null),
                toggled: contextkey_1.ContextKeyEqualsExpr.create(`config.${extensions_2.AutoUpdateConfigurationKey}`, false),
                menu: [{
                        id: autoUpdateExtensionsSubMenu,
                        order: 3,
                    }],
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.updateAllExtensions',
                title: { value: (0, nls_1.localize)(51, null), original: 'Update All Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                precondition: extensions_2.HasOutdatedExtensionsContext,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyAndExpr.create([exports.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])])
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyAndExpr.create([contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID), contextkey_1.ContextKeyOrExpr.create([contextkey_1.ContextKeyDefinedExpr.create(`config.${extensions_2.AutoUpdateConfigurationKey}`).negate(), contextkey_1.ContextKeyEqualsExpr.create(`config.${extensions_2.AutoUpdateConfigurationKey}`, 'onlyEnabledExtensions')])]),
                        group: '1_updates',
                        order: 2
                    }],
                run: () => {
                    return Promise.all(this.extensionsWorkbenchService.outdated.map(async (extension) => {
                        try {
                            await this.extensionsWorkbenchService.install(extension);
                        }
                        catch (err) {
                            runAction(this.instantiationService.createInstance(extensionsActions_1.PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* Update */, err));
                        }
                    }));
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAutoUpdate',
                title: { value: (0, nls_1.localize)(52, null), original: 'Disable Auto Update for all extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAutoUpdate',
                title: { value: (0, nls_1.localize)(53, null), original: 'Enable Auto Update for all extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                f1: true,
                run: (accessor) => accessor.get(configuration_1.IConfigurationService).updateValue(extensions_2.AutoUpdateConfigurationKey, true)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAll',
                title: { value: (0, nls_1.localize)(54, null), original: 'Enable All Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID),
                        group: '2_enablement',
                        order: 1
                    }],
                run: async () => {
                    const extensionsToEnable = this.extensionsWorkbenchService.local.filter(e => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 6 /* EnabledGlobally */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.enableAllWorkspace',
                title: { value: (0, nls_1.localize)(55, null), original: 'Enable All Extensions for this Workspace' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyAndExpr.create([contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])])
                },
                run: async () => {
                    const extensionsToEnable = this.extensionsWorkbenchService.local.filter(e => !!e.local && this.extensionEnablementService.canChangeEnablement(e.local) && !this.extensionEnablementService.isEnabled(e.local));
                    if (extensionsToEnable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToEnable, 7 /* EnabledWorkspace */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAll',
                title: { value: (0, nls_1.localize)(56, null), original: 'Disable All Installed Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID),
                        group: '2_enablement',
                        order: 2
                    }],
                run: async () => {
                    const extensionsToDisable = this.extensionsWorkbenchService.local.filter(e => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 4 /* DisabledGlobally */);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.disableAllWorkspace',
                title: { value: (0, nls_1.localize)(57, null), original: 'Disable All Installed Extensions for this Workspace' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyAndExpr.create([contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])])
                },
                run: async () => {
                    const extensionsToDisable = this.extensionsWorkbenchService.local.filter(e => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(e.local) && this.extensionEnablementService.canChangeEnablement(e.local));
                    if (extensionsToDisable.length) {
                        await this.extensionsWorkbenchService.setEnablement(extensionsToDisable, 5 /* DisabledWorkspace */);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
                title: { value: (0, nls_1.localize)(58, null), original: 'Install from VSIX...' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER])
                    }, {
                        id: actions_1.MenuId.ViewContainerTitle,
                        when: contextkey_1.ContextKeyAndExpr.create([contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID), contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER])]),
                        group: '3_install',
                        order: 1
                    }],
                run: async (accessor) => {
                    const fileDialogService = accessor.get(dialogs_1.IFileDialogService);
                    const commandService = accessor.get(commands_1.ICommandService);
                    const vsixPaths = await fileDialogService.showOpenDialog({
                        title: (0, nls_1.localize)(59, null),
                        filters: [{ name: 'VSIX Extensions', extensions: ['vsix'] }],
                        canSelectFiles: true,
                        canSelectMany: true,
                        openLabel: (0, labels_1.mnemonicButtonLabel)((0, nls_1.localize)(60, null))
                    });
                    if (vsixPaths) {
                        await commandService.executeCommand(extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, vsixPaths);
                    }
                }
            });
            this.registerExtensionAction({
                id: extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
                title: (0, nls_1.localize)(61, null),
                menu: [{
                        id: actions_1.MenuId.ExplorerContext,
                        group: 'extensions',
                        when: contextkey_1.ContextKeyAndExpr.create([resources_1.ResourceContextKey.Extension.isEqualTo('.vsix'), contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER])]),
                    }],
                run: async (accessor, resources) => {
                    const extensionService = accessor.get(extensions_3.IExtensionService);
                    const extensionsWorkbenchService = accessor.get(extensions_2.IExtensionsWorkbenchService);
                    const hostService = accessor.get(host_1.IHostService);
                    const notificationService = accessor.get(notification_1.INotificationService);
                    const extensions = Array.isArray(resources) ? resources : [resources];
                    await async_1.Promises.settled(extensions.map(async (vsix) => await extensionsWorkbenchService.install(vsix)))
                        .then(async (extensions) => {
                        for (const extension of extensions) {
                            const requireReload = !(extension.local && extensionService.canAddExtension((0, extensions_3.toExtensionDescription)(extension.local)));
                            const message = requireReload ? (0, nls_1.localize)(62, null, extension.displayName || extension.name)
                                : (0, nls_1.localize)(63, null, extension.displayName || extension.name);
                            const actions = requireReload ? [{
                                    label: (0, nls_1.localize)(64, null),
                                    run: () => hostService.reload()
                                }] : [];
                            notificationService.prompt(notification_1.Severity.Info, message, actions);
                        }
                    });
                }
            });
            const extensionsFilterSubMenu = new actions_1.MenuId('extensionsFilterSubMenu');
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.ViewContainerTitle, {
                submenu: extensionsFilterSubMenu,
                title: (0, nls_1.localize)(65, null),
                when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID),
                group: 'navigation',
                order: 1,
                icon: extensionsIcons_1.filterIcon,
            });
            const showFeaturedExtensionsId = 'extensions.filter.featured';
            this.registerExtensionAction({
                id: showFeaturedExtensionsId,
                title: { value: (0, nls_1.localize)(66, null), original: 'Show Featured Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: exports.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: exports.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(67, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@featured '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showPopularExtensions',
                title: { value: (0, nls_1.localize)(68, null), original: 'Show Popular Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: exports.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: exports.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(69, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@popular '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showRecommendedExtensions',
                title: { value: (0, nls_1.localize)(70, null), original: 'Show Recommended Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: exports.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: exports.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(71, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@recommended '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.recentlyPublishedExtensions',
                title: { value: (0, nls_1.localize)(72, null), original: 'Show Recently Published Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: exports.CONTEXT_HAS_GALLERY
                    }, {
                        id: extensionsFilterSubMenu,
                        when: exports.CONTEXT_HAS_GALLERY,
                        group: '1_predefined',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(73, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@sort:publishedDate '))
            });
            const extensionsCategoryFilterSubMenu = new actions_1.MenuId('extensionsCategoryFilterSubMenu');
            actions_1.MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsCategoryFilterSubMenu,
                title: (0, nls_1.localize)(74, null),
                when: exports.CONTEXT_HAS_GALLERY,
                group: '2_categories',
                order: 1,
            });
            extensions_4.EXTENSION_CATEGORIES.map((category, index) => {
                this.registerExtensionAction({
                    id: `extensions.actions.searchByCategory.${category}`,
                    title: category,
                    menu: [{
                            id: extensionsCategoryFilterSubMenu,
                            when: exports.CONTEXT_HAS_GALLERY,
                            order: index,
                        }],
                    run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, `@category:"${category.toLowerCase()}"`))
                });
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.listBuiltInExtensions',
                title: { value: (0, nls_1.localize)(75, null), original: 'Show Built-in Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 1,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(76, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@builtin '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.listTrustRequiredExtensions',
                title: { value: (0, nls_1.localize)(77, null), original: 'Show Extensions Requiring Trust' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@trustRequired'))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showInstalledExtensions',
                title: { value: (0, nls_1.localize)(78, null), original: 'Show Installed Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 2,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(79, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@installed '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showEnabledExtensions',
                title: { value: (0, nls_1.localize)(80, null), original: 'Show Enabled Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 3,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(81, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@enabled '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.showDisabledExtensions',
                title: { value: (0, nls_1.localize)(82, null), original: 'Show Disabled Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 4,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(83, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@disabled '))
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.listOutdatedExtensions',
                title: { value: (0, nls_1.localize)(84, null), original: 'Show Outdated Extensions' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkey_1.ContextKeyAndExpr.create([exports.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])])
                    }, {
                        id: extensionsFilterSubMenu,
                        group: '3_installed',
                        order: 5,
                    }],
                menuTitles: {
                    [extensionsFilterSubMenu.id]: (0, nls_1.localize)(85, null)
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.SearchExtensionsAction, '@outdated '))
            });
            const extensionsSortSubMenu = new actions_1.MenuId('extensionsSortSubMenu');
            actions_1.MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
                submenu: extensionsSortSubMenu,
                title: (0, nls_1.localize)(86, null),
                when: exports.CONTEXT_HAS_GALLERY,
                group: '4_sort',
                order: 1,
            });
            [
                { id: 'installs', title: (0, nls_1.localize)(87, null) },
                { id: 'rating', title: (0, nls_1.localize)(88, null) },
                { id: 'name', title: (0, nls_1.localize)(89, null) },
                { id: 'publishedDate', title: (0, nls_1.localize)(90, null) },
            ].map(({ id, title }, index) => {
                this.registerExtensionAction({
                    id: `extensions.sort.${id}`,
                    title,
                    precondition: extensions_2.DefaultViewsContext.toNegated(),
                    menu: [{
                            id: extensionsSortSubMenu,
                            when: exports.CONTEXT_HAS_GALLERY,
                            order: index,
                        }],
                    toggled: extensions_2.ExtensionsSortByContext.isEqualTo(id),
                    run: async () => {
                        const viewlet = await this.viewletService.openViewlet(extensions_2.VIEWLET_ID, true);
                        const extensionsViewPaneContainer = viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer();
                        const currentQuery = extensionQuery_1.Query.parse(extensionsViewPaneContainer.searchValue || '');
                        extensionsViewPaneContainer.search(new extensionQuery_1.Query(currentQuery.value, id, currentQuery.groupBy).toString());
                        extensionsViewPaneContainer.focus();
                    }
                });
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.clearExtensionsSearchResults',
                title: { value: (0, nls_1.localize)(91, null), original: 'Clear Extensions Search Results' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                icon: extensionsIcons_1.clearSearchResultsIcon,
                f1: true,
                precondition: extensions_2.DefaultViewsContext.toNegated(),
                menu: {
                    id: actions_1.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID),
                    group: 'navigation',
                    order: 3,
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(views_1.IViewsService).getActiveViewPaneContainerWithId(extensions_2.VIEWLET_ID);
                    if (viewPaneContainer) {
                        const extensionsViewPaneContainer = viewPaneContainer;
                        extensionsViewPaneContainer.search('');
                        extensionsViewPaneContainer.focus();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.refreshExtension',
                title: { value: (0, nls_1.localize)(92, null), original: 'Refresh' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                icon: extensionsIcons_1.refreshIcon,
                f1: true,
                menu: {
                    id: actions_1.MenuId.ViewContainerTitle,
                    when: contextkey_1.ContextKeyEqualsExpr.create('viewContainer', extensions_2.VIEWLET_ID),
                    group: 'navigation',
                    order: 2
                },
                run: async (accessor) => {
                    const viewPaneContainer = accessor.get(views_1.IViewsService).getActiveViewPaneContainerWithId(extensions_2.VIEWLET_ID);
                    if (viewPaneContainer) {
                        await viewPaneContainer.refresh();
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.installWorkspaceRecommendedExtensions',
                title: (0, nls_1.localize)(93, null),
                icon: extensionsIcons_1.installWorkspaceRecommendedIcon,
                menu: {
                    id: actions_1.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID),
                    group: 'navigation',
                    order: 1
                },
                run: async (accessor) => {
                    const view = accessor.get(views_1.IViewsService).getActiveViewWithId(extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID);
                    return view.installWorkspaceRecommendations();
                }
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.ID,
                title: extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL,
                icon: extensionsIcons_1.configureRecommendedIcon,
                menu: [{
                        id: actions_1.MenuId.CommandPalette,
                        when: contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'),
                    }, {
                        id: actions_1.MenuId.ViewTitle,
                        when: contextkey_1.ContextKeyEqualsExpr.create('view', extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID),
                        group: 'navigation',
                        order: 2
                    }],
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction, extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.ID, extensionsActions_1.ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL))
            });
            this.registerExtensionAction({
                id: extensionsActions_1.InstallSpecificVersionOfExtensionAction.ID,
                title: { value: extensionsActions_1.InstallSpecificVersionOfExtensionAction.LABEL, original: 'Install Specific Version of Extension...' },
                category: extensionManagement_1.ExtensionsLocalizedLabel,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyAndExpr.create([exports.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER, exports.CONTEXT_HAS_WEB_SERVER])])
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.InstallSpecificVersionOfExtensionAction, extensionsActions_1.InstallSpecificVersionOfExtensionAction.ID, extensionsActions_1.InstallSpecificVersionOfExtensionAction.LABEL))
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ReinstallAction.ID,
                title: { value: extensionsActions_1.ReinstallAction.LABEL, original: 'Reinstall Extension...' },
                category: actions_2.CATEGORIES.Developer,
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyAndExpr.create([exports.CONTEXT_HAS_GALLERY, contextkey_1.ContextKeyOrExpr.create([exports.CONTEXT_HAS_LOCAL_SERVER, exports.CONTEXT_HAS_REMOTE_SERVER])])
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ReinstallAction, extensionsActions_1.ReinstallAction.ID, extensionsActions_1.ReinstallAction.LABEL))
            });
        }
        // Extension Context Menu
        registerContextMenuActions() {
            this.registerExtensionAction({
                id: 'workbench.extensions.action.copyExtension',
                title: { value: (0, nls_1.localize)(94, null), original: 'Copy' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, extensionId) => {
                    const clipboardService = accessor.get(clipboardService_1.IClipboardService);
                    let extension = this.extensionsWorkbenchService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, { id: extensionId }))[0]
                        || (await this.extensionsWorkbenchService.queryGallery({ names: [extensionId], pageSize: 1 }, cancellation_1.CancellationToken.None)).firstPage[0];
                    if (extension) {
                        const name = (0, nls_1.localize)(95, null, extension.displayName);
                        const id = (0, nls_1.localize)(96, null, extensionId);
                        const description = (0, nls_1.localize)(97, null, extension.description);
                        const verision = (0, nls_1.localize)(98, null, extension.version);
                        const publisher = (0, nls_1.localize)(99, null, extension.publisherDisplayName);
                        const link = extension.url ? (0, nls_1.localize)(100, null, `${extension.url}`) : null;
                        const clipboardStr = `${name}\n${id}\n${description}\n${verision}\n${publisher}${link ? '\n' + link : ''}`;
                        await clipboardService.writeText(clipboardStr);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.copyExtensionId',
                title: { value: (0, nls_1.localize)(101, null), original: 'Copy Extension Id' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '1_copy'
                },
                run: async (accessor, id) => accessor.get(clipboardService_1.IClipboardService).writeText(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.configure',
                title: { value: (0, nls_1.localize)(102, null), original: 'Extension Settings' },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('extensionStatus', 'installed'), contextkey_1.ContextKeyExpr.has('extensionHasConfiguration'))
                },
                run: async (accessor, id) => accessor.get(preferences_1.IPreferencesService).openSettings(false, `@ext:${id}`)
            });
            this.registerExtensionAction({
                id: extensions_2.TOGGLE_IGNORE_EXTENSION_ACTION_ID,
                title: { value: (0, nls_1.localize)(103, null), original: `Sync This Extension` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '2_configure',
                    when: contextkey_1.ContextKeyExpr.and(userDataSync_1.CONTEXT_SYNC_ENABLEMENT, contextkey_1.ContextKeyExpr.has('inExtensionEditor').negate())
                },
                run: async (accessor, id) => {
                    const extension = this.extensionsWorkbenchService.local.find(e => (0, extensionManagementUtil_1.areSameExtensions)({ id }, e.identifier));
                    if (extension) {
                        return this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(extension);
                    }
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.ignoreRecommendation',
                title: { value: (0, nls_1.localize)(104, null), original: `Ignore Recommendation` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.has('isExtensionRecommended'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, true)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.undoIgnoredRecommendation',
                title: { value: (0, nls_1.localize)(105, null), original: `Undo Ignored Recommendation` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.has('isUserIgnoredRecommendation'),
                    order: 1
                },
                run: async (accessor, id) => accessor.get(extensionRecommendations_1.IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, false)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addExtensionToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)(106, null), original: `Add to Workspace Recommendations` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate(), contextkey_1.ContextKeyExpr.has('isExtensionWorkspaceRecommended').negate(), contextkey_1.ContextKeyExpr.has('isUserIgnoredRecommendation').negate()),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.IWorkpsaceExtensionsConfigService).toggleRecommendation(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.removeExtensionFromWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)(107, null), original: `Remove from Workspace Recommendations` },
                menu: {
                    id: actions_1.MenuId.ExtensionContext,
                    group: '3_recommendations',
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('empty'), contextkey_1.ContextKeyExpr.has('isBuiltinExtension').negate(), contextkey_1.ContextKeyExpr.has('isExtensionWorkspaceRecommended')),
                    order: 2
                },
                run: (accessor, id) => accessor.get(workspaceExtensionsConfig_1.IWorkpsaceExtensionsConfigService).toggleRecommendation(id)
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceRecommendations',
                title: { value: (0, nls_1.localize)(108, null), original: `Add Extension to Workspace Recommendations` },
                category: (0, nls_1.localize)(109, null),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const workpsaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.IWorkpsaceExtensionsConfigService);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.ExtensionsInput)) {
                        return;
                    }
                    const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
                    const recommendations = await workpsaceExtensionsConfigService.getRecommendations();
                    if (recommendations.includes(extensionId)) {
                        return;
                    }
                    await workpsaceExtensionsConfigService.toggleRecommendation(extensionId);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceFolderRecommendations',
                title: { value: (0, nls_1.localize)(110, null), original: `Add Extension to Workspace Folder Recommendations` },
                category: (0, nls_1.localize)(111, null),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('folder'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.commandService.executeCommand('workbench.extensions.action.addToWorkspaceRecommendations')
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceIgnoredRecommendations',
                title: { value: (0, nls_1.localize)(112, null), original: `Add Extension to Workspace Ignored Recommendations` },
                category: (0, nls_1.localize)(113, null),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                async run(accessor) {
                    const editorService = accessor.get(editorService_1.IEditorService);
                    const workpsaceExtensionsConfigService = accessor.get(workspaceExtensionsConfig_1.IWorkpsaceExtensionsConfigService);
                    if (!(editorService.activeEditor instanceof extensionsInput_1.ExtensionsInput)) {
                        return;
                    }
                    const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
                    const unwatedRecommendations = await workpsaceExtensionsConfigService.getUnwantedRecommendations();
                    if (unwatedRecommendations.includes(extensionId)) {
                        return;
                    }
                    await workpsaceExtensionsConfigService.toggleUnwantedRecommendation(extensionId);
                }
            });
            this.registerExtensionAction({
                id: 'workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations',
                title: { value: (0, nls_1.localize)(114, null), original: `Add Extension to Workspace Folder Ignored Recommendations` },
                category: (0, nls_1.localize)(115, null),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('folder'), contextkey_1.ContextKeyExpr.equals('resourceScheme', network_1.Schemas.extension)),
                },
                run: () => this.commandService.executeCommand('workbench.extensions.action.addToWorkspaceIgnoredRecommendations')
            });
            this.registerExtensionAction({
                id: extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.ID,
                title: { value: extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.LABEL, original: 'Configure Recommended Extensions (Workspace)' },
                category: (0, nls_1.localize)(116, null),
                menu: {
                    id: actions_1.MenuId.CommandPalette,
                    when: contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'),
                },
                run: () => runAction(this.instantiationService.createInstance(extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction, extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.ID, extensionsActions_1.ConfigureWorkspaceRecommendedExtensionsAction.LABEL))
            });
        }
        registerExtensionAction(extensionActionOptions) {
            const menus = extensionActionOptions.menu ? (0, types_1.isArray)(extensionActionOptions.menu) ? extensionActionOptions.menu : [extensionActionOptions.menu] : [];
            let menusWithOutTitles = [];
            const menusWithTitles = [];
            if (extensionActionOptions.menuTitles) {
                for (let index = 0; index < menus.length; index++) {
                    const menu = menus[index];
                    const menuTitle = extensionActionOptions.menuTitles[menu.id.id];
                    if (menuTitle) {
                        menusWithTitles.push({ id: menu.id, item: Object.assign(Object.assign({}, menu), { command: { id: extensionActionOptions.id, title: menuTitle } }) });
                    }
                    else {
                        menusWithOutTitles.push(menu);
                    }
                }
            }
            else {
                menusWithOutTitles = menus;
            }
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, actions_1.registerAction2)(class extends actions_1.Action2 {
                constructor() {
                    super(Object.assign(Object.assign({}, extensionActionOptions), { menu: menusWithOutTitles }));
                }
                run(accessor, ...args) {
                    return extensionActionOptions.run(accessor, ...args);
                }
            }));
            if (menusWithTitles.length) {
                disposables.add(actions_1.MenuRegistry.appendMenuItems(menusWithTitles));
            }
            return disposables;
        }
    };
    ExtensionsContributions = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, extensionManagement_1.IExtensionGalleryService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, viewlet_1.IViewletService),
        __param(4, extensions_2.IExtensionsWorkbenchService),
        __param(5, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, dialogs_1.IDialogService),
        __param(8, commands_1.ICommandService)
    ], ExtensionsContributions);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 1 /* Starting */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.StatusUpdater, 3 /* Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.MaliciousExtensionChecker, 4 /* Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsUtils_1.KeymapExtensions, 3 /* Restored */);
    workbenchRegistry.registerWorkbenchContribution(extensionsViewlet_1.ExtensionsViewletViewsContribution, 1 /* Starting */);
    workbenchRegistry.registerWorkbenchContribution(extensionsActivationProgress_1.ExtensionActivationProgress, 4 /* Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionsDependencyChecker_1.ExtensionDependencyChecker, 4 /* Eventually */);
    workbenchRegistry.registerWorkbenchContribution(extensionEnablementByWorkspaceTrustRequirement_1.ExtensionEnablementByWorkspaceTrustRequirement, 3 /* Restored */);
    // Running Extensions
    const actionRegistry = platform_1.Registry.as(actions_2.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(actions_1.SyncActionDescriptor.from(abstractRuntimeExtensionsEditor_1.ShowRuntimeExtensionsAction), 'Show Running Extensions', actions_2.CATEGORIES.Developer.value);
});
//# sourceMappingURL=extensions.contribution.js.map