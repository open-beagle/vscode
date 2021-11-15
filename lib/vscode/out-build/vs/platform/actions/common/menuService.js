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
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey"], function (require, exports, async_1, event_1, lifecycle_1, actions_1, commands_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuService = void 0;
    let MenuService = class MenuService {
        constructor(_commandService) {
            this._commandService = _commandService;
            //
        }
        /**
         * Create a new menu for the given menu identifier. A menu sends events when it's entries
         * have changed (placement, enablement, checked-state). By default it does send events for
         * sub menu entries. That is more expensive and must be explicitly enabled with the
         * `emitEventsForSubmenuChanges` flag.
         */
        createMenu(id, contextKeyService, emitEventsForSubmenuChanges = false) {
            return new Menu(id, emitEventsForSubmenuChanges, this._commandService, contextKeyService, this);
        }
    };
    MenuService = __decorate([
        __param(0, commands_1.ICommandService)
    ], MenuService);
    exports.MenuService = MenuService;
    let Menu = class Menu {
        constructor(_id, _fireEventsForSubmenuChanges, _commandService, _contextKeyService, _menuService) {
            this._id = _id;
            this._fireEventsForSubmenuChanges = _fireEventsForSubmenuChanges;
            this._commandService = _commandService;
            this._contextKeyService = _contextKeyService;
            this._menuService = _menuService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._menuGroups = [];
            this._contextKeys = new Set();
            this._build();
            // rebuild this menu whenever the menu registry reports an
            // event for this MenuId
            const rebuildMenuSoon = new async_1.RunOnceScheduler(() => this._build(), 50);
            this._dispoables.add(rebuildMenuSoon);
            this._dispoables.add(actions_1.MenuRegistry.onDidChangeMenu(e => {
                if (e.has(_id)) {
                    rebuildMenuSoon.schedule();
                }
            }));
            // when context keys change we need to check if the menu also
            // has changed
            const fireChangeSoon = new async_1.RunOnceScheduler(() => this._onDidChange.fire(this), 50);
            this._dispoables.add(fireChangeSoon);
            this._dispoables.add(_contextKeyService.onDidChangeContext(e => {
                if (e.affectsSome(this._contextKeys)) {
                    fireChangeSoon.schedule();
                }
            }));
        }
        dispose() {
            this._dispoables.dispose();
            this._onDidChange.dispose();
        }
        _build() {
            // reset
            this._menuGroups.length = 0;
            this._contextKeys.clear();
            const menuItems = actions_1.MenuRegistry.getMenuItems(this._id);
            let group;
            menuItems.sort(Menu._compareMenuItems);
            for (let item of menuItems) {
                // group by groupId
                const groupName = item.group || '';
                if (!group || group[0] !== groupName) {
                    group = [groupName, []];
                    this._menuGroups.push(group);
                }
                group[1].push(item);
                // keep keys for eventing
                this._collectContextKeys(item);
            }
            this._onDidChange.fire(this);
        }
        _collectContextKeys(item) {
            Menu._fillInKbExprKeys(item.when, this._contextKeys);
            if ((0, actions_1.isIMenuItem)(item)) {
                // keep precondition keys for event if applicable
                if (item.command.precondition) {
                    Menu._fillInKbExprKeys(item.command.precondition, this._contextKeys);
                }
                // keep toggled keys for event if applicable
                if (item.command.toggled) {
                    const toggledExpression = item.command.toggled.condition || item.command.toggled;
                    Menu._fillInKbExprKeys(toggledExpression, this._contextKeys);
                }
            }
            else if (this._fireEventsForSubmenuChanges) {
                // recursively collect context keys from submenus so that this
                // menu fires events when context key changes affect submenus
                actions_1.MenuRegistry.getMenuItems(item.submenu).forEach(this._collectContextKeys, this);
            }
        }
        getActions(options) {
            const result = [];
            for (let group of this._menuGroups) {
                const [id, items] = group;
                const activeActions = [];
                for (const item of items) {
                    if (this._contextKeyService.contextMatchesRules(item.when)) {
                        const action = (0, actions_1.isIMenuItem)(item)
                            ? new actions_1.MenuItemAction(item.command, item.alt, options, this._contextKeyService, this._commandService)
                            : new actions_1.SubmenuItemAction(item, this._menuService, this._contextKeyService, options);
                        activeActions.push(action);
                    }
                }
                if (activeActions.length > 0) {
                    result.push([id, activeActions]);
                }
            }
            return result;
        }
        static _fillInKbExprKeys(exp, set) {
            if (exp) {
                for (let key of exp.keys()) {
                    set.add(key);
                }
            }
        }
        static _compareMenuItems(a, b) {
            let aGroup = a.group;
            let bGroup = b.group;
            if (aGroup !== bGroup) {
                // Falsy groups come last
                if (!aGroup) {
                    return 1;
                }
                else if (!bGroup) {
                    return -1;
                }
                // 'navigation' group comes first
                if (aGroup === 'navigation') {
                    return -1;
                }
                else if (bGroup === 'navigation') {
                    return 1;
                }
                // lexical sort for groups
                let value = aGroup.localeCompare(bGroup);
                if (value !== 0) {
                    return value;
                }
            }
            // sort on priority - default is 0
            let aPrio = a.order || 0;
            let bPrio = b.order || 0;
            if (aPrio < bPrio) {
                return -1;
            }
            else if (aPrio > bPrio) {
                return 1;
            }
            // sort on titles
            return Menu._compareTitles((0, actions_1.isIMenuItem)(a) ? a.command.title : a.title, (0, actions_1.isIMenuItem)(b) ? b.command.title : b.title);
        }
        static _compareTitles(a, b) {
            const aStr = typeof a === 'string' ? a : a.original;
            const bStr = typeof b === 'string' ? b : b.original;
            return aStr.localeCompare(bStr);
        }
    };
    Menu = __decorate([
        __param(2, commands_1.ICommandService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, actions_1.IMenuService)
    ], Menu);
});
//# sourceMappingURL=menuService.js.map