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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/activitybar/activitybarPart", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/common/activity", "vs/workbench/browser/part", "vs/workbench/browser/parts/activitybar/activitybarActions", "vs/workbench/services/activity/common/activity", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/workbench/browser/actions/layoutActions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/compositeBar", "vs/base/browser/dom", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uri", "vs/workbench/browser/parts/compositeBarActions", "vs/workbench/common/views", "vs/platform/contextkey/common/contextkey", "vs/base/common/types", "vs/workbench/services/activityBar/browser/activityBarService", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/browser/parts/titlebar/menubarControl", "vs/platform/configuration/common/configuration", "vs/platform/windows/common/windows", "vs/base/common/platform", "vs/base/common/codicons", "vs/base/common/actions", "vs/base/common/event", "vs/base/browser/keyboardEvent", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/platform/theme/common/iconRegistry", "vs/base/common/hash", "vs/css!./media/activitybarpart"], function (require, exports, nls_1, actionbar_1, activity_1, part_1, activitybarActions_1, activity_2, layoutService_1, instantiation_1, lifecycle_1, layoutActions_1, themeService_1, theme_1, colorRegistry_1, compositeBar_1, dom_1, storage_1, extensions_1, uri_1, compositeBarActions_1, views_1, contextkey_1, types_1, activityBarService_1, extensions_2, environmentService_1, menubarControl_1, configuration_1, windows_1, platform_1, codicons_1, actions_1, event_1, keyboardEvent_1, actions_2, actions_3, iconRegistry_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActivitybarPart = void 0;
    let ActivitybarPart = class ActivitybarPart extends part_1.Part {
        constructor(instantiationService, layoutService, themeService, storageService, extensionService, viewDescriptorService, viewsService, contextKeyService, configurationService, environmentService) {
            super("workbench.parts.activitybar" /* ACTIVITYBAR_PART */, { hasTitle: false }, themeService, storageService, layoutService);
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.extensionService = extensionService;
            this.viewDescriptorService = viewDescriptorService;
            this.viewsService = viewsService;
            this.contextKeyService = contextKeyService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            //#region IView
            this.minimumWidth = 48;
            this.maximumWidth = 48;
            this.minimumHeight = 0;
            this.maximumHeight = Number.POSITIVE_INFINITY;
            this.globalActivity = [];
            this.accountsActivity = [];
            this.compositeActions = new Map();
            this.viewContainerDisposables = new Map();
            this.keyboardNavigationDisposables = this._register(new lifecycle_1.DisposableStore());
            this.location = 0 /* Sidebar */;
            this.hasExtensionsRegistered = false;
            this.enabledViewContainersContextKeys = new Map();
            this._cachedViewContainers = undefined;
            for (const cachedViewContainer of this.cachedViewContainers) {
                cachedViewContainer.visible = !this.shouldBeHidden(cachedViewContainer.id, cachedViewContainer);
            }
            this.compositeBar = this.createCompositeBar();
            this.onDidRegisterViewContainers(this.getViewContainers());
            this.registerListeners();
        }
        createCompositeBar() {
            const cachedItems = this.cachedViewContainers
                .map(container => ({
                id: container.id,
                name: container.name,
                visible: container.visible,
                order: container.order,
                pinned: container.pinned
            }));
            return this._register(this.instantiationService.createInstance(compositeBar_1.CompositeBar, cachedItems, {
                icon: true,
                orientation: 1 /* VERTICAL */,
                activityHoverOptions: this.getActivityHoverOptions(),
                preventLoopNavigation: true,
                openComposite: compositeId => this.viewsService.openViewContainer(compositeId, true),
                getActivityAction: compositeId => this.getCompositeActions(compositeId).activityAction,
                getCompositePinnedAction: compositeId => this.getCompositeActions(compositeId).pinnedAction,
                getOnCompositeClickAction: compositeId => (0, actions_1.toAction)({ id: compositeId, label: '', run: async () => this.viewsService.isViewContainerVisible(compositeId) ? this.viewsService.closeViewContainer(compositeId) : this.viewsService.openViewContainer(compositeId) }),
                fillExtraContextMenuActions: actions => {
                    const topActions = [];
                    // Menu
                    const menuBarVisibility = (0, windows_1.getMenuBarVisibility)(this.configurationService);
                    if (menuBarVisibility === 'compact' || menuBarVisibility === 'hidden' || menuBarVisibility === 'toggle') {
                        topActions.push({
                            id: 'toggleMenuVisibility',
                            label: (0, nls_1.localize)(2, null),
                            class: undefined,
                            tooltip: (0, nls_1.localize)(3, null),
                            checked: menuBarVisibility === 'compact',
                            enabled: true,
                            run: async () => this.configurationService.updateValue('window.menuBarVisibility', menuBarVisibility === 'compact' ? 'toggle' : 'compact'),
                            dispose: () => { }
                        });
                    }
                    if (topActions.length) {
                        actions.unshift(...topActions, new actions_1.Separator());
                    }
                    // Accounts
                    actions.push(new actions_1.Separator());
                    actions.push({
                        id: 'toggleAccountsVisibility',
                        label: (0, nls_1.localize)(4, null),
                        class: undefined,
                        tooltip: (0, nls_1.localize)(5, null),
                        checked: this.accountsVisibilityPreference,
                        enabled: true,
                        run: async () => this.accountsVisibilityPreference = !this.accountsVisibilityPreference,
                        dispose: () => { }
                    });
                    actions.push(new actions_1.Separator());
                    // Toggle Sidebar
                    actions.push(this.instantiationService.createInstance(layoutActions_1.ToggleSidebarPositionAction, layoutActions_1.ToggleSidebarPositionAction.ID, layoutActions_1.ToggleSidebarPositionAction.getLabel(this.layoutService)));
                    // Toggle Activity Bar
                    actions.push((0, actions_1.toAction)({ id: layoutActions_1.ToggleActivityBarVisibilityAction.ID, label: (0, nls_1.localize)(6, null), run: async () => this.instantiationService.invokeFunction(accessor => new layoutActions_1.ToggleActivityBarVisibilityAction().run(accessor)) }));
                },
                getContextMenuActionsForComposite: compositeId => this.getContextMenuActionsForComposite(compositeId),
                getDefaultCompositeId: () => this.viewDescriptorService.getDefaultViewContainer(this.location).id,
                hidePart: () => this.layoutService.setSideBarHidden(true),
                dndHandler: new compositeBar_1.CompositeDragAndDrop(this.viewDescriptorService, 0 /* Sidebar */, (id, focus) => this.viewsService.openViewContainer(id, focus), (from, to, before) => this.compositeBar.move(from, to, before === null || before === void 0 ? void 0 : before.verticallyBefore), () => this.compositeBar.getCompositeBarItems()),
                compositeSize: 52,
                colors: (theme) => this.getActivitybarItemColors(theme),
                overflowActionSize: ActivitybarPart.ACTION_HEIGHT
            }));
        }
        getActivityHoverOptions() {
            return {
                position: () => this.layoutService.getSideBarPosition() === 0 /* LEFT */ ? 1 /* RIGHT */ : 0 /* LEFT */,
                delay: () => 0
            };
        }
        getContextMenuActionsForComposite(compositeId) {
            const actions = [];
            const viewContainer = this.viewDescriptorService.getViewContainerById(compositeId);
            const defaultLocation = this.viewDescriptorService.getDefaultViewContainerLocation(viewContainer);
            if (defaultLocation !== this.viewDescriptorService.getViewContainerLocation(viewContainer)) {
                actions.push((0, actions_1.toAction)({ id: 'resetLocationAction', label: (0, nls_1.localize)(7, null), run: () => this.viewDescriptorService.moveViewContainerToLocation(viewContainer, defaultLocation) }));
            }
            else {
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                if (viewContainerModel.allViewDescriptors.length === 1) {
                    const viewToReset = viewContainerModel.allViewDescriptors[0];
                    const defaultContainer = this.viewDescriptorService.getDefaultContainerById(viewToReset.id);
                    if (defaultContainer !== viewContainer) {
                        actions.push((0, actions_1.toAction)({ id: 'resetLocationAction', label: (0, nls_1.localize)(8, null), run: () => this.viewDescriptorService.moveViewsToContainer([viewToReset], defaultContainer) }));
                    }
                }
            }
            return actions;
        }
        registerListeners() {
            // View Container Changes
            this._register(this.viewDescriptorService.onDidChangeViewContainers(({ added, removed }) => this.onDidChangeViewContainers(added, removed)));
            this._register(this.viewDescriptorService.onDidChangeContainerLocation(({ viewContainer, from, to }) => this.onDidChangeViewContainerLocation(viewContainer, from, to)));
            // View Container Visibility Changes
            this._register(event_1.Event.filter(this.viewsService.onDidChangeViewContainerVisibility, e => e.location === this.location)(({ id, visible }) => this.onDidChangeViewContainerVisibility(id, visible)));
            // Extension registration
            let disposables = this._register(new lifecycle_1.DisposableStore());
            this._register(this.extensionService.onDidRegisterExtensions(() => {
                disposables.clear();
                this.onDidRegisterExtensions();
                this.compositeBar.onDidChange(() => this.saveCachedViewContainers(), this, disposables);
                this.storageService.onDidChangeValue(e => this.onDidStorageValueChange(e), this, disposables);
            }));
            // Register for configuration changes
            this._register(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('window.menuBarVisibility')) {
                    if ((0, windows_1.getMenuBarVisibility)(this.configurationService) === 'compact') {
                        this.installMenubar();
                    }
                    else {
                        this.uninstallMenubar();
                    }
                }
            }));
        }
        onDidChangeViewContainers(added, removed) {
            removed.filter(({ location }) => location === 0 /* Sidebar */).forEach(({ container }) => this.onDidDeregisterViewContainer(container));
            this.onDidRegisterViewContainers(added.filter(({ location }) => location === 0 /* Sidebar */).map(({ container }) => container));
        }
        onDidChangeViewContainerLocation(container, from, to) {
            if (from === this.location) {
                this.onDidDeregisterViewContainer(container);
            }
            if (to === this.location) {
                this.onDidRegisterViewContainers([container]);
            }
        }
        onDidChangeViewContainerVisibility(id, visible) {
            if (visible) {
                // Activate view container action on opening of a view container
                this.onDidViewContainerVisible(id);
            }
            else {
                // Deactivate view container action on close
                this.compositeBar.deactivateComposite(id);
            }
        }
        onDidRegisterExtensions() {
            this.hasExtensionsRegistered = true;
            // show/hide/remove composites
            for (const { id } of this.cachedViewContainers) {
                const viewContainer = this.getViewContainer(id);
                if (viewContainer) {
                    this.showOrHideViewContainer(viewContainer);
                }
                else {
                    if (this.viewDescriptorService.isViewContainerRemovedPermanently(id)) {
                        this.removeComposite(id);
                    }
                    else {
                        this.hideComposite(id);
                    }
                }
            }
            this.saveCachedViewContainers();
        }
        onDidViewContainerVisible(id) {
            const viewContainer = this.getViewContainer(id);
            if (viewContainer) {
                // Update the composite bar by adding
                this.addComposite(viewContainer);
                this.compositeBar.activateComposite(viewContainer.id);
                if (this.shouldBeHidden(viewContainer)) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    if (viewContainerModel.activeViewDescriptors.length === 0) {
                        // Update the composite bar by hiding
                        this.hideComposite(viewContainer.id);
                    }
                }
            }
        }
        showActivity(viewContainerOrActionId, badge, clazz, priority) {
            if (this.getViewContainer(viewContainerOrActionId)) {
                return this.compositeBar.showActivity(viewContainerOrActionId, badge, clazz, priority);
            }
            if (viewContainerOrActionId === activity_1.GLOBAL_ACTIVITY_ID) {
                return this.showGlobalActivity(activity_1.GLOBAL_ACTIVITY_ID, badge, clazz, priority);
            }
            if (viewContainerOrActionId === activity_1.ACCOUNTS_ACTIVITY_ID) {
                return this.showGlobalActivity(activity_1.ACCOUNTS_ACTIVITY_ID, badge, clazz, priority);
            }
            return lifecycle_1.Disposable.None;
        }
        showGlobalActivity(activityId, badge, clazz, priority) {
            if (typeof priority !== 'number') {
                priority = 0;
            }
            const activity = { badge, clazz, priority };
            const activityCache = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivity : this.accountsActivity;
            for (let i = 0; i <= activityCache.length; i++) {
                if (i === activityCache.length) {
                    activityCache.push(activity);
                    break;
                }
                else if (activityCache[i].priority <= priority) {
                    activityCache.splice(i, 0, activity);
                    break;
                }
            }
            this.updateGlobalActivity(activityId);
            return (0, lifecycle_1.toDisposable)(() => this.removeGlobalActivity(activityId, activity));
        }
        removeGlobalActivity(activityId, activity) {
            const activityCache = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivity : this.accountsActivity;
            const index = activityCache.indexOf(activity);
            if (index !== -1) {
                activityCache.splice(index, 1);
                this.updateGlobalActivity(activityId);
            }
        }
        updateGlobalActivity(activityId) {
            const activityAction = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivityAction : this.accountsActivityAction;
            if (!activityAction) {
                return;
            }
            const activityCache = activityId === activity_1.GLOBAL_ACTIVITY_ID ? this.globalActivity : this.accountsActivity;
            if (activityCache.length) {
                const [{ badge, clazz, priority }] = activityCache;
                if (badge instanceof activity_2.NumberBadge && activityCache.length > 1) {
                    const cumulativeNumberBadge = this.getCumulativeNumberBadge(activityCache, priority);
                    activityAction.setBadge(cumulativeNumberBadge);
                }
                else {
                    activityAction.setBadge(badge, clazz);
                }
            }
            else {
                activityAction.setBadge(undefined);
            }
        }
        getCumulativeNumberBadge(activityCache, priority) {
            const numberActivities = activityCache.filter(activity => activity.badge instanceof activity_2.NumberBadge && activity.priority === priority);
            const number = numberActivities.reduce((result, activity) => { return result + activity.badge.number; }, 0);
            const descriptorFn = () => {
                return numberActivities.reduce((result, activity, index) => {
                    result = result + activity.badge.getDescription();
                    if (index < numberActivities.length - 1) {
                        result = `${result}\n`;
                    }
                    return result;
                }, '');
            };
            return new activity_2.NumberBadge(number, descriptorFn);
        }
        uninstallMenubar() {
            if (this.menuBar) {
                this.menuBar.dispose();
                this.menuBar = undefined;
            }
            if (this.menuBarContainer) {
                this.menuBarContainer.remove();
                this.menuBarContainer = undefined;
                this.registerKeyboardNavigationListeners();
            }
        }
        installMenubar() {
            if (this.menuBar) {
                return; // prevent menu bar from installing twice #110720
            }
            this.menuBarContainer = document.createElement('div');
            this.menuBarContainer.classList.add('menubar');
            const content = (0, types_1.assertIsDefined)(this.content);
            content.prepend(this.menuBarContainer);
            // Menubar: install a custom menu bar depending on configuration
            this.menuBar = this._register(this.instantiationService.createInstance(menubarControl_1.CustomMenubarControl));
            this.menuBar.create(this.menuBarContainer);
            this.registerKeyboardNavigationListeners();
        }
        createContentArea(parent) {
            this.element = parent;
            this.content = document.createElement('div');
            this.content.classList.add('content');
            parent.appendChild(this.content);
            // Install menubar if compact
            if ((0, windows_1.getMenuBarVisibility)(this.configurationService) === 'compact') {
                this.installMenubar();
            }
            // View Containers action bar
            this.compositeBarContainer = this.compositeBar.create(this.content);
            // Global action bar
            this.globalActivitiesContainer = document.createElement('div');
            this.content.appendChild(this.globalActivitiesContainer);
            this.createGlobalActivityActionBar(this.globalActivitiesContainer);
            // Keyboard Navigation
            this.registerKeyboardNavigationListeners();
            return this.content;
        }
        registerKeyboardNavigationListeners() {
            this.keyboardNavigationDisposables.clear();
            // Up/Down arrow on compact menu
            if (this.menuBarContainer) {
                this.keyboardNavigationDisposables.add((0, dom_1.addDisposableListener)(this.menuBarContainer, dom_1.EventType.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (kbEvent.equals(18 /* DownArrow */) || kbEvent.equals(17 /* RightArrow */)) {
                        if (this.compositeBar) {
                            this.compositeBar.focus();
                        }
                    }
                }));
            }
            // Up/Down on Activity Icons
            if (this.compositeBarContainer) {
                this.keyboardNavigationDisposables.add((0, dom_1.addDisposableListener)(this.compositeBarContainer, dom_1.EventType.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (kbEvent.equals(18 /* DownArrow */) || kbEvent.equals(17 /* RightArrow */)) {
                        if (this.globalActivityActionBar) {
                            this.globalActivityActionBar.focus(true);
                        }
                    }
                    else if (kbEvent.equals(16 /* UpArrow */) || kbEvent.equals(15 /* LeftArrow */)) {
                        if (this.menuBar) {
                            this.menuBar.toggleFocus();
                        }
                    }
                }));
            }
            // Up arrow on global icons
            if (this.globalActivitiesContainer) {
                this.keyboardNavigationDisposables.add((0, dom_1.addDisposableListener)(this.globalActivitiesContainer, dom_1.EventType.KEY_DOWN, e => {
                    const kbEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (kbEvent.equals(16 /* UpArrow */) || kbEvent.equals(15 /* LeftArrow */)) {
                        if (this.compositeBar) {
                            this.compositeBar.focus(this.getVisibleViewContainerIds().length - 1);
                        }
                    }
                }));
            }
        }
        createGlobalActivityActionBar(container) {
            this.globalActivityActionBar = this._register(new actionbar_1.ActionBar(container, {
                actionViewItemProvider: action => {
                    if (action.id === 'workbench.actions.manage') {
                        return this.instantiationService.createInstance(activitybarActions_1.GlobalActivityActionViewItem, action, () => this.compositeBar.getContextMenuActions(), (theme) => this.getActivitybarItemColors(theme), this.getActivityHoverOptions());
                    }
                    if (action.id === 'workbench.actions.accounts') {
                        return this.instantiationService.createInstance(activitybarActions_1.AccountsActivityActionViewItem, action, () => this.compositeBar.getContextMenuActions(), (theme) => this.getActivitybarItemColors(theme), this.getActivityHoverOptions());
                    }
                    throw new Error(`No view item for action '${action.id}'`);
                },
                orientation: 1 /* VERTICAL */,
                ariaLabel: (0, nls_1.localize)(9, null),
                animated: false,
                preventLoopNavigation: true
            }));
            this.globalActivityAction = this._register(new compositeBarActions_1.ActivityAction({
                id: 'workbench.actions.manage',
                name: (0, nls_1.localize)(10, null),
                cssClass: themeService_1.ThemeIcon.asClassName(ActivitybarPart.GEAR_ICON)
            }));
            if (this.accountsVisibilityPreference) {
                this.accountsActivityAction = this._register(new compositeBarActions_1.ActivityAction({
                    id: 'workbench.actions.accounts',
                    name: (0, nls_1.localize)(11, null),
                    cssClass: themeService_1.ThemeIcon.asClassName(ActivitybarPart.ACCOUNTS_ICON)
                }));
                this.globalActivityActionBar.push(this.accountsActivityAction, { index: ActivitybarPart.ACCOUNTS_ACTION_INDEX });
            }
            this.globalActivityActionBar.push(this.globalActivityAction);
        }
        toggleAccountsActivity() {
            if (this.globalActivityActionBar) {
                if (this.accountsActivityAction) {
                    this.globalActivityActionBar.pull(ActivitybarPart.ACCOUNTS_ACTION_INDEX);
                    this.accountsActivityAction = undefined;
                }
                else {
                    this.accountsActivityAction = this._register(new compositeBarActions_1.ActivityAction({
                        id: 'workbench.actions.accounts',
                        name: (0, nls_1.localize)(12, null),
                        cssClass: codicons_1.Codicon.account.classNames
                    }));
                    this.globalActivityActionBar.push(this.accountsActivityAction, { index: ActivitybarPart.ACCOUNTS_ACTION_INDEX });
                }
            }
            this.updateGlobalActivity(activity_1.ACCOUNTS_ACTIVITY_ID);
        }
        getCompositeActions(compositeId) {
            let compositeActions = this.compositeActions.get(compositeId);
            if (!compositeActions) {
                const viewContainer = this.getViewContainer(compositeId);
                if (viewContainer) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    compositeActions = {
                        activityAction: this.instantiationService.createInstance(activitybarActions_1.ViewContainerActivityAction, this.toActivity(viewContainerModel)),
                        pinnedAction: new compositeBarActions_1.ToggleCompositePinnedAction(this.toActivity(viewContainerModel), this.compositeBar)
                    };
                }
                else {
                    const cachedComposite = this.cachedViewContainers.filter(c => c.id === compositeId)[0];
                    compositeActions = {
                        activityAction: this.instantiationService.createInstance(activitybarActions_1.PlaceHolderViewContainerActivityAction, ActivitybarPart.toActivity(compositeId, compositeId, cachedComposite === null || cachedComposite === void 0 ? void 0 : cachedComposite.icon, undefined)),
                        pinnedAction: new activitybarActions_1.PlaceHolderToggleCompositePinnedAction(compositeId, this.compositeBar)
                    };
                }
                this.compositeActions.set(compositeId, compositeActions);
            }
            return compositeActions;
        }
        onDidRegisterViewContainers(viewContainers) {
            for (const viewContainer of viewContainers) {
                this.addComposite(viewContainer);
                // Pin it by default if it is new
                const cachedViewContainer = this.cachedViewContainers.filter(({ id }) => id === viewContainer.id)[0];
                if (!cachedViewContainer) {
                    this.compositeBar.pin(viewContainer.id);
                }
                // Active
                const visibleViewContainer = this.viewsService.getVisibleViewContainer(this.location);
                if ((visibleViewContainer === null || visibleViewContainer === void 0 ? void 0 : visibleViewContainer.id) === viewContainer.id) {
                    this.compositeBar.activateComposite(viewContainer.id);
                }
                const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                this.updateActivity(viewContainer, viewContainerModel);
                this.showOrHideViewContainer(viewContainer);
                const disposables = new lifecycle_1.DisposableStore();
                disposables.add(viewContainerModel.onDidChangeContainerInfo(() => this.updateActivity(viewContainer, viewContainerModel)));
                disposables.add(viewContainerModel.onDidChangeActiveViewDescriptors(() => this.showOrHideViewContainer(viewContainer)));
                this.viewContainerDisposables.set(viewContainer.id, disposables);
            }
        }
        onDidDeregisterViewContainer(viewContainer) {
            const disposable = this.viewContainerDisposables.get(viewContainer.id);
            if (disposable) {
                disposable.dispose();
            }
            this.viewContainerDisposables.delete(viewContainer.id);
            this.removeComposite(viewContainer.id);
        }
        updateActivity(viewContainer, viewContainerModel) {
            const activity = this.toActivity(viewContainerModel);
            const { activityAction, pinnedAction } = this.getCompositeActions(viewContainer.id);
            activityAction.updateActivity(activity);
            if (pinnedAction instanceof activitybarActions_1.PlaceHolderToggleCompositePinnedAction) {
                pinnedAction.setActivity(activity);
            }
            this.saveCachedViewContainers();
        }
        toActivity(viewContainerModel) {
            return ActivitybarPart.toActivity(viewContainerModel.viewContainer.id, viewContainerModel.title, viewContainerModel.icon, viewContainerModel.keybindingId);
        }
        static toActivity(id, name, icon, keybindingId) {
            let cssClass = undefined;
            let iconUrl = undefined;
            if (uri_1.URI.isUri(icon)) {
                iconUrl = icon;
                const cssUrl = (0, dom_1.asCSSUrl)(icon);
                const hash = new hash_1.StringSHA1();
                hash.update(cssUrl);
                cssClass = `activity-${id.replace(/\./g, '-')}-${hash.digest()}`;
                const iconClass = `.monaco-workbench .activitybar .monaco-action-bar .action-label.${cssClass}`;
                (0, dom_1.createCSSRule)(iconClass, `
				mask: ${cssUrl} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${cssUrl} no-repeat 50% 50%;
				-webkit-mask-size: 24px;
			`);
            }
            else if (themeService_1.ThemeIcon.isThemeIcon(icon)) {
                cssClass = themeService_1.ThemeIcon.asClassName(icon);
            }
            return { id, name, cssClass, iconUrl, keybindingId };
        }
        showOrHideViewContainer(viewContainer) {
            let contextKey = this.enabledViewContainersContextKeys.get(viewContainer.id);
            if (!contextKey) {
                contextKey = this.contextKeyService.createKey((0, views_1.getEnabledViewContainerContextKey)(viewContainer.id), false);
                this.enabledViewContainersContextKeys.set(viewContainer.id, contextKey);
            }
            if (this.shouldBeHidden(viewContainer)) {
                contextKey.set(false);
                this.hideComposite(viewContainer.id);
            }
            else {
                contextKey.set(true);
                this.addComposite(viewContainer);
            }
        }
        shouldBeHidden(viewContainerOrId, cachedViewContainer) {
            var _a;
            const viewContainer = (0, types_1.isString)(viewContainerOrId) ? this.getViewContainer(viewContainerOrId) : viewContainerOrId;
            const viewContainerId = (0, types_1.isString)(viewContainerOrId) ? viewContainerOrId : viewContainerOrId.id;
            if (viewContainer) {
                if (viewContainer.hideIfEmpty) {
                    if (this.viewDescriptorService.getViewContainerModel(viewContainer).activeViewDescriptors.length > 0) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            // Check cache only if extensions are not yet registered and current window is not native (desktop) remote connection window
            if (!this.hasExtensionsRegistered && !(this.environmentService.remoteAuthority && platform_1.isNative)) {
                cachedViewContainer = cachedViewContainer || this.cachedViewContainers.find(({ id }) => id === viewContainerId);
                // Show builtin ViewContainer if not registered yet
                if (!viewContainer && (cachedViewContainer === null || cachedViewContainer === void 0 ? void 0 : cachedViewContainer.isBuiltin)) {
                    return false;
                }
                if ((_a = cachedViewContainer === null || cachedViewContainer === void 0 ? void 0 : cachedViewContainer.views) === null || _a === void 0 ? void 0 : _a.length) {
                    return cachedViewContainer.views.every(({ when }) => !!when && !this.contextKeyService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(when)));
                }
            }
            return true;
        }
        addComposite(viewContainer) {
            this.compositeBar.addComposite({ id: viewContainer.id, name: viewContainer.title, order: viewContainer.order, requestedIndex: viewContainer.requestedIndex });
        }
        hideComposite(compositeId) {
            this.compositeBar.hideComposite(compositeId);
            const compositeActions = this.compositeActions.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.compositeActions.delete(compositeId);
            }
        }
        removeComposite(compositeId) {
            this.compositeBar.removeComposite(compositeId);
            const compositeActions = this.compositeActions.get(compositeId);
            if (compositeActions) {
                compositeActions.activityAction.dispose();
                compositeActions.pinnedAction.dispose();
                this.compositeActions.delete(compositeId);
            }
        }
        getPinnedViewContainerIds() {
            const pinnedCompositeIds = this.compositeBar.getPinnedComposites().map(v => v.id);
            return this.getViewContainers()
                .filter(v => this.compositeBar.isPinned(v.id))
                .sort((v1, v2) => pinnedCompositeIds.indexOf(v1.id) - pinnedCompositeIds.indexOf(v2.id))
                .map(v => v.id);
        }
        getVisibleViewContainerIds() {
            return this.compositeBar.getVisibleComposites()
                .filter(v => { var _a; return ((_a = this.viewsService.getVisibleViewContainer(this.location)) === null || _a === void 0 ? void 0 : _a.id) === v.id || this.compositeBar.isPinned(v.id); })
                .map(v => v.id);
        }
        focusActivityBar() {
            this.compositeBar.focus();
        }
        updateStyles() {
            super.updateStyles();
            const container = (0, types_1.assertIsDefined)(this.getContainer());
            const background = this.getColor(theme_1.ACTIVITY_BAR_BACKGROUND) || '';
            container.style.backgroundColor = background;
            const borderColor = this.getColor(theme_1.ACTIVITY_BAR_BORDER) || this.getColor(colorRegistry_1.contrastBorder) || '';
            container.classList.toggle('bordered', !!borderColor);
            container.style.borderColor = borderColor ? borderColor : '';
        }
        getActivitybarItemColors(theme) {
            return {
                activeForegroundColor: theme.getColor(theme_1.ACTIVITY_BAR_FOREGROUND),
                inactiveForegroundColor: theme.getColor(theme_1.ACTIVITY_BAR_INACTIVE_FOREGROUND),
                activeBorderColor: theme.getColor(theme_1.ACTIVITY_BAR_ACTIVE_BORDER),
                activeBackground: theme.getColor(theme_1.ACTIVITY_BAR_ACTIVE_BACKGROUND),
                badgeBackground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_BACKGROUND),
                badgeForeground: theme.getColor(theme_1.ACTIVITY_BAR_BADGE_FOREGROUND),
                dragAndDropBorder: theme.getColor(theme_1.ACTIVITY_BAR_DRAG_AND_DROP_BORDER),
                activeBackgroundColor: undefined, inactiveBackgroundColor: undefined, activeBorderBottomColor: undefined,
            };
        }
        layout(width, height) {
            if (!this.layoutService.isVisible("workbench.parts.activitybar" /* ACTIVITYBAR_PART */)) {
                return;
            }
            // Layout contents
            const contentAreaSize = super.layoutContents(width, height).contentSize;
            // Layout composite bar
            let availableHeight = contentAreaSize.height;
            if (this.menuBarContainer) {
                availableHeight -= this.menuBarContainer.clientHeight;
            }
            if (this.globalActivityActionBar) {
                availableHeight -= (this.globalActivityActionBar.viewItems.length * ActivitybarPart.ACTION_HEIGHT); // adjust height for global actions showing
            }
            this.compositeBar.layout(new dom_1.Dimension(width, availableHeight));
        }
        getViewContainer(id) {
            const viewContainer = this.viewDescriptorService.getViewContainerById(id);
            return viewContainer && this.viewDescriptorService.getViewContainerLocation(viewContainer) === this.location ? viewContainer : undefined;
        }
        getViewContainers() {
            return this.viewDescriptorService.getViewContainersByLocation(this.location);
        }
        onDidStorageValueChange(e) {
            if (e.key === ActivitybarPart.PINNED_VIEW_CONTAINERS && e.scope === 0 /* GLOBAL */
                && this.pinnedViewContainersValue !== this.getStoredPinnedViewContainersValue() /* This checks if current window changed the value or not */) {
                this._pinnedViewContainersValue = undefined;
                this._cachedViewContainers = undefined;
                const newCompositeItems = [];
                const compositeItems = this.compositeBar.getCompositeBarItems();
                for (const cachedViewContainer of this.cachedViewContainers) {
                    newCompositeItems.push({
                        id: cachedViewContainer.id,
                        name: cachedViewContainer.name,
                        order: cachedViewContainer.order,
                        pinned: cachedViewContainer.pinned,
                        visible: !!compositeItems.find(({ id }) => id === cachedViewContainer.id)
                    });
                }
                for (let index = 0; index < compositeItems.length; index++) {
                    // Add items currently exists but does not exist in new.
                    if (!newCompositeItems.some(({ id }) => id === compositeItems[index].id)) {
                        newCompositeItems.splice(index, 0, compositeItems[index]);
                    }
                }
                this.compositeBar.setCompositeBarItems(newCompositeItems);
            }
            if (e.key === activitybarActions_1.AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY && e.scope === 0 /* GLOBAL */) {
                this.toggleAccountsActivity();
            }
        }
        saveCachedViewContainers() {
            const state = [];
            const compositeItems = this.compositeBar.getCompositeBarItems();
            for (const compositeItem of compositeItems) {
                const viewContainer = this.getViewContainer(compositeItem.id);
                if (viewContainer) {
                    const viewContainerModel = this.viewDescriptorService.getViewContainerModel(viewContainer);
                    const views = [];
                    for (const { when } of viewContainerModel.allViewDescriptors) {
                        views.push({ when: when ? when.serialize() : undefined });
                    }
                    state.push({
                        id: compositeItem.id,
                        name: viewContainerModel.title,
                        icon: uri_1.URI.isUri(viewContainerModel.icon) && this.environmentService.remoteAuthority && platform_1.isNative ? undefined : viewContainerModel.icon,
                        views,
                        pinned: compositeItem.pinned,
                        order: compositeItem.order,
                        visible: compositeItem.visible,
                        isBuiltin: !viewContainer.extensionId
                    });
                }
                else {
                    state.push({ id: compositeItem.id, pinned: compositeItem.pinned, order: compositeItem.order, visible: false, isBuiltin: false });
                }
            }
            this.storeCachedViewContainersState(state);
        }
        get cachedViewContainers() {
            if (this._cachedViewContainers === undefined) {
                this._cachedViewContainers = this.getPinnedViewContainers();
                for (const placeholderViewContainer of this.getPlaceholderViewContainers()) {
                    const cachedViewContainer = this._cachedViewContainers.filter(cached => cached.id === placeholderViewContainer.id)[0];
                    if (cachedViewContainer) {
                        cachedViewContainer.name = placeholderViewContainer.name;
                        cachedViewContainer.icon = placeholderViewContainer.themeIcon ? placeholderViewContainer.themeIcon :
                            placeholderViewContainer.iconUrl ? uri_1.URI.revive(placeholderViewContainer.iconUrl) : undefined;
                        cachedViewContainer.views = placeholderViewContainer.views;
                        cachedViewContainer.isBuiltin = placeholderViewContainer.isBuiltin;
                    }
                }
            }
            return this._cachedViewContainers;
        }
        storeCachedViewContainersState(cachedViewContainers) {
            this.setPinnedViewContainers(cachedViewContainers.map(({ id, pinned, visible, order }) => ({
                id,
                pinned,
                visible,
                order
            })));
            this.setPlaceholderViewContainers(cachedViewContainers.map(({ id, icon, name, views, isBuiltin }) => ({
                id,
                iconUrl: uri_1.URI.isUri(icon) ? icon : undefined,
                themeIcon: themeService_1.ThemeIcon.isThemeIcon(icon) ? icon : undefined,
                name,
                isBuiltin,
                views
            })));
        }
        getPinnedViewContainers() {
            return JSON.parse(this.pinnedViewContainersValue);
        }
        setPinnedViewContainers(pinnedViewContainers) {
            this.pinnedViewContainersValue = JSON.stringify(pinnedViewContainers);
        }
        get pinnedViewContainersValue() {
            if (!this._pinnedViewContainersValue) {
                this._pinnedViewContainersValue = this.getStoredPinnedViewContainersValue();
            }
            return this._pinnedViewContainersValue;
        }
        set pinnedViewContainersValue(pinnedViewContainersValue) {
            if (this.pinnedViewContainersValue !== pinnedViewContainersValue) {
                this._pinnedViewContainersValue = pinnedViewContainersValue;
                this.setStoredPinnedViewContainersValue(pinnedViewContainersValue);
            }
        }
        getStoredPinnedViewContainersValue() {
            return this.storageService.get(ActivitybarPart.PINNED_VIEW_CONTAINERS, 0 /* GLOBAL */, '[]');
        }
        setStoredPinnedViewContainersValue(value) {
            this.storageService.store(ActivitybarPart.PINNED_VIEW_CONTAINERS, value, 0 /* GLOBAL */, 0 /* USER */);
        }
        getPlaceholderViewContainers() {
            return JSON.parse(this.placeholderViewContainersValue);
        }
        setPlaceholderViewContainers(placeholderViewContainers) {
            this.placeholderViewContainersValue = JSON.stringify(placeholderViewContainers);
        }
        get placeholderViewContainersValue() {
            if (!this._placeholderViewContainersValue) {
                this._placeholderViewContainersValue = this.getStoredPlaceholderViewContainersValue();
            }
            return this._placeholderViewContainersValue;
        }
        set placeholderViewContainersValue(placeholderViewContainesValue) {
            if (this.placeholderViewContainersValue !== placeholderViewContainesValue) {
                this._placeholderViewContainersValue = placeholderViewContainesValue;
                this.setStoredPlaceholderViewContainersValue(placeholderViewContainesValue);
            }
        }
        getStoredPlaceholderViewContainersValue() {
            return this.storageService.get(ActivitybarPart.PLACEHOLDER_VIEW_CONTAINERS, 0 /* GLOBAL */, '[]');
        }
        setStoredPlaceholderViewContainersValue(value) {
            this.storageService.store(ActivitybarPart.PLACEHOLDER_VIEW_CONTAINERS, value, 0 /* GLOBAL */, 1 /* MACHINE */);
        }
        get accountsVisibilityPreference() {
            return this.storageService.getBoolean(activitybarActions_1.AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, 0 /* GLOBAL */, true);
        }
        set accountsVisibilityPreference(value) {
            this.storageService.store(activitybarActions_1.AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, value, 0 /* GLOBAL */, 0 /* USER */);
        }
        toJSON() {
            return {
                type: "workbench.parts.activitybar" /* ACTIVITYBAR_PART */
            };
        }
    };
    ActivitybarPart.PINNED_VIEW_CONTAINERS = 'workbench.activity.pinnedViewlets2';
    ActivitybarPart.PLACEHOLDER_VIEW_CONTAINERS = 'workbench.activity.placeholderViewlets';
    ActivitybarPart.ACTION_HEIGHT = 48;
    ActivitybarPart.ACCOUNTS_ACTION_INDEX = 0;
    ActivitybarPart.GEAR_ICON = (0, iconRegistry_1.registerIcon)('settings-view-bar-icon', codicons_1.Codicon.settingsGear, (0, nls_1.localize)(0, null));
    ActivitybarPart.ACCOUNTS_ICON = (0, iconRegistry_1.registerIcon)('accounts-view-bar-icon', codicons_1.Codicon.account, (0, nls_1.localize)(1, null));
    ActivitybarPart = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, layoutService_1.IWorkbenchLayoutService),
        __param(2, themeService_1.IThemeService),
        __param(3, storage_1.IStorageService),
        __param(4, extensions_1.IExtensionService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, views_1.IViewsService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, environmentService_1.IWorkbenchEnvironmentService)
    ], ActivitybarPart);
    exports.ActivitybarPart = ActivitybarPart;
    class FocusActivityBarAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'workbench.action.focusActivityBar',
                title: { value: (0, nls_1.localize)(13, null), original: 'Focus Activity Bar' },
                category: actions_3.CATEGORIES.View,
                f1: true
            });
        }
        async run(accessor) {
            const activityBarService = accessor.get(activityBarService_1.IActivityBarService);
            const layoutService = accessor.get(layoutService_1.IWorkbenchLayoutService);
            layoutService.setActivityBarHidden(false);
            activityBarService.focusActivityBar();
        }
    }
    (0, extensions_2.registerSingleton)(activityBarService_1.IActivityBarService, ActivitybarPart);
    (0, actions_2.registerAction2)(FocusActivityBarAction);
});
//# sourceMappingURL=activitybarPart.js.map