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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/browser/composite", "vs/platform/instantiation/common/instantiation", "vs/base/common/types", "vs/workbench/browser/panecomposite", "vs/base/common/actions", "vs/workbench/browser/menuActions", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/services/extensions/common/extensions"], function (require, exports, platform_1, composite_1, instantiation_1, types_1, panecomposite_1, actions_1, menuActions_1, actions_2, contextView_1, storage_1, telemetry_1, themeService_1, workspace_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Extensions = exports.PanelRegistry = exports.PanelDescriptor = exports.Panel = void 0;
    let Panel = class Panel extends panecomposite_1.PaneComposite {
        constructor(id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService) {
            super(id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
            this.panelActions = this._register(this.instantiationService.createInstance(menuActions_1.CompositeMenuActions, actions_2.MenuId.PanelTitle, undefined, undefined));
            this._register(this.panelActions.onDidChange(() => this.updateTitleArea()));
        }
        getActions() {
            return [...super.getActions(), ...this.panelActions.getPrimaryActions()];
        }
        getSecondaryActions() {
            return this.mergeSecondaryActions(super.getSecondaryActions(), this.panelActions.getSecondaryActions());
        }
        getContextMenuActions() {
            return this.mergeSecondaryActions(super.getContextMenuActions(), this.panelActions.getContextMenuActions());
        }
        mergeSecondaryActions(actions, panelActions) {
            if (panelActions.length && actions.length) {
                return [
                    ...actions,
                    new actions_1.Separator(),
                    ...panelActions,
                ];
            }
            return panelActions.length ? panelActions : actions;
        }
    };
    Panel = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, storage_1.IStorageService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, extensions_1.IExtensionService),
        __param(7, workspace_1.IWorkspaceContextService)
    ], Panel);
    exports.Panel = Panel;
    /**
     * A panel descriptor is a leightweight descriptor of a panel in the workbench.
     */
    class PanelDescriptor extends composite_1.CompositeDescriptor {
        static create(ctor, id, name, cssClass, order, requestedIndex) {
            return new PanelDescriptor(ctor, id, name, cssClass, order, requestedIndex);
        }
        constructor(ctor, id, name, cssClass, order, requestedIndex) {
            super(ctor, id, name, cssClass, order, requestedIndex);
        }
    }
    exports.PanelDescriptor = PanelDescriptor;
    class PanelRegistry extends composite_1.CompositeRegistry {
        /**
         * Registers a panel to the platform.
         */
        registerPanel(descriptor) {
            super.registerComposite(descriptor);
        }
        /**
         * Deregisters a panel to the platform.
         */
        deregisterPanel(id) {
            super.deregisterComposite(id);
        }
        /**
         * Returns a panel by id.
         */
        getPanel(id) {
            return this.getComposite(id);
        }
        /**
         * Returns an array of registered panels known to the platform.
         */
        getPanels() {
            return this.getComposites();
        }
        /**
         * Sets the id of the panel that should open on startup by default.
         */
        setDefaultPanelId(id) {
            this.defaultPanelId = id;
        }
        /**
         * Gets the id of the panel that should open on startup by default.
         */
        getDefaultPanelId() {
            return (0, types_1.assertIsDefined)(this.defaultPanelId);
        }
        /**
         * Find out if a panel exists with the provided ID.
         */
        hasPanel(id) {
            return this.getPanels().some(panel => panel.id === id);
        }
    }
    exports.PanelRegistry = PanelRegistry;
    exports.Extensions = {
        Panels: 'workbench.contributions.panels'
    };
    platform_1.Registry.add(exports.Extensions.Panels, new PanelRegistry());
});
//# sourceMappingURL=panel.js.map