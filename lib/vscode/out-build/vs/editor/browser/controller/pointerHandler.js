/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/browser/touch", "vs/base/common/lifecycle", "vs/editor/browser/controller/mouseHandler", "vs/editor/browser/editorDom", "vs/base/browser/canIUse", "vs/editor/browser/controller/textAreaInput"], function (require, exports, dom, platform, touch_1, lifecycle_1, mouseHandler_1, editorDom_1, canIUse_1, textAreaInput_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PointerHandler = exports.PointerEventHandler = void 0;
    /**
     * Currently only tested on iOS 13/ iPadOS.
     */
    class PointerEventHandler extends mouseHandler_1.MouseHandler {
        constructor(context, viewController, viewHelper) {
            super(context, viewController, viewHelper);
            this._register(touch_1.Gesture.addTarget(this.viewHelper.linesContentDomNode));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Tap, (e) => this.onTap(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Change, (e) => this.onChange(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Contextmenu, (e) => this._onContextMenu(new editorDom_1.EditorMouseEvent(e, this.viewHelper.viewDomNode), false)));
            this._lastPointerType = 'mouse';
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, 'pointerdown', (e) => {
                const pointerType = e.pointerType;
                if (pointerType === 'mouse') {
                    this._lastPointerType = 'mouse';
                    return;
                }
                else if (pointerType === 'touch') {
                    this._lastPointerType = 'touch';
                }
                else {
                    this._lastPointerType = 'pen';
                }
            }));
            // PonterEvents
            const pointerEvents = new editorDom_1.EditorPointerEventFactory(this.viewHelper.viewDomNode);
            this._register(pointerEvents.onPointerMoveThrottled(this.viewHelper.viewDomNode, (e) => this._onMouseMove(e), (0, mouseHandler_1.createMouseMoveEventMerger)(this.mouseTargetFactory), mouseHandler_1.MouseHandler.MOUSE_MOVE_MINIMUM_TIME));
            this._register(pointerEvents.onPointerUp(this.viewHelper.viewDomNode, (e) => this._onMouseUp(e)));
            this._register(pointerEvents.onPointerLeave(this.viewHelper.viewDomNode, (e) => this._onMouseLeave(e)));
            this._register(pointerEvents.onPointerDown(this.viewHelper.viewDomNode, (e) => this._onMouseDown(e)));
        }
        onTap(event) {
            if (!event.initialTarget || !this.viewHelper.linesContentDomNode.contains(event.initialTarget)) {
                return;
            }
            event.preventDefault();
            this.viewHelper.focusTextArea();
            const target = this._createMouseTarget(new editorDom_1.EditorMouseEvent(event, this.viewHelper.viewDomNode), false);
            if (target.position) {
                // this.viewController.moveTo(target.position);
                this.viewController.dispatchMouse({
                    position: target.position,
                    mouseColumn: target.position.column,
                    startedOnLineNumbers: false,
                    mouseDownCount: event.tapCount,
                    inSelectionMode: false,
                    altKey: false,
                    ctrlKey: false,
                    metaKey: false,
                    shiftKey: false,
                    leftButton: false,
                    middleButton: false,
                });
            }
        }
        onChange(e) {
            if (this._lastPointerType === 'touch') {
                this._context.model.deltaScrollNow(-e.translationX, -e.translationY);
            }
        }
        _onMouseDown(e) {
            if (e.browserEvent.pointerType === 'touch') {
                return;
            }
            super._onMouseDown(e);
        }
    }
    exports.PointerEventHandler = PointerEventHandler;
    class TouchHandler extends mouseHandler_1.MouseHandler {
        constructor(context, viewController, viewHelper) {
            super(context, viewController, viewHelper);
            this._register(touch_1.Gesture.addTarget(this.viewHelper.linesContentDomNode));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Tap, (e) => this.onTap(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Change, (e) => this.onChange(e)));
            this._register(dom.addDisposableListener(this.viewHelper.linesContentDomNode, touch_1.EventType.Contextmenu, (e) => this._onContextMenu(new editorDom_1.EditorMouseEvent(e, this.viewHelper.viewDomNode), false)));
        }
        onTap(event) {
            event.preventDefault();
            this.viewHelper.focusTextArea();
            const target = this._createMouseTarget(new editorDom_1.EditorMouseEvent(event, this.viewHelper.viewDomNode), false);
            if (target.position) {
                // Send the tap event also to the <textarea> (for input purposes)
                const event = document.createEvent('CustomEvent');
                event.initEvent(textAreaInput_1.TextAreaSyntethicEvents.Tap, false, true);
                this.viewHelper.dispatchTextAreaEvent(event);
                this.viewController.moveTo(target.position);
            }
        }
        onChange(e) {
            this._context.model.deltaScrollNow(-e.translationX, -e.translationY);
        }
    }
    class PointerHandler extends lifecycle_1.Disposable {
        constructor(context, viewController, viewHelper) {
            super();
            if ((platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents)) {
                this.handler = this._register(new PointerEventHandler(context, viewController, viewHelper));
            }
            else if (window.TouchEvent) {
                this.handler = this._register(new TouchHandler(context, viewController, viewHelper));
            }
            else {
                this.handler = this._register(new mouseHandler_1.MouseHandler(context, viewController, viewHelper));
            }
        }
        getTargetAtClientPoint(clientX, clientY) {
            return this.handler.getTargetAtClientPoint(clientX, clientY);
        }
    }
    exports.PointerHandler = PointerHandler;
});
//# sourceMappingURL=pointerHandler.js.map