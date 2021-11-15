/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/contrib/quickAccess/gotoSymbolQuickAccess", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/contrib/quickAccess/editorNavigationQuickAccess", "vs/editor/common/modes", "vs/editor/contrib/documentSymbols/outlineModel", "vs/base/common/strings", "vs/base/common/fuzzyScorer", "vs/base/common/codicons"], function (require, exports, nls_1, cancellation_1, lifecycle_1, range_1, editorNavigationQuickAccess_1, modes_1, outlineModel_1, strings_1, fuzzyScorer_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractGotoSymbolQuickAccessProvider = void 0;
    class AbstractGotoSymbolQuickAccessProvider extends editorNavigationQuickAccess_1.AbstractEditorNavigationQuickAccessProvider {
        constructor(options = Object.create(null)) {
            super(options);
            this.options = options;
            this.options.canAcceptInBackground = true;
        }
        provideWithoutTextEditor(picker) {
            this.provideLabelPick(picker, (0, nls_1.localize)(0, null));
            return lifecycle_1.Disposable.None;
        }
        provideWithTextEditor(context, picker, token) {
            const editor = context.editor;
            const model = this.getModel(editor);
            if (!model) {
                return lifecycle_1.Disposable.None;
            }
            // Provide symbols from model if available in registry
            if (modes_1.DocumentSymbolProviderRegistry.has(model)) {
                return this.doProvideWithEditorSymbols(context, model, picker, token);
            }
            // Otherwise show an entry for a model without registry
            // But give a chance to resolve the symbols at a later
            // point if possible
            return this.doProvideWithoutEditorSymbols(context, model, picker, token);
        }
        doProvideWithoutEditorSymbols(context, model, picker, token) {
            const disposables = new lifecycle_1.DisposableStore();
            // Generic pick for not having any symbol information
            this.provideLabelPick(picker, (0, nls_1.localize)(1, null));
            // Wait for changes to the registry and see if eventually
            // we do get symbols. This can happen if the picker is opened
            // very early after the model has loaded but before the
            // language registry is ready.
            // https://github.com/microsoft/vscode/issues/70607
            (async () => {
                const result = await this.waitForLanguageSymbolRegistry(model, disposables);
                if (!result || token.isCancellationRequested) {
                    return;
                }
                disposables.add(this.doProvideWithEditorSymbols(context, model, picker, token));
            })();
            return disposables;
        }
        provideLabelPick(picker, label) {
            picker.items = [{ label, index: 0, kind: 14 /* String */ }];
            picker.ariaLabel = label;
        }
        async waitForLanguageSymbolRegistry(model, disposables) {
            if (modes_1.DocumentSymbolProviderRegistry.has(model)) {
                return true;
            }
            let symbolProviderRegistryPromiseResolve;
            const symbolProviderRegistryPromise = new Promise(resolve => symbolProviderRegistryPromiseResolve = resolve);
            // Resolve promise when registry knows model
            const symbolProviderListener = disposables.add(modes_1.DocumentSymbolProviderRegistry.onDidChange(() => {
                if (modes_1.DocumentSymbolProviderRegistry.has(model)) {
                    symbolProviderListener.dispose();
                    symbolProviderRegistryPromiseResolve(true);
                }
            }));
            // Resolve promise when we get disposed too
            disposables.add((0, lifecycle_1.toDisposable)(() => symbolProviderRegistryPromiseResolve(false)));
            return symbolProviderRegistryPromise;
        }
        doProvideWithEditorSymbols(context, model, picker, token) {
            const editor = context.editor;
            const disposables = new lifecycle_1.DisposableStore();
            // Goto symbol once picked
            disposables.add(picker.onDidAccept(event => {
                const [item] = picker.selectedItems;
                if (item && item.range) {
                    this.gotoLocation(context, { range: item.range.selection, keyMods: picker.keyMods, preserveFocus: event.inBackground });
                    if (!event.inBackground) {
                        picker.hide();
                    }
                }
            }));
            // Goto symbol side by side if enabled
            disposables.add(picker.onDidTriggerItemButton(({ item }) => {
                if (item && item.range) {
                    this.gotoLocation(context, { range: item.range.selection, keyMods: picker.keyMods, forceSideBySide: true });
                    picker.hide();
                }
            }));
            // Resolve symbols from document once and reuse this
            // request for all filtering and typing then on
            const symbolsPromise = this.getDocumentSymbols(model, token);
            // Set initial picks and update on type
            let picksCts = undefined;
            const updatePickerItems = async () => {
                // Cancel any previous ask for picks and busy
                picksCts === null || picksCts === void 0 ? void 0 : picksCts.dispose(true);
                picker.busy = false;
                // Create new cancellation source for this run
                picksCts = new cancellation_1.CancellationTokenSource(token);
                // Collect symbol picks
                picker.busy = true;
                try {
                    const query = (0, fuzzyScorer_1.prepareQuery)(picker.value.substr(AbstractGotoSymbolQuickAccessProvider.PREFIX.length).trim());
                    const items = await this.doGetSymbolPicks(symbolsPromise, query, undefined, picksCts.token);
                    if (token.isCancellationRequested) {
                        return;
                    }
                    if (items.length > 0) {
                        picker.items = items;
                    }
                    else {
                        if (query.original.length > 0) {
                            this.provideLabelPick(picker, (0, nls_1.localize)(2, null));
                        }
                        else {
                            this.provideLabelPick(picker, (0, nls_1.localize)(3, null));
                        }
                    }
                }
                finally {
                    if (!token.isCancellationRequested) {
                        picker.busy = false;
                    }
                }
            };
            disposables.add(picker.onDidChangeValue(() => updatePickerItems()));
            updatePickerItems();
            // Reveal and decorate when active item changes
            // However, ignore the very first event so that
            // opening the picker is not immediately revealing
            // and decorating the first entry.
            let ignoreFirstActiveEvent = true;
            disposables.add(picker.onDidChangeActive(() => {
                const [item] = picker.activeItems;
                if (item && item.range) {
                    if (ignoreFirstActiveEvent) {
                        ignoreFirstActiveEvent = false;
                        return;
                    }
                    // Reveal
                    editor.revealRangeInCenter(item.range.selection, 0 /* Smooth */);
                    // Decorate
                    this.addDecorations(editor, item.range.decoration);
                }
            }));
            return disposables;
        }
        async doGetSymbolPicks(symbolsPromise, query, options, token) {
            const symbols = await symbolsPromise;
            if (token.isCancellationRequested) {
                return [];
            }
            const filterBySymbolKind = query.original.indexOf(AbstractGotoSymbolQuickAccessProvider.SCOPE_PREFIX) === 0;
            const filterPos = filterBySymbolKind ? 1 : 0;
            // Split between symbol and container query
            let symbolQuery;
            let containerQuery;
            if (query.values && query.values.length > 1) {
                symbolQuery = (0, fuzzyScorer_1.pieceToQuery)(query.values[0]); // symbol: only match on first part
                containerQuery = (0, fuzzyScorer_1.pieceToQuery)(query.values.slice(1)); // container: match on all but first parts
            }
            else {
                symbolQuery = query;
            }
            // Convert to symbol picks and apply filtering
            const filteredSymbolPicks = [];
            for (let index = 0; index < symbols.length; index++) {
                const symbol = symbols[index];
                const symbolLabel = (0, strings_1.trim)(symbol.name);
                const symbolLabelWithIcon = `$(symbol-${modes_1.SymbolKinds.toString(symbol.kind) || 'property'}) ${symbolLabel}`;
                const symbolLabelIconOffset = symbolLabelWithIcon.length - symbolLabel.length;
                let containerLabel = symbol.containerName;
                if (options === null || options === void 0 ? void 0 : options.extraContainerLabel) {
                    if (containerLabel) {
                        containerLabel = `${options.extraContainerLabel} • ${containerLabel}`;
                    }
                    else {
                        containerLabel = options.extraContainerLabel;
                    }
                }
                let symbolScore = undefined;
                let symbolMatches = undefined;
                let containerScore = undefined;
                let containerMatches = undefined;
                if (query.original.length > filterPos) {
                    // First: try to score on the entire query, it is possible that
                    // the symbol matches perfectly (e.g. searching for "change log"
                    // can be a match on a markdown symbol "change log"). In that
                    // case we want to skip the container query altogether.
                    let skipContainerQuery = false;
                    if (symbolQuery !== query) {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(symbolLabelWithIcon, Object.assign(Object.assign({}, query), { values: undefined /* disable multi-query support */ }), filterPos, symbolLabelIconOffset);
                        if (typeof symbolScore === 'number') {
                            skipContainerQuery = true; // since we consumed the query, skip any container matching
                        }
                    }
                    // Otherwise: score on the symbol query and match on the container later
                    if (typeof symbolScore !== 'number') {
                        [symbolScore, symbolMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(symbolLabelWithIcon, symbolQuery, filterPos, symbolLabelIconOffset);
                        if (typeof symbolScore !== 'number') {
                            continue;
                        }
                    }
                    // Score by container if specified
                    if (!skipContainerQuery && containerQuery) {
                        if (containerLabel && containerQuery.original.length > 0) {
                            [containerScore, containerMatches] = (0, fuzzyScorer_1.scoreFuzzy2)(containerLabel, containerQuery);
                        }
                        if (typeof containerScore !== 'number') {
                            continue;
                        }
                        if (typeof symbolScore === 'number') {
                            symbolScore += containerScore; // boost symbolScore by containerScore
                        }
                    }
                }
                const deprecated = symbol.tags && symbol.tags.indexOf(1 /* Deprecated */) >= 0;
                filteredSymbolPicks.push({
                    index,
                    kind: symbol.kind,
                    score: symbolScore,
                    label: symbolLabelWithIcon,
                    ariaLabel: symbolLabel,
                    description: containerLabel,
                    highlights: deprecated ? undefined : {
                        label: symbolMatches,
                        description: containerMatches
                    },
                    range: {
                        selection: range_1.Range.collapseToStart(symbol.selectionRange),
                        decoration: symbol.range
                    },
                    strikethrough: deprecated,
                    buttons: (() => {
                        var _a, _b;
                        const openSideBySideDirection = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.openSideBySideDirection) ? (_b = this.options) === null || _b === void 0 ? void 0 : _b.openSideBySideDirection() : undefined;
                        if (!openSideBySideDirection) {
                            return undefined;
                        }
                        return [
                            {
                                iconClass: openSideBySideDirection === 'right' ? codicons_1.Codicon.splitHorizontal.classNames : codicons_1.Codicon.splitVertical.classNames,
                                tooltip: openSideBySideDirection === 'right' ? (0, nls_1.localize)(4, null) : (0, nls_1.localize)(5, null)
                            }
                        ];
                    })()
                });
            }
            // Sort by score
            const sortedFilteredSymbolPicks = filteredSymbolPicks.sort((symbolA, symbolB) => filterBySymbolKind ?
                this.compareByKindAndScore(symbolA, symbolB) :
                this.compareByScore(symbolA, symbolB));
            // Add separator for types
            // - @  only total number of symbols
            // - @: grouped by symbol kind
            let symbolPicks = [];
            if (filterBySymbolKind) {
                let lastSymbolKind = undefined;
                let lastSeparator = undefined;
                let lastSymbolKindCounter = 0;
                function updateLastSeparatorLabel() {
                    if (lastSeparator && typeof lastSymbolKind === 'number' && lastSymbolKindCounter > 0) {
                        lastSeparator.label = (0, strings_1.format)(NLS_SYMBOL_KIND_CACHE[lastSymbolKind] || FALLBACK_NLS_SYMBOL_KIND, lastSymbolKindCounter);
                    }
                }
                for (const symbolPick of sortedFilteredSymbolPicks) {
                    // Found new kind
                    if (lastSymbolKind !== symbolPick.kind) {
                        // Update last separator with number of symbols we found for kind
                        updateLastSeparatorLabel();
                        lastSymbolKind = symbolPick.kind;
                        lastSymbolKindCounter = 1;
                        // Add new separator for new kind
                        lastSeparator = { type: 'separator' };
                        symbolPicks.push(lastSeparator);
                    }
                    // Existing kind, keep counting
                    else {
                        lastSymbolKindCounter++;
                    }
                    // Add to final result
                    symbolPicks.push(symbolPick);
                }
                // Update last separator with number of symbols we found for kind
                updateLastSeparatorLabel();
            }
            else if (sortedFilteredSymbolPicks.length > 0) {
                symbolPicks = [
                    { label: (0, nls_1.localize)(6, null, filteredSymbolPicks.length), type: 'separator' },
                    ...sortedFilteredSymbolPicks
                ];
            }
            return symbolPicks;
        }
        compareByScore(symbolA, symbolB) {
            if (typeof symbolA.score !== 'number' && typeof symbolB.score === 'number') {
                return 1;
            }
            else if (typeof symbolA.score === 'number' && typeof symbolB.score !== 'number') {
                return -1;
            }
            if (typeof symbolA.score === 'number' && typeof symbolB.score === 'number') {
                if (symbolA.score > symbolB.score) {
                    return -1;
                }
                else if (symbolA.score < symbolB.score) {
                    return 1;
                }
            }
            if (symbolA.index < symbolB.index) {
                return -1;
            }
            else if (symbolA.index > symbolB.index) {
                return 1;
            }
            return 0;
        }
        compareByKindAndScore(symbolA, symbolB) {
            const kindA = NLS_SYMBOL_KIND_CACHE[symbolA.kind] || FALLBACK_NLS_SYMBOL_KIND;
            const kindB = NLS_SYMBOL_KIND_CACHE[symbolB.kind] || FALLBACK_NLS_SYMBOL_KIND;
            // Sort by type first if scoped search
            const result = kindA.localeCompare(kindB);
            if (result === 0) {
                return this.compareByScore(symbolA, symbolB);
            }
            return result;
        }
        async getDocumentSymbols(document, token) {
            const model = await outlineModel_1.OutlineModel.create(document, token);
            return token.isCancellationRequested ? [] : model.asListOfDocumentSymbols();
        }
    }
    exports.AbstractGotoSymbolQuickAccessProvider = AbstractGotoSymbolQuickAccessProvider;
    AbstractGotoSymbolQuickAccessProvider.PREFIX = '@';
    AbstractGotoSymbolQuickAccessProvider.SCOPE_PREFIX = ':';
    AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY = `${AbstractGotoSymbolQuickAccessProvider.PREFIX}${AbstractGotoSymbolQuickAccessProvider.SCOPE_PREFIX}`;
    // #region NLS Helpers
    const FALLBACK_NLS_SYMBOL_KIND = (0, nls_1.localize)(7, null);
    const NLS_SYMBOL_KIND_CACHE = {
        [5 /* Method */]: (0, nls_1.localize)(8, null),
        [11 /* Function */]: (0, nls_1.localize)(9, null),
        [8 /* Constructor */]: (0, nls_1.localize)(10, null),
        [12 /* Variable */]: (0, nls_1.localize)(11, null),
        [4 /* Class */]: (0, nls_1.localize)(12, null),
        [22 /* Struct */]: (0, nls_1.localize)(13, null),
        [23 /* Event */]: (0, nls_1.localize)(14, null),
        [24 /* Operator */]: (0, nls_1.localize)(15, null),
        [10 /* Interface */]: (0, nls_1.localize)(16, null),
        [2 /* Namespace */]: (0, nls_1.localize)(17, null),
        [3 /* Package */]: (0, nls_1.localize)(18, null),
        [25 /* TypeParameter */]: (0, nls_1.localize)(19, null),
        [1 /* Module */]: (0, nls_1.localize)(20, null),
        [6 /* Property */]: (0, nls_1.localize)(21, null),
        [9 /* Enum */]: (0, nls_1.localize)(22, null),
        [21 /* EnumMember */]: (0, nls_1.localize)(23, null),
        [14 /* String */]: (0, nls_1.localize)(24, null),
        [0 /* File */]: (0, nls_1.localize)(25, null),
        [17 /* Array */]: (0, nls_1.localize)(26, null),
        [15 /* Number */]: (0, nls_1.localize)(27, null),
        [16 /* Boolean */]: (0, nls_1.localize)(28, null),
        [18 /* Object */]: (0, nls_1.localize)(29, null),
        [19 /* Key */]: (0, nls_1.localize)(30, null),
        [7 /* Field */]: (0, nls_1.localize)(31, null),
        [13 /* Constant */]: (0, nls_1.localize)(32, null)
    };
});
//#endregion
//# sourceMappingURL=gotoSymbolQuickAccess.js.map