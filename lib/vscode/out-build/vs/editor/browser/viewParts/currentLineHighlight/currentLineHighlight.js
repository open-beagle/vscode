/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/view/dynamicViewOverlay", "vs/editor/common/view/editorColorRegistry", "vs/base/common/arrays", "vs/platform/theme/common/themeService", "vs/editor/common/core/selection", "vs/css!./currentLineHighlight"], function (require, exports, dynamicViewOverlay_1, editorColorRegistry_1, arrays, themeService_1, selection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CurrentLineMarginHighlightOverlay = exports.CurrentLineHighlightOverlay = exports.AbstractLineHighlightOverlay = void 0;
    let isRenderedUsingBorder = true;
    class AbstractLineHighlightOverlay extends dynamicViewOverlay_1.DynamicViewOverlay {
        constructor(context) {
            super();
            this._context = context;
            const options = this._context.configuration.options;
            const layoutInfo = options.get(126 /* layoutInfo */);
            this._lineHeight = options.get(55 /* lineHeight */);
            this._renderLineHighlight = options.get(82 /* renderLineHighlight */);
            this._renderLineHighlightOnlyWhenFocus = options.get(83 /* renderLineHighlightOnlyWhenFocus */);
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            this._selectionIsEmpty = true;
            this._focused = false;
            this._cursorLineNumbers = [1];
            this._selections = [new selection_1.Selection(1, 1, 1, 1)];
            this._renderData = null;
            this._context.addEventHandler(this);
        }
        dispose() {
            this._context.removeEventHandler(this);
            super.dispose();
        }
        _readFromSelections() {
            let hasChanged = false;
            // Only render the first selection when using border
            const renderSelections = isRenderedUsingBorder ? this._selections.slice(0, 1) : this._selections;
            const cursorsLineNumbers = renderSelections.map(s => s.positionLineNumber);
            cursorsLineNumbers.sort((a, b) => a - b);
            if (!arrays.equals(this._cursorLineNumbers, cursorsLineNumbers)) {
                this._cursorLineNumbers = cursorsLineNumbers;
                hasChanged = true;
            }
            const selectionIsEmpty = renderSelections.every(s => s.isEmpty());
            if (this._selectionIsEmpty !== selectionIsEmpty) {
                this._selectionIsEmpty = selectionIsEmpty;
                hasChanged = true;
            }
            return hasChanged;
        }
        // --- begin event handlers
        onThemeChanged(e) {
            return this._readFromSelections();
        }
        onConfigurationChanged(e) {
            const options = this._context.configuration.options;
            const layoutInfo = options.get(126 /* layoutInfo */);
            this._lineHeight = options.get(55 /* lineHeight */);
            this._renderLineHighlight = options.get(82 /* renderLineHighlight */);
            this._renderLineHighlightOnlyWhenFocus = options.get(83 /* renderLineHighlightOnlyWhenFocus */);
            this._contentLeft = layoutInfo.contentLeft;
            this._contentWidth = layoutInfo.contentWidth;
            return true;
        }
        onCursorStateChanged(e) {
            this._selections = e.selections;
            return this._readFromSelections();
        }
        onFlushed(e) {
            return true;
        }
        onLinesDeleted(e) {
            return true;
        }
        onLinesInserted(e) {
            return true;
        }
        onScrollChanged(e) {
            return e.scrollWidthChanged || e.scrollTopChanged;
        }
        onZonesChanged(e) {
            return true;
        }
        onFocusChanged(e) {
            if (!this._renderLineHighlightOnlyWhenFocus) {
                return false;
            }
            this._focused = e.isFocused;
            return true;
        }
        // --- end event handlers
        prepareRender(ctx) {
            if (!this._shouldRenderThis()) {
                this._renderData = null;
                return;
            }
            const renderedLine = this._renderOne(ctx);
            const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
            const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
            const len = this._cursorLineNumbers.length;
            let index = 0;
            const renderData = [];
            for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
                const lineIndex = lineNumber - visibleStartLineNumber;
                while (index < len && this._cursorLineNumbers[index] < lineNumber) {
                    index++;
                }
                if (index < len && this._cursorLineNumbers[index] === lineNumber) {
                    renderData[lineIndex] = renderedLine;
                }
                else {
                    renderData[lineIndex] = '';
                }
            }
            this._renderData = renderData;
        }
        render(startLineNumber, lineNumber) {
            if (!this._renderData) {
                return '';
            }
            const lineIndex = lineNumber - startLineNumber;
            if (lineIndex >= this._renderData.length) {
                return '';
            }
            return this._renderData[lineIndex];
        }
    }
    exports.AbstractLineHighlightOverlay = AbstractLineHighlightOverlay;
    class CurrentLineHighlightOverlay extends AbstractLineHighlightOverlay {
        _renderOne(ctx) {
            const className = 'current-line' + (this._shouldRenderOther() ? ' current-line-both' : '');
            return `<div class="${className}" style="width:${Math.max(ctx.scrollWidth, this._contentWidth)}px; height:${this._lineHeight}px;"></div>`;
        }
        _shouldRenderThis() {
            return ((this._renderLineHighlight === 'line' || this._renderLineHighlight === 'all')
                && this._selectionIsEmpty
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
        _shouldRenderOther() {
            return ((this._renderLineHighlight === 'gutter' || this._renderLineHighlight === 'all')
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
    }
    exports.CurrentLineHighlightOverlay = CurrentLineHighlightOverlay;
    class CurrentLineMarginHighlightOverlay extends AbstractLineHighlightOverlay {
        _renderOne(ctx) {
            const className = 'current-line' + (this._shouldRenderMargin() ? ' current-line-margin' : '') + (this._shouldRenderOther() ? ' current-line-margin-both' : '');
            return `<div class="${className}" style="width:${this._contentLeft}px; height:${this._lineHeight}px;"></div>`;
        }
        _shouldRenderMargin() {
            return ((this._renderLineHighlight === 'gutter' || this._renderLineHighlight === 'all')
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
        _shouldRenderThis() {
            return true;
        }
        _shouldRenderOther() {
            return ((this._renderLineHighlight === 'line' || this._renderLineHighlight === 'all')
                && this._selectionIsEmpty
                && (!this._renderLineHighlightOnlyWhenFocus || this._focused));
        }
    }
    exports.CurrentLineMarginHighlightOverlay = CurrentLineMarginHighlightOverlay;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        isRenderedUsingBorder = false;
        const lineHighlight = theme.getColor(editorColorRegistry_1.editorLineHighlight);
        if (lineHighlight) {
            collector.addRule(`.monaco-editor .view-overlays .current-line { background-color: ${lineHighlight}; }`);
            collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { background-color: ${lineHighlight}; border: none; }`);
        }
        if (!lineHighlight || lineHighlight.isTransparent() || theme.defines(editorColorRegistry_1.editorLineHighlightBorder)) {
            const lineHighlightBorder = theme.getColor(editorColorRegistry_1.editorLineHighlightBorder);
            if (lineHighlightBorder) {
                isRenderedUsingBorder = true;
                collector.addRule(`.monaco-editor .view-overlays .current-line { border: 2px solid ${lineHighlightBorder}; }`);
                collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { border: 2px solid ${lineHighlightBorder}; }`);
                if (theme.type === 'hc') {
                    collector.addRule(`.monaco-editor .view-overlays .current-line { border-width: 1px; }`);
                    collector.addRule(`.monaco-editor .margin-view-overlays .current-line-margin { border-width: 1px; }`);
                }
            }
        }
    });
});
//# sourceMappingURL=currentLineHighlight.js.map