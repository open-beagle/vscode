/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/browser/widget/inlineDiffMargin", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/base/common/codicons"], function (require, exports, nls, dom, actions_1, lifecycle_1, range_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineDiffMargin = void 0;
    class InlineDiffMargin extends lifecycle_1.Disposable {
        constructor(_viewZoneId, _marginDomNode, editor, diff, _contextMenuService, _clipboardService) {
            super();
            this._viewZoneId = _viewZoneId;
            this._marginDomNode = _marginDomNode;
            this.editor = editor;
            this.diff = diff;
            this._contextMenuService = _contextMenuService;
            this._clipboardService = _clipboardService;
            this._visibility = false;
            // make sure the diff margin shows above overlay.
            this._marginDomNode.style.zIndex = '10';
            this._diffActions = document.createElement('div');
            this._diffActions.className = codicons_1.Codicon.lightBulb.classNames + ' lightbulb-glyph';
            this._diffActions.style.position = 'absolute';
            const lineHeight = editor.getOption(55 /* lineHeight */);
            const lineFeed = editor.getModel().getEOL();
            this._diffActions.style.right = '0px';
            this._diffActions.style.visibility = 'hidden';
            this._diffActions.style.height = `${lineHeight}px`;
            this._diffActions.style.lineHeight = `${lineHeight}px`;
            this._marginDomNode.appendChild(this._diffActions);
            const actions = [];
            // default action
            actions.push(new actions_1.Action('diff.clipboard.copyDeletedContent', diff.originalEndLineNumber > diff.modifiedStartLineNumber
                ? nls.localize(0, null)
                : nls.localize(1, null), undefined, true, async () => {
                const range = new range_1.Range(diff.originalStartLineNumber, 1, diff.originalEndLineNumber + 1, 1);
                const deletedText = diff.originalModel.getValueInRange(range);
                await this._clipboardService.writeText(deletedText);
            }));
            let currentLineNumberOffset = 0;
            let copyLineAction = undefined;
            if (diff.originalEndLineNumber > diff.modifiedStartLineNumber) {
                copyLineAction = new actions_1.Action('diff.clipboard.copyDeletedLineContent', nls.localize(2, null, diff.originalStartLineNumber), undefined, true, async () => {
                    const lineContent = diff.originalModel.getLineContent(diff.originalStartLineNumber + currentLineNumberOffset);
                    await this._clipboardService.writeText(lineContent);
                });
                actions.push(copyLineAction);
            }
            const readOnly = editor.getOption(77 /* readOnly */);
            if (!readOnly) {
                actions.push(new actions_1.Action('diff.inline.revertChange', nls.localize(3, null), undefined, true, async () => {
                    const range = new range_1.Range(diff.originalStartLineNumber, 1, diff.originalEndLineNumber, diff.originalModel.getLineMaxColumn(diff.originalEndLineNumber));
                    const deletedText = diff.originalModel.getValueInRange(range);
                    if (diff.modifiedEndLineNumber === 0) {
                        // deletion only
                        const column = editor.getModel().getLineMaxColumn(diff.modifiedStartLineNumber);
                        editor.executeEdits('diffEditor', [
                            {
                                range: new range_1.Range(diff.modifiedStartLineNumber, column, diff.modifiedStartLineNumber, column),
                                text: lineFeed + deletedText
                            }
                        ]);
                    }
                    else {
                        const column = editor.getModel().getLineMaxColumn(diff.modifiedEndLineNumber);
                        editor.executeEdits('diffEditor', [
                            {
                                range: new range_1.Range(diff.modifiedStartLineNumber, 1, diff.modifiedEndLineNumber, column),
                                text: deletedText
                            }
                        ]);
                    }
                }));
            }
            const showContextMenu = (x, y) => {
                this._contextMenuService.showContextMenu({
                    getAnchor: () => {
                        return {
                            x,
                            y
                        };
                    },
                    getActions: () => {
                        if (copyLineAction) {
                            copyLineAction.label = nls.localize(4, null, diff.originalStartLineNumber + currentLineNumberOffset);
                        }
                        return actions;
                    },
                    autoSelectFirstItem: true
                });
            };
            this._register(dom.addStandardDisposableListener(this._diffActions, 'mousedown', e => {
                const { top, height } = dom.getDomNodePagePosition(this._diffActions);
                let pad = Math.floor(lineHeight / 3);
                e.preventDefault();
                showContextMenu(e.posx, top + height + pad);
            }));
            this._register(editor.onMouseMove((e) => {
                if (e.target.type === 8 /* CONTENT_VIEW_ZONE */ || e.target.type === 5 /* GUTTER_VIEW_ZONE */) {
                    const viewZoneId = e.target.detail.viewZoneId;
                    if (viewZoneId === this._viewZoneId) {
                        this.visibility = true;
                        currentLineNumberOffset = this._updateLightBulbPosition(this._marginDomNode, e.event.browserEvent.y, lineHeight);
                    }
                    else {
                        this.visibility = false;
                    }
                }
                else {
                    this.visibility = false;
                }
            }));
            this._register(editor.onMouseDown((e) => {
                if (!e.event.rightButton) {
                    return;
                }
                if (e.target.type === 8 /* CONTENT_VIEW_ZONE */ || e.target.type === 5 /* GUTTER_VIEW_ZONE */) {
                    const viewZoneId = e.target.detail.viewZoneId;
                    if (viewZoneId === this._viewZoneId) {
                        e.event.preventDefault();
                        currentLineNumberOffset = this._updateLightBulbPosition(this._marginDomNode, e.event.browserEvent.y, lineHeight);
                        showContextMenu(e.event.posx, e.event.posy + lineHeight);
                    }
                }
            }));
        }
        get visibility() {
            return this._visibility;
        }
        set visibility(_visibility) {
            if (this._visibility !== _visibility) {
                this._visibility = _visibility;
                if (_visibility) {
                    this._diffActions.style.visibility = 'visible';
                }
                else {
                    this._diffActions.style.visibility = 'hidden';
                }
            }
        }
        _updateLightBulbPosition(marginDomNode, y, lineHeight) {
            const { top } = dom.getDomNodePagePosition(marginDomNode);
            const offset = y - top;
            const lineNumberOffset = Math.floor(offset / lineHeight);
            const newTop = lineNumberOffset * lineHeight;
            this._diffActions.style.top = `${newTop}px`;
            if (this.diff.viewLineCounts) {
                let acc = 0;
                for (let i = 0; i < this.diff.viewLineCounts.length; i++) {
                    acc += this.diff.viewLineCounts[i];
                    if (lineNumberOffset < acc) {
                        return i;
                    }
                }
            }
            return lineNumberOffset;
        }
    }
    exports.InlineDiffMargin = InlineDiffMargin;
});
//# sourceMappingURL=inlineDiffMargin.js.map