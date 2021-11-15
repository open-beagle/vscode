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
define(["require", "exports", "vs/platform/list/browser/listService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/nls!vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPane", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview", "vs/platform/label/common/label", "vs/editor/common/services/resolverService", "vs/workbench/browser/parts/views/viewPane", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/labels", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/storage/common/storage", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/css!./bulkEdit"], function (require, exports, listService_1, bulkEditTree_1, instantiation_1, themeService_1, colorRegistry_1, nls_1, lifecycle_1, editorService_1, bulkEditPreview_1, label_1, resolverService_1, viewPane_1, keybinding_1, contextView_1, configuration_1, contextkey_1, labels_1, dialogs_1, severity_1, resources_1, actions_1, menuEntryActionViewItem_1, storage_1, views_1, opener_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkEditPane = void 0;
    var State;
    (function (State) {
        State["Data"] = "data";
        State["Message"] = "message";
    })(State || (State = {}));
    let BulkEditPane = class BulkEditPane extends viewPane_1.ViewPane {
        constructor(options, _instaService, _editorService, _labelService, _textModelService, _dialogService, _menuService, _contextMenuService, _contextKeyService, _storageService, viewDescriptorService, keybindingService, contextMenuService, configurationService, openerService, themeService, telemetryService) {
            super(Object.assign(Object.assign({}, options), { titleMenuId: actions_1.MenuId.BulkEditTitle }), keybindingService, contextMenuService, configurationService, _contextKeyService, viewDescriptorService, _instaService, openerService, themeService, telemetryService);
            this._instaService = _instaService;
            this._editorService = _editorService;
            this._labelService = _labelService;
            this._textModelService = _textModelService;
            this._dialogService = _dialogService;
            this._menuService = _menuService;
            this._contextMenuService = _contextMenuService;
            this._contextKeyService = _contextKeyService;
            this._storageService = _storageService;
            this._treeViewStates = new Map();
            this._disposables = new lifecycle_1.DisposableStore();
            this._sessionDisposables = new lifecycle_1.DisposableStore();
            this.element.classList.add('bulk-edit-panel', 'show-file-icons');
            this._ctxHasCategories = BulkEditPane.ctxHasCategories.bindTo(_contextKeyService);
            this._ctxGroupByFile = BulkEditPane.ctxGroupByFile.bindTo(_contextKeyService);
            this._ctxHasCheckedChanges = BulkEditPane.ctxHasCheckedChanges.bindTo(_contextKeyService);
        }
        dispose() {
            this._tree.dispose();
            this._disposables.dispose();
        }
        renderBody(parent) {
            super.renderBody(parent);
            const resourceLabels = this._instaService.createInstance(labels_1.ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
            this._disposables.add(resourceLabels);
            // tree
            const treeContainer = document.createElement('div');
            treeContainer.className = 'tree';
            treeContainer.style.width = '100%';
            treeContainer.style.height = '100%';
            parent.appendChild(treeContainer);
            this._treeDataSource = this._instaService.createInstance(bulkEditTree_1.BulkEditDataSource);
            this._treeDataSource.groupByFile = this._storageService.getBoolean(BulkEditPane._memGroupByFile, 0 /* GLOBAL */, true);
            this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
            this._tree = this._instaService.createInstance(listService_1.WorkbenchAsyncDataTree, this.id, treeContainer, new bulkEditTree_1.BulkEditDelegate(), [this._instaService.createInstance(bulkEditTree_1.TextEditElementRenderer), this._instaService.createInstance(bulkEditTree_1.FileElementRenderer, resourceLabels), this._instaService.createInstance(bulkEditTree_1.CategoryElementRenderer)], this._treeDataSource, {
                accessibilityProvider: this._instaService.createInstance(bulkEditTree_1.BulkEditAccessibilityProvider),
                identityProvider: new bulkEditTree_1.BulkEditIdentityProvider(),
                expandOnlyOnTwistieClick: true,
                multipleSelectionSupport: false,
                keyboardNavigationLabelProvider: new bulkEditTree_1.BulkEditNaviLabelProvider(),
                sorter: new bulkEditTree_1.BulkEditSorter(),
                selectionNavigation: true
            });
            this._disposables.add(this._tree.onContextMenu(this._onContextMenu, this));
            this._disposables.add(this._tree.onDidOpen(e => this._openElementAsEditor(e)));
            // message
            this._message = document.createElement('span');
            this._message.className = 'message';
            this._message.innerText = (0, nls_1.localize)(0, null);
            parent.appendChild(this._message);
            //
            this._setState("message" /* Message */);
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            this._tree.layout(height, width);
        }
        _setState(state) {
            this.element.dataset['state'] = state;
        }
        async setInput(edit, token) {
            this._setState("data" /* Data */);
            this._sessionDisposables.clear();
            this._treeViewStates.clear();
            if (this._currentResolve) {
                this._currentResolve(undefined);
                this._currentResolve = undefined;
            }
            const input = await this._instaService.invokeFunction(bulkEditPreview_1.BulkFileOperations.create, edit);
            const provider = this._instaService.createInstance(bulkEditPreview_1.BulkEditPreviewProvider, input);
            this._sessionDisposables.add(provider);
            this._sessionDisposables.add(input);
            //
            const hasCategories = input.categories.length > 1;
            this._ctxHasCategories.set(hasCategories);
            this._treeDataSource.groupByFile = !hasCategories || this._treeDataSource.groupByFile;
            this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
            this._currentInput = input;
            return new Promise(async (resolve) => {
                token.onCancellationRequested(() => resolve(undefined));
                this._currentResolve = resolve;
                this._setTreeInput(input);
                // refresh when check state changes
                this._sessionDisposables.add(input.checked.onDidChange(() => {
                    this._tree.updateChildren();
                    this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
                }));
            });
        }
        hasInput() {
            return Boolean(this._currentInput);
        }
        async _setTreeInput(input) {
            const viewState = this._treeViewStates.get(this._treeDataSource.groupByFile);
            await this._tree.setInput(input, viewState);
            this._tree.domFocus();
            if (viewState) {
                return;
            }
            // async expandAll (max=10) is the default when no view state is given
            const expand = [...this._tree.getNode(input).children].slice(0, 10);
            while (expand.length > 0) {
                const { element } = expand.shift();
                if (element instanceof bulkEditTree_1.FileElement) {
                    await this._tree.expand(element, true);
                }
                if (element instanceof bulkEditTree_1.CategoryElement) {
                    await this._tree.expand(element, true);
                    expand.push(...this._tree.getNode(element).children);
                }
            }
        }
        accept() {
            var _a;
            const conflicts = (_a = this._currentInput) === null || _a === void 0 ? void 0 : _a.conflicts.list();
            if (!conflicts || conflicts.length === 0) {
                this._done(true);
                return;
            }
            let message;
            if (conflicts.length === 1) {
                message = (0, nls_1.localize)(1, null, this._labelService.getUriLabel(conflicts[0], { relative: true }));
            }
            else {
                message = (0, nls_1.localize)(2, null, conflicts.length);
            }
            this._dialogService.show(severity_1.default.Warning, message, []).finally(() => this._done(false));
        }
        discard() {
            this._done(false);
        }
        _done(accept) {
            var _a;
            if (this._currentResolve) {
                this._currentResolve(accept ? (_a = this._currentInput) === null || _a === void 0 ? void 0 : _a.getWorkspaceEdit() : undefined);
            }
            this._currentInput = undefined;
            this._setState("message" /* Message */);
            this._sessionDisposables.clear();
        }
        toggleChecked() {
            const [first] = this._tree.getFocus();
            if ((first instanceof bulkEditTree_1.FileElement || first instanceof bulkEditTree_1.TextEditElement) && !first.isDisabled()) {
                first.setChecked(!first.isChecked());
            }
        }
        groupByFile() {
            if (!this._treeDataSource.groupByFile) {
                this.toggleGrouping();
            }
        }
        groupByType() {
            if (this._treeDataSource.groupByFile) {
                this.toggleGrouping();
            }
        }
        toggleGrouping() {
            const input = this._tree.getInput();
            if (input) {
                // (1) capture view state
                let oldViewState = this._tree.getViewState();
                this._treeViewStates.set(this._treeDataSource.groupByFile, oldViewState);
                // (2) toggle and update
                this._treeDataSource.groupByFile = !this._treeDataSource.groupByFile;
                this._setTreeInput(input);
                // (3) remember preference
                this._storageService.store(BulkEditPane._memGroupByFile, this._treeDataSource.groupByFile, 0 /* GLOBAL */, 0 /* USER */);
                this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
            }
        }
        async _openElementAsEditor(e) {
            var _a;
            let options = Object.assign({}, e.editorOptions);
            let fileElement;
            if (e.element instanceof bulkEditTree_1.TextEditElement) {
                fileElement = e.element.parent;
                options.selection = e.element.edit.textEdit.textEdit.range;
            }
            else if (e.element instanceof bulkEditTree_1.FileElement) {
                fileElement = e.element;
                options.selection = (_a = e.element.edit.textEdits[0]) === null || _a === void 0 ? void 0 : _a.textEdit.textEdit.range;
            }
            else {
                // invalid event
                return;
            }
            const previewUri = bulkEditPreview_1.BulkEditPreviewProvider.asPreviewUri(fileElement.edit.uri);
            if (fileElement.edit.type & 4 /* Delete */) {
                // delete -> show single editor
                this._editorService.openEditor({
                    label: (0, nls_1.localize)(3, null, (0, resources_1.basename)(fileElement.edit.uri)),
                    resource: previewUri,
                    options
                });
            }
            else {
                // rename, create, edits -> show diff editr
                let leftResource;
                try {
                    (await this._textModelService.createModelReference(fileElement.edit.uri)).dispose();
                    leftResource = fileElement.edit.uri;
                }
                catch (_b) {
                    leftResource = bulkEditPreview_1.BulkEditPreviewProvider.emptyPreview;
                }
                let typeLabel;
                if (fileElement.edit.type & 8 /* Rename */) {
                    typeLabel = (0, nls_1.localize)(4, null);
                }
                else if (fileElement.edit.type & 2 /* Create */) {
                    typeLabel = (0, nls_1.localize)(5, null);
                }
                let label;
                if (typeLabel) {
                    label = (0, nls_1.localize)(6, null, (0, resources_1.basename)(fileElement.edit.uri), typeLabel);
                }
                else {
                    label = (0, nls_1.localize)(7, null, (0, resources_1.basename)(fileElement.edit.uri));
                }
                this._editorService.openEditor({
                    leftResource,
                    rightResource: previewUri,
                    label,
                    description: this._labelService.getUriLabel((0, resources_1.dirname)(leftResource), { relative: true }),
                    options
                }, e.sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
            }
        }
        _onContextMenu(e) {
            const menu = this._menuService.createMenu(actions_1.MenuId.BulkEditContext, this._contextKeyService);
            const actions = [];
            const disposable = (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, actions);
            this._contextMenuService.showContextMenu({
                getActions: () => actions,
                getAnchor: () => e.anchor,
                onHide: () => {
                    disposable.dispose();
                    menu.dispose();
                }
            });
        }
    };
    BulkEditPane.ID = 'refactorPreview';
    BulkEditPane.ctxHasCategories = new contextkey_1.RawContextKey('refactorPreview.hasCategories', false);
    BulkEditPane.ctxGroupByFile = new contextkey_1.RawContextKey('refactorPreview.groupByFile', true);
    BulkEditPane.ctxHasCheckedChanges = new contextkey_1.RawContextKey('refactorPreview.hasCheckedChanges', true);
    BulkEditPane._memGroupByFile = `${BulkEditPane.ID}.groupByFile`;
    BulkEditPane = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, editorService_1.IEditorService),
        __param(3, label_1.ILabelService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, dialogs_1.IDialogService),
        __param(6, actions_1.IMenuService),
        __param(7, contextView_1.IContextMenuService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, storage_1.IStorageService),
        __param(10, views_1.IViewDescriptorService),
        __param(11, keybinding_1.IKeybindingService),
        __param(12, contextView_1.IContextMenuService),
        __param(13, configuration_1.IConfigurationService),
        __param(14, opener_1.IOpenerService),
        __param(15, themeService_1.IThemeService),
        __param(16, telemetry_1.ITelemetryService)
    ], BulkEditPane);
    exports.BulkEditPane = BulkEditPane;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const diffInsertedColor = theme.getColor(colorRegistry_1.diffInserted);
        if (diffInsertedColor) {
            collector.addRule(`.monaco-workbench .bulk-edit-panel .highlight.insert { background-color: ${diffInsertedColor}; }`);
        }
        const diffRemovedColor = theme.getColor(colorRegistry_1.diffRemoved);
        if (diffRemovedColor) {
            collector.addRule(`.monaco-workbench .bulk-edit-panel .highlight.remove { background-color: ${diffRemovedColor}; }`);
        }
    });
});
//# sourceMappingURL=bulkEditPane.js.map