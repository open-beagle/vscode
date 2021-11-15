/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/platform/contextkey/common/contextkey", "vs/platform/progress/common/progress", "./codeAction"], function (require, exports, async_1, errors_1, event_1, lifecycle_1, resources_1, range_1, modes_1, contextkey_1, progress_1, codeAction_1) {
    "use strict";
    var _CodeActionModel_isDisposed;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeActionModel = exports.CodeActionsState = exports.SUPPORTED_CODE_ACTIONS = void 0;
    exports.SUPPORTED_CODE_ACTIONS = new contextkey_1.RawContextKey('supportedCodeAction', '');
    class CodeActionOracle extends lifecycle_1.Disposable {
        constructor(_editor, _markerService, _signalChange, _delay = 250) {
            super();
            this._editor = _editor;
            this._markerService = _markerService;
            this._signalChange = _signalChange;
            this._delay = _delay;
            this._autoTriggerTimer = this._register(new async_1.TimeoutTimer());
            this._register(this._markerService.onMarkerChanged(e => this._onMarkerChanges(e)));
            this._register(this._editor.onDidChangeCursorPosition(() => this._onCursorChange()));
        }
        trigger(trigger) {
            const selection = this._getRangeOfSelectionUnlessWhitespaceEnclosed(trigger);
            return this._createEventAndSignalChange(trigger, selection);
        }
        _onMarkerChanges(resources) {
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            if (resources.some(resource => (0, resources_1.isEqual)(resource, model.uri))) {
                this._autoTriggerTimer.cancelAndSet(() => {
                    this.trigger({ type: 2 /* Auto */ });
                }, this._delay);
            }
        }
        _onCursorChange() {
            this._autoTriggerTimer.cancelAndSet(() => {
                this.trigger({ type: 2 /* Auto */ });
            }, this._delay);
        }
        _getRangeOfMarker(selection) {
            const model = this._editor.getModel();
            if (!model) {
                return undefined;
            }
            for (const marker of this._markerService.read({ resource: model.uri })) {
                const markerRange = model.validateRange(marker);
                if (range_1.Range.intersectRanges(markerRange, selection)) {
                    return range_1.Range.lift(markerRange);
                }
            }
            return undefined;
        }
        _getRangeOfSelectionUnlessWhitespaceEnclosed(trigger) {
            if (!this._editor.hasModel()) {
                return undefined;
            }
            const model = this._editor.getModel();
            const selection = this._editor.getSelection();
            if (selection.isEmpty() && trigger.type === 2 /* Auto */) {
                const { lineNumber, column } = selection.getPosition();
                const line = model.getLineContent(lineNumber);
                if (line.length === 0) {
                    // empty line
                    return undefined;
                }
                else if (column === 1) {
                    // look only right
                    if (/\s/.test(line[0])) {
                        return undefined;
                    }
                }
                else if (column === model.getLineMaxColumn(lineNumber)) {
                    // look only left
                    if (/\s/.test(line[line.length - 1])) {
                        return undefined;
                    }
                }
                else {
                    // look left and right
                    if (/\s/.test(line[column - 2]) && /\s/.test(line[column - 1])) {
                        return undefined;
                    }
                }
            }
            return selection;
        }
        _createEventAndSignalChange(trigger, selection) {
            const model = this._editor.getModel();
            if (!selection || !model) {
                // cancel
                this._signalChange(undefined);
                return undefined;
            }
            const markerRange = this._getRangeOfMarker(selection);
            const position = markerRange ? markerRange.getStartPosition() : selection.getStartPosition();
            const e = {
                trigger,
                selection,
                position
            };
            this._signalChange(e);
            return e;
        }
    }
    var CodeActionsState;
    (function (CodeActionsState) {
        let Type;
        (function (Type) {
            Type[Type["Empty"] = 0] = "Empty";
            Type[Type["Triggered"] = 1] = "Triggered";
        })(Type = CodeActionsState.Type || (CodeActionsState.Type = {}));
        CodeActionsState.Empty = { type: 0 /* Empty */ };
        class Triggered {
            constructor(trigger, rangeOrSelection, position, _cancellablePromise) {
                this.trigger = trigger;
                this.rangeOrSelection = rangeOrSelection;
                this.position = position;
                this._cancellablePromise = _cancellablePromise;
                this.type = 1 /* Triggered */;
                this.actions = _cancellablePromise.catch((e) => {
                    if ((0, errors_1.isPromiseCanceledError)(e)) {
                        return emptyCodeActionSet;
                    }
                    throw e;
                });
            }
            cancel() {
                this._cancellablePromise.cancel();
            }
        }
        CodeActionsState.Triggered = Triggered;
    })(CodeActionsState = exports.CodeActionsState || (exports.CodeActionsState = {}));
    const emptyCodeActionSet = {
        allActions: [],
        validActions: [],
        dispose: () => { },
        documentation: [],
        hasAutoFix: false
    };
    class CodeActionModel extends lifecycle_1.Disposable {
        constructor(_editor, _markerService, contextKeyService, _progressService) {
            super();
            this._editor = _editor;
            this._markerService = _markerService;
            this._progressService = _progressService;
            this._codeActionOracle = this._register(new lifecycle_1.MutableDisposable());
            this._state = CodeActionsState.Empty;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            _CodeActionModel_isDisposed.set(this, false);
            this._supportedCodeActions = exports.SUPPORTED_CODE_ACTIONS.bindTo(contextKeyService);
            this._register(this._editor.onDidChangeModel(() => this._update()));
            this._register(this._editor.onDidChangeModelLanguage(() => this._update()));
            this._register(modes_1.CodeActionProviderRegistry.onDidChange(() => this._update()));
            this._update();
        }
        dispose() {
            if (__classPrivateFieldGet(this, _CodeActionModel_isDisposed, "f")) {
                return;
            }
            __classPrivateFieldSet(this, _CodeActionModel_isDisposed, true, "f");
            super.dispose();
            this.setState(CodeActionsState.Empty, true);
        }
        _update() {
            if (__classPrivateFieldGet(this, _CodeActionModel_isDisposed, "f")) {
                return;
            }
            this._codeActionOracle.value = undefined;
            this.setState(CodeActionsState.Empty);
            const model = this._editor.getModel();
            if (model
                && modes_1.CodeActionProviderRegistry.has(model)
                && !this._editor.getOption(77 /* readOnly */)) {
                const supportedActions = [];
                for (const provider of modes_1.CodeActionProviderRegistry.all(model)) {
                    if (Array.isArray(provider.providedCodeActionKinds)) {
                        supportedActions.push(...provider.providedCodeActionKinds);
                    }
                }
                this._supportedCodeActions.set(supportedActions.join(' '));
                this._codeActionOracle.value = new CodeActionOracle(this._editor, this._markerService, trigger => {
                    var _a;
                    if (!trigger) {
                        this.setState(CodeActionsState.Empty);
                        return;
                    }
                    const actions = (0, async_1.createCancelablePromise)(token => (0, codeAction_1.getCodeActions)(model, trigger.selection, trigger.trigger, progress_1.Progress.None, token));
                    if (trigger.trigger.type === 1 /* Invoke */) {
                        (_a = this._progressService) === null || _a === void 0 ? void 0 : _a.showWhile(actions, 250);
                    }
                    this.setState(new CodeActionsState.Triggered(trigger.trigger, trigger.selection, trigger.position, actions));
                }, undefined);
                this._codeActionOracle.value.trigger({ type: 2 /* Auto */ });
            }
            else {
                this._supportedCodeActions.reset();
            }
        }
        trigger(trigger) {
            if (this._codeActionOracle.value) {
                this._codeActionOracle.value.trigger(trigger);
            }
        }
        setState(newState, skipNotify) {
            if (newState === this._state) {
                return;
            }
            // Cancel old request
            if (this._state.type === 1 /* Triggered */) {
                this._state.cancel();
            }
            this._state = newState;
            if (!skipNotify && !__classPrivateFieldGet(this, _CodeActionModel_isDisposed, "f")) {
                this._onDidChangeState.fire(newState);
            }
        }
    }
    exports.CodeActionModel = CodeActionModel;
    _CodeActionModel_isDisposed = new WeakMap();
});
//# sourceMappingURL=codeActionModel.js.map