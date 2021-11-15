/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/files/node/watcher/nsfw/nsfwWatcherService", "vs/base/parts/ipc/common/ipc"], function (require, exports, ipc_cp_1, nsfwWatcherService_1, ipc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const server = new ipc_cp_1.Server('watcher');
    const service = new nsfwWatcherService_1.NsfwWatcherService();
    server.registerChannel('watcher', ipc_1.ProxyChannel.fromService(service));
});
//# sourceMappingURL=watcherApp.js.map