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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/nls!vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/base/common/keybindingLabels", "vs/platform/notification/common/notification", "vs/platform/theme/common/themeService", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/platform", "vs/css!./menuEntryActionViewItem"], function (require, exports, dom_1, event_1, actions_1, lifecycle_1, nls_1, actions_2, contextView_1, keybinding_1, keybindingLabels_1, notification_1, themeService_1, actionViewItems_1, dropdownActionViewItem_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createActionViewItem = exports.SubmenuEntryActionViewItem = exports.MenuEntryActionViewItem = exports.createAndFillInActionBarActions = exports.createAndFillInContextMenuActions = void 0;
    function createAndFillInContextMenuActions(menu, options, target, primaryGroup) {
        const groups = menu.getActions(options);
        const modifierKeyEmitter = dom_1.ModifierKeyEmitter.getInstance();
        const useAlternativeActions = modifierKeyEmitter.keyStatus.altKey || ((platform_1.isWindows || platform_1.isLinux) && modifierKeyEmitter.keyStatus.shiftKey);
        fillInActions(groups, target, useAlternativeActions, primaryGroup);
        return asDisposable(groups);
    }
    exports.createAndFillInContextMenuActions = createAndFillInContextMenuActions;
    function createAndFillInActionBarActions(menu, options, target, primaryGroup, primaryMaxCount, shouldInlineSubmenu) {
        const groups = menu.getActions(options);
        // Action bars handle alternative actions on their own so the alternative actions should be ignored
        fillInActions(groups, target, false, primaryGroup, primaryMaxCount, shouldInlineSubmenu);
        return asDisposable(groups);
    }
    exports.createAndFillInActionBarActions = createAndFillInActionBarActions;
    function asDisposable(groups) {
        const disposables = new lifecycle_1.DisposableStore();
        for (const [, actions] of groups) {
            for (const action of actions) {
                disposables.add(action);
            }
        }
        return disposables;
    }
    function fillInActions(groups, target, useAlternativeActions, primaryGroup = 'navigation', primaryMaxCount = Number.MAX_SAFE_INTEGER, shouldInlineSubmenu = () => false) {
        let primaryBucket;
        let secondaryBucket;
        if (Array.isArray(target)) {
            primaryBucket = target;
            secondaryBucket = target;
        }
        else {
            primaryBucket = target.primary;
            secondaryBucket = target.secondary;
        }
        const submenuInfo = new Set();
        for (const [group, actions] of groups) {
            let target;
            if (group === primaryGroup) {
                target = primaryBucket;
            }
            else {
                target = secondaryBucket;
                if (target.length > 0) {
                    target.push(new actions_1.Separator());
                }
            }
            for (let action of actions) {
                if (useAlternativeActions) {
                    action = action instanceof actions_2.MenuItemAction && action.alt ? action.alt : action;
                }
                const newLen = target.push(action);
                // keep submenu info for later inlining
                if (action instanceof actions_1.SubmenuAction) {
                    submenuInfo.add({ group, action, index: newLen - 1 });
                }
            }
        }
        // ask the outside if submenu should be inlined or not. only ask when
        // there would be enough space
        for (const { group, action, index } of submenuInfo) {
            const target = group === primaryGroup ? primaryBucket : secondaryBucket;
            // inlining submenus with length 0 or 1 is easy,
            // larger submenus need to be checked with the overall limit
            const submenuActions = action.actions;
            if ((submenuActions.length <= 1 || target.length + submenuActions.length - 2 <= primaryMaxCount) && shouldInlineSubmenu(action, group, target.length)) {
                target.splice(index, 1, ...submenuActions);
            }
        }
        // overflow items from the primary group into the secondary bucket
        if (primaryBucket !== secondaryBucket && primaryBucket.length > primaryMaxCount) {
            const overflow = primaryBucket.splice(primaryMaxCount, primaryBucket.length - primaryMaxCount);
            secondaryBucket.unshift(...overflow, new actions_1.Separator());
        }
    }
    let MenuEntryActionViewItem = class MenuEntryActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(_action, _keybindingService, _notificationService) {
            super(undefined, _action, { icon: !!(_action.class || _action.item.icon), label: !_action.class && !_action.item.icon });
            this._keybindingService = _keybindingService;
            this._notificationService = _notificationService;
            this._wantsAltCommand = false;
            this._itemClassDispose = this._register(new lifecycle_1.MutableDisposable());
            this._altKey = dom_1.ModifierKeyEmitter.getInstance();
        }
        get _menuItemAction() {
            return this._action;
        }
        get _commandAction() {
            return this._wantsAltCommand && this._menuItemAction.alt || this._menuItemAction;
        }
        onClick(event) {
            event.preventDefault();
            event.stopPropagation();
            this.actionRunner
                .run(this._commandAction, this._context)
                .catch(err => this._notificationService.error(err));
        }
        render(container) {
            super.render(container);
            container.classList.add('menu-entry');
            this._updateItemClass(this._menuItemAction.item);
            let mouseOver = false;
            let alternativeKeyDown = this._altKey.keyStatus.altKey || ((platform_1.isWindows || platform_1.isLinux) && this._altKey.keyStatus.shiftKey);
            const updateAltState = () => {
                const wantsAltCommand = mouseOver && alternativeKeyDown;
                if (wantsAltCommand !== this._wantsAltCommand) {
                    this._wantsAltCommand = wantsAltCommand;
                    this.updateLabel();
                    this.updateTooltip();
                    this.updateClass();
                }
            };
            if (this._menuItemAction.alt) {
                this._register(this._altKey.event(value => {
                    alternativeKeyDown = value.altKey || ((platform_1.isWindows || platform_1.isLinux) && value.shiftKey);
                    updateAltState();
                }));
            }
            this._register((0, event_1.domEvent)(container, 'mouseleave')(_ => {
                mouseOver = false;
                updateAltState();
            }));
            this._register((0, event_1.domEvent)(container, 'mouseenter')(e => {
                mouseOver = true;
                updateAltState();
            }));
        }
        updateLabel() {
            if (this.options.label && this.label) {
                this.label.textContent = this._commandAction.label;
            }
        }
        updateTooltip() {
            if (this.label) {
                const keybinding = this._keybindingService.lookupKeybinding(this._commandAction.id);
                const keybindingLabel = keybinding && keybinding.getLabel();
                const tooltip = this._commandAction.tooltip || this._commandAction.label;
                let title = keybindingLabel
                    ? (0, nls_1.localize)(0, null, tooltip, keybindingLabel)
                    : tooltip;
                if (!this._wantsAltCommand && this._menuItemAction.alt) {
                    const altTooltip = this._menuItemAction.alt.tooltip || this._menuItemAction.alt.label;
                    const altKeybinding = this._keybindingService.lookupKeybinding(this._menuItemAction.alt.id);
                    const altKeybindingLabel = altKeybinding && altKeybinding.getLabel();
                    const altTitleSection = altKeybindingLabel
                        ? (0, nls_1.localize)(1, null, altTooltip, altKeybindingLabel)
                        : altTooltip;
                    title += `\n[${keybindingLabels_1.UILabelProvider.modifierLabels[platform_1.OS].altKey}] ${altTitleSection}`;
                }
                this.label.title = title;
            }
        }
        updateClass() {
            if (this.options.icon) {
                if (this._commandAction !== this._menuItemAction) {
                    if (this._menuItemAction.alt) {
                        this._updateItemClass(this._menuItemAction.alt.item);
                    }
                }
                else if (this._menuItemAction.alt) {
                    this._updateItemClass(this._menuItemAction.item);
                }
            }
        }
        _updateItemClass(item) {
            var _a;
            this._itemClassDispose.value = undefined;
            const { element, label } = this;
            if (!element || !label) {
                return;
            }
            const icon = this._commandAction.checked && ((_a = item.toggled) === null || _a === void 0 ? void 0 : _a.icon) ? item.toggled.icon : item.icon;
            if (!icon) {
                return;
            }
            if (themeService_1.ThemeIcon.isThemeIcon(icon)) {
                // theme icons
                const iconClasses = themeService_1.ThemeIcon.asClassNameArray(icon);
                label.classList.add(...iconClasses);
                this._itemClassDispose.value = (0, lifecycle_1.toDisposable)(() => {
                    label.classList.remove(...iconClasses);
                });
            }
            else {
                // icon path/url
                if (icon.light) {
                    label.style.setProperty('--menu-entry-icon-light', (0, dom_1.asCSSUrl)(icon.light));
                }
                if (icon.dark) {
                    label.style.setProperty('--menu-entry-icon-dark', (0, dom_1.asCSSUrl)(icon.dark));
                }
                label.classList.add('icon');
                this._itemClassDispose.value = (0, lifecycle_1.toDisposable)(() => {
                    label.classList.remove('icon');
                    label.style.removeProperty('--menu-entry-icon-light');
                    label.style.removeProperty('--menu-entry-icon-dark');
                });
            }
        }
    };
    MenuEntryActionViewItem = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, notification_1.INotificationService)
    ], MenuEntryActionViewItem);
    exports.MenuEntryActionViewItem = MenuEntryActionViewItem;
    let SubmenuEntryActionViewItem = class SubmenuEntryActionViewItem extends dropdownActionViewItem_1.DropdownMenuActionViewItem {
        constructor(action, contextMenuService) {
            super(action, { getActions: () => action.actions }, contextMenuService, {
                menuAsChild: true,
                classNames: themeService_1.ThemeIcon.isThemeIcon(action.item.icon) ? themeService_1.ThemeIcon.asClassName(action.item.icon) : undefined,
            });
        }
        render(container) {
            super.render(container);
            if (this.element) {
                container.classList.add('menu-entry');
                const { icon } = this._action.item;
                if (icon && !themeService_1.ThemeIcon.isThemeIcon(icon)) {
                    this.element.classList.add('icon');
                    if (icon.light) {
                        this.element.style.setProperty('--menu-entry-icon-light', (0, dom_1.asCSSUrl)(icon.light));
                    }
                    if (icon.dark) {
                        this.element.style.setProperty('--menu-entry-icon-dark', (0, dom_1.asCSSUrl)(icon.dark));
                    }
                }
            }
        }
    };
    SubmenuEntryActionViewItem = __decorate([
        __param(1, contextView_1.IContextMenuService)
    ], SubmenuEntryActionViewItem);
    exports.SubmenuEntryActionViewItem = SubmenuEntryActionViewItem;
    /**
     * Creates action view items for menu actions or submenu actions.
     */
    function createActionViewItem(instaService, action) {
        if (action instanceof actions_2.MenuItemAction) {
            return instaService.createInstance(MenuEntryActionViewItem, action);
        }
        else if (action instanceof actions_2.SubmenuItemAction) {
            return instaService.createInstance(SubmenuEntryActionViewItem, action);
        }
        else {
            return undefined;
        }
    }
    exports.createActionViewItem = createActionViewItem;
});
//# sourceMappingURL=menuEntryActionViewItem.js.map