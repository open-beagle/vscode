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
define(["require", "exports", "vs/nls!vs/workbench/services/dialogs/browser/abstractFileDialogService", "vs/platform/windows/common/windows", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/workbench/services/history/common/history", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/dialogs/browser/simpleFileDialog", "vs/platform/workspaces/common/workspaces", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/workbench/services/host/browser/host", "vs/base/common/severity", "vs/base/common/arrays", "vs/base/common/strings", "vs/editor/common/services/modeService", "vs/platform/label/common/label", "vs/workbench/services/path/common/pathService", "vs/base/common/network", "vs/editor/common/modes/modesRegistry"], function (require, exports, nls, windows_1, dialogs_1, workspace_1, history_1, environmentService_1, resources, instantiation_1, simpleFileDialog_1, workspaces_1, configuration_1, files_1, opener_1, host_1, severity_1, arrays_1, strings_1, modeService_1, label_1, pathService_1, network_1, modesRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractFileDialogService = void 0;
    let AbstractFileDialogService = class AbstractFileDialogService {
        constructor(hostService, contextService, historyService, environmentService, instantiationService, configurationService, fileService, openerService, dialogService, modeService, workspacesService, labelService, pathService) {
            this.hostService = hostService;
            this.contextService = contextService;
            this.historyService = historyService;
            this.environmentService = environmentService;
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.fileService = fileService;
            this.openerService = openerService;
            this.dialogService = dialogService;
            this.modeService = modeService;
            this.workspacesService = workspacesService;
            this.labelService = labelService;
            this.pathService = pathService;
        }
        async defaultFilePath(schemeFilter = this.getSchemeFilterForWindow()) {
            // Check for last active file first...
            let candidate = this.historyService.getLastActiveFile(schemeFilter);
            // ...then for last active file root
            if (!candidate) {
                candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter);
            }
            else {
                candidate = candidate && resources.dirname(candidate);
            }
            if (!candidate) {
                candidate = await this.pathService.userHome({ preferLocal: schemeFilter === network_1.Schemas.file });
            }
            return candidate;
        }
        async defaultFolderPath(schemeFilter = this.getSchemeFilterForWindow()) {
            // Check for last active file root first...
            let candidate = this.historyService.getLastActiveWorkspaceRoot(schemeFilter);
            // ...then for last active file
            if (!candidate) {
                candidate = this.historyService.getLastActiveFile(schemeFilter);
            }
            if (!candidate) {
                return this.pathService.userHome({ preferLocal: schemeFilter === network_1.Schemas.file });
            }
            else {
                return resources.dirname(candidate);
            }
        }
        async defaultWorkspacePath(schemeFilter = this.getSchemeFilterForWindow(), filename) {
            let defaultWorkspacePath;
            // Check for current workspace config file first...
            if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
                const configuration = this.contextService.getWorkspace().configuration;
                if (configuration && configuration.scheme === schemeFilter && !(0, workspaces_1.isUntitledWorkspace)(configuration, this.environmentService)) {
                    defaultWorkspacePath = resources.dirname(configuration) || undefined;
                }
            }
            // ...then fallback to default file path
            if (!defaultWorkspacePath) {
                defaultWorkspacePath = await this.defaultFilePath(schemeFilter);
            }
            if (defaultWorkspacePath && filename) {
                defaultWorkspacePath = resources.joinPath(defaultWorkspacePath, filename);
            }
            return defaultWorkspacePath;
        }
        async showSaveConfirm(fileNamesOrResources) {
            if (this.environmentService.isExtensionDevelopment && this.environmentService.extensionTestsLocationURI) {
                return 1 /* DONT_SAVE */; // no veto when we are in extension dev testing mode because we cannot assume we run interactive
            }
            return this.doShowSaveConfirm(fileNamesOrResources);
        }
        async doShowSaveConfirm(fileNamesOrResources) {
            if (fileNamesOrResources.length === 0) {
                return 1 /* DONT_SAVE */;
            }
            let message;
            let detail = nls.localize(0, null);
            if (fileNamesOrResources.length === 1) {
                message = nls.localize(1, null, typeof fileNamesOrResources[0] === 'string' ? fileNamesOrResources[0] : resources.basename(fileNamesOrResources[0]));
            }
            else {
                message = nls.localize(2, null, fileNamesOrResources.length);
                detail = (0, dialogs_1.getFileNamesMessage)(fileNamesOrResources) + '\n' + detail;
            }
            const buttons = [
                fileNamesOrResources.length > 1 ? nls.localize(3, null) : nls.localize(4, null),
                nls.localize(5, null),
                nls.localize(6, null)
            ];
            const { choice } = await this.dialogService.show(severity_1.default.Warning, message, buttons, {
                cancelId: 2,
                detail
            });
            switch (choice) {
                case 0: return 0 /* SAVE */;
                case 1: return 1 /* DONT_SAVE */;
                default: return 2 /* CANCEL */;
            }
        }
        async pickFileFolderAndOpenSimplified(schema, options, preferNewWindow) {
            const title = nls.localize(7, null);
            const availableFileSystems = this.addFileSchemaIfNeeded(schema);
            const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                const stat = await this.fileService.resolve(uri);
                const toOpen = stat.isDirectory ? { folderUri: uri } : { fileUri: uri };
                if (!(0, windows_1.isWorkspaceToOpen)(toOpen) && (0, windows_1.isFileToOpen)(toOpen)) {
                    // add the picked file into the list of recently opened
                    this.workspacesService.addRecentlyOpened([{ fileUri: toOpen.fileUri, label: this.labelService.getUriLabel(toOpen.fileUri) }]);
                }
                if (stat.isDirectory || options.forceNewWindow || preferNewWindow) {
                    return this.hostService.openWindow([toOpen], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
                }
                else {
                    return this.openerService.open(uri, { fromUserGesture: true, editorOptions: { pinned: true } });
                }
            }
        }
        async pickFileAndOpenSimplified(schema, options, preferNewWindow) {
            const title = nls.localize(8, null);
            const availableFileSystems = this.addFileSchemaIfNeeded(schema);
            const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                // add the picked file into the list of recently opened
                this.workspacesService.addRecentlyOpened([{ fileUri: uri, label: this.labelService.getUriLabel(uri) }]);
                if (options.forceNewWindow || preferNewWindow) {
                    return this.hostService.openWindow([{ fileUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
                }
                else {
                    return this.openerService.open(uri, { fromUserGesture: true, editorOptions: { pinned: true } });
                }
            }
        }
        async pickFolderAndOpenSimplified(schema, options) {
            const title = nls.localize(9, null);
            const availableFileSystems = this.addFileSchemaIfNeeded(schema);
            const uri = await this.pickResource({ canSelectFiles: false, canSelectFolders: true, canSelectMany: false, defaultUri: options.defaultUri, title, availableFileSystems });
            if (uri) {
                return this.hostService.openWindow([{ folderUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
        }
        async pickWorkspaceAndOpenSimplified(schema, options) {
            const title = nls.localize(10, null);
            const filters = [{ name: nls.localize(11, null), extensions: [workspaces_1.WORKSPACE_EXTENSION] }];
            const availableFileSystems = this.addFileSchemaIfNeeded(schema);
            const uri = await this.pickResource({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, defaultUri: options.defaultUri, title, filters, availableFileSystems });
            if (uri) {
                return this.hostService.openWindow([{ workspaceUri: uri }], { forceNewWindow: options.forceNewWindow, remoteAuthority: options.remoteAuthority });
            }
        }
        async pickFileToSaveSimplified(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
            }
            options.title = nls.localize(12, null);
            return this.saveRemoteResource(options);
        }
        async showSaveDialogSimplified(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
            }
            return this.saveRemoteResource(options);
        }
        async showOpenDialogSimplified(schema, options) {
            if (!options.availableFileSystems) {
                options.availableFileSystems = this.addFileSchemaIfNeeded(schema);
            }
            const uri = await this.pickResource(options);
            return uri ? [uri] : undefined;
        }
        pickResource(options) {
            const simpleFileDialog = this.instantiationService.createInstance(simpleFileDialog_1.SimpleFileDialog);
            return simpleFileDialog.showOpenDialog(options);
        }
        saveRemoteResource(options) {
            const remoteFileDialog = this.instantiationService.createInstance(simpleFileDialog_1.SimpleFileDialog);
            return remoteFileDialog.showSaveDialog(options);
        }
        getSchemeFilterForWindow(defaultUriScheme) {
            return defaultUriScheme !== null && defaultUriScheme !== void 0 ? defaultUriScheme : this.pathService.defaultUriScheme;
        }
        getFileSystemSchema(options) {
            var _a;
            return options.availableFileSystems && options.availableFileSystems[0] || this.getSchemeFilterForWindow((_a = options.defaultUri) === null || _a === void 0 ? void 0 : _a.scheme);
        }
        getPickFileToSaveDialogOptions(defaultUri, availableFileSystems) {
            const options = {
                defaultUri,
                title: nls.localize(13, null),
                availableFileSystems
            };
            // Build the file filter by using our known languages
            const ext = defaultUri ? resources.extname(defaultUri) : undefined;
            let matchingFilter;
            const registeredLanguageNames = this.modeService.getRegisteredLanguageNames().sort((a, b) => (0, strings_1.compareIgnoreCase)(a, b));
            const registeredLanguageFilters = (0, arrays_1.coalesce)(registeredLanguageNames.map(languageName => {
                const extensions = this.modeService.getExtensions(languageName);
                if (!extensions || !extensions.length) {
                    return null;
                }
                const filter = { name: languageName, extensions: (0, arrays_1.distinct)(extensions).slice(0, 10).map(e => (0, strings_1.trim)(e, '.')) };
                if (!matchingFilter && extensions.indexOf(ext || modesRegistry_1.PLAINTEXT_EXTENSION /* https://github.com/microsoft/vscode/issues/115860 */) >= 0) {
                    matchingFilter = filter;
                    return null; // first matching filter will be added to the top
                }
                return filter;
            }));
            // We have no matching filter, e.g. because the language
            // is unknown. We still add the extension to the list of
            // filters though so that it can be picked
            // (https://github.com/microsoft/vscode/issues/96283)
            if (!matchingFilter && ext) {
                matchingFilter = { name: (0, strings_1.trim)(ext, '.').toUpperCase(), extensions: [(0, strings_1.trim)(ext, '.')] };
            }
            // Order of filters is
            // - All Files (we MUST do this to fix macOS issue https://github.com/microsoft/vscode/issues/102713)
            // - File Extension Match (if any)
            // - All Languages
            // - No Extension
            options.filters = (0, arrays_1.coalesce)([
                { name: nls.localize(14, null), extensions: ['*'] },
                matchingFilter,
                ...registeredLanguageFilters,
                { name: nls.localize(15, null), extensions: [''] }
            ]);
            return options;
        }
    };
    AbstractFileDialogService = __decorate([
        __param(0, host_1.IHostService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, history_1.IHistoryService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, files_1.IFileService),
        __param(7, opener_1.IOpenerService),
        __param(8, dialogs_1.IDialogService),
        __param(9, modeService_1.IModeService),
        __param(10, workspaces_1.IWorkspacesService),
        __param(11, label_1.ILabelService),
        __param(12, pathService_1.IPathService)
    ], AbstractFileDialogService);
    exports.AbstractFileDialogService = AbstractFileDialogService;
});
//# sourceMappingURL=abstractFileDialogService.js.map