/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "graceful-fs", "vs/base/common/network", "vs/platform/files/electron-browser/diskFileSystemProvider", "vs/workbench/services/userData/common/fileUserDataProvider", "vs/workbench/electron-sandbox/shared.desktop.main"], function (require, exports, fs, graceful_fs_1, network_1, diskFileSystemProvider_1, fileUserDataProvider_1, shared_desktop_main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class DesktopMain extends shared_desktop_main_1.SharedDesktopMain {
        constructor(configuration) {
            super(configuration);
            // Enable gracefulFs
            (0, graceful_fs_1.gracefulify)(fs);
        }
        registerFileSystemProviders(environmentService, fileService, logService, nativeHostService) {
            // Local Files
            const diskFileSystemProvider = this._register(new diskFileSystemProvider_1.DiskFileSystemProvider(logService, nativeHostService));
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // User Data Provider
            fileService.registerProvider(network_1.Schemas.userData, new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.userData, logService));
        }
    }
    function main(configuration) {
        const workbench = new DesktopMain(configuration);
        return workbench.open();
    }
    exports.main = main;
});
//# sourceMappingURL=desktop.main.js.map