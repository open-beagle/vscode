/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/platform", "vs/base/node/powershell", "vs/base/node/processes"], function (require, exports, os_1, platform, powershell_1, processes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSystemShellSync = exports.getSystemShell = void 0;
    /**
     * Gets the detected default shell for the _system_, not to be confused with VS Code's _default_
     * shell that the terminal uses by default.
     * @param os The platform to detect the shell of.
     */
    async function getSystemShell(os, env) {
        if (os === 1 /* Windows */) {
            if (platform.isWindows) {
                return getSystemShellWindows();
            }
            // Don't detect Windows shell when not on Windows
            return processes.getWindowsShell(env);
        }
        return getSystemShellUnixLike(os, env);
    }
    exports.getSystemShell = getSystemShell;
    function getSystemShellSync(os, env) {
        if (os === 1 /* Windows */) {
            if (platform.isWindows) {
                return getSystemShellWindowsSync(env);
            }
            // Don't detect Windows shell when not on Windows
            return processes.getWindowsShell(env);
        }
        return getSystemShellUnixLike(os, env);
    }
    exports.getSystemShellSync = getSystemShellSync;
    let _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = null;
    function getSystemShellUnixLike(os, env) {
        // Only use $SHELL for the current OS
        if (platform.isLinux && os === 2 /* Macintosh */ || platform.isMacintosh && os === 3 /* Linux */) {
            return '/bin/bash';
        }
        if (!_TERMINAL_DEFAULT_SHELL_UNIX_LIKE) {
            let unixLikeTerminal;
            if (platform.isWindows) {
                unixLikeTerminal = '/bin/bash'; // for WSL
            }
            else {
                unixLikeTerminal = env['SHELL'];
                if (!unixLikeTerminal) {
                    try {
                        // It's possible for $SHELL to be unset, this API reads /etc/passwd. See https://github.com/github/codespaces/issues/1639
                        // Node docs: "Throws a SystemError if a user has no username or homedir."
                        unixLikeTerminal = (0, os_1.userInfo)().shell;
                    }
                    catch (err) { }
                }
                if (!unixLikeTerminal) {
                    unixLikeTerminal = 'sh';
                }
                // Some systems have $SHELL set to /bin/false which breaks the terminal
                if (unixLikeTerminal === '/bin/false') {
                    unixLikeTerminal = '/bin/bash';
                }
            }
            _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = unixLikeTerminal;
        }
        return _TERMINAL_DEFAULT_SHELL_UNIX_LIKE;
    }
    let _TERMINAL_DEFAULT_SHELL_WINDOWS = null;
    async function getSystemShellWindows() {
        if (!_TERMINAL_DEFAULT_SHELL_WINDOWS) {
            _TERMINAL_DEFAULT_SHELL_WINDOWS = (await (0, powershell_1.getFirstAvailablePowerShellInstallation)()).exePath;
        }
        return _TERMINAL_DEFAULT_SHELL_WINDOWS;
    }
    function getSystemShellWindowsSync(env) {
        if (_TERMINAL_DEFAULT_SHELL_WINDOWS) {
            return _TERMINAL_DEFAULT_SHELL_WINDOWS;
        }
        const isAtLeastWindows10 = platform.isWindows && parseFloat((0, os_1.release)()) >= 10;
        const is32ProcessOn64Windows = env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
        const powerShellPath = `${env['windir']}\\${is32ProcessOn64Windows ? 'Sysnative' : 'System32'}\\WindowsPowerShell\\v1.0\\powershell.exe`;
        return isAtLeastWindows10 ? powerShellPath : processes.getWindowsShell(env);
    }
});
//# sourceMappingURL=shell.js.map