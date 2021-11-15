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
define(["require", "exports", "vs/nls!vs/editor/contrib/hover/markdownHoverParticipant", "vs/base/browser/dom", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/browser/core/markdownRenderer", "vs/base/common/arrays", "vs/platform/opener/common/opener", "vs/editor/common/services/modeService", "vs/editor/common/modes", "vs/editor/contrib/hover/getHover", "vs/editor/common/core/position"], function (require, exports, nls, dom, htmlContent_1, lifecycle_1, range_1, markdownRenderer_1, arrays_1, opener_1, modeService_1, modes_1, getHover_1, position_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkdownHoverParticipant = exports.MarkdownHover = void 0;
    const $ = dom.$;
    class MarkdownHover {
        constructor(range, contents) {
            this.range = range;
            this.contents = contents;
        }
        equals(other) {
            if (other instanceof MarkdownHover) {
                return (0, htmlContent_1.markedStringsEquals)(this.contents, other.contents);
            }
            return false;
        }
    }
    exports.MarkdownHover = MarkdownHover;
    let MarkdownHoverParticipant = class MarkdownHoverParticipant {
        constructor(_editor, _hover, _modeService, _openerService) {
            this._editor = _editor;
            this._hover = _hover;
            this._modeService = _modeService;
            this._openerService = _openerService;
        }
        createLoadingMessage(range) {
            return new MarkdownHover(range, [new htmlContent_1.MarkdownString().appendText(nls.localize(0, null))]);
        }
        computeSync(hoverRange, lineDecorations) {
            if (!this._editor.hasModel()) {
                return [];
            }
            const model = this._editor.getModel();
            const lineNumber = hoverRange.startLineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            const result = [];
            for (const d of lineDecorations) {
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                const hoverMessage = d.options.hoverMessage;
                if (!hoverMessage || (0, htmlContent_1.isEmptyMarkdownString)(hoverMessage)) {
                    continue;
                }
                const range = new range_1.Range(hoverRange.startLineNumber, startColumn, hoverRange.startLineNumber, endColumn);
                result.push(new MarkdownHover(range, (0, arrays_1.asArray)(hoverMessage)));
            }
            return result;
        }
        async computeAsync(range, token) {
            if (!this._editor.hasModel() || !range) {
                return Promise.resolve([]);
            }
            const model = this._editor.getModel();
            if (!modes_1.HoverProviderRegistry.has(model)) {
                return Promise.resolve([]);
            }
            const hovers = await (0, getHover_1.getHover)(model, new position_1.Position(range.startLineNumber, range.startColumn), token);
            const result = [];
            for (const hover of hovers) {
                if ((0, htmlContent_1.isEmptyMarkdownString)(hover.contents)) {
                    continue;
                }
                const rng = hover.range ? range_1.Range.lift(hover.range) : range;
                result.push(new MarkdownHover(rng, hover.contents));
            }
            return result;
        }
        renderHoverParts(hoverParts, fragment) {
            const disposables = new lifecycle_1.DisposableStore();
            for (const hoverPart of hoverParts) {
                for (const contents of hoverPart.contents) {
                    if ((0, htmlContent_1.isEmptyMarkdownString)(contents)) {
                        continue;
                    }
                    const markdownHoverElement = $('div.hover-row.markdown-hover');
                    const hoverContentsElement = dom.append(markdownHoverElement, $('div.hover-contents'));
                    const renderer = disposables.add(new markdownRenderer_1.MarkdownRenderer({ editor: this._editor }, this._modeService, this._openerService));
                    disposables.add(renderer.onDidRenderAsync(() => {
                        hoverContentsElement.className = 'hover-contents code-hover-contents';
                        this._hover.onContentsChanged();
                    }));
                    const renderedContents = disposables.add(renderer.render(contents));
                    hoverContentsElement.appendChild(renderedContents.element);
                    fragment.appendChild(markdownHoverElement);
                }
            }
            return disposables;
        }
    };
    MarkdownHoverParticipant = __decorate([
        __param(2, modeService_1.IModeService),
        __param(3, opener_1.IOpenerService)
    ], MarkdownHoverParticipant);
    exports.MarkdownHoverParticipant = MarkdownHoverParticipant;
});
//# sourceMappingURL=markdownHoverParticipant.js.map