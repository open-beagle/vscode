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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/collections", "vs/base/common/glob", "vs/base/common/labels", "vs/base/common/map", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/model/textModelSearch", "vs/nls!vs/workbench/contrib/search/common/queryBuilder", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/search/common/search"], function (require, exports, arrays, collections, glob, labels_1, map_1, network_1, path, resources_1, strings, types_1, uri_1, textModelSearch_1, nls, configuration_1, workspace_1, editorGroupsService_1, pathService_1, search_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveResourcesForSearchIncludes = exports.QueryBuilder = void 0;
    let QueryBuilder = class QueryBuilder {
        constructor(configurationService, workspaceContextService, editorGroupsService, pathService) {
            this.configurationService = configurationService;
            this.workspaceContextService = workspaceContextService;
            this.editorGroupsService = editorGroupsService;
            this.pathService = pathService;
        }
        text(contentPattern, folderResources, options = {}) {
            contentPattern = this.getContentPattern(contentPattern, options);
            const searchConfig = this.configurationService.getValue();
            const fallbackToPCRE = folderResources && folderResources.some(folder => {
                const folderConfig = this.configurationService.getValue({ resource: folder });
                return !folderConfig.search.useRipgrep;
            });
            const commonQuery = this.commonQuery(folderResources === null || folderResources === void 0 ? void 0 : folderResources.map(workspace_1.toWorkspaceFolder), options);
            return Object.assign(Object.assign({}, commonQuery), { type: 2 /* Text */, contentPattern, previewOptions: options.previewOptions, maxFileSize: options.maxFileSize, usePCRE2: searchConfig.search.usePCRE2 || fallbackToPCRE || false, beforeContext: options.beforeContext, afterContext: options.afterContext, userDisabledExcludesAndIgnoreFiles: options.disregardExcludeSettings && options.disregardIgnoreFiles });
        }
        /**
         * Adjusts input pattern for config
         */
        getContentPattern(inputPattern, options) {
            const searchConfig = this.configurationService.getValue();
            if (inputPattern.isRegExp) {
                inputPattern.pattern = inputPattern.pattern.replace(/\r?\n/g, '\\n');
            }
            const newPattern = Object.assign(Object.assign({}, inputPattern), { wordSeparators: searchConfig.editor.wordSeparators });
            if (this.isCaseSensitive(inputPattern, options)) {
                newPattern.isCaseSensitive = true;
            }
            if (this.isMultiline(inputPattern)) {
                newPattern.isMultiline = true;
            }
            return newPattern;
        }
        file(folders, options = {}) {
            const commonQuery = this.commonQuery(folders, options);
            return Object.assign(Object.assign({}, commonQuery), { type: 1 /* File */, filePattern: options.filePattern
                    ? options.filePattern.trim()
                    : options.filePattern, exists: options.exists, sortByScore: options.sortByScore, cacheKey: options.cacheKey });
        }
        handleIncludeExclude(pattern, expandPatterns) {
            if (!pattern) {
                return {};
            }
            pattern = Array.isArray(pattern) ? pattern.map(normalizeSlashes) : normalizeSlashes(pattern);
            return expandPatterns
                ? this.parseSearchPaths(pattern)
                : { pattern: patternListToIExpression(...(Array.isArray(pattern) ? pattern : [pattern])) };
        }
        commonQuery(folderResources = [], options = {}) {
            const includeSearchPathsInfo = this.handleIncludeExclude(options.includePattern, options.expandPatterns);
            const excludeSearchPathsInfo = this.handleIncludeExclude(options.excludePattern, options.expandPatterns);
            // Build folderQueries from searchPaths, if given, otherwise folderResources
            const includeFolderName = folderResources.length > 1;
            const folderQueries = (includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length ?
                includeSearchPathsInfo.searchPaths.map(searchPath => this.getFolderQueryForSearchPath(searchPath, options, excludeSearchPathsInfo)) :
                folderResources.map(folder => this.getFolderQueryForRoot(folder, options, excludeSearchPathsInfo, includeFolderName)))
                .filter(query => !!query);
            const queryProps = {
                _reason: options._reason,
                folderQueries,
                usingSearchPaths: !!(includeSearchPathsInfo.searchPaths && includeSearchPathsInfo.searchPaths.length),
                extraFileResources: options.extraFileResources,
                excludePattern: excludeSearchPathsInfo.pattern,
                includePattern: includeSearchPathsInfo.pattern,
                onlyOpenEditors: options.onlyOpenEditors,
                maxResults: options.maxResults
            };
            if (options.onlyOpenEditors) {
                const openEditors = arrays.coalesce(arrays.flatten(this.editorGroupsService.groups.map(group => group.editors.map(editor => editor.resource))));
                const openEditorsInQuery = openEditors.filter(editor => (0, search_1.pathIncludedInQuery)(queryProps, editor.fsPath));
                const openEditorsQueryProps = this.commonQueryFromFileList(openEditorsInQuery);
                return Object.assign(Object.assign({}, queryProps), openEditorsQueryProps);
            }
            // Filter extraFileResources against global include/exclude patterns - they are already expected to not belong to a workspace
            const extraFileResources = options.extraFileResources && options.extraFileResources.filter(extraFile => (0, search_1.pathIncludedInQuery)(queryProps, extraFile.fsPath));
            queryProps.extraFileResources = extraFileResources && extraFileResources.length ? extraFileResources : undefined;
            return queryProps;
        }
        commonQueryFromFileList(files) {
            const folderQueries = [];
            const foldersToSearch = new map_1.ResourceMap();
            const includePattern = {};
            let hasIncludedFile = false;
            files.forEach(file => {
                var _a, _b;
                if (file.scheme === network_1.Schemas.walkThrough) {
                    return;
                }
                const providerExists = (0, resources_1.isAbsolutePath)(file);
                // Special case userdata as we don't have a search provider for it, but it can be searched.
                if (providerExists) {
                    const searchRoot = (_b = (_a = this.workspaceContextService.getWorkspaceFolder(file)) === null || _a === void 0 ? void 0 : _a.uri) !== null && _b !== void 0 ? _b : file.with({ path: path.dirname(file.fsPath) });
                    let folderQuery = foldersToSearch.get(searchRoot);
                    if (!folderQuery) {
                        hasIncludedFile = true;
                        folderQuery = { folder: searchRoot, includePattern: {} };
                        folderQueries.push(folderQuery);
                        foldersToSearch.set(searchRoot, folderQuery);
                    }
                    const relPath = path.relative(searchRoot.fsPath, file.fsPath);
                    (0, types_1.assertIsDefined)(folderQuery.includePattern)[relPath.replace(/\\/g, '/')] = true;
                }
                else {
                    if (file.fsPath) {
                        hasIncludedFile = true;
                        includePattern[file.fsPath] = true;
                    }
                }
            });
            return {
                folderQueries,
                includePattern,
                usingSearchPaths: true,
                excludePattern: hasIncludedFile ? undefined : { '**/*': true }
            };
        }
        /**
         * Resolve isCaseSensitive flag based on the query and the isSmartCase flag, for search providers that don't support smart case natively.
         */
        isCaseSensitive(contentPattern, options) {
            if (options.isSmartCase) {
                if (contentPattern.isRegExp) {
                    // Consider it case sensitive if it contains an unescaped capital letter
                    if (strings.containsUppercaseCharacter(contentPattern.pattern, true)) {
                        return true;
                    }
                }
                else if (strings.containsUppercaseCharacter(contentPattern.pattern)) {
                    return true;
                }
            }
            return !!contentPattern.isCaseSensitive;
        }
        isMultiline(contentPattern) {
            if (contentPattern.isMultiline) {
                return true;
            }
            if (contentPattern.isRegExp && (0, textModelSearch_1.isMultilineRegexSource)(contentPattern.pattern)) {
                return true;
            }
            if (contentPattern.pattern.indexOf('\n') >= 0) {
                return true;
            }
            return !!contentPattern.isMultiline;
        }
        /**
         * Take the includePattern as seen in the search viewlet, and split into components that look like searchPaths, and
         * glob patterns. Glob patterns are expanded from 'foo/bar' to '{foo/bar/**, **\/foo/bar}.
         *
         * Public for test.
         */
        parseSearchPaths(pattern) {
            const isSearchPath = (segment) => {
                // A segment is a search path if it is an absolute path or starts with ./, ../, .\, or ..\
                return path.isAbsolute(segment) || /^\.\.?([\/\\]|$)/.test(segment);
            };
            const patterns = Array.isArray(pattern) ? pattern : splitGlobPattern(pattern);
            const segments = patterns
                .map(segment => {
                const userHome = this.pathService.resolvedUserHome;
                if (userHome) {
                    return (0, labels_1.untildify)(segment, userHome.scheme === network_1.Schemas.file ? userHome.fsPath : userHome.path);
                }
                return segment;
            });
            const groups = collections.groupBy(segments, segment => isSearchPath(segment) ? 'searchPaths' : 'exprSegments');
            const expandedExprSegments = (groups.exprSegments || [])
                .map(s => strings.rtrim(s, '/'))
                .map(s => strings.rtrim(s, '\\'))
                .map(p => {
                if (p[0] === '.') {
                    p = '*' + p; // convert ".js" to "*.js"
                }
                return expandGlobalGlob(p);
            });
            const result = {};
            const searchPaths = this.expandSearchPathPatterns(groups.searchPaths || []);
            if (searchPaths && searchPaths.length) {
                result.searchPaths = searchPaths;
            }
            const exprSegments = arrays.flatten(expandedExprSegments);
            const includePattern = patternListToIExpression(...exprSegments);
            if (includePattern) {
                result.pattern = includePattern;
            }
            return result;
        }
        getExcludesForFolder(folderConfig, options) {
            return options.disregardExcludeSettings ?
                undefined :
                (0, search_1.getExcludes)(folderConfig, !options.disregardSearchExcludeSettings);
        }
        /**
         * Split search paths (./ or ../ or absolute paths in the includePatterns) into absolute paths and globs applied to those paths
         */
        expandSearchPathPatterns(searchPaths) {
            if (!searchPaths || !searchPaths.length) {
                // No workspace => ignore search paths
                return [];
            }
            const expandedSearchPaths = arrays.flatten(searchPaths.map(searchPath => {
                // 1 open folder => just resolve the search paths to absolute paths
                let { pathPortion, globPortion } = splitGlobFromPath(searchPath);
                if (globPortion) {
                    globPortion = normalizeGlobPattern(globPortion);
                }
                // One pathPortion to multiple expanded search paths (e.g. duplicate matching workspace folders)
                const oneExpanded = this.expandOneSearchPath(pathPortion);
                // Expanded search paths to multiple resolved patterns (with ** and without)
                return arrays.flatten(oneExpanded.map(oneExpandedResult => this.resolveOneSearchPathPattern(oneExpandedResult, globPortion)));
            }));
            const searchPathPatternMap = new Map();
            expandedSearchPaths.forEach(oneSearchPathPattern => {
                const key = oneSearchPathPattern.searchPath.toString();
                const existing = searchPathPatternMap.get(key);
                if (existing) {
                    if (oneSearchPathPattern.pattern) {
                        existing.pattern = existing.pattern || {};
                        existing.pattern[oneSearchPathPattern.pattern] = true;
                    }
                }
                else {
                    searchPathPatternMap.set(key, {
                        searchPath: oneSearchPathPattern.searchPath,
                        pattern: oneSearchPathPattern.pattern ? patternListToIExpression(oneSearchPathPattern.pattern) : undefined
                    });
                }
            });
            return Array.from(searchPathPatternMap.values());
        }
        /**
         * Takes a searchPath like `./a/foo` or `../a/foo` and expands it to absolute paths for all the workspaces it matches.
         */
        expandOneSearchPath(searchPath) {
            if (path.isAbsolute(searchPath)) {
                const workspaceFolders = this.workspaceContextService.getWorkspace().folders;
                if (workspaceFolders[0] && workspaceFolders[0].uri.scheme !== network_1.Schemas.file) {
                    return [{
                            searchPath: workspaceFolders[0].uri.with({ path: searchPath })
                        }];
                }
                // Currently only local resources can be searched for with absolute search paths.
                // TODO convert this to a workspace folder + pattern, so excludes will be resolved properly for an absolute path inside a workspace folder
                return [{
                        searchPath: uri_1.URI.file(path.normalize(searchPath))
                    }];
            }
            if (this.workspaceContextService.getWorkbenchState() === 2 /* FOLDER */) {
                const workspaceUri = this.workspaceContextService.getWorkspace().folders[0].uri;
                searchPath = normalizeSlashes(searchPath);
                if (searchPath.startsWith('../') || searchPath === '..') {
                    const resolvedPath = path.posix.resolve(workspaceUri.path, searchPath);
                    return [{
                            searchPath: workspaceUri.with({ path: resolvedPath })
                        }];
                }
                const cleanedPattern = normalizeGlobPattern(searchPath);
                return [{
                        searchPath: workspaceUri,
                        pattern: cleanedPattern
                    }];
            }
            else if (searchPath === './' || searchPath === '.\\') {
                return []; // ./ or ./**/foo makes sense for single-folder but not multi-folder workspaces
            }
            else {
                const relativeSearchPathMatch = searchPath.match(/\.[\/\\]([^\/\\]+)(?:[\/\\](.+))?/);
                if (relativeSearchPathMatch) {
                    const searchPathRoot = relativeSearchPathMatch[1];
                    const matchingRoots = this.workspaceContextService.getWorkspace().folders.filter(folder => folder.name === searchPathRoot);
                    if (matchingRoots.length) {
                        return matchingRoots.map(root => {
                            const patternMatch = relativeSearchPathMatch[2];
                            return {
                                searchPath: root.uri,
                                pattern: patternMatch && normalizeGlobPattern(patternMatch)
                            };
                        });
                    }
                    else {
                        // No root folder with name
                        const searchPathNotFoundError = nls.localize(0, null, searchPathRoot);
                        throw new Error(searchPathNotFoundError);
                    }
                }
                else {
                    // Malformed ./ search path, ignore
                }
            }
            return [];
        }
        resolveOneSearchPathPattern(oneExpandedResult, globPortion) {
            const pattern = oneExpandedResult.pattern && globPortion ?
                `${oneExpandedResult.pattern}/${globPortion}` :
                oneExpandedResult.pattern || globPortion;
            const results = [
                {
                    searchPath: oneExpandedResult.searchPath,
                    pattern
                }
            ];
            if (pattern && !pattern.endsWith('**')) {
                results.push({
                    searchPath: oneExpandedResult.searchPath,
                    pattern: pattern + '/**'
                });
            }
            return results;
        }
        getFolderQueryForSearchPath(searchPath, options, searchPathExcludes) {
            const rootConfig = this.getFolderQueryForRoot((0, workspace_1.toWorkspaceFolder)(searchPath.searchPath), options, searchPathExcludes, false);
            if (!rootConfig) {
                return null;
            }
            return Object.assign(Object.assign({}, rootConfig), {
                includePattern: searchPath.pattern
            });
        }
        getFolderQueryForRoot(folder, options, searchPathExcludes, includeFolderName) {
            let thisFolderExcludeSearchPathPattern;
            const folderUri = uri_1.URI.isUri(folder) ? folder : folder.uri;
            if (searchPathExcludes.searchPaths) {
                const thisFolderExcludeSearchPath = searchPathExcludes.searchPaths.filter(sp => (0, resources_1.isEqual)(sp.searchPath, folderUri))[0];
                if (thisFolderExcludeSearchPath && !thisFolderExcludeSearchPath.pattern) {
                    // entire folder is excluded
                    return null;
                }
                else if (thisFolderExcludeSearchPath) {
                    thisFolderExcludeSearchPathPattern = thisFolderExcludeSearchPath.pattern;
                }
            }
            const folderConfig = this.configurationService.getValue({ resource: folderUri });
            const settingExcludes = this.getExcludesForFolder(folderConfig, options);
            const excludePattern = Object.assign(Object.assign({}, (settingExcludes || {})), (thisFolderExcludeSearchPathPattern || {}));
            const folderName = uri_1.URI.isUri(folder) ? (0, resources_1.basename)(folder) : folder.name;
            return {
                folder: folderUri,
                folderName: includeFolderName ? folderName : undefined,
                excludePattern: Object.keys(excludePattern).length > 0 ? excludePattern : undefined,
                fileEncoding: folderConfig.files && folderConfig.files.encoding,
                disregardIgnoreFiles: typeof options.disregardIgnoreFiles === 'boolean' ? options.disregardIgnoreFiles : !folderConfig.search.useIgnoreFiles,
                disregardGlobalIgnoreFiles: typeof options.disregardGlobalIgnoreFiles === 'boolean' ? options.disregardGlobalIgnoreFiles : !folderConfig.search.useGlobalIgnoreFiles,
                ignoreSymlinks: typeof options.ignoreSymlinks === 'boolean' ? options.ignoreSymlinks : !folderConfig.search.followSymlinks,
            };
        }
    };
    QueryBuilder = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, editorGroupsService_1.IEditorGroupsService),
        __param(3, pathService_1.IPathService)
    ], QueryBuilder);
    exports.QueryBuilder = QueryBuilder;
    function splitGlobFromPath(searchPath) {
        const globCharMatch = searchPath.match(/[\*\{\}\(\)\[\]\?]/);
        if (globCharMatch) {
            const globCharIdx = globCharMatch.index;
            const lastSlashMatch = searchPath.substr(0, globCharIdx).match(/[/|\\][^/\\]*$/);
            if (lastSlashMatch) {
                let pathPortion = searchPath.substr(0, lastSlashMatch.index);
                if (!pathPortion.match(/[/\\]/)) {
                    // If the last slash was the only slash, then we now have '' or 'C:' or '.'. Append a slash.
                    pathPortion += '/';
                }
                return {
                    pathPortion,
                    globPortion: searchPath.substr((lastSlashMatch.index || 0) + 1)
                };
            }
        }
        // No glob char, or malformed
        return {
            pathPortion: searchPath
        };
    }
    function patternListToIExpression(...patterns) {
        return patterns.length ?
            patterns.reduce((glob, cur) => { glob[cur] = true; return glob; }, Object.create(null)) :
            undefined;
    }
    function splitGlobPattern(pattern) {
        return glob.splitGlobAware(pattern, ',')
            .map(s => s.trim())
            .filter(s => !!s.length);
    }
    /**
     * Note - we used {} here previously but ripgrep can't handle nested {} patterns. See https://github.com/microsoft/vscode/issues/32761
     */
    function expandGlobalGlob(pattern) {
        const patterns = [
            `**/${pattern}/**`,
            `**/${pattern}`
        ];
        return patterns.map(p => p.replace(/\*\*\/\*\*/g, '**'));
    }
    function normalizeSlashes(pattern) {
        return pattern.replace(/\\/g, '/');
    }
    /**
     * Normalize slashes, remove `./` and trailing slashes
     */
    function normalizeGlobPattern(pattern) {
        return normalizeSlashes(pattern)
            .replace(/^\.\//, '')
            .replace(/\/+$/g, '');
    }
    /**
     * Construct an include pattern from a list of folders uris to search in.
     */
    function resolveResourcesForSearchIncludes(resources, contextService) {
        resources = arrays.distinct(resources, resource => resource.toString());
        const folderPaths = [];
        const workspace = contextService.getWorkspace();
        if (resources) {
            resources.forEach(resource => {
                let folderPath;
                if (contextService.getWorkbenchState() === 2 /* FOLDER */) {
                    // Show relative path from the root for single-root mode
                    folderPath = (0, resources_1.relativePath)(workspace.folders[0].uri, resource); // always uses forward slashes
                    if (folderPath && folderPath !== '.') {
                        folderPath = './' + folderPath;
                    }
                }
                else {
                    const owningFolder = contextService.getWorkspaceFolder(resource);
                    if (owningFolder) {
                        const owningRootName = owningFolder.name;
                        // If this root is the only one with its basename, use a relative ./ path. If there is another, use an absolute path
                        const isUniqueFolder = workspace.folders.filter(folder => folder.name === owningRootName).length === 1;
                        if (isUniqueFolder) {
                            const relPath = (0, resources_1.relativePath)(owningFolder.uri, resource); // always uses forward slashes
                            if (relPath === '') {
                                folderPath = `./${owningFolder.name}`;
                            }
                            else {
                                folderPath = `./${owningFolder.name}/${relPath}`;
                            }
                        }
                        else {
                            folderPath = resource.fsPath; // TODO rob: handle non-file URIs
                        }
                    }
                }
                if (folderPath) {
                    folderPaths.push(folderPath);
                }
            });
        }
        return folderPaths;
    }
    exports.resolveResourcesForSearchIncludes = resolveResourcesForSearchIncludes;
});
//# sourceMappingURL=queryBuilder.js.map