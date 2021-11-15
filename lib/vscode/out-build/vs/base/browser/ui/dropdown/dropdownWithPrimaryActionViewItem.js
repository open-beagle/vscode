/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/common/lifecycle"], function (require, exports, actionViewItems_1, dropdownActionViewItem_1, DOM, keyboardEvent_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DropdownWithPrimaryActionViewItem = void 0;
    class DropdownWithPrimaryActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(primaryAction, dropdownAction, dropdownMenuActions, _className, _contextMenuProvider, dropdownIcon) {
            super(null, primaryAction);
            this._contextMenuProvider = _contextMenuProvider;
            this._container = null;
            this._primaryAction = new actionViewItems_1.ActionViewItem(undefined, primaryAction, {
                icon: true,
                label: false
            });
            this._dropdown = new dropdownActionViewItem_1.DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
                menuAsChild: true
            });
            this.toDispose = [];
        }
        render(container) {
            this._container = container;
            super.render(this._container);
            this._container.classList.add('monaco-dropdown-with-primary');
            const primaryContainer = DOM.$('.action-container');
            this._primaryAction.render(DOM.append(this._container, primaryContainer));
            const dropdownContainer = DOM.$('.dropdown-action-container');
            this._dropdown.render(DOM.append(this._container, dropdownContainer));
            this.toDispose.push(DOM.addDisposableListener(primaryContainer, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(17 /* RightArrow */)) {
                    this._primaryAction.element.tabIndex = -1;
                    this._dropdown.focus();
                    event.stopPropagation();
                }
            }));
            this.toDispose.push(DOM.addDisposableListener(dropdownContainer, DOM.EventType.KEY_DOWN, (e) => {
                var _a;
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* LeftArrow */)) {
                    this._primaryAction.element.tabIndex = 0;
                    this._dropdown.setFocusable(false);
                    (_a = this._primaryAction.element) === null || _a === void 0 ? void 0 : _a.focus();
                    event.stopPropagation();
                }
            }));
        }
        focus(fromRight) {
            if (fromRight) {
                this._dropdown.focus();
            }
            else {
                this._primaryAction.element.tabIndex = 0;
                this._primaryAction.element.focus();
            }
        }
        blur() {
            this._primaryAction.element.tabIndex = -1;
            this._dropdown.blur();
            this._container.blur();
        }
        setFocusable(focusable) {
            if (focusable) {
                this._primaryAction.element.tabIndex = 0;
            }
            else {
                this._primaryAction.element.tabIndex = -1;
                this._dropdown.setFocusable(false);
            }
        }
        dispose() {
            this.toDispose = (0, lifecycle_1.dispose)(this.toDispose);
        }
        update(dropdownAction, dropdownMenuActions, dropdownIcon) {
            var _a;
            (_a = this._dropdown) === null || _a === void 0 ? void 0 : _a.dispose();
            this._dropdown = new dropdownActionViewItem_1.DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
                menuAsChild: true,
                classNames: ['codicon', dropdownIcon || 'codicon-chevron-down']
            });
            if (this.element) {
                this._dropdown.render(this.element);
            }
        }
    }
    exports.DropdownWithPrimaryActionViewItem = DropdownWithPrimaryActionViewItem;
});
//# sourceMappingURL=dropdownWithPrimaryActionViewItem.js.map