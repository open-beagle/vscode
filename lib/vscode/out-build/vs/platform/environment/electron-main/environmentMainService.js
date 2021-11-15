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
define(["require", "exports", "vs/base/common/path", "vs/base/common/decorators", "vs/platform/instantiation/common/instantiation", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/base/parts/ipc/node/ipc.net"], function (require, exports, path_1, decorators_1, instantiation_1, environment_1, environmentService_1, ipc_net_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentMainService = exports.IEnvironmentMainService = void 0;
    exports.IEnvironmentMainService = (0, instantiation_1.refineServiceDecorator)(environment_1.IEnvironmentService);
    class EnvironmentMainService extends environmentService_1.NativeEnvironmentService {
        get cachedLanguagesPath() { return (0, path_1.join)(this.userDataPath, 'clp'); }
        get backupHome() { return (0, path_1.join)(this.userDataPath, 'Backups'); }
        get backupWorkspacesPath() { return (0, path_1.join)(this.backupHome, 'workspaces.json'); }
        get mainIPCHandle() { return (0, ipc_net_1.createStaticIPCHandle)(this.userDataPath, 'main', this.productService.version); }
        get sandbox() { return !!this.args['__sandbox']; }
        get driverVerbose() { return !!this.args['driver-verbose']; }
        get disableUpdates() { return !!this.args['disable-updates']; }
        get disableKeytar() { return !!this.args['disable-keytar']; }
        get nodeCachedDataDir() { return process.env['VSCODE_NODE_CACHED_DATA_DIR'] || undefined; }
        get chromeCachedDataDir() { return (0, path_1.join)(this.userDataPath, 'Code Cache'); }
    }
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "cachedLanguagesPath", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "backupHome", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "backupWorkspacesPath", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "mainIPCHandle", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "sandbox", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "driverVerbose", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "disableUpdates", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "disableKeytar", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "nodeCachedDataDir", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "chromeCachedDataDir", null);
    exports.EnvironmentMainService = EnvironmentMainService;
});
//# sourceMappingURL=environmentMainService.js.map