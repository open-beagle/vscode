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
define(["require", "exports", "vs/base/common/network", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/extpath", "vs/platform/log/common/log"], function (require, exports, network_1, resources_1, uri_1, uuid_1, decorators_1, errors_1, extpath_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserWorkbenchEnvironmentService = void 0;
    class BrowserWorkbenchConfiguration {
        constructor(options, payload) {
            this.options = options;
            this.payload = payload;
        }
        get sessionId() { return (0, uuid_1.generateUuid)(); }
        get remoteAuthority() { return this.options.remoteAuthority; }
        get filesToOpenOrCreate() {
            if (this.payload) {
                const fileToOpen = this.payload.get('openFile');
                if (fileToOpen) {
                    const fileUri = uri_1.URI.parse(fileToOpen);
                    // Support: --goto parameter to open on line/col
                    if (this.payload.has('gotoLineMode')) {
                        const pathColumnAware = (0, extpath_1.parseLineAndColumnAware)(fileUri.path);
                        return [{
                                fileUri: fileUri.with({ path: pathColumnAware.path }),
                                lineNumber: pathColumnAware.line,
                                columnNumber: pathColumnAware.column
                            }];
                    }
                    return [{ fileUri }];
                }
            }
            return undefined;
        }
        get filesToDiff() {
            if (this.payload) {
                const fileToDiffPrimary = this.payload.get('diffFilePrimary');
                const fileToDiffSecondary = this.payload.get('diffFileSecondary');
                if (fileToDiffPrimary && fileToDiffSecondary) {
                    return [
                        { fileUri: uri_1.URI.parse(fileToDiffSecondary) },
                        { fileUri: uri_1.URI.parse(fileToDiffPrimary) }
                    ];
                }
            }
            return undefined;
        }
        get colorScheme() {
            return { dark: false, highContrast: false };
        }
    }
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchConfiguration.prototype, "sessionId", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchConfiguration.prototype, "remoteAuthority", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchConfiguration.prototype, "filesToOpenOrCreate", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchConfiguration.prototype, "filesToDiff", null);
    class BrowserWorkbenchEnvironmentService {
        constructor(options, productService) {
            this.options = options;
            this.productService = productService;
            this._configuration = undefined;
            this._extensionHostDebugEnvironment = undefined;
            if (options.workspaceProvider && Array.isArray(options.workspaceProvider.payload)) {
                try {
                    this.payload = new Map(options.workspaceProvider.payload);
                }
                catch (error) {
                    (0, errors_1.onUnexpectedError)(error); // possible invalid payload for map
                }
            }
        }
        get configuration() {
            if (!this._configuration) {
                this._configuration = new BrowserWorkbenchConfiguration(this.options, this.payload);
            }
            return this._configuration;
        }
        get remoteAuthority() { return this.options.remoteAuthority; }
        get isBuilt() { return !!this.productService.commit; }
        get logsPath() { return this.options.logsPath.path; }
        get logLevel() { var _a, _b, _c; return ((_a = this.payload) === null || _a === void 0 ? void 0 : _a.get('logLevel')) || (((_b = this.options.developmentOptions) === null || _b === void 0 ? void 0 : _b.logLevel) !== undefined ? (0, log_1.LogLevelToString)((_c = this.options.developmentOptions) === null || _c === void 0 ? void 0 : _c.logLevel) : undefined); }
        get logFile() { return (0, resources_1.joinPath)(this.options.logsPath, 'window.log'); }
        // NOTE@coder: Use the same path in // ../../../../platform/environment/node/environmentService.ts
        // and don't use the user data scheme. This solves two problems:
        //  1. Extensions running in the browser (like Vim) might use these paths
        //     directly instead of using the file service and most likely can't write
        //     to `/User` on disk.
        //  2. Settings will be stored in the file system instead of in browser
        //     storage. Using browser storage makes sharing or seeding settings
        //     between browsers difficult. We may want to revisit this once/if we get
        //     settings sync.
        get userRoamingDataHome() { return (0, resources_1.joinPath)(uri_1.URI.file(this.userDataPath).with({ scheme: network_1.Schemas.vscodeRemote }), 'User'); }
        get userDataPath() {
            var _a;
            const dataPath = (_a = this.payload) === null || _a === void 0 ? void 0 : _a.get('userDataPath');
            if (!dataPath) {
                throw new Error('userDataPath was not provided to environment service');
            }
            return dataPath;
        }
        get settingsResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'settings.json'); }
        get argvResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'argv.json'); }
        get snippetsHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'snippets'); }
        get globalStorageHome() { return uri_1.URI.joinPath(this.userRoamingDataHome, 'globalStorage'); }
        get workspaceStorageHome() { return uri_1.URI.joinPath(this.userRoamingDataHome, 'workspaceStorage'); }
        /*
         * In Web every workspace can potentially have scoped user-data and/or extensions and if Sync state is shared then it can make
         * Sync error prone - say removing extensions from another workspace. Hence scope Sync state per workspace.
         * Sync scoped to a workspace is capable of handling opening same workspace in multiple windows.
         */
        get userDataSyncHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'sync', this.options.workspaceId); }
        get userDataSyncLogResource() { return (0, resources_1.joinPath)(this.options.logsPath, 'userDataSync.log'); }
        get sync() { return undefined; }
        get keybindingsResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'keybindings.json'); }
        get keyboardLayoutResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'keyboardLayout.json'); }
        get untitledWorkspacesHome() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'Workspaces'); }
        get serviceMachineIdResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'machineid'); }
        get extHostLogsPath() { return (0, resources_1.joinPath)(this.options.logsPath, 'exthost'); }
        get debugExtensionHost() {
            if (!this._extensionHostDebugEnvironment) {
                this._extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this._extensionHostDebugEnvironment.params;
        }
        get isExtensionDevelopment() {
            if (!this._extensionHostDebugEnvironment) {
                this._extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this._extensionHostDebugEnvironment.isExtensionDevelopment;
        }
        get extensionDevelopmentLocationURI() {
            if (!this._extensionHostDebugEnvironment) {
                this._extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this._extensionHostDebugEnvironment.extensionDevelopmentLocationURI;
        }
        get extensionDevelopmentLocationKind() {
            if (!this._extensionHostDebugEnvironment) {
                this._extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this._extensionHostDebugEnvironment.extensionDevelopmentKind;
        }
        get extensionTestsLocationURI() {
            if (!this._extensionHostDebugEnvironment) {
                this._extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this._extensionHostDebugEnvironment.extensionTestsLocationURI;
        }
        get extensionEnabledProposedApi() {
            if (!this._extensionHostDebugEnvironment) {
                this._extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this._extensionHostDebugEnvironment.extensionEnabledProposedApi;
        }
        get debugRenderer() {
            if (!this._extensionHostDebugEnvironment) {
                this._extensionHostDebugEnvironment = this.resolveExtensionHostDebugEnvironment();
            }
            return this._extensionHostDebugEnvironment.debugRenderer;
        }
        get disableExtensions() { var _a; return ((_a = this.payload) === null || _a === void 0 ? void 0 : _a.get('disableExtensions')) === 'true'; }
        get webviewEndpoint() {
            // TODO@matt: get fallback from product service
            return this.options.webviewEndpoint || 'https://{{uuid}}.vscode-webview-test.com/{{commit}}';
        }
        get webviewExternalEndpoint() {
            return (this.webviewEndpoint).replace('{{commit}}', this.productService.commit || '23a2409675bc1bde94f3532bc7c5826a6e99e4b6');
        }
        get webviewResourceRoot() {
            return `${this.webviewExternalEndpoint}/vscode-resource/{{resource}}`;
        }
        get webviewCspSource() {
            const uri = uri_1.URI.parse(this.webviewEndpoint.replace('{{uuid}}', '*'));
            return `${uri.scheme}://${uri.authority}`;
        }
        get telemetryLogResource() { return (0, resources_1.joinPath)(this.options.logsPath, 'telemetry.log'); }
        get disableTelemetry() { return false; }
        get verbose() { var _a; return ((_a = this.payload) === null || _a === void 0 ? void 0 : _a.get('verbose')) === 'true'; }
        get logExtensionHostCommunication() { var _a; return ((_a = this.payload) === null || _a === void 0 ? void 0 : _a.get('logExtensionHostCommunication')) === 'true'; }
        get skipReleaseNotes() { return false; }
        resolveExtensionHostDebugEnvironment() {
            var _a;
            const extensionHostDebugEnvironment = {
                params: {
                    port: null,
                    break: false
                },
                debugRenderer: false,
                isExtensionDevelopment: false,
                extensionDevelopmentLocationURI: undefined,
                extensionDevelopmentKind: undefined
            };
            const developmentOptions = this.options.developmentOptions;
            if (developmentOptions) {
                if ((_a = developmentOptions.extensions) === null || _a === void 0 ? void 0 : _a.length) {
                    extensionHostDebugEnvironment.extensionDevelopmentLocationURI = developmentOptions.extensions.map(e => uri_1.URI.revive(e.extensionLocation));
                    extensionHostDebugEnvironment.isExtensionDevelopment = true;
                }
                if (developmentOptions) {
                    extensionHostDebugEnvironment.extensionTestsLocationURI = uri_1.URI.revive(developmentOptions.extensionTestsPath);
                }
            }
            // Fill in selected extra environmental properties
            if (this.payload) {
                for (const [key, value] of this.payload) {
                    switch (key) {
                        case 'extensionDevelopmentPath':
                            if (!extensionHostDebugEnvironment.extensionDevelopmentLocationURI) {
                                extensionHostDebugEnvironment.extensionDevelopmentLocationURI = [];
                            }
                            extensionHostDebugEnvironment.extensionDevelopmentLocationURI.push(uri_1.URI.parse(value));
                            extensionHostDebugEnvironment.isExtensionDevelopment = true;
                            break;
                        case 'extensionDevelopmentKind':
                            extensionHostDebugEnvironment.extensionDevelopmentKind = [value];
                            break;
                        case 'extensionTestsPath':
                            extensionHostDebugEnvironment.extensionTestsLocationURI = uri_1.URI.parse(value);
                            break;
                        case 'debugRenderer':
                            extensionHostDebugEnvironment.debugRenderer = value === 'true';
                            break;
                        case 'debugId':
                            extensionHostDebugEnvironment.params.debugId = value;
                            break;
                        case 'inspect-brk-extensions':
                            extensionHostDebugEnvironment.params.port = parseInt(value);
                            extensionHostDebugEnvironment.params.break = true;
                            break;
                        case 'inspect-extensions':
                            extensionHostDebugEnvironment.params.port = parseInt(value);
                            break;
                        case 'enableProposedApi':
                            try {
                                extensionHostDebugEnvironment.extensionEnabledProposedApi = JSON.parse(value);
                            }
                            catch (error) {
                                console.error(error);
                                extensionHostDebugEnvironment.extensionEnabledProposedApi = [];
                            }
                            break;
                    }
                }
            }
            return extensionHostDebugEnvironment;
        }
    }
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "remoteAuthority", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "isBuilt", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "logsPath", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "logLevel", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "logFile", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "userRoamingDataHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "userDataPath", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "settingsResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "argvResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "snippetsHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "globalStorageHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "workspaceStorageHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "userDataSyncHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "userDataSyncLogResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "sync", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "keybindingsResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "keyboardLayoutResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "untitledWorkspacesHome", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "serviceMachineIdResource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "extHostLogsPath", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "webviewResourceRoot", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "webviewCspSource", null);
    __decorate([
        decorators_1.memoize
    ], BrowserWorkbenchEnvironmentService.prototype, "telemetryLogResource", null);
    exports.BrowserWorkbenchEnvironmentService = BrowserWorkbenchEnvironmentService;
});
//# sourceMappingURL=environmentService.js.map