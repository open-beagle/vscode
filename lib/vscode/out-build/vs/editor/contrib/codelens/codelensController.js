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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/editor/browser/core/editorState", "vs/editor/browser/editorExtensions", "vs/editor/common/modes", "vs/editor/contrib/codelens/codelens", "vs/editor/contrib/codelens/codelensWidget", "vs/platform/commands/common/commands", "vs/platform/notification/common/notification", "vs/editor/contrib/codelens/codeLensCache", "vs/base/browser/dom", "vs/base/common/hash", "vs/platform/quickinput/common/quickInput", "vs/nls!vs/editor/contrib/codelens/codelensController", "vs/editor/common/editorContextKeys", "vs/editor/common/modes/languageFeatureRegistry"], function (require, exports, async_1, errors_1, lifecycle_1, editorState_1, editorExtensions_1, modes_1, codelens_1, codelensWidget_1, commands_1, notification_1, codeLensCache_1, dom, hash_1, quickInput_1, nls_1, editorContextKeys_1, languageFeatureRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeLensContribution = void 0;
    let CodeLensContribution = class CodeLensContribution {
        constructor(_editor, _commandService, _notificationService, _codeLensCache) {
            this._editor = _editor;
            this._commandService = _commandService;
            this._notificationService = _notificationService;
            this._codeLensCache = _codeLensCache;
            this._disposables = new lifecycle_1.DisposableStore();
            this._localToDispose = new lifecycle_1.DisposableStore();
            this._lenses = [];
            this._getCodeLensModelDelays = new languageFeatureRegistry_1.LanguageFeatureRequestDelays(modes_1.CodeLensProviderRegistry, 250, 2500);
            this._oldCodeLensModels = new lifecycle_1.DisposableStore();
            this._resolveCodeLensesDelays = new languageFeatureRegistry_1.LanguageFeatureRequestDelays(modes_1.CodeLensProviderRegistry, 250, 2500);
            this._resolveCodeLensesScheduler = new async_1.RunOnceScheduler(() => this._resolveCodeLensesInViewport(), this._resolveCodeLensesDelays.min);
            this._disposables.add(this._editor.onDidChangeModel(() => this._onModelChange()));
            this._disposables.add(this._editor.onDidChangeModelLanguage(() => this._onModelChange()));
            this._disposables.add(this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(40 /* fontInfo */) || e.hasChanged(14 /* codeLensFontSize */) || e.hasChanged(13 /* codeLensFontFamily */)) {
                    this._updateLensStyle();
                }
                if (e.hasChanged(12 /* codeLens */)) {
                    this._onModelChange();
                }
            }));
            this._disposables.add(modes_1.CodeLensProviderRegistry.onDidChange(this._onModelChange, this));
            this._onModelChange();
            this._styleClassName = '_' + (0, hash_1.hash)(this._editor.getId()).toString(16);
            this._styleElement = dom.createStyleSheet(dom.isInShadowDOM(this._editor.getContainerDomNode())
                ? this._editor.getContainerDomNode()
                : undefined);
            this._updateLensStyle();
        }
        dispose() {
            var _a;
            this._localDispose();
            this._disposables.dispose();
            this._oldCodeLensModels.dispose();
            (_a = this._currentCodeLensModel) === null || _a === void 0 ? void 0 : _a.dispose();
            this._styleElement.remove();
        }
        _getLayoutInfo() {
            let fontSize = this._editor.getOption(14 /* codeLensFontSize */);
            let codeLensHeight;
            if (!fontSize || fontSize < 5) {
                fontSize = (this._editor.getOption(42 /* fontSize */) * .9) | 0;
                codeLensHeight = this._editor.getOption(55 /* lineHeight */);
            }
            else {
                codeLensHeight = (fontSize * Math.max(1.3, this._editor.getOption(55 /* lineHeight */) / this._editor.getOption(42 /* fontSize */))) | 0;
            }
            return { codeLensHeight, fontSize };
        }
        _updateLensStyle() {
            const { codeLensHeight, fontSize } = this._getLayoutInfo();
            const fontFamily = this._editor.getOption(13 /* codeLensFontFamily */);
            const editorFontInfo = this._editor.getOption(40 /* fontInfo */);
            const fontFamilyVar = `--codelens-font-family${this._styleClassName}`;
            const fontFeaturesVar = `--codelens-font-features${this._styleClassName}`;
            let newStyle = `
		.monaco-editor .codelens-decoration.${this._styleClassName} { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; padding-right: ${Math.round(fontSize * 0.5)}px; font-feature-settings: var(${fontFeaturesVar}) }
		.monaco-editor .codelens-decoration.${this._styleClassName} span.codicon { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; }
		`;
            if (fontFamily) {
                newStyle += `.monaco-editor .codelens-decoration.${this._styleClassName} { font-family: var(${fontFamilyVar})}`;
            }
            this._styleElement.textContent = newStyle;
            this._editor.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily !== null && fontFamily !== void 0 ? fontFamily : 'inherit');
            this._editor.getContainerDomNode().style.setProperty(fontFeaturesVar, editorFontInfo.fontFeatureSettings);
            //
            this._editor.changeViewZones(accessor => {
                for (let lens of this._lenses) {
                    lens.updateHeight(codeLensHeight, accessor);
                }
            });
        }
        _localDispose() {
            var _a, _b, _c;
            (_a = this._getCodeLensModelPromise) === null || _a === void 0 ? void 0 : _a.cancel();
            this._getCodeLensModelPromise = undefined;
            (_b = this._resolveCodeLensesPromise) === null || _b === void 0 ? void 0 : _b.cancel();
            this._resolveCodeLensesPromise = undefined;
            this._localToDispose.clear();
            this._oldCodeLensModels.clear();
            (_c = this._currentCodeLensModel) === null || _c === void 0 ? void 0 : _c.dispose();
        }
        _onModelChange() {
            this._localDispose();
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            if (!this._editor.getOption(12 /* codeLens */)) {
                return;
            }
            const cachedLenses = this._codeLensCache.get(model);
            if (cachedLenses) {
                this._renderCodeLensSymbols(cachedLenses);
            }
            if (!modes_1.CodeLensProviderRegistry.has(model)) {
                // no provider -> return but check with
                // cached lenses. they expire after 30 seconds
                if (cachedLenses) {
                    this._localToDispose.add((0, async_1.disposableTimeout)(() => {
                        const cachedLensesNow = this._codeLensCache.get(model);
                        if (cachedLenses === cachedLensesNow) {
                            this._codeLensCache.delete(model);
                            this._onModelChange();
                        }
                    }, 30 * 1000));
                }
                return;
            }
            for (const provider of modes_1.CodeLensProviderRegistry.all(model)) {
                if (typeof provider.onDidChange === 'function') {
                    let registration = provider.onDidChange(() => scheduler.schedule());
                    this._localToDispose.add(registration);
                }
            }
            const scheduler = new async_1.RunOnceScheduler(() => {
                var _a;
                const t1 = Date.now();
                (_a = this._getCodeLensModelPromise) === null || _a === void 0 ? void 0 : _a.cancel();
                this._getCodeLensModelPromise = (0, async_1.createCancelablePromise)(token => (0, codelens_1.getCodeLensModel)(model, token));
                this._getCodeLensModelPromise.then(result => {
                    if (this._currentCodeLensModel) {
                        this._oldCodeLensModels.add(this._currentCodeLensModel);
                    }
                    this._currentCodeLensModel = result;
                    // cache model to reduce flicker
                    this._codeLensCache.put(model, result);
                    // update moving average
                    const newDelay = this._getCodeLensModelDelays.update(model, Date.now() - t1);
                    scheduler.delay = newDelay;
                    // render lenses
                    this._renderCodeLensSymbols(result);
                    this._resolveCodeLensesInViewport();
                }, errors_1.onUnexpectedError);
            }, this._getCodeLensModelDelays.get(model));
            this._localToDispose.add(scheduler);
            this._localToDispose.add((0, lifecycle_1.toDisposable)(() => this._resolveCodeLensesScheduler.cancel()));
            this._localToDispose.add(this._editor.onDidChangeModelContent(() => {
                this._editor.changeDecorations(decorationsAccessor => {
                    this._editor.changeViewZones(viewZonesAccessor => {
                        let toDispose = [];
                        let lastLensLineNumber = -1;
                        this._lenses.forEach((lens) => {
                            if (!lens.isValid() || lastLensLineNumber === lens.getLineNumber()) {
                                // invalid -> lens collapsed, attach range doesn't exist anymore
                                // line_number -> lenses should never be on the same line
                                toDispose.push(lens);
                            }
                            else {
                                lens.update(viewZonesAccessor);
                                lastLensLineNumber = lens.getLineNumber();
                            }
                        });
                        let helper = new codelensWidget_1.CodeLensHelper();
                        toDispose.forEach((l) => {
                            l.dispose(helper, viewZonesAccessor);
                            this._lenses.splice(this._lenses.indexOf(l), 1);
                        });
                        helper.commit(decorationsAccessor);
                    });
                });
                // Ask for all references again
                scheduler.schedule();
            }));
            this._localToDispose.add(this._editor.onDidFocusEditorWidget(() => {
                scheduler.schedule();
            }));
            this._localToDispose.add(this._editor.onDidScrollChange(e => {
                if (e.scrollTopChanged && this._lenses.length > 0) {
                    this._resolveCodeLensesInViewportSoon();
                }
            }));
            this._localToDispose.add(this._editor.onDidLayoutChange(() => {
                this._resolveCodeLensesInViewportSoon();
            }));
            this._localToDispose.add((0, lifecycle_1.toDisposable)(() => {
                if (this._editor.getModel()) {
                    const scrollState = editorState_1.StableEditorScrollState.capture(this._editor);
                    this._editor.changeDecorations(decorationsAccessor => {
                        this._editor.changeViewZones(viewZonesAccessor => {
                            this._disposeAllLenses(decorationsAccessor, viewZonesAccessor);
                        });
                    });
                    scrollState.restore(this._editor);
                }
                else {
                    // No accessors available
                    this._disposeAllLenses(undefined, undefined);
                }
            }));
            this._localToDispose.add(this._editor.onMouseDown(e => {
                if (e.target.type !== 9 /* CONTENT_WIDGET */) {
                    return;
                }
                let target = e.target.element;
                if ((target === null || target === void 0 ? void 0 : target.tagName) === 'SPAN') {
                    target = target.parentElement;
                }
                if ((target === null || target === void 0 ? void 0 : target.tagName) === 'A') {
                    for (const lens of this._lenses) {
                        let command = lens.getCommand(target);
                        if (command) {
                            this._commandService.executeCommand(command.id, ...(command.arguments || [])).catch(err => this._notificationService.error(err));
                            break;
                        }
                    }
                }
            }));
            scheduler.schedule();
        }
        _disposeAllLenses(decChangeAccessor, viewZoneChangeAccessor) {
            const helper = new codelensWidget_1.CodeLensHelper();
            for (const lens of this._lenses) {
                lens.dispose(helper, viewZoneChangeAccessor);
            }
            if (decChangeAccessor) {
                helper.commit(decChangeAccessor);
            }
            this._lenses.length = 0;
        }
        _renderCodeLensSymbols(symbols) {
            if (!this._editor.hasModel()) {
                return;
            }
            let maxLineNumber = this._editor.getModel().getLineCount();
            let groups = [];
            let lastGroup;
            for (let symbol of symbols.lenses) {
                let line = symbol.symbol.range.startLineNumber;
                if (line < 1 || line > maxLineNumber) {
                    // invalid code lens
                    continue;
                }
                else if (lastGroup && lastGroup[lastGroup.length - 1].symbol.range.startLineNumber === line) {
                    // on same line as previous
                    lastGroup.push(symbol);
                }
                else {
                    // on later line as previous
                    lastGroup = [symbol];
                    groups.push(lastGroup);
                }
            }
            const scrollState = editorState_1.StableEditorScrollState.capture(this._editor);
            const layoutInfo = this._getLayoutInfo();
            this._editor.changeDecorations(decorationsAccessor => {
                this._editor.changeViewZones(viewZoneAccessor => {
                    const helper = new codelensWidget_1.CodeLensHelper();
                    let codeLensIndex = 0;
                    let groupsIndex = 0;
                    while (groupsIndex < groups.length && codeLensIndex < this._lenses.length) {
                        let symbolsLineNumber = groups[groupsIndex][0].symbol.range.startLineNumber;
                        let codeLensLineNumber = this._lenses[codeLensIndex].getLineNumber();
                        if (codeLensLineNumber < symbolsLineNumber) {
                            this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
                            this._lenses.splice(codeLensIndex, 1);
                        }
                        else if (codeLensLineNumber === symbolsLineNumber) {
                            this._lenses[codeLensIndex].updateCodeLensSymbols(groups[groupsIndex], helper);
                            groupsIndex++;
                            codeLensIndex++;
                        }
                        else {
                            this._lenses.splice(codeLensIndex, 0, new codelensWidget_1.CodeLensWidget(groups[groupsIndex], this._editor, this._styleClassName, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
                            codeLensIndex++;
                            groupsIndex++;
                        }
                    }
                    // Delete extra code lenses
                    while (codeLensIndex < this._lenses.length) {
                        this._lenses[codeLensIndex].dispose(helper, viewZoneAccessor);
                        this._lenses.splice(codeLensIndex, 1);
                    }
                    // Create extra symbols
                    while (groupsIndex < groups.length) {
                        this._lenses.push(new codelensWidget_1.CodeLensWidget(groups[groupsIndex], this._editor, this._styleClassName, helper, viewZoneAccessor, layoutInfo.codeLensHeight, () => this._resolveCodeLensesInViewportSoon()));
                        groupsIndex++;
                    }
                    helper.commit(decorationsAccessor);
                });
            });
            scrollState.restore(this._editor);
        }
        _resolveCodeLensesInViewportSoon() {
            const model = this._editor.getModel();
            if (model) {
                this._resolveCodeLensesScheduler.schedule();
            }
        }
        _resolveCodeLensesInViewport() {
            var _a;
            (_a = this._resolveCodeLensesPromise) === null || _a === void 0 ? void 0 : _a.cancel();
            this._resolveCodeLensesPromise = undefined;
            const model = this._editor.getModel();
            if (!model) {
                return;
            }
            const toResolve = [];
            const lenses = [];
            this._lenses.forEach((lens) => {
                const request = lens.computeIfNecessary(model);
                if (request) {
                    toResolve.push(request);
                    lenses.push(lens);
                }
            });
            if (toResolve.length === 0) {
                return;
            }
            const t1 = Date.now();
            const resolvePromise = (0, async_1.createCancelablePromise)(token => {
                const promises = toResolve.map((request, i) => {
                    const resolvedSymbols = new Array(request.length);
                    const promises = request.map((request, i) => {
                        if (!request.symbol.command && typeof request.provider.resolveCodeLens === 'function') {
                            return Promise.resolve(request.provider.resolveCodeLens(model, request.symbol, token)).then(symbol => {
                                resolvedSymbols[i] = symbol;
                            }, errors_1.onUnexpectedExternalError);
                        }
                        else {
                            resolvedSymbols[i] = request.symbol;
                            return Promise.resolve(undefined);
                        }
                    });
                    return Promise.all(promises).then(() => {
                        if (!token.isCancellationRequested && !lenses[i].isDisposed()) {
                            lenses[i].updateCommands(resolvedSymbols);
                        }
                    });
                });
                return Promise.all(promises);
            });
            this._resolveCodeLensesPromise = resolvePromise;
            this._resolveCodeLensesPromise.then(() => {
                // update moving average
                const newDelay = this._resolveCodeLensesDelays.update(model, Date.now() - t1);
                this._resolveCodeLensesScheduler.delay = newDelay;
                if (this._currentCodeLensModel) { // update the cached state with new resolved items
                    this._codeLensCache.put(model, this._currentCodeLensModel);
                }
                this._oldCodeLensModels.clear(); // dispose old models once we have updated the UI with the current model
                if (resolvePromise === this._resolveCodeLensesPromise) {
                    this._resolveCodeLensesPromise = undefined;
                }
            }, err => {
                (0, errors_1.onUnexpectedError)(err); // can also be cancellation!
                if (resolvePromise === this._resolveCodeLensesPromise) {
                    this._resolveCodeLensesPromise = undefined;
                }
            });
        }
        getLenses() {
            return this._lenses;
        }
    };
    CodeLensContribution.ID = 'css.editor.codeLens';
    CodeLensContribution = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, notification_1.INotificationService),
        __param(3, codeLensCache_1.ICodeLensCache)
    ], CodeLensContribution);
    exports.CodeLensContribution = CodeLensContribution;
    (0, editorExtensions_1.registerEditorContribution)(CodeLensContribution.ID, CodeLensContribution);
    (0, editorExtensions_1.registerEditorAction)(class ShowLensesInCurrentLine extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'codelens.showLensesInCurrentLine',
                precondition: editorContextKeys_1.EditorContextKeys.hasCodeLensProvider,
                label: (0, nls_1.localize)(0, null),
                alias: 'Show CodeLens Commands For Current Line',
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const commandService = accessor.get(commands_1.ICommandService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const lineNumber = editor.getSelection().positionLineNumber;
            const codelensController = editor.getContribution(CodeLensContribution.ID);
            const items = [];
            for (let lens of codelensController.getLenses()) {
                if (lens.getLineNumber() === lineNumber) {
                    for (let item of lens.getItems()) {
                        const { command } = item.symbol;
                        if (command) {
                            items.push({
                                label: command.title,
                                command: command
                            });
                        }
                    }
                }
            }
            if (items.length === 0) {
                // We dont want an empty picker
                return;
            }
            const item = await quickInputService.pick(items, { canPickMany: false });
            if (!item) {
                // Nothing picked
                return;
            }
            try {
                await commandService.executeCommand(item.command.id, ...(item.command.arguments || []));
            }
            catch (err) {
                notificationService.error(err);
            }
        }
    });
});
//# sourceMappingURL=codelensController.js.map