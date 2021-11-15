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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/contrib/notebook/browser/notebookEditor", "vs/base/common/resources", "vs/platform/contextkey/common/contextkey", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/services/editor/browser/editorDropService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorService", "vs/workbench/contrib/notebook/common/notebookPerformance", "vs/platform/files/common/files", "vs/css!./media/notebook"], function (require, exports, DOM, event_1, lifecycle_1, nls_1, resources_1, contextkey_1, editor_1, instantiation_1, notification_1, storage_1, telemetry_1, themeService_1, editorPane_1, notebookEditorInput_1, editorDropService_1, editorGroupsService_1, editorService_1, notebookBrowser_1, notebookEditorService_1, notebookPerformance_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditor = void 0;
    const NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'NotebookEditorViewState';
    let NotebookEditor = class NotebookEditor extends editorPane_1.EditorPane {
        constructor(telemetryService, themeService, instantiationService, storageService, _editorService, _editorGroupService, _editorDropService, _notificationService, _notebookWidgetService, _contextKeyService, fileService) {
            super(NotebookEditor.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._editorDropService = _editorDropService;
            this._notificationService = _notificationService;
            this._notebookWidgetService = _notebookWidgetService;
            this._contextKeyService = _contextKeyService;
            this.fileService = fileService;
            this._groupListener = this._register(new lifecycle_1.DisposableStore());
            this._widgetDisposableStore = new lifecycle_1.DisposableStore();
            this._widget = { value: undefined };
            // todo@rebornix is there a reason that `super.fireOnDidFocus` isn't used?
            this._onDidFocusWidget = this._register(new event_1.Emitter());
            this._onDidChangeModel = this._register(new event_1.Emitter());
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._editorMemento = this.getEditorMemento(_editorGroupService, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY);
            this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidFileSystemProviderChange(e.scheme)));
            this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidFileSystemProviderChange(e.scheme)));
        }
        get onDidFocus() { return this._onDidFocusWidget.event; }
        onDidFileSystemProviderChange(scheme) {
            var _a, _b;
            if (((_b = (_a = this.input) === null || _a === void 0 ? void 0 : _a.resource) === null || _b === void 0 ? void 0 : _b.scheme) === scheme && this._widget.value) {
                this._widget.value.setOptions(new notebookBrowser_1.NotebookEditorOptions({ isReadOnly: this.input.isReadonly() }));
            }
        }
        get viewModel() {
            var _a;
            return (_a = this._widget.value) === null || _a === void 0 ? void 0 : _a.viewModel;
        }
        get minimumWidth() { return 375; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        //#region Editor Core
        get scopedContextKeyService() {
            var _a;
            return (_a = this._widget.value) === null || _a === void 0 ? void 0 : _a.scopedContextKeyService;
        }
        createEditor(parent) {
            this._rootElement = DOM.append(parent, DOM.$('.notebook-editor'));
            // this._widget.createEditor();
            this._register(this.onDidFocus(() => { var _a; return (_a = this._widget.value) === null || _a === void 0 ? void 0 : _a.updateEditorFocus(); }));
            this._register(this.onDidBlur(() => { var _a; return (_a = this._widget.value) === null || _a === void 0 ? void 0 : _a.updateEditorFocus(); }));
        }
        getDomNode() {
            return this._rootElement;
        }
        getControl() {
            return this._widget.value;
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (group) {
                this._groupListener.clear();
                this._groupListener.add(group.onWillCloseEditor(e => this._saveEditorViewState(e.editor)));
                this._groupListener.add(group.onDidGroupChange(() => {
                    var _a, _b;
                    if (this._editorGroupService.activeGroup !== group) {
                        (_b = (_a = this._widget) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.updateEditorFocus();
                    }
                }));
            }
            if (!visible) {
                this._saveEditorViewState(this.input);
                if (this.input && this._widget.value) {
                    // the widget is not transfered to other editor inputs
                    this._widget.value.onWillHide();
                }
            }
        }
        focus() {
            var _a;
            super.focus();
            (_a = this._widget.value) === null || _a === void 0 ? void 0 : _a.focus();
        }
        hasFocus() {
            const activeElement = document.activeElement;
            const value = this._widget.value;
            return !!value && (DOM.isAncestor(activeElement, value.getDomNode() || DOM.isAncestor(activeElement, value.getOverflowContainerDomNode())));
        }
        async setInput(input, options, context, token) {
            var _a;
            (0, notebookPerformance_1.clearMarks)(input.resource);
            (0, notebookPerformance_1.mark)(input.resource, 'startTime');
            const group = this.group;
            this._saveEditorViewState(this.input);
            this._widgetDisposableStore.clear();
            // there currently is a widget which we still own so
            // we need to hide it before getting a new widget
            if (this._widget.value) {
                this._widget.value.onWillHide();
            }
            this._widget = this.instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, group, input);
            this._widgetDisposableStore.add(this._widget.value.onDidChangeModel(() => this._onDidChangeModel.fire()));
            if (this._dimension) {
                this._widget.value.layout(this._dimension, this._rootElement);
            }
            // only now `setInput` and yield/await. this is AFTER the actual widget is ready. This is very important
            // so that others synchronously receive a notebook editor with the correct widget being set
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            (0, notebookPerformance_1.mark)(input.resource, 'inputLoaded');
            // Check for cancellation
            if (token.isCancellationRequested) {
                return undefined;
            }
            if (model === null) {
                this._notificationService.prompt(notification_1.Severity.Error, (0, nls_1.localize)(0, null, input.viewType), [{
                        label: (0, nls_1.localize)(1, null),
                        run: async () => {
                            await this._editorService.openEditor({ resource: input.resource, forceFile: true, options: Object.assign(Object.assign({}, options), { override: editor_1.EditorOverride.DISABLED }) });
                        }
                    }]);
                return;
            }
            const viewState = this._loadNotebookEditorViewState(input);
            (_a = this._widget.value) === null || _a === void 0 ? void 0 : _a.setParentContextKeyService(this._contextKeyService);
            await this._widget.value.setModel(model.notebook, viewState);
            const isReadonly = input.isReadonly();
            await this._widget.value.setOptions(options instanceof notebookBrowser_1.NotebookEditorOptions ? options.with({ isReadOnly: isReadonly }) : new notebookBrowser_1.NotebookEditorOptions({ isReadOnly: isReadonly }));
            this._widgetDisposableStore.add(this._widget.value.onDidFocus(() => this._onDidFocusWidget.fire()));
            this._widgetDisposableStore.add(this._editorDropService.createEditorDropTarget(this._widget.value.getDomNode(), {
                containsGroup: (group) => { var _a; return ((_a = this.group) === null || _a === void 0 ? void 0 : _a.id) === group.id; }
            }));
            (0, notebookPerformance_1.mark)(input.resource, 'editorLoaded');
            const perfMarks = (0, notebookPerformance_1.getAndClearMarks)(input.resource);
            if (perfMarks) {
                const startTime = perfMarks['startTime'];
                const extensionActivated = perfMarks['extensionActivated'];
                const inputLoaded = perfMarks['inputLoaded'];
                const webviewCommLoaded = perfMarks['webviewCommLoaded'];
                const customMarkdownLoaded = perfMarks['customMarkdownLoaded'];
                const editorLoaded = perfMarks['editorLoaded'];
                if (startTime !== undefined
                    && extensionActivated !== undefined
                    && inputLoaded !== undefined
                    && webviewCommLoaded !== undefined
                    && customMarkdownLoaded !== undefined
                    && editorLoaded !== undefined) {
                    this.telemetryService.publicLog2('notebook/editorOpenPerf', {
                        scheme: model.notebook.uri.scheme,
                        ext: (0, resources_1.extname)(model.notebook.uri),
                        viewType: model.notebook.viewType,
                        extensionActivated: extensionActivated - startTime,
                        inputLoaded: inputLoaded - startTime,
                        webviewCommLoaded: webviewCommLoaded - startTime,
                        customMarkdownLoaded: customMarkdownLoaded - startTime,
                        editorLoaded: editorLoaded - startTime
                    });
                }
            }
        }
        clearInput() {
            if (this._widget.value) {
                this._saveEditorViewState(this.input);
                this._widget.value.onWillHide();
            }
            super.clearInput();
        }
        setOptions(options) {
            var _a;
            if (options instanceof notebookBrowser_1.NotebookEditorOptions) {
                (_a = this._widget.value) === null || _a === void 0 ? void 0 : _a.setOptions(options);
            }
            super.setOptions(options);
        }
        saveState() {
            this._saveEditorViewState(this.input);
            super.saveState();
        }
        _saveEditorViewState(input) {
            if (this.group && this._widget.value && input instanceof notebookEditorInput_1.NotebookEditorInput) {
                if (this._widget.value.isDisposed) {
                    return;
                }
                const state = this._widget.value.getEditorViewState();
                this._editorMemento.saveEditorState(this.group, input.resource, state);
            }
        }
        _loadNotebookEditorViewState(input) {
            var _a, _b;
            let result;
            if (this.group) {
                result = this._editorMemento.loadEditorState(this.group, input.resource);
            }
            if (result) {
                return result;
            }
            // when we don't have a view state for the group/input-tuple then we try to use an existing
            // editor for the same resource.
            for (const group of this._editorGroupService.getGroups(1 /* MOST_RECENTLY_ACTIVE */)) {
                if (group.activeEditorPane !== this && group.activeEditorPane instanceof NotebookEditor && ((_a = group.activeEditor) === null || _a === void 0 ? void 0 : _a.matches(input))) {
                    return (_b = group.activeEditorPane._widget.value) === null || _b === void 0 ? void 0 : _b.getEditorViewState();
                }
            }
            return;
        }
        layout(dimension) {
            var _a, _b;
            this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
            this._dimension = dimension;
            if (!this._widget.value || !(this._input instanceof notebookEditorInput_1.NotebookEditorInput)) {
                return;
            }
            if (this._input.resource.toString() !== ((_a = this._widget.value.viewModel) === null || _a === void 0 ? void 0 : _a.uri.toString()) && ((_b = this._widget.value) === null || _b === void 0 ? void 0 : _b.viewModel)) {
                // input and widget mismatch
                // this happens when
                // 1. open document A, pin the document
                // 2. open document B
                // 3. close document B
                // 4. a layout is triggered
                return;
            }
            this._widget.value.layout(this._dimension, this._rootElement);
        }
        //#endregion
        //#region Editor Features
        //#endregion
        dispose() {
            super.dispose();
        }
    };
    NotebookEditor.ID = notebookBrowser_1.NOTEBOOK_EDITOR_ID;
    NotebookEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, editorService_1.IEditorService),
        __param(5, editorGroupsService_1.IEditorGroupsService),
        __param(6, editorDropService_1.IEditorDropService),
        __param(7, notification_1.INotificationService),
        __param(8, notebookEditorService_1.INotebookEditorService),
        __param(9, contextkey_1.IContextKeyService),
        __param(10, files_1.IFileService)
    ], NotebookEditor);
    exports.NotebookEditor = NotebookEditor;
});
//# sourceMappingURL=notebookEditor.js.map