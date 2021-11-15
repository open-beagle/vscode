/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
define(["require", "exports", "fs", "vs/base/common/path", "vs/base/node/powershell", "vs/platform/terminal/node/terminalEnvironment", "child_process", "vs/base/node/pfs", "vs/base/common/codicons", "vs/base/common/platform"], function (require, exports, fs, path_1, powershell_1, terminalEnvironment_1, cp, pfs, codicons_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.detectAvailableProfiles = void 0;
    let profileSources;
    function detectAvailableProfiles(configuredProfilesOnly, safeConfigProvider, fsProvider, logService, variableResolver, workspaceFolder, testPaths) {
        fsProvider = fsProvider || {
            existsFile: pfs.SymlinkSupport.existsFile,
            readFile: fs.promises.readFile
        };
        if (platform_1.isWindows) {
            return detectAvailableWindowsProfiles(configuredProfilesOnly, fsProvider, logService, safeConfigProvider('terminal.integrated.useWslProfiles') || true, safeConfigProvider('terminal.integrated.profiles.windows'), variableResolver, workspaceFolder);
        }
        return detectAvailableUnixProfiles(fsProvider, logService, configuredProfilesOnly, safeConfigProvider(`terminal.integrated.profiles.${platform_1.isMacintosh ? 'osx' : 'linux'}`), testPaths, variableResolver, workspaceFolder);
    }
    exports.detectAvailableProfiles = detectAvailableProfiles;
    async function detectAvailableWindowsProfiles(configuredProfilesOnly, fsProvider, logService, useWslProfiles, configProfiles, variableResolver, workspaceFolder) {
        // Determine the correct System32 path. We want to point to Sysnative
        // when the 32-bit version of VS Code is running on a 64-bit machine.
        // The reason for this is because PowerShell's important PSReadline
        // module doesn't work if this is not the case. See #27915.
        const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
        const system32Path = `${process.env['windir']}\\${is32ProcessOn64Windows ? 'Sysnative' : 'System32'}`;
        let useWSLexe = false;
        if ((0, terminalEnvironment_1.getWindowsBuildNumber)() >= 16299) {
            useWSLexe = true;
        }
        await initializeWindowsProfiles();
        const detectedProfiles = new Map();
        // Add auto detected profiles
        if (!configuredProfilesOnly) {
            detectedProfiles.set('PowerShell', {
                source: "PowerShell" /* Pwsh */,
                icon: codicons_1.Codicon.terminalPowershell.id,
                isAutoDetected: true
            });
            detectedProfiles.set('Windows PowerShell', {
                path: `${system32Path}\\WindowsPowerShell\\v1.0\\powershell.exe`,
                icon: codicons_1.Codicon.terminalPowershell.id,
                isAutoDetected: true
            });
            detectedProfiles.set('Git Bash', { source: "Git Bash" /* GitBash */, isAutoDetected: true });
            detectedProfiles.set('Cygwin', {
                path: [
                    `${process.env['HOMEDRIVE']}\\cygwin64\\bin\\bash.exe`,
                    `${process.env['HOMEDRIVE']}\\cygwin\\bin\\bash.exe`
                ],
                args: ['--login'],
                isAutoDetected: true
            });
            detectedProfiles.set('Command Prompt', {
                path: `${system32Path}\\cmd.exe`,
                icon: codicons_1.Codicon.terminalCmd.id,
                isAutoDetected: true
            });
        }
        applyConfigProfilesToMap(configProfiles, detectedProfiles);
        const resultProfiles = await transformToTerminalProfiles(detectedProfiles.entries(), fsProvider, logService, variableResolver, workspaceFolder);
        if (!configuredProfilesOnly || (configuredProfilesOnly && useWslProfiles)) {
            try {
                const result = await getWslProfiles(`${system32Path}\\${useWSLexe ? 'wsl.exe' : 'bash.exe'}`, useWslProfiles);
                if (result) {
                    resultProfiles.push(...result);
                }
            }
            catch (e) {
                logService === null || logService === void 0 ? void 0 : logService.info('WSL is not installed, so could not detect WSL profiles');
            }
        }
        return resultProfiles;
    }
    async function transformToTerminalProfiles(entries, fsProvider, logService, variableResolver, workspaceFolder) {
        const resultProfiles = [];
        for (const [profileName, profile] of entries) {
            if (profile === null) {
                continue;
            }
            let originalPaths;
            let args;
            let icon;
            if ('source' in profile) {
                const source = profileSources === null || profileSources === void 0 ? void 0 : profileSources.get(profile.source);
                if (!source) {
                    continue;
                }
                originalPaths = source.paths;
                // if there are configured args, override the default ones
                args = profile.args || source.args;
                icon = profile.icon || source.icon;
            }
            else {
                originalPaths = Array.isArray(profile.path) ? profile.path : [profile.path];
                args = platform_1.isWindows ? profile.args : Array.isArray(profile.args) ? profile.args : undefined;
                icon = profile.icon;
            }
            const paths = originalPaths.slice();
            for (let i = 0; i < paths.length; i++) {
                paths[i] = await (variableResolver === null || variableResolver === void 0 ? void 0 : variableResolver.resolveAsync(workspaceFolder, paths[i])) || paths[i];
            }
            const validatedProfile = await validateProfilePaths(profileName, paths, fsProvider, args, profile.env, profile.overrideName, profile.isAutoDetected, logService);
            if (validatedProfile) {
                validatedProfile.isAutoDetected = profile.isAutoDetected;
                validatedProfile.icon = icon;
                resultProfiles.push(validatedProfile);
            }
            else {
                logService === null || logService === void 0 ? void 0 : logService.trace('profile not validated', profileName, originalPaths);
            }
        }
        return resultProfiles;
    }
    async function initializeWindowsProfiles() {
        if (profileSources) {
            return;
        }
        profileSources = new Map();
        profileSources.set('Git Bash', {
            profileName: 'Git Bash',
            paths: [
                `${process.env['ProgramW6432']}\\Git\\bin\\bash.exe`,
                `${process.env['ProgramW6432']}\\Git\\usr\\bin\\bash.exe`,
                `${process.env['ProgramFiles']}\\Git\\bin\\bash.exe`,
                `${process.env['ProgramFiles']}\\Git\\usr\\bin\\bash.exe`,
                `${process.env['LocalAppData']}\\Programs\\Git\\bin\\bash.exe`
            ],
            args: ['--login']
        });
        profileSources.set('PowerShell', {
            profileName: 'PowerShell',
            paths: await getPowershellPaths(),
            icon: 'terminal-powershell'
        });
    }
    async function getPowershellPaths() {
        var e_1, _a;
        const paths = [];
        try {
            // Add all of the different kinds of PowerShells
            for (var _b = __asyncValues((0, powershell_1.enumeratePowerShellInstallations)()), _c; _c = await _b.next(), !_c.done;) {
                const pwshExe = _c.value;
                paths.push(pwshExe.exePath);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) await _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return paths;
    }
    async function getWslProfiles(wslPath, useWslProfiles) {
        const profiles = [];
        if (useWslProfiles) {
            const distroOutput = await new Promise((resolve, reject) => {
                // wsl.exe output is encoded in utf16le (ie. A -> 0x4100)
                cp.exec('wsl.exe -l -q', { encoding: 'utf16le' }, (err, stdout) => {
                    if (err) {
                        return reject('Problem occurred when getting wsl distros');
                    }
                    resolve(stdout);
                });
            });
            if (distroOutput) {
                const regex = new RegExp(/[\r?\n]/);
                const distroNames = distroOutput.split(regex).filter(t => t.trim().length > 0 && t !== '');
                for (let distroName of distroNames) {
                    // Skip empty lines
                    if (distroName === '') {
                        continue;
                    }
                    // docker-desktop and docker-desktop-data are treated as implementation details of
                    // Docker Desktop for Windows and therefore not exposed
                    if (distroName.startsWith('docker-desktop')) {
                        continue;
                    }
                    // Create the profile, adding the icon depending on the distro
                    const profile = {
                        profileName: `${distroName} (WSL)`,
                        path: wslPath,
                        args: [`-d`, `${distroName}`]
                    };
                    if (distroName.includes('Ubuntu')) {
                        profile.icon = 'terminal-ubuntu';
                    }
                    else if (distroName.includes('Debian')) {
                        profile.icon = 'terminal-debian';
                    }
                    else {
                        profile.icon = 'terminal-linux';
                    }
                    // Add the profile
                    profiles.push(profile);
                }
                return profiles;
            }
        }
        return [];
    }
    async function detectAvailableUnixProfiles(fsProvider, logService, configuredProfilesOnly, configProfiles, testPaths, variableResolver, workspaceFolder) {
        const detectedProfiles = new Map();
        // Add non-quick launch profiles
        if (!configuredProfilesOnly) {
            const contents = await fsProvider.readFile('/etc/shells', 'utf8');
            const profiles = testPaths || contents.split('\n').filter(e => e.trim().indexOf('#') !== 0 && e.trim().length > 0);
            const counts = new Map();
            for (const profile of profiles) {
                let profileName = (0, path_1.basename)(profile);
                let count = counts.get(profileName) || 0;
                count++;
                if (count > 1) {
                    profileName = `${profileName} (${count})`;
                }
                counts.set(profileName, count);
                detectedProfiles.set(profileName, { path: profile, isAutoDetected: true });
            }
        }
        applyConfigProfilesToMap(configProfiles, detectedProfiles);
        return await transformToTerminalProfiles(detectedProfiles.entries(), fsProvider, logService, variableResolver, workspaceFolder);
    }
    function applyConfigProfilesToMap(configProfiles, profilesMap) {
        if (!configProfiles) {
            return;
        }
        for (const [profileName, value] of Object.entries(configProfiles)) {
            if (value === null || (!('path' in value) && !('source' in value))) {
                profilesMap.delete(profileName);
            }
            else {
                profilesMap.set(profileName, value);
            }
        }
    }
    async function validateProfilePaths(profileName, potentialPaths, fsProvider, args, env, overrideName, isAutoDetected, logService) {
        if (potentialPaths.length === 0) {
            return Promise.resolve(undefined);
        }
        const path = potentialPaths.shift();
        if (path === '') {
            return validateProfilePaths(profileName, potentialPaths, fsProvider, args, env, overrideName, isAutoDetected);
        }
        const profile = { profileName, path, args, env, overrideName, isAutoDetected };
        // For non-absolute paths, check if it's available on $PATH
        if ((0, path_1.basename)(path) === path) {
            // The executable isn't an absolute path, try find it on the PATH
            const envPaths = process.env.PATH ? process.env.PATH.split(path_1.delimiter) : undefined;
            const executable = await (0, terminalEnvironment_1.findExecutable)(path, undefined, envPaths, undefined, fsProvider.existsFile);
            if (!executable) {
                return validateProfilePaths(profileName, potentialPaths, fsProvider, args);
            }
            return profile;
        }
        const result = await fsProvider.existsFile((0, path_1.normalize)(path));
        if (result) {
            return profile;
        }
        return validateProfilePaths(profileName, potentialPaths, fsProvider, args, env, overrideName, isAutoDetected);
    }
});
//# sourceMappingURL=terminalProfiles.js.map