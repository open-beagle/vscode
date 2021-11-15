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
define(["require", "exports", "vs/platform/contextview/browser/contextView", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "vs/workbench/browser/composite", "vs/platform/workspace/common/workspace", "./parts/views/viewPaneContainer", "vs/base/common/actions", "vs/platform/actions/common/actions"], function (require, exports, contextView_1, telemetry_1, themeService_1, storage_1, instantiation_1, extensions_1, composite_1, workspace_1, viewPaneContainer_1, actions_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PaneComposite = void 0;
    let PaneComposite = class PaneComposite extends composite_1.Composite {
        constructor(id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService) {
            super(id, telemetryService, themeService, storageService);
            this.storageService = storageService;
            this.instantiationService = instantiationService;
            this.contextMenuService = contextMenuService;
            this.extensionService = extensionService;
            this.contextService = contextService;
        }
        create(parent) {
            this.viewPaneContainer = this._register(this.createViewPaneContainer(parent));
            this._register(this.viewPaneContainer.onTitleAreaUpdate(() => this.updateTitleArea()));
            this.viewPaneContainer.create(parent);
        }
        setVisible(visible) {
            var _a;
            super.setVisible(visible);
            (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.setVisible(visible);
        }
        layout(dimension) {
            var _a;
            (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.layout(dimension);
        }
        getOptimalWidth() {
            var _a, _b;
            return (_b = (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.getOptimalWidth()) !== null && _b !== void 0 ? _b : 0;
        }
        openView(id, focus) {
            var _a;
            return (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.openView(id, focus);
        }
        getViewPaneContainer() {
            return this.viewPaneContainer;
        }
        getActionsContext() {
            var _a;
            return (_a = this.getViewPaneContainer()) === null || _a === void 0 ? void 0 : _a.getActionsContext();
        }
        getContextMenuActions() {
            var _a, _b, _c;
            return (_c = (_b = (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.menuActions) === null || _b === void 0 ? void 0 : _b.getContextMenuActions()) !== null && _c !== void 0 ? _c : [];
        }
        getActions() {
            var _a;
            const result = [];
            if ((_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.menuActions) {
                result.push(...this.viewPaneContainer.menuActions.getPrimaryActions());
                if (this.viewPaneContainer.isViewMergedWithContainer()) {
                    result.push(...this.viewPaneContainer.panes[0].menuActions.getPrimaryActions());
                }
            }
            return result;
        }
        getSecondaryActions() {
            var _a;
            if (!((_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.menuActions)) {
                return [];
            }
            const viewPaneActions = this.viewPaneContainer.isViewMergedWithContainer() ? this.viewPaneContainer.panes[0].menuActions.getSecondaryActions() : [];
            let menuActions = this.viewPaneContainer.menuActions.getSecondaryActions();
            const viewsSubmenuActionIndex = menuActions.findIndex(action => action instanceof actions_2.SubmenuItemAction && action.item.submenu === viewPaneContainer_1.ViewsSubMenu);
            if (viewsSubmenuActionIndex !== -1) {
                const viewsSubmenuAction = menuActions[viewsSubmenuActionIndex];
                if (viewsSubmenuAction.actions.some(({ enabled }) => enabled)) {
                    if (menuActions.length === 1 && viewPaneActions.length === 0) {
                        menuActions = viewsSubmenuAction.actions.slice();
                    }
                    else if (viewsSubmenuActionIndex !== 0) {
                        menuActions = [viewsSubmenuAction, ...menuActions.slice(0, viewsSubmenuActionIndex), ...menuActions.slice(viewsSubmenuActionIndex + 1)];
                    }
                }
                else {
                    // Remove views submenu if none of the actions are enabled
                    menuActions.splice(viewsSubmenuActionIndex, 1);
                }
            }
            if (menuActions.length && viewPaneActions.length) {
                return [
                    ...menuActions,
                    new actions_1.Separator(),
                    ...viewPaneActions
                ];
            }
            return menuActions.length ? menuActions : viewPaneActions;
        }
        getActionViewItem(action) {
            var _a;
            return (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.getActionViewItem(action);
        }
        getTitle() {
            var _a, _b;
            return (_b = (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.getTitle()) !== null && _b !== void 0 ? _b : '';
        }
        saveState() {
            super.saveState();
        }
        focus() {
            var _a;
            (_a = this.viewPaneContainer) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    PaneComposite = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, storage_1.IStorageService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, extensions_1.IExtensionService),
        __param(7, workspace_1.IWorkspaceContextService)
    ], PaneComposite);
    exports.PaneComposite = PaneComposite;
});
//# sourceMappingURL=panecomposite.js.map