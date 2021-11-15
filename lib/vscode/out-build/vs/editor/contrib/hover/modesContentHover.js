/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/cancellation", "vs/base/common/color", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/model/textModel", "vs/editor/common/modes", "vs/editor/contrib/colorPicker/color", "vs/editor/contrib/colorPicker/colorDetector", "vs/editor/contrib/colorPicker/colorPickerModel", "vs/editor/contrib/colorPicker/colorPickerWidget", "vs/editor/contrib/hover/hoverOperation", "vs/platform/theme/common/themeService", "vs/base/common/arrays", "vs/platform/theme/common/colorRegistry", "vs/base/browser/ui/widget", "vs/base/browser/ui/hover/hoverWidget", "vs/editor/contrib/hover/markerHoverParticipant", "vs/editor/contrib/hover/markdownHoverParticipant"], function (require, exports, dom, cancellation_1, color_1, lifecycle_1, position_1, range_1, textModel_1, modes_1, color_2, colorDetector_1, colorPickerModel_1, colorPickerWidget_1, hoverOperation_1, themeService_1, arrays_1, colorRegistry_1, widget_1, hoverWidget_1, markerHoverParticipant_1, markdownHoverParticipant_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModesContentHoverWidget = void 0;
    class ColorHover {
        constructor(range, color, provider) {
            this.range = range;
            this.color = color;
            this.provider = provider;
        }
        equals(other) {
            return false;
        }
    }
    class HoverPartInfo {
        constructor(owner, data) {
            this.owner = owner;
            this.data = data;
        }
    }
    class ModesContentComputer {
        constructor(editor, _markerHoverParticipant, _markdownHoverParticipant) {
            this._markerHoverParticipant = _markerHoverParticipant;
            this._markdownHoverParticipant = _markdownHoverParticipant;
            this._editor = editor;
            this._result = [];
            this._range = null;
        }
        setRange(range) {
            this._range = range;
            this._result = [];
        }
        clearResult() {
            this._result = [];
        }
        async computeAsync(token) {
            if (!this._editor.hasModel() || !this._range) {
                return Promise.resolve([]);
            }
            const markdownHovers = await this._markdownHoverParticipant.computeAsync(this._range, token);
            return markdownHovers.map(h => new HoverPartInfo(this._markdownHoverParticipant, h));
        }
        computeSync() {
            if (!this._editor.hasModel() || !this._range) {
                return [];
            }
            const model = this._editor.getModel();
            const hoverRange = this._range;
            const lineNumber = hoverRange.startLineNumber;
            if (lineNumber > this._editor.getModel().getLineCount()) {
                // Illegal line number => no results
                return [];
            }
            const maxColumn = model.getLineMaxColumn(lineNumber);
            const lineDecorations = this._editor.getLineDecorations(lineNumber).filter((d) => {
                if (d.options.isWholeLine) {
                    return true;
                }
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                if (startColumn > hoverRange.startColumn || hoverRange.endColumn > endColumn) {
                    return false;
                }
                return true;
            });
            let result = [];
            const colorDetector = colorDetector_1.ColorDetector.get(this._editor);
            for (const d of lineDecorations) {
                const colorData = colorDetector.getColorData(d.range.getStartPosition());
                if (colorData) {
                    const { color, range } = colorData.colorInfo;
                    result.push(new HoverPartInfo(null, new ColorHover(range_1.Range.lift(range), color, colorData.provider)));
                    break;
                }
            }
            const markdownHovers = this._markdownHoverParticipant.computeSync(this._range, lineDecorations);
            result = result.concat(markdownHovers.map(h => new HoverPartInfo(this._markdownHoverParticipant, h)));
            const markerHovers = this._markerHoverParticipant.computeSync(this._range, lineDecorations);
            result = result.concat(markerHovers.map(h => new HoverPartInfo(this._markerHoverParticipant, h)));
            return (0, arrays_1.coalesce)(result);
        }
        onResult(result, isFromSynchronousComputation) {
            // Always put synchronous messages before asynchronous ones
            if (isFromSynchronousComputation) {
                this._result = result.concat(this._result);
            }
            else {
                this._result = this._result.concat(result);
            }
        }
        getResult() {
            return this._result.slice(0);
        }
        getResultWithLoadingMessage() {
            if (this._range) {
                const loadingMessage = new HoverPartInfo(this._markdownHoverParticipant, this._markdownHoverParticipant.createLoadingMessage(this._range));
                return this._result.slice(0).concat([loadingMessage]);
            }
            return this._result.slice(0);
        }
    }
    class ModesContentHoverWidget extends widget_1.Widget {
        constructor(editor, _hoverVisibleKey, instantiationService, _themeService) {
            super();
            this._hoverVisibleKey = _hoverVisibleKey;
            this._themeService = _themeService;
            // IContentWidget.allowEditorOverflow
            this.allowEditorOverflow = true;
            this._markerHoverParticipant = instantiationService.createInstance(markerHoverParticipant_1.MarkerHoverParticipant, editor, this);
            this._markdownHoverParticipant = instantiationService.createInstance(markdownHoverParticipant_1.MarkdownHoverParticipant, editor, this);
            this._hover = this._register(new hoverWidget_1.HoverWidget());
            this._id = ModesContentHoverWidget.ID;
            this._editor = editor;
            this._isVisible = false;
            this._stoleFocus = false;
            this._renderDisposable = null;
            this.onkeydown(this._hover.containerDomNode, (e) => {
                if (e.equals(9 /* Escape */)) {
                    this.hide();
                }
            });
            this._register(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(40 /* fontInfo */)) {
                    this._updateFont();
                }
            }));
            this._editor.onDidLayoutChange(() => this.layout());
            this.layout();
            this._editor.addContentWidget(this);
            this._showAtPosition = null;
            this._showAtRange = null;
            this._stoleFocus = false;
            this._messages = [];
            this._lastRange = null;
            this._computer = new ModesContentComputer(this._editor, this._markerHoverParticipant, this._markdownHoverParticipant);
            this._highlightDecorations = [];
            this._isChangingDecorations = false;
            this._shouldFocus = false;
            this._colorPicker = null;
            this._hoverOperation = new hoverOperation_1.HoverOperation(this._computer, result => this._withResult(result, true), null, result => this._withResult(result, false), this._editor.getOption(50 /* hover */).delay);
            this._register(dom.addStandardDisposableListener(this.getDomNode(), dom.EventType.FOCUS, () => {
                if (this._colorPicker) {
                    this.getDomNode().classList.add('colorpicker-hover');
                }
            }));
            this._register(dom.addStandardDisposableListener(this.getDomNode(), dom.EventType.BLUR, () => {
                this.getDomNode().classList.remove('colorpicker-hover');
            }));
            this._register(editor.onDidChangeConfiguration(() => {
                this._hoverOperation.setHoverTime(this._editor.getOption(50 /* hover */).delay);
            }));
            this._register(modes_1.TokenizationRegistry.onDidChange(() => {
                if (this._isVisible && this._lastRange && this._messages.length > 0) {
                    this._messages = this._messages.map(msg => {
                        var _a, _b;
                        // If a color hover is visible, we need to update the message that
                        // created it so that the color matches the last chosen color
                        if (msg.data instanceof ColorHover && !!((_a = this._lastRange) === null || _a === void 0 ? void 0 : _a.intersectRanges(msg.data.range)) && ((_b = this._colorPicker) === null || _b === void 0 ? void 0 : _b.model.color)) {
                            const color = this._colorPicker.model.color;
                            const newColor = {
                                red: color.rgba.r / 255,
                                green: color.rgba.g / 255,
                                blue: color.rgba.b / 255,
                                alpha: color.rgba.a
                            };
                            return new HoverPartInfo(msg.owner, new ColorHover(msg.data.range, newColor, msg.data.provider));
                        }
                        else {
                            return msg;
                        }
                    });
                    this._hover.contentsDomNode.textContent = '';
                    this._renderMessages(this._lastRange, this._messages);
                }
            }));
        }
        dispose() {
            this._hoverOperation.cancel();
            this._editor.removeContentWidget(this);
            super.dispose();
        }
        getId() {
            return this._id;
        }
        getDomNode() {
            return this._hover.containerDomNode;
        }
        showAt(position, range, focus) {
            // Position has changed
            this._showAtPosition = position;
            this._showAtRange = range;
            this._hoverVisibleKey.set(true);
            this._isVisible = true;
            this._hover.containerDomNode.classList.toggle('hidden', !this._isVisible);
            this._editor.layoutContentWidget(this);
            // Simply force a synchronous render on the editor
            // such that the widget does not really render with left = '0px'
            this._editor.render();
            this._stoleFocus = focus;
            if (focus) {
                this._hover.containerDomNode.focus();
            }
        }
        getPosition() {
            if (this._isVisible) {
                return {
                    position: this._showAtPosition,
                    range: this._showAtRange,
                    preference: [
                        1 /* ABOVE */,
                        2 /* BELOW */
                    ]
                };
            }
            return null;
        }
        _updateFont() {
            const codeClasses = Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName('code'));
            codeClasses.forEach(node => this._editor.applyFontInfo(node));
        }
        _updateContents(node) {
            this._hover.contentsDomNode.textContent = '';
            this._hover.contentsDomNode.appendChild(node);
            this._updateFont();
            this._editor.layoutContentWidget(this);
            this._hover.onContentsChanged();
        }
        layout() {
            const height = Math.max(this._editor.getLayoutInfo().height / 4, 250);
            const { fontSize, lineHeight } = this._editor.getOption(40 /* fontInfo */);
            this._hover.contentsDomNode.style.fontSize = `${fontSize}px`;
            this._hover.contentsDomNode.style.lineHeight = `${lineHeight}px`;
            this._hover.contentsDomNode.style.maxHeight = `${height}px`;
            this._hover.contentsDomNode.style.maxWidth = `${Math.max(this._editor.getLayoutInfo().width * 0.66, 500)}px`;
        }
        onModelDecorationsChanged() {
            if (this._isChangingDecorations) {
                return;
            }
            if (this._isVisible) {
                // The decorations have changed and the hover is visible,
                // we need to recompute the displayed text
                this._hoverOperation.cancel();
                this._computer.clearResult();
                if (!this._colorPicker) { // TODO@Michel ensure that displayed text for other decorations is computed even if color picker is in place
                    this._hoverOperation.start(0 /* Delayed */);
                }
            }
        }
        startShowingAt(range, mode, focus) {
            if (this._lastRange && this._lastRange.equalsRange(range)) {
                // We have to show the widget at the exact same range as before, so no work is needed
                return;
            }
            this._hoverOperation.cancel();
            if (this._isVisible) {
                // The range might have changed, but the hover is visible
                // Instead of hiding it completely, filter out messages that are still in the new range and
                // kick off a new computation
                if (!this._showAtPosition || this._showAtPosition.lineNumber !== range.startLineNumber) {
                    this.hide();
                }
                else {
                    let filteredMessages = [];
                    for (let i = 0, len = this._messages.length; i < len; i++) {
                        const msg = this._messages[i];
                        const rng = msg.data.range;
                        if (rng && rng.startColumn <= range.startColumn && rng.endColumn >= range.endColumn) {
                            filteredMessages.push(msg);
                        }
                    }
                    if (filteredMessages.length > 0) {
                        if (hoverContentsEquals(filteredMessages, this._messages)) {
                            return;
                        }
                        this._renderMessages(range, filteredMessages);
                    }
                    else {
                        this.hide();
                    }
                }
            }
            this._lastRange = range;
            this._computer.setRange(range);
            this._shouldFocus = focus;
            this._hoverOperation.start(mode);
        }
        hide() {
            this._lastRange = null;
            this._hoverOperation.cancel();
            if (this._isVisible) {
                setTimeout(() => {
                    // Give commands a chance to see the key
                    if (!this._isVisible) {
                        this._hoverVisibleKey.set(false);
                    }
                }, 0);
                this._isVisible = false;
                this._hover.containerDomNode.classList.toggle('hidden', !this._isVisible);
                this._editor.layoutContentWidget(this);
                if (this._stoleFocus) {
                    this._editor.focus();
                }
            }
            this._isChangingDecorations = true;
            this._highlightDecorations = this._editor.deltaDecorations(this._highlightDecorations, []);
            this._isChangingDecorations = false;
            if (this._renderDisposable) {
                this._renderDisposable.dispose();
                this._renderDisposable = null;
            }
            this._colorPicker = null;
        }
        isColorPickerVisible() {
            return !!this._colorPicker;
        }
        onContentsChanged() {
            this._hover.onContentsChanged();
        }
        _withResult(result, complete) {
            this._messages = result;
            if (this._lastRange && this._messages.length > 0) {
                this._renderMessages(this._lastRange, this._messages);
            }
            else if (complete) {
                this.hide();
            }
        }
        _renderMessages(renderRange, messages) {
            if (this._renderDisposable) {
                this._renderDisposable.dispose();
                this._renderDisposable = null;
            }
            this._colorPicker = null;
            // update column from which to show
            let renderColumn = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
            let highlightRange = messages[0].data.range ? range_1.Range.lift(messages[0].data.range) : null;
            let fragment = document.createDocumentFragment();
            let containColorPicker = false;
            const disposables = new lifecycle_1.DisposableStore();
            const markerMessages = [];
            const markdownParts = [];
            messages.forEach((_msg) => {
                const msg = _msg.data;
                if (!msg.range) {
                    return;
                }
                renderColumn = Math.min(renderColumn, msg.range.startColumn);
                highlightRange = highlightRange ? range_1.Range.plusRange(highlightRange, msg.range) : range_1.Range.lift(msg.range);
                if (msg instanceof ColorHover) {
                    containColorPicker = true;
                    const { red, green, blue, alpha } = msg.color;
                    const rgba = new color_1.RGBA(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255), alpha);
                    const color = new color_1.Color(rgba);
                    if (!this._editor.hasModel()) {
                        return;
                    }
                    const editorModel = this._editor.getModel();
                    let range = new range_1.Range(msg.range.startLineNumber, msg.range.startColumn, msg.range.endLineNumber, msg.range.endColumn);
                    let colorInfo = { range: msg.range, color: msg.color };
                    // create blank olor picker model and widget first to ensure it's positioned correctly.
                    const model = new colorPickerModel_1.ColorPickerModel(color, [], 0);
                    const widget = new colorPickerWidget_1.ColorPickerWidget(fragment, model, this._editor.getOption(124 /* pixelRatio */), this._themeService);
                    (0, color_2.getColorPresentations)(editorModel, colorInfo, msg.provider, cancellation_1.CancellationToken.None).then(colorPresentations => {
                        model.colorPresentations = colorPresentations || [];
                        if (!this._editor.hasModel()) {
                            // gone...
                            return;
                        }
                        const originalText = this._editor.getModel().getValueInRange(msg.range);
                        model.guessColorPresentation(color, originalText);
                        const updateEditorModel = () => {
                            let textEdits;
                            let newRange;
                            if (model.presentation.textEdit) {
                                textEdits = [model.presentation.textEdit];
                                newRange = new range_1.Range(model.presentation.textEdit.range.startLineNumber, model.presentation.textEdit.range.startColumn, model.presentation.textEdit.range.endLineNumber, model.presentation.textEdit.range.endColumn);
                                const trackedRange = this._editor.getModel()._setTrackedRange(null, newRange, 3 /* GrowsOnlyWhenTypingAfter */);
                                this._editor.pushUndoStop();
                                this._editor.executeEdits('colorpicker', textEdits);
                                newRange = this._editor.getModel()._getTrackedRange(trackedRange) || newRange;
                            }
                            else {
                                textEdits = [{ identifier: null, range, text: model.presentation.label, forceMoveMarkers: false }];
                                newRange = range.setEndPosition(range.endLineNumber, range.startColumn + model.presentation.label.length);
                                this._editor.pushUndoStop();
                                this._editor.executeEdits('colorpicker', textEdits);
                            }
                            if (model.presentation.additionalTextEdits) {
                                textEdits = [...model.presentation.additionalTextEdits];
                                this._editor.executeEdits('colorpicker', textEdits);
                                this.hide();
                            }
                            this._editor.pushUndoStop();
                            range = newRange;
                        };
                        const updateColorPresentations = (color) => {
                            return (0, color_2.getColorPresentations)(editorModel, {
                                range: range,
                                color: {
                                    red: color.rgba.r / 255,
                                    green: color.rgba.g / 255,
                                    blue: color.rgba.b / 255,
                                    alpha: color.rgba.a
                                }
                            }, msg.provider, cancellation_1.CancellationToken.None).then((colorPresentations) => {
                                model.colorPresentations = colorPresentations || [];
                            });
                        };
                        const colorListener = model.onColorFlushed((color) => {
                            updateColorPresentations(color).then(updateEditorModel);
                        });
                        const colorChangeListener = model.onDidChangeColor(updateColorPresentations);
                        this._colorPicker = widget;
                        this.showAt(range.getStartPosition(), range, this._shouldFocus);
                        this._updateContents(fragment);
                        this._colorPicker.layout();
                        this._renderDisposable = (0, lifecycle_1.combinedDisposable)(colorListener, colorChangeListener, widget, disposables);
                    });
                }
                else {
                    if (msg instanceof markerHoverParticipant_1.MarkerHover) {
                        markerMessages.push(msg);
                    }
                    else {
                        if (msg instanceof markdownHoverParticipant_1.MarkdownHover) {
                            markdownParts.push(msg);
                        }
                    }
                }
            });
            if (markdownParts.length > 0) {
                disposables.add(this._markdownHoverParticipant.renderHoverParts(markdownParts, fragment));
            }
            if (markerMessages.length) {
                disposables.add(this._markerHoverParticipant.renderHoverParts(markerMessages, fragment));
            }
            this._renderDisposable = disposables;
            // show
            if (!containColorPicker && fragment.hasChildNodes()) {
                this.showAt(new position_1.Position(renderRange.startLineNumber, renderColumn), highlightRange, this._shouldFocus);
                this._updateContents(fragment);
            }
            this._isChangingDecorations = true;
            this._highlightDecorations = this._editor.deltaDecorations(this._highlightDecorations, highlightRange ? [{
                    range: highlightRange,
                    options: ModesContentHoverWidget._DECORATION_OPTIONS
                }] : []);
            this._isChangingDecorations = false;
        }
    }
    exports.ModesContentHoverWidget = ModesContentHoverWidget;
    ModesContentHoverWidget.ID = 'editor.contrib.modesContentHoverWidget';
    ModesContentHoverWidget._DECORATION_OPTIONS = textModel_1.ModelDecorationOptions.register({
        className: 'hoverHighlight'
    });
    function hoverContentsEquals(first, second) {
        if (first.length !== second.length) {
            return false;
        }
        for (let i = 0; i < first.length; i++) {
            if (!first[i].data.equals(second[i].data)) {
                return false;
            }
        }
        return true;
    }
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const linkFg = theme.getColor(colorRegistry_1.textLinkForeground);
        if (linkFg) {
            collector.addRule(`.monaco-hover .hover-contents a.code-link span:hover { color: ${linkFg}; }`);
        }
    });
});
//# sourceMappingURL=modesContentHover.js.map