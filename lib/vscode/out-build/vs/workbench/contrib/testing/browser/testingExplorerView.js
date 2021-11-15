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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/list/listWidget", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/base/common/glob", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/editor/browser/core/markdownRenderer", "vs/nls!vs/workbench/contrib/testing/browser/testingExplorerView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/list/browser/listService", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/api/common/extHostTypes", "vs/workbench/browser/labels", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByLocation", "vs/workbench/contrib/testing/browser/explorerProjections/hierarchalByName", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/workbench/contrib/testing/browser/testingProgressUiService", "vs/workbench/contrib/testing/common/configuration", "vs/workbench/contrib/testing/common/constants", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/workspaceTestCollectionService", "vs/workbench/services/editor/common/editorService", "./testExplorerActions", "vs/css!./media/testing"], function (require, exports, dom, actionbar_1, listWidget_1, actions_1, async_1, color_1, event_1, glob_1, iterator_1, lifecycle_1, markdownRenderer_1, nls_1, menuEntryActionViewItem_1, actions_2, configuration_1, contextkey_1, contextView_1, files_1, instantiation_1, keybinding_1, listService_1, opener_1, progress_1, storage_1, telemetry_1, colorRegistry_1, themeService_1, extHostTypes_1, labels_1, viewPane_1, views_1, hierarchalByLocation_1, hierarchalByName_1, index_1, icons_1, testingExplorerFilter_1, testingOutputPeek_1, testingProgressUiService_1, configuration_2, constants_1, testingContextKeys_1, testingStates_1, testResult_1, testResultService_1, testService_1, workspaceTestCollectionService_1, editorService_1, testExplorerActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingExplorerViewModel = exports.TestingExplorerView = void 0;
    let TestingExplorerView = class TestingExplorerView extends viewPane_1.ViewPane {
        constructor(options, testCollection, testService, contextMenuService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, testProgressService) {
            var _a;
            super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.testCollection = testCollection;
            this.testProgressService = testProgressService;
            this.filterActionBar = this._register(new lifecycle_1.MutableDisposable());
            this.currentSubscription = new lifecycle_1.MutableDisposable();
            this.discoveryProgress = this._register(new lifecycle_1.MutableDisposable());
            this.location = testingContextKeys_1.TestingContextKeys.explorerLocation.bindTo(this.contextKeyService);
            this.location.set((_a = viewDescriptorService.getViewLocationById("workbench.view.testing" /* ExplorerViewId */)) !== null && _a !== void 0 ? _a : 0 /* Sidebar */);
            const relayout = this._register(new async_1.RunOnceScheduler(() => { var _a; return (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.layout(); }, 1));
            this._register(this.onDidChangeViewWelcomeState(() => {
                if (!this.shouldShowWelcome()) {
                    relayout.schedule();
                }
            }));
        }
        ;
        /**
         * @override
         */
        shouldShowWelcome() {
            var _a, _b;
            return (_b = (_a = this.viewModel) === null || _a === void 0 ? void 0 : _a.shouldShowWelcome) !== null && _b !== void 0 ? _b : true;
        }
        /**
         * @override
         */
        renderBody(container) {
            super.renderBody(container);
            this.container = dom.append(container, dom.$('.test-explorer'));
            if (this.location.get() === 0 /* Sidebar */) {
                this.filterActionBar.value = this.createFilterActionBar();
            }
            const messagesContainer = dom.append(this.container, dom.$('.test-explorer-messages'));
            this._register(this.testProgressService.onTextChange(text => {
                messagesContainer.innerText = text;
            }));
            const progress = new lifecycle_1.MutableDisposable();
            this._register(this.testProgressService.onCountChange(evt => {
                if (!evt.isRunning && progress.value) {
                    progress.clear();
                }
                else if (evt.isRunning) {
                    if (!progress.value) {
                        progress.value = this.instantiationService.createInstance(progress_1.UnmanagedProgress, { location: this.getProgressLocation(), total: 100 });
                    }
                    progress.value.report({ increment: evt.runSoFar, total: evt.totalWillBeRun });
                }
            }));
            const listContainer = dom.append(this.container, dom.$('.test-explorer-tree'));
            this.viewModel = this.instantiationService.createInstance(TestingExplorerViewModel, listContainer, this.onDidChangeBodyVisibility, this.currentSubscription.value);
            this._register(this.viewModel.onChangeWelcomeVisibility(() => this._onDidChangeViewWelcomeState.fire()));
            this._register(this.viewModel);
            if (!this.viewModel.shouldShowWelcome) {
                this._onDidChangeViewWelcomeState.fire();
            }
            this._register(this.onDidChangeBodyVisibility(visible => {
                if (!visible && this.currentSubscription) {
                    this.currentSubscription.value = undefined;
                    this.viewModel.replaceSubscription(undefined);
                }
                else if (visible && !this.currentSubscription.value) {
                    this.currentSubscription.value = this.createSubscription();
                    this.viewModel.replaceSubscription(this.currentSubscription.value);
                }
            }));
        }
        /**
         * @override
         */
        getActionViewItem(action) {
            if (action.id === "workbench.actions.treeView.testExplorer.filter" /* FilterActionId */) {
                return this.instantiationService.createInstance(testingExplorerFilter_1.TestingExplorerFilter, action);
            }
            return super.getActionViewItem(action);
        }
        /**
         * @override
         */
        saveState() {
            super.saveState();
        }
        createFilterActionBar() {
            const bar = new actionbar_1.ActionBar(this.container, {
                actionViewItemProvider: action => this.getActionViewItem(action),
                triggerKeys: { keyDown: false, keys: [] },
            });
            bar.push(new actions_1.Action("workbench.actions.treeView.testExplorer.filter" /* FilterActionId */));
            bar.getContainer().classList.add('testing-filter-action-bar');
            return bar;
        }
        updateDiscoveryProgress(busy) {
            if (!busy && this.discoveryProgress) {
                this.discoveryProgress.clear();
            }
            else if (busy && !this.discoveryProgress.value) {
                this.discoveryProgress.value = this.instantiationService.createInstance(progress_1.UnmanagedProgress, { location: this.getProgressLocation() });
            }
        }
        /**
         * @override
         */
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this.container.style.height = `${height}px`;
            this.viewModel.layout();
        }
        createSubscription() {
            const handle = this.testCollection.subscribeToWorkspaceTests();
            handle.subscription.onBusyProvidersChange(() => this.updateDiscoveryProgress(handle.subscription.busyProviders));
            return handle;
        }
    };
    TestingExplorerView = __decorate([
        __param(1, workspaceTestCollectionService_1.IWorkspaceTestCollectionService),
        __param(2, testService_1.ITestService),
        __param(3, contextView_1.IContextMenuService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, views_1.IViewDescriptorService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, opener_1.IOpenerService),
        __param(10, themeService_1.IThemeService),
        __param(11, telemetry_1.ITelemetryService),
        __param(12, testingProgressUiService_1.ITestingProgressUiService)
    ], TestingExplorerView);
    exports.TestingExplorerView = TestingExplorerView;
    let TestingExplorerViewModel = class TestingExplorerViewModel extends lifecycle_1.Disposable {
        constructor(listContainer, onDidChangeVisibility, listener, configurationService, menuService, contextMenuService, testService, filterState, instantiationService, editorService, storageService, contextKeyService, testResults, peekOpener) {
            super();
            this.listener = listener;
            this.menuService = menuService;
            this.contextMenuService = contextMenuService;
            this.testService = testService;
            this.filterState = filterState;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.contextKeyService = contextKeyService;
            this.testResults = testResults;
            this.peekOpener = peekOpener;
            this.projection = this._register(new lifecycle_1.MutableDisposable());
            this.revealTimeout = new lifecycle_1.MutableDisposable();
            this._viewMode = testingContextKeys_1.TestingContextKeys.viewMode.bindTo(this.contextKeyService);
            this._viewSorting = testingContextKeys_1.TestingContextKeys.viewSorting.bindTo(this.contextKeyService);
            this.welcomeVisibilityEmitter = new event_1.Emitter();
            /**
             * Whether there's a reveal request which has not yet been delivered. This
             * can happen if the user asks to reveal before the test tree is loaded.
             * We check to see if the reveal request is present on each tree update,
             * and do it then if so.
             */
            this.hasPendingReveal = false;
            /**
             * Fires when the visibility of the placeholder state changes.
             */
            this.onChangeWelcomeVisibility = this.welcomeVisibilityEmitter.event;
            /**
             * Gets whether the welcome should be visible.
             */
            this.shouldShowWelcome = false;
            this.hasPendingReveal = !!filterState.reveal.value;
            this._viewMode.set(this.storageService.get('testing.viewMode', 1 /* WORKSPACE */, "true" /* Tree */));
            this._viewSorting.set(this.storageService.get('testing.viewSorting', 1 /* WORKSPACE */, "location" /* ByLocation */));
            const labels = this._register(instantiationService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: onDidChangeVisibility }));
            this.reevaluateWelcomeState();
            this.filter = this.instantiationService.createInstance(TestsFilter);
            this.tree = instantiationService.createInstance(listService_1.WorkbenchObjectTree, 'Test Explorer List', listContainer, new ListDelegate(), [
                instantiationService.createInstance(TestItemRenderer, labels),
                instantiationService.createInstance(WorkspaceFolderRenderer, labels),
                instantiationService.createInstance(ErrorRenderer),
            ], {
                simpleKeyboardNavigation: true,
                identityProvider: instantiationService.createInstance(IdentityProvider),
                hideTwistiesOfChildlessElements: false,
                sorter: instantiationService.createInstance(TreeSorter, this),
                keyboardNavigationLabelProvider: instantiationService.createInstance(TreeKeyboardNavigationLabelProvider),
                accessibilityProvider: instantiationService.createInstance(ListAccessibilityProvider),
                filter: this.filter,
            });
            this._register(this.tree.onDidChangeCollapseState(evt => {
                var _a;
                if (evt.node.element instanceof index_1.TestItemTreeElement) {
                    (_a = this.projection.value) === null || _a === void 0 ? void 0 : _a.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                }
            }));
            this._register(filterState.currentDocumentOnly.onDidChange(() => {
                var _a, _b;
                if (!filterState.currentDocumentOnly.value) {
                    this.filter.filterToUri(undefined);
                }
                else if (((_a = editorService.activeEditor) === null || _a === void 0 ? void 0 : _a.resource) && ((_b = this.projection.value) === null || _b === void 0 ? void 0 : _b.hasTestInDocument(editorService.activeEditor.resource))) {
                    this.filter.filterToUri(editorService.activeEditor.resource);
                }
                this.tree.refilter();
            }));
            this._register(this.tree.onContextMenu(e => this.onContextMenu(e)));
            this._register(editorService.onDidActiveEditorChange(() => {
                var _a, _b;
                if (filterState.currentDocumentOnly.value && ((_a = editorService.activeEditor) === null || _a === void 0 ? void 0 : _a.resource)) {
                    if ((_b = this.projection.value) === null || _b === void 0 ? void 0 : _b.hasTestInDocument(editorService.activeEditor.resource)) {
                        this.filter.filterToUri(editorService.activeEditor.resource);
                        this.tree.refilter();
                    }
                }
            }));
            this._register(event_1.Event.any(filterState.text.onDidChange, filterState.stateFilter.onDidChange, filterState.showExcludedTests.onDidChange, testService.excludeTests.onDidChange)(this.tree.refilter, this.tree));
            this._register(this.tree);
            this._register(dom.addStandardDisposableListener(this.tree.getHTMLElement(), 'keydown', evt => {
                if (evt.equals(3 /* Enter */)) {
                    this.handleExecuteKeypress(evt);
                }
                else if (listWidget_1.DefaultKeyboardNavigationDelegate.mightProducePrintableCharacter(evt)) {
                    filterState.text.value = evt.browserEvent.key;
                    filterState.focusInput();
                }
            }));
            this._register(filterState.reveal.onDidChange(this.revealByIdPath, this));
            this._register(onDidChangeVisibility(visible => {
                if (visible) {
                    filterState.focusInput();
                }
            }));
            this.updatePreferredProjection();
            this.onDidChangeSelection = this.tree.onDidChangeSelection;
            this._register(this.tree.onDidChangeSelection(async (evt) => {
                const selected = evt.elements[0];
                if (selected && evt.browserEvent && selected instanceof index_1.TestItemTreeElement
                    && selected.children.size === 0 && selected.test.expand === 0 /* NotExpandable */) {
                    if (!(await this.tryPeekError(selected)) && (selected === null || selected === void 0 ? void 0 : selected.test)) {
                        this.instantiationService.invokeFunction(accessor => new testExplorerActions_1.EditFocusedTest().run(accessor, selected.test.item, true));
                    }
                }
            }));
            let followRunningTests = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.followRunningTest" /* FollowRunningTest */);
            this._register(configurationService.onDidChangeConfiguration(() => {
                followRunningTests = (0, configuration_2.getTestingConfiguration)(configurationService, "testing.followRunningTest" /* FollowRunningTest */);
            }));
            this._register(testResults.onTestChanged(evt => {
                if (!followRunningTests) {
                    return;
                }
                if (evt.reason !== 3 /* OwnStateChange */) {
                    return;
                }
                // follow running tests, or tests whose state changed. Tests that
                // complete very fast may not enter the running state at all.
                if (evt.item.ownComputedState !== extHostTypes_1.TestResultState.Running && !(evt.previous === extHostTypes_1.TestResultState.Queued && (0, testingStates_1.isStateWithResult)(evt.item.ownComputedState))) {
                    return;
                }
                this.revealByIdPath((0, testResult_1.getPathForTestInResult)(evt.item, evt.result), false, false);
            }));
            this._register(testResults.onResultsChanged(() => {
                this.tree.resort(null);
            }));
        }
        get viewMode() {
            var _a;
            return (_a = this._viewMode.get()) !== null && _a !== void 0 ? _a : "true" /* Tree */;
        }
        set viewMode(newMode) {
            if (newMode === this._viewMode.get()) {
                return;
            }
            this._viewMode.set(newMode);
            this.updatePreferredProjection();
            this.storageService.store('testing.viewMode', newMode, 1 /* WORKSPACE */, 0 /* USER */);
        }
        get viewSorting() {
            var _a;
            return (_a = this._viewSorting.get()) !== null && _a !== void 0 ? _a : "location" /* ByLocation */;
        }
        set viewSorting(newSorting) {
            if (newSorting === this._viewSorting.get()) {
                return;
            }
            this._viewSorting.set(newSorting);
            this.tree.resort(null);
            this.storageService.store('testing.viewSorting', newSorting, 1 /* WORKSPACE */, 0 /* USER */);
        }
        /**
         * Re-layout the tree.
         */
        layout() {
            this.tree.layout(); // The tree will measure its container
        }
        /**
         * Replaces the test listener and recalculates the tree.
         */
        replaceSubscription(listener) {
            this.listener = listener;
            this.updatePreferredProjection();
            this.reevaluateWelcomeState();
        }
        /**
         * Tries to reveal by extension ID. Queues the request if the extension
         * ID is not currently available.
         */
        revealByIdPath(idPath, expand = true, focus = true) {
            if (!idPath) {
                this.hasPendingReveal = false;
                return;
            }
            if (!this.projection.value) {
                return;
            }
            // If the item itself is visible in the tree, show it. Otherwise, expand
            // its closest parent.
            let expandToLevel = 0;
            for (let i = idPath.length - 1; i >= expandToLevel; i--) {
                const element = this.projection.value.getElementByTestId(idPath[i]);
                // Skip all elements that aren't in the tree.
                if (!element || !this.tree.hasElement(element)) {
                    continue;
                }
                // If this 'if' is true, we're at the closest-visible parent to the node
                // we want to expand. Expand that, and then start the loop again because
                // we might already have children for it.
                if (i < idPath.length - 1) {
                    if (expand) {
                        this.tree.expand(element);
                        expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
                        i = idPath.length - 1; // restart the loop since new children may now be visible
                        continue;
                    }
                }
                // Otherwise, we've arrived!
                // If the node or any of its children are excluded, flip on the 'show
                // excluded tests' checkbox automatically.
                for (let n = element; n instanceof index_1.TestItemTreeElement; n = n.parent) {
                    if (n.test && this.testService.excludeTests.value.has(n.test.item.extId)) {
                        this.filterState.showExcludedTests.value = true;
                        break;
                    }
                }
                this.filterState.reveal.value = undefined;
                this.hasPendingReveal = false;
                if (focus) {
                    this.tree.domFocus();
                }
                this.revealTimeout.value = (0, async_1.disposableTimeout)(() => {
                    // Don't scroll to the item if it's already visible
                    if (this.tree.getRelativeTop(element) === null) {
                        this.tree.reveal(element, 0.5);
                    }
                    this.tree.setFocus([element]);
                    this.tree.setSelection([element]);
                }, 1);
                return;
            }
            // If here, we've expanded all parents we can. Waiting on data to come
            // in to possibly show the revealed test.
            this.hasPendingReveal = true;
        }
        /**
         * Collapse all items in the tree.
         */
        async collapseAll() {
            this.tree.collapseAll();
        }
        /**
         * Tries to peek the first test error, if the item is in a failed state.
         */
        async tryPeekError(item) {
            const lookup = item.test && this.testResults.getStateById(item.test.item.extId);
            return lookup && lookup[1].tasks.some(s => (0, testingStates_1.isFailedState)(s.state))
                ? this.peekOpener.tryPeekFirstError(lookup[0], lookup[1], { preserveFocus: true })
                : false;
        }
        onContextMenu(evt) {
            const element = evt.element;
            if (!(element instanceof index_1.TestItemTreeElement)) {
                return;
            }
            const actions = getActionableElementActions(this.instantiationService, this.contextKeyService, this.menuService, element);
            this.contextMenuService.showContextMenu({
                getAnchor: () => evt.anchor,
                getActions: () => actions.value.secondary,
                getActionsContext: () => element.test.item.extId,
                onHide: () => actions.dispose(),
            });
        }
        handleExecuteKeypress(evt) {
            var _a;
            const focused = this.tree.getFocus();
            const selected = this.tree.getSelection();
            let targeted;
            if (focused.length === 1 && selected.includes(focused[0])) {
                (_a = evt.browserEvent) === null || _a === void 0 ? void 0 : _a.preventDefault();
                targeted = selected;
            }
            else {
                targeted = focused;
            }
            const toRun = targeted
                .filter((e) => e instanceof index_1.TestItemTreeElement)
                .filter(e => e.test.item.runnable);
            if (toRun.length) {
                this.testService.runTests({
                    debug: false,
                    tests: toRun.map(t => ({ src: t.test.src, testId: t.test.item.extId })),
                });
            }
        }
        reevaluateWelcomeState() {
            const shouldShowWelcome = !!this.listener
                && this.listener.subscription.busyProviders === 0
                && this.listener.subscription.pendingRootProviders === 0
                && this.listener.subscription.isEmpty;
            if (shouldShowWelcome !== this.shouldShowWelcome) {
                this.shouldShowWelcome = shouldShowWelcome;
                this.welcomeVisibilityEmitter.fire(shouldShowWelcome);
            }
        }
        updatePreferredProjection() {
            this.projection.clear();
            if (!this.listener) {
                this.tree.setChildren(null, []);
                return;
            }
            if (this._viewMode.get() === "list" /* List */) {
                this.projection.value = this.instantiationService.createInstance(hierarchalByName_1.HierarchicalByNameProjection, this.listener);
            }
            else {
                this.projection.value = this.instantiationService.createInstance(hierarchalByLocation_1.HierarchicalByLocationProjection, this.listener);
            }
            const scheduler = new async_1.RunOnceScheduler(() => this.applyProjectionChanges(), 200);
            this.projection.value.onUpdate(() => {
                if (!scheduler.isScheduled()) {
                    scheduler.schedule();
                }
            });
            this.applyProjectionChanges();
        }
        applyProjectionChanges() {
            var _a;
            this.reevaluateWelcomeState();
            (_a = this.projection.value) === null || _a === void 0 ? void 0 : _a.applyTo(this.tree);
            if (this.hasPendingReveal) {
                this.revealByIdPath(this.filterState.reveal.value);
            }
        }
        /**
         * Gets the selected tests from the tree.
         */
        getSelectedTests() {
            return this.tree.getSelection();
        }
    };
    TestingExplorerViewModel = __decorate([
        __param(3, configuration_1.IConfigurationService),
        __param(4, actions_2.IMenuService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, testService_1.ITestService),
        __param(7, testingExplorerFilter_1.ITestExplorerFilterState),
        __param(8, instantiation_1.IInstantiationService),
        __param(9, editorService_1.IEditorService),
        __param(10, storage_1.IStorageService),
        __param(11, contextkey_1.IContextKeyService),
        __param(12, testResultService_1.ITestResultService),
        __param(13, testingOutputPeek_1.ITestingPeekOpener)
    ], TestingExplorerViewModel);
    exports.TestingExplorerViewModel = TestingExplorerViewModel;
    var FilterResult;
    (function (FilterResult) {
        FilterResult[FilterResult["Exclude"] = 0] = "Exclude";
        FilterResult[FilterResult["Inherit"] = 1] = "Inherit";
        FilterResult[FilterResult["Include"] = 2] = "Include";
    })(FilterResult || (FilterResult = {}));
    let TestsFilter = class TestsFilter {
        constructor(state, testService) {
            this.state = state;
            this.testService = testService;
        }
        /**
         * Parses and updates the tree filter. Supports lists of patterns that can be !negated.
         */
        setFilter(text) {
            this.lastText = text;
            text = text.trim();
            if (!text) {
                this.filters = undefined;
                return;
            }
            this.filters = [];
            for (const filter of (0, glob_1.splitGlobAware)(text, ',').map(s => s.trim()).filter(s => !!s.length)) {
                if (filter.startsWith('!')) {
                    this.filters.push([false, filter.slice(1).toLowerCase()]);
                }
                else {
                    this.filters.push([true, filter.toLowerCase()]);
                }
            }
        }
        filterToUri(uri) {
            this._filterToUri = uri === null || uri === void 0 ? void 0 : uri.toString();
        }
        /**
         * @inheritdoc
         */
        filter(element) {
            if (element instanceof index_1.TestTreeErrorMessage) {
                return 1 /* Visible */;
            }
            if (this.state.text.value !== this.lastText) {
                this.setFilter(this.state.text.value);
            }
            if (element.test
                && !this.state.showExcludedTests.value
                && this.testService.excludeTests.value.has(element.test.item.extId)) {
                return 0 /* Hidden */;
            }
            switch (Math.min(this.testFilterText(element), this.testLocation(element), this.testState(element))) {
                case 0 /* Exclude */:
                    return 0 /* Hidden */;
                case 2 /* Include */:
                    return 1 /* Visible */;
                default:
                    return 2 /* Recurse */;
            }
        }
        testState(element) {
            switch (this.state.stateFilter.value) {
                case "all" /* All */:
                    return 2 /* Include */;
                case "excuted" /* OnlyExecuted */:
                    return element.state !== extHostTypes_1.TestResultState.Unset ? 2 /* Include */ : 1 /* Inherit */;
                case "failed" /* OnlyFailed */:
                    return (0, testingStates_1.isFailedState)(element.state) ? 2 /* Include */ : 1 /* Inherit */;
            }
        }
        testLocation(element) {
            if (!this._filterToUri || !this.state.currentDocumentOnly.value) {
                return 2 /* Include */;
            }
            for (let e = element; e instanceof index_1.TestItemTreeElement; e = e.parent) {
                return e.test.item.uri.toString() === this._filterToUri
                    ? 2 /* Include */
                    : 0 /* Exclude */;
            }
            return 1 /* Inherit */;
        }
        testFilterText(element) {
            if (!this.filters) {
                return 2 /* Include */;
            }
            for (let e = element; e; e = e.parent) {
                // start as included if the first glob is a negation
                let included = this.filters[0][0] === false ? 2 /* Include */ : 1 /* Inherit */;
                const data = e.label.toLowerCase();
                for (const [include, filter] of this.filters) {
                    if (data.includes(filter)) {
                        included = include ? 2 /* Include */ : 0 /* Exclude */;
                    }
                }
                if (included !== 1 /* Inherit */) {
                    return included;
                }
            }
            return 1 /* Inherit */;
        }
    };
    TestsFilter = __decorate([
        __param(0, testingExplorerFilter_1.ITestExplorerFilterState),
        __param(1, testService_1.ITestService)
    ], TestsFilter);
    class TreeSorter {
        constructor(viewModel) {
            this.viewModel = viewModel;
        }
        compare(a, b) {
            if (a instanceof index_1.TestTreeErrorMessage || b instanceof index_1.TestTreeErrorMessage) {
                return (a instanceof index_1.TestTreeErrorMessage ? -1 : 0) + (b instanceof index_1.TestTreeErrorMessage ? 1 : 0);
            }
            let delta = (0, testingStates_1.cmpPriority)(a.state, b.state);
            if (delta !== 0) {
                return delta;
            }
            if (this.viewModel.viewSorting === "location" /* ByLocation */) {
                if (a instanceof index_1.TestItemTreeElement && b instanceof index_1.TestItemTreeElement
                    && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
                    const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
                    if (delta !== 0) {
                        return delta;
                    }
                }
            }
            return a.label.localeCompare(b.label);
        }
    }
    const getLabelForTestTreeElement = (element) => {
        let label = (0, nls_1.localize)(0, null, element.label, constants_1.testStateNames[element.state]);



        if (element instanceof index_1.TestItemTreeElement && element.retired) {
            label = (0, nls_1.localize)(1, null, label, constants_1.testStateNames[element.state]);



        }
        return label;
    };
    class ListAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(2, null);
        }
        getAriaLabel(element) {
            return element instanceof index_1.TestTreeErrorMessage
                ? element.description
                : getLabelForTestTreeElement(element);
        }
    }
    class TreeKeyboardNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            return element instanceof index_1.TestTreeErrorMessage ? element.message : element.label;
        }
    }
    class ListDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            if (element instanceof index_1.TestTreeWorkspaceFolder) {
                return WorkspaceFolderRenderer.ID;
            }
            if (element instanceof index_1.TestTreeErrorMessage) {
                return ErrorRenderer.ID;
            }
            return TestItemRenderer.ID;
        }
    }
    class IdentityProvider {
        getId(element) {
            return element.treeId;
        }
    }
    let ErrorRenderer = class ErrorRenderer {
        constructor(instantionService) {
            this.renderer = instantionService.createInstance(markdownRenderer_1.MarkdownRenderer, {});
        }
        get templateId() {
            return ErrorRenderer.ID;
        }
        renderTemplate(container) {
            const label = dom.append(container, dom.$('.error'));
            return { label };
        }
        renderElement({ element }, _, data) {
            if (typeof element.message === 'string') {
                data.label.innerText = element.message;
            }
            else {
                const result = this.renderer.render(element.message, { inline: true });
                data.label.appendChild(result.element);
            }
            data.label.title = element.description;
        }
        disposeTemplate() {
            // noop
        }
    };
    ErrorRenderer.ID = 'error';
    ErrorRenderer = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], ErrorRenderer);
    class ActionableItemTemplateData extends lifecycle_1.Disposable {
        constructor(labels, menuService, contextKeyService, instantiationService) {
            super();
            this.labels = labels;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.instantiationService = instantiationService;
        }
        /**
         * @inheritdoc
         */
        renderTemplate(container) {
            const wrapper = dom.append(container, dom.$('.test-item'));
            const icon = dom.append(wrapper, dom.$('.computed-state'));
            const name = dom.append(wrapper, dom.$('.name'));
            const label = this.labels.create(name, { supportHighlights: true });
            dom.append(wrapper, dom.$(themeService_1.ThemeIcon.asCSSSelector(icons_1.testingHiddenIcon)));
            const actionBar = new actionbar_1.ActionBar(wrapper, {
                actionViewItemProvider: action => action instanceof actions_2.MenuItemAction
                    ? this.instantiationService.createInstance(menuEntryActionViewItem_1.MenuEntryActionViewItem, action)
                    : undefined
            });
            return { wrapper, label, actionBar, icon, elementDisposable: [], templateDisposable: [label, actionBar] };
        }
        /**
         * @inheritdoc
         */
        renderElement({ element }, _, data) {
            this.fillActionBar(element, data);
        }
        /**
         * @inheritdoc
         */
        disposeTemplate(templateData) {
            (0, lifecycle_1.dispose)(templateData.templateDisposable);
            templateData.templateDisposable = [];
        }
        /**
         * @inheritdoc
         */
        disposeElement(_element, _, templateData) {
            (0, lifecycle_1.dispose)(templateData.elementDisposable);
            templateData.elementDisposable = [];
        }
        fillActionBar(element, data) {
            const actions = getActionableElementActions(this.instantiationService, this.contextKeyService, this.menuService, element);
            data.elementDisposable.push(actions);
            data.actionBar.clear();
            data.actionBar.push(actions.value.primary, { icon: true, label: false });
        }
    }
    let TestItemRenderer = class TestItemRenderer extends ActionableItemTemplateData {
        constructor(labels, menuService, contextKeyService, instantiationService, testService) {
            super(labels, menuService, contextKeyService, instantiationService);
            this.testService = testService;
        }
        /**
         * @inheritdoc
         */
        get templateId() {
            return TestItemRenderer.ID;
        }
        /**
         * @inheritdoc
         */
        renderElement(node, depth, data) {
            super.renderElement(node, depth, data);
            const label = { name: node.element.label };
            const options = {};
            data.label.setResource(label, options);
            const testHidden = this.testService.excludeTests.value.has(node.element.test.item.extId);
            data.wrapper.classList.toggle('test-is-hidden', testHidden);
            const icon = icons_1.testingStatesToIcons.get(node.element.test.expand === 2 /* BusyExpanding */ ? extHostTypes_1.TestResultState.Running : node.element.state);
            data.icon.className = 'computed-state ' + (icon ? themeService_1.ThemeIcon.asClassName(icon) : '');
            if (node.element.retired) {
                data.icon.className += ' retired';
            }
            label.resource = node.element.test.item.uri;
            options.title = getLabelForTestTreeElement(node.element);
            options.fileKind = files_1.FileKind.FILE;
            label.description = node.element.description || undefined;
            data.label.setResource(label, options);
        }
    };
    TestItemRenderer.ID = 'testItem';
    TestItemRenderer = __decorate([
        __param(1, actions_2.IMenuService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, testService_1.ITestService)
    ], TestItemRenderer);
    let WorkspaceFolderRenderer = class WorkspaceFolderRenderer extends ActionableItemTemplateData {
        constructor(labels, menuService, contextKeyService, instantiationService) {
            super(labels, menuService, contextKeyService, instantiationService);
        }
        /**
         * @inheritdoc
         */
        get templateId() {
            return WorkspaceFolderRenderer.ID;
        }
        /**
         * @inheritdoc
         */
        renderElement(node, depth, data) {
            super.renderElement(node, depth, data);
            const label = { name: node.element.label };
            const options = {};
            data.label.setResource(label, options);
            const icon = icons_1.testingStatesToIcons.get(node.element.state);
            data.icon.className = 'computed-state ' + (icon ? themeService_1.ThemeIcon.asClassName(icon) : '');
            options.fileKind = files_1.FileKind.ROOT_FOLDER;
            data.label.setResource(label, options);
        }
    };
    WorkspaceFolderRenderer.ID = 'workspaceFolder';
    WorkspaceFolderRenderer = __decorate([
        __param(1, actions_2.IMenuService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, instantiation_1.IInstantiationService)
    ], WorkspaceFolderRenderer);
    const getActionableElementActions = (instantionService, contextKeyService, menuService, element) => {
        const test = element instanceof index_1.TestItemTreeElement ? element.test : undefined;
        const contextOverlay = contextKeyService.createOverlay([
            ['view', "workbench.view.testing" /* ExplorerViewId */],
            [testingContextKeys_1.TestingContextKeys.testItemExtId.key, test === null || test === void 0 ? void 0 : test.item.extId]
        ]);
        const menu = menuService.createMenu(actions_2.MenuId.TestItem, contextOverlay);
        try {
            const primary = [];
            const secondary = [];
            const running = element.state === extHostTypes_1.TestResultState.Running;
            if (!iterator_1.Iterable.isEmpty(element.runnable)) {
                const run = instantionService.createInstance(testExplorerActions_1.RunAction, element.runnable, running);
                primary.push(run);
                secondary.push(run);
            }
            if (!iterator_1.Iterable.isEmpty(element.debuggable)) {
                const debug = instantionService.createInstance(testExplorerActions_1.DebugAction, element.debuggable, running);
                primary.push(debug);
                secondary.push(debug);
            }
            if (test) {
                secondary.push(instantionService.createInstance(testExplorerActions_1.HideOrShowTestAction, test.item.extId));
            }
            const result = { primary, secondary };
            const actionsDisposable = (0, menuEntryActionViewItem_1.createAndFillInActionBarActions)(menu, {
                arg: test === null || test === void 0 ? void 0 : test.item,
                shouldForwardArgs: true,
            }, result, 'inline');
            return { value: result, dispose: () => actionsDisposable.dispose };
        }
        finally {
            menu.dispose();
        }
    };
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        if (theme.type === 'dark') {
            const foregroundColor = theme.getColor(colorRegistry_1.foreground);
            if (foregroundColor) {
                const fgWithOpacity = new color_1.Color(new color_1.RGBA(foregroundColor.rgba.r, foregroundColor.rgba.g, foregroundColor.rgba.b, 0.65));
                collector.addRule(`.test-explorer .test-explorer-messages { color: ${fgWithOpacity}; }`);
            }
        }
    });
});
//# sourceMappingURL=testingExplorerView.js.map