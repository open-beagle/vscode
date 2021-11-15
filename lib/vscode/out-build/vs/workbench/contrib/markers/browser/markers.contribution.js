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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/nls!vs/workbench/contrib/markers/browser/markers.contribution", "vs/workbench/contrib/markers/browser/markersModel", "vs/workbench/contrib/markers/browser/markersView", "vs/platform/actions/common/actions", "vs/platform/registry/common/platform", "vs/workbench/contrib/markers/browser/constants", "vs/workbench/contrib/markers/browser/messages", "vs/workbench/common/contributions", "vs/workbench/contrib/markers/browser/markers", "vs/platform/clipboard/common/clipboardService", "vs/base/common/lifecycle", "vs/workbench/services/statusbar/common/statusbar", "vs/platform/markers/common/markers", "vs/workbench/common/views", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/instantiation/common/descriptors", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/contrib/markers/browser/markersFileDecorations"], function (require, exports, contextkey_1, configurationRegistry_1, actions_1, keybindingsRegistry_1, nls_1, markersModel_1, markersView_1, actions_2, platform_1, constants_1, messages_1, contributions_1, markers_1, clipboardService_1, lifecycle_1, statusbar_1, markers_2, views_1, viewPaneContainer_1, descriptors_1, codicons_1, iconRegistry_1, viewPane_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: constants_1.default.MARKER_OPEN_ACTION_ID,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(constants_1.default.MarkerFocusContextKey),
        primary: 3 /* Enter */,
        mac: {
            primary: 3 /* Enter */,
            secondary: [2048 /* CtrlCmd */ | 18 /* DownArrow */]
        },
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.IViewsService).getActiveViewWithId(constants_1.default.MARKERS_VIEW_ID);
            markersView.openFileAtElement(markersView.getFocusElement(), false, false, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: constants_1.default.MARKER_OPEN_SIDE_ACTION_ID,
        weight: 200 /* WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(constants_1.default.MarkerFocusContextKey),
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        mac: {
            primary: 256 /* WinCtrl */ | 3 /* Enter */
        },
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.IViewsService).getActiveViewWithId(constants_1.default.MARKERS_VIEW_ID);
            markersView.openFileAtElement(markersView.getFocusElement(), false, true, true);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: constants_1.default.MARKER_SHOW_PANEL_ID,
        weight: 200 /* WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, args) => {
            await accessor.get(views_1.IViewsService).openView(constants_1.default.MARKERS_VIEW_ID);
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: constants_1.default.MARKER_SHOW_QUICK_FIX,
        weight: 200 /* WorkbenchContrib */,
        when: constants_1.default.MarkerFocusContextKey,
        primary: 2048 /* CtrlCmd */ | 84 /* US_DOT */,
        handler: (accessor, args) => {
            const markersView = accessor.get(views_1.IViewsService).getActiveViewWithId(constants_1.default.MARKERS_VIEW_ID);
            const focusedElement = markersView.getFocusElement();
            if (focusedElement instanceof markersModel_1.Marker) {
                markersView.showQuickFixes(focusedElement);
            }
        }
    });
    // configuration
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': 'problems',
        'order': 101,
        'title': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_TITLE,
        'type': 'object',
        'properties': {
            'problems.autoReveal': {
                'description': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL,
                'type': 'boolean',
                'default': true
            },
            'problems.showCurrentInStatus': {
                'description': messages_1.default.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS,
                'type': 'boolean',
                'default': false
            }
        }
    });
    const markersViewIcon = (0, iconRegistry_1.registerIcon)('markers-view-icon', codicons_1.Codicon.warning, (0, nls_1.localize)(0, null));
    // markers view container
    const VIEW_CONTAINER = platform_1.Registry.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: constants_1.default.MARKERS_CONTAINER_ID,
        title: messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS,
        icon: markersViewIcon,
        hideIfEmpty: true,
        order: 0,
        ctorDescriptor: new descriptors_1.SyncDescriptor(viewPaneContainer_1.ViewPaneContainer, [constants_1.default.MARKERS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true, donotShowContainerTitleWhenMergedWithContainer: true }]),
        storageId: constants_1.default.MARKERS_VIEW_STORAGE_ID,
    }, 1 /* Panel */, { donotRegisterOpenCommand: true });
    platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: constants_1.default.MARKERS_VIEW_ID,
            containerIcon: markersViewIcon,
            name: messages_1.default.MARKERS_PANEL_TITLE_PROBLEMS,
            canToggleVisibility: false,
            canMoveView: true,
            ctorDescriptor: new descriptors_1.SyncDescriptor(markersView_1.MarkersView),
            openCommandActionDescriptor: {
                id: 'workbench.actions.view.problems',
                mnemonicTitle: (0, nls_1.localize)(1, null),
                keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 43 /* KEY_M */ },
                order: 0,
            }
        }], VIEW_CONTAINER);
    // workbench
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(markers_1.ActivityUpdater, 3 /* Restored */);
    // actions
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.problems.focus',
                title: { value: messages_1.default.MARKERS_PANEL_SHOW_LABEL, original: 'Focus Problems (Errors, Warnings, Infos)' },
                category: actions_1.CATEGORIES.View.value,
                f1: true,
            });
        }
        async run(accessor) {
            accessor.get(views_1.IViewsService).openView(constants_1.default.MARKERS_VIEW_ID, true);
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.MARKER_COPY_ACTION_ID,
                title: { value: (0, nls_1.localize)(2, null), original: 'Copy' },
                menu: {
                    id: actions_2.MenuId.ProblemsPanelContext,
                    when: constants_1.default.MarkerFocusContextKey,
                    group: 'navigation'
                },
                keybinding: {
                    weight: 200 /* WorkbenchContrib */,
                    primary: 2048 /* CtrlCmd */ | 33 /* KEY_C */,
                    when: constants_1.default.MarkerFocusContextKey
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.IClipboardService);
            const element = markersView.getFocusElement();
            if (element instanceof markersModel_1.Marker) {
                await clipboardService.writeText(`${element}`);
            }
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.MARKER_COPY_MESSAGE_ACTION_ID,
                title: { value: (0, nls_1.localize)(3, null), original: 'Copy Message' },
                menu: {
                    id: actions_2.MenuId.ProblemsPanelContext,
                    when: constants_1.default.MarkerFocusContextKey,
                    group: 'navigation'
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.IClipboardService);
            const element = markersView.getFocusElement();
            if (element instanceof markersModel_1.Marker) {
                await clipboardService.writeText(element.marker.message);
            }
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID,
                title: { value: (0, nls_1.localize)(4, null), original: 'Copy Message' },
                menu: {
                    id: actions_2.MenuId.ProblemsPanelContext,
                    when: constants_1.default.RelatedInformationFocusContextKey,
                    group: 'navigation'
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            const clipboardService = serviceAccessor.get(clipboardService_1.IClipboardService);
            const element = markersView.getFocusElement();
            if (element instanceof markersModel_1.RelatedInformation) {
                await clipboardService.writeText(element.raw.message);
            }
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.FOCUS_PROBLEMS_FROM_FILTER,
                title: (0, nls_1.localize)(5, null),
                keybinding: {
                    when: constants_1.default.MarkerViewFilterFocusContextKey,
                    weight: 200 /* WorkbenchContrib */,
                    primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.focus();
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.MARKERS_VIEW_FOCUS_FILTER,
                title: (0, nls_1.localize)(6, null),
                keybinding: {
                    when: views_1.FocusedViewContext.isEqualTo(constants_1.default.MARKERS_VIEW_ID),
                    weight: 200 /* WorkbenchContrib */,
                    primary: 2048 /* CtrlCmd */ | 36 /* KEY_F */
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.focusFilter();
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE,
                title: { value: (0, nls_1.localize)(7, null), original: 'Problems: Show message in multiple lines' },
                category: (0, nls_1.localize)(8, null),
                menu: {
                    id: actions_2.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.has((0, views_1.getVisbileViewContextKey)(constants_1.default.MARKERS_VIEW_ID))
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.setMultiline(true);
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE,
                title: { value: (0, nls_1.localize)(9, null), original: 'Problems: Show message in single line' },
                category: (0, nls_1.localize)(10, null),
                menu: {
                    id: actions_2.MenuId.CommandPalette,
                    when: contextkey_1.ContextKeyExpr.has((0, views_1.getVisbileViewContextKey)(constants_1.default.MARKERS_VIEW_ID))
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.setMultiline(false);
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: constants_1.default.MARKERS_VIEW_CLEAR_FILTER_TEXT,
                title: (0, nls_1.localize)(11, null),
                category: (0, nls_1.localize)(12, null),
                keybinding: {
                    when: constants_1.default.MarkerViewFilterFocusContextKey,
                    weight: 200 /* WorkbenchContrib */,
                },
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, markersView) {
            markersView.clearFilterText();
        }
    });
    (0, actions_2.registerAction2)(class extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: `workbench.actions.treeView.${constants_1.default.MARKERS_VIEW_ID}.collapseAll`,
                title: (0, nls_1.localize)(13, null),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', constants_1.default.MARKERS_VIEW_ID),
                    group: 'navigation',
                    order: 2,
                },
                icon: codicons_1.Codicon.collapseAll,
                viewId: constants_1.default.MARKERS_VIEW_ID
            });
        }
        async runInView(serviceAccessor, view) {
            return view.collapseAll();
        }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: `workbench.actions.treeView.${constants_1.default.MARKERS_VIEW_ID}.filter`,
                title: (0, nls_1.localize)(14, null),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', constants_1.default.MARKERS_VIEW_ID), constants_1.default.MarkersViewSmallLayoutContextKey.negate()),
                    group: 'navigation',
                    order: 1,
                },
            });
        }
        async run() { }
    });
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: constants_1.default.TOGGLE_MARKERS_VIEW_ACTION_ID,
                title: messages_1.default.MARKERS_PANEL_TOGGLE_LABEL,
            });
        }
        async run(accessor) {
            const viewsService = accessor.get(views_1.IViewsService);
            if (viewsService.isViewVisible(constants_1.default.MARKERS_VIEW_ID)) {
                viewsService.closeView(constants_1.default.MARKERS_VIEW_ID);
            }
            else {
                viewsService.openView(constants_1.default.MARKERS_VIEW_ID, true);
            }
        }
    });
    let MarkersStatusBarContributions = class MarkersStatusBarContributions extends lifecycle_1.Disposable {
        constructor(markerService, statusbarService) {
            super();
            this.markerService = markerService;
            this.statusbarService = statusbarService;
            this.markersStatusItem = this._register(this.statusbarService.addEntry(this.getMarkersItem(), 'status.problems', (0, nls_1.localize)(15, null), 0 /* LEFT */, 50 /* Medium Priority */));
            this.markerService.onMarkerChanged(() => this.markersStatusItem.update(this.getMarkersItem()));
        }
        getMarkersItem() {
            const markersStatistics = this.markerService.getStatistics();
            const tooltip = this.getMarkersTooltip(markersStatistics);
            return {
                text: this.getMarkersText(markersStatistics),
                ariaLabel: tooltip,
                tooltip,
                command: 'workbench.actions.view.toggleProblems'
            };
        }
        getMarkersTooltip(stats) {
            const errorTitle = (n) => (0, nls_1.localize)(16, null, n);
            const warningTitle = (n) => (0, nls_1.localize)(17, null, n);
            const infoTitle = (n) => (0, nls_1.localize)(18, null, n);
            const titles = [];
            if (stats.errors > 0) {
                titles.push(errorTitle(stats.errors));
            }
            if (stats.warnings > 0) {
                titles.push(warningTitle(stats.warnings));
            }
            if (stats.infos > 0) {
                titles.push(infoTitle(stats.infos));
            }
            if (titles.length === 0) {
                return (0, nls_1.localize)(19, null);
            }
            return titles.join(', ');
        }
        getMarkersText(stats) {
            const problemsText = [];
            // Errors
            problemsText.push('$(error) ' + this.packNumber(stats.errors));
            // Warnings
            problemsText.push('$(warning) ' + this.packNumber(stats.warnings));
            // Info (only if any)
            if (stats.infos > 0) {
                problemsText.push('$(info) ' + this.packNumber(stats.infos));
            }
            return problemsText.join(' ');
        }
        packNumber(n) {
            const manyProblems = (0, nls_1.localize)(20, null);
            return n > 9999 ? manyProblems : n > 999 ? n.toString().charAt(0) + 'K' : n.toString();
        }
    };
    MarkersStatusBarContributions = __decorate([
        __param(0, markers_2.IMarkerService),
        __param(1, statusbar_1.IStatusbarService)
    ], MarkersStatusBarContributions);
    workbenchRegistry.registerWorkbenchContribution(MarkersStatusBarContributions, 3 /* Restored */);
});
//# sourceMappingURL=markers.contribution.js.map