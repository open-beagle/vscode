/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions"], function (require, exports, iconLabels_1, DOM, actionViewItems_1, actions_1, lifecycle_1, menuEntryActionViewItem_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodiconActionViewItem = exports.createAndFillInActionBarActionsWithVerticalSeparators = exports.VerticalSeparatorViewItem = exports.VerticalSeparator = void 0;
    class VerticalSeparator extends actions_1.Action {
        constructor(label) {
            super(VerticalSeparator.ID, label, label ? 'verticalSeparator text' : 'verticalSeparator');
            this.checked = false;
            this.enabled = false;
        }
    }
    exports.VerticalSeparator = VerticalSeparator;
    VerticalSeparator.ID = 'vs.actions.verticalSeparator';
    class VerticalSeparatorViewItem extends actionViewItems_1.BaseActionViewItem {
        render(container) {
            container.classList.add('verticalSeparator');
            // const iconContainer = DOM.append(container, $('.verticalSeparator'));
            // DOM.addClasses(iconContainer, 'codicon', 'codicon-chrome-minimize');
        }
    }
    exports.VerticalSeparatorViewItem = VerticalSeparatorViewItem;
    function createAndFillInActionBarActionsWithVerticalSeparators(menu, options, target, alwaysFillSecondary, isPrimaryGroup) {
        const groups = menu.getActions(options);
        // Action bars handle alternative actions on their own so the alternative actions should be ignored
        fillInActions(groups, target, false, alwaysFillSecondary, isPrimaryGroup);
        return asDisposable(groups);
    }
    exports.createAndFillInActionBarActionsWithVerticalSeparators = createAndFillInActionBarActionsWithVerticalSeparators;
    function fillInActions(groups, target, useAlternativeActions, alwaysFillSecondary = false, isPrimaryGroup = group => group === 'navigation') {
        for (const tuple of groups) {
            let [group, actions] = tuple;
            if (useAlternativeActions) {
                actions = actions.map(a => (a instanceof actions_2.MenuItemAction) && !!a.alt ? a.alt : a);
            }
            const isPrimary = isPrimaryGroup(group);
            if (isPrimary) {
                const to = Array.isArray(target) ? target : target.primary;
                if (to.length > 0) {
                    to.push(new VerticalSeparator());
                }
                to.push(...actions);
            }
            if (!isPrimary || alwaysFillSecondary) {
                const to = Array.isArray(target) ? target : target.secondary;
                if (to.length > 0) {
                    to.push(new actions_1.Separator());
                }
                to.push(...actions);
            }
        }
    }
    function asDisposable(groups) {
        const disposables = new lifecycle_1.DisposableStore();
        for (const [, actions] of groups) {
            for (const action of actions) {
                disposables.add(action);
            }
        }
        return disposables;
    }
    class CodiconActionViewItem extends menuEntryActionViewItem_1.MenuEntryActionViewItem {
        constructor(_action, keybindingService, notificationService) {
            super(_action, keybindingService, notificationService);
        }
        updateLabel() {
            var _a;
            if (this.options.label && this.label) {
                DOM.reset(this.label, ...(0, iconLabels_1.renderLabelWithIcons)((_a = this._commandAction.label) !== null && _a !== void 0 ? _a : ''));
            }
        }
    }
    exports.CodiconActionViewItem = CodiconActionViewItem;
});
//# sourceMappingURL=cellActionView.js.map