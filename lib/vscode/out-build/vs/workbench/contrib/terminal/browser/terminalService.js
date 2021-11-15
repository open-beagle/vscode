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
define(["require", "exports", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/path", "vs/base/common/platform", "vs/editor/contrib/find/findState", "vs/nls!vs/workbench/contrib/terminal/browser/terminalService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/instantiation", "vs/platform/quickinput/common/quickInput", "vs/platform/telemetry/common/telemetry", "vs/platform/terminal/common/terminal", "vs/platform/theme/common/themeService", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalConfigHelper", "vs/workbench/contrib/terminal/browser/terminalInstance", "vs/workbench/contrib/terminal/browser/terminalTab", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/base/common/objects", "vs/base/common/codicons", "vs/workbench/contrib/terminal/common/terminalExtensionPoints", "vs/platform/commands/common/commands", "vs/platform/label/common/label", "vs/base/common/network", "vs/workbench/browser/contextkeys", "vs/workbench/contrib/terminal/common/terminalStrings"], function (require, exports, async_1, decorators_1, event_1, path_1, platform_1, findState_1, nls, configuration_1, contextkey_1, dialogs_1, instantiation_1, quickInput_1, telemetry_1, terminal_1, themeService_1, views_1, terminal_2, terminalConfigHelper_1, terminalInstance_1, terminalTab_1, terminal_3, terminalEnvironment_1, environmentService_1, extensions_1, layoutService_1, lifecycle_1, remoteAgentService_1, terminalIcons_1, objects_1, codicons_1, terminalExtensionPoints_1, commands_1, label_1, network_1, contextkeys_1, terminalStrings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalService = void 0;
    let TerminalService = class TerminalService {
        constructor(_contextKeyService, _layoutService, labelService, lifecycleService, _dialogService, _instantiationService, _remoteAgentService, _quickInputService, _configurationService, _viewsService, _viewDescriptorService, _environmentService, _remoteTerminalService, _telemetryService, _extensionService, _terminalContributionService, _commandService, localTerminalService) {
            this._contextKeyService = _contextKeyService;
            this._layoutService = _layoutService;
            this._dialogService = _dialogService;
            this._instantiationService = _instantiationService;
            this._remoteAgentService = _remoteAgentService;
            this._quickInputService = _quickInputService;
            this._configurationService = _configurationService;
            this._viewsService = _viewsService;
            this._viewDescriptorService = _viewDescriptorService;
            this._environmentService = _environmentService;
            this._remoteTerminalService = _remoteTerminalService;
            this._telemetryService = _telemetryService;
            this._extensionService = _extensionService;
            this._terminalContributionService = _terminalContributionService;
            this._commandService = _commandService;
            this._terminalTabs = [];
            this._backgroundedTerminalInstances = [];
            this._extHostsReady = {};
            this._linkProviders = new Set();
            this._linkProviderDisposables = new Map();
            this._onActiveTabChanged = new event_1.Emitter();
            this._onInstanceCreated = new event_1.Emitter();
            this._onInstanceDisposed = new event_1.Emitter();
            this._onInstanceProcessIdReady = new event_1.Emitter();
            this._onInstanceLinksReady = new event_1.Emitter();
            this._onInstanceRequestStartExtensionTerminal = new event_1.Emitter();
            this._onInstanceDimensionsChanged = new event_1.Emitter();
            this._onInstanceMaximumDimensionsChanged = new event_1.Emitter();
            this._onInstancesChanged = new event_1.Emitter();
            this._onInstanceTitleChanged = new event_1.Emitter();
            this._onActiveInstanceChanged = new event_1.Emitter();
            this._onInstancePrimaryStatusChanged = new event_1.Emitter();
            this._onTabDisposed = new event_1.Emitter();
            this._onRequestAvailableProfiles = new event_1.Emitter();
            this._onDidRegisterProcessSupport = new event_1.Emitter();
            this._onDidChangeConnectionState = new event_1.Emitter();
            this._onDidChangeAvailableProfiles = new event_1.Emitter();
            this._onPanelMovedToSide = new event_1.Emitter();
            this._localTerminalService = localTerminalService;
            this._activeTabIndex = 0;
            this._isShuttingDown = false;
            this._findState = new findState_1.FindReplaceState();
            lifecycleService.onBeforeShutdown(async (e) => e.veto(this._onBeforeShutdown(e.reason), 'veto.terminal'));
            lifecycleService.onWillShutdown(e => this._onWillShutdown(e));
            this._terminalFocusContextKey = terminal_3.KEYBINDING_CONTEXT_TERMINAL_FOCUS.bindTo(this._contextKeyService);
            this._terminalCountContextKey = terminal_3.KEYBINDING_CONTEXT_TERMINAL_COUNT.bindTo(this._contextKeyService);
            this._terminalShellTypeContextKey = terminal_3.KEYBINDING_CONTEXT_TERMINAL_SHELL_TYPE.bindTo(this._contextKeyService);
            this._terminalAltBufferActiveContextKey = terminal_3.KEYBINDING_CONTEXT_TERMINAL_ALT_BUFFER_ACTIVE.bindTo(this._contextKeyService);
            this._configHelper = this._instantiationService.createInstance(terminalConfigHelper_1.TerminalConfigHelper);
            this.onTabDisposed(tab => this._removeTab(tab));
            this.onActiveTabChanged(() => {
                const instance = this.getActiveInstance();
                this._onActiveInstanceChanged.fire(instance ? instance : undefined);
            });
            // update detected profiles so for example we detect if you've installed a pwsh
            // this avoids having poll routinely
            this.onInstanceCreated(() => this._refreshAvailableProfiles());
            this.onInstancesChanged(() => this._terminalCountContextKey.set(this._terminalInstances.length));
            this.onInstanceLinksReady(instance => this._setInstanceLinkProviders(instance));
            this._handleInstanceContextKeys();
            this._processSupportContextKey = terminal_3.KEYBINDING_CONTEXT_TERMINAL_PROCESS_SUPPORTED.bindTo(this._contextKeyService);
            this._processSupportContextKey.set(!platform_1.isWeb || this._remoteAgentService.getConnection() !== null);
            this._configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration('terminal.integrated.profiles.windows') ||
                    e.affectsConfiguration('terminal.integrated.profiles.osx') ||
                    e.affectsConfiguration('terminal.integrated.profiles.linux') ||
                    e.affectsConfiguration('terminal.integrated.defaultProfile.windows') ||
                    e.affectsConfiguration('terminal.integrated.defaultProfile.osx') ||
                    e.affectsConfiguration('terminal.integrated.defaultProfile.linux') ||
                    e.affectsConfiguration('terminal.integrated.useWslProfiles')) {
                    this._refreshAvailableProfiles();
                }
            });
            // Register a resource formatter for terminal URIs
            labelService.registerFormatter({
                scheme: network_1.Schemas.vscodeTerminal,
                formatting: {
                    label: '${path}',
                    separator: ''
                }
            });
            const enableTerminalReconnection = this.configHelper.config.enablePersistentSessions;
            const conn = this._remoteAgentService.getConnection();
            const remoteAuthority = conn ? conn.remoteAuthority : 'null';
            this._whenExtHostReady(remoteAuthority).then(() => {
                this._refreshAvailableProfiles();
            });
            // Connect to the extension host if it's there, set the connection state to connected when
            // it's done. This should happen even when there is no extension host.
            this._connectionState = 0 /* Connecting */;
            let initPromise;
            if (!!this._environmentService.remoteAuthority && enableTerminalReconnection) {
                initPromise = this._remoteTerminalsInitPromise = this._reconnectToRemoteTerminals();
            }
            else if (enableTerminalReconnection) {
                initPromise = this._localTerminalsInitPromise = this._reconnectToLocalTerminals();
            }
            else {
                initPromise = Promise.resolve();
            }
            initPromise.then(() => this._setConnected());
        }
        get _terminalInstances() {
            return this._terminalTabs.reduce((p, c) => p.concat(c.terminalInstances), []);
        }
        get activeTabIndex() { return this._activeTabIndex; }
        get terminalInstances() { return this._terminalInstances; }
        get terminalTabs() { return this._terminalTabs; }
        get isProcessSupportRegistered() { return !!this._processSupportContextKey.get(); }
        get connectionState() { return this._connectionState; }
        get availableProfiles() {
            this._refreshAvailableProfiles();
            return this._availableProfiles || [];
        }
        get configHelper() { return this._configHelper; }
        get onActiveTabChanged() { return this._onActiveTabChanged.event; }
        get onInstanceCreated() { return this._onInstanceCreated.event; }
        get onInstanceDisposed() { return this._onInstanceDisposed.event; }
        get onInstanceProcessIdReady() { return this._onInstanceProcessIdReady.event; }
        get onInstanceLinksReady() { return this._onInstanceLinksReady.event; }
        get onInstanceRequestStartExtensionTerminal() { return this._onInstanceRequestStartExtensionTerminal.event; }
        get onInstanceDimensionsChanged() { return this._onInstanceDimensionsChanged.event; }
        get onInstanceMaximumDimensionsChanged() { return this._onInstanceMaximumDimensionsChanged.event; }
        get onInstancesChanged() { return this._onInstancesChanged.event; }
        get onInstanceTitleChanged() { return this._onInstanceTitleChanged.event; }
        get onActiveInstanceChanged() { return this._onActiveInstanceChanged.event; }
        get onInstancePrimaryStatusChanged() { return this._onInstancePrimaryStatusChanged.event; }
        get onTabDisposed() { return this._onTabDisposed.event; }
        get onRequestAvailableProfiles() { return this._onRequestAvailableProfiles.event; }
        get onDidRegisterProcessSupport() { return this._onDidRegisterProcessSupport.event; }
        get onDidChangeConnectionState() { return this._onDidChangeConnectionState.event; }
        get onDidChangeAvailableProfiles() { return this._onDidChangeAvailableProfiles.event; }
        get onPanelMovedToSide() { return this._onPanelMovedToSide.event; }
        _setConnected() {
            this._connectionState = 1 /* Connected */;
            this._onDidChangeConnectionState.fire();
        }
        async _reconnectToRemoteTerminals() {
            // Reattach to all remote terminals
            const layoutInfo = await this._remoteTerminalService.getTerminalLayoutInfo();
            this._remoteTerminalService.reduceConnectionGraceTime();
            const reconnectCounter = this._recreateTerminalTabs(layoutInfo);
            /* __GDPR__
                "terminalReconnection" : {
                    "count" : { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true }
                }
             */
            const data = {
                count: reconnectCounter
            };
            this._telemetryService.publicLog('terminalReconnection', data);
            // now that terminals have been restored,
            // attach listeners to update remote when terminals are changed
            this.attachProcessLayoutListeners(true);
        }
        async _reconnectToLocalTerminals() {
            if (!this._localTerminalService) {
                return;
            }
            // Reattach to all local terminals
            const layoutInfo = await this._localTerminalService.getTerminalLayoutInfo();
            if (layoutInfo && layoutInfo.tabs.length > 0) {
                this._recreateTerminalTabs(layoutInfo);
            }
            // now that terminals have been restored,
            // attach listeners to update local state when terminals are changed
            this.attachProcessLayoutListeners(false);
        }
        _recreateTerminalTabs(layoutInfo) {
            let reconnectCounter = 0;
            let activeTab;
            if (layoutInfo) {
                layoutInfo.tabs.forEach(tabLayout => {
                    const terminalLayouts = tabLayout.terminals.filter(t => t.terminal && t.terminal.isOrphan);
                    if (terminalLayouts.length) {
                        reconnectCounter += terminalLayouts.length;
                        let terminalInstance;
                        let tab;
                        terminalLayouts.forEach((terminalLayout) => {
                            if (!terminalInstance) {
                                // create tab and terminal
                                terminalInstance = this.createTerminal({ attachPersistentProcess: terminalLayout.terminal });
                                tab = this.getTabForInstance(terminalInstance);
                                if (tabLayout.isActive) {
                                    activeTab = tab;
                                }
                            }
                            else {
                                // add split terminals to this tab
                                this.splitInstance(terminalInstance, { attachPersistentProcess: terminalLayout.terminal });
                            }
                        });
                        const activeInstance = this.terminalInstances.find(t => {
                            var _a;
                            return ((_a = t.shellLaunchConfig.attachPersistentProcess) === null || _a === void 0 ? void 0 : _a.id) === tabLayout.activePersistentProcessId;
                        });
                        if (activeInstance) {
                            this.setActiveInstance(activeInstance);
                        }
                        tab === null || tab === void 0 ? void 0 : tab.resizePanes(tabLayout.terminals.map(terminal => terminal.relativeSize));
                    }
                });
                if (layoutInfo.tabs.length) {
                    this.setActiveTabByIndex(activeTab ? this.terminalTabs.indexOf(activeTab) : 0);
                }
            }
            return reconnectCounter;
        }
        attachProcessLayoutListeners(isRemote) {
            this.onActiveTabChanged(() => isRemote ? this._updateRemoteState() : this._updateLocalState());
            this.onActiveInstanceChanged(() => isRemote ? this._updateRemoteState() : this._updateLocalState());
            this.onInstancesChanged(() => isRemote ? this._updateRemoteState() : this._updateLocalState());
            // The state must be updated when the terminal is relaunched, otherwise the persistent
            // terminal ID will be stale and the process will be leaked.
            this.onInstanceProcessIdReady(() => isRemote ? this._updateRemoteState() : this._updateLocalState());
        }
        setNativeWindowsDelegate(delegate) {
            this._nativeWindowsDelegate = delegate;
        }
        setLinuxDistro(linuxDistro) {
            this._configHelper.setLinuxDistro(linuxDistro);
        }
        _handleInstanceContextKeys() {
            const terminalIsOpenContext = terminal_3.KEYBINDING_CONTEXT_TERMINAL_IS_OPEN.bindTo(this._contextKeyService);
            const updateTerminalContextKeys = () => {
                terminalIsOpenContext.set(this.terminalInstances.length > 0);
            };
            this.onInstancesChanged(() => updateTerminalContextKeys());
        }
        getActiveOrCreateInstance() {
            const activeInstance = this.getActiveInstance();
            return activeInstance ? activeInstance : this.createTerminal(undefined);
        }
        requestStartExtensionTerminal(proxy, cols, rows) {
            // The initial request came from the extension host, no need to wait for it
            return new Promise(callback => {
                this._onInstanceRequestStartExtensionTerminal.fire({ proxy, cols, rows, callback });
            });
        }
        async extHostReady(remoteAuthority) {
            this._createExtHostReadyEntry(remoteAuthority);
            this._extHostsReady[remoteAuthority].resolve();
        }
        async _refreshAvailableProfiles() {
            const result = await this._detectProfiles(true);
            if (!(0, objects_1.equals)(result, this._availableProfiles)) {
                this._availableProfiles = result;
                this._onDidChangeAvailableProfiles.fire(this._availableProfiles);
            }
        }
        async _detectProfiles(configuredProfilesOnly) {
            await this._extensionService.whenInstalledExtensionsRegistered();
            // Wait for the remoteAuthority to be ready (and listening for events) before firing
            // the event to spawn the ext host process
            const conn = this._remoteAgentService.getConnection();
            const remoteAuthority = conn ? conn.remoteAuthority : 'null';
            await this._whenExtHostReady(remoteAuthority);
            return new Promise(r => this._onRequestAvailableProfiles.fire({ callback: r, configuredProfilesOnly: configuredProfilesOnly }));
        }
        async _whenExtHostReady(remoteAuthority) {
            this._createExtHostReadyEntry(remoteAuthority);
            return this._extHostsReady[remoteAuthority].promise;
        }
        _createExtHostReadyEntry(remoteAuthority) {
            if (this._extHostsReady[remoteAuthority]) {
                return;
            }
            let resolve;
            const promise = new Promise(r => resolve = r);
            this._extHostsReady[remoteAuthority] = { promise, resolve };
        }
        _onBeforeShutdown(reason) {
            if (this.terminalInstances.length === 0) {
                // No terminal instances, don't veto
                return false;
            }
            const shouldPersistTerminals = this._configHelper.config.enablePersistentSessions && reason === 3 /* RELOAD */;
            if (this.configHelper.config.confirmOnExit && !shouldPersistTerminals) {
                return this._onBeforeShutdownAsync();
            }
            this._isShuttingDown = true;
            return false;
        }
        async _onBeforeShutdownAsync() {
            // veto if configured to show confirmation and the user chose not to exit
            const veto = await this._showTerminalCloseConfirmation();
            if (!veto) {
                this._isShuttingDown = true;
            }
            return veto;
        }
        _onWillShutdown(e) {
            var _a;
            // Don't touch processes if the shutdown was a result of reload as they will be reattached
            const shouldPersistTerminals = this._configHelper.config.enablePersistentSessions && e.reason === 3 /* RELOAD */;
            if (shouldPersistTerminals) {
                this.terminalInstances.forEach(instance => instance.detachFromProcess());
                return;
            }
            // Force dispose of all terminal instances
            this.terminalInstances.forEach(instance => instance.dispose(true));
            (_a = this._localTerminalService) === null || _a === void 0 ? void 0 : _a.setTerminalLayoutInfo(undefined);
        }
        getTabLabels() {
            return this._terminalTabs.filter(tab => tab.terminalInstances.length > 0).map((tab, index) => {
                return `${index + 1}: ${tab.title ? tab.title : ''}`;
            });
        }
        getFindState() {
            return this._findState;
        }
        _updateRemoteState() {
            if (!!this._environmentService.remoteAuthority) {
                const state = {
                    tabs: this.terminalTabs.map(t => t.getLayoutInfo(t === this.getActiveTab()))
                };
                this._remoteTerminalService.setTerminalLayoutInfo(state);
            }
        }
        _updateLocalState() {
            const state = {
                tabs: this.terminalTabs.map(t => t.getLayoutInfo(t === this.getActiveTab()))
            };
            this._localTerminalService.setTerminalLayoutInfo(state);
        }
        _removeTab(tab) {
            // Get the index of the tab and remove it from the list
            const index = this._terminalTabs.indexOf(tab);
            const activeTab = this.getActiveTab();
            const activeTabIndex = activeTab ? this._terminalTabs.indexOf(activeTab) : -1;
            const wasActiveTab = tab === activeTab;
            if (index !== -1) {
                this._terminalTabs.splice(index, 1);
            }
            // Adjust focus if the tab was active
            if (wasActiveTab && this._terminalTabs.length > 0) {
                const newIndex = index < this._terminalTabs.length ? index : this._terminalTabs.length - 1;
                this.setActiveTabByIndex(newIndex);
                const activeInstance = this.getActiveInstance();
                if (activeInstance) {
                    activeInstance.focus(true);
                }
            }
            else if (activeTabIndex >= this._terminalTabs.length) {
                const newIndex = this._terminalTabs.length - 1;
                this.setActiveTabByIndex(newIndex);
            }
            // Hide the panel if there are no more instances, provided that VS Code is not shutting
            // down. When shutting down the panel is locked in place so that it is restored upon next
            // launch.
            if (this._terminalTabs.length === 0 && !this._isShuttingDown) {
                this.hidePanel();
                this._onActiveInstanceChanged.fire(undefined);
            }
            // Fire events
            this._onInstancesChanged.fire();
            if (wasActiveTab) {
                this._onActiveTabChanged.fire();
            }
        }
        refreshActiveTab() {
            // Fire active instances changed
            this._onActiveTabChanged.fire();
        }
        getActiveTab() {
            if (this._activeTabIndex < 0 || this._activeTabIndex >= this._terminalTabs.length) {
                return null;
            }
            return this._terminalTabs[this._activeTabIndex];
        }
        getActiveInstance() {
            const tab = this.getActiveTab();
            if (!tab) {
                return null;
            }
            return tab.activeInstance;
        }
        doWithActiveInstance(callback) {
            const instance = this.getActiveInstance();
            if (instance) {
                return callback(instance);
            }
        }
        getInstanceFromId(terminalId) {
            let bgIndex = -1;
            this._backgroundedTerminalInstances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    bgIndex = i;
                }
            });
            if (bgIndex !== -1) {
                return this._backgroundedTerminalInstances[bgIndex];
            }
            try {
                return this.terminalInstances[this._getIndexFromId(terminalId)];
            }
            catch (_a) {
                return undefined;
            }
        }
        getInstanceFromIndex(terminalIndex) {
            return this.terminalInstances[terminalIndex];
        }
        setActiveInstance(terminalInstance) {
            // If this was a hideFromUser terminal created by the API this was triggered by show,
            // in which case we need to create the terminal tab
            if (terminalInstance.shellLaunchConfig.hideFromUser) {
                this._showBackgroundTerminal(terminalInstance);
            }
            this.setActiveInstanceByIndex(this._getIndexFromId(terminalInstance.instanceId));
        }
        setActiveTabByIndex(tabIndex) {
            if (tabIndex >= this._terminalTabs.length) {
                return;
            }
            const didTabChange = this._activeTabIndex !== tabIndex;
            this._activeTabIndex = tabIndex;
            this._terminalTabs.forEach((t, i) => t.setVisible(i === this._activeTabIndex));
            if (didTabChange) {
                this._onActiveTabChanged.fire();
            }
        }
        isAttachedToTerminal(remoteTerm) {
            return this.terminalInstances.some(term => term.processId === remoteTerm.pid);
        }
        async initializeTerminals() {
            if (this._remoteTerminalsInitPromise) {
                await this._remoteTerminalsInitPromise;
            }
            else if (this._localTerminalsInitPromise) {
                await this._localTerminalsInitPromise;
            }
            if (this.terminalTabs.length === 0 && this.isProcessSupportRegistered) {
                this.createTerminal();
            }
        }
        _getInstanceFromGlobalInstanceIndex(index) {
            let currentTabIndex = 0;
            while (index >= 0 && currentTabIndex < this._terminalTabs.length) {
                const tab = this._terminalTabs[currentTabIndex];
                const count = tab.terminalInstances.length;
                if (index < count) {
                    return {
                        tab,
                        tabIndex: currentTabIndex,
                        instance: tab.terminalInstances[index],
                        localInstanceIndex: index
                    };
                }
                index -= count;
                currentTabIndex++;
            }
            return null;
        }
        setActiveInstanceByIndex(terminalIndex) {
            const query = this._getInstanceFromGlobalInstanceIndex(terminalIndex);
            if (!query) {
                return;
            }
            query.tab.setActiveInstanceByIndex(query.localInstanceIndex);
            const didTabChange = this._activeTabIndex !== query.tabIndex;
            this._activeTabIndex = query.tabIndex;
            this._terminalTabs.forEach((t, i) => t.setVisible(i === query.tabIndex));
            // Only fire the event if there was a change
            if (didTabChange) {
                this._onActiveTabChanged.fire();
            }
        }
        setActiveTabToNext() {
            if (this._terminalTabs.length <= 1) {
                return;
            }
            let newIndex = this._activeTabIndex + 1;
            if (newIndex >= this._terminalTabs.length) {
                newIndex = 0;
            }
            this.setActiveTabByIndex(newIndex);
        }
        setActiveTabToPrevious() {
            if (this._terminalTabs.length <= 1) {
                return;
            }
            let newIndex = this._activeTabIndex - 1;
            if (newIndex < 0) {
                newIndex = this._terminalTabs.length - 1;
            }
            this.setActiveTabByIndex(newIndex);
        }
        splitInstance(instanceToSplit, shellLaunchConfigOrProfile = {}, cwd) {
            const tab = this.getTabForInstance(instanceToSplit);
            if (!tab) {
                return null;
            }
            const shellLaunchConfig = this._convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd);
            const instance = tab.split(shellLaunchConfig);
            this._initInstanceListeners(instance);
            this._onInstancesChanged.fire();
            this._terminalTabs.forEach((t, i) => t.setVisible(i === this._activeTabIndex));
            return instance;
        }
        _initInstanceListeners(instance) {
            instance.addDisposable(instance.onDisposed(this._onInstanceDisposed.fire, this._onInstanceDisposed));
            instance.addDisposable(instance.onTitleChanged(this._onInstanceTitleChanged.fire, this._onInstanceTitleChanged));
            instance.addDisposable(instance.onProcessIdReady(this._onInstanceProcessIdReady.fire, this._onInstanceProcessIdReady));
            instance.addDisposable(instance.statusList.onDidChangePrimaryStatus(() => this._onInstancePrimaryStatusChanged.fire(instance)));
            instance.addDisposable(instance.onLinksReady(this._onInstanceLinksReady.fire, this._onInstanceLinksReady));
            instance.addDisposable(instance.onDimensionsChanged(() => {
                this._onInstanceDimensionsChanged.fire(instance);
                if (this.configHelper.config.enablePersistentSessions && this.isProcessSupportRegistered) {
                    !!this._environmentService.remoteAuthority ? this._updateRemoteState() : this._updateLocalState();
                }
            }));
            instance.addDisposable(instance.onMaximumDimensionsChanged(() => this._onInstanceMaximumDimensionsChanged.fire(instance)));
            instance.addDisposable(instance.onFocus(this._onActiveInstanceChanged.fire, this._onActiveInstanceChanged));
        }
        registerProcessSupport(isSupported) {
            if (!isSupported) {
                return;
            }
            this._processSupportContextKey.set(isSupported);
            this._onDidRegisterProcessSupport.fire();
        }
        registerLinkProvider(linkProvider) {
            const disposables = [];
            this._linkProviders.add(linkProvider);
            for (const instance of this.terminalInstances) {
                if (instance.areLinksReady) {
                    disposables.push(instance.registerLinkProvider(linkProvider));
                }
            }
            this._linkProviderDisposables.set(linkProvider, disposables);
            return {
                dispose: () => {
                    const disposables = this._linkProviderDisposables.get(linkProvider) || [];
                    for (const disposable of disposables) {
                        disposable.dispose();
                    }
                    this._linkProviders.delete(linkProvider);
                }
            };
        }
        _setInstanceLinkProviders(instance) {
            for (const linkProvider of this._linkProviders) {
                const disposables = this._linkProviderDisposables.get(linkProvider);
                const provider = instance.registerLinkProvider(linkProvider);
                disposables === null || disposables === void 0 ? void 0 : disposables.push(provider);
            }
        }
        getTabForInstance(instance) {
            return this._terminalTabs.find(tab => tab.terminalInstances.indexOf(instance) !== -1);
        }
        async showPanel(focus) {
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            if (!pane) {
                await this._viewsService.openView(terminal_3.TERMINAL_VIEW_ID, focus);
            }
            if (focus) {
                // Do the focus call asynchronously as going through the
                // command palette will force editor focus
                await (0, async_1.timeout)(0);
                const instance = this.getActiveInstance();
                if (instance) {
                    await instance.focusWhenReady(true);
                }
            }
        }
        async focusTabs() {
            var _a;
            await this.showPanel(true);
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            (_a = pane === null || pane === void 0 ? void 0 : pane.terminalTabbedView) === null || _a === void 0 ? void 0 : _a.focusTabs();
        }
        showTabs() {
            this._configurationService.updateValue('terminal.integrated.tabs.enabled', true);
        }
        _getIndexFromId(terminalId) {
            let terminalIndex = -1;
            this.terminalInstances.forEach((terminalInstance, i) => {
                if (terminalInstance.instanceId === terminalId) {
                    terminalIndex = i;
                }
            });
            if (terminalIndex === -1) {
                throw new Error(`Terminal with ID ${terminalId} does not exist (has it already been disposed?)`);
            }
            return terminalIndex;
        }
        async _showTerminalCloseConfirmation() {
            let message;
            if (this.terminalInstances.length === 1) {
                message = nls.localize(0, null);
            }
            else {
                message = nls.localize(1, null, this.terminalInstances.length);
            }
            const res = await this._dialogService.confirm({
                message,
                type: 'warning',
            });
            return !res.confirmed;
        }
        preparePathForTerminalAsync(originalPath, executable, title, shellType) {
            return new Promise(c => {
                if (!executable) {
                    c(originalPath);
                    return;
                }
                const hasSpace = originalPath.indexOf(' ') !== -1;
                const hasParens = originalPath.indexOf('(') !== -1 || originalPath.indexOf(')') !== -1;
                const pathBasename = (0, path_1.basename)(executable, '.exe');
                const isPowerShell = pathBasename === 'pwsh' ||
                    title === 'pwsh' ||
                    pathBasename === 'powershell' ||
                    title === 'powershell';
                if (isPowerShell && (hasSpace || originalPath.indexOf('\'') !== -1)) {
                    c(`& '${originalPath.replace(/'/g, '\'\'')}'`);
                    return;
                }
                if (hasParens && isPowerShell) {
                    c(`& '${originalPath}'`);
                    return;
                }
                if (platform_1.isWindows) {
                    // 17063 is the build number where wsl path was introduced.
                    // Update Windows uriPath to be executed in WSL.
                    if (shellType !== undefined) {
                        if (shellType === terminal_1.WindowsShellType.GitBash) {
                            c(originalPath.replace(/\\/g, '/'));
                            return;
                        }
                        else if (shellType === terminal_1.WindowsShellType.Wsl) {
                            if (this._nativeWindowsDelegate && this._nativeWindowsDelegate.getWindowsBuildNumber() >= 17063) {
                                c(this._nativeWindowsDelegate.getWslPath(originalPath));
                            }
                            else {
                                c(originalPath.replace(/\\/g, '/'));
                            }
                            return;
                        }
                        if (hasSpace) {
                            c('"' + originalPath + '"');
                        }
                        else {
                            c(originalPath);
                        }
                    }
                    else {
                        const lowerExecutable = executable.toLowerCase();
                        if (this._nativeWindowsDelegate && this._nativeWindowsDelegate.getWindowsBuildNumber() >= 17063 &&
                            (lowerExecutable.indexOf('wsl') !== -1 || (lowerExecutable.indexOf('bash.exe') !== -1 && lowerExecutable.toLowerCase().indexOf('git') === -1))) {
                            c(this._nativeWindowsDelegate.getWslPath(originalPath));
                            return;
                        }
                        else if (hasSpace) {
                            c('"' + originalPath + '"');
                        }
                        else {
                            c(originalPath);
                        }
                    }
                    return;
                }
                c((0, terminalEnvironment_1.escapeNonWindowsPath)(originalPath));
            });
        }
        async _getPlatformKey() {
            const env = await this._remoteAgentService.getEnvironment();
            if (env) {
                return env.os === 1 /* Windows */ ? 'windows' : (env.os === 2 /* Macintosh */ ? 'osx' : 'linux');
            }
            return platform_1.isWindows ? 'windows' : (platform_1.isMacintosh ? 'osx' : 'linux');
        }
        async showProfileQuickPick(type, cwd) {
            let keyMods;
            const profiles = await this._detectProfiles(false);
            const platformKey = await this._getPlatformKey();
            const options = {
                placeHolder: type === 'createInstance' ? nls.localize(2, null) : nls.localize(3, null),
                onDidTriggerItemButton: async (context) => {
                    var _a;
                    if ('command' in context.item.profile) {
                        return;
                    }
                    const configKey = `terminal.integrated.profiles.${platformKey}`;
                    const configProfiles = this._configurationService.getValue(configKey);
                    const existingProfiles = configProfiles ? Object.keys(configProfiles) : [];
                    const name = await this._quickInputService.input({
                        prompt: nls.localize(4, null),
                        value: context.item.profile.profileName,
                        validateInput: async (input) => {
                            if (existingProfiles.includes(input)) {
                                return nls.localize(5, null);
                            }
                            return undefined;
                        }
                    });
                    if (!name) {
                        return;
                    }
                    const newConfigValue = (_a = Object.assign({}, configProfiles)) !== null && _a !== void 0 ? _a : {};
                    newConfigValue[name] = {
                        path: context.item.profile.path,
                        args: context.item.profile.args
                    };
                    await this._configurationService.updateValue(configKey, newConfigValue, 1 /* USER */);
                },
                onKeyMods: mods => keyMods = mods
            };
            // Build quick pick items
            const quickPickItems = [];
            const configProfiles = profiles.filter(e => !e.isAutoDetected);
            const autoDetectedProfiles = profiles.filter(e => e.isAutoDetected);
            if (configProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize(6, null) });
                quickPickItems.push(...configProfiles.map(e => this._createProfileQuickPickItem(e)));
            }
            // Add contributed profiles, these cannot be defaults
            if (type === 'createInstance') {
                quickPickItems.push({ type: 'separator', label: nls.localize(7, null) });
                for (const contributed of this._terminalContributionService.terminalTypes) {
                    const icon = contributed.icon ? (codicons_1.iconRegistry.get(contributed.icon) || codicons_1.Codicon.terminal) : codicons_1.Codicon.terminal;
                    quickPickItems.push({
                        label: `$(${icon.id}) ${contributed.title}`,
                        profile: contributed
                    });
                }
            }
            if (autoDetectedProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize(8, null) });
                quickPickItems.push(...autoDetectedProfiles.map(e => this._createProfileQuickPickItem(e)));
            }
            const value = await this._quickInputService.pick(quickPickItems, options);
            if (!value) {
                return;
            }
            if (type === 'createInstance') {
                // TODO: How to support alt here?
                if ('command' in value.profile) {
                    return this._commandService.executeCommand(value.profile.command);
                }
                let instance;
                const activeInstance = this.getActiveInstance();
                if ((keyMods === null || keyMods === void 0 ? void 0 : keyMods.alt) && activeInstance) {
                    // create split, only valid if there's an active instance
                    if (activeInstance) {
                        instance = this.splitInstance(activeInstance, value.profile, cwd);
                    }
                }
                else {
                    instance = this.createTerminal(value.profile, cwd);
                }
                if (instance) {
                    this.showPanel(true);
                    this.setActiveInstance(instance);
                    return instance;
                }
            }
            else { // setDefault
                if ('command' in value.profile) {
                    return; // Should never happen
                }
                // Add the profile to settings if necessary
                if (value.profile.isAutoDetected) {
                    const profilesConfig = await this._configurationService.getValue(`terminal.integrated.profiles.${platformKey}`);
                    if (typeof profilesConfig === 'object') {
                        const newProfile = {
                            path: value.profile.path
                        };
                        if (value.profile.args) {
                            newProfile.args = value.profile.args;
                        }
                        profilesConfig[value.profile.profileName] = newProfile;
                    }
                    await this._configurationService.updateValue(`terminal.integrated.profiles.${platformKey}`, profilesConfig, 1 /* USER */);
                }
                // Set the default profile
                await this._configurationService.updateValue(`terminal.integrated.defaultProfile.${platformKey}`, value.profile.profileName, 1 /* USER */);
            }
            return undefined;
        }
        _createProfileQuickPickItem(profile) {
            const buttons = [{
                    iconClass: themeService_1.ThemeIcon.asClassName(terminalIcons_1.configureTerminalProfileIcon),
                    tooltip: nls.localize(9, null)
                }];
            const icon = profile.icon ? (codicons_1.iconRegistry.get(profile.icon) || codicons_1.Codicon.terminal) : codicons_1.Codicon.terminal;
            const label = `$(${icon.id}) ${profile.profileName}`;
            if (profile.args) {
                if (typeof profile.args === 'string') {
                    return { label, description: `${profile.path} ${profile.args}`, profile, buttons };
                }
                const argsString = profile.args.map(e => {
                    if (e.includes(' ')) {
                        return `"${e.replace('/"/g', '\\"')}"`;
                    }
                    return e;
                }).join(' ');
                return { label, description: `${profile.path} ${argsString}`, profile, buttons };
            }
            return { label, description: profile.path, profile, buttons };
        }
        createInstance(container, shellLaunchConfig) {
            const instance = this._instantiationService.createInstance(terminalInstance_1.TerminalInstance, this._terminalFocusContextKey, this._terminalShellTypeContextKey, this._terminalAltBufferActiveContextKey, this._configHelper, container, shellLaunchConfig);
            this._onInstanceCreated.fire(instance);
            return instance;
        }
        _convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile, cwd) {
            // Profile was provided
            if (shellLaunchConfigOrProfile && 'profileName' in shellLaunchConfigOrProfile) {
                const profile = shellLaunchConfigOrProfile;
                return {
                    executable: profile.path,
                    args: profile.args,
                    env: profile.env,
                    icon: profile.icon,
                    name: profile.overrideName ? profile.profileName : undefined,
                    cwd
                };
            }
            // Shell launch config was provided
            if (shellLaunchConfigOrProfile) {
                if (cwd) {
                    shellLaunchConfigOrProfile.cwd = cwd;
                }
                return shellLaunchConfigOrProfile;
            }
            // Return empty shell launch config
            return {};
        }
        createTerminal(shellLaunchConfigOrProfile, cwd) {
            var _a;
            const shellLaunchConfig = this._convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile);
            if (cwd) {
                shellLaunchConfig.cwd = cwd;
            }
            if (!shellLaunchConfig.customPtyImplementation && !this.isProcessSupportRegistered) {
                throw new Error('Could not create terminal when process support is not registered');
            }
            if (shellLaunchConfig.hideFromUser) {
                const instance = this.createInstance(undefined, shellLaunchConfig);
                this._backgroundedTerminalInstances.push(instance);
                this._initInstanceListeners(instance);
                return instance;
            }
            // Add welcome message and title annotation for local terminals launched within remote or
            // virtual workspaces
            const isRemoteWorkspace = !!contextkeys_1.VirtualWorkspaceContext.getValue(this._contextKeyService) ||
                this._remoteAgentService.getConnection() && (typeof shellLaunchConfig.cwd === 'string' || ((_a = shellLaunchConfig.cwd) === null || _a === void 0 ? void 0 : _a.scheme) === network_1.Schemas.file);
            if (isRemoteWorkspace) {
                shellLaunchConfig.initialText = (0, terminalStrings_1.formatMessageForTerminal)(nls.localize(10, null), true);
                shellLaunchConfig.description = nls.localize(11, null);
            }
            const terminalTab = this._instantiationService.createInstance(terminalTab_1.TerminalTab, this._terminalContainer, shellLaunchConfig);
            this._terminalTabs.push(terminalTab);
            terminalTab.onPanelMovedToSide(() => this._onPanelMovedToSide.fire());
            const instance = terminalTab.terminalInstances[0];
            terminalTab.addDisposable(terminalTab.onDisposed(this._onTabDisposed.fire, this._onTabDisposed));
            terminalTab.addDisposable(terminalTab.onInstancesChanged(this._onInstancesChanged.fire, this._onInstancesChanged));
            this._initInstanceListeners(instance);
            this._onInstancesChanged.fire();
            if (this.terminalInstances.length === 1) {
                // It's the first instance so it should be made active automatically, this must fire
                // after onInstancesChanged so consumers can react to the instance being added first
                this.setActiveInstanceByIndex(0);
            }
            return instance;
        }
        _showBackgroundTerminal(instance) {
            this._backgroundedTerminalInstances.splice(this._backgroundedTerminalInstances.indexOf(instance), 1);
            instance.shellLaunchConfig.hideFromUser = false;
            const terminalTab = this._instantiationService.createInstance(terminalTab_1.TerminalTab, this._terminalContainer, instance);
            this._terminalTabs.push(terminalTab);
            terminalTab.addDisposable(terminalTab.onDisposed(this._onTabDisposed.fire, this._onTabDisposed));
            terminalTab.addDisposable(terminalTab.onInstancesChanged(this._onInstancesChanged.fire, this._onInstancesChanged));
            if (this.terminalInstances.length === 1) {
                // It's the first instance so it should be made active automatically
                this.setActiveInstanceByIndex(0);
            }
            this._onInstancesChanged.fire();
        }
        async focusFindWidget() {
            var _a;
            await this.showPanel(false);
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            (_a = pane === null || pane === void 0 ? void 0 : pane.terminalTabbedView) === null || _a === void 0 ? void 0 : _a.focusFindWidget();
        }
        hideFindWidget() {
            var _a;
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            (_a = pane === null || pane === void 0 ? void 0 : pane.terminalTabbedView) === null || _a === void 0 ? void 0 : _a.hideFindWidget();
        }
        findNext() {
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            if (pane === null || pane === void 0 ? void 0 : pane.terminalTabbedView) {
                pane.terminalTabbedView.showFindWidget();
                pane.terminalTabbedView.getFindWidget().find(false);
            }
        }
        findPrevious() {
            const pane = this._viewsService.getActiveViewWithId(terminal_3.TERMINAL_VIEW_ID);
            if (pane === null || pane === void 0 ? void 0 : pane.terminalTabbedView) {
                pane.terminalTabbedView.showFindWidget();
                pane.terminalTabbedView.getFindWidget().find(true);
            }
        }
        async setContainers(panelContainer, terminalContainer) {
            this._configHelper.panelContainer = panelContainer;
            this._terminalContainer = terminalContainer;
            this._terminalTabs.forEach(tab => tab.attachToElement(terminalContainer));
        }
        hidePanel() {
            // Hide the panel if the terminal is in the panel and it has no sibling views
            const location = this._viewDescriptorService.getViewLocationById(terminal_3.TERMINAL_VIEW_ID);
            if (location === 1 /* Panel */) {
                const panel = this._viewDescriptorService.getViewContainerByViewId(terminal_3.TERMINAL_VIEW_ID);
                if (panel && this._viewDescriptorService.getViewContainerModel(panel).activeViewDescriptors.length === 1) {
                    this._layoutService.setPanelHidden(true);
                }
            }
        }
    };
    __decorate([
        (0, decorators_1.throttle)(10000)
    ], TerminalService.prototype, "_refreshAvailableProfiles", null);
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_updateRemoteState", null);
    __decorate([
        (0, decorators_1.debounce)(500)
    ], TerminalService.prototype, "_updateLocalState", null);
    TerminalService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, layoutService_1.IWorkbenchLayoutService),
        __param(2, label_1.ILabelService),
        __param(3, lifecycle_1.ILifecycleService),
        __param(4, dialogs_1.IDialogService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, remoteAgentService_1.IRemoteAgentService),
        __param(7, quickInput_1.IQuickInputService),
        __param(8, configuration_1.IConfigurationService),
        __param(9, views_1.IViewsService),
        __param(10, views_1.IViewDescriptorService),
        __param(11, environmentService_1.IWorkbenchEnvironmentService),
        __param(12, terminal_2.IRemoteTerminalService),
        __param(13, telemetry_1.ITelemetryService),
        __param(14, extensions_1.IExtensionService),
        __param(15, terminalExtensionPoints_1.ITerminalContributionService),
        __param(16, commands_1.ICommandService),
        __param(17, (0, instantiation_1.optional)(terminal_1.ILocalTerminalService))
    ], TerminalService);
    exports.TerminalService = TerminalService;
});
//# sourceMappingURL=terminalService.js.map