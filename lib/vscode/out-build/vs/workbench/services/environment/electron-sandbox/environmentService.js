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
define(["require", "exports", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/instantiation", "vs/platform/environment/common/environmentService", "vs/base/common/decorators", "vs/base/common/uri", "vs/base/common/network", "vs/base/common/path"], function (require, exports, environment_1, instantiation_1, environmentService_1, decorators_1, uri_1, network_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkbenchEnvironmentService = exports.INativeWorkbenchEnvironmentService = void 0;
    exports.INativeWorkbenchEnvironmentService = (0, instantiation_1.refineServiceDecorator)(environment_1.IEnvironmentService);
    class NativeWorkbenchEnvironmentService extends environmentService_1.AbstractNativeEnvironmentService {
        constructor(configuration, productService) {
            super(configuration, { homeDir: configuration.homeDir, tmpDir: configuration.tmpDir, userDataDir: configuration.userDataDir }, productService);
            this.configuration = configuration;
        }
        get machineId() { return this.configuration.machineId; }
        get remoteAuthority() { return this.configuration.remoteAuthority; }
        get execPath() { return this.configuration.execPath; }
        get userRoamingDataHome() { return this.appSettingsHome.with({ scheme: network_1.Schemas.userData }); }
        get logFile() { return uri_1.URI.file((0, path_1.join)(this.logsPath, `renderer${this.configuration.windowId}.log`)); }
        get extHostLogsPath() { return uri_1.URI.file((0, path_1.join)(this.logsPath, `exthost${this.configuration.windowId}`)); }
        get webviewExternalEndpoint() { return `${network_1.Schemas.vscodeWebview}://{{uuid}}`; }
        get webviewResourceRoot() {
            // On desktop, this endpoint is only used for the service worker to identify resource loads and
            // should never actually be requested.
            //
            // Required due to https://github.com/electron/electron/issues/28528
            return 'https://{{uuid}}.vscode-webview-test.com/vscode-resource/{{resource}}';
        }
        get webviewCspSource() {
            const uri = uri_1.URI.parse(this.webviewResourceRoot.replace('{{uuid}}', '*'));
            return `${uri.scheme}://${uri.authority}`;
        }
        get skipReleaseNotes() { return !!this.args['skip-release-notes']; }
        get logExtensionHostCommunication() { return !!this.args.logExtensionHostCommunication; }
        get extensionEnabledProposedApi() {
            if (Array.isArray(this.args['enable-proposed-api'])) {
                return this.args['enable-proposed-api'];
            }
            if ('enable-proposed-api' in this.args) {
                return [];
            }
            return undefined;
        }
        get os() {
            return this.configuration.os;
        }
    }
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "machineId", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "remoteAuthority", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "execPath", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "userRoamingDataHome", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "logFile", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "extHostLogsPath", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "webviewExternalEndpoint", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "webviewResourceRoot", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "webviewCspSource", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "skipReleaseNotes", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "logExtensionHostCommunication", null);
    __decorate([
        decorators_1.memoize
    ], NativeWorkbenchEnvironmentService.prototype, "extensionEnabledProposedApi", null);
    exports.NativeWorkbenchEnvironmentService = NativeWorkbenchEnvironmentService;
});
//# sourceMappingURL=environmentService.js.map