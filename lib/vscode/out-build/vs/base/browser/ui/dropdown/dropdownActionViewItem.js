/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/base/browser/dom", "vs/base/common/event", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdown", "vs/base/common/codicons", "vs/base/browser/keyboardEvent", "vs/css!./dropdown"], function (require, exports, actions_1, dom_1, event_1, actionViewItems_1, dropdown_1, codicons_1, keyboardEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionWithDropdownActionViewItem = exports.DropdownMenuActionViewItem = void 0;
    class DropdownMenuActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(action, menuActionsOrProvider, contextMenuProvider, options = Object.create(null)) {
            super(null, action, options);
            this.actionItem = null;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.menuActionsOrProvider = menuActionsOrProvider;
            this.contextMenuProvider = contextMenuProvider;
            this.options = options;
            if (this.options.actionRunner) {
                this.actionRunner = this.options.actionRunner;
            }
        }
        render(container) {
            this.actionItem = container;
            const labelRenderer = (el) => {
                this.element = (0, dom_1.append)(el, (0, dom_1.$)('a.action-label'));
                let classNames = [];
                if (typeof this.options.classNames === 'string') {
                    classNames = this.options.classNames.split(/\s+/g).filter(s => !!s);
                }
                else if (this.options.classNames) {
                    classNames = this.options.classNames;
                }
                // todo@aeschli: remove codicon, should come through `this.options.classNames`
                if (!classNames.find(c => c === 'icon')) {
                    classNames.push('codicon');
                }
                this.element.classList.add(...classNames);
                this.element.setAttribute('role', 'button');
                this.element.setAttribute('aria-haspopup', 'true');
                this.element.setAttribute('aria-expanded', 'false');
                this.element.title = this._action.label || '';
                return null;
            };
            const isActionsArray = Array.isArray(this.menuActionsOrProvider);
            const options = {
                contextMenuProvider: this.contextMenuProvider,
                labelRenderer: labelRenderer,
                menuAsChild: this.options.menuAsChild,
                actions: isActionsArray ? this.menuActionsOrProvider : undefined,
                actionProvider: isActionsArray ? undefined : this.menuActionsOrProvider
            };
            this.dropdownMenu = this._register(new dropdown_1.DropdownMenu(container, options));
            this._register(this.dropdownMenu.onDidChangeVisibility(visible => {
                var _a;
                (_a = this.element) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-expanded', `${visible}`);
                this._onDidChangeVisibility.fire(visible);
            }));
            this.dropdownMenu.menuOptions = {
                actionViewItemProvider: this.options.actionViewItemProvider,
                actionRunner: this.actionRunner,
                getKeyBinding: this.options.keybindingProvider,
                context: this._context
            };
            if (this.options.anchorAlignmentProvider) {
                const that = this;
                this.dropdownMenu.menuOptions = Object.assign(Object.assign({}, this.dropdownMenu.menuOptions), { get anchorAlignment() {
                        return that.options.anchorAlignmentProvider();
                    } });
            }
            this.updateEnabled();
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            if (this.dropdownMenu) {
                if (this.dropdownMenu.menuOptions) {
                    this.dropdownMenu.menuOptions.context = newContext;
                }
                else {
                    this.dropdownMenu.menuOptions = { context: newContext };
                }
            }
        }
        show() {
            if (this.dropdownMenu) {
                this.dropdownMenu.show();
            }
        }
        updateEnabled() {
            var _a, _b;
            const disabled = !this.getAction().enabled;
            (_a = this.actionItem) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', disabled);
            (_b = this.element) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', disabled);
        }
    }
    exports.DropdownMenuActionViewItem = DropdownMenuActionViewItem;
    class ActionWithDropdownActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(context, action, options, contextMenuProvider) {
            super(context, action, options);
            this.contextMenuProvider = contextMenuProvider;
        }
        render(container) {
            super.render(container);
            if (this.element) {
                this.element.classList.add('action-dropdown-item');
                const menuActionsProvider = {
                    getActions: () => {
                        const actionsProvider = this.options.menuActionsOrProvider;
                        return [this._action, ...(Array.isArray(actionsProvider)
                                ? actionsProvider
                                : actionsProvider.getActions()) // TODO: microsoft/TypeScript#42768
                        ];
                    }
                };
                this.dropdownMenuActionViewItem = new DropdownMenuActionViewItem(this._register(new actions_1.Action('dropdownAction', undefined)), menuActionsProvider, this.contextMenuProvider, { classNames: ['dropdown', ...codicons_1.Codicon.dropDownButton.classNamesArray, ...this.options.menuActionClassNames || []] });
                this.dropdownMenuActionViewItem.render(this.element);
                this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.KEY_DOWN, e => {
                    var _a, _b, _c;
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    let handled = false;
                    if (((_a = this.dropdownMenuActionViewItem) === null || _a === void 0 ? void 0 : _a.isFocused()) && event.equals(15 /* LeftArrow */)) {
                        handled = true;
                        (_b = this.dropdownMenuActionViewItem) === null || _b === void 0 ? void 0 : _b.blur();
                        this.focus();
                    }
                    else if (this.isFocused() && event.equals(17 /* RightArrow */)) {
                        handled = true;
                        this.blur();
                        (_c = this.dropdownMenuActionViewItem) === null || _c === void 0 ? void 0 : _c.focus();
                    }
                    if (handled) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }));
            }
        }
        blur() {
            var _a;
            super.blur();
            (_a = this.dropdownMenuActionViewItem) === null || _a === void 0 ? void 0 : _a.blur();
        }
        setFocusable(focusable) {
            var _a;
            super.setFocusable(focusable);
            (_a = this.dropdownMenuActionViewItem) === null || _a === void 0 ? void 0 : _a.setFocusable(focusable);
        }
    }
    exports.ActionWithDropdownActionViewItem = ActionWithDropdownActionViewItem;
});
//# sourceMappingURL=dropdownActionViewItem.js.map