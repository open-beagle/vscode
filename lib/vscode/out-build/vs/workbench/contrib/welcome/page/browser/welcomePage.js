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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/workbench/contrib/welcome/walkThrough/browser/walkThroughInput", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "vs/base/common/errors", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/nls!vs/workbench/contrib/welcome/page/browser/welcomePage", "vs/base/common/actions", "vs/platform/telemetry/common/telemetry", "vs/base/common/network", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/contrib/extensions/common/extensionsUtils", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/lifecycle", "vs/base/common/labels", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/welcome/walkThrough/common/walkThroughUtils", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/notification/common/notification", "vs/base/common/async", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/label/common/label", "vs/platform/files/common/files", "vs/base/common/resources", "vs/platform/workspaces/common/workspaces", "vs/base/common/cancellation", "vs/workbench/services/host/browser/host", "vs/platform/product/common/productService", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/viewlet/browser/viewlet", "vs/workbench/contrib/welcome/gettingStarted/browser/gettingStartedInput", "vs/workbench/contrib/welcome/page/browser/welcomePageColors", "vs/workbench/services/experiment/common/experimentService", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/configuration", "vs/platform/log/common/log", "vs/css!./welcomePage", "vs/workbench/contrib/welcome/page/browser/vs_code_welcome_page"], function (require, exports, commands_1, arrays, walkThroughInput_1, instantiation_1, editorService_1, errors_1, workspace_1, configuration_1, nls_1, actions_1, telemetry_1, network_1, workingCopyBackup_1, extensionsUtils_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, lifecycle_1, lifecycle_2, labels_1, themeService_1, colorRegistry_1, walkThroughUtils_1, extensions_1, notification_1, async_1, extensionManagementUtil_1, label_1, files_1, resources_1, workspaces_1, cancellation_1, host_1, productService_1, layoutService_1, viewlet_1, gettingStartedInput_1, welcomePageColors_1, experimentService_1, platform_1, configurationRegistry_1, configuration_2, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WelcomeInputSerializer = exports.WelcomePageAction = exports.WelcomePageContribution = exports.EXPERIMENTAL_GETTING_STARTED_STARTUP_EDITOR_CONFIG = exports.DEFAULT_STARTUP_EDITOR_CONFIG = void 0;
    exports.DEFAULT_STARTUP_EDITOR_CONFIG = Object.assign(Object.assign({}, configuration_2.workbenchConfigurationNodeBase), { 'properties': {
            'workbench.startupEditor': {
                'scope': 4 /* RESOURCE */,
                'type': 'string',
                'enum': ['none', 'welcomePage', 'readme', 'newUntitledFile', 'welcomePageInEmptyWorkbench', 'gettingStarted'],
                'enumDescriptions': [...[
                        (0, nls_1.localize)(0, null),
                        (0, nls_1.localize)(1, null),
                        (0, nls_1.localize)(2, null),
                        (0, nls_1.localize)(3, null),
                        (0, nls_1.localize)(4, null),
                        (0, nls_1.localize)(5, null)
                    ]
                ],
                'default': 'welcomePage',
                'description': (0, nls_1.localize)(6, null)
            },
        } });
    exports.EXPERIMENTAL_GETTING_STARTED_STARTUP_EDITOR_CONFIG = Object.assign(Object.assign({}, configuration_2.workbenchConfigurationNodeBase), { 'properties': {
            'workbench.startupEditor': {
                'scope': 4 /* RESOURCE */,
                'type': 'string',
                'enum': ['none', 'welcomePage', 'readme', 'newUntitledFile', 'welcomePageInEmptyWorkbench', 'gettingStarted'],
                'enumDescriptions': [...[
                        (0, nls_1.localize)(7, null),
                        (0, nls_1.localize)(8, null),
                        (0, nls_1.localize)(9, null),
                        (0, nls_1.localize)(10, null),
                        (0, nls_1.localize)(11, null),
                        (0, nls_1.localize)(12, null)
                    ]
                ],
                'default': 'gettingStarted',
                'description': (0, nls_1.localize)(13, null)
            },
        } });
    const configurationKey = 'workbench.startupEditor';
    const oldConfigurationKey = 'workbench.welcome.enabled';
    const telemetryFrom = 'welcomePage';
    let WelcomePageContribution = class WelcomePageContribution {
        constructor(instantiationService, configurationService, editorService, workingCopyBackupService, fileService, contextService, lifecycleService, layoutService, commandService, telemetryService, logService, tasExperimentService) {
            this.instantiationService = instantiationService;
            this.configurationService = configurationService;
            this.editorService = editorService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.fileService = fileService;
            this.contextService = contextService;
            this.lifecycleService = lifecycleService;
            this.layoutService = layoutService;
            this.commandService = commandService;
            this.telemetryService = telemetryService;
            this.logService = logService;
            this.tasExperimentService = tasExperimentService;
            // Run immediately to minimize time spent waiting for exp service.
            this.experimentManagementComplete = this.manageDefaultValuesForGettingStartedExperiment().catch(errors_1.onUnexpectedError);
            this.run().then(undefined, errors_1.onUnexpectedError);
        }
        async manageDefaultValuesForGettingStartedExperiment() {
            var _a;
            const config = this.configurationService.inspect(configurationKey);
            if (this.lifecycleService.startupKind === 3 /* ReloadedWindow */ || config.value !== config.defaultValue) {
                return;
            }
            if (this.configurationService.getValue('workbench.gettingStartedTreatmentOverride')) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).deregisterConfigurations([exports.DEFAULT_STARTUP_EDITOR_CONFIG]);
                platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration(exports.EXPERIMENTAL_GETTING_STARTED_STARTUP_EDITOR_CONFIG);
            }
            let someValueReturned = false;
            const tasUseGettingStartedAsDefault = (_a = this.tasExperimentService) === null || _a === void 0 ? void 0 : _a.getTreatment('StartupGettingStarted').then(result => {
                this.logService.trace('StartupGettingStarted:', result);
                this.telemetryService.publicLog2('gettingStartedTreatmentValue', { value: '' + !!result });
                someValueReturned = true;
                return result;
            }).catch(error => {
                this.logService.error('Recieved error when consulting experiment service for getting started experiment', error);
                this.telemetryService.publicLog2('gettingStartedTreatmentValue', { value: 'err' });
                someValueReturned = true;
                return false;
            });
            const fallback = new Promise(c => setTimeout(() => c(false), 2000)).then(() => {
                if (!someValueReturned) {
                    this.logService.trace('Unable to read getting started treatment data in time, falling back to welcome');
                }
                someValueReturned = true;
            });
            const useGettingStartedAsDefault = !!await Promise.race([tasUseGettingStartedAsDefault, fallback]);
            if (useGettingStartedAsDefault) {
                platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).deregisterConfigurations([exports.DEFAULT_STARTUP_EDITOR_CONFIG]);
                platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration(exports.EXPERIMENTAL_GETTING_STARTED_STARTUP_EDITOR_CONFIG);
            }
        }
        async run() {
            const enabled = isWelcomePageEnabled(this.configurationService, this.contextService);
            if (enabled && this.lifecycleService.startupKind !== 3 /* ReloadedWindow */) {
                const hasBackups = await this.workingCopyBackupService.hasBackups();
                if (hasBackups) {
                    return;
                }
                // Open the welcome even if we opened a set of default editors
                if (!this.editorService.activeEditor || this.layoutService.openedDefaultEditors) {
                    const startupEditorSetting = this.configurationService.inspect(configurationKey);
                    // 'readme' should not be set in workspace settings to prevent tracking,
                    // but it can be set as a default (as in codespaces) or a user setting
                    const openWithReadme = startupEditorSetting.value === 'readme' &&
                        (startupEditorSetting.userValue === 'readme' || startupEditorSetting.defaultValue === 'readme');
                    if (openWithReadme) {
                        await this.openReadme();
                    }
                    else {
                        await this.openWelcome();
                    }
                }
            }
        }
        async openReadme() {
            const readmes = arrays.coalesce(await Promise.all(this.contextService.getWorkspace().folders.map(async (folder) => {
                const folderUri = folder.uri;
                const folderStat = await this.fileService.resolve(folderUri).catch(errors_1.onUnexpectedError);
                const files = (folderStat === null || folderStat === void 0 ? void 0 : folderStat.children) ? folderStat.children.map(child => child.name).sort() : [];
                const file = files.find(file => file.toLowerCase() === 'readme.md') || files.find(file => file.toLowerCase().startsWith('readme'));
                if (file) {
                    return (0, resources_1.joinPath)(folderUri, file);
                }
                else {
                    return undefined;
                }
            })));
            if (!this.editorService.activeEditor) {
                if (readmes.length) {
                    const isMarkDown = (readme) => readme.path.toLowerCase().endsWith('.md');
                    await Promise.all([
                        this.commandService.executeCommand('markdown.showPreview', null, readmes.filter(isMarkDown), { locked: true }),
                        this.editorService.openEditors(readmes.filter(readme => !isMarkDown(readme)).map(readme => ({ resource: readme }))),
                    ]);
                }
                else {
                    await this.openWelcome();
                }
            }
        }
        async openWelcome() {
            await this.experimentManagementComplete;
            const startupEditorSetting = this.configurationService.getValue(configurationKey);
            const startupEditorTypeID = startupEditorSetting === 'gettingStarted' ? gettingStartedInput_1.gettingStartedInputTypeId : welcomeInputTypeId;
            const editor = this.editorService.activeEditor;
            // Ensure that the welcome editor won't get opened more than once
            if ((editor === null || editor === void 0 ? void 0 : editor.typeId) === startupEditorTypeID || this.editorService.editors.some(e => e.typeId === startupEditorTypeID)) {
                return;
            }
            const options = editor ? { pinned: false, index: 0 } : { pinned: false };
            if (startupEditorTypeID === gettingStartedInput_1.gettingStartedInputTypeId) {
                this.editorService.openEditor(this.instantiationService.createInstance(gettingStartedInput_1.GettingStartedInput, {}), options);
            }
            else {
                this.instantiationService.createInstance(WelcomePage).openEditor(options);
            }
        }
    };
    WelcomePageContribution = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, editorService_1.IEditorService),
        __param(3, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(4, files_1.IFileService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, lifecycle_1.ILifecycleService),
        __param(7, layoutService_1.IWorkbenchLayoutService),
        __param(8, commands_1.ICommandService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, log_1.ILogService),
        __param(11, (0, instantiation_1.optional)(experimentService_1.ITASExperimentService))
    ], WelcomePageContribution);
    exports.WelcomePageContribution = WelcomePageContribution;
    function isWelcomePageEnabled(configurationService, contextService) {
        const startupEditor = configurationService.inspect(configurationKey);
        if (!startupEditor.userValue && !startupEditor.workspaceValue) {
            const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
            if (welcomeEnabled.value !== undefined && welcomeEnabled.value !== null) {
                return welcomeEnabled.value;
            }
        }
        if (startupEditor.value === 'readme' && startupEditor.userValue !== 'readme') {
            console.error('Warning: `workbench.startupEditor: readme` setting ignored due to being set somewhere other than user settings');
        }
        return startupEditor.value === 'welcomePage' || startupEditor.value === 'gettingStarted' || startupEditor.userValue === 'readme' || startupEditor.value === 'welcomePageInEmptyWorkbench' && contextService.getWorkbenchState() === 1 /* EMPTY */;
    }
    let WelcomePageAction = class WelcomePageAction extends actions_1.Action {
        constructor(id, label, instantiationService) {
            super(id, label);
            this.instantiationService = instantiationService;
        }
        run() {
            return this.instantiationService.createInstance(WelcomePage)
                .openEditor()
                .then(() => undefined);
        }
    };
    WelcomePageAction.ID = 'workbench.action.showWelcomePage';
    WelcomePageAction.LABEL = (0, nls_1.localize)(14, null);
    WelcomePageAction = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], WelcomePageAction);
    exports.WelcomePageAction = WelcomePageAction;
    const extensionPacks = [
        { name: (0, nls_1.localize)(15, null), id: 'dbaeumer.vscode-eslint' },
        { name: (0, nls_1.localize)(16, null), id: 'ms-python.python' },
        { name: (0, nls_1.localize)(17, null), id: 'vscjava.vscode-java-pack' },
        { name: (0, nls_1.localize)(18, null), id: 'felixfbecker.php-pack' },
        { name: (0, nls_1.localize)(19, null), title: (0, nls_1.localize)(20, null), id: 'workbench.extensions.action.showAzureExtensions', isCommand: true },
        { name: (0, nls_1.localize)(21, null), id: 'ms-azuretools.vscode-docker' },
    ];
    const keymapExtensions = [
        { name: (0, nls_1.localize)(22, null), id: 'vscodevim.vim', isKeymap: true },
        { name: (0, nls_1.localize)(23, null), id: 'ms-vscode.sublime-keybindings', isKeymap: true },
        { name: (0, nls_1.localize)(24, null), id: 'ms-vscode.atom-keybindings', isKeymap: true },
    ];
    /* __GDPR__
        "installExtension" : {
            "${include}": [
                "${WelcomePageInstall-1}"
            ]
        }
    */
    /* __GDPR__
        "installedExtension" : {
            "${include}": [
                "${WelcomePageInstalled-1}",
                "${WelcomePageInstalled-2}",
                "${WelcomePageInstalled-3}",
                "${WelcomePageInstalled-4}",
                "${WelcomePageInstalled-6}"
            ]
        }
    */
    /* __GDPR__
        "detailsExtension" : {
            "${include}": [
                "${WelcomePageDetails-1}"
            ]
        }
    */
    const extensionPackStrings = {
        installEvent: 'installExtension',
        installedEvent: 'installedExtension',
        detailsEvent: 'detailsExtension',
        alreadyInstalled: (0, nls_1.localize)(25, null),
        reloadAfterInstall: (0, nls_1.localize)(26, null),
        installing: (0, nls_1.localize)(27, null),
        extensionNotFound: (0, nls_1.localize)(28, null),
    };
    commands_1.CommandsRegistry.registerCommand('workbench.extensions.action.showAzureExtensions', accessor => {
        const viewletService = accessor.get(viewlet_1.IViewletService);
        return viewletService.openViewlet(extensions_1.VIEWLET_ID, true)
            .then(viewlet => viewlet === null || viewlet === void 0 ? void 0 : viewlet.getViewPaneContainer())
            .then(viewlet => {
            viewlet.search('@sort:installs azure ');
            viewlet.focus();
        });
    });
    /* __GDPR__
        "installKeymap" : {
            "${include}": [
                "${WelcomePageInstall-1}"
            ]
        }
    */
    /* __GDPR__
        "installedKeymap" : {
            "${include}": [
                "${WelcomePageInstalled-1}",
                "${WelcomePageInstalled-2}",
                "${WelcomePageInstalled-3}",
                "${WelcomePageInstalled-4}",
                "${WelcomePageInstalled-6}"
            ]
        }
    */
    /* __GDPR__
        "detailsKeymap" : {
            "${include}": [
                "${WelcomePageDetails-1}"
            ]
        }
    */
    const keymapStrings = {
        installEvent: 'installKeymap',
        installedEvent: 'installedKeymap',
        detailsEvent: 'detailsKeymap',
        alreadyInstalled: (0, nls_1.localize)(29, null),
        reloadAfterInstall: (0, nls_1.localize)(30, null),
        installing: (0, nls_1.localize)(31, null),
        extensionNotFound: (0, nls_1.localize)(32, null),
    };
    const welcomeInputTypeId = 'workbench.editors.welcomePageInput';
    let WelcomePage = class WelcomePage extends lifecycle_2.Disposable {
        constructor(editorService, instantiationService, workspacesService, contextService, configurationService, labelService, notificationService, extensionEnablementService, extensionGalleryService, extensionManagementService, tipsService, extensionsWorkbenchService, lifecycleService, telemetryService, hostService, productService) {
            super();
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.workspacesService = workspacesService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.labelService = labelService;
            this.notificationService = notificationService;
            this.extensionEnablementService = extensionEnablementService;
            this.extensionGalleryService = extensionGalleryService;
            this.extensionManagementService = extensionManagementService;
            this.tipsService = tipsService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.telemetryService = telemetryService;
            this.hostService = hostService;
            this.productService = productService;
            this._register(lifecycleService.onDidShutdown(() => this.dispose()));
            const recentlyOpened = this.workspacesService.getRecentlyOpened();
            const installedExtensions = this.instantiationService.invokeFunction(extensionsUtils_1.getInstalledExtensions);
            const resource = network_1.FileAccess.asBrowserUri('./vs_code_welcome_page', require)
                .with({
                scheme: network_1.Schemas.walkThrough,
                query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcome/page/browser/vs_code_welcome_page' })
            });
            this.editorInput = this.instantiationService.createInstance(walkThroughInput_1.WalkThroughInput, {
                typeId: welcomeInputTypeId,
                name: (0, nls_1.localize)(33, null),
                resource,
                telemetryFrom,
                onReady: (container) => this.onReady(container, recentlyOpened, installedExtensions)
            });
        }
        openEditor(options = { pinned: false }) {
            return this.editorService.openEditor(this.editorInput, options);
        }
        onReady(container, recentlyOpened, installedExtensions) {
            const enabled = this.configurationService.getValue(configurationKey) === 'welcomePage';
            const showOnStartup = container.querySelector('#showOnStartup');
            if (enabled) {
                showOnStartup.setAttribute('checked', 'checked');
            }
            showOnStartup.addEventListener('click', e => {
                this.configurationService.updateValue(configurationKey, showOnStartup.checked ? 'welcomePage' : 'newUntitledFile');
            });
            const prodName = container.querySelector('.welcomePage .title .caption');
            if (prodName) {
                prodName.textContent = `Beagle-CloudIDE v${this.productService.codeServerVersion}`;
            }
            recentlyOpened.then(({ workspaces }) => {
                // Filter out the current workspace
                workspaces = workspaces.filter(recent => !this.contextService.isCurrentWorkspace((0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace : recent.folderUri));
                if (!workspaces.length) {
                    const recent = container.querySelector('.welcomePage');
                    recent.classList.add('emptyRecent');
                    return;
                }
                const ul = container.querySelector('.recent ul');
                if (!ul) {
                    return;
                }
                const moreRecent = ul.querySelector('.moreRecent');
                const workspacesToShow = workspaces.slice(0, 5);
                const updateEntries = () => {
                    const listEntries = this.createListEntries(workspacesToShow);
                    while (ul.firstChild) {
                        ul.removeChild(ul.firstChild);
                    }
                    ul.append(...listEntries, moreRecent);
                };
                updateEntries();
                this._register(this.labelService.onDidChangeFormatters(updateEntries));
            }).then(undefined, errors_1.onUnexpectedError);
            this.addExtensionList(container, '.extensionPackList', extensionPacks, extensionPackStrings);
            this.addExtensionList(container, '.keymapList', keymapExtensions, keymapStrings);
            this.updateInstalledExtensions(container, installedExtensions);
            this._register(this.instantiationService.invokeFunction(extensionsUtils_1.onExtensionChanged)(ids => {
                for (const id of ids) {
                    if (container.querySelector(`.installExtension[data-extension="${id.id}"], .enabledExtension[data-extension="${id.id}"]`)) {
                        const installedExtensions = this.instantiationService.invokeFunction(extensionsUtils_1.getInstalledExtensions);
                        this.updateInstalledExtensions(container, installedExtensions);
                        break;
                    }
                }
            }));
        }
        createListEntries(recents) {
            return recents.map(recent => {
                let fullPath;
                let windowOpenable;
                if ((0, workspaces_1.isRecentFolder)(recent)) {
                    windowOpenable = { folderUri: recent.folderUri };
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.folderUri, { verbose: true });
                }
                else {
                    fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, { verbose: true });
                    windowOpenable = { workspaceUri: recent.workspace.configPath };
                }
                const { name, parentPath } = (0, labels_1.splitName)(fullPath);
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.innerText = name;
                a.title = fullPath;
                a.setAttribute('aria-label', (0, nls_1.localize)(34, null, name, parentPath));
                a.href = 'javascript:void(0)';
                a.addEventListener('click', e => {
                    this.telemetryService.publicLog2('workbenchActionExecuted', {
                        id: 'openRecentFolder',
                        from: telemetryFrom
                    });
                    this.hostService.openWindow([windowOpenable], { forceNewWindow: e.ctrlKey || e.metaKey, remoteAuthority: recent.remoteAuthority });
                    e.preventDefault();
                    e.stopPropagation();
                });
                li.appendChild(a);
                const span = document.createElement('span');
                span.classList.add('path');
                span.classList.add('detail');
                span.innerText = parentPath;
                span.title = fullPath;
                li.appendChild(span);
                return li;
            });
        }
        addExtensionList(container, listSelector, suggestions, strings) {
            const list = container.querySelector(listSelector);
            if (list) {
                suggestions.forEach((extension, i) => {
                    if (i) {
                        list.appendChild(document.createTextNode((0, nls_1.localize)(35, null)));
                    }
                    const a = document.createElement('a');
                    a.innerText = extension.name;
                    a.title = extension.title || (extension.isKeymap ? (0, nls_1.localize)(36, null, extension.name) : (0, nls_1.localize)(37, null, extension.name));
                    if (extension.isCommand) {
                        a.href = `command:${extension.id}`;
                        list.appendChild(a);
                    }
                    else {
                        a.classList.add('installExtension');
                        a.setAttribute('data-extension', extension.id);
                        a.href = 'javascript:void(0)';
                        a.addEventListener('click', e => {
                            this.installExtension(extension, strings);
                            e.preventDefault();
                            e.stopPropagation();
                        });
                        list.appendChild(a);
                        const span = document.createElement('span');
                        span.innerText = extension.name;
                        span.title = extension.isKeymap ? (0, nls_1.localize)(38, null, extension.name) : (0, nls_1.localize)(39, null, extension.name);
                        span.classList.add('enabledExtension');
                        span.setAttribute('data-extension', extension.id);
                        list.appendChild(span);
                    }
                });
            }
        }
        installExtension(extensionSuggestion, strings) {
            /* __GDPR__FRAGMENT__
                "WelcomePageInstall-1" : {
                    "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "extensionId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog(strings.installEvent, {
                from: telemetryFrom,
                extensionId: extensionSuggestion.id,
            });
            this.instantiationService.invokeFunction(extensionsUtils_1.getInstalledExtensions).then(extensions => {
                const installedExtension = extensions.find(extension => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, { id: extensionSuggestion.id }));
                if (installedExtension && installedExtension.globallyEnabled) {
                    /* __GDPR__FRAGMENT__
                        "WelcomePageInstalled-1" : {
                            "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "extensionId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                            "outcome": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                        }
                    */
                    this.telemetryService.publicLog(strings.installedEvent, {
                        from: telemetryFrom,
                        extensionId: extensionSuggestion.id,
                        outcome: 'already_enabled',
                    });
                    this.notificationService.info(strings.alreadyInstalled.replace('{0}', extensionSuggestion.name));
                    return;
                }
                const foundAndInstalled = installedExtension ? Promise.resolve(installedExtension.local) : this.extensionGalleryService.query({ names: [extensionSuggestion.id], source: telemetryFrom }, cancellation_1.CancellationToken.None)
                    .then((result) => {
                    const [extension] = result.firstPage;
                    if (!extension) {
                        return null;
                    }
                    return this.extensionManagementService.installFromGallery(extension)
                        .then(() => this.extensionManagementService.getInstalled())
                        .then(installed => {
                        const local = installed.filter(i => (0, extensionManagementUtil_1.areSameExtensions)(extension.identifier, i.identifier))[0];
                        // TODO: Do this as part of the install to avoid multiple events.
                        return this.extensionEnablementService.setEnablement([local], 4 /* DisabledGlobally */).then(() => local);
                    });
                });
                this.notificationService.prompt(notification_1.Severity.Info, strings.reloadAfterInstall.replace('{0}', extensionSuggestion.name), [{
                        label: (0, nls_1.localize)(40, null),
                        run: () => {
                            const messageDelay = new async_1.TimeoutTimer();
                            messageDelay.cancelAndSet(() => {
                                this.notificationService.info(strings.installing.replace('{0}', extensionSuggestion.name));
                            }, 300);
                            const extensionsToDisable = extensions.filter(extension => (0, extensionsUtils_1.isKeymapExtension)(this.tipsService, extension) && extension.globallyEnabled).map(extension => extension.local);
                            extensionsToDisable.length ? this.extensionEnablementService.setEnablement(extensionsToDisable, 4 /* DisabledGlobally */) : Promise.resolve()
                                .then(() => {
                                return foundAndInstalled.then(foundExtension => {
                                    messageDelay.cancel();
                                    if (foundExtension) {
                                        return this.extensionEnablementService.setEnablement([foundExtension], 6 /* EnabledGlobally */)
                                            .then(() => {
                                            /* __GDPR__FRAGMENT__
                                                "WelcomePageInstalled-2" : {
                                                    "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                                    "extensionId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                                    "outcome": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                                }
                                            */
                                            this.telemetryService.publicLog(strings.installedEvent, {
                                                from: telemetryFrom,
                                                extensionId: extensionSuggestion.id,
                                                outcome: installedExtension ? 'enabled' : 'installed',
                                            });
                                            return this.hostService.reload();
                                        });
                                    }
                                    else {
                                        /* __GDPR__FRAGMENT__
                                            "WelcomePageInstalled-3" : {
                                                "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                                "extensionId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                                "outcome": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                            }
                                        */
                                        this.telemetryService.publicLog(strings.installedEvent, {
                                            from: telemetryFrom,
                                            extensionId: extensionSuggestion.id,
                                            outcome: 'not_found',
                                        });
                                        this.notificationService.error(strings.extensionNotFound.replace('{0}', extensionSuggestion.name).replace('{1}', extensionSuggestion.id));
                                        return undefined;
                                    }
                                });
                            }).then(undefined, err => {
                                /* __GDPR__FRAGMENT__
                                    "WelcomePageInstalled-4" : {
                                        "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                        "extensionId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                        "outcome": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                    }
                                */
                                this.telemetryService.publicLog(strings.installedEvent, {
                                    from: telemetryFrom,
                                    extensionId: extensionSuggestion.id,
                                    outcome: (0, errors_1.isPromiseCanceledError)(err) ? 'canceled' : 'error',
                                });
                                this.notificationService.error(err);
                            });
                        }
                    }, {
                        label: (0, nls_1.localize)(41, null),
                        run: () => {
                            /* __GDPR__FRAGMENT__
                                "WelcomePageDetails-1" : {
                                    "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                                    "extensionId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                                }
                            */
                            this.telemetryService.publicLog(strings.detailsEvent, {
                                from: telemetryFrom,
                                extensionId: extensionSuggestion.id,
                            });
                            this.extensionsWorkbenchService.queryGallery({ names: [extensionSuggestion.id] }, cancellation_1.CancellationToken.None)
                                .then(result => this.extensionsWorkbenchService.open(result.firstPage[0]))
                                .then(undefined, errors_1.onUnexpectedError);
                        }
                    }]);
            }).then(undefined, err => {
                /* __GDPR__FRAGMENT__
                    "WelcomePageInstalled-6" : {
                        "from" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "extensionId": { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                        "outcome": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                    }
                */
                this.telemetryService.publicLog(strings.installedEvent, {
                    from: telemetryFrom,
                    extensionId: extensionSuggestion.id,
                    outcome: (0, errors_1.isPromiseCanceledError)(err) ? 'canceled' : 'error',
                });
                this.notificationService.error(err);
            });
        }
        updateInstalledExtensions(container, installedExtensions) {
            installedExtensions.then(extensions => {
                const elements = container.querySelectorAll('.installExtension, .enabledExtension');
                for (let i = 0; i < elements.length; i++) {
                    elements[i].classList.remove('installed');
                }
                extensions.filter(ext => ext.globallyEnabled)
                    .map(ext => ext.identifier.id)
                    .forEach(id => {
                    const install = container.querySelectorAll(`.installExtension[data-extension="${id}"]`);
                    for (let i = 0; i < install.length; i++) {
                        install[i].classList.add('installed');
                    }
                    const enabled = container.querySelectorAll(`.enabledExtension[data-extension="${id}"]`);
                    for (let i = 0; i < enabled.length; i++) {
                        enabled[i].classList.add('installed');
                    }
                });
            }).then(undefined, errors_1.onUnexpectedError);
        }
    };
    WelcomePage = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, workspaces_1.IWorkspacesService),
        __param(3, workspace_1.IWorkspaceContextService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, label_1.ILabelService),
        __param(6, notification_1.INotificationService),
        __param(7, extensionManagement_2.IWorkbenchExtensionEnablementService),
        __param(8, extensionManagement_1.IExtensionGalleryService),
        __param(9, extensionManagement_1.IExtensionManagementService),
        __param(10, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(11, extensions_1.IExtensionsWorkbenchService),
        __param(12, lifecycle_1.ILifecycleService),
        __param(13, telemetry_1.ITelemetryService),
        __param(14, host_1.IHostService),
        __param(15, productService_1.IProductService)
    ], WelcomePage);
    class WelcomeInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '{}';
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.createInstance(WelcomePage)
                .editorInput;
        }
    }
    exports.WelcomeInputSerializer = WelcomeInputSerializer;
    WelcomeInputSerializer.ID = welcomeInputTypeId;
    // theming
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const backgroundColor = theme.getColor(welcomePageColors_1.welcomePageBackground);
        if (backgroundColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePageContainer { background-color: ${backgroundColor}; }`);
        }
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        if (foregroundColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage .caption { color: ${foregroundColor}; }`);
        }
        const descriptionColor = theme.getColor(colorRegistry_1.descriptionForeground);
        if (descriptionColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage .detail { color: ${descriptionColor}; }`);
        }
        const buttonColor = (0, walkThroughUtils_1.getExtraColor)(theme, welcomePageColors_1.welcomeButtonBackground, { dark: 'rgba(0, 0, 0, .2)', extra_dark: 'rgba(200, 235, 255, .042)', light: 'rgba(0,0,0,.04)', hc: 'black' });
        if (buttonColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage .commands .item button { background: ${buttonColor}; }`);
        }
        const buttonHoverColor = (0, walkThroughUtils_1.getExtraColor)(theme, welcomePageColors_1.welcomeButtonHoverBackground, { dark: 'rgba(200, 235, 255, .072)', extra_dark: 'rgba(200, 235, 255, .072)', light: 'rgba(0,0,0,.10)', hc: null });
        if (buttonHoverColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage .commands .item button:hover { background: ${buttonHoverColor}; }`);
        }
        const link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage a { color: ${link}; }`);
        }
        const activeLink = theme.getColor(colorRegistry_1.textLinkActiveForeground);
        if (activeLink) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage a:hover,
			.monaco-workbench .part.editor > .content .welcomePage a:active { color: ${activeLink}; }`);
        }
        const focusColor = theme.getColor(colorRegistry_1.focusBorder);
        if (focusColor) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage a:focus { outline-color: ${focusColor}; }`);
        }
        const border = theme.getColor(colorRegistry_1.contrastBorder);
        if (border) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage .commands .item button { border-color: ${border}; }`);
        }
        const activeBorder = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (activeBorder) {
            collector.addRule(`.monaco-workbench .part.editor > .content .welcomePage .commands .item button:hover { outline-color: ${activeBorder}; }`);
        }
    });
});
//# sourceMappingURL=welcomePage.js.map