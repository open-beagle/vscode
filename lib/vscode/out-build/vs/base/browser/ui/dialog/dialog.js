/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/browser/ui/dialog/dialog", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/button/button", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/labels", "vs/base/common/platform", "vs/base/browser/ui/checkbox/checkbox", "vs/base/common/codicons", "vs/base/browser/ui/inputbox/inputBox", "vs/css!./dialog"], function (require, exports, nls, lifecycle_1, dom_1, event_1, keyboardEvent_1, button_1, actionbar_1, actions_1, labels_1, platform_1, checkbox_1, codicons_1, inputBox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Dialog = void 0;
    const dialogErrorIcon = (0, codicons_1.registerCodicon)('dialog-error', codicons_1.Codicon.error);
    const dialogWarningIcon = (0, codicons_1.registerCodicon)('dialog-warning', codicons_1.Codicon.warning);
    const dialogInfoIcon = (0, codicons_1.registerCodicon)('dialog-info', codicons_1.Codicon.info);
    const dialogCloseIcon = (0, codicons_1.registerCodicon)('dialog-close', codicons_1.Codicon.close);
    class Dialog extends lifecycle_1.Disposable {
        constructor(container, message, buttons, options) {
            super();
            this.container = container;
            this.message = message;
            this.options = options;
            this.modalElement = this.container.appendChild((0, dom_1.$)(`.monaco-dialog-modal-block.dimmed`));
            this.shadowElement = this.modalElement.appendChild((0, dom_1.$)('.dialog-shadow'));
            this.element = this.shadowElement.appendChild((0, dom_1.$)('.monaco-dialog-box'));
            this.element.setAttribute('role', 'dialog');
            (0, dom_1.hide)(this.element);
            this.buttons = buttons.length ? buttons : [nls.localize(0, null)]; // If no button is provided, default to OK
            const buttonsRowElement = this.element.appendChild((0, dom_1.$)('.dialog-buttons-row'));
            this.buttonsContainer = buttonsRowElement.appendChild((0, dom_1.$)('.dialog-buttons'));
            const messageRowElement = this.element.appendChild((0, dom_1.$)('.dialog-message-row'));
            this.iconElement = messageRowElement.appendChild((0, dom_1.$)('.dialog-icon'));
            this.messageContainer = messageRowElement.appendChild((0, dom_1.$)('.dialog-message-container'));
            if (this.options.detail || this.options.renderBody) {
                const messageElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-message'));
                const messageTextElement = messageElement.appendChild((0, dom_1.$)('.dialog-message-text'));
                messageTextElement.innerText = this.message;
            }
            this.messageDetailElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-message-detail'));
            if (this.options.detail || !this.options.renderBody) {
                this.messageDetailElement.innerText = this.options.detail ? this.options.detail : message;
            }
            else {
                this.messageDetailElement.style.display = 'none';
            }
            if (this.options.renderBody) {
                const customBody = this.messageContainer.appendChild((0, dom_1.$)('.dialog-message-body'));
                this.options.renderBody(customBody);
            }
            if (this.options.inputs) {
                this.inputs = this.options.inputs.map(input => {
                    var _a;
                    const inputRowElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-message-input'));
                    const inputBox = this._register(new inputBox_1.InputBox(inputRowElement, undefined, {
                        placeholder: input.placeholder,
                        type: (_a = input.type) !== null && _a !== void 0 ? _a : 'text',
                    }));
                    if (input.value) {
                        inputBox.value = input.value;
                    }
                    return inputBox;
                });
            }
            else {
                this.inputs = [];
            }
            if (this.options.checkboxLabel) {
                const checkboxRowElement = this.messageContainer.appendChild((0, dom_1.$)('.dialog-checkbox-row'));
                const checkbox = this.checkbox = this._register(new checkbox_1.SimpleCheckbox(this.options.checkboxLabel, !!this.options.checkboxChecked));
                checkboxRowElement.appendChild(checkbox.domNode);
                const checkboxMessageElement = checkboxRowElement.appendChild((0, dom_1.$)('.dialog-checkbox-message'));
                checkboxMessageElement.innerText = this.options.checkboxLabel;
                this._register((0, dom_1.addDisposableListener)(checkboxMessageElement, dom_1.EventType.CLICK, () => checkbox.checked = !checkbox.checked));
            }
            const toolbarRowElement = this.element.appendChild((0, dom_1.$)('.dialog-toolbar-row'));
            this.toolbarContainer = toolbarRowElement.appendChild((0, dom_1.$)('.dialog-toolbar'));
        }
        getAriaLabel() {
            let typeLabel = nls.localize(1, null);
            switch (this.options.type) {
                case 'error':
                    nls.localize(2, null);
                    break;
                case 'warning':
                    nls.localize(3, null);
                    break;
                case 'pending':
                    nls.localize(4, null);
                    break;
                case 'none':
                case 'info':
                case 'question':
                default:
                    break;
            }
            return `${typeLabel}: ${this.message} ${this.options.detail || ''}`;
        }
        updateMessage(message) {
            this.messageDetailElement.innerText = message;
        }
        async show() {
            this.focusToReturn = document.activeElement;
            return new Promise((resolve) => {
                (0, dom_1.clearNode)(this.buttonsContainer);
                const buttonBar = this.buttonBar = this._register(new button_1.ButtonBar(this.buttonsContainer));
                const buttonMap = this.rearrangeButtons(this.buttons, this.options.cancelId);
                this.buttonsContainer.classList.toggle('centered');
                // Handle button clicks
                buttonMap.forEach((entry, index) => {
                    const primary = buttonMap[index].index === 0;
                    const button = this.options.buttonDetails ? this._register(buttonBar.addButtonWithDescription({ title: true, secondary: !primary })) : this._register(buttonBar.addButton({ title: true, secondary: !primary }));
                    button.label = (0, labels_1.mnemonicButtonLabel)(buttonMap[index].label, true);
                    if (button instanceof button_1.ButtonWithDescription) {
                        button.description = this.options.buttonDetails[buttonMap[index].index];
                    }
                    this._register(button.onDidClick(e => {
                        if (e) {
                            dom_1.EventHelper.stop(e);
                        }
                        resolve({
                            button: buttonMap[index].index,
                            checkboxChecked: this.checkbox ? this.checkbox.checked : undefined,
                            values: this.inputs.length > 0 ? this.inputs.map(input => input.value) : undefined
                        });
                    }));
                });
                // Handle keyboard events gloably: Tab, Arrow-Left/Right
                this._register((0, event_1.domEvent)(window, 'keydown', true)((e) => {
                    var _a, _b;
                    const evt = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (evt.equals(3 /* Enter */)) {
                        // Enter in input field should OK the dialog
                        if (this.inputs.some(input => input.hasFocus())) {
                            dom_1.EventHelper.stop(e);
                            resolve({
                                button: (_b = (_a = buttonMap.find(button => button.index !== this.options.cancelId)) === null || _a === void 0 ? void 0 : _a.index) !== null && _b !== void 0 ? _b : 0,
                                checkboxChecked: this.checkbox ? this.checkbox.checked : undefined,
                                values: this.inputs.length > 0 ? this.inputs.map(input => input.value) : undefined
                            });
                        }
                        return; // leave default handling
                    }
                    if (evt.equals(10 /* Space */)) {
                        return; // leave default handling
                    }
                    let eventHandled = false;
                    // Focus: Next / Previous
                    if (evt.equals(2 /* Tab */) || evt.equals(17 /* RightArrow */) || evt.equals(1024 /* Shift */ | 2 /* Tab */) || evt.equals(15 /* LeftArrow */)) {
                        // Build a list of focusable elements in their visual order
                        const focusableElements = [];
                        let focusedIndex = -1;
                        for (const input of this.inputs) {
                            focusableElements.push(input);
                            if (input.hasFocus()) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                        if (this.checkbox) {
                            focusableElements.push(this.checkbox);
                            if (this.checkbox.hasFocus()) {
                                focusedIndex = focusableElements.length - 1;
                            }
                        }
                        if (this.buttonBar) {
                            for (const button of this.buttonBar.buttons) {
                                focusableElements.push(button);
                                if (button.hasFocus()) {
                                    focusedIndex = focusableElements.length - 1;
                                }
                            }
                        }
                        // Focus next element (with wrapping)
                        if (evt.equals(2 /* Tab */) || evt.equals(17 /* RightArrow */)) {
                            if (focusedIndex === -1) {
                                focusedIndex = 0; // default to focus first element if none have focus
                            }
                            const newFocusedIndex = (focusedIndex + 1) % focusableElements.length;
                            focusableElements[newFocusedIndex].focus();
                        }
                        // Focus previous element (with wrapping)
                        else {
                            if (focusedIndex === -1) {
                                focusedIndex = focusableElements.length; // default to focus last element if none have focus
                            }
                            let newFocusedIndex = focusedIndex - 1;
                            if (newFocusedIndex === -1) {
                                newFocusedIndex = focusableElements.length - 1;
                            }
                            focusableElements[newFocusedIndex].focus();
                        }
                        eventHandled = true;
                    }
                    if (eventHandled) {
                        dom_1.EventHelper.stop(e, true);
                    }
                    else if (this.options.keyEventProcessor) {
                        this.options.keyEventProcessor(evt);
                    }
                }));
                this._register((0, event_1.domEvent)(window, 'keyup', true)((e) => {
                    dom_1.EventHelper.stop(e, true);
                    const evt = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (!this.options.disableCloseAction && evt.equals(9 /* Escape */)) {
                        resolve({
                            button: this.options.cancelId || 0,
                            checkboxChecked: this.checkbox ? this.checkbox.checked : undefined
                        });
                    }
                }));
                // Detect focus out
                this._register((0, event_1.domEvent)(this.element, 'focusout', false)((e) => {
                    if (!!e.relatedTarget && !!this.element) {
                        if (!(0, dom_1.isAncestor)(e.relatedTarget, this.element)) {
                            this.focusToReturn = e.relatedTarget;
                            if (e.target) {
                                e.target.focus();
                                dom_1.EventHelper.stop(e, true);
                            }
                        }
                    }
                }));
                const spinModifierClassName = 'codicon-modifier-spin';
                this.iconElement.classList.remove(...dialogErrorIcon.classNamesArray, ...dialogWarningIcon.classNamesArray, ...dialogInfoIcon.classNamesArray, ...codicons_1.Codicon.loading.classNamesArray, spinModifierClassName);
                if (this.options.icon) {
                    this.iconElement.classList.add(...this.options.icon.classNamesArray);
                }
                else {
                    switch (this.options.type) {
                        case 'error':
                            this.iconElement.classList.add(...dialogErrorIcon.classNamesArray);
                            break;
                        case 'warning':
                            this.iconElement.classList.add(...dialogWarningIcon.classNamesArray);
                            break;
                        case 'pending':
                            this.iconElement.classList.add(...codicons_1.Codicon.loading.classNamesArray, spinModifierClassName);
                            break;
                        case 'none':
                        case 'info':
                        case 'question':
                        default:
                            this.iconElement.classList.add(...dialogInfoIcon.classNamesArray);
                            break;
                    }
                }
                if (!this.options.disableCloseAction) {
                    const actionBar = this._register(new actionbar_1.ActionBar(this.toolbarContainer, {}));
                    const action = this._register(new actions_1.Action('dialog.close', nls.localize(5, null), dialogCloseIcon.classNames, true, async () => {
                        resolve({
                            button: this.options.cancelId || 0,
                            checkboxChecked: this.checkbox ? this.checkbox.checked : undefined
                        });
                    }));
                    actionBar.push(action, { icon: true, label: false, });
                }
                this.applyStyles();
                this.element.setAttribute('aria-label', this.getAriaLabel());
                (0, dom_1.show)(this.element);
                // Focus first element (input or button)
                if (this.inputs.length > 0) {
                    this.inputs[0].focus();
                    this.inputs[0].select();
                }
                else {
                    buttonMap.forEach((value, index) => {
                        if (value.index === 0) {
                            buttonBar.buttons[index].focus();
                        }
                    });
                }
            });
        }
        applyStyles() {
            var _a, _b;
            if (this.styles) {
                const style = this.styles;
                const fgColor = style.dialogForeground;
                const bgColor = style.dialogBackground;
                const shadowColor = style.dialogShadow ? `0 0px 8px ${style.dialogShadow}` : '';
                const border = style.dialogBorder ? `1px solid ${style.dialogBorder}` : '';
                const linkFgColor = style.textLinkForeground;
                this.shadowElement.style.boxShadow = shadowColor;
                this.element.style.color = (_a = fgColor === null || fgColor === void 0 ? void 0 : fgColor.toString()) !== null && _a !== void 0 ? _a : '';
                this.element.style.backgroundColor = (_b = bgColor === null || bgColor === void 0 ? void 0 : bgColor.toString()) !== null && _b !== void 0 ? _b : '';
                this.element.style.border = border;
                if (this.buttonBar) {
                    this.buttonBar.buttons.forEach(button => button.style(style));
                }
                if (this.checkbox) {
                    this.checkbox.style(style);
                }
                if (fgColor && bgColor) {
                    const messageDetailColor = fgColor.transparent(.9);
                    this.messageDetailElement.style.color = messageDetailColor.makeOpaque(bgColor).toString();
                }
                if (linkFgColor) {
                    for (const el of this.messageContainer.getElementsByTagName('a')) {
                        el.style.color = linkFgColor.toString();
                    }
                }
                let color;
                switch (this.options.type) {
                    case 'error':
                        color = style.errorIconForeground;
                        break;
                    case 'warning':
                        color = style.warningIconForeground;
                        break;
                    default:
                        color = style.infoIconForeground;
                        break;
                }
                if (color) {
                    this.iconElement.style.color = color.toString();
                }
                for (const input of this.inputs) {
                    input.style(style);
                }
            }
        }
        style(style) {
            this.styles = style;
            this.applyStyles();
        }
        dispose() {
            super.dispose();
            if (this.modalElement) {
                this.modalElement.remove();
                this.modalElement = undefined;
            }
            if (this.focusToReturn && (0, dom_1.isAncestor)(this.focusToReturn, document.body)) {
                this.focusToReturn.focus();
                this.focusToReturn = undefined;
            }
        }
        rearrangeButtons(buttons, cancelId) {
            const buttonMap = [];
            // Maps each button to its current label and old index so that when we move them around it's not a problem
            buttons.forEach((button, index) => {
                buttonMap.push({ label: button, index });
            });
            // macOS/linux: reverse button order
            if (platform_1.isMacintosh || platform_1.isLinux) {
                if (cancelId !== undefined) {
                    const cancelButton = buttonMap.splice(cancelId, 1)[0];
                    buttonMap.reverse();
                    buttonMap.splice(buttonMap.length - 1, 0, cancelButton);
                }
            }
            return buttonMap;
        }
    }
    exports.Dialog = Dialog;
});
//# sourceMappingURL=dialog.js.map