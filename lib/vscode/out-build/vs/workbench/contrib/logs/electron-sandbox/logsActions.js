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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/path", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/logs/electron-sandbox/logsActions", "vs/platform/native/electron-sandbox/native", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/files/common/files"], function (require, exports, actions_1, path_1, uri_1, nls, native_1, environmentService_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenExtensionLogsFolderAction = exports.OpenLogsFolderAction = void 0;
    let OpenLogsFolderAction = class OpenLogsFolderAction extends actions_1.Action {
        constructor(id, label, environmentService, nativeHostService) {
            super(id, label);
            this.environmentService = environmentService;
            this.nativeHostService = nativeHostService;
        }
        run() {
            return this.nativeHostService.showItemInFolder(uri_1.URI.file((0, path_1.join)(this.environmentService.logsPath, 'main.log')).fsPath);
        }
    };
    OpenLogsFolderAction.ID = 'workbench.action.openLogsFolder';
    OpenLogsFolderAction.LABEL = nls.localize(0, null);
    OpenLogsFolderAction = __decorate([
        __param(2, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(3, native_1.INativeHostService)
    ], OpenLogsFolderAction);
    exports.OpenLogsFolderAction = OpenLogsFolderAction;
    let OpenExtensionLogsFolderAction = class OpenExtensionLogsFolderAction extends actions_1.Action {
        constructor(id, label, environmentSerice, fileService, nativeHostService) {
            super(id, label);
            this.environmentSerice = environmentSerice;
            this.fileService = fileService;
            this.nativeHostService = nativeHostService;
        }
        async run() {
            const folderStat = await this.fileService.resolve(this.environmentSerice.extHostLogsPath);
            if (folderStat.children && folderStat.children[0]) {
                return this.nativeHostService.showItemInFolder(folderStat.children[0].resource.fsPath);
            }
        }
    };
    OpenExtensionLogsFolderAction.ID = 'workbench.action.openExtensionLogsFolder';
    OpenExtensionLogsFolderAction.LABEL = nls.localize(1, null);
    OpenExtensionLogsFolderAction = __decorate([
        __param(2, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, native_1.INativeHostService)
    ], OpenExtensionLogsFolderAction);
    exports.OpenExtensionLogsFolderAction = OpenExtensionLogsFolderAction;
});
//# sourceMappingURL=logsActions.js.map