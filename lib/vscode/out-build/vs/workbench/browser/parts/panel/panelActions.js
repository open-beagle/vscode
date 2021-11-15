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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/panel/panelActions", "vs/base/common/actions", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/workbench/services/panel/common/panelService", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/compositeBarActions", "vs/workbench/common/panel", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/common/views", "vs/css!./media/panelpart"], function (require, exports, nls_1, actions_1, platform_1, actions_2, actions_3, panelService_1, layoutService_1, compositeBarActions_1, panel_1, contextkey_1, codicons_1, iconRegistry_1, views_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NextPanelViewAction = exports.PreviousPanelViewAction = exports.SwitchPanelViewAction = exports.PlaceHolderToggleCompositePinnedAction = exports.PlaceHolderPanelActivityAction = exports.PanelActivityAction = exports.SetPanelPositionAction = exports.PositionPanelActionConfigs = exports.TogglePanelAction = void 0;
    const maximizeIcon = (0, iconRegistry_1.registerIcon)('panel-maximize', codicons_1.Codicon.chevronUp, (0, nls_1.localize)(0, null));
    const restoreIcon = (0, iconRegistry_1.registerIcon)('panel-restore', codicons_1.Codicon.chevronDown, (0, nls_1.localize)(1, null));
    const closeIcon = (0, iconRegistry_1.registerIcon)('panel-close', codicons_1.Codicon.close, (0, nls_1.localize)(2, null));
    let TogglePanelAction = class TogglePanelAction extends actions_1.Action {
        constructor(id, name, layoutService) {
            super(id, name, layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */) ? 'panel expanded' : 'panel');
            this.layoutService = layoutService;
        }
        async run() {
            this.layoutService.setPanelHidden(this.layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */));
        }
    };
    TogglePanelAction.ID = 'workbench.action.togglePanel';
    TogglePanelAction.LABEL = (0, nls_1.localize)(3, null);
    TogglePanelAction = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService)
    ], TogglePanelAction);
    exports.TogglePanelAction = TogglePanelAction;
    let FocusPanelAction = class FocusPanelAction extends actions_1.Action {
        constructor(id, label, panelService, layoutService) {
            super(id, label);
            this.panelService = panelService;
            this.layoutService = layoutService;
        }
        async run() {
            // Show panel
            if (!this.layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
                this.layoutService.setPanelHidden(false);
            }
            // Focus into active panel
            let panel = this.panelService.getActivePanel();
            if (panel) {
                panel.focus();
            }
        }
    };
    FocusPanelAction.ID = 'workbench.action.focusPanel';
    FocusPanelAction.LABEL = (0, nls_1.localize)(4, null);
    FocusPanelAction = __decorate([
        __param(2, panelService_1.IPanelService),
        __param(3, layoutService_1.IWorkbenchLayoutService)
    ], FocusPanelAction);
    const PositionPanelActionId = {
        LEFT: 'workbench.action.positionPanelLeft',
        RIGHT: 'workbench.action.positionPanelRight',
        BOTTOM: 'workbench.action.positionPanelBottom',
    };
    function createPositionPanelActionConfig(id, alias, label, position) {
        return {
            id,
            alias,
            label,
            value: position,
            when: panel_1.PanelPositionContext.notEqualsTo((0, layoutService_1.positionToString)(position))
        };
    }
    exports.PositionPanelActionConfigs = [
        createPositionPanelActionConfig(PositionPanelActionId.LEFT, 'View: Move Panel Left', (0, nls_1.localize)(5, null), 0 /* LEFT */),
        createPositionPanelActionConfig(PositionPanelActionId.RIGHT, 'View: Move Panel Right', (0, nls_1.localize)(6, null), 1 /* RIGHT */),
        createPositionPanelActionConfig(PositionPanelActionId.BOTTOM, 'View: Move Panel To Bottom', (0, nls_1.localize)(7, null), 2 /* BOTTOM */),
    ];
    const positionByActionId = new Map(exports.PositionPanelActionConfigs.map(config => [config.id, config.value]));
    let SetPanelPositionAction = class SetPanelPositionAction extends actions_1.Action {
        constructor(id, label, layoutService) {
            super(id, label);
            this.layoutService = layoutService;
        }
        async run() {
            const position = positionByActionId.get(this.id);
            this.layoutService.setPanelPosition(position === undefined ? 2 /* BOTTOM */ : position);
        }
    };
    SetPanelPositionAction = __decorate([
        __param(2, layoutService_1.IWorkbenchLayoutService)
    ], SetPanelPositionAction);
    exports.SetPanelPositionAction = SetPanelPositionAction;
    let PanelActivityAction = class PanelActivityAction extends compositeBarActions_1.ActivityAction {
        constructor(activity, panelService) {
            super(activity);
            this.panelService = panelService;
        }
        async run() {
            await this.panelService.openPanel(this.activity.id, true);
            this.activate();
        }
        setActivity(activity) {
            this.activity = activity;
        }
    };
    PanelActivityAction = __decorate([
        __param(1, panelService_1.IPanelService)
    ], PanelActivityAction);
    exports.PanelActivityAction = PanelActivityAction;
    let PlaceHolderPanelActivityAction = class PlaceHolderPanelActivityAction extends PanelActivityAction {
        constructor(id, panelService) {
            super({ id, name: id }, panelService);
        }
    };
    PlaceHolderPanelActivityAction = __decorate([
        __param(1, panelService_1.IPanelService)
    ], PlaceHolderPanelActivityAction);
    exports.PlaceHolderPanelActivityAction = PlaceHolderPanelActivityAction;
    class PlaceHolderToggleCompositePinnedAction extends compositeBarActions_1.ToggleCompositePinnedAction {
        constructor(id, compositeBar) {
            super({ id, name: id, cssClass: undefined }, compositeBar);
        }
        setActivity(activity) {
            this.label = activity.name;
        }
    }
    exports.PlaceHolderToggleCompositePinnedAction = PlaceHolderToggleCompositePinnedAction;
    let SwitchPanelViewAction = class SwitchPanelViewAction extends actions_1.Action {
        constructor(id, name, panelService) {
            super(id, name);
            this.panelService = panelService;
        }
        async run(offset) {
            const pinnedPanels = this.panelService.getPinnedPanels();
            const activePanel = this.panelService.getActivePanel();
            if (!activePanel) {
                return;
            }
            let targetPanelId;
            for (let i = 0; i < pinnedPanels.length; i++) {
                if (pinnedPanels[i].id === activePanel.getId()) {
                    targetPanelId = pinnedPanels[(i + pinnedPanels.length + offset) % pinnedPanels.length].id;
                    break;
                }
            }
            if (typeof targetPanelId === 'string') {
                await this.panelService.openPanel(targetPanelId, true);
            }
        }
    };
    SwitchPanelViewAction = __decorate([
        __param(2, panelService_1.IPanelService)
    ], SwitchPanelViewAction);
    exports.SwitchPanelViewAction = SwitchPanelViewAction;
    let PreviousPanelViewAction = class PreviousPanelViewAction extends SwitchPanelViewAction {
        constructor(id, name, panelService) {
            super(id, name, panelService);
        }
        run() {
            return super.run(-1);
        }
    };
    PreviousPanelViewAction.ID = 'workbench.action.previousPanelView';
    PreviousPanelViewAction.LABEL = (0, nls_1.localize)(8, null);
    PreviousPanelViewAction = __decorate([
        __param(2, panelService_1.IPanelService)
    ], PreviousPanelViewAction);
    exports.PreviousPanelViewAction = PreviousPanelViewAction;
    let NextPanelViewAction = class NextPanelViewAction extends SwitchPanelViewAction {
        constructor(id, name, panelService) {
            super(id, name, panelService);
        }
        run() {
            return super.run(1);
        }
    };
    NextPanelViewAction.ID = 'workbench.action.nextPanelView';
    NextPanelViewAction.LABEL = (0, nls_1.localize)(9, null);
    NextPanelViewAction = __decorate([
        __param(2, panelService_1.IPanelService)
    ], NextPanelViewAction);
    exports.NextPanelViewAction = NextPanelViewAction;
    const actionRegistry = platform_1.Registry.as(actions_3.Extensions.WorkbenchActions);
    actionRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(TogglePanelAction, { primary: 2048 /* CtrlCmd */ | 40 /* KEY_J */ }), 'View: Toggle Panel', actions_3.CATEGORIES.View.value);
    actionRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(FocusPanelAction), 'View: Focus into Panel', actions_3.CATEGORIES.View.value);
    actionRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(PreviousPanelViewAction), 'View: Previous Panel View', actions_3.CATEGORIES.View.value);
    actionRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.from(NextPanelViewAction), 'View: Next Panel View', actions_3.CATEGORIES.View.value);
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleMaximizedPanel',
                title: { value: (0, nls_1.localize)(10, null), original: 'Toggle Maximized Panel' },
                tooltip: (0, nls_1.localize)(11, null),
                category: actions_3.CATEGORIES.View,
                f1: true,
                icon: maximizeIcon,
                toggled: { condition: panel_1.PanelMaximizedContext, icon: restoreIcon, tooltip: (0, nls_1.localize)(12, null) },
                menu: [{
                        id: actions_2.MenuId.PanelTitle,
                        group: 'navigation',
                        order: 1
                    }]
            });
        }
        run(accessor) {
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            if (!layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
                layoutService.setPanelHidden(false);
                // If the panel is not already maximized, maximize it
                if (!layoutService.isPanelMaximized()) {
                    layoutService.toggleMaximizedPanel();
                }
            }
            else {
                layoutService.toggleMaximizedPanel();
            }
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.closePanel',
                title: { value: (0, nls_1.localize)(13, null), original: 'Close Panel' },
                category: actions_3.CATEGORIES.View,
                icon: closeIcon,
                menu: [{
                        id: actions_2.MenuId.CommandPalette,
                        when: panel_1.PanelVisibleContext,
                    }, {
                        id: actions_2.MenuId.PanelTitle,
                        group: 'navigation',
                        order: 2
                    }]
            });
        }
        run(accessor) {
            accessor.get(layoutService_1.IWorkbenchLayoutService).setPanelHidden(true);
        }
    });
    actions_2.MenuRegistry.appendMenuItems([
        {
            id: actions_2.MenuId.MenubarAppearanceMenu,
            item: {
                group: '2_workbench_layout',
                command: {
                    id: TogglePanelAction.ID,
                    title: (0, nls_1.localize)(14, null),
                    toggled: panel_1.ActivePanelContext
                },
                order: 5
            }
        }, {
            id: actions_2.MenuId.ViewTitleContext,
            item: {
                group: '3_workbench_layout_move',
                command: {
                    id: TogglePanelAction.ID,
                    title: { value: (0, nls_1.localize)(15, null), original: 'Hide Panel' },
                },
                when: contextkey_1.ContextKeyExpr.and(panel_1.PanelVisibleContext, contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(1 /* Panel */))),
                order: 2
            }
        }
    ]);
    function registerPositionPanelActionById(config) {
        const { id, label, alias, when } = config;
        // register the workbench action
        actionRegistry.registerWorkbenchAction(actions_2.SyncActionDescriptor.create(SetPanelPositionAction, id, label), alias, actions_3.CATEGORIES.View.value, when);
        // register as a menu item
        actions_2.MenuRegistry.appendMenuItems([{
                id: actions_2.MenuId.MenubarAppearanceMenu,
                item: {
                    group: '3_workbench_layout_move',
                    command: {
                        id,
                        title: label
                    },
                    when,
                    order: 5
                }
            }, {
                id: actions_2.MenuId.ViewTitleContext,
                item: {
                    group: '3_workbench_layout_move',
                    command: {
                        id: id,
                        title: label,
                    },
                    when: contextkey_1.ContextKeyExpr.and(when, contextkey_1.ContextKeyExpr.equals('viewLocation', (0, views_1.ViewContainerLocationToString)(1 /* Panel */))),
                    order: 1
                }
            }]);
    }
    // register each position panel action
    exports.PositionPanelActionConfigs.forEach(registerPositionPanelActionById);
});
//# sourceMappingURL=panelActions.js.map