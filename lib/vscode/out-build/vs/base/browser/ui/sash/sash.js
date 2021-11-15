/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/base/browser/touch", "vs/base/browser/mouseEvent", "vs/base/common/event", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/common/async", "vs/css!./sash"], function (require, exports, lifecycle_1, platform_1, types, touch_1, mouseEvent_1, event_1, dom_1, event_2, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Sash = exports.setGlobalHoverDelay = exports.setGlobalSashSize = exports.SashState = exports.Orientation = exports.OrthogonalEdge = void 0;
    let DEBUG = false;
    var OrthogonalEdge;
    (function (OrthogonalEdge) {
        OrthogonalEdge["North"] = "north";
        OrthogonalEdge["South"] = "south";
        OrthogonalEdge["East"] = "east";
        OrthogonalEdge["West"] = "west";
    })(OrthogonalEdge = exports.OrthogonalEdge || (exports.OrthogonalEdge = {}));
    var Orientation;
    (function (Orientation) {
        Orientation[Orientation["VERTICAL"] = 0] = "VERTICAL";
        Orientation[Orientation["HORIZONTAL"] = 1] = "HORIZONTAL";
    })(Orientation = exports.Orientation || (exports.Orientation = {}));
    var SashState;
    (function (SashState) {
        SashState[SashState["Disabled"] = 0] = "Disabled";
        SashState[SashState["Minimum"] = 1] = "Minimum";
        SashState[SashState["Maximum"] = 2] = "Maximum";
        SashState[SashState["Enabled"] = 3] = "Enabled";
    })(SashState = exports.SashState || (exports.SashState = {}));
    let globalSize = 4;
    const onDidChangeGlobalSize = new event_1.Emitter();
    function setGlobalSashSize(size) {
        globalSize = size;
        onDidChangeGlobalSize.fire(size);
    }
    exports.setGlobalSashSize = setGlobalSashSize;
    let globalHoverDelay = 300;
    const onDidChangeHoverDelay = new event_1.Emitter();
    function setGlobalHoverDelay(size) {
        globalHoverDelay = size;
        onDidChangeHoverDelay.fire(size);
    }
    exports.setGlobalHoverDelay = setGlobalHoverDelay;
    class Sash extends lifecycle_1.Disposable {
        constructor(container, layoutProvider, options) {
            super();
            this.hoverDelay = globalHoverDelay;
            this.hoverDelayer = this._register(new async_1.Delayer(this.hoverDelay));
            this._state = 3 /* Enabled */;
            this._onDidEnablementChange = this._register(new event_1.Emitter());
            this.onDidEnablementChange = this._onDidEnablementChange.event;
            this._onDidStart = this._register(new event_1.Emitter());
            this.onDidStart = this._onDidStart.event;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._onDidReset = this._register(new event_1.Emitter());
            this.onDidReset = this._onDidReset.event;
            this._onDidEnd = this._register(new event_1.Emitter());
            this.onDidEnd = this._onDidEnd.event;
            this.linkedSash = undefined;
            this.orthogonalStartSashDisposables = this._register(new lifecycle_1.DisposableStore());
            this.orthogonalStartDragHandleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.orthogonalEndSashDisposables = this._register(new lifecycle_1.DisposableStore());
            this.orthogonalEndDragHandleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.el = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-sash'));
            if (options.orthogonalEdge) {
                this.el.classList.add(`orthogonal-edge-${options.orthogonalEdge}`);
            }
            if (platform_1.isMacintosh) {
                this.el.classList.add('mac');
            }
            this._register((0, event_2.domEvent)(this.el, 'mousedown')(this.onMouseDown, this));
            this._register((0, event_2.domEvent)(this.el, 'dblclick')(this.onMouseDoubleClick, this));
            this._register((0, event_2.domEvent)(this.el, 'mouseenter')(() => Sash.onMouseEnter(this)));
            this._register((0, event_2.domEvent)(this.el, 'mouseleave')(() => Sash.onMouseLeave(this)));
            this._register(touch_1.Gesture.addTarget(this.el));
            this._register((0, event_2.domEvent)(this.el, touch_1.EventType.Start)(e => this.onTouchStart(e), this));
            if (typeof options.size === 'number') {
                this.size = options.size;
                if (options.orientation === 0 /* VERTICAL */) {
                    this.el.style.width = `${this.size}px`;
                }
                else {
                    this.el.style.height = `${this.size}px`;
                }
            }
            else {
                this.size = globalSize;
                this._register(onDidChangeGlobalSize.event(size => {
                    this.size = size;
                    this.layout();
                }));
            }
            this._register(onDidChangeHoverDelay.event(delay => this.hoverDelay = delay));
            this.hidden = false;
            this.layoutProvider = layoutProvider;
            this.orthogonalStartSash = options.orthogonalStartSash;
            this.orthogonalEndSash = options.orthogonalEndSash;
            this.orientation = options.orientation || 0 /* VERTICAL */;
            if (this.orientation === 1 /* HORIZONTAL */) {
                this.el.classList.add('horizontal');
                this.el.classList.remove('vertical');
            }
            else {
                this.el.classList.remove('horizontal');
                this.el.classList.add('vertical');
            }
            this.el.classList.toggle('debug', DEBUG);
            this.layout();
        }
        get state() { return this._state; }
        set state(state) {
            if (this._state === state) {
                return;
            }
            this.el.classList.toggle('disabled', state === 0 /* Disabled */);
            this.el.classList.toggle('minimum', state === 1 /* Minimum */);
            this.el.classList.toggle('maximum', state === 2 /* Maximum */);
            this._state = state;
            this._onDidEnablementChange.fire(state);
        }
        get orthogonalStartSash() { return this._orthogonalStartSash; }
        set orthogonalStartSash(sash) {
            this.orthogonalStartDragHandleDisposables.clear();
            this.orthogonalStartSashDisposables.clear();
            if (sash) {
                const onChange = (state) => {
                    this.orthogonalStartDragHandleDisposables.clear();
                    if (state !== 0 /* Disabled */) {
                        this._orthogonalStartDragHandle = (0, dom_1.append)(this.el, (0, dom_1.$)('.orthogonal-drag-handle.start'));
                        this.orthogonalStartDragHandleDisposables.add((0, lifecycle_1.toDisposable)(() => this._orthogonalStartDragHandle.remove()));
                        (0, event_2.domEvent)(this._orthogonalStartDragHandle, 'mouseenter')(() => Sash.onMouseEnter(sash), undefined, this.orthogonalStartDragHandleDisposables);
                        (0, event_2.domEvent)(this._orthogonalStartDragHandle, 'mouseleave')(() => Sash.onMouseLeave(sash), undefined, this.orthogonalStartDragHandleDisposables);
                    }
                };
                this.orthogonalStartSashDisposables.add(sash.onDidEnablementChange(onChange, this));
                onChange(sash.state);
            }
            this._orthogonalStartSash = sash;
        }
        get orthogonalEndSash() { return this._orthogonalEndSash; }
        set orthogonalEndSash(sash) {
            this.orthogonalEndDragHandleDisposables.clear();
            this.orthogonalEndSashDisposables.clear();
            if (sash) {
                const onChange = (state) => {
                    this.orthogonalEndDragHandleDisposables.clear();
                    if (state !== 0 /* Disabled */) {
                        this._orthogonalEndDragHandle = (0, dom_1.append)(this.el, (0, dom_1.$)('.orthogonal-drag-handle.end'));
                        this.orthogonalEndDragHandleDisposables.add((0, lifecycle_1.toDisposable)(() => this._orthogonalEndDragHandle.remove()));
                        (0, event_2.domEvent)(this._orthogonalEndDragHandle, 'mouseenter')(() => Sash.onMouseEnter(sash), undefined, this.orthogonalEndDragHandleDisposables);
                        (0, event_2.domEvent)(this._orthogonalEndDragHandle, 'mouseleave')(() => Sash.onMouseLeave(sash), undefined, this.orthogonalEndDragHandleDisposables);
                    }
                };
                this.orthogonalEndSashDisposables.add(sash.onDidEnablementChange(onChange, this));
                onChange(sash.state);
            }
            this._orthogonalEndSash = sash;
        }
        onMouseDown(e) {
            dom_1.EventHelper.stop(e, false);
            let isMultisashResize = false;
            if (!e.__orthogonalSashEvent) {
                const orthogonalSash = this.getOrthogonalSash(e);
                if (orthogonalSash) {
                    isMultisashResize = true;
                    e.__orthogonalSashEvent = true;
                    orthogonalSash.onMouseDown(e);
                }
            }
            if (this.linkedSash && !e.__linkedSashEvent) {
                e.__linkedSashEvent = true;
                this.linkedSash.onMouseDown(e);
            }
            if (!this.state) {
                return;
            }
            // Select both iframes and webviews; internally Electron nests an iframe
            // in its <webview> component, but this isn't queryable.
            const iframes = [
                ...(0, dom_1.getElementsByTagName)('iframe'),
                ...(0, dom_1.getElementsByTagName)('webview'),
            ];
            for (const iframe of iframes) {
                iframe.style.pointerEvents = 'none'; // disable mouse events on iframes as long as we drag the sash
            }
            const mouseDownEvent = new mouseEvent_1.StandardMouseEvent(e);
            const startX = mouseDownEvent.posx;
            const startY = mouseDownEvent.posy;
            const altKey = mouseDownEvent.altKey;
            const startEvent = { startX, currentX: startX, startY, currentY: startY, altKey };
            this.el.classList.add('active');
            this._onDidStart.fire(startEvent);
            // fix https://github.com/microsoft/vscode/issues/21675
            const style = (0, dom_1.createStyleSheet)(this.el);
            const updateStyle = () => {
                let cursor = '';
                if (isMultisashResize) {
                    cursor = 'all-scroll';
                }
                else if (this.orientation === 1 /* HORIZONTAL */) {
                    if (this.state === 1 /* Minimum */) {
                        cursor = 's-resize';
                    }
                    else if (this.state === 2 /* Maximum */) {
                        cursor = 'n-resize';
                    }
                    else {
                        cursor = platform_1.isMacintosh ? 'row-resize' : 'ns-resize';
                    }
                }
                else {
                    if (this.state === 1 /* Minimum */) {
                        cursor = 'e-resize';
                    }
                    else if (this.state === 2 /* Maximum */) {
                        cursor = 'w-resize';
                    }
                    else {
                        cursor = platform_1.isMacintosh ? 'col-resize' : 'ew-resize';
                    }
                }
                style.textContent = `* { cursor: ${cursor} !important; }`;
            };
            const disposables = new lifecycle_1.DisposableStore();
            updateStyle();
            if (!isMultisashResize) {
                this.onDidEnablementChange(updateStyle, null, disposables);
            }
            const onMouseMove = (e) => {
                dom_1.EventHelper.stop(e, false);
                const mouseMoveEvent = new mouseEvent_1.StandardMouseEvent(e);
                const event = { startX, currentX: mouseMoveEvent.posx, startY, currentY: mouseMoveEvent.posy, altKey };
                this._onDidChange.fire(event);
            };
            const onMouseUp = (e) => {
                dom_1.EventHelper.stop(e, false);
                this.el.removeChild(style);
                this.el.classList.remove('active');
                this._onDidEnd.fire();
                disposables.dispose();
                for (const iframe of iframes) {
                    iframe.style.pointerEvents = 'auto';
                }
            };
            (0, event_2.domEvent)(window, 'mousemove')(onMouseMove, null, disposables);
            (0, event_2.domEvent)(window, 'mouseup')(onMouseUp, null, disposables);
        }
        onMouseDoubleClick(e) {
            const orthogonalSash = this.getOrthogonalSash(e);
            if (orthogonalSash) {
                orthogonalSash._onDidReset.fire();
            }
            if (this.linkedSash) {
                this.linkedSash._onDidReset.fire();
            }
            this._onDidReset.fire();
        }
        onTouchStart(event) {
            dom_1.EventHelper.stop(event);
            const listeners = [];
            const startX = event.pageX;
            const startY = event.pageY;
            const altKey = event.altKey;
            this._onDidStart.fire({
                startX: startX,
                currentX: startX,
                startY: startY,
                currentY: startY,
                altKey
            });
            listeners.push((0, dom_1.addDisposableListener)(this.el, touch_1.EventType.Change, (event) => {
                if (types.isNumber(event.pageX) && types.isNumber(event.pageY)) {
                    this._onDidChange.fire({
                        startX: startX,
                        currentX: event.pageX,
                        startY: startY,
                        currentY: event.pageY,
                        altKey
                    });
                }
            }));
            listeners.push((0, dom_1.addDisposableListener)(this.el, touch_1.EventType.End, () => {
                this._onDidEnd.fire();
                (0, lifecycle_1.dispose)(listeners);
            }));
        }
        static onMouseEnter(sash, fromLinkedSash = false) {
            if (sash.el.classList.contains('active')) {
                sash.hoverDelayer.cancel();
                sash.el.classList.add('hover');
            }
            else {
                sash.hoverDelayer.trigger(() => sash.el.classList.add('hover'), sash.hoverDelay).then(undefined, () => { });
            }
            if (!fromLinkedSash && sash.linkedSash) {
                Sash.onMouseEnter(sash.linkedSash, true);
            }
        }
        static onMouseLeave(sash, fromLinkedSash = false) {
            sash.hoverDelayer.cancel();
            sash.el.classList.remove('hover');
            if (!fromLinkedSash && sash.linkedSash) {
                Sash.onMouseLeave(sash.linkedSash, true);
            }
        }
        clearSashHoverState() {
            Sash.onMouseLeave(this);
        }
        layout() {
            if (this.orientation === 0 /* VERTICAL */) {
                const verticalProvider = this.layoutProvider;
                this.el.style.left = verticalProvider.getVerticalSashLeft(this) - (this.size / 2) + 'px';
                if (verticalProvider.getVerticalSashTop) {
                    this.el.style.top = verticalProvider.getVerticalSashTop(this) + 'px';
                }
                if (verticalProvider.getVerticalSashHeight) {
                    this.el.style.height = verticalProvider.getVerticalSashHeight(this) + 'px';
                }
            }
            else {
                const horizontalProvider = this.layoutProvider;
                this.el.style.top = horizontalProvider.getHorizontalSashTop(this) - (this.size / 2) + 'px';
                if (horizontalProvider.getHorizontalSashLeft) {
                    this.el.style.left = horizontalProvider.getHorizontalSashLeft(this) + 'px';
                }
                if (horizontalProvider.getHorizontalSashWidth) {
                    this.el.style.width = horizontalProvider.getHorizontalSashWidth(this) + 'px';
                }
            }
        }
        show() {
            this.hidden = false;
            this.el.style.removeProperty('display');
            this.el.setAttribute('aria-hidden', 'false');
        }
        hide() {
            this.hidden = true;
            this.el.style.display = 'none';
            this.el.setAttribute('aria-hidden', 'true');
        }
        isHidden() {
            return this.hidden;
        }
        getOrthogonalSash(e) {
            if (!e.target || !(e.target instanceof HTMLElement)) {
                return undefined;
            }
            if (e.target.classList.contains('orthogonal-drag-handle')) {
                return e.target.classList.contains('start') ? this.orthogonalStartSash : this.orthogonalEndSash;
            }
            return undefined;
        }
        dispose() {
            super.dispose();
            this.el.remove();
        }
    }
    exports.Sash = Sash;
});
//# sourceMappingURL=sash.js.map