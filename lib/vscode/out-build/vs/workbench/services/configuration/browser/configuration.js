/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/files/common/files", "vs/platform/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configurationModels", "vs/workbench/services/configuration/common/configuration", "vs/base/common/path", "vs/base/common/objects", "vs/base/common/hash"], function (require, exports, event_1, errors, lifecycle_1, async_1, files_1, configurationModels_1, configurationModels_2, configuration_1, path_1, objects_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FolderConfiguration = exports.WorkspaceConfiguration = exports.RemoteUserConfiguration = exports.UserConfiguration = void 0;
    class UserConfiguration extends lifecycle_1.Disposable {
        constructor(userSettingsResource, scopes, fileService, uriIdentityService, logService) {
            super();
            this.userSettingsResource = userSettingsResource;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this.userConfiguration = this._register(new lifecycle_1.MutableDisposable());
            this.configurationParseOptions = { scopes, skipRestricted: false };
            this.userConfiguration.value = new configurationModels_1.UserSettings(this.userSettingsResource, scopes, uriIdentityService.extUri, this.fileService);
            this._register(this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule()));
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.reload().then(configurationModel => this._onDidChangeConfiguration.fire(configurationModel)), 50));
        }
        get hasTasksLoaded() { return this.userConfiguration.value instanceof FileServiceBasedConfiguration; }
        async initialize() {
            return this.userConfiguration.value.loadConfiguration();
        }
        async reload() {
            if (this.hasTasksLoaded) {
                return this.userConfiguration.value.loadConfiguration();
            }
            const folder = this.uriIdentityService.extUri.dirname(this.userSettingsResource);
            const standAloneConfigurationResources = [configuration_1.TASKS_CONFIGURATION_KEY].map(name => ([name, this.uriIdentityService.extUri.joinPath(folder, `${name}.json`)]));
            const fileServiceBasedConfiguration = new FileServiceBasedConfiguration(folder.toString(), this.userSettingsResource, standAloneConfigurationResources, this.configurationParseOptions, this.fileService, this.uriIdentityService, this.logService);
            const configurationModel = await fileServiceBasedConfiguration.loadConfiguration();
            this.userConfiguration.value = fileServiceBasedConfiguration;
            // Check for value because userConfiguration might have been disposed.
            if (this.userConfiguration.value) {
                this._register(this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule()));
            }
            return configurationModel;
        }
        reparse() {
            return this.userConfiguration.value.reparse(this.configurationParseOptions);
        }
        getRestrictedSettings() {
            return this.userConfiguration.value.getRestrictedSettings();
        }
    }
    exports.UserConfiguration = UserConfiguration;
    class FileServiceBasedConfiguration extends lifecycle_1.Disposable {
        constructor(name, settingsResource, standAloneConfigurationResources, configurationParseOptions, fileService, uriIdentityService, logService) {
            super();
            this.settingsResource = settingsResource;
            this.standAloneConfigurationResources = standAloneConfigurationResources;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this.logService = logService;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.allResources = [this.settingsResource, ...this.standAloneConfigurationResources.map(([, resource]) => resource)];
            this._register((0, lifecycle_1.combinedDisposable)(...this.allResources.map(resource => (0, lifecycle_1.combinedDisposable)(this.fileService.watch(uriIdentityService.extUri.dirname(resource)), 
            // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
            this.fileService.watch(resource)))));
            this._folderSettingsModelParser = new configurationModels_1.ConfigurationModelParser(name);
            this._folderSettingsParseOptions = configurationParseOptions;
            this._standAloneConfigurations = [];
            this._cache = new configurationModels_1.ConfigurationModel();
            this._register(event_1.Event.debounce(event_1.Event.filter(this.fileService.onDidFilesChange, e => this.handleFileEvents(e)), () => undefined, 100)(() => this._onDidChange.fire()));
        }
        async resolveContents() {
            const resolveContents = async (resources) => {
                return Promise.all(resources.map(async (resource) => {
                    try {
                        const content = (await this.fileService.readFile(resource, { atomic: true })).value.toString();
                        if (!content) {
                            this.logService.debug(`Configuration file '${resource.toString()}' is empty`);
                        }
                        return content;
                    }
                    catch (error) {
                        this.logService.trace(`Error while resolving configuration file '${resource.toString()}': ${errors.getErrorMessage(error)}`);
                        if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */
                            && error.fileOperationResult !== 10 /* FILE_NOT_DIRECTORY */) {
                            errors.onUnexpectedError(error);
                        }
                    }
                    return '{}';
                }));
            };
            const [[settingsContent], standAloneConfigurationContents] = await Promise.all([
                resolveContents([this.settingsResource]),
                resolveContents(this.standAloneConfigurationResources.map(([, resource]) => resource)),
            ]);
            return [settingsContent, standAloneConfigurationContents.map((content, index) => ([this.standAloneConfigurationResources[index][0], content]))];
        }
        async loadConfiguration() {
            const [settingsContent, standAloneConfigurationContents] = await this.resolveContents();
            // reset
            this._standAloneConfigurations = [];
            this._folderSettingsModelParser.parse('', this._folderSettingsParseOptions);
            // parse
            if (settingsContent !== undefined) {
                this._folderSettingsModelParser.parse(settingsContent, this._folderSettingsParseOptions);
            }
            for (let index = 0; index < standAloneConfigurationContents.length; index++) {
                const contents = standAloneConfigurationContents[index][1];
                if (contents !== undefined) {
                    const standAloneConfigurationModelParser = new configurationModels_2.StandaloneConfigurationModelParser(this.standAloneConfigurationResources[index][1].toString(), this.standAloneConfigurationResources[index][0]);
                    standAloneConfigurationModelParser.parse(contents);
                    this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
                }
            }
            // Consolidate (support *.json files in the workspace settings folder)
            this.consolidate();
            return this._cache;
        }
        getRestrictedSettings() {
            return this._folderSettingsModelParser.restrictedConfigurations;
        }
        reparse(configurationParseOptions) {
            const oldContents = this._folderSettingsModelParser.configurationModel.contents;
            this._folderSettingsParseOptions = configurationParseOptions;
            this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
            if (!(0, objects_1.equals)(oldContents, this._folderSettingsModelParser.configurationModel.contents)) {
                this.consolidate();
            }
            return this._cache;
        }
        consolidate() {
            this._cache = this._folderSettingsModelParser.configurationModel.merge(...this._standAloneConfigurations);
        }
        handleFileEvents(event) {
            // One of the resources has changed
            if (this.allResources.some(resource => event.contains(resource))) {
                return true;
            }
            // One of the resource's parent got deleted
            if (this.allResources.some(resource => event.contains(this.uriIdentityService.extUri.dirname(resource), 2 /* DELETED */))) {
                return true;
            }
            return false;
        }
    }
    class RemoteUserConfiguration extends lifecycle_1.Disposable {
        constructor(remoteAuthority, configurationCache, fileService, uriIdentityService, remoteAgentService) {
            super();
            this._userConfigurationInitializationPromise = null;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this._onDidInitialize = this._register(new event_1.Emitter());
            this.onDidInitialize = this._onDidInitialize.event;
            this._fileService = fileService;
            this._userConfiguration = this._cachedConfiguration = new CachedRemoteUserConfiguration(remoteAuthority, configurationCache, { scopes: configuration_1.REMOTE_MACHINE_SCOPES });
            remoteAgentService.getEnvironment().then(async (environment) => {
                if (environment) {
                    const userConfiguration = this._register(new FileServiceBasedRemoteUserConfiguration(environment.settingsPath, { scopes: configuration_1.REMOTE_MACHINE_SCOPES }, this._fileService, uriIdentityService));
                    this._register(userConfiguration.onDidChangeConfiguration(configurationModel => this.onDidUserConfigurationChange(configurationModel)));
                    this._userConfigurationInitializationPromise = userConfiguration.initialize();
                    const configurationModel = await this._userConfigurationInitializationPromise;
                    this._userConfiguration.dispose();
                    this._userConfiguration = userConfiguration;
                    this.onDidUserConfigurationChange(configurationModel);
                    this._onDidInitialize.fire(configurationModel);
                }
            });
        }
        async initialize() {
            if (this._userConfiguration instanceof FileServiceBasedRemoteUserConfiguration) {
                return this._userConfiguration.initialize();
            }
            // Initialize cached configuration
            let configurationModel = await this._userConfiguration.initialize();
            if (this._userConfigurationInitializationPromise) {
                // Use user configuration
                configurationModel = await this._userConfigurationInitializationPromise;
                this._userConfigurationInitializationPromise = null;
            }
            return configurationModel;
        }
        reload() {
            return this._userConfiguration.reload();
        }
        reparse() {
            return this._userConfiguration.reparse({ scopes: configuration_1.REMOTE_MACHINE_SCOPES });
        }
        getRestrictedSettings() {
            return this._userConfiguration.getRestrictedSettings();
        }
        onDidUserConfigurationChange(configurationModel) {
            this.updateCache();
            this._onDidChangeConfiguration.fire(configurationModel);
        }
        async updateCache() {
            if (this._userConfiguration instanceof FileServiceBasedRemoteUserConfiguration) {
                let content;
                try {
                    content = await this._userConfiguration.resolveContent();
                }
                catch (error) {
                    if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
                        return;
                    }
                }
                await this._cachedConfiguration.updateConfiguration(content);
            }
        }
    }
    exports.RemoteUserConfiguration = RemoteUserConfiguration;
    class FileServiceBasedRemoteUserConfiguration extends lifecycle_1.Disposable {
        constructor(configurationResource, configurationParseOptions, fileService, uriIdentityService) {
            super();
            this.configurationResource = configurationResource;
            this.fileService = fileService;
            this.uriIdentityService = uriIdentityService;
            this._onDidChangeConfiguration = this._register(new event_1.Emitter());
            this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
            this.fileWatcherDisposable = lifecycle_1.Disposable.None;
            this.directoryWatcherDisposable = lifecycle_1.Disposable.None;
            this.parser = new configurationModels_1.ConfigurationModelParser(this.configurationResource.toString());
            this.parseOptions = configurationParseOptions;
            this._register(fileService.onDidFilesChange(e => this.handleFileEvents(e)));
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this.reload().then(configurationModel => this._onDidChangeConfiguration.fire(configurationModel)), 50));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this.stopWatchingResource();
                this.stopWatchingDirectory();
            }));
        }
        watchResource() {
            this.fileWatcherDisposable = this.fileService.watch(this.configurationResource);
        }
        stopWatchingResource() {
            this.fileWatcherDisposable.dispose();
            this.fileWatcherDisposable = lifecycle_1.Disposable.None;
        }
        watchDirectory() {
            const directory = this.uriIdentityService.extUri.dirname(this.configurationResource);
            this.directoryWatcherDisposable = this.fileService.watch(directory);
        }
        stopWatchingDirectory() {
            this.directoryWatcherDisposable.dispose();
            this.directoryWatcherDisposable = lifecycle_1.Disposable.None;
        }
        async initialize() {
            const exists = await this.fileService.exists(this.configurationResource);
            this.onResourceExists(exists);
            return this.reload();
        }
        async resolveContent() {
            const content = await this.fileService.readFile(this.configurationResource);
            return content.value.toString();
        }
        async reload() {
            try {
                const content = await this.resolveContent();
                this.parser.parse(content, this.parseOptions);
                return this.parser.configurationModel;
            }
            catch (e) {
                return new configurationModels_1.ConfigurationModel();
            }
        }
        reparse(configurationParseOptions) {
            this.parseOptions = configurationParseOptions;
            this.parser.reparse(this.parseOptions);
            return this.parser.configurationModel;
        }
        getRestrictedSettings() {
            return this.parser.restrictedConfigurations;
        }
        async handleFileEvents(event) {
            // Find changes that affect the resource
            let affectedByChanges = event.contains(this.configurationResource, 0 /* UPDATED */);
            if (event.contains(this.configurationResource, 1 /* ADDED */)) {
                affectedByChanges = true;
                this.onResourceExists(true);
            }
            else if (event.contains(this.configurationResource, 2 /* DELETED */)) {
                affectedByChanges = true;
                this.onResourceExists(false);
            }
            if (affectedByChanges) {
                this.reloadConfigurationScheduler.schedule();
            }
        }
        onResourceExists(exists) {
            if (exists) {
                this.stopWatchingDirectory();
                this.watchResource();
            }
            else {
                this.stopWatchingResource();
                this.watchDirectory();
            }
        }
    }
    class CachedRemoteUserConfiguration extends lifecycle_1.Disposable {
        constructor(remoteAuthority, configurationCache, configurationParseOptions) {
            super();
            this.configurationCache = configurationCache;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.key = { type: 'user', key: remoteAuthority };
            this.parser = new configurationModels_1.ConfigurationModelParser('CachedRemoteUserConfiguration');
            this.parseOptions = configurationParseOptions;
            this.configurationModel = new configurationModels_1.ConfigurationModel();
        }
        getConfigurationModel() {
            return this.configurationModel;
        }
        initialize() {
            return this.reload();
        }
        reparse(configurationParseOptions) {
            this.parseOptions = configurationParseOptions;
            this.parser.reparse(this.parseOptions);
            this.configurationModel = this.parser.configurationModel;
            return this.configurationModel;
        }
        getRestrictedSettings() {
            return this.parser.restrictedConfigurations;
        }
        async reload() {
            try {
                const content = await this.configurationCache.read(this.key);
                const parsed = JSON.parse(content);
                if (parsed.content) {
                    this.parser.parse(parsed.content, this.parseOptions);
                    this.configurationModel = this.parser.configurationModel;
                }
            }
            catch (e) { /* Ignore error */ }
            return this.configurationModel;
        }
        async updateConfiguration(content) {
            if (content) {
                return this.configurationCache.write(this.key, JSON.stringify({ content }));
            }
            else {
                return this.configurationCache.remove(this.key);
            }
        }
    }
    class WorkspaceConfiguration extends lifecycle_1.Disposable {
        constructor(configurationCache, fileService) {
            super();
            this.configurationCache = configurationCache;
            this._workspaceConfigurationDisposables = this._register(new lifecycle_1.DisposableStore());
            this._workspaceIdentifier = null;
            this._isWorkspaceTrusted = false;
            this._onDidUpdateConfiguration = this._register(new event_1.Emitter());
            this.onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
            this._initialized = false;
            this._fileService = fileService;
            this._workspaceConfiguration = this._cachedConfiguration = new CachedWorkspaceConfiguration(configurationCache);
        }
        get initialized() { return this._initialized; }
        async initialize(workspaceIdentifier, workspaceTrusted) {
            this._workspaceIdentifier = workspaceIdentifier;
            this._isWorkspaceTrusted = workspaceTrusted;
            if (!this._initialized) {
                if (this.configurationCache.needsCaching(this._workspaceIdentifier.configPath)) {
                    this._workspaceConfiguration = this._cachedConfiguration;
                    this.waitAndInitialize(this._workspaceIdentifier);
                }
                else {
                    this.doInitialize(new FileServiceBasedWorkspaceConfiguration(this._fileService));
                }
            }
            await this.reload();
        }
        async reload() {
            if (this._workspaceIdentifier) {
                await this._workspaceConfiguration.load(this._workspaceIdentifier, { scopes: configuration_1.WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
            }
        }
        getFolders() {
            return this._workspaceConfiguration.getFolders();
        }
        setFolders(folders, jsonEditingService) {
            if (this._workspaceIdentifier) {
                return jsonEditingService.write(this._workspaceIdentifier.configPath, [{ path: ['folders'], value: folders }], true)
                    .then(() => this.reload());
            }
            return Promise.resolve();
        }
        getConfiguration() {
            return this._workspaceConfiguration.getWorkspaceSettings();
        }
        updateWorkspaceTrust(trusted) {
            this._isWorkspaceTrusted = trusted;
            return this.reparseWorkspaceSettings();
        }
        reparseWorkspaceSettings() {
            this._workspaceConfiguration.reparseWorkspaceSettings({ scopes: configuration_1.WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
            return this.getConfiguration();
        }
        getRestrictedSettings() {
            return this._workspaceConfiguration.getRestrictedSettings();
        }
        async waitAndInitialize(workspaceIdentifier) {
            await (0, files_1.whenProviderRegistered)(workspaceIdentifier.configPath, this._fileService);
            if (!(this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration)) {
                const fileServiceBasedWorkspaceConfiguration = this._register(new FileServiceBasedWorkspaceConfiguration(this._fileService));
                await fileServiceBasedWorkspaceConfiguration.load(workspaceIdentifier, { scopes: configuration_1.WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
                this.doInitialize(fileServiceBasedWorkspaceConfiguration);
                this.onDidWorkspaceConfigurationChange(false, true);
            }
        }
        doInitialize(fileServiceBasedWorkspaceConfiguration) {
            this._workspaceConfigurationDisposables.clear();
            this._workspaceConfiguration = this._workspaceConfigurationDisposables.add(fileServiceBasedWorkspaceConfiguration);
            this._workspaceConfigurationDisposables.add(this._workspaceConfiguration.onDidChange(e => this.onDidWorkspaceConfigurationChange(true, false)));
            this._initialized = true;
        }
        isUntrusted() {
            return !this._isWorkspaceTrusted;
        }
        async onDidWorkspaceConfigurationChange(reload, fromCache) {
            if (reload) {
                await this.reload();
            }
            this.updateCache();
            this._onDidUpdateConfiguration.fire(fromCache);
        }
        async updateCache() {
            if (this._workspaceIdentifier && this.configurationCache.needsCaching(this._workspaceIdentifier.configPath) && this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration) {
                const content = await this._workspaceConfiguration.resolveContent(this._workspaceIdentifier);
                await this._cachedConfiguration.updateWorkspace(this._workspaceIdentifier, content);
            }
        }
    }
    exports.WorkspaceConfiguration = WorkspaceConfiguration;
    class FileServiceBasedWorkspaceConfiguration extends lifecycle_1.Disposable {
        constructor(fileService) {
            super();
            this.fileService = fileService;
            this._workspaceIdentifier = null;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser('');
            this.workspaceSettings = new configurationModels_1.ConfigurationModel();
            this._register(fileService.onDidFilesChange(e => this.handleWorkspaceFileEvents(e)));
            this.reloadConfigurationScheduler = this._register(new async_1.RunOnceScheduler(() => this._onDidChange.fire(), 50));
            this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
        }
        get workspaceIdentifier() {
            return this._workspaceIdentifier;
        }
        async resolveContent(workspaceIdentifier) {
            const content = await this.fileService.readFile(workspaceIdentifier.configPath);
            return content.value.toString();
        }
        async load(workspaceIdentifier, configurationParseOptions) {
            if (!this._workspaceIdentifier || this._workspaceIdentifier.id !== workspaceIdentifier.id) {
                this._workspaceIdentifier = workspaceIdentifier;
                this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser(this._workspaceIdentifier.id);
                (0, lifecycle_1.dispose)(this.workspaceConfigWatcher);
                this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
            }
            let contents = '';
            try {
                contents = await this.resolveContent(this._workspaceIdentifier);
            }
            catch (error) {
                const exists = await this.fileService.exists(this._workspaceIdentifier.configPath);
                if (exists) {
                    errors.onUnexpectedError(error);
                }
            }
            this.workspaceConfigurationModelParser.parse(contents, configurationParseOptions);
            this.consolidate();
        }
        getConfigurationModel() {
            return this.workspaceConfigurationModelParser.configurationModel;
        }
        getFolders() {
            return this.workspaceConfigurationModelParser.folders;
        }
        getWorkspaceSettings() {
            return this.workspaceSettings;
        }
        reparseWorkspaceSettings(configurationParseOptions) {
            this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
            this.consolidate();
            return this.getWorkspaceSettings();
        }
        getRestrictedSettings() {
            return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
        }
        consolidate() {
            this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
        }
        watchWorkspaceConfigurationFile() {
            return this._workspaceIdentifier ? this.fileService.watch(this._workspaceIdentifier.configPath) : lifecycle_1.Disposable.None;
        }
        handleWorkspaceFileEvents(event) {
            if (this._workspaceIdentifier) {
                // Find changes that affect workspace file
                if (event.contains(this._workspaceIdentifier.configPath)) {
                    this.reloadConfigurationScheduler.schedule();
                }
            }
        }
    }
    class CachedWorkspaceConfiguration {
        constructor(configurationCache) {
            this.configurationCache = configurationCache;
            this.onDidChange = event_1.Event.None;
            this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser('');
            this.workspaceSettings = new configurationModels_1.ConfigurationModel();
        }
        async load(workspaceIdentifier, configurationParseOptions) {
            try {
                const key = this.getKey(workspaceIdentifier);
                const contents = await this.configurationCache.read(key);
                const parsed = JSON.parse(contents);
                if (parsed.content) {
                    this.workspaceConfigurationModelParser = new configurationModels_2.WorkspaceConfigurationModelParser(key.key);
                    this.workspaceConfigurationModelParser.parse(parsed.content, configurationParseOptions);
                    this.consolidate();
                }
            }
            catch (e) {
            }
        }
        get workspaceIdentifier() {
            return null;
        }
        getConfigurationModel() {
            return this.workspaceConfigurationModelParser.configurationModel;
        }
        getFolders() {
            return this.workspaceConfigurationModelParser.folders;
        }
        getWorkspaceSettings() {
            return this.workspaceSettings;
        }
        reparseWorkspaceSettings(configurationParseOptions) {
            this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
            this.consolidate();
            return this.getWorkspaceSettings();
        }
        getRestrictedSettings() {
            return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
        }
        consolidate() {
            this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
        }
        async updateWorkspace(workspaceIdentifier, content) {
            try {
                const key = this.getKey(workspaceIdentifier);
                if (content) {
                    await this.configurationCache.write(key, JSON.stringify({ content }));
                }
                else {
                    await this.configurationCache.remove(key);
                }
            }
            catch (error) {
            }
        }
        getKey(workspaceIdentifier) {
            return {
                type: 'workspaces',
                key: workspaceIdentifier.id
            };
        }
    }
    class CachedFolderConfiguration {
        constructor(folder, configFolderRelativePath, configurationParseOptions, configurationCache) {
            this.configurationCache = configurationCache;
            this.onDidChange = event_1.Event.None;
            this.key = { type: 'folder', key: (0, hash_1.hash)((0, path_1.join)(folder.path, configFolderRelativePath)).toString(16) };
            this._folderSettingsModelParser = new configurationModels_1.ConfigurationModelParser('CachedFolderConfiguration');
            this._folderSettingsParseOptions = configurationParseOptions;
            this._standAloneConfigurations = [];
            this.configurationModel = new configurationModels_1.ConfigurationModel();
        }
        async loadConfiguration() {
            try {
                const contents = await this.configurationCache.read(this.key);
                const { content: configurationContents } = JSON.parse(contents.toString());
                if (configurationContents) {
                    for (const key of Object.keys(configurationContents)) {
                        if (key === configuration_1.FOLDER_SETTINGS_NAME) {
                            this._folderSettingsModelParser.parse(configurationContents[key], this._folderSettingsParseOptions);
                        }
                        else {
                            const standAloneConfigurationModelParser = new configurationModels_2.StandaloneConfigurationModelParser(key, key);
                            standAloneConfigurationModelParser.parse(configurationContents[key]);
                            this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
                        }
                    }
                }
                this.consolidate();
            }
            catch (e) {
            }
            return this.configurationModel;
        }
        async updateConfiguration(settingsContent, standAloneConfigurationContents) {
            const content = {};
            if (settingsContent) {
                content[configuration_1.FOLDER_SETTINGS_NAME] = settingsContent;
            }
            standAloneConfigurationContents.forEach(([key, contents]) => {
                if (contents) {
                    content[key] = contents;
                }
            });
            if (Object.keys(content).length) {
                await this.configurationCache.write(this.key, JSON.stringify({ content }));
            }
            else {
                await this.configurationCache.remove(this.key);
            }
        }
        getRestrictedSettings() {
            return this._folderSettingsModelParser.restrictedConfigurations;
        }
        reparse(configurationParseOptions) {
            this._folderSettingsParseOptions = configurationParseOptions;
            this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
            this.consolidate();
            return this.configurationModel;
        }
        consolidate() {
            this.configurationModel = this._folderSettingsModelParser.configurationModel.merge(...this._standAloneConfigurations);
        }
        getUnsupportedKeys() {
            return [];
        }
    }
    class FolderConfiguration extends lifecycle_1.Disposable {
        constructor(workspaceFolder, configFolderRelativePath, workbenchState, workspaceTrusted, fileService, uriIdentityService, logService, configurationCache) {
            super();
            this.workspaceFolder = workspaceFolder;
            this.workbenchState = workbenchState;
            this.workspaceTrusted = workspaceTrusted;
            this.configurationCache = configurationCache;
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this.scopes = 3 /* WORKSPACE */ === this.workbenchState ? configuration_1.FOLDER_SCOPES : configuration_1.WORKSPACE_SCOPES;
            this.configurationFolder = uriIdentityService.extUri.joinPath(workspaceFolder.uri, configFolderRelativePath);
            this.cachedFolderConfiguration = new CachedFolderConfiguration(workspaceFolder.uri, configFolderRelativePath, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, configurationCache);
            if (this.configurationCache.needsCaching(workspaceFolder.uri)) {
                this.folderConfiguration = this.cachedFolderConfiguration;
                (0, files_1.whenProviderRegistered)(workspaceFolder.uri, fileService)
                    .then(() => {
                    this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
                    this._register(this.folderConfiguration.onDidChange(e => this.onDidFolderConfigurationChange()));
                    this.onDidFolderConfigurationChange();
                });
            }
            else {
                this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
                this._register(this.folderConfiguration.onDidChange(e => this.onDidFolderConfigurationChange()));
            }
        }
        loadConfiguration() {
            return this.folderConfiguration.loadConfiguration();
        }
        updateWorkspaceTrust(trusted) {
            this.workspaceTrusted = trusted;
            return this.reparse();
        }
        reparse() {
            const configurationModel = this.folderConfiguration.reparse({ scopes: this.scopes, skipRestricted: this.isUntrusted() });
            this.updateCache();
            return configurationModel;
        }
        getRestrictedSettings() {
            return this.folderConfiguration.getRestrictedSettings();
        }
        isUntrusted() {
            return !this.workspaceTrusted;
        }
        onDidFolderConfigurationChange() {
            this.updateCache();
            this._onDidChange.fire();
        }
        createFileServiceBasedConfiguration(fileService, uriIdentityService, logService) {
            const settingsResource = uriIdentityService.extUri.joinPath(this.configurationFolder, `${configuration_1.FOLDER_SETTINGS_NAME}.json`);
            const standAloneConfigurationResources = [configuration_1.TASKS_CONFIGURATION_KEY, configuration_1.LAUNCH_CONFIGURATION_KEY].map(name => ([name, uriIdentityService.extUri.joinPath(this.configurationFolder, `${name}.json`)]));
            return new FileServiceBasedConfiguration(this.configurationFolder.toString(), settingsResource, standAloneConfigurationResources, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, fileService, uriIdentityService, logService);
        }
        async updateCache() {
            if (this.configurationCache.needsCaching(this.configurationFolder) && this.folderConfiguration instanceof FileServiceBasedConfiguration) {
                const [settingsContent, standAloneConfigurationContents] = await this.folderConfiguration.resolveContents();
                this.cachedFolderConfiguration.updateConfiguration(settingsContent, standAloneConfigurationContents);
            }
        }
    }
    exports.FolderConfiguration = FolderConfiguration;
});
//# sourceMappingURL=configuration.js.map