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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/resources", "vs/nls!vs/workbench/api/browser/viewsExtensionPoint", "vs/platform/contextkey/common/contextkey", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/treeView", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/browser/viewlet", "vs/workbench/common/contributions", "vs/workbench/common/views", "vs/workbench/contrib/debug/common/debug", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/remote/browser/remoteExplorer", "vs/workbench/contrib/scm/common/scm", "vs/workbench/contrib/webviewView/browser/webviewViewPane", "vs/workbench/services/extensions/common/extensionsRegistry"], function (require, exports, arrays_1, collections_1, resources, nls_1, contextkey_1, extensions_1, descriptors_1, instantiation_1, platform_1, themeService_1, treeView_1, viewPaneContainer_1, viewlet_1, contributions_1, views_1, debug_1, files_1, remoteExplorer_1, scm_1, webviewViewPane_1, extensionsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.viewsContainersContribution = void 0;
    const viewsContainerSchema = {
        type: 'object',
        properties: {
            id: {
                description: (0, nls_1.localize)(0, null),
                type: 'string',
                pattern: '^[a-zA-Z0-9_-]+$'
            },
            title: {
                description: (0, nls_1.localize)(1, null),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)(2, null),
                type: 'string'
            }
        },
        required: ['id', 'title', 'icon']
    };
    exports.viewsContainersContribution = {
        description: (0, nls_1.localize)(3, null),
        type: 'object',
        properties: {
            'activitybar': {
                description: (0, nls_1.localize)(4, null),
                type: 'array',
                items: viewsContainerSchema
            },
            'panel': {
                description: (0, nls_1.localize)(5, null),
                type: 'array',
                items: viewsContainerSchema
            }
        }
    };
    var ViewType;
    (function (ViewType) {
        ViewType["Tree"] = "tree";
        ViewType["Webview"] = "webview";
    })(ViewType || (ViewType = {}));
    var InitialVisibility;
    (function (InitialVisibility) {
        InitialVisibility["Visible"] = "visible";
        InitialVisibility["Hidden"] = "hidden";
        InitialVisibility["Collapsed"] = "collapsed";
    })(InitialVisibility || (InitialVisibility = {}));
    const viewDescriptor = {
        type: 'object',
        required: ['id', 'name'],
        defaultSnippets: [{ body: { id: '${1:id}', name: '${2:name}' } }],
        properties: {
            type: {
                markdownDescription: (0, nls_1.localize)(6, null),
                type: 'string',
                enum: [
                    'tree',
                    'webview',
                ],
                markdownEnumDescriptions: [
                    (0, nls_1.localize)(7, null),
                    (0, nls_1.localize)(8, null),
                ]
            },
            id: {
                markdownDescription: (0, nls_1.localize)(9, null),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)(10, null),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)(11, null),
                type: 'string'
            },
            icon: {
                description: (0, nls_1.localize)(12, null),
                type: 'string'
            },
            contextualTitle: {
                description: (0, nls_1.localize)(13, null),
                type: 'string'
            },
            visibility: {
                description: (0, nls_1.localize)(14, null),
                type: 'string',
                enum: [
                    'visible',
                    'hidden',
                    'collapsed'
                ],
                default: 'visible',
                enumDescriptions: [
                    (0, nls_1.localize)(15, null),
                    (0, nls_1.localize)(16, null),
                    (0, nls_1.localize)(17, null)
                ]
            }
        }
    };
    const remoteViewDescriptor = {
        type: 'object',
        required: ['id', 'name'],
        properties: {
            id: {
                description: (0, nls_1.localize)(18, null),
                type: 'string'
            },
            name: {
                description: (0, nls_1.localize)(19, null),
                type: 'string'
            },
            when: {
                description: (0, nls_1.localize)(20, null),
                type: 'string'
            },
            group: {
                description: (0, nls_1.localize)(21, null),
                type: 'string'
            },
            remoteName: {
                description: (0, nls_1.localize)(22, null),
                type: ['string', 'array'],
                items: {
                    type: 'string'
                }
            }
        }
    };
    const viewsContribution = {
        description: (0, nls_1.localize)(23, null),
        type: 'object',
        properties: {
            'explorer': {
                description: (0, nls_1.localize)(24, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'debug': {
                description: (0, nls_1.localize)(25, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'scm': {
                description: (0, nls_1.localize)(26, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'test': {
                description: (0, nls_1.localize)(27, null),
                type: 'array',
                items: viewDescriptor,
                default: []
            },
            'remote': {
                description: (0, nls_1.localize)(28, null),
                type: 'array',
                items: remoteViewDescriptor,
                default: []
            }
        },
        additionalProperties: {
            description: (0, nls_1.localize)(29, null),
            type: 'array',
            items: viewDescriptor,
            default: []
        }
    };
    const viewsContainersExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'viewsContainers',
        jsonSchema: exports.viewsContainersContribution
    });
    const viewsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'views',
        deps: [viewsContainersExtensionPoint],
        jsonSchema: viewsContribution
    });
    const CUSTOM_VIEWS_START_ORDER = 7;
    let ViewsExtensionHandler = class ViewsExtensionHandler {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
            this.viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            this.viewsRegistry = platform_1.Registry.as(views_1.Extensions.ViewsRegistry);
            this.handleAndRegisterCustomViewContainers();
            this.handleAndRegisterCustomViews();
        }
        handleAndRegisterCustomViewContainers() {
            viewsContainersExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.removeCustomViewContainers(removed);
                }
                if (added.length) {
                    this.addCustomViewContainers(added, this.viewContainersRegistry.all);
                }
            });
        }
        addCustomViewContainers(extensionPoints, existingViewContainers) {
            const viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            let activityBarOrder = CUSTOM_VIEWS_START_ORDER + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 0 /* Sidebar */).length;
            let panelOrder = 5 + viewContainersRegistry.all.filter(v => !!v.extensionId && viewContainersRegistry.getViewContainerLocation(v) === 1 /* Panel */).length + 1;
            for (let { value, collector, description } of extensionPoints) {
                (0, collections_1.forEach)(value, entry => {
                    if (!this.isValidViewsContainer(entry.value, collector)) {
                        return;
                    }
                    switch (entry.key) {
                        case 'activitybar':
                            activityBarOrder = this.registerCustomViewContainers(entry.value, description, activityBarOrder, existingViewContainers, 0 /* Sidebar */);
                            break;
                        case 'panel':
                            panelOrder = this.registerCustomViewContainers(entry.value, description, panelOrder, existingViewContainers, 1 /* Panel */);
                            break;
                    }
                });
            }
        }
        removeCustomViewContainers(extensionPoints) {
            const viewContainersRegistry = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry);
            const removedExtensions = extensionPoints.reduce((result, e) => { result.add(extensions_1.ExtensionIdentifier.toKey(e.description.identifier)); return result; }, new Set());
            for (const viewContainer of viewContainersRegistry.all) {
                if (viewContainer.extensionId && removedExtensions.has(extensions_1.ExtensionIdentifier.toKey(viewContainer.extensionId))) {
                    // move all views in this container into default view container
                    const views = this.viewsRegistry.getViews(viewContainer);
                    if (views.length) {
                        this.viewsRegistry.moveViews(views, this.getDefaultViewContainer());
                    }
                    this.deregisterCustomViewContainer(viewContainer);
                }
            }
        }
        isValidViewsContainer(viewsContainersDescriptors, collector) {
            if (!Array.isArray(viewsContainersDescriptors)) {
                collector.error((0, nls_1.localize)(30, null));
                return false;
            }
            for (let descriptor of viewsContainersDescriptors) {
                if (typeof descriptor.id !== 'string') {
                    collector.error((0, nls_1.localize)(31, null, 'id'));
                    return false;
                }
                if (!(/^[a-z0-9_-]+$/i.test(descriptor.id))) {
                    collector.error((0, nls_1.localize)(32, null, 'id'));
                    return false;
                }
                if (typeof descriptor.title !== 'string') {
                    collector.error((0, nls_1.localize)(33, null, 'title'));
                    return false;
                }
                if (typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)(34, null, 'icon'));
                    return false;
                }
            }
            return true;
        }
        registerCustomViewContainers(containers, extension, order, existingViewContainers, location) {
            containers.forEach(descriptor => {
                const themeIcon = themeService_1.ThemeIcon.fromString(descriptor.icon);
                const icon = themeIcon || resources.joinPath(extension.extensionLocation, descriptor.icon);
                const id = `workbench.view.extension.${descriptor.id}`;
                const viewContainer = this.registerCustomViewContainer(id, descriptor.title, icon, order++, extension.identifier, location);
                // Move those views that belongs to this container
                if (existingViewContainers.length) {
                    const viewsToMove = [];
                    for (const existingViewContainer of existingViewContainers) {
                        if (viewContainer !== existingViewContainer) {
                            viewsToMove.push(...this.viewsRegistry.getViews(existingViewContainer).filter(view => view.originalContainerId === descriptor.id));
                        }
                    }
                    if (viewsToMove.length) {
                        this.viewsRegistry.moveViews(viewsToMove, viewContainer);
                    }
                }
            });
            return order;
        }
        registerCustomViewContainer(id, title, icon, order, extensionId, location) {
            let viewContainer = this.viewContainersRegistry.get(id);
            if (!viewContainer) {
                viewContainer = this.viewContainersRegistry.registerViewContainer({
                    id,
                    title, extensionId,
                    ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [id, { mergeViewWithContainerWhenSingleView: true }]),
                    hideIfEmpty: true,
                    order,
                    icon,
                }, location);
            }
            return viewContainer;
        }
        deregisterCustomViewContainer(viewContainer) {
            this.viewContainersRegistry.deregisterViewContainer(viewContainer);
            platform_1.Registry.as(viewlet_1.Extensions.Viewlets).deregisterViewlet(viewContainer.id);
        }
        handleAndRegisterCustomViews() {
            viewsExtensionPoint.setHandler((extensions, { added, removed }) => {
                if (removed.length) {
                    this.removeViews(removed);
                }
                if (added.length) {
                    this.addViews(added);
                }
            });
        }
        addViews(extensions) {
            const viewIds = new Set();
            const allViewDescriptors = [];
            for (const extension of extensions) {
                const { value, collector } = extension;
                (0, collections_1.forEach)(value, entry => {
                    if (!this.isValidViewDescriptors(entry.value, collector)) {
                        return;
                    }
                    if (entry.key === 'remote' && !extension.description.enableProposedApi) {
                        collector.warn((0, nls_1.localize)(35, null, entry.key));
                        return;
                    }
                    const viewContainer = this.getViewContainer(entry.key);
                    if (!viewContainer) {
                        collector.warn((0, nls_1.localize)(36, null, entry.key));
                    }
                    const container = viewContainer || this.getDefaultViewContainer();
                    const viewDescriptors = (0, arrays_1.coalesce)(entry.value.map((item, index) => {
                        // validate
                        if (viewIds.has(item.id)) {
                            collector.error((0, nls_1.localize)(37, null, item.id));
                            return null;
                        }
                        if (this.viewsRegistry.getView(item.id) !== null) {
                            collector.error((0, nls_1.localize)(38, null, item.id));
                            return null;
                        }
                        const order = extensions_1.ExtensionIdentifier.equals(extension.description.identifier, container.extensionId)
                            ? index + 1
                            : container.viewOrderDelegate
                                ? container.viewOrderDelegate.getOrder(item.group)
                                : undefined;
                        let icon;
                        if (typeof item.icon === 'string') {
                            icon = themeService_1.ThemeIcon.fromString(item.icon) || resources.joinPath(extension.description.extensionLocation, item.icon);
                        }
                        const initialVisibility = this.convertInitialVisibility(item.visibility);
                        const type = this.getViewType(item.type);
                        if (!type) {
                            collector.error((0, nls_1.localize)(39, null, item.type));
                            return null;
                        }
                        const viewDescriptor = {
                            type: type,
                            ctorDescriptor: type === ViewType.Tree ? new descriptors_1.SyncDescriptor(treeView_1.TreeViewPane) : new descriptors_1.SyncDescriptor(webviewViewPane_1.WebviewViewPane),
                            id: item.id,
                            name: item.name,
                            when: contextkey_1.ContextKeyExpr.deserialize(item.when),
                            containerIcon: icon || (viewContainer === null || viewContainer === void 0 ? void 0 : viewContainer.icon),
                            containerTitle: item.contextualTitle || (viewContainer === null || viewContainer === void 0 ? void 0 : viewContainer.title),
                            canToggleVisibility: true,
                            canMoveView: (viewContainer === null || viewContainer === void 0 ? void 0 : viewContainer.id) !== remoteExplorer_1.VIEWLET_ID,
                            treeView: type === ViewType.Tree ? this.instantiationService.createInstance(treeView_1.CustomTreeView, item.id, item.name) : undefined,
                            collapsed: this.showCollapsed(container) || initialVisibility === InitialVisibility.Collapsed,
                            order: order,
                            extensionId: extension.description.identifier,
                            originalContainerId: entry.key,
                            group: item.group,
                            remoteAuthority: item.remoteName || item.remoteAuthority,
                            hideByDefault: initialVisibility === InitialVisibility.Hidden,
                            workspace: (viewContainer === null || viewContainer === void 0 ? void 0 : viewContainer.id) === remoteExplorer_1.VIEWLET_ID ? true : undefined
                        };
                        viewIds.add(viewDescriptor.id);
                        return viewDescriptor;
                    }));
                    allViewDescriptors.push({ viewContainer: container, views: viewDescriptors });
                });
            }
            this.viewsRegistry.registerViews2(allViewDescriptors);
        }
        getViewType(type) {
            if (type === ViewType.Webview) {
                return ViewType.Webview;
            }
            if (!type || type === ViewType.Tree) {
                return ViewType.Tree;
            }
            return undefined;
        }
        getDefaultViewContainer() {
            return this.viewContainersRegistry.get(files_1.VIEWLET_ID);
        }
        removeViews(extensions) {
            const removedExtensions = extensions.reduce((result, e) => { result.add(extensions_1.ExtensionIdentifier.toKey(e.description.identifier)); return result; }, new Set());
            for (const viewContainer of this.viewContainersRegistry.all) {
                const removedViews = this.viewsRegistry.getViews(viewContainer).filter(v => v.extensionId && removedExtensions.has(extensions_1.ExtensionIdentifier.toKey(v.extensionId)));
                if (removedViews.length) {
                    this.viewsRegistry.deregisterViews(removedViews, viewContainer);
                }
            }
        }
        convertInitialVisibility(value) {
            if (Object.values(InitialVisibility).includes(value)) {
                return value;
            }
            return undefined;
        }
        isValidViewDescriptors(viewDescriptors, collector) {
            if (!Array.isArray(viewDescriptors)) {
                collector.error((0, nls_1.localize)(40, null));
                return false;
            }
            for (let descriptor of viewDescriptors) {
                if (typeof descriptor.id !== 'string') {
                    collector.error((0, nls_1.localize)(41, null, 'id'));
                    return false;
                }
                if (typeof descriptor.name !== 'string') {
                    collector.error((0, nls_1.localize)(42, null, 'name'));
                    return false;
                }
                if (descriptor.when && typeof descriptor.when !== 'string') {
                    collector.error((0, nls_1.localize)(43, null, 'when'));
                    return false;
                }
                if (descriptor.icon && typeof descriptor.icon !== 'string') {
                    collector.error((0, nls_1.localize)(44, null, 'icon'));
                    return false;
                }
                if (descriptor.contextualTitle && typeof descriptor.contextualTitle !== 'string') {
                    collector.error((0, nls_1.localize)(45, null, 'contextualTitle'));
                    return false;
                }
                if (descriptor.visibility && !this.convertInitialVisibility(descriptor.visibility)) {
                    collector.error((0, nls_1.localize)(46, null, 'visibility', Object.values(InitialVisibility).join(', ')));
                    return false;
                }
            }
            return true;
        }
        getViewContainer(value) {
            switch (value) {
                case 'explorer': return this.viewContainersRegistry.get(files_1.VIEWLET_ID);
                case 'debug': return this.viewContainersRegistry.get(debug_1.VIEWLET_ID);
                case 'scm': return this.viewContainersRegistry.get(scm_1.VIEWLET_ID);
                case 'remote': return this.viewContainersRegistry.get(remoteExplorer_1.VIEWLET_ID);
                default: return this.viewContainersRegistry.get(`workbench.view.extension.${value}`);
            }
        }
        showCollapsed(container) {
            switch (container.id) {
                case files_1.VIEWLET_ID:
                case scm_1.VIEWLET_ID:
                case debug_1.VIEWLET_ID:
                    return true;
            }
            return false;
        }
    };
    ViewsExtensionHandler = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ViewsExtensionHandler);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(ViewsExtensionHandler, 1 /* Starting */);
});
//# sourceMappingURL=viewsExtensionPoint.js.map