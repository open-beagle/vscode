/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/node/ipc.cp", "vs/base/parts/ipc/common/ipc", "vs/platform/terminal/node/ptyService", "vs/platform/terminal/common/terminal", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/terminal/node/heartbeatService"], function (require, exports, ipc_cp_1, ipc_1, ptyService_1, terminal_1, log_1, logIpc_1, heartbeatService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const server = new ipc_cp_1.Server('ptyHost');
    const lastPtyId = parseInt(process.env.VSCODE_LAST_PTY_ID || '0');
    delete process.env.VSCODE_LAST_PTY_ID;
    const logService = new log_1.LogService(new log_1.ConsoleLogger());
    const logChannel = new logIpc_1.LogLevelChannel(logService);
    server.registerChannel(terminal_1.TerminalIpcChannels.Log, logChannel);
    const heartbeatService = new heartbeatService_1.HeartbeatService();
    server.registerChannel(terminal_1.TerminalIpcChannels.Heartbeat, ipc_1.ProxyChannel.fromService(heartbeatService));
    const ptyService = new ptyService_1.PtyService(lastPtyId, logService);
    server.registerChannel(terminal_1.TerminalIpcChannels.PtyHost, ipc_1.ProxyChannel.fromService(ptyService));
    process.once('exit', () => {
        logService.dispose();
        heartbeatService.dispose();
        ptyService.dispose();
    });
});
//# sourceMappingURL=ptyHostMain.js.map