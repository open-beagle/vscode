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
define(["require", "exports", "vs/base/common/event", "vs/base/common/labels", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/nls!vs/workbench/services/workspaces/common/workspaceTrust", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspaces/common/workspaces", "vs/workbench/services/uriIdentity/common/uriIdentity"], function (require, exports, event_1, labels_1, lifecycle_1, network_1, platform_1, resources_1, uri_1, nls_1, configuration_1, contextkey_1, environment_1, extensions_1, storage_1, workspace_1, workspaceTrust_1, workspaces_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTrustRequestService = exports.WorkspaceTrustManagementService = exports.isWorkspaceTrustEnabled = exports.WorkspaceTrustContext = exports.WORKSPACE_TRUST_STORAGE_KEY = exports.WORKSPACE_TRUST_EXTENSION_SUPPORT = exports.WORKSPACE_TRUST_STARTUP_PROMPT = exports.WORKSPACE_TRUST_ENABLED = void 0;
    exports.WORKSPACE_TRUST_ENABLED = 'security.workspace.trust.enabled';
    exports.WORKSPACE_TRUST_STARTUP_PROMPT = 'security.workspace.trust.startupPrompt';
    exports.WORKSPACE_TRUST_EXTENSION_SUPPORT = 'extensions.supportUntrustedWorkspaces';
    exports.WORKSPACE_TRUST_STORAGE_KEY = 'content.trust.model.key';
    exports.WorkspaceTrustContext = {
        PendingRequest: new contextkey_1.RawContextKey('workspaceTrustPendingRequest', false),
        IsTrusted: new contextkey_1.RawContextKey('isWorkspaceTrusted', false, (0, nls_1.localize)(0, null))
    };
    function isWorkspaceTrustEnabled(configurationService) {
        var _a;
        if (platform_1.isWeb) {
            return false;
        }
        return (_a = configurationService.inspect(exports.WORKSPACE_TRUST_ENABLED).userValue) !== null && _a !== void 0 ? _a : false;
    }
    exports.isWorkspaceTrustEnabled = isWorkspaceTrustEnabled;
    let WorkspaceTrustManagementService = class WorkspaceTrustManagementService extends lifecycle_1.Disposable {
        constructor(configurationService, environmentService, storageService, uriIdentityService, workspaceService) {
            super();
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.storageService = storageService;
            this.uriIdentityService = uriIdentityService;
            this.workspaceService = workspaceService;
            this.storageKey = exports.WORKSPACE_TRUST_STORAGE_KEY;
            this._onDidChangeTrust = this._register(new event_1.Emitter());
            this.onDidChangeTrust = this._onDidChangeTrust.event;
            this._onDidChangeTrustedFolders = this._register(new event_1.Emitter());
            this.onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
            this._isWorkspaceTrusted = false;
            this._trustStateInfo = this.loadTrustInfo();
            this._isWorkspaceTrusted = this.calculateWorkspaceTrust();
            this.registerListeners();
        }
        set currentTrustState(trusted) {
            if (this._isWorkspaceTrusted === trusted) {
                return;
            }
            this._isWorkspaceTrusted = trusted;
            this._onDidChangeTrust.fire(trusted);
        }
        registerListeners() {
            this._register(this.workspaceService.onDidChangeWorkspaceFolders(() => this.currentTrustState = this.calculateWorkspaceTrust()));
            this._register(this.workspaceService.onDidChangeWorkbenchState(() => this.currentTrustState = this.calculateWorkspaceTrust()));
            this._register(this.storageService.onDidChangeValue(changeEvent => {
                if (changeEvent.key === this.storageKey) {
                    this._trustStateInfo = this.loadTrustInfo();
                    this.currentTrustState = this.calculateWorkspaceTrust();
                    this._onDidChangeTrustedFolders.fire();
                }
            }));
        }
        loadTrustInfo() {
            const infoAsString = this.storageService.get(this.storageKey, 0 /* GLOBAL */);
            let result;
            try {
                if (infoAsString) {
                    result = JSON.parse(infoAsString);
                }
            }
            catch (_a) { }
            if (!result) {
                result = {
                    uriTrustInfo: []
                };
            }
            if (!result.uriTrustInfo) {
                result.uriTrustInfo = [];
            }
            result.uriTrustInfo = result.uriTrustInfo.map(info => { return { uri: uri_1.URI.revive(info.uri), trusted: info.trusted }; });
            result.uriTrustInfo = result.uriTrustInfo.filter(info => info.trusted);
            return result;
        }
        saveTrustInfo() {
            this.storageService.store(this.storageKey, JSON.stringify(this._trustStateInfo), 0 /* GLOBAL */, 1 /* MACHINE */);
        }
        calculateWorkspaceTrust() {
            if (!isWorkspaceTrustEnabled(this.configurationService)) {
                return true;
            }
            if (this.environmentService.extensionTestsLocationURI) {
                return true; // trust running tests with vscode-test
            }
            if (this.workspaceService.getWorkbenchState() === 1 /* EMPTY */) {
                return true;
            }
            const workspaceFolders = this.getWorkspaceFolders();
            const trusted = this.getFoldersTrust(workspaceFolders);
            return trusted;
        }
        getFoldersTrust(folders) {
            let state = true;
            for (const folder of folders) {
                const { trusted } = this.getFolderTrustInfo(folder);
                if (!trusted) {
                    state = trusted;
                    return state;
                }
            }
            return state;
        }
        getWorkspaceFolders() {
            const folderURIs = this.workspaceService.getWorkspace().folders.map(f => f.uri);
            const workspaceConfiguration = this.workspaceService.getWorkspace().configuration;
            if (workspaceConfiguration && !(0, workspaces_1.isUntitledWorkspace)(workspaceConfiguration, this.environmentService)) {
                folderURIs.push((0, resources_1.dirname)(workspaceConfiguration));
            }
            return folderURIs;
        }
        getFolderTrustInfo(folder) {
            let resultState = false;
            let maxLength = -1;
            let resultUri = folder;
            for (const trustInfo of this._trustStateInfo.uriTrustInfo) {
                if (this.uriIdentityService.extUri.isEqualOrParent(folder, trustInfo.uri)) {
                    const fsPath = trustInfo.uri.fsPath;
                    if (fsPath.length > maxLength) {
                        maxLength = fsPath.length;
                        resultState = trustInfo.trusted;
                        resultUri = trustInfo.uri;
                    }
                }
            }
            return { trusted: resultState, uri: resultUri };
        }
        setFoldersTrust(folders, trusted) {
            let changed = false;
            for (const folder of folders) {
                if (trusted) {
                    const foundItem = this._trustStateInfo.uriTrustInfo.find(trustInfo => this.uriIdentityService.extUri.isEqual(trustInfo.uri, folder));
                    if (!foundItem) {
                        this._trustStateInfo.uriTrustInfo.push({ uri: folder, trusted: true });
                        changed = true;
                    }
                }
                else {
                    const previousLength = this._trustStateInfo.uriTrustInfo.length;
                    this._trustStateInfo.uriTrustInfo = this._trustStateInfo.uriTrustInfo.filter(trustInfo => !this.uriIdentityService.extUri.isEqual(trustInfo.uri, folder));
                    if (previousLength !== this._trustStateInfo.uriTrustInfo.length) {
                        changed = true;
                    }
                }
            }
            if (changed) {
                this.saveTrustInfo();
            }
        }
        canSetWorkspaceTrust() {
            return this.workspaceService.getWorkbenchState() !== 1 /* EMPTY */;
        }
        canSetParentFolderTrust() {
            const workspaceIdentifier = (0, workspaces_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace());
            return (0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier) && workspaceIdentifier.uri.scheme === network_1.Schemas.file;
        }
        isWorkpaceTrusted() {
            return this._isWorkspaceTrusted;
        }
        setParentFolderTrust(trusted) {
            const workspaceIdentifier = (0, workspaces_1.toWorkspaceIdentifier)(this.workspaceService.getWorkspace());
            if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(workspaceIdentifier) && workspaceIdentifier.uri.scheme === network_1.Schemas.file) {
                const { parentPath } = (0, labels_1.splitName)(workspaceIdentifier.uri.fsPath);
                this.setFoldersTrust([uri_1.URI.file(parentPath)], trusted);
            }
        }
        setWorkspaceTrust(trusted) {
            const workspaceFolders = this.getWorkspaceFolders();
            this.setFoldersTrust(workspaceFolders, trusted);
        }
        getTrustedFolders() {
            return this._trustStateInfo.uriTrustInfo.map(info => info.uri);
        }
        setTrustedFolders(folders) {
            this._trustStateInfo.uriTrustInfo = [];
            for (const folder of folders) {
                this._trustStateInfo.uriTrustInfo.push({
                    trusted: true,
                    uri: folder
                });
            }
            this.saveTrustInfo();
        }
    };
    WorkspaceTrustManagementService = __decorate([
        __param(0, configuration_1.IConfigurationService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, storage_1.IStorageService),
        __param(3, uriIdentity_1.IUriIdentityService),
        __param(4, workspace_1.IWorkspaceContextService)
    ], WorkspaceTrustManagementService);
    exports.WorkspaceTrustManagementService = WorkspaceTrustManagementService;
    let WorkspaceTrustRequestService = class WorkspaceTrustRequestService extends lifecycle_1.Disposable {
        constructor(contextKeyService, workspaceTrustManagementService) {
            super();
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this._onDidInitiateWorkspaceTrustRequest = this._register(new event_1.Emitter());
            this.onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
            this._onDidCompleteWorkspaceTrustRequest = this._register(new event_1.Emitter());
            this.onDidCompleteWorkspaceTrustRequest = this._onDidCompleteWorkspaceTrustRequest.event;
            this._register(this.workspaceTrustManagementService.onDidChangeTrust(trusted => this.onTrustStateChanged(trusted)));
            this._ctxWorkspaceTrustState = exports.WorkspaceTrustContext.IsTrusted.bindTo(contextKeyService);
            this._ctxWorkspaceTrustPendingRequest = exports.WorkspaceTrustContext.PendingRequest.bindTo(contextKeyService);
            this.trusted = this.workspaceTrustManagementService.isWorkpaceTrusted();
        }
        get trusted() {
            return this._trusted;
        }
        set trusted(trusted) {
            this._trusted = trusted;
            this._ctxWorkspaceTrustState.set(trusted);
        }
        onTrustStateChanged(trusted) {
            // Resolve any pending soft requests for workspace trust
            if (this._trustRequestResolver) {
                this._trustRequestResolver(trusted);
                this._trustRequestResolver = undefined;
                this._trustRequestPromise = undefined;
            }
            // Update context if there are no pending requests
            if (!this._modalTrustRequestPromise && !this._trustRequestPromise) {
                this._ctxWorkspaceTrustPendingRequest.set(false);
            }
            this.trusted = trusted;
        }
        cancelRequest() {
            if (this._modalTrustRequestResolver) {
                this._modalTrustRequestResolver(undefined);
                this._modalTrustRequestResolver = undefined;
                this._modalTrustRequestPromise = undefined;
            }
        }
        completeRequest(trusted) {
            if (this._modalTrustRequestResolver) {
                this._modalTrustRequestResolver(trusted !== null && trusted !== void 0 ? trusted : this.trusted);
                this._modalTrustRequestResolver = undefined;
                this._modalTrustRequestPromise = undefined;
            }
            if (this._trustRequestResolver) {
                this._trustRequestResolver(trusted !== null && trusted !== void 0 ? trusted : this.trusted);
                this._trustRequestResolver = undefined;
                this._trustRequestPromise = undefined;
            }
            if (trusted === undefined) {
                return;
            }
            this.workspaceTrustManagementService.setWorkspaceTrust(trusted);
            this._onDidCompleteWorkspaceTrustRequest.fire(trusted);
        }
        async requestWorkspaceTrust(options = { modal: false }) {
            // Trusted workspace
            if (this.trusted) {
                return this.trusted;
            }
            if (options.modal) {
                // Modal request
                if (!this._modalTrustRequestPromise) {
                    // Create promise
                    this._modalTrustRequestPromise = new Promise(resolve => {
                        this._modalTrustRequestResolver = resolve;
                    });
                }
                else {
                    // Return existing promise
                    return this._modalTrustRequestPromise;
                }
            }
            else {
                // Soft request
                if (!this._trustRequestPromise) {
                    // Create promise
                    this._trustRequestPromise = new Promise(resolve => {
                        this._trustRequestResolver = resolve;
                    });
                }
                else {
                    // Return existing promise
                    return this._trustRequestPromise;
                }
            }
            this._ctxWorkspaceTrustPendingRequest.set(true);
            this._onDidInitiateWorkspaceTrustRequest.fire(options);
            return options.modal ? this._modalTrustRequestPromise : this._trustRequestPromise;
        }
    };
    WorkspaceTrustRequestService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], WorkspaceTrustRequestService);
    exports.WorkspaceTrustRequestService = WorkspaceTrustRequestService;
    (0, extensions_1.registerSingleton)(workspaceTrust_1.IWorkspaceTrustRequestService, WorkspaceTrustRequestService);
});
//# sourceMappingURL=workspaceTrust.js.map