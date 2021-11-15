/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/ipcFileSystemProvider"], function (require, exports, ipcFileSystemProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteFileSystemProvider = exports.REMOTE_FILE_SYSTEM_CHANNEL_NAME = void 0;
    exports.REMOTE_FILE_SYSTEM_CHANNEL_NAME = 'remotefilesystem';
    class RemoteFileSystemProvider extends ipcFileSystemProvider_1.IPCFileSystemProvider {
        constructor(remoteAgentService) {
            super(remoteAgentService.getConnection().getChannel(exports.REMOTE_FILE_SYSTEM_CHANNEL_NAME));
            // Initially assume case sensitivity until remote environment is resolved
            this.setCaseSensitive(true);
            (async () => {
                const remoteAgentEnvironment = await remoteAgentService.getEnvironment();
                this.setCaseSensitive((remoteAgentEnvironment === null || remoteAgentEnvironment === void 0 ? void 0 : remoteAgentEnvironment.os) === 3 /* Linux */);
            })();
        }
    }
    exports.RemoteFileSystemProvider = RemoteFileSystemProvider;
});
//# sourceMappingURL=remoteAgentFileSystemChannel.js.map