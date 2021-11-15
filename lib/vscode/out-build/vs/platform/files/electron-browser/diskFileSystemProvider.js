/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/node/diskFileSystemProvider", "vs/base/common/platform", "vs/nls!vs/platform/files/electron-browser/diskFileSystemProvider", "vs/base/common/path"], function (require, exports, diskFileSystemProvider_1, platform_1, nls_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DiskFileSystemProvider = void 0;
    class DiskFileSystemProvider extends diskFileSystemProvider_1.DiskFileSystemProvider {
        constructor(logService, nativeHostService, options) {
            super(logService, options);
            this.nativeHostService = nativeHostService;
        }
        get capabilities() {
            if (!this._capabilities) {
                this._capabilities = super.capabilities | 4096 /* Trash */;
            }
            return this._capabilities;
        }
        async doDelete(filePath, opts) {
            if (!opts.useTrash) {
                return super.doDelete(filePath, opts);
            }
            const result = await this.nativeHostService.moveItemToTrash(filePath);
            if (!result) {
                throw new Error(platform_1.isWindows ? (0, nls_1.localize)(0, null, (0, path_1.basename)(filePath)) : (0, nls_1.localize)(1, null, (0, path_1.basename)(filePath)));
            }
        }
    }
    exports.DiskFileSystemProvider = DiskFileSystemProvider;
});
//# sourceMappingURL=diskFileSystemProvider.js.map