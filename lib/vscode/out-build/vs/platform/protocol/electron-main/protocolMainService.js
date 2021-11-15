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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/uri", "vs/platform/environment/common/environment", "electron", "vs/platform/log/common/log", "vs/base/common/map", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uuid"], function (require, exports, lifecycle_1, network_1, uri_1, environment_1, electron_1, log_1, map_1, platform_1, resources_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProtocolMainService = void 0;
    let ProtocolMainService = class ProtocolMainService extends lifecycle_1.Disposable {
        constructor(environmentService, logService) {
            super();
            this.logService = logService;
            this.validRoots = map_1.TernarySearchTree.forUris(() => !platform_1.isLinux);
            this.validExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp']); // https://github.com/microsoft/vscode/issues/119384
            // Define an initial set of roots we allow loading from
            // - appRoot	: all files installed as part of the app
            // - extensions : all files shipped from extensions
            // - storage    : all files in global and workspace storage (https://github.com/microsoft/vscode/issues/116735)
            this.addValidFileRoot(uri_1.URI.file(environmentService.appRoot));
            this.addValidFileRoot(uri_1.URI.file(environmentService.extensionsPath));
            this.addValidFileRoot(environmentService.globalStorageHome);
            this.addValidFileRoot(environmentService.workspaceStorageHome);
            // Handle protocols
            this.handleProtocols();
        }
        handleProtocols() {
            const { defaultSession } = electron_1.session;
            // Register vscode-file:// handler
            defaultSession.protocol.registerFileProtocol(network_1.Schemas.vscodeFileResource, (request, callback) => this.handleResourceRequest(request, callback));
            // Intercept any file:// access
            defaultSession.protocol.interceptFileProtocol(network_1.Schemas.file, (request, callback) => this.handleFileRequest(request, callback));
            // Cleanup
            this._register((0, lifecycle_1.toDisposable)(() => {
                defaultSession.protocol.unregisterProtocol(network_1.Schemas.vscodeFileResource);
                defaultSession.protocol.uninterceptProtocol(network_1.Schemas.file);
            }));
        }
        addValidFileRoot(root) {
            if (!this.validRoots.get(root)) {
                this.validRoots.set(root, true);
                return (0, lifecycle_1.toDisposable)(() => this.validRoots.delete(root));
            }
            return lifecycle_1.Disposable.None;
        }
        //#region file://
        handleFileRequest(request, callback) {
            const fileUri = uri_1.URI.parse(request.url);
            // isPreferringBrowserCodeLoad: false
            if (!platform_1.isPreferringBrowserCodeLoad) {
                // first check by validRoots
                if (this.validRoots.findSubstr(fileUri)) {
                    return callback({
                        path: fileUri.fsPath
                    });
                }
                // then check by validExtensions
                if (this.validExtensions.has((0, resources_1.extname)(fileUri))) {
                    return callback({
                        path: fileUri.fsPath
                    });
                }
                // finally block to load the resource
                this.logService.error(`${network_1.Schemas.file}: Refused to load resource ${fileUri.fsPath} from ${network_1.Schemas.file}: protocol (original URL: ${request.url})`);
                return callback({ error: -3 /* ABORTED */ });
            }
            // isPreferringBrowserCodeLoad: true
            // => block any file request
            else {
                this.logService.error(`Refused to load resource ${fileUri.fsPath} from ${network_1.Schemas.file}: protocol (original URL: ${request.url})`);
                return callback({ error: -3 /* ABORTED */ });
            }
        }
        //#endregion
        //#region vscode-file://
        handleResourceRequest(request, callback) {
            const uri = uri_1.URI.parse(request.url);
            // Restore the `vscode-file` URI to a `file` URI so that we can
            // ensure the root is valid and properly tell Chrome where the
            // resource is at.
            const fileUri = network_1.FileAccess.asFileUri(uri);
            // first check by validRoots
            if (this.validRoots.findSubstr(fileUri)) {
                return callback({
                    path: fileUri.fsPath
                });
            }
            // then check by validExtensions
            if (this.validExtensions.has((0, resources_1.extname)(fileUri))) {
                return callback({
                    path: fileUri.fsPath
                });
            }
            // finally block to load the resource
            this.logService.error(`${network_1.Schemas.vscodeFileResource}: Refused to load resource ${fileUri.fsPath} from ${network_1.Schemas.vscodeFileResource}: protocol (original URL: ${request.url})`);
            return callback({ error: -3 /* ABORTED */ });
        }
        //#endregion
        //#region IPC Object URLs
        createIPCObjectUrl(obj) {
            // Create unique URI
            const resource = uri_1.URI.from({
                scheme: 'vscode',
                path: (0, uuid_1.generateUuid)()
            });
            // Install IPC handler
            const channel = resource.toString();
            const handler = async () => obj;
            electron_1.ipcMain.handle(channel, handler);
            this.logService.trace(`IPC Object URL: Registered new channel ${channel}.`);
            return {
                resource,
                update: updatedObj => obj = updatedObj,
                dispose: () => {
                    this.logService.trace(`IPC Object URL: Removed channel ${channel}.`);
                    electron_1.ipcMain.removeHandler(channel);
                }
            };
        }
    };
    ProtocolMainService = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, log_1.ILogService)
    ], ProtocolMainService);
    exports.ProtocolMainService = ProtocolMainService;
});
//# sourceMappingURL=protocolMainService.js.map