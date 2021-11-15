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
define(["require", "exports", "vs/nls!vs/workbench/services/label/common/labelService", "vs/base/common/uri", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/event", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/environment/common/environment", "vs/platform/workspace/common/workspace", "vs/base/common/resources", "vs/base/common/labels", "vs/platform/workspaces/common/workspaces", "vs/platform/label/common/label", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/glob", "vs/platform/instantiation/common/extensions", "vs/workbench/services/path/common/pathService"], function (require, exports, nls_1, uri_1, lifecycle_1, paths, event_1, contributions_1, platform_1, environment_1, workspace_1, resources_1, labels_1, workspaces_1, label_1, extensionsRegistry_1, glob_1, extensions_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LabelService = void 0;
    const resourceLabelFormattersExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'resourceLabelFormatters',
        jsonSchema: {
            description: (0, nls_1.localize)(0, null),
            type: 'array',
            items: {
                type: 'object',
                required: ['scheme', 'formatting'],
                properties: {
                    scheme: {
                        type: 'string',
                        description: (0, nls_1.localize)(1, null),
                    },
                    authority: {
                        type: 'string',
                        description: (0, nls_1.localize)(2, null),
                    },
                    formatting: {
                        description: (0, nls_1.localize)(3, null),
                        type: 'object',
                        properties: {
                            label: {
                                type: 'string',
                                description: (0, nls_1.localize)(4, null)
                            },
                            separator: {
                                type: 'string',
                                description: (0, nls_1.localize)(5, null)
                            },
                            stripPathStartingSeparator: {
                                type: 'boolean',
                                description: (0, nls_1.localize)(6, null)
                            },
                            tildify: {
                                type: 'boolean',
                                description: (0, nls_1.localize)(7, null)
                            },
                            workspaceSuffix: {
                                type: 'string',
                                description: (0, nls_1.localize)(8, null)
                            }
                        }
                    }
                }
            }
        }
    });
    const sepRegexp = /\//g;
    const labelMatchingRegexp = /\$\{(scheme|authority|path|(query)\.(.+?))\}/g;
    function hasDriveLetterIgnorePlatform(path) {
        return !!(path && path[2] === ':');
    }
    let ResourceLabelFormattersHandler = class ResourceLabelFormattersHandler {
        constructor(labelService) {
            this.formattersDisposables = new Map();
            resourceLabelFormattersExtPoint.setHandler((extensions, delta) => {
                delta.added.forEach(added => added.value.forEach(formatter => {
                    this.formattersDisposables.set(formatter, labelService.registerFormatter(formatter));
                }));
                delta.removed.forEach(removed => removed.value.forEach(formatter => {
                    this.formattersDisposables.get(formatter).dispose();
                }));
            });
        }
    };
    ResourceLabelFormattersHandler = __decorate([
        __param(0, label_1.ILabelService)
    ], ResourceLabelFormattersHandler);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ResourceLabelFormattersHandler, 3 /* Restored */);
    let LabelService = class LabelService extends lifecycle_1.Disposable {
        constructor(environmentService, contextService, pathService) {
            super();
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.pathService = pathService;
            this.formatters = [];
            this._onDidChangeFormatters = this._register(new event_1.Emitter({ leakWarningThreshold: 400 }));
            this.onDidChangeFormatters = this._onDidChangeFormatters.event;
        }
        findFormatting(resource) {
            let bestResult;
            this.formatters.forEach(formatter => {
                if (formatter.scheme === resource.scheme) {
                    if (!formatter.authority && (!bestResult || formatter.priority)) {
                        bestResult = formatter;
                        return;
                    }
                    if (!formatter.authority) {
                        return;
                    }
                    if ((0, glob_1.match)(formatter.authority.toLowerCase(), resource.authority.toLowerCase()) && (!bestResult || !bestResult.authority || formatter.authority.length > bestResult.authority.length || ((formatter.authority.length === bestResult.authority.length) && formatter.priority))) {
                        bestResult = formatter;
                    }
                }
            });
            return bestResult ? bestResult.formatting : undefined;
        }
        getUriLabel(resource, options = {}) {
            return this.doGetUriLabel(resource, this.findFormatting(resource), options);
        }
        doGetUriLabel(resource, formatting, options = {}) {
            var _a, _b;
            if (!formatting) {
                return (0, labels_1.getPathLabel)(resource.path, { userHome: this.pathService.resolvedUserHome }, options.relative ? this.contextService : undefined);
            }
            let label;
            const baseResource = (_a = this.contextService) === null || _a === void 0 ? void 0 : _a.getWorkspaceFolder(resource);
            if (options.relative && baseResource) {
                const baseResourceLabel = this.formatUri(baseResource.uri, formatting, options.noPrefix);
                let relativeLabel = this.formatUri(resource, formatting, options.noPrefix);
                let overlap = 0;
                while (relativeLabel[overlap] && relativeLabel[overlap] === baseResourceLabel[overlap]) {
                    overlap++;
                }
                if (!relativeLabel[overlap] || relativeLabel[overlap] === formatting.separator) {
                    relativeLabel = relativeLabel.substring(1 + overlap);
                }
                else if (overlap === baseResourceLabel.length && baseResource.uri.path === '/') {
                    relativeLabel = relativeLabel.substring(overlap);
                }
                const hasMultipleRoots = this.contextService.getWorkspace().folders.length > 1;
                if (hasMultipleRoots && !options.noPrefix) {
                    const rootName = (_b = baseResource === null || baseResource === void 0 ? void 0 : baseResource.name) !== null && _b !== void 0 ? _b : (0, resources_1.basenameOrAuthority)(baseResource.uri);
                    relativeLabel = relativeLabel ? (rootName + ' • ' + relativeLabel) : rootName; // always show root basename if there are multiple
                }
                label = relativeLabel;
            }
            else {
                label = this.formatUri(resource, formatting, options.noPrefix);
            }
            return options.endWithSeparator ? this.appendSeparatorIfMissing(label, formatting) : label;
        }
        getUriBasenameLabel(resource) {
            const formatting = this.findFormatting(resource);
            const label = this.doGetUriLabel(resource, formatting);
            if (formatting) {
                switch (formatting.separator) {
                    case paths.win32.sep: return paths.win32.basename(label);
                    case paths.posix.sep: return paths.posix.basename(label);
                }
            }
            return paths.basename(label);
        }
        getWorkspaceLabel(workspace, options) {
            if ((0, workspace_1.isWorkspace)(workspace)) {
                const identifier = (0, workspaces_1.toWorkspaceIdentifier)(workspace);
                if (identifier) {
                    return this.getWorkspaceLabel(identifier, options);
                }
                return '';
            }
            // Workspace: Single Folder (as URI)
            if (uri_1.URI.isUri(workspace)) {
                return this.doGetSingleFolderWorkspaceLabel(workspace, options);
            }
            // Workspace: Single Folder (as workspace identifier)
            if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                return this.doGetSingleFolderWorkspaceLabel(workspace.uri, options);
            }
            // Workspace: Multi Root
            if ((0, workspaces_1.isWorkspaceIdentifier)(workspace)) {
                return this.doGetWorkspaceLabel(workspace.configPath, options);
            }
            return '';
        }
        doGetWorkspaceLabel(workspaceUri, options) {
            // Workspace: Untitled
            if ((0, workspaces_1.isUntitledWorkspace)(workspaceUri, this.environmentService)) {
                return (0, nls_1.localize)(9, null);
            }
            // Workspace: Saved
            let filename = (0, resources_1.basename)(workspaceUri);
            if (filename.endsWith(workspaces_1.WORKSPACE_EXTENSION)) {
                filename = filename.substr(0, filename.length - workspaces_1.WORKSPACE_EXTENSION.length - 1);
            }
            let label;
            if (options === null || options === void 0 ? void 0 : options.verbose) {
                label = (0, nls_1.localize)(10, null, this.getUriLabel((0, resources_1.joinPath)((0, resources_1.dirname)(workspaceUri), filename)));
            }
            else {
                label = (0, nls_1.localize)(11, null, filename);
            }
            return this.appendWorkspaceSuffix(label, workspaceUri);
        }
        doGetSingleFolderWorkspaceLabel(folderUri, options) {
            const label = (options === null || options === void 0 ? void 0 : options.verbose) ? this.getUriLabel(folderUri) : (0, resources_1.basename)(folderUri) || '/';
            return this.appendWorkspaceSuffix(label, folderUri);
        }
        getSeparator(scheme, authority) {
            const formatter = this.findFormatting(uri_1.URI.from({ scheme, authority }));
            return (formatter === null || formatter === void 0 ? void 0 : formatter.separator) || '/';
        }
        getHostLabel(scheme, authority) {
            const formatter = this.findFormatting(uri_1.URI.from({ scheme, authority }));
            return (formatter === null || formatter === void 0 ? void 0 : formatter.workspaceSuffix) || '';
        }
        registerFormatter(formatter) {
            this.formatters.push(formatter);
            this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
            return {
                dispose: () => {
                    this.formatters = this.formatters.filter(f => f !== formatter);
                    this._onDidChangeFormatters.fire({ scheme: formatter.scheme });
                }
            };
        }
        formatUri(resource, formatting, forceNoTildify) {
            let label = formatting.label.replace(labelMatchingRegexp, (match, token, qsToken, qsValue) => {
                switch (token) {
                    case 'scheme': return resource.scheme;
                    case 'authority': return resource.authority;
                    case 'path':
                        return formatting.stripPathStartingSeparator
                            ? resource.path.slice(resource.path[0] === formatting.separator ? 1 : 0)
                            : resource.path;
                    default: {
                        if (qsToken === 'query') {
                            const { query } = resource;
                            if (query && query[0] === '{' && query[query.length - 1] === '}') {
                                try {
                                    return JSON.parse(query)[qsValue] || '';
                                }
                                catch (_a) { }
                            }
                        }
                        return '';
                    }
                }
            });
            // convert \c:\something => C:\something
            if (formatting.normalizeDriveLetter && hasDriveLetterIgnorePlatform(label)) {
                label = label.charAt(1).toUpperCase() + label.substr(2);
            }
            if (formatting.tildify && !forceNoTildify) {
                const userHome = this.pathService.resolvedUserHome;
                if (userHome) {
                    label = (0, labels_1.tildify)(label, userHome.fsPath);
                }
            }
            if (formatting.authorityPrefix && resource.authority) {
                label = formatting.authorityPrefix + label;
            }
            return label.replace(sepRegexp, formatting.separator);
        }
        appendSeparatorIfMissing(label, formatting) {
            let appendedLabel = label;
            if (!label.endsWith(formatting.separator)) {
                appendedLabel += formatting.separator;
            }
            return appendedLabel;
        }
        appendWorkspaceSuffix(label, uri) {
            const formatting = this.findFormatting(uri);
            const suffix = formatting && (typeof formatting.workspaceSuffix === 'string') ? formatting.workspaceSuffix : undefined;
            return suffix ? `${label} [${suffix}]` : label;
        }
    };
    LabelService = __decorate([
        __param(0, environment_1.IEnvironmentService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, pathService_1.IPathService)
    ], LabelService);
    exports.LabelService = LabelService;
    (0, extensions_1.registerSingleton)(label_1.ILabelService, LabelService, true);
});
//# sourceMappingURL=labelService.js.map