/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, nls, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toAction = exports.EmptySubmenuAction = exports.SubmenuAction = exports.Separator = exports.ActionRunner = exports.Action = void 0;
    class Action extends lifecycle_1.Disposable {
        constructor(id, label = '', cssClass = '', enabled = true, actionCallback) {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._enabled = true;
            this._checked = false;
            this._id = id;
            this._label = label;
            this._cssClass = cssClass;
            this._enabled = enabled;
            this._actionCallback = actionCallback;
        }
        get id() {
            return this._id;
        }
        get label() {
            return this._label;
        }
        set label(value) {
            this._setLabel(value);
        }
        _setLabel(value) {
            if (this._label !== value) {
                this._label = value;
                this._onDidChange.fire({ label: value });
            }
        }
        get tooltip() {
            return this._tooltip || '';
        }
        set tooltip(value) {
            this._setTooltip(value);
        }
        _setTooltip(value) {
            if (this._tooltip !== value) {
                this._tooltip = value;
                this._onDidChange.fire({ tooltip: value });
            }
        }
        get class() {
            return this._cssClass;
        }
        set class(value) {
            this._setClass(value);
        }
        _setClass(value) {
            if (this._cssClass !== value) {
                this._cssClass = value;
                this._onDidChange.fire({ class: value });
            }
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            this._setEnabled(value);
        }
        _setEnabled(value) {
            if (this._enabled !== value) {
                this._enabled = value;
                this._onDidChange.fire({ enabled: value });
            }
        }
        get checked() {
            return this._checked;
        }
        set checked(value) {
            this._setChecked(value);
        }
        _setChecked(value) {
            if (this._checked !== value) {
                this._checked = value;
                this._onDidChange.fire({ checked: value });
            }
        }
        async run(event, data) {
            if (this._actionCallback) {
                await this._actionCallback(event);
            }
        }
    }
    exports.Action = Action;
    class ActionRunner extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onBeforeRun = this._register(new event_1.Emitter());
            this.onBeforeRun = this._onBeforeRun.event;
            this._onDidRun = this._register(new event_1.Emitter());
            this.onDidRun = this._onDidRun.event;
        }
        async run(action, context) {
            if (!action.enabled) {
                return;
            }
            this._onBeforeRun.fire({ action });
            let error = undefined;
            try {
                await this.runAction(action, context);
            }
            catch (e) {
                error = e;
            }
            this._onDidRun.fire({ action, error });
        }
        async runAction(action, context) {
            await action.run(context);
        }
    }
    exports.ActionRunner = ActionRunner;
    class Separator extends Action {
        constructor(label) {
            super(Separator.ID, label, label ? 'separator text' : 'separator');
            this.checked = false;
            this.enabled = false;
        }
    }
    exports.Separator = Separator;
    Separator.ID = 'vs.actions.separator';
    class SubmenuAction {
        constructor(id, label, actions, cssClass) {
            this.tooltip = '';
            this.enabled = true;
            this.checked = false;
            this.id = id;
            this.label = label;
            this.class = cssClass;
            this._actions = actions;
        }
        get actions() { return this._actions; }
        dispose() {
            // there is NOTHING to dispose and the SubmenuAction should
            // never have anything to dispose as it is a convenience type
            // to bridge into the rendering world.
        }
        async run() { }
    }
    exports.SubmenuAction = SubmenuAction;
    class EmptySubmenuAction extends Action {
        constructor() {
            super(EmptySubmenuAction.ID, nls.localize(0, null), undefined, false);
        }
    }
    exports.EmptySubmenuAction = EmptySubmenuAction;
    EmptySubmenuAction.ID = 'vs.actions.empty';
    function toAction(props) {
        var _a, _b;
        return {
            id: props.id,
            label: props.label,
            class: undefined,
            enabled: (_a = props.enabled) !== null && _a !== void 0 ? _a : true,
            checked: (_b = props.checked) !== null && _b !== void 0 ? _b : false,
            run: async () => props.run(),
            tooltip: props.label,
            dispose: () => { }
        };
    }
    exports.toAction = toAction;
});
//# sourceMappingURL=actions.js.map