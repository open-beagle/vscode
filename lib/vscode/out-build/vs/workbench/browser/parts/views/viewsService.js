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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/contextkey/common/contextkey", "vs/base/common/event", "vs/base/common/types", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/browser/parts/views/viewsService", "vs/platform/instantiation/common/extensions", "vs/workbench/services/panel/common/panelService", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/panel", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/platform/contextview/browser/contextView", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/workbench/browser/viewlet", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/base/common/uri", "vs/workbench/common/actions", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/browser/parts/views/viewsViewlet"], function (require, exports, lifecycle_1, views_1, platform_1, storage_1, viewlet_1, contextkey_1, event_1, types_1, actions_1, nls_1, extensions_1, panelService_1, instantiation_1, panel_1, telemetry_1, themeService_1, contextView_1, extensions_2, workspace_1, viewlet_2, configuration_1, layoutService_1, uri_1, actions_2, editorGroupsService_1, viewsViewlet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewsService = void 0;
    let ViewsService = class ViewsService extends lifecycle_1.Disposable {
        constructor(viewDescriptorService, panelService, viewletService, contextKeyService, layoutService) {
            super();
            this.viewDescriptorService = viewDescriptorService;
            this.panelService = panelService;
            this.viewletService = viewletService;
            this.contextKeyService = contextKeyService;
            this.layoutService = layoutService;
            this._onDidChangeViewVisibility = this._register(new event_1.Emitter());
            this.onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
            this._onDidChangeViewContainerVisibility = this._register(new event_1.Emitter());
            this.onDidChangeViewContainerVisibility = this._onDidChangeViewContainerVisibility.event;
            this.viewDisposable = new Map();
            this.visibleViewContextKeys = new Map();
            this.viewPaneContainers = new Map();
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.viewDisposable.forEach(disposable => disposable.dispose());
                this.viewDisposable.clear();
            }));
            this.viewDescriptorService.viewContainers.forEach(viewContainer => this.onDidRegisterViewContainer(viewContainer, this.viewDescriptorService.getViewContainerLocation(viewContainer)));
            this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeContainers(added, removed)));
            this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.onDidChangeContainerLocation(viewContainer, from, to)));
            // View Container Visibility
            this._register(this.viewletService.onDidViewletOpen(viewlet => this._onDidChangeViewContainerVisibility.fire({ id: viewlet.getId(), visible: true, location: 0 /* Sidebar */ })));
            this._register(this.panelService.onDidPanelOpen(e => this._onDidChangeViewContainerVisibility.fire({ id: e.panel.getId(), visible: true, location: 1 /* Panel */ })));
            this._register(this.viewletService.onDidViewletClose(viewlet => this._onDidChangeViewContainerVisibility.fire({ id: viewlet.getId(), visible: false, location: 0 /* Sidebar */ })));
            this._register(this.panelService.onDidPanelClose(panel => this._onDidChangeViewContainerVisibility.fire({ id: panel.getId(), visible: false, location: 1 /* Panel */ })));
            this.focusedViewContextKey = views_1.FocusedViewContext.bindTo(contextKeyService);
        }
        onViewsAdded(added) {
            for (const view of added) {
                this.onViewsVisibilityChanged(view, view.isBodyVisible());
            }
        }
        onViewsVisibilityChanged(view, visible) {
            this.getOrCreateActiveViewContextKey(view).set(visible);
            this._onDidChangeViewVisibility.fire({ id: view.id, visible: visible });
        }
        onViewsRemoved(removed) {
            for (const view of removed) {
                this.onViewsVisibilityChanged(view, false);
            }
        }
        getOrCreateActiveViewContextKey(view) {
            const visibleContextKeyId = (0, views_1.getVisbileViewContextKey)(view.id);
            let contextKey = this.visibleViewContextKeys.get(visibleContextKeyId);
            if (!contextKey) {
                contextKey = new contextkey_1.RawContextKey(visibleContextKeyId, false).bindTo(this.contextKeyService);
                this.visibleViewContextKeys.set(visibleContextKeyId, contextKey);
            }
            return contextKey;
        }
        onDidChangeContainers(added, removed) {
            for (const { container, location } of removed) {
                this.deregisterViewletOrPanel(container, location);
            }
            for (const { container, location } of added) {
                this.onDidRegisterViewContainer(container, location);
            }
        }
        onDidRegisterViewContainer(viewContainer, viewContainerLocation) {
            this.registerViewletOrPanel(viewContainer, viewContainerLocation);
            const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
            this.onViewDescriptorsAdded(viewContainerModel.allViewDescriptors, viewContainer);
            this._register(viewContainerModel.onDidChangeAllViewDescriptors(({ added, removed }) => {
                this.onViewDescriptorsAdded(added, viewContainer);
                this.onViewDescriptorsRemoved(removed);
            }));
            this._register(this.registerOpenViewContainerAction(viewContainer));
        }
        onDidChangeContainerLocation(viewContainer, from, to) {
            this.deregisterViewletOrPanel(viewContainer, from);
            this.registerViewletOrPanel(viewContainer, to);
        }
        onViewDescriptorsAdded(views, container) {
            const location = this.viewDescriptorService.getViewContainerLocation(container);
            if (location === null) {
                return;
            }
            const composite = this.getComposite(container.id, location);
            for (const viewDescriptor of views) {
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(this.registerOpenViewAction(viewDescriptor));
                disposables.add(this.registerFocusViewAction(viewDescriptor, (composite === null || composite === void 0 ? void 0 : composite.name) && composite.name !== composite.id ? composite.name : actions_2.CATEGORIES.View));
                disposables.add(this.registerResetViewLocationAction(viewDescriptor));
                this.viewDisposable.set(viewDescriptor, disposables);
            }
        }
        onViewDescriptorsRemoved(views) {
            for (const view of views) {
                const disposable = this.viewDisposable.get(view);
                if (disposable) {
                    disposable.dispose();
                    this.viewDisposable.delete(view);
                }
            }
        }
        async openComposite(compositeId, location, focus) {
            if (location === 0 /* Sidebar */) {
                return this.viewletService.openViewlet(compositeId, focus);
            }
            else if (location === 1 /* Panel */) {
                return this.panelService.openPanel(compositeId, focus);
            }
            return undefined;
        }
        getComposite(compositeId, location) {
            if (location === 0 /* Sidebar */) {
                return this.viewletService.getViewlet(compositeId);
            }
            else if (location === 1 /* Panel */) {
                return this.panelService.getPanel(compositeId);
            }
            return undefined;
        }
        isViewContainerVisible(id) {
            var _a, _b;
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                switch (viewContainerLocation) {
                    case 1 /* Panel */:
                        return ((_a = this.panelService.getActivePanel()) === null || _a === void 0 ? void 0 : _a.getId()) === id;
                    case 0 /* Sidebar */:
                        return ((_b = this.viewletService.getActiveViewlet()) === null || _b === void 0 ? void 0 : _b.getId()) === id;
                }
            }
            return false;
        }
        getVisibleViewContainer(location) {
            var _a, _b;
            let viewContainerId = undefined;
            switch (location) {
                case 1 /* Panel */:
                    viewContainerId = (_a = this.panelService.getActivePanel()) === null || _a === void 0 ? void 0 : _a.getId();
                    break;
                case 0 /* Sidebar */:
                    viewContainerId = (_b = this.viewletService.getActiveViewlet()) === null || _b === void 0 ? void 0 : _b.getId();
                    break;
            }
            return viewContainerId ? this.viewDescriptorService.getViewContainerById(viewContainerId) : null;
        }
        getActiveViewPaneContainerWithId(viewContainerId) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(viewContainerId);
            return viewContainer ? this.getActiveViewPaneContainer(viewContainer) : null;
        }
        async openViewContainer(id, focus) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                switch (viewContainerLocation) {
                    case 1 /* Panel */:
                        const panel = await this.panelService.openPanel(id, focus);
                        return panel;
                    case 0 /* Sidebar */:
                        const viewlet = await this.viewletService.openViewlet(id, focus);
                        return viewlet || null;
                }
            }
            return null;
        }
        async closeViewContainer(id) {
            var _a, _b;
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            if (viewContainer) {
                const viewContainerLocation = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                switch (viewContainerLocation) {
                    case 1 /* Panel */:
                        return ((_a = this.panelService.getActivePanel()) === null || _a === void 0 ? void 0 : _a.getId()) === id ? this.layoutService.setPanelHidden(true) : undefined;
                    case 0 /* Sidebar */:
                        return ((_b = this.viewletService.getActiveViewlet()) === null || _b === void 0 ? void 0 : _b.getId()) === id ? this.layoutService.setSideBarHidden(true) : undefined;
                }
            }
        }
        isViewVisible(id) {
            const activeView = this.getActiveViewWithId(id);
            return (activeView === null || activeView === void 0 ? void 0 : activeView.isBodyVisible()) || false;
        }
        getActiveViewWithId(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
                if (activeViewPaneContainer) {
                    return activeViewPaneContainer.getView(id);
                }
            }
            return null;
        }
        getViewWithId(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
                if (viewPaneContainer) {
                    return viewPaneContainer.getView(id);
                }
            }
            return null;
        }
        async openView(id, focus) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (!viewContainer) {
                return null;
            }
            if (!this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.some(viewDescriptor => viewDescriptor.id === id)) {
                return null;
            }
            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            const compositeDescriptor = this.getComposite(viewContainer.id, location);
            if (compositeDescriptor) {
                const paneComposite = await this.openComposite(compositeDescriptor.id, location);
                if (paneComposite && paneComposite.openView) {
                    return paneComposite.openView(id, focus) || null;
                }
                else if (focus) {
                    paneComposite === null || paneComposite === void 0 ? void 0 : paneComposite.focus();
                }
            }
            return null;
        }
        closeView(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(id);
            if (viewContainer) {
                const activeViewPaneContainer = this.getActiveViewPaneContainer(viewContainer);
                if (activeViewPaneContainer) {
                    const view = activeViewPaneContainer.getView(id);
                    if (view) {
                        if (activeViewPaneContainer.views.length === 1) {
                            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
                            if (location === 0 /* Sidebar */) {
                                this.layoutService.setSideBarHidden(true);
                            }
                            else if (location === 1 /* Panel */) {
                                this.panelService.hideActivePanel();
                            }
                        }
                        else {
                            view.setExpanded(false);
                        }
                    }
                }
            }
        }
        getActiveViewPaneContainer(viewContainer) {
            const location = this.viewDescriptorService.getViewContainerLocation(viewContainer);
            if (location === 0 /* Sidebar */) {
                const activeViewlet = this.viewletService.getActiveViewlet();
                if ((activeViewlet === null || activeViewlet === void 0 ? void 0 : activeViewlet.getId()) === viewContainer.id) {
                    return activeViewlet.getViewPaneContainer() || null;
                }
            }
            else if (location === 1 /* Panel */) {
                const activePanel = this.panelService.getActivePanel();
                if ((activePanel === null || activePanel === void 0 ? void 0 : activePanel.getId()) === viewContainer.id) {
                    return activePanel.getViewPaneContainer() || null;
                }
            }
            return null;
        }
        getViewProgressIndicator(viewId) {
            const viewContainer = this.viewDescriptorService.getViewContainerByViewId(viewId);
            if (!viewContainer) {
                return undefined;
            }
            const viewPaneContainer = this.viewPaneContainers.get(viewContainer.id);
            if (!viewPaneContainer) {
                return undefined;
            }
            const view = viewPaneContainer.getView(viewId);
            if (!view) {
                return undefined;
            }
            if (viewPaneContainer.isViewMergedWithContainer()) {
                return this.getViewContainerProgressIndicator(viewContainer);
            }
            return view.getProgressIndicator();
        }
        getViewContainerProgressIndicator(viewContainer) {
            return this.viewDescriptorService.getViewContainerLocation(viewContainer) === 0 /* Sidebar */ ? this.viewletService.getProgressIndicator(viewContainer.id) : this.panelService.getProgressIndicator(viewContainer.id);
        }
        registerOpenViewContainerAction(viewContainer) {
            var _a;
            const disposables = new lifecycle_1.DisposableStore();
            if (viewContainer.openCommandActionDescriptor) {
                let { id, title, mnemonicTitle, keybindings, order } = (_a = viewContainer.openCommandActionDescriptor) !== null && _a !== void 0 ? _a : { id: viewContainer.id };
                title = title !== null && title !== void 0 ? title : viewContainer.title;
                const that = this;
                disposables.add((0, actions_1.registerAction2)(class OpenViewContainerAction extends actions_1.Action2 {
                    constructor() {
                        super({
                            id,
                            get title() {
                                const viewContainerLocation = that.viewDescriptorService.getViewContainerLocation(viewContainer);
                                if (viewContainerLocation === 0 /* Sidebar */) {
                                    return { value: (0, nls_1.localize)(0, null, title), original: `Show ${title}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)(1, null, title), original: `Toggle ${title}` };
                                }
                            },
                            category: actions_2.CATEGORIES.View.value,
                            precondition: contextkey_1.ContextKeyExpr.has((0, views_1.getEnabledViewContainerContextKey)(viewContainer.id)),
                            keybinding: keybindings ? Object.assign(Object.assign({}, keybindings), { weight: 200 /* WorkbenchContrib */ }) : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.IEditorGroupsService);
                        const viewDescriptorService = serviceAccessor.get(views_1.IViewDescriptorService);
                        const layoutService = serviceAccessor.get(layoutService_1.IWorkbenchLayoutService);
                        const viewsService = serviceAccessor.get(views_1.IViewsService);
                        const viewContainerLocation = viewDescriptorService.getViewContainerLocation(viewContainer);
                        switch (viewContainerLocation) {
                            case 0 /* Sidebar */:
                                if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus("workbench.parts.sidebar" /* SIDEBAR_PART */)) {
                                    await viewsService.openViewContainer(viewContainer.id, true);
                                }
                                else {
                                    editorGroupService.activeGroup.focus();
                                }
                                break;
                            case 1 /* Panel */:
                                if (!viewsService.isViewContainerVisible(viewContainer.id) || !layoutService.hasFocus("workbench.parts.panel" /* PANEL_PART */)) {
                                    await viewsService.openViewContainer(viewContainer.id, true);
                                }
                                else {
                                    viewsService.closeViewContainer(viewContainer.id);
                                }
                                break;
                        }
                    }
                }));
                if (mnemonicTitle) {
                    const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
                    disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
                        command: {
                            id,
                            title: mnemonicTitle,
                        },
                        group: defaultLocation === 0 /* Sidebar */ ? '3_views' : '4_panels',
                        when: contextkey_1.ContextKeyExpr.has((0, views_1.getEnabledViewContainerContextKey)(viewContainer.id)),
                        order: order !== null && order !== void 0 ? order : Number.MAX_VALUE
                    }));
                }
            }
            return disposables;
        }
        registerOpenViewAction(viewDescriptor) {
            var _a, _b;
            const disposables = new lifecycle_1.DisposableStore();
            if (viewDescriptor.openCommandActionDescriptor) {
                const title = (_a = viewDescriptor.openCommandActionDescriptor.title) !== null && _a !== void 0 ? _a : viewDescriptor.name;
                const commandId = viewDescriptor.openCommandActionDescriptor.id;
                const that = this;
                disposables.add((0, actions_1.registerAction2)(class OpenViewAction extends actions_1.Action2 {
                    constructor() {
                        super({
                            id: commandId,
                            get title() {
                                const viewContainerLocation = that.viewDescriptorService.getViewLocationById(viewDescriptor.id);
                                if (viewContainerLocation === 0 /* Sidebar */) {
                                    return { value: (0, nls_1.localize)(2, null, title), original: `Show ${title}` };
                                }
                                else {
                                    return { value: (0, nls_1.localize)(3, null, title), original: `Toggle ${title}` };
                                }
                            },
                            category: actions_2.CATEGORIES.View.value,
                            precondition: contextkey_1.ContextKeyDefinedExpr.create(`${viewDescriptor.id}.active`),
                            keybinding: viewDescriptor.openCommandActionDescriptor.keybindings ? Object.assign(Object.assign({}, viewDescriptor.openCommandActionDescriptor.keybindings), { weight: 200 /* WorkbenchContrib */ }) : undefined,
                            f1: true
                        });
                    }
                    async run(serviceAccessor) {
                        const editorGroupService = serviceAccessor.get(editorGroupsService_1.IEditorGroupsService);
                        const viewDescriptorService = serviceAccessor.get(views_1.IViewDescriptorService);
                        const layoutService = serviceAccessor.get(layoutService_1.IWorkbenchLayoutService);
                        const viewsService = serviceAccessor.get(views_1.IViewsService);
                        const contextKeyService = serviceAccessor.get(contextkey_1.IContextKeyService);
                        const focusedViewId = views_1.FocusedViewContext.getValue(contextKeyService);
                        if (focusedViewId === viewDescriptor.id) {
                            if (viewDescriptorService.getViewLocationById(viewDescriptor.id) === 0 /* Sidebar */) {
                                editorGroupService.activeGroup.focus();
                            }
                            else {
                                layoutService.setPanelHidden(true);
                            }
                        }
                        else {
                            viewsService.openView(viewDescriptor.id, true);
                        }
                    }
                }));
                if (viewDescriptor.openCommandActionDescriptor.mnemonicTitle) {
                    const defaultViewContainer = this.viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
                    if (defaultViewContainer) {
                        const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(defaultViewContainer);
                        disposables.add(actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
                            command: {
                                id: commandId,
                                title: viewDescriptor.openCommandActionDescriptor.mnemonicTitle,
                            },
                            group: defaultLocation === 0 /* Sidebar */ ? '3_views' : '4_panels',
                            when: contextkey_1.ContextKeyDefinedExpr.create(`${viewDescriptor.id}.active`),
                            order: (_b = viewDescriptor.openCommandActionDescriptor.order) !== null && _b !== void 0 ? _b : Number.MAX_VALUE
                        }));
                    }
                }
            }
            return disposables;
        }
        registerFocusViewAction(viewDescriptor, category) {
            return (0, actions_1.registerAction2)(class FocusViewAction extends actions_1.Action2 {
                constructor() {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    super({
                        id: viewDescriptor.focusCommand ? viewDescriptor.focusCommand.id : `${viewDescriptor.id}.focus`,
                        title: { original: `Focus on ${viewDescriptor.name} View`, value: (0, nls_1.localize)(4, null, viewDescriptor.name) },
                        category,
                        menu: [{
                                id: actions_1.MenuId.CommandPalette,
                                when: viewDescriptor.when,
                            }],
                        keybinding: {
                            when: contextkey_1.ContextKeyExpr.has(`${viewDescriptor.id}.active`),
                            weight: 200 /* WorkbenchContrib */,
                            primary: (_b = (_a = viewDescriptor.focusCommand) === null || _a === void 0 ? void 0 : _a.keybindings) === null || _b === void 0 ? void 0 : _b.primary,
                            secondary: (_d = (_c = viewDescriptor.focusCommand) === null || _c === void 0 ? void 0 : _c.keybindings) === null || _d === void 0 ? void 0 : _d.secondary,
                            linux: (_f = (_e = viewDescriptor.focusCommand) === null || _e === void 0 ? void 0 : _e.keybindings) === null || _f === void 0 ? void 0 : _f.linux,
                            mac: (_h = (_g = viewDescriptor.focusCommand) === null || _g === void 0 ? void 0 : _g.keybindings) === null || _h === void 0 ? void 0 : _h.mac,
                            win: (_k = (_j = viewDescriptor.focusCommand) === null || _j === void 0 ? void 0 : _j.keybindings) === null || _k === void 0 ? void 0 : _k.win
                        }
                    });
                }
                run(accessor) {
                    accessor.get(views_1.IViewsService).openView(viewDescriptor.id, true);
                }
            });
        }
        registerResetViewLocationAction(viewDescriptor) {
            return (0, actions_1.registerAction2)(class ResetViewLocationAction extends actions_1.Action2 {
                constructor() {
                    super({
                        id: `${viewDescriptor.id}.resetViewLocation`,
                        title: {
                            original: 'Reset Location',
                            value: (0, nls_1.localize)(5, null)
                        },
                        menu: [{
                                id: actions_1.MenuId.ViewTitleContext,
                                when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('view', viewDescriptor.id), contextkey_1.ContextKeyExpr.equals(`${viewDescriptor.id}.defaultViewLocation`, false))),
                                group: '1_hide',
                                order: 2
                            }],
                    });
                }
                run(accessor) {
                    const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
                    const defaultContainer = viewDescriptorService.getDefaultContainerById(viewDescriptor.id);
                    const containerModel = viewDescriptorService.getViewContainerModel(defaultContainer);
                    // The default container is hidden so we should try to reset its location first
                    if (defaultContainer.hideIfEmpty && containerModel.visibleViewDescriptors.length === 0) {
                        const defaultLocation = viewDescriptorService.getDefaultViewContainerLocation(defaultContainer);
                        viewDescriptorService.moveViewContainerToLocation(defaultContainer, defaultLocation);
                    }
                    viewDescriptorService.moveViewsToContainer([viewDescriptor], viewDescriptorService.getDefaultContainerById(viewDescriptor.id));
                    accessor.get(views_1.IViewsService).openView(viewDescriptor.id, true);
                }
            });
        }
        registerViewletOrPanel(viewContainer, viewContainerLocation) {
            switch (viewContainerLocation) {
                case 1 /* Panel */:
                    this.registerPanel(viewContainer);
                    break;
                case 0 /* Sidebar */:
                    if (viewContainer.ctorDescriptor) {
                        this.registerViewlet(viewContainer);
                    }
                    break;
            }
        }
        deregisterViewletOrPanel(viewContainer, viewContainerLocation) {
            switch (viewContainerLocation) {
                case 1 /* Panel */:
                    this.deregisterPanel(viewContainer);
                    break;
                case 0 /* Sidebar */:
                    if (viewContainer.ctorDescriptor) {
                        this.deregisterViewlet(viewContainer);
                    }
                    break;
            }
        }
        createViewPaneContainer(element, viewContainer, viewContainerLocation, disposables, instantiationService) {
            const viewPaneContainer = instantiationService.createInstance(viewContainer.ctorDescriptor.ctor, ...(viewContainer.ctorDescriptor.staticArguments || []));
            this.viewPaneContainers.set(viewPaneContainer.getId(), viewPaneContainer);
            disposables.add((0, lifecycle_1.toDisposable)(() => this.viewPaneContainers.delete(viewPaneContainer.getId())));
            disposables.add(viewPaneContainer.onDidAddViews(views => this.onViewsAdded(views)));
            disposables.add(viewPaneContainer.onDidChangeViewVisibility(view => this.onViewsVisibilityChanged(view, view.isBodyVisible())));
            disposables.add(viewPaneContainer.onDidRemoveViews(views => this.onViewsRemoved(views)));
            disposables.add(viewPaneContainer.onDidFocusView(view => this.focusedViewContextKey.set(view.id)));
            disposables.add(viewPaneContainer.onDidBlurView(view => {
                if (this.focusedViewContextKey.get() === view.id) {
                    this.focusedViewContextKey.reset();
                }
            }));
            return viewPaneContainer;
        }
        registerPanel(viewContainer) {
            const that = this;
            let PaneContainerPanel = class PaneContainerPanel extends panel_1.Panel {
                constructor(telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService) {
                    super(viewContainer.id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
                }
                createViewPaneContainer(element) {
                    const viewPaneContainerDisposables = this._register(new lifecycle_1.DisposableStore());
                    // Use composite's instantiation service to get the editor progress service for any editors instantiated within the composite
                    return that.createViewPaneContainer(element, viewContainer, 1 /* Panel */, viewPaneContainerDisposables, this.instantiationService);
                }
            };
            PaneContainerPanel = __decorate([
                __param(0, telemetry_1.ITelemetryService),
                __param(1, storage_1.IStorageService),
                __param(2, instantiation_1.IInstantiationService),
                __param(3, themeService_1.IThemeService),
                __param(4, contextView_1.IContextMenuService),
                __param(5, extensions_2.IExtensionService),
                __param(6, workspace_1.IWorkspaceContextService)
            ], PaneContainerPanel);
            platform_1.Registry.as(panel_1.Extensions.Panels).registerPanel(panel_1.PanelDescriptor.create(PaneContainerPanel, viewContainer.id, viewContainer.title, undefined, viewContainer.order, viewContainer.requestedIndex));
        }
        deregisterPanel(viewContainer) {
            platform_1.Registry.as(panel_1.Extensions.Panels).deregisterPanel(viewContainer.id);
        }
        registerViewlet(viewContainer) {
            const that = this;
            let PaneContainerViewlet = class PaneContainerViewlet extends viewlet_2.Viewlet {
                constructor(configurationService, layoutService, telemetryService, contextService, storageService, instantiationService, themeService, contextMenuService, extensionService) {
                    super(viewContainer.id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, layoutService, configurationService);
                }
                createViewPaneContainer(element) {
                    const viewPaneContainerDisposables = this._register(new lifecycle_1.DisposableStore());
                    // Use composite's instantiation service to get the editor progress service for any editors instantiated within the composite
                    const viewPaneContainer = that.createViewPaneContainer(element, viewContainer, 0 /* Sidebar */, viewPaneContainerDisposables, this.instantiationService);
                    // Only updateTitleArea for non-filter views: microsoft/vscode-remote-release#3676
                    if (!(viewPaneContainer instanceof viewsViewlet_1.FilterViewPaneContainer)) {
                        viewPaneContainerDisposables.add(event_1.Event.any(viewPaneContainer.onDidAddViews, viewPaneContainer.onDidRemoveViews, viewPaneContainer.onTitleAreaUpdate)(() => {
                            // Update title area since there is no better way to update secondary actions
                            this.updateTitleArea();
                        }));
                    }
                    return viewPaneContainer;
                }
            };
            PaneContainerViewlet = __decorate([
                __param(0, configuration_1.IConfigurationService),
                __param(1, layoutService_1.IWorkbenchLayoutService),
                __param(2, telemetry_1.ITelemetryService),
                __param(3, workspace_1.IWorkspaceContextService),
                __param(4, storage_1.IStorageService),
                __param(5, instantiation_1.IInstantiationService),
                __param(6, themeService_1.IThemeService),
                __param(7, contextView_1.IContextMenuService),
                __param(8, extensions_2.IExtensionService)
            ], PaneContainerViewlet);
            platform_1.Registry.as(viewlet_2.Extensions.Viewlets).registerViewlet(viewlet_2.ViewletDescriptor.create(PaneContainerViewlet, viewContainer.id, viewContainer.title, (0, types_1.isString)(viewContainer.icon) ? viewContainer.icon : undefined, viewContainer.order, viewContainer.requestedIndex, viewContainer.icon instanceof uri_1.URI ? viewContainer.icon : undefined));
        }
        deregisterViewlet(viewContainer) {
            platform_1.Registry.as(viewlet_2.Extensions.Viewlets).deregisterViewlet(viewContainer.id);
        }
    };
    ViewsService = __decorate([
        __param(0, views_1.IViewDescriptorService),
        __param(1, panelService_1.IPanelService),
        __param(2, viewlet_1.IViewletService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, layoutService_1.IWorkbenchLayoutService)
    ], ViewsService);
    exports.ViewsService = ViewsService;
    (0, extensions_1.registerSingleton)(views_1.IViewsService, ViewsService);
});
//# sourceMappingURL=viewsService.js.map