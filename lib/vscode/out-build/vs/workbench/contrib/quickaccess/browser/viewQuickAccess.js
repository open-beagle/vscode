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
define(["require", "exports", "vs/nls!vs/workbench/contrib/quickaccess/browser/viewQuickAccess", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/pickerQuickAccess", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/common/views", "vs/workbench/contrib/output/common/output", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/services/panel/common/panelService", "vs/platform/contextkey/common/contextkey", "vs/base/common/filters", "vs/base/common/strings", "vs/base/common/types", "vs/platform/keybinding/common/keybinding", "vs/platform/actions/common/actions", "vs/workbench/common/actions"], function (require, exports, nls_1, quickInput_1, pickerQuickAccess_1, viewlet_1, views_1, output_1, terminal_1, panelService_1, contextkey_1, filters_1, strings_1, types_1, keybinding_1, actions_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickAccessViewPickerAction = exports.OpenViewPickerAction = exports.ViewQuickAccessProvider = void 0;
    let ViewQuickAccessProvider = class ViewQuickAccessProvider extends pickerQuickAccess_1.PickerQuickAccessProvider {
        constructor(viewletService, viewDescriptorService, viewsService, outputService, terminalService, panelService, contextKeyService) {
            super(ViewQuickAccessProvider.PREFIX, {
                noResultsPick: {
                    label: (0, nls_1.localize)(0, null),
                    containerLabel: ''
                }
            });
            this.viewletService = viewletService;
            this.viewDescriptorService = viewDescriptorService;
            this.viewsService = viewsService;
            this.outputService = outputService;
            this.terminalService = terminalService;
            this.panelService = panelService;
            this.contextKeyService = contextKeyService;
        }
        getPicks(filter) {
            const filteredViewEntries = this.doGetViewPickItems().filter(entry => {
                if (!filter) {
                    return true;
                }
                // Match fuzzy on label
                entry.highlights = { label: (0, types_1.withNullAsUndefined)((0, filters_1.matchesFuzzy)(filter, entry.label, true)) };
                // Return if we have a match on label or container
                return entry.highlights.label || (0, strings_1.fuzzyContains)(entry.containerLabel, filter);
            });
            // Map entries to container labels
            const mapEntryToContainer = new Map();
            for (const entry of filteredViewEntries) {
                if (!mapEntryToContainer.has(entry.label)) {
                    mapEntryToContainer.set(entry.label, entry.containerLabel);
                }
            }
            // Add separators for containers
            const filteredViewEntriesWithSeparators = [];
            let lastContainer = undefined;
            for (const entry of filteredViewEntries) {
                if (lastContainer !== entry.containerLabel) {
                    lastContainer = entry.containerLabel;
                    // When the entry container has a parent container, set container
                    // label as Parent / Child. For example, `Views / Explorer`.
                    let separatorLabel;
                    if (mapEntryToContainer.has(lastContainer)) {
                        separatorLabel = `${mapEntryToContainer.get(lastContainer)} / ${lastContainer}`;
                    }
                    else {
                        separatorLabel = lastContainer;
                    }
                    filteredViewEntriesWithSeparators.push({ type: 'separator', label: separatorLabel });
                }
                filteredViewEntriesWithSeparators.push(entry);
            }
            return filteredViewEntriesWithSeparators;
        }
        doGetViewPickItems() {
            const viewEntries = [];
            const getViewEntriesForViewlet = (viewlet, viewContainer) => {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                const result = [];
                for (const view of viewContainerModel.allViewDescriptors) {
                    if (this.contextKeyService.contextMatchesRules(view.when)) {
                        result.push({
                            label: view.name,
                            containerLabel: viewlet.name,
                            accept: () => this.viewsService.openView(view.id, true)
                        });
                    }
                }
                return result;
            };
            // Viewlets
            const viewlets = this.viewletService.getViewlets();
            for (const viewlet of viewlets) {
                if (this.includeViewContainer(viewlet)) {
                    viewEntries.push({
                        label: viewlet.name,
                        containerLabel: (0, nls_1.localize)(1, null),
                        accept: () => this.viewletService.openViewlet(viewlet.id, true)
                    });
                }
            }
            // Panels
            const panels = this.panelService.getPanels();
            for (const panel of panels) {
                if (this.includeViewContainer(panel)) {
                    viewEntries.push({
                        label: panel.name,
                        containerLabel: (0, nls_1.localize)(2, null),
                        accept: () => this.panelService.openPanel(panel.id, true)
                    });
                }
            }
            // Viewlet Views
            for (const viewlet of viewlets) {
                const viewContainer = this.viewDescriptorService.getViewContainerById(viewlet.id);
                if (viewContainer) {
                    viewEntries.push(...getViewEntriesForViewlet(viewlet, viewContainer));
                }
            }
            // Terminals
            this.terminalService.terminalTabs.forEach((tab, tabIndex) => {
                tab.terminalInstances.forEach((terminal, terminalIndex) => {
                    const label = (0, nls_1.localize)(3, null, `${tabIndex + 1}.${terminalIndex + 1}`, terminal.title);
                    viewEntries.push({
                        label,
                        containerLabel: (0, nls_1.localize)(4, null),
                        accept: async () => {
                            await this.terminalService.showPanel(true);
                            this.terminalService.setActiveInstance(terminal);
                        }
                    });
                });
            });
            // Output Channels
            const channels = this.outputService.getChannelDescriptors();
            for (const channel of channels) {
                const label = channel.log ? (0, nls_1.localize)(5, null, channel.label) : channel.label;
                viewEntries.push({
                    label,
                    containerLabel: (0, nls_1.localize)(6, null),
                    accept: () => this.outputService.showChannel(channel.id)
                });
            }
            return viewEntries;
        }
        includeViewContainer(container) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(container.id);
            if (viewContainer === null || viewContainer === void 0 ? void 0 : viewContainer.hideIfEmpty) {
                return this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0;
            }
            return true;
        }
    };
    ViewQuickAccessProvider.PREFIX = 'view ';
    ViewQuickAccessProvider = __decorate([
        __param(0, viewlet_1.IViewletService),
        __param(1, views_1.IViewDescriptorService),
        __param(2, views_1.IViewsService),
        __param(3, output_1.IOutputService),
        __param(4, terminal_1.ITerminalService),
        __param(5, panelService_1.IPanelService),
        __param(6, contextkey_1.IContextKeyService)
    ], ViewQuickAccessProvider);
    exports.ViewQuickAccessProvider = ViewQuickAccessProvider;
    //#region Actions
    class OpenViewPickerAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenViewPickerAction.ID,
                title: { value: (0, nls_1.localize)(7, null), original: 'Open View' },
                category: actions_2.CATEGORIES.View,
                f1: true
            });
        }
        async run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(ViewQuickAccessProvider.PREFIX);
        }
    }
    exports.OpenViewPickerAction = OpenViewPickerAction;
    OpenViewPickerAction.ID = 'workbench.action.openView';
    class QuickAccessViewPickerAction extends actions_1.Action2 {
        constructor() {
            super({
                id: QuickAccessViewPickerAction.ID,
                title: { value: (0, nls_1.localize)(8, null), original: 'Quick Open View' },
                category: actions_2.CATEGORIES.View,
                f1: true,
                keybinding: Object.assign({ weight: 200 /* WorkbenchContrib */, when: undefined }, QuickAccessViewPickerAction.KEYBINDING)
            });
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keys = keybindingService.lookupKeybindings(QuickAccessViewPickerAction.ID);
            quickInputService.quickAccess.show(ViewQuickAccessProvider.PREFIX, { quickNavigateConfiguration: { keybindings: keys }, itemActivation: quickInput_1.ItemActivation.FIRST });
        }
    }
    exports.QuickAccessViewPickerAction = QuickAccessViewPickerAction;
    QuickAccessViewPickerAction.ID = 'workbench.action.quickOpenView';
    QuickAccessViewPickerAction.KEYBINDING = {
        primary: 2048 /* CtrlCmd */ | 47 /* KEY_Q */,
        mac: { primary: 256 /* WinCtrl */ | 47 /* KEY_Q */ },
        linux: { primary: 0 }
    };
});
//#endregion
//# sourceMappingURL=viewQuickAccess.js.map