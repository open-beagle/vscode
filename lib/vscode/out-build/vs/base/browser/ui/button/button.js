/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/keyboardEvent", "vs/base/common/color", "vs/base/common/objects", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/codicons", "vs/css!./button"], function (require, exports, keyboardEvent_1, color_1, objects_1, event_1, lifecycle_1, touch_1, iconLabels_1, dom_1, actions_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ButtonBar = exports.ButtonWithDescription = exports.ButtonWithDropdown = exports.Button = void 0;
    const defaultOptions = {
        buttonBackground: color_1.Color.fromHex('#0E639C'),
        buttonHoverBackground: color_1.Color.fromHex('#006BB3'),
        buttonForeground: color_1.Color.white
    };
    class Button extends lifecycle_1.Disposable {
        constructor(container, options) {
            super();
            this._onDidClick = this._register(new event_1.Emitter());
            this.options = options || Object.create(null);
            (0, objects_1.mixin)(this.options, defaultOptions, false);
            this.buttonForeground = this.options.buttonForeground;
            this.buttonBackground = this.options.buttonBackground;
            this.buttonHoverBackground = this.options.buttonHoverBackground;
            this.buttonSecondaryForeground = this.options.buttonSecondaryForeground;
            this.buttonSecondaryBackground = this.options.buttonSecondaryBackground;
            this.buttonSecondaryHoverBackground = this.options.buttonSecondaryHoverBackground;
            this.buttonBorder = this.options.buttonBorder;
            this._element = document.createElement('a');
            this._element.classList.add('monaco-button');
            this._element.tabIndex = 0;
            this._element.setAttribute('role', 'button');
            container.appendChild(this._element);
            this._register(touch_1.Gesture.addTarget(this._element));
            [dom_1.EventType.CLICK, touch_1.EventType.Tap].forEach(eventType => {
                this._register((0, dom_1.addDisposableListener)(this._element, eventType, e => {
                    if (!this.enabled) {
                        dom_1.EventHelper.stop(e);
                        return;
                    }
                    this._onDidClick.fire(e);
                }));
            });
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = false;
                if (this.enabled && (event.equals(3 /* Enter */) || event.equals(10 /* Space */))) {
                    this._onDidClick.fire(e);
                    eventHandled = true;
                }
                else if (event.equals(9 /* Escape */)) {
                    this._element.blur();
                    eventHandled = true;
                }
                if (eventHandled) {
                    dom_1.EventHelper.stop(event, true);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OVER, e => {
                if (!this._element.classList.contains('disabled')) {
                    this.setHoverBackground();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OUT, e => {
                this.applyStyles(); // restore standard styles
            }));
            // Also set hover background when button is focused for feedback
            this.focusTracker = this._register((0, dom_1.trackFocus)(this._element));
            this._register(this.focusTracker.onDidFocus(() => this.setHoverBackground()));
            this._register(this.focusTracker.onDidBlur(() => this.applyStyles())); // restore standard styles
            this.applyStyles();
        }
        get onDidClick() { return this._onDidClick.event; }
        setHoverBackground() {
            let hoverBackground;
            if (this.options.secondary) {
                hoverBackground = this.buttonSecondaryHoverBackground ? this.buttonSecondaryHoverBackground.toString() : null;
            }
            else {
                hoverBackground = this.buttonHoverBackground ? this.buttonHoverBackground.toString() : null;
            }
            if (hoverBackground) {
                this._element.style.backgroundColor = hoverBackground;
            }
        }
        style(styles) {
            this.buttonForeground = styles.buttonForeground;
            this.buttonBackground = styles.buttonBackground;
            this.buttonHoverBackground = styles.buttonHoverBackground;
            this.buttonSecondaryForeground = styles.buttonSecondaryForeground;
            this.buttonSecondaryBackground = styles.buttonSecondaryBackground;
            this.buttonSecondaryHoverBackground = styles.buttonSecondaryHoverBackground;
            this.buttonBorder = styles.buttonBorder;
            this.applyStyles();
        }
        applyStyles() {
            if (this._element) {
                let background, foreground;
                if (this.options.secondary) {
                    foreground = this.buttonSecondaryForeground ? this.buttonSecondaryForeground.toString() : '';
                    background = this.buttonSecondaryBackground ? this.buttonSecondaryBackground.toString() : '';
                }
                else {
                    foreground = this.buttonForeground ? this.buttonForeground.toString() : '';
                    background = this.buttonBackground ? this.buttonBackground.toString() : '';
                }
                const border = this.buttonBorder ? this.buttonBorder.toString() : '';
                this._element.style.color = foreground;
                this._element.style.backgroundColor = background;
                this._element.style.borderWidth = border ? '1px' : '';
                this._element.style.borderStyle = border ? 'solid' : '';
                this._element.style.borderColor = border;
            }
        }
        get element() {
            return this._element;
        }
        set label(value) {
            this._element.classList.add('monaco-text-button');
            if (this.options.supportIcons) {
                (0, dom_1.reset)(this._element, ...(0, iconLabels_1.renderLabelWithIcons)(value));
            }
            else {
                this._element.textContent = value;
            }
            if (typeof this.options.title === 'string') {
                this._element.title = this.options.title;
            }
            else if (this.options.title) {
                this._element.title = value;
            }
        }
        set icon(icon) {
            this._element.classList.add(...codicons_1.CSSIcon.asClassNameArray(icon));
        }
        set enabled(value) {
            if (value) {
                this._element.classList.remove('disabled');
                this._element.setAttribute('aria-disabled', String(false));
                this._element.tabIndex = 0;
            }
            else {
                this._element.classList.add('disabled');
                this._element.setAttribute('aria-disabled', String(true));
            }
        }
        get enabled() {
            return !this._element.classList.contains('disabled');
        }
        focus() {
            this._element.focus();
        }
        hasFocus() {
            return this._element === document.activeElement;
        }
    }
    exports.Button = Button;
    class ButtonWithDropdown extends lifecycle_1.Disposable {
        constructor(container, options) {
            super();
            this._onDidClick = this._register(new event_1.Emitter());
            this.onDidClick = this._onDidClick.event;
            this.element = document.createElement('div');
            this.element.classList.add('monaco-button-dropdown');
            container.appendChild(this.element);
            this.button = this._register(new Button(this.element, options));
            this._register(this.button.onDidClick(e => this._onDidClick.fire(e)));
            this.action = this._register(new actions_1.Action('primaryAction', this.button.label, undefined, true, async () => this._onDidClick.fire(undefined)));
            this.dropdownButton = this._register(new Button(this.element, Object.assign(Object.assign({}, options), { title: false, supportIcons: true })));
            this.dropdownButton.element.classList.add('monaco-dropdown-button');
            this.dropdownButton.icon = codicons_1.Codicon.dropDownButton;
            this._register(this.dropdownButton.onDidClick(e => {
                options.contextMenuProvider.showContextMenu({
                    getAnchor: () => this.dropdownButton.element,
                    getActions: () => [this.action, ...options.actions],
                    actionRunner: options.actionRunner,
                    onHide: () => this.dropdownButton.element.setAttribute('aria-expanded', 'false')
                });
                this.dropdownButton.element.setAttribute('aria-expanded', 'true');
            }));
        }
        set label(value) {
            this.button.label = value;
            this.action.label = value;
        }
        set icon(icon) {
            this.button.icon = icon;
        }
        set enabled(enabled) {
            this.button.enabled = enabled;
            this.dropdownButton.enabled = enabled;
        }
        get enabled() {
            return this.button.enabled;
        }
        style(styles) {
            this.button.style(styles);
            this.dropdownButton.style(styles);
        }
        focus() {
            this.button.focus();
        }
        hasFocus() {
            return this.button.hasFocus() || this.dropdownButton.hasFocus();
        }
    }
    exports.ButtonWithDropdown = ButtonWithDropdown;
    class ButtonWithDescription extends lifecycle_1.Disposable {
        constructor(container, options) {
            super();
            this._onDidClick = this._register(new event_1.Emitter());
            this.options = options || Object.create(null);
            (0, objects_1.mixin)(this.options, defaultOptions, false);
            this.buttonForeground = this.options.buttonForeground;
            this.buttonBackground = this.options.buttonBackground;
            this.buttonHoverBackground = this.options.buttonHoverBackground;
            this.buttonSecondaryForeground = this.options.buttonSecondaryForeground;
            this.buttonSecondaryBackground = this.options.buttonSecondaryBackground;
            this.buttonSecondaryHoverBackground = this.options.buttonSecondaryHoverBackground;
            this.buttonBorder = this.options.buttonBorder;
            this._element = document.createElement('a');
            this._element.classList.add('monaco-button');
            this._element.classList.add('monaco-description-button');
            this._element.tabIndex = 0;
            this._element.setAttribute('role', 'button');
            this._labelElement = document.createElement('div');
            this._labelElement.classList.add('monaco-button-label');
            this._labelElement.tabIndex = -1;
            this._element.appendChild(this._labelElement);
            this._descriptionElement = document.createElement('div');
            this._descriptionElement.classList.add('monaco-button-description');
            this._descriptionElement.tabIndex = -1;
            this._element.appendChild(this._descriptionElement);
            container.appendChild(this._element);
            this._register(touch_1.Gesture.addTarget(this._element));
            [dom_1.EventType.CLICK, touch_1.EventType.Tap].forEach(eventType => {
                this._register((0, dom_1.addDisposableListener)(this._element, eventType, e => {
                    if (!this.enabled) {
                        dom_1.EventHelper.stop(e);
                        return;
                    }
                    this._onDidClick.fire(e);
                }));
            });
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = false;
                if (this.enabled && (event.equals(3 /* Enter */) || event.equals(10 /* Space */))) {
                    this._onDidClick.fire(e);
                    eventHandled = true;
                }
                else if (event.equals(9 /* Escape */)) {
                    this._element.blur();
                    eventHandled = true;
                }
                if (eventHandled) {
                    dom_1.EventHelper.stop(event, true);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OVER, e => {
                if (!this._element.classList.contains('disabled')) {
                    this.setHoverBackground();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this._element, dom_1.EventType.MOUSE_OUT, e => {
                this.applyStyles(); // restore standard styles
            }));
            // Also set hover background when button is focused for feedback
            this.focusTracker = this._register((0, dom_1.trackFocus)(this._element));
            this._register(this.focusTracker.onDidFocus(() => this.setHoverBackground()));
            this._register(this.focusTracker.onDidBlur(() => this.applyStyles())); // restore standard styles
            this.applyStyles();
        }
        get onDidClick() { return this._onDidClick.event; }
        setHoverBackground() {
            let hoverBackground;
            if (this.options.secondary) {
                hoverBackground = this.buttonSecondaryHoverBackground ? this.buttonSecondaryHoverBackground.toString() : null;
            }
            else {
                hoverBackground = this.buttonHoverBackground ? this.buttonHoverBackground.toString() : null;
            }
            if (hoverBackground) {
                this._element.style.backgroundColor = hoverBackground;
            }
        }
        style(styles) {
            this.buttonForeground = styles.buttonForeground;
            this.buttonBackground = styles.buttonBackground;
            this.buttonHoverBackground = styles.buttonHoverBackground;
            this.buttonSecondaryForeground = styles.buttonSecondaryForeground;
            this.buttonSecondaryBackground = styles.buttonSecondaryBackground;
            this.buttonSecondaryHoverBackground = styles.buttonSecondaryHoverBackground;
            this.buttonBorder = styles.buttonBorder;
            this.applyStyles();
        }
        applyStyles() {
            if (this._element) {
                let background, foreground;
                if (this.options.secondary) {
                    foreground = this.buttonSecondaryForeground ? this.buttonSecondaryForeground.toString() : '';
                    background = this.buttonSecondaryBackground ? this.buttonSecondaryBackground.toString() : '';
                }
                else {
                    foreground = this.buttonForeground ? this.buttonForeground.toString() : '';
                    background = this.buttonBackground ? this.buttonBackground.toString() : '';
                }
                const border = this.buttonBorder ? this.buttonBorder.toString() : '';
                this._element.style.color = foreground;
                this._element.style.backgroundColor = background;
                this._element.style.borderWidth = border ? '1px' : '';
                this._element.style.borderStyle = border ? 'solid' : '';
                this._element.style.borderColor = border;
            }
        }
        get element() {
            return this._element;
        }
        set label(value) {
            this._element.classList.add('monaco-text-button');
            if (this.options.supportIcons) {
                (0, dom_1.reset)(this._labelElement, ...(0, iconLabels_1.renderLabelWithIcons)(value));
            }
            else {
                this._labelElement.textContent = value;
            }
            if (typeof this.options.title === 'string') {
                this._element.title = this.options.title;
            }
            else if (this.options.title) {
                this._element.title = value;
            }
        }
        set description(value) {
            if (this.options.supportIcons) {
                (0, dom_1.reset)(this._descriptionElement, ...(0, iconLabels_1.renderLabelWithIcons)(value));
            }
            else {
                this._descriptionElement.textContent = value;
            }
        }
        set icon(icon) {
            this._element.classList.add(...codicons_1.CSSIcon.asClassNameArray(icon));
        }
        set enabled(value) {
            if (value) {
                this._element.classList.remove('disabled');
                this._element.setAttribute('aria-disabled', String(false));
                this._element.tabIndex = 0;
            }
            else {
                this._element.classList.add('disabled');
                this._element.setAttribute('aria-disabled', String(true));
            }
        }
        get enabled() {
            return !this._element.classList.contains('disabled');
        }
        focus() {
            this._element.focus();
        }
        hasFocus() {
            return this._element === document.activeElement;
        }
    }
    exports.ButtonWithDescription = ButtonWithDescription;
    class ButtonBar extends lifecycle_1.Disposable {
        constructor(container) {
            super();
            this.container = container;
            this._buttons = [];
        }
        get buttons() {
            return this._buttons;
        }
        addButton(options) {
            const button = this._register(new Button(this.container, options));
            this.pushButton(button);
            return button;
        }
        addButtonWithDescription(options) {
            const button = this._register(new ButtonWithDescription(this.container, options));
            this.pushButton(button);
            return button;
        }
        addButtonWithDropdown(options) {
            const button = this._register(new ButtonWithDropdown(this.container, options));
            this.pushButton(button);
            return button;
        }
        pushButton(button) {
            this._buttons.push(button);
            const index = this._buttons.length - 1;
            this._register((0, dom_1.addDisposableListener)(button.element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                // Next / Previous Button
                let buttonIndexToFocus;
                if (event.equals(15 /* LeftArrow */)) {
                    buttonIndexToFocus = index > 0 ? index - 1 : this._buttons.length - 1;
                }
                else if (event.equals(17 /* RightArrow */)) {
                    buttonIndexToFocus = index === this._buttons.length - 1 ? 0 : index + 1;
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled && typeof buttonIndexToFocus === 'number') {
                    this._buttons[buttonIndexToFocus].focus();
                    dom_1.EventHelper.stop(e, true);
                }
            }));
        }
    }
    exports.ButtonBar = ButtonBar;
});
//# sourceMappingURL=button.js.map