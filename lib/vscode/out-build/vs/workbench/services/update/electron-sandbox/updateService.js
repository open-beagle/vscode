/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/update/common/update", "vs/platform/ipc/electron-sandbox/services", "vs/platform/update/common/updateIpc"], function (require, exports, update_1, services_1, updateIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, services_1.registerMainProcessRemoteService)(update_1.IUpdateService, 'update', { channelClientCtor: updateIpc_1.UpdateChannelClient });
});
//# sourceMappingURL=updateService.js.map