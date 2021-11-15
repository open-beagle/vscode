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
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/layoutActions", "vs/platform/registry/common/platform", "vs/base/common/actions", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/base/common/keyCodes", "vs/base/common/platform", "vs/platform/contextkey/common/contextkeys", "vs/platform/keybinding/common/keybindingsRegistry", "vs/workbench/common/editor", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/viewlet", "vs/workbench/common/views", "vs/platform/quickinput/common/quickInput", "vs/platform/notification/common/notification", "vs/workbench/services/activityBar/browser/activityBarService", "vs/workbench/services/panel/common/panelService"], function (require, exports, nls_1, platform_1, actions_1, actions_2, actions_3, configuration_1, layoutService_1, instantiation_1, keyCodes_1, platform_2, contextkeys_1, keybindingsRegistry_1, editor_1, contextkey_1, viewlet_1, views_1, quickInput_1, notification_1, activityBarService_1, panelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecreaseViewHeightAction = exports.DecreaseViewWidthAction = exports.DecreaseViewSizeAction = exports.IncreaseViewHeightAction = exports.IncreaseViewWidthAction = exports.IncreaseViewSizeAction = exports.BaseResizeViewAction = exports.ResetFocusedViewLocationAction = exports.MoveFocusedViewAction = exports.MoveViewAction = exports.ResetViewLocationsAction = exports.ToggleMenuBarAction = exports.ToggleStatusbarVisibilityAction = exports.TOGGLE_SIDEBAR_VISIBILITY_ACTION_ID = exports.ToggleEditorVisibilityAction = exports.ToggleSidebarPositionAction = exports.ToggleActivityBarVisibilityAction = void 0;
    const registry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    // --- Close Side Bar
    class CloseSidebarAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closeSidebar',
                title: { value: (0, nls_1.localize)(0, null), original: 'Close Side Bar' },
                category: actions_3.CATEGORIES.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).setSideBarHidden(true);
        }
    }
    (0, actions_2.registerAction2)(CloseSidebarAction);
    // --- Toggle Activity Bar
    class ToggleActivityBarVisibilityAction extends actions_2.Action2 {
        constructor() {
            super({
                id: ToggleActivityBarVisibilityAction.ID,
                title: { value: ToggleActivityBarVisibilityAction.LABEL, original: 'Toggle Activity Bar Visibility' },
                category: actions_3.CATEGORIES.View,
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const visibility = layoutService.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */);
            const newVisibilityValue = !visibility;
            configurationService.updateValue(ToggleActivityBarVisibilityAction.activityBarVisibleKey, newVisibilityValue);
        }
    }
    exports.ToggleActivityBarVisibilityAction = ToggleActivityBarVisibilityAction;
    ToggleActivityBarVisibilityAction.ID = 'workbench.action.toggleActivityBarVisibility';
    ToggleActivityBarVisibilityAction.LABEL = (0, nls_1.localize)(1, null);
    ToggleActivityBarVisibilityAction.activityBarVisibleKey = 'workbench.activityBar.visible';
    (0, actions_2.registerAction2)(ToggleActivityBarVisibilityAction);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '2_workbench_layout',
        command: {
            id: ToggleActivityBarVisibilityAction.ID,
            title: (0, nls_1.localize)(2, null),
            toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.activityBar.visible', true)
        },
        order: 4
    });
    // --- Toggle Centered Layout
    class ToggleCenteredLayout extends actions_2.Action2 {
        constructor() {
            super({
                id: ToggleCenteredLayout.ID,
                title: { value: (0, nls_1.localize)(3, null), original: 'Toggle Centered Layout' },
                category: actions_3.CATEGORIES.View,
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.centerEditorLayout(!layoutService.isEditorLayoutCentered());
        }
    }
    ToggleCenteredLayout.ID = 'workbench.action.toggleCenteredLayout';
    (0, actions_2.registerAction2)(ToggleCenteredLayout);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '1_toggle_view',
        command: {
            id: ToggleCenteredLayout.ID,
            title: (0, nls_1.localize)(4, null),
            toggled: editor_1.IsCenteredLayoutContext
        },
        order: 3
    });
    // --- Toggle Sidebar Position
    let ToggleSidebarPositionAction = class ToggleSidebarPositionAction extends actions_1.Action {
        constructor(id, label, layoutService, configurationService) {
            super(id, label);
            this.layoutService = layoutService;
            this.configurationService = configurationService;
        }
        run() {
            const position = this.layoutService.getSideBarPosition();
            const newPositionValue = (position === 0 /* LEFT */) ? 'right' : 'left';
            return this.configurationService.updateValue(ToggleSidebarPositionAction.sidebarPositionConfigurationKey, newPositionValue);
        }
        static getLabel(layoutService) {
            return layoutService.getSideBarPosition() === 0 /* LEFT */ ? (0, nls_1.localize)(6, null) : (0, nls_1.localize)(7, null);
        }
    };
    ToggleSidebarPositionAction.ID = 'workbench.action.toggleSidebarPosition';
    ToggleSidebarPositionAction.LABEL = (0, nls_1.localize)(5, null);
    ToggleSidebarPositionAction.sidebarPositionConfigurationKey = 'workbench.sideBar.location';
    ToggleSidebarPositionAction = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService),
        __param(3, configuration_1.IConfigurationService)
    ], ToggleSidebarPositionAction);
    exports.ToggleSidebarPositionAction = ToggleSidebarPositionAction;
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: ToggleSidebarPositionAction.ID,
                title: { value: (0, nls_1.localize)(8, null), original: 'Toggle Side Bar Position' },
                category: actions_3.CATEGORIES.View,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(instantiation_1.IInstantiationService).createInstance(ToggleSidebarPositionAction, ToggleSidebarPositionAction.ID, ToggleSidebarPositionAction.LABEL).run();
        }
    });
    actions_2.MenuRegistry.appendMenuItems([{
            id: actions_2.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)(9, null)
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* Sidebar */))),
                order: 1
            }
        }, {
            id: actions_2.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)(10, null)
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* Sidebar */))),
                order: 1
            }
        }, {
            id: actions_2.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)(11, null)
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* Sidebar */))),
                order: 1
            }
        }, {
            id: actions_2.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: ToggleSidebarPositionAction.ID,
                    title: (0, nls_1.localize)(12, null)
                },
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'), contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* Sidebar */))),
                order: 1
            }
        }]);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: ToggleSidebarPositionAction.ID,
            title: (0, nls_1.localize)(13, null)
        },
        when: contextkey_1.ContextKeyExpr.notEquals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '3_workbench_layout_move',
        command: {
            id: ToggleSidebarPositionAction.ID,
            title: (0, nls_1.localize)(14, null)
        },
        when: contextkey_1.ContextKeyExpr.equals('config.workbench.sideBar.location', 'right'),
        order: 2
    });
    // --- Toggle Sidebar Visibility
    let ToggleEditorVisibilityAction = class ToggleEditorVisibilityAction extends actions_1.Action {
        constructor(id, label, layoutService) {
            super(id, label);
            this.layoutService = layoutService;
        }
        async run() {
            this.layoutService.toggleMaximizedPanel();
        }
    };
    ToggleEditorVisibilityAction.ID = 'workbench.action.toggleEditorVisibility';
    ToggleEditorVisibilityAction.LABEL = (0, nls_1.localize)(15, null);
    ToggleEditorVisibilityAction = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService)
    ], ToggleEditorVisibilityAction);
    exports.ToggleEditorVisibilityAction = ToggleEditorVisibilityAction;
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ToggleEditorVisibilityAction), 'View: Toggle Editor Area Visibility', actions_3.CATEGORIES.View.value);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '2_workbench_layout',
        command: {
            id: ToggleEditorVisibilityAction.ID,
            title: (0, nls_1.localize)(16, null),
            toggled: editor_1.EditorAreaVisibleContext
        },
        order: 5
    });
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarViewMenu, {
        group: '2_appearance',
        title: (0, nls_1.localize)(17, null),
        submenu: actions_2.MenuId.MenubarAppearanceMenu,
        order: 1
    });
    exports.TOGGLE_SIDEBAR_VISIBILITY_ACTION_ID = 'workbench.action.toggleSidebarVisibility';
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: exports.TOGGLE_SIDEBAR_VISIBILITY_ACTION_ID,
                title: { value: (0, nls_1.localize)(18, null), original: 'Toggle Side Bar Visibility' },
                category: actions_3.CATEGORIES.View,
                f1: true,
                keybinding: {
                    weight: 200 /* WorkbenchContrib */,
                    primary: 2048 /* CtrlCmd */ | 32 /* KEY_B */
                }
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.setSideBarHidden(layoutService.isVisible("workbench.parts.sidebar" /* SIDEBAR_PART */));
        }
    });
    actions_2.MenuRegistry.appendMenuItems([{
            id: actions_2.MenuId.ViewContainerTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: exports.TOGGLE_SIDEBAR_VISIBILITY_ACTION_ID,
                    title: (0, nls_1.localize)(19, null),
                },
                when: contextkey_1.ContextKeyExpr.and(viewlet_1.SideBarVisibleContext, contextkey_1.ContextKeyExpr.equals('viewContainerLocation', (0, views_1.ViewContainerLocationToString)(0 /* Sidebar */))),
                order: 2
            }
        }, {
            id: actions_2.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: exports.TOGGLE_SIDEBAR_VISIBILITY_ACTION_ID,
                    title: (0, nls_1.localize)(20, null),
                },
                when: contextkey_1.ContextKeyExpr.and(viewlet_1.SideBarVisibleContext, contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(0 /* Sidebar */))),
                order: 2
            }
        }]);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '2_workbench_layout',
        command: {
            id: exports.TOGGLE_SIDEBAR_VISIBILITY_ACTION_ID,
            title: (0, nls_1.localize)(21, null),
            toggled: viewlet_1.SideBarVisibleContext
        },
        order: 1
    });
    // --- Toggle Statusbar Visibility
    let ToggleStatusbarVisibilityAction = class ToggleStatusbarVisibilityAction extends actions_1.Action {
        constructor(id, label, layoutService, configurationService) {
            super(id, label);
            this.layoutService = layoutService;
            this.configurationService = configurationService;
        }
        run() {
            const visibility = this.layoutService.isVisible("workbench.parts.statusbar" /* STATUSBAR_PART */);
            const newVisibilityValue = !visibility;
            return this.configurationService.updateValue(ToggleStatusbarVisibilityAction.statusbarVisibleKey, newVisibilityValue);
        }
    };
    ToggleStatusbarVisibilityAction.ID = 'workbench.action.toggleStatusbarVisibility';
    ToggleStatusbarVisibilityAction.LABEL = (0, nls_1.localize)(22, null);
    ToggleStatusbarVisibilityAction.statusbarVisibleKey = 'workbench.statusBar.visible';
    ToggleStatusbarVisibilityAction = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService),
        __param(3, configuration_1.IConfigurationService)
    ], ToggleStatusbarVisibilityAction);
    exports.ToggleStatusbarVisibilityAction = ToggleStatusbarVisibilityAction;
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ToggleStatusbarVisibilityAction), 'View: Toggle Status Bar Visibility', actions_3.CATEGORIES.View.value);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '2_workbench_layout',
        command: {
            id: ToggleStatusbarVisibilityAction.ID,
            title: (0, nls_1.localize)(23, null),
            toggled: contextkey_1.ContextKeyExpr.equals('config.workbench.statusBar.visible', true)
        },
        order: 3
    });
    // --- Toggle Tabs Visibility
    let ToggleTabsVisibilityAction = class ToggleTabsVisibilityAction extends actions_1.Action {
        constructor(id, label, configurationService) {
            super(id, label);
            this.configurationService = configurationService;
        }
        run() {
            const visibility = this.configurationService.getValue(ToggleTabsVisibilityAction.tabsVisibleKey);
            const newVisibilityValue = !visibility;
            return this.configurationService.updateValue(ToggleTabsVisibilityAction.tabsVisibleKey, newVisibilityValue);
        }
    };
    ToggleTabsVisibilityAction.ID = 'workbench.action.toggleTabsVisibility';
    ToggleTabsVisibilityAction.LABEL = (0, nls_1.localize)(24, null);
    ToggleTabsVisibilityAction.tabsVisibleKey = 'workbench.editor.showTabs';
    ToggleTabsVisibilityAction = __decorate([
        __param(2, configuration_1.IConfigurationService)
    ], ToggleTabsVisibilityAction);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ToggleTabsVisibilityAction, {
        primary: undefined,
        mac: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 53 /* KEY_W */, },
        linux: { primary: 2048 /* CtrlCmd */ | 256 /* WinCtrl */ | 53 /* KEY_W */, }
    }), 'View: Toggle Tab Visibility', actions_3.CATEGORIES.View.value);
    // --- Toggle Zen Mode
    let ToggleZenMode = class ToggleZenMode extends actions_1.Action {
        constructor(id, label, layoutService) {
            super(id, label);
            this.layoutService = layoutService;
        }
        async run() {
            this.layoutService.toggleZenMode();
        }
    };
    ToggleZenMode.ID = 'workbench.action.toggleZenMode';
    ToggleZenMode.LABEL = (0, nls_1.localize)(25, null);
    ToggleZenMode = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService)
    ], ToggleZenMode);
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ToggleZenMode, { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 56 /* KEY_Z */) }), 'View: Toggle Zen Mode', actions_3.CATEGORIES.View.value);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '1_toggle_view',
        command: {
            id: ToggleZenMode.ID,
            title: (0, nls_1.localize)(26, null),
            toggled: editor_1.InEditorZenModeContext
        },
        order: 2
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.exitZenMode',
        weight: 100 /* EditorContrib */ - 1000,
        handler(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.toggleZenMode();
        },
        when: editor_1.InEditorZenModeContext,
        primary: (0, keyCodes_1.KeyChord)(9 /* Escape */, 9 /* Escape */)
    });
    // --- Toggle Menu Bar
    let ToggleMenuBarAction = class ToggleMenuBarAction extends actions_1.Action {
        constructor(id, label, layoutService) {
            super(id, label);
            this.layoutService = layoutService;
        }
        async run() {
            this.layoutService.toggleMenuBar();
        }
    };
    ToggleMenuBarAction.ID = 'workbench.action.toggleMenuBar';
    ToggleMenuBarAction.LABEL = (0, nls_1.localize)(27, null);
    ToggleMenuBarAction = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService)
    ], ToggleMenuBarAction);
    exports.ToggleMenuBarAction = ToggleMenuBarAction;
    if (platform_2.isWindows || platform_2.isLinux || platform_2.isWeb) {
        registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ToggleMenuBarAction), 'View: Toggle Menu Bar', actions_3.CATEGORIES.View.value);
    }
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.MenubarAppearanceMenu, {
        group: '2_workbench_layout',
        command: {
            id: ToggleMenuBarAction.ID,
            title: (0, nls_1.localize)(28, null),
            toggled: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext.toNegated(), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'hidden'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'toggle'), contextkey_1.ContextKeyExpr.notEquals('config.window.menuBarVisibility', 'compact'))
        },
        when: contextkeys_1.IsMacNativeContext.toNegated(),
        order: 0
    });
    // --- Reset View Positions
    let ResetViewLocationsAction = class ResetViewLocationsAction extends actions_1.Action {
        constructor(id, label, viewDescriptorService) {
            super(id, label);
            this.viewDescriptorService = viewDescriptorService;
        }
        async run() {
            this.viewDescriptorService.reset();
        }
    };
    ResetViewLocationsAction.ID = 'workbench.action.resetViewLocations';
    ResetViewLocationsAction.LABEL = (0, nls_1.localize)(29, null);
    ResetViewLocationsAction = __decorate([
        __param(2, views_1.IViewDescriptorService)
    ], ResetViewLocationsAction);
    exports.ResetViewLocationsAction = ResetViewLocationsAction;
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ResetViewLocationsAction), 'View: Reset View Locations', actions_3.CATEGORIES.View.value);
    // --- Move View with Command
    let MoveViewAction = class MoveViewAction extends actions_1.Action {
        constructor(id, label, viewDescriptorService, instantiationService, quickInputService, contextKeyService, activityBarService, panelService) {
            super(id, label);
            this.viewDescriptorService = viewDescriptorService;
            this.instantiationService = instantiationService;
            this.quickInputService = quickInputService;
            this.contextKeyService = contextKeyService;
            this.activityBarService = activityBarService;
            this.panelService = panelService;
        }
        getViewItems() {
            const results = [];
            const viewlets = this.activityBarService.getVisibleViewContainerIds();
            viewlets.forEach(viewletId => {
                const container = this.viewDescriptorService.getViewContainerById(viewletId);
                const containerModel = this.viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)(31, null, containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name
                        });
                    }
                });
            });
            const panels = this.panelService.getPinnedPanels();
            panels.forEach(panel => {
                const container = this.viewDescriptorService.getViewContainerById(panel.id);
                const containerModel = this.viewDescriptorService.getViewContainerModel(container);
                let hasAddedView = false;
                containerModel.visibleViewDescriptors.forEach(viewDescriptor => {
                    if (viewDescriptor.canMoveView) {
                        if (!hasAddedView) {
                            results.push({
                                type: 'separator',
                                label: (0, nls_1.localize)(32, null, containerModel.title)
                            });
                            hasAddedView = true;
                        }
                        results.push({
                            id: viewDescriptor.id,
                            label: viewDescriptor.name
                        });
                    }
                });
            });
            return results;
        }
        async getView(viewId) {
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)(33, null);
            quickPick.items = this.getViewItems();
            quickPick.selectedItems = quickPick.items.filter(item => item.id === viewId);
            return new Promise((resolve, reject) => {
                quickPick.onDidAccept(() => {
                    const viewId = quickPick.selectedItems[0];
                    if (viewId.id) {
                        resolve(viewId.id);
                    }
                    else {
                        reject();
                    }
                    quickPick.hide();
                });
                quickPick.onDidHide(() => reject());
                quickPick.show();
            });
        }
        async run() {
            var _a;
            const focusedViewId = views_1.FocusedViewContext.getValue(this.contextKeyService);
            let viewId;
            if (focusedViewId && ((_a = this.viewDescriptorService.getViewDescriptorById(focusedViewId)) === null || _a === void 0 ? void 0 : _a.canMoveView)) {
                viewId = focusedViewId;
            }
            viewId = await this.getView(viewId);
            if (!viewId) {
                return;
            }
            this.instantiationService.createInstance(MoveFocusedViewAction, MoveFocusedViewAction.ID, MoveFocusedViewAction.LABEL).run(viewId);
        }
    };
    MoveViewAction.ID = 'workbench.action.moveView';
    MoveViewAction.LABEL = (0, nls_1.localize)(30, null);
    MoveViewAction = __decorate([
        __param(2, views_1.IViewDescriptorService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, activityBarService_1.IActivityBarService),
        __param(7, panelService_1.IPanelService)
    ], MoveViewAction);
    exports.MoveViewAction = MoveViewAction;
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(MoveViewAction), 'View: Move View', actions_3.CATEGORIES.View.value);
    // --- Move Focused View with Command
    let MoveFocusedViewAction = class MoveFocusedViewAction extends actions_1.Action {
        constructor(id, label, viewDescriptorService, viewsService, quickInputService, contextKeyService, notificationService, activityBarService, panelService) {
            super(id, label);
            this.viewDescriptorService = viewDescriptorService;
            this.viewsService = viewsService;
            this.quickInputService = quickInputService;
            this.contextKeyService = contextKeyService;
            this.notificationService = notificationService;
            this.activityBarService = activityBarService;
            this.panelService = panelService;
        }
        async run(viewId) {
            const focusedViewId = viewId || views_1.FocusedViewContext.getValue(this.contextKeyService);
            if (focusedViewId === undefined || focusedViewId.trim() === '') {
                this.notificationService.error((0, nls_1.localize)(35, null));
                return;
            }
            const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(focusedViewId);
            if (!viewDescriptor || !viewDescriptor.canMoveView) {
                this.notificationService.error((0, nls_1.localize)(36, null));
                return;
            }
            const quickPick = this.quickInputService.createQuickPick();
            quickPick.placeholder = (0, nls_1.localize)(37, null);
            quickPick.title = (0, nls_1.localize)(38, null, viewDescriptor.name);
            const items = [];
            const currentContainer = this.viewDescriptorService.getViewContainerByViewId(focusedViewId);
            const currentLocation = this.viewDescriptorService.getViewLocationById(focusedViewId);
            const isViewSolo = this.viewDescriptorService.getViewContainerModel(currentContainer).allViewDescriptors.length === 1;
            if (!(isViewSolo && currentLocation === 1 /* Panel */)) {
                items.push({
                    id: '_.panel.newcontainer',
                    label: (0, nls_1.localize)(39, null),
                });
            }
            if (!(isViewSolo && currentLocation === 0 /* Sidebar */)) {
                items.push({
                    id: '_.sidebar.newcontainer',
                    label: (0, nls_1.localize)(40, null)
                });
            }
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)(41, null)
            });
            const pinnedViewlets = this.activityBarService.getVisibleViewContainerIds();
            items.push(...pinnedViewlets
                .filter(viewletId => {
                if (viewletId === this.viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !this.viewDescriptorService.getViewContainerById(viewletId).rejectAddedViews;
            })
                .map(viewletId => {
                return {
                    id: viewletId,
                    label: this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerById(viewletId)).title
                };
            }));
            items.push({
                type: 'separator',
                label: (0, nls_1.localize)(42, null)
            });
            const pinnedPanels = this.panelService.getPinnedPanels();
            items.push(...pinnedPanels
                .filter(panel => {
                if (panel.id === this.viewDescriptorService.getViewContainerByViewId(focusedViewId).id) {
                    return false;
                }
                return !this.viewDescriptorService.getViewContainerById(panel.id).rejectAddedViews;
            })
                .map(panel => {
                return {
                    id: panel.id,
                    label: this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerById(panel.id)).title
                };
            }));
            quickPick.items = items;
            quickPick.onDidAccept(() => {
                const destination = quickPick.selectedItems[0];
                if (destination.id === '_.panel.newcontainer') {
                    this.viewDescriptorService.moveViewToLocation(viewDescriptor, 1 /* Panel */);
                    this.viewsService.openView(focusedViewId, true);
                }
                else if (destination.id === '_.sidebar.newcontainer') {
                    this.viewDescriptorService.moveViewToLocation(viewDescriptor, 0 /* Sidebar */);
                    this.viewsService.openView(focusedViewId, true);
                }
                else if (destination.id) {
                    this.viewDescriptorService.moveViewsToContainer([viewDescriptor], this.viewDescriptorService.getViewContainerById(destination.id));
                    this.viewsService.openView(focusedViewId, true);
                }
                quickPick.hide();
            });
            quickPick.show();
        }
    };
    MoveFocusedViewAction.ID = 'workbench.action.moveFocusedView';
    MoveFocusedViewAction.LABEL = (0, nls_1.localize)(34, null);
    MoveFocusedViewAction = __decorate([
        __param(2, views_1.IViewDescriptorService),
        __param(3, views_1.IViewsService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, contextkey_1.IContextKeyService),
        __param(6, notification_1.INotificationService),
        __param(7, activityBarService_1.IActivityBarService),
        __param(8, panelService_1.IPanelService)
    ], MoveFocusedViewAction);
    exports.MoveFocusedViewAction = MoveFocusedViewAction;
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(MoveFocusedViewAction), 'View: Move Focused View', actions_3.CATEGORIES.View.value, views_1.FocusedViewContext.notEqualsTo(''));
    // --- Reset View Location with Command
    let ResetFocusedViewLocationAction = class ResetFocusedViewLocationAction extends actions_1.Action {
        constructor(id, label, viewDescriptorService, contextKeyService, notificationService, viewsService) {
            super(id, label);
            this.viewDescriptorService = viewDescriptorService;
            this.contextKeyService = contextKeyService;
            this.notificationService = notificationService;
            this.viewsService = viewsService;
        }
        async run() {
            const focusedViewId = views_1.FocusedViewContext.getValue(this.contextKeyService);
            let viewDescriptor = null;
            if (focusedViewId !== undefined && focusedViewId.trim() !== '') {
                viewDescriptor = this.viewDescriptorService.getViewDescriptorById(focusedViewId);
            }
            if (!viewDescriptor) {
                this.notificationService.error((0, nls_1.localize)(44, null));
                return;
            }
            const defaultContainer = this.viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
            if (!defaultContainer || defaultContainer === this.viewDescriptorService.getViewContainerByViewId(viewDescriptor.id)) {
                return;
            }
            this.viewDescriptorService.moveViewsToContainer([viewDescriptor], defaultContainer);
            this.viewsService.openView(viewDescriptor.id, true);
        }
    };
    ResetFocusedViewLocationAction.ID = 'workbench.action.resetFocusedViewLocation';
    ResetFocusedViewLocationAction.LABEL = (0, nls_1.localize)(43, null);
    ResetFocusedViewLocationAction = __decorate([
        __param(2, views_1.IViewDescriptorService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, notification_1.INotificationService),
        __param(5, views_1.IViewsService)
    ], ResetFocusedViewLocationAction);
    exports.ResetFocusedViewLocationAction = ResetFocusedViewLocationAction;
    registry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(ResetFocusedViewLocationAction), 'View: Reset Focused View Location', actions_3.CATEGORIES.View.value, views_1.FocusedViewContext.notEqualsTo(''));
    // --- Resize View
    class BaseResizeViewAction extends actions_2.Action2 {
        resizePart(widthChange, heightChange, layoutService, partToResize) {
            let part;
            if (partToResize === undefined) {
                const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */);
                const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* SIDEBAR_PART */);
                const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */);
                if (isSidebarFocus) {
                    part = "workbench.parts.sidebar" /* SIDEBAR_PART */;
                }
                else if (isPanelFocus) {
                    part = "workbench.parts.panel" /* PANEL_PART */;
                }
                else if (isEditorFocus) {
                    part = "workbench.parts.editor" /* EDITOR_PART */;
                }
            }
            else {
                part = partToResize;
            }
            if (part) {
                layoutService.resizePart(part, widthChange, heightChange);
            }
        }
    }
    exports.BaseResizeViewAction = BaseResizeViewAction;
    BaseResizeViewAction.RESIZE_INCREMENT = 6.5; // This is a media-size percentage
    class IncreaseViewSizeAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewSize',
                title: { value: (0, nls_1.localize)(45, null), original: 'Increase Current View Size' },
                f1: true
            });
        }
        async run(accessor) {
            this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService));
        }
    }
    exports.IncreaseViewSizeAction = IncreaseViewSizeAction;
    class IncreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewWidth',
                title: { value: (0, nls_1.localize)(46, null), original: 'Increase Editor Width' },
                f1: true
            });
        }
        async run(accessor) {
            this.resizePart(BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
        }
    }
    exports.IncreaseViewWidthAction = IncreaseViewWidthAction;
    class IncreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.increaseViewHeight',
                title: { value: (0, nls_1.localize)(47, null), original: 'Increase Editor Height' },
                f1: true
            });
        }
        async run(accessor) {
            this.resizePart(0, BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
        }
    }
    exports.IncreaseViewHeightAction = IncreaseViewHeightAction;
    class DecreaseViewSizeAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewSize',
                title: { value: (0, nls_1.localize)(48, null), original: 'Decrease Current View Size' },
                f1: true
            });
        }
        async run(accessor) {
            this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService));
        }
    }
    exports.DecreaseViewSizeAction = DecreaseViewSizeAction;
    class DecreaseViewWidthAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewWidth',
                title: { value: (0, nls_1.localize)(49, null), original: 'Decrease Editor Width' },
                f1: true
            });
        }
        async run(accessor) {
            this.resizePart(-BaseResizeViewAction.RESIZE_INCREMENT, 0, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
        }
    }
    exports.DecreaseViewWidthAction = DecreaseViewWidthAction;
    class DecreaseViewHeightAction extends BaseResizeViewAction {
        constructor() {
            super({
                id: 'workbench.action.decreaseViewHeight',
                title: { value: (0, nls_1.localize)(50, null), original: 'Decrease Editor Height' },
                f1: true
            });
        }
        async run(accessor) {
            this.resizePart(0, -BaseResizeViewAction.RESIZE_INCREMENT, accessor.get(layoutService_1.IWorkbenchLayoutService), "workbench.parts.editor" /* EDITOR_PART */);
        }
    }
    exports.DecreaseViewHeightAction = DecreaseViewHeightAction;
    (0, actions_2.registerAction2)(IncreaseViewSizeAction);
    (0, actions_2.registerAction2)(IncreaseViewWidthAction);
    (0, actions_2.registerAction2)(IncreaseViewHeightAction);
    (0, actions_2.registerAction2)(DecreaseViewSizeAction);
    (0, actions_2.registerAction2)(DecreaseViewWidthAction);
    (0, actions_2.registerAction2)(DecreaseViewHeightAction);
});
//# sourceMappingURL=layoutActions.js.map