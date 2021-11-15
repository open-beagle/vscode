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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/base/common/event", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/editor/common/services/modelService", "vs/nls!vs/workbench/contrib/searchEditor/browser/searchEditorInput", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/workbench/common/editor", "vs/workbench/common/memento", "vs/workbench/contrib/searchEditor/browser/constants", "vs/workbench/contrib/searchEditor/browser/searchEditorModel", "vs/workbench/contrib/searchEditor/browser/searchEditorSerialization", "vs/workbench/services/path/common/pathService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/css!./media/searchEditor"], function (require, exports, platform_1, event_1, path_1, resources_1, uri_1, modelService_1, nls_1, configuration_1, dialogs_1, instantiation_1, storage_1, telemetry_1, editor_1, memento_1, constants_1, searchEditorModel_1, searchEditorSerialization_1, pathService_1, textfiles_1, workingCopyService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOrMakeSearchEditorInput = exports.SearchEditorInput = exports.SEARCH_EDITOR_EXT = void 0;
    exports.SEARCH_EDITOR_EXT = '.code-search';
    let SearchEditorInput = class SearchEditorInput extends editor_1.EditorInput {
        constructor(modelUri, backingUri, searchEditorModel, modelService, textFileService, fileDialogService, instantiationService, workingCopyService, telemetryService, pathService, storageService) {
            super();
            this.modelUri = modelUri;
            this.backingUri = backingUri;
            this.searchEditorModel = searchEditorModel;
            this.modelService = modelService;
            this.textFileService = textFileService;
            this.fileDialogService = fileDialogService;
            this.instantiationService = instantiationService;
            this.workingCopyService = workingCopyService;
            this.telemetryService = telemetryService;
            this.pathService = pathService;
            this.dirty = false;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            this.oldDecorationsIDs = [];
            this.fileEditorInputFactory = platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).getFileEditorInputFactory();
            this._config = searchEditorModel.config;
            searchEditorModel.onModelResolved
                .then(model => {
                this._register(model.onDidChangeContent(() => this._onDidChangeContent.fire()));
                this._register(model);
                this._cachedModel = model;
            });
            if (this.modelUri.scheme !== constants_1.SearchEditorScheme) {
                throw Error('SearchEditorInput must be invoked with a SearchEditorScheme uri');
            }
            this.memento = new memento_1.Memento(SearchEditorInput.ID, storageService);
            storageService.onWillSaveState(() => this.memento.saveMemento());
            const input = this;
            const workingCopyAdapter = new class {
                constructor() {
                    this.typeId = constants_1.SearchEditorWorkingCopyTypeId;
                    this.resource = input.modelUri;
                    this.capabilities = input.isUntitled() ? 2 /* Untitled */ : 0 /* None */;
                    this.onDidChangeDirty = input.onDidChangeDirty;
                    this.onDidChangeContent = input.onDidChangeContent;
                }
                get name() { return input.getName(); }
                isDirty() { return input.isDirty(); }
                backup(token) { return input.backup(token); }
                save(options) { return input.save(0, options).then(editor => !!editor); }
                revert(options) { return input.revert(0, options); }
            };
            this._register(this.workingCopyService.registerWorkingCopy(workingCopyAdapter));
        }
        get typeId() {
            return SearchEditorInput.ID;
        }
        get model() {
            return this.searchEditorModel.resolve();
        }
        get config() { return this._config; }
        set config(value) {
            this._config = value;
            this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */).searchConfig = value;
            this._onDidChangeLabel.fire();
        }
        get resource() {
            return this.backingUri || this.modelUri;
        }
        async save(group, options) {
            if ((await this.model).isDisposed()) {
                return;
            }
            if (this.backingUri) {
                await this.textFileService.write(this.backingUri, await this.serializeForDisk(), options);
                this.setDirty(false);
                return this;
            }
            else {
                return this.saveAs(group, options);
            }
        }
        async serializeForDisk() {
            return (0, searchEditorSerialization_1.serializeSearchConfiguration)(this.config) + '\n' + (await this.model).getValue();
        }
        async getModels() {
            return { config: this.config, body: await this.model };
        }
        async saveAs(group, options) {
            const path = await this.fileDialogService.pickFileToSave(await this.suggestFileName(), options === null || options === void 0 ? void 0 : options.availableFileSystems);
            if (path) {
                this.telemetryService.publicLog2('searchEditor/saveSearchResults');
                const toWrite = await this.serializeForDisk();
                if (await this.textFileService.create([{ resource: path, value: toWrite, options: { overwrite: true } }])) {
                    this.setDirty(false);
                    if (!(0, resources_1.isEqual)(path, this.modelUri)) {
                        const input = this.instantiationService.invokeFunction(exports.getOrMakeSearchEditorInput, { config: this.config, backingUri: path });
                        input.setMatchRanges(this.getMatchRanges());
                        return input;
                    }
                    return this;
                }
            }
            return undefined;
        }
        getName(maxLength = 12) {
            var _a;
            const trimToMax = (label) => (label.length < maxLength ? label : `${label.slice(0, maxLength - 3)}...`);
            if (this.backingUri) {
                const originalURI = editor_1.EditorResourceAccessor.getOriginalUri(this);
                return (0, nls_1.localize)(0, null, (0, path_1.basename)((originalURI !== null && originalURI !== void 0 ? originalURI : this.backingUri).path, exports.SEARCH_EDITOR_EXT));
            }
            const query = (_a = this.config.query) === null || _a === void 0 ? void 0 : _a.trim();
            if (query) {
                return (0, nls_1.localize)(1, null, trimToMax(query));
            }
            return (0, nls_1.localize)(2, null);
        }
        setDirty(dirty) {
            this.dirty = dirty;
            this._onDidChangeDirty.fire();
        }
        isDirty() {
            return this.dirty;
        }
        isReadonly() {
            return false;
        }
        isUntitled() {
            return !this.backingUri;
        }
        rename(group, target) {
            if (this._cachedModel && (0, resources_1.extname)(target) === exports.SEARCH_EDITOR_EXT) {
                return {
                    editor: this.instantiationService.invokeFunction(exports.getOrMakeSearchEditorInput, { config: this.config, text: this._cachedModel.getValue(), backingUri: target })
                };
            }
            // Ignore move if editor was renamed to a different file extension
            return undefined;
        }
        dispose() {
            this.modelService.destroyModel(this.modelUri);
            super.dispose();
        }
        matches(other) {
            if (this === other) {
                return true;
            }
            if (other instanceof SearchEditorInput) {
                return !!(other.modelUri.fragment && other.modelUri.fragment === this.modelUri.fragment);
            }
            else if (this.fileEditorInputFactory.isFileEditorInput(other)) {
                return (0, resources_1.isEqual)(other.resource, this.backingUri);
            }
            return false;
        }
        getMatchRanges() {
            var _a, _b;
            return ((_b = (_a = this._cachedModel) === null || _a === void 0 ? void 0 : _a.getAllDecorations()) !== null && _b !== void 0 ? _b : [])
                .filter(decoration => decoration.options.className === constants_1.SearchEditorFindMatchClass)
                .filter(({ range }) => !(range.startColumn === 1 && range.endColumn === 1))
                .map(({ range }) => range);
        }
        async setMatchRanges(ranges) {
            this.oldDecorationsIDs = (await this.searchEditorModel.onModelResolved).deltaDecorations(this.oldDecorationsIDs, ranges.map(range => ({ range, options: { className: constants_1.SearchEditorFindMatchClass, stickiness: 1 /* NeverGrowsWhenTypingAtEdges */ } })));
        }
        async revert(group, options) {
            if (options === null || options === void 0 ? void 0 : options.soft) {
                this.setDirty(false);
                return;
            }
            if (this.backingUri) {
                const { config, text } = await this.instantiationService.invokeFunction(searchEditorSerialization_1.parseSavedSearchEditor, this.backingUri);
                (await this.model).setValue(text);
                this.config = config;
            }
            else {
                (await this.model).setValue('');
            }
            super.revert(group, options);
            this.setDirty(false);
        }
        canSplit() {
            return false;
        }
        async backup(token) {
            const model = await this.model;
            if (token.isCancellationRequested) {
                return {};
            }
            return { content: (0, textfiles_1.toBufferOrReadable)(model.createSnapshot(true /* preserve BOM */)) };
        }
        async suggestFileName() {
            const query = (0, searchEditorSerialization_1.extractSearchQueryFromModel)(await this.model).query;
            const searchFileName = (query.replace(/[^\w \-_]+/g, '_') || 'Search') + exports.SEARCH_EDITOR_EXT;
            return (0, resources_1.joinPath)(await this.fileDialogService.defaultFilePath(this.pathService.defaultUriScheme), searchFileName);
        }
    };
    SearchEditorInput.ID = 'workbench.editorinputs.searchEditorInput';
    SearchEditorInput = __decorate([
        __param(3, modelService_1.IModelService),
        __param(4, textfiles_1.ITextFileService),
        __param(5, dialogs_1.IFileDialogService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, workingCopyService_1.IWorkingCopyService),
        __param(8, telemetry_1.ITelemetryService),
        __param(9, pathService_1.IPathService),
        __param(10, storage_1.IStorageService)
    ], SearchEditorInput);
    exports.SearchEditorInput = SearchEditorInput;
    const inputs = new Map();
    const getOrMakeSearchEditorInput = (accessor, existingData) => {
        var _a, _b, _c, _d;
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const storageService = accessor.get(storage_1.IStorageService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const searchEditorSettings = configurationService.getValue('search').searchEditor;
        const reuseOldSettings = searchEditorSettings.reusePriorSearchConfiguration;
        const defaultNumberOfContextLines = searchEditorSettings.defaultNumberOfContextLines;
        const priorConfig = reuseOldSettings ? new memento_1.Memento(SearchEditorInput.ID, storageService).getMemento(1 /* WORKSPACE */, 1 /* MACHINE */).searchConfig : {};
        const defaultConfig = (0, searchEditorSerialization_1.defaultSearchConfig)();
        const config = Object.assign(Object.assign(Object.assign({}, defaultConfig), priorConfig), existingData.config);
        if (defaultNumberOfContextLines !== null && defaultNumberOfContextLines !== undefined) {
            config.contextLines = (_a = existingData.config.contextLines) !== null && _a !== void 0 ? _a : defaultNumberOfContextLines;
        }
        if (existingData.text) {
            config.contextLines = 0;
        }
        const modelUri = (_b = existingData.modelUri) !== null && _b !== void 0 ? _b : uri_1.URI.from({ scheme: constants_1.SearchEditorScheme, fragment: `${Math.random()}` });
        const cacheKey = (_d = (_c = existingData.backingUri) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : modelUri.toString();
        const existing = inputs.get(cacheKey);
        if (existing) {
            return existing;
        }
        const model = instantiationService.createInstance(searchEditorModel_1.SearchEditorModel, modelUri, config, existingData);
        const input = instantiationService.createInstance(SearchEditorInput, modelUri, existingData.backingUri, model);
        inputs.set(cacheKey, input);
        input.onWillDispose(() => inputs.delete(cacheKey));
        return input;
    };
    exports.getOrMakeSearchEditorInput = getOrMakeSearchEditorInput;
});
//# sourceMappingURL=searchEditorInput.js.map