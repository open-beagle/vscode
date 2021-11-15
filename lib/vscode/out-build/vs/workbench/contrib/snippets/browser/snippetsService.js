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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/strings", "vs/editor/common/services/modeService", "vs/editor/contrib/suggest/suggest", "vs/nls!vs/workbench/contrib/snippets/browser/snippetsService", "vs/platform/environment/common/environment", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/snippets/browser/snippets.contribution", "vs/workbench/contrib/snippets/browser/snippetsFile", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/mode/common/workbenchModeService", "./snippetCompletionProvider", "vs/workbench/services/extensionResourceLoader/common/extensionResourceLoader", "vs/base/common/map", "vs/platform/storage/common/storage", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, lifecycle_1, resources, strings_1, modeService_1, suggest_1, nls_1, environment_1, files_1, extensions_1, lifecycle_2, log_1, workspace_1, snippets_contribution_1, snippetsFile_1, extensionsRegistry_1, workbenchModeService_1, snippetCompletionProvider_1, extensionResourceLoader_1, map_1, storage_1, types_1, instantiation_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getNonWhitespacePrefix = void 0;
    var snippetExt;
    (function (snippetExt) {
        function toValidSnippet(extension, snippet, modeService) {
            if ((0, strings_1.isFalsyOrWhitespace)(snippet.path)) {
                extension.collector.error((0, nls_1.localize)(0, null, extension.description.name, String(snippet.path)));
                return null;
            }
            if ((0, strings_1.isFalsyOrWhitespace)(snippet.language) && !snippet.path.endsWith('.code-snippets')) {
                extension.collector.error((0, nls_1.localize)(1, null, extension.description.name, String(snippet.path)));
                return null;
            }
            if (!(0, strings_1.isFalsyOrWhitespace)(snippet.language) && !modeService.isRegisteredMode(snippet.language)) {
                extension.collector.error((0, nls_1.localize)(2, null, extension.description.name, String(snippet.language)));
                return null;
            }
            const extensionLocation = extension.description.extensionLocation;
            const snippetLocation = resources.joinPath(extensionLocation, snippet.path);
            if (!resources.isEqualOrParent(snippetLocation, extensionLocation)) {
                extension.collector.error((0, nls_1.localize)(3, null, extension.description.name, snippetLocation.path, extensionLocation.path));
                return null;
            }
            return {
                language: snippet.language,
                location: snippetLocation
            };
        }
        snippetExt.toValidSnippet = toValidSnippet;
        snippetExt.snippetsContribution = {
            description: (0, nls_1.localize)(4, null),
            type: 'array',
            defaultSnippets: [{ body: [{ language: '', path: '' }] }],
            items: {
                type: 'object',
                defaultSnippets: [{ body: { language: '${1:id}', path: './snippets/${2:id}.json.' } }],
                properties: {
                    language: {
                        description: (0, nls_1.localize)(5, null),
                        type: 'string'
                    },
                    path: {
                        description: (0, nls_1.localize)(6, null),
                        type: 'string'
                    }
                }
            }
        };
        snippetExt.point = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
            extensionPoint: 'snippets',
            deps: [workbenchModeService_1.languagesExtPoint],
            jsonSchema: snippetExt.snippetsContribution
        });
    })(snippetExt || (snippetExt = {}));
    function watch(service, resource, callback) {
        return (0, lifecycle_1.combinedDisposable)(service.watch(resource), service.onDidFilesChange(e => {
            if (e.affects(resource)) {
                callback();
            }
        }));
    }
    let SnippetEnablement = class SnippetEnablement {
        constructor(_storageService) {
            this._storageService = _storageService;
            const raw = _storageService.get(SnippetEnablement._key, 0 /* GLOBAL */, '');
            let data;
            try {
                data = JSON.parse(raw);
            }
            catch (_a) { }
            this._ignored = (0, types_1.isStringArray)(data) ? new Set(data) : new Set();
        }
        isIgnored(id) {
            return this._ignored.has(id);
        }
        updateIgnored(id, value) {
            let changed = false;
            if (this._ignored.has(id) && !value) {
                this._ignored.delete(id);
                changed = true;
            }
            else if (!this._ignored.has(id) && value) {
                this._ignored.add(id);
                changed = true;
            }
            if (changed) {
                this._storageService.store(SnippetEnablement._key, JSON.stringify(Array.from(this._ignored)), 0 /* GLOBAL */, 0 /* USER */);
            }
        }
    };
    SnippetEnablement._key = 'snippets.ignoredSnippets';
    SnippetEnablement = __decorate([
        __param(0, storage_1.IStorageService)
    ], SnippetEnablement);
    let SnippetsService = class SnippetsService {
        constructor(_environmentService, _contextService, _modeService, _logService, _fileService, _textfileService, _extensionResourceLoaderService, lifecycleService, instantiationService) {
            this._environmentService = _environmentService;
            this._contextService = _contextService;
            this._modeService = _modeService;
            this._logService = _logService;
            this._fileService = _fileService;
            this._textfileService = _textfileService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this._disposables = new lifecycle_1.DisposableStore();
            this._pendingWork = [];
            this._files = new map_1.ResourceMap();
            this._pendingWork.push(Promise.resolve(lifecycleService.when(3 /* Restored */).then(() => {
                this._initExtensionSnippets();
                this._initUserSnippets();
                this._initWorkspaceSnippets();
            })));
            (0, suggest_1.setSnippetSuggestSupport)(new snippetCompletionProvider_1.SnippetCompletionProvider(this._modeService, this));
            this._enablement = instantiationService.createInstance(SnippetEnablement);
        }
        dispose() {
            this._disposables.dispose();
        }
        isEnabled(snippet) {
            return !snippet.snippetIdentifier || !this._enablement.isIgnored(snippet.snippetIdentifier);
        }
        updateEnablement(snippet, enabled) {
            if (snippet.snippetIdentifier) {
                this._enablement.updateIgnored(snippet.snippetIdentifier, !enabled);
            }
        }
        _joinSnippets() {
            const promises = this._pendingWork.slice(0);
            this._pendingWork.length = 0;
            return Promise.all(promises);
        }
        async getSnippetFiles() {
            await this._joinSnippets();
            return this._files.values();
        }
        async getSnippets(languageId, opts) {
            await this._joinSnippets();
            const result = [];
            const promises = [];
            const languageIdentifier = this._modeService.getLanguageIdentifier(languageId);
            if (languageIdentifier) {
                const langName = languageIdentifier.language;
                for (const file of this._files.values()) {
                    promises.push(file.load()
                        .then(file => file.select(langName, result))
                        .catch(err => this._logService.error(err, file.location.toString())));
                }
            }
            await Promise.all(promises);
            return this._filterSnippets(result, opts);
        }
        getSnippetsSync(languageId, opts) {
            const result = [];
            const languageIdentifier = this._modeService.getLanguageIdentifier(languageId);
            if (languageIdentifier) {
                const langName = languageIdentifier.language;
                for (const file of this._files.values()) {
                    // kick off loading (which is a noop in case it's already loaded)
                    // and optimistically collect snippets
                    file.load().catch(_err => { });
                    file.select(langName, result);
                }
            }
            return this._filterSnippets(result, opts);
        }
        _filterSnippets(snippets, opts) {
            return snippets.filter(snippet => {
                return (snippet.prefix || (opts === null || opts === void 0 ? void 0 : opts.includeNoPrefixSnippets)) // prefix or no-prefix wanted
                    && (this.isEnabled(snippet) || (opts === null || opts === void 0 ? void 0 : opts.includeDisabledSnippets)); // enabled or disabled wanted
            });
        }
        // --- loading, watching
        _initExtensionSnippets() {
            snippetExt.point.setHandler(extensions => {
                for (const [key, value] of this._files) {
                    if (value.source === 3 /* Extension */) {
                        this._files.delete(key);
                    }
                }
                for (const extension of extensions) {
                    for (const contribution of extension.value) {
                        const validContribution = snippetExt.toValidSnippet(extension, contribution, this._modeService);
                        if (!validContribution) {
                            continue;
                        }
                        const file = this._files.get(validContribution.location);
                        if (file) {
                            if (file.defaultScopes) {
                                file.defaultScopes.push(validContribution.language);
                            }
                            else {
                                file.defaultScopes = [];
                            }
                        }
                        else {
                            const file = new snippetsFile_1.SnippetFile(3 /* Extension */, validContribution.location, validContribution.language ? [validContribution.language] : undefined, extension.description, this._fileService, this._extensionResourceLoaderService);
                            this._files.set(file.location, file);
                            if (this._environmentService.isExtensionDevelopment) {
                                file.load().then(file => {
                                    // warn about bad tabstop/variable usage
                                    if (file.data.some(snippet => snippet.isBogous)) {
                                        extension.collector.warn((0, nls_1.localize)(7, null, extension.description.name));
                                    }
                                }, err => {
                                    // generic error
                                    extension.collector.warn((0, nls_1.localize)(8, null, file.location.toString()));
                                });
                            }
                        }
                    }
                }
            });
        }
        _initWorkspaceSnippets() {
            // workspace stuff
            let disposables = new lifecycle_1.DisposableStore();
            let updateWorkspaceSnippets = () => {
                disposables.clear();
                this._pendingWork.push(this._initWorkspaceFolderSnippets(this._contextService.getWorkspace(), disposables));
            };
            this._disposables.add(disposables);
            this._disposables.add(this._contextService.onDidChangeWorkspaceFolders(updateWorkspaceSnippets));
            this._disposables.add(this._contextService.onDidChangeWorkbenchState(updateWorkspaceSnippets));
            updateWorkspaceSnippets();
        }
        async _initWorkspaceFolderSnippets(workspace, bucket) {
            const promises = workspace.folders.map(async (folder) => {
                const snippetFolder = folder.toResource('.vscode');
                const value = await this._fileService.exists(snippetFolder);
                if (value) {
                    this._initFolderSnippets(2 /* Workspace */, snippetFolder, bucket);
                }
                else {
                    // watch
                    bucket.add(this._fileService.onDidFilesChange(e => {
                        if (e.contains(snippetFolder, 1 /* ADDED */)) {
                            this._initFolderSnippets(2 /* Workspace */, snippetFolder, bucket);
                        }
                    }));
                }
            });
            await Promise.all(promises);
        }
        async _initUserSnippets() {
            const userSnippetsFolder = this._environmentService.snippetsHome;
            await this._fileService.createFolder(userSnippetsFolder);
            return await this._initFolderSnippets(1 /* User */, userSnippetsFolder, this._disposables);
        }
        _initFolderSnippets(source, folder, bucket) {
            const disposables = new lifecycle_1.DisposableStore();
            const addFolderSnippets = async () => {
                disposables.clear();
                if (!await this._fileService.exists(folder)) {
                    return;
                }
                try {
                    const stat = await this._fileService.resolve(folder);
                    for (const entry of stat.children || []) {
                        disposables.add(this._addSnippetFile(entry.resource, source));
                    }
                }
                catch (err) {
                    this._logService.error(`Failed snippets from folder '${folder.toString()}'`, err);
                }
            };
            bucket.add(this._textfileService.files.onDidSave(e => {
                if (resources.isEqualOrParent(e.model.resource, folder)) {
                    addFolderSnippets();
                }
            }));
            bucket.add(watch(this._fileService, folder, addFolderSnippets));
            bucket.add(disposables);
            return addFolderSnippets();
        }
        _addSnippetFile(uri, source) {
            const ext = resources.extname(uri);
            if (source === 1 /* User */ && ext === '.json') {
                const langName = resources.basename(uri).replace(/\.json/, '');
                this._files.set(uri, new snippetsFile_1.SnippetFile(source, uri, [langName], undefined, this._fileService, this._extensionResourceLoaderService));
            }
            else if (ext === '.code-snippets') {
                this._files.set(uri, new snippetsFile_1.SnippetFile(source, uri, undefined, undefined, this._fileService, this._extensionResourceLoaderService));
            }
            return {
                dispose: () => this._files.delete(uri)
            };
        }
    };
    SnippetsService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, modeService_1.IModeService),
        __param(3, log_1.ILogService),
        __param(4, files_1.IFileService),
        __param(5, textfiles_1.ITextFileService),
        __param(6, extensionResourceLoader_1.IExtensionResourceLoaderService),
        __param(7, lifecycle_2.ILifecycleService),
        __param(8, instantiation_1.IInstantiationService)
    ], SnippetsService);
    (0, extensions_1.registerSingleton)(snippets_contribution_1.ISnippetsService, SnippetsService, true);
    function getNonWhitespacePrefix(model, position) {
        /**
         * Do not analyze more characters
         */
        const MAX_PREFIX_LENGTH = 100;
        let line = model.getLineContent(position.lineNumber).substr(0, position.column - 1);
        let minChIndex = Math.max(0, line.length - MAX_PREFIX_LENGTH);
        for (let chIndex = line.length - 1; chIndex >= minChIndex; chIndex--) {
            let ch = line.charAt(chIndex);
            if (/\s/.test(ch)) {
                return line.substr(chIndex + 1);
            }
        }
        if (minChIndex === 0) {
            return line;
        }
        return '';
    }
    exports.getNonWhitespacePrefix = getNonWhitespacePrefix;
});
//# sourceMappingURL=snippetsService.js.map