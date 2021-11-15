/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "path", "child_process", "vs/base/common/uuid", "vs/base/common/platform", "vs/platform/environment/node/argvHelper", "vs/base/common/errorMessage", "vs/base/node/shell"], function (require, exports, path, child_process_1, uuid_1, platform_1, argvHelper_1, errorMessage_1, shell_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveShellEnv = void 0;
    /**
     * We need to get the environment from a user's shell.
     * This should only be done when Code itself is not launched
     * from within a shell.
     */
    async function resolveShellEnv(logService, args, env) {
        // Skip if --force-disable-user-env
        if (args['force-disable-user-env']) {
            logService.trace('resolveShellEnv(): skipped (--force-disable-user-env)');
            return {};
        }
        // Skip on windows
        else if (platform_1.isWindows) {
            logService.trace('resolveShellEnv(): skipped (Windows)');
            return {};
        }
        // Skip if running from CLI already
        else if ((0, argvHelper_1.isLaunchedFromCli)(env) && !args['force-user-env']) {
            logService.trace('resolveShellEnv(): skipped (VSCODE_CLI is set)');
            return {};
        }
        // Otherwise resolve (macOS, Linux)
        else {
            if ((0, argvHelper_1.isLaunchedFromCli)(env)) {
                logService.trace('resolveShellEnv(): running (--force-user-env)');
            }
            else {
                logService.trace('resolveShellEnv(): running (macOS/Linux)');
            }
            if (!unixShellEnvPromise) {
                unixShellEnvPromise = doResolveUnixShellEnv(logService);
            }
            return unixShellEnvPromise;
        }
    }
    exports.resolveShellEnv = resolveShellEnv;
    let unixShellEnvPromise = undefined;
    async function doResolveUnixShellEnv(logService) {
        const promise = new Promise(async (resolve, reject) => {
            const runAsNode = process.env['ELECTRON_RUN_AS_NODE'];
            logService.trace('getUnixShellEnvironment#runAsNode', runAsNode);
            const noAttach = process.env['ELECTRON_NO_ATTACH_CONSOLE'];
            logService.trace('getUnixShellEnvironment#noAttach', noAttach);
            const mark = (0, uuid_1.generateUuid)().replace(/-/g, '').substr(0, 12);
            const regex = new RegExp(mark + '(.*)' + mark);
            const env = Object.assign(Object.assign({}, process.env), { ELECTRON_RUN_AS_NODE: '1', ELECTRON_NO_ATTACH_CONSOLE: '1' });
            logService.trace('getUnixShellEnvironment#env', env);
            const systemShellUnix = await (0, shell_1.getSystemShell)(platform_1.OS, env);
            logService.trace('getUnixShellEnvironment#shell', systemShellUnix);
            // handle popular non-POSIX shells
            const name = path.basename(systemShellUnix);
            let command, shellArgs;
            if (/^pwsh(-preview)?$/.test(name)) {
                // Older versions of PowerShell removes double quotes sometimes so we use "double single quotes" which is how
                // you escape single quotes inside of a single quoted string.
                command = `& '${process.execPath}' -p '''${mark}'' + JSON.stringify(process.env) + ''${mark}'''`;
                shellArgs = ['-Login', '-Command'];
            }
            else {
                command = `'${process.execPath}' -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
                shellArgs = ['-ilc'];
            }
            logService.trace('getUnixShellEnvironment#spawn', JSON.stringify(shellArgs), command);
            const child = (0, child_process_1.spawn)(systemShellUnix, [...shellArgs, command], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe'],
                env
            });
            child.on('error', err => {
                logService.error('getUnixShellEnvironment#errorChildProcess', (0, errorMessage_1.toErrorMessage)(err));
                resolve({});
            });
            const buffers = [];
            child.stdout.on('data', b => buffers.push(b));
            const stderr = [];
            child.stderr.on('data', b => stderr.push(b));
            child.on('close', (code, signal) => {
                const raw = Buffer.concat(buffers).toString('utf8');
                logService.trace('getUnixShellEnvironment#raw', raw);
                const stderrStr = Buffer.concat(stderr).toString('utf8');
                if (stderrStr.trim()) {
                    logService.trace('getUnixShellEnvironment#stderr', stderrStr);
                }
                if (code || signal) {
                    return reject(new Error(`Failed to get environment (code ${code}, signal ${signal})`));
                }
                const match = regex.exec(raw);
                const rawStripped = match ? match[1] : '{}';
                try {
                    const env = JSON.parse(rawStripped);
                    if (runAsNode) {
                        env['ELECTRON_RUN_AS_NODE'] = runAsNode;
                    }
                    else {
                        delete env['ELECTRON_RUN_AS_NODE'];
                    }
                    if (noAttach) {
                        env['ELECTRON_NO_ATTACH_CONSOLE'] = noAttach;
                    }
                    else {
                        delete env['ELECTRON_NO_ATTACH_CONSOLE'];
                    }
                    // https://github.com/microsoft/vscode/issues/22593#issuecomment-336050758
                    delete env['XDG_RUNTIME_DIR'];
                    logService.trace('getUnixShellEnvironment#result', env);
                    resolve(env);
                }
                catch (err) {
                    logService.error('getUnixShellEnvironment#errorCaught', (0, errorMessage_1.toErrorMessage)(err));
                    reject(err);
                }
            });
        });
        try {
            return await promise;
        }
        catch (error) {
            logService.error('getUnixShellEnvironment#error', (0, errorMessage_1.toErrorMessage)(error));
            return {}; // ignore any errors
        }
    }
});
//# sourceMappingURL=shellEnv.js.map