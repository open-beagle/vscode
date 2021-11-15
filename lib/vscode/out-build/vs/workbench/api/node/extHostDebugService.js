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
define(["require", "exports", "vs/nls!vs/workbench/api/node/extHostDebugService", "vs/base/common/platform", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/debug/node/debugAdapter", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostDocumentsAndEditors", "../common/extHostConfiguration", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostDebugService", "vs/platform/sign/node/signService", "vs/workbench/contrib/debug/node/terminals", "vs/base/common/async"], function (require, exports, nls, platform, extHostTypes_1, debugAdapter_1, extHostWorkspace_1, extHostExtensionService_1, extHostDocumentsAndEditors_1, extHostConfiguration_1, extHostTerminalService_1, extHostRpcService_1, extHostDebugService_1, signService_1, terminals_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostDebugService = void 0;
    let ExtHostDebugService = class ExtHostDebugService extends extHostDebugService_1.ExtHostDebugServiceBase {
        constructor(extHostRpcService, workspaceService, extensionService, editorsService, configurationService, _terminalService) {
            super(extHostRpcService, workspaceService, extensionService, editorsService, configurationService);
            this._terminalService = _terminalService;
            this._integratedTerminalInstances = new DebugTerminalCollection();
        }
        createDebugAdapter(adapter, session) {
            switch (adapter.type) {
                case 'server':
                    return new debugAdapter_1.SocketDebugAdapter(adapter);
                case 'pipeServer':
                    return new debugAdapter_1.NamedPipeDebugAdapter(adapter);
                case 'executable':
                    return new debugAdapter_1.ExecutableDebugAdapter(adapter, session.type);
            }
            return super.createDebugAdapter(adapter, session);
        }
        daExecutableFromPackage(session, extensionRegistry) {
            const dae = debugAdapter_1.ExecutableDebugAdapter.platformAdapterExecutable(extensionRegistry.getAllExtensionDescriptions(), session.type);
            if (dae) {
                return new extHostTypes_1.DebugAdapterExecutable(dae.command, dae.args, dae.options);
            }
            return undefined;
        }
        createSignService() {
            return new signService_1.SignService();
        }
        async $runInTerminal(args, sessionId) {
            if (args.kind === 'integrated') {
                if (!this._terminalDisposedListener) {
                    // React on terminal disposed and check if that is the debug terminal #12956
                    this._terminalDisposedListener = this._terminalService.onDidCloseTerminal(terminal => {
                        this._integratedTerminalInstances.onTerminalClosed(terminal);
                    });
                }
                const configProvider = await this._configurationService.getConfigProvider();
                const shell = this._terminalService.getDefaultShell(true, configProvider);
                const shellArgs = this._terminalService.getDefaultShellArgs(true, configProvider);
                const shellConfig = JSON.stringify({ shell, shellArgs });
                let terminal = await this._integratedTerminalInstances.checkout(shellConfig);
                let cwdForPrepareCommand;
                let giveShellTimeToInitialize = false;
                if (!terminal) {
                    const options = {
                        shellPath: shell,
                        shellArgs: shellArgs,
                        cwd: args.cwd,
                        name: args.title || nls.localize(0, null),
                    };
                    giveShellTimeToInitialize = true;
                    terminal = this._terminalService.createTerminalFromOptions(options, true);
                    this._integratedTerminalInstances.insert(terminal, shellConfig);
                }
                else {
                    cwdForPrepareCommand = args.cwd;
                }
                terminal.show(true);
                const shellProcessId = await terminal.processId;
                if (giveShellTimeToInitialize) {
                    // give a new terminal some time to initialize the shell
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                else {
                    if (configProvider.getConfiguration('debug.terminal').get('clearBeforeReusing')) {
                        // clear terminal before reusing it
                        if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0 || shell.indexOf('cmd.exe') >= 0) {
                            terminal.sendText('cls');
                        }
                        else if (shell.indexOf('bash') >= 0) {
                            terminal.sendText('clear');
                        }
                        else if (platform.isWindows) {
                            terminal.sendText('cls');
                        }
                        else {
                            terminal.sendText('clear');
                        }
                    }
                }
                const command = (0, terminals_1.prepareCommand)(shell, args.args, cwdForPrepareCommand, args.env);
                terminal.sendText(command);
                // Mark terminal as unused when its session ends, see #112055
                const sessionListener = this.onDidTerminateDebugSession(s => {
                    if (s.id === sessionId) {
                        this._integratedTerminalInstances.free(terminal);
                        sessionListener.dispose();
                    }
                });
                return shellProcessId;
            }
            else if (args.kind === 'external') {
                return (0, terminals_1.runInExternalTerminal)(args, await this._configurationService.getConfigProvider());
            }
            return super.$runInTerminal(args, sessionId);
        }
        createVariableResolver(folders, editorService, configurationService) {
            return new extHostDebugService_1.ExtHostVariableResolverService(folders, editorService, configurationService, this._workspaceService);
        }
    };
    ExtHostDebugService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostWorkspace_1.IExtHostWorkspace),
        __param(2, extHostExtensionService_1.IExtHostExtensionService),
        __param(3, extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors),
        __param(4, extHostConfiguration_1.IExtHostConfiguration),
        __param(5, extHostTerminalService_1.IExtHostTerminalService)
    ], ExtHostDebugService);
    exports.ExtHostDebugService = ExtHostDebugService;
    class DebugTerminalCollection {
        constructor() {
            this._terminalInstances = new Map();
        }
        async checkout(config) {
            const entries = [...this._terminalInstances.entries()];
            const promises = entries.map(([terminal, termInfo]) => (0, async_1.createCancelablePromise)(async (ct) => {
                if (termInfo.lastUsedAt !== -1 && await (0, terminals_1.hasChildProcesses)(await terminal.processId)) {
                    return null;
                }
                // important: date check and map operations must be synchronous
                const now = Date.now();
                if (termInfo.lastUsedAt + DebugTerminalCollection.minUseDelay > now || ct.isCancellationRequested) {
                    return null;
                }
                if (termInfo.config !== config) {
                    return null;
                }
                termInfo.lastUsedAt = now;
                return terminal;
            }));
            return await (0, async_1.firstParallel)(promises, (t) => !!t);
        }
        insert(terminal, termConfig) {
            this._terminalInstances.set(terminal, { lastUsedAt: Date.now(), config: termConfig });
        }
        free(terminal) {
            const info = this._terminalInstances.get(terminal);
            if (info) {
                info.lastUsedAt = -1;
            }
        }
        onTerminalClosed(terminal) {
            this._terminalInstances.delete(terminal);
        }
    }
    /**
     * Delay before a new terminal is a candidate for reuse. See #71850
     */
    DebugTerminalCollection.minUseDelay = 1000;
});
//# sourceMappingURL=extHostDebugService.js.map