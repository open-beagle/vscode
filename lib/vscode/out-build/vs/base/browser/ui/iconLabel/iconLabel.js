/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/lifecycle", "vs/base/common/range", "vs/base/common/objects", "vs/base/common/types", "vs/base/browser/event", "vs/nls!vs/base/browser/ui/iconLabel/iconLabel", "vs/base/common/cancellation", "vs/css!./iconlabel"], function (require, exports, dom, highlightedLabel_1, lifecycle_1, range_1, objects_1, types_1, event_1, nls_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IconLabel = void 0;
    class FastLabelNode {
        constructor(_element) {
            this._element = _element;
        }
        get element() {
            return this._element;
        }
        set textContent(content) {
            if (this.disposed || content === this._textContent) {
                return;
            }
            this._textContent = content;
            this._element.textContent = content;
        }
        set className(className) {
            if (this.disposed || className === this._className) {
                return;
            }
            this._className = className;
            this._element.className = className;
        }
        set empty(empty) {
            if (this.disposed || empty === this._empty) {
                return;
            }
            this._empty = empty;
            this._element.style.marginLeft = empty ? '0' : '';
        }
        dispose() {
            this.disposed = true;
        }
    }
    class IconLabel extends lifecycle_1.Disposable {
        constructor(container, options) {
            super();
            this.hoverDelegate = undefined;
            this.customHovers = new Map();
            this.domNode = this._register(new FastLabelNode(dom.append(container, dom.$('.monaco-icon-label'))));
            this.labelContainer = dom.append(this.domNode.element, dom.$('.monaco-icon-label-container'));
            const nameContainer = dom.append(this.labelContainer, dom.$('span.monaco-icon-name-container'));
            this.descriptionContainer = this._register(new FastLabelNode(dom.append(this.labelContainer, dom.$('span.monaco-icon-description-container'))));
            if (options === null || options === void 0 ? void 0 : options.supportHighlights) {
                this.nameNode = new LabelWithHighlights(nameContainer, !!options.supportIcons);
            }
            else {
                this.nameNode = new Label(nameContainer);
            }
            if (options === null || options === void 0 ? void 0 : options.supportDescriptionHighlights) {
                this.descriptionNodeFactory = () => new highlightedLabel_1.HighlightedLabel(dom.append(this.descriptionContainer.element, dom.$('span.label-description')), !!options.supportIcons);
            }
            else {
                this.descriptionNodeFactory = () => this._register(new FastLabelNode(dom.append(this.descriptionContainer.element, dom.$('span.label-description'))));
            }
            if (options === null || options === void 0 ? void 0 : options.hoverDelegate) {
                this.hoverDelegate = options.hoverDelegate;
            }
        }
        get element() {
            return this.domNode.element;
        }
        setLabel(label, description, options) {
            const classes = ['monaco-icon-label'];
            if (options) {
                if (options.extraClasses) {
                    classes.push(...options.extraClasses);
                }
                if (options.italic) {
                    classes.push('italic');
                }
                if (options.strikethrough) {
                    classes.push('strikethrough');
                }
            }
            this.domNode.className = classes.join(' ');
            this.setupHover(this.labelContainer, options === null || options === void 0 ? void 0 : options.title);
            this.nameNode.setLabel(label, options);
            if (description || this.descriptionNode) {
                if (!this.descriptionNode) {
                    this.descriptionNode = this.descriptionNodeFactory(); // description node is created lazily on demand
                }
                if (this.descriptionNode instanceof highlightedLabel_1.HighlightedLabel) {
                    this.descriptionNode.set(description || '', options ? options.descriptionMatches : undefined);
                    this.setupHover(this.descriptionNode.element, options === null || options === void 0 ? void 0 : options.descriptionTitle);
                }
                else {
                    this.descriptionNode.textContent = description || '';
                    this.setupHover(this.descriptionNode.element, (options === null || options === void 0 ? void 0 : options.descriptionTitle) || '');
                    this.descriptionNode.empty = !description;
                }
            }
        }
        setupHover(htmlElement, tooltip) {
            const previousCustomHover = this.customHovers.get(htmlElement);
            if (previousCustomHover) {
                previousCustomHover.dispose();
                this.customHovers.delete(htmlElement);
            }
            if (!tooltip) {
                htmlElement.removeAttribute('title');
                return;
            }
            if (!this.hoverDelegate) {
                return this.setupNativeHover(htmlElement, tooltip);
            }
            else {
                return this.setupCustomHover(this.hoverDelegate, htmlElement, tooltip);
            }
        }
        static adjustXAndShowCustomHover(hoverOptions, mouseX, hoverDelegate, isHovering) {
            if (hoverOptions && isHovering) {
                if (mouseX !== undefined) {
                    hoverOptions.target.x = mouseX + 10;
                }
                return hoverDelegate.showHover(hoverOptions);
            }
            return undefined;
        }
        getTooltipForCustom(markdownTooltip) {
            if ((0, types_1.isString)(markdownTooltip)) {
                return async () => markdownTooltip;
            }
            else if ((0, types_1.isFunction)(markdownTooltip.markdown)) {
                return markdownTooltip.markdown;
            }
            else {
                const markdown = markdownTooltip.markdown;
                return async () => markdown;
            }
        }
        setupCustomHover(hoverDelegate, htmlElement, markdownTooltip) {
            htmlElement.setAttribute('title', '');
            htmlElement.removeAttribute('title');
            let tooltip = this.getTooltipForCustom(markdownTooltip);
            let hoverOptions;
            let mouseX;
            let isHovering = false;
            let tokenSource;
            let hoverDisposable;
            function mouseOver(e) {
                if (isHovering) {
                    return;
                }
                tokenSource = new cancellation_1.CancellationTokenSource();
                function mouseLeaveOrDown(e) {
                    const isMouseDown = e.type === dom.EventType.MOUSE_DOWN;
                    if (isMouseDown) {
                        hoverDisposable === null || hoverDisposable === void 0 ? void 0 : hoverDisposable.dispose();
                        hoverDisposable = undefined;
                    }
                    if (isMouseDown || e.fromElement === htmlElement) {
                        isHovering = false;
                        hoverOptions = undefined;
                        tokenSource.dispose(true);
                        mouseLeaveDisposable.dispose();
                        mouseDownDisposable.dispose();
                    }
                }
                const mouseLeaveDisposable = (0, event_1.domEvent)(htmlElement, dom.EventType.MOUSE_LEAVE, true)(mouseLeaveOrDown.bind(htmlElement));
                const mouseDownDisposable = (0, event_1.domEvent)(htmlElement, dom.EventType.MOUSE_DOWN, true)(mouseLeaveOrDown.bind(htmlElement));
                isHovering = true;
                function mouseMove(e) {
                    mouseX = e.x;
                }
                const mouseMoveDisposable = (0, event_1.domEvent)(htmlElement, dom.EventType.MOUSE_MOVE, true)(mouseMove.bind(htmlElement));
                setTimeout(async () => {
                    var _a;
                    if (isHovering && tooltip) {
                        // Re-use the already computed hover options if they exist.
                        if (!hoverOptions) {
                            const target = {
                                targetElements: [this],
                                dispose: () => { }
                            };
                            hoverOptions = {
                                text: (0, nls_1.localize)(0, null),
                                target,
                                hoverPosition: 2 /* BELOW */
                            };
                            hoverDisposable = IconLabel.adjustXAndShowCustomHover(hoverOptions, mouseX, hoverDelegate, isHovering);
                            const resolvedTooltip = (_a = (await tooltip(tokenSource.token))) !== null && _a !== void 0 ? _a : (!(0, types_1.isString)(markdownTooltip) ? markdownTooltip.markdownNotSupportedFallback : undefined);
                            if (resolvedTooltip) {
                                hoverOptions = {
                                    text: resolvedTooltip,
                                    target,
                                    hoverPosition: 2 /* BELOW */
                                };
                                // awaiting the tooltip could take a while. Make sure we're still hovering.
                                hoverDisposable = IconLabel.adjustXAndShowCustomHover(hoverOptions, mouseX, hoverDelegate, isHovering);
                            }
                            else if (hoverDisposable) {
                                hoverDisposable.dispose();
                                hoverDisposable = undefined;
                            }
                        }
                    }
                    mouseMoveDisposable.dispose();
                }, hoverDelegate.delay);
            }
            const mouseOverDisposable = this._register((0, event_1.domEvent)(htmlElement, dom.EventType.MOUSE_OVER, true)(mouseOver.bind(htmlElement)));
            this.customHovers.set(htmlElement, mouseOverDisposable);
        }
        setupNativeHover(htmlElement, tooltip) {
            let stringTooltip = '';
            if ((0, types_1.isString)(tooltip)) {
                stringTooltip = tooltip;
            }
            else if (tooltip === null || tooltip === void 0 ? void 0 : tooltip.markdownNotSupportedFallback) {
                stringTooltip = tooltip.markdownNotSupportedFallback;
            }
            htmlElement.title = stringTooltip;
        }
    }
    exports.IconLabel = IconLabel;
    class Label {
        constructor(container) {
            this.container = container;
            this.label = undefined;
            this.singleLabel = undefined;
        }
        setLabel(label, options) {
            if (this.label === label && (0, objects_1.equals)(this.options, options)) {
                return;
            }
            this.label = label;
            this.options = options;
            if (typeof label === 'string') {
                if (!this.singleLabel) {
                    this.container.innerText = '';
                    this.container.classList.remove('multiple');
                    this.singleLabel = dom.append(this.container, dom.$('a.label-name', { id: options === null || options === void 0 ? void 0 : options.domId }));
                }
                this.singleLabel.textContent = label;
            }
            else {
                this.container.innerText = '';
                this.container.classList.add('multiple');
                this.singleLabel = undefined;
                for (let i = 0; i < label.length; i++) {
                    const l = label[i];
                    const id = (options === null || options === void 0 ? void 0 : options.domId) && `${options === null || options === void 0 ? void 0 : options.domId}_${i}`;
                    dom.append(this.container, dom.$('a.label-name', { id, 'data-icon-label-count': label.length, 'data-icon-label-index': i, 'role': 'treeitem' }, l));
                    if (i < label.length - 1) {
                        dom.append(this.container, dom.$('span.label-separator', undefined, (options === null || options === void 0 ? void 0 : options.separator) || '/'));
                    }
                }
            }
        }
    }
    function splitMatches(labels, separator, matches) {
        if (!matches) {
            return undefined;
        }
        let labelStart = 0;
        return labels.map(label => {
            const labelRange = { start: labelStart, end: labelStart + label.length };
            const result = matches
                .map(match => range_1.Range.intersect(labelRange, match))
                .filter(range => !range_1.Range.isEmpty(range))
                .map(({ start, end }) => ({ start: start - labelStart, end: end - labelStart }));
            labelStart = labelRange.end + separator.length;
            return result;
        });
    }
    class LabelWithHighlights {
        constructor(container, supportIcons) {
            this.container = container;
            this.supportIcons = supportIcons;
            this.label = undefined;
            this.singleLabel = undefined;
        }
        setLabel(label, options) {
            if (this.label === label && (0, objects_1.equals)(this.options, options)) {
                return;
            }
            this.label = label;
            this.options = options;
            if (typeof label === 'string') {
                if (!this.singleLabel) {
                    this.container.innerText = '';
                    this.container.classList.remove('multiple');
                    this.singleLabel = new highlightedLabel_1.HighlightedLabel(dom.append(this.container, dom.$('a.label-name', { id: options === null || options === void 0 ? void 0 : options.domId })), this.supportIcons);
                }
                this.singleLabel.set(label, options === null || options === void 0 ? void 0 : options.matches, undefined, options === null || options === void 0 ? void 0 : options.labelEscapeNewLines);
            }
            else {
                this.container.innerText = '';
                this.container.classList.add('multiple');
                this.singleLabel = undefined;
                const separator = (options === null || options === void 0 ? void 0 : options.separator) || '/';
                const matches = splitMatches(label, separator, options === null || options === void 0 ? void 0 : options.matches);
                for (let i = 0; i < label.length; i++) {
                    const l = label[i];
                    const m = matches ? matches[i] : undefined;
                    const id = (options === null || options === void 0 ? void 0 : options.domId) && `${options === null || options === void 0 ? void 0 : options.domId}_${i}`;
                    const name = dom.$('a.label-name', { id, 'data-icon-label-count': label.length, 'data-icon-label-index': i, 'role': 'treeitem' });
                    const highlightedLabel = new highlightedLabel_1.HighlightedLabel(dom.append(this.container, name), this.supportIcons);
                    highlightedLabel.set(l, m, undefined, options === null || options === void 0 ? void 0 : options.labelEscapeNewLines);
                    if (i < label.length - 1) {
                        dom.append(name, dom.$('span.label-separator', undefined, separator));
                    }
                }
            }
        }
    }
});
//# sourceMappingURL=iconLabel.js.map