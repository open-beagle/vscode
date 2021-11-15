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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/quickaccess/gotoSymbolQuickAccess", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/editor/common/editorService", "vs/platform/registry/common/platform", "vs/platform/quickinput/common/quickAccess", "vs/editor/contrib/quickAccess/gotoSymbolQuickAccess", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/actions/common/actions", "vs/base/common/fuzzyScorer", "vs/base/common/filters", "vs/base/common/errors", "vs/workbench/services/outline/browser/outline", "vs/editor/browser/editorBrowser"], function (require, exports, nls_1, quickInput_1, editorService_1, platform_1, quickAccess_1, gotoSymbolQuickAccess_1, configuration_1, lifecycle_1, async_1, cancellation_1, actions_1, fuzzyScorer_1, filters_1, errors_1, outline_1, editorBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GotoSymbolQuickAccessProvider = void 0;
    let GotoSymbolQuickAccessProvider = class GotoSymbolQuickAccessProvider extends gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider {
        constructor(editorService, configurationService, outlineService) {
            super({
                openSideBySideDirection: () => this.configuration.openSideBySideDirection
            });
            this.editorService = editorService;
            this.configurationService = configurationService;
            this.outlineService = outlineService;
            this.onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
        }
        //#region DocumentSymbols (text editor required)
        get configuration() {
            var _a;
            const editorConfig = (_a = this.configurationService.getValue().workbench) === null || _a === void 0 ? void 0 : _a.editor;
            return {
                openEditorPinned: !(editorConfig === null || editorConfig === void 0 ? void 0 : editorConfig.enablePreviewFromQuickOpen) || !(editorConfig === null || editorConfig === void 0 ? void 0 : editorConfig.enablePreview),
                openSideBySideDirection: editorConfig === null || editorConfig === void 0 ? void 0 : editorConfig.openSideBySideDirection
            };
        }
        get activeTextEditorControl() {
            // TODO@bpasero this distinction should go away by adopting `IOutlineService`
            // for all editors (either text based ones or not). Currently text based
            // editors are not yet using the new outline service infrastructure but the
            // "classical" document symbols approach.
            var _a;
            if ((0, editorBrowser_1.isCompositeEditor)((_a = this.editorService.activeEditorPane) === null || _a === void 0 ? void 0 : _a.getControl())) {
                return undefined;
            }
            return this.editorService.activeTextEditorControl;
        }
        gotoLocation(context, options) {
            var _a;
            // Check for sideBySide use
            if ((options.keyMods.alt || (this.configuration.openEditorPinned && options.keyMods.ctrlCmd) || options.forceSideBySide) && this.editorService.activeEditor) {
                (_a = context.restoreViewState) === null || _a === void 0 ? void 0 : _a.call(context); // since we open to the side, restore view state in this editor
                this.editorService.openEditor(this.editorService.activeEditor, {
                    selection: options.range,
                    pinned: options.keyMods.ctrlCmd || this.configuration.openEditorPinned,
                    preserveFocus: options.preserveFocus
                }, editorService_1.SIDE_GROUP);
            }
            // Otherwise let parent handle it
            else {
                super.gotoLocation(context, options);
            }
        }
        async getSymbolPicks(model, filter, options, disposables, token) {
            // If the registry does not know the model, we wait for as long as
            // the registry knows it. This helps in cases where a language
            // registry was not activated yet for providing any symbols.
            // To not wait forever, we eventually timeout though.
            const result = await Promise.race([
                this.waitForLanguageSymbolRegistry(model, disposables),
                (0, async_1.timeout)(GotoSymbolQuickAccessProvider.SYMBOL_PICKS_TIMEOUT)
            ]);
            if (!result || token.isCancellationRequested) {
                return [];
            }
            return this.doGetSymbolPicks(this.getDocumentSymbols(model, token), (0, fuzzyScorer_1.prepareQuery)(filter), options, token);
        }
        addDecorations(editor, range) {
            super.addDecorations(editor, range);
        }
        clearDecorations(editor) {
            super.clearDecorations(editor);
        }
        //#endregion
        provideWithoutTextEditor(picker) {
            if (this.canPickWithOutlineService()) {
                return this.doGetOutlinePicks(picker);
            }
            return super.provideWithoutTextEditor(picker);
        }
        canPickWithOutlineService() {
            return this.editorService.activeEditorPane ? this.outlineService.canCreateOutline(this.editorService.activeEditorPane) : false;
        }
        doGetOutlinePicks(picker) {
            const pane = this.editorService.activeEditorPane;
            if (!pane) {
                return lifecycle_1.Disposable.None;
            }
            const cts = new cancellation_1.CancellationTokenSource();
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
            picker.busy = true;
            this.outlineService.createOutline(pane, 4 /* QuickPick */, cts.token).then(outline => {
                if (!outline) {
                    return;
                }
                if (cts.token.isCancellationRequested) {
                    outline.dispose();
                    return;
                }
                disposables.add(outline);
                const viewState = outline.captureViewState();
                disposables.add((0, lifecycle_1.toDisposable)(() => {
                    if (picker.selectedItems.length === 0) {
                        viewState.dispose();
                    }
                }));
                const entries = outline.config.quickPickDataSource.getQuickPickElements();
                const items = entries.map((entry, idx) => {
                    return {
                        kind: 0 /* File */,
                        index: idx,
                        score: 0,
                        label: entry.label,
                        description: entry.description,
                        ariaLabel: entry.ariaLabel,
                        iconClasses: entry.iconClasses
                    };
                });
                disposables.add(picker.onDidAccept(() => {
                    picker.hide();
                    const [entry] = picker.selectedItems;
                    if (entry && entries[entry.index]) {
                        outline.reveal(entries[entry.index].element, {}, false);
                    }
                }));
                const updatePickerItems = () => {
                    const filteredItems = items.filter(item => {
                        if (picker.value === '@') {
                            // default, no filtering, scoring...
                            item.score = 0;
                            item.highlights = undefined;
                            return true;
                        }
                        const score = (0, filters_1.fuzzyScore)(picker.value, picker.value.toLowerCase(), 1 /*@-character*/, item.label, item.label.toLowerCase(), 0, true);
                        if (!score) {
                            return false;
                        }
                        item.score = score[1];
                        item.highlights = { label: (0, filters_1.createMatches)(score) };
                        return true;
                    });
                    if (filteredItems.length === 0) {
                        const label = (0, nls_1.localize)(0, null);
                        picker.items = [{ label, index: -1, kind: 14 /* String */ }];
                        picker.ariaLabel = label;
                    }
                    else {
                        picker.items = filteredItems;
                    }
                };
                updatePickerItems();
                disposables.add(picker.onDidChangeValue(updatePickerItems));
                const previewDisposable = new lifecycle_1.MutableDisposable();
                disposables.add(previewDisposable);
                disposables.add(picker.onDidChangeActive(() => {
                    const [entry] = picker.activeItems;
                    if (entry && entries[entry.index]) {
                        previewDisposable.value = outline.preview(entries[entry.index].element);
                    }
                    else {
                        previewDisposable.clear();
                    }
                }));
            }).catch(err => {
                (0, errors_1.onUnexpectedError)(err);
                picker.hide();
            }).finally(() => {
                picker.busy = false;
            });
            return disposables;
        }
    };
    //#endregion
    //#region public methods to use this picker from other pickers
    GotoSymbolQuickAccessProvider.SYMBOL_PICKS_TIMEOUT = 8000;
    GotoSymbolQuickAccessProvider = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, outline_1.IOutlineService)
    ], GotoSymbolQuickAccessProvider);
    exports.GotoSymbolQuickAccessProvider = GotoSymbolQuickAccessProvider;
    platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess).registerQuickAccessProvider({
        ctor: GotoSymbolQuickAccessProvider,
        prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX,
        contextKey: 'inFileSymbolsPicker',
        placeholder: (0, nls_1.localize)(1, null),
        helpEntries: [
            { description: (0, nls_1.localize)(2, null), prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX, needsEditor: true },
            { description: (0, nls_1.localize)(3, null), prefix: gotoSymbolQuickAccess_1.AbstractGotoSymbolQuickAccessProvider.PREFIX_BY_CATEGORY, needsEditor: true }
        ]
    });
    (0, actions_1.registerAction2)(class GotoSymbolAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.gotoSymbol',
                title: {
                    value: (0, nls_1.localize)(4, null),
                    original: 'Go to Symbol in Editor...'
                },
                f1: true,
                keybinding: {
                    when: undefined,
                    weight: 200 /* WorkbenchContrib */,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 45 /* KEY_O */
                }
            });
        }
        run(accessor) {
            accessor.get(quickInput_1.IQuickInputService).quickAccess.show(GotoSymbolQuickAccessProvider.PREFIX);
        }
    });
});
//# sourceMappingURL=gotoSymbolQuickAccess.js.map