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
define(["require", "exports", "vs/nls!vs/workbench/services/extensions/common/abstractExtensionService", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/performance", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/services/extensions/common/extensionDescriptionRegistry", "vs/workbench/services/extensions/common/extensionHostManager", "vs/platform/extensions/common/extensions", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/platform/product/common/productService", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/api/common/shared/workspaceContains", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/base/common/network", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, nls, arrays_1, async_1, event_1, lifecycle_1, perf, resources_1, environmentService_1, extensionManagement_1, extensionManagementUtil_1, instantiation_1, notification_1, telemetry_1, extensions_1, extensionsRegistry_1, extensionDescriptionRegistry_1, extensionHostManager_1, extensions_2, files_1, extensionDevOptions_1, productService_1, extensionManagement_2, workspaceContains_1, workspace_1, configuration_1, network_1, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionRunningLocationClassifier = exports.AbstractExtensionService = exports.ExtensionRunningPreference = exports.ExtensionRunningLocation = exports.parseScannedExtension = void 0;
    const hasOwnProperty = Object.hasOwnProperty;
    const NO_OP_VOID_PROMISE = Promise.resolve(undefined);
    function parseScannedExtension(extension) {
        return Object.assign({ identifier: new extensions_2.ExtensionIdentifier(`${extension.packageJSON.publisher}.${extension.packageJSON.name}`), isBuiltin: extension.type === 0 /* System */, isUserBuiltin: false, isUnderDevelopment: extension.isUnderDevelopment, extensionLocation: extension.location }, extension.packageJSON);
    }
    exports.parseScannedExtension = parseScannedExtension;
    class DeltaExtensionsQueueItem {
        constructor(toAdd, toRemove) {
            this.toAdd = toAdd;
            this.toRemove = toRemove;
        }
    }
    var ExtensionRunningLocation;
    (function (ExtensionRunningLocation) {
        ExtensionRunningLocation[ExtensionRunningLocation["None"] = 0] = "None";
        ExtensionRunningLocation[ExtensionRunningLocation["LocalProcess"] = 1] = "LocalProcess";
        ExtensionRunningLocation[ExtensionRunningLocation["LocalWebWorker"] = 2] = "LocalWebWorker";
        ExtensionRunningLocation[ExtensionRunningLocation["Remote"] = 3] = "Remote";
    })(ExtensionRunningLocation = exports.ExtensionRunningLocation || (exports.ExtensionRunningLocation = {}));
    var ExtensionRunningPreference;
    (function (ExtensionRunningPreference) {
        ExtensionRunningPreference[ExtensionRunningPreference["None"] = 0] = "None";
        ExtensionRunningPreference[ExtensionRunningPreference["Local"] = 1] = "Local";
        ExtensionRunningPreference[ExtensionRunningPreference["Remote"] = 2] = "Remote";
    })(ExtensionRunningPreference = exports.ExtensionRunningPreference || (exports.ExtensionRunningPreference = {}));
    let AbstractExtensionService = class AbstractExtensionService extends lifecycle_1.Disposable {
        constructor(_runningLocationClassifier, _instantiationService, _notificationService, _environmentService, _telemetryService, _extensionEnablementService, _fileService, _productService, _extensionManagementService, _contextService, _configurationService, _extensionManifestPropertiesService) {
            super();
            this._runningLocationClassifier = _runningLocationClassifier;
            this._instantiationService = _instantiationService;
            this._notificationService = _notificationService;
            this._environmentService = _environmentService;
            this._telemetryService = _telemetryService;
            this._extensionEnablementService = _extensionEnablementService;
            this._fileService = _fileService;
            this._productService = _productService;
            this._extensionManagementService = _extensionManagementService;
            this._contextService = _contextService;
            this._configurationService = _configurationService;
            this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
            this._onDidRegisterExtensions = this._register(new event_1.Emitter());
            this.onDidRegisterExtensions = this._onDidRegisterExtensions.event;
            this._onDidChangeExtensionsStatus = this._register(new event_1.Emitter());
            this.onDidChangeExtensionsStatus = this._onDidChangeExtensionsStatus.event;
            this._onDidChangeExtensions = this._register(new event_1.Emitter({ leakWarningThreshold: 400 }));
            this.onDidChangeExtensions = this._onDidChangeExtensions.event;
            this._onWillActivateByEvent = this._register(new event_1.Emitter());
            this.onWillActivateByEvent = this._onWillActivateByEvent.event;
            this._onDidChangeResponsiveChange = this._register(new event_1.Emitter());
            this.onDidChangeResponsiveChange = this._onDidChangeResponsiveChange.event;
            this._allRequestedActivateEvents = new Set();
            this._onDidFinishHandleDeltaExtensions = this._register(new event_1.Emitter());
            // help the file service to activate providers by activating extensions by file system event
            this._register(this._fileService.onWillActivateFileSystemProvider(e => {
                e.join(this.activateByEvent(`onFileSystem:${e.scheme}`));
            }));
            this._registry = new extensionDescriptionRegistry_1.ExtensionDescriptionRegistry([]);
            this._installedExtensionsReady = new async_1.Barrier();
            this._isDev = !this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment;
            this._extensionsMessages = new Map();
            this._proposedApiController = new ProposedApiController(this._environmentService, this._productService);
            this._extensionHostManagers = [];
            this._extensionHostActiveExtensions = new Map();
            this._extensionHostActivationTimes = new Map();
            this._extensionHostExtensionRuntimeErrors = new Map();
            const devOpts = (0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService);
            this._isExtensionDevHost = devOpts.isExtensionDevHost;
            this._isExtensionDevTestFromCli = devOpts.isExtensionDevTestFromCli;
            this._deltaExtensionsQueue = [];
            this._inHandleDeltaExtensions = false;
            this._runningLocation = new Map();
            this._register(this._extensionEnablementService.onEnablementChanged((extensions) => {
                let toAdd = [];
                let toRemove = [];
                for (const extension of extensions) {
                    if (this._safeInvokeIsEnabled(extension)) {
                        // an extension has been enabled
                        toAdd.push(extension);
                    }
                    else {
                        // an extension has been disabled
                        toRemove.push(extension.identifier.id);
                    }
                }
                this._handleDeltaExtensions(new DeltaExtensionsQueueItem(toAdd, toRemove));
            }));
            this._register(this._extensionManagementService.onDidInstallExtension((event) => {
                if (event.local) {
                    if (this._safeInvokeIsEnabled(event.local)) {
                        // an extension has been installed
                        this._handleDeltaExtensions(new DeltaExtensionsQueueItem([event.local], []));
                    }
                }
            }));
            this._register(this._extensionManagementService.onDidUninstallExtension((event) => {
                if (!event.error) {
                    // an extension has been uninstalled
                    this._handleDeltaExtensions(new DeltaExtensionsQueueItem([], [event.identifier.id]));
                }
            }));
        }
        _getExtensionKind(extensionDescription) {
            if (extensionDescription.isUnderDevelopment && this._environmentService.extensionDevelopmentKind) {
                return this._environmentService.extensionDevelopmentKind;
            }
            return this._extensionManifestPropertiesService.getExtensionKind(extensionDescription);
        }
        _getExtensionHostManager(kind) {
            for (const extensionHostManager of this._extensionHostManagers) {
                if (extensionHostManager.kind === kind) {
                    return extensionHostManager;
                }
            }
            return null;
        }
        //#region deltaExtensions
        async _handleDeltaExtensions(item) {
            this._deltaExtensionsQueue.push(item);
            if (this._inHandleDeltaExtensions) {
                // Let the current item finish, the new one will be picked up
                return;
            }
            while (this._deltaExtensionsQueue.length > 0) {
                const item = this._deltaExtensionsQueue.shift();
                try {
                    this._inHandleDeltaExtensions = true;
                    await this._deltaExtensions(item.toAdd, item.toRemove);
                }
                finally {
                    this._inHandleDeltaExtensions = false;
                }
            }
            this._onDidFinishHandleDeltaExtensions.fire();
        }
        async _deltaExtensions(_toAdd, _toRemove) {
            let toAdd = [];
            for (let i = 0, len = _toAdd.length; i < len; i++) {
                const extension = _toAdd[i];
                const extensionDescription = await this._scanSingleExtension(extension);
                if (!extensionDescription) {
                    // could not scan extension...
                    continue;
                }
                if (!this.canAddExtension(extensionDescription)) {
                    continue;
                }
                toAdd.push(extensionDescription);
            }
            let toRemove = [];
            for (let i = 0, len = _toRemove.length; i < len; i++) {
                const extensionId = _toRemove[i];
                const extensionDescription = this._registry.getExtensionDescription(extensionId);
                if (!extensionDescription) {
                    // ignore disabling/uninstalling an extension which is not running
                    continue;
                }
                if (!this.canRemoveExtension(extensionDescription)) {
                    // uses non-dynamic extension point or is activated
                    continue;
                }
                toRemove.push(extensionDescription);
            }
            if (toAdd.length === 0 && toRemove.length === 0) {
                return;
            }
            // Update the local registry
            const result = this._registry.deltaExtensions(toAdd, toRemove.map(e => e.identifier));
            this._onDidChangeExtensions.fire(undefined);
            toRemove = toRemove.concat(result.removedDueToLooping);
            if (result.removedDueToLooping.length > 0) {
                this._logOrShowMessage(notification_1.Severity.Error, nls.localize(0, null, result.removedDueToLooping.map(e => `'${e.identifier.value}'`).join(', ')));
            }
            // enable or disable proposed API per extension
            this._checkEnableProposedApi(toAdd);
            // Update extension points
            this._doHandleExtensionPoints([].concat(toAdd).concat(toRemove));
            // Update the extension host
            await this._updateExtensionsOnExtHosts(toAdd, toRemove.map(e => e.identifier));
            for (let i = 0; i < toAdd.length; i++) {
                this._activateAddedExtensionIfNeeded(toAdd[i]);
            }
        }
        async _updateExtensionsOnExtHosts(toAdd, toRemove) {
            const groupedToRemove = [];
            const groupRemove = (extensionHostKind, extensionRunningLocation) => {
                groupedToRemove[extensionHostKind] = filterByRunningLocation(toRemove, extId => extId, this._runningLocation, extensionRunningLocation);
            };
            groupRemove(0 /* LocalProcess */, 1 /* LocalProcess */);
            groupRemove(1 /* LocalWebWorker */, 2 /* LocalWebWorker */);
            groupRemove(2 /* Remote */, 3 /* Remote */);
            for (const extensionId of toRemove) {
                this._runningLocation.delete(extensions_2.ExtensionIdentifier.toKey(extensionId));
            }
            const groupedToAdd = [];
            const groupAdd = (extensionHostKind, extensionRunningLocation) => {
                groupedToAdd[extensionHostKind] = filterByRunningLocation(toAdd, ext => ext.identifier, this._runningLocation, extensionRunningLocation);
            };
            for (const extension of toAdd) {
                const extensionKind = this._getExtensionKind(extension);
                const isRemote = extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote;
                const runningLocation = this._runningLocationClassifier.pickRunningLocation(extensionKind, !isRemote, isRemote, 0 /* None */);
                this._runningLocation.set(extensions_2.ExtensionIdentifier.toKey(extension.identifier), runningLocation);
            }
            groupAdd(0 /* LocalProcess */, 1 /* LocalProcess */);
            groupAdd(1 /* LocalWebWorker */, 2 /* LocalWebWorker */);
            groupAdd(2 /* Remote */, 3 /* Remote */);
            const promises = [];
            for (const extensionHostKind of [0 /* LocalProcess */, 1 /* LocalWebWorker */, 2 /* Remote */]) {
                const toAdd = groupedToAdd[extensionHostKind];
                const toRemove = groupedToRemove[extensionHostKind];
                if (toAdd.length > 0 || toRemove.length > 0) {
                    const extensionHostManager = this._getExtensionHostManager(extensionHostKind);
                    if (extensionHostManager) {
                        promises.push(extensionHostManager.deltaExtensions(toAdd, toRemove));
                    }
                }
            }
            await Promise.all(promises);
        }
        canAddExtension(extension) {
            const existing = this._registry.getExtensionDescription(extension.identifier);
            if (existing) {
                // this extension is already running (most likely at a different version)
                return false;
            }
            // Check if extension is renamed
            if (extension.uuid && this._registry.getAllExtensionDescriptions().some(e => e.uuid === extension.uuid)) {
                return false;
            }
            const extensionKind = this._getExtensionKind(extension);
            const isRemote = extension.extensionLocation.scheme === network_1.Schemas.vscodeRemote;
            const runningLocation = this._runningLocationClassifier.pickRunningLocation(extensionKind, !isRemote, isRemote, 0 /* None */);
            if (runningLocation === 0 /* None */) {
                return false;
            }
            return true;
        }
        canRemoveExtension(extension) {
            const extensionDescription = this._registry.getExtensionDescription(extension.identifier);
            if (!extensionDescription) {
                // ignore removing an extension which is not running
                return false;
            }
            if (this._extensionHostActiveExtensions.has(extensions_2.ExtensionIdentifier.toKey(extensionDescription.identifier))) {
                // Extension is running, cannot remove it safely
                return false;
            }
            return true;
        }
        async _activateAddedExtensionIfNeeded(extensionDescription) {
            let shouldActivate = false;
            let shouldActivateReason = null;
            let hasWorkspaceContains = false;
            if (Array.isArray(extensionDescription.activationEvents)) {
                for (let activationEvent of extensionDescription.activationEvents) {
                    // TODO@joao: there's no easy way to contribute this
                    if (activationEvent === 'onUri') {
                        activationEvent = `onUri:${extensions_2.ExtensionIdentifier.toKey(extensionDescription.identifier)}`;
                    }
                    if (this._allRequestedActivateEvents.has(activationEvent)) {
                        // This activation event was fired before the extension was added
                        shouldActivate = true;
                        shouldActivateReason = activationEvent;
                        break;
                    }
                    if (activationEvent === '*') {
                        shouldActivate = true;
                        shouldActivateReason = activationEvent;
                        break;
                    }
                    if (/^workspaceContains/.test(activationEvent)) {
                        hasWorkspaceContains = true;
                    }
                    if (activationEvent === 'onStartupFinished') {
                        shouldActivate = true;
                        shouldActivateReason = activationEvent;
                        break;
                    }
                }
            }
            if (shouldActivate) {
                await Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: shouldActivateReason }))).then(() => { });
            }
            else if (hasWorkspaceContains) {
                const workspace = await this._contextService.getCompleteWorkspace();
                const forceUsingSearch = !!this._environmentService.remoteAuthority;
                const host = {
                    folders: workspace.folders.map(folder => folder.uri),
                    forceUsingSearch: forceUsingSearch,
                    exists: (uri) => this._fileService.exists(uri),
                    checkExists: (folders, includes, token) => this._instantiationService.invokeFunction((accessor) => (0, workspaceContains_1.checkGlobFileExists)(accessor, folders, includes, token))
                };
                const result = await (0, workspaceContains_1.checkActivateWorkspaceContainsExtension)(host, extensionDescription);
                if (!result) {
                    return;
                }
                await Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activate(extensionDescription.identifier, { startup: false, extensionId: extensionDescription.identifier, activationEvent: result.activationEvent }))).then(() => { });
            }
        }
        //#endregion
        async _initialize() {
            perf.mark('code/willLoadExtensions');
            this._startExtensionHosts(true, []);
            await this._scanAndHandleExtensions();
            this._releaseBarrier();
            perf.mark('code/didLoadExtensions');
            await this._handleExtensionTests();
        }
        async _handleExtensionTests() {
            if (!this._environmentService.isExtensionDevelopment || !this._environmentService.extensionTestsLocationURI) {
                return;
            }
            const extensionHostManager = this.findTestExtensionHost(this._environmentService.extensionTestsLocationURI);
            if (!extensionHostManager) {
                const msg = nls.localize(1, null, this._environmentService.extensionTestsLocationURI.toString());
                console.error(msg);
                this._notificationService.error(msg);
                return;
            }
            let exitCode;
            try {
                exitCode = await extensionHostManager.extensionTestsExecute();
            }
            catch (err) {
                console.error(err);
                exitCode = 1 /* ERROR */;
            }
            await extensionHostManager.extensionTestsSendExit(exitCode);
            this._onExtensionHostExit(exitCode);
        }
        findTestExtensionHost(testLocation) {
            let extensionHostKind;
            for (const extension of this._registry.getAllExtensionDescriptions()) {
                if ((0, resources_1.isEqualOrParent)(testLocation, extension.extensionLocation)) {
                    const runningLocation = this._runningLocation.get(extensions_2.ExtensionIdentifier.toKey(extension.identifier));
                    if (runningLocation === 1 /* LocalProcess */) {
                        extensionHostKind = 0 /* LocalProcess */;
                    }
                    else if (runningLocation === 2 /* LocalWebWorker */) {
                        extensionHostKind = 1 /* LocalWebWorker */;
                    }
                    else if (runningLocation === 3 /* Remote */) {
                        extensionHostKind = 2 /* Remote */;
                    }
                    break;
                }
            }
            if (extensionHostKind === undefined) {
                // not sure if we should support that, but it was possible to have an test outside an extension
                if (testLocation.scheme === network_1.Schemas.vscodeRemote) {
                    extensionHostKind = 2 /* Remote */;
                }
                else {
                    // When a debugger attaches to the extension host, it will surface all console.log messages from the extension host,
                    // but not necessarily from the window. So it would be best if any errors get printed to the console of the extension host.
                    // That is why here we use the local process extension host even for non-file URIs
                    extensionHostKind = 0 /* LocalProcess */;
                }
            }
            if (extensionHostKind !== undefined) {
                return this._getExtensionHostManager(extensionHostKind);
            }
            return undefined;
        }
        _releaseBarrier() {
            this._installedExtensionsReady.open();
            this._onDidRegisterExtensions.fire(undefined);
            this._onDidChangeExtensionsStatus.fire(this._registry.getAllExtensionDescriptions().map(e => e.identifier));
        }
        //#region Stopping / Starting / Restarting
        stopExtensionHosts() {
            let previouslyActivatedExtensionIds = [];
            this._extensionHostActiveExtensions.forEach((value) => {
                previouslyActivatedExtensionIds.push(value);
            });
            for (const manager of this._extensionHostManagers) {
                manager.dispose();
            }
            this._extensionHostManagers = [];
            this._extensionHostActiveExtensions = new Map();
            this._extensionHostActivationTimes = new Map();
            this._extensionHostExtensionRuntimeErrors = new Map();
            if (previouslyActivatedExtensionIds.length > 0) {
                this._onDidChangeExtensionsStatus.fire(previouslyActivatedExtensionIds);
            }
        }
        _startExtensionHosts(isInitialStart, initialActivationEvents) {
            const extensionHosts = this._createExtensionHosts(isInitialStart);
            extensionHosts.forEach((extensionHost) => {
                const processManager = this._instantiationService.createInstance(extensionHostManager_1.ExtensionHostManager, extensionHost, initialActivationEvents);
                processManager.onDidExit(([code, signal]) => this._onExtensionHostCrashOrExit(processManager, code, signal));
                processManager.onDidChangeResponsiveState((responsiveState) => { this._onDidChangeResponsiveChange.fire({ isResponsive: responsiveState === 0 /* Responsive */ }); });
                this._extensionHostManagers.push(processManager);
            });
        }
        _onExtensionHostCrashOrExit(extensionHost, code, signal) {
            // Unexpected termination
            if (!this._isExtensionDevHost) {
                this._onExtensionHostCrashed(extensionHost, code, signal);
                return;
            }
            this._onExtensionHostExit(code);
        }
        _onExtensionHostCrashed(extensionHost, code, signal) {
            console.error('Extension host terminated unexpectedly. Code: ', code, ' Signal: ', signal);
            if (extensionHost.kind === 0 /* LocalProcess */) {
                this.stopExtensionHosts();
            }
            else if (extensionHost.kind === 2 /* Remote */) {
                for (let i = 0; i < this._extensionHostManagers.length; i++) {
                    if (this._extensionHostManagers[i] === extensionHost) {
                        this._extensionHostManagers[i].dispose();
                        this._extensionHostManagers.splice(i, 1);
                        break;
                    }
                }
            }
        }
        async startExtensionHosts() {
            this.stopExtensionHosts();
            if (this._inHandleDeltaExtensions) {
                await event_1.Event.toPromise(this._onDidFinishHandleDeltaExtensions.event);
            }
            this._startExtensionHosts(false, Array.from(this._allRequestedActivateEvents.keys()));
        }
        async restartExtensionHost() {
            this.stopExtensionHosts();
            await this.startExtensionHosts();
        }
        //#endregion
        //#region IExtensionService
        activateByEvent(activationEvent, activationKind = 0 /* Normal */) {
            if (this._installedExtensionsReady.isOpen()) {
                // Extensions have been scanned and interpreted
                // Record the fact that this activationEvent was requested (in case of a restart)
                this._allRequestedActivateEvents.add(activationEvent);
                if (!this._registry.containsActivationEvent(activationEvent)) {
                    // There is no extension that is interested in this activation event
                    return NO_OP_VOID_PROMISE;
                }
                return this._activateByEvent(activationEvent, activationKind);
            }
            else {
                // Extensions have not been scanned yet.
                // Record the fact that this activationEvent was requested (in case of a restart)
                this._allRequestedActivateEvents.add(activationEvent);
                if (activationKind === 1 /* Immediate */) {
                    // Do not wait for the normal start-up of the extension host(s)
                    return this._activateByEvent(activationEvent, activationKind);
                }
                return this._installedExtensionsReady.wait().then(() => this._activateByEvent(activationEvent, activationKind));
            }
        }
        _activateByEvent(activationEvent, activationKind) {
            const result = Promise.all(this._extensionHostManagers.map(extHostManager => extHostManager.activateByEvent(activationEvent, activationKind))).then(() => { });
            this._onWillActivateByEvent.fire({
                event: activationEvent,
                activation: result
            });
            return result;
        }
        whenInstalledExtensionsRegistered() {
            return this._installedExtensionsReady.wait();
        }
        getExtensions() {
            return this._installedExtensionsReady.wait().then(() => {
                return this._registry.getAllExtensionDescriptions();
            });
        }
        getExtension(id) {
            return this._installedExtensionsReady.wait().then(() => {
                return this._registry.getExtensionDescription(id);
            });
        }
        readExtensionPointContributions(extPoint) {
            return this._installedExtensionsReady.wait().then(() => {
                const availableExtensions = this._registry.getAllExtensionDescriptions();
                const result = [];
                for (const desc of availableExtensions) {
                    if (desc.contributes && hasOwnProperty.call(desc.contributes, extPoint.name)) {
                        result.push(new extensions_1.ExtensionPointContribution(desc, desc.contributes[extPoint.name]));
                    }
                }
                return result;
            });
        }
        getExtensionsStatus() {
            let result = Object.create(null);
            if (this._registry) {
                const extensions = this._registry.getAllExtensionDescriptions();
                for (const extension of extensions) {
                    const extensionKey = extensions_2.ExtensionIdentifier.toKey(extension.identifier);
                    result[extension.identifier.value] = {
                        messages: this._extensionsMessages.get(extensionKey) || [],
                        activationTimes: this._extensionHostActivationTimes.get(extensionKey),
                        runtimeErrors: this._extensionHostExtensionRuntimeErrors.get(extensionKey) || [],
                    };
                }
            }
            return result;
        }
        getInspectPort(_tryEnableInspector) {
            return Promise.resolve(0);
        }
        async setRemoteEnvironment(env) {
            await this._extensionHostManagers
                .map(manager => manager.setRemoteEnvironment(env));
        }
        //#endregion
        // --- impl
        _checkEnableProposedApi(extensions) {
            for (let extension of extensions) {
                this._proposedApiController.updateEnableProposedApi(extension);
            }
        }
        _checkEnabledAndProposedAPI(extensions) {
            // enable or disable proposed API per extension
            this._checkEnableProposedApi(extensions);
            // keep only enabled extensions
            return extensions.filter(extension => this._isEnabled(extension));
        }
        _isEnabled(extension) {
            if (extension.isUnderDevelopment) {
                // Never disable extensions under development
                return true;
            }
            if (extensions_2.ExtensionIdentifier.equals(extension.identifier, extensionManagementUtil_1.BetterMergeId)) {
                // Check if this is the better merge extension which was migrated to a built-in extension
                return false;
            }
            return this._safeInvokeIsEnabled((0, extensions_1.toExtension)(extension));
        }
        _safeInvokeIsEnabled(extension) {
            try {
                return this._extensionEnablementService.isEnabled(extension);
            }
            catch (err) {
                return false;
            }
        }
        _doHandleExtensionPoints(affectedExtensions) {
            const affectedExtensionPoints = Object.create(null);
            for (let extensionDescription of affectedExtensions) {
                if (extensionDescription.contributes) {
                    for (let extPointName in extensionDescription.contributes) {
                        if (hasOwnProperty.call(extensionDescription.contributes, extPointName)) {
                            affectedExtensionPoints[extPointName] = true;
                        }
                    }
                }
            }
            const messageHandler = (msg) => this._handleExtensionPointMessage(msg);
            const availableExtensions = this._registry.getAllExtensionDescriptions();
            const extensionPoints = extensionsRegistry_1.ExtensionsRegistry.getExtensionPoints();
            perf.mark('code/willHandleExtensionPoints');
            for (const extensionPoint of extensionPoints) {
                if (affectedExtensionPoints[extensionPoint.name]) {
                    AbstractExtensionService._handleExtensionPoint(extensionPoint, availableExtensions, messageHandler);
                }
            }
            perf.mark('code/didHandleExtensionPoints');
        }
        _handleExtensionPointMessage(msg) {
            const extensionKey = extensions_2.ExtensionIdentifier.toKey(msg.extensionId);
            if (!this._extensionsMessages.has(extensionKey)) {
                this._extensionsMessages.set(extensionKey, []);
            }
            this._extensionsMessages.get(extensionKey).push(msg);
            const extension = this._registry.getExtensionDescription(msg.extensionId);
            const strMsg = `[${msg.extensionId.value}]: ${msg.message}`;
            if (extension && extension.isUnderDevelopment) {
                // This message is about the extension currently being developed
                this._showMessageToUser(msg.type, strMsg);
            }
            else {
                this._logMessageInConsole(msg.type, strMsg);
            }
            if (!this._isDev && msg.extensionId) {
                const { type, extensionId, extensionPointId, message } = msg;
                this._telemetryService.publicLog2('extensionsMessage', {
                    type, extensionId: extensionId.value, extensionPointId, message
                });
            }
        }
        static _handleExtensionPoint(extensionPoint, availableExtensions, messageHandler) {
            const users = [];
            for (const desc of availableExtensions) {
                if (desc.contributes && hasOwnProperty.call(desc.contributes, extensionPoint.name)) {
                    users.push({
                        description: desc,
                        value: desc.contributes[extensionPoint.name],
                        collector: new extensionsRegistry_1.ExtensionMessageCollector(messageHandler, desc, extensionPoint.name)
                    });
                }
            }
            extensionPoint.acceptUsers(users);
        }
        _showMessageToUser(severity, msg) {
            if (severity === notification_1.Severity.Error || severity === notification_1.Severity.Warning) {
                this._notificationService.notify({ severity, message: msg });
            }
            else {
                this._logMessageInConsole(severity, msg);
            }
        }
        _logMessageInConsole(severity, msg) {
            if (severity === notification_1.Severity.Error) {
                console.error(msg);
            }
            else if (severity === notification_1.Severity.Warning) {
                console.warn(msg);
            }
            else {
                console.log(msg);
            }
        }
        //#region Called by extension host
        _logOrShowMessage(severity, msg) {
            if (this._isDev) {
                this._showMessageToUser(severity, msg);
            }
            else {
                this._logMessageInConsole(severity, msg);
            }
        }
        async _activateById(extensionId, reason) {
            const results = await Promise.all(this._extensionHostManagers.map(manager => manager.activate(extensionId, reason)));
            const activated = results.some(e => e);
            if (!activated) {
                throw new Error(`Unknown extension ${extensionId.value}`);
            }
        }
        _onWillActivateExtension(extensionId) {
            this._extensionHostActiveExtensions.set(extensions_2.ExtensionIdentifier.toKey(extensionId), extensionId);
        }
        _onDidActivateExtension(extensionId, codeLoadingTime, activateCallTime, activateResolvedTime, activationReason) {
            this._extensionHostActivationTimes.set(extensions_2.ExtensionIdentifier.toKey(extensionId), new extensions_1.ActivationTimes(codeLoadingTime, activateCallTime, activateResolvedTime, activationReason));
            this._onDidChangeExtensionsStatus.fire([extensionId]);
        }
        _onDidActivateExtensionError(extensionId, error) {
            this._telemetryService.publicLog2('extensionActivationError', {
                extensionId: extensionId.value,
                error: error.message
            });
        }
        _onExtensionRuntimeError(extensionId, err) {
            const extensionKey = extensions_2.ExtensionIdentifier.toKey(extensionId);
            if (!this._extensionHostExtensionRuntimeErrors.has(extensionKey)) {
                this._extensionHostExtensionRuntimeErrors.set(extensionKey, []);
            }
            this._extensionHostExtensionRuntimeErrors.get(extensionKey).push(err);
            this._onDidChangeExtensionsStatus.fire([extensionId]);
        }
    };
    AbstractExtensionService = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, notification_1.INotificationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(6, files_1.IFileService),
        __param(7, productService_1.IProductService),
        __param(8, extensionManagement_2.IExtensionManagementService),
        __param(9, workspace_1.IWorkspaceContextService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], AbstractExtensionService);
    exports.AbstractExtensionService = AbstractExtensionService;
    class ExtensionRunningLocationClassifier {
        constructor(getExtensionKind, pickRunningLocation) {
            this.getExtensionKind = getExtensionKind;
            this.pickRunningLocation = pickRunningLocation;
        }
        determineRunningLocation(localExtensions, remoteExtensions) {
            const allExtensionKinds = new Map();
            localExtensions.forEach(ext => allExtensionKinds.set(extensions_2.ExtensionIdentifier.toKey(ext.identifier), this.getExtensionKind(ext)));
            remoteExtensions.forEach(ext => allExtensionKinds.set(extensions_2.ExtensionIdentifier.toKey(ext.identifier), this.getExtensionKind(ext)));
            const localExtensionsSet = new Set();
            localExtensions.forEach(ext => localExtensionsSet.add(extensions_2.ExtensionIdentifier.toKey(ext.identifier)));
            const localUnderDevelopmentExtensionsSet = new Set();
            localExtensions.forEach((ext) => {
                if (ext.isUnderDevelopment) {
                    localUnderDevelopmentExtensionsSet.add(extensions_2.ExtensionIdentifier.toKey(ext.identifier));
                }
            });
            const remoteExtensionsSet = new Set();
            remoteExtensions.forEach(ext => remoteExtensionsSet.add(extensions_2.ExtensionIdentifier.toKey(ext.identifier)));
            const remoteUnderDevelopmentExtensionsSet = new Set();
            remoteExtensions.forEach((ext) => {
                if (ext.isUnderDevelopment) {
                    remoteUnderDevelopmentExtensionsSet.add(extensions_2.ExtensionIdentifier.toKey(ext.identifier));
                }
            });
            const pickRunningLocation = (extensionIdentifier) => {
                const isInstalledLocally = localExtensionsSet.has(extensions_2.ExtensionIdentifier.toKey(extensionIdentifier));
                const isInstalledRemotely = remoteExtensionsSet.has(extensions_2.ExtensionIdentifier.toKey(extensionIdentifier));
                const isLocallyUnderDevelopment = localUnderDevelopmentExtensionsSet.has(extensions_2.ExtensionIdentifier.toKey(extensionIdentifier));
                const isRemotelyUnderDevelopment = remoteUnderDevelopmentExtensionsSet.has(extensions_2.ExtensionIdentifier.toKey(extensionIdentifier));
                let preference = 0 /* None */;
                if (isLocallyUnderDevelopment && !isRemotelyUnderDevelopment) {
                    preference = 1 /* Local */;
                }
                else if (isRemotelyUnderDevelopment && !isLocallyUnderDevelopment) {
                    preference = 2 /* Remote */;
                }
                const extensionKinds = allExtensionKinds.get(extensions_2.ExtensionIdentifier.toKey(extensionIdentifier)) || [];
                return this.pickRunningLocation(extensionKinds, isInstalledLocally, isInstalledRemotely, preference);
            };
            const runningLocation = new Map();
            localExtensions.forEach(ext => runningLocation.set(extensions_2.ExtensionIdentifier.toKey(ext.identifier), pickRunningLocation(ext.identifier)));
            remoteExtensions.forEach(ext => runningLocation.set(extensions_2.ExtensionIdentifier.toKey(ext.identifier), pickRunningLocation(ext.identifier)));
            return runningLocation;
        }
    }
    exports.ExtensionRunningLocationClassifier = ExtensionRunningLocationClassifier;
    let ProposedApiController = class ProposedApiController {
        constructor(_environmentService, productService) {
            this._environmentService = _environmentService;
            // Make enabled proposed API be lowercase for case insensitive comparison
            this.enableProposedApiFor = (_environmentService.extensionEnabledProposedApi || []).map(id => id.toLowerCase());
            this.enableProposedApiForAll =
                !_environmentService.isBuilt || // always allow proposed API when running out of sources
                    (_environmentService.isExtensionDevelopment && productService.quality !== 'stable') || // do not allow proposed API against stable builds when developing an extension
                    (this.enableProposedApiFor.length === 0 && Array.isArray(_environmentService.extensionEnabledProposedApi)); // always allow proposed API if --enable-proposed-api is provided without extension ID
            this.productAllowProposedApi = new Set();
            if ((0, arrays_1.isNonEmptyArray)(productService.extensionAllowedProposedApi)) {
                productService.extensionAllowedProposedApi.forEach((id) => this.productAllowProposedApi.add(extensions_2.ExtensionIdentifier.toKey(id)));
            }
        }
        updateEnableProposedApi(extension) {
            if (this._allowProposedApiFromProduct(extension.identifier)) {
                // fast lane -> proposed api is available to all extensions
                // that are listed in product.json-files
                extension.enableProposedApi = true;
            }
            else if (extension.enableProposedApi && !extension.isBuiltin) {
                if (!this.enableProposedApiForAll &&
                    this.enableProposedApiFor.indexOf(extension.identifier.value.toLowerCase()) < 0) {
                    extension.enableProposedApi = false;
                    console.error(`Extension '${extension.identifier.value} cannot use PROPOSED API (must started out of dev or enabled via --enable-proposed-api)`);
                }
                else if (this._environmentService.isBuilt) {
                    // proposed api is available when developing or when an extension was explicitly
                    // spelled out via a command line argument
                    console.warn(`Extension '${extension.identifier.value}' uses PROPOSED API which is subject to change and removal without notice.`);
                }
            }
        }
        _allowProposedApiFromProduct(id) {
            return this.productAllowProposedApi.has(extensions_2.ExtensionIdentifier.toKey(id));
        }
    };
    ProposedApiController = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, productService_1.IProductService)
    ], ProposedApiController);
    function filterByRunningLocation(extensions, extId, runningLocation, desiredRunningLocation) {
        return extensions.filter(ext => runningLocation.get(extensions_2.ExtensionIdentifier.toKey(extId(ext))) === desiredRunningLocation);
    }
});
//# sourceMappingURL=abstractExtensionService.js.map