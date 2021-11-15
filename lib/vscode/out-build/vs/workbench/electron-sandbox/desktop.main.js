/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/workbench/services/userData/common/fileUserDataProvider", "vs/workbench/electron-sandbox/sandbox.simpleservices", "vs/workbench/electron-sandbox/shared.desktop.main"], function (require, exports, network_1, fileUserDataProvider_1, sandbox_simpleservices_1, shared_desktop_main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    class DesktopMain extends shared_desktop_main_1.SharedDesktopMain {
        constructor(configuration) {
            var _a, _b;
            super(Object.assign(Object.assign({}, configuration), { workspace: { id: (_b = (_a = configuration.workspace) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '4064f6ec-cb38-4ad0-af64-ee6467e63c82', uri: sandbox_simpleservices_1.simpleWorkspaceDir } }));
        }
        registerFileSystemProviders(environmentService, fileService, logService) {
            // Local Files
            fileService.registerProvider(network_1.Schemas.file, sandbox_simpleservices_1.simpleFileSystemProvider);
            // User Data Provider
            fileService.registerProvider(network_1.Schemas.userData, new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, sandbox_simpleservices_1.simpleFileSystemProvider, network_1.Schemas.userData, logService));
            // Init our in-memory file system
            return (0, sandbox_simpleservices_1.initFileSystem)(environmentService, fileService);
        }
    }
    function main(configuration) {
        const workbench = new DesktopMain(configuration);
        return workbench.open();
    }
    exports.main = main;
});
//# sourceMappingURL=desktop.main.js.map