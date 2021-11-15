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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/explorerViewlet", "vs/workbench/contrib/files/common/files", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/files/browser/views/explorerView", "vs/workbench/contrib/files/browser/views/emptyView", "vs/workbench/contrib/files/browser/views/openEditorsView", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/serviceCollection", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/editor/browser/editorService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/base/common/keyCodes", "vs/platform/registry/common/platform", "vs/platform/progress/common/progress", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/contextkeys", "vs/platform/contextkey/common/contextkeys", "vs/workbench/browser/actions/workspaceActions", "vs/base/common/platform", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/css!./media/explorerviewlet"], function (require, exports, nls_1, files_1, configuration_1, explorerView_1, emptyView_1, openEditorsView_1, storage_1, instantiation_1, extensions_1, workspace_1, telemetry_1, serviceCollection_1, contextkey_1, themeService_1, views_1, contextView_1, lifecycle_1, layoutService_1, editorService_1, editorGroupsService_1, editorService_2, viewPaneContainer_1, keyCodes_1, platform_1, progress_1, descriptors_1, contextkeys_1, contextkeys_2, workspaceActions_1, platform_2, codicons_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VIEW_CONTAINER = exports.ExplorerViewPaneContainer = exports.ExplorerViewletViewsContribution = void 0;
    const explorerViewIcon = (0, iconRegistry_1.registerIcon)('explorer-view-icon', codicons_1.Codicon.files, (0, nls_1.localize)(0, null));
    const openEditorsViewIcon = (0, iconRegistry_1.registerIcon)('open-editors-view-icon', codicons_1.Codicon.book, (0, nls_1.localize)(1, null));
    let ExplorerViewletViewsContribution = class ExplorerViewletViewsContribution extends lifecycle_1.Disposable {
        constructor(workspaceContextService, configurationService, contextKeyService, progressService) {
            super();
            this.workspaceContextService = workspaceContextService;
            this.configurationService = configurationService;
            progressService.withProgress({ location: 1 /* Explorer */ }, () => workspaceContextService.getCompleteWorkspace()).finally(() => {
                this.registerViews();
                this.openEditorsVisibleContextKey = files_1.OpenEditorsVisibleContext.bindTo(contextKeyService);
                this.updateOpenEditorsVisibility();
                this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.registerViews()));
                this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.registerViews()));
                this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
            });
        }
        registerViews() {
            const viewDescriptors = viewsRegistry.getViews(exports.VIEW_CONTAINER);
            let viewDescriptorsToRegister = [];
            let viewDescriptorsToDeregister = [];
            const openEditorsViewDescriptor = this.createOpenEditorsViewDescriptor();
            if (!viewDescriptors.some(v => v.id === openEditorsViewDescriptor.id)) {
                viewDescriptorsToRegister.push(openEditorsViewDescriptor);
            }
            const explorerViewDescriptor = this.createExplorerViewDescriptor();
            const registeredExplorerViewDescriptor = viewDescriptors.find(v => v.id === explorerViewDescriptor.id);
            const emptyViewDescriptor = this.createEmptyViewDescriptor();
            const registeredEmptyViewDescriptor = viewDescriptors.find(v => v.id === emptyViewDescriptor.id);
            if (this.workspaceContextService.getWorkbenchState() === 1 /* EMPTY */ || this.workspaceContextService.getWorkspace().folders.length === 0) {
                if (registeredExplorerViewDescriptor) {
                    viewDescriptorsToDeregister.push(registeredExplorerViewDescriptor);
                }
                if (!registeredEmptyViewDescriptor) {
                    viewDescriptorsToRegister.push(emptyViewDescriptor);
                }
            }
            else {
                if (registeredEmptyViewDescriptor) {
                    viewDescriptorsToDeregister.push(registeredEmptyViewDescriptor);
                }
                if (!registeredExplorerViewDescriptor) {
                    viewDescriptorsToRegister.push(explorerViewDescriptor);
                }
            }
            if (viewDescriptorsToRegister.length) {
                viewsRegistry.registerViews(viewDescriptorsToRegister, exports.VIEW_CONTAINER);
            }
            if (viewDescriptorsToDeregister.length) {
                viewsRegistry.deregisterViews(viewDescriptorsToDeregister, exports.VIEW_CONTAINER);
            }
        }
        createOpenEditorsViewDescriptor() {
            return {
                id: openEditorsView_1.OpenEditorsView.ID,
                name: openEditorsView_1.OpenEditorsView.NAME,
                ctorDescriptor: new descriptors_1.SyncDescriptor(openEditorsView_1.OpenEditorsView),
                containerIcon: openEditorsViewIcon,
                order: 0,
                when: files_1.OpenEditorsVisibleContext,
                canToggleVisibility: true,
                canMoveView: true,
                collapsed: false,
                hideByDefault: true,
                focusCommand: {
                    id: 'workbench.files.action.focusOpenEditorsView',
                    keybindings: { primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 35 /* KEY_E */) }
                }
            };
        }
        createEmptyViewDescriptor() {
            return {
                id: emptyView_1.EmptyView.ID,
                name: emptyView_1.EmptyView.NAME,
                containerIcon: explorerViewIcon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(emptyView_1.EmptyView),
                order: 1,
                canToggleVisibility: true,
                focusCommand: {
                    id: 'workbench.explorer.fileView.focus'
                }
            };
        }
        createExplorerViewDescriptor() {
            return {
                id: files_1.VIEW_ID,
                name: (0, nls_1.localize)(2, null),
                containerIcon: explorerViewIcon,
                ctorDescriptor: new descriptors_1.SyncDescriptor(explorerView_1.ExplorerView),
                order: 1,
                canToggleVisibility: false,
                focusCommand: {
                    id: 'workbench.explorer.fileView.focus'
                }
            };
        }
        onConfigurationUpdated(e) {
            if (e.affectsConfiguration('explorer.openEditors.visible')) {
                this.updateOpenEditorsVisibility();
            }
        }
        updateOpenEditorsVisibility() {
            this.openEditorsVisibleContextKey.set(this.workspaceContextService.getWorkbenchState() === 1 /* EMPTY */ || this.configurationService.getValue('explorer.openEditors.visible') !== 0);
        }
    };
    ExplorerViewletViewsContribution = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, progress_1.IProgressService)
    ], ExplorerViewletViewsContribution);
    exports.ExplorerViewletViewsContribution = ExplorerViewletViewsContribution;
    let ExplorerViewPaneContainer = class ExplorerViewPaneContainer extends viewPaneContainer_1.ViewPaneContainer {
        constructor(layoutService, telemetryService, contextService, storageService, editorGroupService, configurationService, instantiationService, contextKeyService, themeService, contextMenuService, extensionService, viewDescriptorService) {
            super(files_1.VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.editorGroupService = editorGroupService;
            this.viewletVisibleContextKey = files_1.ExplorerViewletVisibleContext.bindTo(contextKeyService);
            this._register(this.contextService.onDidChangeWorkspaceName(e => this.updateTitleArea()));
        }
        create(parent) {
            super.create(parent);
            parent.classList.add('explorer-viewlet');
        }
        createView(viewDescriptor, options) {
            if (viewDescriptor.id === files_1.VIEW_ID) {
                // Create a delegating editor service for the explorer to be able to delay the refresh in the opened
                // editors view above. This is a workaround for being able to double click on a file to make it pinned
                // without causing the animation in the opened editors view to kick in and change scroll position.
                // We try to be smart and only use the delay if we recognize that the user action is likely to cause
                // a new entry in the opened editors view.
                const delegatingEditorService = this.instantiationService.createInstance(editorService_1.DelegatingEditorService, async (group, delegate) => {
                    var _a, _b;
                    let openEditorsView = this.getOpenEditorsView();
                    if (openEditorsView) {
                        let delay = 0;
                        const config = this.configurationService.getValue();
                        const delayEditorOpeningInOpenedEditors = !!((_b = (_a = config.workbench) === null || _a === void 0 ? void 0 : _a.editor) === null || _b === void 0 ? void 0 : _b.enablePreview); // No need to delay if preview is disabled
                        const activeGroup = this.editorGroupService.activeGroup;
                        if (delayEditorOpeningInOpenedEditors && group === activeGroup && !activeGroup.previewEditor) {
                            delay = 250; // a new editor entry is likely because there is either no group or no preview in group
                        }
                        openEditorsView.setStructuralRefreshDelay(delay);
                    }
                    try {
                        return await delegate();
                    }
                    catch (error) {
                        return undefined; // ignore
                    }
                    finally {
                        if (openEditorsView) {
                            openEditorsView.setStructuralRefreshDelay(0);
                        }
                    }
                });
                const explorerInstantiator = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([editorService_2.IEditorService, delegatingEditorService]));
                return explorerInstantiator.createInstance(explorerView_1.ExplorerView, options);
            }
            return super.createView(viewDescriptor, options);
        }
        getExplorerView() {
            return this.getView(files_1.VIEW_ID);
        }
        getOpenEditorsView() {
            return this.getView(openEditorsView_1.OpenEditorsView.ID);
        }
        setVisible(visible) {
            this.viewletVisibleContextKey.set(visible);
            super.setVisible(visible);
        }
        focus() {
            const explorerView = this.getView(files_1.VIEW_ID);
            if (explorerView && this.panes.every(p => !p.isExpanded())) {
                explorerView.setExpanded(true);
            }
            if (explorerView === null || explorerView === void 0 ? void 0 : explorerView.isExpanded()) {
                explorerView.focus();
            }
            else {
                super.focus();
            }
        }
    };
    ExplorerViewPaneContainer = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, storage_1.IStorageService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, themeService_1.IThemeService),
        __param(9, contextView_1.IContextMenuService),
        __param(10, extensions_1.IExtensionService),
        __param(11, views_1.IViewDescriptorService)
    ], ExplorerViewPaneContainer);
    exports.ExplorerViewPaneContainer = ExplorerViewPaneContainer;
    const viewContainerRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
    /**
     * Explorer viewlet container.
     */
    exports.VIEW_CONTAINER = viewContainerRegistry.registerViewContainer({
        id: files_1.VIEWLET_ID,
        title: (0, nls_1.localize)(3, null),
        ctorDescriptor: new descriptors_1.SyncDescriptor(ExplorerViewPaneContainer),
        storageId: 'workbench.explorer.views.state',
        icon: explorerViewIcon,
        alwaysUseContainerInfo: true,
        order: 0,
        openCommandActionDescriptor: {
            id: files_1.VIEWLET_ID,
            title: (0, nls_1.localize)(4, null),
            mnemonicTitle: (0, nls_1.localize)(5, null),
            keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 35 /* KEY_E */ },
            order: 0
        },
    }, 0 /* Sidebar */, { isDefault: true });
    const viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)(6, null, workspaceActions_1.AddRootFolderAction.ID),
        when: contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    const commandId = platform_2.isMacintosh ? workspaceActions_1.OpenFileFolderAction.ID : workspaceActions_1.OpenFolderAction.ID;
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)(7, null, commandId),
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_1.RemoteNameContext.notEqualsTo(''), contextkeys_2.IsWebContext.toNegated()),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
    viewsRegistry.registerViewWelcomeContent(emptyView_1.EmptyView.ID, {
        content: (0, nls_1.localize)(8, null, commandId),
        when: contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_1.RemoteNameContext.isEqualTo('')), contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.notEqualsTo('workspace'), contextkeys_2.IsWebContext)),
        group: views_1.ViewContentGroups.Open,
        order: 1
    });
});
//# sourceMappingURL=explorerViewlet.js.map