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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/notebookServiceImpl", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/workbench/contrib/notebook/browser/extensionPoint", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookMarkdownRenderer", "vs/workbench/contrib/notebook/common/notebookOutputRenderer", "vs/workbench/contrib/notebook/common/notebookProvider", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/extensions/common/extensions", "vs/platform/registry/common/platform", "vs/base/common/network", "vs/base/common/lazy", "vs/workbench/contrib/notebook/browser/notebookDiffEditorInput", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/services/editor/common/editorOverrideService", "vs/workbench/common/editor", "vs/platform/files/common/files"], function (require, exports, nls_1, browser_1, event_1, iterator_1, lifecycle_1, map_1, uri_1, codeEditorService_1, fontInfo_1, accessibility_1, configuration_1, instantiation_1, storage_1, memento_1, extensionPoint_1, notebookBrowser_1, notebookTextModel_1, notebookCommon_1, notebookMarkdownRenderer_1, notebookOutputRenderer_1, notebookProvider_1, notebookService_1, extensions_1, platform_1, network_1, lazy_1, notebookDiffEditorInput_1, notebookEditorInput_1, editorOverrideService_1, editor_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookService = exports.NotebookOutputRendererInfoStore = exports.NotebookProviderInfoStore = void 0;
    let NotebookProviderInfoStore = class NotebookProviderInfoStore extends lifecycle_1.Disposable {
        constructor(storageService, extensionService, _editorOverrideService, _configurationService, _accessibilityService, _instantiationService, _fileService) {
            super();
            this._editorOverrideService = _editorOverrideService;
            this._configurationService = _configurationService;
            this._accessibilityService = _accessibilityService;
            this._instantiationService = _instantiationService;
            this._fileService = _fileService;
            this._handled = false;
            this._contributedEditors = new Map();
            this._contributedEditorDisposables = new lifecycle_1.DisposableStore();
            this._memento = new memento_1.Memento(NotebookProviderInfoStore.CUSTOM_EDITORS_STORAGE_ID, storageService);
            const mementoObject = this._memento.getMemento(0 /* GLOBAL */, 1 /* MACHINE */);
            for (const info of (mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] || [])) {
                this.add(new notebookProvider_1.NotebookProviderInfo(info));
            }
            this._register(extensionService.onDidRegisterExtensions(() => {
                if (!this._handled) {
                    // there is no extension point registered for notebook content provider
                    // clear the memento and cache
                    this._clear();
                    mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = [];
                    this._memento.saveMemento();
                }
            }));
            extensionPoint_1.notebookProviderExtensionPoint.setHandler(extensions => this._setupHandler(extensions));
        }
        dispose() {
            this._clear();
            super.dispose();
        }
        _setupHandler(extensions) {
            this._handled = true;
            this._clear();
            for (const extension of extensions) {
                for (const notebookContribution of extension.value) {
                    this.add(new notebookProvider_1.NotebookProviderInfo({
                        id: notebookContribution.viewType,
                        displayName: notebookContribution.displayName,
                        selectors: notebookContribution.selector || [],
                        priority: this._convertPriority(notebookContribution.priority),
                        providerExtensionId: extension.description.identifier.value,
                        providerDescription: extension.description.description,
                        providerDisplayName: extension.description.isBuiltin ? (0, nls_1.localize)(0, null) : extension.description.displayName || extension.description.identifier.value,
                        providerExtensionLocation: extension.description.extensionLocation,
                        dynamicContribution: false,
                        exclusive: false
                    }));
                }
            }
            const mementoObject = this._memento.getMemento(0 /* GLOBAL */, 1 /* MACHINE */);
            mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
            this._memento.saveMemento();
        }
        _convertPriority(priority) {
            if (!priority) {
                return editorOverrideService_1.ContributedEditorPriority.default;
            }
            if (priority === notebookCommon_1.NotebookEditorPriority.default) {
                return editorOverrideService_1.ContributedEditorPriority.default;
            }
            return editorOverrideService_1.ContributedEditorPriority.option;
        }
        _registerContributionPoint(notebookProviderInfo) {
            for (const selector of notebookProviderInfo.selectors) {
                const globPattern = selector.include || selector;
                const notebookEditorInfo = {
                    id: notebookProviderInfo.id,
                    label: notebookProviderInfo.displayName,
                    detail: notebookProviderInfo.providerDisplayName,
                    describes: (currentEditor) => currentEditor instanceof notebookEditorInput_1.NotebookEditorInput && currentEditor.viewType === notebookProviderInfo.id,
                    priority: notebookProviderInfo.exclusive ? editorOverrideService_1.ContributedEditorPriority.exclusive : notebookProviderInfo.priority,
                };
                const notebookEditorOptions = {
                    canHandleDiff: () => !!this._configurationService.getValue(notebookCommon_1.NotebookTextDiffEditorPreview) && !this._accessibilityService.isScreenReaderOptimized(),
                    canSupportResource: (resource) => resource.scheme === network_1.Schemas.untitled || resource.scheme === network_1.Schemas.vscodeNotebookCell || this._fileService.canHandleResource(resource)
                };
                const notebookEditorInputFactory = (resource, options, group) => {
                    const data = notebookCommon_1.CellUri.parse(resource);
                    let notebookUri = resource;
                    let cellOptions;
                    if (data) {
                        notebookUri = data.notebook;
                        cellOptions = { resource: resource };
                    }
                    const notebookOptions = new notebookBrowser_1.NotebookEditorOptions(Object.assign(Object.assign({}, options), { cellOptions }));
                    return { editor: notebookEditorInput_1.NotebookEditorInput.create(this._instantiationService, notebookUri, notebookProviderInfo.id), options: notebookOptions };
                };
                const notebookEditorDiffFactory = (diffEditorInput, options, group) => {
                    const modifiedInput = diffEditorInput.modifiedInput;
                    const originalInput = diffEditorInput.originalInput;
                    const notebookUri = modifiedInput.resource;
                    const originalNotebookUri = originalInput.resource;
                    return { editor: notebookDiffEditorInput_1.NotebookDiffEditorInput.create(this._instantiationService, notebookUri, modifiedInput.getName(), originalNotebookUri, originalInput.getName(), diffEditorInput.getName(), notebookProviderInfo.id) };
                };
                // Register the notebook editor
                this._contributedEditorDisposables.add(this._editorOverrideService.registerContributionPoint(globPattern, notebookEditorInfo, notebookEditorOptions, notebookEditorInputFactory, notebookEditorDiffFactory));
                // Then register the schema handler as exclusive for that notebook
                this._contributedEditorDisposables.add(this._editorOverrideService.registerContributionPoint(`${network_1.Schemas.vscodeNotebookCell}:/**/${globPattern}`, Object.assign(Object.assign({}, notebookEditorInfo), { priority: editorOverrideService_1.ContributedEditorPriority.exclusive }), notebookEditorOptions, notebookEditorInputFactory, notebookEditorDiffFactory));
            }
        }
        _clear() {
            this._contributedEditors.clear();
            this._contributedEditorDisposables.clear();
        }
        get(viewType) {
            return this._contributedEditors.get(viewType);
        }
        add(info) {
            if (this._contributedEditors.has(info.id)) {
                return;
            }
            this._contributedEditors.set(info.id, info);
            this._registerContributionPoint(info);
            const mementoObject = this._memento.getMemento(0 /* GLOBAL */, 1 /* MACHINE */);
            mementoObject[NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
            this._memento.saveMemento();
        }
        getContributedNotebook(resource) {
            const result = [];
            for (let info of this._contributedEditors.values()) {
                if (info.matches(resource)) {
                    result.push(info);
                }
            }
            if (result.length === 0 && resource.scheme === network_1.Schemas.untitled) {
                // untitled resource and no path-specific match => all providers apply
                return Array.from(this._contributedEditors.values());
            }
            return result;
        }
        [Symbol.iterator]() {
            return this._contributedEditors.values();
        }
    };
    NotebookProviderInfoStore.CUSTOM_EDITORS_STORAGE_ID = 'notebookEditors';
    NotebookProviderInfoStore.CUSTOM_EDITORS_ENTRY_ID = 'editors';
    NotebookProviderInfoStore = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, extensions_1.IExtensionService),
        __param(2, editorOverrideService_1.IEditorOverrideService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, accessibility_1.IAccessibilityService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, files_1.IFileService)
    ], NotebookProviderInfoStore);
    exports.NotebookProviderInfoStore = NotebookProviderInfoStore;
    let NotebookOutputRendererInfoStore = class NotebookOutputRendererInfoStore {
        constructor(storageService) {
            this.contributedRenderers = new Map();
            this.preferredMimetype = new lazy_1.Lazy(() => this.preferredMimetypeMemento.getMemento(1 /* WORKSPACE */, 0 /* USER */));
            this.preferredMimetypeMemento = new memento_1.Memento('workbench.editor.notebook.preferredRenderer', storageService);
        }
        clear() {
            this.contributedRenderers.clear();
        }
        get(rendererId) {
            return this.contributedRenderers.get(rendererId);
        }
        add(info) {
            if (this.contributedRenderers.has(info.id)) {
                return;
            }
            this.contributedRenderers.set(info.id, info);
        }
        /** Update and remember the preferred renderer for the given mimetype in this workspace */
        setPreferred(mimeType, rendererId) {
            this.preferredMimetype.getValue()[mimeType] = rendererId;
            this.preferredMimetypeMemento.saveMemento();
        }
        getContributedRenderer(mimeType, kernelProvides) {
            const preferred = this.preferredMimetype.getValue()[mimeType];
            const possible = Array.from(this.contributedRenderers.values())
                .map(renderer => ({
                renderer,
                score: kernelProvides === undefined
                    ? renderer.matchesWithoutKernel(mimeType)
                    : renderer.matches(mimeType, kernelProvides),
            }))
                .sort((a, b) => a.score - b.score)
                .filter(r => r.score !== 3 /* Never */)
                .map(r => r.renderer);
            return preferred ? possible.sort((a, b) => (a.id === preferred ? -1 : 0) + (b.id === preferred ? 1 : 0)) : possible;
        }
    };
    NotebookOutputRendererInfoStore = __decorate([
        __param(0, storage_1.IStorageService)
    ], NotebookOutputRendererInfoStore);
    exports.NotebookOutputRendererInfoStore = NotebookOutputRendererInfoStore;
    class ModelData {
        constructor(model, onWillDispose) {
            this.model = model;
            this._modelEventListeners = new lifecycle_1.DisposableStore();
            this._modelEventListeners.add(model.onWillDispose(() => onWillDispose(model)));
        }
        dispose() {
            this._modelEventListeners.dispose();
        }
    }
    let NotebookService = class NotebookService extends lifecycle_1.Disposable {
        constructor(_extensionService, _configurationService, _accessibilityService, _instantiationService, _codeEditorService, configurationService) {
            super();
            this._extensionService = _extensionService;
            this._configurationService = _configurationService;
            this._accessibilityService = _accessibilityService;
            this._instantiationService = _instantiationService;
            this._codeEditorService = _codeEditorService;
            this.configurationService = configurationService;
            this._notebookProviders = new Map();
            this._notebookRenderersInfoStore = this._instantiationService.createInstance(NotebookOutputRendererInfoStore);
            this._markdownRenderersInfos = new Set();
            this._models = new map_1.ResourceMap();
            this._onDidCreateNotebookDocument = this._register(new event_1.Emitter());
            this._onDidAddNotebookDocument = this._register(new event_1.Emitter());
            this._onDidRemoveNotebookDocument = this._register(new event_1.Emitter());
            this.onDidCreateNotebookDocument = this._onDidCreateNotebookDocument.event;
            this.onDidAddNotebookDocument = this._onDidAddNotebookDocument.event;
            this.onDidRemoveNotebookDocument = this._onDidRemoveNotebookDocument.event;
            this._onDidChangeEditorTypes = this._register(new event_1.Emitter());
            this.onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
            this._lastClipboardIsCopy = true;
            this._displayOrder = Object.create(null);
            this._notebookProviderInfoStore = _instantiationService.createInstance(NotebookProviderInfoStore);
            this._register(this._notebookProviderInfoStore);
            extensionPoint_1.notebookRendererExtensionPoint.setHandler((renderers) => {
                var _a;
                this._notebookRenderersInfoStore.clear();
                for (const extension of renderers) {
                    for (const notebookContribution of extension.value) {
                        if (!notebookContribution.entrypoint) { // avoid crashing
                            console.error(`Cannot register renderer for ${extension.description.identifier.value} since it did not have an entrypoint. This is now required: https://github.com/microsoft/vscode/issues/102644`);
                            continue;
                        }
                        const id = (_a = notebookContribution.id) !== null && _a !== void 0 ? _a : notebookContribution.viewType;
                        if (!id) {
                            console.error(`Notebook renderer from ${extension.description.identifier.value} is missing an 'id'`);
                            continue;
                        }
                        this._notebookRenderersInfoStore.add(new notebookOutputRenderer_1.NotebookOutputRendererInfo({
                            id,
                            extension: extension.description,
                            entrypoint: notebookContribution.entrypoint,
                            displayName: notebookContribution.displayName,
                            mimeTypes: notebookContribution.mimeTypes || [],
                            dependencies: notebookContribution.dependencies,
                            optionalDependencies: notebookContribution.optionalDependencies,
                        }));
                    }
                }
            });
            extensionPoint_1.notebookMarkupRendererExtensionPoint.setHandler((renderers) => {
                this._markdownRenderersInfos.clear();
                for (const extension of renderers) {
                    if (!extension.description.enableProposedApi && !extension.description.isBuiltin) {
                        // Only allow proposed extensions to use this extension point
                        return;
                    }
                    for (const notebookContribution of extension.value) {
                        if (!notebookContribution.entrypoint) { // avoid crashing
                            console.error(`Cannot register renderer for ${extension.description.identifier.value} since it did not have an entrypoint. This is now required: https://github.com/microsoft/vscode/issues/102644`);
                            continue;
                        }
                        const id = notebookContribution.id;
                        if (!id) {
                            console.error(`Notebook renderer from ${extension.description.identifier.value} is missing an 'id'`);
                            continue;
                        }
                        this._markdownRenderersInfos.add(new notebookMarkdownRenderer_1.NotebookMarkupRendererInfo({
                            id,
                            extension: extension.description,
                            entrypoint: notebookContribution.entrypoint,
                            displayName: notebookContribution.displayName,
                            mimeTypes: notebookContribution.mimeTypes,
                            dependsOn: notebookContribution.dependsOn,
                        }));
                    }
                }
            });
            this._register(platform_1.Registry.as(editor_1.EditorExtensions.Associations).registerEditorTypesHandler('Notebook', this));
            const updateOrder = () => {
                const userOrder = this._configurationService.getValue(notebookCommon_1.DisplayOrderKey);
                this._displayOrder = {
                    defaultOrder: this._accessibilityService.isScreenReaderOptimized() ? notebookCommon_1.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER : [],
                    userOrder: userOrder
                };
            };
            updateOrder();
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectedKeys.indexOf(notebookCommon_1.DisplayOrderKey) >= 0) {
                    updateOrder();
                }
            }));
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
                updateOrder();
            }));
            let decorationTriggeredAdjustment = false;
            let decorationCheckSet = new Set();
            this._register(this._codeEditorService.onDecorationTypeRegistered(e => {
                if (decorationTriggeredAdjustment) {
                    return;
                }
                if (decorationCheckSet.has(e)) {
                    return;
                }
                const options = this._codeEditorService.resolveDecorationOptions(e, true);
                if (options.afterContentClassName || options.beforeContentClassName) {
                    const cssRules = this._codeEditorService.resolveDecorationCSSRules(e);
                    if (cssRules !== null) {
                        for (let i = 0; i < cssRules.length; i++) {
                            // The following ways to index into the list are equivalent
                            if ((cssRules[i].selectorText.endsWith('::after') || cssRules[i].selectorText.endsWith('::after'))
                                && cssRules[i].cssText.indexOf('top:') > -1) {
                                // there is a `::before` or `::after` text decoration whose position is above or below current line
                                // we at least make sure that the editor top padding is at least one line
                                const editorOptions = this.configurationService.getValue('editor');
                                (0, notebookBrowser_1.updateEditorTopPadding)(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, (0, browser_1.getZoomLevel)(), (0, browser_1.getPixelRatio)()).lineHeight + 2);
                                decorationTriggeredAdjustment = true;
                                break;
                            }
                        }
                    }
                }
                decorationCheckSet.add(e);
            }));
        }
        getEditorTypes() {
            return [...this._notebookProviderInfoStore].map(info => ({
                id: info.id,
                displayName: info.displayName,
                providerDisplayName: info.providerDisplayName
            }));
        }
        async canResolve(viewType) {
            await this._extensionService.activateByEvent(`onNotebook:*`);
            if (!this._notebookProviders.has(viewType)) {
                await this._extensionService.whenInstalledExtensionsRegistered();
                // this awaits full activation of all matching extensions
                await this._extensionService.activateByEvent(`onNotebook:${viewType}`);
                if (this._notebookProviders.has(viewType)) {
                    return true;
                }
                else {
                    // notebook providers/kernels/renderers might use `*` as activation event.
                    // TODO, only activate by `*` if this._notebookProviders.get(viewType).dynamicContribution === true
                    await this._extensionService.activateByEvent(`*`);
                }
            }
            return this._notebookProviders.has(viewType);
        }
        _registerProviderData(viewType, data) {
            if (this._notebookProviders.has(viewType)) {
                throw new Error(`notebook controller for viewtype '${viewType}' already exists`);
            }
            this._notebookProviders.set(viewType, data);
        }
        registerNotebookController(viewType, extensionData, controller) {
            var _a;
            this._registerProviderData(viewType, new notebookService_1.ComplexNotebookProviderInfo(viewType, controller, extensionData));
            if (controller.viewOptions && !this._notebookProviderInfoStore.get(viewType)) {
                // register this content provider to the static contribution, if it does not exist
                const info = new notebookProvider_1.NotebookProviderInfo({
                    displayName: controller.viewOptions.displayName,
                    id: viewType,
                    priority: editorOverrideService_1.ContributedEditorPriority.default,
                    selectors: [],
                    providerExtensionId: extensionData.id.value,
                    providerDescription: extensionData.description,
                    providerDisplayName: extensionData.id.value,
                    providerExtensionLocation: uri_1.URI.revive(extensionData.location),
                    dynamicContribution: true,
                    exclusive: controller.viewOptions.exclusive
                });
                info.update({ selectors: controller.viewOptions.filenamePattern });
                info.update({ options: controller.options });
                this._notebookProviderInfoStore.add(info);
            }
            (_a = this._notebookProviderInfoStore.get(viewType)) === null || _a === void 0 ? void 0 : _a.update({ options: controller.options });
            this._onDidChangeEditorTypes.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                this._notebookProviders.delete(viewType);
                this._onDidChangeEditorTypes.fire();
            });
        }
        registerNotebookSerializer(viewType, extensionData, serializer) {
            this._registerProviderData(viewType, new notebookService_1.SimpleNotebookProviderInfo(viewType, serializer, extensionData));
            return (0, lifecycle_1.toDisposable)(() => {
                this._notebookProviders.delete(viewType);
            });
        }
        async withNotebookDataProvider(resource, viewType) {
            const providers = this._notebookProviderInfoStore.getContributedNotebook(resource);
            // If we have a viewtype specified we want that data provider, as the resource won't always map correctly
            const selected = viewType ? providers.find(p => p.id === viewType) : providers[0];
            if (!selected) {
                throw new Error(`NO contribution for resource: '${resource.toString()}'`);
            }
            await this.canResolve(selected.id);
            const result = this._notebookProviders.get(selected.id);
            if (!result) {
                throw new Error(`NO provider registered for view type: '${selected.id}'`);
            }
            return result;
        }
        getRendererInfo(rendererId) {
            return this._notebookRenderersInfoStore.get(rendererId);
        }
        updateMimePreferredRenderer(mimeType, rendererId) {
            this._notebookRenderersInfoStore.setPreferred(mimeType, rendererId);
        }
        getMarkupRendererInfo() {
            return Array.from(this._markdownRenderersInfos);
        }
        // --- notebook documents: create, destory, retrieve, enumerate
        createNotebookTextModel(viewType, uri, data, transientOptions) {
            if (this._models.has(uri)) {
                throw new Error(`notebook for ${uri} already exists`);
            }
            const notebookModel = this._instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, viewType, uri, data.cells, data.metadata, transientOptions);
            this._models.set(uri, new ModelData(notebookModel, this._onWillDisposeDocument.bind(this)));
            this._onDidCreateNotebookDocument.fire(notebookModel);
            this._onDidAddNotebookDocument.fire(notebookModel);
            return notebookModel;
        }
        getNotebookTextModel(uri) {
            var _a;
            return (_a = this._models.get(uri)) === null || _a === void 0 ? void 0 : _a.model;
        }
        getNotebookTextModels() {
            return iterator_1.Iterable.map(this._models.values(), data => data.model);
        }
        listNotebookDocuments() {
            return [...this._models].map(e => e[1].model);
        }
        _onWillDisposeDocument(model) {
            const modelData = this._models.get(model.uri);
            if (modelData) {
                this._models.delete(model.uri);
                modelData.dispose();
                this._onDidRemoveNotebookDocument.fire(modelData.model);
            }
        }
        getMimeTypeInfo(textModel, kernelProvides, output) {
            var _a, _b;
            const mimeTypeSet = new Set();
            let mimeTypes = [];
            output.outputs.forEach(op => {
                if (!mimeTypeSet.has(op.mime)) {
                    mimeTypeSet.add(op.mime);
                    mimeTypes.push(op.mime);
                }
            });
            const coreDisplayOrder = this._displayOrder;
            const sorted = (0, notebookCommon_1.sortMimeTypes)(mimeTypes, (_a = coreDisplayOrder === null || coreDisplayOrder === void 0 ? void 0 : coreDisplayOrder.userOrder) !== null && _a !== void 0 ? _a : [], (_b = coreDisplayOrder === null || coreDisplayOrder === void 0 ? void 0 : coreDisplayOrder.defaultOrder) !== null && _b !== void 0 ? _b : []);
            const orderMimeTypes = [];
            sorted.forEach(mimeType => {
                const handlers = this._findBestMatchedRenderer(mimeType, kernelProvides);
                if (handlers.length) {
                    const handler = handlers[0];
                    orderMimeTypes.push({
                        mimeType: mimeType,
                        rendererId: handler.id,
                        isTrusted: textModel.metadata.trusted
                    });
                    for (let i = 1; i < handlers.length; i++) {
                        orderMimeTypes.push({
                            mimeType: mimeType,
                            rendererId: handlers[i].id,
                            isTrusted: textModel.metadata.trusted
                        });
                    }
                    if ((0, notebookCommon_1.mimeTypeSupportedByCore)(mimeType)) {
                        orderMimeTypes.push({
                            mimeType: mimeType,
                            rendererId: notebookCommon_1.BUILTIN_RENDERER_ID,
                            isTrusted: (0, notebookCommon_1.mimeTypeIsAlwaysSecure)(mimeType) || textModel.metadata.trusted
                        });
                    }
                }
                else {
                    if ((0, notebookCommon_1.mimeTypeSupportedByCore)(mimeType)) {
                        orderMimeTypes.push({
                            mimeType: mimeType,
                            rendererId: notebookCommon_1.BUILTIN_RENDERER_ID,
                            isTrusted: (0, notebookCommon_1.mimeTypeIsAlwaysSecure)(mimeType) || textModel.metadata.trusted
                        });
                    }
                    else {
                        orderMimeTypes.push({
                            mimeType: mimeType,
                            rendererId: notebookCommon_1.RENDERER_NOT_AVAILABLE,
                            isTrusted: textModel.metadata.trusted
                        });
                    }
                }
            });
            return orderMimeTypes;
        }
        _findBestMatchedRenderer(mimeType, kernelProvides) {
            return this._notebookRenderersInfoStore.getContributedRenderer(mimeType, kernelProvides);
        }
        getContributedNotebookProviders(resource) {
            if (resource) {
                return this._notebookProviderInfoStore.getContributedNotebook(resource);
            }
            return [...this._notebookProviderInfoStore];
        }
        getContributedNotebookProvider(viewType) {
            return this._notebookProviderInfoStore.get(viewType);
        }
        getNotebookProviderResourceRoots() {
            const ret = [];
            this._notebookProviders.forEach(val => {
                ret.push(uri_1.URI.revive(val.extensionData.location));
            });
            return ret;
        }
        // --- copy & paste
        setToCopy(items, isCopy) {
            this._cutItems = items;
            this._lastClipboardIsCopy = isCopy;
        }
        getToCopy() {
            if (this._cutItems) {
                return { items: this._cutItems, isCopy: this._lastClipboardIsCopy };
            }
            return undefined;
        }
    };
    NotebookService = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, accessibility_1.IAccessibilityService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, configuration_1.IConfigurationService)
    ], NotebookService);
    exports.NotebookService = NotebookService;
});
//# sourceMappingURL=notebookServiceImpl.js.map