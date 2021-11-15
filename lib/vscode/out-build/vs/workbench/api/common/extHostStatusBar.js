/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
define(["require", "exports", "./extHostTypes", "./extHost.protocol", "vs/nls!vs/workbench/api/common/extHostStatusBar", "vs/base/common/lifecycle"], function (require, exports, extHostTypes_1, extHost_protocol_1, nls_1, lifecycle_1) {
    "use strict";
    var _ExtHostStatusBarEntry_proxy, _ExtHostStatusBarEntry_commands;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostStatusBar = exports.ExtHostStatusBarEntry = void 0;
    class ExtHostStatusBarEntry {
        constructor(proxy, commands, id, name, alignment = extHostTypes_1.StatusBarAlignment.Left, priority, accessibilityInformation) {
            _ExtHostStatusBarEntry_proxy.set(this, void 0);
            _ExtHostStatusBarEntry_commands.set(this, void 0);
            this._disposed = false;
            this._visible = false;
            this._text = '';
            this._internalCommandRegistration = new lifecycle_1.DisposableStore();
            __classPrivateFieldSet(this, _ExtHostStatusBarEntry_proxy, proxy, "f");
            __classPrivateFieldSet(this, _ExtHostStatusBarEntry_commands, commands, "f");
            this._id = ExtHostStatusBarEntry.ID_GEN++;
            this._statusId = id;
            this._statusName = name;
            this._alignment = alignment;
            this._priority = priority;
            this._accessibilityInformation = accessibilityInformation;
        }
        get id() {
            return this._id;
        }
        get alignment() {
            return this._alignment;
        }
        get priority() {
            return this._priority;
        }
        get text() {
            return this._text;
        }
        get tooltip() {
            return this._tooltip;
        }
        get color() {
            return this._color;
        }
        get backgroundColor() {
            return this._backgroundColor;
        }
        get command() {
            var _a;
            return (_a = this._command) === null || _a === void 0 ? void 0 : _a.fromApi;
        }
        get accessibilityInformation() {
            return this._accessibilityInformation;
        }
        set text(text) {
            this._text = text;
            this.update();
        }
        set tooltip(tooltip) {
            this._tooltip = tooltip;
            this.update();
        }
        set color(color) {
            this._color = color;
            this.update();
        }
        set backgroundColor(color) {
            if (color && !ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.has(color.id)) {
                color = undefined;
            }
            this._backgroundColor = color;
            this.update();
        }
        set command(command) {
            var _a;
            if (((_a = this._command) === null || _a === void 0 ? void 0 : _a.fromApi) === command) {
                return;
            }
            this._internalCommandRegistration.clear();
            if (typeof command === 'string') {
                this._command = {
                    fromApi: command,
                    internal: __classPrivateFieldGet(this, _ExtHostStatusBarEntry_commands, "f").toInternal({ title: '', command }, this._internalCommandRegistration),
                };
            }
            else if (command) {
                this._command = {
                    fromApi: command,
                    internal: __classPrivateFieldGet(this, _ExtHostStatusBarEntry_commands, "f").toInternal(command, this._internalCommandRegistration),
                };
            }
            else {
                this._command = undefined;
            }
            this.update();
        }
        set accessibilityInformation(accessibilityInformation) {
            this._accessibilityInformation = accessibilityInformation;
            this.update();
        }
        show() {
            this._visible = true;
            this.update();
        }
        hide() {
            clearTimeout(this._timeoutHandle);
            this._visible = false;
            __classPrivateFieldGet(this, _ExtHostStatusBarEntry_proxy, "f").$dispose(this.id);
        }
        update() {
            if (this._disposed || !this._visible) {
                return;
            }
            clearTimeout(this._timeoutHandle);
            // Defer the update so that multiple changes to setters dont cause a redraw each
            this._timeoutHandle = setTimeout(() => {
                var _a;
                this._timeoutHandle = undefined;
                // If a background color is set, the foreground is determined
                let color = this._color;
                if (this._backgroundColor) {
                    color = ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS.get(this._backgroundColor.id);
                }
                // Set to status bar
                __classPrivateFieldGet(this, _ExtHostStatusBarEntry_proxy, "f").$setEntry(this.id, this._statusId, this._statusName, this._text, this._tooltip, (_a = this._command) === null || _a === void 0 ? void 0 : _a.internal, color, this._backgroundColor, this._alignment === extHostTypes_1.StatusBarAlignment.Left ? 0 /* LEFT */ : 1 /* RIGHT */, this._priority, this._accessibilityInformation);
            }, 0);
        }
        dispose() {
            this.hide();
            this._disposed = true;
        }
    }
    exports.ExtHostStatusBarEntry = ExtHostStatusBarEntry;
    _ExtHostStatusBarEntry_proxy = new WeakMap(), _ExtHostStatusBarEntry_commands = new WeakMap();
    ExtHostStatusBarEntry.ID_GEN = 0;
    ExtHostStatusBarEntry.ALLOWED_BACKGROUND_COLORS = new Map([['statusBarItem.errorBackground', new extHostTypes_1.ThemeColor('statusBarItem.errorForeground')]]);
    class StatusBarMessage {
        constructor(statusBar) {
            this._messages = [];
            this._item = statusBar.createStatusBarEntry('status.extensionMessage', (0, nls_1.localize)(0, null), extHostTypes_1.StatusBarAlignment.Left, Number.MIN_VALUE);
        }
        dispose() {
            this._messages.length = 0;
            this._item.dispose();
        }
        setMessage(message) {
            const data = { message }; // use object to not confuse equal strings
            this._messages.unshift(data);
            this._update();
            return new extHostTypes_1.Disposable(() => {
                const idx = this._messages.indexOf(data);
                if (idx >= 0) {
                    this._messages.splice(idx, 1);
                    this._update();
                }
            });
        }
        _update() {
            if (this._messages.length > 0) {
                this._item.text = this._messages[0].message;
                this._item.show();
            }
            else {
                this._item.hide();
            }
        }
    }
    class ExtHostStatusBar {
        constructor(mainContext, commands) {
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadStatusBar);
            this._commands = commands;
            this._statusMessage = new StatusBarMessage(this);
        }
        createStatusBarEntry(id, name, alignment, priority, accessibilityInformation) {
            return new ExtHostStatusBarEntry(this._proxy, this._commands, id, name, alignment, priority, accessibilityInformation);
        }
        setStatusBarMessage(text, timeoutOrThenable) {
            const d = this._statusMessage.setMessage(text);
            let handle;
            if (typeof timeoutOrThenable === 'number') {
                handle = setTimeout(() => d.dispose(), timeoutOrThenable);
            }
            else if (typeof timeoutOrThenable !== 'undefined') {
                timeoutOrThenable.then(() => d.dispose(), () => d.dispose());
            }
            return new extHostTypes_1.Disposable(() => {
                d.dispose();
                clearTimeout(handle);
            });
        }
    }
    exports.ExtHostStatusBar = ExtHostStatusBar;
});
//# sourceMappingURL=extHostStatusBar.js.map