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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/strings", "vs/platform/contextview/browser/contextView", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/editor/contrib/find/findModel", "vs/editor/contrib/find/findDecorations", "vs/editor/common/viewModel/prefixSumComputer", "vs/workbench/contrib/codeEditor/browser/find/simpleFindReplaceWidget", "vs/platform/theme/common/themeService", "vs/base/browser/dom", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/platform/actions/common/actions", "vs/nls!vs/workbench/contrib/notebook/browser/contrib/find/findController", "vs/workbench/services/editor/common/editorService", "vs/editor/contrib/find/findState", "vs/platform/configuration/common/configuration", "vs/editor/contrib/find/findController", "vs/editor/common/editorContextKeys", "vs/editor/contrib/find/findWidget", "vs/css!./media/notebookFind"], function (require, exports, aria_1, strings, contextView_1, contextkey_1, notebookBrowser_1, findModel_1, findDecorations_1, prefixSumComputer_1, simpleFindReplaceWidget_1, themeService_1, DOM, notebookEditorExtensions_1, actions_1, nls_1, editorService_1, findState_1, configuration_1, findController_1, editorContextKeys_1, findWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookFindWidget = void 0;
    const FIND_HIDE_TRANSITION = 'find-hide-transition';
    const FIND_SHOW_TRANSITION = 'find-show-transition';
    let MAX_MATCHES_COUNT_WIDTH = 69;
    let NotebookFindWidget = class NotebookFindWidget extends simpleFindReplaceWidget_1.SimpleFindReplaceWidget {
        constructor(_notebookEditor, contextViewService, contextKeyService, themeService, _configurationService) {
            super(contextViewService, contextKeyService, themeService, new findState_1.FindReplaceState(), true);
            this._notebookEditor = _notebookEditor;
            this._configurationService = _configurationService;
            this._findMatches = [];
            this._findMatchesStarts = null;
            this._currentMatch = -1;
            this._allMatchesDecorations = [];
            this._currentMatchDecorations = [];
            this._showTimeout = null;
            this._hideTimeout = null;
            DOM.append(this._notebookEditor.getDomNode(), this.getDomNode());
            this._findWidgetFocused = notebookBrowser_1.KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
            this._register(this._findInput.onKeyDown((e) => this._onFindInputKeyDown(e)));
            this.updateTheme(themeService.getColorTheme());
            this._register(themeService.onDidColorThemeChange(() => {
                this.updateTheme(themeService.getColorTheme());
            }));
            this._register(this._state.onFindReplaceStateChange(() => {
                this.onInputChanged();
            }));
            this._register(DOM.addDisposableListener(this.getDomNode(), DOM.EventType.FOCUS, e => {
                this._previousFocusElement = e.relatedTarget instanceof HTMLElement ? e.relatedTarget : undefined;
            }, true));
        }
        _onFindInputKeyDown(e) {
            if (e.equals(3 /* Enter */)) {
                if (this._findMatches.length) {
                    this.find(false);
                }
                else {
                    this.set(null, true);
                }
                e.preventDefault();
                return;
            }
            else if (e.equals(1024 /* Shift */ | 3 /* Enter */)) {
                if (this._findMatches.length) {
                    this.find(true);
                }
                else {
                    this.set(null, true);
                }
                e.preventDefault();
                return;
            }
        }
        onInputChanged() {
            const val = this.inputValue;
            const wordSeparators = this._configurationService.inspect('editor.wordSeparators').value;
            const options = { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), wordSeparators: wordSeparators };
            if (val) {
                this._findMatches = this._notebookEditor.viewModel.find(val, options).filter(match => match.matches.length > 0);
                this.set(this._findMatches, false);
                if (this._findMatches.length) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                this.set([], false);
            }
            return false;
        }
        find(previous) {
            if (!this._findMatches.length) {
                return;
            }
            // let currCell;
            if (!this._findMatchesStarts) {
                this.set(this._findMatches, true);
            }
            else {
                // const currIndex = this._findMatchesStarts!.getIndexOf(this._currentMatch);
                // currCell = this._findMatches[currIndex.index].cell;
                const totalVal = this._findMatchesStarts.getTotalValue();
                const nextVal = (this._currentMatch + (previous ? -1 : 1) + totalVal) % totalVal;
                this._currentMatch = nextVal;
            }
            const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
            // const newFocusedCell = this._findMatches[nextIndex.index].cell;
            this.setCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder);
            this.revealCellRange(nextIndex.index, nextIndex.remainder);
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.matches.length, 0), undefined);
            // if (currCell && currCell !== newFocusedCell && currCell.getEditState() === CellEditState.Editing && currCell.editStateSource === 'find') {
            // 	currCell.updateEditState(CellEditState.Preview, 'find');
            // }
            // this._updateMatchesCount();
        }
        replaceOne() {
            if (!this._findMatches.length) {
                return;
            }
            if (!this._findMatchesStarts) {
                this.set(this._findMatches, true);
            }
            const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
            const cell = this._findMatches[nextIndex.index].cell;
            const match = this._findMatches[nextIndex.index].matches[nextIndex.remainder];
            this._progressBar.infinite().show();
            this._notebookEditor.viewModel.replaceOne(cell, match.range, this.replaceValue).then(() => {
                this._progressBar.stop();
            });
        }
        replaceAll() {
            this._progressBar.infinite().show();
            this._notebookEditor.viewModel.replaceAll(this._findMatches, this.replaceValue).then(() => {
                this._progressBar.stop();
            });
        }
        revealCellRange(cellIndex, matchIndex) {
            this._findMatches[cellIndex].cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'find');
            this._notebookEditor.focusElement(this._findMatches[cellIndex].cell);
            this._notebookEditor.setCellEditorSelection(this._findMatches[cellIndex].cell, this._findMatches[cellIndex].matches[matchIndex].range);
            this._notebookEditor.revealRangeInCenterIfOutsideViewportAsync(this._findMatches[cellIndex].cell, this._findMatches[cellIndex].matches[matchIndex].range);
        }
        findFirst() { }
        onFocusTrackerFocus() {
            this._findWidgetFocused.set(true);
        }
        onFocusTrackerBlur() {
            this._previousFocusElement = undefined;
            this._findWidgetFocused.reset();
        }
        onReplaceInputFocusTrackerFocus() {
            // throw new Error('Method not implemented.');
        }
        onReplaceInputFocusTrackerBlur() {
            // throw new Error('Method not implemented.');
        }
        onFindInputFocusTrackerFocus() { }
        onFindInputFocusTrackerBlur() { }
        constructFindMatchesStarts() {
            if (this._findMatches && this._findMatches.length) {
                const values = new Uint32Array(this._findMatches.length);
                for (let i = 0; i < this._findMatches.length; i++) {
                    values[i] = this._findMatches[i].matches.length;
                }
                this._findMatchesStarts = new prefixSumComputer_1.PrefixSumComputer(values);
            }
            else {
                this._findMatchesStarts = null;
            }
        }
        set(cellFindMatches, autoStart) {
            if (!cellFindMatches || !cellFindMatches.length) {
                this._findMatches = [];
                this.setAllFindMatchesDecorations([]);
                this.constructFindMatchesStarts();
                this._currentMatch = -1;
                this.clearCurrentFindMatchDecoration();
                return;
            }
            // all matches
            this._findMatches = cellFindMatches;
            this.setAllFindMatchesDecorations(cellFindMatches || []);
            // current match
            this.constructFindMatchesStarts();
            if (autoStart) {
                this._currentMatch = 0;
                this.setCurrentFindMatchDecoration(0, 0);
            }
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.matches.length, 0), undefined);
        }
        setCurrentFindMatchDecoration(cellIndex, matchIndex) {
            this._notebookEditor.changeModelDecorations(accessor => {
                const findMatchesOptions = findDecorations_1.FindDecorations._CURRENT_FIND_MATCH_DECORATION;
                const cell = this._findMatches[cellIndex].cell;
                const match = this._findMatches[cellIndex].matches[matchIndex];
                const decorations = [
                    { range: match.range, options: findMatchesOptions }
                ];
                const deltaDecoration = {
                    ownerId: cell.handle,
                    decorations: decorations
                };
                this._currentMatchDecorations = accessor.deltaDecorations(this._currentMatchDecorations, [deltaDecoration]);
            });
        }
        clearCurrentFindMatchDecoration() {
            this._notebookEditor.changeModelDecorations(accessor => {
                this._currentMatchDecorations = accessor.deltaDecorations(this._currentMatchDecorations, []);
            });
        }
        setAllFindMatchesDecorations(cellFindMatches) {
            this._notebookEditor.changeModelDecorations((accessor) => {
                const findMatchesOptions = findDecorations_1.FindDecorations._FIND_MATCH_DECORATION;
                const deltaDecorations = cellFindMatches.map(cellFindMatch => {
                    const findMatches = cellFindMatch.matches;
                    // Find matches
                    const newFindMatchesDecorations = new Array(findMatches.length);
                    for (let i = 0, len = findMatches.length; i < len; i++) {
                        newFindMatchesDecorations[i] = {
                            range: findMatches[i].range,
                            options: findMatchesOptions
                        };
                    }
                    return { ownerId: cellFindMatch.cell.handle, decorations: newFindMatchesDecorations };
                });
                this._allMatchesDecorations = accessor.deltaDecorations(this._allMatchesDecorations, deltaDecorations);
            });
        }
        show(initialInput) {
            super.show(initialInput);
            this._findInput.select();
            if (this._showTimeout === null) {
                if (this._hideTimeout !== null) {
                    window.clearTimeout(this._hideTimeout);
                    this._hideTimeout = null;
                    this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
                }
                this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
                this._showTimeout = window.setTimeout(() => {
                    this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
                    this._showTimeout = null;
                }, 200);
            }
            else {
                // no op
            }
        }
        replace(initialFindInput, initialReplaceInput) {
            super.showWithReplace(initialFindInput, initialReplaceInput);
            this._replaceInput.select();
            if (this._showTimeout === null) {
                if (this._hideTimeout !== null) {
                    window.clearTimeout(this._hideTimeout);
                    this._hideTimeout = null;
                    this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
                }
                this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
                this._showTimeout = window.setTimeout(() => {
                    this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
                    this._showTimeout = null;
                }, 200);
            }
            else {
                // no op
            }
        }
        hide() {
            var _a;
            super.hide();
            this.set([], false);
            if (this._hideTimeout === null) {
                if (this._showTimeout !== null) {
                    window.clearTimeout(this._showTimeout);
                    this._showTimeout = null;
                    this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
                }
                this._notebookEditor.addClassName(FIND_HIDE_TRANSITION);
                this._hideTimeout = window.setTimeout(() => {
                    this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
                }, 200);
            }
            else {
                // no op
            }
            if (this._previousFocusElement && this._previousFocusElement.offsetParent) {
                this._previousFocusElement.focus();
                this._previousFocusElement = undefined;
            }
            (_a = this._notebookEditor.viewModel) === null || _a === void 0 ? void 0 : _a.viewCells.forEach(cell => {
                if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && cell.editStateSource === 'find') {
                    cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'find');
                }
            });
        }
        _updateMatchesCount() {
            if (!this._findMatches) {
                return;
            }
            this._matchesCount.style.minWidth = MAX_MATCHES_COUNT_WIDTH + 'px';
            this._matchesCount.title = '';
            // remove previous content
            if (this._matchesCount.firstChild) {
                this._matchesCount.removeChild(this._matchesCount.firstChild);
            }
            let label;
            if (this._state.matchesCount > 0) {
                let matchesCount = String(this._state.matchesCount);
                if (this._state.matchesCount >= findModel_1.MATCHES_LIMIT) {
                    matchesCount += '+';
                }
                let matchesPosition = this._currentMatch < 0 ? '?' : String((this._currentMatch + 1));
                label = strings.format(findWidget_1.NLS_MATCHES_LOCATION, matchesPosition, matchesCount);
            }
            else {
                label = findWidget_1.NLS_NO_RESULTS;
            }
            this._matchesCount.appendChild(document.createTextNode(label));
            (0, aria_1.alert)(this._getAriaLabel(label, this._state.currentMatch, this._state.searchString));
            MAX_MATCHES_COUNT_WIDTH = Math.max(MAX_MATCHES_COUNT_WIDTH, this._matchesCount.clientWidth);
        }
        _getAriaLabel(label, currentMatch, searchString) {
            if (label === findWidget_1.NLS_NO_RESULTS) {
                return searchString === ''
                    ? (0, nls_1.localize)(0, null, label)
                    : (0, nls_1.localize)(1, null, label, searchString);
            }
            // TODO@rebornix, aria for `cell ${index}, line {line}`
            return (0, nls_1.localize)(2, null, label, searchString);
        }
        clear() {
            this._currentMatch = -1;
            this._findMatches = [];
        }
        dispose() {
            var _a, _b;
            (_a = this._notebookEditor) === null || _a === void 0 ? void 0 : _a.removeClassName(FIND_SHOW_TRANSITION);
            (_b = this._notebookEditor) === null || _b === void 0 ? void 0 : _b.removeClassName(FIND_HIDE_TRANSITION);
            super.dispose();
        }
    };
    NotebookFindWidget.id = 'workbench.notebook.find';
    NotebookFindWidget = __decorate([
        __param(1, contextView_1.IContextViewService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, themeService_1.IThemeService),
        __param(4, configuration_1.IConfigurationService)
    ], NotebookFindWidget);
    exports.NotebookFindWidget = NotebookFindWidget;
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookFindWidget.id, NotebookFindWidget);
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.hideFind',
                title: { value: (0, nls_1.localize)(3, null), original: 'Hide Find in Notebook' },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, notebookBrowser_1.KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED),
                    primary: 9 /* Escape */,
                    weight: 200 /* WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const controller = editor.getContribution(NotebookFindWidget.id);
            controller.hide();
            editor.focus();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.find',
                title: { value: (0, nls_1.localize)(4, null), original: 'Find in Notebook' },
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.or(notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED, contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR, editorContextKeys_1.EditorContextKeys.focus.toNegated())),
                    primary: 36 /* KEY_F */ | 2048 /* CtrlCmd */,
                    weight: 200 /* WorkbenchContrib */
                }
            });
        }
        async run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
            if (!editor) {
                return;
            }
            const controller = editor.getContribution(NotebookFindWidget.id);
            controller.show();
        }
    });
    findController_1.StartFindAction.addImplementation(100, (accessor, args) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!editor) {
            return false;
        }
        const controller = editor.getContribution(NotebookFindWidget.id);
        controller.show();
        return true;
    });
    findController_1.StartFindReplaceAction.addImplementation(100, (accessor, args) => {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(editorService.activeEditorPane);
        if (!editor) {
            return false;
        }
        const controller = editor.getContribution(NotebookFindWidget.id);
        controller.replace();
        return true;
    });
});
//# sourceMappingURL=findController.js.map