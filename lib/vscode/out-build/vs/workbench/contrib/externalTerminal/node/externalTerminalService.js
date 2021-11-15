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
define(["require", "exports", "child_process", "vs/base/common/path", "vs/base/node/processes", "vs/nls!vs/workbench/contrib/externalTerminal/node/externalTerminalService", "vs/base/node/pfs", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/externalTerminal/node/externalTerminal", "vs/base/common/network"], function (require, exports, cp, path, processes, nls, pfs, env, configuration_1, instantiation_1, externalTerminal_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LinuxExternalTerminalService = exports.MacExternalTerminalService = exports.WindowsExternalTerminalService = void 0;
    const TERMINAL_TITLE = nls.localize(0, null);
    let WindowsExternalTerminalService = class WindowsExternalTerminalService {
        constructor(configurationService) {
            this._configurationService = configurationService;
        }
        openTerminal(cwd) {
            if (this._configurationService) {
                const configuration = this._configurationService.getValue();
                this.spawnTerminal(cp, configuration, processes.getWindowsShell(), cwd);
            }
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const exec = settings.windowsExec || WindowsExternalTerminalService.getDefaultTerminalWindows();
            return new Promise((resolve, reject) => {
                const title = `"${dir} - ${TERMINAL_TITLE}"`;
                const command = `""${args.join('" "')}" & pause"`; // use '|' to only pause on non-zero exit code
                const cmdArgs = [
                    '/c', 'start', title, '/wait', exec, '/c', command
                ];
                // merge environment variables into a copy of the process.env
                const env = Object.assign({}, process.env, envVars);
                // delete environment variables that have a null value
                Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);
                const options = {
                    cwd: dir,
                    env: env,
                    windowsVerbatimArguments: true
                };
                const cmd = cp.spawn(WindowsExternalTerminalService.CMD, cmdArgs, options);
                cmd.on('error', err => {
                    reject(improveError(err));
                });
                resolve(undefined);
            });
        }
        spawnTerminal(spawner, configuration, command, cwd) {
            const terminalConfig = configuration.terminal.external;
            const exec = terminalConfig.windowsExec || WindowsExternalTerminalService.getDefaultTerminalWindows();
            // Make the drive letter uppercase on Windows (see #9448)
            if (cwd && cwd[1] === ':') {
                cwd = cwd[0].toUpperCase() + cwd.substr(1);
            }
            // cmder ignores the environment cwd and instead opts to always open in %USERPROFILE%
            // unless otherwise specified
            const basename = path.basename(exec).toLowerCase();
            if (basename === 'cmder' || basename === 'cmder.exe') {
                spawner.spawn(exec, cwd ? [cwd] : undefined);
                return Promise.resolve(undefined);
            }
            const cmdArgs = ['/c', 'start', '/wait'];
            if (exec.indexOf(' ') >= 0) {
                // The "" argument is the window title. Without this, exec doesn't work when the path
                // contains spaces
                cmdArgs.push('""');
            }
            cmdArgs.push(exec);
            // Add starting directory parameter for Windows Terminal (see #90734)
            if (basename === 'wt' || basename === 'wt.exe') {
                cmdArgs.push('-d .');
            }
            return new Promise((c, e) => {
                const env = cwd ? { cwd: cwd } : undefined;
                const child = spawner.spawn(command, cmdArgs, env);
                child.on('error', e);
                child.on('exit', () => c());
            });
        }
        static getDefaultTerminalWindows() {
            if (!WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS) {
                const isWoW64 = !!process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
                WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS = `${process.env.windir ? process.env.windir : 'C:\\Windows'}\\${isWoW64 ? 'Sysnative' : 'System32'}\\cmd.exe`;
            }
            return WindowsExternalTerminalService._DEFAULT_TERMINAL_WINDOWS;
        }
    };
    WindowsExternalTerminalService.CMD = 'cmd.exe';
    WindowsExternalTerminalService = __decorate([
        __param(0, (0, instantiation_1.optional)(configuration_1.IConfigurationService))
    ], WindowsExternalTerminalService);
    exports.WindowsExternalTerminalService = WindowsExternalTerminalService;
    let MacExternalTerminalService = class MacExternalTerminalService {
        constructor(configurationService) {
            this._configurationService = configurationService;
        }
        openTerminal(cwd) {
            if (this._configurationService) {
                const configuration = this._configurationService.getValue();
                this.spawnTerminal(cp, configuration, cwd);
            }
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const terminalApp = settings.osxExec || externalTerminal_1.DEFAULT_TERMINAL_OSX;
            return new Promise((resolve, reject) => {
                if (terminalApp === externalTerminal_1.DEFAULT_TERMINAL_OSX || terminalApp === 'iTerm.app') {
                    // On OS X we launch an AppleScript that creates (or reuses) a Terminal window
                    // and then launches the program inside that window.
                    const script = terminalApp === externalTerminal_1.DEFAULT_TERMINAL_OSX ? 'TerminalHelper' : 'iTermHelper';
                    const scriptpath = network_1.FileAccess.asFileUri(`vs/workbench/contrib/externalTerminal/node/${script}.scpt`, require).fsPath;
                    const osaArgs = [
                        scriptpath,
                        '-t', title || TERMINAL_TITLE,
                        '-w', dir,
                    ];
                    for (let a of args) {
                        osaArgs.push('-a');
                        osaArgs.push(a);
                    }
                    if (envVars) {
                        for (let key in envVars) {
                            const value = envVars[key];
                            if (value === null) {
                                osaArgs.push('-u');
                                osaArgs.push(key);
                            }
                            else {
                                osaArgs.push('-e');
                                osaArgs.push(`${key}=${value}`);
                            }
                        }
                    }
                    let stderr = '';
                    const osa = cp.spawn(MacExternalTerminalService.OSASCRIPT, osaArgs);
                    osa.on('error', err => {
                        reject(improveError(err));
                    });
                    osa.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                    osa.on('exit', (code) => {
                        if (code === 0) { // OK
                            resolve(undefined);
                        }
                        else {
                            if (stderr) {
                                const lines = stderr.split('\n', 1);
                                reject(new Error(lines[0]));
                            }
                            else {
                                reject(new Error(nls.localize(1, null, script, code)));
                            }
                        }
                    });
                }
                else {
                    reject(new Error(nls.localize(2, null, terminalApp)));
                }
            });
        }
        spawnTerminal(spawner, configuration, cwd) {
            const terminalConfig = configuration.terminal.external;
            const terminalApp = terminalConfig.osxExec || externalTerminal_1.DEFAULT_TERMINAL_OSX;
            return new Promise((c, e) => {
                const args = ['-a', terminalApp];
                if (cwd) {
                    args.push(cwd);
                }
                const child = spawner.spawn('/usr/bin/open', args);
                child.on('error', e);
                child.on('exit', () => c());
            });
        }
    };
    MacExternalTerminalService.OSASCRIPT = '/usr/bin/osascript'; // osascript is the AppleScript interpreter on OS X
    MacExternalTerminalService = __decorate([
        __param(0, (0, instantiation_1.optional)(configuration_1.IConfigurationService))
    ], MacExternalTerminalService);
    exports.MacExternalTerminalService = MacExternalTerminalService;
    let LinuxExternalTerminalService = class LinuxExternalTerminalService {
        constructor(configurationService) {
            this._configurationService = configurationService;
        }
        openTerminal(cwd) {
            if (this._configurationService) {
                const configuration = this._configurationService.getValue();
                this.spawnTerminal(cp, configuration, cwd);
            }
        }
        runInTerminal(title, dir, args, envVars, settings) {
            const execPromise = settings.linuxExec ? Promise.resolve(settings.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
            return new Promise((resolve, reject) => {
                let termArgs = [];
                //termArgs.push('--title');
                //termArgs.push(`"${TERMINAL_TITLE}"`);
                execPromise.then(exec => {
                    if (exec.indexOf('gnome-terminal') >= 0) {
                        termArgs.push('-x');
                    }
                    else {
                        termArgs.push('-e');
                    }
                    termArgs.push('bash');
                    termArgs.push('-c');
                    const bashCommand = `${quote(args)}; echo; read -p "${LinuxExternalTerminalService.WAIT_MESSAGE}" -n1;`;
                    termArgs.push(`''${bashCommand}''`); // wrapping argument in two sets of ' because node is so "friendly" that it removes one set...
                    // merge environment variables into a copy of the process.env
                    const env = Object.assign({}, process.env, envVars);
                    // delete environment variables that have a null value
                    Object.keys(env).filter(v => env[v] === null).forEach(key => delete env[key]);
                    const options = {
                        cwd: dir,
                        env: env
                    };
                    let stderr = '';
                    const cmd = cp.spawn(exec, termArgs, options);
                    cmd.on('error', err => {
                        reject(improveError(err));
                    });
                    cmd.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });
                    cmd.on('exit', (code) => {
                        if (code === 0) { // OK
                            resolve(undefined);
                        }
                        else {
                            if (stderr) {
                                const lines = stderr.split('\n', 1);
                                reject(new Error(lines[0]));
                            }
                            else {
                                reject(new Error(nls.localize(4, null, exec, code)));
                            }
                        }
                    });
                });
            });
        }
        spawnTerminal(spawner, configuration, cwd) {
            const terminalConfig = configuration.terminal.external;
            const execPromise = terminalConfig.linuxExec ? Promise.resolve(terminalConfig.linuxExec) : LinuxExternalTerminalService.getDefaultTerminalLinuxReady();
            return new Promise((c, e) => {
                execPromise.then(exec => {
                    const env = cwd ? { cwd } : undefined;
                    const child = spawner.spawn(exec, [], env);
                    child.on('error', e);
                    child.on('exit', () => c());
                });
            });
        }
        static async getDefaultTerminalLinuxReady() {
            if (!LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY) {
                LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY = new Promise(async (r) => {
                    if (env.isLinux) {
                        const isDebian = await pfs.exists('/etc/debian_version');
                        if (isDebian) {
                            r('x-terminal-emulator');
                        }
                        else if (process.env.DESKTOP_SESSION === 'gnome' || process.env.DESKTOP_SESSION === 'gnome-classic') {
                            r('gnome-terminal');
                        }
                        else if (process.env.DESKTOP_SESSION === 'kde-plasma') {
                            r('konsole');
                        }
                        else if (process.env.COLORTERM) {
                            r(process.env.COLORTERM);
                        }
                        else if (process.env.TERM) {
                            r(process.env.TERM);
                        }
                        else {
                            r('xterm');
                        }
                    }
                    else {
                        r('xterm');
                    }
                });
            }
            return LinuxExternalTerminalService._DEFAULT_TERMINAL_LINUX_READY;
        }
    };
    LinuxExternalTerminalService.WAIT_MESSAGE = nls.localize(3, null);
    LinuxExternalTerminalService = __decorate([
        __param(0, (0, instantiation_1.optional)(configuration_1.IConfigurationService))
    ], LinuxExternalTerminalService);
    exports.LinuxExternalTerminalService = LinuxExternalTerminalService;
    /**
     * tries to turn OS errors into more meaningful error messages
     */
    function improveError(err) {
        if ('errno' in err && err['errno'] === 'ENOENT' && 'path' in err && typeof err['path'] === 'string') {
            return new Error(nls.localize(5, null, err['path']));
        }
        return err;
    }
    /**
     * Quote args if necessary and combine into a space separated string.
     */
    function quote(args) {
        let r = '';
        for (let a of args) {
            if (a.indexOf(' ') >= 0) {
                r += '"' + a + '"';
            }
            else {
                r += a;
            }
            r += ' ';
        }
        return r;
    }
});
//# sourceMappingURL=externalTerminalService.js.map