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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/nls!vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/platform/actions/common/actions", "vs/platform/browser/contextScopedHistoryWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/common/observableValue", "vs/workbench/contrib/testing/common/storedValue", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testService"], function (require, exports, dom, actionbar_1, actionViewItems_1, dropdownActionViewItem_1, actions_1, async_1, event_1, nls_1, actions_2, contextScopedHistoryWidget_1, contextkey_1, contextView_1, instantiation_1, storage_1, styler_1, themeService_1, icons_1, observableValue_1, storedValue_1, testingContextKeys_1, testService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingExplorerFilter = exports.TestExplorerFilterState = exports.ITestExplorerFilterState = void 0;
    exports.ITestExplorerFilterState = (0, instantiation_1.createDecorator)('testingFilterState');
    let TestExplorerFilterState = class TestExplorerFilterState {
        constructor(storage) {
            this.storage = storage;
            this.focusEmitter = new event_1.Emitter();
            this.text = new observableValue_1.MutableObservableValue('');
            this.stateFilter = observableValue_1.MutableObservableValue.stored(new storedValue_1.StoredValue({
                key: 'testStateFilter',
                scope: 1 /* WORKSPACE */,
                target: 0 /* USER */
            }, this.storage), "all" /* All */);
            this.currentDocumentOnly = observableValue_1.MutableObservableValue.stored(new storedValue_1.StoredValue({
                key: 'testsByCurrentDocumentOnly',
                scope: 1 /* WORKSPACE */,
                target: 0 /* USER */
            }, this.storage), false);
            this.showExcludedTests = new observableValue_1.MutableObservableValue(false);
            this.reveal = new observableValue_1.MutableObservableValue(undefined);
            this.onDidRequestInputFocus = this.focusEmitter.event;
        }
        focusInput() {
            this.focusEmitter.fire();
        }
    };
    TestExplorerFilterState = __decorate([
        __param(0, storage_1.IStorageService)
    ], TestExplorerFilterState);
    exports.TestExplorerFilterState = TestExplorerFilterState;
    let TestingExplorerFilter = class TestingExplorerFilter extends actionViewItems_1.BaseActionViewItem {
        constructor(action, state, contextViewService, themeService, instantiationService) {
            super(null, action);
            this.state = state;
            this.contextViewService = contextViewService;
            this.themeService = themeService;
            this.instantiationService = instantiationService;
            this.history = this.instantiationService.createInstance(storedValue_1.StoredValue, {
                key: 'testing.filterHistory',
                scope: 1 /* WORKSPACE */,
                target: 0 /* USER */
            });
            this.filtersAction = new actions_1.Action('markersFiltersAction', (0, nls_1.localize)(0, null), 'testing-filter-button ' + themeService_1.ThemeIcon.asClassName(icons_1.testingFilterIcon));
            this.updateFilterActiveState();
            this._register(state.currentDocumentOnly.onDidChange(this.updateFilterActiveState, this));
            this._register(state.stateFilter.onDidChange(this.updateFilterActiveState, this));
        }
        /**
         * @override
         */
        render(container) {
            container.classList.add('testing-filter-action-item');
            const updateDelayer = this._register(new async_1.Delayer(400));
            const wrapper = dom.$('.testing-filter-wrapper');
            container.appendChild(wrapper);
            const input = this.input = this._register(this.instantiationService.createInstance(contextScopedHistoryWidget_1.ContextScopedHistoryInputBox, wrapper, this.contextViewService, {
                placeholder: (0, nls_1.localize)(1, null),
                history: this.history.get([]),
            }));
            input.value = this.state.text.value;
            this._register((0, styler_1.attachInputBoxStyler)(input, this.themeService));
            this._register(this.state.text.onDidChange(newValue => {
                input.value = newValue;
            }));
            this._register(this.state.onDidRequestInputFocus(() => {
                input.focus();
            }));
            this._register(input.onDidChange(() => updateDelayer.trigger(() => {
                input.addToHistory();
                this.state.text.value = input.value;
            })));
            this._register(dom.addStandardDisposableListener(input.inputElement, dom.EventType.KEY_DOWN, e => {
                if (e.equals(9 /* Escape */)) {
                    input.value = '';
                    e.stopPropagation();
                    e.preventDefault();
                }
            }));
            const actionbar = this._register(new actionbar_1.ActionBar(container, {
                actionViewItemProvider: action => {
                    if (action.id === this.filtersAction.id) {
                        return this.instantiationService.createInstance(FiltersDropdownMenuActionViewItem, action, this.state, this.actionRunner);
                    }
                    return undefined;
                }
            }));
            actionbar.push(this.filtersAction, { icon: true, label: false });
        }
        /**
         * Focuses the filter input.
         */
        focus() {
            this.input.focus();
        }
        /**
         * Persists changes to the input history.
         */
        saveState() {
            const history = this.input.getHistory();
            if (history.length) {
                this.history.store(history);
            }
            else {
                this.history.delete();
            }
        }
        /**
         * @override
         */
        dispose() {
            this.saveState();
            super.dispose();
        }
        /**
         * Updates the 'checked' state of the filter submenu.
         */
        updateFilterActiveState() {
            this.filtersAction.checked = this.state.currentDocumentOnly.value
                || this.state.stateFilter.value !== "all" /* All */;
        }
    };
    TestingExplorerFilter = __decorate([
        __param(1, exports.ITestExplorerFilterState),
        __param(2, contextView_1.IContextViewService),
        __param(3, themeService_1.IThemeService),
        __param(4, instantiation_1.IInstantiationService)
    ], TestingExplorerFilter);
    exports.TestingExplorerFilter = TestingExplorerFilter;
    let FiltersDropdownMenuActionViewItem = class FiltersDropdownMenuActionViewItem extends dropdownActionViewItem_1.DropdownMenuActionViewItem {
        constructor(action, filters, actionRunner, contextMenuService, testService) {
            super(action, { getActions: () => this.getActions() }, contextMenuService, {
                actionRunner,
                classNames: action.class,
                anchorAlignmentProvider: () => 1 /* RIGHT */,
                menuAsChild: true
            });
            this.filters = filters;
            this.testService = testService;
        }
        render(container) {
            super.render(container);
            this.updateChecked();
        }
        getActions() {
            return [
                ...[
                    { v: "failed" /* OnlyFailed */, label: (0, nls_1.localize)(2, null) },
                    { v: "excuted" /* OnlyExecuted */, label: (0, nls_1.localize)(3, null) },
                    { v: "all" /* All */, label: (0, nls_1.localize)(4, null) },
                ].map(({ v, label }) => ({
                    checked: this.filters.stateFilter.value === v,
                    class: undefined,
                    enabled: true,
                    id: v,
                    label,
                    run: async () => {
                        this.filters.stateFilter.value = this.filters.stateFilter.value === v ? "all" /* All */ : v;
                    },
                    tooltip: '',
                    dispose: () => null
                })),
                new actions_1.Separator(),
                {
                    checked: this.filters.showExcludedTests.value,
                    class: undefined,
                    enabled: true,
                    id: 'showExcluded',
                    label: (0, nls_1.localize)(5, null),
                    run: async () => this.filters.showExcludedTests.value = !this.filters.showExcludedTests.value,
                    tooltip: '',
                    dispose: () => null
                },
                {
                    checked: false,
                    class: undefined,
                    enabled: this.testService.excludeTests.value.size > 0,
                    id: 'removeExcluded',
                    label: (0, nls_1.localize)(6, null),
                    run: async () => this.testService.clearExcludedTests(),
                    tooltip: '',
                    dispose: () => null
                },
                new actions_1.Separator(),
                {
                    checked: this.filters.currentDocumentOnly.value,
                    class: undefined,
                    enabled: true,
                    id: 'currentDocument',
                    label: (0, nls_1.localize)(7, null),
                    run: async () => this.filters.currentDocumentOnly.value = !this.filters.currentDocumentOnly.value,
                    tooltip: '',
                    dispose: () => null
                },
            ];
        }
        updateChecked() {
            this.element.classList.toggle('checked', this._action.checked);
        }
    };
    FiltersDropdownMenuActionViewItem = __decorate([
        __param(3, contextView_1.IContextMenuService),
        __param(4, testService_1.ITestService)
    ], FiltersDropdownMenuActionViewItem);
    (0, actions_2.registerAction2)(class extends actions_2.Action2 {
        constructor() {
            super({
                id: "workbench.actions.treeView.testExplorer.filter" /* FilterActionId */,
                title: (0, nls_1.localize)(8, null),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */), testingContextKeys_1.TestingContextKeys.explorerLocation.isEqualTo(1 /* Panel */)),
                    group: 'navigation',
                    order: 1,
                },
            });
        }
        async run() { }
    });
});
//# sourceMappingURL=testingExplorerFilter.js.map