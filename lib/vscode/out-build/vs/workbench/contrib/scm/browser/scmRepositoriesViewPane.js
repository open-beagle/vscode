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
define(["require", "exports", "vs/nls!vs/workbench/contrib/scm/browser/scmRepositoriesViewPane", "vs/workbench/browser/parts/views/viewPane", "vs/base/browser/dom", "vs/workbench/contrib/scm/common/scm", "vs/platform/instantiation/common/instantiation", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybinding", "vs/platform/theme/common/themeService", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/workbench/common/theme", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/scm/browser/scmRepositoryRenderer", "vs/workbench/contrib/scm/browser/util", "vs/css!./media/scm"], function (require, exports, nls_1, viewPane_1, dom_1, scm_1, instantiation_1, contextView_1, contextkey_1, keybinding_1, themeService_1, listService_1, configuration_1, views_1, theme_1, opener_1, telemetry_1, scmRepositoryRenderer_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMRepositoriesViewPane = void 0;
    class ListDelegate {
        getHeight() {
            return 22;
        }
        getTemplateId() {
            return scmRepositoryRenderer_1.RepositoryRenderer.TEMPLATE_ID;
        }
    }
    let SCMRepositoriesViewPane = class SCMRepositoriesViewPane extends viewPane_1.ViewPane {
        constructor(options, scmService, scmViewService, keybindingService, contextMenuService, instantiationService, viewDescriptorService, contextKeyService, configurationService, openerService, themeService, telemetryService) {
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.scmService = scmService;
            this.scmViewService = scmViewService;
        }
        renderBody(container) {
            super.renderBody(container);
            const listContainer = (0, dom_1.append)(container, (0, dom_1.$)('.scm-view.scm-repositories-view'));
            const delegate = new ListDelegate();
            const renderer = this.instantiationService.createInstance(scmRepositoryRenderer_1.RepositoryRenderer, (0, util_1.getActionViewItemProvider)(this.instantiationService));
            const identityProvider = { getId: (r) => r.provider.id };
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchList, `SCM Main`, listContainer, delegate, [renderer], {
                identityProvider,
                horizontalScrolling: false,
                overrideStyles: {
                    listBackground: theme_1.SIDE_BAR_BACKGROUND
                },
                accessibilityProvider: {
                    getAriaLabel(r) {
                        return r.provider.label;
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)(0, null);
                    }
                }
            });
            this._register(this.list);
            this._register(this.list.onDidChangeSelection(this.onListSelectionChange, this));
            this._register(this.list.onContextMenu(this.onListContextMenu, this));
            this._register(this.scmViewService.onDidChangeVisibleRepositories(this.updateListSelection, this));
            this._register(this.scmService.onDidAddRepository(this.onDidAddRepository, this));
            this._register(this.scmService.onDidRemoveRepository(this.onDidRemoveRepository, this));
            for (const repository of this.scmService.repositories) {
                this.onDidAddRepository(repository);
            }
            if (this.orientation === 0 /* VERTICAL */) {
                this._register(this.configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration('scm.repositories.visible')) {
                        this.updateBodySize();
                    }
                }));
            }
            this.updateListSelection();
        }
        onDidAddRepository(repository) {
            this.list.splice(this.list.length, 0, [repository]);
            this.updateBodySize();
        }
        onDidRemoveRepository(repository) {
            const index = this.list.indexOf(repository);
            if (index > -1) {
                this.list.splice(index, 1);
            }
            this.updateBodySize();
        }
        focus() {
            this.list.domFocus();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.list.layout(height, width);
        }
        updateBodySize() {
            if (this.orientation === 1 /* HORIZONTAL */) {
                return;
            }
            const visibleCount = this.configurationService.getValue('scm.repositories.visible');
            const empty = this.list.length === 0;
            const size = Math.min(this.list.length, visibleCount) * 22;
            this.minimumBodySize = visibleCount === 0 ? 22 : size;
            this.maximumBodySize = visibleCount === 0 ? Number.POSITIVE_INFINITY : empty ? Number.POSITIVE_INFINITY : size;
        }
        onListContextMenu(e) {
            if (!e.element) {
                return;
            }
            const provider = e.element.provider;
            const menus = this.scmViewService.menus.getRepositoryMenus(provider);
            const menu = menus.repositoryMenu;
            const [actions, disposable] = (0, util_1.collectContextMenuActions)(menu);
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                getActionsContext: () => provider,
                onHide() {
                    disposable.dispose();
                }
            });
        }
        onListSelectionChange(e) {
            if (e.browserEvent && e.elements.length > 0) {
                const scrollTop = this.list.scrollTop;
                this.scmViewService.visibleRepositories = e.elements;
                this.list.scrollTop = scrollTop;
            }
        }
        updateListSelection() {
            const set = new Set();
            for (const repository of this.scmViewService.visibleRepositories) {
                set.add(repository);
            }
            const selection = [];
            for (let i = 0; i < this.list.length; i++) {
                if (set.has(this.list.element(i))) {
                    selection.push(i);
                }
            }
            this.list.setSelection(selection);
            if (selection.length > 0) {
                this.list.setFocus([selection[0]]);
            }
        }
    };
    SCMRepositoriesViewPane = __decorate([
        __param(1, scm_1.ISCMService),
        __param(2, scm_1.ISCMViewService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, views_1.IViewDescriptorService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, opener_1.IOpenerService),
        __param(10, themeService_1.IThemeService),
        __param(11, telemetry_1.ITelemetryService)
    ], SCMRepositoriesViewPane);
    exports.SCMRepositoriesViewPane = SCMRepositoriesViewPane;
});
//# sourceMappingURL=scmRepositoriesViewPane.js.map