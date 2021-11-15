/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/network", "vs/base/browser/canIUse", "vs/base/common/insane/insane"], function (require, exports, browser, event_1, keyboardEvent_1, mouseEvent_1, async_1, errors_1, event_2, lifecycle_1, platform, uri_1, network_1, canIUse_1, insane_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCookieValue = exports.ModifierKeyEmitter = exports.WebFileSystemAccess = exports.multibyteAwareBtoa = exports.safeInnerHtml = exports.detectFullscreen = exports.DetectedFullscreenMode = exports.triggerDownload = exports.asCSSPropertyValue = exports.asCSSUrl = exports.animate = exports.windowOpenNoOpener = exports.computeScreenAwareSize = exports.domContentLoaded = exports.finalHandler = exports.getElementsByTagName = exports.removeTabIndexAndUpdateFocus = exports.hide = exports.show = exports.join = exports.$ = exports.Namespace = exports.reset = exports.prepend = exports.append = exports.after = exports.trackFocus = exports.restoreParentsScrollTop = exports.saveParentsScrollTop = exports.EventHelper = exports.EventType = exports.isHTMLElement = exports.removeCSSRulesContainingSelector = exports.createCSSRule = exports.createMetaElement = exports.createStyleSheet = exports.getActiveElement = exports.getShadowRoot = exports.isInShadowDOM = exports.isShadowRoot = exports.hasParentWithClass = exports.findParentWithClass = exports.isAncestorUsingFlowTo = exports.setParentFlowTo = exports.isAncestor = exports.getLargestChildWidth = exports.getTotalHeight = exports.getContentHeight = exports.getTotalScrollWidth = exports.getContentWidth = exports.getTotalWidth = exports.StandardWindow = exports.getDomNodePagePosition = exports.position = exports.size = exports.getTopLeftOffset = exports.Dimension = exports.getClientArea = exports.getComputedStyle = exports.addDisposableThrottledListener = exports.modify = exports.measure = exports.scheduleAtNextAnimationFrame = exports.runAtThisOrScheduleAtNextAnimationFrame = exports.addDisposableNonBubblingPointerOutListener = exports.addDisposableNonBubblingMouseOutListener = exports.addDisposableGenericMouseUpListner = exports.addDisposableGenericMouseMoveListner = exports.addDisposableGenericMouseDownListner = exports.addStandardDisposableGenericMouseUpListner = exports.addStandardDisposableGenericMouseDownListner = exports.addStandardDisposableListener = exports.addDisposableListener = exports.isInDOM = exports.clearNode = void 0;
    function clearNode(node) {
        while (node.firstChild) {
            node.firstChild.remove();
        }
    }
    exports.clearNode = clearNode;
    /**
     * @deprecated Use node.isConnected directly
     */
    function isInDOM(node) {
        var _a;
        return (_a = node === null || node === void 0 ? void 0 : node.isConnected) !== null && _a !== void 0 ? _a : false;
    }
    exports.isInDOM = isInDOM;
    class DomListener {
        constructor(node, type, handler, options) {
            this._node = node;
            this._type = type;
            this._handler = handler;
            this._options = (options || false);
            this._node.addEventListener(this._type, this._handler, this._options);
        }
        dispose() {
            if (!this._handler) {
                // Already disposed
                return;
            }
            this._node.removeEventListener(this._type, this._handler, this._options);
            // Prevent leakers from holding on to the dom or handler func
            this._node = null;
            this._handler = null;
        }
    }
    function addDisposableListener(node, type, handler, useCaptureOrOptions) {
        return new DomListener(node, type, handler, useCaptureOrOptions);
    }
    exports.addDisposableListener = addDisposableListener;
    function _wrapAsStandardMouseEvent(handler) {
        return function (e) {
            return handler(new mouseEvent_1.StandardMouseEvent(e));
        };
    }
    function _wrapAsStandardKeyboardEvent(handler) {
        return function (e) {
            return handler(new keyboardEvent_1.StandardKeyboardEvent(e));
        };
    }
    let addStandardDisposableListener = function addStandardDisposableListener(node, type, handler, useCapture) {
        let wrapHandler = handler;
        if (type === 'click' || type === 'mousedown') {
            wrapHandler = _wrapAsStandardMouseEvent(handler);
        }
        else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
            wrapHandler = _wrapAsStandardKeyboardEvent(handler);
        }
        return addDisposableListener(node, type, wrapHandler, useCapture);
    };
    exports.addStandardDisposableListener = addStandardDisposableListener;
    let addStandardDisposableGenericMouseDownListner = function addStandardDisposableListener(node, handler, useCapture) {
        let wrapHandler = _wrapAsStandardMouseEvent(handler);
        return addDisposableGenericMouseDownListner(node, wrapHandler, useCapture);
    };
    exports.addStandardDisposableGenericMouseDownListner = addStandardDisposableGenericMouseDownListner;
    let addStandardDisposableGenericMouseUpListner = function addStandardDisposableListener(node, handler, useCapture) {
        let wrapHandler = _wrapAsStandardMouseEvent(handler);
        return addDisposableGenericMouseUpListner(node, wrapHandler, useCapture);
    };
    exports.addStandardDisposableGenericMouseUpListner = addStandardDisposableGenericMouseUpListner;
    function addDisposableGenericMouseDownListner(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_DOWN : exports.EventType.MOUSE_DOWN, handler, useCapture);
    }
    exports.addDisposableGenericMouseDownListner = addDisposableGenericMouseDownListner;
    function addDisposableGenericMouseMoveListner(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_MOVE : exports.EventType.MOUSE_MOVE, handler, useCapture);
    }
    exports.addDisposableGenericMouseMoveListner = addDisposableGenericMouseMoveListner;
    function addDisposableGenericMouseUpListner(node, handler, useCapture) {
        return addDisposableListener(node, platform.isIOS && canIUse_1.BrowserFeatures.pointerEvents ? exports.EventType.POINTER_UP : exports.EventType.MOUSE_UP, handler, useCapture);
    }
    exports.addDisposableGenericMouseUpListner = addDisposableGenericMouseUpListner;
    function addDisposableNonBubblingMouseOutListener(node, handler) {
        return addDisposableListener(node, 'mouseout', (e) => {
            // Mouse out bubbles, so this is an attempt to ignore faux mouse outs coming from children elements
            let toElement = (e.relatedTarget);
            while (toElement && toElement !== node) {
                toElement = toElement.parentNode;
            }
            if (toElement === node) {
                return;
            }
            handler(e);
        });
    }
    exports.addDisposableNonBubblingMouseOutListener = addDisposableNonBubblingMouseOutListener;
    function addDisposableNonBubblingPointerOutListener(node, handler) {
        return addDisposableListener(node, 'pointerout', (e) => {
            // Mouse out bubbles, so this is an attempt to ignore faux mouse outs coming from children elements
            let toElement = (e.relatedTarget);
            while (toElement && toElement !== node) {
                toElement = toElement.parentNode;
            }
            if (toElement === node) {
                return;
            }
            handler(e);
        });
    }
    exports.addDisposableNonBubblingPointerOutListener = addDisposableNonBubblingPointerOutListener;
    let _animationFrame = null;
    function doRequestAnimationFrame(callback) {
        if (!_animationFrame) {
            const emulatedRequestAnimationFrame = (callback) => {
                return setTimeout(() => callback(new Date().getTime()), 0);
            };
            _animationFrame = (self.requestAnimationFrame
                || self.msRequestAnimationFrame
                || self.webkitRequestAnimationFrame
                || self.mozRequestAnimationFrame
                || self.oRequestAnimationFrame
                || emulatedRequestAnimationFrame);
        }
        return _animationFrame.call(self, callback);
    }
    class AnimationFrameQueueItem {
        constructor(runner, priority = 0) {
            this._runner = runner;
            this.priority = priority;
            this._canceled = false;
        }
        dispose() {
            this._canceled = true;
        }
        execute() {
            if (this._canceled) {
                return;
            }
            try {
                this._runner();
            }
            catch (e) {
                (0, errors_1.onUnexpectedError)(e);
            }
        }
        // Sort by priority (largest to lowest)
        static sort(a, b) {
            return b.priority - a.priority;
        }
    }
    (function () {
        /**
         * The runners scheduled at the next animation frame
         */
        let NEXT_QUEUE = [];
        /**
         * The runners scheduled at the current animation frame
         */
        let CURRENT_QUEUE = null;
        /**
         * A flag to keep track if the native requestAnimationFrame was already called
         */
        let animFrameRequested = false;
        /**
         * A flag to indicate if currently handling a native requestAnimationFrame callback
         */
        let inAnimationFrameRunner = false;
        let animationFrameRunner = () => {
            animFrameRequested = false;
            CURRENT_QUEUE = NEXT_QUEUE;
            NEXT_QUEUE = [];
            inAnimationFrameRunner = true;
            while (CURRENT_QUEUE.length > 0) {
                CURRENT_QUEUE.sort(AnimationFrameQueueItem.sort);
                let top = CURRENT_QUEUE.shift();
                top.execute();
            }
            inAnimationFrameRunner = false;
        };
        exports.scheduleAtNextAnimationFrame = (runner, priority = 0) => {
            let item = new AnimationFrameQueueItem(runner, priority);
            NEXT_QUEUE.push(item);
            if (!animFrameRequested) {
                animFrameRequested = true;
                doRequestAnimationFrame(animationFrameRunner);
            }
            return item;
        };
        exports.runAtThisOrScheduleAtNextAnimationFrame = (runner, priority) => {
            if (inAnimationFrameRunner) {
                let item = new AnimationFrameQueueItem(runner, priority);
                CURRENT_QUEUE.push(item);
                return item;
            }
            else {
                return (0, exports.scheduleAtNextAnimationFrame)(runner, priority);
            }
        };
    })();
    function measure(callback) {
        return (0, exports.scheduleAtNextAnimationFrame)(callback, 10000 /* must be early */);
    }
    exports.measure = measure;
    function modify(callback) {
        return (0, exports.scheduleAtNextAnimationFrame)(callback, -10000 /* must be late */);
    }
    exports.modify = modify;
    const MINIMUM_TIME_MS = 8;
    const DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
        return currentEvent;
    };
    class TimeoutThrottledDomListener extends lifecycle_1.Disposable {
        constructor(node, type, handler, eventMerger = DEFAULT_EVENT_MERGER, minimumTimeMs = MINIMUM_TIME_MS) {
            super();
            let lastEvent = null;
            let lastHandlerTime = 0;
            let timeout = this._register(new async_1.TimeoutTimer());
            let invokeHandler = () => {
                lastHandlerTime = (new Date()).getTime();
                handler(lastEvent);
                lastEvent = null;
            };
            this._register(addDisposableListener(node, type, (e) => {
                lastEvent = eventMerger(lastEvent, e);
                let elapsedTime = (new Date()).getTime() - lastHandlerTime;
                if (elapsedTime >= minimumTimeMs) {
                    timeout.cancel();
                    invokeHandler();
                }
                else {
                    timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
                }
            }));
        }
    }
    function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
        return new TimeoutThrottledDomListener(node, type, handler, eventMerger, minimumTimeMs);
    }
    exports.addDisposableThrottledListener = addDisposableThrottledListener;
    function getComputedStyle(el) {
        return document.defaultView.getComputedStyle(el, null);
    }
    exports.getComputedStyle = getComputedStyle;
    function getClientArea(element) {
        // Try with DOM clientWidth / clientHeight
        if (element !== document.body) {
            return new Dimension(element.clientWidth, element.clientHeight);
        }
        // If visual view port exits and it's on mobile, it should be used instead of window innerWidth / innerHeight, or document.body.clientWidth / document.body.clientHeight
        if (platform.isIOS && window.visualViewport) {
            const width = window.visualViewport.width;
            const height = window.visualViewport.height - (browser.isStandalone
                // in PWA mode, the visual viewport always includes the safe-area-inset-bottom (which is for the home indicator)
                // even when you are using the onscreen monitor, the visual viewport will include the area between system statusbar and the onscreen keyboard
                // plus the area between onscreen keyboard and the bottom bezel, which is 20px on iOS.
                ? (20 + 4) // + 4px for body margin
                : 0);
            return new Dimension(width, height);
        }
        // Try innerWidth / innerHeight
        if (window.innerWidth && window.innerHeight) {
            return new Dimension(window.innerWidth, window.innerHeight);
        }
        // Try with document.body.clientWidth / document.body.clientHeight
        if (document.body && document.body.clientWidth && document.body.clientHeight) {
            return new Dimension(document.body.clientWidth, document.body.clientHeight);
        }
        // Try with document.documentElement.clientWidth / document.documentElement.clientHeight
        if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientHeight) {
            return new Dimension(document.documentElement.clientWidth, document.documentElement.clientHeight);
        }
        throw new Error('Unable to figure out browser width and height');
    }
    exports.getClientArea = getClientArea;
    class SizeUtils {
        // Adapted from WinJS
        // Converts a CSS positioning string for the specified element to pixels.
        static convertToPixels(element, value) {
            return parseFloat(value) || 0;
        }
        static getDimension(element, cssPropertyName, jsPropertyName) {
            let computedStyle = getComputedStyle(element);
            let value = '0';
            if (computedStyle) {
                if (computedStyle.getPropertyValue) {
                    value = computedStyle.getPropertyValue(cssPropertyName);
                }
                else {
                    // IE8
                    value = computedStyle.getAttribute(jsPropertyName);
                }
            }
            return SizeUtils.convertToPixels(element, value);
        }
        static getBorderLeftWidth(element) {
            return SizeUtils.getDimension(element, 'border-left-width', 'borderLeftWidth');
        }
        static getBorderRightWidth(element) {
            return SizeUtils.getDimension(element, 'border-right-width', 'borderRightWidth');
        }
        static getBorderTopWidth(element) {
            return SizeUtils.getDimension(element, 'border-top-width', 'borderTopWidth');
        }
        static getBorderBottomWidth(element) {
            return SizeUtils.getDimension(element, 'border-bottom-width', 'borderBottomWidth');
        }
        static getPaddingLeft(element) {
            return SizeUtils.getDimension(element, 'padding-left', 'paddingLeft');
        }
        static getPaddingRight(element) {
            return SizeUtils.getDimension(element, 'padding-right', 'paddingRight');
        }
        static getPaddingTop(element) {
            return SizeUtils.getDimension(element, 'padding-top', 'paddingTop');
        }
        static getPaddingBottom(element) {
            return SizeUtils.getDimension(element, 'padding-bottom', 'paddingBottom');
        }
        static getMarginLeft(element) {
            return SizeUtils.getDimension(element, 'margin-left', 'marginLeft');
        }
        static getMarginTop(element) {
            return SizeUtils.getDimension(element, 'margin-top', 'marginTop');
        }
        static getMarginRight(element) {
            return SizeUtils.getDimension(element, 'margin-right', 'marginRight');
        }
        static getMarginBottom(element) {
            return SizeUtils.getDimension(element, 'margin-bottom', 'marginBottom');
        }
    }
    class Dimension {
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }
        with(width = this.width, height = this.height) {
            if (width !== this.width || height !== this.height) {
                return new Dimension(width, height);
            }
            else {
                return this;
            }
        }
        static is(obj) {
            return typeof obj === 'object' && typeof obj.height === 'number' && typeof obj.width === 'number';
        }
        static lift(obj) {
            if (obj instanceof Dimension) {
                return obj;
            }
            else {
                return new Dimension(obj.width, obj.height);
            }
        }
        static equals(a, b) {
            if (a === b) {
                return true;
            }
            if (!a || !b) {
                return false;
            }
            return a.width === b.width && a.height === b.height;
        }
    }
    exports.Dimension = Dimension;
    Dimension.None = new Dimension(0, 0);
    function getTopLeftOffset(element) {
        // Adapted from WinJS.Utilities.getPosition
        // and added borders to the mix
        let offsetParent = element.offsetParent;
        let top = element.offsetTop;
        let left = element.offsetLeft;
        while ((element = element.parentNode) !== null
            && element !== document.body
            && element !== document.documentElement) {
            top -= element.scrollTop;
            const c = isShadowRoot(element) ? null : getComputedStyle(element);
            if (c) {
                left -= c.direction !== 'rtl' ? element.scrollLeft : -element.scrollLeft;
            }
            if (element === offsetParent) {
                left += SizeUtils.getBorderLeftWidth(element);
                top += SizeUtils.getBorderTopWidth(element);
                top += element.offsetTop;
                left += element.offsetLeft;
                offsetParent = element.offsetParent;
            }
        }
        return {
            left: left,
            top: top
        };
    }
    exports.getTopLeftOffset = getTopLeftOffset;
    function size(element, width, height) {
        if (typeof width === 'number') {
            element.style.width = `${width}px`;
        }
        if (typeof height === 'number') {
            element.style.height = `${height}px`;
        }
    }
    exports.size = size;
    function position(element, top, right, bottom, left, position = 'absolute') {
        if (typeof top === 'number') {
            element.style.top = `${top}px`;
        }
        if (typeof right === 'number') {
            element.style.right = `${right}px`;
        }
        if (typeof bottom === 'number') {
            element.style.bottom = `${bottom}px`;
        }
        if (typeof left === 'number') {
            element.style.left = `${left}px`;
        }
        element.style.position = position;
    }
    exports.position = position;
    /**
     * Returns the position of a dom node relative to the entire page.
     */
    function getDomNodePagePosition(domNode) {
        let bb = domNode.getBoundingClientRect();
        return {
            left: bb.left + exports.StandardWindow.scrollX,
            top: bb.top + exports.StandardWindow.scrollY,
            width: bb.width,
            height: bb.height
        };
    }
    exports.getDomNodePagePosition = getDomNodePagePosition;
    exports.StandardWindow = new class {
        get scrollX() {
            if (typeof window.scrollX === 'number') {
                // modern browsers
                return window.scrollX;
            }
            else {
                return document.body.scrollLeft + document.documentElement.scrollLeft;
            }
        }
        get scrollY() {
            if (typeof window.scrollY === 'number') {
                // modern browsers
                return window.scrollY;
            }
            else {
                return document.body.scrollTop + document.documentElement.scrollTop;
            }
        }
    };
    // Adapted from WinJS
    // Gets the width of the element, including margins.
    function getTotalWidth(element) {
        let margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.offsetWidth + margin;
    }
    exports.getTotalWidth = getTotalWidth;
    function getContentWidth(element) {
        let border = SizeUtils.getBorderLeftWidth(element) + SizeUtils.getBorderRightWidth(element);
        let padding = SizeUtils.getPaddingLeft(element) + SizeUtils.getPaddingRight(element);
        return element.offsetWidth - border - padding;
    }
    exports.getContentWidth = getContentWidth;
    function getTotalScrollWidth(element) {
        let margin = SizeUtils.getMarginLeft(element) + SizeUtils.getMarginRight(element);
        return element.scrollWidth + margin;
    }
    exports.getTotalScrollWidth = getTotalScrollWidth;
    // Adapted from WinJS
    // Gets the height of the content of the specified element. The content height does not include borders or padding.
    function getContentHeight(element) {
        let border = SizeUtils.getBorderTopWidth(element) + SizeUtils.getBorderBottomWidth(element);
        let padding = SizeUtils.getPaddingTop(element) + SizeUtils.getPaddingBottom(element);
        return element.offsetHeight - border - padding;
    }
    exports.getContentHeight = getContentHeight;
    // Adapted from WinJS
    // Gets the height of the element, including its margins.
    function getTotalHeight(element) {
        let margin = SizeUtils.getMarginTop(element) + SizeUtils.getMarginBottom(element);
        return element.offsetHeight + margin;
    }
    exports.getTotalHeight = getTotalHeight;
    // Gets the left coordinate of the specified element relative to the specified parent.
    function getRelativeLeft(element, parent) {
        if (element === null) {
            return 0;
        }
        let elementPosition = getTopLeftOffset(element);
        let parentPosition = getTopLeftOffset(parent);
        return elementPosition.left - parentPosition.left;
    }
    function getLargestChildWidth(parent, children) {
        let childWidths = children.map((child) => {
            return Math.max(getTotalScrollWidth(child), getTotalWidth(child)) + getRelativeLeft(child, parent) || 0;
        });
        let maxWidth = Math.max(...childWidths);
        return maxWidth;
    }
    exports.getLargestChildWidth = getLargestChildWidth;
    // ----------------------------------------------------------------------------------------
    function isAncestor(testChild, testAncestor) {
        while (testChild) {
            if (testChild === testAncestor) {
                return true;
            }
            testChild = testChild.parentNode;
        }
        return false;
    }
    exports.isAncestor = isAncestor;
    const parentFlowToDataKey = 'parentFlowToElementId';
    /**
     * Set an explicit parent to use for nodes that are not part of the
     * regular dom structure.
     */
    function setParentFlowTo(fromChildElement, toParentElement) {
        fromChildElement.dataset[parentFlowToDataKey] = toParentElement.id;
    }
    exports.setParentFlowTo = setParentFlowTo;
    function getParentFlowToElement(node) {
        const flowToParentId = node.dataset[parentFlowToDataKey];
        if (typeof flowToParentId === 'string') {
            return document.getElementById(flowToParentId);
        }
        return null;
    }
    /**
     * Check if `testAncestor` is an ancessor of `testChild`, observing the explicit
     * parents set by `setParentFlowTo`.
     */
    function isAncestorUsingFlowTo(testChild, testAncestor) {
        let node = testChild;
        while (node) {
            if (node === testAncestor) {
                return true;
            }
            if (node instanceof HTMLElement) {
                const flowToParentElement = getParentFlowToElement(node);
                if (flowToParentElement) {
                    node = flowToParentElement;
                    continue;
                }
            }
            node = node.parentNode;
        }
        return false;
    }
    exports.isAncestorUsingFlowTo = isAncestorUsingFlowTo;
    function findParentWithClass(node, clazz, stopAtClazzOrNode) {
        while (node && node.nodeType === node.ELEMENT_NODE) {
            if (node.classList.contains(clazz)) {
                return node;
            }
            if (stopAtClazzOrNode) {
                if (typeof stopAtClazzOrNode === 'string') {
                    if (node.classList.contains(stopAtClazzOrNode)) {
                        return null;
                    }
                }
                else {
                    if (node === stopAtClazzOrNode) {
                        return null;
                    }
                }
            }
            node = node.parentNode;
        }
        return null;
    }
    exports.findParentWithClass = findParentWithClass;
    function hasParentWithClass(node, clazz, stopAtClazzOrNode) {
        return !!findParentWithClass(node, clazz, stopAtClazzOrNode);
    }
    exports.hasParentWithClass = hasParentWithClass;
    function isShadowRoot(node) {
        return (node && !!node.host && !!node.mode);
    }
    exports.isShadowRoot = isShadowRoot;
    function isInShadowDOM(domNode) {
        return !!getShadowRoot(domNode);
    }
    exports.isInShadowDOM = isInShadowDOM;
    function getShadowRoot(domNode) {
        while (domNode.parentNode) {
            if (domNode === document.body) {
                // reached the body
                return null;
            }
            domNode = domNode.parentNode;
        }
        return isShadowRoot(domNode) ? domNode : null;
    }
    exports.getShadowRoot = getShadowRoot;
    function getActiveElement() {
        let result = document.activeElement;
        while (result === null || result === void 0 ? void 0 : result.shadowRoot) {
            result = result.shadowRoot.activeElement;
        }
        return result;
    }
    exports.getActiveElement = getActiveElement;
    function createStyleSheet(container = document.getElementsByTagName('head')[0]) {
        let style = document.createElement('style');
        style.type = 'text/css';
        style.media = 'screen';
        container.appendChild(style);
        return style;
    }
    exports.createStyleSheet = createStyleSheet;
    function createMetaElement(container = document.getElementsByTagName('head')[0]) {
        let meta = document.createElement('meta');
        container.appendChild(meta);
        return meta;
    }
    exports.createMetaElement = createMetaElement;
    let _sharedStyleSheet = null;
    function getSharedStyleSheet() {
        if (!_sharedStyleSheet) {
            _sharedStyleSheet = createStyleSheet();
        }
        return _sharedStyleSheet;
    }
    function getDynamicStyleSheetRules(style) {
        var _a, _b;
        if ((_a = style === null || style === void 0 ? void 0 : style.sheet) === null || _a === void 0 ? void 0 : _a.rules) {
            // Chrome, IE
            return style.sheet.rules;
        }
        if ((_b = style === null || style === void 0 ? void 0 : style.sheet) === null || _b === void 0 ? void 0 : _b.cssRules) {
            // FF
            return style.sheet.cssRules;
        }
        return [];
    }
    function createCSSRule(selector, cssText, style = getSharedStyleSheet()) {
        if (!style || !cssText) {
            return;
        }
        style.sheet.insertRule(selector + '{' + cssText + '}', 0);
    }
    exports.createCSSRule = createCSSRule;
    function removeCSSRulesContainingSelector(ruleName, style = getSharedStyleSheet()) {
        if (!style) {
            return;
        }
        let rules = getDynamicStyleSheetRules(style);
        let toDelete = [];
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            if (rule.selectorText.indexOf(ruleName) !== -1) {
                toDelete.push(i);
            }
        }
        for (let i = toDelete.length - 1; i >= 0; i--) {
            style.sheet.deleteRule(toDelete[i]);
        }
    }
    exports.removeCSSRulesContainingSelector = removeCSSRulesContainingSelector;
    function isHTMLElement(o) {
        if (typeof HTMLElement === 'object') {
            return o instanceof HTMLElement;
        }
        return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
    }
    exports.isHTMLElement = isHTMLElement;
    exports.EventType = {
        // Mouse
        CLICK: 'click',
        AUXCLICK: 'auxclick',
        DBLCLICK: 'dblclick',
        MOUSE_UP: 'mouseup',
        MOUSE_DOWN: 'mousedown',
        MOUSE_OVER: 'mouseover',
        MOUSE_MOVE: 'mousemove',
        MOUSE_OUT: 'mouseout',
        MOUSE_ENTER: 'mouseenter',
        MOUSE_LEAVE: 'mouseleave',
        MOUSE_WHEEL: 'wheel',
        POINTER_UP: 'pointerup',
        POINTER_DOWN: 'pointerdown',
        POINTER_MOVE: 'pointermove',
        CONTEXT_MENU: 'contextmenu',
        WHEEL: 'wheel',
        // Keyboard
        KEY_DOWN: 'keydown',
        KEY_PRESS: 'keypress',
        KEY_UP: 'keyup',
        // HTML Document
        LOAD: 'load',
        BEFORE_UNLOAD: 'beforeunload',
        UNLOAD: 'unload',
        ABORT: 'abort',
        ERROR: 'error',
        RESIZE: 'resize',
        SCROLL: 'scroll',
        FULLSCREEN_CHANGE: 'fullscreenchange',
        WK_FULLSCREEN_CHANGE: 'webkitfullscreenchange',
        // Form
        SELECT: 'select',
        CHANGE: 'change',
        SUBMIT: 'submit',
        RESET: 'reset',
        FOCUS: 'focus',
        FOCUS_IN: 'focusin',
        FOCUS_OUT: 'focusout',
        BLUR: 'blur',
        INPUT: 'input',
        // Local Storage
        STORAGE: 'storage',
        // Drag
        DRAG_START: 'dragstart',
        DRAG: 'drag',
        DRAG_ENTER: 'dragenter',
        DRAG_LEAVE: 'dragleave',
        DRAG_OVER: 'dragover',
        DROP: 'drop',
        DRAG_END: 'dragend',
        // Animation
        ANIMATION_START: browser.isWebKit ? 'webkitAnimationStart' : 'animationstart',
        ANIMATION_END: browser.isWebKit ? 'webkitAnimationEnd' : 'animationend',
        ANIMATION_ITERATION: browser.isWebKit ? 'webkitAnimationIteration' : 'animationiteration'
    };
    exports.EventHelper = {
        stop: function (e, cancelBubble) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            else {
                // IE8
                e.returnValue = false;
            }
            if (cancelBubble) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                else {
                    // IE8
                    e.cancelBubble = true;
                }
            }
        }
    };
    function saveParentsScrollTop(node) {
        let r = [];
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            r[i] = node.scrollTop;
            node = node.parentNode;
        }
        return r;
    }
    exports.saveParentsScrollTop = saveParentsScrollTop;
    function restoreParentsScrollTop(node, state) {
        for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
            if (node.scrollTop !== state[i]) {
                node.scrollTop = state[i];
            }
            node = node.parentNode;
        }
    }
    exports.restoreParentsScrollTop = restoreParentsScrollTop;
    class FocusTracker extends lifecycle_1.Disposable {
        constructor(element) {
            super();
            this._onDidFocus = this._register(new event_2.Emitter());
            this.onDidFocus = this._onDidFocus.event;
            this._onDidBlur = this._register(new event_2.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            let hasFocus = isAncestor(document.activeElement, element);
            let loosingFocus = false;
            const onFocus = () => {
                loosingFocus = false;
                if (!hasFocus) {
                    hasFocus = true;
                    this._onDidFocus.fire();
                }
            };
            const onBlur = () => {
                if (hasFocus) {
                    loosingFocus = true;
                    window.setTimeout(() => {
                        if (loosingFocus) {
                            loosingFocus = false;
                            hasFocus = false;
                            this._onDidBlur.fire();
                        }
                    }, 0);
                }
            };
            this._refreshStateHandler = () => {
                let currentNodeHasFocus = isAncestor(document.activeElement, element);
                if (currentNodeHasFocus !== hasFocus) {
                    if (hasFocus) {
                        onBlur();
                    }
                    else {
                        onFocus();
                    }
                }
            };
            this._register((0, event_1.domEvent)(element, exports.EventType.FOCUS, true)(onFocus));
            this._register((0, event_1.domEvent)(element, exports.EventType.BLUR, true)(onBlur));
        }
        refreshState() {
            this._refreshStateHandler();
        }
    }
    function trackFocus(element) {
        return new FocusTracker(element);
    }
    exports.trackFocus = trackFocus;
    function after(sibling, child) {
        sibling.after(child);
        return child;
    }
    exports.after = after;
    function append(parent, ...children) {
        parent.append(...children);
        if (children.length === 1 && typeof children[0] !== 'string') {
            return children[0];
        }
    }
    exports.append = append;
    function prepend(parent, child) {
        parent.insertBefore(child, parent.firstChild);
        return child;
    }
    exports.prepend = prepend;
    /**
     * Removes all children from `parent` and appends `children`
     */
    function reset(parent, ...children) {
        parent.innerText = '';
        append(parent, ...children);
    }
    exports.reset = reset;
    const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
    var Namespace;
    (function (Namespace) {
        Namespace["HTML"] = "http://www.w3.org/1999/xhtml";
        Namespace["SVG"] = "http://www.w3.org/2000/svg";
    })(Namespace = exports.Namespace || (exports.Namespace = {}));
    function _$(namespace, description, attrs, ...children) {
        let match = SELECTOR_REGEX.exec(description);
        if (!match) {
            throw new Error('Bad use of emmet');
        }
        attrs = Object.assign({}, (attrs || {}));
        let tagName = match[1] || 'div';
        let result;
        if (namespace !== Namespace.HTML) {
            result = document.createElementNS(namespace, tagName);
        }
        else {
            result = document.createElement(tagName);
        }
        if (match[3]) {
            result.id = match[3];
        }
        if (match[4]) {
            result.className = match[4].replace(/\./g, ' ').trim();
        }
        Object.keys(attrs).forEach(name => {
            const value = attrs[name];
            if (typeof value === 'undefined') {
                return;
            }
            if (/^on\w+$/.test(name)) {
                result[name] = value;
            }
            else if (name === 'selected') {
                if (value) {
                    result.setAttribute(name, 'true');
                }
            }
            else {
                result.setAttribute(name, value);
            }
        });
        result.append(...children);
        return result;
    }
    function $(description, attrs, ...children) {
        return _$(Namespace.HTML, description, attrs, ...children);
    }
    exports.$ = $;
    $.SVG = function (description, attrs, ...children) {
        return _$(Namespace.SVG, description, attrs, ...children);
    };
    function join(nodes, separator) {
        const result = [];
        nodes.forEach((node, index) => {
            if (index > 0) {
                if (separator instanceof Node) {
                    result.push(separator.cloneNode());
                }
                else {
                    result.push(document.createTextNode(separator));
                }
            }
            result.push(node);
        });
        return result;
    }
    exports.join = join;
    function show(...elements) {
        for (let element of elements) {
            element.style.display = '';
            element.removeAttribute('aria-hidden');
        }
    }
    exports.show = show;
    function hide(...elements) {
        for (let element of elements) {
            element.style.display = 'none';
            element.setAttribute('aria-hidden', 'true');
        }
    }
    exports.hide = hide;
    function findParentWithAttribute(node, attribute) {
        while (node && node.nodeType === node.ELEMENT_NODE) {
            if (node instanceof HTMLElement && node.hasAttribute(attribute)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }
    function removeTabIndexAndUpdateFocus(node) {
        if (!node || !node.hasAttribute('tabIndex')) {
            return;
        }
        // If we are the currently focused element and tabIndex is removed,
        // standard DOM behavior is to move focus to the <body> element. We
        // typically never want that, rather put focus to the closest element
        // in the hierarchy of the parent DOM nodes.
        if (document.activeElement === node) {
            let parentFocusable = findParentWithAttribute(node.parentElement, 'tabIndex');
            if (parentFocusable) {
                parentFocusable.focus();
            }
        }
        node.removeAttribute('tabindex');
    }
    exports.removeTabIndexAndUpdateFocus = removeTabIndexAndUpdateFocus;
    function getElementsByTagName(tag) {
        return Array.prototype.slice.call(document.getElementsByTagName(tag), 0);
    }
    exports.getElementsByTagName = getElementsByTagName;
    function finalHandler(fn) {
        return e => {
            e.preventDefault();
            e.stopPropagation();
            fn(e);
        };
    }
    exports.finalHandler = finalHandler;
    function domContentLoaded() {
        return new Promise(resolve => {
            const readyState = document.readyState;
            if (readyState === 'complete' || (document && document.body !== null)) {
                platform.setImmediate(resolve);
            }
            else {
                window.addEventListener('DOMContentLoaded', resolve, false);
            }
        });
    }
    exports.domContentLoaded = domContentLoaded;
    /**
     * Find a value usable for a dom node size such that the likelihood that it would be
     * displayed with constant screen pixels size is as high as possible.
     *
     * e.g. We would desire for the cursors to be 2px (CSS px) wide. Under a devicePixelRatio
     * of 1.25, the cursor will be 2.5 screen pixels wide. Depending on how the dom node aligns/"snaps"
     * with the screen pixels, it will sometimes be rendered with 2 screen pixels, and sometimes with 3 screen pixels.
     */
    function computeScreenAwareSize(cssPx) {
        const screenPx = window.devicePixelRatio * cssPx;
        return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
    }
    exports.computeScreenAwareSize = computeScreenAwareSize;
    /**
     * See https://github.com/microsoft/monaco-editor/issues/601
     * To protect against malicious code in the linked site, particularly phishing attempts,
     * the window.opener should be set to null to prevent the linked site from having access
     * to change the location of the current page.
     * See https://mathiasbynens.github.io/rel-noopener/
     */
    function windowOpenNoOpener(url) {
        if (browser.isElectron || browser.isEdgeLegacyWebView) {
            // In VSCode, window.open() always returns null...
            // The same is true for a WebView (see https://github.com/microsoft/monaco-editor/issues/628)
            // Also call directly window.open in sandboxed Electron (see https://github.com/microsoft/monaco-editor/issues/2220)
            window.open(url);
            return true;
        }
        else {
            let newTab = window.open();
            if (newTab) {
                newTab.opener = null;
                newTab.location.href = url;
                return true;
            }
            return false;
        }
    }
    exports.windowOpenNoOpener = windowOpenNoOpener;
    function animate(fn) {
        const step = () => {
            fn();
            stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
        };
        let stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
        return (0, lifecycle_1.toDisposable)(() => stepDisposable.dispose());
    }
    exports.animate = animate;
    network_1.RemoteAuthorities.setPreferredWebSchema(/^https:/.test(window.location.href) ? 'https' : 'http');
    /**
     * returns url('...')
     */
    function asCSSUrl(uri) {
        if (!uri) {
            return `url('')`;
        }
        return `url('${network_1.FileAccess.asBrowserUri(uri).toString(true).replace(/'/g, '%27')}')`;
    }
    exports.asCSSUrl = asCSSUrl;
    function asCSSPropertyValue(value) {
        return `'${value.replace(/'/g, '%27')}'`;
    }
    exports.asCSSPropertyValue = asCSSPropertyValue;
    function triggerDownload(dataOrUri, name) {
        // If the data is provided as Buffer, we create a
        // blob URL out of it to produce a valid link
        let url;
        if (uri_1.URI.isUri(dataOrUri)) {
            url = dataOrUri.toString(true);
        }
        else {
            const blob = new Blob([dataOrUri]);
            url = URL.createObjectURL(blob);
            // Ensure to free the data from DOM eventually
            setTimeout(() => URL.revokeObjectURL(url));
        }
        // In order to download from the browser, the only way seems
        // to be creating a <a> element with download attribute that
        // points to the file to download.
        // See also https://developers.google.com/web/updates/2011/08/Downloading-resources-in-HTML5-a-download
        const anchor = document.createElement('a');
        document.body.appendChild(anchor);
        anchor.download = name;
        anchor.href = url;
        anchor.click();
        // Ensure to remove the element from DOM eventually
        setTimeout(() => document.body.removeChild(anchor));
    }
    exports.triggerDownload = triggerDownload;
    var DetectedFullscreenMode;
    (function (DetectedFullscreenMode) {
        /**
         * The document is fullscreen, e.g. because an element
         * in the document requested to be fullscreen.
         */
        DetectedFullscreenMode[DetectedFullscreenMode["DOCUMENT"] = 1] = "DOCUMENT";
        /**
         * The browser is fullsreen, e.g. because the user enabled
         * native window fullscreen for it.
         */
        DetectedFullscreenMode[DetectedFullscreenMode["BROWSER"] = 2] = "BROWSER";
    })(DetectedFullscreenMode = exports.DetectedFullscreenMode || (exports.DetectedFullscreenMode = {}));
    function detectFullscreen() {
        // Browser fullscreen: use DOM APIs to detect
        if (document.fullscreenElement || document.webkitFullscreenElement || document.webkitIsFullScreen) {
            return { mode: DetectedFullscreenMode.DOCUMENT, guess: false };
        }
        // There is no standard way to figure out if the browser
        // is using native fullscreen. Via checking on screen
        // height and comparing that to window height, we can guess
        // it though.
        if (window.innerHeight === screen.height) {
            // if the height of the window matches the screen height, we can
            // safely assume that the browser is fullscreen because no browser
            // chrome is taking height away (e.g. like toolbars).
            return { mode: DetectedFullscreenMode.BROWSER, guess: false };
        }
        if (platform.isMacintosh || platform.isLinux) {
            // macOS and Linux do not properly report `innerHeight`, only Windows does
            if (window.outerHeight === screen.height && window.outerWidth === screen.width) {
                // if the height of the browser matches the screen height, we can
                // only guess that we are in fullscreen. It is also possible that
                // the user has turned off taskbars in the OS and the browser is
                // simply able to span the entire size of the screen.
                return { mode: DetectedFullscreenMode.BROWSER, guess: true };
            }
        }
        // Not in fullscreen
        return null;
    }
    exports.detectFullscreen = detectFullscreen;
    // -- sanitize and trusted html
    function _extInsaneOptions(opts, allowedAttributesForAll) {
        var _a;
        let allowedAttributes = (_a = opts.allowedAttributes) !== null && _a !== void 0 ? _a : {};
        if (opts.allowedTags) {
            for (let tag of opts.allowedTags) {
                let array = allowedAttributes[tag];
                if (!array) {
                    array = allowedAttributesForAll;
                }
                else {
                    array = array.concat(allowedAttributesForAll);
                }
                allowedAttributes[tag] = array;
            }
        }
        return Object.assign(Object.assign({}, opts), { allowedAttributes });
    }
    const _ttpSafeInnerHtml = (_a = window.trustedTypes) === null || _a === void 0 ? void 0 : _a.createPolicy('safeInnerHtml', {
        createHTML(value, options) {
            return (0, insane_1.insane)(value, options);
        }
    });
    /**
     * Sanitizes the given `value` and reset the given `node` with it.
     */
    function safeInnerHtml(node, value) {
        var _a;
        const options = _extInsaneOptions({
            allowedTags: ['a', 'button', 'blockquote', 'code', 'div', 'h1', 'h2', 'h3', 'input', 'label', 'li', 'p', 'pre', 'select', 'small', 'span', 'strong', 'textarea', 'ul', 'ol'],
            allowedAttributes: {
                'a': ['href', 'x-dispatch'],
                'button': ['data-href', 'x-dispatch'],
                'input': ['type', 'placeholder', 'checked', 'required'],
                'label': ['for'],
                'select': ['required'],
                'span': ['data-command', 'role'],
                'textarea': ['name', 'placeholder', 'required'],
            },
            allowedSchemes: ['http', 'https', 'command']
        }, ['class', 'id', 'role', 'tabindex']);
        const html = (_a = _ttpSafeInnerHtml === null || _ttpSafeInnerHtml === void 0 ? void 0 : _ttpSafeInnerHtml.createHTML(value, options)) !== null && _a !== void 0 ? _a : (0, insane_1.insane)(value, options);
        node.innerHTML = html;
    }
    exports.safeInnerHtml = safeInnerHtml;
    /**
     * Convert a Unicode string to a string in which each 16-bit unit occupies only one byte
     *
     * From https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa
     */
    function toBinary(str) {
        const codeUnits = new Uint16Array(str.length);
        for (let i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = str.charCodeAt(i);
        }
        let binary = '';
        const uint8array = new Uint8Array(codeUnits.buffer);
        for (let i = 0; i < uint8array.length; i++) {
            binary += String.fromCharCode(uint8array[i]);
        }
        return binary;
    }
    /**
     * Version of the global `btoa` function that handles multi-byte characters instead
     * of throwing an exception.
     */
    function multibyteAwareBtoa(str) {
        return btoa(toBinary(str));
    }
    exports.multibyteAwareBtoa = multibyteAwareBtoa;
    /**
     * Typings for the https://wicg.github.io/file-system-access
     *
     * Use `supported(window)` to find out if the browser supports this kind of API.
     */
    var WebFileSystemAccess;
    (function (WebFileSystemAccess) {
        function supported(obj) {
            if (typeof (obj === null || obj === void 0 ? void 0 : obj.showDirectoryPicker) === 'function') {
                return true;
            }
            return false;
        }
        WebFileSystemAccess.supported = supported;
    })(WebFileSystemAccess = exports.WebFileSystemAccess || (exports.WebFileSystemAccess = {}));
    class ModifierKeyEmitter extends event_2.Emitter {
        constructor() {
            super();
            this._subscriptions = new lifecycle_1.DisposableStore();
            this._keyStatus = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
            this._subscriptions.add((0, event_1.domEvent)(window, 'keydown', true)(e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                // If Alt-key keydown event is repeated, ignore it #112347
                // Only known to be necessary for Alt-Key at the moment #115810
                if (event.keyCode === 6 /* Alt */ && e.repeat) {
                    return;
                }
                if (e.altKey && !this._keyStatus.altKey) {
                    this._keyStatus.lastKeyPressed = 'alt';
                }
                else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
                    this._keyStatus.lastKeyPressed = 'ctrl';
                }
                else if (e.metaKey && !this._keyStatus.metaKey) {
                    this._keyStatus.lastKeyPressed = 'meta';
                }
                else if (e.shiftKey && !this._keyStatus.shiftKey) {
                    this._keyStatus.lastKeyPressed = 'shift';
                }
                else if (event.keyCode !== 6 /* Alt */) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
                else {
                    return;
                }
                this._keyStatus.altKey = e.altKey;
                this._keyStatus.ctrlKey = e.ctrlKey;
                this._keyStatus.metaKey = e.metaKey;
                this._keyStatus.shiftKey = e.shiftKey;
                if (this._keyStatus.lastKeyPressed) {
                    this._keyStatus.event = e;
                    this.fire(this._keyStatus);
                }
            }));
            this._subscriptions.add((0, event_1.domEvent)(window, 'keyup', true)(e => {
                if (!e.altKey && this._keyStatus.altKey) {
                    this._keyStatus.lastKeyReleased = 'alt';
                }
                else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
                    this._keyStatus.lastKeyReleased = 'ctrl';
                }
                else if (!e.metaKey && this._keyStatus.metaKey) {
                    this._keyStatus.lastKeyReleased = 'meta';
                }
                else if (!e.shiftKey && this._keyStatus.shiftKey) {
                    this._keyStatus.lastKeyReleased = 'shift';
                }
                else {
                    this._keyStatus.lastKeyReleased = undefined;
                }
                if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
                this._keyStatus.altKey = e.altKey;
                this._keyStatus.ctrlKey = e.ctrlKey;
                this._keyStatus.metaKey = e.metaKey;
                this._keyStatus.shiftKey = e.shiftKey;
                if (this._keyStatus.lastKeyReleased) {
                    this._keyStatus.event = e;
                    this.fire(this._keyStatus);
                }
            }));
            this._subscriptions.add((0, event_1.domEvent)(document.body, 'mousedown', true)(e => {
                this._keyStatus.lastKeyPressed = undefined;
            }));
            this._subscriptions.add((0, event_1.domEvent)(document.body, 'mouseup', true)(e => {
                this._keyStatus.lastKeyPressed = undefined;
            }));
            this._subscriptions.add((0, event_1.domEvent)(document.body, 'mousemove', true)(e => {
                if (e.buttons) {
                    this._keyStatus.lastKeyPressed = undefined;
                }
            }));
            this._subscriptions.add((0, event_1.domEvent)(window, 'blur')(e => {
                this.resetKeyStatus();
            }));
        }
        get keyStatus() {
            return this._keyStatus;
        }
        get isModifierPressed() {
            return this._keyStatus.altKey || this._keyStatus.ctrlKey || this._keyStatus.metaKey || this._keyStatus.shiftKey;
        }
        /**
         * Allows to explicitly reset the key status based on more knowledge (#109062)
         */
        resetKeyStatus() {
            this.doResetKeyStatus();
            this.fire(this._keyStatus);
        }
        doResetKeyStatus() {
            this._keyStatus = {
                altKey: false,
                shiftKey: false,
                ctrlKey: false,
                metaKey: false
            };
        }
        static getInstance() {
            if (!ModifierKeyEmitter.instance) {
                ModifierKeyEmitter.instance = new ModifierKeyEmitter();
            }
            return ModifierKeyEmitter.instance;
        }
        dispose() {
            super.dispose();
            this._subscriptions.dispose();
        }
    }
    exports.ModifierKeyEmitter = ModifierKeyEmitter;
    function getCookieValue(name) {
        const match = document.cookie.match('(^|[^;]+)\\s*' + name + '\\s*=\\s*([^;]+)'); // See https://stackoverflow.com/a/25490531
        return match ? match.pop() : undefined;
    }
    exports.getCookieValue = getCookieValue;
});
//# sourceMappingURL=dom.js.map