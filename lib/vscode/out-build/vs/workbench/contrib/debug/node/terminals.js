/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/platform", "vs/workbench/contrib/externalTerminal/node/externalTerminalService", "vs/base/common/extpath"], function (require, exports, cp, platform, externalTerminalService_1, extpath_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepareCommand = exports.hasChildProcesses = exports.runInExternalTerminal = void 0;
    let externalTerminalService = undefined;
    function runInExternalTerminal(args, configProvider) {
        if (!externalTerminalService) {
            if (platform.isWindows) {
                externalTerminalService = new externalTerminalService_1.WindowsExternalTerminalService(undefined);
            }
            else if (platform.isMacintosh) {
                externalTerminalService = new externalTerminalService_1.MacExternalTerminalService(undefined);
            }
            else if (platform.isLinux) {
                externalTerminalService = new externalTerminalService_1.LinuxExternalTerminalService(undefined);
            }
            else {
                throw new Error('external terminals not supported on this platform');
            }
        }
        const config = configProvider.getConfiguration('terminal');
        return externalTerminalService.runInTerminal(args.title, args.cwd, args.args, args.env || {}, config.external || {});
    }
    exports.runInExternalTerminal = runInExternalTerminal;
    function spawnAsPromised(command, args) {
        return new Promise((resolve, reject) => {
            let stdout = '';
            const child = cp.spawn(command, args);
            if (child.pid) {
                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
            }
            child.on('error', err => {
                reject(err);
            });
            child.on('close', code => {
                resolve(stdout);
            });
        });
    }
    function hasChildProcesses(processId) {
        if (processId) {
            // if shell has at least one child process, assume that shell is busy
            if (platform.isWindows) {
                return spawnAsPromised('wmic', ['process', 'get', 'ParentProcessId']).then(stdout => {
                    const pids = stdout.split('\r\n');
                    return pids.some(p => parseInt(p) === processId);
                }, error => {
                    return true;
                });
            }
            else {
                return spawnAsPromised('/usr/bin/pgrep', ['-lP', String(processId)]).then(stdout => {
                    const r = stdout.trim();
                    if (r.length === 0 || r.indexOf(' tmux') >= 0) { // ignore 'tmux'; see #43683
                        return false;
                    }
                    else {
                        return true;
                    }
                }, error => {
                    return true;
                });
            }
        }
        // fall back to safe side
        return Promise.resolve(true);
    }
    exports.hasChildProcesses = hasChildProcesses;
    var ShellType;
    (function (ShellType) {
        ShellType[ShellType["cmd"] = 0] = "cmd";
        ShellType[ShellType["powershell"] = 1] = "powershell";
        ShellType[ShellType["bash"] = 2] = "bash";
    })(ShellType || (ShellType = {}));
    function prepareCommand(shell, args, cwd, env) {
        shell = shell.trim().toLowerCase();
        // try to determine the shell type
        let shellType;
        if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0) {
            shellType = 1 /* powershell */;
        }
        else if (shell.indexOf('cmd.exe') >= 0) {
            shellType = 0 /* cmd */;
        }
        else if (shell.indexOf('bash') >= 0) {
            shellType = 2 /* bash */;
        }
        else if (platform.isWindows) {
            shellType = 0 /* cmd */; // pick a good default for Windows
        }
        else {
            shellType = 2 /* bash */; // pick a good default for anything else
        }
        let quote;
        // begin command with a space to avoid polluting shell history
        let command = ' ';
        switch (shellType) {
            case 1 /* powershell */:
                quote = (s) => {
                    s = s.replace(/\'/g, '\'\'');
                    if (s.length > 0 && s.charAt(s.length - 1) === '\\') {
                        return `'${s}\\'`;
                    }
                    return `'${s}'`;
                };
                if (cwd) {
                    const driveLetter = (0, extpath_1.getDriveLetter)(cwd);
                    if (driveLetter) {
                        command += `${driveLetter}:; `;
                    }
                    command += `cd ${quote(cwd)}; `;
                }
                if (env) {
                    for (let key in env) {
                        const value = env[key];
                        if (value === null) {
                            command += `Remove-Item env:${key}; `;
                        }
                        else {
                            command += `\${env:${key}}='${value}'; `;
                        }
                    }
                }
                if (args.length > 0) {
                    const cmd = quote(args.shift());
                    command += (cmd[0] === '\'') ? `& ${cmd} ` : `${cmd} `;
                    for (let a of args) {
                        command += `${quote(a)} `;
                    }
                }
                break;
            case 0 /* cmd */:
                quote = (s) => {
                    s = s.replace(/\"/g, '""');
                    return (s.indexOf(' ') >= 0 || s.indexOf('"') >= 0 || s.length === 0) ? `"${s}"` : s;
                };
                if (cwd) {
                    const driveLetter = (0, extpath_1.getDriveLetter)(cwd);
                    if (driveLetter) {
                        command += `${driveLetter}: && `;
                    }
                    command += `cd ${quote(cwd)} && `;
                }
                if (env) {
                    command += 'cmd /C "';
                    for (let key in env) {
                        let value = env[key];
                        if (value === null) {
                            command += `set "${key}=" && `;
                        }
                        else {
                            value = value.replace(/[\^\&\|\<\>]/g, s => `^${s}`);
                            command += `set "${key}=${value}" && `;
                        }
                    }
                }
                for (let a of args) {
                    command += `${quote(a)} `;
                }
                if (env) {
                    command += '"';
                }
                break;
            case 2 /* bash */:
                quote = (s) => {
                    s = s.replace(/(["'\\\$])/g, '\\$1');
                    return (s.indexOf(' ') >= 0 || s.indexOf(';') >= 0 || s.length === 0) ? `"${s}"` : s;
                };
                const hardQuote = (s) => {
                    return /[^\w@%\/+=,.:^-]/.test(s) ? `'${s.replace(/'/g, '\'\\\'\'')}'` : s;
                };
                if (cwd) {
                    command += `cd ${quote(cwd)} ; `;
                }
                if (env) {
                    command += '/usr/bin/env';
                    for (let key in env) {
                        const value = env[key];
                        if (value === null) {
                            command += ` -u ${hardQuote(key)}`;
                        }
                        else {
                            command += ` ${hardQuote(`${key}=${value}`)}`;
                        }
                    }
                    command += ' ';
                }
                for (let a of args) {
                    command += `${quote(a)} `;
                }
                break;
        }
        return command;
    }
    exports.prepareCommand = prepareCommand;
});
//# sourceMappingURL=terminals.js.map