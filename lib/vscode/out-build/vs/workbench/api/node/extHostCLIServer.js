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
define(["require", "exports", "vs/base/parts/ipc/node/ipc.net", "http", "fs", "vs/workbench/api/common/extHostCommands", "vs/base/common/uri", "vs/platform/workspaces/common/workspaces", "vs/platform/log/common/log", "vs/base/common/path", "os"], function (require, exports, ipc_net_1, http, fs, extHostCommands_1, uri_1, workspaces_1, log_1, path_1, os_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CLIServer = exports.CLIServerBase = void 0;
    class CLIServerBase {
        constructor(_commands, logService, _ipcHandlePath) {
            this._commands = _commands;
            this.logService = logService;
            this._ipcHandlePath = _ipcHandlePath;
            this._server = http.createServer((req, res) => this.onRequest(req, res));
            this.setup().catch(err => {
                logService.error(err);
                return '';
            });
        }
        get ipcHandlePath() {
            return this._ipcHandlePath;
        }
        async setup() {
            // NOTE@coder: Write this out so we can get the most recent path.
            fs.promises.writeFile((0, path_1.join)((0, os_1.tmpdir)(), 'vscode-ipc'), this._ipcHandlePath).catch((error) => {
                this.logService.error(error);
            });
            try {
                this._server.listen(this.ipcHandlePath);
                this._server.on('error', err => this.logService.error(err));
            }
            catch (err) {
                this.logService.error('Could not start open from terminal server.');
            }
            return this._ipcHandlePath;
        }
        onRequest(req, res) {
            const chunks = [];
            req.setEncoding('utf8');
            req.on('data', (d) => chunks.push(d));
            req.on('end', () => {
                const data = JSON.parse(chunks.join(''));
                switch (data.type) {
                    case 'open':
                        this.open(data, res);
                        break;
                    case 'openExternal':
                        this.openExternal(data, res);
                        break;
                    case 'status':
                        this.getStatus(data, res);
                        break;
                    case 'extensionManagement':
                        this.manageExtensions(data, res)
                            .catch(this.logService.error);
                        break;
                    default:
                        res.writeHead(404);
                        res.write(`Unknown message type: ${data.type}`, err => {
                            if (err) {
                                this.logService.error(err);
                            }
                        });
                        res.end();
                        break;
                }
            });
        }
        open(data, res) {
            let { fileURIs, folderURIs, forceNewWindow, diffMode, addMode, forceReuseWindow, gotoLineMode, waitMarkerFilePath } = data;
            const urisToOpen = [];
            if (Array.isArray(folderURIs)) {
                for (const s of folderURIs) {
                    try {
                        urisToOpen.push({ folderUri: uri_1.URI.parse(s) });
                    }
                    catch (e) {
                        // ignore
                    }
                }
            }
            if (Array.isArray(fileURIs)) {
                for (const s of fileURIs) {
                    try {
                        if ((0, workspaces_1.hasWorkspaceFileExtension)(s)) {
                            urisToOpen.push({ workspaceUri: uri_1.URI.parse(s) });
                        }
                        else {
                            urisToOpen.push({ fileUri: uri_1.URI.parse(s) });
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                }
            }
            if (urisToOpen.length) {
                const waitMarkerFileURI = waitMarkerFilePath ? uri_1.URI.file(waitMarkerFilePath) : undefined;
                const preferNewWindow = !forceReuseWindow && !waitMarkerFileURI && !addMode;
                const windowOpenArgs = { forceNewWindow, diffMode, addMode, gotoLineMode, forceReuseWindow, preferNewWindow, waitMarkerFileURI };
                this._commands.executeCommand('_remoteCLI.windowOpen', urisToOpen, windowOpenArgs);
            }
            res.writeHead(200);
            res.end();
        }
        async openExternal(data, res) {
            for (const uriString of data.uris) {
                const uri = uri_1.URI.parse(uriString);
                const urioOpen = uri.scheme === 'file' ? uri : uriString; // workaround for #112577
                await this._commands.executeCommand('_remoteCLI.openExternal', urioOpen);
            }
            res.writeHead(200);
            res.end();
        }
        async manageExtensions(data, res) {
            try {
                const toExtOrVSIX = (inputs) => inputs === null || inputs === void 0 ? void 0 : inputs.map(input => /\.vsix$/i.test(input) ? uri_1.URI.parse(input) : input);
                const commandArgs = {
                    list: data.list,
                    install: toExtOrVSIX(data.install),
                    uninstall: toExtOrVSIX(data.uninstall),
                    force: data.force
                };
                const output = await this._commands.executeCommand('_remoteCLI.manageExtensions', commandArgs);
                res.writeHead(200);
                res.write(output);
            }
            catch (err) {
                res.writeHead(500);
                res.write(String(err), err => {
                    if (err) {
                        this.logService.error(err);
                    }
                });
            }
            res.end();
        }
        async getStatus(data, res) {
            try {
                const status = await this._commands.executeCommand('_remoteCLI.getSystemStatus');
                res.writeHead(200);
                res.write(status);
                res.end();
            }
            catch (err) {
                res.writeHead(500);
                res.write(String(err), err => {
                    if (err) {
                        this.logService.error(err);
                    }
                });
                res.end();
            }
        }
        dispose() {
            this._server.close();
            if (this._ipcHandlePath && process.platform !== 'win32' && fs.existsSync(this._ipcHandlePath)) {
                fs.unlinkSync(this._ipcHandlePath);
            }
        }
    }
    exports.CLIServerBase = CLIServerBase;
    let CLIServer = class CLIServer extends CLIServerBase {
        constructor(commands, logService) {
            super(commands, logService, (0, ipc_net_1.createRandomIPCHandle)());
        }
    };
    CLIServer = __decorate([
        __param(0, extHostCommands_1.IExtHostCommands),
        __param(1, log_1.ILogService)
    ], CLIServer);
    exports.CLIServer = CLIServer;
});
//# sourceMappingURL=extHostCLIServer.js.map