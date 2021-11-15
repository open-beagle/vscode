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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/modes", "vs/base/common/arrays", "vs/platform/theme/common/colorRegistry", "vs/base/common/cancellation", "vs/platform/theme/common/themeService", "vs/editor/common/core/range", "vs/editor/common/modes/languageFeatureRegistry", "vs/base/common/htmlContent", "vs/platform/commands/common/commands", "vs/base/common/uri", "vs/base/common/types", "vs/editor/common/services/resolverService"], function (require, exports, async_1, errors_1, hash_1, lifecycle_1, editorExtensions_1, codeEditorService_1, modes_1, arrays_1, colorRegistry_1, cancellation_1, themeService_1, range_1, languageFeatureRegistry_1, htmlContent_1, commands_1, uri_1, types_1, resolverService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineHintsController = exports.getInlineHints = void 0;
    const MAX_DECORATORS = 500;
    async function getInlineHints(model, ranges, token) {
        const datas = [];
        const providers = modes_1.InlineHintsProviderRegistry.ordered(model).reverse();
        const promises = (0, arrays_1.flatten)(providers.map(provider => ranges.map(range => Promise.resolve(provider.provideInlineHints(model, range, token)).then(result => {
            if (result) {
                datas.push({ list: result, provider });
            }
        }, err => {
            (0, errors_1.onUnexpectedExternalError)(err);
        }))));
        await Promise.all(promises);
        return datas;
    }
    exports.getInlineHints = getInlineHints;
    let InlineHintsController = class InlineHintsController {
        constructor(_editor, _codeEditorService, _themeService) {
            this._editor = _editor;
            this._codeEditorService = _codeEditorService;
            this._themeService = _themeService;
            // static get(editor: ICodeEditor): InlineHintsController {
            // 	return editor.getContribution<InlineHintsController>(this.ID);
            // }
            this._disposables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this._getInlineHintsDelays = new languageFeatureRegistry_1.LanguageFeatureRequestDelays(modes_1.InlineHintsProviderRegistry, 250, 2500);
            this._decorationsTypeIds = [];
            this._decorationIds = [];
            this._disposables.add(modes_1.InlineHintsProviderRegistry.onDidChange(() => this._update()));
            this._disposables.add(_themeService.onDidColorThemeChange(() => this._update()));
            this._disposables.add(_editor.onDidChangeModel(() => this._update()));
            this._disposables.add(_editor.onDidChangeModelLanguage(() => this._update()));
            this._disposables.add(_editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(122 /* inlineHints */)) {
                    this._update();
                }
            }));
            this._update();
        }
        dispose() {
            this._sessionDisposables.dispose();
            this._removeAllDecorations();
            this._disposables.dispose();
        }
        _update() {
            this._sessionDisposables.clear();
            if (!this._editor.getOption(122 /* inlineHints */).enabled) {
                this._removeAllDecorations();
                return;
            }
            const model = this._editor.getModel();
            if (!model || !modes_1.InlineHintsProviderRegistry.has(model)) {
                this._removeAllDecorations();
                return;
            }
            const scheduler = new async_1.RunOnceScheduler(async () => {
                const t1 = Date.now();
                const cts = new cancellation_1.CancellationTokenSource();
                this._sessionDisposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
                const visibleRanges = this._editor.getVisibleRangesPlusViewportAboveBelow();
                const result = await getInlineHints(model, visibleRanges, cts.token);
                // update moving average
                const newDelay = this._getInlineHintsDelays.update(model, Date.now() - t1);
                scheduler.delay = newDelay;
                // render hints
                this._updateHintsDecorators(result);
            }, this._getInlineHintsDelays.get(model));
            this._sessionDisposables.add(scheduler);
            // update inline hints when content or scroll position changes
            this._sessionDisposables.add(this._editor.onDidChangeModelContent(() => scheduler.schedule()));
            this._disposables.add(this._editor.onDidScrollChange(() => scheduler.schedule()));
            scheduler.schedule();
            // update inline hints when any any provider fires an event
            const providerListener = new lifecycle_1.DisposableStore();
            this._sessionDisposables.add(providerListener);
            for (const provider of modes_1.InlineHintsProviderRegistry.all(model)) {
                if (typeof provider.onDidChangeInlineHints === 'function') {
                    providerListener.add(provider.onDidChangeInlineHints(() => scheduler.schedule()));
                }
            }
        }
        _updateHintsDecorators(hintsData) {
            const { fontSize, fontFamily } = this._getLayoutInfo();
            const backgroundColor = this._themeService.getColorTheme().getColor(colorRegistry_1.editorInlineHintBackground);
            const fontColor = this._themeService.getColorTheme().getColor(colorRegistry_1.editorInlineHintForeground);
            const newDecorationsTypeIds = [];
            const newDecorationsData = [];
            const fontFamilyVar = '--inlineHintsFontFamily';
            this._editor.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily);
            for (const { list: hints } of hintsData) {
                for (let j = 0; j < hints.length && newDecorationsData.length < MAX_DECORATORS; j++) {
                    const { text, range, description: hoverMessage, whitespaceBefore, whitespaceAfter } = hints[j];
                    const marginBefore = whitespaceBefore ? (fontSize / 3) | 0 : 0;
                    const marginAfter = whitespaceAfter ? (fontSize / 3) | 0 : 0;
                    const before = {
                        contentText: text,
                        backgroundColor: `${backgroundColor}`,
                        color: `${fontColor}`,
                        margin: `0px ${marginAfter}px 0px ${marginBefore}px`,
                        fontSize: `${fontSize}px`,
                        fontFamily: `var(${fontFamilyVar})`,
                        padding: `0px ${(fontSize / 4) | 0}px`,
                        borderRadius: `${(fontSize / 4) | 0}px`,
                    };
                    const key = 'inlineHints-' + (0, hash_1.hash)(before).toString(16);
                    this._codeEditorService.registerDecorationType(key, { before }, undefined, this._editor);
                    // decoration types are ref-counted which means we only need to
                    // call register und remove equally often
                    newDecorationsTypeIds.push(key);
                    const options = this._codeEditorService.resolveDecorationOptions(key, true);
                    if (typeof hoverMessage === 'string') {
                        options.hoverMessage = new htmlContent_1.MarkdownString().appendText(hoverMessage);
                    }
                    else if (hoverMessage) {
                        options.hoverMessage = hoverMessage;
                    }
                    newDecorationsData.push({
                        range,
                        options
                    });
                }
            }
            this._decorationsTypeIds.forEach(this._codeEditorService.removeDecorationType, this._codeEditorService);
            this._decorationsTypeIds = newDecorationsTypeIds;
            this._decorationIds = this._editor.deltaDecorations(this._decorationIds, newDecorationsData);
        }
        _getLayoutInfo() {
            const options = this._editor.getOption(122 /* inlineHints */);
            const editorFontSize = this._editor.getOption(42 /* fontSize */);
            let fontSize = options.fontSize;
            if (!fontSize || fontSize < 5 || fontSize > editorFontSize) {
                fontSize = (editorFontSize * .9) | 0;
            }
            const fontFamily = options.fontFamily;
            return { fontSize, fontFamily };
        }
        _removeAllDecorations() {
            this._decorationIds = this._editor.deltaDecorations(this._decorationIds, []);
            this._decorationsTypeIds.forEach(this._codeEditorService.removeDecorationType, this._codeEditorService);
            this._decorationsTypeIds = [];
        }
    };
    InlineHintsController.ID = 'editor.contrib.InlineHints';
    InlineHintsController = __decorate([
        __param(1, codeEditorService_1.ICodeEditorService),
        __param(2, themeService_1.IThemeService)
    ], InlineHintsController);
    exports.InlineHintsController = InlineHintsController;
    (0, editorExtensions_1.registerEditorContribution)(InlineHintsController.ID, InlineHintsController);
    commands_1.CommandsRegistry.registerCommand('_executeInlineHintProvider', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(range_1.Range.isIRange(range));
        const ref = await accessor.get(resolverService_1.ITextModelService).createModelReference(uri);
        try {
            const data = await getInlineHints(ref.object.textEditorModel, [range_1.Range.lift(range)], cancellation_1.CancellationToken.None);
            return (0, arrays_1.flatten)(data.map(item => item.list)).sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
        }
        finally {
            ref.dispose();
        }
    });
});
//# sourceMappingURL=inlineHintsController.js.map