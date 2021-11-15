/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/nls!vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/lifecycle", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/actions", "vs/base/common/types", "vs/base/browser/touch", "vs/base/browser/dnd", "vs/base/browser/browser", "vs/base/browser/dom", "vs/css!./actionbar"], function (require, exports, platform, nls, lifecycle_1, selectBox_1, actions_1, types, touch_1, dnd_1, browser_1, dom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectActionViewItem = exports.ActionViewItem = exports.BaseActionViewItem = void 0;
    class BaseActionViewItem extends lifecycle_1.Disposable {
        constructor(context, action, options = {}) {
            super();
            this.options = options;
            this._context = context || this;
            this._action = action;
            if (action instanceof actions_1.Action) {
                this._register(action.onDidChange(event => {
                    if (!this.element) {
                        // we have not been rendered yet, so there
                        // is no point in updating the UI
                        return;
                    }
                    this.handleActionChangeEvent(event);
                }));
            }
        }
        handleActionChangeEvent(event) {
            if (event.enabled !== undefined) {
                this.updateEnabled();
            }
            if (event.checked !== undefined) {
                this.updateChecked();
            }
            if (event.class !== undefined) {
                this.updateClass();
            }
            if (event.label !== undefined) {
                this.updateLabel();
                this.updateTooltip();
            }
            if (event.tooltip !== undefined) {
                this.updateTooltip();
            }
        }
        get actionRunner() {
            if (!this._actionRunner) {
                this._actionRunner = this._register(new actions_1.ActionRunner());
            }
            return this._actionRunner;
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
        }
        getAction() {
            return this._action;
        }
        isEnabled() {
            return this._action.enabled;
        }
        setActionContext(newContext) {
            this._context = newContext;
        }
        render(container) {
            const element = this.element = container;
            this._register(touch_1.Gesture.addTarget(container));
            const enableDragging = this.options && this.options.draggable;
            if (enableDragging) {
                container.draggable = true;
                if (browser_1.isFirefox) {
                    // Firefox: requires to set a text data transfer to get going
                    this._register((0, dom_1.addDisposableListener)(container, dom_1.EventType.DRAG_START, e => { var _a; return (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData(dnd_1.DataTransfers.TEXT, this._action.label); }));
                }
            }
            this._register((0, dom_1.addDisposableListener)(element, touch_1.EventType.Tap, e => this.onClick(e)));
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.MOUSE_DOWN, e => {
                if (!enableDragging) {
                    dom_1.EventHelper.stop(e, true); // do not run when dragging is on because that would disable it
                }
                if (this._action.enabled && e.button === 0) {
                    element.classList.add('active');
                }
            }));
            if (platform.isMacintosh) {
                // macOS: allow to trigger the button when holding Ctrl+key and pressing the
                // main mouse button. This is for scenarios where e.g. some interaction forces
                // the Ctrl+key to be pressed and hold but the user still wants to interact
                // with the actions (for example quick access in quick navigation mode).
                this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.CONTEXT_MENU, e => {
                    if (e.button === 0 && e.ctrlKey === true) {
                        this.onClick(e);
                    }
                }));
            }
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, e => {
                dom_1.EventHelper.stop(e, true);
                // menus do not use the click event
                if (!(this.options && this.options.isMenu)) {
                    platform.setImmediate(() => this.onClick(e));
                }
            }));
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.DBLCLICK, e => {
                dom_1.EventHelper.stop(e, true);
            }));
            [dom_1.EventType.MOUSE_UP, dom_1.EventType.MOUSE_OUT].forEach(event => {
                this._register((0, dom_1.addDisposableListener)(element, event, e => {
                    dom_1.EventHelper.stop(e);
                    element.classList.remove('active');
                }));
            });
        }
        onClick(event) {
            var _a;
            dom_1.EventHelper.stop(event, true);
            const context = types.isUndefinedOrNull(this._context) ? ((_a = this.options) === null || _a === void 0 ? void 0 : _a.useEventAsContext) ? event : undefined : this._context;
            this.actionRunner.run(this._action, context);
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.element) {
                this.element.tabIndex = 0;
                this.element.focus();
                this.element.classList.add('focused');
            }
        }
        isFocused() {
            var _a;
            return !!((_a = this.element) === null || _a === void 0 ? void 0 : _a.classList.contains('focused'));
        }
        blur() {
            if (this.element) {
                this.element.blur();
                this.element.tabIndex = -1;
                this.element.classList.remove('focused');
            }
        }
        setFocusable(focusable) {
            if (this.element) {
                this.element.tabIndex = focusable ? 0 : -1;
            }
        }
        get trapsArrowNavigation() {
            return false;
        }
        updateEnabled() {
            // implement in subclass
        }
        updateLabel() {
            // implement in subclass
        }
        updateTooltip() {
            // implement in subclass
        }
        updateClass() {
            // implement in subclass
        }
        updateChecked() {
            // implement in subclass
        }
        dispose() {
            if (this.element) {
                this.element.remove();
                this.element = undefined;
            }
            super.dispose();
        }
    }
    exports.BaseActionViewItem = BaseActionViewItem;
    class ActionViewItem extends BaseActionViewItem {
        constructor(context, action, options = {}) {
            super(context, action, options);
            this.options = options;
            this.options.icon = options.icon !== undefined ? options.icon : false;
            this.options.label = options.label !== undefined ? options.label : true;
            this.cssClass = '';
        }
        render(container) {
            super.render(container);
            if (this.element) {
                this.label = (0, dom_1.append)(this.element, (0, dom_1.$)('a.action-label'));
            }
            if (this.label) {
                if (this._action.id === actions_1.Separator.ID) {
                    this.label.setAttribute('role', 'presentation'); // A separator is a presentation item
                }
                else {
                    if (this.options.isMenu) {
                        this.label.setAttribute('role', 'menuitem');
                    }
                    else {
                        this.label.setAttribute('role', 'button');
                    }
                }
            }
            if (this.options.label && this.options.keybinding && this.element) {
                (0, dom_1.append)(this.element, (0, dom_1.$)('span.keybinding')).textContent = this.options.keybinding;
            }
            this.updateClass();
            this.updateLabel();
            this.updateTooltip();
            this.updateEnabled();
            this.updateChecked();
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.label) {
                this.label.tabIndex = 0;
                this.label.focus();
            }
        }
        isFocused() {
            var _a;
            return !!this.label && ((_a = this.label) === null || _a === void 0 ? void 0 : _a.tabIndex) === 0;
        }
        blur() {
            if (this.label) {
                this.label.tabIndex = -1;
            }
        }
        setFocusable(focusable) {
            if (this.label) {
                this.label.tabIndex = focusable ? 0 : -1;
            }
        }
        updateLabel() {
            if (this.options.label && this.label) {
                this.label.textContent = this.getAction().label;
            }
        }
        updateTooltip() {
            let title = null;
            if (this.getAction().tooltip) {
                title = this.getAction().tooltip;
            }
            else if (!this.options.label && this.getAction().label && this.options.icon) {
                title = this.getAction().label;
                if (this.options.keybinding) {
                    title = nls.localize(0, null, title, this.options.keybinding);
                }
            }
            if (title && this.label) {
                this.label.title = title;
            }
        }
        updateClass() {
            if (this.cssClass && this.label) {
                this.label.classList.remove(...this.cssClass.split(' '));
            }
            if (this.options.icon) {
                this.cssClass = this.getAction().class;
                if (this.label) {
                    this.label.classList.add('codicon');
                    if (this.cssClass) {
                        this.label.classList.add(...this.cssClass.split(' '));
                    }
                }
                this.updateEnabled();
            }
            else {
                if (this.label) {
                    this.label.classList.remove('codicon');
                }
            }
        }
        updateEnabled() {
            if (this.getAction().enabled) {
                if (this.label) {
                    this.label.removeAttribute('aria-disabled');
                    this.label.classList.remove('disabled');
                }
                if (this.element) {
                    this.element.classList.remove('disabled');
                }
            }
            else {
                if (this.label) {
                    this.label.setAttribute('aria-disabled', 'true');
                    this.label.classList.add('disabled');
                }
                if (this.element) {
                    this.element.classList.add('disabled');
                }
            }
        }
        updateChecked() {
            if (this.label) {
                if (this.getAction().checked) {
                    this.label.classList.add('checked');
                }
                else {
                    this.label.classList.remove('checked');
                }
            }
        }
    }
    exports.ActionViewItem = ActionViewItem;
    class SelectActionViewItem extends BaseActionViewItem {
        constructor(ctx, action, options, selected, contextViewProvider, selectBoxOptions) {
            super(ctx, action);
            this.selectBox = new selectBox_1.SelectBox(options, selected, contextViewProvider, undefined, selectBoxOptions);
            this.selectBox.setFocusable(false);
            this._register(this.selectBox);
            this.registerListeners();
        }
        setOptions(options, selected) {
            this.selectBox.setOptions(options, selected);
        }
        select(index) {
            this.selectBox.select(index);
        }
        registerListeners() {
            this._register(this.selectBox.onDidSelect(e => {
                this.actionRunner.run(this._action, this.getActionContext(e.selected, e.index));
            }));
        }
        getActionContext(option, index) {
            return option;
        }
        setFocusable(focusable) {
            this.selectBox.setFocusable(focusable);
        }
        focus() {
            if (this.selectBox) {
                this.selectBox.focus();
            }
        }
        blur() {
            if (this.selectBox) {
                this.selectBox.blur();
            }
        }
        render(container) {
            this.selectBox.render(container);
        }
    }
    exports.SelectActionViewItem = SelectActionViewItem;
});
//# sourceMappingURL=actionViewItems.js.map