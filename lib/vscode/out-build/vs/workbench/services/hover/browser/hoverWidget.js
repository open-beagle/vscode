/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/configuration/common/configuration", "vs/editor/common/config/editorOptions", "vs/base/browser/ui/hover/hoverWidget", "vs/base/browser/ui/widget", "vs/platform/opener/common/opener", "vs/workbench/services/layout/browser/layoutService", "vs/platform/instantiation/common/instantiation", "vs/editor/browser/core/markdownRenderer"], function (require, exports, lifecycle_1, event_1, dom, keybinding_1, configuration_1, editorOptions_1, hoverWidget_1, widget_1, opener_1, layoutService_1, instantiation_1, markdownRenderer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HoverWidget = void 0;
    const $ = dom.$;
    let HoverWidget = class HoverWidget extends widget_1.Widget {
        constructor(options, _keybindingService, _configurationService, _openerService, _workbenchLayoutService, _instantiationService) {
            var _a;
            super();
            this._keybindingService = _keybindingService;
            this._configurationService = _configurationService;
            this._openerService = _openerService;
            this._workbenchLayoutService = _workbenchLayoutService;
            this._instantiationService = _instantiationService;
            this._messageListeners = new lifecycle_1.DisposableStore();
            this._isDisposed = false;
            this._x = 0;
            this._y = 0;
            this._onDispose = this._register(new event_1.Emitter());
            this._onRequestLayout = this._register(new event_1.Emitter());
            this._linkHandler = options.linkHandler || this._openerService.open;
            this._target = 'targetElements' in options.target ? options.target : new ElementHoverTarget(options.target);
            this._hoverPointer = options.showPointer ? $('div.workbench-hover-pointer') : undefined;
            this._hover = this._register(new hoverWidget_1.HoverWidget());
            this._hover.containerDomNode.classList.add('workbench-hover', 'fadeIn');
            if (options.compact) {
                this._hover.containerDomNode.classList.add('workbench-hover', 'compact');
            }
            if (options.additionalClasses) {
                this._hover.containerDomNode.classList.add(...options.additionalClasses);
            }
            this._hoverPosition = (_a = options.hoverPosition) !== null && _a !== void 0 ? _a : 3 /* ABOVE */;
            // Don't allow mousedown out of the widget, otherwise preventDefault will call and text will
            // not be selected.
            this.onmousedown(this._hover.containerDomNode, e => e.stopPropagation());
            // Hide hover on escape
            this.onkeydown(this._hover.containerDomNode, e => {
                if (e.equals(9 /* Escape */)) {
                    this.dispose();
                }
            });
            const rowElement = $('div.hover-row.markdown-hover');
            const contentsElement = $('div.hover-contents');
            if (typeof options.text === 'string') {
                contentsElement.textContent = options.text;
                contentsElement.style.whiteSpace = 'pre-wrap';
            }
            else {
                const markdown = options.text;
                const mdRenderer = this._instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, { codeBlockFontFamily: this._configurationService.getValue('editor').fontFamily || editorOptions_1.EDITOR_FONT_DEFAULTS.fontFamily });
                const { element } = mdRenderer.render(markdown, {
                    actionHandler: {
                        callback: (content) => this._linkHandler(content),
                        disposeables: this._messageListeners
                    },
                    asyncRenderCallback: () => {
                        contentsElement.classList.add('code-hover-contents');
                        // This changes the dimensions of the hover so trigger a layout
                        this._onRequestLayout.fire();
                    }
                });
                contentsElement.appendChild(element);
            }
            rowElement.appendChild(contentsElement);
            this._hover.contentsDomNode.appendChild(rowElement);
            if (options.actions && options.actions.length > 0) {
                const statusBarElement = $('div.hover-row.status-bar');
                const actionsElement = $('div.actions');
                options.actions.forEach(action => {
                    const keybinding = this._keybindingService.lookupKeybinding(action.commandId);
                    const keybindingLabel = keybinding ? keybinding.getLabel() : null;
                    (0, hoverWidget_1.renderHoverAction)(actionsElement, {
                        label: action.label,
                        commandId: action.commandId,
                        run: e => {
                            action.run(e);
                            this.dispose();
                        },
                        iconClass: action.iconClass
                    }, keybindingLabel);
                });
                statusBarElement.appendChild(actionsElement);
                this._hover.containerDomNode.appendChild(statusBarElement);
            }
            const mouseTrackerTargets = [...this._target.targetElements];
            let hideOnHover;
            if (options.actions && options.actions.length > 0) {
                // If there are actions, require hover so they can be accessed
                hideOnHover = false;
            }
            else {
                if (options.hideOnHover === undefined) {
                    // Defaults to true when string, false when markdown as it may contain links
                    hideOnHover = typeof options.text === 'string';
                }
                else {
                    // It's set explicitly
                    hideOnHover = options.hideOnHover;
                }
            }
            if (!hideOnHover) {
                mouseTrackerTargets.push(this._hover.containerDomNode);
            }
            this._mouseTracker = new CompositeMouseTracker(mouseTrackerTargets);
            this._register(this._mouseTracker.onMouseOut(() => this.dispose()));
            this._register(this._mouseTracker);
        }
        get isDisposed() { return this._isDisposed; }
        get domNode() { return this._hover.containerDomNode; }
        get onDispose() { return this._onDispose.event; }
        get onRequestLayout() { return this._onRequestLayout.event; }
        get anchor() { return this._hoverPosition === 2 /* BELOW */ ? 0 /* BELOW */ : 1 /* ABOVE */; }
        get x() { return this._x; }
        get y() { return this._y; }
        render(container) {
            if (this._hoverPointer) {
                container === null || container === void 0 ? void 0 : container.appendChild(this._hoverPointer);
            }
            if (this._hover.containerDomNode.parentElement !== container) {
                container === null || container === void 0 ? void 0 : container.appendChild(this._hover.containerDomNode);
            }
            this.layout();
        }
        layout() {
            this._hover.containerDomNode.classList.remove('right-aligned');
            this._hover.contentsDomNode.style.maxHeight = '';
            const targetBounds = this._target.targetElements.map(e => e.getBoundingClientRect());
            const top = Math.min(...targetBounds.map(e => e.top));
            const right = Math.max(...targetBounds.map(e => e.right));
            const bottom = Math.max(...targetBounds.map(e => e.bottom));
            const left = Math.min(...targetBounds.map(e => e.left));
            const width = right - left;
            const height = bottom - top;
            const targetRect = {
                top, right, bottom, left, width, height,
                center: {
                    x: left + (width / 2),
                    y: top + (height / 2)
                }
            };
            this.adjustHorizontalHoverPosition(targetRect);
            this.adjustVerticalHoverPosition(targetRect);
            this.computeXCordinate(targetRect);
            this.computeYCordinate(targetRect);
            if (this._hoverPointer) {
                // reset
                this._hoverPointer.classList.remove('top');
                this._hoverPointer.classList.remove('left');
                this._hoverPointer.classList.remove('right');
                this._hoverPointer.classList.remove('bottom');
                this.setHoverPointerPosition(targetRect);
            }
            this._hover.onContentsChanged();
        }
        computeXCordinate(target) {
            if (this._target.x !== undefined) {
                this._x = this._target.x;
            }
            else if (this._hoverPosition === 1 /* RIGHT */) {
                this._x = target.right;
            }
            else if (this._hoverPosition === 0 /* LEFT */) {
                this._x = target.left;
            }
            else {
                if (this._hoverPointer) {
                    this._x = target.center.x - (this._hover.containerDomNode.clientWidth / 2);
                }
                else {
                    if (target.left + this._hover.containerDomNode.clientWidth >= document.documentElement.clientWidth) {
                        this._hover.containerDomNode.classList.add('right-aligned');
                        this._x = document.documentElement.clientWidth - this._workbenchLayoutService.getWindowBorderWidth() - 1;
                    }
                    else {
                        this._x = target.left;
                    }
                }
            }
            // Hover on left is going beyond window
            if (this._x < document.documentElement.clientLeft) {
                this._x = target.left;
            }
        }
        computeYCordinate(target) {
            if (this._target.y !== undefined) {
                this._y = this._target.y;
            }
            else if (this._hoverPosition === 3 /* ABOVE */) {
                this._y = target.top;
            }
            else if (this._hoverPosition === 2 /* BELOW */) {
                this._y = target.bottom - 2;
            }
            else {
                if (this._hoverPointer) {
                    this._y = target.center.y + (this._hover.containerDomNode.clientHeight / 2);
                }
                else {
                    this._y = target.bottom;
                }
            }
            // Hover on bottom is going beyond window
            if (this._y > window.innerHeight) {
                this._y = target.bottom;
            }
        }
        adjustHorizontalHoverPosition(target) {
            // Do not adjust horizontal hover position if x cordiante is provided
            if (this._target.x !== undefined) {
                return;
            }
            // Position hover on right to target
            if (this._hoverPosition === 1 /* RIGHT */) {
                // Hover on the right is going beyond window.
                if (target.right + this._hover.containerDomNode.clientWidth >= document.documentElement.clientWidth) {
                    this._hoverPosition = 0 /* LEFT */;
                }
            }
            // Position hover on left to target
            if (this._hoverPosition === 0 /* LEFT */) {
                // Hover on the left is going beyond window.
                if (target.left - this._hover.containerDomNode.clientWidth <= document.documentElement.clientLeft) {
                    this._hoverPosition = 1 /* RIGHT */;
                }
            }
        }
        adjustVerticalHoverPosition(target) {
            // Do not adjust vertical hover position if y cordiante is provided
            if (this._target.y !== undefined) {
                return;
            }
            // Position hover on top of the target
            if (this._hoverPosition === 3 /* ABOVE */) {
                // Hover on top is going beyond window
                if (target.top - this._hover.containerDomNode.clientHeight < 0) {
                    this._hoverPosition = 2 /* BELOW */;
                }
            }
            // Position hover below the target
            else if (this._hoverPosition === 2 /* BELOW */) {
                // Hover on bottom is going beyond window
                if (target.bottom + this._hover.containerDomNode.clientHeight > window.innerHeight) {
                    this._hoverPosition = 3 /* ABOVE */;
                }
            }
        }
        setHoverPointerPosition(target) {
            if (!this._hoverPointer) {
                return;
            }
            switch (this._hoverPosition) {
                case 0 /* LEFT */:
                case 1 /* RIGHT */:
                    this._hoverPointer.classList.add(this._hoverPosition === 0 /* LEFT */ ? 'right' : 'left');
                    const hoverHeight = this._hover.containerDomNode.clientHeight;
                    // If hover is taller than target and aligned with target's bottom, then show the pointer at the center of target
                    if (hoverHeight > target.height && this._y === target.bottom) {
                        this._hoverPointer.style.top = `${target.center.y - target.top - 3}px`;
                    }
                    // Otherwise show the pointer at the center of hover
                    else {
                        this._hoverPointer.style.top = `${Math.round((hoverHeight / 2)) - 3}px`;
                    }
                    break;
                case 3 /* ABOVE */:
                case 2 /* BELOW */:
                    this._hoverPointer.classList.add(this._hoverPosition === 3 /* ABOVE */ ? 'bottom' : 'top');
                    const hoverWidth = this._hover.containerDomNode.clientWidth;
                    // If hover is wider than target and aligned with target's left, then show the pointer at the center of target
                    if (hoverWidth > target.width && this._x === target.left) {
                        this._hoverPointer.style.left = `${target.center.x - target.left - 3}px`;
                    }
                    // Otherwise show the pointer at the center of hover
                    else {
                        this._hoverPointer.style.left = `${Math.round((hoverWidth / 2)) - 3}px`;
                    }
                    break;
            }
        }
        focus() {
            this._hover.containerDomNode.focus();
        }
        hide() {
            this.dispose();
        }
        dispose() {
            var _a, _b;
            if (!this._isDisposed) {
                this._onDispose.fire();
                if (this._hoverPointer) {
                    (_a = this._hoverPointer.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(this._hoverPointer);
                }
                (_b = this._hover.containerDomNode.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(this._hover.containerDomNode);
                this._messageListeners.dispose();
                this._target.dispose();
                super.dispose();
            }
            this._isDisposed = true;
        }
    };
    HoverWidget = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, opener_1.IOpenerService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, instantiation_1.IInstantiationService)
    ], HoverWidget);
    exports.HoverWidget = HoverWidget;
    class CompositeMouseTracker extends widget_1.Widget {
        constructor(_elements) {
            super();
            this._elements = _elements;
            this._isMouseIn = false;
            this._onMouseOut = new event_1.Emitter();
            this._elements.forEach(n => this.onmouseover(n, () => this._onTargetMouseOver()));
            this._elements.forEach(n => this.onnonbubblingmouseout(n, () => this._onTargetMouseOut()));
        }
        get onMouseOut() { return this._onMouseOut.event; }
        _onTargetMouseOver() {
            this._isMouseIn = true;
            this._clearEvaluateMouseStateTimeout();
        }
        _onTargetMouseOut() {
            this._isMouseIn = false;
            this._evaluateMouseState();
        }
        _evaluateMouseState() {
            this._clearEvaluateMouseStateTimeout();
            // Evaluate whether the mouse is still outside asynchronously such that other mouse targets
            // have the opportunity to first their mouse in event.
            this._mouseTimeout = window.setTimeout(() => this._fireIfMouseOutside(), 0);
        }
        _clearEvaluateMouseStateTimeout() {
            if (this._mouseTimeout) {
                clearTimeout(this._mouseTimeout);
                this._mouseTimeout = undefined;
            }
        }
        _fireIfMouseOutside() {
            if (!this._isMouseIn) {
                this._onMouseOut.fire();
            }
        }
    }
    class ElementHoverTarget {
        constructor(_element) {
            this._element = _element;
            this.targetElements = [this._element];
        }
        dispose() {
        }
    }
});
//# sourceMappingURL=hoverWidget.js.map